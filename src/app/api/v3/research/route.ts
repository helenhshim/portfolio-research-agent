import packet from '../../../../data/nvda-quarter-pair.json';
import {createV3Handler} from '../../../../lib/v3-http.ts';
import {isV3LiveConfigured,v3ServerProvider} from '../../../../lib/v3-server.ts';
export const runtime='nodejs';
export const maxDuration=150;
// Preview uses a shared atomic budget reservation before each provider call.
// Production requires an explicit server-only opt-in and its separate shared budget.
export const POST=createV3Handler({packet,
 configured:isV3LiveConfigured,
 provider:v3ServerProvider,
 onCancellation:data=>console.info(JSON.stringify({event:'v3_cancelled',data})),
 onDiagnostics:data=>console.info(JSON.stringify({event:'v3_checks',data})),
});
