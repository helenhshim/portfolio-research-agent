import ResearchWorkspace from '../../components/research-workspace';
import packet from '../../data/nvda-quarter-pair.json';
import example from '../../data/nvda-example.json';
export const dynamic='force-dynamic';
export default function Page(){
 const displayPacket={ticker:packet.ticker,facts:packet.facts,comparisons:packet.comparisons,comparison_context:packet.comparison_context,source_cutoff:packet.source_cutoff};
 return <ResearchWorkspace packet={displayPacket} example={example} liveConfigured={Boolean(process.env.OPENAI_API_KEY)&&process.env.VERCEL_ENV!=='production'}/>;
}
