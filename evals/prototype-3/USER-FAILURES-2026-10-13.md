# User-observed failures — October 13, 2026

Evidence: Helen's test feedback. Exact saved model response/trace is not attached; code paths below explain the reported behavior but are not a replay of her run. This is a regression specification, not passing evaluation results. No runtime changes made in this triage.

## Priority 1: answerability and direct relevance (pilot blocker)

Question: “What contribution does management attribute to product mix, pricing, manufacturing costs or Rubin ramp economics?”

Observed: stale, adjacent facts instead of a direct answer or explicit limitation.

Code diagnosis: v3-provider.ts requires thesis roles and a balancing assessment, encourages a complete answer when source-limited, and does not define a strong relevance/answerability decision. v3-verifier.ts checks valid references, exact quotes and dependencies, not whether those references answer the question. A finding must have positive source support; the contract has no dedicated representation for a scoped evidence gap. This can encourage padding a limitation with adjacent cited facts.

Required behavior: distinguish direct management attribution from inference and an unavailable attribution. If the available report pair does not establish the requested contribution, say so upfront, scoped to those reports. Do not claim management never addressed it elsewhere. Aggregate margin and production progress do not establish pricing, mix, manufacturing-cost or product-ramp economics. Partial coverage should name exactly which part is answered. Offer at most two relevant, answerable alternative questions, with user-initiated execution only. Preserve source scope and verification.

Regression cases:
- A1 Exact question above: explicitly state the missing attribution; no unrelated operating-leverage/cash-flow essay; no invented contribution breakdown.
- A2 “What gross margin did NVIDIA report, and what margin does management expect next?”: answer directly with checked facts and expectation/realization distinction; no blanket refusal.
- A3 “How much of the gross-margin change came from Rubin ramp costs?”: distinguish observed change from missing causal decomposition; no inference presented as management attribution.
- A4 “What changed about Rubin deployment, and what does that prove about product margins?”: answer documented execution change; explicitly limit margin conclusions.
- A5 Repeat A1 after a broad profitability answer: honor the new question; do not recycle the prior thesis or treat history as evidence.
- A6 Suggested alternative: “What does the report say about Rubin production and partner deployment?”: execute only on click/message and answer from approved evidence. Never offer unavailable transcript/news retrieval as an executable action.

PM grading per case: 0 = misses the question or invents attribution; 1 = useful but buries the limitation or adds distracting facts; 2 = direct scoped answer/limitation, evidence matches it, and any alternative is relevant and feasible. Any invented management attribution is a critical failure regardless of average score. Source/reference tests alone cannot pass this rubric.

## Priority 2: answer structure follows question intent

Observed: repeated context/support/thesis shape across different questions.

Code diagnosis: v3FindingSchema restricts roles to supports/challenges/context; ResearchFindings maps each finding role to a fixed h2. ResearchAnswer always labels its headline Verdict; CompletedDetails labels synthesis Thesis assessment. Model selection alone cannot change this presentation.

Required behavior: bounded intent-aware composition, keeping checked facts/citations and stable streaming order. Attribution question: direct answer, what is established, what is missing, feasible next question. Comparison question: relevant comparison and implication. Thesis question: verdict and supporting/qualifying evidence. No arbitrary model HTML/layout generation. Defer charts and richer dynamic visualizations until this text behavior passes.

Cases B1–B3: run attribution, margin comparison and durability questions; ensure each uses appropriate headings/sections, does not force irrelevant sections, and retains all material qualifications. Test incremental arrival and final completion without reordering visible findings.

## Priority 3: specific limitations and duplicate headings (ship with Priority 2)

Code diagnosis: CompletedDetails emits the generic unresolved sentence whenever answer_kind is source_limited. This is not a timeout or failed-reference message. ResearchFindings creates a section per finding, so repeated context roles repeat their heading. The verdict disclosure separately repeats context summaries by design. Without the original artifact, cannot establish which combination Helen saw.

Cases C1–C4:
- Source-limited answer names the unavailable attribution once near the answer; no generic unresolved banner substituted for explanation.
- Two context findings have distinct descriptive subheadings, no repeated generic category headings.
- A reference-check failure retains its separate error behavior; it must not masquerade as a source limitation.
- No shift/reordering on completion, no repeated context summary in headline and body unless explicitly requested via inspection.

