# Block 21a: Hardware Canonical ↔ Docx Audit

Generated against `/tmp/hardware-docx-clean.md` (extracted from
`Furniture_Hardware_Identification_System.docx`; 606 lines: 10
top-level CATEGORY entries + ~34 nested TYPE / SUBTYPE entries +
3 meta sections: HARDWARE EVIDENCE RULES + HARDWARE CONFLICT
RULES + HIGH-AUTHORITY HARDWARE OBSERVATIONS) and canonical
`lib/constraints/hardware.ts` (13 `hardware_category` + 44
`hardware_type` + 5 `hardware_reasoning_rule` entries — reasoning
rules skipped as meta content, not per-entry data).

## Summary

- Docx entries (per-type bucket): 10 top-level CATEGORY entries
  + 34 specific TYPE / SUBTYPE entries = 44 audited entities.
- Canonical entries audited: 13 `hardware_category` + 44
  `hardware_type` (= 57). 5 `hardware_reasoning_rule` entries
  are meta and out of scope.
  - Note: the Block 21a prompt expected `45 type entries + 14
    category entries`. The grep counts that produced those
    figures pick up the TypeScript `interface` field
    declarations (`category: "hardware_type";` and
    `category: "hardware_category";`), which inflate each
    bucket by 1. Actual canonical content is 44 types + 13
    categories. Same off-by-one pattern observed in Block 19a
    and 20a.
- Matched pairs (category↔category + type↔type): **44 of 44
  docx entities matched** (100% coverage on the docx entries).
  - 10 docx top-level CATEGORY entries → 10 canonical
    `hardware_category` entries.
  - 34 docx specific TYPE / SUBTYPE entries → 34 canonical
    `hardware_type` entries.
- Docx entries with NO canonical match: 0.
- Canonical entries with NO docx match (orphan canonical
  entries): **4** — see Orphan section.
  - 3 canonical `hardware_category` entries that the docx
    treats as SUBTYPES of PULL HARDWARE rather than top-level
    categories (`hardware_category_knob_pull`,
    `hardware_category_bin_pull`, `hardware_category_ring_pull`).
    These are docx structure-recasting orphans, not
    content-novel additions — every type under each one has a
    docx match.
  - 1 canonical `hardware_type` entry without any docx
    correspondence: `hardware_type_eastlake_brass_pull` (Block
    0.5c HCL-migration addition; not in the hardware docx).
- Overlap with `upholsteryConstruction.ts` + `fasteners.ts`
  (resolution decision required): **3 entries** —
  `hardware_type_upholstery_tacks`,
  `hardware_type_decorative_nailhead_trim`,
  `hardware_type_coil_spring_hardware`. See dedicated section
  below.
- Type entries missing `wear_characteristics` (schema field
  absent on `HardwareTypeEntry`): **44 / 44** (entire library —
  schema does not yet declare the field on `HardwareTypeEntry`).
- Type entries missing `cousin_contrasts` (schema field absent
  on `HardwareTypeEntry`): **44 / 44** (same — schema gap).
- Type entries missing `diagnostic_caution_text` (schema field
  absent on `HardwareTypeEntry`; engine consumes only this name,
  not `caution_text`): **44 / 44**.
- Entries with `caution_text` populated (engine-invisible drift
  per engine-consumability-spec.md §2): **1**
  (`hardware_type_eastlake_brass_pull`, line 1901). The Block
  0.5c HCL migration authored a rich caution paragraph into
  `caution_text` rather than `diagnostic_caution_text`; engine
  `getCanonicalCautionText` returns null for this entry.
- Entries with `date_ceiling: 2030` legacy sentinel: **2
  occurrences on 1 entry** — both inside
  `hardware_type_eastlake_brass_pull` (one in `period_associations`
  line 1883; one in `style_associations` line 1891). All Block 36
  type entries correctly omit `date_ceiling` for open-ended
  ranges; the 2030 sentinel is isolated to the Block 0.5c
  HCL-migration orphan entry.
- Entries with "Arts & Crafts" ampersand: 0; "Arts and Crafts"
  spelled out: 0 (the style is not referenced in hardware.ts).
  No drift to remediate.
- Entries with dating drift between docx and canonical: 0
  among the 44 docx-matched entries (canonical dates faithfully
  echo docx DATE RANGE sections including multi-period
  decomposition for revival waves).

Status distribution for the 34 docx-matched **type** entries:
GOOD = 34, PARTIAL = 0, MAJOR = 0 with respect to the docx
content.

(All 34 type entries faithfully capture every field the docx
provides: `description`, `unique_traits`,
`identifying_characteristics`, `period_associations`,
`date_range_summary`. The docx hardware sections have no per-type
"Wear Indicators" or "Cousin Contrasts" subsections, so the Block
17 schema-extension gap is not blocked by missing docx content —
those fields would need authoring discipline rather than
docx-extraction. Same caveat as Block 20a fasteners.)

Status distribution for the 10 docx-matched **category** entries:
GOOD = 10, PARTIAL = 0, MAJOR = 0. All docx Category Description
+ Unique Traits + Identifying Elements sections are captured by
the corresponding canonical fields.

## ★ OVERLAP WITH upholsteryConstruction.ts + fasteners.ts (RESOLUTION DECISION REQUIRED) ★

The hardware library carries 3 canonical type entries inside
`hardware_category_upholstery_hardware` that have direct
parallels in `lib/constraints/upholsteryConstruction.ts` and (for
2 of the 3) in `lib/constraints/fasteners.ts`. The category-level
`assessment_layer: "upholstery"` override declared on
`hardware_category_upholstery_hardware` (hardware.ts:473) is now
HONORED by the engine following the Block 20a follow-up fix in
commit 222fe1d (engineCategoryFor consults `assessment_layer`
before falling through to canonical-id prefix routing). So all 3
hardware-side upholstery entries correctly route to the
`"upholstery"` dating-overlap layer today, eliminating the
silent dual-layer surfacing risk that motivated the Block 20a
remediation for fasteners pair 2.

Three-way overlap matrix:

| Physical object | Hardware-side entry | Fastener-side entry | Upholstery-side entry |
|---|---|---|---|
| Upholstery tacks | `hardware_type_upholstery_tacks` (hardware.ts:1592) | `fastener_subcategory_upholstery_tacks` + `fastener_type_decorative_brass_tack` (fasteners.ts:625, 1233) | `upholstery_construction_type_hand_tacks` (upholsteryConstruction.ts:1565) |
| Decorative nailhead trim | `hardware_type_decorative_nailhead_trim` (hardware.ts:1619) | `fastener_type_decorative_brass_tack` (fasteners.ts:1233) | `upholstery_construction_type_decorative_brass_nails_nailhead_trim` (upholsteryConstruction.ts:1601) |
| Coil spring hardware | `hardware_type_coil_spring_hardware` (hardware.ts:1644) | (no direct fastener equivalent — coil springs are upholstery construction, not fasteners) | `upholstery_construction_type_early_coil_spring` (703) + `upholstery_construction_type_hand_tied_coil_springs` (739) + `upholstery_construction_type_drop_in_spring_unit` (776) + `upholstery_construction_type_marshall_pocket_coil` (810) + `upholstery_construction_type_sinuous_serpentine_spring` (844) |

