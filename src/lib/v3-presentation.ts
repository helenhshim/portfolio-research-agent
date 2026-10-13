import {relatedRow,type Coverage,type V3Artifact,type DisplayFinding,type SourceRef} from './v3-display.ts';
import type {V3Fact} from './v3-financials.ts';
import type {runV3ControlledTurn} from './v3-controller.ts';
export function packetCoverage(packet:any):Coverage {
 return {ticker:packet.ticker,period:'FY2027 Q2 vs Q1',cutoff:packet.source_cutoff,sources:[
  {id:'current',label:'FY2027 Q2 release',date:packet.release_filing_date,url:packet.comparison_context.current.url},
  {id:'prior',label:'FY2027 Q1 release',date:packet.comparison_context.prior.filed,url:packet.comparison_context.prior.url},
 ]};
}
export function presentV3Finding(finding:{id:string;role:DisplayFinding['role'];summary:string;text:string;fact_ids:string[];evidence:{paragraph_id:string;quote:string}[]},_sources:SourceRef[]):DisplayFinding {
 return {id:finding.id,role:finding.role,summary:finding.summary,text:finding.text,fact_ids:[...finding.fact_ids],passages:finding.evidence.map(e=>({id:e.paragraph_id,quote:e.quote,source:e.paragraph_id.includes('prior_')?'prior':'current'}))};
}
export function presentV3Result(result:Awaited<ReturnType<typeof runV3ControlledTurn>>,coverage:Coverage,question:string,revision:number,origin:V3Artifact['origin']='live'):V3Artifact|null {
 if(!('output' in result)||!result.output?.takeaway||!['complete','partial'].includes(result.status))return null;
 const output=result.output,facts=output.facts as V3Fact[],next=output.next_investigation;
 // DESIGN-DECISION: The core has no inferred-question or claim-kind field. Preserve the
 // submitted objective; label interpretations and quoted issuer reporting separately.
 return {question,revision,answer_kind:output.answer_kind,origin,status:result.status as 'complete'|'partial',takeaway:output.takeaway.text,assessment:output.assessment?.text??null,
  findings:output.findings.map((f:any)=>presentV3Finding(f,coverage.sources)),
  rows:output.financial_rows.map((r:any)=>relatedRow(r.fact,facts,r.implication)),facts,
  unanswered:output.unanswered,next:next?{question:next.question,finding_ids:next.finding_ids,label:next.metric_ids.includes('cash_bridge')?'Inspect cash-flow contributors':next.metric_ids.includes('operating_cash_flow')?'Compare cash-flow trends':next.metric_ids.includes('operating_margin')?'Compare operating margins':'Investigate this question'}:null,
  sources:coverage.sources,cutoff:coverage.cutoff};
}