## Execution order

Update answerability/limitation contract and prompt first, with deterministic safety checks retained. Add semantic regression cases and manually grade live outputs. Then implement bounded intent-aware headings/composition and limitation rendering together. Re-run existing citation, source-boundary, privacy, streaming and history tests. Use these cases as internal preflight before the independent analyst pilot; keep participant feedback unscored until received. Completion-time work remains secondary to answering the actual question.

## D102 implementation checkpoint

Implemented locally; not deployed. Final public live captures: `.research-runs/latency-1791922717679`. Attribution completed in 7499ms with explicit scoped absence, one relevant finding, no table or synthesis and a feasible gross-margin/outlook follow-up. Comparison completed in 6038ms with reported and expected values distinguished and no synthesis. Both passed source checks. Manual review supports A1/A2 behavior on these samples; A3–A6 and broader multi-turn semantic coverage are not yet established. 164 automated tests, typecheck and build passed. Adjacent grouping preserves order; topic consistency is model-guided and needs continued evaluation. No participant scores recorded.

## D103 multi-turn regression

Public history fixture: earlier question and answer already compared reported gross margin with management outlook and distinguished expectations from realized outcomes. Ask the attribution question again. Final live result states the unavailable causal breakdown, uses production progress only to explain its limitation, omits financial rows and synthesis, and returns next_investigation:null. This resolves the observed repetitive margin CTA on this sample. A comparison asked explicitly by the user remains answerable even if discussed before; it also returns no new CTA. Captures: `.research-runs/latency-1791923242885`.

Additional automated cases: bounded history includes findings/evidence IDs/open questions; exact previous-question suggestions are suppressed in the controller. Semantic novelty, helpful deeper interpretation, and long-conversation relevance remain human-scored checks, not claims guaranteed by reference validation. History contains the latest three answered exchanges only.

Hosted D103 check: new protected Preview `portfolio-research-agent-9iccxbrct-helenhshims-projects.vercel.app` returned complete in 9446ms, one call/no tools, exact attribution limitation and no redundant CTA. Stable pilot alias switched to this deployment. Hosted page and endpoint verified; no manual visual browser check in this turn.

## D104 cash-flow action check

Live public question: “Why did cash flow fall? Does that mean margins are deteriorating?” completed in 29.2s, first checked finding 12.0s, one call/no tools. It grouped two bridge findings under Cash-flow decline and a margin comparison under Margins versus cash conversion. It returned one relevant limitation about unexplained business causes/persistence, no unrelated margin-attribution limitation, and next:null because the bridge, annual comparison and accounting distinction were already covered. Capture `.research-runs/latency-1791923741246/cash-actions.json`. Manual relevance review is a single sample, not a guarantee.

167 automated tests, typecheck and build passed, including rejection of unavailable/empty evidence for explanatory actions. Source inspection preserves finding-to-passage links and financial comparison inputs. Manual visual inspection not performed in this checkpoint.

Final D104 validation: 168 tests pass, including passage-action history round-trip and invalid-reference rejection. Deployed protected preview `portfolio-research-agent-6xhdriqng-helenhshims-projects.vercel.app`; authenticated page smoke passed and stable pilot alias updated. Model sample above was executed locally against the provider, not the hosted endpoint.

## D105 concise inspection and continuation check

Cash-flow fixture completed in 25.8s, one provider call/no tools. Next question: “Why did the cash balance rise despite weaker operating cash flow, and what role did financing versus investing activity play?” New analytical direction distinguishes operating cash generation from total cash movement. Referenced frozen rows p180/p182/p191/p192 contain investing activity, debt proceeds, financing activity and cash change; this direction was not addressed in the initial answer. This checks the suggestion's grounding, not the result of executing that follow-up. Capture `.research-runs/latency-1791927327466/cash-actions.json`.

168 tests, typecheck and build passed. UI now uses selected rows for evidence basis and a flat list of report links, with no excerpts. No manual visual browser check performed. The visible no-suggestion state is an explicit fallback, not an invented CTA.
