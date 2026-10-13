# D98 hosted journey and credential checks

Tested authenticated Chrome against the stable protected V3 alias on 2026-10-13. Runtime: `43d315b`, deployment `dpl_BWVftmYjXFm8vtWJNXtb1bg9FVXk`. No runtime changes or new deployment in this checkpoint.

## Executed browser checks

- Reloaded the stale hosted tab; existing saved answers restored and the cross-tab conflict notice cleared. Created a separate QA session; original research retained.
- Default profitability question completed: UI reports **31s**.
- Cash-flow follow-up stopped at **5s**. Previous checked answer remained, no new answer was published, and manual Retry was offered.
- Reload restored both the checked answer and stopped attempt without automatic generation. Retry stayed within the same question as Attempt 2 and completed in **25s**.
- Rubin execution follow-up completed in **23s**. A checked finding was visibly present at an observation about **9.3s** after submission, before the final verdict. This is an observation bound, not exact first-finding latency.
- Four Rubin finding positions measured at 1426, 1691, 1920 and 2185 viewport pixels while the verdict was pending were identical after completion. No scrolling occurred between measurements.
- Excerpt inspection opened with reported source text, source period, units and accounting basis; close returned to the answer.
- Actual Source click opened the SEC release with highlighted outlook and gross-margin text. Direct automated navigation did not activate the fragment; the real anchor click did. Browser/source matching remains best effort; internal Excerpt is the reliable fallback.
- Narrow viewport override 390 × 844: session drawer opens/closes; document client width and scroll width both 375, so no document horizontal overflow. Reset override afterward.

Screenshots: `D98-HOSTED-MOBILE.png`, `D98-HOSTED-SOURCE.png`.

Three successful public research turns and one stopped attempt were initiated. These are journey checks, not a controlled latency experiment or new semantic-quality scores. The sampled hosted log retrieval did not return terminal cancellation/usage events for this run; upstream cancellation retains its independently measured D96 evidence, not a new D98 assertion.

## Repeated privacy audit

Ran `scripts/audit-v3-privacy.ts` against a temporary local Production-mode server using the existing optimized build, then stopped that server. Output contains counts only.

- Three private configuration values checked across 73 client files: zero matches.
- Current configured key: zero matches in tracked files and 43 Git revisions; zero sensitive files tracked.
- `/v3` 200 without configured secrets; `/.env.local`, `/.env`, `/.git/config`, `/.research-runs/result.json` all 404.
- Research GET 405; Production-mode research POST disabled with 503.

This verifies those specific exposure paths for the configured local values. It does not prove revocation of a key pasted in chat, complete account security, or regulatory compliance.

## Still open: aggregate spending and key rotation

The existing $1 ledger is per process and resets on restart. No deployment-wide cap is implemented. Existing Vercel integration inventory is empty (CLI authenticated read; connector returned 403).

Proposed shared counter: Upstash Redis free plan, Preview only, `iad1`, eviction false, auto-upgrade false, production pack false. Store counters/reservations only, never keys/questions/answers. Reservations must be atomic before each provider call; unavailable budget storage must fail closed. Keep unknown-cost interrupted calls charged conservatively and never silently reset the shared allowance on deployment.

Automatic approval review rejected resource provisioning because it adds a third-party service with potential terms/billing exposure. No resource was created. Helen asked why the integration is needed; explanation provided, approval remains pending. No implementation or paid-plan commitment is claimed.

Confirmation that the previously pasted API key was revoked and replaced in local and Preview environments is also pending. Never ask for the key in chat.
