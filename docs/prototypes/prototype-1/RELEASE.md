# Prototype 1 release record

Released and archived: 2026-10-12. Owner: Helen Shim. Decisions: D57–D60.

**Experiment:** Can complete earnings releases, interpreted for an investor's stated context, produce a useful and inspectable advisor holding explanation?

**Live baseline:** https://portfolio-research-agent-asaf2pel7-helenhshims-projects.vercel.app

Vercel deployment: `dpl_G6JTjBBTzXu8cfCbbBea3sQc8tLE`. Protected Preview; owner access is required. Git tag: `prototype-1`. The exact uploaded application consists of the 36 files in [source-manifest.json](source-manifest.json); every recovered file matches its upload SHA-1. Archival documentation and ignore rules accompany this snapshot. No credentials are archived.

## What shipped

- One NVIDIA holding; editable primary goal, holding rationale, expected holding period and risk tolerance. One sample setup, no client selector or invite stage.
- Frozen official SEC NVIDIA FY2027 Q2 and Q1 earnings releases, released August 26 and May 20, 2026. Complete approved release text, prepared facts and eligible quarter comparisons; no live prices, news or external macro data.
- Setup → actual preparation/analysis/checking progress → ticker, takeaway, supporting qualitative evidence, selected code-rendered financial rows and watch questions. Compact receipt-inspired presentation and a labeled checked growth example.
- One direct Responses API synthesis: `gpt-6.1-sol`, high reasoning, context-v1, store:false. No runtime source fetching or autonomous follow-up investigation. Code owns numbers, source lineage and mechanical checks; the model selects and connects evidence.
- Server-side Preview secret, same-origin check, propagated cancellation, 180-second provider timeout and 240-second route limit. No automatic paid retries; production live calls disabled.

## Recorded outcomes

The release checkpoint recorded 30 passing tests, a successful build, desktop/mobile checks and a live deployed run of 131 seconds. That live run retained its takeaway/core findings and removed two comparative items. Those historical tests are documented in the working project's release checkpoint; they were not among the 36 uploaded application files.

Helen then found a valid income / profitable-growth / short / medium input that produced no verified takeaway after a long wait. Recent deployed runs took about 123–160 seconds. Exact local reproduction took 126.196 seconds: the assessment referenced five findings, while only three had been emitted. Hard reference checking correctly rejected it. This is an output construction failure, distinct from an honest unresolved company question.

## Limits

This is a release-only single-holding explanation, not a complete portfolio analysis. No valuation, suitability assessment, live market monitoring, saved user history, report refresh, next-filing checks or adaptive follow-up. Result state is lost on reload. Citation matching and reference validation do not certify interpretation support or compliance. Practitioner value and advantage over a comparable chatbot remain unproven.

## What the archive does and does not include

The tag preserves the exact deployed application, lockfile, bundled public evidence and fonts/licenses, with release metadata. Environment variable values, ignored local raw traces and Vercel account settings are excluded. Source hashes establish code identity; rerunning the same model does not guarantee identical answers. Prototype 2 local experiments must not be described as deployed Prototype 1 behavior.
