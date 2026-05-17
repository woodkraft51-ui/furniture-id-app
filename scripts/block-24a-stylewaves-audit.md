# Block 24a: Style Revival Waves Canonical ↔ Docx Audit

Generated against `/tmp/stylewaves-clean.md` (991 lines extracted from
`Styles_and_Waves.docx`, covering 26 numbered styles + a trailing
Cross-Wave Identification Rules meta section at lines 966-992) and
canonical `lib/constraints/styleFamilies.ts` (3333 lines holding
27 `style_family` entries + 111 `style_revival_wave` entries + 6
`style_reasoning_rule` entries + the library-local `DesignSubtlety`
and `StyleFamilyMakerAssociation` interfaces).

## Summary

- Docx style families: **26** (lines 2-965, one numbered section
  each). Docx revival waves: **108** total (one "Revival waves"
  subsection per style; per-style counts 3-6 waves).
- Canonical `style_family` entries: **27**. The +1 is
  `style_family_louis_xvi_french_neoclassical` (line 421), authored
  per "Block 7 canonical authoring — Louis XVI / French Neoclassical
  gap surfaced during Toledo/cylinder-desk verification scan"
  (per-entry notes). Not docx-sourced — docx has no Louis XVI
  section.
- Canonical `style_revival_wave` entries: **111**. The +3 are the
  three Louis XVI waves (Centennial / Academic / Modern French
  Neoclassical Reproduction) under the +1 Louis XVI family.
- Canonical `style_reasoning_rule` entries: **6**. Five canonical
  Cross-Wave Identification principles (docx paragraphs 966-987) +
  one Independent Layer Evaluation Standard encoding rule.

### Match outcomes

- Matched docx wave ↔ canonical `style_revival_wave` pairs:
  **108 / 108** (100% — every docx wave has a canonical parallel).
  Match key: `(DOCX_TO_CANONICAL[style_num], wave_number)`. Per-pair
  date_floor / date_ceiling / name verbatim equality: 107 / 108
  exact (one Memphis Wave 1 dating note discussed below).
- Docx waves with no canonical match: **0**.
- Canonical waves with no docx counterpart (orphans): **3** — all
  3 Louis XVI waves (Block 7 non-docx authoring). Distinct from
  drift: this is intentional non-docx-sourced family scaffolding.
- Docx styles with no canonical family: **0**.
- Canonical families with no docx counterpart: **1** —
  `style_family_louis_xvi_french_neoclassical` (Block 7 non-docx
  family scaffolding for French neoclassical observations like
  ormolu mounts, brass sabots, tapered fluted legs, parquetry that
  had no canonical home before Block 7).

### Per-field gap totals

- Waves with `diagnostic_caution_text`: **0 / 111** (field absent
  from `StyleRevivalWaveEntry` schema; analogous content would
  live in `contrast_summary` + per-subtlety prose).
- Waves with `wear_characteristics`: **0 / 111** (field absent
  from schema; docx supplies no per-wave wear content — waves are
  reference taxonomy, not per-piece evidence).
- Waves with `cousin_contrasts`: **0 / 111** (field absent from
  schema; analogous content lives in `contrast_summary` —
  "Contrast from Wave N: ..." or "Contrast from original: ...").
- Waves with `caution_text` (engine-invisible shared field):
  **0 / 111** (clean — no caution_text drift on waves).
- Style families with `caution_text`: **0 / 27** (clean).
- Style families with `diagnostic_caution_text`: **0 / 27**
  (docx supplies no per-family caution content — would need to be
  added by Mike if desired).
