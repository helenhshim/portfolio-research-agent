import {createHash,randomUUID} from 'node:crypto';
import {structured} from './engine.ts';
import {validateInput,HOLDING_RATIONALES} from './contracts.ts';
import {quarterPairSchema,verifyQuarterPair} from './quarter-pair.ts';
export async function runPairedResearch(packet:any,input:any,apiKey:string,onStage:(stage:string)=>void=()=>{},signal?:AbortSignal){
 const inputs=validateInput(input);
 if(inputs.tickers[0]!==packet.ticker)throw Error('This release supports NVIDIA only.');
 if(!apiKey)throw Error('Live research is not configured on this deployment.');
 onStage('analyzing');
 const schema=structuredClone(quarterPairSchema);
 schema.properties.premise_assessment.properties.rationale_id.enum=[inputs.holding_rationale];
 const response=await structured('quarter_pair_brief',schema,{
  task:`Prepare an advisor holding explanation after reviewing BOTH complete approved earnings releases. Research is tied to every submitted input. Prioritize meaningful changes in financial performance and business developments, including evidence that qualifies or challenges the holding rationale. research_answers must be empty: full-report analysis, no keyword lookup ran. paired_developments classify changed/expanded/unchanged/current_only; actual changes require meaningful exact quotes from BOTH periods. Newly mentioned disclosure is not proof of a newly occurring event; omission is not reversal. Select up to three eligible current financial fact IDs with matching comparison IDs (or empty comparison ID if unavailable). Explain the concrete link to the takeaway, not a generic metric grid. Model performs no arithmetic. Use meaningful numerical-free quotes. All findings require appropriate source evidence for every source-derived assertion; when a finding mentions China assumptions or financing conditions, attach those exact passages too. Operating cash-flow volatility or a single sequential decline is a qualification, not proof of lasting deterioration. The supplied holding rationale is an expectation, not company fact; goal and rationale may differ. Do not invent numerical guidance, macro facts, portfolio exposure, valuation or suitability. The advisor_discussion reuses surviving evidence. State specific unanswered questions and observable watch conditions; do not promise that follow-up ran.`,
  inputs,holding_rationale:{id:inputs.holding_rationale,...HOLDING_RATIONALES[inputs.holding_rationale as keyof typeof HOLDING_RATIONALES]},ticker:packet.ticker,source_cutoff:packet.source_cutoff,comparison_context:packet.comparison_context,facts:packet.facts.map(({source_rows,...f}:any)=>f),comparisons:packet.comparisons,unavailable:packet.unavailable,limitations:packet.limitations,release:packet.release.paragraphs.map((p:any)=>({...p,id:`${packet.ticker}:${p.id}`}))
 },apiKey,'high',true,signal);
 onStage('checking');
 const result=verifyQuarterPair(response.value,packet,inputs.holding_rationale);
 console.info(JSON.stringify({event:'research_checks',assessment_present:Boolean(result.premise_assessment),removed:result.drops.map((d:any)=>({kind:d.kind,reason:d.reason})),comparison_removed:result.comparison_checks.dropped_count}));
 return {run_id:randomUUID(),inputs,result,elapsed_ms:response.trace.elapsed_ms,model:response.trace.model,effort:response.trace.reasoning_effort,source_cutoff:packet.source_cutoff,packet_sha256:createHash('sha256').update(JSON.stringify(packet)).digest('hex')};
}
