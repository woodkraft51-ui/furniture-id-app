/**
 * Canonical wood evidence library for Proof Sleuth.
 *
 * Purpose: paired evidence library to woodIdentification.ts. Captures
 * historically-conditioned wood evidence patterns — period associations,
 * regional patterns, usage roles, style-wave associations, secondary
 * pairings, adoption curves, diagnostic signals, and reasoning rules —
 * that condition engine reasoning at the appraisal layer.
 *
 * Relationship to woodIdentification.ts: one-way FK references. Identification
 * entries (species, subspecies, substrates, cut/grain phenomena) provide
 * stable visual/structural identification anchors; evidence entries here
 * reference those anchors via FK and layer historically-conditioned context
 * on top. No reverse references; identification remains period-agnostic.
 *
 * Evidence vs identification semantic distinction:
 * - Identification answers "what is this wood?" — period-agnostic visual
 *   and structural traits.
 * - Evidence answers "what does this wood's presence / role / context tell
 *   us about period, region, style, or economic context?" — historically
 *   conditioned patterns that change with era, place, and manufacturing
 *   context.
 *
 * Independent Layer Evaluation Standard (Session 9 Block 21 D-CG21-2 /
 * D-CG21-17): wood evidence is evaluated independently of other evidence
 * layers (joinery, hardware, construction, upholstery, maker marks, form,
 * style). No layer's evaluation receives priors, candidate seeding, or
 * expectation biasing from any other layer's conclusions. Convergence and
 * conflict between layer assessments is diagnostic information at the final
 * identification integration stage, not bias at the per-layer evaluation
 * stage. This library's reasoning rules (WOOD_EVIDENCE_REASONING_RULES)
 * canonically encode this standard at the wood-evidence layer boundary —
 * notably the "wood alone never dates furniture" meta-rule.
 *
 * Five exported arrays from this file:
 * - SPECIES_EVIDENCE (WoodSpeciesEvidenceEntry): per-species evidence
 *   entries with period, regional, role, style-wave, secondary-pairing,
 *   and anti-classification content. Authority 6/6 per Block 16 D-WE1.
 * - SUBSTRATE_EVIDENCE (SubstrateEvidenceEntry): per-substrate evidence
 *   entries with adoption-curve, period, regional, and role content.
 *   Authority 8/8 per Block 16 D-WE1.
 * - CUT_GRAIN_EVIDENCE (CutGrainEvidenceEntry): composed cut+species
 *   evidence patterns. Authority 7/7 per Block 16 D-WE1.
 * - WOOD_DIAGNOSTIC_SIGNALS (WoodDiagnosticSignalEntry): cross-cutting
 *   multi-FK signal patterns combining species, substrate, cut/grain,
 *   and period dimensions. Authority 7/7 per Block 16 D-WE1.
 * - WOOD_EVIDENCE_REASONING_RULES (WoodEvidenceReasoningRule): meta-rule
 *   entries with migration_target metadata. Authority 9/9 per Block 16
 *   D-WE1.
 *
 * Schema architectural lockwork:
 * - Block 16 D-WE1 through D-WE8 (AUDIT_LOG.md:1314-1324, "Block 22
 *   pre-authored schema decisions"): interface names; array names;
 *   PeriodAssociation reuse from woodIdentification.ts; closed 6-value
 *   regional enum; subspecies handling via optional FK; multi-FK signal
 *   pattern; secondary pairings as field; style wave string tags pending
 *   styleFamilies.ts FK migration; ReasoningRule migration_target enum;
 *   authority calibration.
 * - Block 22 D-WE22-1 through D-WE22-12: field-roster specifics layered
 *   on top of Block 16 lockwork — regional sub-region notes; parallel-
 *   arrays multi-FK shape; anti-classification placement on evidence
 *   side; migration_target enum-only; D-WE22-N prefix convention; usage
 *   role / intensity placement; V-K Veneer Substrates routing; position-
 *   on-piece deferral; broad UsageRole enums per entry type; dual
 *   diagnostic-caution + anti-classification field pattern.
 *
 * Cross-references:
 * - entryShape.ts: CanonicalEntry base interface and shared
 *   AntiClassificationGuidance interface.
 * - woodIdentification.ts: PeriodAssociation interface; NATURAL_WOOD_SPECIES,
 *   ENGINEERED_SUBSTRATES, CUT_GRAIN_PHENOMENA arrays referenced via FK.
 *
 * Canonical source: File A "General Wood Use in Furniture" (737 lines) is
 * primary content source for entries authored in Blocks 23-26. Block 22
 * ships scaffold-only per Block 16 mandate; all 5 arrays empty.
 *
 * Future migrations:
 * - WoodRegion enum may migrate to standalone regions.ts when region-keyed
 *   patterns warrant first-class status.
 * - style_wave_associations strings become FK references when styleFamilies.ts
 *   is authored (Phase 2 Session 9 per project synthesis).
 * - WoodEvidenceReasoningRule.migration_target enum values gain target_file_path
 *   metadata when weightingTable.ts / engineReasoning / report-layer files
 *   exist.
 */

import type { CanonicalEntry, AntiClassificationGuidance, PositionOnPiece } from "./entryShape";
import type { PeriodAssociation } from "./woodIdentification";

/**
 * Closed enum of regional values per Block 16 D-WE3 lockwork. Six top-level
 * American furniture regions providing engine filter semantics. Granular
 * sub-regions (Philadelphia, Newport, Grand Rapids, California Arts & Crafts,
 * Pennsylvania, Gulf South, Cincinnati, etc.) captured via
 * WoodRegionalAssociation.region_notes free-form field per Block 22 D-WE22-1.
 * Migration to standalone regions.ts deferred until region-keyed patterns
 * warrant first-class status.
 */
export type WoodRegion =
  | "new_england"
  | "mid_atlantic"
  | "southern"
  | "midwest"
  | "appalachian"
  | "west_coast";

/**
 * Closed enum for species evidence usage role per Block 22 D-WE22-9. Broad
 * categories for engine filter semantics; canonical specificity captured via
 * WoodSpeciesEvidenceEntry.usage_role_notes free-form field. Distinct from
 * SubstrateUsageRole and CutGrainUsageRole because per-entity usage roles
 * differ semantically (species roles describe show-vs-secondary positioning;
 * substrate roles describe carcass-vs-back-vs-veneer-base positioning;
 * cut/grain roles describe veneer-face-vs-inlay-vs-premium-solid positioning).
 */
export type WoodSpeciesUsageRole =
  | "primary_show_wood"
  | "secondary_structural"
  | "secondary_internal"
  | "veneer"
  | "decorative_accent"
  | "specialized_use";

/**
 * Closed enum for substrate evidence usage role per Block 22 D-WE22-9.
 * Captures where the substrate appears on a piece (case back vs drawer
 * bottoms vs veneer substrate vs carcass panel). Free-form notes via
 * SubstrateEvidenceEntry.usage_role_notes.
 */
export type SubstrateUsageRole =
  | "case_back"
  | "drawer_bottoms"
  | "veneer_substrate"
  | "carcass_panel"
  | "specialized_use";

/**
 * Closed enum for cut/grain phenomenon evidence usage role per Block 22
 * D-WE22-9. Captures whether the phenomenon expresses as veneer face, inlay
 * or banding, premium solid, or decorative accent.
 */
export type CutGrainUsageRole =
  | "veneer_face"
  | "inlay_or_banding"
  | "premium_solid"
  | "decorative_accent"
  | "specialized_use";

/**
 * Migration target enum per Block 16 D-WE8 + Block 22 D-WE22-4. Reasoning
 * rules carry this metadata flagging eventual integration point per the
 * top-down revamp pattern: weighting_file (rules become weight adjustments
 * in the eventual weighting table); engine_reasoning (rules surface in
 * engine reasoning logic); report_layer (rules surface in report composition).
 * Enum-only per D-WE22-4; specific target file paths tracked separately
 * when target files exist (file paths drift, semantic categories don't).
 */
export type ReasoningRuleMigrationTarget =
  | "weighting_file"
  | "engine_reasoning"
  | "report_layer";

/**
 * Usage intensity captures dominance level of wood/substrate/phenomenon in
 * regional or period context. Applied via WoodRegionalAssociation.usage_intensity
 * to flag whether a wood was dominant in a region, commonly used, occasional,
 * or rare. Per Block 22 D-WE22-6 (usage role and intensity as evidence-specific
 * fields).
 */
export type UsageIntensity = "dominant" | "common" | "occasional" | "rare";

