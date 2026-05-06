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


