import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createV2Handler} from '../src/lib/v2-http.ts';
import {createV2Provider,V2SpendLedger,type V2Trace} from '../src/lib/v2-provider.ts';
import {runV2ControlledTurn} from '../src/lib/v2-controller.ts';
import {plainArtifactText,V2_RESEARCH_PROTOCOL} from '../src/lib/v2-display.ts';
import {verifyV2Draft} from '../src/lib/v2-verifier.ts';
import {createV2Toolbox} from '../src/lib/v2-safety.ts';
import {V2PolicyError} from '../src/lib/v2-safety.ts';
import {Ajv} from 'ajv';
const packet=JSON.parse(readFileSync(new URL('../src/data/nvda-quarter-pair.json',import.meta.url),'utf8'));
const identity={session_id:'session-one',turn_id:'turn-one',revision:1};
const envelope={question:'Does operating profitability look durable?',history:[],identity};
const request=(body:unknown=envelope,origin='http://localhost:3005')=>new Request('http://localhost:3005/api/v2/research',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
function draft(kind='analysis'){return {answer_kind:kind,
 takeaway:{text:'Operating profitability improved; persistence remains unresolved.',finding_ids:['finding_1']},
 findings:[{id:'finding_1',text:'Operating margin is {{fact:NVDA:operating_margin:current}}.',fact_ids:['NVDA:operating_margin:current'],evidence:[{paragraph_id:'NVDA:p41',quote:'ramping into full production with racks running at partners'}]}],
 financial_rows:[{fact_id:'NVDA:operating_margin:current',implication:'Current profitability, not proof of persistence.',finding_ids:['finding_1']}],unanswered:['Future product economics remain unresolved.'],next_investigation:null};}
const events=async(response:Response)=>(await response.text()).trim().split('\n').map(line=>JSON.parse(line));
test('An older loaded frontend completes after a server upgrade without seeing new event types or stages',async()=>{
 for(const protocol of [undefined,'future-unsupported-version']){
  let calls=0;const diagnostics:any[]=[];
  const handler=createV2Handler({packet,configured:()=>true,onDiagnostics:data=>diagnostics.push(data),provider:()=>async(_input,_signal,hooks)=>{
   calls++;hooks?.onFinding(draft().findings[0]);hooks?.onFindingsComplete?.();
   if(calls===1)throw new V2PolicyError('provider_whitespace_loop');return {kind:'answer',draft:draft()};
  }});
  const incoming=request();if(protocol)incoming.headers.set('X-Research-Protocol',protocol);
  const response=await handler(incoming),output=await events(response);
  assert.equal(response.headers.get('X-Research-Protocol'),'result-v1');
  // Reproduce the old shipped consumer: every non-stage event MUST contain
  // result.identity. A finding event would throw here at time-to-first-finding.
  const oldStageLabels:Record<string,string>={preparing:'Preparing',researching:'Generating',investigating:'Inspecting',checking:'Checking',recovering:'Retrying'};
  let completed=0,lastArtifact:any;
  assert.doesNotThrow(()=>{for(const event of output){
   const eventIdentity=event.type==='stage'?event.identity:event.result.identity;
   assert.deepEqual(eventIdentity,identity);
   if(event.type==='stage'){assert.equal(typeof oldStageLabels[event.stage],'string');continue;}
   completed++;assert.equal(event.result.status,'complete');lastArtifact=event.result.artifact;
  }});
  assert.equal(completed,1);assert.equal(calls,2);assert.match(plainArtifactText(lastArtifact),/profitability improved/);
  assert.equal(diagnostics[0].verified_findings_published,0);assert.equal(diagnostics[0].first_verified_finding_ms,null);
 }
});
test('The exact findings protocol opt-in receives checked objects, resets and real new stages',async()=>{
 let calls=0;const handler=createV2Handler({packet,configured:()=>true,provider:()=>async(_input,_signal,hooks)=>{
  calls++;hooks?.onFinding(draft().findings[0]);hooks?.onFindingsComplete?.();
  if(calls===1)throw new V2PolicyError('provider_whitespace_loop');return {kind:'answer',draft:draft()};
 }});
 const incoming=request();incoming.headers.set('X-Research-Protocol',V2_RESEARCH_PROTOCOL);
 const response=await handler(incoming),output=await events(response);
 assert.equal(response.headers.get('X-Research-Protocol'),V2_RESEARCH_PROTOCOL);
 assert.deepEqual(output.filter(e=>['finding','findings_reset'].includes(e.type)).map(e=>e.type),['finding','findings_reset','finding']);
 assert.equal(output.filter(e=>e.type==='stage'&&e.stage==='developing').length,2);
 assert.equal(output.filter(e=>e.type==='stage'&&e.stage==='synthesizing').length,2);
 for(const event of output)assert.deepEqual(event.type==='result'?event.result.identity:event.identity,identity);
 assert.equal(output.at(-1).result.status,'complete');assert.equal(calls,2);
});
test('HTTP runs core checks and displays authoritative comparisons with matching turn identity',async()=>{
 const handler=createV2Handler({packet,configured:()=>true,provider:()=>async()=>({kind:'answer',draft:draft()})});
 const response=await handler(request());assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'no-store');
 const output=await events(response);assert.deepEqual(output.filter(e=>e.type==='stage').map(e=>e.stage),['preparing','researching','checking']);
 const times=output.filter(e=>e.type==='stage').map(e=>e.elapsed_ms);
 assert.ok(times.every((time,i)=>Number.isFinite(time)&&time>=0&&(i===0||time>=times[i-1])));
 assert.ok(output.at(-1).result.run.elapsed_ms>=times.at(-1)!);
 assert.equal(output.at(-1).result.run.provider_calls,1);
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
 const bodies:any[]=[],traces:V2Trace[]=[];const provider=createV2Provider('fake-test-credential',{fetch:async(_url,init)=>{
  bodies.push(JSON.parse(String(init?.body)));return Response.json({status:'completed',usage:{input_tokens:100,output_tokens:100},output:bodies.length===1?[{type:'function_call',call_id:'call-real-id',name:'read_approved_evidence',arguments:JSON.stringify({period:'prior',paragraph_ids:null})}]:[{type:'message',content:[{type:'output_text',text:JSON.stringify(draft())}]}]},{headers:{'x-request-id':'req_public_fixture'}});
 },ledger:new V2SpendLedger(3),onTrace:trace=>traces.push(trace)});
 const result=await runV2ControlledTurn({question:envelope.question},packet,provider);assert.equal(result.status,'complete');assert.equal(bodies.length,2);assert.equal(bodies[0].store,false);assert.ok(bodies[0].text.format.schema.required.includes('answer_kind'));assert.equal(bodies[1].tool_choice,'none');assert.equal(bodies[1].input.at(-1).call_id,'call-real-id');assert.match(bodies[1].input.at(-1).output,/prior_p45/);
 const schema=bodies[0].text.format.schema,ids=['finding_1','finding_2','finding_3'];
 assert.deepEqual(schema.properties.takeaway.properties.finding_ids.items.enum,ids);
 assert.deepEqual(schema.properties.financial_rows.items.properties.finding_ids.items.enum,ids);
 assert.deepEqual(schema.properties.next_investigation.anyOf[1].properties.finding_ids.items.enum,ids);
 assert.ok(schema.properties.findings.items.properties.fact_ids.items.enum.includes('NVDA:operating_margin:current'));
 assert.ok(!schema.properties.findings.items.properties.fact_ids.items.enum.includes('operating_margin'));
 assert.ok(schema.properties.next_investigation.anyOf[1].properties.metric_ids.items.enum.includes('operating_margin'));
 assert.equal(schema.properties.findings.items.properties.text.maxLength,1200);
 assert.equal(schema.properties.findings.items.properties.evidence.items.properties.quote.maxLength,400);
 const validates=new Ajv({strict:false}).compile(schema);
 assert.equal(validates(draft()),true,JSON.stringify(validates.errors));
 assert.equal(traces[0].schema_version,'v2-brief-schema-5');assert.match(traces[0].schema_hash,/^[a-f0-9]{64}$/);
 assert.equal(traces[0].request_id,'req_public_fixture');assert.equal(traces[0].http_status,200);assert.equal(typeof traces[0].response_received_ms,'number');assert.equal(typeof traces[0].body_read_ms,'number');
 assert.equal(bodies[0].stream,true);
 const prior=JSON.parse(bodies[1].input.at(-1).output);
 assert.deepEqual(prior.paragraphs,[]);assert.ok(prior.paragraph_ids_in_source_context.includes('NVDA:prior_p45'));
 const initial=JSON.parse(bodies[0].input[0].content).source_context;
 assert.equal(bodies[0].text.verbosity,'low');assert.equal(bodies[0].max_output_tokens,3072);
 assert.ok(bodies[0].input[0].content.indexOf('source_context')<bodies[0].input[0].content.indexOf('request'));
 assert.equal(initial.paragraphs.length,packet.release.paragraphs.length);
 assert.match(initial.paragraphs.find((p:any)=>p.id==='NVDA:prior_p45').text,/./);
 assert.ok(bodies[1].input.at(-1).output.length<JSON.stringify(initial.paragraphs.filter((p:any)=>p.source_period==='prior')).length/4);
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

function sse(events:unknown[]){
 const encoded=new TextEncoder().encode(events.map(event=>`data: ${JSON.stringify(event)}\r\n\r\n`).join(''));
 // Deliberately split framing, UTF-8 and JSON across network chunks.
 return new Response(new ReadableStream({start(controller){for(let i=0;i<encoded.length;i+=7)controller.enqueue(encoded.slice(i,i+7));controller.close();}}),{headers:{'content-type':'text/event-stream','x-request-id':'req_stream_fixture'}});
}
test('Provider SSE publishes only the completed draft, measures first text and preserves checks',async()=>{
 const traces:V2Trace[]=[],drafts:unknown[]=[],progress:unknown[]=[];
 const provider=createV2Provider('fake-test-credential',{onProgress:p=>progress.push(p),onDraft:d=>drafts.push(d),onTrace:t=>traces.push(t),fetch:async()=>sse([
  {type:'response.created',response:{status:'in_progress'}},
  {type:'response.output_text.delta',delta:'unverified draft fragment ·'},
  {type:'response.completed',response:{status:'completed',usage:{input_tokens:100,output_tokens:200,output_tokens_details:{reasoning_tokens:40}},output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(draft())}]}]}}
 ])});
 const result=await runV2ControlledTurn({question:envelope.question},packet,provider);
 assert.equal(result.status,'complete');assert.deepEqual(drafts,[draft()]);
 assert.equal(typeof traces[0].first_event_ms,'number');assert.equal(typeof traces[0].first_text_ms,'number');
 assert.equal(traces[0].output_chars,'unverified draft fragment ·'.length);assert.equal(traces[0].usage?.reasoning_tokens,40);
 assert.equal(traces[0].stream?.terminal_event,'response.completed');assert.equal(traces[0].stream?.failure,null);
 assert.deepEqual((progress as any[]).map(p=>p.phase),['request_started','response_received','first_text']);
 assert.ok((progress as any[]).every(p=>p.provider_call===1&&p.elapsed_ms>=0));
 assert.doesNotMatch(JSON.stringify(progress),/unverified draft fragment/);
 assert.doesNotMatch(JSON.stringify(traces),/unverified draft fragment/);
});
test('Diagnostics separate two model calls from local tool and verification time',async()=>{
 const timings:any[]=[];let call=0;
 const result=await runV2ControlledTurn({question:envelope.question},packet,async()=>{
  await new Promise(resolve=>setTimeout(resolve,10));
  return ++call===1?{kind:'tools',calls:[{name:'get_checked_metrics',arguments:{metric_ids:['operating_margin']}}]}:{kind:'answer',draft:draft()};
 },{onTiming:t=>timings.push(t)});
 assert.equal(result.status,'complete');assert.deepEqual(timings.map(t=>t.step),['preparing','provider','tools','provider','checking']);
 assert.deepEqual(timings.filter(t=>t.step==='provider').map(t=>[t.provider_call,t.result_kind]),[[1,'tools'],[2,'answer']]);
 assert.ok(timings.every(t=>Number.isFinite(t.elapsed_ms)&&t.elapsed_ms>=0));assert.deepEqual(timings.find(t=>t.step==='tools').tool_names,['get_checked_metrics']);
 assert.doesNotMatch(JSON.stringify(timings),/Operating margin is|fact:/);
});
test('Incomplete text is opt-in debug data and never a published answer',async()=>{
 const unfinished:string[]=[];let drafts=0;
 const provider=createV2Provider('fake-test-credential',{onDraft:()=>drafts++,onIncompleteText:text=>unfinished.push(text),fetch:async()=>sse([
  {type:'response.incomplete',response:{status:'incomplete',incomplete_details:{reason:'max_output_tokens'},output:[{type:'message',content:[{type:'output_text',text:'unfinished fixture text'}]}]}}
 ])});
 const result=await runV2ControlledTurn({question:envelope.question},packet,provider);
 assert.equal(result.status,'failed');assert.equal(result.error_code,'provider_incomplete');assert.equal(drafts,0);assert.deepEqual(unfinished,['unfinished fixture text']);
});
test('A detected whitespace loop gets one formatting retry without publishing partial text',async()=>{
 const bodies:any[]=[],traces:V2Trace[]=[],drafts:unknown[]=[],stages:string[]=[];
 const provider=createV2Provider('fake-test-credential',{onTrace:t=>traces.push(t),onDraft:d=>drafts.push(d),fetch:async(_url,init)=>{
  bodies.push(JSON.parse(String(init?.body)));
  return bodies.length===1?sse([{type:'response.output_text.delta',delta:'{"unfinished":'} ,{type:'response.output_text.delta',delta:' '.repeat(513)}]):sse([{type:'response.completed',response:{status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(draft())}]}]}}]);
 }});
 const result=await runV2ControlledTurn({question:envelope.question},packet,provider,{onStage:s=>stages.push(s)});
 assert.equal(result.status,'complete');assert.equal(result.counts.provider_calls,2);assert.equal(result.counts.tool_calls,0);
 assert.deepEqual(drafts,[draft()]);assert.deepEqual(stages,['preparing','researching','recovering','checking']);
 assert.equal(traces[0].stream?.failure,'output_whitespace_loop');assert.equal(bodies[1].tool_choice,'none');
 const retry=JSON.parse(bodies[1].input[0].content);assert.ok(retry.format_retry);assert.equal(retry.request.question,envelope.question);assert.equal(retry.source_context.paragraphs.length,packet.release.paragraphs.length);
 assert.doesNotMatch(JSON.stringify(bodies[1]),/unfinished/);
});
test('Formatting recovery cannot add a third call or bypass Stop',async()=>{
 for(const mode of ['repeat_loop','tool_then_loop','stop'] as const){
  let calls=0;const abort=new AbortController();
  const result=await runV2ControlledTurn({question:envelope.question},packet,async()=>{
   calls++;
   if(mode==='tool_then_loop'&&calls===1)return {kind:'tools',calls:[{name:'get_checked_metrics',arguments:{metric_ids:['operating_margin']}}]};
   if(mode==='stop')abort.abort();
   throw new V2PolicyError('provider_whitespace_loop');
  },{signal:abort.signal});
  assert.equal(result.status,mode==='stop'?'stopped':'failed');assert.equal(calls,mode==='stop'?1:2);
  assert.equal(result.counts.provider_calls,calls);
 }
});
test('Incomplete or truncated SSE never turns partial text into a checked answer',async()=>{
 for(const terminal of [[],[{type:'response.incomplete',response:{status:'incomplete',incomplete_details:{reason:'max_output_tokens'},usage:{input_tokens:100,output_tokens:8192},output:[]}}]]){
  let drafts=0;const provider=createV2Provider('fake-test-credential',{onDraft:()=>drafts++,fetch:async()=>sse([{type:'response.output_text.delta',delta:JSON.stringify(draft())},...terminal])});
  const result=await runV2ControlledTurn({question:envelope.question},packet,provider);
  assert.equal(result.status,'failed');assert.equal(result.error_code,'provider_incomplete');assert.equal(drafts,0);
 }
});
test('Streamed tool completion preserves reasoning and call identity through bounded continuation',async()=>{
 const bodies:any[]=[];
 const provider=createV2Provider('fake-test-credential',{fetch:async(_url,init)=>{
  const body=JSON.parse(String(init?.body));bodies.push(body);
  return sse([{type:'response.completed',response:{status:'completed',output:bodies.length===1?
   [{type:'reasoning',encrypted_content:'opaque-public-test-state'},
    {type:'function_call',call_id:'call-streamed',name:'get_checked_metrics',arguments:JSON.stringify({metric_ids:['operating_margin']})}]:
   [{type:'message',content:[{type:'output_text',text:JSON.stringify(draft())}]}]}}]);
 }});
 const result=await runV2ControlledTurn({question:envelope.question},packet,provider);
 assert.equal(result.status,'complete');assert.equal(result.counts.provider_calls,2);
 assert.ok(bodies[1].input.some((item:any)=>item.encrypted_content==='opaque-public-test-state'));
 assert.equal(bodies[1].input.at(-1).call_id,'call-streamed');
 const tool=JSON.parse(bodies[1].input.at(-1).output);
 assert.deepEqual(tool.facts,[]);assert.ok(tool.fact_ids_in_source_context.includes('NVDA:operating_margin:current'));
});
