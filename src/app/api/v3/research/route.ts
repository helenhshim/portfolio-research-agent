import packet from '../../../../data/nvda-quarter-pair.json';
import {createV3Handler} from '../../../../lib/v3-http.ts';
import {createV3Provider,V3SpendLedger} from '../../../../lib/v3-provider.ts';
export const runtime='nodejs';
export const maxDuration=150;
// Development/protected-preview guard. This per-instance ledger is not an aggregate
// deployment spend cap; public/production research remains disabled.
const ledger=new V3SpendLedger(1);
export const POST=createV3Handler({packet,
 configured:()=>Boolean(process.env.OPENAI_API_KEY)&&process.env.VERCEL_ENV!=='production',
 provider:identity=>createV3Provider(process.env.OPENAI_API_KEY!,{ledger,onProgress:progress=>console.info(JSON.stringify({event:'v3_provider_progress',identity,...progress})),onTrace:trace=>console.info(JSON.stringify({event:'v3_provider',identity,...trace}))}),
 onDiagnostics:data=>console.info(JSON.stringify({event:'v3_checks',data})),
});
