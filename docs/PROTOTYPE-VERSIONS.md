# Prototype versions

Owner: Helen Shim. Updated: 2026-10-13. Decisions: D60–D91.

Prototype numbers identify product experiments. PRD v0.61 identifies a document revision; package.json 0.1.0 is a package version. These are separate from each other.

| Version | Question | Code and deployment | Status |
|---|---|---|---|
| Prototype 1 | Can complete earnings evidence become a specific, inspectable holding explanation for an advisor's context? | Git tag `prototype-1`; exact deployed source manifest; original protected Preview linked in its release record | Frozen baseline, with known failures |
| Prototype 2 | Can an analyst ask an open-ended question, inspect evidence and continue research with less effort? | Branch `prototype-2`; annotated tag `prototype-2-baseline-2026-10-12` at `89d9641`; `/v2` | Preserved local baseline with known limits; no pilot/release pass |
| Prototype 3 | Does evidence-weighted reasoning with qualified summaries and inspectable evidence reduce analyst prompting/checking work? | Branch `prototype-3`; `/v3`; isolated experiment contracts; [plan](prototypes/prototype-3/PLAN.md) | Local candidate implemented; user-run answer completed, live quality/latency review and semantic/pilot gates pending |

Prototype 1: [release record](prototypes/prototype-1/RELEASE.md), [learnings](prototypes/prototype-1/LEARNINGS.md), [source manifest](prototypes/prototype-1/source-manifest.json).

Prototype 2: [iteration plan](prototypes/prototype-2/PLAN.md). The [decision memo](prototypes/prototype-2/V1-V2-PRODUCT-DECISION-MEMO.md) captures Helen's analyst-first pivot. Direction is documented; the initial D64 launch scope is approved under D65, and benefit remains to be tested.

D82 implements complete independently checked findings during the existing model request, followed by the final checked answer in the same thread. Compact inline source inspection replaces Open brief and bottom source-list rows; actual stage changes animate with one timer. This is an iteration within Prototype 2, not a new prototype, deployment or release gate pass. [Progressive-findings checkpoint](checkpoints/V2-PROGRESSIVE-FINDINGS-2026-10-12.md) records implementation verification separately from live latency, semantic quality and user benefit.

D83 corrects a preview regression where an already-open older client could not process D82's new finding events. Explicit progressive-protocol negotiation preserves the original stage/result stream for older callers; current clients tolerate unknown event types and cancel interrupted processing. The corresponding model run completed successfully, so do not count this browser failure as a model/reference-check failure. [Compatibility checkpoint](checkpoints/V2-STREAM-COMPATIBILITY-2026-10-12.md) records 119 passing tests, same-tab live completion and scripted progressive/cancellation verification. This remains Prototype 2 with unchanged research scope/model/budgets. Sessions remain memory-only and are lost on reload.

D84 implements a compact animated current-action/status disclosure row with chevron, one timer, inline retry attempt numbers and chronological real subtask history. It replaces the separate first-attempt heading and Show/Hide actions link without changing research or protocol scope. [Action-disclosure checkpoint](checkpoints/V2-ACTION-DISCLOSURE-2026-10-12.md) records verification separately; this remains Prototype 2 rather than a new prototype or release. Already-open older pages receive new UI behavior only after loading the updated frontend.

## How we will work

1. Keep the `prototype-1` tag and original deployment URL as the baseline. The `main` branch starts at that release snapshot. The snapshot contains the exact uploaded application plus an archival README, ignore rules and release records; historical local tests/PRD files were not part of the deployment upload.
2. V2 is preserved on `prototype-2`; current work is on `prototype-3`. Make a commit after each meaningful product or technical change. Each learning records the task, inputs, source version, configuration, observed behavior and next decision. Do not rely on remembering a chat.
3. Reuse the same comparison cases when evaluating changes. Record failed and incomplete runs as well as successful ones. Separate model completion, mechanical evidence checks, interpretation quality and user usefulness.
4. Give Prototype 2 its own deployment-specific Preview URL. Record that deployment's commit, model/effort, prompt/schema, source hashes, test results and known limits. Credentials remain environment configuration, never release artifacts.
5. A release tag `prototype-2` still requires its release gate. Helen explicitly requested starting a recoverable V3 experiment before that gate (D86); the distinct `prototype-2-baseline-2026-10-12` tag is a local checkpoint, not a release. V2 retrospective and baseline manifest are saved before V3 changes. Small fixes within one experiment can use tags such as `prototype-2.1`; a changed user job or value hypothesis warrants a new prototype number.

Git tags preserve code and bundled source data. They do not preserve Vercel settings or guarantee the hosted deployment will be retained indefinitely. The source snapshot and lockfile allow recovery; external model outputs are stochastic and cannot be reproduced byte for byte.

Useful local commands:

```sh
git status
git log --oneline --decorate
git diff prototype-1..prototype-2 -- src
git archive prototype-1 -o /private/tmp/portfolio-prototype-1.tar
```

To inspect Prototype 1, use the protected Preview or export its tag into a separate folder. Keep current work on `prototype-3`. API keys, private trial traces, dependencies and build output are excluded from Git. Git is local for now; there is no remote backup or GitHub publication.

D86 preserves V2 without claiming its pilot gates passed. Use `/v2` alongside `/v3` to compare without changing branches. The [baseline manifest](prototypes/prototype-3/BASELINE.json), [V2 retrospective](prototypes/prototype-2/RETROSPECTIVE.md), [V3 plan](prototypes/prototype-3/PLAN.md) and [V3 evaluation record](../evals/prototype-3/RESULTS-2026-10-12.md) capture configuration, learning, failed attempts and next decisions. The first V3 experiment keeps model/effort/sources fixed while changing checked-fact coverage, analysis/schema/UI and output cap; do not label it a pure reasoning-effort test.

D88 applies reported-first financial evidence to V3 without altering V2 or the source packet. `prototype-3-candidate-1` preserves the preceding candidate; the next local candidate checkpoint identifies fact/prompt versions and recorded acceptance results. These candidate tags are not release gates or live-model quality passes.

D89 improves V3's reading hierarchy: grouped headings, visible cited analysis and one unanswered/next-investigation section. `prototype-3-candidate-2` retains the D88 layout; `prototype-3-candidate-3` records the reading-hierarchy checkpoint. Model/source/fact contracts remain identical; presentation checks do not score live research quality or latency.

D90 replaces V3 numeral tiles with inline Source links, relocates context under Verdict and removes the key-value underline and two generic closing lines. `prototype-3-candidate-3` preserves the preceding layout; `prototype-3-candidate-4` records this presentation checkpoint. Existing live user-run completion is an observation, not a semantic/pilot pass.

D91 fixes local preview delivery with `npm run dev:v3` and isolated Fast Refresh output. It is an operational correction to candidate-4, not a new answer/model experiment. The stale user's production-loaded tab is preserved; further UI tests use a fresh development-loaded preview. Do not infer a frontend update from a successful model response alone.
