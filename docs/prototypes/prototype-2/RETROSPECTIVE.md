# Prototype 2 baseline retrospective

2026-10-12 · D85–D86 · local checkpoint, not a pilot release.

Helen reports a more useful answer from ChatGPT on the identical profitability question: clearer verdict, stronger explanation and synthesis, useful analyst investigations. ChatGPT used additional NVIDIA web sources; this is not a source-matched quality grade. Mechanical reference checks and useful streaming improved, but semantic coverage, material omissions and analyst checking work remain unproven. Navigation/history and protected deployment remain deferred.

Inspection identifies output compression and a restrictive checked-number interface, alongside a source-coverage gap for earnings-call cost/margin context. V3 tests richer supported reasoning with the existing report pair before deciding whether extra evidence or effort earns its cost. Minimal presentation will use qualified summaries and expandable detail.

Return point: annotated tag `prototype-2-baseline-2026-10-12` at `89d9641` includes D85 documentation and unchanged D84 runtime. Branch `prototype-2` remains there. This explicitly overrides the earlier policy of waiting for a pilot release before creating a new prototype; Helen requested a recoverable V3 experiment. It does not mark V2's unresolved gates as passed. See [V3 baseline manifest](../prototype-3/BASELINE.json).

Git preserves source/lockfile/data, not credentials, deployment settings or session state. Do not switch branches over uncommitted V3 work. To inspect the baseline independently, export the tag into a separate directory and install its lockfile dependencies there; configure credentials separately if live calls are required. `/v2` remains alongside `/v3` for local comparison.
