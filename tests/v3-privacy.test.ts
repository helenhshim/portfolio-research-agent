import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createV3Handler} from '../src/lib/v3-http.ts';
import {runV3ControlledTurn} from '../src/lib/v3-controller.ts';
import {createV3Provider} from '../src/lib/v3-provider.ts';
import {v3InputIssue} from '../src/lib/v3-input-policy.ts';
import {emptyV3Session,sortedV3Sessions,updateV3Session} from '../src/lib/v3-sessions.ts';
const packet=JSON.parse(readFileSync(new URL('../src/data/nvda-quarter-pair.json',import.meta.url),'utf8'));
const marker='SYNTHETIC-PRIVATE-MARKER-ONLY';
const identity={session_id:'privacy-fixture',turn_id:'turn',revision:1};
const post=(body:unknown,headers:Record<string,string>={})=>new Request('http://localhost:3006/api/v3/research',{method:'POST',headers:{Origin:'http://localhost:3006','Content-Type':'application/json',...headers},body:JSON.stringify(body)});
const finding={id:'finding_1',role:'supports',summary:'Profitability improved; persistence remains unresolved.',text:'Revenue grew {{fact:NVDA:revenue:yoy}}. Repeat demand remains unresolved.',fact_ids:['NVDA:revenue:yoy'],evidence:[]};
const draft={answer_kind:'analysis',findings:[finding],takeaway:{text:'Profitability improved; persistence remains unresolved.',finding_ids:['finding_1']},assessment:{text:'Repeat demand remains unresolved.',finding_ids:['finding_1']},financial_rows:[],unanswered:['Will demand persist?'],next_investigation:null};
test('Known sensitive patterns are blocked in both browser preflight and server question/history before provider creation',async()=>{
 const samples=['sk-proj-SYNTHETIC_ONLY_123456789','account number: 1234567890','123-45-6789','client name: Sample Person','sample@example.invalid','API_KEY=SYNTHETIC_ONLY','password: SYNTHETIC_ONLY','Bearer SYNTHETIC_TOKEN_12345','-----BEGIN PRIVATE KEY-----'];
 let dispatched=0,logs:any[]=[];
 const handler=createV3Handler({packet,configured:()=>true,provider:()=>{dispatched++;return async()=>({kind:'answer',draft});},onDiagnostics:d=>logs.push(d)});
 for(const text of samples)for(const history of [false,true]){
  const question=history?'Pressure-test NVIDIA profitability.':text,turns=history?[{role:'user',text}]:[];
  assert.equal(v3InputIssue(question,turns),'sensitive_input');
  const response=await handler(post({question,history:turns,identity}));
  assert.equal(response.status,400);assert.deepEqual(await response.json(),{error_code:'sensitive_input'});
 }
 assert.equal(dispatched,0);assert.equal(logs.length,0);
 assert.equal(v3InputIssue('Does NVIDIA profitability look durable?'),null);
});
test('Synthetic provider errors and malformed status/usage never reach responses or operational diagnostics',async()=>{
 const traces:any[]=[],logs:any[]=[];let outgoing:any;
 const provider=createV3Provider(marker,{fetch:async(url,init)=>{
  assert.equal(url,'https://api.openai.com/v1/responses');
  outgoing=JSON.parse(String(init?.body));assert.doesNotMatch(JSON.stringify(outgoing),new RegExp(marker));
  assert.equal((init?.headers as any).Authorization,`Bearer ${marker}`);
  assert.equal(outgoing.store,false);
  return Response.json({status:marker,usage:{input_tokens:marker,output_tokens:10},output:[]});
 },onTrace:d=>traces.push(d)});
 const handler=createV3Handler({packet,configured:()=>true,provider:()=>provider,onDiagnostics:d=>logs.push(d)});
 const response=await handler(post({question:'Pressure-test NVIDIA profitability.',identity}));
 const body=await response.text();assert.doesNotMatch(body,new RegExp(marker));assert.doesNotMatch(JSON.stringify([...logs,...traces]),new RegExp(marker));
 assert.equal(traces[0].status,'unknown');assert.equal(traces[0].usage,null);
 const failed=await runV3ControlledTurn({question:'Pressure-test profitability.'},packet,async()=>{throw new Error(marker);});
 assert.equal(failed.status,'failed');assert.doesNotMatch(JSON.stringify(failed),new RegExp(marker));
});
test('Diagnostic output excludes request text, raw identity and model-controlled rejected fact IDs',async()=>{
 const logs:any[]=[];
 const handler=createV3Handler({packet,configured:()=>true,provider:()=>async()=>({kind:'answer',draft:{...draft,financial_rows:[{fact_id:marker,implication:'A disputed row.',finding_ids:['finding_1']}]}}),onDiagnostics:d=>logs.push(d)});
 const response=await handler(post({question:`Public test question ${marker}`,identity:{...identity,session_id:marker}}));
 await response.text();assert.equal(logs.length,1);assert.doesNotMatch(JSON.stringify(logs),new RegExp(marker));
 assert.equal(logs[0].drops[0].kind,'financial_row');assert.match(logs[0].run_id,/^[a-f0-9]{64}$/);assert.equal(logs[0].identity,undefined);
});
test('Cross-origin, oversized and client-supplied source envelopes cannot reach the provider',async()=>{
 let calls=0;const handler=createV3Handler({packet,configured:()=>true,provider:()=>{calls++;return async()=>({kind:'answer',draft});}});
 for(const response of [await handler(post({question:'Pressure-test profitability.',identity},{Origin:'https://unrelated.invalid'})),await handler(post({question:'x'.repeat(25000),identity})),await handler(post({question:'Pressure-test profitability.',identity,source_context:{secret:marker}}))])assert.ok([400,403].includes(response.status));
 assert.equal(calls,0);
});
test('Forbidden tool actions stop without a follow-up call, and Stop aborts execution',async()=>{
 let calls=0;const result=await runV3ControlledTurn({question:'Pressure-test profitability.'},packet,async()=>{calls++;return {kind:'tools',calls:[{name:'fetch_url',arguments:{url:'https://unrelated.invalid'}}]};});
 assert.equal(result.status,'failed');assert.equal('error_code' in result&&result.error_code,'forbidden_tool');assert.equal(calls,1);
 const abort=new AbortController();let observedAbort=false;
 const work=runV3ControlledTurn({question:'Pressure-test profitability.'},packet,async(_i,signal)=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>{observedAbort=true;reject(Error(marker));},{once:true})),{signal:abort.signal});
 await new Promise(resolve=>setTimeout(resolve,10));abort.abort();const stopped=await work;
 assert.equal(stopped.status,'stopped');assert.equal(observedAbort,true);assert.doesNotMatch(JSON.stringify(stopped),new RegExp(marker));
});
test('Session summaries preserve ownership, sort by activity and do not mutate another session',()=>{
 const originals=[emptyV3Session('a',1),emptyV3Session('b',2)];
 const updated=updateV3Session(originals,'a',{title:'Profitability question',updatedAt:3,outcome:'Completed'});
 assert.equal(updated[1],originals[1]);assert.equal(originals[0].title,'New research');assert.deepEqual(sortedV3Sessions(updated).map(s=>s.id),['a','b']);
});