### Overlap object 1: Upholstery tacks (THREE-way overlap)

| Aspect | Hardware side | Fastener side | Upholstery side |
|---|---|---|---|
| Canonical id | `hardware_type_upholstery_tacks` | `fastener_subcategory_upholstery_tacks` | `upholstery_construction_type_hand_tacks` |
| Engine clue mapping | none directly (TYPE not in `CLUE_TO_CANONICAL`) | none directly (subcategory not in `CLUE_TO_CANONICAL`) | `hand_tacks` → `upholstery_construction_type_hand_tacks` (engineCanonicalMap.ts:103) |
| Engine routing today | UNREACHED; if reached would route to `"upholstery"` layer via `assessment_layer` override post-222fe1d | UNREACHED; if reached would route to `"upholstery"` layer via `assessment_layer` override post-222fe1d | routes to `"upholstery"` layer ✓ |
| `assessment_layer` source | inherited from parent `hardware_category_upholstery_hardware` (`"upholstery"`) | declared on subcategory itself (`"upholstery"`) | n/a (upholstery library routes via prefix) |
| `date_floor` | period[0] `{1700, open}`; date_range_summary `"1700-present."` | period[0] `{1700, open}`; date_range_summary `"c. 1700–present."` | period[0] `{1700, 1920}`; period[1] `{1920, open}`; date_range_summary `"c. 1700 to early 20th century, with continued traditional use."` |
| `date_floor` alignment | **1700 — ALIGNS with Block 20a reconciled date** (no drift) | 1700 — Block 20a reconciled ✓ | 1700 floor on the closed diagnostic window — Block 20a reconciled ✓ |
| `replacement_likelihood` | `"high"` | not populated | `"medium"` — disagrees with hardware-side `"high"`; upholstery side rationale: "modern restorers still use tacks" (notes line 1570) |
| `identifying_characteristics` drift | "Hammer-driven / Oxidation patterns" (2 items, docx-verbatim) | "Individual hammered placement / Domed heads common / Brass decorative examples frequent" (3 items, fastener-docx-verbatim) | "Irregular spacing, oxidized heads / Multiple tack-hole generations / Hand placement" (3 items, upholstery-docx-verbatim) |
| Cross-library FK | `related_fastener_types: ["fastener_subcategory_upholstery_tacks"]` (line 1616) | none back to hardware side | `related_hardware_types: ["hardware_type_upholstery_tacks"]` + `related_fastener_types: ["fastener_type_decorative_brass_tack"]` (lines 1597-1598) |

**Resolution implication.** The date_floor (1700) is now aligned
across all three libraries — Block 20a reconciled the
upholstery + fastener sides; the hardware side was already at 1700
and required no migration. **CONFIRMED: hardware-side
`hardware_type_upholstery_tacks` carries the Block 20a reconciled
date.**

Outstanding asymmetries that do NOT block engine correctness but
warrant Mike's awareness:
1. `replacement_likelihood` is `"high"` on hardware vs
   `"medium"` on upholstery (not populated on fastener
   subcategory). The two values surface in different engine
   consumers and could produce inconsistent originality
   inference. The upholstery side is the engine-consumed entry
   today; hardware is unreached.
2. The fastener-side and hardware-side entries are
   docx-faithful to their own docx sources but unreached by
   any engine clue. Per the D-UC40-5 per-source-document
   fidelity precedent, this is intentional and documented in
   both entries' notes.

### Overlap object 2: Decorative nailhead trim (THREE-way overlap)

| Aspect | Hardware side | Fastener side | Upholstery side |
|---|---|---|---|
| Canonical id | `hardware_type_decorative_nailhead_trim` | `fastener_type_decorative_brass_tack` | `upholstery_construction_type_decorative_brass_nails_nailhead_trim` |
| Engine clue mapping | none directly | none directly (TYPE in `CLUE_TO_ALTERNATIVES` for `staple_fastener` only) | `nailhead_trim` → `upholstery_construction_type_decorative_brass_nails_nailhead_trim` (engineCanonicalMap.ts:104) |
| Engine routing today | UNREACHED; would route to `"upholstery"` post-222fe1d | UNREACHED as primary canonical | routes to `"upholstery"` layer ✓ |
| `date_floor` | period[0] `{1800, open}`; date_range_summary `"1800-present."` | period[0] `{1800, open}`; date_range_summary `"c. 1800–present."` | period[0] `{1800, open}`; date_range_summary `"c. 1800 to present."` |
| `date_floor` alignment | **1800 — ALIGNS with Block 20a reconciled date** (no drift) | 1800 — Block 20a reconciled ✓ | 1800 — Block 20a reconciled ✓ (note: Block 20a prompt described a 200-year fastener-vs-upholstery divergence; in fact the upholstery side is 1800, matching fastener and hardware; no live divergence today) |
| `replacement_likelihood` | `"high"` | `"medium"` | `"medium"` |
| `identifying_characteristics` drift | "Uniform spacing / Brass or steel heads" (2 items, docx-verbatim) | "Brass domed head / Visible rhythmic spacing" (2 items) | "Brass or brass-colored nailheads along edges / Earlier nailheads may show hand irregularity and tarnish / Modern strips often have every fifth nail real and the rest imitation" (3 items, richest content) |
| Cross-library FK | none from hardware side (no related_fastener_types or related_upholstery_construction_types) | none | `related_hardware_types: ["hardware_type_decorative_nailhead_trim"]` (line 1630) |

**Resolution implication.** The date_floor (1800) is aligned
across all three libraries. **CONFIRMED: hardware-side
`hardware_type_decorative_nailhead_trim` carries the Block 20a
reconciled date** (which happened to coincide with the
already-correct upholstery and hardware values).

Outstanding asymmetries:
1. `replacement_likelihood` is `"high"` on hardware vs
   `"medium"` on fastener and upholstery sides — same
   inconsistency class as overlap object 1.
2. The hardware-side entry has no
   `related_upholstery_construction_types` or
   `related_fastener_types` FK, while the upholstery side
   carries an FK back to hardware. The reverse direction is
   missing; documentation-only completeness gap.
3. The upholstery side has materially richer
   `identifying_characteristics` content (including the
   "modern strips often have every fifth nail real and the
   rest imitation" detail that is high-value diagnostic
   prose). This is the only entry of the 3 overlap pairs
   with material content asymmetry beyond field
   nomenclature.

