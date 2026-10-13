import {prepareV2Facts,prepareV2BaseFacts,V2_METRICS,type V2Metric} from './v2-financials.ts';
export class V2PolicyError extends Error {
 code:string;
 constructor(code:string){
  const allowed=['invalid_shape','invalid_input','input_limit','invalid_text','sensitive_input','history_limit','invalid_role','invalid_deadline','stopped','deadline','provider_limit','tool_limit','source_url','invalid_period','invalid_paragraph','invalid_metric','unavailable_metric','forbidden_tool','invalid_tools','duplicate_tool','invalid_provider_result','spend_limit','provider_incomplete','provider_whitespace_loop'];
  const safeCode=allowed.includes(code)?code:'research_failed';super(safeCode);this.name='V2PolicyError';this.code=safeCode;
 }
}
const reject=(code:string):never=>{throw new V2PolicyError(code);};
export const V2_LIMITS=Object.freeze({questionChars:2000,historyTurns:6,envelopeBytes:24000,providerCalls:2,toolCalls:2,toolRounds:1,deadlineMs:120000});
export function hasIdentifiedSensitiveInput(text:string){
 return /\b(?:account|acct)(?:\s*(?:number|no\.?|#))?\s*[:=]?\s*\d[\d -]{5,}\b|\b\d{3}-\d{2}-\d{4}\b|\bsk-[A-Za-z0-9_-]{12,}\b|\bclient\s+(?:name|identity)\s*[:=]\s*\S+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text);
}
const plainObject=(value:any):value is Record<string,any>=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value)&&[Object.prototype,null].includes(Object.getPrototypeOf(value));
export function exactKeys(value:any,keys:readonly string[]){
 if(!plainObject(value)||Object.keys(value).some(key=>!keys.includes(key)))return reject('invalid_shape');
}
export type V2Request={question:string;history:{role:'user'|'assistant';text:string}[]};
export function validateV2Request(input:unknown):V2Request {
 let encoded:string;try{encoded=JSON.stringify(input);}catch{return reject('invalid_input');}
 if(typeof encoded!=='string'||new TextEncoder().encode(encoded).length>V2_LIMITS.envelopeBytes)return reject('input_limit');
 exactKeys(input,['question','history']);const body=input as any;
 const validateText=(value:any)=>{
  if(typeof value!=='string'||!value.trim()||value.length>V2_LIMITS.questionChars)return reject('invalid_text');
  if(hasIdentifiedSensitiveInput(value))return reject('sensitive_input');return value.trim();
 };
 const question=validateText(body.question), history=body.history??[];
 if(!Array.isArray(history)||history.length>V2_LIMITS.historyTurns)return reject('history_limit');
 return {question,history:history.map(turn=>{exactKeys(turn,['role','text']);if(!['user','assistant'].includes(turn.role))return reject('invalid_role');return {role:turn.role,text:validateText(turn.text)};})};
}
export class V2RunBudget {
 #providers=0;#tools=0;#rounds=0;#deadline=0;#now:()=>number;#signal?:AbortSignal;
 constructor(options:{signal?:AbortSignal;now?:()=>number;deadlineMs?:number}={}){
  this.#now=options.now??(()=>performance.now());this.#signal=options.signal;
  const duration=options.deadlineMs??V2_LIMITS.deadlineMs;
  if(!Number.isFinite(duration)||duration<=0||duration>V2_LIMITS.deadlineMs)return reject('invalid_deadline');
  this.#deadline=this.#now()+duration;
 }
 assertActive(){if(this.#signal?.aborted)return reject('stopped');if(this.#now()>=this.#deadline)return reject('deadline');}
 reserveProvider(){this.assertActive();if(this.#providers>=V2_LIMITS.providerCalls)return reject('provider_limit');this.#providers++;}
 reserveRound(count:number){this.assertActive();if(this.#rounds>=V2_LIMITS.toolRounds||!Number.isInteger(count)||count<1||this.#tools+count>V2_LIMITS.toolCalls)return reject('tool_limit');this.#rounds++;this.#tools+=count;}
 get remainingMs(){return Math.max(0,this.#deadline-this.#now());}
 // Reserved execution slots, not proof of paid provider usage or successful completions.
 get counts(){return {provider_calls:this.#providers,tool_calls:this.#tools,tool_rounds:this.#rounds};}
}
export type V2ToolCall={name:string;arguments:unknown};
export function createV2Toolbox(authoritativePacket:any){
 // Snapshot once: subsequent client/object mutations cannot change evidence during this run.
 const packet=structuredClone(authoritativePacket);
 const baseFacts=prepareV2BaseFacts(packet);let facts=baseFacts;
 const unavailableMetrics:V2Metric[]=[];
 try{facts=prepareV2Facts(packet);}catch{unavailableMetrics.push('cash_bridge');}
 const paragraphs=new Map<string,any>(packet.release.paragraphs.map((p:any)=>[`NVDA:${p.id}`,p]));
 const sources={current:packet.comparison_context.current.url,prior:packet.comparison_context.prior.url};
 for(const url of Object.values(sources)){
  let parsed:URL;try{parsed=new URL(url as string);}catch{return reject('source_url');}
  if(parsed.protocol!=='https:'||parsed.hostname!=='www.sec.gov'||parsed.username||parsed.password||parsed.search||parsed.hash||!parsed.pathname.startsWith('/Archives/edgar/data/1045810/'))return reject('source_url');
 }
 const validate=(call:V2ToolCall)=>{
  exactKeys(call,['name','arguments']);
  if(call.name==='read_approved_evidence'){
   exactKeys(call.arguments,['period','paragraph_ids']);const args=call.arguments as any;
   if(!['current','prior'].includes(args.period))return reject('invalid_period');
   if(args.paragraph_ids!==undefined&&(!Array.isArray(args.paragraph_ids)||args.paragraph_ids.length<1||args.paragraph_ids.length>20||new Set(args.paragraph_ids).size!==args.paragraph_ids.length||args.paragraph_ids.some((id:any)=>typeof id!=='string'||paragraphs.get(id)?.source_period!==args.period)))return reject('invalid_paragraph');
   return {name:call.name,arguments:{period:args.period,paragraph_ids:args.paragraph_ids?[...args.paragraph_ids].sort():null}};
  }
  if(call.name==='get_checked_metrics'){
   exactKeys(call.arguments,['metric_ids']);const args=call.arguments as any;
   if(!Array.isArray(args.metric_ids)||args.metric_ids.length<1||args.metric_ids.length>V2_METRICS.length||new Set(args.metric_ids).size!==args.metric_ids.length||args.metric_ids.some((id:any)=>!V2_METRICS.includes(id)))return reject('invalid_metric');
   if(args.metric_ids.some((id:V2Metric)=>unavailableMetrics.includes(id)))return reject('unavailable_metric');
   return {name:call.name,arguments:{metric_ids:[...args.metric_ids].sort() as V2Metric[]}};
  }
  return reject('forbidden_tool');
 };
 return {
  facts,paragraphs,
  sourceContext(){return structuredClone({ticker:'NVDA',source_cutoff:packet.source_cutoff,sources,unavailable_metrics:unavailableMetrics,paragraphs:[...paragraphs].map(([id,p])=>({id,text:p.text,source_period:p.source_period})),facts:[...facts.values()]});},
  executeRound(calls:V2ToolCall[],budget:V2RunBudget){
   if(!Array.isArray(calls))return reject('invalid_tools');
   // Validate the whole batch before any execution, including duplicates independent of key order.
   const requests=calls.map(validate),keys=requests.map(r=>JSON.stringify(r));
   if(new Set(keys).size!==keys.length)return reject('duplicate_tool');
   budget.reserveRound(requests.length);
   return requests.map(request=>{
    budget.assertActive();
    if(request.name==='get_checked_metrics')return {name:request.name,facts:structuredClone([...facts.values()].filter(f=>(request.arguments as any).metric_ids.includes(f.metric)))};
    const args=request.arguments as any;
    const selected=[...paragraphs].filter(([id,p])=>p.source_period===args.period&&(!args.paragraph_ids||args.paragraph_ids.includes(id))).map(([id,p])=>({id,text:p.text,source_period:p.source_period}));
    return {name:request.name,source_url:sources[args.period as 'current'|'prior'],paragraphs:structuredClone(selected)};
   });
  },
 };
}
