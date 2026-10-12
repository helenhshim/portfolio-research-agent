# Six-case engine comparison

Actual API trials: three issuers × two input contexts × focus/single-pass. Frozen source packets, same model and reasoning effort. One sample per arm; exploratory evidence, not a statistical superiority claim. Reviewed by the assistant, not by independent practitioners.

| Case | Focus seconds | Single-pass seconds | Focus / baseline shown items |
|---|---:|---:|---|
| NVDA / income | 30.1 | 19.0 | 9 / 8 |
| NVDA / growth | 28.5 | 20.8 | 9 / 10 |
| JPM / income | 27.8 | 16.5 | 7 / 8 |
| JPM / growth | 35.3 | 18.0 | 10 / 9 |
| COST / income | 24.0 | 18.3 | 7 / 9 |
| COST / growth | 26.7 | 20.2 | 9 / 10 |

All corrected outputs passed implemented mechanical checks. This does not establish entailment, useful completeness, or practitioner acceptance. Item counts are descriptive, not a quality score.

## Findings and practical limits

- Focus selects different questions for income versus growth: payout funding versus deployment/growth durability at NVDA, annual payout coverage versus business/earnings quality at COST. This is evidence of contextual selection, not proof of improved outcomes.
- Single-pass already produces useful watch questions and several of the same material findings. Added focus has not established a general quality advantage.
- Focus produces an inspectable evidence trail, but roughly doubles model input and increases latency. Review utility needs practitioner validation.
- COST income focus correctly refuses annual dividend-coverage inference from quarterly fact IDs. The missing annual comparison is a data/tool capability gap, not something more confident model prose should fill.
- JPM growth focus exposes a missing managed-to-GAAP reconciliation in its returned passages. Search relevance/context needs improvement.
- Short matched labels do not prove the surrounding interpretation. Some attached excerpts do not cover every material assertion, even though mechanical verification passes.
- Internal profile field names leaked into prose. This requires prompt and presentation repair before user-facing output.
- Temporary rate limits interrupted the first batch; missing arms completed with a bounded delayed retry. Billing credits worked.

## Decision for next iteration

Keep focus as an experimental, inspectable mode while improving evidence attachment and retrieval context. Do not claim it beats single-pass or ChatGPT. Preserve baseline mode. Actual ChatGPT product comparison and independent usefulness review remain pending; no production release should imply otherwise.
