import packet from '../../../../data/nvda-quarter-pair.json';
import {createV3Handler} from '../../../../lib/v3-http.ts';
import {isV3LiveConfigured,v3ServerProvider} from '../../../../lib/v3-server.ts';
export const runtime='nodejs';
export const maxDuration=150;
// Development/protected-preview guard. This per-instance ledger is not an aggregate
// deployment spend cap; public/production research remains disabled.
export const POST=createV3Handler({packet,
 configured:isV3LiveConfigured,
 provider:v3ServerProvider,
 onDiagnostics:data=>console.info(JSON.stringify({event:'v3_checks',data})),
});
