import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3000';
const example=JSON.parse(await readFile(new URL('../src/data/nvda-example.json',import.meta.url),'utf8'));
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1280,height:1000},colorScheme:'light'});
 const page=await context.newPage();const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base);
 await page.getByRole('heading',{name:'What should this holding do for you?'}).waitFor();
 assert.equal(await page.locator('select').count(),4);
 await page.screenshot({path:'test-results/setup-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'View checked example'}).click();
 await page.getByRole('heading',{name:example.result.premise_assessment.headline}).waitFor();
 assert.equal(await page.locator('.financial-table tbody tr').count(),3);
 assert.match(await page.locator('.financial-table').innerText(),/52.2% QoQ/);
 assert.match(await page.locator('.financial-table').innerText(),/56.7% YoY/);
 await page.locator('summary').filter({hasText:'Compare the evidence'}).first().click();
 assert.ok(await page.locator('.evidence-pair blockquote').first().isVisible());
 assert.match(await page.getByRole('link',{name:'Q2 SEC release'}).first().getAttribute('href'),/^https:\/\/www.sec.gov\/Archives\//);
 await page.screenshot({path:'test-results/result-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:'test-results/result-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Edit research inputs'}).click();
 await page.locator('#goal').selectOption('income');await page.locator('#rationale').selectOption('dependable_income');await page.locator('#period').selectOption('short');await page.locator('#risk').selectOption('low');
 if(!process.env.LIVE_WEB_TEST){
  let submitted;
  await page.route('**/api/research',async route=>{
   submitted=route.request().postDataJSON();
   await new Promise(resolve=>setTimeout(resolve,400));
   await route.fulfill({status:200,contentType:'application/x-ndjson',body:[{type:'stage',stage:'analyzing'},{type:'result',output:{...example,inputs:submitted}}].map(x=>JSON.stringify(x)).join('\n')+'\n'});
  });
  await page.getByRole('button',{name:'Generate brief'}).click();
  assert.ok(await page.locator('#goal').isDisabled());
  await page.getByRole('heading',{name:example.result.premise_assessment.headline}).waitFor();
  assert.deepEqual(submitted,{primary_goal:'income',holding_rationale:'dependable_income',holding_period:'short',risk_tolerance:'low',tickers:['NVDA']});
  assert.match(await page.locator('.context-line').first().innerText(),/Generate ongoing income/);
  await page.getByRole('button',{name:'Edit research inputs'}).click();
  await page.unroute('**/api/research');
  await page.route('**/api/research',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Test service unavailable'})}));
  await page.getByRole('button',{name:'Generate brief'}).click();
  await page.getByRole('alert').waitFor();
  await expect(page.locator('#goal')).toBeEnabled();
  assert.equal(await page.locator('#goal').inputValue(),'income');assert.equal(await page.locator('#goal').isDisabled(),false);
 }else{
  let live;
  page.on('response',async response=>{if(response.url()===base+'/api/research'){const body=await response.text();const events=body.trim().split('\n').map(x=>JSON.parse(x));live=events.find(e=>e.type==='result')?.output;await writeFile('test-results/live-web-output.json',JSON.stringify({events},null,2));}});
  await page.getByRole('button',{name:'Generate brief'}).click();
  await page.locator('.receipt, .error').waitFor({timeout:230000});
  if(await page.locator('.error').isVisible())throw Error(await page.locator('.error').innerText());
  await page.screenshot({path:'test-results/live-result.png',fullPage:true});
  assert.match(await page.locator('.context-line').first().innerText(),/Generate ongoing income/);
  await page.waitForTimeout(200);
  assert.equal(live.inputs.primary_goal,'income');assert.equal(live.inputs.holding_rationale,'dependable_income');
  console.log(JSON.stringify({live_model:live.model,effort:live.effort,elapsed_ms:live.elapsed_ms,headline:live.result.premise_assessment?.headline,checks:live.result.checks,comparison_checks:live.result.comparison_checks}));
 }
 assert.deepEqual(errors,[]);
 console.log(process.env.LIVE_WEB_TEST?'Live browser-to-model flow passed.':'UI fixture checks passed (no model call).');
}finally{await browser.close();}
