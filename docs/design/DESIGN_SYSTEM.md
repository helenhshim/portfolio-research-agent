# A3 Design System · MVP Handoff

Financial research agent. Version 1.0 MVP. **Light mode only.**
Tokens live in `tokens.css` (ship it as-is and reference variables, never raw hex).
Visual reference: the "Research Agent Brand" design canvas, boards **01–04** (system) and **MVP 06a / 06b / 06c** (screens).

---

## 1. Scope

**Build now**

| Screen | What it is |
|---|---|
| 06a Thread | Default view. Single centered Q/A column, composer at the bottom. |
| 06b Workspace split | Thread pane on the left, tabbed workspace (tables, sources) on the right. |
| 06c Command | Left rail (threads + watchlist), Q/A thread, slash commands in the composer. |

**Not in MVP:** dark mode, multi-ticker compare screen, broad market screen. Don't add dark-mode variables or theme switching yet.

Placeholders in the designs (`[Name]`, `[TICK]`, `[00.0]%`, etc.) stand in for real data. Never hard-code sample numbers.

---

## 2. Principles (apply to every decision)

1. **One size of text.** 13px does almost everything. Hierarchy comes from weight, grey and mono, not size.
2. **Numbers are the interface.** Every figure is mono, tabular, right-aligned in tables, with a unit.
3. **Q and A, not chat.** Mono `Q` / `A` labels in a 24px gutter. No bubbles, no avatars, no typing dots.
4. **Square and ruled.** 2px radius. Hairlines for structure, 1px ink rules on tables and the composer. **No pills. No shadows.**
5. **Signal once.** Besides the logo, `--signal` marks one key fact per view. That fact may show in two places (its table underline and its sparkline point). The composer caret (while focused) and a live step square are state markers and always allowed.

---

## 3. Foundations

### Typography

Fonts: **Geist** (`--font-sans`) and **Geist Mono** (`--font-mono`), weights 400 and 500 only.

| Token | Family | Size/Line | Weight | Tracking | Color | Use |
|---|---|---|---|---|---|---|
| `text-display` | sans | 22/28 | 500 | −0.02em | ink | Empty state only |
| `text-title` | sans | 15/20 | 500 | −0.01em | ink | Workspace panel titles |
| `text-strong` | sans | 13/18 | 500 | 0 | ink | Questions, in-answer headings, buttons |
| `text-body` | sans | 13/18 | 400 | 0 | ink | Default (~80% of text) |
| `text-secondary` | sans | 12/16 | 400 | 0 | ink-2 | Excerpts, helper text, rail items |
| `text-data` | mono | 12/16 | 400 | 0 | ink | Table cells, inline figures, chips. `tabular-nums` |
| `text-meta` | mono | 11/16 | 400 | 0 | ink-3 | Q/A labels, step log, table headers, scope line |
| `text-cite` | mono | 10/14 | 400 | 0 | accent | Inline citation numeral, 1px accent outline |

Rules: no weights above 500, no italics, no all-caps sans, no centered body text. Answer column max width 680px. Paragraph gap 12px. Q→A gap 22px.

### Color

| Token | Hex | Use |
|---|---|---|
| `--bg` | #FFFFFF | Page |
| `--surface` | #F7F7F6 | Active rail item, active chip fill |
| `--surface-hover` | #EFEFED | Row and button hover |
| `--border` | #EAEAE8 | Hairlines, dividers |
| `--border-strong` | #D4D4D1 | Inputs at rest |
| `--ink` | #111111 | Primary text, ink rules, primary button |
| `--ink-2` | #5C5C5C | Secondary text (6.7:1) |
| `--ink-3` | #767676 | Meta text (4.5:1, the floor) |
| `--accent` | #2F5BEA | Citations, source links, focus ring only |
| `--signal` | #E8590C | Marks only (3.4:1): logo, caret, live step, key-value underline |
| `--up` | #0F7B3F | Positive change, completed step |
| `--down` | #C8341F | Negative change, failed step |
| `--mark` | #FFF1B8 | Highlighted cited passage (06b) |

Rules:
- `--signal` is **never text** and never a fill behind text.
- `--accent` is **never** a button color. Primary buttons are ink.
- Up/down always carry a sign: `+` / `−` (U+2212) or `▲` / `▼`.
- Multi-series data uses greys. Never assign a color per ticker.

### Space, shape, lines

- Spacing: 4 · 8 · 12 · 16 · 20 · 24 · 28 · 48 (`--space-1`…`--space-8`).
- Radius: 0 (status squares, logo), 1px (citations), **2px default**, 4px (workspace panels only).
- Lines: hairline `1px var(--border)`. Ink rule `1px var(--ink)` on table tops and the composer. Signal underline `box-shadow: inset 0 -2px 0 var(--signal)` on one key cell.
- Sizes: header 44px, rail 220px, workspace left pane min 360px, controls 28px, chips 22px. Hit areas ≥ 44px via padding.
- Icons: Lucide, 14–16px, stroke 1.5, `--ink-2`. Status indicators are **6px squares**, not dots.
- Motion: 120ms `--ease` on hover and expand. Status lines update live. Under D82, independently checked findings appear as complete blocks while the final answer develops; never stream unverified claim text. Actual active-stage label changes may use the same tokens. The live step's signal square pulses (1s). No bounce, no spinners.
- Focus: `:focus-visible` 2px accent outline, 2px offset.

