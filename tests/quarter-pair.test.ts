import test from 'node:test';import assert from 'node:assert/strict';import {verifyQuarterPair} from '../src/lib/quarter-pair.ts';
function fixture(){
 const packet={ticker:'NVDA',facts:[{id:'NVDA:revenue:current'},{id:'NVDA:revenue:prior_quarter'},{id:'NVDA:operating_cash_flow:current'}],comparisons:[{id:'NVDA:revenue:qoq',current_fact_id:'NVDA:revenue:current'}],release:{paragraphs:[{id:'p1',text:'Racks are running at partners.',source_period:'current'},{id:'prior_p1',text:'Announced the platform.',source_period:'prior'}]}};
 const draft={premise_assessment:{rationale_id:'profitable_growth',status:'unresolved',headline:'Repeat demand unresolved',what_this_means:'Execution improved; demand persistence unresolved.',supported_parts:['Reported deployment progress.'],challenged_parts:[],unresolved_parts:['Repeat demand.'],next_decisive_evidence:'Repeat deployments.',finding_ids:['finding'],fact_ids:[]},findings:[{id:'finding',text:'Reported deployment progress.',fact_ids:[],evidence:[{id:'quote',paragraph_id:'NVDA:p1',quote:'Racks are running at partners.'}]}],research_answers:[],interpretations:[],watch_items:[],uncertainties:[],paired_developments:[{id:'development',change_type:'changed',prior_state:'Platform announced.',current_state:'Partner racks running.',what_changed:'Reported execution progressed.',why_it_matters:'Relevant to execution across cycles.',prior_evidence:[{paragraph_id:'NVDA:prior_p1',quote:'Announced the platform.'}],current_evidence:[{paragraph_id:'NVDA:p1',quote:'Racks are running at partners.'}],finding_ids:['finding'],fact_ids:[]}],selected_financial_rows:[{fact_id:'NVDA:revenue:current',comparison_id:'NVDA:revenue:qoq',implication:'Supports current business growth.',finding_ids:['finding']}],advisor_discussion:{text:'Deployment progress matters; repeat demand remains unanswered.',finding_ids:['finding']}};
 return {packet,draft};
}
test('paired developments require correct-period quotes and evidence from both reports',()=>{
 const {packet,draft}=fixture();assert.equal(verifyQuarterPair(draft,packet,'profitable_growth').paired_developments.length,1);
 draft.paired_developments[0].prior_evidence=[];assert.equal(verifyQuarterPair(draft,packet,'profitable_growth').paired_developments.length,0);
 const other=fixture();other.draft.paired_developments[0].prior_evidence=[{paragraph_id:'NVDA:p1',quote:'Racks are running at partners.'}];assert.equal(verifyQuarterPair(other.draft,other.packet,'profitable_growth').paired_developments.length,0);
});
test('selected financial rows reject incompatible comparisons and non-current facts',()=>{
 const {packet,draft}=fixture();draft.selected_financial_rows[0].fact_id='NVDA:operating_cash_flow:current';assert.equal(verifyQuarterPair(draft,packet,'profitable_growth').selected_financial_rows.length,0);
 draft.selected_financial_rows[0].fact_id='NVDA:revenue:prior_quarter';draft.selected_financial_rows[0].comparison_id='';assert.equal(verifyQuarterPair(draft,packet,'profitable_growth').selected_financial_rows.length,0);
});
test('failed finding removes its paired developments, financial selection and discussion',()=>{
 const {packet,draft}=fixture();draft.findings[0].evidence[0].quote='Unsupported quotation';const r=verifyQuarterPair(draft,packet,'profitable_growth');assert.equal(r.paired_developments.length,0);assert.equal(r.selected_financial_rows.length,0);assert.equal(r.advisor_discussion,null);
});
test('finding display bundles only surviving paired evidence without repairing dangling references',()=>{
 const {packet,draft}=fixture();
 const result=verifyQuarterPair(draft,packet,'profitable_growth');
 assert.ok(result.findings[0].evidence.some((e:any)=>e.paragraph_id==='NVDA:prior_p1'));
 draft.paired_developments[0].prior_evidence[0].quote='Invented comparison quotation';
 const rejected=verifyQuarterPair(draft,packet,'profitable_growth');
 assert.equal(rejected.findings[0].evidence.some((e:any)=>e.paragraph_id==='NVDA:prior_p1'),false);
 draft.premise_assessment.finding_ids=['missing'];
 assert.equal(verifyQuarterPair(draft,packet,'profitable_growth').premise_assessment,null);
});
