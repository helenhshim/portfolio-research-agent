# Generation failure: stream diagnosis and progress simplification

2026-10-12 · D80 · Local implementation and fixed public E1 tests. No deployment.

## What the original failure establishes

Helen confirms the default NVIDIA operating-profitability question. The running preview's stdout records a single provider request with HTTP 200, first text at 4,456ms, 22,961 emitted output characters and a 91,772ms failure. The stream adapter never returned a terminal response: body-read duration, usage and incomplete reason were absent. The controller emitted provider_incomplete without reaching reference checking. This is not a replay of the D74 schema enum defect or D76 two-call deadline.

The exact reader failure was not recorded. Candidate paths are cumulative byte guard, SSE error, premature EOF or transport/parsing failure. Do not retroactively claim the original incident was conclusively a byte-limit violation. A completed/incomplete API response uses semantic terminal events; see [official Responses streaming events](https://developers.openai.com/api/reference/resources/responses/streaming-events).

## Demonstrated defect and repair

The existing parser rejected all cumulative network traffic above 2MB, even though processed frames had been discarded. A deterministic fixture proves that a valid stream can cross this threshold and be rejected before its queued completion is read. SSE metadata, deltas, encrypted reasoning and repeated final content all count as wire traffic; character count alone cannot recover the original byte total.

Separate bounded retained-event size (1MB) and bounded transfer size (16MB). Existing token, elapsed, provider/tool and input limits stay unchanged. A valid long transfer with small events now completes; oversized events and excessive transfers still fail closed. Missing terminal, malformed event, SSE error, transport failure and limits each receive an allowlisted content-free reason, with byte/event counts and terminal type. Record body-read time on errors as well. No partial response is promoted to an answer.

Tighten API-generation field bounds and discourage padding to prevent the compact output contract from allowing unnecessarily long replies: takeaway 450 characters, findings 800, excerpts 400, row implications 240, unanswered criteria 260, next question 350. Prompt/schema versions are v2-public-research-3/v2-brief-schema-3. Full source reports, eligible metrics and quote/fact/dependency checks stay intact. These tighter fields are not proof of lower tail latency or stronger semantic citation support.

## Validation and practical limits

| Run | Configuration | Result | Duration | Provider/tool calls |
|---|---|---|---|---|
| User incident | Original prompt/schema and parser | Incomplete stream, exact cause not retained | 91.772s | 1 / 0 |
| Diagnostic baseline | Original prompt/schema + reader telemetry | Complete, no reference drops | 18.132s | 1 / 0 |
| Candidate CLI | New bounds and repaired reader | Complete, no reference drops | 20.010s | 1 / 0 |
| Candidate browser/API | Final local build | Complete, no reference drops, thread stayed primary | 21.428s | 1 / 0 |

[Content-free metadata record](V2-STREAM-FAILURE-2026-10-12.json). The successful diagnostic baseline establishes intermittency; these candidate successes do not prove that the ninety-one-second incident is reproduced/resolved in every run. Deterministic regressions establish the parser defect/fix. Remaining live failures will now have a specific diagnostic rather than one generic incomplete code. Repeated product/control/semantic evaluations and pilot gates remain open.

The fixed public tests cost approximately $0.249 by conservative uncached token-rate estimates ($0.08278 baseline, $0.08269 candidate CLI, $0.08332 browser); cached billing may be lower. The additional CLI test was capped at $0.90 after the first diagnostic, and the browser's maximum two conservative reservations fit the remaining total $1 debug budget. No credentials or arbitrary user history were captured. Public completed draft captures remain in ignored .research-runs paths.

86 tests, typecheck and production build pass. Regression coverage includes >2MB valid cumulative transfer, independent retained-event/transfer bounds, malformed JSON, EOF without terminal, SSE error, transport rejection, existing CRLF/UTF-8 chunk splits, no publication of incomplete text and valid reference checking. Semantic review still finds qualitative findings combining claims without a quoted excerpt for every material clause; mechanical pass is not a pilot/quality pass.

## Progress display

One live task and one elapsed duration. Terminal states show one total duration, without a duplicate failure heading in the recovery panel. Show/Hide actions is on its own secondary row; expanded history omits the current live action and extra timing values. Internal timing records remain. Timer ticks stay outside live announcements and stop after terminal state.

Browser assertions confirmed one duration element and one live square while running; failure retained one total even when actions expanded; real completion showed “Completed 21s total” with no active animation and no inspection pane. [Scripted failure display](V2-SIMPLE-PROGRESS-2026-10-12.png) and [real completed default question](V2-LIVE-PROGRESS-2026-10-12.png). The failure screenshot uses the explicitly scripted local provider rather than a new incident. The harness is stopped after verification; the normal preview remains on port 3005.
