// hardware.ts
//
// Hardware library. Phase 2 Session 7 third library (four-file
// evidence libraries architecture; joinery shipped Blocks 30-31;
// fasteners shipped Blocks 33-34). Block 35 ships schema
// foundation + 13 categories + 5 reasoning rules + empty types
// scaffold + StyleAssociation entryShape.ts promotion +
// HardwareMakerAssociation hardware-local interface; Block 36
// follows with ~42 HARDWARE_TYPES content authoring from
// Furniture_Hardware_Identification_System.docx canonical source.
//
// Architecture:
// - HardwareCategoryEntry: 13 top-level category entries (per
//   D-HW35-3 2-tier hierarchy; no subcategory tier per canonical
//   source structure; subtype variants flattened as separate
//   HardwareTypeEntry entries with related_hardware_types FK
//   linking subtype → parent type).
// - HardwareTypeEntry: per-type entries; Block 36 authors ~42.
//   Schema includes style_associations (Q1 lock; StyleAssociation
//   PROMOTED to entryShape.ts per D-HW35-4) + maker_associations
//   (Q2 lock; HardwareMakerAssociation hardware-local; Block 36
//   leaves arrays EMPTY per D-HW35-6 SCHEMA-PRESENT-CONTENT-
//   DEFERRED discipline).
// - HardwareReasoningRule: meta-rule entries parallel to wood +
//   maker + joinery + fastener reasoning rules. Block 35 authors
//   5 entries.
// - HardwareMakerAssociation: hardware-local interface (NOT
//   promoted to entryShape.ts; schema-occurrence rule doesn't
//   fire for hardware-only structure per Q2 + D-HW35-5).
// - StyleAssociation promoted to entryShape.ts per Q1 + D-HW35-4
//   (schema-occurrence rule fires: 1 use today on hardware + 2+
//   planned future uses on Phase 2 Session 9 design-aspects +
//   possibly upholstery covers libraries).
// - Dual-assessment architecture per D-FA33-5: assessment_layer
//   declared per CATEGORY (no per-subcategory override pattern
//   since no subcategory tier). Per D-HW35-14 per-category-vs-
//   per-subcategory override mechanism documentation: 2-tier
//   libraries use per-category override; 3-tier libraries (like
//   fasteners) use per-subcategory override.
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
 * HardwareCategoryEntry — top-level hardware category per Block
 * 35 D-HW35-2. 13 categories per Furniture_Hardware_Identification
 * _System.docx PRIMARY HARDWARE CATEGORIES section (Op A-4
 * enumeration).
 *
 * Field roster:
 * - category: literal "hardware_category"
 * - name: canonical category name verbatim from seed
 * - category_description: prose description from seed CATEGORY
 *   DESCRIPTION section
 * - unique_category_traits: array from seed UNIQUE TRAITS OF
 *   THE CATEGORY section
 * - identifying_elements?: array from seed IDENTIFYING ELEMENTS
 *   WITHIN THE CATEGORY section (optional per D-JN30-9 + D-FA33
 *   -Surfacing-2 field-naming variance precedent; some
 *   categories lack discrete IDENTIFYING ELEMENTS section)
 * - assessment_layer: "frame" | "upholstery" per D-FA33-5 dual-
 *   assessment architecture. 12 Block 35 categories at "frame";
 *   1 category at "upholstery" (UPHOLSTERY HARDWARE per D-HW35-7
 *   override paralleling fasteners Cat 3 STAPLES precedent).
 */
export interface HardwareCategoryEntry extends CanonicalEntry {
  category: "hardware_category";
  name: string;
  category_description: string;
  unique_category_traits: string[];
  identifying_elements?: string[];
  assessment_layer: "frame" | "upholstery";
}

/**
 * HardwareTypeEntry — per-hardware-type canonical entry per
 * Block 35 D-HW35-2. Flat fields parallel to MakerMarkEntry +
 * JoineryTypeEntry + FastenerTypeEntry pattern. Block 36 authors
 * ~42 entries.
 *
 * Field roster (largest schema; ~17 fields beyond CanonicalEntry):
 * - category: literal "hardware_type"
 * - name: hardware type name verbatim from seed
 * - parent_category_id: FK to HardwareCategoryEntry.id (no
 *   parent_subcategory_id field since no subcategory tier per
 *   D-HW35-3)
 * - description: prose from seed DESCRIPTION
 * - unique_traits: array from seed UNIQUE TRAITS
 * - identifying_characteristics: array from seed IDENTIFYING
 *   CHARACTERISTICS
 * - period_associations: PeriodAssociation[] from seed DATE RANGE
 * - date_range_summary: prose summary from seed DATE RANGE
 * - style_associations?: StyleAssociation[] per Q1 + D-HW35-4
 *   (hardware is canonically the strongest style indicator;
 *   field populated Block 36 from seed Style references)
 * - maker_associations?: HardwareMakerAssociation[] per Q2 +
 *   D-HW35-5 + D-HW35-6 SCHEMA-PRESENT-CONTENT-DEFERRED (Block
 *   36 leaves arrays EMPTY for ALL type entries; no canonical
 *   maker coverage in current source)
 * - common_observed_locations?: PhysicalLocation[] —
 *   identification helper per D-FA33-6 (location HELPS
 *   identification but NOT routing); NOT used for assessment
 *   routing
 * - anti_classification_guidance?: AG entry on industrial-
 *   introduction-boundary hardware types (Cam Lock 1920+, Euro
 *   Hinge 1960s+, Bakelite 1920-1955, Lucite 1945-1975+,
 *   Rubber Caster 1920+, etc.) per Block 36 authoring
 * - replacement_likelihood: "low" | "medium" | "high" per D-AP32
 *   -3 + D-FA33-7 discipline. Hardware is the MOST-REPLACED
 *   evidence class (more than fasteners); per-type calibration
 *   skews higher to MEDIUM/HIGH overall vs fasteners which
 *   skewed to LOW/MEDIUM for hand-forged + cut nails
 * - regional_persistence_notes?: rural-persistence prose per
 *   Rule #3 cross-reference (Surface-Mount Lock + Strap Hinge
 *   + Wooden Caster canonical anchors)
 * - related_hardware_types?: intra-library FK linking subtype →
 *   parent type per D-HW35-3 subtype-flattening pattern (e.g.,
 *   batwing_bail_pull → drop_pull_bail_pull)
 * - related_fastener_types?: cross-library FK to fasteners
 *   library per D-HW35-9 (Cam Lock × Cam Lock Connector +
 *   Upholstery Tacks × Decorative Brass Tack + Phillips
 *   integration references)
 * - related_joinery_types?: cross-library FK to joinery library
 *   per D-HW35-9 (Cam Lock × Knock-Down Cam Lock Joinery)
 */
export interface HardwareTypeEntry extends CanonicalEntry {
  category: "hardware_type";
  name: string;
  parent_category_id: string;
  description: string;
  unique_traits: string[];
  identifying_characteristics: string[];
  period_associations: PeriodAssociation[];
  date_range_summary: string;
  style_associations?: StyleAssociation[];
  maker_associations?: HardwareMakerAssociation[];
  common_observed_locations?: PhysicalLocation[];
  anti_classification_guidance?:
    | AntiClassificationGuidance
    | AntiClassificationGuidance[];
  replacement_likelihood: "low" | "medium" | "high";
  regional_persistence_notes?: string;
  related_hardware_types?: string[];
  related_fastener_types?: string[];
  related_joinery_types?: string[];
}

/**
 * HardwareMakerAssociation — hardware-local associative interface
 * per Block 35 D-HW35-5. Pairs a maker_id (FK to MAKER_ENTRIES.id)
 * with optional mark form/location and date window. NOT promoted
 * to entryShape.ts per Q2 lock; schema-occurrence rule does not
 * fire for hardware-only structure (only library that needs to
 * encode hardware-specific maker-mark on canonical hardware
 * pieces; other libraries cross-reference makers via different
 * mechanisms).
 *
 * Per D-HW35-6 SCHEMA-PRESENT-CONTENT-DEFERRED discipline: Block
 * 36 leaves maker_associations arrays EMPTY on ALL hardware type
 * entries. Hardware reference canonical source has ZERO maker
 * documentation; per-type content deferred to validation-phase
 * one-offs + post-launch systematic authoring with NO scheduled
 * Block-N authoring plan.
 */
export interface HardwareMakerAssociation {
  /** FK to MAKER_ENTRIES.id (e.g., "maker_mark_duncan_phyfe").
   * Required when authored. */
  maker_id: string;

  /** Mark form on hardware (cast/stamped/embossed/impressed/
   * etched). Free-text per per-canonical-source flexibility. */
  mark_form?: string;

  /** Where on hardware piece the mark appears (backplate/
   * barrel/face/etc.). Free-text per per-canonical-source
   * flexibility (not PhysicalLocation enum since hardware-piece
   * locations don't map cleanly to the furniture-position enum). */
  mark_location?: string;

  /** Earliest year this maker produced this hardware type. */
  date_floor?: number;

  /** Latest year. */
  date_ceiling?: number;

  /** Optional appraiser-voice notes. */
  usage_notes?: string;
}

/**
 * HardwareReasoningRule — meta-rule entries per Block 35
 * D-HW35-10. Parallel shape to WoodEvidenceReasoningRule +
 * MakerAttributionReasoningRule + JoineryReasoningRule +
 * FastenerReasoningRule. 5 entries authored Block 35. Authority
 * 9/9 per meta-rule supremacy precedent (D-WE26-8 / D-MM27-5);
 * migration_status "complete" per D-WE26-11 convention.
 */
export interface HardwareReasoningRule extends CanonicalEntry {
  category: "hardware_reasoning_rule";
  rule_name: string;
  rule_statement: string;
  rationale: string;
  migration_target: ReasoningRuleMigrationTarget;
  applies_to_entry_types?: string[];
  cross_layer_scope?: boolean;
}

/**
 * HARDWARE_CATEGORIES — 13 top-level hardware categories per
 * Block 35 D-HW35-2. Per D-HW35-11 authority calibration: 2
 * categories at 8/8 (HINGE HARDWARE + SPECIALTY AND ERA-
 * DIAGNOSTIC HARDWARE — primary dating-evidence categories); 11
 * categories at 7/7 (medium-strong with replacement-likelihood-
 * aware calibration per D-AP32-3 — hardware is the MOST-REPLACED
 * canonical evidence class).
 *
 * assessment_layer distribution per D-HW35-7 + D-HW35-14
 * per-category override mechanism: 12 categories at "frame"
 * (default); 1 category at "upholstery" override (UPHOLSTERY
 * HARDWARE per fasteners Cat 3 STAPLES dual-assessment
 * precedent).
 */
