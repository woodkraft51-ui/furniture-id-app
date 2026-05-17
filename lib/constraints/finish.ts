/**
 * lib/constraints/finish.ts
 *
 * Canonical finish evidence library — surface-finish dating signals
 * (shellac crazing, polyurethane films, oil patina, refinished
 * surfaces). Includes natural finishes, synthetic finishes, and
 * alteration-evidence finishes.
 *
 * Created Block 0.5a (D-PH3HCL-S1-N) per Path A schema foundation.
 * Block 0.5a creates the empty library shell with locked interfaces;
 * Block 0.5b populates the categories + types from Mike's authored
 * content.
 *
 * Phase 2 reopening rationale: finish library identified as a real
 * Phase 2 gap during Block 0 HCL/evidence.ts orphan inspection. HCL
 * contained 2 finish keys (shellac_crazing, polyurethane); CWT
 * surfaced 3 additional keys (shellac_intact, oil_finish_patina,
 * refinished_surface). Block 0.5b authors all 5 as canonical type
 * entries.
 *
 * Note: is_alteration_evidence? is inherited from CanonicalEntry
 * (Block 0.5a Op B-1 promotion); no inline declaration needed.
 */

import type {
  CanonicalEntry,
  PeriodAssociation,
  PhysicalLocation,
  PositionOnPiece,
  AntiClassificationGuidance,
  ReasoningRuleMigrationTarget,
} from "./entryShape";

export interface FinishCategoryEntry extends CanonicalEntry {
  category: "finish_category";
  name: string;
  description: string;
  date_range_summary: string;
  category_kind: "natural_finish" | "synthetic_finish" | "alteration_finish";
}

export interface FinishTypeEntry extends CanonicalEntry {
  category: "finish_type";
  name: string;
  parent_category_id: string;
  description: string;
  unique_traits: string[];
  identifying_characteristics: string[];
  period_associations: PeriodAssociation[];
  date_range_summary: string;
  common_observed_locations?: PhysicalLocation[];
  position_on_piece?: PositionOnPiece[];
  anti_classification_guidance?: AntiClassificationGuidance | AntiClassificationGuidance[];
  replacement_likelihood: "low" | "medium" | "high";
  finish_chemistry?: "shellac" | "polyurethane" | "lacquer" | "varnish" | "oil" | "wax" | "milk_paint" | "other";
  regional_persistence_notes?: string;
  related_finish_types?: string[];
  assessment_layer: "frame";

  /**
   * Block 22 schema extension (parallel to Blocks 17/19/20/21/22 pattern).
   * Engine surfaces this field via getCanonicalCautionText when a finish
   * clue fires. The shared CanonicalEntry.caution_text field is NOT
   * engine-read; diagnostic warning text intended for user-facing
   * surfacing must live here.
   */
  diagnostic_caution_text?: string;
}

export interface FinishReasoningRule extends CanonicalEntry {
  category: "finish_reasoning_rule";
  rule_name: string;
  rule_statement: string;
  rationale: string;
  migration_target: ReasoningRuleMigrationTarget;
  applies_to_entry_types?: string[];
  cross_layer_scope?: boolean;
}

export const FINISH_ASSESSMENT_LAYER = "frame" as const;

