import {createV3Toolbox} from './v3-safety.ts';
import {verifyV3Draft} from './v3-verifier.ts';
import {packetCoverage,presentV3Finding} from './v3-presentation.ts';
import {relatedRow,type V3Artifact} from './v3-display.ts';
import {readHistory,V3_HISTORY_BYTES} from './v3-history.ts';
export function historyArtifactChecker(packet:any){
 const box=createV3Toolbox(packet),coverage=packetCoverage(packet);
 return (value:unknown):V3Artifact|null=>{try{
  const a=value as any;
  if(!a||a.cutoff!==coverage.cutoff||!['live','saved_reference'].includes(a.origin)||!['complete','partial'].includes(a.status)||!['analysis','source_limited','out_of_scope','clarification'].includes(a.answer_kind)||typeof a.question!=='string'||a.question.length>2000||!Number.isInteger(a.revision)||a.revision<1) return null;
  const ids=a.findings.map((f:any)=>f.id);
  const labels:Record<string,string>={'Inspect cash-flow contributors':'cash_bridge','Compare cash-flow trends':'operating_cash_flow','Compare operating margins':'operating_margin','Investigate this question':'operating_margin'};
  if(a.next&&!Object.hasOwn(labels,a.next.label))return null;
  // Recheck cached prose/references and reconstitute every numerical value,
  // source URL and lineage from the server-owned frozen packet. This checks
  // source compatibility, not authorship or the investment interpretation.
  const checked=verifyV3Draft({answer_kind:a.answer_kind,takeaway:{text:a.takeaway,finding_ids:ids},assessment:{text:a.assessment??a.takeaway,finding_ids:ids},
   findings:a.findings.map((f:any)=>({id:f.id,role:f.role,summary:f.summary,text:f.text,fact_ids:f.fact_ids,evidence:f.passages.map((p:any)=>({paragraph_id:p.id,quote:p.quote}))})),
   financial_rows:a.rows.map((r:any)=>({fact_id:r.current.id,implication:r.implication,finding_ids:a.findings.filter((f:any)=>f.fact_ids.includes(r.current.id)).map((f:any)=>f.id)})),
   unanswered:a.unanswered,next_investigation:a.next?{question:a.next.question,finding_ids:a.next.finding_ids,metric_ids:[labels[a.next.label]]}:null},box);
  if(checked.status!=='complete'||!checked.takeaway)return null;
  const facts=[...box.facts.values()];
  return {question:a.question,revision:a.revision,origin:a.origin,status:a.status,answer_kind:a.answer_kind,takeaway:checked.takeaway.text,assessment:a.assessment===null?null:checked.assessment?.text??null,
   findings:checked.findings.map((f:any)=>presentV3Finding(f,coverage.sources)),rows:checked.financial_rows.map((r:any)=>relatedRow(r.fact,facts,r.implication)),facts,
   unanswered:checked.unanswered,next:checked.next_investigation?{question:checked.next_investigation.question,finding_ids:checked.next_investigation.finding_ids,label:a.next.label}:null,sources:coverage.sources,cutoff:coverage.cutoff,discrepancies:box.discrepancies};
 }catch{return null;}};
}
export function createV3HistoryHandler(packet:any){
 const verify=historyArtifactChecker(packet);
 return async(request:Request)=>{
  const requestUrl=new URL(request.url);let origin:URL;try{origin=new URL(request.headers.get('Origin')??'');}catch{return Response.json({error:'origin'},{status:403});}
  if(!['http:','https:'].includes(origin.protocol)||origin.protocol!==requestUrl.protocol||origin.host!==(request.headers.get('host')??requestUrl.host))return Response.json({error:'origin'},{status:403});
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return Response.json({error:'invalid_history'},{status:400});
  try{
   // Enforce size while reading, before allocating/parsing an unbounded body.
   const reader=request.body?.getReader();if(!reader)throw Error('invalid_history');
   let bytes=0,text='';const decoder=new TextDecoder();
   try{while(true){const c=await reader.read();if(c.done)break;bytes+=c.value.byteLength;if(bytes>V3_HISTORY_BYTES){await reader.cancel();throw Error('invalid_history');}text+=decoder.decode(c.value,{stream:true});}text+=decoder.decode();}finally{reader.releaseLock();}
   const history=readHistory(JSON.parse(text),verify);
   return Response.json(history,{headers:{'Cache-Control':'no-store'}});
  }catch(error){const reason=error instanceof Error&&['invalid_history','expired_or_invalid_history','invalid_session','invalid_turn','invalid_attempt','invalid_step'].includes(error.message)?error.message:'history_unavailable';console.info(JSON.stringify({event:'v3_history_rejected',reason}));return Response.json({error:reason},{status:400,headers:{'Cache-Control':'no-store'}});}
 };
}
