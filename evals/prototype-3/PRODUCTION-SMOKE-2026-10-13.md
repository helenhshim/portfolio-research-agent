# Protected production smoke — 2026-10-13

Candidate: https://portfolio-research-agent-hcalajd12-helenhshims-projects.vercel.app/v3

Deployment: `dpl_4c2P8cLWaSjmF6PAfMX4fvWX3kjS`. Ready, protected, not promoted. Research enabled only by this deployment's override. Project-wide Production live flag remains false. Source scope, model, verifier and call limits unchanged.

## Results

| Check | Result |
| --- | --- |
| Default durable operating profitability question | Complete in 29.042s; five checked findings streamed; one provider call, no tools. |
| Actual suggested follow-up: equity gains versus operating cash | Complete in 19.633s; two checked findings; distinguishes investment gains from operating performance and explains their cash-reconciliation effect. One provider call, no tools. |
| Exact previously failed non-GAAP equity gains/SBC question | Complete in 16.139s; two checked findings; consistent historical treatment and GAAP/non-GAAP distinction retained. One provider call, no tools. |
| Disconnect/Stop | Cancellation at 2.916s, stopped result at 2.917s. Unknown usage remains conservatively charged. |
| Unauthenticated candidate access | HTTP 302 to protection; authenticated CLI page/API access works. |
| Private file paths | `/.env.local` and `/.git/config`: HTTP 404. |
| Configured private-value exposure | Fifteen hosted HTML/JS/CSS/API/error-body files scanned against eight configured private values; zero matches. |
| Separate budget accounting | Preview $6.216481, Production $0.761433 recorded/reserved/estimated; independent $10 caps and Redis keys. Preview total unchanged during smoke. |
| Original production links | Canonical and generated team alias both still point to `dpl_3Fob1oCp7AfNPJVKWKQ2hDJafSbu`. |
| Local regression suite | 179 tests pass; typecheck passes; candidate hosted production build passes. |

## Failures caught and fixed

Initial staged candidates failed before provider execution because the approved secret transfer appended a newline to values. The Redis URL failed client initialization. Corrected Production configuration transfers exact values without adding a newline; credentials were never printed. Budget initialization now returns a typed safe error with content-free diagnostics, and a regression test confirms exception details do not leak.

The first staging command unexpectedly moved the generated team alias despite skip-domain. It was restored to the original production deployment. Final inspections verify both original production URLs; the successful candidate remains unpromoted.

## Evaluation limits and next step

Helen waived re-requesting/re-scoring the analyst feedback because it was already supplied in this conversation. This is not a new independent human evaluation pass. Three successful live responses establish this sample's behavior, not a broad reliability or latency guarantee. The exposure scan checks configured private values, not all possible confidential information.

The candidate is ready for a protected production promotion decision. Promotion/public access was not performed or authorized by these tests.

## Release attempt after smoke

Helen authorized remaining release steps. Promotion succeeded, but canonical production unauthenticated GET returned 200. This invalidates the assumption that staging protection proves canonical production protection. The project currently uses `all_except_custom_domains`. Project-wide `all` protection was rejected by automatic approval review as broader than existing authorization; no setting changed. Rolled back to `dpl_3Fob1oCp7AfNPJVKWKQ2hDJafSbu` and requested explicit approval before another promotion. The successful staged smoke results stand; production release is blocked on the access-policy decision.

## D118 Protected production release

Helen explicitly approves Vercel Authentication All Deployments for portfolio-research-agent and promotion. Updated project `prj_ljgUQ5SVZbnSM0V0wopAjv3kvuAs` to `ssoProtection.deploymentType=all`, then promoted the same tested production candidate `dpl_4c2P8cLWaSjmF6PAfMX4fvWX3kjS` without rebuilding.

Live V3 URL: https://portfolio-research-agent-two.vercel.app/v3 . Canonical alias inspection confirms the candidate. Unauthenticated GET returns 302 after promotion; authenticated page loads approved onboarding. Real post-promotion default research completes in 30.392s, one provider call, zero tools, five checked findings before the complete result. Production keeps its independent $10 shared counter. Credentials remain server-only. This deployment retains its explicit live override; global Production live flag remains false for future unapproved builds.

Project-wide protection now covers production and Preview; existing participant share-link behavior has not been retested. Prior production rollback target: `dpl_3Fob1oCp7AfNPJVKWKQ2hDJafSbu`. Pilot quality feedback remains the previously supplied feedback; no fresh independent score is invented. D117's failed access gate is resolved by the explicitly approved setting change.
