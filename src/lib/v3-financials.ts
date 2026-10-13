// Public-source preparation. Call with the server-owned packet, never client evidence.
export type V3Fact = {
 id:string; value:number; unit:string; display:string; basis:string;
 metric:string; period:string; source_ids:string[];
};
export type V3Metric = 'revenue'|'operating_income'|'operating_cash_flow'|'operating_margin'|'cash_bridge'|'operating_expenses'|'gross_margin'|'data_center_revenue'|'data_center_share'|'guidance_revenue'|'guidance_gross_margin'|'guidance_operating_expenses';
export const V3_METRICS:readonly V3Metric[] = Object.freeze(['revenue','operating_income','operating_cash_flow','operating_margin','cash_bridge','operating_expenses','gross_margin','data_center_revenue','data_center_share','guidance_revenue','guidance_gross_margin','guidance_operating_expenses']);
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
export function prepareV3BaseFacts(packet:any):Map<string,V3Fact> {
 if(packet?.ticker!=='NVDA'||!Array.isArray(packet.facts)||!Array.isArray(packet.release?.paragraphs))return fail();
 const facts=new Map<string,V3Fact>();
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
 addReleaseFacts(packet,facts);
 return facts;
}
// Fixed-source extraction: units, fiscal columns and GAAP heading are part of the
// contract. New source versions must explicitly revise this preparation, not guess.
function addReleaseFacts(packet:any,facts:Map<string,V3Fact>){
 const paragraphs=new Map<string,any>(packet.release.paragraphs.map((p:any)=>[p.id,p]));
 const passage=(id:string,period:'current'|'prior',pattern:RegExp)=>{
  const p=paragraphs.get(id);if(p?.source_period!==period||!pattern.test(p.text))return fail();return p.text as string;
 };
 passage('p14','current',/^GAAP$/);passage('p15','current',/^\(\$ in millions, except earnings per share\) Q2 FY27 Q1 FY27 Q2 FY26 Q\/Q Y\/Y$/);
 passage('prior_p18','prior',/^GAAP$/);passage('prior_p19','prior',/^\(\$ in millions, except earnings per share\) Q1 FY27 Q4 FY26 Q1 FY26 Q\/Q Y\/Y$/);
 const add=(metric:string,period:string,value:number,unit:string,basis:string,source_ids:string[],display?:string)=>{
  if(!Number.isFinite(value))return fail();const id=`NVDA:${metric}:${period}`;
  facts.set(id,{id,metric,period,value,unit,basis,source_ids,display:display??(unit==='USD'?money(value):`${value.toFixed(1)}${unit==='percentage_points'?' percentage points':'%'}`)});
 };
 for(const [metric,id,label,unit] of [['operating_expenses','p18',/^Operating expenses /,'USD'],['gross_margin','p17',/^Gross margin /,'percent']] as const){
  const row=passage(id,'current',label),numbers=row.match(/\d[\d,]*(?:\.\d+)?/g);
  if(numbers?.length!==5)return fail();
  const priorRow=passage(metric==='gross_margin'?'prior_p21':'prior_p22','prior',label),priorNumbers=priorRow.match(/\d[\d,]*(?:\.\d+)?/g);
  if(priorNumbers?.length!==5||numbers[1]!==priorNumbers[0])return fail();
  for(const [index,period] of ['current','prior_quarter','prior_year'].entries())add(metric,period,Number(numbers[index].replaceAll(',',''))*(unit==='USD'?1e6:1),unit,`Reported GAAP ${metric}; Q2 FY27 / Q1 FY27 / Q2 FY26 columns`,[`NVDA:${id}`]);
  for(const [suffix,period] of [['qoq','prior_quarter'],['yoy','prior_year']]){
   const c=facts.get(`NVDA:${metric}:current`)!,b=facts.get(`NVDA:${metric}:${period}`)!;
   if(b.value<=0)return fail();const pp=unit==='percent';
   add(metric,pp?suffix+'_pp':suffix,pp?c.value-b.value:(c.value/b.value-1)*100,pp?'percentage_points':'percent',pp?'Difference in reported GAAP margin; percentage points':`Relative GAAP expense change versus ${period}`,[c.id,b.id]);
  }
 }
 const priorIncome=facts.get('NVDA:operating_income:prior_year')!,priorRevenue=facts.get('NVDA:revenue:prior_year')!;
 add('operating_margin','prior_year',priorIncome.value/priorRevenue.value*100,'percent','GAAP operating income divided by matched prior-year-quarter GAAP revenue',[priorIncome.id,priorRevenue.id]);
 const mc=facts.get('NVDA:operating_margin:current')!,my=facts.get('NVDA:operating_margin:prior_year')!;
 add('operating_margin','yoy_pp',mc.value-my.value,'percentage_points','Difference of unrounded matched-quarter GAAP operating-margin ratios',[mc.id,my.id]);
 for(const [id,period,sourcePeriod,pattern] of [['p40','current','current',/^•Second-quarter revenue was \$([\d.]+) billion,/],['prior_p44','prior_quarter','prior',/^•First-quarter revenue was a record \$([\d.]+) billion,/]] as const){
  const match=passage(id,sourcePeriod,pattern).match(pattern);if(!match)return fail();
  add('data_center_revenue',period,Number(match[1])*1e9,'USD','Reported rounded Data Center revenue; precision limited to release highlight',[`NVDA:${id}`],`approximately $${Number(match[1]).toFixed(1)} billion`);
 }
 const dc=facts.get('NVDA:data_center_revenue:current')!,rev=facts.get('NVDA:revenue:current')!;
 add('data_center_share','current',dc.value/rev.value*100,'percent','Approximate revenue share using rounded reported Data Center revenue and GAAP total revenue',[dc.id,rev.id],`approximately ${(dc.value/rev.value*100).toFixed(1)}%`);
 const outlook=[['guidance_revenue','p34',/^•Revenue is expected to be \$([\d.]+) billion, plus or minus 2%\./,1e9,'USD','plus or minus 2%'],['guidance_gross_margin','p35',/^•GAAP and non-GAAP gross margins are expected to be ([\d.]+)%, plus or minus 50 basis points\./,1,'percent','plus or minus 50 basis points'],['guidance_operating_expenses','p36',/^•GAAP and non-GAAP operating expenses are expected to be approximately \$([\d.]+) billion and \$[\d.]+ billion, respectively\./,1e9,'USD','approximately']] as const;
 passage('p33','current',/^NVIDIA’s outlook for the third quarter of fiscal 2027 is as follows:$/);
 for(const [metric,id,pattern,scale,unit,range] of outlook){
  const match=passage(id,'current',pattern).match(pattern);if(!match)return fail();const value=Number(match[1])*scale;
  add(metric,'guidance',value,unit,'Management Q3 FY2027 GAAP outlook; not a realized result or independent forecast',[`NVDA:${id}`],`${unit==='USD'?`$${(value/1e9).toFixed(1)} billion`:`${value.toFixed(1)}%`} (management outlook; ${range})`);
 }
}
export function prepareV3Facts(packet:any):Map<string,V3Fact> {
 const facts=prepareV3BaseFacts(packet);
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
