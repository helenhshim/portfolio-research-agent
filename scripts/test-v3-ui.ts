// Public, scripted browser checks only; no credentials or paid provider calls.
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {createV3Handler} from '../src/lib/v3-http.ts';
import {V3PolicyError} from '../src/lib/v3-safety.ts';
const packet=JSON.parse(readFileSync(new URL('../src/data/nvda-quarter-pair.json',import.meta.url),'utf8'));
// Use a production-mode localhost frontend for this HTTP-only proxy. A dev
// frontend needs WebSocket forwarding for its HMR runtime to hydrate correctly.
const upstream=process.env.PORTFOLIO_TEST_UPSTREAM??'http://127.0.0.1:3006';
if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(upstream))throw Error('Scripted preview requires a localhost frontend.');
const draft={answer_kind:'analysis',findings:[
 {id:'finding_1',role:'supports',summary:'Scripted UI check: operating leverage supports current profitability, not persistence.',text:'Revenue growth of {{fact:NVDA:revenue:yoy}} exceeded expense growth of {{fact:NVDA:operating_expenses:yoy}}. This supports current operating leverage; repeat demand remains unproven.',fact_ids:['NVDA:revenue:yoy','NVDA:operating_expenses:yoy'],evidence:[]},
 {id:'finding_2',role:'challenges',summary:'Scripted UI check: cash conversion qualifies the thesis, without establishing a business cause.',text:'Operating cash flow fell {{fact:NVDA:operating_cash_flow:qoq}} sequentially. Accounting contributors do not establish payment defaults or temporary timing.',fact_ids:['NVDA:operating_cash_flow:qoq'],evidence:[]},
 {id:'finding_3',role:'context',summary:'Scripted UI check: management outlook contextualizes the verdict; it is not realized demand.',text:'Management expects next-quarter revenue of {{fact:NVDA:guidance_revenue:guidance}}. Guidance does not establish realized demand or durable profitability.',fact_ids:['NVDA:guidance_revenue:guidance'],evidence:[]}
],takeaway:{text:'Scripted UI check: the profitability thesis strengthened, with cash conversion unresolved.',finding_ids:['finding_1','finding_2']},assessment:{text:'Scripted UI check: operating leverage supports the thesis while cash conversion qualifies persistence. Collection evidence would help resolve the assessment.',finding_ids:['finding_1','finding_2']},financial_rows:[],unanswered:['What would establish repeat demand and realized cash?'],next_investigation:null};
// Synthetic cached-comparison conflict; canonical report files stay unchanged.
const discrepancyTest=process.argv.slice(2).includes('--discrepancy');
const fast=process.argv.slice(2).includes('--fast');
if(discrepancyTest){packet.comparisons.find((c:any)=>c.id==='NVDA:revenue:yoy').percentage_change=90;draft.findings[0].text='Revenue growth is withheld for a cached-comparison conflict. Expense growth of {{fact:NVDA:operating_expenses:yoy}} remains available; persistence is unresolved.';draft.findings[0].fact_ids=['NVDA:operating_expenses:yoy'];}
let attempts=0,requests=0;
const handler=createV3Handler({packet,configured:()=>true,provider:()=>{
 const attempt=++attempts;
  return async(_input,signal,observer)=>{
  const wait=(ms:number)=>new Promise<void>((resolve,reject)=>{
   const stop=()=>{clearTimeout(timer);console.log(JSON.stringify({event:'scripted_v3_aborted',attempt}));reject(new V3PolicyError('stopped'));};
   const timer=setTimeout(()=>{signal.removeEventListener('abort',stop);resolve();},ms);
   signal.addEventListener('abort',stop,{once:true});if(signal.aborted)stop();
  });
  await wait(500);observer?.onFinding(draft.findings[0]);observer?.onFinding(draft.findings[2]);
  await wait(discrepancyTest||fast?500:16000);observer?.onFinding(draft.findings[1]);observer?.onFindingsComplete?.();await wait(1000);
  if(attempt===3||_input.request.question.includes('[Scripted reference failure]'))return {kind:'answer',draft:{...draft,takeaway:{text:draft.takeaway.text,finding_ids:['finding_6']}}};
  return {kind:'answer',draft};
 };
}});
createServer(async(req,res)=>{
 const abort=new AbortController();res.on('close',()=>abort.abort());
 try{
  if(req.url==='/__scripted/stats'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({requests,provider_calls:attempts}));return;}
  if(req.url==='/api/v3/research')requests++;
  const body=req.method==='POST'?await new Promise<Buffer>((resolve,reject)=>{const chunks:Buffer[]=[];req.on('data',chunk=>chunks.push(chunk));req.on('end',()=>resolve(Buffer.concat(chunks)));req.on('error',reject);}):undefined;
  const headers=new Headers();for(const [key,value] of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);
  const response=req.url==='/api/v3/research'?await handler(new Request('http://127.0.0.1:3007/api/v3/research',{method:'POST',headers,body:body?.toString('utf8'),signal:abort.signal})):await fetch(upstream+req.url,{headers,signal:abort.signal});
  // fetch returns decoded bytes; forwarded compression/length would corrupt the
  // browser response. This affects the test proxy only, not the production route.
  const outgoing=new Headers(response.headers);outgoing.delete('content-encoding');outgoing.delete('content-length');outgoing.delete('transfer-encoding');
  res.writeHead(response.status,Object.fromEntries(outgoing));
  const reader=response.body?.getReader();if(reader)try{while(true){const chunk=await reader.read();if(chunk.done)break;res.write(chunk.value);}}finally{reader.releaseLock();}
  res.end();
 }catch{if(!res.headersSent)res.writeHead(500);res.end();}
}).listen(3007,'127.0.0.1',()=>console.log('Scripted V3 UI server: http://127.0.0.1:3007/v3'));
