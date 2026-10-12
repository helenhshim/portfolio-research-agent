# PRD: Portfolio Research Agent (working name)

Owner: Helen Shim · Status: v0.31. Prototype 1 frozen; Prototype 2 discovery and local candidate evaluation · Last updated: 2026-10-12
Build tool: Codex, on OpenAI models.
Decision log: `docs/DECISIONS.md`. Every decision is logged there, and the affected PRD section is updated in the same change.
Prototype history: `docs/PROTOTYPE-VERSIONS.md`. Prototype numbers describe product experiments, independently of PRD revision numbers. Prototype 1 is preserved at Git tag `prototype-1` with its exact deployed source and original protected Preview. Current local experiments are on `prototype-2`; they are not a second released prototype. Start the next iteration with the learning review and task validation in `docs/prototypes/prototype-2/PLAN.md` before expanding scope.

---

## 0. Why I'm building this

I need to show that I can do the job of a Product Manager, Financial Services at OpenAI:
- find a real problem in a financial workflow
- prototype an agent with OpenAI models and Codex
- define what "good" means for professional financial work
- measure it and improve it from evidence

The same work should also be good evidence for Google DeepMind's PM, New Consumer Verticals role, which covers consumer personal finance, agent design, and evals. And it should be useful enough that I use it on my own portfolio.

The problem comes from my own experience. As a Wealth Management analyst at Morgan Stanley, I printed Morningstar reports and manually checked holdings, profiles, and spreadsheets across tools that didn't talk to each other. I want to build the agent I wish I'd had.

**Order of priority for every decision:** (1) OpenAI FinServ PM evidence, (2) DeepMind NCV evidence, (3) personal usefulness.

## 1. Problem

### Problems at a glance

1. **Coverage exceeds capacity.** More companies and documents to follow than hours available.
2. **Relevance to my context.** Finding the changes that matter to my thesis or my client's goals.
3. **Verification tax.** Unverified AI output adds checking work.
4. **Fragmented tools.** Information lives across terminals, filings, spreadsheets, and PDFs. The human becomes the integration layer, copying and cross-checking by hand.
5. **Privacy and compliance, a constraint.** Sensitive client data limits which tools firms can use, blocking automation where client context would be most valuable.

These problems lead to the product's core approach: join the sources, interpret them for the client, verify the evidence, and minimize the client data required. The context model below explains why the problems occur; the practitioner questions test whether they still hold today.

### Root cause: context is fragmented

Good financial research depends on context. Our hypothesis is that fragmented context, evidence presentation and review work are major bottlenecks alongside model limitations. Source completeness, task design and reasoning quality must be tested separately; we have not established that model capability alone is sufficient.

| Context | What it is | Where it lives today |
|---|---|---|
| Company | Filings, earnings, financials | Terminals, SEC EDGAR, PDFs |
| Market | Peers, trends, what funds own | Bloomberg, Morningstar, news |
| Client or investor | Goals, risk tolerance, constraints, history, thesis | CRM, notes, the advisor's head |
| Firm | House views, approved lists, compliance rules | Internal docs, compliance systems |
| Output | Where the work ends up | Excel, decks, client emails |

### Symptoms

1. **Coverage exceeds capacity.** People follow more companies and clients than they can read and connect by hand.
2. **Generic output.** Without client context, AI tools give everyone the same answer, so the professional still has to translate it for each client.
3. **Verification tax.** Context joined by hand gets re-checked by hand. Unverified AI output adds checking work instead of removing it.
4. **Swivel-chair workflow.** Copying, printing, and cross-checking across several tools to answer one question.

### The catch

5. **Privacy and compliance.** The most valuable context, client data, is also the most sensitive and regulated. Firms restrict how tools can access and process it, which can prevent automation where client context would help most.

**The central design tension:** the agent needs client context to be valuable, but firms must control how that context is exposed and processed. The product has to solve both at once.

### Problem statement

Doing financial research well depends on context: the company's filings, the market around it, and the client's or investor's goals. That context is spread across terminals, filings, spreadsheets, CRMs, and people's heads, so the analyst becomes the integration layer, joining and re-checking it by hand. AI summaries don't fix this. Without client context they're generic, unverified output adds checking work, and the most valuable context, client data, is the hardest to use safely.

### Assumptions to validate

- My experience is about 6 years old. Excel AI and connectors have improved since then, so fragmentation may be partly solved. Ask practitioners: "How many tools do you touch to answer one question about a company or client? What do you still do by hand?"
- Advisors mostly rely on firm research rather than researching individual stocks. Their pain is translating events to each client and preparing for meetings.
- Verification time is a large share of total research time.

## 2. Users and their problems

| Priority | User | Immediate job | What a useful MVP delivers |
|---|---|---|---|
| Primary, first MVP task | Wealth advisor who discusses individual-stock holdings | Prepare a defensible explanation of an earnings report before a client conversation | A concise update tied to supplied goals and holding rationale, selected financial/qualitative evidence, material qualifications and a useful watch question |
| Primary target, separate validation track | Buy-side analyst | Check developments against a specific holding premise and identify the next investigation | Evidence supporting or weakening the premise; current bounded inputs demonstrate a narrow premise check, not a complete professional thesis/valuation update |
| Personal use | Helen, self-directed investor | Understand whether reported developments support the reason for owning a company | An evidence-linked explanation with explicit unanswered questions |
| Later exploration | Other analyst/VC discovery workflows | Broader company research or discovery | Not a first-release promise |

The advisor goes first because the bounded holding-explanation task fits the approved inputs and one-company source scope. Buy-side fit must be tested separately; broader goals and an enum rationale do not capture analyst expectations, models or proprietary theses. No role selector or additional input is introduced by this positioning change. Audience needs and actual time saved remain hypotheses.

## 3. Goals

**MVP user goal:** “When a stock holding reports earnings, help me explain the developments relevant to the supplied goals and reason for owning it, with the evidence and a clear question to keep watching.”

**MVP product goal:** Help wealth advisors prepare a concise, evidence-backed explanation of one stock holding after earnings by connecting the complete approved earnings release and code-owned financial facts to the supplied goal, holding rationale, holding period and risk tolerance. Select the figures and qualitative evidence that support or qualify the takeaway, and identify a concrete unresolved/watch-next question. Test whether this reduces total preparation, checking and editing effort relative to existing research.

**Analyst validation goal:** Test whether the same evidence-linked premise-check approach helps buy-side analysts perform an initial earnings review. Do not claim full thesis coverage, investment suitability, valuation or alpha.

**Longer-term vision:** Extend the validated workflow to persistent watch items, next-filing checks, bounded follow-up investigation and relevant portfolio/firm context. Broad company/market/client integrations remain a roadmap, not an MVP capability.

**Success measures:** total time to a review-ready explanation (generation + source checking + editing); supported factual/interpretive claims and material omissions; substantive rewriting; relevance to actual practitioner questions; and usefulness of the next research step. Source-opening frequency alone is not success: inspecting evidence can be appropriate.

**Demo moment:** One input configuration produces a ticker-first takeaway, qualitative business explanation, selected financial rows and an unanswered/watch-next question with expandable sources. One-company runs compare context sequentially behind the scenes; no A/B selector or forced differing conclusion. Demonstrate actual checked behavior, then evaluate usefulness against manual/ChatGPT workflows.

## 4. Evidence this project must produce

The hiring manager evaluates whether I can run the PM loop, not the product itself. Each row comes from the OpenAI JD.