export const FINISH_CATEGORIES: FinishCategoryEntry[] = [
  {
    id: "finish_category_natural_finish",
    category: "finish_category",
    positive_authority: 6,
    hard_negative_authority: 6,
    indicator_text: "Natural finishes are evidence of traditional surface treatment using shellac, oil, wax, resin, milk paint, or related pre-synthetic finishing systems. They can support an antique or hand-finished interpretation, but they are not reliable standalone date anchors because many natural finishes remained in use through restoration, craft, and reproduction work.",
    name: "Natural finishes",
    description: "This category includes traditional and naturally derived finish systems such as shellac, oil, wax, spirit varnish, resin varnish, milk paint, and related hand-applied finishes. These finishes often build, color, seal, or mellow a surface in ways that interact with age, wear, oxidation, dirt accumulation, and patina. They are most useful when the finish appears integrated with age-consistent surface wear and original construction.",
    date_range_summary: "Broadly spans early American furniture through the present; strongest as original-finish evidence when paired with age-consistent wear, oxidation, construction, tool marks, fasteners, and joinery.",
    category_kind: "natural_finish",
  },
  {
    id: "finish_category_synthetic_finish",
    category: "finish_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Synthetic finishes are modern or industrial coating evidence, usually associated with later manufacture, factory finishing, or later refinishing. They are stronger as hard-negative evidence against early original-surface claims than as proof of the furniture's original construction date.",
    name: "Synthetic finishes",
    description: "This category includes modern or industrial finish systems such as polyurethane, polyester, catalyzed lacquer, modern varnishes, acrylics, conversion varnish, and other plastic-like or high-durability coatings. These finishes often produce harder, thicker, more uniform, more moisture-resistant, or more plastic-like surface films than traditional shellac, oil, wax, or early varnish systems.",
    date_range_summary: "Broadly post-1900 by chemistry, with polyurethane and plastic-like furniture coatings especially strong as post-mid-20th-century finish or alteration signals.",
    category_kind: "synthetic_finish",
  },
  {
    id: "finish_category_alteration_finish",
    category: "finish_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Alteration finishes indicate that the visible surface no longer represents the original finishing campaign. Strip-and-refinish evidence, overcoating, sanding loss, modern topcoats, or finish inconsistency should reduce confidence in original-surface dating.",
    name: "Alteration finishes",
    description: "This category includes evidence of refinishing campaigns, stripped surfaces, aggressive sanding, chemical finish removal, over-varnishing, modern topcoats, mismatched finish layers, finish trapped in recesses, finish loss around hardware, and surface work inconsistent with original wear patterns. These features are used to identify later surface intervention rather than the original manufacture date.",
    date_range_summary: "Spans all eras as alteration evidence; dates the surface intervention, not necessarily the furniture frame, form, or original construction.",
    category_kind: "alteration_finish",
  },
];
export const FINISH_TYPES: FinishTypeEntry[] = [
  {
    id: "finish_type_shellac_crazing",
    category: "finish_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Fine shellac crazing on an age-consistent surface supports an older natural-finish interpretation, especially on 19th- to early-20th-century furniture, but it should be verified against wear, oxidation, construction, and signs of later overcoating.",
    notes: "Per HCL migration (D-PH3HCL-S2-N). HCL evidence_category finish.",
    name: "Shellac crazing",
    parent_category_id: "finish_category_natural_finish",
    description: "Shellac crazing is a fine cracking, checking, or alligator-like network that develops as a shellac film ages, shrinks, dries, oxidizes, or responds to heat, moisture, alcohol exposure, and surface movement. On furniture, shellac crazing can be a useful preservation and age signal when it is integrated into natural wear patterns and appears on surfaces likely to retain the original finish.",
    unique_traits: [
      "Fine cracking, checking, or crazed network within the finish film rather than deep structural cracks in the wood.",
      "Warm amber, orange, brown, or mellowed translucent finish tone often associated with aged shellac.",
      "Can appear as small islands, spiderweb cracking, dulling, bloom, flaking, or localized finish separation.",
      "Often remains heavier in protected areas and more worn on handling edges, tops, feet, and contact points.",
      "May react differently from oil, wax, lacquer, or polyurethane when viewed through sheen, film thickness, wear, and repair behavior.",
    ],
    identifying_characteristics: [
      "Look for age-consistent crazing across original finished surfaces, especially tops, drawer fronts, case sides, rails, stiles, and protected interior edges.",
      "Check whether the crazing crosses hardware shadows, repair lines, replacement parts, or later sanding patterns.",
      "Strongest when paired with patina, oxidation, hand-tool evidence, early fasteners, and original wear around pulls, edges, feet, and high-contact zones.",
      "Weakens if crazing appears artificially uniform, sits above modern stain, lies over stripped wood, or is trapped beneath a later glossy topcoat.",
      "Differentiate shellac crazing from lacquer checking, varnish alligatoring, heat damage, water damage, intentional distressing, and finish contamination.",
    ],
    period_associations: [
      { period_label: "Shellac-era original finishes", date_floor: 1800, date_ceiling: 1920 },
      { period_label: "Traditional, repair, restoration, and craft shellac use", date_floor: 1920, date_ceiling: 2030 },
    ],
    date_range_summary: "strongest 1800–1920 as original-finish evidence; possible later in restoration or craft use",
    position_on_piece: [
      { physical_location: "case_panel", physical_location_notes: "case front panel" },
      { physical_location: "drawer_front", physical_location_notes: "drawer front" },
      { physical_location: "show_surface", physical_location_notes: "table top" },
      { physical_location: "case_panel", physical_location_notes: "case side panel" },
      { physical_location: "frame_rail", physical_location_notes: "rail" },
      { physical_location: "frame_stile", physical_location_notes: "stile" },
      { physical_location: "edge_or_corner_protection", physical_location_notes: "protected edge" },
    ],
    diagnostic_caution_text: "Do not classify all checked or cracked finishes as shellac crazing. Lacquer checking, aged varnish, heat damage, water damage, artificial distressing, or crazing beneath a later clear coat can mimic shellac aging. Confirm with finish behavior, surface context, and construction evidence.",
    replacement_likelihood: "medium",
    original_persistence: "low",
    finish_chemistry: "shellac",
    is_alteration_evidence: false,
    regional_persistence_notes: "Shellac use varied by maker, region, cost, availability, and finish quality. It remained available after the early 20th century for repair, French polishing, restoration, and craft work, so shellac alone should not be used as a narrow date anchor.",
    related_finish_types: [
      "finish_type_shellac_intact",
      "finish_type_oil_finish_patina",
      "finish_type_refinished_surface",
    ],
    assessment_layer: "frame",
  },
  {
    id: "finish_type_polyurethane",
    category: "finish_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Polyurethane is a strong modern finish or refinishing signal. On a claimed pre-1960 piece, polyurethane should usually be treated as hard-negative evidence for original surface, while still allowing that the underlying furniture may be older.",
    notes: "Per HCL migration (D-PH3HCL-S2-N). HCL evidence_category finish. Hard-negative for pre-1960 claims.",
    name: "Polyurethane finish",
    parent_category_id: "finish_category_synthetic_finish",
    description: "Polyurethane finish is a modern synthetic polymer coating that creates a hard, durable, moisture-resistant film over the wood. On antique furniture, it most often indicates a later refinishing campaign or modern protective overcoat rather than an original period surface. It can obscure patina, fill pores, round over surface evidence, and reduce the diagnostic value of visible finish age.",
    unique_traits: [
      "Hard, plastic-like film with a durable surface that often feels sealed above the wood rather than absorbed into it.",
      "Can produce a thick, glossy, ambered, glassy, or slightly artificial surface appearance.",
      "Often bridges pores, tool marks, scratches, dents, and open grain rather than wearing into them naturally.",
      "May show drips, pooled finish, brush marks, heavy edge build-up, or modern clear-coat layering.",
      "Frequently resists the mellow, worn, oxidized surface transition expected in older shellac, oil, or wax finishes.",
    ],
    identifying_characteristics: [
      "Look for thick clear film over worn wood, filled pores, glossy plastic sheen, or finish pooling around carvings, hardware, joints, and inside corners.",
      "Check whether wear appears trapped beneath the coating, which suggests the polyurethane was applied after age or damage had already occurred.",
      "Strong hard-negative for original finish claims on pre-1960 furniture unless documented as a later restoration coating.",
      "If polyurethane appears only on one board or one area, evaluate whether the part was repaired, replaced, or locally overcoated.",
      "Differentiate from lacquer, varnish, shellac, and wax by film thickness, plastic-like build, durability, surface feel, and lack of traditional wear behavior.",
    ],
    period_associations: [
      { period_label: "Synthetic polymer finish era", date_floor: 1960, date_ceiling: 2030 },
    ],
    date_range_summary: "post-1960",
    position_on_piece: [
      { physical_location: "show_surface", physical_location_notes: "table top" },
      { physical_location: "show_surface", physical_location_notes: "desk writing surface" },
      { physical_location: "case_panel", physical_location_notes: "case front panel" },
      { physical_location: "drawer_front", physical_location_notes: "drawer front" },
      { physical_location: "frame_rail", physical_location_notes: "chair arm member" },
      { physical_location: "show_surface", physical_location_notes: "high-wear use surface" },
      { physical_location: "show_surface", physical_location_notes: "refinished show surface" },
    ],
    diagnostic_caution_text: "Polyurethane on a claimed pre-1960 piece is hard-negative evidence against an original period finish, but it is not automatic proof that the frame, form, or construction is post-1960. Treat it as a surface-alteration signal unless the entire construction also supports modern manufacture.",
    replacement_likelihood: "low",
    original_persistence: "high",
    finish_chemistry: "polyurethane",
    is_alteration_evidence: false,
    regional_persistence_notes: "Polyurethane became common as a durable modern finish and later refinishing material. Its presence on older furniture is usually a refinishing or overcoating signal rather than regional production evidence.",
    related_finish_types: [
      "finish_type_refinished_surface",
    ],
    assessment_layer: "frame",
  },
  {
    id: "finish_type_shellac_intact",
    category: "finish_type",
    positive_authority: 6,
    hard_negative_authority: 6,
    indicator_text: "Intact shellac on an age-consistent surface supports preservation of a traditional finish, especially on 19th- to early-20th-century furniture, but it must be separated from later shellac restoration or overcoating.",
    notes: "Per CWT migration (D-PH3HCL-S2-N). CWT-only key (not in HCL); finish.ts new entry.",
    name: "Shellac intact",
    parent_category_id: "finish_category_natural_finish",
    description: "Intact shellac refers to a shellac finish that appears preserved rather than crazed, stripped, heavily overcoated, or aggressively refinished. It may show warm translucence, depth, mellow ambering, and age-consistent wear while still retaining the original or early finish layer. This evidence is most valuable when wear, oxidation, hardware shadows, and construction all support an original or early surface.",
    unique_traits: [
      "Warm translucent film with mellow amber, orange, brown, or honey-toned surface depth.",
      "Finish may show gentle wear, dulling, minor checking, or oxidation without full strip-and-refinish disruption.",
      "Often retains darker finish in protected recesses and softer wear on edges, feet, pulls, arms, and use surfaces.",
      "Usually appears visually integrated with patina rather than sitting as a new clear layer above the surface.",
      "May show French polish character, pad marks, or hand-applied finish variation in higher-quality examples.",
    ],
    identifying_characteristics: [
      "Look for consistent finish continuity around hardware, moldings, carvings, drawer fronts, feet, case sides, and protected edges.",
      "Check for original dirt lines, oxidation transitions, and wear patterns that pass logically through the finish rather than sitting below a later topcoat.",
      "Strongest when the surface retains old finish in protected areas and shows natural thinning at handling points.",
      "Weakens if the surface is too uniform, too glossy, heavily sanded, stained over, or sealed under modern varnish or polyurethane.",
      "Differentiate intact shellac from modern amber lacquer, tinted varnish, wax buildup, and later shellac restoration.",
    ],
    period_associations: [
      { period_label: "Shellac-era original finishes (intact preservation)", date_floor: 1800, date_ceiling: 1920 },
      { period_label: "Traditional shellac restoration and craft use", date_floor: 1920, date_ceiling: 2030 },
    ],
    date_range_summary: "strongest 1800–1920 as original or early preserved finish; possible later as restoration or craft finish",
    position_on_piece: [
      { physical_location: "drawer_front", physical_location_notes: "drawer front" },
      { physical_location: "case_panel", physical_location_notes: "case front panel" },
      { physical_location: "case_panel", physical_location_notes: "case side panel" },
      { physical_location: "show_surface", physical_location_notes: "table top" },
      { physical_location: "trim_or_molding", physical_location_notes: "protected molding detail" },
      { physical_location: "trim_or_molding", physical_location_notes: "carved detail surface" },
      { physical_location: "show_surface", physical_location_notes: "hardware shadow on show surface" },
    ],
    diagnostic_caution_text: "Do not treat every amber or glossy surface as intact shellac. Later amber lacquer, tinted varnish, polyurethane over stain, wax buildup, and restoration shellac can imitate old shellac. Confirm with wear integration, finish continuity, and construction context.",
    replacement_likelihood: "medium",
    original_persistence: "low",
    finish_chemistry: "shellac",
    is_alteration_evidence: false,
    regional_persistence_notes: "Shellac remained in use for repair, French polishing, conservation, and craft work after its peak period. Intact shellac is strongest as evidence when the surface has uninterrupted age patterns rather than simply a shellac-like appearance.",
    related_finish_types: [
      "finish_type_shellac_crazing",
      "finish_type_oil_finish_patina",
      "finish_type_refinished_surface",
    ],
    assessment_layer: "frame",
  },
  {
    id: "finish_type_oil_finish_patina",
    category: "finish_type",
    positive_authority: 6,
    hard_negative_authority: 6,
    indicator_text: "Oil finish patina supports a hand-rubbed, traditional, craft, or maintained surface reading, but it is a broad all-era signal and should not be treated as a tight date marker by itself.",
    notes: "Per CWT migration (D-PH3HCL-S2-N). CWT-only key.",
    name: "Oil finish patina",
    parent_category_id: "finish_category_natural_finish",
    description: "Oil finish patina refers to the mellowed surface character created by oil-based finishing, repeated oil maintenance, hand use, oxidation, grime, and age-darkening. Oil finishes tend to sit closer to the wood and usually show less thick film build than shellac, varnish, lacquer, or polyurethane. This evidence can help identify traditional or maintained surfaces but is not specific enough to date a piece without supporting construction evidence.",
    unique_traits: [
      "Low-build or in-the-wood appearance rather than a thick film coating.",
      "Soft, mellow, hand-rubbed sheen with open grain often still visible and tactile.",
      "Patina may darken in pores, recesses, end grain, carvings, and areas handled repeatedly over time.",
      "Wear often appears gradual and absorbed rather than chipped, flaked, or separated as a film.",
      "Can be renewed many times, making it difficult to distinguish original finish from later maintenance.",
    ],
    identifying_characteristics: [
      "Look for mellow low-sheen surface, open grain, accumulated darkening, and hand-worn areas around edges, pulls, arms, tops, and feet.",
      "Check whether the surface has absorbed oil unevenly into end grain, old scratches, dents, pores, and worn areas.",
      "Strongest when paired with age-consistent wear, oxidation, hand-tool evidence, and older construction features.",
      "Weak as a date signal if the surface appears recently oiled, uniformly refreshed, wet-looking, or applied over stripped wood.",
      "Differentiate from wax, shellac, varnish, lacquer, and polyurethane by the lack of thick surface film and the way wear blends into the wood.",
    ],
    period_associations: [
      { period_label: "Oil-finish era (broad)", date_floor: 1620, date_ceiling: 2030 },
    ],
    date_range_summary: "broad all-era finish and maintenance signal; not a tight dating signal alone",
    position_on_piece: [
      { physical_location: "show_surface", physical_location_notes: "table top" },
      { physical_location: "frame_rail", physical_location_notes: "chair arm member" },
      { physical_location: "frame_rail", physical_location_notes: "seat frame" },
      { physical_location: "drawer_front", physical_location_notes: "drawer front" },
      { physical_location: "case_panel", physical_location_notes: "case side panel" },
      { physical_location: "trim_or_molding", physical_location_notes: "carved detail surface" },
      { physical_location: "edge_or_corner_protection", physical_location_notes: "high-contact edge" },
    ],
    diagnostic_caution_text: "Do not treat oil patina alone as proof of age. Modern oiling, restoration oil, Danish oil, tung oil blends, and recently refreshed surfaces can mimic older mellowed patina. Use construction, wear depth, oxidation, and finish continuity to decide whether the oil surface is original, maintained, or newly applied.",
    replacement_likelihood: "high",
    original_persistence: "low",
    finish_chemistry: "oil",
    is_alteration_evidence: false,
    regional_persistence_notes: "Oil finishes and oil maintenance occur across nearly all periods, regions, and quality levels. They are common in vernacular, shop-made, craft, rustic, and restored furniture, so they should be interpreted as surface-condition evidence rather than a firm period marker.",
    related_finish_types: [
      "finish_type_shellac_intact",
      "finish_type_shellac_crazing",
      "finish_type_refinished_surface",
    ],
    assessment_layer: "frame",
  },
  {
    id: "finish_type_refinished_surface",
    category: "finish_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "A refinished surface is strong alteration evidence. It means the visible finish should not be used as original-surface dating proof, though the underlying frame, form, joinery, and materials may still be older.",
    notes: "Per CWT migration (D-PH3HCL-S2-N). CWT-only key. Alteration evidence — indicates the surface has been stripped and refinished post-original.",
    name: "Refinished surface",
    parent_category_id: "finish_category_alteration_finish",
    description: "A refinished surface shows evidence that the original or earlier finish was stripped, sanded, chemically removed, overcoated, restained, or replaced by a later finishing campaign. This may include finish loss in protected recesses, sanding through patina, rounded edges, modern stain, color sitting in scratches, finish trapped in carvings, mismatched surface age, or modern clear coats over older wear. Refinish evidence dates the surface intervention, not the furniture's original manufacture.",
    unique_traits: [
      "Surface appears cleaner, brighter, flatter, glossier, or more uniform than the construction age would normally suggest.",
      "Patina, oxidation, dirt lines, hardware shadows, or old finish may be missing, interrupted, or trapped under a newer coating.",
      "Edges, carvings, moldings, corners, and drawer lips may be softened, rounded, or abraded from sanding or stripping.",
      "Color may be inconsistent, muddy, blotchy, overly even, or visibly newer than protected interior surfaces.",
      "Modern stain, polyurethane, lacquer, varnish, or oil may sit over dents, scratches, worming, wear, or earlier damage.",
    ],
    identifying_characteristics: [
      "Look for sanding scratches across grain, rounded edges, stripped carvings, finish residue in recesses, and missing dark buildup around pulls or moldings.",
      "Compare exposed surfaces with protected interiors, drawer sides, undersides, backs, hardware shadows, and unfinished secondary areas.",
      "Check whether wear is under the finish rather than through the finish, which often indicates later overcoating.",
      "Strongest when the finish chemistry, sheen, color, or surface texture conflicts with the claimed age or construction period.",
      "Do not let a refinished surface override earlier construction evidence; separate surface date from frame date.",
    ],
    period_associations: [
      { period_label: "Surface alteration or refinishing evidence", date_floor: 1620, date_ceiling: 2030 },
    ],
    date_range_summary: "spans all eras as alteration evidence; dates the surface intervention rather than the furniture frame",
    position_on_piece: [
      { physical_location: "show_surface", physical_location_notes: "table top" },
      { physical_location: "show_surface", physical_location_notes: "desk writing surface" },
      { physical_location: "drawer_front", physical_location_notes: "drawer front" },
      { physical_location: "case_panel", physical_location_notes: "case front panel" },
      { physical_location: "case_panel", physical_location_notes: "case side panel" },
      { physical_location: "trim_or_molding", physical_location_notes: "carved detail surface" },
      { physical_location: "show_surface", physical_location_notes: "hardware shadow on show surface" },
      { physical_location: "edge_or_corner_protection", physical_location_notes: "edge surface" },
      { physical_location: "foot_or_leg", physical_location_notes: "foot" },
    ],
    diagnostic_caution_text: "Do not classify a well-preserved original finish as refinished merely because it is clean or glossy. Refinish classification should require evidence of interrupted patina, sanding, stripping, modern coating, inconsistent wear, finish trapped in recesses, or mismatch between exposed and protected surfaces.",
    replacement_likelihood: "high",
    finish_chemistry: "other",
    is_alteration_evidence: true,
    regional_persistence_notes: "Refinishing is not region-specific. It is common across antiques, estate furniture, dealer-prepared pieces, restored family furniture, and modern resale preparation. Interpret it as a condition and originality factor rather than a regional production marker.",
    related_finish_types: [
      "finish_type_polyurethane",
      "finish_type_shellac_crazing",
      "finish_type_shellac_intact",
      "finish_type_oil_finish_patina",
    ],
    assessment_layer: "frame",
  },
];
export const FINISH_REASONING_RULES: FinishReasoningRule[] = [];
