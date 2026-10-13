// Local-only deterministic UI harness. No credentials, provider calls or model spend.
// Run alongside the normal preview: node scripts/test-v2-ui.ts
// Request order: timeout, tool-assisted success, slow cancellable run, check failure.
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {createV2Handler} from '../src/lib/v2-http.ts';
import {V2PolicyError} from '../src/lib/v2-safety.ts';
const packet=JSON.parse(readFileSync(new URL('../src/data/nvda-quarter-pair.json',import.meta.url),'utf8'));
let attempt=0;
const draft={answer_kind:'analysis',takeaway:{text:'Scripted UI test: current profitability improved; persistence remains unresolved.',finding_ids:['finding_1']},
 findings:[{id:'finding_1',text:'Operating margin is {{fact:NVDA:operating_margin:current}}.',fact_ids:['NVDA:operating_margin:current'],evidence:[{paragraph_id:'NVDA:p41',quote:'ramping into full production with racks running at partners'}]}],
 financial_rows:[{fact_id:'NVDA:operating_margin:current',implication:'Current profitability does not establish persistence.',finding_ids:['finding_1']}],unanswered:['Future product economics remain unresolved.'],next_investigation:null};
const handler=createV2Handler({packet,configured:()=>true,provider:()=>{
 const number=++attempt;let calls=0;
 return async(_input,signal)=>{
  await new Promise<void>((resolve,reject)=>{
   const abort=()=>{clearTimeout(timer);reject(new V2PolicyError('stopped'));};
   const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},number===3?20000:2500);
   signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();
  });
  if(number===1)throw new V2PolicyError('deadline');
  if(number===2&&calls++===0)return {kind:'tools',calls:[{name:'get_checked_metrics',arguments:{metric_ids:['operating_margin']}}]};
  return {kind:'answer',draft:number===4?{...draft,takeaway:{...draft.takeaway,finding_ids:['missing']}}:draft};
 };
}});
const server=createServer(async(req,res)=>{
 const abort=new AbortController();res.on('close',()=>abort.abort());
 try{
  let response:Response;
  if(req.url==='/api/v2/research'){
   const chunks:Buffer[]=[];for await(const chunk of req)chunks.push(Buffer.from(chunk));
   response=await handler(new Request('http://127.0.0.1:3006/api/v2/research',{method:'POST',headers:{'Content-Type':'application/json',Origin:req.headers.origin??'',Host:'127.0.0.1:3006'},body:Buffer.concat(chunks).toString(),signal:abort.signal}));
  }else{
   response=await fetch(new URL(req.url??'/v2','http://127.0.0.1:3005'),{signal:abort.signal});
  }
  res.writeHead(response.status,Object.fromEntries([...response.headers].filter(([key])=>!['content-encoding','content-length','transfer-encoding'].includes(key))));
  if(response.body)for await(const chunk of response.body as any)res.write(chunk);
  res.end();
 }catch{if(!res.destroyed){res.writeHead(502);res.end('Local UI harness could not complete.');}}
});
server.listen(3006,'127.0.0.1',()=>console.log('Scripted UI test only: http://127.0.0.1:3006/v2 (no API spend)'));
