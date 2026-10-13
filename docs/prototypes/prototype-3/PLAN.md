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
2. Run a small matched public E1 comparison at fixed model/effort/sources. V2 completed; V3 provider returned exhausted-credit errors before text. Resume V3 once credentials have usable credits. Keep failures in the record.
3. Helen reviews live verdict, material claims, explanatory depth, evidence weighting, omissions and final synthesis. No score is inferred from the authored example. See [evaluation contract](../../../evals/prototype-3/EVALS.md).
4. If useful, freeze the candidate and run three trials per E1–E5, including E4 follow-up, E5 limitations, cancellation and adversarial/control variants. Preserve failures and measure first useful finding, full answer, reviewed task time, corrective prompts and estimated cost.
5. Only if reasoning remains weak, compare low/medium effort with the same V3 contract/limits and equal task evidence. Higher effort is not automatically promoted; require improved reviewed quality worth the added time/cost.
6. Evaluate source expansion separately: issuer-authored SEC/CFO evidence where sufficient, permitted access/reuse, exact provenance and source-date/claim checks. NVIDIA-hosted third-party transcript inspection alone does not establish reuse rights. Keep login-requiring sources out.
7. Protected Preview/pilot gates remain after semantic and operational review. Navigation/history is a separate later priority. No public production enablement or deployment performed.

## Constraints and live blocker

Sessions remain memory-only. Prior checked turns survive failed follow-ups/Stop in the active session; reload loses the session. Live credit-limit errors are specifically sanitized and do not trigger an automatic retry. No secrets or raw user input in default logs; debug captures support only the fixed public E1 fixture and stay in ignored `.research-runs/`.


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

## D90 inline sources and verdict context, 2026-10-13

Current V3 uses underlined native “Source” anchors flowing immediately after evidence sentences. Removing the previous 44px citation-button line boxes fixes stretched prose spacing; standard standalone controls keep their hit areas. Actual report hrefs, names/dates, source inspection and exact opener focus remain. Completed context-role findings move under Verdict; developing findings still appear before a final verdict exists. Remove the orange financial-value underline and two generic closing sentences, retaining specific limits, unanswered criteria and the existing optional action. Model/facts/checks/budgets are identical to D88/D89. The preceding user-run D89 answer completed in 37.222s with five checked findings/no drops; it remains unscored, and earlier quota failures remain historical records.
