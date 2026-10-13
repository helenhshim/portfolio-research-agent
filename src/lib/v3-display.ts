import type {V3Fact} from './v3-financials.ts';

// Browser-safe presentation contracts. Provider, source preparation and secrets stay server-side.
export const V3_RESEARCH_PROTOCOL='findings-v3';
export type SourceRef={id:'current'|'prior';label:string;date:string;url:string};
export type Passage={id:string;quote:string;source:'current'|'prior'};
export type DisplayFinding={id:string;role:'supports'|'challenges'|'context';summary:string;text:string;fact_ids:string[];passages:Passage[]};
export type V3Evidence={findings:DisplayFinding[];facts:V3Fact[];sources:SourceRef[];cutoff:string};
export type MetricRow={id:string;label:string;current:V3Fact;prior?:V3Fact;change?:V3Fact;implication:string};
export type V3Artifact={
 question:string;revision:number;answer_kind:'analysis'|'source_limited'|'out_of_scope'|'clarification';origin:'live'|'saved_reference';status:'complete'|'partial';
 takeaway:string;assessment:string|null;findings:DisplayFinding[];rows:MetricRow[];facts:V3Fact[];
 unanswered:string[];next:{question:string;label:string;finding_ids:string[]}|null;
 sources:SourceRef[];cutoff:string;
};
export type ResearchStage='preparing'|'researching'|'investigating'|'developing'|'synthesizing'|'checking'|'recovering';
export type TurnIdentity={session_id:string;turn_id:string;revision:number};
export type V3RunSummary={elapsed_ms:number;provider_calls:number;tool_calls:number;tool_rounds:number};
export type V3TurnResult={status:string;artifact?:V3Artifact;error_code?:string;message?:string;identity:TurnIdentity;run?:V3RunSummary};
export type V3Event={type:'stage';stage:ResearchStage;elapsed_ms:number;identity:TurnIdentity}
 |{type:'finding';finding:DisplayFinding;facts:V3Fact[];sources:SourceRef[];cutoff:string;identity:TurnIdentity}
 |{type:'findings_reset';identity:TurnIdentity}|{type:'result';result:V3TurnResult};
export type Coverage={ticker:string;period:string;cutoff:string;sources:SourceRef[]};
const labels:Record<string,string>={revenue:'Revenue',operating_income:'GAAP operating income',operating_cash_flow:'Operating cash flow',operating_margin:'GAAP operating margin',operating_expenses:'GAAP operating expenses',gross_margin:'GAAP gross margin',data_center_revenue:'Data Center revenue',data_center_share:'Data Center revenue share',guidance_revenue:'Management Q3 revenue outlook',guidance_gross_margin:'Management Q3 GAAP gross-margin outlook',guidance_operating_expenses:'Management Q3 GAAP operating-expense outlook'};
export function metricLabel(fact:V3Fact){
 if(fact.metric==='cash_bridge'){
  const names:Record<string,string>={net_income:'Net income',stock_based_compensation:'Stock-based compensation',depreciation_amortization:'Depreciation and amortization',deferred_income_taxes:'Deferred income taxes',equity_security_gains_adjustment:'Equity security gains adjustment',other_adjustments:'Other adjustments',accounts_receivable_adjustment:'Accounts receivable adjustment',inventory_adjustment:'Inventory adjustment',prepaid_other_assets_adjustment:'Prepaid / other assets adjustment',accounts_payable_adjustment:'Accounts payable adjustment',accrued_current_liabilities_adjustment:'Accrued / current liabilities adjustment',other_long_term_liabilities_adjustment:'Other long-term liabilities adjustment'};
  return names[fact.id.split(':')[2]]??'Cash-flow adjustment';
 }
 return labels[fact.metric]??fact.metric;
}
export function relatedRow(fact:V3Fact,facts:V3Fact[],implication=''):MetricRow {
 const stem=fact.id.replace(/:current$/,'');
 return {id:fact.id,label:metricLabel(fact),current:fact,prior:facts.find(f=>f.id===stem+':prior_quarter'),change:facts.find(f=>f.id===stem+(['operating_margin','gross_margin'].includes(fact.metric)?':qoq_pp':':qoq')),implication};
}
export function factSegments(text:string,facts:V3Fact[]):{text:string;numeric:boolean}[]{
 return text.split(/(\{\{fact:[^}]+\}\})/).filter(Boolean).map(part=>{
  const match=part.match(/^\{\{fact:([^}]+)\}\}$/);
  return {text:match?(facts.find(f=>f.id===match[1])?.display??'n/a'):part,numeric:Boolean(match)};
 });
}
export function plainArtifactText(artifact:V3Artifact){return factSegments(artifact.takeaway,artifact.facts).map(s=>s.text).join('');}
