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
  PositionOnPiece,
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

  /** Block 0.5a additions per Path A schema foundation (D-PH3HCL-S1-N) */

  /** Engine assessment-layer routing. Per Phase 2 D-FA34-N convention,
   * canonical entries declare which assessment layer the engine routes
   * them to. Default "frame" for most joinery; "upholstery" possible for
   * furniture-specific joinery edge cases. Existing 40 joinery type
   * entries omit this field (engine defaults to "frame" routing); new
   * joinery type entries authored in Block 0.5c may set explicitly. */
  assessment_layer?: "frame" | "upholstery" | "style_and_waves";

  /** Cross-library FK array to fasteners.ts type entries. Joinery often
   * co-occurs with specific fastener types (e.g., dovetail joinery with
   * cut nails); this field captures the co-occurrence relationships.
   * Bare-string array of fastener_type_* or fastener_subcategory_* ids.
   * Resolved at engine-layer Phase 3 by name-matching. */
  related_fastener_types?: string[];

  /** Structured location array per Decision 1 = L2 (Block 0.5 schema
   * inspection AG1 lock). Each location object pairs a canonical
   * PhysicalLocation enum value with optional appraiser-specific
   * descriptive supplement (physical_location_notes). Replaces the
   * common_observed_locations bare-string pattern for joinery types
   * authored with finer-grained appraiser-knowledge nuance. */
  position_on_piece?: PositionOnPiece[];
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
export const JOINERY_TYPES: JoineryTypeEntry[] = [
  // ─── Sub-batch C-1: Edge-to-Edge Joinery (5 types) ───
  {
    id: "joinery_type_butt_edge_glued",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Two flat board edges glued together without shaping; simplest edge-to-edge panel construction.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx EDGE-TO-EDGE JOINERY > Butt Joint (Edge Glued) section. spans_eras per seed 'Ancient usage to present'; 7/7 medium-strong per D-JN30-8.",
    name: "Butt Joint (Edge Glued)",
    parent_category_id: "joinery_category_edge_to_edge",
    description: "Two flat board edges glued together without shaping.",
    unique_traits: [
      "simplest panel construction",
      "relies entirely on glue strength",
      "often reinforced underneath",
    ],
    identifying_characteristics: [
      "straight seam",
      "no visible mechanical interlock",
      "possible separation over time",
      "alignment irregularities in handmade work",
    ],
    period_associations: [
      {
        period_label: "Ancient–present general usage",
        date_floor: 1500,
        usage_notes: "Most common after widespread hide glue usage; extremely common after 1850 per seed.",
      },
    ],
    date_range_summary: "Ancient usage to present. Most common after widespread hide glue usage. Extremely common after 1850.",
    hand_vs_machine_classification: "spans_eras",
  },
  {
    id: "joinery_type_tongue_and_groove",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Self-aligning edge joinery with tongue on one board and matching groove on the other.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx EDGE-TO-EDGE JOINERY > Tongue-and-Groove section. 1700s–present; 7/7 medium-strong per D-JN30-8.",
    name: "Tongue-and-Groove",
    parent_category_id: "joinery_category_edge_to_edge",
    description: "One board edge has a tongue; the other a matching groove.",
    unique_traits: [
      "self-aligning",
      "improves panel stability",
      "accommodates movement",
    ],
    identifying_characteristics: [
      "hidden interlocking profile",
      "visible only at exposed ends or damage",
      "repeated profile in flooring/paneling",
    ],
    period_associations: [
      {
        period_label: "1700s–present",
        date_floor: 1700,
        usage_notes: "Industrial machine production exploded after 1850 per seed.",
      },
    ],
    date_range_summary: "1700s–present. Industrial machine production exploded after 1850.",
  },
  {
    id: "joinery_type_spline_joint",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Loose strip inserted into grooves cut into adjoining edges for alignment and reinforcement.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx EDGE-TO-EDGE JOINERY > Spline Joint section. 1800s–present; 7/7 medium-strong per D-JN30-8.",
    name: "Spline Joint",
    parent_category_id: "joinery_category_edge_to_edge",
    description: "Loose strip inserted into grooves cut into adjoining edges.",
    unique_traits: [
      "alignment assistance",
      "reinforcement without visible external hardware",
    ],
    identifying_characteristics: [
      "central inserted strip",
      "often visible at damaged edges",
      "machine-cut groove consistency",
    ],
    period_associations: [
      {
        period_label: "1800s–present",
        date_floor: 1800,
        usage_notes: "More common after industrial milling per seed.",
      },
    ],
    date_range_summary: "1800s–present. More common after industrial milling.",
  },
  {
    id: "joinery_type_biscuit_joint",
    category: "joinery_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Compressed football-shaped wafer inserted into matching slots; STRONGLY INDUSTRIAL indicator per seed.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx EDGE-TO-EDGE JOINERY > Biscuit Joint section. 8/8 strongly_industrial indicator-list match + AG anchor per D-JN30-8 + A-7. AG floor 1950 (NOT 1980) per A-5 + D-JN31-4: seed 'experimental' presence dates to 1950s; 1980 is widespread-use date captured in period_associations as second entry.",
    name: "Biscuit Joint",
    parent_category_id: "joinery_category_edge_to_edge",
    description: "Compressed football-shaped wafer inserted into matching slots.",
    unique_traits: [
      "modern alignment system",
      "machine-assisted assembly",
    ],
    identifying_characteristics: [
      "crescent/oval slot impressions",
      "modern adhesives",
      "extremely uniform spacing",
    ],
    period_associations: [
      {
        period_label: "Experimental introduction",
        date_floor: 1950,
        date_ceiling: 1979,
        usage_notes: "1950s experimental per seed.",
      },
      {
        period_label: "Widespread adoption",
        date_floor: 1980,
        usage_notes: "Common after 1980 per seed.",
      },
    ],
    date_range_summary: "1950s experimental. Common after 1980.",
    hand_vs_machine_classification: "strongly_industrial",
    anti_classification_guidance: {
      boundary_date: 1950,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1950 presence of biscuit joinery indicates either repair-introduction (Restoration False Signals per JoineryReasoningRule #3) or misidentification; this joinery did not exist in pre-1950 original construction. Biscuit joinery emerged as 1950s experimental work; widespread adoption is post-1980.",
      prominence: "prominent",
    },
  },
  {
    id: "joinery_type_butterfly_dutchman_key",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Bowtie-shaped insert crossing a crack or seam; both structural and decorative.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx EDGE-TO-EDGE JOINERY > Butterfly / Dutchman Key section. Multi-period: 1700s baseline + Arts & Crafts revival c. 1890–1920 + modern artisan revival 1970s+. 7/7 medium-strong per D-JN30-8.",
    name: "Butterfly / Dutchman Key",
    parent_category_id: "joinery_category_edge_to_edge",
    description: "Bowtie-shaped insert crossing a crack or seam.",
    unique_traits: [
      "prevents crack propagation",
      "both structural and decorative",
    ],
    identifying_characteristics: [
      "hourglass/bowtie insert",
      "contrasting wood often used",
      "hand-chiseled or CNC precision",
    ],
    period_associations: [
      {
        period_label: "Traditional baseline use",
        date_floor: 1700,
      },
      {
        period_label: "Arts & Crafts revival popularity",
        date_floor: 1890,
        date_ceiling: 1920,
      },
      {
        period_label: "Modern artisan revival",
        date_floor: 1970,
      },
    ],
    date_range_summary: "1700s–present. Arts & Crafts revival popularity c. 1890–1920. Modern artisan revival 1970s–present.",
  },

  // ─── Sub-batch C-2: Corner Joinery (4 types) ───
  {
    id: "joinery_type_basic_butt_corner",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Simplest corner construction; weakest traditional method; extremely common in inexpensive furniture after 1880.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx CORNER JOINERY > Basic Butt Joint section. spans_eras per seed 'Ancient–present'. Distinct from joinery_type_butt_edge_glued (Edge-to-Edge context); both authored as separate entries per D-JN31-5 A-4 surfacing (seed treats them as distinct joints with different applications). 7/7 medium-strong per D-JN30-8. DESCRIPTION not present in seed; authored from UNIQUE TRAITS + DATE RANGE per defensible-defaults.",
    name: "Basic Butt Joint",
    parent_category_id: "joinery_category_corner",
    description: "Two boards joined at a corner with no shaping; relies entirely on nails, screws, or glue.",
    unique_traits: [
      "simplest corner construction",
      "weakest traditional method",
    ],
    identifying_characteristics: [
      "exposed end grain",
      "nails/screws often visible",
      "glue-assisted in later production",
    ],
    period_associations: [
      {
        period_label: "Ancient–present",
        date_floor: 1500,
        usage_notes: "Extremely common in inexpensive furniture after 1880 per seed.",
      },
    ],
    date_range_summary: "Ancient–present. Extremely common in inexpensive furniture after 1880.",
    hand_vs_machine_classification: "spans_eras",
  },
  {
    id: "joinery_type_rabbet_joint",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Corner joinery with one board edge recessed to receive another; increases glue surface and partially hides end grain.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx CORNER JOINERY > Rabbet Joint section. 1700s–present; 7/7 medium-strong per D-JN30-8.",
    name: "Rabbet Joint",
    parent_category_id: "joinery_category_corner",
    description: "One board edge recessed to receive another.",
    unique_traits: [
      "increases glue surface",
      "partially hides end grain",
    ],
    identifying_characteristics: [
      "L-shaped recess",
      "shoulder ledge visible internally",
    ],
    period_associations: [
      {
        period_label: "1700s–present",
        date_floor: 1700,
        usage_notes: "Machine precision increases after 1850 per seed.",
      },
    ],
    date_range_summary: "1700s–present. Machine precision increases after 1850.",
  },
  {
    id: "joinery_type_miter_joint",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Boards cut at opposing 45° angles to hide end grain; decorative refined appearance.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx CORNER JOINERY > Miter Joint section. 1600s–present; 7/7 medium-strong per D-JN30-8.",
    name: "Miter Joint",
    parent_category_id: "joinery_category_corner",
    description: "Boards cut at opposing 45° angles.",
    unique_traits: [
      "hides end grain",
      "decorative refined appearance",
    ],
    identifying_characteristics: [
      "diagonal seam",
      "fragile without reinforcement",
      "often splined or keyed",
    ],
    period_associations: [
      {
        period_label: "1600s–present",
        date_floor: 1600,
        usage_notes: "Fine furniture throughout all eras per seed.",
      },
    ],
    date_range_summary: "1600s–present. Fine furniture throughout all eras.",
  },
  {
    id: "joinery_type_locked_miter",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Interlocking profiled miter combining strength and hidden grain; mostly 20th century–present.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx CORNER JOINERY > Locked Miter section. Mostly 20th century–present (machine-precision dependent); 7/7 medium-strong per D-JN30-8.",
    name: "Locked Miter",
    parent_category_id: "joinery_category_corner",
    description: "Interlocking profiled miter.",
    unique_traits: [
      "combines strength and hidden grain",
    ],
    identifying_characteristics: [
      "complex profile",
      "machine precision",
      "difficult hand execution",
    ],
    period_associations: [
      {
        period_label: "20th century–present",
        date_floor: 1900,
      },
    ],
    date_range_summary: "Mostly 20th century–present.",
  },

  // ─── Sub-batch C-3: Frame Joinery (3 types) ───
  {
    id: "joinery_type_half_lap_joint",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Frame joinery with material removed from both members so faces sit flush; broad glue surface and moderate strength.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx FRAME JOINERY > Half-Lap Joint section. 1700s–present; 7/7 medium-strong per D-JN30-8.",
    name: "Half-Lap Joint",
    parent_category_id: "joinery_category_frame",
    description: "Material removed from both members so faces sit flush.",
    unique_traits: [
      "broad glue surface",
      "moderate strength",
    ],
    identifying_characteristics: [
      "thickness reduction at intersection",
      "exposed overlap visible internally",
    ],
    period_associations: [
      {
        period_label: "1700s–present",
        date_floor: 1700,
      },
    ],
    date_range_summary: "1700s–present.",
  },
  {
    id: "joinery_type_bridle_joint",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Open mortise receiving full-width tenon; strong frame corner connection.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx FRAME JOINERY > Bridle Joint section. 1700s–present with Arts & Crafts popularity c. 1890–1920; 7/7 medium-strong per D-JN30-8.",
    name: "Bridle Joint",
    parent_category_id: "joinery_category_frame",
    description: "Open mortise receiving full-width tenon.",
    unique_traits: [
      "strong frame corner connection",
    ],
    identifying_characteristics: [
      "open-sided mortise",
      "visible slot profile",
    ],
    period_associations: [
      {
        period_label: "1700s–present baseline",
        date_floor: 1700,
      },
      {
        period_label: "Arts & Crafts popularity",
        date_floor: 1890,
        date_ceiling: 1920,
      },
    ],
    date_range_summary: "1700s–present. Arts & Crafts popularity c. 1890–1920.",
  },
  {
    id: "joinery_type_finger_box_joint",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Repeated rectangular interlocking fingers; high glue area; machine-friendly. Transitional indicator (hand 1800s + machine 1880s+).",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx FRAME JOINERY > Finger / Box Joint section. transitional per A-6 (seed DATE RANGE structures hand vs machine phases). 7/7 medium-strong per D-JN30-8. period_associations multi-entry per Q2 Option E + A-3 surfacing.",
    name: "Finger / Box Joint",
    parent_category_id: "joinery_category_frame",
    description: "Repeated rectangular interlocking fingers.",
    unique_traits: [
      "high glue area",
      "machine-friendly",
    ],
    identifying_characteristics: [
      "repetitive square teeth",
      "extremely even spacing in machine work",
    ],
    period_associations: [
      {
        period_label: "Hand examples",
        date_floor: 1800,
        date_ceiling: 1899,
      },
      {
        period_label: "Machine production",
        date_floor: 1880,
        usage_notes: "Machine production 1880s–present per seed.",
      },
    ],
    date_range_summary: "Hand examples: 1800s. Machine production: 1880s–present.",
    hand_vs_machine_classification: "transitional",
  },

  // ─── Sub-batch C-4: Carcase / Case Construction (2 types) ───
  {
    id: "joinery_type_through_dovetail",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Interlocking wedge-shaped tails and pins visible from both sides; hallmark of quality craftsmanship; foundational type that the STRONGLY EARLY 'hand-cut irregular dovetails' and STRONGLY INDUSTRIAL 'perfectly uniform dovetails' indicators describe.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx CARCASE / CASE CONSTRUCTION JOINERY > Through Dovetail section. transitional per A-6 (seed DESCRIPTION has explicit Hand-Cut Examples + Machine-Cut Examples sub-sections). 7/7 per A-7 strict indicator-list mapping (foundational type but not literal indicator-list match; conservative). Cross-category per A-4 / D-JN31-5: primary parent_category_id Carcase; related_joinery_types includes Drawer Joinery dovetail variants and Dovetail Family entries.",
    name: "Through Dovetail",
    parent_category_id: "joinery_category_carcase_case_construction",
    description: "Interlocking wedge-shaped tails and pins visible from both sides.",
    unique_traits: [
      "exceptional tensile resistance",
      "hallmark of quality craftsmanship",
    ],
    identifying_characteristics: [
      "Hand-Cut Examples: irregular spacing, asymmetry, slight angle variation, visible scribe lines, chisel marks",
      "Machine-Cut Examples: perfectly uniform spacing, identical geometry, crisp repeatability",
    ],
    period_associations: [
      {
        period_label: "Hand-cut era",
        date_floor: 1600,
        date_ceiling: 1909,
        usage_notes: "Hand-cut: 1600s–early 1900s per seed. Rural persistence extends regional hand-cut work later per JoineryReasoningRule #2.",
      },
      {
        period_label: "Machine-cut widespread",
        date_floor: 1860,
        usage_notes: "Machine-cut widespread after 1860–1880 per seed (Knapp and successor dovetailers).",
      },
    ],
    date_range_summary: "Hand-cut: 1600s–early 1900s. Machine-cut widespread after 1860–1880.",
    hand_vs_machine_classification: "transitional",
    regional_persistence_notes: "Hand-cut through dovetails persisted regionally past 1880 industrial threshold (Appalachian, Mennonite, Shaker, frontier workshops, rural Southern production) per JoineryReasoningRule #2 rural_persistence_warning. Hand-cut through dovetails do NOT automatically mean pre-1850.",
    related_joinery_types: [
      "joinery_type_sliding_dovetail",
      "joinery_type_half_blind_dovetail",
      "joinery_type_hand_cut_drawer_dovetails",
      "joinery_type_machine_cut_drawer_dovetails",
    ],
  },
  {
    id: "joinery_type_sliding_dovetail",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Dovetail slides longitudinally into matching socket; locks against withdrawal; excellent shelf/frame integration.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx CARCASE / CASE CONSTRUCTION JOINERY > Sliding Dovetail section. 1700s–present; 7/7 medium-strong per D-JN30-8. Cross-category per A-4: primary parent_category_id Carcase; related_joinery_types includes Dovetail Family entries.",
    name: "Sliding Dovetail",
    parent_category_id: "joinery_category_carcase_case_construction",
    description: "Dovetail slides longitudinally into matching socket.",
    unique_traits: [
      "locks against withdrawal",
      "excellent shelf/frame integration",
    ],
    identifying_characteristics: [
      "trapezoidal sliding profile",
      "hidden internal locking geometry",
    ],
    period_associations: [
      {
        period_label: "1700s–present",
        date_floor: 1700,
      },
    ],
    date_range_summary: "1700s–present.",
    related_joinery_types: [
      "joinery_type_through_dovetail",
      "joinery_type_half_blind_dovetail",
    ],
  },

  // ─── Sub-batch C-5: Drawer Joinery (3 types) ───
  {
    id: "joinery_type_hand_cut_drawer_dovetails",
    category: "joinery_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Drawer dovetails cut by hand; STRONGLY EARLY indicator per seed HIGH-AUTHORITY DATING INDICATORS framework. Highly diagnostic for hand-craft era attribution AS ONE EVIDENCE AXIS subject to rural persistence rule.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx DRAWER JOINERY > Hand-Cut Drawer Dovetails section. 8/8 strongly_early indicator-list match ('hand-cut irregular dovetails') per A-7 + D-JN30-8. period_associations multi-entry per Q2 Option E + A-3 surfacing (Early Hand Work + Late Hand Work seed sub-sections). regional_persistence_notes populated per JoineryReasoningRule #2. DESCRIPTION not present in seed; authored from UNIQUE TRAITS + DATE RANGE per defensible-defaults.",
    name: "Hand-Cut Drawer Dovetails",
    parent_category_id: "joinery_category_drawer",
    description: "Drawer-front dovetails cut by hand with saw and chisel, joining drawer sides to drawer fronts and backs.",
    unique_traits: [
      "craftsmanship indicator",
      "often highly diagnostic",
    ],
    identifying_characteristics: [
      "Early Hand Work: narrow pins, wider tails, asymmetry, layout variation",
      "Late Hand Work: more regularity, finer saw kerfs",
    ],
    period_associations: [
      {
        period_label: "Early Hand Work",
        date_floor: 1700,
        date_ceiling: 1799,
        usage_notes: "Narrow pins, wider tails, asymmetry, layout variation per seed.",
      },
      {
        period_label: "Late Hand Work",
        date_floor: 1800,
        date_ceiling: 1900,
        usage_notes: "More regularity, finer saw kerfs per seed. Rural persistence extends regional hand-cut work past 1900 per JoineryReasoningRule #2.",
      },
    ],
    date_range_summary: "1700s–1900s.",
    hand_vs_machine_classification: "strongly_early",
    regional_persistence_notes: "Hand-cut drawer dovetails persisted regionally long after 1870–1885 machine dovetailer adoption (Appalachian, Mennonite, Shaker, frontier workshops, rural Southern production) per JoineryReasoningRule #2 rural_persistence_warning. Hand-cut drawer dovetails do NOT automatically mean pre-1850.",
    related_joinery_types: [
      "joinery_type_machine_cut_drawer_dovetails",
      "joinery_type_through_dovetail",
      "joinery_type_half_blind_dovetail",
    ],
  },
  {
    id: "joinery_type_machine_cut_drawer_dovetails",
    category: "joinery_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Drawer dovetails cut by machine; STRONGLY INDUSTRIAL indicator per seed HIGH-AUTHORITY DATING INDICATORS framework. Industrial repeatability with rounded internal radii diagnostic for machine production.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx DRAWER JOINERY > Machine-Cut Drawer Dovetails section. 8/8 strongly_industrial indicator-list match ('perfectly uniform dovetails') per A-7 + D-JN30-8. No AG warrant per A-5 (hand-cut continued via rural persistence; not a hard pre-X impossibility). DESCRIPTION not present in seed; authored from UNIQUE TRAITS + DATE RANGE per defensible-defaults.",
    name: "Machine-Cut Drawer Dovetails",
    parent_category_id: "joinery_category_drawer",
    description: "Drawer dovetails produced by mechanical dovetailers (Knapp 1867 and successor machines).",
    unique_traits: [
      "industrial repeatability",
    ],
    identifying_characteristics: [
      "identical spacing",
      "rounded internal machine radii",
      "repetitive geometry",
    ],
    period_associations: [
      {
        period_label: "Machine-cut common",
        date_floor: 1870,
        usage_notes: "Common after 1870–1885 per seed (Knapp dovetailer 1867 introduction).",
      },
    ],
    date_range_summary: "Common after 1870–1885.",
    hand_vs_machine_classification: "strongly_industrial",
    related_joinery_types: [
      "joinery_type_hand_cut_drawer_dovetails",
      "joinery_type_through_dovetail",
      "joinery_type_half_blind_dovetail",
    ],
  },
  {
    id: "joinery_type_stapled_drawer_joinery",
    category: "joinery_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Drawer assembly using metal staples; STRONGLY INDUSTRIAL indicator per seed; low-cost mass production with plywood/particleboard association.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx DRAWER JOINERY > Stapled Drawer Joinery section. 8/8 strongly_industrial indicator-list match ('staple construction') + AG anchor per A-7 + D-JN30-8. AG floor 1950 per A-5. DESCRIPTION not present in seed; authored from UNIQUE TRAITS + DATE RANGE per defensible-defaults.",
    name: "Stapled Drawer Joinery",
    parent_category_id: "joinery_category_drawer",
    description: "Drawer assembly using pneumatic-driven metal staples in place of traditional joinery.",
    unique_traits: [
      "low-cost mass production",
    ],
    identifying_characteristics: [
      "metal staples",
      "plywood/particleboard association",
      "hidden fast assembly methods",
    ],
    period_associations: [
      {
        period_label: "1950s–present",
        date_floor: 1950,
      },
    ],
    date_range_summary: "1950s–present.",
    hand_vs_machine_classification: "strongly_industrial",
    anti_classification_guidance: {
      boundary_date: 1950,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1950 presence of stapled drawer joinery indicates either repair-introduction (Restoration False Signals per JoineryReasoningRule #3) or misidentification; this joinery did not exist in pre-1950 original construction.",
      prominence: "prominent",
    },
  },

  // ─── Sub-batch C-6: Panel Retention (1 type) ───
  {
    id: "joinery_type_frame_and_panel",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Floating panel captured within grooves in surrounding frame; accommodates seasonal wood movement.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx PANEL RETENTION JOINERY > Frame-and-Panel Construction section. 1500s–present; 7/7 medium-strong per D-JN30-8.",
    name: "Frame-and-Panel Construction",
    parent_category_id: "joinery_category_panel_retention",
    description: "Floating panel captured within grooves.",
    unique_traits: [
      "seasonal movement accommodation",
      "large surface stabilization",
    ],
    identifying_characteristics: [
      "groove channels",
      "shrinkage gaps",
      "unfinished panel edges internally",
    ],
    period_associations: [
      {
        period_label: "1500s–present",
        date_floor: 1500,
      },
    ],
    date_range_summary: "1500s–present.",
  },

  // ─── Sub-batch C-7: Mortise-and-Tenon Family (5 types) ───
  {
    id: "joinery_type_through_mortise_and_tenon",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Tenon passes entirely through mortise with visible external evidence; extremely strong; spans ancient through present with Arts & Crafts revival prominence.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx MORTISE-AND-TENON FAMILY > Through Mortise-and-Tenon section. spans_eras per A-6 (seed 'Ancient–present'). 7/7 medium-strong per D-JN30-8. period_associations multi-entry capturing Arts & Crafts revival per seed.",
    name: "Through Mortise-and-Tenon",
    parent_category_id: "joinery_category_mortise_and_tenon_family",
    description: "Tenon passes entirely through mortise.",
    unique_traits: [
      "visible external evidence",
      "extremely strong",
    ],
    identifying_characteristics: [
      "exposed tenon end",
      "wedging sometimes visible",
      "pegs common",
    ],
    period_associations: [
      {
        period_label: "Ancient–present baseline",
        date_floor: 1500,
      },
      {
        period_label: "Arts & Crafts revival prominence",
        date_floor: 1890,
        date_ceiling: 1920,
      },
    ],
    date_range_summary: "Ancient–present. Arts & Crafts revival prominence c. 1890–1920.",
    hand_vs_machine_classification: "spans_eras",
  },
  {
    id: "joinery_type_blind_mortise_and_tenon",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Tenon stops inside mortise; cleaner appearance with concealed joinery; spans ancient through present.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx MORTISE-AND-TENON FAMILY > Blind Mortise-and-Tenon section. spans_eras per A-6 (seed 'Ancient–present'). 7/7 medium-strong per D-JN30-8.",
    name: "Blind Mortise-and-Tenon",
    parent_category_id: "joinery_category_mortise_and_tenon_family",
    description: "Tenon stops inside mortise.",
    unique_traits: [
      "cleaner appearance",
      "concealed joinery",
    ],
    identifying_characteristics: [
      "hidden joint line",
      "subtle shoulder seam",
    ],
    period_associations: [
      {
        period_label: "Ancient–present",
        date_floor: 1500,
      },
    ],
    date_range_summary: "Ancient–present.",
    hand_vs_machine_classification: "spans_eras",
  },
  {
    id: "joinery_type_wedged_tenon",
    category: "joinery_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Tenon expanded with wedges driven into kerfs; STRONGLY EARLY indicator per seed; mechanical expansion lock superior to glue alone.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx MORTISE-AND-TENON FAMILY > Wedged Tenon section. 8/8 strongly_early indicator-list match ('wedged through tenons') per A-7 + D-JN30-8. regional_persistence_notes populated per JoineryReasoningRule #2.",
    name: "Wedged Tenon",
    parent_category_id: "joinery_category_mortise_and_tenon_family",
    description: "Tenon expanded with wedges.",
    unique_traits: [
      "mechanical expansion lock",
    ],
    identifying_characteristics: [
      "wedge kerfs visible",
      "flared tenon end",
    ],
    period_associations: [
      {
        period_label: "1600s–present",
        date_floor: 1600,
      },
    ],
    date_range_summary: "1600s–present.",
    hand_vs_machine_classification: "strongly_early",
    regional_persistence_notes: "Wedged tenons persisted in regional hand-craft production (Appalachian, Mennonite, Shaker, frontier workshops, rural Southern production) per JoineryReasoningRule #2 rural_persistence_warning. Arts & Crafts and Windsor traditions continue the technique into modern era.",
    related_joinery_types: [
      "joinery_type_splayed_wedged_through_tenons",
    ],
  },
  {
    id: "joinery_type_pegged_mortise_and_tenon",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Wood pin secures tenon in mortise; glue-independent reinforcement; offset drawboring possible.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx MORTISE-AND-TENON FAMILY > Pegged Mortise-and-Tenon section. 1600s–present; 7/7 medium-strong per D-JN30-8.",
    name: "Pegged Mortise-and-Tenon",
    parent_category_id: "joinery_category_mortise_and_tenon_family",
    description: "Wood pin secures tenon.",
    unique_traits: [
      "glue-independent reinforcement",
    ],
    identifying_characteristics: [
      "visible dowel/peg",
      "offset drawboring possible",
    ],
    period_associations: [
      {
        period_label: "1600s–present",
        date_floor: 1600,
      },
    ],
    date_range_summary: "1600s–present.",
    related_joinery_types: [
      "joinery_type_drawbored_mortise_and_tenon",
    ],
  },
  {
    id: "joinery_type_drawbored_mortise_and_tenon",
    category: "joinery_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Peg hole intentionally offset to mechanically tension joint; STRONGLY EARLY indicator per seed; mechanically pre-stressed superior traditional strength.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx MORTISE-AND-TENON FAMILY > Drawbored Mortise-and-Tenon section. 8/8 strongly_early indicator-list match ('drawbored mortise-and-tenon') per A-7 + D-JN30-8. Date range '1600s–early 1900s primarily' per seed. regional_persistence_notes populated per JoineryReasoningRule #2.",
    name: "Drawbored Mortise-and-Tenon",
    parent_category_id: "joinery_category_mortise_and_tenon_family",
    description: "Peg hole intentionally offset to tension joint.",
    unique_traits: [
      "mechanically pre-stressed",
      "superior traditional strength",
    ],
    identifying_characteristics: [
      "offset peg geometry",
      "difficult disassembly",
    ],
    period_associations: [
      {
        period_label: "1600s–early 1900s primary",
        date_floor: 1600,
        date_ceiling: 1909,
      },
    ],
    date_range_summary: "1600s–early 1900s primarily.",
    hand_vs_machine_classification: "strongly_early",
    regional_persistence_notes: "Drawbored M&T persisted in regional hand-craft production (Appalachian, Mennonite, Shaker, frontier workshops, rural Southern production) per JoineryReasoningRule #2 rural_persistence_warning. Drawbored evidence does NOT automatically mean pre-1850 production.",
    related_joinery_types: [
      "joinery_type_pegged_mortise_and_tenon",
    ],
  },

  // ─── Sub-batch C-8: Dovetail Family (2 types) ───
  {
    id: "joinery_type_half_blind_dovetail",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Dovetail hidden from drawer front face; concealed elegance with strong front connection; drawer-specific dovetail application.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx DOVETAIL FAMILY > Half-Blind Dovetail section. 1700s–present; 7/7 medium-strong per D-JN30-8. Cross-category per A-4: primary parent_category_id Dovetail Family; related_joinery_types includes drawer dovetail variants.",
    name: "Half-Blind Dovetail",
    parent_category_id: "joinery_category_dovetail_family",
    description: "Hidden from drawer front face.",
    unique_traits: [
      "concealed elegance",
      "strong front connection",
    ],
    identifying_characteristics: [
      "tails visible only internally",
      "clean drawer face exterior",
    ],
    period_associations: [
      {
        period_label: "1700s–present",
        date_floor: 1700,
      },
    ],
    date_range_summary: "1700s–present.",
    related_joinery_types: [
      "joinery_type_through_dovetail",
      "joinery_type_hand_cut_drawer_dovetails",
      "joinery_type_machine_cut_drawer_dovetails",
    ],
  },
  {
    id: "joinery_type_secret_mitered_dovetail",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Completely concealed dovetail with invisible external joinery; luxury craftsmanship; fine cabinetry tradition.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx DOVETAIL FAMILY > Secret Mitered Dovetail section. 1700s–present (fine cabinetry especially); 7/7 medium-strong per D-JN30-8.",
    name: "Secret Mitered Dovetail",
    parent_category_id: "joinery_category_dovetail_family",
    description: "Completely concealed dovetail.",
    unique_traits: [
      "luxury craftsmanship",
      "difficult execution",
    ],
    identifying_characteristics: [
      "invisible external joinery",
      "internal angled locking geometry",
    ],
    period_associations: [
      {
        period_label: "1700s–present fine cabinetry",
        date_floor: 1700,
      },
    ],
    date_range_summary: "1700s–present. Fine cabinetry especially.",
    related_joinery_types: [
      "joinery_type_half_blind_dovetail",
    ],
  },

  // ─── Sub-batch C-9: Mechanical / Reinforced (3 types) ───
  {
    id: "joinery_type_dowel_joinery",
    category: "joinery_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Round wooden pins inserted into matching holes for alignment and hidden reinforcement; STRONGLY INDUSTRIAL indicator per seed (dowel mass production).",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx MECHANICAL / REINFORCED JOINERY > Dowel Joinery section. 8/8 strongly_industrial indicator-list match ('dowel mass production') per A-7 + D-JN30-8. period_associations multi-entry per Q2 Option E + A-6 (seed structures hand-fit emergence + mass-production phases via DATE RANGE 'Extremely common after 1950'). No AG (hand-fit dowels predate machine era).",
    name: "Dowel Joinery",
    parent_category_id: "joinery_category_mechanical_reinforced",
    description: "Round wooden pins inserted into matching holes.",
    unique_traits: [
      "alignment assistance",
      "hidden reinforcement",
    ],
    identifying_characteristics: [
      "circular pin evidence",
      "repetitive spacing",
    ],
    period_associations: [
      {
        period_label: "Early hand-fit emergence",
        date_floor: 1800,
        date_ceiling: 1949,
        usage_notes: "1800s baseline emergence per seed.",
      },
      {
        period_label: "Mass-production phase",
        date_floor: 1950,
        usage_notes: "Extremely common after 1950 per seed (mass-production dowel insertion).",
      },
    ],
    date_range_summary: "1800s–present. Extremely common after 1950.",
    hand_vs_machine_classification: "strongly_industrial",
  },
  {
    id: "joinery_type_pocket_screw_joinery",
    category: "joinery_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Angled concealed screw system; STRONGLY INDUSTRIAL indicator per seed; fast assembly with modern cabinetry association.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx MECHANICAL / REINFORCED JOINERY > Pocket Screw Joinery section. 8/8 strongly_industrial indicator-list match ('pocket screws') + AG anchor per A-7 + D-JN30-8. AG floor 1980 per A-5.",
    name: "Pocket Screw Joinery",
    parent_category_id: "joinery_category_mechanical_reinforced",
    description: "Angled concealed screw system.",
    unique_traits: [
      "fast assembly",
      "modern cabinetry association",
    ],
    identifying_characteristics: [
      "angled oval pockets",
      "hidden screw heads",
    ],
    period_associations: [
      {
        period_label: "1980s–present widespread",
        date_floor: 1980,
      },
    ],
    date_range_summary: "1980s–present widespread.",
    hand_vs_machine_classification: "strongly_industrial",
    anti_classification_guidance: {
      boundary_date: 1980,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1980 presence of pocket screw joinery indicates either repair-introduction (Restoration False Signals per JoineryReasoningRule #3) or misidentification; this joinery did not exist in pre-1980 original construction.",
      prominence: "prominent",
    },
  },
  {
    id: "joinery_type_corrugated_fastener_reinforcement",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Wavy metal plate driven across joint for inexpensive reinforcement; late 1800s–present.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx MECHANICAL / REINFORCED JOINERY > Corrugated Fastener Reinforcement section. Late 1800s–present; 7/7 medium-strong per D-JN30-8.",
    name: "Corrugated Fastener Reinforcement",
    parent_category_id: "joinery_category_mechanical_reinforced",
    description: "Wavy metal plate driven across joint.",
    unique_traits: [
      "inexpensive reinforcement",
    ],
    identifying_characteristics: [
      "embedded serrated metal strip",
    ],
    period_associations: [
      {
        period_label: "Late 1800s–present",
        date_floor: 1880,
      },
    ],
    date_range_summary: "Late 1800s–present.",
  },

  // ─── Sub-batch C-10: Chair and Seating (2 types) ───
  {
    id: "joinery_type_round_tenon_joinery",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Cylindrical tenons inserted into bored holes; common in Windsor and stick furniture; structural-role specialized for chair/seating leg attachment.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx CHAIR AND SEATING JOINERY > Round Tenon Joinery section. 1700s–present; 7/7 medium-strong per D-JN30-8.",
    name: "Round Tenon Joinery",
    parent_category_id: "joinery_category_chair_and_seating",
    description: "Cylindrical tenons inserted into bored holes.",
    unique_traits: [
      "common in Windsor and stick furniture",
    ],
    identifying_characteristics: [
      "visible round sockets",
      "wedged tops possible",
    ],
    period_associations: [
      {
        period_label: "1700s–present",
        date_floor: 1700,
      },
    ],
    date_range_summary: "1700s–present.",
    structural_role: "Chair and stick furniture leg-to-seat attachment; Windsor tradition central.",
  },
  {
    id: "joinery_type_splayed_wedged_through_tenons",
    category: "joinery_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Through-tenons splayed and wedged from above for mechanical leg locking; STRONGLY EARLY indicator per seed (wedged through tenons); Arts & Crafts and Windsor traditions especially.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx CHAIR AND SEATING JOINERY > Splayed/Wedged Through Tenons section. 8/8 strongly_early indicator-list match ('wedged through tenons') per A-7 + D-JN30-8. Cross-category per A-4: primary parent_category_id Chair and Seating; related_joinery_types links to wedged_tenon (M&T Family). regional_persistence_notes populated per JoineryReasoningRule #2. DESCRIPTION not present in seed; authored from UNIQUE TRAITS + DATE RANGE per defensible-defaults.",
    name: "Splayed/Wedged Through Tenons",
    parent_category_id: "joinery_category_chair_and_seating",
    description: "Through-tenons splayed outward and wedged from above to mechanically lock chair legs into seat.",
    unique_traits: [
      "mechanical leg locking",
    ],
    identifying_characteristics: [
      "visible wedge spread",
      "flared tenon tops",
    ],
    period_associations: [
      {
        period_label: "1700s–present",
        date_floor: 1700,
        usage_notes: "Arts & Crafts and Windsor especially per seed.",
      },
    ],
    date_range_summary: "1700s–present. Arts & Crafts and Windsor especially.",
    hand_vs_machine_classification: "strongly_early",
    regional_persistence_notes: "Splayed/wedged through tenons persisted in Windsor and stick-furniture traditions through Arts & Crafts revival and continue in modern artisan work per JoineryReasoningRule #2 rural_persistence_warning. Hand-craft evidence does NOT automatically mean pre-1850 production.",
    structural_role: "Chair leg-to-seat mechanical locking; Windsor and Arts & Crafts traditions central.",
    related_joinery_types: [
      "joinery_type_wedged_tenon",
      "joinery_type_round_tenon_joinery",
    ],
  },

  // ─── Sub-batch C-11: Veneer and Surface (2 types) ───
  {
    id: "joinery_type_hammer_veneering",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Hot hide glue spread under veneer using veneer hammer; traditional veneer attachment; 1700s–early 1900s.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx VENEER AND SURFACE JOINERY > Hammer Veneering section. 7/7 medium-strong per D-JN30-8. Date range '1700s–early 1900s' per seed.",
    name: "Hammer Veneering",
    parent_category_id: "joinery_category_veneer_and_surface",
    description: "Hot hide glue spread under veneer using veneer hammer.",
    unique_traits: [
      "traditional veneer attachment",
    ],
    identifying_characteristics: [
      "irregular glue lines",
      "veneer shrinkage",
      "occasional bubbles",
    ],
    period_associations: [
      {
        period_label: "1700s–early 1900s",
        date_floor: 1700,
        date_ceiling: 1909,
      },
    ],
    date_range_summary: "1700s–early 1900s.",
  },
  {
    id: "joinery_type_vacuum_press_veneering",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Vacuum-press veneer adhesion using synthetic adhesives; modern production; mid-1900s–present.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx VENEER AND SURFACE JOINERY > Vacuum Press Veneering section. 7/7 medium-strong per D-JN30-8 (NOT in STRONGLY INDUSTRIAL indicator list per A-5; no AG warrant given vague 'mid-1900s' floor). DESCRIPTION not present in seed; authored from UNIQUE TRAITS + DATE RANGE per defensible-defaults.",
    name: "Vacuum Press Veneering",
    parent_category_id: "joinery_category_veneer_and_surface",
    description: "Veneer applied to substrate under vacuum-press pressure with synthetic adhesives.",
    unique_traits: [
      "highly uniform adhesion",
      "modern production",
    ],
    identifying_characteristics: [
      "perfectly even veneer adhesion",
      "synthetic adhesive association",
    ],
    period_associations: [
      {
        period_label: "Mid-1900s–present",
        date_floor: 1950,
      },
    ],
    date_range_summary: "Mid-1900s–present.",
  },

  // ─── Sub-batch C-12: Decorative / Specialty (2 types) ───
  {
    id: "joinery_type_knuckle_joint",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Interlocking rounded hinge-like woodworking joint with cylindrical alternating fingers; flexible movement capability.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx DECORATIVE / SPECIALTY JOINERY > Knuckle Joint section. 1800s–present; 7/7 medium-strong per D-JN30-8.",
    name: "Knuckle Joint",
    parent_category_id: "joinery_category_decorative_specialty",
    description: "Interlocking rounded hinge-like woodworking joint.",
    unique_traits: [
      "flexible movement capability",
    ],
    identifying_characteristics: [
      "cylindrical alternating fingers",
    ],
    period_associations: [
      {
        period_label: "1800s–present",
        date_floor: 1800,
      },
    ],
    date_range_summary: "1800s–present.",
  },
  {
    id: "joinery_type_coopered_joinery",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Angled stave construction forming curved surfaces; barrel-like geometry with radial assembly; spans ancient through present.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx DECORATIVE / SPECIALTY JOINERY > Coopered Joinery section. spans_eras per A-6 (seed 'Ancient–present'). 7/7 medium-strong per D-JN30-8.",
    name: "Coopered Joinery",
    parent_category_id: "joinery_category_decorative_specialty",
    description: "Angled stave construction forming curved surfaces.",
    unique_traits: [
      "barrel-like geometry",
      "radial assembly",
    ],
    identifying_characteristics: [
      "segmented curved staves",
      "beveled edge mating",
    ],
    period_associations: [
      {
        period_label: "Ancient–present",
        date_floor: 1500,
      },
    ],
    date_range_summary: "Ancient–present.",
    hand_vs_machine_classification: "spans_eras",
  },

  // ─── Sub-batch C-13: Knock-Down / Modular (2 types) ───
  {
    id: "joinery_type_bed_bolt_joinery",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Bolted rail-to-post assembly for removable bed structure; 1800s–present.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx KNOCK-DOWN / MODULAR JOINERY > Bed Bolt Joinery section. 1800s–present; 7/7 medium-strong per D-JN30-8.",
    name: "Bed Bolt Joinery",
    parent_category_id: "joinery_category_knock_down_modular",
    description: "Bolted rail-to-post assembly.",
    unique_traits: [
      "removable bed structure",
    ],
    identifying_characteristics: [
      "large bolts",
      "captured nuts",
      "removable rails",
    ],
    period_associations: [
      {
        period_label: "1800s–present",
        date_floor: 1800,
      },
    ],
    date_range_summary: "1800s–present.",
  },
  {
    id: "joinery_type_knock_down_cam_lock_joinery",
    category: "joinery_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Rotating cam fastener system for flat-pack assembly; STRONGLY INDUSTRIAL indicator per seed (cam locks); particleboard association.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx KNOCK-DOWN / MODULAR JOINERY > Knock-Down Cam Lock Joinery section. 8/8 strongly_industrial indicator-list match ('cam locks') + AG anchor per A-7 + D-JN30-8. AG floor 1960 per A-5.",
    name: "Knock-Down Cam Lock Joinery",
    parent_category_id: "joinery_category_knock_down_modular",
    description: "Rotating cam fastener system.",
    unique_traits: [
      "flat-pack assembly",
    ],
    identifying_characteristics: [
      "circular cam hardware",
      "particleboard association",
    ],
    period_associations: [
      {
        period_label: "1960s–present",
        date_floor: 1960,
      },
    ],
    date_range_summary: "1960s–present.",
    hand_vs_machine_classification: "strongly_industrial",
    anti_classification_guidance: {
      boundary_date: 1960,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1960 presence of cam lock joinery indicates either repair-introduction (Restoration False Signals per JoineryReasoningRule #3) or misidentification; this joinery did not exist in pre-1960 original construction.",
      prominence: "prominent",
    },
  },

  // ─── Sub-batch C-14: Modern Industrial (2 types) ───
  {
    id: "joinery_type_confirmat_screw_joinery",
    category: "joinery_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Specialized screw system for particleboard engineered panel construction; melamine/particleboard association.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx MODERN INDUSTRIAL JOINERY > Confirmat Screw Joinery section. 8/8 per A-7 (AG floor 1970 IS a canonical dating anchor; 'OR types whose AG floor year is canonical dating anchor' criterion). hand_vs_machine_classification 'strongly_industrial' per D-JN31-9 category-context inheritance pattern (Modern Industrial category implies industrial classification even though confirmat is NOT in the literal seed STRONGLY INDUSTRIAL indicator list). AG floor 1970 (NOT 1980 per A-5 + D-JN31-4) — seed DATE RANGE explicitly '1970s–present'.",
    name: "Confirmat Screw Joinery",
    parent_category_id: "joinery_category_modern_industrial",
    description: "Specialized screw system for particleboard.",
    unique_traits: [
      "engineered panel construction",
    ],
    identifying_characteristics: [
      "oversized screw shafts",
      "melamine/particleboard association",
    ],
    period_associations: [
      {
        period_label: "1970s–present",
        date_floor: 1970,
      },
    ],
    date_range_summary: "1970s–present.",
    hand_vs_machine_classification: "strongly_industrial",
    anti_classification_guidance: {
      boundary_date: 1970,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1970 presence of Confirmat screw joinery indicates either repair-introduction (Restoration False Signals per JoineryReasoningRule #3) or misidentification; this joinery did not exist in pre-1970 original construction. Confirmat screws are particleboard-engineered; their presence also requires particleboard substrate consistent with mid-1970s+ flat-pack manufacturing.",
      prominence: "prominent",
    },
  },
  {
    id: "joinery_type_cnc_interlocking_joinery",
    category: "joinery_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Computer-routed precision fit systems; STRONGLY INDUSTRIAL indicator per seed (CNC geometry); extreme geometric precision with no hand variation.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx MODERN INDUSTRIAL JOINERY > CNC Interlocking Joinery section. 8/8 strongly_industrial indicator-list match ('CNC geometry') + AG anchor per A-7 + D-JN30-8. AG floor 1990 per A-5.",
    name: "CNC Interlocking Joinery",
    parent_category_id: "joinery_category_modern_industrial",
    description: "Computer-routed precision fit systems.",
    unique_traits: [
      "extreme geometric precision",
    ],
    identifying_characteristics: [
      "perfectly repeatable geometry",
      "no hand variation",
    ],
    period_associations: [
      {
        period_label: "1990s–present",
        date_floor: 1990,
      },
    ],
    date_range_summary: "1990s–present.",
    hand_vs_machine_classification: "strongly_industrial",
    anti_classification_guidance: {
      boundary_date: 1990,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1990 presence of CNC interlocking joinery indicates either repair-introduction (Restoration False Signals per JoineryReasoningRule #3) or misidentification; this joinery did not exist in pre-1990 original construction. CNC geometric precision is the canonical late-20th-century industrial dating anchor.",
      prominence: "prominent",
    },
  },

  // ─── Sub-batch C-15: Upholstery Structural (2 types) ───
  {
    id: "joinery_type_corner_block_reinforcement",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Triangular reinforcement blocks inside frames providing anti-racking support; 1800s–present.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx UPHOLSTERY STRUCTURAL JOINERY > Corner Block Reinforcement section. 1800s–present; 7/7 medium-strong per D-JN30-8.",
    name: "Corner Block Reinforcement",
    parent_category_id: "joinery_category_upholstery_structural",
    description: "Triangular reinforcement blocks inside frames.",
    unique_traits: [
      "anti-racking support",
    ],
    identifying_characteristics: [
      "glued triangular blocks",
      "screw or nail reinforcement",
    ],
    period_associations: [
      {
        period_label: "1800s–present",
        date_floor: 1800,
      },
    ],
    date_range_summary: "1800s–present.",
    structural_role: "Hidden upholstery-frame anti-racking reinforcement.",
  },
  {
    id: "joinery_type_webbing_rail_joinery",
    category: "joinery_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Rails specifically shaped to support upholstery webbing; seating load distribution; 1700s–present traditional upholstery support.",
    notes: "Per JOINERY_IDENTIFICATION_MASTER_BREAKDOWN.docx UPHOLSTERY STRUCTURAL JOINERY > Webbing Rail Joinery section. 1700s–present; 7/7 medium-strong per D-JN30-8.",
    name: "Webbing Rail Joinery",
    parent_category_id: "joinery_category_upholstery_structural",
    description: "Rails specifically shaped to support upholstery webbing.",
    unique_traits: [
      "seating load distribution",
    ],
    identifying_characteristics: [
      "tack holes",
      "webbing remnants",
      "stretcher integration",
    ],
    period_associations: [
      {
        period_label: "1700s–present",
        date_floor: 1700,
      },
    ],
    date_range_summary: "1700s–present.",
    structural_role: "Traditional upholstery seating frame supporting webbing-based seat construction.",
  },
];

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
