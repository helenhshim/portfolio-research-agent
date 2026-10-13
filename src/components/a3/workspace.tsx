'use client';
import {useEffect,useRef,useState} from 'react';
import {addStage,addFinding,resetFindings,matchesTurnEvent,researchFailureCode,canRetry,finishAttempt,latestAttempt,recoveryMessage,researchHistory,startAttempt,turnArtifact,updateAttempt,type ResearchTurn} from '../../lib/v2-attempts.ts';
import {V2RevisionGate} from '../../lib/v2-revisions.ts';
import {V2_RESEARCH_PROTOCOL,type Coverage,type V2Artifact,type V2Evidence,type V2Event,type SourceRef,type Passage} from '../../lib/v2-display.ts';
import {Button,FigureText,Text} from './primitives';
import {Composer,QABlock,SourcePassage,StepLog,Tabs,TickerChip} from './kit';
import {WorkspaceLayout} from './layouts';
import {Outcome,ResearchAnswer,ResearchFindings} from './research-answer';
function groupPassages(artifact:V2Evidence|null,source:string){
 const groups=new Map<string,{passage:Passage;quotes:string[]}>();
 for(const passage of artifact?.findings.flatMap(f=>f.passages)??[]){if(passage.source!==source)continue;const existing=groups.get(passage.id);if(existing){if(!existing.quotes.includes(passage.quote))existing.quotes.push(passage.quote);}else groups.set(passage.id,{passage,quotes:[passage.quote]});}
 return [...groups.values()];
}
export default function V2Workspace({coverage,reference,liveConfigured}:{coverage:Coverage;reference:V2Artifact;liveConfigured:boolean}){
 const [value,setValue]=useState(''),[inspection,setInspection]=useState<V2Evidence|null>(null),[turns,setTurns]=useState<ResearchTurn[]>([]),[running,setRunning]=useState(false),[inputError,setInputError]=useState(''),[tab,setTab]=useState<SourceRef['id']>('current'),[narrow,setNarrow]=useState(false),[selectedPassage,setSelectedPassage]=useState<string|null>(null);
 const host=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null),gate=useRef<V2RevisionGate<V2Artifact>|null>(null),active=useRef<{token:ReturnType<V2RevisionGate<V2Artifact>['begin']>;abort:AbortController;turnId:string}|null>(null),runningRef=useRef(false),provisionalInspection=useRef(false),inspectionPane=useRef<HTMLDivElement>(null),threadPane=useRef<HTMLElement>(null),opener=useRef<HTMLElement|null>(null),position=useRef({window:0,pane:0});
 const session=()=>{if(!gate.current)gate.current=new V2RevisionGate(crypto.randomUUID());return gate.current;};
 const openerLocation=useRef<{turn:string;label:string}|null>(null);
 useEffect(()=>{const el=host.current;if(!el)return;const observer=new ResizeObserver(entries=>{const css=getComputedStyle(el);const threshold=parseFloat(css.getPropertyValue('--pane-min-w'))+parseFloat(css.getPropertyValue('--workspace-min-w'));setNarrow(entries[0].contentRect.width<threshold);});observer.observe(el);return()=>observer.disconnect();},[]);
 useEffect(()=>()=>active.current?.abort.abort(),[]);
 useEffect(()=>{
  if(!inspection)return;
  if(!selectedPassage&&inspectionPane.current?.contains(document.activeElement))return;
  const el=selectedPassage?document.getElementById(`passage-${selectedPassage.replaceAll(':','-')}`):inspectionPane.current;
  el?.focus({preventScroll:true});if(selectedPassage)el?.scrollIntoView({block:'nearest',behavior:'auto'});
 },[inspection,selectedPassage,tab,narrow]);
 function inspect(saved:V2Evidence,id:SourceRef['id'],passage?:string){
  // Capture only thread-origin openers so switching source tabs does not lose the return target.
  if(!inspectionPane.current?.contains(document.activeElement)){
   opener.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
   const turn=opener.current?.closest('.a3-qa')?.id,label=opener.current?.getAttribute('aria-label');openerLocation.current=turn&&label?{turn,label}:null;
   position.current={window:window.scrollY,pane:threadPane.current?.scrollTop??0};
  }
  provisionalInspection.current=!('takeaway' in saved);setInspection(saved);setTab(id);setSelectedPassage(passage??null);
 }
 function closeInspection(restore=true){
  provisionalInspection.current=false;setInspection(null);setSelectedPassage(null);
  if(restore)requestAnimationFrame(()=>{const location=openerLocation.current;const surviving=location?host.current?.querySelector<HTMLElement>(`#${CSS.escape(location.turn)} button[aria-label="${CSS.escape(location.label)}"]`):null;const target=opener.current?.isConnected?opener.current:surviving??input.current;target?.focus({preventScroll:true});window.scrollTo({top:position.current.window,behavior:'auto'});if(threadPane.current)threadPane.current.scrollTop=position.current.pane;});
 }
 function stop(){
  const current=active.current;if(!current)return;
  session().stop(current.token);current.abort.abort();active.current=null;runningRef.current=false;setRunning(false);closeInspection();
  const now=performance.now();setTurns(t=>updateAttempt(t,current.turnId,current.token.turn_id,a=>finishAttempt(a,{status:'stopped',error_code:'stopped'},now)));
 }
 function reset(){stop();gate.current=null;setInspection(null);setTurns([]);setValue('');setInputError('');setTab('current');requestAnimationFrame(()=>input.current?.focus());}
 function showReference(){
  if(runningRef.current)return;const g=session(),token=g.begin(crypto.randomUUID()),saved={...reference,revision:token.revision};g.commit(token,saved);
  setTurns(t=>[...t,{id:token.turn_id,question:saved.question,history:researchHistory(t),attempts:[],reference:saved}]);closeInspection(false);
 }
 async function run(question=value,retryTurnId?:string){
  if(runningRef.current)return;const q=question.trim();if(!q){setInputError('Enter a research question.');return;}
  const retryTurn=retryTurnId?turns.find(t=>t.id===retryTurnId):undefined;
  if(retryTurnId&&(!retryTurn||!latestAttempt(retryTurn)||!canRetry(latestAttempt(retryTurn)!)))return;
  const turnId=retryTurnId??crypto.randomUUID(),g=session(),token=g.begin(crypto.randomUUID()),abort=new AbortController();
  active.current={token,abort,turnId};runningRef.current=true;setRunning(true);setInputError('');if(!retryTurnId)setValue('');closeInspection(false);
  const started=performance.now();setTurns(t=>startAttempt(t,turnId,q,token.turn_id,started));
  requestAnimationFrame(()=>host.current?.querySelector<HTMLButtonElement>('[data-research-stop]')?.focus({preventScroll:true}));
  const previous=retryTurn?.history??researchHistory(turns);
  let received=false,focusComposer=false;
  try{
   if(!liveConfigured)throw Error('unavailable');
   const response=await fetch('/api/v2/research',{method:'POST',headers:{'Content-Type':'application/json','X-Research-Protocol':V2_RESEARCH_PROTOCOL},body:JSON.stringify({question:q,history:previous,identity:token}),signal:abort.signal});
   if(!response.ok){const data=await response.json();throw Error(data.error_code??'research_failed');}if(!response.body)throw Error('research_failed');
   const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
   const process=(line:string)=>{
    if(!line.trim())return;const event=JSON.parse(line) as V2Event;
    if(!matchesTurnEvent(event,token,active.current?.token.turn_id,received))return;
    const now=performance.now();
    if(event.type==='stage'){setTurns(t=>updateAttempt(t,turnId,token.turn_id,a=>addStage(a,event.stage,event.elapsed_ms,now)));return;}
    if(event.type==='finding'){setTurns(t=>updateAttempt(t,turnId,token.turn_id,a=>addFinding(a,event)));return;}
    if(event.type==='findings_reset'){setTurns(t=>updateAttempt(t,turnId,token.turn_id,resetFindings));closeInspection(Boolean(inspectionPane.current?.contains(document.activeElement)));return;}
    received=true;focusComposer=Boolean(document.activeElement?.hasAttribute('data-research-stop'));const result=event.result;
    // A source opened from developing findings must follow the final surviving
    // evidence, never retain a finding excluded by the complete dependency check.
    if(provisionalInspection.current){if(result.artifact){setInspection(result.artifact);setSelectedPassage(null);provisionalInspection.current=false;}else closeInspection();}
    // DESIGN-DECISION: D79 keeps completion in the thread. Inspection is user-selected.
    if(!result.artifact||!g.commit(token,result.artifact))g.fail(token);
    setTurns(t=>updateAttempt(t,turnId,token.turn_id,a=>finishAttempt(a,result,now)));
   };
   try{while(true){const chunk=await reader.read();if(chunk.done)break;buffer+=decoder.decode(chunk.value,{stream:true});let index;while((index=buffer.indexOf('\n'))>=0){process(buffer.slice(0,index));buffer=buffer.slice(index+1);}}buffer+=decoder.decode();process(buffer);if(!received)throw Error('research_failed');}
   finally{
    // A client-side processing failure must release the server request too, rather
    // than leave paid generation running after the visible turn has failed.
    if(!received){abort.abort();await reader.cancel().catch(()=>{});}reader.releaseLock();
   }
  }catch(error){
   if(active.current?.token.turn_id===token.turn_id&&!received){g.fail(token);focusComposer=Boolean(document.activeElement?.hasAttribute('data-research-stop'));closeInspection(Boolean(inspectionPane.current?.contains(document.activeElement)));const code=researchFailureCode(error),now=performance.now();setTurns(t=>updateAttempt(t,turnId,token.turn_id,a=>finishAttempt(a,{status:'failed',error_code:code},now)));}
  }finally{if(active.current?.token.turn_id===token.turn_id){active.current=null;runningRef.current=false;setRunning(false);if(focusComposer)requestAnimationFrame(()=>input.current?.focus());}}
 }
 // Source provenance remains inspectable; D75's removed scope/banner copy stays removed.
 const composerProps={value,onChange:(v:string)=>{setValue(v);setInputError('');},onSubmit:()=>void run(),running,onStop:stop,error:inputError,inputRef:input};
 const composer=<Composer {...composerProps}/>;
 const signalRevision=turns.reduce((revision,turn)=>Math.max(revision,turnArtifact(turn)?.revision??0),0);
 const thread=<>{turns.length===0?<div className="a3-empty"><Text as="h1" style="display">A question. The evidence. A sharper thesis.</Text><Text as="p" style="secondary">Pressure-test NVIDIA’s operating profitability using two frozen SEC reports. Ask what supports your premise, what challenges it and what remains unanswered.</Text><div className="a3-examples"><Text style="meta">Start with a question</Text>{[reference.question,'Why did cash flow fall? Does that mean margins are deteriorating?'].map(q=><Button variant="link" key={q} onClick={()=>{setValue(q);input.current?.focus();}}>{q}</Button>)}<Button variant="quiet" onClick={showReference}>View saved reference</Button></div></div>:turns.map(turn=>{
  const attempt=latestAttempt(turn),saved=turnArtifact(turn),failed=attempt&&['failed','check_failed','stopped'].includes(attempt.status);
  return <QABlock key={turn.id} id={`turn-${turn.id}`} question={turn.question}>
   {attempt&&<><Text style="meta"><FigureText text={`Attempt ${turn.attempts.length}${turn.attempts.length>1?' · Same question and conversation context':''}`}/></Text><StepLog key={attempt.id} attempt={attempt}/></>}
   {attempt?.status==='running'?attempt.developing?<><Text as="p" style="secondary">References checked for the findings below. The answer is still developing; interpretation requires review.</Text><ResearchFindings evidence={attempt.developing} developing onSource={(id,passage)=>inspect(attempt.developing!,id,passage)}/></>:<Text as="p" style="secondary">Complete findings will appear as their references pass checks.</Text>:failed?<Outcome showStatus={false} status={attempt.status} message={recoveryMessage(attempt)} retry={!running&&canRetry(attempt)?()=>void run(turn.question,turn.id):undefined}/>:saved?<ResearchAnswer artifact={saved} running={running} highlight={!inspection&&saved.revision===signalRevision} onSource={(id,passage)=>inspect(saved,id,passage)} onInvestigate={q=>void run(q)}/>:<Text as="p"><FigureText text={attempt?.message??''}/></Text>}
   {failed&&['unavailable','spend_limit'].includes(attempt.errorCode??'')&&<Button variant="quiet" disabled={running} onClick={showReference}>View saved reference</Button>}
   {turn.attempts.length>1&&<details className="a3-detail"><summary className="text-secondary">Previous attempts <FigureText text={`(${turn.attempts.length-1})`}/></summary><div className="a3-detail-content">{turn.attempts.slice(0,-1).map((prior,index)=><div key={prior.id}><Text style="meta"><FigureText text={`Attempt ${index+1}`}/></Text><StepLog attempt={prior}/><Text as="p" style="secondary">{recoveryMessage(prior)}</Text></div>)}</div></details>}
  </QABlock>;
 })}{composer}</>;
 const tabs=coverage.sources.map((s,i)=>({id:s.id,label:s.label,citation:i+1}));
 const workspace=inspection?<div id="research-inspection" className="a3-inspection" ref={inspectionPane} tabIndex={-1} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();closeInspection();}}}>
  <div className="a3-inspection-toolbar"><Text style="strong">Sources</Text><div className="a3-header-actions">{running&&<Button variant="outline" onClick={stop}>Stop research</Button>}<Button variant="quiet" onClick={()=>closeInspection()}>Close source</Button></div></div>
  <Tabs items={tabs} value={tab} onChange={id=>{setTab(id as SourceRef['id']);setSelectedPassage(null);}} id="workspace"/>{tabs.map(item=><div key={item.id} id={`workspace-panel-${item.id}`} role="tabpanel" aria-labelledby={`workspace-tab-${item.id}`} hidden={tab!==item.id} className="a3-brief-panel" tabIndex={0}><div className="a3-brief"><Text as="h2" style="title"><FigureText text={item.label}/></Text><Text as="p" style="meta"><FigureText text={`${coverage.sources.find(s=>s.id===item.id)?.date} · cutoff ${inspection.cutoff}`}/></Text>{groupPassages(inspection,item.id).map(({passage:p,quotes})=><SourcePassage key={p.id} passage={p} quotes={quotes} source={coverage.sources.find(s=>s.id===p.source)!} index={p.source==='current'?1:2}/>)}<a className="a3-source-link text-secondary" href={coverage.sources.find(s=>s.id===item.id)?.url} target="_blank" rel="noreferrer">Open original SEC release</a><Text as="p" style="secondary">{groupPassages(inspection,item.id).length?'Shown passages are the evidence cited by this answer.':'This citation supports code-owned financial facts. Inspect calculation basis in the thread for metric lineage.'} The full report remains available at the original source.</Text></div></div>)}</div>:null;
 return <div className="a3-app" ref={host} data-narrow={narrow}><header className="a3-header"><div className="a3-brand"><span className="a3-logo" aria-hidden="true"/><Text style="strong">Research</Text>{turns.some(t=>turnArtifact(t))?<TickerChip coverage={coverage}/>:<Text style="secondary">NVIDIA profitability</Text>}</div><div className="a3-header-actions"><Button variant="outline" onClick={reset} disabled={running}>New session</Button></div></header>
  {/* DESIGN-DECISION: No global Thread/Brief or layout navigation. The pane exists only after explicit inspection. */}
  <WorkspaceLayout thread={thread} brief={workspace} narrow={narrow} threadRef={threadPane}/>
  <footer className="a3-footer"><Text style="meta">Session is lost on reload · Research support, not investment advice</Text></footer>
 </div>;
}