### Overlap object 3: Coil spring hardware (NEW overlap surfaced by this audit)

This overlap was not addressed in Blocks 18 (upholstery audit) or
20a (fastener audit); it is surfaced for the first time by Block
21a.

| Aspect | Hardware side | Upholstery side (5 entries) |
|---|---|---|
| Canonical id (hardware) | `hardware_type_coil_spring_hardware` (single entry) | (multiple — see below) |
| Engine clue mapping (hardware) | none directly | n/a |
| Engine routing today (hardware) | UNREACHED; would route to `"upholstery"` post-222fe1d | (covered below per upholstery id) |
| `date_floor` (hardware) | period[0] `{1850, open}`; date_range_summary `"1850-present."` | (covered below) |

The upholstery library decomposes the docx single COIL SPRING
HARDWARE entry into 5 separate construction types with distinct
dating envelopes:

| Upholstery id | Engine clue | period[0] floor | period[0] ceiling | Engine layer |
|---|---|---|---|---|
| `upholstery_construction_type_early_coil_spring` (703) | (none direct) | 1780 | 1830 (closed; period[1] open from 1830) | n/a |
| `upholstery_construction_type_hand_tied_coil_springs` (739) | `hand_tied_coil_spring` → here (engineCanonicalMap.ts:99) | 1800 | open | `"upholstery"` |
| `upholstery_construction_type_drop_in_spring_unit` (776) | `drop_in_spring_unit` → here | 1880 | open | `"upholstery"` |
| `upholstery_construction_type_marshall_pocket_coil` (810) | `marshall_pocket_coil` → here | 1880 | open | `"upholstery"` |
| `upholstery_construction_type_sinuous_serpentine_spring` (844) | `serpentine_spring` → here | 1930 (AG) | open | `"upholstery"` |

Plus the generic-tier upholstery clue `coil_spring` →
`upholstery_construction_type_early_coil_spring` per
engineCanonicalMap.ts:99 (the broadest umbrella).

**Date alignment / drift summary for coil spring hardware:**

- Hardware-side date_floor: **1850**.
- Upholstery-side date_floors (5 entries): **1780, 1800,
  1880, 1880, 1930**.
- The hardware-side 1850 floor falls inside the broader
  upholstery-side coverage envelope but does NOT match any
  single upholstery-side entry's floor.
- The hardware-side `hardware_type_coil_spring_hardware`
  appears to map most closely to the upholstery-side
  `upholstery_construction_type_early_coil_spring`
  (1780-1830 experimental → 1830-open practical) — but
  even that one's period[1] floor is 1830, not 1850.
- The docx hardware section gives a single date range of
  "1850–present" for COIL SPRING HARDWARE; the canonical
  hardware-side entry faithfully reflects that range. The
  upholstery library's 1780/1800/1830 floors come from
  `American_Furniture_Textile_Reference.docx` which carries
  richer multi-period coil-spring history than the
  hardware docx.

**Resolution implication.** This is a docx-source asymmetry
(hardware docx says 1850, upholstery docx documents pre-1850
experimental coil work). Three remediation paths:

1. **Status quo per D-UC40-5 per-source-document fidelity
   precedent.** Hardware-side `hardware_type_coil_spring_hardware`
   stays at 1850 per the hardware docx. Documentation-only
   divergence acknowledged in `notes` field. No engine impact
   today (hardware-side entry is unreached by any clue mapping;
   only upholstery-side entries route via the dedicated
   `coil_spring` / `hand_tied_coil_spring` /
   `marshall_pocket_coil` / `drop_in_spring_unit` /
   `serpentine_spring` clues).

2. **Reconcile hardware-side to upholstery-side spread.** Add a
   second period_association to `hardware_type_coil_spring_hardware`
   pointing at the upholstery library's experimental window
   (1780-1830). Adds cross-library coherence at the cost of
   diverging from the hardware docx verbatim.

3. **Demote hardware-side coil spring entry to a stub.**
   The 5 upholstery-side entries provide far richer
   per-spring-type coverage; the hardware-side single entry
   adds little. Demote to documentation-only FK target. This
   is the most radical option and parallels the Block 20a
   remediation paths.

Mike's existing precedent (D-UC40-5; reaffirmed in Block 20a
overlap pairs 1 + 3) favors option 1 — per-source-document
fidelity with documentation-only acknowledgement of the divergence.
No live engine bug is introduced by option 1.

**Cross-library FK gaps on hardware-side coil spring entry:**
- `hardware_type_coil_spring_hardware` has no
  `related_construction_types` / equivalent FK back to the 5
  upholstery-side coil spring entries (no such field on
  `HardwareTypeEntry`, but no `related_upholstery_*_types`
  either — schema would need extension).
- None of the 5 upholstery-side coil spring entries declare
  `related_hardware_types: ["hardware_type_coil_spring_hardware"]`.
  Only the hand_tacks and decorative_brass_nails_nailhead_trim
  upholstery entries do that for their respective hardware
  cousins. Documentation-completeness gap on both directions.

### Overlap section summary

- 3 overlap objects identified (2 carrying live three-way
  overlap with fasteners + upholstery; 1 carrying live
  two-way overlap with upholstery only).
- **CONFIRMED: hardware-side `hardware_type_upholstery_tacks` is
  at 1700 — aligned with Block 20a reconciled date.**
- **CONFIRMED: hardware-side `hardware_type_decorative_nailhead_trim`
  is at 1800 — aligned with Block 20a reconciled date.**
- **NEW: `hardware_type_coil_spring_hardware` at 1850 represents
  a not-yet-reconciled docx-source asymmetry with the 5
  upholstery-side coil spring entries (1780/1800/1880/1880/1930
  floors).** Recommended resolution: status quo per D-UC40-5
  per-source-document fidelity (no engine bug, no urgent
  remediation; documentation-only divergence).
- Engine routing for all 3 hardware-side upholstery entries is
  correct today via the `engineCategoryFor` 222fe1d fix that
  honors `assessment_layer: "upholstery"` declared on
  `hardware_category_upholstery_hardware`. If any of these
  entries gained a `CLUE_TO_CANONICAL` mapping in the future,
  they would route to the `"upholstery"` dating-overlap layer,
  not `"hardware"`.
- Outstanding `replacement_likelihood` asymmetry between
  hardware (`"high"`) and upholstery/fastener (`"medium"`) on
  overlap objects 1 + 2 — non-blocking but worth Mike's
  attention if cross-library originality inference is added
  in a future block.
- Cross-library FK completeness gap on overlap object 3 —
  hardware-side coil spring entry carries no back-reference to
  the 5 upholstery-side coil spring entries; the upholstery
  entries do not back-reference hardware either.

