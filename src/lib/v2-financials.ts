// Public-source preparation. Call with the server-owned packet, never client evidence.
export type V2Fact = {
 id:string; value:number; unit:string; display:string; basis:string;
 metric:string; period:string; source_ids:string[];
};
export type V2Metric = 'revenue'|'operating_income'|'operating_cash_flow'|'operating_margin'|'cash_bridge';
export const V2_METRICS:readonly V2Metric[] = Object.freeze(['revenue','operating_income','operating_cash_flow','operating_margin','cash_bridge']);
const bridgeRows = [
 ['net_income','p156','prior_p151',/^Net income /],
 ['stock_based_compensation','p159','prior_p154',/^Stock-based compensation expense /],
 ['depreciation_amortization','p160','prior_p156',/^Depreciation and amortization /],
 ['deferred_income_taxes','p161','prior_p155',/^Deferred income taxes /],
 ['equity_security_gains_adjustment','p162','prior_p157',/^(?:Gains from|\(Gains\) losses from) equity securities, net /],
 ['other_adjustments','p163','prior_p158',/^Other /],
 ['accounts_receivable_adjustment','p165','prior_p160',/^Accounts receivable /],
 ['inventory_adjustment','p166','prior_p161',/^Inventories /],
 ['prepaid_other_assets_adjustment','p167','prior_p162',/^Prepaid expenses and other assets /],
 ['accounts_payable_adjustment','p168','prior_p163',/^Accounts payable /],
 ['accrued_current_liabilities_adjustment','p169','prior_p164',/^Accrued and other current liabilities /],
 ['other_long_term_liabilities_adjustment','p170','prior_p165',/^Other long-term liabilities /],
] as const;
const fail = ():never => {throw new Error('Invalid authoritative financial evidence');};
const money=(value:number)=>`${value<0?'−':''}$${(Math.abs(value)/1e9).toFixed(3)} billion`;
export function prepareV2BaseFacts(packet:any):Map<string,V2Fact> {
 if(packet?.ticker!=='NVDA'||!Array.isArray(packet.facts)||!Array.isArray(packet.release?.paragraphs))return fail();
 const facts=new Map<string,V2Fact>();
 const raw=new Map<string,any>();
 for(const f of packet.facts){
  if(raw.has(f.id)||typeof f.id!=='string'||!Number.isFinite(f.value))return fail();
  raw.set(f.id,f);
  if(['revenue','operating_income','operating_cash_flow'].includes(f.metric)){
   const period=f.id.split(':').at(-1)!;
   const starts:Record<string,string>={current:'2026-04-27',prior_quarter:'2026-01-26',prior_year:'2025-04-28'};
   const ends:Record<string,string>={current:'2026-07-26',prior_quarter:'2026-04-26',prior_year:'2025-07-27'};
   const bases:Record<string,string>={revenue:'GAAP total revenue',operating_income:'GAAP operating income; not net income or adjusted income',operating_cash_flow:'GAAP operating cash flow'};
   if(!['current','prior_quarter','prior_year'].includes(period)||f.id!==`NVDA:${f.metric}:${period}`||f.unit!=='USD'||f.start!==starts[period]||f.end!==ends[period]||f.basis!==bases[f.metric]||!Array.isArray(f.source_accessions)||f.source_accessions.some((s:any)=>typeof s!=='string'))return fail();
   facts.set(f.id,{id:f.id,value:f.value,unit:f.unit,display:money(f.value),basis:f.basis,metric:f.metric,period,source_ids:[...f.source_accessions]});
  }
 }
 for(const metric of ['revenue','operating_income','operating_cash_flow'])for(const [comparison,period] of [['qoq','prior_quarter'],['yoy','prior_year']]){
  const current=facts.get(`NVDA:${metric}:current`), prior=facts.get(`NVDA:${metric}:${period}`);
  if(!current||!prior||prior.value<=0)return fail();
  const value=(current.value/prior.value-1)*100,id=`NVDA:${metric}:${comparison}`;
  facts.set(id,{id,value,unit:'percent',display:`${value>=0?'+':''}${value.toFixed(1)}%`,basis:`${metric} relative change against ${period}`,metric,period:comparison,source_ids:[current.id,prior.id]});
 }
 for(const period of ['current','prior_quarter']){
  const income=raw.get(`NVDA:operating_income:${period}`), revenue=raw.get(`NVDA:revenue:${period}`);
  if(!income||!revenue||revenue.value<=0||income.start!==revenue.start||income.end!==revenue.end||income.unit!==revenue.unit||
   income.basis!=='GAAP operating income; not net income or adjusted income'||revenue.basis!=='GAAP total revenue'||
   income.end!==packet.comparison_context?.[period==='current'?'current':'prior']?.end||
   income.start!==(period==='current'?'2026-04-27':'2026-01-26'))return fail();
  const value=income.value/revenue.value*100, id=`NVDA:operating_margin:${period}`;
  facts.set(id,{id,value,unit:'percent',display:`${value.toFixed(1)}%`,basis:'GAAP operating income divided by same-quarter GAAP revenue',metric:'operating_margin',period,source_ids:[income.id,revenue.id]});
 }
 const marginCurrent=facts.get('NVDA:operating_margin:current')!, marginPrior=facts.get('NVDA:operating_margin:prior_quarter')!;
 const change=marginCurrent.value-marginPrior.value;
 facts.set('NVDA:operating_margin:qoq_pp',{id:'NVDA:operating_margin:qoq_pp',value:change,unit:'percentage_points',display:`${change>=0?'+':''}${change.toFixed(1)} percentage points`,basis:'Difference of unrounded GAAP operating-margin ratios',metric:'operating_margin',period:'qoq',source_ids:[marginCurrent.id,marginPrior.id]});
 return facts;
}
export function prepareV2Facts(packet:any):Map<string,V2Fact> {
 const facts=prepareV2BaseFacts(packet);
 const paragraphs=new Map<string,any>();
 for(const p of packet.release.paragraphs){if(paragraphs.has(p.id))return fail();paragraphs.set(p.id,p);}
 const expect=(id:string,text:string)=>{if(paragraphs.get(id)?.text!==text)return fail();};
 // This fixed bridge is deliberately bound to the frozen pair, not a generic table parser.
 expect('p150','(In millions)');expect('prior_p145','(In millions)');
 expect('p152','Three Months Ended Six Months Ended');expect('p153','July 26, July 27, July 26, July 27,');expect('p154','2026 2025 2026 2025');
 expect('prior_p147','Three Months Ended');expect('prior_p148','April 26, April 27,');expect('prior_p149','2026 2025');
 if(packet.comparison_context?.current?.end!=='2026-07-26'||packet.comparison_context?.prior?.end!=='2026-04-26')return fail();
 const extract=(id:string,period:'current'|'prior',label:RegExp,columns:number)=>{
  const p=paragraphs.get(id);if(!p||p.source_period!==period||!label.test(p.text))return fail();
  const numbers=p.text.match(/\(?-?\d[\d,]*\)?/g);if(numbers?.length!==columns)return fail();
  const token=numbers[0], value=Number(token.replace(/[(),]/g,''))*(token.startsWith('(')?-1:1);
  if(!Number.isSafeInteger(value)||!Number.isSafeInteger(value*1e6))return fail();return value*1e6;
 };
 let currentSum=0, priorSum=0;
 for(const [name,currentId,priorId,label] of bridgeRows){
  const current=extract(currentId,'current',label,4), prior=extract(priorId,'prior',label,2);
  currentSum+=current;priorSum+=prior;
  for(const [period,value,sourceIds] of [['current',current,[`NVDA:${currentId}`]],['prior_quarter',prior,[`NVDA:${priorId}`]],['qoq',current-prior,[`NVDA:${currentId}`,`NVDA:${priorId}`]]] as const){
   const id=`NVDA:cash_bridge:${name}:${period}`;
   facts.set(id,{id,value,unit:'USD',display:money(value),basis:`Operating cash-flow ${name}; accounting contribution, not a balance or business cause`,metric:'cash_bridge',period,source_ids:[...sourceIds]});
  }
 }
 const currentTotal=extract('p171','current',/^Net cash provided by operating activities /,4), priorTotal=extract('prior_p166','prior',/^Net cash provided by operating activities /,2);
 if(currentSum!==currentTotal||priorSum!==priorTotal||currentTotal!==facts.get('NVDA:operating_cash_flow:current')?.value||priorTotal!==facts.get('NVDA:operating_cash_flow:prior_quarter')?.value)return fail();
 const totalId='NVDA:cash_bridge:total:qoq';facts.set(totalId,{id:totalId,value:currentTotal-priorTotal,unit:'USD',display:money(currentTotal-priorTotal),basis:'Sum of all quarterly cash-flow component changes',metric:'cash_bridge',period:'qoq',source_ids:['NVDA:p171','NVDA:prior_p166']});
 return facts;
}
