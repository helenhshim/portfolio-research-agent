# V2 pre-build product checkpoint

2026-10-12 · D66–D67 · Worked answer approved; CTA and eval specification clarified. Planning only; Helen explicitly asked for next steps before building. Initial D64 scope is approved. Her “great” response accepts the narrow guided-next-investigation direction from D65; autonomous adjacent research remains deferred. No application implementation or live benchmark is performed here.

## Purpose and sequence

Use one short working session to settle the task, inspect a worked answer, freeze evaluation cases, define model/tool/control boundaries, and select the minimum release gate. Do not restart broad discovery or extend the product while trying to launch quickly. Scope approval is distinct from customer validation.

### 1. Anchor the task in a user and trigger

Working hypothesis: an equity analyst has just read earnings and needs a defensible explanation of whether the reported evidence strengthens, qualifies or leaves their operating-profitability premise unresolved, for a research note/discussion. They currently inspect documents, check comparisons and manually pursue counterarguments. This is a founder-defined task to validate, not observed practitioner behavior.

Helen-selected first test: “Does NVIDIA's latest report strengthen or weaken the case for durable operating profitability?” “Latest” means the latest frozen release available to the prototype, not the current market. Helen explicitly selected this question for the first test. It is a founder-selected evaluation task, not a practitioner-supplied real task.

User outcome: reach a reviewable interpretation and a useful next investigation with less prompting/checking. A credible analyst read-back should establish what they would do with the answer and what they would still verify. Use one practitioner task if available; continue prototype development without mislabeling founder/synthetic cases as validation.

### 2. Review one worked answer before tuning prompts

See [reference task and rubric](../../../evals/V2-PREBUILD-REFERENCE.md). Judge whether it answers the objective, includes decisive qualifications, preserves fiscal definitions and makes a next investigation useful. It is an authored source-based example, not a model result or immutable “correct wording.” Prefer requirements/known evidence over exact-text scoring.

Settle the minimal artifact contract: working question; direct assessment; relevant figures; support/qualification evidence; unanswered evidence; zero or one goal-linked next investigation; source dates/check status. No compulsory long report or generic risk section. State what a good unresolved answer looks like. The user is not asked to populate an investment profile.

### 3. Freeze five evaluation scenarios

The reference pack predefines profitability persistence, missing causal cash evidence, prior/current execution changes, contextual correction/follow-up, and unsupported market coverage. Include the suggestion's relevance/availability and suppression when redundant. These scenarios test reasoning, interaction and recovery, not just format.

Keep sources/config stable. Mark new cases or rubric changes after outputs are seen; retain original labels and failed attempts. Manual review covers citation entailment and omitted material evidence. Automated code tests cover numerical bases, source/fact IDs and dependency integrity. Use a strong actual ChatGPT baseline with equivalent instructions and tools; do not manufacture comparison results from an API run or an authored example.

