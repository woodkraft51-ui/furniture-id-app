// joinery.ts
//
// Joinery library. Phase 2 Session 7 (four-file evidence libraries
// architecture; first library = joinery). Block 30 ships schema
// foundation + 15 categories + 5 reasoning rules; Block 31 follows
// with ~40 JOINERY_TYPES content authoring from
// JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx canonical source.
//
// Architecture:
// - JoineryCategoryEntry: 15 top-level category entries (parent-
//   category pattern parallel to wood's WOOD_CATEGORIES).
// - JoineryTypeEntry: per-type entries; flat fields parallel to
//   MakerMarkEntry pattern. Block 31 authors ~40 entries.
// - JoineryReasoningRule: meta-rule entries parallel to
//   WoodEvidenceReasoningRule + MakerAttributionReasoningRule
//   shape. Block 30 authors 5 entries.
// - Cross-library CategoryEntry promotion to entryShape.ts
//   deferred to end-of-Phase-2 reconciliation pass per D-JN30-7
//   (Q6 Option C: schema-occurrence rule 3+ threshold applied at
//   reconciliation pass after fasteners + hardware + upholstery
//   covers + upholstery construction libraries exist).
// - engine.ts UNCHANGED per Phase 2 / Phase 3 separation.

import type {
  CanonicalEntry,
  PeriodAssociation,
  AntiClassificationGuidance,
  ReasoningRuleMigrationTarget,
} from "./entryShape";

/**
 * JoineryCategoryEntry — top-level joinery category per Block 30
 * D-JN30-4. 15 categories per JOINERY_IDENTIFICATION_MASTER_
 * BREAKDOWN.docx PRIMARY JOINERY CATEGORIES section (Op A-4
 * enumeration). Each category groups specific joinery types into
 * functional clusters (edge-to-edge, corner, frame, carcase,
 * drawer, panel retention, etc.).
 *
 * Field roster:
 * - category: literal "joinery_category"
 * - name: canonical category name verbatim from seed
 * - category_description: prose description from seed CATEGORY
 *   DESCRIPTION section
 * - unique_category_traits?: array from seed UNIQUE CATEGORY
 *   TRAITS or UNIQUE TRAITS section (optional; some categories
 *   surface only at per-type level)
 * - identifying_elements?: array from seed IDENTIFYING ELEMENTS
 *   section (optional)
 * - common_in?: array from seed COMMON IN section (Frame Joinery
 *   uses this in lieu of identifying_elements)
 * - parent_category_id?: FK to another category id for sub-family
 *   encoding; undefined for all 15 Block 30 entries per Op A-4
 *   Surfacing 2 resolution (Dovetail Family is top-level, not
 *   nested under Carcase)
 */
export interface JoineryCategoryEntry extends CanonicalEntry {
  category: "joinery_category";
  name: string;
  category_description: string;
  unique_category_traits?: string[];
  identifying_elements?: string[];
  common_in?: string[];
  parent_category_id?: string;
}

/**
 * JoineryTypeEntry — per-joinery-type canonical entry per Block 30
 * D-JN30-3. Flat fields parallel to MakerMarkEntry pattern. Block
 * 31 authors ~40 entries spanning 15 parent categories.
 *
 * Field roster (13 declared fields beyond CanonicalEntry):
 * - category: literal "joinery_type"
 * - name: joinery type name verbatim from seed
 * - parent_category_id: FK to JoineryCategoryEntry.id
 * - description: prose from seed DESCRIPTION
 * - unique_traits: array from seed UNIQUE TRAITS
 * - identifying_characteristics: array from seed IDENTIFYING
 *   CHARACTERISTICS
 * - period_associations: PeriodAssociation[] from seed DATE RANGE
 *   + cross-validated against GENERAL DATE ASSOCIATION SUMMARY
 * - date_range_summary: prose summary from seed DATE RANGE
 * - structural_role?: prose role context
 * - hand_vs_machine_classification?: three-tier enum per Rule #4
 *   framework
 * - regional_persistence_notes?: regional persistence prose
 *   per Rule #2 framework
 * - anti_classification_guidance?: optional boundary-date
 *   guidance
 * - related_joinery_types?: cross-references to sibling/family
 *   joinery types
 *
 * Per D-JN30-11: NO PositionOnPiece field. Joinery types
 * characterized by construction pattern, not physical location.
 */
