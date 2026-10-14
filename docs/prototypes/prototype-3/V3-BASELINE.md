# V3 production baseline — October 13, 2026

Local Git tag: `prototype-3-baseline-2026-10-13`.

Production: https://portfolio-research-agent-two.vercel.app/v3
Immutable deployment: https://portfolio-research-agent-hcalajd12-helenhshims-projects.vercel.app/v3
Deployment ID: `dpl_4c2P8cLWaSjmF6PAfMX4fvWX3kjS`.

This baseline preserves the current V3 source and release documentation. Production is already promoted and Ready; no rebuild or further promotion is required. Vercel Authentication covers All Deployments. Production has an independent $10 shared allowance; do not reset accounting when rolling back. Secrets are server-only and excluded from Git. The deployed candidate retains its live override; the project-wide Production live flag stays false for unapproved future builds.

Validation: 179 tests, typecheck, hosted build; three staged live answers and cancellation; final canonical-domain answer completed in 30.392s with five checked findings and one provider call. See evals/prototype-3/PRODUCTION-SMOKE-2026-10-13.md for checks and limitations.

Helen confirms the participant can access and supplied feedback. Further feedback review is deferred at Helen's request; no new human evaluation score is recorded.

For future experiments, branch from the baseline tag. For deployment rollback, use the immutable deployment ID rather than rebuilding the tag with potentially changed environment configuration. Previous production rollback target: `dpl_3Fob1oCp7AfNPJVKWKQ2hDJafSbu`. V2 baseline tag remains `prototype-2-baseline-2026-10-12`.
