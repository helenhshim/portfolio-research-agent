import test from 'node:test';
import assert from 'node:assert/strict';
import {readV2ProviderStream,V2StreamError,V2_STREAM_LIMITS,type V2StreamDiagnostics} from '../src/lib/v2-provider-stream.ts';
const encoder=new TextEncoder();
const frame=(event:unknown)=>encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
function response(chunks:Uint8Array[],readError=false){return new Response(new ReadableStream({start(controller){for(const chunk of chunks)controller.enqueue(chunk);readError?controller.error(Error('private transport detail')):controller.close();}}));}
test('Valid cumulative SSE traffic above the old 2MB cap reaches its completed response',async()=>{
 const delta=frame({type:'response.output_text.delta',delta:'x'.repeat(20),sequence_number:1,item_id:'fixture',output_index:0,content_index:0});
 const count=Math.ceil(2_000_000/delta.byteLength)+1;
 let diagnostics:V2StreamDiagnostics|undefined,events=0;
 const result=await readV2ProviderStream(response([...Array(count).fill(delta),frame({type:'response.completed',response:{status:'completed',usage:{input_tokens:10,output_tokens:100},output:[]}})]),()=>events++,data=>{diagnostics=data;});
 assert.equal(result.status,'completed');assert.equal(events,count+1);assert.ok(diagnostics!.received_bytes>2_000_000);assert.equal(diagnostics!.failure,null);assert.equal(diagnostics!.terminal_event,'response.completed');
});
test('Oversized retained SSE event and excessive transfer remain bounded independently',async()=>{
 for(const [chunks,reason] of [
  [[encoder.encode('data: '+ 'x'.repeat(V2_STREAM_LIMITS.eventBytes+1))],'event_limit'],
  [[new Uint8Array(V2_STREAM_LIMITS.transferBytes+1)],'transfer_limit'],
 ] as const){
  let diagnostics:V2StreamDiagnostics|undefined;
  await assert.rejects(readV2ProviderStream(response([...chunks]),()=>{},d=>{diagnostics=d;}),(error:any)=>error instanceof V2StreamError&&error.code==='provider_incomplete'&&error.failure===reason);
  assert.equal(diagnostics!.failure,reason);
 }
});
test('EOF, malformed JSON, SSE error and transport rejection have content-free diagnoses',async()=>{
 for(const [chunks,reason,readError] of [
  [[frame({type:'response.output_text.delta',delta:'private fragment'})],'missing_terminal',false],
  [[encoder.encode('data: private invalid json\n\n')],'malformed_event',false],
  [[frame({type:'error',message:'private provider detail'})],'event_error',false],
  [[], 'transport_error',true],
  [[frame({type:'response.completed'})],'missing_terminal_response',false],
 ] as const){
  let diagnostics:V2StreamDiagnostics|undefined;
  await assert.rejects(readV2ProviderStream(response([...chunks],readError),()=>{},d=>{diagnostics=d;}));
  assert.equal(diagnostics!.failure,reason);assert.doesNotMatch(JSON.stringify(diagnostics),/private/);
 }
});
