# Takeaway reliability and latency investigation

## Confirmed failure

Exact input: income / profitable_growth / short / medium / NVDA. Legacy/high reproduction took 126.196 seconds. It generated findings NVDA:F_profit, NVDA:F_cash and NVDA:F_execution, but the takeaway referenced those plus NVDA:F_financing and NVDA:F_income. Those last two findings were never generated. All three actual findings survived; the assessment and dependent interpretations correctly failed reference validation. The source was available and the input combination was valid.

The schema generated the assessment before findings and allowed arbitrary unbounded reference strings, while findings were capped at three. This allows the model to commit to planned findings it subsequently omits. Source matching alone cannot fix this. Structured Outputs preserves schema key ordering: https://developers.openai.com/api/docs/guides/structured-outputs .

## Local candidate

Implemented in src/lib/paired-research.ts: evidence-first schema ordering; finding IDs constrained to f_a/f_b/f_c; dependent finding references restricted to those IDs; fact references and selected rows restricted to eligible code facts; reference arrays bounded; unused duplicate interpretations and always-empty research_answers omitted from model generation and normalized to empty legacy fields by code. Explicitly separate primary goal from holding rationale. Same model, same complete report pair, same arithmetic and evidence/dependency checks.

src/lib/quarter-pair.ts now consolidates independently checked paired quotations into the explicitly linked finding's display evidence. It does not attach arbitrary support or repair missing IDs. This preserves quotations for combined platform/China/financing claims instead of leaving those available only in another section.

Added incomplete-response diagnostics: status, reason, usage and partial generated output are available to the local debug harness. Partial text is kept in ignored local artifacts, never rendered as verified output. Credentials are not recorded. Runtime logs still do not expose that partial text.

## Actual trials

| Configuration/case | Model time | Result |
|---|---:|---|
| Legacy/high, reported combination | 126.196s | Missing financing/income references; no verified takeaway |
| Stable/low, reported combination | 39.138s | Core and comparative checks passed |
| Stable/high, reported combination | 180s ceiling | Timed out |
| Stable/low, two repeat runs before array bounds | Not retained | Both incomplete; detailed reason not captured by the old harness |
| Stable/low, default dividend-income case | 38.651s | Checks passed |
| Stable/low, first long-term-growth case before bounds | Not retained | Incomplete; detailed reason not captured |
| Bounded stable/low, reported combination | 39.470s | Checks passed |
| Unbounded stable/low control, reported combination | 42.696s | Checks passed |
| Bounded stable/low, long-term-growth case | 43.228s | Checks passed |

Successful candidate runs were approximately 66–69% faster than the reproduced 126-second legacy run. These are small concurrent exploratory trials, not p95 measurements or proof of general quality equivalence. Bounding lists is sensible defensive control, but a successful unbounded control means it is not proven to have caused or fixed the earlier incomplete responses. No reason is invented for those failures.

Manual review: candidate retains reported Rubin production/partner deployment versus prior announcement, unchanged China outlook boundary, conditional financing, operating profitability and cash counterevidence. Short-horizon questions emphasize upcoming delivery/collections; long-horizon questions emphasize repeat demand and persistent cash conversion. The mixed income/growth case distinguishes evidence for business profitability from unreconciled payout evidence. Figures remain selected code-owned values, not LLM arithmetic. Interpretation support still requires review; zero mechanical removals is insufficient alone.

33 tests and TypeScript pass, including regressions for stable-schema constraints without accidentally restricting narrative strings, valid-reference retention, dangling-reference rejection, invalid-quote dependency removal and consolidation of only surviving paired evidence.

## Scoped release proposal

1. Adopt fixed, bounded reference IDs and evidence-first output. Keep invalid-reference rejection; never simply remove invalid references from a claim to make it pass.
2. Use the compact full-source low-effort candidate as the latency candidate, subject to repeated release-fixture completion checks. Do not deploy merely on one fast success. Preserve a high-effort option for future explicit deeper investigation, not as a silent repeated request.
3. Add exact-result reuse for successful, reviewed briefs keyed by all inputs, source hash, schema/prompt/model/config versions. Same inputs and frozen sources can reuse checked work; new inputs or reports must not receive an unrelated/stale brief. Label reuse clearly. No persistence/cache is implemented in this patch.
4. If broader speed is needed, prepare checked company evidence once per new report pair and run smaller context-specific synthesis, keeping full sources available for questions missing from the prepared evidence. Evaluate omitted material evidence before replacing full-source per-input analysis.
5. Preserve useful checked findings/financial changes if an assessment fails; distinguish output failure from a valid unresolved evidence answer. A narrowly bounded repair is a later option, not permission to invent support.

Current deployed preview remains on its original high/legacy configuration. Local prototype options default to that legacy behavior until rollout is explicitly chosen and incomplete-generation readiness is evaluated. No new sources, client fields, provider, public-access change or extra agents are needed for this fix.
