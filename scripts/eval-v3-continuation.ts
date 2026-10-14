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
import {packetCoverage,presentV3Result} from '../src/lib/v3-presentation.ts';
import {researchContextText} from '../src/lib/v3-display.ts';
const directory='.research-runs/continuation-'+Date.now();mkdirSync(directory,{recursive:true});
async function run(id:string,question:string,history:any[]=[]){
 let draft:any;const traces:any[]=[];
 const provider=createV3Provider(process.env.OPENAI_API_KEY!,{ledger,onDraft:d=>draft=d,onTrace:t=>traces.push(t)});
 let injected=false;const selected=process.argv.includes('--repair-non-gaap')?async(...args:Parameters<typeof provider>)=>{
  if(!injected){injected=true;const fixture=JSON.parse(readFileSync('evals/prototype-3/NON-GAAP-REFERENCE-2026-10-13.json','utf8'));fixture.findings[0].evidence[0].quote='SYNTHETIC mismatched quotation for recovery testing.';return {kind:'answer',draft:fixture};}
  return provider(...args);
 }:provider;
 const start=performance.now();const result=await runV3ControlledTurn({question,history},packet,selected);
 const artifact=presentV3Result(result,packetCoverage(packet),question,1);
 writeFileSync(`${directory}/${id}.json`,JSON.stringify({question,history,result,artifact,draft,traces},null,2),{mode:0o600});
 console.log(JSON.stringify({id,status:result.status,ms:Math.round(performance.now()-start),next:artifact?.next?.question,capture:directory}));
 return artifact;
}
if(process.argv.includes('--non-gaap')||process.argv.includes('--repair-non-gaap')){
 await run('non-gaap','How does NVIDIA’s non-GAAP treatment of equity gains and stock-based compensation affect the usefulness of its earnings comparison?');
}else if(process.argv.includes('--multi-turn')){
 const history:any[]=[];
 for(const [id,question] of [['profitability',"Does NVIDIA's latest report strengthen or weaken the case for durable operating profitability?"],['revenue','How is NVIDIA’s revenue?'],['revenue-repeat','How is NVIDIA’s revenue?']]){
  const answer=await run(id,question,history);
  if(!answer)throw Error('No checked answer for '+id);
  history.push({role:'user',text:question},{role:'assistant',text:researchContextText(answer)});
  if(id==='revenue-repeat'&&answer.next)await run('execute-next',answer.next.question,history);
 }
 await run('attribution','What contribution does management attribute to product mix, pricing, manufacturing costs or Rubin ramp economics?',history.slice(-6));
 await run('current-market','What is NVIDIA’s stock price today, and did it rise this week?');
}else{
const q='How is NVIDIA’s revenue?';const initial=await run('revenue',q);
if(initial?.next)await run('revenue-followup',initial.next.question,[{role:'user',text:q},{role:'assistant',text:researchContextText(initial)}]);
await run('cash','Why did cash flow fall? Does that mean margins are deteriorating?');
await run('attribution','What contribution does management attribute to product mix, pricing, manufacturing costs or Rubin ramp economics?');

}
