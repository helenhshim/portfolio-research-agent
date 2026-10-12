# Build sequence and checkpoints

Approved working sequence recorded at Helen's request on 2026-10-11. Guide Helen through one step at a time, report the current step, and verify its completion before advancing. Helen’s preference, recorded 2026-10-11: continue into the next task without routine permission questions; use judgment for necessary reversible product and implementation decisions, explain assumptions, and document them. Ask only for genuinely blocking information or consequential actions outside authorized scope. Earlier approval checkpoints are review opportunities, not automatic pauses; Helen can steer while work continues. Do not silently expand product scope. The PRD and decision log remain the scope authority.

## Agent-design coaching throughout

Helen requested ongoing explanation of agentic workflow, product decisions, and architecture on 2026-10-11. At each checkpoint explain: user intent and context; agent decisions and available tools; deterministic versus model responsibilities; evidence and completion criteria; recovery and human control; relevant evaluation. Steer toward useful bounded autonomy, without adding unconstrained tools or extra agents merely to appear agentic. Distinguish implemented capability from proposed architecture. Propose changes before updating approved product scope.

## Continuous product-value check

Helen explicitly requested ongoing pressure-testing against doing the task in ChatGPT on 2026-10-11. Before and during implementation, identify the user work each feature removes, the reliability it adds, and how to measure the benefit. Compare equivalent tasks with identical goals, holdings, and source cutoffs, using a reasonable ChatGPT prompt and recording available tools/model. Measure instruction/correction burden, factual and evidence-support accuracy, valid period comparisons, review time, and follow-up continuity. Do not claim superiority without results. A nicer prompt wrapper alone is insufficient differentiation. Agentic capability and user value are separate evaluation questions.

## 1. Lock MVP inputs: input contract

Completed under D33. Helen approved the input-led direction and, on 2026-10-11, retained risk tolerance (low/medium/high; default low), selection of 1-5 supported sample holdings (all initially selected), and the fixed latest-earnings research task. Primary-goal and holding-period labels, descriptions, and research emphasis are approved under D31-D32. Goal is desired outcome; holding period is expected ownership duration, shared across selected holdings. Growth label: Grow my investment value. Input validation/errors and exact submitted configuration are finalized in PRD section 8. Define final fields, allowed values, defaults, required inputs, validation/errors, and exact submitted configuration. One sample client; no A/B selector or invite gate. Full personal portfolio entry remains later scope.

Checkpoint: Helen reviews and approves the concrete input contract; update PRD and decisions.

## 2. Define one example result: output contract

Walk through one holding. Specify displayed content, evidence dependencies, distinctions between facts and interpretations, missing-data behavior, and supported talking points.

Checkpoint: review and approve the concrete output and verification rules before implementation.

## 3. Prove the data pipeline

Test actual application retrieval and extraction from approved public SEC endpoints for representative companies, including fiscal-period differences. Verify source alignment, acquisition rules, cache/rate/retry behavior, and failures. Public browsing does not prove application access.

Checkpoint: inspect retrieved numbers, reporting periods, release extraction, and acquisition checks. Record evidence and unresolved gaps.

## 4. Build and evaluate the research engine

Implement code calculations, model structured analysis, deterministic evidence checks, and dependency removal. Evaluate quote fidelity, number accuracy, evidence support, justified goal relevance, missing data, and partial failures. Context comparisons use fixed company-source snapshots.

Checkpoint: inspect generated and verified output, dropped claims, context tests, and failure behavior before UI implementation.

## 5. Plan visual design

Use docs/DESIGN-BRIEF.md for the guided branding, typography, layout, and state exploration, grounded in the approved inputs and output.

Checkpoint: select a visual direction and record design decisions and tokens.

## 6. Build UI and deploy preview

Implement input, per-holding progress, results, evidence review, and partial-failure recovery. Deploy Vercel preview, verify the end-to-end journey, then proceed through the agreed production checkpoint and practitioner sessions.

Checkpoint: Helen reviews preview and validation evidence before production release.

## Progress

