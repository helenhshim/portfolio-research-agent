import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyDraft,renderText} from '../src/lib/verifier.ts';
const packet={ticker:'X',facts:[{id:'X:revenue:current',display:'$100 billion'}],comparisons:[],release:{paragraphs:[{id:'p1',text:'Demand remains strong across our business.'}]}};
const empty=()=>({premise_assessment:{rationale_id:'dependable_income',status:'unresolved',headline:'The income premise remains unresolved.',what_this_means:'Dividend dependability is not established.',supported_parts:[],challenged_parts:[],unresolved_parts:['Payout coverage is not established.'],next_decisive_evidence:'Comparable payout and cash-generation disclosures.',finding_ids:[],fact_ids:[]},findings:[],research_answers:[],interpretations:[],watch_items:[],uncertainties:[]});
test('invalid quote removes finding and all dependent content',()=>{
 const draft:any=empty();draft.findings=[{id:'f',text:'Demand strengthened.',fact_ids:[],evidence:[{id:'e',paragraph_id:'X:p1',quote:'Demand remains weak across our business.'}]}];
 draft.interpretations=[{id:'i',text:'Supports growth goals.',finding_ids:['f'],profile_fields:['primary_goal']}];
 draft.watch_items=[{id:'w',question:'Does demand persist?',signal:'Disclosed demand trend',why_it_matters:'Supports growth.',strengthens_if:'Demand remains resilient.',weakens_if:'Demand softens.',finding_ids:['f'],fact_ids:[],profile_fields:['primary_goal']}];
 const out=verifyDraft(draft,packet,[],[],'dependable_income');assert.equal(out.checks.dropped_count,3);assert.equal(out.checks.dependency_removals,2);
});
test('supports canonical numerical placeholders but rejects model-created quantities',()=>{
 const draft:any=empty();draft.findings=[{id:'f',text:'Revenue: {{fact:X:revenue:current}}',fact_ids:['X:revenue:current'],evidence:[]},{id:'bad',text:'Revenue was $999 billion.',fact_ids:['X:revenue:current'],evidence:[]}];
 const out=verifyDraft(draft,packet,[],[],'dependable_income');assert.equal(out.findings.length,1);assert.equal(renderText(out.findings[0].text,packet),'Revenue: $100 billion');
});
test('whitespace-only quote matching accepts fidelity without certifying meaning',()=>{
 const draft:any=empty();draft.findings=[{id:'f',text:'Demand remains strong.',fact_ids:[],evidence:[{id:'e',paragraph_id:'X:p1',quote:'Demand  remains strong across our business.'}]}];
 assert.equal(verifyDraft(draft,packet,[],[],'dependable_income').findings.length,1);
});
test('foreign IDs and research evidence not returned by tool are rejected',()=>{
 const draft:any=empty();draft.research_answers=[{id:'a',question_id:'q',status:'supported',text:'Demand remains strong.',fact_ids:[],evidence:[{id:'e',paragraph_id:'X:p1',quote:'Demand remains strong across our business.'}]}];
 assert.equal(verifyDraft(draft,packet,[{id:'q'}],[],'dependable_income').research_answers.length,0);
});

test('exact short table labels pass fidelity without certifying table interpretation',()=>{
 const tablePacket={...packet,release:{paragraphs:[{id:'p2',text:'Inventories (100) (90)'}]}};
 const draft:any=empty();draft.findings=[{id:'f',text:'The release lists inventories.',fact_ids:[],evidence:[{id:'e',paragraph_id:'X:p2',quote:'Inventories'}]}];
 assert.equal(verifyDraft(draft,tablePacket,[],[],'dependable_income').findings.length,1);
});

test('premise conclusion cannot survive dropped evidence or a mismatched user rationale',()=>{
 const draft:any=empty();draft.findings=[{id:'f',text:'Distributions are dependable.',fact_ids:[],evidence:[{id:'e',paragraph_id:'X:p1',quote:'Invented supporting evidence'}]}];draft.premise_assessment.status='supports';draft.premise_assessment.finding_ids=['f'];
 const result=verifyDraft(draft,packet,[],[],'dependable_income');assert.equal(result.premise_assessment,null);assert.equal(result.assessment_fallback?.status,'unresolved');
 const mismatch=verifyDraft(empty(),packet,[],[],'profitable_growth');assert.equal(mismatch.premise_assessment,null);
});

test('unresolved status cannot hide unsupported positive premise claims',()=>{
 const draft:any=empty();draft.premise_assessment.supported_parts=['The company funds distributions.'];
 assert.equal(verifyDraft(draft,packet,[],[],'dependable_income').premise_assessment,null);
});

test('a takeaway quantity failure preserves checked findings and identifies output failure',()=>{
 const draft:any=empty();draft.findings=[{id:'f',text:'Demand remains strong.',fact_ids:[],evidence:[{id:'e',paragraph_id:'X:p1',quote:'Demand remains strong across our business.'}]}];
 draft.premise_assessment.headline='Income rose 99 percent.';
 const result=verifyDraft(draft,packet,[],[],'dependable_income');
 assert.equal(result.findings.length,1);assert.equal(result.premise_assessment,null);
 assert.equal(result.assessment_fallback?.headline,'The takeaway could not be verified.');
 assert.match(result.drops[0].reason,/Unverified quantity/);
});
