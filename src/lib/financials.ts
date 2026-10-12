export type Row = {start: string; end: string; val: number; accn: string; filed: string; fy: number; fp: string; form: string; frame?: string};
export type Fact = {id: string; metric: string; concept: string; value: number; unit: string; start: string; end: string; basis: string; derivation: string | null; source_accessions: string[]; source_rows: Row[]; display: string};
const DAY = 86400000;
const days = (start: string, end: string) => (Date.parse(end) - Date.parse(start)) / DAY + 1;
const nextDay = (date: string) => new Date(Date.parse(date) + DAY).toISOString().slice(0, 10);
export function comparison(current: number, baseline: number) {
  return {absolute_change: current - baseline, percentage_change: baseline > 0 && current >= 0 ? (current - baseline) / baseline * 100 : null};
}
function unique(rows: Row[]) {
  const grouped = new Map<string, Row[]>();
  for (const row of rows) {
    const key = `${row.start}/${row.end}`;
    grouped.set(key, [...(grouped.get(key) || []), row]);
  }
  return [...grouped.values()].map(group => {
    group.sort((a,b) => b.filed.localeCompare(a.filed));
    const latest = group.filter(r => r.filed === group[0].filed);
    if (new Set(latest.map(r => r.val)).size > 1) throw new Error('Conflicting financial values for the same period');
    return latest[0];
  });
}
export function selectQuarter(rows: Row[], end: string, accession: string, additive: boolean, cutoff: string) {
  const eligible = rows.filter(r => r.start && r.filed <= cutoff && ['10-Q','10-K'].includes(r.form));
  const direct = unique(eligible.filter(r => r.end === end && r.accn === accession && days(r.start,r.end) >= 70 && days(r.start,r.end) <= 125));
  if (direct.length === 1) return {row: direct[0], components: [direct[0]], derivation: null};
  if (direct.length > 1) throw new Error('Ambiguous discrete quarter');
  if (!additive) return null;
  const cumulative = unique(eligible.filter(r => r.end === end && r.accn === accession && days(r.start,r.end) > 125 && days(r.start,r.end) <= 375));
  if (cumulative.length !== 1) return null;
  const total = cumulative[0];
  const prefixes = unique(eligible.filter(r => r.start === total.start && r.end < total.end && days(nextDay(r.end),total.end) >= 70 && days(nextDay(r.end),total.end) <= 125));
  if (prefixes.length !== 1) return null;
  const prefix = prefixes[0];
  return {row: {...total, start: nextDay(prefix.end), val: total.val - prefix.val}, components: [total,prefix], derivation:'cumulative_minus_prior_cumulative'};
}
export function priorYearQuarter(rows: Row[], current: ReturnType<typeof selectQuarter>, additive: boolean, cutoff: string) {
  if (!current) return null;
  const ends = [...new Set(rows.filter(r => r.filed <= cutoff && r.end < current.row.end && Math.abs((Date.parse(current.row.end)-Date.parse(r.end))/DAY - 365) <= 14).map(r => r.end))];
  if (ends.length !== 1) return null;
  const end = ends[0];
  // Prefer comparative periods disclosed in the current filing; otherwise latest eligible filing for that period.
  const currentAccession = current.components[0].accn;
  const withCurrent = selectQuarter(rows, end, currentAccession, additive, cutoff);
  if (withCurrent) return Math.abs(days(withCurrent.row.start,end)-days(current.row.start,current.row.end)) <= 7 ? withCurrent : null;
  const candidates = rows.filter(r => r.end === end && r.filed <= cutoff && ['10-Q','10-K'].includes(r.form)).sort((a,b) => b.filed.localeCompare(a.filed));
  for (const accession of [...new Set(candidates.map(r => r.accn))]) {
    const prior = selectQuarter(rows,end,accession,additive,cutoff);
    if (prior && Math.abs(days(prior.row.start,end)-days(current.row.start,current.row.end)) <= 7) return prior;
  }
  return null;
}
export function formatValue(value: number, unit: string) {
  if (unit === 'USD/shares') return `$${value.toFixed(2)} per diluted share`;
  if (unit === 'USD') return `${value < 0 ? '-' : ''}$${(Math.abs(value)/1e9).toFixed(3)} billion`;
  return `${value} ${unit}`;
}
export const METRICS: Record<string, {metric:string;concept:string;unit:string;additive:boolean;basis:string;current_only?:boolean}[]> = {
  NVDA: [{metric:'revenue',concept:'Revenues',unit:'USD',additive:true,basis:'GAAP total revenue'}, {metric:'operating_income',concept:'OperatingIncomeLoss',unit:'USD',additive:true,basis:'GAAP operating income; not net income or adjusted income'}, {metric:'cash_dividends_declared',concept:'DividendsCommonStockCash',unit:'USD',additive:true,basis:'Cash dividends declared on common stock; includes paid and unpaid declarations, not cash outflow',current_only:true}, {metric:'productive_asset_purchases',concept:'PaymentsToAcquireProductiveAssets',unit:'USD',additive:true,basis:'Cash purchases of productive assets; excludes related principal payments',current_only:true}, {metric:'repurchases',concept:'PaymentsForRepurchaseOfCommonStock',unit:'USD',additive:true,basis:'Common-stock repurchase cash payments',current_only:true}],
  JPM: [{metric:'revenue',concept:'RevenuesNetOfInterestExpense',unit:'USD',additive:true,basis:'GAAP reported revenue, net of interest expense; not managed revenue'}],
  COST: [{metric:'revenue',concept:'RevenueFromContractWithCustomerExcludingAssessedTax',unit:'USD',additive:true,basis:'GAAP total revenue including membership fees; not net sales'}],
  AAPL: [{metric:'revenue',concept:'RevenueFromContractWithCustomerExcludingAssessedTax',unit:'USD',additive:true,basis:'GAAP total revenue'}],
  JNJ: [{metric:'revenue',concept:'RevenueFromContractWithCustomerExcludingAssessedTax',unit:'USD',additive:true,basis:'GAAP reported revenue'}]
};
const shared = [
  {metric:'net_income',concept:'NetIncomeLoss',unit:'USD',additive:true,basis:'GAAP net income'},
  {metric:'diluted_eps',concept:'EarningsPerShareDiluted',unit:'USD/shares',additive:false,basis:'GAAP diluted EPS'},
  {metric:'operating_cash_flow',concept:'NetCashProvidedByUsedInOperatingActivities',unit:'USD',additive:true,basis:'GAAP operating cash flow'}
];
export function buildFacts(ticker: string, company: any, filing: {end:string;accession:string;filed:string}, cutoff: string) {
  const facts: Fact[] = [], comparisons: any[] = [], unavailable: any[] = [];
  for (const spec of [...(METRICS[ticker] || []),...shared]) {
    const rows: Row[] = company.facts['us-gaap'][spec.concept]?.units[spec.unit] || [];
    const current = selectQuarter(rows, filing.end, filing.accession, spec.additive, cutoff);
    if (!current) {unavailable.push({metric:spec.metric,reason: spec.additive ? 'No unambiguous current-quarter fact or additive derivation' : 'No discrete quarter value; cumulative EPS is not subtractable'});continue;}
    const prior = 'current_only' in spec && spec.current_only ? null : priorYearQuarter(rows,current,spec.additive,cutoff);
    const make = (selected: NonNullable<typeof current>, suffix: string): Fact => ({id:`${ticker}:${spec.metric}:${suffix}`,metric:spec.metric,concept:spec.concept,value:selected.row.val,unit:spec.unit,start:selected.row.start,end:selected.row.end,basis:spec.basis,derivation:selected.derivation,source_accessions:[...new Set(selected.components.map(r=>r.accn))],source_rows:selected.components,display:formatValue(selected.row.val,spec.unit)});
    const c = make(current,'current'); facts.push(c);
    if ('current_only' in spec && spec.current_only) continue;
    if (!prior) {unavailable.push({metric:spec.metric,reason:'No comparable prior-year fiscal quarter'});continue;}
    const p = make(prior,'prior_year');facts.push(p);
    const delta = comparison(c.value,p.value);
    const id = `${ticker}:${spec.metric}:yoy`;
    comparisons.push({id,metric:spec.metric,baseline:'same fiscal quarter a year earlier',current_fact_id:c.id,baseline_fact_id:p.id,...delta,display:`${c.display} versus ${p.display}; ${delta.percentage_change === null ? 'percentage change not comparable' : `${delta.percentage_change.toFixed(1)}% year-over-year change`}`});
  }
  if(ticker==='NVDA') unavailable.push({metric:'dividends_paid',reason:'Cash dividends declared are not cash payments. Current-quarter PaymentsOfDividends differs from cumulative-derived payments and release totals; reconcile basis before use.'});
  return {facts,comparisons,unavailable};
}
