'use client';
import {factSegments,relatedRow,metricLabel,type V2Artifact,type SourceRef} from '../../lib/v2-display.ts';
import {Button,FigureText,StatusSquare,Text} from './primitives';
import {DataTable,SourceList} from './kit';

export function FactProse({text,artifact}:{text:string;artifact:V2Artifact}){
 return <>{factSegments(text,artifact.facts).map((segment,i)=>segment.numeric?<Text key={i} style="data">{segment.text}</Text>:<FigureText key={i} text={segment.text}/>)}</>;
}
export function Outcome({status,message,retry}:{status:string;message:string;retry?:()=>void}){
 return <div className="a3-limit" role="status"><div className="a3-limit-status"><StatusSquare state={status==='failed'||status==='check_failed'?'failed':'idle'}/><Text style="meta">{status==='check_failed'?'Reference checks failed':status}</Text></div><Text as="p" style="secondary">{message}</Text>{retry&&<Button variant="quiet" onClick={retry}>Retry research</Button>}</div>;
}
// One checked answer body for the thread and optional inspection. No second synthesis,
// heuristic evidence trimming or different fact selection when opening the brief.
export function ResearchAnswer({artifact,onSource,onInvestigate,running,highlight=false}:{artifact:V2Artifact;onSource:(id:SourceRef['id'],passage?:string)=>void;onInvestigate:(question:string)=>void;running:boolean;highlight?:boolean}){
 const bridge=artifact.facts.filter(f=>f.metric==='cash_bridge'&&f.period==='current');
 const total=artifact.facts.find(f=>f.id==='NVDA:cash_bridge:total:qoq');
 return <div className="a3-research-answer">
  {artifact.origin==='saved_reference'&&<Text as="p" style="secondary">Saved, authored reference using frozen sources. This is not a new model run.</Text>}
  <div className="a3-takeaway"><Text style="meta">Interpretation</Text><Text as="p" style="strong"><FactProse text={artifact.takeaway} artifact={artifact}/></Text></div>
  {artifact.answer_kind==='source_limited'&&<Outcome status="unresolved" message="The available reports leave part of this question unanswered. Review the specific evidence needed below."/>}
  {artifact.status==='partial'&&<Outcome status="partial" message="Some generated content failed reference checks and was excluded. Review the surviving evidence and limitations."/>}
  {artifact.rows.length>0&&<DataTable rows={artifact.rows} signalFactId={highlight?artifact.rows[0].id:undefined}/>}
  <div className="a3-findings">{artifact.findings.map(finding=><article key={finding.id}><Text style="meta">Supporting or qualifying evidence · interpretation</Text><Text as="p"><FactProse text={finding.text} artifact={artifact}/>{/* DESIGN-DECISION: The contract links passages to findings, not individual clauses. Links remain at the finding's end. */}{finding.passages.map(p=>{const source=artifact.sources.find(s=>s.id===p.source);return source?<button key={`${p.id}:${p.quote}`} className="a3-inline-source text-secondary" aria-label={`Inspect reported evidence in ${source.label}`} onClick={()=>onSource(source.id,p.id)}>{p.source==='current'?'Current report':'Prior report'}</button>:null;})}</Text></article>)}</div>
  {artifact.rows.length>0&&<details className="a3-detail"><summary className="text-secondary">Inspect calculation basis</summary><div className="a3-detail-content">{artifact.rows.map(row=><div key={row.id}><Text as="p" style="strong">{row.label}</Text><Text as="p" style="secondary">Calculated comparison · {row.change?.basis??row.current.basis}</Text><Text as="p" style="meta"><FigureText text={row.current.source_ids.join(' / ')}/></Text>{row.current.source_ids.map(id=>{const fact=artifact.facts.find(f=>f.id===id);return fact?<Text as="p" key={id} style="data">{metricLabel(fact)}: {fact.display}</Text>:null;})}</div>)}<Text as="p" style="secondary">GAAP operating margin is operating income divided by same-quarter revenue. Changes use unrounded values; displayed differences use percentage points.</Text></div></details>}
  {bridge.length>0&&<details className="a3-detail"><summary className="text-secondary">Inspect complete cash-flow bridge</summary><div className="a3-detail-content"><Text as="p" style="secondary">Calculated · all operating cash-flow components reconcile to the reported totals. Component adjustments are accounting contributions, not balances or proof of business causes.</Text><DataTable variant="bridge" rows={bridge.map(f=>relatedRow(f,artifact.facts))}/><SourceList sources={artifact.sources} onOpen={onSource}/>{total&&<Text as="p" style="data">Total quarterly change: {total.display}</Text>}</div></details>}
  {artifact.unanswered.length>0&&<div className="a3-unanswered"><Text style="strong">What remains unanswered</Text>{artifact.unanswered.map((question,i)=><Text as="p" style="secondary" key={i}><FactProse text={question} artifact={artifact}/></Text>)}</div>}
  {/* DESIGN-DECISION: PRD allows zero or one suggestion, replacing the canvas's two follow-up rows. */}
  {artifact.next&&<div className="a3-next"><Text style="strong">Next investigation</Text><Text as="p" style="secondary"><FigureText text={artifact.next.question}/></Text><Button variant="quiet" disabled={running} onClick={()=>onInvestigate(artifact.next!.question)}>{artifact.next.label}</Button></div>}
  <SourceList sources={artifact.sources} onOpen={onSource}/><Text as="p" style="meta">{artifact.status==='partial'?'Shown references passed checks.':'Reference checks passed.'} Interpretation still requires review.</Text>
 </div>;
}
