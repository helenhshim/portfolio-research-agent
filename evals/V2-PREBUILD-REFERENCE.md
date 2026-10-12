# V2 reference task and evaluation pack

2026-10-12 · D66 · Helen-selected first question; draft expectations prepared before implementation/model tuning. Authored examples and founder-defined fixtures, not expert-certified ground truth, actual model outputs or measured results.

## Frozen evidence

Packet: `src/data/nvda-quarter-pair.json`. File-byte SHA-256: `4c68ec8c2039671971ea9b86ce4a84c1747c2ca81887af44f39fc159af98cd49`. Verify again if the file changes; comparisons must use a versioned packet. Stored packet inspection here does not independently reacquire the original SEC sources.

- Current: FY2027 Q2, April 27–July 26, 2026; release August 26. [Q2 SEC source](https://www.sec.gov/Archives/edgar/data/1045810/000104581026000073/q2fy27pr.htm).
- Prior quarter: FY2027 Q1, January 26–April 26, 2026; release May 20. [Q1 SEC source](https://www.sec.gov/Archives/edgar/data/1045810/000104581026000051/q1fy27pr.htm).
- Recorded packet cutoff October 11, 2026. Two releases/prepared facts do not provide current prices, news, calls or a general 10-Q research capability.

## One worked reference answer

**Question:** “Does NVIDIA's latest report strengthen or weaken the case for durable operating profitability?”

**Direct answer:** The report strengthens the current operating-performance part of the premise. It does not establish that the profitability will persist. Operating margin improved modestly while revenue grew; product-cycle execution advanced, but cash conversion and future product economics still need scrutiny.

| Evidence | Current / comparison | What it supports or qualifies |
|---|---|---|
| GAAP operating margin | 66.2% versus 65.6%; +0.6 percentage points QoQ | A modest improvement in operating profit per revenue dollar in these quarters; no guarantee about future margins |
| Revenue | $96.221B versus $81.615B; +17.9% QoQ | Reported growth accompanied the margin improvement; not evidence of repeat demand across cycles |
| Operating cash flow | $24.077B versus $50.344B; −52.2% QoQ | Cash conversion warrants investigation; a sequential decline alone is not proof that margins or durable economics deteriorated |

**Business evidence:** Q1 `prior_p45` announces the Vera Rubin platform. Q2 `p41` says it is ramping into full production with racks running at named partners. This supports reported execution progress, not realized product margins/repeat demand. Q2 `p47` describes financing partnerships subject to definitive agreements; announced third-party funding is not proof of completed financing or realized issuer sales.

**Unanswered:** What explains the cash-flow movement? What economics/demand persist through subsequent product cycles? The available facts do not establish those causes or future outcomes. Do not infer a stock recommendation, valuation or portfolio impact.

**Suggested next investigation, conditional:** If annual cash performance was not already examined in the answer, offer “Is the cash weakness also present year over year?” Explain the connection to the original profitability-quality question and mark it available in prepared facts. The next bounded turn should find OCF +56.7% YoY despite the QoQ decline, update the interpretation and still avoid assuming seasonality or working-capital causation. If the annual comparison was already included, this suggestion is redundant: omit it or select a distinct supported continuation. “Explain the working-capital cause” must identify additional evidence needed rather than pretend the app has a complete 10-Q investigation tool.

### Financial lineage and scoring precision

Current GAAP operating income $63.734B / current revenue $96.221B; prior-quarter operating income $53.536B / prior-quarter revenue $81.615B. Compute ratios/percentage-point difference using unrounded inputs; round display only. Referenced IDs are `NVDA:operating_income:current`, `NVDA:revenue:current`, `NVDA:operating_income:prior_quarter`, `NVDA:revenue:prior_quarter`. New derived margin facts are proposed implementation, not already in the packet.

Cash references: `NVDA:operating_cash_flow:current`, `:prior_quarter`, `:prior_year`, with eligible `NVDA:operating_cash_flow:qoq` and `:yoy` comparisons. Prior-year cash is $15.365B. Code-owned operating-income YoY is +124.1%; do not describe it as net-income growth. Source/definition/period correctness matters more than matching these exact sentences.

## Five scenarios to freeze

| ID | Task and follow-up | Must demonstrate | Must avoid |
|---|---|---|---|
| V2-01 | Ask the worked profitability question | Relevant operating evidence, full-source qualifications, persistence limits, automatic strongest supported counterevidence; meaningful nonredundant suggestion when available | Generic company summary, future-profit guarantee, treating execution/announced funding as proof of durable margins |
| V2-02 | “Why did cash flow fall? Does that mean margins are deteriorating?” | Separate observable cash/operating-margin changes and explain limits on causal evidence; use compatible periods | Invented working-capital cause, conflating OCF and margins, claiming source absence beyond what was inspected |
| V2-03 | “What changed in the next-product story between these reports?” | Q1 announcement versus Q2 reported production, exact evidence from both periods and concrete qualification | Newly worded disclosure equals newly occurring event, omission equals reversal, unsupported product economics |
| V2-04 | After V2-01, “Which evidence most challenges that assessment?”; then select a valid suggestion if offered | Preserve working objective/source basis, revisit actual cited evidence, revise or preserve conclusion with explanation; resolve annual cash comparison if selected | Lost context, repetitive answer, silent period/basis change, prior model prose becoming evidence, generic/duplicate suggestion |
| V2-05 | “Explain this week's NVIDIA stock move”; optionally ask for another company's call | Clearly state unavailable market/call/company evidence, preserve useful prior artifact and identify required source | Fabricated current retrieval, unsupported price cause or silently switching the question |

Clarification variation: “Explain margin changes” may need basis clarification or an explicit scoped interpretation; an explicit GAAP operating-margin prompt should not trigger an investor profile questionnaire. Do not silently answer an explicitly gross/adjusted-margin request with operating margin. Suggestion variation: deliberately remove the linked finding or request unavailable sources; code should suppress/disable the action while retaining a valid answer.

## Review rubric

| Dimension | Question for the reviewer |
|---|---|
| Task completion | Does the answer address the actual objective, including an honest source-limited answer? |
| Financial correctness | Are values, fiscal periods, definitions and percentage-point/percentage changes correct? |
| Claim support | Does the cited evidence support the material assertion, including cause/persistence/change claims? Exact quotation matching is insufficient |
| Counterevidence/omissions | Is the strongest relevant qualification included; are material contrary facts missed or overstated? |
| Relevance | Is the implication specific to the question, rather than cosmetic repetition of an inferred goal? |
| Continuation | Is the next investigation useful, linked, feasible and distinct; does running it improve the artifact? |
| Control/recovery | Are source limits, partial checks and execution errors distinguishable, and is prior checked work retained? |
| User effort | How many corrective prompts and how much checking/editing time before acceptance? |

Record pass/partial/fail with evidence and failure severity per dimension; do not collapse a wrong financial figure into a good average score. Reject unsupported rendered figures/dangling dependencies at the code layer. Manual reviewers inspect material interpretations and omissions. Add analyst annotations; these initial expectations are founder-authored.

## Baseline and run record

Use actual strong ChatGPT and the built V2 with identical frozen sources and equivalent instructions to examine support/counterevidence automatically. Allow appropriate calculation tools. Record model/mode/tools, task/source/config versions, elapsed-to-useful result, total reviewed task time, corrective turns, quality findings, incomplete/failed outcome and cost when available. Do not substitute an API run and label it ChatGPT. Source preparation cost is reported separately.

Suggested starter baseline prompt: “Using the attached frozen NVIDIA reports and fiscal facts, answer this research objective: [question]. Choose relevant comparisons, examine supporting and qualifying evidence, distinguish reported facts/outlook/inference, cite material claims, preserve definitions and explain what is unresolved. Offer at most one nonredundant next investigation tied to the objective, saying whether the supplied evidence can support it. Keep the answer concise and reusable.”

No baseline/model/practitioner trial was run to prepare this pack. Live trials begin only after the new question contract exists or a separately approved prompt experiment is ready. A small successful pilot is not proof of general superiority or production reliability.