---

## 4. Components (MVP kit, 12)

Build these as reusable components. Nothing else for v1.

### 01 Composer
- Anatomy: `[Q label] [signal caret bar 2×16] [textarea] [Run ↵ button]` and a scope line below in `text-meta` (e.g. `scope: filings + transcripts`).
- Container: `border: var(--ink-rule)`, radius 2, padding `6–8px 8px 6–8px 12px`.
- Textarea: transparent, no outline, auto-grows to 8 lines. Enter runs; Shift+Enter adds a newline.
- Caret bar shows only while focused.
- Props: `placeholder`, `scope`, `onSubmit`, `disabled` (while running, Run becomes Stop).

### 02 Composer · tickers + commands
- `$` opens ticker search and inserts a ticker chip (`--surface` fill, 22px, removable ×, `aria-label="Remove {ticker}"`).
- `/` opens a command menu: `/compare`, `/chart`, `/filing`, `/export`.
- In 06c, show command hints under the composer in `text-meta`, scope right-aligned.

### 03 Buttons
| Variant | Style |
|---|---|
| Primary | `--ink` fill, `--bg` text, 500 weight. One per view (Run). |
| Outline | 1px ink border, transparent, ink text, 500 (New). |
| Quiet | 1px `--border`, `--ink-2` text (Export, Open in workspace). |
| Link | No border, `--ink-2`, underlined (show steps). |
| Icon | 28×28 transparent, `--ink-2`, `aria-label` required. |

All 28px tall, 2px radius, padding 0 10–12px. Hover: `--surface-hover` (or ink at 85% for primary).

### 04 Q / A block
- 2-column grid: `24px 1fr`, gap 8px (20px gutter in the 06b pane).
- Q row: `Q` in `text-meta`, question in `text-strong`, 14px bottom padding + hairline.
- A row: `A` in `text-meta`, then in order: step line/log → answer prose → table (optional) → source list → actions.

### 05 Step line + step log
- Collapsed (06a): one `text-meta` line, `[6px status square] 4 filings · 4 transcripts · [N]s · show steps`.
- Expanded (06b, 06c, or after "show steps"): one line per tool call, `[square] tool_name · detail`.
- Status square colors: `--up` done, `--signal` live (pulsing, line in ink), `--down` failed.
- Collapses to the summary line once the answer completes (06a only).

### 06 Citation + source list
- Inline: `text-cite` numeral after the clause it supports, linking to the source.
- Source list under the answer: `text-meta` rows `[accent numeral] [doc · page or timestamp]` in `--ink-2`.
- Click opens the source at the exact page or timestamp (in 06b, opens the matching workspace tab).

### 07 Data table
- Top border `var(--ink-rule)`, hairline between rows, row padding 5–6px 0. No zebra stripes, no vertical rules.
- Header row: `text-meta` (11px), right-aligned for numeric columns.
- Label column: `text-body` sans. Value columns: `text-data` mono, right-aligned.
- Δ cells colored with `--up` / `--down` and a sign; empty or unavailable is `n/a` in `--ink-3` (no em dashes in UI copy).
- Optional signal underline on one key cell.
- Wrap in `overflow-x: auto`; give the inner grid a `min-width`.

### 08 Sparkline
- Inline: 36×10 after a figure. In a table cell: 96×16–20.
- Polyline only: stroke `--ink-2`, width 1.25. No axes, fill or labels.
- Optional 4×4 signal square on the key point.
- `role="img"` with a descriptive `aria-label`.

### 09 Ticker chip + watchlist row
- Chip: 22px, hairline border, radius 2, `text-data` at 11px: `[TICK bold] [price ink-2] [▲/▼ change up/down]`. Used in the 06b header.
- Watchlist row (06c rail): grid `1fr auto 52px`, mono 11px, padding 4px 8px, hover `--surface`.

### 10 Tabs (06b)
- 40px tall, 20px gap, hairline under the bar.
- Active: ink text, 500 weight, 2px ink bottom border. Inactive: `--ink-2`, transparent border.
- Source tabs prefix their citation numeral in accent mono.
- Use `role="tablist"` / `role="tab"`; arrow keys move between tabs.

### 11 Rail item (06c)
- Section label in `text-meta` ("Threads", "Watchlist").
- Item: 12px sans, padding 5px 8px, radius 2. Active: `--surface` fill, ink, 500. Inactive: `--ink-2`. Hover: `--surface`.

### 12 Source passage (06b)
- Panel: hairline border, **4px radius**, padding 14px 16px.
- Header row in `text-meta`: `[accent "2 · Q3 earnings call"]` left, `CFO · [MM:SS]` right.
- Body in `--ink-2`. The exact cited span gets a `--mark` background and ink text.

---

## 5. Screens

All screens: white page, 44px header with a hairline below, logo = 10×10 `--signal` square + `[Name]` in `text-strong`.

### 06a Thread
- Header: logo / thread title (`--ink-2`) on the left, `⌘K` hint + Outline "New" on the right.
- Main: centered column, max 680px, padding `28px 16px 20px`, gap 22px.
- Q/A block → collapsed step line → answer with inline sparkline and citations → table → source list → actions (Copy icon, Quiet "Open in workspace").
- Composer pinned to the bottom of the column (`margin-top: auto`).

