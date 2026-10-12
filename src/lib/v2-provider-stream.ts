// Provider streaming stays server-side. Never publish partial, unchecked claims.
import {V2PolicyError} from './v2-safety.ts';
export async function readV2ProviderStream(response:Response,onEvent:(event:any)=>void){
 const reader=response.body?.getReader();if(!reader)throw new V2PolicyError('provider_incomplete');
 const decoder=new TextDecoder();let pending='',receivedBytes=0;
 const parse=(block:string)=>{
  const data=block.split('\n').filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trimStart()).join('\n');
  if(!data||data==='[DONE]')return;
  const event=JSON.parse(data);onEvent(event);
  if(event.type==='error')throw new V2PolicyError('provider_incomplete');
  if(['response.completed','response.incomplete','response.failed'].includes(event.type))return event.response;
 };
 try{
  while(true){
   const chunk=await reader.read();if(chunk.done)break;
   receivedBytes+=chunk.value.byteLength;if(receivedBytes>2_000_000)throw new V2PolicyError('provider_incomplete');
   pending+=decoder.decode(chunk.value,{stream:true});
   // CRLF framing may itself be split across network chunks.
   let match;while((match=/\r?\n\r?\n/.exec(pending))){
    const block=pending.slice(0,match.index).replaceAll('\r\n','\n');pending=pending.slice(match.index+match[0].length);
    const terminal=parse(block);if(terminal)return terminal;
   }
  }
  pending+=decoder.decode();const terminal=parse(pending.replaceAll('\r\n','\n'));if(terminal)return terminal;
  throw new V2PolicyError('provider_incomplete');
 }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
}
