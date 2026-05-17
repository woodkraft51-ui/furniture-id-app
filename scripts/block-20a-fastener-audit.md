# Block 20a: Fastener Canonical ↔ Docx Audit

Generated against `/tmp/fastener-docx-clean.md` (extracted from
`Fastener_Reference.docx`; 543 lines: 6 top-level categories + 9
subcategories + 25 specific FASTENER TYPE entries + the
FASTENER DATING QUICK-REFERENCE GRID meta block) and canonical
`lib/constraints/fasteners.ts` (6 `fastener_category` + 9
`fastener_subcategory` + 25 `fastener_type` + 5
`fastener_reasoning_rule` entries — reasoning rules skipped as
meta content, not per-entry data).

## Summary

- Docx entries: 40 (6 categories + 9 subcategories + 25 specific types)
- Canonical entries audited: 40 (6 `fastener_category` + 9
  `fastener_subcategory` + 25 `fastener_type`; 5
  `fastener_reasoning_rule` entries are meta and out of scope).
  - Note: the Block 20a prompt expected 26 types + 10 subcategories +
    7 categories. Actual file counts are 25 + 9 + 6. The discrepancy is
    not a coverage gap — every docx entity has a canonical home and
    there are zero orphan canonical entries on the fastener side. The
    prompt's 26/10/7 figure appears to be off by one in each bucket
    (same pattern as Block 19a's 16/45 vs 15/44 joinery discrepancy).
- Matched pairs (category↔category + subcategory↔subcategory + type↔type):
  40 of 40 docx entries (100% coverage; 6 + 9 + 25).
- Docx entries with NO canonical match: 0
- Canonical entries with NO docx match (orphan canonical entries): 0
- Overlap with `upholsteryConstruction.ts` (resolution decision required):
  3 entries (`fastener_subcategory_upholstery_tacks`,
  `fastener_subcategory_machine_staples`,
  `fastener_type_decorative_brass_tack`); plus one near-overlap
  (`fastener_type_upholstery_staple` ↔
  `upholstery_construction_type_staples`) where the engine maps the
  upholstery clue to the upholstery-side id but the fastener-side type
  carries divergent canonical content. See dedicated section below.
- Type entries missing `wear_characteristics` (schema field absent):
  25/25 (entire library — schema does not yet declare the field on
  `FastenerTypeEntry`).
- Type entries missing `cousin_contrasts` (schema field absent):
  25/25 (same — schema gap).
- Type entries missing `diagnostic_caution_text` (schema field absent
  on `FastenerTypeEntry`; engine consumes only this name, not
  `caution_text`): 25/25.
- Entries with `caution_text` populated (engine-invisible drift): **0**.
  The fastener library is clean of the joinery-style
  `caution_text`-vs-`diagnostic_caution_text` mismatch flagged in
  Block 19a. No remediation pass needed for this drift class.
- Entries with `date_ceiling: 2030` legacy sentinel: **0**. The
  fastener library does not carry the Block 0.5c-style 2030 sentinel;
  open-ended periods correctly use `date_floor` only.
- Entries with "Arts & Crafts" ampersand spelling: **0**. Style label
  is not used inside the fastener library (no period labels reference
  Arts and Crafts). No ampersand-vs-spelled-out drift here.
- Type entries with dating drift between docx and canonical: 0.
  Every canonical type entry's primary period matches the docx DATE
  RANGE; multi-period decomposition (e.g., wire nails 1880-1894
  introduction + 1895+ dominance) is faithfully captured.

Status distribution for the 25 docx-matched type entries:
GOOD = 25, PARTIAL = 0, MAJOR = 0 with respect to the docx content.

(All 25 type entries faithfully capture every field the docx
provides: `description`, `unique_traits`, `identifying_characteristics`,
`period_associations`, `date_range_summary`. The docx fastener
sections have no per-type "Wear Indicators" or "Cousin Contrasts"
subsections, so the Block 17 schema-extension gap is not blocked
by missing docx content — those fields would need authoring
discipline rather than docx-extraction. Status counts here are
docx-content-only; the parallel schema-gap caveat from Block 19a
applies but does not downgrade entries to PARTIAL because the
docx itself does not surface the content.)

## ★ OVERLAP WITH upholsteryConstruction.ts (RESOLUTION DECISION REQUIRED) ★

The fastener library carries 3 canonical entries that have direct
parallels in `lib/constraints/upholsteryConstruction.ts`, plus one
near-overlap fastener TYPE that's outside the engine's current
`CLUE_TO_CANONICAL` reach. Each pair carries divergent canonical
content authored from different source documents
(`Fastener_Reference.docx` vs `American_Furniture_Textile_Reference.docx`).
Per the fastener library's `D-FA33-5 dual-assessment architecture`,
the fastener-side subcategories declare `assessment_layer: "upholstery"`
intending the engine to route them to the upholstery layer. The engine
DOES NOT honor this declaration today — `engineCategoryFor`
(`lib/engineClueResolver.ts:37-51`) routes purely by `category` prefix,
so any `fastener_*` id always routes to the `"fasteners"` layer
regardless of the `assessment_layer` field.

The current `CLUE_TO_CANONICAL` mapping
(`lib/engineCanonicalMap.ts:45-103`) sidesteps the routing
contradiction by mapping the upholstery-flavored engine clues to the
**upholstery-side** canonical ids, leaving the fastener-side
parallel entries unreached by any engine clue today.

### Overlap pair 1: Hand tacks / Upholstery tacks subcategory

| Aspect | Fastener side | Upholstery side |
|---|---|---|
| Canonical id | `fastener_subcategory_upholstery_tacks` (fasteners.ts:625) | `upholstery_construction_type_hand_tacks` (upholsteryConstruction.ts:1565) |
| Docx source | `Fastener_Reference.docx` SUBCATEGORY 3A: UPHOLSTERY TACKS (lines 362-370) | `American_Furniture_Textile_Reference.docx` construction § Hand Tacks (per upholstery notes) |
| Engine clue mapping | none directly (subcategory not in `CLUE_TO_CANONICAL`); the `hand_tacks` clue maps to the upholstery side | `hand_tacks` → `upholstery_construction_type_hand_tacks` (engineCanonicalMap.ts:103) |
| Engine routing today | unreached (not mapped) | routes to `"upholstery"` layer ✓ |
| `assessment_layer` declared | `"upholstery"` (fasteners.ts:649) | n/a (upholstery library entries route via prefix) |
| Engine honors `assessment_layer`? | NO — `engineCategoryFor` would route `fastener_*` to `"fasteners"` regardless | n/a |
| `identifying_characteristics` drift | "Individual hammered placement / Domed heads common / Brass decorative examples frequent" (3 items, docx-verbatim) | "Irregular spacing, oxidized heads / Multiple tack-hole generations / Hand placement" (3 items, upholstery-docx-verbatim) — DIFFERENT VOCABULARY; the upholstery side emphasizes wear and reupholstery evidence (oxidation, multi-generation holes); the fastener side emphasizes manufacture (placement, head shape, material) |
| `date_floor`/`date_ceiling` drift | period[0] `{1700, open}`; date_range_summary `"c. 1700–present."` | period[0] `{1600, 1920}`; period[1] `{1920, open}`; date_range_summary `"1600s to early 20th century…"` — **100-year floor divergence (1600 vs 1700)** and the upholstery side has a CLOSED first period for engine `dateHintFor` tightest-span selection |
| `replacement_likelihood` drift | not populated on fastener subcategory | `"medium"` |
| `period_associations` shape | single open-ended period | two periods: closed diagnostic + open continuation — matches the Block 15 upholstery convention; the fastener-side single open-ended period would parse as `"post-1700"` rather than a tighter window |

**Resolution implication:** The upholstery side is the active engine
consumer; it correctly follows Block 15 period conventions and is
mapped via `hand_tacks`. The fastener-side subcategory is
canonical-source-faithful to `Fastener_Reference.docx` but
unreached by the engine. The `assessment_layer: "upholstery"`
declaration is a stated intent that the engine cannot honor
without modifying `engineCategoryFor` to consult
`assessment_layer` ahead of category-prefix routing. Three
remediation paths:

1. Author the upholstery-side entry as the canonical home and
   demote the fastener-side entry to a documentation-only
   cross-reference (delete the fastener-side identifying
   characteristics/period_associations; keep the id as a stub for FK
   targeting from related_fastener_types arrays).
2. Modify `engineCategoryFor` to honor `assessment_layer` first,
   then change `CLUE_TO_CANONICAL.hand_tacks` to point to the
   fastener-side id. This would route through the fastener-side
   entry but lose the closed-diagnostic-period and
   `replacement_likelihood` content currently on the upholstery side.
3. Keep BOTH entries as authored (current state); document the
   intentional divergence per per-source-document fidelity precedent
   (the same precedent already invoked for D-FA34-11 / D-HW36-16 AG
   floor divergences). Mike's preferred path per existing D-UC40-5
   precedent appears to be #3.

### Overlap pair 2: Machine staples / Upholstery staples subcategory

| Aspect | Fastener side | Upholstery side |
|---|---|---|
| Canonical id | `fastener_subcategory_machine_staples` (fasteners.ts:652) | `upholstery_construction_type_staples` (upholsteryConstruction.ts:1633) |
| Docx source | `Fastener_Reference.docx` SUBCATEGORY 3B: MACHINE STAPLES (lines 379-389) | `American_Furniture_Textile_Reference.docx` construction § Staples |
| Engine clue mapping | `staple_fastener` → `fastener_subcategory_machine_staples` (engineCanonicalMap.ts:49) | `upholstery_staple_construction` → `upholstery_construction_type_staples` (engineCanonicalMap.ts:102) |
| Engine routing today | routes to `"fasteners"` layer (per `engineCategoryFor` prefix-match) despite declared `assessment_layer: "upholstery"` | routes to `"upholstery"` layer ✓ |
| `assessment_layer` declared | `"upholstery"` (fasteners.ts:683) | n/a |
| Engine honors `assessment_layer`? | **NO** — `staple_fastener` evidence surfaces in the FASTENERS layer of dating-overlap output even though the canonical entry intends upholstery |
| `identifying_characteristics` drift | "Uniform spacing / Paired penetration holes / Strong modern upholstery indicator" | "U-shaped metal staples / Regular spacing, pneumatic patterns / Staples usually date the upholstery campaign…" — overlap on "uniform/regular spacing" but the upholstery side carries explicit campaign-vs-frame interpretation prose |
| `date_floor` drift | period[0] `{1890, 1949}` + period[1] `{1950, open}`; date_range_summary `"c. 1890–present. Dominant after c. 1950."` | period[0] `{1900, open}`; date_range_summary `"Mostly 20th century to present in upholstery."` — **10-year floor divergence (1890 vs 1900)** documented as canonical-source divergence in upholstery-side notes (D-UC40-5) |
| `replacement_likelihood` | `"high"` | `"high"` ✓ AGREES |
| `original_persistence` | `"low"` | not populated |
| `anti_classification_guidance` | not on subcategory | present at 1900 boundary on upholstery side |

**Resolution implication:** BOTH entries route to engine layers
independently via different clue keys (`staple_fastener` → fasteners
layer; `upholstery_staple_construction` → upholstery layer). This is
the most live overlap concern because both ARE consumed, and they
produce evidence at two layers from the same physical phenomenon.
The `assessment_layer: "upholstery"` declaration on the fastener
side is silently inoperative today — `staple_fastener` evidence
will count toward FRAME dating in dating-overlap output despite
the canonical intent. Resolution choices parallel pair 1 but with
higher engine-impact because of dual-layer surfacing risk.

### Overlap pair 3: Decorative brass tack / Nailhead trim

| Aspect | Fastener side | Upholstery side |
|---|---|---|
| Canonical id | `fastener_type_decorative_brass_tack` (fasteners.ts:1233) | `upholstery_construction_type_decorative_brass_nails_nailhead_trim` (upholsteryConstruction.ts:1601) |
| Docx source | `Fastener_Reference.docx` § DECORATIVE BRASS TACK (lines 371-378) | `American_Furniture_Textile_Reference.docx` construction § Decorative Brass Nails / Nailhead Trim |
| Engine clue mapping | none directly (TYPE not in `CLUE_TO_CANONICAL` primary map; appears in `CLUE_TO_ALTERNATIVES` for `staple_fastener` per engineCanonicalMap.ts:287) | `nailhead_trim` → `upholstery_construction_type_decorative_brass_nails_nailhead_trim` (engineCanonicalMap.ts:104) |
| Engine routing today | unreached as primary canonical (only alternative-mapping reference) | routes to `"upholstery"` layer ✓ |
| `assessment_layer` declared | inherited "upholstery" from parent subcategory 3A (per indicator_text/notes prose; no field on `FastenerTypeEntry` since the schema doesn't expose it at type tier) | n/a |
| Engine honors `assessment_layer`? | n/a — type entry, schema does not even declare the field on `FastenerTypeEntry` |
| `identifying_characteristics` drift | "Brass domed head / Visible rhythmic spacing" (2 items, sparse, docx-verbatim) | "Brass or brass-colored nailheads along edges / Earlier nailheads may show hand irregularity and tarnish / Modern strips often have every fifth nail real and the rest imitation" (3 items, richer content from upholstery docx including the modern-strip warning) |
| `date_floor` drift | period[0] `{1800, open}`; date_range_summary `"c. 1800–present."` | period[0] `{1600, open}`; date_range_summary `"1600s to present."` — **200-year floor divergence (1800 vs 1600)** |
| `replacement_likelihood` | `"medium"` | `"medium"` ✓ AGREES |
| `name` divergence | "Decorative Brass Tack" | "Decorative Brass Nails / Nailhead Trim" |

**Resolution implication:** Same as pair 1 — the upholstery side
is the active engine consumer via `nailhead_trim`; the fastener
side is unreached as a primary canonical. The 200-year floor
divergence is the largest in any overlap pair and would produce
materially different dating hints if both surfaced. Worth confirming
which docx range is intended: `Fastener_Reference.docx` line 372
says "c. 1800-present" verbatim, while
`American_Furniture_Textile_Reference.docx` (per upholstery-side
notes) anchors at 1600. The divergence is per-source-document
fidelity.

### Near-overlap pair: Upholstery staple TYPE / Staples construction

| Aspect | Fastener-type side | Upholstery side |
|---|---|---|
| Canonical id | `fastener_type_upholstery_staple` (fasteners.ts:1263) | `upholstery_construction_type_staples` (same as overlap pair 2) |
| Engine clue mapping | unreached (TYPE not in `CLUE_TO_CANONICAL`; only the subcategory `staple_fastener` is mapped) | `upholstery_staple_construction` → upholstery side |
| `date_floor` | period[0] `{1930, 1949}` + period[1] `{1950, open}`; date_range_summary `"c. 1930–present. Very common after 1950."` | `{1900, open}` |
| `anti_classification_guidance.boundary_date` | 1930 (per fastener docx) | 1900 (per upholstery docx) |
| `related_joinery_types` cross-FK | `["joinery_type_stapled_drawer_joinery"]` | `["joinery_type_stapled_drawer_joinery"]` ✓ AGREES |

**Resolution implication:** Documented and acknowledged in BOTH
entries' notes prose as a per-source-document AG floor divergence
under the D-FA34-11 / D-HW36-16 / D-UC40-5 cross-library AG floor
divergence precedent. The fastener-type-level entry is unreached
by the engine today (no clue mapping), so the divergence is
documentation-only and Mike's existing precedent appears settled
("each library encodes its own canonical-source floor; the
divergence is per-source-document fidelity, not an error").

### Overlap section summary

- 3 active overlap pairs + 1 documented near-overlap.
- Engine routing is currently **safe-but-not-symmetric**: 2 of 3
  overlap pairs route only the upholstery-side via dedicated clue
  keys; only `staple_fastener` reaches the fastener-side subcategory,
  silently bypassing the declared `assessment_layer: "upholstery"`
  intent and counting staple evidence at the FRAME layer.
- The single live engine-routing issue requiring Mike's resolution:
  **`staple_fastener` → `fastener_subcategory_machine_staples` routes
  to the FASTENERS layer despite the entry's
  `assessment_layer: "upholstery"`.** Either modify
  `engineCategoryFor` to consult `assessment_layer` first, or
  remap `staple_fastener` to `NO_MATCH` / to the upholstery-side id
  (preferred per pair 2 above), or keep current behavior and remove
  the misleading `assessment_layer` declaration.
- For all other content drift (date_floor divergences, identifying
  characteristics differences, name differences), the per-source
  document fidelity precedent (D-UC40-5) already documents the
  intentional acceptance of divergence.

## Schema extension required (parallel to Block 17 + 19)

Block 17 added `wear_characteristics?: string[]` and `cousin_contrasts?:
string[]` to `UpholsteryConstructionTypeEntry` and
`UpholsteryCoverTypeEntry`. Block 19a flagged the parallel gap on
`JoineryTypeEntry`. The fastener interfaces ALSO do not declare these
fields. Verified against `lib/constraints/fasteners.ts:165-192`
(`FastenerTypeEntry`).

**`FastenerTypeEntry` — fields to add:**

- `wear_characteristics?: string[]` — fastener wear is observable
  (e.g., oxidation depth/eveness on hand-forged nails; stripped
  slots on early slotted screws; loosened holding capacity from
  multi-generation nail-hole patterns; brass tack tarnish and
  patina; staple-leg corrosion; Phillips-recess cam-out wear).
  Authoring discipline: short noun-phrase observations, capitalized
  first word, no terminal period — matching the existing
  `identifying_characteristics` casing. **Caveat:** the docx does
  not provide per-type wear sections, so authoring would be
  primary-source-extrapolation rather than docx-extraction.
- `cousin_contrasts?: string[]` — fastener types frequently need
  contrast against close cousins (rosehead vs L-head; cut nail vs
  wire nail; slotted vs Phillips; Phillips vs Robertson vs Pozidriv;
  hand tack vs machine staple vs nailhead trim; carriage bolt vs
  threaded rod; cam lock vs barrel nut vs Confirmat). Authoring
  discipline: one complete sentence per array item, capitalized,
  ending with a period.
- `diagnostic_caution_text?: string` — engine consumes ONLY
  `diagnostic_caution_text` per `engine-consumability-spec.md` §2
  `getCanonicalCautionText`. `FastenerTypeEntry` does not declare
  the field today; adding it would let restoration-contamination
  warnings (which currently live in the shared `notes` field as
  prose) surface to engine consumers. Authoring discipline:
  appraiser-honest single paragraph; ends with period; no internal
  bullets. Especially valuable on `fastener_type_phillips_wood_screw`,
  `fastener_type_upholstery_staple`,
  `fastener_subcategory_machine_staples`,
  `fastener_subcategory_phillips_head_screws` per the FastenerReasoningRule
  #2 (replacement_fastener_risk) + #4 (restoration_contamination).

**Engine consumability note:** per `engine-consumability-spec.md` §6,
fastener type entries are NOT in the upholstery LLM appendix path —
`wear_characteristics` would not surface to the engine via
`buildUpholsteryCanonicalAppendix`. Authoring them would be
documentation-only until a parallel `buildFastenerCanonicalAppendix`
is added. Same caveat applies to `cousin_contrasts`. The
`diagnostic_caution_text` field IS engine-consumed today via
`getCanonicalCautionText` — that one would be live the moment a
canonical entry populates it. Mike should know
`wear_characteristics`/`cousin_contrasts` are "author for future
engine consumer" work, but `diagnostic_caution_text` is
engine-immediate.

**`FastenerSubcategoryEntry` — same three fields candidate
for addition.** The dual-assessment subcategories
(`fastener_subcategory_machine_staples`) carry the strongest
restoration-contamination semantics in the library; a
`diagnostic_caution_text` here would be high-leverage for surfacing
the restoration-contamination warning into engine output.

**`FastenerCategoryEntry` — no missing fields.** Category-level
content from the docx (Category Description, Unique Traits of [Category],
Core Identifying Elements) is fully captured by the existing
`category_description`, `unique_category_traits`,
`core_identifying_elements?` fields. Category 6 (GLUE-ASSISTED)
correctly omits `core_identifying_elements` per the optional-field
precedent (docx Category 6 has UNIQUE TRAITS but no separate
IDENTIFYING ELEMENTS section).

## Pre-existing engine-invisible content / convention drift

Per `engine-consumability-spec.md` §2 — `getCanonicalCautionText`
reads only `diagnostic_caution_text`; the shared `caution_text`
field is unread.

### `caution_text` populated (engine-invisible drift): NONE

The fastener library is clean. No entry populates `caution_text`
on any of the 40 audited entries. The Block 19a-flagged joinery
drift (4 entries) has no parallel here. Remediation: not required.

### `date_ceiling: 2030` legacy sentinel: NONE

No entry carries the `date_ceiling: 2030` sentinel. All
open-ended-to-present periods correctly omit `date_ceiling` and use
`date_floor` only (engine surfaces these as `"post-YYYY"` via
`dateHintFor`). Remediation: not required.

### "Arts & Crafts" vs "Arts and Crafts": NOT APPLICABLE

Neither the fastener docx nor the canonical fastener library
references the Arts and Crafts style. Period labels in
`period_associations` use technology-anchored phrases ("Primary
dominance", "Industrial production", "Phillips emergence",
"Flat-pack era") rather than style names. No drift to remediate.

### Date-range string conformance per `engine-consumability-spec.md` §1

All `date_range_summary` strings use the en-dash range form
(`"c. YYYY–YYYY"`) or open-ended (`"c. YYYY–present"`). Verified
patterns:
- `"c. 1600–1820."` (rosehead_nail)
- `"c. 1700–1840."` (l_head_t_head_nail, handmade_wood_screw)
- `"c. 1790–1835."` (early_hand_headed_cut_nail)
- `"c. 1825–1895."` (machine_headed_cut_nail)
- `"c. 1840–1910+."` (brad_finish_cut_nail) — **note:** the `1910+`
  trailing plus would fail `parseRangeToNumeric` if any future
  consumer parsed `date_range_summary`. Engine reads the structured
  `period_associations` array (which has `{date_floor: 1840, open}`),
  so today this is documentation-only and not engine-affecting.
- `"c. 1890–present."` and variations (multiple wire nail and modern types)
- `"c. 1930–present. Very common after 1950."` (upholstery_staple) —
  multi-sentence; if parsed, rule #1 would fire on the bare `1950`
  bare-year. Documentation-only today.

None of the strings violate engine-consumable conventions because
`date_range_summary` is not parsed today; structured
`period_associations` carry the authoritative dates.

### `assessment_layer` field — declared but not engine-honored

Per the dual-assessment architecture (D-FA33-5):
- 6 categories declare `assessment_layer: "frame"`.
- 9 subcategories declare `assessment_layer: "frame"` (7) or
  `"upholstery"` (2: `fastener_subcategory_upholstery_tacks` +
  `fastener_subcategory_machine_staples`).
- `FastenerTypeEntry` schema does NOT declare the field (per
  per-type inheritance from subcategory parent, per indicator_text
  prose on overlap-pair type entries).

The engine's `engineCategoryFor` (`engineClueResolver.ts:37-51`)
routes purely by category-prefix and does NOT inspect
`assessment_layer`. The two subcategory-level overrides
(STAPLES 3A + 3B) are silently inoperative for engine routing today.
This is the single most operationally significant authoring-vs-engine
gap in the fastener library. See OVERLAP section above for resolution
options.

## Missing canonical entries (docx has, canonical lacks)

**None.** Every docx entity has a canonical home:
- 6 CATEGORY entries → 6 `fastener_category` entries ✓
- 9 SUBCATEGORY entries → 9 `fastener_subcategory` entries ✓
- 25 FASTENER TYPE entries → 25 `fastener_type` entries ✓

The docx FASTENER DATING QUICK-REFERENCE GRID + Critical Evidence
Warnings sections are correctly handled as meta content via the
5 `fastener_reasoning_rule` entries (replacement_fastener_risk,
rural_persistence, restoration_contamination,
fasteners_alone_never_dates_furniture,
fastener_evidence_layer_independence) per Mike's reasoning-rule
TYPE precedent.

## Orphan canonical entries (canonical has, docx lacks)

**None.** Every canonical entry (40 of 40 audited; reasoning rules
excluded as meta) corresponds to a docx entity. No Block 0.5c-style
orphan additions in the fastener library, unlike joinery (which had
4 orphan additions).

## Per-entry gaps

### Categories (6 of 6 matched; all GOOD)

| # | Canonical id | Docx § | Status | Notes |
|---|---|---|---|---|
| 1 | `fastener_category_nails` | CATEGORY 1: NAILS (line 21) | GOOD | All 5 docx fields captured (Category Description, Unique Traits 5-item list, Core Identifying Elements 10-item list); `assessment_layer: "frame"` |
| 2 | `fastener_category_screws` | CATEGORY 2: SCREWS (line 195) | GOOD | All 4 docx fields captured; `assessment_layer: "frame"` |
| 3 | `fastener_category_staples` | CATEGORY 3: STAPLES (line 349) | GOOD | All 4 docx fields captured; `assessment_layer: "frame"` (subcategory overrides handle upholstery routing per intent) |
| 4 | `fastener_category_bolts_rods_machine_fasteners` | CATEGORY 4 (line 400) | GOOD | All 4 docx fields captured |
| 5 | `fastener_category_knock_down_connectors` | CATEGORY 5 (line 439) | GOOD | All 4 docx fields captured |
| 6 | `fastener_category_glue_assisted_fasteners` | CATEGORY 6 (line 469) | GOOD | Category Description + Unique Traits captured; `core_identifying_elements` correctly OMITTED per docx absence of an IDENTIFYING ELEMENTS section (per-category-fidelity optional-field convention) |

### Subcategories (9 of 9 matched; all GOOD)

| # | Canonical id | Docx § | Status | Notes |
|---|---|---|---|---|
| 1 | `fastener_subcategory_hand_forged_nails` | 1A HAND-FORGED NAILS (line 48) | GOOD | All docx fields captured; period_associations has 2 entries (1600-1830 primary + 1830-1899 rural persistence) — captures the "Rural persistence into late 19th century" docx prose as a structured period |
| 2 | `fastener_subcategory_cut_nails` | 1B CUT NAILS (line 100) | GOOD | period_associations has 2 entries (1790-1900 primary + 1900+ specialty persistence) |
| 3 | `fastener_subcategory_wire_nails` | 1C WIRE NAILS (line 149) | GOOD | period_associations has 2 entries (1880-1894 introduction + 1895+ dominance) |
| 4 | `fastener_subcategory_handmade_screws` | 2A HANDMADE SCREWS (line 211) | GOOD | All docx fields captured |
| 5 | `fastener_subcategory_machine_cut_screws` | 2B MACHINE-CUT SCREWS (line 236) | GOOD | All docx fields captured |
| 6 | `fastener_subcategory_phillips_head_screws` | 2C PHILLIPS-HEAD SCREWS (line 281) | GOOD | period_associations has 2 entries (1930-1939 invention + 1940+ broad use) |
| 7 | `fastener_subcategory_modern_drive_types` | 2D MODERN DRIVE TYPES (line 308) | GOOD | All docx fields captured |
| 8 | `fastener_subcategory_upholstery_tacks` | 3A UPHOLSTERY TACKS (line 362) | GOOD with OVERLAP CAVEAT | All docx fields captured; `assessment_layer: "upholstery"` declared but engine doesn't honor (see Overlap pair 1) |
| 9 | `fastener_subcategory_machine_staples` | 3B MACHINE STAPLES (line 379) | GOOD with OVERLAP CAVEAT | All docx fields captured; `assessment_layer: "upholstery"` declared but engine doesn't honor; `staple_fastener` clue routes here to FASTENERS layer (see Overlap pair 2) |

### Types (25 of 25 matched; all GOOD)

| # | Canonical id | Docx § | Status | Notes |
|---|---|---|---|---|
| 1 | `fastener_type_rosehead_nail` | ROSEHEAD NAIL (line 76) | GOOD | period 1600-1820 matches; `regional_persistence_notes` populated from Rural Persistence meta block |
| 2 | `fastener_type_l_head_t_head_nail` | L-HEAD / T-HEAD NAIL (line 89) | GOOD | period 1700-1840 matches; `regional_persistence_notes` populated |
| 3 | `fastener_type_early_hand_headed_cut_nail` | EARLY HAND-HEADED CUT NAIL (line 120) | GOOD | period 1790-1835 matches; `regional_persistence_notes` populated |
| 4 | `fastener_type_machine_headed_cut_nail` | MACHINE-HEADED CUT NAIL (line 129) | GOOD | period 1825-1895 matches; `regional_persistence_notes` populated |
| 5 | `fastener_type_brad_finish_cut_nail` | BRAD / FINISH CUT NAIL (line 139) | GOOD | docx says `"c. 1840–1910+"`; canonical period[0] `{1840, open}` with `usage_notes` capturing the `1910+` qualifier; `date_range_summary` echoes `"c. 1840–1910+."` (documentation-only, would not parse cleanly if any future consumer parsed it) |
| 6 | `fastener_type_common_wire_nail` | COMMON WIRE NAIL (line 168) | GOOD | period 1890+ matches |
| 7 | `fastener_type_finish_nail` | FINISH NAIL (line 177) | GOOD | period 1890+ matches |
| 8 | `fastener_type_box_nail` | BOX NAIL (line 187) | GOOD | period 1890+ matches |
| 9 | `fastener_type_handmade_wood_screw` | HANDMADE WOOD SCREW (line 226) | GOOD | period 1750-1840 matches |
| 10 | `fastener_type_slotted_wood_screw` | SLOTTED WOOD SCREW (line 248) | GOOD | period_associations has 2 entries (1840-1940 dominance + 1940+ post-Phillips persistence); `regional_persistence_notes` populated |
| 11 | `fastener_type_brass_wood_screw` | BRASS WOOD SCREW (line 260) | GOOD | period 1840+ matches |
| 12 | `fastener_type_steel_wood_screw` | STEEL WOOD SCREW (line 272) | GOOD | period 1850+ matches |
| 13 | `fastener_type_phillips_wood_screw` | PHILLIPS WOOD SCREW (line 299) | GOOD | period 1935+ matches; AG anchor at 1935 prominent |
| 14 | `fastener_type_robertson` | ROBERTSON (SQUARE DRIVE) (line 319) | GOOD | period_associations has 2 entries (1908-1949 emergence + 1950+ dominance); AG anchor at 1908 prominent |
| 15 | `fastener_type_torx` | TORX SCREW (line 328) | GOOD | period 1967+ matches; AG anchor at 1967 prominent |
| 16 | `fastener_type_allen_hex_socket_screw` | ALLEN / HEX SOCKET SCREW (line 337) | GOOD | period_associations has 2 entries (1910-1949 introduction + 1950+ furniture commonality); AG anchor at 1910 prominent; usage_notes captures the docx "Furniture commonality later" qualifier |
| 17 | `fastener_type_decorative_brass_tack` | DECORATIVE BRASS TACK (line 371) | GOOD with OVERLAP | period 1800+ matches docx; engine reach is via upholstery side `nailhead_trim` clue, not via this entry (see Overlap pair 3) |
| 18 | `fastener_type_upholstery_staple` | UPHOLSTERY STAPLE (line 390) | GOOD with OVERLAP | period_associations has 2 entries (1930-1949 introduction + 1950+ widespread); AG anchor at 1930 prominent; the 1930 AG diverges from upholstery-side 1900 AG (D-FA34-11 / D-HW36-16 documented per-source-document divergence) |
| 19 | `fastener_type_carriage_bolt` | CARRIAGE BOLT (line 412) | GOOD | period 1850+ matches |
| 20 | `fastener_type_threaded_rod` | THREADED ROD (line 422) | GOOD | period 1880+ matches |
| 21 | `fastener_type_barrel_nut_cross_dowel` | BARREL NUT / CROSS DOWEL (line 430) | GOOD | period 1950+ matches |
| 22 | `fastener_type_cam_lock_connector` | CAM LOCK CONNECTOR (line 451) | GOOD | period 1960+ matches; AG anchor at 1960 prominent; cross-FK to `joinery_type_knock_down_cam_lock_joinery` |
| 23 | `fastener_type_confirmat_screw` | CONFIRMAT SCREW (line 460) | GOOD | period 1970+ matches; AG anchor at 1970 prominent; cross-FK to `joinery_type_confirmat_screw_joinery` |
| 24 | `fastener_type_corrugated_fastener` | CORRUGATED FASTENER (line 475) | GOOD | period_associations has 2 entries (1880-1929 introduction + 1930-1950 widespread); docx `"c. 1880–1950"` closed range correctly captured (unique end-ceiling among fastener types); NO AG per soft-boundary precedent; cross-FK to `joinery_type_corrugated_fastener_reinforcement` |
| 25 | `fastener_type_biscuit_compression_plate` | BISCUIT / COMPRESSION PLATE SYSTEMS (line 484) | GOOD | period 1950+ matches; AG anchor at 1950 prominent; cross-FK to `joinery_type_biscuit_joint` (matches joinery library precedent ✓) |

### Common gap pattern (applies to ALL 25 type entries)

- No `wear_characteristics` (schema field absent on `FastenerTypeEntry`).
  Docx itself has no per-type "Wear Indicators" subsection, so the
  gap is symmetric: schema would need extension AND content would need
  primary-source-extrapolation authoring (not docx-extraction).
- No `cousin_contrasts` (schema field absent). Same status: docx
  itself has no per-type "Cousin Contrasts" subsection. Authoring
  would be primary-source-extrapolation. Notable cousin clusters for
  future authoring: nails (rosehead vs L-head, cut vs wire), screws
  (slotted vs Phillips vs Robertson vs Torx vs Allen), upholstery
  fasteners (hand tack vs machine staple vs nailhead trim), KD
  connectors (cam lock vs barrel nut vs Confirmat).
- No `diagnostic_caution_text` (schema field absent). Engine-relevant
  gap — the field IS engine-consumed via `getCanonicalCautionText`,
  so adding it would be immediately useful. Authoring candidates
  (where restoration-contamination prose is currently buried in
  `notes`): `phillips_wood_screw`, `upholstery_staple`,
  `machine_staples` subcategory, `phillips_head_screws` subcategory.

### Common-pattern non-gap (NOT flagged)

- `description` is consistently short and faithful (often a single
  short clause echoing the docx Description section).
- `unique_traits` and `identifying_characteristics` use sentence-case
  noun phrases without terminal periods — internally consistent and
  matches the established convention.
- `period_associations` are well-formed for engine consumption: every
  entry that surfaces via a clue mapping has at minimum `date_floor`
  populated; multi-period decomposition (introduction + dominance,
  invention + broad use, technology introduction + furniture
  commonality) is used appropriately to preserve nuance from the
  docx prose.
- `anti_classification_guidance` is populated on every
  industrial-introduction-boundary type (Phillips 1935, Robertson
  1908, Torx 1967, Allen 1910, Upholstery Staple 1930, Cam Lock 1960,
  Confirmat 1970, Biscuit 1950) — full coverage per the original
  D-FA33-2 / D-FA34 plan.
- `related_joinery_types` cross-FKs are populated on the 4 cross-
  library overlap candidates per D-FA34-5 (upholstery_staple,
  cam_lock_connector, confirmat_screw, corrugated_fastener,
  biscuit_compression_plate).
- `regional_persistence_notes` is populated on the 5
  rural-persistence-bounded types per D-FA34-7
  (rosehead_nail, l_head_t_head_nail, early_hand_headed_cut_nail,
  machine_headed_cut_nail, slotted_wood_screw).

## Summary of remediation tasks (priority order)

1. **HIGH (engine-routing live bug):** Resolve the
   `staple_fastener` → `fastener_subcategory_machine_staples`
   routing inconsistency (see Overlap pair 2). The
   `assessment_layer: "upholstery"` declaration is silently
   inoperative; staple evidence currently counts at the FRAME layer.
2. **MEDIUM (schema extension + immediate engine benefit):** Add
   `diagnostic_caution_text?: string` to `FastenerTypeEntry` and
   `FastenerSubcategoryEntry`. Populate on the 4-5
   restoration-contamination-bearing entries (Phillips screw types
   + machine staples + Phillips subcategory). Field IS
   engine-consumed today; population would surface caution prose
   into dating-support arrays immediately.
3. **MEDIUM (overlap deduplication decision):** Decide on the
   3 overlap pairs (hand_tacks, machine_staples,
   decorative_brass_tack) — keep both per-source-document (current
   default per D-UC40-5), or demote one side to documentation-only
   FK stub. Most operationally significant: pair 2 (machine
   staples) per #1 above.
4. **LOW (schema extension + future engine consumer):** Add
   `wear_characteristics?: string[]` and `cousin_contrasts?: string[]`
   to `FastenerTypeEntry`. Both are documentation-only until a
   parallel `buildFastenerCanonicalAppendix` is added. Content
   would need primary-source-extrapolation authoring (docx itself
   does not surface per-type wear or cousin content).
5. **NIL (no remediation needed):** No `caution_text` drift, no
   `date_ceiling: 2030` sentinels, no Arts-and-Crafts naming
   inconsistencies. The fastener library is clean of the four
   convention-drift classes that affected joinery (Block 19a) or
   would affect other libraries.
