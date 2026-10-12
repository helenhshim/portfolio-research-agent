import {Ajv} from 'ajv';
import {draftSchema} from './contracts.ts';
import {hasFreeQuantity,verifyDraft} from './verifier.ts';
const text={type:'string'};const strings={type:'array',items:text};
const object=(properties:any)=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const array=(items:any,maxItems:number)=>({type:'array',items,maxItems});
const evidence=object({paragraph_id:text,quote:text});
export const quarterPairSchema={...draftSchema,properties:{...draftSchema.properties,
 paired_developments:array(object({id:text,change_type:{type:'string',enum:['changed','expanded','unchanged','current_only']},prior_state:text,current_state:text,what_changed:text,why_it_matters:text,prior_evidence:array(evidence,2),current_evidence:array(evidence,2),finding_ids:strings,fact_ids:strings}),3),
 selected_financial_rows:array(object({fact_id:text,comparison_id:text,implication:text,finding_ids:strings}),3),
 advisor_discussion:object({text,finding_ids:strings})
},required:[...draftSchema.required,'paired_developments','selected_financial_rows','advisor_discussion']};
const valid=new Ajv({strict:false}).compile<any>(quarterPairSchema);
export function verifyQuarterPair(draft:any,packet:any,rationale:string){
 if(!valid(draft))throw Error('Invalid quarter-pair schema');
 const {paired_developments,selected_financial_rows,advisor_discussion,...base}=draft;
 const result=verifyDraft(base,packet,[],[],rationale);
 const surviving=new Set([...result.findings,...result.research_answers].map(f=>f.id));
 const facts=new Set([...packet.facts,...packet.comparisons].map((f:any)=>f.id));
 const periods=new Map(packet.release.paragraphs.map((p:any)=>[`${packet.ticker}:${p.id}`,p]));
 const plain=(s:string)=>!hasFreeQuantity(s)&&!s.includes('{{fact:');
 const linked=(ids:string[])=>ids.length>0&&ids.every(id=>surviving.has(id));
 const quote=(e:any,period:string)=>{const p:any=periods.get(e.paragraph_id);return p?.source_period===period&&e.quote.trim().length>=3&&plain(e.quote)&&p.text.replace(/\s+/g,' ').includes(e.quote.replace(/\s+/g,' ').trim());};
 const drops:any[]=[];
 const developments=paired_developments.filter((d:any)=>{
  const ok=linked(d.finding_ids)&&d.fact_ids.every((id:string)=>facts.has(id))&&['prior_state','current_state','what_changed','why_it_matters'].every(k=>plain(d[k]))&&d.current_evidence.length>0&&d.current_evidence.every((e:any)=>quote(e,'current'))&&d.prior_evidence.every((e:any)=>quote(e,'prior'))&&(d.change_type==='current_only'||d.prior_evidence.length>0);
  if(!ok)drops.push({kind:'paired_development',id:d.id});return ok;
 });
 const rows=selected_financial_rows.filter((r:any)=>{
  const fact=packet.facts.find((f:any)=>f.id===r.fact_id);const comp=packet.comparisons.find((c:any)=>c.id===r.comparison_id);
  const ok=fact?.id.endsWith(':current')&&(!r.comparison_id||comp?.current_fact_id===fact.id)&&plain(r.implication)&&linked(r.finding_ids);
  if(!ok)drops.push({kind:'financial_selection',id:r.fact_id});return ok;
 });
 const discussion=plain(advisor_discussion.text)&&linked(advisor_discussion.finding_ids)?advisor_discussion:null;
 if(!discussion)drops.push({kind:'discussion'});
 return {...result,paired_developments:developments,selected_financial_rows:rows,advisor_discussion:discussion,comparison_checks:{dropped_count:drops.length,drops,interpretation_support:'manual review required; paired quote checks do not validate change classification'}};
}
