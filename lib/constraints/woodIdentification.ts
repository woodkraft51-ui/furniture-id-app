/**
 * Canonical wood identification library for Proof Sleuth.
 *
 * Purpose: period-agnostic reference for wood identification — natural species,
 * engineered substrates, and cut/grain phenomena. Identification fields describe
 * what a wood is and how to recognize it visually and structurally, without
 * encoding period or regional production patterns. The paired evidence library
 * (woodEvidence.ts, deferred to Block 22) carries period- and region-relevant
 * patterns that condition engine reasoning at the appraisal layer.
 *
 * This separation applies the form-vs-style architectural principle to the wood
 * domain: identification (this file) captures stable visual/structural traits;
 * evidence (woodEvidence.ts) captures historically-conditioned patterns that
 * change with period, region, and manufacturing context. The same principle
 * separates forms.ts from style and weighting libraries elsewhere in the
 * constraint library.
 *
 * Four arrays exported from this file:
 * - WOOD_CATEGORIES: top-level taxonomy (ordinal-numbered, parallel to
 *   construction logic). Provides the I/II/III/IV taxonomic frame.
 * - NATURAL_WOOD_SPECIES: species-level entries with optional nested
 *   subspecies (WoodSubspecies, mirrors FormSubtype nested pattern).
 * - ENGINEERED_SUBSTRATES: plywood, particleboard, MDF, hardboard, composite
 *   cores, veneer substrates. Carry structured introduction_anchor for
 *   technology-curve dating logic.
 * - CUT_GRAIN_PHENOMENA: cut-orientation, natural-figure, ray-cellular,
 *   veneer-slicing, and optical-effect phenomena with applicable_species FK
 *   references.
 *
 * Cross-references:
 * - entryShape.ts: base CanonicalEntry interface and shared
 *   AntiClassificationGuidance interface (relocated from forms.ts in Block 16).
 * - woodEvidence.ts (deferred to Block 22): paired evidence library; this file
 *   provides identification anchors that evidence entries reference via FK.
 */

import { CanonicalEntry, AntiClassificationGuidance } from "./entryShape";

/**
 * Top-level wood taxonomy entry. Ordinal-numbered (I-IV) parallel to
 * construction logic. Categories group natural species by macroscopic
 * structural/anatomical type (ring-porous, diffuse-porous, softwood, etc.).
 * Engineered substrates do not belong to a WoodCategoryEntry — they live in
 * ENGINEERED_SUBSTRATES under their own taxonomic axis.
 */
export interface WoodCategoryEntry extends CanonicalEntry {
  category: "wood_category";

  /**
   * Ordinal label for the category (parallels construction logic ordinals).
   */
  ordinal: "I" | "II" | "III" | "IV";

  /**
   * Display name for the category (e.g., "Ring-Porous Hardwoods",
   * "Diffuse-Porous Hardwoods", "Softwoods").
   */
  name: string;

  /**
   * Description of what defines this category — anatomical and structural
   * traits shared across all species within it.
   */
  description: string;

  /**
   * Traits shared by species within this category. Used for engine reasoning
   * when evidence supports category-level identification but not yet
   * species-level identification.
   */
  shared_identifying_traits: string[];

  /**
   * Primary diagnostic indicators visible to an appraiser examining a piece.
   * Used for engine reasoning and for narrative composition when category
   * identification is the appropriate confidence level.
   */
  primary_diagnostic_indicators: string[];

  /**
   * Free-form descriptions of this category's relationship to closely-related
   * categories that share diagnostic overlap. Each entry is a complete
   * contrastive statement comparing this category to a cousin category. Used
   * for engine reasoning when differentiating between cousin categories (e.g.,
   * ring-porous vs diffuse-porous hardwoods at the most-confused boundary).
   * Mirrors cousin_form_contrasts on FormEntry and cousin_phenomenon_contrasts
   * on CutGrainPhenomenonEntry. Added in Block 17 to close the Block 16
   * design gap.
   */
  cousin_category_contrasts?: string[];
}

/**
 * Subspecies of a natural wood species. Per appraiser definition: "same
 * species-level identity, distinguishable variant." Subspecies are nested
 * within WoodSpeciesEntry rather than being top-level entries, mirroring the
 * FormSubtype pattern in forms.ts. Subspecies-level evidence (period,
 * regional) is captured in woodEvidence.ts via optional subspecies_id field
 * on species evidence entries.
 */
