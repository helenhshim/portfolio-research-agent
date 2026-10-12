# Recommended fast V2 launch scope

2026-10-12 · D64–D67 · Helen approved the initial D64 launch scope. D66 records the agreed narrow guided-next-investigation refinement and Helen-selected first test. User demand and advantage over ChatGPT remain to be validated.

## One-sentence product

An analyst states a NVIDIA profitability question or thesis; the workflow selects the relevant financial tests, examines supporting and qualifying evidence, and produces a checked, revisable thesis brief without requiring the analyst to prompt each research step.

**First user/job:** an equity analyst pressure-testing a company profitability premise after earnings. Example: “Is NVIDIA's profitability becoming more durable, or does the latest report weaken that view?” No investor profile questionnaire. Do not force the user's question into the old rationale enums.

**Hypothesis:** automatic financial comparison and counterevidence selection, with a reviewable evidence record, reduce corrective prompting and checking effort on this specific task. This is a narrow workflow benefit, not exclusive access to public data or superior general reasoning.

## Ship in the first release

| Capability | Smallest implementation boundary |
|---|---|
| Open question or thesis | One text composer; two optional examples. Infer a working question, expose it for correction, ask only when an ambiguity materially changes the answer |
| Real bounded research decisions | One researcher/controller chooses eligible metric comparisons and relevant evidence actions; actual tool results inform synthesis. Do not fake tool activity or require a planner call when evidence/calculations are already available |
| Automatic pressure test | Every applicable answer includes the strongest supported qualification/counterevidence, an alternative explanation where evidence allows, and the evidence needed to distinguish it. No invented challenge just to fill a section |
| Checked financial output | Reuse eligible fiscal facts/comparisons. Add GAAP operating margin and percentage-point change in code with numerator/denominator lineage; no arbitrary formulas, model arithmetic or silent GAAP/adjusted switch |
| Thread plus concise artifact | Working thesis/question, current assessment, one to three selected financial rows, supporting/qualifying passages and one useful unresolved/watch question. Inspectable source/math details; no forced comprehensive report |
| Contextual continuation | A user challenge updates or qualifies the same artifact; preserve the previous checked result on failure. Active-session context only, no refresh recovery or long-term memory promise |
| Honest execution/control | Actual preparation/evidence/calculation/checking state, Stop, explicit partial/unsupported/failure outcome and user-initiated retry. No raw unverified claim streaming or automatic paid repair |

The analyst should not need separate prompts for comparing periods, looking for counterevidence, checking numerical bases or specifying the evidence needed next. They retain control over the question and interpretation. A source-limited unresolved assessment can be useful; a failed output check must not masquerade as absent company evidence.

## Evidence and release boundary

NVIDIA only; existing frozen official SEC FY2027 Q2/Q1 earnings releases and prepared structured facts. Full approved reports remain accessible, not short keyword matches alone. No new data login, arbitrary URL retrieval, new issuer, live refresh or licensed transcript. Sources are dated; generation time does not make them current.

Use the existing Next.js/Vercel project with a separate protected V2 preview. Retain Prototype 1 tag/URL as baseline. Reuse source preparation, provider, cancellation, calculation lineage and verifier primitives. Replace the preset/rationale-only contracts and single-result UI; these are real implementation work. Keep access/secret controls; no public-access expansion implied.

## Minimal architecture and reasoning

One agent/controller with direct provider calls and server-owned tools, not a multi-agent framework. Input contains the question, available source/metric scope and bounded session context. Keep both full reports available for interpretation; prior model prose is context, never evidence.

Proposed tool capabilities: inspect approved report evidence and calculate/select eligible financial comparisons. A call can request a compatible period pair and metric set; code returns source-backed values and rejects unavailable/ambiguous bases. Model judgment chooses relevance, competing interpretations and which evidence is decisive. The verification step is mandatory application code, not an optional tool the model can skip.

Initial work budget recommendation: no more than one tool round, up to two tool executions in that round and two provider requests per user turn. A follow-up with sufficient evidence can finish without another tool round. Independent reads/calculations can run together. The limit forces a concise answer or explicit missing-evidence stop, not silent truncation. No additional critic agent or automatic iteration loop.

Use a deliberate evidence synthesis to distinguish reported outcome versus persistence, accounting change versus causal explanation, and missing evidence versus adverse evidence. Do not spend a separate model call on every subquestion or choose maximum reasoning effort everywhere. Benchmark the new compact task on the existing provider/settings; the previous fast candidate is evidence to reuse, not proof of V2 quality or speed. More complex reasoning is judged by better supported conclusions and fewer omissions, not hidden reasoning length.

