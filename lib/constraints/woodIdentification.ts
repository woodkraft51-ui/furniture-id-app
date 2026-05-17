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

import { CanonicalEntry, AntiClassificationGuidance, PeriodAssociation } from "./entryShape";

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
 * Regional pattern captured at species or subspecies level. Captures File B
 * "Regional Patterns" content as identification context. Distinct from
 * woodEvidence.ts WoodRegionalAssociation (which uses a closed enum of
 * region values for engine filter logic); this interface uses free-form
 * region strings because File B's regional headers vary in granularity
 * (state-level, multi-state, factory-center named) and the identification
 * layer does not need the closed-enum filter semantics that evidence does.
 */
export interface RegionalPattern {
  /** Region identifier, e.g. "Midwest", "Pennsylvania", "New England",
   * "Coastal elite cabinetmaking centers". Sourced verbatim from File B
   * regional headers. */
  region: string;

  /** Notes for the region — bullet content from File B collapsed into prose
   * with sentence joins where natural. */
  notes: string;
}

/**
 * Subspecies of a natural wood species. Per appraiser definition: "same
 * species-level identity, distinguishable variant." Subspecies are nested
 * within WoodSpeciesEntry rather than being top-level entries, mirroring the
 * FormSubtype pattern in forms.ts. Subspecies-level evidence (period,
 * regional) is captured in woodEvidence.ts via optional subspecies_id field
 * on species evidence entries.
 */
/**
 * Wood market/finish/era variant. Semantically DISTINCT from WoodSubspecies:
 * a subspecies is a biological/anatomical variant of a species (white oak vs
 * red oak within the oak group). A variant is a market/finish/era
 * characterization of a species — wood + finish + production context — that
 * carries dating and style-overlap signals without being a separate species.
 * Example: "Golden Oak Era" is an oak variant — same species (could be white
 * or red oak), distinguished by amber/honey finish, prominent open grain
 * presentation, and factory-era production c. 1890–1915 peak. A piece can
 * legitimately read as a Golden Oak variant of either white_oak or red_oak,
 * which is why this lives at the species frame rather than the subspecies
 * frame.
 *
 * Variants attach at the species level (variants?: WoodVariant[]) and carry
 * their own period_associations + identifying_elements. The paired evidence
 * library (woodEvidence.ts) attaches dating and style-wave-association
 * content via variant_id FK, mirroring the species_id / subspecies_id
 * pattern on WoodSpeciesEvidenceEntry.
 */
export interface WoodVariant {
  /**
   * Identifier within the parent species. Format: variant_<descriptor>.
   */
  id: string;

  /**
   * Display name for the variant (e.g., "Golden Oak Era").
   */
  name: string;

  /**
   * Description of what defines this variant — finish, grain presentation,
   * production context, and the signals that distinguish it from the parent
   * species's other variants and from the period-agnostic species reading.
   */
  description: string;

  /**
   * Traits unique to this variant that differentiate it from the parent
   * species's other variants. Finish + grain + market-era characteristics
   * rather than biological/anatomical (those belong on subspecies).
   */
  unique_traits: string[];

  /**
   * Identifying elements an appraiser would examine to confirm variant
   * identification — finish color/tone, surface character, hardware
   * conventions, factory-era proportions, etc.
   */
  identifying_elements: string[];

  /**
   * Period associations for this variant. Variants always carry their own
   * period_associations because the variant identity IS partly defined by
   * its market era; unlike subspecies, which may inherit period content
   * from the parent species.
   */
  period_associations: PeriodAssociation[];

