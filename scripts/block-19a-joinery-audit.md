# Block 19a: Joinery Canonical ↔ Docx Audit

Generated against JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx (15 categories
+ 40 specific types, per 40 DATE RANGE markers in the source) and canonical
`lib/constraints/joinery.ts` (15 category entries + 44 type entries; 5
reasoning-rule entries skipped — meta content, not per-entry data).

## Summary

- Docx entries: 55 (15 categories + 40 specific types)
- Canonical entries audited: 59 (15 `joinery_category` + 44 `joinery_type`;
  5 `joinery_reasoning_rule` entries are meta and out of scope for this audit)
  - Note: the Block 19a prompt expected 16 categories + 45 types. Actual file
    counts are 15 + 44. The discrepancy is not a coverage gap — every docx
    category and type has a canonical home, and the canonical library carries
    4 orphan type entries (the Block 0.5c additions) plus zero orphan
    categories. The prompt's 16/45 figure appears to be off by one in each
    bucket.
- Matched pairs (category↔category + type↔type): 55 (15 categories + 40 types)
- Docx entries with NO canonical match (missing canonical authoring): 0
- Canonical entries with NO docx match (orphan canonical entries): 4
  (joinery_type_factory_case_construction, joinery_type_glued_and_nailed_casework,
  joinery_type_dado_joint, joinery_type_plywood_drawer_bottom — all Block 0.5c
  FK-validation surfacings, not docx types)
- Type entries missing `wear_characteristics` (schema field absent): 44/44
  (entire library — schema does not yet declare the field)
- Type entries missing `cousin_contrasts` (schema field absent): 44/44
  (entire library — schema does not yet declare the field)
- Type entries with empty/absent `regional_persistence_notes` where docx has
  no explicit regional content: 40/40 (docx joinery has no per-type
  Regional Persistence subsections; rural persistence lives in the docx
  RURAL PERSISTENCE WARNING meta block and is already surfaced via the
  `joinery_reasoning_rural_persistence_warning` reasoning rule + populated
  on 4 hand-craft type entries today)
- Type entries with empty `related_form_types` / `related_joinery_types`
  beyond what docx supports: see per-entry notes (docx joinery does not
  enumerate related-form cross-refs in per-type sections)
- Type entries with dating drift between docx and canonical: 1
  (joinery_type_butt_edge_glued — docx says "Most common after widespread
  hide glue usage; extremely common after 1850"; canonical `date_floor: 1500`
  is the spans_eras convention but the `usage_notes` only restates the docx;
  no actual drift, just a Q on whether the 1500 floor matches the docx
  "Ancient usage to present" intent. Other entries match cleanly.)
- Entries with engine-invisible content (`caution_text` populated instead
  of `diagnostic_caution_text`): 4 (factory_case_construction,
  glued_and_nailed_casework, dado_joint, plywood_drawer_bottom — all the
  Block 0.5c orphan additions)
- Entries with `date_ceiling: 2030` legacy sentinel: 4 entries / 8
  occurrences (same Block 0.5c additions)

Status distribution for the 40 docx-matched type entries:
GOOD = 8, PARTIAL = 32, MAJOR = 0.

(There are no MAJOR statuses because every docx-type-matched canonical
entry has at minimum `description`, `unique_traits`,
`identifying_characteristics`, `period_associations`, and
`date_range_summary` populated faithfully from the seed. PARTIAL status
in this audit overwhelmingly reflects schema-absent gap fields
[`wear_characteristics`, `cousin_contrasts`] which would require schema
extension before authoring can begin — the parallel to Block 17's
upholstery interface extension.)

## Schema extension required (parallel to Block 17 for upholstery)

Block 17 added `wear_characteristics?: string[]` and `cousin_contrasts?:
string[]` to `UpholsteryConstructionTypeEntry` and
`UpholsteryCoverTypeEntry`. The joinery interfaces do NOT yet declare
these fields. Verified against `lib/constraints/joinery.ts:96-150`
(`JoineryTypeEntry`) and `lib/constraints/joinery.ts:57-65`
(`JoineryCategoryEntry`):

**`JoineryTypeEntry` — fields to add:**
- `wear_characteristics?: string[]` — joinery wear is observable on
  surviving pieces (e.g., dovetail tail erosion, loosened drawbore peg
  shrinkage, M&T shoulder gapping from seasonal movement, hammer-veneer
  edge lifting, biscuit-joint glue-line failure). Authoring discipline:
  short noun-phrase observations, capitalized first word, no terminal
  period — matching the existing `identifying_characteristics` casing.
- `cousin_contrasts?: string[]` — joinery types frequently need
  contrast against close cousins (through dovetail vs sliding dovetail
  vs half-blind dovetail; through vs blind vs wedged vs pegged vs
  drawbored M&T; spline vs biscuit vs dowel; rabbet vs dado vs groove;
  hammer veneer vs vacuum press; basic-butt-corner vs butt-edge-glued).
  Authoring discipline: one complete sentence per array item,
  capitalized, ending with a period.

**Engine consumability note:** per `engine-consumability-spec.md` §6,
joinery type entries are NOT in the upholstery LLM appendix path —
`wear_characteristics` would not surface to the engine via
`buildUpholsteryCanonicalAppendix`. Authoring them would be documentation-
only until a parallel `buildJoineryCanonicalAppendix` is added. Same
caveat applies to `cousin_contrasts`. Mike should know this is "author
for future engine consumer" work, not engine-immediate visibility.

