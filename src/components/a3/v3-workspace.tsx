'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {Coverage,V3Artifact} from '../../lib/v3-display.ts';
import {emptyV3Session,sortedV3Sessions,updateV3Session,V3_SESSION_LIMIT,type V3SessionSummary} from '../../lib/v3-sessions.ts';
import {Button,FigureText,Text} from './primitives';
import {TickerChip} from './kit';
import V3ResearchSession from './v3-session';
type Props={coverage:Coverage;reference:V3Artifact;liveConfigured:boolean};
// Intent: analysts return to an existing thesis investigation or begin another.
// Domain: thesis, evidence, fiscal comparison, source lineage, investigation.
// Signature: question-titled sessions retain their own checked evidence and draft.
// Palette/depth: A3 white, paper grey, ink, source blue and status marks; hairlines.
// Typography/space: existing Geist/mono styles and A3's four-unit spacing scale.
// DESIGN-DECISION: D92 uses a centered index with RailItem-like ruled rows,
// rather than adding a permanent command rail or unsupported watchlist/commands.
export default function V3Workspace(props:Props){
 const [sessions,setSessions]=useState<V3SessionSummary[]>(()=>[emptyV3Session('initial-session',0)]);
 const [selected,setSelected]=useState<string|null>('initial-session'),[runningId,setRunningId]=useState<string|null>(null),[notice,setNotice]=useState(''),[narrow,setNarrow]=useState(false);
 const active=useRef<{id:string;stop:()=>void}|null>(null),host=useRef<HTMLDivElement>(null),indexTitle=useRef<HTMLHeadingElement>(null),scroll=useRef(new Map<string,number>());
 const onSummary=useCallback((id:string,patch:Partial<Omit<V3SessionSummary,'id'>>)=>setSessions(s=>updateV3Session(s,id,patch)),[]);
 const claimRun=useCallback((id:string,stop:()=>void)=>{if(active.current)return false;active.current={id,stop};setRunningId(id);return true;},[]);
 const releaseRun=useCallback((id:string)=>{if(active.current?.id===id){active.current=null;setRunningId(null);}},[]);
 useEffect(()=>{const el=host.current;if(!el)return;const observer=new ResizeObserver(entries=>{const css=getComputedStyle(el);setNarrow(entries[0].contentRect.width<parseFloat(css.getPropertyValue('--pane-min-w'))+parseFloat(css.getPropertyValue('--workspace-min-w')));});observer.observe(el);return()=>observer.disconnect();},[]);
 function open(id:string|null,isNew=false){
  if(selected)scroll.current.set(selected,window.scrollY);
  setSelected(id);setNotice('');
  requestAnimationFrame(()=>{
   const target=id?host.current?.querySelector<HTMLElement>(`[data-session-id="${CSS.escape(id)}"]`):indexTitle.current;
   if(isNew)target?.querySelector<HTMLTextAreaElement>('textarea')?.focus({preventScroll:true});else target?.focus({preventScroll:true});
   window.scrollTo({top:id?scroll.current.get(id)??0:0,behavior:'auto'});
  });
 }
 function createSession(){
  if(active.current)return;
  if(sessions.length>=V3_SESSION_LIMIT){open(null);setNotice('Session limit reached. Delete a session to start another.');return;}
  const id=crypto.randomUUID();setSessions(s=>[...s,emptyV3Session(id,Date.now())]);open(id,true);
 }
 function removeSession(id:string){
  if(active.current?.id===id)return;
  setSessions(s=>s.filter(item=>item.id!==id));scroll.current.delete(id);setNotice('Session deleted.');
  requestAnimationFrame(()=>indexTitle.current?.focus({preventScroll:true}));
 }
 const current=sessions.find(s=>s.id===selected),onActiveResearch=()=>{if(active.current)open(active.current.id);};
 return <div className="a3-app" ref={host} data-narrow={narrow}>
  <header className="a3-header a3-v3-header"><nav className="a3-brand" aria-label="Research navigation">
   <Button variant="icon" className="a3-home" onClick={()=>open(null)} aria-label="All research sessions"><span className="a3-logo" aria-hidden="true"/><Text style="strong">Research</Text></Button>
   <Button variant="icon" onClick={createSession} disabled={Boolean(runningId)} aria-label="New research session" title="New research session"><svg className="a3-nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9 3H3v10h10V7M8 8l5-5 1 1-5 5H8V8Z"/></svg></Button>
   <Text style="meta"><FigureText text="Prototype 3"/></Text>{current?.hasAnswer?<TickerChip coverage={props.coverage}/>:<Text style="secondary">{selected?'NVIDIA profitability':'All sessions'}</Text>}
  </nav>{runningId&&selected!==runningId&&<div className="a3-header-actions"><Button variant="link" onClick={onActiveResearch}>Return to active research</Button><Button variant="outline" onClick={()=>active.current?.stop()}>Stop research</Button></div>}</header>
  {selected===null&&<main className="a3-thread-layout a3-session-index" aria-labelledby="session-index-title"><div className="a3-session-index-heading"><h1 className="text-title" id="session-index-title" tabIndex={-1} ref={indexTitle}>Research sessions</h1><Button variant="outline" onClick={createSession} disabled={Boolean(runningId)}>New research</Button></div>
   <Text as="p" style="secondary">Available in this open app. Reloading or closing the page clears them.</Text>
   {notice&&<Text as="p" style="secondary" role="status">{notice}</Text>}
   {sessions.length?<ul className="a3-session-list" aria-label="Research sessions">{sortedV3Sessions(sessions).map(s=><li key={s.id} className="a3-session-row"><button className="a3-session-open" onClick={()=>open(s.id)} aria-label={`Open research session: ${s.title}`}><Text style="strong"><FigureText text={s.title}/></Text><Text style="meta"><FigureText text={`${s.outcome} · ${s.updatedAt?new Date(s.updatedAt).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'Just started'}`}/></Text></button><Button variant="icon" onClick={()=>removeSession(s.id)} disabled={runningId===s.id} aria-label={`Delete research session: ${s.title}`} title="Delete session"><svg className="a3-nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10M7 6v6M9 6v6"/></svg></Button></li>)}</ul>:<div className="a3-empty"><Text as="p" style="strong">No research sessions yet.</Text><Text as="p" style="secondary">Start with a public-company question.</Text></div>}
  </main>}
  {/* Keep each bounded memory-only session mounted so drafts, native disclosures,
      source focus and in-flight response ownership survive navigation. */}
  {sessions.map(s=><div key={s.id} className="a3-session-view" data-session-id={s.id} hidden={selected!==s.id} tabIndex={-1} aria-label={`Research session: ${s.title}`}><V3ResearchSession {...props} id={s.id} visible={selected===s.id} busyElsewhere={Boolean(runningId&&runningId!==s.id)} claimRun={claimRun} releaseRun={releaseRun} onSummary={onSummary} onActiveResearch={onActiveResearch}/></div>)}
  <footer className="a3-footer"><Text style="meta">Sessions clear on reload · Research support, not investment advice</Text></footer>
 </div>;
}
