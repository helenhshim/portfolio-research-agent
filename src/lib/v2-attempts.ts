import {plainArtifactText,type ResearchStage,type V2Artifact,type V2RunSummary,type V2TurnResult} from './v2-display.ts';
export type HistoryEntry={role:'user'|'assistant';text:string};
export type TimedStep={stage:ResearchStage;startedMs:number;endedMs?:number;receivedAt:number;state:'live'|'done'|'failed'|'idle'};
export type ResearchAttempt={id:string;startedAt:number;endedAt?:number;status:string;steps:TimedStep[];message?:string;errorCode?:string;artifact?:V2Artifact;run?:V2RunSummary};
export type ResearchTurn={id:string;question:string;history:HistoryEntry[];attempts:ResearchAttempt[];reference?:V2Artifact};
export const stageLabels:Record<ResearchStage,string>={preparing:'Preparing report evidence',researching:'Generating the research answer',investigating:'Inspecting approved evidence or metrics',checking:'Checking references and dependencies'};
export const latestAttempt=(turn:ResearchTurn)=>turn.attempts.at(-1);
export const turnArtifact=(turn:ResearchTurn)=>latestAttempt(turn)?.artifact??(turn.attempts.length===0?turn.reference:undefined);
export function startAttempt(turns:ResearchTurn[],turnId:string,question:string,attemptId:string,now:number):ResearchTurn[]{
 const attempt:ResearchAttempt={id:attemptId,startedAt:now,status:'running',steps:[]};
 const existing=turns.find(t=>t.id===turnId);
 if(existing){if(existing.attempts.some(a=>a.status==='running'))return turns;return turns.map(t=>t.id===turnId?{...t,attempts:[...t.attempts,attempt]}:t);}
 return [...turns,{id:turnId,question,history:researchHistory(turns),attempts:[attempt]}];
}
export function updateAttempt(turns:ResearchTurn[],turnId:string,attemptId:string,update:(attempt:ResearchAttempt)=>ResearchAttempt){
 return turns.map(turn=>turn.id!==turnId?turn:{...turn,attempts:turn.attempts.map((attempt,index)=>attempt.id===attemptId&&index===turn.attempts.length-1&&attempt.status==='running'?update(attempt):attempt)});
}
export function addStage(attempt:ResearchAttempt,stage:ResearchStage,elapsedMs:number,now:number):ResearchAttempt{
 const previous=attempt.steps.at(-1),time=Math.max(previous?.startedMs??0,Number.isFinite(elapsedMs)?elapsedMs:0);
 return {...attempt,steps:[...attempt.steps.map(s=>s.state==='live'?{...s,endedMs:time,state:'done' as const}:s),{stage,startedMs:time,receivedAt:now,state:'live'}]};
}
export function finishAttempt(attempt:ResearchAttempt,result:Pick<V2TurnResult,'status'|'message'|'error_code'|'artifact'|'run'>,now:number):ResearchAttempt{
 const last=attempt.steps.at(-1),end=result.run?.elapsed_ms??(last?last.startedMs+Math.max(0,now-last.receivedAt):0);
 const success=['complete','partial','out_of_scope','clarification','source_limited'].includes(result.status);
 return {...attempt,status:result.status,endedAt:now,message:result.message,errorCode:result.error_code,artifact:result.artifact,run:result.run,
  steps:attempt.steps.map(s=>s.state==='live'?{...s,endedMs:Math.max(s.startedMs,end),state:success?'done':result.status==='stopped'?'idle':'failed'}:s)};
}
export function researchHistory(turns:ResearchTurn[]):HistoryEntry[]{
 // Failed attempts are operational history, never research evidence. Retry reuses
 // the original history snapshot instead of feeding its failure back to the model.
 return turns.flatMap(turn=>{
  const artifact=turnArtifact(turn),attempt=latestAttempt(turn);
  const answer=artifact?plainArtifactText(artifact):attempt&&['out_of_scope','clarification'].includes(attempt.status)?attempt.message:undefined;
  return answer?[{role:'user' as const,text:turn.question},{role:'assistant' as const,text:answer.slice(0,1600)}]:[];
 }).slice(-6);
}
export const canRetry=(attempt:ResearchAttempt)=>['deadline','provider_incomplete','check_failed','research_failed','busy','stopped'].includes(attempt.errorCode??attempt.status);
export function recoveryMessage(attempt:ResearchAttempt){
 const code=attempt.errorCode??attempt.status;
 const prepared=attempt.steps.some(s=>s.stage==='researching');
 const stage=attempt.steps.at(-1)?.stage;
 const activity=stage==='checking'?'checking the answer':stage==='preparing'?'preparing report evidence':stage==='investigating'?'inspecting approved evidence':'waiting for a completed answer';
 const prefix=prepared?'The report evidence was prepared. ':'';
 const messages:Record<string,string>={
  deadline:`${prefix}Research reached its time limit while ${activity}. No new brief was published. Try again or narrow your question.`,
  provider_incomplete:`${prefix}The model returned an incomplete response, so a new brief could not be checked and published. Try again or narrow your question.`,
  check_failed:'The answer was generated, but its takeaway did not pass reference and dependency checks. No new brief was published. You can try again or revise your question.',
  research_failed:`${prefix}This attempt could not finish. The available diagnostics do not establish a more specific cause. Try again.`,
  stopped:'You stopped this attempt. No new brief was published.',
  busy:'Another research request is running. Wait for it to finish, then try again.',
  unavailable:'Live research is not configured for this preview. You can view the saved reference.',
  spend_limit:'This preview’s research budget has been reached. You can view the saved reference.',
  origin:'Reload this page before submitting from the same app address.',
  sensitive_input:'Remove client identity, contact details, account identifiers or credentials before submitting a public-company question.',
  invalid_text:'Enter a public-company question within the input limit.',
  input_limit:'Shorten the question or start a new session to stay within the input limit.',
  history_limit:'Start a new session to continue within the conversation limit.',
 };
 return messages[code]??messages.research_failed;
}
export function formatDuration(ms:number){const seconds=Math.max(0,ms)/1000;return seconds<1?'<1s':`${Math.floor(seconds)}s`;}
