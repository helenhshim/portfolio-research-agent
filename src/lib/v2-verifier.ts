import {Ajv} from 'ajv';
import {hasFreeQuantity} from './verifier.ts';
import {hasIdentifiedSensitiveInput} from './v2-safety.ts';
import type {V2Fact} from './v2-financials.ts';
const text={type:'string',minLength:1,maxLength:1600};
const strings={type:'array',items:{type:'string'},maxItems:12,uniqueItems:true};
const object=(properties:any)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const array=(items:any,maxItems:number)=>({type:'array',items,maxItems});
const linked=object({text,finding_ids:strings});
export const v2DraftSchema=object({
 takeaway:linked,
 findings:array(object({id:{type:'string',enum:['finding_1','finding_2','finding_3']},text,fact_ids:strings,evidence:array(object({paragraph_id:{type:'string'},quote:{...text,maxLength:800}}),3)}),3),
 financial_rows:array(object({fact_id:{type:'string'},implication:text,finding_ids:strings}),3),
 unanswered:array(text,3),
 next_investigation:{anyOf:[{type:'null'},object({question:text,finding_ids:strings,metric_ids:strings})]},
});
const shape=new Ajv({strict:false}).compile<any>(v2DraftSchema);
const normalize=(s:string)=>s.replace(/\s+/g,' ').trim();
export function verifyV2Draft(draft:any,toolbox:{facts:Map<string,V2Fact>;paragraphs:Map<string,any>}){
 if(!shape(draft)||JSON.stringify(draft).length>20000)throw new Error('invalid_draft');
 const drops:{kind:string;id:string}[]=[];
 const safeText=(value:string,allowedFacts:string[]=[])=>!hasFreeQuantity(value)&&!hasIdentifiedSensitiveInput(value)&&!/[<>]|https?:|javascript:|data:/i.test(value)&&
  [...value.matchAll(/\{\{fact:([^}]+)\}\}/g)].every(m=>toolbox.facts.has(m[1])&&allowedFacts.includes(m[1]));
 const seen=new Set<string>();
 const findings=draft.findings.filter((f:any)=>{
  const okay=!seen.has(f.id)&&f.fact_ids.every((id:string)=>toolbox.facts.has(id))&&safeText(f.text,f.fact_ids)&&
   (f.fact_ids.length>0||f.evidence.length>0)&&f.evidence.every((e:any)=>{
    const p=toolbox.paragraphs.get(e.paragraph_id);
    return typeof p?.text==='string'&&e.quote.trim().length>=3&&normalize(p.text).includes(normalize(e.quote));
   });
  seen.add(f.id);if(!okay)drops.push({kind:'finding',id:f.id});return okay;
 });
 const surviving=new Set<string>(findings.map((f:any)=>f.id));
 const validLinks=(ids:string[])=>ids.length>0&&ids.every(id=>surviving.has(id));
 const takeaway=validLinks(draft.takeaway.finding_ids)&&safeText(draft.takeaway.text,[...new Set<string>(findings.flatMap((f:any)=>f.fact_ids))])?draft.takeaway:null;
 if(!takeaway)drops.push({kind:'takeaway_dependency',id:'takeaway'});
 const financial_rows=draft.financial_rows.filter((row:any)=>{
  const f=toolbox.facts.get(row.fact_id),okay=f?.period==='current'&&validLinks(row.finding_ids)&&
   findings.some((finding:any)=>row.finding_ids.includes(finding.id)&&finding.fact_ids.includes(row.fact_id))&&safeText(row.implication,[row.fact_id]);
  if(!okay)drops.push({kind:'financial_row',id:row.fact_id});return okay;
 }).map((row:any)=>({...row,fact:structuredClone(toolbox.facts.get(row.fact_id))}));
 const unanswered=draft.unanswered.filter((text:string)=>safeText(text));
 if(unanswered.length!==draft.unanswered.length)drops.push({kind:'unanswered',id:'unanswered'});
 const next=draft.next_investigation;
 const availableMetrics=new Set([...toolbox.facts.values()].map(f=>f.metric));
 const next_investigation=next&&validLinks(next.finding_ids)&&safeText(next.question)&&next.metric_ids.length>0&&next.metric_ids.every((id:string)=>availableMetrics.has(id))?next:null;
 if(next&&!next_investigation)drops.push({kind:'next_investigation',id:'next'});
 return {status:takeaway?(drops.length?'partial':'complete'):'check_failed',takeaway,findings,financial_rows,unanswered,next_investigation,
  drops,checks:{number_source_dependency:'mechanical_checks_only',interpretation_support:'requires_semantic_evaluation'}};
}