/**
 * Regional evidence association — captures wood/substrate/phenomenon regional
 * usage patterns. Per Block 16 D-WE3 (closed regional enum) and Block 22
 * D-WE22-1 (free-form region_notes for granular sub-regions).
 *
 * Distinct from woodIdentification.ts RegionalPattern (free-form region:
 * string) because evidence-side regional content requires closed enum filter
 * semantics for engine reasoning, while identification-side captures File B's
 * varied regional headers verbatim. Example: WoodRegion "new_england" with
 * region_notes "Newport luxury cabinetmaking; Rhode Island Townsend-Goddard
 * school" captures sub-regional specificity inside the enum-anchored region.
 *
 * Supporting interface; does NOT extend CanonicalEntry (not a top-level entry
 * type). Used as field type on WoodSpeciesEvidenceEntry, SubstrateEvidenceEntry,
 * CutGrainEvidenceEntry, and WoodDiagnosticSignalEntry.
 */
export interface WoodRegionalAssociation {
  /** Top-level region per Block 16 D-WE3 closed enum. */
  region: WoodRegion;

  /** Free-form sub-region prose for canonical specificity (Philadelphia,
   * Newport, Grand Rapids, California Arts & Crafts, etc.) per D-WE22-1. */
  region_notes?: string;

  /** Optional usage intensity in this region per D-WE22-6. */
  usage_intensity?: UsageIntensity;

  /** Optional regional-specific identifying traits. */
  traits?: string[];

  /** Optional appraiser-voice notes for the region. */
  notes?: string;
}

/**
 * Species-level evidence entry — captures historically-conditioned period,
 * regional, role, style-wave, and secondary-pairing patterns for a wood
 * species. Keyed to NATURAL_WOOD_SPECIES.id via species_id FK. Subspecies-
 * level patterns via optional subspecies_id FK per Block 16 D-WE4.
 *
 * Authority calibration: positive_authority 6, hard_negative_authority 6 per
 * Block 16 D-WE1 lockwork. Deliberately lower than identification-side
 * species' 7/7 because evidence entries structurally encode "wood alone never
 * dates furniture" at the weight layer (see WoodEvidenceReasoningRule for the
 * canonical encoding of this meta-principle as a reasoning rule).
 *
 * Anti-classification placement per Block 22 D-WE22-3: tropical species CITES
 * trade restrictions (Brazilian Rosewood Dalbergia nigra CITES Appendix I
 * 1992; Cuban Mahogany trade restrictions; ebony trade restrictions per Block
 * 19 D-WS19-11 routing) populate this evidence-side field, not identification-
 * side WoodSpeciesEntry.anti_classification_guidance. Trade restrictions are
 * evidence-layer content (they condition what woods can plausibly appear in
 * claimed-period furniture); identification-side visual identification is
 * unaffected by trade restrictions.
 *
 * Dual diagnostic-context fields per Block 22 D-WE22-10: diagnostic_caution_text
 * (prose appraiser-knowledge framing) AND anti_classification_guidance
 * (structured chronological boundary semantics). File A's "Notes / Diagnostic
 * Caution" column prose doesn't fit chronological-boundary shape but IS
 * canonical evidence-weighting context.
 *
 * Canonical source (Blocks 23-25 authoring): File A "Primary Furniture Woods
 * by General Use" table + Chronological Breakdown sections + Regional Wood
 * Breakdown sections + File B residual period/regional content stripped from
 * identification entries during extraction.
 */
export interface WoodSpeciesEvidenceEntry extends CanonicalEntry {
  category: "wood_species_evidence";

  /** FK to NATURAL_WOOD_SPECIES.id in woodIdentification.ts. */
  species_id: string;

  /** Optional FK to nested subspecies id when subspecies-level evidence
   * differs from parent species (Block 16 D-WE4 authoring rule). */
  subspecies_id?: string;

  /** Period associations sourced from File A chronological breakdown
   * content. Reuses PeriodAssociation from woodIdentification.ts:109-125
   * per Block 16 D-WE2. */
  period_associations: PeriodAssociation[];

  /** Regional associations sourced from File A regional breakdown content. */
  regional_associations: WoodRegionalAssociation[];

  /** Primary usage role(s) for this species per Block 22 D-WE22-9 broad
   * closed enum. Array form supports species used in multiple roles
   * (e.g., walnut as both primary_show_wood and veneer). */
  usage_role: WoodSpeciesUsageRole | WoodSpeciesUsageRole[];

  /** Free-form canonical specificity beyond the closed enum per D-WE22-9. */
  usage_role_notes?: string;

  /** Typical secondary woods paired with this species per Block 16 D-WE6.
   * Manually authored on both sides of pairing; no auto-mirror schema.
   * Values are species ids from NATURAL_WOOD_SPECIES. */
  typical_secondary_pairings?: string[];

  /** Style-wave association tags per Block 16 D-WE7 (string tags now;
   * FK references when styleFamilies.ts is authored). */
  style_wave_associations?: string[];

  /** Optional anti-classification guidance per Block 22 D-WE22-3.
   * Single-or-array shape per Block 20 D-ES20-6 / Block 21 D-CG21-11
   * precedent. Tropical species CITES restrictions populate here in
   * Block 23b per D-WS19-11 + Block 23a D-WE23a-10 routing. */
  anti_classification_guidance?: AntiClassificationGuidance | AntiClassificationGuidance[];

  /**
   * Optional: position-on-piece annotations per Block 22.5 D-PA-1
   * PositionOnPiece interface. First canonical consumption per Block 22
   * D-WE22-8 deferral framing. Per Block 23a D-WE23a-3 consumption
   * discipline: populated only on species where File A Section 6
   * "Hidden Secondary Woods by Era" surfaces explicit position-evidence
   * content (walnut + poplar drawer sides; mahogany + pine secondary;
   * oak Mission cabinet + poplar internals). Default omitted.
   */
  position_on_piece?: PositionOnPiece[];

  /** Prose appraiser-knowledge framing per Block 22 D-WE22-10. Captures
   * File A "Notes / Diagnostic Caution" column content that doesn't fit
   * structured chronological-boundary shape. */
  diagnostic_caution_text?: string;
}

/**
 * Substrate evidence entry — captures adoption curves, period associations,
 * regional patterns, and usage roles for engineered substrates. Keyed to
 * ENGINEERED_SUBSTRATES.id via substrate_id FK.
 *
 * Authority calibration: positive_authority 8, hard_negative_authority 8 per
 * Block 16 D-WE1 lockwork. Substrate adoption curves are technology-anchored
 * and more chronologically diagnostic than species-level evidence; substrate
 * emergence dates (plywood 1905; particleboard 1947; MDF 1970; hardboard
 * 1930; composite veneer cores 1945) carry sharper period semantics than
 * species presence alone.
 *
 * adoption_curve field shape mirrors identification-side
 * EngineeredSubstrateEntry.introduction_anchor (woodIdentification.ts:404-409)
 * but is semantically distinct: identification-side captures the chronological
 * anchor as identification context; evidence-side captures the adoption curve
 * as evidence-weighting signal. The structural duplication is intentional —
 * the two libraries each carry their own copy for their respective layer
 * semantics.
 *
 * Canonical source (Block 23 authoring): File A primary substrate rows
 * (Plywood, Hardboard/Masonite, Particleboard, MDF) + File B residual
 * substrate content.
 */
export interface SubstrateEvidenceEntry extends CanonicalEntry {
  category: "substrate_evidence";

  /** FK to ENGINEERED_SUBSTRATES.id in woodIdentification.ts. */
  substrate_id: string;

  /** Technology-introduction adoption-curve metadata. Inline shape mirrors
   * EngineeredSubstrateEntry.introduction_anchor in identification-side
   * library; semantically distinct (evidence-weighting signal vs
   * identification context). */
  adoption_curve: {
    earliest_plausible_year: number;
    widespread_adoption_year: number;
    dominance_year?: number;
    confidence_notes?: string;
  };

  /** Period associations sourced from File A chronological content. */
  period_associations: PeriodAssociation[];

  /** Optional regional associations — most substrates have minimal regional
   * differentiation (industrial production rather than regional craft
   * traditions). */
  regional_associations?: WoodRegionalAssociation[];

  /** Primary usage role(s) for this substrate per Block 22 D-WE22-9. */
  usage_role: SubstrateUsageRole | SubstrateUsageRole[];

  /** Free-form canonical specificity beyond the closed enum per D-WE22-9. */
  usage_role_notes?: string;

  /** Prose appraiser-knowledge framing per Block 22 D-WE22-10. */
  diagnostic_caution_text?: string;
}

/**
 * Cut/grain phenomenon evidence entry — captures composed cut+species
 * patterns that carry stronger evidence weight than species or phenomenon
 * alone. Keyed to CUT_GRAIN_PHENOMENA.id via cut_phenomenon_id FK with
 * optional species_id / subspecies_id FKs for species-composed expressions
 * (e.g., quarter-sawn white oak as Mission/Arts & Crafts marker).
 *
 * Authority calibration: positive_authority 7, hard_negative_authority 7 per
 * Block 16 D-WE1 lockwork. Composed cut+species patterns are stronger
 * evidence than species alone but weaker than substrate adoption curves
 * (which have sharper chronological floors).
 *
 * Canonical source (Block 24 authoring): File A "Key Chronological Wood
 * Signals" table (Quarter-sawn white oak; Heavy ray fleck; Thick walnut
 * veneer; etc.) + File B Cat VI period associations stripped during
 * identification extraction.
 */