**`JoineryCategoryEntry` — no missing fields.** The Block 30 schema
already covers `category_description`, `unique_category_traits`,
`identifying_elements`, `common_in` — exactly the four field shapes the
docx category-level content provides. No extension needed at the
category level.

**Other potentially missing fields (lower priority):**
- `related_form_types?: string[]` — would mirror the
  `UpholsteryConstructionTypeEntry`/`UpholsteryCoverTypeEntry` Block 17
  addition. Joinery types do correlate with form types in practice
  (bed bolt joinery → form_bed; webbing rail joinery → form_sofa /
  form_armchair; round tenon joinery → Windsor chair forms). The docx
  joinery doc does not enumerate per-type form-application lists the way
  the upholstery docx does, so this is a lower-priority schema gap than
  wear/cousin.
- `regional_persistence_notes?` — ALREADY DECLARED on `JoineryTypeEntry`
  (line 111). Populated on 4 type entries today
  (through_dovetail, hand_cut_drawer_dovetails, wedged_tenon,
  drawbored_mortise_and_tenon, splayed_wedged_through_tenons). All
  population sources from the docx RURAL PERSISTENCE WARNING meta block
  rather than per-type regional subsections, so the population pattern
  is correct.

## Pre-existing engine-invisible content

Per `engine-consumability-spec.md` §2 — `getCanonicalCautionText` reads
only `diagnostic_caution_text`; the shared `caution_text` field is
unread.

**Joinery entries populating `caution_text` (invisible to the engine):**
1. `joinery_type_factory_case_construction` (line 1682) — 4-sentence
   appraiser caution about distinguishing skilled shop casework with
   machine-sawn stock from true factory case construction. Engine reads
   nothing here today.
2. `joinery_type_glued_and_nailed_casework` (line 1749) — caution about
   distinguishing original nailed construction from repair-introduced
   nails. Engine-invisible.
3. `joinery_type_dado_joint` (line 1817) — long caution distinguishing
   dado from groove/rabbet; warns against dating from dado presence
   alone. Engine-invisible.
4. `joinery_type_plywood_drawer_bottom` (line 1875) — caution about
   distinguishing original plywood drawer bottoms from later
   plywood replacement / repair. Engine-invisible.

All four are Block 0.5c orphan additions (no docx counterpart). Mike's
existing remediation pathway: rename `caution_text` →
`diagnostic_caution_text` on these four entries when the joinery library
is next opened for editing.

**Date strings in joinery `date_range_summary` that won't parse cleanly
per `parseRangeToNumeric` rules:**

The `date_range_summary` field is NOT consumed by `parseRangeToNumeric`
today (engine reads only `entry.date_floor` / `entry.date_ceiling` /
`entry.period_associations[*].date_floor/ceiling` for date hints — see
§2 `dateHintFor`). So `date_range_summary` prose is documentation-only.
That said, ad-hoc strings that fall to bare-year parsing if any future
consumer parses them:

- `"Ancient–present"` (joinery_type_basic_butt_corner,
  joinery_type_blind_mortise_and_tenon, joinery_type_coopered_joinery)
  — would fail rule #1 (no second 4-digit year); falls to no-match.
  The canonical `period_associations` use `date_floor: 1500` as the
  Ancient sentinel.
- `"1700s–early 1900s"` (joinery_type_hammer_veneering and others) —
  en-dash range with `early 1900s` not parseable; the rule #4 decade
  match fires on `1700s` only, missing the closed-range intent. Engine
  is OK because canonical `period_associations[0]` carries the explicit
  `date_floor: 1700, date_ceiling: 1909`.
- `"post-1870 broadly; increasingly common after c. 1900..."`
  (joinery_type_factory_case_construction date_range_summary) — multi-
  clause prose; rule #2 `post-1870` would match if the string were ever
  parsed but rule #1 would first fire on the bare `c. 1900` clause.
  Again documentation-only today.
- `"1700s–present"`, `"1800s–present"`, etc. — these are en-dash, no
  closed second year; rule #4 decade fires on the floor decade only
  (e.g., `1700s` → `{1700, 1709}`), which is silently narrower than
  intent. Documentation-only today.

Net: the joinery library's `date_range_summary` prose is consistent
internally but is engine-invisible. No remediation required unless a
future engine consumer starts parsing `date_range_summary`.

## Convention drift (existing entries)

Per `authoring-conventions.md`:

### Drift item 1 — `date_ceiling: 2030` legacy sentinel (4 entries, 8 occurrences)

`authoring-conventions.md:40-44` and the `entryShape.ts` canonical lock
(line 136-138) say to OMIT `date_ceiling` on open-ended-to-present
periods. The 2030 sentinel is treated as legacy "pre-convention
holdover".

The four offenders, all in the Block 0.5c additions:

- `joinery_type_factory_case_construction` (lines 1667, 1668) — 2x
  `date_ceiling: 2030`
- `joinery_type_glued_and_nailed_casework` (lines 1732, 1733) — 2x
  `date_ceiling: 2030`
