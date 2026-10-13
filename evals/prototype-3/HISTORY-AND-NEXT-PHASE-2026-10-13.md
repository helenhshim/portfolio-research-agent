# D95 browser history and next phase

## Executed locally

- 153 deterministic tests pass, including restoration of the authored reference/draft, replacement of manipulated numbers and URLs with server-owned evidence, sensitive-input exclusion, invalid/expired/oversized/duplicate histories, invalid quotes/cutoff rejection, interrupted-run manual retry, same-origin/body bounds, stale-tab conflict and storage-write failure.
- TypeScript and optimized Next.js build pass. No new dependency or model call.
- The existing two user sessions survived the hot update. Initial reload exposed a local origin mismatch: Next's request URL used a different host than the browser. Restoration rejected the request (403) without overwriting the archive. The handler now matches the established V3 request origin/Host policy.
- Subsequent browser reload restored both original answer turn IDs, checked verdict/evidence and timing. A newly created public test draft survived another reload; only that test draft was deleted. Original user sessions remain.
- Screenshot: `D95-HISTORY-RESTORED.png`. Browser proof covers real restoration/draft retention, not every storage-failure or interrupted-run case; those cases have deterministic coverage. No paid research was dispatched by these checks.

## Boundaries

History is localStorage scoped to the browser profile and exact origin. It is not encrypted, an account database, cross-device sync or a guarantee of detecting arbitrary private text. Only public-company research is permitted. It is bounded to ten sessions/thirty turns/five attempts, 1.5 MB and thirty days since the last snapshot save. Oldest turns/attempts beyond the bounds are omitted. Session deletion/Clear and clearing browser storage remove local retention. Source disclosures, scroll and navigation Back stack are not persisted.

Restoration submits the saved public research to the same app's stateless compatibility endpoint. That endpoint checks prose/fact placeholders/quotes, rebuilds numbers/provenance/URLs from the existing frozen packet and returns no-store data. It does not log content, call a model, retain a server history or certify authorship/interpretation. Cached findings are treated as historical model interpretations, never new issuer evidence. Revisions begin fresh for new research. Corrupt/incompatible answers are withheld from conversation context; incomplete attempts require manual retry. Sensitive drafts are excluded rather than saved. A newer snapshot in another tab blocks stale writes, with a reload notice; no live cross-tab merge is promised.

## Deployment inspection, pending completion

The Vercel connector confirms team `helenhshims-projects`, project `portfolio-research-agent`, Next.js/Node 24 and SSO protection `all_except_custom_domains`. That is configuration evidence, not an unauthenticated access test of a new deployment. The connector denies project environment listing (403), including metadata-only undecrypted listing. The local CLI reports no credentials. No deployment, protection weakening, credential transfer or production enablement was performed. CLI login is requested as an independent authenticated path; it is not claimed to fix the connector permission. Secret metadata/access/spending/streaming gates must be completed on the eventual protected Preview.

## Sequence

D95's four priorities remain: local history (complete), protected Preview (pending credentials/verification), completion-time experiment, and actual advisor/analyst pilot. Pilot protocol is prepared in `PILOT-PROTOCOL.md`; no participant result or recruitment message is claimed. The five requested later UX changes are scoped in `docs/prototypes/prototype-3/PLAN.md`, after these priorities.
