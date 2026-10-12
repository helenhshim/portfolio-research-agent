import packet from '../data/nvda-quarter-pair.json';
import {runV2ControlledTurn} from './v2-controller.ts';
import {packetCoverage,presentV2Result} from './v2-presentation.ts';

// Authored reference, not a model trial. Every figure resolves through the same core checks.
export const REFERENCE_QUESTION="Does NVIDIA's latest report strengthen or weaken the case for durable operating profitability?";
export async function loadV2Reference(){
 const quote=(id:string)=>{const p=packet.release.paragraphs.find(p=>p.id===id);if(!p)throw Error('Reference source unavailable');return {paragraph_id:'NVDA:'+id,quote:p.text};};
 const result=await runV2ControlledTurn({question:REFERENCE_QUESTION},packet,async()=>({kind:'answer',draft:{
  takeaway:{text:'Current operating performance strengthened, and NVIDIA reports progress getting Rubin systems into production and operation at partners. This supports execution progress; durable product economics and cash generation remain unproven.',finding_ids:['finding_1','finding_2','finding_3']},
  findings:[
   {id:'finding_1',text:'Operating margin improved from {{fact:NVDA:operating_margin:prior_quarter}} to {{fact:NVDA:operating_margin:current}} while revenue grew. This supports current operating performance, rather than proving persistence.',fact_ids:['NVDA:operating_margin:current','NVDA:operating_margin:prior_quarter','NVDA:revenue:current'],evidence:[]},
   {id:'finding_2',text:'The earlier report announced the Rubin platform. The current report describes production ramping, racks running at named partners and related networking systems arriving. This is reported delivery progress, but does not establish rollout completion, production scale, product margins or repeat demand.',fact_ids:[],evidence:[quote('prior_p45'),quote('p41'),quote('p42')]},
   {id:'finding_3',text:'Operating cash flow declined sequentially despite stronger operating profitability. Conditional financing partnerships may support infrastructure buildout, but are not completed funding or realized sales. Cash realization and financing remain qualifications to the durability premise.',fact_ids:['NVDA:operating_cash_flow:current'],evidence:[quote('p47')]},
  ],
  financial_rows:[
   {fact_id:'NVDA:operating_margin:current',implication:'Modestly better operating profit per revenue dollar; not proof of persistence.',finding_ids:['finding_1']},
   {fact_id:'NVDA:revenue:current',implication:'Growth accompanied the margin improvement; Rubin’s contribution is not isolated.',finding_ids:['finding_1']},
   {fact_id:'NVDA:operating_cash_flow:current',implication:'Cash moved against operating-profit growth. Examine conversion separately.',finding_ids:['finding_3']},
  ],
  unanswered:['What evidence would establish delivery scale, repeat demand and realized product economics?','What drove the operating-asset and liability changes, and will cash be realized?'],
  next_investigation:{question:'Compare operating cash flow quarter over quarter and year over year. How do the different baselines qualify our assessment of durable operating profitability?',finding_ids:['finding_3'],metric_ids:['operating_cash_flow']},
 }}));
 const artifact=presentV2Result(result,packetCoverage(packet),REFERENCE_QUESTION,1,'saved_reference');
 if(!artifact)throw Error('Saved reference failed its checks');return artifact;
}
