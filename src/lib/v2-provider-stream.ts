// Provider streaming stays server-side. Never publish partial, unchecked claims.
import {V2PolicyError} from './v2-safety.ts';
export type V2StreamFailure='missing_body'|'transfer_limit'|'event_limit'|'event_error'|'missing_terminal'|'malformed_event'|'transport_error'|'missing_terminal_response';
export type V2StreamDiagnostics={received_bytes:number;event_count:number;last_event_type:string|null;terminal_event:string|null;failure:V2StreamFailure|null};
export class V2StreamError extends V2PolicyError {
 readonly failure:V2StreamFailure;
 constructor(failure:V2StreamFailure){super('provider_incomplete');this.failure=failure;}
}
const eventTypes=new Set(['response.created','response.in_progress','response.completed','response.incomplete','response.failed','response.output_item.added','response.output_item.done','response.content_part.added','response.content_part.done','response.output_text.delta','response.output_text.done','response.function_call_arguments.delta','response.function_call_arguments.done','response.reasoning_summary_part.added','response.reasoning_summary_part.done','response.reasoning_summary_text.delta','response.reasoning_summary_text.done','response.reasoning_text.delta','response.reasoning_text.done','error']);
// Parsed SSE frames are discarded. Bound retained events separately from cumulative
// wire traffic, which includes protocol metadata and repeated completion content.
export const V2_STREAM_LIMITS=Object.freeze({eventBytes:1_000_000,transferBytes:16_000_000});
export async function readV2ProviderStream(response:Response,onEvent:(event:any)=>void,onDiagnostics?:(data:V2StreamDiagnostics)=>void){
 const diagnostics:V2StreamDiagnostics={received_bytes:0,event_count:0,last_event_type:null,terminal_event:null,failure:null};
 const reader=response.body?.getReader();if(!reader){onDiagnostics?.({...diagnostics,failure:'missing_body'});throw new V2StreamError('missing_body');}
 const decoder=new TextDecoder();let pending='',receivedBytes=0;
 const parse=(block:string)=>{
  if(new TextEncoder().encode(block).byteLength>V2_STREAM_LIMITS.eventBytes)throw new V2StreamError('event_limit');
  const data=block.split('\n').filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trimStart()).join('\n');
  if(!data||data==='[DONE]')return;
  let event:any;try{event=JSON.parse(data);}catch{throw new V2StreamError('malformed_event');}
  if(!event||typeof event!=='object'||Array.isArray(event)||typeof event.type!=='string')throw new V2StreamError('malformed_event');
  diagnostics.event_count++;diagnostics.last_event_type=eventTypes.has(event.type)?event.type:'other';onEvent(event);
  if(event.type==='error')throw new V2StreamError('event_error');
  if(['response.completed','response.incomplete','response.failed'].includes(event.type)){
   diagnostics.terminal_event=event.type;
   if(!event.response||typeof event.response!=='object')throw new V2StreamError('missing_terminal_response');
   return event.response;
  }
 };
 try{
  while(true){
   const chunk=await reader.read();if(chunk.done)break;
   receivedBytes+=chunk.value.byteLength;diagnostics.received_bytes=receivedBytes;if(receivedBytes>V2_STREAM_LIMITS.transferBytes)throw new V2StreamError('transfer_limit');
   pending+=decoder.decode(chunk.value,{stream:true});
   // CRLF framing may itself be split across network chunks.
   let match;while((match=/\r?\n\r?\n/.exec(pending))){
    const block=pending.slice(0,match.index).replaceAll('\r\n','\n');pending=pending.slice(match.index+match[0].length);
    const terminal=parse(block);if(terminal)return terminal;
   }
   if(new TextEncoder().encode(pending).byteLength>V2_STREAM_LIMITS.eventBytes)throw new V2StreamError('event_limit');
  }
  pending+=decoder.decode();const terminal=parse(pending.replaceAll('\r\n','\n'));if(terminal)return terminal;
  throw new V2StreamError('missing_terminal');
 }catch(error){diagnostics.failure=error instanceof V2StreamError?error.failure:'transport_error';throw error;}
 finally{onDiagnostics?.(diagnostics);await reader.cancel().catch(()=>{});reader.releaseLock();}
}
