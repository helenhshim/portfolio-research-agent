# V2 build-ready checkpoint

2026-10-12 · D71 · Design preparation complete enough to begin the approved vertical-flow implementation. This is build readiness, not tested pilot readiness. No runtime changes, paid model trials or deployment in this checkpoint.

## What is settled before coding

- One task: NVIDIA operating-profitability/thesis pressure test over the existing frozen SEC reports; public-company free-text only, active-session context, protected preview.
- One model, two code tools, zero subagents. Direct synthesis when prepared evidence suffices; optional one tool round/up to two tool executions and two provider requests. No mandatory planner/critic/recommender.
- Source-backed reference revision 2 addresses Helen's qualitative comparison/execution feedback and provides a dedicated E2 answer. Earlier scored answer/ratings remain intact; no new founder grades inferred.
- A correction to the evidence assumptions: the reports already contain cash-flow component tables. Prepare one fixed code-owned cash bridge within the existing metric tool; this is an accounting reconciliation, not proof of economic causes. Offline lineage/totals are recorded in `evals/V2-CASH-BRIDGE-REFERENCE.json`.
- E1–E5 product cases plus named C1–C9 control fixtures in `evals/V2-CONTROL-FIXTURES.v1.json`; expected behaviors/grading are defined, not yet passed.
- Output: working question, direct answer, one to three relevant financial rows, specific supporting/qualifying evidence, what remains unanswered, zero/one feasible next CTA and visible source/check status. Exact reference prose is not required.

## Minimal build contract

**Request:** public-company question (up to 2,000 characters), at most six bounded prior turns and previous artifact revision; validate the entire envelope and disregard client-supplied evidence bodies/facts. Server supplies the authoritative packet. Source/config/turn identity accompanies every response. Previous assistant prose is context, not evidence.

**Tool 1 — read approved evidence:** select allowed current/prior report or source paragraph IDs, with source periods intact and full approved report context available. No arbitrary URL, issuer, upload or search.

**Tool 2 — get checked metrics:** choose from explicitly prepared metrics/comparisons, including GAAP operating margin/percentage-point change and the fixed cash bridge. Code returns values, units, definitions, quarter alignment and lineage; reject missing/incompatible facts or unreconciled bridge. The model never supplies arbitrary formulas or raw values for computation.

**Answer/artifact:** typed findings with stable IDs, exact valid source references, eligible fact references, selected evidence/rows, limits/unanswered criteria and optional next action. Code renders numerical values from authoritative facts; every material interpretation still needs semantic evaluation. Actions reference surviving findings and available evidence. Preserve last valid brief on failure; reject late results from obsolete turns/revisions.

**Visible states:** preparing/researching/checking → result, honest source limitation, explicit partial/check failure, provider failure or stopped. Stop cancels future work and prevents a late artifact replacement. Retry is user initiated. No raw unverified claims are streamed as checked results.

**Protection:** server-only secrets; protected preview access; identified sensitive-input blocking before provider dispatch and no raw prompt/history in default logs; escaped output/catalog source links; input, call, time/output and resource limits. Detection is not guaranteed anonymization. Do not weaken checks for speed.

## What can be settled while implementing, before paid trials

Finalize exact type/schema/tool signatures, input/context/output/time/concurrency settings and model/effort configuration against local package/docs and fixtures. Set a finite batch spend cap and usage accounting before any paid test. These are implementation settings rather than a reason to reopen the approved product scope. Reuse the current provider/model for initial comparison; test effort candidates instead of declaring a winner before results exist.

## What must wait for the working prototype

Control pass/fail results, actual E1–E5 outputs, E4 contextual action/revision behavior, E5 coverage/recovery behavior, cancellation/race behavior, time-to-useful result, output quality under different effort settings and actual ChatGPT/practitioner comparisons. Keep these pending rather than holding all coding until they can pass.

## Build order and release gate

1. Read relevant local Next.js guides. Add generic request/answer/artifact contracts, prepared margin/cash-bridge facts and meaningful financial/lineage regressions.
2. Build server-only single-model synthesis and bounded tool execution. Add input/action/output budgets, source checks and explicit error paths.
3. Wire thread + brief, selected CTA, revision handling and Stop, using the agreed compact hierarchy. Preserve a source-faithful response on missing evidence and valid prior work on generation/check failures.
4. Exercise deterministic control fixtures and actual repeated E1–E5 trials under fixed source/model/prompt/schema/config. Include failures and review material interpretations/omissions. Helen's live grades are new entries, not replacements for reference feedback.
5. Deploy a separate protected preview only after product/control/semantic gates; compare useful reviewed task completion with a strong baseline. Unrun or failing critical controls prevent pilot release, not starting their implementation.

No further general scope/architecture approval is needed before coding within this agreed design. Reference revision 2 can be reviewed/iterated during implementation; it is not a new approval gate.
