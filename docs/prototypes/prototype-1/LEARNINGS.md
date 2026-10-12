# Prototype 1 learning review

Updated: 2026-10-12. Evidence: Helen's feedback, live release checks and local diagnosis. No practitioner pilot has been completed.

| Hypothesis or decision | Observation | What we learned | Prototype 2 implication |
|---|---|---|---|
| An advisor needs an explanation specific to the holding rationale | Helen found generic “growth is showing up” language insufficient and asked for what happened, goal implication and what remains unanswered | User-context relevance is more demanding than a summary; this is founder feedback, not target-user validation | Test a concrete advisor task; measure whether the output helps explain the holding |
| Complete releases offer better context than short keyword matches | Full-source trials produced specific product/execution/financing qualifications and selected financial support | Full sources are a promising design direction; superiority and material-omission performance are unproven | Retain full-source availability while evaluating speed and omissions |
| Every legitimate combination should yield a useful checked answer | Income/profitable-growth/short/medium lost its assessment because two referenced findings did not exist | Valid mixed intent exposed a schema/dependency problem, not a reason to prohibit the input | Generate evidence first, constrain references, preserve useful checked content and distinguish failure from unresolved evidence |
| Higher reasoning effort produces an acceptable experience | Recent deployed waits were about 123–160s; exact failing reproduction 126.196s | Latency and useful completion are part of product quality | Measure time to useful result alongside quality; reduce redundant generation before adding capabilities |
| A lighter compact candidate can preserve quality | Successful local trials took 39–43s; three early calls were incomplete and a stable/high call timed out | Promising speed improvement, with unresolved reliability and small-sample limits | Repeat controlled cases and capture every failure before a release decision |
| Verification reduces user checking work | Code checks caught bad links; semantic interpretation still needs review | Mechanical checks are necessary but do not establish reduced human effort | Time citation checking and editing in a real task, against the user's existing workflow |
| Earnings research solves the target user's main problem | Helen also wants current movement/news; advisors and analysts may have different jobs | Quarterly explanation is narrower than ongoing monitoring; the most valuable user job remains to be established | Prioritize advisor conversation preparation for discovery; evaluate analyst thesis checking separately |

## Reflection prompts for Helen

1. Describe one moment when an advisor would open this. What are they trying to finish, and what do they use today?
2. Which output would they reuse: the takeaway, a client explanation, the evidence table, or a watch question? What would they still rewrite or verify?
3. Which failure is a dealbreaker: generic relevance, missing takeaway, slow wait, incomplete evidence, or stale coverage? Use observed tasks to rank them.
4. What changed your mind between the original PRD and this prototype? Separate a user-value insight from a technical fix.
5. If Prototype 2 could improve only one thing, which change would make the task materially easier?

## Evidence to collect next

Recruit two wealth advisors for exploratory tasks and, separately, one buy-side analyst if available. Use public example holdings and no client identities. Have each complete one specific task with Prototype 1 and their usual approach, alternating order across participants where possible. Observe what they click, check, discard and rewrite; capture total time, missing material facts and whether the result can be used after review. This is directional discovery, not a statistically powered study.

Record task/input, run ID, elapsed time, successful/partial/failed outcome, source cutoff, what was useful, what was checked/edited, and what would change their interpretation. Preserve failures in the comparison set. A statement such as “I like it” is weaker evidence than a completed task with less checking and a clear explanation of why.
