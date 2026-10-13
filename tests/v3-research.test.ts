import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prepareV3Facts} from '../src/lib/v3-financials.ts';
import {prepareV2Facts} from '../src/lib/v2-financials.ts';
import {createV3Toolbox} from '../src/lib/v3-safety.ts';
import {verifyV3Draft,verifyV3Finding} from '../src/lib/v3-verifier.ts';
import {runV3ControlledTurn} from '../src/lib/v3-controller.ts';
import {createV3FindingStream} from '../src/lib/v3-finding-stream.ts';
import {createV3Handler} from '../src/lib/v3-http.ts';
import {loadV3Reference} from '../src/lib/v3-reference.ts';
import {createV3Provider,V3SpendLedger} from '../src/lib/v3-provider.ts';
import {Ajv} from 'ajv';
const packet=JSON.parse(readFileSync(new URL('../src/data/nvda-quarter-pair.json',import.meta.url),'utf8'));
const finding=(index=1)=>({id:`finding_${index}`,role:'supports',summary:'Operating leverage supports current profitability, not proof of persistence.',text:'Revenue grew {{fact:NVDA:revenue:yoy}} while operating expenses grew {{fact:NVDA:operating_expenses:yoy}}. This supports operating leverage at the current scale, without establishing repeat demand.',fact_ids:['NVDA:revenue:yoy','NVDA:operating_expenses:yoy'],evidence:[]});
const draft=()=>({answer_kind:'analysis',findings:[finding()],takeaway:{text:'The report strengthens current profitability; durability remains unresolved.',finding_ids:['finding_1']},assessment:{text:'Operating leverage supports the thesis, but repeat demand and cash conversion require further evidence.',finding_ids:['finding_1']},financial_rows:[],unanswered:['Will repeat demand and realized cash sustain the reported performance?'],next_investigation:null});
test('V3 exposes source-owned operating leverage, rounded concentration and attributed outlook without changing V2',()=>{
 const v2=prepareV2Facts(packet),v3=prepareV3Facts(packet);
 for(const [id,f] of v2)assert.deepEqual(v3.get(id),f);
 assert.equal(v2.has('NVDA:operating_expenses:current'),false);
 assert.equal(v3.get('NVDA:operating_expenses:current')?.value,8408e6);
 assert.ok(Math.abs(v3.get('NVDA:operating_expenses:yoy')!.value-55.33)<.01);
 assert.equal(v3.get('NVDA:gross_margin:qoq_pp')?.value,75-74.9);
 assert.ok(Math.abs(v3.get('NVDA:operating_margin:yoy_pp')!.value-5.394)<.001);
 assert.match(v3.get('NVDA:data_center_share:current')!.display,/approximately 92.5%/);
 assert.match(v3.get('NVDA:guidance_revenue:guidance')!.display,/management outlook; plus or minus 2%/);
 assert.equal(v3.has('NVDA:guidance_operating_margin:guidance'),false);
});
test('Changed unit/GAAP/fiscal columns or inconsistent prior-quarter figures block preparation',()=>{
 for(const [id,replacement] of [['p14','Non-GAAP'],['p15','($ in billions) Q2 FY27 Q1 FY27 Q2 FY26'],['prior_p22','Operating expenses $7,620 $6,794 $5,030 12 % 52 %'],['p35','•Non-GAAP gross margins are expected to be 74.0%.']]){
  const changed=structuredClone(packet);changed.release.paragraphs.find((p:any)=>p.id===id).text=replacement;
  assert.throws(()=>prepareV3Facts(changed));
 }
});
test('Summary and detail are both checked; assessment cannot survive a missing dependency',()=>{
 const box=createV3Toolbox(packet),f=finding();assert.ok(verifyV3Finding(f,box));
 assert.equal(verifyV3Finding({...f,summary:'Operating margin is 66.2%.'},box),null);
 assert.equal(verifyV3Finding({...f,summary:'Expenses are {{fact:NVDA:operating_expenses:current}}.'},box),null);
 assert.equal(verifyV3Finding({...f,text:f.text,evidence:[{paragraph_id:'NVDA:p41',quote:'invented text'}]},box),null);
 const changed=draft();changed.assessment.finding_ids=['finding_6'];const result=verifyV3Draft(changed,box);
 assert.equal(result.assessment,null);assert.equal(result.status,'partial');assert.ok(result.takeaway);
});
test('Six complete findings stream individually, a seventh resets; final checks remain authoritative',async()=>{
 const six={...draft(),findings:Array.from({length:6},(_,i)=>finding(i+1))},seen:any[]=[],resets:any[]=[];
 const stream=createV3FindingStream(f=>seen.push(f),()=>resets.push(true));const text=JSON.stringify(six);
 for(let i=0;i<text.length;i+=17)stream.push(text.slice(i,i+17));stream.finish(text);
 assert.equal(seen.length,6);assert.equal(resets.length,0);
 const result=await runV3ControlledTurn({question:'Pressure-test profitability.'},packet,async(_i,_s,h)=>{for(const f of six.findings)h?.onFinding(f);return {kind:'answer',draft:six};});
 assert.equal(result.status,'complete');assert.equal(result.counts.provider_calls,1);
 const invalid=JSON.stringify({...six,findings:[...six.findings,{...finding(),id:'finding_7'}]});const overflow=createV3FindingStream(()=>{},()=>resets.push(true));overflow.push(invalid);assert.equal(resets.length,1);
});
test('HTTP sends checked findings before final verdict; source-limited history never becomes evidence',async()=>{
 const identity={session_id:'v3-test',turn_id:'turn',revision:1};
 const handler=createV3Handler({packet,configured:()=>true,provider:()=>async(_i,_s,h)=>{h?.onFinding(finding());return {kind:'answer',draft:draft()};}});
 const response=await handler(new Request('http://localhost:3006/api/v3/research',{method:'POST',headers:{Origin:'http://localhost:3006','Content-Type':'application/json','X-Research-Protocol':'findings-v3'},body:JSON.stringify({question:'Pressure-test profitability.',history:[],identity})}));
 const events=(await response.text()).trim().split('\n').map(s=>JSON.parse(s));assert.equal(response.headers.get('X-Research-Protocol'),'findings-v3');
 assert.ok(events.findIndex(e=>e.type==='finding')<events.findIndex(e=>e.type==='result'));
 const result=events.at(-1).result;assert.equal(result.artifact.findings[0].summary,finding().summary);assert.ok(result.artifact.assessment);
 assert.equal(result.run.provider_calls,1);
});
test('Actual wire schema accepts the richer contract and typed metric choices at unchanged low effort',async()=>{
 let wire:any;const provider=createV3Provider('test-key',{ledger:new V3SpendLedger(1),fetch:async(_url,init)=>{
  wire=JSON.parse(init!.body as string);
  return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(draft())}]}]});
 }});
 const result=await runV3ControlledTurn({question:'Pressure-test profitability.'},packet,provider);assert.equal(result.status,'complete');
 assert.equal(wire.reasoning.effort,'low');assert.equal(wire.max_output_tokens,5120);
 const check=new Ajv({strict:false}).compile(wire.text.format.schema);assert.ok(check(draft()),JSON.stringify(check.errors));
 assert.ok(wire.tools[1].parameters.properties.metric_ids.items.enum.includes('operating_expenses'));
 assert.ok(wire.text.format.schema.properties.findings.items.properties.fact_ids.items.enum.includes('NVDA:guidance_gross_margin:guidance'));
});
test('V3 retains bounded formatting recovery from shared transport errors',async()=>{
 let calls=0;const provider=createV3Provider('test-key',{fetch:async()=>{
  calls++;if(calls===1)return new Response('data: '+JSON.stringify({type:'response.output_text.delta',delta:' '.repeat(600)})+'\n\n',{headers:{'Content-Type':'text/event-stream'}});
  return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(draft())}]}]});
 }});
 const result=await runV3ControlledTurn({question:'Pressure-test profitability.'},packet,provider);assert.equal(result.status,'complete');assert.equal(calls,2);
});
test('Saved V3 example is explicitly authored, complete and source-checked',async()=>{
 const reference=await loadV3Reference();assert.equal(reference.origin,'saved_reference');assert.equal(reference.status,'complete');assert.ok(reference.findings.every(f=>f.summary&&f.role));assert.ok(reference.assessment);
});
test('Exhausted API credits produce a specific sanitized error without an automatic second call',async()=>{
 let calls=0;const provider=createV3Provider('test-key',{fetch:async()=>{
  calls++;return new Response('data: '+JSON.stringify({type:'error',error:{type:'insufficient_quota',code:'credit_balance_exhausted',message:'Private provider error content'}})+'\n\n',{headers:{'Content-Type':'text/event-stream'}});
 }});
 const result=await runV3ControlledTurn({question:'Pressure-test profitability.'},packet,provider);
 assert.equal(result.status,'failed');assert.equal('error_code' in result&&result.error_code,'provider_quota');assert.equal(calls,1);assert.doesNotMatch(JSON.stringify(result),/Private provider/);
});
