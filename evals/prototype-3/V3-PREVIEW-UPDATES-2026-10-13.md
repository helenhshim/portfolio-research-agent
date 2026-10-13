# V3 preview update delivery

2026-10-13 · D91 · PRD v0.61 · operational correction to D90 / candidate-4.

## Story and broken boundary

An analyst submits a question in the existing V3 tab, receives a newly checked API answer, and expects the latest UI presentation. The browser still had the previous production JavaScript loaded. Restarting `next start` or generating another model response does not replace that already-loaded renderer.

| Boundary | Evidence |
|---|---|
| Existing user tab | 23 numbered citation buttons, zero Source anchors, one key-value underline, context outside Verdict, both old closing sentences |
| Fresh pre-fix reference tab | Zero old citation buttons, 16 Source anchors, zero value underlines, context inside Verdict, closing sentences absent |
| Loaded assets | Existing tab referenced `42cu_r1pa0vd4.js`; fresh updated tab referenced `3vmmljvcafrfh.js` for the changed client chunk |
| Research transport | Existing tab displayed a newly completed 40-second answer despite using the old renderer; API/frontend update delivery are separate boundaries |
| Server mode | Port 3006 was running `next start`, serving production bundles without a development hot-reload client |

Previous D90 verification inspected newly loaded authored/scripted pages but did not inspect this existing user tab. That was the verification gap.

## Fix and validation

- Add `npm run dev:v3`: isolated Next.js development server on localhost port 3006; `.next-v3-dev` output selected by `PORTFOLIO_NEXT_DIST_DIR` and ignored by Git.
- Default build/start output remains `.next`. Keep generated type includes for both directories. Next.js regenerated its default `next-env.d.ts` during the production build; no custom-path generated import is committed.
- Do not stop the other port-3000/3005 baseline servers. Do not reload or close the user's old answer tab. It remains intact with its original question/answer.
- Open the fresh development-loaded preview at `/v3?preview=live` (the query identifies the review tab; it does not change financial behavior). Its script assets include the native development HMR client. All five D90 presentation requirements are visible.
- Temporarily add a nonvisual `data-preview-refresh-check` attribute to ResearchAnswer. It appeared automatically in the open development tab without reload. The same authored answer turn and 16 Source links remained. Remove the attribute; disappearance and identical answer turn were observed. Final source has no probe or UI content change.
- Typecheck, optimized default production build and 141 existing tests pass. UI/model/controller/source contracts remain unchanged. No paid model calls initiated for this verification.

[Updated development preview](D91-LIVE-PREVIEW.png) shows the explicitly labeled authored reference, not a new live model answer.

## Practical limits

An already-open production tab needs a fresh page load to acquire development HMR. Its memory-only answer cannot be transparently transferred, so preserve it and use the new tab. Fast Refresh usually retains completed component state, but hook/server/config changes and runtime errors can still cause full reload/remount. This checkpoint proves the tested UI-update path; it does not add durable sessions or claim universal state retention, research quality or lower model latency.
