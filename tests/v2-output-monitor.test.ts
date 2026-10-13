import test from 'node:test';
import assert from 'node:assert/strict';
import {createV2OutputMonitor} from '../src/lib/v2-output-monitor.ts';
import {V2PolicyError} from '../src/lib/v2-safety.ts';

const whitespaceLoop=(error:unknown)=>error instanceof V2PolicyError&&error.code==='provider_whitespace_loop'&&error.message==='provider_whitespace_loop';

test('Reject a formatting whitespace loop split across streamed deltas',()=>{
 const monitor=createV2OutputMonitor();
 monitor.push('{"takeaway":');
 monitor.push(' '.repeat(256));
 monitor.push('\n\t'.repeat(128));
 assert.equal(monitor.maxOutsideWhitespace,512);
 assert.throws(()=>monitor.push('\r'),whitespaceLoop);
 assert.equal(monitor.maxOutsideWhitespace,513);
});

test('Long source whitespace inside a JSON string does not trigger the formatting guard',()=>{
 const monitor=createV2OutputMonitor();
 const json=JSON.stringify({quote:'Public source '+ ' \t\r\n'.repeat(2000)+' ending'});
 for(let index=0;index<json.length;index+=17)monitor.push(json.slice(index,index+17));
 assert.equal(monitor.maxOutsideWhitespace,0);
 monitor.push(' '.repeat(512));
 assert.equal(monitor.maxOutsideWhitespace,512);
});

test('Escaped quotes and backslashes preserve string state across character-sized deltas',()=>{
 const monitor=createV2OutputMonitor();
 const json=JSON.stringify({quote:'Quoted " '+ ' '.repeat(2000)+' \\ '+ ' '.repeat(2000)+' trailing slash \\'});
 for(const character of json)monitor.push(character);
 assert.equal(monitor.maxOutsideWhitespace,0);
 assert.throws(()=>monitor.push('\t'.repeat(513)),whitespaceLoop);
});

test('Ordinary pretty JSON remains allowed even when cumulative whitespace exceeds the guard',()=>{
 const monitor=createV2OutputMonitor();
 const json=JSON.stringify({findings:Array.from({length:100},(_,index)=>({id:`finding_${index}`,evidence:{quote:'Supported public clause'}}))},null,2);
 assert.ok((json.match(/\s/g)??[]).length>512);
 for(let index=0;index<json.length;index+=31)monitor.push(json.slice(index,index+31));
 assert.ok(monitor.maxOutsideWhitespace>0&&monitor.maxOutsideWhitespace<512);
});

test('A valid complete object followed by padding still rejects without exposing its text',()=>{
 const monitor=createV2OutputMonitor();
 monitor.push('{"result":{"status":"complete","private_marker":"not logged"}}');
 monitor.push('\n'.repeat(300));
 assert.throws(()=>monitor.push('\t '.repeat(107)),error=>{
  assert.ok(whitespaceLoop(error));
  assert.doesNotMatch(String(error),/private_marker|not logged/);
  return true;
 });
 assert.equal(monitor.maxOutsideWhitespace,513);
});
