// Public fixtures only. Interleaved prompt experiment, shared deployed spending cap.
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {Redis} from '@upstash/redis';
import {V3SharedBudget} from '../src/lib/v3-shared-budget.ts';
import {createV3Provider,V3SpendLedger} from '../src/lib/v3-provider.ts';
import {runV3ControlledTurn} from '../src/lib/v3-controller.ts';
if(!process.env.OPENAI_API_KEY||!process.env.KV_REST_API_TOKEN)throw Error('Configure local API and Redis credentials without printing them.');
const packet=JSON.parse(readFileSync('src/data/nvda-quarter-pair.json','utf8'));
const shared=new V3SharedBudget(new Redis({url:process.env.KV_REST_API_URL!,token:process.env.KV_REST_API_TOKEN!,retry:false}));
const local=new V3SpendLedger(1);
const ledger={async reserve(bytes:number){const settleLocal=local.reserve(bytes),settleShared=await shared.reserve(bytes);return async(usage:any)=>{settleLocal(usage);await settleShared(usage);};}};
const directory='.research-runs/latency-'+Date.now();mkdirSync(directory,{recursive:true});
const questions={attribution:'What contribution does management attribute to product mix, pricing, manufacturing costs or Rubin ramp economics?',comparison:'What gross margin did NVIDIA report, and what margin does management expect next?',E1:"Does NVIDIA's latest report strengthen or weaken the case for durable operating profitability?",cash:'Why did cash flow fall? Does that mean margins are deteriorating?'};
const cases:ReadonlyArray<readonly [keyof typeof questions,string]>=process.argv.includes('--cash-actions')?[['cash','actions']]:process.argv.includes('--question-first')?[['attribution','question-first'],['comparison','question-first']]:process.argv.includes('--compact')?[['E1','compact'],['cash','compact']]:[['E1','baseline'],['E1','concise'],['cash','concise'],['cash','baseline']];
for(const [id,variant] of cases){
 const traces:any[]=[],timings:any[]=[],findings:any[]=[];let draft:any;
 const provider=createV3Provider(process.env.OPENAI_API_KEY!,{ledger,compactReferences:variant==='compact',fetch:async(url,init)=>{
  const body=JSON.parse(String(init?.body));
  if(variant==='concise')body.instructions=body.instructions.replace('at most one hundred and twenty words','at most eighty words').replace('at most seven hundred words','at most four hundred and fifty words')+' Prioritize explanatory density: each finding should contain the decisive evidence, its mechanism and its essential qualification, without repeating the summary in the detail. Keep all material opposing evidence and relevant business developments; combine related points only when their evidence and limits remain explicit.';
  return fetch(url,{...init,body:JSON.stringify(body)});
 },onTrace:t=>traces.push(t),onDraft:d=>draft=d});
 const start=performance.now();const result=await runV3ControlledTurn({question:questions[id],history:process.argv.includes('--continuity')?[{role:'user',text:'How does reported gross margin compare with management outlook?'},{role:'assistant',text:'Already discussed: reported GAAP gross margin is 75.0%, while next-quarter management outlook is 74.0%, plus or minus 50 basis points. Guidance is not a realized result. Unresolved: attribution of the expected change to pricing, mix, manufacturing costs or Rubin ramp economics.'}]:[]},packet,provider,{onTiming:t=>timings.push(t),onFinding:f=>findings.push({id:f.id,ms:Math.round(performance.now()-start)})});
 const record={id,variant,ms:Math.round(performance.now()-start),findings,traces,timings,result,draft};
 writeFileSync(`${directory}/${id}-${variant}.json`,JSON.stringify(record,null,2),{mode:0o600});
 console.log(JSON.stringify({id,variant,status:result.status,ms:record.ms,first:findings[0]?.ms,usage:traces.map(t=>t.usage),timings,counts:result.counts,capture:directory}));
}
