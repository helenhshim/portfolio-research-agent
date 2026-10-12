# Reasoning and context-instruction comparison

Frozen artifact directory: .research-runs/reasoning-1a417594-a845-445b-9cb4-598fc5158509/. Packet hash and inputs recorded in experiment.json. Same NVDA source cutoff, growth goal, long holding period, medium risk and profitable-growth rationale. Same Sol model, structured schema, numerical-prose verifier, 12,000 output-token ceiling and 180-second per-call timeout. One run per configuration; assistant review only, no blind practitioner review or ChatGPT-product comparison.

| Variant | Model time | Input tokens | Output tokens including reasoning | Reasoning tokens | Estimated standard API cost | Mechanical drops |
|---|---:|---:|---:|---:|---:|---:|
| Low / original instructions | 36.08s | 24,418 | 2,262 | 0 | $0.0837 | 0 |
| High / original instructions | 104.99s | 24,422 | 5,876 | 3,329 | $0.1198 | 0 |
| High / context-v1 instructions | 103.77s | 25,406 | 6,137 | 3,411 | $0.1249 | 0 |
| Low planner / high analyzer / context-v1 | 122.46s | 25,064 | 6,908 | 4,142 | $0.1281 | 0 |

Model time sums planner/analyzer request latency, excluding user review. Cost estimate uses actual trace token counts and current standard short-context Sol rates: uncached input $2/m, cache write $2.50/m, cached read $0.10/m, output $10/m. Reasoning tokens are a subset of output, not added twice. Invoice/service-tier charges not independently confirmed. Reference: https://developers.openai.com/api/docs/pricing .

## Observed differences

Low/original: two findings, two generic investigations (profitability, cash conversion), context-aware wording but limited qualitative connection. Describes growth and asks whether it persists. Notices reconciliation items but lacks specific explanation for why the question-specific evidence is inadequate.

High/original: similar questions and conclusion; explicitly identifies missing fiscal-column headings in returned cash rows. More careful evidence-gap diagnosis, not substantially more useful long-term business interpretation. High effort alone does not establish materially better takeaways in this case.

High/context-v1: selects a question about repeat customer demand and profitability across product cycles; retrieves the actual partner-rack deployment statement (p41) and management demand commentary (p10). Adds a narrative finding with exact evidence, distinguishes production/deployment from repeat purchases, and uses that current milestone as the baseline for a concrete future watch question. Explicitly separates incomplete lookup from absent filing disclosure. All five inputs are supplied; risk is referenced in watch metadata but material risk-specific sensitivity has not been demonstrated.

Actual output excerpt: “Do existing customer deployments lead to repeat purchases while GAAP operating profitability persists through product transitions?” Strengthens if existing customers expand or repeat deployments with persistent operating profitability; weakens if disclosed cancellations or adoption delays accompany weakening operating profitability. These are conditional future research criteria, not claims such events occurred.

The high/context cash finding compares operating-cash-flow growth with net-income growth. Both code comparisons support the direction, but the current verifier does not itself validate every relational statement. Exact source quotes do not establish causal interpretation. No variant proves long-term suitability or adds valuation.

## Attribution limits

Low versus high/original changes effort, including planning. Planner search terms/returned evidence may differ. High/original versus high/context also changes instructions and selected evidence. Therefore, observed qualitative improvement supports the context-task design but cannot be attributed to high effort alone. No repeated trials or multiple issuers; no formal numeric quality score invented.

## Next architecture choice

Retain higher analysis effort as a quality candidate, with explicit context-v1 task instructions. The low-planner/high-analyzer variant also produced deployment-to-repeat-demand reasoning and more explicit risk-related cash-conversion emphasis, but took 122.46s: lower planner effort did not reduce total latency in this sample. Improve section/table context before adding semantic search or further agent calls; the full release already contains headings that current question-specific lookup omits. Keep old low/original configuration accessible as a comparison baseline.

## Final review and recommendation

All four completed, zero mechanical drops. Context-specific instructions with high analysis are promising; effort alone is not the established cause of the qualitative improvement. Retain explicit comparison configurations and low/original caller baseline while fixing source context, then choose production defaults from evaluated latency/quality rather than this single example. The hybrid variant used fewer planning tokens but more analysis tokens and was slower overall; no proven latency advantage. Existing engine APIs expose the settings for trials, not a deployed UI control.

Hybrid watch excerpt: “Do partner deployments lead to repeat orders while GAAP operating profitability persists across product cycles?” Its interpretation explicitly declines to attribute current profits to Rubin. One evidence attachment remains incomplete: the cash finding includes the issuer free-cash-flow definition but its attached quotations are table labels, not the definition; the full source contains the definition, but the citation bundle should include it. This passed mechanical checks and illustrates why zero drops does not establish complete evidence support.

Technical validation: TypeScript and 26 tests passed, including a mock API test proving low/high settings and context instructions reach the correct stages while source/math boundaries remain intact. Further source/context changes will require targeted verification.