### 06b Workspace split
- Header: logo / ticker chip on the left, Quiet "Export" + Outline "New" on the right.
- Body: flex row that wraps. Left pane `flex: 1 1 360px`, hairline right border, padding `20px 16px 16px`. Right pane `flex: 999 1 560px`.
- Left pane: Q/A block with expanded step log, short answer, two follow-up rows (hairline-separated, `→` in mono), composer at the bottom with the scope line.
- Right pane: tabs bar, then panel content (padding 24px): `text-title` + meta unit label, data table with a trend column, source passage panel below.
- "Open in workspace" in 06a navigates here with the same thread.

### 06c Command
- Body: flex row that wraps. Rail `flex: 1 1 220px`, hairline right border, padding `12px 8px`, gap 20px: logo + ⌘K, Outline "New thread", Threads section, Watchlist section.
- Main `flex: 999 1 560px`: 44px breadcrumb bar in `text-meta` (`[company] / thread` left, `3 sources · [N]s` right), then the same centered 680px Q/A column as 06a with an expanded step log.
- Composer at the bottom with command hints (`/compare /chart /filing /export`) and the scope line right-aligned.

### Responsive
Desktop-first. The flex-wrap layouts above already stack at narrow widths: the rail and left pane go on top, and tables scroll horizontally inside their box. No other breakpoints for MVP.

---

## 6. Accessibility
- Real `<button>`, `<a href>`, `<input>`/`<textarea>` with `<label>` (visually hidden is fine). No click handlers on divs.
- `aria-label` on icon-only buttons and the ticker-chip remove buttons.
- Text contrast ≥ 4.5:1 (`--ink-3` is the floor; never go lighter for text).
- Color is never the only signal: up/down have signs, step status has a text label available to screen readers.
- Respect `prefers-reduced-motion`: no pulse, no expand animation.

---

## 7. Don'ts
- No pills, rounded-full buttons, or radius above 4px.
- No shadows, gradients, glass, or emoji.
- No chat bubbles or avatars.
- No blue primary buttons; blue means "source".
- No more than one key fact highlighted with `--signal` per view.
- No text below 10px. No weights above 500.
- No per-ticker colors in charts.

---

## 8. Acceptance checklist
- [ ] `tokens.css` imported once; components use only variables.
- [ ] All 12 components built and reused across 06a, 06b, 06c.
- [ ] Every number renders in Geist Mono with tabular numerals.
- [ ] Signal highlights at most one key fact per view, besides the logo, the focused caret and a live step.
- [ ] Citations open the right source location; in 06b they switch the workspace tab.
- [ ] Keyboard: Enter submits, Shift+Enter newlines, tabs use arrow keys, Stop is reachable, visible focus everywhere. `⌘K`, `$` and `/` only where a real supported action exists (see Section 9).
- [ ] Layouts wrap cleanly down to ~375px with no horizontal page scroll.

---

## 9. Alignment with this repo (read before building)

The canvas designs used placeholder content. In `portfolio-research-agent`, the **product scope comes from `docs/PRD.md` (current revision) and `docs/prototypes/prototype-2/BUILD-READY.md`**. Where this doc and the PRD disagree on *what* exists, the PRD wins. This doc governs *how it looks*.

**Visual precedence.** A3 replaces the D57 visual layer (Inter + IBM Plex Mono, paper/ink receipt palette) for Prototype 2. The constraints in `docs/DESIGN-BRIEF.md` still apply: no emoji, no em dashes in UI copy, no color-only status, no streaming unverified claims, accessible contrast and focus.

**Fonts.** The repo bundles fonts locally with license notices in `public/fonts/`. Load Geist and Geist Mono the same way (local files or `next/font`), add the license notice, and drop the Google Fonts `@import` in `tokens.css`.

**Scope adjustments to the designed screens**

| Designed element | P0 reality | Do this |
|---|---|---|
| Ticker chip with price and % change (06b header, 09) | No live prices | Show ticker + source period (e.g. `NVDA · FY2027 Q2 vs Q1`). Keep the price slot for later. |
| Watchlist in 06c rail | One issuer, no prices | Replace with a "Coverage" section: NVDA available with source dates, other tickers listed as not covered, or omit. |
| `/compare`, `/chart`, `/filing`, `/export`, `$` tickers | Only NVIDIA; export is P1 | Only show commands that map to real supported actions. The single next-investigation CTA (D65/D67) is a Quiet button under the answer. |
| Threads list in 06c rail | V2 baseline: active session only. V3 D93: collapsible memory-only session rail, lost on reload | V3 shows prior/current sessions in the left rail, opened/hidden by the sidebar icon. Back precedes it; New research sits top-right. An explicit All sessions action retains the D92 index. No durable history or account sync. |
| 06b right pane "workspace" | D82 keeps the answer in the thread and inspection for sources | Right pane is the **explicitly selected answer/finding's source inspection**: current/prior report tabs, actual report labels/dates and selected quoted passage when present. No Brief tab/full brief pane or Open brief CTA. Complete interpretation, 1–3 metric rows, findings, calculations/cash bridge and unanswered criteria stay in the thread. Narrow source inspection is full-width and dismissible with Close source/Escape; no global Thread/Brief switch. |
| Bottom source list (06a; component 06) | Helen removes the standalone numbered rows (D82) | Use compact inline `[1]`/`[2]` source controls beside the supported context. Report label/date remain in the accessible description or tooltip and source inspection. No pills or numeral boxes; use existing mono/accent/focus/hit-area tokens. Fact-only evidence uses report/lineage provenance without an invented quoted passage. |
| Whole checked answer after completion | D82 permits complete independently checked findings before completion | Render each passed finding as one block, labeled as a developing answer with reference checks. Final verification reconciles the complete answer; recovery, Stop and failure clear provisional findings. Never display unfinished objects or token-by-token unverified prose. |
| Mock `[00.0]%` values | Real frozen NVDA packet and code-owned facts exist | Render values from existing `src/lib` contracts and data. Never display model-supplied numbers. |

