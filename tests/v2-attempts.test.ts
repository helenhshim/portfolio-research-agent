import test from 'node:test';
import assert from 'node:assert/strict';
import {addStage,addFinding,resetFindings,matchesTurnEvent,canRetry,finishAttempt,formatDuration,latestAttempt,recoveryMessage,researchHistory,startAttempt,turnArtifact,updateAttempt,type ResearchTurn} from '../src/lib/v2-attempts.ts';
import type {V2Artifact,V2Event} from '../src/lib/v2-display.ts';
const artifact={question:'Original question',takeaway:'Checked prior answer',facts:[],revision:1} as unknown as V2Artifact;
test('Retry groups attempts under one question and retains the original research context',()=>{
 const prior:ResearchTurn={id:'prior',question:'Earlier question',history:[],attempts:[],reference:artifact};
 let turns=startAttempt([prior],'q','Research question','a',100);
 turns=updateAttempt(turns,'q','a',a=>finishAttempt(addStage(a,'researching',10,115),{status:'failed',error_code:'deadline'},210));
 turns=startAttempt(turns,'q','Research question','b',300);
 assert.equal(turns.length,2);assert.equal(turns[1].attempts.length,2);
 assert.deepEqual(turns[1].history,[{role:'user',text:'Earlier question'},{role:'assistant',text:'Checked prior answer'}]);
 assert.equal(turns[1].attempts[0].endedAt,210);assert.equal(latestAttempt(turns[1])?.status,'running');
 assert.equal(researchHistory(turns).length,2);assert.doesNotMatch(JSON.stringify(researchHistory(turns)),/deadline|failed/);
});
test('Server timings freeze at terminal result and late events cannot reopen a stopped attempt',()=>{
 let turns=startAttempt([],'q','Question','a',1000);
 turns=updateAttempt(turns,'q','a',a=>addStage(a,'preparing',0,1010));
 turns=updateAttempt(turns,'q','a',a=>addStage(a,'researching',25,1040));
 turns=updateAttempt(turns,'q','a',a=>finishAttempt(a,{status:'complete',artifact,run:{elapsed_ms:2025,provider_calls:1,tool_calls:0,tool_rounds:0}},3050));
 const done=latestAttempt(turns[0])!;assert.equal(done.steps[0].endedMs,25);assert.equal(done.steps[1].endedMs,2025);assert.equal(done.endedAt,3050);
 assert.equal(done.steps[1].state,'done');
 turns=startAttempt(turns,'next','Follow-up','b',4000);
 turns=updateAttempt(turns,'next','b',a=>finishAttempt(a,{status:'stopped',error_code:'stopped'},4200));
 const stopped=structuredClone(turns);
 turns=updateAttempt(turns,'next','b',a=>finishAttempt(a,{status:'complete',artifact},9000));
 assert.deepEqual(turns,stopped);assert.equal(turnArtifact(turns[1]),undefined);assert.deepEqual(turnArtifact(turns[0]),artifact);
});
test('Obsolete attempt updates cannot overwrite a retry; failed follow-up never borrows prior artifact',()=>{
 let turns=startAttempt([],'q','Question','a',0);
 turns=updateAttempt(turns,'q','a',a=>finishAttempt(a,{status:'failed',error_code:'check_failed'},100));
 turns=startAttempt(turns,'q','Question','b',200);
 turns=updateAttempt(turns,'q','a',a=>finishAttempt(a,{status:'complete',artifact},300));
 assert.equal(latestAttempt(turns[0])?.status,'running');assert.equal(turnArtifact(turns[0]),undefined);
 turns=updateAttempt(turns,'q','b',a=>finishAttempt(a,{status:'complete',artifact},500));
 turns=startAttempt(turns,'follow','New question','c',600);
 turns=updateAttempt(turns,'follow','c',a=>finishAttempt(a,{status:'failed',error_code:'provider_incomplete'},800));
 assert.equal(turnArtifact(turns[1]),undefined);assert.deepEqual(turnArtifact(turns[0]),artifact);
});
test('Recovery describes recorded stages, never invents prepared evidence or provider causes',()=>{
 const attempt=latestAttempt(startAttempt([],'q','Question','a',0)[0])!;
 const rejected=finishAttempt(attempt,{status:'failed',error_code:'unavailable'},1);
 assert.equal(canRetry(rejected),false);assert.doesNotMatch(recoveryMessage(rejected),/prepared|rate limit|different/i);
 const timedOut=finishAttempt(addStage(attempt,'researching',20,25),{status:'failed',error_code:'deadline'},120000);
 assert.match(recoveryMessage(timedOut),/report evidence was prepared/);assert.match(recoveryMessage(timedOut),/waiting for a completed answer/);assert.equal(canRetry(timedOut),true);
 assert.doesNotMatch(recoveryMessage({...rejected,errorCode:'private internal details'}),/private internal details/);
 const checking=finishAttempt(addStage(attempt,'checking',50,55),{status:'check_failed'},60);
 assert.equal(canRetry(checking),true);assert.equal(checking.steps[0].state,'failed');
});
test('Duration formatting and history bound preserve short stages and recent valid context',()=>{
 assert.equal(formatDuration(0),'<1s');assert.equal(formatDuration(999),'<1s');assert.equal(formatDuration(20015),'20s');
 const turns:ResearchTurn[]=Array.from({length:5},(_,i)=>({id:String(i),question:`Question ${i}`,history:[],attempts:[],reference:artifact}));
 assert.equal(researchHistory(turns).length,6);assert.equal(researchHistory(turns)[0].text,'Question 2');
});
test('Formatting recovery records the abandoned stage as failed and keeps one active action',()=>{
 let attempt=latestAttempt(startAttempt([],'q','Question','a',0)[0])!;
 attempt=addStage(attempt,'researching',0,0);attempt=addStage(attempt,'recovering',5000,5000);
 assert.equal(attempt.steps[0].state,'failed');assert.equal(attempt.steps[0].endedMs,5000);assert.equal(attempt.steps[1].state,'live');
 assert.equal(attempt.steps.filter(s=>s.state==='live').length,1);
});
const token={session_id:'s',turn_id:'a',revision:1};
const findingEvent:Extract<V2Event,{type:'finding'}>={type:'finding',identity:token,finding:{id:'finding_1',text:'Checked developing evidence.',fact_ids:[],passages:[]},facts:[],sources:[],cutoff:'2026-10-11'};
test('Developing findings never become research history, duplicate evidence or a terminal artifact',()=>{
 let turns=startAttempt([],'q','Question','a',0);
 turns=updateAttempt(turns,'q','a',a=>addFinding(a,findingEvent));
 turns=updateAttempt(turns,'q','a',a=>addFinding(a,findingEvent));
 assert.equal(latestAttempt(turns[0])!.developing!.findings.length,1);
 assert.deepEqual(researchHistory(turns),[]);assert.equal(turnArtifact(turns[0]),undefined);
 turns=updateAttempt(turns,'q','a',a=>finishAttempt(a,{status:'complete',artifact},10));
 assert.equal(latestAttempt(turns[0])!.developing,undefined);assert.equal(turnArtifact(turns[0]),artifact);
 assert.doesNotMatch(JSON.stringify(researchHistory(turns)),/developing evidence/);
});
test('Failure, Stop, recovery and retry remove developing findings; late updates cannot restore them',()=>{
 for(const status of ['failed','stopped','check_failed']){
  let turns=startAttempt([],'q','Question','a',0);
  turns=updateAttempt(turns,'q','a',a=>addFinding(a,findingEvent));
  assert.equal(resetFindings(latestAttempt(turns[0])!).developing,undefined);
  turns=updateAttempt(turns,'q','a',a=>finishAttempt(a,{status},10));
  turns=updateAttempt(turns,'q','a',a=>addFinding(a,findingEvent));
  assert.equal(latestAttempt(turns[0])!.developing,undefined);
  turns=startAttempt(turns,'q','Question','b',20);
  turns=updateAttempt(turns,'q','a',a=>addFinding(a,findingEvent));
  assert.equal(latestAttempt(turns[0])!.id,'b');assert.equal(latestAttempt(turns[0])!.developing,undefined);
 }
});
test('Every progressive event is bound to its session, attempt and revision, before a terminal result',()=>{
 const events:V2Event[]=[findingEvent,{type:'findings_reset',identity:token},{type:'stage',stage:'developing',elapsed_ms:10,identity:token},{type:'result',result:{status:'complete',identity:token,artifact}}];
 for(const event of events){
  assert.equal(matchesTurnEvent(event,token,'a',false),true);
  for(const wrong of [{...token,session_id:'other'},{...token,turn_id:'old'},{...token,revision:2}])assert.equal(matchesTurnEvent(event,wrong,wrong.turn_id,false),false);
  assert.equal(matchesTurnEvent(event,token,undefined,false),false);
  assert.equal(matchesTurnEvent(event,token,'a',true),false);
 }
});
