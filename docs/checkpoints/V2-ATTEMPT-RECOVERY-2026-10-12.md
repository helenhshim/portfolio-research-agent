# Priority 1: timed progress and recovery

2026-10-12 · D78 · Local preview. No deployment or paid provider test.

## Implemented

Each question owns its context snapshot, attempts and checked output. Retry appends an attempt to the question; previous failures and timings stay in expandable history. The current outcome appears once. Recovery distinguishes deadline, incomplete response, failed checks, Stop, rejected input, unavailable provider and resource limits using recorded state. It does not invent provider causes or new retry strategies. Retry resends the original question/context; actual stage history records any different tool path. Failed operational copy does not become model research context.

Actual HTTP stage events include server elapsed milliseconds. Completed action times use those boundaries; the active clock advances locally between events. Attempt total measures browser-observed elapsed time. Stop/interruption uses local observed time when a terminal server duration is unavailable. Timers stop on terminal states and update only the active StepLog; existing A3 pulse and reduced-motion behavior are reused. Briefs retain their producing attempt's completion time. Saved reference output has no fabricated run timing.

Checked artifacts belong to their producing attempt. A failed follow-up has no artifact; the previous answer and its Open this brief control remain available in the original turn. Obsolete attempts and post-Stop responses cannot replace outcomes. Priority 2 navigation/answer changes and Priority 4 persistence are not part of this implementation.

## Verification

- 83 tests pass, including retry grouping/context stability, timing boundaries, terminal freeze, stale attempts, prior artifact ownership, failure-copy grounding, history bounds and HTTP timing metadata.
- Typecheck and production build pass. React review: functional state updates; monotonic timer local to StepLog; interval cleanup; explicit turn/attempt identity; no timer ticks in live regions; native disclosure/button semantics and existing reduced-motion CSS.
- Browser exercised the real page and HTTP/controller/verifier through `node scripts/test-v2-ui.ts`, a localhost-only proxy with scripted provider responses. It supplies the existing frozen data, makes no external API calls and clearly marks its answer as a scripted UI test. Its artificial delays are not model performance measurements.
- Timeout followed by retry produced one question, two attempts, a completed checked artifact and preserved failed-attempt history. The executed tool path showed preparation, synthesis, approved metric inspection, second synthesis and checks, each with a retained duration.
- A later follow-up showed its timer advancing, then froze on Stop; no live animation remained after terminal state. Retrying that question with an intentionally invalid reference produced one check-failure response. DOM checks confirmed two total questions, an Open this brief control only on the successful first question, and exactly one current failure panel on the second.
- Screenshot: [grouped recovery](V2-ATTEMPT-RECOVERY-2026-10-12.png). It is scripted UI verification, not a new live-model quality result.

The harness is an explicit developer script outside app routes, binds only 127.0.0.1:3006 and requires the normal preview on port 3005. It is stopped after verification; production routing and provider choice are unaffected.
