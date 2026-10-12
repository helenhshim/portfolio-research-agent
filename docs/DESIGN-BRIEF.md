# Design planning handoff

Original handoff saved 2026-10-11. Current Prototype 2 direction (D61): a conversational research workspace plus a separate inspectable artifact, with compact credible styling. Open-ended intent is primary; optional suggestions support discoverability. Historical form/receipt directions below describe Prototype 1 and must not override this pivot. Implementation plan approval is pending.

## Prompt for the design session

Act as a product designer and brand designer. Help me define and iterate on the visual direction for a portfolio research agent through a guided design conversation. Explain tradeoffs in plain language and help me develop my design judgment.

Product goal: help finance professionals and investors understand what changed in companies they own, why those changes matter to their goals, and whether the evidence supports the conclusions. Address limited research capacity, generic summaries, verification work, fragmented tools, and privacy constraints. Provide decision support without buy/sell recommendations or target allocations.

Use docs/PRD.md and docs/DECISIONS.md as the current source of truth. The responsive Next.js web app will deploy on Vercel. Open directly on research setup: no invite gate, login, or A/B client selector. One sample client and up to five supported sample holdings (NVDA, AAPL, JPM, COST, JNJ). Bounded editable goal controls and holding selection are proposed, pending scope approval. Full personal portfolio entry, uploads, and brokerage connections are later features.

Explicit Generate brief action, followed by actual per-holding retrieval, analysis, and evidence-verification stages. Results show period/date, checked financial facts and changes, goal-relevant interpretation, evidence for different considerations, uncertainty, missing data, checked unchanged metrics, expandable evidence and original SEC links, up to three supported meeting talking points, run details, and partial-failure recovery. Distinguish reported facts from interpretation and describe checks precisely. Research uses public SEC structured financial data and earnings-release filing text.

Explore brand personality and naming, typography for headings/body/numbers/evidence, color and semantic states, input/progress/results/source layouts, density and hierarchy, cards versus tables, responsive behavior, loading/empty/partial-failure/completed states, and subtle motion.

Constraints: no UI emojis or em dashes; accessible contrast, readable typography, keyboard access, and clear focus; no color-only status; no streaming unverified claims; no extra features solely for visual effect; keep implementation details out of user-facing flows.

Process:
1. Ask three focused questions at a time, starting with desired feeling, liked/disliked references, and spacious versus dense interfaces.
2. Show concrete font and layout examples and explain their implications without assuming design vocabulary.
3. Propose three meaningfully different directions after answers, each with personality, specific fonts, hex palette, layout sketch, sample research card, and practical tradeoffs.
4. Help select and combine elements, then refine.
5. Log confirmed choices, open questions, and assumptions.
6. Finish with an implementable design brief and reusable tokens.

Begin with the first three questions. Do not write application code yet.

## Confirmed preferences, 2026-10-11

- Feeling: calm, credible research workspace.
- Reference: https://benji.org/ . Inspected visually: narrow reading measure, restrained Inter typography, generous whitespace, quiet grayscale, lightly divided rows, little decorative chrome. Browser-computed body font is Inter at 16px. Borrow qualities, not biography content or identity.
- Fonts: Helen is open to simple minimal alternatives.
- Density: show Brief first, Reading view, and Evidence desk alternatives before selecting; recommendation pending comparison.
- No font, palette, product name or final layout locked.

## Domain exploration for proposed layouts

Domain: earnings brief, fiscal period, source excerpt, evidence trail, client context, unresolved question, next-report watch item.
Color world: filing-paper white, printed-ink charcoal, pencil graphite, pale document gray, neutral binder gray, restrained blue of a source link. Use grayscale for primary structure; reserve semantic color for meaningful states.
Signature: each finding connects a reported signal to an explicitly labeled interpretation and observable watch-next question, with accessible evidence provenance.
Defaults to avoid: decorative KPI card grid (use a financial comparison row/table); chat transcript as the entire product (use question/evidence/result grouping); permanent heavy sidebar (use slim holding navigation and an inspectable trail).

