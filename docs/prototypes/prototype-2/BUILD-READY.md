# V2 build-ready checkpoint

2026-10-12 · D71 · Design preparation complete enough to begin the approved vertical-flow implementation. This is build readiness, not tested pilot readiness. No runtime changes, paid model trials or deployment in this checkpoint.

Current contract includes D82's user-authorized incremental checked findings and thread-only answer/source-inspection presentation. D71/D72 readiness statements and earlier implementation notes below are historical; current verification is recorded separately, not inferred from build readiness.

D72 progress: reusable V2 financial/controller/safety/verifier/revision modules and 31 scripted-provider unit tests now exist. [Coverage record](../../../evals/V2-SAFETY-RESULTS-2026-10-12.md) reports core passes and remaining integration/semantic gates. No actual provider/route/UI hookup or live call yet; earlier D71 preparation notes below are historical.

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

**Answer/artifact:** typed findings with stable IDs, exact valid source references, eligible fact references, selected evidence/rows, limits/unanswered criteria and optional next action. Code renders numerical values from authoritative facts; every material interpretation still needs semantic evaluation. Actions reference surviving findings and available evidence. D82 permits only complete independently checked findings during generation, labeled as a developing answer. Full-draft dependency checks remain authoritative and reconcile/remove earlier provisional findings before completion. Clear provisional content on recovery, Stop or failure; preserve completed earlier answers under their original ownership. Reject late results from obsolete sessions/turns/revisions.

**Visible states:** preparing/researching/investigating/checking → result, honest source limitation, explicit partial/check failure, provider failure or stopped. D82 animates real stage changes in one top-level progress line with one elapsed timer and reduced-motion support; independently checked findings can appear while generation continues. Stop cancels future work and prevents late publication/artifact replacement. User Retry remains explicit; D81's one formatting-only recovery may use the second existing call slot after a detected whitespace stall, never a third call. No raw unverified claims or private reasoning are streamed to the browser.

**Protection:** server-only secrets; protected preview access; identified sensitive-input blocking before provider dispatch and no raw prompt/history in default logs; escaped output/catalog source links; input, call, time/output and resource limits. Detection is not guaranteed anonymization. Do not weaken checks for speed.

## What can be settled while implementing, before paid trials

Finalize exact type/schema/tool signatures, input/context/output/time/concurrency settings and model/effort configuration against local package/docs and fixtures. Set a finite batch spend cap and usage accounting before any paid test. These are implementation settings rather than a reason to reopen the approved product scope. Reuse the current provider/model for initial comparison; test effort candidates instead of declaring a winner before results exist.

## What must wait for the working prototype

Control pass/fail results, actual E1–E5 outputs, E4 contextual action/revision behavior, E5 coverage/recovery behavior, cancellation/race behavior, time-to-useful result, output quality under different effort settings and actual ChatGPT/practitioner comparisons. Keep these pending rather than holding all coding until they can pass.

## Build order and release gate

1. Read relevant local Next.js guides. Add generic request/answer/artifact contracts, prepared margin/cash-bridge facts and meaningful financial/lineage regressions.
2. Build server-only single-model synthesis and bounded tool execution. Add input/action/output budgets, source checks and explicit error paths.
3. Wire the in-thread checked answer, source inspection, selected next-investigation CTA, revision handling and Stop, using the agreed compact hierarchy. D82 adds complete checked findings during generation; no Open brief CTA, Brief pane/tab or bottom source list. Preserve a source-faithful response on missing evidence and valid prior work on generation/check failures.
4. Exercise deterministic control fixtures and actual repeated E1–E5 trials under fixed source/model/prompt/schema/config. Include failures and review material interpretations/omissions. Helen's live grades are new entries, not replacements for reference feedback.
5. Deploy a separate protected preview only after product/control/semantic gates; compare useful reviewed task completion with a strong baseline. Unrun or failing critical controls prevent pilot release, not starting their implementation.