export interface CutGrainEvidenceEntry extends CanonicalEntry {
  category: "cut_grain_evidence";

  /** FK to CUT_GRAIN_PHENOMENA.id in woodIdentification.ts. */
  cut_phenomenon_id: string;

  /** Optional FK to species id for species-composed expressions. */
  species_id?: string;

  /** Optional FK to subspecies id for subspecies-composed expressions
   * (e.g., quarter-sawn white oak specifically). */
  subspecies_id?: string;

  /** Period associations sourced from File A + File B Cat VI residual
   * content. */
  period_associations: PeriodAssociation[];

  /** Optional regional associations. */
  regional_associations?: WoodRegionalAssociation[];

  /** Optional usage role(s) per Block 22 D-WE22-9. */
  usage_role?: CutGrainUsageRole | CutGrainUsageRole[];

  /** Free-form canonical specificity beyond the closed enum per D-WE22-9. */
  usage_role_notes?: string;

  /** Style-wave association tags per Block 16 D-WE7. */
  style_wave_associations?: string[];

  /** Prose appraiser-knowledge framing per Block 22 D-WE22-10. */
  diagnostic_caution_text?: string;
}

/**
 * Cross-cutting diagnostic signal entry — captures composed multi-entity
 * signal patterns that involve combinations of species, substrates, cut/grain
 * phenomena, and periods. Multi-FK references via parallel arrays per Block
 * 22 D-WE22-2 (chosen over structured object or polymorphic refs for
 * TypeScript type safety and engine filter semantics; handles variance from
 * 1-entity signals to 3+ entity signals cleanly).
 *
 * Authority calibration: positive_authority 7, hard_negative_authority 7 per
 * Block 16 D-WE1 lockwork. Composed multi-entity signals carry equivalent
 * weight to cut/grain evidence — both capture composed cross-dimensional
 * patterns stronger than single-axis evidence.
 *
 * Canonical sources (Block 24 authoring):
 * - File A "Key Chronological Wood Signals" table: e.g., "Thin walnut veneer
 *   over plywood → MCM" (walnut species + veneer-slicing phenomenon + plywood
 *   substrate); "Quarter-sawn white oak → Mission/Golden Oak" (white oak
 *   subspecies + quarter-sawn phenomenon).
 * - V-K Veneer Substrates content (Block 21 D-CG21-4 routing) per Block 22
 *   D-WE22-7: multi-era backing-material content (hand-sawn solid 1700-1850
 *   → lumber-core 1850-1930 → plywood-core 1905+ → MDF/particleboard-core
 *   1970+) authored here as veneer-cut + substrate + era composed signals.
 */
export interface WoodDiagnosticSignalEntry extends CanonicalEntry {
  category: "wood_diagnostic_signal";

  /** Concise human-authored signal description (e.g., "Thin walnut veneer
   * over plywood"). */
  signal_description: string;

  /** Diagnostic meaning of the signal (e.g., "Indicates Mid-Century Modern
   * production, post-1945"). */
  diagnostic_meaning: string;

  /** Optional involved species ids (FKs to NATURAL_WOOD_SPECIES). Parallel
   * arrays multi-FK shape per Block 22 D-WE22-2. */
  involved_species?: string[];

  /** Optional involved substrate ids (FKs to ENGINEERED_SUBSTRATES). */
  involved_substrates?: string[];

  /** Optional involved cut/grain phenomenon ids (FKs to CUT_GRAIN_PHENOMENA). */
  involved_phenomena?: string[];

  /** Optional period label tag for engine filter semantics. */
  involved_period_label?: string;

  /** Optional period associations carrying full PeriodAssociation shape
   * (for signals with structured chronological semantics). */
  period_associations?: PeriodAssociation[];

  /** Optional regional associations. */
  regional_associations?: WoodRegionalAssociation[];

  /** Style-wave association tags per Block 16 D-WE7. */
  style_wave_associations?: string[];

  /** Optional confidence notes for signals with epistemic uncertainty. */
  confidence_notes?: string;
}

/**
 * Meta-rule entry — captures appraiser-knowledge reasoning principles that
 * condition all wood-evidence weighting. Examples: "Wood alone should NEVER
 * date furniture"; "Visible wood ≠ structural wood"; "Secondary woods often
 * carry higher dating authority than show wood."
 *
 * Authority calibration: positive_authority 9, hard_negative_authority 9 per
 * Block 16 D-WE1 lockwork. Meta-rules condition all other weighting; highest
 * authority in the wood evidence library reflects the canonical-principle
 * nature of these rules.
 *
 * migration_target field per Block 16 D-WE8 + Block 22 D-WE22-4 (enum-only,
 * no file path) flags eventual integration point: weighting_file (rules
 * become weight adjustments in the eventual weighting table);
 * engine_reasoning (rules surface in engine reasoning logic); report_layer
 * (rules surface in report composition).
 *
 * cross_layer_scope flag distinguishes rules that govern reasoning across
 * all evidence libraries (the "wood alone never dates furniture" canonical
 * encoding of Mike's Independent Layer Evaluation Standard, Session 9 Block
 * 21 D-CG21-2 / D-CG21-17) from rules that govern only wood-evidence-layer
 * reasoning.
 *
 * Canonical sources (Block 26 authoring):
 * - File A "Important Caveat" section (canonical anchor for "wood alone
 *   never dates furniture" meta-rule).
 * - File A "Hidden Secondary Woods by Era" section (canonical anchor for
 *   "secondary woods often more diagnostic" meta-rule).
 * - File B Cat VI "Critical Diagnostic Principles" content per Block 21
 *   D-CG21-17 routing ("Figure Alone Should Not Date Furniture"; "Veneer
 *   Geometry Often Reveals Era"; "Figure Can Create False Positives";
 *   "Certain Figures Are Extremely Period-Specific"; "Figure Often Indicates
 *   Quality Tier").
 */
export interface WoodEvidenceReasoningRule extends CanonicalEntry {
  category: "wood_evidence_reasoning_rule";

  /** Short canonical name for the rule (e.g., "wood_alone_never_dates"). */
  rule_name: string;

  /** Canonical rule statement (e.g., "Wood alone should NEVER date
   * furniture"). */
  rule_statement: string;

  /** Appraiser-voice rationale explaining why the rule holds and how it
   * conditions evidence weighting. */
  rationale: string;

  /** Eventual integration point per Block 16 D-WE8 + Block 22 D-WE22-4. */
  migration_target: ReasoningRuleMigrationTarget;

  /** Optional list of entry types this rule conditions (e.g.,
   * ["wood_species_evidence", "substrate_evidence"]). */
  applies_to_entry_types?: string[];

  /** True for rules that govern reasoning across all evidence libraries
   * (canonical encoding of Independent Layer Evaluation Standard). False
   * or omitted for wood-evidence-only rules. */
  cross_layer_scope?: boolean;
}

/**
 * Per-species evidence entries. Canonical source: File A Primary Furniture
 * Woods by General Use table + Chronological Breakdown + Regional Wood
 * Breakdown. Authored in Blocks 23-25.
 */
