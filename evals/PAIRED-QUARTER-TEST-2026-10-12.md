# NVDA paired-quarter full-report test

2026-10-12. One real model test with growth/long/medium/profitable_growth inputs. Prototype source/output extension, not deployed UI or proof of target-user benefit.

Current: FY2027 Q2 ended 2026-07-26, released 2026-08-26, SEC release accession 0001045810-26-000073. Prior: FY2027 Q1 ended 2026-04-26, released 2026-05-20, accession 0001045810-26-000051. Prior source fetched with existing identified/rate-limited SEC client (two requests); frozen source hashes and packet recorded in .research-data/NVDA/paired-quarter/. As-of source cutoff retains 2026-10-11; prior retrieval occurred later but the document publication predates the cutoff.

Sources:
- https://www.sec.gov/Archives/edgar/data/1045810/000104581026000073/q2fy27pr.htm
- https://www.sec.gov/Archives/edgar/data/1045810/000104581026000051/q1fy27pr.htm

Artifact: .research-runs/quarter-pair-de83c2c3-cbab-4e22-8536-54902e3312cf/output.json. Rechecked with the final stricter local verifier in reverified.json. Model gpt-6.1-sol, high, context-v1. One full-report call; no keyword lookup or adaptive tool loop. 118.305s, 23,950 input tokens, 6,621 output tokens including 3,624 reasoning tokens. Standard-rate estimated cost ~$0.1261, not verified invoice. Matching both periods increases source scope; this is not a controlled reasoning-effort or latency comparison with earlier runs.

## Actual output

Headline: Earnings strengthened; cash durability remains untested.

Selected rows (all code computed):
- Revenue $96.221B vs $81.615B, +17.9% QoQ.
- GAAP operating income $63.734B vs $53.536B, +19.0% QoQ.
- Operating cash flow $24.077B vs $50.344B, -52.2% QoQ. It remains +56.7% YoY; both baselines matter.

Business evidence:
- Prior release p45 announced Vera Rubin; current release p41 reports a production ramp and running partner racks. Supports a progression in company-reported milestones, not independent validation of delivery, first occurrence, repeat orders or revenue attribution.
- Prior p38/current p34 use the same China Data Center compute outlook exclusion. Correctly classified unchanged planning assumption, not a claim about actual sales or worsening macro conditions.
- Current p47 compute-financing partnerships are subject to definitive agreements; model marks current-only disclosure with no matched prior baseline. Do not relabel this as proven newly occurring event or committed funding.

Watch questions: whether repeat deployments sustain GAAP operating profitability, and whether later cash disclosures explain working-capital effects and sustained cash generation. No market/valuation, macro statistics or guidance numerical display added.

## Review

Base and comparative mechanical checks had zero drops. TypeScript and 29 tests pass, including correct-period comparative quotations, invalid financial selection removal and dependent-content cascades.

Manual source review supports the period comparisons, exact quotations and changed/unchanged/current-only distinctions described above. Important qualifications: a sequential cash-flow decline is a material counterweight, not proof of structural deterioration or long-term unsuitability; quarterly volatility/seasonality and working-capital causes remain unanswered. The model puts it in challenged_parts, so presentation should avoid treating that categorical field as a proven broken thesis. The profit finding also mentions the China assumption but its attached finding-level quotes omit that exact statement; the comparative development provides both exact quotes. Joined rendering should retain that complete evidence chain rather than show only the narrower finding bundle. Passing mechanical checks does not resolve all interpretation/citation completeness issues.

This output is more concrete than the prior latest-report/YoY baseline, but user benefit, broader issuer coverage, source-preserving table objects and production UI still need work. No interviews or external verification are claimed.
