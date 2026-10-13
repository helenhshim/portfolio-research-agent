import type {DisplayFinding,SourceRef,V2Evidence} from './v2-display.ts';
import type {V2Fact} from './v2-financials.ts';

// Resolve code-owned fact lineage, rather than guessing citations from generated prose.
// Prior-year comparisons are reported in the current release; the prior release
// supplies the prior-quarter baseline. Bridge facts carry exact paragraph lineage.
export function factSourceIds(fact:V2Fact,facts:V2Fact[],seen=new Set<string>()):Set<SourceRef['id']>{
 const sources=new Set<SourceRef['id']>();if(seen.has(fact.id))return sources;seen.add(fact.id);
 for(const id of fact.source_ids){
  const dependency=facts.find(f=>f.id===id);
  if(dependency)for(const source of factSourceIds(dependency,facts,seen))sources.add(source);
  else if(/^NVDA:prior_p\d+$/.test(id))sources.add('prior');
  else if(/^NVDA:p\d+$/.test(id))sources.add('current');
 }
 if(!sources.size&&['current','prior_year','prior_quarter'].includes(fact.period))sources.add(fact.period==='prior_quarter'?'prior':'current');
 return sources;
}
export function findingCitations(finding:DisplayFinding,evidence:V2Evidence):{source:SourceRef;passage?:string}[]{
 const citations=new Map<SourceRef['id'],string|undefined>();
 for(const passage of finding.passages)if(!citations.has(passage.source))citations.set(passage.source,passage.id);
 for(const id of finding.fact_ids){const fact=evidence.facts.find(f=>f.id===id);if(fact)for(const source of factSourceIds(fact,evidence.facts))if(!citations.has(source))citations.set(source,undefined);}
 return evidence.sources.filter(source=>citations.has(source.id)).map(source=>({source,passage:citations.get(source.id)}));
}