- `joinery_type_dado_joint` (lines 1801, 1802) — 2x `date_ceiling: 2030`
- `joinery_type_plywood_drawer_bottom` (lines 1865, 1866) — 2x
  `date_ceiling: 2030`

None of the 40 docx-matched type entries carry the 2030 sentinel —
they all correctly omit `date_ceiling` for open-ended periods. The drift
is confined to the orphan additions. Remediation is to drop those
ceilings (or convert to `usage_notes`-only annotation).

### Drift item 2 — "Arts & Crafts" vs "Arts and Crafts"

`authoring-conventions.md:259-262`: upholstery libraries and
`styleFamilies.ts` use spelled-out `Arts and Crafts`; joinery has
historically used the ampersand form. The audit confirms joinery is
internally consistent with the ampersand form: 17 occurrences across
period_label, indicator_text, regional_persistence_notes, etc. (e.g.,
lines 559, 733, 1011, 1340).

Cross-library, the joinery convention diverges from upholstery /
styleFamilies. This is a documented inconsistency (`authoring-
conventions.md:259-262`), not a bug. Current canonical convention for
the joinery library is "Arts & Crafts" (ampersand); leave existing
content alone. If new joinery entries are authored, follow joinery-
internal precedent (ampersand) — or open a separate normalization
sub-block to align all libraries.

### Drift item 3 — en-dash vs hyphen vs prose for date ranges

`authoring-conventions.md:64-84` documents three coexisting conventions:
- En-dash with `c.` prefix (joinery + fasteners): 38 occurrences in
  joinery
- ASCII hyphen, no `c.` (hardware): some occurrences in joinery's Block
  0.5c additions ("1850s-1870s" etc.)
- Prose "to" (upholstery): not used in joinery

Joinery's 40 docx-matched entries follow Convention 1 (en-dash, `c.`
prefix) — internally consistent. The Block 0.5c additions mix
Convention 2 (`"1850s-1870s"` plain hyphen) into prose-style
`date_range_summary` fields. No engine consequences (the field is
documentation-only), but flag for future editorial pass.

### Drift item 4 — docx en-dash in DATE RANGE entries: "1700s–present"

Docx uses Unicode en-dash `–` (U+2013) consistently. Canonical type
entries preserve this. No drift.

### Drift item 5 — `parent_category_id` on Block 0.5c additions

All 4 Block 0.5c orphan entries correctly set `parent_category_id` to
existing canonical category ids. No drift.

### Drift item 6 — `replacement_likelihood` lowercase compliance

Per `engine-consumability-spec.md` §2: strict lowercase `"low" | "medium"
| "high"`. Joinery's 4 entries populating `replacement_likelihood` all
use `"low"` correctly (lines 1683, 1750, 1818, 1876). The 40 docx-
matched type entries do not populate `replacement_likelihood` at all —
defensible per the docx's lack of per-type replacement guidance.

## Missing canonical entries (docx has, canonical lacks)

**None.** All 15 docx categories and all 40 docx specific types map 1:1
to existing canonical entries. Mapping confirmed by name:

| Docx category | Canonical id |
|---|---|
| EDGE-TO-EDGE JOINERY | joinery_category_edge_to_edge |
| CORNER JOINERY | joinery_category_corner |
| FRAME JOINERY | joinery_category_frame |
| CARCASE / CASE CONSTRUCTION JOINERY | joinery_category_carcase_case_construction |
| DRAWER JOINERY | joinery_category_drawer |
| PANEL RETENTION JOINERY | joinery_category_panel_retention |
| MORTISE-AND-TENON FAMILY | joinery_category_mortise_and_tenon_family |
| DOVETAIL FAMILY | joinery_category_dovetail_family |
| MECHANICAL / REINFORCED JOINERY | joinery_category_mechanical_reinforced |
| CHAIR AND SEATING JOINERY | joinery_category_chair_and_seating |
| VENEER AND SURFACE JOINERY | joinery_category_veneer_and_surface |
| DECORATIVE / SPECIALTY JOINERY | joinery_category_decorative_specialty |
| KNOCK-DOWN / MODULAR JOINERY | joinery_category_knock_down_modular |
| MODERN INDUSTRIAL JOINERY | joinery_category_modern_industrial |
| UPHOLSTERY STRUCTURAL JOINERY | joinery_category_upholstery_structural |

