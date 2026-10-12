# V2 safety foundation: first executable checkpoint

2026-10-12 · D72 · Local code tests using scripted provider responses; no live API calls, spend, browser run or deployment. These results apply to reusable V2 modules, not the deployed V1 or a completed V2 app.

## Results

- `node --test tests/v2-safety.test.ts`: 31 test functions pass. This is not 31 fully passed product/control fixtures: some tests cover subcases and two explicitly demonstrate transport/semantic limits.
- `npm run typecheck`: passes.
- `npm test`: all 64 repository tests pass, including the new tests and existing regression coverage.

Production-reusable modules are `src/lib/v2-financials.ts`, `v2-safety.ts`, `v2-verifier.ts`, `v2-controller.ts` and `v2-revisions.ts`. The controller accepts an injected provider; tests supply scripted responses, not an OpenAI adapter. No new library/provider/framework was installed. No API route, UI or deployed defaults are changed.

## Coverage and remaining gates

| Family | Evidence in this checkpoint | Still pending before pilot |
|---|---|---|
| C1 injection | C2 establishes rejection of forbidden actions regardless of requested name. No source-injection model trial here. | Actual injected-source/tool-result trials and human review for answer manipulation/omitted qualifications. |
| C2 tools/budgets | Forbidden tools, wrong arguments/periods/metrics, excessive calls, duplicate requests and second rounds rejected before execution; valid permitted actions also work. | Route/provider integration uses these boundaries; real action-choice quality. |
| C3 evidence/dependencies | Unknown facts, altered quotes, dangling dependencies, invalid schema and invalid next action rejected/suppressed while valid content survives. | Browser presentation of partial/check failures and prior-artifact preservation. |
| C4 finance/meaning | GAAP margin/percentage-point arithmetic, quarter alignment, signed cash rows/units/header/reconciliation tested. Invalid optional bridge is unavailable without erasing valid base facts. | Interpretive support, causal claims, omitted evidence and label/implication quality in actual model outputs. |
| C5 context | Client evidence/privileged role fields rejected; server packet snapshotted; new objective passed intact; session/revision primitive isolated. | Model obeys current objective/basis; real UI/server history/revision flow. |
| C6 failures/Stop | Scripted provider errors sanitized with no automatic retry; missing base facts stop dispatch; deadline/abort stop continuation; revision primitive preserves previous valid data and rejects late/cross-session updates. | Actual provider cancellation/usage/error mapping and browser race/duplicate-submission behavior. |
| C7 privacy/secrets | Identified synthetic question/history patterns blocked before provider callback and not echoed. Synthetic error secrets not exposed. Core has no env/credential access. | API adapter/bundle/log inspection and broader privacy trials. Pattern detection is not guaranteed anonymization. |
| C8 rendering/links | Narrative markup/free numerical values/model-authored URL fields rejected; server source links constrained. | Browser escaping of all displayed text/source excerpts, link interactions and client bundle check. |
| C9 access/resources/freshness | Question/history/envelope limits and pre-dispatch Stop/deadline tested. | Protected deployment authorization, rate/concurrency settings, current-market/freshness UI responses. Same-origin is not sufficient authorization. |
| A1–A3 initiative | Scripted valid direct answer is permitted with one request/no tools; valid two-tool path feeds second synthesis. | Useful real evidence selection, necessary versus redundant clarification and suggestion quality/user-selected initiation. |

Whole fixture definitions stay separate in `V2-CONTROL-FIXTURES.v1.json`. A covered unit subcase is not an end-to-end fixture pass. No new Helen scores or practitioner findings are recorded.

## Explicit limitation demonstrated

One authored draft has valid references but falsely claims receivables prove customer defaults and permanent margin deterioration. Mechanical verification accepts the references, while reporting `interpretation_support: requires_semantic_evaluation`. That test passes because it demonstrates the limit of these checks; the answer itself would fail human semantic evaluation. Do not classify it as a semantic-safety success or show an entire interpretation as “verified.”

Another test confirms a changed objective reaches the provider; its scripted answer does not establish real model obedience. Real C5.2 remains pending.

## Configuration and recovery

Initial code defaults: question 2,000 characters, history six turns, whole envelope 24,000 UTF-8 bytes; one tool round/two tool executions/two provider requests; whole-turn deadline 120 seconds. These are conservative hard caps, not latency targets or quality guarantees. Provider output/token and trial-spend settings still require recording with the real adapter before paid runs. Budget counters reserve execution slots, not paid-usage/completion measurements.

The cash bridge is deliberately tied to this frozen pair and validates table headers, quarter columns, labels, signs, units and totals. If that optional bridge cannot be prepared, mark it unavailable and retain valid total/margin evidence. Invalid mandatory base facts stop before dispatch. Arithmetic cannot establish business causality.

Public input/error paths do not log raw prompts/history or return raw provider errors. Known sensitive patterns can be blocked; unknown sensitive inputs may still pass. Failure reasons exposed to the client are allowlisted codes. The future server adapter must keep credentials outside model context and client bundles.

## How to keep the gate effective

Run `npm run typecheck` and `npm test` after relevant changes; changing a limit/tool/schema requires updating the corresponding adversarial expectations deliberately. Do not weaken a boundary to make tests green. Keep recorded failed/incomplete live trials separately from these deterministic tests. No extra critic model or per-read approval is introduced.

Next wire the real provider and UI to the tested controller/revision/verifier primitives, then exercise actual C1/semantic/E1–E5 and browser/deployment gates. Set the finite live-trial spend cap first. Only permit the protected pilot after critical code, integration and semantic gates pass; tests here do not certify production safety or financial/client-data compliance.
