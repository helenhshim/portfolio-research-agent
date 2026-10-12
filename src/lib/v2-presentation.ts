import {relatedRow,type Coverage,type V2Artifact} from './v2-display.ts';
import type {V2Fact} from './v2-financials.ts';
import type {runV2ControlledTurn} from './v2-controller.ts';
export function packetCoverage(packet:any):Coverage {
 return {ticker:packet.ticker,period:'FY2027 Q2 vs Q1',cutoff:packet.source_cutoff,sources:[
  {id:'current',label:'FY2027 Q2 release',date:packet.release_filing_date,url:packet.comparison_context.current.url},
  {id:'prior',label:'FY2027 Q1 release',date:packet.comparison_context.prior.filed,url:packet.comparison_context.prior.url},
 ]};
}
export function presentV2Result(result:Awaited<ReturnType<typeof runV2ControlledTurn>>,coverage:Coverage,question:string,revision:number,origin:V2Artifact['origin']='live'):V2Artifact|null {
 if(!('output' in result)||!result.output?.takeaway||!['complete','partial'].includes(result.status))return null;
 const output=result.output,facts=output.facts as V2Fact[],next=output.next_investigation;
 // DESIGN-DECISION: The core has no inferred-question or claim-kind field. Preserve the
 // submitted objective; label interpretations and quoted issuer reporting separately.
 return {question,revision,answer_kind:output.answer_kind,origin,status:result.status as 'complete'|'partial',takeaway:output.takeaway.text,
  findings:output.findings.map((f:any)=>({id:f.id,text:f.text,passages:f.evidence.map((e:any)=>({id:e.paragraph_id,quote:e.quote,source:e.paragraph_id.includes('prior_')?'prior':'current'}))})),
  rows:output.financial_rows.map((r:any)=>relatedRow(r.fact,facts,r.implication)),facts,
  unanswered:output.unanswered,next:next?{question:next.question,finding_ids:next.finding_ids,label:next.metric_ids.includes('cash_bridge')?'Inspect cash-flow contributors':next.metric_ids.includes('operating_cash_flow')?'Compare cash-flow trends':next.metric_ids.includes('operating_margin')?'Compare operating margins':'Investigate this question'}:null,
  sources:coverage.sources,cutoff:coverage.cutoff};
}