| Docx type | Canonical id |
|---|---|
| Butt Joint (Edge Glued) | joinery_type_butt_edge_glued |
| Tongue-and-Groove | joinery_type_tongue_and_groove |
| Spline Joint | joinery_type_spline_joint |
| Biscuit Joint | joinery_type_biscuit_joint |
| Butterfly / Dutchman Key | joinery_type_butterfly_dutchman_key |
| Basic Butt Joint (Corner) | joinery_type_basic_butt_corner |
| Rabbet Joint | joinery_type_rabbet_joint |
| Miter Joint | joinery_type_miter_joint |
| Locked Miter | joinery_type_locked_miter |
| Half-Lap Joint | joinery_type_half_lap_joint |
| Bridle Joint | joinery_type_bridle_joint |
| Finger / Box Joint | joinery_type_finger_box_joint |
| Through Dovetail | joinery_type_through_dovetail |
| Sliding Dovetail | joinery_type_sliding_dovetail |
| Hand-Cut Drawer Dovetails | joinery_type_hand_cut_drawer_dovetails |
| Machine-Cut Drawer Dovetails | joinery_type_machine_cut_drawer_dovetails |
| Stapled Drawer Joinery | joinery_type_stapled_drawer_joinery |
| Frame-and-Panel Construction | joinery_type_frame_and_panel |
| Through Mortise-and-Tenon | joinery_type_through_mortise_and_tenon |
| Blind Mortise-and-Tenon | joinery_type_blind_mortise_and_tenon |
| Wedged Tenon | joinery_type_wedged_tenon |
| Pegged Mortise-and-Tenon | joinery_type_pegged_mortise_and_tenon |
| Drawbored Mortise-and-Tenon | joinery_type_drawbored_mortise_and_tenon |
| Half-Blind Dovetail | joinery_type_half_blind_dovetail |
| Secret Mitered Dovetail | joinery_type_secret_mitered_dovetail |
| Dowel Joinery | joinery_type_dowel_joinery |
| Pocket Screw Joinery | joinery_type_pocket_screw_joinery |
| Corrugated Fastener Reinforcement | joinery_type_corrugated_fastener_reinforcement |
| Round Tenon Joinery | joinery_type_round_tenon_joinery |
| Splayed/Wedged Through Tenons | joinery_type_splayed_wedged_through_tenons |
| Hammer Veneering | joinery_type_hammer_veneering |
| Vacuum Press Veneering | joinery_type_vacuum_press_veneering |
| Knuckle Joint | joinery_type_knuckle_joint |
| Coopered Joinery | joinery_type_coopered_joinery |
| Bed Bolt Joinery | joinery_type_bed_bolt_joinery |
| Knock-Down Cam Lock Joinery | joinery_type_knock_down_cam_lock_joinery |
| Confirmat Screw Joinery | joinery_type_confirmat_screw_joinery |
| CNC Interlocking Joinery | joinery_type_cnc_interlocking_joinery |
| Corner Block Reinforcement | joinery_type_corner_block_reinforcement |
| Webbing Rail Joinery | joinery_type_webbing_rail_joinery |

## Orphan canonical entries (canonical has, docx lacks)

Four type entries, all `parent_category_id:
joinery_category_carcase_case_construction` or `joinery_category_drawer`,
all authored in Block 0.5c per FK-validation surfacing (D-PH3HCL-S3-N):

1. `joinery_type_factory_case_construction` (lines 1642-1704) — FK-
   validation gap: toolmark circular-saw + band-saw → factory casework
   composition. Carries `caution_text` (engine-invisible), 2x
   `date_ceiling: 2030` (legacy sentinel).
2. `joinery_type_glued_and_nailed_casework` (lines 1706-1770) — FK-
   validation gap: "glue + wire nail" cheap-casework class. Carries
   `caution_text` (engine-invisible), 2x `date_ceiling: 2030`.
3. `joinery_type_dado_joint` (lines 1772-1837) — FK-validation gap:
   `joinery_type_dadoed_shelf_construction` referenced but no "dado"
   canonical entry existed. Carries `caution_text` (engine-invisible),
   2x `date_ceiling: 2030`.
4. `joinery_type_plywood_drawer_bottom` (lines 1839-1896) — HCL
   migration M2 routing per D-PH3HCL-S3-N. Cross-library entry
   (joinery + woodEvidence). Carries `caution_text` (engine-invisible),
   2x `date_ceiling: 2030`.

None of these should be removed — they fill real Phase 2 / Phase 3 gaps
beyond the docx. But all four warrant the `caution_text` →
`diagnostic_caution_text` rename and `date_ceiling: 2030` removal as
hygiene work.

## Category-level audit (15 categories)

Format: status, then docx-vs-canonical field-by-field check on
`category_description`, `unique_category_traits`,
`identifying_elements` / `common_in`.

### CATEGORY 1: EDGE-TO-EDGE JOINERY → joinery_category_edge_to_edge

**Status:** GOOD

