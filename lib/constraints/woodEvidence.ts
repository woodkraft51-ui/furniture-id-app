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

import type { CanonicalEntry, AntiClassificationGuidance } from "./entryShape";
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
   * Block 23. */
  anti_classification_guidance?: AntiClassificationGuidance | AntiClassificationGuidance[];

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
export const SPECIES_EVIDENCE: WoodSpeciesEvidenceEntry[] = [];

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
