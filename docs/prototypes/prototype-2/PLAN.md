# Prototype 2 iteration plan

Updated: 2026-10-12 · D61 supersedes the advisor-first D60 starting plan; D64 supplies the launch scope, approved by Helen under D65. Guided next-investigation refinement is agreed under D66; first test selected. Current deployed/runtime code remains unchanged.

**User job:** A financial analyst asks a company research question, inspects a source-backed answer and continues investigation without restarting setup. Conversation directs work; artifact is the deliverable.

**Hypothesis:** Open-ended intent and contextual continuation reduce task-expression/refinement effort; a checked artifact reduces review/reuse effort. Progressive results may reduce time to first useful insight, but orchestration can increase total latency. Validate these separately.

## Completed planning

- [Helen's reflection and handoff](REFLECTION-2026-10-12.md).
- [Static V1 audit](V1-AUDIT.md): confirms form-only input/no continuation, real SEC data/live synthesis and actual status; identifies source/metric/state gaps.
- [Product decision memo](V1-V2-PRODUCT-DECISION-MEMO.md): evidence, hypotheses, directional decisions, alternatives, scope and approval questions.
- [Smallest technical plan](TECHNICAL-PLAN.md): reuse, contracts, tools, budgets, checks, sequence and acceptance criteria.

## Next sequence

1. D65 records Helen's approval of the initial launch scope; proceed within it without requesting the same approval again. Resolve consequential expansions separately. The narrow one-suggestion proactive refinement is agreed; automatic adjacent investigation remains deferred.
2. Freeze supported research tasks and expected evidence. Recommended first scope is NVIDIA operating-profitability research against the same frozen reports; other companies/10-K/news requests expose honest limits.
3. Build approved P0: question contract and evidence-backed answer/artifact, bounded session context and contextual follow-up. Preserve facts/checks and genuine status. No forced goal/risk/rationale taxonomy for arbitrary questions.
4. Evaluate objective completion, first useful checked insight and claim/source support, plus reviewed task time, corrections, interactions, omissions, cost and failures. Compare shared tasks with Prototype 1 and actual matched ChatGPT runs. Previous D59 timing trials are not V2 benchmarks.
5. Deploy a separate protected Preview only after the agreed gate; record source/model/prompt/schema/config, tag `prototype-2` and save learnings. P1 adds richer execution visibility, progressive checked artifact patches and selective clarification.

Existing [reliability/latency candidate](../../../evals/BRIEF-RELIABILITY-LATENCY-2026-10-12.md) remains reusable experimental work. It is neither a new released prototype nor the final open-question architecture.

## Concept preview (D62)

[Interactive concept notes](UI-CONCEPT.md) record the hypothetical thread/artifact layouts and scripted journey. Helen can review the flow before implementation. No layout choice or scope approval is inferred from requesting the preview.

## Differentiation checkpoint (D63)

[Standalone versus ChatGPT capability assessment](DIFFERENTIATION-AND-CHATGPT.md) records a proposed evidence/thesis workflow and optional MCP embedding path. Decide which narrow analyst task should outperform the strong ChatGPT baseline before extending sources or persistence. Same-session evidence correction fits the smallest experiment; the Q1 → Q2 replay requires additional state/evaluation preparation and approval.

## Recommended fast release (D64)

[Candidate launch scope](RECOMMENDED-LAUNCH-SCOPE.md) recommends one profitability-thesis pressure-test task, with automatic counterevidence and bounded real actions, on the existing NVIDIA pair. This is the recommended first task to approve/evaluate; broader replay/embedding/persistence options wait. Task relevance remains a hypothesis. No implementation authorization is inferred from requesting the recommendation.

## Proactive continuation recommendation (D65)

Generate zero or one evidence-linked, goal-relevant next investigation with the answer. Server checks feasibility; analyst selection starts a new bounded follow-up using the same artifact/context. Label missing sources and omit weak/redundant suggestions. Keep automatic adjacent research for a later evaluated iteration. D66 records acceptance of this narrow watch-question/continuation refinement.

## Current next step: pre-build reference review (D66)

Review the [pre-build checkpoint](PREBUILD-CHECKPOINT.md) and [first-task reference/rubric](../../../evals/V2-PREBUILD-REFERENCE.md). Helen selected the durable-operating-profitability question. Freeze expected task/evidence behavior, then implement the approved vertical flow. Five founder-defined scenarios are prepared; no actual V2/baseline/practitioner trials have run.

## Reference accepted and evals specified (D67)

Helen approves the worked answer. Suggested investigation ends with a specific runnable CTA when sources permit, preserving objective/evidence and revising the artifact; composer allows another prompt. Reference pack now defines each E1–E5/V2-01–V2-05 input, required behavior, code/human grader and pass/fail rule, plus rubric calibration and AI PM meta-evaluation. Next use strong/flawed examples to check the rubric, then implement the approved vertical flow. Do not rerun approval for the accepted answer/scope; actual model/ChatGPT/practitioner results remain pending.

## First scoring round (D68)

Preserve [Helen's submitted scores and observations](../../../evals/V2-HELEN-REVIEW-LOG.md). E1 2 / E2 provisional 0 / E3 1 / E4 and E5 pending are reference-review labels, not live evaluation results. Next deepen the qualitative prior/current evidence and execution implications, then review a dedicated E2 answer. E4/E5 runtime tests follow implementation. Preserve the earlier scored reference and log later revisions separately.

## Architecture and control checkpoint (D69)

Follow [architecture/autonomy/control specification](ARCHITECTURE-AND-SAFETY.md): refine references, freeze/calibrate E1–E5 plus C1–C9, implement the single bounded controller flow, then test and deploy a separate protected pilot after gates. Existing stack and source scope remain. Current budget is one tool round/up to two tool executions and two provider requests per turn; reasoning effort is an empirical quality/latency setting, not a permission expansion. No actual safety certification or live results in this planning step.

## Simple execution preference (D70)

Use the condensed model/code/user view in the architecture specification: one research model, two deterministic tools, no subagents or mandatory planner/critic/formatter calls. One request when the supplied evidence suffices; two at most when a bounded tool round is needed. This clarifies the existing design without removing safety checks or adding specialists. Evaluate usefulness/omissions and reviewed task time before extending orchestration.

## Ready for approved implementation (D71)

[Build-ready checkpoint](BUILD-READY.md) records completed design preparation and the build order. [Revised references](../../../evals/V2-REFERENCE-REVISION-2.md) deepen qualitative evidence and supply E2; existing cash tables allow an offline reconciled accounting bridge, to be prepared in the code metric tool. [Named control/autonomy fixtures](../../../evals/V2-CONTROL-FIXTURES.v1.json) remain pending actual tests. Original Helen scores are preserved. Next implement generic contracts/facts, bounded server flow, thread/artifact/revisions/Stop, then live product/control/semantic evaluations. No additional broad approval or pre-code requirement for tests that need the implementation.

## Safety foundation tested first (D72)

[Safety result record](../../../evals/V2-SAFETY-RESULTS-2026-10-12.md): V2 code-owned facts, request/tool/budget/controller/verifier and session revision primitives tested using scripted providers. 31 new test functions; 64 repository tests and typecheck pass. This is core coverage, not deployed/integrated safety or real model quality. Next connect actual provider and generic artifact/context UI, then exercise pending browser/deployment/injection/semantic gates. No extra approval loop or critic agent is introduced.
