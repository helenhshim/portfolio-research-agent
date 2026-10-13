// Reusable V2 controller core. No provider, credential or HTTP endpoint is installed here.
import {createV2Toolbox,validateV2Request,V2RunBudget,V2PolicyError,exactKeys,type V2ToolCall,type V2Request} from './v2-safety.ts';
import {verifyV2Draft,v2DraftSchema} from './v2-verifier.ts';
export type V2ProviderInput={request:V2Request;source_context:ReturnType<ReturnType<typeof createV2Toolbox>['sourceContext']>;tool_results:unknown[];schema:typeof v2DraftSchema};
export type V2Provider=(input:V2ProviderInput,signal:AbortSignal)=>Promise<unknown>;
export type V2Timing={step:'preparing'|'provider'|'tools'|'checking';elapsed_ms:number;provider_call?:number;result_kind?:'answer'|'tools'|'failed';tool_names?:string[];error_code?:string};
function controlledWait<T>(work:(signal:AbortSignal)=>Promise<T>,budget:V2RunBudget,parent?:AbortSignal):Promise<T>{
 budget.assertActive();const abort=new AbortController();
 return new Promise((resolve,reject)=>{
  const finish=(error?:unknown,value?:T)=>{clearTimeout(timer);parent?.removeEventListener('abort',stopped);error?reject(error):resolve(value as T);};
  const stopped=()=>{abort.abort();finish(new V2PolicyError('stopped'));};
  const timer=setTimeout(()=>{abort.abort();finish(new V2PolicyError('deadline'));},budget.remainingMs);
  parent?.addEventListener('abort',stopped,{once:true});
  if(parent?.aborted){stopped();return;}
  // Attaching both handlers also consumes errors from a late/aborted provider promise.
  Promise.resolve().then(()=>{budget.assertActive();return work(abort.signal);}).then(value=>{
   try{budget.assertActive();finish(undefined,value);}catch(error){finish(error);}
  },error=>finish(error));
 });
}
export async function runV2ControlledTurn(input:unknown,packet:any,provider:V2Provider,options:{signal?:AbortSignal;deadlineMs?:number;onStage?:(stage:string)=>void;onTiming?:(timing:V2Timing)=>void}={}){
 const budget=new V2RunBudget(options);
 const timing=(step:V2Timing['step'],started:number,extra:Partial<V2Timing>={})=>options.onTiming?.({step,elapsed_ms:Math.max(0,Math.round(performance.now()-started)),...extra});
 try{
  const request=validateV2Request(input);budget.assertActive();options.onStage?.('preparing');const preparing=performance.now(),toolbox=createV2Toolbox(packet);timing('preparing',preparing);
  let toolResults:unknown[]=[];let formatRetry=false;
  for(let attempt=0;attempt<2;attempt++){
   budget.reserveProvider();
   options.onStage?.(formatRetry?'recovering':'researching');
   const started=performance.now();let result:any,errorCode:string|undefined;
   try{result=await controlledWait(signal=>provider({request:structuredClone(request),source_context:toolbox.sourceContext(),tool_results:structuredClone(toolResults),schema:structuredClone(v2DraftSchema)},signal),budget,options.signal);}
   catch(error){
    errorCode=error instanceof V2PolicyError?error.code:'research_failed';
    // Only a detected JSON formatting loop can use the remaining request slot.
    // No partial draft or unsupported fact is accepted or fed back as evidence.
    if(errorCode==='provider_whitespace_loop'&&attempt===0){formatRetry=true;continue;}
    throw error;
   }
   finally{timing('provider',started,{provider_call:attempt+1,result_kind:['answer','tools'].includes(result?.kind)?result.kind:'failed',...(errorCode?{error_code:errorCode}:{})});}
   budget.assertActive();exactKeys(result,['kind','draft','calls']);
   if(result.kind==='answer'){
    if(!Object.hasOwn(result,'draft')||Object.hasOwn(result,'calls'))throw new V2PolicyError('invalid_provider_result');
    options.onStage?.('checking');
    const checking=performance.now(),output=verifyV2Draft(result.draft,toolbox);timing('checking',checking);
    return {status:output.status,output:{...output,facts:[...toolbox.facts.values()],sources:toolbox.sourceContext().sources,source_cutoff:packet.source_cutoff},counts:budget.counts};
   }
   if(result.kind!=='tools'||Object.hasOwn(result,'draft')||!Object.hasOwn(result,'calls'))throw new V2PolicyError('invalid_provider_result');
   // A final model request cannot start another tool round or hidden third request.
   if(attempt===1)throw new V2PolicyError('tool_limit');
   options.onStage?.('investigating');const tools=performance.now();toolResults=toolbox.executeRound(result.calls as V2ToolCall[],budget);timing('tools',tools,{tool_names:result.calls.map((call:V2ToolCall)=>call.name)});
  }
  throw new V2PolicyError('provider_limit');
 }catch(error){
  // Never return provider error text, prompts, credentials or failed draft contents.
  const error_code=error instanceof V2PolicyError?error.code:'research_failed';
  return {status:error_code==='stopped'?'stopped':'failed',error_code,counts:budget.counts};
 }
}
