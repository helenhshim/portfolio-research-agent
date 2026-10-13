# Thread-first checked answers and optional inspection

2026-10-12 · D79 · Local build. No deployment or paid model test.

## Behavior

The old successful-response branch explicitly selected workspace, brief and mobile brief view. Completion now only commits its own attempt; it does not select inspection. Authored reference output also appears in the thread without automatic inspection. Every checked answer renders the same shared ResearchAnswer body: interpretation, the selected financial rows (at most three), all surviving supporting/qualifying findings, collapsed calculation basis and cash bridge, unanswered criteria and zero/one supported next investigation. Removing a finding to make a shorter summary could hide qualifying evidence, so no heuristic trimming or second synthesis was added.

Open brief or a finding’s source control selects that answer’s artifact. Desktop opens an optional right pane; narrow screens open a dismissible full-width inspection. There is no global Thread/Brief bar or footer layout chooser. Brief/source tabs are internal to explicitly opened inspection. Close brief and Escape restore the original opener and thread scroll; the same thread subtree preserves draft and native disclosure state. Starting research closes inspection and focuses the thread Stop control; opening older evidence during that run leaves Stop reachable in the inspection toolbar.

Inspection selection is separate from incoming completion. A later successful/failed follow-up cannot replace the opened earlier reference. Existing attempt ownership, retry, cancellation and stale-response gates remain. Source links are attached to their finding’s actual passage, not an invented sentence-level support mapping. They do not resolve the open semantic citation-coverage evaluation. A3 signal-once is enforced across historical answers and inspection; all added styles use existing tokens.

## Verification

- All 83 tests pass. Production build and TypeScript pass; no provider/data/schema/budget changes.
- Browser completion through the existing localhost-only scripted provider: timeout followed by retry succeeds with one question/two attempts and no inspection or global tabs. The financial comparison, supporting finding and unanswered criterion are visible directly in the thread.
- Desktop inspection preserves a draft and expanded calculation disclosure. Closing restores focus to Open brief, removes inspection and leaves exactly one highlighted fact.
- Inline reported-evidence control opens the matching exact SEC paragraph. Source-tab arrow-key navigation retains selected-tab focus. Exact source links remain available.
- At 375px width, the thread has no page-level horizontal overflow; evidence tables scroll within their region. There is no global Thread/Brief control. Opening an earlier reference while a follow-up runs shows Stop research in inspection; Stop freezes the attempt and close returns to the same thread/opener.
- A retry with deliberately invalid references fails without replacing explicitly opened earlier reference content. A subsequent successful retry produces a second checked thread answer while the selected inspection still shows its earlier question. Two questions remain despite multiple attempts, and no signal underline is duplicated.
- Screenshot: [thread answer](V2-THREAD-FIRST-2026-10-12.png), using the existing clearly labeled authored reference. This is presentation verification rather than a live-model quality result.
- React/accessibility review: stable keyed thread subtree, immutable attempt updates, timers remain local/cleaned up, optional inspection ownership, native buttons/disclosures, region labels after removing navigation tabs, visible close/Stop and deferred focus restoration. Existing reduced-motion CSS remains active.

The test harness runs on 127.0.0.1:3006 and is stopped after checks. The normal updated preview remains on port 3005. Header thread index and device-local persistence are subsequent work; source citation completeness and pilot gates remain pending.
