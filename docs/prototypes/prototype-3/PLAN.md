# Prototype 3: evidence-weighted thesis assessment

2026-10-12 · D86 · approved local experiment; not a released prototype.

## Hypothesis

A clearer checked verdict, richer evidence-weighted reasoning and compact expandable supporting detail help an analyst assess the thesis with less corrective prompting/checking than V2. Additional length, more findings or faster first text do not establish benefit.

## Version and return point

- Active branch: `prototype-3`.
- V2 branch and immutable annotated baseline tag: `prototype-2` / `prototype-2-baseline-2026-10-12` at `89d9641`.
- V3 preview: `/v3`, API `/api/v3/research`; V2 stays `/v2` with its original modules.
- Baseline manifest: [BASELINE.json](BASELINE.json). V2 learning: [retrospective](../prototype-2/RETROSPECTIVE.md).
- New experiment modules are intentionally isolated from V2's numerical/schema/controller/UI contracts. Unchanged transport, formatting monitor, revision guard, citations, A3 primitives/layouts/kit remain reused. Backport safety fixes deliberately with tests; do not silently retune V2.

## Executed first candidate

Same model `gpt-6.1-sol`, low effort, low verbosity, existing full frozen report pair, one controller, two optional code tools, zero subagents. Existing provider/tool/deadline/input limits remain. No extra data login, news retrieval, new call transcript or autonomous follow-up.

V3 exposes GAAP operating expenses and growth, gross margin and percentage-point comparisons, operating-margin YoY comparison, rounded Data Center revenue/share and clearly attributed Q3 management guidance. Fixed paragraph/unit/fiscal/GAAP checks and matching prior-quarter rows gate preparation. Guidance is a separate period, not actual current-quarter performance; no guidance-implied operating-margin scenario is implemented.

Prompt `v3-thesis-research-1`, schema `v3-thesis-schema-1`: up to six findings with role, self-contained qualified summary and explanatory text; checked verdict and dependency-linked thesis assessment; at most three selected financial rows, specific unanswered evidence and zero/one feasible user-triggered CTA. Every authored numerical placeholder in summary/detail/synthesis must belong to declared eligible facts. Reference validity remains mechanical, not semantic certification.

Output ceiling is 5,120 tokens rather than V2's 3,072, with a seven-hundred-word authored target and bounded fields. This intentionally permits fuller analysis at fixed effort; it is a richer-contract/checked-fact/output-budget experiment, not an isolated prompting or effort effect. Existing character, time, call and spend limits still apply. Record truncation/recovery rather than silently publish unfinished claims.

Initial D86 UI: 06a thread with upfront completed verdict, short qualified findings, native expandable supporting analysis, thesis assessment and unanswered/next action. D89 supersedes the collapsed-analysis presentation as described below. Source links open 06b inspection. Same data table/calculation/cash bridge. Developing answers publish complete reference-checked findings; the final verdict/assessment appears only after full checks. No automatic tab navigation. Authored example is explicitly labeled, not a generated V3 answer.

## Execute and decide

1. Preserve V2 and implement/check V3's typed facts, schema/dependencies and summary/detail UI. Completed; evidence in [results](../../../evals/prototype-3/RESULTS-2026-10-12.md).
2. Initial matched V2 E1 completed; V3 quota failures remain historical. Later user runs complete. Credits are not the current blocker.
3. Under D92, Helen accepts reasoning/follow-up usefulness from testing and skips another grading round for now. Preserve unscored E1–E5 records and the [evaluation contract](../../../evals/prototype-3/EVALS.md); do not manufacture ratings or source-matched comparison claims.
4. Execute session navigation, then operational/privacy checks first. Verify sensitive-input, credential, error, cancellation and source-instruction boundaries. Hosted protection/resource controls still need deployment-specific verification. Repeated E1–E5 quality/latency trials are deferred rather than interrupting Helen's current sequence.
5. Completion-time tuning follows navigation/safety. Compare shorter necessary authored output at fixed facts/sources and review material omissions. Compare effort settings only if a real quality gap returns; retain actual timing traces.
6. Evaluate source expansion separately: issuer-authored SEC/CFO evidence where sufficient, permitted access/reuse, exact provenance and source-date/claim checks. NVIDIA-hosted third-party transcript inspection alone does not establish reuse rights. Keep login-requiring sources out.
7. Protected Preview/pilot gates remain separate from local test success. Navigation is implemented under D92; durable history remains deferred. No public production enablement or V3 deployment performed.

## Constraints and historical live blocker

