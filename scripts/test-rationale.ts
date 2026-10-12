import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {researchHolding} from '../src/lib/engine.ts';
if(!process.env.OPENAI_API_KEY)throw new Error('OPENAI_API_KEY is required');
const packet=JSON.parse(await readFile(new URL('../.research-data/NVDA/packet.json',import.meta.url),'utf8'));
const directory=new URL(`../.research-runs/rationale-${randomUUID()}/`,import.meta.url);await mkdir(directory,{recursive:true});
for(const rationale of ['profitable_growth','dependable_income']){
 const input={primary_goal:'growth',holding_period:'long',risk_tolerance:'medium',tickers:['NVDA'],holding_rationale:rationale};
 console.log(JSON.stringify({rationale,stage:'starting',fixed_context:'NVDA / growth / long / medium'}));
 let output;
 for(let attempt=0;attempt<2;attempt++){
  try{output=await researchHolding(packet,input,'focus',process.env.OPENAI_API_KEY,s=>{if(s.stage==='investigating')console.log(JSON.stringify(s));});break;}
  catch(error){if(attempt===0&&error instanceof Error&&/rate_limit_exceeded/.test(error.message)){console.log('Rate limited; one delayed retry.');await new Promise(r=>setTimeout(r,40000));}else throw error;}
 }
 if(!output)throw new Error('No rationale result');
 await writeFile(new URL(`${rationale}.json`,directory),JSON.stringify(output,null,2));
 console.log(JSON.stringify({rationale,assessment:output.result.premise_assessment,checks:output.result.checks,artifact:directory.pathname}));
 if(rationale==='profitable_growth')await new Promise(r=>setTimeout(r,15000));
}
