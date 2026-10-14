# V3 release verification — October 13, 2026

## Verdict

Protected pilot Preview is ready for further participant testing. Public production research is NOT release-ready. No production activation, production deployment or access-policy change occurred.

## Failure found and fixed

The first live profitability sample failed after 30.4s. Its first finding used thirteen approved fact placeholders but declared twelve. The reference metadata array was capped at twelve; the undeclared operating-margin reference caused a correct finding rejection and dependent verdict rejection.

D108: the provider adapter now completes metadata dependencies from approved placeholders in summary/detail, identically for incremental and final findings. Unknown references are not added, unknown declared references are not removed, and normal quantity/source/dependency verification still runs. The finding fact-reference array is bounded at twenty; other list bounds unchanged. No added model call, financial arithmetic, quote repair or inference certification. Prompt version v3-question-research-9. Regression tests cover approved completion, unknown references, preservation of prose and more-than-twelve dependencies.

## Results

| Gate | Evidence | Result |
|---|---|---|
| Automated source, safety, protocol, history and recovery checks | 171 tests, typecheck and optimized build | Pass |
| Profitability → revenue → repeat revenue | Real API, shared allowance, full frozen reports | Pass in sampled run; total and Data Center revenue/growth retained |
| Suggested question adds depth | Actually executed realized-revenue versus earlier outlook | Pass in sampled run; different comparison from historical revenue growth; next suggestion moved to gross margin versus earlier outlook |
| Missing management attribution | Same history, causal mix/pricing/cost/Rubin question | Explicit source-limited answer; no invented attribution; null suggestion appropriate because the obvious margin comparison was already discussed |
| Current market question | Current price and weekly movement | Explicit out-of-scope answer; no invented price or direction |
| Checked incremental output | Scripted provider with real controller and UI | Finding visible while Stop remained available; final checked answer rendered |
| Stop / reload / manual retry | Scripted browser fixture | Prior answer retained; no automatic reload call; check-failure message; retry completed a final checked answer |
| Session isolation | Separate browser contexts | Second context did not contain first context's history |
| Mobile / sticky header | Headless 390 × 844 browser | No horizontal page overflow; rail toggle works; header top stayed at zero while scrolling |
| Keyboard / action / sources | Saved checked reference in browser | Enter opens rail, Escape closes and restores focus; question text precedes separate Ask button; two SEC report links |
| Privacy | Current build: 73 client files, 46 Git revisions, tracked files, private file paths, error/log tests | No configured local secret matches; sensitive paths 404; no private user data used in evals |
| Shared spending | Real Redis disposable counter, independent ledger instances | Atomic cap, settlement, unknown usage and persistence pass; shared pilot key not reset |
| Hosted Preview | Authenticated page smoke, Vercel READY | Pass; deployment a3q4u7zrs |
| Production research | Runtime guard and environment-name inspection | Blocked: disabled in code; API and Redis variables only in Preview |
| Production abuse/access policy | Inspection | Pending: existing process-local concurrency and global monetary cap are not a per-user distributed rate limit; choose protected launch or implement public abuse controls before opening research |
| Independent analyst usefulness / first-use comprehension | Requires participant observation | Pending; no participant score fabricated |

## Live timings and limits

Corrected run captures: `.research-runs/continuation-1791932500701` (ignored, public fixtures). Profitability 28.2s; revenue 15.8s; repeat 16.7s; executed follow-up 10.1s; attribution 8.3s; current-market scope response 5.2s. Single samples, not a latency distribution or general semantic reliability claim. Only the revenue suggestion was executed in this run; its subsequent gross-margin suggestion was reviewed but not executed. The executed comparison cited the earlier revenue outlook passage and current reported revenue; no new derived numerical variance was presented.

Browser recovery used a scripted provider, not a second set of paid hosted API calls. Its proxy was corrected to preserve request path/method and route stateless history validation on the same origin. These are harness fixes, not product bugs. Current browser assertions wait for final checked retry content. Mobile screenshots and JSON evidence are saved alongside this report; no manual WCAG audit or comprehensive viewport sweep is claimed.

Local configured-value scans cannot certify all remote secret values, unknown private text, regulatory compliance or account security. History is browser-local public research: separate contexts are isolated; people sharing the same browser profile can see its saved history. Clear-history is available. No server-side account identity/history database exists.

Budget telemetry at one checkpoint showed $3.610208 reserved/estimated against the existing $5 cap; later calls may change this. No budget reset or increase occurred. Public access, production credentials and production spending configuration remain explicit release work.
