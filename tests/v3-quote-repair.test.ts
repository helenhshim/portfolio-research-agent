import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runV3ControlledTurn} from '../src/lib/v3-controller.ts';
import {applyQuoteRepairs} from '../src/lib/v3-provider.ts';
const packet=JSON.parse(readFileSync(new URL('../src/data/nvda-quarter-pair.json',import.meta.url),'utf8'));
const quote=packet.release.paragraphs.find((p:any)=>p.id==='p76').text.slice(0,90);
const draft=()=>({answer_kind:'analysis',findings:[{id:'finding_1',topic:'Earnings comparison',role:'context',summary:'Issuer disclosure defines the supplemental comparison and its limitations.',text:'The report describes management’s supplemental presentation; use it alongside GAAP earnings.',fact_ids:[],evidence:[{paragraph_id:'NVDA:p76',quote:'An invented quote absent from the report.'}]}],takeaway:{text:'Read the supplemental comparison alongside GAAP earnings.',finding_ids:['finding_1']},assessment:null,financial_rows:[],unanswered:[],next_investigation:null});
test('one citation-only repair recovers the takeaway without changing claims, facts or call bounds',async()=>{
 let calls=0;const original=draft();const stages:string[]=[];
 const result=await runV3ControlledTurn({question:'Explain NVIDIA non-GAAP comparisons.'},packet,async input=>{
  calls++;if(calls===1)return {kind:'answer',draft:original};
  assert.deepEqual(input.quote_repair?.finding_ids,['finding_1']);
  return {kind:'answer',draft:applyQuoteRepairs(input.quote_repair!.draft,input.quote_repair!.finding_ids,{repairs:[{finding_id:'finding_1',evidence:[{paragraph_id:'NVDA:p76',quote}]}]})};
 },{onStage:s=>stages.push(s)});
 assert.equal(result.status,'complete');assert.equal(calls,2);assert.ok(stages.includes('recovering'));
 assert.equal('output' in result&&result.output?.takeaway?.text,original.takeaway.text);
 assert.equal(original.findings[0].evidence[0].quote,'An invented quote absent from the report.');
});
test('a failed citation repair stops after the existing second call; unsupported findings are never accepted',async()=>{
 let calls=0;const result=await runV3ControlledTurn({question:'Explain NVIDIA non-GAAP comparisons.'},packet,async()=>{calls++;return {kind:'answer',draft:draft()};});
 assert.equal(result.status,'check_failed');assert.equal(calls,2);
 const removed=applyQuoteRepairs(draft(),['finding_1'],{repairs:[{finding_id:'finding_1',evidence:null}]});
 assert.equal(removed.findings.length,0);assert.deepEqual(removed.takeaway,draft().takeaway);
 assert.throws(()=>applyQuoteRepairs(draft(),['finding_1'],{repairs:[{finding_id:'finding_1',evidence:[],text:'Replace claim'}]}));
});
test('free quantities cannot trigger citation repair',async()=>{
 let calls=0;const d=draft();d.findings[0].text='Profits increased 20%.';
 const result=await runV3ControlledTurn({question:'Explain NVIDIA non-GAAP comparisons.'},packet,async()=>{calls++;return {kind:'answer',draft:d};});
 assert.equal(result.status,'check_failed');assert.equal(calls,1);
});
import {createV3Provider} from '../src/lib/v3-provider.ts';
import {createV3Toolbox} from '../src/lib/v3-safety.ts';
import {v3DraftSchema,verifyV3Draft} from '../src/lib/v3-verifier.ts';
test('wire repair mode disables tools and requests only citation patches, then merges and rechecks',async()=>{
 const toolbox=createV3Toolbox(packet),original=draft();let body:any;
 const provider=createV3Provider('synthetic-key',{fetch:async(_url,init)=>{
  body=JSON.parse(String(init?.body));return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({repairs:[{finding_id:'finding_1',evidence:[{paragraph_id:'NVDA:p76',quote}]}]})}]}]});
 }});
 const r:any=await provider({request:{question:'Explain non-GAAP.',history:[]},source_context:toolbox.sourceContext(),tool_results:[],schema:v3DraftSchema,quote_repair:{draft:original,finding_ids:['finding_1']}},new AbortController().signal);
 assert.equal(body.tool_choice,'none');assert.equal(body.max_output_tokens,1536);assert.deepEqual(Object.keys(body.text.format.schema.properties),['repairs']);assert.equal(body.store,false);
 assert.equal(r.draft.findings[0].text,original.findings[0].text);assert.deepEqual(r.draft.financial_rows,original.financial_rows);assert.equal(verifyV3Draft(r.draft,toolbox).status,'complete');
});
test('Stop during the repair aborts the remaining call without publishing an answer',async()=>{
 const abort=new AbortController();let calls=0,started!:()=>void;const ready=new Promise<void>(r=>started=r);
 const work=runV3ControlledTurn({question:'Explain NVIDIA non-GAAP comparisons.'},packet,async(_input,signal)=>{
  calls++;if(calls===1)return {kind:'answer',draft:draft()};
  return new Promise((_resolve,reject)=>{signal.addEventListener('abort',()=>reject(Error('stop')),{once:true});started();});
 },{signal:abort.signal});
 await ready;abort.abort();const r=await work;assert.equal(r.status,'stopped');assert.equal(calls,2);
});
