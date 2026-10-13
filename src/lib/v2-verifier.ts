import {Ajv} from 'ajv';
import {hasFreeQuantity} from './verifier.ts';
import {hasIdentifiedSensitiveInput} from './v2-safety.ts';
import type {V2Fact} from './v2-financials.ts';
const text={type:'string',minLength:1,maxLength:1600};
const strings={type:'array',items:{type:'string'},maxItems:12,uniqueItems:true};
const object=(properties:any)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const array=(items:any,maxItems:number)=>({type:'array',items,maxItems});
const linked=object({text,finding_ids:strings});
export const v2FindingSchema=object({id:{type:'string',enum:['finding_1','finding_2','finding_3']},text,fact_ids:strings,evidence:array(object({paragraph_id:{type:'string'},quote:{...text,maxLength:800}}),3)});
export type VerifiedV2Finding={id:string;text:string;fact_ids:string[];evidence:{paragraph_id:string;quote:string}[]};
type Toolbox={facts:Map<string,V2Fact>;paragraphs:Map<string,any>};
export const v2DraftSchema=object({
 takeaway:linked,
 findings:array(v2FindingSchema,3),
 financial_rows:array(object({fact_id:{type:'string'},implication:text,finding_ids:strings}),3),
 unanswered:array(text,3),
 next_investigation:{anyOf:[{type:'null'},object({question:text,finding_ids:strings,metric_ids:strings})]},
});
// Optional for existing scripted fixtures; required in live strict-provider output.
v2DraftSchema.properties.answer_kind={type:'string',enum:['analysis','source_limited','out_of_scope','clarification']};
const shape=new Ajv({strict:false}).compile<any>(v2DraftSchema);
const findingShape=new Ajv({strict:false}).compile<VerifiedV2Finding>(v2FindingSchema);
const normalize=(s:string)=>s.replace(/\s+/g,' ').trim();
const safeText=(value:string,toolbox:Toolbox,allowedFacts:string[]=[])=>!hasFreeQuantity(value)&&!hasIdentifiedSensitiveInput(value)&&!/[<>]|https?:|javascript:|data:/i.test(value)&&
  [...value.matchAll(/\{\{fact:([^}]+)\}\}/g)].every(m=>toolbox.facts.has(m[1])&&allowedFacts.includes(m[1]));
const textReason=(value:string,toolbox:Toolbox)=>hasFreeQuantity(value)?'free_quantity':hasIdentifiedSensitiveInput(value)?'sensitive_text':/[<>]|https?:|javascript:|data:/i.test(value)?'unsafe_markup_or_url':[...value.matchAll(/\{\{fact:([^}]+)\}\}/g)].some(m=>!toolbox.facts.has(m[1]))?'unknown_placeholder':'undeclared_fact_reference';
function findingReason(f:VerifiedV2Finding,toolbox:Toolbox):string|null {
 if(!safeText(f.text,toolbox,f.fact_ids))return textReason(f.text,toolbox);
 // A complete JSON string can still contain a sentence cut off by a wire limit.
 // Reject obvious unfinished prose; punctuation is not a semantic-support check.
 if(!/[.!?]["'”’)]*\s*$/.test(f.text))return 'unfinished_prose';
 if(!f.fact_ids.every(id=>toolbox.facts.has(id)))return 'invalid_fact_reference';
 if(!f.fact_ids.length&&!f.evidence.length)return 'missing_support_or_duplicate';
 if(!f.evidence.every(e=>{const p=toolbox.paragraphs.get(e.paragraph_id);return typeof p?.text==='string'&&e.quote.trim().length>=3&&normalize(p.text).includes(normalize(e.quote));}))return 'quote_mismatch';
 return null;
}
// Individual complete findings use the SAME source/number/text checks as the final
// artifact. Passing them does not certify the business interpretation or takeaway.
export function verifyV2Finding(candidate:unknown,toolbox:Toolbox):VerifiedV2Finding|null {
 if(!findingShape(candidate)||findingReason(candidate,toolbox))return null;
 return structuredClone(candidate);
}
export function verifyV2Draft(draft:any,toolbox:Toolbox){
 if(!shape(draft)||JSON.stringify(draft).length>20000)throw new Error('invalid_draft');
 const drops:{kind:string;id:string;reason?:string}[]=[];
 const seen=new Set<string>();
 const findings=draft.findings.filter((f:any)=>{
  const reason=seen.has(f.id)?'missing_support_or_duplicate':findingReason(f,toolbox);
  seen.add(f.id);if(reason)drops.push({kind:'finding',id:f.id,reason});return !reason;
 });
 const surviving=new Set<string>(findings.map((f:any)=>f.id));
 const validLinks=(ids:string[])=>ids.length>0&&ids.every(id=>surviving.has(id));
 const linkedFacts=[...new Set<string>(findings.filter((f:any)=>draft.takeaway.finding_ids.includes(f.id)).flatMap((f:any)=>f.fact_ids))];
 const takeaway=validLinks(draft.takeaway.finding_ids)&&safeText(draft.takeaway.text,toolbox,linkedFacts)?draft.takeaway:null;
 if(!takeaway)drops.push({kind:'takeaway_dependency',id:'takeaway',reason:!validLinks(draft.takeaway.finding_ids)?'invalid_dependency':hasFreeQuantity(draft.takeaway.text)?'free_quantity':'unsafe_text_or_fact_reference'});
 const financial_rows=draft.financial_rows.filter((row:any)=>{
  const f=toolbox.facts.get(row.fact_id),okay=f?.period==='current'&&validLinks(row.finding_ids)&&
   findings.some((finding:any)=>row.finding_ids.includes(finding.id)&&finding.fact_ids.includes(row.fact_id))&&safeText(row.implication,toolbox,[row.fact_id]);
  if(!okay)drops.push({kind:'financial_row',id:row.fact_id});return okay;
 }).map((row:any)=>({...row,fact:structuredClone(toolbox.facts.get(row.fact_id))}));
 const unanswered=draft.unanswered.filter((text:string)=>safeText(text,toolbox));
 if(unanswered.length!==draft.unanswered.length)drops.push({kind:'unanswered',id:'unanswered'});
 const next=draft.next_investigation;
 const availableMetrics=new Set([...toolbox.facts.values()].map(f=>f.metric));
 const next_investigation=next&&validLinks(next.finding_ids)&&safeText(next.question,toolbox)&&next.metric_ids.length>0&&next.metric_ids.every((id:string)=>availableMetrics.has(id))?next:null;
 if(next&&!next_investigation)drops.push({kind:'next_investigation',id:'next'});
 return {status:takeaway?(drops.length?'partial':'complete'):'check_failed',answer_kind:draft.answer_kind??'analysis',takeaway,findings,financial_rows,unanswered,next_investigation,
  drops,checks:{number_source_dependency:'mechanical_checks_only',interpretation_support:'requires_semantic_evaluation'}};
}
