import { Ajv } from 'ajv';
import { draftSchema } from './contracts.ts';
const ajv = new Ajv({strict:false});
const shape = ajv.compile<any>(draftSchema);
const normalize = (s:string)=>s.replace(/\s+/g,' ').trim();
export function hasFreeQuantity(text: string) {
 const stripped=text.replace(/\{\{fact:[A-Za-z0-9_:.-]+\}\}/g,'');
 return /\d|[$€£%]|\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|million|billion|trillion|double[ds]?|triple[ds]?|half|percent(?:age)?|basis points?)\b/i.test(stripped);
}
export function verifyDraft(draft:any,packet:any,questions:any[],lookups:any[],rationaleId:string) {
 if (!shape(draft)) throw new Error('Invalid model output schema');
 const facts=new Map(packet.facts.map((f:any)=>[f.id,f]));
 const eligibleIds=new Set([...facts.keys(),...packet.comparisons.map((c:any)=>c.id)]);
 const paragraphs=new Map(packet.release.paragraphs.map((p:any)=>[`${packet.ticker}:${p.id}`,p.text]));
 const lookupIdsByQuestion=new Map(lookups.map(l=>[l.question_id,new Set(l.passages.map((p:any)=>p.id))]));
 const questionIds=new Set(questions.map(q=>q.id));
 const drops:any[]=[];const seen=new Set();
 const validId=(item:any)=> typeof item.id==='string' && /^[A-Za-z][A-Za-z0-9_:.-]*$/.test(item.id) && !seen.has(item.id) && (seen.add(item.id),true);
 const validFactIds=(ids:any[])=>ids.every(id=>eligibleIds.has(id));
 const validText=(item:any)=>Object.entries(item).filter(([k,v])=>typeof v==='string'&&!['id','question_id','status','rationale_id'].includes(k)).every(([,v]:any)=>!hasFreeQuantity(v) && [...v.matchAll(/\{\{fact:([^}]+)\}\}/g)].every((m:any)=>eligibleIds.has(m[1]) && (item.fact_ids || []).includes(m[1])));
 const validEvidence=(item:any,lookupOnly=false)=>item.evidence.every((e:any)=>{
  const source=paragraphs.get(e.paragraph_id);
  // Initial conservative path: quantitative data is displayed only through code facts.
  return e.quote.trim().length>=3 && !hasFreeQuantity(e.quote) && typeof source==='string' && normalize(source).includes(normalize(e.quote)) && (!lookupOnly || lookupIdsByQuestion.get(item.question_id)?.has(e.paragraph_id));
 });
 const accept=(item:any,ok:boolean,kind:string)=>{if(!ok)drops.push({id:item.id,kind,reason:'Failed identifier, numerical-prose, evidence, or dependency checks'});return ok;};
 const findings=draft.findings.filter((i:any)=>accept(i,validId(i)&&validFactIds(i.fact_ids)&&validText(i)&&validEvidence(i)&&(i.fact_ids.length>0||i.evidence.length>0),'finding'));
 const research_answers=draft.research_answers.filter((i:any)=>accept(i,validId(i)&&questionIds.has(i.question_id)&&validFactIds(i.fact_ids)&&validText(i)&&validEvidence(i,true)&&(i.status==='unresolved'||i.fact_ids.length>0||i.evidence.length>0),'research_answer'));
 const surviving=new Set([...findings,...research_answers].map((i:any)=>i.id));
 const interpretations=draft.interpretations.filter((i:any)=>accept(i,validId(i)&&validText(i)&&i.finding_ids.length>0&&i.finding_ids.every((id:string)=>surviving.has(id))&&i.profile_fields.length>0,'interpretation_dependency'));
 const watch_items=draft.watch_items.filter((i:any)=>accept(i,validId(i)&&validFactIds(i.fact_ids)&&validText(i)&&i.finding_ids.length>0&&i.finding_ids.every((id:string)=>surviving.has(id))&&i.profile_fields.length>0,'watch_dependency'));
 const uncertainties=draft.uncertainties.filter((i:any)=>accept(i,validId(i)&&validFactIds(i.fact_ids)&&validText(i)&&validEvidence(i),'uncertainty'));
 const assessment=draft.premise_assessment;
 const assessmentTextOk=validText(assessment) && ['supported_parts','challenged_parts','unresolved_parts'].every(key=>assessment[key].every((text:string)=>!hasFreeQuantity(text) && [...text.matchAll(/\{\{fact:([^}]+)\}\}/g)].every(m=>eligibleIds.has(m[1])&&assessment.fact_ids.includes(m[1]))));
 const requiresAssessmentEvidence=assessment.status!=='unresolved'||assessment.supported_parts.length>0||assessment.challenged_parts.length>0;
 const assessmentDependenciesOk=assessment.finding_ids.every((id:string)=>surviving.has(id)) && (!requiresAssessmentEvidence||assessment.finding_ids.length>0);
 const assessmentOk=assessment.rationale_id===rationaleId && validFactIds(assessment.fact_ids) && assessmentTextOk && assessmentDependenciesOk;
 const premise_assessment=assessmentOk ? assessment : null;
 if(!assessmentOk)drops.push({id:'premise_assessment',kind:'assessment_dependency',reason:[assessment.rationale_id!==rationaleId?'Holding rationale mismatch':'',!validFactIds(assessment.fact_ids)?'Unknown financial references':'',!assessmentTextOk?'Unverified quantity or placeholder in takeaway':'',!assessmentDependenciesOk?'Supporting finding references failed':''].filter(Boolean).join('; ')});
 const output={findings,research_answers,interpretations,watch_items,uncertainties};
 const candidate_count=Object.values(draft).reduce((n:number,items:any)=>n+(Array.isArray(items)?items.length:1),0);
 const shown_count=Object.values(output).reduce((n,items)=>n+items.length,0);
 return { ...output,premise_assessment,assessment_fallback:premise_assessment?null:{status:'unresolved',headline:'The takeaway could not be verified.'},checks:{candidate_count,shown_count:shown_count+(premise_assessment?1:0),dropped_count:drops.length,dependency_removals:drops.filter(d=>d.kind.endsWith('dependency')).length,quote_check:'whitespace-normalized exact source match',number_check:'code-owned facts only',interpretation_support:'requires evaluation'},drops};
}
export function renderText(text:string,packet:any) {
 const values=new Map([...packet.facts,...packet.comparisons].map((f:any)=>[f.id,f.display]));
 return text.replace(/\{\{fact:([^}]+)\}\}/g,(_match,id)=>{if(!values.has(id))throw new Error('Unknown fact placeholder');return values.get(id) as string;});
}