Recommendation to explore: Brief first, which combines Benji-like reading clarity with expandable evidence. Reading view prioritizes calm review; Evidence desk prioritizes checking and comparison. All use the same sample inputs, source dates and NVDA data, so density rather than content drives choice.

## Minimal-output revision, 2026-10-11 (D42)

Helen rejected the report-like presentation as resembling a shorter Morningstar report. Prioritize user outcomes over report sections:
- Advisor: a credible meeting point and clear research follow-up.
- Analyst: a material development relevant to their thesis, with inspectable evidence; MVP only captures goals rather than a true analyst thesis.
- Investor: what deserves attention and a concrete question to revisit.

Proposed default per holding: one material signal headline, one brief goal-relevance sentence, one observable watch-next question, and source date. Hide supporting figures, excerpts, uncertainty details and trace behind accessible evidence disclosure, while keeping material uncertainty visible in the short summary. No forced headline where evidence is insufficient, no invented risk scores, and no claim to know current market conditions.

Explore Attention list (recommended), One signal (small quantitative comparison only when it explains the finding), and Meeting notes (advisor conversation). Preview text is edited from actual trial evidence but is not new verified engine output or proof of user usefulness. Final layout pending Helen's choice. This changes presentation priority, not source scope or agent autonomy.

## Premise-check direction (D43)

Supersedes the multi-holding attention-list as the immediate MVP design target. One company, one explicit holding rationale. Show the selected premise next to supported/untested parts and a concrete implication, with next decisive evidence and source detail on demand. Retain calm, minimal Benji-inspired typography. Avoid categorical buy/hold/sell, arbitrary confidence scores, or a dashboard of metrics. The same report can provide different evidence assessments for growth versus income, as the controlled trials demonstrate. Final preview must label edited presentation copy rather than pretending it is verbatim verified model output.

The premise-check preview compares two actually tested rationales with company sources and broad context fixed. Copy is edited for clarity. Selecting an example changes local presentation, not a live API run. Financial resilience is a supported input but not demonstrated by this preview.

## Quantitative evidence restored (D44)

Minimalism means a clear hierarchy, not removing substantive evidence. Show overall assessment and summary first, then up to three earnings drivers: number and eligible comparison, followed by one sentence explaining its bearing on the holding rationale. Keep unresolved evidence visible and detailed provenance expandable. The NVDA preview uses actual code-owned facts; growth highlights revenue, operating earnings and operating cash flow, while income highlights operating cash, dividend declarations and other uses of cash. Both overall assessments remain unresolved. No previous rating exists, so use “behind this assessment,” not “moved the rating.” Supersedes D42's default of hiding all supporting figures.

## Result hierarchy (D45)

Helen specified ticker as the result header. Immediately below, lead with an earnings takeaway that answers what the user wanted to learn from their selected rationale. Include the research question and concise implication in the takeaway block. Group numerical evidence below as subordinate supporting points, using smaller typography and indentation rather than equal-weight report sections. Keep unresolved gaps and next decisive evidence visible. Source detail expands; setup controls belong on setup, not above the result. The preview's example switch is tucked into a separate disclosure. Earlier selected Attention list and Brief first alternatives reinforce this concise, takeaway-led direction; the latest explicit hierarchy governs the one-company MVP.

## Receipt-inspired direction (D46)

References supplied by Helen: draw-entry summary, Jota Studio ticket, and VESITIA receipt. Borrow typographic hierarchy, aligned amounts and fine separators. Use a paper-and-ink surface without photographic props. Prominent ticker; smaller uppercase mono metadata and section labels; readable sans-serif takeaway/implications. Proposed pairing: IBM Plex Mono for ticker, labels and tabular numerals; Inter for prose. Use a 4px spacing base and border-only depth. Domain remains earnings evidence, fiscal period, holding premise, comparison baseline and decisive next question. Signature is an evidence receipt linking each financial quantity to the user's rationale. Palette is paper cream, ink charcoal, pencil gray, ledger-rule gray and dark paper counterparts. Evidence has three explicit columns: Metric / Value + comparison / What it means for you. On mobile keep metric and value paired, then implication on the next line. This replaces paragraph-style evidence rows in the preview. Aesthetic direction is approved by instruction; exact fonts and colors remain proposed for feedback.

