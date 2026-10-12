# Target-user hypothesis review

2026-10-12. Desk research and product assessment; no practitioner interviews, field experiment or demand validation completed in this review. Full-report means the complete approved earnings release, not complete 10-Q/10-K/earnings-call coverage. Approved source scope is unchanged.

## Verdict

Full structured release analysis with takeaway-driven financial selection is a promising narrow approach, not established as the most valuable workflow for all wealth advisors or buy-side analysts. The evidence supports testing explanation, evidence selection and follow-up usefulness. Architecture sophistication, model reasoning effort and attractive presentation do not establish demand or workflow advantage.

Primary proposed beachhead remains wealth advisors who need to explain an individual holding (especially a salient/concentrated position) before a client conversation. Broad wealth-advisor research includes goals, taxes, liquidity and portfolio construction; the one-stock earnings tool does not replace that. Actual concentration, portfolio impact, suitability and progress toward goals cannot be inferred without corresponding client/portfolio data.

Buy-side analysts are a separate validation cohort. Generic growth/long/medium inputs do not encode a specific thesis, model assumption or expectation. The current enum rationale can support a narrow premise-check demonstration, not a full professional investment judgment. Their useful output hypothesis is what changed relative to a thesis/expectation, evidence supporting or weakening it, model-relevant operating drivers and the next research question. Need user research before adding custom thesis/expectations or licensed sources.

## Supporting sources and limits

- BlackRock Advisor Trends Survey: https://www.blackrock.com/us/financial-professionals/insights/inside-the-practice/advisor-trends-survey . Survey reports responses from >1,000 U.S. advisors; describes HNW complexity including concentrated stock, tax, legacy holdings and liquidity. Vendor-produced survey, not proof of demand for this tool or a stock-research priority across all advisors.
- Kitces & Carl, Structuring Client Reviews To Focus On What Matters Most (2020): https://www.kitces.com/blog/client-review-meetings-communication-questions-agenda-topics-value/ . Practitioner guidance favors goal/plan-focused conversations, with portfolio review one component. Older expert guidance, not current representative survey.
- CFA Institute, Equity Research Report Essentials (September 2020): https://www.cfainstitute.org/sites/default/files/-/media/documents/support/research-challenge/challenge/rc-equity-research-report-essentials.pdf . Industry/competitive analysis, valuation, financial drivers, footnotes, risks and caution against trend extrapolation. Research-report guidance, not a study of buy-side software demand. Helps locate gaps; does not require adding price targets/recommendations to our MVP.
- CFA Institute, Explainable AI in Finance release (September 2025): https://www.cfainstitute.org/about/press-room/2025/explainable-ai-in-finance-2025 . Role-specific explanations, auditable evidence and evidence for/against decisions support our reviewability/counterevidence direction; not validation of our specific implementation.

## Refined hypotheses

Advisor: For an advisor preparing to discuss an individual stock holding, a short earnings brief tied to the supplied goal and holding rationale, with relevant figures, material qualifications and a next question, reduces total preparation/review effort relative to existing research.

Analyst: For an analyst checking a specific holding premise after earnings, a source-linked account of developments and operating drivers that support/weaken that premise, with clear gaps and follow-ups, reduces initial reading/verification effort without missing material evidence.

Neither hypothesis claims long-term suitability, incremental alpha, full portfolio coverage or investment recommendation generation.

## Safeguards against confirmation bias in selection

Model reviews the complete approved source before selecting a balanced takeaway. Select figures that support OR qualify specific claims, including material adverse developments. Do not select a bullish narrative first and search for favorable numbers. Keep a lightweight internal coverage record of reviewed source sections and why material candidate signals were included/excluded; not yet implemented. Evaluate omission of important evidence, not only exact matches of evidence shown. Source completeness and causal entailment are separate from quote fidelity.

## Concrete validation plan (proposed pilot)

Recruit three advisors who discuss individual-stock holdings and three buy-side analysts; no messages sent or recruitment performed. Ask each to bring/describe a recent relevant research task and usual tools, without client identity or firm confidential data. Ask for their actual question/holding rationale rather than explain our product first. Capture whether earnings release is sufficient or what source/expectation is indispensable.

Compare the current baseline and full-report/selected-evidence output on matched source cutoffs; compare to the user's usual workflow or a matched ChatGPT baseline where available. Counterbalance task/order and use different matched tasks to reduce learning effects. A document-only arm isolates synthesis quality; a normal-workflow arm assesses realistic usefulness and source differences. Have participants produce a client explanation or thesis update, not merely rate aesthetics.

Measure total time INCLUDING generation, evidence checking and editing; accuracy/unsupported implications; missed material developments; accepted text versus substantive rewrite; ability to identify a useful next research action; whether the output is placed into a real work artifact and reused. Record different requirements by cohort. No current model trial or static preview is substituted for this pilot.

Proposed early signal, not statistical market validation: at least two of three participants in EACH cohort prefer the context-linked version for their task, show lower total effort, preserve material evidence and can name a specific useful next step. Zero observed critical unsupported claims in the reviewed pilot is necessary, not proof of a zero-error system. If advisors prioritize other jobs or analysts need unavailable context, narrow segment/task or stage the needed context; do not automatically expand MVP sources.

## Recommendation

Keep D52 as the implementation direction for the bounded advisor holding-explanation task. Treat buy-side fit as an additional hypothesis until thesis-specific task evidence is obtained. Preserve full-source review, selective financial evidence, counterevidence and explicit limitations. Adaptive follow-up is valuable only when it resolves a question that practitioners actually need answered. Run the task-based pilot before claiming this is their most valuable product approach.
