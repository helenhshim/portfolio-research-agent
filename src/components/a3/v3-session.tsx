'use client';
import {evidencePassages,sourceLocationUrl} from '../../lib/v3-citations.ts';
import {useEffect,useRef,useState} from 'react';
import {v3InputIssue,V3_SENSITIVE_INPUT_MESSAGE} from '../../lib/v3-input-policy.ts';
import {v3SessionOutcome,type V3SessionSummary} from '../../lib/v3-sessions.ts';
import {addStage,addFinding,resetFindings,matchesTurnEvent,researchFailureCode,canRetry,finishAttempt,latestAttempt,recoveryMessage,researchHistory,startAttempt,turnArtifact,updateAttempt,type ResearchTurn} from '../../lib/v3-attempts.ts';
import {V2RevisionGate} from '../../lib/v2-revisions.ts';
import {V3_RESEARCH_PROTOCOL,type Coverage,type V3Artifact,type V3Evidence,type V3Event,type SourceRef,type Passage} from '../../lib/v3-display.ts';
import {Button,FigureText,Text} from './primitives';
import {Composer,QABlock,SourcePassage,StepLog,Tabs} from './kit';
import {WorkspaceLayout} from './layouts';
import {SessionHistoryBridge} from './v3-history-bridge';
import {Outcome,ResearchAnswer,EvidenceDiscrepancies,FactBasis} from './v3-research-answer';
function groupPassages(artifact:V3Evidence|null,source:string){
 const groups=new Map<string,{passage:Passage;quotes:string[]}>();
 for(const passage of artifact?evidencePassages(artifact):[]){if(passage.source!==source)continue;const existing=groups.get(passage.id);if(existing){if(!existing.quotes.includes(passage.quote))existing.quotes.push(passage.quote);}else groups.set(passage.id,{passage,quotes:[passage.quote]});}
 return [...groups.values()];
}
// Intent: preserve an analyst's question, evidence and draft while navigating.
// A3: ink on white, hairlines only, Geist/mono and the existing spacing scale.
export default function V3ResearchSession({id,summary,historyLoading,visible,coverage,reference,liveConfigured,busyElsewhere,claimRun,releaseRun,onSummary,onActiveResearch}:{id:string;summary:V3SessionSummary;historyLoading:boolean;visible:boolean;coverage:Coverage;reference:V3Artifact;liveConfigured:boolean;busyElsewhere:boolean;claimRun:(id:string,stop:()=>void)=>boolean;releaseRun:(id:string)=>void;onSummary:(id:string,patch:Partial<Omit<V3SessionSummary,'id'>>)=>void;onActiveResearch:()=>void}){
 const [value,setValue]=useState(''),[inspection,setInspection]=useState<V3Evidence|null>(null),[turns,setTurns]=useState<ResearchTurn[]>([]),[running,setRunning]=useState(false),[inputError,setInputError]=useState(''),[tab,setTab]=useState<SourceRef['id']>('current'),[narrow,setNarrow]=useState(false),[selectedPassage,setSelectedPassage]=useState<string|null>(null);
 const host=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null),gate=useRef<V2RevisionGate<V3Artifact>|null>(null),active=useRef<{token:ReturnType<V2RevisionGate<V3Artifact>['begin']>;abort:AbortController;turnId:string}|null>(null),runningRef=useRef(false),provisionalInspection=useRef(false),inspectionPane=useRef<HTMLDivElement>(null),threadPane=useRef<HTMLElement>(null),opener=useRef<HTMLElement|null>(null),position=useRef({window:0,pane:0});
 const session=()=>{if(!gate.current)gate.current=new V2RevisionGate(crypto.randomUUID());return gate.current;};
 const visibleRef=useRef(visible);visibleRef.current=visible;
 const openerLocation=useRef<{turn:string;label:string;finding?:string;line?:string}|null>(null);
 function citationSelector(location:{turn:string;label:string;finding?:string;line?:string}){
  return `#${CSS.escape(location.turn)} ${location.finding?`[data-finding-id="${CSS.escape(location.finding)}"] `:''}${location.line!==undefined?`[data-analysis-line="${CSS.escape(location.line)}"] `:''}.a3-inline-citation[aria-label="${CSS.escape(location.label)}"]`;
 }
 useEffect(()=>{const el=host.current;if(!el)return;const observer=new ResizeObserver(entries=>{const css=getComputedStyle(el);const threshold=parseFloat(css.getPropertyValue('--pane-min-w'))+parseFloat(css.getPropertyValue('--workspace-min-w'));setNarrow(entries[0].contentRect.width<threshold);});observer.observe(el);return()=>observer.disconnect();},[]);
 useEffect(()=>()=>active.current?.abort.abort(),[]);
 useEffect(()=>{const turn=turns.at(-1),attempt=turn&&latestAttempt(turn);onSummary(id,{title:turns[0]?.question.slice(0,140)??'New research',updatedAt:gate.current?Date.now():summary.updatedAt,outcome:turn?.reference?'Saved reference':v3SessionOutcome(attempt?.status),hasAnswer:turns.some(t=>Boolean(turnArtifact(t)))});},[id,turns,onSummary]);
 useEffect(()=>{
  if(!inspection||!visible)return;
  if(!selectedPassage&&inspectionPane.current?.contains(document.activeElement))return;
  const el=selectedPassage?host.current?.querySelector<HTMLElement>(`#${CSS.escape(`${id}-passage-${selectedPassage.replaceAll(':','-')}`)}`):inspectionPane.current;
  el?.focus({preventScroll:true});if(selectedPassage)el?.scrollIntoView({block:'nearest',behavior:'auto'});
 },[id,inspection,selectedPassage,tab,narrow,visible]);
 function inspect(saved:V3Evidence,id:SourceRef['id'],passage?:string){
  // Capture only thread-origin openers so switching source tabs does not lose the return target.
  if(!inspectionPane.current?.contains(document.activeElement)){
   opener.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
   const turn=opener.current?.closest('.a3-qa')?.id,label=opener.current?.getAttribute('aria-label'),finding=opener.current?.closest('[data-finding-id]')?.getAttribute('data-finding-id')??undefined,line=opener.current?.closest('[data-analysis-line]')?.getAttribute('data-analysis-line')??undefined;openerLocation.current=turn&&label?{turn,label,finding,line}:null;
   position.current={window:window.scrollY,pane:threadPane.current?.scrollTop??0};
  }
  provisionalInspection.current=!('takeaway' in saved);setInspection(saved);setTab(id);setSelectedPassage(passage??null);
 }
 function closeInspection(restore=true){
  provisionalInspection.current=false;setInspection(null);setSelectedPassage(null);
  if(restore)requestAnimationFrame(()=>{const location=openerLocation.current;const surviving=location?host.current?.querySelector<HTMLElement>(citationSelector(location)):null;const target=opener.current?.isConnected?opener.current:surviving??input.current;target?.focus({preventScroll:true});window.scrollTo({top:position.current.window,behavior:'auto'});if(threadPane.current)threadPane.current.scrollTop=position.current.pane;});
 }
 function stop(){
  const current=active.current;if(!current)return;
  session().stop(current.token);current.abort.abort();active.current=null;runningRef.current=false;setRunning(false);releaseRun(id);closeInspection(visibleRef.current);
  const now=performance.now();setTurns(t=>updateAttempt(t,current.turnId,current.token.turn_id,a=>finishAttempt(a,{status:'stopped',error_code:'stopped'},now)));
 }
 async function run(question=value,retryTurnId?:string){
  if(runningRef.current||busyElsewhere||historyLoading)return;const q=question.trim();if(!q){setInputError('Enter a research question.');return;}
  const retryTurn=retryTurnId?turns.find(t=>t.id===retryTurnId):undefined;
  if(retryTurnId&&(!retryTurn||!latestAttempt(retryTurn)||!canRetry(latestAttempt(retryTurn)!)))return;
  const previous=retryTurn?.history??researchHistory(turns),issue=v3InputIssue(q,previous);
  if(issue){setInputError(issue==='sensitive_input'?V3_SENSITIVE_INPUT_MESSAGE:'Enter a public-company question within the input limit.');return;}
  if(!claimRun(id,stop))return;
  const turnId=retryTurnId??crypto.randomUUID(),g=session(),token=g.begin(crypto.randomUUID()),abort=new AbortController();
  active.current={token,abort,turnId};runningRef.current=true;setRunning(true);setInputError('');if(!retryTurnId)setValue('');closeInspection(false);
  const started=performance.now();setTurns(t=>startAttempt(t,turnId,q,token.turn_id,started));
  requestAnimationFrame(()=>host.current?.querySelector<HTMLButtonElement>('[data-research-stop]')?.focus({preventScroll:true}));
  let received=false,focusComposer=false;
  try{
   if(!liveConfigured)throw Error('unavailable');
   const response=await fetch('/api/v3/research',{method:'POST',headers:{'Content-Type':'application/json','X-Research-Protocol':V3_RESEARCH_PROTOCOL},body:JSON.stringify({question:q,history:previous,identity:token}),signal:abort.signal});
   if(!response.ok){const data=await response.json();throw Error(data.error_code??'research_failed');}if(!response.body)throw Error('research_failed');
   const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
   const process=(line:string)=>{
    if(!line.trim())return;const event=JSON.parse(line) as V3Event;
    if(!matchesTurnEvent(event,token,active.current?.token.turn_id,received))return;
    const now=performance.now();
    if(event.type==='stage'){setTurns(t=>updateAttempt(t,turnId,token.turn_id,a=>addStage(a,event.stage,event.elapsed_ms,now)));return;}
    if(event.type==='finding'){setTurns(t=>updateAttempt(t,turnId,token.turn_id,a=>addFinding(a,event)));return;}
    if(event.type==='findings_reset'){setTurns(t=>updateAttempt(t,turnId,token.turn_id,resetFindings));closeInspection(Boolean(inspectionPane.current?.contains(document.activeElement)));return;}
    received=true;focusComposer=Boolean(document.activeElement?.hasAttribute('data-research-stop'));const result=event.result;
    const focused=document.activeElement instanceof HTMLElement&&document.activeElement.matches('.a3-inline-citation')&&document.activeElement.closest('.a3-qa')?.id==='turn-'+turnId?document.activeElement:null;
    const focusedCitation=focused?{turn:'turn-'+turnId,label:focused.getAttribute('aria-label')??'',finding:focused.closest('[data-finding-id]')?.getAttribute('data-finding-id')??undefined,line:focused.closest('[data-analysis-line]')?.getAttribute('data-analysis-line')??undefined}:null;
    // A source opened from developing findings must follow the final surviving
    // evidence, never retain a finding excluded by the complete dependency check.
    if(provisionalInspection.current){if(result.artifact){setInspection(result.artifact);setSelectedPassage(null);provisionalInspection.current=false;}else closeInspection();}
    // DESIGN-DECISION: D79 keeps completion in the thread. Inspection is user-selected.
    if(!result.artifact||!g.commit(token,result.artifact))g.fail(token);
    setTurns(t=>updateAttempt(t,turnId,token.turn_id,a=>finishAttempt(a,result,now)));
    // D89: inline analysis replaces the finding disclosure. Keep the exact
    // surviving bullet's citation focus when the completed body reconciles it.
    if(focusedCitation)requestAnimationFrame(()=>{(host.current?.querySelector<HTMLElement>(citationSelector(focusedCitation))??input.current)?.focus({preventScroll:true});});
   };
   try{while(true){const chunk=await reader.read();if(chunk.done)break;buffer+=decoder.decode(chunk.value,{stream:true});let index;while((index=buffer.indexOf('\n'))>=0){process(buffer.slice(0,index));buffer=buffer.slice(index+1);}}buffer+=decoder.decode();process(buffer);if(!received)throw Error('research_failed');}
   finally{
    // A client-side processing failure must release the server request too, rather
    // than leave paid generation running after the visible turn has failed.
    if(!received){abort.abort();await reader.cancel().catch(()=>{});}reader.releaseLock();
   }
  }catch(error){
   if(active.current?.token.turn_id===token.turn_id&&!received){g.fail(token);focusComposer=Boolean(document.activeElement?.hasAttribute('data-research-stop'));closeInspection(Boolean(inspectionPane.current?.contains(document.activeElement)));const code=researchFailureCode(error),now=performance.now();setTurns(t=>updateAttempt(t,turnId,token.turn_id,a=>finishAttempt(a,{status:'failed',error_code:code},now)));}
  }finally{if(active.current?.token.turn_id===token.turn_id){active.current=null;runningRef.current=false;setRunning(false);releaseRun(id);if(focusComposer)requestAnimationFrame(()=>input.current?.focus());}}
 }
 // Source provenance remains inspectable; D75's removed scope/banner copy stays removed.
 const composerProps={value,onChange:(v:string)=>{setValue(v);setInputError('');},onSubmit:()=>void run(),running,onStop:stop,error:inputError,inputRef:input};
 const composer=historyLoading?<Text as="p" style="secondary">Restoring saved research…</Text>:busyElsewhere?<div className="a3-composer-wrap"><Text as="p" style="secondary">Another session is researching. Your draft stays here.</Text><Button variant="link" onClick={onActiveResearch}>Return to active research</Button></div>:<Composer {...composerProps} placeholder="What would you like to understand about NVIDIA?"/>;
 const thread=<>{turns.length===0?<div className="a3-empty"><Text as="h1" style="display">Ask a question. Understand the business.</Text><Text as="p" style="secondary">Pressure-test your investment thesis—the reasons you believe in a company—against its earnings reports and company disclosures. Explore what supports your view, what challenges it and what deserves a closer look.</Text><div><Text as="h2" style="strong">Start with what you want to understand</Text><Text as="p" style="secondary">Ask about growth, profits, cash flow or a business development. You don’t need to know financial terminology or write a detailed prompt.</Text></div><div><Text as="h2" style="strong">Keep the conversation going</Text><Text as="p" style="secondary">Ask for a simpler explanation, challenge a conclusion or choose a suggested follow-up to dig deeper.</Text></div><div className="a3-examples"><Text style="meta">Start with a question</Text>{['How is NVIDIA’s revenue performing?','Why did cash flow fall while profits increased?',reference.question].map(q=><Button variant="link" key={q} disabled={busyElsewhere} onClick={()=>{setValue(q);input.current?.focus();}}>{q}</Button>)}</div></div>:turns.map(turn=>{
  const attempt=latestAttempt(turn),saved=turnArtifact(turn),failed=attempt&&['failed','check_failed','stopped'].includes(attempt.status);
  return <QABlock key={turn.id} id={`turn-${turn.id}`} question={turn.question}>
   {attempt&&<StepLog key={attempt.id} attempt={attempt} attemptNumber={turn.attempts.length}/>}
   {attempt?.status==='running'||(saved&&!failed)?<ResearchAnswer artifact={attempt?.status==='running'?undefined:saved??undefined} evidence={attempt?.developing} running={running||busyElsewhere} onSource={(source,passage)=>{const evidence=attempt?.status==='running'?attempt.developing:saved;if(evidence)inspect(evidence,source,passage);}} onInvestigate={q=>void run(q)}/>
   :failed?<><Outcome showStatus={false} status={attempt.status} message={recoveryMessage(attempt)} retry={!running&&!busyElsewhere&&canRetry(attempt)?()=>void run(turn.question,turn.id):undefined}/><EvidenceDiscrepancies discrepancies={attempt.discrepancies} sources={coverage.sources} onSource={id=>inspect({findings:[],facts:[],sources:coverage.sources,cutoff:coverage.cutoff},id)}/></>:<Text as="p"><FigureText text={attempt?.message??''}/></Text>}
   {turn.attempts.length>1&&<details className="a3-detail"><summary className="text-secondary">Previous attempts <FigureText text={`(${turn.attempts.length-1})`}/></summary><div className="a3-detail-content">{turn.attempts.slice(0,-1).map((prior,index)=><div key={prior.id}><Text style="meta"><FigureText text={`Attempt ${index+1}`}/></Text><StepLog attempt={prior}/><Text as="p" style="secondary">{recoveryMessage(prior)}</Text></div>)}</div></details>}
  </QABlock>;
 })}</>;
 const tabs=coverage.sources.map((s,i)=>({id:s.id,label:s.label,citation:i+1}));
 const workspace=inspection?<div id={`${id}-research-inspection`} className="a3-inspection" ref={inspectionPane} tabIndex={-1} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();closeInspection();}}}>
  <div className="a3-inspection-toolbar"><Text style="strong">Sources</Text><div className="a3-header-actions">{running&&<Button variant="outline" onClick={stop}>Stop research</Button>}<Button variant="quiet" onClick={()=>closeInspection()}>Close source</Button></div></div>
  <Tabs items={tabs} value={tab} onChange={source=>{setTab(source as SourceRef['id']);setSelectedPassage(null);}} id={`${id}-workspace`}/>{tabs.map(item=><div key={item.id} id={`${id}-workspace-panel-${item.id}`} role="tabpanel" aria-labelledby={`${id}-workspace-tab-${item.id}`} hidden={tab!==item.id} className="a3-brief-panel" tabIndex={0}><div className="a3-brief"><Text as="h2" style="title"><FigureText text={item.label}/></Text><Text as="p" style="meta"><FigureText text={`${coverage.sources.find(s=>s.id===item.id)?.date} · cutoff ${inspection.cutoff}`}/></Text>{groupPassages(inspection,item.id).map(({passage:p,quotes})=><div key={p.id}><SourcePassage idPrefix={`${id}-`} passage={p} quotes={quotes} source={{...coverage.sources.find(s=>s.id===p.source)!,url:sourceLocationUrl(coverage.sources.find(s=>s.id===p.source)!.url,p.quote)}} index={p.source==='current'?1:2}/>{inspection.facts.filter(f=>f.provenance.kind==='reported'&&f.provenance.paragraph_id===p.id).map(f=><FactBasis key={f.id} fact={f} facts={inspection.facts}/>)}</div>)}<a className="a3-source-link text-secondary" href={coverage.sources.find(s=>s.id===item.id)?.url} target="_blank" rel="noreferrer">Open original SEC release</a><Text as="p" style="secondary">{groupPassages(inspection,item.id).length?'Shown passages are the evidence cited by this answer.':'This citation supports code-owned financial facts. Inspect calculation basis in the thread for metric lineage.'} The full report remains available at the original source.</Text></div></div>)}</div>:null;
 return <div className="a3-session-app" ref={host} data-narrow={narrow}>
  {/* DESIGN-DECISION: No global Thread/Brief or layout navigation. The pane exists only after explicit inspection. */}
  <SessionHistoryBridge id={id} summary={summary} draft={value} turns={turns} onRestore={saved=>{setValue(saved.draft);setTurns(saved.turns);}}/>
  <WorkspaceLayout thread={thread} composer={composer} brief={workspace} narrow={narrow} threadRef={threadPane}/>
 </div>;
}
