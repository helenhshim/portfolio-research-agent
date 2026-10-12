export function financialRows(output:any,packet:any){
 return output.result.selected_financial_rows.flatMap((row:any)=>{
  const fact=packet.facts.find((f:any)=>f.id===row.fact_id);
  const comparison=packet.comparisons.find((c:any)=>c.id===row.comparison_id);
  if(!fact||!fact.id.endsWith(':current')||comparison&&comparison.current_fact_id!==fact.id)return [];
  const prior=comparison?packet.facts.find((f:any)=>f.id===comparison.baseline_fact_id):null;
  const yoy=packet.comparisons.find((c:any)=>c.metric===fact.metric&&c.id.endsWith(':yoy'));
  return [{...row,fact,comparison,prior,yoy}];
 });
}
export const metricLabels:Record<string,string>={revenue:'Revenue',operating_income:'GAAP operating profit',net_income:'GAAP net income',operating_cash_flow:'Operating cash flow',diluted_eps:'Diluted EPS',cash_dividends_declared:'Cash dividends declared',repurchases:'Share repurchases',productive_asset_purchases:'Productive-asset purchases'};
export function displayValue(fact:any){return fact.unit==='USD'?`$${(fact.value/1e9).toFixed(fact.metric==='cash_dividends_declared'?3:2)}B`:fact.unit==='USD/shares'?`$${fact.value.toFixed(2)}`:fact.display;}
export function displayChange(comp:any){if(comp.percentage_change===null)return 'Percentage change not comparable';return `${comp.percentage_change>=0?'+':'−'}${Math.abs(comp.percentage_change).toFixed(1)}% ${comp.id.endsWith(':qoq')?'QoQ':'YoY'}`;}
