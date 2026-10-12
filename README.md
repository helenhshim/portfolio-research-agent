# Portfolio Research Agent

An advisor-first earnings MVP: editable context → review of two complete NVIDIA earnings releases → checked takeaway, selected financial evidence and specific watch questions. Scope and decisions live in docs/PRD.md, docs/DECISIONS.md and docs/BUILD-PLAN.md.

## Prototype history

Prototype 1 is frozen at Git tag `prototype-1` and its original protected Preview. Current work is on branch `prototype-2`, including unreleased reliability/latency experiments. Start with [version guide](docs/PROTOTYPE-VERSIONS.md), [Prototype 1 learnings](docs/prototypes/prototype-1/LEARNINGS.md) and [Prototype 2 plan](docs/prototypes/prototype-2/PLAN.md). PRD revisions and package versions are separate from prototype releases. Git is local; no remote backup is configured.

## Run locally

Requires Node.js 24. Run `npm ci`, set `OPENAI_API_KEY` in ignored `.env.local`, then `npm run dev`. Open http://127.0.0.1:3000. Never commit or paste credentials. The checked example works without a key.

The web release supports NVIDIA only, with frozen public SEC snapshots for FY2027 Q2 and Q1, released August 26 and May 20, 2026. Goals, rationale, holding period and risk are editable. Code owns fiscal comparisons and source lineage; the model selects supporting and qualifying evidence.

## Verification

- `npm test`: 33 current local checks (30 at the Prototype 1 release checkpoint) for input, acquisition, fiscal arithmetic, evidence references and dependency removal. Local integration cases skip when their ignored source fixtures are absent.
- `npm run build`: compilation and TypeScript validation.
- `node scripts/check-web.mjs`: browser UI checks with a mocked research response; no paid model call.
- `LIVE_WEB_TEST=1 node scripts/check-web.mjs`: one explicitly paid local browser-to-model check.

## Deployment and architecture

Preview: https://portfolio-research-agent-asaf2pel7-helenhshims-projects.vercel.app

Vercel project: portfolio-research-agent, Helen's projects. This release is a Vercel-authenticated Preview. Configure OPENAI_API_KEY as a Secret for Preview. Credentials stay server-side; .env.local is excluded from uploads. Production live calls are disabled for this release.

The server makes one direct OpenAI Responses call using gpt-6.1-sol, high reasoning, both complete releases and validated inputs. Source preparation/arithmetic run before deployment. At request time it loads that checked packet; it does not fetch SEC. NDJSON reports actual preparation, analysis and checking stages, then the checked result. Model timeout: 180 seconds; route duration: 240 seconds. Failures preserve inputs and have no automatic paid retry. Client disconnects abort the provider request where propagated.

## Limits and next work

Quote/reference checks do not certify interpretation support. This explains one holding's rationale; it does not establish valuation, suitability or portfolio impact. No live prices/news/external macro, identity, weights, persistence, adaptive follow-up or scheduling. Browser result state is lost on reload. No firm-compliance or zero-retention claim; the request uses store:false.

The older focus/single-pass CLI and five-company source experiments remain comparison tools. `npm run data:probe` requires SEC_USER_AGENT; pacing is per process. Before runtime SEC fetching, implement aggregate acquisition controls. Before broad public paid access, complete access/spend controls and practitioner evaluation.

Bundled font notices: public/fonts/INTER-LICENSE.txt and public/fonts/PLEX-LICENSE.txt.