| JD asks for | Evidence this project produces |
|---|---|
| Build working prototypes with Codex and OpenAI tools | A deployed agent built in Codex on GPT models |
| Sit with customers and learn the data they trust | Notes from 3-5 practitioner sessions (Stern IB friends, a wealth advisor) |
| Bring together models, financial data, and enterprise knowledge | MVP joins issuer release text, code-owned SEC facts and bounded goal/rationale inputs; broader market/firm context remains roadmap |
| Translate integration, data-access, privacy, and review requirements into product decisions | Data minimization by design, an audit trail, and logged privacy tradeoffs |
| Turn real tasks and failures into evaluations | Source-based tests, practitioner task reviews and failure records; in-product feedback controls are later scope |
| Define good across accuracy, traceability, completeness, ease of review | Automated citation checks and a published accuracy score |
| Tell a model limitation from a data, workflow, or design problem | Every failure tagged by cause: model, data, workflow, or design |
| Measure task completion, output acceptance, time saved | Useful / Not useful / Wrong rates, time to trusted answer, verification tax |
| Tradeoffs across quality, latency, reliability, cost | Logged model choices with cost and latency per run |
| Judgment on trust and accuracy in consequential work | Decision support, not advice (section 5) |

## 5. Product principles

1. **Context guides relevance.** Consider all inputs and change selection/implications only when justified. Identical evidence can warrant the same conclusion across profiles; cosmetic differences are not evidence of personalization.
2. **The agent is the integration layer.** It pulls from multiple sources, cross-checks them, and returns one view, so the user isn't the one joining tools.
3. **Every claim is traceable.** Numbers come from structured SEC data and are computed by code. Quotes are checked word for word against the source by code. Anything unverifiable is dropped and counted, never shown as fact.
4. **Privacy by data minimization.** The MVP collects only a ticker, goal, holding period, risk tolerance and bounded holding rationale. Portfolio weights, detailed needs and constraints remain later scope. It never collects or sends names, emails, account numbers, or other direct client identifiers. Holdings and goal parameters are processed server-side and sent to the model. This minimizes identity exposure; it does not establish anonymity or firm approval.
5. **Reviewable by compliance.** Every brief carries its sources and a record of what the agent did and which data it used.
6. **Decision support, not advice.** Explain evidence supporting, challenging or leaving the supplied holding rationale unresolved. No buy/sell recommendations, target allocation or implied suitability/valuation judgment.
7. **Make limits specific.** Distinguish future uncertainty, absent disclosure, conflicting evidence and retrieval gaps. Report unchanged measures only when actually compared; evaluate material omissions without forcing a long report.

---

## 6. What it must be able to do

**MVP job: prepare an individual-holding earnings explanation.**

1. Accept the approved bounded inputs for one company; validate and freeze them for the run.
2. Retrieve the complete approved earnings release and structured financial data, preserving source dates, table headings and calculation lineage.
3. Review the source in full; select a material takeaway tied to the supplied context, including evidence that qualifies or challenges it.
4. Show what happened, what it means for the supplied goals/rationale, and what remains unanswered or should be watched.
5. Select up to three eligible financial rows that explain the takeaway; render labels, code-owned values, units and comparison bases. Include attributed qualitative evidence and material qualifications.
6. Provide a brief advisor discussion point derived from the same supported evidence; no separate synthesis model call or mandatory three-item talking-point list.
7. Expose exact source links, precise mechanical checks, unresolved data and run/retry status. Checks do not certify interpretation support.

**Later jobs:** saved watch items, next-filing comparisons and adaptive follow-up, then additional portfolio/thesis/firm context validated against user tasks. Discovery and ongoing market monitoring are not part of the initial job.

## 7. Scope by milestone

| Milestone | In | Out |
|---|---|---|
| **MVP, first release (D57)** | One sample configuration; approved editable goal, rationale, holding period and risk; NVIDIA only; two complete frozen SEC earnings releases plus code-owned facts; high/context-v1 synthesis; takeaway, paired business developments, up to three selected supporting/qualifying metrics, up to two watch questions, discussion point and inspectable evidence; compact responsive Next.js UI; protected Vercel Preview. | In-app gate/login, A/B client selector, other-company web coverage, full personal portfolio/thesis entry, live SEC refresh, prices/news/consensus/valuation/external macro, scheduled monitoring, adaptive tool loop, persistence, exports, firm integrations and public paid access |
| **V1, prioritized research continuation** | Saved evidence/watch baselines, user-triggered next-filing checks and bounded adaptive follow-up (D35/D51), with source lineage and useful unresolved stops. Additional input/context only after task validation. | Unrestricted browsing or automatic expansion to licensed sources |
| **Later roadmap** | Full personal portfolio context, drift analysis, feedback controls, exports, discovery, risk-factor comparison, market/firm integrations and scheduling, prioritized from user evidence. | No automatic commitment to all roadmap items for the next release |
| **Never** | Source-linked research and reviewable limitations | Buy/sell recommendations, target allocations, specific buy-this tickers, client identity collection |

**Sample client (no identity):** retiring in 3 years, income focus, low risk. No client selector in MVP.

**First-release web coverage (D57):** NVDA only, shown directly. Local source/CLI experiments retain NVDA, AAPL, JPM, COST and JNJ; those are not additional web coverage. Multi-holding research remains deferred.

**Evaluation-only comparison:** retain a long-horizon, growth-focused, high-risk goal fixture with AI interest for controlled context tests. This is not a second client in the user flow.

**Data realism (D27):** use real public SEC company data from the start. The sample client uses illustrative goal parameters, not a real client record. Switching from presets to user-entered goals in V1 increases realism; it does not itself establish that the model uses context well.

**Context-validation sequence (D26):** test the sample goals and an evaluation-only alternative against identical holdings and company-source snapshots during MVP evaluation. The UI does not need to show both at once or run both automatically. In V1, use a user-entered goal profile, including Helen's own if desired, and compare with a controlled variation of a goal parameter on the same source snapshot. Evaluate justified differences in implications while requiring consistent company facts. Treat context sensitivity as a hypothesis until supported by evaluation results.

**Cut list if behind** (cut in this order):
1. feedback buttons: cut from MVP, approved under D22
2. full personal profile entry: deferred; bounded MVP research controls restored under D30
3. portfolio drift flags: cut from MVP, approved under D22
4. multi-holding research: already narrowed to one company per run under D43

**Never cut:** the verifier, sources, or the ability to test the same company data against different profiles. Context testing can happen through sequential runs and evaluation; simultaneous display is not required (D25-D26).

### Follow-up research roadmap (D35)

Helen explicitly requested a later workflow that checks new filings against saved watch items and supports further research prompted from results. This is a roadmap commitment, not a background task created now or an implemented MVP capability.

- MVP output design should make watch items actionable: ticker, research question, original evidence/period, relevance to goal and holding period, concrete observable signal, and evidence that would strengthen or weaken the interpretation. Exact schema remains part of the output contract.
- First follow-up increment: explicitly save a watch item, then user-trigger Check new filings. Retrieve approved SEC sources, align reporting periods and metric definitions, compare with the saved baseline, and return strengthened / weakened / unresolved with evidence. No new relevant filing must be distinguished from a filing that does not answer the question. No threshold or probability invented by the model.
- Enable targeted follow-up prompts from a result, such as Explain this uncertainty or Check whether this pattern persisted. Each becomes a bounded research task tied to the result’s sources and input configuration, with approved tools, retrieval/cost limits, verification, and visible unavailable-evidence states. Requests outside coverage must be explained rather than answered without evidence.
- Later automation: scheduled checks after relevant filings, deduplication, versioned watch items, and notifications only for meaningful evidence changes. Define notification preferences and retention/access controls before enabling persistence or scheduling. No scheduling or messaging is authorized by this roadmap alone.
- Acceptance criteria: correctly identify relevant new evidence, maintain baseline/source lineage, justify update status, avoid unsupported causal/forecast claims, and reduce follow-up effort in practitioner tests. Record false alarms, missed updates, retrieval failures, and useful follow-up completion.

