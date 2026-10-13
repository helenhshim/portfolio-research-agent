// Reusable V2 controller core. No provider, credential or HTTP endpoint is installed here.
import {createV2Toolbox,validateV2Request,V2RunBudget,V2PolicyError,exactKeys,type V2ToolCall,type V2Request} from './v2-safety.ts';
import {verifyV2Draft,verifyV2Finding,v2DraftSchema,type VerifiedV2Finding} from './v2-verifier.ts';
import type {V2Fact} from './v2-financials.ts';
export type V2ProviderInput={request:V2Request;source_context:ReturnType<ReturnType<typeof createV2Toolbox>['sourceContext']>;tool_results:unknown[];schema:typeof v2DraftSchema};
export type V2ProviderObserver={onFinding:(candidate:unknown)=>void;onFindingsReset:()=>void;onFindingsComplete?:()=>void};
export type V2Provider=(input:V2ProviderInput,signal:AbortSignal,observer?:V2ProviderObserver)=>Promise<unknown>;
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
export async function runV2ControlledTurn(input:unknown,packet:any,provider:V2Provider,options:{signal?:AbortSignal;deadlineMs?:number;onStage?:(stage:string)=>void;onTiming?:(timing:V2Timing)=>void;onFinding?:(finding:VerifiedV2Finding,facts:V2Fact[])=>void;onFindingsReset?:()=>void}={}){
 const budget=new V2RunBudget(options);
 const timing=(step:V2Timing['step'],started:number,extra:Partial<V2Timing>={})=>options.onTiming?.({step,elapsed_ms:Math.max(0,Math.round(performance.now()-started)),...extra});
 try{
  const request=validateV2Request(input);budget.assertActive();options.onStage?.('preparing');const preparing=performance.now(),toolbox=createV2Toolbox(packet);timing('preparing',preparing);
  let toolResults:unknown[]=[];let formatRetry=false;
  for(let attempt=0;attempt<2;attempt++){
   budget.reserveProvider();
   options.onStage?.(formatRetry?'recovering':'researching');
   const started=performance.now();let result:any,errorCode:string|undefined;
   let callOpen=true,progressive=true,developing=false,synthesizing=false,candidates=0;const seen=new Set<string>();
   const reset=()=>{if(!progressive)return;progressive=false;seen.clear();options.onFindingsReset?.();};
   try{result=await controlledWait(signal=>provider({request:structuredClone(request),source_context:toolbox.sourceContext(),tool_results:structuredClone(toolResults),schema:structuredClone(v2DraftSchema)},signal,{
    onFinding(candidate){
     if(!callOpen||!progressive||signal.aborted||options.signal?.aborted)return;
     try{budget.assertActive();}catch{return;}
     const id=(candidate as any)?.id;
     if(++candidates>3||(typeof id==='string'&&seen.has(id))){reset();return;}
     if(typeof id==='string')seen.add(id);
     const finding=verifyV2Finding(candidate,toolbox);if(!finding)return;
     if(!developing){developing=true;options.onStage?.('developing');}
     options.onFinding?.(finding,structuredClone([...toolbox.facts.values()]));
    },
    onFindingsComplete(){
     if(!callOpen||!progressive||!developing||synthesizing||signal.aborted||options.signal?.aborted)return;
     try{budget.assertActive();}catch{return;}
     synthesizing=true;options.onStage?.('synthesizing');
    },
    onFindingsReset(){if(callOpen&&!signal.aborted&&!options.signal?.aborted)reset();},
   }),budget,options.signal);}
   catch(error){
    errorCode=error instanceof V2PolicyError?error.code:'research_failed';
    // Only a detected JSON formatting loop can use the remaining request slot.
    // No partial draft or unsupported fact is accepted or fed back as evidence.
    if(errorCode==='provider_whitespace_loop'&&attempt===0){reset();formatRetry=true;continue;}
    throw error;
   }
   finally{callOpen=false;timing('provider',started,{provider_call:attempt+1,result_kind:['answer','tools'].includes(result?.kind)?result.kind:'failed',...(errorCode?{error_code:errorCode}:{})});}
   budget.assertActive();exactKeys(result,['kind','draft','calls']);
   if(result.kind==='answer'){
    if(!Object.hasOwn(result,'draft')||Object.hasOwn(result,'calls'))throw new V2PolicyError('invalid_provider_result');
    options.onStage?.('checking');
    const checking=performance.now();let output:ReturnType<typeof verifyV2Draft>;
    try{output=verifyV2Draft(result.draft,toolbox);}catch(error){reset();throw error;}
    if(['out_of_scope','clarification'].includes(output.answer_kind))reset();
    timing('checking',checking);
    return {status:output.status,output:{...output,facts:[...toolbox.facts.values()],sources:toolbox.sourceContext().sources,source_cutoff:packet.source_cutoff},counts:budget.counts};
   }
   if(result.kind!=='tools'||Object.hasOwn(result,'draft')||!Object.hasOwn(result,'calls'))throw new V2PolicyError('invalid_provider_result');
   // A final model request cannot start another tool round or hidden third request.
   if(attempt===1)throw new V2PolicyError('tool_limit');
   reset();
   options.onStage?.('investigating');const tools=performance.now();toolResults=toolbox.executeRound(result.calls as V2ToolCall[],budget);timing('tools',tools,{tool_names:result.calls.map((call:V2ToolCall)=>call.name)});
  }
  throw new V2PolicyError('provider_limit');
 }catch(error){
  // Never return provider error text, prompts, credentials or failed draft contents.
  const error_code=error instanceof V2PolicyError?error.code:'research_failed';
  return {status:error_code==='stopped'?'stopped':'failed',error_code,counts:budget.counts};
 }
}
