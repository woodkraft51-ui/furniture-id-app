// fasteners.ts
//
// Fasteners library. Phase 2 Session 7 second library
// (four-file evidence libraries architecture; first library
// joinery shipped Blocks 30-31). Block 33 ships schema
// foundation + 6 categories + 9 subcategories + 5 reasoning
// rules + dual-assessment architecture convention; Block 34
// follows with 25 FASTENER_TYPES content authoring from
// Fastener_Reference.docx canonical source.
//
// Architecture:
// - FastenerCategoryEntry: 6 top-level category entries
//   (parent-category pattern parallel to wood and joinery).
// - FastenerSubcategoryEntry: 9 subcategory entries
//   (intermediate tier; canonical source structures NAILS /
//   SCREWS / STAPLES into subcategories where Hand-Forged vs
//   Cut vs Wire nails are different evidence classes).
// - FastenerTypeEntry: per-type entries; Block 34 authors 25.
//   Flat fields parallel to MakerMarkEntry + JoineryTypeEntry
//   pattern.
// - FastenerReasoningRule: meta-rule entries parallel to
//   WoodEvidenceReasoningRule + MakerAttributionReasoningRule
//   + JoineryReasoningRule shape. Block 33 authors 5 entries.
// - Cross-library CategoryEntry promotion to entryShape.ts
//   deferred to end-of-Phase-2 reconciliation pass per D-JN30-7
//   precedent.
// - engine.ts UNCHANGED per Phase 2 / Phase 3 separation.
//
// Dual-assessment architecture (D-FA33-5): each canonical
// evidence library declares assessment_layer at structural
// level. Fasteners library: category default "frame";
// subcategory override permitted (Cat 3 STAPLES subcategories
// both override to "upholstery"). Schema Option II encodes
// the field on BOTH FastenerCategoryEntry AND
// FastenerSubcategoryEntry.

import type {
  CanonicalEntry,
  PeriodAssociation,
  AntiClassificationGuidance,
  ReasoningRuleMigrationTarget,
  PhysicalLocation,
} from "./entryShape";

/**
 * FastenerCategoryEntry — top-level fastener category per Block
 * 33 D-FA33-2. 6 categories per Fastener_Reference.docx
 * PRIMARY FASTENER CATEGORIES section (Op A-4 enumeration).
 *
 * Field roster:
 * - category: literal "fastener_category"
 * - name: canonical category name verbatim from seed
 * - category_description: prose description from seed
 *   CATEGORY DESCRIPTION section
 * - unique_category_traits: array from seed UNIQUE TRAITS OF
 *   [CATEGORY] section
 * - core_identifying_elements?: array from seed CORE
 *   IDENTIFYING ELEMENTS or IDENTIFYING ELEMENTS section
 *   (OPTIONAL per D-FA33-Surfacing-2: Category 6 GLUE-
 *   ASSISTED has UNIQUE TRAITS but no separate IDENTIFYING
 *   ELEMENTS section in seed; field optional permits per-
 *   category-fidelity authoring per D-JN30-9 field-naming
 *   variance precedent)
 * - assessment_layer: "frame" | "upholstery" per D-FA33-5
 *   dual-assessment architecture convention. All 6 Block 33
 *   categories at "frame"; subcategory override (Cat 3
 *   STAPLES) handles upholstery routing per Option II
 *   schema encoding.
 */
export interface FastenerCategoryEntry extends CanonicalEntry {
  category: "fastener_category";
  name: string;
  category_description: string;
  unique_category_traits: string[];
  core_identifying_elements?: string[];
  assessment_layer: "frame" | "upholstery";
}

/**
 * FastenerSubcategoryEntry — intermediate-tier fastener
 * subcategory per Block 33 D-FA33-2. 9 subcategories per
 * Fastener_Reference.docx canonical structure (Op A-5
 * enumeration): 3 NAILS subcategories + 4 SCREWS subcategories
 * + 2 STAPLES subcategories. Categories 4/5/6 have no
 * subcategory tier per seed; types under those categories use
 * parent_subcategory_id: undefined per Block 34 authoring.
 *
 * Field roster:
 * - category: literal "fastener_subcategory"
 * - name: subcategory name verbatim from seed
 * - parent_category_id: FK to FastenerCategoryEntry.id
 * - subcategory_description: prose from seed DESCRIPTION
 * - unique_traits: array from seed UNIQUE CHARACTERISTICS
 * - identifying_characteristics: array from seed IDENTIFYING
 *   CHARACTERISTICS
 * - period_associations: PeriodAssociation[] from seed DATE
 *   RANGE
 * - date_range_summary: prose summary from seed DATE RANGE
 * - assessment_layer: "frame" | "upholstery"; OVERRIDES parent
 *   category default when canonical source warrants per
 *   D-FA33-5 (Cat 3 STAPLES subcategories 3A + 3B → "upholstery"
 *   override; all other subcategories inherit "frame")
 */
export interface FastenerSubcategoryEntry extends CanonicalEntry {
  category: "fastener_subcategory";
  name: string;
  parent_category_id: string;
  subcategory_description: string;
  unique_traits: string[];
  identifying_characteristics: string[];
  period_associations: PeriodAssociation[];
  date_range_summary: string;
  assessment_layer: "frame" | "upholstery";
}

/**
 * FastenerTypeEntry — per-fastener-type canonical entry per
 * Block 33 D-FA33-2. Flat fields parallel to MakerMarkEntry
 * and JoineryTypeEntry pattern. Block 34 authors 25 entries.
 *
 * Field roster:
 * - category: literal "fastener_type"
 * - name: fastener type name verbatim from seed
 * - parent_category_id: FK to FastenerCategoryEntry.id
 * - parent_subcategory_id?: FK to FastenerSubcategoryEntry.id
 *   (optional; for types directly under categories without
 *   subcategory tier, e.g., Cat 4 BOLTS, Cat 5 KNOCK-DOWN,
 *   Cat 6 GLUE-ASSISTED)
 * - description: prose from seed DESCRIPTION
 * - unique_traits: array from seed UNIQUE CHARACTERISTICS
 * - identifying_characteristics: array from seed IDENTIFYING
 *   CHARACTERISTICS
 * - period_associations: PeriodAssociation[] from seed DATE
 *   RANGE
 * - date_range_summary: prose summary from seed DATE RANGE
 * - common_observed_locations?: PhysicalLocation[] —
 *   IDENTIFICATION HELPER per D-FA33-6 (Mike clarification:
 *   location can determine the fastener type but once
 *   correctly identified the fastener is aged according to
 *   that identification). NOT used for assessment routing.
 * - anti_classification_guidance?: AG entry on industrial-
 *   introduction-boundary fastener types (Phillips 1935,
 *   Torx 1967, Confirmat 1970, Cam Lock 1960, Robertson
 *   1908, Allen 1910s, Barrel Nut 1950, Upholstery Staple
 *   1930-1950) — Block 34 authoring populates per type
 * - replacement_likelihood: "low" | "medium" | "high" per
 *   D-FA33-7 + D-AP32-3 discipline (high-replacement-
 *   likelihood evidence class for whole-piece-dating
 *   purposes; per-type calibration permitted Block 34)
 * - related_fastener_types?: cross-references to sibling
 *   fastener types within library
 * - related_joinery_types?: cross-library FKs to joinery
 *   library entries per D-FA33-8 (biscuit, cam_lock,
 *   confirmat, corrugated, stapled per Op A-7 cross-
 *   reference candidates)
 */
export interface FastenerTypeEntry extends CanonicalEntry {
  category: "fastener_type";
  name: string;
  parent_category_id: string;
  parent_subcategory_id?: string;
  description: string;
  unique_traits: string[];
  identifying_characteristics: string[];
  period_associations: PeriodAssociation[];
  date_range_summary: string;
  common_observed_locations?: PhysicalLocation[];
  anti_classification_guidance?:
    | AntiClassificationGuidance
    | AntiClassificationGuidance[];
  replacement_likelihood: "low" | "medium" | "high";
  related_fastener_types?: string[];
  related_joinery_types?: string[];
  /**
   * Per Rule #3 rural_persistence: rural-persistence-bounded prose
   * captured per-entry where canonical source surfaces regional
   * persistence context (Appalachian + Mennonite + Shaker + frontier
   * + rural Southern). Block 33 schema-gap correction per Block 34
   * D-FA34-Surfacing-8: field added to parallel JoineryTypeEntry
   * precedent and operationalize plan A-9 + D-FA34-7. Optional;
   * populated on rural-persistence-bounded types only.
   */
  regional_persistence_notes?: string;
}

/**
 * FastenerReasoningRule — meta-rule entries per Block 33
 * D-FA33-9. Parallel shape to WoodEvidenceReasoningRule +
 * MakerAttributionReasoningRule + JoineryReasoningRule. 5
 * entries authored Block 33. Authority 9/9 per meta-rule
 * supremacy precedent (D-WE26-8 / D-MM27-5); migration_status
 * "complete" per D-WE26-11 convention.
 */
export interface FastenerReasoningRule extends CanonicalEntry {
  category: "fastener_reasoning_rule";
  rule_name: string;
  rule_statement: string;
  rationale: string;
  migration_target: ReasoningRuleMigrationTarget;
  applies_to_entry_types?: string[];
  cross_layer_scope?: boolean;
}

/**
 * FASTENER_CATEGORIES — 6 top-level fastener categories per
 * Block 33 D-FA33-2. Per D-FA33-10 authority calibration: 2
 * categories at 8/8 (NAILS, SCREWS — primary dating-evidence
 * rigor with canonical era boundaries); 4 categories at 7/7
 * (STAPLES, BOLTS/RODS, KNOCK-DOWN, GLUE-ASSISTED — medium-
 * strong with canonical-source rationale). All 6 entries
 * assessment_layer "frame" per D-FA33-5 default; subcategory
 * override per Cat 3 STAPLES subcategories handles upholstery
 * routing.
 */
