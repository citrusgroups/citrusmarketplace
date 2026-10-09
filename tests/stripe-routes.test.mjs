import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
async function route(path,{order,user={id:'u1'},event,missingKey=false}={}) {
 const updates=[]; const calls=[]; const context=vm.createContext({Response,URL,console:{error(){}},process:{env:missingKey?{}:{STRIPE_SECRET_KEY:'test',STRIPE_WEBHOOK_SECRET:'test'}}});
 const stripe={checkout:{sessions:{create:async(args)=>{calls.push(args);return {id:'cs_test',url:'https://checkout.stripe.com/test'};},retrieve:async()=>({status:'open',url:'https://checkout.stripe.com/existing'})}},webhooks:{constructEvent:()=>{if(event instanceof Error)throw event;return event;}}};
 const deps={ '@/lib/stripe':{getStripe:()=>stripe,getAppUrl:()=> 'https://citrus.example'}, '@/lib/auth':{auth:{api:{getSession:async()=>user?{user}:null}}}, '@/lib/db':{db:{select:()=>({from:()=>({where:async()=>order?[order]:[]})}),update:()=>({set:(v)=>({where:async()=>updates.push(v)})})}}, '@/db/schema':{orders:{id:'id',userId:'userId',paymentStatus:'paymentStatus'}},'drizzle-orm':{eq:(...x)=>x,and:(...x)=>x,ne:(...x)=>x}};
 const mod=new vm.SourceTextModule(await readFile(path,'utf8'),{context});
 await mod.link(async name=>{const dep=deps[name];return new vm.SyntheticModule(Object.keys(dep),function(){for(const [k,v] of Object.entries(dep))this.setExport(k,v);},{context});});await mod.evaluate();return {POST:mod.namespace.POST,updates,calls};
}
const order={id:'o1',userId:'u1',paymentMethod:'stripe',paymentStatus:'pending',totalPrice:90};
const req=()=>new Request('https://citrus.example/api/stripe/checkout',{method:'POST',body:JSON.stringify({orderId:'o1',items:[{price:1}]})});
test('checkout uses saved discounted total and leaves payment pending',async()=>{const r=await route('app/api/stripe/checkout/route.js',{order});assert.equal((await r.POST(req())).status,200);assert.equal(r.calls[0].line_items[0].price_data.unit_amount,9000);assert.match(r.calls[0].success_url,/\/checkout\/success/);assert.equal(r.updates[0].paymentStatus,'pending');});
test('checkout rejects unauthenticated request',async()=>{const r=await route('app/api/stripe/checkout/route.js',{order,user:null});assert.equal((await r.POST(req())).status,401);assert.equal(r.calls.length,0);});
test('checkout rejects missing or already paid order',async()=>{for(const o of [null,{...order,paymentStatus:'paid'}]){const r=await route('app/api/stripe/checkout/route.js',{order:o});assert.ok([404,409].includes((await r.POST(req())).status));assert.equal(r.calls.length,0);}});
test('checkout reuses open session',async()=>{const r=await route('app/api/stripe/checkout/route.js',{order:{...order,stripeSessionId:'cs_old'}});assert.equal((await (await r.POST(req())).json()).url,'https://checkout.stripe.com/existing');assert.equal(r.calls.length,0);});
const event=(type,extra={})=>({type,data:{object:{id:'cs_test',metadata:{orderId:'o1'},payment_status:'paid',currency:'usd',amount_total:9000,...extra}}});
test('webhook only marks verified paid matching amounts',async()=>{for(const [extra,status,count] of [[{},200,1],[{payment_status:'unpaid'},200,0],[{amount_total:100},400,0]]){const r=await route('app/api/stripe/webhook/route.js',{order,event:event('checkout.session.completed',extra)});assert.equal((await r.POST(req())).status,status);assert.equal(r.updates.length,count);if(count)assert.equal(r.updates[0].paymentStatus,'paid');}});
test('webhook rejects bad signature and missing configuration',async()=>{for(const options of [{event:new Error('bad')},{missingKey:true}]){const r=await route('app/api/stripe/webhook/route.js',{order,...options});assert.ok([400,503].includes((await r.POST(req())).status));assert.equal(r.updates.length,0);}});
test('old expired session cannot overwrite a newer session',async()=>{const r=await route('app/api/stripe/webhook/route.js',{order:{...order,stripeSessionId:'new'},event:event('checkout.session.expired')});assert.equal((await r.POST(req())).status,200);assert.equal(r.updates.length,0);});
