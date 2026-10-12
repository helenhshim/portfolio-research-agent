# Financial Research Agent: V1 → V2 Product Decision Memo

Owner: Helen Shim · 2026-10-12 · Decision D61 · Status: initial D64 launch scope approved under D65; broader alternatives and proactive refinement remain proposals.

Basis: Helen's raw reflection and context handoff, [repository audit](V1-AUDIT.md), and existing release/debug evidence. Founder observations are not practitioner research. The frozen `prototype-1` tag remains the baseline; no V2 UI or agent implementation is claimed.

## 1. Executive summary

Change the primary interaction from preset investment context → fixed earnings brief to research objective → contextual investigation → reusable, source-backed artifact. The conversation directs the work; the artifact is the deliverable. Helen's handoff establishes an analyst-first exploration for V2, replacing the advisor-first starting hypothesis from D60 while preserving advisor tasks as a separate later validation track.

The smallest recommended V2 demonstrates one open-ended question and a contextual follow-up using the existing NVIDIA evidence. It does not promise arbitrary companies or financial workflows. Progressive findings and more autonomous investigation follow only when they improve the task. Helen has approved the narrowed initial launch scope in D64/D65; the historical alternatives below are not blanket approval for broader work.

## 2. V1 observations

**Observed in code:** four prefilled context selects; no question field, thread, follow-up API or evolving artifact. Real frozen SEC documents and dynamic live synthesis already exist. Progress shows genuine preparation, analysis and checking stages, but no useful findings before completion. Current results disappear on reload.

**Observed in testing:** one valid income/growth input lost its takeaway through dangling finding references; exact local reproduction took 126 seconds. Recent deployed runs took approximately 123–160 seconds. Local candidate successes of 39–43 seconds are encouraging but do not establish V2 reliability or quality.

**Helen's interpretation:** preset inputs constrain exploration, require translation into our taxonomy and make the experience feel less capable. The code does not require users to manually choose every field or plan execution. We should test the friction rather than describe it as proven user behavior.

## 3. Problem statement

An analyst starts with a question about a business, metric or thesis. V1 asks for an investment profile and answers a predetermined holding-rationale question. A good answer to that template can still miss the research objective. The analyst cannot challenge a finding or deepen the investigation without starting over.

## 4. Product hypothesis

Open-ended intent, optional context and same-session continuation will reduce the work of expressing and refining a research task. An inspectable artifact will keep findings reusable as the conversation evolves. Selective clarification and independently checked incremental results may improve responsiveness. These are hypotheses, not evidence that conversational UX is better or faster.

## 5. Alternatives considered

| Option | Benefit | Limitation | Judgment |
|---|---|---|---|
| Expand structured inputs | Predictable requests and easier evaluation | More options still require questions to fit a preset taxonomy | Keep optional controls, do not make this the primary direction |
| Basic chatbot over the packet | Fastest way to test open-ended questions/follow-ups | A transcript alone makes evidence and the reusable deliverable harder to inspect; arbitrary prose can bypass current checks | Useful experimental baseline, insufficient final workspace |
| Focused agentic research workspace | Natural intent, bounded investigation, reviewed artifact and continuation | Requires new intent/output/state contracts; can add latency | Preferred direction, staged into P0 and P1 |
| Autonomous multi-agent system | Potential specialization for larger investigations | Coordination, cost and failure modes without demonstrated need | Deferred |

## 6. Recommended direction

Build a focused analyst research workspace with a thread and a concise artifact. Start with one supported company/source set; allow varied questions within it. Show coverage explicitly. Suggested prompts help discovery; goal/risk/holding-period controls become optional and appear only when relevant. Do not force a margin question into an income/growth/resilience rationale.