- description: matches ("Joinery used to widen boards by connecting
  edges together into larger panels such as tabletops, case sides,
  lids, desk surfaces, cabinet backs.")
- unique_category_traits: 5/5 docx items captured verbatim.
- identifying_elements: 8/8 docx items captured verbatim.

### CATEGORY 2: CORNER JOINERY → joinery_category_corner

**Status:** GOOD

- description: matches.
- unique_category_traits: 3/3 captured.
- identifying_elements: 6/6 captured.

### CATEGORY 3: FRAME JOINERY → joinery_category_frame

**Status:** GOOD

- description: matches ("Joinery creating skeletal frameworks.")
- unique_category_traits: 3/3 captured ("load-bearing intersections",
  "racking resistance", "leg/apron integration").
- common_in: 5/5 captured (chairs, tables, cabinet frames, bedsteads,
  mirrors). Note canonical uses `common_in` field instead of
  `identifying_elements` — correct per docx "COMMON IN" wording.

### CATEGORY 4: CARCASE / CASE CONSTRUCTION JOINERY → joinery_category_carcase_case_construction

**Status:** GOOD

- description: matches.
- unique_category_traits: 3/3 captured. (Note: docx labels this section
  "UNIQUE TRAITS" without the "CATEGORY" qualifier — canonical correctly
  maps it.)
- identifying_elements: NOT IN DOCX for this category — canonical
  correctly omits.

### CATEGORY 5: DRAWER JOINERY → joinery_category_drawer

**Status:** GOOD

- description: matches.
- unique_category_traits: 3/3 captured.
- identifying_elements: NOT IN DOCX — canonical correctly omits.

### CATEGORY 6: PANEL RETENTION JOINERY → joinery_category_panel_retention

**Status:** GOOD

- description: matches.
- unique_category_traits: 2/2 captured.
- identifying_elements: NOT IN DOCX — canonical correctly omits.

### CATEGORY 7: MORTISE-AND-TENON FAMILY → joinery_category_mortise_and_tenon_family

**Status:** GOOD

- description: matches.
- unique_category_traits: 3/3 captured (note docx uses "UNIQUE CATEGORY
  TRAITS" here; canonical maps correctly).
- identifying_elements: NOT IN DOCX — canonical correctly omits.

### CATEGORY 8: DOVETAIL FAMILY → joinery_category_dovetail_family

**Status:** GOOD

- description: matches.
- unique_category_traits: 3/3 captured.
- identifying_elements: NOT IN DOCX — canonical correctly omits.

### CATEGORY 9: MECHANICAL / REINFORCED JOINERY → joinery_category_mechanical_reinforced

**Status:** PARTIAL

- description: matches ("Joinery augmented by secondary mechanical
  support.")
- unique_category_traits: NOT IN DOCX — canonical correctly omits.
- identifying_elements: NOT IN DOCX — canonical correctly omits.
- Note: canonical entry has NO unique_category_traits / identifying_elements
  populated, which matches the docx (which provides only CATEGORY
  DESCRIPTION for this category). PARTIAL only because the category-
  level information is genuinely sparse; no gap to flag.

### CATEGORY 10: CHAIR AND SEATING JOINERY → joinery_category_chair_and_seating

**Status:** PARTIAL (sparse but faithful — same as #9)

- description: matches ("Joinery specialized for dynamic body loads.")
- unique_category_traits: NOT IN DOCX.
- identifying_elements: NOT IN DOCX.

### CATEGORY 11: VENEER AND SURFACE JOINERY → joinery_category_veneer_and_surface

**Status:** PARTIAL (sparse but faithful)

- description: matches.
- unique_category_traits: NOT IN DOCX.
- identifying_elements: NOT IN DOCX.

### CATEGORY 12: DECORATIVE / SPECIALTY JOINERY → joinery_category_decorative_specialty

**Status:** PARTIAL (sparse but faithful)

- description: matches.
- unique_category_traits: NOT IN DOCX.
- identifying_elements: NOT IN DOCX.

### CATEGORY 13: KNOCK-DOWN / MODULAR JOINERY → joinery_category_knock_down_modular

**Status:** PARTIAL (sparse but faithful)

- description: matches.
- unique_category_traits: NOT IN DOCX.
- identifying_elements: NOT IN DOCX.

### CATEGORY 14: MODERN INDUSTRIAL JOINERY → joinery_category_modern_industrial

**Status:** PARTIAL (sparse but faithful)

- description: matches.
- unique_category_traits: NOT IN DOCX.
- identifying_elements: NOT IN DOCX.

### CATEGORY 15: UPHOLSTERY STRUCTURAL JOINERY → joinery_category_upholstery_structural

**Status:** PARTIAL (sparse but faithful)

- description: matches.
- unique_category_traits: NOT IN DOCX.
- identifying_elements: NOT IN DOCX.

## Per-entry gaps (40 type entries)

Status legend:
- GOOD = no significant gaps; all docx content captured; no engine-
  invisible issues
- PARTIAL = 1-3 gap fields (typically schema-absent `wear_characteristics`
  / `cousin_contrasts` plus minor docx content unsurfaced)
- MAJOR = 4+ gap fields or major content loss

(Reminder: `wear_characteristics` and `cousin_contrasts` are
schema-absent on `JoineryTypeEntry` — every type entry will need both
fields once the schema is extended. Per-entry notes below flag whether
the docx has source content for each, and call out other gaps.)

### ENTRY 1: Butt Joint (Edge Glued) → joinery_type_butt_edge_glued

**Status:** PARTIAL

- description: GOOD. Docx: "Two flat board edges glued together
  without shaping." Canonical: matches verbatim.
- unique_traits: GOOD. 3/3 captured.
- identifying_characteristics: GOOD. 4/4 captured.
- period_associations / date_range_summary: GOOD. `date_floor: 1500`
  captures "Ancient usage to present"; usage_notes carries the 1850
  inflection.
- cousin_contrasts (schema-absent): docx content potentially derivable
  from sibling entries (e.g., "Differs from rabbet/tongue-and-groove
  because it has no shaped mechanical interlock"). Block authoring TBD.
- wear_characteristics (schema-absent): docx mentions "possible
  separation over time" and "alignment irregularities in handmade work"
  — wear-shaped content exists.
- related_joinery_types: not populated. Docx suggests adjacent
  edge-to-edge entries (tongue_and_groove, spline_joint).

### ENTRY 2: Tongue-and-Groove → joinery_type_tongue_and_groove

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 3/3.
- identifying_characteristics: GOOD. 3/3.
- period_associations / date_range_summary: GOOD. 1700s–present.
- cousin_contrasts (schema-absent): docx-implicit contrast against
  spline / butt edge-glued.
- wear_characteristics (schema-absent): minimal docx content here.
- related_joinery_types: not populated.

### ENTRY 3: Spline Joint → joinery_type_spline_joint

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 3/3.
- period_associations: GOOD. 1800s–present.
- cousin_contrasts (schema-absent): docx implies vs biscuit and vs
  dowel ("loose strip" vs "wafer" vs "pin").
- wear_characteristics (schema-absent): minimal docx content.
- related_joinery_types: not populated.

### ENTRY 4: Biscuit Joint → joinery_type_biscuit_joint

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 3/3.
- period_associations + date_range_summary + anti_classification_guidance:
  GOOD. Two-period structure (1950s experimental + 1980 widespread) +
  AG floor 1950. Engine-visible.
- cousin_contrasts (schema-absent): docx-implicit vs spline, vs dowel.
- wear_characteristics (schema-absent): docx "crescent/oval slot
  impressions" is identifying, not wear.
- related_joinery_types: not populated. Closest cousin is dowel and
  spline.

### ENTRY 5: Butterfly / Dutchman Key → joinery_type_butterfly_dutchman_key

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 3/3.
- period_associations: GOOD. Three-period structure (baseline + Arts &
  Crafts revival + modern artisan revival) per docx.
- cousin_contrasts (schema-absent): minimal docx content.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 6: Basic Butt Joint (Corner) → joinery_type_basic_butt_corner

**Status:** PARTIAL

- description: GOOD (canonical authored "Two boards joined at a corner
  with no shaping; relies entirely on nails, screws, or glue." per
  defensible-defaults note — docx has no DESCRIPTION for this entry).
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 3/3.
- period_associations: GOOD. Ancient–present (1500 sentinel) +
  "extremely common in inexpensive furniture after 1880" inflection in
  usage_notes.
- cousin_contrasts (schema-absent): docx implies vs rabbet ("partially
  hides end grain") and vs miter ("hides end grain").
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 7: Rabbet Joint → joinery_type_rabbet_joint

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. 1700s–present + 1850 machine-precision
  inflection.
- cousin_contrasts (schema-absent): docx-implicit vs dado (cross-grain
  vs edge); vs basic butt corner.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 8: Miter Joint → joinery_type_miter_joint

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 3/3 ("often splined or keyed"
  captured).
- period_associations: GOOD. 1600s–present.
- cousin_contrasts (schema-absent): docx implies vs locked miter
  ("fragile without reinforcement" vs "combines strength and hidden
  grain").
- wear_characteristics (schema-absent): docx "fragile without
  reinforcement" is wear-adjacent.

### ENTRY 9: Locked Miter → joinery_type_locked_miter

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 3/3.
- period_associations: GOOD. Mostly 20th century–present (1900 floor).
- cousin_contrasts (schema-absent): docx-implicit vs miter joint.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 10: Half-Lap Joint → joinery_type_half_lap_joint

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. 1700s–present.
- cousin_contrasts (schema-absent): docx-implicit vs bridle joint, vs
  finger joint.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 11: Bridle Joint → joinery_type_bridle_joint

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. Two-period (baseline + Arts & Crafts c.
  1890-1920).
- cousin_contrasts (schema-absent): docx-implicit vs through M&T
  (bridle is open-sided mortise).
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 12: Finger / Box Joint → joinery_type_finger_box_joint

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. Two-period (hand 1800s + machine 1880s–
  present). hand_vs_machine_classification: transitional. Engine-visible.
- cousin_contrasts (schema-absent): docx-implicit vs dovetail (different
  geometry) and vs half-lap.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 13: Through Dovetail → joinery_type_through_dovetail

**Status:** GOOD

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. Hand-Cut Examples + Machine-Cut
  Examples both captured as composite strings; this is a deliberate
  authoring choice per A-3 surfacing.
- period_associations: GOOD. Two-period (hand-cut + machine-cut
  widespread).
- regional_persistence_notes: POPULATED per RURAL PERSISTENCE WARNING
  meta-block.
- related_joinery_types: POPULATED (4 entries).
- hand_vs_machine_classification: transitional. Engine-visible.
- cousin_contrasts (schema-absent): docx-implicit vs sliding dovetail,
  vs half-blind dovetail, vs hand-cut drawer dovetails (drawer-specific
  variant).
- wear_characteristics (schema-absent): docx mentions chisel marks,
  scribe lines — these are identifying, not wear. Wear content thin.

### ENTRY 14: Sliding Dovetail → joinery_type_sliding_dovetail

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. 1700s–present.
- related_joinery_types: POPULATED (2 entries).
- cousin_contrasts (schema-absent): docx-implicit vs through dovetail
  ("trapezoidal sliding" vs "tails-and-pins").
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 15: Hand-Cut Drawer Dovetails → joinery_type_hand_cut_drawer_dovetails

**Status:** GOOD

- description: AUTHORED-FROM-DEFAULTS per notes (docx has no DESCRIPTION
  section — only UNIQUE TRAITS, IDENTIFYING CHARACTERISTICS, DATE RANGE).
  Canonical authored "Drawer-front dovetails cut by hand with saw and
  chisel..." — fair representation.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. Early Hand Work + Late Hand Work
  both captured as composite strings.
- period_associations: GOOD. Two-period (Early 1700s-1799 + Late
  1800-1900).
- regional_persistence_notes: POPULATED.
- related_joinery_types: POPULATED.
- hand_vs_machine_classification: strongly_early. Engine-visible.
- cousin_contrasts (schema-absent): docx-implicit vs machine-cut drawer
  dovetails, vs through dovetail.
- wear_characteristics (schema-absent): docx "narrow pins, wider tails,
  asymmetry, layout variation" are identifying, not wear. Wear thin.

### ENTRY 16: Machine-Cut Drawer Dovetails → joinery_type_machine_cut_drawer_dovetails

**Status:** PARTIAL

- description: AUTHORED-FROM-DEFAULTS per notes. Canonical "Drawer
  dovetails produced by mechanical dovetailers (Knapp 1867 and successor
  machines)." — adds detail beyond docx.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 3/3.
- period_associations: GOOD. 1870-present + Knapp dovetailer 1867
  introduction note.
- related_joinery_types: POPULATED.
- hand_vs_machine_classification: strongly_industrial. Engine-visible.
- cousin_contrasts (schema-absent): docx-implicit vs hand-cut drawer
  dovetails.
- wear_characteristics (schema-absent): minimal docx content.
- regional_persistence_notes (declared, empty): no docx content for
  this — machine-cut is not subject to the rural-persistence rule.

### ENTRY 17: Stapled Drawer Joinery → joinery_type_stapled_drawer_joinery

**Status:** PARTIAL

- description: AUTHORED-FROM-DEFAULTS per notes.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 3/3.
- period_associations + anti_classification_guidance: GOOD. AG floor
  1950. Engine-visible.
- hand_vs_machine_classification: strongly_industrial. Engine-visible.
- cousin_contrasts (schema-absent): docx-implicit vs machine-cut
  dovetail and vs hand-cut dovetail.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 18: Frame-and-Panel Construction → joinery_type_frame_and_panel

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 3/3.
- period_associations: GOOD. 1500s–present.
- cousin_contrasts (schema-absent): minimal docx content.
- wear_characteristics (schema-absent): docx "shrinkage gaps" is
  wear-adjacent.

### ENTRY 19: Through Mortise-and-Tenon → joinery_type_through_mortise_and_tenon

**Status:** GOOD

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 3/3.
- period_associations: GOOD. Two-period (baseline + Arts & Crafts
  revival c. 1890-1920).
- hand_vs_machine_classification: spans_eras.
- cousin_contrasts (schema-absent): docx-implicit vs blind M&T (visible
  vs concealed), vs wedged, vs pegged.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 20: Blind Mortise-and-Tenon → joinery_type_blind_mortise_and_tenon

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. Ancient–present.
- hand_vs_machine_classification: spans_eras.
- cousin_contrasts (schema-absent): docx-implicit vs through M&T.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 21: Wedged Tenon → joinery_type_wedged_tenon

**Status:** GOOD

- description: GOOD.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. 1600s–present.
- hand_vs_machine_classification: strongly_early. Engine-visible.
- regional_persistence_notes: POPULATED.
- related_joinery_types: POPULATED (1 entry).
- cousin_contrasts (schema-absent): docx-implicit vs splayed/wedged
  through tenons (cross-link populated), vs pegged M&T.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 22: Pegged Mortise-and-Tenon → joinery_type_pegged_mortise_and_tenon

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. 1600s–present.
- related_joinery_types: POPULATED (1: drawbored_mortise_and_tenon).
- cousin_contrasts (schema-absent): docx-implicit vs drawbored (peg
  hole offset for tension) and vs blind M&T.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 23: Drawbored Mortise-and-Tenon → joinery_type_drawbored_mortise_and_tenon

**Status:** GOOD

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. 1600s-early 1900s primary (1600/1909 closed
  range — engine-visible per dateHintFor).
- hand_vs_machine_classification: strongly_early. Engine-visible.
- regional_persistence_notes: POPULATED.
- related_joinery_types: POPULATED.
- cousin_contrasts (schema-absent): docx-implicit vs pegged M&T (offset
  peg geometry).
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 24: Half-Blind Dovetail → joinery_type_half_blind_dovetail

**Status:** PARTIAL

- description: GOOD ("Hidden from drawer front face.").
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. 1700s–present.
- related_joinery_types: POPULATED.
- cousin_contrasts (schema-absent): docx-implicit vs through dovetail
  (one-sided visibility), vs secret mitered (fully concealed).
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 25: Secret Mitered Dovetail → joinery_type_secret_mitered_dovetail

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. 1700s–present fine cabinetry.
- related_joinery_types: POPULATED (1).
- cousin_contrasts (schema-absent): docx-implicit vs half-blind
  dovetail.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 26: Dowel Joinery → joinery_type_dowel_joinery

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. Two-period (early hand-fit 1800-1949 +
  mass-production 1950+).
- hand_vs_machine_classification: strongly_industrial. Engine-visible.
- cousin_contrasts (schema-absent): docx-implicit vs biscuit (round vs
  oval), vs spline (pin vs strip).
- wear_characteristics (schema-absent): minimal docx content.
- related_joinery_types: not populated.

### ENTRY 27: Pocket Screw Joinery → joinery_type_pocket_screw_joinery

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 2/2.
- period_associations + anti_classification_guidance: GOOD. AG floor
  1980. Engine-visible.
- hand_vs_machine_classification: strongly_industrial.
- cousin_contrasts (schema-absent): docx-implicit vs confirmat screw
  (oversized particleboard variant) and vs traditional screwed
  reinforcement.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 28: Corrugated Fastener Reinforcement → joinery_type_corrugated_fastener_reinforcement

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 1/1.
- period_associations: GOOD. Late 1800s–present (1880 floor).
- cousin_contrasts (schema-absent): minimal docx content.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 29: Round Tenon Joinery → joinery_type_round_tenon_joinery

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 1/1 ("common in Windsor and stick furniture").
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. 1700s–present.
- structural_role: POPULATED ("Chair and stick furniture leg-to-seat
  attachment; Windsor tradition central.").
- cousin_contrasts (schema-absent): docx-implicit vs splayed/wedged
  through tenons (round vs wedged-flared) and vs M&T.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 30: Splayed/Wedged Through Tenons → joinery_type_splayed_wedged_through_tenons

**Status:** GOOD

- description: AUTHORED-FROM-DEFAULTS per notes (docx has no DESCRIPTION
  section).
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. 1700s–present with Arts & Crafts and
  Windsor especially per docx.
- hand_vs_machine_classification: strongly_early. Engine-visible.
- regional_persistence_notes: POPULATED.
- structural_role: POPULATED.
- related_joinery_types: POPULATED (2).
- cousin_contrasts (schema-absent): docx-implicit vs round tenon (cross-
  link populated), vs wedged tenon (cross-link populated).
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 31: Hammer Veneering → joinery_type_hammer_veneering

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 3/3 (including "occasional
  bubbles").
- period_associations: GOOD. 1700-early 1900s (closed 1700/1909 —
  engine-visible).
- cousin_contrasts (schema-absent): docx-implicit vs vacuum press
  veneering (traditional hide glue vs synthetic adhesive).
- wear_characteristics (schema-absent): docx "irregular glue lines",
  "veneer shrinkage", "occasional bubbles" — wear-adjacent content
  exists; could be split or kept as identifying.

### ENTRY 32: Vacuum Press Veneering → joinery_type_vacuum_press_veneering

**Status:** PARTIAL

- description: AUTHORED-FROM-DEFAULTS per notes (docx has no DESCRIPTION
  section).
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. Mid-1900s–present (1950 floor).
- cousin_contrasts (schema-absent): docx-implicit vs hammer veneering.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 33: Knuckle Joint → joinery_type_knuckle_joint

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 1/1.
- period_associations: GOOD. 1800s–present.
- cousin_contrasts (schema-absent): minimal docx content.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 34: Coopered Joinery → joinery_type_coopered_joinery

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 2/2.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. Ancient–present (1500 floor).
- hand_vs_machine_classification: spans_eras.
- cousin_contrasts (schema-absent): minimal docx content.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 35: Bed Bolt Joinery → joinery_type_bed_bolt_joinery

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 3/3.
- period_associations: GOOD. 1800s–present.
- cousin_contrasts (schema-absent): docx-implicit vs cam lock joinery
  (traditional bolted vs modern cam) and vs traditional pegged M&T (bed
  rail attachment alternatives).
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 36: Knock-Down Cam Lock Joinery → joinery_type_knock_down_cam_lock_joinery

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 2/2.
- period_associations + anti_classification_guidance: GOOD. AG floor
  1960. Engine-visible.
- hand_vs_machine_classification: strongly_industrial.
- cousin_contrasts (schema-absent): docx-implicit vs confirmat (both
  particleboard-era), vs bed bolt (traditional removable).
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 37: Confirmat Screw Joinery → joinery_type_confirmat_screw_joinery

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 2/2.
- period_associations + anti_classification_guidance: GOOD. AG floor
  1970. Engine-visible.
- hand_vs_machine_classification: strongly_industrial.
- cousin_contrasts (schema-absent): docx-implicit vs pocket screw
  (particleboard vs hardwood), vs cam lock.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 38: CNC Interlocking Joinery → joinery_type_cnc_interlocking_joinery

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 2/2.
- period_associations + anti_classification_guidance: GOOD. AG floor
  1990. Engine-visible.
- hand_vs_machine_classification: strongly_industrial.
- cousin_contrasts (schema-absent): docx-implicit vs machine-cut
  dovetails (CNC has no hand variation; machine-cut has rounded radii).
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 39: Corner Block Reinforcement → joinery_type_corner_block_reinforcement

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 2/2.
- period_associations: GOOD. 1800s–present.
- structural_role: POPULATED.
- cousin_contrasts (schema-absent): minimal docx content.
- wear_characteristics (schema-absent): minimal docx content.

### ENTRY 40: Webbing Rail Joinery → joinery_type_webbing_rail_joinery

**Status:** PARTIAL

- description: GOOD.
- unique_traits: GOOD. 1/1.
- identifying_characteristics: GOOD. 3/3.
- period_associations: GOOD. 1700s–present.
- structural_role: POPULATED.
- cousin_contrasts (schema-absent): docx-implicit vs corner block
  reinforcement (both upholstery-structural; different functions).
- wear_characteristics (schema-absent): docx "tack holes" is identifying
  but "webbing remnants" is wear-adjacent (degradation evidence).
