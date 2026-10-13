'use client';
import {useEffect,useRef,useState} from 'react';
import {addStage,canRetry,finishAttempt,formatDuration,latestAttempt,recoveryMessage,researchHistory,startAttempt,turnArtifact,updateAttempt,type ResearchTurn} from '../../lib/v2-attempts.ts';
import {V2RevisionGate} from '../../lib/v2-revisions.ts';
import {factSegments,plainArtifactText,relatedRow,metricLabel,type Coverage,type V2Artifact,type V2Event,type SourceRef,type Passage} from '../../lib/v2-display.ts';
import {Button,FigureText,StatusSquare,Text} from './primitives';
import {Citation,CommandComposer,Composer,CoverageRow,DataTable,QABlock,RailItem,SourceList,SourcePassage,StepLog,Tabs,TickerChip} from './kit';
import {CommandLayout,ThreadLayout,WorkspaceLayout,type LayoutKind} from './layouts';
function groupPassages(artifact:V2Artifact|null,source:string){
 const groups=new Map<string,{passage:Passage;quotes:string[]}>();
 for(const passage of artifact?.findings.flatMap(f=>f.passages)??[]){if(passage.source!==source)continue;const existing=groups.get(passage.id);if(existing){if(!existing.quotes.includes(passage.quote))existing.quotes.push(passage.quote);}else groups.set(passage.id,{passage,quotes:[passage.quote]});}
 return [...groups.values()];
}
function FactProse({text,artifact}:{text:string;artifact:V2Artifact}){return <>{factSegments(text,artifact.facts).map((segment,i)=>segment.numeric?<Text key={i} style="data">{segment.text}</Text>:<FigureText key={i} text={segment.text}/>)}</>;}
function Outcome({status,message,retry}:{status:string;message:string;retry?:()=>void}){return <div className="a3-limit" role="status"><div className="a3-limit-status"><StatusSquare state={status==='failed'||status==='check_failed'?'failed':'idle'}/><Text style="meta">{status==='check_failed'?'Reference checks failed':status}</Text></div><Text as="p" style="secondary">{message}</Text>{retry&&<Button variant="quiet" onClick={retry}>Retry research</Button>}</div>;}
function Brief({artifact,onSource,onInvestigate,running,elapsedMs}:{elapsedMs?:number;artifact:V2Artifact;onSource:(id:SourceRef['id'],passage?:string)=>void;onInvestigate:(question:string)=>void;running:boolean}){
 const bridge=artifact.facts.filter(f=>f.metric==='cash_bridge'&&f.period==='current');
 const total=artifact.facts.find(f=>f.id==='NVDA:cash_bridge:total:qoq');
 return <div className="a3-brief"><header className="a3-brief-header"><Text as="h1" style="title">NVDA</Text><Text style="meta"><FigureText text={`FY2027 Q2 vs Q1 · revision ${artifact.revision} · cutoff ${artifact.cutoff}`}/></Text>{elapsedMs!==undefined&&<Text style="meta"><FigureText text={`Completed in ${formatDuration(elapsedMs)}`}/></Text>}{artifact.origin==='saved_reference'&&<Text as="p" style="secondary">Saved, authored reference using frozen sources. This is not a new model run.</Text>}<Text style="meta">Research question</Text><Text as="p" style="strong"><FigureText text={artifact.question}/></Text></header>
  <div className="a3-takeaway"><Text style="meta">Interpretation</Text><Text as="p" style="strong"><FactProse text={artifact.takeaway} artifact={artifact}/></Text></div>
  {artifact.answer_kind==='source_limited'&&<Outcome status="unresolved" message="The available reports leave part of this question unanswered. Review the specific evidence needed below."/>}
  {artifact.status==='partial'&&<Outcome status="partial" message="Some generated content failed reference checks and was excluded. Review the surviving evidence and limitations."/>}
  {artifact.rows.length>0&&<DataTable rows={artifact.rows} signalFactId={artifact.rows[0].id}/>}
  <div className="a3-findings">{artifact.findings.map(finding=><article key={finding.id}><Text style="meta">Interpretation · supporting or qualifying evidence</Text><Text as="p"><FactProse text={finding.text} artifact={artifact}/></Text>{finding.passages.length>0&&<div className="a3-evidence-links"><Text style="secondary">Reported evidence</Text>{finding.passages.map(p=>{const source=artifact.sources.find(s=>s.id===p.source)!;return <Citation key={p.id} index={p.source==='current'?1:2} source={source} onOpen={()=>onSource(source.id,p.id)}/>;})}</div>}</article>)}</div>
  {artifact.rows.length>0&&<details className="a3-detail"><summary className="text-secondary">Inspect calculation basis</summary><div className="a3-detail-content">{artifact.rows.map(row=><div key={row.id}><Text as="p" style="strong">{row.label}</Text><Text as="p" style="secondary">Calculated comparison · {row.change?.basis??row.current.basis}</Text><Text as="p" style="meta"><FigureText text={row.current.source_ids.join(' / ')}/></Text>{row.current.source_ids.map(id=>{const fact=artifact.facts.find(f=>f.id===id);return fact?<Text as="p" key={id} style="data">{metricLabel(fact)}: {fact.display}</Text>:null;})}</div>)}<Text as="p" style="secondary">GAAP operating margin is operating income divided by same-quarter revenue. Changes use unrounded values; displayed differences use percentage points.</Text></div></details>}
  {bridge.length>0&&<details className="a3-detail"><summary className="text-secondary">Inspect complete cash-flow bridge</summary><div className="a3-detail-content"><Text as="p" style="secondary">Calculated · all operating cash-flow components reconcile to the reported totals. Component adjustments are accounting contributions, not balances or proof of business causes.</Text><DataTable variant="bridge" rows={bridge.map(f=>relatedRow(f,artifact.facts))}/><SourceList sources={artifact.sources} onOpen={onSource}/>{total&&<Text as="p" style="data">Total quarterly change: {total.display}</Text>}</div></details>}
  {artifact.unanswered.length>0&&<div className="a3-unanswered"><Text style="strong">What remains unanswered</Text>{artifact.unanswered.map((question,i)=><Text as="p" style="secondary" key={i}><FactProse text={question} artifact={artifact}/></Text>)}</div>}
  {/* DESIGN-DECISION: PRD allows zero or one suggestion, replacing the canvas’s two follow-up rows. */}
  {artifact.next&&<div className="a3-next"><Text style="strong">Next investigation</Text><Text as="p" style="secondary"><FigureText text={artifact.next.question}/></Text><Button variant="quiet" disabled={running} onClick={()=>onInvestigate(artifact.next!.question)}>{artifact.next.label}</Button></div>}
  <SourceList sources={artifact.sources} onOpen={onSource}/><Text as="p" style="meta">Reference checks passed. Interpretation still requires review.</Text>
 </div>;
}
export default function V2Workspace({coverage,reference,liveConfigured}:{coverage:Coverage;reference:V2Artifact;liveConfigured:boolean}){
 const [layout,setLayout]=useState<LayoutKind>('thread'),[value,setValue]=useState(''),[artifact,setArtifact]=useState<V2Artifact|null>(null),[turns,setTurns]=useState<ResearchTurn[]>([]),[running,setRunning]=useState(false),[inputError,setInputError]=useState(''),[tab,setTab]=useState('brief'),[mobileView,setMobileView]=useState<'thread'|'brief'>('thread'),[narrow,setNarrow]=useState(false),[selectedPassage,setSelectedPassage]=useState<string|null>(null);
 const host=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null),gate=useRef<V2RevisionGate<V2Artifact>|null>(null),active=useRef<{token:ReturnType<V2RevisionGate<V2Artifact>['begin']>;abort:AbortController;turnId:string}|null>(null),runningRef=useRef(false);
 const session=()=>{if(!gate.current)gate.current=new V2RevisionGate(crypto.randomUUID());return gate.current;};
 useEffect(()=>{const el=host.current;if(!el)return;const observer=new ResizeObserver(entries=>{const css=getComputedStyle(el);const threshold=parseFloat(css.getPropertyValue('--pane-min-w'))+parseFloat(css.getPropertyValue('--workspace-min-w'));setNarrow(entries[0].contentRect.width<threshold);});observer.observe(el);return()=>observer.disconnect();},[]);
 useEffect(()=>()=>active.current?.abort.abort(),[]);
 useEffect(()=>{if(!selectedPassage)return;const el=document.getElementById(`passage-${selectedPassage.replaceAll(':','-')}`);el?.scrollIntoView({block:'nearest',behavior:'auto'});el?.focus();},[selectedPassage,tab,layout,mobileView]);
 function openSource(id:SourceRef['id'],passage?:string){setLayout('workspace');setMobileView('brief');setTab(id);setSelectedPassage(passage??null);}
 function stop(){
  const current=active.current;if(!current)return;
  session().stop(current.token);current.abort.abort();active.current=null;runningRef.current=false;setRunning(false);
  const now=performance.now();setTurns(t=>updateAttempt(t,current.turnId,current.token.turn_id,a=>finishAttempt(a,{status:'stopped',error_code:'stopped'},now)));
 }
 function reset(){stop();gate.current=null;setArtifact(null);setTurns([]);setValue('');setInputError('');setTab('brief');setMobileView('thread');setLayout('thread');input.current?.focus();}
 function showReference(){
  if(runningRef.current)return;const g=session(),token=g.begin(crypto.randomUUID()),saved={...reference,revision:token.revision};g.commit(token,saved);setArtifact(saved);
  setTurns(t=>[...t,{id:token.turn_id,question:saved.question,history:researchHistory(t),attempts:[],reference:saved}]);setLayout('workspace');setMobileView('brief');setTab('brief');
 }
 function inspect(saved:V2Artifact){setArtifact(saved);setLayout('workspace');setMobileView('brief');setTab('brief');setSelectedPassage(null);}
 async function run(question=value,retryTurnId?:string){
  if(runningRef.current)return;const q=question.trim();if(!q){setInputError('Enter a research question.');return;}
  const retryTurn=retryTurnId?turns.find(t=>t.id===retryTurnId):undefined;
  if(retryTurnId&&(!retryTurn||!latestAttempt(retryTurn)||!canRetry(latestAttempt(retryTurn)!)))return;
  const turnId=retryTurnId??crypto.randomUUID(),g=session(),token=g.begin(crypto.randomUUID()),abort=new AbortController();
  active.current={token,abort,turnId};runningRef.current=true;setRunning(true);setInputError('');if(!retryTurnId)setValue('');setMobileView('thread');
  const started=performance.now();setTurns(t=>startAttempt(t,turnId,q,token.turn_id,started));
  const previous=retryTurn?.history??researchHistory(turns);
  let received=false;
  try{
   if(!liveConfigured)throw Error('unavailable');
   const response=await fetch('/api/v2/research',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,history:previous,identity:token}),signal:abort.signal});
   if(!response.ok){const data=await response.json();throw Error(data.error_code??'research_failed');}if(!response.body)throw Error('research_failed');
   const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
   const process=(line:string)=>{
    if(!line.trim())return;const event=JSON.parse(line) as V2Event;
    const identity=event.type==='stage'?event.identity:event.result.identity;
    if(identity.session_id!==token.session_id||identity.turn_id!==token.turn_id||identity.revision!==token.revision||active.current?.token.turn_id!==token.turn_id||received)return;
    const now=performance.now();
    if(event.type==='stage'){setTurns(t=>updateAttempt(t,turnId,token.turn_id,a=>addStage(a,event.stage,event.elapsed_ms,now)));return;}
    received=true;const result=event.result;
    if(result.artifact&&g.commit(token,result.artifact)){setArtifact(result.artifact);setTab('brief');setLayout('workspace');setMobileView('brief');}
    else g.fail(token);
    setTurns(t=>updateAttempt(t,turnId,token.turn_id,a=>finishAttempt(a,result,now)));
   };
   try{while(true){const chunk=await reader.read();if(chunk.done)break;buffer+=decoder.decode(chunk.value,{stream:true});let index;while((index=buffer.indexOf('\n'))>=0){process(buffer.slice(0,index));buffer=buffer.slice(index+1);}}buffer+=decoder.decode();process(buffer);if(!received)throw Error('research_failed');}
   finally{reader.releaseLock();}
  }catch(error){
   if(active.current?.token.turn_id===token.turn_id&&!received){g.fail(token);const code=error instanceof Error?error.message:'research_failed',now=performance.now();setTurns(t=>updateAttempt(t,turnId,token.turn_id,a=>finishAttempt(a,{status:'failed',error_code:code},now)));}
  }finally{if(active.current?.token.turn_id===token.turn_id){active.current=null;runningRef.current=false;setRunning(false);}}
 }
 // DESIGN-DECISION: D75 removes composer scope copy and the header evidence badge.
 // Source dates and calculation basis remain inspectable in the brief and source tabs.
 const composerProps={value,onChange:(v:string)=>{setValue(v);setInputError('');},onSubmit:()=>void run(),running,onStop:stop,error:inputError,inputRef:input};
 const composer=layout==='command'?<CommandComposer {...composerProps} actions={[]}/>:<Composer {...composerProps}/>;
 const selectedAttempt=turns.flatMap(t=>t.attempts).find(a=>a.artifact?.revision===artifact?.revision);
 const brief=artifact?<Brief elapsedMs={selectedAttempt?.endedAt!==undefined?selectedAttempt.endedAt-selectedAttempt.startedAt:undefined} artifact={artifact} running={running} onSource={openSource} onInvestigate={q=>void run(q)}/>:null;
 const thread=<>{turns.length===0?<div className="a3-empty"><Text as="h1" style="display">A question. The evidence. A sharper thesis.</Text><Text as="p" style="secondary">Pressure-test NVIDIA’s operating profitability using two frozen SEC reports. Ask what supports your premise, what challenges it and what remains unanswered.</Text><div className="a3-examples"><Text style="meta">Start with a question</Text>{[reference.question,'Why did cash flow fall? Does that mean margins are deteriorating?'].map(q=><Button variant="link" key={q} onClick={()=>{setValue(q);input.current?.focus();}}>{q}</Button>)}<Button variant="quiet" onClick={showReference}>View saved reference</Button></div></div>:turns.map(turn=>{
  const attempt=latestAttempt(turn),saved=turnArtifact(turn),failed=attempt&&['failed','check_failed','stopped'].includes(attempt.status);
  return <QABlock key={turn.id} id={`turn-${turn.id}`} question={turn.question}>
   {attempt&&<><Text style="meta"><FigureText text={`Attempt ${turn.attempts.length}${turn.attempts.length>1?' · Same question and conversation context':''}`}/></Text><StepLog key={attempt.id} attempt={attempt}/></>}
   {attempt?.status==='running'?<Text as="p" style="secondary">The answer will appear after reference checks.</Text>:failed?<Outcome status={attempt.status} message={recoveryMessage(attempt)} retry={!running&&canRetry(attempt)?()=>void run(turn.question,turn.id):undefined}/>:<Text as="p"><FigureText text={saved?plainArtifactText(saved):attempt?.message??''}/></Text>}
   {failed&&['unavailable','spend_limit'].includes(attempt.errorCode??'')&&<Button variant="quiet" disabled={running} onClick={showReference}>View saved reference</Button>}
   {saved&&<><Button variant="quiet" onClick={()=>inspect(saved)}>Open this brief</Button>{turn.id===turns.at(-1)?.id&&layout!=='workspace'&&<Brief elapsedMs={attempt?.endedAt!==undefined?attempt.endedAt-attempt.startedAt:undefined} artifact={saved} running={running} onSource={(id,passage)=>{setArtifact(saved);openSource(id,passage);}} onInvestigate={q=>void run(q)}/>}</>}
   {turn.attempts.length>1&&<details className="a3-detail"><summary className="text-secondary">Previous attempts <FigureText text={`(${turn.attempts.length-1})`}/></summary><div className="a3-detail-content">{turn.attempts.slice(0,-1).map((prior,index)=><div key={prior.id}><Text style="meta"><FigureText text={`Attempt ${index+1}`}/></Text><StepLog attempt={prior}/><Text as="p" style="secondary">{recoveryMessage(prior)}</Text></div>)}</div></details>}
  </QABlock>;
 })}{composer}</>;
 const tabs=[{id:'brief',label:'Brief'},...coverage.sources.map((s,i)=>({id:s.id,label:s.label,citation:i+1}))];
 const workspace=<><Tabs items={tabs} value={tab} onChange={setTab} id="workspace"/>{tabs.map(item=><div key={item.id} id={`workspace-panel-${item.id}`} role="tabpanel" aria-labelledby={`workspace-tab-${item.id}`} hidden={tab!==item.id} className="a3-brief-panel" tabIndex={0}>{item.id==='brief'?brief:<div className="a3-brief"><Text as="h2" style="title"><FigureText text={item.label}/></Text>{groupPassages(artifact,item.id).map(({passage:p,quotes})=><SourcePassage key={p.id} passage={p} quotes={quotes} source={coverage.sources.find(s=>s.id===p.source)!} index={p.source==='current'?1:2}/>)}<a className="a3-source-link text-secondary" href={coverage.sources.find(s=>s.id===item.id)?.url} target="_blank" rel="noreferrer">Open original SEC release</a><Text as="p" style="secondary">Shown passages are the evidence cited by this brief. The full report remains available at the original source.</Text></div>}</div>)}</>;
 return <div className="a3-app" ref={host} data-narrow={narrow}><header className="a3-header"><div className="a3-brand"><span className="a3-logo" aria-hidden="true"/><Text style="strong">Research</Text>{artifact?<TickerChip coverage={coverage}/>:<Text style="secondary">NVIDIA profitability</Text>}</div><div className="a3-header-actions"><Button variant="outline" onClick={reset} disabled={running}>New session</Button></div></header>
  {layout==='workspace'&&<div className="a3-mobile-switch"><Tabs id="view" items={[{id:'thread',label:'Thread'},{id:'brief',label:'Brief'}]} value={mobileView} onChange={id=>setMobileView(id as 'thread'|'brief')}/></div>}
  {layout==='workspace'?<WorkspaceLayout thread={thread} brief={workspace} mobileView={mobileView}/>:layout==='command'?<CommandLayout rail={<><Text style="meta">Current session</Text>{turns.map(turn=><RailItem key={turn.id} active={turn.id===turns.at(-1)?.id} onClick={()=>document.getElementById(`turn-${turn.id}`)?.scrollIntoView({block:'start'})}><FigureText text={turn.question}/></RailItem>)}<Text style="meta">Coverage</Text><CoverageRow coverage={coverage}/><Text as="p" style="secondary">This session is lost when you reload.</Text></>}>{thread}</CommandLayout>:<ThreadLayout>{thread}</ThreadLayout>}
  <footer className="a3-footer"><Text style="meta">Session is lost on reload · Research support, not investment advice</Text><nav aria-label="Layout"><Button variant="link" aria-pressed={layout==='thread'} onClick={()=>setLayout('thread')}>Thread</Button>{artifact&&<Button variant="link" aria-pressed={layout==='workspace'} onClick={()=>setLayout('workspace')}>Workspace</Button>}<Button variant="link" aria-pressed={layout==='command'} onClick={()=>setLayout('command')}>Command</Button></nav></footer>
 </div>;
}
