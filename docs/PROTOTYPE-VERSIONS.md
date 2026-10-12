# Prototype versions

Owner: Helen Shim. Updated: 2026-10-12. Decisions: D60–D70.

Prototype numbers identify product experiments. PRD v0.40 identifies a document revision; package.json 0.1.0 is a package version. These are separate from each other.

| Version | Question | Code and deployment | Status |
|---|---|---|---|
| Prototype 1 | Can complete earnings evidence become a specific, inspectable holding explanation for an advisor's context? | Git tag `prototype-1`; exact deployed source manifest; original protected Preview linked in its release record | Frozen baseline, with known failures |
| Prototype 2 | Can an analyst ask an open-ended question, inspect evidence and continue research with less effort? | Local branch `prototype-2`; existing experimental candidate retained; separate deployment URL when ready | Scope approved; first reference scores logged; qualitative refinements/runtime trials pending; no new release |

Prototype 1: [release record](prototypes/prototype-1/RELEASE.md), [learnings](prototypes/prototype-1/LEARNINGS.md), [source manifest](prototypes/prototype-1/source-manifest.json).

Prototype 2: [iteration plan](prototypes/prototype-2/PLAN.md). The [decision memo](prototypes/prototype-2/V1-V2-PRODUCT-DECISION-MEMO.md) captures Helen's analyst-first pivot. Direction is documented; the initial D64 launch scope is approved under D65, and benefit remains to be tested.

## How we will work

1. Keep the `prototype-1` tag and original deployment URL as the baseline. The `main` branch starts at that release snapshot. The snapshot contains the exact uploaded application plus an archival README, ignore rules and release records; historical local tests/PRD files were not part of the deployment upload.
2. Work on `prototype-2`. Make a commit after each meaningful product or technical change. Each learning records the task, inputs, source version, configuration, observed behavior and next decision. Do not rely on remembering a chat.
3. Reuse the same comparison cases when evaluating changes. Record failed and incomplete runs as well as successful ones. Separate model completion, mechanical evidence checks, interpretation quality and user usefulness.
4. Give Prototype 2 its own deployment-specific Preview URL. Record that deployment's commit, model/effort, prompt/schema, source hashes, test results and known limits. Credentials remain environment configuration, never release artifacts.
5. Tag `prototype-2` only when its release gate is met. Add the retrospective before beginning Prototype 3. Small fixes within one experiment can use tags such as `prototype-2.1`; a changed user job or value hypothesis warrants a new prototype number.

Git tags preserve code and bundled source data. They do not preserve Vercel settings or guarantee the hosted deployment will be retained indefinitely. The source snapshot and lockfile allow recovery; external model outputs are stochastic and cannot be reproduced byte for byte.

Useful local commands:

```sh
git status
git log --oneline --decorate
git diff prototype-1..prototype-2 -- src
git archive prototype-1 -o /private/tmp/portfolio-prototype-1.tar
```

To inspect Prototype 1, use the protected Preview or export its tag into a separate folder. Keep current work on `prototype-2`. API keys, private trial traces, dependencies and build output are excluded from Git. Git is local for now; there is no remote backup or GitHub publication.
