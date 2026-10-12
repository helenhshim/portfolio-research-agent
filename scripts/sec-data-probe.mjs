// Single-process data checkpoint; not an aggregate Vercel production limiter.
import { mkdir, writeFile } from 'node:fs/promises';
import { createSecClient } from '../src/lib/sec.ts';
import { validateSecUserAgent } from './sec-preflight.mjs';
const companies = { NVDA: '1045810', JPM: '19617', COST: '909832', AAPL: '320193', JNJ: '200406' };
const root = new URL('../.research-data/', import.meta.url);
let client;
async function fetchSec(url) {
  return client.get(url);
}
function releaseLink(index, indexUrl) {
  for (const row of index.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || []) {
    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(x => x[1]);
    if (!cells.some(x => x.replace(/<[^>]+>/g, '').trim() === 'EX-99.1')) continue;
    const href = row.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
    if (href) return new URL(href.replaceAll('&amp;', '&'), indexUrl).href;
  }
  return null;
}
try {
  const userAgent = validateSecUserAgent(process.env.SEC_USER_AGENT);
  client = createSecClient(userAgent);
  const targets = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(companies);
  if (targets.some(t => !companies[t])) throw new Error('Probe supports NVDA, JPM, COST, AAPL, JNJ only.');
  await mkdir(root, { recursive: true });
  for (const ticker of targets) {
    const cik = companies[ticker];
    const dir = new URL(`${ticker}/`, root);
    await mkdir(dir, { recursive: true });
    const sources = [];
    const submissions = await fetchSec(`https://data.sec.gov/submissions/CIK${cik.padStart(10, '0')}.json`);
    sources.push(submissions);
    const recent = JSON.parse(submissions.text).filings.recent;
    const i = recent.form.findIndex((form, n) => form === '8-K' && /(^|,)\s*2\.02\s*(,|$)/.test(recent.items?.[n] || ''));
    if (i < 0) throw new Error(`${ticker}: no recent 8-K item 2.02 candidate; do not guess release.`);
    const accession = recent.accessionNumber[i];
    const path = `https://www.sec.gov/Archives/edgar/data/${cik}/${accession.replaceAll('-', '')}/`;
    const index = await fetchSec(`${path}${accession}-index.html`);
    sources.push(index);
    const releaseUrl = releaseLink(index.text, index.url);
    if (!releaseUrl) throw new Error(`${ticker}: candidate has no EX-99.1; manual source inspection required.`);
    const release = await fetchSec(releaseUrl);
    sources.push(release);
    const facts = await fetchSec(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik.padStart(10, '0')}.json`);
    sources.push(facts);
    const gaap = JSON.parse(facts.text).facts['us-gaap'] || {};
    const concepts = ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'NetIncomeLoss', 'EarningsPerShareDiluted', 'NetCashProvidedByUsedInOperatingActivities'];
    const candidates = Object.fromEntries(concepts.filter(k => gaap[k]).map(k => [k, Object.fromEntries(Object.entries(gaap[k].units).map(([unit, rows]) => [unit, rows.slice(-12)]))]));
    for (let n = 0; n < sources.length; n++) {
      await writeFile(new URL(`source-${n}.txt`, dir), sources[n].text);
    }
    const manifest = { ticker, accession, candidate_filing_date: recent.filingDate[i], status: 'retrieved_unvalidated_periods', sources: sources.map(({ text, ...meta }, n) => ({ ...meta, file: `source-${n}.txt` })), fact_candidates: candidates };
    await writeFile(new URL('manifest.json', dir), JSON.stringify(manifest, null, 2));
    console.log(JSON.stringify({ ticker, accession, candidate_filing_date: recent.filingDate[i], release_bytes: Buffer.byteLength(release.text), available_concepts: Object.keys(candidates), status: manifest.status }));
  }
  console.log(`Completed ${client.stats.requests} SEC requests. Raw sources saved locally; fiscal matching and extraction are not yet validated.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
