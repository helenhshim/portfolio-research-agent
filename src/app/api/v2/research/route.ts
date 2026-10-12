import packet from '../../../../data/nvda-quarter-pair.json';
import {createV2Handler} from '../../../../lib/v2-http.ts';
import {createV2Provider,V2SpendLedger} from '../../../../lib/v2-provider.ts';
export const runtime='nodejs';
export const maxDuration=150;
// Development/protected-preview guard. This per-instance ledger is not an aggregate
// deployment spend cap; public/production research remains disabled.
const ledger=new V2SpendLedger(1);
export const POST=createV2Handler({packet,
 configured:()=>Boolean(process.env.OPENAI_API_KEY)&&process.env.VERCEL_ENV!=='production',
 provider:()=>createV2Provider(process.env.OPENAI_API_KEY!,{ledger,onTrace:trace=>console.info(JSON.stringify({event:'v2_provider',...trace}))}),
 onDiagnostics:data=>console.info(JSON.stringify({event:'v2_checks',data})),
});
