// upholsteryConstruction.ts
//
// Upholstery construction library. Phase 2 Session 7 fifth and
// FINAL library (four-file evidence libraries architecture
// extended to five: joinery Blocks 30-31; fasteners Blocks
// 33-34; hardware Blocks 35-36; upholstery covers Blocks 37-38;
// upholstery construction Blocks 39-40). Block 39 ships schema
// foundation + 9 categories + 7 reasoning rules + empty types
// scaffold + SECOND concrete application of D-UC37-3 two-
// assessment-with-sub-output-surfacing convention (evidence_sub
// _layer = "system"); Block 40 ships ~31 UPHOLSTERY_CONSTRUCTION
// _TYPES content authoring from American_Furniture_Textile
// _Reference.docx construction section (paragraphs 438-761) and
// closes Phase 2 Session 7.
//
// Architecture per Block 39 D-UCN39-1 through D-UCN39-13:
// - UpholsteryConstructionCategoryEntry: 9 type-bearing category
//   entries per D-UCN39-1 + A-4 (canonical source has 11
//   sections; 2 — Diagnostic Cross-Checks + Dating Cheat Sheet
//   — are operational/reasoning-rule content, NOT type-bearing
//   categories). All entries route to assessment_layer
//   "upholstery" + evidence_sub_layer "system" at library level
//   per D-UCN39-3 + D-UCN39-4 (SECOND application of D-UC37-3
//   convention; SECOND library-level "upholstery" assessment
//   _layer application after upholstery covers).
// - UpholsteryConstructionTypeEntry: per-type entries; Block 40
//   authors ~31. Schema includes 4 FK fields per D-UCN39-8:
//   1 intra-library (related_construction_types) + 3 cross-
//   library (related_fastener_types, related_hardware_types,
//   related_joinery_types). NO related_cover_types field per
//   D-UCN39-7 single-directional cross-library FK convention
//   (covers → construction forward-references handle the cross-
//   library relationship; construction does not reverse-FK).
// - UpholsteryConstructionReasoningRule: 7 meta-rule entries per
//   D-UCN39-5 (SECOND application of D-UC37-7 expanded reasoning
//   rule set convention). cross_layer_scope: true on Rule #1
//   (construction_alone_never_dates_frame) + Rule #5
//   (construction_evidence_layer_independence; SEVENTH canonical
//   -library encoding of Independent Layer Evaluation Standard
//   per D-UCN39-9).
// - UpholsteryConstructionMakerAssociation: library-local
//   interface (NOT promoted to entryShape.ts per D-UCN39-6 +
//   schema-occurrence rule doesn't fire). Block 40 leaves
//   maker_associations: [] empty arrays for ALL type entries
//   per D-UCN39-6 SCHEMA-PRESENT-CONTENT-DEFERRED discipline
//   (D-HW35-6 application).
// - Two-assessment-with-sub-output-surfacing convention SECOND
//   application per D-UCN39-3: construction library declares
//   assessment_layer "upholstery" + evidence_sub_layer "system"
//   at library level (parallels upholstery covers library
//   evidence_sub_layer "cover" at Block 37 D-UC37-3). Engine
//   surfaces upholstery system date + visible cover date as
//   SUB-OUTPUTS within unified upholstery assessment section on
//   report.
// - engine.ts UNCHANGED per Phase 2 / Phase 3 separation.

import type {
  CanonicalEntry,
  PeriodAssociation,
  StyleAssociation,
  AntiClassificationGuidance,
  ReasoningRuleMigrationTarget,
  PhysicalLocation,
} from "./entryShape";

/**
 * Library-level assessment routing constants per D-FA33-5 dual-
 * assessment architecture + D-UC37-3 two-assessment-with-sub-
 * output-surfacing convention. SECOND concrete application of
 * D-UC37-3 (D-UCN39-3) — parallels upholstery covers library
 * UPHOLSTERY_COVERS_ASSESSMENT_LAYER = "upholstery" +
 * UPHOLSTERY_COVERS_EVIDENCE_SUB_LAYER = "cover" at Block 37.
 *
 * Engine reads these constants for library-level routing to
 * "upholstery" assessment section with "system" sub-output
 * identification. Construction-axis evidence aggregates to the
 * "upholstery system date" sub-output (when the upholstery
 * foundation system was installed); covers-axis evidence
 * aggregates to the "visible cover date" sub-output. Both
 * sub-outputs surface within the unified upholstery assessment
 * section on report per D-UC37-3.
 */
export const UPHOLSTERY_CONSTRUCTION_ASSESSMENT_LAYER = "upholstery" as const;
export const UPHOLSTERY_CONSTRUCTION_EVIDENCE_SUB_LAYER = "system" as const;

/**
 * UpholsteryConstructionCategoryEntry — top-level upholstery
 * construction category per Block 39 D-UCN39-1. 9 type-bearing
 * categories per American_Furniture_Textile_Reference.docx
 * construction section (Op A-4 enumeration; canonical source
 * has 11 sections — Diagnostic Cross-Checks + Dating Cheat
 * Sheet are operational/reasoning-rule content, NOT type-
 * bearing categories). All entries carry assessment_layer
 * "upholstery" + evidence_sub_layer "system" per D-UCN39-3 +
 * D-UCN39-4 library-level uniform routing.
 *
 * Field roster:
 * - category: literal "upholstery_construction_category"
 * - name: canonical category name verbatim from seed
 * - category_description: prose description from seed
 * - unique_category_traits: array from seed
 * - core_identifying_elements?: optional bullet array per
 *   D-JN30-9 + D-FA33-Surfacing-2 field-naming variance
 *   precedent
 * - assessment_layer: literal "upholstery" per D-UCN39-4
 *   SECOND library-level application
 * - evidence_sub_layer: literal "system" per D-UCN39-3 sub-
 *   output routing mechanism
 */
export interface UpholsteryConstructionCategoryEntry extends CanonicalEntry {
  category: "upholstery_construction_category";
  name: string;
  category_description: string;
  unique_category_traits: string[];
  core_identifying_elements?: string[];
  assessment_layer: "upholstery";
  evidence_sub_layer: "system";
}

/**
 * UpholsteryConstructionTypeEntry — per-construction-type
 * canonical entry per Block 39 D-UCN39-1. Flat fields parallel
 * to MakerMarkEntry + JoineryTypeEntry + FastenerTypeEntry +
 * HardwareTypeEntry + UpholsteryCoverTypeEntry pattern. Block 40
 * authors ~31 entries per Op A-5 + Surfacing 3.
 *
 * Field roster:
 * - category: literal "upholstery_construction_type"
 * - name: construction type name verbatim from seed
 * - parent_category_id: FK to UpholsteryConstructionCategoryEntry.id
 * - description: prose from seed
 * - unique_traits: array from seed
 * - identifying_characteristics: array from seed
 * - period_associations: PeriodAssociation[] from seed DATE
 *   RANGE
 * - date_range_summary: prose summary from seed
 * - style_associations?: StyleAssociation[] per D-UC37-5 sparse
 *   population — construction canonical content is largely
 *   style-silent (foundation / springs / padding / attachment
 *   are functional not decorative); expected ~0-5 entries
 * - maker_associations?: UpholsteryConstructionMakerAssociation[]
 *   per D-UCN39-6 SCHEMA-PRESENT-CONTENT-DEFERRED (Block 40
 *   leaves arrays EMPTY for ALL type entries; no canonical
 *   maker content in construction source)
 * - common_observed_locations?: PhysicalLocation[] —
 *   identification helper per D-FA33-6; construction entries
 *   typically populate upholstery_support_layer /
 *   upholstery_seat / upholstery_back / upholstery_attachment
 *   _point values
 * - anti_classification_guidance?: AG entry on industrial-
 *   introduction-boundary construction types (Latex Foam 1930+,
 *   Polyurethane Foam 1950+, Polyester Fiberfill 1950+,
 *   Elastic Webbing 1940+, Sinuous/Serpentine Spring 1930+,
 *   Memory Foam 1990+, Early Coil Spring boundary) per Block 40
 *   Op A AG candidate identification; most apply D-HW36-15
 *   decade-range AG-floor interpretation discipline
 * - replacement_likelihood: "low" | "medium" | "high" per
 *   D-AP32-3. Construction has nuanced replacement_likelihood
 *   semantics — intra-system components are partially
 *   replacement-prone (latex foam dries; serpentine springs
 *   sag; webbing degrades), but per D-UC37-3 + Rule #2 the
 *   SYSTEM AS A WHOLE dates the upholstery campaign (system
 *   sub-output), not the original frame
 * - related_construction_types?: intra-library FK
 * - related_fastener_types?: cross-library FK to fasteners.ts
 *   per D-UCN39-8 (attachment evidence — Cat 9 Fasteners and
 *   Upholstery Attachment Clues entries reference fasteners
 *   Cat 3 STAPLES + upholstery tacks)
 * - related_hardware_types?: cross-library FK to hardware.ts
 *   per D-UCN39-8 (Cat 9 Decorative Brass Nails/Nailhead Trim
 *   references hardware UPHOLSTERY HARDWARE category)
 * - related_joinery_types?: cross-library FK to joinery.ts per
 *   D-UCN39-8 (App-Friendly Hierarchy "Frame evidence first:
 *   joinery, wood, tool marks, fasteners, form" cross-
 *   references where canonical-source warrant exists)
 *
 * NOTE: NO related_cover_types field per D-UCN39-7 single-
 * directional cross-library FK convention (D-FA33-8). Covers →
 * construction forward-references (Block 38 D-UC38-7) handle
 * the cross-library relationship; construction library does NOT
 * carry reverse-FK to covers.
 */
export interface UpholsteryConstructionTypeEntry extends CanonicalEntry {
  category: "upholstery_construction_type";
  name: string;
  parent_category_id: string;
  description: string;
  unique_traits: string[];
  identifying_characteristics: string[];
  period_associations: PeriodAssociation[];
  date_range_summary: string;
  style_associations?: StyleAssociation[];
  maker_associations?: UpholsteryConstructionMakerAssociation[];
  common_observed_locations?: PhysicalLocation[];
  anti_classification_guidance?:
    | AntiClassificationGuidance
    | AntiClassificationGuidance[];
  replacement_likelihood: "low" | "medium" | "high";
  related_construction_types?: string[];
  related_fastener_types?: string[];
  related_hardware_types?: string[];
  related_joinery_types?: string[];
  regional_persistence_notes?: string;
}

/**
 * UpholsteryConstructionMakerAssociation — library-local
 * associative interface per Block 39 D-UCN39-6. NOT promoted to
 * entryShape.ts; schema-occurrence rule does not fire for
 * upholstery-construction-only structure.
 *
 * Per D-UCN39-6 SCHEMA-PRESENT-CONTENT-DEFERRED discipline
 * (D-HW35-6 application): Block 40 leaves maker_associations
 * arrays EMPTY on ALL upholstery construction type entries.
 * Construction canonical source has ZERO upholstery-shop or
 * spring/foam-manufacturer documentation; per-type content
 * deferred to validation-phase one-offs + post-launch
 * systematic authoring with NO scheduled Block-N authoring
 * plan.
 */
export interface UpholsteryConstructionMakerAssociation {
  maker_name: string;
  date_floor?: number;
  date_ceiling?: number;
  attribution_notes?: string;
}

/**
 * UpholsteryConstructionReasoningRule — meta-rule entries per
 * Block 39 D-UCN39-5 SECOND application of D-UC37-7 expanded
 * reasoning rule set convention. 7 entries authored Block 39
 * (canonical-source rigor; parallels upholstery covers library
 * 7-rule count). Per D-UCN39-5 Surfacing 2: the 5 canonical
 * Diagnostic Cross-Checks "If You Find X" patterns CONSOLIDATE
 * into Rule #3 layer_consistency_check (they are operational
 * sub-content of the layer-consistency principle, not 5
 * independent rules).
 *
 * Authority 9/9 per meta-rule supremacy precedent (D-WE26-8 /
 * D-MM27-5); migration_status "complete" per D-WE26-11
 * convention.
 *
 * cross_layer_scope: true on exactly 2 rules: Rule #1
 * (construction_alone_never_dates_frame; meta-rule supremacy)
 * + Rule #5 (construction_evidence_layer_independence; SEVENTH
 * canonical-library encoding of Independent Layer Evaluation
 * Standard per D-UCN39-9).
 *
 * Rule #6 reupholstery_campaign_warning is a NEW canonical
 * reasoning-rule TYPE per D-UCN39-12 (seventh new evidence-
 * library reasoning-rule TYPE after restoration_false_signals
 * + replacement_fastener_risk + restoration_contamination +
 * reproduction_hardware_warning + cover_revival_warning +
 * cover_axis_sub_output_routing).
 *
 * Rule #7 system_axis_sub_output_routing is the SECOND
 * application of the sub_output_routing rule TYPE (parallels
 * upholstery covers library Rule #7 cover_axis_sub_output
 * _routing per D-UC37-13).
 */
export interface UpholsteryConstructionReasoningRule extends CanonicalEntry {
  category: "upholstery_construction_reasoning_rule";
  rule_name: string;
  rule_statement: string;
  rationale: string;
  migration_target: ReasoningRuleMigrationTarget;
  applies_to_entry_types?: string[];
  cross_layer_scope?: boolean;
}

/**
 * UPHOLSTERY_CONSTRUCTION_CATEGORIES — 9 type-bearing upholstery
 * construction categories per Block 39 D-UCN39-1. Per D-UCN39-10
 * authority calibration: 3 categories at 8/8 (Coil Spring
 * Construction + Serpentine/Sinuous/Zigzag Springs + Foam and
 * Synthetic Cushion Materials — AG-anchor + canonical-rigor
 * categories); 6 categories at 7/7 (No-Spring Upholstery +
 * Webbing Systems + Natural Stuffing and Padding + Feather and
 * Down Fill + Layering Textiles and Foundation Covers +
 * Fasteners and Upholstery Attachment Clues — medium-strong
 * canonical-source rationale).
 *
 * ALL 9 categories carry assessment_layer "upholstery" +
 * evidence_sub_layer "system" per D-UCN39-3 + D-UCN39-4 library-
 * level uniform routing (SECOND library-level "upholstery"
 * assessment_layer application after upholstery covers; no
 * per-category overrides).
 */
