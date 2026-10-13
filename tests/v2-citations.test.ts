import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prepareV2Facts} from '../src/lib/v2-financials.ts';
import {findingCitations,factSourceIds} from '../src/lib/v2-citations.ts';
import {packetCoverage} from '../src/lib/v2-presentation.ts';
const packet=JSON.parse(readFileSync(new URL('../src/data/nvda-quarter-pair.json',import.meta.url),'utf8'));
const facts=[...prepareV2Facts(packet).values()],coverage=packetCoverage(packet);
test('Calculated comparisons cite both releases while prior-year facts cite the reporting release',()=>{
 const sources=(id:string)=>[...factSourceIds(facts.find(f=>f.id===id)!,facts)].sort();
 assert.deepEqual(sources('NVDA:operating_margin:qoq_pp'),['current','prior']);
 assert.deepEqual(sources('NVDA:operating_cash_flow:prior_year'),['current']);
 assert.deepEqual(sources('NVDA:cash_bridge:total:qoq'),['current','prior']);
});
test('Finding citations deduplicate reports and retain actual passage locations without inventing them',()=>{
 const finding={id:'finding_1',text:'Compared profitability.',fact_ids:['NVDA:operating_margin:qoq_pp'],passages:[{id:'NVDA:p41',quote:'Actual reported evidence',source:'current' as const},{id:'NVDA:p42',quote:'Other evidence',source:'current' as const}]};
 const citations=findingCitations(finding,{facts,findings:[finding],sources:coverage.sources,cutoff:coverage.cutoff});
 assert.equal(citations.length,2);assert.equal(citations[0].passage,'NVDA:p41');assert.equal(citations[1].passage,undefined);
 assert.equal(citations[1].source.id,'prior');
 assert.deepEqual(findingCitations({...finding,fact_ids:[],passages:[]},{facts,findings:[],sources:coverage.sources,cutoff:coverage.cutoff}),[]);
});
