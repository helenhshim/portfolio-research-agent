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
