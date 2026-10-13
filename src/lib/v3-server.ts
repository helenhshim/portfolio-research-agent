import 'server-only';
import {Redis} from '@upstash/redis';
import {V3SharedBudget} from './v3-shared-budget.ts';
import {createHash} from 'node:crypto';
import {createV3Provider,V3SpendLedger} from './v3-provider.ts';
import type {TurnIdentity} from './v3-display.ts';
// Explicit Next.js server boundary: importing this into a client fails the build.
const localLedger=new V3SpendLedger(1);
function budget(){
 if(!process.env.VERCEL_ENV)return localLedger;
 const url=process.env.KV_REST_API_URL,token=process.env.KV_REST_API_TOKEN;
 if(!url||!token)throw new Error('Shared budget unavailable');
 return new V3SharedBudget(new Redis({url,token,retry:false,signal:()=>AbortSignal.timeout(3000)}));
}
export function isV3LiveConfigured(){return Boolean(process.env.OPENAI_API_KEY)&&process.env.VERCEL_ENV!=='production';}
export function v3ServerProvider(identity:TurnIdentity){
 const run_id=createHash('sha256').update(JSON.stringify(identity)).digest('hex');
 return createV3Provider(process.env.OPENAI_API_KEY!,{ledger:budget(),
  onProgress:progress=>console.info(JSON.stringify({event:'v3_provider_progress',run_id,...progress})),
  onTrace:trace=>console.info(JSON.stringify({event:'v3_provider',run_id,...trace})),
 });
}