export const UPHOLSTERY_CONSTRUCTION_CATEGORIES: UpholsteryConstructionCategoryEntry[] = [
  {
    id: "upholstery_construction_category_no_spring_upholstery",
    category: "upholstery_construction_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Upholstery foundation built without springs — stuffed slip seats and stuffed-over-the-rail construction; defined by ABSENCE of spring system; 1600s-present with strongest pre-spring-era and continued slip-seat use.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section No-Spring Upholstery (paragraph 446). 7/7 per A-8 (medium-strong; category defined by absence of springs). Block 40 authoring populates 2 types: Stuffed Slip Seat, Stuffed Over-the-Rail Upholstery. assessment_layer 'upholstery' + evidence_sub_layer 'system' per D-UCN39-3.",
    name: "No-Spring Upholstery",
    category_description: "Upholstery foundation construction built without any spring system — padding and stuffing applied directly over webbing, solid seat board, or rails. Stuffed slip seats (removable padded panels dropping into a frame rabbet) and stuffed-over-the-rail upholstery (padding wrapped over and tacked to the seat rails) are the two canonical no-spring foundation methods. Spans the pre-spring era (1600s-early 1800s) and continues through present in slip-seat side chairs and reproduction work.",
    unique_category_traits: [
      "Foundation built WITHOUT a spring system",
      "Padding/stuffing applied directly over webbing, seat board, or rails",
      "Pre-spring-era origin with continued slip-seat persistence",
      "Stuffed slip seat (removable) vs stuffed-over-the-rail (fixed) construction methods",
    ],
    core_identifying_elements: [
      "No coil or serpentine springs present in the foundation",
      "Padding compressed directly against webbing / board / rails",
      "Slip seat: removable padded panel + frame rabbet",
      "Over-the-rail: padding wrapped + tacked over seat rails with visible tack line",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "system",
  },
  {
    id: "upholstery_construction_category_webbing_systems",
    category: "upholstery_construction_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Interlaced textile-strap foundation support: traditional linen/hemp/jute webbing (1700s-present) + elastic webbing (20th-century, strongest post-1940s); proves an upholstered support system but not frame age.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section Webbing Systems (paragraphs 466-483). 7/7 per A-8. Block 40 authoring populates 2 types: Linen/Hemp/Jute Webbing, Elastic Webbing (post-1940s AG candidate). Cross-library FK target for Block 38 covers forward-reference upholstery_cover_type_upholstery_webbing per D-UC38-7 + Surfacing 5 (Block 40 aligns covers FK id).",
    name: "Webbing Systems",
    category_description: "Interlaced textile-strap foundation systems stretched across the seat or back frame to support upholstery. Traditional linen, hemp, or jute webbing (wide woven straps tacked to the rails; 1700s-present) provides the historic foundation support method. Elastic webbing (stretchy rubberized or synthetic straps replacing fixed jute; 20th-century, strongest post-1940s) is the modern substitute. Webbing proves an upholstered support system; it does not by itself prove the age of the frame.",
    unique_category_traits: [
      "Interlaced textile straps stretched across frame",
      "Traditional fixed webbing (linen/hemp/jute) vs modern elastic webbing",
      "Foundation support function (not visible upholstery)",
      "Webbing proves an upholstered support system, NOT frame age",
    ],
    core_identifying_elements: [
      "Wide woven straps crossing under seat or behind back",
      "Hand-tacked natural webbing with old oxidation = 18th-20th century; staples = later repair",
      "Elastic straps (often black/green/tan/striped, stapled or clipped) = 20th-century, especially mid-century onward",
      "Webbing attachment method (tacks vs staples vs clips) is a campaign-dating clue",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "system",
  },
  {
    id: "upholstery_construction_category_coil_spring_construction",
    category: "upholstery_construction_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Coil-spring foundation construction: early coil springs (late-1700s experimental, early-mid-1800s practical) + hand-tied coil springs + drop-in spring units + Marshall/pocket coils; PRIMARY DATING-EVIDENCE CATEGORY per coil-spring industrial-introduction anchor.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section Coil Spring Construction (paragraphs 484-519). 8/8 per A-8 (Early Coil Spring industrial-introduction anchor; hand-tied coil spring construction has rich canonical content). Block 40 authoring populates 4 types: Early Coil Spring, Hand-Tied Coil Springs, Drop-In Spring Unit, Marshall/Pocket Coil. assessment_layer 'upholstery' + evidence_sub_layer 'system'.",
    name: "Coil Spring Construction",
    category_description: "Helical coil-spring foundation systems supporting the seat or back. Early coil springs (late-1700s experimental; early-to-mid-1800s practical adoption) mark the introduction of sprung upholstery. Hand-tied coil springs (individually knotted with twine into an eight-way hand-tied deck) are the canonical 19th-century-into-20th-century method. Drop-in spring units (pre-assembled spring decks) and Marshall/pocket coils (individually fabric-pocketed springs) are later industrial refinements. Coil-spring presence dates the upholstery campaign to the sprung-upholstery era; it does not by itself date the frame.",
    unique_category_traits: [
      "Helical coil-spring foundation",
      "Early Coil Spring marks introduction of sprung upholstery (late-1700s/early-1800s)",
      "Hand-tied eight-way construction = canonical 19th-20th century method",
      "Drop-in spring units + Marshall/pocket coils = later industrial refinements",
    ],
    core_identifying_elements: [
      "Helical coil springs visible under deck or in cushion",
      "Eight-way hand-tied twine knotting pattern on traditional construction",
      "Pre-assembled spring deck = drop-in unit; fabric-pocketed individual springs = Marshall/pocket coil",
      "Spring-tie twine condition + knotting style is a campaign-dating clue",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "system",
  },
  {
    id: "upholstery_construction_category_serpentine_sinuous_and_zigzag_springs",
    category: "upholstery_construction_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Continuous S-curved wire spring systems: sinuous/serpentine springs (post-1930s introduction, postwar mass production) + platform/no-sag springs; PRIMARY DATING-EVIDENCE CATEGORY per post-1930s industrial-introduction anchor.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section Serpentine, Sinuous, and Zigzag Springs (paragraphs 520-538). 8/8 per A-8 (post-1930s AG anchor; clean industrial-introduction boundary). Block 40 authoring populates 2 types: Sinuous/Serpentine Spring (post-1930s AG candidate), Platform Spring/No-Sag Spring. assessment_layer 'upholstery' + evidence_sub_layer 'system'.",
    name: "Serpentine, Sinuous, and Zigzag Springs",
    category_description: "Continuous S-curved wire spring systems running front-to-back across the seat frame, replacing individual coil springs with pre-formed zigzag wire. Sinuous (serpentine, zigzag) springs entered production after the 1930s and dominated postwar mass-production upholstered furniture. Platform springs and no-sag springs are related continuous-wire systems. Serpentine-spring presence is a strong post-1930s campaign-dating indicator; on an older frame it almost certainly indicates later reupholstery, not a modern frame.",
    unique_category_traits: [
      "Continuous S-curved (zigzag) wire spring construction",
      "Post-1930s introduction; postwar mass-production dominance",
      "Replaces individual coil springs with pre-formed wire",
      "Strong post-1930s campaign-dating indicator",
    ],
    core_identifying_elements: [
      "S-curved wire springs running front-to-back across seat frame",
      "Clipped or stapled to rails (not hand-tied)",
      "Uniform machine-formed zigzag profile",
      "Serpentine springs on a pre-1930s frame = later reupholstery campaign per Rule #6 reupholstery_campaign_warning",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "system",
  },
  {
    id: "upholstery_construction_category_natural_stuffing_and_padding_materials",
    category: "upholstery_construction_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Natural-material stuffing and padding: horsehair, mixed animal hair, tow, straw/hay/excelsior/wood wool, Spanish moss, cotton batting, kapok; pre-foam-era padding fills with regional + era diagnostics.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section Natural Stuffing and Padding Materials (paragraphs 539-598). 7/7 per A-8 (broad-range natural materials; medium-strong canonical rationale). Block 40 authoring populates 7 types: Horsehair, Mixed Animal Hair, Tow, Straw/Hay/Excelsior/Wood Wool, Spanish Moss, Cotton Batting, Kapok. Several types carry regional_persistence_notes per canonical-source rural/regional references (tow rural; Spanish moss Southern). assessment_layer 'upholstery' + evidence_sub_layer 'system'.",
    name: "Natural Stuffing and Padding Materials",
    category_description: "Natural-material padding and stuffing fills used before and alongside foam. Horsehair (curled and often pad-stitched; the premium historic fill) and mixed animal hair (hog/cattle/goat blends) are the canonical 18th-19th-century-into-20th-century fills. Tow (coarse flax/hemp fiber waste), straw/hay/excelsior/wood wool, and Spanish moss are vernacular and regional fills. Cotton batting and kapok (silky plant fiber) are later soft-fill layers. Natural stuffing dates the padding campaign to the pre-synthetic-fill era; it does not by itself date the frame.",
    unique_category_traits: [
      "Natural-material padding fills (animal hair, plant fiber, moss)",
      "Pre-foam-era padding methods with continued conservation use",
      "Regional and vernacular fill diagnostics (tow rural; Spanish moss Southern)",
      "Premium (horsehair) vs vernacular (tow/straw/moss) vs soft-layer (cotton/kapok) fill tiers",
    ],
    core_identifying_elements: [
      "Curled horsehair (springy, resilient, often pad-stitched) vs coarse mixed animal hair",
      "Tow = coarse tan/brown flax-hemp fiber; straw/excelsior = wood-wool shavings; Spanish moss = dark wiry plant fiber",
      "Cotton batting = soft white layered fill; kapok = silky lightweight plant fiber",
      "Fill material + layering position is a campaign-dating clue",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "system",
  },
  {
    id: "upholstery_construction_category_feather_and_down_fill",
    category: "upholstery_construction_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Feather and down cushion fills: feather fill, down fill, feather-and-down over foam; soft-cushion fills with continued historic-through-present use.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section Feather and Down Fill (paragraphs 599-623). 7/7 per A-8. Block 40 authoring populates 3 types: Feather Fill, Down Fill, Feather-and-Down Over Foam (the over-foam hybrid is a 20th-century-onward construction). assessment_layer 'upholstery' + evidence_sub_layer 'system'.",
    name: "Feather and Down Fill",
    category_description: "Feather and down soft-cushion fills used in loose seat and back cushions. Feather fill (quill feathers; firmer, heavier) and down fill (soft under-plumage; lighter, more luxurious) are historic-through-present cushion fills. Feather-and-down-over-foam (a down-and-feather wrap around a foam core) is a 20th-century-onward hybrid construction that pairs the soft hand of down with the structure of foam. Feather/down fill dates the cushion campaign; the over-foam hybrid carries a foam-era floor.",
    unique_category_traits: [
      "Soft compressible feather/down cushion fill",
      "Feather (firmer, quill) vs down (softer, under-plumage)",
      "Feather-and-down-over-foam hybrid = 20th-century-onward construction",
      "Loose-cushion application (not foundation padding)",
    ],
    core_identifying_elements: [
      "Compressible fill that shifts and needs plumping",
      "Quill feathers (feel + poke through ticking) = feather fill; pure soft under-plumage = down fill",
      "Inner down-proof ticking channel/baffle construction",
      "Foam core inside a down-feather wrap = over-foam hybrid (foam-era floor)",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "system",
  },
  {
    id: "upholstery_construction_category_foam_and_synthetic_cushion_materials",
    category: "upholstery_construction_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Synthetic cushion and padding materials: latex foam (1930s+), polyurethane foam (1950s+), polyester fiberfill/Dacron wrap (1950s+), memory foam (1990s+), high-resilience foam; PRIMARY DATING-EVIDENCE CATEGORY per dense industrial-introduction AG distribution.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section Foam and Synthetic Cushion Materials (paragraphs 624-665). 8/8 per A-8 (densest AG distribution of any construction category — Latex 1930s+, Polyurethane 1950s+, Polyester Fiberfill 1950s+, Memory Foam 1990s+). Block 40 authoring populates 5 types: Latex Foam Rubber, Polyurethane Foam, Polyester Fiberfill/Dacron Wrap, Memory Foam, High-Resilience Foam. Most types are AG candidates applying D-HW36-15 decade-range AG-floor interpretation discipline. assessment_layer 'upholstery' + evidence_sub_layer 'system'.",
    name: "Foam and Synthetic Cushion Materials",
    category_description: "Synthetic foam and fiberfill cushion and padding materials, each carrying an industrial-introduction date floor. Latex foam rubber (1930s introduction; strongest 1930s-1960s; ages by crumbling and darkening). Polyurethane foam (1950s introduction; dominant 1960s onward; the ubiquitous modern cushion core). Polyester fiberfill / Dacron wrap (1950s introduction; the soft wrap layer over foam cores). Memory foam / viscoelastic foam (1990s introduction to consumer furniture). High-resilience foam (premium modern polyurethane). Synthetic foam presence dates the cushion campaign to its industrial-introduction era; foam on an older frame definitively indicates later reupholstery per Rule #6.",
    unique_category_traits: [
      "Synthetic foam/fiberfill cushion + padding materials",
      "Each material carries an industrial-introduction date floor (densest AG category)",
      "Latex (1930s+) / polyurethane (1950s+) / polyester fiberfill (1950s+) / memory foam (1990s+)",
      "Foam on an older frame definitively indicates later reupholstery",
    ],
    core_identifying_elements: [
      "Latex foam = pinholed molded rubber, ages by crumbling/darkening",
      "Polyurethane foam = open-cell synthetic, yellows and crumbles with age",
      "Polyester fiberfill/Dacron = soft white synthetic wrap layer over foam cores",
      "Memory foam = slow-recovery viscoelastic; high-resilience foam = premium dense polyurethane",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "system",
  },
  {
    id: "upholstery_construction_category_layering_textiles_and_foundation_covers",
    category: "upholstery_construction_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Foundation-layer textiles: burlap/hessian over springs, linen scrim, muslin/cambric; hidden support and containment layers between the foundation system and the visible cover.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section Layering Textiles and Foundation Covers (paragraphs 666-690). 7/7 per A-8. Block 40 authoring populates 3 types: Burlap/Hessian Over Springs, Linen Scrim, Muslin/Cambric. Cross-library FK targets for Block 38 covers forward-references upholstery_cover_type_burlap_hessian + upholstery_cover_type_muslin_cambric_dust_cover per D-UC38-7 + Surfacing 5 (Block 40 aligns covers FK ids). NOTE per D-UCN39-13 + Surfacing 4: covers forward-reference to canvas_foundation is REMOVED at Block 40 (canvas is a contrast-point mention only in canonical source — para 472 — NOT a dedicated construction type; appraiser-honest discipline supersedes FK completion). assessment_layer 'upholstery' + evidence_sub_layer 'system'.",
    name: "Layering Textiles and Foundation Covers",
    category_description: "Hidden foundation-layer textiles installed between the spring/foundation system and the visible cover. Burlap/hessian over springs (coarse jute laid over the spring deck to contain the stuffing). Linen scrim (the fine open-weave layer over stuffing that takes pad-stitching and edge rolls). Muslin/cambric (the under-cover layer that contains the padding before the final fabric goes on, and the cambric dust cover on the bottom). These layers are construction-axis evidence — they date the upholstery system campaign, not the frame.",
    unique_category_traits: [
      "Hidden foundation-layer textiles (not visible covers)",
      "Positioned between the foundation system and the visible cover",
      "Burlap over springs / linen scrim over stuffing / muslin-cambric under-cover layers",
      "Construction-axis evidence — dates the upholstery system campaign",
    ],
    core_identifying_elements: [
      "Burlap/hessian = coarse open-weave jute over the spring deck",
      "Linen scrim = fine open-weave layer over stuffing, takes pad-stitching + edge rolls",
      "Muslin/cambric = tight under-cover containment layer + bottom dust cover",
      "Layer attachment method (tacks vs staples) is a campaign-dating clue",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "system",
  },
  {
    id: "upholstery_construction_category_fasteners_and_upholstery_attachment_clues",
    category: "upholstery_construction_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Upholstery-attachment fastener evidence: hand tacks (1600s-early-20th-century), decorative brass nails/nailhead trim (1600s-present), staples (mostly 20th-century-onward); cross-library integration point with fasteners + hardware libraries.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section Fasteners and Upholstery Attachment Clues (paragraphs 691-709). 7/7 per A-8. Per D-UCN39-11 + A-11 resolution: cataloged as construction category with 3 type entries (Hand Tacks, Decorative Brass Nails/Nailhead Trim, Staples) + cross-library FK to fasteners + hardware libraries per D-UCN39-8. Block 40 authoring populates 3 types with related_fastener_types + related_hardware_types cross-library FK. assessment_layer 'upholstery' + evidence_sub_layer 'system'.",
    name: "Fasteners and Upholstery Attachment Clues",
    category_description: "Fastener evidence specific to upholstery attachment, serving as the construction library's integration point with the fasteners and hardware libraries. Hand tacks (cut or hand-headed tacks; 1600s to early 20th century with continued traditional use; irregular spacing + oxidized heads + multiple tack-hole generations). Decorative brass nails / nailhead trim (visible brass nailheads along edges; 1600s-present; cross-references hardware library UPHOLSTERY HARDWARE). Staples (U-shaped pneumatic-driven fasteners; mostly 20th century to present; regular machine spacing). Multiple generations of tack holes prove repeated reupholstery campaigns; staples date the campaign to the 20th century or later, not the frame.",
    unique_category_traits: [
      "Upholstery-attachment fastener evidence",
      "Construction library integration point with fasteners + hardware libraries",
      "Hand tacks (historic) vs decorative brass nails (decorative-historic) vs staples (modern)",
      "Multiple tack-hole generations prove repeated reupholstery campaigns",
    ],
    core_identifying_elements: [
      "Hand tacks: irregular spacing, oxidized heads, multiple tack-hole generations",
      "Decorative brass nails: brass/brass-colored nailheads along edges; modern strips often have every fifth nail real",
      "Staples: U-shaped metal, regular spacing, pneumatic patterns",
      "Staples date the upholstery campaign to the 20th century or later, NOT the frame",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "system",
  },
];

/**
 * UPHOLSTERY_CONSTRUCTION_TYPES — per-construction-type
 * canonical entries. Empty in Block 39 scaffold; Block 40
 * authors ~31 entries from American_Furniture_Textile
 * _Reference.docx construction section (paragraphs 438-761)
 * per Op A-5 + Surfacing 3.
 *
 * Per Surfacing 4 + D-UCN39-13: Block 40 does NOT author a
 * canvas_foundation type (canvas is a contrast-point mention
 * only in the canonical source — paragraph 472 — not a
 * dedicated construction type). Per appraiser-honest-discipline
 * -supersedes-FK-completion convention, Block 40 instead
 * REMOVES the unwarranted Block 38 covers forward-reference FK
 * to canvas_foundation rather than authoring a content-thin
 * entry to satisfy it.
 *
 * Per Surfacing 5: Block 40 is a 2-content-file change —
 * authors upholsteryConstruction.ts type entries with natural
 * `upholstery_construction_type_*` ids AND updates 3 Block 38
 * covers forward-reference FK values in upholsteryCovers.ts
 * (webbing, burlap, muslin/cambric) to align with the natural
 * ids; the 4th covers FK (canvas) is removed entirely.
 */
export const UPHOLSTERY_CONSTRUCTION_TYPES: UpholsteryConstructionTypeEntry[] = [
  // ── Sub-batch 1 — No-Spring Upholstery (2) ──
  {
    id: "upholstery_construction_type_stuffed_slip_seat",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Removable or drop-in seat frame covered with textile or leather; padding sits above a wood seat frame or webbed base with no coil or serpentine springs.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > No-Spring Upholstery > Stuffed Slip Seat (paragraphs 447-455). 7/7 per A-6. replacement_likelihood medium per A-7 (slip-seat padding routinely recovered). maker_associations: [] per D-UCN39-6 schema-present-content-deferred. NO AG: slip seats span 1600s-present with heavy Colonial Revival / reproduction use, no hard boundary.",
    name: "Stuffed Slip Seat",
    parent_category_id: "upholstery_construction_category_no_spring_upholstery",
    description: "Removable or drop-in seat frame covered with textile or leather; padding sits above a wood seat frame or webbed base. The two canonical no-spring foundation methods are the removable slip seat and the fixed stuffed-over-the-rail seat; this is the removable form.",
    unique_traits: [
      "Removable / drop-in seat frame separate from the chair frame",
      "Padding sits directly above a wood seat frame or webbed base",
      "No coil or serpentine springs",
    ],
    identifying_characteristics: [
      "Separate seat frame, fabric tacked underneath",
      "Old tack holes around the perimeter",
      "Compact padding (tow, wool, hair, moss, straw, cotton, horsehair, later foam replacement)",
      "Original early slip seats show hand-cut seat frames, early tacks, uneven tack spacing, compressed natural stuffing",
      "Staples, plywood seat boards, foam, or black cambric dust cover usually indicate later reupholstery",
    ],
    period_associations: [
      { period_label: "Pre-spring slip-seat era", date_floor: 1600, date_ceiling: 1830 },
      { period_label: "Colonial Revival and reproduction slip-seat use", date_floor: 1880 },
    ],
    date_range_summary: "1600s to present, strongest 1600s to early 1800s and revival work.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_attachment_point"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_stuffed_over_the_rail",
      "upholstery_construction_type_linen_hemp_jute_webbing",
    ],
  },
  {
    id: "upholstery_construction_type_stuffed_over_the_rail",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Upholstery built directly over the fixed seat rails instead of a removable slip seat; padding built up over the frame, fabric or leather pulled directly around the rails.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > No-Spring Upholstery > Stuffed Over-the-Rail Upholstery (paragraphs 457-464). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. regional_persistence_notes per A-10 + D-HW36-9 strict canonical fidelity (canonical para 464 rural/conservative persistence). NO AG: spans 1600s-present.",
    name: "Stuffed Over-the-Rail Upholstery",
    parent_category_id: "upholstery_construction_category_no_spring_upholstery",
    description: "Upholstery built directly over the fixed seat rails instead of being a removable slip seat. Padding is built up over the frame and the fabric or leather is pulled directly around the rails — more integrated than a slip seat, less mechanically resilient than spring upholstery.",
    unique_traits: [
      "Upholstery built directly over fixed seat rails (not removable)",
      "More integrated than a slip seat; less resilient than spring upholstery",
      "Padding built up over the frame, fabric/leather pulled around rails",
    ],
    identifying_characteristics: [
      "Tack holes along top or outside of rails",
      "Padding built up over the frame",
      "Fabric or leather pulled directly around the rails",
      "Genuinely original work shows hand tacks, early frame construction, natural stuffing",
      "Later reupholstery often adds webbing, springs, or foam",
    ],
    period_associations: [
      { period_label: "Stuffed-over-the-rail pre-spring era", date_floor: 1600, date_ceiling: 1830 },
      { period_label: "Conservative, rural, and reproduction persistence", date_floor: 1830 },
    ],
    date_range_summary: "1600s to present, strongest 17th to early 19th century before spring upholstery became widespread.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm", "upholstery_attachment_point"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_stuffed_slip_seat",
      "upholstery_construction_type_linen_hemp_jute_webbing",
      "upholstery_construction_type_horsehair",
    ],
    regional_persistence_notes: "Per canonical paragraph 464: traditional over-the-rail upholstery remained in use after springs appeared, especially in conservative, rural, or reproduction contexts.",
  },

  // ── Sub-batch 2 — Webbing Systems (2; 1 AG) ──
  {
    id: "upholstery_construction_type_linen_hemp_jute_webbing",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Interlaced textile straps stretched across the frame to support stuffing or springs; wide woven straps crossing under the seat, usually tacked to rails.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Webbing Systems > Linen, Hemp, or Jute Webbing (paragraphs 467-474). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. Op C-10 covers FK alignment target: upholstery_cover_type_upholstery_webbing forward-reference resolves to this id per D-UC40-15. NO AG: 1700s-present continuous use.",
    name: "Linen, Hemp, or Jute Webbing",
    parent_category_id: "upholstery_construction_category_webbing_systems",
    description: "Interlaced textile straps stretched across the frame to support stuffing or springs. Older webbing may be linen, hemp, or jute; later work is usually jute or synthetic. Webbing is hidden support, not visible upholstery, and differs from canvas because it is strap-based rather than a continuous sheet.",
    unique_traits: [
      "Interlaced textile straps stretched across the frame",
      "Hidden support system, not visible upholstery",
      "Strap-based, not a continuous sheet",
    ],
    identifying_characteristics: [
      "Wide woven straps crossing under the seat, usually tacked to rails",
      "Older webbing linen, hemp, or jute; later work jute or synthetic",
      "Hand-tacked natural webbing with old oxidation supports 18th-early 20th century",
      "Staples suggest later reupholstery or repair",
    ],
    period_associations: [
      { period_label: "Traditional woven webbing era", date_floor: 1700 },
    ],
    date_range_summary: "1700s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_support_layer", "upholstery_attachment_point"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_elastic_webbing",
      "upholstery_construction_type_early_coil_spring",
      "upholstery_construction_type_burlap_hessian_over_springs",
    ],
  },
  {
    id: "upholstery_construction_type_elastic_webbing",
    category: "upholstery_construction_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Stretchy rubberized or synthetic webbing replacing traditional fixed jute support; AG floor 1940 (canonical 'strongest post-1940s').",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Webbing Systems > Elastic Webbing (paragraphs 476-482). 8/8 AG-anchor per A-6. replacement_likelihood high per A-7 (rubber dries out and sags). maker_associations: [] per D-UCN39-6. AG floor 1940 per A-4 + D-HW36-15 decade-range AG-floor interpretation discipline (canonical 'strongest post-1940s'); D-FA34-3 notes-field marker.",
    name: "Elastic Webbing",
    parent_category_id: "upholstery_construction_category_webbing_systems",
    description: "Stretchy rubberized or synthetic webbing that replaces traditional fixed jute support. Unlike jute webbing it stretches and rebounds; unlike serpentine springs it has no metal spring element. Strongly suggests postwar upholstery construction.",
    unique_traits: [
      "Stretchy rubberized or synthetic webbing",
      "Stretches and rebounds, unlike fixed jute webbing",
      "No metal spring element, unlike serpentine springs",
    ],
    identifying_characteristics: [
      "Elastic straps, often black, green, tan, or striped",
      "Stapled or clipped to frame",
      "Sagging or dried-out rubber",
      "On an older frame, almost certainly indicates later reupholstery",
    ],
    period_associations: [
      { period_label: "Elastic webbing introduction", date_floor: 1900 },
      { period_label: "Postwar elastic webbing dominance", date_floor: 1940 },
    ],
    date_range_summary: "20th century to present, strongest post-1940s.",
    maker_associations: [],
    common_observed_locations: ["upholstery_support_layer", "upholstery_attachment_point"],
    anti_classification_guidance: {
      boundary_date: 1940,
      boundary_type: "form_emergence",
      guidance_text: "Elastic webbing is strongest post-1940s; the decade-floor of 1940 is applied per D-HW36-15 decade-range interpretation. Pre-1940 presence indicates later reupholstery (reupholstery_campaign_warning per Rule #6) or misidentification, not original early construction. On an older frame elastic webbing almost certainly indicates a later reupholstery campaign — campaign evidence for the upholstery system sub-output, not frame dating.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
    related_construction_types: [
      "upholstery_construction_type_linen_hemp_jute_webbing",
      "upholstery_construction_type_sinuous_serpentine_spring",
    ],
  },

  // ── Sub-batch 3 — Coil Spring Construction (4) ──
  {
    id: "upholstery_construction_type_early_coil_spring",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Individual metal coil springs providing resilient support under the upholstery; separate upright coils tied together with twine, mounted to webbing or a base.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Coil Spring Construction > Early Coil Spring Upholstery (paragraphs 485-492). 7/7 per A-6. replacement_likelihood medium per A-7 (substantial systems, but canonically reupholstery-prone — springs can be added later to earlier frames per para 492; D-FA34-3 notes-field marker on the medium call). maker_associations: [] per D-UCN39-6. NO AG: canonical gives a gradual late-1700s-experimental / early-mid-1800s-practical adoption curve, a soft boundary not a hard industrial floor.",
    name: "Early Coil Spring Upholstery",
    parent_category_id: "upholstery_construction_category_coil_spring_construction",
    description: "Individual metal coil springs providing resilient support under the upholstery — separate upright coils tied together with twine, mounted to webbing or a base, often hidden under burlap and stuffing. Different from serpentine springs because coils are individual vertical units; different from no-spring upholstery because the seat has mechanical lift and bounce.",
    unique_traits: [
      "Individual upright metal coil springs",
      "Separate vertical units (unlike horizontal serpentine wire)",
      "Mechanical lift and bounce (unlike no-spring upholstery)",
    ],
    identifying_characteristics: [
      "Separate upright coils tied together with twine",
      "Mounted to webbing or a base",
      "Often hidden under burlap and stuffing",
      "Period trade references by the 1830s; hundreds of spring patents in the second half of the 19th century",
    ],
    period_associations: [
      { period_label: "Experimental coil-spring era", date_floor: 1780, date_ceiling: 1830 },
      { period_label: "Practical coil-spring adoption", date_floor: 1830 },
    ],
    date_range_summary: "Late 1700s experimental; more practical and increasingly common by early to mid-1800s.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_support_layer"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_hand_tied_coil_springs",
      "upholstery_construction_type_drop_in_spring_unit",
      "upholstery_construction_type_linen_hemp_jute_webbing",
      "upholstery_construction_type_burlap_hessian_over_springs",
    ],
  },
  {
    id: "upholstery_construction_type_hand_tied_coil_springs",
    category: "upholstery_construction_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Coil springs tied by hand with twine to control height, shape, compression, and lateral movement; four-way, six-way, or eight-way hand-tied; canonical quality anchor.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Coil Spring Construction > Hand-Tied Coil Springs (paragraphs 494-502). 8/8 per A-6 (rich canonical anchor; eight-way-tied quality marker). replacement_likelihood low per A-7 (substantial, durable when properly tied; survives multiple recovers). maker_associations: [] per D-UCN39-6. NO AG: 1800s-present, eight-way hand-tied remains a current quality feature.",
    name: "Hand-Tied Coil Springs",
    parent_category_id: "upholstery_construction_category_coil_spring_construction",
    description: "Coil springs tied by hand with twine to control height, shape, compression, and lateral movement. Higher-grade than loose coils, sinuous springs, or stapled webbing; more labor-intensive than modern spring units. Eight-way hand-tied systems remain in use as a quality feature today.",
    unique_traits: [
      "Coil springs tied by hand with twine",
      "Hand tying controls height, shape, compression, lateral movement",
      "Higher-grade and more labor-intensive than modern spring units",
    ],
    identifying_characteristics: [
      "Twine crossing between spring tops, knots at multiple directions",
      "Burlap or webbing below",
      "Structured dome or crown to the seat",
      "Common variants: four-way tied, six-way tied, eight-way hand-tied",
      "Broken twine, lumpy seats, tilted coils, or hard ridges suggest failed tying",
    ],
    period_associations: [
      { period_label: "Hand-tied coil-spring era", date_floor: 1800 },
      { period_label: "Quality eight-way hand-tied tradition", date_floor: 1850 },
    ],
    date_range_summary: "1800s to present; strongest quality upholstery from 19th century through high-grade modern furniture.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_support_layer"],
    replacement_likelihood: "low",
    related_construction_types: [
      "upholstery_construction_type_early_coil_spring",
      "upholstery_construction_type_drop_in_spring_unit",
      "upholstery_construction_type_marshall_pocket_coil",
      "upholstery_construction_type_burlap_hessian_over_springs",
    ],
  },
  {
    id: "upholstery_construction_type_drop_in_spring_unit",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Preassembled spring unit inserted into the frame rather than built entirely by hand in place; regular grid, machine uniformity, metal frame or edge wire.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Coil Spring Construction > Drop-In Spring Unit (paragraphs 504-510). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. NO AG per A-4 (canonical 'Late 19th century to present' is a gradual industrial-adoption curve, soft boundary, not AG-worthy).",
    name: "Drop-In Spring Unit",
    parent_category_id: "upholstery_construction_category_coil_spring_construction",
    description: "Preassembled spring unit inserted into the frame rather than built entirely by hand in place. More industrial and uniform than hand-tied spring work, with less individual adjustment.",
    unique_traits: [
      "Preassembled spring unit (not built by hand in place)",
      "More industrial and uniform than hand-tied work",
      "Less individual adjustment",
    ],
    identifying_characteristics: [
      "Regular grid, machine uniformity",
      "Metal frame or edge wire",
      "Fewer hand knots, faster assembly",
    ],
    period_associations: [
      { period_label: "Drop-in spring unit introduction", date_floor: 1880 },
      { period_label: "20th-century mass-production dominance", date_floor: 1900 },
    ],
    date_range_summary: "Late 19th century to present; strongest 20th-century mass production.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_support_layer"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_hand_tied_coil_springs",
      "upholstery_construction_type_marshall_pocket_coil",
      "upholstery_construction_type_sinuous_serpentine_spring",
    ],
  },
  {
    id: "upholstery_construction_type_marshall_pocket_coil",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Individual coils enclosed in fabric pockets, each moving semi-independently; rows of fabric-wrapped springs.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Coil Spring Construction > Marshall Coil / Pocket Coil (paragraphs 512-518). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. NO AG per A-4 (canonical 'Late 19th century to present' soft boundary; more relevant to mattresses and later cushion construction than early furniture frames).",
    name: "Marshall Coil / Pocket Coil",
    parent_category_id: "upholstery_construction_category_coil_spring_construction",
    description: "Individual coils enclosed in fabric pockets. Unlike tied coils, pocket coils are enclosed in textile sleeves; unlike foam cushions, they have metal spring movement inside the cushion. More relevant to mattresses and later cushion construction than early furniture frames.",
    unique_traits: [
      "Individual coils enclosed in fabric pockets",
      "Each coil moves semi-independently",
      "Metal spring movement inside a cushion",
    ],
    identifying_characteristics: [
      "Rows of fabric-wrapped springs",
      "Each spring moving semi-independently",
      "Found in mattresses, sofa cushions, high-end loose cushions, sleeper sofa systems",
    ],
    period_associations: [
      { period_label: "Pocket-coil era", date_floor: 1880 },
    ],
    date_range_summary: "Late 19th century to present, strongest in mattresses and some cushion systems.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_hand_tied_coil_springs",
      "upholstery_construction_type_drop_in_spring_unit",
    ],
  },

  // ── Sub-batch 4 — Serpentine, Sinuous, and Zigzag Springs (2; 2 AG) ──
  {
    id: "upholstery_construction_type_sinuous_serpentine_spring",
    category: "upholstery_construction_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "S-shaped or zigzag steel wire stretched from front rail to back rail; parallel rows of zigzag wire clipped into frame rails; AG floor 1930.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Serpentine, Sinuous, and Zigzag Springs > Sinuous / Serpentine Spring (paragraphs 521-529). 8/8 AG-anchor per A-6. replacement_likelihood high per A-7 (sag-prone). maker_associations: [] per D-UCN39-6. AG floor 1930 per A-4 + D-HW36-15 decade-range discipline (canonical 'strongest post-1930s and especially postwar'); D-FA34-3 notes-field marker. Canonical para 529: sinuous springs on a Victorian frame indicate reworking, not Victorian original construction.",
    name: "Sinuous / Serpentine Spring",
    parent_category_id: "upholstery_construction_category_serpentine_sinuous_and_zigzag_springs",
    description: "S-shaped or zigzag steel wire stretched from front rail to back rail. Unlike coil springs, serpentine springs are horizontal zigzag wires; unlike webbing, they are metal. Less labor-intensive than hand-tied coil springs and common in mass-produced furniture because it is faster and cheaper.",
    unique_traits: [
      "S-shaped or zigzag steel wire",
      "Horizontal zigzag wires stretched front rail to back rail (unlike vertical coils)",
      "Faster and cheaper than traditional coil systems",
    ],
    identifying_characteristics: [
      "Parallel rows of zigzag wire clipped into frame rails",
      "Often tied laterally with wire or cord",
      "Heavy-gauge, closely spaced springs can be durable; thin wire, wide spacing, weak clips suggest lower quality",
    ],
    period_associations: [
      { period_label: "Sinuous spring introduction", date_floor: 1900 },
      { period_label: "Postwar mass-production dominance", date_floor: 1930 },
    ],
    date_range_summary: "20th century to present, strongest post-1930s and especially postwar mass production.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_support_layer", "upholstery_attachment_point"],
    anti_classification_guidance: {
      boundary_date: 1930,
      boundary_type: "form_emergence",
      guidance_text: "Sinuous/serpentine springs are strongest post-1930s; the decade-floor of 1930 is applied per D-HW36-15. Pre-1930 presence indicates reworking (reupholstery_campaign_warning per Rule #6), not original early construction — sinuous springs on a Victorian frame indicate reupholstery, not Victorian original construction. Campaign evidence for the upholstery system sub-output, not frame dating.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
    related_construction_types: [
      "upholstery_construction_type_platform_no_sag_spring",
      "upholstery_construction_type_drop_in_spring_unit",
      "upholstery_construction_type_elastic_webbing",
    ],
  },
  {
    id: "upholstery_construction_type_platform_no_sag_spring",
    category: "upholstery_construction_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Factory-made metal spring platform used instead of a hand-built upholstery foundation; flat grid or zigzag platform, metal clips, standardized construction; AG floor 1930.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Serpentine, Sinuous, and Zigzag Springs > Platform Spring / No-Sag Spring (paragraphs 531-537). 8/8 AG-anchor per A-6. replacement_likelihood high per A-7 (sag-prone). maker_associations: [] per D-UCN39-6. AG floor 1930 per A-4 + D-HW36-15 (canonical dating cue para 537 'Usually post-1930s to present' — corrected from plan Q2=C draft 1940 to 1930 per canonical-source fidelity); D-FA34-3 notes-field marker.",
    name: "Platform Spring / No-Sag Spring",
    parent_category_id: "upholstery_construction_category_serpentine_sinuous_and_zigzag_springs",
    description: "Factory-made metal spring platform used instead of a hand-built upholstery foundation. More industrial than hand-tied coil springs; more rigidly standardized than jute webbing.",
    unique_traits: [
      "Factory-made metal spring platform",
      "Replaces hand-built upholstery foundation",
      "Rigidly standardized construction",
    ],
    identifying_characteristics: [
      "Flat grid or zigzag platform",
      "Metal clips",
      "Standardized construction",
    ],
    period_associations: [
      { period_label: "Platform / no-sag spring era", date_floor: 1930 },
    ],
    date_range_summary: "20th century to present; usually post-1930s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_support_layer", "upholstery_attachment_point"],
    anti_classification_guidance: {
      boundary_date: 1930,
      boundary_type: "form_emergence",
      guidance_text: "Platform / no-sag spring is usually post-1930s to present; the decade-floor of 1930 is applied per D-HW36-15 (canonical dating cue 'Usually post-1930s'). Pre-1930 presence indicates later reupholstery (reupholstery_campaign_warning per Rule #6) or misidentification. Campaign evidence for the upholstery system sub-output, not frame dating.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
    related_construction_types: [
      "upholstery_construction_type_sinuous_serpentine_spring",
      "upholstery_construction_type_drop_in_spring_unit",
    ],
  },

  // ── Sub-batch 5 — Natural Stuffing and Padding Materials (7) ──
  {
    id: "upholstery_construction_type_horsehair",
    category: "upholstery_construction_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Springy, coarse animal hair used as stuffing or padding; black, brown, or mixed coarse hair, springy when teased apart, may be curled; canonical traditional-upholstery anchor.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Natural Stuffing and Padding Materials > Horsehair (paragraphs 540-548). 8/8 per A-6 (tight era anchor, rich canonical content). replacement_likelihood low per A-7 (long-lived; dusty but resilient horsehair can be reused, may survive multiple recovers). maker_associations: [] per D-UCN39-6. NO regional_persistence_notes: canonical gives no explicit region (plan-draft Pennsylvania-German/Southern guess excluded per D-HW36-9 strict canonical fidelity). NO AG: 1600s-early 1900s, still used in conservation.",
    name: "Horsehair",
    parent_category_id: "upholstery_construction_category_natural_stuffing_and_padding_materials",
    description: "Springy, coarse animal hair used as stuffing or padding. Horsehair is springier and coarser than cotton batting, does not crumble like old foam, and is not the same as haircloth (a woven cover textile). It was commonly displaced by cheaper modern materials, especially foam, in the 20th century.",
    unique_traits: [
      "Springy, coarse animal hair used as stuffing or padding",
      "Springier and coarser than cotton batting",
      "Does not crumble like old foam; distinct from woven haircloth cover textile",
    ],
    identifying_characteristics: [
      "Black, brown, or mixed coarse hair; springy when teased apart; may be curled",
      "Often found under linen scrim, burlap, or muslin",
      "Hair sculpted under stitched edges may indicate skilled traditional upholstery",
      "Dusty but resilient; powdery dirt and insect debris may be present",
    ],
    period_associations: [
      { period_label: "Horsehair upholstery era", date_floor: 1600, date_ceiling: 1920 },
      { period_label: "Conservation and traditional-upholstery persistence", date_floor: 1920 },
    ],
    date_range_summary: "1600s to early 1900s strongest; still used in conservation and traditional upholstery.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm", "upholstery_support_layer"],
    replacement_likelihood: "low",
    related_construction_types: [
      "upholstery_construction_type_mixed_animal_hair",
      "upholstery_construction_type_linen_scrim",
      "upholstery_construction_type_burlap_hessian_over_springs",
    ],
  },
  {
    id: "upholstery_construction_type_mixed_animal_hair",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Coarser or softer animal hair blends (hog, cattle, goat) used as upholstery stuffing; mixed fiber colors, coarse texture, variable curl.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Natural Stuffing and Padding Materials > Hog Hair, Cattle Hair, Goat Hair, and Mixed Animal Hair (paragraphs 550-556). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. NO AG: 1700s-early 1900s, conservation use later; not precise enough to date alone.",
    name: "Hog Hair, Cattle Hair, Goat Hair, and Mixed Animal Hair",
    parent_category_id: "upholstery_construction_category_natural_stuffing_and_padding_materials",
    description: "Coarser or softer animal hair blends used as upholstery stuffing. Usually less springy than high-quality horsehair and more irregular than cotton or kapok. Supports traditional upholstery but is not precise enough to date alone.",
    unique_traits: [
      "Coarser or softer animal hair blends (hog, cattle, goat)",
      "Usually less springy than high-quality horsehair",
      "More irregular than cotton or kapok",
    ],
    identifying_characteristics: [
      "Mixed fiber colors, coarse texture, variable curl",
      "Animal odor when damp",
    ],
    period_associations: [
      { period_label: "Mixed animal hair stuffing era", date_floor: 1700, date_ceiling: 1920 },
      { period_label: "Conservation-use persistence", date_floor: 1920 },
    ],
    date_range_summary: "1700s to early 1900s strongest; conservation use later.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm", "upholstery_support_layer"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_horsehair",
      "upholstery_construction_type_tow",
      "upholstery_construction_type_cotton_batting",
    ],
  },
  {
    id: "upholstery_construction_type_tow",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Coarse flax or hemp fiber waste used as stuffing; straw-like or rope-like plant fibers, tan or gray-brown, dry and wiry.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Natural Stuffing and Padding Materials > Tow (paragraphs 558-564). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. regional_persistence_notes per A-10 + D-HW36-9 strict canonical fidelity (canonical paras 562+564 rural furniture / rural traditional upholstery). NO AG: 1600s-1800s, later restoration use.",
    name: "Tow",
    parent_category_id: "upholstery_construction_category_natural_stuffing_and_padding_materials",
    description: "Coarse flax or hemp fiber waste used as stuffing. Tow is plant fiber, not animal hair; less springy than horsehair and coarser than cotton. Can support early or rural traditional upholstery when found with early frame evidence, hand tacks, and old textile layers.",
    unique_traits: [
      "Coarse flax or hemp fiber waste",
      "Plant fiber, not animal hair",
      "Less springy than horsehair, coarser than cotton",
    ],
    identifying_characteristics: [
      "Straw-like or rope-like plant fibers",
      "Tan or gray-brown, dry and wiry",
    ],
    period_associations: [
      { period_label: "Tow stuffing era", date_floor: 1600, date_ceiling: 1900 },
      { period_label: "Later restoration use", date_floor: 1900 },
    ],
    date_range_summary: "1600s to 1800s strongest; later restoration use.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_support_layer"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_straw_hay_excelsior_wood_wool",
      "upholstery_construction_type_mixed_animal_hair",
      "upholstery_construction_type_spanish_moss",
    ],
    regional_persistence_notes: "Per canonical paragraphs 562 and 564: associated with rural furniture and rural traditional upholstery; supports rural traditional upholstery when found with early frame evidence, hand tacks, and old textile layers.",
  },
  {
    id: "upholstery_construction_type_straw_hay_excelsior_wood_wool",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Inexpensive plant or wood-shaving stuffing; straw pieces, curled wood shavings, coarse vegetable matter, brittle breakage.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Natural Stuffing and Padding Materials > Straw, Hay, Excelsior, and Wood Wool (paragraphs 566-572). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. NO AG: 1700s-mid-1900s, excelsior especially 19th-early 20th century.",
    name: "Straw, Hay, Excelsior, and Wood Wool",
    parent_category_id: "upholstery_construction_category_natural_stuffing_and_padding_materials",
    description: "Inexpensive plant or wood-shaving stuffing. Less resilient and lower-grade than horsehair, more irregular than cotton batting. Excelsior appears as thin curled wood shavings. Supports utilitarian, lower-cost, or rural upholstery.",
    unique_traits: [
      "Inexpensive plant or wood-shaving stuffing",
      "Less resilient and lower-grade than horsehair",
      "Excelsior appears as thin curled wood shavings",
    ],
    identifying_characteristics: [
      "Straw pieces, curled wood shavings, coarse vegetable matter",
      "Brittle breakage",
    ],
    period_associations: [
      { period_label: "Plant and wood-shaving stuffing era", date_floor: 1700, date_ceiling: 1950 },
      { period_label: "Excelsior factory-furniture peak", date_floor: 1800, date_ceiling: 1930 },
    ],
    date_range_summary: "1700s to mid-1900s, with excelsior especially 19th to early 20th century.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_support_layer"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_tow",
      "upholstery_construction_type_spanish_moss",
    ],
  },
  {
    id: "upholstery_construction_type_spanish_moss",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Processed plant material used as stuffing; dark, wiry, curly plant fibers, often brittle; may resemble black hair but lacks animal hair structure.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Natural Stuffing and Padding Materials > Spanish Moss (paragraphs 574-581). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. regional_persistence_notes per A-10 + D-HW36-9 strict canonical fidelity (canonical paras 575+580 Southern contexts / Southern furniture). NO AG: 1700s-early 1900s.",
    name: "Spanish Moss",
    parent_category_id: "upholstery_construction_category_natural_stuffing_and_padding_materials",
    description: "Processed plant material used as stuffing. Can be mistaken for horsehair, but Spanish moss is plant fiber and often more brittle, wiry, and irregular. A useful regional clue when paired with Southern frame origin, but not enough alone.",
    unique_traits: [
      "Processed plant material used as stuffing",
      "Plant fiber, not animal hair (often mistaken for horsehair)",
      "More brittle, wiry, and irregular than horsehair",
    ],
    identifying_characteristics: [
      "Dark, wiry, curly plant fibers; often brittle",
      "May resemble black hair but lacks animal hair structure",
    ],
    period_associations: [
      { period_label: "Spanish moss stuffing era", date_floor: 1700, date_ceiling: 1920 },
    ],
    date_range_summary: "1700s to early 1900s, especially Southern contexts.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_support_layer"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_tow",
      "upholstery_construction_type_straw_hay_excelsior_wood_wool",
      "upholstery_construction_type_horsehair",
    ],
    regional_persistence_notes: "Per canonical paragraphs 575 and 580: more likely in Southern furniture and upholstery traditions; a useful regional clue when paired with Southern frame origin, but not enough alone.",
  },
  {
    id: "upholstery_construction_type_cotton_batting",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Soft white or off-white cotton layer used over rougher stuffing or springs; soft sheet-like batting, compresses flat, yellows with age.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Natural Stuffing and Padding Materials > Cotton Batting (paragraphs 583-589). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. NO AG: 1800s-present, very common from 19th century onward; synthetic batting mixed with cotton points to later 20th century.",
    name: "Cotton Batting",
    parent_category_id: "upholstery_construction_category_natural_stuffing_and_padding_materials",
    description: "Soft white or off-white cotton layer used over rougher stuffing or springs. Softer and flatter than horsehair; does not have the coarse strand structure of tow or excelsior. Very common from the 19th century onward.",
    unique_traits: [
      "Soft white or off-white cotton layer over rougher stuffing or springs",
      "Softer and flatter than horsehair",
      "No coarse strand structure (unlike tow or excelsior)",
    ],
    identifying_characteristics: [
      "Soft sheet-like batting, compresses flat",
      "Yellows with age",
      "Synthetic batting mixed with cotton points to later 20th century",
    ],
    period_associations: [
      { period_label: "Cotton batting introduction", date_floor: 1800 },
      { period_label: "19th-century-onward common use", date_floor: 1850 },
    ],
    date_range_summary: "1800s to present; strongest 19th century onward.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm", "upholstery_support_layer"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_horsehair",
      "upholstery_construction_type_kapok",
      "upholstery_construction_type_polyester_fiberfill_dacron",
    ],
  },
  {
    id: "upholstery_construction_type_kapok",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Silky plant fiber from the kapok tree; buoyant, lightweight, water-resistant; very light, silky, yellowish fiber that floats easily.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Natural Stuffing and Padding Materials > Kapok (paragraphs 591-597). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. NO AG per A-4 (Mike-locked): canonical 'Late 19th century to mid-20th century strongest' is a soft strongest-range for a natural plant fiber, not a hard industrial-introduction boundary; the plan pre-addressed CC-Q7 1900-floor candidate is declined per appraiser-honest discipline.",
    name: "Kapok",
    parent_category_id: "upholstery_construction_category_natural_stuffing_and_padding_materials",
    description: "Silky plant fiber from the kapok tree; buoyant, lightweight, and water-resistant. Lighter and silkier than cotton, less structured than hair. Can support early to mid-20th-century cushion construction, especially before foam dominance.",
    unique_traits: [
      "Silky plant fiber from the kapok tree",
      "Buoyant, lightweight, water-resistant",
      "Lighter and silkier than cotton; less structured than hair",
    ],
    identifying_characteristics: [
      "Very light, silky, yellowish fiber",
      "Floats easily; slippery hand",
    ],
    period_associations: [
      { period_label: "Kapok cushion-fill era", date_floor: 1880, date_ceiling: 1960 },
    ],
    date_range_summary: "Late 19th century to mid-20th century strongest.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_cotton_batting",
      "upholstery_construction_type_feather_fill",
    ],
  },

  // ── Sub-batch 6 — Feather and Down Fill (3; 1 AG) ──
  {
    id: "upholstery_construction_type_feather_fill",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Bird feathers used in cushions and pillows; quills palpable through ticking, crunching sound, shifting fill.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Feather and Down Fill > Feather Fill (paragraphs 600-606). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. NO AG: 1600s-present, feather fill is long-lived and not precise.",
    name: "Feather Fill",
    parent_category_id: "upholstery_construction_category_feather_and_down_fill",
    description: "Bird feathers used in cushions and pillows. Feathers have quills and more structure than down; unlike foam, they shift and require fluffing. Feather fill is long-lived and not precise for dating.",
    unique_traits: [
      "Bird feathers used in loose cushions and pillows",
      "Quills and more structure than down",
      "Shifts and requires fluffing (unlike foam)",
    ],
    identifying_characteristics: [
      "Quills palpable through ticking, crunching sound",
      "Shifting fill, feather leakage through seams",
      "Older feather cushions may have ticking covers, hand stitching, compacted fill",
    ],
    period_associations: [
      { period_label: "Feather fill era", date_floor: 1600 },
    ],
    date_range_summary: "1600s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_down_fill",
      "upholstery_construction_type_feather_and_down_over_foam",
    ],
  },
  {
    id: "upholstery_construction_type_down_fill",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Soft under-feathers without hard quills, used for luxury softness; very soft, collapsible, slow recovery.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Feather and Down Fill > Down Fill (paragraphs 608-614). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. NO AG: 1700s-present, down does not date tightly (the down-wrapped-foam variant is the modern-dating signal — see feather_and_down_over_foam).",
    name: "Down Fill",
    parent_category_id: "upholstery_construction_category_feather_and_down_fill",
    description: "Soft under-feathers without hard quills, used for luxury softness. Softer and more collapsible than feather fill; less resilient than foam unless wrapped around a core. Down does not date tightly.",
    unique_traits: [
      "Soft under-feathers without hard quills",
      "Softer and more collapsible than feather fill",
      "Less resilient than foam unless wrapped around a core",
    ],
    identifying_characteristics: [
      "Very soft, collapsible, slow recovery",
      "No obvious quill crunch if pure down",
    ],
    period_associations: [
      { period_label: "Down fill era", date_floor: 1700 },
    ],
    date_range_summary: "1700s to present, strongest high-grade upholstery and cushion work.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_feather_fill",
      "upholstery_construction_type_feather_and_down_over_foam",
    ],
  },
  {
    id: "upholstery_construction_type_feather_and_down_over_foam",
    category: "upholstery_construction_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Foam core wrapped in a feather/down envelope; rectangular foam shape with softer feather crown; AG floor 1950.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Feather and Down Fill > Feather-and-Down Over Foam (paragraphs 616-622). 8/8 AG-anchor per A-6. replacement_likelihood high per A-7 (foam core degrades). maker_associations: [] per D-UCN39-6. AG floor 1950 per A-4 + D-HW36-15 (Mike-locked addition; canonical para 617 'Mid-20th century to present' — the foam core makes this a hard industrial-introduction boundary like the foam types); D-FA34-3 notes-field marker.",
    name: "Feather-and-Down Over Foam",
    parent_category_id: "upholstery_construction_category_feather_and_down_fill",
    description: "Foam core wrapped in a feather/down envelope. More structured than pure down, with a softer surface than plain foam; the cushion holds shape better than pure feather but has a soft surface. Usually modern upholstery.",
    unique_traits: [
      "Foam core wrapped in a feather/down envelope",
      "More structured than pure down, softer surface than plain foam",
      "Holds shape better than pure feather fill",
    ],
    identifying_characteristics: [
      "Rectangular foam shape with softer feather crown",
      "Cushion holds shape better than pure feather but has a soft surface",
    ],
    period_associations: [
      { period_label: "Feather-and-down-over-foam era", date_floor: 1950 },
    ],
    date_range_summary: "Mid-20th century to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    anti_classification_guidance: {
      boundary_date: 1950,
      boundary_type: "form_emergence",
      guidance_text: "Feather-and-down-over-foam is a mid-20th-century-onward construction; the decade-floor of 1950 is applied per D-HW36-15. The foam core cannot predate foam manufacture, so pre-1950 presence indicates misidentification or later reupholstery (reupholstery_campaign_warning per Rule #6). Campaign evidence for the upholstery system sub-output, not frame dating.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
    related_construction_types: [
      "upholstery_construction_type_down_fill",
      "upholstery_construction_type_feather_fill",
      "upholstery_construction_type_polyurethane_foam",
      "upholstery_construction_type_high_resilience_foam",
    ],
  },

  // ── Sub-batch 7 — Foam and Synthetic Cushion Materials (5; 5 AG) ──
  {
    id: "upholstery_construction_type_latex_foam",
    category: "upholstery_construction_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Natural or synthetic rubber foam; resilient, dense, sometimes perforated; rubbery feel, small holes, yellowing, hardening, cracking, rubber odor; AG floor 1930.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Foam and Synthetic Cushion Materials > Latex Foam Rubber (paragraphs 625-631). 8/8 AG-anchor per A-6. replacement_likelihood high per A-7 (old latex hardens, crumbles, cracks). maker_associations: [] per D-UCN39-6. AG floor 1930 per A-4 + D-HW36-15 (canonical '1930s to present'); D-FA34-3 notes-field marker.",
    name: "Latex Foam Rubber",
    parent_category_id: "upholstery_construction_category_foam_and_synthetic_cushion_materials",
    description: "Natural or synthetic rubber foam; resilient, dense, sometimes perforated. More rubbery and resilient than polyurethane foam; old latex may harden or crumble differently. A strong clue for 1930s-1960s upholstery or cushion replacement.",
    unique_traits: [
      "Natural or synthetic rubber foam",
      "Resilient, dense, sometimes perforated",
      "More rubbery and resilient than polyurethane foam",
    ],
    identifying_characteristics: [
      "Rubbery feel, small holes or perforations",
      "Yellowing, hardening, cracking, rubber odor",
      "On older frames it indicates later upholstery",
    ],
    period_associations: [
      { period_label: "Latex foam rubber era", date_floor: 1930 },
      { period_label: "Latex foam peak before polyurethane dominance", date_floor: 1930, date_ceiling: 1960 },
    ],
    date_range_summary: "1930s to present; strongest 1930s to 1960s before polyurethane became dominant.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    anti_classification_guidance: {
      boundary_date: 1930,
      boundary_type: "form_emergence",
      guidance_text: "Latex foam rubber dates from the 1930s; the decade-floor of 1930 is applied per D-HW36-15. Pre-1930 presence indicates misidentification or later reupholstery (reupholstery_campaign_warning per Rule #6) — on older frames latex foam indicates later upholstery. Campaign evidence for the upholstery system sub-output, not frame dating.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
    related_construction_types: [
      "upholstery_construction_type_polyurethane_foam",
      "upholstery_construction_type_high_resilience_foam",
      "upholstery_construction_type_memory_foam",
    ],
  },
  {
    id: "upholstery_construction_type_polyurethane_foam",
    category: "upholstery_construction_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Lightweight synthetic foam cut into blocks or shaped cushions; open-cell foam, yellow/orange/brown oxidation, crumbling powder when degraded; AG floor 1950.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Foam and Synthetic Cushion Materials > Polyurethane Foam (paragraphs 633-640). 8/8 AG-anchor per A-6. replacement_likelihood high per A-7 (breaks down into sticky or powdery crumbs). maker_associations: [] per D-UCN39-6. AG floor 1950 per A-4 + D-HW36-15 (canonical '1950s to present; dominant from the 1960s onward'; practical dating rule para 640); D-FA34-3 notes-field marker.",
    name: "Polyurethane Foam",
    parent_category_id: "upholstery_construction_category_foam_and_synthetic_cushion_materials",
    description: "Lightweight synthetic foam cut into blocks or shaped cushions. Unlike hair or cotton, foam is a synthetic cellular block; unlike latex, it often feels less rubbery and breaks down into sticky or powdery crumbs. It largely replaced traditional stuffings in ordinary furniture because it was cheaper and faster to use.",
    unique_traits: [
      "Lightweight synthetic foam cut into blocks or shaped cushions",
      "Synthetic cellular block (unlike hair or cotton)",
      "Less rubbery than latex; breaks down into sticky or powdery crumbs",
    ],
    identifying_characteristics: [
      "Open-cell foam, uniform cut edges",
      "Yellow/orange/brown oxidation",
      "Crumbling powder when degraded",
      "Usually means 1950s or later, more commonly 1960s or later in domestic furniture",
    ],
    period_associations: [
      { period_label: "Polyurethane foam era", date_floor: 1950 },
      { period_label: "Polyurethane foam dominance", date_floor: 1960 },
    ],
    date_range_summary: "1950s to present; dominant from the 1960s onward.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    anti_classification_guidance: {
      boundary_date: 1950,
      boundary_type: "form_emergence",
      guidance_text: "Polyurethane foam dates from the 1950s, dominant from the 1960s onward; the decade-floor of 1950 is applied per D-HW36-15. Pre-1950 presence indicates misidentification or later reupholstery (reupholstery_campaign_warning per Rule #6) — an older frame with polyurethane foam was reupholstered after the 1950s. Campaign evidence for the upholstery system sub-output, not frame dating.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
    related_construction_types: [
      "upholstery_construction_type_latex_foam",
      "upholstery_construction_type_high_resilience_foam",
      "upholstery_construction_type_memory_foam",
      "upholstery_construction_type_polyester_fiberfill_dacron",
    ],
  },
  {
    id: "upholstery_construction_type_polyester_fiberfill_dacron",
    category: "upholstery_construction_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Fluffy synthetic batting used over foam or as loose cushion fill; white synthetic cloud-like batting, slippery fibers, often wrapped around foam blocks; AG floor 1950.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Foam and Synthetic Cushion Materials > Polyester Fiberfill / Dacron Wrap (paragraphs 642-648). 8/8 AG-anchor per A-6. replacement_likelihood high per A-7 (synthetic wrap layer, routinely replaced with foam cores). maker_associations: [] per D-UCN39-6. AG floor 1950 per A-4 + D-HW36-15 (canonical '1950s to present; strongest 1960s onward'); D-FA34-3 notes-field marker.",
    name: "Polyester Fiberfill / Dacron Wrap",
    parent_category_id: "upholstery_construction_category_foam_and_synthetic_cushion_materials",
    description: "Fluffy synthetic batting used over foam or as loose cushion fill. Cleaner, whiter, and more uniform than cotton batting; does not yellow or compact the same way as old cotton. Post-1950s, very common late 20th century onward.",
    unique_traits: [
      "Fluffy synthetic batting over foam or as loose cushion fill",
      "Cleaner, whiter, more uniform than cotton batting",
      "Does not yellow or compact like old cotton",
    ],
    identifying_characteristics: [
      "White synthetic cloud-like batting, slippery fibers",
      "Often wrapped around foam blocks",
    ],
    period_associations: [
      { period_label: "Polyester fiberfill era", date_floor: 1950 },
      { period_label: "Late-20th-century common use", date_floor: 1960 },
    ],
    date_range_summary: "1950s to present; strongest 1960s onward.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    anti_classification_guidance: {
      boundary_date: 1950,
      boundary_type: "form_emergence",
      guidance_text: "Polyester fiberfill / Dacron wrap dates from the 1950s; the decade-floor of 1950 is applied per D-HW36-15. Pre-1950 presence indicates misidentification or later reupholstery (reupholstery_campaign_warning per Rule #6). Campaign evidence for the upholstery system sub-output, not frame dating.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
    related_construction_types: [
      "upholstery_construction_type_polyurethane_foam",
      "upholstery_construction_type_cotton_batting",
      "upholstery_construction_type_high_resilience_foam",
    ],
  },
  {
    id: "upholstery_construction_type_memory_foam",
    category: "upholstery_construction_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Slow-recovery viscoelastic foam that holds impressions temporarily; slow rebound after pressing, dense feel, often layered with conventional foam; AG floor 1990.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Foam and Synthetic Cushion Materials > Memory Foam / Viscoelastic Foam (paragraphs 650-656). 8/8 AG-anchor per A-6. replacement_likelihood high per A-7 (compresses, degrades). maker_associations: [] per D-UCN39-6. AG floor 1990 per A-4 + D-HW36-15 (canonical 'Late 20th century to present, strongest 1990s onward in consumer furniture'); D-FA34-3 notes-field marker.",
    name: "Memory Foam / Viscoelastic Foam",
    parent_category_id: "upholstery_construction_category_foam_and_synthetic_cushion_materials",
    description: "Slow-recovery foam that holds impressions temporarily. Slower recovery than polyurethane or latex. Usually contemporary, late 20th century to present.",
    unique_traits: [
      "Slow-recovery viscoelastic foam",
      "Holds impressions temporarily",
      "Slower recovery than polyurethane or latex",
    ],
    identifying_characteristics: [
      "Slow rebound after pressing",
      "Dense feel",
      "Often layered with conventional foam",
    ],
    period_associations: [
      { period_label: "Memory foam introduction", date_floor: 1980 },
      { period_label: "Consumer-furniture memory foam adoption", date_floor: 1990 },
    ],
    date_range_summary: "Late 20th century to present, strongest 1990s onward in consumer furniture.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    anti_classification_guidance: {
      boundary_date: 1990,
      boundary_type: "form_emergence",
      guidance_text: "Memory foam is strongest 1990s onward in consumer furniture; the decade-floor of 1990 is applied per D-HW36-15. Pre-1990 presence indicates misidentification or very recent reupholstery (reupholstery_campaign_warning per Rule #6). Campaign evidence for the upholstery system sub-output, not frame dating.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
    related_construction_types: [
      "upholstery_construction_type_polyurethane_foam",
      "upholstery_construction_type_latex_foam",
      "upholstery_construction_type_high_resilience_foam",
    ],
  },
  {
    id: "upholstery_construction_type_high_resilience_foam",
    category: "upholstery_construction_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Better-grade polyurethane foam with more resilience and durability; firmer rebound, layered cushion construction, often used with Dacron or down wrap; AG floor 1970.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Foam and Synthetic Cushion Materials > High-Resilience Foam (paragraphs 658-664). 8/8 AG-anchor per A-6. replacement_likelihood high per A-7 (polyurethane-class foam, degrades). maker_associations: [] per D-UCN39-6. AG floor 1970 per A-4 + D-HW36-15 (canonical 'Late 20th century to present' is vague; 1970 is the conservative decade-floor reading — D-FA34-3 notes-field marker flags the canonical vagueness).",
    name: "High-Resilience Foam",
    parent_category_id: "upholstery_construction_category_foam_and_synthetic_cushion_materials",
    description: "Better-grade polyurethane foam with more resilience and durability. More durable and resilient than low-density foam. A modern quality clue, not antique evidence.",
    unique_traits: [
      "Better-grade polyurethane foam",
      "More resilience and durability than low-density foam",
      "Modern quality clue, not antique evidence",
    ],
    identifying_characteristics: [
      "Firmer rebound",
      "Layered cushion construction",
      "Often used with Dacron or down wrap",
    ],
    period_associations: [
      { period_label: "High-resilience foam era", date_floor: 1970 },
    ],
    date_range_summary: "Late 20th century to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    anti_classification_guidance: {
      boundary_date: 1970,
      boundary_type: "form_emergence",
      guidance_text: "High-resilience foam is a late-20th-century material; canonical phrasing 'Late 20th century to present' is vague, and the conservative decade-floor of 1970 is applied per D-HW36-15. Pre-1970 presence indicates misidentification or later reupholstery (reupholstery_campaign_warning per Rule #6). Campaign evidence for the upholstery system sub-output, not frame dating.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
    related_construction_types: [
      "upholstery_construction_type_polyurethane_foam",
      "upholstery_construction_type_latex_foam",
      "upholstery_construction_type_memory_foam",
      "upholstery_construction_type_polyester_fiberfill_dacron",
    ],
  },

  // ── Sub-batch 8 — Layering Textiles and Foundation Covers (3) ──
  {
    id: "upholstery_construction_type_burlap_hessian_over_springs",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Coarse jute cloth placed over springs before padding; coarse tan woven fabric, often stitched to spring tops, brittle with age.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Layering Textiles and Foundation Covers > Burlap / Hessian Over Springs (paragraphs 667-673). 7/7 per A-6. replacement_likelihood medium per A-7 (utility layer; replaceable but not necessarily replaced). maker_associations: [] per D-UCN39-6. Op C-10 covers FK alignment target: upholstery_cover_type_burlap_hessian forward-reference resolves to this id per D-UC40-15. NO AG: 1800s-present.",
    name: "Burlap / Hessian Over Springs",
    parent_category_id: "upholstery_construction_category_layering_textiles_and_foundation_covers",
    description: "Coarse jute cloth placed over springs before padding. Coarser than muslin and more structural than a dust cover. Common in traditional upholstery; hand-stitching to springs can support older traditional upholstery, while staples or synthetic substitutes suggest later work.",
    unique_traits: [
      "Coarse jute cloth placed over springs before padding",
      "Coarser than muslin, more structural than a dust cover",
      "Hidden foundation layer between springs and padding",
    ],
    identifying_characteristics: [
      "Coarse tan woven fabric",
      "Often stitched to spring tops",
      "Brittle with age",
      "Hand-stitching to springs supports older traditional upholstery; staples or synthetic substitutes suggest later work",
    ],
    period_associations: [
      { period_label: "Burlap-over-springs era", date_floor: 1800 },
    ],
    date_range_summary: "1800s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_support_layer"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_linen_scrim",
      "upholstery_construction_type_muslin_cambric",
      "upholstery_construction_type_hand_tied_coil_springs",
    ],
  },
  {
    id: "upholstery_construction_type_linen_scrim",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Open-weave linen used to contain and shape hair or stuffing; open weave, gray/tan linen, stitched over hair layers.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Layering Textiles and Foundation Covers > Linen Scrim (paragraphs 675-681). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. NO AG: 1700s-present in traditional upholstery and conservation.",
    name: "Linen Scrim",
    parent_category_id: "upholstery_construction_category_layering_textiles_and_foundation_covers",
    description: "Open-weave linen used to contain and shape hair or stuffing. Finer and more controlled than burlap; used for shaping, not just support. Can indicate traditional upholstery methods, but is still used in conservation work.",
    unique_traits: [
      "Open-weave linen for containing and shaping stuffing",
      "Finer and more controlled than burlap",
      "Used for shaping, not just support",
    ],
    identifying_characteristics: [
      "Open weave, gray/tan linen",
      "Stitched over hair layers",
    ],
    period_associations: [
      { period_label: "Linen scrim era", date_floor: 1700 },
    ],
    date_range_summary: "1700s to present in traditional upholstery and conservation.",
    maker_associations: [],
    common_observed_locations: ["upholstery_support_layer"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_burlap_hessian_over_springs",
      "upholstery_construction_type_muslin_cambric",
      "upholstery_construction_type_horsehair",
    ],
  },
  {
    id: "upholstery_construction_type_muslin_cambric",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Lightweight cotton used as lining, covering, or dust barrier; thin woven cotton, often tan, white, brown, or black.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Layering Textiles and Foundation Covers > Muslin / Cambric (paragraphs 683-689). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. Op C-10 covers FK alignment target: upholstery_cover_type_muslin_cambric_dust_cover forward-reference resolves to this id per D-UC40-15. NO AG: 1800s-present (black synthetic cambric underside points to late 20th century, but this is a within-type dating cue, not a hard-boundary AG).",
    name: "Muslin / Cambric",
    parent_category_id: "upholstery_construction_category_layering_textiles_and_foundation_covers",
    description: "Lightweight cotton used as lining, covering, or dust barrier. Finer than burlap and less structural than webbing. Black synthetic cambric undersides usually point to late 20th century or contemporary upholstery; hand-tacked cotton cambric can support older work but may be a replacement.",
    unique_traits: [
      "Lightweight cotton lining, covering, or dust barrier",
      "Finer than burlap, less structural than webbing",
      "Used on undersides, cushion liners, dust covers",
    ],
    identifying_characteristics: [
      "Thin woven cotton, often tan, white, brown, or black",
      "Black synthetic cambric underside usually points to late 20th century or contemporary upholstery",
      "Hand-tacked cotton cambric can support older work but may be a replacement",
    ],
    period_associations: [
      { period_label: "Muslin / cambric layering era", date_floor: 1800 },
    ],
    date_range_summary: "1800s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_support_layer", "upholstery_dust_cover"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_burlap_hessian_over_springs",
      "upholstery_construction_type_linen_scrim",
    ],
  },

  // ── Sub-batch 9 — Fasteners and Upholstery Attachment Clues (3; 1 AG) ──
  {
    id: "upholstery_construction_type_hand_tacks",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Hand-placed upholstery tacks with irregular spacing and oxidized heads; multiple tack-hole generations; very useful when combined with frame and textile evidence.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Fasteners and Upholstery Attachment Clues > Hand Tacks (paragraphs 692-696). 7/7 per A-6. replacement_likelihood medium per A-7 (modern restorers still use tacks). maker_associations: [] per D-UCN39-6. Cross-library FK per Q5=I + A-8: related_fastener_types to fastener_type_decorative_brass_tack (upholstery-tack family), related_hardware_types to hardware_type_upholstery_tacks. NO AG: 1600s-early 20th century with continued traditional use.",
    name: "Hand Tacks",
    parent_category_id: "upholstery_construction_category_fasteners_and_upholstery_attachment_clues",
    description: "Hand-placed upholstery tacks used to attach webbing, foundation textiles, and covers to the frame. Very useful for dating when combined with frame and textile evidence — multiple tack-hole generations prove repeated reupholstery campaigns. Modern restorers still use tacks, so hand tacks alone are not conclusive.",
    unique_traits: [
      "Hand-placed upholstery tacks",
      "Irregular spacing and hand placement (unlike machine staples)",
      "Multiple tack-hole generations record repeated reupholstery campaigns",
    ],
    identifying_characteristics: [
      "Irregular spacing, oxidized heads",
      "Multiple tack-hole generations",
      "Hand placement",
    ],
    period_associations: [
      { period_label: "Hand-tack attachment era", date_floor: 1600, date_ceiling: 1920 },
      { period_label: "Continued traditional and restoration tack use", date_floor: 1920 },
    ],
    date_range_summary: "1600s to early 20th century, with continued traditional use.",
    maker_associations: [],
    common_observed_locations: ["upholstery_attachment_point"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_decorative_brass_nails_nailhead_trim",
      "upholstery_construction_type_staples",
      "upholstery_construction_type_linen_hemp_jute_webbing",
    ],
    related_fastener_types: ["fastener_type_decorative_brass_tack"],
    related_hardware_types: ["hardware_type_upholstery_tacks"],
  },
  {
    id: "upholstery_construction_type_decorative_brass_nails_nailhead_trim",
    category: "upholstery_construction_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Brass or brass-colored nailheads along edges; may be structural, decorative, or replacement; heavily revived and cannot date alone.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Fasteners and Upholstery Attachment Clues > Decorative Brass Nails / Nailhead Trim (paragraphs 698-702). 7/7 per A-6. replacement_likelihood medium per A-7. maker_associations: [] per D-UCN39-6. Cross-library FK per Q5=I + A-8: related_hardware_types to hardware_type_decorative_nailhead_trim. NO AG: 1600s-present, heavily revived and cannot date alone.",
    name: "Decorative Brass Nails / Nailhead Trim",
    parent_category_id: "upholstery_construction_category_fasteners_and_upholstery_attachment_clues",
    description: "Brass or brass-colored nailheads along edges; may be structural, decorative, or replacement. Earlier nailheads may show hand irregularity and tarnish; modern strips often have every fifth nail real and the rest imitation. Nailhead trim is heavily revived and cannot date alone.",
    unique_traits: [
      "Brass or brass-colored nailheads along edges",
      "May be structural, decorative, or replacement",
      "Heavily revived; cannot date alone",
    ],
    identifying_characteristics: [
      "Brass or brass-colored nailheads along edges",
      "Earlier nailheads may show hand irregularity and tarnish",
      "Modern strips often have every fifth nail real and the rest imitation",
    ],
    period_associations: [
      { period_label: "Decorative nailhead trim era", date_floor: 1600 },
    ],
    date_range_summary: "1600s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_attachment_point", "upholstery_arm"],
    replacement_likelihood: "medium",
    related_construction_types: [
      "upholstery_construction_type_hand_tacks",
    ],
    related_hardware_types: ["hardware_type_decorative_nailhead_trim"],
  },
  {
    id: "upholstery_construction_type_staples",
    category: "upholstery_construction_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "U-shaped metal staples with regular spacing and pneumatic patterns; strong sign of modern upholstery or repair on antique frames; AG floor 1900.",
    notes: "Per American_Furniture_Textile_Reference.docx construction section > Fasteners and Upholstery Attachment Clues > Staples (paragraphs 704-708). 8/8 AG-anchor per A-6. replacement_likelihood high per A-7 (modern-repair indicator). maker_associations: [] per D-UCN39-6. AG floor 1900 per A-4 + D-HW36-15 (Mike-locked; canonical 'Mostly 20th century to present' — corrected from plan Q2=C draft 1940 to 1900 per construction-source canonical fidelity). Cross-library FK per Q5=I + A-8: related_fastener_types to fastener_type_upholstery_staple, related_joinery_types to joinery_type_stapled_drawer_joinery. **D-FA34-11 / D-HW36-16 cross-library AG floor DIVERGENCE — third concrete instance (D-UC40-5): construction Staples AG floor 1900 (per American_Furniture_Textile_Reference.docx 'Mostly 20th century') vs fasteners library fastener_type_upholstery_staple AG floor 1930 (per Fastener_Reference.docx 'c. 1930'). Each library encodes its own canonical-source floor; the divergence is per-source-document fidelity, not an error.**",
    name: "Staples",
    parent_category_id: "upholstery_construction_category_fasteners_and_upholstery_attachment_clues",
    description: "U-shaped metal staples used to attach webbing, foundation textiles, and covers. A strong sign of modern upholstery or repair on antique frames; staples usually date the upholstery campaign to the 20th century or later, not the frame.",
    unique_traits: [
      "U-shaped metal staples",
      "Regular machine spacing (unlike irregular hand tacks)",
      "Pneumatic driving patterns",
    ],
    identifying_characteristics: [
      "U-shaped metal staples",
      "Regular spacing, pneumatic patterns",
      "Staples usually date the upholstery campaign to the 20th century or later, not the frame",
    ],
    period_associations: [
      { period_label: "Upholstery staple era", date_floor: 1900 },
    ],
    date_range_summary: "Mostly 20th century to present in upholstery.",
    maker_associations: [],
    common_observed_locations: ["upholstery_attachment_point"],
    anti_classification_guidance: {
      boundary_date: 1900,
      boundary_type: "form_emergence",
      guidance_text: "Staples in upholstery are mostly 20th century to present; the decade-floor of 1900 is applied per D-HW36-15 (canonical 'Mostly 20th century to present'). Pre-1900 presence indicates misidentification or later reupholstery (reupholstery_campaign_warning per Rule #6) — staples on an antique frame are a strong sign of modern upholstery or repair, dating the upholstery campaign, not the frame. NOTE: this construction-library AG floor (1900) diverges from the fasteners-library fastener_type_upholstery_staple AG floor (1930) per D-FA34-11 / D-HW36-16 cross-library AG floor divergence convention — each library encodes its own canonical source document's introduction phrasing.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
    related_construction_types: [
      "upholstery_construction_type_hand_tacks",
      "upholstery_construction_type_sinuous_serpentine_spring",
      "upholstery_construction_type_elastic_webbing",
    ],
    related_fastener_types: ["fastener_type_upholstery_staple"],
    related_joinery_types: ["joinery_type_stapled_drawer_joinery"],
  },
];

