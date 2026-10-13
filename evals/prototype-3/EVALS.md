# Prototype 3 evaluation contract

2026-10-12 · D86 · based on [E1–E5 specification v1.2](../V2-PREBUILD-REFERENCE.md). Cases and safety gates are retained; all V3 scores start unscored.

## Compare supported research outcomes

Use the identical question and frozen report hashes. Record prototype/commit, prompt/schema/fact-preparation version, model, effort, output cap, tool calls and all outcomes. The first experiment changes the answer contract, prepared fact coverage and allowed output together at fixed effort; do not attribute gains solely to reasoning effort. ChatGPT's supplied web-enabled answer is a separate unmatched baseline until equal sources/configuration are established.

Grade direct verdict, actual support/inference, material counterevidence/omissions, explanatory depth/weighting/synthesis, feasible distinct next investigation and contextual continuation. Use 0 fails / 1 partial / 2 useful, plus usable after review / substantive revision / unusable. A critical material factual, basis, support or causal error blocks acceptance; do not average it away. Judge why the evidence matters and what would change the thesis, not heading count, answer length or confidence labels. Preserve uncertainty without rewarding blanket refusal.

E1 durability: current performance vs persistence, operating leverage, relevant management outlook and specific execution evidence, material cash-conversion qualifications; no moat/pricing-power claim established merely by high margins or CUDA mention. E2 cash: accounting bridge vs business causes and cash vs margins. E3 change: paired period-specific execution evidence, not new wording as a new event. E4 next action: advances the objective without redundant context re-entry and preserves earlier checked work on failure. E5 limits: no invented prices/news/issuer/call access; preserves earlier useful answers. Frozen sources cannot establish stock attractiveness or precise future durability horizons.

## Compact UI must preserve analytical safety

- Summary and expanded text must both pass number/source/text checks. Summary retains its essential caveat; collapse cannot turn uncertainty into certainty.
- Every detail remains inspectable; citations use actual code-owned source lineage. Exact quote matching does not certify inference.
- Findings can arrive before completion, but final verdict/assessment depend only on surviving linked findings. Stop/recovery/failure clears provisional output. Obsolete identity/revision events do not publish.
- Wrong units/fiscal/GAAP headings, inconsistent prior figures, invented guidance calculations, duplicate/overflow findings and malformed events must fail safely. Specific exhausted-credit errors get no automatic retry or false research answer.
- Check keyboard disclosure/source focus, narrow layout overflow, retained composer/Stop access, reduced-motion styling and numbers in mono. UI proof and authored examples are not model quality passes.

## Trial procedure

First complete one matched V2/V3 E1 pair and review it, preserving failed candidate attempts. Then run three attempts per E1–E5 on a frozen candidate, plus held-out paraphrases/real analyst tasks and needed live safety variants. Measure first useful checked finding, full completion, all failures/recoveries, source-checking/editing minutes, corrective prompts, tool/model counts and estimated/reserved usage. Tiny samples do not establish a latency guarantee or p95.

Only after the richer-contract test, hold the V3 contract/facts/output fixed for an effort comparison if needed. Keep source expansion a separate labeled experiment. Full control/pilot gates from the existing architecture/safety contract remain in force.

Public fixture commands (API key stays in local environment):

```sh
V2_DEBUG_CAP_USD=0.5 node --env-file=.env.local scripts/debug-v2.ts --live
V3_DEBUG_CAP_USD=0.5 node --env-file=.env.local scripts/debug-v3.ts --live
V3_DEBUG_CAP_USD=1 node --env-file=.env.local scripts/debug-v3.ts --benchmark 3
node scripts/debug-v3.ts --replay /absolute/path/to/public-v3-capture/result.json
```

Each script ledger bounds that invocation including failures; it is not an account-wide or deployed aggregate spend limit. Captures are public-fixture-only and ignored by Git. Never run an attractive-samples-only batch or feed held-out reference answers into runtime prompts.

## D87 / D88 reported-first acceptance slice

Check direct reported rates/precision and source columns; missing-rate/ratio fallback with explicit formula/inputs; period/unit/GAAP/baseline rejection; optional legacy fact/cache data; compatible rounding vs actual discrepancy; cross-report baseline and dependent-comparison withholding; no exact-quote bypass of a disputed financial row; source-owned reported/calculated labels and visible discrepancies through progressive/partial/check-failed states. Version fact preparation in all new runs/replays. Preserve earlier candidate records without regrading silently. These deterministic/browser checks do not establish live synthesis quality or latency.