  /**
   * Free-form list of style vocabularies that commonly co-occur with this
   * variant. Reminder that variants are orthogonal to style attribution: a
   * Golden Oak Era piece can carry Eastlake, Colonial Revival, Mission, or
   * Empire Revival ornamental vocabulary on the same wood/finish anchor.
   */
  style_overlaps?: string[];
}

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

  /**
   * Optional period associations specific to this subspecies. Subspecies
   * leave this field unpopulated when File B places period content only at
   * the parent species frame; the parent's period_associations apply.
   * Populated when File B carries subspecies-distinct period tables (e.g.,
   * White Oak's Mission/Arts & Crafts–specific dominance band).
   */
  period_associations?: PeriodAssociation[];

  /**
   * Optional regional patterns specific to this subspecies. Same authoring
   * rule as period_associations: populated when File B carries
   * subspecies-distinct regional content; otherwise the parent species'
   * regional_patterns apply.
   */
  regional_patterns?: RegionalPattern[];
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
   * Optional variants array — market/finish/era characterizations of the
   * species (e.g., "Golden Oak Era" on oak). See WoodVariant interface for
   * shape. Variants are semantically distinct from subspecies: subspecies
   * partition the species biologically; variants partition it by market
   * era and finish convention. A piece can identify as a variant of either
   * subspecies of the same parent species.
   */
  variants?: WoodVariant[];

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

  /**
   * Required period associations sourced from File B "Common Time Periods"
   * tables. Each table row becomes one PeriodAssociation. Engine reasoning
   * uses date_floor/date_ceiling for filter logic; report rendering uses
   * period_label for narrative composition. Required because every species
   * in File B carries a Common Time Periods table; absence would indicate
   * an authoring gap.
   */
  period_associations: PeriodAssociation[];

  /**
   * Optional regional patterns sourced from File B "Regional Patterns"
   * sections. Populated when File B provides regional content for the
   * species; unpopulated when File B omits the section (e.g., sycamore).
   */
  regional_patterns?: RegionalPattern[];

  /**
   * Free-form descriptions of this species's relationship to closely-related
   * species that share diagnostic overlap. Each entry is a complete
   * contrastive statement comparing this species to a cousin species. Mirrors
   * cousin_category_contrasts (Block 17 D-WC0), cousin_form_contrasts
   * (forms.ts), and cousin_phenomenon_contrasts (Block 16 D-WI6). Display-name
   * prose convention: identifies cousin species by display name rather than
   * id reference.
   */
  cousin_species_contrasts?: string[];
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

  /**
   * Optional period associations sourced from File B "Common Time Periods"
   * tables for substrates. Reuses the PeriodAssociation interface from
   * Block 18 D-WS0b. Substrate period_associations are diagnostically
   * distinct from introduction_anchor: introduction_anchor captures the
   * substrate's chronological floor; period_associations capture the
   * substrate's per-era usage curve (early adoption, growing factory use,
   * dominance) when File B authors multiple period rows. Added in Block 20
   * D-ES20-10.
   */
  period_associations?: PeriodAssociation[];

  /**
   * Optional regional patterns sourced from File B "Regional Patterns"
   * sections for substrates. Reuses the RegionalPattern interface from
   * Block 18 D-WS0c. Substrate regional content is typically minimal
   * (industrial production rather than regional craft traditions); most
   * substrate entries carry exactly one RegionalPattern reflecting File B's
   * "National factory production" / "Industrialized furniture production"
   * framing. Added in Block 20 D-ES20-10.
   */
  regional_patterns?: RegionalPattern[];

  /**
   * Free-form descriptions of this substrate's relationship to closely
   * related substrates that share diagnostic overlap. Mirrors
   * cousin_species_contrasts on WoodSpeciesEntry (Block 18 D-WS0a) and
   * cousin_form_contrasts on FormEntry. Display-name prose convention:
   * identifies cousin substrates by display name rather than id reference.
   * Added in Block 20 D-ES20-9.
   */
  cousin_substrate_contrasts?: string[];
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

  /**
   * Optional period associations sourced from File B "Common Time Periods"
   * tables on phenomenon entries. Reuses the PeriodAssociation interface
   * from Block 18 D-WS0b. Phenomena carry own period associations
   * independent of species period associations; Phase 3 engine reasoning
   * at integration time combines phenomenon period bands with species
   * period bands (e.g., Quarter-Sawn White Oak effective period = white
   * oak species 1600-1940 ∩ quarter_sawn Mission 1880-1925 = Mission/Arts
   * & Crafts 1880-1925 for quarter-sawn white oak). Added in Block 21
   * D-CG21-9.
   */
  period_associations?: PeriodAssociation[];

  /**
   * Optional regional patterns sourced from File B "Regional Patterns"
   * sections on phenomenon entries. Reuses the RegionalPattern interface
   * from Block 18 D-WS0c. Captures phenomenon-level regional concentrations
   * (e.g., Midwest Mission quarter-sawn oak; California Arts & Crafts
   * redwood burl). Added in Block 21 D-CG21-10.
   */
  regional_patterns?: RegionalPattern[];

  /**
   * Optional anti-back-classification guidance for phenomena with crisp
   * chronological boundaries. Reuses entryShape.ts AntiClassificationGuidance
   * interface. Single-or-array shape per Block 20 D-ES20-6 precedent.
   * Phenomenon adoption maps to boundary_type: "form_emergence" per Block
   * 20 D-ES20-5 substrate-adoption convention. Exercised on phenomena like
   * rotary-cut veneer (post-1930 emergence) and spalted figure (post-1960
   * studio-only). Added in Block 21 D-CG21-11.
   */
  anti_classification_guidance?: AntiClassificationGuidance | AntiClassificationGuidance[];

  /**
   * Substrates in which this phenomenon characteristically expresses. One-way
   * reference (phenomenon → substrate); parallel shape to applicable_species
   * above. Exercised on veneer-slicing/layout phenomena that apply to veneer
   * faces regardless of substrate beneath (Rotary-Cut, Plain-Sliced,
   * Bookmatching, Slip-Matching). Most non-veneer phenomena leave field
   * unpopulated. Closes Block 16 D-WI6 design gap surfaced by Block 20.
   * Added in Block 21 D-CG21-12.
   */
  applicable_substrates?: { substrate_id: string; characteristic_expression?: string }[];

  /**
   * Block 22 schema extension (item 1d): prose appraiser-knowledge framing
   * that the engine surfaces via getCanonicalCautionText when a phenomenon
   * clue fires. Parallels diagnostic_caution_text on evidence-side
   * interfaces (CutGrainEvidenceEntry, WoodSpeciesEvidenceEntry, etc.) and
   * on Blocks 17/19/20/21 schema extensions for upholstery / joinery /
   * fastener / hardware libraries. The shared CanonicalEntry.caution_text
   * field is NOT engine-read; diagnostic warning text intended for user-
   * facing surfacing must live here.
   */
  diagnostic_caution_text?: string;
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
export const NATURAL_WOOD_SPECIES: WoodSpeciesEntry[] = [
  {
    id: "wood_species_oak_group",
    category: "wood_species",
    wood_category_id: "wood_category_ring_porous_hardwoods",
    name: "oak",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Among the most important furniture woods in American history. Spans Colonial production, Jacobean influence, Victorian production, Golden Oak, Mission/Arts & Crafts, Depression-era revival furniture, and modern rustic production. Oak became especially dominant during 1875–1915 (Golden Oak) and 1895–1925 (Arts & Crafts / Mission).",
    unique_traits: [
      "Extremely visible grain",
      "Heavy ray fleck in white oak",
      "High tannin content",
      "Exceptional durability",
      "Strong structural strength",
      "Open coarse pores",
      "Excellent steam-bending properties",
    ],
    identifying_elements: [
      "Large pores arranged in distinct bands (visible at end grain)",
    ],
    cut_specific_identifiers: [
      {
        cut_phenomenon_id: "cut_grain_phenomenon_flat_sawn",
        identifiers: [
          "Cathedral grain",
          "Strong contrast lines",
          "Open pores",
          "Heavy texture",
        ],
      },
    ],
    typical_structural_role: "either",
    period_associations: [
      { period_label: "Golden Oak", date_floor: 1875, date_ceiling: 1915 },
      { period_label: "Arts & Crafts / Mission", date_floor: 1895, date_ceiling: 1925 },
    ],
    cousin_species_contrasts: [
      "Ash: oak shows heavier weight, stronger ray fleck (especially in white oak), and deeper tannin-driven darkening with age compared to ash's lighter, more uniform texture and minimal ray expression.",
      "Walnut: oak's ring-porous structure and visible earlywood pore bands distinguish it from walnut's diffuse-porous fine pore distribution, even when oak has been dark-stained to imitate walnut. End-grain inspection resolves the confusion immediately.",
    ],
    subspecies: [
      {
        id: "wood_subspecies_white_oak",
        name: "white oak",
        description:
          "White oak is the premier oak used in Mission furniture, Arts & Crafts furniture, high-end Golden Oak furniture, structural furniture, and English-inspired revival furniture.",
        unique_traits: [
          "Closed cellular structure",
          "Water resistance",
          "Strong medullary rays",
          "Cooler brown coloration",
          "Dense weight",
          "Exceptional quarter-sawn figure",
        ],
        identifying_elements: [
          "Dramatic ray fleck",
          "Olive-brown undertones",
          "Dense feel",
          "Tight latewood bands",
          "Heavy linear shimmer in quarter-sawn cuts",
        ],
        period_associations: [
          { period_label: "Structural joined furniture", date_floor: 1600, date_ceiling: 1750 },
          { period_label: "Golden Oak dominance", date_floor: 1880, date_ceiling: 1915 },
          { period_label: "Mission/Arts & Crafts peak", date_floor: 1895, date_ceiling: 1925 },
          { period_label: "Tudor/Jacobean Revival", date_floor: 1920, date_ceiling: 1940 },
        ],
        regional_patterns: [
          { region: "Midwest", notes: "Massive dominance. Indiana, Michigan, Illinois, Wisconsin." },
          { region: "East Coast", notes: "Earlier colonial structural use." },
          { region: "California Arts & Crafts", notes: "White oak mixed with redwood influences." },
        ],
      },
      {
        id: "wood_subspecies_red_oak",
        name: "red oak",
        description:
          "Red oak became heavily used in mass-production furniture, Golden Oak furniture, Depression-era furniture, and mid-market factory production. More porous and less stable than white oak.",
        unique_traits: [
          "Pink-red undertones",
          "Wider pores",
          "Less dramatic ray fleck",
          "Faster stain absorption",
          "Slightly lighter weight",
        ],
        identifying_elements: [
          "Open pores visible immediately",
          "Pinkish oxidation",
          "Broad cathedral grain",
          "Shorter medullary rays",
        ],
        period_associations: [
          { period_label: "Factory Golden Oak", date_floor: 1880, date_ceiling: 1915 },
          { period_label: "Utility furniture", date_floor: 1920, date_ceiling: 1950 },
          { period_label: "Colonial Revival mass production", date_floor: 1950, date_ceiling: 1980 },
        ],
        regional_patterns: [
          { region: "Midwest factory centers", notes: "Grand Rapids, Rockford, Chicago." },
        ],
      },
    ],
    variants: [
      {
        id: "wood_variant_golden_oak_era",
        name: "Golden Oak Era",
        description:
          "Market/finish/era variant of oak — not a biological subspecies. Describes the late 19th to early 20th-century American furniture production period when oak became the dominant visible furniture wood, especially in middle-class and mass-market furniture. Identification combines oak species + warm amber/honey/golden-brown finish + prominent open grain + factory-era construction. A Golden Oak Era piece can be either white or red oak; the variant identity is the wood + finish + market era, not the species biology. Per appraiser-supplied definition (May 2026 session): a piece can legitimately read as 'Golden Oak Colonial Revival chest of drawers, c. 1900–1915' or 'Late Victorian Golden Oak dresser, c. 1890–1910' — the Golden Oak anchor is orthogonal to the style label and supplements the market-era diagnostic without claiming style attribution.",
        unique_traits: [
          "Oak as the dominant visible wood (flat-sawn, quarter-sawn, or mixed)",
          "Warm amber/honey/orange-brown/golden-brown finish",
          "Prominent open grain (strong cathedral grain on flat-sawn; visible ray fleck on quarter-sawn)",
          "Thick tops and broad drawer fronts",
          "Machine-cut case regularity with factory-standard proportions",
          "Substantial, honest-looking, practical commercial appearance — heavier and more wood-forward than earlier mahogany/walnut/rosewood Victorian high-style furniture",
        ],
        identifying_elements: [
          "Honey/amber/golden-brown finish on oak primary surfaces",
          "Strong cathedral grain visible on flat-sawn drawer fronts, case sides, and tops",
          "Ray fleck visible on quarter-sawn surfaces (higher-grade Mission/Arts & Crafts/premium Golden Oak)",
          "Round wooden knobs or pressed brass hardware on drawers and doors",
          "Paneled or plank sides; shaped skirts or bracket feet at base",
          "Solid secondary woods (pine or poplar) on drawer sides and bottoms; wood-on-wood drawer runners",
          "Plank back panels (multiple horizontal solid boards) or paneled backs; pre-plywood construction",
        ],
        period_associations: [
          { period_label: "Golden Oak Era peak production", date_floor: 1890, date_ceiling: 1915 },
          { period_label: "Golden Oak Era emergence", date_floor: 1870, date_ceiling: 1890 },
          { period_label: "Golden Oak Era decline", date_floor: 1915, date_ceiling: 1925 },
          { period_label: "Later oak factory survival", date_floor: 1925 },
        ],
        style_overlaps: [
          "Late Victorian — heavy proportions, shaped skirts, carved pulls, mixed ornament",
          "Eastlake — incised lines, geometric carving, squared form",
          "Mission / Arts & Crafts — straight lines, exposed joinery look, quarter-sawn oak",
          "Colonial Revival — simple knobs, restrained classical shaping, bracket feet",
          "Empire Revival / Classical echoes — overhanging tops, rounded drawer fronts, scroll-like supports on factory-era construction",
          "Country / vernacular oak — plain utility forms with minimal ornament",
        ],
      },
    ],
  },
  {
    id: "wood_species_ash",
    category: "wood_species",
    wood_category_id: "wood_category_ring_porous_hardwoods",
    name: "ash",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Ring-porous hardwood prized for strength, flexibility, and steam bending. Common in chair production, tool handles, bentwood furniture, and utility seating.",
    unique_traits: [
      "Similar to oak but lighter",
      "More uniform texture",
      "Excellent shock resistance",
      "Pale coloration",
    ],
    identifying_elements: [
      "Open pores",
      "Straight grain",
      "Lighter weight than oak",
      "Minimal ray fleck",
      "Elastic feel during shaping",
    ],
    typical_structural_role: "either",
    period_associations: [
      { period_label: "Bentwood and chair production", date_floor: 1850, date_ceiling: 1930 },
      { period_label: "Utility furniture", date_floor: 1900, date_ceiling: 1940 },
      { period_label: "Scandinavian influence", date_floor: 1950, date_ceiling: 1970 },
    ],
    regional_patterns: [
      { region: "Midwest", notes: "Chair factories. Bentwood production." },
    ],
    cousin_species_contrasts: [
      "Oak: ash carries a similar ring-porous structure but with lighter weight, more uniform texture, and minimal ray fleck. Ash flexes better under steam bending; oak carries stronger structural mass.",
    ],
  },
  {
    id: "wood_species_elm",
    category: "wood_species",
    wood_category_id: "wood_category_ring_porous_hardwoods",
    name: "elm",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Valued primarily for interlocked grain, split resistance, and seat construction. Often used in Windsor chair seats, rural furniture, and utility furniture.",
    unique_traits: [
      "Interlocked grain",
      "Difficult to split",
      "Wavy texture",
      "Strong structural resilience",
    ],
    identifying_elements: [
      "Rope-like grain",
      "Chaotic pore structure",
      "Coarse texture",
      "Irregular cathedral grain",
    ],
    typical_structural_role: "either",
    period_associations: [
      { period_label: "Windsor seating", date_floor: 1700, date_ceiling: 1850 },
      { period_label: "Utility furniture", date_floor: 1800, date_ceiling: 1900 },
      { period_label: "Rural persistence", date_floor: 1900, date_ceiling: 1930 },
    ],
    regional_patterns: [
      { region: "New England", notes: "Windsor chair production." },
      { region: "Pennsylvania", notes: "Rural vernacular furniture." },
    ],
  },
  {
    id: "wood_species_hickory",
    category: "wood_species",
    name: "hickory",
    common_aliases: [
      "shagbark hickory",
      "shellbark hickory",
      "pignut hickory",
      "mockernut hickory",
      "true hickory",
      "hickory sapwood",
      "hickory heartwood",
      "pecan hickory",
    ],
    scientific_name: "Carya spp.",
    positive_authority: 7,
    hard_negative_authority: 7,
    wood_category_id: "wood_category_ring_porous_hardwoods",
    description: "Hickory is a very dense, hard, ring-porous North American hardwood with strong earlywood and latewood contrast, open grain, and exceptional shock resistance. It commonly shows pale cream to tan sapwood with darker brown heartwood, often with bold streaking when sapwood and heartwood are used together. In furniture, it is most strongly associated with chair parts, rustic furniture, bent or turned elements, ladderback and country seating, and durable utilitarian construction rather than refined veneer work. Its weight, toughness, coarse grain, and high contrast between pale and darker zones are often more diagnostic than color alone.",
    unique_traits: [
      "Very high density and shock resistance",
      "Ring-porous grain structure",
      "Strong earlywood and latewood contrast",
      "Pale sapwood with darker brown heartwood",
      "Coarse open grain",
      "Frequent bold sapwood-heartwood streaking",
      "Common in chair parts and rustic furniture",
      "Rare as fine decorative veneer",
    ],
    identifying_elements: [
      "Large earlywood pores visible in growth-ring bands",
      "Coarse grain on flat-sawn faces",
      "Heavy weight relative to many other domestic hardwoods",
      "Pale cream, tan, and brown color variation within the same board",
      "Strong, tough turnings or spindles in chair construction",
      "Rustic bark-on or sapling elements in hickory furniture",
      "Durable wear surfaces with pronounced open grain",
      "Limited ray fleck compared with oak",
    ],
    typical_structural_role: "primary_show",
    period_associations: [
      {
        period_label: "Colonial and early republic utilitarian use",
        date_floor: 1700,
        date_ceiling: 1820,
        usage_notes: "Hickory appears most plausibly in rural, vernacular, and utilitarian contexts where local hardwood strength mattered more than refined figure. It is especially relevant as supporting evidence in chair construction, tool-like structural parts, rungs, stretchers, and other elements requiring toughness.",
      },
      {
        period_label: "Nineteenth-century rural and country chair-making",
        date_floor: 1820,
        date_ceiling: 1900,
        usage_notes: "Hickory is strongly associated with American country, Appalachian, Southern, and Midwestern chair-making traditions, especially where durable rungs, posts, stretchers, spindles, and bent or split components were valued. It should be treated as a strong supporting clue for vernacular seating when the form, construction, and regional context agree.",
      },
      {
        period_label: "Rustic hickory and resort furniture production",
        date_floor: 1890,
        date_ceiling: 1935,
        usage_notes: "Hickory became especially visible in rustic furniture, lodge furniture, porch furniture, camp furniture, and resort-related production, including bark-on sapling forms and bent rustic frames. In this period, hickory may be a primary visual identity rather than merely a hidden structural choice.",
      },
      {
        period_label: "Modern specialty and reproduction use",
        date_floor: 1935,
        usage_notes: "Hickory continues in specialty furniture, rustic revival pieces, Windsor-inspired chairs, country reproductions, cabinetry, flooring, and durable domestic hardwood furniture. Open-ended modern use means hickory alone should not be used as a date anchor without supporting construction, hardware, finish, and form evidence.",
      },
    ],
    regional_patterns: [
      {
        region: "Appalachian region",
        notes: "Commonly associated with ladderback, country, split-bottom, and rustic seating traditions, especially where locally available hardwoods were used for strength and flexibility.",
      },
      {
        region: "Southern hardwood belt",
        notes: "Plausible in vernacular seating, utilitarian furniture, and rustic furniture where local hardwood supply and durable construction were priorities.",
      },
      {
        region: "Midwest",
        notes: "Relevant to country furniture, farm furniture, rustic furniture, and later commercial hickory furniture production where durable domestic hardwoods were available.",
      },
      {
        region: "Pennsylvania and Ohio Valley",
        notes: "Possible in vernacular chair-making and country furniture contexts, especially when paired with turned posts, rungs, rush or splint seating, and regional rural construction.",
      },
    ],
    cousin_species_contrasts: [
      "Distinct from ash: hickory is usually heavier, harder, and tougher, with stronger shock resistance; ash may show similar ring-porous structure but often reads lighter in weight and more elastic in chair and tool-related contexts.",
      "Distinct from oak: hickory lacks the strong medullary ray fleck that often identifies quarter-sawn oak, and it usually presents more as tough, coarse-grained structural hardwood than as a ray-flecked decorative show wood.",
      "Distinct from beech: hickory is ring-porous with stronger growth-ring contrast, while beech is diffuse-porous or very fine-textured by comparison and often shows small flecking rather than bold pore bands.",
      "Distinct from locust: both may be hard and durable, but locust often carries more yellow-green to golden brown tones and outdoor durability associations, while hickory is more commonly tied to chair parts, rungs, rustic furniture, and pale sapwood-heartwood contrast.",
      "Distinct from maple: hickory is coarser and ring-porous, while maple is tighter grained and diffuse-porous; maple usually lacks hickory's open pore bands and rugged sapwood-heartwood striping.",
    ],
  },
  {
    id: "wood_species_walnut_group",
    category: "wood_species",
    wood_category_id: "wood_category_diffuse_porous_hardwoods",
    name: "walnut",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "One of the defining luxury woods of American furniture history. Black walnut especially dominated Rococo Revival, Renaissance Revival, Victorian production, high-style carved furniture, late Empire furniture, and the MCM walnut revival. Walnut bridges both hand craftsmanship and industrial factory production extraordinarily well.",
    unique_traits: [
      "Rich chocolate-brown coloration",
      "Purple or gray undertones",
      "Fine to medium texture",
      "Excellent carving properties",
      "Dimensional stability",
      "Deep oxidation behavior",
      "Exceptional veneer quality",
      "Natural luster",
    ],
    identifying_elements: [
      "Deep warm brown darkening with age",
      "Often develops amber undertones beneath finish",
    ],
    cut_specific_identifiers: [
      {
        cut_phenomenon_id: "cut_grain_phenomenon_flat_sawn",
        identifiers: [
          "Soft flowing cathedral grain",
          "Rich brown tone",
          "Dark streaking",
          "Fine pores",
        ],
      },
      {
        cut_phenomenon_id: "cut_grain_phenomenon_quarter_sawn",
        identifiers: [
          "Linear grain",
          "Ribbon shimmer",
          "More subdued figure",
        ],
      },
    ],
    typical_structural_role: "primary_show",
    period_associations: [
      { period_label: "Fine regional cabinetmaking", date_floor: 1700, date_ceiling: 1820 },
      { period_label: "Victorian dominance", date_floor: 1840, date_ceiling: 1885 },
      { period_label: "Renaissance and Colonial Revival", date_floor: 1890, date_ceiling: 1910 },
      { period_label: "MCM walnut resurgence", date_floor: 1945, date_ceiling: 1970 },
    ],
    regional_patterns: [
      { region: "Midwest", notes: "Massive black walnut availability. Grand Rapids production. Chicago production." },
      { region: "Pennsylvania", notes: "Strong early cabinetmaking use." },
      { region: "Southern States", notes: "Fine walnut casework traditions." },
    ],
    cousin_species_contrasts: [
      "Cherry: walnut shows cooler chocolate-brown coloration with purple-gray undertones, contrasted with cherry's warmer pink-to-amber oxidation. Pore visibility is also higher in walnut.",
      "Birch: birch is commonly stained as a walnut substitute in factory production. Birch's pale-yellow base tone and blotchy stain behavior under finish distinguish it from walnut's natural chocolate-brown heartwood.",
      "Gumwood: gumwood is commonly stained as faux walnut. Gumwood's bland figure beneath stain and softer texture distinguish it from walnut's natural grain and density.",
      "Mahogany: walnut and mahogany overlap as luxury diffuse-porous woods. Walnut shows cooler brown with purple-gray undertones; mahogany shows warmer red-brown with characteristic ribbon stripe figure.",
      "Oak (dark-stained): oak's ring-porous pore bands and end-grain pore arrangement distinguish it from walnut even when dark-stained. The ring-porous/diffuse-porous distinction is the dispositive test.",
    ],
    subspecies: [
      {
        id: "wood_subspecies_black_walnut",
        name: "black walnut",
        description: "The premier American walnut species used in furniture production.",
        unique_traits: [
          "Deep brown coloration",
          "Purple-gray undertones",
          "Excellent carving response",
          "Moderate pore visibility",
          "Rich natural chatoyance",
        ],
        identifying_elements: [
          "Chocolate-brown heartwood",
          "Cream sapwood contrast",
          "Fine flowing grain",
          "Warm oxidation",
        ],
      },
    ],
  },
  {
    id: "wood_species_cherry_group",
    category: "wood_species",
    wood_category_id: "wood_category_diffuse_porous_hardwoods",
    name: "cherry",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "One of the most important refined American furniture woods, prized for workability, rich oxidation, fine grain, and stability. Strongly associated with Pennsylvania production, Shaker furniture, Federal furniture, Colonial Revival, and traditional American furniture.",
    unique_traits: [
      "Warm reddish-brown oxidation",
      "Fine smooth texture",
      "Subtle grain",
      "Darkening with UV exposure",
      "Occasional gum pockets",
      "Satin sheen",
    ],
    identifying_elements: [
      "Pink-to-red undertones",
      "Fine grain",
      "Small dark gum streaks",
      "Smooth tactile feel",
      "Minimal visible pore structure",
    ],
    typical_structural_role: "primary_show",
    period_associations: [
      { period_label: "Federal and regional cabinetmaking", date_floor: 1750, date_ceiling: 1820 },
      { period_label: "Rural furniture", date_floor: 1820, date_ceiling: 1860 },
      { period_label: "Colonial Revival", date_floor: 1880, date_ceiling: 1940 },
      { period_label: "Traditional reproduction furniture", date_floor: 1950 },
    ],
    regional_patterns: [
      { region: "Pennsylvania", notes: "Strongest cherry traditions." },
      { region: "New England", notes: "Shaker use." },
      { region: "Appalachian regions", notes: "Rural vernacular use." },
    ],
    cousin_species_contrasts: [
      "Walnut: cherry shows warmer pink-to-amber oxidation and finer closed grain compared to walnut's cooler chocolate-brown coloration with purple-gray undertones.",
      "Birch: birch is commonly stained as a cherry substitute in factory production. Birch's pale-yellow base tone and blotchy stain behavior under finish distinguish it from cherry's natural warm reddish-brown oxidation.",
    ],
    subspecies: [
      {
        id: "wood_subspecies_black_cherry",
        name: "black cherry",
        description:
          "The primary American cherry species used in furniture production, carrying the canonical traits of the Cherry Group.",
        unique_traits: [
          "Deep warm oxidation",
          "Smooth figure",
          "Elegant polish response",
        ],
        identifying_elements: [
          "Amber-red aging",
          "Fine closed grain",
          "Satin reflective surface",
        ],
      },
    ],
  },
  {
    id: "wood_species_maple_group",
    category: "wood_species",
    wood_category_id: "wood_category_diffuse_porous_hardwoods",
    name: "maple",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Spans an enormous range of American furniture production: Colonial, Shaker, country furniture, factory furniture, MCM, and contemporary cabinetry. One of the most versatile American furniture woods.",
    unique_traits: [
      "Dense structure",
      "Fine texture",
      "Smooth finish potential",
      "Light coloration",
      "Tight grain",
      "High wear resistance",
    ],
    identifying_elements: [
      "Cream to pale amber coloration",
      "Tight subtle grain",
      "Minimal pore visibility",
      "Hard reflective surface",
      "Smooth tactile finish",
    ],
    typical_structural_role: "primary_show",
    period_associations: [
      { period_label: "Colonial regional work", date_floor: 1600, date_ceiling: 1800 },
      { period_label: "Utility furniture", date_floor: 1800, date_ceiling: 1900 },
      { period_label: "Colonial Revival", date_floor: 1900, date_ceiling: 1940 },
      { period_label: "Scandinavian and MCM", date_floor: 1945, date_ceiling: 1970 },
    ],
    regional_patterns: [
      { region: "New England", notes: "Extremely common." },
      { region: "Midwest", notes: "Factory furniture production." },
    ],
    subspecies: [
      {
        id: "wood_subspecies_hard_maple_sugar_maple",
        name: "hard maple / sugar maple",
        description: "Hard maple / sugar maple subspecies of the Maple Group.",
        unique_traits: [
          "Extremely dense",
          "Fine grain",
          "High durability",
          "Light coloration",
        ],
        identifying_elements: [
          "Smooth almost featureless grain",
          "Cream coloration",
          "Heavy weight",
        ],
      },
      {
        id: "wood_subspecies_soft_maple",
        name: "soft maple",
        description: "Soft maple subspecies of the Maple Group.",
        unique_traits: [
          "Slightly lighter density",
          "More muted figure",
          "Easier machining",
        ],
        identifying_elements: [
          "Slightly softer coloration",
          "Reduced hardness",
          "Broader grain transitions",
        ],
      },
    ],
  },
  {
    id: "wood_species_mahogany_group",
    category: "wood_species",
    wood_category_id: "wood_category_diffuse_porous_hardwoods",
    name: "mahogany",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "One of the defining luxury woods of Western furniture history. Associated with Queen Anne, Chippendale, Federal, Empire, Victorian luxury production, and Hollywood Regency.",
    unique_traits: [
      "Ribbon grain",
      "Rich red-brown coloration",
      "Excellent carving properties",
      "Stable structure",
      "Lustrous polish",
      "Fine diffuse pores",
    ],
    identifying_elements: [
      "Red-brown oxidation",
      "Ribbon stripe figure",
      "Fine even texture",
      "Deep reflective polish",
    ],
    typical_structural_role: "primary_show",
    period_associations: [
      { period_label: "Colonial luxury dominance", date_floor: 1720, date_ceiling: 1820 },
      { period_label: "Empire", date_floor: 1800, date_ceiling: 1845 },
      { period_label: "Revival furniture", date_floor: 1880, date_ceiling: 1940 },
      { period_label: "Traditional luxury furniture", date_floor: 1950, date_ceiling: 1970 },
    ],
    regional_patterns: [
      { region: "Coastal elite cabinetmaking centers", notes: "Philadelphia, Newport, New York, Baltimore." },
    ],
    cousin_species_contrasts: [
      "Walnut: mahogany shows warmer red-brown coloration with characteristic ribbon stripe figure; walnut shows cooler chocolate-brown with purple-gray undertones.",
      "Gumwood: gumwood is commonly stained as faux mahogany. Gumwood's bland figure beneath stain and softer texture distinguish it from mahogany's natural ribbon stripe figure and density.",
    ],
    subspecies: [
      {
        id: "wood_subspecies_honduran_mahogany",
        name: "honduran mahogany",
        description: "Honduran Mahogany (also called Big-Leaf Mahogany; Swietenia macrophylla) is the dominant mahogany subspecies in American furniture from c. 1760s onward. It became the primary American luxury mahogany after Cuban mahogany trade declined and remained common in fine American furniture through the early 20th century, with reduced but continued specialty, veneer, revival, and regulated use after c. 1930. Post-2003 examples require caution because legal trade is CITES-regulated; period and trade-restriction context lives on the evidence-side wood_species_evidence_mahogany_subspecies_honduran entry.",
        unique_traits: [
          "Warm red-brown tone",
          "Excellent carving response",
          "Fine ribbon figure",
        ],
        identifying_elements: [
          "Deep reddish oxidation",
          "Smooth polish",
          "Fine linear shimmer",
        ],
      },
      {
        id: "wood_subspecies_cuban_mahogany",
        name: "cuban mahogany",
        description: "Cuban mahogany subspecies of the Mahogany Group.",
        unique_traits: [
          "Denser",
          "Richer coloration",
          "Extremely high luxury status",
        ],
        identifying_elements: [
          "Dense reflective polish",
          "Deep coloration",
          "Fine tight grain",
        ],
      },
    ],
  },
  {
    id: "wood_species_birch_group",
    category: "wood_species",
    wood_category_id: "wood_category_diffuse_porous_hardwoods",
    name: "birch",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Heavily associated with factory furniture, Colonial Revival, utility furniture, and veneer substrates. Often used as a walnut or mahogany substitute.",
    unique_traits: [
      "Fine grain",
      "Uniform texture",
      "Moderate hardness",
      "Excellent staining behavior",
    ],
    identifying_elements: [
      "Pale yellow tone",
      "Smooth grain",
      "Slight blotching tendency under stain",
    ],
    typical_structural_role: "either",
    period_associations: [
      { period_label: "Factory production", date_floor: 1850, date_ceiling: 1940 },
      { period_label: "Colonial Revival", date_floor: 1900, date_ceiling: 1950 },
      { period_label: "Utility cabinetry", date_floor: 1945, date_ceiling: 1970 },
    ],
    regional_patterns: [
      { region: "Midwest factories", notes: "Massive use in mass production." },
    ],
    cousin_species_contrasts: [
      "Walnut: birch is commonly substituted for walnut in factory production. Birch's pale-yellow base tone and blotchy stain behavior distinguish it from walnut's natural chocolate-brown heartwood.",
      "Cherry: birch is commonly substituted for cherry. Birch's blotchier stain absorption and pale yellow undertone contrast with cherry's even pink-to-red oxidation.",
      "Mahogany: birch is occasionally stained to imitate mahogany in mid-market production. Birch lacks mahogany's ribbon stripe figure and shows lighter weight.",
    ],
  },
  {
    id: "wood_species_beech_group",
    category: "wood_species",
    wood_category_id: "wood_category_diffuse_porous_hardwoods",
    name: "beech",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Strongly associated with bentwood furniture, chair production, European influence, and utility seating.",
    unique_traits: [
      "Excellent steam bending",
      "Tight grain",
      "High wear resistance",
    ],
    identifying_elements: [
      "Pale pink-tan coloration",
      "Small ray fleck",
      "Fine grain",
    ],
    typical_structural_role: "either",
    period_associations: [
      { period_label: "Bentwood furniture", date_floor: 1850, date_ceiling: 1930 },
      { period_label: "Chair production", date_floor: 1900, date_ceiling: 1950 },
    ],
    regional_patterns: [
      { region: "Urban factory production", notes: "Bentwood manufacturing centers." },
    ],
  },
  {
    id: "wood_species_poplar_group",
    category: "wood_species",
    wood_category_id: "wood_category_diffuse_porous_hardwoods",
    name: "poplar",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "One of the most important hidden secondary woods in American furniture history. Frequently used for drawer sides, internal framing, painted furniture, and secondary structural components.",
    unique_traits: [
      "Easy machining",
      "Stable structure",
      "Green/yellow coloration",
      "Soft texture",
    ],
    identifying_elements: [
      "Greenish cast",
      "Brown mineral streaks",
      "Fine texture",
      "Lightweight feel",
    ],
    typical_structural_role: "primary_secondary",
    period_associations: [
      { period_label: "Secondary wood dominance", date_floor: 1800 },
      { period_label: "Factory furniture", date_floor: 1850, date_ceiling: 1940 },
      { period_label: "Painted furniture", date_floor: 1900 },
    ],
    regional_patterns: [
      { region: "Eastern United States", notes: "Extremely common secondary wood." },
    ],
    cousin_species_contrasts: [
      "Use context for identification: poplar appearing as a primary show wood is uncommon. When found on visible surfaces in painted furniture or budget factory production, identification follows from greenish cast and brown mineral streaks. More commonly examined on drawer sides, drawer bottoms, backboards, and internal framing where its diagnostic value as secondary wood is highest.",
    ],
  },
  {
    id: "wood_species_gumwood_group",
    category: "wood_species",
    wood_category_id: "wood_category_diffuse_porous_hardwoods",
    name: "gumwood",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Heavily associated with Colonial Revival, Depression-era production, and faux mahogany furniture. Often stained to imitate more expensive woods.",
    unique_traits: [
      "Inexpensive",
      "Fine grain",
      "Good stain absorption",
      "Easily disguised",
    ],
    identifying_elements: [
      "Bland figure beneath stain",
      "Soft texture",
      "Brown-red stain masking",
    ],
    typical_structural_role: "primary_show",
    period_associations: [
      { period_label: "Colonial Revival dominance", date_floor: 1890, date_ceiling: 1940 },
      { period_label: "Budget factory furniture", date_floor: 1920, date_ceiling: 1950 },
    ],
    regional_patterns: [
      { region: "Southern and Midwestern factories", notes: "Mass production use." },
    ],
    cousin_species_contrasts: [
      "Walnut: gumwood is commonly stained as faux walnut. Gumwood's bland figure beneath stain and softer texture distinguish it from walnut's natural grain and density.",
      "Mahogany: gumwood is commonly stained as faux mahogany. Gumwood lacks mahogany's ribbon stripe figure and shows softer texture beneath stain.",
    ],
  },
  {
    id: "wood_species_sycamore_group",
    category: "wood_species",
    wood_category_id: "wood_category_diffuse_porous_hardwoods",
    name: "sycamore",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Appears less frequently but is notable for dramatic ray fleck, decorative veneer use, and Art Deco and modernist applications.",
    unique_traits: [
      "Lace-like figure",
      "Interlocked grain",
      "Fine texture",
    ],
    identifying_elements: [
      "Speckled lace appearance",
      "Fine reflective shimmer",
      "Light coloration",
    ],
    typical_structural_role: "veneer_only",
    period_associations: [
      { period_label: "Decorative veneer", date_floor: 1880, date_ceiling: 1930 },
      { period_label: "Art Deco", date_floor: 1925, date_ceiling: 1945 },
    ],
  },
  {
    id: "wood_species_pine_group",
    category: "wood_species",
    wood_category_id: "wood_category_softwoods_conifers",
    name: "pine",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Pine is one of the single most important woods in American furniture history. Used in colonial furniture, primitive furniture, painted furniture, secondary structures, rural furniture, blanket chests, case furniture interiors, and architectural furniture. Pine was often used because it was abundant, easy to mill, available in very wide boards, lightweight, and easy to hand tool.",
    unique_traits: [
      "Resinous structure",
      "Strong growth-ring contrast",
      "Soft earlywood",
      "Frequent knotting",
      "Yellowing oxidation",
      "Distinct aroma when cut",
    ],
    identifying_elements: [
      "Amber oxidation with age",
      "Dry resin crystallization on aged surfaces",
      "Surface checking on aged surfaces",
    ],
    cut_specific_identifiers: [
      {
        cut_phenomenon_id: "cut_grain_phenomenon_flat_sawn",
        identifiers: [
          "Strong ring contrast",
          "Wide cathedral grain",
          "Resin pockets",
          "Soft texture",
        ],
      },
    ],
    typical_structural_role: "either",
    period_associations: [
      { period_label: "Primary colonial construction", date_floor: 1600, date_ceiling: 1850 },
      { period_label: "Secondary wood dominance", date_floor: 1800, date_ceiling: 1900 },
      { period_label: "Utility and painted furniture", date_floor: 1900 },
    ],
    regional_patterns: [
      { region: "New England", notes: "Eastern white pine dominance." },
      { region: "Southern States", notes: "Yellow pine dominance." },
      { region: "Appalachian regions", notes: "Rural pine construction." },
    ],
    cousin_species_contrasts: [
      "Hemlock: pine carries higher resin content, amber oxidation, and more consistent ring structure. Hemlock is often confused with pine but shows brittle splintering behavior, coarser grain, and gray-brown oxidation.",
      "Cedar: pine and cedar overlap as light softwoods used in similar furniture roles (case interiors, blanket chests, secondary structures). Cedar's aromatic oils and purple-red coloration distinguish it from pine's resinous structure and amber oxidation.",
    ],
    subspecies: [
      {
        id: "wood_subspecies_eastern_white_pine",
        name: "eastern white pine",
        description:
          "The dominant early American furniture softwood. Common in colonial case furniture, painted furniture, primitive furniture, and New England production.",
        unique_traits: [
          "Lightweight",
          "Cream to amber coloration",
          "Fine even texture",
          "Low resin content",
          "Extremely wide boards historically",
        ],
        identifying_elements: [
          "Subtle grain",
          "Soft tactile surface",
          "Small tight knots",
          "Warm amber aging",
          "Fine annual rings",
        ],
        period_associations: [
          { period_label: "Major colonial usage", date_floor: 1650, date_ceiling: 1850 },
          { period_label: "Secondary wood", date_floor: 1800, date_ceiling: 1900 },
          { period_label: "Rustic reproductions", date_floor: 1900 },
        ],
        regional_patterns: [
          { region: "New England", notes: "Dominant furniture softwood." },
          { region: "New York", notes: "Cabinet interiors." },
        ],
      },
      {
        id: "wood_subspecies_southern_yellow_pine",
        name: "southern yellow pine",
        description:
          "A denser structural pine heavily associated with Southern furniture, utility furniture, industrial furniture, and late factory production.",
        unique_traits: [
          "Heavy density",
          "Strong resin content",
          "Dramatic ring contrast",
          "High structural strength",
        ],
        identifying_elements: [
          "Dark latewood bands",
          "Heavy resin pockets",
          "Orange-brown coloration",
          "Dense weight",
        ],
        period_associations: [
          { period_label: "Southern furniture", date_floor: 1800, date_ceiling: 1900 },
          { period_label: "Structural secondary wood", date_floor: 1880, date_ceiling: 1940 },
          { period_label: "Utility furniture", date_floor: 1900 },
        ],
        regional_patterns: [
          { region: "Southern United States", notes: "Structural dominance." },
          { region: "Midwestern factories", notes: "Secondary wood usage." },
        ],
      },
    ],
  },
  {
    id: "wood_species_cedar_group",
    category: "wood_species",
    wood_category_id: "wood_category_softwoods_conifers",
    name: "cedar",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Strongly associated with blanket chests, hope chests, storage furniture, and aromatic insect-resistant furniture.",
    unique_traits: [
      "Aromatic oils",
      "Insect resistance",
      "Red/purple coloration",
      "Lightweight structure",
      "Straight grain",
    ],
    identifying_elements: [
      "Distinct cedar aroma",
      "Purple-red streaking",
      "Fine straight grain",
      "Lightweight feel",
    ],
    typical_structural_role: "either",
    period_associations: [
      { period_label: "Blanket chest peak", date_floor: 1880, date_ceiling: 1960 },
      { period_label: "Hope chest production", date_floor: 1900, date_ceiling: 1950 },
      { period_label: "Closet/storage use", date_floor: 1900 },
    ],
    regional_patterns: [
      { region: "Midwest", notes: "Cedar chest factory production." },
      { region: "Southern States", notes: "Aromatic cedar availability." },
    ],
    cousin_species_contrasts: [
      "Pine: cedar shows aromatic oils, purple-red coloration, and insect resistance distinct from pine's resinous structure and frequent knotting. Both serve in similar light-softwood roles.",
      "Juniper: cedar and juniper share aromatic oils and red-purple coloration. Cedar shows straighter grain and broader case-furniture usage; juniper shows knot-heavy structure and predominantly rustic Southwestern usage.",
      "Cypress: cedar and cypress overlap as moisture-resistant aromatic softwoods. Cedar shows distinct cedar aroma and purple-red streaking; cypress shows oily greasy feel and pale olive-yellow tone.",
    ],
    subspecies: [
      {
        id: "wood_subspecies_eastern_red_cedar",
        name: "eastern red cedar",
        description:
          "The primary American cedar species used in furniture production, carrying the canonical traits of the Cedar Group.",
        unique_traits: [
          "Strong aroma",
          "Purple-red heartwood",
          "Excellent insect resistance",
        ],
        identifying_elements: [
          "Red-violet streaking",
          "Sharp aromatic scent",
          "Pale sapwood contrast",
        ],
      },
    ],
  },
  {
    id: "wood_species_douglas_fir",
    category: "wood_species",
    wood_category_id: "wood_category_softwoods_conifers",
    name: "douglas fir",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Douglas fir became highly important in Western furniture, Mission furniture, architectural furniture, and utility production. Especially common in western American production.",
    unique_traits: [
      "Exceptional structural strength",
      "Straight grain",
      "Orange-brown coloration",
      "High dimensional stability",
    ],
    identifying_elements: [
      "Strong linear grain",
      "Orange cast",
      "Heavy latewood bands",
      "Dense structural feel",
    ],
    typical_structural_role: "either",
    period_associations: [
      { period_label: "Western furniture production", date_floor: 1880, date_ceiling: 1940 },
      { period_label: "Mission and utility furniture", date_floor: 1900, date_ceiling: 1950 },
      { period_label: "Architectural furniture", date_floor: 1900 },
    ],
    regional_patterns: [
      { region: "Pacific Northwest", notes: "Massive dominance." },
      { region: "California", notes: "Arts & Crafts influence." },
    ],
    cousin_species_contrasts: [
      "Southern yellow pine: Douglas fir and Southern yellow pine overlap as heavy, dense structural softwoods with strong latewood contrast. Douglas fir shows orange-brown coloration with straight linear grain and Pacific Northwest regional dominance; Southern yellow pine shows dramatic ring contrast with heavy resin and Southern regional dominance.",
    ],
  },
  {
    id: "wood_species_redwood",
    category: "wood_species",
    wood_category_id: "wood_category_softwoods_conifers",
    name: "redwood",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Redwood became associated primarily with California Arts & Crafts, outdoor furniture, and Western production traditions.",
    unique_traits: [
      "Decay resistance",
      "Lightweight structure",
      "Red coloration",
      "Soft texture",
    ],
    identifying_elements: [
      "Pink-red coloration",
      "Straight grain",
      "Soft denting surface",
      "Lightweight feel",
    ],
    typical_structural_role: "either",
    period_associations: [
      { period_label: "California Arts & Crafts", date_floor: 1890, date_ceiling: 1930 },
      { period_label: "Outdoor furniture", date_floor: 1900, date_ceiling: 1950 },
      { period_label: "Rustic furniture", date_floor: 1900 },
    ],
    regional_patterns: [
      { region: "California", notes: "Strong regional identity." },
      { region: "Pacific Coast", notes: "Outdoor usage." },
    ],
  },
  {
    id: "wood_species_cypress",
    category: "wood_species",
    wood_category_id: "wood_category_softwoods_conifers",
    name: "cypress",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Cypress was valued for moisture resistance, Southern furniture production, and porch and outdoor furniture.",
    unique_traits: [
      "Rot resistance",
      "Oily texture",
      "Stable structure",
      "Light yellow-brown coloration",
    ],
    identifying_elements: [
      "Slightly greasy feel",
      "Subtle grain",
      "Pale olive-yellow tone",
    ],
    typical_structural_role: "either",
    period_associations: [
      { period_label: "Southern utility furniture", date_floor: 1800, date_ceiling: 1940 },
      { period_label: "Outdoor furniture", date_floor: 1900 },
    ],
    regional_patterns: [
      { region: "Gulf South", notes: "Strong regional use." },
    ],
    cousin_species_contrasts: [
      "Cedar: cypress and cedar overlap as moisture-resistant aromatic softwoods. Cypress shows oily greasy feel and pale olive-yellow tone; cedar shows distinct cedar aroma and purple-red streaking.",
    ],
  },
  {
    id: "wood_species_spruce",
    category: "wood_species",
    wood_category_id: "wood_category_softwoods_conifers",
    name: "spruce",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Spruce appears more frequently in secondary structures, musical instruments, utility furniture, and Northern production.",
    unique_traits: [
      "Lightweight",
      "Elastic structure",
      "Pale coloration",
      "Fine straight grain",
    ],
    identifying_elements: [
      "Cream-white coloration",
      "Uniform grain",
      "Soft denting",
      "Minimal resin pockets",
    ],
    typical_structural_role: "primary_secondary",
    period_associations: [
      { period_label: "Utility construction", date_floor: 1800, date_ceiling: 1900 },
      { period_label: "Interior structural use", date_floor: 1900 },
    ],
    regional_patterns: [
      { region: "Northern United States", notes: "Structural secondary wood." },
    ],
    cousin_species_contrasts: [
      "Hemlock: spruce and hemlock overlap as light structural secondary softwoods. Spruce shows lightweight elastic structure, cream-white coloration, and minimal resin pockets; hemlock shows brittle splintering behavior, coarse grain, and gray-brown oxidation.",
    ],
  },
  {
    id: "wood_species_hemlock",
    category: "wood_species",
    wood_category_id: "wood_category_softwoods_conifers",
    name: "hemlock",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Hemlock was frequently used as secondary structural wood, utility framing, and rural furniture wood. Often confused with pine.",
    unique_traits: [
      "Brittle structure",
      "Splintering behavior",
      "Coarse grain",
      "Lower resin content than pine",
    ],
    identifying_elements: [
      "Gray-brown oxidation",
      "Coarse splintering",
      "Uneven grain contrast",
      "Lightweight structure",
    ],
    typical_structural_role: "primary_secondary",
    period_associations: [
      { period_label: "Rural construction", date_floor: 1800, date_ceiling: 1900 },
      { period_label: "Utility furniture", date_floor: 1880, date_ceiling: 1940 },
    ],
    regional_patterns: [
      { region: "Northeast", notes: "Common structural usage." },
    ],
    cousin_species_contrasts: [
      "Pine: hemlock is often confused with pine but shows brittle splintering behavior, coarser grain, and lower resin content than pine. Hemlock oxidizes to gray-brown rather than pine's amber tone.",
      "Spruce: hemlock and spruce overlap as light structural secondary softwoods. Hemlock shows coarse splintering, gray-brown oxidation, and uneven grain contrast; spruce shows fine straight grain, cream-white coloration, and elastic structure.",
    ],
  },
  {
    id: "wood_species_juniper_cedar_like_softwoods",
    category: "wood_species",
    wood_category_id: "wood_category_softwoods_conifers",
    name: "juniper",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Juniper species occasionally appear in Southwestern furniture, rustic furniture, and cedar-like storage furniture.",
    unique_traits: [
      "Aromatic oils",
      "Knot-heavy structure",
      "Color variation",
    ],
    identifying_elements: [
      "Strong scent",
      "Purple-red streaking",
      "Tight knot clusters",
    ],
    typical_structural_role: "either",
    period_associations: [],
    regional_patterns: [
      { region: "Southwest", notes: "Rustic furniture traditions." },
    ],
    cousin_species_contrasts: [
      "Cedar: juniper and cedar share aromatic oils and red-purple coloration. Juniper shows knot-heavy structure and predominantly rustic Southwestern usage; cedar shows straighter grain and broader case-furniture usage.",
    ],
  },
  {
    id: "wood_species_rosewood_group",
    category: "wood_species",
    wood_category_id: "wood_category_tropical_hardwoods_imported_exotics",
    name: "rosewood",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Rosewood became one of the defining luxury woods of Rococo Revival, Victorian furniture, piano production, fine veneers, Art Deco, and Mid-Century imports. Rosewood was prized for deep coloration, dramatic figure, rich polish, and fragrance when cut.",
    unique_traits: [
      "Dark streaking",
      "Purple-red-brown coloration",
      "Dense oily structure",
      "Exceptional polish response",
      "Strong contrast grain",
    ],
    identifying_elements: [
      "Black streaking",
      "Dramatic ribbon figure",
      "Dense reflective finish",
      "Heavy weight",
      "Oily texture",
    ],
    typical_structural_role: "primary_show",
    period_associations: [
      { period_label: "Victorian luxury dominance", date_floor: 1840, date_ceiling: 1885 },
      { period_label: "Art Deco veneers", date_floor: 1925, date_ceiling: 1945 },
      { period_label: "Scandinavian and MCM imports", date_floor: 1950, date_ceiling: 1970 },
    ],
    regional_patterns: [
      { region: "New York", notes: "Luxury cabinetmaking." },
      { region: "Grand Rapids", notes: "Victorian veneer work." },
      { region: "European imports", notes: "Piano and luxury cabinetry." },
    ],
    cousin_species_contrasts: [
      "Palisander: rosewood and palisander are often used interchangeably commercially. Rosewood shows purple-red-brown coloration with deep streaking and dramatic ribbon figure; palisander shows brown-black striping with fine oily texture.",
      "Kingwood: rosewood and kingwood overlap as luxury veneer banding woods with dark streaking. Rosewood shows purple-red-brown coloration with dramatic ribbon figure; kingwood shows purple-brown coloration with fine black streaking and violet undertones.",
    ],
    subspecies: [
      {
        id: "wood_subspecies_brazilian_rosewood",
        name: "brazilian rosewood",
        description:
          "The premier rosewood species used in luxury furniture production, carrying the canonical traits of the Rosewood Group.",
        unique_traits: [
          "Extremely dense",
          "Purple-black streaking",
          "High luxury status",
        ],
        identifying_elements: [
          "Spider-web grain",
          "Dark dramatic contrast",
          "Rich reflective finish",
        ],
      },
    ],
  },
  {
    id: "wood_species_ebony_group",
    category: "wood_species",
    wood_category_id: "wood_category_tropical_hardwoods_imported_exotics",
    name: "ebony",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Ebony historically represented one of the most elite decorative woods in furniture production. Often used for inlay, trim, piano keys, stringing, decorative contrast, and fine cabinet details. Solid ebony furniture is relatively rare because of cost and density.",
    unique_traits: [
      "Extremely dense",
      "Near-black coloration",
      "Glass-like polish",
      "Minimal visible grain",
    ],
    identifying_elements: [
      "Heavy weight",
      "Smooth reflective surface",
      "Black coloration",
      "Extremely fine texture",
    ],
    typical_structural_role: "veneer_only",
    period_associations: [
      { period_label: "Federal inlay", date_floor: 1700, date_ceiling: 1820 },
      { period_label: "Victorian decorative accents", date_floor: 1840, date_ceiling: 1900 },
      { period_label: "Art Deco contrast work", date_floor: 1925, date_ceiling: 1945 },
    ],
    regional_patterns: [
      { region: "Urban luxury cabinetmaking centers", notes: "Philadelphia, New York, Boston." },
    ],
    cousin_species_contrasts: [
      "Purpleheart: ebony and purpleheart overlap as decorative inlay accent woods of extreme density. Ebony shows near-black coloration with glass-like polish and minimal visible grain; purpleheart shows violet-purple oxidation and fine smooth surface.",
    ],
  },
  {
    id: "wood_species_satinwood_group",
    category: "wood_species",
    wood_category_id: "wood_category_tropical_hardwoods_imported_exotics",
    name: "satinwood",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Satinwood became strongly associated with Federal furniture, Sheraton, Hepplewhite, and fine inlay traditions.",
    unique_traits: [
      "Golden coloration",
      "Reflective shimmer",
      "Fine texture",
      "Decorative brilliance",
    ],
    identifying_elements: [
      "Bright golden tone",
      "Silky reflection",
      "Fine diffuse grain",
    ],
    typical_structural_role: "veneer_only",
    period_associations: [
      { period_label: "Federal peak", date_floor: 1780, date_ceiling: 1820 },
      { period_label: "Revival furniture", date_floor: 1880, date_ceiling: 1910 },
    ],
    regional_patterns: [
      { region: "Federal urban centers", notes: "Philadelphia, Baltimore, Salem." },
    ],
    cousin_species_contrasts: [
      "Tulipwood: satinwood and tulipwood overlap as Federal inlay woods with light decorative tone. Satinwood shows bright golden coloration with silky reflection; tulipwood shows pink-yellow coloration with fine pink striping and satin sheen.",
    ],
  },
  {
    id: "wood_species_zebrawood",
    category: "wood_species",
    wood_category_id: "wood_category_tropical_hardwoods_imported_exotics",
    name: "zebrawood",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Zebrawood became associated primarily with Art Deco, modernist luxury furniture, and high-contrast veneers.",
    unique_traits: [
      "Dramatic stripe pattern",
      "High visual contrast",
      "Coarse texture",
    ],
    identifying_elements: [
      "Dark stripe bands",
      "Pale gold background",
      "Strong linear contrast",
    ],
    typical_structural_role: "veneer_only",
    period_associations: [
      { period_label: "Art Deco", date_floor: 1925, date_ceiling: 1945 },
      { period_label: "Contemporary luxury", date_floor: 1970 },
    ],
    regional_patterns: [
      { region: "Urban luxury production", notes: "Art Deco furniture centers." },
    ],
  },
  {
    id: "wood_species_teak",
    category: "wood_species",
    wood_category_id: "wood_category_tropical_hardwoods_imported_exotics",
    name: "teak",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Teak became one of the defining woods of Scandinavian Modern, Danish Modern, MCM imports, and high-end outdoor furniture.",
    unique_traits: [
      "High oil content",
      "Exceptional stability",
      "Golden-brown coloration",
      "Weather resistance",
    ],
    identifying_elements: [
      "Oily feel",
      "Straight grain",
      "Golden oxidation",
      "Dense smooth texture",
    ],
    typical_structural_role: "primary_show",
    period_associations: [
      { period_label: "Danish/MCM peak", date_floor: 1950, date_ceiling: 1975 },
      { period_label: "Outdoor luxury furniture", date_floor: 1960 },
    ],
    regional_patterns: [
      { region: "Scandinavian imports", notes: "Danish Modern dominance." },
      { region: "West Coast modernism", notes: "Teak popularity." },
    ],
    cousin_species_contrasts: [
      "Mahogany: teak and mahogany overlap as luxury diffuse-porous hardwoods used in fine furniture. Teak shows higher oil content, golden-brown coloration, exceptional weather resistance, and Scandinavian/Danish Modern association; mahogany shows red-brown coloration with characteristic ribbon stripe figure and high-style cabinetmaking tradition.",
    ],
  },
  {
    id: "wood_species_tulipwood",
    category: "wood_species",
    wood_category_id: "wood_category_tropical_hardwoods_imported_exotics",
    name: "tulipwood",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Tulipwood appears primarily in Federal inlay, luxury veneer work, and decorative banding.",
    unique_traits: [
      "Pink-yellow coloration",
      "Fine grain",
      "Decorative contrast",
    ],
    identifying_elements: [
      "Pink striping",
      "Satin sheen",
      "Fine texture",
    ],
    typical_structural_role: "veneer_only",
    period_associations: [
      { period_label: "Federal inlay", date_floor: 1780, date_ceiling: 1820 },
      { period_label: "Revival inlay work", date_floor: 1880, date_ceiling: 1910 },
    ],
    cousin_species_contrasts: [
      "Satinwood: tulipwood and satinwood overlap as Federal inlay woods. Tulipwood shows pink-yellow coloration with fine pink striping; satinwood shows bright golden tone with silky reflection.",
    ],
  },
  {
    id: "wood_species_kingwood",
    category: "wood_species",
    wood_category_id: "wood_category_tropical_hardwoods_imported_exotics",
    name: "kingwood",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Kingwood became associated with French influence, luxury veneer work, and decorative banding.",
    unique_traits: [
      "Purple-brown coloration",
      "Fine black streaking",
      "Dense polish",
    ],
    identifying_elements: [
      "Violet undertones",
      "Fine striping",
      "High reflectivity",
    ],
    typical_structural_role: "veneer_only",
    period_associations: [
      { period_label: "Luxury cabinetry", date_floor: 1750, date_ceiling: 1820 },
      { period_label: "Revival work", date_floor: 1880, date_ceiling: 1910 },
    ],
    cousin_species_contrasts: [
      "Rosewood: kingwood and rosewood overlap as luxury veneer banding woods with dark streaking. Kingwood shows purple-brown coloration with fine black streaking and violet undertones; rosewood shows purple-red-brown coloration with dramatic ribbon figure.",
    ],
  },
  {
    id: "wood_species_padauk",
    category: "wood_species",
    wood_category_id: "wood_category_tropical_hardwoods_imported_exotics",
    name: "padauk",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Padauk appears primarily in decorative accents, modernist furniture, and exotic veneer work.",
    unique_traits: [
      "Bright red-orange coloration",
      "Open grain",
      "Dramatic oxidation shift",
    ],
    identifying_elements: [
      "Intense orange-red tone",
      "Coarse pores",
      "Rapid browning with age",
    ],
    typical_structural_role: "veneer_only",
    period_associations: [
      { period_label: "Decorative exotic usage", date_floor: 1900 },
      { period_label: "MCM accent work", date_floor: 1950, date_ceiling: 1975 },
    ],
  },
  {
    id: "wood_species_palisander",
    category: "wood_species",
    wood_category_id: "wood_category_tropical_hardwoods_imported_exotics",
    name: "palisander",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Palisander is strongly associated with Scandinavian Modern, Danish Modern, and luxury MCM imports. Often used interchangeably with certain rosewoods commercially.",
    unique_traits: [
      "Dark streaking",
      "Ribbon figure",
      "Dense reflective surface",
    ],
    identifying_elements: [
      "Brown-black striping",
      "Fine oily texture",
      "Dramatic veneer movement",
    ],
    typical_structural_role: "primary_show",
    period_associations: [
      { period_label: "Scandinavian Modern peak", date_floor: 1950, date_ceiling: 1975 },
    ],
    cousin_species_contrasts: [
      "Rosewood: palisander is often used interchangeably with certain rosewoods commercially. Palisander shows brown-black striping and fine oily texture; rosewood shows purple-red-brown coloration with deep streaking and dramatic ribbon figure.",
    ],
  },
  {
    id: "wood_species_purpleheart",
    category: "wood_species",
    wood_category_id: "wood_category_tropical_hardwoods_imported_exotics",
    name: "purpleheart",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Purpleheart was used primarily for decorative contrast, exotic accent work, and contemporary studio furniture.",
    unique_traits: [
      "Purple coloration",
      "Extreme density",
      "Fine grain",
    ],
    identifying_elements: [
      "Violet-purple oxidation",
      "Dense structure",
      "Fine smooth surface",
    ],
    typical_structural_role: "veneer_only",
    period_associations: [
      { period_label: "Decorative exotic usage", date_floor: 1900 },
      { period_label: "Studio furniture", date_floor: 1970 },
    ],
    cousin_species_contrasts: [
      "Ebony: purpleheart and ebony overlap as decorative inlay accent woods of extreme density. Purpleheart shows violet-purple oxidation and fine smooth surface; ebony shows near-black coloration with glass-like polish and minimal visible grain.",
    ],
  },
  {
    id: "wood_species_olivewood",
    category: "wood_species",
    wood_category_id: "wood_category_tropical_hardwoods_imported_exotics",
    name: "olivewood",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Olivewood appears primarily in decorative veneer work, Mediterranean-inspired furniture, and luxury accessories.",
    unique_traits: [
      "Dramatic swirling figure",
      "Yellow-brown coloration",
      "Dense oily structure",
    ],
    identifying_elements: [
      "Chaotic brown veining",
      "Golden coloration",
      "Marble-like appearance",
    ],
    typical_structural_role: "veneer_only",
    period_associations: [
      { period_label: "Decorative luxury work", date_floor: 1800 },
    ],
  },
  {
    id: "wood_species_basswood",
    category: "wood_species",
    wood_category_id: "wood_category_diffuse_porous_hardwoods",
    name: "basswood",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Basswood was heavily used for carving substrates, secondary structural components, drawer parts, painted furniture, and low-cost furniture production. Especially valued because of its softness and carving ease.",
    unique_traits: [
      "Extremely soft texture",
      "Fine grain",
      "Lightweight structure",
      "Minimal figure",
      "Excellent carving response",
    ],
    identifying_elements: [
      "Pale cream coloration",
      "Almost featureless grain",
      "Very soft denting",
      "Lightweight feel",
    ],
    typical_structural_role: "primary_secondary",
    period_associations: [
      { period_label: "Carved furniture support", date_floor: 1800, date_ceiling: 1900 },
      { period_label: "Utility furniture", date_floor: 1850, date_ceiling: 1940 },
      { period_label: "Painted furniture", date_floor: 1900 },
    ],
    regional_patterns: [
      { region: "Midwest", notes: "Factory carving support." },
      { region: "New England", notes: "Painted furniture usage." },
    ],
    cousin_species_contrasts: [
      "Aspen: basswood and aspen overlap as pale secondary woods. Basswood shows extremely soft texture with carving suitability and almost featureless grain; aspen shows pale white-gray tone with diffuse subtle grain and soft machining behavior.",
      "Cottonwood: basswood and cottonwood overlap as pale low-cost secondary woods. Basswood shows fine grain and excellent carving response with cream coloration; cottonwood shows woolly/fuzzy cut surface, broad diffuse grain, and lower durability.",
    ],
  },
  {
    id: "wood_species_aspen",
    category: "wood_species",
    wood_category_id: "wood_category_diffuse_porous_hardwoods",
    name: "aspen",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Aspen appears primarily in utility furniture, secondary components, drawer parts, and modern factory production.",
    unique_traits: [
      "Lightweight",
      "Stable",
      "Soft texture",
      "Minimal grain prominence",
    ],
    identifying_elements: [
      "Pale white-gray tone",
      "Diffuse subtle grain",
      "Soft machining behavior",
    ],
    typical_structural_role: "primary_secondary",
    period_associations: [
      { period_label: "Factory utility usage", date_floor: 1900 },
    ],
    regional_patterns: [
      { region: "Northern United States", notes: "Factory furniture production." },
    ],
    cousin_species_contrasts: [
      "Basswood: aspen and basswood overlap as pale secondary woods. Aspen shows pale white-gray tone with diffuse subtle grain; basswood shows extremely soft texture with carving suitability and almost featureless grain.",
      "Cottonwood: aspen and cottonwood overlap as pale utility woods used in secondary components. Aspen shows stable lightweight structure with diffuse subtle grain; cottonwood shows woolly/fuzzy cut surface with broad diffuse grain and lower durability.",
    ],
  },
  {
    id: "wood_species_cottonwood",
    category: "wood_species",
    wood_category_id: "wood_category_diffuse_porous_hardwoods",
    name: "cottonwood",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Cottonwood was commonly used in rural furniture, utility furniture, and hidden secondary construction. Especially where local availability mattered more than durability.",
    unique_traits: [
      "Lightweight",
      "Soft structure",
      "Fuzzy grain response",
      "Low durability",
    ],
    identifying_elements: [
      "Woolly/fuzzy cut surface",
      "Pale coloration",
      "Broad diffuse grain",
    ],
    typical_structural_role: "primary_secondary",
    period_associations: [
      { period_label: "Rural utility production", date_floor: 1800, date_ceiling: 1930 },
    ],
    regional_patterns: [
      { region: "Great Plains", notes: "Local utility wood." },
      { region: "Western regions", notes: "Vernacular usage." },
    ],
    cousin_species_contrasts: [
      "Basswood: cottonwood and basswood overlap as pale low-cost secondary woods. Cottonwood shows woolly/fuzzy cut surface and broad diffuse grain; basswood shows fine grain and excellent carving response.",
      "Aspen: cottonwood and aspen overlap as pale utility woods used in secondary components. Cottonwood shows woolly/fuzzy cut surface with lower durability; aspen shows stable lightweight structure with soft machining behavior.",
    ],
  },
  {
    id: "wood_species_lauan_philippine_mahogany",
    category: "wood_species",
    wood_category_id: "wood_category_tropical_hardwoods_imported_exotics",
    name: "lauan",
    common_aliases: ["philippine mahogany"],
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Lauan became heavily associated with mid-century production, cheap veneer furniture, imported case goods, and postwar furniture. Frequently marketed misleadingly as \"mahogany.\"",
    unique_traits: [
      "Lightweight",
      "Soft tropical structure",
      "Broad grain",
      "Thin veneer compatibility",
    ],
    identifying_elements: [
      "Pink-brown coloration",
      "Bland figure",
      "Open pores",
      "Soft denting",
    ],
    typical_structural_role: "veneer_only",
    period_associations: [
      { period_label: "Budget furniture dominance", date_floor: 1945, date_ceiling: 1980 },
    ],
    regional_patterns: [
      { region: "Imported furniture markets", notes: "Massive postwar usage." },
    ],
    cousin_species_contrasts: [
      "Mahogany: lauan was frequently marketed misleadingly as \"mahogany\" especially in postwar budget furniture. Lauan shows lightweight soft tropical structure, pink-brown coloration, bland figure, and open pores; mahogany shows dense red-brown coloration with characteristic ribbon stripe figure and high-style cabinetmaking tradition.",
    ],
  },
];
export const ENGINEERED_SUBSTRATES: EngineeredSubstrateEntry[] = [
  {
    id: "engineered_substrate_plywood",
    category: "engineered_substrate",
    name: "plywood",
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "Plywood revolutionized furniture production by allowing stable panels, large surfaces, reduced solid wood movement, and thin veneer application. Plywood becomes one of the strongest dating indicators in furniture analysis.",
    unique_traits: [
      "Cross-laminated construction",
      "Layered structure",
      "Dimensional stability",
      "Veneer-faced panels",
    ],
    identifying_elements: [
      "Visible layered edge",
      "Alternating grain direction",
      "Uniform panel thickness",
      "Machine-manufactured appearance",
    ],
    composition_type: "laminated_plies",
    typical_structural_role: "either",
    introduction_anchor: {
      earliest_plausible_year: 1905,
      widespread_adoption_year: 1945,
      dominance_year: 1950,
      confidence_notes:
        "High confidence on 1905 earliest plausible (commercial plywood manufacturing established early 20th century). High confidence on 1945 widespread adoption (post-WWII factory production transformation). dominance_year 1950 reflects File B 'Dominant substrate' common-period entry.",
    },
    anti_classification_guidance: [
      {
        boundary_date: 1905,
        boundary_type: "form_emergence",
        guidance_text:
          "Plywood adoption in furniture begins ~1905. Pre-1905 pieces do not contain plywood. Absence of plywood typically indicates pre-1905 construction, though absence is necessary but not sufficient for pre-1900 dating; verify against other diagnostic markers (fasteners, joinery, oxidation patterns).",
        prominence: "standard",
      },
      {
        boundary_date: 1945,
        boundary_type: "form_emergence",
        guidance_text:
          "Extensive plywood carcass construction (case furniture built primarily of plywood panels rather than solid wood) indicates post-1945 production. Limited plywood panel use 1905-1935 reflects early adoption; extensive carcass use is a strong post-WWII factory production signal.",
        prominence: "standard",
      },
    ],
    period_associations: [
      { period_label: "Early adoption", date_floor: 1905, date_ceiling: 1930 },
      { period_label: "Growing factory use", date_floor: 1930, date_ceiling: 1950 },
      { period_label: "Dominant substrate", date_floor: 1950 },
    ],
    regional_patterns: [
      { region: "National factory production", notes: "Universal adoption post-WWII." },
    ],
    cousin_substrate_contrasts: [
      "Composite veneer cores: both are layered laminated substrates. Plywood typically uses thicker plies and full lumber-quality laminations across the entire panel; composite veneer cores typically use a thin veneer surface over particleboard or MDF cores rather than full plywood beneath.",
    ],
  },
  {
    id: "engineered_substrate_particleboard",
    category: "engineered_substrate",
    name: "particleboard",
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "Particleboard became one of the defining substrate materials of late 20th-century furniture, mass-market furniture, and veneered case goods.",
    unique_traits: [
      "Compressed wood particles",
      "Heavy weight",
      "Weak fastener retention",
      "Extremely flat surfaces",
    ],
    identifying_elements: [
      "Visible wood-chip interior",
      "Crumbly edges",
      "Uniform density",
      "Veneer over artificial core",
    ],
    composition_type: "composite_particle",
    typical_structural_role: "substrate_only",
    introduction_anchor: {
      earliest_plausible_year: 1947,
      widespread_adoption_year: 1950,
      confidence_notes:
        "High confidence. Commercial particleboard manufacturing emerged 1947; mass-market furniture adoption from 1950 forward per File B Common Time Periods.",
    },
    anti_classification_guidance: {
      boundary_date: 1950,
      boundary_type: "form_emergence",
      guidance_text:
        "Particleboard mass-market furniture adoption from 1950 forward (commercial introduction 1947; widespread adoption 1950). Particleboard in any role indicates mass-market production context, typically late 20th-century or later. Pre-1947 pieces do not contain particleboard.",
      prominence: "standard",
    },
    period_associations: [
      { period_label: "Mass-market furniture", date_floor: 1950 },
    ],
    regional_patterns: [
      { region: "Industrialized furniture production", notes: "Universal usage." },
    ],
    cousin_substrate_contrasts: [
      "MDF: both are pressed-fiber engineered substrates. Particleboard shows visible wood chips and crumbly edges; MDF is homogeneous with no visible particles and powdery machined edges.",
    ],
  },
  {
    id: "engineered_substrate_mdf",
    category: "engineered_substrate",
    name: "mdf",
    common_aliases: ["medium-density fiberboard"],
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "MDF became heavily associated with modern furniture, contemporary cabinetry, painted furniture, and machined decorative profiles.",
    unique_traits: [
      "Extremely smooth surface",
      "Homogeneous structure",
      "No visible grain",
      "Excellent machining consistency",
    ],
    identifying_elements: [
      "Powdery machined edges",
      "No natural grain",
      "Uniform brown/tan core",
      "Extremely flat panels",
    ],
    composition_type: "compressed_fiber",
    typical_structural_role: "substrate_only",
    introduction_anchor: {
      earliest_plausible_year: 1970,
      widespread_adoption_year: 1985,
      confidence_notes:
        "High confidence on 1970 earliest plausible (commercial MDF manufacturing emerged late 1960s, furniture adoption from 1970). Widespread cabinetry adoption from 1985 when MDF became default substrate for painted and machined-profile cabinetry.",
    },
    anti_classification_guidance: {
      boundary_date: 1970,
      boundary_type: "form_emergence",
      guidance_text:
        "MDF commercial introduction ~1970. MDF presence is one of the strongest single dating signals in furniture analysis — if catalog or seller claims pre-1970, catalog is wrong. Widespread cabinetry adoption from 1985.",
      prominence: "standard",
    },
    period_associations: [
      { period_label: "Contemporary production", date_floor: 1970 },
    ],
    regional_patterns: [
      { region: "Modern industrial furniture production", notes: "Universal usage." },
    ],
    cousin_substrate_contrasts: [
      "Particleboard: both are pressed-fiber engineered substrates. MDF is homogeneous with no visible particles and powdery machined edges; particleboard shows visible wood chips and crumbly edges.",
    ],
  },
  {
    id: "engineered_substrate_hardboard_masonite",
    category: "engineered_substrate",
    name: "hardboard",
    common_aliases: ["masonite"],
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "Hardboard became common in furniture backs, drawer bottoms, utility panels, and mid-century production.",
    unique_traits: [
      "Thin compressed fiber sheet",
      "Smooth one-sided surface",
      "Flexible structure",
    ],
    identifying_elements: [
      "Dark brown compressed sheet",
      "Uniform thinness",
      "Smooth pressed face",
      "Fibrous reverse side",
    ],
    composition_type: "compressed_fiber",
    typical_structural_role: "substrate_only",
    introduction_anchor: {
      earliest_plausible_year: 1930,
      widespread_adoption_year: 1945,
      confidence_notes:
        "High confidence. Masonite brand patented 1924; commercial furniture adoption from ~1930 per File B Common Time Periods. Widespread post-WWII factory adoption from 1945.",
    },
    anti_classification_guidance: {
      boundary_date: 1930,
      boundary_type: "form_emergence",
      guidance_text:
        "Hardboard (Masonite brand patented 1924, commercial furniture adoption from 1930) appears in furniture backs and drawer bottoms post-1930. Mid-century factory furniture signal. Pre-1930 pieces do not contain hardboard.",
      prominence: "standard",
    },
    period_associations: [
      { period_label: "Furniture backs and panels", date_floor: 1930 },
    ],
    regional_patterns: [
      { region: "National factory production", notes: "Universal use." },
    ],
  },
  {
    id: "engineered_substrate_composite_veneer_cores",
    category: "engineered_substrate",
    name: "composite veneer cores",
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "Composite veneer cores combine thin hardwood veneers, engineered substrates, and stability-oriented construction. Common in MCM, contemporary furniture, and factory cabinetry.",
    unique_traits: [
      "Thin veneer surfaces",
      "Engineered stability",
      "Lightweight panel construction",
    ],
    identifying_elements: [
      "Thin veneer thickness",
      "Uniform substrate beneath veneer",
      "Sharp veneer edge transitions",
    ],
    composition_type: "composite_other",
    typical_structural_role: "veneer_substrate",
    introduction_anchor: {
      earliest_plausible_year: 1945,
      widespread_adoption_year: 1960,
      confidence_notes:
        "Medium confidence — composite veneer core construction is a composite category rather than a single material with sharp introduction date. earliest_plausible_year reflects the postwar era when this construction approach becomes characteristic of MCM and later contemporary factory cabinetry.",
    },
    anti_classification_guidance: {
      boundary_date: 1945,
      boundary_type: "form_emergence",
      guidance_text:
        "Composite veneer cores (engineered substrate base with thin veneer surface) emerge in postwar furniture production ~1945. Characteristic of MCM and later contemporary factory cabinetry. Confidence medium: composite-core construction is a composite category rather than a single material with sharp introduction date.",
      prominence: "standard",
    },
    period_associations: [
      { period_label: "Modern furniture production", date_floor: 1945 },
    ],
    regional_patterns: [
      { region: "Factory production worldwide", notes: "Universal usage." },
    ],
    cousin_substrate_contrasts: [
      "Plywood: both are layered laminated substrates. Composite veneer cores typically have a thin veneer surface over particleboard or MDF cores; plywood uses thicker plies with full lumber-quality laminations across the entire panel.",
    ],
  },
];
export const CUT_GRAIN_PHENOMENA: CutGrainPhenomenonEntry[] = [
  {
    id: "cut_grain_phenomenon_flat_sawn",
    category: "cut_grain_phenomenon",
    name: "flat-sawn",
    common_aliases: ["plain-sawn"],
    phenomenon_type: "cut_orientation",
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "The most common and economical cut. Boards are cut tangentially across growth rings.",
    unique_traits: [
      "Strong cathedral grain",
      "Wide grain variation",
      "Maximum lumber yield",
      "Greater seasonal movement",
    ],
    identifying_elements: [
      "Cathedral arches",
      "Broad grain sweeps",
      "Irregular figure transitions",
    ],
    applicable_species: [
      {
        species_id: "wood_species_oak_group",
        characteristic_expression:
          "Cathedral grain with strong contrast lines; open pores; heavy texture",
      },
      {
        species_id: "wood_species_walnut_group",
        characteristic_expression:
          "Soft flowing cathedral grain; rich brown tone; dark streaking; fine pores",
      },
      {
        species_id: "wood_species_pine_group",
        characteristic_expression:
          "Strong ring contrast; wide cathedral grain; resin pockets; soft texture",
      },
      { species_id: "wood_species_cherry_group" },
      { species_id: "wood_species_mahogany_group" },
    ],
    period_associations: [
      { period_label: "All periods most common furniture cut", date_floor: 1600 },
    ],
  },
  {
    id: "cut_grain_phenomenon_quarter_sawn",
    category: "cut_grain_phenomenon",
    name: "quarter-sawn",
    phenomenon_type: "cut_orientation",
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "Boards cut radially from the log center.",
    unique_traits: [
      "Enhanced ray exposure",
      "Greater stability",
      "Linear grain",
      "Premium milling process",
    ],
    identifying_elements: [
      "Ray fleck",
      "Tight linear grain",
      "Ribbon effects",
      "Reduced cathedraling",
    ],
    applicable_species: [
      {
        species_id: "wood_subspecies_white_oak",
        characteristic_expression:
          "Dramatic silver flake; heavy linear shimmer; ribbon effects; Mission/Arts & Crafts defining signature",
      },
      {
        species_id: "wood_species_sycamore_group",
        characteristic_expression:
          "Lace figure with speckled cellular ray fleck; defining sycamore appearance for Art Deco veneer use",
      },
      {
        species_id: "wood_subspecies_hard_maple_sugar_maple",
        characteristic_expression:
          "Fine quarter-cut grain; subtle ray fleck; less dramatic than oak",
      },
      {
        species_id: "wood_species_walnut_group",
        characteristic_expression:
          "Linear grain; ribbon shimmer; more subdued figure than flat-sawn",
      },
      {
        species_id: "wood_species_douglas_fir",
        characteristic_expression:
          "Vertical grain Douglas fir: tight linear grain; uniform striping; stable structural softwood premium grade",
      },
    ],
    period_associations: [
      { period_label: "Mission / Golden Oak peak", date_floor: 1880, date_ceiling: 1925 },
      { period_label: "Premium cabinetry", date_floor: 1900 },
    ],
    regional_patterns: [
      { region: "Midwest", notes: "Mission furniture dominance." },
    ],
  },
  {
    id: "cut_grain_phenomenon_rift_sawn",
    category: "cut_grain_phenomenon",
    name: "rift-sawn",
    phenomenon_type: "cut_orientation",
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "Boards cut at angled radial orientation minimizing ray fleck.",
    unique_traits: [
      "Extremely straight grain",
      "Minimal fleck",
      "Modern appearance",
    ],
    identifying_elements: [
      "Uniform parallel grain",
      "Tight linear consistency",
    ],
    applicable_species: [
      {
        species_id: "wood_subspecies_white_oak",
        characteristic_expression:
          "Extremely straight uniform grain; minimal ray fleck; modern premium appearance",
      },
      {
        species_id: "wood_species_walnut_group",
        characteristic_expression:
          "Tight linear consistency; reduced cathedraling",
      },
      {
        species_id: "wood_species_oak_group",
        characteristic_expression:
          "Rift cut minimizing the dramatic ray fleck of quarter-sawn",
      },
    ],
    period_associations: [
      { period_label: "Premium modern production", date_floor: 1900 },
    ],
  },
  {
    id: "cut_grain_phenomenon_live_sawn",
    category: "cut_grain_phenomenon",
    name: "live-sawn",
    phenomenon_type: "cut_orientation",
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "Boards cut continuously through the log without separating orientations.",
    unique_traits: [
      "Mixed grain patterns",
      "Cathedral plus vertical grain combinations",
    ],
    identifying_elements: [
      "Simultaneous flat and quarter grain",
      "Broad visual variation",
    ],
    applicable_species: [
      { species_id: "wood_species_oak_group" },
      { species_id: "wood_species_walnut_group" },
      { species_id: "wood_species_maple_group" },
    ],
    period_associations: [
      { period_label: "Contemporary modern slab furniture", date_floor: 1980 },
    ],
  },
  {
    id: "cut_grain_phenomenon_burl",
    category: "cut_grain_phenomenon",
    name: "burl",
    phenomenon_type: "natural_figure",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Chaotic grain growth caused by stress deformation or dormant bud clusters. True burl almost always indicates decorative emphasis rather than structural utility.",
    unique_traits: [
      "Swirling grain",
      "Eye clusters",
      "Chaotic figure",
      "Dense visual complexity",
    ],
    identifying_elements: [
      "Circular eyes",
      "Irregular swirls",
      "No consistent grain direction",
    ],
    applicable_species: [
      {
        species_id: "wood_species_walnut_group",
        characteristic_expression:
          "Dense purple-brown swirls with chaotic eye clusters; defining Victorian luxury burl wood",
      },
      {
        species_id: "wood_species_elm",
        characteristic_expression:
          "Rope-like burl swirling; chaotic eye patterns; rural and vernacular furniture burl use",
      },
      {
        species_id: "wood_species_redwood",
        characteristic_expression:
          "Burl redwood decorative slab use; California Arts & Crafts and modern studio furniture; dense eye patterns",
      },
      {
        species_id: "wood_subspecies_hard_maple_sugar_maple",
        characteristic_expression:
          "Maple burl tight eye clusters; less common than walnut burl",
      },
      {
        species_id: "wood_species_mahogany_group",
        characteristic_expression:
          "Mahogany burl chaotic figure with red-brown tone; luxury veneer applications",
      },
      {
        species_id: "wood_species_teak",
        characteristic_expression:
          "Teak burl chaotic figure; MCM decorative veneer applications",
      },
    ],
    period_associations: [
      { period_label: "Victorian luxury", date_floor: 1840, date_ceiling: 1900 },
      { period_label: "Art Deco", date_floor: 1925, date_ceiling: 1945 },
      { period_label: "Studio furniture", date_floor: 1970 },
    ],
    regional_patterns: [
      { region: "California Arts & Crafts", notes: "Redwood-burl regional concentration." },
    ],
  },
  {
    id: "cut_grain_phenomenon_birdseye",
    category: "cut_grain_phenomenon",
    name: "birdseye",
    common_aliases: ["birdseye maple"],
    phenomenon_type: "natural_figure",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Small clustered figure distortions most commonly associated with maple.",
    unique_traits: [
      "Tiny circular eyes",
      "Dense speckling",
      "Light-reflective movement",
    ],
    identifying_elements: [
      "Small repeating eye clusters",
      "Speckled surface appearance",
    ],
    applicable_species: [
      {
        species_id: "wood_subspecies_hard_maple_sugar_maple",
        characteristic_expression:
          "Tiny clustered circular eyes; dense speckling; light-reflective surface movement; defining birdseye-figure host species",
      },
    ],
    period_associations: [
      { period_label: "Decorative veneers", date_floor: 1880, date_ceiling: 1930 },
      { period_label: "Colonial Revival", date_floor: 1900, date_ceiling: 1950 },
    ],
  },
  {
    id: "cut_grain_phenomenon_curly_figure",
    category: "cut_grain_phenomenon",
    name: "curly figure",
    common_aliases: ["tiger maple", "fiddleback", "curl"],
    phenomenon_type: "natural_figure",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Wave-like fiber distortion creating ribbon movement. Includes the fiddleback variant (tight regular curl associated with musical instrument grade) as a high-intensity expression of the same underlying phenomenon.",
    unique_traits: [
      "Strong chatoyance",
      "Stripe movement",
      "Reflective shimmer",
    ],
    identifying_elements: [
      "Alternating light-dark bands",
      "Ripple movement",
    ],
    applicable_species: [
      {
        species_id: "wood_subspecies_hard_maple_sugar_maple",
        characteristic_expression:
          "Tiger maple defining American figure wood; alternating light-dark bands; ribbon-stripe shimmer; fiddleback variant is dense regular curl musical-instrument-grade",
      },
      {
        species_id: "wood_species_cherry_group",
        characteristic_expression:
          "Curly cherry ripple movement; lower-intensity chatoyance than maple",
      },
      {
        species_id: "wood_species_birch_group",
        characteristic_expression:
          "Subtle curly birch ripple",
      },
      {
        species_id: "wood_species_walnut_group",
        characteristic_expression:
          "Curly walnut ribbon movement",
      },
      {
        species_id: "wood_species_ash",
        characteristic_expression:
          "Curly ash ripple; rare but appears in fine ash furniture",
      },
      {
        species_id: "wood_species_hemlock",
        characteristic_expression:
          "Rare curly hemlock; subtle ripple; decorative use uncommon",
      },
      {
        species_id: "wood_species_poplar_group",
        characteristic_expression:
          "Tulip poplar curl; subtle figure on otherwise plain secondary wood",
      },
      {
        species_id: "wood_species_mahogany_group",
        characteristic_expression:
          "Mahogany fiddleback dense regular curl musical-instrument and luxury veneer grade",
      },
    ],
    period_associations: [
      { period_label: "Federal", date_floor: 1700, date_ceiling: 1820 },
      { period_label: "Revival work", date_floor: 1880, date_ceiling: 1910 },
      { period_label: "Studio furniture", date_floor: 1970 },
    ],
  },
  {
    id: "cut_grain_phenomenon_quilted_figure",
    category: "cut_grain_phenomenon",
    name: "quilted figure",
    phenomenon_type: "natural_figure",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Three-dimensional pillow figure pattern.",
    unique_traits: [
      "Puffy rolling appearance",
      "Deep visual depth",
    ],
    identifying_elements: [
      "Bubble-like figure",
      "Soft rolling movement",
    ],
    applicable_species: [
      {
        species_id: "wood_subspecies_hard_maple_sugar_maple",
        characteristic_expression:
          "Three-dimensional pillow rolling figure; puffy soft movement; modern decorative emphasis",
      },
    ],
    period_associations: [
      { period_label: "Decorative modern work", date_floor: 1960 },
    ],
  },
  {
    id: "cut_grain_phenomenon_flame_figure",
    category: "cut_grain_phenomenon",
    name: "flame figure",
    phenomenon_type: "natural_figure",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Strong vertical moving figure resembling flames.",
    unique_traits: [
      "Elongated movement",
      "Dramatic chatoyance",
    ],
    identifying_elements: [
      "Flame-like reflective movement",
      "Curving ribbon structure",
    ],
    applicable_species: [
      {
        species_id: "wood_species_mahogany_group",
        characteristic_expression:
          "Flame mahogany dramatic vertical movement; chatoyant ribbon structure; defining flame-figure species",
      },
      {
        species_id: "wood_species_walnut_group",
        characteristic_expression:
          "Flame walnut elongated movement; dark dramatic chatoyance",
      },
      {
        species_id: "wood_species_cherry_group",
        characteristic_expression:
          "Flame cherry curving ribbon; lower-intensity than mahogany or walnut",
      },
    ],
    period_associations: [
      { period_label: "Veneer-heavy luxury production", date_floor: 1800, date_ceiling: 1945 },
    ],
  },
  {
    id: "cut_grain_phenomenon_spalted_figure",
    category: "cut_grain_phenomenon",
    name: "spalted figure",
    phenomenon_type: "natural_figure",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Figure caused by fungal activity within the wood. Heavy spalting is usually modern decorative usage rather than antique production.",
    unique_traits: [
      "Black zone lines",
      "Marble-like appearance",
      "Organic patterning",
    ],
    identifying_elements: [
      "Black line networks",
      "Color variation",
      "Irregular organic transitions",
    ],
    applicable_species: [
      {
        species_id: "wood_species_beech_group",
        characteristic_expression:
          "Spalted beech black zone lines with marble-like fungal patterning; modern studio furniture",
      },
      {
        species_id: "wood_species_maple_group",
        characteristic_expression:
          "Spalted maple organic line networks; studio era decorative use",
      },
      {
        species_id: "wood_species_birch_group",
        characteristic_expression:
          "Spalted birch color variation with irregular fungal transitions",
      },
    ],
    period_associations: [
      { period_label: "Studio and artistic furniture", date_floor: 1960 },
    ],
    anti_classification_guidance: {
      boundary_date: 1960,
      boundary_type: "form_emergence",
      guidance_text:
        "Heavy spalting in furniture is post-1960 studio era. Spalted figure on pieces presented as antique production (pre-1960) is a strong false-positive signal — heavy fungal patterning is studio-furniture-only per File B's diagnostic warning.",
      prominence: "standard",
    },
  },
  {
    id: "cut_grain_phenomenon_crotch_figure",
    category: "cut_grain_phenomenon",
    name: "crotch figure",
    phenomenon_type: "natural_figure",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Figure produced where tree limbs diverge from the trunk.",
    unique_traits: [
      "Feather figure",
      "Dramatic veneer symmetry",
      "Flame movement",
    ],
    identifying_elements: [
      "Central feathering",
      "Bookmatched layouts",
    ],
    applicable_species: [
      {
        species_id: "wood_species_walnut_group",
        characteristic_expression:
          "Crotch walnut feather figure with veneer symmetry; Empire and Victorian luxury",
      },
      {
        species_id: "wood_species_mahogany_group",
        characteristic_expression:
          "Crotch mahogany flame movement; bookmatched luxury cabinetry",
      },
      {
        species_id: "wood_species_rosewood_group",
        characteristic_expression:
          "Crotch rosewood feather and flame; Victorian piano and luxury work",
      },
      {
        species_id: "wood_species_satinwood_group",
        characteristic_expression:
          "Crotch satinwood bright reflective movement; Federal inlay luxury",
      },
    ],
    period_associations: [
      { period_label: "Luxury veneer production", date_floor: 1800, date_ceiling: 1945 },
    ],
  },
  {
    id: "cut_grain_phenomenon_pumpkin_pine",
    category: "cut_grain_phenomenon",
    name: "pumpkin pine",
    phenomenon_type: "natural_figure",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Highly oxidized aged eastern white pine. Aging phenomenon rather than growth-irregularity figure; appears on long-aged colonial-era pine surfaces.",
    unique_traits: [
      "Deep orange-amber coloration",
      "Dry surface oxidation",
      "Strong aged patina",
    ],
    identifying_elements: [
      "Warm pumpkin-orange surface tone",
      "Dry resin crystallization on aged surfaces",
      "Strong aged patina indicating extended oxidation",
    ],
    applicable_species: [
      {
        species_id: "wood_subspecies_eastern_white_pine",
        characteristic_expression:
          "Warm pumpkin-orange oxidation from extended aging; dry resin crystallization on aged surfaces; defining aged-colonial-pine signature",
      },
    ],
  },
  {
    id: "cut_grain_phenomenon_heart_pine",
    category: "cut_grain_phenomenon",
    name: "heart pine",
    phenomenon_type: "natural_figure",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Dense old-growth inner southern yellow pine. Tight growth rings and heavy resin saturation distinguish heart pine from younger faster-grown yellow pine.",
    unique_traits: [
      "Tight growth rings",
      "Deep amber-red coloration",
      "Heavy resin saturation",
    ],
    identifying_elements: [
      "Tight growth rings indicating old-growth source",
      "Deep amber-red heartwood coloration",
      "Heavy resin saturation throughout",
    ],
    applicable_species: [
      {
        species_id: "wood_subspecies_southern_yellow_pine",
        characteristic_expression:
          "Tight growth rings indicating old-growth inner pine; deep amber-red coloration; heavy resin saturation; characteristic of Southern furniture and 19th-century structural production",
      },
    ],
    period_associations: [
      { period_label: "Southern furniture old-growth production", date_floor: 1800, date_ceiling: 1900 },
    ],
  },
  {
    id: "cut_grain_phenomenon_pecky_cypress",
    category: "cut_grain_phenomenon",
    name: "pecky cypress",
    phenomenon_type: "natural_figure",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Fungal pocketing creates irregular cavities in cypress wood, producing a distinctive rustic textured appearance valued in decorative work.",
    unique_traits: [
      "Elongated fungal pocket cavities",
      "Rustic texture",
      "Decorative appearance",
    ],
    identifying_elements: [
      "Elongated holes",
      "Rustic textured surface",
      "Decorative pocket patterning",
    ],
    applicable_species: [
      {
        species_id: "wood_species_cypress",
        characteristic_expression:
          "Elongated fungal pocket cavities; rustic textured appearance; Southern rustic furniture use",
      },
    ],
  },
  {
    id: "cut_grain_phenomenon_bear_claw_spruce",
    category: "cut_grain_phenomenon",
    name: "bear claw spruce",
    phenomenon_type: "natural_figure",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Small claw-like grain distortions in spruce associated with instrument-grade decorative furniture use.",
    unique_traits: [
      "Small claw-like distortions",
      "Decorative instrument-grade figure",
    ],
    identifying_elements: [
      "Small claw-like distortions in grain",
      "Decorative figure typical of musical-instrument-grade spruce",
    ],
    applicable_species: [
      {
        species_id: "wood_species_spruce",
        characteristic_expression:
          "Small claw-like grain distortions; decorative musical-instrument-grade rare decorative use",
      },
    ],
  },
  {
    id: "cut_grain_phenomenon_ray_fleck",
    category: "cut_grain_phenomenon",
    name: "ray fleck",
    phenomenon_type: "ray_cellular",
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "Visible medullary rays exposed through quarter-sawing. Heavy ray fleck is strongly associated with quarter-sawn white oak Mission furniture.",
    unique_traits: [
      "Metallic shimmer",
      "Ribbon flecking",
      "Reflective flash",
    ],
    identifying_elements: [
      "Silver fleck",
      "Flake patterns",
      "Cross-grain reflection",
    ],
    applicable_species: [
      {
        species_id: "wood_subspecies_white_oak",
        characteristic_expression:
          "Silver fleck flake patterns; metallic shimmer; ribbon flecking — Mission furniture defining signature",
      },
      {
        species_id: "wood_species_sycamore_group",
        characteristic_expression:
          "Lace fleck speckled cellular pattern; defining sycamore quarter-cut veneer appearance",
      },
      {
        species_id: "wood_species_beech_group",
        characteristic_expression:
          "Small ray fleck; subtle compared to oak or sycamore",
      },
    ],
    period_associations: [
      { period_label: "Mission / Arts & Crafts peak", date_floor: 1880, date_ceiling: 1925 },
    ],
    cousin_phenomenon_contrasts: [
      "Quarter-sawn: ray fleck is the visible cellular result of quarter-sawing in ray-rich species. Ray fleck can be observed on quarter-sawn and rift-sawn cuts; ray fleck and quarter-sawn are independent observations per the Independent Layer Evaluation Standard.",
    ],
  },
  {
    id: "cut_grain_phenomenon_ribbon_stripe",
    category: "cut_grain_phenomenon",
    name: "ribbon stripe",
    phenomenon_type: "ray_cellular",
    positive_authority: 8,
    hard_negative_authority: 8,
    description:
      "Alternating reflective bands caused by interlocked grain.",
    unique_traits: [
      "Parallel shimmer",
      "Directional reflectivity",
    ],
    identifying_elements: [
      "Stripe movement",
      "Alternating light-dark lines",
    ],
    applicable_species: [
      {
        species_id: "wood_species_mahogany_group",
        characteristic_expression:
          "Ribbon stripe mahogany interlocked grain shimmer; defining Federal/Empire luxury figure",
      },
      {
        species_id: "wood_species_rosewood_group",
        characteristic_expression:
          "Ribbon stripe rosewood parallel reflective bands; Victorian and Art Deco luxury",
      },
      {
        species_id: "wood_species_teak",
        characteristic_expression:
          "Ribbon teak linear shimmer; Danish Modern signature figure",
      },
      {
        species_id: "wood_species_palisander",
        characteristic_expression:
          "Palisander ribbon figure parallel chatoyance; MCM luxury imports",
      },
      {
        species_id: "wood_species_zebrawood",
        characteristic_expression:
          "Zebrawood linear stripe contrast; Art Deco luxury veneer",
      },
    ],
    period_associations: [
      { period_label: "Luxury cabinetmaking", date_floor: 1700 },
    ],
  },
  {
    id: "cut_grain_phenomenon_rotary_cut_veneer",
    category: "cut_grain_phenomenon",
    name: "rotary-cut veneer",
    phenomenon_type: "veneer_slicing",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Continuous veneer peeled from rotating log. Heavy rotary veneer usage strongly suggests modern factory production.",
    unique_traits: [
      "Broad sweeping grain",
      "Economical production",
    ],
    identifying_elements: [
      "Very wide grain patterns",
      "Repeating artificial cathedraling",
    ],
    applicable_species: [
      { species_id: "wood_species_oak_group" },
      { species_id: "wood_species_walnut_group" },
      { species_id: "wood_species_mahogany_group" },
      { species_id: "wood_species_birch_group" },
      { species_id: "wood_species_lauan_philippine_mahogany" },
    ],
    applicable_substrates: [
      {
        substrate_id: "engineered_substrate_plywood",
        characteristic_expression:
          "Rotary-cut veneer is the dominant face material on commercial plywood post-1930.",
      },
      {
        substrate_id: "engineered_substrate_composite_veneer_cores",
        characteristic_expression:
          "Rotary-cut veneer faces over composite cores in postwar factory cabinetry.",
      },
    ],
    period_associations: [
      { period_label: "Mass production", date_floor: 1930 },
    ],
    anti_classification_guidance: {
      boundary_date: 1930,
      boundary_type: "form_emergence",
      guidance_text:
        "Rotary-cut veneer commercial emergence ~1930. Pre-1930 furniture does not contain rotary-cut veneer. Heavy rotary veneer use strongly suggests post-1930 modern factory production. Veneer with very wide grain patterns and repeating artificial cathedraling is the rotary-cut signature.",
      prominence: "standard",
    },
  },
  {
    id: "cut_grain_phenomenon_plain_sliced_veneer",
    category: "cut_grain_phenomenon",
    name: "plain-sliced veneer",
    phenomenon_type: "veneer_slicing",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Veneer sliced parallel to growth rings. Mid-19th-century onward commercial veneer technology spanning machine-cut middle-era veneer production through contemporary factory work.",
    unique_traits: [
      "Cathedral veneer grain",
    ],
    identifying_elements: [
      "Symmetrical cathedral layouts",
    ],
    applicable_species: [
      { species_id: "wood_species_oak_group" },
      { species_id: "wood_species_walnut_group" },
      { species_id: "wood_species_mahogany_group" },
      { species_id: "wood_species_cherry_group" },
    ],
    applicable_substrates: [
      { substrate_id: "engineered_substrate_plywood" },
      { substrate_id: "engineered_substrate_composite_veneer_cores" },
    ],
    period_associations: [
      { period_label: "Commercial veneer work", date_floor: 1850 },
    ],
  },
  {
    id: "cut_grain_phenomenon_quarter_sliced_veneer",
    category: "cut_grain_phenomenon",
    name: "quarter-sliced veneer",
    phenomenon_type: "veneer_slicing",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Veneer sliced radially for straight grain.",
    unique_traits: [
      "Linear grain",
      "Fleck exposure",
    ],
    identifying_elements: [
      "Ribbon grain",
      "Straight veneer appearance",
    ],
    applicable_species: [
      {
        species_id: "wood_species_oak_group",
        characteristic_expression:
          "Quarter-sliced oak veneer with ray fleck exposure; premium veneer appearance",
      },
      {
        species_id: "wood_species_mahogany_group",
        characteristic_expression:
          "Quarter-sliced mahogany ribbon grain; straight linear veneer figure",
      },
    ],
  },
  {
    id: "cut_grain_phenomenon_hand_sawn_veneer",
    category: "cut_grain_phenomenon",
    name: "hand-sawn veneer",
    phenomenon_type: "veneer_slicing",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Pre-mechanized veneer cutting; veneer sawn by hand from log boards. Defining Federal-era and earlier veneer technology. Decomposed from File B \"Veneer Thickness Matters\" content per Block 21 D-CG21-5 — thickness is an independent observation; the hand-sawn slicing method is the structurally distinct phenomenon.",
    unique_traits: [
      "Thick veneer (substantially thicker than machine or rotary)",
      "Hand-tool surface traces on veneer back surface",
      "Irregularity in thickness",
      "Pre-1850 veneer signature",
    ],
    identifying_elements: [
      "Thick veneer cross-section",
      "Manual tool marks on back surface",
      "Asymmetric thickness across veneer leaf",
    ],
    applicable_species: [
      { species_id: "wood_species_walnut_group" },
      { species_id: "wood_species_mahogany_group" },
      { species_id: "wood_species_satinwood_group" },
      { species_id: "wood_species_kingwood" },
      { species_id: "wood_species_tulipwood" },
      { species_id: "wood_species_ebony_group" },
    ],
    period_associations: [
      { period_label: "Federal-era luxury veneer work", date_floor: 1700, date_ceiling: 1850 },
    ],
  },
  {
    id: "cut_grain_phenomenon_bookmatching",
    category: "cut_grain_phenomenon",
    name: "bookmatching",
    phenomenon_type: "veneer_slicing",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Sequential veneer leaves mirrored, producing bilateral symmetry across joined veneer faces.",
    unique_traits: [
      "Bilateral symmetry",
      "Butterfly appearance",
    ],
    identifying_elements: [
      "Mirror-image grain",
    ],
    applicable_species: [
      { species_id: "wood_species_walnut_group" },
      { species_id: "wood_species_mahogany_group" },
      { species_id: "wood_species_rosewood_group" },
      { species_id: "wood_species_satinwood_group" },
    ],
    applicable_substrates: [
      { substrate_id: "engineered_substrate_plywood" },
      { substrate_id: "engineered_substrate_composite_veneer_cores" },
    ],
    period_associations: [
      { period_label: "Luxury veneer work", date_floor: 1800 },
    ],
  },
  {
    id: "cut_grain_phenomenon_slip_matching",
    category: "cut_grain_phenomenon",
    name: "slip matching",
    phenomenon_type: "veneer_slicing",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Sequential veneer sheets aligned without mirroring, producing parallel repeating directional grain.",
    unique_traits: [
      "Parallel repeating grain",
    ],
    identifying_elements: [
      "Continuous directional grain",
    ],
    applicable_species: [
      { species_id: "wood_species_oak_group" },
      { species_id: "wood_species_walnut_group" },
      { species_id: "wood_species_mahogany_group" },
      { species_id: "wood_species_teak" },
    ],
    applicable_substrates: [
      { substrate_id: "engineered_substrate_plywood" },
      { substrate_id: "engineered_substrate_composite_veneer_cores" },
    ],
    period_associations: [
      { period_label: "Modern veneer work", date_floor: 1900 },
    ],
  },
  {
    id: "cut_grain_phenomenon_radial_matching",
    category: "cut_grain_phenomenon",
    name: "radial matching",
    phenomenon_type: "veneer_slicing",
    positive_authority: 7,
    hard_negative_authority: 7,
    description:
      "Veneer leaves arranged in circular/sunburst layout from a central point.",
    unique_traits: [
      "Sunburst geometry",
      "Circular symmetry",
    ],
    identifying_elements: [
      "Sunburst layouts",
      "Circular symmetric arrangement",
      "Center-radiating grain direction",
    ],
    applicable_species: [
      { species_id: "wood_species_walnut_group" },
      { species_id: "wood_species_mahogany_group" },
      { species_id: "wood_species_rosewood_group" },
    ],
  },
  {
    id: "cut_grain_phenomenon_chatoyance",
    category: "cut_grain_phenomenon",
    name: "chatoyance",
    phenomenon_type: "optical_effect",
    positive_authority: 6,
    hard_negative_authority: 6,
    description:
      "Shifting reflective movement caused by fiber orientation. Often a property emerging from curly figure, ribbon stripe, ray fleck, and similar grain phenomena; observable across high-quality furniture in many species.",
    unique_traits: [
      "Dynamic light movement",
      "Surface depth illusion",
      "Reflective shimmer",
    ],
    identifying_elements: [
      "\"Moving\" grain appearance",
      "Light-angle shifts",
    ],
    applicable_species: [
      { species_id: "wood_subspecies_hard_maple_sugar_maple" },
      { species_id: "wood_species_mahogany_group" },
      { species_id: "wood_species_walnut_group" },
      { species_id: "wood_species_rosewood_group" },
      { species_id: "wood_species_cherry_group" },
    ],
    period_associations: [
      { period_label: "All periods high-quality furniture", date_floor: 1600 },
    ],
  },
  {
    id: "cut_grain_phenomenon_veneer_thickness",
    category: "cut_grain_phenomenon",
    name: "Veneer thickness",
    common_aliases: [
      "thick veneer",
      "veneer gauge",
      "veneer thickness",
      "heavy veneer",
      "thick-cut veneer",
    ],
    phenomenon_type: "veneer_slicing",
    positive_authority: 7,
    hard_negative_authority: 7,
    description: "Veneer thickness is an independent diagnostic dimension that records how thick the applied veneer layer is, separate from the method used to cut it. Substantially thicker veneer, especially veneer roughly above 1/16 inch, can support older, hand-prepared, early sliced, or premium construction readings when it appears original to the piece. Decomposed from veneer-as-paired-diagnostic content per Block 0.5c D-PH3HCL-S3-N: thickness is the structurally distinct observation, while cut method is captured separately through hand_sawn_veneer, plain_sliced_veneer, rotary_cut_veneer, and related phenomena.",
    unique_traits: [
      "Substantially thicker than modern paper-thin or rotary-cut veneer, often roughly above 1/16 inch when visible at an exposed edge or loss.",
      "Functions as a measurement or observation, not as a slicing method by itself.",
      "Most meaningful when the thick veneer appears original, aged, and integrated with the surrounding construction, finish, and wear.",
      "Often associated with earlier, hand-sawn, early sliced, premium, or labor-intensive veneer work, but not proof of any one cutting method by itself.",
      "Can appear on show surfaces where expensive figured wood was used economically over a less decorative structural substrate.",
    ],
    identifying_elements: [
      "Visible veneer thickness at chips, losses, lifted corners, worn edges, missing veneer patches, drawer-front edges, case-top edges, or exposed cross-sections.",
      "A distinct applied face layer that can be separated visually from the substrate beneath it.",
      "Thickness that appears heavier than modern commercial veneer rather than a paper-thin surface skin.",
      "Age-consistent oxidation, finish wear, glue behavior, and edge wear showing that the veneer has likely been on the piece for a long time.",
      "Best confirmed by comparing exposed edges, damaged corners, under-molding areas, drawer edges, panel edges, and places where veneer has lifted or broken away.",
    ],
    applicable_species: [
      { species_id: "wood_species_walnut_group" },
      { species_id: "wood_species_mahogany_group" },
      { species_id: "wood_species_satinwood_group" },
      { species_id: "wood_species_kingwood" },
      { species_id: "wood_species_tulipwood" },
      { species_id: "wood_species_ebony_group" },
      { species_id: "wood_species_rosewood_group" },
      { species_id: "wood_species_maple_group" },
      { species_id: "wood_species_oak_group" },
    ],
    applicable_substrates: [
      { substrate_id: "engineered_substrate_plywood",
        characteristic_expression: "Use cautiously. Thick veneer over plywood is more likely to indicate later premium construction, repair, or specialty production rather than early hand-sawn veneer work." },
    ],
    period_associations: [
      { period_label: "Pre-mechanized veneer thickness era", date_floor: 1620, date_ceiling: 1850,
        usage_notes: "Thick veneer in this period can support early or hand-prepared construction when it appears original. Before modern commercial thin veneer production, decorative veneer was often sawn or prepared by more labor-intensive methods, which could leave a heavier applied layer than later paper-thin veneer. This is strongest when paired with traditional substrate construction, early joinery, hand-tool marks, old glue behavior, and original surface wear." },
      { period_label: "Transitional thickness era", date_floor: 1850, date_ceiling: 1910,
        usage_notes: "Veneer thickness varies widely during the transition from hand-sawn and shop-prepared veneer toward increasingly mechanized slicing and factory veneer production. Thick veneer may still appear on better-grade furniture, shop-made work, architectural furniture, repair work, or early factory pieces. Interpret thickness with cut method, substrate, adhesive, finish, and construction evidence." },
      { period_label: "Modern thin-veneer dominance with thick-veneer exceptions", date_floor: 1910,
        usage_notes: "After commercial thin veneer and engineered sheet goods become more common, very thick veneer becomes less typical as ordinary mass-production evidence. Thick veneer may still appear in high-quality modern work, restoration, custom furniture, specialty panels, architectural millwork, and repair campaigns. In this period, thick veneer should not automatically imply early manufacture." },
    ],
    regional_patterns: [
      { region: "American urban cabinetmaking centers",
        notes: "Thick decorative veneer is commonly used on finer case goods, desks, tables, clock cases, cabinets, and architectural furniture. Higher-quality examples may show carefully selected figure, bookmatching, crossbanding, inlay, or matched panels. Thicker veneer may appear with traditional substrates, hand-fitted joinery, and older finish systems. Thick veneer in urban cabinetmaking contexts may support a higher-quality or earlier construction reading, especially when paired with hand-cut joinery, early fasteners, and original finish evidence." },
      { region: "American factory furniture regions",
        notes: "Standardized veneer use on case fronts, tops, drawer fronts, panels, and show surfaces. More consistent veneer thickness and repeated production methods. Increasing use of thinner veneer, plywood, and factory-prepared panels over time. Factory veneer should be interpreted by substrate and production method. Thick veneer may indicate better-grade production or earlier factory work, while thin rotary-cut veneer over plywood or sheet goods usually supports a 20th-century or later reading." },
      { region: "Rural, local shop, repair, and restoration contexts",
        notes: "Veneer thickness may vary from piece to piece. Repairs may use whatever veneer material was available. Older furniture may receive newer veneer patches or complete reveneering. Do not treat thick veneer as automatically original. Rural repairs, later restoration, and reused material can create mixed evidence." },
    ],
    diagnostic_caution_text: "Thick veneer is a useful but cautious dating signal. Look for veneer that is visibly thicker than modern paper-thin veneer, often around or above 1/16 inch, especially at chips, losses, lifted corners, worn edges, drawer fronts, case tops, panel edges, and exposed cross-sections. Thick veneer can support an earlier or higher-quality construction reading when it appears original, aged, hand-fitted, and bonded to an older solid-wood or traditional secondary substrate. It is especially helpful when paired with hand-cut joinery, early tool marks, old glue behavior, original finish, oxidation, and consistent wear. Do not classify a thick surface layer as early veneer without confirming that it is a separate applied face and not solid wood, edge banding, laminated plywood, a repair patch, or a later reveneering campaign. Also do not assume all thin veneer is modern or all thick veneer is antique. Thin veneer exists historically, and thick veneer can still appear in premium modern work, restoration, and custom furniture. The app should treat veneer thickness as a supporting clue and should date it through cut method, substrate, adhesive, edge evidence, grain continuity, finish history, and whether the veneer is original to the furniture.",
    cousin_phenomenon_contrasts: [
      "Distinct from hand_sawn_veneer: hand_sawn_veneer identifies the production method used to cut the veneer; veneer_thickness identifies the measured or observed thickness of the veneer layer.",
      "Distinct from plain_sliced_veneer: plain_sliced_veneer identifies a slicing method and grain presentation; veneer_thickness records whether the resulting veneer layer is thick, moderate, or thin.",
      "Distinct from rotary_cut_veneer: rotary_cut_veneer identifies continuous peeling around a log, usually associated with thin commercial veneer and plywood production; veneer_thickness identifies the thickness dimension regardless of whether the veneer is rotary-cut, sliced, or sawn.",
      "Distinct from plywood face veneer: plywood face veneer is part of an engineered sheet-good substrate; thick furniture veneer is an applied decorative or show layer that must be evaluated separately from the underlying core.",
      "Distinct from edge banding: edge banding covers or finishes an exposed edge, while veneer thickness describes the depth of the applied face layer across a broader surface.",
    ],
  },
];
