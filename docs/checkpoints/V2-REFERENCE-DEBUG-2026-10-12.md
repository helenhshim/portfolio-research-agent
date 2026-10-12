# V2 reference-check debugging

2026-10-12 · D74 · Local schema bug reproduced without an API call; fixed locally; the subsequent live validation timed out.

## Confirmed defect

`v2DraftSchema` reuses the same `strings` object for finding fact IDs, takeaway/row finding IDs and next-action metric IDs. `structuredClone` preserves these shared references. In `apiSchema`, assigning an enum to one field therefore changes the others. The final metric enum assignment made all these API fields allow only metric names:

```json
{
  "finding_fact_ids": ["revenue", "operating_income", "operating_cash_flow", "operating_margin", "cash_bridge"],
  "takeaway_finding_ids": ["revenue", "operating_income", "operating_cash_flow", "operating_margin", "cash_bridge"]
}
```

The verifier correctly expects exact fact IDs (such as `NVDA:operating_margin:current`) and finding IDs (`finding_1`–`finding_3`). Strict output constrained the model to references incompatible with those checks. The API schema construction is defective; a valid-looking JSON shape does not make its cross-field references valid.

This defect is reproducible in the serialized request sent to the injected fetch. It explains the reference incompatibility, but the original live drafts were not retained and cannot be reconstructed exactly. The historical incomplete response may have been affected by conflicting constraints; this is not a proven explanation of its token-limit failure.

## Fix and regression

Expand the schema into an independent JSON tree before mutating path-specific enums. JSON serialization/de-serialization removes shared identity; the existing schemas contain JSON-compatible data only. Keep all financial, quote, numeric, source, dependency and budget checks unchanged. New schema version: `v2-brief-schema-2`; model, effort, prompt text, full sources and call/output limits stay fixed.

Extend the existing provider-continuation regression to inspect the exact serialized schema: fact enums must contain catalog fact IDs, linked finding enums must be finding IDs, metric enums must remain metric names. Validate the mock answer against this actual wire schema with AJV. The test fails on the old adapter and passes after the fix. Previously the mocked fetch returned a desired answer without verifying it could satisfy the API request, so it missed this boundary defect.

Record prompt/schema version and schema hash with provider telemetry. Whitelist incomplete reasons separately from reference-check failures. Default application logging still excludes prompt/history, generated drafts and secrets.

## Debugging workflow

1. Identify the first failed item and downstream removals. A dropped takeaway can be the consequence of a bad finding rather than the origin of the problem.
2. Compare application expectations to the actual serialized request, not merely the in-memory schema declaration.
3. Reproduce with a small deterministic fixture and make a regression fail before applying the fix.
4. Change the faulty boundary while keeping the model/sources/verification constant.
5. Run one capped real case; retain result, versions, usage and failed attempts. A passing case is not production reliability or semantic certification.

Opt-in CLI supports the public E1 fixture only:

```sh
node --env-file=.env.local scripts/debug-v2.ts --live
node scripts/debug-v2.ts --replay /absolute/path/to/.research-runs/public-v2-.../result.json
```

Live mode runs one turn with a $1 ledger and the existing two-request/tool limits. It stores generated output for this fixed public fixture in a git-ignored private directory, with sensitive-pattern filtering. It never captures arbitrary user prompts, credentials or private model reasoning. Replay checks the exact source hash and makes no API call. Do not repeatedly spend on replayable verifier failures.

Official background: [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) guarantees schema adherence, but generated content can still contain mistakes or be incomplete. Our cross-reference rules remain application checks.


## Validation result and remaining gap

All 75 tests, TypeScript and production build pass after the fix. The strengthened provider test covers actual wire-schema enums and validates its mocked answer against the exact API schema, rather than bypassing that contract. Provider metadata now distinguishes response-header wait from body parsing and includes a safe request ID when available, plus schema fingerprint/incomplete reason; these additions use deterministic tests, not another paid retry.

One capped E1 live test on schema version 2 made one provider request, no tool calls, and hit the 120-second hard deadline without returning a completed draft. No replayable draft was saved. Usage was unavailable; $0.36802 is the conservative reserved amount, not measured spend or an invoice. Capture metadata is in `.research-runs/public-v2-9a4c9740-07b9-451d-8c9f-bbfa426bebae/result.json` (ignored/private). It records the same frozen source hash and schema hash `46af3b4a16fc9e0af060dccff1b921f2b47cf442d32966c19c419ef0494e8c6a`.

The root schema mismatch is confirmed and repaired. The paid test does not establish working live synthesis, latency improvement, or that all prior failures had the same cause. Next diagnose the timeout with stage/request timing and a separately capped provider test; cold schema processing, network/server wait and model generation remain possibilities, not confirmed causes. Do not raise the deadline, change models or weaken checks based solely on this timeout. No additional paid retries, deployment or pilot release in D74.


The previous preview process also reported three additional completed turns with `invalid_fact_reference` drops, including one where all three findings were removed and the takeaway/rows lost their dependencies. Those application logs agree with the schema mismatch. Inputs were deliberately absent from logs, so these are not labeled controlled E1 trials or attributed to a specific user question. The owned local preview was restarted after the fix so new requests use schema version 2 and the expanded diagnostics; the other development server was left alone.
