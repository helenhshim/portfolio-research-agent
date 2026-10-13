# V3 inline-source / verdict-context checkpoint

2026-10-13 · D90 · PRD v0.60 · local presentation update.

## User feedback implemented

1. Remove the orange key-value underline from V3 financial rows.
2. Replace numbered source buttons with underlined native Source anchors immediately after each evidence point. Their normal text line boxes remove the citation-induced blank gaps; bullet spacing uses the existing smaller token. One visible link identifies all contributing reports, retained in inspection tabs and the accessible name/tooltip, rather than repeating indistinguishable labels. The original href points to the first contributing report.
3. Move completed context-role findings beneath the checked Verdict, before financial rows. Keep qualified subheadings and every analytical sentence. Omit the separate context heading in completed answers; developing findings still show context before the final verdict exists.
4. Remove the generic “The supplied reports do not resolve these questions” sentence.
5. Remove the generic final reference-check/review sentence and its partial variant. Specific partial/source-limited notices, discrepancies, failures, unanswered criteria and source/basis inspection remain.

## Verification

- `npm test`: 141 passed, zero failures/skips. Typecheck and final optimized build pass; no new model/schema/fact/source changes.
- Authored reference: all five findings remain; context appears exactly once under Verdict; zero financial-value underline elements; both requested closing strings absent.
- Source anchors have actual SEC hrefs, report/date labels, underlined text and inline geometry. Observed link height 17px inside normal 18px body line height, rather than a 44px citation tile. No negative-margin or overlapping invisible hit areas. Ordinary standalone buttons retain 44px geometry. This is the explicit inline-link sizing override documented in the A3 register, not a claim that every target is 44px.
- Existing scripted browser fixture extended with a checked context finding. No provider credentials/calls: source-linked context appears while developing without an early verdict, then relocates under the completed Verdict. Focus on its second Source link survives relocation and final reconciliation.
- Native keyboard Enter opens the correct current-report inspection; Escape closes it and returns to the exact context link. Both actual report tabs remain available; multi-report Source links name both reports.
- Mobile check at requested 375×812: document client width and scroll width both 360 (browser scrollbar difference); six scripted evidence points each have one Source link; no duplicated context or removed-copy residue. Viewport override reset and temporary fixture tab closed.
- React/accessibility review: native anchors with hrefs, keyboard/focus and descriptive names; no new effects/fetches/library; existing checked data and stable finding/bullet keys; empty role groups omitted; source opener selectors now support anchors; restored focus is restricted to the completing turn.
- V2 baseline/source/lockfile manifest hashes unchanged. V2/shared table highlighting remains available; V3 simply does not request it. Model/tool budgets, fact/prompt/schema versions and validation remain unchanged.

## Evidence and limits

- [Inline sources and verdict context](D90-INLINE-SOURCES.png)
- [Ending without the two generic lines](D90-CLEAN-ENDING.png)

These browser artifacts show the explicitly labeled authored reference, not a fresh model answer. Agent-initiated live model calls in this UI verification: zero. Scripted fixture delays do not measure model latency. No deployment or additional source access.

Separately observed in the pre-update server log: the user's D89 candidate question completed in 37.222s, first checked finding at 9.390s, five findings, one provider call, zero tool calls and no reference drops. This confirms live output was possible after earlier quota errors, but it is one unscored prior-candidate observation. It does not establish quality, a latency distribution or a D90 performance improvement. Live usefulness and pilot gates remain pending.
