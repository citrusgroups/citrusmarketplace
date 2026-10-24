import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {emailOTP} from 'better-auth/plugins';
import {nextCookies} from 'better-auth/next-js';
import * as schema from '../auth-schema.ts';
import * as settings from '../lib/auth-settings.js';

test('canonical origin is normalized and callback configuration rejects malformed URLs',()=>{
 assert.equal(settings.authOrigin({BETTER_AUTH_URL:'https://products.example.com/'}),'https://products.example.com');
 assert.equal(settings.authOrigin({NEXT_PUBLIC_APP_URL:'http://localhost:3000'}),'http://localhost:3000');
 for(const value of ['products.example.com','https://example.com/api/auth','https://example.com?x=1','javascript:alert(1)'])assert.throws(()=>settings.authOrigin({BETTER_AUTH_URL:value}));
 assert.deepEqual(settings.trustedAuthOrigins({NODE_ENV:'production',BETTER_AUTH_URL:'https://products.example.com',AUTH_TRUSTED_ORIGINS:'https://www.products.example.com'}),['https://products.example.com','https://www.products.example.com']);
});
test('session return paths stay local and non-admins cannot use admin destinations',()=>{
 for(const value of ['https://evil.com','//evil.com','/\\evil.com','/%2f%2fevil.com','/login','/signup','/api/auth/sign-out'])assert.equal(settings.safeReturnPath(value),'/');
 assert.equal(settings.loginDestination({role:'admin'},null),'/admin');
 assert.equal(settings.loginDestination({role:'user'},'/admin/catalogs'),'/');
 assert.equal(settings.loginDestination({role:'user'},'/account/orders/123'),'/account/orders/123');
});
test('authentication retains password protections while normal session checks are not capped at 3 per ten minutes',()=>{
 assert.equal(settings.sessionPolicy.expiresIn,2592000);assert.equal(settings.sessionPolicy.updateAge,86400);
 assert.equal(settings.authRateLimit.customRules['/sign-in/email'].max,5);
 assert.ok(settings.authRateLimit.customRules['/get-session'].max>=60);
});
async function loadAuth(database){
 const context=vm.createContext({process:{env:{BETTER_AUTH_SECRET:'test-secret-value-with-more-than-32-characters',BETTER_AUTH_URL:'http://localhost:3000',GOOGLE_CLIENT_ID:'fixture.apps.googleusercontent.com',GOOGLE_CLIENT_SECRET:'fixture-secret'}},console});
 const dependencies={
 'better-auth':{betterAuth},'better-auth/adapters/drizzle':{drizzleAdapter},'better-auth/plugins':{emailOTP},'better-auth/next-js':{nextCookies},
 './db':{db:database},'../auth-schema':schema,'./auth-settings':{...settings,authOrigin:()=>settings.authOrigin({BETTER_AUTH_URL:'http://localhost:3000'}),trustedAuthOrigins:()=>['http://localhost:3000']},
 'nodemailer':{default:{createTransport:()=>({sendMail:async()=>({messageId:'local-fixture'})})}}
 };
 const mod=new vm.SourceTextModule(await readFile('lib/auth.js','utf8'),{context});
 await mod.link(async name=>{const d=dependencies[name];if(!d)throw new Error('Unexpected dependency '+name);return new vm.SyntheticModule(Object.keys(d),function(){for(const [key,value] of Object.entries(d))this.setExport(key,value);},{context});});await mod.evaluate();return mod.namespace.auth;
}
test('real Better Auth + Postgres-compatible sessions: 30-day cookie, repeated checks, renewal, Google callback, logout',async()=>{
 const pg=new PGlite();
 await pg.exec(`
 CREATE TABLE "user"(id text primary key,name text not null,email text not null unique,address text,email_verified boolean not null default false,image text,role text not null default 'user',created_at timestamp not null default now(),updated_at timestamp not null default now());
 CREATE TABLE "session"(id text primary key,expires_at timestamp not null,token text not null unique,created_at timestamp not null default now(),updated_at timestamp not null default now(),ip_address text,user_agent text,user_id text not null references "user"(id) on delete cascade);
 CREATE TABLE "account"(id text primary key,account_id text not null,provider_id text not null,user_id text not null references "user"(id) on delete cascade,access_token text,refresh_token text,id_token text,access_token_expires_at timestamp,refresh_token_expires_at timestamp,scope text,password text,created_at timestamp not null default now(),updated_at timestamp not null default now());
 CREATE TABLE "verification"(id text primary key,identifier text not null,value text not null,expires_at timestamp not null,created_at timestamp not null default now(),updated_at timestamp not null default now());
 `);
 try{
  const db=drizzle(pg,{schema}),auth=await loadAuth(db);
  await auth.api.signUpEmail({body:{email:'owner@example.com',name:'Owner',password:'Strong-test-password-123!'}});
  await pg.exec(`UPDATE "user" SET email_verified=true,role='admin'`);
  const request=(path,method='GET',body,cookie)=>new Request('http://localhost:3000/api/auth'+path,{method,headers:{origin:'http://localhost:3000','Content-Type':'application/json','x-forwarded-for':'203.0.113.24',...(cookie?{cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const signIn=await auth.handler(request('/sign-in/email','POST',{email:'owner@example.com',password:'Strong-test-password-123!',rememberMe:true}));
  assert.equal(signIn.status,200,await signIn.clone().text());
  const cookies=signIn.headers.getSetCookie();
  const sessionCookie=cookies.find(c=>c.startsWith('better-auth.session_token='));assert.ok(sessionCookie);assert.match(sessionCookie,/Max-Age=2592000/i);
  const cookie=cookies.map(c=>c.split(';')[0]).join('; ');
  for(let i=0;i<12;i++){
   const response=await auth.handler(request('/get-session','GET',null,cookie));assert.equal(response.status,200);assert.equal((await response.json()).user.role,'admin');
  }
  // Remove short-lived cache cookie to exercise the real database refresh path.
  const tokenOnly=sessionCookie.split(';')[0];
  await pg.exec(`UPDATE "session" SET updated_at=now()-interval '2 days',expires_at=now()+interval '1 day'`);
  const refreshed=await auth.handler(request('/get-session?disableCookieCache=true','GET',null,tokenOnly));assert.equal(refreshed.status,200);
  const [row]=(await pg.query('SELECT expires_at FROM "session"')).rows;
  assert.ok(new Date(row.expires_at).getTime()>Date.now()+29*86400000,'active session renewed near 30 days');
  const oauth=await auth.handler(request('/sign-in/social','POST',{provider:'google',callbackURL:'/auth/continue',disableRedirect:true}));
  assert.equal(oauth.status,200,await oauth.clone().text());const oauthData=await oauth.json();assert.equal(new URL(oauthData.url).searchParams.get('redirect_uri'),'http://localhost:3000/api/auth/callback/google');
  const logout=await auth.handler(request('/sign-out','POST',{},tokenOnly));assert.equal(logout.status,200);assert.equal((await pg.query('SELECT count(*)::int as count FROM "session"')).rows[0].count,0);
 }finally{await pg.close();}
});
test('proxy retains intended admin path, accepts secure cookies and does not loop stale cookies through login',async()=>{
 const {NextRequest,NextResponse}=await import('next/server.js');const {getSessionCookie}=await import('better-auth/cookies');
 const context=vm.createContext({URL,process:{env:{}}});
 const deps={'next/server':{NextResponse},'better-auth/cookies':{getSessionCookie},'./lib/auth-settings':{authOrigin:()=>undefined}};
 const mod=new vm.SourceTextModule(await readFile('proxy.js','utf8'),{context});await mod.link(async name=>{const d=deps[name];return new vm.SyntheticModule(Object.keys(d),function(){for(const [key,value]of Object.entries(d))this.setExport(key,value);},{context});});await mod.evaluate();
 const proxy=mod.namespace.proxy;
 const blocked=proxy(new NextRequest('http://localhost:3000/admin/catalogs'));assert.equal(blocked.status,307);const url=new URL(blocked.headers.get('location'));assert.equal(url.pathname,'/login');assert.equal(url.searchParams.get('callbackURL'),'/admin/catalogs');
 for(const path of ['/login','/checkout/success','/services']){const res=proxy(new NextRequest('http://localhost:3000'+path,{headers:{cookie:'better-auth.session_token=expired'}}));assert.equal(res.headers.get('location'),null);}
 assert.equal(proxy(new NextRequest('http://localhost:3000/admin',{headers:{cookie:'__Secure-better-auth.session_token=token'}})).headers.get('location'),null);
});
test('checkout distinguishes confirmed logout from network/server/rate-limit failures',async()=>{
 const {readClientSession}=await import('../lib/client-session.js');
 assert.equal((await readClientSession(async()=>new Response('{}',{status:401}))).status,'signed-out');
 for(const status of [429,500,503])assert.equal((await readClientSession(async()=>new Response('{}',{status}))).status,'unavailable');
 assert.equal((await readClientSession(async()=>{throw new Error('offline')})).status,'unavailable');
 assert.equal((await readClientSession(async()=>Response.json({user:{id:'owner'}}))).status,'signed-in');
});
test('admin API wrapper rejects visitors/non-admin users and bypasses role cache',async()=>{
 for(const [user,expected] of [[null,401],[{id:'u',role:'user'},403],[{id:'a',role:'admin'},200]]){
  let options,called=false;
  const context=vm.createContext({Response});const source=await readFile('lib/admin-access.js','utf8');
  const mod=new vm.SourceTextModule(source,{context});await mod.link(async()=>new vm.SyntheticModule(['auth'],function(){this.setExport('auth',{api:{getSession:async opts=>{options=opts;return user?{user}:null;}}});},{context}));await mod.evaluate();
  const handler=mod.namespace.withAdmin(async()=>{called=true;return Response.json({ok:true});});
  const response=await handler(new Request('https://products.example.com/api/admin/orders'));
  assert.equal(response.status,expected);assert.equal(called,expected===200);assert.equal(options.query.disableCookieCache,true);
 }
});