export const SPECIES_EVIDENCE: WoodSpeciesEvidenceEntry[] = [
  // ─────────────────────────────────────────────────────────────
  // CATEGORY I — Ring-Porous (4 entries)
  // ─────────────────────────────────────────────────────────────
  {
    id: "wood_species_evidence_oak_group",
    category: "wood_species_evidence",
    species_id: "wood_species_oak_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Pilgrim/Early Colonial structural joined", date_floor: 1620, date_ceiling: 1700,
        usage_notes: "Heavy joined furniture; massive timber members; mortise-and-tenon dominant. Oak favored for durability and availability." },
      { period_label: "William and Mary continuing structural use", date_floor: 1680, date_ceiling: 1730,
        usage_notes: "Maple/oak combinations in New England." },
      { period_label: "Eastlake/Aesthetic/Golden Oak dominance", date_floor: 1875, date_ceiling: 1910,
        usage_notes: "Oak overtakes walnut as dominant fashion wood. Machine carving suited oak grain. Golden Oak wave strongest 1880-1915." },
      { period_label: "Mission/Arts & Crafts peak", date_floor: 1895, date_ceiling: 1925,
        usage_notes: "Quarter-sawn white oak became almost synonymous with Mission production. Stickley/Roycroft sphere." },
      { period_label: "Tudor/Jacobean Revival recurring use", date_floor: 1920, date_ceiling: 1940,
        usage_notes: "Revival wave per File A Section 5." },
      { period_label: "Colonial Revival and mass-market oak", date_floor: 1950, date_ceiling: 1980,
        usage_notes: "Mass-market reproduction use." },
    ],
    regional_associations: [
      { region: "new_england", usage_intensity: "common",
        traits: ["early joined furniture", "conservative wood use"],
        notes: "File A Section 3 Pilgrim/Early Colonial New England." },
      { region: "mid_atlantic", usage_intensity: "common",
        traits: ["Dutch areas: oak with walnut combinations"] },
      { region: "midwest", usage_intensity: "dominant",
        traits: ["Golden Oak dominance", "factory production centers Grand Rapids, Chicago, Rockford, Indiana"],
        notes: "Eastlake/Golden Oak era dominance." },
      { region: "west_coast", usage_intensity: "common",
        traits: ["Arts & Crafts influence"] },
    ],
    usage_role: ["primary_show_wood", "secondary_structural"],
    usage_role_notes: "Structural casework, chairs, Mission furniture. Dual role: primary show wood in Mission/Golden Oak; structural casework foundation in colonial period.",
    typical_secondary_pairings: ["wood_species_poplar_group"],
    style_wave_associations: ["colonial", "william_and_mary", "eastlake_aesthetic", "golden_oak", "mission_arts_and_crafts", "colonial_revival"],
    position_on_piece: [
      {
        physical_location: "case_interior_framing",
        functional_role: "hidden_interior",
        provenance: "original_to_construction",
        consistency_pattern: "repeated_consistently_across_piece",
        temporal_layer: "frame_construction",
        position_context_evidence: ["Oak Mission cabinet show surface with poplar internals (File A Section 6)"],
        notes: "Oak as primary show wood pairs with poplar at case_interior_framing in Mission cabinets per File A Section 6 Hidden Secondary Woods by Era.",
      },
    ],
    diagnostic_caution_text: "Oak is diagnostically strongest when paired with construction evidence: early joined oak, quarter-sawn Golden Oak, Mission/Arts & Crafts, or revival oak. Per File A Important Caveat: wood alone should never date furniture; oak evidence is supporting, regional, economic, and style-reinforcement evidence.",
  },
  {
    id: "wood_subspecies_evidence_white_oak",
    category: "wood_species_evidence",
    species_id: "wood_species_oak_group",
    subspecies_id: "wood_subspecies_white_oak",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Golden Oak quarter-sawn premium indicator", date_floor: 1880, date_ceiling: 1915,
        usage_notes: "Quarter-sawn white oak becomes premium indicator. Heavy ray fleck is key identifier per File A Section 3." },
      { period_label: "Mission/Arts & Crafts central identity", date_floor: 1895, date_ceiling: 1925,
        usage_notes: "Almost synonymous with Mission production. Fumed oak common; quarter-sawn dominant in Stickley/Roycroft sphere." },
      { period_label: "Mission Revival", date_floor: 1980, date_ceiling: 2010,
        usage_notes: "Per File A Section 5 Major Revival Waves." },
    ],
    regional_associations: [
      { region: "midwest", usage_intensity: "dominant",
        traits: ["White oak dominance", "Stickley influence"],
        notes: "Mission/Arts & Crafts Midwest dominance per File A Section 3." },
    ],
    usage_role: "primary_show_wood",
    usage_role_notes: "Quarter-sawn white oak as Mission/Golden Oak identity wood. Heavy ray fleck visible on show surfaces.",
    style_wave_associations: ["golden_oak", "mission_arts_and_crafts"],
    diagnostic_caution_text: "Quarter-sawn white oak's heavy ray fleck is the key identifier (File A Section 3). Subspecies-level diagnostic distinct from oak_group: parent oak entry covers multiple eras; white_oak entry specifically encodes the Mission/Golden Oak quarter-sawn dominance signature.",
  },
  {
    id: "wood_species_evidence_ash",
    category: "wood_species_evidence",
    species_id: "wood_species_ash",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Bentwood and chair production", date_floor: 1850, date_ceiling: 1930,
        usage_notes: "Bentwood chairs and factory chair production." },
      { period_label: "Utility furniture", date_floor: 1900, date_ceiling: 1940,
        usage_notes: "General utility production." },
      { period_label: "Scandinavian-influenced seating", date_floor: 1950, date_ceiling: 1970,
        usage_notes: "MCM Scandinavian-influenced seating per File A Section 3 Mid-Century Modern." },
      { period_label: "Continued present-day seating, utility, rustic", date_floor: 1970, date_ceiling: 2026,
        usage_notes: "Ongoing seating and rustic use." },
    ],
    regional_associations: [
      { region: "midwest", usage_intensity: "common",
        traits: ["factory production"],
        notes: "Eastlake/Golden Oak era ash production." },
    ],
    usage_role: ["primary_show_wood", "secondary_structural"],
    usage_role_notes: "Chairs and bentwood as primary show wood; utility furniture as secondary.",
    style_wave_associations: ["eastlake_aesthetic", "mid_century_modern"],
    diagnostic_caution_text: "Similar to oak in open grain but usually lighter, straighter, less ray-flecked, and more elastic. Distinct from oak through reduced ray fleck; useful for differentiating bentwood ash from quarter-sawn white oak in chair-frame contexts.",
  },
  {
    id: "wood_species_evidence_elm",
    category: "wood_species_evidence",
    species_id: "wood_species_elm",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Windsor seating", date_floor: 1700, date_ceiling: 1850,
        usage_notes: "Interlocked grain split resistance critical for Windsor seat blanks." },
      { period_label: "Utility furniture", date_floor: 1800, date_ceiling: 1900,
        usage_notes: "General utility forms." },
      { period_label: "Rural persistence", date_floor: 1900, date_ceiling: 1930,
        usage_notes: "Occasional later craft use." },
    ],
    regional_associations: [
      { region: "appalachian", usage_intensity: "common",
        traits: ["rural persistence of older forms"] },
    ],
    usage_role: ["primary_show_wood", "specialized_use"],
    usage_role_notes: "Windsor seats as primary show wood; split-resistance specialty role for seat blanks and durable utility forms.",
    style_wave_associations: ["colonial"],
    diagnostic_caution_text: "Interlocked grain, split resistance, rope-like grain. Especially diagnostic in Windsor seating context where the interlocked grain's split resistance was structurally necessary.",
  },
  // ─────────────────────────────────────────────────────────────
  // CATEGORY II + V NATURALS — Diffuse-Porous (11 entries)
  // ─────────────────────────────────────────────────────────────
  {
    id: "wood_species_evidence_walnut_group",
    category: "wood_species_evidence",
    species_id: "wood_species_walnut_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Pilgrim/Early Colonial Mid-Atlantic Dutch and Southern colonies use", date_floor: 1620, date_ceiling: 1700,
        usage_notes: "Mid-Atlantic Dutch areas: oak and walnut; Southern colonies: walnut and pine." },
      { period_label: "William and Mary Philadelphia walnut sophistication", date_floor: 1680, date_ceiling: 1730,
        usage_notes: "Philadelphia became increasingly associated with walnut sophistication." },
      { period_label: "Queen Anne/Early Chippendale fine regional cabinetmaking", date_floor: 1700, date_ceiling: 1820,
        usage_notes: "Pennsylvania German walnut; fine regional cabinetmaking." },
      { period_label: "Victorian walnut dominance", date_floor: 1840, date_ceiling: 1885,
        usage_notes: "Single largest walnut era in American furniture history. Factory production increases; thick veneer usage; massive carved walnut production. Burled walnut + ebonized trim common." },
      { period_label: "Renaissance/Colonial Revival", date_floor: 1890, date_ceiling: 1910,
        usage_notes: "Per File A Section 2 Walnut Primary Furniture Woods." },
      { period_label: "American MCM walnut resurgence", date_floor: 1945, date_ceiling: 1970,
        usage_notes: "Walnut became the dominant American MCM identity wood per File A Section 3 MCM Key clue." },
    ],
    regional_associations: [
      { region: "mid_atlantic", usage_intensity: "dominant",
        traits: ["Philadelphia walnut sophistication", "Pennsylvania German walnut tradition"],
        notes: "Highest sophistication in colonial cabinetmaking." },
      { region: "midwest", usage_intensity: "dominant",
        traits: ["Grand Rapids, Cincinnati, Chicago factory production", "Midwestern walnut availability strongly influenced Victorian period"] },
      { region: "southern", usage_intensity: "common",
        traits: ["larger scale furniture", "elite urban centers"] },
      { region: "appalachian", usage_intensity: "common",
        traits: ["strong vernacular traditions"] },
    ],
    usage_role: ["primary_show_wood", "veneer"],
    usage_role_notes: "High-end case furniture as primary show wood; veneer work in Art Deco and MCM.",
    typical_secondary_pairings: ["wood_species_poplar_group"],
    style_wave_associations: ["queen_anne", "chippendale", "rococo_revival", "renaissance_revival", "colonial_revival", "art_deco", "mid_century_modern"],
    position_on_piece: [
      {
        physical_location: "drawer_side",
        functional_role: "exposed_surface",
        provenance: "original_to_construction",
        consistency_pattern: "repeated_consistently_across_piece",
        temporal_layer: "frame_construction",
        position_context_evidence: ["Walnut Victorian dresser show surface with poplar drawer sides (File A Section 6)"],
        notes: "Walnut as primary show wood pairs with poplar at drawer_side in Victorian dressers per File A Section 6 Hidden Secondary Woods by Era.",
      },
    ],
    diagnostic_caution_text: "Black walnut is especially diagnostic in Victorian carved case furniture and American MCM veneer work, but it also appears in earlier regional cabinetmaking. Per File A Important Caveat: wood alone should never date furniture; walnut evidence is supporting, regional, economic, and style-reinforcement evidence.",
  },
  {
    id: "wood_subspecies_evidence_black_walnut",
    category: "wood_species_evidence",
    species_id: "wood_species_walnut_group",
    subspecies_id: "wood_subspecies_black_walnut",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Victorian carved case furniture dominance", date_floor: 1840, date_ceiling: 1885,
        usage_notes: "Especially diagnostic in Victorian carved case furniture per File A Section 2 Walnut notes." },
      { period_label: "American MCM veneer work", date_floor: 1945, date_ceiling: 1970,
        usage_notes: "Especially diagnostic in MCM veneer per File A Section 2 Walnut notes." },
    ],
    regional_associations: [
      { region: "midwest", usage_intensity: "dominant",
        traits: ["Midwestern black walnut availability strongly influenced Victorian period"] },
    ],
    usage_role: ["primary_show_wood", "veneer"],
    usage_role_notes: "Subspecies-level distinction from walnut_group: black walnut specifically diagnostic in Victorian carved + MCM veneer contexts.",
    style_wave_associations: ["rococo_revival", "renaissance_revival", "mid_century_modern"],
    diagnostic_caution_text: "Black walnut's Victorian carved + MCM veneer dominance distinguishes it from other walnut species within the walnut_group. Parent walnut_group entry covers broader walnut tradition; this entry encodes black-walnut-specific diagnostic windows.",
  },
  {
    id: "wood_species_evidence_cherry_group",
    category: "wood_species_evidence",
    species_id: "wood_species_cherry_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Federal and regional cabinetmaking", date_floor: 1750, date_ceiling: 1820,
        usage_notes: "Cherry as regional alternative to mahogany in Federal period; Pennsylvania particularly strong." },
      { period_label: "Rural and Shaker-associated use", date_floor: 1820, date_ceiling: 1860,
        usage_notes: "Shaker work and rural cabinetmaking." },
      { period_label: "Colonial Revival", date_floor: 1880, date_ceiling: 1940,
        usage_notes: "Per File A Section 3 Colonial Revival primary woods list." },
      { period_label: "Mission/Arts & Crafts use", date_floor: 1895, date_ceiling: 1925,
        usage_notes: "Cherry in Mission/Arts & Crafts per File A Section 3 Mission primary woods." },
      { period_label: "Contemporary traditional and reproduction", date_floor: 1950, date_ceiling: 2026,
        usage_notes: "Continued traditional and reproduction use." },
    ],
    regional_associations: [
      { region: "mid_atlantic", usage_intensity: "dominant",
        traits: ["Pennsylvania cherry tradition very strong"] },
      { region: "new_england", usage_intensity: "common",
        traits: ["Shaker work", "rural cabinetmaking"] },
      { region: "appalachian", usage_intensity: "common",
        traits: ["regional vernacular traditions"] },
    ],
    usage_role: "primary_show_wood",
    usage_role_notes: "Fine casework; strongest in Mid-Atlantic (Pennsylvania) and New England Shaker contexts.",
    style_wave_associations: ["queen_anne", "chippendale", "federal_hepplewhite_sheraton", "mission_arts_and_crafts", "colonial_revival"],
    diagnostic_caution_text: "Strongest in Pennsylvania, New England Shaker work, and Mid-Atlantic regional furniture; oxidation and gum streaks are useful identification clues. Note: File A treats cherry and 'fruitwoods' (apple/pear) somewhat overlappingly; fruitwoods are not a separate species in NATURAL_WOOD_SPECIES inventory and cherry coverage captures the bulk of fruitwood evidence.",
  },
  {
    id: "wood_species_evidence_maple_group",
    category: "wood_species_evidence",
    species_id: "wood_species_maple_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Colonial regional work", date_floor: 1600, date_ceiling: 1800,
        usage_notes: "New England maple/oak combinations; New York Dutch walnut+maple combinations." },
      { period_label: "Utility and rural furniture", date_floor: 1800, date_ceiling: 1900,
        usage_notes: "American Empire secondary woods; Shaker forms." },
      { period_label: "Colonial Revival", date_floor: 1900, date_ceiling: 1940,
        usage_notes: "Per File A Section 3 Colonial Revival." },
      { period_label: "Scandinavian-influenced and American MCM", date_floor: 1945, date_ceiling: 1970,
        usage_notes: "American MCM primary wood (Walnut/Birch/Maple identity)." },
      { period_label: "Contemporary cabinetry and reproduction", date_floor: 1970, date_ceiling: 2026,
        usage_notes: "Contemporary use per File A Section 3." },
    ],
    regional_associations: [
      { region: "new_england", usage_intensity: "dominant",
        traits: ["Maple especially dominant"],
        notes: "File A Section 4 New England traits." },
    ],
    usage_role: ["primary_show_wood", "secondary_structural"],
    usage_role_notes: "Secondary + primary wood. Primary show wood in Shaker, MCM; secondary structural in drawer parts and utility.",
    style_wave_associations: ["colonial", "william_and_mary", "queen_anne", "federal_hepplewhite_sheraton", "colonial_revival", "mid_century_modern"],
    diagnostic_caution_text: "Especially common in New England; hard maple may appear in durable work surfaces, chairs, Shaker forms, and figured veneers. Subspecies hard_maple_sugar_maple distinct from soft_maple per Block 18 subspecies inventory.",
  },
  {
    id: "wood_subspecies_evidence_hard_maple_sugar_maple",
    category: "wood_species_evidence",
    species_id: "wood_species_maple_group",
    subspecies_id: "wood_subspecies_hard_maple_sugar_maple",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Shaker furniture work surfaces", date_floor: 1820, date_ceiling: 1860,
        usage_notes: "Durable work surfaces, chairs, Shaker forms per File A Section 2 Maple notes." },
      { period_label: "American MCM figured veneers", date_floor: 1945, date_ceiling: 1970,
        usage_notes: "Figured maple veneers in MCM." },
    ],
    regional_associations: [
      { region: "new_england", usage_intensity: "dominant",
        traits: ["Shaker furniture tradition", "durable work surfaces"] },
    ],
    usage_role: ["primary_show_wood", "specialized_use"],
    usage_role_notes: "Subspecies-level distinction: hard maple specifically in durable work surfaces, chairs, Shaker forms, and figured veneers per File A Section 2 Maple notes.",
    style_wave_associations: ["mid_century_modern"],
    diagnostic_caution_text: "Hard maple (sugar maple) distinct from soft maple via density and resistance to wear. Especially diagnostic for Shaker work surfaces and MCM figured veneers.",
  },
  {
    id: "wood_species_evidence_mahogany_group",
    category: "wood_species_evidence",
    species_id: "wood_species_mahogany_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "William and Mary early mahogany imports", date_floor: 1680, date_ceiling: 1730,
        usage_notes: "Imported luxury woods begin appearing." },
      { period_label: "Queen Anne Philadelphia dominance", date_floor: 1730, date_ceiling: 1780,
        usage_notes: "Philadelphia mahogany dominance; Newport highly figured mahogany; mahogany rapidly became prestige wood of elite colonial cabinetmaking." },
      { period_label: "Federal elite urban production", date_floor: 1780, date_ceiling: 1820,
        usage_notes: "Baltimore/Philadelphia/New York heavy imported mahogany; Federal one of most veneer-dependent periods." },
      { period_label: "American Empire flame veneer work", date_floor: 1800, date_ceiling: 1845,
        usage_notes: "Flame mahogany veneer dramatic grain; columnar construction; many Empire pieces used cheaper secondary woods beneath luxurious veneers." },
      { period_label: "Revival furniture", date_floor: 1880, date_ceiling: 1940,
        usage_notes: "Colonial Revival mahogany. Hollywood Regency revival per File A Section 5." },
      { period_label: "Traditional luxury", date_floor: 1950, date_ceiling: 1970,
        usage_notes: "Continued traditional luxury production." },
    ],
    regional_associations: [
      { region: "mid_atlantic", usage_intensity: "dominant",
        traits: ["Philadelphia mahogany dominance", "Imported Caribbean hardwood access"] },
      { region: "new_england", usage_intensity: "common",
        traits: ["Newport highly figured mahogany", "Elite coastal trade influence"] },
      { region: "southern", usage_intensity: "common",
        traits: ["Mahogany in elite urban centers"] },
    ],
    usage_role: ["primary_show_wood", "veneer"],
    usage_role_notes: "Elite furniture as primary show wood; veneer-dependent Federal and Empire periods.",
    typical_secondary_pairings: ["wood_species_pine_group"],
    style_wave_associations: ["queen_anne", "chippendale", "federal_hepplewhite_sheraton", "american_empire", "rococo_revival", "colonial_revival"],
    position_on_piece: [
      {
        physical_location: "case_back",
        functional_role: "hidden_interior",
        provenance: "original_to_construction",
        consistency_pattern: "repeated_consistently_across_piece",
        temporal_layer: "frame_construction",
        position_context_evidence: ["Mahogany Federal sideboard show surface with pine secondary wood (File A Section 6)"],
        notes: "Mahogany as primary show wood pairs with pine at case_back/case_bottom/drawer_bottom in Federal sideboards per File A Section 6 Hidden Secondary Woods by Era.",
      },
      {
        physical_location: "case_bottom",
        functional_role: "hidden_interior",
        provenance: "original_to_construction",
        consistency_pattern: "repeated_consistently_across_piece",
        temporal_layer: "frame_construction",
        position_context_evidence: ["Federal sideboard pine secondary (File A Section 6)"],
      },
      {
        physical_location: "drawer_bottom",
        functional_role: "hidden_interior",
        provenance: "original_to_construction",
        consistency_pattern: "repeated_consistently_across_piece",
        temporal_layer: "frame_construction",
        position_context_evidence: ["Federal sideboard pine secondary (File A Section 6)"],
      },
    ],
    diagnostic_caution_text: "Mahogany is strongest as a diagnostic clue in elite coastal cabinetmaking, Empire veneer work, and later revival furniture; it should not be treated as a simple date marker by itself. Subspecies-level CITES content for Cuban Mahogany (Swietenia mahagoni) routes to Block 23b per D-WS19-11/D-WE23a-10.",
  },
  {
    id: "wood_species_evidence_birch_group",
    category: "wood_species_evidence",
    species_id: "wood_species_birch_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Pilgrim/Early Colonial regional use", date_floor: 1620, date_ceiling: 1700,
        usage_notes: "Birch in early colonial primary woods list per File A Section 3 Pilgrim/Early Colonial." },
      { period_label: "Federal regional cabinetmaking", date_floor: 1780, date_ceiling: 1820,
        usage_notes: "Federal primary woods include birch per File A Section 3 Federal." },
      { period_label: "Factory furniture and utility production", date_floor: 1850, date_ceiling: 1940,
        usage_notes: "Stained substitute wood for walnut/mahogany." },
      { period_label: "Colonial Revival stained substitute", date_floor: 1900, date_ceiling: 1950,
        usage_notes: "Often stained to imitate walnut or mahogany." },
      { period_label: "Art Deco veneers", date_floor: 1925, date_ceiling: 1945,
        usage_notes: "Birch in Art Deco primary woods list." },
      { period_label: "MCM American identity (with walnut + maple)", date_floor: 1945, date_ceiling: 1975,
        usage_notes: "American MCM Birch/Maple/Walnut." },
      { period_label: "Postwar utility and veneer substrates", date_floor: 1945, date_ceiling: 2026,
        usage_notes: "Veneer substrates, plywood, painted/stained production." },
    ],
    regional_associations: [
      { region: "new_england", usage_intensity: "common",
        traits: ["regional traditional use"] },
      { region: "midwest", usage_intensity: "dominant",
        traits: ["factory production"] },
    ],
    usage_role: ["primary_show_wood", "secondary_structural", "veneer"],
    usage_role_notes: "Secondary + veneer substrate; primary show wood in MCM American identity context.",
    style_wave_associations: ["colonial", "federal_hepplewhite_sheraton", "colonial_revival", "art_deco", "mid_century_modern"],
    diagnostic_caution_text: "Often stained to imitate walnut or mahogany; useful as a factory-production clue. Diagnostic value highest in MCM context (walnut/birch/maple identity) and Colonial Revival stained-substitute context.",
  },
  {
    id: "wood_species_evidence_beech_group",
    category: "wood_species_evidence",
    species_id: "wood_species_beech_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Bentwood and chair production", date_floor: 1850, date_ceiling: 2026,
        usage_notes: "Critical to Thonet-style bentwood production; also common in general chair-part manufacturing." },
    ],
    regional_associations: [
      { region: "midwest", usage_intensity: "common",
        traits: ["factory chair production"] },
    ],
    usage_role: ["primary_show_wood", "specialized_use"],
    usage_role_notes: "Bentwood chairs and turned parts; specialized Thonet-style bentwood production.",
    style_wave_associations: ["eastlake_aesthetic", "mid_century_modern"],
    diagnostic_caution_text: "Critical to Thonet-style bentwood production; close-grained pale hardwood. Distinguishable from ash through reduced grain pattern and density.",
  },
  {
    id: "wood_species_evidence_poplar_group",
    category: "wood_species_evidence",
    species_id: "wood_species_poplar_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Secondary wood, painted furniture (broad)", date_floor: 1800, date_ceiling: 2026,
        usage_notes: "Widespread secondary and painted-furniture use." },
    ],
    regional_associations: [
      { region: "mid_atlantic", usage_intensity: "dominant",
        traits: ["Poplar secondary woods per File A Section 4 Mid-Atlantic"] },
      { region: "appalachian", usage_intensity: "dominant",
        traits: ["Poplar in Appalachian common woods per File A Section 4 Appalachian"] },
    ],
    usage_role: ["secondary_structural", "secondary_internal"],
    usage_role_notes: "Hidden structural wood; widespread secondary wood for show-wood pieces.",
    typical_secondary_pairings: ["wood_species_walnut_group", "wood_species_oak_group"],
    style_wave_associations: ["colonial_revival", "rococo_revival", "mission_arts_and_crafts"],
    position_on_piece: [
      {
        physical_location: "drawer_side",
        functional_role: "hidden_interior",
        provenance: "original_to_construction",
        consistency_pattern: "repeated_consistently_across_piece",
        temporal_layer: "frame_construction",
        position_context_evidence: ["Walnut Victorian dresser with poplar drawer sides (File A Section 6 reciprocal to walnut entry)"],
        notes: "Poplar at drawer_side in Victorian walnut dressers.",
      },
      {
        physical_location: "case_interior_framing",
        functional_role: "hidden_interior",
        provenance: "original_to_construction",
        consistency_pattern: "repeated_consistently_across_piece",
        temporal_layer: "frame_construction",
        position_context_evidence: ["Oak Mission cabinet with poplar internals (File A Section 6 reciprocal to oak entry)"],
        notes: "Poplar at case_interior_framing in Mission oak cabinets.",
      },
    ],
    diagnostic_caution_text: "Hidden structural wood. Per File A Section 6 Hidden Secondary Woods by Era: secondary woods are often more diagnostically useful than show wood. Poplar appears consistently as secondary in Mid-Atlantic and Appalachian furniture. Inventory note: poplar pairs explicitly with walnut (Victorian dressers) and oak (Mission cabinets) per File A Section 6; broader pairing inventory (poplar as secondary for multiple primary woods) deferred to Block 26 WoodEvidenceReasoningRule capture per D-WE23a-2 5+ primary exception framework — Block 23a authors explicit Section 6 pairings only.",
  },
  {
    id: "wood_species_evidence_gumwood_group",
    category: "wood_species_evidence",
    species_id: "wood_species_gumwood_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Colonial Revival and factory production peak", date_floor: 1900, date_ceiling: 1940,
        usage_notes: "Often stained to imitate mahogany or walnut; deceptive factory-era clue per File A Section 2 Gumwood notes." },
      { period_label: "Mid-century utility and stained production", date_floor: 1940, date_ceiling: 1970,
        usage_notes: "Continued utility use." },
    ],
    regional_associations: [
      { region: "midwest", usage_intensity: "dominant",
        traits: ["Factory production centers"] },
    ],
    usage_role: ["primary_show_wood", "secondary_structural"],
    usage_role_notes: "Stained substitute wood (primary show wood role when stained to imitate mahogany/walnut); secondary structural in factory case goods.",
    style_wave_associations: ["colonial_revival"],
    diagnostic_caution_text: "Often stained to imitate mahogany or walnut; especially useful as a deceptive factory-era clue. Colonial Revival is 'one of the most deceptive wood eras diagnostically' per File A Section 3 Colonial Revival.",
  },
  {
    id: "wood_species_evidence_basswood",
    category: "wood_species_evidence",
    species_id: "wood_species_basswood",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Secondary wood, drawer parts, carving (broad)", date_floor: 1800, date_ceiling: 2026,
        usage_notes: "Drawer parts, carving, secondary wood, painted furniture, light utility parts." },
    ],
    regional_associations: [
      { region: "midwest", usage_intensity: "common",
        traits: ["factory production"],
        notes: "No specific File A regional concentration; midwest via factory production framing." },
    ],
    usage_role: ["secondary_structural", "specialized_use"],
    usage_role_notes: "Drawer parts and secondary use; specialized carving role due to soft, easily-carved nature.",
    style_wave_associations: ["colonial_revival"],
    diagnostic_caution_text: "Light, soft, pale, easily carved; often hidden or painted rather than used as show wood. Especially useful as carving substrate beneath gilding or paint.",
  },
  // ─────────────────────────────────────────────────────────────
  // CATEGORY III — Softwoods (6 entries)
  // ─────────────────────────────────────────────────────────────
  {
    id: "wood_species_evidence_pine_group",
    category: "wood_species_evidence",
    species_id: "wood_species_pine_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "All periods as secondary wood (broad)", date_floor: 1620, date_ceiling: 2026,
        usage_notes: "Secondary wood, painted furniture, rural furniture, backs, bottoms, drawer parts, and case interiors. Eastern white pine especially important in New England and early American casework." },
    ],
    regional_associations: [
      { region: "new_england", usage_intensity: "dominant",
        traits: ["Eastern white pine especially important in colonial casework", "Painted surfaces common"] },
      { region: "southern", usage_intensity: "common",
        traits: ["Yellow pine primary"],
        notes: "Southern states yellow pine per File A Section 4." },
    ],
    usage_role: ["secondary_structural", "primary_show_wood"],
    usage_role_notes: "Secondary wood foundation across all periods; primary show wood in painted and rural furniture contexts.",
    typical_secondary_pairings: ["wood_species_mahogany_group"],
    style_wave_associations: ["colonial", "william_and_mary", "queen_anne", "federal_hepplewhite_sheraton"],
    position_on_piece: [
      {
        physical_location: "case_back",
        functional_role: "hidden_interior",
        provenance: "original_to_construction",
        consistency_pattern: "repeated_consistently_across_piece",
        temporal_layer: "frame_construction",
        position_context_evidence: ["Federal sideboard pine secondary (File A Section 6 reciprocal to mahogany entry)"],
      },
      {
        physical_location: "case_bottom",
        functional_role: "hidden_interior",
        provenance: "original_to_construction",
        consistency_pattern: "repeated_consistently_across_piece",
        temporal_layer: "frame_construction",
        position_context_evidence: ["Federal sideboard pine secondary (File A Section 6)"],
      },
      {
        physical_location: "drawer_bottom",
        functional_role: "hidden_interior",
        provenance: "original_to_construction",
        consistency_pattern: "repeated_consistently_across_piece",
        temporal_layer: "frame_construction",
        position_context_evidence: ["Federal sideboard pine secondary (File A Section 6)"],
      },
    ],
    diagnostic_caution_text: "Eastern white pine is especially important in New England and early American casework; as a secondary wood, pine may be more diagnostically useful than the visible show wood. Per File A Section 6 Hidden Secondary Woods by Era: visible wood ≠ structural wood. Pine subspecies entries (eastern_white_pine, southern_yellow_pine) capture region-specific diagnostic windows.",
  },
  {
    id: "wood_subspecies_evidence_eastern_white_pine",
    category: "wood_species_evidence",
    species_id: "wood_species_pine_group",
    subspecies_id: "wood_subspecies_eastern_white_pine",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Colonial casework primary", date_floor: 1620, date_ceiling: 1820,
        usage_notes: "Especially important in New England and early American casework per File A Section 2 Pine notes." },
    ],
    regional_associations: [
      { region: "new_england", usage_intensity: "dominant",
        traits: ["Eastern white pine colonial casework primary"] },
    ],
    usage_role: ["primary_show_wood", "secondary_structural"],
    usage_role_notes: "New England colonial casework primary; widespread secondary structural use.",
    style_wave_associations: ["colonial", "william_and_mary", "queen_anne", "federal_hepplewhite_sheraton"],
    diagnostic_caution_text: "Subspecies-level distinction: eastern white pine specifically diagnostic in New England colonial casework. Parent pine_group covers broader pine secondary use; this entry encodes EWP's regional primary-show-wood role.",
  },
  {
    id: "wood_subspecies_evidence_southern_yellow_pine",
    category: "wood_species_evidence",
    species_id: "wood_species_pine_group",
    subspecies_id: "wood_subspecies_southern_yellow_pine",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Southern utility and case furniture", date_floor: 1700, date_ceiling: 2026,
        usage_notes: "Yellow pine primary in Southern States per File A Section 4 Southern States." },
    ],
    regional_associations: [
      { region: "southern", usage_intensity: "dominant",
        traits: ["Yellow pine primary"] },
    ],
    usage_role: ["primary_show_wood", "secondary_structural"],
    usage_role_notes: "Southern utility and case furniture primary; larger-scale Southern furniture context.",
    style_wave_associations: ["colonial", "federal_hepplewhite_sheraton"],
    diagnostic_caution_text: "Subspecies-level distinction: southern yellow pine specifically diagnostic in Southern States utility and case furniture. Parent pine_group covers broader pine secondary use; this entry encodes SYP's regional primary role.",
  },
  {
    id: "wood_species_evidence_cedar_group",
    category: "wood_species_evidence",
    species_id: "wood_species_cedar_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Cedar chest and moth-resistant storage peak", date_floor: 1880, date_ceiling: 1960,
        usage_notes: "Cedar chests, blanket chests, closet linings, storage interiors, wardrobe and trunk linings." },
      { period_label: "Continued storage and lining use", date_floor: 1960, date_ceiling: 2026,
        usage_notes: "Present storage, closet, and lining use." },
    ],
    regional_associations: [
      { region: "southern", usage_intensity: "common",
        traits: ["aromatic red cedar production"] },
      { region: "appalachian", usage_intensity: "common",
        traits: ["cedar chest tradition"] },
    ],
    usage_role: "specialized_use",
    usage_role_notes: "Aromatic, moth-resistant lining; storage interior use; not primary case-furniture show wood.",
    style_wave_associations: ["colonial_revival"],
    diagnostic_caution_text: "Aromatic red cedar is usually a storage and insect-resistance clue, not a primary case-furniture show wood. Subspecies eastern_red_cedar (Juniperus virginiana) specifically diagnostic for chest panels.",
  },
  {
    id: "wood_subspecies_evidence_eastern_red_cedar",
    category: "wood_species_evidence",
    species_id: "wood_species_cedar_group",
    subspecies_id: "wood_subspecies_eastern_red_cedar",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Cedar chest panel construction", date_floor: 1880, date_ceiling: 1960,
        usage_notes: "Aromatic red cedar as cedar chest panel specialty per File A Section 2 Cedar." },
    ],
    regional_associations: [
      { region: "appalachian", usage_intensity: "common",
        traits: ["Cedar chest tradition"] },
      { region: "southern", usage_intensity: "common",
        traits: ["Aromatic red cedar production"] },
    ],
    usage_role: "specialized_use",
    usage_role_notes: "Cedar chest panel construction; aromatic moth-resistant role.",
    style_wave_associations: ["colonial_revival"],
    diagnostic_caution_text: "Subspecies-level distinction: eastern red cedar specifically diagnostic for cedar chest panels. Distinct from juniper-class softwoods per File B subspecies inventory.",
  },
  {
    id: "wood_species_evidence_redwood",
    category: "wood_species_evidence",
    species_id: "wood_species_redwood",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Arts & Crafts California", date_floor: 1895, date_ceiling: 1925,
        usage_notes: "Redwood occasionally appears in California Arts & Crafts per File A Section 3 Mission California." },
      { period_label: "Studio furniture and West Coast use", date_floor: 1950, date_ceiling: 2026,
        usage_notes: "West Coast production per File A Section 4." },
    ],
    regional_associations: [
      { region: "west_coast", usage_intensity: "dominant",
        traits: ["California Arts & Crafts use", "West Coast modernist influence"] },
    ],
    usage_role: ["primary_show_wood", "decorative_accent"],
    usage_role_notes: "California Arts & Crafts primary show wood; decorative burl accent use.",
    style_wave_associations: ["mission_arts_and_crafts"],
    diagnostic_caution_text: "California Arts & Crafts redwood distinct from broader Mission/Stickley quarter-sawn-oak identity. West Coast regional indicator.",
  },
  // ─────────────────────────────────────────────────────────────
  // CATEGORY IV — Tropicals (5 entries)
  // ─────────────────────────────────────────────────────────────
  {
    id: "wood_species_evidence_rosewood_group",
    category: "wood_species_evidence",
    species_id: "wood_species_rosewood_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "American Empire rosewood accents", date_floor: 1800, date_ceiling: 1840,
        usage_notes: "Rosewood accents in American Empire per File A Section 3 American Empire primary woods." },
      { period_label: "Rococo Revival and Victorian luxury veneers", date_floor: 1840, date_ceiling: 1880,
        usage_notes: "Rococo Revival/Victorian luxury veneer panels. Heavy rosewood veneer is key Rococo Revival signal per File A Section 7." },
      { period_label: "Art Deco luxury veneers", date_floor: 1925, date_ceiling: 1945,
        usage_notes: "Art Deco luxury veneer work." },
      { period_label: "Scandinavian/Danish Modern and high-end MCM", date_floor: 1950, date_ceiling: 1970,
        usage_notes: "Scandinavian/Danish Modern + high-end MCM imports per File A Section 3 MCM Scandinavian influence." },
    ],
    regional_associations: [
      { region: "mid_atlantic", usage_intensity: "common",
        traits: ["imported into elite cabinetmaking centers"],
        notes: "Rosewood is imported; no native US regional concentration. Regional association captures import destinations." },
      { region: "midwest", usage_intensity: "common",
        traits: ["factory Victorian production with rosewood veneer panels (Grand Rapids, Cincinnati, Chicago)"] },
    ],
    usage_role: ["veneer", "decorative_accent"],
    usage_role_notes: "Luxury veneers and accents; usually a veneer or accent rather than structural wood.",
    style_wave_associations: ["american_empire", "rococo_revival", "art_deco", "mid_century_modern"],
    diagnostic_caution_text: "Usually a veneer or accent rather than structural wood; commercial 'rosewood' names can cover several species, including palisander-type trade usage per File A Section 2 Rosewood. Palisander (Dalbergia spp. trade overlap with rosewood) is conceptually identification-only — its evidence content folds into the rosewood_group framing per D-WE23a-9; no standalone palisander SPECIES_EVIDENCE entry exists. Subspecies-level CITES content for Brazilian Rosewood (Dalbergia nigra; CITES Appendix I 1992) routes to Block 23b per D-WS19-11/D-WE23a-10.",
  },
  {
    id: "wood_species_evidence_ebony_group",
    category: "wood_species_evidence",
    species_id: "wood_species_ebony_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Ebonized Victorian/Aesthetic Movement contrast work", date_floor: 1850, date_ceiling: 1900,
        usage_notes: "Ebonized contrast work; many 'ebony' appearances are ebonized domestic woods or stained finishes per File A Section 2 Ebony notes." },
      { period_label: "Art Deco contrast work", date_floor: 1925, date_ceiling: 1945,
        usage_notes: "Macassar ebony in Art Deco primary woods list per File A Section 3 Art Deco." },
    ],
    regional_associations: [
      { region: "mid_atlantic", usage_intensity: "common",
        traits: ["imported into elite production"],
        notes: "Ebony is imported; regional captures destinations." },
    ],
    usage_role: "decorative_accent",
    usage_role_notes: "Decorative contrast, trim, inlay, turned accents.",
    style_wave_associations: ["eastlake_aesthetic", "art_deco"],
    diagnostic_caution_text: "True ebony is rare and costly; many 'ebony' appearances are ebonized domestic woods or stained finishes. Diagnostic authentication critical; CITES-related anti-classification content for ebony species routes to Block 23b per D-WS19-11/D-WE23a-10.",
  },
  {
    id: "wood_species_evidence_satinwood_group",
    category: "wood_species_evidence",
    species_id: "wood_species_satinwood_group",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Federal/Hepplewhite/Sheraton inlay and veneer work", date_floor: 1780, date_ceiling: 1820,
        usage_notes: "Satinwood as Federal signature inlay wood; contrasting string inlays, decorative banding, stringing per File A Section 3 Federal Signature woods." },
      { period_label: "Revival inlay and decorative veneer work", date_floor: 1880, date_ceiling: 1910,
        usage_notes: "Revival inlay per File A Section 2 Satinwood notes." },
    ],
    regional_associations: [
      { region: "mid_atlantic", usage_intensity: "dominant",
        traits: ["Baltimore/Philadelphia/New York heavy imported luxury woods"],
        notes: "Federal elite urban production." },
    ],
    usage_role: "decorative_accent",
    usage_role_notes: "Federal inlay, banding, decorative veneer, stringing; appears as decorative surface or inlay rather than structural furniture wood.",
    style_wave_associations: ["federal_hepplewhite_sheraton", "colonial_revival"],
    diagnostic_caution_text: "Usually appears as a decorative surface or inlay, not as a common structural furniture wood. Per File A Section 7 Key Chronological Wood Signals: 'Satinwood inlay' signals Federal — strong Federal-period diagnostic when present as inlay with contrasting mahogany ground.",
  },
  {
    id: "wood_species_evidence_zebrawood",
    category: "wood_species_evidence",
    species_id: "wood_species_zebrawood",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "Art Deco accents", date_floor: 1925, date_ceiling: 1945,
        usage_notes: "Zebrawood accents in Art Deco primary woods list per File A Section 3 Art Deco." },
    ],
    regional_associations: [
      { region: "mid_atlantic", usage_intensity: "common",
        traits: ["imported into Art Deco production"],
        notes: "Imported; regional captures destinations (Grand Rapids, Chicago, New York Deco centers)." },
    ],
    usage_role: ["veneer", "decorative_accent"],
    usage_role_notes: "Zebrawood appears as veneer/accent in Art Deco context.",
    style_wave_associations: ["art_deco"],
    diagnostic_caution_text: "Highly figured veneer geometry often matters more than solid wood species during Deco production per File A Section 3 Art Deco.",
  },
  {
    id: "wood_species_evidence_teak",
    category: "wood_species_evidence",
    species_id: "wood_species_teak",
    positive_authority: 6,
    hard_negative_authority: 6,
    period_associations: [
      { period_label: "MCM Scandinavian influence", date_floor: 1945, date_ceiling: 1975,
        usage_notes: "Scandinavian influence: teak + rosewood per File A Section 3 MCM Scandinavian influence." },
      { period_label: "Outdoor luxury and premium modern", date_floor: 1960, date_ceiling: 2026,
        usage_notes: "Outdoor luxury, premium modern, contemporary design furniture." },
    ],
    regional_associations: [
      { region: "mid_atlantic", usage_intensity: "common",
        traits: ["imported into MCM production centers"],
        notes: "Teak is imported; no native US regional concentration." },
      { region: "west_coast", usage_intensity: "common",
        traits: ["West Coast modernist influence"] },
    ],
    usage_role: ["primary_show_wood", "specialized_use"],
    usage_role_notes: "MCM Scandinavian identity primary show wood; specialized outdoor luxury use.",
    style_wave_associations: ["mid_century_modern", "contemporary"],
    diagnostic_caution_text: "Oily feel, golden-brown oxidation, and Scandinavian/Danish Modern context are key identification clues. Diagnostic specifically for MCM Scandinavian context (1945-1975) and outdoor luxury (1960+).",
  },
];

