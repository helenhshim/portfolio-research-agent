import packet from '../../../../data/nvda-quarter-pair.json';
import {createV3HistoryHandler} from '../../../../lib/v3-history-validation.ts';
export const runtime='nodejs';
// Stateless compatibility check. No database, logging or model/provider call.
export const POST=createV3HistoryHandler(packet);
