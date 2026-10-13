# D99 shared Preview spending allowance

Helen approved the free Redis integration and confirmed completing marketplace terms on 2026-10-13. Provisioned `portfolio-v3-budget`, resource `store_tYbwok5sqdQ8TOqh`, through Upstash/Vercel; requested free plan, iad1, eviction=false, autoUpgrade=false, prodPack=false. Connected to Preview only. CLI environment metadata confirms all Redis variables are encrypted and Preview-only. No paid plan or Production connection requested.

## Runtime policy

- Server-only Redis access. Every deployed Preview provider call reserves estimated maximum cost atomically before OpenAI fetch. Local development retains its per-process guard.
- Shared **$1 total allowance** under `portfolio-research:v3:preview:budget:1`, across current/new Preview instances using this build. No daily reset, TTL or redeploy reset. Raising/resetting it is a deliberate operator action, not a client control.
- Integer microdollars; conservative input-byte bound at $2.50/million, output maximum 5120 tokens at $10/million, default service tier. Pricing assumption inherited from the standard GPT-6.1 Sol policy and must be reviewed if model, tier, output limit or prices change. This is an estimated API admission bound, not an invoice/tax/hosting cap.
- Atomic usage settlement releases only unused reservation. Repeated settlement cannot refund twice. Missing usage retains the whole estimate; settlement failure retains reservation. Store timeout/failure blocks new calls with a sanitized message. Stopping after reservation can conservatively consume allowance without a completed answer.
- Only counter totals and random reservation IDs go to Redis. No questions, answers, portfolio details or API keys are stored in the counter. Credentials remain server-only; local Preview configuration is in ignored `.env.preview-budget.local` and excluded from deployment.
- Older immutable Preview deployments still contain their earlier guard. The new shared cap does not retroactively govern those URLs, other API clients or stolen keys. Keep access protection enabled; key revocation remains a separate gate.

## Executed checks

- 159 deterministic tests pass; typecheck and optimized build pass.
- Real Redis isolated test (no model calls): eight simultaneous clients, cap 100,000 microdollars, each reservation 51,450; exactly one admitted. Duplicate settlement charged exactly 1,250 once. New client retained that total. Unknown-usage call retained 51,450, resulting in 52,700; subsequent reservation denied. Temporary QA hash removed; actual Preview allowance untouched by this test.
- Unit tests: budget exhausted, invalid store reply, store exception all fail closed; settlement outage retains the reservation and does not suppress an already checked answer.

Deployment verification recorded below after completion. Previously pasted API key revocation remains unconfirmed.

## Hosted verification

Deployed to protected Preview `portfolio-research-agent-45g6ppaa8-helenhshims-projects.vercel.app` (deployment `dpl_4AkifeYdodytDzgrsvEy5TrsToyx`). One public default research call completed in 29,321ms with one provider call, zero tools and five incremental findings. The actual shared hash showed $0.403948 reserved with one outstanding reservation during the call; afterward it showed $0.101480 estimated spending and zero outstanding reservations. No budget reset performed. Approximately $0.898520 remains under the initial $1 allowance.

Unauthenticated `/v3` returned 302. Updated only the stable V3 alias to this Preview; Production/V2 aliases unchanged. Local optimized client output: 17 files scanned against Preview API/Redis credentials, zero matches. No new quality or controlled latency claim.
