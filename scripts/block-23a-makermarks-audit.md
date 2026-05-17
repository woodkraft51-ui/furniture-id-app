# Block 23a: Maker Marks Canonical ↔ Docx Audit

Generated against `/tmp/makermark-clean.md` (1108 lines extracted from
`Maker_Mark_Replacement_Seed.docx`) and canonical
`lib/constraints/makerMarks.ts` (77 `maker_mark` entries +
8 `maker_attribution_reasoning_rule` entries + a legacy
`MAKER_MARKS` array of 25 `MakerMarkEntry_Legacy` shims still consumed by
the engine — see Legacy section).

## Summary

- Docx entities (per-maker bucket, excluding 4 meta sections at lines
  1-50 and the App-confidence-ladder / Globe-Wernicke-correction
  trailers at lines 1064-1109): **77 makers** across 11 era sections.
  - "Early American and Regional Cabinetmaking" (2: Cabinetmaker
    paper labels generic; Shaker communities)
  - "19th-Century and Victorian Makers" (10)
  - "Grand Rapids and Major American Factory Makers" (7)
  - "Office, Bookcase, and Institutional Makers" (5)
  - "Arts & Crafts, Mission, and Stickley-Related Makers" (7)
  - "Wicker, Rattan, and Reed Makers" (4)
  - "Cedar Chests, Trunks, and Bedroom Furniture" (4)
  - "Mid-Century Modern and 20th-Century Case Goods" (27)
  - "Designer / Modern Licensed Production" (4: Eames/Nelson/Saarinen/Bertoia)
  - "Upholstery and Seating Makers" (4)
  - "Clock and Specialty Furniture Makers" (3)
  - Total: 77.
- Canonical `maker_mark` entries: **77**. The interface block-comment
  estimate of "~78-82 entries" (makerMarks.ts:8) overshot by 1-5;
  actual is 77. The header comment "78 maker_mark entries" in the
  audit prompt is likewise off by 1 vs the canonical file.
- Canonical `maker_attribution_reasoning_rule` entries: **8** (meta;
  scope-skipped here — but see "Reasoning rules engine status").
- Legacy `MAKER_MARKS: MakerMarkEntry_Legacy[]` shim entries:
  **25** (lines 2852-3102). Still imported by `engine.ts:2` and
  consumed at `engine.ts:2970` (single-mark lookup) and
  `engine.ts:3914` (filter). Per the makerMarks.ts module header
  (lines 13-16), Phase 3 weighting integration is intended to
  activate the new `MAKER_ENTRIES` schema and deprecate the
  legacy shim.

### Match outcomes

- Matched pairs (docx maker ↔ canonical `maker_mark`): **77 of 77**
  (100% — every docx maker has a corresponding canonical entry, and
  every canonical `maker_mark` entry corresponds to a docx maker).
  Canonical id ordering mirrors docx era-section ordering exactly.
- Docx makers with no canonical match: **0**.
- Canonical `maker_mark` entries with no docx counterpart: **0**.
- Legacy `MAKER_MARKS` shim entries with no docx counterpart
  (legacy-orphan content, distinct from new schema audit):
  **4** — Thonet, Wallace Nutting, Karges Furniture, Toledo
  Metal Furniture Co. The docx does not mention any of these
  4 makers anywhere. See "Legacy shim orphan content" section.

### Per-field gap totals

Schema gap (the new `MakerMarkEntry` interface does NOT declare any
of these fields, so the question is whether to extend the schema):

- Entries with `diagnostic_caution_text`: **0 / 77** (field is not
  in `MakerMarkEntry`; analogous content lives in
  `false_positive_warnings: string[]` + `attribution_confidence_rule:
  string`, which are docx-faithful but engine-invisible per
  `getCanonicalCautionText` reading only `diagnostic_caution_text`).
- Entries with `wear_characteristics`: **0 / 77** (field absent on
  `MakerMarkEntry`; not in docx either — makers don't carry per-piece
  wear in the docx structure).
- Entries with `cousin_contrasts`: **0 / 77** (field absent;
  analogous content lives in `related_names: string[]` +
  `false_positive_warnings: string[]`).
- Entries with `caution_text` (the engine-invisible shared field):
  **0 / 77** (clean — no caution_text drift).
- Entries with `date_ceiling: 2030` legacy sentinel: **0 / 77**
  (clean — every period_associations with an open-ended-to-present
  range omits `date_ceiling` per `entryShape.ts` lock convention).