Extra sequential model requests add round-trip latency. Combining steps when appropriate and measuring the tradeoff is recommended in [OpenAI latency guidance](https://developers.openai.com/api/docs/guides/latency-optimization). This budget is a proposal, not a guaranteed sub-minute response.

## Defer to the next experiment

Q1-only baseline → Q2 historical replay, durable thesis library, automatic next-filing checks, runtime source refresh, full 10-Q investigation, prices/news, peers/other companies, uploads, forecasts, progressive checked patches, elaborate trace UI and ChatGPT/MCP embedding. These are valuable candidates but not required to test the first task. Missing cash drivers or product margins remain explicitly unresolved until new approved evidence is supplied.

Design financial/evidence functions so an MCP adapter can expose them later. Do not build and maintain two product surfaces before establishing the workflow benefit.

## Build sequence and acceptance

1. Freeze five supported/limitation tasks and source expectations; use the approved public-company/active-session scope and record any consequential expansion separately.
2. Implement generic question/claim/revision contracts and margin facts; retain reference/number/source regressions. Remove forced profile dependencies without weakening checks.
3. Implement bounded selected evidence/calculation actions, question-specific synthesis and automatic counterevidence. Output stays compact; keep invalid/missing references out of the checked artifact.
4. Wire the selected Research workspace concept to genuine status, contextual follow-up, artifact revisions and Stop. No schema/planner internals as product filler.
5. Run meaningful facts/evidence/control checks and actual live question/follow-up trials. Create a separate protected Preview and record its commit/config/source/test outcomes. Tag only after acceptance; no fixed delivery-hour promise before these pass.

Fixture tasks: margin-persistence question; cash-conversion qualification; prior/current reported execution changes; a follow-up challenging a prior finding; an unsupported current-price/other-source request. Repeat supported cases and include failed/incomplete attempts; human-review claim support, periods/definitions and material omissions. Suggested small release gate: three attempts per supported fixture with useful completion or clear evidence-based unresolved result, no dangling references/unsupported rendered quantities and honest failure handling. Small-sample success is not production reliability.

Pilot with two analysts if available, using public questions and no client identity. Compare a strong ChatGPT session using the same sources, suitable calculation tools and equally strong instructions to pressure-test automatically. Measure time to an accepted answer including source checking, corrective prompts, errors/omissions, usefulness of the unresolved question, total latency and cost. Source/engineering preparation effort counts separately; do not penalize ChatGPT for missing our schema. No matched trial has run.

**Go/no-go:** release the narrow prototype after operational/semantic checks. Expand the product only if users complete the research task with less review/prompting effort at comparable or better factual quality. If there is no advantage, revise the workflow or test the specialist backend inside ChatGPT rather than claiming differentiation from appearance.

## Portfolio evidence

Show the transition from founder observations to a narrow task, model/code/tool boundaries, real failure/recovery, a fair ChatGPT comparison and evidence-led scope changes. The prototype tests the product hypothesis; its UI and code alone do not prove it. Helen approved the initial launch scope under D65, resolving the D61 approval checkpoint for that scope. The narrow guided next-investigation refinement is included under D66; it does not authorize new sources or automatic research.

## MVP refinement: one next useful investigation (D65–D66)

Include one optional next investigation generated with the same synthesis response, not a separate recommender call. This turns the existing watch-next question into a goal-linked continuation: the exact finding that triggered it, why it matters to the original objective, the proposed question/action and evidence availability. Return none if nothing material/useful is supported; do not add generic engagement suggestions.

Example: original objective is durable profitability; the checked finding is that cash flow declined while operating profitability improved. Suggest “Compare cash generation with operating profit,” explaining that this separates profitability from cash conversion. The action uses the available report pair and code facts, carries original intent plus the linked finding into a follow-up, and updates the same artifact when the analyst selects it. It does not promise to explain cash drivers not present in the evidence.

Availability is checked against the server-owned source/metric catalog. If the decisive next step requires a 10-Q cash reconciliation, calls, prices or another issuer, label “Needs additional evidence” and identify the source; do not render a runnable investigation that fabricates access. Zero or one action keeps the UI compact and preserves the work budget. The click initiates a new bounded user turn; generating the suggestion does not initiate research.

Evaluate goal linkage, supporting finding validity, distinctiveness from the completed answer, source feasibility and usefulness. Click-through alone is not success; record accepted subsequent work and prompting/review effort. Ignore/remove invalid suggestions without suppressing a valid main answer. Analyst redirection updates the current objective; do not cling to an obsolete inferred goal.

Later: selectively execute one useful adjacent investigation autonomously with explicit source/cost/stop limits; add scheduled/new-report continuation only after source acquisition and persistence are built. Generic suggested questions are replicable in ChatGPT. The intended advantage is a specific, grounded and executable continuation connected to the analyst's objective.

## Before building (D66)

Helen selected “Does NVIDIA's latest report strengthen or weaken the case for durable operating profitability?” as the first test. Review `PREBUILD-CHECKPOINT.md` and the task/rubric in `evals/V2-PREBUILD-REFERENCE.md` before implementation. This planning pass performs no live model or user trial.

## Actionable continuation and evaluation contract (D67)

The worked answer is approved. A supported suggested investigation ends with a specific CTA (example: “Compare cash-flow trends”) that carries original/current intent, linked checked finding and artifact/source version into a bounded turn. It updates the artifact; users can instead edit/ask in the composer. No auto research or new source access. An unavailable investigation identifies evidence needed and can offer “Refine the question.” Assess actual task advance and source feasibility, not click-through. `evals/V2-PREBUILD-REFERENCE.md` now specifies cases, required behavior, code/human graders, critical gates and AI PM review of eval quality.
