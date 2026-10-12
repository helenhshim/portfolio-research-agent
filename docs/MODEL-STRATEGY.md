# Model strategy review

Reviewed 2026-10-11 before adding an API key. Current runtime model remains gpt-6.1-sol. Existing callers use low reasoning effort; D49 adds explicit high-effort/context-instruction experiments. Live access and earlier paired trials are documented below; the latest reasoning comparison is pending review.

## Separate development from product inference

Codex is the development environment. Its model selection and billing are independent of the app’s API model and API credentials. Recommend GPT-6.1 Sol for routine development/maintenance, with Astra considered for unusually difficult architecture or failure investigations. The exact currently selected Codex conversation model has not been established by the repo or tools; do not infer it from app code. Do not change the user’s Codex selection automatically.

Runtime recommendation: retain one gpt-6.1-sol model across MVP stages, avoiding model routing complexity. Planner low effort; consider analysis medium effort in a matched trial against the implemented low setting before changing the baseline. Code handles all financial math, SEC acquisition, evidence lookup, schemas, quote matching and dependency removal. No model verifier as source of truth. Talking points reuse surviving findings; no additional synthesis call is required.

## Alternatives and evaluation order

1. Establish Sol baseline, compare focus versus single-pass with same settings and facts.
2. If interpretation quality fails, separate data/prompt/verifier issues from model issues, then test higher reasoning effort and Astra on the same cases. Astra is an optional quality comparator, not an automatic runtime fallback or mandatory paid grader.
3. Only after a trustworthy baseline, test Luna for the scoped planner or triage, then consider wider migration if accuracy and relevance hold. A cheaper planner that misses the critical question can damage final quality.
4. Keep human evidence-support review and deterministic checks. A stronger model can assist evaluation later but is not an independent ground-truth oracle.
5. ChatGPT baseline records its actual UI model and available tools separately; an API call is not a ChatGPT product trial.

## Current standard short-context text prices, per million tokens

| Model | Input | Cached input | Output | Role hypothesis |
|---|---|---|---|---|
| gpt-6.1-sol | $2.00 | $0.10 | $10.00 | Balanced MVP research and development |
| gpt-6-astra | $10.00 | $1.00 | $50.00 | Optional difficult-case quality comparator |
| gpt-6-luna | $0.10 | $0.01 | $0.50 | Later scoped-task cost optimization |

Illustrative only: 10,000 uncached input plus 2,000 billed output tokens per Sol call costs $0.04. Two calls per holding across five holdings would be $0.40 with those exact token assumptions. This is not a measured run cost; reasoning/output usage, prompt length, cache behavior and service tier can change it. Infrastructure charges are separate. No paid search tool is enabled.

Official references reviewed:
- https://developers.openai.com/api/docs/models/gpt-6.1-sol
- https://developers.openai.com/api/docs/models/gpt-6-astra
- https://developers.openai.com/api/docs/models/gpt-6-luna
- https://developers.openai.com/api/docs/guides/model-selection
- https://developers.openai.com/api/docs/pricing

No model/configuration change was made by this review. Sol remains the existing MVP choice; alternative models and effort changes are evaluation candidates.

## First access attempt

Local key configured. First NVDA planning request failed with HTTP 429; diagnostic confirmed credit_balance_exhausted (type insufficient_quota). This establishes a billing block, not model quality or a completed model-access test. No generated research output exists. Add API credits/review billing before another trial; do not retry in a loop.

## Access restored and initial comparison

After Helen added API credits, six corrected paired cases completed on gpt-6.1-sol low effort. Focus median model time 28.2s versus 18.6s single-pass. Quote/number checks passed, but evidence-attachment and interpretation quality still need review. No Astra/Luna test or actual ChatGPT trial has run. See evals/SIX-CASE-ENGINE-COMPARISON.md.

## Reasoning configuration experiment (D49)

2026-10-12: The Codex chat reasoning selection does not configure product API calls. Product calls now accept explicit low/high stage options and record effort/prompt version in the trace. Compare low/original, high/original and high/context-v1 with identical frozen sources, inputs, schema, 12,000-token limit and 180-second timeout. Default caller behavior remains low/original pending review. One NVDA growth/long/medium case is exploratory. Context-v1 asks for decision relevance, concrete mechanisms, counterevidence and specific watch conditions; extra effort cannot replace missing source context. See PRD section 12 for the living architecture.

Comparison completed: four runs including low planner/high analyzer. High/original improved gap diagnosis; high/context-v1 made qualitative selection and follow-up more specific. High/context model time ~104s versus low/original ~36s; hybrid ~122s did not show a speed advantage. Context-specific instructions and intact evidence are central hypotheses, not proven universal model-effort gains. Baseline callers remain low/original while high/context trial options are available. See evals/REASONING-COMPARISON-2026-10-12.md.