- Entries with `date_ceiling: null / 9999 / 2025`: **0 / 77**.
- Date-range narrative drift: **0 / 77**. All period_associations
  use the engine-parseable `date_floor` (+ optional `date_ceiling`)
  numeric form. `dating_clues` is free-form prose and not consumed
  by `parseRangeToNumeric` today; no drift to flag.
- "Arts & Crafts" ampersand vs "Arts and Crafts" spelled-out:
  ampersand form used in **25 places** (header section + per-entry
  references). Per authoring-conventions.md §4, makerMarks.ts is
  one of the 4 libraries that use the ampersand form, in contrast
  to upholstery + styleFamilies. This is a pre-existing cross-
  library inconsistency, not a Block-23a-introduced drift.

### Status distribution

All 77 matched pairs are **GOOD** — every canonical entry faithfully
captures the docx Region, Date Range, Furniture Categories, Known
Marks, Common Locations, Visual / Wording Traits, False Positive
Warning, Confidence Rule, Special Caution, and Dating-Clue content
where the docx provides it. Several entries (Hitchcock, Heywood-
Wakefield, Drexel, Berkey & Gay, Lane) carry value-added
`anti_classification_guidance` for firm-founding / name-change
boundary years and per-entry batch-coordination notes that go beyond
verbatim docx content. The canonical library is materially richer
than the docx in places (founding years, line-name catalogs,
licensee details, related_names) — see "Per-entry richness exceeds
docx" section.

Status distribution: GOOD = 77, PARTIAL = 0, MAJOR = 0.

## ★ REPLACEMENT SEED FRAMING (DECISION REQUIRED) ★

The docx filename is `Maker_Mark_Replacement_Seed.docx`. The
"Replacement" word in the filename could mean either:
- (a) replace the current canonical content authored from this
  docx — i.e., re-author from a refreshed seed; OR
- (b) replace the legacy `MAKER_MARKS` shim (25 entries; lines 2852-
  3102) with the new `MAKER_ENTRIES` schema (77 entries; lines 182-
  2693) once Phase 3 weighting integration ships.

The Block 27 / Block 28 / Block 28b authoring comments in
makerMarks.ts (lines 1-16, 178-181, 2816-2851) read meaning (b)
unambiguously: the file's own narrative is "the new MakerMarkEntry
schema replaces the legacy MakerMarkEntry_Legacy + MAKER_MARKS array
once Phase 3 weighting integration activates." Under meaning (b),
the new `MAKER_ENTRIES` array IS the docx content faithfully
authored — the "replacement seed" is the canonical-content source,
not a directive to re-author.

Tally for the decision:

- **Docx makers that duplicate existing canonical entries**: 77 / 77
  (100%). Every docx maker is already authored into the new
  `MAKER_ENTRIES` schema.
- **Docx makers that are net-new authoring opportunities**: 0 / 77.
  The audit found no docx maker missing from canonical.
- **Orphan canonical `maker_mark` entries** (in canonical, not in
  docx): **0 / 77**. Every new-schema entry corresponds 1:1 to a
  docx maker.
- **Orphan legacy `MAKER_MARKS` shim entries** (in legacy, not in
  docx): **4 / 25** — Thonet, Wallace Nutting, Karges Furniture,
  Toledo Metal Furniture Co. These 4 are NOT covered anywhere in
  the docx and are NOT carried into the new `MAKER_ENTRIES` array
  either.

### Surfaced for Mike's decision

If meaning (b) is intended (legacy → new schema swap once Phase 3
ships), the docx and the new canonical content are already in
lockstep; nothing to do at the per-entry level. The Phase-3
integration block (yet to ship) will retire the legacy shim and
activate the new schema for engine consumption.

The 4 legacy-orphan entries (Thonet, Wallace Nutting, Karges,
Toledo Metal) are independent content additions that pre-dated the
docx authoring discipline. Mike's decision required:

1. **Drop the 4 legacy-orphan entries** when retiring the legacy
   shim — accepting that the docx is the single source of truth
   for canonical maker coverage going forward; OR
2. **Author the 4 orphan makers into the new `MAKER_ENTRIES`
   schema** before retiring the legacy shim — preserving the
   existing coverage independent of docx scope; OR
3. **Source-extend the docx** with Thonet / Wallace Nutting /
   Karges / Toledo Metal sections, then re-author each into the
   new schema with docx provenance.