export const FASTENER_CATEGORIES: FastenerCategoryEntry[] = [
  {
    id: "fastener_category_nails",
    category: "fastener_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Single-shaft penetrating fasteners driven by hammer force; primary dating-evidence category per hand-forged 1600-1830 + cut nails 1790-1900 + wire nails 1890+ canonical era boundaries.",
    notes: "Per Fastener_Reference.docx CATEGORY 1: NAILS section. Primary dating-evidence rigor per D-FA33-10 (8/8 calibration). Subcategory tier present per seed: 1A Hand-Forged + 1B Cut Nails + 1C Wire Nails (3 subcategories).",
    name: "Nails",
    category_description: "Nails are among the oldest and most common furniture fasteners. Their evolution closely follows blacksmithing, mechanization, and industrial manufacturing technology.",
    unique_category_traits: [
      "Single-shaft penetrating fastener",
      "Typically driven by hammer force",
      "Usually non-threaded",
      "Relies on friction and shaft deformation",
      "Commonly used in carcass assembly, drawer runners, backboards, upholstery, trim, structural reinforcement",
    ],
    core_identifying_elements: [
      "shaft shape",
      "taper pattern",
      "manufacturing marks",
      "head formation",
      "cutting/shearing evidence",
      "material composition",
      "oxidation behavior",
      "consistency/uniformity",
      "burr patterns",
      "hand-forged irregularities",
    ],
    assessment_layer: "frame",
  },
  {
    id: "fastener_category_screws",
    category: "fastener_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Threaded fasteners designed for rotational insertion and increased holding strength; primary dating-evidence category per handmade 1700-1840 + machine-cut 1840+ + Phillips 1935+ canonical era boundaries.",
    notes: "Per Fastener_Reference.docx CATEGORY 2: SCREWS section. Primary dating-evidence rigor per D-FA33-10 (8/8 calibration). Subcategory tier present per seed: 2A Handmade + 2B Machine-Cut + 2C Phillips-Head + 2D Modern Drive Types (4 subcategories).",
    name: "Screws",
    category_description: "Threaded fasteners designed for rotational insertion and increased holding strength.",
    unique_category_traits: [
      "Threaded shaft",
      "Rotational installation",
      "Greater withdrawal resistance",
      "Often indicates technological precision",
    ],
    core_identifying_elements: [
      "slot type",
      "threading method",
      "shaft taper",
      "point style",
      "machining precision",
      "thread consistency",
      "head geometry",
    ],
    assessment_layer: "frame",
  },
  {
    id: "fastener_category_staples",
    category: "fastener_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Multi-prong penetrating fasteners primarily associated with upholstery and industrial assembly; restoration-contamination-prone class with lower whole-piece-dating authority per D-AP32-3.",
    notes: "Per Fastener_Reference.docx CATEGORY 3: STAPLES section. 7/7 medium-strong per D-FA33-10 — restoration-contamination-prone evidence class. Subcategory tier present per seed: 3A Upholstery Tacks + 3B Machine Staples (2 subcategories). Category-level assessment_layer 'frame' but BOTH subcategories override to 'upholstery' per D-FA33-5 dual-assessment routing (canonical fastener-class is upholstery-attached regardless of physical location).",
    name: "Staples",
    category_description: "Multi-prong penetrating fasteners primarily associated with upholstery and industrial assembly.",
    unique_category_traits: [
      "Dual-leg penetration",
      "Bridging crown",
      "Usually mechanically driven",
    ],
    core_identifying_elements: [
      "crown width",
      "wire gauge",
      "leg penetration",
      "oxidation",
      "consistency",
    ],
    assessment_layer: "frame",
  },
  {
    id: "fastener_category_bolts_rods_machine_fasteners",
    category: "fastener_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Mechanical compression fasteners associated with industrial furniture production; industrial-era anchored evidence.",
    notes: "Per Fastener_Reference.docx CATEGORY 4: BOLTS, RODS, AND MACHINE FASTENERS section. 7/7 medium-strong per D-FA33-10. No subcategory tier per seed; fastener types under this category use parent_subcategory_id: undefined per Block 34 authoring (Carriage Bolt + Threaded Rod + Barrel Nut/Cross Dowel).",
    name: "Bolts, Rods, and Machine Fasteners",
    category_description: "Mechanical compression fasteners associated with industrial furniture production.",
    unique_category_traits: [
      "Threaded mechanical compression",
      "Nut-and-bolt systems",
      "Precision machining",
    ],
    core_identifying_elements: [
      "thread precision",
      "washer use",
      "nut forms",
      "machine tooling marks",
    ],
    assessment_layer: "frame",
  },
  {
    id: "fastener_category_knock_down_connectors",
    category: "fastener_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Disassemblable furniture connector systems; industrial-introduction-boundary AGs (Cam Lock 1960+, Confirmat 1970+); clean modern-only dating evidence.",
    notes: "Per Fastener_Reference.docx CATEGORY 5: KNOCK-DOWN (KD) CONNECTORS section. 7/7 medium-strong per D-FA33-10. No subcategory tier per seed; fastener types use parent_subcategory_id: undefined per Block 34 authoring (Cam Lock Connector + Confirmat Screw). Block 34 Confirmat Screw authoring cross-references joinery_type_confirmat_screw_joinery per Block 31 D-JN31-9 + Op A-7 surfacing.",
    name: "Knock-Down (KD) Connectors",
    category_description: "Disassemblable furniture connector systems.",
    unique_category_traits: [
      "Designed for repeated assembly/disassembly",
      "Precision industrial engineering",
    ],
    core_identifying_elements: [
      "cam systems",
      "threaded inserts",
      "modular hardware",
      "particleboard association",
    ],
    assessment_layer: "frame",
  },
  {
    id: "fastener_category_glue_assisted_fasteners",
    category: "fastener_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Fasteners intended to work alongside adhesive systems; overlaps with joinery library construction-pattern entries; modern-only dating evidence.",
    notes: "Per Fastener_Reference.docx CATEGORY 6: GLUE-ASSISTED FASTENERS section. 7/7 medium-strong per D-FA33-10. No subcategory tier per seed; fastener types use parent_subcategory_id: undefined per Block 34 authoring (Corrugated Fastener + Biscuit/Compression Plate). Block 34 cross-references joinery_type_biscuit_joint + joinery_type_corrugated_fastener_reinforcement per Op A-7. core_identifying_elements field OMITTED per D-FA33-Surfacing-2: Category 6 seed has UNIQUE TRAITS but no separate IDENTIFYING ELEMENTS section. Optional-field omission per joinery D-JN30-9 per-category field-naming variance precedent.",
    name: "Glue-Assisted Fasteners",
    category_description: "Fasteners intended to work alongside adhesive systems.",
    unique_category_traits: [
      "Hybrid mechanical/chemical holding",
      "Common in later factory production",
    ],
    assessment_layer: "frame",
  },
];

/**
 * FASTENER_SUBCATEGORIES — 9 intermediate-tier subcategories
 * per Block 33 D-FA33-2 + D-FA33-12 (count refined from plan
 * estimate "10-13" to seed-actual 9). Per D-FA33-10 authority
 * calibration: 6 subcategories at 8/8 (1A Hand-Forged, 1B Cut
 * Nails, 1C Wire Nails, 2A Handmade Screws, 2B Machine-Cut,
 * 2C Phillips-Head — primary dating-evidence rigor with
 * canonical era boundaries); 3 at 7/7 (2D Modern Drive Types,
 * 3A Upholstery Tacks, 3B Machine Staples — medium-strong with
 * canonical-source rationale). assessment_layer distribution:
 * 7 at "frame" (NAILS + SCREWS subcategories); 2 at "upholstery"
 * (Cat 3 STAPLES subcategories 3A + 3B per D-FA33-5 override).
 */
