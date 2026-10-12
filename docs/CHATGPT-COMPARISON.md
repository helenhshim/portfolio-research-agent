# Research-focus comparison

Status: protocol prepared on 2026-10-11; no trials run. Repo contains documents only. OPENAI_API_KEY absent from current shell at check time. No connected ChatGPT execution capability has been established. Do not present author-generated examples as independent model trial results.

## Questions

1. Does bounded research focus improve the engine relative to its own single-pass analysis?
2. Does the complete product improve the user task relative to a strong ChatGPT attempt?

These are separate comparisons: a ChatGPT difference alone does not prove the focus stage caused an improvement.

## Initial cases

Use three real, frozen source packets: NVDA, JPM, COST. Each packet contains the exact release, source URLs/accession/period/retrieval timestamp/hash, validated comparative financial facts computed by code, and any unavailable fields. Use income/short/low and growth/long/medium contexts for six cases. Same source packet across contexts; no live source drift. Choose cases before seeing outputs. This is exploratory, not statistical proof.

## Three arms

A. Single-pass engine: full release, identical facts and profile, structured output, same deterministic verifier. No research-focus tool loop.
B. Focus engine: identical base model/settings, full release available, same facts/profile/output/verifier, plus bounded question selection and actual evidence lookup. Capture questions, tool inputs/results, latency, tokens/cost, raw and final outputs.
C. ChatGPT: same packet and profile, a strong prompt requesting equivalent evidence discipline; record actual model, tools, settings, elapsed time, and user corrections. Use an actual ChatGPT session; do not substitute the app’s API model and label it ChatGPT.

Start with one holding case as a smoke comparison, then all six if the pipeline succeeds. Run each arm in fresh context; randomize output labels for review. Keep source packet prep cost separate and identical. ChatGPT may use available calculation/file tools, recorded explicitly. Frozen-source comparison isolates analysis; later end-to-end comparison can measure retrieval effort with equal scope and cutoff. Never penalize ChatGPT merely for not using our schema or internal tooling.

## ChatGPT prompt

Using only the attached SEC source packet, research [TICKER] for this context:
Primary goal: [GOAL]. Intended holding period: [PERIOD]. Risk tolerance: [RISK].

Identify up to two important research questions supported by the financial facts and relevant to this context. Inspect the release for supporting and conflicting evidence. Return concise financial changes and key updates, implications for these goals, and up to two concrete watch-next items. For each finding, show supporting fact IDs and short exact excerpts with source references. State unanswered questions and missing data explicitly. Distinguish reported facts, management outlook, and your interpretation. Do not invent forecasts, infer price-movement causes, or give buy/sell recommendations. Use the supplied code-computed comparisons; do not infer unprovided financial changes. Report the source period and freshness limit. Research questions themselves are not factual conclusions.

## Review rubric

- Supported assertions: inspect all material assertions and whether cited evidence entails them; count unsupported assertions rather than relying on quote matching.
- Financial validity: values, fiscal periods, units, metric definitions, and baselines; inspect omitted relevant facts as well as errors.
- Context relevance: 0 generic; 1 plausible but weakly connected; 2 explicit defensible link to goal/holding period and evidence.
- Watch items: 0 generic/unanswerable; 1 specific but incomplete; 2 observable signal with evidence baseline and meaningful strengthen/weaken interpretation.
- Coverage: pre-list material reference findings from the source packet; count misses and noise. Prefer human reviewer over model self-grading.
- User effort: instructions/corrections required and time to a useful, reviewed answer; source opening is not automatically a failure.
- Operational cost: latency, tokens/cost where available, lookup count, dropped/dependent claims, failures.

No invented outcome target such as a guaranteed percentage improvement. B must preserve accuracy and show an identifiable relevance/completeness/review-effort benefit over A to justify complexity. If not, simplify and retain useful focus/watch items within single-pass output. Compare C fairly and report differences in tools and output checking.

## Results

Pending execution. Preserve trial artifacts and reviewer notes; summarize failures as model, data, workflow, or design. Do not claim differentiation from a polished example or trial design alone.
