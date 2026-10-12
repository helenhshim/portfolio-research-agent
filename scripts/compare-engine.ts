import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { researchHolding } from '../src/lib/engine.ts';
if(!process.env.OPENAI_API_KEY)throw new Error('OPENAI_API_KEY is required');
const directory=new URL(`../.research-runs/batch-${randomUUID()}/`,import.meta.url);await mkdir(directory,{recursive:true});
const records:any[]=[];
// NVDA income already has a corrected paired trial; preserve it and run the remaining five cases.
const cases=[['NVDA','growth'],['JPM','income'],['JPM','growth'],['COST','income'],['COST','growth']];
let estimatedSpend=0;
trialCases: for(const [ticker,profile] of cases){
 const packet=JSON.parse(await readFile(new URL(`../.research-data/${ticker}/packet.json`,import.meta.url),'utf8'));
 const inputs={primary_goal:profile,holding_period:profile==='income'?'short':'long',risk_tolerance:profile==='income'?'low':'medium',tickers:[ticker],holding_rationale:profile==='income'?'dependable_income':'profitable_growth'};
 for(const mode of ['focus','single_pass'] as const){
  if(estimatedSpend>=2)throw new Error('Trial batch estimated cost budget reached; inspect usage before continuation');
  console.log(JSON.stringify({case:`${ticker}-${profile}`,mode,stage:'starting'}));
  const started=Date.now();
  try{
   const run=await researchHolding(packet,inputs,mode,process.env.OPENAI_API_KEY);
   const tokens=run.trace.reduce((a:any,t:any)=>({input:a.input+(t.usage?.input_tokens||0),output:a.output+(t.usage?.output_tokens||0)}),{input:0,output:0});
   const estimate=run.trace.reduce((sum:number,t:any)=>{const u=t.usage||{},details=u.input_tokens_details||{},cached=details.cached_tokens||0,writes=details.cache_write_tokens||0,uncached=Math.max(0,(u.input_tokens||0)-cached-writes);return sum+(uncached*2+cached*0.1+writes*2.5+(u.output_tokens||0)*10)/1e6;},0);
   estimatedSpend+=estimate;
   await writeFile(new URL(`${ticker}-${profile}-${mode}.json`,directory),JSON.stringify(run,null,2));
   const summary={ticker,profile,mode,elapsed_ms:Date.now()-started,...tokens,estimated_standard_cost_usd:estimate,checks:run.result.checks,status:'completed'};records.push(summary);console.log(JSON.stringify(summary));
  }catch(error){const summary={ticker,profile,mode,status:'failed',error:error instanceof Error?error.message:'Unknown error'};records.push(summary);console.log(JSON.stringify(summary));if(/billing quota|429|401|403/.test(summary.error)){await writeFile(new URL('summary.json',directory),JSON.stringify({records,estimated_total_usd:estimatedSpend},null,2));break trialCases;}}
  await writeFile(new URL('summary.json',directory),JSON.stringify({records,estimated_total_usd:estimatedSpend},null,2));
 }
}
console.log(JSON.stringify({artifact:directory.pathname,estimated_total_usd:estimatedSpend,note:'Estimates are not invoice totals; no ChatGPT trial or independent usefulness review performed.'}));
