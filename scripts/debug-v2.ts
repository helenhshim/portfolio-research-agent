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
 if(!process.env.OPENAI_API_KEY)throw Error('Configure OPENAI_API_KEY locally; never post it in chat.');
 const ledger=new V2SpendLedger(1),traces:V2Trace[]=[];let draft:unknown;
 const provider=createV2Provider(process.env.OPENAI_API_KEY,{ledger,onTrace:trace=>traces.push(trace),onDraft:output=>{draft=output;}});
 const started=Date.now();
 const result=await runV2ControlledTurn({question:"Does NVIDIA's latest report strengthen or weaken the case for durable operating profitability?",history:[]},packet,provider);
 const directory=new URL(`../.research-runs/public-v2-${randomUUID()}/`,import.meta.url);await mkdir(directory,{recursive:true,mode:0o700});
 const draftSafe=draft!==undefined&&!hasIdentifiedSensitiveInput(JSON.stringify(draft));
 const resultSafe=!hasIdentifiedSensitiveInput(JSON.stringify(result));
 const capture={case_id:'E1',source_hash:sourceHash,model:V2_MODEL,effort:'low',prompt_version:V2_PROMPT_VERSION,schema_version:V2_SCHEMA_VERSION,traces,elapsed_ms:Date.now()-started,budget_cap_usd:ledger.capUsd,reserved_or_estimated_usd:ledger.reservedOrEstimatedUsd,draft_saved:draftSafe,
  ...(draftSafe?{draft}:{}),...(resultSafe?{result}:{result:{status:result.status,counts:result.counts}})};
 const path=new URL('result.json',directory);await writeFile(path,JSON.stringify(capture,null,2),{mode:0o600});
 console.log(JSON.stringify({status:result.status,counts:result.counts,elapsed_ms:capture.elapsed_ms,reserved_or_estimated_usd:capture.reserved_or_estimated_usd,draft_saved:draftSafe,capture:path.pathname,...('output' in result?{drops:result.output?.drops}:{error_code:result.error_code})},null,2));
 process.exitCode=['complete','partial'].includes(result.status)?0:1;
}else{
 throw Error('Use --live for one public E1 turn capped at $1, or --replay PATH for a saved public fixture with no API call.');
}
