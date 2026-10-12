import {test} from 'node:test';
import assert from 'node:assert/strict';
import {researchHolding} from '../src/lib/engine.ts';
test('reasoning options reach both API stages and context instructions preserve code-owned evidence boundaries',async()=>{
 const originalFetch=globalThis.fetch;
 const requests:any[]=[];
 const assessment={rationale_id:'profitable_growth',status:'unresolved',headline:'Evidence missing',what_this_means:'Not enough source evidence.',supported_parts:[],challenged_parts:[],unresolved_parts:['Demand persistence unresolved.'],next_decisive_evidence:'Subsequent reported results.',finding_ids:[],fact_ids:[]};
 globalThis.fetch=async(_url,init)=>{
  const body=JSON.parse(String(init?.body));requests.push(body);
  const value=body.text.format.name==='research_plan'?{questions:[]}:{premise_assessment:assessment,findings:[],research_answers:[],interpretations:[],watch_items:[],uncertainties:[]};
  return new Response(JSON.stringify({status:'completed',id:'test-response',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(value)}]}],usage:{output_tokens:1}}),{status:200});
 };
 try{
  const packet={ticker:'NVDA',source_cutoff:'2026-10-11',facts:[],comparisons:[],release:{paragraphs:[]}};
  const input={primary_goal:'growth',holding_period:'long',risk_tolerance:'medium',tickers:['NVDA'],holding_rationale:'profitable_growth'};
  const low=await researchHolding(packet,input,'focus','test-key');
  const high=await researchHolding(packet,input,'focus','test-key',()=>{},{plannerEffort:'high',analysisEffort:'high',contextSpecific:true});
  assert.deepEqual(requests.map(r=>r.reasoning.effort),['low','low','high','high']);
  assert.equal(low.trace[0].prompt_version,'premise-v1');assert.equal(high.trace[1].prompt_version,'context-v1');
  assert.ok(requests[2].instructions.includes('Consider all submitted inputs jointly.'));
  for(const request of requests){assert.equal(request.store,false);assert.equal(request.text.format.strict,true);assert.ok(request.instructions.includes('Code computes all financial changes.'));}
 }finally{globalThis.fetch=originalFetch;}
});
