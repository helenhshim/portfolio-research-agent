import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createV2FindingStream} from '../src/lib/v2-finding-stream.ts';
import {runV2ControlledTurn,type V2ProviderObserver} from '../src/lib/v2-controller.ts';
import {createV2Provider} from '../src/lib/v2-provider.ts';
import {createV2Handler} from '../src/lib/v2-http.ts';
import {V2PolicyError,createV2Toolbox} from '../src/lib/v2-safety.ts';
import {verifyV2Draft,verifyV2Finding} from '../src/lib/v2-verifier.ts';
const packet=JSON.parse(readFileSync(new URL('../src/data/nvda-quarter-pair.json',import.meta.url),'utf8'));
const question={question:'Does operating profitability look durable?',history:[]};
function finding(id='finding_1'){return {id,text:'Operating margin is {{fact:NVDA:operating_margin:current}}; execution progressed.',fact_ids:['NVDA:operating_margin:current'],evidence:[{paragraph_id:'NVDA:p41',quote:'ramping into full production with racks running at partners'}]};}
function draft(){return {answer_kind:'analysis',findings:[finding()],takeaway:{text:'Current profitability improved; persistence remains unresolved.',finding_ids:['finding_1']},financial_rows:[],unanswered:['Product economics remain unresolved.'],next_investigation:null};}
test('Complete findings emerge across every string/escape boundary, before synthesis finishes',()=>{
 const item={...finding(),text:'A quoted \\"findings\\": [{nested}] phrase and café do not create another item.'};
 const d={...draft(),findings:[item,finding('finding_2')]},text=JSON.stringify(d);
 const found:unknown[]=[],resets:number[]=[];const stream=createV2FindingStream(f=>found.push(f),()=>resets.push(1));
 const prefix=text.slice(0,text.indexOf(',"takeaway"'));
 for(const c of prefix)stream.push(c);
 assert.deepEqual(found,[item,finding('finding_2')]);assert.deepEqual(resets,[]);
 for(const c of text.slice(prefix.length))stream.push(c);stream.finish(text);
 assert.deepEqual(found,[item,finding('finding_2')]);assert.deepEqual(resets,[]);
});
test('Only classified top-level findings stream; nested, incomplete and coverage objects stay private',()=>{
 for(const text of [
  '{"answer_kind":"out_of_scope","findings":['+JSON.stringify(finding())+']}',
  '{"findings":['+JSON.stringify(finding())+'],"answer_kind":"analysis"}',
  '{"answer_kind":"analysis","takeaway":{"findings":['+JSON.stringify(finding())+']}}',
  '{"answer_kind":"analysis","findings":[{"id":"finding_1","text":"unfinished',
 ]){const found:unknown[]=[];createV2FindingStream(f=>found.push(f),()=>{}).push(text);assert.deepEqual(found,[]);}
});
test('Findings-complete milestone waits for the actual array close, not an object or nested bracket',()=>{
 const actions:string[]=[];const stream=createV2FindingStream(()=>actions.push('finding'),()=>actions.push('reset'),()=>actions.push('complete'));
 const item=JSON.stringify({...finding(),text:'A literal ] closes no array.'});
 stream.push('{"answer_kind":"analysis","findings":['+item.slice(0,-1));assert.deepEqual(actions,[]);
 stream.push('}');assert.deepEqual(actions,['finding']);
 stream.push(']');assert.deepEqual(actions,['finding','complete']);
 stream.push(',"takeaway":{}');assert.deepEqual(actions,['finding','complete']);
 let coverageComplete=0;createV2FindingStream(()=>{},()=>{},()=>coverageComplete++).push('{"answer_kind":"out_of_scope","findings":[]}');assert.equal(coverageComplete,0);
});
test('Duplicate IDs, duplicate root keys, extra text and oversized envelopes retract provisional data',()=>{
 const item=JSON.stringify(finding()),prefix='{"answer_kind":"analysis","findings":['+item;
 for(const suffix of [','+item+']}','],"answer_kind":"analysis"}',']}extra',' '.repeat(20001)]){
  const found:unknown[]=[],resets:number[]=[];const stream=createV2FindingStream(f=>found.push(f),()=>resets.push(1));
  stream.push(prefix);assert.equal(found.length,1);stream.push(suffix);assert.equal(resets.length,1);
  stream.push(',{}');assert.equal(resets.length,1);assert.equal(found.length,1);
 }
});
test('Independent findings and final findings share identical rejection gates',()=>{
 const box=createV2Toolbox(packet);
 for(const mutate of [
  (f:any)=>f.text='Margin is 99%.',
  (f:any)=>f.text='Client name: TEST_PERSON_SYNTHETIC',
  (f:any)=>f.text='Read https://unknown.example/',
  (f:any)=>f.evidence[0].quote='Invented source quote.',
  (f:any)=>f.text+=' {{fact:NVDA:revenue:current}}',
  (f:any)=>f.fact_ids=['NVDA:unknown:current'],
 ]){const f=finding();mutate(f);assert.equal(verifyV2Finding(f,box),null);assert.equal(verifyV2Draft({...draft(),findings:[f]},box).findings.length,0);}
 assert.deepEqual(verifyV2Finding(finding(),box),finding());
});
test('Complete JSON containing an unfinished caveat is rejected before incremental or final display',()=>{
 const box=createV2Toolbox(packet),f=finding();f.text='Current profitability improved. These are accounting contributors, not';
 assert.equal(verifyV2Finding(f,box),null);
 const result=verifyV2Draft({...draft(),findings:[f]},box);
 assert.equal(result.findings.length,0);assert.equal(result.takeaway,null);assert.equal(result.drops[0].reason,'unfinished_prose');
 // An explicit complete caveat survives; the checker never supplies missing words.
 f.text+=' proof of persistence.';assert.deepEqual(verifyV2Finding(f,box),f);
});
test('Takeaway facts must belong to its linked surviving findings, even if another finding supplies them',()=>{
 const box=createV2Toolbox(packet),d=draft();
 const unrelated={...finding('finding_2'),text:'Revenue is {{fact:NVDA:revenue:current}}.',fact_ids:['NVDA:revenue:current']};
 d.findings.push(unrelated);d.takeaway.text='Revenue is {{fact:NVDA:revenue:current}}.';
 const rejected=verifyV2Draft(d,box);assert.equal(rejected.findings.length,2);assert.equal(rejected.takeaway,null);assert.equal(rejected.status,'check_failed');
 d.takeaway.finding_ids=['finding_2'];assert.equal(verifyV2Draft(d,box).status,'complete');
});
test('The terminal message retracts candidates from a divergent or malformed delta envelope',()=>{
 for(const terminal of [JSON.stringify({...draft(),findings:[]}),'{"answer_kind":"analysis","findings":['+JSON.stringify(finding())+',]}']){
  const found:unknown[]=[],resets:number[]=[];const stream=createV2FindingStream(f=>found.push(f),()=>resets.push(1));
  stream.push(JSON.stringify(draft()));assert.equal(found.length,1);stream.finish(terminal);assert.equal(resets.length,1);
 }
});
test('Controller publishes checked candidates before provider completion and rejects invalid or late callbacks',async()=>{
 let observer!:V2ProviderObserver,resolve!:(value:unknown)=>void;const found:any[]=[],stages:string[]=[];
 const run=runV2ControlledTurn(question,packet,async(_input,_signal,hooks)=>{observer=hooks!;return new Promise(r=>resolve=r);},{onFinding:(f,facts)=>found.push({f,facts}),onStage:s=>stages.push(s)});
 await new Promise(r=>setImmediate(r));
 const bad=finding('finding_2');bad.text='Unverified 999%.';observer.onFinding(bad);assert.equal(found.length,0);
 observer.onFinding(finding());assert.equal(found.length,1);assert.equal(found[0].facts.find((f:any)=>f.id==='NVDA:operating_margin:current').display,'66.2%');
 assert.deepEqual(stages,['preparing','researching','developing']);
 observer.onFindingsComplete?.();observer.onFindingsComplete?.();assert.deepEqual(stages,['preparing','researching','developing','synthesizing']);
 resolve({kind:'answer',draft:draft()});assert.equal((await run).status,'complete');observer.onFinding(finding('finding_3'));assert.equal(found.length,1);
 observer.onFindingsComplete?.();assert.deepEqual(stages,['preparing','researching','developing','synthesizing','checking']);
});
test('Empty, invalid-only and stopped finding arrays cannot advance synthesis progress',async()=>{
 for(const mode of ['empty','invalid','stopped'] as const){
  const abort=new AbortController(),stages:string[]=[];
  const result=await runV2ControlledTurn(question,packet,async(_input,_signal,hooks)=>{
   if(mode==='invalid'){const bad=finding();bad.text='An unsupported gain of 99%.';hooks?.onFinding(bad);}
   if(mode==='stopped')abort.abort();hooks?.onFindingsComplete?.();return {kind:'answer',draft:draft()};
  },{signal:abort.signal,onStage:s=>stages.push(s)});
  assert.ok(!stages.includes('synthesizing'));assert.equal(result.status,mode==='stopped'?'stopped':'complete');
 }
});
test('Stop and deadline suppress late findings; formatting/tool continuations reset before remaining call',async()=>{
 for(const mode of ['stop','deadline'] as const){
  const abort=new AbortController();let hooks!:V2ProviderObserver;const found:unknown[]=[];
  const run=runV2ControlledTurn(question,packet,async(_input,_signal,h)=>{hooks=h!;return new Promise(()=>{});},{signal:abort.signal,deadlineMs:mode==='deadline'?20:1000,onFinding:f=>found.push(f)});
  await new Promise(r=>setImmediate(r));if(mode==='stop')abort.abort();await run;hooks.onFinding(finding());assert.deepEqual(found,[]);
 }
 for(const mode of ['format','tools'] as const){
  const actions:string[]=[];let calls=0;
  const result=await runV2ControlledTurn(question,packet,async(_input,_signal,hooks)=>{
   calls++;hooks?.onFinding(finding());
   if(calls===1){if(mode==='format')throw new V2PolicyError('provider_whitespace_loop');return {kind:'tools',calls:[{name:'get_checked_metrics',arguments:{metric_ids:['operating_margin']}}]};}
   return {kind:'answer',draft:draft()};
  },{onFinding:()=>actions.push('finding'),onFindingsReset:()=>actions.push('reset')});
  assert.equal(result.status,'complete');assert.deepEqual(actions,['finding','reset','finding']);assert.equal(calls,2);
 }
});
test('Real SSE adapter emits whole checked findings, no raw fragments, with findings-first schema',async()=>{
 const d=draft(),text=JSON.stringify(d),found:any[]=[],bodies:any[]=[],stages:string[]=[];
 const encoded=new TextEncoder().encode([
  ...Array.from(text).map(delta=>({type:'response.output_text.delta',delta,output_index:0,content_index:0})),
  {type:'response.completed',response:{status:'completed',output:[{type:'message',content:[{type:'output_text',text}]}]}},
 ].map(e=>'data: '+JSON.stringify(e)+'\n\n').join(''));
 const provider=createV2Provider('fake-test-credential',{fetch:async(_url,init)=>{
  bodies.push(JSON.parse(String(init?.body)));
  return new Response(new ReadableStream({start(c){for(let i=0;i<encoded.length;i+=7)c.enqueue(encoded.slice(i,i+7));c.close();}}),{headers:{'content-type':'text/event-stream'}});
 }});
 const result=await runV2ControlledTurn(question,packet,provider,{onFinding:f=>found.push(f),onStage:s=>stages.push(s)});
 assert.equal(result.status,'complete');assert.deepEqual(found,[finding()]);
 assert.deepEqual(stages,['preparing','researching','developing','synthesizing','checking']);
 assert.deepEqual(Object.keys(bodies[0].text.format.schema.properties).slice(0,3),['answer_kind','findings','takeaway']);
});
test('SSE function-call events reset streamed objects before bounded tool synthesis',async()=>{
 const actions:string[]=[];let calls=0;const encode=new TextEncoder();
 const provider=createV2Provider('fake-test-credential',{fetch:async()=>{
  calls++;const data=calls===1?
   [{type:'response.output_text.delta',delta:JSON.stringify(draft())},{type:'response.output_item.added',item:{type:'function_call'}},{type:'response.completed',response:{status:'completed',output:[{type:'function_call',name:'get_checked_metrics',call_id:'call_fixture',arguments:JSON.stringify({metric_ids:['operating_margin']})}]}}]:
   [{type:'response.output_text.delta',delta:JSON.stringify(draft())},{type:'response.completed',response:{status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(draft())}]}]}}];
  return new Response(new ReadableStream({start(c){for(const item of data)c.enqueue(encode.encode('data: '+JSON.stringify(item)+'\n\n'));c.close();}}),{headers:{'content-type':'text/event-stream'}});
 }});
 const result=await runV2ControlledTurn(question,packet,provider,{onFinding:()=>actions.push('finding'),onFindingsReset:()=>actions.push('reset')});
 assert.equal(result.status,'complete');assert.equal(calls,2);assert.deepEqual(actions,['finding','reset','finding']);
});
test('HTTP releases checked findings with the owning identity while synthesis remains unresolved',async()=>{
 const identity={session_id:'stream-session',turn_id:'stream-turn',revision:1};let hooks!:V2ProviderObserver,resolve!:(value:unknown)=>void;
 const handler=createV2Handler({packet,configured:()=>true,provider:()=>async(_input,_signal,h)=>{hooks=h!;return new Promise(r=>resolve=r);}});
 const response=await handler(new Request('http://localhost/api/v2/research',{method:'POST',headers:{Origin:'http://localhost','Content-Type':'application/json'},body:JSON.stringify({...question,identity})}));
 await new Promise(r=>setImmediate(r));const reader=response.body!.getReader(),decoder=new TextDecoder();
 const bad=finding('finding_2');bad.evidence[0].quote='Made-up excerpt.';hooks.onFinding(bad);hooks.onFinding(finding());
 let text='';while(!text.includes('"type":"finding"'))text+=decoder.decode((await reader.read()).value,{stream:true});
 const items=text.trim().split('\n').map(line=>JSON.parse(line));const item=items.find(e=>e.type==='finding');
 assert.deepEqual(item.identity,identity);assert.equal(item.finding.id,'finding_1');assert.equal(item.finding.passages[0].quote,finding().evidence[0].quote);assert.doesNotMatch(text,/Made-up excerpt/);assert.equal(item.cutoff,packet.source_cutoff);assert.ok(!items.some(e=>e.type==='result'));
 resolve({kind:'answer',draft:draft()});while(true){const chunk=await reader.read();if(chunk.done)break;text+=decoder.decode(chunk.value,{stream:true});}
 const final=JSON.parse(text.trim().split('\n').at(-1)!);assert.equal(final.type,'result');assert.equal(final.result.status,'complete');
});
