import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildFacts } from '../src/lib/financials.ts';
import { extractRelease } from '../src/lib/release.ts';
const targets = process.argv.slice(2).length ? process.argv.slice(2) : ['NVDA','JPM','COST'];
for (const ticker of targets) {
 const dir = new URL(`../.research-data/${ticker}/`,import.meta.url);
 const manifest = JSON.parse(await readFile(new URL('manifest.json',dir),'utf8'));
 for (const source of manifest.sources) {
   const raw=await readFile(new URL(source.file,dir),'utf8');
   if (createHash('sha256').update(raw).digest('hex')!==source.sha256) throw new Error(`${ticker}: raw source hash mismatch`);
 }
 const submissions = JSON.parse(await readFile(new URL('source-0.txt',dir),'utf8'));
 const company = JSON.parse(await readFile(new URL('source-3.txt',dir),'utf8'));
 const recent = submissions.filings.recent;
 const i = recent.form.findIndex((form:string)=>['10-Q','10-K'].includes(form));
 if (i<0) throw new Error(`${ticker}: no financial filing`);
 const filing = {end:recent.reportDate[i],accession:recent.accessionNumber[i],filed:recent.filingDate[i]};
 const release = extractRelease(await readFile(new URL('source-2.txt',dir),'utf8'));
 const cutoff = manifest.sources[3].retrieved_at.slice(0,10);
 // Stop if latest financial filing and candidate release do not describe the same period.
 const periodCandidates = release.text.match(/(?:ended|ending)\s+(?:[A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/g) || [];
 const explicitEnds = periodCandidates.map((x:string)=>new Date(x.replace(/^(ended|ending)\s+/,''))).filter((d:Date)=>!Number.isNaN(d.valueOf())).map((d:Date)=>d.toISOString().slice(0,10));
 // Some releases identify quarter/year rather than a literal period-end date.
 const anchors=(company.facts['us-gaap'].NetIncomeLoss?.units.USD || []).filter((r:any)=>r.accn===filing.accession && r.end===filing.end);
 const anchor=anchors[0];
 const quarterWords:Record<string,string>={Q1:'first',Q2:'second',Q3:'third',Q4:'fourth'};
 const title=release.text.slice(0,4000).toLowerCase().replace(/[-–]/g,' ');
 const titlePattern=anchor && quarterWords[anchor.fp] ? new RegExp(`(?:${anchor.fp.toLowerCase()}|${quarterWords[anchor.fp]}\\s+quarter)\\s+${anchor.fy}`) : null;
 const titleMatchesFiscal=titlePattern?.test(title) || false;
 if (!explicitEnds.includes(filing.end) && !titleMatchesFiscal) throw new Error(`${ticker}: release period not established; manual review needed`);
 const packet = {schema_version:'2',ticker,company_name:submissions.name,source_cutoff:cutoff,filing,period_alignment_method:explicitEnds.includes(filing.end)?'explicit_release_end_date':'release_quarter_year_joined_to_financial_filing',release_filing_date:manifest.candidate_filing_date,release_accession:manifest.accession,sources:manifest.sources.map((s:any,i:number)=>({...s,id:`${ticker}:${['submissions','index','release','companyfacts'][i]}`})),release,...buildFacts(ticker,company,filing,cutoff),limitations:[...(ticker==='JPM'?['Bank operating cash flow includes balance-sheet activity; it is not a simple payout-sustainability proxy.']:[]),'This packet does not establish events after the source cutoff.','Two issuer-provided formats are consistency evidence, not independent corroboration.']};
 await writeFile(new URL('packet.json',dir),JSON.stringify(packet,null,2));
 console.log(JSON.stringify({ticker,period:filing.end,release_characters:release.text.length,paragraphs:release.paragraphs.length,comparisons:packet.comparisons.map(c=>({metric:c.metric,display:c.display})),unavailable:packet.unavailable}));
}
