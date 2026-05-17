# Block 22a: Wood Identification Canonical ↔ Docx Audit

Generated against `/tmp/wood-identification-clean.md` (extracted from
`Wood_identification_reference.docx`; 2780 lines: 6 top-level CATEGORY
entries — CATEGORY I/II/III/IV natural-species families, CATEGORY V
secondary/utility/substrate woods, CATEGORY VI figure/cut/grain
phenomena — plus 4 nested CATEGORY VI sub-categories VI-A through VI-E)
and canonical `lib/constraints/woodIdentification.ts`
(4 `wood_category` + 35 `wood_species` (with nested `WoodSubspecies`) +
5 `engineered_substrate` + 26 `cut_grain_phenomenon` = 70 top-level
entries).

Fifth library audit after Block 18 (upholstery), Block 19a (joinery),
Block 20a (fasteners), Block 21a (hardware). Wood identification is the
PREREQUISITE for the parallel Block 22 wood-evidence audit — the app
must IDENTIFY species before it can USE species as dating evidence.

## Summary

- **Docx entities audited (per-type bucket):**
  - 4 top-level natural-wood CATEGORY entries (CATEGORY I — Ring-Porous
    Hardwoods, II — Diffuse-Porous Hardwoods, III — Softwoods/Conifers,
    IV — Tropical Hardwoods/Imported Exotics).
  - 1 top-level meta-category CATEGORY V — Secondary/Utility/Substrate
    Woods. Functions as a structural umbrella over both natural
    secondary species AND engineered substrates; not represented as a
    `wood_category` canonical entry today (see "Pre-existing
    organisational decisions" below).
  - 1 top-level meta-category CATEGORY VI — Figure, Cut, and Grain
    Phenomena (with 5 docx sub-categories VI-A through VI-E). Not
    represented as a `wood_category` canonical entry; each phenomenon
    becomes its own `cut_grain_phenomenon` entry under the
    `CUT_GRAIN_PHENOMENA` array.
  - 25 "Species Group" entries (5 in CAT I, 9 in CAT II, 8 in CAT III,
    11 in CAT IV, 11 in CAT V) — but CAT V splits roughly into
    5 natural-species "Species Group V-A" through "V-E" PLUS 6
    engineered-substrate "Species Group V-F" through "V-K" that the
    canonical correctly migrates from "Species Group" → either
    natural-species (5) or engineered-substrate (5 — V-F plywood, V-G
    particleboard, V-H MDF, V-I hardboard/masonite, V-J composite
    veneer cores; V-K Veneer Substrates is a meta-discussion section,
    not an entry — see Orphan section).
  - 10 nested "Subspecies" entries (I-A-1 White Oak, I-A-2 Red Oak,
    II-A-1 Black Walnut, II-B-1 Black Cherry, II-C-1 Hard Maple/Sugar
    Maple, II-C-2 Soft Maple, II-D-1 Honduran Mahogany, II-D-2 Cuban
    Mahogany, III-A-1 Eastern White Pine, III-A-2 Southern Yellow
    Pine, III-B-1 Eastern Red Cedar, IV-A-1 Brazilian Rosewood) — 12
    by accurate count; canonical captures all 12 as `WoodSubspecies`
    nested inside parent `WoodSpeciesEntry`.
  - 26 "Type" / "Figure Variant" entries under CATEGORY VI (4 VI-A
    cut-orientation, 8 VI-B natural-figure, 2 VI-C ray-cellular, 5 VI-D
    veneer-slicing, 1 VI-E chatoyance) plus 4 species-localized "Figure
    Variants" embedded inside species sections (Pumpkin Pine under
    Eastern White Pine, Heart Pine under Southern Yellow Pine, Pecky
    Cypress under Cypress, Bear Claw Spruce under Spruce). Canonical
    correctly hoists each of these 4 species-localized figure variants
    to top-level `cut_grain_phenomenon` entries.
  - Total docx entities audited: **4 categories + 25 species groups +
    12 subspecies + 26 figure types + 4 species-localized figure
    variants = 71** addressable entities.

- **Canonical entries audited:** 70 top-level (4 `wood_category` + 35
  `wood_species` containing 12 `WoodSubspecies` + 5
  `engineered_substrate` + 26 `cut_grain_phenomenon`). The 12
  subspecies are nested rather than top-level per the
  `WoodSubspecies` pattern (parallel to `FormSubtype` on FormEntry).
  - Note: the Block 22a prompt anticipated `5 wood_category entries +
    36 wood_species + 27 cut_grain_phenomenon + 6 engineered_substrate
    = 74`. The grep counts that produced those figures pick up the
    TypeScript `interface` field declarations (`category:
    "wood_category";` etc.), which inflate each bucket by 1. Actual
    canonical content is **4 + 35 + 26 + 5 = 70**. Same off-by-one
    pattern observed in Blocks 19a, 20a, 21a.

- **Matched pairs:** **63 of 71 docx entities matched** (89% coverage
  on docx entities).
  - 4 of 4 docx natural-wood CATEGORY entries → 4 `wood_category`
    canonical entries (100%).
  - 0 of 2 docx meta-categories (CAT V + CAT VI) → 0 canonical
    `wood_category` entries (intentional architectural decision; see
    "Pre-existing organisational decisions" below).
  - 24 of 25 docx Species Group entries → 24 `wood_species` or
    `engineered_substrate` canonical entries (96%). The lone unmatched
    entity is CAT V Species Group V-K "Veneer Substrates" (a meta
    enumeration / discussion section, not a true species entry — see
    Orphan section).
  - 12 of 12 docx Subspecies entries → 12 `WoodSubspecies` nested in
    parent species entries (100%).
  - 26 of 26 docx CATEGORY VI Type / Figure Variant entries →
    26 `cut_grain_phenomenon` canonical entries (100%).
  - 4 of 4 docx species-localized Figure Variant entries (Pumpkin Pine,
    Heart Pine, Pecky Cypress, Bear Claw Spruce) → 4
    `cut_grain_phenomenon` canonical entries hoisted to top level
    (100%).
- **Docx entities with NO canonical match: 3** — see Missing section.
  - CAT V meta-category (1) and CAT VI meta-category (1): both
    structural orphans handled by alternative architectural patterns,
    not authoring gaps. The CATEGORY V "Critical Diagnostic
    Principles" and "Common Historical Patterns" meta content (lines
    2150-2226) maps to wood_evidence_reasoning rules on the evidence
    side, not to identification-side content.
  - CAT V-K Veneer Substrates (1): docx meta-enumeration section
    pointing at existing secondary-wood species rather than a true
    distinct entry.
- **Canonical entries with NO docx match (orphan canonical entries):
  3** — all in `CUT_GRAIN_PHENOMENA`:
  - `cut_grain_phenomenon_hand_sawn_veneer` (line 3146) — Block 0.5c
    HCL-migration addition; not in the wood docx but supports
    paired-diagnostic decomposition per Block 0.5c D-PH3HCL-S3-N.
  - `cut_grain_phenomenon_radial_matching` (line 3237) — covers
    docx CAT V-K "Radial Veneers" sub-bullet (line 2146) but elevated
    to dedicated phenomenon entry; documentation-only hoist.
  - `cut_grain_phenomenon_veneer_thickness` (line 3290) — Block 0.5c
    HCL-migration addition; not in the docx CATEGORY VI list but
    supports the docx "Veneer Thickness Matters" meta-rule (line
    2176). **THIS IS THE SOLE ENTRY CARRYING ALL THREE PRE-EXISTING
    DRIFT CLASSES IN THE LIBRARY** (caution_text + date_ceiling: 2030
    + a broken FK to nonexistent `wood_species_birdseye_maple`). See
    "Pre-existing engine-invisible content" below.
- **Fiddleback Figure (docx Type VI-B-6)**: docx-listed but NOT
  authored as a dedicated canonical entry. Canonical
  `cut_grain_phenomenon_curly_figure` (line 2616) folds Fiddleback
  into its `common_aliases` rather than as a separate phenomenon
  entry (see Per-entry gaps section for verification). This is a
  borderline match — flagged here for Mike's review but treated as
  GOOD with alias-fold caveat below.

