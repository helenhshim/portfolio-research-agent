import {V2PolicyError} from './v2-safety.ts';

// Monitor formatting only. JSON shape, references and claims still require the
// existing complete-response checks. No response text is retained or returned.
export function createV2OutputMonitor(){
 let inString=false,escaped=false,outsideWhitespace=0,maxOutsideWhitespace=0;
 return {
  get maxOutsideWhitespace(){return maxOutsideWhitespace;},
  push(delta:string){
   for(const character of delta){
    if(inString){
     if(escaped)escaped=false;
     else if(character==='\\')escaped=true;
     else if(character==='"')inString=false;
     continue;
    }
    if(character===' '||character==='\t'||character==='\n'||character==='\r'){
     outsideWhitespace++;
     maxOutsideWhitespace=Math.max(maxOutsideWhitespace,outsideWhitespace);
     if(outsideWhitespace>512)throw new V2PolicyError('provider_whitespace_loop');
    }else{
     outsideWhitespace=0;
     if(character==='"')inString=true;
    }
   }
  },
 };
}
