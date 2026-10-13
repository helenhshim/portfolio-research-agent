# Call breakdown and compact fact-linked output

2026-10-12 · D81 · Local candidate; no deployment or pilot release.

## Actual slow preview trace

The current preview request took 106.048s. It made one remote model request and no tools. HTTP headers arrived at 0.923s; first output text at 3.358s; the remaining 102.690s was stream/output generation until response.incomplete. It emitted 57,189 characters, consumed the entire 8,192 output-token ceiling (46 reasoning tokens), and ended with max_output_tokens. Reference checks were never reached. The stream parser returned the semantic terminal correctly, so D80's reader repair worked while generation still failed.

This separates slow generation from the optional two-call path. In general, a browser POST goes through local frozen-data/fact preparation, one Responses request, an optional local evidence/metric tool round and second Responses request, then local verification/presentation. There is no runtime SEC/news/price fetch, planning agent or model critic. The successful candidate's preparation measured about 1ms and checks 0–3ms; model requests dominated.

## Reproduction and rejected speed candidate

A compact-formatting/low-verbosity/3,072-token candidate returned in 9.380s and 15.738s but failed exact quotes and dangling takeaway dependencies. Its third trial failed after 44.037s: the captured public output contained 33,294 characters, 32,002 whitespace characters and a continuous whitespace run of 31,923. It stalled after redundant financial-table quotations rather than completing the brief. That reproduction establishes a formatting loop; the original preview's exact whitespace proportion was not captured and must not be invented.

Do not accept fast unusable results. The rejected candidate is preserved separately in [metadata](V2-LATENCY-CALLS-2026-10-12.json); no verifier rule was weakened.

## Final candidate and necessary outputs

The model now references authoritative fact IDs for financial-only findings and omits duplicate financial-table quotations. Prepared facts already have source lineage; their calculation basis, prior/current values and complete cash bridge are rendered by code. Qualitative business claims still need exact excerpts. A compact minified JSON object, low text verbosity and a 3,072 output-token ceiling bound response generation. Full 504-paragraph context and 55 facts remain; static context precedes the variable question/history to improve shared-prefix caching. Prompt is v2-public-research-5; schema remains v2-brief-schema-3 and model/low reasoning remain unchanged. [Official latency guidance](https://developers.openai.com/api/docs/guides/latency-optimization) emphasizes reducing generated output, while [verbosity guidance](https://developers.openai.com/api/docs/guides/deployment-checklist) distinguishes brevity settings from reasoning effort.

Core generation: direct takeaway, selected financial rows/implications, supporting and qualifying findings, specific unanswered criteria and zero/one feasible next investigation. Details: source excerpts, calculation basis and complete cash bridge from the existing artifact/code, opened without a new model call. This does not implement incremental validated findings; that is a subsequent proposal requiring per-finding checks, clear provisional status, dependency handling and cancellation/revision tests. Unchecked text still stays server-side.

Three sequential fixed E1 calls sharing one $0.70 ledger completed without reference drops in 13.644s, 13.218s and 14.693s (median 13.644s/max 14.693s). Each used one provider call/no tools, around 872–917 output tokens, and preserved operating-performance support, cash-conversion qualification, production-ramp limits and specific future evidence criteria. These are a finite local sample, not p95 or a universal under-40s guarantee. Qualitative findings still combine outlook/financing clauses without complete quoted coverage; that existing semantic citation gap remains open and prevents declaring pilot-quality readiness.

The rejected $1-capped batch used approximately $0.25616; the accepted $0.70-capped batch used $0.24162; total conservative estimate $0.49779. Cached billing may be lower. Complete public captures and diagnostic incomplete text remain ignored under .research-runs. No sensitive/arbitrary history was captured and no private reasoning was read.

## Detect and recover from formatting stalls

A streaming lexer tracks string/escape state across deltas without retaining text. It rejects more than 512 consecutive JSON-whitespace characters outside string values, while preserving legitimate whitespace inside quoted evidence. A detected loop may use one remaining model-call slot to regenerate formatting from the original question/full sources; no partial output is accepted, repaired into a fact or fed back as evidence. The retry prohibits tools. If the second request also stalls, or the first request already used a tool continuation, there is no third call. Generic incomplete responses, quote/check failures and provider errors do not trigger automatic retries. Existing 120s whole-turn/one-tool-round and resource limits remain.

The user-visible stage is “Retrying response formatting”; the abandoned generation action is marked failed, with one active task and one timer. User Retry remains a separate explicit action. This scoped internal recovery is a D81 override to the earlier no-automatic-retry baseline, within the same maximum two provider calls. It is not another research agent or extra request on every successful turn.

## Observability and verification

Provider progress now records call start, headers, first text and 10s counters while running. Final traces include call index, verbosity, token ceiling and last-text time. Validated session/turn/revision identities correlate API logs; local preparation, each provider request, tools, verification and presentation have separate timings. Logs remain content-free. Debug benchmarking supports 1–5 sequential fixed public cases under one shared cap, with median/max rather than unsupported tail-percentile claims.

96 tests, typecheck and production build pass. Tests cover lexer splits/escapes/quoted whitespace, one formatting retry, no third request, Stop preventing recovery, no partial draft publication, preserved full context and safe timing/progress metadata. Scripted browser recovery completed within one Q/A turn, one timer and no failure panel; expanded action history records first-generation failure then formatting recovery/checks. [Scripted recovery proof](V2-FORMAT-RECOVERY-2026-10-12.png) is not a model-latency result. The harness is stopped after validation; updated normal preview stays on port 3005.