- **Species entries missing `wear_characteristics` (schema field
  absent on `WoodSpeciesEntry`, `EngineeredSubstrateEntry`,
  `CutGrainPhenomenonEntry`, `WoodCategoryEntry`):** **70 / 70** (all
  entries; schema does not declare the field on ANY of the four
  identification-library entry interfaces). Same gap pattern as Block
  19a/20a/21a.

- **Species entries missing `diagnostic_caution_text` (schema field
  absent on identification-library entries; engine consumes ONLY
  `diagnostic_caution_text` per `engine-consumability-spec.md` §2):**
  **70 / 70**. The schema field is declared on the
  `wood_species_evidence` / `cut_grain_evidence` /
  `substrate_evidence` evidence-side interfaces (woodEvidence.ts
  lines 295, 354, 404) — and IS heavily populated on the
  woodEvidence-side entries — but is NOT declared on
  identification-side interfaces.

- **Entries with `caution_text` populated (engine-invisible drift per
  `engine-consumability-spec.md` §2):** **1 entry** —
  `cut_grain_phenomenon_veneer_thickness` (line 3350). Rich
  ~750-character appraiser-voice warning paragraph distinguishing
  thick veneer from solid wood / edge banding / plywood face plies /
  laminated construction / repair patches; warns against using
  thickness alone to identify cut method. Engine
  `getCanonicalCautionText` returns null because the field is named
  `caution_text` not `diagnostic_caution_text`.