export interface WoodSubspecies {
  /**
   * Identifier within the parent species. Format: subspecies_<descriptor>.
   */
  id: string;

  /**
   * Display name (e.g., "American White Oak", "European White Oak").
   */
  name: string;

  /**
   * Description of what defines this subspecies — structural, anatomical, or
   * provenance traits that distinguish it from its parent species and sibling
   * subspecies.
   */
  description: string;

  /**
   * Traits unique to this subspecies that differentiate it from its parent
   * species and sibling subspecies.
   */
  unique_traits: string[];

  /**
   * Identifying elements an appraiser would examine to confirm subspecies
   * identification.
   */
  identifying_elements: string[];

  /**
   * Optional cut-specific identifier text. Each entry references a
   * CutGrainPhenomenonEntry by id and provides subspecies-specific
   * identifier text describing how the cut/grain phenomenon expresses on
   * this subspecies.
   */
  cut_specific_identifiers?: { cut_phenomenon_id: string; identifiers: string[] }[];
}

/**
 * Natural wood species entry. Species-level identification analog to
 * FormEntry. Belongs to exactly one WoodCategoryEntry via wood_category_id
 * FK. Optional subspecies array uses the WoodSubspecies nested pattern.
 */
export interface WoodSpeciesEntry extends CanonicalEntry {
  category: "wood_species";

  /**
   * Display name for the species (e.g., "white oak", "black walnut", "eastern
   * white pine"). Lowercased per existing canonical convention; proper nouns
   * preserved.
   */
  name: string;

  /**
   * Free-form list of names this species is commonly called in retail,
   * casual, or regional usage. Format mirrors common_aliases on FormEntry.
   */
  common_aliases?: string[];

  /**
   * Scientific binomial name (e.g., "Quercus alba", "Juglans nigra"). Optional
   * because some entries capture genus-level identification where species-level
   * resolution is not diagnostically necessary.
   */
  scientific_name?: string;

  /**
   * Reference to the WoodCategoryEntry this species belongs to.
   */
  wood_category_id: string;

  /**
   * Description of the species — anatomical, structural, and visual
   * characteristics.
   */
  description: string;

  /**
   * Traits unique to this species that differentiate it from cousin species
   * within and across categories.
   */
  unique_traits: string[];

  /**
   * Identifying elements an appraiser would examine to confirm species
   * identification (pore patterns, ray expression, color, weight, hardness,
   * etc.).
   */
  identifying_elements: string[];

  /**
   * Optional cut-specific identifier text. Each entry references a
   * CutGrainPhenomenonEntry by id and provides species-specific identifier
   * text describing how the cut/grain phenomenon expresses on this species.
   */
  cut_specific_identifiers?: { cut_phenomenon_id: string; identifiers: string[] }[];

  /**
   * Optional subspecies array. See WoodSubspecies interface for shape.
   */
  subspecies?: WoodSubspecies[];

  /**
   * Structural role this species typically plays in furniture construction.
   * Engine reasoning uses this to apply the "visible wood ≠ structural wood;
   * secondary woods often more diagnostic" meta-rule (Block 16 D-WI7).
   */
  typical_structural_role:
    | "primary_show"
    | "primary_secondary"
    | "either"
    | "veneer_only"
    | "substrate_only";

  /**
   * Optional anti-back-classification guidance. Species with crisp date
   * boundaries (e.g., furniture-use extinction, regulatory cessation) use this
   * structured field; species with continuous use without crisp boundaries
   * leave it unset and continue using narrative guidance in evidence entries.
   * Single-boundary species use the object form; multi-boundary species use
   * the array form.
   */
  anti_classification_guidance?: AntiClassificationGuidance | AntiClassificationGuidance[];
}

/**
 * Engineered substrate entry. Includes plywood, particleboard, MDF, hardboard,
 * composite cores, and veneer substrates. Distinct from natural species
 * because dating is technology-introduction-curve shaped rather than
 * production-envelope shaped — substrates carry structured introduction_anchor
 * rather than relying on date_floor/date_ceiling alone.
 */
export interface EngineeredSubstrateEntry extends CanonicalEntry {
  category: "engineered_substrate";

  /**
   * Display name for the substrate (e.g., "plywood", "particleboard", "MDF",
   * "hardboard", "lumber-core plywood").
   */
  name: string;

