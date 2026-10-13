export const V3_FACTS_VERSION='v3-reported-first-1';
// Public-source preparation. Call with the server-owned packet, never client evidence.
export type V3Fact = {
 id:string; value:number; unit:string; display:string; basis:string;
 metric:string; period:string; source_ids:string[]; provenance:V3Provenance;
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
export type V3Discrepancy={fact_id:string;kind:'reported_derived_mismatch'|'cross_report_mismatch';reported_value:number;other_value:number;unit:string;tolerance:number;source_ids:string[]};
export type V3Provenance={kind:'reported';paragraph_id:string;column:string;source_value:string;unit_scale:number;precision_note?:string}|{kind:'derived';formula:string;input_ids:string[];precision_note?:string};
const signed=(value:number,unit:string,digits:number)=>`${value<0?'−':value>0?'+':''}${Math.abs(value).toFixed(digits)}${unit==='percentage_points'?' percentage points':'%'}`;
export function prepareV3BaseFacts(packet:any,discrepancies:V3Discrepancy[]=[]):Map<string,V3Fact> {
 if(packet?.ticker!=='NVDA'||!Array.isArray(packet.release?.paragraphs)||packet.comparison_context?.current?.end!=='2026-07-26'||packet.comparison_context?.prior?.end!=='2026-04-26')return fail();
 const facts=new Map<string,V3Fact>(),paragraphs=new Map<string,any>();
 for(const p of packet.release.paragraphs){if(paragraphs.has(p.id))return fail();paragraphs.set(p.id,p);}
 const passage=(id:string,period:'current'|'prior',pattern:RegExp)=>{
  const p=paragraphs.get(id);if(p?.source_period!==period||!pattern.test(p.text))return fail();return p.text as string;
 };
 passage('p14','current',/^GAAP$/);passage('p15','current',/^\(\$ in millions, except earnings per share\) Q2 FY27 Q1 FY27 Q2 FY26 Q\/Q Y\/Y$/);
 // The stored prior release can reveal a discrepancy, but is not required merely
 // to recompute or certify arithmetic already reported in the current summary.
 const hasPriorSummary=paragraphs.has('prior_p19');
 if(hasPriorSummary){passage('prior_p18','prior',/^GAAP$/);passage('prior_p19','prior',/^\(\$ in millions, except earnings per share\) Q1 FY27 Q4 FY26 Q1 FY26 Q\/Q Y\/Y$/);}
 const addReported=(metric:string,period:string,value:number,unit:string,basis:string,id:string,column:string,token:string,scale:number,display:string,precision_note?:string)=>{
  if(!Number.isFinite(value))return fail();const fact_id=`NVDA:${metric}:${period}`;
  facts.set(fact_id,{id:fact_id,metric,period,value,unit,basis,source_ids:[`NVDA:${id}`],display,provenance:{kind:'reported',paragraph_id:`NVDA:${id}`,column,source_value:token,unit_scale:scale,...(precision_note?{precision_note}:{})}});
 };
 const tokenValue=(token:string)=>Number(token.replace(/[(),+−]/g,'').replace(/^-/,'').replaceAll(',',''))*(/^[−-]|^\(/.test(token)?-1:1);
 const digits=(token:string)=>token.replace(/[()]/g,'').split('.')[1]?.length??0;
 const numeric='(\\(?[+−-]?\\d[\\d,]*(?:\\.\\d+)?\\)?|n/a|—)';
 const row=(id:string,period:'current'|'prior',label:string,margin=false)=>{
  const units=margin?' %':'',moneySign=margin?'':'\\$';
  const pattern=new RegExp('^'+label+' '+moneySign+numeric+units+' '+moneySign+numeric+units+' '+moneySign+numeric+units+' '+numeric+(margin?' pts':' %')+' '+numeric+(margin?' pts':' %')+'$');
  const text=passage(id,period,pattern),match=text.match(pattern);if(!match)return fail();return match.slice(1);
 };
 const auditExisting=(fact_id:string,reported:number,unit:string,precision:number,baseline:string,inputIds:string[],source_id:string)=>{
  // Compare only an already prepared compatible derived value. Do not calculate
  // a new duplicate solely to audit the issuer's reported growth rate.
  const existing=packet.comparisons?.find((c:any)=>c.id===fact_id&&c.metric===fact_id.split(':')[1]&&c.baseline===baseline&&c.current_fact_id===inputIds[0]&&c.baseline_fact_id===inputIds[1]);
  if(!existing||!Number.isFinite(existing.percentage_change)||unit!=='percent')return;
  const tolerance=.5*10**(-precision);
  if(Math.abs(existing.percentage_change-reported)>tolerance+1e-9){
   discrepancies.push({fact_id,kind:'reported_derived_mismatch',reported_value:reported,other_value:existing.percentage_change,unit,tolerance,source_ids:[`NVDA:${source_id}`,...inputIds]});facts.delete(fact_id);
  }
 };
 const missingComparisons:{metric:string;period:string;baselinePeriod:string;margin:boolean}[]=[];
 const periods=['current','prior_quarter','prior_year'],columns=['Q2 FY27','Q1 FY27','Q2 FY26'];
 for(const [metric,id,priorId,label,margin] of [
  ['revenue','p16','prior_p20','Revenue',false],['operating_income','p19','prior_p23','Operating income',false],
  ['operating_expenses','p18','prior_p22','Operating expenses',false],['gross_margin','p17','prior_p21','Gross margin',true],
 ] as const){
  const tokens=row(id,'current',label,margin),scale=margin?1:1e6,unit=margin?'percent':'USD';
  for(let index=0;index<3;index++){
   const value=tokenValue(tokens[index])*scale;
   addReported(metric,periods[index],value,unit,`Reported GAAP ${label}; ${columns[index]}`,id,columns[index],tokens[index],scale,margin?`${tokens[index]}%`:money(value));
  }
  for(const [index,suffix,baselinePeriod,baseline] of [[3,'qoq','prior_quarter','immediately preceding fiscal quarter'],[4,'yoy','prior_year','same fiscal quarter a year earlier']] as const){
   const token=tokens[index],comparisonUnit=margin?'percentage_points':'percent',period=margin?suffix+'_pp':suffix;
   if(['n/a','—'].includes(token)){missingComparisons.push({metric,period,baselinePeriod,margin});continue;}
   const value=tokenValue(token);
   addReported(metric,period,value,comparisonUnit,`Reported GAAP ${label} comparison; ${baseline}`,id,index===3?'Q/Q':'Y/Y',token,1,signed(value,comparisonUnit,digits(token)));
   auditExisting(`NVDA:${metric}:${period}`,value,comparisonUnit,digits(token),baseline,[`NVDA:${metric}:current`,`NVDA:${metric}:${baselinePeriod}`],id);
  }
  if(hasPriorSummary){
   const priorTokens=row(priorId,'prior',label,margin),currentPrior=tokenValue(tokens[1])*scale,priorValue=tokenValue(priorTokens[0])*scale;
   const tolerance=.5*10**(-Math.min(digits(tokens[1]),digits(priorTokens[0])))*scale;
   if(Math.abs(currentPrior-priorValue)>tolerance+1e-9){
    discrepancies.push({fact_id:`NVDA:${metric}:prior_quarter`,kind:'cross_report_mismatch',reported_value:currentPrior,other_value:priorValue,unit,tolerance,source_ids:[`NVDA:${id}`,`NVDA:${priorId}`]});
    facts.delete(`NVDA:${metric}:prior_quarter`);facts.delete(`NVDA:${metric}:${margin?'qoq_pp':'qoq'}`);
   }
  }
 }
 // Operating cash flow is reported, with no compatible growth rates in this pair.
 passage('p150','current',/^\(In millions\)$/);passage('p152','current',/^Three Months Ended Six Months Ended$/);
 passage('p153','current',/^July 26, July 27, July 26, July 27,$/);passage('p154','current',/^2026 2025 2026 2025$/);
 passage('prior_p145','prior',/^\(In millions\)$/);passage('prior_p147','prior',/^Three Months Ended$/);
 passage('prior_p148','prior',/^April 26, April 27,$/);passage('prior_p149','prior',/^2026 2025$/);
 for(const [id,period,sourcePeriod,index,count,column] of [['p171','current','current',0,4,'Three months ended July 26, 2026'],['p171','prior_year','current',1,4,'Three months ended July 27, 2025'],['prior_p166','prior_quarter','prior',0,2,'Three months ended April 26, 2026']] as const){
  const text=passage(id,sourcePeriod,/^Net cash provided by operating activities /),tokens=text.match(/\(?[+−-]?\d[\d,]*(?:\.\d+)?\)?/g);
  if(tokens?.length!==count)return fail();const value=tokenValue(tokens[index])*1e6;
  if(!Number.isSafeInteger(value))return fail();
  addReported('operating_cash_flow',period,value,'USD',`Reported GAAP operating cash flow; ${column}`,id,column,tokens[index],1e6,money(value));
 }
 const derived=(metric:string,period:string,input_ids:string[],formula:string,compute:(values:number[])=>number,unit:string,basis:string,precision_note?:string)=>{
  const inputs=input_ids.map(id=>facts.get(id));if(inputs.some(f=>!f))return;
  const value=compute(inputs.map(f=>f!.value));if(!Number.isFinite(value))return fail();const id=`NVDA:${metric}:${period}`;
  facts.set(id,{id,metric,period,value,unit,basis,source_ids:input_ids,display:period==='current'||period==='prior_quarter'||period==='prior_year'?`${value.toFixed(1)}%`:signed(value,unit,1),provenance:{kind:'derived',formula,input_ids, ...(precision_note?{precision_note}:{})}});
 };
 for(const c of missingComparisons)derived(c.metric,c.period,[`NVDA:${c.metric}:current`,`NVDA:${c.metric}:${c.baselinePeriod}`],c.margin?'current gross margin − baseline gross margin':'(current reported value / baseline reported value − 1) × 100',v=>c.margin?v[0]-v[1]:v[1]>0?(v[0]/v[1]-1)*100:NaN,c.margin?'percentage_points':'percent','Calculated comparison: no matching reported comparison is available');
 for(const period of periods)derived('operating_margin',period,[`NVDA:operating_income:${period}`,`NVDA:revenue:${period}`],'operating income / revenue × 100',v=>v[1]>0?v[0]/v[1]*100:NaN,'percent','Calculated GAAP operating margin from matched-quarter reported amounts');
 for(const [suffix,period] of [['qoq','prior_quarter'],['yoy','prior_year']]){
  derived('operating_margin',suffix+'_pp',['NVDA:operating_margin:current',`NVDA:operating_margin:${period}`],'current operating margin − baseline operating margin',v=>v[0]-v[1],'percentage_points','Difference of unrounded matched-quarter GAAP operating-margin ratios');
  derived('operating_cash_flow',suffix,['NVDA:operating_cash_flow:current',`NVDA:operating_cash_flow:${period}`],'(current operating cash flow / baseline operating cash flow − 1) × 100',v=>v[1]>0?(v[0]/v[1]-1)*100:NaN,'percent',`Calculated cash-flow change against ${period}; source has no matching reported rate`);
 }
 for(const [id,period,sourcePeriod,pattern] of [['p40','current','current',/^•Second-quarter revenue was \$([\d.]+) billion, up ([\d.]+)% from the previous quarter and up ([\d.]+)% from a year ago\.$/],['prior_p44','prior_quarter','prior',/^•First-quarter revenue was a record \$([\d.]+) billion, up ([\d.]+)% from the previous quarter and up ([\d.]+)% from a year ago\.$/]] as const){
  const match=passage(id,sourcePeriod,pattern).match(pattern);if(!match)return fail();
  addReported('data_center_revenue',period,Number(match[1])*1e9,'USD','Reported Data Center revenue; rounded release highlight',id,period==='current'?'Q2 FY27':'Q1 FY27',match[1],1e9,`$${match[1]} billion`,'Precision limited to the reported release highlight');
  if(period==='current')for(const [index,suffix,baseline] of [[2,'qoq','immediately preceding fiscal quarter'],[3,'yoy','same fiscal quarter a year earlier']] as const)addReported('data_center_revenue',suffix,Number(match[index]),'percent',`Reported Data Center revenue growth; ${baseline}`,id,suffix==='qoq'?'Q/Q':'Y/Y',match[index],1,signed(Number(match[index]),'percent',digits(match[index])));
 }
 derived('data_center_share','current',['NVDA:data_center_revenue:current','NVDA:revenue:current'],'rounded Data Center revenue / GAAP total revenue × 100',v=>v[1]>0?v[0]/v[1]*100:NaN,'percent','Approximate revenue share using rounded reported Data Center revenue','Approximate: numerator is a rounded reported highlight');
 const share=facts.get('NVDA:data_center_share:current');if(share)share.display='approximately '+share.display;
 const outlook=[['guidance_revenue','p34',/^•Revenue is expected to be \$([\d.]+) billion, plus or minus 2%\./,1e9,'USD','plus or minus 2%'],['guidance_gross_margin','p35',/^•GAAP and non-GAAP gross margins are expected to be ([\d.]+)%, plus or minus 50 basis points\./,1,'percent','plus or minus 50 basis points'],['guidance_operating_expenses','p36',/^•GAAP and non-GAAP operating expenses are expected to be approximately \$([\d.]+) billion and \$[\d.]+ billion, respectively\./,1e9,'USD','approximately']] as const;
 passage('p33','current',/^NVIDIA’s outlook for the third quarter of fiscal 2027 is as follows:$/);
 for(const [metric,id,pattern,scale,unit,range] of outlook){
  const match=passage(id,'current',pattern).match(pattern);if(!match)return fail();
  addReported(metric,'guidance',Number(match[1])*scale,unit,'Management Q3 FY2027 GAAP outlook; not a realized result or independent forecast',id,'Q3 FY2027 management outlook',match[1],scale,`${unit==='USD'?`$${match[1]} billion`:`${match[1]}%`} (management outlook; ${range})`);
 }
 return facts;
}
export function prepareV3Facts(packet:any,discrepancies:V3Discrepancy[]=[],baseFacts?:Map<string,V3Fact>):Map<string,V3Fact> {
 const facts=new Map(baseFacts??prepareV3BaseFacts(packet,discrepancies));
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
   facts.set(id,{id,value,unit:'USD',display:money(value),basis:`Operating cash-flow ${name}; accounting contribution, not a balance or business cause`,metric:'cash_bridge',period,source_ids:[...sourceIds],provenance:period==='qoq'?{kind:'derived',formula:'current cash-flow contribution − prior-quarter cash-flow contribution',input_ids:[`NVDA:cash_bridge:${name}:current`,`NVDA:cash_bridge:${name}:prior_quarter`]}:{kind:'reported',paragraph_id:sourceIds[0],column:period==='current'?'Three months ended July 26, 2026':'Three months ended April 26, 2026',source_value:paragraphs.get(period==='current'?currentId:priorId).text.match(/\(?-?\d[\d,]*\)?/g)[0],unit_scale:1e6}});
  }
 }
 const currentTotal=extract('p171','current',/^Net cash provided by operating activities /,4), priorTotal=extract('prior_p166','prior',/^Net cash provided by operating activities /,2);
 if(currentSum!==currentTotal||priorSum!==priorTotal||currentTotal!==facts.get('NVDA:operating_cash_flow:current')?.value||priorTotal!==facts.get('NVDA:operating_cash_flow:prior_quarter')?.value)return fail();
 const totalId='NVDA:cash_bridge:total:qoq';facts.set(totalId,{id:totalId,value:currentTotal-priorTotal,unit:'USD',display:money(currentTotal-priorTotal),basis:'Sum of all quarterly cash-flow component changes',metric:'cash_bridge',period:'qoq',source_ids:bridgeRows.map(([name])=>`NVDA:cash_bridge:${name}:qoq`),provenance:{kind:'derived',formula:'sum of the quarterly changes in all operating cash-flow contributions',input_ids:bridgeRows.map(([name])=>`NVDA:cash_bridge:${name}:qoq`)}});
 return facts;
}