- Step 1: approved bounded inputs complete; D57 preserves income/short/low/dependable-income defaults and fixes NVIDIA for web.
- Step 2: paired output contract and receipt hierarchy approved; selected metrics/watch questions implemented.
- Step 3: NVIDIA paired preparation complete. Runtime uses frozen public data, with no SEC requests. Aggregate controls precede live refresh.
- Step 4: full-release synthesis/verification implemented. 30 tests pass. High/context-v1 is the preview setting; interpretation support and superiority remain evaluation questions.
- Step 5: compact receipt UI built with local Inter/Plex Mono. Desktop/mobile checked.
- Step 6: Next.js builds and protected Vercel Preview deploys. Secret metadata verified in owner UI. Live deployed check completed in 131 seconds; headline/core findings survived and two comparative items were removed.

Next: try the shipped input-to-output journey, then advisor tasks and a matched ChatGPT comparison. Public paid release, persistence and adaptive follow-up remain separate. No in-app invite/client A/B selection.

## Reopened input/output checkpoint (D43)

Helen approved a holding-rationale input and premise-check output after the minimal watch-list design still lacked a concrete implication for ownership. Steps 1-2 revised to one company per run with a bounded rationale. Core schema, planner, verifier dependency checks and tests updated; 25 tests and typecheck pass. Controlled NVDA trials completed with only rationale varied; source and broad context stayed fixed. Final corrected pair separates operating-growth investigation from dividend-payment/funding investigation. Evidence support and usefulness remain review questions. Do not implement the previous multi-holding report UI as the final design. Continue to the premise-check visual after reviewing these trials.

### Required refinement before final results UI (D48)

Refine planner/analysis context handling for ticker, goal, holding rationale, horizon and risk; use the what-happened / goal implication / unanswered-or-watch-next structure. Run one-input-at-a-time relevance checks with stable sources and facts, including horizon-specific questions and risk emphasis without false certainty. Then update the receipt result preview using evaluated outputs. Do not treat documented requirements as implemented behavior. Keep follow-up agents and saved next-filing checks on the existing D35 roadmap.

### Next retrieval-quality experiment

Reasoning trial exposed missing question-specific fiscal-column headings despite those headings being present in the full supplied release. Evaluate full approved-packet citations plus section/table-preserving retrieval before adding embeddings or unrestricted agent loops. Keep financial math in code and maintain source IDs/cutoffs. Record improved evidence completeness separately from model-effort gains; proposed change is not yet implemented.

### Primary-path correction (D52)

Implement full structured report context with exact in-packet citations and takeaway-driven selection of eligible financial fact/comparison IDs. Validate code-rendered figures and claim-to-evidence links; compare against the existing focus baseline. Do not add a new mandatory planner/tool loop solely to preserve the agent label. Keep adaptive investigation as optional follow-up. Approved direction, subsequently implemented for NVIDIA under D57.

### PRD consolidation (D54)

Main PRD now defines advisor holding-explanation as the first task, with buy-side premise-check validation separately. First release requires full structured source preparation and selected fact-ID rendering before UI/deployment. One concise discussion point reuses evidence; no mandatory three-item report. Preserve bounded inputs, approved SEC sources, mechanical checking and Vercel target. Next milestone remains source-context/selection implementation and meaningful evaluation, then results UI/deployment and practitioner tasks; adaptive research stays V1.

Paired-quarter checkpoint completed 2026-10-12: real NVDA prior release retrieved, fiscal alignment/QoQ facts prepared, full-report comparative output generated and manually reviewed. 29 tests passed at the historical D56 checkpoint. Before generalizing: retain financial/table lineage, avoid interpreting quarterly cash volatility as a proven broken thesis, preserve complete quote bundles for comparative claims, and test material-change selection on additional task cases as needed. UI and protected Preview subsequently implemented under D57.

### Next steps after paired-quarter test (2026-10-12)

