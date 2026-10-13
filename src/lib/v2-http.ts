import {runV2ControlledTurn,type V2Provider,type V2Timing} from './v2-controller.ts';
import {exactKeys,validateV2Request,V2PolicyError,V2_LIMITS} from './v2-safety.ts';
import {packetCoverage,presentV2Result,presentV2Finding} from './v2-presentation.ts';
import {plainArtifactText,type ResearchStage,type TurnIdentity} from './v2-display.ts';
type Dependencies={packet:unknown;configured:()=>boolean;provider:(identity:TurnIdentity)=>V2Provider;maxConcurrent?:number;onDiagnostics?:(data:unknown)=>void};
export function createV2Handler(deps:Dependencies){
 let active=0;return async function POST(request:Request){
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  const reject=(code:string,status:number)=>Response.json({error_code:code},{status,headers});
  let origin:URL;try{origin=new URL(request.headers.get('origin')??'');}catch{return reject('origin',403);}
  const requestUrl=new URL(request.url),host=request.headers.get('host')??requestUrl.host;
  if(!['http:','https:'].includes(origin.protocol)||origin.protocol!==requestUrl.protocol||origin.host!==host)return reject('origin',403);
  if(request.headers.get('content-type')?.split(';')[0]!=='application/json')return reject('invalid_input',400);
  let input:ReturnType<typeof validateV2Request>,identity:TurnIdentity;
  try{
   const reader=request.body?.getReader();if(!reader)throw new V2PolicyError('invalid_input');
   const decoder=new TextDecoder();let body='',bytes=0;
   while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.length;if(bytes>V2_LIMITS.envelopeBytes){await reader.cancel();throw new V2PolicyError('input_limit');}body+=decoder.decode(chunk.value,{stream:true});}body+=decoder.decode();
   const envelope=JSON.parse(body);exactKeys(envelope,['question','history','identity']);
   exactKeys(envelope.identity,['session_id','turn_id','revision']);identity=envelope.identity;
   if(![identity.session_id,identity.turn_id].every(v=>typeof v==='string'&&/^[a-zA-Z0-9-]{1,64}$/.test(v))||!Number.isSafeInteger(identity.revision)||identity.revision<1)throw new V2PolicyError('invalid_input');
   input=validateV2Request({question:envelope.question,history:envelope.history});
  }catch(error){return reject(error instanceof V2PolicyError?error.code:'invalid_input',400);}
  if(!deps.configured())return reject('unavailable',503);
  if(active>=(deps.maxConcurrent??1))return reject('busy',429);
  active++;
  const encoder=new TextEncoder(),abort=new AbortController();let closed=false;
  const started=performance.now(),elapsed=()=>Math.max(0,Math.round(performance.now()-started));
  const disconnect=()=>abort.abort();request.signal.addEventListener('abort',disconnect,{once:true});if(request.signal.aborted)abort.abort();
  const stream=new ReadableStream({async start(controller){
   const send=(data:unknown)=>{if(closed)return;try{controller.enqueue(encoder.encode(JSON.stringify(data)+'\n'));}catch{closed=true;abort.abort();}};
   try{
    const timings:V2Timing[]=[];let firstVerifiedFindingMs:number|null=null,verifiedFindings=0;
    const coverage=packetCoverage(deps.packet);
    const result=await runV2ControlledTurn(input,deps.packet,deps.provider(identity),{signal:abort.signal,onTiming:timing=>timings.push(timing),onStage:stage=>send({type:'stage',stage:stage as ResearchStage,elapsed_ms:elapsed(),identity}),
     onFinding:(finding,facts)=>{firstVerifiedFindingMs??=elapsed();verifiedFindings++;send({type:'finding',finding:presentV2Finding(finding,coverage.sources),facts,sources:coverage.sources,cutoff:coverage.cutoff,identity});},
     onFindingsReset:()=>send({type:'findings_reset',identity}),
    });
    const presenting=performance.now();
    const artifact=presentV2Result(result,coverage,input.question,identity.revision);
    deps.onDiagnostics?.({identity,elapsed_ms:elapsed(),first_verified_finding_ms:firstVerifiedFindingMs,verified_findings_published:verifiedFindings,timings,presentation_ms:Math.max(0,Math.round(performance.now()-presenting)),status:result.status,counts:result.counts,...('output' in result?{drops:result.output?.drops}:{}),...('error_code' in result?{error_code:result.error_code}:{})});
    // DESIGN-DECISION: Coverage/clarification answers belong in the thread and preserve
    // the last useful brief. Mechanical success is not semantic task completion.
    const preserve=artifact&&['out_of_scope','clarification'].includes(artifact.answer_kind);
    send({type:'result',result:{status:preserve?artifact.answer_kind:result.status,identity,run:{elapsed_ms:elapsed(),...result.counts},
     ...(!preserve&&artifact?{artifact}:{}),...(preserve?{message:plainArtifactText(artifact)}:{}),...('error_code' in result?{error_code:result.error_code}:{})}});
   }catch{send({type:'result',result:{status:'failed',error_code:'research_failed',identity}});}
   finally{active--;request.signal.removeEventListener('abort',disconnect);if(!closed){closed=true;controller.close();}}
  },cancel(){closed=true;abort.abort();}});
  return new Response(stream,{headers:{...headers,'Content-Type':'application/x-ndjson','Content-Encoding':'identity'}});
 };
}