Sessions remain memory-only, now with a bounded index across sessions in the open page. Prior checked turns survive failed follow-ups/Stop/navigation; reload clears history. Credit-limit errors remain sanitized without automatic retry, but later user runs complete. No secrets or raw user input in default logs. Fixed public E1 and explicitly labeled public/synthetic control captures stay in ignored `.research-runs/`; never capture real private inputs.


## Reported-first financial evidence policy (D87, 2026-10-12)

Prefer a directly reported figure, ratio or growth rate when its metric definition, fiscal period, comparison baseline, units and GAAP/non-GAAP basis match the research question. Do not routinely recalculate an already reported metric or require a second data source solely to certify the issuer's arithmetic. Validation means checking correct extraction, context and source references; it does not certify the issuer's accounts or the model's interpretation.

Use deterministic code only for a needed comparison or calculation not explicitly reported on the required basis, such as a cross-release margin change or a reconciled cash-flow bridge. Preserve input references, formula, period/basis checks and source precision. Do not subtract cumulative EPS or mix incompatible definitions. If the reported value and an existing derived value disagree beyond explainable rounding, expose the discrepancy and withhold the disputed comparison rather than silently substitute a value or average them.

Keep reported and derived provenance distinct: reported facts retain the exact source location and reporting basis; derived facts additionally retain their formula and input lineage. The model selects and interprets eligible evidence, without inventing numbers or performing unchecked arithmetic. Missing or incompatible evidence remains an explicit limitation.

Acceptance criteria: a matching reported metric is reused without redundant recomputation; a missing eligible comparison is calculated with traceable inputs; wrong-period/unit/basis extraction is rejected; reported precision is preserved; contradictory values are surfaced. These are requirements, not newly executed evaluation results.

Status: D87 specification implemented in V3 under D88; V2 remains the preserved baseline. See `evals/prototype-3/D87-REPORTED-FIRST-2026-10-12.md` for actual acceptance evidence. No source expansion, paid calls, deployment or live-quality claim in this migration.

D88 updates the executed candidate to fact preparation `v3-reported-first-1` and prompt `v3-thesis-research-2`. Reported entries carry exact source/column/token/scale; only missing eligible comparisons carry formulas/inputs. Conflicting compatible cached calculations or cross-report historical values are exposed; disputed comparisons/baselines and dependent calculations are unavailable. Evidence basis/discrepancy disclosures preserve A3 and partial/failure ownership. The earlier first-candidate trials and quota failures remain historical; they are not trials of this migration.

## D89 reading hierarchy, 2026-10-13

Current presentation groups findings under semantic support/challenge/context headings using A3's existing Text title style, as Helen explicitly requests header-level type/size. Qualified finding summaries become Text strong subheadings; the selected analytical text is visible as at most three cited bullet groups, preserving every sentence and qualification. Financial citations follow the actual placeholders in each point; qualitative support remains finding-level. The repeated challenge sections become distinct subpoints under one heading. Missing evidence and the existing zero/one feasible action share “What to investigate next.” Basis and complete bridge stay inspectable. Source focus survives developing-to-final reconciliation and inspection close.

This is a presentation change to the D88 candidate, with identical provider prompt/schema/fact preparation and source scope. No additional model call, automatic follow-up, claim selection or effort change. V2 stays preserved; candidate-1 and candidate-2 tags retain the earlier layouts. Browser/scripted checks are recorded separately from live reasoning/latency evaluation.

## D93 navigation refinement, 2026-10-13

Helen replaces the D92 wordmark history entry with a visible left session rail and hide/show icon. Back sits before the toggle; New research is top-right. Keep the same bounded in-page sessions, preserving answers/drafts/source inspection and one-run ownership. The actual 545px preview has a left rail; phone-sized views get a dismissible left drawer. Back uses prior in-app views, without adding durable/device history or external navigation. This is a navigation refinement to candidate-5, not a research/model experiment. See `evals/prototype-3/SESSION-RAIL-2026-10-13.md`.

## D90 inline sources and verdict context, 2026-10-13

Current V3 uses underlined native “Source” anchors flowing immediately after evidence sentences. Removing the previous 44px citation-button line boxes fixes stretched prose spacing; standard standalone controls keep their hit areas. Actual report hrefs, names/dates, source inspection and exact opener focus remain. Completed context-role findings move under Verdict; developing findings still appear before a final verdict exists. Remove the orange financial-value underline and two generic closing sentences, retaining specific limits, unanswered criteria and the existing optional action. Model/facts/checks/budgets are identical to D88/D89. The preceding user-run D89 answer completed in 37.222s with five checked findings/no drops; it remains unscored, and earlier quota failures remain historical records.

