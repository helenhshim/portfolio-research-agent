# MVP problem coverage and next actions

Recorded 2026-10-11. This is a design assessment, not measured product performance. No research engine or deployment has been built yet.

| Problem | Intended MVP contribution | Remaining gap | Action / evidence |
|---|---|---|---|
| Coverage exceeds capacity | Research 1-5 supported companies and condense their latest earnings into a sourced brief | No broad coverage, ongoing monitoring, news, or funds; may miss important developments outside releases | Ship focused core; test completeness and time against manual research; then saved watch items and relevant filing checks |
| Relevance to my context | Goal, holding period, and risk inform supported interpretations and watch questions | No user thesis, constraints, transactions, full portfolio, or firm context; generic or stereotyped reasoning remains possible | Fixed-source controlled input evaluations plus human judgment; later full portfolio and minimally scoped research intent |
| Verification tax | Code calculations, numerical checks, quote fidelity, source lineage, missing-data and failure states | Matching a quote does not establish entailment; a checked fact does not validate an interpretation; release and XBRL are the same issuer, not independent corroboration | Verify dependencies and source/period alignment; human evidence-support evaluations; measure review effort and accuracy together |
| Fragmented tools | Joins structured SEC facts, release text, and bounded user context | Does not integrate terminals, spreadsheets, news, CRM, or research destinations | Describe honestly as a narrow integration; add bounded evidence retrieval and saved research state first, then integrations based on practitioner demand |
| Privacy and compliance | Minimal non-identity inputs and documented source acquisition requirements | Not firm-approved; holdings/goals still go to server/model; retention, access, logs, and later persistence require decisions; no invite gate is not abuse prevention | Before release verify acquisition controls, avoid sensitive logging, define retention and run/cost bounds; review additional storage/access requirements before saving research |

## Useful forward-looking output without unsupported forecasts

Design watch-next items around observable signals, source-backed management outlook, and conditional implications. Missing guidance and unknown developments remain explicit. Numerical guidance requires a separate source verification path; current XBRL-actual rules cannot validate forecasts. Current-release commentary is not a demonstrated change unless comparison evidence is present. No claim to know present conditions beyond evidence freshness.

## Ordered action items

1. Finish MVP output contract: meaningful baseline, source/period dates, evidence-supported implications, specific watch questions, and honest gaps. Keep deterministic checks distinct from interpretation evaluation.
2. Prove actual data retrieval and compute comparable periods correctly; demonstrate no-data, verifier failure, and partial-success behavior. Assess optional filing activity metadata only if low effort.
3. Build and evaluate the core, design UI, deploy, and conduct practitioner tasks. Compare accuracy and time/review effort; do not infer usefulness from a working demo.
4. Next increment: saved watch item with immutable baseline and user-triggered Check new filings. Return evidence-supported strengthened/weakened/unresolved states; distinguish no filing from unanswered question.
5. Add result-grounded follow-up research. Route each question to approved retrieval/analysis tools within budgets, with supported answer or explicit limit. Evaluate follow-up completion.
6. Add scheduled checks only after manual-loop usefulness and notification/retention controls are established. News and price sources remain subject to access, reuse, and quality review.

## Agentic design assessment

MVP is a bounded research workflow with model-based relevance selection; a fixed pipeline and progress UI do not establish adaptive investigation. The later loop introduces state, comparison across time, task-specific retrieval choices, bounded continuation, and a stopping condition. Add autonomy when it closes a measured user gap, not to increase agent count. One orchestrated system can implement these capabilities; multiple separate agents are not a requirement.
