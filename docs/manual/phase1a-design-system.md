# Phase 1a — Design System (DRAFT for owner review)

> The visual "shell" every chapter pours into. Owner is the visual authority here —
> this is an opinionated starting point to react to, not a finished decree. Per the
> Design Mandate: visual-first, 3-and-5 color discipline, generous margins, premium feel.
> (Claude can't render final art inside the execution environment; this specifies the
> system precisely enough for a designer/Canva/InDesign — or a layout pipeline — to execute,
> and for the sample chapter [1b] to be built to it.)

---

## DESIGN DECISIONS (owner 2026-06-08)
- **Palette: WARM** — the warm-wood neutrals + teal(=dating)/oxblood(=caution) scheme below. ✓
- **Trim: 6×9 portrait** (Claude's lean, owner-delegated) — premium field-guide feel, most phone-friendly book ratio, clean print path for a future physical edition. ✓
- **Illustration: LINE-ART SILHOUETTES on COLOR-BLOCK panels**, palette-keyed (NOT photo plates).
  Chosen for consistency + scalability across 30+ forms (sourced photos can't be sustained
  uniformly; consistency wins). Silhouettes drawn in Espresso line on a solid palette-tint block;
  same treatment for hero plates, comparison plates, and atlas specimens. Derivable cleanly from
  PD patent drawings. ✓
- **Hook: TWO-STAGE (owner Q4, 2026-06-08).** Replaces the single "recognize in 10" box with
  the way experts actually work — *eliminate fast, then confirm carefully*:
  - **⚡ RULE IT OUT IN 10** (top box) — 1–2 quick-kill disqualifiers.
  - **🔍 ON THE SHORT LIST? CONFIRM IT** — defining features + Date-It strip + comparison plate.
  Mirrors Part I's process and the engine's eliminate-vs-affirm logic.

---

## 1. Palette — 3 core + 2 accent (the "3-and-5") — WARM, approved

| Role | Name | Hex | Use |
|---|---|---|---|
| Core 1 | **Espresso** | `#3A2E26` | Primary text, headers — evokes aged wood |
| Core 2 | **Parchment** | `#F5EFE6` | Page background — warm paper |
| Core 3 | **Kraft Tan** | `#C9A86A` | Rules, panel fills, thumb-tabs |
| Accent 1 | **Verdigris** | `#3E6B66` | DATING elements only (patina/oxidation cue) |
| Accent 2 | **Oxblood** | `#9B4B3B` | CAUTIONS + value badges only |

Discipline: warm neutrals carry the whole book; the two accents appear *sparingly and with
fixed meaning* (teal = always about date, oxblood = always a warning/value). Consistent
meaning = the reader learns the color code subconsciously. **Category tabs** use tints of
Kraft Tan (not a rainbow) so the book stays cohesive — see §5.

## 2. Typography
- **Display / headers:** a heritage serif with character (Playfair Display / Caslon family).
- **Body:** a highly readable serif (Source Serif / Lora) — long-form comfort.
- **Data & labels:** a condensed humanist sans (Barlow Semi Condensed) for dates, dimensions, captions — visually distinct from prose so "facts" pop.
- **Modular scale ~1.25:** H1 32 / H2 25 / H3 20 / Body 11–12 / Caption 9.5 / Micro-label 8.

## 3. Page format & margins
- **Trim:** 6×9 in (classic field-guide book ratio; reads well on phone/tablet, prints clean).
- **Margins:** generous — outer 0.75", inner 0.6", top 0.7", bottom 0.8". A **wide outer rail
  (~1.4")** holds thumbnails, the "10-second" box, and cross-ref chips. Whitespace is a feature.
- **Grid:** single main text column + outer rail. Atlas pages (Part III) switch to a 2- or 3-up specimen grid.

## 4. Repeating page components (the "kit") — every form chapter is assembled from these
1. **Category thumb-tab** — color-coded bleed tab on the outer edge (physical thumb-index feel).
2. **Title block** — form name · "also called…" aliases · era band (a mini 1600–1940 bar with the form's active range highlighted).
3. **⚡ RULE IT OUT IN 10** box (outer rail, top) — 1–2 quick-kill disqualifiers; the hook. Followed lower by **🔍 ON THE SHORT LIST? CONFIRM IT** (defining feature + the careful checks). Two-stage: eliminate fast, confirm slow.
4. **Hero plate** — silhouette line-art and/or a representative photo.
5. **DATE IT strip** (Verdigris-keyed) — a horizontal layered band: fastener · joinery · wood · hardware · finish, each with a tiny icon and the date it pins. Mirrors the engine's layered dating.
6. **DON'T CONFUSE IT WITH… plate** — side-by-side comparison: this vs. its top look-alike, with the 1–2 distinguishing tells circled.
7. **VALUE badge** (Oxblood-keyed) — resale range, compact.
8. **⚠ WATCH FOR** callout (Oxblood) — reproductions, marriages, replaced parts.
9. **Cross-ref chips** — "→ Wood Atlas p.X · Fastener Atlas p.Y" linking Part II forms to the Part III skill atlases. (This is the structural glue of your three-part idea.)

## 5. Category color-coding (tints of Kraft Tan, cohesive)
Seating · Tables · Case & Storage · Desks · Beds · Everyday · Clocks — each a distinct
muted tint for its thumb-tab + title rule, all within the warm family.

---

## 6. Wireframe — a FORM chapter spread (Part II)

```
┌─────────────────────────────[ left page ]──┬──[ right page ]────────────────────────┐
│ ┌── TITLE BLOCK ───────────────────────┐  │  HERO PLATE (silhouette + photo)    ▐tab│
│ │ WINDSOR CHAIR                        │  │  ┌──────────────────────────────┐   ▐  │
│ │ also: stick chair, bow-back…         │  │  │   [ line-art silhouette ]    │   ▐  │
│ │ era ▕▏1600 ███████████░░ 1940        │  │  │   [ representative photo ]   │   ▐  │
│ └──────────────────────────────────────┘  │  └──────────────────────────────┘   ▐  │
│                                            │                                         │
│  Body: what it is, origin & colonial       │  ── DATE IT (teal) ──────────────       │
│  context, why you'll find it…              │  🔩fastener  🪵wood  🔗joinery …        │
│                                  ┌───────┐ │  each → the date it pins                │
│                                  │▶ 10-SEC│ │                                         │
│                                  │ recog. │ │  ── DON'T CONFUSE WITH ──────           │
│                                  │ + def. │ │  [Windsor] vs [ladderback]  ⊙tell      │
│                                  │ feature│ │                                         │
│                                  └───────┘ │  ⚠ WATCH FOR: replaced legs, married…   │
│  → Wood Atlas p.X · Fastener p.Y           │  💲 VALUE  $—–$—                         │
└────────────────────────────────────────────┴─────────────────────────────────────────┘
```

## 7. Wireframe — a REFERENCE ATLAS plate (Part III, e.g. Fasteners)

```
┌──────────── FASTENER TYPES — and the date each one pins ────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │[wrought] │  │ [cut/sq] │  │  [wire]  │  │[slotted] │  …          │
│  │ nail img │  │ nail img │  │ nail img │  │  screw   │             │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤             │
│  │HAND-     │  │CUT NAIL  │  │WIRE NAIL │  │SLOTTED   │             │
│  │WROUGHT   │  │1790–1890 │  │post-1880 │  │SCREW     │             │
│  │pre-1800  │  │ taper, 2 │  │ round,   │  │pre-1934  │             │
│  │ irregular│  │ sides    │  │ uniform  │  │(no Phillips)           │
│  │ HOW TO   │  │ HOW TO   │  │ HOW TO   │  │ HOW TO   │             │
│  │ TELL …   │  │ TELL …   │  │ TELL …   │  │ TELL …   │             │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘             │
│  These plates are the skill-builders + the future teaching-app modules. │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Open design questions for owner (your domain)
1. **Palette** — does the warm-wood + teal/oxblood direction feel right, or do you want a
   cooler/cleaner or higher-contrast scheme? (Easiest thing to change now, hardest later.)
2. **Trim size** — 6×9 book, or US Letter (more room per page, more "workbook"), or a
   phone-first vertical? Affects every layout.
3. **Illustration style** — line-art silhouettes (clean, cheap, consistent, PD-patent-friendly)
   vs. photographic plates (richer, harder to source PD-clean) — or both, as drawn above?
4. **The "10-second recognition" box** — is that the right hook, or would you lead with something else?
