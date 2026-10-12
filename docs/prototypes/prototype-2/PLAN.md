# Prototype 2 iteration plan

Status: discovery and local candidate; no Prototype 2 deployment. Updated: 2026-10-12. Decision: D60.

**Recommended user job:** A wealth advisor preparing to explain what the latest earnings evidence means for a holding's stated rationale before a client conversation. Buy-side thesis review is a separate validation task.

**Starting hypothesis:** A concise brief that reliably connects company developments to the stated context, shows supporting and qualifying evidence, and finishes quickly will reduce explanation, checking and editing work. We will revisit this after practitioner tasks; it is not an irrevocable scope decision.

## Sequence

1. Review Prototype 1's learnings with Helen and run the concrete practitioner tasks. Decide which user job and output is worth improving before adding sources or more agent steps.
2. Write the task and input → useful output contract. Keep primary goal separate from holding rationale. Define an honest unresolved answer, a checked partial result and a generation failure as distinct states. Preserve the approved bounded inputs unless discovery changes the need.
3. Evaluate the retained local candidate: evidence-first generation, bounded references, compact response and lighter reasoning. Keep complete approved releases and code-owned arithmetic. The candidate is not yet the deployed default. Capture incomplete-generation reasons and repeat the previously failing case.
4. Improve speed only with traceable reuse: exact checked-result reuse keyed by all inputs, source hash and model/prompt/schema/config versions, labeled when served. Company-level evidence preparation plus context synthesis is a later architecture experiment if the initial candidate is still too slow; evaluate material omissions before adopting it.
5. Test the full setup → wait → result/recovery journey. Give the output useful state and evidence hierarchy; avoid adding sections that do not help the task. If a headline fails, checked supporting content should remain usable without pretending a complete takeaway passed.
6. Deploy a separate protected Preview after the evaluation gate, tag its exact release commit `prototype-2`, and compare with Prototype 1. Save the release configuration, outcomes, screenshots and retrospective.

## Comparison cases and proposed gate

Keep the same NVIDIA source pair initially to isolate changes. Freeze these fixtures: default income/dependable-income/short/low; Helen's failing income/profitable-growth/short/medium; growth/profitable-growth/long/medium; capital-preservation/resilience/short/low. Add goal-only and horizon-only variations for context relevance. Test the full accepted input space before claiming all combinations are covered; these fixtures alone are not exhaustive.

Suggested small release gate: three completed runs of each fixture with a useful checked assessment or a clear evidence-based unresolved answer. Include all failed/incomplete attempts in the denominator; do not rerun until the sample looks clean. No dangling finding references, unsupported rendered numbers or silently altered inputs. Manually review material claims, source completeness/counterevidence and period/accounting distinctions. A passing small gate does not establish production reliability.

Provisional latency target: median server run below 45 seconds on those fixtures, with observed range and sample size reported; total browser time measured separately. Report time to useful output, not just activity indicators. Revisit the acceptable wait with practitioners. Do not call a small-sample maximum a measured p95.

The product gate is separate: do users finish the explanation task with less total checking/editing effort and fewer material omissions? Compare with their existing workflow; a matched ChatGPT task can test whether guided context, evidence checks and recovery add value. A faster valid JSON response alone does not answer that question.

## Agent PM questions for each change

What decision does the model make? What must code guarantee? Which evidence can the system access, and when is it stale? What happens if it cannot complete or support a claim? How will we observe and evaluate the whole task? Would an extra agent/tool step improve the task enough to justify its latency and failure modes?

The current flow has bounded model judgment and programmatic checking. It does not have an adaptive investigation loop. Add saved watch items or next-filing investigation only when that continuation serves the validated job; define tools, stop conditions, evidence checks and recovery before calling it implemented.

## Scope to keep bounded during the first comparison

One holding, the same official SEC release pair, approved context controls and protected Preview. No new licensed/login-gated data sources, arbitrary personal data, live trading/news, extra companies or scheduling until a product decision justifies the expansion. This is the recommended comparison boundary, not a rejection of rethinking the product.

Technical candidate details and measured successes/failures: [reliability and latency investigation](../../../evals/BRIEF-RELIABILITY-LATENCY-2026-10-12.md).
