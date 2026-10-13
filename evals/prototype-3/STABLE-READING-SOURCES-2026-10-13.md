# D97: stable reading and source locations

2026-10-13. Requested fixes only; no paid model calls, source expansion or changed reasoning effort.

## Implementation

One persistent renderer displays a reserved verdict region before any findings. Checked findings append in their existing order; completion fills the verdict region and appends financial rows/assessment/details. A native disclosure beneath the verdict exposes context summaries without relocating full findings. The verdict area is keyboard-scrollable if a long conclusion exceeds its reserved token-based height.

Financial facts retain original source row excerpts alongside paragraph IDs and column provenance. Derived comparisons traverse their reported inputs. External Source links use checked source text fragments; current/prior sources remain separately reachable, and multiple targets from one report share its link. Excerpt opens exact frozen evidence in the source panel, with periods, units and reported column values. History restoration reconstructs excerpts from the server-owned packet. Model context excludes new excerpts because full report text is already supplied.

## Observed checks

- 157 deterministic tests pass, TypeScript and optimized Next build pass.
- Temporary development-only replay used the checked reference, not fabricated financial values. It was removed before build/deployment.
- Five finding positions before completion: 412, 605, 870, 1117, 1364 CSS pixels. After completion: identical values. Same IDs/order; no automatic scrolling or findings regrouping.
- Existing two user sessions survived reload. Earlier answers gained source fragments from restored authoritative facts without a model call.
- Original SEC table-wide phrase fragments initially failed across separate table cells. Revised cell/range targets visibly scrolled/highlighted the revenue amount and GAAP gross-margin row. D97-SOURCE-HIGHLIGHT.png records the latter.
- Excerpt opens financial rows; closing returns keyboard focus to the original Excerpt control.
- UI proof: D97-STABLE-ANSWER.png.
- React review: stable finding keys, same renderer before/after completion, native links/disclosures/buttons, existing focus-return machinery, public-only client metadata. No provider module imported into the client.

## Limits

Text fragments depend on the browser and current source DOM. Repeated amounts can select the first occurrence; unsupported fragments can open the top of the document. The exact frozen row/quote, paragraph ID and financial column remain the reliable in-app fallback. This is source-location navigation, not independent semantic certification of each generated sentence. Qualitative citations retain finding-level evidence.

Validation resets or withdrawals still remove invalid content; preserving invalid text for stable geometry is forbidden. Source/model latency and pilot usefulness were not re-graded in this presentation-only change.

Deployment: source commit `43d315b`, READY protected Preview `dpl_BWVftmYjXFm8vtWJNXtb1bg9FVXk`. Stable V3-only alias updated to `portfolio-research-agent-1ms94bblq-helenhshims-projects.vercel.app`. Authenticated page returns 200 with source-excerpt metadata; unauthenticated stable alias returns 302. Production/V2 were not deployed or promoted. Refresh the existing hosted tab to load this renderer; saved history is restored without generation.
