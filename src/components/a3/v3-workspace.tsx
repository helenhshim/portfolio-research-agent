'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {Coverage,V3Artifact} from '../../lib/v3-display.ts';
import {emptyV3Session,sortedV3Sessions,updateV3Session,V3_SESSION_LIMIT,type V3SessionSummary} from '../../lib/v3-sessions.ts';
import {Button,FigureText,Text} from './primitives';
import V3ResearchSession from './v3-session';
import V3Navigation from './v3-navigation';
import {WorkspaceHistoryBridge,clearSavedHistory} from './v3-history-bridge';
type Props={coverage:Coverage;reference:V3Artifact;liveConfigured:boolean};
// Intent: analysts return to an existing thesis investigation or begin another.
// Domain: thesis, evidence, fiscal comparison, source lineage, investigation.
// Signature: question-titled sessions retain their own checked evidence and draft.
// Palette/depth: A3 white, paper grey, ink, source blue and status marks; hairlines.
// Typography/space: existing Geist/mono styles and A3's four-unit spacing scale.
// DESIGN-DECISION: D93 adds the collapsible 06c session rail; checked answers
// retain 06a/06b; D95 adds bounded browser restoration to D92 ownership.
export default function V3Workspace(props:Props){
 const [sessions,setSessions]=useState<V3SessionSummary[]>(()=>[emptyV3Session('initial-session',0)]);
 const [selected,setSelected]=useState<string|null>('initial-session'),[runningId,setRunningId]=useState<string|null>(null),[notice,setNotice]=useState('Restoring saved history…'),[narrow,setNarrow]=useState(false);
 const active=useRef<{id:string;stop:()=>void}|null>(null),host=useRef<HTMLDivElement>(null),indexTitle=useRef<HTMLHeadingElement>(null),scroll=useRef(new Map<string,number>());
 const onSummary=useCallback((id:string,patch:Partial<Omit<V3SessionSummary,'id'>>)=>setSessions(s=>updateV3Session(s,id,patch)),[]);
 const claimRun=useCallback((id:string,stop:()=>void)=>{if(active.current)return false;active.current={id,stop};setRunningId(id);return true;},[]);
 const releaseRun=useCallback((id:string)=>{if(active.current?.id===id){active.current=null;setRunningId(null);}},[]);
 useEffect(()=>{const el=host.current;if(!el)return;const observer=new ResizeObserver(entries=>{const css=getComputedStyle(el);setNarrow(entries[0].contentRect.width<parseFloat(css.getPropertyValue('--pane-min-w'))+parseFloat(css.getPropertyValue('--workspace-min-w')));});observer.observe(el);return()=>observer.disconnect();},[]);
 function open(id:string|null,isNew=false){
  if(selected)scroll.current.set(selected,window.scrollY);
  setSelected(id);setNotice(previous=>/could not|another tab|storage is unavailable/.test(previous)?previous:'');
  requestAnimationFrame(()=>{
   const target=id?host.current?.querySelector<HTMLElement>(`[data-session-id="${CSS.escape(id)}"]`):indexTitle.current;
   if(isNew)target?.querySelector<HTMLTextAreaElement>('textarea')?.focus({preventScroll:true});else target?.focus({preventScroll:true});
   window.scrollTo({top:id?scroll.current.get(id)??0:0,behavior:'auto'});
  });
 }
 function createSession(){
  if(active.current||notice==='Restoring saved history…')return;
  if(sessions.length>=V3_SESSION_LIMIT){open(null);setNotice('Session limit reached. Delete a session to start another.');return;}
  const id=crypto.randomUUID();setSessions(s=>[...s,emptyV3Session(id,Date.now())]);open(id,true);
 }
 function clearHistory(){
  if(active.current)return;
  if(!window.confirm('Delete all research sessions and drafts saved in this browser?'))return;
  if(clearSavedHistory()){setSessions([]);setSelected(null);scroll.current.clear();setNotice('Saved history cleared.');}
 }
 function removeSession(id:string){
  if(active.current?.id===id||notice==='Restoring saved history…')return;
  if(selected===id)open(null);
  setSessions(s=>s.filter(item=>item.id!==id));scroll.current.delete(id);setNotice('Session deleted.');
  requestAnimationFrame(()=>(indexTitle.current??host.current?.querySelector<HTMLElement>('[data-sidebar-heading]'))?.focus({preventScroll:true}));
 }
 const onActiveResearch=()=>{if(active.current)open(active.current.id);};
 return <div className="a3-app a3-v3-shell" ref={host} data-narrow={narrow}>
  <V3Navigation sessions={sessions} selected={selected} runningId={runningId} coverage={props.coverage} notice={notice} historyLoading={notice==='Restoring saved history…'} onClear={clearHistory} onOpen={id=>open(id)} onNew={createSession} onDelete={removeSession} onStop={()=>active.current?.stop()} onActiveResearch={onActiveResearch}/>
  {selected===null&&<main className="a3-thread-layout a3-session-index" aria-labelledby="session-index-title"><div className="a3-session-index-heading"><h1 className="text-title" id="session-index-title" tabIndex={-1} ref={indexTitle}>Research sessions</h1><Button variant="outline" onClick={createSession} disabled={Boolean(runningId)||notice==='Restoring saved history…'}>New research</Button></div>
   <Text as="p" style="secondary">Saved in this browser for up to 30 days. Clearing browser storage removes this history.</Text>
   {notice&&<Text as="p" style="secondary" role="status">{notice}</Text>}
   {sessions.length?<ul className="a3-session-list" aria-label="Research sessions">{sortedV3Sessions(sessions).map(s=><li key={s.id} className="a3-session-row"><button className="a3-session-open" onClick={()=>open(s.id)} aria-label={`Open research session: ${s.title}`}><Text style="strong"><FigureText text={s.title}/></Text><Text style="meta"><FigureText text={`${s.outcome} · ${s.updatedAt?new Date(s.updatedAt).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'Just started'}`}/></Text></button><Button variant="icon" onClick={()=>removeSession(s.id)} disabled={runningId===s.id} aria-label={`Delete research session: ${s.title}`} title="Delete session"><svg className="a3-nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10M7 6v6M9 6v6"/></svg></Button></li>)}</ul>:<div className="a3-empty"><Text as="p" style="strong">No research sessions yet.</Text><Text as="p" style="secondary">Start with a public-company question.</Text></div>}
  </main>}
  {/* Keep each bounded session mounted so drafts, native disclosures,
      source focus and in-flight response ownership survive navigation. */}
  {sessions.map(s=><div key={s.id} className="a3-session-view" data-session-id={s.id} hidden={selected!==s.id} tabIndex={-1} aria-label={`Research session: ${s.title}`}><V3ResearchSession {...props} id={s.id} summary={s} historyLoading={notice==='Restoring saved history…'} visible={selected===s.id} busyElsewhere={Boolean(runningId&&runningId!==s.id)} claimRun={claimRun} releaseRun={releaseRun} onSummary={onSummary} onActiveResearch={onActiveResearch}/></div>)}
  <WorkspaceHistoryBridge sessions={sessions} selected={selected} onNotice={setNotice} onRestore={h=>{setSessions(h.sessions.map(s=>s.summary));setSelected(h.selected);setNotice('Saved sessions restored. Interrupted research requires a manual retry.');}}/>
  <footer className="a3-footer"><Text style="meta">{/could not|another tab|storage is unavailable/.test(notice)?'History saving unavailable':'History saved in this browser'} · Research support, not investment advice</Text></footer>
 </div>;
}