1. Review the actual-result receipt preview for takeaway comprehension, supporting-number clarity, visible counterevidence and usefulness of watch questions. The preview exposes real source disclosures but performs no research.
2. Stabilize the paired-quarter contract/source preparation and evidence completeness for the intended first-release cases; distinguish unavailable prior-release coverage. Fix citation-bundle and period-label issues rather than hiding them in UI.
3. Build Next.js setup -> actual research progress -> results using saved checked output first, then wire the same contract to server-side runs. Keep credentials server-side, inputs immutable and errors/retry honest. Workload latency/cost and aggregate source controls remain pre-release requirements.
4. Verify the end-to-end flow and create a Vercel preview when deployment is ready/authorized. Do not claim a production app exists from the contained preview.
5. Conduct advisor holding-explanation tasks and separate analyst premise checks; compare total checking/editing effort against existing workflows. Prioritize saved/adaptive continuation only after first-brief usefulness.

### D57 first-release architecture

Load frozen paired reports → one high/context-v1 synthesis → mechanical checking → selected code-owned figures. No keyword lookup, live market research or adaptive tool loop. Progress tracks actual stages. Input/result copies are immutable per run; failures preserve entries. Credentials remain server-side. Live deployed verification completed; inspect docs/checkpoints/WEB-MVP-2026-10-12.md.

### D58 next quality checkpoint

Before broader rollout, replay Helen's income/profitable-growth/short/medium configuration. Inspect invalid/empty supporting references; simplify the redundant paired schema and make useful verified output survive headline failure. Benchmark the same source/task at lighter effort and shorter output, then evaluate company-evidence/result reuse. Track useful-takeaway success and median/p95 latency with citation/omission review. These are proposed improvements; current runtime remains high/context-v1.

### D59 scoped reliability/latency patch

Confirmed phantom financing/income finding references in the exact failing case. Local evidence-first/fixed-ID candidate and output simplification implemented behind options; 33 tests/typecheck pass. Successful low-effort full-report trials took 39–43s. Before rollout: evaluate repeated bounded cases and capture any incomplete-generation reasons; do not conceal the early failures. Then add exact successful-result reuse with source/config invalidation and clearly labeled delivery. No live-preview settings changed yet.

### D60 prototype iteration sequence

Prototype 1 is frozen at tag `prototype-1` with the original protected Preview and exact upload manifest. Continue on branch `prototype-2`. The next sequence is learning review/practitioner task → revised user job and output contract → candidate reliability/latency evaluation → UI/recovery/reuse implementation → separate preview/release gate → retrospective. See `docs/prototypes/prototype-2/PLAN.md` for the current sequence; it supersedes earlier next-step lists where they conflict. Existing local options remain experimental until evaluated and released.

### D61 analyst-first intent-driven pivot

Completed static V1 audit, decision memo and smallest V2 technical plan in `docs/prototypes/prototype-2/`. These supersede D60's advisor-first P2 brief hypothesis. Next: Helen reviews consequential task/source, P0/P1/session, and bounded-agent/free-text decisions; implementation starts only after approval per her handoff. P0 objective is question → source-backed artifact → contextual follow-up. Do not implement the prior preset schema as an opaque natural-language translator, or claim progressive findings/adaptive tools without building them. No new live trials or implementation changes performed for this memo.

### D64 fast launch recommendation

Use the candidate scope in `docs/prototypes/prototype-2/RECOMMENDED-LAUNCH-SCOPE.md`: one NVIDIA operating-profitability pressure test, automatic supported counterevidence, bounded evidence/calculation actions and a same-session revisable brief. Proposed single-controller budget reduces D61's earlier ceiling to one tool round/up to two tool executions and two model requests; evaluate quality/latency, do not force a call. Temporal replay, new data, memory/monitoring, progressive patches and MCP adapter remain later. Confirm the concrete plan before implementation per Helen's handoff.

### D65 approval and proposed next-investigation refinement

Helen approved the D64 initial release scope; the D61 approval checkpoint is resolved for that scope. Proceed with its fixtures/contracts/implementation without repeated permission. Recommend one optional evidence/intent-linked next investigation from the same synthesis, feasible against the approved catalog and initiated by user selection. This addition remains under discussion. Do not initiate related research, expand sources or add background scheduling merely because a suggestion was generated.
