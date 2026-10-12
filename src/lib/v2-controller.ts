// Reusable V2 controller core. No provider, credential or HTTP endpoint is installed here.
import {createV2Toolbox,validateV2Request,V2RunBudget,V2PolicyError,exactKeys,type V2ToolCall,type V2Request} from './v2-safety.ts';
import {verifyV2Draft,v2DraftSchema} from './v2-verifier.ts';
export type V2ProviderInput={request:V2Request;source_context:ReturnType<ReturnType<typeof createV2Toolbox>['sourceContext']>;tool_results:unknown[];schema:typeof v2DraftSchema};
export type V2Provider=(input:V2ProviderInput,signal:AbortSignal)=>Promise<unknown>;
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
export async function runV2ControlledTurn(input:unknown,packet:any,provider:V2Provider,options:{signal?:AbortSignal;deadlineMs?:number;onStage?:(stage:string)=>void}={}){
 const budget=new V2RunBudget(options);
 try{
  const request=validateV2Request(input);budget.assertActive();options.onStage?.('preparing');const toolbox=createV2Toolbox(packet);
  let toolResults:unknown[]=[];
  for(let attempt=0;attempt<2;attempt++){
   budget.reserveProvider();
   options.onStage?.('researching');
   const result:any=await controlledWait(signal=>provider({request:structuredClone(request),source_context:toolbox.sourceContext(),tool_results:structuredClone(toolResults),schema:structuredClone(v2DraftSchema)},signal),budget,options.signal);
   budget.assertActive();exactKeys(result,['kind','draft','calls']);
   if(result.kind==='answer'){
    if(!Object.hasOwn(result,'draft')||Object.hasOwn(result,'calls'))throw new V2PolicyError('invalid_provider_result');
    options.onStage?.('checking');
    const output=verifyV2Draft(result.draft,toolbox);
    return {status:output.status,output:{...output,facts:[...toolbox.facts.values()],sources:toolbox.sourceContext().sources,source_cutoff:packet.source_cutoff},counts:budget.counts};
   }
   if(result.kind!=='tools'||Object.hasOwn(result,'draft')||!Object.hasOwn(result,'calls'))throw new V2PolicyError('invalid_provider_result');
   // A final model request cannot start another tool round or hidden third request.
   if(attempt===1)throw new V2PolicyError('tool_limit');
   options.onStage?.('investigating');toolResults=toolbox.executeRound(result.calls as V2ToolCall[],budget);
  }
  throw new V2PolicyError('provider_limit');
 }catch(error){
  // Never return provider error text, prompts, credentials or failed draft contents.
  const error_code=error instanceof V2PolicyError?error.code:'research_failed';
  return {status:error_code==='stopped'?'stopped':'failed',error_code,counts:budget.counts};
 }
}
