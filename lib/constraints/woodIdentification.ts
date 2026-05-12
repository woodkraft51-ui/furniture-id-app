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
 * Period association captured at species or subspecies level. Implements the
 * dual-encoding pattern from Block 16 D-WE2: structured numerics
 * (date_floor, optional date_ceiling) for engine filter logic paired with a
 * human-authored period_label string for authoring and report rendering.
 *
 * date_ceiling is optional per D-WS0f; an omitted date_ceiling means the
 * period extends to present. This durable convention avoids the year drift
 * that a fixed sentinel (e.g., 2026) would introduce across audit-log
 * generations.
 *
 * Distinct from the woodEvidence.ts WoodRegionalAssociation pattern: this
 * interface lives in identification because File B's per-species period
 * tables are diagnostic context for identification, not evidence-layer
 * weighting. Evidence-layer period content lands in Block 22.
 */
export interface PeriodAssociation {
  /** Human-authored period label, e.g. "Golden Oak dominance",
   * "Mission/Arts & Crafts peak". Sourced verbatim from File B "Common Time
   * Periods" Usage column. */
  period_label: string;

  /** Earliest year the period applies. Required. */
  date_floor: number;

  /** Latest year the period applies. Optional; omitted means the period
   * extends to present. */
  date_ceiling?: number;

  /** Optional appraiser-voice notes. Omit unless adding value beyond
   * period_label. */
  usage_notes?: string;
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
      "Flat-sawn: cathedral grain",
      "Flat-sawn: strong contrast lines",
      "Flat-sawn: open pores",
      "Flat-sawn: heavy texture",
      "Quarter-sawn (white oak): ray fleck",
      "Quarter-sawn (white oak): ribbon shimmer",
      "Quarter-sawn (white oak): linear grain",
      "Quarter-sawn (white oak): silver flake appearance",
      "End grain: large pores arranged in distinct bands",
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
      "Flat-sawn: soft flowing cathedral grain",
      "Flat-sawn: rich brown tone",
      "Flat-sawn: dark streaking",
      "Flat-sawn: fine pores",
      "Quarter-sawn: linear grain",
      "Quarter-sawn: ribbon shimmer",
      "Quarter-sawn: more subdued figure",
      "Oxidation: deep warm brown darkening with age",
      "Oxidation: often develops amber undertones beneath finish",
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
        description: "Honduran mahogany subspecies of the Mahogany Group.",
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
];
export const ENGINEERED_SUBSTRATES: EngineeredSubstrateEntry[] = [];
export const CUT_GRAIN_PHENOMENA: CutGrainPhenomenonEntry[] = [];
