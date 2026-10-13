// Server-only extraction of COMPLETE JSON finding objects. This is framing, not
// verification: the controller checks every object against authoritative evidence.
// No raw delta, partial quote, reasoning text or unfinished string leaves this module.
const MAX_CHARS=20000;
const TOP_LEVEL_KEYS=new Set(['answer_kind','findings','takeaway','financial_rows','unanswered','next_investigation']);
function valueEnd(text:string,start:number):number|null {
 const first=text[start];if(!first)return null;
 if(first==='"'){
  let escaped=false;for(let i=start+1;i<text.length;i++){if(escaped){escaped=false;continue;}if(text[i]==='\\'){escaped=true;continue;}if(text[i]==='"')return i+1;}return null;
 }
 if(first==='{'||first==='['){
  const stack:string[]=[];let quoted=false,escaped=false;
  for(let i=start;i<text.length;i++){
   const c=text[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
   if(c==='"'){quoted=true;continue;}if(c==='{'||c==='[')stack.push(c);
   else if(c==='}'||c===']'){if(stack.pop()!==(c==='}'?'{':'['))return -1;if(!stack.length)return i+1;}
  }return null;
 }
 for(let i=start;i<text.length;i++)if(/[\s,}\]]/.test(text[i]))return i;
 return null;
}
export function createV2FindingStream(onFinding:(finding:unknown)=>void,onReset:()=>void,onFindingsComplete?:()=>void){
 let buffer='',at=0,disabled=false,done=false,started=false,emitted=false;
 let state:'key'|'colon'|'value'|'separator'|'finding'|'finding_separator'='key',key='',kind:string|undefined;
 const keys=new Set<string>(),ids=new Set<string>();let count=0,findingsComplete=false;
 const closeFindings=()=>{at++;state='separator';if(!findingsComplete){findingsComplete=true;onFindingsComplete?.();}};
 const disable=()=>{if(disabled)return;disabled=true;if(emitted){emitted=false;onReset();}buffer='';};
 const skip=()=>{while(/\s/.test(buffer[at]??'')&&at<buffer.length)at++;};
 const parse=(start:number,end:number)=>JSON.parse(buffer.slice(start,end));
 function push(delta:string){
  if(disabled)return;
  if(buffer.length+delta.length>MAX_CHARS){disable();return;}buffer+=delta;
  try{
   while(!disabled){
    skip();if(at>=buffer.length)return;
    if(done){disable();return;}
    if(!started){if(buffer[at]!=='{'){disable();return;}started=true;at++;continue;}
    if(state==='key'){
     if(buffer[at]==='}'){at++;done=true;continue;}
     if(buffer[at]!=='"'){disable();return;}const end=valueEnd(buffer,at);if(end===null)return;if(end<0){disable();return;}
     key=parse(at,end);if(!TOP_LEVEL_KEYS.has(key)||keys.has(key)){disable();return;}keys.add(key);at=end;state='colon';continue;
    }
    if(state==='colon'){if(buffer[at]!==':'){disable();return;}at++;state='value';continue;}
    if(state==='value'){
     if(key==='findings'){
      // Classification must already be complete. Coverage/clarification replies
      // must never masquerade as an incremental analysis of the old objective.
      if(buffer[at]!=='['||!['analysis','source_limited'].includes(kind??'')){disable();return;}
      at++;state='finding';continue;
     }
     const end=valueEnd(buffer,at);if(end===null)return;if(end<0){disable();return;}
     const value=parse(at,end);if(key==='answer_kind')kind=value;at=end;state='separator';continue;
    }
    if(state==='finding'){
     if(buffer[at]===']'){closeFindings();continue;}
     if(buffer[at]!=='{'){disable();return;}const end=valueEnd(buffer,at);if(end===null)return;if(end<0){disable();return;}
     const finding=parse(at,end);count++;
     if(count>3||typeof finding.id!=='string'||ids.has(finding.id)){disable();return;}ids.add(finding.id);
     at=end;state='finding_separator';emitted=true;onFinding(finding);continue;
    }
    if(state==='finding_separator'){
     if(buffer[at]===','){at++;state='finding';continue;}
     if(buffer[at]===']'){closeFindings();continue;}disable();return;
    }
    if(buffer[at]===','){at++;state='key';continue;}
    if(buffer[at]==='}'){at++;done=true;continue;}disable();return;
   }
  }catch{disable();}
 }
 return {push,disable,finish(finalText:string){
  // The completed message is authoritative; reject a different delta stream or
  // malformed envelope, even if an earlier object was individually well formed.
  if(disabled)return;
  try{const final=JSON.parse(finalText);if(buffer!==finalText||!done||!['analysis','source_limited'].includes(final.answer_kind)||!Array.isArray(final.findings))disable();}
  catch{disable();}
 }};
}
