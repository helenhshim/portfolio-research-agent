import type {Metadata} from 'next';
import V3Workspace from '../../../components/a3/v3-workspace';
import packet from '../../../data/nvda-quarter-pair.json';
import {packetCoverage} from '../../../lib/v3-presentation.ts';
import {loadV3Reference} from '../../../lib/v3-reference.ts';
import {isV3LiveConfigured} from '../../../lib/v3-server.ts';
export const metadata:Metadata={title:'Research Agent'};
export const dynamic='force-dynamic';
export default async function V3Page(){return <V3Workspace coverage={packetCoverage(packet)} reference={await loadV3Reference()} liveConfigured={isV3LiveConfigured()}/>;}
