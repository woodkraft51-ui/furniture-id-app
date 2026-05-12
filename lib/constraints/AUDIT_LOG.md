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