## Schema extension required (parallel to Block 17 + 19 + 20)

Block 17 added `wear_characteristics?: string[]` and
`cousin_contrasts?: string[]` to
`UpholsteryConstructionTypeEntry` + `UpholsteryCoverTypeEntry`.
Block 19a flagged the parallel gap on `JoineryTypeEntry`. Block
20a flagged it on `FastenerTypeEntry` +
`FastenerSubcategoryEntry`. The hardware library carries the
**same** gap:

**`HardwareTypeEntry` (hardware.ts:134-164) — fields to add:**

- `wear_characteristics?: string[]` — hardware wear is
  observable in canonical-source-quality ways: arc wear at
  bail pivots, top-of-ring wear on ring pulls, hammer
  irregularity vs filed precision on hinge barrels, oxidation
  patterns on tacks and nailheads, glaze crazing on porcelain
  knobs, brittle ceramic chips on porcelain casters, floor-wear
  patterns on caster wheels, key-edge wear on lock keyways,
  shadow-mark continuity beneath backplates. The HIGH-AUTHORITY
  HARDWARE OBSERVATIONS docx section (lines 591-606) lists 14
  primary wear / continuity observations that would author
  cleanly into per-type `wear_characteristics` arrays.
  Authoring discipline: short noun-phrase observations,
  capitalized first word, no terminal period — matches
  established `identifying_characteristics` casing.

- `cousin_contrasts?: string[]` — hardware types frequently
  need contrast against close cousins: drop pull vs ring pull
  vs knob pull; batwing vs Chippendale vs Sheraton oval bail
  pulls; half-mortise vs full-mortise vs surface-mount locks;
  hand-forged vs machine-made butt hinges; pierced vs stamped
  vs cast escutcheons; piano vs butterfly vs butt hinge;
  porcelain vs wooden vs rubber casters; original Eastlake vs
  Colonial Revival reproduction Eastlake. The docx Hardware
  Conflict Rules section (lines 583-590) lists 6 explicit
  cousin-confusion vectors that would author cleanly.
  Authoring discipline: one complete sentence per array item,
  capitalized, ending with a period.

- `diagnostic_caution_text?: string` — engine consumes ONLY
  `diagnostic_caution_text` per `engine-consumability-spec.md`
  §2 `getCanonicalCautionText`. `HardwareTypeEntry` does not
  declare the field today; adding it would let the heavy
  reproduction-warning prose currently buried in `notes`
  surface to engine consumers. Authoring discipline:
  appraiser-honest single paragraph; ends with period; no
  internal bullets. Especially valuable on heavily-reproduced
  hardware types per the docx Hardware Conflict Rules
  canonical anchors: `hardware_type_eastlake_hardware`,
  `hardware_type_batwing_bail_pull`,
  `hardware_type_chippendale_bail_pull`,
  `hardware_type_concealed_euro_hinge`,
  `hardware_type_eastlake_brass_pull` (the last already has the
  prose; see "Pre-existing engine-invisible content" below).

**`HardwareCategoryEntry` (hardware.ts:74-81) — no missing
fields.** Category-level content from the docx (Category
Description, Unique Traits of the Category, Identifying Elements
Within the Category) is fully captured by the existing
`category_description`, `unique_category_traits`,
`identifying_elements?` fields. The `assessment_layer` field is
already engine-honored post-commit 222fe1d.

**Engine consumability note:** per
`engine-consumability-spec.md` §6, hardware type entries are NOT
in the upholstery LLM appendix path —
`wear_characteristics` and `cousin_contrasts` on hardware
entries would NOT surface to the engine via
`buildUpholsteryCanonicalAppendix` unless the entry sits inside
`hardware_category_upholstery_hardware` AND gains a parallel
`buildHardwareCanonicalAppendix` extension. Documentation-only
authoring until such an extension lands.
`diagnostic_caution_text` IS engine-consumed today via
`getCanonicalCautionText`; populating it on hardware entries
would be engine-immediate (same as the Block 20a finding for
fasteners).

## Pre-existing engine-invisible content / convention drift

Per `engine-consumability-spec.md` §2 — `getCanonicalCautionText`
reads only `diagnostic_caution_text`; the shared `caution_text`
field is unread.

### `caution_text` populated (engine-invisible drift): 1 entry

**`hardware_type_eastlake_brass_pull`** (hardware.ts:1854,
`caution_text` at line 1901) — a ~3-sentence appraiser-voice
warning paragraph (~860 characters) covering classification
contamination from Victorian-looking pulls, the
original-vs-reproduction distinguishing checklist, and the
fall-back to alteration-evidence use when a replacement is
identified. This is the highest-value `caution_text` content in
the hardware library (richer than the four joinery-side
`caution_text` entries that motivated the Block 19a cleanup).

**Remediation path:** rename the field from `caution_text` to
`diagnostic_caution_text`. Same Block 19-prep-style migration as
joinery commit 5948f55. This is the SINGLE
`caution_text`-vs-`diagnostic_caution_text` drift point in the
hardware library; the other 43 type entries do not populate
either field.

### `date_ceiling: 2030` legacy sentinel: 2 occurrences on 1 entry

Both inside `hardware_type_eastlake_brass_pull`:

| Line | Field | Value |
|------|-------|-------|
| 1883 | `period_associations[2].date_ceiling` | `2030` (period_label `"Reproduction and restoration hardware market"`) |
| 1891 | `style_associations[2].date_ceiling` | `2030` (style_label `"Colonial Revival or modern reproduction using Victorian-style hardware"`) |

Per `authoring-conventions.md` §"Open-ended ranges" and the
`entryShape.ts` lock at line 136-138: open-ended-to-present
windows should OMIT `date_ceiling`. The 2030 sentinel is a
Block 0.5c legacy holdover.

**Remediation:** drop `date_ceiling: 2030` from both
period_associations[2] and style_associations[2] on
`hardware_type_eastlake_brass_pull`. The period_label /
style_label / date_floor / usage_notes content survives
unchanged. This is the SINGLE source of the `2030` sentinel in
the hardware library; the other 43 type entries correctly omit
`date_ceiling` on open-ended periods.

### Three drifts above are concentrated on the same single entry

`hardware_type_eastlake_brass_pull` (Block 0.5c HCL-migration
orphan) carries:
1. `caution_text` instead of `diagnostic_caution_text` (1
   field rename needed).
2. Two `date_ceiling: 2030` sentinels (2 drops needed).
3. The `original_persistence: "high"` field is populated at
   line 1903 — `CanonicalEntry.original_persistence` is
   documented in `engine-consumability-spec.md` §6 as "Block
   0.5a addition; no consumer reads it yet." Authored but
   engine-invisible. Documentation-only.