export const HARDWARE_CATEGORIES: HardwareCategoryEntry[] = [
  {
    id: "hardware_category_pull_hardware",
    category: "hardware_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Suspended movable handle hardware attached at two anchor points; strong style indicator with heavy replacement/reproduction risk per Hardware Conflict Rules canonical-source warnings.",
    notes: "Per Furniture_Hardware_Identification_System.docx PULL HARDWARE section. 7/7 medium-strong per D-HW35-11 — strong style indicator but heavily replaced/reproduced (Colonial Revival batwing reproductions, etc. per Rule #4 canonical-source examples). Block 36 authoring populates Drop Pull / Bail Pull + 3 subtype variants (Batwing, Chippendale, Sheraton Oval) as flattened HARDWARE_TYPES entries with related_hardware_types FK linking subtype → parent per D-HW35-3.",
    name: "Pull Hardware",
    category_description: "Suspended movable handle hardware attached at two anchor points; pivot or swing on backplate. Strong stylistic indicator across Federal/Hepplewhite (1780-1820), Empire/Classical (1810-1845), Victorian revival (1860-1910), and Colonial Revival (1890-1940) waves.",
    unique_category_traits: [
      "Swinging or pivoting handle",
      "Two-post attachment",
      "Gravity-hung orientation",
      "Often mounted on decorative plate",
    ],
    identifying_elements: [
      "Symmetrical mounting",
      "Arc wear at pivots",
      "Ring or bail movement",
      "Backplate often decorative",
    ],
    assessment_layer: "frame",
  },
  {
    id: "hardware_category_knob_pull",
    category: "hardware_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Fixed grasping hardware using a single central attachment point; era-tied material variants (turned wood, porcelain, pressed glass, depression glass).",
    notes: "Per Furniture_Hardware_Identification_System.docx KNOB PULL section. 7/7 per D-HW35-11. Block 36 authoring populates 4 types: Turned Wooden Knob (1750-present), Porcelain Knob (1840-1930), Pressed Glass Knob (1860-1925), Depression Glass Knob (1920-1945).",
    name: "Knob Pull",
    category_description: "Fixed grasping hardware using a single central attachment point. Material variants are era-diagnostic: turned wood spans pre-industrial to modern, porcelain peaks 1840-1930, pressed glass 1860-1925, depression glass 1920-1945.",
    unique_category_traits: [
      "Single central attachment point",
      "Fixed (non-pivoting) grasp surface",
      "Material-tied era indicators",
    ],
    identifying_elements: [
      "Threaded insert or shank",
      "Central mounting screw evidence",
      "Material-specific surface treatment (glaze, polish, patina)",
    ],
    assessment_layer: "frame",
  },
  {
    id: "hardware_category_bin_pull",
    category: "hardware_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Cup-shaped or recessed-grip pull hardware common in country and rural casework (1840s-1920s); cardholder variant has integrated label slot.",
    notes: "Per Furniture_Hardware_Identification_System.docx BIN PULL section. 7/7 per D-HW35-11. Block 36 authoring populates Bin Pull + Cardholder Bin Pull subtype.",
    name: "Bin Pull",
    category_description: "Cup-shaped or half-cup recessed grip pull hardware. Common in country furniture, kitchen pantries, and apothecary casework. Cardholder bin pull variant has integrated paper label slot for drawer-content identification.",
    unique_category_traits: [
      "Cup-shaped or half-cup grip surface",
      "Recessed mounting common",
      "Country and casework context",
    ],
    identifying_elements: [
      "Concave grip surface",
      "Top-down installation orientation",
      "Optional cardholder slot",
    ],
    assessment_layer: "frame",
  },
  {
    id: "hardware_category_ring_pull",
    category: "hardware_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Ring-shaped suspended pull hardware; Victorian and Gothic Revival associations; campaign furniture context.",
    notes: "Per Furniture_Hardware_Identification_System.docx RING PULL section. 7/7 per D-HW35-11. Block 36 authoring populates single Ring Pull type (1840-1900 Victorian/Gothic Revival + campaign furniture).",
    name: "Ring Pull",
    category_description: "Ring-shaped suspended pull hardware. Associated with Victorian-era and Gothic Revival furniture (1840-1900) plus campaign furniture for travel applications.",
    unique_category_traits: [
      "Closed ring geometry",
      "Pivoting on single or paired posts",
      "Victorian/Gothic/campaign associations",
    ],
    identifying_elements: [
      "Continuous ring (no break)",
      "Backplate mounting hardware",
      "Often brass or cast iron",
    ],
    assessment_layer: "frame",
  },
  {
    id: "hardware_category_lock_hardware",
    category: "hardware_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Mechanical security hardware for drawers and doors; industrial-era boundaries (Half-Mortise 1780-1920, Cam Lock 1920+).",
    notes: "Per Furniture_Hardware_Identification_System.docx LOCK HARDWARE section. 7/7 per D-HW35-11 — industrial-era anchors but replaceable. Block 36 authoring populates 4 types: Half-Mortise Lock (1780-1920), Full Mortise Lock, Surface-Mount Lock (rural persistence anchor per Rule #3), Cam Lock (1920+ AG anchor; cross-library FK to fastener_type_cam_lock_connector + joinery_type_knock_down_cam_lock_joinery per D-HW35-9).",
    name: "Lock Hardware",
    category_description: "Mechanical security hardware for drawers, doors, and lids. Industrial-era manufacturing boundaries: Half-Mortise (1780-1920), Surface-Mount with rural persistence, Cam Lock (1920+ KD-era anchor).",
    unique_category_traits: [
      "Internal mechanism cavity",
      "Keyhole + bolt or cam mechanism",
      "Mortised or surface-mounted installation",
    ],
    identifying_elements: [
      "Keyhole escutcheon (visible or paired with separate escutcheon)",
      "Strike plate mating surface",
      "Brass or iron box casing",
    ],
    assessment_layer: "frame",
  },
  {
    id: "hardware_category_escutcheons",
    category: "hardware_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Decorative keyhole or pull-mounting plates protecting wood from wear; pierced + stamped + cast variants per era of manufacturing.",
    notes: "Per Furniture_Hardware_Identification_System.docx ESCUTCHEONS section. 7/7 per D-HW35-11 — style-tied but easily replaced. Block 36 authoring populates 3 types: Pierced Escutcheon (hand-craft), Stamped Escutcheon (1860+ mass die-stamping), Cast Escutcheon (industrial casting).",
    name: "Escutcheons",
    category_description: "Decorative plates surrounding keyholes or pull mountings. Function: protect wood from key/pull wear + decorative trim. Manufacturing-era boundaries: pierced (hand-craft); stamped (1860+ mass die-stamping); cast (industrial casting throughout).",
    unique_category_traits: [
      "Keyhole or mounting-point trim plate",
      "Decorative + functional protection",
      "Manufacturing-era boundaries diagnostic",
    ],
    identifying_elements: [
      "Pierced openwork or stamped relief or cast solid",
      "Mounting screw evidence (often visible)",
      "Backside shadow continuity with surrounding finish",
    ],
    assessment_layer: "frame",
  },
  {
    id: "hardware_category_hinge_hardware",
    category: "hardware_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Pivoting joint hardware for doors, lids, and case openings; PRIMARY DATING-EVIDENCE CATEGORY per hand-forged 1750-1830 vs machine-made 1840+ canonical era boundary + Concealed Euro Hinge 1960s+ industrial-introduction AG.",
    notes: "Per Furniture_Hardware_Identification_System.docx HINGE HARDWARE section. 8/8 PRIMARY DATING-EVIDENCE per D-HW35-11 — hand-forged 1750-1830 vs machine-made 1840+ canonical era boundary + mortised installation harder-to-replace than pulls. Block 36 authoring populates ~7-8 types: Butt Hinge (parent) + Hand-Forged Butt Hinge subtype (1750-1830 STRONGLY EARLY) + Machine-Made Butt Hinge subtype (1840+) + H-L Hinge + Strap Hinge (medieval origins, 1650-1900 rural persistence per Rule #3) + Piano/Continuous Hinge + Butterfly Hinge + Concealed Euro Hinge (1960s+ AG anchor).",
    name: "Hinge Hardware",
    category_description: "Pivoting joint hardware for doors, lids, and case openings. Hand-forged vs machine-made manufacturing-era boundary is canonical dating evidence (1750-1830 hand-forged Federal/early American; 1840+ machine precision). Strap hinges show medieval origins with rural persistence through 1900. Concealed Euro Hinge 1960s+ is modern KD-furniture diagnostic.",
    unique_category_traits: [
      "Pivoting two-leaf design with central pin/knuckle",
      "Mortised or surface-mounted installation",
      "Manufacturing-era boundary canonical (forge vs machine)",
    ],
    identifying_elements: [
      "Hammer irregularity / file marks (hand-forged) vs uniform edges / precision barrels (machine-made)",
      "Knuckle count + barrel form",
      "Screw type integration (slotted vs Phillips vs Euro cup-bore)",
    ],
    assessment_layer: "frame",
  },
  {
    id: "hardware_category_casters_and_mobility_hardware",
    category: "hardware_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Wheels and rolling mechanisms for furniture mobility; material-tied era boundaries (porcelain 1840-1910, wooden 1750-1880, rubber 1920+).",
    notes: "Per Furniture_Hardware_Identification_System.docx CASTERS AND MOBILITY HARDWARE section. 7/7 per D-HW35-11 — era-tied but commonly replaced. Block 36 authoring populates 3 types: Porcelain Caster (1840-1910 primary AG anchor), Wooden Caster (1750-1880 with rural persistence), Rubber Caster (1920+ AG anchor; vulcanization industrial boundary).",
    name: "Casters and Mobility Hardware",
    category_description: "Wheels and rolling mechanisms enabling furniture mobility. Material-era boundaries: wooden casters (1750-1880 with rural persistence), porcelain casters (1840-1910 ceramic manufacturing peak), rubber casters (1920+ vulcanization industrial AG anchor).",
    unique_category_traits: [
      "Wheel + axle + mounting plate assembly",
      "Material-tied era indicators",
      "Floor-contact wear diagnostic",
    ],
    identifying_elements: [
      "Wheel material (wood/porcelain/rubber/metal)",
      "Mounting plate type (cup vs plate)",
      "Floor-wear patterns",
    ],
    assessment_layer: "frame",
  },
  {
    id: "hardware_category_corner_and_edge_hardware",
    category: "hardware_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Reinforcement and protection hardware for case edges and corners; campaign furniture context (1800-1900).",
    notes: "Per Furniture_Hardware_Identification_System.docx CORNER AND EDGE HARDWARE section. 7/7 per D-HW35-11 — campaign-specific + replaceable. Block 36 authoring populates 2 types: Campaign Corner Bracket + Edge Strapping.",
    name: "Corner and Edge Hardware",
    category_description: "Reinforcement and protection hardware for case corners and exposed edges. Strongly associated with campaign furniture (military/travel applications, 1800-1900) where structural integrity during transport mattered.",
    unique_category_traits: [
      "Edge or corner protection function",
      "Campaign furniture context",
      "Often brass or iron sheet/strap",
    ],
    identifying_elements: [
      "Right-angle bracket or strap form",
      "Mounting screw evidence at periphery",
      "Wear consistent with handling/transport",
    ],
    assessment_layer: "frame",
  },
  {
    id: "hardware_category_desk_and_mechanical_hardware",
    category: "hardware_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Specialty mechanical hardware for desks and writing furniture; draw-leaf supports, tilt-top locks, cylinder desk mechanisms.",
    notes: "Per Furniture_Hardware_Identification_System.docx DESK AND MECHANICAL HARDWARE section. 7/7 per D-HW35-11 — specialty + limited evidence range. Block 36 authoring populates 3 types: Draw Leaf Support Hardware + Tilt-Top Lock Hardware + Cylinder Desk Mechanism.",
    name: "Desk and Mechanical Hardware",
    category_description: "Specialty mechanical hardware enabling writing-furniture functions: draw-leaf supports for extension surfaces, tilt-top locks for tilting table surfaces, cylinder desk mechanisms for roll-top desks.",
    unique_category_traits: [
      "Function-specific mechanical assemblies",
      "Writing furniture context",
      "Often brass or iron precision parts",
    ],
    identifying_elements: [
      "Function-specific form (slide rail, latch, cylinder)",
      "Precision machined surfaces",
      "Wear patterns consistent with mechanical use",
    ],
    assessment_layer: "frame",
  },
  {
    id: "hardware_category_upholstery_hardware",
    category: "hardware_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Hardware specifically associated with upholstery attachment and structural support; assessment_layer 'upholstery' OVERRIDE per D-HW35-7 paralleling fasteners Cat 3 STAPLES precedent.",
    notes: "Per Furniture_Hardware_Identification_System.docx UPHOLSTERY HARDWARE section. 7/7 per D-HW35-11 — upholstery-replacement-prone. **assessment_layer 'upholstery' OVERRIDE** per D-HW35-7 (paralleling fasteners Cat 3 STAPLES override pattern; hardware in this category is functionally upholstery-attached not frame-attached). Block 36 authoring populates 3 types: Upholstery Tacks (cross-library FK to fastener_subcategory_upholstery_tacks + fastener_type_decorative_brass_tack per D-HW35-9), Decorative Nailhead Trim, Coil Spring Hardware. **Per-category override mechanism** (D-HW35-14): 2-tier libraries use per-category override; 3-tier libraries (fasteners) use per-subcategory override.",
    name: "Upholstery Hardware",
    category_description: "Hardware specifically associated with upholstery attachment, decoration, and structural support. Upholstery tacks attach textile covers; decorative nailhead trim provides ornamental upholstery-edge finish; coil spring hardware supports seating structures.",
    unique_category_traits: [
      "Upholstery-attached function (textile + frame interface)",
      "Reupholstery campaign evidence per dual-assessment architecture",
      "Distinct from frame-attached hardware",
    ],
    identifying_elements: [
      "Tack/staple penetration evidence",
      "Decorative nailhead patterns",
      "Coil spring mounting and webbing rail integration",
    ],
    assessment_layer: "upholstery",
  },
  {
    id: "hardware_category_specialty_and_era_diagnostic_hardware",
    category: "hardware_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Era-defining hardware tightly date-bounded by style movement: Eastlake (1870-1895), Art Deco (1925-1945), Mid-Century Modern (1945-1975), Machine-Age Industrial (1900-1950); PRIMARY DATING-EVIDENCE CATEGORY per canonical anchor for style era.",
    notes: "Per Furniture_Hardware_Identification_System.docx SPECIALTY AND ERA-DIAGNOSTIC HARDWARE section. 8/8 PRIMARY DATING-EVIDENCE per D-HW35-11 — era-defining hardware tightly date-bounded. Block 36 authoring populates 4 types: Eastlake Hardware (1870-1895 incised geometric ornament), Art Deco Hardware (1925-1945 streamlined geometry), Mid-Century Modern Hardware (1945-1975 minimalist functional), Machine-Age Industrial Hardware (1900-1950 utilitarian production).",
    name: "Specialty and Era-Diagnostic Hardware",
    category_description: "Era-defining hardware tightly date-bounded by style movement. Eastlake hardware (1870-1895) carries incised geometric ornament; Art Deco hardware (1925-1945) streamlined geometry with machine-age styling; Mid-Century Modern hardware (1945-1975) minimalist functional design with integrated pulls; Machine-Age Industrial hardware (1900-1950) utilitarian production with exposed fasteners.",
    unique_category_traits: [
      "Era-defining stylistic signatures",
      "Tightly date-bounded canonical anchors",
      "Primary dating-evidence category status",
    ],
    identifying_elements: [
      "Style-specific ornamental patterns (Eastlake incising, Art Deco geometry, MCM minimalism)",
      "Period material associations (cast brass, chrome, anodized aluminum)",
      "Manufacturing-era marks consistent with style period",
    ],
    assessment_layer: "frame",
  },
  {
    id: "hardware_category_modern_synthetic_hardware",
    category: "hardware_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Synthetic-material hardware tightly era-bounded: Bakelite (1920-1955 thermosetting plastic maturity) + Acrylic/Lucite (1945-1975 PMMA polymerization peak).",
    notes: "Per Furniture_Hardware_Identification_System.docx MODERN SYNTHETIC HARDWARE section. 7/7 per D-HW35-11 — era-bounded but limited evidence scope (modern-only). Block 36 authoring populates 2 types: Bakelite Hardware (1920-1955 AG window) + Acrylic/Lucite Hardware (1945-1975 peak AG window).",
    name: "Modern Synthetic Hardware",
    category_description: "Synthetic-material hardware bounded by polymer-industry production windows. Bakelite (thermosetting phenolic plastic, invented 1907, production maturity 1920-1955); Acrylic/Lucite (PMMA polymer, industrial scale 1945-1975 peak).",
    unique_category_traits: [
      "Synthetic polymer material",
      "Polymer-industry production window-bounded",
      "Modern era diagnostic",
    ],
    identifying_elements: [
      "Polymer optical properties (Bakelite opaque/marbled, Lucite transparent/translucent)",
      "Casting/molding seam evidence",
      "Color palette consistent with era polymer production",
    ],
    assessment_layer: "frame",
  },
];