/**
 * Per-substrate evidence entries. Canonical source: File A primary substrate
 * rows + File B residual substrate content. Authored in Block 23.
 */
export const SUBSTRATE_EVIDENCE: SubstrateEvidenceEntry[] = [];

/**
 * Cut/grain composed evidence entries. Canonical source: File A Key
 * Chronological Wood Signals table + File B Cat VI residual period content.
 * Authored in Block 24.
 */
export const CUT_GRAIN_EVIDENCE: CutGrainEvidenceEntry[] = [];

/**
 * Cross-cutting multi-entity diagnostic signals. Canonical source: File A
 * Key Chronological Wood Signals table composed entries + V-K Veneer
 * Substrates content per Block 21 D-CG21-4 / Block 22 D-WE22-7 routing.
 * Authored in Block 24.
 */
export const WOOD_DIAGNOSTIC_SIGNALS: WoodDiagnosticSignalEntry[] = [];

/**
 * Meta-rule entries capturing appraiser-knowledge reasoning principles.
 * Canonical source: File A Important Caveat + Hidden Secondary Woods by
 * Era sections + File B Cat VI Critical Diagnostic Principles content per
 * Block 21 D-CG21-17 routing. Authored in Block 26.
 */
export const WOOD_EVIDENCE_REASONING_RULES: WoodEvidenceReasoningRule[] = [];
