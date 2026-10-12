import test from 'node:test';
import assert from 'node:assert/strict';
import { selectQuarter, priorYearQuarter, comparison } from '../src/lib/financials.ts';
const row = (start:string,end:string,val:number, accn='latest')=>({start,end,val,accn,filed:'2026-10-01',fy:2026,fp:'Q2',form:'10-Q'});
test('select discrete period over same-end YTD and ignore later data',()=>{
 const rows=[row('2026-01-01','2026-06-30',100),row('2026-04-01','2026-06-30',60),{...row('2026-04-01','2026-06-30',999),filed:'2027-01-01'}];
 assert.equal(selectQuarter(rows,'2026-06-30','latest',true,'2026-10-11')?.row.val,60);
});
test('derive additive 16-week fourth quarter but never derive EPS',()=>{
 const rows=[row('2025-09-01','2026-08-30',300),row('2025-09-01','2026-05-10',200,'previous')];
 const q=selectQuarter(rows,'2026-08-30','latest',true,'2026-10-11');
 assert.equal(q?.row.val,100);assert.equal(q?.row.start,'2026-05-11');assert.equal(q?.components.length,2);
 assert.equal(selectQuarter(rows,'2026-08-30','latest',false,'2026-10-11'),null);
});
test('match fiscal prior year, not calendar frame, and reject unequal durations',()=>{
 const rows=[row('2026-04-27','2026-07-26',96),row('2025-04-28','2025-07-27',46)];
 const q=selectQuarter(rows,'2026-07-26','latest',true,'2026-10-11');
 assert.equal(priorYearQuarter(rows,q,true,'2026-10-11')?.row.val,46);
 const unequal=[rows[0],row('2025-01-01','2025-07-27',46)];
 assert.equal(priorYearQuarter(unequal,q,true,'2026-10-11'),null);
});
test('conflicting same-period values fail closed',()=>{
 assert.throws(()=>selectQuarter([row('2026-04-01','2026-06-30',60),row('2026-04-01','2026-06-30',61)],'2026-06-30','latest',true,'2026-10-11'));
});
test('zero/negative baselines and sign transitions do not imply standard growth percentages',()=>{
 assert.equal(comparison(5,0).percentage_change,null);assert.equal(comparison(-5,-10).percentage_change,null);assert.equal(comparison(-5,10).percentage_change,null);
 assert.equal(comparison(120,100).percentage_change,20);
});
