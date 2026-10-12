# Context-specific output examples and architecture

2026-10-11. Illustrative edited outputs based on the saved NVDA FY2027 Q2 release and code-owned facts. These are not new model runs or investment recommendations. D48 remains an implementation/evaluation requirement.

## Long-term growth
Inputs: NVDA / Grow my investment value / profitable_growth / long (>10 years) / low risk.
What happened: Management described infrastructure demand broadening across AI labs and Vera Rubin in full production. Operating profit was $63.73B, +124.1% YoY; operating cash flow $24.08B, +56.7% YoY.
Meaning: The narrative offers a potential route to continued demand, and results show current operating earnings/cash growth. For a long holding period, buyer breadth and execution matter only if sustained adoption and repeat spending persist across cycles. Low risk makes unresolved concentration and cash-conversion questions important; it does not establish a company risk rating.
Unanswered/watch: How concentrated is demand, and does product adoption lead to sustained operating profit and cash? Follow-up prompt: Find customer concentration and demand-commitment disclosures in approved SEC sources; distinguish orders/commitments from management expectations. Future watch: subsequent disclosure consistent with sustained demand and cash generation strengthens the premise; disclosed demand contraction or weakening cash conversion could weaken it. Missing disclosure stays unresolved.

## Shorter-period growth
Inputs: same as above except short (<3 years).
What happened: Same production milestone and current results.
Meaning: Production execution matters to delivery and revenue within the ownership window. A production announcement does not prove customer deliveries, near-term returns or upside relative to market expectations.
Unanswered/watch: Does deployment turn into reported adoption, revenue and operating profit over upcoming reports? Follow-up prompt: Identify production/deployment updates and disclosed delivery constraints in the approved release. Evidence outside it remains unavailable. This checks timing, not a price forecast.

## Dependable income
Inputs: NVDA / Generate ongoing income / dependable_income / long / low risk.
What happened: Operating cash flow increased; cash-dividend declarations are $6.047B, including paid and unpaid amounts. Actual cash payments remain unreconciled in the packet.
Meaning: Strong earnings are insufficient to establish dependable income. The relevant relationship is recurring cash generation and actual distributions after other commitments. No price feed means no dividend-yield or income-target assessment.
Unanswered/watch: Reconcile actual dividend payments and period-aligned cash requirements. Follow-up prompt: Reconcile dividend cash payments using filing/release bases before assessing payout support. Sustained payouts backed by recurring cash support would strengthen the premise; disclosed funding stress or payout cuts could weaken it. Missing reconciliation is an agent evidence gap, not a claim of funding stress.

## Technical flow
Validate/freeze five inputs -> retrieve approved SEC sources -> code creates period-aligned fact/comparison records -> model plans at most two premise/context-specific questions -> code performs bounded literal lookup -> model synthesizes evidence-linked findings/interpretations/watch items -> deterministic checks remove failed references/dependencies -> UI renders evidence/context/follow-up together.

Current engine: gpt-6.1-sol low effort via Responses API for two calls in focus mode. Planner outputs strict JSON; application runs lookup directly (no native function-calling loop). Analyzer outputs strict JSON. Financial math and eligible figures are code-owned. Source/reference/quote checks do not establish entailment or meaningful personalization. D48 input-specific refinements, joined output presentation and one-input-at-a-time evals remain pending. Source-aware follow-up execution, saved watch items and subsequent-filing checks remain D35 roadmap.

Required evaluation: unchanged facts across input variants; justified changes in questions/selected evidence/implications; specific mechanisms; correct attribution; explicit future uncertainty versus retrieval gaps; no unsupported price/suitability conclusions. Consider all inputs without forcing each to change every finding.