## Qualitative business evidence (D47)

The receipt supports both narrative and numeric evidence. Use Signal / Evidence / What it means for you column labels. Narrative rows attribute management's demand explanation and company-reported production milestone; numeric rows retain prominent amounts and comparisons. Takeaway synthesizes both without asserting causality. Preview's new production point was checked against saved release p10 manually; automated engine selection remains pending. Preserve specific unresolved questions, and disclose incomplete retrieval as an investigation limit.

## User-approved content hierarchy (D48)

Keep receipt typography and ticker-first takeaway. For material evidence, make the user's approved three-part reasoning visible: What happened / What this means for your goals / What remains unanswered or watch next. Numeric values remain visually separated from labels within the evidence cell. The implication names a concrete goal/rationale mechanism; the unanswered component identifies the next evidence and an observable watch condition. Long-horizon input must affect the questions investigated, not merely produce a boilerplate durability caveat. Do not overload the result with an input-by-input checklist. This latest requirement supersedes generic implication copy in the current preview; revised engine content and preview remain pending.

## Full-report takeaway with selected numbers (D52)

Helen selected full-report analysis as most helpful. Keep receipt hierarchy; financial rows are selected because they explain the takeaway, not because the template always shows those metrics. Display Metric / Value + comparison / Why this supports or qualifies the takeaway. Retain qualitative business explanation and material counterevidence. Adaptive investigation appears only as a follow-up from an unresolved question. The current static preview is not yet generated by this revised selection logic.

## New MVP samples (D54)

Updated receipt preview shows a growth/long/medium example with current deployment evidence, selected operating-profit/net-income/operating-cash figures, repeat-demand/cash questions and an advisor discussion point. A disclosure shows an income/long/low example selecting operating cash, cash-dividend declarations and repurchases; actual payments remain unreconciled. Selection is manually edited to illustrate the approved output, not newly generated selection logic. No working adaptive-investigation button is shown. No portfolio weight/valuation inference.

## Actual paired-quarter output preview (2026-10-12)

Receipt preview now renders the reviewed live paired-quarter result: actual model headline/implication, Rubin prior/current evidence disclosure, the model's three selected financial rows (revenue, GAAP operating income, operating cash flow), material limitations, two watch questions, full generated advisor discussion on expansion and precise run/source details. Presentation copy is shortened where indicated; figures/selection are checked against the saved artifact and code packet. No invented adaptive button or live API call. This replaces the prior illustrative growth/income preview; the artifact is still a contained preview, not the production Next.js app.

## Compact deployed MVP (D57, 2026-10-12)

Helen accepted the result hierarchy and requested more compact type/spacing. Implemented paper/ink receipt layout, local Inter prose and IBM Plex Mono labels/figures, native selects/disclosures, ticker-first takeaway, paired qualitative evidence, three-column financial rows and mobile stacking. Setup retains the approved income/short/low/dependable-income defaults. The saved checked growth example identifies its own context and is not presented as analysis of edited inputs. No decorative dashboard, client selector, invite gate or fake follow-up control. Desktop/mobile/error recovery fixture checks pass; the protected deployed live check completed with the income-focused takeaway.

## Prototype 2 interaction direction (D61)

Thread: objective, short scope/action status, useful answer, follow-up or correction. Artifact: working question, direct answer, selected metrics with label/value/implication, supporting and qualifying evidence, unresolved questions and source dates. Avoid a required questionnaire inside chat or a growing transcript as the only deliverable. Desktop can show both surfaces; mobile needs an accessible switch. P0 delivers complete checked answers/artifact revisions; progressive checked findings and richer execution are P1. Earlier “chat transcript as the entire product” avoidance means preserve an artifact, not reject Helen's new thread direction.
