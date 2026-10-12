export const GOALS = ['income','growth','planned_need'];
export const PERIODS = ['short','medium','long'];
export const RISKS = ['low','medium','high'];
export const HOLDING_RATIONALES = {
 profitable_growth: {label:'Sustain profitable business growth',premise:'Demand will translate into durable earnings and cash generation.'},
 dependable_income: {label:'Provide dependable dividend income',premise:'The company will continue cash distributions supported by its business.'},
 business_resilience: {label:'Remain financially resilient',premise:'The business can withstand setbacks without weakening its financial position.'}
};
export const TICKERS = ['NVDA','AAPL','JPM','COST','JNJ'];
export function validateInput(input: any) {
 if (!input || typeof input!=='object' || Object.keys(input).some(k=>!['primary_goal','holding_period','risk_tolerance','tickers','holding_rationale'].includes(k))) throw new Error('Invalid research input');
 if (!GOALS.includes(input.primary_goal) || !PERIODS.includes(input.holding_period) || !RISKS.includes(input.risk_tolerance)) throw new Error('Select valid goal, holding period, and risk tolerance');
 if (!Array.isArray(input.tickers) || input.tickers.length!==1 || new Set(input.tickers).size!==input.tickers.length || input.tickers.some((t:any)=>!TICKERS.includes(t))) throw new Error('Select one supported company for a holding-rationale check');
 if (typeof input.holding_rationale!=='string' || !Object.hasOwn(HOLDING_RATIONALES,input.holding_rationale)) throw new Error('Select a supported holding rationale');
 return structuredClone(input);
}
const text = {type:'string'};
const strings = {type:'array',items:text};
const object = (properties:any) => ({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const array = (item:any,maxItems:number) => ({type:'array',items:item,maxItems});
const profileFields = {type:'array',items:{type:'string',enum:['primary_goal','holding_period','risk_tolerance','holding_rationale']}};
const evidence = object({id:text,paragraph_id:text,quote:text});
export const planSchema = object({questions:array(object({id:text,question:text,relevance:text,fact_ids:strings,profile_fields:profileFields,search_terms:array(text,5)}),2)});
export const draftSchema = object({
 premise_assessment:object({rationale_id:{type:'string',enum:Object.keys(HOLDING_RATIONALES)},status:{type:'string',enum:['supports','challenges','unresolved']},headline:text,what_this_means:text,supported_parts:array(text,2),challenged_parts:array(text,2),unresolved_parts:array(text,3),next_decisive_evidence:text,finding_ids:strings,fact_ids:strings}),
 findings:array(object({id:text,text:text,fact_ids:strings,evidence:array(evidence,3)}),3),
 research_answers:array(object({id:text,question_id:text,status:{type:'string',enum:['supported','unresolved']},text:text,fact_ids:strings,evidence:array(evidence,3)}),2),
 interpretations:array(object({id:text,text:text,finding_ids:strings,profile_fields:profileFields}),3),
 watch_items:array(object({id:text,question:text,signal:text,why_it_matters:text,strengthens_if:text,weakens_if:text,finding_ids:strings,fact_ids:strings,profile_fields:profileFields}),2),
 uncertainties:array(object({id:text,text:text,fact_ids:strings,evidence:array(evidence,2)}),5)
});
