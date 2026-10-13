import {runV3ControlledTurn,type V3Provider,type V3Timing} from './v3-controller.ts';
import {exactKeys,validateV3Request,V3PolicyError,V3_LIMITS} from './v3-safety.ts';
import {packetCoverage,presentV3Result,presentV3Finding} from './v3-presentation.ts';
import {plainArtifactText,V3_RESEARCH_PROTOCOL,type ResearchStage,type TurnIdentity} from './v3-display.ts';
import {createHash} from 'node:crypto';
type Dependencies={packet:unknown;configured:()=>boolean;provider:(identity:TurnIdentity)=>V3Provider;maxConcurrent?:number;onDiagnostics?:(data:unknown)=>void;onCancellation?:(data:{run_id:string;elapsed_ms:number})=>void};
const legacyStages=new Set(['preparing','researching','investigating','checking','recovering']);
export function createV3Handler(deps:Dependencies){
 let active=0;return async function POST(request:Request){
  // A tab may still run the prior JS bundle after a server upgrade. Its parser
  // understands only stage/result, so new events require explicit capability opt-in.
  const progressive=request.headers.get('x-research-protocol')===V3_RESEARCH_PROTOCOL;
  const protocol=progressive?V3_RESEARCH_PROTOCOL:'result-v1';
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Research-Protocol':protocol};
  const reject=(code:string,status:number)=>Response.json({error_code:code},{status,headers});
  let origin:URL;try{origin=new URL(request.headers.get('origin')??'');}catch{return reject('origin',403);}
  const requestUrl=new URL(request.url),host=request.headers.get('host')??requestUrl.host;
  if(!['http:','https:'].includes(origin.protocol)||origin.protocol!==requestUrl.protocol||origin.host!==host)return reject('origin',403);
  if(request.headers.get('content-type')?.split(';')[0]!=='application/json')return reject('invalid_input',400);
  let input:ReturnType<typeof validateV3Request>,identity:TurnIdentity;
  try{
   const reader=request.body?.getReader();if(!reader)throw new V3PolicyError('invalid_input');
   const decoder=new TextDecoder();let body='',bytes=0;
   while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.length;if(bytes>V3_LIMITS.envelopeBytes){await reader.cancel();throw new V3PolicyError('input_limit');}body+=decoder.decode(chunk.value,{stream:true});}body+=decoder.decode();
   const envelope=JSON.parse(body);exactKeys(envelope,['question','history','identity']);
   exactKeys(envelope.identity,['session_id','turn_id','revision']);identity=envelope.identity;
   if(![identity.session_id,identity.turn_id].every(v=>typeof v==='string'&&/^[a-zA-Z0-9-]{1,64}$/.test(v))||!Number.isSafeInteger(identity.revision)||identity.revision<1)throw new V3PolicyError('invalid_input');
   input=validateV3Request({question:envelope.question,history:envelope.history});
  }catch(error){return reject(error instanceof V3PolicyError?error.code:'invalid_input',400);}
  if(!deps.configured())return reject('unavailable',503);
  if(active>=(deps.maxConcurrent??1))return reject('busy',429);
  active++;
  const encoder=new TextEncoder(),abort=new AbortController();let closed=false;
  const started=performance.now(),elapsed=()=>Math.max(0,Math.round(performance.now()-started));
  const disconnect=()=>{if(abort.signal.aborted)return;abort.abort();deps.onCancellation?.({run_id:createHash('sha256').update(JSON.stringify(identity)).digest('hex'),elapsed_ms:elapsed()});};request.signal.addEventListener('abort',disconnect,{once:true});if(request.signal.aborted)abort.abort();
  const stream=new ReadableStream({async start(controller){
   const send=(data:unknown)=>{if(closed)return;try{controller.enqueue(encoder.encode(JSON.stringify(data)+'\n'));}catch{closed=true;abort.abort();}};
   try{
    const timings:V3Timing[]=[];let firstVerifiedFindingMs:number|null=null,verifiedFindings=0;
    const coverage=packetCoverage(deps.packet);
    const result=await runV3ControlledTurn(input,deps.packet,deps.provider(identity),{signal:abort.signal,onTiming:timing=>timings.push(timing),onStage:stage=>{if(progressive||legacyStages.has(stage))send({type:'stage',stage:stage as ResearchStage,elapsed_ms:elapsed(),identity});},
     onFinding:(finding,facts,discrepancies)=>{if(!progressive)return;firstVerifiedFindingMs??=elapsed();verifiedFindings++;send({type:'finding',finding:presentV3Finding(finding,coverage.sources),facts,sources:coverage.sources,cutoff:coverage.cutoff,identity,discrepancies});},
     onFindingsReset:()=>{if(progressive)send({type:'findings_reset',identity});},
    });
    const presenting=performance.now();
    const artifact=presentV3Result(result,coverage,input.question,identity.revision);
    // Never log user-controlled identity strings, fact IDs, questions, history,
    // provider error bodies, quotes or draft contents. Retain operational counts.
    const run_id=createHash('sha256').update(JSON.stringify(identity)).digest('hex');
    deps.onDiagnostics?.({run_id,protocol,elapsed_ms:elapsed(),first_verified_finding_ms:firstVerifiedFindingMs,verified_findings_published:verifiedFindings,timings,presentation_ms:Math.max(0,Math.round(performance.now()-presenting)),status:result.status,counts:result.counts,...('output' in result?{drops:result.output?.drops.map(d=>({kind:d.kind,...(d.reason?{reason:d.reason}:{})}))}:{}),...('error_code' in result?{error_code:result.error_code}:{})});
    // DESIGN-DECISION: Coverage/clarification answers belong in the thread and preserve
    // the last useful brief. Mechanical success is not semantic task completion.
    const preserve=artifact&&['out_of_scope','clarification'].includes(artifact.answer_kind);
    send({type:'result',result:{status:preserve?artifact.answer_kind:result.status,identity,run:{elapsed_ms:elapsed(),...result.counts},discrepancies:'output' in result?result.output?.discrepancies:result.discrepancies,
     ...(!preserve&&artifact?{artifact}:{}),...(preserve?{message:plainArtifactText(artifact)}:{}),...('error_code' in result?{error_code:result.error_code}:{})}});
   }catch{send({type:'result',result:{status:'failed',error_code:'research_failed',identity}});}
   finally{active--;request.signal.removeEventListener('abort',disconnect);if(!closed){closed=true;controller.close();}}
  },cancel(){closed=true;disconnect();}});
  return new Response(stream,{headers:{...headers,'Content-Type':'application/x-ndjson','Content-Encoding':'identity'}});
 };
}