A focused 1-entry cleanup commit (parallel to joinery
commit 5948f55) would fully resolve the 3 drift instances in
this library.

### "Arts & Crafts" vs "Arts and Crafts": NOT APPLICABLE

Neither the hardware docx nor the canonical hardware library
references the Arts and Crafts style. Style labels in
`style_associations` reference Federal/Hepplewhite, Empire/
Classical, Victorian Revival, Colonial Revival, Rococo,
Neoclassical/Sheraton, Eastlake, Late Victorian, Mid-Century
Modern, Art Deco, Machine-Age Industrial, Campaign, Gothic, and
Victorian. No "Arts and Crafts" reference in either source. No
drift to remediate.

### Date-range string conformance per `engine-consumability-spec.md` §1

Hardware library `date_range_summary` strings use the **ASCII
hyphen, no `c.` prefix** convention (vs fasteners + joinery
which use `"c. YYYY–YYYY"` en-dash with `c.` prefix). Examples:
- `"1750-present; especially common 1820-1910."`
- `"1840-1930 primary. Continued limited use afterward."`
- `"1700-1900 utility use."`
- `"1925-1945."`

Per `authoring-conventions.md` §"Date-range strings in
narrative fields" inconsistency #1: three patterns coexist
across libraries; hardware uses pattern 2 (ASCII hyphen). This
is **not engine-affecting** because `date_range_summary` is not
parsed by any engine consumer today — structured
`period_associations` carry the authoritative dates. The
hyphen-vs-en-dash convention drift is documentation-style only.

### `assessment_layer` field — declared and now engine-honored

Per the dual-assessment architecture (D-FA33-5 + D-HW35-7):
- 12 categories declare `assessment_layer: "frame"`.
- 1 category declares `assessment_layer: "upholstery"`
  (`hardware_category_upholstery_hardware`, hardware.ts:473).
- `HardwareTypeEntry` schema does NOT declare the field per
  type-level inheritance from parent category. Verified
  against schema (hardware.ts:134-164) and against the 3 types
  inside `hardware_category_upholstery_hardware`
  (`upholstery_tacks`, `decorative_nailhead_trim`,
  `coil_spring_hardware`) — none declare `assessment_layer`
  on their own entries; routing is achieved at the category
  tier.

The engine's `engineCategoryFor` honors `assessment_layer`
post-commit 222fe1d (the Block 20a follow-up fix). The
category-level override resolves correctly for hardware-side
upholstery routing. **This is the resolved Block 20a-class
engine-routing concern; hardware does not carry the silent
inoperative-`assessment_layer` issue that motivated Block 20a's
remediation for fasteners pair 2.**

## Missing canonical entries (docx has, canonical lacks)

**None.** Every docx entity has a canonical home:

- 10 top-level CATEGORY entries → 10 corresponding
  `hardware_category` entries (PULL HARDWARE, LOCK HARDWARE,
  ESCUTCHEONS, HINGE HARDWARE, CASTERS AND MOBILITY HARDWARE,
  CORNER AND EDGE HARDWARE, DESK AND MECHANICAL HARDWARE,
  UPHOLSTERY HARDWARE, SPECIALTY AND ERA-DIAGNOSTIC HARDWARE,
  MODERN SYNTHETIC HARDWARE).
- 34 specific TYPE / SUBTYPE entries → 34 corresponding
  `hardware_type` entries. The docx's nested SUBTYPE structure
  (e.g., DROP PULL has 3 subtypes Batwing / Chippendale /
  Sheraton Oval) is flattened in canonical via the D-HW36-8
  subtype-flattening pattern: each subtype becomes its own
  `hardware_type` entry with `related_hardware_types` FK
  linking back to the parent type (per D-HW35-3 — hardware
  library does NOT use a subcategory tier, unlike fasteners).

The docx HARDWARE EVIDENCE RULES + HARDWARE CONFLICT RULES +
HIGH-AUTHORITY HARDWARE OBSERVATIONS meta sections (lines
567-606) are correctly handled via the 5
`hardware_reasoning_rule` entries:
`hardware_alone_never_dates_furniture`,
`replacement_hardware_risk`, `rural_persistence`,
`reproduction_hardware_warning`,
`hardware_evidence_layer_independence`.

## Orphan canonical entries (canonical has, docx lacks)

**4 orphans** — 3 structure-recasting orphans (still backed by
docx content; just at a different tier) + 1 truly canonical-
novel orphan (HCL-migration addition).

### Structure-recasting orphans (3)

The docx organizes PULL HARDWARE as a single top-level category
with KNOB PULL / BIN PULL / RING PULL as SUB-SECTIONS inside it
(lines 14-180; the docx writes "BIN PULL" at line 146 as a
peer-of-DROP PULL heading inside the PULL HARDWARE category, not
as a separate top-level category). The canonical hardware library
recasts these three as separate top-level `hardware_category`
entries:

| Canonical category id | Docx structural position | Status |
|---|---|---|
| `hardware_category_knob_pull` (line 266) | Sub-section of PULL HARDWARE (docx line 88) | structural orphan; child types all match docx |
| `hardware_category_bin_pull` (line 287) | Sub-section of PULL HARDWARE (docx line 146) | structural orphan; child types all match docx |
| `hardware_category_ring_pull` (line 308) | Sub-section of PULL HARDWARE (docx line 169) | structural orphan; child types all match docx |

These are NOT content-novel — the four type entries under
KNOB PULL (turned wooden / porcelain / pressed glass /
depression glass), the two type entries under BIN PULL (bin
pull / cardholder bin pull), and the single type entry under
RING PULL (ring pull) all match docx subsections cleanly. The
canonical re-tiering elevates each from sub-section to top-level
category, presumably because the docx subsection-level content
(KNOB PULL, BIN PULL, RING PULL each have their own Description
/ Unique Traits / Identifying Characteristics / Date Range
sections) reads more like docx category-level content than like
docx type-level content.

This is a documented organizational choice (per D-HW35-3 + the
flat 2-tier hierarchy decision); no remediation needed.

### Content-novel orphan (1)

| Canonical type id | Source | Status |
|---|---|---|
| `hardware_type_eastlake_brass_pull` (line 1854) | Block 0.5c HCL migration from `lib/evidence.ts` HISTORICAL_CLUE_LIBRARY `eastlake_pull` key | Authored to preserve HCL specificity to incised brass pulls (1870-1890) as distinct from the broader `hardware_type_eastlake_hardware` (1870-1895 from the docx) |

This is the same orphan-pattern as joinery (Block 19a noted 4
HCL-migration orphans) and reflects the Block 0.5c HCL
preservation discipline. No docx remediation possible; the
hardware docx does not document this finer-grained subtype. The
entry is well-authored content-wise but is the source of all
three drift instances above (`caution_text`, two `date_ceiling:
2030` sentinels). See "Pre-existing engine-invisible content"
for the 1-entry-cleanup remediation path.