**States the PRD requires (design these with A3 parts)**

- Run status: actual preparing/researching/investigating/checking and supported generation milestones, shown in the step log with text labels. D84 makes the single current-action/status row a chevron disclosure into chronological recorded subtasks, including the live active step. One timer/final total; no separate Show/Hide actions CTA or first-attempt heading. Stop button (Outline) while running; Retry (Quiet) after failure, user-initiated only apart from D81's bounded internal formatting recovery.
- Terminal states: complete, partial, unresolved, out of scope, failed, stopped. Each gets a one-line `text-meta` status label plus plain-language copy. Failed uses `--down` square plus text. Signal orange is never used for errors.
- Limitation notice for partial results and excluded claims: hairline panel, 4px radius, `text-secondary`. No warning colors or icons beyond a status square.
- Claim types must be distinguishable without color: label `Reported`, `Calculated`, `Interpretation`, `Assumption`, `Management outlook` in `text-meta` before or beside the claim.
- Coverage and basis (F2, placement revised by D75/D82): issuer, source dates, cutoff and GAAP operating-margin basis remain in source inspection and calculation details. Do not show the three-line composer scope block, header “Frozen evidence” badge or a repeated bottom source list.
- Checked example (F11): clearly labeled as saved output with frozen dates.
- "Reference checks passed" wording only; never imply semantic verification.

Log any decision that changes this mapping in `docs/DECISIONS.md` as the repo's process requires.


## Components added after v1 (D73)

Approved by Helen after the pre-code use-case mapping on 2026-10-12; later authorized variants are recorded below through D84. Product scope follows the current PRD/build contract. Implementation is under `src/components/a3/`; `/v2` uses a separate root layout so the legacy route keeps its stylesheet. Eight text styles, palette, square geometry, one fact highlight and light-only behavior remain fixed. The original register records component history; later entries supersede earlier presentation requirements.

| Component / variant | Spec use case | Anatomy | Variants and states | Existing pieces reused |
|---|---|---|---|---|
| ResearchBrief | E1–E4; D61 artifact | Issuer/period, submitted research question, takeaway, up to three selected rows, findings, unanswered criteria, zero/one CTA, source/check status | Live, saved authored reference, complete, partial, source-limited | Text, DataTable, Citation, SourceList, Quiet Button |
| DataTable · cash bridge | E2 accounting reconciliation | Component / prior / current / signed change columns | Disclosure detail; positive/negative signs; no highlight | DataTable, Text data, source list |
| SourcePassage · grouped quotes | Citation inspection | One panel per paragraph, preserving every distinct cited quote | Multiple exact excerpts; focused paragraph | SourcePassage, FigureText, source link |
| CalculationDetail | E1 margin lineage; E2 complete accounting bridge; D71 | Native disclosure, basis/lineage, component table, reconciled total | Collapsed/expanded; optional bridge omitted when preparation fails | DataTable, Text, native details, hairline |
| Finding evidence comparison | E3; D68 | Interpretation, period-specific exact quoted evidence links, source pane | Prior/current cited passages; current-only claims remain labeled as such | Text, Citation, SourcePassage |
| RunOutcome / Limitation | E5; partial, check/provider failure, Stop | Labeled square, precise message, user-initiated retry when applicable | Partial, unresolved, out-of-scope, clarification, failed, stopped | StatusSquare, Text, Quiet Button |
| Coverage chip / row | F2; single issuer/no prices | NVDA, frozen period or source dates | Header chip; command-rail coverage row | Chip, Text |
| InvestigationAction | E4; D65/D67 | Checked finding-linked question and one explicit button | Available; omitted if invalid/unavailable/redundant; disabled during run | Text, Quiet Button, Composer |
| Empty / saved reference | Open-ended entry; F11 | Question examples, composer; explicit saved/authored provenance | Empty entry; selected reference; live run | Text display (empty only), Q/A, Buttons, Composer |
| Thread / Brief mobile switch | D61; Section 9 | Two keyboard-accessible tabs preserving session/artifact | Thread or Brief selected | Tabs, WorkspaceLayout |

### Implementation decisions

