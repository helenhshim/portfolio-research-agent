import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createV3ReferenceCodec} from '../src/lib/v3-reference-codec.ts';
test('wire aliases preserve canonical references, exact quotes and unknown IDs',()=>{
 const codec=createV3ReferenceCodec({facts:[{id:'NVDA:revenue:current'}],paragraphs:[{id:'NVDA:p1'}]});
 const canonical={text:'Revenue {{fact:NVDA:revenue:current}}',fact_ids:['NVDA:revenue:current'],evidence:[{paragraph_id:'NVDA:p1',quote:'{{fact:NVDA:revenue:current}}'}]};
 const encoded=codec.encode(canonical);
 assert.equal(encoded.text,'Revenue {{fact:f0}}');assert.equal(encoded.evidence[0].paragraph_id,'p0');assert.equal(encoded.evidence[0].quote,canonical.evidence[0].quote);
 assert.deepEqual(codec.decode(encoded),canonical);
 assert.equal(codec.decode({text:'{{fact:f999}}'}).text,'{{fact:f999}}');
});
