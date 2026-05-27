# Authoring Gaps — corpus-driven worklist (for you to populate)

These are the **domain-fact** gaps the scan corpus has surfaced. Fill in the blanks
(or strike any row you don't want), hand it back, and I'll insert the values into the
engine and re-run the corpus to confirm.

## RACI
- **You author** everything below: style-family definitions, date ranges, and feature
  date-envelopes. These are appraiser/historical calls only you should make.
- **I wire** them in (`styleFamilies.ts`, `CLUE_LIBRARY`, the dating-layer map, etc.)
  and handle the pure-logic fixes (attribution tiebreaks, generic-token filtering,
  negation-detection window, category→dating-layer mapping, cane→wicker gating). Those
  are **not** in this template — they're mine.
- The **bold suggestions** are my non-expert placeholders so you have a starting point —
  overwrite them freely.

---

## TWO FORMAT RULES (a value that breaks these silently does nothing)

### 1. Date bands — use this exact grammar (the parser reads only these forms)
| you mean | write exactly | parses to |
|---|---|---|
| span | `1870–1895` | 1870–1895 |
| floor only (open-ended) | `post-1950` | 1950 → open |
| ceiling only | `pre-1920` | open → 1920 |
| circa point (±10 yrs) | `c. 1900` | 1890–1910 |
| era band | `late 19th century` / `mid 20th century` | 1870–1900 / 1930–1970 |

**Do NOT write** `1870s–1890s` (parses as **1870–1879 only**) or `20th–21st century`
(parses as **2000–2100**). Use the explicit forms above.

### 2. Dating category — a feature only moves the date if its category is one of:
`joinery · fasteners · toolmarks · finish · hardware · materials (→wood) · upholstery`

`style`, `construction`, `context`, `form` do **NOT** date. If you think a feature
*should* date but the natural category is one of those, just say so in the row and I'll
map it.

---

## Section A — Style families to author
The corpus showed the engine has **no family** for these, so it falls back to an odd
label (e.g. "Spindle Gallery") or mis-attributes. For each: canonical display name,
date range, defining vocabulary (words an observation would use), how it differs from
the nearest family, and whether it's a "revival wave" of an older style.

### A1. Eastlake / Aesthetic Movement
*(corpus: spindle-gallery parlor rocker + parlor settee → both fell back to "Spindle Gallery")*
- Canonical display name: **Eastlake / Aesthetic Movement** → ____________________
- Date range: **`1870–1895`** → ____________
- Defining ornament vocabulary: incised line carving · geometric/angular ornament ·
  spindle galleries · sunburst/fan medallions · ebonized + gilt-incised · ____________
- Distinct from Renaissance Revival how: ____________________
- Distinct from Rococo Revival how: ____________________
- Original period or revival wave? ____________
- *(Engine note: today Eastlake is only reachable via the `eastlake_hardware` clue,
  which self-negates on ornament-only pieces. I'll add ornament-based attribution; you
  define the vocabulary.)*

### A2. Late-Victorian parlor seating
*(the spindle-gallery rocker & settee are generic late-Victorian parlor seating)*
- Do you want a broad **"Victorian Parlor"** family, or should these route to
  Eastlake / Renaissance Revival / Rococo Revival specifically? ____________________
- If a distinct family — name / date / vocabulary: ____________________

### A3. Wicker / rattan traditions
*(corpus: wicker barrel lounge chair → style "Unresolved", date "Broad, not tightly
dated"). These exist as clue keywords with dates in their prose, but there is no STYLE
family and the dates never reach a dating layer. Confirm each as a datable tradition:*

| tradition | date band (your call) | defining vocabulary |
|---|---|---|
| Victorian curlicue wicker | **`1880–1900`** → ____ | heavy scrolls, curlicues, hearts, fans, photo-frame insets |
| Bar Harbor wicker | **`1900–1920`** → ____ | open airy geometric weave, minimal ornament |
| Lloyd loom (paper fiber) | **`post-1917`** → ____ | machine-woven paper fiber over frame |
| Mid-century streamlined wicker | **`1945–1970`** → ____ | simple curves, barrel/peacock forms, often imported |

### A4. Hollywood Regency *(exists as an attribution but loses 0.82 ties — confirm only)*
- Date range: **`1930–1970`** → ____________
- Should it outrank "Louis XVI / French Neoclassical" when cream/gold-painted Rococo
  cues co-occur? **yes** → ____  *(this is mostly a tiebreak-logic fix on my side; I just
  need your date band + this ruling.)*

---

## Section B — Feature date-envelopes (the M13 thread)
Intrinsically-datable construction/material features that currently contribute **nothing**
to the date (wrong category / no envelope). Give the date band + the dating category it
should live in (per the whitelist above).

| feature (clue key) | what it is | date band (your call) | dating category (your call) |
|---|---|---|---|
| `platform_rocker_mechanism` | sprung platform-rocker base, patented era | **`1870–1900`** → ____ | **hardware** → ____ |
| `carved_ornament_machine_assisted` / `machine_carved_ornament` | machine-routed / CNC carving | **`post-1950`** → ____ | **toolmarks** → ____ |
| `reeded_rail_detail` | machine-assisted reeding | **leave undated** → ____ | **toolmarks** → ____ |
| faux-stone laminate / MDF tabletop | decorative laminate/MDF top (bistro table) | **`post-1950`** → ____ | **materials** → ____ |

*(The wicker-era clue dates are covered by A3.)*

---

## Section C — anything else
Free-form: any family, feature, or date band you want added or corrected that the corpus
hasn't surfaced yet.

____________________________________________________________

## Hand-back
Edit this file (or just reply with the values). I'll insert them into `styleFamilies.ts`
/ `CLUE_LIBRARY` / the dating-layer map, then re-run the full corpus to confirm the
target specimens improve and nothing else regresses.
