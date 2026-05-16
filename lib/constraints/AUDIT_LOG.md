# Constraint Library Audit Log

This file records every appraiser decision made during Phase 2 constraint library reconciliation. Each entry documents:

- The library and entry affected
- The disagreement or open question encountered
- The canonical decision made
- Brief rationale
- Date and session

## Format

### [Date] — Session N — [Library] — [Entry ID]

**Disagreement / question:** [What surfaced]

**Sources / context:** [Where the disagreement originated]

**Canonical decision:** [What got committed]

**Rationale:** [Brief appraiser reasoning]

---

## Entries

### 2026-05-02 — Session 1 — makerMarks.ts — roos_sweetheart_label

**Disagreement / question:** Engine.ts contained a hardcoded short-circuit for Roos returning "c. 1940–1960" with confidence "High". This date range was authored by a previous collaborator and is not consistent with the Sweetheart label era (1920s-1930s production).

**Sources / context:** Photographic evidence provided by the appraiser — showing the heart-and-sweetheart graphic alongside "Genuine Sweetheart Cedar Chest" text and the Ed Roos Company / Forest Park, IL markings — is the concrete anchor for this Sweetheart-era entry. The broader Roos production timeline (1916–1955, multiple distinct label variants spanning Roos Mfg. Co. Chicago, pre-Sweetheart Ed Roos Company, the tree symbol, and post-1940 labels) is appraiser narrative knowledge subject to ongoing research and will inform later canonical entries.

**Canonical decision:** Created `roos_sweetheart_label` entry with date_range "1920–1939", dating_authority "high". The hardcoded engine.ts short-circuit will be removed in Phase 3 cleanup per synthesis Section 12.3 ("Remove inline maker-mark hardcoded matches").

**Rationale:** Photo confirms label text and visual design. Date range follows appraiser timeline for Sweetheart-era production. Other Roos label variants (Roos Mfg. Co. Chicago, Ed Roos Company pre-Sweetheart, tree symbol, post-1940 labels) are not yet canonical pending appraiser research and will be added during Session 6.

---

### 2026-05-02 — Session 2 (Parts A + B) — forms.ts — batch migration

**Disagreement / question:** Migrating 23 forms from `lib/constants.ts DB.forms` into the canonical FormEntry shape required parsing free-text `common_eras` strings (e.g. "1700s–present", "early 1900s", bare "1800s") into numeric `date_floor` / `date_ceiling`. Two appraiser calls were needed beyond the global parsing rules.

**Sources / context:** Original `common_eras` strings were narrative shorthand inherited from the pre-canonical data. Migration to numeric bounds forces explicit decisions. All 23 entries flagged for review during planning; all but two parsed under approved global rules ("NNNNs" century → full century, "NNNNs" decade → that decade, "present" → omit ceiling).

**Canonical decisions:**
- **Global rule for "early 1900s":** floor + 1920 ceiling. Coincides with WWI / early industrial transition / design shift to mass production. Applied to `form_milking_stool` (date_floor 1800, date_ceiling 1920).
- **`form_jelly_cupboard` override:** original `common_eras: "1800s"` (full century, would have parsed to 1800–1899) narrowed to **1820–1880** per appraiser call. Rationale: post-Federal vernacular form, peak production through Victorian, declining as kitchen design shifted. Recorded inline in the entry's `notes` field.

**Rationale:** Both decisions tighten the date envelope to reflect peak-production windows the original era strings did not encode. The "early 1900s → 1920" rule is now reusable across future libraries (Parts C–F and beyond); the jelly cupboard narrowing is a per-entry appraiser call grounded in production-history pattern.

**Other notes for this batch:**
- `positive_authority` and `hard_negative_authority` are uniform placeholders of `7` for all 23 forms, pending Session 8 authority reconciliation. Not a per-form decision.
- `migration_status: "partial"` on all entries because Parts C (distinguishing_features) and D (regional_period_notes) have not yet been applied.
- `parent_category` carried over verbatim. Reclassification candidates surfaced during planning (f17 secretary_desk, f12 jelly_cupboard, f11 pie_safe, f04 washstand) — no changes this batch.
- `lib/constants.ts DB.forms` remains in place; removal deferred until no consumers reference it.

---

### 2026-05-03 — Session 2 (mid-session) — forms.ts — schema (cousin_form_contrasts, dimensional_thresholds, common_aliases)

**Disagreement / question:** Pump organ cabinet authoring surfaced data shapes that did not fit cleanly into the existing FormEntry interface: cousin-form contrast statements (pump organ vs upright piano vs pipe organ) and dimensional decision rules (keyboard surface depth, weight ranges as form-vs-conversion / form-vs-cousin discriminators). Sideboard authoring surfaced a related need: common aliases (buffet, server) that diverge from the canonical form name and need to be acknowledged at the rendering layer without surrendering diagnostic precision.

**Sources / context:** Cousin-form contrasts and dimensional thresholds emerged from pump organ authoring during this session. Common aliases need surfaced from sideboard authoring. The previous "track 3+ occurrences before promoting to schema" rule indicated all three patterns were ready for promotion: cousin-form contrasts (pump organ × 3 cousin comparisons), dimensional thresholds (pump organ × 5 numeric rules + notes), common aliases (sideboard cluster needs aliases).

**Canonical decision:** Three new optional fields added to `FormEntry`:
- `cousin_form_contrasts?: string[]` — free-form contrastive statements; data shape too varied to constrain.
- `dimensional_thresholds?: { width_min?: ...; ... ; notes?: string }` — structured numeric thresholds (inches, pounds) so engine can reason over them; all sub-fields optional including a free-form `notes` field for measurement caveats.
- `common_aliases?: string[]` — free-form aliases with optional context note in parentheses; data shape too varied to constrain.

All three fields are optional, so the 21 entries that don't populate them remain valid without modification.

**Rationale:** `dimensional_thresholds` gets structured numeric typing because the engine needs to compare against measurements computationally; an unstructured string would force re-parsing at every read. `cousin_form_contrasts` and `common_aliases` stay free-form because the underlying data is narrative-shaped (contrast paragraphs, alias names with regional/retail context) and over-structuring would invite premature schema commitments.

---

### 2026-05-03 — Session 2 (mid-session) — forms.ts — form-vs-style separation

**Disagreement / question:** During washstand authoring, period-subtype style content (Late Federal washstand features, Empire washstand features, Eastlake washstand features, etc.) was being added to `regional_period_notes`. This inappropriately couples form data to style data: forms.ts is supposed to stay period-agnostic, with style attribution emerging from feature observation at the style-family-detection layer (Session 4 work).

**Sources / context:** Washstand authoring produced ~7 distinct period-subtype taxonomies (Late Federal/Early Classical, Empire, Mid-century utility, Rococo Revival/Victorian Ornate, Eastlake/Aesthetic, Late Victorian commode-style, Early Colonial Revival) plus cross-cutting observations. None of these belong in a form entry — they describe style-family features tied to specific date ranges, which is the HCL's job.

**Canonical decision:** forms.ts stays period-agnostic. Datable style features migrate to `HISTORICAL_CLUE_LIBRARY` in a future session via the new file `lib/constraints/_style_observations_backlog.md`, which captures the stripped content with proposed date ranges so the HCL migration can encode them with confidence weights.

**Rationale:** Coupling form data to style data would force every form entry to grow indefinitely as styles are catalogued, and would duplicate dating logic across two libraries. Routing through HCL keeps each library single-purpose: forms describe what the piece *is*, HCL describes when its features were *made*.

---

### 2026-05-03 — Session 2 (mid-session) — forms.ts — form_pump_organ_cabinet, form_washstand retrofit

**Disagreement / question:** The basic migration stubs for pump organ cabinet and washstand (shipped in Session 2 Parts A+B) were placeholders awaiting full canonical authoring. Full authoring completed during this session with the new schema.

**Sources / context:** Pump organ cabinet entry expanded with `distinguishing_features` (7 items: bellows, reeds, keyboard+air controls, lower-case proportions, removed-treadle evidence, removed-knob evidence, back-panel access), `cousin_form_contrasts` (vs upright piano, vs pipe organ), `dimensional_thresholds` (height/depth/weight with notes paragraph), and `regional_period_notes` (Estey/Mason & Hamlin vs Story & Clark/Kimball production geography). Washstand entry expanded with `distinguishing_features` (9 items: water-resistant top, basin-oriented top sizing, splash protection, towel accommodation, drawer config, lower storage, proportions, wear patterns, removed-component evidence) and `regional_period_notes` (pre-plumbing context + regional production traditions + critical engine caution about dating-by-construction-evidence + bedroom-private style lag).

**Canonical decision:** Both entries replaced in place at their existing array positions (pump organ at index 0, washstand at index 3). The period-subtype taxonomy that was previously developed for the washstand `regional_period_notes` is captured in `_style_observations_backlog.md` rather than on the entry, per the form-vs-style separation decision.

**Rationale:** Replace-in-place preserves the original `f01..f23` migration ordering. Pump organ ships with all four new schema fields populated because its diagnostic profile genuinely needs them. Washstand ships without `cousin_form_contrasts`, `dimensional_thresholds`, or `common_aliases` because none of those data shapes apply meaningfully to washstand identification at this time; they remain available if a future authoring round surfaces them.

---

### 2026-05-03 — Session 2 (mid-session) — forms.ts — bedroom-private furniture style lag

**Disagreement / question:** Washstand authoring revealed that bedroom-private functional furniture (washstands, dressing tables, chamber pot cabinets) lags urban style trends by approximately 10 years in addition to the rural production lag of 20-30 years. The natural temptation was to extend the form's `date_ceiling` to accommodate this lag, but that would conflate dating evidence with style evidence.

**Sources / context:** Washstand peak development period 1860-1885 with style trends (Empire, Rococo Revival, Eastlake, Late Victorian commode-style) urban-driven. Private domestic placement insulates the form from rapid stylistic turnover; an Eastlake washstand made in a rural shop in 1895 reflects a style that urban centers had moved past 5-10 years earlier.

**Canonical decision:** Form envelope of 1820-1900 confirmed correct for washstand. The bedroom-private ~10-year style lag will be captured as a *feature-dating modifier* in HISTORICAL_CLUE_LIBRARY work, not as a `date_ceiling` extension on the form entry.

**Rationale:** `date_ceiling` represents when the form was *produced*, not when its style features were *fashionable*. Conflating the two would mean every style-lagged form would grow its date envelope, duplicating logic that belongs in HCL where style features are weighted against dating evidence.

---

### 2026-05-03 — Session 2 (mid-session) — forms.ts — schema occurrence tracker reset

**Disagreement / question:** The "track 3+ occurrences before promoting to schema" tracker was carrying three patterns under observation: cousin-form contrasts, dimensional thresholds, and common aliases. With all three promoted to schema fields this session, the tracker needs reset and the period-subtype/style-evolution pattern (which was tracking toward potential promotion) needs to be reclassified.

**Sources / context:** Three patterns hit the 3+ occurrence threshold during pump organ + sideboard authoring and were promoted to schema fields in this batch. A fourth pattern — period-subtype/style-evolution data — was tracking toward promotion via the washstand period-subtype taxonomies but is resolved differently by the form-vs-style separation decision: it routes to HCL via the backlog file, not to a forms schema field.

**Canonical decision:** Active tracker contents post-session:
- `cousin_form_contrasts` — promoted to schema, no longer tracked.
- `dimensional_thresholds` — promoted to schema, no longer tracked.
- `common_aliases` — promoted to schema, no longer tracked.
- Period subtypes / style evolution — resolved by routing to HCL via `_style_observations_backlog.md`; no longer needs schema field; not tracked.
- Epistemic warnings / engine cautions — 1 occurrence (washstand `regional_period_notes` "Critical engine caution" paragraph). Continues tracking; revisit if a second and third occurrence accumulate.

**Rationale:** The tracker exists to prevent premature schema commitment. Resetting it after each promotion keeps the discipline visible: if a fourth pattern accumulates, the same threshold gets applied. The "epistemic warnings" pattern starts at occurrence 1 and may or may not reach the threshold during subsequent form authoring.

---

### 2026-05-04 — Session 2 Part C continued — forms.ts — sideboard/buffet/server cousin trio

**Authoring scope:** Three coordinated cousin-form entries shipped together to ensure internal consistency in cross-references, dimensional ranges, and structural differentiation logic.

**Authored content:** distinguishing_features, cousin_form_contrasts, dimensional_thresholds, and common_aliases populated for all three entries. regional_period_notes deliberately omitted from all three (no substantive regional knowledge provided this session; can be added in later passes if appraiser surfaces relevant material).

**Three-way differentiation framework:** Sideboard defined by span and distributed storage across width. Buffet defined by integration and consolidation into a unified cabinet mass. Server defined by reduction, simplicity, and auxiliary function. This framework appears in all three entries' cousin_form_contrasts (intentional duplication so each entry can be reasoned about independently without requiring lookup of the other two).

**Schema field validation:** First non-pump-organ use of cousin_form_contrasts, dimensional_thresholds, and common_aliases. All three fields applied successfully across all three entries. Schema design confirmed sound under real authoring conditions.

**Suite-context evidence-hierarchy guidance:** Per appraiser instruction, suite context (matching dining set) is captured as supporting evidence only in cousin_form_contrasts; primary classification must rely on structure, massing, and storage organization. Recorded explicitly to prevent engine over-weighting of suite context in identification reasoning.

**Common aliases captured:** buffet/sideboard/credenza/hunt board/dining cabinet/side table/console with appropriate context notes per the user-trust-protection architecture established earlier this session.

**Server date_floor reconsideration:** Initial canonical extraction proposed date_floor: 1850 based on the assumption that server-as-form predated buffet-as-form. Appraiser correction: while functional servers existed earlier (small side tables, reduced sideboards, narrow case pieces used in serving roles), the server as a distinct, named, repeatable furniture form emerged c. 1870 alongside the matched-suite buffet-and-server pairing convention, with full standardization c. 1890. Date_floor restored to 1870. Pre-1870 auxiliary serving pieces are deliberately excluded from server classification — they should be identified as side tables, small sideboards, or serving tables. This guidance captured in form_server distinguishing_features as explicit anti-classification note to prevent engine back-classification of earlier auxiliary pieces.

---

### 2026-05-05 — Session 3 architectural foundation — schema — four-level taxonomy

**Architectural decision:** Adopt four-level taxonomy for furniture form classification, derived from appraiser's structural analysis. Levels: construction_logic (root), family, spatial_behavior, form. Subtype implemented as field on form rather than its own constraint library per appraiser-confirmed scope discipline.

**Construction Logic levels (four total):**
- I: Case Construction (rigid carcass, enclosed storage; covers bedroom, dining storage, general storage families)
- II: Frame Construction (post-and-rail seating; covers seating family)
- III: Surface Forms (tables, work surfaces; covers table and desk families)
- IV: Mechanical / Integrated Systems (pieces with embedded machinery; covers musical/mechanical, industrial, clock case families)

**Subtype rule (locked):** A subtype is "same form structure, different decorative or functional fitting." A form is "structurally distinct enough that the engine reasons about it differently." Examples: lady's dresser, gentleman's dresser, princess dresser, vanity dresser, hat box dresser are subtypes of dresser. Rocking chair, club chair, barrel chair, bergère, wingback, morris chair are forms in their own right (structural distinctness elevates to form-level).

**Hybrid form approach (locked):** Primary classification with secondary association. Mule chest = primarily chest of drawers subtype, secondary association to blanket chest. Settle = primarily seating, secondary storage association. Implemented via `subtypes` field on parent form plus `secondary_form_associations` field referencing other form ids.

**Washstand placement (locked):** Bedroom and Clothing Storage Cases family, Personal Hygiene Forms spatial behavior. Reasoning: appraiser's prior authoring was bedroom-anchored (bedroom-private furniture lag observation only makes sense if washstand is bedroom-classified); historical use was overwhelmingly bedroom; construction logic similarity to dining is one of five taxonomy levels but not determining. Family is about what kind of furniture this is in human use, not how it was built.

**Tonight's scope:** Interfaces only, empty entry arrays. Three new constraint library files created with full interfaces, empty exports. FormEntry modified with four new optional fields (family_id, spatial_behavior_id, subtypes, secondary_form_associations) and FormSubtype interface added.

**Deferred to next session(s):**
- Authoring construction logic, family, and spatial behavior content (target: Session 3 Part A)
- Retrofit existing six form entries (pump organ cabinet, washstand, pie safe, sideboard, buffet, server) with family_id and spatial_behavior_id references (target: Session 3 Part B)
- New bedroom form authoring using new taxonomy (target: Session 3 Part C)

**Schema observation tracker update:** Family-level data shape promoted to schema (was previously deferred from sideboard/buffet/server cousin work). Subtype data shape implemented as form metadata rather than separate library per scope discipline. Spatial behavior identified as legitimate intermediate level between family and form, supported by appraiser's bedroom framework demonstrating that horizontal/vertical/enclosure groupings have diagnostically distinguishable patterns.

---

### 2026-05-05 — Session 3 Block 1 — constructionLogic.ts — four entries authored at calibration depth

**Authoring scope:** All four Construction Logic entries (Case, Frame, Surface, Mechanical/Integrated) populated with full canonical content. First content authoring on the four-level taxonomy schema introduced in commit e67178a.

**Schema additions:** ConstructionLogicEntry interface gained four optional fields surfaced during authoring: identifying_elements (visual/observable cues distinct from underlying structural traits), functional_behavior (use-case role), historical_evolution_narrative (period-by-period evolution as bullet array), and disambiguation_from_other_logics (negative identification). All four fields are optional. Existing CONSTRUCTION_LOGIC array was empty so no retrofit required.

**Style-construction coupling principle (locked working principle):** Style and construction evolve in parallel but not in lockstep. Some style shifts coincide with construction shifts; some don't. When the appraiser couples them in an entry (e.g., CL II 1700-1820 noting William and Mary / Queen Anne tracking with frame-construction refinement), treat as coupled evidence. When the appraiser doesn't couple them, treat as deliberately separate. Default assumption is that the appraiser's framing is intentional. When uncertain, ask rather than infer. Applied to all four CL entries.

**Form-vs-style separation extended to construction-vs-clue separation:** Per architectural correction precedent (commit b3750ca), datable style features migrate to HISTORICAL_CLUE_LIBRARY rather than living in form entries. Same principle now applies to specific datable construction features. CL entries' historical_evolution_narrative carries narrative-level synthesis (how the construction logic itself evolved); HCL when authored will carry specific datable features (machine-cut dovetails appearing c. 1860, plywood adoption c. 1900, etc.) with confidence weights. Each CL entry's historical_evolution_narrative closes with an explicit cross-reference note to HCL.

**Hybrid CL III/CL IV classification (locked decision):** Forms with mechanical features but underlying structural form belong in their structural CL with mechanism captured as a distinguishing feature, not in CL IV. Roll-top desks and cylinder desks belong in CL III (Surface Forms) → Tables/Desks family → Enclosed Workstations spatial behavior, with tambour and cylinder mechanisms captured at the form level. Pump organs, pianos, phonograph cabinets, radio cabinets, and clock cases belong in CL IV because the mechanism is form-defining (without it, the piece would not be what it is). This decision is encoded explicitly in CL IV's description, disambiguation_from_other_logics, and 1700-1820 historical evolution bullet.

**Pre-1700 calibration discipline:** All four CL entries include substantive Pre-1700 content rather than dismissing the period. Even CL IV, which has no mature mechanical systems Pre-1700, captures the diagnostic value of mechanical absence: "absence of complex or precision mechanical behavior is itself a key diagnostic indicator of the period." This calibration matches form-authoring discipline established in Phase 2 Session 2: depth varies authentically per entry, schema accommodates the variation.

**Schema observation tracker update:** Four new patterns added to the schema during this authoring session. All resolved by extending ConstructionLogicEntry interface rather than deferring to backlog. The form-vs-style and construction-vs-clue separation principles continue to govern what stays in canonical entries vs. what routes to HCL.

---

### 2026-05-05 — Session 3 Block 2 — families.ts — ten family entries authored

**Authoring scope:** All 10 Family entries populated using the existing FamilyEntry interface from commit e67178a. No schema changes required — authoring fit cleanly within the description + family_characteristics fields. First content authoring on the families.ts constraint library.

**Family-to-construction-logic distribution:**
- Construction Logic I (Case Construction): 3 families — Bedroom and Clothing Storage Cases, Dining and Service Storage Cases, General Storage and Specialty Cases
- Construction Logic II (Frame Construction): 1 family — Seating Furniture
- Construction Logic III (Surface Forms): 2 families — Tables, Desks
- Construction Logic IV (Mechanical / Integrated Systems): 4 families — Musical and Mechanical Furniture, Industrial and Professional, Clock Cases, Entry and Support Forms

**Bedroom family scope expansion:** During authoring review, the appraiser confirmed the bedroom family form list was unintentionally limited to clothing-storage cases. Form list now extends to include sleep furniture (bedstead, four-poster bed, tester bed), bedside furniture (nightstand, dressing table), additional storage forms (blanket chest, trunk), and personal hygiene forms (washstand). Description and family_characteristics updated to reflect this scope: family description now includes "and rest" as an activity; characteristics include "with bedside placement common for support furniture" and reference "basin surfaces, or sleeping platforms" in the storage architecture summary.

**Washstand placement reaffirmed:** Day-to-day contradiction caught and resolved. Today's authoring document placed washstand under Family B (Dining and Service Storage Cases). This contradicted yesterday's locked decision (commit e67178a audit entry) placing washstand in Bedroom family with personal-hygiene spatial behavior. Yesterday's call confirmed: washstand belongs in bedroom family. The bedroom-private furniture lag observation only makes sense under bedroom classification, and historical use was overwhelmingly bedroom. Washstand listed in Family A (Bedroom) form list, omitted from Family B form list.

**Template inconsistency resolved:** Authoring document used letter labels (Family A, B, C) under Construction Logic I and unlabeled "FAMILY:" under II, III, IV. Per appraiser confirmation, letter labels dropped in canonical entries — name field carries identification, id field handles uniqueness. Going forward, authoring template will exclude letter and roman-numeral labels.

**Industrial/Professional, Clock Cases, Entry/Support placement under CL IV:** Appraiser's tree placed all three under CL IV. Some forms within these families do not have mechanical systems (workbench, school desk, store counter, hall tree, umbrella stand, cheval mirror, valet stand, plant stand). Placement preserved per the tree for this commit; flagged for potential revisiting in a future session, where these families may be better placed under CL I or CL III based on per-form structural analysis.

**Spatial behavior implications surfaced for Block 3:** Bedroom family scope expansion implies additional spatial behaviors beyond the original three (Horizontal Storage / Vertical Storage / Clothing Enclosure) — adding Sleep Furniture, Bedside Furniture, and Personal Hygiene. Block 3 authoring will need to address these additions. Other families may surface similar spatial behavior expansions during Block 3.

---

### 2026-05-05 — Session 3 Block 3 — spatialBehaviors.ts — twenty-eight spatial behavior entries authored

**Authoring scope:** 28 Spatial Behavior entries populated using the existing SpatialBehaviorEntry interface from commit e67178a. No schema changes required — authoring fit cleanly within description + structural_attributes + dimensional_patterns fields. First content authoring on the spatialBehaviors.ts constraint library.

**Spatial-behavior-to-family distribution:**
- Bedroom and Clothing Storage Cases: 6 spatial behaviors (Horizontal Storage, Vertical Storage, Clothing Enclosure, Sleep Furniture, Bedside Furniture, Personal Hygiene / Dressing Support)
- Dining and Service Storage Cases: 5 spatial behaviors (Distributed Storage, Integrated Cabinet Storage, Auxiliary Service, Display and Storage Hybrids, Specialized Storage)
- General Storage and Specialty Cases: 4 spatial behaviors (Open Storage Systems, Compartmentalized Storage, Display Cabinets, Utility Storage)
- Seating Furniture: 6 spatial behaviors (Single-User Seating, Motion Seating, Upholstered Lounge Seating, Multi-User Seating, Reclining or Extended Seating, Hybrid Bench Seating)
- Tables: 5 spatial behaviors (Dining Tables, Expandable Tables, Central Support Tables, Auxiliary Tables, Specialty Surface Tables)
- Desks: 2 spatial behaviors (Writing Surfaces, Enclosed Workstations)

**Path B applied to single-form families:** Per planning discussion before Block 3 authoring, no spatial behaviors added for the four single-form families (Musical/Mechanical, Industrial/Professional, Clock Cases, Entry/Support). Forms in those families will have `family_id` but no `spatial_behavior_id` reference. SpatialBehaviorEntry interface makes spatial_behavior_id optional, so this works architecturally. Path B chosen to avoid stub spatial behaviors that don't add information when only one form exists per family.

**Path A content considered and intentionally not added:** Authoring document contained spatial behaviors for the four single-form families (Housed Functional Forms for Musical/Mechanical, Task-Driven Work Surfaces for Industrial/Professional, Vertical System Housing for Clock Cases, Transitional Access Support for Entry/Support). The content was substantive (not stub), but per Path B decision, these were not added to the canonical SPATIAL_BEHAVIORS array. Audit-log captured for future reference if Path A is later reconsidered.

**Bedroom spatial behavior trim:** Authoring document initially included 8 bedroom spatial behaviors. During review, two were dropped: Transitional Storage Forms (blanket chest, trunk) and Auxiliary Work Surfaces (writing/reading in bedroom context). Trim to 6 behaviors per planning discussion. Blanket chest stays in Vertical Storage as hybrid inclusion (consistent with original bedroom framework). Trunk placement deferred to Block 5 form authoring. Dressing table consolidated into Personal Hygiene / Dressing Support spatial behavior alongside washstand.

**Specialized Storage expansion:** Initial authoring entry was thin. During review, appraiser expanded to substantive content capturing the function-specificity-over-standardization principle: form is driven by specific requirements of stored contents rather than by general storage or service patterns. This expansion preserves authentic form variety (cellarette and dry sink have different internal logics) while still providing a coherent spatial behavior framing.

**Sleep / Bedside dimensional patterns:** Appraiser provided broad ranges with explicit notes about variation drivers. Sleep Furniture: width 36-78 inches structured (covers twin/full/queen/king range), with length 75-84 inches and height variation captured in notes (platform/standard/four-poster ranges differ substantially). Bedside Furniture: full structured ranges (height 24-30, width 16-30, depth 12-20) with notes explaining that bed height, room size, and intended surface use drive variation more than formal standardization.

**Cross-references to form-level dimensional thresholds:** Where forms within a spatial behavior have form-level dimensional anchors already authored, the spatial behavior's dimensional_patterns notes reference those entries explicitly. Examples: Distributed Storage references form_sideboard, Integrated Cabinet Storage references form_buffet, Auxiliary Service references form_server, Personal Hygiene references form_washstand. This pattern lets the spatial behavior layer point to richer form-level data rather than duplicating it, and signals where future form-level authoring will land.

**Hybrid CL III/CL IV decision encoded in Enclosed Workstations:** The Enclosed Workstations spatial behavior description explicitly references the hybrid decision from commit 0718ad1: roll-top desks and cylinder desks belong here (CL III, Desks family) as forms with mechanical features, not in CL IV. This locks the architectural decision into the canonical data, consistent with the same pattern applied at the family level for Desks.

**Forms inventory implications:** With 28 spatial behaviors covering the six multi-form families, the foundation is now in place for Block 4 (retrofit existing six form entries with family_id and spatial_behavior_id references) and Block 5 (new bedroom form authoring using the new taxonomy). Forms in the four Path-B single-form families (Musical/Mechanical, Industrial/Professional, Clock Cases, Entry/Support) will retrofit with family_id only.

---

### 2026-05-05 — Session 3 Block 4 — forms.ts — six existing entries retrofitted with taxonomy references

**Retrofit scope:** Six form entries in forms.ts gained `family_id` and `spatial_behavior_id` references per the four-level taxonomy shipped in commits 0718ad1 (construction logics), 22d5fc2 (families), and e8c0676 (spatial behaviors). No content authoring; no schema changes. Pure mechanical retrofit linking existing form entries to their taxonomic placements.

**Per-form taxonomy assignments:**
- form_pie_safe → family_general_storage_specialty, spatial_utility_storage
- form_pump_organ_cabinet → family_musical_mechanical, no spatial_behavior_id (Path B applied; single-form family)
- form_washstand → family_bedroom_clothing_storage, spatial_personal_hygiene
- form_sideboard → family_dining_service_storage, spatial_distributed_storage
- form_buffet → family_dining_service_storage, spatial_integrated_cabinet_storage
- form_server → family_dining_service_storage, spatial_auxiliary_service

**Authoring depth status (correction surfaced during planning):** Five of the six retrofitted entries are fully authored at canonical depth (pump organ cabinet, washstand, sideboard, buffet, server). The sixth, form_pie_safe, is currently a stub in forms.ts despite substantive content authoring having occurred in earlier sessions — that work lives in session transcripts but never landed in the canonical library file. Retrofit applied anyway because the taxonomic placement is correct regardless of authoring depth, and future content authoring will land into a stub that already has correct taxonomy references. Pie safe content authoring is now a tracked debt for an upcoming session (potentially Block 5 or a dedicated pie-safe-extraction block).

**Path B confirmation in practice:** form_pump_organ_cabinet retrofit confirms Path B works as designed at the form level. The form has family_id but no spatial_behavior_id field. The optional spatial_behavior_id field accepts this pattern without schema modification.

**Stub entries not touched:** Seventeen form entries that exist as basic stubs from the original Part B migration (commit 893944d) are NOT retrofitted in this commit beyond pie safe: form_drop_leaf_table, form_gate_leg_table, form_dresser, form_chest_of_drawers, form_blanket_chest, form_jelly_cupboard, form_china_cabinet, form_bookcase, form_wardrobe, form_writing_table, form_secretary_desk, form_slant_front_desk, form_windsor_chair, form_rocking_chair, form_milking_stool, form_sewing_machine_cabinet, form_icebox. Their family_id and spatial_behavior_id will be added when those forms are authored to canonical depth in future sessions (Block 5 begins this work for bedroom forms).

**Foundation status:** With Block 4 complete, six form entries carry full taxonomy references. The constraint library is consistent at the taxonomic-reference level: forms reference spatial behaviors (where applicable per Path B) and families; spatial behaviors reference families; families reference construction logics. Engine reasoning at any taxonomic level can now traverse upward or downward through the canonical references for the six retrofitted entries. Pie safe content authoring remains as tracked debt.

---

### 2026-05-05 — Session 3 Block 5 Batch 1 — forms.ts — six bedroom forms authored at canonical depth

**Authoring scope:** Six fully-authored canonical bedroom form entries shipped using the new four-level taxonomy. Three entries (form_dresser, form_chest_of_drawers, form_blanket_chest) replaced existing stubs from the original Part B migration. Three entries (form_low_chest, form_highboy, form_trunk) added as new entries. All six use full canonical structure: distinguishing_features, subtypes (with FormSubtype objects), cousin_form_contrasts, dimensional_thresholds, common_aliases, regional_period_notes, plus family_id and (where applicable) spatial_behavior_id.

**Subtype-vs-form classification (locked decisions per appraiser confirmation):**
- Dresser subtypes: standard, double, triple, princess, gentleman's, lady's, hat box (7 subtypes)
- Chest of drawers subtypes: standard, tall chest, lingerie chest, semainier, chest-on-chest (borderline subtype with note), bachelor's chest, mule chest (7 subtypes)
- Low chest subtypes: small low chest, low bachelor's chest, bedside chest, low drawer chest (4 subtypes)
- Highboy subtypes: flat-top, bonnet-top, broken-arch, Queen Anne, Chippendale (5 subtypes)
- Blanket chest subtypes: six-board chest, paneled, painted, dower chest, hope chest, cedar chest (6 subtypes)
- Trunk subtypes: flat-top, dome-top, steamer, wardrobe, footlocker, Jenny Lind, immigrant (7 subtypes)

**Hybrid form handling:** Mule chest implemented as chest of drawers subtype with parent-form `secondary_form_associations: ["form_blanket_chest"]`. The form-level association captures the structural-hybrid identity (mule chest combines lift-top blanket chest upper compartment with drawer-based lower section) without requiring schema extension to the FormSubtype interface.

**Trunk spatial_behavior_id intentionally undefined:** Trunk has `family_id: "family_bedroom_clothing_storage"` but no `spatial_behavior_id` reference. None of the bedroom spatial behaviors fit trunk's portable transitional storage character cleanly. Schema makes spatial_behavior_id optional (commit e67178a), so this works without modification. Future revisiting may add a "Transitional Portable Storage" spatial behavior, but Path B principle holds: false placement is worse than acknowledged absence.

**Lowboy treatment:** Lowboy referenced in low chest cousin_form_contrasts as a separate form not yet authored in canonical library. Future authoring scope will determine whether lowboy is its own form (likely placement: dining/general storage with cabriole legs and table-like proportions), a subtype of dressing table, or a subtype of low chest. Cousin contrast acknowledges the placement question without forcing premature classification.

**Form-level date ranges added:** Highboy 1700-1900, blanket chest 1700-1900, trunk 1700-1940. These ranges reflect actual production envelopes rather than form existence — Colonial Revival production extends highboy and blanket chest into early 20th century, trunk production effectively ends with the rise of modern luggage in mid-20th century.

**Subtype-level date ranges added:** Several subtypes carry their own date ranges where production is narrower than parent form: princess dresser 1890-1930, gentleman's dresser 1880-1950, lady's dresser 1850-1930, hat box dresser 1890-1925, tall chest 1800+, semainier 1800-1900, bachelor's chest 1750-1850, mule chest 1700-1850, Queen Anne highboy 1720-1755, Chippendale highboy 1755-1790, steamer trunk 1870-1930, wardrobe trunk 1900-1940, Jenny Lind trunk 1850-1880.

**Three new patterns surfaced for schema observation tracking:**
1. **Subtype dimensional thresholds:** Multiple subtypes have meaningfully different dimensions from parent form (gentleman's dresser height extends to 44 vs standard dresser 38; lingerie chest narrower than standard chest; bachelor's chest much smaller than standard chest). FormSubtype.dimensional_thresholds field handles this cleanly. Pattern occurrence: 4 forms in this batch (dresser, chest of drawers, highboy, trunk).
2. **Subtype-level secondary form associations not yet supported:** Mule chest's secondary association to blanket chest currently lives at parent form level (chest of drawers). If future forms have multiple subtypes with different secondary associations, FormSubtype interface may need extension to support subtype-level secondary_form_associations. Pattern occurrence: 1 form so far (chest of drawers/mule chest).
3. **Anti-back-classification guidance recurrence:** Following server (commit e3efc7d) and pump organ cabinet (commit b3750ca) precedents, several entries in this batch include explicit "do not back-classify" guidance: dresser warns against using "commode" without supporting evidence; chest of drawers warns about ambiguous "chest" terminology; blanket chest warns against assuming early date from chest form alone; nightstand (Batch 2) will likely include similar guidance. Pattern occurrence: 3 forms in this batch alone, with prior occurrences in cousin trio and pump organ work. Approaching threshold for potential schema field promotion (`anti_classification_guidance` or similar).

**Foundation status:** With Batch 1 complete, six bedroom forms are fully authored at canonical depth. Bedroom family canonical authoring is approximately half complete; Batch 2 (wardrobe, armoire, chifforobe, bedstead, nightstand, dressing table) will complete bedroom form authoring. After Batch 2, bedroom family will have 12 canonically-authored forms covering all six spatial behaviors.

---

### 2026-05-06 — Session 3 Block 5 Batch 2 — forms.ts — six bedroom forms authored at canonical depth, completing bedroom family

**Authoring scope:** Six fully-authored canonical bedroom form entries shipped, completing bedroom family canonical authoring. One entry (form_wardrobe) replaced existing stub from the original Part B migration. Five entries (form_nightstand, form_dressing_table, form_chifforobe, form_bedstead, form_armoire) added as new entries. All six use full canonical structure: distinguishing_features, subtypes, cousin_form_contrasts, dimensional_thresholds, common_aliases, regional_period_notes, plus family_id and spatial_behavior_id.

**Subtype-vs-form classification (locked decisions per appraiser confirmation):**
- Nightstand subtypes: simple bedside table, one-drawer, door-and-drawer, open-shelf, commode-style (5 subtypes)
- Dressing table subtypes: vanity table, triple-mirror vanity, kneehole, lowboy dressing table, princess vanity, dressing table with bench (6 subtypes)
- Chifforobe subtypes: single-door, double-door, mirrored, gentleman's, compactum (5 subtypes)
- Wardrobe subtypes: single, double, triple, mirrored, knockdown (5 subtypes)
- Armoire subtypes: clothing, linen, French, country, entertainment (5 subtypes)
- Bedstead subtypes: standard, four-poster, tester, half-tester, low-post, rope, sleigh, spool, panel (9 subtypes)

**Bedstead subtype decisions:** Per locked subtype rule, four-poster bed and tester bed and half-tester bed are bedstead subtypes (not parallel forms). Structural distinctness — bedstead with vertical posts; bedstead with vertical posts plus canopy; bedstead with partial canopy — is decorative-and-functional fitting on the same structural form, not structural distinctness sufficient to elevate to form-level. Tester subtype carries date range 1720-1840 reflecting original production; half-tester carries 1820-1900 reflecting later formal production.

**Chifforobe form-level date range with open ceiling:** form_chifforobe carries date_floor: 1900 with no date_ceiling field. The form emerged c. 1900 and mainstream factory production largely ended in the late 1960s as built-in closets became standard residential construction, but boutique reproduction and revival production continue. Per established convention (used previously for tall chest subtype with date_floor 1800 and no ceiling), the open ceiling reflects continuing limited production. The date_floor enforces anti-back-classification (don't classify pre-1900 hybrid pieces as chifforobe); regional notes capture the production-curve detail for engine reasoning.

**Wardrobe and armoire intentionally have no form-level date range:** Both forms span American production from colonial period through present without clear emergence dates. Subtype-level dates capture the meaningful production windows: knockdown wardrobe 1850-1930, entertainment armoire 1980-2010. The form-level date absence reflects continuous production with stylistic evolution rather than form emergence and obsolescence.

**Bedstead dimensional_thresholds with weight-only structured fields:** Per locked appraiser decision during extraction review, bedstead dimensional_thresholds includes only weight_min and weight_max as structured numeric fields (60-300 pounds), with all other dimensional content captured in the notes field. Reason: bed dimensions vary too much across mattress sizes (twin through California king) and post heights (low-post through tester) to anchor as single ranges. Comprehensive notes field captures all standard mattress sizes and substantial commentary on headboard, footboard, and post height ranges.

**Lowboy treatment continued from Batch 1:** Lowboy referenced again in dressing table subtypes (subtype_lowboy_dressing_table with date range 1700-1800) and in cousin_form_contrasts. The subtype captures the dressing-table-functional aspect of lowboy as bedroom dressing furniture; the standalone lowboy form remains a backlog item for future authoring (likely placement: Tables family with cabriole legs and table-like proportions).

**Compactum as chifforobe subtype:** Per appraiser confirmation in Batch 2 review, compactum (British term for fitted wardrobe with hanging space and drawers/trays) is a chifforobe subtype with explicit note about overlap with wardrobe territory. Classification depends on whether the drawer/tray system is structurally substantial enough to qualify as a true chifforobe-style hybrid.

**Wardrobe-armoire-chifforobe cousin trio:** All three forms share spatial_behavior_id: spatial_clothing_enclosure but represent distinct structural identities. Cousin contrasts are explicitly captured on each form's cousin_form_contrasts array, with the wardrobe-vs-armoire pair particularly carefully framed (overlapping retail terminology requires structural-evidence-driven classification rather than listing-title-driven). The three-form structural distinction:
- Wardrobe: primarily hanging storage with secondary shelves/drawers
- Chifforobe: substantial drawer bank co-equal with hanging compartment
- Armoire: broader cabinet-storage character with varied interior configurations

**Anti-back-classification guidance recurrence (continuing pattern from prior sessions):** Multiple Batch 2 entries include explicit anti-back-classification guidance: nightstand warns against projecting modern nightstand identity backward without bedside scale and suite-coordination evidence; chifforobe warns against classifying pre-1900 hybrid pieces as chifforobe; armoire warns against assuming French origin or antique date from the word alone. Combined with prior occurrences (server, pump organ cabinet, dresser, chest of drawers, blanket chest from Batch 1), the pattern has now appeared in 8+ form entries. Schema observation tracker continues to flag potential schema field promotion (anti_classification_guidance or similar dedicated field) for future architectural review.

**Bedroom family canonical authoring complete:** With Batch 2 shipped, bedroom family has 12 canonically-authored forms covering all six spatial behaviors:
- Horizontal Storage: dresser, low chest
- Vertical Storage: chest of drawers, highboy, blanket chest
- Clothing Enclosure: wardrobe, armoire, chifforobe
- Sleep Furniture: bedstead
- Bedside Furniture: nightstand
- Personal Hygiene / Dressing Support: washstand, dressing table
- Plus form_trunk in family without spatial_behavior_id (Path B at form level)

**Foundation status:** With bedroom family canonical authoring complete, the constraint library now has a fully-authored reference family demonstrating the complete pattern (12 forms, 53 subtypes, all schema fields exercised, full taxonomy traversal possible). Future family authoring (Tables, Seating, Desks, etc.) can reference bedroom family as the established pattern.

---

### 2026-05-06 — Session 4 Block 1 Batch 1 — forms.ts — Tables family form authoring begins (3 forms shipped)

**Authoring scope:** Three fully-authored canonical Tables family form entries shipped, establishing the canonical pattern for Tables family. One stub (form_drop_leaf_table) replaced in place with canonical entry. One stub (form_gate_leg_table) removed because gate-leg is now captured as subtype within form_drop_leaf_table per locked architectural decision (subtype rule applied: same expansion mechanism — hinged side leaves — with structural variant of swinging support legs as decorative-and-functional fitting, not structural distinctness sufficient to elevate to form). Two new entries added (form_dining_table, form_extension_table). All three use full canonical structure: distinguishing_features, subtypes, cousin_form_contrasts, dimensional_thresholds, common_aliases, regional_period_notes, plus family_id and spatial_behavior_id.

**First Tables family commit:** Tables family canonical authoring begins with this batch. Bedroom family (commits 08a8abe and 88610d0) established the four-level taxonomy pattern with 12 canonical forms; Tables family applies the same pattern. Authoring proceeds in 3 batches per cousin-overlap groupings:
- Batch 1 (this commit): Dining and Expandable Tables — 3 forms (dining_table, extension_table, drop_leaf_table)
- Batch 2 (planned): Central Support, Auxiliary, and Display Tables — 12 forms
- Batch 3 (planned): Specialty Surface and Lounge Tables — 9 forms

**Subtype-vs-form classification (locked decisions per appraiser confirmation during Tables family authoring review):**
Multiple structural distinctions in the appraiser's authoring document were resolved as subtypes rather than separate forms per the locked subtype rule (same form structure + different decorative or functional fitting → subtype; structural distinctness → form):
- Kitchen table, breakfast table, harvest/farmhouse table, refectory table, pedestal-dining table, trestle dining table → all subtypes of form_dining_table (same structural identity — large horizontal eating surface for seated meal use; different decorative or functional fitting)
- Gate-leg table, Pembroke table, Sutherland table, butterfly table → all subtypes of form_drop_leaf_table (same hinged-leaf expansion mechanism; different structural variants)
- Center-split, draw-leaf, self-storing, butterfly-leaf → all subtypes of form_extension_table (same insertion-or-fold-out expansion mechanism)

This consolidation reduces the appraiser's authored 32 Tables family forms to approximately 18-22 canonical forms across all three batches.

**Stub removal (form_gate_leg_table):** The existing form_gate_leg_table stub from the original Part B migration (commit 893944d) is removed because gate-leg is now a drop-leaf subtype, not a parallel form. Gate-leg content is captured as subtype_gate_leg_table within form_drop_leaf_table. This is the second stub-removal-due-to-subtype-promotion in the project (precedent: chest-on-chest as chest of drawers subtype rather than separate form, though chest-on-chest stub never existed).

**Subtype-level date ranges added:** Multiple subtypes carry their own date ranges where production is narrower than parent form: Pembroke table 1770-1820, Sutherland table 1850-1920, butterfly table 1700-1770. Several subtypes also carry their own dimensional thresholds (Pembroke, Sutherland) where proportions differ meaningfully from parent form ranges.

**Drop-leaf vs extension table cousin pair (architectural distinction surfaced):** Drop-leaf table and extension table are separate forms because the mechanism class is genuinely different — drop-leaf uses hinged side leaves dropping vertically; extension uses slides, inserts, or fold-outs from within the top system. Both expand surface area but through fundamentally different structural approaches. Cousin contrasts on each form explicitly capture this distinction. This pattern parallels the wardrobe vs chifforobe vs armoire cousin trio in bedroom (related forms with structurally distinct identities) but with mechanism class as the distinguishing axis rather than storage organization.

**Refectory dining table revival production guidance:** Refectory dining table subtype includes explicit note that "most American refectory tables are revival production, not medieval or early English originals." This continues the anti-back-classification pattern observed across canonical authoring (now appearing in 9+ form entries across the constraint library, well past the 3+ schema-promotion threshold; schema observation tracker continues to flag potential anti_classification_guidance schema field for future architectural review).

**Cross-form architectural guidance from Tables family authoring document:** The appraiser's Tables family authoring document closed with a "User-Trust Protection Notes" section capturing cross-form architectural guidance: support structure and height should outrank style name; placement should inform but not control classification; expansion/tilt/drop-leaf/gateleg/fold-over mechanisms should be captured as structural evidence; lowboy as auxiliary table-form case hybrid (not chest subtype); tilt-top tables under central support tables; game/card tables under specialty surface tables; style terms should not replace form identification; form should be identified first then refined by style/period/materials/construction. These guidances are not yet promoted to schema fields but are captured here as the appraiser's framework guidance for engine reasoning at the family level. Pattern observation tracker flags this as potential future schema work for cross-form guidance representation.

**Tables family taxonomy reference status:** With Batch 1 complete, Tables family has 3 canonically authored forms across 2 of 5 spatial behaviors (spatial_dining_tables: 1 form; spatial_expandable_tables: 2 forms). Remaining work in Batches 2-3 will populate spatial_central_support_tables, spatial_auxiliary_tables, spatial_specialty_surface_tables.

---

### 2026-05-06 — Session 4 Block 1 Batch 2 — forms.ts — Tables family expansion (12 forms shipped, largest single batch in project)

**Authoring scope:** Twelve fully-authored canonical Tables family form entries shipped, the largest single content batch in project history. All twelve are entirely new entries (no stub replacements). Forms join the existing Tables family cluster from Batch 1 (commit 3a26fc8) in spatial-behavior-coherent ordering. Tables family canonical authoring reaches 15 forms across 3 of 5 spatial behaviors after this batch.

**Forms shipped per spatial behavior:**
- spatial_central_support_tables: form_pedestal_table (7 subtypes), form_tea_table (5 subtypes)
- spatial_auxiliary_tables: form_side_table (5 subtypes), form_sofa_table (4 subtypes), form_console_table (5 subtypes), form_lowboy (5 subtypes), form_candle_stand (5 subtypes), form_nesting_tables (4 subtypes), form_tray_table (4 subtypes), form_center_table (6 subtypes), form_pier_table (3 subtypes), form_etagere_table (4 subtypes)

Total: 57 subtypes across 12 forms.

**Architectural decision: center_table, pier_table, etagere_table placement under spatial_auxiliary_tables.** The appraiser's authoring document organized these three forms under a "Display and Room-Center Tables" category that does not map to the 5 Tables family spatial behaviors defined in commit e8c0676 (Dining Tables, Expandable Tables, Central Support Tables, Auxiliary Tables, Specialty Surface Tables). Per locked architectural decision during Tables family Batch 2 review, these three forms are placed under spatial_auxiliary_tables for now with explicit acknowledgment that "Auxiliary Tables" is broader than ideal for these display-oriented forms. Future Phase 2 work may add a "Display Tables" or "Seating-Zone Tables" spatial behavior if pattern warrants spatial behavior expansion.

**Subtype consolidation continuing pattern from Batch 1:** Multiple structural distinctions in the appraiser's authoring document were resolved as subtypes per the locked subtype rule. Pedestal table absorbs drum, tilt-top, piecrust, tulip as subtypes (same central-support structural identity, different decorative or functional fitting). Console table absorbs hall console, sofa console, demilune console, pier console, credenza-console hybrid as subtypes (same wall-oriented narrow surface structural identity). Center table absorbs parlor table, marble-top parlor table, pedestal center table, Renaissance Revival, Rococo Revival, Eastlake parlor table as subtypes (same room-centered display structural identity). Side table absorbs end table, lamp table, tier table, drum side table, bedside side table as subtypes. Candle stand combined with plant stand into single form per locked decision (shared small-object-support structural identity).

**Lowboy form-level date range with 4-phase production history (architectural innovation):** form_lowboy ships with date_floor: 1720 and date_ceiling: 1940 capturing the form's emergence and production envelope. Critical anti-back-classification guidance prominently placed in distinguishing_features (rather than only in regional_period_notes per usual pattern) explicitly states that pieces dated pre-1720 should NOT be classified as lowboy because the form identification did not exist yet. Five subtypes capture the four-phase production history: Queen Anne lowboy 1720-1755, Chippendale lowboy 1755-1790, dressing lowboy (functional subtype without date range), active revival lowboy 1870-1900 (genuine Colonial Revival reinterpretation), lingering revival lowboy 1900-1940 (continuing production with heavy period styling influence). This is the most architecturally complex form-level date range in the constraint library and demonstrates the engine's capacity to reason about multi-phase production histories with explicit anti-back-classification at the form-emergence boundary.

**Pier table form-level date range with 2-phase production history:** form_pier_table ships with date_floor: 1780 and date_ceiling: 1930 (extended from initial proposal of 1880 per appraiser confirmation that lingering production continued in formal parlor contexts through revival production). Regional period notes explicitly capture peak production 1780-1880 corresponding to active formal-architectural-interior design and lingering production 1880-1930 continuing as Colonial Revival, Federal Revival, and neoclassical revival pieces. Per appraiser preference, lingering production captured entirely in regional period notes without dedicated subtype (less clean architecturally but more accurate to the actual production history character).

**Anti-back-classification guidance recurrence (continuing pattern):** Multiple Batch 2 entries include explicit anti-back-classification guidance: lowboy with prominently placed pre-1720 guidance in distinguishing_features (most explicit anti-back-classification framing in any canonical entry to date); pier table with regional notes addressing post-1930 wall-oriented formal tables; tea table with revival production caution; pedestal table with revival production caution across multiple periods; nesting tables with cautions about set-context loss affecting identification; candle stand with cautions about small-scale dating unreliability. Combined with prior occurrences across the constraint library, the anti-back-classification pattern has now appeared in approximately 15+ form entries. Schema observation tracker continues to flag potential anti_classification_guidance schema field for future architectural review; the pattern is well past 3+ promotion threshold and should be formally evaluated at next session checkpoint.

**Cross-form references throughout subtype distinguishing_attributes:** Multiple subtypes include explicit cross-references to other canonical forms (drum side table cross-references form_pedestal_table; bedside side table cross-references form_nightstand; drop-leaf sofa table cross-references form_drop_leaf_table; pedestal center table cross-references form_pedestal_table; pier console cross-references form_pier_table; demilune console cross-references the pier-table-tradition; plant tier table cross-references form_candle_stand; etc.). This cross-referencing density reflects Tables family's heavy cousin-overlap character and supports engine reasoning at the subtype level when multiple forms share structural features.

**Tables family taxonomy reference status:** With Batch 2 complete, Tables family has 15 canonically authored forms across 3 of 5 spatial behaviors:
- spatial_dining_tables: 1 form (form_dining_table from Batch 1)
- spatial_expandable_tables: 2 forms (form_extension_table, form_drop_leaf_table from Batch 1)
- spatial_central_support_tables: 2 forms (form_pedestal_table, form_tea_table from Batch 2)
- spatial_auxiliary_tables: 10 forms (all from Batch 2)
- spatial_specialty_surface_tables: 0 forms (all to be authored in Batch 3)

Batch 3 will populate spatial_specialty_surface_tables (game table, drafting table, sewing table, work table, library table, writing table) plus add coffee table, ottoman table, and pub table to spatial_auxiliary_tables completing Tables family canonical authoring at approximately 24 forms.

---

### 2026-05-06 — Session 4 Block 1 Batch 3 — forms.ts — Tables family canonical authoring complete (9 forms shipped, 24 forms total across 5 spatial behaviors)

**Authoring scope:** Nine fully-authored canonical Tables family form entries shipped, completing Tables family canonical authoring at 24 forms across all 5 spatial behaviors. Six forms populate spatial_specialty_surface_tables (the previously-empty fifth Tables family spatial behavior). Three forms add to spatial_auxiliary_tables. One form (form_writing_table) requires removal from previous Desks family stub position and addition to Tables family specialty surface tables sub-cluster per family reclassification per locked architectural decision (writing tables are open-base table forms structurally distinct from enclosed-storage desks).

**Forms shipped per spatial behavior:**
- spatial_specialty_surface_tables (6 forms, populating previously-empty spatial behavior): form_game_table (6 subtypes), form_drafting_table (5 subtypes), form_sewing_table (5 subtypes), form_work_table (5 subtypes), form_library_table (5 subtypes), form_writing_table (5 subtypes — relocated from Desks family stub position)
- spatial_auxiliary_tables (3 forms, completing Auxiliary Tables coverage): form_coffee_table (6 subtypes), form_ottoman_table (4 subtypes), form_pub_table (6 subtypes)

Total: 47 subtypes across 9 forms. Tables family complete at approximately 130 subtypes across 24 forms.

**Tables family canonical authoring complete (project milestone):** With Batch 3 complete, Tables family is fully canonically authored at 24 forms across all 5 spatial behaviors:
- spatial_dining_tables: 1 form (dining_table)
- spatial_expandable_tables: 2 forms (extension_table, drop_leaf_table)
- spatial_central_support_tables: 2 forms (pedestal_table, tea_table)
- spatial_auxiliary_tables: 13 forms (side_table, sofa_table, console_table, lowboy, candle_stand, nesting_tables, tray_table, center_table, pier_table, etagere_table, coffee_table, ottoman_table, pub_table)
- spatial_specialty_surface_tables: 6 forms (game_table, drafting_table, sewing_table, work_table, library_table, writing_table)

This is the second family canonically completed in Phase 2 (after bedroom family completion at 12 forms in commits 08a8abe and 88610d0). Combined canonical library status: 36 forms (12 bedroom + 3 dining/general + 3 personal hygiene/musical/storage + 24 Tables) with approximately 175 subtypes.

**Coffee table form-level date range with prominent anti-back-classification guidance (architectural innovation continued from lowboy):** form_coffee_table ships with date_floor: 1920 (no date_ceiling — form continues in active production) and explicit "CRITICAL ANTI-BACK-CLASSIFICATION GUIDANCE" framing in distinguishing_features (rather than only in regional_period_notes). The framing prominently states that pre-1920 pieces structurally resembling coffee tables (low front-of-seating tables) are typically cut-down forms or repurposed pieces, NOT period coffee tables. This is the second use of the prominent anti-back-classification placement pattern (lowboy was first in commit 5d07d22). The coffee table case demonstrates that the pattern applies not only to forms with established disappearance dates (lowboy ending 1940) but also to forms with established emergence dates (coffee table starting 1920) — the form-emergence boundary is structurally analogous to the form-extinction boundary for engine reasoning.

**Form_writing_table family reclassification (architectural moment):** The original Part B migration placed form_writing_table as a Desks family stub. The locked Tables family architectural decision (per appraiser's authoring document) classifies writing tables as open-base table forms structurally distinct from enclosed-storage desks; writing table belongs in Tables family. This batch removes the Desks family stub and adds the canonical entry at the end of the specialty surface tables sub-cluster within Tables family. The writing table reclassification establishes precedent for similar future decisions: when canonical authoring reveals a form belongs in a different family than its original stub placement, removal-from-old-position and addition-to-canonical-position is the correct handling pattern. Two prior precedents (gate-leg as drop-leaf subtype removed in Batch 1; wardrobe relocated within bedroom in Block 5 Batch 2) handled different cases — gate-leg removal was due to subtype promotion, wardrobe was a within-family relocation; writing_table is the first across-family reclassification.

**Pub table form with historic tavern table subtype carrying separate date range and dimensional thresholds:** form_pub_table includes 6 subtypes covering the height-class variation (counter-height 34-36, bar-height 40-42, cocktail standing 40-44) plus the historic tavern table subtype which carries its own date_floor: 1700, date_ceiling: 1900, and dimensional_thresholds (height_min: 28, height_max: 31). This subtype-level discontinuity is intentional — historic tavern tables were typically standard seated height while modern pub tables are bar/counter height; they share the marketing terminology but are structurally distinct furniture types. The form classification holds them together but the subtype-level dating and dimensional separation prevents engine confusion when working with either historic or modern pub-table examples.

**Anti-back-classification guidance recurrence count:** With Batch 3 additions (coffee table prominent placement; pub table historic tavern caution; sewing table machine-cabinet-without-machine caution; drafting table CAD-replacement caution; work table wear-evidence guidance; writing table mistaken-for-desk caution), the anti-back-classification pattern has now appeared in approximately 18+ form entries across the constraint library. This is well past 6x the project's 3+ schema-promotion threshold. Two forms now carry the prominent distinguishing_features placement (lowboy and coffee_table). Schema observation tracker formally recommends evaluating an anti_classification_guidance schema field at next session checkpoint — the pattern has substantial enough representation to warrant structured engine reasoning rather than only narrative-text capture in regional_period_notes.

**Cross-family-boundary architectural decision: ottoman_table placement.** form_ottoman_table is placed in Tables family rather than Seating family per locked architectural decision during Batch 3 review. The form is genuinely hybrid (combines ottoman seating function with table surface function); placement in Tables family reflects the canonical entry's structural emphasis on the table-form aspect (surface support via tray top, hard inset, lift-top storage, hybrid configuration). Acknowledged as borderline — future architectural review may consider whether hybrid forms warrant a separate "hybrid forms" category or cross-family classification mechanism. For now, the form's table-side classification holds with explicit cousin contrasts to seating-family forms (ottoman, footstool, bench) capturing the family-boundary tension.

**Tables family taxonomy reference status (complete):** All 5 Tables family spatial behaviors now have canonical forms. The Tables family is fully canonically authored at this canonical depth and ready for engine integration testing in subsequent Phase 2 sessions. Future Tables family work will focus on HISTORICAL_CLUE_LIBRARY population (datable construction features referenced throughout the regional_period_notes), engine integration testing, and the formal schema-promotion evaluation for anti_classification_guidance.

---

### 2026-05-07 — Session 5 Block 1 — spatialBehaviors.ts — Seating family spatial behavior expansion (6 → 9 entries)

**Authoring scope:** Seating family spatial behaviors expanded from 6 to 9 to support upcoming Seating family canonical authoring (planned 26 forms across the 9 spatial behaviors). Five existing entries refined in place with expanded descriptions/structural_attributes/dimensional_patterns content matching the depth of Tables family spatial behavior work. One existing entry renamed from spatial_hybrid_bench_seating to spatial_bench_seating with broader scope (settle is now one subtype within bench rather than the central form). Three new entries added covering compact single-user support (stool, ottoman/footstool), modern casual seating (bean bag, papasan, butterfly/sling), and outdoor specialty/institutional seating (Adirondack, porch glider, pew, theater seat).

**Refinements (5 entries, ids unchanged):**
- spatial_single_user_seating renamed display name "Single-User Seating" → "Upright Single-User Seating" (clarifies upright posture identity vs lounge or modern casual seating)
- spatial_motion_seating refined to clarify motion mechanism as structurally defining
- spatial_upholstered_lounge_seating refined to clarify single-user comfort identity (vs multi-user upholstered seating)
- spatial_multi_user_seating renamed display name "Multi-User Seating" → "Multi-User Upholstered Seating" (clarifies upholstered character covering settee + sofa)
- spatial_reclining_extended_seating refined to clarify horizontal posture identity covering chaise + daybed

**Rename + expansion (1 entry):**
- spatial_hybrid_bench_seating → spatial_bench_seating. Display name "Hybrid Bench Seating" → "Bench Seating". Description narrowed framing of "combines seating with enclosure or panel-based structure" (settle-like) replaced with broader Bench Seating covering all bench variants. Settle is now one subtype within bench form rather than the central spatial behavior identity.

**Additions (3 new entries):**
- spatial_compact_single_user_support: stools and ottomans/footstools
- spatial_modern_casual_seating: bean bag, papasan, butterfly/sling chairs (all carry form-emergence dates 1938 onward)
- spatial_outdoor_specialty_institutional_seating: Adirondack, porch/lawn glider, pew, theater/auditorium seat (structural-distinctness-warranting outdoor/institutional forms)

**Architectural decisions captured from Session 4 architectural review of Seating Forms authoring document:**
- Outdoor as use-layer not form: general outdoor use of standard chairs/benches/sofas captured in regional_period_notes on those forms; only structurally-distinct outdoor forms (Adirondack, porch glider) get spatial behavior placement
- Modern casual seating as separate spatial behavior: bean bag/papasan/butterfly are structurally distinct from upholstered lounge seating because of frameless or alternative-frame construction
- Bench Seating broader than original Hybrid Bench Seating framing: backless benches, dining benches, piano benches, storage benches, window benches, garden benches, school benches all join the bench form with settle as one subtype
- Compact Single-User Support as separate spatial behavior: stools and ottomans warrant separate behavior from upright single-user seating because of absent back structure and from upholstered lounge seating because of compact scale
- Institutional seating (pew, theater seat) grouped with outdoor specialty seating: shared characteristic is structural distinctness from domestic seating forms warranting separate canonical form classification

**Path A schema reconciliation (resolved during planning):** The appraiser's source content for the 9 entries included two fields that did not match the current SpatialBehaviorEntry interface: `construction_logic_id: "construction_frame"` (not a field on the interface — none of the 28 existing spatial behaviors carries it) and `dimensional_patterns: "<string>"` (interface requires an object). Resolved per Path A (zero schema changes): construction_logic_id dropped from all 9 entries (construction logic remains reachable via family_id → family_seating.construction_logic_id transitive lookup wired in families.ts:108); dimensional_patterns prose strings wrapped as `{ notes: "<same string>" }` per existing schema convention used by all 28 prior spatial behaviors. Zero information loss; consistent with existing corpus.

**No form-side changes in this batch.** Three existing seating-form stubs (form_windsor_chair, form_rocking_chair, form_milking_stool) remain unmodified at lines 4281-4309 — they will be retrofitted with family_id and spatial_behavior_id during their canonical authoring in subsequent batches.

**No spatial_behavior_id reference updates needed.** Verification confirmed zero forms currently reference any seating spatial behavior id, so the rename of spatial_hybrid_bench_seating → spatial_bench_seating has no downstream impact on existing forms.

**Schema observation:** Spatial behavior content depth standardization. The 5 refined Seating entries plus 3 new entries now match the content depth standard set by Tables family spatial behaviors (multi-element structural_attributes lists, descriptive dimensional_patterns notes). The 22 spatial behaviors not refined in this batch may benefit from similar depth refinement during their respective family canonical authoring sessions; this is a future refinement opportunity rather than urgent work.

---

### 2026-05-07 — Session 5 Block 2 Step 1 — forms.ts — Schema extension: AntiClassificationGuidance interface and FormEntry.anti_classification_guidance field

**Schema-only change with zero data population.** This is Step 1 of a two-step pattern. Step 1 (this commit): interface definition addition only. Step 2 (separate commit): data population across forms with crisp date boundaries. The two-step pattern provides clean failure isolation — schema extension lands first and verifies clean compile before retrofit work begins.

**Pattern history motivating schema promotion.** Anti-back-classification guidance has appeared in 21+ form occurrences across the canonical library through Phase 2 Session 4 Tables family completion. The pattern crossed the project's 3+ schema-promotion threshold during Bedroom family Batch 2 (commit 88610d0); continuing accumulation through Tables family work pushed the count past 6x the threshold. Two prominence patterns emerged organically: standard placement (regional_period_notes for revival cautions, broad period guidance) and prominent placement (distinguishing_features for crisp date boundaries — used for lowboy form-extinction at 1720 emergence and 1940 ceiling, and for coffee_table form-emergence at 1920).

**Schema decision (per Session 5 Block 2 architectural review):** comprehensive promotion via dedicated AntiClassificationGuidance interface with selective population. Forms with crisp date boundaries (form-emergence or form-extinction) populate the field; forms with revival-caution-only narrative without crisp boundaries continue using regional_period_notes. Estimated final populated count after Step 2 retrofit: 14-17 forms across bedroom, Tables, and Seating families.

**Schema design decisions (per pre-execution clarification):**
- boundary_date as single number (year): narrative softening of soft boundaries captured in guidance_text rather than via range fields. Simpler structure, supports lowboy's c. 1720 framing without overengineering.
- pre_boundary_classifications and post_boundary_classifications as form id arrays: structured cross-reference enables engine reasoning about classification suggestions; missing form ids surface as TypeScript errors rather than silent data quality issues.
- prominence field with "prominent" | "standard" union: preserves the two-prominence-pattern observation from Bedroom and Tables families. prominent placement (parallels lowboy and coffee_table distinguishing_features placement) signals user-facing report emphasis.
- Single-or-array union via FormEntry field type: accommodates lowboy's 4-phase production history (4 boundaries) while remaining simple for single-boundary forms. Both single-object and array forms compile against the same field type.

**Multi-boundary support architectural note:** lowboy's 4-phase production history (pre-1720 emergence prohibition, 1790 core-extinction, 1870 active-revival-emergence, 1940 lingering-revival-extinction) is the architectural use case for array form support. No other current canonical form has 4+ boundaries, but pier_table (2 boundaries: 1780 emergence, 1930 extinction) and possibly other Seating forms (Recliner, Bean Bag, Adirondack with single emergence boundaries) exercise the field structure across the single-object and array spectrum.

**No data populated in this step.** Schema extension is interface-only. All 36 existing canonical forms compile unchanged because the field is optional. Step 2 (Phase 2 Session 5 Block 2 Step 2) will populate the field across forms with crisp date boundaries per comprehensive retrofit plan.

**Forward-compatibility.** Future canonical authoring (Seating family extraction beginning in subsequent sessions) will populate the field naturally during initial extraction rather than requiring later retrofit. Estimated Seating forms requiring field population: 7 (Recliner 1928, Bean Bag 1969, Adirondack 1903, Papasan 1950, Butterfly/Sling 1938, Porch/Lawn Glider 1910, Morris Chair 1890 American emergence).

**Schema observation tracker update:** anti-back-classification pattern formally promoted from observation tracker to dedicated schema field. Pattern observation tracker continues to monitor other recurring patterns including subtype-level dimensional_thresholds (5+ form occurrences, well-supported), subtype-level secondary_form_associations (1 occurrence at mule chest, tracking), cross-form architectural guidance from authoring documents (1 occurrence at Tables family User-Trust Protection Notes section, monitoring).

**File location reconciliation (Path A):** The original Block 2 Step 1 prompt scoped the schema extension to `entryShape.ts`. Verified file state during planning: `entryShape.ts` contains only the `CanonicalEntry` base interface; `FormEntry` and `FormSubtype` actually live in `forms.ts` (added in commit e67178a). Per pre-execution Path A decision, both the new `AntiClassificationGuidance` interface and the new `FormEntry.anti_classification_guidance` field declaration land in `forms.ts` — single-file change, consistent with the FormSubtype precedent (form-specific interfaces co-located with FormEntry rather than in the shared-base entryShape.ts file). Audit header adjusted from "entryShape.ts" to "forms.ts" to match what shipped. Zero changes to entryShape.ts.

---

### 2026-05-07 — Session 5 Block 2 Step 2 — forms.ts — Comprehensive retrofit: anti_classification_guidance populated on 7 forms with crisp date boundaries (12 total boundary entries)

**Step 2 of two-step pattern.** Step 1 (commit a5a047d) shipped the AntiClassificationGuidance interface and optional FormEntry.anti_classification_guidance field. Step 2 (this commit) populates the field on 7 forms identified during Session 5 Block 2 architectural review as having crisp date boundaries — form-emergence, form-extinction, or both. Forms with revival-caution-only narrative without crisp boundaries continue using regional_period_notes for guidance and are not modified in this batch.

**Forms populated (7) with boundary counts:**
- form_lowboy: 4 boundaries (array form — architectural test case for multi-boundary forms)
- form_pier_table: 2 boundaries (array form — emergence and extinction)
- form_highboy: 2 boundaries (array form — emergence and extinction)
- form_coffee_table: 1 boundary (object form — emergence; prominent placement matching existing distinguishing_features placement)
- form_chifforobe: 1 boundary (object form — emergence)
- form_pump_organ_cabinet: 1 boundary (object form — emergence)
- form_washstand: 1 boundary (object form — emergence)

**Total: 12 AntiClassificationGuidance entries across 7 forms.** Distribution: 4 form-emergence boundaries with pre_boundary_classifications cross-references (lowboy 1720, highboy 1700, chifforobe 1900); 5 form-emergence boundaries with empty pre_boundary_classifications (lowboy 1870, coffee_table 1920, pump_organ_cabinet 1870, washstand 1820, pier_table 1780); 3 form-extinction boundaries with empty post_boundary_classifications (lowboy 1790, lowboy 1940, pier_table 1930, highboy 1900). Empty cross-reference arrays per Session 5 Block 2 decision: don't force-fit fuzzy mappings; only populate cross-references where genuine cousin-form mappings exist.

**Prominence pattern preserved.** 2 forms with prominent placement (lowboy 1720 emergence, coffee_table 1920 emergence) match the existing distinguishing_features placement pattern from prior canonical authoring. 5 forms with standard placement throughout match existing regional_period_notes placement. The schema field's prominence sub-field carries the placement decision as structured data; existing narrative content stays in place because the schema field complements rather than replaces narrative guidance.

**Multi-boundary architectural validation.** form_lowboy with 4 boundary entries validates the array form support added in Step 1. The 4 boundaries capture the 4-phase production history (1720 emergence prohibition, 1790 core extinction, 1870 active revival emergence, 1940 lingering revival extinction) as structured data accessible to engine reasoning. form_pier_table and form_highboy validate the 2-boundary array form. form_coffee_table, form_chifforobe, form_pump_organ_cabinet, and form_washstand validate the single-object form.

**Cross-reference cross-family architectural decision.** Form id cross-references in pre_boundary_classifications cross family boundaries naturally: lowboy pre-1720 references form_low_chest (Bedroom family), form_dressing_table (Bedroom family), form_side_table (Tables family). Per Session 5 Block 2 decision, cross-family cross-references are accepted because engine reasoning naturally crosses family boundaries when classifying. The schema field's cross-reference structure enables explicit cousin-form suggestions across family boundaries without forcing within-family-only restrictions.

**Light narrative extensions for pump_organ_cabinet and washstand.** Both forms had crisp date_floor values but minimal pre-emergence narrative in existing regional_period_notes. The structured guidance_text in their populated AntiClassificationGuidance entries authors light narrative extension making the form-emergence boundary explicit (parallel to chifforobe's existing explicit pre-1900 framing). The extension is small and consistent with existing authorial framing; no canonical entry's regional_period_notes or distinguishing_features fields are modified in this batch.

**Forms not populated in this batch.** Forms with revival-caution-only narrative without crisp date boundaries continue using regional_period_notes for guidance: form_dresser, form_chest_of_drawers, form_blanket_chest, form_low_chest, form_nightstand (borderline declined per Q1), form_dressing_table, form_wardrobe, form_armoire (borderline declined per Q2), form_bedstead, form_pedestal_table, form_tea_table, form_candle_stand, form_nesting_tables (borderline declined per Q3), form_center_table, form_etagere_table, form_game_table, form_drafting_table, form_sewing_table, form_work_table, form_library_table, form_writing_table, form_ottoman_table (borderline declined per Q4), form_pub_table, form_server, form_sideboard, form_buffet, form_dining_table, form_extension_table, form_drop_leaf_table, form_side_table, form_sofa_table, form_console_table, form_tray_table, form_trunk, form_chifforobe (already populated), and form_pie_safe (stub-only, not canonically authored). Forms with subtype-level dates rather than form-level boundaries (form_drafting_table industrial subtype, form_sewing_table needlework/sewing-machine subtypes, form_pub_table historic_tavern_table subtype) keep their dates at subtype level without form-level anti_classification_guidance population.

**Schema observation tracker update.** Anti-classification pattern formally promoted from observation tracker (commit 88610d0) to dedicated schema field (commit a5a047d) and now populated comprehensively across all forms with crisp date boundaries (this commit). Pattern observation tracker continues to monitor other recurring patterns including subtype-level dimensional_thresholds (5+ form occurrences, well-supported), subtype-level secondary_form_associations (1 occurrence at mule chest, tracking), and cross-form architectural guidance from authoring documents (1 occurrence at Tables family User-Trust Protection Notes section, monitoring). Future canonical authoring (Seating family extraction beginning in subsequent sessions) will populate the field naturally during initial extraction for forms with crisp date boundaries (estimated 7 Seating forms: Recliner 1928, Bean Bag 1969, Adirondack 1903, Papasan 1950, Butterfly/Sling 1938, Porch/Lawn Glider 1910, Morris Chair American 1890).

---

### 2026-05-08 — Session 6 Block 1 — spatialBehaviors.ts — Desks family spatial behavior expansion (2 → 12 entries)

**Authoring scope.** Desks family spatial behavior layer expanded from 2 to 12 entries, parallel to Phase 2 Session 5 Block 1 Seating expansion (commit 0371ab1). The 2 existing entries (spatial_writing_surfaces, spatial_enclosed_workstations) had skeletal content paralleling pre-Session-5-Block-1 Seating pattern (description + 2-element structural_attributes + notes-only dimensional_patterns) authored as scope-marker content during early canonical work, not deeply researched canonical content. The 12-grouping architecture locked during Session 6 Block 1 architectural conversation supersedes the original 2-entry structure.

**Renames and content replacements (2 entries).**
- spatial_writing_surfaces renamed to spatial_open_writing_stations with full content replacement; new content captures the broader Open Writing Stations grouping covering Bureau Plat, Bonheur du Jour, Kidney Desk, Carlton House Desk canonical forms plus extensive cross-family alias additions to Tables family writing tables and Bedroom family dressing tables/nightstands.
- spatial_enclosed_workstations renamed to spatial_fall_front_drop_front_enclosed_desks with full content replacement; new content captures the Fall-Front / Drop-Front Enclosed Desks grouping covering Slant-Front Desk, Fall-Front Desk, Secretary Desk, Escritoire, Secrétaire à Abattant, Bureau à Gradins canonical forms.

**Additions (10 new entries):** spatial_portable_writing_forms, spatial_kneehole_workstations, spatial_roll_top_tambour_enclosed_desks, spatial_cabinet_armoire_hideaway_workstations, spatial_shared_double_sided_workstations, spatial_commercial_institutional_workstations, spatial_technical_drafting_professional_workstations, spatial_computer_systems_modular_workstations, spatial_built_in_architectural_desks, spatial_convertible_repurposed_desk_forms.

**Architectural decisions captured:**
- Twelve-grouping structure locked during Session 6 architectural conversation reflects 55-form canonical Desks family (architecture summary captured in conversation; full form list ready for canonical authoring batches).
- Framing A consolidation pattern with strategic exceptions (form-before-style precedent from Session 5): structural distinctness controls canonical form treatment; use-context variants captured as common_aliases or subtypes. 18 strategic exceptions evaluated and locked during architectural conversation.
- Cross-family alias additions: ~85 entries from the original 138-form Desks list consolidate as common_aliases on existing Tables and Bedroom family canonical forms (form_writing_table, form_library_table, form_work_table, form_console_table, form_sofa_table, form_side_table, form_sewing_table, form_drafting_table, form_dressing_table, form_nightstand). These cross-family alias enrichments will be applied during respective forms' canonical-content updates rather than in this spatial behavior expansion.
- Conversion identity explicit on user reports: 5 conversion-identity canonical forms (form_converted_organ_desk, form_converted_piano_desk, form_converted_cabinet_desk, form_converted_dresser_desk, form_converted_industrial_desk) preserved as separate forms (rather than subtypes) so that conversion identification appears explicitly in user-facing reports. form_piano_desk (factory-built decorative piano-form furniture) preserved as separate canonical form from form_converted_piano_desk to distinguish factory-built decorative novelty from actual piano conversion.

**Path A schema reconciliation applied (parallel to Session 5 Block 1):** All 12 entries authored without construction_logic_id field (redundant with family_id transitive lookup; reachable via family_desks → families.ts construction_logic_id). All 12 entries use dimensional_patterns as object with notes sub-field (per existing schema convention). All 12 entries include category: "spatial_behavior" per interface requirement.

**No form-side changes.** Two legacy stubs with parent_category: "desk" (form_secretary_desk, form_slant_front_desk at lines 4399-4420) lack family_id and spatial_behavior_id; they pre-date the four-level taxonomy retrofit and remain unmodified in this batch. They will be retrofitted during their canonical authoring in subsequent batches when family_id: "family_desks" and spatial_behavior_id references will be added.

**No cross-file reference updates needed.** Per pre-execution verification: zero cross-file references to either current Desks spatial behavior id (spatial_writing_surfaces, spatial_enclosed_workstations) exist in forms.ts, families.ts, constructionLogic.ts, makerMarks.ts, or AUDIT_LOG.md. Renames have no downstream impact.

**Architectural foundation for upcoming canonical authoring:** With 12 spatial behaviors locked, Desks family canonical authoring proceeds through approximately 15-20 batches across multiple sessions to cover all 55 canonical forms. First batch likely Grouping 1 (Portable Writing Forms — 3 forms) for cluster coherence.

---

### 2026-05-08 — Session 6 Block 2 — forms.ts — Seating family canonical authoring Batch 1: Upright Single-User Seating sub-cluster (6 forms)

**Authoring scope.** First batch of Seating family canonical authoring covering the Upright Single-User Seating sub-cluster (spatial_single_user_seating spatial behavior). 6 forms authored: form_side_chair, form_armchair, form_bar_chair, form_folding_chair, form_windsor_chair (retrofit from existing stub), form_ladderback_chair. Pattern parallels Tables family Batch 1 in scope and structure.

**Form-before-style architectural principle applied.** Construction-tradition subtypes with functional crossover relocate to functional parent forms:
- subtype_armchair_windsor and subtype_armchair_ladderback added to form_armchair (relocated from Windsor Chair and Ladderback Chair sections of Seating Forms restructured document)
- subtype_side_chair_windsor (new addition not in restructured document) and subtype_side_chair_ladderback (relocated from Ladderback Chair section as side ladderback) added to form_side_chair
- form_windsor_chair retains 8 subtypes covering Windsor-construction variants without functional crossover (sack-back, comb-back, bow-back, fan-back, continuous-arm, rod-back, low-back, hoop-back)
- form_ladderback_chair retains 6 subtypes covering ladderback-construction variants without functional crossover (Shaker, Appalachian/Southern, rush-seat, splint-seat, cane-seat, child's)
- subtype_rocking_chair_windsor and subtype_rocking_chair_ladderback NOT authored in Batch 1; documented in form_windsor_chair and form_ladderback_chair cousin_form_contrasts only; canonical authoring pending in Motion Seating batch (form_rocking_chair canonical authoring)

**X-frame curule naming convention.** X-frame variants use "curule" descriptor instead of "x_frame": subtype_side_chair_curule, subtype_armchair_curule, subtype_folding_chair_curule. Naming choice resolves ambiguity between geometric-X-frame and Roman/Renaissance curule descendants while preserving cross-form consistency.

**form_windsor_chair stub retrofit (Path A in-place).** Existing stub at lines 4421-4430 (corrected from prompt-asserted 4281-4309 per pre-execution verification) retrofitted in place with full canonical content. Form id preserved (form_windsor_chair). Stub replaced from skeletal pre-four-level-taxonomy state (no family_id, no spatial_behavior_id, parent_category: "seating", minimal content) to canonical entry with parent_category: "chair", family_id: "family_seating", spatial_behavior_id: "spatial_single_user_seating", and full canonical content per the 6-form Batch 1 scope.

**Cross-cluster cousin_form_contrast handling (Path A).** Cross-cluster subtype references (Windsor rocker, ladderback rocker — relocated to form_rocking_chair per form-before-style) captured as cousin_form_contrast notes in form_windsor_chair and form_ladderback_chair without forward-reference noise. Engine reasoning works whether the referenced subtypes exist yet or not because cousin_form_contrasts capture cross-form architectural relationships at the canonical form level.

**No anti_classification_guidance population in Batch 1.** None of the 6 Batch 1 forms have crisp date boundaries warranting AntiClassificationGuidance schema field population. Schema field stays unset across all 6 entries (consistent with optional field design from Session 5 Block 2 Step 1). Future Seating batches with form-emergence-date forms (Recliner 1928, Bean Bag 1969, Adirondack 1903, Papasan 1950, Butterfly/Sling 1938, Porch/Lawn Glider 1910, Morris Chair American 1890) will populate the field naturally during their canonical authoring.

**Subtype inventory:** 14 subtypes on form_side_chair, 11 subtypes on form_armchair, 6 subtypes on form_bar_chair, 7 subtypes on form_folding_chair, 8 subtypes on form_windsor_chair, 6 subtypes on form_ladderback_chair. Total Batch 1 subtypes: 52.

**No cross-family alias additions in Batch 1.** Cross-family alias enrichments to existing Tables and Bedroom canonical forms (per Session 6 Block 1 Desks family architectural conversation) are deferred to future content updates on those existing forms.

**Architectural foundation for upcoming Seating canonical authoring:** With Batch 1 complete, Seating family canonical authoring continues across approximately 4-5 additional batches:
- Batch 2: Motion Seating (form_rocking_chair with subtype_rocking_chair_windsor and subtype_rocking_chair_ladderback population per form-before-style)
- Batch 3: Upholstered Lounge Seating (form_lounge_chair, form_morris_chair, form_wing_chair, form_recliner — recliner with anti_classification_guidance for 1928 emergence)
- Batch 4: Multi-User Upholstered Seating + Reclining or Extended Seating (form_settee, form_sofa, form_chaise_longue, form_daybed)
- Batch 5: Bench Seating + Compact Single-User Support + Modern Casual Seating + Outdoor Specialty and Institutional Seating (form_bench, form_stool, form_ottoman_footstool, form_bean_bag_chair, form_papasan_chair, form_butterfly_sling_chair, form_adirondack_chair, form_porch_lawn_glider, form_pew, form_theater_auditorium_seat — most with anti_classification_guidance for form-emergence dates)

Estimated Seating family completion: 4-5 batches across multiple sessions, similar pacing to Tables family canonical authoring.

**Path A schema reconciliation applied.** The prompt's source content used several fields not present in the current FormEntry / FormSubtype schema. Per pre-execution Path A decision (parallel to Session 5 Block 1 and Session 6 Block 1 spatial behavior expansions), source content adapted to existing schema rather than schema extended:
- Top-level `description: "..."` field on each form dropped (FormEntry schema does not include description; existing 36+ canonical forms use distinguishing_features + regional_period_notes for form identity).
- Each subtype's `description: "<string>"` converted to `distinguishing_attributes: ["<same string>"]` (single-element array) per FormSubtype required field.
- `dimensional_thresholds.overall_height_min/max` renamed to `height_min/max` (schema's height fields ARE overall-height); `seat_height_min/max` and `arm_height_min/max` (form_armchair only) moved to `notes` prose.
- Form names normalized to lowercase per existing convention ("side chair", "armchair", "bar chair", "folding chair", "Windsor chair" preserving "Windsor" as proper noun, "ladderback chair") rather than prompt's Title Case.
- form_windsor_chair stub line range corrected from prompt-asserted 4281-4309 (29 lines) to verified actual 4421-4430 (10-line skeletal stub). Lines shifted due to recent commits a5a047d, a53aaa2, 7396ab8.

Zero canonical content meaningfully lost; all adaptations preserve information fidelity through Path A field-rewriting rather than content removal.

---

### 2026-05-08 — Session 6 Block 3 — forms.ts — Desks family canonical authoring Batch 1: Portable Writing Forms sub-cluster (3 forms)

**Authoring scope.** First batch of Desks family canonical authoring covering the Portable Writing Forms sub-cluster (spatial_portable_writing_forms spatial behavior). 3 new canonical forms authored: form_writing_box, form_tabletop_desk, form_field_desk. Pattern parallels Seating Batch 1 (commit f1d57d0) in scope and structure. Source content: Andy's authored Desks Forms reference document (Desk_Forms_-_Full_and_complete.docx, 2026-05-08).

**Subtype inventory:** 8 subtypes on form_writing_box, 5 subtypes on form_tabletop_desk, 9 subtypes on form_field_desk. Total Batch 1 subtypes: 22.

**Path A schema reconciliation applied (parallel to Seating Batch 1):** Source document's "Description" prose folded into regional_period_notes leading sentence. Source document's "Date Range" prose folded into regional_period_notes (FormEntry has no separate date_range field; date_floor and date_ceiling capture the numeric envelope). Each subtype's prose description converted to single-element distinguishing_attributes array. dimensional_thresholds uses height/width/depth/weight numeric ranges (no top-level description, no seat_height/arm_height fields per schema). Form names lowercased per existing canonical convention.

**No anti_classification_guidance population in Batch 1.** None of the 3 Portable Writing Forms have crisp date boundaries warranting structured schema field population. Future Desks batches will populate the field for form_wooton_desk in Batch 5 (1874-1898 original production window), form_computer_desk in Batch 10 (c. 1975 emergence), and form_modular_workstation_desk in Batch 10 (c. 1960 emergence).

**No legacy stub retrofits in Batch 1.** form_secretary_desk and form_slant_front_desk stubs (lines 4399-4420, parent_category: "desk", lacking family_id and spatial_behavior_id) belong to the Fall-Front/Drop-Front Enclosed grouping and will retrofit in place during Batch 4. Batch 1 does not touch them.

**No cross-family alias additions in Batch 1.** Cross-family alias enrichments to existing Tables and Bedroom canonical forms (per Session 6 Block 1 Desks family architectural conversation) are deferred to future content updates on those existing forms.

**Architectural foundation for upcoming Desks batches:** With Batch 1 complete, Desks family canonical authoring continues across 11 additional batches (one per remaining spatial grouping). Plan: Batch 2 Open Writing Stations (4 forms), Batch 3 Kneehole Workstations (5 forms), Batch 4 Fall-Front/Drop-Front Enclosed (6 forms including 2 stub retrofits), Batch 5 Roll-Top/Tambour Enclosed (4 forms), Batch 6 Cabinet/Armoire/Hideaway (3 forms), Batch 7 Shared/Double-Sided (2 forms), Batch 8 Commercial/Institutional (7 forms), Batch 9 Technical/Drafting/Professional (3 forms), Batch 10 Computer/Systems/Modular (5 forms), Batch 11 Built-In/Architectural (3 forms), Batch 12 Convertible/Repurposed (10 forms).

---

### 2026-05-08 — Session 6 Block 4 — forms.ts — Desks family canonical authoring Batch 2: Open Writing Stations sub-cluster (4 forms)

**Authoring scope.** Second batch of Desks family canonical authoring covering the Open Writing Stations sub-cluster (spatial_open_writing_stations spatial behavior). 4 new canonical forms authored: form_bureau_plat, form_bonheur_du_jour, form_kidney_desk, form_carlton_house_desk. Pattern parallels Desks Batch 1 (commit 9747d02) in scope and structure. Source content: Andy's authored Desks Forms reference document (Desk_Forms_-_Full_and_complete.docx, 2026-05-08).

**Subtype inventory:** 4 subtypes on form_bureau_plat, 4 subtypes on form_bonheur_du_jour, 6 subtypes on form_kidney_desk, 6 subtypes on form_carlton_house_desk. Total Batch 2 subtypes: 20.

**Path A schema reconciliation applied (parallel to Desks Batch 1 and Seating Batch 1):** Source document's Description and Date Range prose folded into regional_period_notes. Each subtype's prose description converted to single-element distinguishing_attributes array. dimensional_thresholds uses width/height/depth/weight numeric ranges with notes prose for superstructure/gallery dimensional patterns. Form names lowercased per existing canonical convention; proper noun "Carlton House" preserved in form_carlton_house_desk name and subtype names.

**No anti_classification_guidance population in Batch 2.** None of the 4 Open Writing Stations forms have crisp date boundaries warranting structured schema field population.

**No legacy stub retrofits in Batch 2.** form_secretary_desk and form_slant_front_desk stubs (lines 4399-4420) belong to the Fall-Front/Drop-Front Enclosed grouping and will retrofit in place during Batch 4 (which is Session 6 Block 6 by the Block-numbering pattern). Batch 2 does not touch them.

**Insertion anchor: chronological-authoring-adjacency (Option A locked across all 12 Desks batches).** Insertion point immediately before form_rocking_chair stub. Cumulative file order in Desks region after Block 4: Seating Batch 1 cluster → Desks Batch 1 cluster (3 forms from Block 3) → Desks Batch 2 cluster (4 forms from Block 4) → Seating stubs (form_rocking_chair, form_milking_stool) → other stubs.

---

### 2026-05-08 — Session 6 Block 5 — forms.ts — Desks family canonical authoring Batch 3: Kneehole Workstations sub-cluster (5 forms)

**Authoring scope.** Third batch of Desks family canonical authoring covering the Kneehole Workstations sub-cluster (spatial_kneehole_workstations spatial behavior). 5 new canonical forms authored: form_kneehole_desk, form_pedestal_desk, form_davenport_desk, form_executive_desk, form_credenza_desk. Pattern parallels Desks Batches 1-2 in scope and structure. Source content: Andy's authored Desks Forms reference document (Desk_Forms_-_Full_and_complete.docx, 2026-05-08).

**Subtype inventory:** 9 subtypes on form_kneehole_desk, 7 subtypes on form_pedestal_desk, 5 subtypes on form_davenport_desk, 6 subtypes on form_executive_desk, 5 subtypes on form_credenza_desk. Total Batch 3 subtypes: 32.

**Path A schema reconciliation applied (parallel to Desks Batches 1-2):** Source document's Description and Date Range prose folded into regional_period_notes. Each subtype's prose description converted to single-element distinguishing_attributes array. dimensional_thresholds uses width/height/depth/weight numeric ranges with notes prose for scale variations within the spatial behavior (Davenport variants smaller; executive variants larger). Form names lowercased per existing canonical convention; proper nouns "Davenport", "Georgian", "Queen Anne", "Chippendale", "Federal", "Victorian" preserved.

**form_pedestal_desk consolidation pattern applied:** form_pedestal_desk carries the largest common_aliases list in the Desks family — 38 aliases covering use-context variants (bank desk, government desk, lawyer's desk, tanker desk, foreman's desk, etc.) per the Session 6 Block 1 Framing A consolidation decision. Use-context variants consolidate to this canonical form rather than creating duplicate canonical forms; structural distinctness (pedestal-flanked-kneehole structure) controls canonical classification.

**form_executive_desk configuration-pattern note captured in regional_period_notes:** Return Desk and Bridge Desk arrangements are documented in regional_period_notes prose as office-arrangement configurations rather than as separate canonical forms or subtypes per the Session 6 Block 1 architectural decision. A return desk is a perpendicular secondary work surface positioned next to the primary executive desk; a bridge desk connects the primary desk to a credenza placed behind it.

**No anti_classification_guidance population in Batch 3.** None of the 5 Kneehole Workstations forms have crisp date boundaries warranting structured schema field population.

**No legacy stub retrofits in Batch 3.** form_secretary_desk and form_slant_front_desk stubs (lines 4399-4420) belong to the Fall-Front/Drop-Front Enclosed grouping and will retrofit in place during Batch 4.

**Insertion anchor: chronological-authoring-adjacency (Option A locked across all 12 Desks batches).** Insertion point immediately before form_rocking_chair stub. Cumulative file order in Desks region after Block 5: Seating Batch 1 cluster → Desks Batch 1 cluster (3 forms from Block 3) → Desks Batch 2 cluster (4 forms from Block 4) → Desks Batch 3 cluster (5 forms from Block 5) → Seating stubs → other stubs.

---

### 2026-05-08 — Session 6 Block 6 — forms.ts — Desks family canonical authoring Batch 4: Fall-Front/Drop-Front Enclosed Desks sub-cluster (6 forms including 2 stub retrofits)

**Authoring scope.** Most architecturally complex Desks family canonical authoring batch — combines 4 new canonical form insertions with 2 legacy stub retrofits. 6 forms in scope: form_slant_front_desk (RETROFIT), form_secretary_desk (RETROFIT), form_fall_front_desk (NEW), form_escritoire (NEW), form_secretaire_a_abattant (NEW), form_bureau_a_gradins (NEW). All 6 forms reference family_desks and spatial_fall_front_drop_front_enclosed_desks. Source content: Andy's authored Desks Forms reference document (Desk_Forms_-_Full_and_complete.docx, 2026-05-08).

**Subtype inventory:** 3 subtypes on form_slant_front_desk, 9 subtypes on form_secretary_desk, 6 subtypes on form_fall_front_desk, 5 subtypes on form_escritoire, 3 subtypes on form_secretaire_a_abattant, 3 subtypes on form_bureau_a_gradins. Total Batch 4 subtypes: 29.

**Two stub retrofits in place (parallel to form_windsor_chair retrofit pattern from Seating Batch 1, commit f1d57d0):**
- form_secretary_desk retrofitted in place at lines 4399-4409 (preserved form_id, replaced skeletal stub content with full canonical content). Added family_id: "family_desks" and spatial_behavior_id: "spatial_fall_front_drop_front_enclosed_desks" which were absent on the stub. Added full canonical content with 9 subtypes covering chest secretary, bonnet-top, block-front, breakfront, plus period subtypes (Chippendale, Federal, Empire, Victorian, revival). Date envelope expanded from stub's c. 1700-1999 to c. 1700-2030. Authority levels updated from 7/7 to 8/8.
- form_slant_front_desk retrofitted in place at lines 4410-4420 (same pattern). Added family_id and spatial_behavior_id. Added full distinguishing_features, subtypes (3 entries), dimensional_thresholds, cousin_form_contrasts, common_aliases, regional_period_notes. Date envelope expanded from stub's c. 1700-1899 to c. 1690-2030. Authority levels updated from 7/7 to 8/8.
- Both retrofits preserve form_id as the canonical identifier; no form_id changes. Stub line ranges as verified during planning: form_secretary_desk at 4399-4409 (first), form_slant_front_desk at 4410-4420 (second) — corrected from prompt-asserted reverse ordering.

**4 new canonical form insertions:** form_fall_front_desk, form_escritoire, form_secretaire_a_abattant, form_bureau_a_gradins inserted contiguously immediately before form_rocking_chair stub per Option A insertion anchor pattern locked from Block 3.

**Path A schema reconciliation applied (parallel to Desks Batches 1-3):** Source document's Description and Date Range prose folded into regional_period_notes. Each subtype's prose description converted to single-element distinguishing_attributes array. dimensional_thresholds uses width/height/depth/weight numeric ranges with notes prose for closed-vs-open dimensional distinctions. Form names lowercased per existing canonical convention; French diacritical marks preserved in "secrétaire à abattant" and "bureau à gradins"; English proper nouns "Chippendale", "Federal", "Empire", "Victorian", "French" preserved in subtype names.

**No anti_classification_guidance population in Batch 4.** None of the 6 Fall-Front/Drop-Front Enclosed forms have crisp date boundaries warranting structured schema field population.

**No more legacy Desks stubs after Batch 4.** With form_secretary_desk and form_slant_front_desk retrofits complete, no remaining canonical-pending Desks family stubs in forms.ts. Future Desks batches (Batches 5-12) are pure new-form insertions with no retrofit operations.

**Insertion anchor: chronological-authoring-adjacency (Option A locked across all 12 Desks batches).** The 4 new canonical forms inserted immediately before form_rocking_chair stub. The 2 stub retrofits operate at original stub locations. Cumulative file order in Desks region after Block 6: form_secretary_desk (retrofitted at 4399) → form_slant_front_desk (retrofitted at 4410) → Seating Batch 1 cluster → Desks Batch 1 cluster → Desks Batch 2 cluster → Desks Batch 3 cluster → Desks Batch 4 cluster (4 new forms) → Seating stubs → other stubs.

---

### 2026-05-08 — Session 6 Block 7 — forms.ts — Desks family canonical authoring Batch 5: Roll-Top/Tambour Enclosed Desks sub-cluster (4 forms with first Desks family anti_classification_guidance population)

**Authoring scope.** Fifth batch of Desks family canonical authoring covering the Roll-Top/Tambour Enclosed Desks sub-cluster (spatial_roll_top_tambour_enclosed_desks spatial behavior). 4 new canonical forms authored: form_roll_top_desk, form_cylinder_desk, form_tambour_desk, form_wooton_desk. Source content: Andy's authored Desks Forms reference document (Desk_Forms_-_Full_and_complete.docx, 2026-05-08).

**Subtype inventory:** 10 subtypes on form_roll_top_desk, 3 subtypes on form_cylinder_desk, 3 subtypes on form_tambour_desk, 4 subtypes on form_wooton_desk. Total Batch 5 subtypes: 20.

**form_wooton_desk anti_classification_guidance population — first Desks family use of the AntiClassificationGuidance schema field shipped at commit a5a047d (Session 5 Block 2 Step 1).** Per Session 6 D4 architectural decision: form_wooton_desk has a structurally crisp date_floor at 1874 (original Wooton Manufacturing Company patent and production start by William S. Wooton in Indianapolis, Indiana). Schema field populated as single-object form with boundary_date: 1874, boundary_type: "form_emergence", guidance_text combining reason prose and production-window context (capturing 1874-1898 original production window and reproduction/revival distinction), and prominence: "standard". Pieces predating 1874 cannot be original Wooton desks; later Wooton-inspired desks should be classified as reproductions or revival forms unless firm label, patent stamp, and period-appropriate construction evidence support original attribution.

**Path A schema reconciliation for anti_classification_guidance field-name mapping:** Source content used field names (do_not_classify_before, do_not_classify_before_reason, notes) that do not match the AntiClassificationGuidance interface shipped in commit a5a047d (which defines boundary_date, boundary_type, guidance_text, pre_boundary_classifications, post_boundary_classifications, prominence). Per Path A precedent from prior schema-mismatch batches, source field names mapped to schema-correct fields: do_not_classify_before: 1874 → boundary_date: 1874 + boundary_type: "form_emergence"; do_not_classify_before_reason and notes content combined into single guidance_text string; prominence: "standard" added per schema requirement. All content preserved verbatim through field-name remapping; zero content loss.

**form_cutler subtype consolidation:** form_roll_top_desk includes subtype_roll_top_desk_cutler covering the Cutler patent variants (Cutler patent desk, Cutler office desk, Cutler cabinet desk). Per Session 6 Block 1 architectural decision, the Cutler patent mechanism is captured as a subtype rather than a separate canonical form, distinguished by patent-style locking and concealment features.

**Path A schema reconciliation applied (parallel to Desks Batches 1-4):** Source document's Description and Date Range prose folded into regional_period_notes. Each subtype's prose description converted to single-element distinguishing_attributes array. dimensional_thresholds uses width/height/depth/weight numeric ranges with notes prose for cover-mechanism dimensional distinctions (cylinder cover, tambour scale, Wooton patent rotating section). Form names lowercased per existing canonical convention; "Wooton" preserved as proper noun (William S. Wooton, founder of Wooton Manufacturing Company); "Cutler" preserved in Cutler patent subtype name.

**No legacy stub retrofits in Batch 5.** Zero remaining canonical-pending Desks stubs after Block 6 retrofits (form_secretary_desk and form_slant_front_desk). All future Desks batches (Batches 6-12) are pure new-form insertions.

**Insertion anchor: chronological-authoring-adjacency (Option A locked across all 12 Desks batches).** Insertion point immediately before form_rocking_chair stub. Cumulative file order in Desks region after Block 7: form_secretary_desk and form_slant_front_desk retrofits (lines 4400, 4532) → Seating Batch 1 cluster → Desks Batch 1 cluster → Desks Batch 2 cluster → Desks Batch 3 cluster → Desks Batch 4 cluster (4 new forms from Block 6) → Desks Batch 5 cluster (4 new forms from Block 7) → Seating stubs → other stubs.

---

### 2026-05-08 — Session 6 Block 8 — forms.ts — Desks family canonical authoring Batch 6: Cabinet/Armoire/Hideaway Workstations sub-cluster (3 forms)

**Authoring scope.** Sixth batch of Desks family canonical authoring covering the Cabinet/Armoire/Hideaway Workstations sub-cluster (spatial_cabinet_armoire_hideaway_workstations spatial behavior). 3 new canonical forms authored: form_armoire_desk, form_hutch_desk, form_murphy_desk. Pattern parallels Desks Batch 1 (commit 9747d02) for 3-form batch structure. Source content: Andy's authored Desks Forms reference document (Desk_Forms_-_Full_and_complete.docx, 2026-05-08).

**Subtype inventory:** 6 subtypes on form_armoire_desk, 4 subtypes on form_hutch_desk, 2 subtypes on form_murphy_desk. Total Batch 6 subtypes: 12.

**Architectural distinction captured: form_armoire_desk vs form_converted_cabinet_desk.** Per Session 6 Block 1 architectural decision, form_armoire_desk covers factory-built or original-construction armoire-form desks, while form_converted_cabinet_desk (Batch 12, Convertible/Repurposed grouping) covers cabinets/armoires/wardrobes/cupboards converted to desk use post-original-construction. The form_armoire_desk regional_period_notes captures this distinction explicitly to direct user reports to the correct canonical form.

**Path A schema reconciliation applied (parallel to Desks Batches 1-5):** Source document's Description and Date Range prose folded into regional_period_notes. Each subtype's prose description converted to single-element distinguishing_attributes array. dimensional_thresholds uses width/height/depth/weight numeric ranges with notes prose for closed-vs-deployed dimensional distinctions (Murphy desk's small closed depth expands substantially when deployed). Form names lowercased per existing canonical convention; "Murphy" preserved as proper noun (William Lawrence Murphy, who patented the related Murphy bed mechanism in 1900).

**No anti_classification_guidance population in Batch 6.** None of the 3 Cabinet/Armoire/Hideaway Workstations forms have crisp date boundaries warranting structured schema field population. form_murphy_desk has a related-product emergence (Murphy bed patent 1900) but the desk variant itself emerged broadly across the early-20th-century period without a single crisp emergence date. Per Block 7 precedent, schema population requires structurally crisp date boundaries (Wooton Manufacturing Company specific 1874 patent), which Murphy desks lack.

**No legacy stub retrofits in Batch 6.**

**Insertion anchor: chronological-authoring-adjacency (Option A locked across all 12 Desks batches).** Insertion point immediately before form_rocking_chair stub. Cumulative file order in Desks region after Block 8: form_secretary_desk and form_slant_front_desk retrofits (lines 4400, 4532) → Seating Batch 1 cluster → Desks Batches 1-5 clusters → Desks Batch 6 cluster (3 new forms from Block 8) → Seating stubs → other stubs.

**Mandatory stamina checkpoint.** Per Andy's Option D agreement, this is the pre-checkpoint final batch in tonight's planned 12-batch sequence. After Batch 6 ships, conversation pauses for stamina assessment before continuing to Batches 7-12 tonight or splitting to tomorrow.

---

### 2026-05-08 — Session 6 Block 9 — forms.ts — Desks family canonical authoring Bundle 1 covering Batches 7-9 (12 forms across three spatial groupings)

**Bundle architectural decision (Session 6 evening 2026-05-08):** Mike requested bundling six remaining Desks batches into two larger Claude Code operations to reduce round-trip overhead. Bundle 1 (this Block) covers Batches 7-9 sequentially in a single operation. Bundle 2 (Block 10) will cover Batches 10-12.

**Authoring scope.** Bundle 1 covers 12 new canonical forms across three spatial behaviors:
- Batch 7 (spatial_shared_double_sided_workstations, 2 forms): form_partners_desk, form_benching_desk
- Batch 8 (spatial_commercial_institutional_workstations, 7 forms): form_clerks_desk, form_standing_desk, form_school_desk, form_teachers_desk, form_reception_desk, form_lectern_desk, form_transaction_counter_desk
- Batch 9 (spatial_technical_drafting_professional_workstations, 3 forms): form_workbench_desk, form_artists_desk, form_laboratory_desk

Source content: Mike's authored Desks Forms reference document (Desk_Forms_-_Full_and_complete.docx, 2026-05-08).

**Subtype inventory by batch:**
- Batch 7: 9 subtypes on form_partners_desk, 7 subtypes on form_benching_desk = 16 subtypes
- Batch 8: 5 + 10 + 11 + 5 + 5 + 6 + 6 = 48 subtypes across the 7 commercial/institutional forms
- Batch 9: 5 + 5 + 4 = 14 subtypes across the 3 technical forms
- Bundle 1 total: 78 subtypes across 12 forms

**form_reception_desk and form_transaction_counter_desk consolidation patterns applied:** Both forms carry use-context-variant aliases (hotel/concierge/check-in for reception; cashier/teller/host stand/sales/order/customer service for transaction) consolidated as common_aliases per the Session 6 Block 1 Framing A consolidation decision. Structural distinctness (counter-style configuration with public-facing customer side and reception-vs-transaction prioritization) controls canonical classification.

**form_workbench_desk vs form_converted_industrial_desk architectural distinction captured:** form_workbench_desk regional_period_notes explicitly distinguishes original-construction workbench desks (this canonical form) from form_converted_industrial_desk (Batch 12 Convertible/Repurposed grouping) which covers workbenches/factory carts/machine bases/tool chests converted to desk use post-original-construction. This parallels the form_armoire_desk vs form_converted_cabinet_desk distinction captured in Block 8.

**Path A schema reconciliation applied (parallel to Desks Batches 1-6):** Source document's Description and Date Range prose folded into regional_period_notes. Each subtype's prose description converted to single-element distinguishing_attributes array. dimensional_thresholds uses width/height/depth/weight numeric ranges with notes prose for use-specific dimensional patterns (counter heights, standing/sit-stand ranges, tilting surface degrees, modular configurations). Form names lowercased per existing canonical convention. No proper-noun preservation needed in this bundle (no maker-named forms).

**No anti_classification_guidance population in Bundle 1.** None of the 12 forms have crisp date boundaries warranting structured schema field population. Bundle 2 (Block 10) will populate the field for form_computer_desk (c. 1975 emergence with microcomputer adoption) and form_modular_workstation_desk (c. 1960 emergence with Action Office / systems furniture) per Mike's D4 architectural decision.

**No legacy stub retrofits in Bundle 1.** Zero remaining canonical-pending Desks stubs after Block 6 (form_secretary_desk and form_slant_front_desk retrofits). All future Desks batches are pure new-form insertions.

**Insertion anchor: chronological-authoring-adjacency (Option A locked across all 12 Desks batches).** Insertion point immediately before form_rocking_chair stub. All 12 Bundle 1 forms inserted contiguously in single Edit operation.

---

### 2026-05-09 — Session 7 Blocks 1-7 — workflow architecture — Diagnostic investigation of main-specific 403 and switch to PR-based shipping workflow

**Workflow change context.** During Session 6 Block 9 on 2026-05-08, Mike's first attempted bundled commit (Bundle 1: 12 forms across Batches 7-9, 1272 lines insertion) was rejected by origin/main with HTTP 403 + send-pack: unexpected disconnect signature. The commit landed on origin/claude/update-app-metadata-DwVU8 (dev branch) instead. Three additional push attempts to origin/main during Session 7 returned identical 403 signature regardless of conditions tested.

**Diagnostic investigation summary.** Session 7 Blocks 1-4 systematically ruled out the most likely 403 causes via paired diagnostic operations:
- Block 1: Captured full 403 error context. Confirmed git push --dry-run origin main succeeds (auth handshake works) but actual push fails (server-side receive-pack policy rejects content). Auth path intact; rejection at content-acceptance step.
- Block 2: Workaround re-attempt of Batch 7 alone (2 forms, 232 lines, smallest possible test). Same 403 signature. Size hypothesis invalidated.
- Block 3: Re-attempt push of unchanged commit 12d852e after disabling GitHub Push Protection. Same 403 signature. Push Protection ruled out as cause.
- Block 4: Diagnostic test push to fresh branch off origin/main with trivial throwaway content. Push succeeded with exit 0, GitHub returned PR-creation hint. 403 confirmed main-specific (refs/heads/main only). Repo-wide and identity-wide auth issues ruled out.

**GitHub UI inspection (out-of-band by Mike during Block 4 follow-up):**
- Classic branch protection: not configured (verified empty)
- Repository rulesets: not configured (verified empty)
- Personal account: confirmed (no organization context, no org-level policies possible)
- Installed GitHub Apps: Claude (Anthropic, installed last week) and Vercel (installed 3 weeks ago)
- Vercel project Deployment Protection settings: Vercel Authentication enabled (gates deployment URL access, not git pushes)
- GitHub-level webhooks: none installed
- CODEOWNERS: not present (no enforcement mechanism without webhook)

**Diagnostic candidates remaining unconfirmed:** Path C (suspending Vercel GitHub App temporarily) deferred as too invasive given Vercel handles deployment automation. Investigation of Claude Code's local proxy at 127.0.0.1:41071 deferred as outside scope of standard user investigation. Mike chose to stop diagnosing and switch to PR-based workflow at 2026-05-09 evening.

**Workflow architecture decision (2026-05-09).** All future commits ship via feature branch + pull request to main, NOT direct push to main. The PR-based pattern matches GitHub's recommended workflow for protected branches (which main effectively is, despite the absence of visible protection in standard UI surfaces) and matches the "Create a pull request" hint GitHub explicitly returned in Block 4's successful diagnostic push output.

**Pattern established for all future Blocks:**
1. Claude Code creates a new feature branch off main
2. Claude Code commits batch content on the feature branch
3. Claude Code pushes the feature branch to origin
4. Mike opens PR from feature branch → main via GitHub UI
5. Mike squash-merges the PR via GitHub UI (preserves single-commit-per-batch architecture)
6. Subsequent Block syncs local main to the new origin/main via fast-forward

**Bundle 1 recovery via PR-based workflow (Session 7 Blocks 5-6).** Bundle 1's content (commit 6aa68ff on origin/claude/update-app-metadata-DwVU8) was landed on origin/main via PR squash-merge as commit ba05bb5. Block 5 reset local main to discard the now-redundant Block 2 commit (12d852e); Block 6 fast-forwarded local main to ba05bb5 after Mike's PR merge. All Bundle 1 content (12 forms across Batches 7-9, 78 subtypes, +1272 lines forms.ts +31 lines AUDIT_LOG.md) verified intact on main.

**Operational implications going forward:**
- Direct push to main investigation deferred indefinitely. PR-based workflow works reliably; reclaiming direct push is quality-of-life improvement, not project-blocking.
- Bundle 2 (Batches 10-12, 18 forms) ships via PR-based pattern as Session 7 Block 8.
- All post-Desks family work (DACUM Phase 1-4, diagnostic evidence reference work, future canonical authoring) ships via same PR-based pattern.
- Branch cleanup deferred (claude/update-app-metadata-DwVU8 and diagnostic/push-test-2026-05-09 can be deleted via GitHub UI when Mike chooses).

---

### 2026-05-09 — Session 7 Block 9 — forms.ts — Desks family canonical authoring Bundle 2 covering Batches 10-12 (18 forms across three spatial groupings) — final Desks family content batch

**Bundle architectural decisions (all locked from prior sessions):** Bundle 2 = Batches 10-12 (18 forms) per Mike's Session 6 evening 2026-05-08 D2 decision. Shipped via PR-based workflow per Session 7 Blocks 5-8 pattern establishment. Path A schema reconciliation uniform with all prior Desks batches. AntiClassificationGuidance schema field-name mapping (boundary_date / boundary_type / guidance_text / prominence) anchored on form_wooton_desk's now-shipped Session 6 Block 7 implementation.

**Authoring scope.** Bundle 2 covers 18 new canonical forms across three spatial behaviors:
- Batch 10 (spatial_computer_systems_modular_workstations, 5 forms): form_typewriter_desk, form_computer_desk, form_modular_workstation_desk, form_l_shaped_desk, form_u_shaped_desk
- Batch 11 (spatial_built_in_architectural_desks, 3 forms): form_built_in_desk, form_wall_desk, form_wall_unit_desk
- Batch 12 (spatial_convertible_repurposed_desk_forms, 10 forms): form_drop_leaf_desk, form_gateleg_desk, form_telephone_desk, form_piano_desk, form_organ_desk, form_sewing_machine_desk, form_converted_cabinet_desk, form_converted_industrial_desk, form_converted_dressing_table_desk, form_converted_treadle_machine_desk

Source content: Mike's authored Desks Forms reference document (Desk_Forms_-_Full_and_complete.docx, 2026-05-08).

**Subtype inventory by batch:**
- Batch 10: 5+7+5+5+4 = 26 subtypes
- Batch 11: 5+4+4 = 13 subtypes
- Batch 12: 3+3+4+3+3+3+3+4+3+3 = 32 subtypes
- Bundle 2 total: 71 subtypes across 18 forms

**Two anti_classification_guidance populations in Bundle 2** (per Mike's Session 6 D4 architectural decision):
- form_computer_desk: boundary_date 1975, boundary_type "form_emergence", standard prominence. Captures personal computer era emergence with microcomputer adoption (1975); pieces predating 1975 cannot be original computer desks.
- form_modular_workstation_desk: boundary_date 1960, boundary_type "form_emergence", standard prominence. Captures systems furniture emergence with Herman Miller's Action Office (1964 introduction, 1968 redesign by Robert Propst); pieces predating 1960 cannot be original modular workstation desks.

Both populations use schema-correct AntiClassificationGuidance field structure anchored on form_wooton_desk's now-shipped implementation (Session 6 Block 7), avoiding the field-name reconciliation issue that occurred when drafting from architectural memory in Block 7.

**Two architectural distinctions captured prose-side in regional_period_notes per Session 6 Blocks 8 and 9 architectural decisions:**
- form_converted_cabinet_desk vs form_armoire_desk: form_converted_cabinet_desk regional_period_notes explicitly distinguishes post-original-construction cabinet conversions (this canonical form) from form_armoire_desk's factory-built/original-construction armoire-form desks (Block 8 of Session 6).
- form_converted_industrial_desk vs form_workbench_desk: form_converted_industrial_desk regional_period_notes explicitly distinguishes post-original-construction industrial conversions (this canonical form) from form_workbench_desk's factory-built/original-construction workbench desks (Bundle 1 / Block 9 of Session 6).

**Path A schema reconciliation applied (parallel to Desks Batches 1-9):** Source document's Description and Date Range prose folded into regional_period_notes. Each subtype's prose description converted to single-element distinguishing_attributes array. dimensional_thresholds uses width/height/depth/weight numeric ranges with notes prose for use-specific dimensional patterns. Form names lowercased per existing canonical convention; "L-shaped" and "U-shaped" preserved as proper-noun-style descriptors per established Block 9 (Session 6) Bundle 1 pattern (which had subtype names like "executive L-desk" and "executive U-desk" already shipped); "Singer", "William and Mary", "Herman Miller", "Steelcase" preserved as proper nouns in subtype names and regional_period_notes prose.

**Insertion anchor: chronological-authoring-adjacency (Option A locked across all 12 Desks batches).** Insertion point immediately before form_rocking_chair stub. All 18 Bundle 2 forms inserted contiguously in single Edit operation in batch order: Batch 10 forms (5), then Batch 11 forms (3), then Batch 12 forms (10).

**Final Desks family content batch.** With Bundle 2 merged, all 55 Desks family canonical forms are on main. Desks family canonical authoring complete.

---

### 2026-05-10 — Session 8 Block 1 — Entry/Support Forms canonical authoring (22 forms across 8 groupings, 8 new spatial behaviors) — first non-Desks family canonical authoring batch

**Bundle architectural decisions (locked from prior sessions, with D-E1-D correction):** Entry/Support Forms is the first non-Desks family canonical authoring batch, shipped via PR-based workflow per Session 7 pattern establishment. Mike's authored content (Entry_Support_Forms_Corrected.docx, 2026-05-10) drives canonical content; DACUM Phase 3 assignments (Spatial Function and Form Grouping placeholders) determine architectural placement. Path A schema reconciliation pattern uniform with all Desks family batches.

**Authoring scope.** 22 canonical forms across 8 form groupings, supported by 8 new spatial behaviors:
- Garment and Personal Item Stands (6 forms): form_hall_tree, form_coat_rack, form_hat_rack, form_umbrella_stand, form_valet_stand, form_smoking_stand
- Display and Plant Support Stands (3 forms): form_pedestal, form_plant_stand, form_aquarium_stand
- Mirror and Screen Forms (2 forms): form_screen, form_mirror
- Communication and Tech Support Stands (3 forms): form_telephone_stand, form_charging_station, form_package_station
- Personal Hygiene Stands (1 form): form_washstand
- Container and Box Forms (1 form): form_box
- Specialty Body Support Frames (2 forms): form_hammock_stand, form_funeral_bier
- Domestic Specialty Storage and Organization (4 forms): form_toy_storage, form_bench_utility, form_entry_organizer, form_pet_utility

**Subtype inventory by grouping:** 16 + 12 + 12 + 6 + 5 + 17 + 4 + 12 = 84 subtypes total.

**Spatial behavior architecture (D-E1-D supersedes D-E1-B):**

All 8 spatial behaviors added as new entries to spatialBehaviors.ts. No in-place rename of any existing behavior.

The earlier D-E1-B decision (made 2026-05-09 evening based on the 2026-05-07 Spatial Function Definitions Revised document) had assumed `spatial_transitional_access_support` already existed as a shipped entry to be repurposed in-place. The Op A pre-state verification at the start of this Block discovered that assumption was incorrect — the 2026-05-07 reference document had drifted from the actual shipped state of spatialBehaviors.ts; `spatial_transitional_access_support` had been planned in earlier session work but was never actually shipped. The 41 pre-edit spatial behaviors did not include it. D-E1-D supersedes D-E1-B: all 8 Entry/Support Forms spatial behaviors are net new additions.

The 8 new spatial behavior entries:
- spatial_transitional_access_support (Garment and Personal Item Stands)
- spatial_display_and_plant_support_stands
- spatial_mirror_and_screen_forms
- spatial_communication_and_tech_support_stands
- spatial_personal_hygiene_stands
- spatial_container_and_box_forms
- spatial_specialty_body_support_frames
- spatial_domestic_specialty_storage_and_organization

This is the first PR to add multiple spatial behaviors in a single shipment (Desks family added behaviors incrementally over multiple sessions). The DACUM-first methodology — determining the spatial taxonomy shape upfront via Phase 3 assignment before authoring — enabled this consolidated architectural addition.

**One classification-boundary annotation in Entry/Support Forms** (per modern-emergence handling decision):
- form_charging_station: boundary_date 1995, boundary_type "form_emergence", standard prominence. Captures digital-era device-charging furniture emergence with personal digital device proliferation in the mid-1990s; pieces predating 1995 cannot be original charging stations.

The annotation uses schema-correct AntiClassificationGuidance field structure (boundary_date / boundary_type / guidance_text / prominence) anchored on form_wooton_desk's now-shipped Session 6 Block 7 implementation, parallel to Bundle 2's form_computer_desk and form_modular_workstation_desk annotations.

**Modern-emergence forms handled prose-side rather than via standalone classification-boundary annotation:**
- form_package_station (post-2010 emergence): broader form already postdates 2010, captured in regional_period_notes prose
- subtype smart parcel station (post-2015 emergence): captured in subtype distinguishing_attributes and parent regional_period_notes
- subtype smart mirror under form_mirror (post-2015 emergence): captured in subtype distinguishing_attributes
- subtype charging valet under form_valet_stand (post-2010 emergence): captured in subtype distinguishing_attributes

**Cross-family overlaps documented (Phase 1 footnote follow-through):**
- form_box subtypes "writing slope" and "lap desk" overlap with form_portable_writing_box subtypes from Desks family Batch 1. The cross-family overlap is captured in form_box cousin_form_contrasts and regional_period_notes prose. Both classification traditions (box-form vs. desk-form) are preserved; future architectural review may reconcile if desired.
- form_telephone_stand vs form_telephone_desk (Desks family Bundle 2 Batch 12). Distinguished by scale and seating: form_telephone_stand is compact passive-support form; form_telephone_desk is workstation-scale form with integrated seating and writing surface. Subtype "gossip bench" belongs to form_telephone_desk per its Bundle 2 shipment; "telephone cabinet" belongs to form_telephone_stand.
- form_torchere not yet drafted: appears in DACUM assignments under Lighting spatial function, not Entry/Support Forms. The Torchère vs. "Torchiere Lamp" subform overlap (Phase 1 footnote) will be resolved when Lighting family canonical authoring proceeds.
- form_candelabrum subtype "candle stand" not yet drafted: appears in DACUM assignments under Lighting spatial function. Cross-form duplicate with Church Furnishing's "Candle Stand" subform will be resolved when Lighting and Industrial/Professional families' canonical authoring proceeds.

**Path A schema reconciliation applied (parallel to Desks Batches 1-12):** Source document's Unique Characteristics, Identifying Elements, Regional Identifiers, Emergence and Conclusion Dates, and Cousin Forms + Identifying Contrasts prose folded into canonical schema fields (distinguishing_features, dimensional_thresholds with width/height/depth/weight, cousin_form_contrasts, common_aliases, regional_period_notes). Each subtype's authored prose converted to single-element distinguishing_attributes array. Form names lowercased per existing canonical convention; proper nouns preserved (Singer, William and Mary, Herman Miller, Steelcase from Desks; Coromandel, Shoji, William and Mary preserved here in subtype names and regional_period_notes prose).

**First non-Desks family canonical authoring milestone.** Entry/Support Forms is the first family added to the canonical taxonomy outside Desks. Demonstrates that the schema, Path A reconciliation pattern, and PR-based workflow generalize cleanly to families outside the Desks family. Architectural patterns established in Desks family canonical authoring (subtype distinguishing_attributes structure, dimensional_thresholds with use-specific notes, cousin_form_contrasts cross-form distinctions, regional_period_notes period and material specificity, AntiClassificationGuidance schema-correct field structure) hold without modification across the family transition.

**Final architectural state after this PR merges:**
- 118 canonical forms total (96 + 22 from Entry/Support Forms)
- ~595 canonical subtypes (511 + 84 from Entry/Support Forms)
- 49 spatial behaviors (41 + 8 new from Entry/Support Forms; all 8 are net additions per D-E1-D, no existing behavior renamed or modified)
- 13 classification-boundary annotations (12 + 1 from form_charging_station)
- 7 families with canonical content on main: Desks (complete, 55 forms), Bedroom, Dining, General Storage, Seating, Tables, Entry/Support Forms (newly added)

---

### 2026-05-10 — Session 8 Block 3 — Baskets canonical authoring (1 form, 12 subtypes, 1 new spatial behavior, 1 new family) — second non-Desks family canonical authoring batch

**Bundle architectural decisions (locked from prior sessions):** Baskets is the second non-Desks family canonical authoring batch (Entry/Support Forms was first, shipped as PR #5 / commit 8a40b26). Shipped via PR-based workflow per Session 7/8 establishment. Mike's authored content (Basket_Forms_Expanded.docx, 2026-05-10) drives canonical content. Path A schema reconciliation pattern uniform with all prior batches.

**Authoring scope.** 1 canonical form (form_basket) across 1 form grouping ("Baskets"), supported by 1 new spatial behavior (spatial_baskets) and 1 new family entry (family_baskets):
- form_basket with 12 subtypes: sewing basket, market basket, picnic basket, gathering basket, storage basket, laundry basket, waste basket, egg basket, fishing creel, split oak basket, wicker basket, nantucket basket

**Subtype inventory:** 12 subtypes total.

**D-B1-C architectural decision (locked):**

family_baskets added as standalone new family. The DACUM Phase 3 analysis flagged a deferred architectural question: whether Baskets and Box Form (currently form_box in family_entry_support_forms / Container and Box Forms grouping) should both belong to a broader "Container Forms" or "Portable Container Forms" family. D-B1-C ships Baskets as a standalone family for now and preserves the consolidation question for future architectural review.

**Construction logic assignment decision:**

family_baskets is assigned construction_logic_id: construction_mechanical_integrated as a semantic catch-all, matching the Block 1 Entry/Support Forms precedent. This is a semantic stretch — baskets are not literally mechanical or integrated systems — but the four-logic taxonomy (case, frame, surface, mechanical_integrated) is closed-by-design via an ordinal literal union schema (`"I" | "II" | "III" | "IV"`), making extension a dedicated architectural decision rather than a side-effect of content authoring. Option to extend the taxonomy with construction_woven was considered and deferred as architecturally heavy: it would require schema modification (extending the ordinal literal union), composition of rich authored content matching the four existing entries (shared_construction_characteristics, identifying_elements, functional_behavior, historical_evolution_narrative, disambiguation_from_other_logics), and warrants its own dedicated PR with architectural justification visible in commit history. Future architectural review may revisit when the Container Forms consolidation question (D-B1-C deferred) or Industrial/Professional family canonical authoring proceeds.

**Spatial behavior architecture:**

spatial_baskets added as a new entry. Single spatial behavior for the single form, matching the family-name pattern. Future architectural review may revise the behavior name if Container Forms consolidation proceeds.

**No anti_classification_guidance populations in this Block.** Baskets predate the schema's diagnostic boundaries; the form is broadly continuous from pre-colonial and colonial-era American production through present artisan production. Modern variants (mid-century plastic-coated wire laundry baskets, contemporary office plastic waste baskets, etc.) are noted prose-side in regional_period_notes and subtype distinguishing_attributes rather than via standalone classification-boundary annotations.

**Cross-family overlap documented (Phase 1 footnote follow-through):**
- form_basket vs form_box (Entry/Support Forms / Container and Box Forms grouping): both are portable container forms; the construction-tradition distinction (woven vs rigid joinery) drives the form-vs-form classification. Documented in form_basket cousin_form_contrasts. The Container Forms consolidation question is deferred per D-B1-C.

**Path A schema reconciliation applied (parallel to all prior batches):** Source document's Unique Characteristics, Identifying Elements, Regional Attributes, Emergence and Conclusion Dates, and Cousin Forms + Identifying Contrasts prose folded into canonical schema fields (distinguishing_features, dimensional_thresholds with width/height/depth/weight, cousin_form_contrasts, common_aliases, regional_period_notes). Each subtype's authored prose converted to single-element distinguishing_attributes array. Form name lowercased per existing canonical convention; proper nouns preserved (Nantucket, Appalachian, Pennsylvania German, Native American, Ozark, New England in regional_period_notes prose). The schema-correct shape was verified before drafting against the SpatialBehaviorEntry interface and pre-existing entry conventions (lesson learned from Block 1's six-error recovery: schema-verify before drafting, not after errors surface).

**Known issue from Block 1 — referential integrity mismatch:**

Block 1 (PR #5, commit 8a40b26) shipped 22 forms with family_id: "family_entry_support_forms" but the corresponding family entry in families.ts uses id: "family_entry_support" (without _forms suffix). The mismatch passed tsc because family_id is typed as string rather than strict enum, and Block 1's grep gates verified internal consistency without cross-checking forms.ts ↔ families.ts referential integrity. This bug is out of scope for Block 3 and will be addressed in a dedicated follow-up Block. Resolution direction TBD: either rename the 22 forms' family_id references to "family_entry_support" (matching families.ts) or rename the family entry's id to "family_entry_support_forms" (matching forms.ts). The Block 3 Baskets entries use family_baskets consistently in both files, so no Block 3 internal mismatch exists.

**Second non-Desks family canonical authoring milestone.** Baskets is the second family added to the canonical taxonomy outside Desks (after Entry/Support Forms in Block 1). Demonstrates that the schema, Path A reconciliation pattern, and PR-based workflow continue to generalize across families. Validates the multi-family-extension pattern for the remaining DACUM-assigned families (Lighting, Clock Cases, Musical and Mechanical Furniture, Industrial/Professional).

**Final architectural state after this PR merges:**
- 119 canonical forms total (118 + 1 from Baskets)
- ~607 canonical subtypes (595 + 12 from Baskets)
- 50 spatial behaviors (49 + 1 new from Baskets)
- 11 family entries (10 + 1 new from Baskets)
- 13 anti_classification_guidance populations (unchanged from Block 1 — no new populations in this Block)
- 8 families with canonical content on main: Desks (complete, 55 forms), Bedroom, Dining, General Storage, Seating, Tables, Entry/Support Forms, Baskets (newly added)

---

### 2026-05-10 — Session 8 Block 5 — Block 1 referential integrity bug fix (Direction A)

Resolves the Block 1 known-issue documented in the Block 3 audit log entry: the 22 Entry/Support Forms shipped in PR #5 (commit 8a40b26) referenced family_id: "family_entry_support_forms" but the corresponding family entry in families.ts used id: "family_entry_support" (without _forms suffix). The mismatch passed tsc because family_id is typed as string rather than strict enum.

**Resolution: Direction A.** The family entry's id is renamed from "family_entry_support" to "family_entry_support_forms" to match the 22 forms' references and the audit log narrative convention used throughout Blocks 1-4.

**Rationale for Direction A over Direction B:**
- Minimal change surface (1 line in families.ts vs 22 lines in forms.ts)
- Family canonical id matches the family's actual name ("Entry/Support Forms" → family_entry_support_forms), parallel to family_baskets matching "Baskets"
- Preserves the existing convention used throughout shipped forms.ts entries
- Matches the audit log narrative convention used in Blocks 1, 2, 3, 4

**Scope.** Single 1-line change in lib/constraints/families.ts. No other files modified. No new content authored. No spatial behaviors, forms, or subtypes added or modified.

**Diagnostic note for future drafting workflows.** This bug surfaced during Block 3's pre-emptive schema discovery (the same schema-verify-before-drafting workflow that prevented Block 1-style six-error recovery in Block 3). The bug was caught not by tsc (which accepted the string mismatch) and not by Block 1's grep gates (which verified internal consistency without cross-checking forms.ts ↔ families.ts referential integrity). Going forward, family-introduction PRs should include a referential integrity gate: confirm that forms.ts family_id references resolve to actual ids in families.ts. Block 6 onward will include this gate as standard.

**Final architectural state after this PR merges:**
- 119 canonical forms total (unchanged)
- ~607 canonical subtypes (unchanged)
- 50 spatial behaviors (unchanged)
- 11 family entries (unchanged — just one renamed)
- 13 anti_classification_guidance populations (unchanged)
- 8 families with canonical content on main: Desks, Bedroom, Dining, General Storage, Seating, Tables, Entry/Support Forms (now with correct referential integrity), Baskets

---

### 2026-05-10 — Session 8 Block 7 — Lighting canonical authoring (6 forms, 20 subtypes, 4 new spatial behaviors, 1 new family) — third non-Desks family canonical authoring batch

**Bundle architectural decisions (locked from prior sessions):** Lighting is the third non-Desks family canonical authoring batch (Entry/Support Forms = PR #5 commit 8a40b26, Baskets = PR #6 commit 28582aa). Shipped via PR-based workflow per Session 7/8 establishment. Mike's authored content (Lighting_Forms_Expanded.docx, 2026-05-10) drives canonical content. Path A schema reconciliation pattern uniform with all prior batches.

**Authoring scope.** 6 canonical forms across 4 form groupings, supported by 4 new spatial behaviors (one per form grouping) and 1 new family entry (family_lighting):
- Floor-Standing Lighting (2 forms): form_torchere (2 subtypes), form_floor_lamp (4 subtypes)
- Surface-Set Lighting (2 forms): form_table_lamp (5 subtypes), form_candelabrum (2 subtypes)
- Wall-Mounted Lighting (1 form): form_wall_lighting_form (3 subtypes)
- Suspended Lighting (1 form): form_hanging_lighting_form (4 subtypes)

**Subtype inventory by form:** 2 + 4 + 5 + 2 + 3 + 4 = 20 subtypes total.

**Architectural decisions:**

D-L1 (locked): family_lighting uses construction_logic_id "construction_mechanical_integrated" per Block 1 Entry/Support Forms and Block 3 Baskets precedent. Lighting forms house mechanical/functional elements (burner mechanisms, gas piping with valves, electric components with sockets and wiring) integrated into structural form, making this construction logic assignment semantically less of a stretch than baskets. The four-logic ordinal taxonomy remains closed-by-design (Block 3 decision); construction_woven and any prospective construction_lighting extensions remain deferred to dedicated future PR.

D-L2 (locked): 4 spatial behaviors named per form grouping (spatial_floor_standing_lighting, spatial_surface_set_lighting, spatial_wall_mounted_lighting, spatial_suspended_lighting). Each behavior describes a distinct structural relationship to the room/architecture: floor-anchored vertical (floor-standing), surface-resting portable (surface-set), wall-attached fixed (wall-mounted), ceiling-suspended overhead (suspended). The grouping-derived naming makes the form-to-behavior linkage explicit and supports future architectural review.

**No anti_classification_guidance populations in this Block.** All 6 lighting forms are broadly continuous from colonial-or-earlier era through present, spanning candle, oil, kerosene, gas, and electric fuel systems within unified form categories. Fuel-system-specific boundaries (e.g., gas brackets emerging c. 1840-1860, kerosene lamps c. 1850 onward, electric variants from c. 1880 onward, halogen torchieres in late 20th century) are captured prose-side in subtype distinguishing_attributes and regional_period_notes rather than via standalone classification-boundary annotations. The forms themselves predate any of these fuel-system boundaries in their candle-burning earliest variants.

**Cross-form overlaps documented in canonical content (Phase 1 footnote follow-through):**

1. form_torchere vs subtype torchiere_lamp under form_floor_lamp: same underlying lighting concept (tall floor-standing upward illumination) under different naming conventions. form_torchere captures the historical and decorative tradition with European precedents; form_floor_lamp's torchiere_lamp subtype captures the modern American retail-context naming. Cross-form linkage documented in form_torchere cousin_form_contrasts and regional_period_notes, in form_floor_lamp cousin_form_contrasts and torchiere_lamp subtype distinguishing_attributes. The duplicate-but-different-context approach preserves both classification traditions rather than forcing single classification.

2. form_candelabrum subtype candle_stand vs future form_church_furnishing subtype candle_stand (Industrial/Professional family, future Block): same name but different parent contexts. The candelabrum's candle_stand is domestic decorative surface-set form. The church furnishing candle_stand will be ecclesiastical altar/processional form. Both subtypes will exist under different parent forms when Industrial/Professional family ships; diagnostic distinction is context (domestic vs ecclesiastical), scale, and placement (mantel/sideboard vs altar/aisle). Documented in form_candelabrum cousin_form_contrasts and regional_period_notes, and in the candle_stand subtype distinguishing_attributes which explicitly references the future Church Furnishing context.

**Path A schema reconciliation applied (parallel to all prior batches):** Source document's Unique Characteristics, Identifying Elements, Regional Identifiers, Emergence and Conclusion Dates, and Cousin Forms + Identifying Contrasts prose folded into canonical schema fields (distinguishing_features, dimensional_thresholds with width/height/depth/weight, cousin_form_contrasts, common_aliases, regional_period_notes). Each subtype's authored prose converted to single-element distinguishing_attributes array. Form names lowercased per existing canonical convention; proper nouns preserved (Neoclassical, Victorian, Art Deco, Hollywood Regency, Federal, Empire, Arts and Crafts, Colonial Revival in regional_period_notes prose). Schema-correct shape verified before drafting against SpatialBehaviorEntry, FamilyEntry, and FormEntry interfaces (Block 3 pattern: schema-verify-before-drafting prevents Block 1-style six-error recovery).

**Third non-Desks family canonical authoring milestone.** Lighting is the third family added to the canonical taxonomy outside Desks (after Entry/Support Forms in Block 1 and Baskets in Block 3). Demonstrates that the schema, Path A reconciliation pattern, and PR-based workflow continue to generalize across families with distinct functional roles (entry-support transitional forms, basket woven containers, lighting illumination forms). All three workflow standards established in prior Blocks continue:
- Pre-emptive schema discovery (Block 3 onwards)
- Referential integrity gate (Block 5 onwards)
- Forbidden field check (Block 4 onwards)

This Block's 4-spatial-behavior architectural addition is the largest multi-spatial-behavior single-family canonical authoring in the project to date (Block 1's Entry/Support Forms added 8 spatial behaviors but had to recover from substantial drafting errors; Block 7 Lighting adds 4 spatial behaviors with schema-verified drafting from the start).

**Final architectural state after this PR merges:**
- 125 canonical forms total (119 + 6 from Lighting)
- ~627 canonical subtypes (607 + 20 from Lighting)
- 54 spatial behaviors (50 + 4 new from Lighting)
- 12 family entries (11 + 1 new family_lighting; referential integrity correct for all family_id references)
- 13 anti_classification_guidance populations (unchanged — no new populations in this Block)
- 9 families with canonical content on main: Desks (complete, 55 forms), Bedroom, Dining, General Storage, Seating, Tables, Entry/Support Forms, Baskets, Lighting (newly added)

---

### 2026-05-10 — Session 8 Block 9 — Industrial/Professional canonical authoring (29 forms, 122 subtypes, 10 new spatial behaviors, in-place stub update of family_industrial_professional) — fourth non-Desks family canonical authoring batch and largest single-PR canonical authoring in project to date

**Bundle architectural decisions (locked from prior sessions):** Industrial/Professional is the fourth non-Desks family canonical authoring batch (Entry/Support Forms = PR #5 commit 8a40b26, Baskets = PR #6 commit 28582aa, Lighting = PR #8 commit 44c0629, Industrial/Professional = this Block). Shipped via PR-based workflow per Session 7/8 establishment. Mike's authored content (industrial_professional_forms_revised.docx, 2026-05-10) drives canonical content after a delegated-editing damage detection caught the first uploaded version's templated-prose issue and Mike re-authored substantive content per form/subform. Path A schema reconciliation pattern uniform with all prior batches.

**Authoring scope.** 29 canonical forms across 10 form groupings, supported by 10 new spatial behaviors (one per form grouping) and 1 in-place update of an existing family stub entry (family_industrial_professional):
- Vertical Reading and Speaking Stands (5 forms): form_easel (3 subtypes), form_music_stand (3 subtypes), form_lectern (4 subtypes), form_podium (3 subtypes), form_pulpit (3 subtypes)
- Personal Service Stations (2 forms): form_barber_station (2 subtypes), form_salon_station (2 subtypes)
- Kitchen and Utility Workstations (2 forms): form_dry_sink (3 subtypes), form_kitchen_utility_unit (4 subtypes)
- Retail and Commercial Fixtures (5 forms): form_kiosk (5 subtypes), form_showcase (4 subtypes), form_retail_fixture (4 subtypes), form_hospitality_fixture (4 subtypes), form_beverage_service_form (4 subtypes)
- Specialized Storage and Organization (5 forms): form_rack (8 subtypes), form_locker (8 subtypes), form_educational_fixture (5 subtypes), form_built_in_storage (4 subtypes), form_shelving_system (4 subtypes)
- Religious and Ceremonial Fixtures (1 form): form_church_furnishing (9 subtypes)
- Scientific Equipment Stands (1 form): form_scientific_stand (4 subtypes)
- Institutional and Workplace Fixtures (5 forms): form_cabinet_of_curiosities (3 subtypes), form_time_clock_station (2 subtypes), form_safety_fixture (5 subtypes), form_industrial_station (4 subtypes), form_bank_fixture (3 subtypes)
- Workstation Accessories and Mobile Fixtures (2 forms): form_workstation_accessory (4 subtypes), form_utility_cart (5 subtypes)
- Environmental Control Cabinets (1 form): form_environmental_utility_form (4 subtypes)

**Subtype inventory by form:** 3+3+4+3+3+2+2+3+4+5+4+4+4+4+8+8+5+4+4+9+4+3+2+5+4+3+4+5+4 = 122 subtypes total.

**Architectural decisions:**

D-IP1 (locked): family_industrial_professional uses construction_logic_id "construction_mechanical_integrated" per Block 1/3/7 precedent. Industrial/Professional represents the smallest semantic stretch among the four families using this catch-all assignment — most forms genuinely embody mechanical/integrated systems (lockers with locking mechanisms, time clocks with punch mechanisms, bank vault doors with combination locks, charging lockers with electronics, environmental cabinets with active climate-control systems). The four-logic ordinal taxonomy (case, frame, surface, mechanical_integrated) remains closed-by-design (Block 3 decision); no taxonomy extension proposed in this Block.

D-IP2 (locked): 10 spatial behaviors named per form grouping. Each behavior describes the distinct workflow-context structural relationship of its associated forms:
- spatial_vertical_reading_and_speaking_stands: stand-based behavior for vertical-plane reading/display/speaking
- spatial_personal_service_stations: service-counter behavior for personal-care services
- spatial_kitchen_and_utility_workstations: utility-counter behavior for kitchen/scullery/pantry tasks
- spatial_retail_and_commercial_fixtures: commercial-display behavior for customer-facing retail
- spatial_specialized_storage_and_organization: institutional-storage behavior for workplace/educational/operational settings
- spatial_religious_and_ceremonial_fixtures: sanctuary-furnishing behavior for worship/ritual/ceremony
- spatial_scientific_equipment_stands: precision-mount behavior for scientific instruments
- spatial_institutional_and_workplace_fixtures: institutional-fixture behavior for purpose-built operational fixtures
- spatial_workstation_accessories_and_mobile_fixtures: mobile-or-accessory behavior supplementing primary workstations
- spatial_environmental_control_cabinets: climate-and-storage-control behavior for environment-managed storage

D-IP3 (locked): Single PR scope. All 29 forms, 10 spatial behaviors, 1 family entry in-place update, single audit log entry in one commit. Single squash-merge keeps commit history clean. Largest single-PR canonical authoring in the project to date (~2400-2800 forms.ts insertions plus ~200 spatialBehaviors.ts plus ~10-12 families.ts insertions/deletions plus ~150 AUDIT_LOG.md).

**No standalone anti_classification_guidance populations in this Block.** Modern-emergence subtypes (Smart Locker, Parcel Locker, Charging Locker, Self-Service Kiosk, modern wine cabinets, contemporary coffee bars, etc.) are handled prose-side in subtype distinguishing_attributes and parent regional_period_notes rather than via standalone classification-boundary annotations. This follows Block 1/7 precedent where modern-emergence forms within continuously-existing form categories are documented prose-side. Future architectural review may add standalone populations if subtype-level diagnostic boundary annotation becomes warranted (e.g., for Smart Locker which strictly cannot exist before electronic-access technology widespread post-2000).

**Cross-form overlaps documented in canonical content (Phase 1 footnote follow-through):**

1. form_church_furnishing's candle_stand subtype ↔ form_candelabrum's candle_stand subtype (Block 7 Lighting): Block 7's audit log predicted this exact overlap. Block 9 delivers resolution: church candle_stand has multiple sockets, drip trays, liturgical placement, and wax-heavy use (altar, vigil, processional, devotional contexts); domestic candle_stand from Lighting family has single or limited candle placements and surface-set decorative use. Same name, different parent contexts. Documented in both forms' cousin_form_contrasts and regional_period_notes. Architectural overlap from Block 7 now resolved with two distinct subtype contents in shipped state.

2. form_pulpit ↔ form_church_furnishing: both are religious-context sanctuary forms but maintained as separate forms due to different spatial behaviors. Pulpit is in spatial_vertical_reading_and_speaking_stands (preaching-station vertical-plane work surface). Church Furnishing is in spatial_religious_and_ceremonial_fixtures (altars, pews, communion rails, etc.). The shared sanctuary context links the two forms architecturally; cross-form note in form_pulpit regional_period_notes addresses this explicitly.

3. form_rack's hat_rack subtype ↔ form_hat_rack (Entry/Support Forms family, Block 1): same form-name "hat rack" in different family contexts. Industrial/Professional hat_rack subtype is commercial/institutional context (haberdashery, theatrical wardrobe, hotel checking, museum installation); Entry/Support form_hat_rack is domestic entry-zone use. Both classification traditions preserved.

4. form_workstation_accessory's credenza_low subtype ↔ Dining family credenza (future canonical authoring): same form-name "credenza" in different family contexts. Workstation accessory credenza is office-context low-storage form; Dining family credenza will be meal-service buffet-style form when Dining family canonical authoring proceeds.

5. form_industrial_station ↔ form_scientific_stand (laboratory_bench subtype): both have benchtop workshop forms but differ in workflow emphasis. Industrial Station emphasizes manufacturing/fabrication with heavy-duty construction; Scientific Stand's laboratory bench emphasizes instrument/glassware-handling with chemical-resistant surfaces. Documented in both forms' cousin_form_contrasts.

6. form_rack's wine_rack subtype ↔ form_environmental_utility_form's wine_cabinet subtype: both store wine but differ in environmental-control function. Wine Rack is open unrefrigerated storage; Wine Cabinet has active climate control. Documented in both forms' cousin_form_contrasts.

**Path A schema reconciliation applied (parallel to all prior batches):** Source document's Unique Characteristics, Identifying Elements, Regional Identifiers, Emergence and Conclusion Dates, and Cousin Forms + Identifying Contrasts prose folded into canonical schema fields (distinguishing_features, dimensional_thresholds with width/height/depth/weight, cousin_form_contrasts, common_aliases, regional_period_notes). Each subtype's authored prose converted to single-element distinguishing_attributes array. Form names lowercased per existing canonical convention; proper nouns preserved (Pennsylvania German, Colonial Revival, Gothic Revival, Federal, Empire, Hoosier, Diebold, Mosler, York Safe & Lock, etc. in regional_period_notes prose). Schema-correct shape verified before drafting against SpatialBehaviorEntry, FamilyEntry, and FormEntry interfaces (Block 3 pattern; Block 7 validated zero-recovery; Block 9 maintains the standard).

**Workflow refinement — family-stub-check standard.** Block 9's Op A pre-state verification surfaced that the original 10-family baseline included stub entries for families that hadn't yet had canonical content shipped (Industrial/Professional, Musical/Mechanical, Clock Cases). The Block 9 drafting initially assumed family_industrial_professional was a new addition, but the entry already existed as a stub at families.ts lines 187-201. Op A absence check returned 1, not 0, triggering STOP per failure handling. Resolution: in-place update of the existing stub rather than append (Option 2). Family count remains 12 (unchanged); description expanded to Block 1/3/7 family entry richness; name updated from "Industrial and Professional" to slash form "Industrial/Professional"; family_characteristics array preserved verbatim; construction_logic_id and authority/migration_status fields preserved.

**Workflow standard established for subsequent family Blocks:**
- Op A absence check for a target family id is replaced by an Op A2 family-stub-check: query for existing stub presence and, if found, capture verbatim content for in-place update.
- Applies prospectively to Clock Cases (family_clock_cases, likely present as stub) and Musical and Mechanical Furniture (family_musical_mechanical, likely present as stub) — both pre-existing in the original 10-family baseline and slated for future canonical-authoring Blocks. Each Block's Op A will confirm via its own verification.
- Future family Blocks will document Op C as either "append" (net-new family) or "in-place stub update" (pre-existing baseline stub) explicitly in the plan, never assumed.
- Rationale: the original 10-family baseline pre-dated the canonical-authoring program. Blocks 1, 3, 7 also touched pre-existing stubs but the discovery was not formalized as a standard until Block 9.

**Fourth non-Desks family canonical authoring milestone.** Industrial/Professional is the fourth family added to the canonical taxonomy outside Desks. Demonstrates that the schema, Path A reconciliation pattern, and PR-based workflow scale to substantial scope (29 forms vs. prior largest Block 1's 22 forms). All three prior workflow standards continue:
- Pre-emptive schema discovery (Block 3 onwards)
- Referential integrity gate (Block 5 onwards)
- Forbidden field check (Block 4 onwards)

This Block now adds:
- Family-stub-check (Block 9 onwards)

This Block's 10-spatial-behavior single-family addition is the largest multi-spatial-behavior single-family canonical authoring in the project to date (prior largest: Block 1's 8 spatial behaviors with substantial drafting recovery; Block 7's 4 spatial behaviors with schema-verified drafting). Block 9 attempts 10 spatial behaviors with schema-verified drafting from the start.

**Document quality detection note.** The first uploaded version of industrial_professional_forms_revised.docx (industial-Professional_Forms_-_Expanded.docx) used templated prose damaging the document's diagnostic value — same pattern observed in the first version of Entry/Support Forms back in Block 1. Mike's re-authored document (industrial_professional_forms_revised.docx) replaced templated content with substantive form-specific content. This is the second instance of the templated-prose damage pattern; future family-authoring workflows should include explicit document-quality validation pass before architectural decisions or drafting proceeds. Going forward, the document-quality validation step is established as a standard part of family-authoring workflow.

**Final architectural state after this PR merges:**
- 154 canonical forms total (125 + 29 from Industrial/Professional)
- ~749 canonical subtypes (627 + 122 from Industrial/Professional)
- 64 spatial behaviors (54 + 10 new from Industrial/Professional)
- 12 family entries (unchanged — in-place stub update rather than addition; family was already in baseline)
- 13 anti_classification_guidance populations (unchanged — no new populations in this Block)
- 10 families with canonical content on main: Desks (complete, 55 forms), Bedroom, Dining, General Storage, Seating, Tables, Entry/Support Forms, Baskets, Lighting, Industrial/Professional (newly added)

This completes 4 of 7 DACUM families with canonical content (counting Industrial/Professional). 2 DACUM families remain for future sessions: Clock Cases (3 forms / 3 form groupings; family_clock_cases likely exists as stub, to be verified) and Musical and Mechanical Furniture (12 forms / 6 form groupings; family_musical_mechanical likely exists as stub, to be verified).

---

## Phase 2 Session 8 Block 11: Pie Safe Reconciliation

**Architectural correction summary.** Post-Block-9 investigation surfaced a taxonomic conflict between two parallel `pie_safe` representations in `lib/constraints/forms.ts`: (1) `form_pie_safe` existed as a Session-3 retrofit stub assigned to `family_general_storage_specialty` / `spatial_utility_storage` with no substantive content beyond identity + dates + authority — the Session 2 substantive content for this form was discussed during authoring but never landed in the file; (2) Block 9 (yesterday) added `subtype_kitchen_utility_unit_pie_safe` under `form_kitchen_utility_unit` assigned to `family_industrial_professional` / `spatial_kitchen_and_utility_workstations`. Same conceptual identity, different families, different spatial behaviors — a taxonomic conflict that needed reconciliation before further work proceeded.

**Investigation result.** The Block 9 subtype was a misclassification. Industrial/Professional family was scoped Block 9 to workplace, commercial, and institutional contexts (manufactory benches, professional kitchen units, retail kiosks, library carrels, etc.). Pie safe is fundamentally a domestic kitchen storage form — a pre-refrigeration household furniture type for storing cooked foods, baked goods, and perishables in the home. Domestic kitchen storage belongs in General Storage, not Industrial/Professional. The Session 2 intent (substantive `form_pie_safe` at General Storage / utility_storage) was the architecturally correct decision; the Block 9 retrofit subtype was added without the form-stub-check that would have surfaced the existing `form_pie_safe` identity.

**Resolution (Option B).** Author standalone `form_pie_safe` canonically at General Storage / utility_storage with substantive content; remove the Block 9 subtype from `form_kitchen_utility_unit`; update `form_kitchen_utility_unit`'s cross-references (cousin_form_contrasts, common_aliases, regional_period_notes) to remove pie-safe references.

**Locked decisions D-PS1 through D-PS7:**
- **D-PS1.** Standalone `form_pie_safe` at General Storage / spatial_utility_storage is the correct architectural home. Pie safe is domestic, not industrial. Block 9 subtype is removed.
- **D-PS2.** Date envelope widened from 1820-1880 (stub baseline) to **1750-1900** per appraiser knowledge. Primary diagnostic production c. 1820-1880 documented in `regional_period_notes`. Production effectively ceased c. 1900-1920 with indoor refrigeration adoption — this is the `anti_classification_guidance` boundary.
- **D-PS3.** Three regional subtypes authored: `subtype_pie_safe_pennsylvania_german`, `subtype_pie_safe_southern_appalachian`, `subtype_pie_safe_midwest`. Panel-material variation (pierced tin, punched tin, wire screen, wooden lattice) stays prose-side in `distinguishing_features` and `regional_period_notes` rather than as separate subtypes, since multiple panel materials appear within each regional tradition.
- **D-PS4.** `anti_classification_guidance` populated with `boundary_date: 1920`, `boundary_type: "form_extinction"`, `prominence: "standard"`. Post-1920 examples warrant strong caution as revival/reproduction rather than period working pie safes — refrigeration eliminated the functional need for the form.
- **D-PS5.** Single `cousin_form_contrasts` entry vs. `form_jelly_cupboard` — these two pre-refrigeration domestic kitchen storage forms are commonly confused, but the ventilated-panel feature is the diagnostic. Other potential confusions (vs. cupboard, vs. case piece) are not strong enough to warrant cousin entries.
- **D-PS6.** Single PR scope — all operations in one feature branch, one commit, one audit entry. No multi-PR fragmentation.
- **D-PS7.** Append-only audit log discipline. Block 9's entry is **not** retroactively edited. Block 9's reported counts (~749 subtypes total, 122 in Industrial/Professional) reflect Block 9's state at that point; Block 11 explicitly documents the corrected post-reconciliation counts (~751 subtypes total, 121 in Industrial/Professional) and the workflow gap that allowed the misclassification.

**Final architectural state after this PR merges:**
- 154 canonical forms total (unchanged — `form_pie_safe` was already counted as a stub in baseline)
- ~751 canonical subtypes (Block 9's ~749 + 3 new pie safe regionals − 1 removed `subtype_kitchen_utility_unit_pie_safe` = 751 net; this corrects Block 9's reported count)
- 64 spatial behaviors (unchanged)
- 12 family entries (unchanged)
- **14** anti_classification_guidance populations (13 baseline + 1 new from `form_pie_safe` form_extinction boundary)
- 10 families with canonical content (unchanged)
- Industrial/Professional family: 121 subtypes (Block 9's 122 minus the removed pie safe subtype)

**Block 9 count correction note.** Block 9's audit entry reports ~749 subtypes total / 122 in Industrial/Professional. Per D-PS7 append-only discipline, Block 9's entry is not retroactively edited. The corrected post-Block-11 counts are documented here in this Block 11 entry: ~751 subtypes total / 121 in Industrial/Professional. Future audit entries should reference Block 11's counts as the architectural state of record.

**`form_pie_safe` canonical content authored (Op C in-place stub update):**
- `id`, `category`, `name`, `parent_category: "case_piece"`, `family_id: "family_general_storage_specialty"`, `spatial_behavior_id: "spatial_utility_storage"` preserved from stub
- `date_floor: 1750`, `date_ceiling: 1900` (widened from 1820-1880 per D-PS2)
- `distinguishing_features` (6 elements): ventilated panels (pierced tin / punched tin / fabric screen / pierced wood); vertical case-piece form on elevated base; functional storage interior with one-or-two shelves and one-or-two ventilated doors; plain utilitarian country construction in pine/poplar/yellow pine with painted finishes; panel-material variation documented prose-side; pre-refrigeration domestic kitchen storage context
- `subtypes` (3 regional per D-PS3): Pennsylvania German (elaborate punched-tin patterns, Pennsylvania/Maryland/Virginia/Ohio German settlement regions); Southern Appalachian (yellow pine, simpler patterns, Upland South); Midwest (mid-19th century westward migration, transitioning to wire screen by end of envelope)
- `cousin_form_contrasts` (1 per D-PS5): vs. `form_jelly_cupboard` (both pre-refrigeration domestic kitchen storage forms in plain country construction, ventilated panels diagnostic for pie safe)
- `common_aliases` (6 entries): Pie safe, Pie cupboard, Pie chest, Tin safe, Punched-tin safe, Meat safe (regional, especially Southern)
- `regional_period_notes`: full prose covering date envelope, refrigeration boundary, Pennsylvania German / Southern Appalachian / Midwest regional traditions, yellow-pine Southern indicator, plus explicit architectural note documenting Block 11 reconciliation (form is correctly authored at General Storage / spatial_utility_storage, not industrial despite kitchen-context use)
- `anti_classification_guidance` (per D-PS4): `boundary_date: 1920`, `boundary_type: "form_extinction"`, `prominence: "standard"`, guidance_text covering refrigeration-era extinction and post-1920 revival caution
- `positive_authority: 7`, `hard_negative_authority: 7`, `migration_status: "partial"` preserved from stub

**`form_kitchen_utility_unit` changes (Op D 4 sub-edits):**
- `subtypes`: 4 → 3. Removed `subtype_kitchen_utility_unit_pie_safe`. Preserved: Hoosier cabinet, baker's cabinet, kitchen island.
- `cousin_form_contrasts`: 5 → 4. Removed "Pie safe vs. Hoosier cabinet" entry. Preserved: utility unit vs. dry sink; utility unit vs. modern built-in cabinetry; Hoosier vs. baker; kitchen island vs. wall-anchored utility unit.
- `common_aliases`: 7 → 6. Removed "Pie safe" alias entry. Preserved: Kitchen utility unit, Hoosier cabinet, Baker's cabinet, Kitchen island, Kitchen workstation, Free-standing kitchen cabinet. (Rationale per D-PS1 follow-on: pie safe is domestic, so it should not be a discoverable alias for the industrial `form_kitchen_utility_unit`.)
- `regional_period_notes`: phrase `c. 1850-1920 for pie safes and early baker's cabinets` updated to `c. 1850-1920 for early baker's cabinets`; phrase `pine and oak country pie safes in 18th-19th century rural kitchens` removed from the prose. Surrounding regional-period content otherwise preserved verbatim.

**Workflow refinement — form-stub-check standard (NEW, established Block 11).** The Block 9 misclassification was directly caused by absence of a form-level stub-check during Block 9's subtype authoring. The family-stub-check standard established in Block 9 covers family-level identity collisions, but does not cover form-level or subtype-level conceptual-identity collisions. Block 11 establishes the form-stub-check standard:

> **Form-stub-check (Block 11 onwards).** Before authoring any new form or subtype, grep `lib/constraints/forms.ts` for matching conceptual identity using both `form_<name>` and `"<name>"` (the human-readable name in quotes). If any orphan stub or pre-existing form is found with the same conceptual identity, surface to the user for an architectural-correctness decision before any authoring proceeds. This prevents both (a) duplicate-identity authoring (Block 11's case) and (b) silent-overwriting of pre-existing canonical content.

Workflow standards as of Block 11 (5 total):
1. Pre-emptive schema discovery (Block 3 onwards)
2. Forbidden field check (Block 4 onwards)
3. Referential integrity gate (Block 5 onwards)
4. Family-stub-check (Block 9 onwards)
5. **Form-stub-check (Block 11 onwards, NEW)**

**Path A schema reconciliation note.** Session 2's substantive `form_pie_safe` content was discussed during authoring but never landed in the file — only the stub was retrofitted in Session 3. Block 11's Op C in-place authoring effectively folds the Session 2 intent into the canonical record. No Session 2 source document needed to be re-imported; the substantive content was re-authored from current appraiser knowledge (which is more accurate than the 2024 Session 2 discussion in any case) per locked decisions D-PS1 through D-PS5.

**Cross-form overlaps after Block 11:**
- `form_pie_safe` ↔ `form_jelly_cupboard`: preserved as `cousin_form_contrasts` entry on `form_pie_safe` (per D-PS5).
- `form_pie_safe` ↔ Block 9 subtype: **RESOLVED.** Block 9 subtype removed entirely; no remaining cross-reference between `form_pie_safe` and `form_kitchen_utility_unit`.

**Pre-flight check for remaining DACUM families.** Both family-stub-check (Block 9 standard) and form-stub-check (Block 11 standard) apply prospectively to the remaining DACUM families slated for canonical authoring: Clock Cases (3 forms / 3 form groupings) and Musical and Mechanical Furniture (12 forms / 6 form groupings). For each form and subtype to be authored, grep both `family_<name>` and `form_<name>` (plus `"<human-readable-name>"`) across families.ts, forms.ts, and spatialBehaviors.ts before authoring, and surface any pre-existing stubs or canonical entries for architectural-correctness decision before drafting proceeds.

---

### 2026-05-11 — Session 8 Block 13 — Clock Cases canonical authoring (3 forms, 11 subtypes, 3 new spatial behaviors, in-place stub update of family_clock_cases) — fifth non-Desks family canonical authoring batch

**Bundle architectural decisions (locked from prior sessions):** Clock Cases is the fifth non-Desks family canonical authoring batch (Entry/Support Forms = PR #5 8a40b26, Baskets = PR #6 28582aa, Lighting = PR #8 44c0629, Industrial/Professional = PR #9 10ea34a, Pie Safe Reconciliation = PR #10 e0411d5, Clock Cases = this Block). Shipped via PR-based workflow per Session 7/8 establishment. Mike's authored content (Clock_Case_Forms_Expanded.docx, 2026-05-11) drives canonical content with substantive form-specific content per form/subform from initial upload; no templated-prose damage detection required. Path A schema reconciliation pattern uniform with all prior batches.

**Authoring scope.** 3 canonical forms across 3 form groupings, supported by 3 new spatial behaviors (one per form grouping) and 1 in-place update of an existing family stub entry (family_clock_cases):
- Floor-Standing Clocks (1 form, 3 subtypes): form_tall_case_clock (grandfather, grandmother, granddaughter)
- Wall-Mounted Clocks (1 form, 5 subtypes): form_wall_clock (banjo, gallery, regulator, schoolhouse, calendar)
- Surface-Set Clocks (1 form, 3 subtypes): form_shelf_clock (mantel, tambour, novelty)

**Subtype inventory by form:** 3+5+3 = 11 subtypes total.

**Architectural decisions:**

D-CC1 (locked): family_clock_cases uses construction_logic_id "construction_mechanical_integrated" per CL IV definition fit. Clock cases genuinely embody the construction logic IV principle — the mechanism (clock movement) is the form's defining purpose; without the movement, a tall case clock is not a tall case clock. This is the cleanest fit of any family to CL IV's intended scope. Where Industrial/Professional (Block 9), Lighting (Block 7), Baskets (Block 3), and Entry/Support Forms (Block 1) used construction_mechanical_integrated as the catch-all assignment (smallest semantic stretch when no other logic fit cleanly), Clock Cases represents the canonical case for which the construction logic was originally designed. The four-logic ordinal taxonomy (case, frame, surface, mechanical_integrated) remains closed-by-design (Block 3 decision); Clock Cases anchors CL IV at its center rather than its periphery.

D-CC2 (locked): 3 spatial behaviors named per form grouping (one per grouping, parallel to Block 7's D-L2 and Block 9's D-IP2 patterns):
- spatial_floor_standing_clocks: floor-standing horological behavior for tall case clocks with full-height freestanding cabinet construction
- spatial_wall_mounted_clocks: wall-mounted horological behavior with rear hanging systems and compact body construction
- spatial_surface_set_clocks: surface-set horological behavior for mantel, shelf, table, or case-furniture-top placement

D-CC3 (locked): Cross-form distinction between form_tall_case_clock (horological clock case, family_clock_cases) and form_time_clock_station (workplace timekeeping fixture, family_industrial_professional from Block 9) left implicit. Different families and different spatial behaviors carry the architectural distinction; no cousin_form_contrasts entry needed. Future engine reasoning will distinguish horological clock cases from workplace timekeeping fixtures via family and spatial behavior membership rather than explicit cross-family cousin contrast.

D-CC4 (locked): No standalone anti_classification_guidance populations. All forms have continuous production from emergence through present. Subform date ranges (banjo clock c. 1790-1810 Federal-era emergence, tambour clock c. 1900-1940 peak, grandfather clock c. 1880-1930 peak, regulator clock c. 1870-1930 peak, etc.) handled prose-side in distinguishing_attributes and regional_period_notes per Block 1/7/9 precedent. anti_classification_guidance count remains 14 (unchanged from Block 11 endpoint).

**Cross-form overlaps documented in canonical content:**

1. form_tall_case_clock ↔ form_wall_clock ↔ form_shelf_clock (three-way cousin contrast within family_clock_cases): floor-standing vs. wall-mounted vs. surface-set placement. All three forms in same family with distinct spatial behaviors. Documented in cousin_form_contrasts on each form.

2. form_tall_case_clock ↔ form_time_clock_station (Block 9 Industrial/Professional): per D-CC3 locked, left implicit via different families and spatial behaviors. No explicit cousin_form_contrasts entry. Horological clock case vs. workplace punch-clock fixture are conceptually distinct enough that the family-context distinction suffices.

3. Subform-level cross-references documented in subform prose:
- banjo clock ↔ regulator clock: both wall-mounted, banjo decorative Federal-era styling vs. regulator precision-oriented elongated case
- gallery clock ↔ schoolhouse clock: both institutional wall clocks, gallery circular vs. schoolhouse rounded-with-drop
- mantel clock ↔ tambour clock: mantel broader category, tambour specifically curved silhouette
- grandfather ↔ grandmother ↔ granddaughter clocks: tall case clock subforms in descending size order

**Path A schema reconciliation applied (parallel to all prior batches):** Mike's Clock_Case_Forms_Expanded.docx Unique Characteristics, Identifying Elements, Regional Attributes, Emergence and Conclusion Dates, and Cousin Forms + Identifying Contrasts prose folded into canonical schema fields (distinguishing_features, dimensional_thresholds with width/height/depth/weight, cousin_form_contrasts, common_aliases, regional_period_notes). Each subform's authored prose converted to single-element distinguishing_attributes array. Form names lowercased per existing canonical convention; proper nouns preserved (Federal, Colonial Revival, Pennsylvania German, Victorian, Art Deco, Connecticut, New England, Boston, Lancaster County, Eli Terry, Simon Willard, Seth Thomas, Ansonia, Waterbury, New Haven, Gilbert, Ingraham, Ithaca Calendar Clock Co., Welch in regional_period_notes prose). Schema-correct shape verified before drafting against SpatialBehaviorEntry, FamilyEntry, and FormEntry interfaces (Block 3 pattern; Blocks 7/9/11 validated zero-recovery; Block 13 maintains the standard).

**Family-stub-check applied (Block 9 standard, B9):** Op A-3 verified family_clock_cases exists as pre-existing stub from original 10-family baseline at families.ts:204-218. Op C revised from append to in-place update preserving family_characteristics array and authority/migration_status fields, expanding description to Block 1/3/7/9/11 family entry richness, preserving construction_logic_id at "construction_mechanical_integrated" (already correct in stub). Family count remains 12 (unchanged — in-place update, not addition).

**Form-stub-check applied (Block 11 standard, B11):** Op A-4 verified no pre-existing form stubs or conceptual identity collisions for form_tall_case_clock, form_wall_clock, form_shelf_clock, or their 11 subforms across all four placement axes (subtypes/cousin_form_contrasts/regional_period_notes/common_aliases). 19 grep checks across the three new form identities plus subform conceptual identities (grandfather, grandmother, granddaughter, longcase, banjo, regulator, schoolhouse, gallery, calendar, mantel, tambour, novelty, bracket, cottage, parlor clock) all returned 0. No reconciliation needed; all three forms and 11 subtypes are net-new additions.

**Fifth non-Desks family canonical authoring milestone.** Clock Cases is the fifth family added to the canonical taxonomy outside Desks. Smallest of the five non-Desks families in scope (3 forms vs. Industrial/Professional's 29, Entry/Support's 22, Lighting's 6, Baskets' 1). All five prior workflow standards continue:
1. Pre-emptive schema discovery (Block 3 onwards)
2. Forbidden field check (Block 4 onwards)
3. Referential integrity gate (Block 5 onwards)
4. Family-stub-check (Block 9 onwards)
5. Form-stub-check (Block 11 onwards)

Zero recovery rounds during drafting; document quality validation pass; schema-verified drafting from the start — the workflow has reached steady state.

**Final architectural state after this PR merges:**
- 157 canonical forms total (154 + 3 from Clock Cases)
- ~762 canonical subtypes (751 + 11 from Clock Cases)
- 67 spatial behaviors (64 + 3 new from Clock Cases)
- 12 family entries (unchanged — in-place stub update rather than addition; family was already in baseline)
- 14 anti_classification_guidance populations (unchanged — no new populations in this Block)
- 11 families with canonical content on main: Desks (complete, 55 forms), Bedroom, Dining, General Storage, Seating, Tables, Entry/Support Forms, Baskets, Lighting, Industrial/Professional, Clock Cases (newly added)

This completes 5 of 7 DACUM non-Desks families with canonical content. 1 DACUM family remains for future sessions: Musical and Mechanical Furniture (12 forms / 6 form groupings; family_musical_mechanical likely exists as stub, to be verified via family-stub-check; form_pump_organ_cabinet expected to be pre-existing canonical from Sessions 2-5 work, expected to be preserved in-place during Musical/Mechanical's Block per Block 11 Pie Safe Reconciliation precedent).

---

### 2026-05-11 — Session 8 Block 15 — Musical and Mechanical Furniture canonical authoring (12 forms, ~40 subtypes, 9 new spatial behaviors, in-place family stub update, completion of partial form_pump_organ_cabinet migration) — sixth and final non-Desks family, completing DACUM Phase 3 milestone

**Bundle architectural decisions (locked from prior sessions):** Musical and Mechanical Furniture is the sixth and final non-Desks family canonical authoring batch and the final DACUM Phase 3 family (Entry/Support Forms = PR #5 8a40b26, Baskets = PR #6 28582aa, Lighting = PR #8 44c0629, Industrial/Professional = PR #9 10ea34a, Pie Safe Reconciliation = PR #10 e0411d5, Clock Cases = PR #11 bd6e9d7, Musical/Mechanical = this Block). Shipped via PR-based workflow per Session 7/8 establishment. Mike's authored content (Musical_and_Mechanical_Forms_Expanded.docx, 2026-05-11) drives canonical content with substantive form-specific content per form/subform from initial upload. Path A schema reconciliation pattern uniform with all prior batches.

**DACUM Phase 3 completion milestone.** With this Block, all 7 DACUM non-Desks families have canonical content (Entry/Support Forms, Baskets, Lighting, Industrial/Professional, Clock Cases, Musical/Mechanical Furniture) plus Desks (complete from Session 6) plus 5 Sessions-2-5 families with canonical content (Bedroom, Dining, General Storage, Seating, Tables). The constraint library now spans 11 of 12 families with canonical content. The DACUM-scoped canonical authoring milestone is achieved with this commit.

**Authoring scope.** 12 canonical forms across 9 form groupings, supported by 9 new spatial behaviors (one per form grouping) and 1 in-place update of an existing family stub entry (family_musical_mechanical). 1 in-place completion of a partial migration of pre-existing canonical form_pump_organ_cabinet (Op A-5 discovery: family_id already correct from a prior session, but spatial_behavior_id field absent — Op E-1 inserts it). 2 new anti_classification_guidance field populations (D-MM3).

**Forms in scope (12 forms, ~40 subtypes):**
- Audio/Video Equipment Housings (1 form, 5 subtypes): form_media_console (radio, television, stereo, record_player, hi_fi consoles)
- Coin-Operated Entertainment (3 forms, 7 subtypes): form_jukebox (wall, floor), form_arcade_cabinet (upright, cocktail, driving), form_pinball_machine (electro_mechanical, solid_state)
- Mechanical Craft Tools (2 forms, 5 subtypes): form_loom (floor, table), form_spinning_wheel (saxony, castle, great)
- Musical Instrument Cabinets (1 form, 7 subtypes): form_musical_instrument_furniture (reed_organ, pipe_organ, upright_piano, grand_piano, square_piano, pianola, player_piano) — EXCLUDES pump_organ per D-MM4
- Media Storage (1 form, 4 subtypes): form_media_storage_unit (media_tower, cd_tower, dvd_tower, game_tower)
- Integrated Entertainment Systems (1 form, 2 subtypes): form_media_wall (home_theater_unit, entertainment_wall)
- Equipment Support Systems (1 form, 3 subtypes): form_equipment_rack (audio_rack, server_rack, speaker_cabinet)
- Interactive Systems (1 form, 3 subtypes): form_interactive_console (vr_station, gaming_tower, digital_interface_console)
- Automated Dispensing Systems (1 form, 3 subtypes): form_vending_machine (snack, beverage, cigarette)

**Architectural decisions:**

D-MM1 (locked): family_musical_mechanical uses construction_logic_id "construction_mechanical_integrated". All 12 new forms in family use this construction logic. Mechanism is the unifying axis. Where Clock Cases (Block 13) anchors CL IV at its center for horological forms specifically, Musical and Mechanical Furniture anchors CL IV broadly across all non-horological mechanical-integrated furniture forms.

D-MM2 (locked): 9 spatial behaviors per form grouping (one per grouping, parallel to Block 7/9/13 patterns). Total spatial behavior count post-Block-15: 76 (67 baseline + 9 new).

D-MM3 (locked): 3 form-level anti_classification_guidance applications:
- form_arcade_cabinet: form_emergence at 1970, prominence "standard"
- form_interactive_console: form_emergence at 1970, prominence "standard"
- form_vending_machine: no form-level boundary; subtype_vending_machine_cigarette_machine carries form_extinction prose c. 1990s-2000s (Synar Amendment 1992) handled prose-side per Block 9/13 precedent

Net anti_classification_guidance field populations: 12 baseline + 2 new = 14 (counted at the 4-space-indent field-declaration line). Note on counting conventions: loose `grep -c 'anti_classification_guidance' forms.ts` returns 17 post-Block-15 — 14 field populations + 1 JSDoc comment + 1 type signature in interface + 1 prose mention in form_musical_instrument_furniture's cousin_form_contrasts (which references pump organ's existing anti_classification_guidance as documentation). Block 11 audit and Block 13 audit reported anti_classification_guidance count using loose grep (which historically returned 14 = 12 fields + 1 comment + 1 type def). Block 15 introduces one new prose-reference mention. Architectural truth: 2 new field populations added per D-MM3.

D-MM4 (locked): Preserve form_pump_organ_cabinet standalone. Exclude pump_organ from form_musical_instrument_furniture's subtypes list. Sibling-form relationship documented in form_musical_instrument_furniture's cousin_form_contrasts.

D-MM4a (amended per Op A-5 discovery): Complete the partial migration of form_pump_organ_cabinet by adding spatial_behavior_id field (insertion-only). Op A-5 surfaced that form_pump_organ_cabinet's family_id was already "family_musical_mechanical" (presumably migrated in a prior session that did not complete the spatial_behavior_id population); only the spatial_behavior_id needed to be added. Op E-1 was reduced from a 2-line swap (as originally drafted) to a single-line insertion adding `spatial_behavior_id: "spatial_musical_instrument_cabinets"` after the existing family_id line. All other fields preserved unchanged: distinguishing_features (7 elements), subtypes (absent), cousin_form_contrasts (2 entries vs upright piano and pipe organ), dimensional_thresholds, regional_period_notes (Estey/Mason & Hamlin/Story & Clark/Kimball regional traditions), anti_classification_guidance (form_emergence at 1870, prominence standard — already counted in pre-Block-15 baseline), common_conversion_targets, common_aliases (absent), positive_authority=7, hard_negative_authority=7, migration_status="partial". This is parallel to the Block 11 Pie Safe Reconciliation pattern but applied to a partially-migrated state rather than a stub-vs-subtype conflict.

**Cross-form overlaps documented in canonical content:**

1. form_pump_organ_cabinet (re-homed completion at family_musical_mechanical / spatial_musical_instrument_cabinets) ↔ form_musical_instrument_furniture (sibling form, subtype pump_organ explicitly excluded per D-MM4).
2. form_arcade_cabinet ↔ form_pinball_machine ↔ form_jukebox (three coin-operated entertainment forms in same spatial_coin_operated_entertainment).
3. form_media_console ↔ form_media_wall (entertainment furnishings distinguished by scale).
4. form_media_storage_unit ↔ form_equipment_rack (storage vs equipment).
5. form_interactive_console ↔ form_arcade_cabinet (personal/institutional vs commercial coin-operated).
6. form_vending_machine ↔ form_kiosk (automated dispensing vs attended interaction).
7. Cigarette vending regulatory-decline narrative at subtype level (not form-level anti_classification_guidance per D-MM3).

**Path A schema reconciliation applied (parallel to all prior batches):** Mike's Musical_and_Mechanical_Forms_Expanded.docx prose folded into canonical schema fields (distinguishing_features, dimensional_thresholds, cousin_form_contrasts, common_aliases, regional_period_notes). Each subform's authored prose converted to single-element distinguishing_attributes array. Form names lowercased per existing canonical convention; proper nouns preserved (Federal, Empire, Pennsylvania German, Victorian, Art Deco, plus extensive manufacturer attributions: Philco, Zenith, RCA, Crosley, Wurlitzer, Seeburg, Rock-Ola, AMI, Bally, Williams, Gottlieb, Chicago Coin, Stern, Atari, Steinway, Knabe, Chickering, Mason & Hamlin, Baldwin, Aeolian, Welte-Mignon, Duo-Art, Ampico, Acoustic Research, Bose, JBL, Klipsch, Advent, KEF, Marantz, McIntosh, Pioneer, Sansui, Kenwood, Vendo, Cavalier, Westinghouse, Rowe International, Estey, Story & Clark, Kimball). Schema-correct shape verified before drafting against SpatialBehaviorEntry, FamilyEntry, and FormEntry interfaces.

**Family-stub-check applied (Block 9 standard, B9):** Op A-3 verified family_musical_mechanical exists as pre-existing stub at families.ts:169-184. Op C in-place update preserved family_characteristics array (3 elements verbatim) and authority/migration_status fields, expanded description to Block 1/3/7/9/11/13 family entry richness, preserving construction_logic_id at "construction_mechanical_integrated" (already correct in stub). Family count remains 12.

**Form-stub-check applied (Block 11 standard, B11):** Op A-4 verified no pre-existing form stubs or conceptual identity collisions for the 12 new forms or ~40 new subforms across all four placement axes. Sole pre-existing canonical surfaced: form_pump_organ_cabinet (Sessions 2-5 authored content) — and surfaced an unexpected partial-migration state (family_id already correct, spatial_behavior_id absent). Per D-MM4 + D-MM4a, form_pump_organ_cabinet preserved standalone with all canonical content intact, and the missing spatial_behavior_id added via Op E-1 single-line insertion. form_kiosk presence (Block 9) confirmed for safe form_vending_machine cousin_form_contrasts reference.

**Second Pie-Safe-pattern reconciliation in the project.** Block 11 surfaced the original Pie-Safe pattern (form_pie_safe stub in General Storage + subtype_kitchen_utility_unit_pie_safe in Industrial/Professional → resolved via standalone form_pie_safe canonical authoring at General Storage with Block 9 subtype removal). Block 15 surfaces a parallel but more nuanced pattern: form_pump_organ_cabinet pre-existing fully-canonical at family_musical_mechanical (partially migrated in a prior session) + form_musical_instrument_furniture authoring at Musical/Mechanical with pump_organ initially planned as a subtype → resolved via in-place spatial_behavior_id completion of form_pump_organ_cabinet AND exclusion of pump_organ from form_musical_instrument_furniture subtypes. The form-stub-check workflow standard (Block 11 onwards) surfaced both patterns pre-emptively during Op A rather than allowing them to ship and require post-merge reconciliation.

**Sixth and final non-Desks family canonical authoring milestone.** Musical/Mechanical is the largest non-Desks family in scope by form count (12 forms vs Industrial/Professional's 29, Entry/Support's 22, Lighting's 6, Baskets' 1, Clock Cases' 3 — wait, Industrial/Professional's 29 is larger; Musical/Mechanical is second-largest by form count). All five prior workflow standards continue:
1. Pre-emptive schema discovery (Block 3 onwards)
2. Forbidden field check (Block 4 onwards)
3. Referential integrity gate (Block 5 onwards)
4. Family-stub-check (Block 9 onwards)
5. Form-stub-check (Block 11 onwards)

Zero recovery rounds during drafting; schema-verified drafting from the start; form-stub-check surfaced form_pump_organ_cabinet preservation requirement and partial-migration state pre-emptively.

**Counting-convention note (from Block 13).** Raw `grep -c 'id: "form_'` on forms.ts returns higher counts than canonical forms due to pre-existing non-canonical stubs. Audit log baselines track canonical forms only. Post-Block-15 canonical count is 169 (157 baseline + 12 new). form_pump_organ_cabinet's spatial_behavior_id completion does not change the canonical count (already counted in 157 baseline; in-place field addition only).

**Final architectural state after this PR merges:**
- 169 canonical forms total (157 + 12 from Musical/Mechanical)
- ~802 canonical subtypes (~762 + ~40 from Musical/Mechanical)
- 76 spatial behaviors (67 + 9 new from Musical/Mechanical)
- 12 family entries (unchanged — in-place stub update rather than addition)
- 14 anti_classification_guidance field populations (12 + 2 new: form_arcade_cabinet, form_interactive_console) — note: loose grep returns 17 (= 14 fields + 1 JSDoc + 1 type def + 1 prose mention)
- 11 families with canonical content on main: Desks (complete, 55 forms), Bedroom, Dining, General Storage, Seating, Tables, Entry/Support Forms, Baskets, Lighting, Industrial/Professional, Clock Cases, Musical and Mechanical Furniture (newly added)

**DACUM Phase 3 milestone complete.** All 7 non-Desks DACUM families have canonical content. Desks family complete from Session 6 (55 forms). Bedroom, Dining, General Storage, Seating, Tables families have canonical content from Sessions 2-5. The constraint library's DACUM-scoped canonical authoring milestone is achieved with this commit.

---

### 2026-05-11 — Session 9 Block 16 — Wood Identification Schema Foundation (woodIdentification.ts + AntiClassificationGuidance refactor to entryShape.ts)

**Bundle scope.** Pure schema foundation for the wood identification reference library; no content authoring. AntiClassificationGuidance interface refactored from forms.ts to entryShape.ts to enable shared use across forms and the new wood domain.

**Architectural decisions (locked).** D-WI1: Two-library wood architecture — woodIdentification.ts (period-agnostic) paired with woodEvidence.ts (period/region-relevant, deferred to Block 22). Applies form-vs-style separation principle to the wood domain. D-WI2: Three-array structure in woodIdentification.ts — NATURAL_WOOD_SPECIES with nested WoodSubspecies, ENGINEERED_SUBSTRATES, CUT_GRAIN_PHENOMENA, plus a fourth WOOD_CATEGORIES array providing the taxonomic top level. D-WI3: File B Category V dissolved as mixed bucket — natural members (basswood, aspen, cottonwood, sweetgum) rejoin Category II diffuse-porous at content authoring; engineered members (plywood, particleboard, MDF, hardboard, composite cores, veneer substrates) move to ENGINEERED_SUBSTRATES. D-WI4: Two-level hierarchy for natural species (category → species, with subspecies nested as form metadata pattern). No spatial-behavior analog; wood has no natural intermediate level. D-WI5: EngineeredSubstrateEntry carries structured introduction_anchor (earliest_plausible_year, widespread_adoption_year, optional dominance_year, optional confidence_notes) rather than single date_floor — substrate dating is technology-introduction-curve rather than production-envelope shaped. D-WI6: CutGrainPhenomenonEntry carries one-way applicable_species references with object array (species_id + optional characteristic_expression) capturing species-specific identifier text. Cousin_phenomenon_contrasts field mirrors cousin_form_contrasts pattern from forms.ts. D-WI7: typical_structural_role enum on species (primary_show, primary_secondary, either, veneer_only, substrate_only) and substrates (substrate_only, either, veneer_substrate). The meta-rule "visible wood ≠ structural wood; secondary woods often more diagnostic" will read this field at engine time once weighting integration occurs. D-WI8: anti_classification_guidance? optional field added to both WoodSpeciesEntry and EngineeredSubstrateEntry, reusing the existing AntiClassificationGuidance interface. Substrate boundary semantics encoded as both structured years (introduction_anchor for engine filter logic) and narrative guidance (anti_classification_guidance for appraiser-voice reasoning chain). Same dual-encoding rationale as period_label + date_floor/ceiling pattern in the evidence library. D-WI9: AntiClassificationGuidance interface moved from forms.ts to entryShape.ts to enable shared use without creating an import-direction problem between forms.ts and woodIdentification.ts. The interface was always shared infrastructure; relocation reflects that. forms.ts FormEntry interface unchanged in shape — only its import line updated. D-WI10: AntiClassificationGuidance boundary_type union retained as "form_emergence" | "form_extinction" in this block. The semantics extend reasonably to substrate adoption and species furniture-use extinction without renaming. Future content blocks may surface need for substrate-specific or species-specific variants; schema migration deferred to that point per 3+ schema-occurrence rule.

**Authority weight calibration (preliminary).** WoodCategoryEntry: 8 (taxonomic-level, parallels family/construction logic). WoodSpeciesEntry: 7 (form-level analog). EngineeredSubstrateEntry: 8 (substrate introduction is mechanical technology constraint). CutGrainPhenomenonEntry: 7 (identification work; dating implications route through evidence library). All weights subject to pre-integration weighting calibration review backlog item.

**Workflow standards applied.** Pre-emptive schema discovery: investigation completed before drafting; CanonicalEntry, FormEntry, FamilyEntry, SpatialBehaviorEntry interfaces all verified verbatim before drafting wood schemas. Forbidden field check: N/A (new file). Referential integrity gate: N/A in this block (no FK populations; substrate→species FKs and cut/grain→species FKs only populated during content blocks). Family-stub-check, form-stub-check: N/A (no families or forms touched).

**Block-level naming convention note.** Op A-1 through A-5 numbering scheme from DACUM Phase 3 form blocks is form-specific and does not transfer literally to wood blocks. The five workflow standards themselves do transfer; their application points within wood-domain block plans are described per-block rather than via Op-A numbering. Formal workflow documentation deferred to a future block.

**Backlog item captured.** Weighting calibration review (pre-integration): audit all per-entry authority weights across forms, families, spatial behaviors, wood identification, wood evidence, and downstream libraries before the weighting file revamp begins. Sharper-grained version of original Synthesis Section 10.6 — splits reconciliation as architectural decision separate from mechanical engine wiring.

**Field-population reminders for future content blocks.** CanonicalEntry has 11 fields total, not the 7 documented in Synthesis Section 4.3. Wood content authoring should populate `indicator_text` (appraiser-voice prose for narrative composition) where it adds value, alongside the wood-specific fields. `replacement_risk` and `hard_negative` populated per case; `notes` for authoring annotations. `migration_status` defaults to "complete" for fully-authored wood entries, "partial" if shipping with content gaps, "needs_review" if Mike flags during authoring.

**Pre-existing state captured.** 7 bare stubs exist in forms.ts (form_jelly_cupboard, form_china_cabinet, form_bookcase, form_rocking_chair, form_milking_stool, form_sewing_machine_cabinet, form_icebox) with minimal field sets and migration_status: "partial". These pre-date the Block 16 wood work. form_rocking_chair is the documented insertion anchor for new forms. Not in scope for Block 16; flagged for future cleanup work.

**makerMarks.ts anomaly captured.** makerMarks.ts uses `type` alias rather than `interface extends CanonicalEntry` pattern used by the four canonical files. Not in scope for Block 16. Mike has a replacement document for the maker marks seed file; convention alignment will occur when that replacement lands during Phase 2 Session 6 (synthesis Section 10.4).

---

### 2026-05-11 — Session 9 Block 22 (pre-authored schema decisions) — Wood Evidence Schema Lock

**Bundle scope.** Schema decisions for woodEvidence.ts, paired with the woodIdentification.ts schema landing in Block 16. No file changes in this block; entry preserves the decision lineage for future Block 22 implementation. IMPORTANT FRAMING: this entry documents schema decisions for woodEvidence.ts which is not implemented until Block 22. Decisions are captured here in Block 16 because they were made as a unified architectural conversation alongside the identification schema. Implementation deferred; documentation co-located with the conversation that produced it.

**Architectural decisions (locked).** D-WE1: woodEvidence.ts will export five arrays with five interfaces — SPECIES_EVIDENCE (WoodSpeciesEvidenceEntry), SUBSTRATE_EVIDENCE (SubstrateEvidenceEntry), CUT_GRAIN_EVIDENCE (CutGrainEvidenceEntry), WOOD_DIAGNOSTIC_SIGNALS (WoodDiagnosticSignalEntry), WOOD_EVIDENCE_REASONING_RULES (WoodEvidenceReasoningRule). D-WE2: Period associations carry both structured numerics (date_floor, date_ceiling) and human-authored period_label strings. Redundancy intentional — numerics for engine filtering, labels for authoring and report rendering. D-WE3: Regions captured as enum on WoodRegionalAssociation (new_england, mid_atlantic, southern, midwest, appalachian, west_coast), not as canonical entries. Schema migration to regions.ts deferred until region-keyed patterns warrant first-class status. D-WE4: Subspecies evidence handled by optional subspecies_id field on WoodSpeciesEvidenceEntry, not separate array. Authoring rule: subspecies-targeted evidence entries created only when subspecies-level patterns genuinely differ from parent species. D-WE5: WoodDiagnosticSignalEntry as first-class entry type for cross-cutting patterns combining species + substrate + cut/grain + period. Multi-FK references to involved identification entries. D-WE6: Typical secondary pairings as field on species evidence entry, not separate array. Manually authored on both sides of pairing; no auto-mirror schema. D-WE7: Revival waves folded into style_wave_associations string tags on period_associations. Tags become canonical FK references when styleFamilies.ts is authored (Phase 2 Session 9 per synthesis). D-WE8: WoodEvidenceReasoningRule carries migration_target field (weighting_file | engine_reasoning | report_layer) flagging eventual integration point per top-down revamp pattern. Initial rules: "wood alone never dates furniture" (weighting_file target), "secondary woods often more diagnostic than show wood" (weighting_file target).

**Authority weight calibration (preliminary).** WoodSpeciesEvidenceEntry: 6 (structurally encodes "wood alone never dates furniture" meta-rule at weight layer). SubstrateEvidenceEntry: 8 (technology-anchored adoption curves). CutGrainEvidenceEntry: 7 (composed cut+species patterns stronger than species alone). WoodDiagnosticSignalEntry: 7 (composed multi-axis patterns). WoodEvidenceReasoningRule: 9 (meta-rules condition all other weighting). Asymmetric 6-9 spread deliberate signal that evidence carries more weight variance than identification (7-8). All weights subject to pre-integration weighting calibration review.

**Source content disposition.** File A (General_Wood_use_in_furniture.docx) is primary source for SPECIES_EVIDENCE period_associations and regional_associations, SUBSTRATE_EVIDENCE adoption_curve content, WOOD_DIAGNOSTIC_SIGNALS table content, WOOD_EVIDENCE_REASONING_RULES. File B (Wood_identification_reference.docx) supplies period/regional fields stripped from identification entries during extraction; those fields migrate to corresponding SPECIES_EVIDENCE / CUT_GRAIN_EVIDENCE entries.

**Implementation deferred to Block 22.** Schema decisions locked in this conversation but no file changes in Block 16. Block 22 will implement the woodEvidence.ts schema foundation as its own PR, following the same scaffold-only pattern Block 16 uses for woodIdentification.ts.

---

### 2026-05-12 — Session 9 Block 17 — Wood Categories + cousin_category_contrasts schema addition

**Scope.** WOOD_CATEGORIES array populated with 4 canonical WoodCategoryEntry entries representing Categories I-IV from File B (Wood_identification_reference.docx). Block also closes a Block 16 design gap by adding optional cousin_category_contrasts field to WoodCategoryEntry interface. NATURAL_WOOD_SPECIES, ENGINEERED_SUBSTRATES, and CUT_GRAIN_PHENOMENA arrays remain empty per Block 16 landing state; species content lands Blocks 18-19, substrate content lands Block 20, cut/grain content lands Block 21.

**Architectural decisions (locked).**

D-WC0 (locked): WoodCategoryEntry interface extended with optional `cousin_category_contrasts?: string[]` field. Closes a Block 16 design gap relative to analogous fields `cousin_form_contrasts` (forms.ts FormEntry) and `cousin_phenomenon_contrasts` (woodIdentification.ts CutGrainPhenomenonEntry, D-WI6 in Block 16). The omission was surfaced during Op A-1 pre-emptive schema discovery for this Block; rather than drop the cousin-contrast content from the planned entries, the schema was patched within the same PR. Field added at category level only; analogous field at species level deferred pending File B species-content review during Blocks 18-19 when the cousin-contrast pattern at species level can be evaluated against actual data.

D-WC1 (locked): Four WoodCategoryEntry entries authored matching File B's four taxonomic categories at category-level depth. Species drill-downs reserved for Blocks 18-19.

D-WC2 (locked): Category-level entries omit anti_classification_guidance. Boundary semantics belong at species and substrate level where adoption curves and form-extinction dates apply; categories themselves do not carry temporal boundaries.

D-WC3 (locked): Authority weights set at 8/8 for all four categories. Categories are the taxonomic root of the wood identification library and carry high diagnostic authority when correctly applied, paralleling the 8/8 authority weights on construction logic entries in the form taxonomy.

D-WC4 (locked): cousin_category_contrasts populated bilaterally for Ring-Porous ↔ Diffuse-Porous (the most-confused pair). Other contrasts populated unidirectionally where natural: Softwoods cousin-contrasts both hardwood categories collectively; Tropical Hardwoods cousin-contrasts Diffuse-Porous specifically (since tropical hardwoods are technically diffuse-porous and that's where confusion occurs). Total cousin_category_contrasts populations: 5 strings across 4 entries (Ring-Porous: 1, Diffuse-Porous: 2, Softwoods: 1, Tropical: 1).

D-WC5 (locked): shared_identifying_traits and primary_diagnostic_indicators arrays distinguish "what this category IS" (traits) from "what to look for in the field" (diagnostic indicators), matching File B's structural framing. Both arrays populated for all four categories from File B canonical content. Trait array sizes: 9, 9, 10, 10. Diagnostic indicator array sizes: 7, 8, 9, 9.

**Workflow standards applied.** Pre-emptive schema discovery (B3): performed in Op A-1; surfaced the cousin_category_contrasts gap before content authoring, allowing in-PR schema patch via D-WC0 rather than silent content adaptation or post-merge follow-up. Forbidden field check (B4): N/A (no spatialBehaviors edits). Referential integrity gate (B5): N/A (no FK populations — category entries are the taxonomic root, no upward FK references). Family-stub-check (B9): N/A (no families touched). Form-stub-check (B11): N/A (no forms touched).

**Final architectural state after this PR merges:**
- 4 WoodCategoryEntry entries populated (was 0)
- WoodCategoryEntry interface gains optional cousin_category_contrasts field
- NATURAL_WOOD_SPECIES, ENGINEERED_SUBSTRATES, CUT_GRAIN_PHENOMENA arrays remain empty pending Blocks 18-21
- File count in lib/constraints/ unchanged at 10

---

### 2026-05-12 — Session 9 Block 18 — Natural Wood Species Batch 1 (Categories I & II) + species/subspecies schema additions

**Scope.** NATURAL_WOOD_SPECIES populated with 12 canonical WoodSpeciesEntry entries from File B Categories I (Ring-Porous Hardwoods) and II (Diffuse-Porous Hardwoods), plus 8 nested WoodSubspecies. Block also extends the species/subspecies schema with two new interfaces (PeriodAssociation, RegionalPattern) and four new fields (cousin_species_contrasts on WoodSpeciesEntry; period_associations and regional_patterns on both WoodSpeciesEntry and WoodSubspecies). ENGINEERED_SUBSTRATES and CUT_GRAIN_PHENOMENA arrays remain empty pending Blocks 20-21. Categories III (Softwoods) and IV (Tropical Hardwoods) species deferred to Block 19.

**Architectural decisions (locked).**

D-WS0a (locked): cousin_species_contrasts?: string[] added to WoodSpeciesEntry. Mirrors cousin_category_contrasts (Block 17 D-WC0), cousin_form_contrasts (forms.ts FormEntry), and cousin_phenomenon_contrasts (Block 16 D-WI6 on CutGrainPhenomenonEntry). Free-form prose strings using display names per forms.ts convention, not id references.

D-WS0b (locked): PeriodAssociation interface declared and added as required period_associations: PeriodAssociation[] on WoodSpeciesEntry. Implements the dual-encoding pattern from Block 16 D-WE2: structured numerics (date_floor, optional date_ceiling) for engine filter logic paired with human-authored period_label strings for authoring and report rendering. Distinct from woodEvidence.ts WoodRegionalAssociation: this lives in identification because File B's per-species period tables are diagnostic context for identification, not evidence-layer weighting. Required because every File B species carries a Common Time Periods table.

D-WS0c (locked): RegionalPattern interface declared and added as optional regional_patterns?: RegionalPattern[] on WoodSpeciesEntry. Same dual-encoding rationale. Free-form region strings (rather than closed enum) because File B regional headers vary in granularity (state-level, multi-state, factory-center named) and the identification layer does not need the closed-enum filter semantics of the evidence layer. Optional because File B omits Regional Patterns sections for some species (e.g., sycamore).

D-WS0d (locked): WoodSubspecies extended with optional period_associations? and regional_patterns? fields, reusing the same interfaces as parent species. Subspecies leave both fields unpopulated when File B places period/regional content only at the parent species frame; populated when File B carries subspecies-distinct content. White Oak is the strongest case for populated subspecies-level data (Mission/Arts & Crafts–specific dominance band; Midwest/East Coast/California regional patterns); Red Oak is the second.

D-WS0e (locked): typical_structural_role enum locked per File B framing on the 12 species: oak_group, ash, elm, birch_group, beech_group → either; walnut_group, cherry_group, maple_group, mahogany_group, gumwood_group → primary_show; poplar_group → primary_secondary; sycamore_group → veneer_only. No schema change required (D-WI7's enum already in place from Block 16). Note on sycamore_group → veneer_only: classification reflects both File B's veneer-dominant framing and the project owner's appraiser-experience observation (decades of practice, ~2000 pieces restored, zero solid sycamore furniture); recoverable in a future block if solid-sycamore observation surfaces.

D-WS0f (locked): PeriodAssociation.date_ceiling is optional. Omitted date_ceiling means the period extends to present. Durable convention that does not drift across audit-log generations; replaces sentinel-year approaches (e.g., 2026) which would require updating with each annual transition. Applied in Block 18 to Cherry Group (1950–present), Poplar Group (1800–present secondary wood dominance; 1900–present painted furniture).

D-WS1 (locked): 12 WoodSpeciesEntry entries authored. Category I — Ring-Porous Hardwoods (3 species): wood_species_oak_group, wood_species_ash, wood_species_elm. Category II — Diffuse-Porous Hardwoods (9 species): wood_species_walnut_group, wood_species_cherry_group, wood_species_maple_group, wood_species_mahogany_group, wood_species_birch_group, wood_species_beech_group, wood_species_poplar_group, wood_species_gumwood_group, wood_species_sycamore_group. Naming convention: species-genus-spanning entries use _group suffix (oak_group, walnut_group, etc.); single-species entries omit the suffix (ash, elm).

D-WS2 (locked): 8 WoodSubspecies entries nested per File B authoring. Under wood_species_oak_group: wood_subspecies_white_oak, wood_subspecies_red_oak. Under wood_species_walnut_group: wood_subspecies_black_walnut. Under wood_species_cherry_group: wood_subspecies_black_cherry. Under wood_species_maple_group: wood_subspecies_hard_maple_sugar_maple, wood_subspecies_soft_maple. Under wood_species_mahogany_group: wood_subspecies_honduran_mahogany, wood_subspecies_cuban_mahogany. Subspecies id pattern uses wood_subspecies_<snake> to parallel the wood_species_<snake> and wood_category_<snake> conventions. (The Block 16 schema comment on WoodSubspecies.id specifies "subspecies_<descriptor>" — a documentation/code mismatch retained for future cleanup; the prefixed pattern is the canonical convention going forward.)

D-WS3 (locked): 19 figure variants from File B species sections deferred to Block 21 CUT_GRAIN_PHENOMENA per Block 16 D-WI2 + D-WI6 architecture. D-WI2 establishes CUT_GRAIN_PHENOMENA as a separate top-level array; D-WI6 establishes CutGrainPhenomenonEntry.applicable_species FK back to species, so figure variants live as phenomena referencing species rather than as nested subspecies. Full deferred list: "Quarter-Sawn White Oak" (parent: wood_subspecies_white_oak), "Rift-Sawn White Oak" (wood_subspecies_white_oak), "Curly Ash" (wood_species_ash), "Burl Elm" (wood_species_elm), "Burl Walnut" (wood_species_walnut_group), "Crotch Walnut" (wood_species_walnut_group), "Flame Walnut" (wood_species_walnut_group), "Curly Cherry" (wood_species_cherry_group), "Flame Cherry" (wood_species_cherry_group), "Birdseye Maple" (wood_subspecies_hard_maple_sugar_maple), "Tiger Maple / Curly Maple" (wood_subspecies_hard_maple_sugar_maple), "Quilted Maple" (wood_subspecies_hard_maple_sugar_maple), "Ribbon Stripe Mahogany" (wood_species_mahogany_group), "Flame Mahogany" (wood_species_mahogany_group), "Crotch Mahogany" (wood_species_mahogany_group), "Curly Birch" (wood_species_birch_group), "Spalted Beech" (wood_species_beech_group), "Tulip Poplar Curl" (wood_species_poplar_group), "Quarter-Sawn Sycamore" (wood_species_sycamore_group). Names captured verbatim for Block 21 traceability.

D-WS4 (locked): Authority weights set at 7/7 (positive_authority + hard_negative_authority) on all 12 species. One tier below the 8/8 category-level authority from Block 17 D-WC3. Subspecies do not extend CanonicalEntry and therefore do not carry independent authority weights; subspecies inherit the parent species authority for engine reasoning. No Block 18 subspecies warrants deviation from this default.

D-WS5 (locked): cousin_species_contrasts populated per File B disambiguation pairs. Display-name prose convention per forms.ts: "Walnut: cherry shows warmer pink-to-amber oxidation..." rather than id references. Bilateral contrasts populated between most-confused pairs (oak ↔ ash; walnut ↔ cherry; walnut ↔ mahogany); unilateral substitution-pattern contrasts populated where File B identifies a substitute role (birch as walnut/cherry/mahogany substitute; gumwood as faux walnut/mahogany). Cross-category contrasts populated where File B identifies real-world confusion (oak dark-stained vs walnut). Total cousin_species_contrasts populations across the 12 species: oak (2), ash (1), walnut (5), cherry (2), mahogany (2), birch (3), poplar (1), gumwood (2). Five species (elm, maple, beech, sycamore, and the unlisted) leave the field unpopulated where File B does not establish disambiguation pairs. Within-group subspecies sibling distinctions (white_oak ↔ red_oak; honduran ↔ cuban mahogany; hard maple ↔ soft maple) live in each subspecies's identifying_elements arrays rather than via a subspecies-level cousin field; the schema does not include a cousin field on WoodSubspecies and the existing identifying_elements differentiation is sufficient.

D-WS6 (locked): period_associations populated from File B Common Time Periods tables. Date-phrase mapping convention: explicit year ranges ("1875–1915", "1880s") map directly to date_floor/date_ceiling. "1950–present" entries map to date_floor: 1950 with date_ceiling omitted per D-WS0f. period_label strings sourced from File B Usage column verbatim, with one exception: the oak_group species-level period entries derive from prose period mentions in the File B species description (no Common Time Periods table at oak group level; subspecies-level tables carry the structured data) and use the bracketed era names ("Golden Oak", "Arts & Crafts / Mission") as period_label. usage_notes optional; omitted on all Block 18 entries since period_label strings are sufficiently descriptive on their own.

D-WS7 (locked): regional_patterns populated where File B provides Regional Patterns sections. Region strings preserved verbatim from File B headers. Notes content: multi-bullet regions collapsed into prose with sentence joins (e.g., Midwest White Oak: "Massive dominance. Indiana, Michigan, Illinois, Wisconsin."); single-bullet regions use bullet text directly. Sycamore Group leaves regional_patterns unpopulated because File B omits the Regional Patterns section for sycamore. Subspecies-level regional_patterns populated on white_oak (Midwest, East Coast, California Arts & Crafts) and red_oak (Midwest factory centers); other subspecies leave the field unpopulated and inherit parent-species regional content for engine reasoning.

D-WS8 (locked): No anti_classification_guidance authored at species or subspecies level in Block 18. Production envelopes captured via period_associations rather than anti-classification boundaries. Field remains schema-available; deferred to Block 19 if Categories III/IV surface boundary species (e.g., Cuban mahogany CITES restrictions, tropical species trade cessation events) that warrant the structured boundary-encoding pattern.

D-WS9 (locked): File B's per-species cut-orientation identifying subsections (Flat-Sawn Oak, Quarter-Sawn White Oak, End Grain, Oxidation, Flat-Sawn Walnut, Quarter-Sawn Walnut, etc.) are flattened into identifying_elements arrays at species level in Block 18, with cut-orientation prefixes preserved on the bullets ("Flat-sawn: cathedral grain"; "Quarter-sawn: ray fleck"; "End grain: large pores arranged in distinct bands"; "Oxidation: deep warm brown darkening with age"). The cut-orientation structure re-emerges at CutGrainPhenomenonEntry level in Block 21 with applicable_species cross-references back to Block 18 species. Two-pass authoring pattern: the species-level flattening is intentional architecture, not content loss. Block 21 will reify the cut-orientation entries as proper phenomena (cut_orientation phenomenon_type from Block 16 D-WI6) while the Block 18 species-level flat identifiers continue to serve appraiser-voice narrative at the species frame. Distinction from D-WS3 deferral: cut-orientation subsections describe how a species LOOKS when cut a particular way (stays in identifying_elements per D-WS9); figure variant sections describe distinct natural-figure or cut-grain phenomena that warrant their own canonical entries (deferred per D-WS3).

D-WS10 (locked): For 4 subspecies without File B header-level description prose (wood_subspecies_hard_maple_sugar_maple, wood_subspecies_soft_maple, wood_subspecies_honduran_mahogany, wood_subspecies_cuban_mahogany), descriptions are constructed minimally from the File B section header pattern: "[name] subspecies of the [Parent Group]." This preserves authority-level honesty by not inferring content File B does not provide. Diagnostic content lives in unique_traits and identifying_elements arrays as File B authored. The construction differs from the Black Cherry model (which does add "primary American cherry species" framing) because Black Cherry IS the canonical American cherry species and the framing is structurally accurate; the other four are parallel-coordinate subspecies of their parent groups (Hard Maple ↔ Soft Maple as complementary; Honduran ↔ Cuban Mahogany as historically sequential), not primary-with-variants. File B's silence at subspecies header level for these four is itself meaningful: it signals parallel-coordinate relationships rather than primary-subspecies relationships.

**Workflow standards applied.** Pre-emptive schema discovery (B3): performed in Op A-1 after schema modifications; full WoodSpeciesEntry and WoodSubspecies interfaces re-read to confirm no unexpected field shifts. Forbidden field check (B4): N/A (no spatialBehaviors edits). Referential integrity gate (B5): verified — every species's wood_category_id resolves to either wood_category_ring_porous_hardwoods or wood_category_diffuse_porous_hardwoods (both anchors confirmed present in WOOD_CATEGORIES from Block 17). Family-stub-check (B9): N/A (no families touched). Form-stub-check (B11): N/A (no forms touched). Content-ambiguity stop-and-surface: invoked once during authoring on the description-less subspecies question; resolution captured in D-WS10.

**Final architectural state after this PR merges:**
- 12 WoodSpeciesEntry entries populated (was 0): 3 Category I + 9 Category II
- 8 WoodSubspecies entries nested across 4 parent species
- WoodSpeciesEntry interface gains required period_associations field, optional regional_patterns and cousin_species_contrasts fields
- WoodSubspecies interface gains optional period_associations and regional_patterns fields
- 2 new shared interfaces declared: PeriodAssociation, RegionalPattern
- ENGINEERED_SUBSTRATES, CUT_GRAIN_PHENOMENA arrays remain empty pending Blocks 20-21
- WOOD_CATEGORIES unchanged from Block 17 (4 entries)
- File count in lib/constraints/ unchanged at 10
- 19 File B figure variants captured by name with parent-species references for Block 21 traceability

---

### 2026-05-12 — Session 9 Block 19 — Natural Wood Species Batch 2 (Categories III, IV, and Category V natural members)

**Scope.** NATURAL_WOOD_SPECIES extended with 23 additional canonical WoodSpeciesEntry entries from File B Category III (Softwoods/Conifers), Category IV (Tropical Hardwoods/Imported Exotics), and the Category V natural members re-routed to proper taxonomic categories per the Block 16 D-WI4 dissolution architecture, plus 4 nested WoodSubspecies. Post-merge NATURAL_WOOD_SPECIES.length = 35 (12 from Block 18 + 23 from Block 19). ENGINEERED_SUBSTRATES (Cat V engineered members) remains empty pending Block 20; CUT_GRAIN_PHENOMENA remains empty pending Block 21. WOOD_CATEGORIES unchanged from Block 17. Block 19 is a pure content-authoring block — zero schema modifications — exercising the species/subspecies schema locked in Block 18.

**Architectural decisions (locked).**

D-WS19-1 (locked): 23 WoodSpeciesEntry entries authored. Category III — Softwoods/Conifers (8 species): wood_species_pine_group, wood_species_cedar_group, wood_species_douglas_fir, wood_species_redwood, wood_species_cypress, wood_species_spruce, wood_species_hemlock, wood_species_juniper_cedar_like_softwoods. Category IV — Tropical Hardwoods/Imported Exotics (11 species): wood_species_rosewood_group, wood_species_ebony_group, wood_species_satinwood_group, wood_species_zebrawood, wood_species_teak, wood_species_tulipwood, wood_species_kingwood, wood_species_padauk, wood_species_palisander, wood_species_purpleheart, wood_species_olivewood. Category V natural members re-routed to proper taxonomic categories (4 species): wood_species_basswood, wood_species_aspen, wood_species_cottonwood → wood_category_diffuse_porous_hardwoods; wood_species_lauan_philippine_mahogany → wood_category_tropical_hardwoods_imported_exotics. Naming convention parallels Block 18 D-WS1: species-group-spanning entries carry the _group suffix (pine_group, cedar_group, rosewood_group, ebony_group, satinwood_group); single-species entries omit it. The juniper entry uses the descriptive id wood_species_juniper_cedar_like_softwoods to match the File B section heading "JUNIPER / CEDAR-LIKE SOFTWOODS." lauan_philippine_mahogany carries common_aliases: ["philippine mahogany"] (the only Block 19 entry using common_aliases) to honor the File B section title without conflating with the wood_species_mahogany_group entry from Block 18.

D-WS19-2 (locked): 4 WoodSubspecies entries nested per File B authoring. Under wood_species_pine_group: wood_subspecies_eastern_white_pine, wood_subspecies_southern_yellow_pine. Under wood_species_cedar_group: wood_subspecies_eastern_red_cedar. Under wood_species_rosewood_group: wood_subspecies_brazilian_rosewood. Eastern White Pine and Southern Yellow Pine have full File B header-level description prose. Brazilian Rosewood and Eastern Red Cedar lack File B header-level prose; descriptions are constructed minimally per the Block 18 D-WS10 Black Cherry exemplar pattern ("primary American cedar species" / "premier rosewood species" framing). Construction precedent: each is the canonical primary representative of its parent group (Brazilian rosewood IS the canonical historical rosewood per Dalbergia nigra tradition; Eastern Red Cedar IS the canonical American cedar furniture wood), distinct from the parallel-coordinate subspecies pattern reserved for header-only constructions in Block 18 D-WS10.

D-WS19-3 (locked): File B Category V dissolution exercised per Block 16 D-WI4. Natural members rejoin proper taxonomic categories: Basswood, Aspen, Cottonwood route to wood_category_diffuse_porous_hardwoods (anatomical fit); Lauan / Philippine Mahogany routes to wood_category_tropical_hardwoods_imported_exotics. Engineered substrates from File B Category V (Plywood V-F, Particleboard V-G, MDF V-H, Hardboard V-I, Composite Cores V-J, Veneer Substrates V-K) are reserved for Block 20 ENGINEERED_SUBSTRATES authoring per the form-vs-substrate axis split in Block 16. No Category V species appears as a top-level "Category V" entry in NATURAL_WOOD_SPECIES; all natural Cat V members are absorbed into Categories II and IV per their structural identity.

D-WS19-4 (locked): File B Category V-D Gumwood/Sweetgum SKIPPED in Block 19. wood_species_gumwood_group is already authored in Block 18 D-WS1 under wood_category_diffuse_porous_hardwoods. The Cat V-D content enrichment (Southern/Midwestern regional patterns refinement, "deceptive factory woods" framing, common_aliases: ["sweetgum"] addition) is captured as a backlog item for a future cleanup block; Block 19 does not modify the existing entry. The Quarter-Cut Gumwood figure variant from File B Cat V-D routes to Block 21 per D-WS19-5 with parent: wood_species_gumwood_group (the Block 18 entry).

D-WS19-5 (locked): 24 figure variants deferred to Block 21 CUT_GRAIN_PHENOMENA. Extends the Block 18 D-WS3 catalog; combined Block 18 + Block 19 deferral total: 43 figure variants for Block 21 authoring. Block 19 species/subspecies-specific (16): "Pumpkin Pine" (parent: wood_subspecies_eastern_white_pine); "Heart Pine" (wood_subspecies_southern_yellow_pine); "Aromatic Cedar Panels" (wood_subspecies_eastern_red_cedar); "Vertical Grain Douglas Fir" (wood_species_douglas_fir); "Burl Redwood" (wood_species_redwood); "Pecky Cypress" (wood_species_cypress); "Bear Claw Spruce" (wood_species_spruce); "Curly Hemlock" (wood_species_hemlock); "Crotch Rosewood" (wood_subspecies_brazilian_rosewood); "Ribbon Stripe Rosewood" (wood_subspecies_brazilian_rosewood); "Macassar Ebony" (wood_species_ebony_group); "Crotch Satinwood" (wood_species_satinwood_group); "Quarter-Cut Zebrawood" (wood_species_zebrawood); "Ribbon Teak" (wood_species_teak); "Burl Teak" (wood_species_teak); "Carved Basswood Panels" (wood_species_basswood). From skipped Gumwood (1): "Quarter-Cut Gumwood" (wood_species_gumwood_group, authored Block 18 per D-WS19-4). Cross-species tropical variants (3, with multi-species applicable_species per the cross-species notation pattern): "Burl Veneers" (applicable_species: multiple tropical and luxury species including wood_species_walnut_group [B18], wood_species_rosewood_group, wood_species_teak; full list finalized during Block 21 authoring); "Crotch Veneers" (applicable_species: multiple including wood_species_walnut_group [B18], wood_species_mahogany_group [B18], wood_species_rosewood_group, wood_species_satinwood_group); "Ribbon Stripe Figure" (applicable_species: multiple including wood_species_mahogany_group [B18], wood_species_rosewood_group, wood_species_palisander). Names captured verbatim for Block 21 traceability.

D-WS19-6 (locked): Authority weights set at 7/7 (positive_authority + hard_negative_authority) on all 23 species, parallel to Block 18 D-WS4. Subspecies do not extend CanonicalEntry and therefore do not carry independent authority weights; subspecies inherit the parent species authority for engine reasoning. No Block 19 subspecies warrants deviation from the default.

D-WS19-7 (locked): typical_structural_role enum mapping per File B framing on the 23 species. Category III softwoods predominantly either (pine_group, cedar_group, douglas_fir, redwood, cypress, juniper_cedar_like_softwoods) — dual role as primary show wood (Mission furniture, blanket chests, Western Arts & Crafts) and secondary structural wood (drawer bottoms, backboards, framing) is constitutive of softwood use patterns. Spruce and Hemlock at primary_secondary — File B explicitly frames as secondary structural; spruce's musical-instrument use noted but does not elevate to primary_show (preservation captured in D-WS19-13). Category IV mixed: rosewood_group, teak, palisander at primary_show (used as solid lumber AND veneer); ebony_group, satinwood_group, zebrawood, tulipwood, kingwood, padauk, purpleheart, olivewood at veneer_only (veneer-dominant per File B framing). Cat V naturals: basswood, aspen, cottonwood at primary_secondary (carving substrate, drawer parts, hidden secondary construction); lauan at veneer_only per File B's "cheap veneer furniture" framing. No schema change required (D-WI7's enum locked in Block 16).

D-WS19-8 (locked): cousin_species_contrasts populated per File B disambiguation pairs. Display-name prose convention per forms.ts; not id references, parallel to Block 18 D-WS5. Cat III bilateral pairs: pine_group ↔ hemlock (File B explicit: "Often confused with pine"); pine_group ↔ cedar_group; cedar_group ↔ juniper_cedar_like_softwoods; cedar_group ↔ cypress; spruce ↔ hemlock. Cat III species-to-subspecies contrast captured at species frame: douglas_fir ↔ wood_subspecies_southern_yellow_pine (heavy structural softwoods). Cat IV bilateral pairs: rosewood_group ↔ palisander (File B explicit: "Often used interchangeably with certain rosewoods commercially"); rosewood_group ↔ kingwood; ebony_group ↔ purpleheart; satinwood_group ↔ tulipwood. Cat IV cross-category contrast: teak ↔ wood_species_mahogany_group (Block 18 entry; luxury diffuse-porous cousins). Cat IV substitute-species pattern: wood_species_lauan_philippine_mahogany ← wood_species_mahogany_group (File B explicit: "Frequently marketed misleadingly as 'mahogany'"). Cat V trilateral contrasts: basswood ↔ aspen ↔ cottonwood (pale secondary woods; each entry references both cousins). Other species (olivewood, padauk, zebrawood, redwood) leave cousin_species_contrasts unpopulated where File B is silent on disambiguation pairs. Within-subspecies sibling distinctions (eastern_white_pine ↔ southern_yellow_pine) captured in subspecies identifying_elements per Block 18 convention; no cousin field exists on WoodSubspecies.

D-WS19-9 (locked): period_associations populated from File B Common Time Periods tables per Block 18 D-WS6 conventions. Each table row maps to one PeriodAssociation: period_label sourced from the Usage column verbatim; date_floor/date_ceiling from the Period column. Open-ended rows ("1900–present", "1950–present", "1800–present", "1960–present", "1970–present") map to date_floor with date_ceiling omitted per D-WS0f. Applied across Block 19 to: pine_group (Utility and painted furniture 1900–present), cedar_group (Closet/storage use 1900–present), douglas_fir (Architectural furniture 1900–present), redwood (Rustic furniture 1900–present), cypress (Outdoor furniture 1900–present), spruce (Interior structural use 1900–present), zebrawood (Contemporary luxury 1970–present), teak (Outdoor luxury furniture 1960–present), padauk (Decorative exotic usage 1900–present), purpleheart (Decorative exotic usage 1900–present; Studio furniture 1970–present), olivewood (Decorative luxury work 1800–present), basswood (Painted furniture 1900–present), aspen (Factory utility usage 1900–present), eastern_white_pine subspecies (Rustic reproductions 1900–present), southern_yellow_pine subspecies (Utility furniture 1900–present). usage_notes optional and omitted across all Block 19 entries (period_label strings are sufficiently descriptive on their own).

D-WS19-10 (locked): regional_patterns populated where File B provides Regional Patterns sections. Region strings preserved verbatim from File B headers; notes content collapses multi-bullet regions into prose with sentence joins. Cat IV regional silence pattern: Tulipwood, Kingwood, Padauk, Palisander, Purpleheart, Olivewood lack Regional Patterns sections in File B (imports without domestic production patterns); their entries leave regional_patterns unpopulated per honest source representation. Juniper carries only a Southwest region entry (sparse File B regional content). Subspecies-level regional_patterns populated on eastern_white_pine (New England, New York) and southern_yellow_pine (Southern United States, Midwestern factories); eastern_red_cedar and brazilian_rosewood leave regional_patterns unpopulated and inherit parent-species regional content for engine reasoning per Block 18 D-WS7.

D-WS19-11 (locked): No anti_classification_guidance authored at species or subspecies level in Block 19, parallel to Block 18 D-WS8. Tropical species with CITES-anchored boundaries (Brazilian Rosewood Dalbergia nigra CITES Appendix I restriction; Cuban Mahogany cross-reference from Block 18 wood_subspecies_cuban_mahogany; ebony trade restrictions) deferred to Block 23 woodEvidence.ts authoring per the form-vs-style architectural separation: identification (this file) captures stable visual/structural traits; evidence (woodEvidence.ts) captures historically-conditioned regulatory and trade boundaries that change with period and provenance. Field remains schema-available and may be populated for engineered substrates in Block 20 where introduction-anchor boundaries warrant the structured pattern.

D-WS19-12 (locked): File B per-species cut-orientation identifying subsections (Flat-Sawn Pine, Aged Pine, and analogous cut-orientation subsections on other Block 19 species) continue flattening into identifying_elements arrays at species level per Block 18 D-WS9 architectural pattern. Cut-orientation prefixes preserved on flattened bullets ("Flat-sawn: strong ring contrast"; "Aged: amber oxidation"). The cut-orientation structure re-emerges at CutGrainPhenomenonEntry level in Block 21 with applicable_species cross-references back to Block 19 species. Two-pass authoring pattern unchanged from Block 18. Block 19's smaller cut-orientation footprint compared to Block 18 (oak's heavy cut-orientation diagnostics) reflects File B's authoring shape, not omission: most Cat III and Cat IV species in File B carry minimal cut-orientation subsection structure because identifying diagnostics live in color, aroma, density, and figure rather than in cut-plane appearance.

D-WS19-13 (locked): Spruce's File B species-description framing — "Spruce appears more frequently in secondary structures, musical instruments, utility furniture, and Northern production" — is preserved verbatim in wood_species_spruce.description. Engine reasoning during DACUM Phase 3 will use the "musical instruments" signal for musical_instrument_furniture form correlation (spruce soundboards in pump organs, pianos, phonograph cabinets; cross-references the Block 15 Musical and Mechanical Furniture family). No schema modification, no separate field, no anti-classification anchor — the diagnostic signal lives in the species description where File B authored it. typical_structural_role remains primary_secondary per D-WS19-7; musical-instrument use does not elevate spruce to primary_show because File B's framing emphasizes secondary structural dominance.

D-WS19-14 (locked): period_associations: [] (empty array) for species where File B provides no Common Time Periods section is the canonical convention for source-silent period data. Distinct semantically from authoring gaps. Refines D-WS0b's framing without modifying the schema contract: the required PeriodAssociation[] field exercised with empty array honors File B silence and preserves the distinction between "source is silent on this species' periods" (intentional, type-valid acknowledgment) and "we haven't authored this species yet" (type-error, authoring gap). First exercised on wood_species_juniper_cedar_like_softwoods in Block 19 — File B's Juniper / Cedar-Like Softwoods section provides species description, unique traits, identifying elements, and a Southwest regional pattern, but omits any Common Time Periods table. Future blocks may exercise this convention where canonical source is silent on required structured-content fields. Parallels Block 18 D-WS10 header-only descriptions standard for source-silent description fields (and per D-WS10's parallel-coordinate-subspecies framing, the silence is itself meaningful, not a gap).

**Workflow standards applied.** Pre-emptive schema discovery (B3): performed in Op A-0/A-1 reading WoodSpeciesEntry and WoodSubspecies interfaces; confirmed Block 18 schema state preserved with zero modifications. Existing-array confirmation (B5): verified the 12 Block 18 entries unchanged before appending the 23 new entries. Referential integrity gate: every Block 19 species's wood_category_id resolves to wood_category_softwoods_conifers (8 entries), wood_category_tropical_hardwoods_imported_exotics (12 entries including lauan), or wood_category_diffuse_porous_hardwoods (3 entries: basswood, aspen, cottonwood). Forbidden field check (B4): N/A (no spatialBehaviors edits). Family-stub-check (B9): N/A. Form-stub-check (B11): N/A. Content-ambiguity stop-and-surface: invoked during plan formation for the juniper Common Time Periods silence question and resolved at D-WS19-14; invoked during context recovery to re-source File B excerpts after summarization.

**Final architectural state after this PR merges:**
- NATURAL_WOOD_SPECIES.length = 35 (was 12; 12 Block 18 + 23 Block 19)
- 12 WoodSubspecies entries nested across 7 parent species (was 8 across 4; +4 Block 19 across 3 new parents)
- WoodSpeciesEntry and WoodSubspecies schemas unchanged from Block 18 (zero schema modifications in Block 19)
- WOOD_CATEGORIES unchanged from Block 17 (4 entries)
- ENGINEERED_SUBSTRATES remains empty pending Block 20 (Category V engineered members)
- CUT_GRAIN_PHENOMENA remains empty pending Block 21 (43 deferred figure variants total: 19 from Block 18 D-WS3 + 24 from Block 19 D-WS19-5)
- File count in lib/constraints/ unchanged at 10
- D-WS19-14 establishes the canonical convention for source-silent required-array fields (empty array honors silence vs. type-error authoring gap)

---

### 2026-05-12 — Session 9 Block 20 — Engineered Substrates Library (File B Category V-F through V-J; V-K Veneer Substrates deferred)

**Scope.** ENGINEERED_SUBSTRATES populated with 5 canonical EngineeredSubstrateEntry entries from File B Category V-F through V-J. File B Section V-K Veneer Substrates deferred per D-ES20-2 (composition_type enum doesn't fit multi-era backing-material concept). Block 20 is content authoring + first canonical exercise of substrate-level anti_classification_guidance (FormEntry already exercised it per Block 16 D-WI3 on lowboy and coffee_table). Three small additive optional fields added to EngineeredSubstrateEntry (cousin_substrate_contrasts, period_associations, regional_patterns), reusing PeriodAssociation (Block 18 D-WS0b) and RegionalPattern (Block 18 D-WS0c) interfaces. EngineeredSubstrateEntry, AntiClassificationGuidance, and inline introduction_anchor shape preserved from Block 16 D-WI2/D-WI3 lockwork. NATURAL_WOOD_SPECIES (35 entries) and WOOD_CATEGORIES (4 entries) unchanged from Block 19. CUT_GRAIN_PHENOMENA remains empty pending Block 21.

**Architectural decisions (locked).**

D-ES20-1 (locked): 5 EngineeredSubstrateEntry entries authored in ENGINEERED_SUBSTRATES: engineered_substrate_plywood, engineered_substrate_particleboard, engineered_substrate_mdf, engineered_substrate_hardboard_masonite, engineered_substrate_composite_veneer_cores. Routes File B Category V-F through V-J to the substrates library. Post-merge ENGINEERED_SUBSTRATES.length === 5. Naming convention engineered_substrate_<snake> parallels Block 18 D-WS1 wood_species_<snake> convention. hardboard_masonite id captures both File B's section heading and the Masonite brand alias (also surfaced via common_aliases: ["masonite"]); mdf entry similarly carries common_aliases: ["medium-density fiberboard"].

D-ES20-2 (locked): File B Section V-K Veneer Substrates DEFERRED from Block 20. composition_type enum (laminated_plies | compressed_fiber | composite_particle | composite_other) does not fit veneer substrates' multi-era backing-material concept (1700–1850 hand-sawn solid lumber, 1850–1930 lumber-core, 1905+ plywood-core, 1970+ MDF/particleboard-core). Three architectural resolution paths documented for future block: (a) absorb V-K content into Block 21 CUT_GRAIN_PHENOMENA as part of Veneer Thickness Era Markers cross-substrate temporal phenomenon entry; (b) absorb V-K content into Block 23 woodEvidence.ts as backing-material-as-evidence content; (c) extend composition_type enum with a multi_era_composition value or analogous structural accommodation to preserve V-K as substrate library entry. File B V-K content (descriptions, unique traits, identifying elements, common time periods spanning 1700–present hand-sawn / commercial / thin-veneer eras, Bookmatched/Slip-Matched/Radial Veneer figure variants) captured verbatim in plan and audit context for future canonical use. With Block 20 ship, File B Category V dissolution per Block 16 D-WI4 is 11/12 complete: natural members rerouted to Cats II/IV in Block 19 D-WS19-3 (basswood, aspen, cottonwood → Cat II; lauan → Cat IV); engineered members V-F through V-J in ENGINEERED_SUBSTRATES (Block 20); V-K alone pending.

D-ES20-3 (locked): Schema strategy — adapt to Block 16 lockwork; zero schema modifications to existing interfaces. EngineeredSubstrateEntry (woodIdentification.ts:333-419), inline introduction_anchor shape (woodIdentification.ts:404-409), and AntiClassificationGuidance (entryShape.ts:39-67) preserved as Block 16 locked them. Three small additive optional fields added to EngineeredSubstrateEntry per Op A-2 Option β and the substrate-period mapping need: cousin_substrate_contrasts?: string[] (parallel to Block 18 D-WS0a cousin_species_contrasts), period_associations?: PeriodAssociation[] (reusing Block 18 D-WS0b interface), regional_patterns?: RegionalPattern[] (reusing Block 18 D-WS0c interface). Plan-time alternative paths (Modify Block 16 schemas; Hybrid revision with new IntroductionAnchor interface and substrate-specific anti-classification fields) considered and rejected at plan formation to preserve Block 16 D-WI3 lockwork and the existing FormEntry exercisers (lowboy, coffee_table, plus 14 other forms across forms.ts).

D-ES20-4 (locked): Authority weights set at 8/8 (positive_authority + hard_negative_authority) on all 5 substrates. One tier above species' 7/7 calibration from Block 18 D-WS4 / Block 19 D-WS19-6. Substrates carry stronger dating evidence than species because their chronological floors are more diagnostically definitive than species period-of-use overlaps. A walnut piece could be 1850 or 1950; an MDF piece cannot be pre-1970. Authority weight reflects diagnostic strength. Parallel to Block 17 D-WC3 category-level 8/8 authority — substrates as identification anchors share the same calibration tier as wood categories.

D-ES20-5 (locked): anti_classification_guidance exercised at canonical-entry level on substrates for the first time in Block 20 (FormEntry already exercises it per Block 16 D-WI3 on form_lowboy, form_coffee_table, form_pump_organ_cabinet, form_washstand, form_sideboard, form_chifforobe, form_wooton_desk, form_computer_desk, form_charging_station, and others). All 5 authored substrates populate the field. Substrate adoption maps to boundary_type: "form_emergence" per Block 16 D-WI3 docstring mapping ("substrate adoption and species furniture-use extinction semantically map to form_emergence and form_extinction respectively without renaming"). pre_boundary_classifications and post_boundary_classifications omitted across all substrate entries — no natural form-id mapping for substrate-absent or substrate-present classifications; the dating semantic lives entirely in guidance_text prose. prominence: "standard" on all 5 substrates per forms.ts canonical convention surfaced at Op A-1 (plan-time draft proposed "prominent" reasoning that substrate adoption is a high-prominence dating signal; Op A-1 finding revised this). prominence: "prominent" is reserved for boundaries involving active reclassification reasoning (paired with populated pre_boundary_classifications / post_boundary_classifications arrays — e.g., form_lowboy's 1720 emergence with pre_boundary_classifications: ["form_low_chest", "form_dressing_table", "form_side_table"]); substrate emergence boundaries omit those arrays and therefore use "standard" prominence per the convention. composite_veneer_cores' medium-confidence 1945 boundary lives in introduction_anchor.confidence_notes (D-ES20-7), not in prominence enum.

D-ES20-6 (locked): Plywood anti_classification_guidance exercised in array form as the first canonical substrate-level use of the array shape (Block 16 D-WI3 declared AntiClassificationGuidance | AntiClassificationGuidance[] on EngineeredSubstrateEntry; forms.ts uses array form on lowboy 4-entry, pier_table 2-entry, and 2 others). Two entries capture File B's "Chronological Importance of Plywood" sub-table: Entry 1 (boundary_date: 1905, boundary_type: "form_emergence") for emergence boundary ("Plywood adoption in furniture begins ~1905; pre-1905 pieces do not contain plywood; absence of plywood typically indicates pre-1905 construction, though absence is necessary but not sufficient for pre-1900 dating"); Entry 2 (boundary_date: 1945, boundary_type: "form_emergence") for extensive-carcass widespread adoption ("Extensive plywood carcass construction indicates post-1945 production; limited panel use 1905-1935 reflects early adoption; extensive carcass use is a strong post-WWII factory production signal"). Single-object form sufficient for the other 4 authored substrates (each carries a single diagnostic chronological-floor semantic).

D-ES20-7 (locked): introduction_anchor inline two-year shape preserved per Block 16 declaration: { earliest_plausible_year, widespread_adoption_year, dominance_year?, confidence_notes? }. Year values reconciled against File B "Engineered Materials Are Chronological Anchors" table: plywood (1905 / 1945 widespread aligns with File B "extensive plywood carcass post-1945"; dominance_year: 1950 reflects "Dominant substrate" common-period entry); particleboard (1947 / 1950 widespread aligns with File B "post-1950"); mdf (1970 / 1985 widespread; earliest_plausible aligns with File B "post-1970"; widespread reflects mid-1980s cabinetry adoption); hardboard_masonite (1930 / 1945 widespread; earliest_plausible aligns with File B "post-1930"); composite_veneer_cores (1945 / 1960 widespread; not in File B Chronological Anchors table; aligned to V-J Common Time Periods 1945–present with confidence_notes marking medium-confidence composite-category framing). confidence_notes populated on all 5 entries; dominance_year populated only on plywood (the only substrate where File B distinguishes growing factory use from dominant-substrate periods).

D-ES20-8 (locked): composition_type and typical_structural_role enum mappings per Block 16 declarations: plywood (laminated_plies / either — plywood appears as both show veneer-faced panels and structural substrate); particleboard (composite_particle / substrate_only — never appears as show surface, always covered by veneer or laminate); mdf (compressed_fiber / substrate_only); hardboard_masonite (compressed_fiber / substrate_only — drawer bottoms and backs, never show surface); composite_veneer_cores (composite_other / veneer_substrate — designed for veneer overlay). composite_other selected for composite_veneer_cores because the category combines multiple composition approaches (particleboard + MDF + laminated plies cores beneath veneer surface) and doesn't fit any single composition_type cleanly. Block 16 D-WI2's enum design anticipated this exact case ("composite_other: other engineered composites not fitting the above"). MDF and Hardboard both map to compressed_fiber per Block 16 D-WI2's explicit grouping ("compressed_fiber: MDF, hardboard, fiberboard").

D-ES20-9 (locked): cousin_substrate_contrasts?: string[] field added to EngineeredSubstrateEntry (Op A-2 Option β). Parallel to Block 18 D-WS0a cousin_species_contrasts pattern; substrate-to-substrate visual disambiguation prose convention identical (display-name prose, not id references). Populations: plywood ↔ composite_veneer_cores bilateral (both layered laminated substrates; differ in lamination thickness and core composition); particleboard ↔ mdf bilateral (both pressed-fiber substrates; differ in particle visibility and edge texture). hardboard_masonite leaves field unpopulated (visually distinctive thin compressed sheet; not commonly confused per File B). Field omitted entirely from substrates without populated contrasts (consistent with Block 19 D-WS19-8 species-level omission convention).

D-ES20-10 (locked): period_associations?: PeriodAssociation[] and regional_patterns?: RegionalPattern[] fields added to EngineeredSubstrateEntry as small additive optional fields, reusing the existing PeriodAssociation (Block 18 D-WS0b) and RegionalPattern (Block 18 D-WS0c) interfaces. Populated from File B Common Time Periods tables and Regional Patterns sections per Block 18 D-WS6/D-WS7 mapping conventions. Date-phrase mapping unchanged: "1950–present" / "1970–present" / "1905–present" rows use date_floor with date_ceiling omitted per D-WS0f. Substrate regional content is minimal (industrial production rather than regional craft traditions) — every substrate carries exactly one RegionalPattern entry capturing File B framing ("National factory production", "Industrialized furniture production", "Modern industrial furniture production", "Factory production worldwide"). Plywood carries 3 PeriodAssociation entries (Early adoption 1905-1930; Growing factory use 1930-1950; Dominant substrate 1950-present); other substrates carry 1 entry each reflecting narrower production histories.

D-ES20-11 (locked): 9 items deferred to Block 21 CUT_GRAIN_PHENOMENA. Extends Block 18 D-WS3 (19 items) and Block 19 D-WS19-5 (24 items) deferred catalogs; combined Block 18 + 19 + 20 total: 52 figure variants and cross-phenomena for Block 21 authoring. Block 20-specific: 5 substrate-specific figure variants from authored substrates ("Aircraft-Grade Plywood" → engineered_substrate_plywood; "Baltic Birch Plywood" → engineered_substrate_plywood; "Veneered Particleboard" → engineered_substrate_particleboard; "Laminated MDF" → engineered_substrate_mdf; "Pegboard Hardboard" → engineered_substrate_hardboard_masonite); 3 from deferred V-K Veneer Substrates ("Bookmatched Veneers"; "Slip-Matched Veneers"; "Radial Veneers" — parent assignment pending D-ES20-2 resolution); 1 cross-substrate temporal phenomenon ("Veneer Thickness Era Markers" — captures File B "Veneer Thickness Matters" content: Thick hand-sawn veneer 1700-1850; Medium machine veneer 1850-1930; Thin rotary veneer post-1930; uses applicable_to multi-substrate notation parallel to Block 19 D-WS19-5 cross-species tropical figure variant pattern).

D-ES20-12 (locked): Decision-prefix convention shift: Block 20 audit entries use D-ES prefix (engineered substrate) distinct from Blocks 17-19's D-WS / D-WC / D-WI prefixes (wood species, wood category, wood identification schema). Honest naming for the structural distinction between species and substrate decisions. Future blocks: D-WS for natural species work (Block 22+ wood evidence); new prefixes for new entity types (D-MM for maker marks; D-CG for cut/grain phenomena if Block 21 introduces a distinct prefix). File B Category V dissolution per Block 16 D-WI4 captured 11/12 in Blocks 19 + 20: natural members in Block 19 D-WS19-3 (basswood/aspen/cottonwood → Cat II; lauan → Cat IV); engineered members V-F through V-J in Block 20 D-ES20-1; V-K alone remains pending per D-ES20-2.

D-ES20-13 (locked): "Secondary Woods Often Carry Higher Dating Authority" framing from File B (positioned after V-K Veneer Substrates, before "Engineered Materials Are Chronological Anchors") captured for future canonical use but NOT AUTHORED in Block 20. Framing content: especially applies to drawer bottoms, drawer sides, interior framing, undersides, and backboards — because these surfaces preserve original saw marks, oxidation, fastener interaction, and tool evidence. In-scope-deferred resolution: the framing requires a position-on-piece schema layer (drawer_bottom / drawer_side / interior_framing / underside / backboard locations as authority-weighting context) crossing species, forms, joinery, fasteners, hardware libraries. Architectural prerequisite NOT YET PRESENT. Three resolution paths documented for future block: (a) position entity in new formAnatomy.ts library with location enum and authority-weighting fields; (b) position field on existing entries across libraries — cross-cutting addition; (c) evidence-position cross-cutting structure in evidenceIntegrationRules.ts. Likely resolution venue: Block 23 woodEvidence.ts authoring or a dedicated position-architecture block before Block 23.

**Workflow standards applied.** Pre-emptive schema discovery (B3): Op A-0 confirmed Block 16 schema state preserved (EngineeredSubstrateEntry, AntiClassificationGuidance, inline introduction_anchor). Op A-1 read forms.ts AntiClassificationGuidance usage on lowboy, coffee_table, pier_table, pump_organ_cabinet, washstand, chifforobe, wooton_desk, computer_desk, charging_station — surfaced the prominence convention (D-ES20-5 finding). Op A-2 added 3 optional fields to EngineeredSubstrateEntry. Op A-3 confirmed ENGINEERED_SUBSTRATES empty at Block 19 endpoint, NATURAL_WOOD_SPECIES.length === 35, WOOD_CATEGORIES.length === 4. Forbidden field check (B4): N/A (no spatialBehaviors edits). Referential integrity gate (B5): N/A at substrate level (substrates do not carry FK references to wood categories; wood_category_id is a species-level field). Family-stub-check (B9): N/A. Form-stub-check (B11): N/A. Content-ambiguity stop-and-surface: invoked at plan formation for the schema-state discrepancy between original plan draft and Block 16 lockwork (resolved at D-ES20-3); invoked at plan formation for V-K Veneer Substrates composition_type fit (resolved at D-ES20-2); invoked at Op A-1 for the prominence convention divergence between plan and forms.ts canonical pattern (resolved at D-ES20-5).

**Final architectural state after this PR merges:**
- ENGINEERED_SUBSTRATES.length === 5 (was 0)
- NATURAL_WOOD_SPECIES.length === 35 (unchanged from Block 19)
- WOOD_CATEGORIES.length === 4 (unchanged from Block 17)
- EngineeredSubstrateEntry gains three small additive optional fields: cousin_substrate_contrasts?: string[], period_associations?: PeriodAssociation[], regional_patterns?: RegionalPattern[] (reusing Block 18 interfaces; no new interfaces declared in Block 20)
- AntiClassificationGuidance interface unchanged from Block 16 D-WI3 lockwork
- IntroductionAnchor not introduced as a named interface; inline shape on EngineeredSubstrateEntry retained per Block 16
- CUT_GRAIN_PHENOMENA remains empty pending Block 21 (52 deferred items across Blocks 18-20)
- File count in lib/constraints/ unchanged at 10
- File B Category V dissolution 11/12 complete; V-K Veneer Substrates alone pending D-ES20-2 architectural resolution
- D-ES20-13 establishes architectural promise for "Secondary Woods Often Carry Higher Dating Authority" framing → future block (position-on-piece schema layer prerequisite)
- First canonical exercise of substrate-level anti_classification_guidance (plywood in array form with 2 entries; 4 other substrates in single-object form; all using prominence: "standard" per forms.ts canonical convention)

---

### 2026-05-13 — Session 10 Block 21 — Cut/Grain Phenomena Library (Option δ; parallel-dimension first-class phenomenon entities + Block 18 species refactor)

**Scope.** CUT_GRAIN_PHENOMENA populated with 25 canonical CutGrainPhenomenonEntry entries from File B Category VI content. CutGrainPhenomenonEntry interface extended with 4 small additive optional fields (period_associations, regional_patterns, anti_classification_guidance, applicable_substrates). 3 Block 18 species entries (oak_group, walnut_group, pine_group) refactored to migrate cut-prefixed bullets from identifying_elements into newly-populated cut_specific_identifiers arrays. First canonical population of the bidirectional cut-phenomenon-to-species pattern (Block 16 D-WI6 design). NATURAL_WOOD_SPECIES (35 entries, 3 refactored structurally), ENGINEERED_SUBSTRATES (5 entries), WOOD_CATEGORIES (4 entries) preserved otherwise unchanged from Block 20 endpoint.

**Architectural decisions (locked).**

D-CG21-1 (locked): 25 CutGrainPhenomenonEntry entries authored in CUT_GRAIN_PHENOMENA. File B Category VI content sourced inline. Distribution by phenomenon_type: cut_orientation 4 (flat_sawn, quarter_sawn, rift_sawn, live_sawn); natural_figure 11 (burl, birdseye, curly_figure, quilted_figure, flame_figure, spalted_figure, crotch_figure, pumpkin_pine, heart_pine, pecky_cypress, bear_claw_spruce); ray_cellular 2 (ray_fleck, ribbon_stripe); veneer_slicing 7 (rotary_cut_veneer, plain_sliced_veneer, quarter_sliced_veneer, hand_sawn_veneer, bookmatching, slip_matching, radial_matching); optical_effect 1 (chatoyance). Final count 25 sits in the planned 22-28 range. Maximum cross-species consolidation applied per D-CG21-8 (one Burl across walnut/elm/redwood/maple/mahogany/teak; one Curly Figure across maple/cherry/birch/walnut/ash/hemlock/poplar/mahogany; one Crotch across walnut/mahogany/rosewood/satinwood; one Ribbon Stripe across mahogany/rosewood/teak/palisander/zebrawood). Authoring-time decisions resolved: Fiddleback Figure folded into Curly Figure (common_aliases preserves "fiddleback"; hard_maple_sugar_maple + mahogany_group characteristic_expression captures musical-instrument-grade fiddleback nuance); Vertical Grain Douglas Fir folded into Quarter-Sawn (douglas_fir applicable_species with characteristic_expression capturing softwood quarter-cut signature); Aromatic Cedar Panels DROPPED entirely per appraiser-honest discipline (species-usage signature not figure phenomenon; backlog item to enrich wood_subspecies_eastern_red_cedar.identifying_elements as future cleanup).

D-CG21-2 (locked): Architectural framework: Option δ (parallel-dimension first-class phenomena via Block 16 D-WI2/D-WI6 bidirectional pattern). Phenomena and species are independent evidence sources per the Independent Layer Evaluation Standard. Phase 3 engine reasoning combines phenomenon-level evidence with species-level evidence at integration time; no composite entities; no dependency chains. Triangulated pre-flight inspection: Mike's appraiser intuition + Claude Code architectural inspection + File B canonical source structure all converged on Option δ. Alternative Options α/β/γ considered and rejected at plan time per pre-flight reasoning (cross-species reasoning loss; authority calibration collapse; File B editorial structure violation; subspecies × cut combinatorics; entity multiplication 2.1-2.3×).

D-CG21-3 (locked): Substrate sub-classification (5 Block 20 D-ES20-11 deferrals: Aircraft-Grade Plywood, Baltic Birch Plywood, Veneered Particleboard, Laminated MDF, Pegboard Hardboard) DROPPED from Block 21 CUT_GRAIN_PHENOMENA scope per Mike's appraiser-honest discipline. These are quality/functional reads (which grade of plywood; whether particleboard has veneer face), not dating evidence. Substrate-class dating evidence (plywood vs particleboard vs MDF as chronological floors) already authored in Block 20 D-ES20-1. Possible enrichment of existing substrate entries' identifying_elements as quality-tier signals tracked as minor backlog cleanup.

D-CG21-4 (locked): V-K Veneer Substrates content (Block 20 D-ES20-2 deferral) routes to Block 23 woodEvidence.ts per Path C resolution. Veneer substrate is not an entity an appraiser identifies as its own entity per Mike's appraiser expertise; it's always "what's underneath a specific veneer" — backing-material-as-evidence content describing diagnostic relationships between veneer faces and backings across eras. V-K File B content captured verbatim in Block 20 D-ES20-2 audit text for Block 23 sourcing.

D-CG21-5 (locked): "Veneer Thickness Era Markers" composite entity (File B "Veneer Thickness Matters" content) REJECTED; DECOMPOSED into 3 veneer_slicing phenomenon entries per Mike's independent-observation principle. cut_grain_phenomenon_hand_sawn_veneer (period_associations: Federal-era luxury 1700-1850), cut_grain_phenomenon_plain_sliced_veneer (absorbs middle-era machine-cut 1850-1930 plus contemporary plain-sliced; period_associations: Commercial veneer 1850-present), cut_grain_phenomenon_rotary_cut_veneer (period_associations: Mass production 1930-present). Each entry carries own period_associations. Thickness measurement is an independent observation per Mike's appraiser working practice; era inference emerges at Phase 3 engine integration time from convergence of slicing method + thickness + species + substrate + form + maker marks, not from composite stored entity.

D-CG21-6 (locked): Block 18 species refactor (Op C): wood_species_oak_group, wood_species_walnut_group, wood_species_pine_group entries refactored. **Plan-stated bullet count (21 across 3 species) revised at authoring time to 25** when the survey regex omitted oak_group's 4 "Quarter-sawn (white oak):" parenthesized-prefix bullets. Migration distribution: 11 bullets MOVED from identifying_elements into cut_specific_identifiers arrays (oak_group 4 Flat-sawn; walnut_group 4 Flat-sawn + 3 Quarter-sawn; pine_group 4 Flat-sawn — wait correcting: oak_group 4 + walnut_group 7 + pine_group 4 = 15 bullets migrated). 4 "Quarter-sawn (white oak):" bullets at oak_group level DROPPED as redundant with cut_grain_phenomenon_quarter_sawn.applicable_species[white_oak].characteristic_expression coverage and wood_subspecies_white_oak.identifying_elements existing quarter-sawn-implicit bullets ("Dramatic ray fleck", "Heavy linear shimmer in quarter-sawn cuts"). 6 non-cut bullets KEEP at species level rephrased prefix-free per Path α: oak_group End grain anatomical observation rephrased as "Large pores arranged in distinct bands (visible at end grain)"; walnut_group 2 Oxidation rephrased ("Deep warm brown darkening with age", "Often develops amber undertones beneath finish"); pine_group 3 Aged rephrased ("Amber oxidation with age", "Dry resin crystallization on aged surfaces", "Surface checking on aged surfaces"). cut_specific_identifiers field (Block 16 D-WI6, never populated in Blocks 18-19) exercised for the first time, completing the bidirectional pattern (phenomenon → species via applicable_species; species → phenomenon via cut_specific_identifiers). Pine aging bullets: Plan-time Part 2 recommended Path β (route to pumpkin_pine.characteristic_expression on eastern_white_pine); plan file revision to Path α retained at execution because pumpkin_pine is subspecies-specific (eastern_white_pine) and pine_group is species-group level — general pine aging doesn't fit pumpkin_pine's subspecies scope. Path α applied per plan file revision.

D-CG21-7 (locked): Authority weight tiered calibration per phenomenon_type. cut_orientation: 8/8 (4 entries). natural_figure: 7/7 (11 entries). ray_cellular: 8/8 (2 entries). veneer_slicing: 7/7 (7 entries). optical_effect: 6/6 (1 entry). Calibration tiers reflect per-phenomenon-type diagnostic strength independently of species' 7/7 (Block 18 D-WS4) and substrate' 8/8 (Block 20 D-ES20-4) calibrations. Phase 3 engine reasoning at integration time combines phenomenon-level confidence with species/substrate-level confidence; no composite authority calibration stored at entity level. File B Category VI Description framing ("These phenomena often become more diagnostically important than the species itself") supports the higher tiers (cut_orientation and ray_cellular at 8/8 above species' 7/7).

D-CG21-8 (locked): Maximum cross-species consolidation per Mike's lean. Phenomena like Burl (applicable across walnut_group, elm, redwood, hard_maple_sugar_maple, mahogany_group, teak), Curly Figure (applicable across hard_maple_sugar_maple, cherry_group, birch_group, walnut_group, ash, hemlock, poplar_group, mahogany_group), Flame Figure (across mahogany_group, walnut_group, cherry_group), Crotch Figure (across walnut_group, mahogany_group, rosewood_group, satinwood_group), Ribbon Stripe (across mahogany_group, rosewood_group, teak, palisander, zebrawood) become ONE phenomenon entry each with applicable_species multi-entry arrays. Per-species nuance captured via characteristic_expression strings on applicable_species entries. Cross-species reasoning capability preserved: Phase 3 engine seeing "this exhibits burl figure" narrows species candidates to applicable_species list, then evaluates species evidence independently per Independent Layer Evaluation Standard.

D-CG21-9 (locked): period_associations?: PeriodAssociation[] field added to CutGrainPhenomenonEntry as small additive optional field. Reuses Block 18 D-WS0b PeriodAssociation interface. Parallel to Block 20 D-ES20-10 substrate-side addition. Populated on 21 of 25 entries; 4 entries (pumpkin_pine, pecky_cypress, bear_claw_spruce, quarter_sliced_veneer, radial_matching) leave period_associations unpopulated per appraiser-honest source-silent discipline (File B authors no Common Time Periods table for these nested figure variants; field is optional on CutGrainPhenomenonEntry so omission is type-valid). Note: 4 entries listed but 5 names — quarter_sliced_veneer and radial_matching are both source-silent. Plan-time decision: omit field rather than empty-array convention per Block 19 D-WS19-14 (D-WS19-14 applied to required array fields; here period_associations is optional so omission is the cleaner type-valid signal of source silence). Phenomena carry own period associations independent of species period associations; Phase 3 engine reasoning at integration time combines phenomenon period bands with species period bands.

D-CG21-10 (locked): regional_patterns?: RegionalPattern[] field added to CutGrainPhenomenonEntry. Reuses Block 18 D-WS0c RegionalPattern interface. Populated on 2 of 25 entries: cut_grain_phenomenon_quarter_sawn (Midwest Mission furniture dominance per File B); cut_grain_phenomenon_burl (California Arts & Crafts redwood-burl regional concentration per File B). Most phenomena lack regional-pattern content in File B Cat VI; field unpopulated by default.

D-CG21-11 (locked): anti_classification_guidance?: AntiClassificationGuidance | AntiClassificationGuidance[] field added to CutGrainPhenomenonEntry. Reuses entryShape.ts AntiClassificationGuidance interface. Single-or-array shape per Block 20 D-ES20-6 precedent. Exercised on 2 of 25 entries (both single-object form, no array form needed in Block 21): cut_grain_phenomenon_spalted_figure (boundary_date 1960, form_emergence, guidance_text on heavy-spalting post-1960 studio-only false-positive signal, prominence "standard"); cut_grain_phenomenon_rotary_cut_veneer (boundary_date 1930, form_emergence, guidance_text on rotary-cut emergence as post-1930 mass-production signal, prominence "standard"). Plan-time decision points (Burl multi-boundary array; Quarter-Sawn Mission boundary) resolved at authoring as not warranted: Burl's three waves (Victorian 1840-1900, Art Deco 1925-1945, Studio 1970-present) encoded in period_associations as 3 entries — anti-classification is for false-positive boundary protection (e.g., "post-1930 in pre-1900 context") which doesn't apply to burl's continuous historical presence across waves. Quarter-Sawn lacks a sharp emergence boundary; period_associations encoding sufficient. prominence "standard" per Block 20 Op A-1 forms.ts canonical convention (omitted pre/post_boundary_classifications → standard). boundary_type "form_emergence" per Block 20 D-ES20-5 substrate-adoption convention.

D-CG21-12 (locked): applicable_substrates?: { substrate_id: string; characteristic_expression?: string }[] field added to CutGrainPhenomenonEntry. Closes Block 16 D-WI6 design gap surfaced by Block 20 (substrate-side figure variants need substrate FK target). Field shape parallel to existing applicable_species per Block 16 D-WI6. Exercised on 4 of 25 entries: rotary_cut_veneer (plywood, composite_veneer_cores — with characteristic_expression on plywood noting rotary-cut as dominant face material post-1930); plain_sliced_veneer (plywood, composite_veneer_cores); bookmatching (plywood, composite_veneer_cores); slip_matching (plywood, composite_veneer_cores). Non-veneer phenomena (Burl, Curly, Crotch, etc.) leave field unpopulated — figure variants don't apply to substrates since substrates are themselves engineered surfaces; veneer-slicing/layout phenomena are the cross-substrate cases.

D-CG21-13 (locked): Biological-overlay phenomena (Pumpkin Pine, Heart Pine, Pecky Cypress, Bear Claw Spruce, Spalted) classified as phenomenon_type: "natural_figure" rather than introducing a 6th enum value. Per Claude Code pre-flight recommendation to avoid phenomenon_type enum churn. File B's editorial framing groups these phenomena (fungal, aging, anatomical-distortion) under Cat VI-B Natural Figure — fungal/aging/anatomical phenomena are forms of figure even if not strictly cut-based. **Aromatic Cedar Panels DROPPED entirely from CUT_GRAIN_PHENOMENA scope per Path β** (architectural decision point resolved at authoring time per appraiser-honest discipline): this is a species-usage signature (eastern_red_cedar used as panel surface in storage furniture), not a figure-on-wood phenomenon. The diagnostic ("Bright purple-red coloration; distinct aromatic odor retention") is better captured at the species level. Backlog: enrich wood_subspecies_eastern_red_cedar.identifying_elements to include the usage-signature diagnostic; not Block 21 scope.

D-CG21-14 (locked): Decision-prefix convention: D-CG (cut/grain) for Block 21 audit entries. Distinct from D-WS (wood species, Blocks 17-19), D-ES (engineered substrate, Block 20), D-WC (wood category, Block 17), D-WI (wood identification schema, Block 16). Honest naming for entity-type-specific decision lineage. Future cut/grain phenomena work (extensions, refactors) continues D-CG numbering across blocks.

D-CG21-15 (locked): Block 18-19 cut-prefix flattening inconsistency (Block 18 D-WS9 pattern applied to only 3 of 35 species: oak_group, walnut_group, pine_group; remaining 32 species used implicit cut-orientation handling or no cut content) corrected via D-CG21-6 species refactor. Block 18 D-WS9 effectively superseded by Block 21 cut_specific_identifiers pattern; species identifying_elements becomes species-default-cut content; cut-specific markers route to cut_specific_identifiers via phenomenon FK. Pattern alignment across all 35 species at Block 21 endpoint. Species without prior cut-prefix flattening (the 32) remain structurally unchanged — their identifying_elements were already species-default; if a phenomenon applies to that species, the phenomenon entry's applicable_species.characteristic_expression captures the species-specific expression. wood_subspecies_white_oak's existing quarter-sawn-implicit identifying_elements ("Dramatic ray fleck", "Heavy linear shimmer in quarter-sawn cuts") not migrated in Block 21 — those are subspecies-level inherited Block 18 content; possible follow-up cleanup to migrate them into wood_subspecies_white_oak.cut_specific_identifiers under cut_grain_phenomenon_quarter_sawn if future Phase 3 engine reasoning surfaces need for stricter pattern adherence at subspecies level.

D-CG21-16 (locked): File B Cat VI editorial structure ("This category is therefore cross-species and interacts with every prior wood category") canonically supports parallel-dimension phenomenon library architecture. File B's Cat VI authoring shape (description + unique traits + identifying elements + common time periods + common woods cross-reference) maps directly to CutGrainPhenomenonEntry shape. Block 16 D-WI2/D-WI6 architectural lockwork was independently consistent with File B's editorial dimensional separation. Block 21 exercises this convergence for the first time at authoring scale.

D-CG21-17 (locked): File B Cat VI "Critical Diagnostic Principles" content captured for engine-reasoning support. Specific principles: "Figure Alone Should Not Date Furniture" — canonical support for Independent Layer Evaluation Standard at figure-evidence level; routes to WORKFLOW.md backlog. "Veneer Geometry Often Reveals Era" routes to engine reasoning documentation. "Figure Can Create False Positives" — appraiser warning about modern reproductions; partially captured via anti_classification_guidance on Spalted (post-1960 studio-only false-positive signal) and Rotary-Cut (post-1930 mass-production signal); broader false-positive guidance (Curly Figure as modern Federal-style reproduction signal; Quarter-Sawn as modern Mission-style reproduction signal) deferred to future engine-reasoning documentation. "Certain Figures Are Extremely Period-Specific" captured in per-phenomenon period_associations + anti_classification_guidance. "Figure Often Indicates Quality Tier" routes to engine reasoning documentation. "Important Chronological and Style Associations" table (File B Cat VI ancillary content) does NOT produce new entries — per D-CG21-9 each phenomenon entry carries own period_associations; the table is redundant with per-entity data.

D-CG21-18 (locked): Block 21 ship completes wood library content authoring at substrate/figure/cut granularity. Wood library state at Block 21 endpoint: 4 wood categories + 35 natural species + 12 nested subspecies + 5 engineered substrates + 25 cut/grain phenomena + 3 species refactored with first canonical bidirectional cut_specific_identifiers populations. Remaining wood-domain work: Blocks 22-26 wood evidence layer (woodEvidence.ts authoring from File A General Wood Use). After Block 26: maker marks library (Block 27+), four-file review libraries, HCL, then Phase 3 engine work.

**Workflow standards applied.** Pre-emptive schema discovery (B3): Op A-0/A-1 confirmed Block 16 + Block 20 schema state preserved; surfaced 4 small additive field additions at Op A-0a/b/c/d. Op A-2 confirmed CUT_GRAIN_PHENOMENA empty. Op A-3 confirmed Block 18-20 entry preservation including bullet survey on the 3 Block 18 species (Op C target; revealed 25 cut-related bullets vs plan-estimated 21 per D-CG21-6 reconciliation). Forbidden field check (B4): N/A. Referential integrity gate (B5): every applicable_species.species_id resolves to existing NATURAL_WOOD_SPECIES id (verified via tsx inline script); every applicable_substrates.substrate_id resolves to existing ENGINEERED_SUBSTRATES id; every Op C cut_phenomenon_id in oak_group/walnut_group/pine_group cut_specific_identifiers arrays resolves to newly-authored CUT_GRAIN_PHENOMENA id (verified). Family-stub-check (B9): N/A. Form-stub-check (B11): N/A. Content-ambiguity stop-and-surface: invoked at plan formation for 10 Op B decision points; resolved during authoring (Fiddleback fold, Vertical Grain Douglas Fir fold, Aromatic Cedar Panels drop, Ray Fleck/Quarter-Sawn kept separate per Path α, Chatoyance kept per Path α, Bear Claw Spruce description constructed minimally per Block 18 D-WS10 precedent, source-silent period_associations omitted per type-valid convention, no anti_classification_guidance on Burl or Quarter-Sawn). Bullet-count divergence between plan estimate and authoring reality (21 → 25 cut-related bullets across 3 species) reconciled in D-CG21-6 audit text.

**Final architectural state after this PR merges:**
- CUT_GRAIN_PHENOMENA.length === 25 (was 0)
- NATURAL_WOOD_SPECIES.length === 35 (unchanged structurally; 3 species entries refactored per Op C with cut_specific_identifiers populations totaling 4 entries pointing to 2 phenomenon ids)
- ENGINEERED_SUBSTRATES.length === 5 (unchanged from Block 20)
- WOOD_CATEGORIES.length === 4 (unchanged from Block 17)
- CutGrainPhenomenonEntry gains 4 small additive optional fields: period_associations?, regional_patterns?, anti_classification_guidance?, applicable_substrates? (reusing Block 18 + entryShape.ts interfaces; no new interfaces declared in Block 21)
- AntiClassificationGuidance, PeriodAssociation, RegionalPattern interfaces unchanged from Block 16/18 lockwork
- cut_specific_identifiers? field on WoodSpeciesEntry (line 268) — first canonical population (3 species; 4 cut_specific_identifiers entries pointing to flat_sawn and quarter_sawn phenomenon ids)
- File count in lib/constraints/ unchanged at 10
- Block 18 D-WS9 cut-prefix-flattening pattern superseded by Block 21 bidirectional pattern (D-CG21-6/D-CG21-15)
- Block 20 D-ES20-11 figure-variant deferred catalog: 5 substrate-subtypes DROPPED (D-CG21-3); Veneer Thickness Era Markers DECOMPOSED into 3 veneer_slicing entries (D-CG21-5); cross-substrate veneer-slicing phenomena routed to phenomenon entries with applicable_substrates populations (D-CG21-12).
- 18 audit decisions captured with new D-CG prefix.

---

### 2026-05-13 — Session 11 Block 22 — Wood Evidence Library Foundation (woodEvidence.ts scaffold-only per Block 16 mandate)

**Scope.** New library file `lib/constraints/woodEvidence.ts` created as scaffold-only per Block 16 D-WE-prefix pre-authored schema decisions (AUDIT_LOG.md:1314-1324 "Block 22 (pre-authored schema decisions)"). 6 interfaces declared (5 main entry types extending CanonicalEntry + 1 supporting WoodRegionalAssociation); 6 supporting type aliases and enums declared (WoodRegion, WoodSpeciesUsageRole, SubstrateUsageRole, CutGrainUsageRole, ReasoningRuleMigrationTarget, UsageIntensity); 5 empty exported arrays (SPECIES_EVIDENCE, SUBSTRATE_EVIDENCE, CUT_GRAIN_EVIDENCE, WOOD_DIAGNOSTIC_SIGNALS, WOOD_EVIDENCE_REASONING_RULES). Zero content entries; all 5 arrays ship empty. Type-only imports from `./entryShape` (CanonicalEntry, AntiClassificationGuidance) and `./woodIdentification` (PeriodAssociation). No modifications to existing libraries. NATURAL_WOOD_SPECIES (35), ENGINEERED_SUBSTRATES (5), WOOD_CATEGORIES (4), CUT_GRAIN_PHENOMENA (25) preserved unchanged from Block 21 endpoint. File count in lib/constraints/ increments from 10 to 11.

**Architectural decisions (locked).**

D-WE22-1 (locked): Regional enum architecture. Block 16 D-WE3 closed 6-value enum (`new_england | mid_atlantic | southern | midwest | appalachian | west_coast`) retained as WoodRegion type alias. Free-form `region_notes?: string` field added to WoodRegionalAssociation for File A granular sub-regions (Philadelphia, Newport, Grand Rapids, California Arts & Crafts, Pennsylvania, Gulf South, Cincinnati, etc.). Closed enum provides clean engine filter semantics; free-form notes preserve canonical specificity without enum churn or maintenance burden. Distinct from identification-side `RegionalPattern.region: string` (free-form because File B regional headers vary across state-level, multi-state, and factory-center named granularities). Migration to standalone regions.ts deferred until region-keyed patterns warrant first-class status.

D-WE22-2 (locked): WoodDiagnosticSignalEntry multi-FK shape per Block 16 D-WE5: parallel arrays. Field roster: `involved_species?: string[]`, `involved_substrates?: string[]`, `involved_phenomena?: string[]`, `involved_period_label?: string`. Alternative shapes considered: structured object (`involved_entities: { species_ids?: string[]; substrate_ids?: string[]; phenomenon_ids?: string[] }`) and polymorphic refs (`involved_entity_refs: { entity_type: string; entity_id: string }[]`). Parallel arrays chosen for TypeScript type safety (each array is typed string[] not polymorphic union), engine filter semantics (filter by individual axis trivial), and natural fit with File A signal composition (some signals reference 1 entity, some reference 3+; parallel optional arrays handle variance cleanly without forcing every signal to populate every axis).

D-WE22-3 (locked): Anti-classification placement: new `anti_classification_guidance?: AntiClassificationGuidance | AntiClassificationGuidance[]` field on WoodSpeciesEvidenceEntry. Single-or-array shape per Block 20 D-ES20-6 / Block 21 D-CG21-11 precedent. Block 19 D-WS19-11 tropical species CITES anti-classification (Brazilian Rosewood Dalbergia nigra CITES Appendix I 1992; Cuban Mahogany trade restrictions; ebony trade restrictions) routes here in Block 23. Architectural reasoning: trade restrictions are evidence-layer content (they condition what woods can plausibly appear in claimed-period furniture, conditioning evidence weighting), not identification-side content (visual identification of the wood is unaffected by trade restrictions). Identification-side WoodSpeciesEntry.anti_classification_guidance (Block 16 D-WI8) remains for chronological-emergence/extinction semantics specific to identification context; evidence-side captures trade-restriction-as-evidence-weighting at the appropriate layer.

D-WE22-4 (locked): Migration target schema per Block 16 D-WE8: enum-only. `migration_target: "weighting_file" | "engine_reasoning" | "report_layer"`. No `target_file_path` field on WoodEvidenceReasoningRule. Architectural reasoning: file paths drift; semantic categories don't. When weightingTable.ts / engineReasoning files / report-layer files actually exist, a future block can add specific path metadata if needed. Schema is robust to file path drift.

D-WE22-5 (locked): Decision-prefix convention: block-scoped `D-WE22-N` for Block 22 plan-time decisions. Distinct from Block 16's pre-authored D-WE1-D-WE8 (preserved as original numbers, referenced in interface docstrings throughout woodEvidence.ts). Matches Block 20 D-ES20-N / Block 21 D-CG21-N block-scoped precedent. Honest naming for when decisions were authored vs deferred from earlier blocks. Future blocks continuing wood-evidence work (Blocks 23-26) use block-scoped prefixes (D-WE23-N, D-WE24-N, D-WE25-N, D-WE26-N).

D-WE22-6 (locked): Usage role and intensity as evidence-specific entry fields. PeriodAssociation interface (woodIdentification.ts:109-125) stays pure as period-encoding (reused without modification per Block 16 D-WE2 mandate; already exercised across 6 contexts in Blocks 18-21). Evidence semantic enrichment lives at entry level via `usage_role` field (broad closed enum per D-WE22-9 — WoodSpeciesUsageRole, SubstrateUsageRole, or CutGrainUsageRole depending on entry type) + free-form `usage_role_notes?: string`. WoodRegionalAssociation carries optional `usage_intensity` field (dominant | common | occasional | rare) separately. Architectural reasoning: modifying PeriodAssociation for evidence-side semantics would create cross-library coupling (PeriodAssociation is shared between identification and evidence layers); entry-level usage encoding preserves clean shared period interface.

D-WE22-7 (locked): V-K Veneer Substrates routing (Block 21 D-CG21-4 deferral): routes through WoodDiagnosticSignalEntry multi-FK pattern (`involved_phenomena` + `involved_substrates` + `involved_period_label`). V-K File B content (Bookmatched/Slip-Matched/Radial Veneers veneer-substrate descriptions; multi-era backing-material content spanning hand-sawn solid lumber 1700-1850 → lumber-core 1850-1930 → plywood-core 1905+ → MDF/particleboard-core 1970+) is composed evidence (veneer-cut + substrate + era); WoodDiagnosticSignalEntry is designed for exactly this kind of cross-cutting multi-FK pattern. Avoids entity proliferation (no need for new VeneerBackingRelationshipEntry type). Block 24 authoring populates these signals.

D-WE22-8 (locked): Position-on-piece architecture DEFERRED. Block 20 D-ES20-13 "Secondary Woods Often Carry Higher Dating Authority" framing requires position-on-piece schema layer (drawer_bottom / drawer_side / interior_framing / underside / backboard locations as authority-weighting context); Block 22 does NOT include position-on-piece architecture. Architectural reasoning: position-on-piece is cross-cutting (wood, joinery, fasteners, hardware, upholstery all have position semantics); designing from wood-only perspective without canonical sources for joinery/fasteners/hardware/upholstery risks cross-library drift (Block 20 lesson on plan-time schema-state verification). Dedicated architecture block authored before Block 23 content authoring begins; informal name "Block 22.5" or named at scheduling time. Block 22 stays clean as woodEvidence.ts scaffold per Block 16 explicit scaffold-only mandate.

D-WE22-9 (locked): UsageRole enum shape: broad closed per-entry-type enums + free-form `usage_role_notes?: string`. Three separate per-entry-type enums (NOT unified WoodUsageRole) because per-entity usage roles differ semantically. WoodSpeciesUsageRole (6 values): `primary_show_wood | secondary_structural | secondary_internal | veneer | decorative_accent | specialized_use`. SubstrateUsageRole (5 values): `case_back | drawer_bottoms | veneer_substrate | carcass_panel | specialized_use`. CutGrainUsageRole (5 values): `veneer_face | inlay_or_banding | premium_solid | decorative_accent | specialized_use`. Species roles describe show-vs-secondary positioning; substrate roles describe carcass-vs-back-vs-veneer-base positioning; cut/grain roles describe veneer-face-vs-inlay-vs-premium-solid positioning. Free-form notes capture canonical specificity ("Federal regional alternative in rural New England"; "drawer side substitute imitating mahogany"; "musical instrument grade") without enum proliferation. Alternative considered (comprehensive 16-value unified enum); rejected as overly granular for engine filter semantics while losing per-entity-type clarity.

D-WE22-10 (locked): Diagnostic caution text + anti-classification dual-field pattern. Both `diagnostic_caution_text?: string` (prose-rich appraiser-knowledge framing) AND `anti_classification_guidance?` (structured chronological boundary semantics) on WoodSpeciesEvidenceEntry; `diagnostic_caution_text?` also on SubstrateEvidenceEntry and CutGrainEvidenceEntry. File A's "Notes / Diagnostic Caution" column on Primary Furniture Woods by General Use table is prose-rich appraiser knowledge (e.g., "Oak is diagnostically strongest when paired with construction evidence: early joined oak, quarter-sawn Golden Oak, Mission/Arts & Crafts, or revival oak") that doesn't fit chronological-boundary shape but IS canonical evidence-weighting context. Different semantic purposes: caution prose for appraiser-knowledge framing; anti-classification for sharp boundaries (CITES dates, etc.). Both fields preserve canonical content shape and engine-reasoning utility. Single-source extraction at Block 23 authoring may populate either field, both fields, or neither depending on File A content shape per source-document-inline + appraiser-honest discipline.

D-WE22-11 (locked): Authority calibration locked per Block 16 D-WE1 lockwork. WoodSpeciesEvidenceEntry 6/6 (structurally encodes "wood alone never dates furniture" at weight layer — see WoodEvidenceReasoningRule for canonical meta-rule encoding); SubstrateEvidenceEntry 8/8 (technology-anchored adoption curves with sharp chronological floors); CutGrainEvidenceEntry 7/7 (composed cut+species patterns stronger than species alone, weaker than substrate adoption curves); WoodDiagnosticSignalEntry 7/7 (composed multi-entity signals; calibrated equivalent to cut/grain evidence); WoodEvidenceReasoningRule 9/9 (meta-rules condition all other weighting; highest authority in wood evidence library). Asymmetric 6-9 spread vs identification-side's 7-8 spread is deliberate architectural signal: evidence library calibrates wider range to reflect meta-rule supremacy (9/9) and species evidence appropriate de-rating (6/6 acknowledging "wood alone never dates furniture" structural encoding). Authority weights enforced at Block 23-26 authoring time per per-entry-type calibration.

D-WE22-12 (locked): Block 22 scaffold-only ship per Block 16 mandate. Five empty arrays exported; zero content authoring. Blocks 23-26 author content from File A: Block 23 SPECIES_EVIDENCE + SUBSTRATE_EVIDENCE (Primary Furniture Woods by General Use table + per-substrate evidence + tropical species CITES anti-classification per D-WS19-11); Block 24 CUT_GRAIN_EVIDENCE + WOOD_DIAGNOSTIC_SIGNALS (Key Chronological Wood Signals table + V-K Veneer Substrates composed signals per D-CG21-4 / D-WE22-7); Block 25 period × wood + revival × wood content (folds into SPECIES_EVIDENCE primarily; possible additional WoodDiagnosticSignalEntry entries); Block 26 WOOD_EVIDENCE_REASONING_RULES (Important Caveat + Hidden Secondary Woods by Era + File B Cat VI Critical Diagnostic Principles per D-CG21-17 routing) + integration verification. Sequencing flexible per content-authoring discovery; Block 26 specifically authors the meta-rules entries that complete the wood-evidence library.

**Workflow standards applied.** Pre-emptive schema discovery (B3): Op A-1 confirmed CanonicalEntry (entryShape.ts:8-20), AntiClassificationGuidance (entryShape.ts:39-67), and PeriodAssociation (woodIdentification.ts:109-125) field rosters match Block 16 + Block 18 + Block 20 lockwork. Op A-2 confirmed woodEvidence.ts absent prior to Block 22. Op A-3 confirmed Block 17-21 entry counts preserved (NATURAL_WOOD_SPECIES 35, WOOD_CATEGORIES 4, ENGINEERED_SUBSTRATES 5, CUT_GRAIN_PHENOMENA 25). Op A-4 confirmed file count baseline 10. Forbidden field check (B4): N/A (no spatialBehaviors edits; no modifications to existing libraries). Referential integrity gate (B5): N/A at Block 22 scaffold (no content entries; no FK references populated). Family-stub-check (B9): N/A. Form-stub-check (B11): N/A. Content-ambiguity stop-and-surface: invoked at plan formation for 8 Block 22 architectural decisions (regional enum, multi-FK shape, anti-classification placement, migration target schema, decision prefix, usage role placement, V-K routing, position-on-piece deferral) plus 2 roster decisions (UsageRole enum shape, dual diagnostic-context fields); all resolved at plan time before authoring. Block 22 ships cleanly with no stop-and-surface moments at execution time.

**Final architectural state after this PR merges:**
- `lib/constraints/woodEvidence.ts` exists (~370 lines: module docstring + imports + 6 supporting types + 6 interfaces + 5 empty arrays + per-interface and per-array docstrings).
- 6 interfaces declared: WoodSpeciesEvidenceEntry (authority 6/6), SubstrateEvidenceEntry (8/8), CutGrainEvidenceEntry (7/7), WoodDiagnosticSignalEntry (7/7), WoodEvidenceReasoningRule (9/9) — all 5 main entry types extend CanonicalEntry; plus WoodRegionalAssociation supporting interface (does not extend CanonicalEntry).
- 6 supporting type aliases / enums declared: WoodRegion, WoodSpeciesUsageRole, SubstrateUsageRole, CutGrainUsageRole, ReasoningRuleMigrationTarget, UsageIntensity.
- 5 exported arrays, all empty (length === 0): SPECIES_EVIDENCE, SUBSTRATE_EVIDENCE, CUT_GRAIN_EVIDENCE, WOOD_DIAGNOSTIC_SIGNALS, WOOD_EVIDENCE_REASONING_RULES.
- Type-only imports from `./entryShape` (CanonicalEntry, AntiClassificationGuidance) and `./woodIdentification` (PeriodAssociation).
- NATURAL_WOOD_SPECIES (35), ENGINEERED_SUBSTRATES (5), WOOD_CATEGORIES (4), CUT_GRAIN_PHENOMENA (25) unchanged.
- `lib/constraints/woodIdentification.ts` and `lib/constraints/entryShape.ts` unchanged.
- File count in `lib/constraints/` 11 (was 10; +1 woodEvidence.ts).
- 12 audit decisions captured under D-WE22-N block-scoped prefix.
- Block 16 D-WE1-D-WE8 pre-authored lockwork honored across all 6 interface designs and authority calibrations.
- Wood evidence library content authoring sequenced for Blocks 23-26.

---

### 2026-05-13 — Session 11 Block 22.5 — Position-on-Piece Architecture (entryShape.ts shared interface)

**Scope.** New shared field-type interface `PositionOnPiece` declared in `lib/constraints/entryShape.ts`, plus 5 supporting closed enums (`PhysicalLocation` 34 values; `FunctionalRole` 10 values; `PositionProvenance` 8 values; `ConsistencyPattern` 5 values; `TemporalLayer` 7 values). Module docstring extended to acknowledge file hosts both (a) canonical entry base shape (CanonicalEntry) and (b) shared field-type interfaces consumed across libraries (AntiClassificationGuidance, PositionOnPiece). Architecture-only block per D-PA-10 — no content authoring; no woodEvidence.ts modifications; no other library files touched. Consumption of PositionOnPiece on woodEvidence.ts evidence entries deferred to Block 23 content authoring per Block 22 D-WE22-8 deferral framing. Block 17-22 entry counts preserved unchanged across this PR.

**Architectural decisions (locked).**

D-PA-1 (locked): Six-dimensional PositionOnPiece interface architecture grounded in cross-source triangulation across all 5 evidence-layer canonical documents (File A General Wood Use in Furniture; Fastener_Reference; Furniture_Hardware_Identification_System; JOINERY_IDENTIFICATION_MASTER_BREAKDOWN; American_Furniture_Textile_Reference). Six dimensions: physical_location, functional_role, provenance, position_context_evidence, consistency_pattern, temporal_layer. Independent dimensions; orthogonal semantics; flat interface composition (Shape A per session triangulation). Cross-source framing convergence: every evidence-layer source carries a "this layer alone never dates furniture" caveat in its own words (Wood File A "Wood alone should NEVER date furniture"; Fastener Reference "Fasteners must always be evaluated alongside construction methods, tool marks..."; Hardware Reference "Hardware is secondary evidence, not primary dating evidence"; Joinery Reference "DO NOT DATE FROM ONE JOINT ALONE"; Textile Reference "For dating, do not let fabric style alone control the conclusion"). Five independent sources, fully convergent on the Independent Layer Evaluation Standard (Session 9 Block 21 D-CG21-2/D-CG21-17). PositionOnPiece serves the within-layer position semantics that each evidence layer carries; the Standard governs cross-layer integration where position-evaluated evidence converges.

D-PA-2 (locked): physical_location is REQUIRED; other five dimensions are OPTIONAL. Semantic argument: every PositionOnPiece instantiation has a location (that's what makes it a position). Other dimensions are commentary on the location. Forcing the required field surfaces honest data instead of letting it default to undefined.

D-PA-3 (locked): PositionOnPiece lives in entryShape.ts per shared-field-type-interface precedent (AntiClassificationGuidance relocated to entryShape.ts in Block 16 D-WI9 for cross-library reuse). Cross-library consumers: woodEvidence.ts (Block 23+), future fastenerEvidence.ts, hardwareEvidence.ts, joineryEvidence.ts, textileEvidence.ts. Single import path `./entryShape` parallel to CanonicalEntry and AntiClassificationGuidance. Migration to dedicated positions.ts deferred unless position semantics grow beyond single interface + 5 enums. File size post-Block-22.5: ~347 lines (was 67 at Block 22 endpoint); manageable single-file scope.

D-PA-4 (locked): entryShape.ts module docstring extended to acknowledge file hosts both (a) CanonicalEntry-as-base-entry-shape AND (b) shared field-type interfaces consumed across libraries (AntiClassificationGuidance, PositionOnPiece). Block 16 D-WI9 relocation implicitly established this dual-purpose pattern; Block 22.5 makes it explicit at module-docstring level. Per Claude Code pre-flight inspection recommendation acknowledging the previously-implicit dual-purpose framing.

D-PA-5 (locked): PhysicalLocation closed 34-value enum. Coverage verified for all D-WE22-8 / D-ES20-13 routing targets (drawer_bottom, drawer_side, case_interior_framing, underside, backboard) — Op A-2 coverage gate satisfied. Comprehensive coverage of canonical sources across 8 location categories: case construction (7 values: case_carcass, case_back, case_panel, case_corner, case_top, case_bottom, case_interior_framing); drawer construction (5 values: drawer_front, drawer_side, drawer_back, drawer_bottom, drawer_runner); frame and structural (4 values: frame_joint, frame_rail, frame_stile, structural_reinforcement); surface and visible (3 values: show_surface, trim_or_molding, edge_or_corner_protection); base (3 values: foot_or_leg, base_or_plinth, underside); movable components (3 values: door_panel, lid_or_top_movable, movable_hardware_attachment); upholstery (6 values: upholstery_seat, upholstery_back, upholstery_arm, upholstery_support_layer, upholstery_attachment_point, upholstery_dust_cover); specialty (3 values: veneer_face, veneer_backing, backboard). Granularity calibrated to canonical-source distinctions; each value traces to specific source framing (see Part 2 implementation reference for per-value canonical-source tracing). `physical_location_notes?: string` free-form supplement per Claude Code recommendation + Block 22 D-WE22-1 precedent captures canonical specificity beyond enum (skirt-pleat-attachment, drawer-divider-mounting, etc.). No location_category companion field — flat enum preserved per Mike's session lean; functional_role dimension does tier-1 abstraction work (hidden_interior vs exposed_surface vs structural_load_bearing), avoiding drift risk between two abstraction layers.

D-PA-6 (locked): FunctionalRole closed 10-value enum: structural_load_bearing, structural_assembly, decorative_only, functional_non_structural, hidden_interior, exposed_surface, movement_assistance, security, fabric_retention, specialized_function. Coverage rationale: structural integration tier (load_bearing vs assembly) + visibility/access tier (hidden_interior vs exposed_surface) + functional category tier (decorative vs movement vs security vs fabric_retention) + escape hatch (specialized_function). Canonical-source support: Fastener Reference structural-vs-decorative framing; Hardware Reference Pull/Hinge/Lock/Caster functional categories; Joinery Reference category descriptions; Textile Reference support-layer vs visible-cover framing. Boundary with PhysicalLocation: physical_location names WHERE (e.g., "drawer_bottom"); functional_role names what role (e.g., "hidden_interior" or "structural_assembly"). Never collapse into a single field per D-PA-1 dimension-boundary lockwork.

D-PA-7 (locked): PositionProvenance closed 8-value enum: original_to_construction, factory_assembly_original, site_assembly_original, upholstery_campaign_introduced, repair_introduced, restoration_introduced, replacement, unknown_provenance. Canonical-source support: Hardware Reference "Hardware is secondary evidence... originality assessment is critical"; Fastener Reference "Replacement Fastener Risk" + "Restoration Contamination"; Joinery Reference "RESTORATION FALSE SIGNALS" + "Always determine: original joinery vs repair joinery"; Textile Reference Core Rule (frame_construction vs original_upholstery vs later_reupholstery temporal layers). factory_assembly_original vs site_assembly_original distinction handles modern knock-down furniture per Fastener Reference Category 5. unknown_provenance required value for appraiser-honest discipline when provenance is uncertain.

D-PA-8 (locked): ConsistencyPattern closed 5-value enum: repeated_consistently_across_piece, isolated_example, mixed_period_set, partial_pattern, single_observation_no_pattern_assessment. Canonical-source support: Fastener Reference "repeated consistently throughout the piece" as strength signal; Hardware Reference "Mixed-period hardware sets" as weak indicator; Joinery Reference "DO NOT DATE FROM ONE JOINT ALONE" + multi-position joinery type cross-referencing; Textile Reference "A frame with several generations of tack holes suggests repeated reupholstery." Closed enum supports engine reasoning filter semantics for consistency analysis. single_observation_no_pattern_assessment required value for appraiser-honest discipline when sample is insufficient.

D-PA-9 (locked): TemporalLayer closed 7-value enum: frame_construction, original_upholstery, later_reupholstery, current_visible_cover, repair_or_restoration, replacement_post_construction, unknown_layer. Anchored primarily in Textile Reference Core Rule four-layer framing (frame_construction / original_upholstery / later_reupholstery / current_visible_cover); extensions cover repair, restoration, and replacement timing from Fastener + Hardware + Joinery sources. The temporal layering dimension is the architecturally newest dimension — explicit only in Textile Reference; implicit in other sources through "originality assessment" framings. PositionOnPiece captures this dimension to support multi-temporal-layer reasoning per the Textile Reference Core Rule: "A chair frame may be 1880s, the springs may be 1920s replacement, the foam may be 1970s, and the visible fabric may be 2020s. The goal is to separate Frame date / Original upholstery system date / Later reupholstery date / Current visible cover date." unknown_layer required value for appraiser-honest discipline when temporal layer is uncertain.

D-PA-10 (locked): Block 22.5 scope: architecture-only. entryShape.ts modified (PositionOnPiece interface + 5 enums + module docstring extension; 67 lines → 347 lines); AUDIT_LOG.md modified. NO woodEvidence.ts modifications (byte-for-byte unchanged from Block 22 endpoint). NO other library files touched. NO content authoring. Consumption of PositionOnPiece on WoodSpeciesEvidenceEntry / SubstrateEvidenceEntry / CutGrainEvidenceEntry / WoodDiagnosticSignalEntry happens at Block 23 content authoring time per Block 22 D-WE22-8 deferral framing. Future evidence libraries (fastenerEvidence.ts, hardwareEvidence.ts, joineryEvidence.ts, textileEvidence.ts) consume PositionOnPiece at their respective foundation-block time. position_context_evidence (PositionOnPiece prose array) vs diagnostic_caution_text (Block 22 D-WE22-10 prose string) boundary clarified in PositionOnPiece interface docstring: position_context_evidence = evidence specifically about the position observation (shadow consistency, ghost holes, finish continuity at THIS position); diagnostic_caution_text = appraiser-knowledge framing about the entity in general unrelated to specific position.

**Workflow standards applied.** Pre-emptive schema discovery (B3): Op A-1 confirmed CanonicalEntry (entryShape.ts:8-20 pre-Block-22.5; shifts to lines 29-41 post-Block-22.5 due to module docstring extension) and AntiClassificationGuidance (entryShape.ts:39-67 pre-Block-22.5; shifts to lines 60-88 post-Block-22.5) field rosters preserved unchanged in content. Op A-2 routing coverage gate confirmed all 5 D-WE22-8 / D-ES20-13 routing targets (drawer_bottom, drawer_side, case_interior_framing, underside, backboard) present in PhysicalLocation enum. Op A-3 confirmed Block 17-22 entry counts unchanged (NATURAL_WOOD_SPECIES 35, WOOD_CATEGORIES 4, ENGINEERED_SUBSTRATES 5, CUT_GRAIN_PHENOMENA 25, all 5 evidence arrays length 0). File count baseline 11 confirmed unchanged. Forbidden field check (B4): N/A (no spatialBehaviors edits). Referential integrity gate (B5): N/A at Block 22.5 scaffold (no content entries; no FK references populated). Family-stub-check (B9): N/A. Form-stub-check (B11): N/A. Content-ambiguity stop-and-surface: invoked at plan formation for 10 Block 22.5 architectural decisions (Shape A flat vs grouped; entryShape.ts vs positions.ts home; physical_location_notes free-form supplement; no location_category companion; PhysicalLocation 34-value enum coverage; FunctionalRole 10-value enum coverage; PositionProvenance 8-value enum coverage; ConsistencyPattern 5-value enum coverage; TemporalLayer 7-value enum coverage; architecture-only scope); all resolved at plan time before authoring. Block 22.5 shipped cleanly with zero stop-and-surface moments at execution time.

**Final architectural state after this PR merges:**
- `lib/constraints/entryShape.ts` modified; 347 lines (was 67); PositionOnPiece interface + 5 supporting enums added; module docstring extended to acknowledge dual-purpose file scope (CanonicalEntry base + shared field-type interfaces).
- 5 new closed enums declared: PhysicalLocation (34 values), FunctionalRole (10 values), PositionProvenance (8 values), ConsistencyPattern (5 values), TemporalLayer (7 values) = 64 enum values total.
- 1 new shared interface declared: PositionOnPiece (8 fields: physical_location required, physical_location_notes?, functional_role?, provenance?, position_context_evidence?, consistency_pattern?, temporal_layer?, notes? — all optional except physical_location per D-PA-2).
- `lib/constraints/woodEvidence.ts` unchanged byte-for-byte from Block 22 endpoint.
- `lib/constraints/woodIdentification.ts` unchanged.
- All other library files unchanged.
- File count in `lib/constraints/` unchanged at 11.
- Block 17-22 entry counts unchanged: NATURAL_WOOD_SPECIES 35, WOOD_CATEGORIES 4, ENGINEERED_SUBSTRATES 5, CUT_GRAIN_PHENOMENA 25, all 5 evidence arrays length 0.
- 10 audit decisions captured under D-PA-N prefix (no block number per informal "Block 22.5" naming).
- Cross-library foundation laid for evidence-layer position-on-piece semantics. Block 23 (SPECIES_EVIDENCE + SUBSTRATE_EVIDENCE content authoring) consumes PositionOnPiece on relevant entries per content-authoring discovery.

---

### 2026-05-13 — Session 11 Block 23a — SPECIES_EVIDENCE Content Authoring (File A primary; 26 entries; first canonical exercise of woodEvidence.ts content)

**Scope.** SPECIES_EVIDENCE array in `lib/constraints/woodEvidence.ts` populated with 26 canonical WoodSpeciesEvidenceEntry entries from File A "General Wood Use in Furniture" primary content. Schema field `position_on_piece?: PositionOnPiece[]` added to WoodSpeciesEvidenceEntry interface as first canonical consumption of Block 22.5 PositionOnPiece architecture per Block 22 D-WE22-8 deferral framing. Type-only PositionOnPiece import added to woodEvidence.ts. **First canonical exercise of woodEvidence.ts content authoring.** SUBSTRATE_EVIDENCE + tropical species CITES anti_classification_guidance content + Cuban Mahogany subspecies entry DEFERRED to Block 23b per Mike's session scope split + D-WS19-11 routing. Block 17-22.5 entry counts preserved unchanged.

**Architectural decisions (locked).**

D-WE23a-1 (locked): Scope locking. Single Block 23a with mid-authoring split escape hatch if scope exceeds 50 entries. Final count: 26 entries (20 species + 6 subspecies). Cat I Ring-Porous (4 entries: oak_group + white_oak + ash + elm); Cat II Diffuse-Porous + Cat V naturals (11 entries: walnut_group + black_walnut + cherry_group + maple_group + hard_maple_sugar_maple + mahogany_group + birch_group + beech_group + poplar_group + gumwood_group + basswood); Cat III Softwoods (6 entries: pine_group + eastern_white_pine + southern_yellow_pine + cedar_group + eastern_red_cedar + redwood); Cat IV Tropicals (5 entries: rosewood_group + ebony_group + satinwood_group + zebrawood + teak). Split escape hatch did NOT trigger; single-block ship.

D-WE23a-2 (locked): Pairings symmetry rule. Strict bidirectional `typical_secondary_pairings` symmetry per Block 16 D-WE6 "Manually authored on both sides; no auto-mirror schema." Op G verified zero symmetry violations across Block 23a's 3 authored pairings: walnut_group ↔ poplar_group; oak_group ↔ poplar_group; mahogany_group ↔ pine_group. 5+ primary exception framework remains available (when a species' inverse-index reaches 5+ primaries, capture broader-secondary framing via `diagnostic_caution_text` + Block 26 ReasoningRule); **NOT exercised in Block 23a** because poplar's File A Section 6 inverse-index is only 2 primaries (walnut + oak), pine's is 1 primary (mahogany), birch's is 0 explicit pairings.

D-WE23a-3 (locked): PositionOnPiece consumption discipline. Populate `position_on_piece?: PositionOnPiece[]` ONLY on species where File A Section 6 "Hidden Secondary Woods by Era" surfaces explicit position-evidence content. 5 species entries populated (oak_group, walnut_group, mahogany_group, poplar_group, pine_group); 21 entries omit field per discipline. Total: 10 position annotations across 5 entries (oak 1 case_interior_framing; walnut 1 drawer_side; mahogany 3 case_back/case_bottom/drawer_bottom; poplar 2 drawer_side/case_interior_framing; pine 3 case_back/case_bottom/drawer_bottom). All physical_location values are Block 22.5 D-PA-5 PhysicalLocation enum members covered under D-WE22-8/D-ES20-13 routing target verification. First canonical consumption of PositionOnPiece per Block 22 D-WE22-8 deferral resolution.

D-WE23a-4 (locked): style_wave_associations canonical 15-tag set. Locked at plan time per D-WE7 string-tag-pending-styleFamilies.ts framing: `colonial | william_and_mary | queen_anne | chippendale | federal_hepplewhite_sheraton | american_empire | rococo_revival | renaissance_revival | eastlake_aesthetic | golden_oak | mission_arts_and_crafts | colonial_revival | art_deco | mid_century_modern | contemporary`. All 15 tags referenced across 26 entries; Op G verified zero off-list tags. Snake-case descriptive convention; FK-migration ready for styleFamilies.ts when authored (Phase 2 Session 9 per project synthesis).

D-WE23a-5 (locked): Species not in File A — skip-no-entry per appraiser-honest discipline + canonical-source-authority standard. 14 species skip (Cat III softwoods: douglas_fir, cypress, spruce, hemlock, juniper_cedar_like_softwoods; Cat IV tropicals: tulipwood, kingwood, padauk, purpleheart, olivewood, lauan_philippine_mahogany; Cat II/V: sycamore_group, aspen, cottonwood). File A coverage verified at Op A-2: 14 absent from Section 2 Primary Furniture Woods table AND Section 3 Chronological Breakdown explicit mentions. Absence is information — Block 26 WoodEvidenceReasoningRule eventual capture frames the "less-canonical-species absence" diagnostic context.

D-WE23a-6 (locked): Subspecies_id D-WE4 trigger rule — author subspecies entries only when File A explicitly distinguishes subspecies-level content from parent species. 6 subspecies entries authored: white_oak (Mission/Golden Oak quarter-sawn dominance signature per File A Section 3); black_walnut (Victorian carved + MCM veneer dominance per File A Section 2 Walnut notes); eastern_white_pine (New England colonial casework primary per File A Section 2 Pine + Section 4); southern_yellow_pine (Southern States primary per File A Section 4); eastern_red_cedar (cedar chest panel specialty per File A Section 2 Cedar); hard_maple_sugar_maple (Shaker work surfaces + MCM figured veneers per File A Section 2 Maple notes). Other subspecies (red_oak, soft_maple, honduran_mahogany, brazilian_rosewood) folded into parent species entries per D-WE4 authoring rule. Cuban Mahogany subspecies entry DEFERRED to Block 23b per D-WE23a-10 (paired with CITES anti-classification).

D-WE23a-7 (locked): Op A-2 coverage gate. Pre-authoring verification that File A provides minimum content per candidate entry: at least one period_associations band + at least one regional_associations entry + usage_role determinable. All 26 candidates pre-verified pass per Part 3 cross-entry verification against Part 2 File A inline canonical content. Op A-2 confirmed at execution time; all 26 entries shipped with required fields populated.

D-WE23a-8 (locked): Schema field addition. `position_on_piece?: PositionOnPiece[]` added to WoodSpeciesEvidenceEntry interface in `lib/constraints/woodEvidence.ts` as first canonical exercise of Block 22.5 PositionOnPiece architecture per Block 22 D-WE22-8 deferral resolution. Type-only `import type { PositionOnPiece } from "./entryShape"` added to woodEvidence.ts imports section. Field positioned after `anti_classification_guidance?` and before `diagnostic_caution_text?` per logical grouping. Per-field JSDoc cross-references Block 22.5 D-PA-1 + Block 22 D-WE22-8 + Block 23a D-WE23a-3 consumption discipline. Optional field per D-WE23a-3 selective population rule.

D-WE23a-9 (locked): Palisander handling. Palisander content folds into `wood_species_evidence_rosewood_group` entry's `diagnostic_caution_text` per Mike's appraiser-practice lock. No standalone palisander SPECIES_EVIDENCE entry exists. Canonical anchor: File A Section 2 Rosewood "commercial 'rosewood' names can cover several species, including palisander-type trade usage." Palisander remains identification-only (Block 19 wood_species_palisander entry in NATURAL_WOOD_SPECIES); evidence-layer content rolls up into the rosewood_group framing.

D-WE23a-10 (locked): Cuban mahogany routing. `wood_subspecies_cuban_mahogany` SPECIES_EVIDENCE entry DEFERRED to Block 23b — paired with Cuban Mahogany CITES anti_classification_guidance content per Block 19 D-WS19-11 routing. Block 23a does NOT author Cuban mahogany subspecies entry. `wood_species_evidence_mahogany_group` entry's `diagnostic_caution_text` references the routing: "Subspecies-level CITES content for Cuban Mahogany (Swietenia mahagoni) routes to Block 23b per D-WS19-11/D-WE23a-10." Brazilian Rosewood (Dalbergia nigra) and ebony CITES content similarly deferred to Block 23b; rosewood_group and ebony_group entries' diagnostic_caution_text reference the Block 23b routing.

D-WE23a-11 (locked): First canonical exercise of woodEvidence.ts content authoring. Establishes per-entry authoring conventions for Blocks 23b-26: source-document-inline standard (canonical sources inline in plan submission Part 2); canonical-source-authority (File A primary; File B residual fills gaps); appraiser-honest calibration (schema-compliant empty values for source-silent fields; no fabrication); authority calibration locked at 6/6 per D-WE22-11 for all WoodSpeciesEvidenceEntry entries; per-entry source mapping in plan submission Part 3 provides field-by-field tracing. Conventions established here apply to Block 23b (SUBSTRATE_EVIDENCE + tropical CITES), Block 24 (CUT_GRAIN_EVIDENCE + WOOD_DIAGNOSTIC_SIGNALS), Block 25 (period × wood + revival × wood extensions), Block 26 (WOOD_EVIDENCE_REASONING_RULES + integration verification).

D-WE23a-12 (locked): 26 SPECIES_EVIDENCE entries authored; final entry count locked. Distribution: 4 Cat I Ring-Porous + 11 Cat II Diffuse-Porous and Cat V naturals + 6 Cat III Softwoods + 5 Cat IV Tropicals = 26. SPECIES_EVIDENCE.length === 26 post-merge. Density: 26 entries carry ~71 PeriodAssociation array entries + ~42 WoodRegionalAssociation array entries; 5 entries carry 10 PositionOnPiece annotations total; 12 entries carry typical_secondary_pairings populations (3 bidirectional pairs spanning 5 species: walnut↔poplar, oak↔poplar, mahogany↔pine); 25 entries carry style_wave_associations from canonical 15-tag set; all 26 entries carry diagnostic_caution_text prose; 0 entries carry anti_classification_guidance (Block 23b deferred).

**Reserved slots D-WE23a-13, D-WE23a-14** for plan-write surfacing or mid-authoring decision capture — not exercised in Block 23a (zero stop-and-surface moments at execution time; all decisions pre-locked at plan time).

**Workflow standards applied.** Pre-emptive schema discovery (B3): Op A-1 confirmed WoodSpeciesEvidenceEntry interface roster + WoodRegionalAssociation + WoodSpeciesUsageRole + PositionOnPiece + PeriodAssociation match Block 22 / Block 22.5 / Block 18 lockwork. Op A-2 coverage gate pre-verified all 26 candidates against File A Part 2 inline content. Op A-3 confirmed Block 17-22.5 entry counts preserved (35, 4, 5, 25, all evidence arrays 0). Op A-4 FK target verification: all 20 species_id values + 6 subspecies_id values resolved. Forbidden field check (B4): N/A. Referential integrity gate (B5): every species_id FK resolves to NATURAL_WOOD_SPECIES.id; every subspecies_id FK resolves to nested WoodSubspecies.id; every position_on_piece.physical_location value is Block 22.5 D-PA-5 PhysicalLocation enum member. Family-stub-check (B9): N/A. Form-stub-check (B11): N/A. Source-document-inline standard: File A inline per plan submission Part 2; per-entry source mapping per Part 3. Canonical-source-authority standard: File A authoritative; File B residual deferred to Block 23b/24 where surfaces. Appraiser-honest calibration: 14 species skip-no-entry per D-WE23a-5; palisander folding per D-WE23a-9; Cuban mahogany subspecies deferral per D-WE23a-10. Content-ambiguity stop-and-surface: zero moments invoked at execution time — all 10 plan-time decisions pre-locked across Parts 1/2/3 of plan submission.

**Final architectural state after this PR merges:**
- `lib/constraints/woodEvidence.ts` modified: 1315 lines (was 550 at Block 22 endpoint; +765 lines from schema field addition + 26 SPECIES_EVIDENCE entries).
- WoodSpeciesEvidenceEntry interface has 10 declared fields (added `position_on_piece?: PositionOnPiece[]` per D-WE23a-8).
- `import type { PositionOnPiece } from "./entryShape"` added to woodEvidence.ts imports (Op B-1).
- `SPECIES_EVIDENCE.length === 26` (was 0); first canonical population of woodEvidence.ts content arrays.
- All 26 entries authority 6/6 per D-WE22-11.
- Block 22.5 PositionOnPiece architecture first canonically consumed: 5 entries populate `position_on_piece` field with 10 total annotations across the 5 entries.
- `typical_secondary_pairings` bidirectional symmetry: 3 reciprocal pairings (walnut↔poplar, oak↔poplar, mahogany↔pine); zero symmetry violations.
- style_wave_associations: all 15 canonical tags exercised; zero off-list values.
- anti_classification_guidance: zero populations (Block 23b tropical CITES deferred per D-WE23a-10).
- `lib/constraints/entryShape.ts` and `lib/constraints/woodIdentification.ts` byte-for-byte unchanged.
- File count in `lib/constraints/` unchanged at 11.
- Block 17-22.5 entry counts unchanged: NATURAL_WOOD_SPECIES 35, WOOD_CATEGORIES 4, ENGINEERED_SUBSTRATES 5, CUT_GRAIN_PHENOMENA 25, SUBSTRATE_EVIDENCE 0, CUT_GRAIN_EVIDENCE 0, WOOD_DIAGNOSTIC_SIGNALS 0, WOOD_EVIDENCE_REASONING_RULES 0.
- 12 audit decisions captured under D-WE23a-N block-scoped prefix; 2 reserved slots not exercised.
- Per-entry authoring conventions established for Blocks 23b-26 wood-evidence-layer continuation.

---

### 2026-05-13 — Session 11 Block 23b — SUBSTRATE_EVIDENCE authoring + tropical CITES anti-classification + Q2/Q3 fold-up resolution

**Scope.** Five SUBSTRATE_EVIDENCE entries authored — first canonical population of SUBSTRATE_EVIDENCE array in `lib/constraints/woodEvidence.ts`. Three anti_classification_guidance populations added to existing SPECIES_EVIDENCE entries (rosewood_group, mahogany_group, ebony_group) — first canonical exercise of the field on WoodSpeciesEvidenceEntry entries. Three diagnostic_caution_text rewrites resolving Block 23a D-WE23a-10 forward-references via fragment-only str_replace preserving leading Block 23a appraiser-knowledge prose. Q3 operator-supplied verbatim text added to mahogany_group diagnostic_caution_text. Backlog entry written to `_style_observations_backlog.md` for Block 21 partial-population gap (composite_veneer_cores characteristic_expression slots on three CUT_GRAIN_PHENOMENA entries). No schema changes. No new SPECIES_EVIDENCE entries. No new files. Identification arrays unchanged.

**Architectural decisions (locked).**

D-WE23b-1 (locked): SUBSTRATE_EVIDENCE authored — 5 entries (`substrate_evidence_plywood`, `substrate_evidence_hardboard_masonite`, `substrate_evidence_particleboard`, `substrate_evidence_mdf`, `substrate_evidence_composite_veneer_cores`). Plywood / hardboard / particleboard / MDF sourced from File A Section 2 Primary Substrate table rows (File A lines 49-52); composite_veneer_cores sourced from File A era-narrative passages (1925-1945 Deco "Veneer over composite substrates"; 1945-1975 MCM "Engineered cores dominate") per Q1 ratification. All 5 entries carry adoption_curve (earliest_plausible_year + widespread_adoption_year; dominance_year populated only where File A supports — plywood 1950, particleboard 1980), period_associations (2-3 PeriodAssociation entries per substrate from File A adoption window content), usage_role (closest-fallback enum mapping per D-WE23b-3), usage_role_notes (full File A prose preserved + closest-fallback mapping annotation). regional_associations OMITTED on all 5 entries per File A silence + D-WE23a-5 absence-as-information precedent.

D-WE23b-2 (locked): Q1 (composite_veneer_cores scope) RATIFIED — ship as 5th SUBSTRATE_EVIDENCE entry encoding substrate-in-veneer-carrier-role adoption. Veneer thickness remains independent observation per Block 21 D-CG21-5 architectural lock; thickness convergence at Phase 3 engine integration time. Identification-side entity at woodIdentification.ts:2348 (Block 20) and evidence-side entry now symmetric. composite_veneer_cores entry's diagnostic_caution_text explicitly cross-references D-CG21-5 lock and notes the four veneer-slicing CUT_GRAIN_PHENOMENA entries (rotary_cut, plain_sliced, bookmatching, slip_matching) that reference this substrate via applicable_substrates.

D-WE23b-3 (locked): SubstrateUsageRole closest-fallback enum mapping per GATE 1 HALT 1 resolution. The 5-value enum (`case_back | drawer_bottoms | veneer_substrate | carcass_panel | specialized_use`) does not cleanly fit several File A usage-prose terms; closest-fallback mapping applied: "Backs" → case_back; "Drawer bottoms" → drawer_bottoms; "Veneer substrate" / "Veneered case goods" → veneer_substrate; "Panels" / "Carcasses" / "Utility panels" → carcass_panel; "Mass-market furniture" / "Painted furniture" / "Contemporary cabinetry" / "Routed profiles" → specialized_use. Each entry's usage_role_notes annotates the mapping inline for auditability. No schema extension. Future block may revisit if SubstrateUsageRole enum extension warranted by additional substrate authoring.

D-WE23b-4 (locked): Q2 (CITES content provenance + subspecies fold-up) RATIFIED — Reading A. Subspecies entries for Cuban Mahogany (deferred from Block 23a D-WE23a-10) and Brazilian Rosewood NOT AUTHORED in Block 23b. Subspecies-distinguishing source content insufficient in File A and File B per source-honest authoring discipline (Block 23a D-WE23a-5 precedent). CITES content folds up to parent species/group entries: rosewood_group (Dalbergia nigra 1992 Appendix I), mahogany_group (Swietenia mahagoni 1992 Appendix II; Swietenia macrophylla 2003 Appendix II), ebony_group (Madagascar Diospyros 2013 Appendix II). D-WE23a-10 deferral RESOLVED via fold-up; no future-block forward-reference remains.

D-WE23b-5 (locked): Q3 (Cuban Mahogany period content) RATIFIED — verbatim operator-supplied text added to `wood_species_evidence_mahogany_group.diagnostic_caution_text`: "Cuban Mahogany had a dominant use period from 1720's-1810's. Production later shifted to Honduran Mahogany whose dominant production period existed from the 1700's-c.1900." Not coerced into structured period_associations per operator confidence calibration. Text preserves operator's apostrophe convention ("1720's") rather than normalizing to "1720s" — operator-supplied verbatim.

D-WE23b-6 (locked): CITES content provenance pattern — prose annotation in `guidance_text` (closing phrase: "Per CITES treaty record; regulatory record source, not File A/B sourced."). No schema extension for structured source_class field. Future block may revisit if multiple non-File-A/B provenance classes accumulate. Applied uniformly to all 4 AntiClassificationGuidance entries (rosewood 1992 entry; mahogany 1992 entry; mahogany 2003 entry; ebony 2013 entry).

D-WE23b-7 (locked): Block 21 partial-population gap (composite_veneer_cores characteristic_expression on plain_sliced_veneer / bookmatching / slip_matching CUT_GRAIN_PHENOMENA entries) — surfaced during Block 23b foundation discovery; prior-chat consultation confirmed canonical-source-honest absence (no Mike-sourced content available). BACKLOGGED to `_style_observations_backlog.md` per D-CG21-5 + D-WE23a-5 precedents. NOT folded into Block 23b scope. Resurvey routing: Block 26 WoodEvidenceReasoningRule authoring or later if appraiser knowledge surfaces.

D-WE23b-8 (locked): File A Section 2 Particleboard row diagnostic-caution note ("Thin compressed fiber sheet; common on backs and bottoms") identified as source-document copy-paste artifact from adjacent Hardboard/Masonite row — semantically inconsistent with Particleboard usage column ("Veneered case goods, mass-market furniture") and material reality (particleboard is not fiber-based). `substrate_evidence_particleboard.diagnostic_caution_text` OMITTED rather than propagating the artifact. Source-honest Block 23a discipline maintained.

D-WE23b-9 (locked): Three diagnostic_caution_text fragment-only str_replace rewrites on existing SPECIES_EVIDENCE entries per GATE 1 HALT 3 resolution. mahogany_group (woodEvidence.ts:872), rosewood_group (woodEvidence.ts:1196), ebony_group (woodEvidence.ts:1218). Forward-reference language to Block 23b ("Subspecies-level CITES content for X routes to Block 23b per D-WS19-11/D-WE23a-10.") replaced with descriptions of the newly-populated anti_classification_guidance fields plus (for mahogany_group) the Q3 verbatim text and (for both mahogany_group and rosewood_group) the Q2 fold-up framing. Leading Block 23a D-WE22-10 appraiser-knowledge prose preserved unchanged on all three entries. D-WE23a-10 forward-deferrals fully resolved; zero forward-references to Block 23b remain in the codebase.

D-WE23b-10 (locked): anti_classification_guidance first canonical population on SPECIES_EVIDENCE entries — three populations. rosewood_group: single AntiClassificationGuidance entry (1992 Dalbergia nigra). mahogany_group: array of 2 AntiClassificationGuidance entries (1992 Swietenia mahagoni; 2003 Swietenia macrophylla). ebony_group: single AntiClassificationGuidance entry (2013 Madagascar Diospyros, Option A spec default). All 4 entries: `boundary_type: "form_extinction"` per GATE 1 HALT 2 resolution — Block 16 D-WI9 extension policy ("substrate adoption and species furniture-use extinction semantically map to form_emergence and form_extinction respectively without renaming") applied to CITES trade restrictions as a form of species furniture-use availability extinction. `prominence: "standard"` on all 4 entries per Block 20 D-ES20-5 / Block 21 D-CG21-11 precedent (no pre/post_boundary_classifications populated). `AntiClassificationGuidance | AntiClassificationGuidance[]` field signature exercised in both single-entry (rosewood, ebony) and array (mahogany 2-entry) forms.

**Workflow standards applied.** Pre-emptive schema discovery at Op 0 (GATE 1): SubstrateUsageRole enum (woodEvidence.ts:130-135; 5 values), AntiClassificationGuidance (entryShape.ts:59-86; boundary_type enum 2 values), PeriodAssociation (woodIdentification.ts), WoodRegionalAssociation (woodEvidence.ts) confirmed; spec file-location discrepancies surfaced (3 of 4 interfaces in non-entryShape.ts files; non-blocking spec hygiene). FK target verification at Op 0: all 5 ENGINEERED_SUBSTRATES ids resolved at compile time. Referential integrity at Op G: every substrate_id FK resolves; every species_id FK on the 3 mutated SPECIES_EVIDENCE entries resolves. Forbidden field check: N/A (no spatialBehaviors edits; no new fields). Family-stub-check / form-stub-check: N/A. Source-document-inline standard: File A inline canonical content per Block 23a Part 2; non-File-A/B regulatory provenance flagged via guidance_text closing phrase. Canonical-source-authority standard: File A primary; File B residual not exercised in Block 23b. Appraiser-honest calibration: particleboard diagnostic_caution_text OMITTED per File A copy-paste artifact non-propagation (D-WE23b-8); Block 21 composite_veneer_cores gap BACKLOGGED rather than filled from general knowledge (D-WE23b-7). Content-ambiguity stop-and-surface: invoked at GATE 1 for 3 HALT conditions (SubstrateUsageRole enum coverage; boundary_type CITES mapping; str_replace scope) — all resolved at plan time before authoring.

**Final architectural state after this PR merges:**
- `lib/constraints/woodEvidence.ts` modified: 1453 lines (was 1315 at Block 23a endpoint; +138 net lines).
- `SUBSTRATE_EVIDENCE.length === 5` (was 0); first canonical population.
- 5 SUBSTRATE_EVIDENCE entries all authority 7/7 (plywood, particleboard, mdf) or 6/6 (hardboard_masonite, composite_veneer_cores) per File-A-primary-table-derived vs era-narrative-derived calibration.
- 4 of 5 SUBSTRATE_EVIDENCE entries populate diagnostic_caution_text; substrate_evidence_particleboard OMITS the field per D-WE23b-8.
- `SPECIES_EVIDENCE.length === 26` (unchanged); 3 of 26 entries mutated: diagnostic_caution_text rewritten on mahogany_group, rosewood_group, ebony_group; anti_classification_guidance populated on same 3 entries (3 of 26 populations; first canonical exercise of the field).
- 4 AntiClassificationGuidance entries total across the 3 populated SPECIES_EVIDENCE entries (mahogany has array of 2; rosewood and ebony each single).
- All 4 AntiClassificationGuidance entries: `boundary_type: "form_extinction"`, `prominence: "standard"`, `pre_boundary_classifications` + `post_boundary_classifications` omitted.
- `lib/constraints/_style_observations_backlog.md` modified: backlog entry appended for Block 21 partial-population gap (Block 26 resurvey routing).
- `lib/constraints/entryShape.ts` and `lib/constraints/woodIdentification.ts` byte-for-byte unchanged from Block 23a endpoint.
- Identification arrays unchanged (NATURAL_WOOD_SPECIES 35, WOOD_CATEGORIES 4, ENGINEERED_SUBSTRATES 5, CUT_GRAIN_PHENOMENA 25).
- Other evidence arrays still empty (CUT_GRAIN_EVIDENCE 0, WOOD_DIAGNOSTIC_SIGNALS 0, WOOD_EVIDENCE_REASONING_RULES 0).
- File count `lib/constraints/` unchanged at 11.
- 10 audit decisions captured under D-WE23b-N block-scoped prefix.
- Block 23a D-WE23a-10 forward-references fully resolved; zero forward-references to Block 23b remain in the codebase post-merge.
- Per-entry authoring conventions further established for Blocks 24-26 wood-evidence-layer continuation: anti_classification_guidance + non-File-A/B regulatory-record provenance pattern; substrate-in-role authoring pattern for engineered substrates lacking primary-table source rows; fold-up resolution pattern when subspecies-distinguishing source content is insufficient.

---

### 2026-05-12 — Session 11 Block 24 — CUT_GRAIN_EVIDENCE + WOOD_DIAGNOSTIC_SIGNALS authoring (35 + 8 entries; first canonical exercise of CutGrainEvidenceEntry and WoodDiagnosticSignalEntry interfaces)

**Scope.** Two empty arrays in `lib/constraints/woodEvidence.ts` populated: CUT_GRAIN_EVIDENCE with 35 entries (19 cross-species at File B Category VI Type level + 16 species-anchored at File B species-section Figure Variant level + File A Section 7 cross-validations), WOOD_DIAGNOSTIC_SIGNALS with 8 entries (File A Section 7 Key Chronological Wood Signals table verbatim with multi-FK composition). First canonical exercise of CutGrainEvidenceEntry and WoodDiagnosticSignalEntry interfaces (Block 22 D-WE22-12 sequencing). All 43 entries authority 7/7 per Block 16 D-WE1 lockwork. No schema changes (entryShape.ts and interface field roster on woodEvidence.ts unchanged). Identification arrays byte-for-byte unchanged. SPECIES_EVIDENCE (26) and SUBSTRATE_EVIDENCE (5) unchanged from Block 23b endpoint.

**Architectural decisions (locked).**

D-WE24-1 (locked): CUT_GRAIN_EVIDENCE final count 35 = 19 cross-species + 16 species-anchored. Cross-species entries one-per-phenomenon for 18 of 25 CUT_GRAIN_PHENOMENA (the Gate-1 Type-level phenomena: flat_sawn, quarter_sawn, rift_sawn, live_sawn, burl, birdseye, curly_figure, quilted_figure, flame_figure, spalted_figure, crotch_figure, ray_fleck, ribbon_stripe, rotary_cut_veneer, plain_sliced_veneer, bookmatching, slip_matching, chatoyance) + 1 hand_sawn_veneer extra entry (Block 21 Mike-populated period content). Species-anchored entries author 8 high-confidence phenomenon×species×era anchors (quarter_sawn_white_oak, burl_walnut, crotch_walnut, curly_maple, birdseye_maple, crotch_mahogany, flame_mahogany, ribbon_stripe_mahogany), 6 medium-confidence anchors (burl_redwood, quarter_sawn_sycamore, crotch_rosewood, ribbon_stripe_rosewood, ribbon_stripe_teak, crotch_satinwood), heart_pine extra (Block 21 Mike-populated), and zebrawood_veneer extra (File B cross-cutting anchor despite SPECIES_EVIDENCE parent-skip).

D-WE24-2 (locked): WOOD_DIAGNOSTIC_SIGNALS final count 8 = File A Section 7 Key Chronological Wood Signals table verbatim, one entry per row: massive_solid_oak, thick_walnut_veneer, quarter_sawn_white_oak, satinwood_inlay, thin_walnut_veneer_over_plywood, gumwood_stained_dark, heavy_rosewood_veneer, mdf_core. First canonical exercise of multi-FK parallel-arrays pattern (Block 22 D-WE22-2). All 8 entries populate involved_species / involved_substrates / involved_phenomena (any may be empty array) + involved_period_label. period_associations populated on all 8 entries with structured chronological semantics.

D-WE24-3 (locked): All 43 entries carry positive_authority 7 / hard_negative_authority 7 per Block 16 D-WE1 (CutGrainEvidenceEntry 7/7; WoodDiagnosticSignalEntry 7/7). Composed cut+species evidence and composed multi-entity signals carry equivalent weight stronger than single-axis evidence per Block 16 calibration discipline.

D-WE24-4 (locked): Schema scaffold-consumption only — no entryShape.ts edits, no interface field additions to woodEvidence.ts. Block 22 D-WE22-12 scaffold ships exactly as authored. CutGrainEvidenceEntry 7-field optional roster (cut_phenomenon_id required + species_id/subspecies_id/period_associations/regional_associations/usage_role/usage_role_notes/style_wave_associations/diagnostic_caution_text optional per existing types) and WoodDiagnosticSignalEntry 9-field optional roster exercised at authoring scale without modification.

D-WE24-5 (locked): CutGrainUsageRole closest-fallback enum mapping per Block 23b D-WE23b-3 precedent. The 5-value enum (`veneer_face | inlay_or_banding | premium_solid | decorative_accent | specialized_use`) applied across 35 CUT_GRAIN_EVIDENCE entries: cut_orientation phenomena → premium_solid (quarter_sawn, rift_sawn) or specialized_use (flat_sawn, live_sawn); natural_figure phenomena → veneer_face / decorative_accent (burl, birdseye, quilted, flame, spalted, crotch); ray_cellular → premium_solid (ray_fleck) or veneer_face (ribbon_stripe); veneer_slicing → veneer_face uniformly; chatoyance → decorative_accent. Inlay_or_banding exercised on crotch_satinwood (Federal banding context). Each entry's usage_role_notes annotates mapping inline per D-WE23b-3 precedent only when narrowing prose available.

D-WE24-6 (locked): style_wave_associations 15-tag canonical set verified (colonial, william_and_mary, queen_anne, chippendale, federal_hepplewhite_sheraton, american_empire, rococo_revival, renaissance_revival, eastlake_aesthetic, golden_oak, mission_arts_and_crafts, colonial_revival, art_deco, mid_century_modern, contemporary). Tudor/Jacobean Revival (used in massive_solid_oak signal) lacks dedicated tag; colonial_revival used as closest approximation per gap surface — future block may expand the tag set if Tudor/Jacobean coverage warrants. Empty style_wave_associations array applied to flat_sawn and chatoyance entries per File B "all periods" framing (no style-wave narrowing applicable).

D-WE24-7 (locked): Source-honest period_associations per appraiser-honest discipline. CUT_GRAIN_EVIDENCE entries cite File B Category VI primary (Type-level cross-species and species-section Figure Variant cross-cutting) + File A Section 3 era subsections + File A Primary Woods table for species-anchored entries. WOOD_DIAGNOSTIC_SIGNALS entries cite File A Section 7 verbatim + File A Section 3/Primary Woods cross-validations. Block 21 CUT_GRAIN_PHENOMENA identification-side period_associations referenced for hand_sawn_veneer and heart_pine entries where Block 21 Mike-populated period content predates File B coverage; usage_notes credit Block 21 source path per D-WE24-9.

D-WE24-8 (locked): Alternate-term fold-up at evidence layer per Block 21 D-CG21-8 cross-species consolidation precedent. Tiger Maple / Fiddleback / Curl all reference cut_grain_evidence_curly_figure (cross-species) + cut_grain_evidence_curly_maple (species-anchored Federal-signature narrowing). File B VI-B-3 alternate terms folded; no separate "fiddleback" entry. Pumpkin Pine / Pecky Cypress / Bear Claw Spruce / Radial Matching SKIPPED entirely (no canonical period content anchor at evidence layer; Block 21 identification entries retained as identification-only).

D-WE24-9 (locked): Block 21 Mike-populated extras (hand_sawn_veneer, heart_pine) PASS gate per period_associations populated with explicit appraiser-knowledge content. cut_grain_evidence_hand_sawn_veneer + cut_grain_evidence_heart_pine author at evidence layer with usage_notes citing Block 21 source path. Other Block 21 extras (pumpkin_pine, pecky_cypress, bear_claw_spruce, radial_matching) lack populated period_associations at the level required for evidence-layer authoring; SKIP per appraiser-honest absence-as-information discipline (Block 23a D-WE23a-5 + Block 23b D-WE23b-7 precedent).

D-WE24-10 (locked): 9 low-confidence species-anchored compositions SKIPPED per appraiser-honest discipline. Phenomenon×species combinations where File B species-section Figure Variant content is silent or generic (no narrowing era anchor beyond cross-species period span) SKIP rather than author redundant-with-cross-species entries. Specific skips include: birdseye_birch (no Federal anchor distinct from cross-species), flame_walnut (subsumed by cross-species flame), flame_cherry (no Federal/Empire anchor), ribbon_stripe_palisander (subsumed by ribbon_stripe_rosewood), spalted_maple (Studio era only; subsumed by cross-species), curly_cherry (no period-specific narrowing beyond cross-species), curly_birch (same), and 2 other low-narrowing combinations. SKIP discipline preserves species-anchored entry quality threshold per D-WE24-1.

D-WE24-11 (locked): cut_grain_evidence_quarter_sawn_sycamore authored despite SPECIES_EVIDENCE sycamore parent-skip per Block 23a D-WE23a-5 (sycamore general furniture use silent in File A Primary Woods table). Phenomenon×species×era anchor (quarter-sawn sycamore lace figure → Art Deco) is canonical per File B VI-A-2 cross-cutting Common Woods listing + File A Section 3 1925-1945 Art Deco subsection "Highly figured veneer geometry". Phenomenon-specific evidence is appraiser-honest authoring even when species's general furniture use is silent — distinct from species-level period_associations population which requires File A general-use anchor.

D-WE24-12 (locked): wood_diagnostic_signal_satinwood_inlay authors involved_phenomena: [] (empty array) per inlay-phenomenon coverage gap. No inlay/banding/stringing phenomenon entry exists in the 25-id CUT_GRAIN_PHENOMENA roster (Block 21 Cat VI scope intentionally excluded inlay as a finishing/decoration technique rather than a cut/grain phenomenon). Schema/identification-side authoring of inlay phenomenon deferred to future block; signal authors authoritatively with empty FK array per multi-FK parallel-arrays pattern (Block 22 D-WE22-2). Same gap-handling applied to wood_diagnostic_signal_gumwood_stained_dark (finish-treatment is the diagnostic axis; no cut/grain phenomenon required) and wood_diagnostic_signal_mdf_core (substrate-anchored signal; no cut/grain phenomenon required).

D-WE24-13 (locked): wood_diagnostic_signal_thick_walnut_veneer authors involved_phenomena dual mapping: [hand_sawn_veneer, plain_sliced_veneer]. Pre-1850 Victorian thick veneer used hand-sawn technique; post-1850 Victorian commercial veneer used plain-sliced. Dual phenomenon FK array spans the Victorian 1840-1900 transition window inclusively per File B VI-D-1 (rotary-cut 1930+ post-Victorian) + VI-D-2 (plain-sliced 1850+ commercial) era anchors and Block 21 hand_sawn_veneer Federal-Empire luxury technique populated period_association. Same dual-mapping discipline could apply to other transition-window signals but only thick_walnut_veneer surfaces it in Block 24's 8-signal scope.

D-WE24-14 (locked): cut_grain_evidence_zebrawood_veneer authored despite SPECIES_EVIDENCE zebrawood parent-skip per Block 23a D-WE23a-5 routing precedent. Per D-WE24-11 logic: phenomenon×species×era anchor (zebrawood plain-sliced veneer → Art Deco 1925-1945) is canonical per File B cross-cutting "Zebrawood veneer → Art Deco" / "Zebrawood veneer 1925-1945" tables despite species parent-skip. Cross-cutting routing pattern applied at evidence layer.

D-WE24-15 (locked): wood_diagnostic_signal_thin_walnut_veneer_over_plywood is the first canonical exercise of V-K Veneer Substrates multi-FK pattern per Block 22 D-WE22-7 routing target (composed signal: veneer cut + substrate + species + era). Three-FK composition: involved_species [walnut_group] + involved_substrates [plywood] + involved_phenomena [rotary_cut_veneer] + involved_period_label "MCM" + period_associations [MCM walnut resurgence 1945-1975]. wood_diagnostic_signal_mdf_core is the substrate-anchored second V-K exercise per D-WE22-7: involved_species [] + involved_substrates [mdf] + involved_phenomena [] (substrate-only signal). Pattern validates Block 22 D-WE22-2 parallel-arrays multi-FK shape design.

D-WE24-FINAL (locked): Block 24 ships 35 CUT_GRAIN_EVIDENCE + 8 WOOD_DIAGNOSTIC_SIGNALS = 43 new entries; 0 schema changes; 0 identification-side mutations; 0 SPECIES_EVIDENCE/SUBSTRATE_EVIDENCE mutations. WOOD_EVIDENCE_REASONING_RULES remains empty (Block 26 scope per Block 22 D-WE22-12). All FK targets resolve at compile time per CUT_GRAIN_PHENOMENA 25-entry inventory + NATURAL_WOOD_SPECIES 35 species + subspecies + ENGINEERED_SUBSTRATES 5 inventory. tsc --noEmit 0 errors in lib/constraints/. Block 25 (period × wood + revival × wood content) and Block 26 (WOOD_EVIDENCE_REASONING_RULES) remain as wood-evidence-layer continuation work.

**Workflow standards applied.** Pre-emptive schema discovery confirmed CutGrainEvidenceEntry / WoodDiagnosticSignalEntry / WoodRegionalAssociation / PeriodAssociation / CutGrainUsageRole interfaces unchanged from Block 22 scaffold. FK target verification: 25 cut_grain_phenomenon ids confirmed by grep (Op A's count of 25 reconciled against later-grep apparent 28 — delta-3 were usage references not definitions); all species_id and subspecies_id FKs (white_oak, black_walnut, hard_maple_sugar_maple, southern_yellow_pine, oak_group, walnut_group, mahogany_group, rosewood_group, satinwood_group, sycamore_group, redwood, teak, zebrawood, gumwood_group) confirmed against woodIdentification.ts inventory; engineered_substrate_plywood + engineered_substrate_mdf confirmed. style_wave_associations 15-tag canonical set extracted via grep -hoE from existing entries and verified against authoring use. CUT_GRAIN_PHENOMENA delta-3 reconciliation per D-WE24-9 logic: reconciled at definition-count level (25 confirmed); no further per-id disposition needed. Source-document-inline standard: File A and File B sources cited in usage_notes prose at every period_association level. Appraiser-honest calibration applied via D-WE24-9 (Block 21 extras gate), D-WE24-10 (9 low-confidence species-anchored skips), D-WE24-11 / D-WE24-14 (parent-skip routing with phenomenon×species×era anchor authoring), D-WE24-12 (multi-FK gap handling with empty involved_phenomena arrays). Content-ambiguity stop-and-surface invoked for FK target verification + delta-3 phenomenon count reconciliation; both resolved before authoring.

**Final architectural state after this PR merges:**
- `lib/constraints/woodEvidence.ts` modified: 2176 lines (was 1453 at Block 23b endpoint; +723 net lines).
- `CUT_GRAIN_EVIDENCE.length === 35` (was 0); first canonical population.
- `WOOD_DIAGNOSTIC_SIGNALS.length === 8` (was 0); first canonical population.
- All 35 + 8 = 43 entries carry positive_authority 7 / hard_negative_authority 7.
- 19 CUT_GRAIN_EVIDENCE cross-species entries omit species_id and subspecies_id; 16 species-anchored entries populate exactly one of species_id (10 entries) or subspecies_id (6 entries).
- regional_associations populated on 4 of 35 CUT_GRAIN_EVIDENCE entries (quarter_sawn, ray_fleck, quarter_sawn_white_oak, burl_redwood, heart_pine = 5 entries) and 1 of 8 WOOD_DIAGNOSTIC_SIGNALS (quarter_sawn_white_oak signal); File B/File A regional content sparse beyond Mission Midwest dominance, West Coast Arts & Crafts, and Southern heart pine.
- diagnostic_caution_text populated on all 35 CUT_GRAIN_EVIDENCE entries; confidence_notes populated on all 8 WOOD_DIAGNOSTIC_SIGNALS entries.
- usage_role populated on all 35 CUT_GRAIN_EVIDENCE entries with closest-fallback enum mapping per D-WE24-5.
- All FK targets resolve: 35 cut_phenomenon_id values + 22 species_id/subspecies_id values across CUT_GRAIN_EVIDENCE entries; 8 multi-FK parallel-array signals all resolve.
- Tudor/Jacobean Revival tag gap surfaced (D-WE24-6); colonial_revival used as closest fallback in massive_solid_oak signal.
- `SPECIES_EVIDENCE.length === 26` (unchanged from Block 23b).
- `SUBSTRATE_EVIDENCE.length === 5` (unchanged from Block 23b).
- `WOOD_EVIDENCE_REASONING_RULES.length === 0` (Block 26 scope).
- `lib/constraints/entryShape.ts` and `lib/constraints/woodIdentification.ts` byte-for-byte unchanged.
- Identification arrays unchanged (NATURAL_WOOD_SPECIES 35, WOOD_CATEGORIES 4, ENGINEERED_SUBSTRATES 5, CUT_GRAIN_PHENOMENA 25).
- File count `lib/constraints/` unchanged at 11.
- 16 audit decisions captured under D-WE24-N block-scoped prefix (D-WE24-1 through D-WE24-15 + D-WE24-FINAL).
- Block 22 D-WE22-12 sequencing satisfied: Blocks 23a (SPECIES_EVIDENCE), 23b (SUBSTRATE_EVIDENCE), 24 (CUT_GRAIN_EVIDENCE + WOOD_DIAGNOSTIC_SIGNALS) complete; Block 25 (period × wood + revival × wood content) and Block 26 (WOOD_EVIDENCE_REASONING_RULES) remain.
- Per-entry authoring conventions further established for Block 25-26 wood-evidence-layer continuation: parent-skip routing pattern with phenomenon×species×era anchor authoring (D-WE24-11 / D-WE24-14); multi-FK parallel-array signal authoring with empty FK arrays for cross-axis gaps (D-WE24-12); dual-phenomenon mapping for transition-window signals (D-WE24-13); V-K Veneer Substrates substrate+species+phenomenon+era composed signal pattern (D-WE24-15).

---

### 2026-05-12 — Session 12 Block 25 — File A Section 5 Major Revival Waves coverage addendum (3 SPECIES_EVIDENCE mutations)

**Scope.** Three mutation-only edits to existing SPECIES_EVIDENCE entries in `lib/constraints/woodEvidence.ts` closing File A Section 5 "Major Revival Waves and Their Woods" coverage gaps surfaced during Op A inspection of the Block 24 endpoint. Zero new entries, zero removed entries, zero schema changes. SPECIES_EVIDENCE (26), SUBSTRATE_EVIDENCE (5), CUT_GRAIN_EVIDENCE (35), WOOD_DIAGNOSTIC_SIGNALS (8), WOOD_EVIDENCE_REASONING_RULES (0) all unchanged in array length. 15-tag canonical style_wave_associations set per D-WE23a-4 remains locked. Mutations: G1 — Gothic Revival × oak (period_association addition); G4 — Eastlake Revival × walnut (style_wave_associations tag addition); G5 — Eastlake Revival × cherry (style_wave_associations tag addition). Op A inspection surfaced 5 gaps total; 3 mapped to mutations this block; 2 (G2 Gothic Revival × walnut; G3 Empire Revival × mahogany) skipped per D-WE25-6 appraiser-honest tolerance — date overlap covers the windows.

**Architectural decisions (locked).**

D-WE25-1 (locked): Block 25 scope locked as small-addendum mutation-only ship after Op A inspection determined File A Section 5 coverage is substantially complete via Block 23a authoring with 5 specific gaps surfaced. 3 of 5 gaps land as mutations this block (G1, G4, G5); 2 gaps (G2 Gothic Revival × walnut labeling; G3 Empire Revival × mahogany labeling) SKIPPED per appraiser-honest tolerance — date overlap from existing period_associations covers the revival windows; adding redundant labeled period_associations introduces noise more than signal per Independent Layer Evaluation Standard.

D-WE25-2 (locked): G1 mutation — Gothic Revival × oak. Added PeriodAssociation `{ period_label: "Gothic Revival recurring use", date_floor: 1880, date_ceiling: 1910 }` to `wood_species_evidence_oak_group.period_associations` per File A Section 5 Major Revival Waves table anchor. Original Gothic Revival 1840-1865 covered by existing Victorian-era oak period_associations via date overlap; this entry encodes the explicit revival-wave anchor. Insertion position chronological-order-preserving: between existing "Eastlake/Aesthetic/Golden Oak dominance" 1875-1910 entry and "Mission/Arts & Crafts peak" 1895-1925 entry. Post-mutation `oak_group.period_associations.length === 7` (was 6).

D-WE25-3 (locked): G4 mutation — Eastlake Revival × walnut. Added `"eastlake_aesthetic"` tag to `wood_species_evidence_walnut_group.style_wave_associations` per File A Section 5 Eastlake Revival × Walnut mapping coverage gap surfaced in Op A inspection. Insertion position chronological-order-preserving: between `"renaissance_revival"` (1860-1885 original) and `"colonial_revival"` (1890-1940 main wave). Post-mutation `walnut_group.style_wave_associations.length === 8` (was 7).

D-WE25-4 (locked): G5 mutation — Eastlake Revival × cherry. Added `"eastlake_aesthetic"` tag to `wood_species_evidence_cherry_group.style_wave_associations` per File A Section 5 Eastlake Revival × Cherry mapping coverage gap surfaced in Op A inspection. Insertion position chronological-order-preserving: between `"federal_hepplewhite_sheraton"` (1780-1820 original era) and `"mission_arts_and_crafts"` (1895-1925). Post-mutation `cherry_group.style_wave_associations.length === 6` (was 5).

D-WE25-5 (locked): 15-tag canonical style_wave_associations set per D-WE23a-4 remains LOCKED. Revival-wave granularity for Tudor/Jacobean Revival, Gothic Revival, Empire Revival, Federal Revival, and Eastlake Revival beyond existing tag approximations DEFERRED to Phase 2 Session 9 styleFamilies.ts authoring. Continuing D-WE24-6 fallback discipline: revival-wave content lives in period_associations period_label prose; closest 15-tag approximation used for style_wave_associations (colonial_revival or original-era tag depending on revival wave). Rationale: 15-tag set expansion at this stage would trigger retroactive re-evaluation of all 26 SPECIES_EVIDENCE + 35 CUT_GRAIN_EVIDENCE + 8 WOOD_DIAGNOSTIC_SIGNALS entries; styleFamilies.ts authoring is the appropriate venue for canonical style-family granularity decisions given its broader scope (Empire, Eastlake, Mission, Colonial Revival, etc. as ~17-20 style families per Stage 2 synthesis 10.5).

D-WE25-6 (locked): G2 (Gothic Revival × walnut labeling refinement) and G3 (Empire Revival × mahogany labeling refinement) SKIPPED. Date overlap from existing period_associations (Victorian walnut dominance 1840-1885 covering Gothic Revival original 1840-1865; Revival furniture 1880-1940 covering Empire Revival 1880-1910 window) already encodes the period coverage. Adding labeled period_associations for revival waves where date overlap already covers introduces redundant labeling that does not improve diagnostic narrowing per Independent Layer Evaluation Standard. Revival-wave semantic specificity routes to engine-reasoning layer rather than species-evidence period_association prose.

D-WE25-7 (locked): D-WE23a-2 inverse-index reconciliation. Op A inspection of Block 24 confirmed that `wood_species_evidence_birch_group` entry EXISTS in woodEvidence.ts with 7 period_associations, including the explicit "Colonial Revival stained substitute" 1900-1950 entry. D-WE23a-2 plan-time inverse-index prediction of birch=0 (zero reciprocal Section 6 Hidden Secondary Woods pairings) was overridden during Block 23a authoring per appraiser-honest discipline: File A Section 3 Chronological Breakdown 1850-1940 birch entry + Section 5 Major Revival Waves Colonial Revival × Birch mapping surfaced birch as a primary wood warranting full SPECIES_EVIDENCE entry regardless of Section 6 silence. Block 23a audit log captured authoring decisions; this entry clarifies the inverse-index-prediction-vs-shipped-state fidelity for future audit reference. No mutation required to birch_group; entry as shipped is appraiser-honest.

D-WE25-8 (locked): SKIP-pattern inventory documented. File A Section 5 produces ZERO mappings against the D-WE23a-5 14-species skip list (douglas_fir, cypress, spruce, hemlock, juniper_cedar_like_softwoods, tulipwood, kingwood, padauk, purpleheart, olivewood, lauan_philippine_mahogany, sycamore_group, aspen, cottonwood). Section 5 revival-wave mappings reference only mainstream show-wood species, all of which have SPECIES_EVIDENCE entries. Skip-list discipline remains canonical.

D-WE25-FINAL (locked): Block 25 ship — 3 SPECIES_EVIDENCE entry mutations on 3 entries (oak_group, walnut_group, cherry_group). Zero new entries; zero removed entries; zero schema changes. File A Section 5 coverage closure: 16/16 mappings resolved (10 PRESENT pre-Block-25 + 3 mapped via Block 25 mutations + 2 covered via date-overlap per D-WE25-6 + 1 N/A special-case routing ebonized to ebony_group). Skip-list silence per D-WE25-8. Block 25 closes File A Section 5 wood-evidence-layer coverage; remaining wood-evidence-layer work scoped to Block 26 (WOOD_EVIDENCE_REASONING_RULES authoring per Block 22 D-WE22-12).

**Workflow standards applied.** Plan-mode Op A inspection (READ-ONLY) preceded all mutations; insertion points surfaced for Mike approval; zero mutations executed during plan mode. Pre-mutation 15-tag set adherence verified on walnut_group (7 tags) and cherry_group (5 tags) — 100% canonical compliance pre-mutation; post-mutation arrays add one canonical tag each (`eastlake_aesthetic`). Insertion-position discipline: chronological-order preservation applied for both period_associations (oak_group entry inserted between 1875-1910 Eastlake and 1895-1925 Mission entries) and style_wave_associations (eastlake_aesthetic inserted between renaissance_revival and colonial_revival on walnut_group; between federal_hepplewhite_sheraton and mission_arts_and_crafts on cherry_group). Source citation: G1 period_association usage_notes cites File A Section 5 anchor. Independent Layer Evaluation Standard discipline: G2 and G3 skipped per D-WE25-6 (date overlap covers the windows; redundant labeling avoided). 15-tag canonical set lock per D-WE25-5 (no new tags this block; styleFamilies.ts deferred).

**Final architectural state after this PR merges:**
- `lib/constraints/woodEvidence.ts` modified: 2178 lines (was 2176 at Block 24 endpoint; +2 net lines from G1 single-PeriodAssociation insertion; G4 and G5 are in-place array additions on existing lines).
- `lib/constraints/AUDIT_LOG.md` modified: +~52 lines (D-WE25-1 through D-WE25-FINAL).
- `SPECIES_EVIDENCE.length === 26` unchanged.
- `SUBSTRATE_EVIDENCE.length === 5` unchanged.
- `CUT_GRAIN_EVIDENCE.length === 35` unchanged (Block 24 ship).
- `WOOD_DIAGNOSTIC_SIGNALS.length === 8` unchanged (Block 24 ship).
- `WOOD_EVIDENCE_REASONING_RULES.length === 0` unchanged (Block 26 scope).
- `wood_species_evidence_oak_group.period_associations.length === 7` (was 6); new entry period_label "Gothic Revival recurring use" 1880-1910.
- `wood_species_evidence_walnut_group.style_wave_associations.length === 8` (was 7); added `"eastlake_aesthetic"`.
- `wood_species_evidence_cherry_group.style_wave_associations.length === 6` (was 5); added `"eastlake_aesthetic"`.
- `lib/constraints/entryShape.ts` and `lib/constraints/woodIdentification.ts` byte-for-byte unchanged.
- Identification arrays unchanged (NATURAL_WOOD_SPECIES 35, WOOD_CATEGORIES 4, ENGINEERED_SUBSTRATES 5, CUT_GRAIN_PHENOMENA 25).
- File count `lib/constraints/` unchanged at 11.
- 9 audit decisions captured under D-WE25-N block-scoped prefix (D-WE25-1 through D-WE25-8 + D-WE25-FINAL).
- 15-tag canonical style_wave set per D-WE23a-4 remains LOCKED (per D-WE25-5).
- D-WE23a-2 inverse-index prediction reconciled to shipped birch_group entry state per D-WE25-7.
- Block 22 D-WE22-12 sequencing: Blocks 23a, 23b, 24, 25 complete; Block 26 (WOOD_EVIDENCE_REASONING_RULES) remains.
- Per-entry authoring conventions further established for Block 26 wood-evidence-layer continuation: mutation-only addendum-ship pattern for coverage-gap closure (D-WE25-1); chronological-order-preservation insertion discipline for both period_associations and style_wave_associations (D-WE25-2/3/4); appraiser-honest-tolerance SKIP discipline for redundant-labeling gaps where date overlap covers (D-WE25-6).

---

### 2026-05-13 — Session 12 Block 26 — WOOD_EVIDENCE_REASONING_RULES capstone (7 rules; wood evidence library canonically complete)

**Scope.** Final array of the wood evidence library scaffold (Block 22 D-WE22-12 sequencing) populated: WOOD_EVIDENCE_REASONING_RULES authored with 7 WoodEvidenceReasoningRule entries encoding appraiser-knowledge meta-rules governing wood-axis evidence interpretation at Phase 3 engine integration. First canonical exercise of WoodEvidenceReasoningRule interface (Block 22 scaffold). All 7 entries authority 9/9 per D-WE22-11 (meta-rule supremacy). migration_target distribution: 4 engine_reasoning + 1 weighting_file + 2 report_layer per D-WE26-3. cross_layer_scope: true on 3 rules (wood_alone_never_dates, visible_wood_not_structural, wood_evidence_layer_independence). Schema scaffold-consumption only; no entryShape.ts edits; no interface modifications. SPECIES_EVIDENCE (26), SUBSTRATE_EVIDENCE (5), CUT_GRAIN_EVIDENCE (35), WOOD_DIAGNOSTIC_SIGNALS (8) all unchanged. Identification arrays byte-for-byte unchanged. Block 26 closes the wood evidence library; Phase 2 Session 9 wood reference work complete.

**Architectural decisions (locked).**

D-WE26-1 (locked): Block 26 scope locked at 7 WoodEvidenceReasoningRule entries per Q1 Option C. Six rules from seed prompt scope (wood_alone_never_dates_furniture, secondary_woods_often_more_diagnostic_than_show_wood, visible_wood_not_structural_wood, skipped_species_absence_as_information, many_primary_secondary_framing_poplar, composite_veneer_cores_premium_veneer_technique_gap) + Independent Layer Evaluation Standard canonicalization as rule #7 wood_evidence_layer_independence. Single combined ship per Q2 Option D scoping decision. Closes the wood evidence library as canonically complete (Phase 2 Session 9 wood work done).

D-WE26-2 (locked): Absence-as-information meta-rule shape per Q2 Option D — single rule entry (skipped_species_absence_as_information) covering all 14 D-WE23a-5 skipped species via applies_to_entry_types array. Per-species rules option (F) rejected as artificially multiplying entries for unified epistemic-status content. Per-cluster option (E) rejected as creating distinction not present in underlying appraiser-honest discipline.

D-WE26-3 (locked): migration_target distribution per Q3 Option G: 4 engine_reasoning (wood_alone_never_dates_furniture, visible_wood_not_structural_wood, skipped_species_absence_as_information, wood_evidence_layer_independence) + 1 weighting_file (secondary_woods_often_more_diagnostic_than_show_wood) + 2 report_layer (many_primary_secondary_framing_poplar, composite_veneer_cores_premium_veneer_technique_gap). Routing reflects each rule's structural purpose: engine_reasoning for cross-evidence-axis inference constraints; weighting_file for mechanical weight modifiers; report_layer for narrative-framing constraints.

D-WE26-4 (locked): composite_veneer_cores gap resolution per Q4 Option I — encoded as report_layer rule (composite_veneer_cores_premium_veneer_technique_gap) rather than re-authored at Block 21 identification side. Preserves wood library architectural separation (identification ↔ evidence) and closes D-WE23b-7 backlog canonically. Engine surfaces gap-acknowledged caveat at user-facing render when veneer-on-composite-core evidence appears. Future block may author the missing characteristic_expression content in Block 21 phenomena, at which point this rule deprecates or migration_status flips to "needs_review" for re-evaluation.

D-WE26-5 (locked): Schema scaffold-consumption only per Q5 Option L. WoodEvidenceReasoningRule interface from Block 22 scaffold unmodified. Quantitative weight modifiers (rule #2 secondary-woods activation) and per-species exception logic (rule #5 poplar) live in destination layer (weighting_file / engine code) per migration_target enum routing. Block 26 content-only.

D-WE26-6 (locked): Independent Layer Evaluation Standard canonicalization. Rule #7 (wood_evidence_layer_independence) promotes the D-PA-1 audit-log lock from Block 22.5 to a first-class canonical artifact in WOOD_EVIDENCE_REASONING_RULES. cross_layer_scope: true signals engine-integration scope beyond wood library. First canonical-library encoding of layer-independence discipline; serves as precedent for future evidence-library reasoning rules across joinery, fasteners, hardware, upholstery. The rule explicitly blocks dependency-wiring proposals (e.g., "check wood likely based on identified style and form") that would create downstream-evidence-from-upstream-evidence inference biases.

D-WE26-7 (locked): Poplar 5+ primary exception framework forward-reference closure. D-WE23a-2 inverse-index framework referenced this rule as future canonical home; rule #5 many_primary_secondary_framing_poplar provides that home. Closes the D-WE23a-2 forward-reference; appraiser-practice-derived 5+ primary exception now canonically documented at report_layer migration target.

D-WE26-8 (locked): All 7 rules ship at authority 9/9 per D-WE22-11. Highest authority in the wood evidence library reflects meta-rule supremacy: reasoning rules govern evidence-axis interpretation and combination across the entire wood library and (via cross_layer_scope: true on rules #1, #3, #7) across the broader evidence integration framework.

D-WE26-9 (locked): D-WE23a-5 skipped-species roster verified against woodIdentification.ts NATURAL_WOOD_SPECIES during Op A-4. All 14 species ids confirmed present with exact id forms matching plan rule #4 roster — zero codebase-id adjustments required: wood_species_douglas_fir (line 1482), wood_species_cypress (1549), wood_species_spruce (1581), wood_species_hemlock (1614), wood_species_juniper_cedar_like_softwoods (1648), wood_species_sycamore_group (1294), wood_species_aspen (2058), wood_species_cottonwood (2090), wood_species_tulipwood (1861), wood_species_kingwood (1889), wood_species_padauk (1917), wood_species_purpleheart (1969), wood_species_olivewood (1997), wood_species_lauan_philippine_mahogany (2123). Sycamore species partial-treatment nuance (D-WE24-11 precedent: phenomenon-specific evidence allowed despite parent species SPECIES_EVIDENCE skip) captured in rule #4 rationale rather than schema field exception. hickory and fruitwoods confirmed NOT to exist as NATURAL_WOOD_SPECIES entries; plan's "possibly include" note unneeded.

D-WE26-10 (locked): Phase 2 wood library closure milestone. Block 26 ship completes the wood reference library authoring sequence: Block 16 (schema foundation) → Block 17 (categories) → Block 18 (species batch 1) → Block 19 (species batch 2) → Block 20 (substrates) → Block 21 (cut/grain phenomena) → Block 22 (evidence schema scaffold) → Block 22.5 (PositionOnPiece architecture) → Block 23a (SPECIES_EVIDENCE × 26) → Block 23b (SUBSTRATE_EVIDENCE × 5 + tropical CITES) → Block 24 (CUT_GRAIN_EVIDENCE × 35 + WOOD_DIAGNOSTIC_SIGNALS × 8) → Block 25 (Section 5 addendum) → Block 26 (REASONING_RULES × 7). Phase 2 Session 9 wood work complete. Post-Block-26 work moves to Phase 2 Session 6 (maker marks expansion) or HCL authoring per Session 9 sequencing.

D-WE26-11 (locked): migration_status: "complete" populated on all 7 WoodEvidenceReasoningRule entries. First explicit migration_status field use in woodEvidence.ts. Convention rationale: rules carry forward-commit to Phase 3 integration destination via migration_target enum; "complete" semantically signals canonical authoring is final and destination layer is locked, with Phase 3 work activating the routing rather than re-authoring the rule. Divergence from other arrays (SPECIES_EVIDENCE, SUBSTRATE_EVIDENCE, CUT_GRAIN_EVIDENCE, WOOD_DIAGNOSTIC_SIGNALS) leaving migration_status unset reflects real architectural difference: rules have explicit migration routing; content entries don't. Convention precedent for future evidence-library reasoning rules in joinery, fasteners, hardware, upholstery libraries.

D-WE26-FINAL (locked): Block 26 ship — 7 WoodEvidenceReasoningRule entries authored in single combined ship per Q1 Option C + Q2 Option D. Final array lengths post-Block-26: SPECIES_EVIDENCE 26 (unchanged); SUBSTRATE_EVIDENCE 5 (unchanged); CUT_GRAIN_EVIDENCE 35 (unchanged); WOOD_DIAGNOSTIC_SIGNALS 8 (unchanged); WOOD_EVIDENCE_REASONING_RULES 7 (was 0; Block 26 fully populated). All 7 rules at authority 9/9. migration_target distribution: 4 engine_reasoning + 1 weighting_file + 2 report_layer. cross_layer_scope: true on 3 rules (wood_alone, visible_vs_structural, layer_independence). migration_status: "complete" on all 7. Wood evidence library: canonically complete.

**Workflow standards applied.** Plan-mode Op A inspection (READ-ONLY) preceded all authoring; FK targets verified for 14 skipped-species ids + 5 entry-id applies_to_entry_types references + 4 category-string applies_to_entry_types references; insertion target confirmed at woodEvidence.ts:2178; migration_status convention question surfaced via AskUserQuestion at plan time and resolved before authoring (locked as D-WE26-11). Pre-emptive schema discovery confirmed WoodEvidenceReasoningRule interface unchanged from Block 22 scaffold. Source-document citation: rule rationale prose cites File A Section 8 Important Caveat (rule #1), File A Section 6 introductory caveat (rule #2), wood_diagnostic_signal entries from Block 24 (rule #3), D-WE23a-5 skip-list ratification (rule #4), D-WE23a-2 inverse-index framework (rule #5), D-WE23b-7 backlog (rule #6), Block 22.5 D-PA-1 audit-log lock (rule #7). Appraiser-honest calibration: skipped-species absence encoded canonically as signal rather than gap (D-WE26-2); content-axis gap (composite veneer cores) encoded as report-layer rule rather than re-touching identification side (D-WE26-4). Cross-evidence-axis scope: cross_layer_scope: true on 3 rules signals scope beyond wood library; serves as precedent for future evidence-library reasoning rules (D-WE26-6).

**Final architectural state after this PR merges:**
- `lib/constraints/woodEvidence.ts` modified: ~2390 lines (was 2178 at Block 25 endpoint; +~212 net lines from 7-entry authoring).
- `lib/constraints/AUDIT_LOG.md` modified: +~75 lines (D-WE26-1 through D-WE26-11 + D-WE26-FINAL).
- `WOOD_EVIDENCE_REASONING_RULES.length === 7` (was 0); first canonical population; wood evidence library complete.
- All 7 rules carry: authority 9/9, migration_status: "complete", populated rule_name + rule_statement + rationale + notes, migration_target value from 3-value enum, cross_layer_scope explicit (true on 3 rules).
- migration_target distribution: 4 engine_reasoning (rules #1, #3, #4, #7) + 1 weighting_file (rule #2) + 2 report_layer (rules #5, #6).
- cross_layer_scope: true on rules #1 (wood_alone_never_dates), #3 (visible_vs_structural), #7 (layer_independence); false on rules #2 (secondary_woods), #4 (skipped_species_absence), #5 (poplar_framing), #6 (composite_veneer_cores_gap).
- All applies_to_entry_types FK references resolve: category strings ("wood_species_evidence", "substrate_evidence", "cut_grain_evidence", "wood_diagnostic_signal", "wood_evidence_reasoning_rule") match category field literal types; specific entry ids resolve against NATURAL_WOOD_SPECIES (14 skipped-species ids), SPECIES_EVIDENCE (poplar_group id), CUT_GRAIN_PHENOMENA (3 phenomenon ids), and ENGINEERED_SUBSTRATES (composite_veneer_cores id).
- `SPECIES_EVIDENCE.length === 26` unchanged.
- `SUBSTRATE_EVIDENCE.length === 5` unchanged.
- `CUT_GRAIN_EVIDENCE.length === 35` unchanged.
- `WOOD_DIAGNOSTIC_SIGNALS.length === 8` unchanged.
- `lib/constraints/entryShape.ts` and `lib/constraints/woodIdentification.ts` byte-for-byte unchanged.
- Identification arrays unchanged (NATURAL_WOOD_SPECIES 35, WOOD_CATEGORIES 4, ENGINEERED_SUBSTRATES 5, CUT_GRAIN_PHENOMENA 25).
- File count `lib/constraints/` unchanged at 11.
- 12 audit decisions captured under D-WE26-N block-scoped prefix (D-WE26-1 through D-WE26-11 + D-WE26-FINAL).
- Block 22 D-WE22-12 sequencing satisfied: Blocks 23a, 23b, 24, 25, 26 complete; wood evidence library canonically closed.
- Phase 2 Session 9 wood reference work canonically complete; post-Block-26 work moves to Phase 2 Session 6 maker marks or HCL authoring per Session 9 sequencing.
- D-WE23a-2 inverse-index forward-reference to poplar canonical home CLOSED by rule #5 (D-WE26-7).
- D-WE23b-7 composite_veneer_cores backlog CLOSED by rule #6 (D-WE26-4).
- D-PA-1 Independent Layer Evaluation Standard PROMOTED from audit-log lock to canonical artifact via rule #7 (D-WE26-6).
- Convention precedent established for future evidence-library reasoning rules: migration_status: "complete" on rules per D-WE26-11; cross_layer_scope: true on cross-axis rules per D-WE26-6; applies_to_entry_types parallel-array shape for both category-string and specific-id references per D-WE26-9.

---

### 2026-05-13 — Session 12 Block 27 — Maker Marks Schema Foundation + Cross-Library Migrations + 8 Attribution Reasoning Rules

**Scope.** Phase 2 Session 6 (maker marks library expansion) opens. Combined ship: (1) PeriodAssociation interface relocated from woodIdentification.ts to entryShape.ts as shared cross-library artifact; (2) ReasoningRuleMigrationTarget enum relocated from woodEvidence.ts to entryShape.ts as shared cross-library artifact; (3) makerMarks.ts schema foundation — new MakerMarkEntry interface (15 declared fields extending CanonicalEntry), new MakerAttributionReasoningRule interface (parallel to WoodEvidenceReasoningRule), new MarkType 14-value enum, empty MAKER_ENTRIES array scaffold, 8-entry MAKER_ATTRIBUTION_REASONING_RULES; (4) legacy MakerMarkEntry type alias renamed to MakerMarkEntry_Legacy + legacy MAKER_MARKS array (25 entries) preserved verbatim for engine.ts compat. engine.ts UNCHANGED per Phase 2 / Phase 3 separation discipline. Wood library array contents unchanged. Block 28 follows with ~78-82 MAKER_ENTRIES content authoring from Maker_Mark_Replacement_Seed.docx.

**Architectural decisions (locked).**

D-MM27-1 (locked): Block 27 scope per Q1-Q7 lockings. Combined ship: PeriodAssociation migration + ReasoningRuleMigrationTarget migration + makerMarks.ts schema foundation (MakerMarkEntry + MakerAttributionReasoningRule interfaces + MarkType 14-value enum + empty MAKER_ENTRIES array + 8-entry MAKER_ATTRIBUTION_REASONING_RULES) + legacy compat preservation. Block 28 follows with ~78-82 MAKER_ENTRIES content authoring from Maker_Mark_Replacement_Seed.docx per Q6 Option O two-block sequencing.

D-MM27-2 (locked): PeriodAssociation interface migration from woodIdentification.ts to entryShape.ts per Q7. Parallel rationale to Block 16 AntiClassificationGuidance relocation: shared cross-library interface belongs in shared canonical home. PeriodAssociation use across wood library (already exercised — 4 woodIdentification.ts self-uses on WoodSpeciesEntry/WoodSubspeciesEntry/EngineeredSubstrateEntry/CutGrainPhenomenonEntry + 5 woodEvidence.ts uses across 4 evidence interfaces) + maker marks library (this block via MakerMarkEntry.period_associations) + planned future libraries (joinery, fasteners, hardware, upholstery) satisfies the schema-occurrence rule 3+ threshold for promotion to entryShape.ts. JSDoc rewritten on relocation per Op A finding: original wood-specific contrast prose ("Distinct from woodEvidence.ts WoodRegionalAssociation pattern... this interface lives in identification because File B's per-species period tables are diagnostic context for identification, not evidence-layer weighting") became obsolete on cross-library promotion; replaced with cross-library framing referencing D-MM27-2 + planned consumers across joinery/fasteners/hardware/upholstery.

D-MM27-3 (locked): ReasoningRuleMigrationTarget enum migration from woodEvidence.ts to entryShape.ts. Parallel rationale to D-MM27-2. Any reasoning-rule library will use this enum; shared canonical home is the architecturally correct placement. Single-file relocation (no external importers); woodEvidence.ts combines imports into single entryShape.ts import line.

D-MM27-4 (locked): MakerMarkEntry interface shape per Q1 Option C — flat fields extending CanonicalEntry; 15 declared fields per Maker_Mark_Replacement_Seed.docx canonical entry shape. Categorical literal "maker_mark". Reuses PeriodAssociation (cross-library per D-MM27-2), PositionOnPiece (cross-library per Block 22.5), AntiClassificationGuidance (cross-library per Block 16) via entryShape.ts imports. Field roster: maker_name, region, furniture_categories, known_mark_types, common_mark_locations, known_wording, visual_traits, mark_text_patterns, period_associations, dating_clues, false_positive_warnings, attribution_confidence_rule, related_names, anti_classification_guidance?.

D-MM27-5 (locked): MakerAttributionReasoningRule interface shape parallel to WoodEvidenceReasoningRule. Same 6 declared fields: rule_name, rule_statement, rationale, migration_target, applies_to_entry_types?, cross_layer_scope?, plus inherited CanonicalEntry fields. Categorical literal "maker_attribution_reasoning_rule".

D-MM27-6 (locked): MarkType enum 14 values per Q2 Option E. Seed canonical 13 values (branded_stamp, paper_label, foil_label, decal, stencil, metal_tag, burned_mark, ink_stamp, impressed_mark, serial_style_number, catalog_plate, retailer_label, association_mark) + "unknown" appraiser-honest fallback. Legacy 10-value mark_type union on MakerMarkEntry_Legacy preserved unchanged for engine.ts compat; the legacy union had 5 dead-coded values (branded_mark, metal_tag, decal, signature, unknown) and conflated paper_label vs label naming — the new MarkType enum aligns to seed canonical categories with disambiguated naming.

D-MM27-7 (locked): common_mark_locations field on MakerMarkEntry uses PositionOnPiece[] per Q3 Option F. First non-wood library to exercise the cross-library PositionOnPiece architecture per Block 22.5 cross-source triangulation design intent. PhysicalLocation 34-value enum is sufficient for seed canonical mark-location set: Op A-5 mapping verified 13 of 15 seed mark-locations map cleanly to existing enum values; the 2 nuances (paper tags = MarkType not location; clock dial = physical_location_notes free-form supplement per D-PA-5 precedent) resolve without enum expansion. No PhysicalLocation enum changes this block.

D-MM27-8 (locked): Authority calibration per Q4 Option H. MakerMarkEntry per-entry authority populated by Block 28 per seed Attribution Confidence Rule per maker (expected range 6-8/6-8 depending on attribution rigor required for the specific maker). MakerAttributionReasoningRule entries 9/9 this block per D-WE22-11 / D-WE26-8 meta-rule supremacy precedent. Legacy MakerMarkEntry_Legacy entries retain their original confidence_weight (0-1 scale) + dating_authority (3-tier string) fields verbatim per Phase 2 / Phase 3 separation; the new canonical positive_authority / hard_negative_authority pattern populates only on new MakerMarkEntry entries.

D-MM27-9 (locked): Engine.ts compat per Q5 Option K. Legacy MAKER_MARKS array (25 entries) + legacy type alias (renamed MakerMarkEntry_Legacy) preserved verbatim. engine.ts UNCHANGED this block. Phase 2 / Phase 3 separation honored per synthesis Section 7.D + Independent Layer Evaluation Standard (D-WE26-6). Phase 3 weighting integration block activates the new MakerMarkEntry interface + MAKER_ENTRIES array and deprecates legacy.

D-MM27-10 (locked): Block sequencing per Q6 Option O. Two-block split: Block 27 schema + reasoning rules (this block); Block 28 ~78-82 MAKER_ENTRIES content authoring (subsequent). Three-block split (Option P) rejected as ceremony without architectural benefit for homogeneous content domain.

D-MM27-11 (locked): Legacy type alias rename from MakerMarkEntry to MakerMarkEntry_Legacy. Engine.ts imports MAKER_MARKS array only (not type) per recon Section 4 import inventory; rename is type-safe and engine-non-breaking. Preserves engine.ts runtime contract verbatim while freeing the MakerMarkEntry name for the new canonical interface.

D-MM27-12 (locked): Globe-Wernicke worked-example reasoning rule (rule #8 globe_wernicke_correction) forward-references the unauthored maker_mark_globe_wernicke_co entry id via applies_to_entry_types: ["maker_mark_globe_wernicke_co"]. Forward-reference is a string-content placeholder (applies_to_entry_types is string[]; no compile-time FK check); canonical id form is committed at Block 27 plan time; Block 28 commits to using the exact id when authoring the Globe-Wernicke maker entry. FK resolution becomes complete upon Block 28 ship. Pattern precedent: future per-maker worked-example rules may forward-reference unauthored maker_mark_* ids in the same way.

D-MM27-13 (locked): Wood library Block 26 "canonically complete" milestone covers wood library CONTENT scope. Schema-shared-interface migrations from wood-library files to entryShape.ts (D-MM27-2 PeriodAssociation, D-MM27-3 ReasoningRuleMigrationTarget) are architectural refactors preserving content semantics — analogous to Block 16 AntiClassificationGuidance relocation that did not retract forms.ts content closure. Wood library content remains canonically complete; the import paths to PeriodAssociation and ReasoningRuleMigrationTarget change from local-file definitions to entryShape.ts shared imports.

D-MM27-14 (locked): engine.ts:3506 latent bug surfaced during recon Section 4 — matchMakerMarks called with empty observations array; HARD GUARD at line 3292 always rejects; function is currently a no-op. Independent of Block 27 scope. Flagged for either Phase 3 cleanup or a separate dedicated one-PR fix outside Phase 2 Session 6. Not addressed this block per Phase 2 / Phase 3 separation discipline.

D-MM27-15 (locked): engine.ts:2346-2359 short-circuit early-return cross-reference. This pattern (early-return for confident maker-mark matches without continuing evidence accumulation) violates Independent Layer Evaluation Standard per D-WE26-6 / D-PA-1. Already audit-locked for Phase 3 cleanup per AUDIT_LOG.md:33. NOT in Block 27 scope. Cross-reference recorded here for traceability and to mark the expansion-design awareness of the deferred cleanup.

D-MM27-FINAL (locked): Block 27 ship — 5 files modified (entryShape.ts, woodIdentification.ts, woodEvidence.ts, makerMarks.ts, AUDIT_LOG.md). engine.ts UNCHANGED. PeriodAssociation interface relocated to entryShape.ts (rewritten cross-library JSDoc). ReasoningRuleMigrationTarget enum relocated to entryShape.ts. Wood library array contents unchanged (SPECIES_EVIDENCE 26, SUBSTRATE_EVIDENCE 5, CUT_GRAIN_EVIDENCE 35, WOOD_DIAGNOSTIC_SIGNALS 8, WOOD_EVIDENCE_REASONING_RULES 7). Legacy MAKER_MARKS array preserved (25 entries, content unchanged). NEW MakerMarkEntry interface (15 fields). NEW MakerAttributionReasoningRule interface (parallel to WoodEvidenceReasoningRule). NEW MarkType enum (14 values). NEW MAKER_ENTRIES array (empty; Block 28 populates). NEW MAKER_ATTRIBUTION_REASONING_RULES array (8 entries; all authority 9/9; migration_status: "complete"; migration_target distribution 7 engine_reasoning + 1 report_layer; cross_layer_scope: true on rule #1 only). Maker marks library schema foundation: COMPLETE. Phase 2 Session 6: started.

**Workflow standards applied.** Plan-mode Op A inspection (READ-ONLY) preceded all edits; PeriodAssociation reference inventory surfaced 16 references across 2 files with 4 woodIdentification.ts self-uses flagged for in-file import addition; ReasoningRuleMigrationTarget single-file relocation verified; PhysicalLocation 34-value enum mapping verified for 13/15 seed mark-locations with 2 nuances resolved via physical_location_notes per D-PA-5 precedent (no enum expansion); JSDoc cross-library rewrite scope confirmed pre-Op-B and applied. Pre-emptive schema discovery: CanonicalEntry / AntiClassificationGuidance / PositionOnPiece / PeriodAssociation / ReasoningRuleMigrationTarget all confirmed at expected line ranges; new MakerMarkEntry / MakerAttributionReasoningRule interfaces author against these shared canonical types. Forward-reference discipline: D-MM27-12 captures the maker_mark_globe_wernicke_co forward-reference from rule #8 for traceability through Block 28. Phase 2 / Phase 3 separation: engine.ts UNCHANGED per D-MM27-9; legacy MAKER_MARKS + MakerMarkEntry_Legacy preserved verbatim; D-MM27-14 / D-MM27-15 latent bug + short-circuit deferred per existing audit locks. Cross-library PositionOnPiece architecture exercise: first non-wood library use per D-MM27-7 validates the Block 22.5 D-PA-1 design intent.

**Final architectural state after this PR merges:**
- `lib/constraints/entryShape.ts` modified: ~411 lines (was 347 at Block 26 endpoint; +~64 net lines from PeriodAssociation + ReasoningRuleMigrationTarget relocations including rewritten cross-library JSDoc).
- `lib/constraints/woodIdentification.ts` modified: 3286 lines (was 3323; -37 net lines from PeriodAssociation removal; net delta reflects local declaration + JSDoc block removal offset by import-line PeriodAssociation addition).
- `lib/constraints/woodEvidence.ts` modified: 2283 lines (was 2297; -14 net lines from ReasoningRuleMigrationTarget removal + import line consolidation).
- `lib/constraints/makerMarks.ts` modified: ~525 lines (was 274; +~251 net lines from new schema + 8 reasoning rules; legacy section preserved verbatim).
- `lib/constraints/AUDIT_LOG.md` modified: +~75 lines (D-MM27-1 through D-MM27-15 + D-MM27-FINAL).
- `lib/engine.ts`: UNCHANGED (zero-diff verified per D-MM27-9).
- entryShape.ts post-state: PeriodAssociation interface present (cross-library JSDoc); ReasoningRuleMigrationTarget type alias present; CanonicalEntry / AntiClassificationGuidance / PhysicalLocation / FunctionalRole / PositionProvenance / ConsistencyPattern / TemporalLayer / PositionOnPiece all unchanged from Block 26 endpoint.
- woodIdentification.ts post-state: PeriodAssociation declaration REMOVED; PeriodAssociation imported from entryShape.ts (combined import line with CanonicalEntry + AntiClassificationGuidance); 4 self-uses on WoodSpeciesEntry / WoodSubspeciesEntry / EngineeredSubstrateEntry / CutGrainPhenomenonEntry resolve via the new import.
- woodEvidence.ts post-state: ReasoningRuleMigrationTarget declaration REMOVED; single consolidated entryShape.ts import line covers CanonicalEntry + AntiClassificationGuidance + PositionOnPiece + PeriodAssociation + ReasoningRuleMigrationTarget; all 5 arrays unchanged (SPECIES_EVIDENCE 26, SUBSTRATE_EVIDENCE 5, CUT_GRAIN_EVIDENCE 35, WOOD_DIAGNOSTIC_SIGNALS 8, WOOD_EVIDENCE_REASONING_RULES 7).
- makerMarks.ts post-state: imports from entryShape.ts (CanonicalEntry + AntiClassificationGuidance + PeriodAssociation + PositionOnPiece + ReasoningRuleMigrationTarget); MarkType enum 14 values; MakerMarkEntry interface 15 declared fields; MakerAttributionReasoningRule interface; MAKER_ENTRIES empty array; MAKER_ATTRIBUTION_REASONING_RULES 8 entries (all authority 9/9; all migration_status: "complete"; cross_layer_scope: true on rule #1 only; migration_target distribution 7 engine_reasoning + 1 report_layer); MakerMarkEntry_Legacy type alias preserved; MAKER_MARKS array (25 entries) preserved verbatim.
- engine.ts UNCHANGED — Phase 2 / Phase 3 separation honored per D-MM27-9.
- 16 audit decisions captured under D-MM27-N block-scoped prefix (D-MM27-1 through D-MM27-15 + D-MM27-FINAL).
- Phase 2 Session 6 maker marks library schema foundation: complete. Block 28 authors ~78-82 MAKER_ENTRIES content from Maker_Mark_Replacement_Seed.docx.
- Convention precedents established this block: cross-library architectural artifact promotion to entryShape.ts when 3+ libraries consume (D-MM27-2 / D-MM27-3); JSDoc rewrite on relocation when original prose contains domain-specific framing that becomes obsolete on cross-library promotion (D-MM27-2 surfacing); legacy-type-alias rename pattern (MakerMarkEntry → MakerMarkEntry_Legacy) for in-place Phase 2 / Phase 3 separation when freeing canonical names per D-MM27-11; forward-reference discipline for worked-example reasoning rules referencing unauthored entry ids per D-MM27-12.

---

### 2026-05-13 — Session 13 Block 28a — MAKER_ENTRIES content authoring, pre-MCM batch (39 entries across 7 era/category sub-batches)

**Scope.** First MAKER_ENTRIES content authoring per Block 22 D-WE22-12-style scaffold-then-populate sequencing. 39 MakerMarkEntry entries authored from Maker_Mark_Replacement_Seed.docx canonical source covering Early American & Regional + 19th-Century Victorian + Grand Rapids Factory + Office/Bookcase/Institutional + Arts & Crafts/Stickley + Wicker/Rattan/Reed + Cedar Chests/Bedroom eras. Block 27 D-MM27-12 forward-reference resolved (maker_mark_globe_wernicke_co entry id matches MAKER_ATTRIBUTION_REASONING_RULES rule #8 applies_to_entry_types FK). Legacy MAKER_MARKS (25 entries) preserved unchanged. engine.ts UNCHANGED per Phase 2 / Phase 3 separation. Wood library array contents unchanged. Block 28b queued (~38-42 20th-century onward makers).

**Architectural decisions (locked).**

D-MM28a-1 (locked): Block 28a scope per Q1 Option B two-batch split. Pre-MCM era/category cluster authored this block; 20th-century cluster (MCM + Designer Licensed + Upholstery + Clock/Specialty) authored in Block 28b. Block 28a final count: 39 entries across 7 sub-batches.

D-MM28a-2 (locked): Per-maker authority calibration per Q2 Option E. Authority pairs populated from seed Attribution Confidence Rule prose per maker. Distribution observed: positive_authority range 4-8 (median 7); hard_negative_authority range 6-9 (median 7). Highest hard_negative (9): Grand Rapids Furniture Association triangle mark (regional association mark; very high false-attribution risk); Globe-Wernicke Co. (worked-example correction per rule #8 + 'GW alone never identifies' discipline). Lowest positive (4): Shaker communities (most pieces unmarked; provenance-required). Highest positive (8): Phyfe, Hitchcock, Belter, Herter Brothers, Wooton, Berkey & Gay, Globe-Wernicke, Gustav Stickley, L. & J.G. Stickley, Roycroft, Heywood Brothers & Wakefield Co., Heywood-Wakefield Co.

D-MM28a-3 (locked): Lineage handling per Q3 Option I. Multi-entry lineage cases encoded as independent entries with AntiClassificationGuidance at lineage-boundary years: (a) Heywood-Wakefield 4-entry cluster — Heywood Brothers (1826-1897 ceiling AG) + Wakefield Rattan Co. (1855-1897 ceiling AG) + Heywood Brothers & Wakefield Co. (1897-1921 with reciprocal AGs at 1897 emergence + 1921 extinction) + Heywood-Wakefield Co. (1921-onward with AG at 1921 emergence); (b) Stickley 4-entry cluster — Gustav Stickley (1900-1916 with extinction AG at 1916) + L. & J.G. Stickley + Stickley Brothers + Stickley Associated Cabinetmakers (each per-entry attribution_confidence_rule discourages cross-Stickley attribution); (c) Hitchcock single entry with prominent AG at 1948 revival boundary (form_emergence type). Total AntiClassificationGuidance entries authored this block: 7 (single AG on 6 entries + array of 2 on Heywood Brothers & Wakefield Co.).

D-MM28a-4 (locked): Block 27 D-MM27-12 forward-reference RESOLVED. maker_mark_globe_wernicke_co entry authored in Batch 4 (Office/Bookcase/Institutional) with exact id matching MAKER_ATTRIBUTION_REASONING_RULES rule #8 (globe_wernicke_correction) applies_to_entry_types FK. Rule #8 FK now resolves canonically. Block 27 forward-reference closure complete.

D-MM28a-5 (locked): Authority calibration discipline cross-references seed canonical source via per-entry notes field. Notes prose captures "Per Maker_Mark_Replacement_Seed.docx <era/category section>" citation pattern enabling future authority reconciliation audit (Phase 2 Session 8) to trace per-maker calibration back to canonical source.

D-MM28a-6 (locked): Heywood-Wakefield Co. (1921-onward) entry spans both Block 28a (1921-1949 pre-MCM phase) and Block 28b (post-1949 MCM era). Per Op A-7 surfacing + execution authorization, entry authored single in Block 28a with phase-aware period_associations: (1) wicker continuation 1921-1940; (2) MCM birch case goods 1930-1970; (3) eagle stamp era 1949-1979. Block 28b cross-references this entry rather than re-authoring.

D-MM28a-7 (locked): Surfacing 1 "Early American General rule" disposition. Per execution-time decision: SKIP the "General rule" section preamble as a maker entry. Discipline already lives in MAKER_ATTRIBUTION_REASONING_RULES rule #1 (Core Attribution Rule) and rule #2 (Initials Not Enough); separate maker entry would be redundant and the seed structure shows "General rule" as section header introducing two genuine maker-shape entries (Cabinetmaker paper labels + Shaker communities). Batch 1 ships at 2 entries; Block 28a total: 39.

D-MM28a-8 (locked): Universal-rule cross-references in false_positive_warnings prose. Maker entries with false positives matching MAKER_ATTRIBUTION_REASONING_RULES Universal Rules #1-5 include explicit cross-reference prose in their false_positive_warnings arrays. Counts: Universal Rule #1 (initials_not_enough) referenced in Berkey & Gay, Globe-Wernicke, Yawman & Erbe; Universal Rule #2 (city_not_maker) referenced in Mitchell & Rammelsberg, A. H. Andrews, Grand Rapids Triangle, Berkey & Gay, Macey, Wakefield Rattan Co., Phoenix Furniture Co.; Universal Rule #4 (association_not_single) referenced in Grand Rapids Triangle; Universal Rule #5 (line_name_not_maker) referenced in Phyfe, Hitchcock, Widdicomb Furniture Co., John Widdicomb, Imperial Furniture Co., Gustav Stickley, L. & J.G. Stickley, Stickley Brothers, Stickley Associated Cabinetmakers, Lifetime Furniture, Wakefield Rattan Co.

D-MM28a-9 (locked): PhysicalLocation enum coverage validated at scale. All 39 entries' common_mark_locations populate from existing 34-value PhysicalLocation enum + physical_location_notes free-form supplement per D-PA-5 precedent. Form-specific specialty cases (cedar chest interiors via lid_or_top_movable + functional_role: specialized_function; roll-top desk compartments; clock case interiors) resolve cleanly without enum expansion. Block 27 D-MM27-7 cross-library PositionOnPiece architecture validated at scale across 39 maker entries.

D-MM28a-10 (locked): Legacy MAKER_MARKS preservation reconfirmed at scale. Per Block 27 D-MM27-9 Phase 2 / Phase 3 separation: legacy MAKER_MARKS 25-entry array UNCHANGED; legacy roos_sweetheart_label and lane_furniture_label entries coexist with new maker_mark_roos_manufacturing and maker_mark_lane_company entries in MAKER_ENTRIES. The legacy and new arrays serve different consumers (engine.ts reads legacy MAKER_MARKS; future Phase 3 weighting integration reads MAKER_ENTRIES). engine.ts UNCHANGED.

D-MM28a-11 (locked): Single tsc error mid-authoring (regional_associations: undefined on Hitchcock entry — wrong field name, not in MakerMarkEntry interface). Resolved by field removal. No schema mutation; the typo reflected accidental wood-library-pattern reach-through. No D-MM28a-N decision impact; flagged here for traceability and as reminder that MakerMarkEntry does NOT carry regional_associations — region is captured via the single 'region' string field per seed structure.

D-MM28a-FINAL (locked): Block 28a ship — 39 MakerMarkEntry entries authored across 7 sub-batches. MAKER_ENTRIES.length: 0 → 39. All other array lengths unchanged (SPECIES_EVIDENCE 26, SUBSTRATE_EVIDENCE 5, CUT_GRAIN_EVIDENCE 35, WOOD_DIAGNOSTIC_SIGNALS 8, WOOD_EVIDENCE_REASONING_RULES 7, MAKER_MARKS 25, MAKER_ATTRIBUTION_REASONING_RULES 8). Authority distribution: positive 4-8 (median 7) / hard_negative 6-9 (median 7). 7 AntiClassificationGuidance entries authored across 6 entries (Hitchcock single AG at 1948; Gustav Stickley extinction AG at 1916; Heywood Brothers extinction AG at 1897; Wakefield Rattan Co. extinction AG at 1897; Heywood Brothers & Wakefield Co. AG ARRAY of 2 at 1897 emergence + 1921 extinction; Heywood-Wakefield Co. emergence AG at 1921). Forward-references closed: D-MM27-12 (Globe-Wernicke FK resolves canonically). Block 28b queued: ~38-42 20th-century onward makers (MCM + Designer Licensed + Upholstery + Clock/Specialty eras).

**Workflow standards applied.** Op A pre-flight inspection (READ-ONLY) preceded all authoring; seed file located at /root/.claude/uploads/<session>/<file>.docx (not at the plan prompt's /mnt/user-data/uploads/ path; CC located via ls); seed extracted via unzip + python3 XML strip to /tmp/seed.txt (no pandoc required); 7 sub-batch grouping validated against seed section enumeration; per-batch entry counts confirmed (2 + 10 + 7 + 5 + 7 + 4 + 4 = 39); Block 27 endpoint state verified at acdd38f. Pre-emptive schema discovery: MakerMarkEntry interface 15 fields + MarkType 14 values + PositionOnPiece + PeriodAssociation + AntiClassificationGuidance all confirmed at expected line ranges. FK target verification: D-MM27-12 forward-reference id form (maker_mark_globe_wernicke_co) locked at plan time and authored verbatim in Batch 4. Source-document citation: every entry's notes field cites Maker_Mark_Replacement_Seed.docx era/category section; period_associations usage_notes cites seed Date Range prose. Appraiser-honest calibration: low positive_authority (4) on Shaker communities reflects most-pieces-unmarked discipline; very high hard_negative_authority (9) on Grand Rapids triangle + Globe-Wernicke reflects acute false-attribution risk per seed false positive warnings + Universal Rules. Independent Layer Evaluation Standard discipline: per-maker entry false_positive_warnings cross-reference Universal Rules #1-5 from MAKER_ATTRIBUTION_REASONING_RULES rather than embedding rules in entry-side prose; the rule-vs-entry separation preserves the meta-rule / content-entry architectural boundary. Mid-authoring surfacing: single tsc error (D-MM28a-11) reflects accidental wood-library-pattern reach-through; resolved without schema impact.

**Final architectural state after this PR merges:**
- `lib/constraints/makerMarks.ts` modified: ~1500+ lines (was 592 at Block 27 endpoint; +~900-1000 net lines from 39 entries averaging ~25-30 lines each).
- `lib/constraints/AUDIT_LOG.md` modified: +~75 lines (D-MM28a-1 through D-MM28a-11 + D-MM28a-FINAL).
- `MAKER_ENTRIES.length === 39` (was 0); first canonical population of the new MakerMarkEntry array.
- All 39 entries: category "maker_mark"; positive_authority 4-8; hard_negative_authority 6-9; populated maker_name + region + furniture_categories + known_mark_types + common_mark_locations + known_wording + visual_traits + mark_text_patterns + period_associations + dating_clues + false_positive_warnings + attribution_confidence_rule + related_names + indicator_text + notes.
- 6 entries carry anti_classification_guidance (single AG): Hitchcock (1948 form_emergence); Gustav Stickley (1916 form_extinction); Heywood Brothers (1897 form_extinction); Wakefield Rattan Co. (1897 form_extinction); Heywood-Wakefield Co. (1921 form_emergence); plus Heywood Brothers & Wakefield Co. carrying AG ARRAY of 2 (1897 form_emergence + 1921 form_extinction).
- Total AntiClassificationGuidance objects authored: 7 (5 single + 1 array of 2).
- All 39 entries' common_mark_locations resolve to 34-value PhysicalLocation enum + physical_location_notes free-form supplement; no enum expansion required.
- Block 27 D-MM27-12 Globe-Wernicke forward-reference CLOSED via maker_mark_globe_wernicke_co entry authored in Batch 4.
- `SPECIES_EVIDENCE.length === 26` unchanged.
- `SUBSTRATE_EVIDENCE.length === 5` unchanged.
- `CUT_GRAIN_EVIDENCE.length === 35` unchanged.
- `WOOD_DIAGNOSTIC_SIGNALS.length === 8` unchanged.
- `WOOD_EVIDENCE_REASONING_RULES.length === 7` unchanged.
- `MAKER_MARKS.length === 25` (legacy) unchanged per Q5 Option K Phase 2 / Phase 3 separation.
- `MAKER_ATTRIBUTION_REASONING_RULES.length === 8` unchanged.
- `lib/constraints/entryShape.ts`, `lib/constraints/woodIdentification.ts`, `lib/constraints/woodEvidence.ts`: byte-for-byte unchanged.
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation.
- 12 audit decisions captured under D-MM28a-N block-scoped prefix (D-MM28a-1 through D-MM28a-11 + D-MM28a-FINAL).
- Phase 2 Session 6 maker marks library content authoring: 39 of ~78-82 expected entries complete. Block 28b queued for remaining ~38-42 20th-century onward makers (MCM + Designer Licensed + Upholstery + Clock/Specialty).
- Convention precedents established this block: per-maker authority calibration from seed Confidence Rule prose with notes-field source citation pattern (D-MM28a-2 / D-MM28a-5); AntiClassificationGuidance ARRAY shape for multi-boundary lineage entries (Heywood Brothers & Wakefield Co. 1897 + 1921 dual-boundary case); per-entry Universal-Rule cross-references in false_positive_warnings prose enabling engine to surface universal-rule context at report layer (D-MM28a-8); cross-batch single-entry pattern for firms spanning multiple era/category sub-batches with phase-aware period_associations (D-MM28a-6 Heywood-Wakefield Co.).

---

### 2026-05-13 — Session 13 Block 28b — MAKER_ENTRIES content authoring, 20th-century onward batch (38 entries across 4 era/category sub-batches); Phase 2 Session 6 closes

**Scope.** Completes Block 28's Q1 Option B two-batch split begun with Block 28a's 39-entry pre-MCM ship. 38 MakerMarkEntry entries authored from Maker_Mark_Replacement_Seed.docx covering MCM and 20th-Century Case Goods (27) + Designer/Modern Licensed Production (4) + Upholstery and Seating Makers (4) + Clock and Specialty Furniture Makers (3) eras. Drexel / Drexel Heritage 1969 boundary handled per seed structure as combined entry with single form_emergence AG (not reciprocal-pair pattern; Q1 Option A reciprocal AG framing diverged from seed structure per Op A-4 Surfacing 1 resolution). Heywood-Wakefield Co. cross-batch coordination preserved per D-MM28a-6 (no Block 28b re-authoring). Legacy MAKER_MARKS (25 entries) preserved unchanged. engine.ts UNCHANGED per Phase 2 / Phase 3 separation. Wood library array contents unchanged. Maker marks library MAKER_ENTRIES post-Block-28b: 77 entries (39 Block 28a + 38 Block 28b). Phase 2 Session 6 maker marks library content authoring: COMPLETE.

**Architectural decisions (locked).**

D-MM28b-1 (locked): Block 28b scope completes Block 28's Q1 Option B two-batch split. Block 28a authored 39 pre-MCM makers; Block 28b authors 38 20th-century onward makers across MCM/Designer-Licensed/Upholstery/Clock-Specialty eras. Maker marks library MAKER_ENTRIES content-complete on Block 28b ship at 77 entries total (slightly below plan estimate ~78-82; difference reflects Op A-3 actual seed count + Op A-4 Drexel single-combined-entry treatment per Surfacing 1 resolution, not Q1 Option A literal split). Phase 2 Session 6 closes.

D-MM28b-2 (locked): Drexel / Drexel Heritage handled per Op A-4 Surfacing 1 resolution + Mike approval. Seed treats Drexel and Drexel Heritage as combined entry; Q1 Option A reciprocal-AG framing (designed for separate-entry lineage like Heywood-Wakefield) does NOT fit seed structure. Single combined "Drexel / Drexel Heritage" entry authored with form_emergence AG at 1969 marking name change within the entry (rather than reciprocal-pair pattern). Separate "Heritage / Drexel Heritage" entry authored per seed structure (seed line 133). Block 28b total: 38 entries (not 39 as Q1 Option A literal split would have produced).

D-MM28b-3 (locked): Designer-licensed entries (Eames/Nelson for Herman Miller; Saarinen/Bertoia for Knoll) authored per Q2 Option G as MakerMarkEntry with synthesized field values: maker_name encodes licensed collaboration ("Eames designs for Herman Miller", "Nelson designs for Herman Miller", "Saarinen designs for Knoll", "Bertoia designs for Knoll"); region maps to license-holder production location (Zeeland MI for Herman Miller; New York / Pennsylvania for Knoll); furniture_categories encode designer's specific furniture line; related_names captures designer name + license-holder name + licensing relationship phrase. Authority pattern: positive_authority 7 (moderate; depends on licensed-manufacturer label presence); hard_negative_authority 8-9 (elevated for pervasive style-misattribution risk per knockoff industry — Tulip/Bertoia wire chairs at 9 due to extreme reproduction prevalence; Eames/Nelson at 8). Universal Rule #5 line_name_not_maker cross-referenced in false_positive_warnings prose on all 4 entries per established convention.

D-MM28b-4 (locked): Heywood-Wakefield Co. cross-batch coordination per Q3 Option H. The Heywood-Wakefield Co. (1921-onward) MakerMarkEntry was authored in Block 28a per D-MM28a-6 covering full 1921-present production including the MCM era (1949-1979 eagle-stamp + 1930-1970 birch case goods phases) via phase-aware period_associations array. Block 28b does NOT re-author. Block 28b's MCM-era seed content for Heywood-Wakefield routes to the existing Block 28a entry; no Block 28b entry created. Audit cross-reference preserves traceability per future Phase 2 Session 8 authority reconciliation audit needs.

D-MM28b-5 (locked): Maker marks library content state post-Block-28b: MAKER_ENTRIES.length === 77 (39 Block 28a + 38 Block 28b). Phase 2 Session 6 maker marks content authoring: COMPLETE. Schema foundation per Block 27 + content authoring per Block 28a/28b + reasoning rules per Block 27 + legacy compat per Q5 Option K = canonical maker marks library state for handoff to Phase 2 Session 8 (authority reconciliation) or alternative Phase 2 Session 9 sequencing per Mike's Phase 2 navigation.

D-MM28b-6 (locked): All 4 designer-licensed entries carry the established Universal Rule #5 line_name_not_maker cross-reference in false_positive_warnings prose. Pattern consistency with Block 28a Universal Rule cross-references (Block 28a entries with city-based false positives cross-referenced Universal Rule #2; association marks Universal Rule #3; etc.). Cross-reference pattern reinforced as canonical convention for Block 28b authoring. Block 28b Universal Rule cross-reference counts: #1 initials_not_enough referenced in 0 entries (no Block 28b entries surface initials-only false positives prominent enough to call out); #2 city_not_maker referenced in 11 entries (Bassett, American of Martinsville, United Furniture, Pennsylvania House, Tell City Chair Co., Ethan Allen, Pulaski, Lexington, Hickory Chair, Baker Furniture, Kindel, Colonial Manufacturing Co.); #4 association_not_single referenced in 0 entries (no Block 28b association marks); #5 line_name_not_maker referenced in 14 entries (Herman Miller, Knoll, Drexel, Broyhill, Stanley Furniture, Thomasville, Hancock & Moore, Lexington, Councill Craftsmen, Heritage / Drexel Heritage, Century Furniture, Eames-for-Herman-Miller, Nelson-for-Herman-Miller, Saarinen-for-Knoll, Bertoia-for-Knoll, Colonial Manufacturing Co.).

D-MM28b-7 (locked): Authority distribution across Block 28b. positive_authority range 6-8 (median 7); hard_negative_authority range 6-9 (median 7). Distribution detail: positive_authority {6:2, 7:30, 8:6}; hard_negative_authority {6:4, 7:30, 8:2, 9:2}. Highest positive (8): Herman Miller, Knoll, Henredon, Baker Furniture, Kittinger, Sikes Chair Co., Howard Miller. Highest hard_negative (9): Saarinen-for-Knoll, Bertoia-for-Knoll (Tulip and wire-chair reproduction prevalence). Lowest positive (6): Heritage / Drexel Heritage, Colonial Manufacturing Co. (generic-term false-positive risk).

D-MM28b-8 (locked): Lineage AG entries Block 28b summary. Single form_emergence AG at 1969 on Drexel / Drexel Heritage combined entry per D-MM28b-2. No other lineage AG entries in Block 28b scope — 20th-century factory makers are mostly single-firm production with continuing operations or simple cessations not requiring AG. Total Block 28b AntiClassificationGuidance count: 1 single AG. Combined library AG count post-Block-28b: Block 27 (0) + Block 28a (7 objects across 6 entries) + Block 28b (1) = 8 AntiClassificationGuidance objects across 7 entries in MAKER_ENTRIES.

D-MM28b-9 (locked): Clock/specialty makers Howard Miller + Ridgeway + Colonial Manufacturing Co. authored using D-PA-5 physical_location_notes fallback for clock dial mark locations per Block 28a A-5 precedent. Specifically: physical_location: "show_surface" + physical_location_notes: "clock dial face" + functional_role: "specialized_function" for dial-mark locations; physical_location: "show_surface" + physical_location_notes: "clock movement plate (interior)" + functional_role: "specialized_function" for Howard Miller's movement-plate marks. No PhysicalLocation enum expansion required.

D-MM28b-10 (locked): Three Zeeland Michigan makers cross-referenced in Block 28b: Herman Miller (Mid-Century Modern Case Goods), Howard Miller (Clock and Specialty), and Colonial Manufacturing Co. (Clock and Specialty). Each entry's related_names captures the cross-reference for engine reasoning: "Howard Miller (sibling firm, Zeeland MI, distinct)" on Herman Miller entry; "Herman Miller (sibling firm, Zeeland MI, distinct)" on Howard Miller entry; "Herman Miller (Zeeland MI, distinct)" + "Howard Miller (Zeeland MI, distinct)" on Colonial Manufacturing Co. entry. Universal Rule #2 city_not_maker cross-referenced in Colonial Manufacturing Co. false_positive_warnings since Zeeland MI hosts three distinct makers.

D-MM28b-FINAL (locked): Block 28b ship — 38 MAKER_ENTRIES entries authored across 4 batches (27 MCM + 4 Designer-Licensed + 4 Upholstery + 3 Clock/Specialty). MAKER_ENTRIES.length: 39 → 77. All other array lengths unchanged (SPECIES_EVIDENCE 26, SUBSTRATE_EVIDENCE 5, CUT_GRAIN_EVIDENCE 35, WOOD_DIAGNOSTIC_SIGNALS 8, WOOD_EVIDENCE_REASONING_RULES 7, MAKER_MARKS 25, MAKER_ATTRIBUTION_REASONING_RULES 8). Authority distribution post-Block-28b combined (39+38=77 entries): positive_authority range 4-8; hard_negative_authority range 6-9. Total AntiClassificationGuidance count: 8 objects across 7 entries. Forward-references: none new; D-MM27-12 closed in Block 28a; no Block 28b forward-references. Maker marks library: CANONICALLY CONTENT-COMPLETE. Phase 2 Session 6: CLOSES. Next sequencing per Mike's Phase 2 navigation (Phase 2 Session 8 authority reconciliation OR Phase 2 Session 9 HCL / styleFamilies.ts authoring).

**Workflow standards applied.** Op A pre-flight inspection (READ-ONLY) preceded all authoring; seed file located at /root/.claude/uploads/<session>/<file>.docx; seed text persisted at /tmp/seed.txt from Block 28a; 4 sub-batch grouping validated against seed section enumeration; per-batch entry counts confirmed (27 + 4 + 4 + 3 = 38); Block 28a endpoint state verified at 60093ba. Pre-emptive verification: MakerMarkEntry interface 15 fields + MarkType 14 values + PositionOnPiece + PeriodAssociation + AntiClassificationGuidance unchanged from Block 27 / Block 28a state. Op A-4 Surfacing 1 (Drexel seed structure divergence from Q1 Option A reciprocal-pair lock) surfaced and resolved via Mike-approved default before Op C. Per-batch tsc check executed after each of 4 batches (all clean). Source-document citation: every entry's notes field cites Maker_Mark_Replacement_Seed.docx era/category section; period_associations usage_notes cites seed Date Range prose. Appraiser-honest calibration: elevated hard_negative_authority (9) on Saarinen/Bertoia-for-Knoll reflects extreme Tulip/wire-chair reproduction prevalence per seed Confidence Rules; moderate hard_negative (6) on Sikes Chair Co. reflects specialty-naming-convention advantage per seed insight. Independent Layer Evaluation Standard discipline maintained: per-maker entry false_positive_warnings cross-reference Universal Rules from MAKER_ATTRIBUTION_REASONING_RULES rather than embedding rules in entry-side prose; rule-vs-entry separation preserved. Cross-batch single-entry pattern (Heywood-Wakefield Co. per D-MM28a-6) honored — Block 28b does not re-author. No mid-authoring surfacings warranting Mike review.

**Final architectural state after this PR merges:**
- `lib/constraints/makerMarks.ts` modified: ~3100+ lines (was 1899 at Block 28a endpoint; +~1200 net lines from 38 entries averaging ~30 lines each plus batch headers).
- `lib/constraints/AUDIT_LOG.md` modified: +~70 lines (D-MM28b-1 through D-MM28b-10 + D-MM28b-FINAL).
- `MAKER_ENTRIES.length === 77` (39 Block 28a + 38 Block 28b); maker marks library content-complete.
- All 38 Block 28b entries: category "maker_mark"; positive_authority 6-8; hard_negative_authority 6-9; populated maker_name + region + furniture_categories + known_mark_types + common_mark_locations + known_wording + visual_traits + mark_text_patterns + period_associations + dating_clues + false_positive_warnings + attribution_confidence_rule + related_names + indicator_text + notes.
- 1 Block 28b entry carries anti_classification_guidance (Drexel / Drexel Heritage single form_emergence AG at 1969 per D-MM28b-2).
- All 38 entries' common_mark_locations resolve to 34-value PhysicalLocation enum + physical_location_notes free-form supplement; no enum expansion required.
- Block 27 D-MM27-12 Globe-Wernicke forward-reference remains CLOSED via Block 28a maker_mark_globe_wernicke_co; no Block 28b forward-references.
- `SPECIES_EVIDENCE.length === 26` unchanged.
- `SUBSTRATE_EVIDENCE.length === 5` unchanged.
- `CUT_GRAIN_EVIDENCE.length === 35` unchanged.
- `WOOD_DIAGNOSTIC_SIGNALS.length === 8` unchanged.
- `WOOD_EVIDENCE_REASONING_RULES.length === 7` unchanged.
- `MAKER_MARKS.length === 25` (legacy) unchanged per Q5 Option K Phase 2 / Phase 3 separation.
- `MAKER_ATTRIBUTION_REASONING_RULES.length === 8` unchanged.
- `lib/constraints/entryShape.ts`, `lib/constraints/woodIdentification.ts`, `lib/constraints/woodEvidence.ts`: byte-for-byte unchanged.
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation.
- 11 audit decisions captured under D-MM28b-N block-scoped prefix (D-MM28b-1 through D-MM28b-10 + D-MM28b-FINAL).
- Phase 2 Session 6 maker marks library: 77 of expected ~78-82 entries content-complete (slight under-count vs plan estimate reflects Op A actual seed count + Drexel single-combined-entry treatment per Surfacing 1).
- Convention precedents reinforced this block: designer-licensed entry shape with synthesized maker_name encoding licensed collaboration + region mapping to license-holder location + Universal Rule #5 cross-reference pattern (D-MM28b-3); single form_emergence AG for in-firm name-change boundaries when seed treats lineage as combined entry rather than reciprocal pair (D-MM28b-2); cross-batch single-entry preservation when prior block authored the multi-era firm (D-MM28b-4).

---

### 2026-05-13 — Session 14 Block 29 — Phase 2 Session 8a Authority Reconciliation Audit (composite analysis across 6 canonical libraries; 441 entries; audit-and-defer per Mike's end-of-Phase-2 reconciliation pass call)

**Scope.** Composite authority-calibration audit across the 6 canonical libraries currently in lib/constraints/: wood library (5 arrays; 81 entries: SPECIES_EVIDENCE 26 + SUBSTRATE_EVIDENCE 5 + CUT_GRAIN_EVIDENCE 35 + WOOD_DIAGNOSTIC_SIGNALS 8 + WOOD_EVIDENCE_REASONING_RULES 7); maker marks library (2 arrays; 85 entries: MAKER_ENTRIES 77 + MAKER_ATTRIBUTION_REASONING_RULES 8); forms library (FORMS 183); families library (FAMILIES 12); spatial behaviors library (SPATIAL_BEHAVIORS 76); construction logic library (CONSTRUCTION_LOGIC 4). Total 441 canonical entries audited (excluding 25-entry legacy MAKER_MARKS retained for engine.ts compat per D-MM27-9). styleFamilies.ts + historicalClueLibrary.ts + four-file evidence libraries (joinery / fasteners / hardware / upholstery covers / upholstery construction) excluded per non-existence + Phase 2 Session 9+ scheduling. Output: audit-and-defer per Q2 Option H — NO entry mutations this block. Reconciliation corrections deferred to end-of-Phase-2 reconciliation pass per Mike's architectural call (Block 29 Op C revision). engine.ts UNCHANGED per Phase 2 / Phase 3 separation.

**Methodology.** Q1 Option E composite audit covering three dimensions: (a) cross-library scale comparability via anchor-entry identification + cross-library matrix construction; (b) within-library distribution sanity via per-library authority histograms compared to baseline-lock or canonical-source rationale; (c) sampled per-entry calibration audit (~10-15% per library = 52 entries total). Q3 Option I+J anchor + rationale comparison. Q4 Option L single-block audit-and-defer. Tsx runtime introspection for distributions + sampling; cleanup of ephemeral scratch file before commit per established workflow standard.

---

#### Section 1 — Composite Library Inventory

| Library | Array | Entries | Baseline framing |
|---|---|---|---|
| Wood | SPECIES_EVIDENCE | 26 | 6/6 per D-WE22-11 (supporting-evidence-only discipline) |
| Wood | SUBSTRATE_EVIDENCE | 5 | 8/8 per D-WE22-11 declaration; actual 6-7 per D-WE23b-1 per-entry calibration |
| Wood | CUT_GRAIN_EVIDENCE | 35 | 7/7 per D-WE22-11 |
| Wood | WOOD_DIAGNOSTIC_SIGNALS | 8 | 7/7 per D-WE22-11 |
| Wood | WOOD_EVIDENCE_REASONING_RULES | 7 | 9/9 meta-rule supremacy per D-WE22-11 |
| Maker | MAKER_ENTRIES | 77 | per-maker per seed Confidence Rule (D-MM28a-2 / D-MM28b-7) |
| Maker | MAKER_ATTRIBUTION_REASONING_RULES | 8 | 9/9 meta-rule supremacy |
| Maker | MAKER_MARKS (legacy; EXCLUDED) | 25 | legacy 0-1 confidence_weight; engine compat only per D-MM27-9 |
| Forms | FORMS | 183 | per-form Session 2-5 authoring; observed 7-8 range |
| Forms | FAMILIES | 12 | per-family Session 3 authoring; observed 8/8 uniform |
| Forms | SPATIAL_BEHAVIORS | 76 | per-spatial Session 3/5 authoring; observed 8/8 uniform |
| Forms | CONSTRUCTION_LOGIC | 4 | per-CL Session 3 authoring; observed 8/8 uniform |
| **TOTAL canonical** | | **441** | |

---

#### Section 2 — Per-Library Authority Distribution Histograms

| Library | n | positive (range; mean; dist) | hard_neg (range; mean; dist) |
|---|---|---|---|
| SPECIES_EVIDENCE | 26 | 6-6 (6.00; {6:26}) | 6-6 (6.00; {6:26}) |
| SUBSTRATE_EVIDENCE | 5 | 6-7 (6.60; {6:2, 7:3}) | 6-7 (6.60; {6:2, 7:3}) |
| CUT_GRAIN_EVIDENCE | 35 | 7-7 (7.00; {7:35}) | 7-7 (7.00; {7:35}) |
| WOOD_DIAGNOSTIC_SIGNALS | 8 | 7-7 (7.00; {7:8}) | 7-7 (7.00; {7:8}) |
| WOOD_EVIDENCE_REASONING_RULES | 7 | 9-9 (9.00; {9:7}) | 9-9 (9.00; {9:7}) |
| MAKER_ENTRIES | 77 | 4-8 (7.05; {4:1, 5:2, 6:6, 7:51, 8:17}) | 6-9 (7.19; {6:6, 7:54, 8:13, 9:4}) |
| MAKER_ATTRIBUTION_REASONING_RULES | 8 | 9-9 (9.00; {9:8}) | 9-9 (9.00; {9:8}) |
| FORMS | 183 | 7-8 (7.73; {7:49, 8:134}) | 7-8 (7.73; {7:49, 8:134}) |
| FAMILIES | 12 | 8-8 (8.00; {8:12}) | 8-8 (8.00; {8:12}) |
| SPATIAL_BEHAVIORS | 76 | 8-8 (8.00; {8:76}) | 8-8 (8.00; {8:76}) |
| CONSTRUCTION_LOGIC | 4 | 8-8 (8.00; {8:4}) | 8-8 (8.00; {8:4}) |

**Composite distribution across all 441 canonical entries:**
- `positive_authority`: {4:1, 5:2, 6:34, 7:146, 8:243, 9:15}
- `hard_negative_authority`: {6:34, 7:149, 8:239, 9:19}

**Distribution observations:** 243 of 441 entries (55%) populate `positive_authority = 8` — the largest single cluster across the canonical inventory. This cluster spans 5 of the 6 audited libraries (only WOOD_EVIDENCE_REASONING_RULES + MAKER_ATTRIBUTION_REASONING_RULES at 9/9 baseline omit the 8-population; SPECIES_EVIDENCE at 6/6 baseline omits; CUT_GRAIN_EVIDENCE / WOOD_DIAGNOSTIC_SIGNALS at 7/7 baseline omit). MAKER_ENTRIES alone exercises full 4-8 / 6-9 spread per per-maker-via-seed-Confidence-Rule discipline (D-MM28a-2).

---

#### Section 3 — Cross-Library Scale Comparability Matrix

| Authority | Representative entries (sampled across libraries) | Rationale strength |
|---|---|---|
| **9** | WOOD_EVIDENCE_REASONING_RULES: wood_alone_never_dates_furniture, secondary_woods_often_more_diagnostic_than_show_wood, visible_wood_not_structural_wood, etc. (7 entries) — MAKER_ATTRIBUTION_REASONING_RULES: core_attribution_rule, universal_initials_not_enough, confidence_ladder, globe_wernicke_correction, etc. (8 entries) | Uniformly dense canonical-source rationale via rule_name + rule_statement + rationale + notes prose. Meta-rule supremacy semantically clean. ✓ |
| **8** | MAKER_ENTRIES: maker_mark_duncan_phyfe (strict-attribution; 'Duncan Phyfe style' false-positive risk), maker_mark_herter_brothers (Vanderbilt commissions), maker_mark_wooton_desk_company (patented configuration), maker_mark_globe_wernicke_co (resolves D-MM27-12 forward-reference); FORMS: form_secretary_desk, form_slant_front_desk, form_side_chair, form_easel, form_music_stand, form_lectern, etc.; FAMILIES: family_bedroom_clothing_storage, family_dining_service_storage, etc. (all 12 at 8/8); SPATIAL_BEHAVIORS: spatial_horizontal_storage, spatial_vertical_storage, etc. (all 76 at 8/8); CONSTRUCTION_LOGIC: construction_case, construction_frame, construction_surface, construction_mechanical_integrated (all 4 at 8/8) | **HIGHLY ASYMMETRIC.** Phyfe-class strict-attribution at 8/8 carries dense per-maker rationale citing seed Confidence Rule + false-positive prevalence; routine forms/families/spatial/CL entries at 8/8 carry dense `description` field prose but no per-entry authority-justification distinguishing 8 from 7 or 9. **Issue 2 deferred to end-of-Phase-2 reconciliation pass per D-AR29-7.** |
| **7** | SUBSTRATE_EVIDENCE: substrate_evidence_plywood, substrate_evidence_particleboard, substrate_evidence_mdf (3 entries at 7/7); CUT_GRAIN_EVIDENCE: cut_grain_evidence_flat_sawn, cut_grain_evidence_quarter_sawn, cut_grain_evidence_rift_sawn, etc. (35 entries at 7/7 uniformly); WOOD_DIAGNOSTIC_SIGNALS: wood_diagnostic_signal_massive_solid_oak, wood_diagnostic_signal_thick_walnut_veneer, etc. (8 entries at 7/7 uniformly); MAKER_ENTRIES: 51 entries at 7/7 majority cluster (most factory makers); FORMS: 49 entries at 7/7 minority | Mostly clean per per-library D-WE22-11 baseline lockwork. Wood evidence layer + diagnostic signals carry dense rationale via diagnostic_caution_text / confidence_notes fields. Forms 7/7 cluster lacks per-entry rationale prose (Issue 3). |
| **6** | SPECIES_EVIDENCE: all 26 entries at 6/6 uniformly per D-WE22-11 supporting-evidence-only lockwork; SUBSTRATE_EVIDENCE: substrate_evidence_hardboard_masonite, substrate_evidence_composite_veneer_cores (2 entries at 6/6); MAKER_ENTRIES: 6 entries at 6 (marginal-attribution clusters like Heritage / Drexel Heritage; Colonial Manufacturing Co.) | Intentional supporting-evidence calibration per "wood alone never dates furniture" structural encoding (rule #1 of WOOD_EVIDENCE_REASONING_RULES). Dense canonical-source rationale via diagnostic_caution_text. ✓ |
| **5** | MAKER_ENTRIES: maker_mark_grand_rapids_furniture_association_triangle (5/9; association mark not single-maker; very high hard_negative); maker_mark_cabinetmaker_paper_labels_and_inscriptions (5/6; generic-discipline entry) | Intentional appraiser-honest calibration; maker-marks-only at this value. Asymmetric pos/neg pair (5/9 on triangle) reflects very high false-attribution risk vs moderate positive evidence. ✓ |
| **4** | MAKER_ENTRIES: maker_mark_shaker_communities (4/7; most pieces unmarked; provenance-required) | Intentional low-confidence anchor with elevated hard_negative complement; maker-marks-only at this value. ✓ |

**Rationale-strength annotation summary:** authority values 9, 6, 5, 4 carry semantically uniform meaning across the libraries that populate them. Authority values 8 and 7 carry library-dependent semantics — particularly value 8 (the largest population at 243 entries) where Phyfe-class strict-attribution sits at same numeric value as routine taxonomy primitives.

---

#### Section 4 — Per-Library Rationale Comparison Findings

| Library | Rationale field(s) | Density observed | Notes |
|---|---|---|---|
| SPECIES_EVIDENCE | `diagnostic_caution_text` | Dense | Per-entry canonical-source rationale via dedicated field; notes field unused by convention |
| SUBSTRATE_EVIDENCE | `diagnostic_caution_text` + per-substrate adoption_curve narrative | Dense | 4 of 5 entries populate diagnostic_caution_text; particleboard omits per D-WE23b-8 source-artifact non-propagation |
| CUT_GRAIN_EVIDENCE | `diagnostic_caution_text` | Dense | All 35 entries populate; canonical anchor per File B Cat VI Type/Variant content |
| WOOD_DIAGNOSTIC_SIGNALS | `confidence_notes` | Dense | All 8 entries populate; signal-specific epistemic-uncertainty prose |
| WOOD_EVIDENCE_REASONING_RULES | `rule_statement` + `rationale` + `notes` | Dense (highest in inventory) | Three-field rationale stack per meta-rule canonical authoring; first canonical Independent Layer Evaluation Standard encoding |
| MAKER_ENTRIES | `notes` + `attribution_confidence_rule` + `dating_clues` + per-entry per-maker rationale across multiple fields | Dense (highest in inventory) | Per-maker seed-Confidence-Rule-driven; notes prose explicitly cites Maker_Mark_Replacement_Seed.docx section + Universal Rule cross-references in false_positive_warnings |
| MAKER_ATTRIBUTION_REASONING_RULES | `rule_statement` + `rationale` + `notes` | Dense | Parallel to wood reasoning rules; meta-rule supremacy authoring discipline |
| FORMS | `notes` field | **Sparse (1 of 183 entries populates notes)** | Only form_jelly_cupboard has notes prose. Rationale lives in distinguishing_features + regional_period_notes + cousin_form_contrasts but not in per-entry authority-justification prose. Issue 3 deferred. |
| FAMILIES | `description` field | Dense | All 12 entries populate description with canonical taxonomy rationale; no notes field |
| SPATIAL_BEHAVIORS | `description` field | Dense | All 76 entries populate description; no notes field |
| CONSTRUCTION_LOGIC | `description` + `historical_evolution_narrative` + `disambiguation_from_other_logics` fields | Dense | Three-field rationale stack per CL canonical authoring; Session 3 Block 3 authoring discipline |

**Cross-library rationale-field pattern:** Two architectural conventions coexist — (1) `notes` field as primary rationale carrier (wood/maker libraries; multi-field stack including diagnostic_caution_text / confidence_notes / rule_statement / attribution_confidence_rule); (2) `description` field as primary rationale carrier (families / spatial / CL libraries; supplemented by historical_evolution_narrative on CL only). FORMS uses neither convention consistently — `notes` field essentially unpopulated; rationale lives diffusely across distinguishing_features, regional_period_notes, and cousin_form_contrasts without a single canonical authority-justification field.

---

#### Section 5 — Sampled Per-Entry Calibration Audit (52 entries; 11.8% of canonical inventory)

| Library | Sample n | Sample % | Selected entries | Notes |
|---|---|---|---|---|
| SPECIES_EVIDENCE | 3 | 11.5% | oak_group, hard_maple_sugar_maple, southern_yellow_pine | Authority 6/6 uniform; rationale in diagnostic_caution_text confirmed canonically anchored |
| SUBSTRATE_EVIDENCE | 1 | 20.0% | plywood | Authority 7/7; adoption_curve + diagnostic_caution_text canonically anchored |
| CUT_GRAIN_EVIDENCE | 4 | 11.4% | flat_sawn, flame_figure, chatoyance, ribbon_stripe_mahogany | Authority 7/7 uniform; diagnostic_caution_text canonically anchored per File B Cat VI |
| WOOD_DIAGNOSTIC_SIGNALS | 1 | 12.5% | massive_solid_oak | Authority 7/7; confidence_notes per File A Section 7 canonical |
| WOOD_EVIDENCE_REASONING_RULES | 1 | 14.3% | wood_alone_never_dates_furniture | Authority 9/9; rule_statement + rationale dense per File A Section 8 Important Caveat |
| MAKER_ENTRIES | 8 | 10.4% | cabinetmaker_paper_labels (5/6), mitchell_and_rammelsberg (7/7), globe_wernicke_co (8/9), limbert (7/7), caswell_runyan (7/7), drexel (7/7), thomasville (7/6), nelson_for_herman_miller (7/8) | Authority spread 5-8 / 6-9; per-maker rationale dense; full Confidence Rule prose citation per entry |
| MAKER_ATTRIBUTION_REASONING_RULES | 1 | 12.5% | core_attribution_rule | Authority 9/9; cross_layer_scope: true; foundational meta-rule rationale dense |
| FORMS | 20 | 10.9% | form_pump_organ_cabinet, form_blanket_chest, form_jelly_cupboard (only entry with notes), form_sofa_table, form_coffee_table, form_secretary_desk, form_tabletop_desk, form_credenza_desk, form_armoire_desk, form_reception_desk, form_l_shaped_desk, form_organ_desk, form_umbrella_stand, form_charging_station, form_basket, form_lectern, form_retail_fixture, form_shelving_system, form_tall_case_clock, form_musical_instrument_furniture | 19 of 20 sampled entries have empty `notes` field; rationale lives diffusely; Issue 3 deferred. |
| FAMILIES | 2 | 16.7% | family_bedroom_clothing_storage, family_musical_mechanical | Authority 8/8 uniform; description prose canonically dense |
| SPATIAL_BEHAVIORS | 9 | 11.8% | spatial_horizontal_storage, spatial_auxiliary_service, spatial_motion_seating, spatial_clothing_enclosure, spatial_technical_drafting_professional_workstations, spatial_computer_systems_modular_workstations, spatial_built_in_architectural_desks, spatial_automated_dispensing_systems, spatial_interactive_systems | Authority 8/8 uniform; description prose canonically dense |
| CONSTRUCTION_LOGIC | 1 | 25.0% | construction_case | Authority 8/8; description + historical_evolution_narrative + disambiguation_from_other_logics canonically dense |
| **TOTAL** | **51** | **11.6%** | | |

(Note: 52-entry plan estimate adjusts to 51 actual sample post-deterministic-step rounding; within tolerance.)

**Sampled audit conclusions:**
- Wood libraries (5 of 5): all sampled entries have rationale canonically anchored via diagnostic_caution_text / confidence_notes / rule_statement / rationale fields per per-library discipline. ✓
- Maker libraries (2 of 2): all sampled entries have rationale densely populated via notes + attribution_confidence_rule + dating_clues + per-Universal-Rule cross-references. ✓
- Families / spatial / CL (3 of 3): all sampled entries have rationale densely populated via description field. ✓
- Forms (1 of 1): 19 of 20 sampled entries lack rationale prose; consistent with Section 4 finding (Issue 3 deferred).

---

#### Section 6 — Semantic Anchor Lock (D-AR29-5)

| Authority | Semantic anchor | Population | Status |
|---|---|---|---|
| **9** | Meta-rule supremacy; reasoning rules governing evidence-axis interpretation across all libraries | 15 | Clean |
| **8** | Categorical-strong evidence — **SEMANTIC VARIES PER LIBRARY**: in wood/maker contexts indicates strict-attribution or technology-adoption-curve; in forms/families/spatial/CL contexts indicates canonical taxonomy primitive. Phase 3 weighting integration MUST resolve cross-library scaling before consuming "8" values as semantically uniform. | 243 | Phase 3 readiness dependency (deferred until end of Phase 2) |
| **7** | Medium-strong evidence with canonical-source rationale | 146 | Mostly clean |
| **6** | Supporting-evidence-only discipline (wood species lock per D-WE22-11; mirrored elsewhere) | 34 | Intentional |
| **5** | Appraiser-honest discipline + acknowledged uncertainty (Grand Rapids Triangle; cabinetmaker generic) | 2 | Intentional |
| **4** | Low-confidence anchor with elevated hard_negative complement (Shaker most-pieces-unmarked) | 1 | Intentional |

**Lock scope:** locked at current 6-library state. Re-evaluation required when new canonical libraries land (historicalClueLibrary.ts + styleFamilies.ts + joinery + fasteners + hardware + upholstery covers + upholstery construction). Per D-AR29-11, subsequent canonical-library authoring calibrates per-entry authority against this table and flags new semantics for end-of-Phase-2 reconciliation pass.

---

#### Section 7 — Surfaced Calibration Issues

**Issue 1 (HIGH priority): SUBSTRATE_EVIDENCE D-WE22-11 baseline vs actual divergence.** D-WE22-11 audit-log baseline declared SUBSTRATE_EVIDENCE at 8/8; actual entries calibrated 6-7 per D-WE23b-1 per-entry discipline. Disposition: Option (a) audit-log clarification only per D-AR29-6. NO entry mutations. Rolls in Issue 5 (D-WE22-11 audit-log clarity).

**Issue 2 (HIGH priority): "8" semantic asymmetry across libraries.** 243 entries at "8" across 5 libraries with semantically heterogeneous calibration meaning (strict-attribution in wood/maker context vs taxonomy primitive in forms/families/spatial/CL context). Disposition: Option C with end-of-Phase-2 escalation per D-AR29-7. NO Phase 2 mutations. Phase 3 weighting integration MUST resolve cross-library scaling.

**Issue 3 (MEDIUM priority): FORMS rationale gap.** 182 of 183 FORMS entries lack per-entry `notes` field rationale. Disposition: defer to end-of-Phase-2 reconciliation pass per D-AR29-8. Retroactive rationale population requires styleFamilies.ts + HCL + four-file evidence libraries to exist for cross-reference content. NO Phase 2 Session 8a mutations.

**Issue 4 (LOW priority): FAMILIES / SPATIAL_BEHAVIORS / CONSTRUCTION_LOGIC zero authority spread.** All 92 entries across these 3 libraries calibrated at 8/8 uniform. Description-field rationale is dense (mitigates concern); per-entry authority-justification absent. Disposition: combined with Issue 3 end-of-Phase-2 reconciliation pass scope per D-AR29-9.

**Issue 5 (LOW priority): D-WE22-11 audit-log clarity.** Rolls into Issue 1 clarification per D-AR29-6.

---

#### Section 8 — End-of-Phase-2 Reconciliation Pass Scope

The end-of-Phase-2 reconciliation pass is the explicit Phase 2 → Phase 3 gate for all corrections surfaced in Block 29 + any corrections surfaced during subsequent Phase 2 canonical library authoring. NOT a single block — a gate work item that may produce one or multiple correction blocks depending on findings.

**Required canonical-library inputs before reconciliation pass proceeds:**
1. Wood library (complete; Block 26 endpoint)
2. Maker marks library (complete; Block 28b endpoint)
3. historicalClueLibrary.ts (Phase 2 Session 9 scope; not yet authored)
4. styleFamilies.ts (Phase 2 Session 9 scope; not yet authored)
5. Joinery evidence library (Phase 2 four-file scope; not yet authored)
6. Fasteners evidence library (Phase 2 four-file scope; not yet authored)
7. Hardware evidence library (Phase 2 four-file scope; not yet authored)
8. Upholstery covers evidence library (Phase 2 four-file scope; not yet authored)
9. Upholstery construction evidence library (Phase 2 four-file scope; not yet authored)

**Per-issue library-dependency cross-references:**

- **Issue 1**: No new-library dependency. Audit-log clarification can execute at any time; deferred for batching with other end-of-Phase-2 work.
- **Issue 2**: Cross-library scaling resolution requires all 9 canonical libraries authored before Phase 3 weighting integration approach can be decided (per-library scaling factors vs per-entry-uniform-scale). Decision: Phase 3 architectural scope per D-AR29-7.
- **Issue 3**: Forms entries cross-reference styleFamilies.ts (style attribution evidence) + HCL (datable features per Session 2 form-vs-style separation) + four-file evidence libraries (construction/joinery/fasteners/hardware/upholstery). Retroactive rationale population done NOW would author rationale referencing libraries-not-yet-existing. Wait for cross-reference libraries to exist.
- **Issue 4**: Combined with Issue 3 scope; same dependency profile.
- **Issue 5**: Rolls into Issue 1.

**Estimated reconciliation-pass scope (at completion of all Phase 2 canonical-library authoring):**
- Issue 1: ~5-10 line audit-log clarification entry.
- Issue 2: Either Phase 3 architectural scope (no Phase 2 mutations) OR full cross-library recalibration block (~215 entries affected across forms/families/spatial/CL).
- Issue 3: ~182 entries (FORMS) per-entry rationale population. Major scope.
- Issue 4: Optional ~92 entries (FAMILIES/SPATIAL/CL) per-entry authority-justification review. Lower priority.

---

#### Section 9 — Recommendations for Subsequent Canonical Library Authoring

**Calibration guidance for HCL + styleFamilies.ts + four-file evidence libraries:**

1. **Calibrate per-entry authority against the locked semantic anchor table (D-AR29-5).** New entries land at 4-9 range. Default per-library baseline can be declared at authoring-block scope (analogous to D-WE22-11 per-library baseline lockwork), but per-entry calibration MAY override baseline when canonical-source rigor warrants. Per-entry override is the appraiser-honest discipline per D-WE23b-1 precedent.

2. **Flag any new authority value semantics that don't fit the locked table.** Surface for end-of-Phase-2 reconciliation pass. The locked table is current-state at 6 libraries; new libraries may surface semantic anchors at values not yet populated (e.g., "3" appraiser-disclaimed-evidence; "10" reserved-for-future-supremacy).

3. **Per-entry rationale documentation discipline:** use `notes` field (wood + maker pattern) OR `description` field (families/spatial/CL pattern). FORMS-style sparse-rationale pattern is the anti-pattern flagged in Issue 3. Ensure SOME canonical-source rationale is documented per entry for future audit traceability — Phase 3 weighting integration consumes rationale prose at report-layer rendering and engine-reasoning input phases.

4. **Cross-library FK consistency:** new evidence-library entries cross-referencing wood / maker / forms entries must use exact canonical entry ids (no forward-reference placeholders unless tracked via D-AR29-N-style audit entry).

5. **Reasoning-rule entries:** if a new library includes reasoning rules (analogous to WOOD_EVIDENCE_REASONING_RULES + MAKER_ATTRIBUTION_REASONING_RULES), calibrate at 9/9 meta-rule supremacy per D-AR29-5 unless library-specific rationale warrants otherwise.

---

**Architectural decisions (locked).**

D-AR29-1 (locked): Phase 2 Session 8a scope per Q1-Q5 lockings. Composite audit across 6 canonical libraries totaling 441 entries (wood library 81 + maker marks library 85 + forms library 183 + families library 12 + spatial behaviors library 76 + construction logic library 4). styleFamilies.ts + HCL + four-file evidence libraries out of scope per non-existence + Phase 2 Session 9+ scheduling. engine.ts UNCHANGED per Phase 2 / Phase 3 separation.

D-AR29-2 (locked): Composite audit methodology per Q1 Option E. Three dimensions covered: cross-library scale comparability (anchor entries + matrix); within-library distribution sanity (per-library histograms vs baseline-lock-or-canonical-source rationale); sampled per-entry calibration audit (~10-15% per library; 51 entries sampled, 11.6% of canonical inventory).

D-AR29-3 (locked): Cross-library scale comparability methodology per Q3 Option I + J combined. Anchor entries (strong + marginal + median per library) and rationale comparison (notes field + indicator_text + diagnostic_caution_text + description field strength vs authority value).

D-AR29-4 (locked): Output shape per Q2 Option H. Audit-and-defer-corrections. NO entry mutations this block or in any Phase 2 block prior to end-of-Phase-2 reconciliation pass per Mike's architectural call. Findings documented in AUDIT_LOG.md; deferred-correction work routes to end-of-Phase-2 reconciliation pass per D-AR29-10.

D-AR29-5 (locked): Semantic anchor table per Section 6 above. The "8" row explicitly captures cross-library asymmetry as Phase 3 readiness dependency rather than pretending uniform semantics. Anchor table locked at current 6-library state; re-evaluation required when new canonical libraries land (HCL + styleFamilies.ts + four-file evidence libraries).

D-AR29-6 (locked): Issue 1 disposition — Option (a) audit-log clarification. Block 29 audit captures: "D-WE22-11 SUBSTRATE_EVIDENCE 8/8 baseline framing was aspirational; Block 23b D-WE23b-1 authored substrate entries at per-entry calibration (6-7 range) reflecting actual evidence rigor per canonical source. The per-entry discipline is the canonical authoring approach; baseline framings serve as starting-point guidance subject to per-entry override." NO entry mutations this block or future blocks; clarification only. Issue 5 rolls into this clarification.

D-AR29-7 (locked): Issue 2 disposition — Option C with end-of-Phase-2 escalation. "8" semantic asymmetry across libraries flagged as Phase 3 readiness dependency. NO Phase 2 mutations. Reconciliation work proceeds at end-of-Phase-2 after all canonical libraries exist. Phase 3 weighting integration MUST resolve cross-library scaling (per-library scaling factors OR per-entry-uniform-scale) before consuming "8" values as semantically uniform. The choice between approaches is Phase 3 architectural scope.

D-AR29-8 (locked): Issue 3 disposition — FORMS rationale gap deferred to end-of-Phase-2 reconciliation pass. Retroactive per-entry rationale population requires styleFamilies.ts + HCL + four-file evidence libraries to exist for cross-reference content. Estimated mutation scope at that point: ~182 entries (FORMS) + optional FAMILIES/SPATIAL/CL per-entry rationale review per Issue 4.

D-AR29-9 (locked): Issue 4 disposition — FAMILIES/SPATIAL/CL zero spread combined with Issue 3 end-of-Phase-2 reconciliation pass scope. Lower priority than Issue 3; description field rationale provides canonical-source context.

D-AR29-10 (locked): End-of-Phase-2 reconciliation pass scheduling. The pass becomes the explicit Phase 2 → Phase 3 gate, requiring: (a) all Phase 2 canonical libraries authored (wood complete; maker marks complete; HCL + styleFamilies.ts + four-file evidence libraries authored in subsequent Phase 2 sessions); (b) Issue 1, Issue 2, Issue 3, Issue 4 dispositions executed per the disposition options locked above OR refined per new findings from subsequent library authoring; (c) Semantic anchor table re-evaluated against the complete canonical-library set; (d) Phase 3 weighting integration approach decided (per-library scaling factors vs per-entry-uniform-scale). The pass is NOT a single block; it's a gate work item that may produce one or multiple correction blocks depending on findings.

D-AR29-11 (locked): Calibration guidance for subsequent Phase 2 canonical library authoring per Section 9 above: calibrate per-entry authority against the locked semantic anchor table; flag new semantics for end-of-Phase-2 reconciliation pass; use notes field OR description field for per-entry rationale documentation discipline; FORMS-style sparse-rationale pattern is the anti-pattern flagged in Issue 3.

D-AR29-FINAL (locked): Phase 2 Session 8a ship — composite audit of 441 entries across 6 canonical libraries. Methodology: Q1 Option E composite + Q3 Option I+J + Q4 Option L single-block + Q2 Option H audit-and-defer (with end-of-Phase-2 escalation per Mike's revision). Output: audit report integrated into AUDIT_LOG.md as Block 29 entry; semantic anchor table locked at current 6-library state per D-AR29-5; 4 surfaced issues + 1 clarification disposition documented; end-of-Phase-2 reconciliation pass scheduled as gate work item per D-AR29-10. All 12 canonical array lengths unchanged (audit-only block). engine.ts UNCHANGED. Phase 2 Session 8a status: COMPLETE. Phase 2 Session 8b (end-of-Phase-2 reconciliation pass): pending all Phase 2 canonical library authoring; no block scheduling commitment.

**Workflow standards applied.** Plan-mode Op A inspection (READ-ONLY) preceded all audit-report drafting; tsx ephemeral scratch file used for per-library distribution + sampled-entry runtime introspection, created and removed within single audit pass per established workflow standard; full Section 1-9 audit-report content composed against actual runtime-verified data; 12 D-AR29-N decisions captured (D-AR29-1 through D-AR29-11 + D-AR29-FINAL); zero entry mutations to any canonical library this block per Q2 Option H + Mike's audit-and-defer architectural call; engine.ts zero-diff verified; AUDIT_LOG.md is the only modified file. Independent Layer Evaluation Standard preserved — authority reconciliation surfaces calibration semantics WITHOUT introducing cross-layer evidence dependencies. Phase 2 / Phase 3 separation lockwork honored.

**Final architectural state after this PR merges:**
- `lib/constraints/AUDIT_LOG.md` modified: +~280 lines (Block 29 audit report Sections 1-9 + D-AR29-1 through D-AR29-FINAL).
- ALL canonical library array lengths UNCHANGED:
  - SPECIES_EVIDENCE 26 / SUBSTRATE_EVIDENCE 5 / CUT_GRAIN_EVIDENCE 35 / WOOD_DIAGNOSTIC_SIGNALS 8 / WOOD_EVIDENCE_REASONING_RULES 7
  - MAKER_ENTRIES 77 / MAKER_ATTRIBUTION_REASONING_RULES 8 / MAKER_MARKS (legacy) 25
  - FORMS 183 / FAMILIES 12 / SPATIAL_BEHAVIORS 76 / CONSTRUCTION_LOGIC 4
- ALL canonical library files byte-for-byte UNCHANGED: entryShape.ts, woodIdentification.ts, woodEvidence.ts, makerMarks.ts, forms.ts, families.ts, spatialBehaviors.ts, constructionLogic.ts.
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation.
- 12 audit decisions captured under D-AR29-N block-scoped prefix (D-AR29-1 through D-AR29-11 + D-AR29-FINAL).
- Semantic anchor table locked at 6-library state per D-AR29-5; re-evaluation required at end-of-Phase-2 reconciliation pass.
- 4 surfaced calibration issues documented with disposition routing to end-of-Phase-2 reconciliation pass.
- 5 calibration-guidance items locked for subsequent Phase 2 canonical-library authoring per D-AR29-11.
- Phase 2 Session 8a status: COMPLETE.
- Phase 2 Session 8b (end-of-Phase-2 reconciliation pass) status: pending all Phase 2 canonical-library authoring; no block scheduling commitment.
- Convention precedents established this block: composite-audit methodology covering scale comparability + distribution sanity + sampled per-entry calibration (D-AR29-2); audit-and-defer-with-end-of-Phase-2-escalation output shape (D-AR29-4); semantic anchor table as cross-library calibration reference subject to re-evaluation as canonical libraries grow (D-AR29-5); calibration guidance discipline for subsequent canonical-library authoring (D-AR29-11).

---

### 2026-05-13 — Session 14 Block 30 — Joinery Library Schema Foundation + 15 Categories + 5 Reasoning Rules; Phase 2 Session 7 opens

**Scope.** Phase 2 Session 7 (four-file evidence libraries architecture; first library = joinery) opens. New `lib/constraints/joinery.ts` file authored with three interfaces (`JoineryCategoryEntry`, `JoineryTypeEntry`, `JoineryReasoningRule`) + three arrays (`JOINERY_CATEGORIES` with 15 entries; `JOINERY_TYPES` empty scaffold for Block 31; `JOINERY_REASONING_RULES` with 5 entries at authority 9/9). Cross-library `PeriodAssociation`, `AntiClassificationGuidance`, `ReasoningRuleMigrationTarget` consumed from `entryShape.ts` per Block 27 migration locks. NO `PositionOnPiece` field on `JoineryTypeEntry` per D-JN30-11 (joinery types characterized by construction pattern, not physical location). engine.ts UNCHANGED per Phase 2 / Phase 3 separation lockwork from D-MM27-9. All 12 prior canonical library array lengths unchanged. Block 31 follows with ~40 `JOINERY_TYPES` content authoring from `JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx` canonical source (40 DATE RANGE markers in seed = 40 canonical types per Op A-6).

**Architectural decisions (locked).**

D-JN30-1 (locked): Block 30 scope per Q1-Q6 lockings. Single `joinery.ts` file holding `JoineryCategoryEntry` + `JoineryTypeEntry` + `JoineryReasoningRule` interfaces + 3 arrays. Block 30 = schema foundation + 15 categories + 5 reasoning rules. Block 31 = ~40 `JOINERY_TYPES` content authoring (subsequent). Phase 2 Session 7 opens with Block 30. Plan estimate of 13 categories adjusted to 15 per Op A-4 actual seed enumeration; Block 31 type estimate adjusted from "~30-35" to "~40" per Op A-6 actual seed count.

D-JN30-2 (locked): Library architecture per Q1 Option C — single-file (`joinery.ts`) with multiple interfaces parallel to maker marks single-file-multi-interface pattern. Date ranges co-located with type descriptions in canonical source; less separable identification vs evidence than wood library (wood library bifurcated into `woodIdentification.ts` + `woodEvidence.ts` per Blocks 16-26; joinery library remains single-file).

D-JN30-3 (locked): `JoineryTypeEntry` interface shape per Q2 Option D — flat fields parallel to `MakerMarkEntry` pattern. 13 declared fields beyond `CanonicalEntry`: name, parent_category_id (FK), description, unique_traits, identifying_characteristics, period_associations, date_range_summary, structural_role?, hand_vs_machine_classification? (4-value enum: strongly_early | strongly_industrial | transitional | spans_eras), regional_persistence_notes?, anti_classification_guidance?, related_joinery_types?. NO `PositionOnPiece` field per D-JN30-11.

D-JN30-4 (locked): `JoineryCategoryEntry` as separate interface + array per Q3 Option G. 15 category entries authored this block (revised from plan estimate of 13 per Op A-4 actual seed enumeration); parent-category pattern parallel to wood's `WOOD_CATEGORIES` (4 categories) but with denser per-category content. Op A-4 Surfacing 2 resolution: Dovetail Family is structurally TOP-LEVEL in seed (not sub-family of Carcase); `parent_category_id` undefined on all 15 entries this block. Field roster: name, category_description, unique_category_traits?, identifying_elements?, common_in? (Frame Joinery uses this in lieu of identifying_elements per seed field-naming variance), parent_category_id?.

D-JN30-5 (locked): 5 `JoineryReasoningRule` entries per Q4 Option J. Coverage: joinery_alone_never_dates_furniture; rural_persistence_warning; restoration_false_signals; high_authority_dating_indicators_framework; joinery_evidence_layer_independence. cross_layer_scope: true on rules #1 + #5 (meta-rule supremacy parallel to wood rule #1 + #7 + maker rule #1 cross_layer_scope precedent). migration_target distribution: 5 engine_reasoning + 0 weighting_file + 0 report_layer (all engine integration scope this block; weighting/report routing may emerge in Block 31 per-type rule applicability surfacing).

D-JN30-6 (locked): Two-block split per Q5 Option N. Block 30 schema + categories + rules; Block 31 ~40 types (per Op A-6 actual seed count; plan estimate of ~30-35 adjusted). Pattern parallel to Block 27 maker marks schema + Block 28a/28b maker entries split.

D-JN30-7 (locked): `JoineryCategoryEntry` per-library schema per Q6 Option C. Cross-library `CategoryEntry` promotion to `entryShape.ts` DEFERRED to end-of-Phase-2 reconciliation pass (Phase 2 Session 8b) when fasteners + hardware + upholstery covers + upholstery construction libraries exist for cross-library schema pattern evaluation. Schema-occurrence rule (3+ libraries threshold) applied at reconciliation pass per D-AR29-10 scope extension.

D-JN30-8 (locked): Authority calibration per category per D-AR29-11 semantic anchor guidance. `JOINERY_CATEGORIES` distribution: 4 categories at 8/8 (Carcase / Case Construction Joinery, Drawer Joinery, Mortise-and-Tenon Family, Dovetail Family — primary dating-evidence categories per seed canonical content depth + 3-tier indicator framework coverage) and 11 categories at 7/7 (medium-strong with canonical-source rationale: Edge-to-Edge, Corner, Frame, Panel Retention, Mechanical/Reinforced, Chair and Seating, Veneer and Surface, Decorative/Specialty, Knock-Down/Modular, Modern Industrial, Upholstery Structural). `JOINERY_REASONING_RULES` uniform at 9/9 per meta-rule supremacy.

D-JN30-9 (locked): D-AR29-11 calibration discipline applied. Per-entry rationale documentation pattern: notes field populated per entry citing canonical source (JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx + section reference + seed line range). Per-entry authority calibrated against semantic anchor table with explicit per-category rationale in indicator_text + notes fields. FORMS-style sparse-rationale anti-pattern explicitly avoided.

D-JN30-10 (locked): Independent Layer Evaluation Standard canonicalization third instance. `JoineryReasoningRule` #5 (`joinery_reasoning_joinery_evidence_layer_independence`) follows wood rule #7 (`wood_evidence_reasoning_wood_evidence_layer_independence`) + maker rule #1 (`maker_attribution_reasoning_core_attribution_rule` cross_layer_scope) cross_layer_scope: true pattern. Cross-library convention reinforced: each evidence-library's reasoning-rule set includes one layer-independence canonical artifact per Independent Layer Evaluation Standard precedent. Future evidence libraries (fasteners, hardware, upholstery covers, upholstery construction) will author analogous layer-independence rules per this convention.

D-JN30-11 (locked): `PositionOnPiece` NOT applied to `JoineryTypeEntry`. Joinery types characterized by construction pattern, not physical location on piece. Position-relevant content (form-specific joinery application — e.g., "dovetails on drawer fronts" vs "dovetails on case corners") routes to future form ↔ joinery cross-reference work, not to joinery-side schema. Surfaced and confirmed at Op A-9.

D-JN30-FINAL (locked): Block 30 ship — schema foundation + 15 `JOINERY_CATEGORIES` + 5 `JOINERY_REASONING_RULES` + empty `JOINERY_TYPES` scaffold. Files modified: 2 (`joinery.ts` NEW; `AUDIT_LOG.md` append). engine.ts UNCHANGED per Phase 2 / Phase 3 separation. All 12 prior canonical array lengths unchanged. NEW arrays: `JOINERY_CATEGORIES` (15) + `JOINERY_TYPES` (0) + `JOINERY_REASONING_RULES` (5). Authority distribution: `JOINERY_CATEGORIES` 4 at 8/8 + 11 at 7/7 per D-JN30-8; `JOINERY_REASONING_RULES` uniform 9/9. cross_layer_scope: true on `JoineryReasoningRule` #1 + #5. Phase 2 Session 7 opens; four-file evidence libraries first library schema foundation established. Block 31 queued: ~40 `JOINERY_TYPES` content authoring from `JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx` canonical source.

**Workflow standards applied.** Plan-mode Op A inspection (READ-ONLY) preceded all authoring; seed file located at `/root/.claude/uploads/cf09c0de-d3c8-42d2-b883-4c80e1dc488b/e0fe74b5-JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx`; extracted via `unzip + python3` to `/tmp/joinery_seed.txt` (692 lines); seed section enumeration validated 15 categories + 40 type DATE RANGE markers; Block 29 endpoint state verified at `550e147`. Pre-emptive schema discovery: `CanonicalEntry`, `PeriodAssociation`, `AntiClassificationGuidance`, `ReasoningRuleMigrationTarget` all confirmed at expected line ranges in `entryShape.ts`. Source-document citation: every category entry's notes field cites `JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx` section + seed line range; reasoning rule rationale fields cite seed section content with line range references. Independent Layer Evaluation Standard third canonical-library instance per D-JN30-10. Phase 2 / Phase 3 separation: engine.ts UNCHANGED. Cross-library architectural artifact reuse: `PeriodAssociation` + `AntiClassificationGuidance` + `ReasoningRuleMigrationTarget` imported from `entryShape.ts` per established cross-library promotion pattern (D-MM27-2 / D-MM27-3 / Block 16). D-AR29-11 calibration guidance discipline applied. No mid-authoring surfacings warranting Mike review beyond pre-addressed Op A-4 + A-6 count corrections (15 categories + 40 types).

**Final architectural state after this PR merges:**
- `lib/constraints/joinery.ts` NEW file authored (~380-410 lines).
- `lib/constraints/AUDIT_LOG.md` modified: +~80 lines (D-JN30-1 through D-JN30-11 + D-JN30-FINAL).
- `JOINERY_CATEGORIES.length === 15`; first canonical population.
- `JOINERY_TYPES.length === 0`; Block 31 scaffold.
- `JOINERY_REASONING_RULES.length === 5`; first canonical population; all 9/9 authority + migration_status "complete"; migration_target = 5 engine_reasoning; cross_layer_scope: true on rules #1 (joinery_alone_never_dates_furniture) + #5 (joinery_evidence_layer_independence).
- All 12 prior canonical array lengths unchanged: SPECIES_EVIDENCE 26 / SUBSTRATE_EVIDENCE 5 / CUT_GRAIN_EVIDENCE 35 / WOOD_DIAGNOSTIC_SIGNALS 8 / WOOD_EVIDENCE_REASONING_RULES 7 / MAKER_ENTRIES 77 / MAKER_ATTRIBUTION_REASONING_RULES 8 / MAKER_MARKS (legacy) 25 / FORMS 183 / FAMILIES 12 / SPATIAL_BEHAVIORS 76 / CONSTRUCTION_LOGIC 4.
- `lib/constraints/entryShape.ts`, `lib/constraints/woodIdentification.ts`, `lib/constraints/woodEvidence.ts`, `lib/constraints/makerMarks.ts`, `lib/constraints/forms.ts`, `lib/constraints/families.ts`, `lib/constraints/spatialBehaviors.ts`, `lib/constraints/constructionLogic.ts`: all byte-for-byte unchanged.
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation.
- 12 audit decisions captured under D-JN30-N block-scoped prefix (D-JN30-1 through D-JN30-11 + D-JN30-FINAL).
- Phase 2 Session 7 maker marks library: 15 of 15 expected categories + 5 of 5 reasoning rules content-complete; 0 of ~40 joinery types content-complete (Block 31 scope).
- Convention precedents established/reinforced this block: single-file architecture with multiple interfaces appropriate when canonical source co-locates identification + evidence (D-JN30-2; parallel to maker marks); per-library `CategoryEntry` schema deferred to cross-library promotion evaluation at end-of-Phase-2 reconciliation pass (D-JN30-7); 4-value hand_vs_machine_classification enum on `JoineryTypeEntry` operationalizes High-Authority Dating Indicators Framework three-tier rule (D-JN30-3); NO `PositionOnPiece` on `JoineryTypeEntry` per construction-pattern-vs-physical-location distinction (D-JN30-11); Independent Layer Evaluation Standard third canonical-library encoding establishes convention for future evidence-library reasoning-rule sets (D-JN30-10).

---

## Block 31 — JOINERY_TYPES content authoring (40 entries across 15 sub-batches); joinery library content-complete; Phase 2 Session 7 first library CLOSED
## Session 14 / claude.ai-and-Claude-Code paired execution
## Base SHA: main f5bf4a0 (Block 30 endpoint / Phase 2 Session 7 opening)

### D-JN31-1 (locked): Block 31 scope per Q1-Q5 lockings
Single combined ship with 15 internal sub-batches (one per JOINERY_CATEGORIES entry). 40 JOINERY_TYPES entries authored from JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx canonical source via Op A-3 enumeration (count confirmed exact at 40; matches plan estimate). Per-sub-batch JOINERY_TYPES.length report and tsc check folded into single comprehensive Op C Edit + Op G runtime introspection given seed extraction was complete in Phase 1 (no per-sub-batch architectural ambiguity required mid-batch pause).

### D-JN31-2 (locked): period_associations granularity per Q2 Option E
`period_associations` array per type captures era phases where seed structures them. Multiple era-phase entries authored on 4 types per Op A-3 surfacing:
- `joinery_type_through_dovetail`: 2 entries (Hand-cut era 1600-1909 + Machine-cut widespread 1860+) per seed Hand-Cut Examples + Machine-Cut Examples sub-sections.
- `joinery_type_hand_cut_drawer_dovetails`: 2 entries (Early Hand Work 1700-1799 + Late Hand Work 1800-1900) per seed Early Hand Work + Late Hand Work sub-sections.
- `joinery_type_finger_box_joint`: 2 entries (Hand examples 1800-1899 + Machine production 1880+) per seed DATE RANGE hand+machine phasing.
- `joinery_type_dowel_joinery`: 2 entries (Early hand-fit emergence 1800-1949 + Mass-production phase 1950+) per seed "Extremely common after 1950" sub-phase structure.

Additional multi-entry per Arts & Crafts / revival context: `butterfly_dutchman_key` (3 entries: baseline + Arts & Crafts 1890-1920 + modern revival 1970+), `bridle_joint` (2 entries: baseline + Arts & Crafts), `through_mortise_and_tenon` (2 entries: baseline + Arts & Crafts), `biscuit_joint` (2 entries: experimental 1950-1979 + widespread 1980+ per D-JN31-4 1950 AG floor decision).

`date_range_summary` field carries seed DATE RANGE prose verbatim regardless of period_associations array length.

### D-JN31-3 (locked): hand_vs_machine_classification distribution per Q3 Option G + A-6 mapping
Strict indicator-list matching for 11 entries (4 strongly_early + 7 strongly_industrial). 2 transitional entries per seed era-phase sub-section evidence (through_dovetail + finger_box_joint). 5 spans_eras entries per seed "Ancient–present" DATE RANGE (butt_edge_glued, basic_butt_corner, through_mortise_and_tenon, blind_mortise_and_tenon, coopered_joinery). 22 undefined entries (conservative default per Q3 ambiguous-case discipline). Final distribution: `{strongly_early: 4, strongly_industrial: 8, transitional: 2, spans_eras: 5, undefined: 21}` after D-JN31-9 category-context inheritance applied to confirmat_screw (one entry moves from undefined → strongly_industrial).

### D-JN31-4 (locked): anti_classification_guidance distribution per Q4 Option J industrial-introduction-boundary pattern
6 entries with AG (industrial-introduction-boundary pattern); AG prose canonical template per Q4 + cross-references JoineryReasoningRule #3 restoration_false_signals:
- `joinery_type_biscuit_joint` AG floor 1950 (NOT 1980) per A-5 surfacing — seed DATE RANGE explicitly "1950s experimental"; pre-1950 is the hard impossibility floor; 1980 widespread-use date captured as second period_associations entry not as AG floor. Mike-locked resolution.
- `joinery_type_stapled_drawer_joinery` AG floor 1950.
- `joinery_type_knock_down_cam_lock_joinery` AG floor 1960.
- `joinery_type_confirmat_screw_joinery` AG floor 1970 (NOT 1980 approximate) per A-5 surfacing — seed DATE RANGE explicitly "1970s–present". Mike-locked resolution.
- `joinery_type_pocket_screw_joinery` AG floor 1980.
- `joinery_type_cnc_interlocking_joinery` AG floor 1990.

### D-JN31-5 (locked): cross-category type assignment per Q5 Option M
5 cross-category types authored once with primary parent_category_id + related_joinery_types cross-references:
- `joinery_type_through_dovetail`: primary Carcase; cross-refs to sliding_dovetail, half_blind_dovetail, hand_cut_drawer_dovetails, machine_cut_drawer_dovetails (4 refs).
- `joinery_type_sliding_dovetail`: primary Carcase; cross-refs to through_dovetail, half_blind_dovetail (2 refs).
- `joinery_type_half_blind_dovetail`: primary Dovetail Family; cross-refs to through_dovetail, hand_cut_drawer_dovetails, machine_cut_drawer_dovetails (3 refs).
- `joinery_type_splayed_wedged_through_tenons`: primary Chair and Seating; cross-refs to wedged_tenon (M&T Family), round_tenon_joinery (2 refs).
- Additional non-primary cross-refs on hand_cut_drawer_dovetails (3 refs), machine_cut_drawer_dovetails (3 refs), secret_mitered_dovetail (1 ref), wedged_tenon (1 ref), pegged_mortise_and_tenon (1 ref), drawbored_mortise_and_tenon (1 ref).

Total related_joinery_types references: 21. All FKs verified to resolve to authored type ids per Op G-10. butt_edge_glued (Edge-to-Edge) and basic_butt_corner (Corner) treated as distinct entries per A-4 surfacing (seed treats them as different joints with different applications), not cross-category candidates.

### D-JN31-6 (locked): authority distribution per D-AR29-11 calibration discipline + A-7 recommendation
Final distribution: `positive_authority {7: 28, 8: 12}`; `hard_negative_authority {7: 28, 8: 12}`.

12 entries at 8/8 per A-7 criteria "types named in seed STRONGLY EARLY or STRONGLY INDUSTRIAL indicator lists, OR types whose AG floor year is canonical dating anchor":
- 4 strongly_early indicator-list matches: hand_cut_drawer_dovetails, drawbored_mortise_and_tenon, wedged_tenon, splayed_wedged_through_tenons.
- 7 strongly_industrial indicator-list matches: machine_cut_drawer_dovetails, dowel_joinery, biscuit_joint, pocket_screw_joinery, knock_down_cam_lock_joinery, cnc_interlocking_joinery, stapled_drawer_joinery.
- 1 AG-floor-only entry: confirmat_screw_joinery (per A-7 OR-clause; AG floor 1970 is canonical dating anchor even though confirmat is not literally in seed STRONGLY INDUSTRIAL indicator list).

28 entries at 7/7 default per D-JN30-8 (medium-strong canonical-source rationale). No 9/9 type entries (9/9 reserved for reasoning rules per meta-rule supremacy precedent D-WE26-8 / D-MM27-5).

### D-JN31-7 (locked): Block 30 reasoning rule forward-references RESOLVED
JoineryReasoningRule #2 (rural_persistence_warning), #3 (restoration_false_signals), #4 (high_authority_dating_indicators_framework) all carry `applies_to_entry_types: ["joinery_type", ...]` category-string FKs which Block 31's authoring of JOINERY_TYPES closes. Per-type specific-id cross-references captured in `related_joinery_types` field per Q5 Option M (21 total references, all resolving). regional_persistence_notes populated on 4 strongly_early types per Rule #2 cross-reference. anti_classification_guidance populated on 6 industrial-introduction types per Rule #3 cross-reference.

### D-JN31-8 (locked): joinery library content-complete on Block 31 ship; Phase 2 Session 7 first library CLOSED
Schema foundation (Block 30 D-JN30-2/3/4/5) + 15 categories (Block 30 D-JN30-4) + 5 reasoning rules (Block 30 D-JN30-5) + 40 types (Block 31) = joinery library canonically content-complete. Phase 2 Session 7 first library closed. Next sequencing per Phase 2 Session 7 four-file evidence library architecture: fasteners library schema + content (Block 32 forward).

### D-JN31-9 (locked): category-context inheritance precedent for hand_vs_machine_classification population
**Convention precedent for future evidence libraries.** When a joinery type appears in a category whose own framing implies a hand_vs_machine_classification tier (e.g., "Modern Industrial Joinery" category) but the specific type is NOT literally named in the seed STRONGLY EARLY / STRONGLY INDUSTRIAL / TRANSITIONAL indicator list, the category-context inheritance pattern applies: the type inherits its parent category's implied classification rather than defaulting to undefined.

Applied this block to: `joinery_type_confirmat_screw_joinery` — assigned `hand_vs_machine_classification: "strongly_industrial"` per Modern Industrial category context, despite confirmat NOT being literally in seed STRONGLY INDUSTRIAL indicator list. Mike-locked resolution per authorization turn.

Future evidence libraries (fasteners, hardware, upholstery covers, upholstery construction) inheriting from comparable category-defined era frameworks may apply this precedent when seed indicator lists are silent on specific entries but the parent category framing carries dating-tier semantics. Strict indicator-list-only mapping is the conservative default; category-context inheritance is the pragmatic alternative used when category framing is unambiguous (e.g., a category literally named "Modern Industrial").

### D-JN31-FINAL (post-authoring summary)
Block 31 ship: 40 JOINERY_TYPES entries authored across 15 sub-batches.
- `JOINERY_TYPES.length`: 0 → **40**.
- Authority distribution: `positive_authority {7: 28, 8: 12}`; `hard_negative_authority {7: 28, 8: 12}` (12 at 8/8 per A-7 indicator-list + AG-anchor criteria; 28 at 7/7 default).
- hand_vs_machine_classification distribution: `{strongly_early: 4, strongly_industrial: 8, transitional: 2, spans_eras: 5, undefined: 21}` (40 total) — 8 strongly_industrial includes 7 indicator-list matches + 1 D-JN31-9 category-context inheritance (confirmat).
- anti_classification_guidance entries: **6** (industrial-introduction-boundary pattern: biscuit 1950, stapled 1950, cam_lock 1960, confirmat 1970, pocket_screw 1980, cnc 1990; AG floor years per D-JN31-4 — biscuit and confirmat adjusted from plan defaults per A-5 + Mike-locked resolution).
- Cross-category related_joinery_types references: **21** (all FKs resolve per Op G-10).
- period_associations multi-entry types: **8** (through_dovetail, hand_cut_drawer_dovetails, finger_box_joint, dowel_joinery, butterfly_dutchman_key, bridle_joint, through_mortise_and_tenon, biscuit_joint).
- regional_persistence_notes populated: **5** entries (through_dovetail + 4 strongly_early types per JoineryReasoningRule #2 cross-reference).
- Files modified: **2** (`lib/constraints/joinery.ts` + `lib/constraints/AUDIT_LOG.md`).
- All 14 other canonical array lengths unchanged: SPECIES_EVIDENCE 26 / SUBSTRATE_EVIDENCE 5 / CUT_GRAIN_EVIDENCE 35 / WOOD_DIAGNOSTIC_SIGNALS 8 / WOOD_EVIDENCE_REASONING_RULES 7 / MAKER_ENTRIES 77 / MAKER_ATTRIBUTION_REASONING_RULES 8 / MAKER_MARKS (legacy) 25 / FORMS 183 / FAMILIES 12 / SPATIAL_BEHAVIORS 76 / CONSTRUCTION_LOGIC 4 / JOINERY_CATEGORIES 15 / JOINERY_REASONING_RULES 5.
- `lib/constraints/entryShape.ts`, `woodIdentification.ts`, `woodEvidence.ts`, `makerMarks.ts`, `forms.ts`, `families.ts`, `spatialBehaviors.ts`, `constructionLogic.ts`: all byte-for-byte unchanged.
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation.
- 9 audit decisions captured under D-JN31-N block-scoped prefix (D-JN31-1 through D-JN31-9 + D-JN31-FINAL).
- **Joinery library: CANONICALLY CONTENT-COMPLETE.** Schema foundation + 15 categories + 40 types + 5 reasoning rules.
- **Phase 2 Session 7 first library: CLOSED.**
- Convention precedents established this block: category-context inheritance pattern for hand_vs_machine_classification when seed indicator-list silent but parent category framing is dating-tier-semantic (D-JN31-9); period_associations multi-entry granularity per seed era-phase sub-section structure (D-JN31-2; 8 entries with multi-period across 40 types); AG floor year resolution to seed-literal year not plan-default approximate (D-JN31-4 biscuit 1950 + confirmat 1970 corrections via A-5 + Mike-locked); cross-category authoring discipline via primary parent_category_id + related_joinery_types per Q5 Option M (D-JN31-5; 21 cross-references all resolve); reasoning rule forward-references closed via category-string applies_to_entry_types + per-entry regional_persistence_notes / anti_classification_guidance population (D-JN31-7).
- Next sequencing: fasteners library schema + content authoring per Phase 2 Session 7 four-file evidence library architecture (Block 32 forward).

---

## Block 32 — Appraiser-Practice Framework Audit-Log Capture
## Architectural commitments for Phase 3 engine reshape + new evidence layer + boundary discipline
## Session 14 / claude.ai-and-Claude-Code paired execution
## Base SHA: main ed9c9e4 (Block 31 endpoint / Phase 2 Session 7 first library closure)

This block captures the appraiser-practice framework Mike articulated at the close of Block 31 session. The framework reshapes Phase 3 engine architecture, adds a new low-weighted evidence layer (style design-aspects / wave-variation), and establishes per-entry date floor/ceiling boundary discipline that distinguishes whole-piece dating evidence from replaceable-component evidence. No content or schema changes this block. Architectural commitments captured below as D-AP32-N decisions (new prefix: AP = Appraiser-Practice framework). Subsequent Phase 2 evidence library blocks (fasteners + hardware + upholstery covers + upholstery construction) author with awareness of these commitments. Phase 2 Session 9 (HCL + styleFamilies) absorbs design-aspects content from forthcoming re-uploaded styles reference. Phase 3 architecture reshape proceeds per the framework.

### D-AP32-1 (locked): Engine reasoning approach — hybrid validation refinement model
Phase 3 engine architecture produces simulated reconciliation logic using category weights + overlap as a combined dataset. Engine output is a starting-point reconciliation that surfaces: (a) per-layer evidence-statements with date-range outputs (date_floor + date_ceiling + boundary-characteristic + justification-notes); (b) overlap visualization showing convergence regions across layer date-ranges; (c) confidence score primarily driven by overlap-amount, modified by per-entry positive_authority weighting; (d) reconciliation proposal (most-likely wave / period assignment) for appraiser-user review. Hybrid validation: appraiser-user (Mike or eventual son handoff) reviews engine reconciliation; validation feedback refines engine accuracy over time. Engine reasoning is NEVER asserted as authoritative attribution; engine produces reconciliation starting-point and appraiser-user determines final attribution. This pattern matches Mike's in-person evaluation practice and respects the Independent Layer Evaluation Standard (D-PA-1) at the user-facing operation level.

### D-AP32-2 (locked): New canonical evidence layer — Style Design Aspects / Wave Variation
Adds a new low-weighted evidence layer encoding style design-aspects within style families: overall size, visual weight, design influences, simplified vs ornate design, proportion characteristics, ornamentation density, and similar within-style observations that narrow date-range beyond style-family identification alone. Each design aspect carries its own period_associations (date_floor + date_ceiling + usage_notes). Authority calibration: LOW per design-aspect evidence characterization. Default 5/5 or 6/6 per D-AR29-5 semantic anchor table (supporting-evidence-only discipline); per-entry override where canonical source warrants. Distinguishes design-aspect evidence from style-family identification evidence (which sits at categorical-strong evidence authority). Content source: extrapolated from forthcoming re-uploaded styles reference document (Mike's notes on differentiating waves within a style). Source authoring deferred to Phase 2 Session 9 (HCL + styleFamilies) when Mike re-uploads. Architectural location: design aspects authored either as sub-structure within StyleFamilyEntry (sub-array `design_aspects: DesignAspectEntry[]`) OR as separate canonical library (`styleDesignAspects.ts`). Decision deferred to Phase 2 Session 9 plan-mode based on actual aspect count per family + cross-reference patterns visible in re-uploaded styles reference.

### D-AP32-3 (locked): Date floor/ceiling boundary discipline — per-entry boundaries NOT applied to whole-piece dating automatically
Each canonical evidence entry's `period_associations` (date_floor + date_ceiling) describes WHEN THAT EVIDENCE WAS IN USE — not when pieces containing that evidence were produced. Boundary evidence can indicate multiple interpretations: production period (original construction); restoration period (repair-introduced component); replacement period (later upgrade or part swap); conversion period (piece repurposed or modified). The engine must NOT apply per-entry date_floor or date_ceiling to the whole piece as a hard boundary. Engine surfaces the date_floor/date_ceiling as evidence-layer-output with interpretation context; reconciliation visualization shows the layer's range alongside other layers; appraiser-user reconciliation determines whether the boundary indicates production / restoration / replacement / conversion per the piece's overall evidence convergence pattern. Per-entry positive_authority is PARTIALLY tied to likelihood-of-replacement: evidence harder to replace without destroying the piece carries higher authority (primary wood, joinery character, form characteristics); evidence easier to replace (hardware, fasteners, upholstery, repair-component joinery) carries lower authority for whole-piece-dating purposes. Authority calibration discipline applies this framework to subsequent canonical library authoring (fasteners + hardware + upholstery covers + upholstery construction + styleFamilies + HCL). Mike-locked at drafted strength per pre-Op-C authorization turn: replacement-likelihood is canonical authority-calibration discipline for subsequent libraries.

### D-AP32-4 (locked): Phase 3 architecture reshape per appraiser-practice framework
Phase 3 engine integration work (previously scoped as "weight evidence and produce attribution confidence") reshapes to: (a) match evidence layers to canonical entries per piece observations; (b) per matched entry, emit structured output `{layer, evidence_statement, date_floor, date_ceiling, boundary_characteristic, justification_notes, authority_weight, replacement_likelihood}`; (c) pass collection to report layer; (d) report layer renders overlap timeline visualization; (e) report layer computes overlap-driven confidence with authority weighting modifier; (f) report layer proposes reconciliation (most-likely wave / period assignment) for appraiser-user review; (g) hybrid validation pattern: appraiser-user adjustments refine engine reasoning over time (mechanism for validation feedback capture is Phase 4+ work; Phase 3 initial implementation produces reconciliation starting-point only). Phase 3 deliverables now include: per-layer evidence-matching engine (replaces hardcoded `AUTHORITY_RANK` at engine.ts:3697-3714 with per-entry authority consumption per D-WE26-FINAL); per-entry structured output emission; overlap visualization component (report layer); confidence calculation with overlap-primary + authority-modifier; reconciliation proposal logic with appraiser-review UX. Cross-library scaling factors (Phase 3 readiness dependency per D-AR29-7) resolves via per-entry-uniform-scale approach: authority values across libraries carry comparable semantics at the layer-output level (each layer produces evidence outputs with its own authority weights); reconciliation layer applies authority weighting to overlap-confidence calculation. Per-library scaling factors are NOT needed because the overlap-driven confidence model treats per-layer outputs as comparable inputs rather than as semantically-identical weighted contributions. Mike-locked at drafted strength per pre-Op-C authorization turn: resolves Block 29 Issue 2 ("8" semantic asymmetry) via overlap-driven confidence + authority-weighting modifier.

### D-AP32-5 (locked): Sequencing
Phase 2 remaining sessions proceed in this order: (1) Block 32 (this block) — audit-log capture; (2) Blocks 33+ — fasteners library schema + content (Phase 2 Session 7 second library); (3) Blocks N+ — hardware library schema + content (Phase 2 Session 7 third library); (4) Blocks N+ — upholstery covers library schema + content (Phase 2 Session 7 fourth library — first half of textile reference); (5) Blocks N+ — upholstery construction library schema + content (Phase 2 Session 7 fifth library — second half of textile reference); (6) Blocks N+ — Phase 2 Session 9: HCL + styleFamilies.ts + design-aspects evidence layer (per D-AP32-2; Mike re-uploads styles reference for design-aspects content authoring); (7) Blocks N+ — Phase 2 Session 8b end-of-Phase-2 reconciliation pass per D-AR29-10 gate work item; (8) Phase 3 engine architecture reshape per D-AP32-4. Subsequent evidence library authoring (Blocks 33 through end of Phase 2 Session 7) applies D-AP32-3 authority calibration discipline (replacement-likelihood-aware weighting) per entry.

### D-AP32-6 (locked): Framework cross-references to existing audit decisions
- **D-PA-1 / D-WE26-6 (Independent Layer Evaluation Standard):** D-AP32-1 hybrid validation model is the user-facing operation that respects ILE at reconciliation rather than forcing upstream layer combination.
- **D-AR29-5 (semantic anchor table):** D-AP32-2 design aspects layer authority calibration uses anchor table values 5 (appraiser-honest acknowledged uncertainty) and 6 (supporting-evidence-only) per low-weighted design-aspect evidence characterization.
- **D-AR29-7 ("8" semantic asymmetry as Phase 3 readiness dependency):** D-AP32-4 resolves via per-entry-uniform-scale approach with overlap-driven confidence calculation.
- **D-AR29-10 (end-of-Phase-2 reconciliation pass gate):** D-AP32-5 sequencing places gate at standard Phase 2 Session 8b position; design-aspects-layer absorption per D-AP32-2 may expand reconciliation pass scope.
- **D-WE26-FINAL (engine.ts hardcoded AUTHORITY_RANK migration deferred to Phase 3):** D-AP32-4 specifies the per-entry-authority-consumption replacement; authority-rank table becomes per-entry positive_authority readout.

### D-AP32-FINAL (post-capture summary)
Block 32 ship: appraiser-practice framework architectural commitments captured as 6 D-AP32-N decisions.
- Files modified: **1** (`lib/constraints/AUDIT_LOG.md`).
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation.
- All 15 canonical array lengths unchanged: SPECIES_EVIDENCE 26 / SUBSTRATE_EVIDENCE 5 / CUT_GRAIN_EVIDENCE 35 / WOOD_DIAGNOSTIC_SIGNALS 8 / WOOD_EVIDENCE_REASONING_RULES 7 / MAKER_ENTRIES 77 / MAKER_ATTRIBUTION_REASONING_RULES 8 / MAKER_MARKS (legacy) 25 / FORMS 183 / FAMILIES 12 / SPATIAL_BEHAVIORS 76 / CONSTRUCTION_LOGIC 4 / JOINERY_CATEGORIES 15 / JOINERY_TYPES 40 / JOINERY_REASONING_RULES 5.
- No canonical content authored this block.

Framework summary:
1. **Engine = simulated reconciliation logic; hybrid validation refinement** (D-AP32-1). Engine output is reconciliation starting-point; appraiser-user determines final attribution; validation feedback refines engine accuracy over time.
2. **New evidence layer = Style Design Aspects / Wave Variation** (D-AP32-2). Low-weighted (5/5 or 6/6 default per D-AR29-5); Phase 2 Session 9 authoring pending Mike's re-upload of styles reference; architectural location (sub-array vs separate library) deferred to Session 9 plan-mode.
3. **Boundary discipline = per-entry date_floor/date_ceiling NOT whole-piece-applied** (D-AP32-3). Boundary interpretations: production / restoration / replacement / conversion; appraiser-user reconciliation determines interpretation. Replacement-likelihood is canonical authority-calibration discipline for subsequent libraries (Mike-locked).
4. **Phase 3 architecture reshape = per-layer structured outputs + overlap visualization + reconciliation proposal + hybrid validation** (D-AP32-4). Per-entry-uniform-scale approach resolves D-AR29-7 "8" semantic asymmetry without per-library scaling factors (Mike-locked).
5. **Sequencing = remaining Phase 2 Session 7 libraries (fasteners + hardware + upholstery × 2) → Phase 2 Session 9 (HCL + styleFamilies + design-aspects) → Phase 2 Session 8b reconciliation pass → Phase 3 reshape** (D-AP32-5).
6. **Cross-references = ILE Standard, semantic anchor table, readiness dependencies, reconciliation gate, engine hardcoded migration** (D-AP32-6).

- 6 audit decisions captured under D-AP32-N block-scoped prefix (D-AP32-1 through D-AP32-6 + D-AP32-FINAL).
- **Phase 2 Session 7 second library (fasteners): QUEUED for Block 33.** Mike uploads `Fastener_Reference.docx` for Block 33 Op A.

---

## Block 33 — Fasteners library schema foundation + 6 categories + 9 subcategories + 5 reasoning rules + dual-assessment architecture convention
## Phase 2 Session 7 second library OPENS
## Session 14 / claude.ai-and-Claude-Code paired execution
## Base SHA: main d01fbc1 (Block 32 endpoint / Appraiser-Practice Framework captured)

Opens Phase 2 Session 7 second library (fasteners) per D-AP32-5 sequencing. Authors `lib/constraints/fasteners.ts` with 4 interfaces (`FastenerCategoryEntry`, `FastenerSubcategoryEntry`, `FastenerTypeEntry`, `FastenerReasoningRule`) + 4 arrays (FASTENER_CATEGORIES 6 entries + FASTENER_SUBCATEGORIES 9 entries + FASTENER_TYPES empty scaffold + FASTENER_REASONING_RULES 5 entries). Three-tier hierarchy (Category → Subcategory → Type) matches canonical source structure where subcategories are different evidence classes (Hand-Forged vs Cut vs Wire nails; Handmade vs Machine-Cut vs Phillips vs Modern Drive screws; Upholstery Tacks vs Machine Staples). Block 34 will populate 25 FASTENER_TYPES content entries from canonical source per Op A-6 enumeration.

### D-FA33-1 (locked): Block 33 scope per Q1-Q4 lockings
Single fasteners.ts file with 4 interfaces + 4 arrays. FASTENER_CATEGORIES 6 entries; FASTENER_SUBCATEGORIES **9 entries** (refined from plan estimate "~10-13" to seed-actual 9 per D-FA33-12); FASTENER_TYPES empty scaffold for Block 34; FASTENER_REASONING_RULES 5 entries at 9/9. Two-block split per Q3: Block 33 = schema + categories + subcategories + rules; Block 34 = 25 FASTENER_TYPES content authoring.

### D-FA33-2 (locked): Library architecture per Q1
Single-file with 4 interfaces parallel to maker marks + joinery single-file-multi-interface pattern. Three-tier hierarchy (Category → Subcategory → Type) per Q2; subcategory tier matches canonical source structure (Hand-Forged vs Cut vs Wire nails are different evidence classes with own canonical content). Per-subcategory authority calibration + assessment_layer routing enabled.

### D-FA33-3 (locked): Two-block split per Q3
Block 33 = schema + 6 categories + 9 subcategories + 5 rules. Block 34 = 25 specific fastener types content authoring. Two-block scope decision locked.

### D-FA33-4 (locked): Hardware Reference upload deferred per Q4
Hardware library follows fasteners-established patterns at later session. No hardware schema authored Block 33.

### D-FA33-5 (locked): DUAL-ASSESSMENT ARCHITECTURE CONVENTION — forward-applicable to all subsequent canonical evidence library authoring
Each canonical evidence library declares assessment_layer at the LIBRARY/STRUCTURAL level (not per-entry):
- **Default = "frame"** for all evidence libraries.
- **Exception = "upholstery"** (only upholstery covers + upholstery construction libraries when authored).
- **Fasteners library:** assessment_layer = "frame" DEFAULT with per-SUBCATEGORY override for upholstery-class subcategories (Subcategory 3A Upholstery Tacks + Subcategory 3B Machine Staples → "upholstery"). Per-fastener-type assessment routing inherits from declared subcategory; types under Cat 3 STAPLES inherit "upholstery"; all other types inherit "frame".
- **Hardware library:** assessment_layer = "frame" (frame-adjacent; to be authored at later session per D-FA33-4).
- **Maker marks library:** assessment_layer = "frame" (frame-only; upholstery shop labels date upholstery campaign which is already covered by upholstery construction evidence at later session).
- **Wood / joinery / forms / families / spatial / construction / styles / HCL:** all assessment_layer = "frame".

Schema encoding per Op A-11 Option II: `assessment_layer` field on BOTH `FastenerCategoryEntry` AND `FastenerSubcategoryEntry` (with subcategory override of category default). All 6 FASTENER_CATEGORIES at "frame"; all subcategories inherit except Category 3 STAPLES subcategories (3A + 3B) which override to "upholstery". Verified Op G-11 distribution: 6 categories "frame" + 0 "upholstery"; 7 subcategories "frame" + 2 subcategories "upholstery".

Report layer surfaces TWO independent dated assessments: frame + upholstery. Evidence from each library accumulates to its declared assessment_layer per the canonical convention. Cross-references appraiser-practice framework (D-AP32-1 hybrid validation; D-AP32-4 Phase 3 reshape).

Per Mike architectural clarification (Block 33 plan turn): dual-assessment exists because antique reupholstery is the typical case rather than the exception. Frame is the canonical piece; upholstery is a separate canonical artifact attached to the frame. Separating the two assessments enables the frame to be independently evaluated without reupholstery contaminating the frame attribution decision.

### D-FA33-6 (locked): Physical location is identification HELPER, not assessment routing field
Per Mike clarification (Block 33 plan turn): location can determine the fastener type but once correctly identified, the fastener is aged according to that identification. `PositionOnPiece` appears on `FastenerTypeEntry` as `common_observed_locations?: PhysicalLocation[]` (optional; helps user identify what they're looking at). NOT used for assessment routing — assessment routing is determined by canonical category/subcategory `assessment_layer` at library structural level per D-FA33-5.

### D-FA33-7 (locked): D-AP32-3 replacement-likelihood calibration applied per fastener subcategory
`replacement_likelihood` field on `FastenerTypeEntry` (Block 34 authoring) carries "low" | "medium" | "high" per A-10 calibration:
- **LOW**: Hand-Forged Nails, Handmade Screws, Cut Nails (mostly), Bolts/Rods/Machine Fasteners, Knock-Down Connectors.
- **MEDIUM**: Wire Nails, Machine-Cut Screws, Upholstery Tacks, Glue-Assisted Fasteners.
- **HIGH**: Phillips-Head Screws, Modern Drive Types, Machine Staples.

Per-type override permitted Block 34 authoring per canonical source warrant. Fasteners are the CANONICAL TEST CASE for D-AP32-3 (high-replacement-likelihood evidence class); per-entry authority downweighted vs harder-to-replace evidence (wood, joinery character, form).

### D-FA33-8 (locked): Cross-library overlap resolution
Fastener entries and joinery entries describe DIFFERENT evidence-axis phenomena (joinery = joint type / construction pattern; fastener = fastener object in canonical fastener-class terms). Cross-references via `related_joinery_types` field on `FastenerTypeEntry` (Block 34 authoring); no duplicate canonical content. Op A-7 identified 5 cross-reference candidates for Block 34 authoring: biscuit_compression_plate ↔ joinery_type_biscuit_joint; cam_lock_connector ↔ joinery_type_knock_down_cam_lock_joinery; confirmat_screw ↔ joinery_type_confirmat_screw_joinery; corrugated_fastener ↔ joinery_type_corrugated_fastener_reinforcement; upholstery_staple ↔ joinery_type_stapled_drawer_joinery.

### D-FA33-9 (locked): 5 FastenerReasoningRule entries authored per Block 33 + canonical source coverage
- **Rule #1 fasteners_alone_never_dates_furniture**: cross_layer_scope: true; meta-rule; pre-category introductory framework + STRONGEST/WEAKEST WHEN canonical framing cited in rationale per Surfacing 3 resolution.
- **Rule #2 replacement_fastener_risk**: D-AP32-3 operationalization; STRONGER than joinery's restoration_false_signals rule because fasteners ARE the most-replaced canonical evidence class. Pre-category WEAKEST WHEN framework cited per Surfacing 3 resolution.
- **Rule #3 rural_persistence**: parallel to joinery rural_persistence_warning rule (Block 30 D-JN30 rule #2); cut nails + slotted screws + hand-forged nails regional persistence canonical examples.
- **Rule #4 restoration_contamination**: operationalizes dual-assessment architecture per D-FA33-5; reupholstery-era staples and Phillips screws are 'restoration contamination' for frame assessment but 'campaign evidence' for upholstery assessment. 11-row Quick-Reference Grid cited as cross-validation anchor per Surfacing 4 resolution.
- **Rule #5 fastener_evidence_layer_independence**: cross_layer_scope: true; fourth canonical-library encoding of Independent Layer Evaluation Standard (after wood rule #7, maker rule #1 cross_layer_scope, joinery rule #5).

All 5 at authority 9/9; migration_status "complete"; migration_target "engine_reasoning". cross_layer_scope: true on rules #1 + #5.

### D-FA33-10 (locked): Authority calibration distribution per A-9 + D-AR29-11 semantic anchor table
- **FASTENER_CATEGORIES**: 2 at 8/8 (NAILS, SCREWS); 4 at 7/7 (STAPLES, BOLTS/RODS/MACHINE, KNOCK-DOWN, GLUE-ASSISTED). Verified Op G runtime distribution: `{7: 4, 8: 2}`.
- **FASTENER_SUBCATEGORIES**: 6 at 8/8 (1A Hand-Forged, 1B Cut Nails, 1C Wire Nails, 2A Handmade Screws, 2B Machine-Cut, 2C Phillips-Head); 3 at 7/7 (2D Modern Drive Types, 3A Upholstery Tacks, 3B Machine Staples). Verified Op G runtime distribution: `{7: 3, 8: 6}`.
- **FASTENER_REASONING_RULES**: all 5 at 9/9 per meta-rule supremacy precedent (D-WE26-8 / D-MM27-5).

### D-FA33-11 (locked): Fourth canonical-library encoding of Independent Layer Evaluation Standard
After wood rule #7 (wood_evidence_layer_independence), maker rule #1 (core_maker_attribution_rule cross_layer_scope: true), joinery rule #5 (joinery_evidence_layer_independence), fastener rule #5 (fastener_evidence_layer_independence). Cross-library convention reinforced: each evidence-library reasoning-rule set includes one layer-independence canonical artifact per ILE precedent. Operationally integrates with dual-assessment architecture (D-FA33-5) — fastener layer outputs are independent inputs to both frame and upholstery assessment confidence calculations.

### D-FA33-12 (locked): Subcategory count refinement — seed-actual 9 (not plan estimate "10-13")
Op A-5 enumeration confirmed canonical source structure has exactly 9 subcategories: 3 NAILS subcategories (1A Hand-Forged + 1B Cut Nails + 1C Wire Nails) + 4 SCREWS subcategories (2A Handmade + 2B Machine-Cut + 2C Phillips-Head + 2D Modern Drive Types) + 2 STAPLES subcategories (3A Upholstery Tacks + 3B Machine Staples) + 0 subcategories for Categories 4/5/6 (no subcategory tier per seed). Total 3+4+2+0+0+0 = **9 subcategories**. Plan estimate "~10-13" was approximate; canonical-source fidelity supersedes plan estimate per Op A-12 verification gate refinement. G-4 gate refined to `FASTENER_SUBCATEGORIES.length === 9` (exact). Block 33 D-FA33-1 + D-FA33-FINAL language reflects exact count.

Convention precedent for future evidence libraries: plan-estimate counts are placeholder pending Op A canonical source extraction; seed-actual counts supersede plan estimates with audit-decision capture of the refinement (parallel to D-JN31-9 category-context inheritance precedent — seed authority over plan-estimate authority where canonical-source fidelity is the discipline).

### D-FA33-Surfacing-2 (locked): FastenerCategoryEntry.core_identifying_elements is OPTIONAL
Seed Category 6 GLUE-ASSISTED has UNIQUE TRAITS section but no separate CORE IDENTIFYING ELEMENTS section (other 5 categories have both sections). Per Mike authorization: `core_identifying_elements?: string[]` made OPTIONAL on `FastenerCategoryEntry` interface; Cat 6 GLUE-ASSISTED authoring omits the field with notes-field marker per defensible-defaults DESCRIPTION fill discipline (Block 31 standard). Per-category field-naming variance precedent: D-JN30-9 (joinery library categories with COMMON IN instead of IDENTIFYING ELEMENTS).

### D-FA33-Surfacing-3 (locked): Pre-category introductory framework cited in reasoning rule rationale
Seed opening prose ("Fasteners are among the most powerful dating tools in furniture analysis because they often carry hard technological boundaries...") + FASTENERS ARE STRONGEST WHEN canonical framework (original + structurally integrated + repeated consistently + supported by surrounding evidence) + FASTENERS ARE WEAKEST WHEN canonical framework (isolated + clearly replaced + decorative only + attached during upholstery or restoration + inconsistent with surrounding construction) cited in Rule #1 (fasteners_alone_never_dates_furniture) and Rule #2 (replacement_fastener_risk) rationale fields. No separate canonical entry for introductory section.

### D-FA33-Surfacing-4 (locked): 11-row FASTENER DATING QUICK-REFERENCE GRID cited as cross-validation anchor
Grid cited in Rule #4 (restoration_contamination) rationale field as cross-validation anchor for industrial-introduction era boundaries (Stapled upholstery post-1950 + Phillips screws post-1935 + KD connectors post-1960 + Torx fasteners post-1967 + Confirmat screws post-1970). No separate canonical entry for Grid (similar to joinery's GENERAL DATE ASSOCIATION SUMMARY treatment).

### D-FA33-FINAL (post-authoring summary)
Block 33 ship: schema foundation + 6 FASTENER_CATEGORIES + 9 FASTENER_SUBCATEGORIES + 5 FASTENER_REASONING_RULES + empty FASTENER_TYPES scaffold + dual-assessment architecture convention captured.
- Files modified: **2** (`lib/constraints/fasteners.ts` NEW; `lib/constraints/AUDIT_LOG.md` append).
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation.
- NEW arrays: **FASTENER_CATEGORIES (6) + FASTENER_SUBCATEGORIES (9) + FASTENER_TYPES (0) + FASTENER_REASONING_RULES (5)**.
- All 15 prior canonical array lengths unchanged: SPECIES_EVIDENCE 26 / SUBSTRATE_EVIDENCE 5 / CUT_GRAIN_EVIDENCE 35 / WOOD_DIAGNOSTIC_SIGNALS 8 / WOOD_EVIDENCE_REASONING_RULES 7 / MAKER_ENTRIES 77 / MAKER_ATTRIBUTION_REASONING_RULES 8 / MAKER_MARKS (legacy) 25 / FORMS 183 / FAMILIES 12 / SPATIAL_BEHAVIORS 76 / CONSTRUCTION_LOGIC 4 / JOINERY_CATEGORIES 15 / JOINERY_TYPES 40 / JOINERY_REASONING_RULES 5.
- `lib/constraints/entryShape.ts`, `woodIdentification.ts`, `woodEvidence.ts`, `makerMarks.ts`, `forms.ts`, `families.ts`, `spatialBehaviors.ts`, `constructionLogic.ts`, `joinery.ts`: all byte-for-byte unchanged.
- Authority distribution: FASTENER_CATEGORIES `{7: 4, 8: 2}`; FASTENER_SUBCATEGORIES `{7: 3, 8: 6}`; FASTENER_REASONING_RULES all 9/9.
- assessment_layer distribution: 6 categories "frame" + 0 "upholstery"; 7 subcategories "frame" + 2 subcategories "upholstery" (3A Upholstery Tacks + 3B Machine Staples per D-FA33-5 override).
- cross_layer_scope distribution: 2 reasoning rules at true (#1 fasteners_alone_never_dates_furniture + #5 fastener_evidence_layer_independence); 3 at false (#2 replacement_fastener_risk + #3 rural_persistence + #4 restoration_contamination).
- Dual-assessment architecture convention: **CAPTURED**. Forward-applicable to hardware + upholstery covers + upholstery construction libraries.
- **Phase 2 Session 7 second library schema foundation: OPENED.**
- 13 audit decisions captured under D-FA33-N block-scoped prefix (D-FA33-1 through D-FA33-12 + D-FA33-FINAL; Surfacing-2/3/4 captured as decision-block extensions documenting plan-locked resolutions).
- Convention precedents established/reinforced this block: dual-assessment architecture convention forward-applicable to subsequent evidence libraries (D-FA33-5); physical location is identification helper not routing field (D-FA33-6); replacement-likelihood calibration discipline canonical test case (D-FA33-7); cross-library overlap resolution via related_*_types FK fields with semantic-axis separation (D-FA33-8); fourth canonical-library encoding of ILE Standard reinforces per-library layer-independence rule convention (D-FA33-11); seed-actual count supersedes plan-estimate count with audit-decision capture (D-FA33-12); per-category field-naming variance permitted via optional-field schema (D-FA33-Surfacing-2 per D-JN30-9 precedent).
- **Block 34 queued: 25 FASTENER_TYPES content authoring** from Fastener_Reference.docx canonical source with D-FA33-7 replacement_likelihood calibration applied per type + D-FA33-8 cross-library related_joinery_types FK cross-references per Op A-7 candidates.

---

## Block 34 — FASTENER_TYPES content authoring (25 entries across 12 sub-batches); fasteners library content-complete; Phase 2 Session 7 second library CLOSED
## Session 15 / claude.ai-and-Claude-Code paired execution
## Base SHA: main cb232a6 (Block 33 endpoint / Fasteners library schema foundation opening)

Closes Phase 2 Session 7 second library (fasteners) per D-AP32-5 sequencing + D-FA33-3 two-block split. Authors 25 FastenerTypeEntry entries across 12 internal sub-batches per Fastener_Reference.docx canonical source. Sub-batch distribution: 2 (1A Hand-Forged) + 3 (1B Cut Nails) + 3 (1C Wire Nails) + 1 (2A Handmade Screws) + 3 (2B Machine-Cut) + 1 (2C Phillips) + 3 (2D Modern Drive) + 1 (3A Upholstery Tacks) + 1 (3B Machine Staples) + 3 (Cat 4 Bolts) + 2 (Cat 5 KD) + 2 (Cat 6 Glue-Assisted) = 25 total. Closes Block 33 reasoning rule forward-references on Rule #2 replacement_fastener_risk + Rule #3 rural_persistence + Rule #4 restoration_contamination per D-FA34-9.

Schema augmentation per Block 34 D-FA34-Surfacing-8 (Block 33 schema-gap correction): added `regional_persistence_notes?: string` optional field to `FastenerTypeEntry` interface paralleling `JoineryTypeEntry` precedent. Block 33 schema was content-only-locked but plan A-9 + D-FA34-7 referenced the field; minimal correction permits plan-locked rural-persistence content authoring without architectural deviation.

### D-FA34-1 (locked): Block 34 scope per Q1-Q4 lockings
Single combined ship with 12 internal sub-batches (one per subcategory + one per sub-categoryless category per Op A-3 enumeration). 25 FASTENER_TYPES entries authored. Per-sub-batch tsc check + intermediate length report through Op C-1 through Op C-12. Mid-batch pause protocol active throughout.

### D-FA34-2 (locked): period_associations granularity per Q2 Option E precedent (Block 31)
Multi-entry array where seed provides explicit era phases; single-entry otherwise. `date_range_summary` field carries seed DATE RANGE prose verbatim regardless of array length.

**5 multi-period types** (era-phase sub-sections in seed):
- `fastener_type_slotted_wood_screw`: 2 entries (1840-1940 dominant + 1940+ post-Phillips persistence)
- `fastener_type_robertson`: 2 entries (1908-1949 introduction + 1950+ mid-20th-century dominance)
- `fastener_type_allen_hex_socket_screw`: 2 entries (1910-1949 technology introduction + 1950+ furniture commonality)
- `fastener_type_upholstery_staple`: 2 entries (1930-1949 introduction + 1950+ widespread upholstery use)
- `fastener_type_corrugated_fastener`: 2 entries (1880-1929 industrial introduction + 1930-1950 widespread dominance; end-ceiling 1950 per canonical seed unique among fastener types)

**20 single-period types** otherwise.

### D-FA34-3 (locked): replacement_likelihood per-type per Q2 Option D defensible-defaults
Default per category per D-FA33-7; per-type override permitted with notes-field marker. One override applied: `fastener_type_threaded_rod` resolved LOW (plan A-5 "LOW-MEDIUM" → LOW per "structural; not commonly replaced" rationale per D-FA34-Surfacing-6).

**Final distribution: {low: 10, medium: 10, high: 5}** (verified Op G G-13).
- LOW (10): rosehead_nail, l_head_t_head_nail, early_hand_headed_cut_nail, machine_headed_cut_nail, handmade_wood_screw, carriage_bolt, threaded_rod, barrel_nut_cross_dowel, cam_lock_connector, confirmat_screw
- MEDIUM (10): brad_finish_cut_nail, common_wire_nail, finish_nail, box_nail, slotted_wood_screw, brass_wood_screw, steel_wood_screw, decorative_brass_tack, corrugated_fastener, biscuit_compression_plate
- HIGH (5): phillips_wood_screw, robertson, torx, allen_hex_socket_screw, upholstery_staple

### D-FA34-4 (locked): AG entries on 8 types per Q3 Option F industrial-introduction-boundary pattern
**Final AG count: 8** (plan Q3 estimate "7-8" resolved to 8 per A-4 Biscuit/Compression Plate inclusion). AG prose canonical pattern: "Pre-[year] presence of this fastener type indicates either repair-introduction (Replacement Fastener Risk + Restoration Contamination per FastenerReasoningRule #2 and #4) or misidentification; this fastener did not exist in pre-[year] original construction."

| Type | AG floor |
|---|---|
| phillips_wood_screw | 1935 |
| robertson | 1908 |
| torx | 1967 |
| allen_hex_socket_screw | 1910 (D-FA34-Surfacing-1; decade-start convention; "furniture commonality later" qualifier captured in usage_notes on 1910+ period_associations) |
| upholstery_staple | 1930 (D-FA34-Surfacing-2; D-JN31-4 introduction-year-is-AG-floor convention; diverges from joinery library stapled_drawer_joinery AG 1950 per D-FA34-11) |
| cam_lock_connector | 1960 (matches joinery D-JN31 precedent ✓) |
| confirmat_screw | 1970 (matches joinery D-JN31-9 precedent ✓) |
| biscuit_compression_plate | 1950 (D-FA34-Surfacing-3; matches joinery D-JN31-4 biscuit precedent ✓) |

`fastener_type_corrugated_fastener` does NOT carry AG per D-FA34-Surfacing-4 (soft-boundary phrasing "Common in inexpensive case furniture" does not meet hard boundary-classification threshold; period_associations array [1880-1929 + 1930-1950] captures range adequately).

### D-FA34-5 (locked): Cross-category FK assignment per Q4 mapping
**5 types with `related_joinery_types` FK** to corresponding joinery library entries per Op A-7 + D-FA33-8:
- `fastener_type_biscuit_compression_plate` → `["joinery_type_biscuit_joint"]`
- `fastener_type_cam_lock_connector` → `["joinery_type_knock_down_cam_lock_joinery"]`
- `fastener_type_confirmat_screw` → `["joinery_type_confirmat_screw_joinery"]`
- `fastener_type_corrugated_fastener` → `["joinery_type_corrugated_fastener_reinforcement"]`
- `fastener_type_upholstery_staple` → `["joinery_type_stapled_drawer_joinery"]`

All 5 FKs verified to resolve via Op G G-10. One-directional fastener → joinery cross-reference per D-FA33-8; joinery library NOT augmented with reverse `related_fastener_types` field per Op A-8 default lean.

### D-FA34-6 (locked): Authority calibration distribution per D-AR29-11 + D-AP32-3
**Final distribution (verified Op G G-12): positive_authority {7: 11, 8: 14}; hard_negative_authority {7: 11, 8: 14}.**

**14 entries at 8/8** (canonical anchor positions per A-6):
- 6 STRONGLY EARLY anchors: rosehead_nail (1600-1820), l_head_t_head_nail (1700-1840), early_hand_headed_cut_nail (1790-1835), machine_headed_cut_nail (1825-1895), handmade_wood_screw (1750-1840), slotted_wood_screw (1840-1940 dominant + rural-persistence-bounded)
- 1 post-industrial floor anchor: common_wire_nail (1890+)
- 7 AG anchors: phillips_wood_screw (1935), robertson (1908), torx (1967), cam_lock_connector (1960), confirmat_screw (1970), upholstery_staple (1930), biscuit_compression_plate (1950)

**11 entries at 7/7** (secondary canonical-source rationale per A-6): brad_finish_cut_nail, finish_nail, box_nail, brass_wood_screw, steel_wood_screw, allen_hex_socket_screw, decorative_brass_tack, carriage_bolt, threaded_rod, barrel_nut_cross_dowel, corrugated_fastener.

Note: `allen_hex_socket_screw` stays at 7/7 despite AG presence per D-FA34-Surfacing-5 — canonical "Furniture commonality later" qualifier weakens anchor strength below 8/8 threshold. AG still applied per Q3 industrial-introduction-boundary discipline.

### D-FA34-7 (locked): regional_persistence_notes populated on 6 rural-persistence-bounded types per A-9 + Rule #3
**6 types populated** (verified Op G):
- fastener_type_rosehead_nail (hand-forged frontier/rural)
- fastener_type_l_head_t_head_nail (hand-forged frontier/rural)
- fastener_type_early_hand_headed_cut_nail (cut nails rural production)
- fastener_type_machine_headed_cut_nail (cut nails rural production)
- fastener_type_brad_finish_cut_nail (cut nails specialty persistence)
- fastener_type_slotted_wood_screw (slotted screws remained common after Phillips)

Field added to `FastenerTypeEntry` schema per D-FA34-Surfacing-8 Block 33 schema-gap correction (parallels JoineryTypeEntry precedent). Per-entry prose cross-references FastenerReasoningRule #3 rural_persistence canonical-source warnings; appraiser-honest framing per Block 30 D-JN30-5 Rule #2 precedent.

### D-FA34-8 (locked): common_observed_locations field populated sparsely per D-FA33-6
Identification-helper discipline per D-FA33-6 (location HELPS identification; once identified the type's age determined by canonical period_associations; NOT used for assessment routing). Populated where seed gives clear physical-location mapping (sparse population per defensible-defaults convention).

**12 types populated** with PhysicalLocation enum values: l_head_t_head_nail (case_carcass/back/panel), brad_finish_cut_nail (trim_or_molding), finish_nail (trim_or_molding), phillips_wood_screw (movable_hardware_attachment), robertson (movable_hardware_attachment), torx (movable_hardware_attachment), allen_hex_socket_screw (movable_hardware_attachment), decorative_brass_tack (upholstery_attachment_point/arm/back), upholstery_staple (upholstery_attachment_point/support_layer), carriage_bolt (frame_joint/structural_reinforcement), threaded_rod (structural_reinforcement), cam_lock_connector (case_carcass/frame_joint), confirmat_screw (case_carcass), corrugated_fastener (frame_joint/case_corner), biscuit_compression_plate (frame_joint). 13 types omit field per sparse-population defensible default.

### D-FA34-9 (locked): Block 33 reasoning rule forward-references RESOLVED
- **Rule #2 replacement_fastener_risk**: per-type `replacement_likelihood` field populated on all 25 entries operationalizes the rule (D-FA34-3 distribution). 8 AG entries provide concrete temporal anchors per D-FA34-4.
- **Rule #3 rural_persistence**: 6 entries with `regional_persistence_notes` populated per D-FA34-7 cross-reference Rule #3 canonical-source warnings.
- **Rule #4 restoration_contamination**: 8 AG entries per D-FA34-4 cross-reference Rule #4 + dual-assessment architecture (D-FA33-5); reupholstery-era staples and Phillips screws are "campaign evidence" for upholstery assessment but "restoration contamination" if interpreted against frame dating.

`applies_to_entry_types: ["fastener_type", ...]` category-string FKs on all 3 forward-referencing rules now close per Block 34 type-array population.

### D-FA34-10 (locked): Fasteners library content-complete on Block 34 ship; Phase 2 Session 7 second library CLOSED
Schema foundation (Block 33) + 6 categories (Block 33) + 9 subcategories (Block 33) + 5 reasoning rules (Block 33) + 25 types (Block 34) = fasteners library canonically content-complete. Phase 2 Session 7 second library CLOSED. Next sequencing per D-AP32-5: hardware library schema + content authoring per Phase 2 Session 7 four-file evidence library architecture (Mike uploads `Hardware Reference.docx` for that block's Op A).

### D-FA34-11 (locked per Mike-authorization addition): Cross-library AG floor divergence — explicit audit decision
**`fastener_type_upholstery_staple` AG floor 1930 vs `joinery_type_stapled_drawer_joinery` AG floor 1950.**

Two canonical sources (`Fastener_Reference.docx` for fasteners library + `JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx` for joinery library) provide different AG floor anchors for the staple/stapled-joinery phenomenon. Per the per-canonical-source fidelity convention:
- **Fastener library AG floor 1930**: per `Fastener_Reference.docx` seed DATE RANGE "c. 1930-present. Very common after 1950" — 1930 is explicit canonical introduction year; 1950 captured as second `period_associations` entry per D-JN31-4 introduction-year-is-AG-floor convention.
- **Joinery library AG floor 1950**: per `JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx` seed DATE RANGE "1950s-present" — 1950 IS the canonical introduction year for the joinery-pattern phenomenon (no earlier introduction phase surfaced in joinery canonical source).

The divergence is canonical-source-driven, not arbitrary. The two phenomena are distinct: a fastener type (physical hardware) vs a joinery pattern (construction technique using staples). Each library's AG anchor reflects its own canonical source's introduction date for its specific phenomenon.

**Convention precedent established for future cross-library overlap resolution:** when two canonical evidence libraries describe related-but-distinct phenomena with different canonical-source introduction dates, each library's AG anchor follows its own canonical source. Divergence is captured as an explicit audit decision; cross-references via `related_*_types` FK fields document the relationship without forcing identity.

Forward-applicable to:
- Hardware library entries that may cross-reference joinery construction patterns
- Upholstery covers + construction libraries that may cross-reference joinery upholstery-related patterns + fastener upholstery-staple entries
- Subsequent libraries with related-but-distinct phenomena across canonical sources

### D-FA34-Surfacing-1 (locked): Allen/Hex Socket AG floor 1910
Seed "c. 1910s–present. Furniture commonality later". Decade-start convention; AG covers technology-introduction boundary. "Furniture commonality later" qualifier captured in `usage_notes` on 1910+ `period_associations` entry. Note in entry notes field flags the technology-vs-furniture-context distinction. Authority stays at 7/7 despite AG per D-FA34-Surfacing-5.

### D-FA34-Surfacing-2 (locked): Upholstery Staple AG floor 1930 per D-JN31-4 convention
Canonical seed "c. 1930–present. Very common after 1950" = 1930 introduction year is AG floor; 1950 widespread-use date captured as second `period_associations` entry. Divergence from joinery library `stapled_drawer_joinery` AG 1950 captured as D-FA34-11 cross-library AG floor divergence decision.

### D-FA34-Surfacing-3 (locked): Biscuit/Compression Plate AG floor 1950 matches joinery library precedent
Matches joinery library D-JN31-4 biscuit_joint precedent. Adds 8th AG to plan Q3 estimate of 7 (resolved AG count to 8).

### D-FA34-Surfacing-4 (locked): Corrugated Fastener NO AG
Canonical seed "c. 1880–1950" date range; "Common in inexpensive case furniture" soft-boundary phrasing does not meet hard boundary-classification threshold for AG. `period_associations` array captures range adequately. AG count stays at 8 (not 9).

### D-FA34-Surfacing-5 (locked): Authority calibration adjustments
- allen_hex_socket_screw at 7/7 (NOT 8/8) despite AG presence — "Furniture commonality later" canonical qualifier weakens anchor strength below 8/8 threshold.
- biscuit_compression_plate at 8/8 per joinery library biscuit_joint precedent + AG anchor (matches D-FA34-Surfacing-3 resolution).
- Final authority distribution: {7: 11, 8: 14}.

### D-FA34-Surfacing-6 (locked): replacement_likelihood Threaded Rod LOW
Plan A-5 "LOW-MEDIUM" → LOW per "structural; not commonly replaced" rationale. No other per-type category-default overrides applied. Distribution {low: 10, medium: 10, high: 5}.

### D-FA34-Surfacing-7 (locked): common_observed_locations sparse population
Per D-FA33-6 identification-helper discipline. 12 of 25 types populated; 13 omit field per defensible-defaults sparse-population convention. PhysicalLocation enum values selected from 34-value entryShape.ts enum (Block 22 D-PA-1 closed enum) per seed Common Locations mapping.

### D-FA34-Surfacing-8 (locked): FastenerTypeEntry schema augmentation — regional_persistence_notes field added
**Block 33 schema-gap correction.** Block 33 plan template + schema authoring omitted `regional_persistence_notes` field from `FastenerTypeEntry` interface despite plan A-9 + D-FA34-7 referencing the field on Block 34 type authoring. Joinery library `JoineryTypeEntry` has the field per Block 30 D-JN30-3 + Block 31 D-JN31 authoring; parallel encoding warranted for fasteners library Rule #3 rural_persistence operationalization.

**Resolution**: minimal schema augmentation — added `regional_persistence_notes?: string` (OPTIONAL field) to `FastenerTypeEntry` interface in `fasteners.ts` Block 34 ship. Field is optional; backwards-compatible with Block 33-era code (none authored type entries; no existing entries to migrate). Parallels `JoineryTypeEntry.regional_persistence_notes` precedent exactly.

**Convention precedent**: discovery of schema gap during content authoring permits minimal schema augmentation in content-only block when: (a) plan explicitly references the field; (b) augmentation parallels established precedent from prior library; (c) field is optional and backwards-compatible. Schema augmentation captured as Surfacing-N decision in audit log; not as Op B re-opening. This precedent permits future canonical evidence libraries (hardware + upholstery × 2) to apply analogous mid-content-block schema corrections without architectural deviation.

### D-FA34-FINAL (post-authoring summary)
Block 34 ship: 25 FASTENER_TYPES entries authored across 12 internal sub-batches; fasteners library canonically content-complete; Phase 2 Session 7 second library CLOSED.
- **`FASTENER_TYPES.length`: 0 → 25** (verified Op G G-2).
- **Authority distribution**: `positive_authority {7: 11, 8: 14}`; `hard_negative_authority {7: 11, 8: 14}` per D-FA34-6.
- **replacement_likelihood distribution**: `{low: 10, medium: 10, high: 5}` per D-FA34-3.
- **AG count: 8** (phillips, robertson, torx, allen_hex_socket, upholstery_staple, cam_lock, confirmat, biscuit_compression_plate) per D-FA34-4.
- **Cross-library `related_joinery_types` FK count: 5** (biscuit, cam_lock, confirmat, corrugated, upholstery_staple) per D-FA34-5 — all FKs resolve to authored joinery_type ids.
- **`regional_persistence_notes` populated count: 6** (hand-forged × 2 + cut nails × 3 + slotted_wood_screw) per D-FA34-7.
- **`common_observed_locations` populated count: 12 of 25** per D-FA34-8 + D-FA34-Surfacing-7 sparse-population discipline.
- **period_associations multi-entry types: 5** (slotted_wood_screw, robertson, allen_hex_socket_screw, upholstery_staple, corrugated_fastener) per D-FA34-2.
- Files modified: **2** (`lib/constraints/fasteners.ts` schema augmentation + content; `lib/constraints/AUDIT_LOG.md` append).
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation.
- **All 18 prior canonical array lengths unchanged**: SPECIES_EVIDENCE 26 / SUBSTRATE_EVIDENCE 5 / CUT_GRAIN_EVIDENCE 35 / WOOD_DIAGNOSTIC_SIGNALS 8 / WOOD_EVIDENCE_REASONING_RULES 7 / MAKER_ENTRIES 77 / MAKER_ATTRIBUTION_REASONING_RULES 8 / MAKER_MARKS (legacy) 25 / FORMS 183 / FAMILIES 12 / SPATIAL_BEHAVIORS 76 / CONSTRUCTION_LOGIC 4 / JOINERY_CATEGORIES 15 / JOINERY_TYPES 40 / JOINERY_REASONING_RULES 5 / FASTENER_CATEGORIES 6 / FASTENER_SUBCATEGORIES 9 / FASTENER_REASONING_RULES 5.
- `lib/constraints/entryShape.ts`, `woodIdentification.ts`, `woodEvidence.ts`, `makerMarks.ts`, `forms.ts`, `families.ts`, `spatialBehaviors.ts`, `constructionLogic.ts`, `joinery.ts`: all byte-for-byte unchanged.
- 11 numbered audit decisions captured under D-FA34-N block-scoped prefix (D-FA34-1 through D-FA34-11 + D-FA34-FINAL) + 8 Surfacing-N decision-block extensions documenting plan-locked + Mike-authorized resolutions.
- **Fasteners library: CANONICALLY CONTENT-COMPLETE.** Schema foundation + 6 categories + 9 subcategories + 25 types + 5 reasoning rules.
- **Phase 2 Session 7 second library: CLOSED.**
- Convention precedents established this block: cross-library AG floor divergence as explicit audit decision (D-FA34-11; canonical-source-driven per-library anchor with cross-references via related_*_types FK documenting relationship without forcing identity); mid-content-block schema augmentation permitted for plan-referenced field discovered to be missing from prior block's schema (D-FA34-Surfacing-8; minimal, parallels established precedent, optional/backwards-compatible); identification-helper sparse-population discipline (D-FA34-Surfacing-7); per-canonical-source fidelity over joinery-library cross-reference identity (D-FA34-Surfacing-2 + D-FA34-11).
- Next sequencing per D-AP32-5: hardware library schema + content authoring per Phase 2 Session 7 four-file evidence library architecture (Block N+1 forward; Mike uploads `Hardware Reference.docx` for that block's Op A).

---

## Block 35 — Hardware library schema foundation + 13 categories + 5 reasoning rules + StyleAssociation entryShape.ts promotion + HardwareMakerAssociation hardware-local interface
## Phase 2 Session 7 third library OPENS
## Session 16 / claude.ai-and-Claude-Code paired execution
## Base SHA: main efa7a88 (Block 34 endpoint / Fasteners library content-complete)

Opens Phase 2 Session 7 third library (hardware) per D-AP32-5 sequencing. Authors new `lib/constraints/hardware.ts` with 4 interfaces (`HardwareCategoryEntry` + `HardwareTypeEntry` + `HardwareReasoningRule` + `HardwareMakerAssociation`) + 3 arrays (HARDWARE_CATEGORIES 13 entries + HARDWARE_TYPES empty scaffold + HARDWARE_REASONING_RULES 5 entries). Promotes `StyleAssociation` interface to `entryShape.ts` per D-HW35-4 schema-occurrence rule (used by hardware NOW + Phase 2 Session 9 design-aspects layer + possibly upholstery covers library; 1 use today + 2+ planned future uses across separate libraries satisfies 3+ occurrence threshold).

2-tier hierarchy per D-HW35-3 (Category → Type with flattened subtype variants); no subcategory tier. Per-category assessment_layer override mechanism per D-HW35-14 (paralleling fasteners' per-subcategory override pattern but operating at category tier since hardware library has no subcategory tier). UPHOLSTERY HARDWARE category overrides default "frame" → "upholstery" per D-HW35-7. NEW canonical reasoning rule `reproduction_hardware_warning` per D-HW35-13 (4th new evidence-library reasoning-rule TYPE after restoration_false_signals + replacement_fastener_risk + restoration_contamination). FIFTH canonical-library encoding of Independent Layer Evaluation Standard per D-HW35-12 via Rule #5 `hardware_evidence_layer_independence` (after wood/maker/joinery/fastener).

### D-HW35-1 (locked): Block 35 scope per Q1-Q3 lockings
Single hardware.ts file with 4 interfaces + 3 arrays. HARDWARE_CATEGORIES 13 entries; HARDWARE_TYPES empty scaffold for Block 36 (~42 entries TBD per Block 36 Op A); HARDWARE_REASONING_RULES 5 entries at 9/9. NO HARDWARE_SUBCATEGORIES array per D-HW35-3 (2-tier hierarchy). Two-block split per Block 33 fasteners precedent: Block 35 = schema + categories + rules; Block 36 = type content. StyleAssociation interface promoted to entryShape.ts per D-HW35-4. Mike-locked authorization includes 14 numbered D-HW35-N audit decisions + D-HW35-FINAL summary.

### D-HW35-2 (locked): Library architecture per Q1-Q3
Single-file architecture with 4 interfaces in `hardware.ts` (paralleling maker marks + joinery + fasteners single-file-multi-interface pattern). 2-tier hierarchy (Category → Type) per Q3 + canonical source structure per D-HW35-3; no HardwareSubcategoryEntry interface. Schema is 1 interface smaller than fasteners (4 vs 5 interfaces).

### D-HW35-3 (locked): 2-tier hierarchy with subtype-as-flattened-type pattern
Hardware canonical source (Furniture_Hardware_Identification_System.docx) uses Category → Type with optional subtype variants under some parent types (e.g., Drop Pull / Bail Pull → Batwing Bail Pull / Chippendale Bail Pull / Sheraton Oval Bail Pull; Butt Hinge → Hand-Forged Butt Hinge / Machine-Made Butt Hinge). NO discrete subcategory tier (unlike fasteners which had 3-tier for NAILS/SCREWS/STAPLES). **Resolution**: subtypes flattened as separate HARDWARE_TYPES entries with `related_hardware_types` FK linking subtype → parent type. Block 36 authoring populates both parent types and subtypes as separate entries. Mirrors joinery library precedent (no subcategory tier; all types directly under categories).

Convention precedent: subtype-as-flattened-type pattern is the defensible default for 2-tier canonical sources with intra-type variants. Alternative patterns (3-tier subcategory; sub-structure within type) reserved for canonical sources with discrete variant-class semantics.

### D-HW35-4 (locked): StyleAssociation interface PROMOTED to entryShape.ts per Q1 schema-occurrence rule
Per Q1 Mike-locked authorization: HardwareTypeEntry includes optional `style_associations: StyleAssociation[]` field; **StyleAssociation interface PROMOTED to entryShape.ts** per schema-occurrence rule. Shape parallels PeriodAssociation with one key difference: `date_floor` is OPTIONAL on StyleAssociation (vs required on PeriodAssociation) because some style labels lack precise emergence years (e.g., "Colonial Revival" emerges as a broad movement around 1880s but no single canonical year).

**Schema-occurrence rule fires at promotion**: 1 use today (hardware) + 2+ planned future uses across separate libraries (Phase 2 Session 9 design-aspects layer per D-AP32-2 + possibly upholstery covers library for style-tied textile patterns) satisfies 3+ occurrence threshold for shared `entryShape.ts` canonical home. Parallels prior promotions: PeriodAssociation (Block 27 D-MM27-2; wood + maker + 4 woodEvidence + joinery + fastener + hardware libraries) and ReasoningRuleMigrationTarget (Block 27 D-MM27-3).

`entryShape.ts` line count: 405 → 446 (+41 lines for StyleAssociation interface with JSDoc).

### D-HW35-5 (locked): HardwareMakerAssociation interface hardware-local (NOT promoted)
Per Q2 Mike-locked authorization: HardwareTypeEntry includes optional `maker_associations: HardwareMakerAssociation[]` field; **HardwareMakerAssociation interface IN hardware.ts** (NOT promoted to entryShape.ts). Schema-occurrence rule does NOT fire — only hardware library needs to encode hardware-specific maker-mark structure on canonical hardware pieces; other libraries cross-reference makers via different mechanisms (e.g., joinery `notes` field for maker context; wood library handles maker association at MakerMarkEntry level directly). Interface shape: `maker_id` (FK to MAKER_ENTRIES.id) + `mark_form?` + `mark_location?` (both free-text per per-canonical-source flexibility, NOT PhysicalLocation enum since hardware-piece locations don't map cleanly to furniture-position enum) + `date_floor?` + `date_ceiling?` + `usage_notes?`.

### D-HW35-6 (locked): SCHEMA-PRESENT-CONTENT-DEFERRED discipline (NEW convention precedent)
Per Q2 Mike-locked authorization + A-10 + A-11 (no canonical maker coverage in hardware reference). `maker_associations` field is SCHEMA-PRESENT (interface declared, field included on HardwareTypeEntry) but Block 36 authoring leaves `maker_associations: []` empty arrays for ALL hardware type entries. Hardware reference canonical source has ZERO maker documentation (verified Op A — NO Stanley, Wilcox, Eagle Lock, Sargent, Yale references in canonical source).

**SCHEMA-PRESENT-CONTENT-DEFERRED discipline** distinct from empty-scaffold-with-planned-authoring pattern (FASTENER_TYPES had planned authoring at Block 34). Schema-present-content-deferred = field exists in schema; per-entry content explicitly deferred to **validation-phase one-offs + post-launch systematic authoring** with NO scheduled Block-N authoring plan.

**Forward-applicable convention precedent**: future libraries with canonical sources that surface partial-coverage content may apply this precedent for fields requiring future canonical-source augmentation (e.g., hardware reference v2 with maker coverage; or external maker mark database integration). Field availability today preserves schema stability when future content is authored.

### D-HW35-7 (locked): UPHOLSTERY HARDWARE category assessment_layer "upholstery" override
Per Surfacing 2 + A-11 + fasteners Cat 3 STAPLES override precedent. HARDWARE_CATEGORIES entry `hardware_category_upholstery_hardware` carries `assessment_layer: "upholstery"` override (NOT "frame" default). The category covers Upholstery Tacks + Decorative Nailhead Trim + Coil Spring Hardware — all functionally upholstery-attached, NOT frame-attached. Override pattern paralleling fasteners D-FA33-5 dual-assessment architecture (fasteners Cat 3 STAPLES subcategories 3A + 3B → "upholstery").

**Distribution (verified Op G G-10)**: 12 categories at "frame" + 1 category at "upholstery" (UPHOLSTERY HARDWARE).

### D-HW35-8 (locked): Strong/Weak Dating Indicators tier classification in Rule rationale
Per Surfacing 3 + A-12. Canonical Strong Dating Indicators (8 verbatim items: hand-forged irregular hinges, surface-mounted iron locks, porcelain casters, Bakelite pulls, Euro hinges, machine-stamped decorative plates, Phillips screw integration, Lucite pulls) and Weak Dating Indicators (5 verbatim items: generic wooden knobs, reproduction brass pulls, modern replacement hinges, recently polished hardware, mixed-period hardware sets) captured verbatim in Rule #1 `hardware_alone_never_dates_furniture` + Rule #2 `replacement_hardware_risk` + Rule #4 `reproduction_hardware_warning` rationale fields.

NO new schema field for tier classification — per-type authority calibration (D-AR29-11) operationalizes the tier framework at the entry level. Block 36 type authoring will calibrate per-type positive_authority + replacement_likelihood per the Strong/Weak Dating Indicators classification.

### D-HW35-9 (locked): Cross-library overlap resolution per per-canonical-source fidelity
Per Surfacing 4 + A-9 + D-FA34-11 cross-library AG floor divergence precedent. Three verified cross-library collisions:

| Hardware type (Block 36 authoring) | Cross-library FK |
|---|---|
| `hardware_type_cam_lock` (LOCK HARDWARE category) | `related_fastener_types: ["fastener_type_cam_lock_connector"]` + `related_joinery_types: ["joinery_type_knock_down_cam_lock_joinery"]` |
| `hardware_type_upholstery_tacks` (UPHOLSTERY HARDWARE category) | `related_fastener_types: ["fastener_type_decorative_brass_tack"]` (cross-reference to fastener subcategory 3A type entry) |
| Hardware Strong Dating Indicator "Phillips screw integration" | Block 36 authoring may add `related_fastener_types: ["fastener_type_phillips_wood_screw"]` on hardware types that integrate Phillips screws as identification anchor |

**Convention reinforced**: per-canonical-source fidelity over forced canonical identity. Each library authors its own canonical content per its own source; cross-references via FK fields document the relationship without forcing identity. Hardware library reference describes phenomena from hardware-identification perspective; fastener library from fastener-type perspective; joinery from joinery-pattern perspective.

### D-HW35-10 (locked): 5 HardwareReasoningRule enumeration
Per A-7 canonical content + parallel to wood/maker/joinery/fastener reasoning rule sets:
- **Rule #1 `hardware_alone_never_dates_furniture`** (9/9; cross_layer_scope: true; meta-rule; FIFTH canonical-library encoding of "X alone never dates furniture" pattern)
- **Rule #2 `replacement_hardware_risk`** (9/9; D-AP32-3 operationalization; STRONGER than fasteners' replacement_fastener_risk because hardware is even MORE-replaced canonical evidence class per replacement-likelihood ranking: hardware > fasteners > joinery > wood)
- **Rule #3 `rural_persistence`** (9/9; parallel to joinery rural_persistence_warning + fastener rural_persistence; canonical anchor on Surface-Mount Lock "Rural persistence later" + Strap Hinge "Medieval origins. Furniture use: 1650-1900" + Wooden Caster persistence patterns)
- **Rule #4 `reproduction_hardware_warning`** (9/9; NEW canonical reasoning rule per D-HW35-13; canonical anchor on Hardware Conflict Rules canonical-source section: "Colonial revival batwing pulls on 1920s furniture", "Reproduction Eastlake hardware", etc.)
- **Rule #5 `hardware_evidence_layer_independence`** (9/9; cross_layer_scope: true; FIFTH canonical-library encoding of ILE Standard per D-HW35-12)

All 5 at authority 9/9 (verified Op G G-7); migration_status "complete"; migration_target "engine_reasoning". cross_layer_scope: true on rules #1 + #5 (verified Op G G-9).

### D-HW35-11 (locked): Authority calibration distribution per D-AR29-11
**HARDWARE_CATEGORIES distribution (verified Op G G-11): positive_authority {7: 11, 8: 2}; hard_negative_authority {7: 11, 8: 2}.**

**2 categories at 8/8 (primary dating-evidence)**:
- `hardware_category_hinge_hardware`: hand-forged 1750-1830 vs machine-made 1840+ canonical era boundary + mortised installation harder-to-replace than pulls
- `hardware_category_specialty_and_era_diagnostic_hardware`: era-defining hardware (Eastlake 1870-1895, Art Deco 1925-1945, MCM 1945-1975, Machine-Age 1900-1950) tightly date-bounded canonical anchors

**11 categories at 7/7 (medium-strong; replacement-likelihood-aware per D-AP32-3)**: Pull Hardware, Knob Pull, Bin Pull, Ring Pull, Lock Hardware, Escutcheons, Casters and Mobility Hardware, Corner and Edge Hardware, Desk and Mechanical Hardware, Upholstery Hardware, Modern Synthetic Hardware.

**HARDWARE_REASONING_RULES**: all 5 at 9/9 per meta-rule supremacy precedent (D-WE26-8 / D-MM27-5).

Hardware is the MOST-REPLACED canonical evidence class per Mike's replacement-likelihood framework (hardware > fasteners > joinery > wood); whole-piece-dating authority weights downward accordingly. Even primary dating-evidence categories (HINGE + SPECIALTY) stay at 8/8 rather than ascending to 9/9 because the underlying physical evidence remains replaceable (just less commonly).

### D-HW35-12 (locked): FIFTH canonical-library encoding of Independent Layer Evaluation Standard
After wood rule #7 (`wood_evidence_layer_independence`), maker rule #1 (`core_maker_attribution_rule` cross_layer_scope: true), joinery rule #5 (`joinery_evidence_layer_independence`), fastener rule #5 (`fastener_evidence_layer_independence`), hardware rule #5 (`hardware_evidence_layer_independence`). Cross-library convention reinforced: each evidence-library reasoning-rule set includes one layer-independence canonical artifact per ILE precedent. Operationally integrates with dual-assessment architecture (D-FA33-5 + D-HW35-7 + D-HW35-14) — hardware layer outputs are independent inputs to both frame and upholstery assessment confidence calculations per D-AP32-1 hybrid validation refinement model.

### D-HW35-13 (locked): NEW canonical reasoning rule reproduction_hardware_warning
Hardware library Rule #4 `reproduction_hardware_warning` is the **fourth NEW evidence-library reasoning-rule TYPE** authored across Phase 2 Session 7 libraries (after `restoration_false_signals` Block 30 joinery Rule #3 + `replacement_fastener_risk` Block 33 fastener Rule #2 + `restoration_contamination` Block 33 fastener Rule #4). Captures Hardware Conflict Rules canonical-source warnings specifically about hardware reproduction markets (Colonial Revival batwing reproductions, Reproduction Eastlake hardware, Victorian + Art Deco mixed-period sets, Euro hinge retrofits on antique pieces).

**Distinct from replacement-risk patterns**: reproduction hardware is canonically DESIGNED to mimic original-period hardware (unlike replacement fasteners which are typically modernity-marked). Reproduction hardware requires dedicated rule because identification anchors are different (style fidelity + manufacturing-era marks + cross-reference to documented reproduction-market production windows).

### D-HW35-14 (locked per Mike-authorization addition): Per-category-vs-per-subcategory override mechanism documentation
**Dual-assessment architecture routing override mechanism** (D-FA33-5) is operationalized at different tier levels depending on canonical source hierarchy:
- **3-tier libraries (fasteners)**: PER-SUBCATEGORY override pattern. Categories declare default `assessment_layer`; subcategories override where canonical structure warrants. Example: fasteners Cat 3 STAPLES = "frame" category default; subcategories 3A Upholstery Tacks + 3B Machine Staples both override to "upholstery".
- **2-tier libraries (hardware)**: PER-CATEGORY override pattern. Categories ARE the routing tier (no subcategory tier to override). Hardware Cat 11 UPHOLSTERY HARDWARE overrides directly to "upholstery" at category level.

**Convention precedent**: dual-assessment override mechanism operates at the LOWEST-AVAILABLE-TIER below category-default level. For 3-tier libraries, that's subcategory tier. For 2-tier libraries, override happens at category tier itself (the category IS the lowest available routing tier).

**Forward-applicable to future canonical evidence libraries**:
- Upholstery covers library (likely 2-tier; per-category override if needed; ALL categories assessment_layer "upholstery" likely)
- Upholstery construction library (likely 2-tier; ALL categories assessment_layer "upholstery" likely)
- Phase 2 Session 9 styleFamilies (likely 2-tier or HCL structure; per-category override at category tier if needed)

This decision documents the routing mechanism's tier-level variance as canonical convention rather than implicit pattern.

### D-HW35-FINAL (post-authoring summary)
Block 35 ship: hardware library schema foundation + 13 HARDWARE_CATEGORIES + empty HARDWARE_TYPES scaffold (Block 36 populates) + 5 HARDWARE_REASONING_RULES + StyleAssociation entryShape.ts promotion + HardwareMakerAssociation hardware-local interface.
- **NEW arrays**: `HARDWARE_CATEGORIES` (13) + `HARDWARE_TYPES` (0) + `HARDWARE_REASONING_RULES` (5). Total 18 new canonical entries this block.
- **HARDWARE_CATEGORIES authority distribution**: `positive_authority {7: 11, 8: 2}`; `hard_negative_authority {7: 11, 8: 2}` per D-HW35-11.
- **HARDWARE_CATEGORIES assessment_layer distribution**: 12 "frame" + 1 "upholstery" (UPHOLSTERY HARDWARE override per D-HW35-7) per D-HW35-14 per-category override mechanism.
- **HARDWARE_REASONING_RULES**: all 5 at 9/9 with migration_status "complete" + migration_target "engine_reasoning"; cross_layer_scope: true on Rule #1 + Rule #5 per D-HW35-10.
- **StyleAssociation promoted to entryShape.ts** per D-HW35-4 schema-occurrence rule; field type used by HardwareTypeEntry NOW + Phase 2 Session 9 design-aspects + possibly upholstery covers libraries.
- **HardwareMakerAssociation hardware-local interface** per D-HW35-5 (NOT promoted; schema-occurrence rule doesn't fire).
- **Schema-present-content-deferred discipline** per D-HW35-6 (NEW convention precedent) — `maker_associations` field schema-present, Block 36 leaves arrays empty.
- **Per-category override mechanism documentation** per D-HW35-14 (NEW convention precedent) — 2-tier libraries override at category tier; 3-tier libraries override at subcategory tier; routing happens at lowest-available-tier.
- Files modified: **3** (`lib/constraints/hardware.ts` NEW; `lib/constraints/entryShape.ts` modified (+41 lines StyleAssociation); `lib/constraints/AUDIT_LOG.md` append).
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation.
- **All 19 prior canonical array lengths unchanged**: SPECIES_EVIDENCE 26 / SUBSTRATE_EVIDENCE 5 / CUT_GRAIN_EVIDENCE 35 / WOOD_DIAGNOSTIC_SIGNALS 8 / WOOD_EVIDENCE_REASONING_RULES 7 / MAKER_ENTRIES 77 / MAKER_ATTRIBUTION_REASONING_RULES 8 / MAKER_MARKS (legacy) 25 / FORMS 183 / FAMILIES 12 / SPATIAL_BEHAVIORS 76 / CONSTRUCTION_LOGIC 4 / JOINERY_CATEGORIES 15 / JOINERY_TYPES 40 / JOINERY_REASONING_RULES 5 / FASTENER_CATEGORIES 6 / FASTENER_SUBCATEGORIES 9 / FASTENER_TYPES 25 / FASTENER_REASONING_RULES 5.
- `lib/constraints/woodIdentification.ts`, `woodEvidence.ts`, `makerMarks.ts`, `forms.ts`, `families.ts`, `spatialBehaviors.ts`, `constructionLogic.ts`, `joinery.ts`, `fasteners.ts`: all byte-for-byte unchanged.
- 14 numbered audit decisions captured under D-HW35-N block-scoped prefix (D-HW35-1 through D-HW35-14 + D-HW35-FINAL).
- **Phase 2 Session 7 third library schema foundation: OPENED.**
- **Block 36 queued: ~42 HARDWARE_TYPES content authoring** from Furniture_Hardware_Identification_System.docx canonical source. Block 36 authoring will apply: per-type replacement_likelihood per D-AP32-3 + D-FA33-7 category defaults; AG entries on industrial-introduction-boundary types (Cam Lock 1920+, Euro Hinge 1960s+, Bakelite 1920-1955, Lucite 1945-1975, Rubber Caster 1920+, Porcelain Caster 1840-1910); style_associations populated from canonical Style references; maker_associations: [] empty arrays per D-HW35-6; regional_persistence_notes on rural-persistence-bounded types (Surface-Mount Lock, Strap Hinge, Wooden Caster, Hand-Forged Butt Hinge); related_hardware_types FK linking subtypes → parent types per D-HW35-3 flattening pattern; related_fastener_types + related_joinery_types cross-library FKs per D-HW35-9 (Cam Lock × 2, Upholstery Tacks × 1).
- Convention precedents established this block: 2-tier subtype-as-flattened-type pattern (D-HW35-3); StyleAssociation entryShape.ts promotion (D-HW35-4 + schema-occurrence rule precedent); HardwareMakerAssociation library-local pattern (D-HW35-5); SCHEMA-PRESENT-CONTENT-DEFERRED discipline (D-HW35-6); NEW reproduction_hardware_warning reasoning-rule TYPE (D-HW35-13); FIFTH ILE encoding (D-HW35-12); per-category-vs-per-subcategory override mechanism documentation (D-HW35-14); all forward-applicable to subsequent Phase 2 Session 7 libraries (upholstery covers + upholstery construction) and Phase 2 Session 9 (styleFamilies + design-aspects).
- Next sequencing per D-AP32-5: Block 36 hardware types content; then Phase 2 Session 7 fourth library (upholstery covers).

---

## Block 36 — HARDWARE_TYPES content authoring (43 entries across 13 sub-batches); hardware library content-complete; Phase 2 Session 7 third library CLOSES
## Session 16 / claude.ai-and-Claude-Code paired execution
## Base SHA: main 28a8cf1 (Block 35 endpoint / Hardware library schema foundation opening)

Closes Phase 2 Session 7 third library (hardware) per D-AP32-5 sequencing. Populates HARDWARE_TYPES (empty scaffold per Block 35 D-HW35-1) with 43 HardwareTypeEntry entries from `Furniture_Hardware_Identification_System.docx` canonical source. Schema foundation (Block 35) + 13 categories (Block 35) + 5 reasoning rules (Block 35) + 43 types (Block 36) = hardware library canonically content-complete.

13 internal authoring sub-batches per Q1 Option A — one per HARDWARE_CATEGORIES entry; per-sub-batch authoring in single ship. Per Block 35 Op A-6 preview (~42 types) revised to 43 per Block 36 Op A-3 enumeration (HINGE category resolved to 8 types vs preview 7 per D-HW36-14). Per Q2 Option D replacement_likelihood per-type defensible-defaults with notes-field-marker discipline per D-FA34-3 precedent. Per Q3 Option E AG entries reserved for hard-boundary types (3 total: cam_lock + concealed_euro_hinge + rubber_caster); era-bounded soft-boundary types (Bakelite 1920-1955, Lucite 1945-1975 peak, Porcelain Caster 1840-1910) captured as multi-period period_associations WITHOUT AG. Per Q4 cross-library FK populated on 2 hardware type entries (cam_lock × 2 FK fields, upholstery_tacks × 1 FK field; 3 cross-library refs total).

### D-HW36-1 (locked): Block 36 scope per Q1-Q4 lockings
Single combined ship with 13 internal sub-batches (per Q1 Option A). 43 HARDWARE_TYPES entries authored (per A-3 revised count; +1 vs Block 35 A-6 preview of ~42 due to HINGE category resolving to 8 types per D-HW36-14). All entries conform to HardwareTypeEntry interface per Block 35 D-HW35-2. Hardware library content-complete on Block 36 ship.

### D-HW36-2 (locked): period_associations granularity per Block 31 D-JN31-2 precedent
Multi-entry where seed provides explicit era phases; single-entry otherwise. Multi-period entries (12 total):
- drop_pull_bail_pull: 5 periods (Early examples / Federal-Hepplewhite wave / Empire-Classical wave / Victorian revival / Colonial Revival reuse)
- batwing_bail_pull: 2 periods (Original period inspiration / Major revival production)
- chippendale_bail_pull: 2 periods (Original Chippendale wave / Revival wave)
- sheraton_oval_bail_pull: 2 periods (Original Sheraton wave / Revival wave)
- turned_wooden_knob: 2 periods (Continuous use / Especially common)
- pressed_glass_knob: 2 periods (Primary / Revival)
- bin_pull: 2 periods (Continuous use / Peak early use)
- ring_pull: 2 periods (Continuous use / Major Victorian/Gothic wave)
- pierced_escutcheon: 2 periods (Primary / Revival)
- h_l_hinge: 2 periods (Primary / Revival)
- campaign_corner_bracket: 2 periods (Primary / Revival)
- acrylic_lucite_hardware: 2 periods (Peak / Continued)

Single-period entries (31 total): structural-category types + era-tight specialty types + functional-category types where seed provides single date range without phase breakdown.

Era-bounded soft-boundary types (Bakelite, Lucite, Porcelain Caster) use single-entry period_associations with explicit date_ceiling per D-HW36-4 Q3 Option E discipline (multi-period for Lucite to capture peak + continued).

### D-HW36-3 (locked): replacement_likelihood per-type defensible-defaults per Q2 Option D
Distribution: low 13, medium 21, high 9 (verified Op G). Per-type override marker per D-FA34-3 notes-field-marker precedent applied on:
- turned_wooden_knob: LOW override (rural persistence + structural simplicity) vs A-6 category default MEDIUM
- surface_mount_lock: LOW override (period locks remain in situ per rural persistence) vs A-6 category default MEDIUM
- batwing_bail_pull, chippendale_bail_pull, sheraton_oval_bail_pull: HIGH override (Colonial Revival reproduction-market dominance per Rule #4 canonical anchor) vs A-6 PULL HARDWARE parent MEDIUM
- concealed_euro_hinge: HIGH override (modern Euro retrofit on antique furniture commonly indicates restoration upgrade per Rule #2 + Rule #4) vs A-6 HINGE category default LOW

### D-HW36-4 (locked): AG entries on 3 hardware types per Q3 Option E hard-boundary discipline
- `hardware_type_cam_lock`: AG floor 1920 (HARDWARE-axis emergence per canonical seed "1920-present" verbatim). **DIVERGES from joinery 1960 + fasteners 1960 cam-lock-connector AG floors per D-FA34-11 cross-library AG floor divergence convention** — same physical phenomenon documented from hardware-identification + fastener-type + joinery-pattern perspectives; per-canonical-source fidelity per D-HW35-9. This is the **second concrete instance of D-FA34-11 cross-library AG floor divergence convention application** (first instance was Block 34 establishing the convention).
- `hardware_type_concealed_euro_hinge`: AG floor 1960 (canonical seed phrasing "1960s-present" — 1960 selected as conservative decade-floor anchor per D-HW36-N decade-range interpretation discipline + D-FA34-3 notes-field-marker precedent; per-entry notes + period_associations.usage_notes + AG.guidance_text all document the decade-range interpretation).
- `hardware_type_rubber_caster`: AG floor 1920 (vulcanization industrial-introduction era; canonical seed "1920-present" verbatim).

AG prose pattern: each guidance_text cross-references Rule #2 (replacement_hardware_risk) + Rule #4 (reproduction_hardware_warning) canonical-source anchors. cam_lock AG explicitly documents D-FA34-11 cross-library divergence; concealed_euro_hinge AG documents decade-range interpretation rationale.

Era-bounded soft-boundary types (bakelite 1920-1955, lucite 1945-1975 peak, porcelain_caster 1840-1910) captured as period_associations with explicit date_ceiling and seed-quoted usage_notes; NO AG per Q3 Option E (polymer-industry / ceramic-manufacturing production-window decline, NOT industrial-introduction-boundary).

### D-HW36-5 (locked): style_associations populated per D-HW35-4 + StyleAssociation interface
14 entries populated (vs A-5 estimate ~22-26). Lower than estimate reflects strict canonical fidelity per D-FA33-Surfacing-2 + D-JN30-9 optional-field discipline — populated only where canonical source clearly anchors hardware type to style wave; omitted where seed is silent on style. Populated entries:
1. drop_pull_bail_pull (4 styles: Federal/Hepplewhite, Empire/Classical, Victorian, Colonial Revival)
2. batwing_bail_pull (1: Colonial Revival)
3. chippendale_bail_pull (2: Rococo/Chippendale, Colonial Revival)
4. sheraton_oval_bail_pull (2: Neoclassical/Sheraton, Colonial Revival)
5. porcelain_knob (1: Victorian)
6. pressed_glass_knob (1: Victorian)
7. ring_pull (3: Victorian, Gothic, Campaign)
8. pierced_escutcheon (3: Rococo, Federal, Colonial Revival)
9. porcelain_caster (1: Victorian)
10. campaign_corner_bracket (1: Campaign)
11. eastlake_hardware (1: Eastlake)
12. art_deco_hardware (1: Art Deco)
13. mid_century_modern_hardware (1: Mid-Century Modern)
14. machine_age_industrial_hardware (1: Machine-Age Industrial)

Structural categories (HINGE, LOCK, DESK_MECHANICAL, CORNER_EDGE, UPHOLSTERY, MODERN_SYNTHETIC) and most KNOB PULL variants lack explicit canonical style references in seed; style_associations omitted per strict canonical fidelity. style_associations.usage_notes captures hardware-design-aspect context where applicable (e.g., "Refined neoclassical proportions on oval backplates" on drop_pull_bail_pull Federal/Hepplewhite entry).

### D-HW36-6 (locked): maker_associations: [] empty arrays for ALL 43 entries per D-HW35-6
Verified Op G G-10 — zero non-empty maker_associations across all 43 entries. SCHEMA-PRESENT-CONTENT-DEFERRED discipline applied uniformly; per-entry notes field documents the deferred-content marker per defensible-defaults discipline. Validation-phase one-offs + post-launch authoring path stands (no scheduled Block-N maker authoring plan).

### D-HW36-7 (locked): Cross-library FK assignment per Q4 + D-HW35-9 convention
3 cross-library refs on 2 entries (verified Op G G-11):
- `hardware_type_cam_lock`:
  - `related_fastener_types: ["fastener_type_cam_lock_connector"]`
  - `related_joinery_types: ["joinery_type_knock_down_cam_lock_joinery"]`
- `hardware_type_upholstery_tacks`:
  - `related_fastener_types: ["fastener_subcategory_upholstery_tacks"]`

Single-directional cross-references per D-FA33-8 + D-HW35-9 convention. Note: upholstery_tacks references the fastener SUBCATEGORY id (not a specific type id) because fasteners library Cat 3 STAPLES subcategory 3A IS the cross-library entry; type-level entries within that subcategory (e.g., fastener_type_decorative_brass_tack) are more granular fastener-axis distinctions. Cross-canonical-source phenomenon-identity captured at appropriate canonical tier per per-canonical-source fidelity.

### D-HW36-8 (locked): related_hardware_types FK populated per D-HW35-3 subtype-flattening pattern
6 subtype entries with related_hardware_types FK linking subtype → parent type (verified Op G G-12). NOTE: Block 36 plan A-9 stated "5 subtype entries" — that was a counting error in A-9. Correct count is 6:
- 3 subtypes of drop_pull_bail_pull: batwing_bail_pull, chippendale_bail_pull, sheraton_oval_bail_pull
- 2 subtypes of butt_hinge: hand_forged_butt_hinge, machine_made_butt_hinge
- 1 subtype of bin_pull: cardholder_bin_pull

KNOB PULL category 4 types (turned_wooden_knob, porcelain_knob, pressed_glass_knob, depression_glass_knob) are independent material variants per seed structure — NO parent-subtype hierarchy; NO related_hardware_types FK.

### D-HW36-9 (locked): regional_persistence_notes populated on 1 entry per strict canonical fidelity
Per A-8 strict canonical fidelity (Surfacing 3 resolution). Only `hardware_type_surface_mount_lock` carries regional_persistence_notes — the sole explicit verbatim "Rural persistence" canonical-source reference in entire hardware reference seed. Other rural-persistence-implicit types (Strap Hinge, Hand-Forged Butt Hinge, Wooden Caster) governed by Rule #3 (`rural_persistence`) at reasoning-rule level via `applies_to_entry_types: ["hardware_type"]` engine-level cross-reference; no per-type field population required.

### D-HW36-10 (locked): Authority calibration distribution per D-AR29-11 + A-7
**HARDWARE_TYPES distribution (verified Op G G-14): positive_authority {7: 28, 8: 15}; hard_negative_authority {7: 28, 8: 15}.**

**15 entries at 8/8 (era-canonical anchors + AG anchor types)**:
- drop_pull_bail_pull (multi-era canonical anchor)
- hand_forged_butt_hinge (1750-1830 hand-forge era ceiling)
- machine_made_butt_hinge (1840+ machine-precision era floor)
- h_l_hinge (1650-1820 early vernacular)
- strap_hinge (medieval origins, 1650-1900 furniture use)
- concealed_euro_hinge (1960 AG anchor)
- cam_lock (1920 AG anchor)
- porcelain_caster (1840-1910 Victorian era)
- rubber_caster (1920 AG anchor)
- eastlake_hardware (1870-1895 tight era)
- art_deco_hardware (1925-1945 tight era)
- mid_century_modern_hardware (1945-1975 era)
- machine_age_industrial_hardware (1900-1950 era)
- bakelite_hardware (1920-1955 polymer-industry window)
- acrylic_lucite_hardware (1945-1975 peak polymer-industry)

**28 entries at 7/7 (medium-strong; replacement-likelihood-aware per D-AP32-3)**: all 3 drop_pull subtypes; all 4 KNOB PULL types; both BIN PULL types; ring_pull; half_mortise_lock; full_mortise_lock; surface_mount_lock; all 3 ESCUTCHEONS; butt_hinge parent; piano_hinge; butterfly_hinge; wooden_caster; both CORNER/EDGE types; all 3 DESK/MECHANICAL types; all 3 UPHOLSTERY HARDWARE types.

### D-HW36-11 (locked): common_observed_locations field populated per D-FA33-6 identification-helper convention
All 43 entries carry `common_observed_locations: PhysicalLocation[]` populated from canonical-source observed-locations context per D-FA33-6 (location HELPS identification but NOT routing). Distribution skews to drawer_front (most pulls/escutcheons/locks/synthetic hardware) and door_panel (locks/hinges/pulls); upholstery_attachment_point on the 3 UPHOLSTERY HARDWARE types; foot_or_leg + base_or_plinth on casters; case_corner + edge_or_corner_protection on corner/edge hardware.

### D-HW36-12 (locked): Block 35 reasoning rule forward-references RESOLVED
Block 35 reasoning rules with `applies_to_entry_types: ["hardware_type"]` category-string FK now have 43 type entries to reference:
- Rule #1 (hardware_alone_never_dates_furniture): applies to all 43 hardware types (cross_layer_scope: true)
- Rule #2 (replacement_hardware_risk): applies to all 43 hardware types per-type replacement_likelihood field (Op G distribution: 13 low + 21 medium + 9 high)
- Rule #3 (rural_persistence): applies to hardware_type_surface_mount_lock via regional_persistence_notes field (per D-HW36-9 strict canonical fidelity); plus implicit application to rural-persistence-bounded types governed at reasoning-rule level
- Rule #4 (reproduction_hardware_warning): applies to all stylistically-defined hardware types per-type reproduction-context flagging (especially 3 PULL subtypes + ESCUTCHEONS + eastlake_hardware per Hardware Conflict Rules canonical anchors)
- Rule #5 (hardware_evidence_layer_independence): applies to all 43 hardware types (cross_layer_scope: true)

### D-HW36-13 (locked): Hardware library content-complete on Block 36 ship
Schema foundation (Block 35) + 13 categories (Block 35) + 5 reasoning rules (Block 35) + 43 types (Block 36) = hardware library canonically content-complete. Phase 2 Session 7 third library CLOSED.

### D-HW36-14 (locked): HINGE category +1 type vs Block 35 A-6 preview (D-HW36-N count refinement decision)
Block 35 A-6 preview estimated HINGE HARDWARE at 7 types; Block 35 A-4 enumeration listed 8 types (Butt + Hand-Forged Butt + Machine-Made Butt + H-L + Strap + Piano/Continuous + Butterfly + Concealed Euro). Block 36 Op A-3 enumeration confirms 8 types per canonical seed. A-6 preview was inconsistent with A-4 enumeration; A-4 was the correct count. Block 36 ships 8 HINGE entries → 43 total HARDWARE_TYPES (vs ~42 plan estimate). Convention precedent: Block N-1 schema-foundation block's PER-CATEGORY type count estimates may need Block N content-authoring revision; A-4 canonical enumeration takes precedence over A-6 informal preview.

### D-HW36-15 (locked): Concealed Euro Hinge AG decade-range interpretation discipline (D-HW36-N)
Canonical seed phrasing "1960s-present" does NOT pin specific decade-floor year (e.g., 1960 vs 1965 vs 1968). Block 36 selects **1960 as conservative decade-floor anchor** per defensible-defaults + D-FA34-3 notes-field-marker precedent. Documentation captured in 3 locations on hardware_type_concealed_euro_hinge entry:
- notes field documenting D-HW36-N decade-range interpretation rationale
- period_associations[0].usage_notes documenting "1960s-present" canonical phrasing + 1960 selection
- anti_classification_guidance.guidance_text documenting decade-range interpretation discipline

**Convention precedent**: when canonical sources surface decade-range phrasing ("1960s", "1920s", "1830s", etc.) without pinned-year emergence boundaries, select conservative decade-floor (year 0 of decade, e.g., 1960 / 1920 / 1830) as AG anchor + populate notes-field marker documenting decade-range interpretation. Forward-applicable to future libraries with decade-range canonical phrasing.

### D-HW36-16 (locked): D-FA34-11 cross-library AG floor divergence convention — second concrete instance
Block 36 application of D-FA34-11 represents the **second concrete instance** of the cross-library AG floor divergence convention (first instance was Block 34 establishing the convention via Phillips wood screw 1935 hardware-axis vs unspecified fastener-axis). Block 36 cam_lock AG 1920 hardware-axis vs joinery + fasteners 1960 cam-lock-connector represents the canonical example of the convention application: same physical phenomenon (KD-furniture cam-lock mechanism) documented from different evidence-axis perspectives with different canonical sources surfacing different temporal phases.

**Hardware-axis 1920**: canonical seed phrasing "1920-present" reflects mechanical-cam-lock-mechanism emergence as hardware form (early 20th century cabinetry locks evolving toward modern KD-furniture cam locks).

**Joinery + fasteners-axis 1960**: canonical KD-furniture-era emergence reflects post-WWII ready-to-assemble furniture manufacturing innovation (Ikea founded 1943; KD-cam-lock-connector standardized 1960s in flat-pack production).

Per-canonical-source fidelity reigns; cross-library FK links the same-physical-phenomenon entries without forcing canonical identity across libraries.

### D-HW36-FINAL (post-authoring summary)
Block 36 ship: 43 HARDWARE_TYPES entries authored across 13 internal sub-batches; hardware library canonically content-complete; Phase 2 Session 7 third library CLOSED.

- **HARDWARE_TYPES.length: 0 → 43** (verified Op G G-2).
- **Authority distribution**: positive_authority {7: 28, 8: 15}; hard_negative_authority {7: 28, 8: 15} per D-HW36-10.
- **replacement_likelihood distribution**: low 13, medium 21, high 9 per D-HW36-3.
- **AG count: 3** (cam_lock 1920 ★ D-FA34-11 second concrete instance; concealed_euro_hinge 1960 ★ decade-range interpretation; rubber_caster 1920) per D-HW36-4.
- **Cross-library FK count: 3 refs on 2 entries** (cam_lock × 2 + upholstery_tacks × 1) per D-HW36-7.
- **related_hardware_types FK count: 6 subtypes** (3 drop_pull + 2 butt_hinge + 1 bin_pull) per D-HW36-8.
- **regional_persistence_notes populated count: 1** (surface_mount_lock only) per D-HW36-9.
- **style_associations populated count: 14** per D-HW36-5 strict canonical fidelity.
- **maker_associations: [] on ALL 43 entries** per D-HW35-6 + D-HW36-6 verified Op G G-10.
- **Per-sub-batch breakdown** (verified Op G): PULL 4 / KNOB PULL 4 / BIN PULL 2 / RING PULL 1 / LOCK 4 / ESCUTCHEONS 3 / HINGE 8 / CASTERS 3 / CORNER+EDGE 2 / DESK+MECHANICAL 3 / UPHOLSTERY 3 / SPECIALTY 4 / MODERN SYNTHETIC 2 = 43 total.
- **Files modified: 2** (`lib/constraints/hardware.ts` 606 → 1934 lines + `lib/constraints/AUDIT_LOG.md` append).
- **engine.ts UNCHANGED** per Phase 2 / Phase 3 separation (diff = 0 lines).
- **All 21 prior canonical array lengths unchanged**: SPECIES_EVIDENCE 26 / SUBSTRATE_EVIDENCE 5 / CUT_GRAIN_EVIDENCE 35 / WOOD_DIAGNOSTIC_SIGNALS 8 / WOOD_EVIDENCE_REASONING_RULES 7 / MAKER_ENTRIES 77 / MAKER_ATTRIBUTION_REASONING_RULES 8 / MAKER_MARKS (legacy) 25 / FORMS 183 / FAMILIES 12 / SPATIAL_BEHAVIORS 76 / CONSTRUCTION_LOGIC 4 / JOINERY_CATEGORIES 15 / JOINERY_TYPES 40 / JOINERY_REASONING_RULES 5 / FASTENER_CATEGORIES 6 / FASTENER_SUBCATEGORIES 9 / FASTENER_TYPES 25 / FASTENER_REASONING_RULES 5 / HARDWARE_CATEGORIES 13 / HARDWARE_REASONING_RULES 5.
- 16 numbered audit decisions captured under D-HW36-N block-scoped prefix (D-HW36-1 through D-HW36-16 + D-HW36-FINAL).
- **Hardware library: CANONICALLY CONTENT-COMPLETE.**
- **Phase 2 Session 7 third library: CLOSED.**
- Convention precedents established this block: D-HW36-14 A-4-vs-A-6 enumeration precedence (block N-1 schema A-4 canonical enumeration takes precedence over A-6 informal preview); D-HW36-15 decade-range AG-floor interpretation discipline (conservative decade-floor selection with notes-field-marker documentation); D-HW36-16 second concrete D-FA34-11 cross-library AG floor divergence convention application; all forward-applicable to subsequent Phase 2 Session 7 libraries (upholstery covers + upholstery construction) and Phase 2 Session 9 (styleFamilies + design-aspects).
- Next sequencing per D-AP32-5: upholstery covers library (4th of 5 Phase 2 Session 7 libraries). Mike's `American_Furniture_Textile_Reference.docx` upload from Block 33 discussion available; covers half is first content surface.

---

## Block 37 — Upholstery covers library schema foundation + 10 categories + 7 reasoning rules + two-assessment-with-sub-output-surfacing convention capture (D-UC37-3) + first library-level "upholstery" assessment_layer application (D-UC37-4)
## Phase 2 Session 7 fourth library OPENS
## Session 15 / claude.ai-and-Claude-Code paired execution
## Base SHA: main 0aaa98a (Block 36 endpoint / Hardware library content-complete)

Opens Phase 2 Session 7 fourth library (upholstery covers) per D-AP32-5 + Q1=B + Q6 Sequence J four-block sequence (Block 37 covers schema + Block 38 covers content + Block 39 construction schema + Block 40 construction content closes Phase 2 Session 7). Authors new `lib/constraints/upholsteryCovers.ts` with 4 interfaces (`UpholsteryCoverCategoryEntry` + `UpholsteryCoverTypeEntry` + `UpholsteryCoverReasoningRule` + `UpholsteryCoverMakerAssociation`) + 2 library-level routing constants (`UPHOLSTERY_COVERS_ASSESSMENT_LAYER` + `UPHOLSTERY_COVERS_EVIDENCE_SUB_LAYER`) + 3 arrays (UPHOLSTERY_COVER_CATEGORIES 10 entries + UPHOLSTERY_COVER_TYPES empty scaffold + UPHOLSTERY_COVER_REASONING_RULES 7 entries).

**TWO-ASSESSMENT-WITH-SUB-OUTPUT-SURFACING CONVENTION** captured (D-UC37-3; forward-applicable extension of D-FA33-5 dual-assessment architecture). **FIRST LIBRARY-LEVEL "upholstery" ASSESSMENT_LAYER APPLICATION** established (D-UC37-4; all 10 categories uniformly routed; no per-category overrides). **SIXTH canonical-library encoding of Independent Layer Evaluation Standard** via Rule #5 cover_evidence_layer_independence (D-UC37-9). **Q5=H EXPANDED REASONING RULE SET** convention established (D-UC37-7; 7 rules per canonical-source rigor vs fixed 5-rule pattern). Two NEW canonical reasoning rule TYPES: cover_revival_warning (D-UC37-12; fifth new type) + cover_axis_sub_output_routing (D-UC37-13; sixth new type).

### D-UC37-1 (locked): Block 37 scope per Q1-Q6 lockings
Single upholsteryCovers.ts file with 4 interfaces + 2 library-level constants + 3 arrays. UPHOLSTERY_COVER_CATEGORIES 10 entries; UPHOLSTERY_COVER_TYPES empty scaffold for Block 38 (44 entries planned per D-UC37-11 Surfacing 1 resolution); UPHOLSTERY_COVER_REASONING_RULES 7 entries at 9/9. Mike-locked authorization includes 13 numbered D-UC37-N audit decisions + D-UC37-FINAL summary.

### D-UC37-2 (locked): Q1=B two-library architecture
Phase 2 Session 7 fourth + fifth libraries via two separate files: upholsteryCovers.ts (Blocks 37 + 38) + upholsteryConstruction.ts (Blocks 39 + 40). Sequence J four-block sequence closes Phase 2 Session 7. Distinct from single-library architectures (joinery / hardware / fasteners) because canonical source `American_Furniture_Textile_Reference.docx` has structural division between covers section (paragraphs 0-437) and construction section (paragraphs 438+), and Mike's appraiser-practice judgment separates covers-as-replacement-evidence from construction-as-system-foundation-evidence at the library boundary.

### D-UC37-3 (locked; NEW forward-applicable convention): TWO-ASSESSMENT-WITH-SUB-OUTPUT-SURFACING CONVENTION
Forward-applicable extension of D-FA33-5 dual-assessment architecture per Mike's appraiser-practice judgment + Q2=C + Q2-followup Option α. Convention: covers + construction libraries BOTH route to single "upholstery" assessment_layer at library level; engine surfaces upholstery system date + visible cover date as SUB-OUTPUTS within unified upholstery assessment section on report.

**Sub-layer routing mechanism**: Explicit `evidence_sub_layer` field at library level + per-category-entry:
- `upholsteryCovers.ts`: `UPHOLSTERY_COVERS_ASSESSMENT_LAYER = "upholstery"` + `UPHOLSTERY_COVERS_EVIDENCE_SUB_LAYER = "cover"`; per-category `evidence_sub_layer: "cover"` literal
- `upholsteryConstruction.ts` (Block 39 forward-applicable): `UPHOLSTERY_CONSTRUCTION_ASSESSMENT_LAYER = "upholstery"` + `UPHOLSTERY_CONSTRUCTION_EVIDENCE_SUB_LAYER = "system"`; per-category `evidence_sub_layer: "system"` literal

Engine reads both libraries; aggregates by evidence_sub_layer to produce upholstery system date + visible cover date as sub-outputs within unified upholstery assessment section.

**Distinct from three-assessment architecture** (Option D rejected by Mike at Q2): three-assessment would have three independent assessments on report (frame + covers + construction); two-assessment-with-sub-output-surfacing bundles upholstery sub-outputs into single unified upholstery assessment section per appraiser-practice convention. Upholstery campaigns and re-covering campaigns are appraiser-distinct temporal phenomena, but appraiser practice bundles them.

### D-UC37-4 (locked; NEW convention): FIRST LIBRARY-LEVEL "upholstery" ASSESSMENT_LAYER APPLICATION
upholsteryCovers.ts is the first library where `assessment_layer = "upholstery"` applies at library level (no exceptions; every cover entry is upholstery evidence). Forward-applicable: upholsteryConstruction.ts at Block 39 will follow same pattern.

**Prior libraries' upholstery routing patterns** (per-category or per-subcategory overrides):
- Fasteners (D-FA33-5): per-subcategory override (Cat 3 STAPLES subcategories 3A + 3B route to "upholstery")
- Hardware (D-HW35-7): per-category override (UPHOLSTERY HARDWARE category routes to "upholstery"; per-category-vs-per-subcategory mechanism per D-HW35-14)

**Block 37 establishes library-level "upholstery" assessment** as the canonical-source-defined-upholstery-axis-evidence pattern (when canonical source IS uniformly upholstery evidence, library-level routing applies; no per-category overrides needed).

### D-UC37-5 (locked): Q3=E sparse style_associations population per canonical-source rigor
Block 38 scope decision: ~18% of cover types populate `style_associations` per A-5 style density check + canonical-source rigor. Hardware precedent at 14/43 (~33%); covers expected sparser (~8-11 of 44 types). Style-rich types: damask + brocade + jacquard + tapestry + needlework + velvet + mohair velvet + toile + bamboo wicker. Style-silent types: cotton + linen + wool broadcloth + canvas + webbing + burlap + muslin/cambric + cane + rush + splint + modern synthetics.

### D-UC37-6 (locked): Q4=F SCHEMA-PRESENT-CONTENT-DEFERRED for maker_associations per D-HW35-6
`UpholsteryCoverMakerAssociation` interface defined in upholsteryCovers.ts (library-local; NOT promoted to entryShape.ts per schema-occurrence rule). Block 38 leaves `maker_associations: []` empty arrays for ALL 44 cover type entries. Textile canonical source has ZERO textile-manufacturer documentation; validation-phase one-offs + post-launch authoring path stands.

**Convention application**: Second application of D-HW35-6 SCHEMA-PRESENT-CONTENT-DEFERRED discipline (first application was hardware library Block 36 D-HW36-6). Establishes the convention as forward-applicable across multiple libraries when canonical source surfaces partial-coverage content.

### D-UC37-7 (locked; NEW forward-applicable convention): Q5=H EXPANDED REASONING RULE SET
Canonical-source rigor determines reasoning-rule count per library, NOT fixed 5-rule pattern. Block 37 ships 7 reasoning rules per `American_Furniture_Textile_Reference.docx` Period Pattern and Wear Cues canonical-source rigor + Quick Identification Hierarchy + Operational Rule passages + D-UC37-3 sub-output-routing operationalization needs.

**Convention precedent**: prior 5-rule pattern across wood / maker / joinery / fastener / hardware libraries was canonical-source-actual coincidence (each prior canonical source surfaced 5 distinct rule-warranting sections), NOT architectural mandate. Forward-applicable: future libraries (upholsteryConstruction.ts at Block 39 + Phase 2 Session 9 styleFamilies + design-aspects) may ship 4 / 5 / 6 / 7 / 8+ rules per canonical-source rigor.

### D-UC37-8 (locked): Cross-library overlap detection + FK field design
Substantial cross-library overlap surface per A-6 + Op A canonical extraction. 5 FK fields on `UpholsteryCoverTypeEntry`:

| FK field | Cross-library target | Block 38 application scope |
|---|---|---|
| `related_cover_types?` | intra-library | chintz ↔ toile printed-cotton family; jacquard ↔ damask figured-weave family |
| `related_construction_types?` | upholsteryConstruction.ts (Block 39-40 forward-reference) | Category 7 Canvas/Webbing/Burlap/Muslin (4 cross-references; resolves at Block 40) |
| `related_hardware_types?` | hardware.ts UPHOLSTERY HARDWARE category | decorative trim references → hardware_type_upholstery_tacks + hardware_type_decorative_nailhead_trim |
| `related_fastener_types?` | fasteners.ts Cat 3 STAPLES | attachment evidence → fastener_subcategory_upholstery_tacks + fastener_type_upholstery_staple |
| `related_form_types?` | forms.ts | upholstered-form appropriateness; sparse population per canonical-source warrant |

Per per-canonical-source-fidelity convention (D-FA34-11 + D-HW36-16): covers entries that share physical names with construction entries (Canvas / Webbing / Burlap / Muslin) are canonically distinct evidence-axis interpretations (cover-axis = visible textile surface; construction-axis = foundation/hidden support); cross-library FK preserves the relationship without canonical duplication.

### D-UC37-9 (locked): SIXTH canonical-library encoding of Independent Layer Evaluation Standard
Via Rule #5 `cover_evidence_layer_independence` (cross_layer_scope: true). After wood rule #7 + maker rule #1 + joinery rule #5 + fastener rule #5 + hardware rule #5. Cross-library convention reinforced: each evidence-library reasoning-rule set includes one layer-independence canonical artifact per ILE precedent.

**Operational note**: Block 37 ILE rule operates within D-UC37-3 two-assessment-with-sub-output-surfacing convention — cover-axis evidence layer outputs are independent inputs to the unified upholstery assessment section's cover sub-output (alongside construction-axis evidence inputs to system sub-output at Block 40).

### D-UC37-10 (locked): Authority calibration distribution per D-AR29-11 + A-8
**UPHOLSTERY_COVER_CATEGORIES distribution (verified Op G G-12)**: `positive_authority {7: 6, 8: 4}`; `hard_negative_authority {7: 6, 8: 4}`.

**4 categories at 8/8 (era-anchor + AG-anchor + canonical-rigor categories)**:
- `upholstery_cover_category_patterned_and_figured_upholstery_fabrics` (Jacquard 1800s+ industrial anchor + Turkey Work tight era anchor + style-rich)
- `upholstery_cover_category_pile_fabrics` (Velvet/Plush/Mohair/Velour era-tight canonical anchors)
- `upholstery_cover_category_leather_and_skin_upholstery` (Vinyl 1930s+ AG anchor + rich natural-leather diagnostics)
- `upholstery_cover_category_modern_synthetic_and_blended_upholstery_fabrics` (densest AG distribution: 6 of 6 types are Block 38 AG candidates)

**6 categories at 7/7 (medium-strong canonical-source rationale)**: Plain Woven + Haircloth/Animal-Hair + Printed + Canvas/Webbing/Support + Cane/Rush/Splint/Woven Seat + Wicker/Rattan/Reed/Willow.

**UPHOLSTERY_COVER_REASONING_RULES**: all 7 at 9/9 per meta-rule supremacy precedent (D-WE26-8 / D-MM27-5).

### D-UC37-11 (locked): Surfacing 1 resolution — 44 types Block 38 scope per strict canonical fidelity
Wicker category type count: 44 actual vs plan preview 45. "Wicker, General Category" intro paragraph (298-306) absorbed into UPHOLSTERY_COVER_CATEGORIES `hardware_category_wicker_rattan_reed_willow_and_basketry_furniture_materials` entry's `category_description` + `unique_category_traits` + `core_identifying_elements` fields per A-4-canonical-enumeration-supersedes-A-6-informal-preview discipline per D-HW36-14. Block 38 authors 6 wicker types (Rattan + Reed + Willow + Paper Fiber Wicker + Bamboo + Synthetic Resin Wicker), NOT 7. **Total Block 38 scope: 44 types**.

### D-UC37-12 (locked; NEW reasoning-rule TYPE): cover_revival_warning
Block 37 Rule #6 `cover_revival_warning` is the **fifth NEW evidence-library reasoning-rule TYPE** authored across Phase 2 Session 7 libraries (after `restoration_false_signals` Block 30 joinery Rule #3 + `replacement_fastener_risk` Block 33 fastener Rule #2 + `restoration_contamination` Block 33 fastener Rule #4 + `reproduction_hardware_warning` Block 35 hardware Rule #4). Captures canonical-source revival-wave warnings throughout covers section (Colonial Revival 1880-1940 / Victorian Revival / Rococo Revival / Renaissance Revival / Gothic Revival / Jacobean Revival / Hollywood Regency) + Operational Rule canonical anchor ("A Colonial Revival chair with rush does not become 18th century").

**Cover-axis-specific revival warning** required because cover-revival reproductions are canonically DESIGNED to mimic earlier-era covers (unlike replacement fasteners which are typically modernity-marked).

### D-UC37-13 (locked; NEW reasoning-rule TYPE): cover_axis_sub_output_routing
Block 37 Rule #7 `cover_axis_sub_output_routing` is the **sixth NEW evidence-library reasoning-rule TYPE** (after the five preceding types). Engine-layer routing rule operationalizing D-UC37-3 two-assessment-with-sub-output-surfacing convention at reasoning-rule level. Pairs with future upholsteryConstruction.ts Rule #N `construction_axis_sub_output_routing` at Block 39.

Per D-MM27-9 Phase 2 / Phase 3 separation: rule is encoded as canonical content here; engine.ts implementation of sub-output aggregation deferred to Phase 3 engine implementation.

### D-UC37-FINAL (post-authoring summary)
Block 37 ship: upholstery covers library schema foundation + 10 UPHOLSTERY_COVER_CATEGORIES + empty UPHOLSTERY_COVER_TYPES scaffold (Block 38 populates 44 types) + 7 UPHOLSTERY_COVER_REASONING_RULES + 2 library-level routing constants + UpholsteryCoverMakerAssociation library-local interface.
- **NEW arrays**: `UPHOLSTERY_COVER_CATEGORIES` (10) + `UPHOLSTERY_COVER_TYPES` (0) + `UPHOLSTERY_COVER_REASONING_RULES` (7). Total 17 new canonical entries this block.
- **NEW library-level routing constants**: `UPHOLSTERY_COVERS_ASSESSMENT_LAYER = "upholstery"` + `UPHOLSTERY_COVERS_EVIDENCE_SUB_LAYER = "cover"` per D-UC37-3 sub-output-routing mechanism.
- **UPHOLSTERY_COVER_CATEGORIES authority distribution**: `positive_authority {7: 6, 8: 4}`; `hard_negative_authority {7: 6, 8: 4}` per D-UC37-10.
- **UPHOLSTERY_COVER_CATEGORIES assessment_layer + evidence_sub_layer distribution**: 10 categories all `assessment_layer: "upholstery"` + 10 categories all `evidence_sub_layer: "cover"` per D-UC37-3 + D-UC37-4 library-level uniform routing.
- **UPHOLSTERY_COVER_REASONING_RULES**: all 7 at 9/9 with migration_status "complete" + migration_target "engine_reasoning"; cross_layer_scope: true on Rule #1 (covers_alone_never_dates_furniture) + Rule #5 (cover_evidence_layer_independence) per D-UC37-7 + D-UC37-9.
- **Two-assessment-with-sub-output-surfacing convention**: CAPTURED (D-UC37-3; forward-applicable; D-FA33-5 extension).
- **First library-level "upholstery" assessment_layer application**: ESTABLISHED (D-UC37-4; forward-applicable to upholsteryConstruction.ts at Block 39).
- **SIXTH canonical-library encoding of Independent Layer Evaluation Standard**: CONFIRMED (D-UC37-9; via Rule #5).
- **Q5=H expanded reasoning rule set convention**: ESTABLISHED (D-UC37-7; canonical-source rigor over fixed 5-rule pattern; forward-applicable).
- **Two NEW canonical reasoning rule TYPES**: cover_revival_warning (D-UC37-12; fifth new type) + cover_axis_sub_output_routing (D-UC37-13; sixth new type).
- Files modified: **2** (`lib/constraints/upholsteryCovers.ts` NEW; `lib/constraints/AUDIT_LOG.md` append).
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation.
- **All 22 prior canonical array lengths unchanged**: SPECIES_EVIDENCE 26 / SUBSTRATE_EVIDENCE 5 / CUT_GRAIN_EVIDENCE 35 / WOOD_DIAGNOSTIC_SIGNALS 8 / WOOD_EVIDENCE_REASONING_RULES 7 / MAKER_ENTRIES 77 / MAKER_ATTRIBUTION_REASONING_RULES 8 / MAKER_MARKS (legacy) 25 / FORMS 183 / FAMILIES 12 / SPATIAL_BEHAVIORS 76 / CONSTRUCTION_LOGIC 4 / JOINERY_CATEGORIES 15 / JOINERY_TYPES 40 / JOINERY_REASONING_RULES 5 / FASTENER_CATEGORIES 6 / FASTENER_SUBCATEGORIES 9 / FASTENER_TYPES 25 / FASTENER_REASONING_RULES 5 / HARDWARE_CATEGORIES 13 / HARDWARE_TYPES 43 / HARDWARE_REASONING_RULES 5.
- 13 numbered audit decisions captured under D-UC37-N block-scoped prefix (D-UC37-1 through D-UC37-13 + D-UC37-FINAL).
- **Phase 2 Session 7 fourth library schema foundation: OPENED.**
- **Block 38 queued: 44 UPHOLSTERY_COVER_TYPES content authoring** from American_Furniture_Textile_Reference.docx covers section. Block 38 authoring will apply: per-type `replacement_likelihood` per D-AP32-3 (covers as HIGH replacement class per Mike framing); 10 AG entries on industrial-introduction-boundary types per Op A-9 (Vinyl 1930+, Rayon 1900+, Nylon 1940+, Polyester 1950+, Acrylic 1950+, Olefin 1960+, Microfiber 1980+, Synthetic Resin Wicker 1980+, Paper Fiber Rush 1880+, Paper Fiber Wicker 1880+) with 9 of 10 applying D-HW36-15 decade-range AG-floor interpretation discipline; style_associations sparse (~18% est per A-5); maker_associations: [] empty arrays per D-UC37-6 SCHEMA-PRESENT-CONTENT-DEFERRED; cross-library FK populations per D-UC37-8 (related_construction + related_hardware + related_fastener + related_form fields).
- Convention precedents established this block: D-UC37-3 two-assessment-with-sub-output-surfacing convention (NEW); D-UC37-4 first library-level "upholstery" assessment_layer application (NEW); D-UC37-7 Q5=H expanded reasoning rule set convention (NEW: canonical-source rigor over fixed 5-rule pattern); D-UC37-12 cover_revival_warning (NEW reasoning-rule TYPE); D-UC37-13 cover_axis_sub_output_routing (NEW reasoning-rule TYPE); D-UC37-11 second application of A-4-canonical-enumeration-supersedes-A-6-informal-preview discipline (D-HW36-14 reuse); D-UC37-6 second application of SCHEMA-PRESENT-CONTENT-DEFERRED discipline (D-HW35-6 reuse). All forward-applicable to subsequent Phase 2 Session 7 fifth library (upholstery construction Blocks 39-40) + Phase 2 Session 9 (styleFamilies + design-aspects).
- Next sequencing per D-AP32-5 + Q6 Sequence J: Block 38 covers content authoring (44 types); then Block 39 upholstery construction schema + Block 40 construction content closes Phase 2 Session 7.

---

## Block 38 — UPHOLSTERY_COVER_TYPES Content Authoring (44 entries across 10 sub-batches); Upholstery covers library content-complete; Phase 2 Session 7 fourth library CLOSES
## Session 15 / claude.ai-and-Claude-Code paired execution
## Base SHA: main b3081f8 (Block 37 endpoint / Upholstery covers library schema foundation opening)

Closes Phase 2 Session 7 fourth library (upholstery covers) per D-AP32-5 + Q6 Sequence J. Populates UPHOLSTERY_COVER_TYPES (empty scaffold per Block 37 D-UC37-1) with 44 UpholsteryCoverTypeEntry entries from `American_Furniture_Textile_Reference.docx` covers section per D-UC37-11 strict canonical fidelity. Schema foundation (Block 37) + 10 categories (Block 37) + 7 reasoning rules (Block 37) + 44 types (Block 38) = upholstery covers library canonically content-complete.

10 internal authoring sub-batches per Q1 Option A — one per UPHOLSTERY_COVER_CATEGORIES entry. Per Q2 Option D + D-HW36-15 decade-range AG-floor interpretation discipline: 10 AGs authored on industrial-introduction-boundary cover types; ALL 10 apply D-HW36-15 (Surfacing 4 resolution). Per Q3 Option F: 4 cross-library FK forward-references to upholsteryConstruction.ts (Block 40 resolution) on Cat 7 Canvas/Webbing/Burlap/Muslin entries; NO per-type related_hardware_types or related_fastener_types populations (Rule #4 attachment_and_backing_evidence_framework handles cross-library reasoning at engine layer per per-canonical-source-fidelity convention).

### D-UC38-1 (locked): Block 38 scope per Q1-Q5 lockings
Single combined ship with 10 internal sub-batches. 44 UPHOLSTERY_COVER_TYPES entries authored per D-UC37-11 strict canonical fidelity. Per-sub-batch tsc check + intermediate length report. Upholstery covers library content-complete on Block 38 ship.

### D-UC38-2 (locked): period_associations granularity per Q5 Option J + Block 31 D-JN31-2 precedent
Multi-entry where seed provides explicit era phases per A-5 canonical-source verification; single-entry otherwise. **11 multi-period entries** (verified Op G G-14): damask, brocade, tapestry, turkey_work, needlework, velvet, plush, mohair_velvet, chintz, toile, bamboo. **33 single-period entries** capturing single broad-range or one-era-emphasis canonical phrasing.

date_range_summary carries seed Broad date range prose verbatim regardless of period_associations array length.

### D-UC38-3 (locked): replacement_likelihood per-type defensible-defaults per Q4 Option I
**Distribution (verified Op G G-16): {low: 5, medium: 10, high: 29}**.
- **LOW (5)**: turkey_work (canonical "Original turkey work on American furniture is rare" override), rattan, reed, willow, bamboo (Wicker structural)
- **MEDIUM (10)**: haircloth_horsehair, camel_goat_hair_blends, full_grain_top_grain_leather, embossed_tooled_gilt_leather, stretched_canvas, upholstery_webbing, burlap_hessian, muslin_cambric_dust_cover, paper_fiber_wicker (repair-prone), synthetic_resin_wicker (modern repair)
- **HIGH (29)**: all remaining 29 cover types (decorative + visible-cover-prone types + cane/rush seat surfaces + all 6 modern synthetics)

Notes-field override marker per D-FA34-3 + D-HW36-3 precedent applied on turkey_work LOW override.

### D-UC38-4 (locked): AG entries on 10 cover types per Q2 Option D hard-boundary discipline + Surfacing 4
**All 10 AGs apply D-HW36-15 decade-range AG-floor interpretation discipline** (Surfacing 4 resolution; correction from plan Q2 "9 of 10" — strict reading: vinyl's "1930s" is also decade-range; all 10 carry notes-field markers per D-FA34-3 + decade-range marker per D-HW36-15):

| Type | AG floor | Seed verbatim phrasing |
|---|---|---|
| `vinyl_naugahyde_faux_leather` | **1930** | "1930s to present" |
| `paper_fiber_rush` | **1880** | "Late 1800s to present" |
| `paper_fiber_wicker` | **1880** | "Late 1800s to mid-1900s strongest" |
| `synthetic_resin_wicker` | **1980** | "Late 20th century to present" |
| `rayon` | **1900** | "Early 1900s to present" |
| `nylon` | **1940** | "1940s to present" |
| `polyester` | **1950** | "1950s to present" |
| `acrylic` | **1950** | "1950s to present" |
| `olefin_polypropylene` | **1960** | "1960s to present" |
| `microfiber_microsuede` | **1980** | "1980s to present" |

AG prose cross-references Rule #2 replacement_likelihood_cover_specific + Rule #6 cover_revival_warning canonical-source anchors.

### D-UC38-5 (locked): style_associations population per Q3 + Surfacing 1
**14 entries populated** (verified Op G G-9; strict canonical fidelity per Surfacing 1):

**9 style-rich types** (3+ canonical style waves per canonical-source rigor): damask, brocade, velvet, mohair_velvet, jacquard, tapestry, toile, embossed_tooled_gilt_leather, bamboo.

**5 style-medium-with-explicit-style-waves**: plush, needlework, chintz, full_grain_top_grain_leather, rayon.

**Excluded per strict canonical fidelity** (temporal-only context, no explicit canonical style wave): nylon, polyester, acrylic, olefin_polypropylene, microfiber_microsuede, synthetic_resin_wicker, vinyl_naugahyde_faux_leather.

Style wave references encoded include: Empire, Rococo Revival, Renaissance Revival, Victorian, Eastlake, Art Deco, Hollywood Regency, Mission, Arts and Crafts, Colonial Revival, Victorian Revival, Gothic Revival, Jacobean Revival, Medieval Revival, Cottage, French Provincial Revival, Spanish Colonial, California Mission, Aesthetic Movement, Victorian Exotic, Mid-Century Tropical/Tiki, Contemporary.

### D-UC38-6 (locked): maker_associations: [] uniform across ALL 44 entries per D-UC37-6 + D-HW35-6
SCHEMA-PRESENT-CONTENT-DEFERRED discipline (verified Op G G-10 — zero non-empty maker_associations). Per-entry notes field documents deferred-content marker per defensible-defaults discipline. Textile canonical source has ZERO textile-manufacturer documentation; validation-phase one-offs + post-launch authoring path stands.

### D-UC38-7 (locked): Cross-library FK populations per Q3 Option F + D-UC37-8
**4 related_construction_types forward-references** on Cat 7 entries (verified Op G G-11):
- `stretched_canvas` → `construction_layering_canvas_foundation`
- `upholstery_webbing` → `construction_webbing_systems`
- `burlap_hessian` → `construction_layering_burlap`
- `muslin_cambric_dust_cover` → `construction_layering_muslin_cambric_dust_cover`

Forward-reference notes-field marker per defensible-defaults discipline; specific target ids will resolve at Block 40 canonical id alignment.

**NO per-type related_hardware_types or related_fastener_types populations** per Q3 Option F + per-canonical-source-fidelity convention. Rule #4 attachment_and_backing_evidence_framework handles covers ↔ hardware/fasteners cross-library reasoning at engine layer.

**NO per-type related_form_types populations** — canonical source silent on forms cross-references (verified Op A).

### D-UC38-8 (locked): related_cover_types intra-library populations per canonical-source warrant
**21 entries populated with 36 total intra-library FK references** (verified Op G G-12; exceeded plan A-9 estimate of 10-15). Family clusters:
- **Figured-weave family** (damask ↔ jacquard ↔ brocade): 3 entries × bidirectional refs
- **Pile family** (velvet ↔ plush ↔ mohair_velvet ↔ velour): 4 entries × clustered refs
- **Printed-cotton family** (chintz ↔ toile): 2 entries
- **Hand-vs-pressed cane family** (hand_cane ↔ pressed_cane): 2 entries
- **Rush-family material substitution** (natural_rush ↔ paper_fiber_rush): 2 entries
- **Wicker-family material substitution** (rattan ↔ reed ↔ willow ↔ paper_fiber_wicker ↔ synthetic_resin_wicker): 5 entries × material-substitution refs
- **Leather family** (full_grain ↔ embossed ↔ vinyl_naugahyde): 3 entries

### D-UC38-9 (locked): regional_persistence_notes populated on 5 entries per Surfacing 3 strict canonical fidelity
**5 entries populated** (verified Op G G-13; per Surfacing 3 + D-HW36-9 strict canonical fidelity discipline):
- `cotton` — "Strong in Southern, rural, and later mass-market American furniture"
- `natural_rush` — "Strong in rural New England, Pennsylvania, Appalachian, Midwestern, and Shaker-related furniture traditions"
- `splint_seat` — "Strong in rural, Appalachian, New England, Shaker, and Midwestern vernacular furniture"
- `shaker_tape` — "Strongly associated with Shaker furniture and Shaker-style reproductions"
- `rawhide_leather_lacing` — "Southwest, Spanish Colonial, California Mission, ranch and lodge furniture"

**Linen excluded** per Surfacing 3 strict canonical fidelity (era-bounded "early colonial/rural domestic" context vs persistence-bounded explicit-persistence-language pattern; per Block 36 D-HW36-9 precedent narrowing to explicit-persistence-language entries).

### D-UC38-10 (locked): Authority calibration distribution per D-AR29-11 + A-7 + Surfacing 2
**Final distribution (verified Op G G-15): `positive_authority {7: 28, 8: 16}`; `hard_negative_authority {7: 28, 8: 16}`**.

**16 entries at 8/8** (10 AG-anchor + 6 era-anchor types per Surfacing 2):
- 10 AG-anchor types: vinyl_naugahyde, paper_fiber_rush, paper_fiber_wicker, synthetic_resin_wicker, rayon, nylon, polyester, acrylic, olefin_polypropylene, microfiber_microsuede
- 6 era-anchor types: damask, brocade, jacquard, turkey_work, velvet, mohair_velvet

**28 entries at 7/7** (medium-strong canonical-source rationale): all other 28 cover types.

**Mid-authoring correction**: embossed_tooled_gilt_leather initially authored at 8/8 (style-rich classification); corrected to 7/7 per A-7 plan-locked list (style-rich does not by itself confer 8/8 — requires AG-anchor or industrial-introduction era-anchor classification). Notes field documents the correction.

### D-UC38-11 (locked): common_observed_locations field populated per D-FA33-6 identification-helper convention
All 44 entries carry `common_observed_locations: PhysicalLocation[]` populated from canonical-source observed-locations context per D-FA33-6 (location HELPS identification but NOT routing). Distribution skews to `upholstery_seat` + `upholstery_back` + `upholstery_arm` (decorative covers); `upholstery_support_layer` + `upholstery_attachment_point` (Cat 7 support textiles); `upholstery_dust_cover` (muslin/cambric); `frame_rail` + `frame_stile` + `case_carcass` (wicker structural materials).

### D-UC38-12 (locked): Block 37 reasoning rule forward-references RESOLVED
Block 37 reasoning rules with `applies_to_entry_types: ["upholstery_cover_type"]` category-string FK now have 44 type entries to reference:
- Rule #1 (covers_alone_never_dates_furniture; cross_layer_scope: true): applies to all 44 cover types
- Rule #2 (replacement_likelihood_cover_specific): applies to all 44 cover types per-type replacement_likelihood field
- Rule #3 (pattern_color_wear_dating_framework): applies to all 44 cover types
- Rule #4 (attachment_and_backing_evidence_framework): applies to all 44 cover types; engine-layer cross-references hardware + fasteners libraries
- Rule #5 (cover_evidence_layer_independence; cross_layer_scope: true): applies to all 44 cover types
- Rule #6 (cover_revival_warning): applies to revival-prone types — damask, brocade, jacquard, tapestry, velvet, plush, chintz, toile, needlework, full_grain_leather, embossed_leather, vinyl_naugahyde, paper_fiber_rush, paper_fiber_wicker, synthetic_resin_wicker, modern synthetics
- Rule #7 (cover_axis_sub_output_routing): applies to all 44 cover types via UPHOLSTERY_COVERS_ASSESSMENT_LAYER + UPHOLSTERY_COVERS_EVIDENCE_SUB_LAYER library-level routing

### D-UC38-13 (locked): Upholstery covers library content-complete on Block 38 ship
Schema foundation (Block 37) + 10 categories (Block 37) + 7 reasoning rules (Block 37) + 44 types (Block 38) = upholstery covers library canonically content-complete. Phase 2 Session 7 fourth library CLOSED.

### D-UC38-14 (locked; NEW convention): related_cover_types intra-library FK density exceeded plan estimate
Op A-9 estimated 10-15 intra-library related_cover_types FK entries; Op G G-12 verified **21 entries populated with 36 total refs**. Family clusters (figured-weave + pile + printed-cotton + cane + rush + wicker + leather) generated denser intra-library cross-reference networks than initial estimate per per-canonical-source rigor.

**Forward-applicable convention**: intra-library related_*_types FK density is canonical-source-driven; plan estimates for intra-library FK count are looser than plan estimates for cross-library FK count (which are bounded by per-canonical-source warrant). Block N-1 schema-foundation block A-9 FK estimates may exceed actual at Block N content-authoring when canonical material-substitution + material-family clusters surface dense cross-references.

### D-UC38-FINAL (post-authoring summary)
Block 38 ship: 44 UPHOLSTERY_COVER_TYPES entries authored across 10 internal sub-batches; upholstery covers library canonically content-complete; Phase 2 Session 7 fourth library CLOSED.

- **UPHOLSTERY_COVER_TYPES.length: 0 → 44** (verified Op G G-2).
- **Authority distribution**: positive_authority {7: 28, 8: 16}; hard_negative_authority {7: 28, 8: 16} per D-UC38-10.
- **replacement_likelihood distribution**: low 5, medium 10, high 29 per D-UC38-3.
- **AG count: 10** (all D-HW36-15 decade-range AG-floor interpretation per Surfacing 4) per D-UC38-4.
- **Cross-library FK count: 4 refs on 4 entries** (cover ↔ construction forward-references) per D-UC38-7.
- **Intra-library related_cover_types FK count: 36 refs on 21 entries** per D-UC38-8 + D-UC38-14.
- **regional_persistence_notes populated count: 5** per D-UC38-9 + Surfacing 3.
- **style_associations populated count: 14** per D-UC38-5 + Surfacing 1 (9 style-rich + 5 style-medium-with-explicit-style-waves).
- **period_associations multi-period count: 11** per D-UC38-2.
- **maker_associations: [] on ALL 44 entries** per D-UC37-6 + D-UC38-6 verified Op G G-10.
- **Per-sub-batch breakdown** (verified Op G): PLAIN WOVEN 3 / PATTERNED/FIGURED 6 / PILE 4 / HAIRCLOTH 2 / PRINTED 3 / LEATHER 3 / CANVAS/WEBBING 4 / CANE/RUSH/SPLINT 7 / WICKER 6 / MODERN SYNTHETIC 6 = 44 total.
- Files modified: **2** (`lib/constraints/upholsteryCovers.ts` 653 → 2119 lines + `lib/constraints/AUDIT_LOG.md` append).
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation (diff = 0 lines).
- **All 22 prior canonical array lengths unchanged**: SPECIES_EVIDENCE 26 / SUBSTRATE_EVIDENCE 5 / CUT_GRAIN_EVIDENCE 35 / WOOD_DIAGNOSTIC_SIGNALS 8 / WOOD_EVIDENCE_REASONING_RULES 7 / MAKER_ENTRIES 77 / MAKER_ATTRIBUTION_REASONING_RULES 8 / MAKER_MARKS (legacy) 25 / FORMS 183 / FAMILIES 12 / SPATIAL_BEHAVIORS 76 / CONSTRUCTION_LOGIC 4 / JOINERY_CATEGORIES 15 / JOINERY_TYPES 40 / JOINERY_REASONING_RULES 5 / FASTENER_CATEGORIES 6 / FASTENER_SUBCATEGORIES 9 / FASTENER_TYPES 25 / FASTENER_REASONING_RULES 5 / HARDWARE_CATEGORIES 13 / HARDWARE_TYPES 43 / HARDWARE_REASONING_RULES 5 / UPHOLSTERY_COVER_CATEGORIES 10 / UPHOLSTERY_COVER_REASONING_RULES 7 (24 unchanged + UPHOLSTERY_COVER_TYPES 0 → 44).
- 14 numbered audit decisions captured under D-UC38-N block-scoped prefix (D-UC38-1 through D-UC38-14 + D-UC38-FINAL).
- **Upholstery covers library: CANONICALLY CONTENT-COMPLETE.**
- **Phase 2 Session 7 fourth library: CLOSED.**
- Convention precedents established this block: D-UC38-14 intra-library FK density canonical-source-driven (NEW convention; forward-applicable to Block 40 + Phase 2 Session 9 libraries); D-UC38-9 second application of D-HW36-9 strict-canonical-fidelity regional_persistence_notes discipline; D-UC38-2 second application of D-HW36-2 multi-period granularity; D-UC38-4 third application of D-HW36-15 decade-range AG-floor interpretation discipline (ALL 10 AGs apply this block — densest application yet); D-UC38-7 cross-library forward-reference FK pattern (NEW: cross-library FK to upholsteryConstruction.ts before construction library exists, resolves at Block 40); D-UC38-3 sixth application of D-AP32-3 replacement-likelihood discipline with notes-field override marker per D-FA34-3. All forward-applicable to subsequent Phase 2 Session 7 fifth library (upholstery construction Blocks 39-40) and Phase 2 Session 9 (styleFamilies + design-aspects).
- Next sequencing per D-AP32-5 + Q6 Sequence J: Block 39 upholstery construction library schema foundation; then Block 40 construction content closes Phase 2 Session 7. Mike's `American_Furniture_Textile_Reference.docx` covers section is canonically exhausted by this block; construction section (paragraphs 438+) is content surface for Blocks 39-40.

---

## Block 39 — Upholstery Construction Library Schema Foundation + 9 Categories + 7 Reasoning Rules + Second Application of Two-Assessment-With-Sub-Output-Surfacing Convention (evidence_sub_layer = "system")
## Phase 2 Session 7 fifth library opens; closes at Block 40
## Session 16 / claude.ai-and-Claude-Code paired execution
## Base SHA: main 3024235 (Block 38 endpoint / Upholstery covers library content-complete)

Opens Phase 2 Session 7 fifth and FINAL library (upholstery construction) per D-AP32-5 + Q5=J Sequence J two-block split (Block 39 schema foundation + Block 40 ~31 construction types content closes Phase 2 Session 7). Authors new `lib/constraints/upholsteryConstruction.ts` with 4 interfaces (`UpholsteryConstructionCategoryEntry` + `UpholsteryConstructionTypeEntry` + `UpholsteryConstructionReasoningRule` + `UpholsteryConstructionMakerAssociation`) + 2 library-level routing constants (`UPHOLSTERY_CONSTRUCTION_ASSESSMENT_LAYER` + `UPHOLSTERY_CONSTRUCTION_EVIDENCE_SUB_LAYER`) + 3 arrays (UPHOLSTERY_CONSTRUCTION_CATEGORIES 9 entries + UPHOLSTERY_CONSTRUCTION_TYPES empty scaffold + UPHOLSTERY_CONSTRUCTION_REASONING_RULES 7 entries).

**SECOND CONCRETE APPLICATION of D-UC37-3 two-assessment-with-sub-output-surfacing convention** (D-UCN39-3; evidence_sub_layer = "system"). **SECOND library-level "upholstery" assessment_layer application** (D-UCN39-4). **SEVENTH canonical-library encoding of Independent Layer Evaluation Standard** via Rule #5 construction_evidence_layer_independence (D-UCN39-9) — completes ILE encoding across all 7 Phase 2 evidence libraries. **SECOND application of D-UC37-7 expanded reasoning rule set convention** (D-UCN39-5). NEW canonical reasoning-rule TYPE: reupholstery_campaign_warning (D-UCN39-12; seventh new TYPE). NEW convention: appraiser-honest-discipline-supersedes-FK-completion (D-UCN39-13).

### D-UCN39-1 (locked): Block 39 scope per Q1-Q5 lockings
Single upholsteryConstruction.ts file with 4 interfaces + 2 library-level constants + 3 arrays. UPHOLSTERY_CONSTRUCTION_CATEGORIES 9 type-bearing entries; UPHOLSTERY_CONSTRUCTION_TYPES empty scaffold for Block 40 (~31 entries planned per Surfacing 3); UPHOLSTERY_CONSTRUCTION_REASONING_RULES 7 entries at 9/9. Mike-locked authorization includes 13 numbered D-UCN39-N audit decisions + D-UCN39-FINAL summary.

### D-UCN39-2 (locked): Library architecture per Q5=J two-block split
Phase 2 Session 7 fifth library via two-block sequence: upholsteryConstruction.ts schema (Block 39) + ~31 construction types content (Block 40). Block 40 closes Phase 2 Session 7 entirely. Parallels joinery (Blocks 30-31) + fasteners (Blocks 33-34) + hardware (Blocks 35-36) + upholstery covers (Blocks 37-38) two-block precedents.

### D-UCN39-3 (locked): SECOND CONCRETE APPLICATION of D-UC37-3 two-assessment-with-sub-output-surfacing convention
Construction library declares `UPHOLSTERY_CONSTRUCTION_ASSESSMENT_LAYER = "upholstery"` + `UPHOLSTERY_CONSTRUCTION_EVIDENCE_SUB_LAYER = "system"` at library level (parallels upholstery covers library `UPHOLSTERY_COVERS_ASSESSMENT_LAYER = "upholstery"` + `UPHOLSTERY_COVERS_EVIDENCE_SUB_LAYER = "cover"` at Block 37 D-UC37-3). All 9 categories carry `assessment_layer: "upholstery"` + `evidence_sub_layer: "system"` literals.

Engine reads both libraries' constants; aggregates by evidence_sub_layer to produce **upholstery system date** sub-output (construction-axis) + **visible cover date** sub-output (covers-axis), both surfacing within the unified upholstery assessment section on report. D-UC37-3 convention is now applied across both upholstery sub-layers — Block 37 established it (cover sub-layer); Block 39 completes it (system sub-layer).

### D-UCN39-4 (locked): SECOND library-level "upholstery" assessment_layer application
Construction library is the SECOND library where `assessment_layer = "upholstery"` applies at library level with no exceptions (after upholstery covers library at Block 37 D-UC37-4). All 9 categories uniformly routed; no per-category overrides. Prior non-covers/construction libraries used per-subcategory override (fasteners D-FA33-5) or per-category override (hardware D-HW35-7).

### D-UCN39-5 (locked): SECOND application of D-UC37-7 expanded reasoning rule set convention
7 reasoning rules per canonical-source rigor (parallels upholstery covers library 7-rule count). **Surfacing 2 resolution**: the 5 canonical Diagnostic Cross-Checks "If You Find X" patterns (horsehair / foam / coil springs / serpentine springs / down or feather; paragraphs 710-744) CONSOLIDATE into Rule #3 `layer_consistency_check` — they are operational sub-content of the layer-consistency principle, not 5 independent rules ("If you find foam, look next for..." is operationally a layer-consistency check). Plan Q2=D expected 7-9 rules; canonical-source rigor resolves to 7. Alternative (5 Cross-Checks as separate rules → 11-12 total) rejected as over-fragmentation per D-UC37-7 canonical-source-rigor convention.

### D-UCN39-6 (locked): maker_associations SCHEMA-PRESENT-CONTENT-DEFERRED per D-HW35-6
`UpholsteryConstructionMakerAssociation` interface defined in upholsteryConstruction.ts (library-local; NOT promoted to entryShape.ts; schema-occurrence rule doesn't fire). Block 40 leaves `maker_associations: []` empty arrays for ALL ~31 construction type entries. Construction canonical source has ZERO upholstery-shop or spring/foam-manufacturer documentation. Third application of D-HW35-6 SCHEMA-PRESENT-CONTENT-DEFERRED discipline (after hardware Block 36 D-HW36-6 + upholstery covers Block 38 D-UC38-6).

### D-UCN39-7 (locked): Single-directional cross-library FK convention per Q3=F + D-FA33-8
`UpholsteryConstructionTypeEntry` schema has NO `related_cover_types` field. Construction → covers reverse-references are NOT carried; the cross-library covers↔construction relationship is preserved exclusively via the covers library's forward-references (Block 38 D-UC38-7 `related_construction_types` field on `UpholsteryCoverTypeEntry`). Single-directional cross-library FK convention per D-FA33-8 established precedent. Verified Op G G-16 — `related_cover_types` absent from all construction entries.

### D-UCN39-8 (locked): Cross-library FK fields on UpholsteryConstructionTypeEntry per Q4=H
4 FK fields: `related_construction_types` (intra-library) + `related_fastener_types` + `related_hardware_types` + `related_joinery_types` (cross-library). Block 40 populates per explicit canonical-source cross-references:
- Cat 9 Fasteners and Upholstery Attachment Clues entries → `related_fastener_types` (fasteners Cat 3 STAPLES + upholstery tacks) + `related_hardware_types` (hardware UPHOLSTERY HARDWARE: decorative_nailhead_trim)
- App-Friendly Hierarchy "Frame evidence first: joinery, wood, tool marks, fasteners, form" → `related_joinery_types` cross-references where canonical-source warrant exists

### D-UCN39-9 (locked): SEVENTH canonical-library encoding of Independent Layer Evaluation Standard
Via Rule #5 `construction_evidence_layer_independence` (cross_layer_scope: true). After wood rule #7 + maker rule #1 + joinery rule #5 + fastener rule #5 + hardware rule #5 + upholstery covers rule #5. **Completes the ILE Standard encoding across all 7 Phase 2 evidence libraries.** Cross-library convention reinforced: each evidence-library reasoning-rule set includes one layer-independence canonical artifact per ILE precedent.

### D-UCN39-10 (locked): Authority calibration distribution per D-AR29-11 + A-8
**UPHOLSTERY_CONSTRUCTION_CATEGORIES distribution (verified Op G G-13): `positive_authority {7: 6, 8: 3}`; `hard_negative_authority {7: 6, 8: 3}`.**

**3 categories at 8/8 (AG-anchor + canonical-rigor categories)**:
- `upholstery_construction_category_coil_spring_construction` (Early Coil Spring industrial-introduction anchor; hand-tied coil spring construction rich canonical content)
- `upholstery_construction_category_serpentine_sinuous_and_zigzag_springs` (post-1930s industrial-introduction AG anchor)
- `upholstery_construction_category_foam_and_synthetic_cushion_materials` (densest AG distribution: Latex 1930s+, Polyurethane 1950s+, Polyester Fiberfill 1950s+, Memory Foam 1990s+)

**6 categories at 7/7 (medium-strong canonical-source rationale)**: No-Spring Upholstery, Webbing Systems, Natural Stuffing and Padding Materials, Feather and Down Fill, Layering Textiles and Foundation Covers, Fasteners and Upholstery Attachment Clues.

**UPHOLSTERY_CONSTRUCTION_REASONING_RULES**: all 7 at 9/9 per meta-rule supremacy precedent (D-WE26-8 / D-MM27-5).

### D-UCN39-11 (locked): Cat 9 Fasteners and Upholstery Attachment Clues resolution per A-11 defensible default (a)
Canonical source HAS "Fasteners and Upholstery Attachment Clues" as a real type-bearing category (paragraphs 691-709) with 3 explicit type entries (Hand Tacks para 692; Decorative Brass Nails/Nailhead Trim para 698; Staples para 704). Per strict canonical fidelity, cataloged as `UPHOLSTERY_CONSTRUCTION_CATEGORIES` entry #9. Cross-library FK fields (`related_fastener_types` + `related_hardware_types`) preserve relationships with fasteners + hardware libraries per D-UCN39-8. (Plan referred to this as "Cat 10"; actual canonical enumeration places it as the 9th type-bearing category — the plan's numbering counted Diagnostic Cross-Checks separately. No ambiguity; it is a real canonical category.)

### D-UCN39-12 (locked): NEW reasoning-rule TYPE reupholstery_campaign_warning
Block 39 Rule #6 `reupholstery_campaign_warning` is the **seventh NEW evidence-library reasoning-rule TYPE** authored across Phase 2 Session 7 libraries (after `restoration_false_signals` Block 30 joinery Rule #3 + `replacement_fastener_risk` Block 33 fastener Rule #2 + `restoration_contamination` Block 33 fastener Rule #4 + `reproduction_hardware_warning` Block 35 hardware Rule #4 + `cover_revival_warning` Block 37 covers Rule #6 + `cover_axis_sub_output_routing` Block 37 covers Rule #7). Captures the canonical Core Rule multi-generational-layering warning ("A chair frame may be 1880s, the springs may be 1920s replacement, the foam may be 1970s, and the visible fabric may be 2020s") + App-Friendly Identification Logic step 6 conflict-resolution discipline ("older frame plus modern foam means reupholstery, not modern frame") + canonical multiple-tack-hole-generations evidence.

Construction-axis-specific reupholstery warning required because construction systems are canonically the MOST-layered evidence axis — a single piece may carry 3-4 distinct construction campaigns physically stacked. Construction-library counterpart to upholstery covers Rule #6 cover_revival_warning (same multi-campaign-layering dynamics; different evidence axis).

Note: Block 39 Rule #7 `system_axis_sub_output_routing` is the SECOND application of the sub_output_routing rule TYPE (parallels upholstery covers Rule #7 cover_axis_sub_output_routing per D-UC37-13) — NOT a new TYPE; together the two sub_output_routing rules complete the operationalization of D-UC37-3 across both upholstery sub-layers.

### D-UCN39-13 (locked; NEW forward-applicable convention): Appraiser-honest-discipline-supersedes-FK-completion
**When a forward-reference FK turns out to be unwarranted by the canonical source, REMOVE the FK rather than author a content-thin entry to satisfy it.**

Surfaced from Surfacing 4 resolution: Block 38 covers library authored 4 forward-reference FK values per D-UC38-7, one of which — `upholstery_cover_type_stretched_canvas → construction_layering_canvas_foundation` — has NO warranting canonical content in the construction section (canvas appears only as a contrast-point mention at paragraph 472: "differs from canvas because it is strap-based"; there is NO dedicated canvas construction type). Per appraiser-honest discipline, Block 40 will REMOVE the unwarranted covers FK to canvas_foundation rather than author a content-thin defensible-default `canvas_foundation` construction type purely to satisfy the dangling FK. Authoring a content-thin entry to complete an FK would inject non-canonical content into the corpus; removing the unwarranted FK preserves appraiser-honest fidelity to what the canonical source actually documents.

**Forward-applicable**: future cross-library FK resolution (Phase 2 Session 9 styleFamilies + design-aspects; any future forward-reference pattern) applies this discipline — FK completion never justifies content-thin entry authoring; the canonical source governs whether an entry exists.

This means Block 40 aligns only **3** covers forward-reference FK values (webbing, burlap, muslin/cambric) and removes the **4th** (canvas) entirely. Block 40 construction type count is **31** (not 32; no canvas_foundation entry).

### D-UCN39-FINAL (post-authoring summary)
Block 39 ship: upholstery construction library schema foundation + 9 UPHOLSTERY_CONSTRUCTION_CATEGORIES + empty UPHOLSTERY_CONSTRUCTION_TYPES scaffold (Block 40 populates 31 types) + 7 UPHOLSTERY_CONSTRUCTION_REASONING_RULES + 2 library-level routing constants + UpholsteryConstructionMakerAssociation library-local interface.
- **NEW arrays**: `UPHOLSTERY_CONSTRUCTION_CATEGORIES` (9) + `UPHOLSTERY_CONSTRUCTION_TYPES` (0) + `UPHOLSTERY_CONSTRUCTION_REASONING_RULES` (7). Total 16 new canonical entries this block.
- **NEW library-level routing constants**: `UPHOLSTERY_CONSTRUCTION_ASSESSMENT_LAYER = "upholstery"` + `UPHOLSTERY_CONSTRUCTION_EVIDENCE_SUB_LAYER = "system"` per D-UCN39-3.
- **UPHOLSTERY_CONSTRUCTION_CATEGORIES authority distribution**: `positive_authority {7: 6, 8: 3}`; `hard_negative_authority {7: 6, 8: 3}` per D-UCN39-10.
- **UPHOLSTERY_CONSTRUCTION_CATEGORIES assessment_layer + evidence_sub_layer distribution**: 9 categories all `assessment_layer: "upholstery"` + 9 categories all `evidence_sub_layer: "system"` per D-UCN39-3 + D-UCN39-4 library-level uniform routing.
- **UPHOLSTERY_CONSTRUCTION_REASONING_RULES**: all 7 at 9/9 with migration_status "complete" + migration_target "engine_reasoning"; cross_layer_scope: true on Rule #1 (construction_alone_never_dates_frame) + Rule #5 (construction_evidence_layer_independence) per D-UCN39-5 + D-UCN39-9.
- **Second concrete application of D-UC37-3 two-assessment-with-sub-output-surfacing convention**: CAPTURED (D-UCN39-3; evidence_sub_layer = "system").
- **Second library-level "upholstery" assessment_layer application**: ESTABLISHED (D-UCN39-4).
- **SEVENTH canonical-library encoding of Independent Layer Evaluation Standard**: CONFIRMED (D-UCN39-9; via Rule #5; completes ILE encoding across all 7 Phase 2 evidence libraries).
- **Second application of D-UC37-7 expanded reasoning rule set convention**: CONFIRMED (D-UCN39-5; 7 rules; 5 Diagnostic Cross-Checks consolidated into Rule #3).
- **NEW reasoning-rule TYPE reupholstery_campaign_warning**: CAPTURED (D-UCN39-12; seventh new TYPE).
- **NEW convention appraiser-honest-discipline-supersedes-FK-completion**: CAPTURED (D-UCN39-13; forward-applicable).
- Files modified: **2** (`lib/constraints/upholsteryConstruction.ts` NEW; `lib/constraints/AUDIT_LOG.md` append).
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation (diff = 0 lines).
- **All 25 prior canonical array lengths unchanged**: SPECIES_EVIDENCE 26 / SUBSTRATE_EVIDENCE 5 / CUT_GRAIN_EVIDENCE 35 / WOOD_DIAGNOSTIC_SIGNALS 8 / WOOD_EVIDENCE_REASONING_RULES 7 / MAKER_ENTRIES 77 / MAKER_ATTRIBUTION_REASONING_RULES 8 / MAKER_MARKS (legacy) 25 / FORMS 183 / FAMILIES 12 / SPATIAL_BEHAVIORS 76 / CONSTRUCTION_LOGIC 4 / JOINERY_CATEGORIES 15 / JOINERY_TYPES 40 / JOINERY_REASONING_RULES 5 / FASTENER_CATEGORIES 6 / FASTENER_SUBCATEGORIES 9 / FASTENER_TYPES 25 / FASTENER_REASONING_RULES 5 / HARDWARE_CATEGORIES 13 / HARDWARE_TYPES 43 / HARDWARE_REASONING_RULES 5 / UPHOLSTERY_COVER_CATEGORIES 10 / UPHOLSTERY_COVER_TYPES 44 / UPHOLSTERY_COVER_REASONING_RULES 7.
- 13 numbered audit decisions captured under D-UCN39-N block-scoped prefix (D-UCN39-1 through D-UCN39-13 + D-UCN39-FINAL).
- **Phase 2 Session 7 fifth (final) library schema foundation: OPENED.**
- **Block 40 queued: ~31 UPHOLSTERY_CONSTRUCTION_TYPES content authoring closes Phase 2 Session 7.** Block 40 is a 2-content-file change per Surfacing 5: authors `upholsteryConstruction.ts` type entries with natural `upholstery_construction_type_*` ids AND updates 3 Block 38 covers forward-reference FK values in `upholsteryCovers.ts` (webbing → linen/hemp/jute webbing type; burlap → burlap/hessian-over-springs type; muslin/cambric → muslin/cambric type) to align with the natural ids; the 4th covers FK (stretched_canvas → canvas_foundation) is REMOVED entirely per D-UCN39-13 appraiser-honest discipline. Block 40 authoring will apply: per-type replacement_likelihood per D-AP32-3 with nuanced intra-system semantics; AG entries on industrial-introduction-boundary types (Latex Foam 1930+, Polyurethane Foam 1950+, Polyester Fiberfill 1950+, Elastic Webbing 1940+, Sinuous/Serpentine Spring 1930+, Memory Foam 1990+) applying D-HW36-15 decade-range discipline; style_associations sparse (~0-5 entries; construction is style-silent); maker_associations: [] empty arrays per D-UCN39-6; cross-library FK populations per D-UCN39-8.
- Convention precedents established this block: D-UCN39-3 second concrete application of D-UC37-3 (evidence_sub_layer = "system"); D-UCN39-4 second library-level "upholstery" assessment_layer application; D-UCN39-9 seventh + final ILE encoding across Phase 2 evidence libraries; D-UCN39-12 reupholstery_campaign_warning NEW reasoning-rule TYPE; D-UCN39-13 appraiser-honest-discipline-supersedes-FK-completion convention (NEW; forward-applicable to all future cross-library FK resolution); D-UCN39-5 second application of D-UC37-7 expanded reasoning rule set with Diagnostic-Cross-Checks-consolidation precedent. All forward-applicable to Block 40 + Phase 2 Session 9 (styleFamilies + design-aspects).
- Next sequencing per D-AP32-5 + Q5=J Sequence J: Block 40 construction content authoring (~31 types + 3 covers FK alignments + 1 covers FK removal) closes Phase 2 Session 7 entirely.

---

## Block 40 — UPHOLSTERY_CONSTRUCTION_TYPES Content Authoring (31 entries across 9 sub-batches) + 3 Covers FK Alignments + 1 Covers FK Removal (D-UCN39-13 first application); Upholstery construction library content-complete; PHASE 2 SESSION 7 FIFTH (FINAL) LIBRARY CLOSED; PHASE 2 SESSION 7 FULLY CLOSED
## Session 16 / claude.ai-and-Claude-Code paired execution
## Base SHA: main 4f0c82e (Block 39 endpoint / Upholstery construction library schema foundation opening)

Authors 31 `UpholsteryConstructionTypeEntry` entries into `UPHOLSTERY_CONSTRUCTION_TYPES` across 9 internal sub-batches (one per `UPHOLSTERY_CONSTRUCTION_CATEGORIES` entry) per `American_Furniture_Textile_Reference.docx` construction section (paragraphs 438-768). Closes the upholstery construction library begun with Block 39 schema foundation. **CLOSES PHASE 2 SESSION 7 ENTIRELY** — all 5 libraries (joinery, fasteners, hardware, upholstery covers, upholstery construction) canonically content-complete. Two-content-file change per D-UC38-7 + D-UCN39-13: `upholsteryConstruction.ts` (31 type entries) + `upholsteryCovers.ts` (3 FK alignments + 1 FK removal) + `AUDIT_LOG.md`. `lib/engine.ts` UNCHANGED per D-MM27-9.

### D-UC40-1 (locked): Block 40 scope per Q1-Q6 lockings
Single combined ship with 9 internal sub-batches + Op C-10 covers FK alignment operation. 31 `UPHOLSTERY_CONSTRUCTION_TYPES` + 3 covers FK alignments + 1 covers FK removal. Mid-batch pause protocol active; defensible-defaults execution permitted on minor surfacings. Mike-locked authorization includes D-UC40-N numbered audit decisions + D-UC40-FINAL summary. Op A surfacings resolved at defensible-default strength + 2 explicit Mike confirmations (staples AG floor + feather_and_down_over_foam AG).

### D-UC40-2 (locked): period_associations granularity per canonical-source rigor per A-5
**17 multi-period entries** (2 `period_associations` each — broad range + explicit canonical era-phase) / **14 single-period entries**. Multi-period: stuffed_slip_seat, stuffed_over_the_rail, elastic_webbing, early_coil_spring, hand_tied_coil_springs, drop_in_spring_unit, sinuous_serpentine_spring, horsehair, mixed_animal_hair, tow, straw_hay_excelsior_wood_wool, cotton_batting, latex_foam, polyurethane_foam, polyester_fiberfill_dacron, memory_foam, hand_tacks. Granularity driven by canonical "strongest X" / "experimental…practical" / "introduction…dominant" phrasing.

### D-UC40-3 (locked): replacement_likelihood per-type distribution per Q4=H + A-7
**Distribution: {low: 2, medium: 19, high: 10}.** LOW (2): horsehair, hand_tied_coil_springs (long-lived, survive multiple recovers). HIGH (10): latex_foam, polyurethane_foam, polyester_fiberfill_dacron, memory_foam, high_resilience_foam, elastic_webbing, sinuous_serpentine_spring, platform_no_sag_spring, staples, feather_and_down_over_foam (foam degrades; rubber dries; springs sag; staples are modern-repair indicators). MEDIUM (19): all remaining. Notes-field override marker per D-FA34-3 on early_coil_spring (durable but canonically reupholstery-prone — kept MEDIUM).

### D-UC40-4 (locked): AG entries on 10 types per Q2=C + A-4 hard-boundary discipline
**10 anti_classification_guidance entries**, all `boundary_type: "form_emergence"` + `prominence: "prominent"`, all applying D-HW36-15 decade-range AG-floor interpretation discipline:
| Type | AG floor | Canonical phrasing |
|---|---|---|
| elastic_webbing | 1940 | "strongest post-1940s" |
| sinuous_serpentine_spring | 1930 | "strongest post-1930s and especially postwar" |
| platform_no_sag_spring | 1930 | dating cue "Usually post-1930s to present" |
| latex_foam | 1930 | "1930s to present" |
| polyurethane_foam | 1950 | "1950s to present; dominant from the 1960s onward" |
| polyester_fiberfill_dacron | 1950 | "1950s to present; strongest 1960s onward" |
| memory_foam | 1990 | "strongest 1990s onward in consumer furniture" |
| high_resilience_foam | 1970 | "Late 20th century to present" (vague; conservative decade-floor; notes-field marker flags vagueness) |
| staples | 1900 | "Mostly 20th century to present in upholstery" |
| feather_and_down_over_foam | 1950 | "Mid-20th century to present" (foam core = hard industrial boundary) |

**Surfacings vs plan Q2=C draft (defensible-default + Mike-confirmed corrections):** (a) **staples AG floor = 1900, not the plan draft's 1940** — Mike-confirmed; canonical "Mostly 20th century" → D-HW36-15 yields 1900. (b) **platform_no_sag_spring AG floor = 1930, not 1940** — canonical dating cue "Usually post-1930s". (c) **feather_and_down_over_foam AG (1950) is a NEW AG candidate** not in the plan Q2=C list — Mike-confirmed; the foam core makes it a hard industrial-introduction boundary. (d) **kapok gets NO AG** — Mike-confirmed; canonical "Late 19th century to mid-20th century strongest" is a soft strongest-range for a natural plant fiber, not a hard floor (plan pre-addressed CC-Q7 1900-floor candidate declined per appraiser-honest discipline). (e) **drop_in_spring_unit + marshall_pocket_coil get NO AG** — canonical "Late 19th century to present" gradual industrial-adoption curves, soft boundaries.

### D-UC40-5 (locked): Cross-library AG floor DIVERGENCE per Q3=E + D-FA34-11 + D-HW36-16 — THIRD concrete instance
**Construction Staples AG floor 1900 vs fasteners library `fastener_type_upholstery_staple` AG floor 1930 = genuine cross-library AG floor DIVERGENCE.** The two libraries draw from two different canonical source documents: `American_Furniture_Textile_Reference.docx` construction section (para 705 "Mostly 20th century to present" → 1900 per D-HW36-15) vs `Fastener_Reference.docx` ("c. 1930-present" → 1930). Each library encodes its own canonical-source floor; the divergence is per-source-document fidelity, not an error. **THIRD concrete instance of the D-FA34-11 / D-HW36-16 cross-library AG floor divergence convention** (after D-FA34-11 fastener-vs-joinery upholstery_staple 1930-vs-1950, and D-HW36-16 hardware-library divergence). The plan's pre-addressed CC-Q3 predicted ALIGN at 1940; actual canonical inspection shows DIVERGE at 1900/1930 — neither source says 1940. Divergence documented in the `staples` entry's notes field + `anti_classification_guidance.guidance_text`.

### D-UC40-6 (locked): style_associations sparse per D-UC37-5 + A-11 — ZERO populated
**0 `style_associations` entries across all 31 types.** The construction section is style-silent: it lists "Furniture forms" (Federal chairs, Empire, Victorian, Danish Modern, mid-century) but never attributes decorative styles. The form-name mentions are not style attributions. Per D-UC37-5 sparse-population convention + strict canonical fidelity, `style_associations` is omitted entirely (construction = foundation/springs/padding/attachment, functional not decorative). Sparser than the plan's "~0-3" estimate — canonical-source rigor resolves to 0.

### D-UC40-7 (locked): maker_associations: [] uniform across ALL 31 entries per D-UCN39-6 + D-HW35-6
All 31 `UpholsteryConstructionTypeEntry` entries carry `maker_associations: []` (empty array). Construction canonical source has ZERO upholstery-shop or spring/foam-manufacturer documentation. Fourth application of D-HW35-6 SCHEMA-PRESENT-CONTENT-DEFERRED discipline (after hardware Block 36, upholstery covers Block 38, and Block 39 schema declaration). Per-entry `notes` field documents the deferred-content marker.

### D-UC40-8 (locked): Cross-library FK populations per Q5=I + A-8 canonical-source warrant
Cat 9 Fasteners and Upholstery Attachment Clues cross-library FK populations (all targets verified to exist in Op A-8):
- `hand_tacks` → `related_fastener_types: ["fastener_type_decorative_brass_tack"]` + `related_hardware_types: ["hardware_type_upholstery_tacks"]`
- `decorative_brass_nails_nailhead_trim` → `related_hardware_types: ["hardware_type_decorative_nailhead_trim"]`
- `staples` → `related_fastener_types: ["fastener_type_upholstery_staple"]` + `related_joinery_types: ["joinery_type_stapled_drawer_joinery"]`

Total cross-library FK references: **5** (2 related_fastener_types + 2 related_hardware_types + 1 related_joinery_types), across 3 Cat 9 entries.

### D-UC40-9 (locked): Intra-library related_construction_types FK count per D-UC38-14 canonical-source-driven density
**87 intra-library `related_construction_types` FK references** across the 31 entries (every entry populated; family clusters per canonical "cousin contrasts" lines): foam family (latex ↔ polyurethane ↔ memory ↔ high-resilience ↔ polyester fiberfill ↔ feather-and-down-over-foam), spring family (early coil ↔ hand-tied ↔ drop-in ↔ marshall/pocket ↔ sinuous/serpentine ↔ platform/no-sag), stuffing family (horsehair ↔ mixed animal hair ↔ tow ↔ straw/excelsior ↔ spanish moss ↔ cotton batting ↔ kapok), layering family (burlap ↔ linen scrim ↔ muslin/cambric), no-spring ↔ webbing ↔ attachment clusters. Density is canonical-source-driven per D-UC38-14.

### D-UC40-10 (locked): regional_persistence_notes per A-10 strict canonical fidelity per D-HW36-9
**3 `regional_persistence_notes` entries**: `spanish_moss` (canonical paras 575+580 "especially Southern contexts" / "More likely in Southern furniture"), `tow` (canonical paras 562+564 "rural furniture" / "rural traditional upholstery"), `stuffed_over_the_rail` (canonical para 464 "conservative, rural, or reproduction contexts"). Plan-draft Pennsylvania-German/Southern horsehair guess EXCLUDED — canonical gives horsehair no explicit region (strict canonical fidelity per D-HW36-9).

### D-UC40-11 (locked): common_observed_locations per D-FA33-6 identification helper convention
All 31 entries carry `common_observed_locations` populated with `PhysicalLocation` values from the upholstery set: `upholstery_seat` / `upholstery_back` / `upholstery_arm` / `upholstery_support_layer` / `upholstery_attachment_point` / `upholstery_dust_cover`. Foundation/spring/stuffing types populate seat/back/support-layer; attachment types (Cat 9) populate attachment_point; layering types populate support_layer/dust_cover.

### D-UC40-12 (locked): Authority calibration distribution per D-AR29-11 + A-6
**Distribution: positive_authority {8: 12, 7: 19}; hard_negative_authority {8: 12, 7: 19}.** 8/8 (12): the 10 AG-anchor types + hand_tied_coil_springs (rich canonical anchor; eight-way-tied quality marker) + horsehair (tight era anchor, rich canonical content). 7/7 (19): all remaining medium-strong-canonical-rationale types.

### D-UC40-13 (locked): Block 39 reasoning rule forward-references RESOLVED
The 7 `UPHOLSTERY_CONSTRUCTION_REASONING_RULES` (Block 39) operationalize at per-type field populations this block: Rule #1 construction_alone_never_dates_frame + Rule #2 construction_dates_campaign_not_frame (period_associations + date_range_summary + replacement_likelihood semantics); Rule #3 layer_consistency_check + Rule #6 reupholstery_campaign_warning (AG guidance_text references reupholstery_campaign_warning on all 10 AG types); Rule #4 frame_evidence_first_hierarchy (cross-library FK to joinery/fasteners/hardware); Rule #5 construction_evidence_layer_independence (independent per-type evidence); Rule #7 system_axis_sub_output_routing (library-level assessment_layer "upholstery" + evidence_sub_layer "system" inherited by all 31 types, no per-type override).

### D-UC40-14 (locked): FIRST APPLICATION of D-UCN39-13 appraiser-honest-discipline-supersedes-FK-completion convention
Block 38 covers entry `upholstery_cover_type_stretched_canvas` carried a forward-reference FK `related_construction_types: ["construction_layering_canvas_foundation"]`. Op A confirmed the construction section of `American_Furniture_Textile_Reference.docx` has **NO dedicated canvas construction type** — canvas appears only as a contrast-point mention (construction para 472: "differs from canvas because it is strap-based"). Per D-UCN39-13, rather than author a content-thin `canvas_foundation` construction entry purely to satisfy the dangling FK, **the unwarranted FK is REMOVED entirely** from the covers entry (the `related_construction_types` field is deleted from `upholstery_cover_type_stretched_canvas`; its notes field documents the removal). First concrete application of the forward-applicable convention in the canonical record.

### D-UC40-15 (locked): Block 38 covers forward-reference FK ids resolved per Op C-10 — TWO-CONTENT-FILE CHANGE
`upholsteryCovers.ts` modified for **3 FK alignments + 1 FK removal**:
- `upholstery_cover_type_upholstery_webbing`: `["construction_webbing_systems"]` → `["upholstery_construction_type_linen_hemp_jute_webbing"]`
- `upholstery_cover_type_burlap_hessian`: `["construction_layering_burlap"]` → `["upholstery_construction_type_burlap_hessian_over_springs"]`
- `upholstery_cover_type_muslin_cambric_dust_cover`: `["construction_layering_muslin_cambric_dust_cover"]` → `["upholstery_construction_type_muslin_cambric"]`
- `upholstery_cover_type_stretched_canvas`: `related_construction_types` field REMOVED entirely per D-UC40-14.

All 4 covers entries' `notes` fields updated to document resolution/removal. `UPHOLSTERY_COVER_TYPES.length` unchanged at 44 (only FK field values modified + 1 field removed; no entry added/removed). `upholsteryCovers.ts` line count 2119 → 2118 (one removed FK line).

### D-UC40-16 (locked): Upholstery construction library content-complete
Schema foundation (Block 39: 4 interfaces + 2 library-level constants) + 9 categories (Block 39) + 7 reasoning rules (Block 39) + 31 types (Block 40) = upholstery construction library CANONICALLY CONTENT-COMPLETE. `American_Furniture_Textile_Reference.docx` construction section (paragraphs 438-768) is fully encoded.

### D-UC40-17 (locked): PHASE 2 SESSION 7 FIFTH (FINAL) LIBRARY CLOSED — PHASE 2 SESSION 7 FULLY CLOSED
All FIVE Phase 2 Session 7 libraries are now content-complete: joinery (Blocks 30-31), fasteners (Blocks 33-34), hardware (Blocks 35-36), upholstery covers (Blocks 37-38), upholstery construction (Blocks 39-40). **PHASE 2 SESSION 7 FULLY CLOSED.**

### D-UC40-18 (locked): SECOND application of D-UC37-3 sub-output-surfacing convention now CONTENT-COMPLETE
Both upholstery sub-layers now have populated type-entry surfaces: the cover sub-layer (`UPHOLSTERY_COVER_TYPES` 44 entries, `evidence_sub_layer "cover"`) and the system sub-layer (`UPHOLSTERY_CONSTRUCTION_TYPES` 31 entries, `evidence_sub_layer "system"`). Engine-layer aggregation by `evidence_sub_layer` into the unified "upholstery" assessment section (upholstery system date sub-output + visible cover date sub-output) is now fully canonical-source-supported. Engine implementation deferred to Phase 3 per D-MM27-9.

### D-UC40-FINAL (post-authoring summary)
Block 40 ship: 31 `UPHOLSTERY_CONSTRUCTION_TYPES` entries authored across 9 sub-batches + 3 covers FK alignments + 1 covers FK removal.
- **UPHOLSTERY_CONSTRUCTION_TYPES.length: 0 → 31.** Per-sub-batch: No-Spring Upholstery 2 / Webbing Systems 2 / Coil Spring Construction 4 / Serpentine-Sinuous-Zigzag Springs 2 / Natural Stuffing and Padding 7 / Feather and Down Fill 3 / Foam and Synthetic Cushion Materials 5 / Layering Textiles and Foundation Covers 3 / Fasteners and Upholstery Attachment Clues 3.
- **UPHOLSTERY_COVER_TYPES.length: 44 → 44** (unchanged; 3 FK values modified + 1 FK field removed; no entry added/removed).
- **Authority distribution**: positive_authority {8: 12, 7: 19}; hard_negative_authority {8: 12, 7: 19} per D-UC40-12.
- **replacement_likelihood distribution**: {low: 2, medium: 19, high: 10} per D-UC40-3.
- **AG count: 10** per D-UC40-4 (all boundary_type "form_emergence", prominence "prominent", D-HW36-15 decade-range discipline).
- **Cross-library AG floor divergence**: CONFIRMED + CAPTURED (D-UC40-5; construction Staples 1900 vs fasteners Upholstery Staple 1930; third D-FA34-11/D-HW36-16 instance).
- **Cross-library FK count: 5** (2 related_fastener_types + 2 related_hardware_types + 1 related_joinery_types) per D-UC40-8.
- **Intra-library related_construction_types FK count: 87** per D-UC40-9 + D-UC38-14.
- **style_associations populated count: 0** per D-UC40-6 (construction style-silent).
- **maker_associations: []** uniform across all 31 entries per D-UC40-7.
- **regional_persistence_notes populated count: 3** (spanish_moss, tow, stuffed_over_the_rail) per D-UC40-10.
- **period_associations multi-period count: 17** / single-period 14 per D-UC40-2.
- **common_observed_locations**: populated on all 31 entries per D-UC40-11.
- Files modified: **3** (`lib/constraints/upholsteryConstruction.ts` MODIFIED — UPHOLSTERY_CONSTRUCTION_TYPES populated; `lib/constraints/upholsteryCovers.ts` MODIFIED — 3 FK alignments + 1 FK removal + 4 notes updates; `lib/constraints/AUDIT_LOG.md` APPEND).
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation (diff = 0 lines).
- **All 27 prior canonical array lengths unchanged**: SPECIES_EVIDENCE 26 / SUBSTRATE_EVIDENCE 5 / CUT_GRAIN_EVIDENCE 35 / WOOD_DIAGNOSTIC_SIGNALS 8 / WOOD_EVIDENCE_REASONING_RULES 7 / MAKER_ENTRIES 77 / MAKER_ATTRIBUTION_REASONING_RULES 8 / MAKER_MARKS (legacy) 25 / FORMS 183 / FAMILIES 12 / SPATIAL_BEHAVIORS 76 / CONSTRUCTION_LOGIC 4 / JOINERY_CATEGORIES 15 / JOINERY_TYPES 40 / JOINERY_REASONING_RULES 5 / FASTENER_CATEGORIES 6 / FASTENER_SUBCATEGORIES 9 / FASTENER_TYPES 25 / FASTENER_REASONING_RULES 5 / HARDWARE_CATEGORIES 13 / HARDWARE_TYPES 43 / HARDWARE_REASONING_RULES 5 / UPHOLSTERY_COVER_CATEGORIES 10 / UPHOLSTERY_COVER_TYPES 44 / UPHOLSTERY_COVER_REASONING_RULES 7 / UPHOLSTERY_CONSTRUCTION_CATEGORIES 9 / UPHOLSTERY_CONSTRUCTION_REASONING_RULES 7.
- 18 numbered audit decisions captured under D-UC40-N block-scoped prefix (D-UC40-1 through D-UC40-18 + D-UC40-FINAL).
- **Upholstery construction library: CANONICALLY CONTENT-COMPLETE** (D-UC40-16).
- **PHASE 2 SESSION 7 FIFTH (FINAL) LIBRARY: CLOSED.**
- **PHASE 2 SESSION 7: FULLY CLOSED** (all 5 libraries canonically content-complete; D-UC40-17).
- Convention applications this block: D-UC40-5 third concrete instance of D-FA34-11/D-HW36-16 cross-library AG floor divergence; D-UC40-14 first concrete application of D-UCN39-13 appraiser-honest-discipline-supersedes-FK-completion convention; D-UC40-7 fourth application of D-HW35-6 SCHEMA-PRESENT-CONTENT-DEFERRED discipline; D-UC40-18 D-UC37-3 two-assessment-with-sub-output-surfacing convention now content-complete across both upholstery sub-layers.
- Phase 2 remaining per D-AR29-10 + D-AP32-2: Session 8b reconciliation pass + Session 9 (HCL + styleFamilies.ts + design-aspects evidence layer).

---


## Block 41 — styleFamilies.ts Schema Foundation + 26 STYLE_FAMILIES + 6 Reasoning Rules + EIGHTH Canonical-Library Encoding of Evidence-Layer Architecture + style_and_waves Assessment Layer OPENS
## Phase 2 Session 9 OPENS / Session 16 / claude.ai-and-Claude-Code paired execution
## Base SHA: main c873bd8 (Block 40 endpoint / Phase 2 Session 7 FULLY CLOSED)

Opens Phase 2 Session 9 with the EIGHTH canonical evidence library: style families. Authors new `lib/constraints/styleFamilies.ts` with 5 interfaces (`StyleFamilyEntry` + `StyleRevivalWaveEntry` + `StyleReasoningRule` + `DesignSubtlety` + `StyleFamilyMakerAssociation`) + 1 library-level routing constant (`STYLE_FAMILIES_ASSESSMENT_LAYER`) + 3 arrays (`STYLE_FAMILIES` 26 entries / `STYLE_REVIVAL_WAVES` empty Block-42 scaffold / `STYLE_REASONING_RULES` 6 entries). Plan delivered as a full retransmit after claude.ai-side truncation; executed with 4 Mike-approved corrections (see D-SW41-11). `lib/engine.ts` UNCHANGED per D-MM27-9.

**EIGHTH canonical evidence library** (D-SW41-3). **NEW assessment_layer "style_and_waves"** (D-SW41-4) — third distinct assessment_layer after "frame" and "upholstery". **EIGHTH canonical-library encoding of the Independent Layer Evaluation Standard** via Rule #6 — COMPLETES ILE encoding across all 8 Phase 2 evidence libraries (D-SW41-5). **NEW interpretive-uncertainty-authority convention** (D-SW41-6). **THIRD application of D-HW36-14** this block (D-SW41-8 + D-SW41-11). **FIVE NEW reasoning-rule TYPES** established (D-SW41-13).

### D-SW41-1 (locked): Block 41 scope per Q1-Q7 lockings
Single `styleFamilies.ts` file with 5 interfaces + 1 library-level constant + 3 arrays. `STYLE_FAMILIES` 26 type-bearing entries; `STYLE_REVIVAL_WAVES` empty scaffold for Block 42 (~108 entries planned per A-5); `STYLE_REASONING_RULES` 6 entries at 9/9. Plan executed from full retransmit (original claude.ai prompt truncated at CC reception from "C-4" onward); Mike supplied B-3/B-4 DesignSubtlety placement + full retransmit + 4 corrections.

### D-SW41-2 (locked): Phase 2 Session 9 OPENS
Session 9 opens at Block 41. Session 8b reconciliation pass deferred to after Session 9 fully closes (Block 42 closes Session 9 with revival-wave content).

### D-SW41-3 (locked): EIGHTH canonical evidence library
styleFamilies.ts joins the prior 7 Phase 2 evidence libraries (wood, maker, joinery, fastener, hardware, upholstery covers, upholstery construction). Distinguished by interpretive-uncertainty discipline + low-weight authority architecture per Mike's appraiser-honest framing of style identification as qualitatively different from AG-floor + canonical-source artifact-level evidence.

### D-SW41-4 (locked): NEW assessment_layer "style_and_waves" OPENS
Library-level constant `STYLE_FAMILIES_ASSESSMENT_LAYER = "style_and_waves" as const`. Single integrated output per Q4=G + locked architectural baseline — style identification + design-subtleties date estimate produce a single integrated output via revival-wave date range. **NO `evidence_sub_layer` field anywhere** (contrast: upholstery covers + upholstery construction libraries declare evidence_sub_layer for D-UC37-3 sub-output surfacing; the style library has no sub-output split). Third distinct assessment_layer in the canonical record after "frame" and "upholstery".

### D-SW41-5 (locked): EIGHTH canonical-library encoding of the Independent Layer Evaluation Standard
Via Rule #6 `style_evidence_layer_independence` (cross_layer_scope: true). After wood rule #7, maker rule #1, joinery rule #5, fastener rule #5, hardware rule #5, upholstery covers rule #5, upholstery construction rule #5. **COMPLETES the ILE Standard encoding across all 8 Phase 2 evidence libraries** — every Phase 2 evidence library now carries one cross_layer_scope: true layer-independence canonical artifact.

### D-SW41-6 (locked; NEW interpretive-uncertainty-authority convention)
`STYLE_FAMILIES` 4/4 uniform + `STYLE_REVIVAL_WAVES` 3/3 uniform (Block 42). Authority values encode the layer's epistemological status directly — visibly lower than the prior 7 evidence libraries (which run 7/7-9/9) — reflecting style identification's interpretive character. NO style-by-style authority variance even for canonically-richer families (Federal, Chippendale): authority encodes layer epistemological status, not intra-layer canonical richness. Engine-layer reconciliation at Phase 3 reads authority directly; no separate "low-weight modifier" needed. Forward-applicable convention: future evidence layers with similar interpretive-uncertainty character may use parallel authority discipline. `STYLE_REASONING_RULES` at 9/9 per meta-rule supremacy (D-WE26-8 / D-MM27-5) — meta-rules are not subject to the interpretive-uncertainty calibration.

### D-SW41-7 (locked): 5 interfaces per Q1=A
`StyleFamilyEntry` + `StyleRevivalWaveEntry` + `StyleReasoningRule` (canonical, extend CanonicalEntry) + `DesignSubtlety` (library-local) + `StyleFamilyMakerAssociation` (library-local). DesignSubtlety + StyleFamilyMakerAssociation NOT promoted to entryShape.ts (schema-occurrence rule does not fire for style-library-only structure).

**DesignSubtlety architectural placement (Mike B-3/B-4 resolution):** `DesignSubtlety` lives on `StyleRevivalWaveEntry` ONLY (`design_subtleties: DesignSubtlety[]`), NOT on `StyleFamilyEntry`. Family-level visual character lives in `StyleFamilyEntry.core_visual_identity` as canonical verbatim prose. Design-subtlety decomposition happens at wave level where it produces dating evidence (distinguishing original-period vs revival-wave instances). DesignSubtlety interface DEFINED this block; CONTENT authored Block 42.

### D-SW41-8 (locked): DesignSubtlety aspect enum LOCK per D-HW36-14
9-aspect enum locked per CC's A-6 canonical-derived typology (canonical inspection of Styles_and_Waves.docx per-wave "Traits" + "Contrast from..." prose, paragraphs 4-211): `massing_and_proportion`, `line_and_silhouette`, `carving_character`, `leg_and_foot_vocabulary`, `ornament_and_motif`, `surface_and_finish`, `material_palette`, `construction_expression`, `hardware_character`. The preliminary claude.ai-side 9-aspect scoping draft (scale / ornateness / style_influence / finish / material / proportion / carving / joinery_hint / regional_marker) was DEFERRED per **D-HW36-14 A-4-canonical-enumeration-supersedes-A-6-informal-preview discipline** — same convention applied to Block 36 hardware categories, Block 37/38 covers, Block 40 construction AGs. `DesignSubtlety.weight` is uniformly `"low"` per Mike's appraiser-practice (the style/waves layer is a low-weighted reconciliation-pool contributor). Schema augmentation per D-FA34-Surfacing-8 permitted at Block 42 if canonical inspection of wave content surfaces additional aspect patterns; default is map-to-existing-aspect.

### D-SW41-9 (locked): FIFTH application of D-HW35-6 SCHEMA-PRESENT-CONTENT-DEFERRED
`StyleFamilyEntry` carries the optional `maker_associations?: StyleFamilyMakerAssociation[]` field; all 26 entries leave it `[]`. Canonical source has ZERO style-family maker documentation. FIFTH application of D-HW35-6 discipline (after hardware Block 36, upholstery covers Block 38, upholstery construction Block 39/40 schema+content) — establishes the convention as cross-library-stable across 5 Phase 2 libraries.

### D-SW41-10 (locked): Single-directional cross-library FK per Q6=L + D-FA33-8
NO reverse-reference fields on `StyleFamilyEntry`. styleFamilies.ts is the CANONICAL TARGET for the `style_associations` populations already shipped in the hardware + upholstery covers libraries; engine-layer Phase 3 reasoning resolves the bidirectional relationship via name-matching to `StyleFamilyEntry.name` + `canonical_source_aliases`. Per Phase 2/Phase 3 separation, no resolution logic ships this block. NOTE per A-4a: alias-token overlap exists ("Jacobean" alias of #2 vs "Jacobean Revival" alias of #18; "Mission" alias of #15 vs "Mission Revival" alias of #19) — name-matching MUST use exact-full-token equality, not substring match; documented in the notes fields of styles #18 and #19.

### D-SW41-11 (locked; canonical_source_aliases field convention + alias-count correction)
Style families with slash-separated canonical names carry the alternate names as a `canonical_source_aliases` array for name-matching resolution. Forward-applicable to similar canonical-source multi-name patterns.

**Alias-count correction per CC A-4 canonical inspection:** **15** of 26 style families have slash-separated canonical names (#1, #2, #6, #7, #8, #11, #13, #14, #15, #18, #19, #22, #24, #25, #26) and carry `canonical_source_aliases`; **11** single-canonical-name families omit the field (#3, #4, #5, #9, #10, #12, #16, #17, #20, #21, #23). The plan-retransmit's preliminary alias enumeration listed only 13 (omitting #2 "Jacobean / Carolean-Derived Colonial" and #11 "Rococo Revival / Naturalistic Victorian"; its explicit lists summed to only 25 of 26). Corrected per **D-HW36-14 A-4-canonical-enumeration-supersedes-A-6-informal-preview discipline** — **THIRD application of D-HW36-14 within this block sequence** (after DesignSubtlety placement-resolution and DesignSubtlety aspect-enum lock); convention now library-cluster-stable. Canonical-source revision deferred to a post-Phase-2 deliberate workstream; Block 41 ships against the current Styles_and_Waves.docx canonical source.

### D-SW41-12 (locked): 6 reasoning rules per Q3=E
5 canonical Cross-Wave Identification principles (Styles_and_Waves.docx paragraphs 213-231) + 1 ILE encoding rule. All 6 at authority 9/9, migration_status "complete", migration_target "engine_reasoning". cross_layer_scope: true on Rule #6 only.

### D-SW41-13 (locked; FIVE NEW reasoning-rule TYPES established)
Rules #1-5 are five NEW canonical reasoning-rule TYPES: `original_period_vs_revival_distinction`, `scale_and_visual_weight_as_evidence`, `surface_vs_structure_distinction`, `wave_to_wave_contrast_pattern`, `practical_appraiser_rule`. Rule #6 `style_evidence_layer_independence` is the ILE encoding TYPE (not new — eighth library application). Five NEW TYPES this block brings the canonical record to **12 total reasoning-rule TYPES** after Block 41 (7 established across Phase 2 Sessions 1-7 libraries + 5 here).

### D-SW41-FINAL (post-authoring summary)
Block 41 ship: styleFamilies.ts schema foundation + 26 `STYLE_FAMILIES` + 6 `STYLE_REASONING_RULES` + empty `STYLE_REVIVAL_WAVES` scaffold.
- **NEW arrays**: `STYLE_FAMILIES` (26) + `STYLE_REVIVAL_WAVES` (0) + `STYLE_REASONING_RULES` (6). Total 32 new canonical entries this block.
- **NEW library-level routing constant**: `STYLE_FAMILIES_ASSESSMENT_LAYER = "style_and_waves"` per D-SW41-4. NO `evidence_sub_layer` constant or field anywhere.
- **STYLE_FAMILIES authority distribution**: `positive_authority {4: 26}`; `hard_negative_authority {4: 26}` — uniform 4/4 per D-SW41-6 interpretive-uncertainty-authority convention.
- **STYLE_FAMILIES assessment_layer distribution**: 26 entries all `assessment_layer: "style_and_waves"` per D-SW41-4.
- **STYLE_FAMILIES canonical_source_aliases distribution**: 15 entries populated / 11 omitted per D-SW41-11 (corrected from retransmit's preliminary 13 per D-HW36-14, third application).
- **STYLE_FAMILIES maker_associations**: `[]` uniform across all 26 entries per D-SW41-9.
- **STYLE_FAMILIES period_associations**: 10 multi-entry families (#1, #2, #4, #6, #7, #8, #9, #10, #11, #20) + 16 single-entry per A-5 canonical "overlap into / survivals into / continues later" phrasing; 3 of the single-entry families (#17, #24, #26) omit date_ceiling per the extends-to-present convention ("Still active" / "Ongoing").
- **STYLE_REASONING_RULES**: all 6 at 9/9 with migration_status "complete" + migration_target "engine_reasoning"; cross_layer_scope: true on Rule #6 (style_evidence_layer_independence) only.
- **EIGHTH canonical evidence library**: OPENED (D-SW41-3).
- **EIGHTH canonical-library encoding of the Independent Layer Evaluation Standard**: COMPLETED (D-SW41-5; via Rule #6; completes ILE encoding across all 8 Phase 2 evidence libraries).
- **NEW assessment_layer "style_and_waves"**: OPENS (D-SW41-4).
- **NEW interpretive-uncertainty-authority convention**: ESTABLISHED (D-SW41-6).
- **THIRD application of D-HW36-14** canonical-enumeration-supersedes-informal-preview: CONFIRMED (D-SW41-8 DesignSubtlety enum + D-SW41-11 alias count).
- **FIVE NEW reasoning-rule TYPES**: ESTABLISHED (D-SW41-13; 12 total in canonical record after Block 41).
- **DesignSubtlety placement**: on StyleRevivalWaveEntry only, NOT StyleFamilyEntry (Mike B-3/B-4 resolution).
- Files modified: **2** (`lib/constraints/styleFamilies.ts` NEW; `lib/constraints/AUDIT_LOG.md` append).
- `lib/engine.ts`: UNCHANGED per D-MM27-9 Phase 2 / Phase 3 separation (diff = 0 lines).
- **All 28 prior canonical array lengths unchanged**: SPECIES_EVIDENCE 26 / SUBSTRATE_EVIDENCE 5 / CUT_GRAIN_EVIDENCE 35 / WOOD_DIAGNOSTIC_SIGNALS 8 / WOOD_EVIDENCE_REASONING_RULES 7 / MAKER_ENTRIES 77 / MAKER_ATTRIBUTION_REASONING_RULES 8 / MAKER_MARKS (legacy) 25 / FORMS 183 / FAMILIES 12 / SPATIAL_BEHAVIORS 76 / CONSTRUCTION_LOGIC 4 / JOINERY_CATEGORIES 15 / JOINERY_TYPES 40 / JOINERY_REASONING_RULES 5 / FASTENER_CATEGORIES 6 / FASTENER_SUBCATEGORIES 9 / FASTENER_TYPES 25 / FASTENER_REASONING_RULES 5 / HARDWARE_CATEGORIES 13 / HARDWARE_TYPES 43 / HARDWARE_REASONING_RULES 5 / UPHOLSTERY_COVER_CATEGORIES 10 / UPHOLSTERY_COVER_TYPES 44 / UPHOLSTERY_COVER_REASONING_RULES 7 / UPHOLSTERY_CONSTRUCTION_CATEGORIES 9 / UPHOLSTERY_CONSTRUCTION_TYPES 31 / UPHOLSTERY_CONSTRUCTION_REASONING_RULES 7.
- Minor surfacing (pre-authorized in approved plan): `AntiClassificationGuidance` was NOT imported into styleFamilies.ts — no Block 41 interface uses it (style families are reference taxonomy, not artifact-level evidence with crisp AG date boundaries). Imports limited to `CanonicalEntry`, `PeriodAssociation`, `ReasoningRuleMigrationTarget`.
- 13 numbered audit decisions captured under D-SW41-N block-scoped prefix (D-SW41-1 through D-SW41-13 + D-SW41-FINAL).
- **Phase 2 Session 9: OPENED.**
- **Block 42 queued: ~108 STYLE_REVIVAL_WAVES content authoring closes Phase 2 Session 9** + opens Phase 2 Session 8b reconciliation pass per D-AR29-10. Block 42 populates `design_subtleties` on revival-wave entries using the D-SW41-8 locked 9-aspect enum; revival-wave authority 3/3 uniform per D-SW41-6.
- Convention precedents established this block: D-SW41-4 NEW "style_and_waves" assessment_layer; D-SW41-5 eighth + final ILE encoding completing the Phase 2 ILE cycle; D-SW41-6 NEW interpretive-uncertainty-authority convention (forward-applicable); D-SW41-8 + D-SW41-11 third application of D-HW36-14 (now library-cluster-stable); D-SW41-11 canonical_source_aliases field convention; D-SW41-13 five new reasoning-rule TYPES.

---
## Block 42 — STYLE_REVIVAL_WAVES Content Authoring (108 entries across 26 sub-batches) + one-line Block 41 schema correction; styleFamilies.ts content-complete; PHASE 2 SESSION 9 CLOSES
## Session 16+ / claude.ai-and-Claude-Code paired execution
## Base SHA: main efa2130 (Block 41 endpoint / Phase 2 Session 9 OPENED)

Authors 108 `StyleRevivalWaveEntry` entries into `lib/constraints/styleFamilies.ts` across 26 internal sub-batches (one per parent style family) from the `Styles_and_Waves.docx` per-style "Revival waves" subsections. Closes the styleFamilies library begun with Block 41 (schema foundation + 26 STYLE_FAMILIES + 6 STYLE_REASONING_RULES). Includes a one-line Block 41 schema correction (`date_ceiling` → optional). **CLOSES PHASE 2 SESSION 9 ENTIRELY.** `lib/engine.ts` UNCHANGED per D-MM27-9. 2 files modified (styleFamilies.ts; AUDIT_LOG.md).

### D-SW42-1 (locked): Block 42 scope per Q1-Q6
Single combined ship with 26 internal sub-batches (one per parent style family); per-sub-batch tsc + intermediate length checks; mid-batch pause protocol active. **108 STYLE_REVIVAL_WAVES** authored — the Block 41 A-5 preliminary estimate of ~108 confirmed exactly by Op A-3 canonical enumeration. Per-style wave counts: #1:4 #2:4 #3:3 #4:4 #5:4 #6:4 #7:5 #8:4 #9:4 #10:4 #11:5 #12:4 #13:3 #14:4 #15:5 #16:4 #17:6 #18:5 #19:5 #20:5 #21:3 #22:5 #23:3 #24:5 #25:3 #26:3.

### D-SW42-2 (locked): design_subtleties density per canonical-source warrant (Q2=D)
Per-wave `design_subtleties` count varies by the depth of the canonical per-wave Traits + Contrast prose (2-7 signals per wave; 399 signals total across 108 waves). Strict canonical fidelity per D-HW36-9 — sparse canonical prose yields sparse design_subtleties; no padding.

### D-SW42-3 (locked): multiple signals per aspect (Q3=H)
Distinct canonical phrases mapping to the same DesignSubtlety aspect are authored as separate `signal` entries within a wave (e.g. wave 1.1 carries three `surface_and_finish` signals — "darker", "more polished", "often cleaner in finish than original work"). Preserves canonical granularity.

### D-SW42-4 (locked): authority calibration 3/3 uniform (D-SW41-6 + Q6=O)
All 108 wave entries at `positive_authority: 3` / `hard_negative_authority: 3`. No intra-layer variance. Confirms the D-SW41-6 interpretive-uncertainty-authority convention at the revival-wave tier (Block 41 set STYLE_FAMILIES at 4/4; revival waves one step lower at 3/3 per the convention's locked calibration).

### D-SW42-5 (locked): 9-aspect enum strict adherence (D-SW41-8)
All 399 `design_subtleties` signals use the locked 9-token `DesignSubtlety.aspect` enum (massing_and_proportion, line_and_silhouette, carving_character, leg_and_foot_vocabulary, ornament_and_motif, surface_and_finish, material_palette, construction_expression, hardware_character); `weight: "low"` uniform. Op A-6 canonical inspection confirmed 9-aspect coverage sufficient — **D-FA34-Surfacing-8 schema augmentation NOT triggered**. Aspect distribution across 108 waves: construction_expression 68, material_palette 61, surface_and_finish 60, ornament_and_motif 57, massing_and_proportion 51, line_and_silhouette 39, leg_and_foot_vocabulary 30, carving_character 27, hardware_character 6.

### D-SW42-6 (locked): cross-library name-matching per Q5=L + Op A-8 finding
No wave-level cross-library FK or `wave_aliases` field. Op A-8 canonical inspection found that the existing `style_associations.style_label` populations in the hardware library (23 entries) and upholstery covers library (43 entries) reference style **family** names/aliases (e.g. "Federal", "Eastlake", "Mission", "Hollywood Regency") — these resolve at engine-layer Phase 3 against Block 41 `StyleFamilyEntry.name` + `canonical_source_aliases`, NOT against revival-wave names. The wave-name-matching surface has effectively zero current referents; all 108 wave names are globally unique. No wave-name-matching infrastructure was built in Block 42.

### D-SW42-7 (locked): strict canonical fidelity (D-HW36-9 + Q2=D)
`traits_summary` carries the canonical "Traits:" prose verbatim; `contrast_summary` carries the canonical "Contrast from X:" prose verbatim including its label (24 distinct canonical contrast-label variants preserved). No cross-canonical inference; sparse waves carry sparse design_subtleties per canonical-source warrant.

### D-SW42-8 (locked): "to present" date_ceiling Pattern 3 application
22 of 108 wave entries whose canonical "Dates:" phrasing ends in "present" **OMIT** the `date_ceiling` field entirely. The canonical "to present" phrasing is preserved verbatim in each entry's `notes` field (Canonical Dates note) per D-FA34-3 marker discipline. This matches the immediate-precedent cluster convention — the Blocks 30-40 Phase 2 evidence libraries (fasteners, joinery, hardware, upholstery covers, upholstery construction) all omit `date_ceiling` for open-ended ranges and carry "to present" in free-text. The other 86 wave entries carry a numeric `date_ceiling` from the canonical "Dates: c. XXXX–YYYY" pair.

### D-SW42-9 (locked): Block 41 schema correction — date_ceiling optional
`StyleRevivalWaveEntry.date_ceiling: number` → `date_ceiling?: number`. One-line change applied on this commit (same file) to enable D-SW42-8 Pattern 3. Block 41 locked this field as required; Op A precedent-exploration found the immediate-precedent cluster omits `date_ceiling` for "present" ranges, so the field is corrected to optional for alignment. Forward-applicable to any future evidence library with "to present" canonical content. B-4 interface doc-comment updated to document the optional field + Pattern 3 rationale.

### D-SW42-10 (Session 8b reconciliation FLAG — NOT Block 42 scope)
Op A precedent-exploration surfaced cross-library inconsistency in canonical "to present" handling: `forms.ts` uses `date_ceiling: 2030` (134 instances); `woodEvidence.ts` uses `date_ceiling: 2026` (17 instances, in `period_associations`); the Blocks 30-40 evidence-library cluster omits `date_ceiling` entirely (Pattern 3, adopted by Block 42 per D-SW42-8). These divergences are FLAGGED for the Phase 2 Session 8b reconciliation pass per D-AR29-10 reconciliation discipline. **Block 42 does NOT touch `forms.ts` or `woodEvidence.ts`** — flag only.

### D-SW42-11 (locked): Memphis Wave 1 dual-range resolution
Style #25 (Postmodern / Memphis / Radical Design Influence) Wave 1 "Original Memphis / Radical Postmodern" has a dual-range canonical "Dates:" string — "c. 1981–1987 for Memphis proper; broader postmodern c. 1980–1995". Resolved per D-HW36-9 strict canonical fidelity + parent-style canonical positioning: `date_floor: 1980` / `date_ceiling: 1995` (the broader postmodern range). The Memphis-proper sub-range c. 1981–1987 is documented in the entry's `notes` field per D-FA34-3 for Phase 3 engine-layer awareness. NO schema augmentation (D-FA34-Surfacing-8 not triggered).

### D-SW42-12 (locked): styleFamilies.ts canonically content-complete
With Block 42's 108 STYLE_REVIVAL_WAVES, the styleFamilies library is canonically content-complete: schema foundation (Block 41) + 26 STYLE_FAMILIES (Block 41) + 6 STYLE_REASONING_RULES (Block 41) + 108 STYLE_REVIVAL_WAVES (Block 42). All three arrays populated to full canonical extent of `Styles_and_Waves.docx`.

### D-SW42-13 (locked): Phase 2 Session 9 CLOSES
The style + waves library was the SOLE Phase 2 Session 9 deliverable; closing it closes the session. Phase 2 Session 8b reconciliation pass becomes the next + final Phase 2 work before Phase 3 engine architecture (per D-AR29-10): forms.ts retroactive rationale population (~182 entries) + 5 audit issues from Block 29 + the D-SW42-10 "to present" cross-library reconciliation flag.

### D-SW42-FINAL (post-authoring summary)
- Block 42 ship: 108 `StyleRevivalWaveEntry` entries authored across 26 sub-batches + one-line `date_ceiling` schema correction.
- `STYLE_REVIVAL_WAVES.length`: 0 → **108** (per Op A-3 canonical enumeration; Block 41 ~108 estimate confirmed exactly).
- **Authority**: 108 entries at 3/3 uniform per D-SW42-4.
- **assessment_layer**: 108 entries all "style_and_waves" per D-SW41-4.
- **parent_style_id**: all 108 resolve to STYLE_FAMILIES ids; single-directional FK per D-SW41-10.
- **date_ceiling split**: 22 omitted (Pattern 3, D-SW42-8) / 86 numeric.
- **design_subtleties**: 399 signals total; per-wave count 2-7 per canonical warrant (D-SW42-2); all aspects within the 9-token locked enum (D-SW42-5); weight "low" uniform.
- **Schema correction**: `StyleRevivalWaveEntry.date_ceiling` now optional (D-SW42-9).
- Files modified: **2** (`lib/constraints/styleFamilies.ts` 871 → 3221 lines; `lib/constraints/AUDIT_LOG.md` append).
- `lib/engine.ts`: UNCHANGED per D-MM27-9 (diff = 0 lines).
- **All 30 other canonical array lengths unchanged**: 28 prior (SPECIES_EVIDENCE 26 … UPHOLSTERY_CONSTRUCTION_REASONING_RULES 7) + STYLE_FAMILIES 26 + STYLE_REASONING_RULES 6.
- 13 numbered audit decisions captured under D-SW42-N prefix (D-SW42-1 through D-SW42-13 + D-SW42-FINAL).
- **styleFamilies.ts: CANONICALLY CONTENT-COMPLETE** (D-SW42-12).
- **PHASE 2 SESSION 9: CLOSED** (D-SW42-13).
- **Phase 2 Session 8b reconciliation pass**: next + final Phase 2 work before Phase 3 (D-AR29-10) — forms.ts retroactive rationale population (~182 entries) + 5 Block 29 audit issues + D-SW42-10 "to present" cross-library reconciliation flag.

---
## Phase 2 Session 8b — forms.ts Retroactive Rationale Population + D-SW42-10 Cross-Library "to present" Reconciliation; Block 29 Audit Issue 3 Fulfilled; PHASE 2 SESSION 8b CLOSES → PHASE 2 FULLY CLOSED
## Session 17 / claude.ai-and-Claude-Code paired execution
## Base SHA: main 4a2814c (Block 42 merge endpoint / Phase 2 Session 9 CLOSED)

The FINAL Phase 2 work before Phase 3 engine architecture reshape (D-AP32-4). Populates the `notes` rationale field on 182 previously-unrationaled `forms.ts` FORMS entries (Block 29 Issue 3 per D-AR29-8) and reconciles the D-SW42-10 cross-library "to present" precedent divergence by applying Pattern 3 (omit `date_ceiling`) to 134 `forms.ts` entries + 17 `woodEvidence.ts` `period_associations` entries. NO schema corrections required — Op A-4 confirmed both target shapes already permit `date_ceiling` omission. `lib/engine.ts` UNCHANGED per D-MM27-9. `styleFamilies.ts` + `entryShape.ts` UNCHANGED. 3 files modified (forms.ts; woodEvidence.ts; AUDIT_LOG.md).

### D-AR8B-1 (locked): Session 8b scope per Q1-Q6
Scope is Block 29 Issue 3 (forms.ts rationale gap) + D-SW42-10 cross-library "to present" reconciliation ONLY. Q-set locked: Q1=A (rationale synthesized from existing entry fields), Q2=C (HCL descoped/absorbed), Q3=G (Issue 4 deferred/dropped), Q4 (Issues 1/2/5 no Session 8b action), Q5 (stray scratch files deferred), Q6 (12 forms.ts sub-batches by parent_category interleaved with reconciliation → woodEvidence.ts sub-batch). NO entry mutations beyond `notes` population + `date_ceiling` omission. Block 29 Op C audit-and-defer (D-AR29-4) discipline fulfilled: the deferred corrections route here.

### D-AR8B-2 (locked): Rationale-population basis — appraiser-call synthesis from existing entry fields (Q1=A)
The 182 `notes` rationales were synthesized from each entry's own existing canonical fields (date_floor/date_ceiling, distinguishing_features, subtypes, anti_classification_guidance, cousin_form_contrasts, regional_period_notes, dimensional_thresholds, common_conversion_targets) per the `form_jelly_cupboard` extant pattern + D-UCN39-13 appraiser-honest-discipline-supersedes-FK-completion. NO canonical source-document re-reading required (Op A-7 surfacing 1 resolved: the original forms seed documents were not needed; the entries' own structured content carries sufficient rationale basis). Each rationale states the canonical date basis, the form group, the diagnostic-identity basis (distinguishing_features + subtype counts), anti-classification boundary if present, and supporting diagnostic content. Op A-1 found exactly 1 of 183 entries (`form_jelly_cupboard`) already carried a `notes` field — left unchanged per pattern-consistency verification. Op B confirmed ZERO "thin" entries (every one of the 182 carried sufficient existing fields to synthesize a defensible rationale; no mid-batch pause triggered).

### D-AR8B-3 (locked): Pattern 3 application to forms.ts — 134 entries omit date_ceiling
134 `forms.ts` FORMS entries carried `date_ceiling: 2030` — a fixed forward-sentinel inconsistent with the Phase 2 Session 7 immediate-precedent cluster convention. Op A-3 confirmed all 134 are genuinely "to present" open-ended ranges (forms still in production: secretary desk, side chair, Windsor chair, etc.); zero are legitimate explicit ceilings. All 134 `date_ceiling: 2030` fields were stripped entirely; the canonical "to present" / open-ended-range marker is folded into each entry's new `notes` field per D-FA34-3 notes-field-marker convention. forms.ts now aligns with the Blocks 30-40 evidence-library cluster (Pattern 3) and with Block 42's D-SW42-8. The remaining 48 rationaled entries had legitimate explicit ceilings or already-omitted ceilings — `notes` populated, no date_ceiling change.

### D-AR8B-4 (locked): Pattern 3 application to woodEvidence.ts — 17 period_associations omit date_ceiling
17 `woodEvidence.ts` `date_ceiling: 2026` instances — all inside `period_associations` sub-objects — were stripped entirely. Op A-3 confirmed all 17 are genuinely "to present" (period_labels read "Continued present-day…", "Contemporary…", "Modern and contemporary…", "…(broad)"). The "to present" marker is already carried verbatim in each entry's `period_label` and `usage_notes`, so no `notes` field addition was needed (Op C verified markers present in all 17). 2026 was a current-year-at-authoring value that drifts; omission is the durable convention.

### D-AR8B-5 (locked): NO schema corrections required
Op A-4 confirmed both target shapes already permit `date_ceiling` omission: `CanonicalEntry.date_ceiling?` is optional (entryShape.ts:34), inherited by `FormEntry`; `PeriodAssociation.date_ceiling?` is optional (entryShape.ts:121). The `PeriodAssociation` interface doc-comment EXPLICITLY documents the omitted-means-present convention and even names "2026" as the bad sentinel to avoid ("avoids the year drift that a fixed sentinel (e.g., 2026) would introduce") — the 17 woodEvidence.ts instances directly violated their own interface contract's documented convention. Unlike Block 42's D-SW42-9 (which required a one-line schema correction because `StyleRevivalWaveEntry.date_ceiling` had been locked as required), Session 8b required ZERO schema edits. `entryShape.ts` UNCHANGED.

### D-AR8B-6 (locked): HCL descoped/absorbed (Q2=C)
`historicalClueLibrary.ts` was never authored. Phase 2 Session 9 was originally scoped as "HCL + styleFamilies + design-aspects" (D-AP32-2/D-AR29-10), but Blocks 41-42 authored only `styleFamilies.ts`, with the design-aspects evidence layer absorbed as the `DesignSubtlety` sub-structure on `StyleRevivalWaveEntry` (D-SW41-8). HCL is hereby recorded as descoped/absorbed; D-SW42-13 Session 9 closure stands. D-AR29-8 had named HCL as a prerequisite for Issue 3 rationale population — that prerequisite is dissolved: Q1=A synthesis-from-existing-fields needs no HCL cross-reference content. Op A-7 surfacing 2 resolved.

### D-AR8B-7 (locked): Block 29 Issue 4 deferred/dropped (Q3=G)
Block 29 Issue 4 (FAMILIES/SPATIAL_BEHAVIORS/CONSTRUCTION_LOGIC zero authority spread — 92 entries uniform at 8/8) is deferred/dropped from Session 8b scope. Rationale: LOW priority per D-AR29-9; the disposition's own note ("description field rationale provides canonical-source context") indicates the dense per-entry `description` field already satisfies appraiser-honest rationale-documentation discipline; per-entry authority-justification is a Phase 3 weighting-integration concern, not a Phase 2 content concern. NO mutations to families.ts / spatialBehaviors.ts / constructionLogic.ts. Captured in audit log only per Q3=G.

### D-AR8B-8 (locked): Block 29 Issues 1, 2, 5 — confirmed no Session 8b action (Q4)
Issue 1 (SUBSTRATE_EVIDENCE D-WE22-11 baseline divergence) and Issue 5 (D-WE22-11 audit-log clarity) were closed at Block 29 itself by D-AR29-6 audit-log clarification — no entry mutations, then or now. Issue 2 ("8" semantic asymmetry across libraries) was resolved architecturally by D-AP32-4: the Phase 3 per-entry-uniform-scale approach with overlap-driven confidence calculation absorbs cross-library scaling without per-library scaling factors (Mike-locked). Issue 2 is Phase 3 architectural scope, not a Session 8b content mutation. Of the "Block 29 audit — 5 issues," only Issue 3 required Session 8b mutations; Issue 4 was dropped per D-AR8B-7.

### D-AR8B-9 (locked): Stray scratch files deferred (Q5)
`lib/constraints/_session_3_forms_inventory.md` and `lib/constraints/_style_observations_backlog.md` (pre-existing scratch artifacts) are out of Session 8b scope and were left untouched. Flagged for possible future cleanup; not a Phase 2 closure blocker.

### D-AR8B-10 (locked): Sub-batch sequencing (Q6)
forms.ts rationale population + 2030 reconciliation executed as a single mechanical field-synthesis transform organized by the 12 `parent_category` groups (desk 55, industrial_professional_form 29, table 24, entry_support_form 22, case_piece 20, musical_mechanical_form 12, chair 6, lighting_form 6, specialized 3, clock_case_form 3, seating 2, basket_form 1 = 183 total; 182 rationaled + form_jelly_cupboard pre-existing). Rationale population and `date_ceiling: 2030` strip interleaved per entry (same `notes` field carries the Pattern 3 marker). woodEvidence.ts reconciliation executed as a separate 17-edit sub-batch. tsc clean after each phase; no mid-batch pause triggered.

### D-AR8B-11 (locked): forms.ts content-complete for rationale population (Issue 3 fulfilled)
All 183 FORMS entries now carry a populated `notes` field. Block 29 Issue 3 disposition (D-AR29-8) is fulfilled; the FORMS-style sparse-rationale anti-pattern flagged at D-AR29-11 is eliminated. forms.ts is rationale-content-complete.

### D-AR8B-12 (locked): D-SW42-10 cross-library "to present" reconciliation fulfilled
All 151 divergent instances (134 forms.ts `date_ceiling: 2030` + 17 woodEvidence.ts `date_ceiling: 2026`) are reconciled to Pattern 3 (omit date_ceiling). 151/151 were genuine "to present" content per Op A-3; zero false positives. The canonical record now applies the omitted-means-present convention uniformly across forms.ts, woodEvidence.ts, the Blocks 30-40 evidence-library cluster, and styleFamilies.ts (D-SW42-8). The D-SW42-10 reconciliation flag is closed.

### D-AR8B-13 (locked): PHASE 2 SESSION 8b CLOSES → PHASE 2 FULLY CLOSED
Session 8b was the end-of-Phase-2 reconciliation pass gate work item per D-AR29-10. With Block 29 Issue 3 fulfilled (D-AR8B-11), the D-SW42-10 reconciliation closed (D-AR8B-12), and Issues 1/2/4/5 dispositioned (D-AR8B-7/D-AR8B-8), the gate is satisfied. **PHASE 2 SESSION 8b CLOSES.** **PHASE 2 IS FULLY CLOSED.** The next work is the Phase 3 engine architecture reshape per D-AP32-4 (per-layer structured outputs + overlap-timeline visualization + reconciliation-proposal logic + per-entry authority consumption replacing the hardcoded AUTHORITY_RANK).

### D-AR8B-FINAL (post-execution summary)
- Session 8b ship: 182 forms.ts `notes` rationales populated + 134 forms.ts `date_ceiling: 2030` stripped + 17 woodEvidence.ts `date_ceiling: 2026` stripped.
- **forms.ts**: 183/183 FORMS entries now carry `notes` (was 1/183); 0 entries carry `date_ceiling: 2030` (was 134). 16008 → 16056 lines (+182 notes lines − 134 date_ceiling lines = +48 net).
- **woodEvidence.ts**: 0 `period_associations` carry `date_ceiling: 2026` (was 17). 2288 → 2288 lines (date_ceiling was inline on the date_floor line; no line-count change).
- NO schema corrections (D-AR8B-5); `entryShape.ts` UNCHANGED.
- `lib/engine.ts` UNCHANGED per D-MM27-9 (diff = 0 lines; Op A-5 confirmed engine.ts does not read date_ceiling from either library — pure-content reconciliation).
- `styleFamilies.ts` UNCHANGED (Phase 2 Session 9 closure preserved).
- **All 31 canonical array lengths unchanged**: FORMS 183, SPECIES_EVIDENCE 26 … STYLE_REVIVAL_WAVES 108 / STYLE_FAMILIES 26 / STYLE_REASONING_RULES 6 — Session 8b is a field-population + field-omission pass with zero entry additions or removals.
- Files modified: **3** (`lib/constraints/forms.ts`; `lib/constraints/woodEvidence.ts`; `lib/constraints/AUDIT_LOG.md`).
- 13 numbered audit decisions captured under D-AR8B-N prefix (D-AR8B-1 through D-AR8B-13 + D-AR8B-FINAL).
- Block 29 Issue 3: FULFILLED (D-AR8B-11). D-SW42-10 reconciliation flag: CLOSED (D-AR8B-12). Block 29 Issues 1/2/5: confirmed dispositioned (D-AR8B-8). Block 29 Issue 4: deferred/dropped (D-AR8B-7).
- **PHASE 2 SESSION 8b: CLOSED.** **PHASE 2: FULLY CLOSED.** Next: Phase 3 engine architecture reshape per D-AP32-4.

---
## Phase 3 Block 0.5a — Schema Foundation (Path A first sub-block)
## Session 18+ / claude.ai-and-Claude-Code paired execution
## Base SHA: main 90fa53a (Session 8b endpoint / Phase 2 FULLY CLOSED)

Path A schema foundation for the Block 0.5 HCL migration. Bounded mechanical scope: 4 schema additions + 2 new library shells + audit log. No content authoring. No FK substitutions. No M2 migration. No forward-ref scrub. No `evidence.ts` deletion (all deferred to Blocks 0.5b/c/d per Path A). 7 files modified; tsc clean throughout. `lib/engine.ts` + `lib/constraints/styleFamilies.ts` + `lib/constraints/forms.ts` + `lib/evidence.ts` UNCHANGED.

### D-PH3HCL-S1-1 (locked): Block 0.5a scope per Path A schema foundation
First of 4 sub-blocks split from Block 0.5 per the gap-finding sweep A-7 divergence diagnostic (validation work was diverging, not converging — Pattern 5 recursive gap discovery surfaced 1-3 additional Phase 2 oversights per content-authoring round). Audit prefix `D-PH3HCL-S1-N`. Branch `feat/block-0-5a-schema-foundation`. No PR (claude.ai handles post-merge sync prompt). Subsequent sub-blocks: 0.5b (toolmarks + finish content), 0.5c (new joinery + hardware + woodEvidence entries), 0.5d (M2 migration + M4 Frame-R3 dual-field + forward-ref scrub + `evidence.ts` deletion + D-AR8B-6 correction).

### D-PH3HCL-S1-2 (locked): entryShape.ts CanonicalEntry additions
Three optional fields added to the `CanonicalEntry` base interface (entryShape.ts line 36 area; after `notes?`):
- `original_persistence?: "low" | "medium" | "high"` — Frame-R3 ORIGINAL-PIECE-PERSISTENCE frame (third FK pass A-2 + Block 0.5 Op A Q3 lock). Captures "is this evidence rarely replaced when present?" — HCL framing preserved alongside `replacement_likelihood`'s restoration-contamination framing. Two-field design preserves both semantics.
- `is_alteration_evidence?: boolean` — forward-applicable per Q1 promotion from finish-local field design. Flags entries that capture alteration intervention dating rather than original manufacture.
- `caution_text?: string` — AG1 lock; observation-discipline caution distinct from `AntiClassificationGuidance` (which captures crisp-date back-classification with required `boundary_date` + `boundary_type`). `caution_text` captures non-date-bounded observation cautions ("do not classify X as Y" rules).
All 3 fields optional + additive; 678+ existing canonical entries inherit them without breakage. tsc clean after edit.

### D-PH3HCL-S1-3 (locked): CutGrainUsageRole enum extension (5 → 11 values)
woodEvidence.ts line 147 area. Extended per third FK validation pass A-2 vocabulary granularity finding. Original 5 values preserved (`veneer_face`, `inlay_or_banding`, `premium_solid`, `decorative_accent`, `specialized_use`); 6 new values added per Mike's appraiser-vocabulary surfacing during HCL migration: `decorative_face`, `premium_solid_substitute`, `show_surface`, `figured_wood_economy`, `substrate_covering`, `repair_or_reveneering_evidence`. Additive; existing CutGrainEvidenceEntry usages of the original 5 values continue to compile.

### D-PH3HCL-S1-4 (locked): JoineryTypeEntry interface additions
joinery.ts line 95 area. Three optional fields added per Block 0.5 schema inspection:
- `assessment_layer?: "frame" | "upholstery" | "style_and_waves"` — engine routing field; existing 40 joinery type entries omit it (default "frame"); Block 0.5c new joinery type entries may set explicitly.
- `related_fastener_types?: string[]` — cross-library FK array to fasteners.ts type entries for joinery-fastener co-occurrence relationships.
- `position_on_piece?: PositionOnPiece[]` — structured location array per Decision 1 = L2. `PositionOnPiece` added to the file's import list from `./entryShape`.
`replacement_likelihood` is NOT added inline (inherits from CanonicalEntry per S1-2). 40 existing joinery type entries compile unchanged.

### D-PH3HCL-S1-5 (locked): HardwareTypeEntry interface addition
hardware.ts line 134 area. One optional field added per third FK pass A-4 Shape-R2:
- `position_on_piece?: PositionOnPiece[]` — structured location array per Decision 1 = L2. Coexists with the existing bare-string `common_observed_locations?: PhysicalLocation[]` (preserved for the 61 existing hardware type entries that use it). New hardware type entries authored with finer-grained appraiser-knowledge nuance use `position_on_piece`.
`PositionOnPiece` added to the file's import list. 61 existing hardware type entries compile unchanged.

### D-PH3HCL-S1-6 (locked): NEW FILE `lib/constraints/toolmarks.ts`
Empty library shell with 3 locked interfaces (`ToolmarkCategoryEntry` with `category_kind` enum, `ToolmarkTypeEntry` with `assessment_layer: "frame"` + `hand_vs_machine_classification` reused from joinery, `ToolmarkReasoningRule`), 3 empty arrays (`TOOLMARK_CATEGORIES`, `TOOLMARK_TYPES`, `TOOLMARK_REASONING_RULES`), 1 library-level constant (`TOOLMARK_ASSESSMENT_LAYER = "frame" as const`). 75 lines. Ready for Block 0.5b content population. Closes the Phase 2 toolmarks-library gap surfaced in Block 0 HCL inspection (HCL contained 4 toolmark keys without canonical home).

### D-PH3HCL-S1-7 (locked): NEW FILE `lib/constraints/finish.ts`
Empty library shell with 3 locked interfaces (`FinishCategoryEntry` with `category_kind` enum, `FinishTypeEntry` with `finish_chemistry` closed enum of 8 values, `FinishReasoningRule`), 3 empty arrays, 1 library-level constant (`FINISH_ASSESSMENT_LAYER = "frame" as const`). 76 lines. `is_alteration_evidence?` inherits from CanonicalEntry per S1-2 (no inline declaration needed). Closes the Phase 2 finish-library gap surfaced in Block 0 (2 HCL finish keys + 3 CWT finish keys without canonical home).

### D-PH3HCL-S1-8 (locked): Path A architectural reframe captured
Block 0.5 split into 4 sub-blocks per the comprehensive gap-finding sweep A-7 convergence diagnostic. The original Block 0.5 scope had accumulated ~14 schema modification surfaces + ~30 FK substitutions + 7 new canonical entries + 2 new libraries + `evidence.ts` deletion + 31 forward-ref scrubs — no longer a single coherent block. Path A bounds each sub-block to a coherent scope: 0.5a (schema; this block) / 0.5b (toolmarks + finish content) / 0.5c (new joinery + hardware + woodEvidence entries) / 0.5d (M2 migration + M4 + scrub + deletion). Pattern 5 (recursive canonical gap discovery) becomes block-local rather than cross-block; each sub-block can ship clean before the next begins.

### D-PH3HCL-S1-FINAL (post-execution summary)
- 7 files modified: 4 schema additions (entryShape.ts, woodEvidence.ts, joinery.ts, hardware.ts) + 2 new files (toolmarks.ts, finish.ts) + audit log.
- tsc clean across all 6 sub-batches (B-1 through B-6) and after Op C audit append.
- All existing canonical libraries unchanged: 678+ canonical entries inherit new optional fields without breakage; 40 joinery type entries compile unchanged; 61 hardware type entries compile unchanged; CutGrainEvidenceEntry usages of original 5 enum values continue to compile.
- `lib/engine.ts`: UNCHANGED (must remain 4098 lines).
- `lib/constraints/styleFamilies.ts`: UNCHANGED (must remain 3221 lines; Phase 2 Session 9 closure preserved).
- `lib/constraints/forms.ts`: UNCHANGED in 0.5a (M2 migration deferred to 0.5d).
- `lib/evidence.ts`: UNCHANGED (deletion deferred to 0.5d).
- All 31 canonical array lengths unchanged. `TOOLMARK_CATEGORIES` + `TOOLMARK_TYPES` + `TOOLMARK_REASONING_RULES` + `FINISH_CATEGORIES` + `FINISH_TYPES` + `FINISH_REASONING_RULES` exist as empty arrays; not counted in canonical-array totals until Block 0.5b populates content.
- **PHASE 3 BLOCK 0.5a: CLOSED.** Schema foundation locked. Subsequent sub-blocks (0.5b/c/d) build on this foundation.
- 9 D-PH3HCL-S1-N decisions captured (S1-1 through S1-8 + S1-FINAL).
- Next: Block 0.5b (toolmarks + finish content population) on Mike's authorization.

---
## Phase 3 Block 0.5c — New joinery + hardware + woodEvidence + woodIdentification entries (Path A sub-block 2 of 4)
## Session 18+ / claude.ai-and-Claude-Code paired execution
## Base SHA: main d125be4 (Block 0.5a schema foundation endpoint)

Block 0.5c authors 7 new canonical entries against the Block 0.5a-locked schemas: 4 new joinery types (factory_case_construction, glued_and_nailed_casework, dado_joint, plywood_drawer_bottom), 1 new hardware type (eastlake_brass_pull), 1 new cut_grain_phenomenon (veneer_thickness, parent), 1 new cut_grain_evidence (thick_veneer, child). Closes the Phase 2 joinery gaps (3 hard + 1 M2 routing) + hardware specificity gap + cut-grain decoupling per Block 21 D-CG21-5 precedent. Schema augmentation: +1 inline field on JoineryTypeEntry (`replacement_likelihood?`). `lib/engine.ts` + `lib/constraints/styleFamilies.ts` + `lib/constraints/forms.ts` + `lib/evidence.ts` + the Block 0.5a-created files (toolmarks.ts + finish.ts) UNCHANGED. 5 files modified.

### D-PH3HCL-S3-1 (locked): Block 0.5c scope per Path A sub-block 2 of 4
7 new canonical entries authored: 4 joinery types + 1 hardware type + 1 cut_grain_phenomenon + 1 cut_grain_evidence. Path A sequence (0.5a → 0.5c → 0.5b → 0.5d) reordered to ensure NEW_IN_BLOCK FKs in toolmark entries (Block 0.5b) resolve to existing joinery types after 0.5c ships. Audit prefix D-PH3HCL-S3-N. Branch `feat/block-0-5c-new-entries`. No PR.

### D-PH3HCL-S3-2 (locked): 4 new joinery types authored
- **`joinery_type_factory_case_construction`** (post-1870 industrial signal; 6 unique_traits + 6 identifying_characteristics + 2 period_associations + 9 position_on_piece locations + caution_text + regional_persistence_notes; FKs to 6 related joinery + 5 related fasteners). Closes Phase 2 gap surfaced in first FK validation pass.
- **`joinery_type_glued_and_nailed_casework`** (post-1880 budget-casework signal; 8/8 authority; 6 unique_traits + 6 identifying_characteristics + 3 period_associations + 10 position_on_piece locations + caution_text; FKs to 5 related joinery + 5 related fasteners). Closes Phase 2 gap.
- **`joinery_type_dado_joint`** (spans_eras; case-construction primitive missing from Phase 2 joinery library entirely; 6 unique_traits + 7 identifying_characteristics + 4 period_associations spanning 1700-2030 + 10 position_on_piece locations + caution_text). Closes the hard Phase 2 gap surfaced in second FK validation pass A-2 ("zero 'dado' entry existed anywhere in joinery.ts").
- **`joinery_type_plywood_drawer_bottom`** (post-1920 drawer-construction signal; parent_category_id `joinery_category_drawer`; 5 unique_traits + 6 identifying_characteristics + 3 period_associations + 4 position_on_piece locations + caution_text). HCL plywood_drawer_bottom key M2-routed to joinery (cross-library with woodEvidence substrate_evidence_plywood).

### D-PH3HCL-S3-3 (locked): JoineryTypeEntry inline schema augmentation
Added `replacement_likelihood?: "low" | "medium" | "high"` to `JoineryTypeEntry` interface in joinery.ts. The Block 0.5a Op B-3 plan assumed `replacement_likelihood` inherited from CanonicalEntry, but inspection during Block 0.5c B-2a tsc check confirmed CanonicalEntry only carries `replacement_risk?: number` (a distinct numeric-frame field) — the `replacement_likelihood` enum is declared inline on FastenerTypeEntry / HardwareTypeEntry / UpholsteryConstructionTypeEntry / UpholsteryCoverTypeEntry but NOT on the base. JoineryTypeEntry now joins those 4 libraries with an inline declaration. Additive optional field; existing 40 joinery type entries compile unchanged. The 4 new joinery types populate this field; the original 40 continue to omit it.

### D-PH3HCL-S3-4 (locked): hardware_type_eastlake_brass_pull authored
Preserves HCL's specificity to incised brass pulls (1870-1890 Eastlake-era anchor) as distinct from the broader `hardware_type_eastlake_hardware` type. 8/8 authority. 6 unique_traits + 7 identifying_characteristics + 3 period_associations + 3 style_associations (Eastlake / Late Victorian / Colonial-Revival-or-reproduction) + 4 position_on_piece locations + caution_text. `assessment_layer` inherits from parent category `hardware_category_specialty_and_era_diagnostic_hardware` per D-FA33-5 dual-assessment architecture (no inline `assessment_layer` field on HardwareTypeEntry — confirmed by Block 0.5c B-2b tsc check; the inline `assessment_layer: "frame"` originally drafted was correctly removed).

### D-PH3HCL-S3-5 (locked): cut_grain_phenomenon_veneer_thickness + cut_grain_evidence_thick_veneer authored
**Phenomenon (parent)**: `cut_grain_phenomenon_veneer_thickness` — 7/7 authority; `phenomenon_type: "veneer_slicing"`; 5 common_aliases + 5 unique_traits + 5 identifying_elements + 10 applicable_species + 1 applicable_substrate (engineered_substrate_plywood with cautious-use characteristic_expression) + 3 period_associations + 3 regional_patterns + 5 cousin_phenomenon_contrasts + caution_text. Decoupled from cut-method per Block 21 D-CG21-5 precedent: thickness is the structurally distinct observation, while cut method is captured separately through existing `hand_sawn_veneer` / `plain_sliced_veneer` / `rotary_cut_veneer` / `quarter_sliced_veneer` phenomena. Option B rename from `veneer_thickness_and_cut_method` to `veneer_thickness` preserves the D-CG21-5 decoupling.

**Evidence (child)**: `cut_grain_evidence_thick_veneer` — 7/7 authority; `cut_phenomenon_id` FK to the new phenomenon ✓; 3 period_associations + 4 regional_associations (see D-PH3HCL-S3-7 for WoodRegion enum mapping) + 6 usage_role values (drawing from CutGrainUsageRole 5→11 enum extension in Block 0.5a B-2: decorative_face, premium_solid_substitute, show_surface, figured_wood_economy, substrate_covering, repair_or_reveneering_evidence — all 6 new enum values utilized) + 11 style_wave_associations (8 family-level + 3 wave-level per third FK pass A-3) + diagnostic_caution_text.

### D-PH3HCL-S3-6 (locked): Substrate FK validation outcome — Sub-A applied
Per the substrate FK validation report: 4 traditional-substrate FKs Mike originally authored on the phenomenon entry (`substrate_solid_wood_secondary_core`, `substrate_softwood_secondary_core`, `substrate_poplar_secondary_core`, `substrate_pine_secondary_core`) hit NO_MATCH against the canonical SUBSTRATES inventory. Per Block 16 D-WI3 + Block 20 D-ES20-1 architectural lock, traditional substrates are captured at species level in NATURAL_WOOD_SPECIES (`usage_role: "primary_secondary"` etc.), NOT as substrate entries. Sub-A resolution applied: 4 NO_MATCH FKs dropped from `applicable_substrates`; only the VALID `engineered_substrate_plywood` remains. Traditional-substrate-applicability appraiser knowledge preserved in the entry's `description` prose (second paragraph explicitly names solid-wood secondary cores, softwood secondary cores, poplar, pine, and traditional pre-1850 substrate context). Sub-C (schema extension `applicable_species_as_substrate?` on CutGrainPhenomenonEntry) flagged as future-block candidate pending 3+ occurrence rule trigger (D-MM27-2).

### D-PH3HCL-S3-7 (locked): WoodRegion enum mapping for cut_grain_evidence_thick_veneer regional_associations
Mike's 3 free-form region strings (American urban cabinetmaking centers / American factory furniture regions / Rural, local shop, repair, and restoration contexts) were typed as `WoodRegion` enum (6 values: new_england / mid_atlantic / southern / midwest / appalachian / west_coast). Mapping applied:
- "American urban cabinetmaking centers" → **2** WoodRegionalAssociation entries: `mid_atlantic` (primary; Philadelphia/NY anchor) + `new_england` (Boston anchor) — both carry the same traits + complementary notes capturing the multi-region "urban cabinetmaking centers" framing.
- "American factory furniture regions" → **`midwest`** (Grand Rapids dominance anchor) + notes prose captures the broader factory-region framing (Grand Rapids, Chicago, Cincinnati, High Point, Jamestown).
- "Rural, local shop, repair, and restoration contexts" → **`appalachian`** (rural-persistence anchor per Phase 2 canonical convention) + notes prose captures the broader rural-context framing.
4 total `WoodRegionalAssociation` entries on the evidence entry (Mike's original 3 free-form regions expanded to 4 enum-typed entries).

### D-PH3HCL-S3-8 (locked): FK substitutions and within-block cross-references
All FK substitutions from validation passes 1-3 applied per-entry per the locked tables. Q1=Option D cut-nail type-tier upgrades applied Block-0.5c-wide. Pattern 8 prefix mismatches resolved. Style_wave references mixed-substituted per third FK pass A-3 (8 family-level + 3 wave-level). Within-block cross-references between the 4 new joinery types (factory_case_construction ↔ glued_and_nailed_casework ↔ dado_joint ↔ plywood_drawer_bottom) intact — all FKs resolve at ship. Cross-array FK from `cut_grain_evidence_thick_veneer.cut_phenomenon_id` to `cut_grain_phenomenon_veneer_thickness` resolves cleanly (phenomenon inserted FIRST per B-2c-i ordering).

### D-PH3HCL-S3-9 (locked): PositionOnPiece reshape + caution_text migration applied
Decision 1 = L2 PositionOnPiece reshape: 46 location strings across the 4 new joinery types + 1 new hardware type mapped to canonical PhysicalLocation enum (34 values) + appraiser-specific `physical_location_notes` supplements. Examples: "back panel attachment point" supplements `case_back`; "drawer underside" supplements `drawer_bottom`; "fall-front or drop-front" supplements `lid_or_top_movable`; "small drawer or gallery drawer" supplements `drawer_front`.

AG1 caution_text migration: 5 observation-discipline caution statements (4 joinery types + 1 phenomenon entry) authored in `caution_text?` field (inherits from CanonicalEntry per Block 0.5a B-1). AntiClassificationGuidance 4-field shape preserved unused per AG1 lock (continues to serve forms.ts crisp-date back-classification only).

### D-PH3HCL-S3-FINAL (post-execution summary)
- 5 files modified: `joinery.ts` (+4 entries, +1 inline schema field), `hardware.ts` (+1 entry), `woodIdentification.ts` (+1 phenomenon entry), `woodEvidence.ts` (+1 evidence entry), `AUDIT_LOG.md` (append).
- JOINERY_TYPES: 40 → **44** (+4); HARDWARE_TYPES: 43 → **44** (+1); CUT_GRAIN_PHENOMENA: 25 → **26** (+1); CUT_GRAIN_EVIDENCE: 35 → **36** (+1). Net **+7 new canonical entries**.
- JoineryTypeEntry interface +1 inline schema field (`replacement_likelihood?`) per D-PH3HCL-S3-3 — additive optional; existing 40 joinery type entries unchanged.
- tsc clean across all sub-batches (B-2a → B-2b → B-2c-i → B-2c-ii) and after Op C audit append.
- All existing canonical libraries compile unchanged.
- `lib/engine.ts`: UNCHANGED (must remain 4098 lines).
- `lib/constraints/styleFamilies.ts`: UNCHANGED (must remain 3221 lines).
- `lib/constraints/forms.ts`: UNCHANGED in 0.5c (M2 migration deferred to 0.5d).
- `lib/evidence.ts`: UNCHANGED (deletion deferred to 0.5d).
- `lib/constraints/toolmarks.ts` + `lib/constraints/finish.ts`: UNCHANGED (still empty shells; populated in 0.5b).
- `lib/constraints/entryShape.ts`: UNCHANGED (Block 0.5a additions preserved).
- 11 D-PH3HCL-S3-N decisions captured (S3-1 through S3-9 + S3-FINAL).
- **PHASE 3 BLOCK 0.5c: CLOSED.** 4 joinery gaps + 1 hardware specificity + 1 phenomenon-evidence pair landed cleanly.
- Next: Block 0.5b (toolmarks + finish content population) on Mike's authorization. Toolmark entries' NEW_IN_BLOCK FKs to the 4 new joinery types now resolve cleanly because 0.5c shipped first.

---
## Phase 3 Block 0.5b — Toolmarks + finish library content population (Path A sub-block 3 of 4)
## Session 18+ / claude.ai-and-Claude-Code paired execution
## Base SHA: main f6bb190 (Block 0.5c endpoint)

Block 0.5b populates the empty toolmarks.ts + finish.ts library shells created in Block 0.5a with 14 new canonical entries (6 toolmark + 8 finish). Closes the Phase 2 toolmarks + finish library gaps identified in Block 0 HCL/evidence.ts orphan inspection. All FK cross-references resolve cleanly thanks to Path A reorder (0.5c shipped first, so the 4 new joinery types referenced by toolmark entries exist canonically). `lib/engine.ts` + `lib/constraints/styleFamilies.ts` + `lib/constraints/forms.ts` + `lib/evidence.ts` + the Block 0.5a-modified files (entryShape.ts) and 0.5c-modified files (joinery.ts, hardware.ts, woodEvidence.ts, woodIdentification.ts) UNCHANGED. 3 files modified.

### D-PH3HCL-S2-1 (locked): Block 0.5b scope per Path A sub-block 3 of 4
14 new canonical entries authored across 2 library files: 6 toolmark entries (2 categories + 4 types) + 8 finish entries (3 categories + 5 types). Sub-block 3 in Path A sequence (0.5a → 0.5c → 0.5b → 0.5d). Reorder rationale: 0.5c shipped before 0.5b so toolmark entries' `related_joinery_types` FKs to factory_case_construction / glued_and_nailed_casework / dado_joint / plywood_drawer_bottom resolve cleanly (rather than as NEW_IN_BLOCK forward-references). Audit prefix `D-PH3HCL-S2-N`. Branch `feat/block-0-5b-toolmarks-finish-content`. No PR.

### D-PH3HCL-S2-2 (locked): toolmarks.ts populated
- **2 categories**: `toolmark_category_saw_marks` (7/7; category_kind "saw_marks"), `toolmark_category_plane_marks` (7/7; category_kind "plane_marks").
- **4 types**: `toolmark_type_pit_saw_marks` (8/8; hand_vs_machine "strongly_early"; pre-1830 anchor with rural persistence to 1870), `toolmark_type_circular_saw_arcs` (8/8; "strongly_industrial"; post-1830 broad, post-1880 dominant), `toolmark_type_band_saw_lines` (8/8; "strongly_industrial"; post-1850 broad, post-1870 dominant), `toolmark_type_hand_plane_chatter` (7/7; "strongly_early"; pre-1880 strongest, persists in craft/repair/custom contexts).
- All 4 types `assessment_layer: "frame"`. Closes Phase 2 toolmarks-library gap surfaced in Block 0 HCL inspection (HCL contained 4 toolmark keys with no canonical home).

### D-PH3HCL-S2-3 (locked): finish.ts populated
- **3 categories**: `finish_category_natural_finish` (6/6; category_kind "natural_finish"), `finish_category_synthetic_finish` (7/7; "synthetic_finish"), `finish_category_alteration_finish` (8/8; "alteration_finish").
- **5 types**: `finish_type_shellac_crazing` (7/7; finish_chemistry "shellac"; 1800-1920 strongest), `finish_type_polyurethane` (8/8; "polyurethane"; post-1960 hard-negative for pre-1960 claims), `finish_type_shellac_intact` (6/6; "shellac"; 1800-1920 strongest as preserved finish), `finish_type_oil_finish_patina` (6/6; "oil"; broad all-era), `finish_type_refinished_surface` (8/8; "other"; alteration evidence spans all eras).
- All 5 types `assessment_layer: "frame"`. Closes Phase 2 finish-library gap (2 HCL keys + 3 CWT-only keys with no canonical home).

### D-PH3HCL-S2-4 (locked): FK substitutions applied per validation pass 1
Across the 4 toolmark types' `related_joinery_types` + `related_fastener_types` arrays: `pinned_mortise_and_tenon → pegged_mortise_and_tenon` (canonical synonym); `mortise_and_tenon → joinery_category_mortise_and_tenon_family` (granularity downgrade — category-tier substitute when type-level overdetermined); `hand_fitted_drawer_construction → hand_cut_drawer_dovetails` (dominant hand-fitted joint); `machine_cut_dovetails → machine_cut_drawer_dovetails` (canonical "drawer" qualifier); `machine_screws → fastener_subcategory_machine_cut_screws` (canonical naming); `hand_cut_or_filed_screws → fastener_subcategory_handmade_screws` (canonical naming); Q1=D cut-nail type-tier upgrades: `early_cut_nails → fastener_type_early_hand_headed_cut_nail` + `machine_cut_nails → fastener_type_machine_headed_cut_nail`; `doweled_factory_construction → joinery_type_dowel_joinery` substitute.

### D-PH3HCL-S2-5 (locked): Q2 type-tier upgrades to 0.5c-authored joinery types
`circular_saw_arcs` + `band_saw_lines` now FK directly to `joinery_type_factory_case_construction` + `joinery_type_glued_and_nailed_casework` (and `circular_saw_arcs` also FKs to `joinery_type_factory_case_construction` + `joinery_type_glued_and_nailed_casework`; `band_saw_lines` FKs to `joinery_type_factory_case_construction` + `joinery_type_dowel_joinery`). Per Q2 lock — appraiser-fidelity preserved at canonical type-tier rather than category-tier substitutes. NEW_IN_BLOCK forward-references that drove Path A reorder are now resolved canonically because 0.5c shipped first.

### D-PH3HCL-S2-6 (locked): PositionOnPiece reshape applied (Decision 1 = L2)
46+ location strings across the 9 type entries (4 toolmark + 5 finish) mapped to canonical 34-value PhysicalLocation enum + appraiser-specific `physical_location_notes` supplements. Examples: "drawer bottom" → `drawer_bottom`; "case back" → `case_back`; "backboard" → `backboard`; "secondary structural board" → `case_interior_framing` + notes; "later replacement component" → `case_carcass` + notes; "curved cutout component" → `show_surface` + notes; "stretcher member" → `frame_rail` + notes; "protected edge" → `edge_or_corner_protection` + notes; "carved detail surface" → `trim_or_molding` + notes; "high-wear use surface" → `show_surface` + notes; "refinished show surface" → `show_surface` + notes; "hardware shadow on show surface" → `show_surface` + notes; "foot" → `foot_or_leg` + notes. All location strings preserve Mike's appraiser-specific descriptive intent via the supplement field per Section 2 mapping.

### D-PH3HCL-S2-7 (locked): caution_text migration applied (AG1 lock)
9 observation-discipline caution statements (4 toolmark types + 5 finish types) authored in `caution_text?` field (inherits from CanonicalEntry per Block 0.5a Op B-1). AntiClassificationGuidance 4-field shape preserved unused per AG1 lock (continues to serve forms.ts crisp-date back-classification only).

### D-PH3HCL-S2-8 (locked): finish_chemistry closed enum populated per Q1 lock
5 finish type entries populate the closed enum: `shellac_crazing` → "shellac"; `polyurethane` → "polyurethane"; `shellac_intact` → "shellac"; `oil_finish_patina` → "oil"; `refinished_surface` → "other" (refinishing IS the alteration; chemistry can vary across refinishing campaigns so "other" is the appraiser-honest classification).

### D-PH3HCL-S2-9 (locked): is_alteration_evidence populated on 5 finish type entries
`refinished_surface` = `true` (consistent with `finish_category_alteration_finish` boundary); the other 4 finish types = `false` (natural and synthetic finishes can be original or replacement; the field flags the alteration-as-its-own-phenomenon class only). Toolmark entries do not populate this field (not applicable — toolmarks are production-surface evidence, not alteration evidence).

### D-PH3HCL-S2-10 (locked): refinished_surface omits original_persistence intentionally
The `refinished_surface` entry intentionally omits `original_persistence?` per Mike's authoring intent — the field doesn't semantically apply to alteration-as-its-own-phenomenon evidence (refinishing IS the alteration; the "is this rarely replaced when present?" question is malformed for an alteration-identity entry). Captured as a forward-applicable design pattern: alteration-evidence entries may omit `original_persistence?` when the field doesn't semantically apply to the alteration class.

### D-PH3HCL-S2-FINAL (post-execution summary)
- 3 files modified: `toolmarks.ts` (populated from empty shells → 2 categories + 4 types + 0 rules), `finish.ts` (populated → 3 categories + 5 types + 0 rules), `AUDIT_LOG.md` (append).
- TOOLMARK_CATEGORIES: 0 → **2**; TOOLMARK_TYPES: 0 → **4**; FINISH_CATEGORIES: 0 → **3**; FINISH_TYPES: 0 → **5**. Net **+14 new canonical entries**.
- tsc clean after each sub-batch (B-2a, B-2b) and after Op C audit append.
- All existing canonical libraries compile unchanged.
- `lib/engine.ts`: UNCHANGED (must remain 4098 lines).
- `lib/constraints/styleFamilies.ts`: UNCHANGED (must remain 3221 lines).
- `lib/constraints/forms.ts`: UNCHANGED in 0.5b (M2 migration deferred to 0.5d).
- `lib/evidence.ts`: UNCHANGED (deletion deferred to 0.5d).
- All 0.5c-modified files (joinery.ts, hardware.ts, woodEvidence.ts, woodIdentification.ts) and 0.5a-modified files (entryShape.ts): UNCHANGED.
- 11 D-PH3HCL-S2-N decisions captured (S2-1 through S2-10 + S2-FINAL).
- **PHASE 3 BLOCK 0.5b: CLOSED.** 6 toolmark + 8 finish entries landed cleanly; Phase 2 toolmarks + finish library gaps closed.
- Next: Block 0.5d (M2 migration + M4 Frame-R3 dual-field + forward-ref scrub + `evidence.ts` deletion + D-AR8B-6 correction) on Mike's authorization. With 0.5a + 0.5c + 0.5b shipped, evidence.ts orphan can now be deleted cleanly because all HCL content has been migrated to canonical libraries.

---

# PHASE 3 BLOCK 0.5d — M2 + M4 + scrub + evidence.ts deletion (D-PH3HCL-S4-N range)

## D-PH3HCL-S4-1 — Block scope
Final Path A sub-block: 17 M2 notes-extensions (16 A-2 keys + 1 CWT frame_and_panel) + M4 Frame-R3 dual-field on 3 fastener/substrate entries + 31 forward-reference scrub + evidence.ts deletion + D-AR8B-6 correction. CWT extension #18 solid_board_drawer_bottom DROPPED per Mike's mid-batch resolution (no clean canonical target; not authored inline this block).

## D-PH3HCL-S4-2 — M2 migration per A-2-locked mapping
Used the original Block 0 Op A A-2 M2 mapping (16 keys) per Mike's Q1 lock. The prompt's alternative M2 list was discarded — it contained 5 M1-classified fasteners (direct match, no migration needed) plus non-HCL keys. 17 notes-extensions applied total: 16 HCL keys + 1 CWT extension (frame_and_panel). Each extension preserves existing notes content verbatim and appends an attribution clause naming HCL key, typical_date_range, and indicator_text (or CWT base + replacement_risk + reason for the CWT extension).

## D-PH3HCL-S4-3 — M4 Frame-R3 dual-field
Three target entries received Frame-R3 fields per Q4 lock:
- fastener_type_phillips_wood_screw: replacement_likelihood "high" + original_persistence "high"
- fastener_subcategory_machine_staples: replacement_likelihood "high" + original_persistence "low" (Mike's Q2 staple-target confirmation)
- substrate_evidence_plywood: original_persistence "high" ONLY; replacement_likelihood field intentionally NOT added per Q4 HARD-NEGATIVE — plywood is a categorical date disqualifier rather than restoration-contamination evidence.

## D-PH3HCL-S4-4 — Forward-reference scrub
31 forward-references to HISTORICAL_CLUE_LIBRARY scrubbed across forms.ts (24), constructionLogic.ts (5), and _style_observations_backlog.md (2). Replacement text names the actual canonical libraries that now host the clue content: toolmarks.ts, finish.ts, joinery.ts, fasteners.ts, woodEvidence.ts. AUDIT_LOG.md HCL references preserved unchanged as historical-decision-marker records.

## D-PH3HCL-S4-5 — evidence.ts deletion
lib/evidence.ts (554-line orphan) DELETED. HISTORICAL_CLUE_LIBRARY content (35 keys) fully migrated across Path A series (0.5a schema + 0.5c new entries + 0.5b authoritative content + 0.5d M2/M4 + drop). CLUE_WEIGHT_TABLE (45 keys) abandoned per Block 0 held-back default (no production consumers; weighting will be re-derived in Block 1 Foundation). 9 utility functions abandoned. Zero production consumers existed at deletion time (verified at Block 0 Op A inspection).

## D-AR8B-6 CORRECTION
Audit correction: the original D-AR8B-6 entry (recorded under the Phase 3 audit-recovery series) characterized HCL/CWT as "Phase 2 closed — orphan held back per safety default." That framing was incomplete. Corrected framing: HCL/CWT were 35+45 prototype orphans whose 35 HCL content keys carried real appraiser-knowledge value worth migrating to canonical libraries (executed across Block 0.5 Path A series); CWT weighting content is deferred to Block 1 Foundation re-derivation rather than literal migration. Phase 2's "actually closed" status was therefore conditional on Path A completion. With Block 0.5d shipped, Phase 2 is now ACTUALLY FULLY CLOSED.

## D-PH3HCL-S4-6 — Phase 2 fully-closed framing
With Block 0.5d shipped, all 4 Path A sub-blocks (0.5a / 0.5c / 0.5b / 0.5d) are complete. 21 new canonical entries authored across the Path A series; HCL content fully migrated; evidence.ts orphan deleted. Phase 2 is now ACTUALLY FULLY CLOSED (correcting the D-AR8B-6 conditional close).

## D-PH3HCL-S4-7 — Forward-applicable conventions
Patterns 5/8/9/10 (recursive gap discovery / prefix-mismatch / vocabulary granularity drift / shape mismatch) + AG1 (anti-classification guidance) + Frame-R3 (dual-field restoration-contamination + persistence) + Sub-A (substrate-FK NO_MATCH preserved-in-prose) + S2-10 alteration-evidence pattern (e.g., refinished_surface intentionally omits original_persistence) all confirmed as forward-applicable conventions for Block 1 Foundation and beyond.

## D-PH3HCL-FINAL — Path A series CLOSED
Closes the Path A series. 4 sub-blocks shipped; 21 new canonical entries authored; 17 M2 notes-extensions applied; 3 M4 Frame-R3 entries populated; 31 forward-refs scrubbed; evidence.ts deleted (554 lines removed); D-AR8B-6 corrected. PHASE 2: NOW ACTUALLY FULLY CLOSED. Next: Block 1 Foundation on Mike's authorization (W0a binding + W0b field-naming + W4 absorbed + tests + weighting.ts deletion).
