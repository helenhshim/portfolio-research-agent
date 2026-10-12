import packet from '../../../data/nvda-quarter-pair.json';
import {validateInput} from '../../../lib/contracts.ts';
import {runPairedResearch} from '../../../lib/paired-research.ts';
export const runtime='nodejs';
export const maxDuration=240;
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 let sameOrigin=false;
 try{const supplied=new URL(origin||'');sameOrigin=['http:','https:'].includes(supplied.protocol)&&supplied.host===request.headers.get('host');}catch{}
 if(!sameOrigin)return Response.json({error:'Research requests must originate from this app.'},{status:403});
 if(process.env.VERCEL_ENV==='production')return Response.json({error:'Live research is available on the protected preview only.'},{status:503});
 if(!process.env.OPENAI_API_KEY)return Response.json({error:'Live research is not configured. The checked example is still available.'},{status:503});
 let input;
 try{const body=await request.text();if(body.length>2048)throw Error('Research input is too large.');input=validateInput(JSON.parse(body));if(input.tickers[0]!=='NVDA')throw Error('This release supports NVIDIA only.');}catch(error){return Response.json({error:error instanceof Error?error.message:'Choose valid research inputs.'},{status:400});}
 const encoder=new TextEncoder();
 let closed=false;
 let heartbeat:ReturnType<typeof setInterval>|undefined;
 const started=Date.now();
 const requestId=crypto.randomUUID();
 const abort=new AbortController();
 request.signal.addEventListener('abort',()=>abort.abort(),{once:true});
 const stream=new ReadableStream({async start(controller){
  const send=(data:any)=>{if(closed)return;try{controller.enqueue(encoder.encode(JSON.stringify(data)+'\n'));}catch{closed=true;}};
  send({type:'stage',stage:'preparing'});
  heartbeat=setInterval(()=>send({type:'heartbeat'}),15000);
  try{const result=await runPairedResearch(packet,input,process.env.OPENAI_API_KEY!,stage=>send({type:'stage',stage}),abort.signal);send({type:'result',output:result});console.info(JSON.stringify({event:'research_complete',request_id:requestId,elapsed_ms:Date.now()-started}));}catch(error){const message=error instanceof Error?error.message:'';const code=message.includes('quota')?'billing':message.includes('429')?'rate_limit':message.includes('timeout')||message.includes('aborted')?'timeout':'research_failed';send({type:'error',error:code==='billing'?'API billing is unavailable. Try again after credits are restored.':code==='rate_limit'?'The model service is busy. Wait before trying again.':code==='timeout'?'Research timed out. You can retry with the same inputs.':'Research could not complete. Your inputs are preserved; try again.'});console.warn(JSON.stringify({event:'research_failed',request_id:requestId,code,elapsed_ms:Date.now()-started}));}finally{clearInterval(heartbeat);if(!closed){closed=true;controller.close();}}
 },cancel(){closed=true;clearInterval(heartbeat);abort.abort();}});
 return new Response(stream,{headers:{'Content-Type':'application/x-ndjson','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