## Local UI iteration (D91)

Run `npm run dev:v3` for the port-3006 UI preview with Fast Refresh and isolated `.next-v3-dev` output. Use production `build`/`start` for build or release validation. An already-open production-loaded tab keeps its old UI even when a fresh server/model response succeeds. Preserve useful old answers and open a fresh development-loaded tab; validate actual script URLs and rendered markers rather than regenerating research to test styling. A tested nonvisual component hot update retained the same authored answer turn and restored cleanly. No persistence or universal hot-reload state guarantee is implied. The presentation candidate remains D90 / candidate-4.

## Execution order approved in D95

1. **Restore browser-local sessions — implemented locally.** Ten sessions, thirty turns per session and five attempts per turn; versioned, size-bounded browser storage; reject a snapshot after thirty days without saving. Save completed checked answers and safe public drafts; exclude provisional findings, credentials, provider traces and supplied conversation-history snapshots. Reconstruct conversation context from restored successful turns. Delete removes the stored session; Clear history confirms before removing all local sessions/drafts. Corrupt/expired/incompatible history is not silently overwritten. An interrupted run restores as stopped, requires manual retry and never automatically dispatches a model call. A stale tab must not overwrite a newer stored snapshot. Same browser/origin only; no accounts or cross-device sync. Inspectable source/disclosure and navigation scroll state is preserved while mounted, not persisted across reload.
2. **Protected V3 preview — next.** Verify intended team/project/environment, access protection, server-only Preview credentials, unauthenticated page/API denial, streaming/Stop/retry, and deployment-wide spending controls. Do not enable public/production research or claim an instance-local ledger is an aggregate cap. Keep V2 baseline and earlier deployments recoverable.
3. **Completion time.** Measure first checked finding and final verdict separately on fixed public cases; inspect preparation, provider generation, tools and validation. Test a bounded output/payload change, hold reasoning/source contract fixed and rerun reference, cash-quality and material-qualification checks. Record actual results, not a promised speed target.
4. **Advisor/analyst pilot.** Prepare a short real-task protocol and capture usefulness, verification work, follow-up continuity, source limitations and failures. Recruit actual participants with Helen; do not fabricate results or message people without authorization.

### Follow-on UX phase — after the four priorities above

Ordered as Helen requests; these are planned, not implemented:

1. **Actionable next-investigation flow.** Turn relevant unanswered questions into explicit continuation actions when supported by available evidence/tools. Inherit the research objective and checked context, append a new turn, make missing-source needs clear, and require a user action before research. Never present an unsupported external investigation as an executable capability. Evaluate whether the next turn resolves or sharpens the specific gap.
2. **Remove output-text dividers.** Replace prose-section rules with A3 spacing and typography; retain meaningful table/grid/source-inspection structure and visible focus. Document the user-authorized visual-rule override before implementing it.
3. **Dynamic composer suggestion.** Suggest a specific feasible question based on the latest answer's unresolved issue; use the default example only before research. Suggestions must not overwrite a user's draft, submit automatically or invent evidence. Coordinate with the continuation CTA to avoid two competing suggestions.
4. **More engaging output.** Improve information pacing, specific thesis movement and useful response feedback while preserving concise verdict, evidence, material qualifications and source inspectability. No decorative motion, fabricated conviction, extra model call or new source is presumed necessary.
5. **Adjustable sidebar width.** Support user-controlled resizing with token-defined bounds, keyboard-accessible controls and a sensible compact-screen drawer. Keep thread/evidence readable; resizing must preserve session, draft and focus. Choose/reset a default width and document whether the preference persists.

For an AI PM, the test is whether these changes reduce the effort to continue a useful investigation, while keeping evidence boundaries and user control clear. "More agentic" is not a reason to add automatic tools, parallel agents or hidden research.

### D96 hosted execution update

History is implemented and tested locally and through the hosted stateless restoration endpoint. The corrected protected Preview is https://portfolio-research-agent-6e1ghb8u7-helenhshims-projects.vercel.app/v3 , source `3e9e6dd`. Hosted access, checked incremental output and upstream cancellation pass their HTTP checks; native browser interaction on that hostname still requires Vercel sign-in. Original cancellation failure and corrected 3.4s stop are recorded in `evals/prototype-3/PROTECTED-PREVIEW-2026-10-13.md`. Normal post-abort completion is 33.094s, not a controlled latency gain. Aggregate/provider spending limits, credential-rotation confirmation and actual participant access remain pre-pilot gates. The five follow-on UX items remain after the four priorities; this deployment does not move them ahead.
