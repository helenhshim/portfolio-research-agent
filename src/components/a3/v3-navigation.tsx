'use client';
import {useEffect,useRef,useState} from 'react';
import type {Coverage} from '../../lib/v3-display.ts';
import {sortedV3Sessions,type V3SessionSummary} from '../../lib/v3-sessions.ts';
import {Button,FigureText,Text} from './primitives';
type Props={sessions:V3SessionSummary[];selected:string|null;runningId:string|null;coverage:Coverage;notice:string;historyLoading:boolean;onClear:()=>void;onOpen:(id:string|null)=>void;onNew:()=>void;onDelete:(id:string)=>void;onStop:()=>void;onActiveResearch:()=>void};
// Intent: an analyst sees current/prior investigations without leaving the answer.
// A3: existing 06c rail, Geist/mono, white/ink, hairlines and token-only geometry.
// DESIGN-DECISION: D93 keeps the rail on the left in the working preview;
// phone-sized views use a dismissible left drawer rather than stacking a list
// above the answer. Its threshold derives from existing A3 geometry tokens.
export default function V3Navigation({sessions,selected,runningId,coverage,notice,historyLoading,onClear,onOpen,onNew,onDelete,onStop,onActiveResearch}:Props){
 const [expanded,setExpanded]=useState(true),[compact,setCompact]=useState(false),[railWidth,setRailWidth]=useState<number|null>(null),[widthBounds,setWidthBounds]=useState({min:0,max:0,step:0});
 const preferredWidth=useRef<number|null>(null),drag=useRef<{x:number;width:number}|null>(null);
 const toggle=useRef<HTMLButtonElement>(null),header=useRef<HTMLElement>(null);
 useEffect(()=>{const el=header.current?.parentElement;if(!el)return;
  try{const saved=Number(localStorage.getItem('portfolio-research:v3:rail-width:2'));if(Number.isFinite(saved)&&saved>0)preferredWidth.current=saved;}catch{}
  const resize=()=>{const css=getComputedStyle(el),min=parseFloat(css.getPropertyValue('--rail-v3-min-w')),max=parseFloat(css.getPropertyValue('--rail-v3-max-w')),pane=parseFloat(css.getPropertyValue('--pane-min-w')),step=parseFloat(css.getPropertyValue('--space-2'));const small=el.clientWidth<min+pane;
   setCompact(small);const available=Math.max(min,Math.min(max,el.clientWidth-pane));setWidthBounds({min,max:available,step});
   const width=Math.max(min,Math.min(available,preferredWidth.current??parseFloat(css.getPropertyValue('--rail-v3-default-w'))));el.style.setProperty('--rail-w',`${width}px`);setRailWidth(width);
  };const observer=new ResizeObserver(resize);observer.observe(el);resize();return()=>observer.disconnect();},[]);
 function changeWidth(width:number){const el=header.current?.parentElement;if(!el)return;const bounded=Math.max(widthBounds.min,Math.min(widthBounds.max,width));preferredWidth.current=bounded;el.style.setProperty('--rail-w',`${bounded}px`);setRailWidth(bounded);try{localStorage.setItem('portfolio-research:v3:rail-width:2',String(bounded));}catch{}}

 useEffect(()=>setExpanded(!compact),[compact]);
 useEffect(()=>{if(!compact||!expanded)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!event.defaultPrevented&&!event.isComposing){event.preventDefault();setExpanded(false);toggle.current?.focus();}};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close);},[compact,expanded]);
 function choose(id:string|null){if(compact)setExpanded(false);onOpen(id);}
 return <>
  <header className="a3-header a3-v3-header a3-rail-header" ref={header}><nav className="a3-brand" aria-label="Research navigation">

   <button ref={toggle} type="button" className="a3-button a3-button-icon text-strong" aria-label={expanded?'Hide session sidebar':'Show session sidebar'} aria-expanded={expanded} aria-controls="research-session-sidebar" title={expanded?'Hide session sidebar':'Show session sidebar'} onClick={()=>setExpanded(v=>!v)}><svg className="a3-nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 2h12v12H2ZM6 2v12"/></svg></button>
   <Button variant="icon" className="a3-new-research" onClick={()=>{if(compact)setExpanded(false);onNew();}} disabled={Boolean(runningId)||historyLoading} aria-label="New research session" title="New research session"><svg className="a3-nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9 3H3v10h10V7M8 8l5-5 1 1-5 5H8V8Z"/></svg></Button>
  </nav>
  {runningId&&selected!==runningId&&<div className="a3-nav-running"><Button variant="link" onClick={onActiveResearch}>Return to active research</Button><Button variant="outline" onClick={onStop}>Stop research</Button></div>}</header>
  <aside id="research-session-sidebar" className="a3-session-sidebar" data-compact={compact} aria-label="Session sidebar" hidden={!expanded} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();setExpanded(false);toggle.current?.focus();}}}>
   <h2 className="text-meta" data-sidebar-heading tabIndex={-1}>Sessions</h2>
   {notice&&<Text as="p" style="secondary" role="status">{notice}</Text>}
   {sessions.length?<ul className="a3-sidebar-sessions">{sortedV3Sessions(sessions).map(s=><li key={s.id} className="a3-sidebar-session-row"><button type="button" className={`a3-rail-item a3-sidebar-session ${selected===s.id?'a3-rail-active':''}`} aria-label={`Switch to research session: ${s.title}`} title={s.title} aria-current={selected===s.id?'page':undefined} onClick={()=>choose(s.id)}><Text style={selected===s.id?'strong':'secondary'} className="a3-sidebar-title"><FigureText text={s.title}/></Text><Text style="meta">{s.outcome}{selected===s.id?' · Current':''}</Text></button><Button variant="icon" onClick={()=>onDelete(s.id)} disabled={runningId===s.id} aria-label={`Delete sidebar session: ${s.title}`} title="Delete session"><svg className="a3-nav-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10M7 6v6M9 6v6"/></svg></Button></li>)}</ul>:<Text as="p" style="secondary">No sessions yet.</Text>}
   <Button variant="quiet" onClick={onClear} disabled={Boolean(runningId)||historyLoading}>Clear history</Button>
   <Text as="p" style="meta" className="a3-sidebar-retention">{/could not|another tab|storage is unavailable/.test(notice)?'History saving unavailable.':'Saved in this browser.'}</Text>
  </aside>
  {expanded&&!compact&&railWidth!==null&&<div className="a3-rail-resizer" role="separator" aria-label="Resize session sidebar" aria-orientation="vertical" aria-valuemin={Math.round(widthBounds.min)} aria-valuemax={Math.round(widthBounds.max)} aria-valuenow={Math.round(railWidth)} tabIndex={0} title="Drag to resize; use left and right arrow keys" onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,width:railWidth};}} onPointerMove={e=>{if(drag.current)changeWidth(drag.current.width+e.clientX-drag.current.x);}} onPointerUp={e=>{drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}} onLostPointerCapture={()=>{drag.current=null;}} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();changeWidth(e.key==='Home'?widthBounds.min:e.key==='End'?widthBounds.max:railWidth+(e.key==='ArrowRight'?widthBounds.step:-widthBounds.step));}}}/>}
  {compact&&expanded&&<button type="button" className="a3-sidebar-backdrop" aria-label="Close session sidebar" onClick={()=>{setExpanded(false);toggle.current?.focus();}}/>}
 </>;
}
