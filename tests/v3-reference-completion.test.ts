import {test} from 'node:test';
import assert from 'node:assert/strict';
import {completeApprovedFactReferences} from '../src/lib/v3-provider.ts';
test('provider reference completion collects approved summary and detail dependencies without changing prose',()=>{
 const finding={summary:'Margin {{fact:approved-margin}}.',text:'Revenue {{fact:approved-revenue}}.',fact_ids:['approved-revenue']};
 const completed=completeApprovedFactReferences(finding,new Set(['approved-margin','approved-revenue']));
 assert.deepEqual(completed.fact_ids,['approved-revenue','approved-margin']);
 assert.equal(completed.summary,finding.summary);assert.equal(completed.text,finding.text);assert.deepEqual(finding.fact_ids,['approved-revenue']);
});
test('reference completion never legitimizes unknown placeholders or removes declared unknown IDs',()=>{
 const f={summary:'Unknown {{fact:unknown}}.',text:'Approved {{fact:approved}}.',fact_ids:['invalid-declared']};
 assert.deepEqual(completeApprovedFactReferences(f,new Set(['approved'])).fact_ids,['invalid-declared','approved']);
 assert.equal(completeApprovedFactReferences({text:'{{fact:approved}}'},new Set(['approved'])).fact_ids,undefined);
});
import {readFileSync} from 'node:fs';
import {createV3Toolbox} from '../src/lib/v3-safety.ts';
import {verifyV3Finding} from '../src/lib/v3-verifier.ts';
test('a complete approved finding with more than twelve dependencies survives while unknown dependencies still fail',()=>{
 const packet=JSON.parse(readFileSync(new URL('../src/data/nvda-quarter-pair.json',import.meta.url),'utf8'));
 const toolbox=createV3Toolbox(packet);
 const ids=[...toolbox.facts.keys()].slice(0,13);
 const f={id:'finding_1',role:'supports',topic:'Reported performance',summary:'Reported performance supports current scale, with persistence unresolved.',text:ids.map(id=>`Reported evidence {{fact:${id}}}.`).join(' '),fact_ids:ids.slice(0,12),evidence:[]};
 const completed=completeApprovedFactReferences(f,new Set(toolbox.facts.keys()));
 assert.ok(verifyV3Finding(completed,toolbox));
 assert.equal(verifyV3Finding({...completed,text:completed.text+' Unknown {{fact:unknown}}.'},toolbox),null);
});
