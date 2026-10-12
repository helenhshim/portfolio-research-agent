# V2 PM grading walkthrough

Companion to [the evaluation specification](V2-PREBUILD-REFERENCE.md), 2026-10-12. Teaching examples below are authored examples, not measured model results. This guide clarifies existing grading; it does not change scope or release gates.

## Review routine

Read the question and available source context before the answer. State the user's desired outcome in one sentence. Inspect displayed claims against the checked facts and relevant source passages; passing quote/reference validation alone does not establish support for an interpretation. For agent behavior, inspect action/result records; for continuation, exercise the actual UI.

First flag any critical correctness/support error. Then score each applicable quality dimension from the reference: 0 = fails, 1 = partial, 2 = useful, or N/A with a reason. These are dimension scores, not a single overall 0–2 grade. Do not average away a critical error. Finish with analyst acceptance: usable after review, needs substantive revision, or unusable. Record the exact problem, required edit and review effort. Uncertain factual/financial judgments stay pending for a qualified reviewer; uncertainty is not a verified pass or automatic model failure.

## E1: Does it answer the durability question?

User asks whether the report strengthens or weakens durable operating profitability. Inspect the conclusion, selected financial evidence, business evidence and qualifications.

Pressure-test questions:

- Does it state what improved now and what remains unknown about persistence?
- Does it explain why each selected number matters for this question?
- Is business evidence specific to the reports, and does the interpretation stay within what it establishes?
- Is material qualifying evidence visible and connected to the conclusion?
- Would an analyst still have to ask “so what?” or rewrite the thesis connection?

Useful pattern: operating margin improved modestly alongside revenue; reported Rubin production progress supports execution, but future product economics remain unestablished and the cash decline requires scrutiny. Relevant claims still need actual source support.

Partial pattern: correct revenue/profit numbers with “growth is strong; risks remain.” Objective relevance is partial because the analyst must supply the implication. Critical failure: claiming the quarter proves durable margins or recommending the stock from this evidence alone.

Rubric check: do not require our exact prose or every reference metric if different evidence gives an equally sound answer.

## E2: Does it distinguish an observation from its cause?

User asks why cash fell and whether margins deteriorated. Inspect factual comparisons and every statement of cause.

- Does it separate cash flow from operating margin?
- Is each asserted driver supported, or merely a plausible explanation?
- Does it use comparable definitions and periods?
- If cause is unresolved, does it say what we can conclude and what evidence would resolve it?

Useful pattern: cash fell sequentially while operating margin rose; the observed cash change does not establish margin deterioration. Annual cash improved. Without a source-backed reconciliation, the cause remains unresolved.

D71 correction: the existing reports contain component tables, and [reference revision 2](V2-REFERENCE-REVISION-2.md) provides an offline reconciled accounting bridge. A strong E2 answer should use the available checked contributors once implemented while retaining uncertainty about why receivables/liabilities changed. Distinguish an accounting contribution from an underlying business cause; a blanket “no information” response can be incomplete. No new Helen score or model result is inferred from this refinement.

Partial pattern: “We cannot determine the cause” without answering the margin question or identifying the evidence gap. Critical failure: “Cash fell because of inventory buildup” without evidence, even if all displayed numbers and citations match.

Rubric check: missing causal evidence must not force a fabricated explanation; a supported explanation should also be allowed if the available evidence establishes it.

## E3: Does it identify a supported change between periods?

User asks what changed in the next-product story. Inspect evidence from both quarters and the precise change claimed.

- Can I reconstruct the before/after from the two passages?
- Is this a reported change, newly mentioned information, or an inference?
- Does the answer distinguish company-reported progress from independent verification?
- Does it preserve qualifiers such as “ramping” rather than claim completion?
- Does the implication follow without inventing margins, realized demand or sales?

Useful pattern: Q1 announced Rubin; Q2 reports ramping into full production with racks at partners. This supports reported execution progress, not realized future margins or repeat demand.

Partial pattern: describing Q2 alone without establishing the prior baseline. Critical failure: treating reported ramping as completed rollout or stating Rubin is already increasing margins without evidence.

Rubric check: valid quotes from both quarters do not automatically validate the claimed change. Omission from one report is not proof of absence or reversal.

## E4: Does the suggested investigation advance the task?

This is a multi-turn workflow test. Read the first brief, select its justified action, observe execution, then review the revised artifact and preserved context.

- Does the suggestion address a specific unanswered issue linked to the objective?
- Is it new, and can current tools/sources actually answer it?
- Does the CTA carry the goal and linked finding without asking the user to repeat them?
- Does the result answer the selected question and explain its effect on the earlier interpretation?
- Are earlier checked findings preserved coherently, including when the turn fails?

Useful cash continuation: add +56.7% YoY alongside −52.2% QoQ, explain the difference in baselines and preserve uncertainty about cause. The headline need not change if the investigation does not warrant it.

Partial pattern: the click produces correct annual cash data but leaves it disconnected from the brief. Failure: loses the research objective, invents a cause, contradicts retained findings or erases valid work.

Rubric check: do not reward a CTA already answered in the main brief. A justified omission is acceptable. If a fixed prior-turn fixture is used to exercise the cash CTA, label it; that proves continuation behavior only, not spontaneous suggestion quality. The scripted mockup is not a model eval.

## E5: Does it handle missing coverage honestly and usefully?

User asks about this week's price movement or another company's earnings call. Inspect the limitation, any claimed retrieval and the state of prior work.

- Does it name the actual missing source/company/time coverage?
- Does it avoid explaining current events using stale reports?
- Does it preserve the prior brief and offer a feasible refinement?
- Are any promises to retrieve evidence consistent with implemented capabilities?

Useful pattern: these frozen reports cannot establish this week's price drivers; dated prices and relevant news are needed. The existing business brief remains available and the user can refine the question to the available evidence.

Partial pattern: accurate refusal without specific limits or a feasible path forward. Critical failure: attributing this week's price change to an earnings development without current evidence or fabricating a news search.

Rubric check: passing this case proves trustworthy limitation handling, not completion of price research. If frequent real tasks fall here, reconsider source scope separately from response quality.

## Record an evidence-backed judgment

For each run, use: case/run/version; critical error yes/no/pending with exact claim and source; applicable 0–2 dimension scores with evidence; acceptance; required revision and reviewer effort; possible failure cause and next diagnostic.

Example, authored: E1 / relevance 1 / no identified critical error / needs substantive revision / “The answer lists margin growth but never explains what it establishes about persistence” / add a bounded thesis implication / review effort not measured. Do not label a suspected prompt or model cause as confirmed without checking context and action records.

Start calibration by independently grading a useful, partial and misleading example for each case, then compare judgments. Disagreements identify ambiguous rubric anchors. This follows [official OpenAI evaluation guidance](https://developers.openai.com/api/docs/guides/evaluation-best-practices) on task-specific evaluation, examples and human calibration. Real output trials remain pending.
