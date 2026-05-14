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
 * HARDWARE_TYPES — per-hardware-type canonical entries. Empty in
 * Block 35 scaffold; Block 36 authors ~42 entries from
 * Furniture_Hardware_Identification_System.docx canonical source
 * (per Op A-6 estimate; exact count TBD at Block 36 Op A).
 */
export const HARDWARE_TYPES: HardwareTypeEntry[] = [];

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
