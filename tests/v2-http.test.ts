import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createV2Handler} from '../src/lib/v2-http.ts';
import {createV2Provider,V2SpendLedger} from '../src/lib/v2-provider.ts';
import {runV2ControlledTurn} from '../src/lib/v2-controller.ts';
import {plainArtifactText} from '../src/lib/v2-display.ts';
import {verifyV2Draft} from '../src/lib/v2-verifier.ts';
import {createV2Toolbox} from '../src/lib/v2-safety.ts';
const packet=JSON.parse(readFileSync(new URL('../src/data/nvda-quarter-pair.json',import.meta.url),'utf8'));
const identity={session_id:'session-one',turn_id:'turn-one',revision:1};
const envelope={question:'Does operating profitability look durable?',history:[],identity};
const request=(body:unknown=envelope,origin='http://localhost:3005')=>new Request('http://localhost:3005/api/v2/research',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
function draft(kind='analysis'){return {answer_kind:kind,
 takeaway:{text:'Operating profitability improved; persistence remains unresolved.',finding_ids:['finding_1']},
 findings:[{id:'finding_1',text:'Operating margin is {{fact:NVDA:operating_margin:current}}.',fact_ids:['NVDA:operating_margin:current'],evidence:[{paragraph_id:'NVDA:p41',quote:'ramping into full production with racks running at partners'}]}],
 financial_rows:[{fact_id:'NVDA:operating_margin:current',implication:'Current profitability, not proof of persistence.',finding_ids:['finding_1']}],unanswered:['Future product economics remain unresolved.'],next_investigation:null};}
const events=async(response:Response)=>(await response.text()).trim().split('\n').map(line=>JSON.parse(line));
test('HTTP runs core checks and displays authoritative comparisons with matching turn identity',async()=>{
 const handler=createV2Handler({packet,configured:()=>true,provider:()=>async()=>({kind:'answer',draft:draft()})});
 const response=await handler(request());assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'no-store');
 const output=await events(response);assert.deepEqual(output.filter(e=>e.type==='stage').map(e=>e.stage),['preparing','researching','checking']);
 const result=output.at(-1).result;assert.deepEqual(result.identity,identity);assert.equal(result.artifact.rows[0].change.unit,'percentage_points');assert.equal(result.artifact.rows[0].prior.display,'65.6%');assert.equal(result.artifact.cutoff,packet.source_cutoff);assert.match(plainArtifactText(result.artifact),/profitability improved/);
});
test('HTTP blocks foreign origin, identity fields and sensitive input before dispatch',async()=>{
 let calls=0;const handler=createV2Handler({packet,configured:()=>true,provider:()=>{calls++;return async()=>({kind:'answer',draft:draft()});}});
 assert.equal((await handler(request(envelope,'https://foreign.example'))).status,403);
 assert.equal((await handler(request({...envelope,identity:{...identity,revision:0}}))).status,400);
 assert.equal((await handler(request({...envelope,question:'client name: Someone'}))).status,400);
 assert.equal((await handler(request({...envelope,evidence:'client-controlled source'}))).status,400);assert.equal(calls,0);
});
test('HTTP returns honest unavailable state without provider work',async()=>{
 let calls=0;const response=await createV2Handler({packet,configured:()=>false,provider:()=>{calls++;throw Error('must not call');}})(request());
 assert.equal(response.status,503);assert.deepEqual(await response.json(),{error_code:'unavailable'});assert.equal(calls,0);
});
test('HTTP accepts the actual same-origin Host when Next normalizes its internal URL',async()=>{
 const handler=createV2Handler({packet,configured:()=>false,provider:()=>{throw Error('must not call');}});
 const response=await handler(new Request('http://localhost:3005/api/v2/research',{method:'POST',headers:{Host:'127.0.0.1:3005',Origin:'http://127.0.0.1:3005','Content-Type':'application/json'},body:JSON.stringify(envelope)}));
 assert.equal(response.status,503);assert.deepEqual(await response.json(),{error_code:'unavailable'});
});
test('HTTP coverage answer and failed checks do not publish a replacement brief',async()=>{
 const outside=draft('out_of_scope');outside.takeaway.text='The frozen reports do not supply current stock prices or news.';outside.financial_rows=[];
 const response=await createV2Handler({packet,configured:()=>true,provider:()=>async()=>({kind:'answer',draft:outside})})(request());
 const result=(await events(response)).at(-1).result;assert.equal(result.status,'out_of_scope');assert.equal(result.artifact,undefined);assert.match(result.message,/current stock prices/);
 const invalid=draft();invalid.takeaway.finding_ids=['missing'];
 const failed=(await events(await createV2Handler({packet,configured:()=>true,provider:()=>async()=>({kind:'answer',draft:invalid})})(request()))).at(-1).result;
 assert.equal(failed.status,'check_failed');assert.equal(failed.artifact,undefined);
});
test('HTTP concurrency cap rejects overlap and releases its slot after completion',async()=>{
 let resolve!:(value:unknown)=>void;const handler=createV2Handler({packet,configured:()=>true,provider:()=>()=>new Promise(r=>{resolve=r;})});
 const first=await handler(request());assert.equal((await handler(request())).status,429);
 resolve({kind:'answer',draft:draft()});await events(first);
 const third=await handler(request());assert.equal(third.status,200);resolve({kind:'answer',draft:draft()});await events(third);
});
test('Responses adapter carries exact tool call IDs into synthesis and requires outcome classification',async()=>{
 const bodies:any[]=[];const provider=createV2Provider('fake-test-credential',{fetch:async(_url,init)=>{
  bodies.push(JSON.parse(String(init?.body)));return Response.json({status:'completed',usage:{input_tokens:100,output_tokens:100},output:bodies.length===1?[{type:'function_call',call_id:'call-real-id',name:'read_approved_evidence',arguments:JSON.stringify({period:'prior',paragraph_ids:null})}]:[{type:'message',content:[{type:'output_text',text:JSON.stringify(draft())}]}]});
 },ledger:new V2SpendLedger(3)});
 const result=await runV2ControlledTurn({question:envelope.question},packet,provider);assert.equal(result.status,'complete');assert.equal(bodies.length,2);assert.equal(bodies[0].store,false);assert.ok(bodies[0].text.format.schema.required.includes('answer_kind'));assert.equal(bodies[1].tool_choice,'none');assert.equal(bodies[1].input.at(-1).call_id,'call-real-id');assert.match(bodies[1].input.at(-1).output,/prior_p45/);
});
test('Responses adapter rejects exhausted spend budget before fetch',async()=>{
 let calls=0;const provider=createV2Provider('fake-test-credential',{ledger:new V2SpendLedger(0),fetch:async()=>{calls++;throw Error('must not call');}});
 const result=await runV2ControlledTurn({question:envelope.question},packet,provider);assert.equal(result.status,'failed');assert.equal(result.error_code,'spend_limit');assert.equal(calls,0);
});
test('Undeclared fact placeholders remain rejected with a precise, content-free diagnostic',()=>{
 const d=draft();d.findings[0].text+=' Earlier margin: {{fact:NVDA:operating_margin:prior_quarter}}.';
 const result=verifyV2Draft(d,createV2Toolbox(packet));assert.equal(result.status,'check_failed');assert.equal(result.drops[0].reason,'undeclared_fact_reference');assert.equal(result.takeaway,null);
 d.findings[0].fact_ids.push('NVDA:operating_margin:prior_quarter');assert.equal(verifyV2Draft(d,createV2Toolbox(packet)).status,'complete');
});
test('An incomplete provider response is a generation failure, never a source limitation',async()=>{
 const provider=createV2Provider('fake-test-credential',{fetch:async()=>Response.json({status:'incomplete',output:[],usage:{input_tokens:10,output_tokens:8192}})});
 const result=await runV2ControlledTurn({question:envelope.question},packet,provider);
 assert.equal(result.status,'failed');assert.equal(result.error_code,'provider_incomplete');
});
test('HTTP stream cancellation aborts in-flight provider work and releases concurrency',async()=>{
 let aborted=false;const diagnostics:any[]=[];
 const handler=createV2Handler({packet,configured:()=>true,onDiagnostics:data=>diagnostics.push(data),provider:()=>async(_input,signal)=>new Promise(()=>{signal.addEventListener('abort',()=>{aborted=true;},{once:true});})});
 const response=await handler(request());await response.body!.cancel();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(aborted,true);assert.equal(diagnostics[0].status,'stopped');
 const second=await handler(request());assert.equal(second.status,200);await second.body!.cancel();
});
