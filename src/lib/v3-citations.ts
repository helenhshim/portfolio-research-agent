import type {DisplayFinding,Passage,SourceRef,V3Evidence} from './v3-display.ts';
import type {V3Fact} from './v3-financials.ts';
export type LocatedCitation={source:SourceRef;passage?:string;quote?:string;column?:string};
// Only checked source text becomes a fragment; never model-authored URLs or prose.
export function sourceLocationUrl(url:string,quote?:string|string[]){
 let parsed:URL;try{parsed=new URL(url);}catch{return '';}
 if(parsed.protocol!=='https:'||parsed.hostname!=='www.sec.gov'||parsed.username||parsed.password||!parsed.pathname.startsWith('/Archives/edgar/data/1045810/'))return '';
 const quotes=(Array.isArray(quote)?quote:[quote]).filter((q):q is string=>Boolean(q?.trim()));
 if(!quotes.length)return parsed.href;
 const encode=(text:string)=>encodeURIComponent(text).replaceAll('-', '%2D');
 const fragments=quotes.map(q=>{
  // SEC tables render separate block-level cells. A single phrase cannot cross
  // them: use a distinctive amount, or a label-to-first-value range for ratios.
  q=q.replace(/^\s*•\s*/, '');
  const row=q.match(/^([^$\d]+?)\s+(\$?\(?-?\d[\d,.]*\)?)(?:\s|$)/);
  if(row&&!/[.!?]/.test(row[1])&&/^[\d\s$%,().+−—\-pts/]*$/.test(q.slice(row[0].length))&&(q.match(/\d[\d,.]*/g)?.length??0)>=3){
   const amount=row[2].replace('$','');
   return 'text='+(amount.includes(',')?encode(amount):`${encode(row[1].trim())},${encode(amount)}`);
  }
  const words=q.trim().split(/\s+/);
  return 'text='+(words.length>16?`${encode(words.slice(0,8).join(' '))},${encode(words.slice(-8).join(' '))}`:encode(words.join(' ')));
 });
 parsed.hash=`:~:${[...new Set(fragments)].join('&')}`;return parsed.href;
}
export function locatedCitations(finding:DisplayFinding,evidence:V3Evidence):LocatedCitation[]{
 const result:LocatedCitation[]=[];const seen=new Set<string>();
 const add=(id:string,quote?:string,column?:string)=>{
  const source=evidence.sources.find(s=>s.id===(id.includes('prior_')?'prior':'current'));if(!source)return;
  const key=`${id}:${quote??''}:${column??''}`;if(seen.has(key))return;seen.add(key);
  result.push({source,passage:id,quote,column});
 };
 const visited=new Set<string>();
 const visit=(fact:V3Fact)=>{
  if(visited.has(fact.id))return;visited.add(fact.id);
  if(fact.provenance.kind==='reported')add(fact.provenance.paragraph_id,fact.provenance.source_excerpt,fact.provenance.column);
  else for(const id of fact.provenance.input_ids){const input=evidence.facts.find(f=>f.id===id);if(input)visit(input);}
 };
 for(const id of finding.fact_ids){const fact=evidence.facts.find(f=>f.id===id);if(fact)visit(fact);}
 for(const passage of finding.passages)add(passage.id,passage.quote);
 return result;
}
export function evidencePassages(evidence:V3Evidence):Passage[]{
 const all=evidence.findings.flatMap(f=>locatedCitations(f,evidence));
 return all.filter(c=>c.passage&&c.quote).map(c=>({id:c.passage!,quote:c.quote!,source:c.source.id}));
}
