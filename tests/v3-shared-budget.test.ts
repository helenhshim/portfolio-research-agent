import {test} from 'node:test';
import assert from 'node:assert/strict';
import {V3SharedBudget,RESERVE_SCRIPT,SETTLE_SCRIPT} from '../src/lib/v3-shared-budget.ts';
test('shared budget fails closed for store failures, exhausted budget and invalid responses',async()=>{
 for(const result of [0,-1,null,'1']){
  const ledger=new V3SharedBudget({eval:async()=>result});
  await assert.rejects(ledger.reserve(100),{message:result===0?'spend_limit':'budget_unavailable'});
 }
 await assert.rejects(new V3SharedBudget({eval:async()=>{throw Error('private connection details');}}).reserve(100),{message:'budget_unavailable'});
});
test('shared budget conservatively charges unknown usage and tolerates settlement failure',async()=>{
 const calls:{script:string;args:(string|number)[]}[]=[];
 const ledger=new V3SharedBudget({eval:async(script,keys,args)=>{calls.push({script,args});if(script===SETTLE_SCRIPT)throw Error('offline');return 1;}});
 const settle=await ledger.reserve(100);
 await settle(null);
 assert.equal(calls[0].script,RESERVE_SCRIPT);
 assert.equal(calls[0].args[1],51450);
 assert.equal(calls[1].args[1],51450);
 assert.equal(calls[0].args[0],calls[1].args[0]);
});
