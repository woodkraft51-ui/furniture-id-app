# Field Guide — Project Plan & Phase Tracker

**Product:** *Field Guide to American Furniture Identification, 1840–1940*
— *Spotting, Dating & Valuing the Antiques You'll Actually Find — Victorian to Art Deco*
(title owner-approved; era 1840–1940 set as Claude's market recommendation, owner-delegated). A curated, complete-in-itself digital field guide — a three-part
structure (Method → 30 Forms → back-of-book Reference Atlases) + short Clocks chapter —
sold as a PDF for Father's Day 2026.

**Scope of app vs. guide:** the ID engine covers ~250 forms; the Field Guide is a
**curated subset** of the most commonly-encountered American antique forms
(~1850–1940). The full 250+ is a *future* "Complete Encyclopedia Edition."

---

## Positioning decision (owner-approved 2026-06-08)

- This is a **Field Guide** — a complete, respected category in its own right
  (like a birding field guide). It is NOT marketed as partial.
- The Complete Encyclopedia Edition is mentioned **only as future upside**, never
  as a sign this one is incomplete. Placement: back page + sales page, framed as a
  **buy-now incentive** — "lock in founder's price / free upgrade when it launches."
- **Email capture** ("be first when the Complete Edition drops") is the real prize:
  warm list for the Encyclopedia, the teaching app, AND the ID app.
- The Field Guide's table of contents is structured to **double as the spine for the
  future teaching mode** — nothing written twice.

---

## DESIGN MANDATE (owner-directed 2026-06-08 — governs everything)

Owner is a 30-year curriculum-development professional. Direct quote of intent:
*"Visual is what works. Visual is what sells. If it looks good, visually friendly,
visually easy to understand, visually appealing, uses the 3-and-5 color patterns,
has just the right margins — it will sell way better. Appeal sells better than
content, even — but we'll have both."*

This is a **first-class requirement**, not finishing polish. It governs the chapter
template, illustration density, and the production toolchain:
- **Visual-first per page** — silhouette/recognition imagery and diagrams lead; prose
  supports. Every dating "tell" wants a diagram (e.g. hand-vs-machine dovetail plate,
  fastener timeline strip), not a paragraph.
- **3-and-5 color discipline** — a tight, intentional palette (≈3 core + up to 2 accents),
  applied consistently; color-code the form categories for at-a-glance navigation.
- **Generous, consistent margins & whitespace** — readability and "premium feel."
- **Strong visual hierarchy** — scannable; "field decision in 10 seconds" panels.
- **Comparison plates** — the "how it differs from look-alikes" content rendered as
  side-by-side visuals, not text.
- **Implication for toolchain (Phase 4):** a plain markdown→PDF pipeline will NOT hit
  this bar. Production needs a designed template (Canva/InDesign/Affinity, owner-side)
  OR a Claude-driven pipeline capable of real layout. Claude will deliver a **design-system
  spec** (palette, type scale, grid/margins, repeating page components, per-form
  wireframes) so production is "pour content into a designed shell," not design-as-you-go.

Trimming to 30 forms (from 40) directly serves this: fewer forms = more page real estate
and richer visuals per form, and lighter illustration-sourcing load on the 9-day timeline.

## Phase timeline & review gates (target launch: Jun 17, ~4 days ad runway before FD Jun 21)

| Phase | Deliverable (review artifact) | Target | Status |
|---|---|---|---|
| **0 — Scope & TOC** | `phase0-scope-and-toc.md` — recommended 40 + chapter spine + scope judgment calls | Jun 9 | **DRAFT READY — awaiting touch-base** |
| **1a — Design system** | Palette (3+2), type scale, grid/margins, repeating page components, per-form wireframe | Jun 10 | pending owner template input |
| **1b — Sample chapter** | One fully-built chapter *designed into the system* (text + illustration sourcing) as the pattern | Jun 10–11 | pending Ph0 approval |
| **2 — Full manuscript** | All chapter text assembled & edited from source | Jun 13 | — |
| **3 — Illustration manifest** | Every image sourced (patents / Met / Smithsonian CC0 / Wikimedia PD) w/ URL + license + placement | Jun 14 | — |
| **4 — Layout / PDF draft** | The formatted product | Jun 16 | — |
| **5 — Go-to-market** | Sales-page copy, pricing, platform, ad creatives | Jun 16 | — |
| **6 — Launch** | Live + ads running | Jun 17 | — |

## Known dependencies (flagged, not surprises)
1. **Later dates firm up after Ph0** locks the form count. (40 assumed; 60 pushes right, 25 pulls left.)
2. **Layout (Ph4) + image download need a toolchain decision or owner's hands.** Claude can deliver print-ready manuscript + license-verified image manifest, but cannot do visual page-layout or pull image files from inside the execution environment. Decide pipeline (owner tool: Canva/Docs/InDesign — vs. a markdown→PDF pipeline Claude can drive) at the Ph1 touch-base.
3. **Owner review turnaround is on the critical path** — each gate waits on a touch-base; assumes same/next-day reviews.

## Parallelism
- Runs alongside the app's 40-scan real-world test pass (`docs/real-world-test-pass.md`).
- Scans are owner-driven (logging is minutes for Claude); manual is Claude-driven (owner only makes scoping calls). Different resources → genuine parallel, no schedule conflict.
- App *fixes* are blocked until all 40 scans regardless (owner's rule), so manual work does not delay app work.
