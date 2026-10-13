# V3 collapsible session rail

2026-10-13 · D93 · PRD v0.63 · local UI checkpoint.

Helen could not discover prior sessions through the Research wordmark and requests a Codex/ChatGPT-style collapsible left rail, Back before its toggle, and New research top-right. D92's memory-only retention and session ownership remain unchanged. Back tracks bounded prior in-app session/index views, not browser history or external pages.

## Observed checks

- The actual open 545px preview retained all three user sessions after the hot navigation update: saved profitability reference, completed profitability research and completed cash-flow research. No reload or new model call was used.
- At 545px the rail is 220px wide and remains on the left, with no page overflow. Back/toggle/New controls occur left-to-right at observed x positions 16/68/470. Current session is labeled and uses `aria-current=page`; actual outcomes distinguish ongoing/terminal work.
- Selecting the cash-flow session retained its checked answer. Back returned to the preceding index. Sidebar collapse/reopen retained the identical answer turn `turn-770496c5-67e1-4513-be6a-d9359c0367ab` and checked content.
- Top-right New research created a separate draft and focused its composer. Back returned to the previous cash-flow answer. Deleting only that empty synthetic test session left the three original user sessions intact.
- At width 375, the drawer is initially hidden and the page has no horizontal overflow. Show opens a left drawer. Escape from the header toggle closes it and restores focus to Show session sidebar. Returning to normal viewport restores the desktop rail; all three sessions remain.
- Native source inspection/turn components remain mounted; the rail adds no credentials, storage or provider imports. Running-session controls remain D92: one run, global return/Stop when elsewhere, no deletion of the running session. Compact drawer geometry keeps the global Stop header row uncovered.
- 147 existing tests, TypeScript and optimized build pass. No new paid/model trial or source retrieval. UI checks do not establish additional reasoning quality or hosted safety gates.

An initial responsive draft stacked the rail at 545px, creating an oversized gap above the index. Visual verification caught it; final implementation retains a left rail at the real working width and uses a token-derived drawer only for phone-sized header content. Existing session state survived the correction.

Evidence: [working-width rail](D93-SESSION-RAIL.png), [phone drawer](D93-SESSION-DRAWER.png). Test/build logs are local `/private/tmp/portfolio-d93-*` files. Persistent saved history still requires a separate retention/storage decision; reload clears the current sessions.
