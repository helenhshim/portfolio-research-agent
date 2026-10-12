import { readFile, mkdir, writeFile } from 'node:fs/promises';
const root=new URL('../.research-data/comparison/',import.meta.url);await mkdir(root,{recursive:true});
for(const ticker of ['NVDA','JPM','COST']){
 const packet=JSON.parse(await readFile(new URL(`../.research-data/${ticker}/packet.json`,import.meta.url),'utf8'));
 for(const profile of ['income','growth']){
  const inputs={primary_goal:profile,holding_period:profile==='income'?'short':'long',risk_tolerance:profile==='income'?'low':'medium',tickers:[ticker],holding_rationale:profile==='income'?'dependable_income':'profitable_growth'};
  const filename=`${ticker}-${profile}.md`;
  const lines=[`# Frozen-source research comparison: ${ticker} / ${profile}`,'','## Prompt',`Using only this packet, research ${ticker} for the following inputs: ${JSON.stringify(inputs)}.`, 'Identify up to two important evidence-grounded research questions. Inspect supporting and conflicting evidence. Return financial changes, goal-relevant implications, and up to two observable watch-next questions with baselines. Cite exact fact IDs and short verbatim source excerpts. State missing data and unanswered questions. Distinguish facts, management outlook, and interpretation. Do not invent forecasts, attribute price movements, give buy/sell advice, or calculate unprovided changes. Use the code-computed facts below. Quantities may be shown directly in your answer; we will check them against the packet.','',`Source cutoff: ${packet.source_cutoff}. Latest financial period: ${packet.filing.end}. Release date: ${packet.release_filing_date}.`,'','## Code-computed facts and comparisons',JSON.stringify({facts:packet.facts,comparisons:packet.comparisons,unavailable:packet.unavailable,limitations:packet.limitations},null,2),'','## Source references',JSON.stringify(packet.sources,null,2),'','## Release paragraphs',...packet.release.paragraphs.map((p:any)=>`[${ticker}:${p.id}] ${p.text}`)];
  await writeFile(new URL(filename,root),lines.join('\n'));
  console.log(filename);
 }
}
console.log('Prepared six packets. No ChatGPT trial has run.');