/**
 * HARDWARE_TYPES — per-hardware-type canonical entries. Block 36
 * authors 43 entries across 13 sub-batches from
 * Furniture_Hardware_Identification_System.docx canonical source
 * per Block 36 Op A revised count (Block 35 A-6 preview was ~42;
 * Op A revised to 43 due to HINGE category resolving to 8 types
 * per A-3 enumeration vs A-6 preview 7).
 *
 * Authority distribution per Block 36 D-HW36-10 + A-7: 15 entries
 * at 8/8 (era-canonical anchors + AG anchor types) + 28 entries
 * at 7/7. AG entries on 3 types per Block 36 D-HW36-4 + Q3 Option
 * E hard-boundary discipline: cam_lock (1920), concealed_euro_
 * hinge (1960 with notes-field marker per D-HW36-N decade-range
 * interpretation), rubber_caster (1920). Cross-library FK on 2
 * entries per D-HW36-7: cam_lock has 2 (fasteners + joinery),
 * upholstery_tacks has 1 (fasteners). Subtype flattening per
 * D-HW36-8: 6 subtypes with related_hardware_types FK (3 children
 * of drop_pull_bail_pull + 2 children of butt_hinge + 1 child
 * of bin_pull). regional_persistence_notes on 1 entry per D-HW36
 * -9 + A-8 strict canonical fidelity (surface_mount_lock only;
 * other rural-persistence-implicit types governed by Rule #3 at
 * reasoning-rule level). maker_associations: [] empty arrays for
 * ALL 43 entries per D-HW35-6 SCHEMA-PRESENT-CONTENT-DEFERRED
 * discipline.
 */
