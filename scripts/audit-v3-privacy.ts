// Read secrets locally for equality checks; print only counts/pass/fail.
// Never print environment values, matching excerpts, response bodies or headers.
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
const envFiles=['.env.local','.env.preview-budget.local'];
for(const file of envFiles)try{process.loadEnvFile(file);}catch{}
const secret=process.env.OPENAI_API_KEY;
if(!secret||secret.length<20)throw Error('Configure a local key before the secret equality audit.');
const names=envFiles.flatMap(file=>{try{return readFileSync(file,'utf8').split('\n');}catch{return [];}}).map(line=>line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=/)?.[1]).filter((name):name is string=>Boolean(name));
const privateConfig=[...new Set(names.filter(name=>/KEY|TOKEN|SECRET|PASSWORD|(?:KV|REDIS)_.*URL|SEC_.*(?:EMAIL|AGENT|CONTACT)|OPERATOR/.test(name)).flatMap(name=>{const value=process.env[name];return value&&value.length>=8?[value,...(value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)??[])]:[];}))];
function files(root:string):string[]{return readdirSync(root).flatMap(name=>{const path=join(root,name);return statSync(path).isDirectory()?files(path):[path];});}
const clientFiles=['.next/static','.next-v3-dev/dev/static'].flatMap(files).filter(f=>/\.(?:js|map|json|css)$/.test(f));
const leaks=clientFiles.filter(f=>{const body=readFileSync(f,'utf8');return privateConfig.some(value=>body.includes(value));});
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const credentials=[...new Set(names.filter(name=>/KEY|TOKEN|SECRET|PASSWORD|(?:KV|REDIS)_.*URL/.test(name)).map(name=>process.env[name]).filter((value):value is string=>Boolean(value&&value.length>=8)))];
const trackedLeaks=tracked.filter(f=>credentials.some(value=>readFileSync(f).includes(Buffer.from(value))));
const sensitiveTracked=tracked.filter(f=>/^\.env(?!\.example$)|^\.research-runs\//.test(f));
const revisions=execFileSync('git',['rev-list','--all'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
let historicalSecretRevisions=0;
for(const revision of revisions){
 try{execFileSync('git',['grep','--quiet','--fixed-strings','-f','-',revision,'--','.'],{input:credentials.join('\n')+'\n',stdio:['pipe','pipe','pipe']});historicalSecretRevisions++;}
 catch(error){if((error as any).status!==1)throw Error('Historical scan could not complete.');}
}
const origin=process.argv[2]??'http://127.0.0.1:3008';
if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))throw Error('Audit requires a local preview.');
const paths=['/v3','/.env.local','/.env','/.git/config','/.research-runs/result.json','/api/v3/research'];
const pages=[];
for(const path of paths){const response=await fetch(origin+path),body=await response.text();pages.push({path,status:response.status,secretFound:privateConfig.some(value=>body.includes(value))});}
const response=await fetch(origin+'/api/v3/research',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({question:'Pressure-test NVIDIA profitability.',identity:{session_id:'privacy-audit',turn_id:'audit',revision:1}})});
const disabled=await response.text();
const productionGuard=response.status===503&&disabled.includes('unavailable')&&!disabled.includes(secret);
const result={private_config_values_checked:privateConfig.length,client_files_scanned:clientFiles.length,client_secret_matches:leaks.length,tracked_secret_matches:trackedLeaks.length,sensitive_files_tracked:sensitiveTracked.length,git_revisions_scanned:revisions.length,historical_secret_matches:historicalSecretRevisions,pages,production_live_disabled:productionGuard};
console.log(JSON.stringify(result,null,2));
if(leaks.length||trackedLeaks.length||sensitiveTracked.length||historicalSecretRevisions||pages.some(p=>p.secretFound)||pages.slice(1,5).some(p=>p.status!==404)||!productionGuard)process.exitCode=1;
