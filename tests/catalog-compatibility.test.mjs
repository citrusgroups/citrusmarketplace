import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {extractCatalogPart} from '../lib/catalog/extract.js';
import {prepareSource} from '../lib/catalog/source.js';
const previous=process.env.GEMINI_API_KEY;
process.env.GEMINI_API_KEY='test-only-key';
const part={type:'text',text:'Copy paper $5 USD / ream'};
const product={name:'Copy paper',sku:'P1',description:'500 sheets',isOffice:true,category:'paper-notebooks',price:5,currency:'USD',priceEvidence:'$5 USD / ream',imageUrl:'https://example.com/paper.jpg'};
const ok=(data={products:[product],complete:true,notes:''})=>new Response(JSON.stringify({candidates:[{content:{role:'model',parts:[{text:JSON.stringify(data)}]},finishReason:'STOP',index:0}],usageMetadata:{promptTokenCount:10,candidatesTokenCount:20,totalTokenCount:30}}),{headers:{'content-type':'application/json'}});
const failure=(code)=>new Response(JSON.stringify({error:{code,message:code===400?'Request contains an invalid argument.':'quota exceeded',status:code===400?'INVALID_ARGUMENT':'RESOURCE_EXHAUSTED'}}),{status:code,headers:{'content-type':'application/json'}});
test('structured request avoids maxItems',async()=>{
 await extractCatalogPart(part,{providerFetch:async(_,opts)=>{const body=JSON.parse(opts.body);assert.ok(body.generationConfig.responseJsonSchema);assert.ok(!JSON.stringify(body.generationConfig.responseJsonSchema).includes('maxItems'));return ok();}});
});
test('400 retries once without provider schema but keeps JSON mode and source',async()=>{
 let calls=0;
 const result=await extractCatalogPart(part,{providerFetch:async(_,opts)=>{const body=JSON.parse(opts.body);if(++calls===1)return failure(400);assert.equal(body.generationConfig.responseJsonSchema,undefined);assert.equal(body.generationConfig.responseMimeType,'application/json');assert.ok(JSON.stringify(body.contents).includes(part.text));return ok();}});
 assert.equal(calls,2);assert.equal(result.products[0].price,5);
});
test('invalid fallback output is rejected',async()=>{
 let calls=0;await assert.rejects(()=>extractCatalogPart(part,{providerFetch:async()=>++calls===1?failure(400):ok({products:[{name:'broken'}],complete:true,notes:''})}));assert.equal(calls,2);
});
test('quota errors do not trigger compatibility retry',async()=>{
 let calls=0;await assert.rejects(()=>extractCatalogPart(part,{providerFetch:async()=>{calls++;return failure(429);}}),/quota or rate limit/);assert.equal(calls,1);
});
test('two rejected requests show actionable error',async()=>{
 let calls=0;await assert.rejects(()=>extractCatalogPart(part,{providerFetch:async()=>{calls++;return failure(400);}}),/JSON compatibility retry/);assert.equal(calls,2);
});
test('incomplete fallback cannot silently save partial products',async()=>{
 let calls=0;await assert.rejects(()=>extractCatalogPart(part,{providerFetch:async()=>++calls===1?failure(400):ok({products:[product],complete:false,notes:''})}),/too dense/);
});
if(process.env.OFFICEDEPOT_FIXTURE)test('actual Office Depot workbook prepares ten segments containing 330 rows',async()=>{
 const source=await prepareSource({bytes:await readFile(process.env.OFFICEDEPOT_FIXTURE),name:'officedepot.xlsx',mime:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
 assert.equal(source.parts.length,10);
 assert.equal(source.parts.reduce((n,p)=>n+JSON.parse(p.text).rows.length,0),330);
});
test.after(()=>{if(previous===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=previous;});
