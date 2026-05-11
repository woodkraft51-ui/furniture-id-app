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

export const WOOD_CATEGORIES: WoodCategoryEntry[] = [];
export const NATURAL_WOOD_SPECIES: WoodSpeciesEntry[] = [];
export const ENGINEERED_SUBSTRATES: EngineeredSubstrateEntry[] = [];
export const CUT_GRAIN_PHENOMENA: CutGrainPhenomenonEntry[] = [];