- Waves with `date_ceiling: 2030` sentinel: **0 / 111** (clean).
- Waves with `date_ceiling: null / 9999`: **0 / 111** (clean).
- Waves with `date_ceiling: 2025`: **1 / 111** — the
  Contemporary Transitional Wave 2 (`style_revival_wave_2010s_
  modern_farmhouse_industrial_transitional`, line 3196) carries
  `date_ceiling: 2025`. This is the value noted in
  authoring-conventions.md §6 ("`styleFamilies.ts:3206` uses
  `date_ceiling: 2025` (one-off bug-shaped value; not a
  pattern)"). However, the docx Dates field is "c. 2010–2025"
  verbatim — so this is actually docx-faithful, not a sentinel.
  The bug-shape concern would be that 2025 is now past
  (today is 2026-05-17); the canonical entry could now be safely
  switched to omit the date_ceiling per the "extends-to-present"
  convention if Mike judges the Modern Farmhouse trend ongoing.
- Waves with `date_ceiling` omitted: **23 / 111** — these are the
  open-ended-to-present waves, exactly matching the docx "Pattern 3"
  cluster cited in D-SW42-8 (canonical "Dates: c. YYYY–present").
- Authority distribution: **all 111 waves at 3/3**; all 27 style
  families at 4/4. Per D-SW41-6 interpretive-uncertainty-authority
  convention. No drift.

### Status distribution

GOOD = 108, PARTIAL = 0, MAJOR = 0 for matched pairs. The 3 Louis
XVI orphans are NOT MATCHED to docx by definition (Mike-introduced
non-docx authoring) — they sit outside the docx-fidelity audit.

## Engine integration state

**This is the central architectural finding of the audit, and
contradicts Mike's audit-framing premise that the waves layer is
"outstanding."** The engine IS wired to consume STYLE_REVIVAL_WAVES
today, not deferred to a future integration block.

### Engine call chain (verified)

- `engineStyleEvaluator.ts:25` imports both `STYLE_FAMILIES` and
  `STYLE_REVIVAL_WAVES` from `./constraints/styleFamilies`.
- `attributeStyle(...)` (line 171) iterates `STYLE_FAMILIES`,
  scoring family attribution from `name` + `canonical_source_aliases`
  tokens against observation text + clue keys; returns a ranked
  list of `StyleAttribution` records.
- `aggregateStyleWaves(...)` (line 391) iterates `STYLE_REVIVAL_
  WAVES` indexed by `parent_style_id` (line 350-361 builds the
  `wavesByParent` map). Per Block 2b D-PH3-9 2-of-N rule, the
  function gates wave surfacing on at least 2 of 3 layers:
  (1) style family attribution matches `wave.parent_style_id`;
  (2) dating envelope overlaps `wave.date_floor` / `wave.date_
  ceiling`; (3) ≥1 `design_subtleties[*].signal` token matches
  observation text. Reaches `engine.ts:5119` `p3.style_waves =
  aggregateStyleWaves(...)` and mutates the `p3` digest in place.
- Engine consumability per engine-consumability-spec.md §6 lines
  389-391: StyleRevivalWaveEntry consumed fields = `id`, `name`,
  `parent_style_id`, `wave_number`, `date_floor`, `date_ceiling`,
  `design_subtleties[*].signal`. All 7 are populated on every one
  of the 111 wave entries. Field-coverage is 100%.

### Per-wave layer-3 (design_subtleties signal) integration is operationally weak

Per engineStyleEvaluator.ts:441-447 the layer-3 hit fires when a
≥4-char non-STOP_TOKEN signal token appears in observation text.
The signal strings authored into `design_subtleties` are
appraiser-voice condensations of the docx Traits + Contrast
prose, NOT engine-prompt vocabulary anchors. Examples:

- "often heavier than true 17th-century work" → tokens after stop
  removal: `heavier`, `true`, `work`. Of these, only `heavier`
  carries any disambiguation weight.
- "reads as a 'decorative antique' rather than structural
  furniture" → tokens: `reads`, `decorative`, `antique`,
  `rather`, `structural`, `furniture` (most filtered as STOP_TOKEN
  per engineStyleEvaluator's STOP_TOKEN list).
- "more domestic, affordable, and mass-produced than Wave 1" →
  tokens: `more`, `domestic`, `affordable`, `mass`, `produced`,
  `wave`. None of these are likely to appear in a real visual
  observation about a furniture piece.

This is the **substantive engine-visibility gap** on the waves
layer: the schema is wired but the per-signal authoring is
hand-condensed-prose, not engine-matchable phrase tokens. A piece
with `"cabriole legs"` in the LLM observation will fire layer-3
on any wave whose design_subtleties signal contains `cabriole`
(of which there are ~12 across waves), but a piece described as
`"darker finish with cleaner machine carving"` will likely not
fire layer-3 even on the canonical wave whose contrast prose
literally says "darker" + "cleaner in finish" — because the
canonical signal entry reads as a complete English phrase
("often cleaner in finish than original work") rather than
isolated keyword tokens.

This is Mike's "outstanding" framing properly diagnosed: **the
waves are authored AND engine-wired, but the per-signal
vocabulary is appraiser-prose rather than engine-tokenizer-
friendly**. The actionable next step is a layer-3 signal pass
that converts the 399 signal strings (per the styleFamilies.ts
header comment) into engine-anchored vocabulary (matching the
clue-key vocabulary listed in engine-consumability-spec.md §3) so
the 2-of-N gate fires more often on real observation text.

### Style family integration is wired and signal-quality is strong

`attributeStyle` (engineStyleEvaluator.ts:171-242) consumes
`name` + `canonical_source_aliases` for tokenization-based
matching. The 15-of-27 alias coverage per D-SW41-11 supplies
~50 alias tokens beyond the family names themselves. The
attribution layer is high-signal — the per-family token set
matches well to LLM observation language ("federal", "shaker",
"eastlake", "chippendale", "mission" etc. all hit reliably).

### STYLE_REASONING_RULES is entirely engine-invisible today

Per engine-consumability-spec.md §6 line 382-384: "No engine code
consumes any reasoning-rule entry." Confirmed via grep: no file
in `lib/` outside styleFamilies.ts itself imports
STYLE_REASONING_RULES. All 6 entries declare `migration_target:
"engine_reasoning"` but no migration consumer exists yet.

### Dangling engine reference: `style_family_edwardian`

`engineStyleEvaluator.ts:161` declares
`edwardian_pattern: "style_family_edwardian"` inside the
`STRUCTURAL_PATTERN_FAMILY` map. There is NO `style_family_
edwardian` entry in styleFamilies.ts (verified via grep). When
the `edwardian_pattern` structural pattern fires, the resulting
attribution will be to an id that has no matching family entry,
so `aggregateStyleWaves` will find zero waves for it (the
wavesByParent map has no `style_family_edwardian` key). The docx
also has no Edwardian section — this is a real authoring gap.
Either the family + its revival waves should be authored (Mike's
choice), or the `edwardian_pattern` entry should be remapped to
an existing family (probably `style_family_arts_and_crafts` for
British Arts-and-Crafts Edwardian crossover or
`style_family_colonial_revival` for the broader Edwardian
Colonial Revival).

## Schema extension candidates

### `diagnostic_caution_text` — NOT recommended for either entry

The docx has no per-style or per-wave caution / false-positive
content (contrast: makerMarks docx has "False Positive Warning"
/ "Confidence Rule" / "Special Caution" / "Dating Caution" /
"Dating Clue" sections per maker). The Cross-Wave Identification
Rules meta section (docx paragraphs 966-987) is captured
faithfully into the 5 docx-sourced reasoning rules. No schema
extension is justified by docx content.

### `wear_characteristics` — NOT recommended for either entry

The docx supplies no wear content. Waves are reference taxonomy,
not per-piece evidence. Per-piece wear lives on upholstery /
finish / woodEvidence entries.

### `cousin_contrasts` — NOT recommended; already covered by `contrast_summary`

Each wave's docx "Contrast from..." prose is captured verbatim in
`contrast_summary` (a required field on StyleRevivalWaveEntry).
The contrast IS docx-faithfully authored, just under a different
field name. Adding a parallel `cousin_contrasts` array would
duplicate this content. Recommendation: leave the existing
`contrast_summary` field structure alone.

### Engine-anchored signal vocabulary — RECOMMENDED schema-or-authoring extension

Per the engine-integration analysis above, the actionable layer-3
authoring opportunity is to add a parallel `design_subtleties[
*].engine_match_tokens?: string[]` field (or repurpose
`design_subtleties[*].signal` to be a comma-separated list of
engine-matchable tokens). Without this extension or an
authoring-pass conversion, layer-3 of the 2-of-N gate will
rarely fire on real observations regardless of which wave is
operationally most relevant. **This is the highest-leverage
schema decision for Mike on this library** per the "outstanding"
framing.

### `StyleFamilyEntry.canonical_source_aliases` is well-covered

15 of 27 families carry aliases per D-SW41-11. The 12 families
without aliases are single-canonical-name (e.g., William and
Mary, Queen Anne, Chippendale, Shaker, Gothic Revival,
Renaissance Revival, Art Nouveau, Colonial Revival, Art Deco,
Streamline Moderne, Hollywood Regency) — single-name families
need no alias extraction. No schema gap.

## Pre-existing engine-invisible content / convention drift

### 1. STYLE_REASONING_RULES (6 entries) — engine-invisible

Per engine-consumability-spec.md §6. The docx's Cross-Wave
Identification Rules section (Original period vs. revival; Scale
and visual weight; Surface vs. structure; Wave-to-wave contrast
pattern; Practical appraiser rule) is faithfully captured into
the first 5 STYLE_REASONING_RULES entries. The 6th rule
(`style_reasoning_style_evidence_layer_independence`) encodes the
Independent Layer Evaluation Standard per D-SW41-5, completing
ILE encoding across all 8 Phase 2 evidence libraries. All 6 are
docx-faithful (5) or architecturally-justified (1), but unread by
engine code today. `migration_target: "engine_reasoning"` on all 6.

### 2. StyleFamilyEntry fields entirely engine-invisible

Per engine-consumability-spec.md §6 line 385-387: `name`,
`canonical_source_aliases`, `positive_authority`,
`period_associations[*].date_floor/ceiling`, `id` are consumed.
Everything else (`description`, `indicator_text`, `notes`,
`family_description`, `core_visual_identity`,
`original_emergence_summary`, `original_conclusion_summary`,
`hard_negative_authority`, `assessment_layer`,
`maker_associations`) is engine-invisible. This is by design
(authoring discipline + documentation) but worth noting that the
verbatim docx core_visual_identity prose lives ONLY as
documentation today.

### 3. StyleRevivalWaveEntry traits_summary + contrast_summary engine-invisible

Per engine-consumability-spec.md §6 line 389-391: `traits_summary`
and `contrast_summary` are NOT consumed by `aggregateStyleWaves`.
These two fields carry the docx-verbatim Traits + Contrast prose
on every wave (lock-tight authoring discipline per D-SW42-1
through D-SW42-13). The engine instead reads only the
hand-decomposed `design_subtleties[*].signal` strings. This is
parallel to the upholstery `description` invisibility pattern:
the rich docx prose is documentation, the engine consumes the
distilled signals.

### 4. `period_associations.usage_notes` invisible per shared convention

The `period_label` and `usage_notes` sub-fields on
`PeriodAssociation` entries are pure documentation per
engine-consumability-spec.md §6 line 397. styleFamilies.ts uses
both fields appraisally — e.g.,
`"period_label: 'Original Pilgrim / Seventeenth-Century period'"`
on the Early Colonial family. Invisible to engine.

### 5. Memphis Wave 1 dating note — docx-acknowledged, not drift

Canonical entry `style_revival_wave_original_memphis_radical_
postmodern` (parent: style_family_postmodern, wave_number 1)
declares `date_floor: 1980, date_ceiling: 1995`. Docx Dates
field reads: "c. 1981–1987 for Memphis proper; broader postmodern
c. 1980–1995". The canonical entry notes "D-SW42-11" as the
warrant for picking the broader 1980-1995 envelope. This is an
authoring-judgment call that docx-faithfully selected the wider
of two docx-provided ranges; not drift.

### 6. `date_ceiling: 2025` on Contemporary Transitional Wave 2

Per per-field gap totals section above: this value is docx-
faithful (docx says "c. 2010–2025"), not a sentinel bug. Today
(2026-05-17) the canonical date has now passed, so the wave
range is effectively closed. Mike's choice on whether to (a)
leave as-is (docx-faithful closed range, now historical), (b)
omit the date_ceiling (treat as ongoing), or (c) update both
docx and canonical to a 2030 close. Not actionable from audit
discipline.

### 7. Slash-separated canonical names — D-SW41-11 alias convention

15 of 27 families carry slash-separated names ("Early Colonial /
Pilgrim / Seventeenth-Century American", "Federal / Adam /
Hepplewhite / Sheraton", etc.). Per D-SW41-11 the alternate
names are split into `canonical_source_aliases`. Coverage is
complete per CC A-4 canonical inspection. No drift.

### 8. Cross-family alias token overlap acknowledged in notes

Per notes on style_family_tudor_revival (line 656) and
style_family_spanish_colonial_revival (line 675): alias-token
overlap with style #2 'Jacobean' / style #15 'Mission' is
explicitly addressed as "name-matching resolution uses
exact-full-token equality." Tudor "Jacobean Revival" is a
distinct full token from Jacobean style #2's "Jacobean", and
Spanish "Mission Revival" is distinct from Arts and Crafts
style #15's "Mission". The tokenization in
engineStyleEvaluator.ts:65-71 splits on hyphen/slash and emits
each ≥3-char piece as a separate token, which means "Mission
Revival" tokenizes to ["mission"] (since "revival" is in
STOP_TOKENS per engineStyleEvaluator's stop list). The full-
token-equality discipline cited in the notes may not be
operationally enforced by the current tokenize-then-overlap
matcher — Mike should validate whether the cited discipline
matches engine behavior.

## Missing canonical entries (docx has, canonical lacks)

**None.** All 108 docx waves have corresponding canonical entries
in `STYLE_REVIVAL_WAVES`. All 26 docx styles have corresponding
canonical entries in `STYLE_FAMILIES`. Per-style mapping below.

| Docx style # | Docx name | Canonical family id |
|---|---|---|
| 1 | Early Colonial / Pilgrim / Seventeenth-Century American | style_family_early_colonial |
| 2 | Jacobean / Carolean-Derived Colonial | style_family_jacobean |
| 3 | William and Mary | style_family_william_and_mary |
| 4 | Queen Anne | style_family_queen_anne |
| 5 | Chippendale | style_family_chippendale |
| 6 | Pennsylvania German / Pennsylvania Dutch / American Folk Baroque | style_family_pennsylvania_german |
| 7 | Federal / Adam / Hepplewhite / Sheraton | style_family_federal |
| 8 | American Classical / American Empire / Greco-Roman | style_family_american_classical |
| 9 | Shaker | style_family_shaker |
| 10 | Gothic Revival | style_family_gothic_revival |
| 11 | Rococo Revival / Naturalistic Victorian | style_family_rococo_revival |
| 12 | Renaissance Revival | style_family_renaissance_revival |
| 13 | Eastlake / Modern Gothic | style_family_eastlake |
| 14 | Aesthetic Movement / Japanesque | style_family_aesthetic_movement |
| 15 | Arts and Crafts / Mission / Craftsman | style_family_arts_and_crafts |
| 16 | Art Nouveau | style_family_art_nouveau |
| 17 | Colonial Revival | style_family_colonial_revival |
| 18 | Tudor Revival / Jacobean Revival / Elizabethan Revival | style_family_tudor_revival |
| 19 | Spanish Colonial Revival / Mission Revival / Mediterranean Revival | style_family_spanish_colonial_revival |
| 20 | Art Deco | style_family_art_deco |
| 21 | Streamline Moderne | style_family_streamline_moderne |
| 22 | Mid-Century Modern / American Modernism | style_family_mid_century_modern |
| 23 | Hollywood Regency | style_family_hollywood_regency |
| 24 | Rustic / Adirondack / Lodge / Western / Ranch | style_family_rustic |
| 25 | Postmodern / Memphis / Radical Design Influence | style_family_postmodern |
| 26 | Contemporary Transitional / New Traditional / Eclectic Historicism | style_family_contemporary_transitional |

Per-wave count match per docx style:

| Docx style | Docx waves | Canon waves | Match |
|---|---|---|---|
| #1 Early Colonial | 4 | 4 | full |
| #2 Jacobean | 4 | 4 | full |
| #3 William and Mary | 3 | 3 | full |
| #4 Queen Anne | 4 | 4 | full |
| #5 Chippendale | 4 | 4 | full |
| #6 Pennsylvania German | 4 | 4 | full |
| #7 Federal | 5 | 5 | full |
| #8 American Classical | 4 | 4 | full |
| #9 Shaker | 4 | 4 | full |
| #10 Gothic Revival | 4 | 4 | full |
| #11 Rococo Revival | 5 | 5 | full |
| #12 Renaissance Revival | 4 | 4 | full |
| #13 Eastlake | 3 | 3 | full |
| #14 Aesthetic Movement | 4 | 4 | full |
| #15 Arts and Crafts | 5 | 5 | full |
| #16 Art Nouveau | 4 | 4 | full |
| #17 Colonial Revival | 6 | 6 | full |
| #18 Tudor Revival | 5 | 5 | full |
| #19 Spanish Colonial Revival | 5 | 5 | full |
| #20 Art Deco | 5 | 5 | full |
| #21 Streamline Moderne | 3 | 3 | full |
| #22 Mid-Century Modern | 5 | 5 | full |
| #23 Hollywood Regency | 3 | 3 | full |
| #24 Rustic | 5 | 5 | full |
| #25 Postmodern | 3 | 3 | full |
| #26 Contemporary Transitional | 3 | 3 | full |

Docx total: 108 waves. Canon-matched: 108. 100% coverage.

## Orphan canonical entries (canonical has, docx lacks)

### Family orphans: 1

| Canonical id (line) | Family name | Reason |
|---|---|---|
| `style_family_louis_xvi_french_neoclassical` (421) | Louis XVI / French Neoclassical | Block 7 non-docx authoring — "gap surfaced during Toledo/cylinder-desk verification scan. The LLM identifies pieces with French neoclassical vocabulary (ormolu mounts, brass sabots, tapered fluted legs, parquetry) but no canonical family existed to attribute to; engine fell back to mcm_structural_pattern." Per notes line 426. This is a legitimate non-docx scaffolding entry filling an engine-attribution coverage gap. Docx does NOT cover Louis XVI; this is independent of docx scope. |

### Wave orphans: 3 (all Louis XVI)

| Canonical id (line) | Wave name | Parent | Reason |
|---|---|---|---|
| `style_revival_wave_centennial_french_louis_xvi_revival` (1482) | Centennial French Louis XVI Revival | style_family_louis_xvi_french_neoclassical | Block 7 non-docx authoring; Louis XVI wave under the Block 7 non-docx family. |
| `style_revival_wave_academic_french_louis_xvi_revival` (1506) | Academic French Louis XVI Revival | style_family_louis_xvi_french_neoclassical | Same |
| `style_revival_wave_modern_louis_xvi_reproduction` (1530) | Modern Louis XVI / French Neoclassical Reproduction | style_family_louis_xvi_french_neoclassical | Same |

**Mike's decision required**: should the Louis XVI family +
waves be documented as a separate non-docx authoring stream
(parallel to the makerMarks legacy-orphan disposition), or should
the docx itself be source-extended with a Louis XVI section
(Mike's #27 style)? Today these 4 entries (1 family + 3 waves)
sit as docx-orphan but engine-justified — they fill a real
LLM-attribution coverage gap that pre-existed Block 41/42.

## Style family observations (note only — not gap candidates)

Per Mike's audit framing, style families were authored piecemeal
across multiple revisions with no single clean docx source. The
docx provides ONE "Core visual identity" sentence per style; the
canonical schema declares `family_description` (defensible-default
summary) + `core_visual_identity` (docx verbatim) + `notes` +
`indicator_text` as separate fields. Observations follow.

### 1. `core_visual_identity` is docx-verbatim on all 26 docx-sourced families

Spot-checked Early Colonial, Federal, Mid-Century Modern, Gothic
Revival, Eastlake — all `core_visual_identity` fields hold the
docx "Core visual identity" sentence verbatim, including the
trailing reference clauses (e.g., "The Met notes that William
and Mary fell out of fashion in America by the 1720s..." on
William and Mary).

### 2. `family_description` is defensible-default fill (not docx)

Per each entry's notes: "family_description is defensible-default
fill per the DESCRIPTION discipline (canonical source has no
discrete description field)." The single-sentence summaries
("The earliest American furniture style — heavy joined oak
construction of the 17th century, low in visual refinement and
built for utility.") are appraiser-voice author-supplied. This
matches authoring-conventions.md established practice.

### 3. `original_emergence_summary` + `original_conclusion_summary` are docx-verbatim

Spot-checked Early Colonial ("Original emergence: c. 1620" /
"Original conclusion: c. 1700, with rural survival later") and
Federal ("Original emergence: c. 1780" / "Original conclusion:
c. 1825, with overlap into the 1830s"). All sentences match
docx verbatim.

### 4. `period_associations` multi-entry on 10 of 27 families

The 10 multi-entry families capture the docx "with rural
survival later" / "with overlap into the 1770s" / "with later
folk survivals" / "with overlap into Streamline Moderne" etc.
secondary windows as a second PeriodAssociation. The other 17
families have single-entry period_associations (clean closed
range or open-ended). Consistent with A-5 authoring discipline.

### 5. `style_family_louis_xvi_french_neoclassical` has an exceptionally rich `canonical_source_aliases` list

20 aliases vs the median 2-3 for the docx-sourced families. This
reflects the alias's role as the engine-side anchor for LLM-
observed French neoclassical vocabulary (line 437-458 enumerates
"Louis XVI", "Bureau à Cylindre", "French gilt bronze mounted",
"parquetry French desk", etc.). Not drift; Block 7 productive
authoring beyond what docx-sourced families needed.

### 6. `notes` field consistently carries per-entry authoring provenance

Every family carries notes like "Per Styles_and_Waves.docx style
#N. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11."
Including the source-block ID + the authoring-convention
references makes provenance fully traceable. Strong discipline.

### 7. `assessment_layer: "style_and_waves"` uniform on every entry

27 / 27 families + 111 / 111 waves declare `assessment_layer:
"style_and_waves"`. New assessment_layer opened by this library
per D-SW41-4. Not consumed by engine today but flags the entries
as a distinct evidence stream for future routing.

## Per-entry gaps (for matched waves)

Status distribution: GOOD = 108 / 108 matched waves. Per-entry
review confirms:

- All 108 matched waves carry docx-verbatim `traits_summary`
  (the docx "Traits:" prose).
- All 108 matched waves carry docx-verbatim `contrast_summary`
  (the docx "Contrast from..." prose, prefixed with the docx
  contrast-target label, e.g., "Contrast from Wave 2: ..." or
  "Contrast from original: ...").
- All 108 matched waves carry docx-faithful `date_floor` +
  optional `date_ceiling` (omitted on 22 "present"-ending dates;
  numeric on the other 86). Date parsing matches the docx en-dash
  range format on every entry verified.
- All 108 matched waves carry decomposed `design_subtleties`
  arrays (3-7 signals per wave, ~399 signals total per the
  library header comment) covering 3-6 of the 9 locked
  DesignSubtlety aspects.
- All 108 matched waves resolve `parent_style_id` to a present
  STYLE_FAMILIES entry (zero FK breakage on the docx-matched
  set; FK integrity verified end-to-end).

The single non-content-matching observation is Memphis Wave 1
(docx Dates: "c. 1981–1987 for Memphis proper; broader postmodern
c. 1980–1995"; canonical `date_floor: 1980, date_ceiling: 1995`).
Per D-SW42-11 the canonical authoring picked the broader range as
the engine's matching window. Defensible authoring judgment;
documented in entry notes; not drift.

## Concluding observations

1. **The waves layer is docx-faithful AND engine-wired today**.
   Per the engine integration analysis, `aggregateStyleWaves` runs
   on every analyze pass at `engine.ts:5119` and mutates `p3.
   style_waves` with the 2-of-N-gated wave attributions. The
   "outstanding" framing in Mike's audit prompt is not about
   engine-wiring (already done) but about per-signal-vocabulary
   quality — the layer-3 `design_subtleties[*].signal` tokens
   are authored as appraiser-prose condensations, not as
   engine-matchable observation-vocabulary tokens. **This is the
   highest-leverage actionable authoring gap on this library.**

2. **Per-content audit is clean**: 108 / 108 docx waves matched,
   100% FK integrity, all date_floor / date_ceiling / name /
   traits / contrast docx-faithful, zero `date_ceiling: 2030`
   sentinels, zero `caution_text` drift. The library is
   materially the most docx-aligned of the 8 audited so far.

3. **Schema extension recommendation**: add
   `design_subtleties[*].engine_match_tokens?: string[]` (or
   convert `signal` strings to comma-separated token lists) to
   surface engine-tokenizer-friendly vocabulary alongside the
   appraiser-prose signal. Without this, layer-3 of the 2-of-N
   gate stays low-fire-rate regardless of how well the wave
   matches a piece. `diagnostic_caution_text`,
   `wear_characteristics`, `cousin_contrasts` extensions are NOT
   recommended for this library (no docx content; analogue
   coverage already in `contrast_summary`).

4. **Engine map cleanup**: `engineStyleEvaluator.ts:161` declares
   `edwardian_pattern: "style_family_edwardian"` but
   `style_family_edwardian` does not exist. Either author the
   missing family (+ its revival waves per docx-faithful
   discipline if Mike can extend the docx with an Edwardian
   section) or remap to an existing family (likely
   `style_family_arts_and_crafts` or
   `style_family_colonial_revival`).

5. **Louis XVI orphan disposition**: 1 family + 3 waves are
   canonical-only (Block 7 non-docx scaffolding for LLM-observed
   French neoclassical vocabulary). Parallel to the
   makerMarks.ts legacy-shim-orphan disposition decision. Mike's
   choice: (a) leave as-is documented as docx-orphan but engine-
   justified; (b) source-extend the docx with a Louis XVI
   section + re-author with docx provenance; or (c) merge into
   an existing docx-sourced family (no obvious target).

6. **STYLE_REASONING_RULES engine-invisibility**: same pattern
   as every other reasoning-rule library. The 5 docx-sourced
   Cross-Wave Identification rules + the 1 ILE encoding rule
   are pure documentation today. The
   `migration_target: "engine_reasoning"` on each rule is
   aspirational pending a future engine-reasoning consumer.
