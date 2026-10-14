import {randomUUID} from 'node:crypto';
import {V3_PREVIEW_BUDGET_KEY} from './v3-deployment-policy.ts';
import {V3PolicyError} from './v3-safety.ts';
import type {V3Usage} from './v3-provider.ts';

// Integer microdollars. Standard-tier upper estimate, including cache-write input.
// Version the pricing policy independently of deployments; never rotate the key
// automatically, expire it, or use an evicting store to reset the allowance.
export const V3_BUDGET_KEY=V3_PREVIEW_BUDGET_KEY;
export const RESERVE_SCRIPT=`
local total = tonumber(redis.call('HGET', KEYS[1], 'total') or '0')
local amount = tonumber(ARGV[2])
local cap = tonumber(ARGV[3])
if not total or total < 0 then return -1 end
if redis.call('HEXISTS', KEYS[1], ARGV[1]) == 1 then return -1 end
if total + amount > cap then return 0 end
redis.call('HSET', KEYS[1], 'total', total + amount, ARGV[1], amount)
return 1`;
export const SETTLE_SCRIPT=`
local reserved = tonumber(redis.call('HGET', KEYS[1], ARGV[1]))
if not reserved then return 0 end
local actual = tonumber(ARGV[2])
local refund = math.max(0, reserved - actual)
redis.call('HINCRBY', KEYS[1], 'total', -refund)
redis.call('HDEL', KEYS[1], ARGV[1])
return 1`;
type Evaluator={eval:(script:string,keys:string[],args:(string|number)[])=>Promise<unknown>};
export class V3SharedBudget {
 private redis:Evaluator; private key:string; private capMicroUsd:number;
 constructor(redis:Evaluator,key=V3_BUDGET_KEY,capMicroUsd=10_000_000){this.redis=redis;this.key=key;this.capMicroUsd=capMicroUsd;}
 async reserve(inputBytes:number){
  if(!Number.isSafeInteger(inputBytes)||inputBytes<0||inputBytes>240000)throw new V3PolicyError('input_limit');
  const amount=Math.ceil(inputBytes*2.5+5120*10),id=randomUUID();
  let result:unknown;
  try{result=await this.redis.eval(RESERVE_SCRIPT,[this.key],[id,amount,this.capMicroUsd]);}
  catch{throw new V3PolicyError('budget_unavailable');}
  if(result===0)throw new V3PolicyError('spend_limit');
  if(result!==1)throw new V3PolicyError('budget_unavailable');
  return async (usage:V3Usage|null)=>{
   const valid=usage&&Number.isSafeInteger(usage.input_tokens)&&usage.input_tokens>=0&&Number.isSafeInteger(usage.output_tokens)&&usage.output_tokens>=0;
   const actual=valid?Math.ceil(usage.input_tokens*2.5+usage.output_tokens*10):amount;
   // A settlement failure never invalidates an otherwise checked answer. Keep
   // the full reservation charged; atomic settlement cannot refund twice.
   try{await this.redis.eval(SETTLE_SCRIPT,[this.key],[id,actual]);}catch{}
  };
 }
}
