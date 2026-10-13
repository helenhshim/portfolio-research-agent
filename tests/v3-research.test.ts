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
 for(const [id,f] of v2)if(!['qoq','yoy'].includes(f.period))assert.equal(v3.get(id)?.value,f.value);
 assert.equal(v3.get('NVDA:revenue:yoy')?.value,106);
 assert.equal(v3.get('NVDA:revenue:yoy')?.provenance.kind,'reported');
 assert.equal(v2.has('NVDA:operating_expenses:current'),false);
 assert.equal(v3.get('NVDA:operating_expenses:current')?.value,8408e6);
 assert.equal(v3.get('NVDA:operating_expenses:yoy')!.value,55);
 assert.equal(v3.get('NVDA:gross_margin:qoq_pp')?.value,.1);
 assert.ok(Math.abs(v3.get('NVDA:operating_margin:yoy_pp')!.value-5.394)<.001);
 assert.match(v3.get('NVDA:data_center_share:current')!.display,/approximately 92.5%/);
 assert.match(v3.get('NVDA:guidance_revenue:guidance')!.display,/management outlook; plus or minus 2%/);
 assert.equal(v3.has('NVDA:guidance_operating_margin:guidance'),false);
});
test('Changed unit/GAAP/fiscal columns block preparation; cross-report discrepancies withhold comparisons',()=>{
 for(const [id,replacement] of [['p14','Non-GAAP'],['p15','($ in billions) Q2 FY27 Q1 FY27 Q2 FY26'],['p35','•Non-GAAP gross margins are expected to be 74.0%.']]){
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

test('D87: matching reported rates preserve precision instead of recomputing issuer arithmetic',()=>{
 const box=createV3Toolbox(packet),facts=box.facts;
 for(const [id,value,display] of [['NVDA:revenue:yoy',106,'+106%'],['NVDA:revenue:qoq',18,'+18%'],['NVDA:operating_income:yoy',124,'+124%'],['NVDA:operating_expenses:yoy',55,'+55%'],['NVDA:gross_margin:qoq_pp',.1,'+0.1 percentage points'],['NVDA:data_center_revenue:yoy',117,'+117%']] as const){
  const fact=facts.get(id)!;assert.equal(fact.value,value);assert.equal(fact.display,display);assert.equal(fact.provenance.kind,'reported');assert.match(fact.source_ids[0],/^NVDA:p/);
 }
 assert.equal(facts.get('NVDA:gross_margin:current')?.display,'75.0%');
 assert.equal(box.discrepancies.length,0);
});
test('D87: reported figures do not require structured-companyfacts data or cached comparisons',()=>{
 const sourceOnly=structuredClone(packet);delete sourceOnly.facts;delete sourceOnly.comparisons;
 const facts=prepareV3Facts(sourceOnly);assert.equal(facts.get('NVDA:revenue:yoy')!.value,106);
 assert.equal(facts.get('NVDA:operating_cash_flow:current')!.value,24077e6);
 assert.equal(facts.get('NVDA:revenue:current')!.provenance.kind,'reported');
});
test('D87: missing reported comparisons are calculated with explicit formula and input lineage',()=>{
 const modified=structuredClone(packet);modified.release.paragraphs.find((p:any)=>p.id==='p16').text='Revenue $96,221 $81,615 $46,743 n/a % n/a %';
 const facts=prepareV3Facts(modified),growth=facts.get('NVDA:revenue:yoy')!;
 assert.equal(growth.provenance.kind,'derived');assert.ok(Math.abs(growth.value-105.851)<.001);
 if(growth.provenance.kind==='derived')assert.deepEqual(growth.provenance.input_ids,['NVDA:revenue:current','NVDA:revenue:prior_year']);
 const margin=facts.get('NVDA:operating_margin:current')!;assert.equal(margin.provenance.kind,'derived');
 if(margin.provenance.kind==='derived')assert.match(margin.provenance.formula,/operating income \/ revenue/);
});
test('D87: sign, decimal precision and percentage-point units survive reported extraction',()=>{
 const modified=structuredClone(packet);modified.release.paragraphs.find((p:any)=>p.id==='p17').text='Gross margin 74.8 % 74.9 % 72.4 % (0.1) pts 2.4 pts';
 const fact=prepareV3Facts(modified).get('NVDA:gross_margin:qoq_pp')!;
 assert.equal(fact.value,-.1);assert.equal(fact.display,'−0.1 percentage points');assert.equal(fact.provenance.kind,'reported');
 if(fact.provenance.kind==='reported')assert.equal(fact.provenance.source_value,'(0.1)');
});
test('D87: compatible existing calculations within source rounding do not replace reported values',()=>{
 const modified=structuredClone(packet);modified.comparisons.find((c:any)=>c.id==='NVDA:revenue:yoy').percentage_change=105.9;
 const box=createV3Toolbox(modified);assert.equal(box.discrepancies.length,0);assert.equal(box.facts.get('NVDA:revenue:yoy')!.value,106);
});
test('D87: a conflicting cached derived comparison is exposed and withheld, never averaged',()=>{
 const modified=structuredClone(packet);modified.comparisons.find((c:any)=>c.id==='NVDA:revenue:yoy').percentage_change=90;
 const box=createV3Toolbox(modified);assert.equal(box.facts.has('NVDA:revenue:yoy'),false);
 assert.equal(box.discrepancies[0].fact_id,'NVDA:revenue:yoy');assert.equal(box.discrepancies[0].reported_value,106);assert.equal(box.discrepancies[0].other_value,90);
 assert.equal(box.discrepancies[0].tolerance,.5);assert.deepEqual(box.sourceContext().discrepancies,box.discrepancies);
 const candidate=finding();assert.equal(verifyV3Finding(candidate,box),null);
});
test('D87: a cached different baseline is not substituted for a reported matching comparison',()=>{
 const modified=structuredClone(packet);const cached=modified.comparisons.find((c:any)=>c.id==='NVDA:revenue:yoy');cached.baseline='immediately preceding fiscal quarter';cached.percentage_change=90;
 const box=createV3Toolbox(modified);assert.equal(box.facts.get('NVDA:revenue:yoy')!.value,106);assert.equal(box.discrepancies.length,0);
});
test('D87: inconsistent prior reports withhold dependent comparisons while retaining unrelated figures',()=>{
 const modified=structuredClone(packet);modified.release.paragraphs.find((p:any)=>p.id==='prior_p20').text='Revenue $80,000 $68,127 $44,062 20 % 85 %';
 const box=createV3Toolbox(modified);assert.equal(box.facts.has('NVDA:revenue:qoq'),false);assert.equal(box.facts.has('NVDA:revenue:prior_quarter'),false);
 assert.equal(box.facts.has('NVDA:operating_margin:prior_quarter'),false);assert.equal(box.facts.has('NVDA:operating_margin:qoq_pp'),false);
 assert.equal(box.facts.get('NVDA:revenue:yoy')!.value,106);assert.equal(box.discrepancies[0].kind,'cross_report_mismatch');
});
test('D87: wrong growth units or current-source periods are rejected before provider dispatch',async()=>{
 for(const mutate of [(p:any)=>{p.release.paragraphs.find((r:any)=>r.id==='p16').text='Revenue $96,221 $81,615 $46,743 18 pts 106 pts';},(p:any)=>{p.release.paragraphs.find((r:any)=>r.id==='p16').source_period='prior';},(p:any)=>{p.comparison_context.current.end='2026-04-26';}]){
  const modified=structuredClone(packet);mutate(modified);let calls=0;
  const result=await runV3ControlledTurn({question:'Pressure-test profitability.'},modified,async()=>{calls++;return {kind:'answer',draft:draft()};});
  assert.equal(result.status,'failed');assert.equal(calls,0);
 }
});
test('D87: discrepancy metadata survives streaming and a failed headline without accepting disputed facts',async()=>{
 const modified=structuredClone(packet);modified.comparisons.find((c:any)=>c.id==='NVDA:revenue:yoy').percentage_change=90;
 const validFinding={...finding(),text:'Operating margin is {{fact:NVDA:operating_margin:current}}. Durability remains unresolved.',fact_ids:['NVDA:operating_margin:current']};
 const identity={session_id:'d87-session',turn_id:'d87-turn',revision:1};
 const handler=createV3Handler({packet:modified,configured:()=>true,provider:()=>async(_i,_s,h)=>{h?.onFinding(validFinding);return {kind:'answer',draft:{...draft(),findings:[validFinding],takeaway:{text:'Unsupported dependency.',finding_ids:['finding_6']}}};}});
 const response=await handler(new Request('http://localhost:3006/api/v3/research',{method:'POST',headers:{Origin:'http://localhost:3006','Content-Type':'application/json','X-Research-Protocol':'findings-v3'},body:JSON.stringify({question:'Pressure-test profitability.',history:[],identity})}));
 const events=(await response.text()).trim().split('\n').map(s=>JSON.parse(s)),first=events.find(e=>e.type==='finding'),last=events.at(-1).result;
 assert.equal(first.discrepancies.length,1);assert.equal(first.facts.some((f:any)=>f.id==='NVDA:revenue:yoy'),false);
 assert.equal(last.status,'check_failed');assert.equal(last.discrepancies.length,1);assert.equal(last.artifact,undefined);
});
test('D87: unrelated cached metric definitions cannot displace a matching reported rate',()=>{
 const modified=structuredClone(packet);const cached=modified.comparisons.find((c:any)=>c.id==='NVDA:revenue:yoy');cached.metric='operating_income';cached.percentage_change=90;
 const box=createV3Toolbox(modified);assert.equal(box.facts.get('NVDA:revenue:yoy')!.value,106);assert.equal(box.discrepancies.length,0);
});
test('D87: useful checked findings remain partial when a separate comparison is withheld',async()=>{
 const modified=structuredClone(packet);modified.comparisons.find((c:any)=>c.id==='NVDA:revenue:yoy').percentage_change=90;
 const validFinding={...finding(),text:'Operating margin is {{fact:NVDA:operating_margin:current}}. Durability remains unresolved.',fact_ids:['NVDA:operating_margin:current']};
 const result=await runV3ControlledTurn({question:'Pressure-test profitability.'},modified,async()=>({kind:'answer',draft:{...draft(),findings:[validFinding]}}));
 assert.equal(result.status,'partial');assert.ok('output' in result&&result.output?.takeaway);assert.equal('output' in result&&result.output?.discrepancies.length,1);
});
test('D87: exact financial-table quotations cannot bypass a withheld comparison',()=>{
 const modified=structuredClone(packet);modified.comparisons.find((c:any)=>c.id==='NVDA:revenue:yoy').percentage_change=90;
 const box=createV3Toolbox(modified),quote=modified.release.paragraphs.find((p:any)=>p.id==='p16').text;
 const attempted={...finding(),text:'Reported growth supports current profitability.',fact_ids:[],evidence:[{paragraph_id:'NVDA:p16',quote}]};
 assert.equal(verifyV3Finding(attempted,box),null);
 const result=verifyV3Draft({...draft(),findings:[attempted]},box);assert.equal(result.status,'check_failed');assert.equal(result.drops[0].reason,'disputed_source_comparison');
});
