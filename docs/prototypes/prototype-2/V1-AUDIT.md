# V1 repository audit for the V2 decision

Audited: 2026-10-12. Basis: inspected implementation, bundled public source packet, existing release/evaluation records and exact Prototype 1 tag. This is a static audit, not a new live model or user trial. Local branch `prototype-2` includes unreleased D59 experiments; the frozen deployed baseline is `prototype-1`.

## Product experience: observed versus interpreted

| Handoff observation | What the implementation shows | Assessment |
|---|---|---|
| Excessive upfront configuration | Setup presents four selects: goal, rationale, holding period and risk. All are prefilled; NVIDIA is fixed. User can generate without editing. | The form is the primary interface, but four mandatory manual decisions are not required. Cognitive burden is Helen's observation to validate. |
| Limited open-ended intent | API accepts only the five bounded fields including ticker; rejects additional fields. No question/thesis text input. | Confirmed: the user cannot ask an arbitrary company research question. |
| User must plan the workflow | User chooses investment context; source preparation and synthesis are already program-controlled. | Partly inferred: user is not specifying execution steps, but must translate their question into our context taxonomy. |
| Limited progress | NDJSON emits preparing, analyzing and checking events plus heartbeats. UI displays the active stage. | Actual status exists. No substantive intermediate findings or evolving artifact appear before the final result. |
| Limited continuation/control | Results can return to input editing and start a new run. No thread, history, follow-up API, visible stop button or redirection. | Confirmed. Transport disconnection propagates cancellation, but that is not an implemented user-controlled conversational workflow. |

## Architecture and available capabilities

| Layer | Verified behavior | Reuse or change |
|---|---|---|
| [Workspace](../../../src/components/research-workspace.tsx) | React state holds one configuration and one result. NDJSON stage/error/result reader; receipt, source disclosures and fact tables; labeled saved example. No persisted session. | Reuse evidence/metric presentation and transport handling. Replace primary form, single-result state and forced receipt sections. |
| [Route](../../../src/app/api/research/route.ts) | One POST validates bounded inputs, loads bundled NVDA packet and calls paired synthesis. Same-origin check, Preview-only live calls, 2KB body cap, secret checks, heartbeat/cancellation/error handling. | Preserve server-side credentials and access controls. New question/history contract, request budgets and versioned event protocol needed. |
| [Input/output contracts](../../../src/lib/contracts.ts) | Five allowed input keys; enum goal/period/risk/rationale, one supported ticker. Output tied to one of three rationale IDs, profile fields and capped findings. Shared enums list five tickers, but live route only allows NVDA. | Cannot simply replace selects with a text box. Arbitrary research intent needs a new contract and question-specific output. |
| [Paired synthesis](../../../src/lib/paired-research.ts), [model client](../../../src/lib/engine.ts) | Live full-source path makes one Responses call with prepared facts and both complete releases, using gpt-6.1-sol/high/context-v1. No function tool definitions, tool-call dispatch or provider streaming. Entire JSON is parsed after provider completion. Older CLI planner/keyword search remains a different experiment. | Reuse provider/auth/cancellation and full-source discipline. Separate generic research answer from premise-assessment instructions. D59 fixed-ID/evidence-first candidate is local, default remains legacy/high. |
| [SEC client](../../../src/lib/sec.ts), [preparation](../../../scripts/prepare-quarter-pair.ts) | Offline acquisition uses real official SEC URLs, identified User-Agent, path allowlist, caching, pacing and bounded retries. Runtime reads a frozen packet and performs no SEC requests. Controls are per process, not deployment-wide. | Expose approved local packet access first. Runtime issuer discovery/refresh would require additional acquisition coordination; not already implemented. |
| [Source text](../../../src/lib/release.ts), [packet](../../../src/data/nvda-quarter-pair.json) | Parsed full text with paragraph IDs/table text and hashes. Packet contains 504 current/prior paragraphs, fiscal metadata and 10 comparisons. It is not a general structured table query engine. | Reuse approved full evidence and identifiers. Existing keyword lookup returns short hits and must not become the sole context for V2 synthesis. |
| [Financial facts](../../../src/lib/financials.ts), [display](../../../src/lib/view-model.ts) | Eight metric types in the packet: revenue, operating income, net income, EPS, operating cash flow, declared dividends, repurchases and productive-asset purchases. Eligible fiscal comparisons and arithmetic are code-owned. | Reuse definitions, calculation lineage and rendering. No gross/operating-margin fact exists. Derive GAAP operating margin from aligned operating income/revenue in code if that task is approved; gross margin needs additional checked facts. |
| [Checks](../../../src/lib/verifier.ts), [paired checks](../../../src/lib/quarter-pair.ts) | Shape, IDs, eligible facts, numerical-prose restrictions, normalized exact quote matching, dependencies and paired-period evidence checks. Unsupported dependencies are removed; interpretation support remains manual evaluation. | Retain these checks as primitives. Replace forced rationale/profile dependencies. Broader questions and quantitative quotes/product names may conflict with the conservative quantity ban. Citation entailment is not solved by matching. |

## Answers to the technical handoff

V1 uses real financial documents and generates live answers dynamically when the server key/Preview are configured. The explicitly labeled checked example is saved output. Retrieval exists as preparation tooling, not a live agent retrieval loop. Evidence identifiers originate in prepared paragraphs/facts; the model selects references and exact quotes, which code checks. Research state is local React state plus one in-flight request, not durable state or conversation memory. Existing functions can become approved tools after wrappers, argument validation and bounded dispatch are implemented; they are not tools today.

The app already streams status events. It does not stream model response tokens or checked artifact patches. Incremental results need independently checkable units, versioned events and a UI that can retain checked work through partial failure. Incremental JSON fragments are not complete verified findings. Contextual follow-ups require message/artifact history, question routing and source/version consistency; adding messages only on the client would not supply the model with research context.

## Risks and evidence limits

- Fixed rationale labels and a generic premise prompt cannot reliably answer every natural-language question. Silent conversion back into presets would defeat the pivot.
- Current source scope does not support Microsoft/Alphabet cloud comparisons, full 10-K risk analysis, market movement or current prices/news. Those are future capability tests or explicit unavailable responses, not P0 success cases.
- Known P1 reference failure: exact mixed income/growth case took 126.196 seconds and cited two nonexistent findings. D59 low-effort successful trials took 39–43 seconds; early incomplete calls/high timeout remain unresolved. Neither proves V2 performance.
- Multiple planning, clarification, tool and synthesis calls can increase latency/cost. One fixed source pair does not justify a separate mandatory planner call for every question.
- Free-text/history introduces possible sensitive data absent from the bounded input contract. Limit P0 to public-company research, avoid raw prompt logging, and define session retention; do not promise automatic anonymization.
- Old release text can answer historical questions but cannot establish the current world. Display report dates and source cutoff; treat newly requested evidence as missing.

No implementation code changed during this audit.
