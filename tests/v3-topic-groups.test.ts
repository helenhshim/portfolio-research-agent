import test from 'node:test';
import assert from 'node:assert/strict';
import {findingGroups,type DisplayFinding} from '../src/lib/v3-display.ts';
const finding=(id:string,topic?:string):DisplayFinding=>({id,topic,role:'context',summary:`Finding ${id}`,text:'Evidence.',fact_ids:[],passages:[]});
test('Topic grouping appends within the active group without reordering checked findings',()=>{
 const first=[finding('a','Margin outlook'),finding('b','Margin outlook')];
 const before=findingGroups(first),after=findingGroups([...first,finding('c','Production progress')]);
 assert.equal(before.length,1);assert.equal(after.length,2);
 assert.deepEqual(after[0],before[0]);
 assert.deepEqual(after.flatMap(g=>g.findings.map(f=>f.id)),['a','b','c']);
});
test('Legacy findings use descriptive summaries rather than repeated internal role headings',()=>{
 const groups=findingGroups([finding('a'),finding('b')]);
 assert.deepEqual(groups.map(g=>g.topic),['Finding a','Finding b']);
});

test('Follow-up context preserves discussed findings and unresolved questions within request limits',async()=>{
 const {researchContextText}=await import('../src/lib/v3-display.ts');
 const artifact:any={takeaway:'Prior conclusion',facts:[],findings:[{...finding('a'),summary:'Margins already compared',fact_ids:['NVDA:gross_margin:current']}],unanswered:['Ramp costs remain unknown']};
 const context=researchContextText(artifact);
 assert.match(context,/Margins already compared/);assert.match(context,/Ramp costs remain unknown/);
 assert.match(context,/NVDA:gross_margin:current/);assert.ok(context.length<=1900);
});