No further general scope/architecture approval is needed before coding within this agreed design. Reference revision 2 can be reviewed/iterated during implementation; it is not a new approval gate.


## D73 implementation update

A3 is implemented at `/v2` with all three layouts, the reusable kit, actual frozen facts, saved-reference disclosure, source tabs, cash-bridge/margin detail and same-session Stop/recovery. V1 stays at `/` with a separate root layout. Provider/HTTP integration now exists; D72’s “no hookup” status above is historical. A small outcome classification preserves the current brief on outside-coverage/clarification replies. The submitted question is shown; a separately inferred working-question field is still absent.

See [A3 implementation and trial record](../../checkpoints/A3-FRONTEND-2026-10-12.md) for actual browser/tests/model failures. Scripted tests and the saved authored reference do not establish live answer reliability. Keep the protected-pilot gate closed until E1–E5/control/semantic evaluation passes; no deployment or release tag in D73.


## D79 thread-first implementation update

Checked answers now remain directly in the originating research turn, including selected comparisons, surviving findings, details, unanswered criteria and next CTA. Completion does not navigate to inspection. Open brief/source links select the originating answer for optional desktop split or dismissible narrow inspection. Remove global Thread/Brief switching and footer layout navigation; the header/index is still subsequent work. The same checked body renders both surfaces, with existing provider/data/verification contracts and no extra model call. See [thread-first checkpoint](../../checkpoints/V2-THREAD-FIRST-2026-10-12.md) for browser validation.


## D82 progressive findings and focused source inspection

Helen authorizes publishing complete checked findings incrementally before the final answer. Keep the existing one-model/two-code-tool controller and request budgets. Recognize complete structured finding objects server-side, apply the final verifier's finding-level shape/fact/quote/numerical/sensitive-output and complete-sentence closure rules, and publish only passing findings with validated attempt identity. No model text token or partial object goes straight to the UI. The thread labels these as reference-checked findings while the answer develops; neither final synthesis nor semantic support is certified early.

Final full-draft checking controls the completed artifact and removes provisional findings that do not survive. Reset provisional content for formatting recovery, Stop, failure and obsolete identities. Test rejection before client publication, duplicate/out-of-order events, final reconciliation, cancellation/late callbacks and recovery boundaries. Keep completed earlier answers intact, and exclude unfinished attempts from history/evidence.

Remove Open brief, the Brief inspection tab/full brief pane and standalone bottom source rows. Keep interpretation, financial evidence and calculations/cash-bridge disclosures in the thread. Compact inline `[1]`/`[2]` source controls expose actual report/date descriptions and open source inspection; quoted findings select exact passages, while fact-only findings use honest report/lineage provenance. No invented sentence-to-quote mapping. Source inspection remains keyboard accessible and dismissible on desktop/narrow screens.

Advance from generating to remaining findings only after a checked finding, and to final synthesis only when the actual findings array closes. Animate only actual stage-label changes in the top-level StepLog using A3 tokens and reduced-motion rules. Show one elapsed timer while running and one total at completion; do not announce ticks, simulate progress or add output-generation calls. Header/index/history remain later scope. Tests, browser proof and any bounded live measurements belong in [D82 checkpoint](../../checkpoints/V2-PROGRESSIVE-FINDINGS-2026-10-12.md); live reliability, semantic support and E1–E5/pilot gates remain pending until evaluated.

**D83 protocol compatibility:** extended finding/reset events and newer stage milestones require `X-Research-Protocol: findings-v1`. An absent or unknown value keeps the original stage/result vocabulary and legacy stage names so already-open older pages can finish without a forced refresh. Current clients explicitly handle recognized event types, ignore unknown types and cancel reader/request/provider work on parsing or processing failure. Preserve attempt-identity and late-result guards; no model/source/budget change. Actual compatibility verification is recorded in [D83 checkpoint](../../checkpoints/V2-STREAM-COMPATIBILITY-2026-10-12.md). Reload still loses this prototype's memory-only session.
