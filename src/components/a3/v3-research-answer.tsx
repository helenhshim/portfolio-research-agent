'use client';
import {factSegments,relatedRow,metricLabel,type DisplayFinding,type V3Artifact,type V3Evidence,type SourceRef} from '../../lib/v3-display.ts';
import {findingCitations} from '../../lib/v2-citations.ts';
import {Button,FigureText,StatusSquare,Text} from './primitives';
import {DataTable} from './kit';
import type {V3Discrepancy,V3Fact} from '../../lib/v3-financials.ts';
const sentenceSegmenter=new Intl.Segmenter('en',{granularity:'sentence'});

export function FactProse({text,artifact}:{text:string;artifact:Pick<V3Evidence,'facts'>}){
 return <>{factSegments(text,artifact.facts).map((segment,i)=>segment.numeric?<Text key={i} style="data">{segment.text}</Text>:<FigureText key={i} text={segment.text}/>)}</>;
}
export function InlineCitation({source,onOpen,relatedSources=[]}:{source:SourceRef;onOpen:()=>void;relatedSources?:SourceRef[]}){
 const index=source.id==='current'?1:2;
 const description=[source,...relatedSources].map(item=>`${item.label} · ${item.date}`).join('; ');
 // DESIGN-DECISION: D90 explicitly replaces numeral buttons with ordinary
 // in-flow Source links. Inline text must not inherit the 44px control box,
 // which inflated prose line heights. Keep native links, focus and source labels.
 return <>{'\u00a0'}<a href={source.url} target="_blank" rel="noreferrer" className="a3-inline-citation a3-v3-source-link" title={description} aria-label={relatedSources.length?`Inspect sources: ${description}`:`Inspect source ${index}: ${source.label}, ${source.date}`} onClick={event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();onOpen();}}>Source</a></>;
}
function SourceCitations({citations,onSource}:{citations:{source:SourceRef;passage?:string}[];onSource:(id:SourceRef['id'],passage?:string)=>void}){
 const [primary,...remaining]=citations;if(!primary)return null;
 // One Source link per point; every contributing report remains identified in
 // the accessible name/tooltip and available in the existing inspection tabs.
 return <InlineCitation source={primary.source} relatedSources={remaining.map(item=>item.source)} onOpen={()=>onSource(primary.source.id,primary.passage)}/>;
}
function analysisLines(text:string){
 // Presentation only: retain every checked sentence, including qualifications.
 // Group the remainder into the third bullet rather than truncate or resummarize.
 const sentences=Array.from(sentenceSegmenter.segment(text),part=>part.segment.trim()).filter(Boolean);
 return sentences.length>3?[...sentences.slice(0,2),sentences.slice(2).join(' ')]:sentences;
}
function lineCitations(text:string,finding:DisplayFinding,evidence:V3Evidence){
 const factIds=Array.from(text.matchAll(/\{\{fact:([^}]+)\}\}/g),match=>match[1]);
 // Financial clauses use their actual fact lineage. Qualitative excerpts remain
 // finding-level evidence: the contract does not certify clause-level support.
 return findingCitations(factIds.length?{...finding,fact_ids:factIds}:finding,evidence);
}
export function EvidenceDiscrepancies({discrepancies=[],sources=[],onSource}:{discrepancies?:V3Discrepancy[];sources?:SourceRef[];onSource?:(id:SourceRef['id'],passage?:string)=>void}){
 if(!discrepancies.length)return null;
 // DESIGN-DECISION: D87's conflicts are code-owned source limitations. Keep a
 // visible notice and inspectable values, even when a model answer fails checks.
 return <div className="a3-limit"><Text as="p" style="secondary">Some comparisons were withheld because the available figures disagree beyond their reported precision.</Text><details className="a3-detail"><summary className="text-secondary">Inspect discrepancies</summary><div className="a3-detail-content">{discrepancies.map((d,i)=><div key={`${d.fact_id}-${i}`}>
  <Text style="meta"><FigureText text={d.fact_id}/></Text>
  <Text as="p" style="data">Reported: {d.reported_value} {d.unit==='USD'?'USD':d.unit==='percentage_points'?'percentage points':'%'}</Text>
  <Text as="p" style="data">{d.kind==='cross_report_mismatch'?'Other report':'Existing calculated comparison'}: {d.other_value} {d.unit==='USD'?'USD':d.unit==='percentage_points'?'percentage points':'%'}</Text>
  <Text as="p" style="secondary">The disputed comparison is unavailable for this answer. It was not replaced or averaged.</Text>
  {onSource&&<SourceCitations citations={sources.filter(source=>d.source_ids.some(id=>/^NVDA:(?:prior_)?p\d+$/.test(id)&&(id.includes('prior_')?'prior':'current')===source.id)).map(source=>({source}))} onSource={onSource}/>}
 </div>)}</div></details></div>;
}
export function FactBasis({fact,facts}:{fact:V3Fact;facts:V3Fact[]}){
 const p=fact.provenance;
 const periods:Record<string,string>={current:'Q2 FY2027',prior_quarter:'Q1 FY2027',prior_year:'Q2 FY2026',qoq:'Q2 FY2027 vs Q1 FY2027',qoq_pp:'Q2 FY2027 vs Q1 FY2027',yoy:'Q2 FY2027 vs Q2 FY2026',yoy_pp:'Q2 FY2027 vs Q2 FY2026',guidance:'Q3 FY2027 management outlook'};
 return <div><Text as="p" style="strong">{metricLabel(fact)} · <FigureText text={periods[fact.period]??fact.period}/></Text><Text as="p" style="secondary">{p?.kind==='reported'?'Reported':p?.kind==='derived'?'Calculated':'Evidence basis'} · <FigureText text={fact.basis}/></Text>
  {p?.kind==='reported'?<><Text as="p" style="meta"><FigureText text={`${p.paragraph_id} · ${p.column}`}/></Text><Text as="p" style="data">Source entry: {p.source_value} {p.unit_scale===1e6?'million USD':p.unit_scale===1e9?'billion USD':fact.unit==='percentage_points'?'percentage points':fact.unit==='percent'?'%':fact.unit}</Text></>:p?.kind==='derived'?<><Text as="p" style="secondary"><FigureText text={`Formula: ${p.formula}`}/></Text>{p.input_ids.map(id=>{const input=facts.find(f=>f.id===id);return input?<Text as="p" style="data" key={id}>{metricLabel(input)} · {periods[input.period]??input.period}: {input.display}</Text>:null;})}</>:null}
  {p?.precision_note&&<Text as="p" style="secondary">{p.precision_note}</Text>}
 </div>;
}
export function ResearchFindings({evidence,onSource,developing=false,variant='all'}:{evidence:V3Evidence;onSource:(id:SourceRef['id'],passage?:string)=>void;developing?:boolean;variant?:'all'|'verdict_context'|'thesis'}){
 const labels={supports:'Supports the thesis',challenges:'Challenges or qualifies the thesis',context:'Context for the assessment'};
 const roles:DisplayFinding['role'][]=variant==='verdict_context'?['context']:variant==='thesis'?['supports','challenges']:['supports','challenges','context'];
 const groups=roles.map(role=>({role,findings:evidence.findings.filter(finding=>finding.role===role)})).filter(group=>group.findings.length);
 const showDiscrepancies=variant!=='verdict_context';
 if(!groups.length&&(!showDiscrepancies||!evidence.discrepancies?.length))return null;
 // DESIGN-DECISION: Helen's D89 request for header-level type/size extends A3's
 // existing Text title style from panel titles to answer section headings.
 // Group related findings once, keeping subheadings in Text strong. Checked
 // analysis is visible in short cited bullets; no extra generation or trimming.
 // D90: completed context findings become subpoints of the checked verdict.
 // While developing, there is no final verdict yet, so all roles remain visible.
 return <div className={`a3-findings a3-v3-findings${variant==='verdict_context'?' a3-verdict-context':''}`} data-developing={developing}>{showDiscrepancies&&<EvidenceDiscrepancies discrepancies={evidence.discrepancies} sources={evidence.sources} onSource={onSource}/>} {groups.map(({role,findings})=>{
  return <section className="a3-finding-group" key={role} aria-label={labels[role]}>
   {variant!=='verdict_context'&&<Text as="h2" style="title">{labels[role]}</Text>}
   {findings.map(finding=><article key={finding.id} data-finding-id={finding.id}>
    <Text as="h3" style="strong"><FactProse text={finding.summary} artifact={evidence}/></Text>
    <ul className="a3-analysis-lines text-body">{analysisLines(finding.text).map((line,i)=><li key={i} data-analysis-line={i}><FactProse text={line} artifact={evidence}/><SourceCitations citations={lineCitations(line,finding,evidence)} onSource={onSource}/></li>)}</ul>
   </article>)}
  </section>;
 })}</div>;
}
export function Outcome({status,message,retry,showStatus=true}:{status:string;message:string;retry?:()=>void;showStatus?:boolean}){
 return <div className="a3-limit" role="status">{showStatus&&<div className="a3-limit-status"><StatusSquare state={status==='failed'||status==='check_failed'?'failed':'idle'}/><Text style="meta">{status==='check_failed'?'Reference checks failed':status}</Text></div>}<Text as="p" style="secondary">{message}</Text>{retry&&<Button variant="quiet" onClick={retry}>Retry research</Button>}</div>;
}
// One checked answer body for the thread and optional inspection. No second synthesis,
// heuristic evidence trimming or different fact selection when opening the brief.
export function ResearchAnswer({artifact,onSource,onInvestigate,running}:{artifact:V3Artifact;onSource:(id:SourceRef['id'],passage?:string)=>void;onInvestigate:(question:string)=>void;running:boolean}){
 const bridge=artifact.facts.filter(f=>f.metric==='cash_bridge'&&f.period==='current');
 const total=artifact.facts.find(f=>f.id==='NVDA:cash_bridge:total:qoq');
 const usedFactIds=new Set(artifact.findings.flatMap(f=>f.fact_ids));
 for(const row of artifact.rows){usedFactIds.add(row.current.id);if(row.change)usedFactIds.add(row.change.id);}
 return <div className="a3-research-answer">
  {artifact.origin==='saved_reference'&&<Text as="p" style="secondary">Saved, authored reference using frozen sources. This is not a new model run.</Text>}
  <div className="a3-takeaway"><Text as="h2" style="title">Verdict</Text><Text as="p" style="strong"><FactProse text={artifact.takeaway} artifact={artifact}/></Text>
   {artifact.answer_kind==='source_limited'&&<Outcome status="unresolved" message="The available reports leave part of this question unanswered. Review the specific evidence needed below."/>}
   {artifact.status==='partial'&&<Outcome status="partial" message="Some comparisons or generated content were excluded. Review the surviving evidence and limitations."/>}
   <ResearchFindings evidence={artifact} onSource={onSource} variant="verdict_context"/>
  </div>
  {artifact.rows.length>0&&<DataTable rows={artifact.rows}/>}
  <ResearchFindings evidence={artifact} onSource={onSource} variant="thesis"/>
  {artifact.assessment&&<div className="a3-takeaway"><Text as="h2" style="title">Thesis assessment</Text><Text as="p"><FactProse text={artifact.assessment} artifact={artifact}/></Text></div>}
  {usedFactIds.size>0&&<details className="a3-detail"><summary className="text-secondary">Inspect evidence basis</summary><div className="a3-detail-content">{artifact.facts.filter(f=>usedFactIds.has(f.id)).map(f=><FactBasis key={f.id} fact={f} facts={artifact.facts}/>)}</div></details>}
  {bridge.length>0&&<details className="a3-detail"><summary className="text-secondary">Inspect complete cash-flow bridge</summary><div className="a3-detail-content"><Text as="p" style="secondary">Reported cash-flow components · calculated differences and reconciliation to the reported totals. Component adjustments are accounting contributions, not balances or proof of business causes.<SourceCitations citations={artifact.sources.map(source=>({source}))} onSource={onSource}/></Text><DataTable variant="bridge" rows={bridge.map(f=>relatedRow(f,artifact.facts))}/>{total&&<Text as="p" style="data">Total quarterly change: {total.display}</Text>}</div></details>}
  {/* DESIGN-DECISION: D89 combines missing evidence and the existing zero/one
      feasible CTA. Missing external evidence does not become an executable tool. */}
  {(artifact.unanswered.length>0||artifact.next)&&<section className="a3-next a3-investigation-next" aria-label="What to investigate next"><Text as="h2" style="title">What to investigate next</Text>
   {artifact.unanswered.length>0&&<ul className="a3-analysis-lines text-body">{artifact.unanswered.map((question,i)=><li key={i}><FactProse text={question} artifact={artifact}/></li>)}</ul>}
   {artifact.next&&<div className="a3-investigation-action"><Text as="p" style="secondary"><FactProse text={artifact.next.question} artifact={artifact}/></Text><Button variant="quiet" disabled={running} onClick={()=>onInvestigate(artifact.next!.question)}>{artifact.next.label}</Button></div>}
  </section>}
 </div>;
}
