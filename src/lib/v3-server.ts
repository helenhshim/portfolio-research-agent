import 'server-only';
import {createHash} from 'node:crypto';
import {createV3Provider,V3SpendLedger} from './v3-provider.ts';
import type {TurnIdentity} from './v3-display.ts';
// Explicit Next.js server boundary: importing this into a client fails the build.
const ledger=new V3SpendLedger(1);
export function isV3LiveConfigured(){return Boolean(process.env.OPENAI_API_KEY)&&process.env.VERCEL_ENV!=='production';}
export function v3ServerProvider(identity:TurnIdentity){
 const run_id=createHash('sha256').update(JSON.stringify(identity)).digest('hex');
 return createV3Provider(process.env.OPENAI_API_KEY!,{ledger,
  onProgress:progress=>console.info(JSON.stringify({event:'v3_provider_progress',run_id,...progress})),
  onTrace:trace=>console.info(JSON.stringify({event:'v3_provider',run_id,...trace})),
 });
}