- 06a starts research and retains checked answers on completion. Under D82, explicit source inspection opens 06b; Open brief/full brief inspection is removed. The original automatic transition was superseded by D79. 06c remains a reference layout rather than a user-facing footer option, without broad ticker search, live prices, durable threads or placeholder commands. Export is omitted. The canvas's two follow-up rows become the PRD's zero/one action.
- Token additions encode A3's previously untokenized dimensions, focus, sparkline and pulse values, plus hit-target/accessibility constants. Sketch paddings and gaps outside the spacing scale use the nearest existing scale value. Fonts are bundled locally with `public/fonts/GEIST-LICENSE.txt`; no Google CSS import.
- Responsive layout uses a ResizeObserver threshold derived from pane-width tokens, because CSS variables cannot supply media-query conditions. Desktop keeps the composer visible alongside source inspection. Narrow screens use dismissible full-width inspection and contained table scrolling (D79/D82).
- Source text is verbatim evidence. Original em dashes in SEC quotations remain unchanged to preserve quote fidelity; newly authored interface copy has no em dashes or emoji. This resolves the quote-integrity versus UI-copy conflict.
- The core does not expose an inferred working-question or detailed claim-kind classification. Display the submitted research question, label synthesis as Interpretation, and identify source excerpts as Reported issuer statements. Do not invent semantic classifications. A small optional `answer_kind` field distinguishes analysis, source-limited, out-of-scope and clarification responses; live provider output requires it. Coverage/clarification replies preserve the previous useful artifact.
- Top-level financial rows remain at most three; complete cash components are disclosed separately. No sparkline is forced onto a two-quarter comparison. No additional agent, source, export or persistence is introduced.

### Composer · optional scope (D75)

Helen requests removing the repeated composer helper copy and header evidence badge. Composer reuses the existing question input, Text, Button and error state; scope content is optional, and accessibility descriptions reference only rendered scope/error elements. Empty, running, stopped and error behavior remains unchanged. This is a placement override; source provenance remains in the brief and source tabs.

### Timed StepLog and attempt recovery (D78)

- **Use case:** D77 Priority 1; E5 recovery and C6 cancellation/late results.
- **Anatomy:** question-owned attempt number, active/completed summary, current-action duration and attempt total, expandable action list, one current outcome, retry and expandable previous attempts. The brief header exposes its producing attempt’s total duration.
- **Variants/states:** sending, running, complete, partial, failed, stopped and saved reference (no invented execution duration). Server events determine stage boundaries; local Stop freezes observed timing. Retry creates an attempt under the same question and preserves its original conversation context.
- **Reuses:** StepLog, StatusSquare, Text meta/data, FigureText, Quiet/Link Button, QABlock, existing native disclosures and Outcome panel. All existing A3 tokens and reduced-motion rules apply; no new visual tokens or animation dependencies.
- **Accessibility/performance:** elapsed text stays outside live announcements; announce stage/status changes only. Clock updates are local to an active StepLog and cleaned up on terminal state/unmount. Historical timers remain fixed. Keyboard controls retain visible focus and native disclosure behavior.
- **Scope:** the current success navigation remains until Priority 2. Per-turn brief selection fixes provenance ownership without introducing thread persistence or the new header/index.


### ResearchAnswer and optional inspection (D79)

- **Use cases:** E1/E3 evidence and comparison, E2 accounting details, E4 continuation, E5 limits; D77 Priority 2 and finding-level source placement.
- **Anatomy:** one shared checked answer body with interpretation, selected DataTable rows, all surviving findings, inline source controls, native calculation/bridge disclosures, unanswered criteria, optional next CTA and source/check status. It appears directly in each successful Q/A; the optional brief adds issuer/question/revision/duration metadata.
- **Variants/states:** live, authored reference, complete, partial, source-limited; centered thread by default, user-opened desktop split or dismissible narrow inspection. No global Thread/Brief navigation or footer layout chooser. Close/Escape returns to the opener; draft, native disclosures and thread scroll remain intact.
- **Reuses:** Text/FactProse, QABlock, DataTable, Quiet Button, SourceList, Tabs, SourcePassage, Outcome and the existing layout widths. Inline source controls use accent source-link styling and existing hit-area/focus tokens; no new visual values.
- **Overrides:** the original successful-turn transition to 06b and mandatory mobile Thread/Brief switch are superseded. The thread stays the primary surface. Internal Brief/source tabs appear only after explicit inspection. The optional pane is bound to the chosen turn and does not follow incoming completions.
- **Signal/accessibility:** only the most recent valid thread answer gets the key-fact underline; inspection has none. Pane regions use section labels rather than tabpanel labels referencing removed navigation. Source tabs retain keyboard controls; close restores focus without losing input or disclosure state.
- **Evidence limits:** links support findings as a whole, not automatically each clause. Existing qualitative citation-completeness evaluation remains open; this UI change makes no new semantic verification claim.


### StepLog · single task and duration (D80)

- **Use case:** Helen's ninety-one-second failure feedback; bounded generation and recovery status.
- **Anatomy:** one active task/status square and one elapsed duration; after terminal state, one completion/failure/Stop status and one total duration. Optional Show/Hide actions moves to a separate row. Expanded history omits the current live action and all extra duration values. The recovery message does not repeat the failure heading already in StepLog.
- **Variants/states:** sending, preparing, generating, inspecting, checking, complete/partial, failed and stopped. Historical attempts keep their own frozen summary, expanded only by selection.
- **Reuses:** StepLog, Text meta, StatusSquare, Button link, native list/disclosure controls and existing A3 tokens. Timer text remains outside the single live status announcement; reduced-motion and cleanup remain unchanged.
- **Override:** D78's two simultaneous current-action/attempt-total values and visible per-action durations are superseded. Internal timing records remain for debugging.


