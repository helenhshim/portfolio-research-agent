import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {researchHolding,type ResearchOptions} from '../src/lib/engine.ts';
if(!process.env.OPENAI_API_KEY)throw new Error('OPENAI_API_KEY required');
const source=await readFile(new URL('../.research-data/NVDA/packet.json',import.meta.url),'utf8');
const packet=JSON.parse(source);
const input={primary_goal:'growth',holding_period:'long',risk_tolerance:'medium',tickers:['NVDA'],holding_rationale:'profitable_growth'};
const directory=new URL(`../.research-runs/reasoning-${randomUUID()}/`,import.meta.url);await mkdir(directory,{recursive:true});
await writeFile(new URL('experiment.json',directory),JSON.stringify({input,packet_sha256:createHash('sha256').update(source).digest('hex'),variants:['low_original','high_original','high_context'],max_output_tokens:12000,timeout_ms:180000,limitations:'One case, one run per configuration. End-to-end comparison includes planner-induced lookup differences; not a fixed-evidence analyzer-only comparison.'},null,2));
for(const [name,options] of [
 ['low_original',{plannerEffort:'low',analysisEffort:'low'}],
 ['high_original',{plannerEffort:'high',analysisEffort:'high'}],
 ['high_context',{plannerEffort:'high',analysisEffort:'high',contextSpecific:true}]
] as [string,ResearchOptions][]){
 console.log(JSON.stringify({name,stage:'starting',directory:directory.pathname}));
 try{
 const output=await researchHolding(packet,input,'focus',process.env.OPENAI_API_KEY,s=>console.log(JSON.stringify({name,...s})),options);
 await writeFile(new URL(`${name}.json`,directory),JSON.stringify(output,null,2));
 console.log(JSON.stringify({name,stage:'saved',checks:output.result.checks,trace:output.trace.map(t=>({effort:t.reasoning_effort,ms:t.elapsed_ms,usage:t.usage}))}));
 }catch(error){await writeFile(new URL(`${name}-failure.json`,directory),JSON.stringify({error:error instanceof Error?error.message:'Unknown failure'},null,2));console.log(JSON.stringify({name,stage:'failed',message:error instanceof Error?error.message:'Unknown failure'}));}
}