export const FASTENER_SUBCATEGORIES: FastenerSubcategoryEntry[] = [
  // ─── Sub-batch 2-1: Category 1 NAILS subcategories (3 entries) ───
  {
    id: "fastener_subcategory_hand_forged_nails",
    category: "fastener_subcategory",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Individually forged blacksmith nails with hammer-formed heads and irregular dimensions; STRONGLY EARLY indicator per seed; primary dating-evidence subcategory with rural-persistence-bounded ceiling.",
    notes: "Per Fastener_Reference.docx SUBCATEGORY 1A: HAND-FORGED NAILS section. 8/8 strongly_early-equivalent per D-FA33-10 (primary dating-evidence with canonical 1600-1830 era boundary). assessment_layer 'frame' inherited from parent category. Rural persistence into late 19th century per Rule #3 cross-reference; hand-forged evidence does NOT automatically establish pre-1850 dating per JoineryReasoningRule #2 parallel.",
    name: "Hand-Forged Nails",
    parent_category_id: "fastener_category_nails",
    subcategory_description: "Individually forged by blacksmiths using wrought iron stock.",
    unique_traits: [
      "Individually handmade",
      "Irregular dimensions",
      "Hammer-forged heads",
      "Tapered square shafts",
      "Visible asymmetry",
      "Wrought iron grain possible",
    ],
    identifying_characteristics: [
      "Rosehead or L-head forms common",
      "Uneven shaft thickness",
      "Hammer facets visible",
      "Non-uniform head placement",
      "Hand-clipped tips",
      "Oxidation often deep and uneven",
      "Frequently associated with mortise and tenon joinery, pit-sawn lumber, hand-planed surfaces",
    ],
    period_associations: [
      {
        period_label: "Primary dominance",
        date_floor: 1600,
        date_ceiling: 1830,
      },
      {
        period_label: "Rural persistence",
        date_floor: 1830,
        date_ceiling: 1899,
        usage_notes: "Hand-forged nails persisted in frontier/rural areas per Critical Evidence Warnings Rural Persistence section.",
      },
    ],
    date_range_summary: "c. 1600–1830 primary dominance. Rural persistence into late 19th century.",
    assessment_layer: "frame",
  },
  {
    id: "fastener_subcategory_cut_nails",
    category: "fastener_subcategory",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Machine-sheared nails cut from iron or steel plate with rectangular cross-section; primary dating-evidence subcategory with canonical 1790-1900 era boundary.",
    notes: "Per Fastener_Reference.docx SUBCATEGORY 1B: CUT NAILS section. 8/8 per D-FA33-10 (primary dating-evidence; transitional manufacturing era between hand-forged and wire). assessment_layer 'frame'. Cut nails survived in rural production well into late 19th century per Rule #3 rural_persistence.",
    name: "Cut Nails",
    parent_category_id: "fastener_category_nails",
    subcategory_description: "Machine-sheared nails cut from iron or steel plate.",
    unique_traits: [
      "Rectangular cross-section",
      "Opposing wedge taper",
      "Machine shearing marks",
      "More uniform than forged nails",
    ],
    identifying_characteristics: [
      "Two parallel sides",
      "Two tapered sides",
      "Burrs from shearing process",
      "Head mechanically formed",
      "Often associated with early machine woodworking, circular saw marks, transitional furniture",
    ],
    period_associations: [
      {
        period_label: "Primary dominance",
        date_floor: 1790,
        date_ceiling: 1900,
      },
      {
        period_label: "Specialty persistence",
        date_floor: 1900,
        usage_notes: "Persisted in specialty uses later per seed.",
      },
    ],
    date_range_summary: "c. 1790–1900 primary dominance. Persisted in specialty uses later.",
    assessment_layer: "frame",
  },
  {
    id: "fastener_subcategory_wire_nails",
    category: "fastener_subcategory",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Round-wire industrial nails formed from drawn steel wire; STRONGLY INDUSTRIAL indicator per seed (industrial uniformity); primary dating-evidence subcategory with post-1890 industrial-introduction floor.",
    notes: "Per Fastener_Reference.docx SUBCATEGORY 1C: WIRE NAILS section. 8/8 strongly_industrial-equivalent per D-FA33-10 (primary dating-evidence with canonical post-1890 floor). assessment_layer 'frame'.",
    name: "Wire Nails",
    parent_category_id: "fastener_category_nails",
    subcategory_description: "Round-wire industrial nails formed from drawn steel wire.",
    unique_traits: [
      "Fully cylindrical shaft",
      "Industrial uniformity",
      "Mass-production consistency",
    ],
    identifying_characteristics: [
      "Perfectly round shank",
      "Symmetrical head",
      "Smooth industrial finish",
      "Often associated with plywood, machine joinery, factory production, modern upholstery",
    ],
    period_associations: [
      {
        period_label: "Introduction",
        date_floor: 1880,
        date_ceiling: 1894,
      },
      {
        period_label: "Dominance",
        date_floor: 1895,
        usage_notes: "Dominant by c. 1895–1910 onward per seed.",
      },
    ],
    date_range_summary: "Introduced c. 1880s. Dominant by c. 1895–1910 onward.",
    assessment_layer: "frame",
  },

  // ─── Sub-batch 2-2: Category 2 SCREWS subcategories (4 entries) ───
  {
    id: "fastener_subcategory_handmade_screws",
    category: "fastener_subcategory",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Early individually produced screws with hand-filed threads and hand-slotted heads; STRONGLY EARLY indicator per seed; primary dating-evidence subcategory with canonical 1700-1840 era boundary.",
    notes: "Per Fastener_Reference.docx SUBCATEGORY 2A: HANDMADE SCREWS section. 8/8 strongly_early-equivalent per D-FA33-10 (primary dating-evidence with canonical era boundary). assessment_layer 'frame'.",
    name: "Handmade Screws",
    parent_category_id: "fastener_category_screws",
    subcategory_description: "Early individually produced screws.",
    unique_traits: [
      "Hand-filed threads",
      "Irregular spacing",
      "Hand-slotted heads",
    ],
    identifying_characteristics: [
      "Off-center slots",
      "Asymmetrical heads",
      "Uneven thread pitch",
      "Blunt tips common",
      "Often mixed with forged nails",
    ],
    period_associations: [
      {
        period_label: "Primary dominance",
        date_floor: 1700,
        date_ceiling: 1840,
      },
    ],
    date_range_summary: "c. 1700–1840.",
    assessment_layer: "frame",
  },
  {
    id: "fastener_subcategory_machine_cut_screws",
    category: "fastener_subcategory",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Industrial screws with machine-produced threads; primary dating-evidence subcategory with canonical 1840+ floor.",
    notes: "Per Fastener_Reference.docx SUBCATEGORY 2B: MACHINE-CUT SCREWS section. 8/8 per D-FA33-10 (primary dating-evidence with canonical era floor). assessment_layer 'frame'. Slotted screws remained common decades after Phillips existed per Rule #3 rural_persistence.",
    name: "Machine-Cut Screws",
    parent_category_id: "fastener_category_screws",
    subcategory_description: "Industrial screws with machine-produced threads.",
    unique_traits: [
      "Increased uniformity",
      "Consistent threading",
    ],
    identifying_characteristics: [
      "Symmetrical thread pitch",
      "Machine-centered slots",
      "Cleaner head geometry",
    ],
    period_associations: [
      {
        period_label: "Industrial production",
        date_floor: 1840,
      },
    ],
    date_range_summary: "c. 1840–present.",
    assessment_layer: "frame",
  },
  {
    id: "fastener_subcategory_phillips_head_screws",
    category: "fastener_subcategory",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Cross-slot screws designed for power driving; STRONGLY INDUSTRIAL indicator per seed; primary dating-evidence subcategory with canonical 1935+ AG anchor (highest-replacement-likelihood restoration-contamination class per Rule #2 + Rule #4).",
    notes: "Per Fastener_Reference.docx SUBCATEGORY 2C: PHILLIPS-HEAD SCREWS section. 8/8 strongly_industrial-equivalent per D-FA33-10 (primary dating-evidence with canonical 1935 AG anchor). assessment_layer 'frame'. Per Critical Evidence Warnings Restoration Contamination canonical-source warning: Phillips screws commonly introduced via repair/restoration; Rule #2 replacement_fastener_risk operational.",
    name: "Phillips-Head Screws",
    parent_category_id: "fastener_category_screws",
    subcategory_description: "Cross-slot screws designed for power driving.",
    unique_traits: [
      "Cruciform drive slot",
      "Machine-age production association",
    ],
    identifying_characteristics: [
      "Cross-shaped recess",
      "Highly standardized",
      "Often paired with plywood, particle board, modern hardware",
    ],
    period_associations: [
      {
        period_label: "Invention",
        date_floor: 1930,
        date_ceiling: 1939,
      },
      {
        period_label: "Broad furniture use",
        date_floor: 1940,
        usage_notes: "Broad furniture use after c. 1940 per seed.",
      },
    ],
    date_range_summary: "Invented 1930s. Broad furniture use after c. 1940.",
    assessment_layer: "frame",
  },
  {
    id: "fastener_subcategory_modern_drive_types",
    category: "fastener_subcategory",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Late industrial and contemporary screw systems with specialized tooling compatibility; medium-strong dating-evidence subcategory spanning multiple AG anchors (Robertson 1908, Torx 1967, Allen 1910s with furniture commonality later).",
    notes: "Per Fastener_Reference.docx SUBCATEGORY 2D: MODERN DRIVE TYPES section. 7/7 per D-FA33-10 — modern-era umbrella spans multiple AG anchors per Block 34 type authoring. assessment_layer 'frame'.",
    name: "Modern Drive Types",
    parent_category_id: "fastener_category_screws",
    subcategory_description: "Late industrial and contemporary screw systems.",
    unique_traits: [
      "Specialized tooling compatibility",
      "High-torque engineering",
    ],
    identifying_characteristics: [
      "Precision recess systems",
      "Machine manufacturing perfection",
    ],
    period_associations: [
      {
        period_label: "Modern era",
        date_floor: 1950,
        usage_notes: "Per-type AG anchors per Block 34 authoring: Robertson c. 1908, Torx c. 1967, Allen/Hex c. 1910s with furniture commonality later.",
      },
    ],
    date_range_summary: "c. 1950–present (umbrella; per-type anchors range Robertson 1908 through Torx 1967).",
    assessment_layer: "frame",
  },

  // ─── Sub-batch 2-3: Category 3 STAPLES subcategories (2 entries) ───
  // Both subcategories override category-default "frame" to
  // "upholstery" per D-FA33-5 dual-assessment architecture
  // (canonical fastener-class is upholstery-attached).
  {
    id: "fastener_subcategory_upholstery_tacks",
    category: "fastener_subcategory",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Decorative or functional upholstery attachment tacks individually placed by hammer; assessment_layer 'upholstery' per D-FA33-5 override.",
    notes: "Per Fastener_Reference.docx SUBCATEGORY 3A: UPHOLSTERY TACKS section. 7/7 per D-FA33-10 — appraiser-honest mixed-era usage spans 1700-present. assessment_layer 'upholstery' OVERRIDES parent category 'frame' default per D-FA33-5 dual-assessment architecture (canonical fastener-class is upholstery-attached regardless of physical location).",
    name: "Upholstery Tacks",
    parent_category_id: "fastener_category_staples",
    subcategory_description: "Individually-placed upholstery-attachment tacks driven by hammer.",
    unique_traits: [
      "Decorative or functional upholstery attachment",
    ],
    identifying_characteristics: [
      "Individual hammered placement",
      "Domed heads common",
      "Brass decorative examples frequent",
    ],
    period_associations: [
      {
        period_label: "Traditional upholstery period",
        date_floor: 1700,
      },
    ],
    date_range_summary: "c. 1700–present.",
    assessment_layer: "upholstery",
  },
  {
    id: "fastener_subcategory_machine_staples",
    category: "fastener_subcategory",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Mechanically-driven dual-leg upholstery staples; STRONGLY INDUSTRIAL upholstery indicator; restoration-contamination primary class per Rule #4. assessment_layer 'upholstery' per D-FA33-5 override.",
    notes: "Per Fastener_Reference.docx SUBCATEGORY 3B: MACHINE STAPLES section. 7/7 per D-FA33-10 — restoration-contamination class; lower whole-piece-dating authority per D-AP32-3. assessment_layer 'upholstery' OVERRIDES parent category 'frame' default per D-FA33-5 dual-assessment architecture. Reupholstery-era staples are 'campaign evidence' for upholstery assessment but 'restoration contamination' if interpreted against frame dating per Rule #4 restoration_contamination operationalization.",
    name: "Machine Staples",
    parent_category_id: "fastener_category_staples",
    subcategory_description: "Mechanically-driven multi-prong upholstery staples.",
    unique_traits: [
      "Mechanically driven",
      "Industrial speed assembly",
    ],
    identifying_characteristics: [
      "Uniform spacing",
      "Paired penetration holes",
      "Strong modern upholstery indicator",
    ],
    period_associations: [
      {
        period_label: "Introduction",
        date_floor: 1890,
        date_ceiling: 1949,
      },
      {
        period_label: "Dominance",
        date_floor: 1950,
        usage_notes: "Dominant after c. 1950 per seed.",
      },
    ],
    date_range_summary: "c. 1890–present. Dominant after c. 1950.",
    assessment_layer: "upholstery",
  },
];

/**
 * FASTENER_TYPES — per-fastener-type canonical entries. Empty
 * in Block 33 scaffold; Block 34 authors 25 entries from
 * Fastener_Reference.docx canonical source (2+3+3+1+3+1+3+1+1
 * +3+2+2 distribution per Op A-6 enumeration).
 */
export const FASTENER_TYPES: FastenerTypeEntry[] = [
  // ─── Sub-batch C-1: 1A HAND-FORGED NAILS (2 types) ───
  {
    id: "fastener_type_rosehead_nail",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Multi-faceted hand-forged hammered head with decorative radial appearance and four-sided shaft taper; STRONGLY EARLY indicator per Fastener_Reference.docx (c. 1600–1820 anchor).",
    notes: "Per Fastener_Reference.docx CATEGORY 1 NAILS > SUBCATEGORY 1A HAND-FORGED NAILS > Rosehead Nail. 8/8 STRONGLY EARLY canonical anchor per A-6. replacement_likelihood LOW per A-5 (rarely replaced; hand-forged in hidden locations is appraiser-honest evidence). regional_persistence_notes populated per A-9 (frontier/rural persistence per Critical Evidence Warnings).",
    name: "Rosehead Nail",
    parent_category_id: "fastener_category_nails",
    parent_subcategory_id: "fastener_subcategory_hand_forged_nails",
    description: "Multi-faceted hammered head with decorative radial appearance; hand-forged wrought iron.",
    unique_traits: [
      "Multi-faceted hammered head",
      "Decorative radial appearance",
      "Hand-forged wrought iron",
    ],
    identifying_characteristics: [
      "Pyramid-like hammered head",
      "Four-sided shaft taper",
      "Irregular head geometry",
      "Blacksmith hammer marks",
      "Often clenched/bent on reverse",
    ],
    period_associations: [
      {
        period_label: "Primary dominance",
        date_floor: 1600,
        date_ceiling: 1820,
      },
    ],
    date_range_summary: "c. 1600–1820.",
    replacement_likelihood: "low",
    regional_persistence_notes: "Hand-forged Rosehead Nails persisted in frontier/rural areas per Critical Evidence Warnings Rural Persistence canonical-source section. Presence does NOT automatically establish pre-1820 dating; regional persistence patterns require corroborating evidence from form, wood, joinery, and maker context per FastenerReasoningRule #3.",
  },
  {
    id: "fastener_type_l_head_t_head_nail",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Side-hammered functional forged head with minimal protrusion; flooring and casework hand-forged nail (c. 1700–1840 anchor).",
    notes: "Per Fastener_Reference.docx CATEGORY 1 NAILS > SUBCATEGORY 1A HAND-FORGED NAILS > L-Head / T-Head Nail. 8/8 STRONGLY EARLY canonical anchor per A-6. replacement_likelihood LOW per A-5. regional_persistence_notes populated per A-9. common_observed_locations populated per seed 'flooring and casework' reference (case_carcass closest enum match; flooring not applicable to furniture).",
    name: "L-Head / T-Head Nail",
    parent_category_id: "fastener_category_nails",
    parent_subcategory_id: "fastener_subcategory_hand_forged_nails",
    description: "Functional forged head with minimal protrusion; hand-forged for flooring and casework.",
    unique_traits: [
      "Functional forged head",
      "Minimal protrusion",
    ],
    identifying_characteristics: [
      "Side-hammered head",
      "Small flattened striking surface",
      "Often used in flooring and casework",
      "Hand-forged asymmetry",
    ],
    period_associations: [
      {
        period_label: "Primary dominance",
        date_floor: 1700,
        date_ceiling: 1840,
      },
    ],
    date_range_summary: "c. 1700–1840.",
    common_observed_locations: ["case_carcass", "case_back", "case_panel"],
    replacement_likelihood: "low",
    regional_persistence_notes: "Hand-forged L-Head/T-Head Nails persisted in frontier/rural areas per Critical Evidence Warnings Rural Persistence canonical-source section. Presence does NOT automatically establish pre-1840 dating; regional persistence patterns require corroborating evidence per FastenerReasoningRule #3.",
  },

  // ─── Sub-batch C-2: 1B CUT NAILS (3 types) ───
  {
    id: "fastener_type_early_hand_headed_cut_nail",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Machine-cut shaft with hand-applied head; transitional manufacturing evidence (c. 1790–1835 anchor).",
    notes: "Per Fastener_Reference.docx CATEGORY 1 NAILS > SUBCATEGORY 1B CUT NAILS > Early Hand-Headed Cut Nail. 8/8 transitional-manufacturing anchor per A-6. replacement_likelihood LOW per A-5. regional_persistence_notes populated per A-9 (cut nails survived in rural production well into late 19th century per canonical source).",
    name: "Early Hand-Headed Cut Nail",
    parent_category_id: "fastener_category_nails",
    parent_subcategory_id: "fastener_subcategory_cut_nails",
    description: "Machine-cut shaft with hand-applied head.",
    unique_traits: [
      "Machine-cut shaft with hand-applied head",
    ],
    identifying_characteristics: [
      "Irregular head atop uniform shaft",
      "Transitional manufacturing evidence",
      "Head may appear slightly off-center",
    ],
    period_associations: [
      {
        period_label: "Primary dominance",
        date_floor: 1790,
        date_ceiling: 1835,
      },
    ],
    date_range_summary: "c. 1790–1835.",
    replacement_likelihood: "low",
    regional_persistence_notes: "Cut nails survived in rural production well into late 19th century per Critical Evidence Warnings Rural Persistence canonical-source section. Early Hand-Headed presence does NOT automatically establish pre-1835 dating; regional persistence patterns require corroborating evidence per FastenerReasoningRule #3.",
  },
  {
    id: "fastener_type_machine_headed_cut_nail",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Fully mechanized cut nail production with consistent shaft dimensions and visible shearing burrs (c. 1825–1895 anchor).",
    notes: "Per Fastener_Reference.docx CATEGORY 1 NAILS > SUBCATEGORY 1B CUT NAILS > Machine-Headed Cut Nail. 8/8 industrial-era canonical anchor per A-6. replacement_likelihood LOW per A-5. regional_persistence_notes populated per A-9.",
    name: "Machine-Headed Cut Nail",
    parent_category_id: "fastener_category_nails",
    parent_subcategory_id: "fastener_subcategory_cut_nails",
    description: "Fully mechanized cut nail production.",
    unique_traits: [
      "Fully mechanized production",
    ],
    identifying_characteristics: [
      "More uniform head formation",
      "Consistent shaft dimensions",
      "Visible shearing burrs",
      "Often magnetic steel",
    ],
    period_associations: [
      {
        period_label: "Primary dominance",
        date_floor: 1825,
        date_ceiling: 1895,
      },
    ],
    date_range_summary: "c. 1825–1895.",
    replacement_likelihood: "low",
    regional_persistence_notes: "Cut nails survived in rural production well into late 19th century per Critical Evidence Warnings Rural Persistence canonical-source section. Machine-Headed presence does NOT automatically establish pre-1895 dating; regional persistence patterns require corroborating evidence per FastenerReasoningRule #3.",
  },
  {
    id: "fastener_type_brad_finish_cut_nail",
    category: "fastener_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Small-head cut nail designed for concealment in moldings and trim attachment (c. 1840–1910+).",
    notes: "Per Fastener_Reference.docx CATEGORY 1 NAILS > SUBCATEGORY 1B CUT NAILS > Brad / Finish Cut Nail. 7/7 secondary anchor per A-6 (decorative cut nail; specialty persistence). replacement_likelihood MEDIUM per A-5 (decorative; sometimes replaced). regional_persistence_notes populated per A-9 (cut nails category specialty persistence).",
    name: "Brad / Finish Cut Nail",
    parent_category_id: "fastener_category_nails",
    parent_subcategory_id: "fastener_subcategory_cut_nails",
    description: "Small-head trim nail designed for concealment.",
    unique_traits: [
      "Small-head trim nail",
      "Designed for concealment",
    ],
    identifying_characteristics: [
      "Minimal head exposure",
      "Slender rectangular shaft",
      "Used in moldings and trim attachment",
    ],
    period_associations: [
      {
        period_label: "Primary usage",
        date_floor: 1840,
        usage_notes: "Seed DATE RANGE '1840–1910+'; persisted in specialty trim uses later.",
      },
    ],
    date_range_summary: "c. 1840–1910+.",
    common_observed_locations: ["trim_or_molding"],
    replacement_likelihood: "medium",
    regional_persistence_notes: "Cut nails (including Brad/Finish variants) survived in rural and specialty trim production per Critical Evidence Warnings Rural Persistence canonical-source section per FastenerReasoningRule #3.",
  },

  // ─── Sub-batch C-3: 1C WIRE NAILS (3 types) ───
  {
    id: "fastener_type_common_wire_nail",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Round-shaft general-purpose wire nail with flat circular head; STRONGLY INDUSTRIAL post-1890 anchor.",
    notes: "Per Fastener_Reference.docx CATEGORY 1 NAILS > SUBCATEGORY 1C WIRE NAILS > Common Wire Nail. 8/8 post-industrial floor canonical anchor per A-6. replacement_likelihood MEDIUM per A-5.",
    name: "Common Wire Nail",
    parent_category_id: "fastener_category_nails",
    parent_subcategory_id: "fastener_subcategory_wire_nails",
    description: "General-purpose construction nail with round shaft and flat circular head.",
    unique_traits: [
      "General-purpose construction nail",
    ],
    identifying_characteristics: [
      "Round shaft",
      "Flat circular head",
      "Uniform industrial dimensions",
    ],
    period_associations: [
      {
        period_label: "Industrial production",
        date_floor: 1890,
      },
    ],
    date_range_summary: "c. 1890–present.",
    replacement_likelihood: "medium",
  },
  {
    id: "fastener_type_finish_nail",
    category: "fastener_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Concealable-head trim-focused wire nail with smooth cylindrical shaft (c. 1890–present).",
    notes: "Per Fastener_Reference.docx CATEGORY 1 NAILS > SUBCATEGORY 1C WIRE NAILS > Finish Nail. 7/7 secondary anchor per A-6. replacement_likelihood MEDIUM per A-5.",
    name: "Finish Nail",
    parent_category_id: "fastener_category_nails",
    parent_subcategory_id: "fastener_subcategory_wire_nails",
    description: "Concealable-head trim-focused wire nail.",
    unique_traits: [
      "Concealable head",
      "Trim-focused use",
    ],
    identifying_characteristics: [
      "Small countersink head",
      "Smooth cylindrical shaft",
      "Often set below surface",
    ],
    period_associations: [
      {
        period_label: "Industrial production",
        date_floor: 1890,
      },
    ],
    date_range_summary: "c. 1890–present.",
    common_observed_locations: ["trim_or_molding"],
    replacement_likelihood: "medium",
  },
  {
    id: "fastener_type_box_nail",
    category: "fastener_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Thinner-shaft wire nail used to minimize splitting (c. 1890–present).",
    notes: "Per Fastener_Reference.docx CATEGORY 1 NAILS > SUBCATEGORY 1C WIRE NAILS > Box Nail. 7/7 secondary anchor per A-6. replacement_likelihood MEDIUM per A-5.",
    name: "Box Nail",
    parent_category_id: "fastener_category_nails",
    parent_subcategory_id: "fastener_subcategory_wire_nails",
    description: "Thinner-shaft wire nail used to minimize splitting.",
    unique_traits: [
      "Thinner than common nail",
    ],
    identifying_characteristics: [
      "Reduced shaft diameter",
      "Used to minimize splitting",
    ],
    period_associations: [
      {
        period_label: "Industrial production",
        date_floor: 1890,
      },
    ],
    date_range_summary: "c. 1890–present.",
    replacement_likelihood: "medium",
  },

  // ─── Sub-batch C-4: 2A HANDMADE SCREWS (1 type) ───
  {
    id: "fastener_type_handmade_wood_screw",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Individually crafted screw with file marks on threads and asymmetrical hand-slotted head; STRONGLY EARLY anchor (c. 1750–1840).",
    notes: "Per Fastener_Reference.docx CATEGORY 2 SCREWS > SUBCATEGORY 2A HANDMADE SCREWS > Handmade Wood Screw. 8/8 STRONGLY EARLY canonical anchor per A-6. replacement_likelihood LOW per A-5 (rarely replaced).",
    name: "Handmade Wood Screw",
    parent_category_id: "fastener_category_screws",
    parent_subcategory_id: "fastener_subcategory_handmade_screws",
    description: "Individually crafted screw with hand-filed threads.",
    unique_traits: [
      "Individually crafted",
    ],
    identifying_characteristics: [
      "File marks on threads",
      "Slightly irregular spiral",
      "Head slot varies in depth/width",
      "Shaft often tapered inconsistently",
    ],
    period_associations: [
      {
        period_label: "Primary dominance",
        date_floor: 1750,
        date_ceiling: 1840,
      },
    ],
    date_range_summary: "c. 1750–1840.",
    replacement_likelihood: "low",
  },

  // ─── Sub-batch C-5: 2B MACHINE-CUT SCREWS (3 types) ───
  {
    id: "fastener_type_slotted_wood_screw",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Single-slot traditional woodworking screw with tapered shaft and countersunk flat head; 1840-1940 dominant anchor with rural persistence after Phillips.",
    notes: "Per Fastener_Reference.docx CATEGORY 2 SCREWS > SUBCATEGORY 2B MACHINE-CUT SCREWS > Slotted Wood Screw. 8/8 primary canonical anchor per A-6 (1840-1940 dominance + rural-persistence-bounded ceiling). replacement_likelihood MEDIUM per A-5. regional_persistence_notes populated per A-9 (slotted screws remained common decades after Phillips per canonical source). period_associations multi-entry per A-7 (1840-1940 dominant + 1940+ secondary).",
    name: "Slotted Wood Screw",
    parent_category_id: "fastener_category_screws",
    parent_subcategory_id: "fastener_subcategory_machine_cut_screws",
    description: "Single-slot head traditional woodworking fastener.",
    unique_traits: [
      "Single-slot head",
      "Traditional woodworking fastener",
    ],
    identifying_characteristics: [
      "Straight slot only",
      "Tapered shaft",
      "Countersunk flat heads common",
      "Frequently brass or steel",
    ],
    period_associations: [
      {
        period_label: "Primary dominance",
        date_floor: 1840,
        date_ceiling: 1940,
        usage_notes: "Dominant until c. 1930s-1940s per seed.",
      },
      {
        period_label: "Post-Phillips persistence",
        date_floor: 1940,
        usage_notes: "Slotted screws remained common decades after Phillips existed per Rural Persistence canonical-source warning.",
      },
    ],
    date_range_summary: "c. 1840–present. Dominant until c. 1930s–1940s.",
    replacement_likelihood: "medium",
    regional_persistence_notes: "Slotted screws remained common decades after Phillips existed per Critical Evidence Warnings Rural Persistence canonical-source section. Presence of slotted screws does NOT automatically establish pre-1935 dating; regional and specialty persistence patterns require corroborating evidence per FastenerReasoningRule #3.",
  },
  {
    id: "fastener_type_brass_wood_screw",
    category: "fastener_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Yellow-gold decorative corrosion-resistant slotted screw frequently used in campaign furniture, marine furniture, and higher-end cabinetry (c. 1840–present).",
    notes: "Per Fastener_Reference.docx CATEGORY 2 SCREWS > SUBCATEGORY 2B MACHINE-CUT SCREWS > Brass Wood Screw. 7/7 secondary anchor per A-6 (decorative). replacement_likelihood MEDIUM per A-5 (decorative; sometimes replaced).",
    name: "Brass Wood Screw",
    parent_category_id: "fastener_category_screws",
    parent_subcategory_id: "fastener_subcategory_machine_cut_screws",
    description: "Decorative and corrosion-resistant brass screw.",
    unique_traits: [
      "Decorative and corrosion-resistant",
    ],
    identifying_characteristics: [
      "Yellow-gold coloration",
      "Softer metal wear",
      "Often used in campaign furniture, marine furniture, higher-end cabinetry",
    ],
    period_associations: [
      {
        period_label: "Industrial production",
        date_floor: 1840,
      },
    ],
    date_range_summary: "c. 1840–present.",
    replacement_likelihood: "medium",
  },
  {
    id: "fastener_type_steel_wood_screw",
    category: "fastener_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Stronger ferromagnetic industrial-finish slotted screw with dark oxidation (c. 1850–present).",
    notes: "Per Fastener_Reference.docx CATEGORY 2 SCREWS > SUBCATEGORY 2B MACHINE-CUT SCREWS > Steel Wood Screw. 7/7 secondary anchor per A-6. replacement_likelihood MEDIUM per A-5.",
    name: "Steel Wood Screw",
    parent_category_id: "fastener_category_screws",
    parent_subcategory_id: "fastener_subcategory_machine_cut_screws",
    description: "Stronger industrial steel screw.",
    unique_traits: [
      "Stronger than brass",
    ],
    identifying_characteristics: [
      "Ferromagnetic",
      "Dark oxidation",
      "Industrial finish",
    ],
    period_associations: [
      {
        period_label: "Industrial production",
        date_floor: 1850,
      },
    ],
    date_range_summary: "c. 1850–present.",
    replacement_likelihood: "medium",
  },

  // ─── Sub-batch C-6: 2C PHILLIPS-HEAD (1 type) ───
  {
    id: "fastener_type_phillips_wood_screw",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Cross-recess power-driver-optimized wood screw with uniform industrial threading; STRONGLY INDUSTRIAL primary indicator per seed; AG floor 1935.",
    notes: "Per Fastener_Reference.docx CATEGORY 2 SCREWS > SUBCATEGORY 2C PHILLIPS-HEAD SCREWS > Phillips Wood Screw. 8/8 AG anchor per A-6. replacement_likelihood HIGH per A-5 (restoration-contamination primary indicator per Rule #4). AG floor 1935 per A-4 (seed 'c. 1935-present').",
    name: "Phillips Wood Screw",
    parent_category_id: "fastener_category_screws",
    parent_subcategory_id: "fastener_subcategory_phillips_head_screws",
    description: "Power-driver-optimized cross-recess wood screw.",
    unique_traits: [
      "Power-driver optimized",
    ],
    identifying_characteristics: [
      "Cross recess",
      "Uniform industrial threading",
      "Strong postwar association",
    ],
    period_associations: [
      {
        period_label: "Phillips emergence",
        date_floor: 1935,
      },
    ],
    date_range_summary: "c. 1935–present.",
    common_observed_locations: ["movable_hardware_attachment"],
    replacement_likelihood: "high",
    anti_classification_guidance: {
      boundary_date: 1935,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1935 presence of Phillips Wood Screw indicates either repair-introduction (Replacement Fastener Risk + Restoration Contamination per FastenerReasoningRule #2 and #4) or misidentification; this fastener did not exist in pre-1935 original construction.",
      prominence: "prominent",
    },
  },

  // ─── Sub-batch C-7: 2D MODERN DRIVE TYPES (3 types) ───
  {
    id: "fastener_type_robertson",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Square-socket drive screw with strong Canadian production association; AG floor 1908; most common after mid-20th century.",
    notes: "Per Fastener_Reference.docx CATEGORY 2 SCREWS > SUBCATEGORY 2D MODERN DRIVE TYPES > Robertson (Square Drive). 8/8 AG anchor per A-6. replacement_likelihood HIGH per A-5. AG floor 1908 per A-4. period_associations multi-entry per A-7 (1908-1949 introduction + 1950+ widespread).",
    name: "Robertson (Square Drive)",
    parent_category_id: "fastener_category_screws",
    parent_subcategory_id: "fastener_subcategory_modern_drive_types",
    description: "Square socket drive screw.",
    unique_traits: [
      "Square socket drive",
    ],
    identifying_characteristics: [
      "Square recess",
      "Strong Canadian production association",
    ],
    period_associations: [
      {
        period_label: "Robertson emergence",
        date_floor: 1908,
        date_ceiling: 1949,
      },
      {
        period_label: "Mid-20th century dominance",
        date_floor: 1950,
        usage_notes: "Most common after mid-20th century per seed.",
      },
    ],
    date_range_summary: "c. 1908–present. Most common after mid-20th century.",
    common_observed_locations: ["movable_hardware_attachment"],
    replacement_likelihood: "high",
    anti_classification_guidance: {
      boundary_date: 1908,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1908 presence of Robertson (Square Drive) screw indicates either repair-introduction (Replacement Fastener Risk + Restoration Contamination per FastenerReasoningRule #2 and #4) or misidentification; this fastener did not exist in pre-1908 original construction.",
      prominence: "prominent",
    },
  },
  {
    id: "fastener_type_torx",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Six-point star recess high-torque resistance screw; STRONGLY INDUSTRIAL modern/contemporary indicator; AG floor 1967.",
    notes: "Per Fastener_Reference.docx CATEGORY 2 SCREWS > SUBCATEGORY 2D MODERN DRIVE TYPES > Torx Screw. 8/8 AG anchor per A-6. replacement_likelihood HIGH per A-5. AG floor 1967 per A-4.",
    name: "Torx Screw",
    parent_category_id: "fastener_category_screws",
    parent_subcategory_id: "fastener_subcategory_modern_drive_types",
    description: "Star-shaped drive screw.",
    unique_traits: [
      "Star-shaped drive",
    ],
    identifying_characteristics: [
      "Six-point star recess",
      "High torque resistance",
      "Strong modern/contemporary indicator",
    ],
    period_associations: [
      {
        period_label: "Torx emergence",
        date_floor: 1967,
      },
    ],
    date_range_summary: "c. 1967–present.",
    common_observed_locations: ["movable_hardware_attachment"],
    replacement_likelihood: "high",
    anti_classification_guidance: {
      boundary_date: 1967,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1967 presence of Torx Screw indicates either repair-introduction (Replacement Fastener Risk + Restoration Contamination per FastenerReasoningRule #2 and #4) or misidentification; this fastener did not exist in pre-1967 original construction.",
      prominence: "prominent",
    },
  },
  {
    id: "fastener_type_allen_hex_socket_screw",
    category: "fastener_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Internal hex recess screw frequently associated with KD furniture, contemporary imports, and modular systems; AG floor 1910 (technology introduction; furniture commonality later).",
    notes: "Per Fastener_Reference.docx CATEGORY 2 SCREWS > SUBCATEGORY 2D MODERN DRIVE TYPES > Allen / Hex Socket Screw. 7/7 per A-6 (canonical 'Furniture commonality later' qualifier weakens anchor strength below 8/8 threshold despite AG presence). replacement_likelihood HIGH per A-5. AG floor 1910 per A-4 + Block 34 D-FA34-Surfacing-1 (seed 'c. 1910s-present'; decade-start convention). period_associations multi-entry per A-7 (1910-1949 technology introduction + 1950+ furniture commonality).",
    name: "Allen / Hex Socket Screw",
    parent_category_id: "fastener_category_screws",
    parent_subcategory_id: "fastener_subcategory_modern_drive_types",
    description: "Internal hex recess screw.",
    unique_traits: [
      "Internal hex recess",
    ],
    identifying_characteristics: [
      "Hexagonal socket",
      "Frequently associated with KD furniture, contemporary imports, modular systems",
    ],
    period_associations: [
      {
        period_label: "Technology introduction",
        date_floor: 1910,
        date_ceiling: 1949,
        usage_notes: "Allen/Hex socket technology introduced c. 1910s per seed; furniture commonality later.",
      },
      {
        period_label: "Furniture commonality",
        date_floor: 1950,
        usage_notes: "Furniture commonality later per seed; KD furniture and contemporary imports primary context.",
      },
    ],
    date_range_summary: "c. 1910s–present. Furniture commonality later.",
    common_observed_locations: ["movable_hardware_attachment"],
    replacement_likelihood: "high",
    anti_classification_guidance: {
      boundary_date: 1910,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1910 presence of Allen / Hex Socket Screw indicates either repair-introduction (Replacement Fastener Risk + Restoration Contamination per FastenerReasoningRule #2 and #4) or misidentification; this fastener did not exist in pre-1910 original construction. Note: Allen/Hex socket furniture commonality is post-1950 per canonical seed; pre-1950 presence in furniture original construction is highly atypical even within the technology-introduction era.",
      prominence: "prominent",
    },
  },

  // ─── Sub-batch C-8: 3A UPHOLSTERY TACKS (1 type) ───
  {
    id: "fastener_type_decorative_brass_tack",
    category: "fastener_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Decorative brass domed-head exposed-upholstery-edge tack with visible rhythmic spacing (c. 1800–present). assessment_layer inherited 'upholstery' from parent subcategory 3A.",
    notes: "Per Fastener_Reference.docx CATEGORY 3 STAPLES > SUBCATEGORY 3A UPHOLSTERY TACKS > Decorative Brass Tack. 7/7 per A-6 (decorative; appraiser-honest mixed-era usage). replacement_likelihood MEDIUM per A-5. assessment_layer inherited 'upholstery' from parent subcategory per D-FA33-5.",
    name: "Decorative Brass Tack",
    parent_category_id: "fastener_category_staples",
    parent_subcategory_id: "fastener_subcategory_upholstery_tacks",
    description: "Decorative exposed upholstery edge tack.",
    unique_traits: [
      "Decorative exposed upholstery edge",
    ],
    identifying_characteristics: [
      "Brass domed head",
      "Visible rhythmic spacing",
    ],
    period_associations: [
      {
        period_label: "Decorative upholstery period",
        date_floor: 1800,
      },
    ],
    date_range_summary: "c. 1800–present.",
    common_observed_locations: ["upholstery_attachment_point", "upholstery_arm", "upholstery_back"],
    replacement_likelihood: "medium",
  },

  // ─── Sub-batch C-9: 3B MACHINE STAPLES (1 type) ───
  {
    id: "fastener_type_upholstery_staple",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Narrow-crown steel-wire pneumatic-consistency upholstery staple; STRONGLY INDUSTRIAL upholstery indicator; AG floor 1930 (canonical introduction; widespread 1950+). assessment_layer inherited 'upholstery'.",
    notes: "Per Fastener_Reference.docx CATEGORY 3 STAPLES > SUBCATEGORY 3B MACHINE STAPLES > Upholstery Staple. 8/8 AG anchor per A-6. replacement_likelihood HIGH per A-5 (restoration-contamination primary indicator). AG floor 1930 per A-4 + D-FA34-Surfacing-2 (D-JN31-4 introduction-year-is-AG-floor convention; canonical seed 'c. 1930-present. Very common after 1950'; widespread 1950 captured as second period_associations entry). related_joinery_types FK to joinery_type_stapled_drawer_joinery per D-FA34-5. D-FA34-11 cross-library AG floor divergence (1930 fastener vs 1950 joinery) per Mike-locked addition. assessment_layer inherited 'upholstery' from parent subcategory.",
    name: "Upholstery Staple",
    parent_category_id: "fastener_category_staples",
    parent_subcategory_id: "fastener_subcategory_machine_staples",
    description: "Rapid upholstery fastening narrow-crown steel-wire staple.",
    unique_traits: [
      "Rapid upholstery fastening",
    ],
    identifying_characteristics: [
      "Narrow crown",
      "Steel wire construction",
      "Pneumatic consistency",
    ],
    period_associations: [
      {
        period_label: "Introduction",
        date_floor: 1930,
        date_ceiling: 1949,
      },
      {
        period_label: "Widespread upholstery use",
        date_floor: 1950,
        usage_notes: "Very common after 1950 per seed.",
      },
    ],
    date_range_summary: "c. 1930–present. Very common after 1950.",
    common_observed_locations: ["upholstery_attachment_point", "upholstery_support_layer"],
    replacement_likelihood: "high",
    anti_classification_guidance: {
      boundary_date: 1930,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1930 presence of Upholstery Staple indicates either repair-introduction (Replacement Fastener Risk + Restoration Contamination per FastenerReasoningRule #2 and #4) or misidentification; this fastener did not exist in pre-1930 original construction. Note: Per dual-assessment architecture (D-FA33-5), presence on antique pieces typically reflects reupholstery campaign date for the upholstery assessment, NOT frame assessment dating. Reupholstery-era staples are 'campaign evidence' for upholstery assessment but 'restoration contamination' if interpreted against frame dating per Rule #4 restoration_contamination operationalization.",
      prominence: "prominent",
    },
    related_joinery_types: ["joinery_type_stapled_drawer_joinery"],
  },

  // ─── Sub-batch C-10: Category 4 BOLTS (3 types; no subcategory) ───
  {
    id: "fastener_type_carriage_bolt",
    category: "fastener_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Rounded exposed-head anti-rotation-neck mechanical compression bolt frequently used in beds and tables (c. 1850–present).",
    notes: "Per Fastener_Reference.docx CATEGORY 4 BOLTS, RODS, AND MACHINE FASTENERS > Carriage Bolt. 7/7 secondary anchor per A-6. replacement_likelihood LOW per A-5 (structural; not commonly replaced). parent_subcategory_id omitted per Cat 4 no-subcategory structure.",
    name: "Carriage Bolt",
    parent_category_id: "fastener_category_bolts_rods_machine_fasteners",
    description: "Rounded exposed head bolt with anti-rotation neck.",
    unique_traits: [
      "Rounded exposed head",
      "Anti-rotation neck",
    ],
    identifying_characteristics: [
      "Smooth domed head",
      "Square neck beneath head",
      "Often used in beds/tables",
    ],
    period_associations: [
      {
        period_label: "Industrial production",
        date_floor: 1850,
      },
    ],
    date_range_summary: "c. 1850–present.",
    common_observed_locations: ["frame_joint", "structural_reinforcement"],
    replacement_likelihood: "low",
  },
  {
    id: "fastener_type_threaded_rod",
    category: "fastener_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Continuous-threading long-span structural compression rod frequently hidden internally (c. 1880–present).",
    notes: "Per Fastener_Reference.docx CATEGORY 4 BOLTS, RODS, AND MACHINE FASTENERS > Threaded Rod. 7/7 secondary anchor per A-6. replacement_likelihood LOW per A-5 (D-FA34-Surfacing-6 resolution: plan A-5 'LOW-MEDIUM' → LOW per 'structural; not commonly replaced' rationale). parent_subcategory_id omitted.",
    name: "Threaded Rod",
    parent_category_id: "fastener_category_bolts_rods_machine_fasteners",
    description: "Long-span structural compression rod with continuous threading.",
    unique_traits: [
      "Long-span structural compression",
    ],
    identifying_characteristics: [
      "Continuous threading",
      "Frequently hidden internally",
    ],
    period_associations: [
      {
        period_label: "Industrial production",
        date_floor: 1880,
      },
    ],
    date_range_summary: "c. 1880–present.",
    common_observed_locations: ["structural_reinforcement"],
    replacement_likelihood: "low",
  },
  {
    id: "fastener_type_barrel_nut_cross_dowel",
    category: "fastener_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Cylindrical internal nut knock-down furniture connector with Allen-drive association; strong modern indicator (c. 1950–present).",
    notes: "Per Fastener_Reference.docx CATEGORY 4 BOLTS, RODS, AND MACHINE FASTENERS > Barrel Nut / Cross Dowel. 7/7 secondary KD anchor per A-6. replacement_likelihood LOW per A-5 (era-canonical knock-down). parent_subcategory_id omitted.",
    name: "Barrel Nut / Cross Dowel",
    parent_category_id: "fastener_category_bolts_rods_machine_fasteners",
    description: "Knock-down furniture cylindrical internal nut connector.",
    unique_traits: [
      "Knock-down furniture connector",
    ],
    identifying_characteristics: [
      "Cylindrical internal nut",
      "Allen-drive association",
      "Strong modern indicator",
    ],
    period_associations: [
      {
        period_label: "Modern KD era",
        date_floor: 1950,
      },
    ],
    date_range_summary: "c. 1950–present.",
    replacement_likelihood: "low",
  },

  // ─── Sub-batch C-11: Category 5 KNOCK-DOWN (2 types; no subcategory) ───
  {
    id: "fastener_type_cam_lock_connector",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Rotational locking disc flat-pack furniture connector with circular recessed cam hardware; STRONGLY INDUSTRIAL primary indicator; AG floor 1960.",
    notes: "Per Fastener_Reference.docx CATEGORY 5 KNOCK-DOWN (KD) CONNECTORS > Cam Lock Connector. 8/8 AG anchor per A-6. replacement_likelihood LOW per A-5 (era-canonical; not commonly replaced because era-specific). AG floor 1960 per A-4 (matches joinery library D-JN31 precedent ✓). related_joinery_types FK to joinery_type_knock_down_cam_lock_joinery per D-FA34-5. parent_subcategory_id omitted.",
    name: "Cam Lock Connector",
    parent_category_id: "fastener_category_knock_down_connectors",
    description: "Rotational locking disc cam fastener system.",
    unique_traits: [
      "Rotational locking disc",
    ],
    identifying_characteristics: [
      "Circular recessed cam",
      "Flat-pack furniture association",
      "Common in MDF/particle board",
    ],
    period_associations: [
      {
        period_label: "Flat-pack era",
        date_floor: 1960,
      },
    ],
    date_range_summary: "c. 1960–present.",
    common_observed_locations: ["case_carcass", "frame_joint"],
    replacement_likelihood: "low",
    anti_classification_guidance: {
      boundary_date: 1960,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1960 presence of Cam Lock Connector indicates either repair-introduction (Replacement Fastener Risk + Restoration Contamination per FastenerReasoningRule #2 and #4) or misidentification; this fastener did not exist in pre-1960 original construction.",
      prominence: "prominent",
    },
    related_joinery_types: ["joinery_type_knock_down_cam_lock_joinery"],
  },
  {
    id: "fastener_type_confirmat_screw",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Large-coarse-thread blunt-tip engineered panel fastener common in melamine/MDF construction; STRONGLY INDUSTRIAL primary indicator; AG floor 1970.",
    notes: "Per Fastener_Reference.docx CATEGORY 5 KNOCK-DOWN (KD) CONNECTORS > Confirmat Screw. 8/8 AG anchor per A-6. replacement_likelihood LOW per A-5 (era-canonical). AG floor 1970 per A-4 (matches joinery library D-JN31-9 precedent ✓). related_joinery_types FK to joinery_type_confirmat_screw_joinery per D-FA34-5. parent_subcategory_id omitted.",
    name: "Confirmat Screw",
    parent_category_id: "fastener_category_knock_down_connectors",
    description: "Engineered panel fastener for particleboard.",
    unique_traits: [
      "Engineered panel fastener",
    ],
    identifying_characteristics: [
      "Large coarse threads",
      "Blunt tip",
      "Common in melamine/MDF construction",
    ],
    period_associations: [
      {
        period_label: "Engineered panel era",
        date_floor: 1970,
      },
    ],
    date_range_summary: "c. 1970–present.",
    common_observed_locations: ["case_carcass"],
    replacement_likelihood: "low",
    anti_classification_guidance: {
      boundary_date: 1970,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1970 presence of Confirmat Screw indicates either repair-introduction (Replacement Fastener Risk + Restoration Contamination per FastenerReasoningRule #2 and #4) or misidentification; this fastener did not exist in pre-1970 original construction.",
      prominence: "prominent",
    },
    related_joinery_types: ["joinery_type_confirmat_screw_joinery"],
  },

  // ─── Sub-batch C-12: Category 6 GLUE-ASSISTED (2 types; no subcategory) ───
  {
    id: "fastener_type_corrugated_fastener",
    category: "fastener_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Wavy embedded zig-zag steel plate driven across joints; common in inexpensive case furniture (c. 1880–1950 era-bounded).",
    notes: "Per Fastener_Reference.docx CATEGORY 6 GLUE-ASSISTED FASTENERS > Corrugated Fastener. 7/7 secondary anchor per A-6. replacement_likelihood MEDIUM per A-5. period_associations multi-entry per A-7 (1880-1929 introduction + 1930-1950 widespread; end-ceiling 1950 per canonical seed unique among fastener types). NO AG per D-FA34-Surfacing-4 (soft-boundary phrasing 'Common in inexpensive case furniture' does not meet hard boundary-classification threshold; period_associations array captures range adequately). related_joinery_types FK to joinery_type_corrugated_fastener_reinforcement per D-FA34-5. parent_subcategory_id omitted.",
    name: "Corrugated Fastener",
    parent_category_id: "fastener_category_glue_assisted_fasteners",
    description: "Wavy embedded metal strip driven across joints.",
    unique_traits: [
      "Wavy embedded metal strip",
    ],
    identifying_characteristics: [
      "Zig-zag steel plate",
      "Embedded across joints",
      "Common in inexpensive case furniture",
    ],
    period_associations: [
      {
        period_label: "Industrial introduction",
        date_floor: 1880,
        date_ceiling: 1929,
      },
      {
        period_label: "Widespread dominance",
        date_floor: 1930,
        date_ceiling: 1950,
        usage_notes: "Common in inexpensive case furniture per seed; end-ceiling 1950 reflects usage frequency drop per canonical phrasing.",
      },
    ],
    date_range_summary: "c. 1880–1950.",
    common_observed_locations: ["frame_joint", "case_corner"],
    replacement_likelihood: "medium",
    related_joinery_types: ["joinery_type_corrugated_fastener_reinforcement"],
  },
  {
    id: "fastener_type_biscuit_compression_plate",
    category: "fastener_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Precision alignment support biscuit/compression plate system; STRONGLY INDUSTRIAL modern woodworking association; AG floor 1950 (matches joinery library precedent).",
    notes: "Per Fastener_Reference.docx CATEGORY 6 GLUE-ASSISTED FASTENERS > Biscuit / Compression Plate Systems. 8/8 AG anchor per A-6 (matches joinery library biscuit_joint 8/8 precedent). replacement_likelihood MEDIUM per A-5. AG floor 1950 per A-4 + D-FA34-Surfacing-3 (matches joinery D-JN31-4 biscuit experimental 1950 floor precedent ✓; resolves plan Q3 AG count to 8 from estimate 7). related_joinery_types FK to joinery_type_biscuit_joint per D-FA34-5. parent_subcategory_id omitted.",
    name: "Biscuit / Compression Plate Systems",
    parent_category_id: "fastener_category_glue_assisted_fasteners",
    description: "Precision alignment support biscuit/compression plate systems.",
    unique_traits: [
      "Precision alignment support",
    ],
    identifying_characteristics: [
      "Machine-cut insertion slots",
      "Modern woodworking association",
    ],
    period_associations: [
      {
        period_label: "Modern woodworking era",
        date_floor: 1950,
      },
    ],
    date_range_summary: "c. 1950–present.",
    common_observed_locations: ["frame_joint"],
    replacement_likelihood: "medium",
    anti_classification_guidance: {
      boundary_date: 1950,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1950 presence of Biscuit / Compression Plate Systems indicates either repair-introduction (Replacement Fastener Risk + Restoration Contamination per FastenerReasoningRule #2 and #4) or misidentification; this fastener did not exist in pre-1950 original construction. Matches joinery library D-JN31-4 biscuit_joint 1950 AG floor precedent.",
      prominence: "prominent",
    },
    related_joinery_types: ["joinery_type_biscuit_joint"],
  },
];

/**
 * FASTENER_REASONING_RULES — 5 meta-rule entries per Block 33
 * D-FA33-9. All entries authority 9/9; migration_status
 * "complete"; migration_target engine_reasoning. cross_layer
 * _scope: true on rules #1 (fasteners_alone_never_dates_
 * furniture) + #5 (fastener_evidence_layer_independence).
 * Other 3 rules (replacement_fastener_risk, rural_persistence,
 * restoration_contamination) cross_layer_scope: false
 * (fastener-layer-only). Fourth canonical-library encoding of
 * Independent Layer Evaluation Standard per D-FA33-11 (after
 * wood rule #7, maker rule #1 cross_layer_scope, joinery rule
 * #5).
 */
export const FASTENER_REASONING_RULES: FastenerReasoningRule[] = [
  {
    id: "fastener_reasoning_fasteners_alone_never_dates_furniture",
    category: "fastener_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Fasteners Alone Never Dates Furniture",
    rule_statement: "Fastener evidence — fastener type, era-canonical class, hand-vs-machine character — is supporting evidence for dating attribution but is NEVER primary dating authority alone. Fastener evidence must combine with frame evidence (wood, joinery, form, hardware) per the frame assessment AND, where relevant, upholstery evidence (covers, construction) per the upholstery assessment for the canonical dual-assessment output. A fastener identification in isolation cannot date a piece; a piece's fastener convergence with other evidence axes supports the appropriate assessment's dating conclusion.",
    rationale: "Per Fastener_Reference.docx pre-category introductory framework: 'Fasteners are among the most powerful dating tools in furniture analysis because they often carry hard technological boundaries... That said, fasteners must always be evaluated alongside construction methods, tool marks, materials, regional persistence, repair history, restoration/replacement evidence.' Per FASTENERS ARE STRONGEST WHEN canonical framework: original + structurally integrated + repeated consistently + supported by surrounding evidence. Per FASTENERS ARE WEAKEST WHEN: isolated + clearly replaced + decorative only + attached during upholstery or restoration + inconsistent with surrounding construction. Per Critical Evidence Warnings Replacement Fastener Risk: 'A single modern screw does NOT automatically modernize a piece. Always check: hidden locations + untouched interior joints + underside fasteners + inaccessible hardware + consistency across the piece.' Per D-AP32-3 replacement-likelihood discipline, fasteners are the canonical high-replacement-likelihood evidence class; their authority for whole-piece dating is calibrated downward against harder-to-replace evidence. Parallel discipline to wood, joinery, maker library 'X alone never dates furniture' meta-rules. cross_layer_scope: true reflects governance over fastener evidence combination with all other evidence layers at both frame and upholstery assessment outputs.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["fastener_type", "fastener_subcategory", "fastener_category"],
    cross_layer_scope: true,
    notes: "Fourth canonical-library encoding of layer-independence meta-rule (after wood rule #1, maker rule #1, joinery rule #1). Specifically operates across both frame and upholstery assessment outputs per dual-assessment architecture (D-FA33-5). Pre-category introductory framework + STRONGEST/WEAKEST canonical framing cited per Surfacing 3 resolution.",
  },
  {
    id: "fastener_reasoning_replacement_fastener_risk",
    category: "fastener_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Replacement Fastener Risk",
    rule_statement: "Fasteners are the highest-replacement-likelihood evidence class. Modern fasteners (Phillips screws, drywall screws, modern staples, modern brads) appearing on antique pieces commonly indicate repair or restoration introduction rather than original construction. The engine must distinguish original fasteners (carrying canonical dating evidence) from repair-introduced fasteners (carrying repair-era context but NOT original construction dating). Mixed original + replacement fasteners is the typical case in surviving antique pieces. Per the Replacement Fastener Risk canonical-source warning, hidden locations + untouched interior joints + underside fasteners + inaccessible hardware + consistency across the piece are the diagnostic anchors for distinguishing original from replacement.",
    rationale: "Per Fastener_Reference.docx Critical Evidence Warnings section: 'A single modern screw does NOT automatically modernize a piece. Always check: hidden locations + untouched interior joints + underside fasteners + inaccessible hardware + consistency across the piece.' Per pre-category FASTENERS ARE WEAKEST WHEN framework: isolated + clearly replaced + decorative only + attached during upholstery or restoration + inconsistent with surrounding construction. STRONGER than joinery's restoration_false_signals rule because fasteners ARE the most-replaced canonical evidence class per D-AP32-3 replacement-likelihood discipline. Per-entry replacement_likelihood field on FastenerTypeEntry (Block 34 authoring) calibrates this rule's application per fastener type. Cross-references Restoration Contamination rule (#4) for upholstery-assessment-specific cases.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["fastener_type", "fastener_subcategory"],
    cross_layer_scope: false,
    notes: "Per-entry replacement_likelihood field operationalizes this rule per fastener type per Block 34 authoring. AG entries on industrial-introduction-boundary fastener types (Phillips screws 1935+; Torx 1967+; Confirmat 1970+; Cam Lock 1960+; etc.) provide concrete temporal anchors. Pre-category WEAKEST WHEN framework cited per Surfacing 3 resolution.",
  },
  {
    id: "fastener_reasoning_rural_persistence",
    category: "fastener_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Rural Persistence",
    rule_statement: "Older fasteners persisted in regional production long after industrial alternatives existed elsewhere. Cut nails survived in rural production well into late 19th century. Slotted screws remained common decades after Phillips existed. Hand-forged nails persisted in frontier and rural areas. Hand-forged or cut nail evidence does NOT automatically establish pre-industrial dating; regional persistence patterns require corroborating evidence from form, wood, joinery, and maker context.",
    rationale: "Per Fastener_Reference.docx Critical Evidence Warnings Rural Persistence canonical-source section: 'Older fasteners often persisted regionally: cut nails survived in rural production well into late 19th century + slotted screws remained common decades after Phillips existed + hand-forged nails persisted in frontier/rural areas.' Parallel to joinery rural_persistence_warning rule (Block 30 D-JN30 rule #2). The rule governs engine reasoning to surface regional persistence context when hand-forged or cut nail evidence accumulates, preventing inappropriate dating-ceiling assertions.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["fastener_type", "fastener_subcategory"],
    cross_layer_scope: false,
    notes: "Cross-references joinery rural_persistence_warning (Block 30 D-JN30 rule #2); shared regional persistence framework applies across joinery and fastener evidence axes. Affects specifically fastener_subcategory_hand_forged_nails + fastener_subcategory_cut_nails + fastener_subcategory_machine_cut_screws (slotted) per regional persistence canonical examples.",
  },
  {
    id: "fastener_reasoning_restoration_contamination",
    category: "fastener_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Restoration Contamination",
    rule_statement: "Reupholstery and repair work commonly introduce modern fasteners that contaminate fastener-evidence dating signals on antique pieces. Common restoration-introduced fasteners include staples, Phillips screws, drywall screws, and modern brads. The engine must distinguish frame-assessment fastener evidence (where modern introduction indicates repair contamination of original construction dating) from upholstery-assessment fastener evidence (where modern introduction indicates the upholstery campaign date, which is itself the appropriate upholstery assessment output). Per the canonical dual-assessment architecture, restoration-introduced fasteners on upholstery do NOT contaminate frame assessment dating.",
    rationale: "Per Fastener_Reference.docx Critical Evidence Warnings Restoration Contamination canonical-source section: 'Reupholstery and repair work commonly introduce: staples + Phillips screws + drywall screws + modern brads. These should be treated cautiously unless originality is confirmed.' Cross-validated against FASTENER DATING QUICK-REFERENCE GRID 11-row lookup table (per Surfacing 4 resolution; Grid rows include 'Stapled upholstery: Usually post-1950' + 'Phillips screws: Post-1935' + 'KD connectors: Post-1960' + 'Torx fasteners: Post-1967' + 'Confirmat screws: Post-1970' canonical era anchors). Operationally DEFINES the dual-assessment architecture's value: reupholstery-era staples and Phillips screws are 'restoration contamination' for frame assessment but 'campaign evidence' for upholstery assessment. The rule prevents engine reasoning from incorrectly 'modernizing' a piece's frame dating because the upholstery was redone in 1980. Sub-pattern of Replacement Fastener Risk (Rule #2) with explicit dual-assessment-architecture operationalization per D-FA33-5.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["fastener_type", "fastener_subcategory"],
    cross_layer_scope: false,
    notes: "Particularly operative on Category 3 STAPLES (assessment_layer 'upholstery' subcategories 3A + 3B) and Category 2C Phillips-Head Screws (high replacement_likelihood). Dual-assessment routing per D-FA33-5 makes this rule operationalizable in engine reasoning. 11-row Quick-Reference Grid cited as cross-validation anchor per Surfacing 4 resolution.",
  },
  {
    id: "fastener_reasoning_fastener_evidence_layer_independence",
    category: "fastener_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Fastener Evidence Layer Independence",
    rule_statement: "Fastener evidence (fastener type, era-canonical class, replacement_likelihood, observed location) is evaluated independently from other evidence layers (wood, maker marks, form, construction logic, joinery, hardware, upholstery covers, upholstery construction). Fastener-axis findings must NOT be biased by upstream findings from other layers. The engine must not, for example, use a tentative form attribution to narrow fastener-type candidates, nor use observed location to PRE-FILTER fastener types (location HELPS identification but each layer evaluates from canonical evidence on its own axis). Each layer outputs independent evidence; cross-layer combination occurs at the report layer via dual-assessment output (frame + upholstery) with overlap-driven confidence.",
    rationale: "Per Block 22.5 D-PA-1 Independent Layer Evaluation Standard. Canonicalized for fasteners library per the pattern established by wood reasoning rule #7 (wood_evidence_layer_independence), maker reasoning rule #1 (core_maker_attribution_rule cross_layer_scope), and joinery reasoning rule #5 (joinery_evidence_layer_independence). The rule explicitly blocks dependency-wiring proposals that would create downstream-evidence-from-upstream-evidence inference biases on the fastener axis. Per D-FA33-6 (Mike clarification): location can help identify the fastener type but once identified the type's age is determined by canonical period_associations; location is NOT a per-evidence routing field. Operationally integrates with dual-assessment architecture (D-FA33-5) — fastener layer outputs are independent inputs to both frame and upholstery assessment confidence calculations.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["fastener_type", "fastener_subcategory", "fastener_category", "fastener_reasoning_rule"],
    cross_layer_scope: true,
    notes: "Fourth canonical-library encoding of Independent Layer Evaluation Standard (after wood, maker, joinery) per D-FA33-11. Cross-library convention reinforced: each evidence-library reasoning-rule set includes one layer-independence canonical artifact per ILE precedent. Operationally integrates with dual-assessment architecture (D-FA33-5).",
  },
];
