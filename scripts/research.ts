import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { researchHolding } from '../src/lib/engine.ts';
const ticker=process.argv[2]||'NVDA';
const mode=process.argv[3]||'focus';
if(!['focus','single_pass'].includes(mode))throw new Error('Mode must be focus or single_pass');
if(!process.env.OPENAI_API_KEY){console.error('OPENAI_API_KEY is not configured; no model request made.');process.exit(1);}
const profile=process.argv[4]||'income';
if(!['income','growth'].includes(profile))throw new Error('Trial profile must be income or growth');
const input={primary_goal:profile,holding_period:profile==='income'?'short':'long',risk_tolerance:profile==='income'?'low':'medium',tickers:[ticker],holding_rationale:process.argv[5]||(profile==='income'?'dependable_income':'profitable_growth')};
const packet=JSON.parse(await readFile(new URL(`../.research-data/${ticker}/packet.json`,import.meta.url),'utf8'));
const runId=randomUUID();
const dir=new URL(`../.research-runs/${runId}/`,import.meta.url);await mkdir(dir,{recursive:true});
try {
 const result=await researchHolding(packet,input,mode as 'focus'|'single_pass',process.env.OPENAI_API_KEY,s=>console.log(JSON.stringify(s)));
 await writeFile(new URL('result.json',dir),JSON.stringify({run_id:runId,...result},null,2));
 console.log(JSON.stringify({run_id:runId,ticker,mode,checks:result.result.checks,artifact:`.research-runs/${runId}/result.json`}));
} catch(error){console.error(error instanceof Error ? error.message : "Research failed");process.exitCode=1;}
