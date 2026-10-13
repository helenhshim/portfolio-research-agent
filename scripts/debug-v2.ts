// Opt-in public E1 fixture only. Never captures arbitrary user prompts or API credentials.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {runV2ControlledTurn} from '../src/lib/v2-controller.ts';
import {createV2Provider,V2SpendLedger,V2_MODEL,V2_SCHEMA_VERSION,V2_PROMPT_VERSION,type V2Trace} from '../src/lib/v2-provider.ts';
import {hasIdentifiedSensitiveInput,createV2Toolbox} from '../src/lib/v2-safety.ts';
import {verifyV2Draft} from '../src/lib/v2-verifier.ts';

const bytes=await readFile(new URL('../src/data/nvda-quarter-pair.json',import.meta.url));
const packet=JSON.parse(bytes.toString()),sourceHash=createHash('sha256').update(bytes).digest('hex');
const args=process.argv.slice(2);
const publicRequest={question:"Does NVIDIA's latest report strengthen or weaken the case for durable operating profitability?",history:[]};
type RunOptions=NonNullable<Parameters<typeof runV2ControlledTurn>[3]>;
type RunTiming=Parameters<NonNullable<RunOptions['onTiming']>>[0];
async function runPublicFixture(ledger:V2SpendLedger,directory:URL,run?:number){
 const traces:V2Trace[]=[],timings:RunTiming[]=[];let draft:unknown,incompleteText:string|undefined;
 const before=ledger.reservedOrEstimatedUsd;
 const provider=createV2Provider(process.env.OPENAI_API_KEY!,{ledger,onTrace:trace=>traces.push(trace),onDraft:output=>{draft=output;},onIncompleteText:text=>{incompleteText=text;}});
 const started=performance.now();
 const result=await runV2ControlledTurn(publicRequest,packet,provider,{onTiming:timing=>timings.push(timing)});
 const elapsedMs=Math.round(performance.now()-started);
 await mkdir(directory,{recursive:true,mode:0o700});
 const draftSafe=draft!==undefined&&!hasIdentifiedSensitiveInput(JSON.stringify(draft));
 const resultSafe=!hasIdentifiedSensitiveInput(JSON.stringify(result));
 const incompleteSafe=typeof incompleteText==='string'&&!hasIdentifiedSensitiveInput(incompleteText);
 const capture={case_id:'E1',source_hash:sourceHash,model:V2_MODEL,effort:'low',prompt_version:V2_PROMPT_VERSION,schema_version:V2_SCHEMA_VERSION,traces,timings,elapsed_ms:elapsedMs,budget_cap_usd:ledger.capUsd,reserved_or_estimated_usd:ledger.reservedOrEstimatedUsd,run_reserved_or_estimated_usd:Math.max(0,ledger.reservedOrEstimatedUsd-before),draft_saved:draftSafe,incomplete_text_saved:incompleteSafe,
  ...(run!==undefined?{run}:{}),...(draftSafe?{draft}:{}),...(incompleteSafe?{incomplete_text:incompleteText}:{}),...(resultSafe?{result}:{result:{status:result.status,counts:result.counts}})};
 const path=new URL('result.json',directory);await writeFile(path,JSON.stringify(capture,null,2),{mode:0o600});
 const summary={...(run!==undefined?{run}:{}),status:result.status,counts:result.counts,elapsed_ms:elapsedMs,reserved_or_estimated_usd:ledger.reservedOrEstimatedUsd,run_reserved_or_estimated_usd:capture.run_reserved_or_estimated_usd,draft_saved:draftSafe,incomplete_text_saved:incompleteSafe,capture:path.pathname,
  provider_timings:traces.map(trace=>({provider_call:trace.provider_call,elapsed_ms:trace.elapsed_ms,first_event_ms:trace.first_event_ms,first_text_ms:trace.first_text_ms,output_chars:trace.output_chars,status:trace.status,incomplete_reason:trace.incomplete_reason,usage:trace.usage})),
  ...('output' in result?{drops:result.output?.drops}:{error_code:result.error_code})};
 console.log(JSON.stringify(summary));
 return summary;
}
function configuredLedger(){
 if(!process.env.OPENAI_API_KEY)throw Error('Configure OPENAI_API_KEY locally; never post it in chat.');
 const cap=Number(process.env.V2_DEBUG_CAP_USD??1);
 if(!Number.isFinite(cap)||cap<=0||cap>1)throw Error('Public debug cap must be greater than zero and at most $1.');
 return new V2SpendLedger(cap);
}
function durationSummary(values:number[]){
 const ordered=[...values].sort((a,b)=>a-b),middle=Math.floor(ordered.length/2);
 return ordered.length?{median_ms:ordered.length%2?ordered[middle]:Math.round((ordered[middle-1]+ordered[middle])/2),max_ms:ordered.at(-1)!}:null;
}
if(args[0]==='--replay'&&args.length===2){
 let capture:any;try{capture=JSON.parse(await readFile(args[1],'utf8'));}catch{throw Error('Cannot read a public debug capture.');}
 if(capture.case_id!=='E1')throw Error('Only the public E1 fixture is supported.');
 if(capture.source_hash!==sourceHash)throw Error('Source version mismatch; do not silently replay against different evidence.');
 if(!capture.draft)throw Error('This capture contains no completed replayable draft.');
 if(hasIdentifiedSensitiveInput(JSON.stringify(capture.draft)))throw Error('This capture contains identified sensitive patterns and cannot be replayed.');
 const result=verifyV2Draft(capture.draft,createV2Toolbox(packet));
 console.log(JSON.stringify({status:result.status,drops:result.drops,original_schema:capture.schema_version,current_schema:V2_SCHEMA_VERSION},null,2));
 process.exitCode=result.status==='check_failed'?1:0;
}else if(args.length===1&&args[0]==='--live'){
 const result=await runPublicFixture(configuredLedger(),new URL(`../.research-runs/public-v2-${randomUUID()}/`,import.meta.url));
 process.exitCode=['complete','partial'].includes(result.status)?0:1;
}else if(args[0]==='--benchmark'&&args.length<=2){
 const count=args[1]===undefined?3:/^[1-5]$/.test(args[1])?Number(args[1]):NaN;
 if(!Number.isInteger(count))throw Error('Public benchmark count must be an integer from 1 to 5.');
 // One shared ledger is the cap for the entire benchmark, including failed runs.
 const ledger=configuredLedger(),directory=new URL(`../.research-runs/public-v2-benchmark-${randomUUID()}/`,import.meta.url);
 const runs:Awaited<ReturnType<typeof runPublicFixture>>[]=[];
 for(let index=1;index<=count;index++){
  const result=await runPublicFixture(ledger,new URL(`run-${index}/`,directory),index);runs.push(result);
  if('error_code' in result&&result.error_code==='spend_limit')break;
 }
 const checked=runs.filter(run=>['complete','partial'].includes(run.status));
 const summary={event:'v2_public_benchmark',case_id:'E1',source_hash:sourceHash,model:V2_MODEL,effort:'low',prompt_version:V2_PROMPT_VERSION,schema_version:V2_SCHEMA_VERSION,runs_requested:count,runs_completed:runs.length,checked_completions:checked.length,complete_without_drops:runs.filter(run=>run.status==='complete').length,checked_completion_rate:checked.length/runs.length,all_attempt_durations:durationSummary(runs.map(run=>run.elapsed_ms)),checked_answer_durations:durationSummary(checked.map(run=>run.elapsed_ms)),budget_cap_usd:ledger.capUsd,reserved_or_estimated_usd:ledger.reservedOrEstimatedUsd,stopped_due_to_spend_cap:runs.some(run=>'error_code' in run&&run.error_code==='spend_limit'),runs};
 const path=new URL('summary.json',directory);await writeFile(path,JSON.stringify(summary,null,2),{mode:0o600});
 console.log(JSON.stringify({...summary,runs:undefined,capture:path.pathname}));
 process.exitCode=checked.length===count?0:1;
}else{
 throw Error('Use --live for one public E1 turn, --benchmark [1..5] for sequential public E1 turns sharing a $1 cap (default 3), or --replay PATH for a saved public fixture with no API call.');
}