export const HARDWARE_TYPES: HardwareTypeEntry[] = [
  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-1: PULL HARDWARE (4 entries)
  // 1 parent (Drop Pull / Bail Pull) + 3 subtypes (Batwing,
  // Chippendale, Sheraton Oval) per D-HW36-8 subtype-flattening.
  // ═══════════════════════════════════════════════════════════
  {
    id: "hardware_type_drop_pull_bail_pull",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Suspended movable bail pull attached at two anchor points; carries strong Federal/Hepplewhite + Empire + Victorian + Colonial Revival era waves canonical anchor per 5-period multi-era seed coverage.",
    notes: "Per Furniture_Hardware_Identification_System.docx PULL HARDWARE > Drop Pull / Bail Pull. 8/8 era-canonical anchor per A-7 (Federal/Hepplewhite + Empire + Victorian + Colonial Revival waves). replacement_likelihood MEDIUM (parent type; subtypes high due to Colonial Revival reproductions). 5-period multi-era period_associations per D-HW36-2 + Block 31 D-JN31-2 precedent. style_associations populated per D-HW35-4 + A-5. maker_associations: [] per D-HW35-6.",
    name: "Drop Pull / Bail Pull",
    parent_category_id: "hardware_category_pull_hardware",
    description: "A suspended movable handle attached at two anchor points.",
    unique_traits: [
      "Swinging or pivoting handle",
      "Two-post attachment",
      "Gravity-hung orientation",
      "Often mounted on decorative plate",
    ],
    identifying_characteristics: [
      "Symmetrical mounting",
      "Arc wear at pivots",
      "Ring or bail movement",
      "Backplate often decorative",
    ],
    period_associations: [
      { period_label: "Early examples", date_floor: 1680, date_ceiling: 1780 },
      { period_label: "Federal/Hepplewhite wave", date_floor: 1780, date_ceiling: 1820 },
      { period_label: "Empire/Classical wave", date_floor: 1810, date_ceiling: 1845 },
      { period_label: "Victorian revival use", date_floor: 1860, date_ceiling: 1910 },
      { period_label: "Colonial Revival reuse", date_floor: 1890, date_ceiling: 1940 },
    ],
    date_range_summary: "Early examples 1680-1780; Federal/Hepplewhite wave 1780-1820; Empire/Classical wave 1810-1845; Victorian revival 1860-1910; Colonial Revival reuse 1890-1940.",
    style_associations: [
      { style_label: "Federal/Hepplewhite", date_floor: 1780, date_ceiling: 1820, usage_notes: "Refined neoclassical proportions on oval backplates." },
      { style_label: "Empire/Classical", date_floor: 1810, date_ceiling: 1845, usage_notes: "Heavier classical motifs on cast backplates." },
      { style_label: "Victorian Revival", date_floor: 1860, date_ceiling: 1910 },
      { style_label: "Colonial Revival", date_floor: 1890, date_ceiling: 1940, usage_notes: "Sustained reproduction-market era; original-vs-reproduction distinguishing per Rule #4 reproduction_hardware_warning." },
    ],
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "medium",
  },
  {
    id: "hardware_type_batwing_bail_pull",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Wing-silhouette bail pull on thin stamped or cast backplate; Colonial Revival reproduction-era dominant.",
    notes: "Per Furniture_Hardware_Identification_System.docx PULL HARDWARE > Drop Pull / Bail Pull > Batwing Bail Pull subtype. 7/7 per A-7. replacement_likelihood HIGH override per Colonial Revival reproduction-market dominance (Rule #4 canonical anchor). related_hardware_types FK to parent per D-HW36-8 subtype-flattening. maker_associations: [] per D-HW35-6.",
    name: "Batwing Bail Pull",
    parent_category_id: "hardware_category_pull_hardware",
    description: "Bail pull with wing-like backplate silhouette.",
    unique_traits: [
      "Wing-like backplate profile",
      "Thin stamped or cast plate",
      "Common on colonial revival furniture",
    ],
    identifying_characteristics: [
      "\"Batwing\" silhouette",
      "Frequently brass",
      "Usually machine-made",
    ],
    period_associations: [
      { period_label: "Original period inspiration", date_floor: 1750, date_ceiling: 1790 },
      { period_label: "Major revival production", date_floor: 1890, date_ceiling: 1940 },
    ],
    date_range_summary: "Original period inspiration 1750-1790; major Colonial Revival production wave 1890-1940.",
    style_associations: [
      { style_label: "Colonial Revival", date_floor: 1890, date_ceiling: 1940, usage_notes: "Dominant production era; original 18th century examples rare." },
    ],
    maker_associations: [],
    common_observed_locations: ["drawer_front"],
    replacement_likelihood: "high",
    related_hardware_types: ["hardware_type_drop_pull_bail_pull"],
  },
  {
    id: "hardware_type_chippendale_bail_pull",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Rococo/pierced cast bail pull with elaborate scrollwork; Chippendale period (1750-1785) + revival waves (1880-1935).",
    notes: "Per Furniture_Hardware_Identification_System.docx PULL HARDWARE > Drop Pull / Bail Pull > Chippendale Bail Pull subtype. 7/7 per A-7. replacement_likelihood HIGH override per revival-market reproductions (Rule #4 canonical anchor). related_hardware_types FK to parent per D-HW36-8. maker_associations: [] per D-HW35-6.",
    name: "Chippendale Bail Pull",
    parent_category_id: "hardware_category_pull_hardware",
    description: "Bail pull with rococo or pierced backplate and elaborate casting.",
    unique_traits: [
      "Rococo or pierced backplate",
      "Elaborate casting",
      "Decorative escutcheon integration",
    ],
    identifying_characteristics: [
      "Openwork plate",
      "Floral or scroll motifs",
      "Often heavier casting",
    ],
    period_associations: [
      { period_label: "Original Chippendale wave", date_floor: 1750, date_ceiling: 1785 },
      { period_label: "Revival wave", date_floor: 1880, date_ceiling: 1935 },
    ],
    date_range_summary: "Original Chippendale wave 1750-1785; revival wave 1880-1935.",
    style_associations: [
      { style_label: "Rococo/Chippendale", date_floor: 1750, date_ceiling: 1785, usage_notes: "Heavy openwork casting with scroll motifs." },
      { style_label: "Colonial Revival", date_floor: 1880, date_ceiling: 1935, usage_notes: "Reproduction-market revival per Rule #4." },
    ],
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "high",
    related_hardware_types: ["hardware_type_drop_pull_bail_pull"],
  },
  {
    id: "hardware_type_sheraton_oval_bail_pull",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Oval-plate refined-neoclassical bail pull; Sheraton period (1790-1820) + revival waves (1890-1930).",
    notes: "Per Furniture_Hardware_Identification_System.docx PULL HARDWARE > Drop Pull / Bail Pull > Sheraton Oval Bail Pull subtype. 7/7 per A-7. replacement_likelihood HIGH override per revival-market reproductions (Rule #4 canonical anchor). related_hardware_types FK to parent per D-HW36-8. maker_associations: [] per D-HW35-6.",
    name: "Sheraton Oval Bail Pull",
    parent_category_id: "hardware_category_pull_hardware",
    description: "Bail pull with oval backplate and refined neoclassical proportions.",
    unique_traits: [
      "Oval plate",
      "Refined neoclassical proportions",
      "Delicate bail",
    ],
    identifying_characteristics: [
      "Oval stamped backplate",
      "Thin elegant profile",
      "Symmetrical geometry",
    ],
    period_associations: [
      { period_label: "Original Sheraton wave", date_floor: 1790, date_ceiling: 1820 },
      { period_label: "Revival wave", date_floor: 1890, date_ceiling: 1930 },
    ],
    date_range_summary: "Original Sheraton wave 1790-1820; revival wave 1890-1930.",
    style_associations: [
      { style_label: "Neoclassical/Sheraton", date_floor: 1790, date_ceiling: 1820, usage_notes: "Refined oval geometry with thin stamped plates." },
      { style_label: "Colonial Revival", date_floor: 1890, date_ceiling: 1930, usage_notes: "Reproduction-market revival per Rule #4." },
    ],
    maker_associations: [],
    common_observed_locations: ["drawer_front"],
    replacement_likelihood: "high",
    related_hardware_types: ["hardware_type_drop_pull_bail_pull"],
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-2: KNOB PULL (4 entries)
  // 4 independent material variants per seed; NO parent-subtype
  // hierarchy. Each authored as direct type under category with
  // NO related_hardware_types FK.
  // ═══════════════════════════════════════════════════════════
  {
    id: "hardware_type_turned_wooden_knob",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Lathe-turned wood knob with integral or threaded shank; long persistence (1750-present; especially common 1820-1910).",
    notes: "Per Furniture_Hardware_Identification_System.docx KNOB PULL > Turned Wooden Knob. 7/7 per A-7. replacement_likelihood LOW override per rural persistence + structural simplicity (less commonly replaced than decorative material variants). multi-period per A-7. maker_associations: [] per D-HW35-6.",
    name: "Turned Wooden Knob",
    parent_category_id: "hardware_category_knob_pull",
    description: "Lathe-turned wood knob with integral or threaded shank attachment.",
    unique_traits: [
      "Lathe-turned wood",
      "Integral or threaded shank",
      "Often stained or shellacked",
    ],
    identifying_characteristics: [
      "Visible turning rings",
      "Wood shrinkage",
      "Patina continuity with drawer",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1750 },
      { period_label: "Especially common period", date_floor: 1820, date_ceiling: 1910, usage_notes: "Peak deployment era." },
    ],
    date_range_summary: "1750-present; especially common 1820-1910.",
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "low",
  },
  {
    id: "hardware_type_porcelain_knob",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "White or decorated ceramic knob with metal threaded insert; Victorian-era anchor (1840-1930 primary).",
    notes: "Per Furniture_Hardware_Identification_System.docx KNOB PULL > Porcelain Knob. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 category default. Single-period primary range with continued limited use afterward captured in usage_notes per Block 31 D-JN31-2 single-vs-multi era discipline. maker_associations: [] per D-HW35-6.",
    name: "Porcelain Knob",
    parent_category_id: "hardware_category_knob_pull",
    description: "Ceramic knob with metal threaded insert, white or decorated with floral transfers.",
    unique_traits: [
      "White or decorated ceramic",
      "Metal threaded insert",
      "Smooth glazed surface",
    ],
    identifying_characteristics: [
      "Cold ceramic feel",
      "Glaze crazing",
      "Floral transfer decoration common",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1840, date_ceiling: 1930, usage_notes: "Continued limited use afterward." },
    ],
    date_range_summary: "1840-1930 primary. Continued limited use afterward.",
    style_associations: [
      { style_label: "Victorian", date_floor: 1840, date_ceiling: 1910, usage_notes: "Victorian-era ceramic-decoration peak." },
    ],
    maker_associations: [],
    common_observed_locations: ["drawer_front"],
    replacement_likelihood: "medium",
  },
  {
    id: "hardware_type_pressed_glass_knob",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Molded glass knob with prism-like faceted reflection and metal shank insert; Victorian primary (1860-1925) + revival (1930s-1950s).",
    notes: "Per Furniture_Hardware_Identification_System.docx KNOB PULL > Pressed Glass Knob. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default. Multi-period per A-7 (primary + revival waves). maker_associations: [] per D-HW35-6.",
    name: "Pressed Glass Knob",
    parent_category_id: "hardware_category_knob_pull",
    description: "Faceted molded glass knob with metal shank insert producing prism-like reflection.",
    unique_traits: [
      "Molded glass facets",
      "Prism-like reflection",
      "Metal shank insert",
    ],
    identifying_characteristics: [
      "Faceted sparkle",
      "Mold seams possible",
      "Common Victorian association",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1860, date_ceiling: 1925 },
      { period_label: "Revival use", date_floor: 1930, date_ceiling: 1959, usage_notes: "Mid-20th century revival wave." },
    ],
    date_range_summary: "1860-1925 primary. Revival use 1930s-1950s.",
    style_associations: [
      { style_label: "Victorian", date_floor: 1860, date_ceiling: 1925 },
    ],
    maker_associations: [],
    common_observed_locations: ["drawer_front"],
    replacement_likelihood: "medium",
  },
  {
    id: "hardware_type_depression_glass_knob",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Colored translucent molded glass knob with decorative patterns; Depression-era window (1920-1945).",
    notes: "Per Furniture_Hardware_Identification_System.docx KNOB PULL > Depression Glass Knob. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default. Single-period era-bounded window. maker_associations: [] per D-HW35-6.",
    name: "Depression Glass Knob",
    parent_category_id: "hardware_category_knob_pull",
    description: "Colored translucent molded glass knob with decorative patterns produced during Depression-era window.",
    unique_traits: [
      "Colored translucent glass",
      "Molded decorative patterns",
    ],
    identifying_characteristics: [
      "Pink, green, amber common",
      "Lighter construction",
      "Machine-produced consistency",
    ],
    period_associations: [
      { period_label: "Depression-era window", date_floor: 1920, date_ceiling: 1945 },
    ],
    date_range_summary: "1920-1945.",
    maker_associations: [],
    common_observed_locations: ["drawer_front"],
    replacement_likelihood: "medium",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-3: BIN PULL (2 entries)
  // bin_pull parent + cardholder_bin_pull subtype with
  // related_hardware_types FK per D-HW36-8.
  // ═══════════════════════════════════════════════════════════
  {
    id: "hardware_type_bin_pull",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Semi-cylindrical recessed or projecting pull common on office and utility furniture; peak early use 1900-1940.",
    notes: "Per Furniture_Hardware_Identification_System.docx BIN PULL category-level type. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default. Multi-period per A-7 (1890-present + 1900-1940 peak). maker_associations: [] per D-HW35-6.",
    name: "Bin Pull",
    parent_category_id: "hardware_category_bin_pull",
    description: "Semi-cylindrical recessed or projecting pull common on office and utility furniture.",
    unique_traits: [
      "Half-moon or cup profile",
      "Finger-entry opening",
      "Often stamped metal",
    ],
    identifying_characteristics: [
      "Horizontal mounting",
      "Utility appearance",
      "Frequently file cabinet associated",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1890 },
      { period_label: "Peak early use", date_floor: 1900, date_ceiling: 1940, usage_notes: "Office and utility furniture deployment peak." },
    ],
    date_range_summary: "1890-present. Peak early use 1900-1940.",
    maker_associations: [],
    common_observed_locations: ["drawer_front"],
    replacement_likelihood: "medium",
  },
  {
    id: "hardware_type_cardholder_bin_pull",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Bin pull with integrated label slot; office or apothecary association (1890-1955 primary).",
    notes: "Per Furniture_Hardware_Identification_System.docx BIN PULL > Cardholder Bin Pull subtype. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default. related_hardware_types FK to parent per D-HW36-8. maker_associations: [] per D-HW35-6.",
    name: "Cardholder Bin Pull",
    parent_category_id: "hardware_category_bin_pull",
    description: "Bin pull with integrated label slot for drawer-content identification; office or apothecary furniture context.",
    unique_traits: [
      "Integrated label slot",
      "Office or apothecary association",
    ],
    identifying_characteristics: [
      "Rectangular nameplate opening",
      "Stamped brass or steel",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1890, date_ceiling: 1955 },
    ],
    date_range_summary: "1890-1955 primary.",
    maker_associations: [],
    common_observed_locations: ["drawer_front"],
    replacement_likelihood: "medium",
    related_hardware_types: ["hardware_type_bin_pull"],
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-4: RING PULL (1 entry)
  // ═══════════════════════════════════════════════════════════
  {
    id: "hardware_type_ring_pull",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Circular hanging pull on single mount or decorative boss; Victorian/Gothic wave (1840-1900) + campaign furniture context.",
    notes: "Per Furniture_Hardware_Identification_System.docx RING PULL category-level type. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default. Multi-period per A-7 (1700-present + 1840-1900 wave). maker_associations: [] per D-HW35-6.",
    name: "Ring Pull",
    parent_category_id: "hardware_category_ring_pull",
    description: "Circular movable ring pull attached through single mount or decorative boss.",
    unique_traits: [
      "Circular movable ring",
      "Vertical hanging orientation",
    ],
    identifying_characteristics: [
      "Wear at top of ring",
      "Often used on campaign or Gothic furniture",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1700 },
      { period_label: "Major Victorian/Gothic wave", date_floor: 1840, date_ceiling: 1900 },
    ],
    date_range_summary: "1700-present. Major Victorian/Gothic wave 1840-1900.",
    style_associations: [
      { style_label: "Victorian", date_floor: 1840, date_ceiling: 1900 },
      { style_label: "Gothic", date_floor: 1840, date_ceiling: 1900, usage_notes: "Gothic Revival pull on campaign + ecclesiastical-influenced furniture." },
      { style_label: "Campaign", date_floor: 1800, date_ceiling: 1900, usage_notes: "Campaign/travel-furniture context per category canonical." },
    ],
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "medium",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-5: LOCK HARDWARE (4 entries)
  // cam_lock has AG-1920 + 2 cross-library FKs per D-HW36-4/7.
  // surface_mount_lock has regional_persistence_notes per D-HW36-9.
  // ═══════════════════════════════════════════════════════════
  {
    id: "hardware_type_half_mortise_lock",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Lock recessed partially into drawer or door edge; primary 1780-1920.",
    notes: "Per Furniture_Hardware_Identification_System.docx LOCK HARDWARE > Half-Mortise Lock. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default. maker_associations: [] per D-HW35-6.",
    name: "Half-Mortise Lock",
    parent_category_id: "hardware_category_lock_hardware",
    description: "Lock recessed partially into drawer or door edge with thin body and box casing.",
    unique_traits: [
      "Thin body",
      "Mounted inside drawer face",
      "Brass or iron box casing",
    ],
    identifying_characteristics: [
      "Rectangular inset",
      "Visible keyhole escutcheon",
      "Internal mechanism cavity",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1780, date_ceiling: 1920 },
    ],
    date_range_summary: "1780-1920 primary.",
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "medium",
  },
  {
    id: "hardware_type_full_mortise_lock",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Lock fully embedded into wood structure; precision mortising; higher-end cabinetry context (1820-present).",
    notes: "Per Furniture_Hardware_Identification_System.docx LOCK HARDWARE > Full Mortise Lock. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default. maker_associations: [] per D-HW35-6.",
    name: "Full Mortise Lock",
    parent_category_id: "hardware_category_lock_hardware",
    description: "Lock fully embedded into wood structure with hidden body and clean installation.",
    unique_traits: [
      "Hidden body",
      "Cleaner installation",
      "Often higher-end cabinetry",
    ],
    identifying_characteristics: [
      "Precision mortising",
      "Minimal visible hardware",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1820 },
    ],
    date_range_summary: "1820-present.",
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "medium",
  },
  {
    id: "hardware_type_surface_mount_lock",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Externally mounted iron lock box attached directly to surface; 1650-1850 primary with rural persistence later per Rule #3 canonical anchor.",
    notes: "Per Furniture_Hardware_Identification_System.docx LOCK HARDWARE > Surface-Mount Lock. 7/7 per A-7. replacement_likelihood LOW override per period locks remain in situ on early casework (rural persistence + structural-component status). regional_persistence_notes populated per D-HW36-9 strict canonical fidelity (only explicit verbatim 'Rural persistence' reference in entire seed). maker_associations: [] per D-HW35-6.",
    name: "Surface-Mount Lock",
    parent_category_id: "hardware_category_lock_hardware",
    description: "Externally mounted lock box attached directly to surface; visible iron body with forged appearance possible.",
    unique_traits: [
      "Fully visible lock body",
      "Earlier production association",
    ],
    identifying_characteristics: [
      "Iron box mounted externally",
      "Forged appearance possible",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1650, date_ceiling: 1850, usage_notes: "Rural persistence later per Rule #3 hardware-axis rural_persistence canonical anchor." },
    ],
    date_range_summary: "1650-1850 primary. Rural persistence later.",
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel", "lid_or_top_movable"],
    replacement_likelihood: "low",
    regional_persistence_notes: "Rural persistence later per canonical seed verbatim. Surface-mount iron locks continued in rural blacksmith production into the 19th century, well past industrial half-mortise + full-mortise lock dominance in urban markets. Hand-forged or rural-pattern surface-mount lock evidence does NOT automatically establish pre-1850 dating; corroborating wood + joinery + form evidence required per Hardware Reasoning Rule #3 (rural_persistence) + Rule #5 (hardware_evidence_layer_independence).",
  },
  {
    id: "hardware_type_cam_lock",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Rotating cam lock arm mechanism; AG floor 1920 hardware-axis emergence (DIVERGES from joinery + fasteners 1960 cam-lock-connector AG floors per D-FA34-11 cross-library AG floor divergence convention).",
    notes: "Per Furniture_Hardware_Identification_System.docx LOCK HARDWARE > Cam Lock. 8/8 AG anchor per A-7. replacement_likelihood MEDIUM per A-6 default. AG floor 1920 per D-HW36-4 (HARDWARE-axis emergence diverges from joinery + fasteners cam-lock-connector AG 1960 per D-FA34-11 — different canonical sources document different temporal phases for same physical phenomenon across evidence axes). Cross-library FK per D-HW36-7: related_fastener_types + related_joinery_types. maker_associations: [] per D-HW35-6.",
    name: "Cam Lock",
    parent_category_id: "hardware_category_lock_hardware",
    description: "Rotating locking arm mechanism with mechanical rotational cam; modern utility construction.",
    unique_traits: [
      "Mechanical rotational cam",
      "Modern utility construction",
    ],
    identifying_characteristics: [
      "Circular body",
      "Rotating rear latch",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1920, usage_notes: "1920-present per canonical seed verbatim." },
    ],
    date_range_summary: "1920-present.",
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    anti_classification_guidance: {
      boundary_date: 1920,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1920 presence of Cam Lock indicates either repair-introduction (Replacement Hardware Risk + Reproduction Hardware Warning per HardwareReasoningRule #2 and #4) or misidentification; this hardware form did not exist in pre-1920 original construction. Cross-library note: cam-lock-connector AG floors diverge across evidence axes per D-FA34-11 — hardware library encodes 1920 (hardware-axis canonical phrasing '1920-present' per seed); fasteners + joinery libraries encode 1960 (RTA/KD-furniture-era canonical phrasing from their own canonical sources). Per-canonical-source fidelity reigns; same physical phenomenon documented from different evidence-axis perspectives.",
      prominence: "prominent",
    },
    replacement_likelihood: "medium",
    related_fastener_types: ["fastener_type_cam_lock_connector"],
    related_joinery_types: ["joinery_type_knock_down_cam_lock_joinery"],
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-6: ESCUTCHEONS (3 entries)
  // ═══════════════════════════════════════════════════════════
  {
    id: "hardware_type_pierced_escutcheon",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Open-pierced thin brass keyhole escutcheon with rococo/Federal influence; primary 1750-1850 + revival 1880-1935.",
    notes: "Per Furniture_Hardware_Identification_System.docx ESCUTCHEONS > Pierced Escutcheon. 7/7 per A-7. replacement_likelihood HIGH per A-6 default (decorative; commonly replaced with pulls). Multi-period per A-7 (primary + revival). maker_associations: [] per D-HW35-6.",
    name: "Pierced Escutcheon",
    parent_category_id: "hardware_category_escutcheons",
    description: "Ornamental keyhole escutcheon with open decorative piercing on thin brass plate.",
    unique_traits: [
      "Open decorative piercing",
      "Thin brass plate",
    ],
    identifying_characteristics: [
      "Ornamental cutouts",
      "Rococo/Federal influence",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1750, date_ceiling: 1850 },
      { period_label: "Revival use", date_floor: 1880, date_ceiling: 1935 },
    ],
    date_range_summary: "1750-1850. Revival use 1880-1935.",
    style_associations: [
      { style_label: "Rococo", date_floor: 1750, date_ceiling: 1800, usage_notes: "Open decorative piercing peak." },
      { style_label: "Federal", date_floor: 1780, date_ceiling: 1820, usage_notes: "Refined neoclassical piercing geometry." },
      { style_label: "Colonial Revival", date_floor: 1880, date_ceiling: 1935, usage_notes: "Reproduction-market revival per Rule #4." },
    ],
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "high",
  },
  {
    id: "hardware_type_stamped_escutcheon",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Machine-pressed thin uniform metal escutcheon; mass die-stamping era anchor 1860+.",
    notes: "Per Furniture_Hardware_Identification_System.docx ESCUTCHEONS > Stamped Escutcheon. 7/7 per A-7. replacement_likelihood HIGH per A-6 default. maker_associations: [] per D-HW35-6.",
    name: "Stamped Escutcheon",
    parent_category_id: "hardware_category_escutcheons",
    description: "Machine-pressed thin uniform metal keyhole escutcheon with crisp repeated designs.",
    unique_traits: [
      "Machine-pressed production",
      "Thin uniform metal",
    ],
    identifying_characteristics: [
      "Crisp repeated designs",
      "Lightweight construction",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1860 },
    ],
    date_range_summary: "1860-present.",
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "high",
  },
  {
    id: "hardware_type_cast_escutcheon",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Thicker cast metal escutcheon with molded relief decoration; continuous use 1700-present.",
    notes: "Per Furniture_Hardware_Identification_System.docx ESCUTCHEONS > Cast Escutcheon. 7/7 per A-7. replacement_likelihood HIGH per A-6 default. maker_associations: [] per D-HW35-6.",
    name: "Cast Escutcheon",
    parent_category_id: "hardware_category_escutcheons",
    description: "Cast metal keyhole escutcheon with thicker body and molded relief decoration.",
    unique_traits: [
      "Thicker metal",
      "Molded relief decoration",
    ],
    identifying_characteristics: [
      "Casting seams",
      "Greater depth",
      "Heavier weight",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1700 },
    ],
    date_range_summary: "1700-present.",
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "high",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-7: HINGE HARDWARE (8 entries)
  // butt_hinge parent + 2 subtypes (hand_forged, machine_made)
  // with related_hardware_types FK per D-HW36-8.
  // concealed_euro_hinge has AG-1960 per D-HW36-4 with notes-
  // field marker per D-HW36-N decade-range interpretation.
  // ═══════════════════════════════════════════════════════════
  {
    id: "hardware_type_butt_hinge",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Two rectangular leaves joined by central pin; mortised installation; continuous use 1750-present (parent type for Hand-Forged + Machine-Made subtype variants).",
    notes: "Per Furniture_Hardware_Identification_System.docx HINGE HARDWARE > Butt Hinge category-level type. 7/7 parent type per A-7 (subtypes Hand-Forged + Machine-Made at 8/8). replacement_likelihood LOW per A-6 default (mortised installation harder to replace than surface-mounted hardware). maker_associations: [] per D-HW35-6.",
    name: "Butt Hinge",
    parent_category_id: "hardware_category_hinge_hardware",
    description: "Two rectangular leaves joined by central pin with mortised installation.",
    unique_traits: [
      "Mortised installation",
      "Hidden barrel when closed",
    ],
    identifying_characteristics: [
      "Rectangular leaves",
      "Central pin",
      "Flush mounting",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1750 },
    ],
    date_range_summary: "1750-present.",
    maker_associations: [],
    common_observed_locations: ["door_panel", "lid_or_top_movable"],
    replacement_likelihood: "low",
  },
  {
    id: "hardware_type_hand_forged_butt_hinge",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Hand-forged butt hinge with hammer irregularity + file marks; 1750-1830 hand-forge era ceiling diagnostic per canonical anchor.",
    notes: "Per Furniture_Hardware_Identification_System.docx HINGE HARDWARE > Butt Hinge > Hand-Forged Butt Hinge subtype. 8/8 era-canonical anchor per A-7 (1750-1830 hand-forge era ceiling diagnostic). replacement_likelihood LOW per A-6 default. related_hardware_types FK to parent per D-HW36-8 subtype-flattening. maker_associations: [] per D-HW35-6.",
    name: "Hand-Forged Butt Hinge",
    parent_category_id: "hardware_category_hinge_hardware",
    description: "Hand-forged variant of butt hinge with characteristic hammer irregularity and file marks.",
    unique_traits: [
      "Hand-forged manufacture",
      "Pre-industrial production era",
    ],
    identifying_characteristics: [
      "Hammer irregularity",
      "Offset symmetry",
      "File marks",
    ],
    period_associations: [
      { period_label: "Hand-forge era", date_floor: 1750, date_ceiling: 1830, usage_notes: "Hand-forging dominance era ends ~1830 with industrial machine-made hinge adoption; rural persistence later possible per Rule #3 but no explicit canonical anchor on this type." },
    ],
    date_range_summary: "1750-1830.",
    maker_associations: [],
    common_observed_locations: ["door_panel", "lid_or_top_movable"],
    replacement_likelihood: "low",
    related_hardware_types: ["hardware_type_butt_hinge"],
  },
  {
    id: "hardware_type_machine_made_butt_hinge",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Machine-made butt hinge with uniform edges + precision barrels + machine screws; 1840+ machine-precision era floor anchor.",
    notes: "Per Furniture_Hardware_Identification_System.docx HINGE HARDWARE > Butt Hinge > Machine-Made Butt Hinge subtype. 8/8 era-canonical anchor per A-7 (1840+ machine-precision era floor). replacement_likelihood LOW per A-6 default. related_hardware_types FK to parent per D-HW36-8 subtype-flattening. maker_associations: [] per D-HW35-6.",
    name: "Machine-Made Butt Hinge",
    parent_category_id: "hardware_category_hinge_hardware",
    description: "Machine-made variant of butt hinge with uniform edges, precision barrels, and machine screws.",
    unique_traits: [
      "Machine precision manufacture",
      "Industrial-era production",
    ],
    identifying_characteristics: [
      "Uniform edges",
      "Precision barrels",
      "Machine screws",
    ],
    period_associations: [
      { period_label: "Industrial era", date_floor: 1840 },
    ],
    date_range_summary: "1840-present.",
    maker_associations: [],
    common_observed_locations: ["door_panel", "lid_or_top_movable"],
    replacement_likelihood: "low",
    related_hardware_types: ["hardware_type_butt_hinge"],
  },
  {
    id: "hardware_type_h_l_hinge",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Decorative strap hinge shaped like H or HL; long-strap arms with surface mount; 1650-1820 early vernacular anchor.",
    notes: "Per Furniture_Hardware_Identification_System.docx HINGE HARDWARE > H-L Hinge. 8/8 era-canonical anchor per A-7 (1650-1820 early vernacular hand-forged anchor). replacement_likelihood LOW per A-6 default. Multi-period per A-7 (primary + revival). maker_associations: [] per D-HW35-6.",
    name: "H-L Hinge",
    parent_category_id: "hardware_category_hinge_hardware",
    description: "Decorative strap hinge shaped like the letters H or HL; surface-mounted with long strap arms.",
    unique_traits: [
      "Long strap arms",
      "Surface mounted",
      "Early vernacular association",
    ],
    identifying_characteristics: [
      "Hand-forged texture",
      "Decorative silhouette",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1650, date_ceiling: 1820 },
      { period_label: "Revival use", date_floor: 1880, date_ceiling: 1940, usage_notes: "Colonial Revival reproduction wave per Rule #4 canonical anchor." },
    ],
    date_range_summary: "1650-1820 primary. Revival use later.",
    maker_associations: [],
    common_observed_locations: ["door_panel"],
    replacement_likelihood: "low",
  },
  {
    id: "hardware_type_strap_hinge",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Long surface-mounted strap hinge with extended arm + structural reinforcement function; medieval origins, furniture use 1650-1900.",
    notes: "Per Furniture_Hardware_Identification_System.docx HINGE HARDWARE > Strap Hinge. 8/8 era-canonical anchor per A-7 (medieval origins; 1650-1900 furniture use). replacement_likelihood LOW per A-6 default (structural reinforcement function; rarely replaced). maker_associations: [] per D-HW35-6.",
    name: "Strap Hinge",
    parent_category_id: "hardware_category_hinge_hardware",
    description: "Long surface-mounted strap hinge with extended structural-reinforcement leaf.",
    unique_traits: [
      "Long surface-mounted leaf",
      "Structural reinforcement function",
    ],
    identifying_characteristics: [
      "Extended arm",
      "Forged or stamped iron",
    ],
    period_associations: [
      { period_label: "Furniture-use era", date_floor: 1650, date_ceiling: 1900, usage_notes: "Medieval origins; furniture use 1650-1900 per canonical seed." },
    ],
    date_range_summary: "Medieval origins. Furniture use: 1650-1900.",
    maker_associations: [],
    common_observed_locations: ["door_panel", "lid_or_top_movable"],
    replacement_likelihood: "low",
  },
  {
    id: "hardware_type_piano_hinge",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Full-length continuous-barrel piano hinge; 1880+ industrial-era continuous-manufacturing introduction.",
    notes: "Per Furniture_Hardware_Identification_System.docx HINGE HARDWARE > Piano Hinge / Continuous Hinge. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default. maker_associations: [] per D-HW35-6.",
    name: "Piano Hinge / Continuous Hinge",
    parent_category_id: "hardware_category_hinge_hardware",
    description: "Full-length continuous-pivot hinge running the entire joint length.",
    unique_traits: [
      "Full-length hinge",
      "Continuous pivot",
    ],
    identifying_characteristics: [
      "Long uninterrupted barrel",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1880 },
    ],
    date_range_summary: "1880-present.",
    maker_associations: [],
    common_observed_locations: ["lid_or_top_movable", "door_panel"],
    replacement_likelihood: "medium",
  },
  {
    id: "hardware_type_butterfly_hinge",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Decorative winged-profile surface-mounted hinge; primary 1880-1940.",
    notes: "Per Furniture_Hardware_Identification_System.docx HINGE HARDWARE > Butterfly Hinge. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default. maker_associations: [] per D-HW35-6.",
    name: "Butterfly Hinge",
    parent_category_id: "hardware_category_hinge_hardware",
    description: "Surface-mounted hinge with decorative winged profile resembling butterfly wings.",
    unique_traits: [
      "Decorative winged profile",
      "Surface-mounted installation",
    ],
    identifying_characteristics: [
      "Symmetrical decorative shape",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1880, date_ceiling: 1940 },
    ],
    date_range_summary: "1880-1940 primary.",
    maker_associations: [],
    common_observed_locations: ["door_panel"],
    replacement_likelihood: "medium",
  },
  {
    id: "hardware_type_concealed_euro_hinge",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Hidden modern cabinet hinge with cup-boring installation + adjustable mechanism; AG floor 1960 hardware-axis emergence (decade-range seed phrasing '1960s-present').",
    notes: "Per Furniture_Hardware_Identification_System.docx HINGE HARDWARE > Concealed Euro Hinge. 8/8 AG anchor per A-7. replacement_likelihood HIGH per A-6 default (modern retrofit on antique furniture commonly indicates restoration upgrade per Rule #2 + Rule #4 canonical anchors). AG floor 1960 per D-HW36-4 with notes-field marker per D-HW36-N decade-range interpretation discipline — seed canonical phrasing '1960s-present' does NOT pin specific year; 1960 selected as conservative decade-floor anchor per defensible-defaults + D-FA34-3 notes-field-marker precedent. maker_associations: [] per D-HW35-6.",
    name: "Concealed Euro Hinge",
    parent_category_id: "hardware_category_hinge_hardware",
    description: "Modern hidden cabinet hinge with cup-boring installation and adjustable mechanism.",
    unique_traits: [
      "Hidden modern cabinet hinge",
      "Cup boring installation",
    ],
    identifying_characteristics: [
      "Circular cup mortise",
      "Adjustable mechanism",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1960, usage_notes: "Canonical seed phrasing '1960s-present' — 1960 selected as conservative decade-floor anchor per D-HW36-N decade-range interpretation discipline + D-FA34-3 notes-field-marker precedent." },
    ],
    date_range_summary: "1960s-present per canonical seed.",
    maker_associations: [],
    common_observed_locations: ["door_panel"],
    anti_classification_guidance: {
      boundary_date: 1960,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1960 presence of Concealed Euro Hinge indicates either repair-introduction (Replacement Hardware Risk + Reproduction Hardware Warning per HardwareReasoningRule #2 and #4) or misidentification; this hardware form did not exist in pre-1960 original construction. Seed canonical phrasing '1960s-present' — 1960 conservative decade-floor anchor per D-HW36-N decade-range interpretation discipline. Modern Euro hinge retrofits on antique furniture are explicitly called out in Hardware Conflict Rules canonical-source section as a Common False Signal.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-8: CASTERS AND MOBILITY HARDWARE (3 entries)
  // rubber_caster has AG-1920 per D-HW36-4.
  // porcelain_caster era-bounded (1840-1910) WITHOUT AG per
  // Q3 Option E (soft-boundary peak usage era).
  // ═══════════════════════════════════════════════════════════
  {
    id: "hardware_type_porcelain_caster",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "White ceramic caster wheel with brass or iron housing; Victorian-era anchor 1840-1910 primary (soft-boundary peak usage era; NO AG per Q3 Option E).",
    notes: "Per Furniture_Hardware_Identification_System.docx CASTERS AND MOBILITY HARDWARE > Porcelain Caster. 8/8 era-canonical anchor per A-7 (1840-1910 Victorian-era ceramics-manufacturing peak). replacement_likelihood MEDIUM per A-6 default. Era-bounded soft-boundary per Q3 Option E captured as single-period period_associations with explicit date_ceiling; NO AG (period decline, not industrial-introduction-boundary). maker_associations: [] per D-HW35-6.",
    name: "Porcelain Caster",
    parent_category_id: "hardware_category_casters_and_mobility_hardware",
    description: "Caster with white ceramic wheel mounted in brass or iron housing.",
    unique_traits: [
      "White ceramic wheel",
      "Brass or iron housing",
    ],
    identifying_characteristics: [
      "Brittle ceramic wheel",
      "Victorian association",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1840, date_ceiling: 1910, usage_notes: "Victorian-era ceramic-manufacturing peak; soft-boundary decline post-1910 with rubber caster industrial introduction per D-HW36-2." },
    ],
    date_range_summary: "1840-1910 primary.",
    style_associations: [
      { style_label: "Victorian", date_floor: 1840, date_ceiling: 1910 },
    ],
    maker_associations: [],
    common_observed_locations: ["foot_or_leg", "base_or_plinth"],
    replacement_likelihood: "medium",
  },
  {
    id: "hardware_type_wooden_caster",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Turned wood wheel caster with iron mounting; 1750-1850 primary; early-mobility hardware anchor.",
    notes: "Per Furniture_Hardware_Identification_System.docx CASTERS AND MOBILITY HARDWARE > Wooden Caster. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default. maker_associations: [] per D-HW35-6.",
    name: "Wooden Caster",
    parent_category_id: "hardware_category_casters_and_mobility_hardware",
    description: "Early mobility caster with turned wood wheel and iron mounting plate.",
    unique_traits: [
      "Turned wood wheel",
      "Early mobility hardware",
    ],
    identifying_characteristics: [
      "Wooden tread wear",
      "Iron mounting",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1750, date_ceiling: 1850 },
    ],
    date_range_summary: "1750-1850 primary.",
    maker_associations: [],
    common_observed_locations: ["foot_or_leg", "base_or_plinth"],
    replacement_likelihood: "medium",
  },
  {
    id: "hardware_type_rubber_caster",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Black rubber wheel caster with machine-formed housing; AG floor 1920 (vulcanization industrial-introduction era).",
    notes: "Per Furniture_Hardware_Identification_System.docx CASTERS AND MOBILITY HARDWARE > Rubber Caster. 8/8 AG anchor per A-7 (1920 vulcanization industrial-introduction era). replacement_likelihood MEDIUM per A-6 default. AG floor 1920 per D-HW36-4 + canonical seed '1920-present' verbatim. maker_associations: [] per D-HW35-6.",
    name: "Rubber Caster",
    parent_category_id: "hardware_category_casters_and_mobility_hardware",
    description: "Industrial-era caster with soft black rubber rolling surface and machine-formed housing.",
    unique_traits: [
      "Soft rolling surface",
      "Industrial/modern use",
    ],
    identifying_characteristics: [
      "Black rubber wheel",
      "Machine-formed housing",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1920 },
    ],
    date_range_summary: "1920-present.",
    maker_associations: [],
    common_observed_locations: ["foot_or_leg", "base_or_plinth"],
    anti_classification_guidance: {
      boundary_date: 1920,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1920 presence of Rubber Caster indicates either repair-introduction (Replacement Hardware Risk + Reproduction Hardware Warning per HardwareReasoningRule #2 and #4) or misidentification; this hardware form did not exist in pre-1920 original construction. Vulcanized rubber industrial production scaled post-WWI making caster manufacture economically viable. Added casters on antique furniture are explicitly called out in Hardware Conflict Rules canonical-source section as a Common False Signal.",
      prominence: "prominent",
    },
    replacement_likelihood: "medium",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-9: CORNER AND EDGE HARDWARE (2 entries)
  // ═══════════════════════════════════════════════════════════
  {
    id: "hardware_type_campaign_corner_bracket",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Brass-reinforced flush-mounted corner cap; campaign/travel-furniture anchor 1800-1900 primary.",
    notes: "Per Furniture_Hardware_Identification_System.docx CORNER AND EDGE HARDWARE > Campaign Corner Bracket. 7/7 per A-7. replacement_likelihood LOW per A-6 default (structural trim; rarely replaced). Multi-period per A-7 (primary + revival). maker_associations: [] per D-HW35-6.",
    name: "Campaign Corner Bracket",
    parent_category_id: "hardware_category_corner_and_edge_hardware",
    description: "Brass-reinforced corner cap for campaign-furniture edge protection during travel.",
    unique_traits: [
      "Brass reinforced corner",
      "Travel furniture association",
    ],
    identifying_characteristics: [
      "Flush-mounted brass corner caps",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1800, date_ceiling: 1900 },
      { period_label: "Revival use", date_floor: 1900, date_ceiling: 1960, usage_notes: "Mid-20th century revival waves." },
    ],
    date_range_summary: "1800-1900 primary. Revival waves later.",
    style_associations: [
      { style_label: "Campaign", date_floor: 1800, date_ceiling: 1900, usage_notes: "Military and travel-furniture context." },
    ],
    maker_associations: [],
    common_observed_locations: ["case_corner", "edge_or_corner_protection"],
    replacement_likelihood: "low",
  },
  {
    id: "hardware_type_edge_strapping",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Long protective metal strips along furniture edges; utility deployment 1700-1900.",
    notes: "Per Furniture_Hardware_Identification_System.docx CORNER AND EDGE HARDWARE > Edge Strapping. 7/7 per A-7. replacement_likelihood LOW per A-6 default. maker_associations: [] per D-HW35-6.",
    name: "Edge Strapping",
    parent_category_id: "hardware_category_corner_and_edge_hardware",
    description: "Long protective metal strips installed along furniture edges for structural reinforcement.",
    unique_traits: [
      "Long protective metal strips",
    ],
    identifying_characteristics: [
      "Riveted or nailed installation",
    ],
    period_associations: [
      { period_label: "Utility use", date_floor: 1700, date_ceiling: 1900 },
    ],
    date_range_summary: "1700-1900 utility use.",
    maker_associations: [],
    common_observed_locations: ["edge_or_corner_protection", "case_corner"],
    replacement_likelihood: "low",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-10: DESK AND MECHANICAL HARDWARE (3 entries)
  // ═══════════════════════════════════════════════════════════
  {
    id: "hardware_type_draw_leaf_support_hardware",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Sliding support arms for table extension; hidden runners with pull-out support action; continuous use 1700-present.",
    notes: "Per Furniture_Hardware_Identification_System.docx DESK AND MECHANICAL HARDWARE > Draw Leaf Support Hardware. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default. maker_associations: [] per D-HW35-6.",
    name: "Draw Leaf Support Hardware",
    parent_category_id: "hardware_category_desk_and_mechanical_hardware",
    description: "Sliding mechanical support arms enabling table-leaf extension function.",
    unique_traits: [
      "Sliding support arms",
      "Table expansion function",
    ],
    identifying_characteristics: [
      "Hidden runners",
      "Pull-out support action",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1700 },
    ],
    date_range_summary: "1700-present.",
    maker_associations: [],
    common_observed_locations: ["case_interior_framing", "underside"],
    replacement_likelihood: "medium",
  },
  {
    id: "hardware_type_tilt_top_lock_hardware",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Rotating lock arm for tabletop stabilization beneath tilt-top tables; primary 1750-1850.",
    notes: "Per Furniture_Hardware_Identification_System.docx DESK AND MECHANICAL HARDWARE > Tilt-Top Lock Hardware. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default. maker_associations: [] per D-HW35-6.",
    name: "Tilt-Top Lock Hardware",
    parent_category_id: "hardware_category_desk_and_mechanical_hardware",
    description: "Rotating lock arm pivoting beneath tabletop to stabilize tilt-top table surfaces.",
    unique_traits: [
      "Rotating lock arm",
      "Tabletop stabilization",
    ],
    identifying_characteristics: [
      "Pivot catch beneath top",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1750, date_ceiling: 1850 },
    ],
    date_range_summary: "1750-1850 primary.",
    maker_associations: [],
    common_observed_locations: ["underside", "lid_or_top_movable"],
    replacement_likelihood: "medium",
  },
  {
    id: "hardware_type_cylinder_desk_mechanism",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Curved tambour operation mechanism for roll-top desks; primary 1880-1930.",
    notes: "Per Furniture_Hardware_Identification_System.docx DESK AND MECHANICAL HARDWARE > Cylinder Desk Mechanism. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default. maker_associations: [] per D-HW35-6.",
    name: "Cylinder Desk Mechanism",
    parent_category_id: "hardware_category_desk_and_mechanical_hardware",
    description: "Flexible slat-and-track mechanism enabling curved tambour operation on roll-top desks.",
    unique_traits: [
      "Curved tambour operation",
      "Flexible slat motion",
    ],
    identifying_characteristics: [
      "Sliding tambour track",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1880, date_ceiling: 1930 },
    ],
    date_range_summary: "1880-1930 primary.",
    maker_associations: [],
    common_observed_locations: ["case_interior_framing"],
    replacement_likelihood: "medium",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-11: UPHOLSTERY HARDWARE (3 entries)
  // assessment_layer "upholstery" inherited per D-HW35-7
  // (category-level override). upholstery_tacks has related_
  // fastener_types FK per D-HW36-7.
  // ═══════════════════════════════════════════════════════════
  {
    id: "hardware_type_upholstery_tacks",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Short hammer-driven decorative fasteners with broad visible heads; continuous use 1700-present; cross-references fastener library upholstery_tacks subcategory per D-HW36-7.",
    notes: "Per Furniture_Hardware_Identification_System.docx UPHOLSTERY HARDWARE > Upholstery Tacks. 7/7 per A-7. replacement_likelihood HIGH per A-6 default (upholstery-replacement-prone). assessment_layer 'upholstery' inherited from parent category per D-HW35-7 override. Cross-library FK per D-HW36-7 to fastener_subcategory_upholstery_tacks (same physical phenomenon documented from hardware-identification + fastener-type perspectives; per-canonical-source fidelity per D-HW35-9). maker_associations: [] per D-HW35-6.",
    name: "Upholstery Tacks",
    parent_category_id: "hardware_category_upholstery_hardware",
    description: "Short hammer-driven decorative fasteners with broad visible heads for upholstery attachment.",
    unique_traits: [
      "Short decorative fastener",
      "Broad visible head",
    ],
    identifying_characteristics: [
      "Hammer-driven",
      "Oxidation patterns",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1700 },
    ],
    date_range_summary: "1700-present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_attachment_point", "upholstery_seat", "upholstery_back"],
    replacement_likelihood: "high",
    related_fastener_types: ["fastener_subcategory_upholstery_tacks"],
  },
  {
    id: "hardware_type_decorative_nailhead_trim",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Visible repeating trim pattern with uniform spacing brass or steel heads; continuous use 1800-present.",
    notes: "Per Furniture_Hardware_Identification_System.docx UPHOLSTERY HARDWARE > Decorative Nailhead Trim. 7/7 per A-7. replacement_likelihood HIGH per A-6 default (reupholstery-prone). assessment_layer 'upholstery' inherited from parent category per D-HW35-7 override. maker_associations: [] per D-HW35-6.",
    name: "Decorative Nailhead Trim",
    parent_category_id: "hardware_category_upholstery_hardware",
    description: "Repeating ornamental trim of brass or steel nailheads applied along upholstery edges.",
    unique_traits: [
      "Visible repeating trim pattern",
    ],
    identifying_characteristics: [
      "Uniform spacing",
      "Brass or steel heads",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1800 },
    ],
    date_range_summary: "1800-present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_attachment_point", "upholstery_arm", "upholstery_back"],
    replacement_likelihood: "high",
  },
  {
    id: "hardware_type_coil_spring_hardware",
    category: "hardware_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Tied-spring upholstery suspension system with steel coil structure; continuous use 1850-present.",
    notes: "Per Furniture_Hardware_Identification_System.docx UPHOLSTERY HARDWARE > Coil Spring Hardware. 7/7 per A-7. replacement_likelihood MEDIUM per A-6 default (structural support; reupholstery campaigns may retain original springs). assessment_layer 'upholstery' inherited from parent category per D-HW35-7 override. maker_associations: [] per D-HW35-6.",
    name: "Coil Spring Hardware",
    parent_category_id: "hardware_category_upholstery_hardware",
    description: "Steel coil spring suspension hardware for upholstered-seating structural support.",
    unique_traits: [
      "Upholstery suspension system",
    ],
    identifying_characteristics: [
      "Tied spring bases",
      "Steel coil structure",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1850 },
    ],
    date_range_summary: "1850-present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_support_layer", "upholstery_seat"],
    replacement_likelihood: "medium",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-12: SPECIALTY AND ERA-DIAGNOSTIC HARDWARE
  // (4 entries; all era-tight at 8/8 per A-7).
  // ═══════════════════════════════════════════════════════════
  {
    id: "hardware_type_eastlake_hardware",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Incised geometric ornament brass hardware with sunburst/geometric motifs; tight Eastlake-era anchor 1870-1895.",
    notes: "Per Furniture_Hardware_Identification_System.docx SPECIALTY AND ERA-DIAGNOSTIC HARDWARE > Eastlake Hardware. 8/8 era-canonical anchor per A-7 (1870-1895 tight era). replacement_likelihood LOW per A-6 default (era-canonical; replacing eliminates dating value). Heavy reproduction-market presence per Rule #4 canonical anchor (Hardware Conflict Rules: 'Reproduction Eastlake hardware'). maker_associations: [] per D-HW35-6.",
    name: "Eastlake Hardware",
    parent_category_id: "hardware_category_specialty_and_era_diagnostic_hardware",
    description: "Era-diagnostic hardware carrying Eastlake-period incised geometric ornament and angular decorative carving influence.",
    unique_traits: [
      "Incised geometric ornament",
      "Angular decorative carving influence",
    ],
    identifying_characteristics: [
      "Incised linework",
      "Sunburst or geometric motifs",
      "Often brass",
    ],
    period_associations: [
      { period_label: "Eastlake era", date_floor: 1870, date_ceiling: 1895 },
    ],
    date_range_summary: "1870-1895.",
    style_associations: [
      { style_label: "Eastlake", date_floor: 1870, date_ceiling: 1895, usage_notes: "Tight era anchor; heavy reproduction-market post-1895 per Rule #4 canonical anchor." },
    ],
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "low",
  },
  {
    id: "hardware_type_art_deco_hardware",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Streamlined geometric machine-age-styled hardware with chrome + Bakelite + stepped forms; tight Art Deco-era anchor 1925-1945.",
    notes: "Per Furniture_Hardware_Identification_System.docx SPECIALTY AND ERA-DIAGNOSTIC HARDWARE > Art Deco Hardware. 8/8 era-canonical anchor per A-7 (1925-1945 tight era). replacement_likelihood LOW per A-6 default (era-canonical). maker_associations: [] per D-HW35-6.",
    name: "Art Deco Hardware",
    parent_category_id: "hardware_category_specialty_and_era_diagnostic_hardware",
    description: "Era-diagnostic hardware carrying Art Deco streamlined geometry and machine-age styling with chrome and Bakelite materials.",
    unique_traits: [
      "Streamlined geometry",
      "Machine-age styling",
    ],
    identifying_characteristics: [
      "Chrome",
      "Bakelite",
      "Stepped geometric forms",
    ],
    period_associations: [
      { period_label: "Art Deco era", date_floor: 1925, date_ceiling: 1945 },
    ],
    date_range_summary: "1925-1945.",
    style_associations: [
      { style_label: "Art Deco", date_floor: 1925, date_ceiling: 1945 },
    ],
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "low",
  },
  {
    id: "hardware_type_mid_century_modern_hardware",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Minimalist functional aluminum or teak-integrated recessed pulls with clean linear forms; Mid-Century Modern era anchor 1945-1975.",
    notes: "Per Furniture_Hardware_Identification_System.docx SPECIALTY AND ERA-DIAGNOSTIC HARDWARE > Mid-Century Modern Hardware. 8/8 era-canonical anchor per A-7 (1945-1975 era). replacement_likelihood LOW per A-6 default (era-canonical). maker_associations: [] per D-HW35-6.",
    name: "Mid-Century Modern Hardware",
    parent_category_id: "hardware_category_specialty_and_era_diagnostic_hardware",
    description: "Era-diagnostic hardware carrying Mid-Century Modern minimalist functional design with recessed pulls and aluminum or teak integration.",
    unique_traits: [
      "Minimalist functional design",
      "Integrated pulls common",
    ],
    identifying_characteristics: [
      "Recessed pulls",
      "Aluminum or teak integration",
      "Clean linear forms",
    ],
    period_associations: [
      { period_label: "Mid-Century Modern era", date_floor: 1945, date_ceiling: 1975 },
    ],
    date_range_summary: "1945-1975.",
    style_associations: [
      { style_label: "Mid-Century Modern", date_floor: 1945, date_ceiling: 1975 },
    ],
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "low",
  },
  {
    id: "hardware_type_machine_age_industrial_hardware",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Utilitarian production hardware with exposed fasteners + steel emphasis + nickel plating + tubular forms; Machine-Age era 1900-1950.",
    notes: "Per Furniture_Hardware_Identification_System.docx SPECIALTY AND ERA-DIAGNOSTIC HARDWARE > Machine-Age Industrial Hardware. 8/8 era-canonical anchor per A-7 (1900-1950 industrial production era). replacement_likelihood LOW per A-6 default (era-canonical). maker_associations: [] per D-HW35-6.",
    name: "Machine-Age Industrial Hardware",
    parent_category_id: "hardware_category_specialty_and_era_diagnostic_hardware",
    description: "Era-diagnostic hardware carrying Machine-Age industrial utilitarian production with exposed fasteners and steel emphasis.",
    unique_traits: [
      "Utilitarian production",
      "Exposed fasteners",
      "Steel emphasis",
    ],
    identifying_characteristics: [
      "Nickel plating",
      "Tubular forms",
      "Industrial stamping",
    ],
    period_associations: [
      { period_label: "Machine-Age era", date_floor: 1900, date_ceiling: 1950 },
    ],
    date_range_summary: "1900-1950.",
    style_associations: [
      { style_label: "Machine-Age Industrial", date_floor: 1900, date_ceiling: 1950 },
    ],
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel", "case_corner"],
    replacement_likelihood: "low",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-13: MODERN SYNTHETIC HARDWARE (2 entries)
  // Era-bounded soft-boundary polymer-industry windows per Q3
  // Option E (NO AG; captured as period_associations).
  // ═══════════════════════════════════════════════════════════
  {
    id: "hardware_type_bakelite_hardware",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Early thermoset plastic hardware with dense hard feel; dark brown/black common; soft-boundary polymer-industry window 1920-1955 (NO AG per Q3 Option E).",
    notes: "Per Furniture_Hardware_Identification_System.docx MODERN SYNTHETIC HARDWARE > Bakelite Hardware. 8/8 era-canonical anchor per A-7 (1920-1955 polymer-industry window). replacement_likelihood MEDIUM per A-6 default. Era-bounded soft-boundary per Q3 Option E captured as single-period period_associations with explicit date_ceiling; NO AG (polymer-industry production-window decline, not industrial-introduction-boundary). maker_associations: [] per D-HW35-6.",
    name: "Bakelite Hardware",
    parent_category_id: "hardware_category_modern_synthetic_hardware",
    description: "Hardware in early thermoset phenolic plastic with dense hard feel and characteristic dark brown or black color.",
    unique_traits: [
      "Early thermoset plastic",
      "Dense hard feel",
    ],
    identifying_characteristics: [
      "Dark brown/black common",
      "Warm feel unlike metal",
      "Mold seams possible",
    ],
    period_associations: [
      { period_label: "Polymer-industry production window", date_floor: 1920, date_ceiling: 1955, usage_notes: "Bakelite invented 1907; production maturity 1920-1955; superseded by acrylic/Lucite + later polymers post-1955." },
    ],
    date_range_summary: "1920-1955.",
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "medium",
  },
  {
    id: "hardware_type_acrylic_lucite_hardware",
    category: "hardware_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Transparent synthetic acrylic/Lucite hardware with clear or colored plastic light-refraction properties; soft-boundary polymer-industry window 1945-1975 peak (NO AG per Q3 Option E).",
    notes: "Per Furniture_Hardware_Identification_System.docx MODERN SYNTHETIC HARDWARE > Acrylic/Lucite Hardware. 8/8 era-canonical anchor per A-7 (1945-1975 polymer-industry peak window). replacement_likelihood MEDIUM per A-6 default. Era-bounded soft-boundary per Q3 Option E captured as multi-period period_associations (peak + continued); NO AG. maker_associations: [] per D-HW35-6.",
    name: "Acrylic/Lucite Hardware",
    parent_category_id: "hardware_category_modern_synthetic_hardware",
    description: "Hardware in transparent synthetic acrylic (PMMA) or Lucite with light-refraction properties.",
    unique_traits: [
      "Transparent synthetic appearance",
    ],
    identifying_characteristics: [
      "Clear or colored plastic",
      "Light refraction",
    ],
    period_associations: [
      { period_label: "Peak polymer-industry window", date_floor: 1945, date_ceiling: 1975 },
      { period_label: "Continued use", date_floor: 1975, usage_notes: "PMMA polymer remains in production; post-peak window continued but reduced furniture application." },
    ],
    date_range_summary: "1945-1975 peak. Continued later.",
    maker_associations: [],
    common_observed_locations: ["drawer_front", "door_panel"],
    replacement_likelihood: "medium",
  },
];

