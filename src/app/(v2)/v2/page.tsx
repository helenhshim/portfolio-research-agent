import V2Workspace from '../../../components/a3/workspace';
import packet from '../../../data/nvda-quarter-pair.json';
import {packetCoverage} from '../../../lib/v2-presentation.ts';
import {loadV2Reference} from '../../../lib/v2-reference.ts';
export const dynamic='force-dynamic';
export default async function V2Page(){return <V2Workspace coverage={packetCoverage(packet)} reference={await loadV2Reference()} liveConfigured={Boolean(process.env.OPENAI_API_KEY)&&process.env.VERCEL_ENV!=='production'}/>;}
