import {test} from 'node:test';
import assert from 'node:assert/strict';
import {v3DeploymentBudgetKey,v3DeploymentLiveConfigured,V3_PREVIEW_BUDGET_KEY,V3_PRODUCTION_BUDGET_KEY} from '../src/lib/v3-deployment-policy.ts';
test('production uses an independent persistent budget key without resetting preview accounting',()=>{
 assert.notEqual(V3_PREVIEW_BUDGET_KEY,V3_PRODUCTION_BUDGET_KEY);
 assert.equal(v3DeploymentBudgetKey('production'),V3_PRODUCTION_BUDGET_KEY);assert.equal(v3DeploymentBudgetKey('preview'),V3_PREVIEW_BUDGET_KEY);
});
test('production requires explicit opt-in and a key while preview/local behavior is preserved',()=>{
 for(const enabled of [undefined,'false','1','TRUE'])assert.equal(v3DeploymentLiveConfigured('production',true,enabled),false);
 assert.equal(v3DeploymentLiveConfigured('production',true,'true'),true);assert.equal(v3DeploymentLiveConfigured('production',false,'true'),false);
 assert.equal(v3DeploymentLiveConfigured('preview',true,undefined),true);assert.equal(v3DeploymentLiveConfigured(undefined,true,undefined),true);
});
