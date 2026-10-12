# docs/design

Visual design system for Prototype 2 (A3, light mode only). Added 2026-10-12.

| File | What it is |
|---|---|
| `DESIGN_SYSTEM.md` | A3 principles, type, color, spacing, the 12-component kit, screen layouts (06a Thread, 06b Thread + Brief, 06c Command) and Section 9, which maps the designs onto this repo's P0 scope. |
| `tokens.css` | All design tokens as CSS variables plus type classes. The only source of color, type, spacing, radius, lines and motion values. |

## Which docs govern what

- **Product scope, behavior, states and acceptance criteria:** `docs/PRD.md` (current revision) and `docs/prototypes/prototype-2/BUILD-READY.md` (minimal build contract). Interaction direction: D61 in `docs/DESIGN-BRIEF.md` and `docs/prototypes/prototype-2/UI-CONCEPT.md`.
- **Visual system:** this folder. It replaces the D57 Inter/IBM Plex receipt styling for Prototype 2. The non-visual constraints in `docs/DESIGN-BRIEF.md` still apply.
- **Older drafts:** `docs/product/v2-prd.md` and `docs/product/v2-implementation-plan.md` are earlier proposals pending reconciliation. Don't treat them as current scope.

If the product docs and this folder disagree about what exists, the product docs win. This folder decides how it looks.
