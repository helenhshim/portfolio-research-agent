import test from 'node:test';
import assert from 'node:assert/strict';
import packet from '../src/data/nvda-quarter-pair.json' with {type:'json'};
import {loadV3Reference} from '../src/lib/v3-reference.ts';
import {locatedCitations,sourceLocationUrl,evidencePassages} from '../src/lib/v3-citations.ts';
import {createV3Toolbox} from '../src/lib/v3-safety.ts';
import {historyArtifactChecker} from '../src/lib/v3-history-validation.ts';
test('financial and qualitative references preserve exact frozen source locations and both comparison inputs',async()=>{
 const artifact=await loadV3Reference();
 for(const finding of artifact.findings){
  const citations=locatedCitations(finding,artifact);assert.ok(citations.length);
  for(const c of citations){
   assert.ok(c.quote);const p=packet.release.paragraphs.find(p=>'NVDA:'+p.id===c.passage);assert.ok(p?.text.includes(c.quote!));
   assert.ok(sourceLocationUrl(c.source.url,c.quote).includes('#:~:text='));
  }
 }
 const cash=artifact.findings.find(f=>f.id==='finding_4')!;
 assert.deepEqual(new Set(locatedCitations(cash,artifact).map(c=>c.source.id)),new Set(['current','prior']));
 assert.ok(evidencePassages(artifact).some(p=>p.quote.includes('Net cash')));
});
test('fragment encoding protects literal commas and hyphens and rejects foreign URLs',()=>{
 const url=packet.comparison_context.current.url;
 const link=sourceLocationUrl(url,'Revenue $96,221 - current');assert.ok(link.includes('%2C'));assert.ok(link.includes('%2D'));
 assert.equal(sourceLocationUrl('javascript:alert(1)','text'),'');assert.equal(sourceLocationUrl('https://evil.invalid','text'),'');
 assert.ok(sourceLocationUrl(url,['first passage','second passage']).includes('&text='));
});
test('restoration rebuilds excerpt metadata; source excerpts never inflate model fact context',async()=>{
 const artifact=await loadV3Reference();for(const f of artifact.facts)if(f.provenance.kind==='reported')f.provenance.source_excerpt='tampered excerpt';
 const restored=historyArtifactChecker(packet)(artifact);assert.ok(restored);assert.ok(!JSON.stringify(restored).includes('tampered excerpt'));
 assert.ok(!JSON.stringify(createV3Toolbox(packet).sourceContext().facts).includes('source_excerpt'));
});
