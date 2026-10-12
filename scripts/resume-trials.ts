import {readFile,writeFile} from 'node:fs/promises';
import {researchHolding} from '../src/lib/engine.ts';
const dir=new URL('../.research-runs/batch-422e4330-33d7-44de-9601-e1b984a91d87/',import.meta.url);
const summary=JSON.parse(await readFile(new URL('summary.json',dir),'utf8'));
const cases=[['NVDA','growth','single_pass'],['JPM','income','focus'],['JPM','income','single_pass']];
for(const [ticker,profile,mode] of cases){
 const packet=JSON.parse(await readFile(new URL(`../.research-data/${ticker}/packet.json`,import.meta.url),'utf8'));
 const input={primary_goal:profile,holding_period:'short',risk_tolerance:'low',tickers:[ticker],holding_rationale:profile==='income'?'dependable_income':'profitable_growth'};
 if(profile==='growth'){input.holding_period='long';input.risk_tolerance='medium';}
 console.log(JSON.stringify({ticker,profile,mode,stage:'starting'}));
 let run;
 for(let attempt=0;attempt<2;attempt++){
  try{run=await researchHolding(packet,input,mode as 'focus'|'single_pass',process.env.OPENAI_API_KEY||'');break;}
  catch(error){if(attempt===0&&error instanceof Error&&/rate_limit_exceeded/.test(error.message)){console.log('Temporary rate limit; waiting before one bounded retry.');await new Promise(r=>setTimeout(r,40000));}else throw error;}
 }
 if(!run)throw new Error('No trial result');
 await writeFile(new URL(`${ticker}-${profile}-${mode}.json`,dir),JSON.stringify(run,null,2));
 const usage=run.trace.reduce((a:any,t:any)=>({input:a.input+t.usage.input_tokens,output:a.output+t.usage.output_tokens}),{input:0,output:0});
 const estimate=run.trace.reduce((sum:number,t:any)=>{const u=t.usage,d=u.input_tokens_details||{},cached=d.cached_tokens||0,writes=d.cache_write_tokens||0;return sum+(Math.max(0,u.input_tokens-cached-writes)*2+cached*0.1+writes*2.5+u.output_tokens*10)/1e6;},0);
 const record={ticker,profile,mode,status:'completed',elapsed_ms:run.trace.reduce((n:number,t:any)=>n+t.elapsed_ms,0),...usage,estimated_standard_cost_usd:estimate,checks:run.result.checks};
 summary.records=summary.records.filter((r:any)=>!(r.ticker===ticker&&r.profile===profile&&r.mode===mode));summary.records.push(record);summary.estimated_total_usd+=estimate;
 await writeFile(new URL('summary.json',dir),JSON.stringify(summary,null,2));console.log(JSON.stringify(record));
 await new Promise(r=>setTimeout(r,15000));
}