## Per-entry gaps

### Categories (10 docx → 10 matched canonical; all GOOD; +3 structural orphans)

| # | Canonical id | Docx § | Status | Notes |
|---|---|---|---|---|
| 1 | `hardware_category_pull_hardware` | PULL HARDWARE (line 14) | GOOD | All 3 docx fields captured (Category Description, Unique Traits 5-item list, Identifying Elements 10-item list); `assessment_layer: "frame"` |
| 2 | `hardware_category_lock_hardware` | LOCK HARDWARE (line 181) | GOOD | All 3 docx fields captured; `assessment_layer: "frame"` |
| 3 | `hardware_category_escutcheons` | ESCUTCHEONS (line 242) | GOOD | All 3 docx fields captured (with Unique Traits + Identifying Elements collapsed in the docx into a single combined area, but canonical captures both); `assessment_layer: "frame"` |
| 4 | `hardware_category_hinge_hardware` | HINGE HARDWARE (line 283) | GOOD | All 3 docx fields captured; `assessment_layer: "frame"` |
| 5 | `hardware_category_casters_and_mobility_hardware` | CASTERS AND MOBILITY HARDWARE (line 370) | GOOD | All 3 docx fields captured; `assessment_layer: "frame"` |
| 6 | `hardware_category_corner_and_edge_hardware` | CORNER AND EDGE HARDWARE (line 408) | GOOD | All 3 docx fields captured; `assessment_layer: "frame"` |
| 7 | `hardware_category_desk_and_mechanical_hardware` | DESK AND MECHANICAL HARDWARE (line 434) | GOOD | All 3 docx fields captured; `assessment_layer: "frame"` |
| 8 | `hardware_category_upholstery_hardware` | UPHOLSTERY HARDWARE (line 469) | GOOD | All 3 docx fields captured; `assessment_layer: "upholstery"` override per D-HW35-7; engine routing correct post-222fe1d |
| 9 | `hardware_category_specialty_and_era_diagnostic_hardware` | SPECIALTY AND ERA-DIAGNOSTIC HARDWARE (line 505) | GOOD | Category Description authored by canonical (docx has no explicit Category Description line for this section — only an enumeration of 4 era-types); Unique Traits + Identifying Elements composed from the 4 era-types' Unique Traits sections |
| 10 | `hardware_category_modern_synthetic_hardware` | MODERN SYNTHETIC HARDWARE (line 547) | GOOD | Same pattern as #9; Category Description authored by canonical (docx has no explicit Category Description for this section — only an enumeration of 2 polymer-types) |

Plus 3 structure-recasting orphans (see Orphan section):
`hardware_category_knob_pull` + `hardware_category_bin_pull` +
`hardware_category_ring_pull`. Each is GOOD on its own content
(matches docx PULL HARDWARE sub-section content) but is
structurally promoted from sub-section to top-level category.

### Types (34 docx → 34 matched canonical; all GOOD; +1 HCL orphan)

#### Sub-batch C-1: PULL HARDWARE (4 docx → 4 canonical types)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `hardware_type_drop_pull_bail_pull` | DROP PULL / BAIL PULL (line 33) | GOOD | 5-period multi-era period_associations capture all 5 docx waves (1680-1780 early, 1780-1820 Federal/Hepplewhite, 1810-1845 Empire/Classical, 1860-1910 Victorian, 1890-1940 Colonial Revival) |
| `hardware_type_batwing_bail_pull` | Subtype: Batwing Bail Pull (line 52) | GOOD | 2-period (original 1750-1790 + revival 1890-1940); FK to parent via related_hardware_types per D-HW36-8 |
| `hardware_type_chippendale_bail_pull` | Subtype: Chippendale Bail Pull (line 64) | GOOD | 2-period (original 1750-1785 + revival 1880-1935); FK to parent |
| `hardware_type_sheraton_oval_bail_pull` | Subtype: Sheraton Oval Bail Pull (line 76) | GOOD | 2-period (original 1790-1820 + revival 1890-1930); FK to parent |

#### Sub-batch C-2: KNOB PULL (4 docx → 4 canonical types)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `hardware_type_turned_wooden_knob` | Turned Wooden Knob (line 100) | GOOD | 2-period (1750-open continuous + 1820-1910 especially common); peak deployment era captured in usage_notes |
| `hardware_type_porcelain_knob` | Porcelain Knob (line 112) | GOOD | 1-period (1840-1930); "Continued limited use afterward" captured in usage_notes |
| `hardware_type_pressed_glass_knob` | Pressed Glass Knob (line 124) | GOOD | 2-period (1860-1925 primary + 1930-1959 revival); revival window from docx |
| `hardware_type_depression_glass_knob` | Depression Glass Knob (line 136) | GOOD | 1-period (1920-1945); tight Depression-era window |

#### Sub-batch C-3: BIN PULL (2 docx → 2 canonical types)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `hardware_type_bin_pull` | BIN PULL (line 146) | GOOD | 2-period (1890-open continuous + 1900-1940 peak early use) |
| `hardware_type_cardholder_bin_pull` | Subtype: Cardholder Bin Pull (line 160) | GOOD | 1-period (1890-1955); FK to parent |

#### Sub-batch C-4: RING PULL (1 docx → 1 canonical type)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `hardware_type_ring_pull` | RING PULL (line 169) | GOOD | 2-period (1700-open continuous + 1840-1900 Victorian/Gothic wave); 3 style_associations (Victorian + Gothic + Campaign) |

#### Sub-batch C-5: LOCK HARDWARE (4 docx → 4 canonical types)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `hardware_type_half_mortise_lock` | HALF-MORTISE LOCK (line 194) | GOOD | 1-period (1780-1920) |
| `hardware_type_full_mortise_lock` | FULL MORTISE LOCK (line 207) | GOOD | 1-period (1820-open) |
| `hardware_type_surface_mount_lock` | SURFACE-MOUNT LOCK (line 219) | GOOD | 1-period (1650-1850); rural-persistence captured in usage_notes + dedicated `regional_persistence_notes` field per D-HW36-9 (only entry with this field populated; canonical seed verbatim "Rural persistence later" anchor) |
| `hardware_type_cam_lock` | CAM LOCK (line 231) | GOOD | AG-1920 hardware-axis emergence (DIVERGES from fasteners + joinery cam-lock-connector 1960 AG per D-FA34-11 documented per-source-document divergence); cross-library FK to fastener_type_cam_lock_connector + joinery_type_knock_down_cam_lock_joinery |