/**
 * UPHOLSTERY_CONSTRUCTION_REASONING_RULES — 7 meta-rule entries
 * per Block 39 D-UCN39-5 SECOND application of D-UC37-7 expanded
 * reasoning rule set convention. All entries authority 9/9;
 * migration_status "complete"; migration_target engine
 * _reasoning. cross_layer_scope: true on Rule #1
 * (construction_alone_never_dates_frame) + Rule #5
 * (construction_evidence_layer_independence).
 *
 * SEVENTH canonical-library encoding of Independent Layer
 * Evaluation Standard per D-UCN39-9 (after wood rule #7, maker
 * rule #1, joinery rule #5, fastener rule #5, hardware rule #5,
 * upholstery covers rule #5).
 *
 * Rule #6 reupholstery_campaign_warning is a NEW canonical
 * reasoning-rule TYPE per D-UCN39-12. Rule #7 system_axis_sub
 * _output_routing is the SECOND application of the sub_output
 * _routing rule TYPE (parallels upholstery covers Rule #7).
 *
 * Per D-UCN39-5 Surfacing 2: the 5 canonical Diagnostic Cross-
 * Checks "If You Find X" patterns (horsehair / foam / coil
 * springs / serpentine springs / down or feather) CONSOLIDATE
 * into Rule #3 layer_consistency_check.
 */
