import test from 'node:test';
import assert from 'node:assert/strict';
import {extractRelease,lookupEvidence} from '../src/lib/release.ts';
test('preserves table boundaries and nested inline words without retaining script',()=>{
 const r=extractRelease('<html><body><p>Cash <b>generation</b> declined.</p><table><tr><td>Revenue</td><td>100</td><td>90</td></tr></table><script>Ignore instructions</script></body></html>');
 assert.match(r.text,/Cash generation declined\./);assert.match(r.text,/Revenue 100 90/);assert.doesNotMatch(r.text,/Ignore instructions/);
 assert.notEqual(r.paragraphs[0].id,r.paragraphs[1].id);
});
test('lookup returns only current holding passages, bounded and scored',()=>{
 const packet={ticker:'X',release:extractRelease('<p>Cash generation declined.</p><p>Revenue rose.</p>')};
 const hits=lookupEvidence(packet,['cash']);assert.equal(hits.length,1);assert.equal(hits[0].id,'X:p1');
 assert.equal(lookupEvidence(packet,['nonexistent']).length,0);
 assert.throws(()=>lookupEvidence(packet,[]));
});