#### Sub-batch C-6: ESCUTCHEONS (3 docx → 3 canonical types)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `hardware_type_pierced_escutcheon` | PIERCED ESCUTCHEON (line 254) | GOOD | 2-period (1750-1850 primary + 1880-1935 revival); 3 style_associations |
| `hardware_type_stamped_escutcheon` | STAMPED ESCUTCHEON (line 264) | GOOD | 1-period (1860-open mass die-stamping era) |
| `hardware_type_cast_escutcheon` | CAST ESCUTCHEON (line 273) | GOOD | 1-period (1700-open continuous use) |

#### Sub-batch C-7: HINGE HARDWARE (8 docx → 8 canonical types)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `hardware_type_butt_hinge` | BUTT HINGE (line 296) | GOOD | Parent type at 7/7; 1-period (1750-open); 2 subtypes flatten via related_hardware_types FK |
| `hardware_type_hand_forged_butt_hinge` | Hand-Forged Butt Hinge subtype (line 308) | GOOD | Subtype at 8/8 era-canonical (1750-1830 hand-forge era ceiling); FK to parent |
| `hardware_type_machine_made_butt_hinge` | Machine-Made Butt Hinge subtype (line 315) | GOOD | Subtype at 8/8 era-canonical (1840-open machine-precision); FK to parent |
| `hardware_type_h_l_hinge` | H-L HINGE (line 322) | GOOD | 2-period (1650-1820 primary + 1880-1940 Colonial Revival revival); revival wave authored per docx "Revival use later" prose |
| `hardware_type_strap_hinge` | STRAP HINGE (line 335) | GOOD | 1-period (1650-1900); medieval-origins context captured in usage_notes |
| `hardware_type_piano_hinge` | PIANO HINGE / CONTINUOUS HINGE (line 345) | GOOD | 1-period (1880-open); canonical id is `_piano_hinge` (drops the "/ CONTINUOUS HINGE" half but keeps it in `name`: "Piano Hinge / Continuous Hinge") |
| `hardware_type_butterfly_hinge` | BUTTERFLY HINGE (line 353) | GOOD | 1-period (1880-1940) |
| `hardware_type_concealed_euro_hinge` | CONCEALED EURO HINGE (line 361) | GOOD | AG-1960 hardware-axis emergence per D-HW36-N decade-range interpretation discipline (docx "1960s-present" → 1960 conservative decade-floor anchor); usage_notes captures the decade-range provenance |

#### Sub-batch C-8: CASTERS AND MOBILITY HARDWARE (3 docx → 3 canonical types)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `hardware_type_porcelain_caster` | PORCELAIN CASTER (line 381) | GOOD | 1-period (1840-1910 primary); soft-boundary era — NO AG per Q3 Option E; HCL migration notes preserved |
| `hardware_type_wooden_caster` | WOODEN CASTER (line 390) | GOOD | 1-period (1750-1850 primary) |
| `hardware_type_rubber_caster` | RUBBER CASTER (line 399) | GOOD | 1-period (1920-open); AG-1920 per D-HW36-4 + canonical seed verbatim "1920-present" |

#### Sub-batch C-9: CORNER AND EDGE HARDWARE (2 docx → 2 canonical types)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `hardware_type_campaign_corner_bracket` | CAMPAIGN CORNER BRACKET (line 418) | GOOD | 2-period (1800-1900 primary + 1900-1960 revival waves); Campaign style_association |
| `hardware_type_edge_strapping` | EDGE STRAPPING (line 427) | GOOD | 1-period (1700-1900 utility use) |

#### Sub-batch C-10: DESK AND MECHANICAL HARDWARE (3 docx → 3 canonical types)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `hardware_type_draw_leaf_support_hardware` | DRAW LEAF SUPPORT HARDWARE (line 444) | GOOD | 1-period (1700-open) |
| `hardware_type_tilt_top_lock_hardware` | TILT-TOP LOCK HARDWARE (line 453) | GOOD | 1-period (1750-1850) |
| `hardware_type_cylinder_desk_mechanism` | CYLINDER DESK MECHANISM (line 461) | GOOD | 1-period (1880-1930) |

#### Sub-batch C-11: UPHOLSTERY HARDWARE (3 docx → 3 canonical types; ALL 3 IN OVERLAP)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `hardware_type_upholstery_tacks` | UPHOLSTERY TACKS (line 480) | GOOD with OVERLAP | 1-period (1700-open); date_floor 1700 aligns with Block 20a reconciled fastener + upholstery sides; assessment_layer routing via parent category (post-222fe1d engine fix) — see Overlap section above |
| `hardware_type_decorative_nailhead_trim` | DECORATIVE NAILHEAD TRIM (line 489) | GOOD with OVERLAP | 1-period (1800-open); date_floor 1800 aligns with Block 20a reconciled fastener + upholstery sides — see Overlap section above |
| `hardware_type_coil_spring_hardware` | COIL SPRING HARDWARE (line 497) | GOOD with OVERLAP | 1-period (1850-open); date_floor 1850 from hardware docx; UPHOLSTERY-side library has 5 coil-spring entries with floors 1780/1800/1880/1880/1930 — DOCX-SOURCE ASYMMETRY surfaced new by this audit; recommended resolution = D-UC40-5 per-source-document fidelity precedent (status quo) |

#### Sub-batch C-12: SPECIALTY AND ERA-DIAGNOSTIC HARDWARE (4 docx → 4 canonical types)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `hardware_type_eastlake_hardware` | EASTLAKE HARDWARE (line 506) | GOOD | 1-period (1870-1895); tight era anchor; Eastlake style_association |
| `hardware_type_art_deco_hardware` | ART DECO HARDWARE (line 516) | GOOD | 1-period (1925-1945); Art Deco style_association |
| `hardware_type_mid_century_modern_hardware` | MID-CENTURY MODERN HARDWARE (line 526) | GOOD | 1-period (1945-1975); Mid-Century Modern style_association |
| `hardware_type_machine_age_industrial_hardware` | MACHINE-AGE INDUSTRIAL HARDWARE (line 536) | GOOD | 1-period (1900-1950); Machine-Age Industrial style_association |

#### Sub-batch C-13: MODERN SYNTHETIC HARDWARE (2 docx → 2 canonical types)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `hardware_type_bakelite_hardware` | BAKELITE HARDWARE (line 548) | GOOD | 1-period (1920-1955); polymer-industry production window; NO AG per Q3 Option E soft-boundary |
| `hardware_type_acrylic_lucite_hardware` | ACRYLIC/LUCITE HARDWARE (line 558) | GOOD | 2-period (1945-1975 peak + 1975-open continued); polymer-industry window |

#### Orphan (1 HCL-migration addition; not in docx)