export const UPHOLSTERY_CONSTRUCTION_REASONING_RULES: UpholsteryConstructionReasoningRule[] = [
  {
    id: "upholstery_construction_reasoning_construction_alone_never_dates_frame",
    category: "upholstery_construction_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Construction Alone Never Dates Frame",
    rule_statement: "Upholstery construction evidence — foundation system, spring type, stuffing/padding material, layering textiles, attachment fasteners — is NEVER primary dating authority alone for the frame. Construction evidence routes to the system-axis sub-output within the unified upholstery assessment section per D-UC37-3 two-assessment-with-sub-output-surfacing convention; the system-axis sub-output dates the upholstery system campaign, NOT automatically the frame. A chair frame may be 1880s, the springs may be 1920s replacement, the foam may be 1970s, and the visible fabric may be 2020s. Whole-piece dating combines construction evidence with frame evidence (wood, joinery, form, construction logic, fasteners, hardware — the frame assessment) AND with cover-axis evidence (visible cover sub-output within the upholstery assessment). A construction identification in isolation cannot date a frame.",
    rationale: "Per American_Furniture_Textile_Reference.docx construction section Core Rule canonical-source verbatim anchor (paragraphs 440-444): 'Upholstery construction can help date a piece, but it usually dates the upholstery campaign, not automatically the frame. A chair frame may be 1880s, the springs may be 1920s replacement, the foam may be 1970s, and the visible fabric may be 2020s.' Plus Frame-vs-Campaign Separation canonical anchor: 'Frame date / Original upholstery system date / Later reupholstery date / Current visible cover date.' Parallel discipline to wood / joinery / maker / fastener / hardware / upholstery covers library 'X alone never dates' meta-rules — and the construction equivalent of upholstery covers Rule #1 covers_alone_never_dates_furniture. cross_layer_scope: true reflects governance over construction evidence combination with all other evidence layers at both frame and upholstery assessment outputs per D-UC37-3 sub-output-surfacing convention.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_construction_type", "upholstery_construction_category"],
    cross_layer_scope: true,
    notes: "Construction-library counterpart to upholstery covers Rule #1 covers_alone_never_dates_furniture. Operates within the upholstery assessment section per D-UC37-3 — construction-axis evidence dates the upholstery system campaign (system sub-output), not whole-piece frame construction. Canonical-source Core Rule explicitly enumerates the four-date separation (frame / original upholstery system / later reupholstery / current visible cover) that this rule governs.",
  },
  {
    id: "upholstery_construction_reasoning_construction_dates_campaign_not_frame",
    category: "upholstery_construction_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Construction Dates Campaign Not Frame",
    rule_statement: "Upholstery construction evidence dates the upholstery SYSTEM CAMPAIGN — when the foundation system, springs, stuffing, and layering were installed — which routes to the 'upholstery system date' sub-output within the unified upholstery assessment section per D-UC37-3. The canonical four-date framework distinguishes: (1) Frame date — when the wood frame was built; (2) Original upholstery system date — when the piece was first upholstered; (3) Later reupholstery date — when the system was redone; (4) Current visible cover date — when the visible fabric was last applied. Construction evidence is strongest for date (2) or date (3); it does NOT establish date (1). Historic upholstery evidence is strongest when it agrees with tack holes, frame wear, tool marks, fasteners, and construction.",
    rationale: "Per American_Furniture_Textile_Reference.docx construction section Frame-vs-Campaign Separation canonical-source verbatim anchor: 'Frame date / Original upholstery system date / Later reupholstery date / Current visible cover date' + 'Historic upholstery evidence is strongest when it agrees with tack holes, frame wear, tool marks, fasteners, and construction.' Operationalizes D-UC37-3 two-assessment-with-sub-output-surfacing convention for the system sub-output: construction-axis evidence aggregates to the 'upholstery system date' sub-output (paired with covers-axis evidence aggregating to the 'visible cover date' sub-output). The construction-library analogue of upholstery covers Rule #2 replacement_likelihood_cover_specific — covers ARE replacement-prone-by-axis at the cover sub-layer; construction systems ARE campaign-dated-by-axis at the system sub-layer.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_construction_type", "upholstery_construction_category"],
    cross_layer_scope: false,
    notes: "Operationalizes the canonical four-date framework. Engine routing per D-UC37-3 surfaces the construction-axis sub-output as 'upholstery system date' within the unified upholstery assessment section. Per-entry replacement_likelihood field on UpholsteryConstructionTypeEntry carries the nuanced intra-system semantics — individual components (latex foam, serpentine springs, webbing) are partially replacement-prone, but the SYSTEM AS A WHOLE dates the campaign.",
  },
  {
    id: "upholstery_construction_reasoning_layer_consistency_check",
    category: "upholstery_construction_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Layer Consistency Check",
    rule_statement: "The engine must check whether all upholstery construction layers belong to the same era. A consistent system — webbing era + spring era + stuffing era + layering era + attachment era all agreeing — supports a single coherent upholstery campaign date. An inconsistent system — e.g. hand-tied coil springs under polyurethane foam under stapled modern cover — proves multiple campaigns layered over time. The canonical Diagnostic Cross-Checks operationalize this: finding horsehair, foam, coil springs, serpentine springs, or down/feather each implies a likely era AND a set of corroborating evidence to look for next. When layers conflict, the most recent layer dates the most recent campaign; earlier layers date earlier campaigns; the frame is dated separately by frame evidence.",
    rationale: "Per American_Furniture_Textile_Reference.docx construction section App-Friendly Identification Logic canonical-source verbatim anchor (step 5): 'Layer consistency: do all layers belong to the same era?' Plus the 5 canonical Diagnostic Cross-Checks (paragraphs 710-744): 'If You Find Horsehair' / 'If You Find Foam' / 'If You Find Coil Springs' / 'If You Find Serpentine Springs' / 'If You Find Down or Feather' — each providing likely-era possibilities + look-next-for corroboration guidance. Per D-UCN39-5 Surfacing 2: the 5 Diagnostic Cross-Checks CONSOLIDATE into this rule (they are operational sub-content of the layer-consistency principle, not 5 independent rules — 'If you find foam, look next for...' is operationally a layer-consistency check). This consolidation parallels the upholstery covers library 7-rule count per D-UC37-7 canonical-source-rigor convention.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_construction_type"],
    cross_layer_scope: false,
    notes: "Consolidates the 5 canonical Diagnostic Cross-Checks per D-UCN39-5 Surfacing 2. Operational framework rule: engine applies layer-consistency diagnostics across webbing + spring + stuffing + layering + attachment evidence to distinguish single-campaign systems from multi-campaign layered systems. Feeds Rule #6 reupholstery_campaign_warning when layers conflict.",
  },
  {
    id: "upholstery_construction_reasoning_frame_evidence_first_hierarchy",
    category: "upholstery_construction_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Frame Evidence First Hierarchy",
    rule_statement: "Whole-piece dating must follow the canonical seven-step identification hierarchy: (1) Frame evidence first — joinery, wood, tool marks, fasteners, form; (2) Foundation system — no springs, webbing, coil springs, serpentine springs, platform spring, elastic webbing; (3) Padding/fill — horsehair, tow, moss, cotton, kapok, foam, down, synthetic fiber; (4) Attachment evidence — tacks, nails, staples, clips, glue, zippers; (5) Layer consistency — do all layers belong to the same era; (6) Conflict resolution — older frame plus modern foam means reupholstery, not modern frame; (7) Output separate dates — frame date, upholstery system date, visible cover date. Frame evidence (the frame assessment) ranks ABOVE all upholstery construction evidence; construction evidence informs the upholstery system sub-output, never overrides frame evidence for the frame date.",
    rationale: "Per American_Furniture_Textile_Reference.docx construction section App-Friendly Identification Logic canonical-source verbatim anchor (paragraphs 747-755): the complete seven-step hierarchy. Step 1 places 'Frame evidence first: joinery, wood, tool marks, fasteners, form' above all construction evidence; step 6 'Conflict resolution: older frame plus modern foam means reupholstery, not modern frame' encodes the canonical conflict-resolution discipline; step 7 'Output separate dates' encodes the D-UC37-3 sub-output-surfacing convention. The construction-library analogue of upholstery covers Rule #4 attachment_and_backing_evidence_framework, but broader — it governs the whole evidence-ranking hierarchy across frame + upholstery system + cover.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_construction_type", "upholstery_construction_category"],
    cross_layer_scope: false,
    notes: "Encodes the canonical seven-step App-Friendly Identification Logic hierarchy. Absorbs the Fasteners and Upholstery Attachment Clues category's evidence-ranking content (step 4 attachment evidence). Engine applies this hierarchy to order evidence-layer evaluation; frame evidence is never overridden by construction evidence for the frame date.",
  },
  {
    id: "upholstery_construction_reasoning_construction_evidence_layer_independence",
    category: "upholstery_construction_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Construction Evidence Layer Independence",
    rule_statement: "Upholstery construction evidence (foundation system, spring type, stuffing/padding material, layering textiles, attachment fasteners, replacement_likelihood, industrial-introduction boundaries) is evaluated independently from other evidence layers (wood, maker marks, form, construction logic, joinery, fasteners, hardware, upholstery covers). Construction-axis findings must NOT be biased by upstream findings from other layers. The engine must not, for example, use a tentative form attribution to narrow construction-type candidates, nor use observed location to pre-filter construction types. Each layer outputs independent evidence; cross-layer combination occurs at the report layer via two-assessment-with-sub-output-surfacing per D-UC37-3 (frame assessment combines wood + maker + form + construction logic + joinery + fasteners + hardware; upholstery assessment combines upholstery covers + upholstery construction as sub-outputs).",
    rationale: "Per Block 22.5 D-PA-1 Independent Layer Evaluation Standard. Canonicalized for the upholstery construction library per the pattern established by wood reasoning rule #7 (wood_evidence_layer_independence), maker reasoning rule #1 (core_maker_attribution_rule cross_layer_scope), joinery reasoning rule #5 (joinery_evidence_layer_independence), fastener reasoning rule #5 (fastener_evidence_layer_independence), hardware reasoning rule #5 (hardware_evidence_layer_independence), and upholstery covers reasoning rule #5 (cover_evidence_layer_independence). SEVENTH canonical-library encoding of ILE Standard per D-UCN39-9. The rule explicitly blocks dependency-wiring proposals that would create downstream-evidence-from-upstream-evidence inference biases on the construction axis. Operationally integrates with D-UC37-3 two-assessment-with-sub-output-surfacing convention — construction-axis evidence layer outputs are independent inputs to the unified upholstery assessment section's system sub-output (alongside cover-axis evidence inputs to the cover sub-output).",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_construction_type", "upholstery_construction_category", "upholstery_construction_reasoning_rule"],
    cross_layer_scope: true,
    notes: "SEVENTH canonical-library encoding of Independent Layer Evaluation Standard (after wood, maker, joinery, fastener, hardware, upholstery covers) per D-UCN39-9. Cross-library convention reinforced: each evidence-library reasoning-rule set includes one layer-independence canonical artifact per ILE precedent. Completes the ILE encoding across all seven Phase 2 evidence libraries.",
  },
  {
    id: "upholstery_construction_reasoning_reupholstery_campaign_warning",
    category: "upholstery_construction_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Reupholstery Campaign Warning",
    rule_statement: "Upholstered furniture routinely accumulates multiple reupholstery campaigns over its lifetime, each layering newer construction over older. Modern construction evidence on an older frame indicates a later reupholstery campaign, NOT a modern frame: serpentine springs on a pre-1930s frame, polyurethane foam on a Victorian frame, elastic webbing on an early-20th-century frame, or staples on a hand-tack-era frame all prove later reupholstery. The engine must distinguish original-system construction evidence (carrying campaign-dating evidence consistent with the frame) from later-reupholstery construction evidence (carrying later-campaign-dating evidence that does NOT date the frame). Canonical reupholstery-campaign indicators include: industrial-introduction-boundary materials on older frames, multiple tack-hole generations, mixed-era layering (hand-tied coil springs under polyurethane foam), and attachment-method inconsistency (hand tacks plus staples on the same piece).",
    rationale: "Per American_Furniture_Textile_Reference.docx construction section Core Rule canonical-source verbatim anchor (paragraphs 440-444): 'A chair frame may be 1880s, the springs may be 1920s replacement, the foam may be 1970s, and the visible fabric may be 2020s' — the canonical multi-generational-layering warning. Plus App-Friendly Identification Logic step 6: 'Conflict resolution: older frame plus modern foam means reupholstery, not modern frame.' Plus canonical attachment evidence: 'A frame with several generations of tack holes suggests repeated reupholstery.' NEW canonical reasoning-rule TYPE per D-UCN39-12 — SEVENTH new evidence-library reasoning-rule TYPE after restoration_false_signals (joinery Rule #3) + replacement_fastener_risk (fastener Rule #2) + restoration_contamination (fastener Rule #4) + reproduction_hardware_warning (hardware Rule #4) + cover_revival_warning (covers Rule #6) + cover_axis_sub_output_routing (covers Rule #7). Construction-axis-specific reupholstery warning because construction systems are canonically the MOST-layered evidence axis — a single piece may carry 3-4 distinct construction campaigns physically stacked.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_construction_type", "upholstery_construction_category"],
    cross_layer_scope: false,
    notes: "NEW canonical reasoning-rule TYPE per D-UCN39-12. Construction-library counterpart to upholstery covers Rule #6 cover_revival_warning (same multi-campaign-layering dynamics; different evidence axis — covers warns about revival textiles misleading attribution, construction warns about reupholstery campaigns layering physically over time). Feeds from Rule #3 layer_consistency_check (inconsistent layers trigger reupholstery-campaign reasoning). Industrial-introduction-boundary construction types (Latex Foam 1930+, Polyurethane Foam 1950+, Serpentine Springs 1930+, Elastic Webbing 1940+, Memory Foam 1990+) carry AG entries at Block 40 that operationalize this rule's hard-floor logic.",
  },
  {
    id: "upholstery_construction_reasoning_system_axis_sub_output_routing",
    category: "upholstery_construction_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "System Axis Sub-Output Routing",
    rule_statement: "Construction-axis evidence routes to the 'upholstery system date' sub-output within the unified upholstery assessment section on report per D-UC37-3 two-assessment-with-sub-output-surfacing convention. Engine reads library-level constants UPHOLSTERY_CONSTRUCTION_ASSESSMENT_LAYER = 'upholstery' + UPHOLSTERY_CONSTRUCTION_EVIDENCE_SUB_LAYER = 'system' (paired with upholsteryCovers.ts UPHOLSTERY_COVERS_ASSESSMENT_LAYER = 'upholstery' + UPHOLSTERY_COVERS_EVIDENCE_SUB_LAYER = 'cover') and aggregates construction-axis evidence to produce the 'upholstery system date' sub-output (when the upholstery foundation system was installed). Cover-axis evidence aggregates to the 'visible cover date' sub-output. Both sub-outputs surface within the unified upholstery assessment section on report; whole-piece dating combines the frame assessment with both upholstery sub-outputs per appraiser-practice convention.",
    rationale: "Operationalizes D-UC37-3 two-assessment-with-sub-output-surfacing convention at reasoning-rule level for the system sub-layer. SECOND application of the sub_output_routing rule TYPE — parallels upholstery covers library Rule #7 cover_axis_sub_output_routing (D-UC37-13). Per Mike's appraiser-practice judgment: covers + construction libraries BOTH route to a single 'upholstery' assessment_layer at library level; engine surfaces upholstery system date + visible cover date as SUB-OUTPUTS within the unified upholstery assessment section on report. Together with covers Rule #7, this rule completes the operationalization of D-UC37-3 across both upholstery sub-layers. Per D-MM27-9 Phase 2 / Phase 3 separation: rule is encoded as canonical content here; engine.ts implementation of sub-output aggregation deferred to Phase 3 engine implementation.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_construction_type", "upholstery_construction_category"],
    cross_layer_scope: false,
    notes: "SECOND application of the sub_output_routing rule TYPE (first was upholstery covers Rule #7 cover_axis_sub_output_routing per D-UC37-13). Engine-layer routing rule (not evidence-interpretation rule). Together with covers Rule #7 it operationalizes D-UC37-3 two-assessment-with-sub-output-surfacing convention at the reasoning-rule level across both upholstery sub-layers (cover + system). Per D-MM27-9 Phase 2 / Phase 3 separation: engine.ts implementation deferred to Phase 3.",
  },
];
