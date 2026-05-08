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


