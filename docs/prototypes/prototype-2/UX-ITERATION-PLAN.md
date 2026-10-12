# V2 UX iteration priorities

2026-10-12 · D77 · Helen feedback captured; implementation recommendation, not completed functionality.

## Product direction

The thread becomes the primary research surface. Show real execution progress while working, then a compact checked answer in that thread. A brief/source pane opens only on user selection. Remove the footer layout chooser. Header navigation returns to a thread index; an adjacent accessible new-research icon starts a distinct thread. Preserve A3 tokens, typography, light mode, reduced motion and keyboard/focus rules.

## Recommended implementation sequence

1. **Turn/attempt state, timing and recovery.** Store each question once with its answer/artifact revision, attempts, stage durations and terminal status. Current code duplicates failure copy in the answer and separate Outcome, and Retry creates a duplicate question. Replace this with one assistant outcome for the turn, retry attempts grouped beneath it, and expandable attempt history. Attach artifacts to the turn that produced them so a failed follow-up cannot display an older brief as its answer. Exclude generic failure copy from model research context. Record stage start/end and total duration from actual execution events; distinguish server durations from client waiting time. Freeze timing on completion, failure or Stop. Display active elapsed time, completed action durations and total time with a restrained token-based active indicator. Do not synthesize a scripted sequence of actions or expose private reasoning. Show one active line by default; details expand.
2. **Checked answer in thread and optional brief pane.** Stop automatically navigating to the brief on success. Render takeaway, up to three selected financial rows (label/value + comparison/implication), supporting and qualifying findings, expandable calculation basis/cash bridge, unanswered criteria and zero/one supported next-investigation CTA directly in the answer. Reuse a single answer component and artifact data for thread and optional pane. Open brief/source inspection on explicit selection; close returns focus and preserves thread position. Mobile uses a dismissible full-width inspection view rather than mandatory Thread/Brief navigation. Preserve the compact hierarchy rather than repeating the entire answer twice in the same column.
3. **Inline evidence with accurate support.** Replace separate boxed citation numbers with compact inline source links near the supported finding/clause. Initially existing finding-level passage links can sit at paragraph ends; do not imply sentence-level support without a real mapping. Exact passage inspection remains available. Evaluate citation coverage as well as placement: D76 identified a qualitative finding combining execution/outlook/financing without excerpts supporting every material clause. Split the finding, add appropriate support within output limits, or omit extra claims; moving a link alone does not resolve this.
4. **Header and thread index.** Replace Thread/Workspace/Command footer controls with one product navigation model: Research/header back to thread index, current thread title, accessible new-research icon, optional inspect/close control in the thread. Index shows title, last activity and outcome. Recommendation for the prototype: bounded device-local history with an explicit local-storage label and delete/clear controls; account sync/database/login is later. Persistence is a proposed expansion from current memory-only state, not already implemented or silently approved. Stored turns remain user context, never server-authoritative evidence. Version stored records and retain artifact/source dates; switching views must not misroute in-flight results or silently cancel them. Keep one active run and make Stop reachable.

Steps 1–3 are the first useful batch. Header simplification can accompany step 2; the multi-thread store/index is the larger follow-on because it changes session ownership, lifecycle and recovery.

## Recovery contract

Use structured, recorded run facts to explain: what completed, where the attempt stopped, what remains available, and a feasible next action. Code can render these without paying for a separate explanation model call. Never invent a provider cause or claim a new strategy when Retry resends the same request. Only describe a changed scope/strategy if it was actually executed. No automatic repeated calls are added. Distinguish timeout, incomplete generation, reference rejection and missing source coverage. Retry repeats an attempt under the original user question; an edited objective or follow-up is a new user turn.

Illustrative timeout copy, only when supported by the recorded stages: “The reports were prepared, but the answer did not finish within the time limit. No new brief was published. You can try again or narrow the question.” A same-strategy retry is labeled as such, with its own elapsed time. Preserve the previous valid answer in its original turn.

## What can appear during work

Real stage events, elapsed time and confirmed source availability may appear immediately. The checked answer appears after completion under the current contract. Independently checked incremental findings are a later output-contract change: each section needs complete references, dependency checks, turn/revision identity and a way to revise earlier conclusions. Do not treat provider text deltas as checked findings. More tools, model calls or subagents are not required for the requested progress UI.

## Acceptance checks

- Running stages show actual elapsed time and finish with a stable duration; Stop and errors stop the clock. Reduced-motion settings suppress nonessential animation. Do not announce every timer tick to screen readers.
- Success leaves the user in the thread with the full compact answer and working disclosures; optional inspection preserves context and focus.
- A timeout followed by retry displays one user question and traceable attempts, with one current failure/outcome. Failed follow-ups cannot inherit the prior brief as their answer.
- Inline source links open the intended passage and do not overstate the scope of evidentiary support; numerical values still come from code-owned facts.
- New-thread/back/reopen actions preserve correct thread ownership. If device-local persistence is adopted, reload, schema migration, storage failure, deletion and in-flight restoration are covered; a reloaded in-flight run becomes interrupted, not falsely running or complete.
- E1/E2/E3 content, E4 continuation and E5 failures remain part of evaluation. Measure time to a usable checked answer, user checking effort and recovery success as well as animation responsiveness.