### StepLog · bounded formatting recovery (D81)

- **Use case:** generation whitespace stalls and uninterrupted same-turn recovery.
- **Variant/state:** “Retrying response formatting” becomes the sole active stage; the abandoned generation action is failed, then existing checking/completed states apply. One timer and one Q/A turn remain.
- **Reuses:** StepLog, Text meta, StatusSquare, existing stage history and Outcome. No new tokens/components or raw streamed claims. Generic user Retry remains explicit; this stage records a real bounded internal formatting request within the existing two-call maximum.


### Complete finding preview, inline citations and source-only inspection (D82)

- **Use cases:** E1/E3 useful supporting/qualifying evidence before synthesis completes; E2 code-owned numbers and lineage; E5 cancellation/recovery; Helen's request to remove Open brief and bottom source rows.
- **Anatomy:** a developing-answer label, one complete finding block at a time, code-rendered figures and compact inline source controls. The final answer replaces/reconciles provisional findings only after full dependency checks. Source controls open an answer-owned report inspection pane with actual label/date, report tabs and exact cited excerpts where present.
- **Variants/states:** developing/reference-checked, final complete/partial, source-limited and authored reference. Provisional content clears on recovery, Stop or failure. A failed finding never renders. Fact-only findings link honest report/lineage provenance; qualitative findings can select their exact quoted passage. Historical successful answers retain their own source inspection.
- **Reuses:** Text/FactProse, QABlock, Citation, Tabs, SourcePassage, existing WorkspaceLayout widths, Outcome and source links. New compact InlineCitation uses mono `[1]`/`[2]`, accent only for source interaction, actual report/date tooltip or accessible label, visible focus and existing minimum hit-area token. It has no pill or boxed numeral and introduces no color/type/spacing values. The SourceList kit remains available as a reference primitive but is absent from answer and cash-bridge presentation.
- **Overrides:** D79's Open brief action and internal Brief tab/full brief pane are removed. No standalone source list follows the answer or bridge. Calculation/bridge details remain native in-thread disclosures. This is Helen's explicit presentation update; the fixed A3 principles, eight text styles, light mode, square geometry, signal-once rule and accessibility requirements remain intact.
- **Accessibility:** source controls are real buttons/links with report identification, visible keyboard focus and at least the tokenized hit area. Source tabs retain keyboard navigation. Close/Escape restores focus and preserves input, disclosures and thread position. Preview/status announcements describe completed checks; timers remain outside live announcements.
- **Evidence boundary:** “Reference checks passed” describes mechanical validation only. No claim of semantic verification, complete clause-level citation support or final investment suitability. Qualitative citation-coverage review remains open.

### StepLog · animated active stage (D82)

- **Use case:** real subaction progress remains visible in the top-level L1 line while findings arrive.
- **Anatomy:** existing live status square, current stage label and one elapsed duration; label entry animates only when the actual stage changes. Show/Hide actions stays on its secondary row; terminal state has one total duration.
- **Variants/states:** preparing, generating, approved evidence/metric investigation, final checking, bounded formatting recovery and terminal outcomes. Do not simulate a stage sequence or expose private model reasoning. Stage history continues to record actual executed actions.
- **Reuses:** StepLog, StatusSquare, existing Text styles and `--dur`, `--ease`, spacing/pulse tokens. Motion uses opacity/transform with no new animation dependency, layout jump, spinner or typing dots. `prefers-reduced-motion` suppresses label/pulse animations; active status is still readable.
- **Scope:** this improves feedback, not model completion latency. No second timer, per-action duration repetition or live-announced clock ticks. Header/index/history remain deferred.

D82 implementation checks also preserve keyboard focus when a developing citation is reconciled or Stop removes source inspection. Row implication placeholders resolve from the row's checked fact and keep numerical spans mono. The real stage sequence can include remaining-findings and final-synthesis milestones; it never invents private reasoning or delays.


### StepLog · compact chevron action disclosure (D84)

- **Use case:** Helen's compact L1 progress/terminal-status request and click-to-inspect actual subtasks.
- **Anatomy:** one native clickable row containing status square, actual current action or terminal status, one elapsed timer/final total and chevron. Retry attempt number appears inline only after the first attempt. Clicking anywhere in the row expands its controlled chronological action list, including the explicitly live active stage; terminal steps retain done/failed/stopped labels.
- **Variants/states:** collapsed/expanded; preparing, generating, remaining findings, final synthesis, approved investigation, checking, recovery, complete/partial, failed and stopped. No first-attempt heading or standalone Show/Hide actions control. Existing previous-attempt history and producing-turn ownership remain intact.
- **Reuses:** StepLog, StatusSquare, existing Text data/meta, native button/list, existing icon geometry/focus/hit-area and motion tokens. There is no new visual token or library. A3 colors, eight text styles, mono numerical values, square geometry, signal-once and light-only behavior stay fixed.
- **Motion:** label transitions reflect actual recorded stage changes at L1; opacity/transform and chevron/disclosure transitions use existing `--dur`, `--ease` and spacing tokens. `prefers-reduced-motion` suppresses animation while preserving readable state and expansion. No private reasoning, simulated stage sequence, spinner or typing dots.
- **Accessibility:** button has `aria-expanded` and `aria-controls`, native Enter/Space operation, visible focus and a hit area at least `--hit-area`. Keep stage/status announcements separate from timer ticks; do not repeat durations in substep rows. Expanded live status is explicit text rather than color alone.
- **Overrides:** D80/D82's secondary Show/Hide actions row and omission of the active action from expanded history are superseded by Helen's explicit update. One active timer/final total remains; no model/source/checking or D83 protocol change. Actual verification is recorded separately from motion intent or model latency.