This task-specific evaluation/human-review approach follows [OpenAI evaluation guidance](https://developers.openai.com/api/docs/guides/evaluation-best-practices). No particular hosted evaluation product is required for five cases.

### 4. Define the agent's decisions and user's control

| Area | Required behavior |
|---|---|
| Model judgment | Interpret the objective, choose relevant evidence/eligible comparisons, weigh support and counterevidence, explain uncertainty and select a meaningful next investigation |
| Code guarantees | Source allowlist/version, periods/definitions, calculations, immutable run/context IDs, reference/dependency checks, execution budgets and source-availability gating |
| Tools | Inspect approved full report evidence and select/calculate eligible financial comparisons. Same reports stay available; no fake retrieval or tool calls solely for appearance |
| Clarification | Ask only if the answer materially changes the task/accounting basis. Explicit unsupported coverage must not silently become a different objective. Other work can proceed if independent |
| Continuation | User-selected suggested action starts a new bounded turn with original/current intent and linked finding. User redirection supersedes obsolete intent |
| Stopping | Answer with checked support, state precise missing evidence, or fail honestly when execution/checks prevent an answer. No loop until the answer looks favorable |
| Review | Label source-supported reported facts, management outlook and interpretation. Never label mechanical quote matching as proof of semantic support |

Retain the approved small-controller budget: at most one tool round, two tool executions and two provider requests per turn, with fewer when sufficient. Recommendation generation is part of the answer, not an extra request. Benchmark the existing model/effort options on the new task rather than assuming higher effort is better. Model choice is an empirical quality/latency decision, not a product differentiator.

### 5. Walk through failure states before frontend work

Check question → research → checked answer → suggested investigation → revised artifact, plus ambiguous metric, missing new source, invalid headline references, partial checks, timeout/billing failure and cancellation. Keep checked prior work visible and prevent late events from replacing a newer revision. A removed suggestion must not remove a useful main answer. Outside-coverage actions identify required sources rather than imply they can run.

Use the existing concept to inspect these behaviors; do not add a new design exploration unless the interaction fails the task. Actual brief state is active-session only. Broad personal/client data and cross-session storage remain outside scope. Source dates must stay visible.

### 6. Separate build readiness, pilot readiness and product proof

**Ready to build:** task/output expectations recorded; prepared source versions/metric definitions identified; five fixtures/rubric frozen; tool/failure/suggestion rules clear. Practitioner value and live timing are still hypotheses. Scope already approved; no repeat approval needed within it.

**Ready for protected pilot:** core numerical/reference/control tests pass; repeated live fixture attempts produce a useful checked answer or honest evidence-limited result; material interpretations/omissions reviewed; source dates and cancellation/recovery are correct. Count incomplete/failing trials in reported results. Start with three attempts per supported scenario; small samples do not prove production reliability. The unsupported case should succeed at communicating limits.

**Evidence of product benefit:** analysts need less total prompting/checking/editing to produce an acceptable answer compared with a strong baseline, without more material errors/omissions. Suggestion click rate is not benefit; evaluate whether the continuation materially helps the task. Measure complete browser time, time to useful checked insight, review time, corrective turns, failure rate and cost. Do not gate on activity indicators or JSON success alone.

Latency target stays provisional until matched task trials; document median/range/sample and do not call a tiny sample a p95. Define a finite live-evaluation spend cap before running paid trials; do not read credentials into logs. Reuse existing Preview/access configuration; public paid access is a separate decision. No new external source or publication is implied.

## What is done versus still needed

Completed here: scope/approval record, task hypothesis, exact frozen packet hash, authored reference answer, five fixture expectations, suggestion/failure rules and proposed gates. Not completed: practitioner task validation, actual V2/ChatGPT trials, model/latency/cost choice for the new contract, or application implementation. Helen approved the worked answer under D67 and requested the next-investigation CTA. The reference now defines the evals explicitly. Next calibrate the scorecard against strong/flawed examples, then implement within the approved scope; actual trials remain pending.

## D67 reference review outcome

Helen approves the worked answer and asks for an actionable end to the suggested investigation. Use “Compare cash-flow trends” for the supported example; it initiates the contextual turn and updates the same artifact. The composer remains available for a different question. Missing-source actions offer an honest question refinement, not fabricated retrieval. The interactive concept was updated with a scripted CTA/annual-cash comparison; this is not live V2 research.

“Freeze cases” is now an explicit eval specification: inputs/context, required behavior, graders and decision rules for E1–E5 (stable aliases V2-01–V2-05), with separate answer/agent/task layers, quality anchors and grader-calibration examples. Do not score tool count or clicks as quality. User approval of an example does not replace claim-support review or practitioner evaluation.

## D68 first scoring round

[Helen's review log](../../../evals/V2-HELEN-REVIEW-LOG.md) records E1 2, E2 provisional 0, E3 1 and E4/E5 pending. E2 does not yet have a dedicated reviewed response; this is not a runtime failure. Keep the scored reference intact. Next revise qualitative evidence to explain the prior/current change, execution meaning and future significance criteria, and prepare a dedicated E2 example. Grade E4/E5 workflow behavior after implementation; scripted concept behavior is not model evaluation. These refinements preserve approved source/controller bounds.

## D69 control coverage and architecture

[Architecture, autonomy and C1–C9 control cases](ARCHITECTURE-AND-SAFETY.md) supplements E1–E5 with explicit failure/security acceptance. Controls and full V2 flow remain unimplemented/untested here. Record numeric time/token/spend/resource settings before paid testing; retain source/session scope. Next reference refinement → case calibration → approved vertical-flow build → protected pilot after product/control/semantic gates. No renewed scope approval or framework migration required.