| Canonical id | Source | Status | Notes |
|---|---|---|---|
| `hardware_type_eastlake_brass_pull` | Block 0.5c HCL migration (`evidence.ts` HISTORICAL_CLUE_LIBRARY `eastlake_pull` key) | ORPHAN (preserved HCL specificity) | 3-period (1870-1890 Eastlake-era + 1890-1900 Late Victorian persistence + 1900-2030 reproduction market); carries `caution_text` + 2 `date_ceiling: 2030` sentinels — see Pre-existing engine-invisible content section. Distinct from `hardware_type_eastlake_hardware` (broader category-level type) by specificity to BRASS PULLS with incised geometric ornament |

### Common gap pattern (applies to ALL 44 type entries)

- No `wear_characteristics` (schema field absent on
  `HardwareTypeEntry`). Docx itself has no per-type "Wear
  Indicators" subsection, but the HIGH-AUTHORITY HARDWARE
  OBSERVATIONS meta section (lines 591-606) provides 14
  cross-cutting wear / continuity observations that would
  author cleanly into per-type arrays via curated extrapolation.
- No `cousin_contrasts` (schema field absent). Docx itself has
  no per-type "Cousin Contrasts" subsection. Authoring would
  be primary-source-extrapolation with anchor support from the
  HARDWARE CONFLICT RULES meta section (lines 583-590; 6
  explicit cousin-confusion vectors).
- No `diagnostic_caution_text` (schema field absent on type
  entries; field present on shared `CanonicalEntry` as
  `caution_text` but engine reads ONLY
  `diagnostic_caution_text`). Engine-relevant gap — the field
  IS engine-consumed via `getCanonicalCautionText`, so adding
  it on `HardwareTypeEntry` would be immediately useful.
  Authoring candidates (where reproduction-warning prose is
  currently buried in `notes`): `eastlake_hardware`,
  `batwing_bail_pull`, `chippendale_bail_pull`,
  `concealed_euro_hinge`, `eastlake_brass_pull` (the last
  already populates `caution_text` — first migration target).

### Common-pattern non-gap (NOT flagged)

- `description` is consistently short and faithful (often a
  one-clause echo of the docx Description section).
- `unique_traits` and `identifying_characteristics` use
  sentence-case noun phrases without terminal periods —
  internally consistent and matches the established
  cross-library convention.
- `period_associations` are well-formed for engine consumption:
  every entry has at minimum `date_floor` populated;
  multi-period decomposition is used appropriately to preserve
  nuance (5-period for drop_pull_bail_pull; 2-period for
  Colonial Revival revival waves on batwing/chippendale/sheraton
  pulls and pierced escutcheons; 2-period for upholstery
  hand-tack continuous-use modeling).
- `anti_classification_guidance` is populated on every
  industrial-introduction-boundary type: Cam Lock 1920, Rubber
  Caster 1920, Concealed Euro Hinge 1960. Three AG entries per
  D-HW36-4 (vs Q3 Option E soft-boundary types like Porcelain
  Caster + Bakelite + Acrylic/Lucite which correctly carry NO
  AG).
- `related_hardware_types` cross-FKs are populated on the 6
  subtype entries per D-HW36-8 subtype-flattening (3 children
  of drop_pull_bail_pull + 2 children of butt_hinge + 1 child
  of bin_pull).
- `related_fastener_types` + `related_joinery_types`
  cross-library FKs are populated on `hardware_type_cam_lock`
  (both) and `hardware_type_upholstery_tacks` (fastener only)
  per D-HW36-7.
- `regional_persistence_notes` is populated on
  `hardware_type_surface_mount_lock` (the only canonical
  hardware type with explicit verbatim "Rural persistence"
  reference in the docx) per D-HW36-9 strict canonical
  fidelity.

## Summary of remediation tasks (priority order)

1. **MEDIUM (1-entry-cleanup; parallel to joinery
   commit 5948f55):** Migrate
   `hardware_type_eastlake_brass_pull` drift (1 commit):
   rename `caution_text` → `diagnostic_caution_text` (1 field
   rename; the field is engine-consumed today, so the rename
   makes the existing rich caution prose engine-visible
   immediately); drop both `date_ceiling: 2030` sentinels
   (period_associations[2] + style_associations[2]) per
   `entryShape.ts` omit-means-present convention. This is the
   only entry in the library carrying any of the three drift
   classes; the cleanup is bounded.

2. **MEDIUM (schema extension + immediate engine benefit;
   parallel to Block 20a recommendation):** Add
   `diagnostic_caution_text?: string` to `HardwareTypeEntry`.
   Populate on the 4-5 heavily-reproduced hardware types per
   the docx Hardware Conflict Rules canonical anchors
   (`eastlake_hardware`, `batwing_bail_pull`,
   `chippendale_bail_pull`, `concealed_euro_hinge`,
   `eastlake_brass_pull`). Field IS engine-consumed today via
   `getCanonicalCautionText`; population would surface
   reproduction-warning prose into dating-support arrays
   immediately.

3. **LOW (schema extension + future engine consumer;
   parallel to Block 20a):** Add
   `wear_characteristics?: string[]` and
   `cousin_contrasts?: string[]` to `HardwareTypeEntry`. Both
   are documentation-only until a parallel
   `buildHardwareCanonicalAppendix` is added. Content would
   need primary-source-extrapolation authoring from the docx
   HIGH-AUTHORITY HARDWARE OBSERVATIONS + HARDWARE CONFLICT
   RULES meta sections (lines 583-606 provide cross-cutting
   anchors rather than per-type content).

4. **LOW (overlap object 3 awareness; no remediation
   required):** Document the
   `hardware_type_coil_spring_hardware` (1850) vs upholstery-
   library 5-entry coil-spring spread (1780/1800/1880/1880/
   1930) docx-source asymmetry as a NEW per-source-document
   divergence under the D-UC40-5 precedent. Optional: add
   cross-library FK fields (`related_upholstery_construction
   _types` on `HardwareTypeEntry`; back-references on
   `UpholsteryConstructionTypeEntry` for the 5 coil-spring
   entries pointing to `hardware_type_coil_spring_hardware`).
   No engine impact.

5. **LOW (replacement_likelihood cross-library asymmetry;
   awareness only):** Hardware-side `upholstery_tacks` and
   `decorative_nailhead_trim` declare
   `replacement_likelihood: "high"` while upholstery-side
   cousins declare `"medium"`. Non-blocking and unreached
   today (the hardware-side type entries are not in
   `CLUE_TO_CANONICAL`); decision deferred until cross-library
   originality inference lands.

6. **NIL (no remediation needed):** No `caution_text` drift
   on 43 of 44 type entries (only `eastlake_brass_pull`); no
   `date_ceiling: 2030` sentinels on 43 of 44 type entries; no
   Arts-and-Crafts naming references at all. The
   `assessment_layer` engine-routing issue that motivated
   Block 20a is RESOLVED for the hardware library by the same
   commit 222fe1d fix that resolved it for fasteners.
