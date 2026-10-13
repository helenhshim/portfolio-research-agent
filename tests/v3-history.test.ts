import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadV3Reference} from '../src/lib/v3-reference.ts';
import {saveSession,readHistory,writeStoredHistory,V3_HISTORY_TTL} from '../src/lib/v3-history.ts';
import {historyArtifactChecker,createV3HistoryHandler} from '../src/lib/v3-history-validation.ts';
import {emptyV3Session} from '../src/lib/v3-sessions.ts';
import {canRetry,researchHistory} from '../src/lib/v3-attempts.ts';
const packet=JSON.parse(readFileSync(new URL('../src/data/nvda-quarter-pair.json',import.meta.url),'utf8'));
const verify=historyArtifactChecker(packet);
const now=Date.now();
const archive=(session:any)=>({version:1,savedAt:now,selected:session.summary.id,sessions:[session]});
test('History restores checked reference and draft without trusting cached numbers, URLs or extra fields',async()=>{
 const reference=await loadV3Reference(),s=saveSession(emptyV3Session('one',now),'Compare operating margins.',[{id:'turn',question:reference.question,history:[],reference,attempts:[]}]);
 const edited=structuredClone(archive(s));edited.sessions[0].turns[0].reference.facts[0].value=-99;edited.sessions[0].turns[0].reference.rows[0].current.display='fabricated';edited.sessions[0].turns[0].reference.sources[0].url='https://bad.invalid';(edited as any).secret='not-retained';
 const restored=readHistory(edited,verify,now),a=restored.sessions[0].turns[0].reference!;
 assert.equal(restored.sessions[0].draft,s.draft);assert.equal(a.takeaway,reference.takeaway);assert.deepEqual(a.rows,reference.rows);assert.deepEqual(a.sources,reference.sources);assert.deepEqual(a.next,reference.next);assert.equal((restored as any).secret,undefined);assert.equal(researchHistory(restored.sessions[0].turns).length,2);
});
test('Reloaded run becomes interrupted, has no provisional evidence and never supplies failed research history',()=>{
 const s=saveSession(emptyV3Session('one',now),'',[{id:'turn',question:'Pressure-test profitability.',history:[],attempts:[{id:'attempt',startedAt:10,status:'running',steps:[{stage:'researching',startedMs:20,receivedAt:30,state:'live'}],developing:{findings:[],facts:[],sources:[],cutoff:'now'}}]}]);
 const restored=readHistory(archive(s),verify,now).sessions[0].turns;
 assert.equal(restored[0].attempts[0].errorCode,'interrupted');assert.equal(restored[0].attempts[0].status,'stopped');assert.equal(restored[0].attempts[0].developing,undefined);assert.equal(canRetry(restored[0].attempts[0]),true);assert.deepEqual(researchHistory(restored),[]);
});
test('Private drafts/questions and unknown extra fields are excluded; corrupt, expired and oversized histories fail closed',()=>{
 const marker='sk-synthetic_test_credential_12345678';
 const s=saveSession(emptyV3Session('one',now),marker,[{id:'turn',question:marker,history:[],attempts:[]}]);
 assert.equal(s.draft,'');assert.equal(s.turns.length,0);assert.doesNotMatch(JSON.stringify(s),/sk-synthetic/);
 assert.throws(()=>readHistory({...archive(s),version:2},verify,now));assert.throws(()=>readHistory({...archive(s),savedAt:now-V3_HISTORY_TTL-1},verify,now));assert.throws(()=>readHistory({...archive(s),sessions:[s,s]},verify,now));assert.throws(()=>readHistory({...archive(s),padding:'x'.repeat(1500001)},verify,now));
});
test('Invalid source quotes and mismatched source cutoff remove cached answer rather than reuse as context',async()=>{
 for(const alter of [(a:any)=>a.findings[2].passages[0].quote='invented quote',(a:any)=>a.cutoff='old']){
  const reference=await loadV3Reference();alter(reference);
  const s=saveSession(emptyV3Session('one',now),'',[{id:'turn',question:reference.question,history:[],attempts:[],reference}]);
  const restored=readHistory(archive(s),verify,now).sessions[0].turns;
  assert.equal(restored[0].reference,undefined);assert.equal(restored[0].attempts[0].status,'check_failed');assert.deepEqual(researchHistory(restored),[]);
 }
});
test('Stateless restoration requires same origin and bounds request size without any provider access',async()=>{
 const handler=createV3HistoryHandler(packet),s=saveSession(emptyV3Session('one',now),'',[]);
 const post=(origin:string,body:string)=>new Request('http://localhost/api/v3/history',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body});
 assert.equal((await handler(post('https://bad.invalid',JSON.stringify(archive(s))))).status,403);
 const okay=await handler(post('http://localhost',JSON.stringify(archive(s))));assert.equal(okay.status,200);assert.equal(okay.headers.get('Cache-Control'),'no-store');
 assert.equal((await handler(post('http://localhost','x'.repeat(1500001)))).status,400);
});

test('A stale browser tab cannot overwrite or resurrect newer history; storage failure does not report a successful write',()=>{
 let stored='newer history';const storage={getItem:()=>stored,setItem:(_key:string,value:string)=>{stored=value;}};
 assert.throws(()=>writeStoredHistory(storage,'older history','old baseline'),/conflicting_history/);assert.equal(stored,'newer history');
 writeStoredHistory(storage,'updated history','newer history');assert.equal(stored,'updated history');
 assert.throws(()=>writeStoredHistory({getItem:()=>null,setItem:()=>{throw Error('quota');}},'snapshot',null),/quota/);
});
