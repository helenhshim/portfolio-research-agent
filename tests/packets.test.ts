import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root=new URL('../.research-data/',import.meta.url);
for(const ticker of ['NVDA','JPM','COST']) {
 test(`${ticker} local SEC integration snapshot: provenance, periods and arithmetic`,async t=>{
  let p:any;try{p=JSON.parse(await readFile(new URL(`${ticker}/packet.json`,root),'utf8'));}catch(e:any){if(e.code==='ENOENT'){t.skip('Local SEC snapshot not present; run data checkpoint first');return;}throw e;}
  assert.ok(p.release.text.length>5000);assert.ok(p.sources.every((s:any)=>s.url.startsWith('https://')&&s.sha256.length===64));
  for(const c of p.comparisons){const current=p.facts.find((f:any)=>f.id===c.current_fact_id);const prior=p.facts.find((f:any)=>f.id===c.baseline_fact_id);assert.equal(current.end,p.filing.end);assert.equal(current.value-prior.value,c.absolute_change);assert.equal(current.unit,prior.unit);assert.equal(current.basis,prior.basis);for(const f of [current,prior]){if(f.derivation){assert.notEqual(f.metric,'diluted_eps');assert.equal(f.value,f.source_rows[0].val-f.source_rows[1].val);}else assert.equal(f.value,f.source_rows[0].val);}}
  if(ticker==='NVDA'){assert.equal(p.facts.find((f:any)=>f.id==='NVDA:revenue:current').value,96221000000);assert.notEqual(p.facts.find((f:any)=>f.id==='NVDA:revenue:current').value,177837000000);if(p.schema_version==='2'){assert.match(p.facts.find((f:any)=>f.id==='NVDA:cash_dividends_declared:current').basis,/not cash outflow/);assert.ok(!p.facts.some((f:any)=>f.id==='NVDA:dividends_paid:current'));assert.ok(p.unavailable.some((f:any)=>f.metric==='dividends_paid'));}}
  if(ticker==='JPM'){assert.equal(p.facts.find((f:any)=>f.id==='JPM:revenue:current').concept,'RevenuesNetOfInterestExpense');assert.match(p.limitations.join(' '),/not a simple payout/);}
  if(ticker==='COST'){assert.equal(p.facts.find((f:any)=>f.id==='COST:revenue:current').start,'2026-05-11');assert.ok(p.unavailable.some((f:any)=>f.metric==='diluted_eps'));assert.ok(!p.facts.some((f:any)=>f.id==='COST:diluted_eps:current'));}
 });
}
