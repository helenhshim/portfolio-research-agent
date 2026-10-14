import 'server-only';
import {Redis} from '@upstash/redis';
import {V3SharedBudget} from './v3-shared-budget.ts';
import {createHash} from 'node:crypto';
import {createV3Provider,V3SpendLedger} from './v3-provider.ts';
import {v3DeploymentBudgetKey,v3DeploymentLiveConfigured} from './v3-deployment-policy.ts';
import {V3PolicyError} from './v3-safety.ts';
import type {TurnIdentity} from './v3-display.ts';
// Explicit Next.js server boundary: importing this into a client fails the build.
// Match Helen’s approved $10 testing allowance locally; deployed instances use Redis.
const localLedger=new V3SpendLedger(10);
function budget(){
 if(!process.env.VERCEL_ENV)return localLedger;
 const url=process.env.KV_REST_API_URL,token=process.env.KV_REST_API_TOKEN;
 let validUrl=false;try{validUrl=Boolean(url&&new URL(url).protocol==='https:');}catch{}
 if(!url||!token||!validUrl){console.info(JSON.stringify({event:'v3_budget_config',environment:process.env.VERCEL_ENV,has_url:Boolean(url),has_token:Boolean(token),valid_https_url:validUrl}));throw new V3PolicyError('budget_unavailable');}
 try{return new V3SharedBudget(new Redis({url,token,retry:false,signal:()=>AbortSignal.timeout(3000)}),v3DeploymentBudgetKey(process.env.VERCEL_ENV));}catch{console.info(JSON.stringify({event:'v3_budget_config',environment:process.env.VERCEL_ENV,client_initialization_failed:true}));throw new V3PolicyError('budget_unavailable');}
}
export function isV3LiveConfigured(){return v3DeploymentLiveConfigured(process.env.VERCEL_ENV,Boolean(process.env.OPENAI_API_KEY),process.env.V3_PRODUCTION_LIVE_ENABLED);}
export function v3ServerProvider(identity:TurnIdentity){
 const run_id=createHash('sha256').update(JSON.stringify(identity)).digest('hex');
 return createV3Provider(process.env.OPENAI_API_KEY!,{ledger:budget(),
  onProgress:progress=>console.info(JSON.stringify({event:'v3_provider_progress',run_id,...progress})),
  onTrace:trace=>console.info(JSON.stringify({event:'v3_provider',run_id,...trace})),
 });
}