### V3 finding summary / expandable analysis (D86)

- **Use case:** Prototype 3 E1–E4 research depth with compact in-thread presentation; approved by Helen.
- **Anatomy:** interpretive support/challenge/context label in Text meta; qualified summary in Text strong with existing InlineCitation; native details/summary revealing checked analytical text; completed Verdict above and checked Thesis assessment below.
- **Variants/states:** independently checked developing finding, completed/partial answer, authored reference; collapsed/expanded analysis. Expanded state is attempt-owned and retained at final completion; new attempts/sessions have independent state. Stop/recovery clears provisional content as before.
- **Reuse:** Text/FactProse/FigureText, existing inline citations/source inspection, native CalculationDetail disclosure classes/hit areas, DataTable, Q/A, StepLog and WorkspaceLayout. No new colors, sizes, spacing, motion, pills, shadows or tabs.
- **Precedence:** D86 adds typed interpretive roles and a checked summary to V3. This supersedes the historical lack of role fields for V3 only; roles are model interpretations, not verification or investment ratings. Both summary/detail need valid facts/references, and essential qualifications must remain visible in the summary. V2 styling/contract remains unchanged.

### V3 evidence basis and discrepancy disclosures (D88)

- **Use case:** D87 extraction/provenance/discrepancy acceptance in Prototype 3 E1–E4; failed-answer transparency.
- **Anatomy:** existing native detail for evidence basis, reported/calculated labels, explicit fiscal periods/comparison baselines, source token/scale or formula/input values. A source conflict adds a short visible notice and native “Inspect discrepancies” detail with code-owned values and existing inline source controls.
- **States:** collapsed/expanded, reported/derived/rounded-input calculation; developing/complete/partial/failed answer with known discrepancy. A failed answer can show source issues while retaining earlier checked work.
- **Reuse:** Text, FigureText/mono data, InlineCitation/source inspection, existing limitation/disclosure classes and accessible hit areas. No new colors, typography, space, radius, lines, motion or tabs. Source context/basis inspection replaces the misleading all-calculated label in V3 only.

### V3 grouped findings and investigation handoff (D89)

- **Use cases:** Helen's seven V3 browser comments; E1–E3 scannable evidence/interpretation and E4 continuation.
- **Anatomy:** one support/challenge/context section heading (`h2`, Text title), qualified finding subheadings (`h3`, Text strong), visible Text body bullet lists with mono figures and inline source controls. One “What to investigate next” section combines missing-evidence criteria and the existing zero/one feasible Quiet CTA.
- **States:** developing checked finding, complete/partial answer and authored reference; absent roles are omitted, related findings share a heading. No supporting-analysis disclosure to open. Basis/bridge and source/discrepancy inspection remain native disclosures/panes.
- **Reuse:** Text, FactProse/FigureText, InlineCitation, Quiet Button, existing hairlines and spacing tokens, Q/A and source inspection. Styles are scoped to new V3 classes; no change to V2 presentation, the eight type styles, colors, sizes, motion or square geometry.
- **Accessibility:** semantic heading levels and native lists; source controls retain tokenized hit areas and focus. Remember the exact finding/bullet source opener through final reconciliation and inspection close. No private model reasoning or extra calls.
- **Evidence boundary:** show all checked analytical sentences in at most three bullet groups, with no heuristic sentence removal or resynthesis. Financial clauses use actual placeholder lineage; qualitative citations remain at finding granularity. Existing caveats and source-only limitations remain visible. Unavailable external research needs do not become clickable executable actions.
- **Override:** D86's small meta role labels and collapsed analytical detail are superseded in V3. Helen explicitly requests header-level typography and font size in D89. Use the existing Text title style for answer section headings (an authorized extension of its original panel-title use) and Text strong for finding subheadings. Body copy remains the standard size; no new font size, weight or token is introduced. Code records this placement decision with `DESIGN-DECISION`.

### V3 inline Source / verdict context variants (D90)