ChatGPT already supports source-based iterative work and reusable deliverables; a chat layout or citations alone cannot establish differentiation. Our proposed advantage is financial definitions/calculations with lineage, disciplined claim-to-source checks, transparent coverage limits and a stable artifact through corrections. Compare actual tasks against a strong ChatGPT attempt before claiming superiority. [Official ChatGPT prompting guidance](https://learn.chatgpt.com/docs/prompting).

## 7. Decisions and tradeoffs

**Directional decisions from Helen:** natural-language prompts primary; structured suggestions optional; research execution delegated; clarification selective; evidence-backed structured artifact; actual progress; analyst review/redirection; minimal orchestration. These authorize planning, not an indiscriminate rebuild.

**Recommendations:** preserve NVIDIA frozen SEC coverage initially; one bounded agent/controller; no mandatory separate planner model; session-level context; question-specific answer contract; checks required by code rather than optional model actions. Add code-derived GAAP operating margins if margin analysis is the first task.

Flexibility reduces predictability: validate intent/source coverage without silently narrowing the question. Autonomy requires stop conditions: cap tool/model work and expose missing evidence. Responsiveness requires reliability: status can stream immediately, but claims enter the artifact only after unit-level checks. Reading partial tokens is not checking evidence. Optional clarification should not become the old form delivered one question at a time. [OpenAI streaming guidance](https://developers.openai.com/api/docs/guides/streaming-responses).

## 8. V2 scope

**P0:** open-ended prompt; contextual follow-up in the same active session; source-backed answer and concise artifact; optional suggestions; explicit source dates/unsupported requests; reuse evidence display and genuine basic status/error handling. Release criterion: ask an objective, inspect a sourced answer, ask a follow-up that uses prior context without re-entering setup. This is a focused conversation prototype; adaptive execution is claimed only for actual implemented tool decisions.

**P1:** richer execution visibility/tool activity; independently checked progressive artifact patches; selective clarification beyond essential scope handling; easier redirection and artifact version comparison. Basic honest error/status behavior stays in P0. “Persistent workspace” initially means retained through turns in the active session; refresh recovery and cross-session storage remain unresolved, not implied.

**Deferred:** multi-agent orchestration, complex long-term memory, live news/prices, arbitrary uploads/companies, full forecasting, automatic next-filing monitoring, elaborate reasoning displays and visual imitation of named products. Microsoft/Alphabet cloud comparisons and full 10-K risk work are future coverage tests, not P0 promises.

## 9. Evaluation plan

Compare Prototype 1 and Prototype 2 using the same frozen documents on shared supported tasks. Include natural-language requests P1 cannot express directly and record the user's translation burden; do not invent a V1 chatbot. Start with NVIDIA operating profitability/change, sustainability qualifiers and a source-linked follow-up. Test unsupported company/10-K/current-price requests for honest coverage handling, not successful research.

Primary measures: completed objective, time to first useful checked insight, citation support. Secondary: total reviewed task time, required interactions, corrections, omissions, perceived effort, model/tool cost and failures. Evaluate accounting periods/definitions and material counterevidence, not only quote matching. Test zero/necessary/unnecessary clarification cases and a correction across turns. Include every failed/incomplete run in the denominator.

A matched ChatGPT trial uses identical sources, objective and follow-up with a strong prompt; record actual model/tools and user effort. No such trial has run. A general agent may legitimately have broader coverage; a frozen-source trial and an end-to-end retrieval trial answer different questions.

## 10. Open questions and approval checkpoint

1. Approve analyst-first NVIDIA operating-profitability research as the first task, with frozen releases and code-derived operating margin? Gross margins, full 10-K and other companies require separate data scope.
2. Approve P0 as prompt + contextual follow-up + artifact in an active session, with progressive findings/richer steering in P1? Cross-session persistence is not included in this recommendation.
3. Approve the minimal single-agent/controller plan, source/step budgets and public-company-only free-text policy before implementation? Open-ended text removes the old guarantee that inputs cannot contain identifiers; raw prompts should not be logged by default.

See [technical plan](TECHNICAL-PLAN.md) for reuse, sequencing and acceptance criteria. Review the concrete decisions before coding; document changes as evidence accumulates.

## Strategic addendum (D63)

Helen asked whether the proposed workspace earns a distinct product or should become a finance capability inside ChatGPT. [Differentiation and embedding assessment](DIFFERENTIATION-AND-CHATGPT.md) recommends one reusable financial evidence/calculation/state backend, tested through a focused standalone harness before optional MCP embedding. Specialist value must show reduced analyst checking/revision effort, not just a chat UI. Same-session evidence correction is the smaller differentiating experiment; a period-isolated thesis replay is a larger proposal. Existing P0/P1 source/session and implementation approvals are not silently expanded.

## Approval update (D65)

Helen approved the [D64 initial release scope](RECOMMENDED-LAUNCH-SCOPE.md). This resolves the initial implementation approval checkpoint. A zero-or-one evidence-linked next-investigation action is recommended as a small MVP refinement; automatic adjacent research and larger source/retention/embedding proposals remain unapproved.
