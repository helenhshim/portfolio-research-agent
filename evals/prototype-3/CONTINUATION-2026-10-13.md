# D106 continuation evaluation — October 13, 2026

Purpose: verify an answer-to-follow-up journey, not just the existence of a CTA. Fixed public frozen-report inputs only; no participant data. Runs use the shared research allowance and a separate $1 local experiment cap. Script: scripts/eval-v3-continuation.ts. Capture directory: .research-runs/continuation-1791927871949.

## Rubric

- Direct answer: addresses the submitted question with supported evidence.
- Incremental value: suggested follow-up adds analysis not already explained.
- Execution: asking the suggestion produces that promised new analysis.
- No loop: subsequent suggestion does not repeat the initial answer or follow-up.
- Source boundary: unavailable attribution is named explicitly, never invented.
- UI duplication: no second financial table under evidence inspection; formulas only for derived selected figures.

Reference-check success is mechanical validation, not proof of semantic quality. Manual grades below are developer review of these samples, not participant feedback or population-level results.

## Results

| Case | Result | Time | Manual observation |
|---|---|---:|---|
| Revenue overview | Complete | 12.6s | Covered revenue growth, concentration and outlook; suggested operating leverage, which was not explained. |
| Execute operating-leverage suggestion | Complete | 18.3s | Added expense/income comparisons, sequential versus annual margin expansion and cash-conversion qualification. Passed incremental-value check. |
| Cash-flow control | Complete | 21.8s | Explained accounting contributors versus improved realized margins; suggested distinguishing equity-gain reconciliation from investment-sale receipts. |
| Missing attribution | Complete/source-limited content | 8.9s | Explicitly withheld unavailable mix/pricing/cost/Rubin attribution; offered a different, available margin/outlook comparison. |

All four returned mechanically checked answers. The revenue follow-up's next suggestion moved to the unexplained cash bridge, not back to the overview. That second suggested follow-up was reviewed but not executed. Cash-flow and attribution suggestions were also not executed in this run. The attribution case had no prior margin-comparison history; prior D103 history-sensitive suppression was tested separately.

168 automated tests, TypeScript and build passed. Code inspection confirms no second evidence table; calculated selected values/comparisons use formula/input disclosure. No manual browser visual check or external participant scoring in this checkpoint.

Limitations: single model sample per case, selected public questions only, no latency distribution or general reliability claim. Whether a suggestion feels useful remains a human judgment. Null remains allowed when evidence is exhausted. No added model call for selection.

## Release verification

Deployed protected Preview `portfolio-research-agent-716hxxy8y-helenhshims-projects.vercel.app`; authenticated page smoke passed and the stable V3 pilot alias was updated. Production and deployment protection unchanged. No paid hosted API run or manual browser visual check in this checkpoint. Refresh and generate a new answer to evaluate the revised prompt; saved answers retain their original generated content.

## D107 correction following user testing

The D106 fresh-session success did not cover Helen's profitability → revenue → repeated-revenue session. Browser inspection showed segment revenue/growth omitted on the repeat and no suggested investigation. This is an uncovered multi-turn case, not evidence that all supported investigation directions were exhausted.

Prompt v3-question-research-8 now forbids topic-level exclusion and retains essential revenue evidence. Added manual acceptance cases:
- Repeat revenue after profitability and revenue: total and dominant-segment revenue/growth remain available in the answer.
- Topic already covered, distinct comparison not covered: a supported deeper question remains eligible. Grade its promised additional insight, not word overlap.
- Same answer with different wording: do not suggest it as new research.
- Missing business causes: do not invent evidence or imply the next turn can retrieve unavailable material.

Automated suite and typecheck pass after the prompt update. New semantic acceptance cases are pending live evaluation; earlier D106 samples do not validate this revision. No added model calls in the application.
