'use client';
import {useEffect,useRef,useState} from 'react';
import type {Coverage} from '../../lib/v3-display.ts';
import {sortedV3Sessions,type V3SessionSummary} from '../../lib/v3-sessions.ts';
import {Button,FigureText,Text} from './primitives';
import {TickerChip} from './kit';
type Props={sessions:V3SessionSummary[];selected:string|null;runningId:string|null;coverage:Coverage;notice:string;onOpen:(id:string|null)=>void;onNew:()=>void;onDelete:(id:string)=>void;onStop:()=>void;onActiveResearch:()=>void};
// Intent: an analyst sees current/prior investigations without leaving the answer.
// A3: existing 06c rail, Geist/mono, white/ink, hairlines and token-only geometry.
// DESIGN-DECISION: D93 keeps the rail on the left in the working preview;
// phone-sized views use a dismissible left drawer rather than stacking a list
// above the answer. Its threshold derives from existing A3 geometry tokens.
export default function V3Navigation({sessions,selected,runningId,coverage,notice,onOpen,onNew,onDelete,onStop,onActiveResearch}:Props){
 const [expanded,setExpanded]=useState(true),[previousViews,setPreviousViews]=useState<(string|null)[]>([]),[compact,setCompact]=useState(false);
 const previous=useRef(selected),goingBack=useRef(false),toggle=useRef<HTMLButtonElement>(null),header=useRef<HTMLElement>(null);
 useEffect(()=>{const el=header.current;if(!el)return;const observer=new ResizeObserver(entries=>{const css=getComputedStyle(el);setCompact(entries[0].contentRect.width<parseFloat(css.getPropertyValue('--pane-min-w'))+parseFloat(css.getPropertyValue('--space-8')));});observer.observe(el);return()=>observer.disconnect();},[]);
 useEffect(()=>setExpanded(!compact),[compact]);
 useEffect(()=>{if(!compact||!expanded)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!event.defaultPrevented&&!event.isComposing){event.preventDefault();setExpanded(false);toggle.current?.focus();}};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[compact,expanded]);
 useEffect(()=>{
  if(previous.current===selected)return;
  const from=previous.current;previous.current=selected;
  if(goingBack.current){goingBack.current=false;return;}
  setPreviousViews(views=>[...views,from].slice(-50));
 },[selected]);
 function back(){
  if(!previousViews.length)return;
  const target=previousViews.at(-1)??null;goingBack.current=true;
  setPreviousViews(views=>views.slice(0,-1));
  const destination=target&&sessions.some(s=>s.id===target)?target:null;
  if(destination===selected)goingBack.current=false;
  if(compact)setExpanded(false);
  onOpen(destination);
 }
 function choose(id:string|null){if(compact)setExpanded(false);onOpen(id);}
 const current=sessions.find(s=>s.id===selected);
 return <>
  <header className="a3-header a3-v3-header a3-rail-header" ref={header}><nav className="a3-brand" aria-label="Research navigation">
   <Button variant="icon" onClick={back} disabled={!previousViews.length} aria-label="Back to previous research page" title="Back"><svg className="a3-nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m7 3-5 5 5 5M2 8h12"/></svg></Button>
   <button ref={toggle} type="button" className="a3-button a3-button-icon text-strong" aria-label={expanded?'Hide session sidebar':'Show session sidebar'} aria-expanded={expanded} aria-controls="research-session-sidebar" title={expanded?'Hide session sidebar':'Show session sidebar'} onClick={()=>setExpanded(v=>!v)}><svg className="a3-nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 2h12v12H2ZM6 2v12"/></svg></button>
   <span className="a3-brand"><span className="a3-logo" aria-hidden="true"/><Text style="strong">Research</Text></span>
   <span className="a3-nav-scope"><Text style="meta"><FigureText text="Prototype 3"/></Text>{current?.hasAnswer?<TickerChip coverage={coverage}/>:<Text style="secondary">{selected?'NVIDIA profitability':'All sessions'}</Text>}</span>
  </nav><Button variant="icon" className="a3-new-research" onClick={()=>{if(compact)setExpanded(false);onNew();}} disabled={Boolean(runningId)} aria-label="New research session" title="New research session"><svg className="a3-nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9 3H3v10h10V7M8 8l5-5 1 1-5 5H8V8Z"/></svg></Button>
  {runningId&&selected!==runningId&&<div className="a3-nav-running"><Button variant="link" onClick={onActiveResearch}>Return to active research</Button><Button variant="outline" onClick={onStop}>Stop research</Button></div>}</header>
  <aside id="research-session-sidebar" className="a3-session-sidebar" data-compact={compact} aria-label="Session sidebar" hidden={!expanded} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();setExpanded(false);toggle.current?.focus();}}}>
   <h2 className="text-meta" data-sidebar-heading tabIndex={-1}>Sessions</h2>
   <Button variant="link" onClick={()=>choose(null)} aria-current={selected===null?'page':undefined}>All sessions</Button>
   {notice&&<Text as="p" style="secondary" role="status">{notice}</Text>}
   {sessions.length?<ul className="a3-sidebar-sessions">{sortedV3Sessions(sessions).map(s=><li key={s.id} className="a3-sidebar-session-row"><button type="button" className={`a3-rail-item a3-sidebar-session ${selected===s.id?'a3-rail-active':''}`} aria-label={`Switch to research session: ${s.title}`} title={s.title} aria-current={selected===s.id?'page':undefined} onClick={()=>choose(s.id)}><Text style={selected===s.id?'strong':'secondary'} className="a3-sidebar-title"><FigureText text={s.title}/></Text><Text style="meta">{s.outcome}{selected===s.id?' · Current':''}</Text></button><Button variant="icon" onClick={()=>onDelete(s.id)} disabled={runningId===s.id} aria-label={`Delete sidebar session: ${s.title}`} title="Delete session"><svg className="a3-nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10M7 6v6M9 6v6"/></svg></Button></li>)}</ul>:<Text as="p" style="secondary">No sessions yet.</Text>}
   <Text as="p" style="meta" className="a3-sidebar-retention">History clears on reload.</Text>
  </aside>
  {compact&&expanded&&<button type="button" className="a3-sidebar-backdrop" aria-label="Close session sidebar" onClick={()=>{setExpanded(false);toggle.current?.focus();}}/>}
 </>;
}
