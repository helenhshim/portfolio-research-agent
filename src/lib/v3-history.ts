import {hasIdentifiedSensitiveInput,v3InputIssue} from './v3-input-policy.ts';
import {researchHistory,stageLabels,type ResearchTurn,type ResearchAttempt} from './v3-attempts.ts';
import {emptyV3Session,v3SessionOutcome,V3_SESSION_LIMIT,type V3SessionSummary} from './v3-sessions.ts';
import type {V3Artifact} from './v3-display.ts';
export const V3_HISTORY_KEY='portfolio-research:v3:history:1';
export const V3_HISTORY_BYTES=1_500_000;
export const V3_HISTORY_TTL=30*24*60*60*1000;
export type SavedSession={summary:V3SessionSummary;draft:string;turns:ResearchTurn[]};
export type SavedHistory={version:1;savedAt:number;selected:string|null;sessions:SavedSession[]};
const id=(v:unknown):v is string=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(v);
const number=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
const object=(v:any)=>v&&typeof v==='object'&&!Array.isArray(v);
const statuses=['complete','partial','source_limited','out_of_scope','clarification','failed','check_failed','stopped','running'];
// Explicit DTO: no provisional findings, request history, credentials, provider
// diagnostics or arbitrary fields are retained. Unknown sensitive text is not
// guaranteed detectable: history is for public-company research only.
export function saveSession(summary:V3SessionSummary,draft:string,turns:ResearchTurn[]):SavedSession {
 const safeTurns=turns.filter(t=>!v3InputIssue(t.question)&&!hasIdentifiedSensitiveInput(JSON.stringify(t))).slice(-30).map(t=>({
  id:t.id,question:t.question,history:[],reference:t.reference,
  attempts:t.attempts.slice(-5).map(a=>({id:a.id,startedAt:a.startedAt,endedAt:a.endedAt,status:a.status,steps:a.steps.map(s=>({...s})),errorCode:a.errorCode,
   artifact:a.artifact,message:['out_of_scope','clarification','source_limited'].includes(a.status)?a.message:undefined,
   run:a.run?{elapsed_ms:a.run.elapsed_ms,provider_calls:a.run.provider_calls,tool_calls:a.run.tool_calls,tool_rounds:a.run.tool_rounds}:undefined})),
 }));
 return {summary:{...summary,title:safeTurns[0]?.question.slice(0,140)??'New research'},draft:draft.length<=2000&&!hasIdentifiedSensitiveInput(draft)?draft:'',turns:safeTurns};
}
// Used before browser save and on server restoration. Caller supplies the
// authoritative artifact checker; stored numerical values/URLs are never trusted.
export function readHistory(raw:unknown,verify:(value:unknown)=>V3Artifact|null,now=Date.now()):SavedHistory {
 if(!object(raw)||JSON.stringify(raw).length>V3_HISTORY_BYTES)throw Error('invalid_history');
 const h=raw as any;
 if(h.version!==1||!number(h.savedAt)||h.savedAt>now+60000||now-h.savedAt>V3_HISTORY_TTL||!Array.isArray(h.sessions)||h.sessions.length>V3_SESSION_LIMIT)throw Error('expired_or_invalid_history');
 const seen=new Set<string>();
 const sessions:SavedSession[]=h.sessions.map((entry:any)=>{
  if(!object(entry)||!id(entry.summary?.id)||seen.has(entry.summary.id)||!Array.isArray(entry.turns)||entry.turns.length>30)throw Error('invalid_session');
  seen.add(entry.summary.id);const turns:ResearchTurn[]=[],turnIds=new Set<string>();
  for(const t of entry.turns){
   if(!object(t)||!id(t.id)||turnIds.has(t.id)||v3InputIssue(t.question)||!Array.isArray(t.attempts)||t.attempts.length>5)throw Error('invalid_turn');
   turnIds.add(t.id);const attemptIds=new Set<string>();
   const attempts:ResearchAttempt[]=t.attempts.map((a:any)=>{
    if(!object(a)||!id(a.id)||attemptIds.has(a.id)||!statuses.includes(a.status)||!number(a.startedAt)||!Array.isArray(a.steps)||a.steps.length>24)throw Error('invalid_attempt');
    attemptIds.add(a.id);
    const interrupted=a.status==='running';
    const duration=number(a.endedAt)?Math.max(0,a.endedAt-a.startedAt):Math.max(0,...a.steps.map((s:any)=>number(s.startedMs)?s.startedMs:0));
    const artifact=a.artifact&&a.artifact.question===t.question?verify(a.artifact):null;
    const lost=Boolean(a.artifact&&!artifact);
    const steps=a.steps.map((s:any)=>{
     if(!object(s)||!Object.hasOwn(stageLabels,s.stage)||!number(s.startedMs)||!['live','done','failed','idle'].includes(s.state)||s.endedMs!==undefined&&!number(s.endedMs))throw Error('invalid_step');
     return {stage:s.stage,startedMs:s.startedMs,endedMs:s.endedMs??s.startedMs,receivedAt:0,state:s.state==='live'?'idle':s.state};
    });
    const code=typeof a.errorCode==='string'&&/^[a-z_]{1,40}$/.test(a.errorCode)?a.errorCode:undefined;
    const message=typeof a.message==='string'&&a.message.length<=2000&&!hasIdentifiedSensitiveInput(a.message)?a.message:undefined;
    return {id:a.id,startedAt:0,endedAt:duration,status:interrupted?'stopped':lost?'check_failed':a.status,steps,
     errorCode:interrupted?'interrupted':lost?'check_failed':code,artifact:artifact??undefined,message,
     run:a.run&&number(a.run.elapsed_ms)&&number(a.run.provider_calls)&&number(a.run.tool_calls)&&number(a.run.tool_rounds)?{elapsed_ms:a.run.elapsed_ms,provider_calls:a.run.provider_calls,tool_calls:a.run.tool_calls,tool_rounds:a.run.tool_rounds}:undefined};
   });
   const reference=t.reference&&t.reference.question===t.question?verify(t.reference):null;
   if(t.reference&&!reference&&!attempts.length)attempts.push({id:t.id,startedAt:0,endedAt:0,status:'check_failed',steps:[],errorCode:'check_failed'});
   turns.push({id:t.id,question:t.question,history:researchHistory(turns),attempts,reference:reference??undefined});
  }
  const summary=emptyV3Session(entry.summary.id,number(entry.summary.updatedAt)?Math.min(entry.summary.updatedAt,now):now),last=turns.at(-1);
  summary.title=turns[0]?.question.slice(0,140)??'New research';summary.hasAnswer=turns.some(t=>t.reference||t.attempts.at(-1)?.artifact);
  summary.outcome=last?.reference?'Saved reference':v3SessionOutcome(last?.attempts.at(-1)?.status);
  const draft=typeof entry.draft==='string'&&entry.draft.length<=2000&&!hasIdentifiedSensitiveInput(entry.draft)?entry.draft:'';
  return {summary,draft,turns};
 });
 return {version:1,savedAt:h.savedAt,selected:h.selected===null?null:sessions.some(s=>s.summary.id===h.selected)?h.selected:sessions[0]?.summary.id??null,sessions};
}

export function writeStoredHistory(storage:Pick<Storage,'getItem'|'setItem'>,raw:string,expected:string|null){
 if(storage.getItem(V3_HISTORY_KEY)!==expected)throw Error('conflicting_history');
 storage.setItem(V3_HISTORY_KEY,raw);
}