  /**
   * Free-form list of names this substrate is commonly called in retail,
   * casual, or trade usage.
   */
  common_aliases?: string[];

  /**
   * Description of the substrate — composition, manufacturing process, and
   * visual/structural characteristics.
   */
  description: string;

  /**
   * Traits unique to this substrate that differentiate it from cousin
   * substrates and from natural species.
   */
  unique_traits: string[];

  /**
   * Identifying elements an appraiser would examine to confirm substrate
   * identification (edge profile, surface texture, layer/particle visibility,
   * etc.).
   */
  identifying_elements: string[];

  /**
   * Composition type categorizes the substrate's manufacturing approach.
   * laminated_plies: plywood and lumber-core plywood. compressed_fiber: MDF,
   * hardboard, fiberboard. composite_particle: particleboard, OSB.
   * composite_other: other engineered composites not fitting the above.
   */
  composition_type:
    | "laminated_plies"
    | "compressed_fiber"
    | "composite_particle"
    | "composite_other";

  /**
   * Structural role this substrate typically plays in furniture construction.
   * substrate_only: never appears as show surface. either: may appear show or
   * substrate depending on application. veneer_substrate: serves as substrate
   * for veneer overlay.
   */
  typical_structural_role: "substrate_only" | "either" | "veneer_substrate";

  /**
   * Technology-introduction anchor capturing the adoption-curve dating
   * envelope for this substrate. Distinct from production-envelope dating
   * (which is what date_floor/date_ceiling on the inherited CanonicalEntry
   * captures) because substrate introduction is a step-change event followed
   * by an adoption curve rather than a continuous production tradition.
   *
   * earliest_plausible_year: earliest year this substrate could conceivably
   * appear in furniture (often well before mass-market adoption).
   * widespread_adoption_year: year this substrate became common in furniture
   * production (the practical engine-filter threshold).
   * dominance_year: optional; year this substrate became the dominant
   * approach for its niche (e.g., MDF dominance in mass-market case
   * furniture).
   * confidence_notes: optional appraiser-voice prose explaining
   * uncertainty in the anchor years.
   */
  introduction_anchor: {
    earliest_plausible_year: number;
    widespread_adoption_year: number;
    dominance_year?: number;
    confidence_notes?: string;
  };

  /**
   * Optional anti-back-classification guidance. Substrates with crisp
   * introduction boundaries use this field to encode appraiser-voice
   * reasoning chains (parallel to forms with crisp form_emergence
   * boundaries). The structured introduction_anchor field above carries the
   * engine-filter logic; this field carries the narrative guidance.
   */
  anti_classification_guidance?: AntiClassificationGuidance | AntiClassificationGuidance[];
}

/**
 * Cut/grain phenomenon entry. Covers cut-orientation phenomena (quartersawn,
 * riftsawn, plainsawn), natural-figure phenomena (curly, birdseye, burl),
 * ray-cellular phenomena (medullary ray flake), veneer-slicing phenomena
 * (rotary cut, half-round, flat cut), and optical effects (chatoyance, depth
 * shimmer). Each phenomenon carries one-way applicable_species FK references
 * documenting which species characteristically express the phenomenon.
 */
export interface CutGrainPhenomenonEntry extends CanonicalEntry {
  category: "cut_grain_phenomenon";

  /**
   * Display name for the phenomenon (e.g., "quartersawn", "birdseye figure",
   * "medullary ray flake", "rotary-cut veneer", "chatoyance").
   */
  name: string;

  /**
   * Free-form list of names this phenomenon is commonly called in trade or
   * casual usage.
   */
  common_aliases?: string[];

  /**
   * Phenomenon type categorizes how the visual pattern is produced.
   * cut_orientation: pattern arises from the relationship between cut plane
   * and growth-ring orientation. natural_figure: pattern arises from
   * irregular growth (curly, birdseye, burl). ray_cellular: pattern arises
   * from medullary ray cellular structure. veneer_slicing: pattern arises
   * from veneer slicing technique. optical_effect: pattern is an optical
   * phenomenon (chatoyance, depth shimmer) rather than structural pattern.
   */
  phenomenon_type:
    | "cut_orientation"
    | "natural_figure"
    | "ray_cellular"
    | "veneer_slicing"
    | "optical_effect";

  /**
   * Description of the phenomenon — what produces it, how it appears.
   */
  description: string;

