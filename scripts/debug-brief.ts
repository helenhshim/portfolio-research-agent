import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import {pairedRequest,pairedDraft} from '../src/lib/paired-research.ts';
import {structured} from '../src/lib/engine.ts';
import {verifyQuarterPair} from '../src/lib/quarter-pair.ts';
const packet=JSON.parse(await readFile(new URL('../src/data/nvda-quarter-pair.json',import.meta.url),'utf8'));
const inputs=process.argv.includes('--income')?{primary_goal:'income',holding_period:'short',risk_tolerance:'low',tickers:['NVDA'],holding_rationale:'dependable_income'}:process.argv.includes('--growth')?{primary_goal:'growth',holding_period:'long',risk_tolerance:'medium',tickers:['NVDA'],holding_rationale:'profitable_growth'}:{primary_goal:'income',holding_period:'short',risk_tolerance:'medium',tickers:['NVDA'],holding_rationale:'profitable_growth'};
if(!process.env.OPENAI_API_KEY)throw Error('API key not configured');
const directory=new URL(`../.research-runs/brief-debug-${randomUUID()}/`,import.meta.url);
await mkdir(directory,{recursive:true});
await writeFile(new URL('experiment.json',directory),JSON.stringify({inputs,packet_sha256:createHash('sha256').update(JSON.stringify(packet)).digest('hex'),concurrent:true},null,2));
console.log(JSON.stringify({stage:'started',directory:directory.pathname}));
const variants:[string,boolean,'low'|'high'][]=process.argv.includes('--bounds')?[['unbounded-low',true,'low'],['bounded-low',true,'low']]:process.argv.includes('--single')?[['stable-low',true,'low']]:process.argv.includes('--repeat')?[['stable-low-repeat-a',true,'low'],['stable-low-repeat-b',true,'low']]:[['legacy-high',false,'high'],['stable-high',true,'high'],['stable-low',true,'low']];
await Promise.allSettled(variants.map(async([name,stable,effort])=>{
 try{
  const {schema,content}=pairedRequest(packet,inputs,stable);
  if(name==='unbounded-low'){const walk=(o:any)=>{if(o?.properties?.finding_ids)delete o.properties.finding_ids.maxItems;if(o?.properties?.fact_ids)delete o.properties.fact_ids.maxItems;if(o&&typeof o==='object')for(const c of Object.values(o))if(c&&typeof c==='object')walk(c);};walk(schema);}
  const response=await structured('quarter_pair_brief',schema,content,process.env.OPENAI_API_KEY!,effort,true);
  const draft=pairedDraft(response.value,stable);
  const result=verifyQuarterPair(draft,packet,inputs.holding_rationale);
  const declared=draft.findings.map((f:any)=>f.id);
  const surviving=result.findings.map((f:any)=>f.id);
  const diagnostics={declared_findings:declared,surviving_findings:surviving,assessment_references:draft.premise_assessment.finding_ids,missing_assessment_references:draft.premise_assessment.finding_ids.filter((id:string)=>!surviving.includes(id)),interpretation_references:draft.interpretations.map((i:any)=>({id:i.id,references:i.finding_ids})),drops:result.drops,comparison_drops:result.comparison_checks.drops};
  await writeFile(new URL(name+'.json',directory),JSON.stringify({inputs,raw_draft:response.value,result,trace:response.trace,diagnostics},null,2));
  console.log(JSON.stringify({name,elapsed_ms:response.trace.elapsed_ms,usage:response.trace.usage,headline:result.premise_assessment?.headline,diagnostics}));
 }catch(error){const message=error instanceof Error?error.message:'Trial failed';await writeFile(new URL(name+'.error.json',directory),JSON.stringify({error:message,diagnostics:(error as any)?.diagnostics}));const d=(error as any)?.diagnostics;console.log(JSON.stringify({name,error:message,elapsed_ms:d?.elapsed_ms,usage:d?.usage,partial_length:d?.partial_output_text?.length}));}
}));
