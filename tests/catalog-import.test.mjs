import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {eq} from 'drizzle-orm';
import {PDFDocument} from 'pdf-lib';
import ExcelJS from 'exceljs';
import {normalizeItem,validatePublication} from '../lib/catalog/normalize.js';
import {publicAddress,parsePublicUrl} from '../lib/catalog/safe-fetch.js';
import {prepareSource,discoverCatalogs} from '../lib/catalog/source.js';
import {persistProducts} from '../lib/catalog/persist.js';
import {products,productImages} from '../db/schema.js';
const product={name:'Copy Paper 500 sheets',sku:'OEX-101',isOffice:true,category:'paper-notebooks',price:4.99,currency:'USD',description:'500 sheets',priceEvidence:'$4.99 / ream',imageUrl:'https://example.com/paper.jpg'};
test('office extraction preserves cents, defaults stock to zero and never publishes unknown prices',()=>{
 const p=normalizeItem(product,'Supplier',true);assert.equal(p.price,4.99);assert.equal(p.stock,0);assert.equal(p.isPublished,true);
 for(const extra of [{price:null},{currency:'EUR'},{imageUrl:null},{priceEvidence:null}])assert.equal(normalizeItem({...product,...extra},'Supplier',true).isPublished,false);
 assert.equal(normalizeItem({...product,isOffice:false},'Supplier',true),null);
});
test('deduplication uses supplier plus SKU and manual selling prices cannot be overwritten',()=>{
 assert.equal(normalizeItem(product,' OEX ',true).catalogKey,normalizeItem({...product,name:'Renamed',price:9.99},'oex',true).catalogKey);
 assert.notEqual(normalizeItem(product,'Other',true).catalogKey,normalizeItem(product,'oex',true).catalogKey);
});
test('publication requires a positive price, office category and image',()=>{
 assert.throws(()=>validatePublication({basePrice:0,categoryId:'paper-notebooks'},product.imageUrl));
 assert.throws(()=>validatePublication({basePrice:4.99,categoryId:'gaming'},product.imageUrl));
 assert.throws(()=>validatePublication({basePrice:4.99,categoryId:'paper-notebooks'},null));
 assert.doesNotThrow(()=>validatePublication({basePrice:4.99,categoryId:'paper-notebooks'},product.imageUrl));
});
test('private addresses, metadata services and unsupported schemes are blocked',()=>{
 for(const ip of ['127.0.0.1','10.0.0.1','192.168.0.1','169.254.169.254','::1','::ffff:127.0.0.1','fc00::1','0.0.0.0'])assert.equal(publicAddress(ip),false,ip);
 for(const url of ['file:///etc/passwd','http://localhost/a','http://169.254.169.254/','http://user:pass@example.com','https://example.com:5432'])assert.throws(()=>parsePublicUrl(url));
 assert.equal(parsePublicUrl('https://www.oexusa.com/catalogs').hostname,'www.oexusa.com');
});
test('OEX catalog index discovers all supplied ActivePoint catalogs, never creates products from index',async()=>{
 const html='<html><body><a href="https://www.activepoint.com/OEXSUPPLY26_sl_spaa1244baj/book.html">Supply Guide</a><a href="https://www.activepoint.com/OEXWE26_sl_spaa1244baj/book.html">Workplace Essentials</a><a href="/guide.pdf">PDF guide</a></body></html>';
 const p=await prepareSource({bytes:Buffer.from(html),mime:'text/html',url:'https://www.oexusa.com/catalogs'});assert.equal(p.links.length,3);assert.equal(p.parts.length,0);
 assert.equal(discoverCatalogs(html,'https://www.oexusa.com/catalogs')[2].url,'https://www.oexusa.com/guide.pdf');
});
test('PDF is split into independently resumable pages without silent page truncation',async()=>{
 const doc=await PDFDocument.create();doc.addPage();doc.addPage();doc.addPage();
 const p=await prepareSource({bytes:Buffer.from(await doc.save()),mime:'application/pdf',name:'guide.pdf'});
 assert.equal(p.parts.length,3);assert.equal(p.parts[2].page,3);assert.equal((await PDFDocument.load(Buffer.from(p.parts[0].base64,'base64'))).getPageCount(),1);
});
test('CSV and XLSX preserve supplier values and discover actual image URLs',async()=>{
 const csv=await prepareSource({bytes:Buffer.from('sku,name,price,image\nP1,Paper,4.99,https://example.com/paper.jpg'),name:'test.csv'});assert.match(csv.parts[0].text,/4.99/);assert.equal(csv.imageCandidates.length,1);
 const wb=new ExcelJS.Workbook();const sheet=wb.addWorksheet('Products');sheet.addRow(['SKU','Name','Price']);sheet.addRow(['P1','Paper',4.99]);const p=await prepareSource({bytes:Buffer.from(await wb.xlsx.writeBuffer()),name:'test.xlsx'});assert.match(p.parts[0].text,/4.99/);
});
test('unsupported files are rejected and blocked flipbooks explain how to import',async()=>{
 await assert.rejects(()=>prepareSource({bytes:Buffer.from('no'),mime:'application/octet-stream',name:'test.exe'}),/Supported files/);
 const p=await prepareSource({bytes:Buffer.from('<html><body></body></html>'),mime:'text/html',url:'https://www.activepoint.com/book.html'});assert.equal(p.parts.length,0);assert.match(p.message,/Download PDF/);
});
test('Postgres migration and real product transaction: decimal values, duplicates, drafts, cleanup and order history',async()=>{
 const pg=new PGlite();
 await pg.exec(`CREATE ROLE anon; CREATE ROLE authenticated;
 CREATE TABLE products(id text primary key,name text not null,description text,base_price integer not null,old_price integer,discount_percent integer,category_id text,rating_count integer default 0,stock integer default 0,has_variants boolean default false,badge text,created_at timestamp default now(),is_flash_sale boolean default false,is_best_selling boolean default false,is_featured boolean default false);
 CREATE TABLE product_variants(id text primary key,price integer);
 CREATE TABLE order_items(id text primary key,price integer);
 CREATE TABLE orders(id text primary key,subtotal integer,discount integer,total_price integer);
 CREATE TABLE categories(id text primary key,name text not null,slug text not null,icon text);
 CREATE TABLE product_images(id text primary key,product_id text references products(id) on delete cascade,variant_id text,image_url text not null,color text,is_primary boolean default false);
 CREATE TABLE hero_banners(id text primary key,title text,heading text,button_text text,button_link text,image text,sort_order integer,is_active boolean);
 INSERT INTO products(id,name,base_price,category_id) VALUES('old-phone','iPhone',900,'phones');
 INSERT INTO orders VALUES('history',900,0,900);
 INSERT INTO hero_banners VALUES('old-iphone','iPhone','Old phone','Shop','/products','/iphone.png',0,true);`);
 const migration=await readFile('database/01-citrus-products.sql','utf8');await pg.exec(migration);await pg.exec(migration);
 const db=drizzle(pg),job={supplier:'OEX',autoPublish:true,imageCandidates:[product.imageUrl]};
 const r=await db.transaction(tx=>persistProducts(tx,job,{page:1},{products:[{...product},{...product,sku:'DRAFT',price:null,imageUrl:null}],notes:''}));
 assert.equal(r.added,2);assert.equal(r.review,1);
 let list=await db.select().from(products);const saved=list.find(p=>p.catalogSku==='OEX-101');assert.equal(saved.basePrice,4.99);assert.equal(saved.stock,0);assert.equal(saved.isPublished,true);
 await db.update(products).set({basePrice:12.49}).where(eq(products.id,saved.id));
 const again=await db.transaction(tx=>persistProducts(tx,job,{page:1},{products:[{...product,price:1.25}],notes:''}));assert.equal(again.duplicates,1);assert.equal((await db.select().from(products).where(eq(products.id,saved.id)))[0].basePrice,12.49);
 assert.equal((await db.select().from(productImages)).length,1);
 await pg.exec(await readFile('database/02-office-products-only.sql','utf8'));list=await db.select().from(products);assert.equal(list.find(p=>p.id==='old-phone').isPublished,false);assert.equal(list.find(p=>p.id===saved.id).isPublished,true);
 assert.equal((await pg.query('select * from orders')).rows.length,1);await pg.close();
});

// The real SDK serialization/schema path is exercised with a simulated provider response; no external AI call.
test('Gemini SDK request accepts PDF input and returns validated structured products',async()=>{
 const {extractCatalogPart}=await import('../lib/catalog/extract.js');
 const previous=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='local-test-key';let captured;
 try{
 const result=await extractCatalogPart({type:'file',mime:'application/pdf',base64:Buffer.from('%PDF-test').toString('base64')},{providerFetch:async(url,options)=>{
 captured={url:String(url),body:JSON.parse(options.body)};
 return new Response(JSON.stringify({candidates:[{content:{role:'model',parts:[{text:JSON.stringify({products:[product],complete:true,notes:''})}]},finishReason:'STOP',index:0}],usageMetadata:{promptTokenCount:10,candidatesTokenCount:20,totalTokenCount:30}}),{headers:{'Content-Type':'application/json'}});
 }});
 assert.equal(result.products[0].price,4.99);assert.match(captured.url,/gemini-3.5-flash-lite/);assert.ok(captured.body.contents[0].parts.some(p=>p.inlineData?.mimeType==='application/pdf'));
 }finally{if(previous===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=previous;}
});
