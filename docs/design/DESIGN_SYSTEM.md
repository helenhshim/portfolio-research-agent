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
- Motion: 120ms `--ease` on hover and expand. Status lines update live, but checked answers appear whole: never stream unverified claim text. The live step's signal square pulses (1s). No bounce, no spinners.
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

The canvas designs used placeholder content. In `portfolio-research-agent`, the **product scope comes from `docs/PRD.md` (v0.42) and `docs/prototypes/prototype-2/BUILD-READY.md`**. Where this doc and the PRD disagree on *what* exists, the PRD wins. This doc governs *how it looks*.

**Visual precedence.** A3 replaces the D57 visual layer (Inter + IBM Plex Mono, paper/ink receipt palette) for Prototype 2. The constraints in `docs/DESIGN-BRIEF.md` still apply: no emoji, no em dashes in UI copy, no color-only status, no streaming unverified claims, accessible contrast and focus.

**Fonts.** The repo bundles fonts locally with license notices in `public/fonts/`. Load Geist and Geist Mono the same way (local files or `next/font`), add the license notice, and drop the Google Fonts `@import` in `tokens.css`.

**Scope adjustments to the designed screens**

| Designed element | P0 reality | Do this |
|---|---|---|
| Ticker chip with price and % change (06b header, 09) | No live prices | Show ticker + source period (e.g. `NVDA · FY2027 Q2 vs Q1`). Keep the price slot for later. |
| Watchlist in 06c rail | One issuer, no prices | Replace with a "Coverage" section: NVDA available with source dates, other tickers listed as not covered, or omit. |
| `/compare`, `/chart`, `/filing`, `/export`, `$` tickers | Only NVIDIA; export is P1 | Only show commands that map to real supported actions. The single next-investigation CTA (D65/D67) is a Quiet button under the answer. |
| Threads list in 06c rail | Active session only, lost on reload | Show the current session's turns or omit; display the reload-loss notice (F7). |
| 06b right pane "workspace" | Thread + brief artifact (D61) | Right pane is the **latest checked brief**: working question, direct answer, 1–3 metric rows (label / value / implication), supporting and qualifying evidence, unanswered questions, source and check status. Tabs: Brief, then one tab per source. On narrow screens use an accessible Thread / Brief switch. |
| Mock `[00.0]%` values | Real frozen NVDA packet and code-owned facts exist | Render values from existing `src/lib` contracts and data. Never display model-supplied numbers. |

**States the PRD requires (design these with A3 parts)**

- Run status: preparing → researching → checking, shown in the step log with text labels. Stop button (Outline) while running; Retry (Quiet) after failure, user-initiated only.
- Terminal states: complete, partial, unresolved, out of scope, failed, stopped. Each gets a one-line `text-meta` status label plus plain-language copy. Failed uses `--down` square plus text. Signal orange is never used for errors.
- Limitation notice for partial results and excluded claims: hairline panel, 4px radius, `text-secondary`. No warning colors or icons beyond a status square.
- Claim types must be distinguishable without color: label `Reported`, `Calculated`, `Interpretation`, `Assumption`, `Management outlook` in `text-meta` before or beside the claim.
- Coverage and basis (F2, placement revised by D75): issuer, source dates, cutoff and GAAP operating-margin basis remain in the brief/source tabs and calculation details. Do not show the three-line composer scope block or the header “Frozen evidence” badge.
- Checked example (F11): clearly labeled as saved output with frozen dates.
- "Reference checks passed" wording only; never imply semantic verification.

Log any decision that changes this mapping in `docs/DECISIONS.md` as the repo's process requires.


## Components added after v1 (D73)

Approved by Helen after the pre-code use-case mapping on 2026-10-12. Product scope remains D65–D72. Implementation is under `src/components/a3/`; `/v2` uses a separate root layout so the legacy route keeps its stylesheet. Eight text styles, palette, square geometry, one fact highlight and light-only behavior remain fixed.

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

- 06a starts research; a successful turn opens 06b. 06c is an optional current-session layout, without broad ticker search, live prices, durable threads or placeholder commands. Export is omitted. The canvas's two follow-up rows become the PRD's zero/one action.
- Token additions encode A3's previously untokenized dimensions, focus, sparkline and pulse values, plus hit-target/accessibility constants. Sketch paddings and gaps outside the spacing scale use the nearest existing scale value. Fonts are bundled locally with `public/fonts/GEIST-LICENSE.txt`; no Google CSS import.
- Responsive layout uses a ResizeObserver threshold derived from pane-width tokens, because CSS variables cannot supply media-query conditions. Desktop keeps the composer visible while the brief scrolls. Narrow screens use Thread/Brief tabs and contained table scrolling.
- Source text is verbatim evidence. Original em dashes in SEC quotations remain unchanged to preserve quote fidelity; newly authored interface copy has no em dashes or emoji. This resolves the quote-integrity versus UI-copy conflict.
- The core does not expose an inferred working-question or detailed claim-kind classification. Display the submitted research question, label synthesis as Interpretation, and identify source excerpts as Reported issuer statements. Do not invent semantic classifications. A small optional `answer_kind` field distinguishes analysis, source-limited, out-of-scope and clarification responses; live provider output requires it. Coverage/clarification replies preserve the previous useful artifact.
- Top-level financial rows remain at most three; complete cash components are disclosed separately. No sparkline is forced onto a two-quarter comparison. No additional agent, source, export or persistence is introduced.

### Composer · optional scope (D75)

Helen requests removing the repeated composer helper copy and header evidence badge. Composer reuses the existing question input, Text, Button and error state; scope content is optional, and accessibility descriptions reference only rendered scope/error elements. Empty, running, stopped and error behavior remains unchanged. This is a placement override; source provenance remains in the brief and source tabs.