- **Use cases:** Helen's five marked V3 comments; E1–E3 readable evidence and verdict context, E4 remaining research needs, E5 transparent partial/failure states.
- **Anatomy:** underlined “Source” anchor after an evidence sentence, report/date tooltip and accessible name, original report href; normal activation opens existing source inspection. `SourceCitations` groups every contributing report into one visible link per evidence point, with both reports identified when needed and retained in inspection tabs; its href targets the first contributing report. Context findings use their existing strong subheadings/body bullets directly beneath Verdict, without a separate context title. Thesis findings retain grouped title headings. Financial values have no signal underline; unanswered criteria retain their optional action without the two repeated closing sentences.
- **States:** all-role developing findings while verdict is pending; completed/partial/context-under-verdict answer; authored reference; source and discrepancy inspection. Empty role groups are omitted and context appears exactly once. Partial/source-limited notices remain immediately after the verdict text.
- **Reuse:** Text title/strong/body, FactProse, existing InlineCitation/source inspection and focus machinery, DataTable with no highlight, native lists and disclosures. Same palette, fonts, shape, spacing scale and motion. Bullet gaps use the existing smaller spacing token.
- **Explicit sizing/label override:** Helen asks for inline text with no citation-induced line gaps. V3 anchors use the surrounding prose line box, rather than the former 44px citation-button tile, and label it “Source” rather than a numeral. Standalone controls retain their hit-area rule; do not enlarge text-link targets using overlapping invisible regions. This override of the original numeral/tile presentation is recorded in code with `DESIGN-DECISION`. Visible focus, native Tab/Enter activation and return to the exact source opener remain required. Source tabs may retain their actual report identifiers.
- **Evidence boundary:** this relocates/presents the same checked findings. No extra synthesis, heuristic trimming, early verdict, new source or automated investigation. Removing the generic closing check sentence does not change validation or hide specific reference failures/discrepancies.

### V3 session index and header navigation (D92)

- **Use cases:** D77 header/index feedback; D92 navigation before latency, C5 session isolation and C6 cancellation/recovery.
- **Anatomy:** header Research/back control, adjacent accessible new-research icon; centered index heading, New research button, ruled question/outcome/activity rows, per-session delete icon and capacity/empty notices. Thread/source inspection keeps 06a/06b; index extends the centered 06a surface with RailItem-like rows. No permanent command rail, watchlist, layout tabs or placeholder commands.
- **States:** draft, saved reference, researching, completed, partial, failed/stopped; index/thread, maximum ten memory-only sessions, empty/deleted/capacity notice. While working, index/other session exposes return/Stop; new-session and running-session deletion are disabled. No storage permission, local persistence or account sync is added.
- **Reuse:** Text strong/secondary/meta/title, FigureText, Button icon/outline/link, logo/status rules, original header/answer widths, hairlines and A3 spacing. Icons reuse tokenized geometry/stroke; all figures remain mono. Header/home target extends the icon variant to include the existing Research wordmark. No new visual tokens, colors, fonts, radii or motion.
- **Accessibility:** native buttons, labeled icons, tokenized 44px targets, Enter/Space, focus restored to index heading/new composer/opened session. Hidden sessions retain state without appearing in accessibility navigation; source/tab/passage IDs are session-scoped. Mobile wraps with no page overflow. Reduced-motion rules remain inherited.
- **Scope/decision:** PRD permits the session index now; the older single-active-session-only Section 9 description is superseded for V3. Durable history remains deferred. `DESIGN-DECISION` records the centered index choice while preserving fixed A3 rules. Input preflight reuses the Composer error state; it does not reinstate Helen's removed scope/footer paragraphs.

### V3 collapsible session rail / Back header (D93)

- **Use case:** Helen's history-discoverability feedback; D93 previous-view navigation and ongoing-session visibility.
- **Anatomy:** native Back icon, sidebar toggle with expanded/controls semantics, Research wordmark and far-right New research icon. Existing 06c rail width; current/prior session rows with actual outcome, active grey/current label, delete control and All sessions action. Two-line title variant keeps full tooltip/accessible name.
- **States:** open/hidden rail; current, researching and terminal sessions; first-view Back disabled; previous session/index restored; deleted session not restored. At phone widths, token-derived left drawer closes via toggle, outside selection, session choice or Escape. The 545px working preview retains a left rail. This explicit navigation direction supersedes D92's wordmark entry and the generic stacked 06c responsive pattern for this V3 variant.
- **Reuse:** Text/mono, Button icon/link/outline, RailItem/active grey, existing rail/spacing/focus/icon/motion/hairline tokens. No new font, colour, radius, shadow or theme. Position/height derives from existing header/control/spacing geometry; the running header's Stop row stays above the compact drawer.
- **Lifecycle/accessibility:** mounted D92 sessions retain answers, drafts/disclosures/source ownership through hide/show/Back. Native labeled buttons keep tokenized hit targets; Escape restores toggle focus. Narrow drawer dismiss control is a real labeled button, with no pretend modal semantics. Bound view history in memory only. Existing source Escape takes precedence over rail dismissal. No persistence or new model work.

D94 removes the All sessions link beneath the Sessions heading; direct session rows are the history navigation. Other D93 controls and fixed A3 rules remain unchanged.

### Browser history controls and recovery (D95)

- **Use case:** retain V3 public-company research across reload; storage failure, source incompatibility and interrupted runs.
- **Anatomy:** existing session rail/index with Delete and a quiet Clear history button; native explicit clear confirmation; existing status notice and Composer/Outcome for restoring/interrupted/error states.
- **States:** saving/restoring, completed restored evidence, interrupted/manual retry, corrupt/expired/unavailable storage and conflicting newer tab. Cross-reload disclosure/source/scroll state is not retained.
- **Reuse:** Button quiet/icon, Text meta/secondary, existing session rows and failure/retry components; no new tokens, raw visual values, colour, theme or motion. D92–D94's memory-only copy is superseded by D95's approved browser retention. Clear is disabled while research is running.
- **Later, not implemented:** Helen authorizes planning removal of prose dividers and adjustable rail width after four MVP priorities. Keep current A3 styles until that phase; record any visual override explicitly.
