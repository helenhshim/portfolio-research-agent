# V2 differentiation and a finance capability inside ChatGPT

2026-10-12 · D63 · Strategic recommendations, not scope approval or implementation. Helen selected Research workspace in the concept preview and asked whether the product can outperform ChatGPT or demonstrate what to build within it. Preview feedback does not approve the runtime rebuild.

## Current assessment

The proposed question → source-backed answer → follow-up/artifact is a usability improvement over V1, but weak competitive differentiation by itself. ChatGPT can conduct multi-step source-based work, calculate with tools, revise outputs and create deliverables. Official guidance explicitly uses quarterly reports to make checked briefs and presentations. No matched product comparison has been run. [ChatGPT prompting guidance](https://learn.chatgpt.com/docs/prompting).

Our implemented assets are narrower: a fixed NVIDIA SEC source pair, source/fiscal provenance, code-owned financial facts/comparisons and mechanical output checks. Open questions, margin calculations, conversation history and adaptive work are proposed, not deployed. Citation matching does not prove semantic support. Two issuer-provided formats do not create independent corroboration.

## Where a specialist workflow could earn its place

| Capability | User benefit to test | Prototype status / constraint |
|---|---|---|
| Consistent financial definitions and period alignment | Less checking of quarterly versus YTD, GAAP versus adjusted, declarations versus cash payments, percentage versus percentage-point changes | Several rules/facts exist; proposed operating-margin metric and broader coverage need implementation |
| A thesis/evidence record | See the premise, supporting/qualifying evidence, unresolved questions and what changed after review | Proposed; a public-company record is explicit structured state, not unrestricted personal memory |
| Bounded investigation to resolve a gap | Agent chooses the relevant next approved evidence/action, then changes or preserves the interpretation based on results | Not implemented; source availability and stopping budget must govern whether it can proceed |
| A repeatable next-report update | Reuse the prior research question/watch conditions, compare new evidence and show the exact basis for a revision | Existing roadmap, not implemented. Scheduling, new report refresh and durable persistence are separate features |

These are proposed default guarantees/reduced setup, not abilities ChatGPT fundamentally lacks. The advantage must be measured through completion, error/omission rates and analyst review effort. More model calls, agents or status messages do not establish advantage.

## Recommended differentiating experiment

Test **a thesis update across two reporting periods** before expanding sources or workflows. The existing Q1/Q2 NVIDIA evidence allows a replay with no new licensed/logged-in data source:

1. Analyst states a public-company hypothesis, such as “Operating profitability can persist as the next product cycle ramps.”
2. With Q1 evidence only, the system creates a reviewed baseline: relevant checked metrics, supporting/qualifying excerpts and explicit watch questions. Do not include Q2 paragraphs/facts or use a baseline retrospectively tuned to Q2 outcomes.
3. Analyst requests a Q2 update. The system inspects the Q2 evidence, calculates eligible comparisons and checks which watch questions are answered, remain unresolved or now need different evidence.
4. The artifact shows the old interpretation, new evidence, changed interpretation and reason. Cash weakness must not silently become a margin-decline claim; absent disclosure must not become evidence of reversal.
5. Analyst challenges one conclusion. The system reopens its actual cited evidence/available facts and updates the record or identifies the specific missing source. It does not repeat the same summary with different wording.

This is a historical replay, not live monitoring or a forecast. Scope first to same-session state and the existing report pair; even that requires approval/implementation beyond the current mockup. The current Q2 packet contains later-context facts/YoY baselines, so a defensible Q1 replay must be prepared with the appropriate earlier source cutoff and checked for leakage. If reliable Q1 baseline preparation is too large, first test same-session evidence challenge/correction using the approved Q2 pair and keep temporal replay as the next experiment.

An optional later gap-closing path could inspect a relevant official 10-Q section for cash-flow drivers, but full filing analysis is outside approved P0 scope. It requires source preparation/access controls, evidence validation and a clear additional-source decision. No runtime SEC retrieval is silently added. Licensed calls/market sources remain excluded unless separately approved.

## What makes the workflow agentic

The system maintains a task and evidence state, chooses an available evidence/action when useful, executes through bounded tools, evaluates the result, and revises or stops. Code enforces permitted sources, fiscal calculations, budgets and checks; model judgment chooses relevance and interprets qualified evidence. Missing evidence is a valid stopping state. Human review can change the premise without rewriting financial facts.

ChatGPT can also execute agentic workflows. The specialist case is that this particular finance workflow is dependable and easy to review, not that general-purpose chat cannot do it. A deterministic two-report comparison can be valuable without extra autonomous loops. Add investigation only when the choice of next action improves task outcomes.

## Standalone versus embedded

| Route | Why choose it | Main cost / limit |
|---|---|---|
| Standalone research workspace | Full control of artifact revisions, source policies, comparisons, review flow and run instrumentation | Must earn a separate destination; repeats conversational scaffolding already available in ChatGPT |
| Finance capability inside ChatGPT | User expresses intent in ChatGPT; specialized tools contribute source-grounded metrics, thesis state and an inspectable panel | Host controls conversation/orchestration. Installation/access, tool discoverability, state/auth and host integration need testing |

**Recommendation for Helen's portfolio goal:** develop one independently useful finance backend, validate it through the small standalone harness, then expose its narrow capabilities inside ChatGPT. Position the project as an evaluated finance workflow that augments frontier agents. This is a strategic inference from her OpenAI FinServ PM goal, not proof of what OpenAI internally plans to build.

Official OpenAI guidance says a ChatGPT app should expose a few well-defined powers rather than port an entire website. It evaluates value through added context, actions and useful UI. [What makes a great ChatGPT app](https://developers.openai.com/blog/what-makes-a-great-chatgpt-app).

A practical embedded prototype can expose backend tools through MCP, optionally returning an evidence/metric/record component beside the conversation. Current docs describe plugins with MCP servers and MCP Apps UI; this is an external integration route, not authority to modify native ChatGPT. Publication/account access and ongoing scheduling are separate decisions. [MCP server guide](https://developers.openai.com/plugins/build/mcp-server), [ChatGPT UI guide](https://developers.openai.com/plugins/build/chatgpt-ui).

Suggested outcome-oriented tool surface (proposal):

- `inspect_company_evidence`: approved periods, full relevant source context, provenance, eligible metrics and explicit missing coverage.
- `calculate_financial_comparison`: vetted metric definitions and aligned fiscal values with calculation lineage, not arbitrary model math.
- `create_thesis_record` / `update_thesis_record`: explicit analyst-approved public premise and versioned evidence references; state-changing operations distinct from read-only inspection.

Avoid a black-box `ask_finance_agent` tool that hides another unbounded LLM conversation. Let ChatGPT do language/relevance reasoning while the specialist backend supplies controlled facts/state. If it supplies drafted interpretation, distinguish it from deterministic results and validate material support. An embedded component can label/check the claims it owns; it cannot certify every statement ChatGPT makes elsewhere in the conversation. Host conversation memory is not a substitute for backend provenance or declared retention.

Hypothetical embedded task: “Revisit my NVIDIA margin thesis using the latest report in the approved source set.” ChatGPT calls evidence/comparison tools and opens a record showing prior premise, updated metrics, source-backed changes, unresolved questions and a user review action. “Latest” means latest actually available in that source set, not latest in the world. The frozen MVP must label its dates. Automatic next-report notification remains a later feature.

## Evidence required to claim improvement

Run actual strong ChatGPT, specialist standalone, and (when built) ChatGPT + finance-tools tasks with the same source scope/cutoff and a well-written prompt. Give general ChatGPT access to the full sources, suitable calculation tools and the same research intent. Measure a shared-source analysis trial separately from end-to-end acquisition; specialist code/source-preparation cost counts in operational reporting.

Use period-definition traps, unanswered evidence questions, user corrections, contradicting evidence and a follow-up requiring a prior finding. For a temporal replay, blind the first stage to later data. Evaluate total analyst time to an accepted answer, material errors/omissions, claim entailment, corrective prompts, revision consistency and cost. Count all failed/incomplete runs, not only attractive examples. A win is less review work at comparable or better quality on a defined task; no universal “outdoes ChatGPT” claim follows.

## Decisions still open

Whether thesis tracking or immediate question-answering best fits practitioners; whether the first next experiment is same-session evidence correction or the larger historical replay; standalone-first versus an early MCP integration; source/retention/access boundaries. D65 records approval of the initial D64 launch scope. This D63 strategy adds recommendations/evaluation questions, not authorization for the larger replay, persistence or embedding proposals.
