# Style Observations Backlog

This file captures form-specific style observations that were stripped from form entries during architectural correction (form-vs-style separation). Each entry below documents observable, datable style features that should be migrated to `HISTORICAL_CLUE_LIBRARY` in a future session, with appropriate date ranges and confidence weights.

The architectural rationale: forms.ts stays period-agnostic. Style attribution emerges from feature observation at the style-family-detection layer. Form-specific style features therefore belong in the historical clue library where they can be tied to dating logic, not on form entries where they would couple form data to style data inappropriately.

## Migration target

`lib/constraints/historicalClueLibrary.ts` (or successor canonical clue library file once that work is scheduled).

---

## form_washstand observations

Stripped from washstand regional_period_notes during 2026-05-03 architectural correction. Each observation below describes a feature pattern that distinguishes washstands of a given style/period; needs feature-level migration to HCL with date ranges and confidence weights.

### Late Federal / Early Classical washstand features (c. 1820–1835)
- Light, table-like construction
- Open lower shelf or very simple cabinet
- Minimal drawer presence (typically 1 shallow drawer)
- Basin sits on flat top; basin recess uncommon
- Tapered or turned legs (sometimes reeded)
- Light proportions overall
- Occasional string inlay or veneer banding
- Delicate backsplash or no backsplash

### Empire washstand features (c. 1830–1850)
- Heavier case construction
- Enclosed cabinet bases
- Marble tops common
- Strong integrated backsplash or rear gallery
- Column supports (full or engaged)
- Scrolled feet or block feet
- Flame mahogany veneers
- Bold massing with horizontal emphasis
- Subtype: pillar-and-scroll washstand
- Subtype: fully enclosed cabinet washstand
- Subtype: marble-top splash-back washstand

### Mid-century utility washstand features (c. 1840–1865)
- Simplified versions of Empire forms
- Rectangular cabinet with minimal ornament
- Flat tops (sometimes marble, sometimes wood)
- Basic backsplash or no backsplash
- One drawer over one or two doors common
- Very little decoration overall
- Regional/vernacular production
- Mixed woods (pine, poplar, walnut)

### Rococo Revival / Victorian Ornate washstand features (c. 1850–1870)
- Fully enclosed cabinet forms
- Marble tops common
- Integrated backsplash slabs or shaped splash rails
- Complex drawer + cabinet combinations
- Serpentine fronts
- Carved cabriole legs or applied carvings
- Heavy ornamentation (scrollwork, floral carving)
- Applied moldings and deep profiles

### Eastlake / Aesthetic Movement washstand features (c. 1870–1890)
- Rectilinear, angular construction
- Strong emphasis on flat planes and geometric structure
- Marble tops common
- Backsplash often squared, paneled, or incised
- Incised linear carving (not deep carving)
- Geometric ornament
- Turned spindles or small galleries
- Ebonized accents or contrasting finishes

### Late Victorian commode-style washstand features (c. 1880–1900)
- Fully enclosed compact cabinet forms
- Resemblance to a commode or small cupboard
- Hidden storage prominent
- Marble tops standard in higher-end examples
- Reduced or cleanly integrated backsplash
- Simpler than earlier Victorian pieces
- Early Colonial Revival influence emerging
- Panel doors with restrained ornament

### Early Colonial Revival washstand features (c. 1890–1900 overlap)
- Lighter proportions returning
- Often legged rather than fully enclosed
- Simplified basin top with modest backsplash
- Revival of earlier forms (Federal, Sheraton influence)
- Cleaner lines, less carving
- Turned legs or simple aprons

### Cross-cutting washstand observations
- Bedroom-private functional furniture shows ~10 year style lag from urban trends
- Rural production lags urban styles 20-30 years
- Painted finishes more common in rural and cottage contexts
- Marble tops can be added or replaced later — not reliable as original-construction evidence

---

## Block 21 partial-population gap: composite_veneer_cores characteristic_expressions on three CUT_GRAIN_PHENOMENA

Three CUT_GRAIN_PHENOMENA entries reference `engineered_substrate_composite_veneer_cores` in `applicable_substrates` arrays but lack populated `characteristic_expression` strings for that specific substrate FK:

- `cut_grain_phenomenon_plain_sliced_veneer`
- `cut_grain_phenomenon_bookmatching`
- `cut_grain_phenomenon_slip_matching`

A fourth entry (`cut_grain_phenomenon_rotary_cut_veneer`) has the slot populated: "Rotary-cut veneer faces over composite cores in postwar factory cabinetry."

Block 21 gap-survey (Block 23b foundation discovery + prior-session consultation) confirmed File A and File B do not surface specific content for how plain-sliced/bookmatching/slip-matching manifest on composite cores vs other substrate contexts. Appraiser-source content unavailable as of Block 23b.

Resolution: backlog. Resurvey at Block 26 (WoodEvidenceReasoningRules authoring) if Mike's appraiser practice surfaces content; otherwise leave slots empty as canonical-source-honest absence. Do NOT fill from general furniture knowledge per canonical-source-authority + appraiser-honest-calibration discipline.

Cross-references:
- Block 21 D-CG21-5 (CUT_GRAIN_PHENOMENA decomposition + applicable_substrates routing)
- Block 23a D-WE23a-5 (skip-no-entry precedent for absence-as-information)
- Block 23b D-WE23b-7 (this resolution) — see AUDIT_LOG.md
- Block 26 routing for WoodEvidenceReasoningRule capture

---