Full problem-gap assessment and implementation order: docs/MVP-GAP-ASSESSMENT.md.

## 8. How it works

### Data sources

**MVP access rule (D23):** exclude any research data source that requires an extra login, paid subscription, or credentialed connector to obtain its data. Use public SEC research endpoints and filing documents. Public access alone does not establish reliable application access or extraction quality; verify both at the data checkpoint. OpenAI and Vercel credentials are infrastructure setup, not research-source logins.

**SEC acquisition and reuse requirements (D24):**
- Use official public research APIs for metadata and financial facts, plus targeted downloads of filing indexes and EX-99.1 documents. SEC permits scripted access and reuse of public EDGAR filing content. HTML parsing of a downloaded exhibit remains subject to the same access rules; API access alone does not establish compliance.
- Send the configured `SEC_USER_AGENT` identifying the application and an operator contact on every SEC request, including retries and permitted redirects. Stop before retrieval if it is missing. Never use client identity in this header.
- Set a conservative aggregate budget of at most 5 SEC requests per second, including retries, across workers and application instances. Cache and deduplicate company-source retrieval across profiles. A separate in-memory limiter in each Vercel instance is insufficient to establish aggregate enforcement.
- Honor `Retry-After` when provided for rate limiting; use bounded backoff for transient errors. On an access-denied block, stop and surface source unavailability. Do not rotate identities, use proxies to evade blocks, solve access challenges, or bypass authentication or paywalls.
- Restrict retrieval to the planned official SEC endpoints and SEC filing URLs. Reject redirects to unapproved hosts; do not silently fall back to issuer sites, transcript vendors, or financial aggregators without reviewing their access and reuse terms.
- Cite the original filing and preserve reporting period, accession, retrieval time, and source hash. Display concise evidence excerpts. Do not use SEC seals or logos or imply SEC affiliation or endorsement.
- Before shipping, verify headers, aggregate request pacing, cache reuse, retry limits, permitted destinations, and access-denied behavior. Record test results. These requirements follow SEC's published policies; they are not a claim that an unimplemented fetcher or the whole financial product has been legally certified.