- **Entries with `date_ceiling: 2030` legacy sentinel:** **1
  occurrence on 1 entry** — same entry, line 3339, inside
  `period_associations[2]` ("Modern thin-veneer dominance with
  thick-veneer exceptions"). All 38 other open-ended period
  associations in the library correctly omit `date_ceiling` per the
  `entryShape.ts` lock at line 136-138.

- **Entries with "Arts & Crafts" ampersand: 16** (all in
  `woodIdentification.ts` per the cross-library inconsistency noted in
  `authoring-conventions.md` §"Style-name spelling" inconsistency #3).
  Per the established cross-library pattern, non-upholstery libraries
  use the ampersand form; this is NOT drift relative to the canonical
  convention for this library, only inconsistent with the upholstery
  libraries. Matches the docx source (which uses `&amp;` for `&`
  throughout — 17 docx instances).

- **Entries with dating drift between docx and canonical: 0** among
  the 60 docx-matched species/subspecies/phenomenon entries.
  Canonical dates faithfully echo docx "Common Time Periods" tables.

Status distribution for the 25 docx-matched **species group** entries
(natural species only, excluding the 5 substrate Species Groups):
GOOD = 20, PARTIAL = 0, MAJOR = 0 with respect to the docx content.
The 5 substrate Species Groups (V-F through V-J) are GOOD with
architectural-tier-shift handling (Species Group → engineered_substrate
top-level array).

Status distribution for the 12 **subspecies** entries: GOOD = 12,
PARTIAL = 0, MAJOR = 0.

Status distribution for the 26 docx-matched **CATEGORY VI Type** entries
(20 docx VI-A through VI-E Type entries + 4 species-localized Figure
Variants + ... see notes): GOOD = 25, PARTIAL = 1 (Fiddleback fold),
MAJOR = 0.

Status distribution for the 4 **wood_category** entries: GOOD = 4
(all docx Category Description + Unique Traits + Identifying Elements
sections are captured by the corresponding canonical fields:
`description`, `shared_identifying_traits`,
`primary_diagnostic_indicators`).

## ★ CROSS-LIBRARY PARITY WITH woodEvidence.ts ★

The wood domain is the ONLY library family with a TWO-FILE split
between identification (this audit's `woodIdentification.ts`) and
evidence (parallel `woodEvidence.ts`, deferred to Block 22 main).
Mike's prompt language ("the app must IDENTIFY species before USING
species as evidence") frames identification as the prerequisite. This
section surfaces the parity gaps and naming drift for Mike's review;
no reconciliation is attempted in this audit.

### Counts table

| Bucket | Identification side (this audit) | Evidence side (Block 22 main) | Delta |
|---|---|---|---|
| Categories | 4 `wood_category` | 0 (no evidence-side category tier) | -4 evidence |
| Top-level species | 35 `wood_species` | 20 `wood_species_evidence` (top-level only; ignoring 6 promoted subspecies) | -15 evidence |
| Subspecies | 12 `WoodSubspecies` (nested) | 6 promoted to top-level `wood_species_evidence` entries with `subspecies` prefix | -6 nesting drift |
| Substrates | 5 `engineered_substrate` | 5 `substrate_evidence` | 0 |
| Cut/grain phenomena | 26 `cut_grain_phenomenon` | 36 `cut_grain_evidence` | +10 evidence |
| Diagnostic signal entries | (none) | 8 `wood_diagnostic_signal` | n/a (evidence-side only) |
| Reasoning rules | (none) | 7 `wood_evidence_reasoning_rule` | n/a |
| **TOTAL** | 70 (this library) | 82 (evidence library) | +12 evidence |

### Naming / ID drift

Consistent prefix-swap pattern between the two libraries:

| Identification-side id pattern | Evidence-side id pattern |
|---|---|
| `wood_category_*` | (no equivalent — evidence side has no category tier) |
| `wood_species_*` | `wood_species_evidence_*` |
| `wood_subspecies_*` (nested in parent species) | `wood_subspecies_evidence_*` (promoted to top level) |
| `engineered_substrate_*` | `substrate_evidence_*` |
| `cut_grain_phenomenon_*` | `cut_grain_evidence_*` |

No id-level naming surprises beyond the consistent prefix swap. The
nesting-vs-promotion architectural drift on subspecies (identification
nests; evidence promotes) is documented but not necessarily wrong —
the evidence side promotes subspecies to top level so that they can
carry their own period/regional content as engine-consumed period
associations, while identification keeps them nested to match the
docx "Subspecies I-A-1" hierarchy.

### Species in identification with NO evidence-side parallel (15)

Top-level species authored in `woodIdentification.ts` that lack a
corresponding `wood_species_evidence_*` entry in `woodEvidence.ts`:

| Identification id | Evidence-side absence reason (likely) |
|---|---|
| `wood_species_sycamore_group` | Niche show wood; evidence-side coverage may have been deferred. Docx Species Group II-I authors a full entry. |
| `wood_species_douglas_fir` | Industrial / construction wood with limited furniture-dating diagnostic value; evidence side may have de-prioritized. |
| `wood_species_cypress` | Pecky cypress phenomenon (canonical-side `cut_grain_phenomenon_pecky_cypress`) IS evidence-relevant for Florida/Gulf-region furniture, but the species itself lacks evidence-side parity. |
| `wood_species_spruce` | Bear claw spruce phenomenon IS evidence-relevant for piano cases / studio furniture, but the species lacks evidence-side parity. |
| `wood_species_hemlock` | Secondary wood; evidence-side coverage deferred. |
| `wood_species_juniper_cedar_like_softwoods` | Catch-all class; evidence-side may have folded into cedar_group. |
| `wood_species_tulipwood` | Tropical exotic; evidence-side coverage deferred. |
| `wood_species_kingwood` | Tropical exotic; evidence-side coverage deferred. |
| `wood_species_padauk` | Tropical exotic; evidence-side coverage deferred. |
| `wood_species_palisander` | Tropical exotic; evidence-side coverage deferred. |
| `wood_species_purpleheart` | Tropical exotic; evidence-side coverage deferred. |
| `wood_species_olivewood` | Tropical exotic; evidence-side coverage deferred. |
| `wood_species_aspen` | Secondary/utility wood; evidence-side coverage deferred. |
| `wood_species_cottonwood` | Secondary/utility wood; evidence-side coverage deferred. |
| `wood_species_lauan_philippine_mahogany` | Important mid-century dating signal (Asian export ply / 1950s+ "Philippine mahogany" mass-market) — evidence-side absence is a NOTABLE GAP for Block 22 main remediation. |

Net: identification-side authoring is MORE COMPLETE than evidence-side
authoring on natural species. This is expected per the Block 22
sequencing (identification first, evidence second), and the 15
missing evidence-side entries should be evaluated for Block 22 main's
authoring backlog.

### Cut/grain phenomena: evidence has 10 MORE entries than identification

Cut-grain phenomena present in `woodEvidence.ts` that have NO direct
identification-side parallel:

| Evidence-side id | Identification-side equivalent | Status |
|---|---|---|
| `cut_grain_evidence_quarter_sawn_white_oak` | (no compound entry) | Identification side decomposes: `cut_grain_phenomenon_quarter_sawn` + `wood_subspecies_white_oak` |
| `cut_grain_evidence_burl_walnut` | (no compound entry) | Identification: burl + walnut_group |
| `cut_grain_evidence_crotch_walnut` | (no compound entry) | Identification: crotch_figure + walnut_group |
| `cut_grain_evidence_curly_maple` | (no compound entry) | Identification: curly_figure + maple_group |
| `cut_grain_evidence_birdseye_maple` | (no compound entry) | Identification: birdseye + maple_group |
| `cut_grain_evidence_crotch_mahogany` | (no compound entry) | Identification: crotch_figure + mahogany_group |
| `cut_grain_evidence_flame_mahogany` | (no compound entry) | Identification: flame_figure + mahogany_group |
| `cut_grain_evidence_ribbon_stripe_mahogany` | (no compound entry) | Identification: ribbon_stripe + mahogany_group |
| `cut_grain_evidence_burl_redwood` | (no compound entry) | Identification: burl + redwood |
| `cut_grain_evidence_quarter_sawn_sycamore` | (no compound entry) | Identification: quarter_sawn + sycamore_group |
| `cut_grain_evidence_crotch_rosewood` | (no compound entry) | Identification: crotch_figure + rosewood_group |
| `cut_grain_evidence_ribbon_stripe_rosewood` | (no compound entry) | Identification: ribbon_stripe + rosewood_group |
| `cut_grain_evidence_ribbon_stripe_teak` | (no compound entry) | Identification: ribbon_stripe + teak |
| `cut_grain_evidence_crotch_satinwood` | (no compound entry) | Identification: crotch_figure + satinwood_group |
| `cut_grain_evidence_heart_pine` | `cut_grain_phenomenon_heart_pine` ✓ | Both present — only species-localized phenomenon with full parity |
| `cut_grain_evidence_zebrawood_veneer` | (no compound entry) | Identification: zebrawood (no separate phenomenon) |
| `cut_grain_evidence_thick_veneer` | `cut_grain_phenomenon_veneer_thickness` ✓ | Both present; identification side has the `caution_text` drift |

Pattern: the evidence side authors **17 species-specific compound
phenomena** (e.g., "quarter-sawn white oak" as a single
period-conditioned entry); identification side decomposes the same
content into **base phenomenon × applicable species FK** structure (the
`cut_grain_phenomenon.applicable_species` array on identification side
carries the cross-references). Both patterns are defensible:
- Evidence side: each compound entry can carry its own
  diagnostic_caution_text + period_associations envelope for engine
  filter logic (e.g., quarter-sawn white oak's tight Mission/Arts &
  Crafts window is distinct from quarter-sawn oak more broadly).
- Identification side: decomposed shape supports the Phase 3 engine
  intersection logic (species period band ∩ phenomenon period band)
  rather than pre-computing the compound period envelope.

### Phenomena in identification with NO evidence-side parallel (6)

| Identification id | Evidence-side absence reason |
|---|---|
| `cut_grain_phenomenon_pumpkin_pine` | Aged-patina phenomenon under Eastern White Pine; evidence side may have deferred or folded into pine_group dating. |
| `cut_grain_phenomenon_pecky_cypress` | Florida/Gulf-region cypress fungal phenomenon; evidence side absence parallels cypress species absence above. |
| `cut_grain_phenomenon_bear_claw_spruce` | Piano case / studio furniture spruce phenomenon; evidence side absence parallels spruce species absence above. |
| `cut_grain_phenomenon_quarter_sliced_veneer` | Sub-type of veneer slicing; evidence side may have folded into quarter_sawn evidence. |
| `cut_grain_phenomenon_radial_matching` | Veneer layout method; evidence side has bookmatching + slip_matching but not radial. |
| `cut_grain_phenomenon_veneer_thickness` | Same compound covered by evidence `cut_grain_evidence_thick_veneer` (parity exists; not actually a gap). |

True identification-only phenomena (no evidence-side equivalent at all,
not even via compound entries): **5** (pumpkin_pine, pecky_cypress,
bear_claw_spruce, quarter_sliced_veneer, radial_matching).

### Cross-library parity summary

- Identification side is the BROADER coverage on species: 15
  identification species lack evidence-side parity (most notably
  `wood_species_lauan_philippine_mahogany` which IS dating-relevant).
- Evidence side is the BROADER coverage on cut-grain: 17 compound
  species×phenomenon entries on evidence side have no direct
  identification-side counterpart but ARE addressable via base
  phenomenon × applicable_species FK.
- Substrate count is identical (5↔5) with consistent prefix-swap
  naming.
- Identification side has a CATEGORY tier (4 entries); evidence side
  has none. Identification side has nested subspecies; evidence side
  promotes subspecies to top level. Both are intentional architectural
  patterns documented in the docstrings.
- The wood domain's TWO-LIBRARY split is unique among canonical
  libraries (joinery / fastener / hardware / upholstery are all
  single-library). Mike should review whether the 15-species
  evidence-side gap reflects authoring debt or intentional
  scope-limiting for the evidence library to high-frequency dating
  species only.

## Schema extension required (parallel to Block 17 + 19 + 20 + 21)

Block 17 added `wear_characteristics?: string[]` and
`cousin_contrasts?: string[]` to upholstery types. Block 19a/20a/21a
flagged the parallel gap on joinery/fastener/hardware types. The wood
identification library carries the **same** gap, with one nuance: the
`cousin_*_contrasts` family of fields IS already populated
extensively on this library (see "Per-entry gaps — common-pattern
non-gap" below), so only `wear_characteristics` is the true
extension target on identification-side entries.

### `WoodSpeciesEntry` (woodIdentification.ts:182-290) — fields to add

- **`wear_characteristics?: string[]`** — wood species wear is
  observable in canonical-source-quality ways: oxidation patterns
  (red oak's pinkish oxidation vs white oak's olive-brown; pine's
  pumpkin-orange aging; cherry's deep red darkening), patina
  development (walnut's chocolate darkening; mahogany's deep amber),
  surface wear (open-pore filling and refinish behavior; ray fleck
  obscuration through finish layering), and species-specific
  oxidation signatures referenced obliquely in the docx Identifying
  Elements sections. The docx itself does not author dedicated "Wear
  Indicators" subsections per species, but the cross-species
  "Critical Diagnostic Principles" meta sections (CAT V "Secondary
  Woods Often Carry Higher Dating Authority" line 2151; CAT VI
  "Figure Alone Should Not Date Furniture" line 2740) provide
  cross-cutting wear-class anchors. Authoring discipline: short
  noun-phrase observations, capitalized first word, no terminal
  period — matches established `identifying_elements` casing.

- **`diagnostic_caution_text?: string`** — engine consumes ONLY
  `diagnostic_caution_text` per `engine-consumability-spec.md` §2
  `getCanonicalCautionText`. `WoodSpeciesEntry` does not declare the
  field today. This is a particularly salient gap because:
  1. The docx contains rich appraiser-voice diagnostic-caution prose
     under "Diagnostic Notes" subsections on several CATEGORY VI Type
     entries (line 2322 flat-sawn caveat, line 2352 quarter-sawn
     Mission marker, line 2431 burl decorative-emphasis warning, line
     2550 spalting modern-only warning, line 2597 ray fleck Mission
     marker, line 2643 rotary veneer modern-factory warning).
  2. The `cut_grain_phenomenon_veneer_thickness` entry already
     populates `caution_text` (engine-invisible) — first migration
     target with rich content already in place.
  3. The evidence-side library (`woodEvidence.ts`) has
     `diagnostic_caution_text` DECLARED on `WoodSpeciesEvidenceEntry`
     /`CutGrainEvidenceEntry` / `SubstrateEvidenceEntry` interfaces
     and POPULATES it on every entry (~50 caution paragraphs). The
     identification-side parallel field would let identification-only
     entries (the 15 species without evidence-side parity) surface
     their own caution prose without depending on evidence-side
     authoring.

### `EngineeredSubstrateEntry` (woodIdentification.ts:299-418) — same field additions

- **`wear_characteristics?: string[]`** — substrate wear is engine-
  consumable: MDF moisture damage swelling, particleboard fastener
  pull-out, plywood ply delamination, masonite face wear, composite
  veneer core edge chip patterns. The docx CAT V Species Groups V-F
  through V-J carry brief identifying-element prose for substrate
  recognition but not dedicated wear subsections.

- **`diagnostic_caution_text?: string`** — strong authoring candidate
  for substrate entries because substrate IS the strongest
  chronological anchor evidence in the wood domain per the docx
  "Engineered Materials Are Chronological Anchors" meta section
  (line 2163-2173: MDF post-1970, particleboard post-1950, plywood
  carcass post-1945, masonite post-1930). Each substrate entry could
  carry an authoritative diagnostic_caution paragraph about
  back-classification risk.

### `CutGrainPhenomenonEntry` (woodIdentification.ts:428-534) — same field additions

- **`wear_characteristics?: string[]`** — phenomenon wear is engine-
  consumable for specific cases: spalting darkening / fading
  behavior; chatoyance attenuation through finish layering; burl
  veneer lift / shrinkage cracking; ray fleck obscuration under heavy
  refinish; rotary-cut veneer face-grain checking patterns.

- **`diagnostic_caution_text?: string`** — strongest field for this
  interface. The docx CATEGORY VI "Diagnostic Notes" subsections
  (lines 2322, 2352, 2431, 2550, 2597, 2643) author dedicated
  appraiser-voice caution prose that the canonical does not yet
  capture. **The
  `cut_grain_phenomenon_veneer_thickness.caution_text` migration
  target is ready** (~750 characters of rich prose already authored;
  only the field rename is needed).

### `WoodCategoryEntry` (woodIdentification.ts:46-91) — no missing fields

Category-level content from the docx (Category Description, Unique
Traits, Identifying Elements) is fully captured by existing
`description`, `shared_identifying_traits`,
`primary_diagnostic_indicators` fields. The Block 17
`cousin_category_contrasts?` field IS declared and IS populated on
all 4 category entries (lines 566, 600, 637, 673). No additional
fields needed at the category tier.

### `WoodSubspecies` (woodIdentification.ts:121-175) — same gap as parent

The nested `WoodSubspecies` interface also lacks
`wear_characteristics` and `diagnostic_caution_text`. White Oak vs
Red Oak diagnostic-caution prose (regarding back-classification
between subspecies; pink oxidation vs olive-brown oxidation as
chronological-region anchor) would author cleanly into subspecies-
level `diagnostic_caution_text` if the field were added.

### Engine consumability note

Per `engine-consumability-spec.md` §6, wood identification entries
are NOT in the upholstery LLM appendix path. `wear_characteristics`
and `cousin_*_contrasts` on wood identification entries would be
DOCUMENTATION-ONLY until a parallel `buildWoodCanonicalAppendix` is
added. By contrast, `diagnostic_caution_text` IS engine-consumed
TODAY via `getCanonicalCautionText`, so populating it on wood
identification entries would be engine-immediate IF the entry is
referenced via a `CLUE_TO_CANONICAL` mapping (today: cedar_lining,
plywood_structural, plywood_drawer_bottom routes via the canonical
wood substrate entries; no natural-species wood identification entries
have direct `CLUE_TO_CANONICAL` mappings — the natural-species engine
side is wholly evidence-library-routed today).

The practical implication: schema-extending `WoodSpeciesEntry` and
populating `diagnostic_caution_text` on the 15 species without
evidence-side parity would NOT immediately benefit the engine because
those species lack engine clue routing. The schema extension is
forward-looking authoring discipline for when (a) the evidence-side
authoring catches up, or (b) Phase 3 engine reasoning lands.

## Pre-existing engine-invisible content / convention drift

Per `engine-consumability-spec.md` §2 — `getCanonicalCautionText` reads
only `diagnostic_caution_text`; the shared `caution_text` field is
unread.

### `caution_text` populated (engine-invisible drift): 1 entry

**`cut_grain_phenomenon_veneer_thickness`** (line 3290,
`caution_text` at line 3350) — a ~750-character appraiser-voice
warning paragraph distinguishing thick veneer from solid wood / edge
banding / plywood face plies / laminated construction / repair
patches; warns against thickness-as-cut-method inference and
thickness-as-automatic-antique inference. This is one of the
highest-value `caution_text` content blocks in any canonical library
(comparable in richness to `hardware_type_eastlake_brass_pull`
identified in Block 21a).

**Remediation path:** rename the field from `caution_text` to
`diagnostic_caution_text`. Same Block 19-prep-style migration as
joinery commit 5948f55 and the hardware Block 21a remediation
recommendation. This is the SINGLE
`caution_text`-vs-`diagnostic_caution_text` drift point in the wood
identification library; the other 69 entries do not populate either
field.

Note: the engine-consumability-spec.md §6 explicitly calls out
"`woodIdentification` entries that populate `caution_text` get zero
engine surfacing" — this audit confirms ONE such entry exists, and the
field rename alone (no additional engine-side work) would surface the
content immediately IF the entry had a `CLUE_TO_CANONICAL` mapping.
Today `cut_grain_phenomenon_veneer_thickness` has no direct clue
mapping (the `thick_veneer` engine clue routes to
`cut_grain_evidence_thick_veneer` on the evidence side per
engineCanonicalMap.ts:75; the identification-side phenomenon entry is
unreached). However, when the rename happens, the routing could be
updated as a follow-up to make the rich identification-side caution
prose visible to engine consumers.

### `date_ceiling: 2030` legacy sentinel: 1 occurrence on 1 entry

Same entry (`cut_grain_phenomenon_veneer_thickness`):

| Line | Field | Value |
|------|-------|-------|
| 3339 | `period_associations[2].date_ceiling` | `2030` (period_label `"Modern thin-veneer dominance with thick-veneer exceptions"`) |

Per `authoring-conventions.md` §"Open-ended ranges" and the
`entryShape.ts` lock at line 136-138: open-ended-to-present windows
should OMIT `date_ceiling`. The 2030 sentinel is a Block 0.5c legacy
holdover.

**Remediation:** drop `date_ceiling: 2030` from
`period_associations[2]` on `cut_grain_phenomenon_veneer_thickness`.
The period_label / date_floor (1910) / usage_notes content survives
unchanged. This is the SINGLE source of the `2030` sentinel in the
wood identification library; all other 38 period_associations with
open-ended-to-present windows correctly omit `date_ceiling`.

### Broken FK: `wood_species_birdseye_maple`

Same entry, line 3327, `applicable_species` array:
```
{ species_id: "wood_species_birdseye_maple" },
```

There is NO `wood_species_birdseye_maple` entry in
`NATURAL_WOOD_SPECIES`. Birdseye is captured as
`cut_grain_phenomenon_birdseye` (line 2585), not as a species. The
intended reference is presumably `wood_species_maple_group` (already
present at line 991) with the birdseye phenomenon expressed via the
existing `cut_grain_phenomenon_birdseye.applicable_species` →
`wood_subspecies_hard_maple_sugar_maple` link (line 2605).

**Remediation:** replace the broken FK with `wood_species_maple_group`
or drop the line entirely (maple_group is already present at line
3326 as `wood_species_maple_group`; removing the broken `_birdseye_`
entry is the simpler fix). FK is documentation-only at present
(not engine-consumed) so this is a low-priority correctness fix, but
worth bundling into the same 1-entry cleanup commit as the
caution_text and date_ceiling drifts.

### Three drift instances are concentrated on the same single entry

`cut_grain_phenomenon_veneer_thickness` (Block 0.5c HCL-migration
orphan) carries all three drift instances:
1. `caution_text` instead of `diagnostic_caution_text` (1 field
   rename needed — and currently requires schema extension first,
   since `CutGrainPhenomenonEntry` doesn't declare
   `diagnostic_caution_text`).
2. One `date_ceiling: 2030` sentinel (1 drop needed).
3. Broken FK `wood_species_birdseye_maple` (1 replacement / drop
   needed).

A focused 1-entry cleanup commit (parallel to joinery commit 5948f55
and the Block 21a `hardware_type_eastlake_brass_pull` recommendation)
would fully resolve the 3 drift instances in this library — but the
caution_text rename requires the schema extension first.

### "Arts & Crafts" vs "Arts and Crafts": cross-library inconsistency
(not drift relative to this library's convention)

16 occurrences of "Arts & Crafts" in `woodIdentification.ts` —
matches both the docx source (17 docx instances of `Arts &amp; Crafts`)
and the established cross-library convention for non-upholstery
libraries per `authoring-conventions.md` §"Style-name spelling"
inconsistency #3. NOT drift relative to canonical convention for this
library. Documentation-only inconsistency relative to upholstery
libraries.

### Date-range string conformance per `engine-consumability-spec.md` §1

Wood identification library uses the **en-dash with no `c.` prefix**
convention (`1875–1915`, `1895–1925`) in `period_label` prose
embedded inside `description` fields. Examples:
- `"Oak became especially dominant during 1875–1915 (Golden Oak) and 1895–1925 (Arts & Crafts / Mission)."` (oak_group, line 687)
- `"California Arts & Crafts (1890–1930)"` style references in regional notes

`date_range_summary` field is NOT present on identification-library
entries — those use the structured `period_associations` array
exclusively for dating envelope. This is engine-consumable (the
`date_floor` / `date_ceiling` in `period_associations` ARE engine-
parsed per `engine-consumability-spec.md` §2). No drift to remediate.

## Pre-existing organisational decisions (NOT remediation candidates)

### CATEGORY V meta-category not represented as `wood_category` entry

Docx CATEGORY V — Secondary/Utility/Substrate Woods is a meta-umbrella
covering both natural secondary species (Basswood, Aspen, Cottonwood,
Gumwood, Lauan — Species Groups V-A through V-E) AND engineered
substrates (Plywood, Particleboard, MDF, Hardboard/Masonite,
Composite Veneer Cores — Species Groups V-F through V-J), plus a
Veneer Substrates meta-discussion (V-K).

The canonical correctly recognizes that the natural and engineered
content live under different taxonomic axes:
- Natural secondary species (V-A through V-E): placed in their
  appropriate `wood_category` (Basswood → diffuse_porous, Aspen →
  diffuse_porous, Cottonwood → diffuse_porous, Gumwood is already
  `wood_species_gumwood_group` under diffuse_porous from CAT II,
  Lauan → tropical_hardwoods_imported_exotics).
- Engineered substrates (V-F through V-J): hoisted to dedicated
  `engineered_substrate` top-level array with a distinct
  `composition_type` taxonomy (laminated_plies, compressed_fiber,
  composite_particle, composite_other) per the
  `EngineeredSubstrateEntry` interface (line 339-343). The
  `wood_category` ordinal enum is locked to `"I" | "II" | "III" |
  "IV"` (line 52) to reflect this architectural choice.

The CATEGORY V "Critical Diagnostic Principles" + "Common Historical
Patterns" + "Important Warning" meta sections (lines 2150-2226) carry
content that maps to wood_evidence_reasoning rules on the evidence-
side library (e.g., `wood_evidence_reasoning_secondary_woods_often_more_diagnostic_than_show_wood`,
`wood_evidence_reasoning_many_primary_secondary_framing_poplar`,
`wood_evidence_reasoning_composite_veneer_cores_premium_veneer_technique_gap`).
The identification side has no reasoning-rule tier (consistent with
the identification-vs-evidence split documented in the library
docstring lines 6-15).

**This is an architectural decision, not authoring debt.** No
remediation needed.

### CATEGORY VI meta-category not represented as `wood_category` entry

Docx CATEGORY VI — Figure, Cut, and Grain Phenomena is a meta-umbrella
covering 5 sub-categories (VI-A cut orientation, VI-B natural figure,
VI-C ray and cellular, VI-D veneer and slicing, VI-E chatoyance) with
26 nested Type entries.

The canonical hoists each phenomenon to a top-level
`cut_grain_phenomenon` entry distinguished by `phenomenon_type`
(cut_orientation / natural_figure / ray_cellular / veneer_slicing /
optical_effect) per the `CutGrainPhenomenonEntry` interface (line
452-457). This intentionally collapses the docx 1-category + 5
sub-categories + N types hierarchy into a flat
phenomenon_type-discriminated single array, parallel to the
hardware library's flat type list with category discrimination.

The CATEGORY VI "Important Chronological and Style Associations" and
"Critical Diagnostic Principles" meta sections (lines 2719-2780) carry
chronological-marker content that maps to phenomenon-entry
`period_associations` (which the canonical does populate — see Per-
entry gaps below) and to evidence-side compound entries like
`cut_grain_evidence_quarter_sawn_white_oak`.

**This is an architectural decision, not authoring debt.** No
remediation needed.

### Subspecies nested vs. promoted-to-top-level

Identification-side subspecies are nested inside parent
`WoodSpeciesEntry.subspecies?: WoodSubspecies[]` (line 239). Evidence-
side subspecies are promoted to top-level `wood_species_evidence`
entries with `wood_subspecies_evidence_*` id prefix (e.g.,
`wood_subspecies_evidence_white_oak` at woodEvidence.ts:590). Both
patterns are intentional per their respective library docstrings.

**This is an architectural decision, not authoring debt.** No
remediation needed; flagged here so that cross-library FK consumers
(e.g., the engine Phase 3 reasoning layer when it lands) know to
walk both nested and promoted patterns when joining identification
to evidence.

## Missing canonical entries (docx has, canonical lacks)

**3 structural orphans (NOT content-novel gaps):**

### 1. CAT V meta-category — by design (see above)

No `wood_category_secondary_utility_substrate` entry. Content is
distributed across natural-species categories I/II/III/IV and the
top-level `engineered_substrate` array.

### 2. CAT VI meta-category — by design (see above)

No `wood_category_figure_cut_grain` entry. Content is distributed
across 26 top-level `cut_grain_phenomenon` entries.

### 3. CAT V-K Veneer Substrates "Species Group" — meta-enumeration

Docx CAT V-K (line 2112-2150) is structured as a "Species Group"
header but the content is actually a meta-enumeration listing
substrate types (Poplar, Pine, Birch, Basswood, Gumwood — all already
covered as natural species entries) plus three Figure Variants
(Bookmatched Veneers, Slip-Matched Veneers, Radial Veneers — all
already covered as cut_grain_phenomenon entries: `bookmatching`,
`slip_matching`, `radial_matching`).

**No content is lost.** The docx meta-enumeration is fully covered by
the existing distributed canonical entries. No remediation needed.

### 4. Fiddleback Figure (docx CAT VI Type VI-B-6) — alias-fold borderline

Docx Type VI-B-6 (line 2518-2529) authors Fiddleback as a distinct
type with "Dense stripe repetition / Strong reflectivity" identifying
elements. Canonical `cut_grain_phenomenon_curly_figure` (line 2616)
includes "Fiddleback" in `common_aliases` but does not author a
distinct phenomenon entry.

This is a borderline case. The docx itself notes Fiddleback is
"associated heavily with instrument woods" (a specialty subset of
curly figure) and the docx Type VI-B-3 Curly Figure entry (line 2454)
also lists "Fiddleback" as an Alternate Term. The canonical
alias-fold treats Fiddleback as a synonym rather than a distinct
phenomenon, which is defensible given the docx's own ambiguity
about whether Fiddleback is a sub-type of Curly or a distinct
phenomenon.

**Borderline GOOD.** Flagged for Mike's review but not treated as
PARTIAL or MAJOR.

## Orphan canonical entries (canonical has, docx lacks)

**3 cut_grain_phenomenon orphans** (no other library has any
canonical-novel orphans):

| Canonical id | Source | Status |
|---|---|---|
| `cut_grain_phenomenon_hand_sawn_veneer` (line 3146) | Block 0.5c HCL migration; supports paired-diagnostic decomposition per D-PH3HCL-S3-N | Authored to provide a structured handle for hand-sawn-veneer reasoning distinct from thickness or slicing method. Not in docx CATEGORY VI Type list. |
| `cut_grain_phenomenon_radial_matching` (line 3237) | Hoist from docx CAT V-K "Radial Veneers" sub-bullet (line 2146) | Authored as a distinct phenomenon paralleling bookmatching and slip_matching for veneer layout method completeness. The docx CAT VI list omits radial-matching from VI-D-1 through VI-D-5 but the V-K sub-bullet documents the technique. |
| `cut_grain_phenomenon_veneer_thickness` (line 3290) | Block 0.5c HCL migration | The drift-concentration entry. Supports the docx "Veneer Thickness Matters" meta-rule (line 2176-2187) which is a meta-discussion, not a typed phenomenon. Canonical hoist gives the meta-rule a structured handle for engine reasoning, but the entry carries all 3 drift instances above. |

These are all structurally well-placed within the
`CUT_GRAIN_PHENOMENA` array but exceed the docx CATEGORY VI typed
enumeration. They are NOT content errors — they fill gaps the docx
authors in narrative meta-discussion rather than per-type entries.

## Per-entry gaps

### Categories (4 docx → 4 matched canonical; all GOOD)

| # | Canonical id | Docx § | Status | Notes |
|---|---|---|---|---|
| 1 | `wood_category_ring_porous_hardwoods` (line 538) | CATEGORY I (line 1) | GOOD | All 3 docx fields captured (Category Description; Unique Traits 9-item list; Identifying Elements 7-item list); `cousin_category_contrasts` populated (1 contrast vs diffuse-porous). |
| 2 | `wood_category_diffuse_porous_hardwoods` (line 571) | CATEGORY II (line 248) | GOOD | All 3 docx fields captured; `cousin_category_contrasts` populated. |
| 3 | `wood_category_softwoods_conifers` (line 606) | CATEGORY III (line 760) | GOOD | All 3 docx fields captured; `cousin_category_contrasts` populated. |
| 4 | `wood_category_tropical_hardwoods_imported_exotics` (line 642) | CATEGORY IV (line 1243) | GOOD | All 3 docx fields captured; `cousin_category_contrasts` populated. |

### Natural Species — CATEGORY I Ring-Porous (3 docx → 3 matched canonical)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `wood_species_oak_group` (line 680) | Species Group I-A — OAK GROUP (line 31) | GOOD | 2-period parent (Golden Oak 1875-1915, Mission/Arts & Crafts 1895-1925); 2 subspecies nested (white_oak with 4-period span; red_oak with 3-period span); cut_specific_identifiers for flat_sawn; cousin contrasts vs ash + vs walnut. Faithful to docx. |
| `wood_species_ash` (line 783) | Species Group I-B — ASH (line 166) | GOOD | 3-period span (1850-1930 bentwood, 1900-1940 utility, 1950-1970 Scandinavian); cousin contrasts. |
| `wood_species_elm` (line 818) | Species Group I-C — ELM (line 208) | GOOD | docx periods captured; Windsor seating context preserved in description. |

### Natural Species — CATEGORY II Diffuse-Porous (9 docx → 9 matched canonical)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `wood_species_walnut_group` (line 850) | Species Group II-A (line 294) | GOOD | parent + 1 subspecies (black_walnut); cut_specific_identifiers for flat_sawn + quarter_sawn |
| `wood_species_cherry_group` (line 932) | Species Group II-B (line 390) | GOOD | parent + 1 subspecies (black_cherry) |
| `wood_species_maple_group` (line 991) | Species Group II-C (line 454) | GOOD | parent + 2 subspecies (hard_maple_sugar_maple, soft_maple) |
| `wood_species_mahogany_group` (line 1060) | Species Group II-D (line 538) | GOOD | parent + 2 subspecies (honduran_mahogany, cuban_mahogany) |
| `wood_species_birch_group` (line 1130) | Species Group II-E (line 608) | GOOD | |
| `wood_species_beech_group` (line 1165) | Species Group II-F (line 642) | GOOD | |
| `wood_species_poplar_group` (line 1193) | Species Group II-G (line 673) | GOOD | |
| `wood_species_gumwood_group` (line 1227) | Species Group II-H (line 708) | GOOD | Note: docx ALSO has Species Group V-D "Gumwood / Sweetgum" (line 1885) — canonical correctly folds both into one entry under CATEGORY II |
| `wood_species_sycamore_group` (line 1260) | Species Group II-I (line 734) | GOOD | NO evidence-side parallel (see Cross-Library Parity section) |

### Natural Species — CATEGORY III Softwoods (8 docx → 8 matched canonical)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `wood_species_pine_group` (line 1285) | Species Group III-A (line 805) | GOOD | parent + 2 subspecies (eastern_white_pine, southern_yellow_pine); cut_specific_identifiers for flat_sawn |
| `wood_species_cedar_group` (line 1392) | Species Group III-B (line 940) | GOOD | parent + 1 subspecies (eastern_red_cedar) |
| `wood_species_douglas_fir` (line 1448) | Species Group III-C (line 988) | GOOD | NO evidence-side parallel |
| `wood_species_redwood` (line 1483) | Species Group III-D (line 1026) | GOOD | California Arts & Crafts period_association preserved |
| `wood_species_cypress` (line 1515) | Species Group III-E (line 1062) | GOOD | NO evidence-side parallel |
| `wood_species_spruce` (line 1547) | Species Group III-F (line 1095) | GOOD | NO evidence-side parallel |
| `wood_species_hemlock` (line 1580) | Species Group III-G (line 1127) | GOOD | NO evidence-side parallel |
| `wood_species_juniper_cedar_like_softwoods` (line 1614) | Species Group III-H (line 1159) | GOOD | NO evidence-side parallel; catch-all category |

### Natural Species — CATEGORY IV Tropical (11 docx → 11 matched canonical)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `wood_species_rosewood_group` (line 1642) | Species Group IV-A (line 1298) | GOOD | parent + 1 subspecies (brazilian_rosewood); CITES extinction guidance candidate for anti_classification_guidance |
| `wood_species_ebony_group` (line 1699) | Species Group IV-B (line 1362) | GOOD | |
| `wood_species_satinwood_group` (line 1733) | Species Group IV-C (line 1408) | GOOD | |
| `wood_species_zebrawood` (line 1765) | Species Group IV-D (line 1441) | GOOD | |
| `wood_species_teak` (line 1793) | Species Group IV-E (line 1470) | GOOD | |
| `wood_species_tulipwood` (line 1827) | Species Group IV-F (line 1508) | GOOD | NO evidence-side parallel |
| `wood_species_kingwood` (line 1855) | Species Group IV-G (line 1530) | GOOD | NO evidence-side parallel |
| `wood_species_padauk` (line 1883) | Species Group IV-H (line 1552) | GOOD | NO evidence-side parallel |
| `wood_species_palisander` (line 1908) | Species Group IV-I (line 1575) | GOOD | NO evidence-side parallel |
| `wood_species_purpleheart` (line 1935) | Species Group IV-J (line 1596) | GOOD | NO evidence-side parallel |
| `wood_species_olivewood` (line 1963) | Species Group IV-K (line 1617) | GOOD | NO evidence-side parallel |

### Natural Species — CATEGORY V utility/secondary (5 docx → 5 matched canonical, distributed across other categories)

| Canonical id | Canonical category | Docx § | Status | Notes |
|---|---|---|---|---|
| `wood_species_basswood` (line 1987) | diffuse_porous | Species Group V-A (line 1796) | GOOD | Secondary wood; Mid-Century Modern accent in some sources |
| `wood_species_aspen` (line 2024) | diffuse_porous | Species Group V-B (line 1835) | GOOD | NO evidence-side parallel |
| `wood_species_cottonwood` (line 2056) | diffuse_porous | Species Group V-C (line 1859) | GOOD | NO evidence-side parallel |
| (`wood_species_gumwood_group` line 1227 from CAT II) | diffuse_porous | Species Group V-D — GUMWOOD / SWEETGUM (line 1885) | GOOD | Single canonical entry under CAT II covers both docx CAT II-H and CAT V-D references (defensible merge) |
| `wood_species_lauan_philippine_mahogany` (line 2089) | tropical | Species Group V-E (line 1923) | GOOD | NO evidence-side parallel — NOTABLE GAP for Block 22 main (mid-century dating signal) |

### Engineered Substrates (5 docx → 5 matched canonical)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `engineered_substrate_plywood` (line 2124) | Species Group V-F — PLYWOOD (line 1949) | GOOD | composition_type: laminated_plies; introduction_anchor populated |
| `engineered_substrate_particleboard` (line 2181) | Species Group V-G — PARTICLEBOARD (line 1998) | GOOD | composition_type: composite_particle; introduction_anchor populated |
| `engineered_substrate_mdf` (line 2226) | Species Group V-H — MDF (line 2027) | GOOD | composition_type: compressed_fiber; introduction_anchor populated |
| `engineered_substrate_hardboard_masonite` (line 2272) | Species Group V-I — HARDBOARD/MASONITE (line 2057) | GOOD | composition_type: compressed_fiber; introduction_anchor populated |
| `engineered_substrate_composite_veneer_cores` (line 2314) | Species Group V-J — COMPOSITE VENEER CORES (line 2086) | GOOD | composition_type: composite_other; introduction_anchor populated |

### Cut/Grain Phenomena (26 canonical; 24 docx-matched + 2 species-localized matches + 3 canonical orphans)

#### Sub-batch P-1: CATEGORY VI-A Cut Orientation (4 docx → 4 matched canonical)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `cut_grain_phenomenon_flat_sawn` (line 2359) | Type VI-A-1 (line 2298) | GOOD | phenomenon_type: cut_orientation; applicable_species: 5 |
| `cut_grain_phenomenon_quarter_sawn` (line 2403) | Type VI-A-2 (line 2324) | GOOD | period_associations capture Mission 1880-1925 + Premium 1900-open |
| `cut_grain_phenomenon_rift_sawn` (line 2459) | Type VI-A-3 (line 2354) | GOOD | applicable_species: oak (parent + white subspecies) + walnut |
| `cut_grain_phenomenon_live_sawn` (line 2498) | Type VI-A-4 (line 2372) | GOOD | Contemporary period (1960-open) |

#### Sub-batch P-2: CATEGORY VI-B Natural Figure (8 docx → 7 matched canonical + 1 alias-fold)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `cut_grain_phenomenon_burl` (line 2524) | Type VI-B-1 (line 2405) | GOOD | 3-period (Victorian 1840-1900, Art Deco 1925-1945, Studio 1970-open); applicable_species: 6 |
| `cut_grain_phenomenon_birdseye` (line 2585) | Type VI-B-2 (line 2433) | GOOD | applicable_species: hard_maple subspecies primarily |
| `cut_grain_phenomenon_curly_figure` (line 2616) | Type VI-B-3 (line 2454) | GOOD with alias-fold | Fiddleback folded into common_aliases (see Missing section #4); applicable_species: 8 |
| `cut_grain_phenomenon_quilted_figure` (line 2683) | Type VI-B-4 (line 2484) | GOOD | applicable_species: hard_maple primarily |
| `cut_grain_phenomenon_flame_figure` (line 2711) | Type VI-B-5 (line 2500) | GOOD | applicable_species: mahogany, walnut, cherry |
| (Fiddleback Figure folded into curly_figure aliases) | Type VI-B-6 (line 2518) | BORDERLINE | See Missing section #4 |
| `cut_grain_phenomenon_spalted_figure` (line 2749) | Type VI-B-7 (line 2530) | GOOD | Studio-only post-1960 period; anti_classification_guidance candidate (modern-only signal) |
| `cut_grain_phenomenon_crotch_figure` (line 2796) | Type VI-B-8 (line 2554) | GOOD | applicable_species: walnut, mahogany, rosewood |

#### Sub-batch P-3: Species-localized Figure Variants (4 docx species-internal → 4 matched canonical hoisted)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `cut_grain_phenomenon_pumpkin_pine` (line 2840) | Pumpkin Pine (line 894, under Eastern White Pine) | GOOD | applicable_species: eastern_white_pine subspecies; NO evidence-side parallel |
| `cut_grain_phenomenon_heart_pine` (line 2867) | Heart Pine (line 933, under Southern Yellow Pine) | GOOD | applicable_species: southern_yellow_pine subspecies; HAS evidence-side parallel `cut_grain_evidence_heart_pine` |
| `cut_grain_phenomenon_pecky_cypress` (line 2897) | Pecky Cypress (line 1088, under Cypress) | GOOD | applicable_species: cypress; NO evidence-side parallel |
| `cut_grain_phenomenon_bear_claw_spruce` (line 2924) | Bear Claw Spruce (line 1123, under Spruce) | GOOD | applicable_species: spruce; NO evidence-side parallel |

#### Sub-batch P-4: CATEGORY VI-C Ray and Cellular (2 docx → 2 matched canonical)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `cut_grain_phenomenon_ray_fleck` (line 2949) | Type VI-C-1 (line 2577) | GOOD | period_associations: Mission/Arts & Crafts 1880-1925; applicable_species: white oak, sycamore, beech |
| `cut_grain_phenomenon_ribbon_stripe` (line 2992) | Type VI-C-2 (line 2599) | GOOD | applicable_species: mahogany, rosewood, teak |

#### Sub-batch P-5: CATEGORY VI-D Veneer and Slicing (5 docx → 5 matched canonical)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `cut_grain_phenomenon_rotary_cut_veneer` (line 3040) | Type VI-D-1 (line 2628) | GOOD | Period 1930-open; anti_classification_guidance candidate (post-1930 emergence) |
| `cut_grain_phenomenon_plain_sliced_veneer` (line 3087) | Type VI-D-2 (line 2645) | GOOD | Period 1850-open |
| `cut_grain_phenomenon_quarter_sliced_veneer` (line 3116) | Type VI-D-3 (line 2657) | GOOD | applicable_species: oak, mahogany; NO evidence-side parallel |
| `cut_grain_phenomenon_bookmatching` (line 3178) | Type VI-D-4 (line 2669) | GOOD | Period 1800-open |
| `cut_grain_phenomenon_slip_matching` (line 3208) | Type VI-D-5 (line 2684) | GOOD | Period 1900-open |

#### Sub-batch P-6: CATEGORY VI-E Chatoyance (1 docx → 1 matched canonical)

| Canonical id | Docx § | Status | Notes |
|---|---|---|---|
| `cut_grain_phenomenon_chatoyance` (line 3261) | CATEGORY VI-E (line 2696) | GOOD | phenomenon_type: optical_effect; applicable_species: 5 |

#### Sub-batch P-7: Canonical-orphan phenomena (3 entries; no docx CATEGORY VI type match)

| Canonical id | Source | Status | Notes |
|---|---|---|---|
| `cut_grain_phenomenon_hand_sawn_veneer` (line 3146) | Block 0.5c HCL migration | ORPHAN | Authored to provide structured handle for hand-sawn-veneer reasoning |
| `cut_grain_phenomenon_radial_matching` (line 3237) | Hoist from docx CAT V-K "Radial Veneers" sub-bullet (line 2146) | ORPHAN | Parallels bookmatching + slip_matching for completeness |
| `cut_grain_phenomenon_veneer_thickness` (line 3290) | Block 0.5c HCL migration | ORPHAN — DRIFT-CONCENTRATION | Carries all 3 drift instances (caution_text, date_ceiling: 2030, broken FK to wood_species_birdseye_maple) |

### Subspecies (12 docx → 12 matched canonical)

| Canonical id (nested) | Docx § | Status | Notes |
|---|---|---|---|
| `wood_subspecies_white_oak` (line 722) | Subspecies I-A-1 (line 65) | GOOD | 4-period span; 3-region regional_patterns |
| `wood_subspecies_red_oak` (line 754) | Subspecies I-A-2 (line 133) | GOOD | 3-period span; 1-region regional_patterns |
| `wood_subspecies_black_walnut` (line 912) | Subspecies II-A-1 (line 347) | GOOD | |
| (`wood_subspecies_black_cherry`) | Subspecies II-B-1 (line 435) | GOOD | nested in cherry_group at line 973 |
| `wood_subspecies_hard_maple_sugar_maple` (line 1027) | Subspecies II-C-1 (line 493) | GOOD | birdseye + curly + quilted figure expressions |
| `wood_subspecies_soft_maple` (line 1043) | Subspecies II-C-2 (line 528) | GOOD | |
| `wood_subspecies_honduran_mahogany` (line 1098) | Subspecies II-D-1 (line 577) | GOOD | |
| `wood_subspecies_cuban_mahogany` (line 1113) | Subspecies II-D-2 (line 586) | GOOD | CITES extinction context |
| `wood_subspecies_eastern_white_pine` (line 1334) | Subspecies III-A-1 (line 859) | GOOD | |
| `wood_subspecies_southern_yellow_pine` (line 1363) | Subspecies III-A-2 (line 901) | GOOD | |
| `wood_subspecies_eastern_red_cedar` (line 1430) | Subspecies III-B-1 (line 974) | GOOD | |
| `wood_subspecies_brazilian_rosewood` (line 1681) | Subspecies IV-A-1 (line 1343) | GOOD | CITES extinction context |

### Common gap pattern (applies to ALL 70 entries)

- No `wear_characteristics` (schema field absent on all 4 wood-
  identification interfaces). Docx itself has no per-species "Wear
  Indicators" subsection (oxidation patterns are noted obliquely
  inside Identifying Elements), but cross-cutting wear-class anchors
  exist in CAT V meta + CAT VI meta sections that would author
  cleanly via curated extrapolation.

- No `diagnostic_caution_text` (schema field absent on all 4 wood-
  identification interfaces; the shared `caution_text` field IS
  present via `CanonicalEntry` inheritance but engine reads ONLY
  `diagnostic_caution_text`). Engine-relevant gap — the docx CATEGORY
  VI has 6+ "Diagnostic Notes" subsections with ready-made
  appraiser-voice caution prose that could author into per-phenomenon
  `diagnostic_caution_text` immediately upon schema extension.
  Authoring candidates: `flat_sawn` (line 2322), `quarter_sawn` (line
  2352), `burl` (line 2431), `spalted_figure` (line 2550), `ray_fleck`
  (line 2597), `rotary_cut_veneer` (line 2643). Plus
  `veneer_thickness` already has the prose — first migration target.

- No engine `CLUE_TO_CANONICAL` mapping for any natural-species or
  cut-grain identification entry (per
  `engine-consumability-spec.md` §5). All wood-domain engine clues
  (`plywood_structural`, `plywood_drawer_bottom`, `cedar_lining`,
  `thick_veneer`) route to evidence-side or substrate entries, not to
  identification-side natural species. This means
  `diagnostic_caution_text` population on identification-side entries
  would be documentation-only UNTIL evidence-side migration or
  engine routing changes land.

### Common-pattern non-gap (NOT flagged)

- `description` is consistently faithful (often a multi-sentence
  paragraph integrating docx Description + Unique Traits leads + key
  era anchors).
- `unique_traits` and `identifying_elements` use sentence-case noun
  phrases without terminal periods — internally consistent and
  matches the established cross-library convention.
- `period_associations` are well-formed for engine consumption: every
  entry with docx Common Time Periods content has structured
  `period_associations`; multi-period decomposition is used
  appropriately (e.g., 4-period white_oak captures Structural Joined
  Furniture / Golden Oak / Mission/Arts & Crafts / Tudor-Jacobean
  Revival). 38 of 39 open-ended period associations correctly omit
  `date_ceiling` per `entryShape.ts` lock.
- `regional_patterns` are populated on the 39 entries (mostly
  species + subspecies + some phenomena) where the docx provides
  Regional Patterns sections. Docx-faithful.
- `cousin_*_contrasts` fields are well-populated:
  - `cousin_category_contrasts` on 4/4 category entries.
  - `cousin_species_contrasts` on 27 species entries (out of 35) —
    GOOD coverage; gaps are mostly tropical exotics where docx
    cousin-contrast content is sparse.
  - `cousin_substrate_contrasts` on 4 of 5 substrate entries.
  - `cousin_phenomenon_contrasts` on 2 phenomenon entries (relatively
    sparse; one of the two is the drift-concentration
    `veneer_thickness` entry).
- `cut_specific_identifiers` cross-reference arrays are populated on
  oak_group, white_oak, walnut_group, mahogany_group, maple_group,
  pine_group, eastern_white_pine — capturing the docx species-by-cut
  identifying content (e.g., oak's Flat-Sawn vs Quarter-Sawn White
  Oak per-cut prose at docx lines 53-62).
- `applicable_species` and `applicable_substrates` FK arrays on
  cut_grain_phenomenon entries are well-populated, capturing
  docx "Common Woods" sections. ONE broken FK exists:
  `wood_species_birdseye_maple` on `veneer_thickness` line 3327 (see
  Pre-existing engine-invisible content section).
- `composition_type` + `typical_structural_role` +
  `introduction_anchor` on engineered_substrate entries are
  uniformly populated. Substrate dates are docx-faithful with the
  CATEGORY V "Engineered Materials Are Chronological Anchors" meta
  section (line 2163-2173) anchors authored cleanly.
- No multi-range strings in any docx-text-imported prose field; no
  curly apostrophes; no `between X and Y` patterns that would break
  `parseRangeToNumeric`.

## Summary of remediation tasks (priority order)

1. **MEDIUM (1-entry cleanup; parallel to joinery commit 5948f55 and
   the Block 21a `hardware_type_eastlake_brass_pull` recommendation):**
   Clean up the 3 drift instances on
   `cut_grain_phenomenon_veneer_thickness`:
   - Drop `date_ceiling: 2030` from `period_associations[2]` (line 3339).
   - Replace broken FK `wood_species_birdseye_maple` (line 3327) with
     `wood_species_maple_group` or drop entirely (maple_group already
     present at adjacent line 3326).
   - Rename `caution_text` → `diagnostic_caution_text` (line 3350) —
     BUT this requires schema extension first (see #2).

2. **MEDIUM (schema extension + immediate engine benefit IF clue
   routing follows; parallel to Block 20a + 21a recommendations):**
   Add `diagnostic_caution_text?: string` to `WoodSpeciesEntry`,
   `EngineeredSubstrateEntry`, `CutGrainPhenomenonEntry`, and
   `WoodSubspecies`. The docx has 6+ ready-to-author caution
   paragraphs at the per-phenomenon Diagnostic Notes lines (2322,
   2352, 2431, 2550, 2597, 2643). Add to substrate entries for
   chronological-anchor warnings (post-1930 masonite, post-1945
   plywood carcass, post-1950 particleboard, post-1970 MDF) per
   docx line 2163-2173. Engine impact deferred until
   `CLUE_TO_CANONICAL` mappings land for identification-side entries
   OR until clue routing is updated to consult identification before
   evidence.

3. **LOW (schema extension + future engine consumer; parallel to
   Block 19a/20a/21a):** Add `wear_characteristics?: string[]` to
   `WoodSpeciesEntry`, `EngineeredSubstrateEntry`,
   `CutGrainPhenomenonEntry`, and `WoodSubspecies`. Authoring would
   be primary-source-extrapolation from docx Identifying Elements
   oxidation/aging sub-bullets plus the CAT V "Secondary Woods Often
   Carry Higher Dating Authority" + CAT VI "Figure Often Indicates
   Quality Tier" meta sections. Documentation-only until a parallel
   `buildWoodCanonicalAppendix` is added.

4. **LOW (cross-library parity awareness):** 15 identification-side
   species lack `wood_species_evidence_*` parallels in
   woodEvidence.ts. Most are deferred low-frequency species, but
   `wood_species_lauan_philippine_mahogany` is a NOTABLE GAP given
   its mid-century mass-market dating signal value. Flagged for
   Block 22 main authoring backlog.

5. **LOW (cross-library parity awareness):** Identification side
   decomposes species×phenomenon compounds via base phenomenon +
   `applicable_species` FK while evidence side authors 17
   pre-composed compound entries (e.g., `cut_grain_evidence_burl_walnut`,
   `cut_grain_evidence_quarter_sawn_white_oak`). Both patterns are
   defensible; Mike should decide whether to converge on one pattern
   in Phase 3 engine reasoning (the intersection-at-runtime approach
   is more flexible; the pre-composed approach is faster but loses
   the per-base-phenomenon period envelope).

6. **NIL (no remediation needed):** No `caution_text` drift on 69 of
   70 entries; no `date_ceiling: 2030` sentinels on 38 of 39
   open-ended period_associations; CATEGORY V and CATEGORY VI
   meta-categories are intentionally not represented as
   `wood_category` entries per the architectural decisions documented
   in the library docstring and interface declarations. "Arts &
   Crafts" ampersand use is canonical convention for this library,
   not drift. The Fiddleback Figure alias-fold is defensible given
   docx ambiguity.