export interface JoineryTypeEntry extends CanonicalEntry {
  category: "joinery_type";
  name: string;
  parent_category_id: string;
  description: string;
  unique_traits: string[];
  identifying_characteristics: string[];
  period_associations: PeriodAssociation[];
  date_range_summary: string;
  structural_role?: string;
  hand_vs_machine_classification?:
    | "strongly_early"
    | "strongly_industrial"
    | "transitional"
    | "spans_eras";
  regional_persistence_notes?: string;
  anti_classification_guidance?:
    | AntiClassificationGuidance
    | AntiClassificationGuidance[];
  related_joinery_types?: string[];
}

/**
 * JoineryReasoningRule — meta-rule entries per Block 30 D-JN30-5.
 * Parallel shape to WoodEvidenceReasoningRule + MakerAttribution
 * ReasoningRule. 5 entries authored Block 30. Authority 9/9 per
 * D-WE26-8 / D-MM27-5 meta-rule supremacy precedent;
 * migration_status "complete" per D-WE26-11 convention.
 */
export interface JoineryReasoningRule extends CanonicalEntry {
  category: "joinery_reasoning_rule";
  rule_name: string;
  rule_statement: string;
  rationale: string;
  migration_target: ReasoningRuleMigrationTarget;
  applies_to_entry_types?: string[];
  cross_layer_scope?: boolean;
}

/**
 * JOINERY_CATEGORIES — 15 top-level joinery categories per
 * Block 30 D-JN30-4. Per D-JN30-8 authority calibration: 4
 * categories at 8/8 (Carcase, Drawer, M&T Family, Dovetail Family
 * — primary dating-evidence rigor); 11 categories at 7/7 (medium-
 * strong with canonical-source rationale). All 15 entries
 * parent_category_id undefined per Op A-4 Surfacing 2 (Dovetail
 * Family is top-level).
 */
