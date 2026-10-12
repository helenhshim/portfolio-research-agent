// Single-process acquisition control. A deployment-wide coordinator is still required for live multi-instance fetching.
import { createHash } from 'node:crypto';
import { validateSecUserAgent } from '../../scripts/sec-preflight.mjs';
export function validateSecUrl(url:string) {
 const u=new URL(url);
 const allowed=u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&
  ((u.hostname==='data.sec.gov'&&(/^\/submissions\/CIK\d{10}\.json$/.test(u.pathname)||/^\/api\/xbrl\/companyfacts\/CIK\d{10}\.json$/.test(u.pathname)))||
  (u.hostname==='www.sec.gov'&&(/^\/Archives\/edgar\/data\/\d+\/\d+\/[A-Za-z0-9_.-]+$/.test(u.pathname)||u.pathname==='/files/company_tickers.json')));
 if(!allowed||u.search||u.hash)throw new Error('Unapproved SEC destination');
 return u.href;
}
export function createSecClient(userAgent:string, options:any={}) {
 const header=validateSecUserAgent(userAgent);
 const transport=options.fetch||fetch;
 const sleep=options.sleep||((ms:number)=>new Promise(r=>setTimeout(r,ms)));
 const now=options.now||Date.now;
 const cache=new Map<string,any>();const pending=new Map<string,Promise<any>>();
 let nextStart=0,gate=Promise.resolve(),blocked=false;
 const stats={requests:0,cache_hits:0,deduplicated:0,retries:0};
 async function pace(){
  const job=gate.then(async()=>{await sleep(Math.max(0,nextStart-now()));nextStart=now()+250;});
  gate=job.catch(()=>{});await job;
 }
 async function retrieve(url:string){
  if(blocked)throw new Error('SEC access blocked; retrieval stopped');
  for(let attempt=0;attempt<3;attempt++){
   await pace();if(blocked)throw new Error('SEC access blocked; retrieval stopped');stats.requests++;
   const response=await transport(url,{headers:{'User-Agent':header,Accept:'*/*'},redirect:'error',signal:AbortSignal.timeout(20000)});
   if([401,403].includes(response.status)){blocked=true;await response.body?.cancel();throw new Error('SEC access denied; stopping without fallback');}
   if(response.status===429||response.status>=500){
    const retry=response.headers.get('retry-after');await response.body?.cancel();
    if(attempt===2)throw new Error('SEC unavailable after bounded retries');
    const delay=retry?(/^\d+$/.test(retry)?Number(retry)*1000:Date.parse(retry)-now()):1000*2**attempt;
    if(Number.isFinite(delay)&&delay>10000)throw new Error('SEC Retry-After exceeds request budget; defer retrieval');
    stats.retries++;await sleep(Math.max(1000,Number.isFinite(delay)?delay:1000));continue;
   }
   if(!response.ok){await response.body?.cancel();throw new Error(`SEC source unavailable (${response.status})`);}
   const text=await response.text();
   return {url,retrieved_at:new Date(now()).toISOString(),sha256:createHash('sha256').update(text).digest('hex'),text};
  }
 }
 async function get(url:string){
  const target=validateSecUrl(url);
  if(cache.has(target)){stats.cache_hits++;return cache.get(target);}
  if(pending.has(target)){stats.deduplicated++;return pending.get(target);}
  const task=retrieve(target).then(result=>{cache.set(target,result);return result;}).finally(()=>pending.delete(target));
  pending.set(target,task);return task;
 }
 return {get,stats};
}