If meaning (a) is intended (re-author from a refreshed seed), the
audit finds the existing canonical content already docx-faithful to
the version of the docx provided in `/tmp/makermark-clean.md`;
re-authoring is unnecessary unless the source docx itself has been
updated since canonical authoring (Block 28 / Block 28b).

**Recommended framing for Mike**: meaning (b) Phase-3 swap is the
established intent per the file's own documentation; the docx ↔
canonical audit confirms zero gap at the per-entry level; the only
outstanding decision is what to do with the 4 legacy-orphan entries
(Thonet, Wallace Nutting, Karges, Toledo Metal) when the legacy
shim retires.

## Schema extension required

The new `MakerMarkEntry` interface does NOT declare the
`diagnostic_caution_text` / `wear_characteristics` / `cousin_contrasts`
fields that hardware.ts (Block 21a target) added per the Block 17 / 18
/ 21a schema extensions. The question is whether to add them here.

### `diagnostic_caution_text` — recommended schema extension

The docx supplies rich appraiser-voice cautionary content per maker —
distributed across **"False Positive Warning"**, **"Confidence Rule"**,
**"Special Caution"** (Hitchcock), **"Dating Caution"** (Drexel),
**"Dating Clue"** (Lane), **"Eames Label Caution"** (Herman Miller),
**"Safety Note"** (Lane), and **"Dating / License Note"** (Kittinger).
The canonical schema captures all of this content faithfully today
under `false_positive_warnings: string[]` (per-warning array) and
`attribution_confidence_rule: string` (single rule). However:

- The engine's `getCanonicalCautionText` (`engineClueResolver.ts:208-
  215`) reads ONLY `diagnostic_caution_text` — neither
  `false_positive_warnings` nor `attribution_confidence_rule` is
  surfaced. Both are engine-invisible today, just like the
  pre-Block-21a `caution_text` fields on hardware entries.
- The legacy `MAKER_MARKS` shim does have a `notes?: string` field
  that IS being consumed today via the legacy single-mark lookup
  (`engine.ts:2970`), so the engine has partial maker caution
  surfacing via the 25 legacy entries.

**Recommendation**: when Phase 3 weighting integration ships, add a
`diagnostic_caution_text?: string` field to `MakerMarkEntry` and
either:
- (a) auto-derive its value from `attribution_confidence_rule` +
  `false_positive_warnings.join("; ")` for engine surfacing; OR
- (b) author it explicitly per-entry as a synthesis of the
  Confidence Rule and False Positive Warnings.

Without the extension, the new schema's per-maker cautionary content
will be more engine-invisible than the legacy shim's `notes` field
is today.

### `wear_characteristics` — not required

The docx does not carry per-maker wear content. Makers are firm-
level entries; per-piece wear lives in the upholstery / finish /
woodEvidence libraries. No authoring opportunity.

### `cousin_contrasts` — not required

The docx's analog of cousin-contrast content is captured by
`related_names: string[]` (subsidiaries, predecessor/successor firms,
sister companies, licensed manufacturers, common confusable makers)
and `false_positive_warnings: string[]` (cross-maker confusion
warnings). No additional field needed.

## Pre-existing engine-invisible content / convention drift

### 1. New schema entries are entirely engine-invisible today

The new `MakerMarkEntry`-shaped 77 entries in `MAKER_ENTRIES` are
NOT consumed by any engine code today. Per `engine.ts:2 / 2970 /
3914`, only the legacy `MAKER_MARKS` shim is wired in. Per the
makerMarks.ts module header comments (lines 1-16), Phase 3
weighting integration is the planned activation point. Until that
ships, all 77 docx-faithful new-schema entries are pure
documentation. **This is the dominant engine-visibility gap on
this library** — orders of magnitude larger than any per-entry
content drift.

### 2. The 8 `maker_attribution_reasoning_rule` entries are entirely engine-invisible today

Per the engine-consumability-spec.md §6, "No engine code consumes any
reasoning-rule entry. The `*_REASONING_RULES` arrays are not even
imported into `buildIndex` in `engineClueResolver.ts`." The 8 maker-
attribution reasoning rules (Core Attribution Rule + 5 Universal
False-Positive Rules + Confidence Ladder + Globe-Wernicke Correction)
are docx-faithful but unread by engine. 7 of the 8 declare
`migration_target: "engine_reasoning"`; the Confidence Ladder
declares `migration_target: "report_layer"`. No migration consumer
exists yet.

### 3. `attribution_confidence_rule` field is engine-invisible today

Authored docx-faithfully on every entry; reads as the canonical
operationalization of the per-maker Confidence Rule from the docx.
Not consumed by any engine code. Becomes visible only via the same
Phase 3 weighting integration that activates the new schema.

### 4. `false_positive_warnings` field is engine-invisible today

Same status. Authored docx-faithfully; not consumed today.

### 5. `dating_clues` field is engine-invisible today

Same status. The closest engine consumer would be
`parseRangeToNumeric`, but `dating_clues` is free-form appraiser-
voice prose (e.g., Heywood-Wakefield: "Eagle stamp dates post-1949;
label wording 'Fine Furniture by Heywood-Wakefield...' is post-1921
firm-name shortening."), not a parseable date-range string.

### 6. `anti_classification_guidance` on `MakerMarkEntry` is engine-invisible

Per engine-consumability-spec.md §6: "Authoring
`anti_classification_guidance` on non-form entries (e.g., upholstery
construction types) is invisible — only `evaluateAntiBackClassification`
consumes it, and it only looks at FORMS." The 4 `MakerMarkEntry`
entries that carry AntiClassificationGuidance (Hitchcock, Heywood-
Wakefield, Drexel, Lane) for firm-founding / name-change boundary
years are docx-justified but invisible to the form-evaluator today.

### 7. Per-maker `period_associations` ARE engine-visible (via dateHintFor)

Once the new schema is wired into the engine canonical-map index
(`CLUE_TO_CANONICAL`), `dateHintFor` (`engineClueResolver.ts:67-141`)
will consume `period_associations[*].date_floor / date_ceiling` per
the non-upholstery first-wins convention. All 77 new-schema entries
have well-formed period_associations using numeric date_floor /
optional date_ceiling. Zero `date_ceiling: 2030` legacy sentinel
drift.

### 8. CLUE_TO_CANONICAL routing for maker_label/roos_label/lane_label is NO_MATCH today

`engineCanonicalMap.ts:84-86` marks `maker_label`, `roos_label`,
`lane_label` as `NO_MATCH` with explicit comments "specific maker;
lives in makerMarks.ts MAKER_ENTRIES". This is the wired-up
boundary between text-fallback clue detection (which fires
`maker_label` / `roos_label` / `lane_label` per
`engine.ts:825-828`) and the new-schema MAKER_ENTRIES — but the
NO_MATCH means the engine has no current route from a detected
maker-label clue to the new-schema canonical entry. Phase 3
integration must wire these clue keys to specific maker entry ids
(probably `maker_mark_roos_manufacturing` and
`maker_mark_lane_company`).

## Missing canonical entries (docx has, canonical lacks)

**None.** All 77 docx makers have corresponding canonical entries in
the new `MAKER_ENTRIES` array. Per-id mapping (canonical id ordering
mirrors docx order):

| Docx maker (line) | Canonical id (line) |
|---|---|
| Cabinetmaker paper labels and inscriptions (56) | maker_mark_cabinetmaker_paper_labels_and_inscriptions (187) |
| Shaker communities (67) | maker_mark_shaker_communities (220) |
| Duncan Phyfe (79) | maker_mark_duncan_phyfe (254) |
| Lambert Hitchcock / Hitchcock Chair Company (96) | maker_mark_lambert_hitchcock (289) |
| John Henry Belter (115) | maker_mark_john_henry_belter (329) |
| Alexander Roux (130) | maker_mark_alexander_roux (360) |
| Herter Brothers (145) | maker_mark_herter_brothers (391) |
| Pottier & Stymus (160) | maker_mark_pottier_and_stymus (422) |
| R. J. Horner (175) | maker_mark_r_j_horner (453) |
| Mitchell & Rammelsberg (190) | maker_mark_mitchell_and_rammelsberg (485) |
| Wooton Desk Company (205) | maker_mark_wooton_desk_company (516) |
| A. H. Andrews / A. Andrews Co. (220) | maker_mark_a_h_andrews (548) |
| Grand Rapids Furniture Association triangle mark (236) | maker_mark_grand_rapids_furniture_association_triangle (583) |
| Berkey & Gay Furniture Co. (253) | maker_mark_berkey_and_gay (615) |
| Widdicomb Furniture Co. (268) | maker_mark_widdicomb_furniture_co (649) |
| John Widdicomb (283) | maker_mark_john_widdicomb (680) |
| Sligh Furniture Co. (296) | maker_mark_sligh_furniture_co (711) |
| Imperial Furniture Co. (311) | maker_mark_imperial_furniture_co (742) |
| Phoenix Furniture Co. (324) | maker_mark_phoenix_furniture_co (773) |
| Globe-Wernicke Co. (336) | maker_mark_globe_wernicke_co (807) |
| Macey / Macey Company (356) | maker_mark_macey (843) |
| Gunn Furniture Co. (371) | maker_mark_gunn_furniture_co (874) |
| Shaw-Walker (384) | maker_mark_shaw_walker (905) |
| Yawman & Erbe (397) | maker_mark_yawman_and_erbe (935) |
| Gustav Stickley / Craftsman Workshops (409) | maker_mark_gustav_stickley (969) |
| L. & J. G. Stickley (424) | maker_mark_l_and_jg_stickley (1008) |
| Stickley Brothers (437) | maker_mark_stickley_brothers (1041) |
| Stickley Associated Cabinetmakers (450) | maker_mark_stickley_associated_cabinetmakers (1072) |
| Limbert / Charles P. Limbert Co. (461) | maker_mark_limbert (1103) |
| Lifetime Furniture / Grand Rapids Bookcase & Chair Co. (476) | maker_mark_lifetime_furniture (1134) |
| Roycroft (487) | maker_mark_roycroft (1165) |
| Heywood Brothers (501) | maker_mark_heywood_brothers (1202) |
| Wakefield Rattan Co. (512) | maker_mark_wakefield_rattan_co (1239) |
| Heywood Brothers & Wakefield Co. (523) | maker_mark_heywood_brothers_and_wakefield_co (1277) |
| Heywood-Wakefield Co. (536) | maker_mark_heywood_wakefield_co (1321) |
| Lane Company / Lane Furniture (552) | maker_mark_lane_company (1366) |
| Roos Manufacturing / Ed Roos Co. (571) | maker_mark_roos_manufacturing (1399) |
| Cavalier (586) | maker_mark_cavalier (1430) |
| Caswell-Runyan (597) | maker_mark_caswell_runyan (1460) |
| Herman Miller (609) | maker_mark_herman_miller (1494) |
| Knoll / Knoll Associates (626) | maker_mark_knoll (1527) |
| Drexel / Drexel Heritage (641) | maker_mark_drexel (1559) |
| Broyhill (658) | maker_mark_broyhill (1598) |
| Bassett (675) | maker_mark_bassett (1629) |
| Kent-Coffey (686) | maker_mark_kent_coffey (1660) |
| American of Martinsville (697) | maker_mark_american_of_martinsville (1690) |
| United Furniture (708) | maker_mark_united_furniture (1721) |
| Stanley Furniture (719) | maker_mark_stanley_furniture (1752) |
| Thomasville (730) | maker_mark_thomasville (1783) |
| Henredon (741) | maker_mark_henredon (1815) |
| Heritage / Drexel Heritage (754) | maker_mark_heritage_drexel_heritage (1845) |
| Century Furniture (765) | maker_mark_century_furniture (1876) |
| Baker Furniture (776) | maker_mark_baker_furniture (1907) |
| Kittinger (789) | maker_mark_kittinger (1938) |
| Kindel (804) | maker_mark_kindel (1971) |
| Councill Craftsmen (815) | maker_mark_councill_craftsmen (2002) |
| Craftique (826) | maker_mark_craftique (2033) |
| Pennsylvania House (837) | maker_mark_pennsylvania_house (2063) |
| Tell City Chair Co. (848) | maker_mark_tell_city_chair_co (2094) |
| Willett Furniture (859) | maker_mark_willett_furniture (2125) |
| Ethan Allen (870) | maker_mark_ethan_allen (2155) |
| Pulaski (881) | maker_mark_pulaski (2186) |
| Lexington (892) | maker_mark_lexington (2217) |
| Hooker Furniture (903) | maker_mark_hooker_furniture (2249) |
| Harden (914) | maker_mark_harden (2279) |
| Nichols & Stone (925) | maker_mark_nichols_and_stone (2309) |
| Eames for Herman Miller (937) | maker_mark_eames_for_herman_miller (2348) |
| Nelson for Herman Miller (948) | maker_mark_nelson_for_herman_miller (2379) |
| Saarinen for Knoll (957) | maker_mark_saarinen_for_knoll (2410) |
| Bertoia for Knoll (968) | maker_mark_bertoia_for_knoll (2440) |
| Hickory Chair (980) | maker_mark_hickory_chair (2473) |
| Hancock & Moore (993) | maker_mark_hancock_and_moore (2505) |
| Sikes Chair Co. (1006) | maker_mark_sikes_chair_co (2536) |
| Murphy Chair Co. (1017) | maker_mark_murphy_chair_co (2565) |
| Howard Miller (1029) | maker_mark_howard_miller (2600) |
| Ridgeway (1042) | maker_mark_ridgeway (2631) |
| Colonial Manufacturing Co. (1053) | maker_mark_colonial_manufacturing_co (2661) |

## Orphan canonical entries (canonical has, docx lacks)

### New-schema `MakerMarkEntry` orphans: 0

Every entry in `MAKER_ENTRIES` maps 1:1 to a docx maker (see the
table above).

### Legacy `MAKER_MARKS` shim orphans: 4

These 4 legacy `MakerMarkEntry_Legacy` shim entries reference makers
NOT covered anywhere in `/tmp/makermark-clean.md`:

| Legacy shim id (line) | Maker | Why orphan |
|---|---|---|
| `thonet_mark` (2924) | Thonet / Gebrüder Thonet | European bentwood maker; out of scope for the American-centric docx ("American Furniture Maker's Mark Reference, 1600 to Present" per line 16). |
| `wallace_nutting_label` (2934) | Wallace Nutting | American Colonial Revival reproduction maker (1900-1941); not in docx. |
| `karges_furniture_label` (3007) | Karges Furniture | Evansville Indiana high-end reproduction maker (1886-present); not in docx. |
| `toledo_metal_furniture_label` (3061) | Toledo Metal Furniture Co. | American metal-furniture maker (1920-1960); not in docx. |

Also note: 2 legacy shim entries cover Globe-Wernicke variants
(`globe_wernicke_paper_label_early`, `globe_wernicke_stamped_mark_late`,
`globe_wernicke_gw_office_equip_service_label`) and the docx covers
Globe-Wernicke as a single firm entry. The new-schema entry
`maker_mark_globe_wernicke_co` collapses the 3 legacy shim variants
into a single firm entry per docx structure. This is a structural
realignment, not orphan content.

The 4 legacy-orphan entries are not loss-of-coverage at the engine
level today (they're still wired and consumed), but they will
disappear when the Phase 3 weighting integration retires the legacy
shim — unless Mike decides to author them into the new schema or
extend the docx source first (see Replacement Seed Framing section).

## Reasoning rules engine status

The 8 `MAKER_ATTRIBUTION_REASONING_RULES` entries (lines 2701-2814):

| Rule id | migration_target | cross_layer_scope | Engine-visible today |
|---|---|---|---|
| `..._core_attribution_rule` | engine_reasoning | true | No |
| `..._universal_initials_not_enough` | engine_reasoning | false | No |
| `..._universal_city_not_maker` | engine_reasoning | false | No |
| `..._universal_association_not_single` | engine_reasoning | false | No |
| `..._universal_retail_not_maker` | engine_reasoning | false | No |
| `..._universal_line_name_not_maker` | engine_reasoning | false | No |
| `..._confidence_ladder` | report_layer | false | No |
| `..._globe_wernicke_correction` | engine_reasoning | false | No |

Per engine-consumability-spec.md §6, no engine code consumes any
`*_REASONING_RULES` array. These 8 rules are docx-faithful (each
rule statement quotes the seed's Core Attribution Rule + Universal
False-Positive Rules + 4-tier Confidence Ladder + Globe-Wernicke
Correction worked example) but pure documentation today.

## Per-entry richness exceeds docx (value-added authoring observations)

Many canonical entries materially exceed the docx with appraiser-
voice value-add — these are NOT drift, they are productive
authoring beyond the seed text:

1. **Founding-year footnotes in `usage_notes`** — e.g., Hooker
   (line 2269: "Founded 1924"), Bassett (1649: "Founded 1902"),
   Harden (2299: "Firm founded 1844"), Pulaski, Broyhill (1618:
   "Founded 1926"), Pennsylvania House, Stanley Furniture. None
   of these years appear in the docx; they're author-supplied
   industry-history footnotes anchoring `period_associations.
   date_floor` to firm-history rather than the docx's blanket
   "20th century onward" framing.
2. **AntiClassificationGuidance for name-change boundaries** —
   Hitchcock 1948 (line 321-326), Heywood-Wakefield 1921 (1355-
   1360), Drexel/Drexel Heritage 1969 (1590-1595), Lane (similar
   pattern around the 1912 founding boundary). These encode the
   docx's prose name-change observations into structured
   boundary fields suitable for form-evaluator consumption once
   the form evaluator's domain expands to maker entries.
3. **Cross-rule references in `false_positive_warnings`** —
   "See Universal Rule #5 line_name_not_maker..." appearing in
   Drexel (line 1587), Broyhill (1624), Bassett (1654), Eames-
   for-Herman-Miller (2373), Nelson-for-Herman-Miller (2404),
   Saarinen-for-Knoll (2434), Bertoia-for-Knoll (2464), and
   most other line-name-vulnerable entries. Operationalizes the
   reasoning-rule cross-reference architecture even though the
   rules are engine-invisible today.
4. **Block-level authoring decision notes in `notes`** — e.g.,
   "Per Op A-4 Surfacing 1 resolution (Mike-approved default)"
   on Drexel (1564); "DO NOT MERGE with L. & J.G. Stickley,
   Stickley Brothers, or Stickley Associated Cabinetmakers per
   seed lineage discipline" on Gustav Stickley (974); "per
   Block 28a A-7 cross-batch coordination decision" on Heywood-
   Wakefield (1326). Preserves the decision rationale traceable
   back to the authoring blocks.
5. **`mark_text_patterns` field carries case-normalized engine-
   readable substrings** — e.g., Heywood-Wakefield (line 1339):
   `["heywood-wakefield", "heywood wakefield", "fine furniture
   by heywood"]`. Parallels the legacy shim's same-named field;
   suggests the Phase 3 weighting integration plans to feed
   `mark_text_patterns` into a text-fallback consumer analogous
   to `detectClueFromText` for maker-mark text matching.
6. **Licensee structural detail in designer entries** — Eames-
   for-Herman-Miller entry (line 2353) cites "Eames.com
   documentation: labels and stamps changed over time and are
   among the quickest ways to authenticate Eames designs;
   multiple patent labels documented from 1957 through 1993"
   verbatim from docx + adds furniture_categories enumeration
   (LCW/LCM/DCW; ESU; aluminum group; soft pad group) not in
   docx.

## Per-entry gaps

All 77 docx-matched entries are **GOOD** with respect to docx
content fidelity. Per-entry granular review:

| Canonical entry | Status | Notes |
|---|---|---|
| All 77 entries | GOOD | Region, Date Range, Furniture Categories, Known Marks, Common Locations, Visual/Wording Traits, False Positive Warning, and Confidence Rule fields are faithfully captured. Special Caution / Dating Caution / Dating Clue / Eames Label Caution / Safety Note / Dating-License Note sub-sections (Hitchcock, Drexel, Lane, Herman Miller, Kittinger) are captured into `notes` or `dating_clues` or `false_positive_warnings`. |

The audit found no per-entry content gaps. The engine-visibility
gaps documented above (new schema engine-invisible; reasoning rules
engine-invisible; diagnostic_caution_text schema-absent) are
architectural / cross-cutting, not per-entry.

## Legacy shim consumed today (Phase 3 retirement target)

The 25-entry legacy `MAKER_MARKS: MakerMarkEntry_Legacy[]` array
(makerMarks.ts:2852-3102) is what the engine consumes today via
`engine.ts:2 / 2970 / 3914`. Per-shim coverage relative to docx:

| Legacy shim id | Docx coverage | New-schema equivalent |
|---|---|---|
| `globe_wernicke_paper_label_early` | covered by docx Globe-Wernicke Co. entry | `maker_mark_globe_wernicke_co` |
| `globe_wernicke_stamped_mark_late` | covered | `maker_mark_globe_wernicke_co` |
| `john_henry_belter_label` | covered | `maker_mark_john_henry_belter` |
| `hitchcock_chair_company_label` | covered | `maker_mark_lambert_hitchcock` |
| `berkey_and_gay_label` | covered | `maker_mark_berkey_and_gay` |
| `l_jg_stickley_mark` | covered | `maker_mark_l_and_jg_stickley` |
| `stickley_brothers_mark` | covered | `maker_mark_stickley_brothers` |
| `thonet_mark` | **ORPHAN** (not in docx) | none |
| `wallace_nutting_label` | **ORPHAN** | none |
| `herman_miller_label` | covered | `maker_mark_herman_miller` |
| `knoll_label` | covered | `maker_mark_knoll` |
| `saarinen_label` | covered | `maker_mark_saarinen_for_knoll` |
| `heywood_wakefield_mark` | covered | `maker_mark_heywood_wakefield_co` |
| `kittinger_label` | covered | `maker_mark_kittinger` |
| `baker_furniture_label` | covered | `maker_mark_baker_furniture` |
| `kindel_furniture_label` | covered | `maker_mark_kindel` |
| `karges_furniture_label` | **ORPHAN** | none |
| `drexel_heritage_label` | covered | `maker_mark_drexel` |
| `broyhill_label` | covered | `maker_mark_broyhill` |
| `lane_furniture_label` | covered | `maker_mark_lane_company` |
| `ethan_allen_label` | covered | `maker_mark_ethan_allen` |
| `thomasville_label` | covered | `maker_mark_thomasville` |
| `toledo_metal_furniture_label` | **ORPHAN** | none |
| `roos_sweetheart_label` | covered (single Roos firm) | `maker_mark_roos_manufacturing` |
| `globe_wernicke_gw_office_equip_service_label` | covered | `maker_mark_globe_wernicke_co` |

Phase 3 weighting integration plan implications:
- 21 / 25 legacy entries have direct new-schema equivalents.
- 4 legacy entries are orphan-from-docx (Thonet, Wallace
  Nutting, Karges, Toledo Metal) — Mike's decision required per
  Replacement Seed Framing section.
- 3 legacy entries (Globe-Wernicke variants × 3) collapse to a
  single firm entry in the new schema; the per-variant date
  ranges in the legacy shim (1899-1915 paper label; 1916-1930
  stamped; c. 1920-1940 GW office) carry richer per-mark-variant
  dating that the new single-firm entry would lose. **Phase 3
  integration MAY want to preserve the per-mark-variant
  structure** by either (a) sub-keying within the firm entry via
  a new field (e.g., `mark_variants: Array<{wording, date_floor,
  date_ceiling, confidence_weight}>`) or (b) keeping the legacy
  3 shim entries alongside the firm-level new-schema entry as
  per-mark-variant detail.

## Concluding observations

1. The audit confirms **the new `MAKER_ENTRIES` schema is the
   "Replacement Seed"** — fully docx-faithful, 1:1 match, era-
   ordered. The Block 27 / Block 28 / Block 28b authoring has
   already done the work of replacing the legacy shim with a
   docx-faithful canonical authoring. **Phase 3 weighting
   integration is the activation event**, not a re-authoring
   event.

2. **Schema extension recommendation**: add
   `diagnostic_caution_text?: string` to `MakerMarkEntry` per the
   hardware.ts (Block 21a) / woodEvidence (Block 22) precedent.
   Without it, the docx's Confidence Rule and False Positive
   Warning content (the highest-authority appraiser-voice content
   in the docx) remains engine-invisible after Phase 3 integration.
   The `wear_characteristics` and `cousin_contrasts` field
   extensions are NOT recommended for this library (no docx
   content; analogues already in `related_names` and
   `false_positive_warnings`).

3. **Globe-Wernicke per-mark-variant preservation**: legacy shim
   carries 3 GW entries with sharper per-variant date windows
   (1899-1915, 1916-1930, c. 1920-1940). The single new-schema
   Globe-Wernicke entry loses this granularity. Mike may want
   Phase 3 to either re-introduce per-mark-variant sub-structure
   on the new schema or keep the legacy 3 GW shims alive
   alongside the firm-level entry.

4. **Legacy-orphan disposition decision** (Thonet, Wallace
   Nutting, Karges, Toledo Metal Furniture): Mike's call. See
   Replacement Seed Framing section's three options.

5. **`maker_label` / `roos_label` / `lane_label` engine routing
   gap**: `engineCanonicalMap.ts:84-86` declares these clue keys
   as `NO_MATCH` with explicit comments referring to the new
   schema. Phase 3 integration must wire these clue keys to
   specific new-schema entry ids — most obviously
   `roos_label → maker_mark_roos_manufacturing` and
   `lane_label → maker_mark_lane_company`, plus
   `maker_label` either to a generic "unknown maker" sentinel
   or routed via a per-text-pattern engine pass that consumes
   `mark_text_patterns` from the new schema.