export const JOINERY_CATEGORIES: JoineryCategoryEntry[] = [
  {
    id: "joinery_category_edge_to_edge",
    category: "joinery_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Joinery used to widen boards by connecting edges together into larger panels such as tabletops, case sides, lids, desk surfaces, and cabinet backs.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx EDGE-TO-EDGE JOINERY section (seed lines 39-132). Medium-strong dating-evidence category per D-JN30-8.",
    name: "Edge-to-Edge Joinery",
    category_description: "Joinery used to widen boards by connecting edges together into larger panels such as tabletops, case sides, lids, desk surfaces, cabinet backs.",
    unique_category_traits: [
      "longitudinal grain continuity",
      "broad surface creation",
      "seasonal wood movement management",
      "often reinforced from below",
      "usually invisible from front surfaces",
    ],
    identifying_elements: [
      "glue seams",
      "spline slots",
      "biscuit pockets",
      "dowels",
      "tongue-and-groove edges",
      "butterfly keys",
      "board mismatch",
      "grain continuity interruption",
    ],
  },
  {
    id: "joinery_category_corner",
    category: "joinery_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Joinery connecting boards at approximately 90 degrees for box and case formation.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx CORNER JOINERY section (seed lines 133-194). Medium-strong dating-evidence category per D-JN30-8.",
    name: "Corner Joinery",
    category_description: "Joinery connecting boards at approximately 90 degrees.",
    unique_category_traits: [
      "structural load transfer",
      "squareness maintenance",
      "box/case formation",
    ],
    identifying_elements: [
      "exposed end grain",
      "interlocking cuts",
      "reinforcements",
      "corner blocks",
      "glue squeeze-out",
      "pins or pegs",
    ],
  },
  {
    id: "joinery_category_frame",
    category: "joinery_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Joinery creating skeletal frameworks for chairs, tables, cabinet frames, bedsteads, and mirrors.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx FRAME JOINERY section (seed lines 195-242). Medium-strong dating-evidence category per D-JN30-8. Seed uses COMMON IN section in lieu of IDENTIFYING ELEMENTS per per-category field-naming variance (D-JN30-9).",
    name: "Frame Joinery",
    category_description: "Joinery creating skeletal frameworks.",
    unique_category_traits: [
      "load-bearing intersections",
      "racking resistance",
      "leg/apron integration",
    ],
    common_in: [
      "chairs",
      "tables",
      "cabinet frames",
      "bedsteads",
      "mirrors",
    ],
  },
  {
    id: "joinery_category_carcase_case_construction",
    category: "joinery_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Joinery forming cabinets, chests, desks, cupboards, and case furniture; primary dating-evidence category per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx HIGH-AUTHORITY DATING INDICATORS framework.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx CARCASE / CASE CONSTRUCTION JOINERY section (seed lines 243-281). Primary dating-evidence rigor per D-JN30-8 (8/8 calibration); through-dovetail hand-cut vs machine-cut boundary canonical for early-vs-industrial classification.",
    name: "Carcase / Case Construction Joinery",
    category_description: "Joinery forming cabinets, chests, desks, cupboards, and case furniture.",
    unique_category_traits: [
      "vertical load support",
      "large panel stabilization",
      "squareness retention",
    ],
  },
  {
    id: "joinery_category_drawer",
    category: "joinery_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Joinery specifically associated with drawer assembly; primary dating-evidence category per hand-cut vs machine-cut + stapled era boundaries (1870-1885 machine adoption; 1950s stapled adoption).",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx DRAWER JOINERY section (seed lines 282-322). Primary dating-evidence rigor per D-JN30-8 (8/8 calibration); hand-cut drawer dovetails 1700s-1900s; machine-cut common after 1870-1885; stapled 1950s-present canonical era boundaries.",
    name: "Drawer Joinery",
    category_description: "Joinery specifically associated with drawer assembly.",
    unique_category_traits: [
      "repeated open/close stress",
      "front concealment requirements",
      "thin stock management",
    ],
  },
  {
    id: "joinery_category_panel_retention",
    category: "joinery_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Joinery designed to hold floating panels and accommodate seasonal wood movement.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx PANEL RETENTION JOINERY section (seed lines 323-341). Medium-strong dating-evidence category per D-JN30-8.",
    name: "Panel Retention Joinery",
    category_description: "Joinery designed to hold floating panels.",
    unique_category_traits: [
      "accommodates wood movement",
      "prevents panel cracking",
    ],
  },
  {
    id: "joinery_category_mortise_and_tenon_family",
    category: "joinery_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "One of the oldest and most important furniture joinery systems; primary dating-evidence category per drawbored vs blind vs wedged vs pegged historical diagnostics.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx MORTISE-AND-TENON FAMILY section (seed lines 342-404). Primary dating-evidence rigor per D-JN30-8 (8/8 calibration); drawbored M&T 1600s-early 1900s is a STRONGLY EARLY indicator per HIGH-AUTHORITY DATING INDICATORS section.",
    name: "Mortise-and-Tenon Family",
    category_description: "One of the oldest and most important furniture joinery systems.",
    unique_category_traits: [
      "projecting tenon inserted into mortise cavity",
      "excellent structural strength",
      "dominant in quality frame construction",
    ],
  },
  {
    id: "joinery_category_dovetail_family",
    category: "joinery_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Interlocking wedge-shaped joinery resisting pull-apart forces; primary dating-evidence category per hand-cut irregular vs machine-cut uniform geometry boundary.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx DOVETAIL FAMILY section (seed lines 405-435). Primary dating-evidence rigor per D-JN30-8 (8/8 calibration). Op A-4 Surfacing 2 resolution: seed treats Dovetail Family as TOP-LEVEL category (not sub-family of Carcase); parent_category_id undefined.",
    name: "Dovetail Family",
    category_description: "Interlocking wedge-shaped joinery resisting pull-apart forces.",
    unique_category_traits: [
      "trapezoidal geometry",
      "mechanical locking",
      "high tensile resistance",
    ],
  },
  {
    id: "joinery_category_mechanical_reinforced",
    category: "joinery_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Joinery augmented by secondary mechanical support (dowels, pocket screws, corrugated fasteners).",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx MECHANICAL / REINFORCED JOINERY section (seed lines 436-471). Medium-strong dating-evidence category per D-JN30-8; pocket screws 1980s+ + corrugated fastener late-1800s+ canonical era anchors.",
    name: "Mechanical / Reinforced Joinery",
    category_description: "Joinery augmented by secondary mechanical support.",
  },
  {
    id: "joinery_category_chair_and_seating",
    category: "joinery_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Joinery specialized for dynamic body loads; Windsor and stick furniture round-tenon tradition central.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx CHAIR AND SEATING JOINERY section (seed lines 472-494). Medium-strong dating-evidence category per D-JN30-8; splayed/wedged through tenon 1700s+ STRONGLY EARLY indicator (Arts & Crafts and Windsor revivals continue).",
    name: "Chair and Seating Joinery",
    category_description: "Joinery specialized for dynamic body loads.",
  },
  {
    id: "joinery_category_veneer_and_surface",
    category: "joinery_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Joinery related to surface attachment rather than structure (hammer veneering hot hide glue tradition vs vacuum press modern adhesion).",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx VENEER AND SURFACE JOINERY section (seed lines 495-518). Medium-strong dating-evidence category per D-JN30-8; hammer veneering 1700s-early 1900s vs vacuum press mid-1900s+ canonical era boundary.",
    name: "Veneer and Surface Joinery",
    category_description: "Joinery related to surface attachment rather than structure.",
  },
  {
    id: "joinery_category_decorative_specialty",
    category: "joinery_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Joinery serving aesthetic or highly specialized functions (knuckle joints, coopered stave construction).",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx DECORATIVE / SPECIALTY JOINERY section (seed lines 519-542). Medium-strong dating-evidence category per D-JN30-8.",
    name: "Decorative / Specialty Joinery",
    category_description: "Joinery serving aesthetic or highly specialized functions.",
  },
  {
    id: "joinery_category_knock_down_modular",
    category: "joinery_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Joinery intended for disassembly and transport (bed bolts; cam locks for flat-pack assembly).",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx KNOCK-DOWN / MODULAR JOINERY section (seed lines 543-567). Medium-strong dating-evidence category per D-JN30-8; cam lock 1960s+ canonical era anchor.",
    name: "Knock-Down / Modular Joinery",
    category_description: "Joinery intended for disassembly and transport.",
  },
  {
    id: "joinery_category_modern_industrial",
    category: "joinery_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Machine-optimized high-speed production joinery (Confirmat screws for particleboard; CNC interlocking precision systems).",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx MODERN INDUSTRIAL JOINERY section (seed lines 568-591). Medium-strong dating-evidence category per D-JN30-8; CNC 1990s+ and Confirmat 1970s+ canonical era anchors; both are STRONGLY INDUSTRIAL indicators per HIGH-AUTHORITY DATING INDICATORS section.",
    name: "Modern Industrial Joinery",
    category_description: "Machine-optimized high-speed production joinery.",
  },
  {
    id: "joinery_category_upholstery_structural",
    category: "joinery_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Joinery hidden beneath upholstery (corner block reinforcement; webbing rail construction).",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx UPHOLSTERY STRUCTURAL JOINERY section (seed lines 592-616). Medium-strong dating-evidence category per D-JN30-8; webbing rail 1700s+ traditional upholstery support.",
    name: "Upholstery Structural Joinery",
    category_description: "Joinery hidden beneath upholstery.",
  },
];