  /**
   * Traits unique to this phenomenon that differentiate it from cousin
   * phenomena.
   */
  unique_traits: string[];

  /**
   * Identifying elements an appraiser would examine to confirm the
   * phenomenon's presence and authenticity.
   */
  identifying_elements: string[];

  /**
   * Species in which this phenomenon characteristically expresses. One-way
   * reference (phenomenon → species); the inverse is captured via
   * cut_specific_identifiers on WoodSpeciesEntry and WoodSubspecies. The
   * optional characteristic_expression field carries species-specific text
   * describing how the phenomenon expresses on that species.
   */
  applicable_species: { species_id: string; characteristic_expression?: string }[];

  /**
   * Free-form descriptions of this phenomenon's relationship to closely
   * related phenomena. Mirrors cousin_form_contrasts pattern from FormEntry.
   */
  cousin_phenomenon_contrasts?: string[];
}

export const WOOD_CATEGORIES: WoodCategoryEntry[] = [
  {
    id: "wood_category_ring_porous_hardwoods",
    category: "wood_category",
    ordinal: "I",
    name: "Ring-Porous Hardwoods",
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "Hardwood species whose annual growth rings contain large earlywood pores followed by denser latewood, creating highly visible grain structure, strong ring contrast, and pronounced texture. Among the most diagnostically useful woods because pore structure remains visible even beneath finish and oxidation. Dominate early American, Victorian, Golden Oak (1875-1915), and Arts & Crafts (1895-1925) production. Frequently used structurally rather than merely decoratively.",
    shared_identifying_traits: [
      "Large visible pores",
      "Strong annual ring contrast",
      "Prominent grain texture",
      "High structural strength",
      "Excellent durability",
      "Strong ray structure in some species",
      "Coarse texture commonly",
      "Frequent dramatic darkening with age",
      "Commonly used structurally, not merely decoratively",
    ],
    primary_diagnostic_indicators: [
      "Large open grain",
      "Distinct earlywood/latewood transition",
      "Visible cathedral grain in flat-sawn cuts",
      "Pronounced ray fleck in quarter-sawn cuts",
      "Heavy tactile texture",
      "Deep pore absorption of stain",
      "Visible end-grain pore bands",
    ],
    cousin_category_contrasts: [
      "Diffuse-Porous Hardwoods: ring-porous shows large earlywood pore bands creating dramatic ring contrast; diffuse-porous shows uniform pore distribution with subtle ring transitions. Cathedral grain remains stronger in ring-porous; chatoyance and figure-by-light-reflection dominate diffuse-porous identification.",
    ],
  },
  {
    id: "wood_category_diffuse_porous_hardwoods",
    category: "wood_category",
    ordinal: "II",
    name: "Diffuse-Porous Hardwoods",
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "Hardwood species whose pores remain relatively uniform in size throughout the annual growth ring rather than forming dramatic earlywood pore bands. Typically exhibit smoother texture, more subtle grain transitions, less pronounced annual ring contrast, and greater suitability for fine carving, veneering, turning, and polished finishes. Dominate fashion-driven eras of American furniture production including Federal, Empire, Victorian walnut production, Colonial Revival, Mid-Century Modern, and fine cabinetmaking traditions. More difficult for beginners to identify because grain structure is subtler.",
    shared_identifying_traits: [
      "Fine to medium texture",
      "Uniform pore distribution",
      "Reduced visible annual-ring contrast",
      "Smooth planed surfaces",
      "Excellent carving and turning properties",
      "Frequent use for veneers",
      "Greater polish potential",
      "Often darker oxidation behavior",
      "Frequently associated with high-style furniture",
    ],
    primary_diagnostic_indicators: [
      "Smooth visual texture",
      "Absence of dramatic pore bands",
      "Subtle end-grain structure",
      "Softer cathedral grain",
      "Fine polish capability",
      "Often tighter, denser visual appearance",
      "Figure revealed more through light reflection than pore structure",
      "Identification requires observation of color, chatoyance, ray structure, figure, pore density, oxidation behavior, weight, and finish interaction",
    ],
    cousin_category_contrasts: [
      "Ring-Porous Hardwoods: diffuse-porous lacks the dramatic earlywood pore bands and strong cathedral grain of ring-porous woods. Identification relies more on light reflection, chatoyance, and color than on grain texture.",
      "Tropical Hardwoods: many tropical hardwoods are technically diffuse-porous but carry distinguishing density, oil content, and dramatic coloration. Distinguish by weight, oily tactile feel, and unusual color rather than by pore structure alone.",
    ],
  },
  {
    id: "wood_category_softwoods_conifers",
    category: "wood_category",
    ordinal: "III",
    name: "Softwoods / Conifers",
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "Primarily derived from coniferous trees. Despite the name, hardness varies considerably — some softwoods are soft and lightweight, others are dense and structurally durable. Among the most important structural and secondary woods in American furniture history. Dominate early American, rural and vernacular furniture, painted furniture, secondary wood construction, blanket chests, utility furniture, architectural furniture, Western Arts & Crafts production, cedar storage furniture, and primitive/frontier furniture traditions. Frequently hidden beneath veneers or paint and therefore diagnostically critical when examining drawer bottoms, backboards, interior panels, undersides, structural framing, and secondary components. Show dramatic aging behavior, oxidation patterns, resin characteristics, and saw behavior valuable in evidence-first furniture dating.",
    shared_identifying_traits: [
      "Growth-ring dominance",
      "Resinous structure",
      "Lower pore visibility than hardwoods",
      "Strong earlywood/latewood contrast",
      "Frequent knotting",
      "Aromatic oils in some species",
      "Lower density overall",
      "Easy machining",
      "Frequent use in wide boards",
      "Common secondary-wood usage",
    ],
    primary_diagnostic_indicators: [
      "No visible pore structure",
      "Resin canals or pitch pockets",
      "Strong ring lines",
      "Lightweight feel",
      "Softer surface denting",
      "Distinct aromatic scent in some species",
      "Wide board usage in early furniture",
      "Nail compression around fasteners",
      "Oxidation color shifts",
    ],
    cousin_category_contrasts: [
      "Ring-Porous Hardwoods and Diffuse-Porous Hardwoods: softwoods lack visible pore structure entirely, distinguishing them from both hardwood categories. Softwoods compress around nails and dent more easily than either hardwood category. Resin canals or pitch pockets are uniquely diagnostic when present.",
    ],
  },
  {
    id: "wood_category_tropical_hardwoods_imported_exotics",
    category: "wood_category",
    ordinal: "IV",
    name: "Tropical Hardwoods / Imported Exotics",
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "Represent the luxury tier of furniture materials throughout much of Western furniture history. Often imported through maritime trade networks and associated with elite cabinetmaking, high-style urban furniture, fine veneers, decorative contrast work, inlay, musical instruments, luxury revival furniture, Art Deco, and Mid-Century Modern imports. Unlike many domestic woods, often valued as much for color, figure, rarity, exotic status, reflective qualities, and decorative contrast as for structural utility. Frequently used as veneers rather than solid lumber, in small quantities, as visual accents, for matched veneer layouts, and for decorative panels and borders. Because imported woods were expensive, they often appear in combination with secondary domestic woods, veneer cores, composite substrates, and high-style finishing systems.",
    shared_identifying_traits: [
      "Dramatic coloration",
      "Dense structure",
      "Fine polish potential",
      "High natural oil content",
      "Exceptional figure",
      "Decorative chatoyance",
      "Veneer suitability",
      "High dimensional stability",
      "Frequent ribbon or stripe figure",
      "Luxury associations",
    ],
    primary_diagnostic_indicators: [
      "Dense reflective surfaces",
      "Unusual coloration",
      "High polish response",
      "Dramatic figure movement",
      "Heavy weight",
      "Oily tactile feel in some species",
      "Fine diffuse pores",
      "Common veneer usage",
      "Contrasting sapwood/heartwood",
    ],
    cousin_category_contrasts: [
      "Diffuse-Porous Hardwoods: many tropical hardwoods are technically diffuse-porous; distinguish by greater density, oily tactile feel, dramatic coloration, and veneer-rather-than-solid usage patterns. Tropical hardwoods frequently combine with domestic secondary woods as veneer over substrate; pure domestic diffuse-porous woods used in solid construction is more common in domestic furniture.",
    ],
  },
];
export const NATURAL_WOOD_SPECIES: WoodSpeciesEntry[] = [];
export const ENGINEERED_SUBSTRATES: EngineeredSubstrateEntry[] = [];
export const CUT_GRAIN_PHENOMENA: CutGrainPhenomenonEntry[] = [];
