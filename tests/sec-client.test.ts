import test from 'node:test';
import assert from 'node:assert/strict';
import {createSecClient,validateSecUrl} from '../src/lib/sec.ts';
const url='https://data.sec.gov/submissions/CIK0001045810.json';
const identity='TestResearch operator@example.com';
test('restricts scheme, hosts, paths, queries and credentials',()=>{
 for(const u of ['http://data.sec.gov/submissions/CIK0001045810.json','https://example.com/facts','https://data.sec.gov/other','https://user:pass@data.sec.gov/submissions/CIK0001045810.json',url+'?q=x'])assert.throws(()=>validateSecUrl(u));
 assert.equal(validateSecUrl(url),url);
});
test('sends identity on retries, honors Retry-After, paces and deduplicates',async()=>{
 let clock=0,calls=0;const waits:number[]=[];const starts:number[]=[];
 const client=createSecClient(identity,{now:()=>clock,sleep:async(ms:number)=>{waits.push(ms);clock+=ms;},fetch:async(_u:string,options:any)=>{assert.equal(options.headers['User-Agent'],identity);assert.equal(options.redirect,'error');starts.push(clock);calls++;return calls===1?new Response('',{status:429,headers:{'Retry-After':'2'}}):new Response('{}');}});
 const [a,b]=await Promise.all([client.get(url),client.get(url)]);assert.deepEqual(a,b);await client.get(url);
 assert.equal(calls,2);assert.equal(client.stats.deduplicated,1);assert.equal(client.stats.cache_hits,1);assert.ok(waits.includes(2000));assert.ok(starts[1]-starts[0]>=250);
});
test('denied response prevents further network requests',async()=>{
 let calls=0;const client=createSecClient(identity,{sleep:async()=>{},fetch:async()=>{calls++;return new Response('',{status:403});}});
 await assert.rejects(client.get(url),/denied/);await assert.rejects(client.get('https://data.sec.gov/submissions/CIK0000019617.json'),/blocked/);assert.equal(calls,1);
});
test('retries are bounded and excessive Retry-After is not bypassed',async()=>{
 let calls=0;const client=createSecClient(identity,{sleep:async()=>{},fetch:async()=>{calls++;return new Response('',{status:500});}});
 await assert.rejects(client.get(url),/bounded retries/);assert.equal(calls,3);
 const delayed=createSecClient(identity,{sleep:async()=>{},fetch:async()=>new Response('',{status:429,headers:{'Retry-After':'60'}})});
 await assert.rejects(delayed.get(url),/defer retrieval/);assert.equal(delayed.stats.requests,1);
});