/**
 * JOINERY_TYPES — per-joinery-type canonical entries. Empty in
 * Block 30 scaffold; Block 31 authors ~40 entries from
 * JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx SPECIFIC TYPES
 * content (40 DATE RANGE markers in seed = 40 canonical types).
 */
export const JOINERY_TYPES: JoineryTypeEntry[] = [];

/**
 * JOINERY_REASONING_RULES — 5 meta-rule entries per Block 30
 * D-JN30-5. All entries authority 9/9; migration_status
 * "complete"; migration_target engine_reasoning. cross_layer_
 * scope: true on rules #1 + #5 (joinery_alone_never_dates_
 * furniture + joinery_evidence_layer_independence). Other 3
 * rules (rural_persistence_warning, restoration_false_signals,
 * high_authority_dating_indicators_framework) cross_layer_
 * scope: false (joinery-layer-only).
 */
export const JOINERY_REASONING_RULES: JoineryReasoningRule[] = [
  {
    id: "joinery_reasoning_joinery_alone_never_dates_furniture",
    category: "joinery_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Joinery Alone Never Dates Furniture",
    rule_statement: "Joinery evidence — hand-cut vs machine-cut character, joint type identification, dating-indicator classification — is supporting evidence for dating attribution but is NEVER primary dating authority alone. Joinery evidence must combine with fasteners, saw marks, finish, wood species, hardware, form, wear, and overall construction system to support a dating conclusion. A joinery identification in isolation cannot date a piece; a piece's joinery convergence with other evidence axes produces dateable attribution.",
    rationale: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx IMPORTANT IDENTIFICATION WARNINGS section 'DO NOT DATE FROM ONE JOINT ALONE.' Hand-cut dovetail joinery can span 1600s through early 1900s; mortise-and-tenon ancient through present; the joint type alone does not narrow dating. The rule prevents the engine from over-weighting joinery evidence and producing confidently-wrong dating decisions. Parallel discipline to wood_alone_never_dates_furniture (D-WE26-6 wood library rule #1) and core_maker_attribution_rule (Block 27 maker reasoning rule #1). Joinery + correlate-evidence convergence is the canonical attribution pattern.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["joinery_type", "joinery_category"],
    cross_layer_scope: true,
    notes: "JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx 'DO NOT DATE FROM ONE JOINT ALONE' canonical source (seed lines 639-648). Correlation list per source: fasteners + saw marks + finish + wood species + hardware + form + wear + construction system. cross_layer_scope: true reflects governance over joinery-evidence-axis combination with non-joinery evidence layers at report layer. Third canonical-library encoding of the 'X alone never dates furniture' pattern (after wood + maker).",
  },
  {
    id: "joinery_reasoning_rural_persistence_warning",
    category: "joinery_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Rural Persistence Warning",
    rule_statement: "Hand joinery techniques persisted in regional production long after industrialization elsewhere established machine-cut alternatives. The engine must NOT auto-date hand-cut joinery to pre-1850 production; regional persistence patterns mean hand-cut joinery in Appalachian, Mennonite, Shaker, frontier, and rural Southern production continues into late 19th and early 20th centuries. Hand-cut joinery raises dating-floor questions but does NOT establish dating-ceiling without corroborating evidence.",
    rationale: "Per seed RURAL PERSISTENCE WARNING section (seed lines 659-666): 'Hand joinery persisted regionally long after industrialization ... Hand-cut joinery does NOT automatically mean pre-1850.' Regional examples per seed: Appalachian, Mennonite, Shaker, frontier workshops, rural Southern production. The rule governs engine reasoning to surface regional persistence context when hand-cut joinery evidence accumulates, preventing inappropriate dating-ceiling assertions.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["joinery_type"],
    cross_layer_scope: false,
    notes: "Affects specifically the hand-cut dovetail and hand-cut M&T joinery type entries when authored Block 31. Cross-references regional context for Shaker maker entry (Block 28a maker_mark_shaker_communities) where Shaker community attribution discipline shares parallel appraiser-honest framework.",
  },
  {
    id: "joinery_reasoning_restoration_false_signals",
    category: "joinery_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Restoration False Signals",
    rule_statement: "Modern restorations and repairs introduce modern joinery components into pieces of any era: modern glue, screws, biscuits, dowels, replacement blocks, and similar repair-introduced components. The engine must distinguish ORIGINAL joinery (carrying canonical dating evidence) from REPAIR joinery (carrying repair-era dating context but NOT original construction dating). Mixed original + repair joinery is the typical case in surviving antique pieces; per-piece original-vs-repair determination precedes joinery-evidence accumulation.",
    rationale: "Per seed RESTORATION FALSE SIGNALS section (seed lines 649-657). The rule prevents the engine from interpreting repair-era modern joinery components as evidence against pre-modern original construction. Pattern parallel to maker marks Universal Rule #4 (retail labels are not always maker labels — repair-channel evidence is distinct from original-construction evidence). Repair-component list per seed: modern glue, screws, biscuits, dowels, replacement blocks.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["joinery_type", "joinery_category"],
    cross_layer_scope: false,
    notes: "Per-type anti_classification_guidance on affected joinery types (Block 31 authoring) operationalizes this rule for specific repair-introduced components. Seed canonical determination: 'Always determine: original joinery vs repair joinery.'",
  },
  {
    id: "joinery_reasoning_high_authority_dating_indicators_framework",
    category: "joinery_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "High-Authority Joinery Dating Indicators Framework",
    rule_statement: "Joinery dating evidence classifies into three canonical tiers: STRONGLY EARLY indicators (hand-cut irregular dovetails, drawbored mortise-and-tenon, wedged through tenons, large hand-chiseled mortises, uneven saw kerfs, hand-planed shoulders) supporting pre-mid-1800s production AS ONE EVIDENCE AXIS subject to rural persistence rule; STRONGLY INDUSTRIAL indicators (perfectly uniform dovetails, dowel mass production, biscuit joinery, pocket screws, cam locks, CNC geometry, staple construction) supporting post-1850-through-modern production AS ONE EVIDENCE AXIS; TRANSITIONAL indicators (semi-regular hand dovetails, mixed hand/machine evidence, early machine mortising, hand-fit machine components) supporting mid-19th-century-through-early-20th-century transitional periods. Per the joinery_alone_never_dates_furniture meta-rule, all three tiers require corroborating non-joinery evidence for dating-attribution.",
    rationale: "Per seed HIGH-AUTHORITY JOINERY DATING INDICATORS section three-tier classification (seed lines 617-636). Tier classification is itself the canonical rule; per-joinery-type entries (Block 31) carry hand_vs_machine_classification field referencing this three-tier scheme. The rule provides engine.ts with the canonical classification logic for joinery-evidence-axis indicator interpretation. Strongly early: 6 indicators. Strongly industrial: 7 indicators. Transitional: 4 indicators.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["joinery_type"],
    cross_layer_scope: false,
    notes: "Engine integration consumes via hand_vs_machine_classification field on per-joinery-type entries (Block 31 authoring). Three-tier classification scheme is the canonical framework; individual joinery type entries classify within this framework. Cross-validated against GENERAL DATE ASSOCIATION SUMMARY table at seed lines 668-692 (11 type-to-era rows).",
  },
  {
    id: "joinery_reasoning_joinery_evidence_layer_independence",
    category: "joinery_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Joinery Evidence Layer Independence",
    rule_statement: "Joinery evidence (joint type, hand vs machine character, three-tier dating-indicator tier, etc.) is evaluated independently from other evidence layers (wood, maker marks, form, construction logic, fasteners, hardware, textile). Joinery-axis findings must NOT be biased by upstream findings from other layers. The engine must not, for example, use a tentative form attribution (e.g., 'this looks like a Federal piece') to narrow joinery-type candidates, nor use wood species to weight which joinery types are 'likely' for that wood. Each layer outputs independent evidence; cross-layer combination occurs at the report layer via conflict surfacing and confidence aggregation, not via upstream filtering.",
    rationale: "Per Block 22.5 D-PA-1 Independent Layer Evaluation Standard. Canonicalized for joinery library per the pattern established by wood reasoning rule #7 (wood_evidence_layer_independence) and maker reasoning rule #1 (core_maker_attribution_rule cross_layer_scope). The rule explicitly blocks dependency-wiring proposals that would create downstream-evidence-from-upstream-evidence inference biases on the joinery axis. Each layer evaluates from canonical evidence on its own axis; the report layer surfaces conflicts and combined-confidence without upstream layer deference.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["joinery_type", "joinery_category", "joinery_reasoning_rule"],
    cross_layer_scope: true,
    notes: "Third canonical-library encoding of Independent Layer Evaluation Standard (after wood rule #7 and maker rule #1 cross_layer_scope). cross_layer_scope: true reflects governance over joinery layer's combination with all other evidence layers at engine integration time. Future evidence libraries (fasteners, hardware, upholstery covers, upholstery construction) will author analogous layer-independence rules for their own axes when those libraries are authored.",
  },
];
