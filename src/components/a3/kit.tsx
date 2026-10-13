'use client';
import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {Button,Chip,FigureText,StatusSquare,Text,type SquareState} from './primitives';
import {formatDuration,stageLabels,type ResearchAttempt} from '../../lib/v2-attempts.ts';
import {factSegments,type Coverage,type MetricRow,type Passage,type SourceRef} from '../../lib/v2-display.ts';
export function Composer({value,onChange,onSubmit,running,onStop,scope,error,inputRef}:{value:string;onChange:(text:string)=>void;onSubmit:()=>void;running:boolean;onStop:()=>void;scope?:ReactNode;error?:string;inputRef?:React.RefObject<HTMLTextAreaElement|null>}){
 const id=useId();const description=[scope?`${id}-scope`:null,error?`${id}-error`:null].filter(Boolean).join(' ')||undefined;return <div className="a3-composer-wrap"><form className="a3-composer" onSubmit={e=>{e.preventDefault();if(!running)onSubmit();}}>
  <Text style="meta" className="a3-composer-q">Q</Text><span className="a3-caret" aria-hidden="true"/>
  <label htmlFor={id} className="a3-sr">Research question or follow-up</label>
  <textarea id={id} ref={inputRef} value={value} disabled={running} aria-describedby={description} aria-invalid={Boolean(error)} placeholder="Ask a question about NVIDIA’s operating profitability…" rows={2} maxLength={2000} onChange={e=>onChange(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();if(!running)onSubmit();}}}/>
  {running?<Button variant="outline" data-research-stop onClick={onStop}>Stop</Button>:<Button variant="primary" type="submit" disabled={!value.trim()}>Run <span aria-hidden="true">↵</span></Button>}
 </form>{scope&&<div id={`${id}-scope`} className="a3-scope text-meta">{scope}</div>}{error&&<Text as="p" style="secondary" id={`${id}-error`} role="alert">{error}</Text>}</div>;
}
// DESIGN-DECISION: P0 has one issuer and no slash-command tools. This variant accepts
// only explicitly supplied, supported actions, never the canvas's placeholder commands.
export function CommandComposer({actions,...props}:React.ComponentProps<typeof Composer>&{actions:{label:string;run:()=>void}[]}){return <><Composer {...props}/>{actions.length>0&&<div className="a3-command-hints">{actions.map(a=><Button key={a.label} variant="link" onClick={a.run}>{a.label}</Button>)}</div>}</>;}
export function QABlock({question,children,id}:{question:string;children:ReactNode;id?:string}){return <section id={id} className="a3-qa"><div className="a3-q"><Text style="meta">Q</Text><Text style="strong"><FigureText text={question}/></Text></div><div className="a3-a"><Text style="meta">A</Text><div className="a3-answer-content">{children}</div></div></section>;}
export function StepLog({attempt,attemptNumber=1}:{attempt:ResearchAttempt;attemptNumber?:number}){
 const actionsId=useId();
 const [open,setOpen]=useState(false),[clock,setClock]=useState(attempt.startedAt);
 const running=attempt.status==='running';
 useEffect(()=>{if(!running)return;const timer=setInterval(()=>setClock(performance.now()),500);return()=>clearInterval(timer);},[running]);
 const now=attempt.endedAt??Math.max(clock,attempt.startedAt),last=attempt.steps.at(-1);
 const state:SquareState=running?'live':attempt.status==='stopped'?'idle':['failed','check_failed'].includes(attempt.status)?'failed':'done';
 const label=running?(last?stageLabels[last.stage]:'Sending research request'):attempt.status==='stopped'?'Stopped':state==='failed'?'Failed':attempt.status==='partial'?'Completed with exclusions':'Completed';
 const elapsed=attempt.run?.elapsed_ms??now-attempt.startedAt;
 const hasActions=attempt.steps.length>0,retry=attemptNumber>1;
 // The single L1 action is the disclosure control. Expanded history includes the
 // actual live step and never adds another timer or simulated model reasoning.
 const row=<><StatusSquare state={state}/><span id={`${actionsId}-label`} className="a3-step-task">{retry&&<Text style="meta" className="a3-step-attempt">Attempt <FigureText text={String(attemptNumber)}/> · </Text>}<span key={label} className="a3-step-task-label text-strong">{label}</span></span><span className="a3-step-duration text-meta" aria-live="off">{formatDuration(elapsed)} {running?'elapsed':'total'}</span>{hasActions&&<svg className="a3-step-chevron" aria-hidden="true" viewBox="0 0 16 16"><path d="m6 4 4 4-4 4"/></svg>}</>;
 return <div className="a3-step-log">
  {/* DESIGN-DECISION: Reuse the link Button as an un-underlined disclosure variant.
      Its stable label names the control; timer ticks never enter its live region. */}
  <span className="a3-sr" role="status" aria-atomic="true">{retry?`Attempt ${attemptNumber}. `:''}{label}</span>
  {hasActions?<Button variant="link" className="a3-step-summary a3-step-disclosure" aria-labelledby={`${actionsId}-label`} aria-expanded={open} aria-controls={actionsId} onClick={()=>setOpen(v=>!v)}>{row}</Button>:<div className="a3-step-summary a3-step-disclosure">{row}</div>}
  <ol id={actionsId} className="a3-steps" aria-label="Research actions" hidden={!open}>{attempt.steps.map((step,i)=><li key={i} className="text-meta"><StatusSquare state={step.state}/><span>{stageLabels[step.stage]} · {step.state==='live'?'in progress':step.state==='done'?'finished':step.state==='failed'?'failed':'stopped'}</span></li>)}</ol>
 </div>;
}
export function Citation({index,source,onOpen}:{index:number;source:SourceRef;onOpen?:()=>void}){
 return onOpen?<button className="text-cite a3-citation" aria-label={`Open cited passage in ${source.label}`} onClick={onOpen}>{index}</button>:<a className="text-cite a3-citation" href={source.url} target="_blank" rel="noreferrer">{index}</a>;
}
export function SourceList({sources,onOpen}:{sources:SourceRef[];onOpen:(id:SourceRef['id'])=>void}){return <div className="a3-source-list">{sources.map((source,i)=><div key={source.id} className="text-meta"><Citation index={i+1} source={source} onOpen={()=>onOpen(source.id)}/><button className="a3-source-button text-secondary" onClick={()=>onOpen(source.id)}><FigureText text={`${source.label} · ${source.date}`}/></button></div>)}</div>;}
function signedChange(row:MetricRow):string{return row.change?`${row.change.value>=0&&!row.change.display.startsWith('+')?'+':''}${row.change.display.replace(/^-/,'−')}`:'n/a';}
export function DataTable({rows,signalFactId,variant='evidence'}:{rows:MetricRow[];signalFactId?:string;variant?:'evidence'|'bridge'}){
 if(variant==='bridge')return <div className="a3-table-scroll" role="region" aria-label="Complete cash-flow bridge" tabIndex={0}><table className="a3-table a3-table-bridge"><thead className="text-meta"><tr><th>Cash-flow component</th><th>Prior quarter</th><th>Current quarter</th><th>Change</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><th scope="row" className="text-body">{row.label}</th><td className="text-data">{row.prior?.display??'n/a'}</td><td className="text-data">{row.current.display}</td><td className={`text-data ${row.change&&row.change.value<0?'a3-negative':'a3-positive'}`}>{signedChange(row)}</td></tr>)}</tbody></table></div>;
 return <div className="a3-table-scroll" role="region" aria-label="Financial evidence" tabIndex={0}><table className="a3-table"><thead className="text-meta"><tr><th>Financial evidence</th><th>Value / comparison</th><th>Implication</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><th scope="row" className="text-body">{row.label}</th><td><Text style="data" className={signalFactId===row.id?'a3-key-fact':''}>{row.current.display}</Text>{row.prior&&<div className="text-data a3-comparison">Prior: {row.prior.display}</div>}{row.change&&<div className={`text-data ${row.change.value<0?'a3-negative':'a3-positive'}`}>{signedChange(row)}<span className="a3-comparison"> · QoQ</span></div>}</td><td className="text-secondary">{factSegments(row.implication||row.current.basis,[row.current]).map((segment,i)=>segment.numeric?<Text key={i} style="data">{segment.text}</Text>:<FigureText key={i} text={segment.text}/>)}</td></tr>)}</tbody></table></div>;
}
export function TickerChip({coverage}:{coverage:Coverage}){return <Chip>NVDA <span className="a3-comparison">· <FigureText text={coverage.period}/></span></Chip>;}
export function CoverageRow({coverage}:{coverage:Coverage}){return <div className="a3-coverage-row"><Text style="data">NVDA</Text><Text style="secondary">Available · frozen reports</Text><Text style="meta"><FigureText text={coverage.sources.map(s=>s.date).join(' / ')}/></Text></div>;}
export function Tabs({items,value,onChange,id}:{items:{id:string;label:string;citation?:number}[];value:string;onChange:(id:string)=>void;id:string}){
 const refs=useRef<(HTMLButtonElement|null)[]>([]);return <div className="a3-tabs" role="tablist" aria-label={id==='view'?'Thread or brief':'Report sources'}>{items.map((item,i)=><button ref={el=>{refs.current[i]=el;}} key={item.id} id={`${id}-tab-${item.id}`} role="tab" aria-selected={value===item.id} aria-controls={`${id}-panel-${item.id}`} tabIndex={value===item.id?0:-1} className={`a3-tab text-body ${value===item.id?'a3-tab-active':''}`} onClick={()=>onChange(item.id)} onKeyDown={e=>{let index=i;if(e.key==='ArrowRight')index=(i+1)%items.length;else if(e.key==='ArrowLeft')index=(i-1+items.length)%items.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=items.length-1;else return;e.preventDefault();onChange(items[index].id);refs.current[index]?.focus();}}>{item.citation&&<span className="text-cite">{item.citation}</span>}<FigureText text={item.label}/></button>)}</div>;
}
export function RailItem({children,active,onClick}:{children:ReactNode;active?:boolean;onClick:()=>void}){return <button className={`a3-rail-item text-secondary ${active?'a3-rail-active':''}`} aria-current={active?'step':undefined} onClick={onClick}>{children}</button>;}
// DESIGN-DECISION: Exact SEC quotations retain original punctuation, including em dashes;
// the authored interface copy follows the no-em-dash rule. Quote fidelity takes precedence.
export function SourcePassage({passage,source,index,quotes=[passage.quote]}:{passage:Passage;source:SourceRef;index:number;quotes?:string[]}){return <article className="a3-passage" id={`passage-${passage.id.replaceAll(':','-')}`} tabIndex={-1}><header><a href={source.url} target="_blank" rel="noreferrer" className="a3-source-link text-meta"><FigureText text={`${index} · ${source.label}`}/></a><Text style="meta"><FigureText text={source.date}/></Text></header><Text style="meta" as="p">Reported · issuer statement</Text><blockquote className="text-secondary">{quotes.map((quote,i)=><p key={i}><mark><FigureText text={quote}/></mark></p>)}</blockquote><Text style="meta"><FigureText text={passage.id}/></Text></article>;}