/**
 * HARDWARE_REASONING_RULES — 5 meta-rule entries per Block 35
 * D-HW35-10. All entries authority 9/9; migration_status
 * "complete"; migration_target engine_reasoning. cross_layer
 * _scope: true on rules #1 (hardware_alone_never_dates_furniture)
 * + #5 (hardware_evidence_layer_independence). Other 3 rules
 * (replacement_hardware_risk, rural_persistence, reproduction_
 * hardware_warning) cross_layer_scope: false (hardware-layer-
 * only). FIFTH canonical-library encoding of Independent Layer
 * Evaluation Standard per D-HW35-12 (after wood rule #7, maker
 * rule #1 cross_layer_scope, joinery rule #5, fastener rule #5).
 *
 * D-HW35-13 NEW canonical reasoning rule: reproduction_hardware
 * _warning (4th new evidence-library reasoning-rule type after
 * restoration_false_signals + replacement_fastener_risk +
 * restoration_contamination). Captures Hardware Conflict Rules
 * canonical-source warnings (Colonial Revival batwing
 * reproductions, Reproduction Eastlake hardware, etc.).
 */
export const HARDWARE_REASONING_RULES: HardwareReasoningRule[] = [
  {
    id: "hardware_reasoning_hardware_alone_never_dates_furniture",
    category: "hardware_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Hardware Alone Never Dates Furniture",
    rule_statement: "Hardware evidence — hardware type, era-canonical style class, material, hand-vs-machine character — is secondary evidence for dating attribution and is NEVER primary dating authority alone. Hardware evidence must combine with frame evidence (wood, joinery, form, construction logic, fasteners) per the frame assessment AND, where relevant, upholstery evidence (covers, construction, upholstery hardware) per the upholstery assessment for the canonical dual-assessment output. A hardware identification in isolation cannot date a piece; hardware is frequently replaced, reused, upgraded, or mixed across periods, making originality assessment critical.",
    rationale: "Per Furniture_Hardware_Identification_System.docx overarching principle: 'Hardware is secondary evidence, not primary dating evidence. Hardware is frequently replaced, reused, upgraded, or mixed across periods. Originality assessment is critical.' Hardware Evidence Rules canonical-source section classifies Strong Dating Indicators (hand-forged irregular hinges, surface-mounted iron locks, porcelain casters, Bakelite pulls, Euro hinges, machine-stamped decorative plates, Phillips screw integration, Lucite pulls) and Weak Dating Indicators (generic wooden knobs, reproduction brass pulls, modern replacement hinges, recently polished hardware, mixed-period hardware sets). Per D-AP32-3 replacement-likelihood discipline, hardware is the MOST-REPLACED canonical evidence class (more than fasteners which sit at high-replacement, joinery at medium-low, wood at lowest). Authority for whole-piece dating is calibrated downward against harder-to-replace evidence. Parallel discipline to wood, joinery, maker, fastener library 'X alone never dates furniture' meta-rules — FIFTH canonical-library encoding of the pattern. cross_layer_scope: true reflects governance over hardware evidence combination with all other evidence layers at both frame and upholstery assessment outputs.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["hardware_type", "hardware_category"],
    cross_layer_scope: true,
    notes: "Fifth canonical-library encoding of layer-independence meta-rule (after wood rule #1, maker rule #1, joinery rule #1, fastener rule #1). Specifically operates across both frame and upholstery assessment outputs per dual-assessment architecture (D-FA33-5 + D-HW35-7 + D-HW35-14). Strong/Weak Dating Indicators tier classification per D-HW35-8 captured in this rationale verbatim; per-type authority calibration (D-AR29-11) operationalizes the tier framework at the entry level.",
  },
  {
    id: "hardware_reasoning_replacement_hardware_risk",
    category: "hardware_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Replacement Hardware Risk",
    rule_statement: "Hardware is the MOST-REPLACED canonical evidence class on antique furniture. Modern replacement hardware (recently polished brass, modern brass pulls, modern replacement hinges, Euro hinge retrofits) appearing on antique pieces commonly indicates restoration or upgrade rather than original construction. The engine must distinguish original hardware (carrying canonical dating evidence) from replacement hardware (carrying repair-era context but NOT original construction dating). Per Hardware Evidence Rules canonical Weak Dating Indicators, mixed-period hardware sets are diagnostic of replacement campaigns rather than original construction. Diagnostic anchors for distinguishing original from replacement: hardware shadow consistency, original finish continuity beneath backplates, wear pattern matching surrounding finish, mounting hole ghost evidence, plugged hardware holes, non-matching screw metallurgy, original escutcheon shadow outlines.",
    rationale: "Per Furniture_Hardware_Identification_System.docx Hardware Evidence Rules section Weak Dating Indicators list: 'Generic wooden knobs, Reproduction brass pulls, Modern replacement hinges, Recently polished hardware, Mixed-period hardware sets.' Per High-Authority Hardware Observations canonical-source section: 'Mounting hole ghost evidence, Plugged hardware holes, Non-matching screw metallurgy, Original escutcheon shadow outlines' are the canonical diagnostic anchors. STRONGER than fasteners' replacement_fastener_risk rule because hardware is even MORE-replaced canonical evidence class than fasteners per D-AP32-3 replacement-likelihood discipline ranking: hardware > fasteners > joinery > wood. Per-entry replacement_likelihood field on HardwareTypeEntry calibrates this rule's application per hardware type (Block 36 authoring). AG entries on industrial-introduction-boundary hardware types provide concrete temporal anchors.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["hardware_type", "hardware_category"],
    cross_layer_scope: false,
    notes: "Per-entry replacement_likelihood field operationalizes this rule per hardware type per Block 36 authoring. Hardware Conflict Rules canonical-source examples ('Colonial revival batwing pulls on 1920s furniture', 'Modern replacement pulls on 1880s case pieces', 'Added casters', 'Reproduction Eastlake hardware', 'Victorian furniture with later Art Deco pulls', 'Antique furniture retrofitted with Euro hinges') populate the rule's operational scope. Hardware shadow consistency + plugged hole archaeology canonical evidentiary anchors per High-Authority Hardware Observations section.",
  },
  {
    id: "hardware_reasoning_rural_persistence",
    category: "hardware_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Rural Persistence",
    rule_statement: "Older hardware persisted in regional production long after industrial alternatives existed elsewhere. Surface-Mount Locks persisted in rural furniture production into the late 19th century. Strap Hinges (medieval origins) continued in rural and farm-furniture use through 1900. Wooden Casters persisted in rural production after porcelain and rubber casters dominated urban markets. Hand-forged hardware does NOT automatically establish pre-industrial dating; regional persistence patterns require corroborating evidence from form, wood, joinery, and maker context.",
    rationale: "Per Furniture_Hardware_Identification_System.docx Surface-Mount Lock canonical-source DATE RANGE: '1650-1850 primary. Rural persistence later' (verbatim 'Rural persistence later' phrasing). Strap Hinge DATE RANGE: 'Medieval origins. Furniture use: 1650-1900' (medieval-origin technology with persistence through industrial era). Wooden Caster persistence patterns per canonical-source content. Parallel to joinery rural_persistence_warning (Block 30 D-JN30 rule #2) + fastener rural_persistence (Block 33 D-FA33 rule #3). The rule governs engine reasoning to surface regional persistence context when hand-forged or rural-pattern hardware evidence accumulates, preventing inappropriate dating-ceiling assertions.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["hardware_type"],
    cross_layer_scope: false,
    notes: "Cross-references joinery rural_persistence_warning (D-JN30) + fastener rural_persistence (D-FA33). Shared regional persistence framework applies across joinery, fastener, and hardware evidence axes. Affects specifically hardware_type_hand_forged_butt_hinge + hardware_type_surface_mount_lock + hardware_type_strap_hinge + hardware_type_wooden_caster per Block 36 authoring; regional_persistence_notes field populated on those types per canonical-source warrant.",
  },
  {
    id: "hardware_reasoning_reproduction_hardware_warning",
    category: "hardware_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Reproduction Hardware Warning",
    rule_statement: "Hardware is extensively reproduced for restoration, Colonial Revival manufacturing, and decorative-arts replication markets. Reproduction hardware appearing on furniture may indicate restoration introduction, Colonial Revival manufacturing context, or contemporary furniture in period style — none of which establish dating for the underlying piece. The engine must distinguish original-period hardware (carrying canonical dating evidence) from reproduction hardware (carrying NO original dating evidence). Canonical reproduction patterns include: Colonial Revival batwing pulls (1890-1940 reproducing 1750-1790 Federal originals), Reproduction Eastlake hardware (modern reproductions of 1870-1895 originals), Victorian furniture retrofitted with later Art Deco pulls, antique furniture retrofitted with Euro hinges, sustained bail-pull revival production across centuries (1680-1780 → 1890-1940 Colonial Revival).",
    rationale: "Per Furniture_Hardware_Identification_System.docx Hardware Conflict Rules canonical-source section: 'Colonial revival batwing pulls on 1920s furniture, Modern replacement pulls on 1880s case pieces, Added casters, Reproduction Eastlake hardware, Victorian furniture with later Art Deco pulls, Antique furniture retrofitted with Euro hinges.' Drop Pull / Bail Pull DATE RANGE explicitly captures multiple revival waves: 'Early examples: 1680-1780 / Federal/Hepplewhite wave: 1780-1820 / Empire/Classical wave: 1810-1845 / Victorian revival use: 1860-1910 / Colonial Revival reuse: 1890-1940' — making single bail-pull observation impossible to date without corroborating evidence. NEW canonical reasoning rule per D-HW35-13 — fourth new evidence-library reasoning-rule TYPE after restoration_false_signals (joinery Rule #3) + replacement_fastener_risk (fastener Rule #2) + restoration_contamination (fastener Rule #4). Hardware-specific reproduction risk requires dedicated rule because reproduction hardware is canonically DESIGNED to mimic original-period hardware (unlike replacement fasteners which are typically modernity-marked).",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["hardware_type", "hardware_category"],
    cross_layer_scope: false,
    notes: "NEW canonical reasoning rule per D-HW35-13. Affects all stylistically-defined hardware types per Block 36 authoring; particularly operative on Drop Pull / Bail Pull variants (Batwing + Chippendale + Sheraton Oval subtypes) + Eastlake Hardware (heavy reproduction market) + Art Deco Hardware. Cross-references hardware_category_specialty_and_era_diagnostic_hardware which sits at 8/8 authority precisely because era-defining hardware is canonical dating evidence WHEN VERIFIED ORIGINAL (not reproduction). Distinguishing original-vs-reproduction is the canonical appraiser judgment this rule operationalizes.",
  },
  {
    id: "hardware_reasoning_hardware_evidence_layer_independence",
    category: "hardware_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Hardware Evidence Layer Independence",
    rule_statement: "Hardware evidence (hardware type, era-canonical style class, replacement_likelihood, material, manufacturing-era boundary, shadow/wear/finish continuity observations) is evaluated independently from other evidence layers (wood, maker marks, form, construction logic, joinery, fasteners, upholstery covers, upholstery construction). Hardware-axis findings must NOT be biased by upstream findings from other layers. The engine must not, for example, use a tentative form attribution to narrow hardware-type candidates, nor use observed location to pre-filter hardware types. Each layer outputs independent evidence; cross-layer combination occurs at the report layer via dual-assessment output (frame + upholstery) with overlap-driven confidence. High-Authority Hardware Observations (hardware shadow consistency, original finish continuity beneath backplates, wear pattern matching surrounding finish, lock mortise oxidation continuity, mounting hole ghost evidence, plugged hardware holes, non-matching screw metallurgy, original escutcheon shadow outlines) enable multi-layer evidentiary reading independent of form/wood/construction analysis.",
    rationale: "Per Block 22.5 D-PA-1 Independent Layer Evaluation Standard. Canonicalized for hardware library per the pattern established by wood reasoning rule #7 (wood_evidence_layer_independence), maker reasoning rule #1 (core_maker_attribution_rule cross_layer_scope), joinery reasoning rule #5 (joinery_evidence_layer_independence), and fastener reasoning rule #5 (fastener_evidence_layer_independence). FIFTH canonical-library encoding of ILE Standard per D-HW35-12. The rule explicitly blocks dependency-wiring proposals that would create downstream-evidence-from-upstream-evidence inference biases on the hardware axis. Per Furniture_Hardware_Identification_System.docx High-Authority Hardware Observations canonical-source section, hardware evidence carries its own independent evidentiary anchors (shadow consistency, finish continuity, wear patterns, mortise oxidation, mounting hole archaeology) that are observable independently of wood/finish/form evidence. Operationally integrates with dual-assessment architecture (D-FA33-5 + D-HW35-7 + D-HW35-14) — hardware layer outputs are independent inputs to both frame and upholstery assessment confidence calculations.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["hardware_type", "hardware_category", "hardware_reasoning_rule"],
    cross_layer_scope: true,
    notes: "Fifth canonical-library encoding of Independent Layer Evaluation Standard (after wood, maker, joinery, fastener) per D-HW35-12. Cross-library convention reinforced: each evidence-library reasoning-rule set includes one layer-independence canonical artifact per ILE precedent. Operationally integrates with dual-assessment architecture per D-HW35-7 + D-HW35-14 per-category override mechanism. High-Authority Hardware Observations canonical anchors per Furniture_Hardware_Identification_System.docx provide independent evidentiary support paralleling joinery's surface evidence + fastener's location-as-helper-not-routing pattern.",
  },
];
