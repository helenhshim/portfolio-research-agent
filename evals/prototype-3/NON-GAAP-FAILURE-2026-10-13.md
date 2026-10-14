# Non-GAAP quotation failure and bounded repair

Question: “How does NVIDIA’s non-GAAP treatment of equity gains and stock-based compensation affect the usefulness of its earnings comparison?”

## Evidence

The hosted Preview logs contain a check_failed run on deployment dpl_433sUjUXCfLcypaU3ZALYrV4uAPz at timestamp 1791935979643. It took 18.7s. Code-owned drops: finding/quote_mismatch, then takeaway_dependency/invalid_dependency. Questions/drafts are deliberately not logged, so timestamp/error correspondence identifies this as the likely reported run, not content-based proof of its exact question or bad excerpt.

Fresh reproduction of Helen's exact question passed all checks in 18.1s (capture .research-runs/continuation-1791936202372). This establishes intermittency, not that the original failed quotation was valid. The approved current report supports the equity-gain exclusion and updated treatment retaining stock-based compensation; exact source fidelity remains required.

## Fix (D114)

If the initial verdict fails because it depends on findings rejected solely for quote mismatch, use the remaining existing second provider slot for citation-only repair. Model returns exact evidence patches for rejected finding IDs, or null if unsupported. Code merges only evidence; claims, values, fact IDs, takeaway, rows and other content are preserved. Null removes the unsupported finding, and its dependent verdict still fails normally. All normal checks rerun. Do not invoke this path for free quantities, unknown facts, other rejected finding causes, or after a tool/formatting continuation has already used the second slot. Stop/deadline/budget still apply. No new sources/tools, no third provider call. The repair disables tools and caps output at 1536 tokens. Normal answers have no additional call.

Already-verified incremental findings remain available during repair; invalid findings are never published. Final reconciliation is still authoritative. Repair may add latency and cost on failed quotations; it is not a guarantee of semantic support.

## Verification

- 176 tests, typecheck and optimized build pass.
- Regression coverage: successful repair without changed claims/figures, still-invalid repair stops after second call, unsupported evidence removes finding, foreign patch fields rejected, free quantities do not trigger repair, wire schema accepts only citation patches with tools disabled, Stop during repair aborts.
- Forced live repair: an exact source quote in the saved public reference was deliberately replaced with a synthetic mismatch. First response was scripted, the remaining repair call was real. Result complete with zero drops in 5.0s; repair returned source-matching evidence. Capture .research-runs/continuation-1791936507042. This is not a measured two-live-call total or population-level reliability result.
- Public reference fixture: NON-GAAP-REFERENCE-2026-10-13.json. No participant/private data captured.

Hosted deployment results recorded in PRD after release. Production unchanged.

Release: deployment jmxam8g6f Ready; stable protected V3 alias updated. Authenticated page smoke passed. No new paid hosted question run or manual visual check in this checkpoint. Local build and test count as above. Existing $10 allowance and production restriction unchanged.
