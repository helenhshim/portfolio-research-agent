// Server configuration policy; contains no credentials or runtime storage client.
export const V3_PREVIEW_BUDGET_KEY='portfolio-research:v3:preview:budget:1';
export const V3_PRODUCTION_BUDGET_KEY='portfolio-research:v3:production:budget:1';
export function v3DeploymentBudgetKey(environment:string|undefined){return environment==='production'?V3_PRODUCTION_BUDGET_KEY:V3_PREVIEW_BUDGET_KEY;}
export function v3DeploymentLiveConfigured(environment:string|undefined,hasKey:boolean,productionEnabled:string|undefined){return hasKey&&(environment!=='production'||productionEnabled==='true');}
