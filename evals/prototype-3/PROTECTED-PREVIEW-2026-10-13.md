# D96 protected V3 Preview

## First deployed candidate

Source commit `70316c6`; deployment `dpl_E89jix6CrGhmqRnr31cmR6zcnihn`.
URL: https://portfolio-research-agent-mr11vuzps-helenhshims-projects.vercel.app/v3

Vercel build succeeds with Next 16.4/Node 24. Intended owner/team/project verified; encrypted `OPENAI_API_KEY` metadata is Preview-only. Values were not retrieved, printed or transferred. Local `.env*`, dev build output, `.vercel`, raw research captures and older untracked product drafts are excluded from upload. CLI authenticated access creates/caches its standard project protection-bypass credential; it is not put in source, output artifacts or the browser URL. It does not disable SSO.

Unauthenticated GET requests to page/research/history return 302 to Vercel SSO. Authenticated `/v3` returns 200 with Clear history/restoration UI and no local configured key in HTML. In-app browser without its own Vercel login lands on sign-in; no interactive login or protection weakening was attempted. The deployed frontend is not claimed browser-tested behind that sign-in.

One public NVIDIA profitability run returns HTTP 200/complete, six checked findings, one provider call/zero tools, no dropped references. First checked finding: 12.126s; completed result: 43.344s. Provider first text: 5.803s; provider generation: 43.318s. No model/prompt/output/source change. This single smoke trial is not semantic grading or a statistically established performance result. Numeric provenance remains code-owned (54 reported, 21 derived facts).

A second public request is disconnected after two seconds. HTTP streaming had begun, but original runtime logs still show provider progress after twenty seconds. Vercel cancellation is opt-in; the initial candidate therefore fails the hosted upstream-cancellation gate despite local abort tests. Evidence comes from actual diagnostics, not absence of a result in the client.

## Fix and retest

Enable `supportsCancellation` specifically for `src/app/api/v3/research/route.ts`, retaining the existing abort chain and adding content-free cancellation diagnostics. Reference: https://vercel.com/docs/functions/functions-api-reference#cancel-requests . No new workflow engine, worker registry, provider, source or reasoning step.

154 deterministic tests and typecheck/build pass, including request-abort propagation and diagnostic sanitization. Restored sessions keep their prior activity timestamp. New protected Preview and actual cancellation retest are pending as of this source checkpoint; append results rather than replacing the original failure.

## Remaining gates

Production remains unchanged/live V3 research disabled there. Instance-local $1 reservation/estimated ledger and one concurrent run are not a deployment-wide hard cap. Resolve aggregate spending/provider project limits and auto-recharge assumptions before wider sharing. Previously pasted credential revocation is not verified. Participant recruitment and pilot results are not fabricated; protocol prepared separately. Latency tuning remains a separate experiment, with current observed 43s final result as a baseline. Browser history is per origin, so localhost history does not transfer to a new Preview hostname.
