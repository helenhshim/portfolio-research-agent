import {plainArtifactText,type ResearchStage,type V3Artifact,type V3RunSummary,type V3TurnResult,type V3Event,type V3Evidence,type TurnIdentity} from './v3-display.ts';
export type HistoryEntry={role:'user'|'assistant';text:string};
export type TimedStep={stage:ResearchStage;startedMs:number;endedMs?:number;receivedAt:number;state:'live'|'done'|'failed'|'idle'};
export type ResearchAttempt={id:string;startedAt:number;endedAt?:number;status:string;steps:TimedStep[];message?:string;errorCode?:string;artifact?:V3Artifact;run?:V3RunSummary;developing?:V3Evidence};
export type ResearchTurn={id:string;question:string;history:HistoryEntry[];attempts:ResearchAttempt[];reference?:V3Artifact};
export const stageLabels:Record<ResearchStage,string>={preparing:'Preparing report evidence',researching:'Generating the research answer',investigating:'Inspecting approved evidence or metrics',developing:'Developing the remaining findings',synthesizing:'Writing the takeaway and remaining details',checking:'Checking references and dependencies',recovering:'Retrying response formatting'};
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
 return {...attempt,steps:[...attempt.steps.map(s=>s.state==='live'?{...s,endedMs:time,state:stage==='recovering'?'failed' as const:'done' as const}:s),{stage,startedMs:time,receivedAt:now,state:'live'}]};
}
// A finding is never an artifact or conversation history. Only the current running
// attempt may receive it, and the final result replaces this provisional snapshot.
export function addFinding(attempt:ResearchAttempt,event:Extract<V3Event,{type:'finding'}>):ResearchAttempt{
 if(attempt.status!=='running'||attempt.developing?.findings.some(f=>f.id===event.finding.id))return attempt;
 const findings=[...(attempt.developing?.findings??[]),event.finding];
 if(findings.length>6)return attempt;
 return {...attempt,developing:{findings,facts:event.facts,sources:event.sources,cutoff:event.cutoff}};
}
export function resetFindings(attempt:ResearchAttempt):ResearchAttempt{return {...attempt,developing:undefined};}
export function matchesTurnEvent(candidate:unknown,token:TurnIdentity,activeTurnId:string|undefined,received:boolean):boolean{
 if(!candidate||typeof candidate!=='object')return false;
 const event=candidate as V3Event;
 if(!['stage','finding','findings_reset','result'].includes(event.type))return false;
 if(event.type==='stage'&&!Object.hasOwn(stageLabels,event.stage))return false;
 const identity=event.type==='result'?event.result?.identity:event.identity;
 return Boolean(identity)&&!received&&activeTurnId===token.turn_id&&identity.session_id===token.session_id&&identity.turn_id===token.turn_id&&identity.revision===token.revision;
}
export function finishAttempt(attempt:ResearchAttempt,result:Pick<V3TurnResult,'status'|'message'|'error_code'|'artifact'|'run'>,now:number):ResearchAttempt{
 const last=attempt.steps.at(-1),end=result.run?.elapsed_ms??(last?last.startedMs+Math.max(0,now-last.receivedAt):0);
 const success=['complete','partial','out_of_scope','clarification','source_limited'].includes(result.status);
 return {...attempt,status:result.status,endedAt:now,message:result.message,errorCode:result.error_code,artifact:result.artifact,run:result.run,developing:undefined,
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
const retryCodes=new Set(['deadline','provider_incomplete','provider_whitespace_loop','check_failed','research_failed','busy','stopped']);
const inputCodes=new Set(['unavailable','spend_limit','provider_quota','origin','sensitive_input','invalid_text','invalid_input','input_limit','history_limit']);
export const canRetry=(attempt:ResearchAttempt)=>retryCodes.has(attempt.errorCode??attempt.status);
// Internal JS/transport exception text is not a public recovery code. Preserve
// known input/config blocks; unexpected processing failures remain retryable.
export function researchFailureCode(error:unknown){
 const code=error instanceof Error?error.message:'';
 return retryCodes.has(code)||inputCodes.has(code)?code:'research_failed';
}
export function recoveryMessage(attempt:ResearchAttempt){
 const code=attempt.errorCode??attempt.status;
 const prepared=attempt.steps.some(s=>s.stage==='researching');
 const stage=attempt.steps.at(-1)?.stage;
 const activity=stage==='checking'?'checking the answer':stage==='preparing'?'preparing report evidence':stage==='investigating'?'inspecting approved evidence':'waiting for a completed answer';
 const prefix=prepared?'The report evidence was prepared. ':'';
 const messages:Record<string,string>={
  deadline:`${prefix}Research reached its time limit while ${activity}. No new answer was published. Try again or narrow your question.`,
  provider_incomplete:`${prefix}This attempt did not receive a complete model response, so no new answer could be checked and published. Try again or narrow your question.`,
  provider_whitespace_loop:'The response stalled while formatting. No new answer was published. You can try again.',
  check_failed:'The answer was generated, but its takeaway did not pass reference and dependency checks. No new answer was published. You can try again or revise your question.',
  research_failed:`${prefix}This attempt could not finish. The available diagnostics do not establish a more specific cause. Try again.`,
  stopped:'You stopped this attempt. No new answer was published.',
  busy:'Another research request is running. Wait for it to finish, then try again.',
  unavailable:'Live research is not configured for this preview. You can view the saved reference.',
  spend_limit:'This preview’s research budget has been reached. You can view the saved reference.',
  provider_quota:'The API reports that this preview has no research credits remaining. Existing checked answers remain available. Live research can resume after credits are added; you can view the saved reference now.',
  origin:'Reload this page before submitting from the same app address.',
  sensitive_input:'Remove client identity, contact details, account identifiers or credentials before submitting a public-company question.',
  invalid_text:'Enter a public-company question within the input limit.',
  input_limit:'Shorten the question or start a new session to stay within the input limit.',
  history_limit:'Start a new session to continue within the conversation limit.',
 };
 return messages[code]??messages.research_failed;
}
export function formatDuration(ms:number){const seconds=Math.max(0,ms)/1000;return seconds<1?'<1s':`${Math.floor(seconds)}s`;}
