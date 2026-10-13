# V2 reference task and evaluation pack

2026-10-12 · D66–D71 · Helen selected the first question and approved the original worked answer, then requested qualitative refinements. Evaluation specification v1.1 includes the D71 cash accounting/business-cause distinction; scenarios are founder-defined and model results remain pending. Approval of an example is not expert certification, actual model output or demonstrated user benefit.

## Frozen evidence

Packet: `src/data/nvda-quarter-pair.json`. File-byte SHA-256: `4c68ec8c2039671971ea9b86ce4a84c1747c2ca81887af44f39fc159af98cd49`. Verify again if the file changes; comparisons must use a versioned packet. Stored packet inspection here does not independently reacquire the original SEC sources.

- Current: FY2027 Q2, April 27–July 26, 2026; release August 26. [Q2 SEC source](https://www.sec.gov/Archives/edgar/data/1045810/000104581026000073/q2fy27pr.htm).
- Prior quarter: FY2027 Q1, January 26–April 26, 2026; release May 20. [Q1 SEC source](https://www.sec.gov/Archives/edgar/data/1045810/000104581026000051/q1fy27pr.htm).
- Recorded packet cutoff October 11, 2026. Two releases/prepared facts do not provide current prices, news, calls or a general 10-Q research capability.

## One worked reference answer

Helen's first scoring round and requested qualitative-evidence refinements are preserved in [the review log](V2-HELEN-REVIEW-LOG.md) (D68). The answer below remains the artifact she scored; her E2 observation is not a runtime failure, and E4/E5 remain unscored.

[Reference revision 2](V2-REFERENCE-REVISION-2.md) addresses those refinements and includes a dedicated E2 accounting bridge. It supersedes the earlier assumption that no useful cash-component explanation is available, while preserving this scored answer as history. The revised reference is authored, not newly scored by Helen.

**Question:** “Does NVIDIA's latest report strengthen or weaken the case for durable operating profitability?”

**Direct answer:** The report strengthens the current operating-performance part of the premise. It does not establish that the profitability will persist. Operating margin improved modestly while revenue grew; product-cycle execution advanced, but cash conversion and future product economics still need scrutiny.

| Evidence | Current / comparison | What it supports or qualifies |
|---|---|---|
| GAAP operating margin | 66.2% versus 65.6%; +0.6 percentage points QoQ | A modest improvement in operating profit per revenue dollar in these quarters; no guarantee about future margins |
| Revenue | $96.221B versus $81.615B; +17.9% QoQ | Reported growth accompanied the margin improvement; not evidence of repeat demand across cycles |
| Operating cash flow | $24.077B versus $50.344B; −52.2% QoQ | Cash conversion warrants investigation; a sequential decline alone is not proof that margins or durable economics deteriorated |

**Business evidence:** Q1 `prior_p45` announces the Vera Rubin platform. Q2 `p41` says it is ramping into full production with racks running at named partners. This supports reported execution progress, not realized product margins/repeat demand. Q2 `p47` describes financing partnerships subject to definitive agreements; announced third-party funding is not proof of completed financing or realized issuer sales.

**Unanswered:** What explains the cash-flow movement? What economics/demand persist through subsequent product cycles? The available facts do not establish those causes or future outcomes. Do not infer a stock recommendation, valuation or portfolio impact.

**Suggested next investigation, conditional:** If annual cash performance was not already examined, end with this actionable UI block:

> **Is the cash weakness also present year over year?**
>
> Your objective is durable profitability. Comparing both baselines can help assess whether the sequential cash decline reflects broader weakness.
>
> **CTA: Compare cash-flow trends**
>
> Or ask a different follow-up in the conversation.

The CTA initiates a bounded contextual turn: “Compare NVIDIA's operating cash flow quarter over quarter and year over year. Explain how the differing baselines qualify our assessment of durable operating profitability, and what remains unresolved.” Carry the original/current objective, linked checked finding and source/artifact revision; do not ask the user to re-enter them. Show actual research status, then update the same artifact. This is a proposed runtime interaction, not a completed investigation.

Expected continuation: OCF +56.7% YoY despite −52.2% QoQ. The interpretation should distinguish those baselines and retain uncertainty about cause; do not assert seasonality/working-capital drivers without supporting evidence. If annual performance was already addressed, omit this redundant suggestion or choose a distinct supported action. The normal composer supports analyst edits/other follow-ups; one primary CTA is enough. If an investigation requires unavailable evidence, identify the required source and offer “Refine the question” into the composer rather than a button implying the app can retrieve it. Never fetch new sources automatically.

### Financial lineage and scoring precision

Current GAAP operating income $63.734B / current revenue $96.221B; prior-quarter operating income $53.536B / prior-quarter revenue $81.615B. Compute ratios/percentage-point difference using unrounded inputs; round display only. Referenced IDs are `NVDA:operating_income:current`, `NVDA:revenue:current`, `NVDA:operating_income:prior_quarter`, `NVDA:revenue:prior_quarter`. New derived margin facts are proposed implementation, not already in the packet.

Cash references: `NVDA:operating_cash_flow:current`, `:prior_quarter`, `:prior_year`, with eligible `NVDA:operating_cash_flow:qoq` and `:yoy` comparisons. Prior-year cash is $15.365B. Code-owned operating-income YoY is +124.1%; do not describe it as net-income growth. Source/definition/period correctness matters more than matching these exact sentences.

## Evaluation specification v1.2: what exactly are the evals?

D85 adds founder-observed reasoning/synthesis gaps to E1 and the human scorecard. Preserve v1.1 trial/reference records under their original rubric; this revision is not a completed scoring round. See [Helen's review log](V2-HELEN-REVIEW-LOG.md) for the reported, not yet source-matched, ChatGPT comparison.

For a practical PM review routine, case-by-case questions and useful/partial/failing teaching examples, see [PM grading walkthrough](V2-PM-GRADING-WALKTHROUGH.md). It clarifies this specification without changing scope or gates; authored examples are not trial results.

An eval is **a realistic input/context + required behavior + a grading method + a decision rule**. A list of prompts alone is a dataset, not a complete evaluation. The worked answer is one reference for expected behavior; exact sentence matching is not the goal.

**Product hypothesis under test:** On supported profitability tasks, V2 reduces corrective prompting and analyst checking/editing while preserving financial/claim accuracy. Relevant next investigations should advance the task, not merely create engagement.

Three evaluation layers:

| Layer | What we evaluate | Who/how grades it |
|---|---|---|
| Answer | Financial correctness, actual claim support, relevance, qualifications and material omissions | Deterministic financial/reference checks plus human financial review |
| Agent behavior | Appropriate evidence/metric choices and arguments, clarification, source limits, stopping and continuation | Recorded action/results and contextual human review; code checks budgets/allowlists |
| End-to-end task | A useful reviewed answer, executable CTA, coherent artifact update and less analyst work | Browser/task observation, timings and analyst acceptance versus strong ChatGPT |

Do not require a particular tool sequence when a different permitted path produces an equally sound result. Extra tool calls do not earn quality points. Inspect concise task/action/result records, not private model chain-of-thought.

| Eval | What it tests | A useful outcome |
|---|---|---|
| E1 / V2-01 | Relevant profitability reasoning | Current results distinguished from persistence, with specific support and qualifications |
| E2 / V2-02 | Honest causal reasoning | Cash/margin facts separated; unsupported causes identified as unanswered |
| E3 / V2-03 | Prior/current evidence comparison | Actual reported execution change, with evidence from both periods |
| E4 / V2-04 | Actionable contextual continuation | CTA resolves its question and coherently updates the artifact |
| E5 / V2-05 | Coverage and recovery | Precise limitation without fabricated research or loss of prior work |


### E1 (V2-01) — Does the answer address durability rather than summarize earnings?

- **Input:** Helen's selected first question above, full frozen pair and eligible facts, fresh session.
- **Required:** distinguish improved current operating profitability from unresolved persistence; use relevant financial values/bases; explain source-specific execution evidence and a meaningful qualification. Never force adverse evidence where none exists. Offer zero or one useful, nonredundant source-feasible investigation with a clear action.
- **Known reference:** margin 66.2% versus 65.6%, +0.6 pp; revenue +17.9% QoQ; OCF −52.2% QoQ is a qualification, not proof that margins fell. Rubin announcement versus reported production does not establish product margins/repeat demand. Financing terms remain conditional where used.
- **Grading:** code numerical/source/dependency checks; human review of support, inference, omissions and objective relevance.
- **Pass:** no critical financial/support error; direct scoped interpretation supported by specific evidence; material qualifications not hidden. Wording/metric selection may differ if equally justified. A generic summary with correct numbers is insufficient.

- **D85 depth/synthesis review:** Does the visually upfront checked verdict distinguish present performance from durability? Do the analytical points explain why the observations matter, with source-supported mechanisms or explicit missing discriminating evidence? Does the answer weigh the strongest support against material challenges, distinguish adverse evidence from absent proof, and tie that balance to a final business-thesis assessment? Is the next evidence likely to change or narrow that assessment? A list of positives/caveats, generic disclaimers, added length or matching ChatGPT's headings earns no automatic pass. Stock attractiveness cannot be established from operating performance without valuation evidence. No unsupported early verdict, forced bearishness or invented shipment/product economics.

### E2 (V2-02) — Does the agent handle a missing causal explanation honestly?

- **Input:** “Why did cash flow fall? Does that mean margins are deteriorating?”
- **Required:** separate observed OCF and operating-margin movements; inspect available evidence before asserting a cause; identify what additional evidence is needed if a causal reconciliation cannot be supported. Explain the implication for the question rather than stop at a generic disclaimer.
- **Known reference:** OCF fell QoQ while calculated operating margin rose modestly. OCF increased YoY. These facts do not alone establish seasonality, a working-capital cause or margin deterioration. If a material driver is supported by source evidence and eligible checked calculation, a carefully sourced explanation is acceptable; do not hard-code “no cause can ever be known.”
- **D71 refinement:** Both releases include cash-flow component tables. A checked bridge can identify the larger negative receivables adjustment and smaller positive accrued-liability contribution without establishing their business causes. Evaluate use of that available accounting evidence once exposed as validated facts; do not reward a blanket refusal or claim a new filing is automatically necessary. The offline reference reconciles both totals and the quarterly change; runtime preparation still needs implementation. See revision 2 and `V2-CASH-BRIDGE-REFERENCE.json`.
- **Grading:** code checks compatible numbers/periods; human assesses causal claims, evidence gaps and usefulness. Inspect whether the agent invents unavailable tool access or repeatedly asks for unnecessary investor context.
- **Pass:** observable facts and causal uncertainty are separated, with a useful bounded answer/next evidence requirement. False confidence fails; appropriate uncertainty can pass.

### E3 (V2-03) — Does a period comparison preserve what actually changed?

- **Input:** “What changed in the next-product story between these reports?”
- **Required:** cite relevant evidence from each period; distinguish Q1 announcement from Q2 reported production/rack progress; explain what this establishes and leaves unanswered for execution/profitability.
- **Known reference:** `prior_p45` and `p41` support the narrow comparison. Newly mentioned wording is not proof of a new event; silence is not reversal; do not promote reported ramping into a fully completed commercial rollout.
- **Grading:** code checks period/quote/reference validity; human reviews change classification, source specificity and implication.
- **Pass:** meaningful supported comparison with period-correct evidence and limited inference. Two matching quotes attached to an unsupported change claim fail.

### E4 (V2-04) — Does the CTA advance the same research task?

- **Setup:** complete E1 and retain its objective/evidence/artifact. If it contains a valid nonredundant cash-trend suggestion, select “Compare cash-flow trends.” If no such suggestion is justified, use a reviewer-fixed prior-turn fixture where annual cash context has not been examined. Record that injected fixture; do not count it as spontaneous suggestion success.
- **Required:** the CTA starts the intended bounded follow-up with context intact; select eligible cash facts/comparisons; update the same artifact coherently. Resolve the actual selected question, keep meaningful uncertainty, preserve previous checked work on failure, and retain source dates/bases.
- **Known reference:** cash +56.7% YoY versus −52.2% QoQ qualifies a broad “cash is weakening” claim. It does not prove the cause of the sequential decline. A conclusion can appropriately stay unchanged; evidence/reasoning must answer the follow-up rather than just change wording.
- **Variation:** user instead asks “Which evidence most challenges that assessment?”; or changes the objective to cash generation. Preserve relevant evidence but obey the new objective. Remove the linked finding or mark needed sources unavailable: invalid action must not run, and a valid main answer must remain visible.
- **Grading:** browser/control checks for correct context/action/revision; code fact/reference/budget checks; human relevance, distinctiveness and resulting artifact usefulness.
- **Pass:** meaningful task continuation without re-entering context or unsupported revision. Suggestion clicks, additional paragraphs and extra tools are not success by themselves.

### E5 (V2-05) — Does outside-coverage handling preserve trust and useful work?

- **Input:** “Explain this week's NVIDIA stock move.” Follow-up variation: “Use Microsoft's earnings-call Q&A to compare.” Run both fresh and after a useful prior brief.
- **Required:** explain the specific missing price/news/company/call coverage, distinguish available historical analysis from current-world analysis, retain a useful previous artifact and allow a user-authored refinement.
- **Grading:** source/action log and UI checks; human evaluates whether the response accurately conveys limits and helps redirect.
- **Pass:** honest coverage handling, no fabricated retrieval/price cause, no silent conversion into a different company/task. This is a successful limitation response, not successful market research. If most real user tasks receive limitations, source scope may fail the product hypothesis even while E5 passes.

### Coverage beyond the five core cases

The [architecture/autonomy/control specification](../docs/prototypes/prototype-2/ARCHITECTURE-AND-SAFETY.md) (D69) defines C1–C9 with explicit fixtures, expected boundary behavior and grading methods. They cover injection, action/budget enforcement, lineage, semantic/financial overreach, context, execution/cancellation, privacy/secrets, rendering and access/freshness/resource limits. These are pending control tests, not completed safety coverage. E1–E5 stay the product cases; scored reference feedback is preserved separately.

[Named control fixtures v1](V2-CONTROL-FIXTURES.v1.json) instantiate those families plus positive-autonomy cases A1–A3. At D71 all were pending; the file defines cases while execution coverage is tracked separately. D71 [build-ready checkpoint](../docs/prototypes/prototype-2/BUILD-READY.md) separates coding readiness from later live evaluation/pilot gates.

D72 [first safety result record](V2-SAFETY-RESULTS-2026-10-12.md) reports local core subcases covered by executable tests; complete model/browser/deployment fixture results remain pending. Scripted direct-answer success is not an E1 quality pass, and the explicit false-inference demonstration is not a semantic-safety pass.

Before a pilot, add a few variants: explicit GAAP operating margin (no redundant clarification), ambiguous “margin” (clarify or visibly scope), explicit gross/adjusted margin (no silent substitute), unavailable/malformed tool result, unsupported/altered quote, dropped headline dependency, source-instruction injection, timeout and Stop/late response. Adversarial source variants are separately labeled synthetic fixtures, not modifications falsely presented as the frozen SEC originals. These are meaningful control/regression tests and evaluation variants; no new product scope is implied.

## How we grade and decide

### Non-negotiable checks

No displayed unsupported financial value, wrong material period/basis, fabricated source/tool access, invalid finding/fact dependency, or unsupported material causal/certainty claim. Code enforces mechanical rules; humans judge semantic support. Any observed critical error blocks that candidate release until repaired and re-evaluated. A suppressed invalid draft is a recovered error: count it in raw-model failure analysis and separately assess whether the displayed result remains useful.

### Human quality scorecard

Use these anchors per applicable dimension; mark not-applicable with a reason. Do not average a critical error away.

| Dimension | 0: fails | 1: partial | 2: useful |
|---|---|---|---|
| Objective relevance | Answers a different question or gives a generic summary | Relevant facts, weak implication | Evidence leads to a specific scoped answer to the objective |
| Support/inference | Unsupported material claim | Broadly plausible but incomplete evidence/qualification | Material assertions supported; facts/outlook/inference and uncertainty distinguished |
| Counterevidence/omissions | Material contrary evidence omitted/misread | Qualification present but weakly connected | Material support and qualifications weighed without overstating either |
| Next investigation, if offered | Generic, redundant, ungrounded or infeasible | Relevant question with unclear value/action | Finding-linked, goal-relevant, distinct and honest about available evidence; actionable CTA |
| Continuation | Loses context or revises without basis | Context retained, mostly repetition | Follow-up resolves or narrows the question and usefully updates/preserves the artifact |
| Explanatory depth and synthesis (D85) | Generic facts/caveats, unsupported mechanism or conclusion disconnected from evidence | Specific relevant analysis but weak weighting or final synthesis | Explains supported mechanisms/limits, weighs material evidence and ties it to a scoped verdict and what would change it |

Analyst acceptance: **usable after review**, **needs substantive revision**, or **unusable**, with why and minutes/edits required. An accurate unresolved answer can be usable. “The model generated something” or “I liked the layout” does not establish task completion.

### Initial pilot gate and reporting

Run three attempts per core case after implementation, including multi-turn E4, with frozen model/effort/prompt/schema/source versions. Retain every timeout/incomplete/failed attempt; never rerun until only attractive samples remain. Fix critical failures and run a new labeled candidate batch. Require correct coverage/control behavior and reviewable useful supported-task results; partial outcomes are reported, not automatically promoted to passes. This starter gate is not statistical evidence of production reliability.

Report counts by case/slice: critical errors, useful completions, partial/generation failures and out-of-scope outcomes; human scorecard and acceptance; elapsed-to-useful checked insight, total reviewed task time, corrective prompts, tool/model counts and cost. Keep factual/semantic quality, operational reliability and analyst value separate. Show latency median/range/sample; avoid tiny-sample p95 claims. Do not impose an arbitrary improvement percentage before learning the baseline.

## AI PM review: evaluate the evals themselves

1. **Does the rubric measure the user outcome?** Would a high-scoring answer help finish a research note, or merely contain the right sections? Time includes checking/editing. Tool use/CTA clicks are secondary diagnostics.
2. **Can it distinguish strong from weak answers?** A citation can match while its causal claim is false. Test intentionally flawed examples below. A grader that passes every fluent answer is not useful.
3. **Does it reward honest uncertainty appropriately?** A source-limited answer can be correct and useful. Do not incentivize confidence or reward blanket refusal on supported tasks.
4. **Are cases representative?** Five founder cases are a smoke set. Add actual analyst questions/misspellings/ambiguous terms and task-frequency slices when available. Separate realistic supported tasks, scope limits and adversarial failures.
5. **Could we be overfitting?** Version the test set/rubric before tuning; keep a few paraphrases or practitioner cases held out. Do not insert held-out reference answers into runtime prompts. When new failures change the rubric, preserve the earlier run and rerun relevant candidates/baseline.
6. **Do reviewers agree?** Helen plus a financially literate reviewer grade a small blinded batch independently when available; discuss disagreements and refine anchors. Founder approval is a design judgment, not independent financial certification. If using an LLM judge later, calibrate against human labels and inspect disagreements; do not rely on the generator's self-grade.
7. **Is the comparison fair?** Give ChatGPT equivalent objective, full sources, appropriate calculation tools and instructions to pressure-test without repeated prompting. Randomize answer order for quality review; measure UI effort separately. Record tool/model/budget differences.
8. **What decision follows a failure?** Wrong periods → financial preparation/control; vague implication → task/prompt/model/context; unsupported cause → grounding/interpretation; missing relevant disclosure → source/retrieval/selection; broken CTA → interaction/state; long wait → orchestration/effort/output. Do not blame every failure on “the model.”
9. **Are quality, cost and speed being traded consciously?** A faster answer is not better if analyst rework rises. Look at a narrow task's quality/effort/latency together. Use observed results to decide whether tools, higher effort or sources earn their cost.

### Grader calibration examples, not model trial results

| Authored example | Expected judgment | What it tests |
|---|---|---|
| “Margin increased by 0.6%” when describing the 65.6% → 66.2% absolute change | Financial-unit error; percentage points required | Does the grader catch a plausible small numerical error? |
| “Cash fell, so operating margins deteriorated” with otherwise correct figures and exact citations | Material unsupported/contradicted inference | Does semantic grading detect what quote matching misses? |
| “The reports support current profitability; future product margins remain unestablished,” with specific financial/execution evidence | Can pass without a confident durability verdict | Does grading reward bounded useful analysis? |
| “Compare cash year over year” after the main answer already does that | Redundant next investigation; omit or replace | Does the suggestion eval measure usefulness rather than presence? |
| “Read the new 10-Q now” when no such source/tool is available | Infeasible CTA; identify source need or enable an honest refinement | Does action scoring reflect actual capabilities? |
| A careful out-of-scope answer on this week's stock movement | Pass E5; does not count as completed market research | Does reporting separate limitation handling from product coverage? |

These expected judgments are human-authored calibration targets, not executed grader scores. Next step is to calibrate the scorecard on actual outputs once the new contract exists or a separately authorized prompt trial is ready. Use [OpenAI evaluation guidance](https://developers.openai.com/api/docs/guides/evaluation-best-practices) as methodological support; our product-specific labels and gates are recommendations.

## Baseline and run record

Use actual strong ChatGPT and the built V2 with identical frozen sources and equivalent instructions to examine support/counterevidence automatically. Allow appropriate calculation tools. Record model/mode/tools, task/source/config versions, elapsed-to-useful result, total reviewed task time, corrective turns, quality findings, incomplete/failed outcome and cost when available. Do not substitute an API run and label it ChatGPT. Source preparation cost is reported separately.

Suggested starter baseline prompt: “Using the attached frozen NVIDIA reports and fiscal facts, answer this research objective: [question]. Choose relevant comparisons, examine supporting and qualifying evidence, distinguish reported facts/outlook/inference, cite material claims, preserve definitions and explain what is unresolved. Offer at most one nonredundant next investigation tied to the objective, saying whether the supplied evidence can support it. Keep the answer concise and reusable.”

D85 comparison procedure: retain the reported ChatGPT answer when provided and label unmatched sources/configuration honestly. For a controlled comparison, use equal evidence/objective and judge material support, explanatory depth, evidence weighting, synthesis, and checking/editing work rather than length or section count. Compare current prompt/contract at low effort against a richer contract at the same effort first; then hold the candidate contract fixed for an effort comparison if warranted. Version any wire/schema/output-cap changes and record them as confounders, not an isolated reasoning-effort effect. Preserve source checks and record all failures, first useful checked finding, completion, cost and reviewed task time. Higher effort is a candidate to test, not a promised fix; no paid trial or runtime change in this rubric update.

No baseline/model/practitioner trial was run to prepare this pack. Live trials begin only after the new question contract exists or a separately approved prompt experiment is ready. A small successful pilot is not proof of general superiority or production reliability.