Policy references reviewed on 2026-10-11: [SEC research APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces), [scripted access and public-filing reuse FAQ](https://www.sec.gov/files/about/webmaster-faq.htm), [SEC privacy, security, and dissemination policy](https://www.sec.gov/about/privacy-information), and [EDGAR access guidance](https://www.sec.gov/search-filings/edgar-search-assistance/accessing-edgar-data).

Starting point: the MVP needs company numbers and management commentary. New risk-factor analysis remains later scope. Actual application retrieval and initial fiscal-aligned packet generation succeeded on 2026-10-11 for all five supported holdings. Tests cover the representative NVDA/JPM/COST packets. Deployment-origin acquisition and aggregate enforcement remain prerequisites for future live SEC retrieval; D57 serves already acquired snapshots and performs no runtime SEC requests. Results: docs/checkpoints/SEC-DATA-2026-10-11.md.

| Source | Gives | Accessible | Verdict | Reasoning |
|---|---|---|---|---|
| **SEC XBRL company facts** | Exact reported numbers | Free JSON, no key, User-Agent header required | **MVP: the number anchor** | Official structured data. Select issuer-specific fiscal periods and current metric concepts, not a universal ~90-day filter. NVDA quarter and YTD values share an end date; Costco Q4 spans 16 weeks. Arrives with the 10-Q/10-K. |
| **8-K earnings release (EX-99.1)** | Headline results, guidance, management narrative | Free. Find it via the filing index row "Type = EX-99.1" (filenames vary; NVDA's is `q2fy27pr.htm`). About 22K characters of text. | **MVP: the "what changed" narrative** | Report-day timing. Company-written, so the verifier and "evidence for trimming" offset the spin. |
| 10-Q/10-K text (risk factors, MD&A) | New risks, language changes | Free | V1 | Long and fragile to parse |
| Earnings call transcripts | Q&A, tone | Licensed | Not in v1 | Licensing risk |
| Prices and analyst consensus | Beat vs. miss, valuation | Paid | Not in v1 | The connector gap OpenAI addressed with LSEG, PitchBook, and Daloopa. The MVP compares to prior periods, not consensus. |
| Web search | News and reactions | Costs per call | V2 | Paywalled pages can't be checked word for word |
| 13F holdings | What big funds own | Free, ~45-day lag | V2 Discover | |

**Cross-source check:** when the release and the structured data report the same figure, the brief identifies a consistency check between two issuer-provided formats; this is not independent corroboration. Example verified live: the NVDA release says "revenue of $96.2 billion" and XBRL says 96,221,000,000.

### MVP user flow and UI (D54 supersedes stale flow descriptions)

1. Open directly on NVIDIA with approved income / dependable-income / short / low defaults. Edit goal, holding period, risk and rationale. No in-app gate/login or client A/B selector. Vercel owner authentication protects the early preview.
2. Select Generate brief. Server validates and freezes the displayed configuration.
3. Show actual source preparation, full-report analysis and mechanical checking stages. Do not display unverified streamed claims or invented progress.
4. Show ticker/company/period first, then a context-specific takeaway and business explanation. Supporting rows separate evidence labels, values/comparison bases and implications; include material qualifications.
5. Show a concrete unanswered/watch-next question and one concise discussion point for advisor review. These reuse the supported evidence; they do not establish client goal attainment.
6. Expand source excerpts, calculation basis and run details. Show unavailable evidence and targeted retry for the one-company run.
7. Bind results to original inputs/source cutoff. Follow-up prompts can be described as roadmap research questions; do not show a working adaptive button until implemented.

Responsive Next.js UI is implemented and deployed to a protected Vercel Preview (D57). The server uses the paired full-release path with no keyword lookup. Live deployed verification completed: income/short/low/dependable-income case, 131 seconds; headline/core findings survived, two comparative items removed. Analyst validation uses separate tasks, not a role-specific UI.

### Research input semantics (D30-D32)

**Primary goal question:** What is your primary investment goal?

Use these option labels and descriptions word for word. Descriptions may appear as optional subtitles; placement will be decided in visual design. Research emphasis is context for analysis, not a promise of complete coverage or an investment recommendation.

| User-facing option | User-facing description / optional subtitle | Research emphasis |
|---|---|---|
| Generate ongoing income | I want my investments to provide recurring cash payments. | Dividend sustainability, cash generation, payout changes. |
| Grow my investment value | I want the value of my investments to grow over time. | Growth drivers, reinvestment, margins, durability. |
| Protect money for a planned need | I want to preserve money I expect to use for a future expense. | Business stability, financial resilience, uncertainty. |

Default primary goal: Generate ongoing income. Goal and risk tolerance are separate: the goal describes the desired outcome; risk tolerance describes accepted uncertainty. These parameters guide prioritization and interpretation of supported company evidence, not changes to reported facts or buy/sell recommendations. Missing evidence must remain visible rather than filled in to satisfy a goal.

**Holding-period question:** How long do you expect to hold these investments?

**Helper text:** Choose your intended holding period. This helps us put company developments in context.

| User-facing option | User-facing description / optional subtitle | Research emphasis |
|---|---|---|
| Short term: less than 3 years | I’m evaluating these investments over the next few years. | Recent performance, near-term business developments, and uncertainty. |
| Medium term: 3–10 years | I’m giving these investments several years to develop. | Whether current changes affect sustained performance and business durability. |
| Long term: more than 10 years | I’m investing across business cycles. | Durable growth drivers, competitive position, and structural risks. |

Default: Short term: less than 3 years. Boundaries: less than 3; 3 through 10 inclusive; more than 10 years. One intended holding period applies to the selected company in MVP. Goal describes the desired outcome, holding period describes expected ownership duration, and risk tolerance describes accepted uncertainty. Holding period does not mean speed of returns, withdrawal timing, or a model forecasting window. The task remains latest-earnings research against prior periods, not short-term trading research. The agent uses holding period to prioritize and contextualize supported findings without altering company facts, inventing forecasts, or ignoring near-term risks for long-term investors.

### Release positioning and freshness (D34)

Ship a verified earnings-based portfolio research brief first, not a daily market monitor. Daily/weekly prices and broad news research are out of the first release. At the data checkpoint assess a small recent SEC filing activity indicator from existing metadata; it is optional and not a release dependency. A later bounded recent-event investigation workflow can select and investigate relevant newer evidence from approved sources.

For financial changes, use latest quarter versus the same fiscal quarter a year earlier as the primary baseline; prior-quarter context only where comparable. Latest-release commentary is a current update, not a proven narrative change unless explicit comparative evidence supports it. Every result must show the evidence date/period; do not imply that an older release establishes what is happening today.

**Forward-looking output design under review:** distinguish historical results, source-backed management outlook, conditional implications, and watch-next questions. Do not invent next-quarter estimates, probabilities, price targets, or current-event claims. A public management outlook in the release may be cited as management-stated guidance only; it is not an independently verified forecast or an XBRL actual. Separate verifier rules are needed before displaying any numerical guidance. Conditional implications require checked evidence, explicit assumptions, and visible uncertainty. Watch-next items should state a concrete signal and why it matters for the submitted goals and holding period. No extra model calls or new sources are approved by this output exploration.

### Input validation and submitted configuration (D33)

- Required enumerated inputs: primary goal (`income`, `growth`, `planned_need`), holding period (`short`, `medium`, `long`), and risk tolerance (`low`, `medium`, `high`). Defaults: income, short, low.
- Web release fixes the ticker to NVDA (D57); the server rejects other companies before a model call. The local contract retains five source experiments. No weight editing or portfolio exposure calculation; this task uses the holding rationale.
- Validate on the server as well as in the UI. Reject unknown enum values, unsupported tickers, duplicates, empty selections, and multiple tickers before retrieval/model calls. Never silently replace invalid input with defaults.
- Show actionable inline errors, including Select one company. Preserve entries after failure. Prevent duplicate submissions while a run starts.
- Submit only goal, holding period, risk tolerance, one selected ticker, and the holding-rationale enum. Server assigns the fixed task `latest_earnings_review` and input-schema version. No names, ages, account identifiers, free-text personal context, or client-supplied source URLs.
- Bind each result to an immutable copy of the submitted configuration and run ID. Input edits do not change an existing brief; another explicit Generate brief action is required. Display the configuration used in the result. Retries reuse that configuration and the run’s source snapshots where available.

Example submitted input:

```json
{
  "primary_goal": "income",
  "holding_period": "short",
  "risk_tolerance": "low",
  "tickers": ["NVDA"],
  "holding_rationale": "dependable_income"
}
```

### Holding-rationale contract (D43)

Implemented and controlled-tested on NVDA with goal/period/risk held fixed. The rationale changes research questions and unresolved evidence requirements, not company facts. Expanded NVDA facts distinguish operating income from net income and cash-dividend declarations from payments. Unreconciled dividend-payment data is withheld. Details: docs/checkpoints/HOLDING-RATIONALE-2026-10-11.md.


**Question:** What are you relying on this company to do?
**Helper:** Choose the expectation you want this report to test.

| User-facing option | Premise the agent tests |
|---|---|
| Sustain profitable business growth | Demand will translate into durable earnings and cash generation. |
| Provide dependable dividend income | The company will continue cash distributions supported by its business. |
| Remain financially resilient | The business can withstand setbacks without weakening its financial position. |

Use bounded enum choices for the first version, rather than collecting identity-bearing free text. Default rationale: dependable income, consistent with the existing sample goal. Goal captures the broader desired outcome; rationale captures the role expected from this company. They need not match and must not be silently coerced. Full personal theses remain later scope.

Primary result: user rationale, what the report supports, what it challenges, what remains unresolved, concrete implication for that rationale, and the next decisive evidence. Status is supports / challenges / unresolved, describing evidence about the premise, never whether to buy, hold or sell. A source period and material uncertainty must remain visible. Partial historical evidence cannot establish long-term durability or dividend dependability. Missing decisive evidence means unresolved, not a confident judgment.

**Visible earnings evidence (D44):** Show a concise overall assessment summary and up to three material drivers directly below it. Each driver includes eligible code-owned figures, units, the comparison baseline when available, and a brief explanation connecting the evidence to the selected holding rationale. Keep decisive limitations visible; expand detailed source excerpts and calculation lineage. Minimal presentation must not hide the numbers that explain the conclusion. “Ratings” means the internal categorical premise assessment, not analyst ratings or a numerical investment score. Describe drivers of the current assessment; show movement only after storing and comparing a prior assessment with compatible inputs and evidence cutoffs. This change is documented and previewed; automatic driver selection/rendering remains to be implemented in the web app.

Model assessment must reference eligible surviving findings or research answers. If the reference chain fails or rationale ID differs from the submitted input, remove the assessment and show a neutral insufficient-evidence outcome. Deterministic checks establish lineage and fidelity, not whether the evidence entails the assessment.

Evaluation: hold company sources, goal, holding period and risk constant; vary only the rationale. Inspect question selection, retrieved evidence, conclusions and unresolved gaps. Different wording alone does not count. Existing six-case goal tests predate this contract and are not proof of the new premise-check capability.

### Existing bounded-focus baseline (D37, D43; primary direction superseded by D52/D54)

After initial approved source retrieval and code-computed financial comparisons, select at most two research questions per holding from eligible facts and the specific holding rationale plus goal/holding-period/risk context. Each question must reference fact IDs and explain relevance. No unsupported factual assertion may be presented as a research focus.

Investigate each question through an evidence lookup tool restricted to that holding’s retrieved SEC release. Return matched source passages with stable evidence IDs, not a model’s claimed lookup. Model selects question and search targets; code performs lookup; model assesses returned passages. Cap at two lookups per holding, one for each question. If nothing relevant is found, return unresolved; no open-ended searches, new sources, or retry loop. This is bounded tool use, not autonomous broad research.

Progress may show Research focus: checking cash generation, labeled as an investigation. Show only real stage activity and avoid displaying tentative conclusions before verification. Final results expose question, evidence checked, supported finding or unresolved gap, and watch-next signal. Verified fact and quote checks do not establish entailment; evidence-support evaluation remains required.

Compare this stage with a single-pass version of the same engine and a strong ChatGPT baseline. Assess answer support and relevance, not the apparent sophistication of the workflow. Keep adaptive evidence lookup only if it improves findings or reduces review work enough to justify latency and cost. Full comparison protocol: docs/CHATGPT-COMPARISON.md.

### Implementation status (D39-D57; historical CLI evaluation below)

Historical baseline evaluation: core TypeScript modules and CLI implement code-owned fiscal comparisons, actual bounded release lookup, structured planner/analysis schemas, and verifier/dependency removal. Typecheck and 26 tests pass, including reasoning-option propagation checks. Six paired API cases completed after fixing passage-ID and short-quote defects. Focus median model latency was 28.2s versus 18.6s for single-pass; a general quality advantage is not established. Evidence-support refinement and actual ChatGPT comparison remain incomplete. The D57 paired web UI and protected preview are now implemented. See evals/SIX-CASE-ENGINE-COMPARISON.md. The initial verifier permits only numerical-free narrative excerpts and code-owned financial quantities/placeholders; this conservative implementation restriction must be evaluated for excessive evidence loss. Financial period edge cases outside the tested snapshots are not claimed covered. Deployment-wide source controls remain required before runtime SEC retrieval; the frozen-source preview makes no SEC requests.

### Historical minimal presentation direction (D42; refined by D44-D54)

Helen requested outputs that are substantially simpler than a shortened financial report. Proposed default: what deserves attention, why it matters for the entered goal, and one concrete watch-next question per holding, with its evidence date. Expand figures, excerpts and research trace on demand; material uncertainty remains visible. Do not use quantity of text, arbitrary risk scores, or number of findings as evidence of value. Compare attention-list, single-signal and meeting-note designs before choosing the final UI. Backend evidence/dependency requirements remain intact. Analyst thesis input and continuous monitoring remain gaps, not implied capabilities.

### Output contract (D38)

Implementation specification: docs/OUTPUT-CONTRACT.md. Use evidence-linked findings, interpretations, bounded research answers, and up to two watch items per holding; a concise evidence-backed discussion point per run under D54. Do not force add/trim arguments or unsupported unchanged claims. Code owns facts, comparisons, source lineage, eligibility, and removal of dependent content. Interpretation support remains a separate evaluation question.

### Implemented first-release pipeline (D52/D54/D57)

Validated immutable inputs -> frozen paired SEC releases with paragraph boundaries and code-owned facts/comparisons -> one high/context-v1 full-release synthesis -> source/reference/dependency checks -> takeaway, paired qualitative explanation, selected financial rows, unanswered/watch next and discussion point. Numeric tables are represented by code-selected facts; this is not complete 10-Q/10-K analysis.

Keep the old bounded-focus and single-pass engines as comparison baselines. Use high/context-v1 for this bounded preview based on the inspected paired case, without claiming a general effort advantage. No mandatory planner/tool call is added solely for the agent label. Adaptive investigation remains a later loop. Selected-row schemas and grouped financial rendering are implemented.

## 9. Evals and metrics

| What | How | Release/evaluation requirement |
|---|---|---|
| Financial/source integrity | Code-owned periods, values, calculations, source references and dependency checks | Reject failed eligible assertions; do not treat passing checks as a guarantee of complete financial correctness |
| Interpretation support | Review each material claim against complete source context | No critical unsupported implication in reviewed release cases; track errors without claiming zero-error general performance |
| Evidence selection and omissions | Compare selected rows/takeaways with full-source expert review | Numbers explain specific claims; material counterevidence is not hidden; omission failures recorded |
| Context use | Vary one input at a time with fixed source snapshots | Facts consistent; question/selection/implication differences justified where relevant |
| Advisor usefulness | Have advisors produce a holding explanation for an actual client-conversation task | Measure usable discussion point, substantive rewrite, useful next question and total effort |
| Analyst fit | Separate premise-check tasks using analysts' actual questions | Determine whether bounded inputs/sources are sufficient before broader claims or new scope |
| Total time to review-ready output | Generation + source checking + editing versus usual workflow and matched ChatGPT | Establish baseline and task benefit; reduced source-opening alone is not success |
| Latency/cost/reliability | Trace actual settings, token usage, calls, failures and timing | Make production effort choice from workload evidence; do not infer from a single trial |

Initial practitioner pilot is proposed in docs/TARGET-USER-HYPOTHESIS-REVIEW.md. Internal model trials do not substitute for practitioner validation. Existing automated checks and 26 tests are implementation evidence; a published end-to-end accuracy score remains pending. Failures must distinguish source/retrieval, schema/verifier, interpretation, workflow and design causes.

## 10. Practitioner validation

Proposed pilot: three advisors who discuss individual-stock holdings and three buy-side analysts, evaluated separately. No interviews or recruitment are claimed completed.

Ask about the last real holding-review task, what question they needed answered, tools/sources used, review/editing work and what information was indispensable. Use public company data and non-identifying contexts. Compare outputs on matched source cutoffs and counterbalance task/order. Ask the participant to prepare a client explanation or initial thesis update, not just judge visual appeal. Record missing material developments, accepted versus rewritten content and an actionable next research step. Small-sample preferences are directional, not market validation.

## 11. Open decisions

- Product name
- Where it links from helenshim.me
- Model choice after 5 test runs (cost and quality)

### Result presentation hierarchy (D45)

Ticker/company/period header → earnings takeaway answering the user's rationale-specific research question → concise implication → visually subordinate evidence points with eligible numbers/comparison bases → unresolved gap and next decisive evidence → expandable provenance. Input controls do not precede the result on the results view. This refines D44's visible-evidence requirement and preserves the one-company scope. Preview updated; web app rendering remains pending.

### Receipt-inspired evidence layout (D46)

Follow Helen's supplied ticket/receipt typography references. Separate supporting evidence into metric label, code-owned value with eligible comparison, and rationale-specific implication columns. Keep ticker and takeaway dominant. Use compact mono labels/numerals, readable sans-serif prose and thin separators. Reflow each evidence row on narrow screens to metric/value followed by implication; preserve readable numbers and all material uncertainty. Preview updated; application implementation remains pending.

### Qualitative evidence behind takeaways (D47)

Explanatory earnings takeaways need business evidence, not only financial growth rates. When available and material, show up to two source-linked qualitative points alongside the three numerical drivers: management's explanation of demand, product execution or business conditions. Distinguish attributed management claims and company-reported milestones from independently corroborated facts and agent interpretation. Do not infer causality, reduced customer concentration or proven durability from promotional statements alone. Name the specific unresolved issue and whether it reflects limited retrieval, absent disclosure, conflicting evidence or future uncertainty. A lookup that misses a reconciliation is not proof the report lacks it. Evaluate explanation support and useful specificity, not exact quote matching alone. Preview updated through manual review; automatic selection/evaluation remains pending.

### Context-specific evidence and follow-up (D48)

Consider every submitted input: ticker determines the company and source scope; primary goal determines the desired outcome; holding rationale determines the premise being tested; holding period determines the persistence/delivery window to investigate; risk tolerance determines which adverse scenarios and uncertainty merit attention, not the truth or certainty of the evidence. Explain context only where it has a justified bearing; do not force cosmetic differences or invent portfolio exposure.

Each material point follows this hierarchy:
1. **What happened:** a specific reported development, with figures or attributed qualitative evidence and source references.
2. **What this means for your goals:** a concrete mechanism connecting that development to the submitted goal, holding rationale and relevant horizon/risk considerations. Separate interpretation from reported fact. Potential supports for long-term growth are not proof of long-term investment suitability; one-quarter upside is not durability evidence.
3. **What remains unanswered / watch next:** a specific unresolved question, the evidence needed, and observable conditions that would strengthen or weaken the premise. Make this usable as a subsequent research prompt or saved watch item, rather than generic advice to monitor performance.

For long holding periods, prioritize evidence relevant to repeat demand, competitive position, execution across product cycles and sustained cash generation where present in approved sources. For short periods, prioritize delivery timing, near-term demand and the next reporting period's outlook. Label management expectations as expectations; do not invent forecasts. Limited sources may leave either horizon unresolved.

Evaluation: vary one input at a time on identical company sources, inspect question selection and evidence relevance, require unchanged underlying facts, and judge whether changed implications are justified. All inputs must be considered, but not all must alter every finding. Measure specificity of the mechanism, support for the interpretation and usefulness of follow-up conditions. Risk tolerance must not turn weak evidence into certainty. Without weights, other holdings or prices, describe relevance to portfolio goals rather than actual portfolio impact, suitability or an action recommendation.

Implementation boundary: existing evidence-linked findings, interpretations and watch items provide underlying structures. Refine planning prompts and render these together; the complete revised behavior has not yet been implemented or evaluated. Follow-up execution, persistence and subsequent-filing checks remain D35 roadmap scope.

## 12. Technical architecture and reasoning configuration (living section, D49-D57)

Update this section whenever orchestration, settings, sources or verification change. D57 implements the bounded full-release workflow below. Earlier focus/planner/lookup descriptions are retained CLI baselines; adaptive follow-up remains V1.

```mermaid
flowchart TD
    A[Goal, rationale, holding period, risk; NVIDIA] --> B[Server validates and copies inputs]
    B --> C[Load checked frozen SEC report pair]
    C --> D[One high-reasoning call: compare reports and select evidence]
    D --> E[Code checks schema, quotes, period IDs and dependencies]
    E --> F[Code renders selected facts and comparisons]
    F --> G[Takeaway, goal implication, evidence and watch questions]
```

**Runtime:** Next.js / Node.js 24 on Vercel Preview, protected by Vercel authentication. Server-side direct OpenAI Responses call to gpt-6.1-sol, high reasoning and context-v1, store:false, 12,000 output-token ceiling and 180-second timeout. Route ceiling: 240 seconds. NDJSON reports actual stages; heartbeat shows connection activity, not completion percentage. No tentative claims are streamed. Failed runs preserve inputs and allow explicit retry; no automatic repeated paid call. Abort propagation limits work after disconnect. No durable state/persistence.

**Code responsibilities:** source preparation before deployment, cutoffs/hashes, fiscal joins/arithmetic, input copying, run IDs, schema/reference/quote/dependency checks and metric rendering. Client receives public display facts and checked output; full reports/API credentials stay out of the client bundle. Logs contain event, request ID, elapsed time and sanitized error category, not keys or inputs. Origin validation is not authentication or a spend cap. Production live calls are disabled for this release. Aggregate SEC coordination is required before runtime retrieval; the CLI limiter remains per process.

**Data/privacy boundaries:** frozen SEC evidence was obtained from approved official endpoints using operator identification/acquisition controls. No runtime scraping or licensed/login-gated source. Both formats are company-provided evidence, not independent corroboration. Public reports and bounded user choices are sent to OpenAI. No names, account identifiers, weights or free-text personal context. store:false does not promise zero retention or firm compliance approval. Suitability, valuation and portfolio goal attainment are outside the evidence available.

**Model responsibilities:** inspect the full source packet and user inputs, select material developments and at most two questions, identify needed narrative evidence, explain concrete goal/rationale mechanisms, consider counterevidence and competing explanations, distinguish supported/challenged/unresolved parts, and produce specific follow-up/watch conditions. Higher reasoning must improve these decisions, not simply lengthen prose or manufacture certainty. Facts may have different relevance across contexts but must remain consistent.

**Retained CLI baseline implementation:** src/lib/engine.ts uses gpt-6.1-sol via direct Responses API; two calls in focus mode (planner, analyzer), one in single-pass mode. Both receive the full retrieved release and code facts; research answers in focus mode are restricted to the passages returned for their planned question. Lookup is application-controlled literal matching, at most six passages per question; it is not an open-ended native function-calling loop. Model replies use strict JSON schema. Financial values render from code records; numerical prose/quotes remain conservatively restricted. Source text is untrusted evidence.

**Reasoning experiment:** per-stage options allow low or high effort and a context-v1 instruction extension. Retained baseline callers use low/low and premise-v1; the web paired path uses high/context-v1 under D57. Trace records actual model, effort, prompt version, latency and usage. Calls allow 12,000 total output tokens including reasoning and a 180-second timeout, consistently across compared variants. This raises the prior 6,000-token/60-second ceiling to accommodate high reasoning; it is not a guarantee that runs complete or a desired token target. Changing this Codex chat's reasoning setting does not change product API settings.

**Comparison protocol:** frozen NVDA packet and identical growth/long/medium/profitable-growth inputs; compare low/original versus high/original, then high/original versus high/context-v1. Hold model, source packet, output schema and request ceilings fixed. This separates effort from prompt revision, but planning can change retrieved passages, so it tests end-to-end behavior rather than analyzer reasoning on fixed lookup results. One run per variant is exploratory, not proof of general superiority. Assess materiality, concrete context connection, qualitative support, counterevidence, useful watch conditions, mechanical drops, latency and tokens. Repeat or broaden only where the result or unresolved concerns justify it.

**Trust limitations:** deterministic verification establishes shape, lineage and quote fidelity, not entailment or investment suitability. High reasoning cannot add missing evidence. A failed lookup is distinct from absent disclosure. Portfolio exposure, valuation and returns cannot be inferred without corresponding inputs/sources. The three-part paired UI is implemented under D57. Persistent watch items, next-filing checks and bounded follow-up execution remain D35 roadmap; no additional autonomous loops are introduced by this experiment.

### Retrieval context limitation and alternatives (2026-10-12)

Current lookup normalizes 1-5 literal search terms, scores each flattened release paragraph by matched terms and returns the top six. Narrative paragraphs may be complete, but table rows become isolated from headers, units, dates and neighboring reconciliation rows. Both model calls receive the full release, yet focus-mode research answers must cite only the question-specific lookup results. Thus source availability, preserved structure and permission to use evidence are separate constraints. More reasoning cannot resolve an artificially restricted evidence record reliably.

Recommended next retrieval experiment, not implemented: preserve source sections/tables, provide the full modest-sized earnings release in its structured form and allow exact source-ID citations across that approved packet. Use bounded section/table retrieval when a question needs focused inspection, returning headers, units, dates, surrounding explanatory text and original row IDs. Financial calculations remain code-owned; unknown table bases stay unresolved. Evaluate against the current frozen packet and effort configuration before changing defaults.

Alternatives: (1) full-release context with unrestricted in-packet references, simplest for one small source but potentially noisy; (2) section/table-aware retrieval, recommended to preserve financial context; (3) semantic plus keyword retrieval for a larger multi-filing corpus, with section expansion and additional storage/cost; (4) bounded adaptive read-more loop when the first evidence is insufficient, with allowed sources, call/token limits and an explicit stop. Options 3-4 are future design choices, not current MVP commitments. Wider evidence across filings may be needed for long-horizon claims; better retrieval of the same quarter cannot create historical proof, market pricing or independent corroboration.

### Initial reasoning comparison result (2026-10-12)

Four configurations completed on the frozen NVDA case: low/original 36.08s (~$0.0837), high/original 104.99s (~$0.1198), high/context-v1 103.77s (~$0.1249), low-planner/high-analyzer/context-v1 122.46s (~$0.1281). Costs are standard-rate estimates from actual usage, not verified invoices. All passed mechanical checks; interpretation support remains separately reviewed. Context instructions produced a specific deployment-to-repeat-demand question, cited actual partner deployments and distinguished lookup gaps from disclosure gaps. Higher effort alone mainly improved gap diagnosis. Hybrid did not demonstrate a latency benefit. Runtime baseline remains low/original; high/context configurations are supported evaluated candidates. Context refinements exist in the optional prompt, but all-input sensitivity and UI rendering are not yet evaluated/complete. See evals/REASONING-COMPARISON-2026-10-12.md.

### Retrieval-output examples and recommendation (2026-10-12)

See docs/RETRIEVAL-OUTPUT-EXAMPLES.md for same-input/source illustrations of full report, section/table retrieval, semantic/keyword retrieval and adaptive investigation. Samples are manually edited, not newly tested outputs. Correct outputs can converge across approaches: retrieval must improve evidence completeness/support rather than force differing conclusions. Proposed MVP direction is full structured earnings-release context with exact in-packet citations, followed by focused section/table inspection where necessary. Keep code-owned math/source verification. Semantic indexing and mandatory read-more loops remain deferred proposals. This recommendation does not expand source scope or change runtime effort defaults. Compare against existing focus mode before claiming improvement.

### Adaptive follow-up from results (D51, proposed)

Helen prefers adaptive investigation as the follow-up direction. Initial report still provides a complete checked evidence view. Unanswered questions expose a specific action such as “Investigate cash conversion” or “Check evidence for repeat demand.” Clicking starts a child research run that inherits the ticker, goal, rationale, holding period, risk, original source cutoff and cited evidence baseline; it does not require re-entering context. Store parent run/question identifiers when persistence is implemented.

The follow-up model assesses the selected evidence gap and can request complete sections/tables from the approved source packet through application-controlled read tools. Proposed initial budget: at most two additional reads, no unrestricted browsing, then a final synthesis or explicit unresolved stop. Source text remains untrusted, financial calculations remain code-owned, and new claims retain citations/dependency checks. Return what changed in the evidence assessment, why it matters to the original inputs, what remains unanswered and what to watch next. Do not claim a rating change when only evidence completeness improves. If the answer requires future data or sources outside the allowed packet, stop and state the needed evidence; a follow-up cannot manufacture it.

Correct missing period headings/units at ingestion before presenting results. The follow-up should investigate substantive uncertainty, not force the user to repair our retrieval formatting. Complete report context plus optional adaptive inspection is the proposed MVP evolution; semantic indexing remains a later option. This section records preferred design, not implemented UI/tooling or authorization of new data sources. D35 persistence and next-filing scope remains separate.

### Approved primary analysis direction (D52)

Full-report analysis is the primary path. Give the model the complete structured earnings release, code-owned financial facts/comparisons and all validated inputs. It selects the most material context-specific takeaway and the eligible fact/comparison IDs explaining that conclusion. Code then renders only the selected financial evidence with clear metric labels, values, units, dates and eligible comparison baselines. Do not display a fixed revenue/EPS/cash-flow grid regardless of relevance. A selected number must support or qualify a specific claim; retain relevant counterevidence and uncertainty rather than cherry-picking favorable measures. A quantitative relationship requires a code-owned calculation/comparison, not model arithmetic. Qualitative findings retain attributed source passages. If supplied facts cannot support the desired claim, narrow the claim or name the missing evidence instead of inventing a metric.

Default result: ticker -> context-specific full-report takeaway -> qualitative explanation -> selected financial evidence -> unanswered/watch-next question. Financial rows show Metric / Value + comparison / Why this supports or qualifies the takeaway. Same company facts remain consistent across user contexts; context changes selection and interpretation, not values. Prefer up to three financial rows, with fewer when sufficient and an explicit material limitation when needed. Adaptive investigation is an optional follow-up from an unanswered question, not the default substitute for a complete first brief. Source scope and code-owned verification remain unchanged. Implementation and browser rendering are complete for NVIDIA under D57; usefulness remains a separate evaluation.

### Target-user hypothesis review (D53, 2026-10-12)

D52 is a promising approach, not proven to be the most valuable workflow for all target users. Preserve advisor-first positioning, narrowed to explaining an individual-stock holding for a client conversation. Validate buy-side analysts separately: broad goals/horizon/risk and enum rationale do not yet encode a specific investment thesis, forecast assumption or expectation. The current release-only packet cannot establish comprehensive diligence, valuation, long-term suitability, actual portfolio exposure or client goal attainment. “Full-report analysis” means the complete approved earnings release; it does not imply full 10-Q/10-K footnote or call coverage.

Refined advisor hypothesis: a short goal/rationale-linked earnings brief with selected relevant financial evidence, material qualifications and a concrete follow-up reduces total preparation/review effort for an individual holding. Refined analyst hypothesis: a source-linked update testing a specified holding premise reduces initial reading/verification effort without omitting material developments. These are separate tests, not one universal personalization claim.

Protect against confirmation bias: review the full approved source before forming a takeaway, include evidence that supports or qualifies it, and evaluate missed material developments as well as shown-claim accuracy. Proposed internal review-coverage record remains pending. A generic long-term caveat or merely different wording does not establish context sensitivity.

Desk research and proposed three-advisor/three-analyst pilot are documented in docs/TARGET-USER-HYPOTHESIS-REVIEW.md. Measure total generation+checking+editing time, material omissions, unsupported implications, usable client explanation/thesis update, substantive rewriting and useful next actions. Proposed small-pilot preference/effort criteria are directional; no representative demand validation or user interviews have been completed. Source findings support testing this workflow, not claiming product-market fit. No new input/source or audience-specific UI scope is added by this review.

### Prior-quarter change and macro context proposal (D55, 2026-10-12)

Latest-quarter synthesis and year-over-year financial comparisons do not establish what changed in the business narrative since the prior quarter. At the time of D55, packets contained latest releases and primarily YoY comparisons. D56/D57 now pair NVIDIA releases for qualitative change analysis; broader coverage remains pending. Proposed next source increment: retrieve the immediately preceding earnings release from the same approved SEC access path and compare complete period-labeled source packets. Show explicit prior -> current evidence and a goal/rationale-specific implication. A statement newly appearing is not necessarily a newly occurring event; omission is not proof of reversal. Preserve unchanged/counterevidence where material. Code computes eligible QoQ and YoY measures with seasonality/period/definition warnings; numerical guidance requires a separate management-outlook verification path before use.

Distinguish company financial/operating metrics from external macro statistics. Company releases may provide attributed commentary on rates, demand, policy or FX, but do not independently establish macro conditions or causality. External macro data is a separate source decision. Candidate public primary sources include BLS releases (inflation/employment), BEA GDP releases and Federal Reserve FOMC statements. No source connection/retrieval or macro overlay is approved or implemented by this proposal. If added, select only indicators with an explicit company-exposure/goal mechanism, align observation period and publication cutoff, identify revisions and distinguish correlation from issuer-supported explanation. Do not add a generic macro dashboard or daily-news dependency.

Recommendation: prioritize current-versus-prior company business-development and eligible financial comparisons; keep broad macro ingestion deferred pending practitioner evidence. The resulting brief answers what changed, which evidence supports/qualifies the change, what it means for the supplied context and what to watch next. Full source-preserving release synthesis remains required; this proposal adds a comparative source baseline, not proof of long-term suitability.

### Paired-quarter test implementation (D56, 2026-10-12)

Helen authorized seeing a real test of D55. A local NVDA test now retrieves the immediately prior SEC earnings release through the existing identified/rate-limited client, validates its fiscal end, freezes source hashes and pairs it with the current release. Adds code-owned QoQ comparisons for eligible consecutive fiscal quarters, with matching concepts/units and duration checks. It reuses full-release paragraph evidence (including table header paragraphs), permits references across both period-labeled reports and extends the experimental structured output with paired developments, selected financial rows and an advisor discussion point. This does not implement a general HTML section/table object parser. D57 subsequently implements the NVIDIA web UI on a protected Preview.

Paired-development mechanical checks require exact current/prior quotes from their correctly labeled periods for claimed changes; current-only disclosures are distinguished. Selected rows must resolve to current facts and matching comparison IDs; failed underlying findings remove dependent output. Change classification, causal explanation and interpretation support still require manual review. The experiment uses Sol high/context-v1 full-report synthesis, not the prior keyword lookup stage. No external macro dataset, guidance-number display or new autonomous loop is added. Existing low/focus baseline remains available. TypeScript and 29 tests passed at the D56 checkpoint; live result and qualitative review are recorded below.

### Paired-quarter test result (2026-10-12)

Live NVDA growth/long/medium test completed: high/context-v1 full-report synthesis selected code-owned revenue +17.9% QoQ, GAAP operating income +19.0% QoQ and operating cash flow -52.2% QoQ (still +56.7% YoY). Compared platform announcement with current company-reported partner-rack production progress, marked the China outlook exclusion unchanged, and treated conditional financing partnerships as current-only disclosure rather than a proven changed prior arrangement. Overall premise remained unresolved. Manual review treats the cash decline as a material qualification, not proof of structural deterioration; joined source evidence needs to preserve the comparative quotations. Mechanical checks had zero drops; 29 tests and TypeScript passed at that checkpoint. See evals/PAIRED-QUARTER-TEST-2026-10-12.md. One prototype run does not establish broader quality, user benefit or production readiness.

### One-hour release refinement (D57, 2026-10-12)

Helen requested a shipped MVP quickly, accepted the result hierarchy and requested compact typography/spacing. Recommendation: live input-sensitive NVIDIA analysis using the verified frozen FY2027 Q2/Q1 pair. Narrow coverage while preserving the end-to-end journey. Preserve approved input labels/defaults; distinguish the saved growth/long/medium example from a new run. Frozen sources are disclosed; no daily freshness is implied.

Implemented: src/lib/paired-research.ts, src/app/api/research/route.ts, src/components/research-workspace.tsx and src/lib/view-model.ts. Local Inter/Plex Mono fonts, receipt rules and native disclosures. Desktop metrics separate label / value+baseline / implication; mobile keeps those relationships in stacked rows. Prior/current context avoids unexplained “that exclusion” references.

Deployment project prj_ljgUQ5SVZbnSM0V0wopAjv3kvuAs, Helen's projects, Node.js 24. Preview Secret metadata verified in the owner UI without revealing its value. Uploads exclude .env.local/private trial data/node_modules. Initial API deployment defaulted to Production, where live calls are disabled. Explicit REST target: staging deploys to Preview. Protection remains enabled. Automatic review rejected creating a temporary authentication-bypass link; none was created. Verification uses the existing signed-in owner browser.

Checks: 30 tests, build/TypeScript, browser fixture checks (inputs, duplicate prevention, evidence, fiscal figures, mobile overflow, recovery) and pre-model API validation pass. Live protected-preview verification completed. See docs/checkpoints/WEB-MVP-2026-10-12.md for the initial removed takeaway, retest, surviving evidence and limitations. Practitioner validation and matched actual ChatGPT testing remain next work.

Protected first-release URL: https://portfolio-research-agent-asaf2pel7-helenhshims-projects.vercel.app (Vercel owner authentication). After the live retest, only UI copy/run-reference display and font license notices changed; provider, packet, engine and verifier were unchanged. Final Preview build checked separately.

### User-observed reliability and latency failures (D58, 2026-10-12)

Helen tested income / profitable-growth rationale / short holding period / medium risk and received no verified takeaway after a long wait. This is a valid combination: company growth can be the holding premise even when the investor's broader goal is income. Do not silently replace the rationale with dividend income or block the combination. Separate the business-premise assessment from evidence for the broader goal; business growth does not establish investor income or expected returns.

Recent final-deployment logs show completed requests taking 122559 and 159670 ms with assessment_present false, specifically Supporting finding references failed. No finding-removal entries appeared in these check summaries; interpretation/watch dependencies also failed. The logs intentionally omit inputs, so the two requests cannot be individually attributed to Helen's stated configuration from logs alone. These are output-reference failures, distinct from unavailable company evidence. The coarse per-item diagnostics do not establish the exact malformed reference. Successful earlier runs therefore do not establish a reliable user experience.

Proposed improvements, not yet implemented or approved as new runtime settings:

- Simplify the paired-output contract. Remove legacy fields not used by this UI, especially duplicate interpretations and permanently empty research_answers. Assign/limit evidence identifiers in code; compose the takeaway only from checked findings with explicit allowed reference IDs. Preserve exact citations, numerical ownership and dependency removal.
- Always retain useful verified content when the personalized takeaway fails: source-linked financial changes and surviving findings, with a clear output-check failure and next research question where verified. Distinguish this from a valid unresolved assessment caused by missing evidence. Never invent a replacement conclusion or attach arbitrary findings merely to pass checks.
- Benchmark lower effort on the same full paired source and compact output contract; retain deep review for cases that need it. Earlier low/original 36.08s versus high/context 103.77s trials used a different configuration and do not predict this pipeline's latency/quality. Do not automatically cut the response ceiling enough to truncate high reasoning.
- Reuse a thoroughly checked company-evidence analysis per frozen report pair, then perform a shorter input-specific synthesis. Keep the complete sources available for questions the cached evidence cannot answer; evaluate omitted material evidence. Cache successful results only by every input plus source hash, prompt/schema/model/configuration versions. Initial uncached analysis remains costly; persistent/shared cache adds state and invalidation responsibilities.
- Consider one narrowly scoped repair for invalid references using only surviving verified evidence and a time/call budget. Repair formatting/references, not unsupported factual claims; stop with a useful unresolved result if it fails. This adds latency/cost and should follow fixing the contract.
- Show already checked source/fact information promptly and render new personalized sections only once their evidence checks finish. Loading indicators or raw model streaming do not fix actual latency. Preserve the minimalist hierarchy and avoid presenting generic initial facts as a completed personalized answer.

Proposed release evaluation: replay the exact failing combination, existing income/growth cases and missing-evidence/invalid-reference cases across repeated runs. Track usable checked-takeaway rate, correct unresolved behavior, unsupported implications, material omissions, repair rate/cost and median/p95 time to first useful verified content and full result. A possible initial target is a compact uncached brief within roughly 30 seconds median and 60 seconds p95, with no headline failures in the finite release fixtures; these are targets to test, not current performance guarantees. Practitioner checking/editing time remains necessary. Prioritize reliability, compact output/lower-effort testing, then company/result reuse before adding sources or agent count.

### Confirmed reference failure and latency candidate (D59, 2026-10-12)

The failing income/profitable-growth/short/medium case was reproduced. The model generated three findings but referenced five in its takeaway, including nonexistent financing and income findings. All actual findings passed. The code correctly rejected the dangling dependencies; this was not missing company evidence or an invalid input combination.

Local candidate: fixed code-defined finding identifiers, allowed financial/reference enums, evidence-first output order, bounded identifier arrays and removal of legacy duplicate output sections. Full reports, financial arithmetic and evidence/dependency rules remain intact. Checked paired quotations are consolidated with their explicitly linked findings. Candidate reasoning effort is low on the same Sol model. Runtime options support experiments; defaults and deployed preview remain high/legacy pending rollout.

Successful candidate calls took 38.651–43.228s versus a 126.196s reproduced legacy failure; bounded case and bounded long-term-growth run passed without removals. Three early unbounded low-effort calls were incomplete, and stable/high timed out. The exact reasons of those earlier incomplete responses were not retained; array bounds are not a proven cure. Richer incomplete diagnostics are now instrumented. Do not claim a universal speed/quality improvement or production reliability from this small trial. 33 tests and typecheck pass. Details and artifacts: evals/BRIEF-RELIABILITY-LATENCY-2026-10-12.md.

Recommended follow-on latency scope: exact successful-result reuse keyed by every input plus source/model/prompt/schema versions; optionally prepare thoroughly checked company evidence once per report pair, then synthesize for the user's context while retaining access to complete sources. Cache/state, bounded repair and rollout are scoped proposals, not implemented capabilities. This stays within the existing source/input bounds and adds no agent merely for presentation.
