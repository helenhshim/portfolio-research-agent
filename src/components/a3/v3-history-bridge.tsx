'use client';
import {useEffect,useRef} from 'react';
import {saveSession,writeStoredHistory,V3_HISTORY_KEY,V3_HISTORY_BYTES,type SavedHistory,type SavedSession} from '../../lib/v3-history.ts';
import type {ResearchTurn} from '../../lib/v3-attempts.ts';
import type {V3SessionSummary} from '../../lib/v3-sessions.ts';
// One workspace per page. Effects own browser storage; SSR never reads or writes
// it. Keeping persistence in children preserves the existing live session hooks.
const cache={ready:false,started:false,blocked:false,entries:new Map<string,SavedSession>(),seeds:new Map<string,SavedSession>(),summaries:[] as V3SessionSummary[],selected:null as string|null,timer:undefined as ReturnType<typeof setTimeout>|undefined,lastRaw:null as string|null,notify:(_message:string)=>{}};
function flush(){
 if(!cache.ready||cache.blocked)return;
 try{
  const history:SavedHistory={version:1,savedAt:Date.now(),selected:cache.selected,sessions:cache.summaries.map(summary=>cache.entries.get(summary.id)).filter((s):s is SavedSession=>Boolean(s))};
  const raw=JSON.stringify(history);if(new TextEncoder().encode(raw).length>V3_HISTORY_BYTES)throw Error('history_limit');
  writeStoredHistory(localStorage,raw,cache.lastRaw);cache.lastRaw=raw;
 }catch(error){cache.blocked=true;cache.notify(error instanceof Error&&error.message==='conflicting_history'?'History changed in another tab. Reload to restore it before saving more changes.':'History could not be saved in this browser. Keep this page open; existing research remains available.');}
}
function schedule(){clearTimeout(cache.timer);cache.timer=setTimeout(flush,250);}
export function clearSavedHistory(){
 clearTimeout(cache.timer);cache.entries.clear();cache.seeds.clear();cache.summaries=[];cache.selected=null;
 try{localStorage.removeItem(V3_HISTORY_KEY);cache.lastRaw=null;cache.blocked=false;cache.ready=true;}catch{cache.blocked=true;cache.notify('Browser storage is unavailable. History could not be cleared.');return false;}
 return true;
}
export function SessionHistoryBridge({id,summary,draft,turns,onRestore}:{id:string;summary:V3SessionSummary;draft:string;turns:ResearchTurn[];onRestore:(s:SavedSession)=>void}){
 const callback=useRef(onRestore);callback.current=onRestore;
 useEffect(()=>{
  const saved=cache.seeds.get(id);if(saved){cache.seeds.delete(id);callback.current(saved);return;}
  cache.entries.set(id,saveSession(summary,draft,turns));schedule();
 },[id,summary,draft,turns]);
 return null;
}
export function WorkspaceHistoryBridge({sessions,selected,onRestore,onNotice}:{sessions:V3SessionSummary[];selected:string|null;onRestore:(h:SavedHistory)=>void;onNotice:(message:string)=>void}){
 const callback=useRef(onRestore);callback.current=onRestore;
 useEffect(()=>{cache.notify=onNotice;},[onNotice]);
 useEffect(()=>{cache.summaries=sessions;cache.selected=selected;for(const key of cache.entries.keys())if(!sessions.some(s=>s.id===key))cache.entries.delete(key);schedule();},[sessions,selected]);
 useEffect(()=>{
  const save=()=>flush();window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',save);
  const cleanup=()=>{window.removeEventListener('pagehide',save);document.removeEventListener('visibilitychange',save);flush();};
  if(cache.started)return cleanup;cache.started=true;
  const initialize=async()=>{
   try{
    // A hot update must capture the analyst's existing mounted sessions before
    // loading anything from disk. A fresh page has only its empty initial view.
    const raw=localStorage.getItem(V3_HISTORY_KEY);cache.lastRaw=raw;
    if([...cache.entries.values()].some(s=>s.turns.length||s.draft)){cache.ready=true;cache.notify('');flush();return;}
    if(raw){
     if(new TextEncoder().encode(raw).length>V3_HISTORY_BYTES)throw Error('history_limit');
     const response=await fetch('/api/v3/history',{method:'POST',headers:{'Content-Type':'application/json'},body:raw});
     if(!response.ok)throw Error('history_unavailable');
     const saved=await response.json() as SavedHistory;
     for(const s of saved.sessions){cache.seeds.set(s.summary.id,s);cache.entries.set(s.summary.id,s);}
     cache.summaries=saved.sessions.map(s=>s.summary);cache.selected=saved.selected;
     callback.current(saved);
    }
    cache.ready=true;if(!raw)cache.notify('');schedule();
   }catch{cache.blocked=true;cache.notify('Saved history could not be restored. Existing research remains available; clear history to start saving again.');}
  };
  void initialize();return cleanup;
 },[]);
 return null;
}
