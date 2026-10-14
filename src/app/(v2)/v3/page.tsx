import type {Metadata} from 'next';
import V3Workspace from '../../../components/a3/v3-workspace';
import packet from '../../../data/nvda-quarter-pair.json';
import {packetCoverage} from '../../../lib/v3-presentation.ts';
import {loadV3Reference} from '../../../lib/v3-reference.ts';
import {isV3LiveConfigured} from '../../../lib/v3-server.ts';
const title='Research Agent';
const description='Pressure-test an investment thesis against earnings reports, explore supporting evidence, and dig deeper with follow-up investigations.';
const url='https://research.helenshim.me/v3';
const image={url:'https://www.helenshim.me/financial-research-agent/preview.png',width:1440,height:900,alt:'Research Agent workspace'};
export const metadata:Metadata={
 title,description,alternates:{canonical:url},
 robots:{index:process.env.VERCEL_ENV==='production',follow:process.env.VERCEL_ENV==='production'},
 openGraph:{title,description,url,siteName:title,type:'website',images:[image]},
 twitter:{card:'summary_large_image',title,description,images:[image.url]},
};
export const dynamic='force-dynamic';
export default async function V3Page(){return <V3Workspace coverage={packetCoverage(packet)} reference={await loadV3Reference()} liveConfigured={isV3LiveConfigured()}/>;}
