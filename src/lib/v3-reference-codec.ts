// Wire-only aliases. Authoritative facts, citations, stored answers and checks
// always retain their original IDs. Never modify quoted report text.
export function createV3ReferenceCodec(context:{facts:{id:string}[];paragraphs:{id:string}[]}){
 const pairs=[...context.facts.map((f,i)=>[f.id,`f${i}`]),...context.paragraphs.map((p,i)=>[p.id,`p${i}`])];
 const forward=new Map(pairs.map(([id,alias])=>[id,alias]));
 const backward=new Map(pairs.map(([id,alias])=>[alias,id]));
 function transform(value:unknown,map:Map<string,string>,key=''):any{
  if(typeof value==='string'){
   if(key==='quote'||key==='source_excerpt')return value;
   return map.get(value)??value.replace(/\{\{fact:([^}]+)\}\}/g,(whole,id)=>map.has(id)?`{{fact:${map.get(id)}}}`:whole);
  }
  if(Array.isArray(value))return value.map(v=>transform(v,map,key));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,transform(v,map,k)]));
  return value;
 }
 return {encode:(value:unknown)=>transform(value,forward),decode:(value:unknown)=>transform(value,backward)};
}
