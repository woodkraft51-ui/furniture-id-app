import { API } from "./store";
import { MAKER_MARKS, MAKER_ENTRIES } from "./constraints/makerMarks";
import { AUTHORED_MAKER_ENTRIES } from "./constraints/makersAuthored.generated";
// Note: MAKER_ATTRIBUTION_REASONING_RULES is the canonical source of truth
// for the rules implemented inline in applyMakerAttributionRules + the
// Confidence Ladder (Rule #7) inside makerConfidenceLadderTier. Rule
// statements are hardcoded rather than runtime-read for tight binding;
// changes to canonical rule_statement prose require both the canonical
// edit and a code edit (intentional — the rule prose is appraiser-canon
// and code edits should track canonical changes deliberately).
import { canonicalFormIdForLabel, NO_MATCH } from "./engineCanonicalMap";
import { recommendationFromValue, isLargeForm, hasRepairSignals } from "./fieldRecommendation";
import { getClueMetaFromCanonical, ClueMeta, getCanonicalCautionText, parseRangeToNumeric, getReplacementLikelihood, buildUpholsteryCanonicalAppendix, buildJoineryCanonicalAppendix, buildFastenerCanonicalAppendix, buildHardwareCanonicalAppendix, buildFinishCanonicalAppendix, buildToolmarkCanonicalAppendix, buildWoodIdentificationCanonicalAppendix, buildWoodEvidenceCanonicalAppendix, buildMakerMarkCanonicalAppendix } from "./engineClueResolver";

// Block 15: build canonical upholstery prompt appendix ONCE at module init.
// Avoids per-request canonical-index traversal in P0.
const UPHOLSTERY_CANONICAL_APPENDIX = buildUpholsteryCanonicalAppendix();

// Block 19: same pattern for joinery. Iterates the full JOINERY_CATEGORIES +
// JOINERY_TYPES arrays (45 type + 16 category entries) so the LLM sees every
// authored canonical joinery entry — not just the 4 with CLUE_TO_CANONICAL
// mappings. Entries with mappings carry their engine key alongside; entries
// without are still surfaced so the LLM can describe the feature.
const JOINERY_CANONICAL_APPENDIX = buildJoineryCanonicalAppendix();

// Block 20: same pattern for fasteners. Iterates FASTENER_CATEGORIES (6) +
// FASTENER_SUBCATEGORIES (9) + FASTENER_TYPES (25) = 40 entries total.
// Three-tier surfacing because fasteners library uses an intermediate
// subcategory tier. STAPLES subcategories (3A + 3B) and decorative brass
// tack are annotated [→ upholstery layer] to signal the assessment_layer
// routing override.
const FASTENER_CANONICAL_APPENDIX = buildFastenerCanonicalAppendix();

// Block 21: same pattern for hardware. Iterates HARDWARE_CATEGORIES (14) +
// HARDWARE_TYPES (44) = 58 entries. Two-tier surfacing (no subcategory
// tier in hardware library). hardware_category_upholstery_hardware and
// its 3 children (upholstery_tacks, decorative_nailhead_trim,
// coil_spring_hardware) annotated [→ upholstery layer] to signal the
// assessment_layer routing override.
const HARDWARE_CANONICAL_APPENDIX = buildHardwareCanonicalAppendix();

// Block 22-23 (engine pull-through bundle): five additional canonical
// libraries surfaced to the P0 LLM system prompt.
//
// FINISH (8 entries: 3 categories + 5 types) — surface-finish dating
// evidence (shellac crazing, polyurethane, oil patina, refinishing).
const FINISH_CANONICAL_APPENDIX = buildFinishCanonicalAppendix();
// TOOLMARKS (8 entries: 3 categories + 5 types) — production-surface
// evidence (pit saw, circular saw, band saw, hand plane chatter).
const TOOLMARK_CANONICAL_APPENDIX = buildToolmarkCanonicalAppendix();
// WOOD IDENTIFICATION (~74 entries: 5 categories + 36 species + 6
// engineered substrates + 27 cut/grain phenomena). Identification side —
// answers WHAT WOOD it is.
const WOOD_IDENTIFICATION_CANONICAL_APPENDIX = buildWoodIdentificationCanonicalAppendix();
// WOOD EVIDENCE (~80 entries: 28 species evidence + 6 substrate evidence
// + 37 cut/grain evidence + 9 diagnostic signals). Evidence side — HOW
// the wood evidence factors into dating.
const WOOD_EVIDENCE_CANONICAL_APPENDIX = buildWoodEvidenceCanonicalAppendix();
// MAKER MARKS (77 maker entries) — per-maker attribution rules + false-
// positive warnings. Note: MAKER_ENTRIES not yet engine-wired (Block 23a
// audit; engine still imports legacy MAKER_MARKS shim). Surfacing the
// new schema's content to the LLM at perception time so the LLM applies
// the right attribution discipline whether or not Phase 3 engine
// integration has shipped.
const MAKER_MARK_CANONICAL_APPENDIX = buildMakerMarkCanonicalAppendix();
import {
  evaluateSubtype,
  evaluateAntiBackClassification,
  evaluateDimensional,
  evaluateHybridForm,
  evaluateCousinContrast,
  getCommonAliasesForDisplay,
  getRegionalPeriodNotes,
  getCousinFormContrasts,
  getFormDatingBoundaries,
  getFormDatingEnvelope,
  type SubtypeAssignment,
  type AntiBackViolation,
  type HybridAnnotation,
  type CousinContrastMatch,
} from "./engineFormEvaluators";
import { attributeStyle, aggregateStyleWaves, collectStyleSupportingEvidence, type StyleAttribution, type StyleWaveAttribution, type StyleSupportingObservation } from "./engineStyleEvaluator";
import { buildDatingOverlap, refineDatingFromConvergence, type DatingOverlapData } from "./engineDatingOverlap";
import { computeStyleIntersections, detectImpossiblePairs, type StyleIntersection } from "./engineStyleIntersection";
import { findStyleCompatibility } from "./constraints/styleCompatibility";
import { reconcileFinalStyle, type FinalStyleReconciliation } from "./engineStyleReconciliation";
import { pickNamePrefixStyle, subtypeDisjointFromDating, isWoodPrimary, falseTwinMaterialsToSuppress, canonicalClueKey, commodeEvidencePresent } from "./engineReportHelpers";
import { snapToCanonical, type SnapMethod } from "./engineVocabulary";
import { parseRangeToNumeric as _parseRangeForCompare } from "./engineClueResolver";

// Block 8 helper: estimate width of a date-hint string for tighter-wins
// selection. Returns Infinity when unparseable (so inline KEPT_IN_ENGINE
// always loses if it's the only source and unparseable).
function dateHintWidth(hint: string | null | undefined): number {
  if (!hint) return Infinity;
  const r = _parseRangeForCompare(hint);
  if (r.date_floor === null && r.date_ceiling === null) return Infinity;
  // Open-ended ranges get penalized but stay finite-comparable.
  if (r.date_floor === null) return 200;
  if (r.date_ceiling === null) return 200;
  return r.date_ceiling - r.date_floor;
}

// Block 1 step 5: prefer canonical-derived meta over inline CLUE_LIBRARY when
// the clue has been migrated (per CLUE_TO_CANONICAL in engineCanonicalMap).
// Falls back to CLUE_LIBRARY for KEPT_IN_ENGINE clues (style cues, material
// observations, *_pattern keys from detectStructuralPatterns).
//
// Block 2c fix: OR the hardNegative flag from both sources. Canonical
// authority alone (>=8) misses entries like substrate_evidence_plywood
// (authority 7) that are categorical date disqualifiers per audit log
// (D-PH3HCL-S4-3 Q4). Engine's CLUE_LIBRARY correctly flagged them; that
// flag must survive the canonical preference.
//
// Block 8 fix: when BOTH canonical and inline have parseable dateHints,
// prefer the TIGHTER one. Block 8 added period_associations fallback to
// the canonical dateHint resolver, which sometimes produces a broader
// union range than the engine's specifically-tuned inline dateHint
// (e.g., fastener_subcategory_cut_nails period_associations span
// 1600-1900 across multiple period entries, while inline CLUE_LIBRARY
// has the tighter 1790-1890 cut_nail dating).
function getClueMeta(clueKey: string | null | undefined): ClueMeta | undefined {
  if (!clueKey) return undefined;
  const fromCanonical = getClueMetaFromCanonical(clueKey);
  const fromInline = CLUE_LIBRARY[clueKey];
  if (fromCanonical) {
    // Tighter dateHint wins between canonical and inline. Falls back to OR-merge
    // when only one source has it.
    const canonW = dateHintWidth(fromCanonical.dateHint);
    const inlineW = dateHintWidth(fromInline?.dateHint);
    const chosenDateHint =
      canonW <= inlineW ? fromCanonical.dateHint : fromInline?.dateHint;
    return {
      ...fromCanonical,
      hardNegative: fromCanonical.hardNegative || fromInline?.hardNegative,
      dateHint: chosenDateHint,
    };
  }
  return fromInline;
}

type Observation = {
  type: string;
  clue?: string | null;
  description: string;
  confidence: number;
  source_image?: string | null;
  hard_negative?: boolean;
  low_confidence_flag?: boolean;
  // True when the description self-negates its own clue subject ("Object is a
  // table lamp, not a clock case"). Such a clue is a REJECTED CANDIDATE: it must
  // not contribute positive evidence to clue_keys or weighting. Distinct from
  // hard_negative, which marks a PRESENT clue that is an age/authenticity red
  // flag (phillips_screw, plywood_structural).
  negated?: boolean;
};

type EvidenceDigest = {
  observations: Observation[];
  observation_count: number;
  by_type: Record<string, Observation[]>;
  clue_keys: string[];
  hard_negatives: string[];
  strongest_observations: Observation[];
  perception?: Perception;
  // Stage 1B shadow: what canonical-vocabulary snapping WOULD do (observe-only;
  // present only when P0_VOCAB_SNAP_SHADOW is enabled). Never alters clue_keys.
  vocab_shadow?: VocabShadow;
};

type VocabShadow = {
  total: number;
  changed: { from: string; to: string; method: SnapMethod }[];
  unmatched: string[];
  shadowClueKeys: string[];
};

type Perception = {
  labels: string[];
  maker_names: string[];
  materials: string[];
  forms: string[];
  functional_features: string[];
  style_cues: string[];
  construction_cues: string[];
  condition_cues: string[];
  visible_text: string[];
  raw_text: string;
};

type Phase1Gate = {
  confidence_cap: "High" | "Moderate" | "Low" | "Inconclusive";
  confidence_cap_pct: number;
  missing_evidence: Record<string, boolean>;
  evidence_sufficiency_summary: string;
  can_run: Record<string, boolean>;
  next_best_evidence: string[];
};

type ConfidenceBand = "High" | "Moderate" | "Low" | "Inconclusive";

// Block 14: upholstery is treated as a separate identification + dating track
// from the frame. detectUpholsteryLayer populates these fields; originality
// inference compares frame vs upholstery date envelopes to set
// original_likely + cross_reference_note.
type UpholsteryLayer = {
  identification?: string;
  range: string;
  confidence: ConfidenceBand | string;
  note?: string;
  date_floor?: number | null;
  date_ceiling?: number | null;
  original_likely?: boolean;
  cross_reference_note?: string;
};

// Phase 2 result. Block 1 preserves `range` (free-text display string) per
// D-PH3-7 backward-compat; later steps add structured numerics alongside.
type Phase2Result = {
  range: string;
  confidence: ConfidenceBand | string;
  support?: string[];
  limitations?: string[];
  upholstery_layer?: UpholsteryLayer;
  date_tightening_evidence?: any;
  // Block 1 additive fields (populated when canonical lookups resolve):
  date_floor?: number;
  date_ceiling?: number;
};

// Phase 3 result. Block 1 preserves `form` + `display_form` (free-text labels)
// per D-PH3-7 backward-compat; adds `form_id` (canonical FormEntry.id) alongside.
type Phase3Result = {
  form: string;
  display_form: string;
  style_context: string | null;
  confidence: ConfidenceBand | string;
  confidence_pct?: number; // numeric pct behind `confidence`, so p6 can re-cap on dating contribution
  support: string[];
  alternatives: string[];
  // Block 1 additive fields:
  form_id?: string | null;          // canonical form_id or null if NO_MATCH
  alternative_form_ids?: string[];  // canonical IDs for alternatives where they resolve
  // Block 1 step 6 evaluator outputs:
  subtype?: SubtypeAssignment | null;
  anti_back_violation?: AntiBackViolation | null;
  dimensional_check?: { ok: boolean; note: string } | null;
  // Block 2a: structured style attribution from styleFamilies.ts
  style_attribution?: StyleAttribution | null;
  style_alternatives?: StyleAttribution[]; // up to 3 lower-confidence attributions
  style_influences?: StyleAttribution[]; // non-authoritative prose-only matches ("worth checking")
  // Block 2b: style-wave aggregator output (≥2-of-N rule per D-PH3-9)
  style_waves?: StyleWaveAttribution[];
  // Transitional-piece reasoning: date-envelope intersections across
  // competing style attributions and across surfaced waves from different
  // parent families. Captures the "Rococo Revival + Renaissance Revival
  // both fire → both were in production c. 1865–1885 → that's the
  // transitional window" diagnostic. best_style_intersection is the
  // tightest qualifying intersection; consumed by p5 (transitional
  // framing) and by the dating-overlap chart (multi-Style-row + overlap
  // highlight band).
  style_intersections?: StyleIntersection[];
  best_style_intersection?: StyleIntersection | null;
  // Alternatives whose canonical compatibility with the winning attribution
  // is "stacked_revival" (e.g., Colonial Revival × Chippendale on a post-
  // 1876 piece). Listed here so the chart can SUPPRESS the partner Style
  // row for these — co-attribution is expected umbrella behavior, not a
  // transitional moment worth a second row. p5 also uses this list to skip
  // generic "competing attribution" framing for these pairs.
  stacked_revival_partner_ids?: string[];
  // Post-final-assessment style refinement: after convergence refines the
  // final dating envelope, reconcileFinalStyle() picks the appraiser-voice
  // label that the date actually supports (revival wave name when dates
  // match a wave, named transitional period when applicable, reproduction
  // framing when dates fall outside all known windows). Surfaces in
  // display_form and the report's "Style identification" line instead of
  // the bare attribution-time label.
  final_style?: FinalStyleReconciliation;
  // Block 4 B5: hybrid form annotation from FormEntry.secondary_form_associations
  hybrid?: HybridAnnotation | null;
  // Parking-lot 2d: cousin contrasts from the picked form that name the
  // p3-scored alternative forms. Lean wiring per D-PH3-2 lean: string
  // matching from cousin_form_contrasts prose against alternative form
  // names/ids. Surfaces in the report to explain "why this form, not
  // that one" calls. Does NOT influence scoring decisions.
  cousin_contrasts?: CousinContrastMatch[];
  // Free-text regional / period context for the picked form. Authoring prose
  // surfaced for the report's "Regional & period context" dropdown.
  regional_period_notes?: string;
  // General "how this form differs from similar pieces" prose (the picked
  // form's full cousin_form_contrasts). Surfaced for the "How it differs"
  // dropdown. Distinct from cousin_contrasts (alternative-matched subset).
  cousin_form_contrasts?: string[];
  // Block 9: undated observations categorically aligned with the style
  // attribution. Surfaced in the report as supporting context — does NOT
  // contribute to dating-overlap layers to avoid double-counting.
  style_supporting_evidence?: StyleSupportingObservation[];
};

type Phase4Result = {
  weighted_clues: any[];
  confidence_drivers: { increased: string[]; limited: string[] };
  category_scores: any;
};

type Phase5Result = {
  conflicts: any[];
  resolutions: any[];
  summary: string;
  // Block 7a: hard-negative clues whose dating is COMPATIBLE with the
  // overall dating envelope are surfaced as supporting context rather than
  // conflicts. Conflicts section stays for genuine date-incompatible cases.
  supporting_context?: string[];
};

type Phase6Result = {
  supported_findings: string[];
  tentative_findings: string[];
  more_evidence_needed: string[];
  summary: string;
  valuation: any;
  // Block 3a: structured 8-layer dating-overlap data for Full Analysis viz
  dating_overlap?: DatingOverlapData;
};

type ClaudeResult =
  | { ok: true; parsed: any; raw: string }
  | { ok: false; error: any };

export const CLUE_LIBRARY: Record<string, { category: string; hardNegative?: boolean; formHint?: string; dateHint?: string; weight: number }> = {
  maker_label: { category: "label", weight: 0.98 },
  roos_label: { category: "label", formHint: "Roos cedar chest / hope chest", dateHint: "c. 1940–1960", weight: 0.99 },
  lane_label: { category: "label", formHint: "Lane cedar chest / hope chest", dateHint: "c. 1930–1965", weight: 0.99 },

  seating_present: { category: "form", weight: 0.78 },
  telephone_shelf: { category: "form", formHint: "Telephone bench", dateHint: "c. 1900–1935", weight: 0.9 },
  seating_surface: { category: "form", formHint: "Bench or chair", weight: 0.78 },
  backrest_present: { category: "structure", formHint: "Bench or chair", weight: 0.72 },
  spindle_back: { category: "structure", formHint: "Bench or telephone bench", weight: 0.76 },
  secondary_surface: { category: "function", formHint: "Writing bench or telephone bench", weight: 0.82 },
  writing_surface: { category: "function", formHint: "Desk or writing bench", weight: 0.84 },
  drop_front_desk: { category: "construction", formHint: "Secretary desk", weight: 0.88 },
  pigeonholes: { category: "construction", formHint: "Secretary desk", weight: 0.82 },
  mirror_present: { category: "form", weight: 0.62 },
  open_shelving: { category: "form", weight: 0.65 },
  pedestal_column: { category: "form", formHint: "Pedestal stand", weight: 0.9 },
  metal_bed_frame: { category: "form", formHint: "Iron bed frame", dateHint: "c. 1880–1920", weight: 0.92 },
  armchair_form: { category: "form", formHint: "Armchair", weight: 0.86 },
  upholstered_back: { category: "materials", weight: 0.72 },

  drawer_present: { category: "construction", weight: 0.45 },
  multiple_drawer_case: { category: "construction", formHint: "Chest of drawers / dresser", weight: 0.78 },
  door_present: { category: "construction", weight: 0.5 },
  cabinet_form: { category: "form", formHint: "Cabinet", weight: 0.74 },
  lift_lid: { category: "construction", formHint: "Blanket chest / storage chest", weight: 0.86 },
  cedar_lining: { category: "materials", formHint: "Cedar chest / hope chest", weight: 0.88 },

  cabriole_leg: { category: "style", dateHint: "18th century form; common revival c. 1890–1940", weight: 0.68 },
  shell_carving: { category: "style", weight: 0.65 },
  claw_or_pad_foot: { category: "style", weight: 0.62 },
  barley_twist: { category: "style", dateHint: "spiral/barley-twist turning spans Baroque originals, Jacobean Revival, and Victorian revival production; not era-specific on its own", weight: 0.78 },
  heavy_carving: { category: "style", weight: 0.65 },
  spindle_gallery: { category: "style", weight: 0.62 },

  // Golden Oak Era / late-Victorian factory oak vocabulary. These keys are
  // emitted by the LLM on oak-era dressers, sideboards, and case goods.
  // `golden_oak_era_possible` is now a materials/wood-layer anchor (not a
  // style cue) — per appraiser direction it lives in the wood HCL as an oak
  // variant, NOT as a style family. dateHint resolves from canonical via
  // engineCanonicalMap (wood_variant_evidence_golden_oak_era → peak 1890–1915);
  // category=materials routes the dating signal into the wood layer of the
  // dating overlap, where it converges with form/construction evidence.
  golden_oak_era_possible: { category: "materials", weight: 0.65 },
  flat_top_overhanging: { category: "form", dateHint: "c. 1800–1930", weight: 0.5 },
  empire_transitional_style: { category: "style", dateHint: "c. 1840–1880", weight: 0.5 },
  scrolled_bracket_feet: { category: "form", dateHint: "c. 1880–1930", weight: 0.55 },

  drop_leaf_hinged: { category: "construction", formHint: "Drop-leaf table", dateHint: "1720–1930", weight: 0.9 },
  gateleg_support: { category: "construction", formHint: "Gateleg table", dateHint: "1680–1800; revival 1880–1930", weight: 0.92 },
  rule_joint: { category: "joinery", weight: 0.78 },
  slant_front: { category: "construction", formHint: "Slant-front desk", dateHint: "1700–1860", weight: 0.9 },
  cylinder_roll: { category: "construction", formHint: "Roll-top desk", dateHint: "1870–1920", weight: 0.92 },
  extension_mechanism: { category: "construction", formHint: "Extension table", weight: 0.85 },

  hand_cut_dovetails: { category: "joinery", dateHint: "pre-1860", weight: 0.88 },
  machine_dovetails: { category: "joinery", dateHint: "post-1860", weight: 0.82 },
  mortise_and_tenon: { category: "joinery", weight: 0.72 },
  dowel_joinery: { category: "joinery", dateHint: "spans eras (pegged/drawbored joints to modern machine doweling); limited dating value on its own", weight: 0.72 },

  pit_saw_marks: { category: "toolmarks", dateHint: "pre-1830", weight: 0.86 },
  circular_saw_arcs: { category: "toolmarks", dateHint: "post-1830", weight: 0.78 },
  band_saw_lines: { category: "toolmarks", dateHint: "post-1870", weight: 0.75 },

  hand_forged_nail: { category: "fasteners", dateHint: "pre-1800", weight: 0.88 },
  cut_nail: { category: "fasteners", dateHint: "1790–1890", weight: 0.82 },
  wire_nail: { category: "fasteners", dateHint: "post-1880", weight: 0.72 },
  phillips_screw: { category: "fasteners", hardNegative: true, dateHint: "post-1934", weight: 0.9 },
  staple_fastener: { category: "fasteners", hardNegative: true, dateHint: "post-1945", weight: 0.9 },
  plywood_structural: { category: "materials", hardNegative: true, dateHint: "post-1920", weight: 0.9 },
  plywood_drawer_bottom: { category: "materials", hardNegative: true, dateHint: "post-1920", weight: 0.88 },
  sheet_back_panel: { category: "materials", dateHint: "post-1900", weight: 0.72 },
 
  modern_concealed_hinge: { category: "hardware", hardNegative: true, dateHint: "post-1950", weight: 0.92 },

  porcelain_caster: { category: "hardware", dateHint: "1830–1900", weight: 0.65 },
  decorative_bail_pull: { category: "hardware", weight: 0.55 },
  round_wood_knob: { category: "hardware", weight: 0.5 },
  shellac_crazing: { category: "finish", dateHint: "1800–1920", weight: 0.55 },
  polyurethane: { category: "finish", dateHint: "post-1960", weight: 0.62 },
  // Block 6: high-value finish/hardware/joinery vocabulary observed in real
  // LLM scans (Toledo industrial chair) but missing engine keys. Adding
  // these so the expanded P0 prompt can route observations to dated entries.
  lacquer_finish: { category: "finish", dateHint: "1920–1980", weight: 0.55 },
  painted_metal_finish: { category: "finish", dateHint: "post-1900", weight: 0.5 },
  shellac_intact: { category: "finish", dateHint: "1800–1920", weight: 0.55 },
  refinished_surface: { category: "finish", dateHint: "any period; alteration evidence", weight: 0.35 },
  welded_joint: { category: "joinery", dateHint: "post-1910", weight: 0.7 },
  bent_molded_plywood: { category: "materials", dateHint: "post-1935", weight: 0.78 },
  swivel_mechanism: { category: "hardware", dateHint: "post-1880", weight: 0.7 },
  height_adjustment_mechanism: { category: "hardware", dateHint: "post-1890", weight: 0.7 },
  modern_caster: { category: "hardware", dateHint: "post-1900", weight: 0.55 },
  stamped_metal_bracket: { category: "hardware", dateHint: "post-1900", weight: 0.6 },
  hand_plane_chatter: { category: "toolmarks", dateHint: "pre-1880", weight: 0.7 },
  possible_plywood_or_laminated_panel: {
  category: "construction",
  dateHint: "uncertain panel construction; does not confirm modern manufacture",
  weight: 0.25,
  },
    parquetry_veneer: {
    category: "materials",
    dateHint: "parquetry or marquetry veneer supports formal revival, French-style, or high-style cabinetmaking; dating depends on construction",
    weight: 0.72,
  },
  stringing_inlay: {
    category: "materials",
    dateHint: "stringing and banding support neoclassical, Federal/Sheraton, Louis XVI, or revival cabinetmaking",
    weight: 0.68,
  },
  ormolu_mounts: {
    category: "hardware",
    dateHint: "ormolu or gilt-bronze style mounts support French neoclassical or Louis XVI revival context",
    weight: 0.62,
  },
  brass_foot_sabots: {
    category: "hardware",
    dateHint: "brass foot sabots support French neoclassical, Louis XVI, or later revival furniture",
    weight: 0.6,
  },
  louis_xvi_french_neoclassical: {
    category: "style",
    dateHint: "French Louis XVI / neoclassical style; style supports context but does not independently date construction",
    weight: 0.58,
  },
  tapered_leg: {
    category: "structure",
    dateHint: "tapered legs are common in Federal, Sheraton, Louis XVI, neoclassical, and revival furniture",
    weight: 0.64,
  },
  metal_frame: {
    category: "materials",
    dateHint: "metal furniture construction; date depends on form, joints, plating, and fasteners",
    weight: 0.70,
  },
  tubular_steel: {
    category: "materials",
    dateHint: "tubular steel furniture became especially associated with modernist and mid-century production",
    weight: 0.78,
  },
  wrought_iron: {
    category: "materials",
    dateHint: "wrought iron furniture spans Victorian, garden, and revival production; date depends on construction and finish",
    weight: 0.72,
  },
  cast_iron: {
    category: "materials",
    dateHint: "cast iron furniture and bed components are common in late 19th and early 20th century production",
    weight: 0.74,
  },
  brass_frame: {
    category: "materials",
    dateHint: "brass beds and brass-mounted furniture were especially common from the late Victorian period into the early 20th century",
    weight: 0.72,
  },
  chrome_frame: {
    category: "materials",
    dateHint: "chrome-plated furniture strongly suggests Art Deco, Machine Age, mid-century, or later modern production",
    weight: 0.78,
  },

  fully_upholstered: {
    category: "materials",
    dateHint: "upholstered seating spans many periods; dating depends on frame, springs, stuffing, legs, and upholstery method",
    weight: 0.68,
  },
  visible_springs: {
    category: "construction",
    dateHint: "visible spring construction supports upholstered seating analysis; coil, sinuous, and webbing types affect dating",
    weight: 0.72,
  },
  tufted_upholstery: {
    category: "style",
    dateHint: "tufted upholstery is common across Victorian, Chesterfield, traditional, and revival seating forms",
    weight: 0.58,
  },
  exposed_upholstery_tacks: {
    category: "construction",
    dateHint: "visible upholstery tacks can support older or traditional upholstery methods, but may also be decorative",
    weight: 0.58,
  },

  // Block 12: upholstery vocabulary expansion. Maps to canonical
  // upholstery_construction + upholstery_cover libraries via
  // engineCanonicalMap.ts CLUE_TO_CANONICAL. Categories use "upholstery"
  // string so dating-overlap viz aggregates them into the upholstery layer.
  coil_spring:           { category: "upholstery", weight: 0.78 },
  hand_tied_coil_spring: { category: "upholstery", weight: 0.82 },
  serpentine_spring:     { category: "upholstery", weight: 0.78 },
  drop_in_spring_unit:   { category: "upholstery", weight: 0.78 },
  marshall_pocket_coil:  { category: "upholstery", weight: 0.78 },
  no_spring_seat:        { category: "upholstery", weight: 0.68 },
  jute_webbing:          { category: "upholstery", weight: 0.72 },
  elastic_webbing:       { category: "upholstery", weight: 0.72 },
  horsehair_stuffing:    { category: "upholstery", weight: 0.78 },
  cotton_batting:        { category: "upholstery", weight: 0.65 },
  foam_padding:          { category: "upholstery", weight: 0.70 },
  polyurethane_foam:     { category: "upholstery", weight: 0.78 },
  feather_down_fill:     { category: "upholstery", weight: 0.72 },
  button_tufting:        { category: "upholstery", weight: 0.65 },
  nailhead_trim:         { category: "upholstery", weight: 0.62 },
  hand_tacks:            { category: "upholstery", weight: 0.65 },
  upholstery_staple_construction: { category: "upholstery", weight: 0.78 },
  velvet_cover:          { category: "upholstery", weight: 0.65 },
  damask_cover:          { category: "upholstery", weight: 0.65 },
  haircloth_cover:       { category: "upholstery", weight: 0.78 },
  leather_cover:         { category: "upholstery", weight: 0.65 },
  vinyl_cover:           { category: "upholstery", weight: 0.78 },
  chintz_cover:          { category: "upholstery", weight: 0.62 },
  needlepoint_cover:     { category: "upholstery", weight: 0.65 },
  brocade_cover:         { category: "upholstery", weight: 0.62 },
  jacquard_cover:        { category: "upholstery", weight: 0.62 },
  // Dust-cover MATERIAL as a terminus-post-quem (synthesized by deriveDustCoverClues
  // from the dust_cover observation's description). Synthetic non-woven fabric and
  // stapled attachment are post-WWII upholstery practice → hard-negative post-1950
  // floors. Woven cotton cambric spans a broad period → no floor on its own.
  dust_cover_synthetic_nonwoven: { category: "upholstery", hardNegative: true, dateHint: "post-1950", weight: 0.82 },
  dust_cover_stapled:            { category: "upholstery", hardNegative: true, dateHint: "post-1950", weight: 0.78 },
  dust_cover_cambric_woven:      { category: "upholstery", weight: 0.55 },

  woven_body: {
    category: "materials",
    dateHint: "woven wicker or reed construction appears in Victorian, porch, Arts and Crafts, and later revival furniture",
    weight: 0.72,
  },
  rattan_frame: {
    category: "materials",
    dateHint: "rattan furniture is common in porch, tropical, mid-century, and revival production",
    weight: 0.72,
  },
  cane_panels: {
    category: "materials",
    dateHint: "cane panels appear on many 19th and 20th century chairs, settees, beds, and Colonial Revival forms",
    weight: 0.62,
  },

  glass_top: {
    category: "materials",
    dateHint: "glass tops are often replacement or protective surfaces unless integrated into the original design",
    weight: 0.42,
  },
  laminate_surface: {
    category: "materials",
    dateHint: "laminate surfaces generally support mid-century or later production unless used as a later alteration",
    weight: 0.68,
  },
  formica_surface: {
    category: "materials",
    dateHint: "Formica or similar laminate is strongly associated with mid-century and later furniture",
    weight: 0.70,
  },
  chrome_and_laminate: {
    category: "materials",
    dateHint: "chrome and laminate combinations strongly support mid-century kitchen, dinette, or utility furniture",
    weight: 0.78,
  },

  molded_plastic: {
    category: "materials",
    dateHint: "molded plastic furniture generally indicates postwar modern or later production",
    weight: 0.76,
  },
  acrylic_clear: {
    category: "materials",
    dateHint: "clear acrylic or Lucite furniture generally indicates mid-20th century or later modern production",
    weight: 0.78,
  },
  no_phillips_screws_observed: {
  category: "fasteners",
  dateHint: "absence of visible Phillips screws; removes post-1934 fastener evidence but does not independently date the piece",
  weight: 0.35,
},
    solid_wood_construction: {
  category: "construction",
  dateHint: "solid wood construction; not a plywood indicator",
  weight: 0.72,
},
  solid_wood_side_panels: {
  category: "construction",
  dateHint: "solid side-panel construction; supports pre-plywood or traditional case construction",
  weight: 0.72,
},

frame_and_panel_sides: {
  category: "construction",
  dateHint: "traditional frame-and-panel side construction; dating depends on joinery and fasteners",
  weight: 0.74,
},

solid_plank_back: {
  category: "construction",
  dateHint: "solid plank back construction; usually pre-plywood or traditional case construction",
  weight: 0.78,
},

wood_knob_pulls: {
  category: "hardware",
  dateHint: "wooden knob pulls are common on 19th and early 20th century case furniture, but may be replaced",
  weight: 0.55,
},

lock_escutcheons: {
  category: "hardware",
  dateHint: "drawer lock escutcheons support period case-furniture construction but are not independently decisive",
  weight: 0.56,
},

drawer_box_joinery: {
  category: "joinery",
  dateHint: "drawer-box joinery evidence; dating depends on whether hand-cut, machine-cut, dado, or butt construction is visible",
  weight: 0.62,
},

rope_carved_pilasters: {
  category: "style",
  dateHint: "Empire or transitional case-furniture style cue; lower authority than construction",
  weight: 0.58,
},

overhanging_top: {
  category: "structure",
  dateHint: "overhanging cornice or top board supports Empire or transitional case-furniture form",
  weight: 0.58,
},

// ─────────────────────────────────────────────────────────────────────
// Metal joinery and metal wear/condition clues — Batch 1 non-wood
// taxonomy expansion (authored 2026-05-19). Parallel canonical entries
// in lib/constraints/joinery.ts under joinery_category_metal_joining.
// Welded_joint already existed above (line ~396); these add the rest
// of the metal-joining vocabulary and metal-specific wear signals.
// ─────────────────────────────────────────────────────────────────────

hand_forged_metal_joint: {
  category: "joinery",
  dateHint: "pre-1900 dominant for American wrought-iron furniture; post-1900 hand-forged work is usually artisan/revival",
  weight: 0.78,
},
riveted_metal_joint: {
  category: "joinery",
  dateHint: "c. 1850-1940 industrial dominance for sheet steel, wrought iron, and brass furniture; continues in industrial-style production",
  weight: 0.72,
},
brazed_metal_joint: {
  category: "joinery",
  dateHint: "late-19th-c. to present; especially diagnostic for brass beds, brass lighting bodies, gas fixtures, and decorative metalwork",
  weight: 0.70,
},
soldered_metal_joint: {
  category: "joinery",
  dateHint: "spans all periods; especially common in tinware, pewter, lightweight brass, and lighting bodies",
  weight: 0.55,
},
spot_welded_joint: {
  category: "joinery",
  dateHint: "post-1925 industrial; dominant c. 1930-present for tubular-steel chairs, metal lawn furniture, sheet-steel cabinets, and lighting bodies",
  weight: 0.75,
},
mig_tig_welded_joint: {
  category: "joinery",
  dateHint: "post-1948 (MIG) / post-1941 (TIG); widespread c. 1960-present; primary reproduction-detection signal for wrought-iron and Victorian-revival metalwork",
  weight: 0.80,
},
crimped_folded_seam: {
  category: "joinery",
  dateHint: "industrial sheet-metal lock seams widespread post-1850; common in tinware lighting, mid-20th-c. metal kitchen cabinets, stamped-metal lawn furniture",
  weight: 0.62,
},
wire_wrapped_metal_joint: {
  category: "joinery",
  dateHint: "spans all periods; especially common in wicker-and-iron c. 1880-1930, decorative lighting bands, and rattan-metal hybrid furniture",
  weight: 0.50,
},

// Metal wear and condition signals — independent of joining method
rust_pitting: {
  category: "condition",
  dateHint: "active iron or steel oxidation; structural-integrity concern; finish-failure restoration signal",
  weight: 0.55,
},
plating_loss: {
  category: "condition",
  dateHint: "chrome, nickel, or brass plating wear/loss; common on tubular-steel, chrome-frame, and plated brass furniture; restoration or refinishing common",
  weight: 0.55,
},
joint_corrosion: {
  category: "condition",
  dateHint: "corrosion concentrated at metal joints (galvanic, crevice, or stress corrosion); structural-integrity concern at the weakest geometry",
  weight: 0.60,
},
weld_repair_visible: {
  category: "condition",
  dateHint: "modern weld over an original joint indicates later repair; preserve original joining method as the dating signal and record the weld as restoration evidence",
  weight: 0.60,
},
powder_coat_overspray: {
  category: "finish",
  dateHint: "powder-coat finish post-1960s; modern refinish over earlier metal pieces is common and obscures original finish, plating, and surface wear",
  weight: 0.55,
},
bent_or_sprung_metal: {
  category: "condition",
  dateHint: "permanent metal deformation from use, damage, or stress; structural concern for tubular steel, wrought iron, and sheet-metal furniture",
  weight: 0.50,
},

// Engine signaling clue — not appraisal evidence. Emitted by runAllPhases
// only when BOTH the initial p0 scan AND the deep-extraction recovery pass
// return zero observations. Acts as a "no structured evidence available"
// marker that downstream consumers can use to suppress confident form
// claims and surface a re-shoot message to the user. Weight 0 so it never
// contributes to dating or form scoring.
fallback_form: {
  category: "signal",
  dateHint: "no structured observations recovered; engine should suppress confident claims and request better photos",
  weight: 0,
},

// ─────────────────────────────────────────────────────────────────────
// Clock-specific clues — stress-test fix #4 (2026-05-20). Without these,
// rich clock observations (winding arbors, brass dial bezel, pendulum
// styles, decorative tablet) collected at P0 contributed 0 to the dating
// envelope ("present but undated"). Each entry pairs a category (form
// for case-shape clues; hardware for fittings; style for ornament) with
// a dateHint string that the engine reads into the layer-by-layer
// dating overlap. Weights calibrated to authority — case-form clues
// (arched_glazed_dial_door, turned_spindle_gallery) carry higher weight
// because the case style narrowly dates Victorian shelf clock production;
// hardware clues are broader and lower-weight.
// ─────────────────────────────────────────────────────────────────────

metal_clock_form: {
  category: "form",
  dateHint: "clock case form; mantel, shelf, kitchen, or parlor clock — broad American production c. 1820-1940 (Connecticut clock industry dominance)",
  weight: 0.78,
},
clock_case_form: {
  category: "form",
  dateHint: "clock case form; surface-set shelf/mantel clock — broad American production c. 1820-1940",
  weight: 0.78,
},
arched_glazed_dial_door: {
  category: "form",
  dateHint: "arched glass dial door on a shelf clock case; characteristic of American round-top and arch-top mantel clock production c. 1870-1910",
  weight: 0.72,
},
turned_spindle_gallery: {
  category: "style",
  dateHint: "turned-spindle gallery at the top of a shelf clock case; characteristic of Victorian American gingerbread/kitchen clock production c. 1875-1900",
  weight: 0.75,
},
scrolled_side_corbels: {
  category: "style",
  dateHint: "scrolled or ribbon-carved corbel brackets flanking the dial of a shelf clock; characteristic of Victorian American shelf clock production c. 1870-1900",
  weight: 0.70,
},
reverse_painted_lower_tablet: {
  category: "style",
  dateHint: "reverse-painted decorative glass tablet covering the pendulum window of a shelf clock; characteristic of American Victorian production c. 1850-1900",
  weight: 0.72,
},
winding_arbors: {
  category: "hardware",
  dateHint: "winding arbors on a clock dial (8-day time-and-strike spring movement = 2 arbors); American spring-driven shelf clock production c. 1840-present",
  weight: 0.55,
},
striking_mechanism: {
  category: "function",
  dateHint: "mechanical striking train in a clock; broad pre-1970 American mechanical clock production",
  weight: 0.50,
},
pendulum_bob_cast: {
  category: "hardware",
  dateHint: "decorative cast brass pendulum bob visible behind glass tablet; American Victorian shelf clock production c. 1860-1910",
  weight: 0.60,
},
brass_dial_bezel: {
  category: "hardware",
  dateHint: "brass dial bezel/surround on a clock dial; typical of American mantel clock production c. 1860-1920",
  weight: 0.58,
},

// ─────────────────────────────────────────────────────────────────────
// Wicker dating ladder — Batch 3 non-wood taxonomy expansion (2026-05-19).
// Prior wicker vocabulary: woven_body, rattan_frame, cane_panels — all
// generic and undated. These new clues add the major dating anchors
// (Lloyd loom 1917+, Bar Harbor 1900-1920, Victorian curlicue 1880-1900,
// mid-century streamlined 1945-1970) and weave-pattern signals that
// appraisers use to date wicker furniture. Note: these clues route by
// LLM text-pattern matching; a future prompt-expansion pass should
// explicitly ask the LLM to observe "paper fiber vs natural reed",
// "weave pattern density", and "ornament era" on wicker forms.
// ─────────────────────────────────────────────────────────────────────

// Material-and-era dating anchors
lloyd_loom_paper_fiber: {
  category: "materials",
  dateHint: "post-1917 American hard-anchor; Marshall B. Lloyd patented Lloyd loom machinery in 1917, weaving twisted kraft paper around a wire core on automated looms. Construction is highly diagnostic and survives well — paper-fiber 'wicker' over a wire armature is visible at broken strands and at frame edges. Peak American production c. 1920-1950 (Lloyd Loom of Heywood-Wakefield); continues in present-day reproduction. A piece otherwise styled or attributed pre-1917 cannot be Lloyd loom in original construction.",
  weight: 0.85,
},
bar_harbor_style_wicker: {
  category: "style",
  dateHint: "c. 1900-1920 American resort-wicker era; named for Maine resort town. Open airy weave, geometric forms, minimal curlicue ornament, often natural or white-painted finish. Distinct from heavy Victorian curlicue wicker (c. 1880-1900) and from Lloyd loom paper fiber (post-1917). Strong collector market for original-period Bar Harbor settees, chairs, and tables.",
  weight: 0.72,
},
victorian_curlicue_wicker: {
  category: "style",
  dateHint: "c. 1880-1900 American Victorian wicker era; heavy ornament with scrolls, curlicues, hearts, fans, photo-frame insets, and densely decorated backs. Often natural finish, gilt accents, or stained dark. Distinct from later Bar Harbor open-weave (c. 1900-1920) and Lloyd loom paper fiber (post-1917). Heywood Bros., Wakefield Rattan, and merged Heywood-Wakefield are major makers; attribution requires label, mark, or catalog match.",
  weight: 0.72,
},
mid_century_streamlined_wicker: {
  category: "style",
  dateHint: "c. 1945-1970 mid-century modern wicker and rattan production; lighter forms, simpler curves, often paired with steel or aluminum frames, often imported Filipino or Asian-Pacific work. Distinct from earlier Victorian, Bar Harbor, and Lloyd loom traditions. Compare papasan, peacock chair, and tropical-modern vocabularies.",
  weight: 0.65,
},

// Weave-pattern signals (sub-diagnostic; combine with era/material above)
wicker_weave_close: {
  category: "construction",
  dateHint: "tight close weave with minimal gaps between strands; common in higher-quality production across periods. Less air-flow, denser visual mass; often associated with formal parlor wicker, Lloyd loom paper fiber, or quality reed work.",
  weight: 0.55,
},
wicker_weave_open: {
  category: "construction",
  dateHint: "open or airy weave with visible gaps between strands; common in Bar Harbor-era resort wicker (c. 1900-1920) and porch/sunroom furniture. Often paired with white-painted or natural finish.",
  weight: 0.55,
},
wicker_weave_basket: {
  category: "construction",
  dateHint: "basket-weave pattern (alternating over-under in groups of two or more strands); often decorative panel insert on Victorian and early-20th-c. wicker. Distinct from simple over-under and from herringbone.",
  weight: 0.50,
},

// Material identification (broader than Lloyd loom)
paper_fiber_construction: {
  category: "materials",
  dateHint: "paper-fiber (twisted kraft paper) construction post-1900 industrial development; Lloyd loom paper fiber is the dominant subtype post-1917. Distinct from natural rattan, reed, and cane. Paper fiber appears as uniform extruded strands rather than the irregular tapered profile of natural plant fibers.",
  weight: 0.78,
},

// Condition / restoration signals
wicker_strand_breakage: {
  category: "condition",
  dateHint: "broken, missing, or unraveled wicker strands; structural condition signal; common on aged or heavily-used wicker. Repair difficulty depends on weave pattern and material (paper fiber harder to splice invisibly than natural reed).",
  weight: 0.55,
},
wicker_paint_buildup: {
  category: "condition",
  dateHint: "multiple paint layers on wicker obscuring original finish, weave detail, and material identification; common on long-lived porch and sunroom pieces. Paint stratigraphy may help dating but original finish (natural, shellac, stain, original paint color) is often hidden.",
  weight: 0.50,
},
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function asString(v: any) {
  return typeof v === "string" ? v.trim() : "";
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function toConfidenceBand(pct: number): "High" | "Moderate" | "Low" | "Inconclusive" {
  if (pct >= 85) return "High";
  if (pct >= 65) return "Moderate";
  if (pct >= 40) return "Low";
  return "Inconclusive";
}

// Prepend a style label to a form name without stuttering. Some form display
// names bake a style into them (form_cylinder_desk → "Louis XVI Revival
// cylinder desk"); prepending the style context or a reconciled wave label
// ("Centennial French Louis XVI Revival") then doubled the shared words —
// "Centennial French Louis XVI Revival Louis XVI Revival cylinder desk". Strip
// a leading run of the form that duplicates the trailing run of the style
// label, and skip entirely when the form already contains the full style.
function composeStyledForm(stylePrefix: string | null | undefined, formBase: string): string {
  const prefix = String(stylePrefix ?? "").trim();
  if (!prefix) return formBase;
  if (formBase.toLowerCase().includes(prefix.toLowerCase())) return formBase;
  const s = prefix.split(/\s+/);
  const b = formBase.trim().split(/\s+/);
  let overlap = 0;
  for (let k = Math.min(s.length, b.length); k >= 1; k--) {
    if (s.slice(s.length - k).join(" ").toLowerCase() === b.slice(0, k).join(" ").toLowerCase()) {
      overlap = k;
      break;
    }
  }
  const rest = b.slice(overlap).join(" ");
  return rest ? `${prefix} ${rest}` : prefix;
}

function cleanJsonText(raw: string): string {
  return String(raw || "").replace(/```json/gi, "").replace(/```/g, "").trim();
}

function tryJsonParse(text: string): any | null {
  try { return JSON.parse(text); } catch { return null; }
}

function extractBalancedJson(text: string): string | null {
  const cleaned = cleanJsonText(text);
  const start = cleaned.indexOf("{");
  if (start < 0) return null;
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (depth === 0) return cleaned.slice(start, i + 1);
  }
  return null;
}

function parseModelJson(raw: string): any | null {
  if (!raw) return null;

  let text = String(raw).trim();

  if (text.startsWith("```")) {
    text = text
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();
  }

  return tryJsonParse(text) || tryJsonParse(extractBalancedJson(text) || "");
}

function normalizeClueKey(v: any): string | null {
  const key = asString(v).toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_");
  if (!key) return null;
  return canonicalClueKey(key);
}

function normalizePhase0Clue(raw: any): string | null {
  const key = normalizeClueKey(raw?.clue || raw?.key || raw?.reference_id);
  const valueText = String(raw?.value ?? "").toLowerCase();
  const desc = descriptionFromObservation(raw).toLowerCase();

  if (!key) return null;
    if (key === "maker_label") {
    const saysNoMaker =
      valueText === "false" ||
      desc.includes("no visible maker") ||
      desc.includes("no maker") ||
      desc.includes("no label") ||
      desc.includes("no stamp") ||
      desc.includes("no mark detected") ||
      desc.includes("maker's label") && desc.includes("no visible");

    if (saysNoMaker) return null;

    return key;
  }

  if (key === "phillips_screw") {
  const saysNoPhillips =
    desc.includes("no phillips") ||
    desc.includes("no visible phillips") ||
    desc.includes("phillips screws not observed") ||
    desc.includes("not observed") ||
    desc.includes("without phillips");

  if (saysNoPhillips) {
    return "no_phillips_screws_observed";
  }
    
  return key;
}
  
  if (key === "plywood_structural" || key === "plywood_drawer_bottom") {
  const saysNoPlywood =
    valueText === "false" ||
    desc.includes("no plywood") ||
    desc.includes("not plywood") ||
    desc.includes("without visible laminate") ||
    desc.includes("without laminate") ||
    desc.includes("no visible laminate") ||
    desc.includes("solid wood grain") ||
    desc.includes("solid wood throughout") ||
    desc.includes("rather than plywood") ||
    desc.includes("pre-plywood") ||
    desc.includes("not a plywood") ||
    desc.includes("no visible plywood") ||
    desc.includes("solid wood planks");

  const saysPossiblePlywood =
    desc.includes("possible plywood") ||
    desc.includes("possibly plywood") ||
    desc.includes("could indicate") ||
    desc.includes("may indicate") ||
    desc.includes("laminated panel") ||
    desc.includes("layered edge");

  if (saysNoPlywood && !saysPossiblePlywood) {
    return "solid_wood_construction";
  }

  if (saysPossiblePlywood) {
    return "possible_plywood_or_laminated_panel";
  }

  return key;
}

  // scrolled_bracket_feet is a decorative late-Victorian / Golden Oak /
  // Colonial Revival foot treatment, NOT an Empire scroll foot. Keep it
  // distinct so it does not collapse into american_empire_style and anchor
  // an Empire (c. 1810–1850) attribution on a factory-era oak dresser.
  if (key === "scrolled_bracket_feet") {
    return "scrolled_bracket_feet";
  }

  if (
    key === "empire_style_feet" ||
    key === "scrolled_empire_feet" ||
    key === "scrolled_feet" ||
    key === "rounded_pilaster_stiles" ||
    key === "empire_style" ||
    key === "ogee_curved_top_rail"
  ) {
    return "american_empire_style";
  }

  if (
  key === "drawer_configuration" ||
  key === "drawer_count" ||
  key === "tall_chest_form" ||
  key === "top_row_split_drawers" ||
  key === "split_top_drawer_row" ||
  key === "drawer_depth_graduation" ||
  key === "storage" ||
  key === "chest_of_drawers" ||
  key === "tall_chest" ||
  key === "highboy_form" ||
  key === "highboy_style"
) {
  return "multiple_drawer_case";
}

  if (key === "primary_wood_oak") {
    return "oak_primary";
  }

  if (
    key === "secondary_wood_drawer_box" ||
    key === "drawer_bottom_material" ||
    key === "drawer_runner_type"
  ) {
    return "solid_wood_drawer_construction";
  }

  if (key === "back_panel_construction" || key === "plank_back_panels") {
    return "solid_plank_back";
  }
 if (
    key === "cylinder_roll_top" ||
    key === "cylinder_roll_top_desk" ||
    key === "roll_top_cylinder" ||
    key === "cylinder_rolltop" ||
    key === "cylinder_desk" ||
    key === "barrel_roll_top" ||
    key === "bureau_a_cylindre"
  ) {
    return "cylinder_roll";
  }

  if (
    key === "legs" &&
    (
      desc.includes("tapered") ||
      valueText.includes("tapered")
    )
  ) {
    return "tapered_leg";
  }
  if (
    key === "tapered_square_legs" ||
    key === "tapered_round_legs" ||
    key === "square_tapered_legs" ||
    key === "round_tapered_legs"
  ) {
    return "tapered_leg";
  }
  if (
    key === "veneer_parquetry" ||
    key === "parquetry_veneer" ||
    key === "marquetry_veneer" ||
    key === "herringbone_veneer" ||
    key === "chevron_veneer" ||
    key === "quartered_parquetry"
  ) {
    return "parquetry_veneer";
  }

  if (
    key === "stringing_inlay" ||
    key === "satinwood_stringing_inlay" ||
    key === "boxwood_stringing_inlay" ||
    key === "brass_stringing" ||
    key === "boxwood_stringing" ||
    key === "satinwood_stringing" ||
    key === "crossbanded_borders" ||
    key === "crossbanding" ||
    key === "banding_inlay"
  ) {
    return "stringing_inlay";
  }

  if (
    key === "ormolu_corner_mounts" ||
    key === "ormolu_mounts" ||
    key === "brass_ormolu_mounts" ||
    key === "bronze_ormolu_mounts"
  ) {
    return "ormolu_mounts";
  }

  if (
    key === "acanthus_foot_sabots" ||
    key === "brass_foot_sabots" ||
    key === "foot_sabots"
  ) {
    return "brass_foot_sabots";
  }

  if (
    key === "french_louis_xvi_style" ||
    key === "louis_xvi_style" ||
    key === "louis_xvi_neoclassical_style" ||
    key === "neoclassical_louis_xvi_style" ||
    key === "french_neoclassical" ||
    key === "neoclassical_style_reference"
  ) {
    return "louis_xvi_french_neoclassical";
  }
  return key;
}

function includesAny(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

// Whole-word / whole-phrase matcher. Unlike includesAny's bare substring test,
// this requires word boundaries, so "loom" no longer matches inside
// "machine-loomed", "iron" no longer matches inside "environment", etc. Use
// this (not includesAny) for short single-word triggers where a substring of a
// larger word would be a false positive.
function containsWord(text: string, words: string[]) {
  return words.some((w) => {
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`).test(text);
  });
}

function collectText(value: any, out: string[] = []): string[] {
  if (value == null) return out;
  if (typeof value === "string") {
    if (value.trim()) out.push(value.trim());
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => collectText(v, out));
    return out;
  }
  if (typeof value === "object") Object.values(value).forEach((v) => collectText(v, out));
  return out;
}

function detectClueFromText(text: string): string | null {
  const t = text.toLowerCase();

  // GLOBAL NEGATION GUARD
  const isNegated = (phrase: string) =>
    includesAny(t, [
      `no ${phrase}`,
      `not ${phrase}`,
      `not a ${phrase}`,
      `not an ${phrase}`,
      `without ${phrase}`,
      `${phrase} not`,
      `absence of ${phrase}`,
      `no visible ${phrase}`,
      `rather than ${phrase}`,
      `${phrase} rather than`,
    ]);

  // Skip vague / uncertain statements entirely
  if (includesAny(t, ["not visible", "not confirmed", "cannot confirm", "unclear"])) return null;

  // LABELS
  if (includesAny(t, ["roos", "sweetheart cedar"])) return "roos_label";
  if (includesAny(t, ["lane cedar"])) return "lane_label";
  if (includesAny(t, ["maker label", "manufacturer label", "paper label", "stamp"])) return "maker_label";

  // FUNCTION (HIGH PRIORITY)
  if (!isNegated("telephone") && includesAny(t, ["telephone", "phone shelf", "telephone shelf"])) return "telephone_shelf";
  if (!isNegated("writing surface") && includesAny(t, ["writing surface", "desk surface"])) return "writing_surface";
  if (!isNegated("secondary surface") && includesAny(t, ["secondary surface", "raised surface"])) return "secondary_surface";

  // FORM
  if (!isNegated("seating") && includesAny(t, ["bench seat", "integrated seat", "seating"])) return "seating_present";
  if (!isNegated("backrest") && includesAny(t, ["backrest", "back rail"])) return "backrest_present";

  // DRAWERS (lower priority)
  if (!isNegated("drawer") && t.includes("drawer")) return "drawer_present";
  if (!isNegated("door") && t.includes("door")) return "door_present";

  // STYLE (low authority, guard heavily)
  // Style-FAMILY phrases route to the family clue KEY so a piece whose French
  // vocabulary the model bucketed as prose still earns a *supported* attribution
  // through clue-key provenance (the 2958afe gate), not raw prose tokens. Only
  // unambiguous family names — never generic era words ("neoclassical",
  // "revival", "colonial") that appear as incidental influence prose elsewhere.
  if (
    includesAny(t, ["french provincial", "louis xv", "louis xvi"]) &&
    !isNegated("french provincial") &&
    !isNegated("louis xv") &&
    !isNegated("louis xvi")
  )
    return "french_provincial_style";
  if (!isNegated("cabriole") && t.includes("cabriole")) return "cabriole_leg";
  if (!isNegated("barley twist") && t.includes("barley twist")) return "barley_twist";

  // Block 7b2: form-defining clue text fallbacks. Real LLM scans surface these
  // forms in description text (e.g., "cylinder lid visible", "drop-leaf
  // construction") but don't always set clue: cylinder_roll explicitly. Without
  // these text fallbacks, scoreForms can't fire the form-specific branches and
  // the engine falls back to weaker form readings (Secretary on letter-slot
  // evidence alone, etc.). Ordered most-specific first.
  if (!isNegated("cylinder") && includesAny(t, ["cylinder roll", "cylinder lid", "cylinder closure", "tambour cylinder", "bureau a cylindre", "bureau à cylindre", "cylindre", "rolling cylinder"])) return "cylinder_roll";
  if (!isNegated("cylinder") && t.includes("cylinder") && !t.includes("hydraulic")) return "cylinder_roll";
  if (!isNegated("slant") && includesAny(t, ["slant front", "slant-front", "slant top", "slanted writing"])) return "slant_front";
  if (!isNegated("drop leaf") && includesAny(t, ["drop-leaf", "drop leaf", "hinged leaf"])) return "drop_leaf_hinged";
  if (!isNegated("gateleg") && includesAny(t, ["gateleg", "gate-leg", "gate leg"])) return "gateleg_support";
  if (!isNegated("lift lid") && includesAny(t, ["lift lid", "lift-lid", "hinged top chest", "blanket chest top", "lift top"])) return "lift_lid";
  if (!isNegated("extension") && includesAny(t, ["extension mechanism", "extension table", "leaf extension"])) return "extension_mechanism";
  if (!isNegated("pedestal") && includesAny(t, ["pedestal column", "central pedestal", "pedestal base"])) return "pedestal_column";
  if (!isNegated("drop front") && includesAny(t, ["drop-front desk", "drop front desk", "drop-front writing surface", "drop front writing"])) return "drop_front_desk";
  if (!isNegated("pigeonhole") && includesAny(t, ["pigeonhole", "pigeon hole", "interior cubbies", "letter slot"])) return "pigeonholes";

  // Block 6: text-fallback patterns for evidence-library vocabulary. The
  // expanded P0 prompt instructs the LLM to use preferred keys directly,
  // but these fallbacks catch cases where the LLM emits descriptive text
  // instead. Ordered most-specific first so general patterns don't shadow.

  // JOINERY EVIDENCE
  if (!isNegated("dovetails") && includesAny(t, ["hand-cut dovetail", "hand cut dovetail", "irregular dovetail"])) return "hand_cut_dovetails";
  if (!isNegated("dovetails") && includesAny(t, ["machine-cut dovetail", "machine cut dovetail", "uniform dovetail", "machine dovetail"])) return "machine_dovetails";
  if (!isNegated("dovetails") && t.includes("dovetail")) return "machine_dovetails"; // conservative default
  if (!isNegated("welded") && includesAny(t, ["welded", "weld bead", "weld joint"])) return "welded_joint";
  if (!isNegated("dowel") && includesAny(t, ["dowel joinery", "dowel construction", "dowel join", "dowel peg"])) return "dowel_joinery";
  if (!isNegated("mortise") && includesAny(t, ["mortise and tenon", "mortise-and-tenon", "tenon joint", "pegged tenon"])) return "mortise_and_tenon";

  // FASTENER EVIDENCE — order matters (specific before generic)
  if (!isNegated("phillips") && includesAny(t, ["phillips screw", "phillips-head", "phillips head", "cross-recess"])) return "phillips_screw";
  if (!isNegated("staple") && includesAny(t, ["staple fastener", "wire staple", "structural staple"])) return "staple_fastener";
  if (!isNegated("nail") && includesAny(t, ["hand-forged nail", "hand forged nail", "hammered nail head", "forged nail"])) return "hand_forged_nail";
  if (!isNegated("nail") && includesAny(t, ["cut nail", "tapered nail", "rectangular nail"])) return "cut_nail";
  if (!isNegated("nail") && includesAny(t, ["wire nail", "round nail shank"])) return "wire_nail";
  if (!isNegated("screw") && includesAny(t, ["slotted screw", "slotted-head screw"])) return "slotted_screw";

  // TOOLMARK EVIDENCE
  if (!isNegated("pit-saw") && includesAny(t, ["pit-saw", "pit saw", "irregular diagonal saw"])) return "pit_saw_marks";
  if (!isNegated("circular saw") && includesAny(t, ["circular saw", "circular-saw arc", "saw arc"])) return "circular_saw_arcs";
  if (!isNegated("band saw") && includesAny(t, ["band saw", "band-saw"])) return "band_saw_lines";
  if (!isNegated("hand plane") && includesAny(t, ["hand-plane", "hand plane", "plane chatter", "plane scallop"])) return "hand_plane_chatter";

  // FINISH EVIDENCE — specific finishes before generic
  if (!isNegated("polyurethane") && includesAny(t, ["polyurethane", "poly finish", "plastic-like finish"])) return "polyurethane";
  if (!isNegated("shellac") && includesAny(t, ["shellac crazing", "crazed shellac", "shellac craze"])) return "shellac_crazing";
  if (!isNegated("shellac") && includesAny(t, ["shellac", "amber shellac"])) return "shellac_intact";
  if (!isNegated("lacquer") && includesAny(t, ["lacquer finish", "lacquered", "lacquer"])) return "lacquer_finish";
  if (!isNegated("painted") && includesAny(t, ["painted metal", "painted steel", "enamel finish", "sage green finish", "industrial paint"])) return "painted_metal_finish";
  if (!isNegated("refinish") && includesAny(t, ["refinished", "later refinish", "modern refinish"])) return "refinished_surface";

  // HARDWARE EVIDENCE
  if (!isNegated("caster") && includesAny(t, ["porcelain caster", "ceramic caster"])) return "porcelain_caster";
  if (!isNegated("caster") && includesAny(t, ["caster wheel", "rubber caster", "modern caster", "caster"])) return "modern_caster";
  if (!isNegated("hinge") && includesAny(t, ["concealed hinge", "european cup hinge", "euro hinge", "modern concealed"])) return "modern_concealed_hinge";
  if (!isNegated("swivel") && includesAny(t, ["swivel mechanism", "swivel plate", "swivel disc", "rotating seat"])) return "swivel_mechanism";
  if (!isNegated("adjustment") && includesAny(t, ["height adjustment", "height-adjustment", "adjustable height", "ratchet adjuster", "pin adjuster"])) return "height_adjustment_mechanism";
  if (!isNegated("bracket") && includesAny(t, ["stamped metal bracket", "stamped bracket", "stamped sheet metal"])) return "stamped_metal_bracket";
  if (!isNegated("pull") && includesAny(t, ["bail pull", "swing pull", "decorative pull"])) return "decorative_bail_pull";
  if (!isNegated("knob") && includesAny(t, ["wooden knob", "wood knob", "turned knob", "round wood knob"])) return "round_wood_knob";
  if (!isNegated("escutcheon") && includesAny(t, ["escutcheon", "keyhole plate"])) return "lock_escutcheons";

  // Block 12: UPHOLSTERY EVIDENCE — text fallback patterns. Real LLM scans
  // surface rich upholstery descriptions ("hand-tied coil springs", "horsehair
  // stuffing", "damask velvet cover", "button tufting") but don't always set
  // the structured clue field. Ordered most-specific first so generic patterns
  // don't shadow.
  if (!isNegated("hand-tied") && includesAny(t, ["hand-tied coil", "hand tied coil", "twine-tied spring", "hand-tied spring"])) return "hand_tied_coil_spring";
  if (!isNegated("marshall") && includesAny(t, ["marshall coil", "pocket coil", "pocketed coil", "fabric-encased coil"])) return "marshall_pocket_coil";
  if (!isNegated("drop-in") && includesAny(t, ["drop-in spring", "drop in spring unit", "drop-in cushion unit"])) return "drop_in_spring_unit";
  if (!isNegated("serpentine") && includesAny(t, ["serpentine spring", "sinuous spring", "zigzag spring", "no-sag spring", "no sag spring"])) return "serpentine_spring";
  if (!isNegated("coil spring") && includesAny(t, ["coil spring", "coil springs", "metal coil under seat"])) return "coil_spring";
  if (!isNegated("no-spring") && includesAny(t, ["no-spring seat", "unsprung seat", "stuffed without springs"])) return "no_spring_seat";
  if (!isNegated("webbing") && includesAny(t, ["jute webbing", "linen webbing", "hemp webbing", "natural-fiber webbing", "natural fiber webbing"])) return "jute_webbing";
  if (!isNegated("elastic webbing") && includesAny(t, ["elastic webbing", "rubber webbing", "stretch webbing", "pirelli webbing"])) return "elastic_webbing";
  if (!isNegated("horsehair") && includesAny(t, ["horsehair stuffing", "horse hair stuffing", "curled hair stuffing", "horsehair padding"])) return "horsehair_stuffing";
  if (!isNegated("cotton batting") && includesAny(t, ["cotton batting", "cotton padding", "cotton wadding"])) return "cotton_batting";
  if (!isNegated("polyurethane foam") && includesAny(t, ["polyurethane foam", "synthetic foam", "yellow foam", "memory foam"])) return "polyurethane_foam";
  if (!isNegated("foam") && (containsWord(t, ["foam"]) || includesAny(t, ["latex foam"]))) return "foam_padding";
  if (!isNegated("down") && includesAny(t, ["feather fill", "down fill", "feather and down", "feather cushion"])) return "feather_down_fill";
  if (!isNegated("tufting") && includesAny(t, ["button tufting", "deep buttoned", "button-tufted", "buttoned tufting", "biscuit tufting", "deep tufted", "deeply tufted", "tufted seat cushion", "tufted back cushion", "tufted cushion"])) return "button_tufting";
  if (!isNegated("nailhead") && includesAny(t, ["nailhead trim", "nail-head trim", "decorative brass nails", "brass tack trim", "nailhead detailing"])) return "nailhead_trim";
  if (!isNegated("tacks") && includesAny(t, ["hand tacks", "hand-tacked", "upholstery tacks"])) return "hand_tacks";
  if (!isNegated("staple") && includesAny(t, ["upholstery staple", "stapled fabric", "fabric staples"])) return "upholstery_staple_construction";
  if (!isNegated("haircloth") && includesAny(t, ["haircloth", "horsehair cloth", "horsehair cover", "horsehair fabric"])) return "haircloth_cover";
  if (!isNegated("damask") && includesAny(t, ["damask cover", "damask upholstery", "damask fabric"])) return "damask_cover";
  if (!isNegated("brocade") && includesAny(t, ["brocade cover", "brocade upholstery", "brocade fabric"])) return "brocade_cover";
  if (!isNegated("jacquard") && includesAny(t, ["jacquard cover", "jacquard upholstery", "jacquard weave"])) return "jacquard_cover";
  if (!isNegated("velvet") && includesAny(t, ["velvet cover", "velvet upholstery", "velvet fabric", "velvet pile", "tufted velvet"])) return "velvet_cover";
  if (!isNegated("vinyl") && includesAny(t, ["vinyl cover", "vinyl upholstery", "naugahyde", "faux leather"])) return "vinyl_cover";
  if (!isNegated("leather") && includesAny(t, ["leather cover", "leather upholstery", "full grain leather", "top grain leather"])) return "leather_cover";
  if (!isNegated("chintz") && includesAny(t, ["chintz cover", "chintz upholstery", "chintz fabric"])) return "chintz_cover";
  if (!isNegated("needlepoint") && includesAny(t, ["needlepoint cover", "needlework cover", "needlepoint upholstery"])) return "needlepoint_cover";

  // WOOD/SUBSTRATE EVIDENCE — preserve existing plywood detection priority
  if (!isNegated("plywood") && includesAny(t, ["bent plywood", "molded plywood", "bent-plywood", "molded-plywood", "bent/molded plywood"])) return "bent_molded_plywood";
  if (!isNegated("plywood") && includesAny(t, ["plywood drawer bottom", "plywood bottom"])) return "plywood_drawer_bottom";
  if (!isNegated("plywood") && includesAny(t, ["structural plywood", "plywood carcass", "plywood case", "plywood panel"])) return "plywood_structural";
  if (!isNegated("cedar") && includesAny(t, ["cedar lining", "cedar interior", "cedar-lined", "aromatic cedar"])) return "cedar_lining";
  if (!isNegated("veneer") && includesAny(t, ["thick veneer", "heavy veneer"])) return "thick_veneer";

  // MATERIAL / CONSTRUCTION
  if (!isNegated("plywood") && includesAny(t, ["plywood", "sheet back"])) return "sheet_back_panel";

// --- NON-WOOD MATERIAL DETECTION ---
// Guarded with isNegated(...) + whole-word containsWord(...) like every other
// fallback. Previously these used bare .includes() with no negation check, so
// "pot metal rather than cast iron" fired wrought_iron and "no button tufting"
// fired tufted_upholstery.

if (!isNegated("metal") && containsWord(t, ["metal"])) return "metal_frame";
if (!isNegated("steel") && containsWord(t, ["steel"])) return "tubular_steel";
if (!isNegated("iron") && containsWord(t, ["iron"])) return "wrought_iron";
if (!isNegated("brass") && containsWord(t, ["brass"])) return "brass_frame";
if (!isNegated("chrome") && containsWord(t, ["chrome"])) return "chrome_frame";

if (!isNegated("upholstered") && containsWord(t, ["upholstered", "fabric", "cushion"])) return "fully_upholstered";
if (!isNegated("tufted") && !isNegated("tufting") && containsWord(t, ["tufted"])) return "tufted_upholstery";
if (!isNegated("springs") && containsWord(t, ["springs"])) return "visible_springs";

if (!isNegated("wicker") && containsWord(t, ["wicker"])) return "woven_body";
if (!isNegated("rattan") && containsWord(t, ["rattan"])) return "rattan_frame";
if (!isNegated("cane") && containsWord(t, ["cane"])) return "cane_panels";

if (!isNegated("glass") && containsWord(t, ["glass"])) return "glass_top";
if (!isNegated("laminate") && containsWord(t, ["laminate"])) return "laminate_surface";
if (!isNegated("formica") && containsWord(t, ["formica"])) return "formica_surface";

if (!isNegated("plastic") && containsWord(t, ["plastic"])) return "molded_plastic";
if (!isNegated("acrylic") && containsWord(t, ["acrylic", "lucite"])) return "acrylic_clear";

// ─────────────────────────────────────────────────────────────────────
// Non-wood material/joinery/condition text-pattern fallbacks
// (Batch 1-3 non-wood taxonomy follow-up — text-pattern detection for
// LLM observations that don't emit clue keys explicitly. Most specific
// patterns first to avoid bleeding into broader matches.)
// ─────────────────────────────────────────────────────────────────────

// Metal joinery — most specific (MIG/TIG / spot weld) before broader (welded / forged)
if (!isNegated("mig") && includesAny(t, ["mig weld", "tig weld", "gas-shielded weld", "gas shielded weld", "stacked dime", "stacked-dime"])) return "mig_tig_welded_joint";
if (!isNegated("spot weld") && includesAny(t, ["spot weld", "spot-weld", "resistance weld", "weld dimple"])) return "spot_welded_joint";
if (!isNegated("rivet") && includesAny(t, ["rivet head", "domed rivet", "riveted joint", "riveted seam", "riveted construction", "peened rivet"])) return "riveted_metal_joint";
if (!isNegated("braze") && includesAny(t, ["brazed joint", "brazed seam", "brass infill", "brass fillet", "brazing"])) return "brazed_metal_joint";
if (!isNegated("solder") && includesAny(t, ["soldered joint", "soldered seam", "solder line", "soft solder"])) return "soldered_metal_joint";
if (!isNegated("forged") && includesAny(t, ["forge weld", "hand-forged joint", "hand forged joint", "blacksmith joint", "hammer-formed", "hammer forged"])) return "hand_forged_metal_joint";
if (!isNegated("crimped") && includesAny(t, ["crimped seam", "folded seam", "lock seam", "pittsburgh seam", "grooved seam"])) return "crimped_folded_seam";
if (!isNegated("wire wrap") && includesAny(t, ["wire-wrapped", "wire wrapped joint", "wrapped joint", "wire banding"])) return "wire_wrapped_metal_joint";

// Metal wear / condition
if (!isNegated("rust") && includesAny(t, ["rust pitting", "pitted rust", "rust pits", "pitted surface", "rusty pits"])) return "rust_pitting";
if (!isNegated("plating") && includesAny(t, ["plating loss", "plating wear", "plating worn", "plated worn through", "exposed base metal", "exposed pot metal", "chrome flaking", "nickel flaking", "brass plating wear"])) return "plating_loss";
if (!isNegated("corrosion") && includesAny(t, ["joint corrosion", "corroded joint", "corrosion at joint", "galvanic corrosion"])) return "joint_corrosion";
if (!isNegated("weld repair") && includesAny(t, ["weld repair", "later weld", "repair weld", "modern weld over"])) return "weld_repair_visible";
if (!isNegated("powder coat") && includesAny(t, ["powder coat", "powder-coat", "powder coated", "modern powder coating"])) return "powder_coat_overspray";
if (!isNegated("bent") && includesAny(t, ["bent metal", "sprung metal", "bent frame", "deformed tubing", "warped tubing"])) return "bent_or_sprung_metal";

// Wicker era and material — most specific first
if (!isNegated("lloyd loom") && includesAny(t, ["lloyd loom", "lloyd-loom", "paper fiber", "paper-fiber", "twisted paper", "kraft paper wicker", "machine-woven paper"])) return "lloyd_loom_paper_fiber";
if (!isNegated("bar harbor") && includesAny(t, ["bar harbor", "bar-harbor", "resort wicker", "porch wicker", "sunroom wicker"])) return "bar_harbor_style_wicker";
if (!isNegated("victorian wicker") && includesAny(t, ["victorian wicker", "curlicue wicker", "wicker curlicue", "ornate wicker", "scrolled wicker", "wicker scrolls"])) return "victorian_curlicue_wicker";
if (!isNegated("mid-century wicker") && includesAny(t, ["mid-century wicker", "mid century wicker", "modernist wicker", "streamlined wicker", "filipino rattan", "papasan style"])) return "mid_century_streamlined_wicker";

// Wicker weave patterns
if (!isNegated("herringbone") && includesAny(t, ["herringbone weave", "herringbone wicker", "diagonal weave"])) return "wicker_weave_basket";
if (!isNegated("basket weave") && includesAny(t, ["basket weave", "basket-weave", "alternating over-under", "groups of two strands"])) return "wicker_weave_basket";
if (!isNegated("close weave") && includesAny(t, ["close weave", "tight weave", "dense weave", "tight wicker"])) return "wicker_weave_close";
if (!isNegated("open weave") && includesAny(t, ["open weave", "open wicker", "airy weave", "loose weave"])) return "wicker_weave_open";

// Paper fiber (broader than Lloyd loom — check AFTER lloyd_loom match)
if (!isNegated("paper fiber") && includesAny(t, ["paper construction", "kraft paper construction", "paper-fiber furniture"])) return "paper_fiber_construction";

// Wicker condition
if (!isNegated("strand") && includesAny(t, ["broken strands", "missing strands", "unraveled wicker", "broken wicker", "wicker damage"])) return "wicker_strand_breakage";
if (!isNegated("paint buildup") && includesAny(t, ["paint buildup", "multiple paint layers", "thick paint on wicker", "painted-over wicker"])) return "wicker_paint_buildup";

  return null;
}
function descriptionFromObservation(o: any): string {
  return asString(o?.description) || asString(o?.observed_value_text) || asString(o?.text) || asString(o?.value) || "Unknown observation";
}
function normalizeEvidenceStrength(observations: Observation[]): Observation[] {
  const authorityCap: Record<string, number> = {
    // 🔴 Highest authority (structure)
    construction: 96,
    joinery: 95,
    toolmarks: 94,
    fasteners: 92,

    // 🟠 Strong but secondary
    materials: 84,
    material: 84,
    structure: 82,

    // 🟡 Moderate support
    hardware: 66,
    function: 70,
    form: 68,

    // 🔵 Weak / easily altered
    finish: 56,
    alteration: 54,
    condition: 54,

    // ⚪ Lowest authority
    style: 52,
    context: 48,

    // 🟣 Special case
    label: 85,
  };

  const replacementRiskCap: Record<string, number> = {
    hardware: 62,
    finish: 55,
    alteration: 50,
    style: 55,
  };

  const clueCounts: Record<string, number> = {};

  for (const o of observations) {
    const key = `${o.type || "context"}:${o.clue || ""}`;
    clueCounts[key] = (clueCounts[key] || 0) + 1;
  }

  return observations
    .filter((o) => {
      const text = String(o.description || "").toLowerCase();

      if (
        text.includes("not visible") ||
        text.includes("cannot confirm") ||
        text.includes("unclear") ||
        text.includes("unknown observation")
      ) return false;

      if (!o.clue && o.confidence < 45) return false;

      return true;
    })
    .map((o) => {
      const text = String(o.description || "").toLowerCase();
      const type = String(o.type || "context");
      const clue = String(o.clue || "");
      let confidence = Number(o.confidence || 50);

      if (
        text.includes("possibly") ||
        text.includes("may be") ||
        text.includes("appears to")
      ) {
        confidence = Math.min(confidence, 45);
      }

      confidence = Math.min(confidence, authorityCap[type] ?? 50);

      if (replacementRiskCap[type] != null && !o.hard_negative) {
        confidence = Math.min(confidence, replacementRiskCap[type]);
      }

      if (o.hard_negative) {
        confidence = Math.max(confidence, 85);
      }

      const key = `${type}:${clue}`;
      const occurrences = clueCounts[key] || 1;
      const multiPhotoBoost = Math.min((occurrences - 1) * 3, 6);

      const finalConfidence = clamp(confidence + multiPhotoBoost, 1, 99);

      return {
        ...o,
        confidence: finalConfidence,
        low_confidence_flag: finalConfidence < 45,
      };
    });
}
// Derive the subject term(s) a clue key refers to, for self-negation detection.
// "clock_case_form" -> ["clock case", "clock"]; "lamp_form" -> ["lamp"].
const NEGATION_STRIP_SUFFIXES = ["_form", "_present", "_visible", "_construction", "_evidence", "_feature", "_detail"];
function clueSubjectTerms(clue?: string | null): string[] {
  if (!clue) return [];
  let base = clue.toLowerCase();
  for (const sfx of NEGATION_STRIP_SUFFIXES) {
    if (base.endsWith(sfx)) {
      base = base.slice(0, -sfx.length);
      break;
    }
  }
  const phrase = base.replace(/_/g, " ").trim();
  if (!phrase) return [];
  const terms = [phrase];
  const head = phrase.split(" ")[0];
  if (head && head.length >= 4 && head !== phrase) terms.push(head); // head noun: clock_case -> "clock"
  return terms;
}

// True when a description rejects its OWN clue subject ("...not a clock case",
// "rather than a clock", "no clock case"). Matching against the clue's own
// subject term — not bare "not"/"no" — keeps positive clues whose prose merely
// contrasts a different thing ("Cabriole legs, not straight") from being dropped.
export function descriptionNegatesClue(clue: string | null | undefined, description: string): boolean {
  const terms = clueSubjectTerms(clue);
  if (!terms.length || !description) return false;
  const text = ` ${description.toLowerCase()} `;
  // A label/mark/text clue is AFFIRMED by a transcribed quote: if the model
  // copied characters off the object, the document exists even when the prose
  // adds "...not a maker's mark" (Sears freight label, 'Made in China' stamp).
  if (
    /label|mark|stamp|signature|inscription|maker|placard|decal|stencil/.test(clue || "") &&
    /['"“”‘’][^'"“”‘’]{3,}['"“”‘’]/.test(description)
  ) {
    return false;
  }
  // Allow a few intervening qualifier words between the negation cue and the
  // clue's subject term so common phrasings are caught — e.g. "No decorative
  // nailhead trim visible" (no -> nailhead) and "not true turned spindles"
  // (not -> spindle). The window stays anchored to the clue's OWN subject term
  // (not a bare "no"/"not"), which keeps contrastive prose about a DIFFERENT
  // thing — "Hand-cut dovetails, not machine cut" — from dropping the clue.
  // `[\w-]+` (not `\w+`) so hyphenated intervening words like "hand-sawn" or
  // "machine-cut" parse as a single gap token — otherwise `\w+\s+` stops at the
  // hyphen and a legitimate "rather than hand-sawn X" misses the X subject term.
  // See finding #15b in docs/stress-test-findings.md.
  const W = `(?:[\\w-]+\\s+){0,3}`;
  // Affirming predicate, but NOT one that is itself negated: a leading "no/not"
  // before the term ("No Eastlake hardware visible") and a trailing "is not"
  // both disqualify it, so only a genuine presence assertion affirms.
  const NEG_BEHIND = `(?<!\\b(?:no|not|without|never)\\b(?:\\s+\\w+){0,3}\\s*)`;
  const AFFIRM_PRED = `(?:is|are|was|were|visible|present|shown|observed|intact|remain\\w*)(?!\\s+(?:not|no)\\b)`;
  for (const t of terms) {
    const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Affirmation guard: if THIS term is asserted present elsewhere, the prose is
    // contrasting a subtype, not negating presence ("Backrest is integral … no
    // separate backrest"; "nailheads visible … rather than modern strip nailhead").
    if (new RegExp(`${NEG_BEHIND}\\b${esc}s?\\b[\\s,]*${AFFIRM_PRED}\\b`).test(text)) continue;
    const patterns = [
      new RegExp(`\\bnot (?:a |an |the )?(?:${W})?${esc}s?\\b`),
      new RegExp(`\\b(?:rather than|instead of|as opposed to) (?:a |an |the )?(?:${W})?${esc}s?\\b`),
      new RegExp(`\\bno (?:${W})?${esc}s?\\b`),
      new RegExp(`\\bwithout (?:${W})?${esc}s?\\b`),
      new RegExp(`\\b${esc}s?\\b[^.;,]{0,30}?\\b(?:not present|not visible|not observed|absent|missing)\\b`),
    ];
    if (patterns.some((re) => re.test(text))) return true;
  }
  return false;
}

function normalizeObservationsFromParsed(parsed: any): Observation[] {
  const direct = Array.isArray(parsed?.observations) ? parsed.observations : [];
  const out: Observation[] = [];

  const push = (raw: any) => {
    const description =
      asString(raw?.description) ||
      asString(raw?.value) ||
      asString(raw?.observed_value_text) ||
      asString(raw?.text) ||
      "Visible furniture evidence";

    const clue =
  normalizePhase0Clue(raw) ||
  detectClueFromText(description);

    const meta = getClueMeta(clue);

    const type =
      asString(raw?.type) ||
      asString(raw?.category) ||
      meta?.category ||
      "context";

    out.push({
      type,
      clue,
      description,
      confidence: clamp(
        typeof raw?.confidence === "number" ? raw.confidence : 45,
        5,
        99
      ),
      source_image: asString(raw?.source_image) || null,
      hard_negative: Boolean(
  raw?.hard_negative === true &&
  raw?.value !== false &&
  String(raw?.value).toLowerCase() !== "false"
),
      negated: descriptionNegatesClue(clue, description),
      low_confidence_flag:
        typeof raw?.confidence === "number" ? raw.confidence < 45 : true,
    });
  };

  if (direct.length) {
    direct.forEach(push);
  } else {
    collectText(parsed).forEach((t) => {
      const clue = detectClueFromText(t);
      push({
        category: getClueMeta(clue)?.category ?? "context",
        key: clue,
        description: t,
        confidence: clue ? 55 : 35,
      });
    });
  }

  mineCluesFromProse(parsed, out);

  return dedupeObservations(normalizeEvidenceStrength(out));
}

// The open perception arrays the P0 model dumps prose into instead of emitting
// a structured clue key, plus the generic key-names it stamps on observations
// when it doesn't pick a specific one. Both are "bucketed prose" we re-mine.
const GENERIC_CUE_KEYS = new Set<string>([
  "style_cues",
  "construction_cues",
  "condition_cues",
  "materials",
  "forms",
  "functional_features",
]);

// Keystone (root-cause fix). The P0 model routinely buckets its evidence into
// the open perception arrays (style_cues / construction_cues / condition_cues /
// materials / forms) or emits a GENERIC clue key (style_cues, frame_members,
// condition_cues) whose description still names a real, authored clue. Neither
// surface was ever mined, so the dated vocabulary the author wrote
// (french_provincial_style, foam_padding, springs, staples, …) silently failed
// to fire whenever the model picked a synonym instead of the exact key — the
// reported "sometime this century" collapse. This pass mines every prose surface
// for clues the model didn't key, ADDITIVELY (dedupeObservations handles
// overlap), so the author's date bands reach the engine regardless of phrasing.
// Negation is honored both inside detectClueFromText and via descriptionNegatesClue.
function mineCluesFromProse(parsed: any, out: Observation[]): void {
  const present = new Set(out.map((o) => o.clue).filter(Boolean) as string[]);

  const p = parsed?.perception || {};
  const prose: string[] = [];
  for (const key of GENERIC_CUE_KEYS) {
    const v = p[key];
    if (Array.isArray(v)) for (const s of v) if (typeof s === "string" && s.trim()) prose.push(s);
  }
  // Also re-mine descriptions of observations the model EXPLICITLY bucketed —
  // i.e. whose key is one of the generic cue-bucket names (style_cues,
  // condition_cues, …). Those descriptions are bucketed prose that names a real
  // clue the engine never resolved. We deliberately do NOT re-mine specific
  // (if unrecognized) keys like `eastlake_pull` or `cane_panel_sides`: their
  // descriptions mention incidental materials ("brass pulls", "cane side
  // panels") that the low-precision single-word material fallbacks would
  // wrongly promote to brass_frame / cane_panels and misroute form + dating.
  for (const o of out) {
    if (!o.negated && o.clue && GENERIC_CUE_KEYS.has(o.clue) && typeof o.description === "string" && o.description.trim()) {
      prose.push(o.description);
    }
  }

  for (const s of prose) {
    const clue = detectClueFromText(s);
    if (!clue || present.has(clue)) continue;
    if (descriptionNegatesClue(clue, s)) continue;
    const meta = getClueMeta(clue);
    out.push({
      type: meta?.category || "context",
      clue,
      description: s,
      confidence: 50,
      source_image: null,
      hard_negative: false,
      negated: false,
      low_confidence_flag: false,
    });
    present.add(clue);
  }
}

function dedupeObservations(observations: Observation[]): Observation[] {
  const seen = new Set<string>();
  return observations.filter((o) => {
    const key = `${o.type}|${o.clue || ""}|${o.description.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function normalizePerception(parsed: any, observations: Observation[]): Perception {
  const p = parsed?.perception || {};

  const arr = (v: any) =>
    Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : [];

  // Negated observations describe an ABSENT feature — keep their prose out of
  // raw_text so it can't re-derive the very clue it negates (e.g. a
  // "not true turned spindles" observation must not seed spindle_gallery via
  // raw_text-driven perception derivation).
  const raw = [
    ...(p.raw_text ? [String(p.raw_text)] : []),
    ...observations.filter((o) => !o.negated).map((o) => `${o.clue || ""} ${o.description || ""}`),
  ].join(" | ");

  const t = raw.toLowerCase();

  const perception: Perception = {
    labels: arr(p.labels),
    maker_names: arr(p.maker_names),
    materials: arr(p.materials),
    forms: arr(p.forms),
    functional_features: arr(p.functional_features),
    style_cues: arr(p.style_cues),
    construction_cues: arr(p.construction_cues),
    condition_cues: arr(p.condition_cues),
    visible_text: arr(p.visible_text),
    raw_text: raw,
  };

  const add = (key: keyof Perception, value: string) => {
    const current = perception[key];
    if (Array.isArray(current) && !current.includes(value)) {
      current.push(value);
    }
  };

  const includesAny = (text: string, terms: string[]) =>
    terms.some((term) => text.includes(term));

  // 🔹 Maker / labels
  if (includesAny(t, ["roos", "sweetheart cedar"])) {
    add("labels", "Roos label");
    add("maker_names", "Roos");
  }

  if (includesAny(t, ["lane cedar"])) {
    add("labels", "Lane label");
    add("maker_names", "Lane");
  }

  // 🔹 Materials
  if (includesAny(t, ["metal", "iron", "steel", "brass"])) {
    add("materials", "metal");
  }

  if (includesAny(t, ["upholstered", "fabric", "cushion"])) {
    add("materials", "upholstery");
  }

  if (includesAny(t, ["wood", "oak", "cedar", "walnut"])) {
    add("materials", "wood");
  }

  // 🔹 Function
  if (includesAny(t, ["telephone", "phone shelf"])) {
    add("functional_features", "telephone shelf");
  }

  if (includesAny(t, ["bench", "seat", "seating"])) {
    add("functional_features", "seating");
  }

  if (includesAny(t, ["drop front", "writing surface"])) {
    add("functional_features", "drop-front desk");
  }

  if (includesAny(t, ["pigeonhole", "cubby"])) {
    add("functional_features", "pigeonholes");
  }

  if (t.includes("mirror")) {
    add("functional_features", "mirror");
  }

  // 🔹 Style cues
  if (includesAny(t, ["cabriole", "shell carving"])) {
    add("style_cues", "Queen Anne / Colonial Revival");
  }

  if (includesAny(t, ["barley twist", "jacobean", "heavy carving"])) {
    add("style_cues", "Jacobean Revival");
  }

  return perception;
}
export function promotePerceptionObservations(
  observations: Observation[],
  perception: Perception
): Observation[] {
  const out = [...observations];
  const text = perception.raw_text.toLowerCase();

  const isNegated = (phrase: string) =>
    includesAny(text, [
      `no ${phrase}`,
      `not ${phrase}`,
      `without ${phrase}`,
      `${phrase} not`,
      `no visible ${phrase}`,
      `no ${phrase} present`,
      `no ${phrase} evident`,
    ]);

  const add = (
    clue: string,
    description: string,
    confidence = 72,
    source = "perception"
  ) => {
    if (out.some((o) => o.clue === clue)) return;

    const meta = getClueMeta(clue);

    out.push({
      type: meta?.category || "context",
      clue,
      description,
      confidence,
      source_image: source,
      hard_negative: Boolean(meta?.hardNegative),
      low_confidence_flag: confidence < 45,
    });
  };

  // Word-boundary seating detection. Substring matching previously fired on
  // "seated" (e.g. a drawer bottom "seated in the frame"), deriving phantom
  // seating_surface / seating_present clues on desks and other non-seating
  // forms. \bseat\b matches seat/seats but not "seated"/"seating".
  //
  // #10: "seat"/"seats" is ALSO a joinery VERB of fitting — "tenons seat into
  // mortises", "shelf edges seat cleanly into the case", "runners seat into the
  // case sides". That verb sense hijacked form ID (rope bed → bench, etc.). The
  // negative lookahead drops "seat(s)" when followed (optionally past one adverb)
  // by a fitting preposition (into/in/onto/against/flush/cleanly/down/within),
  // while keeping NOUN seating ("seat surface", "seat rail", "the seat is caned")
  // and the unambiguous bench/sitting/seating words.
  const hasSeatingWord =
    /\b(?:seats?(?!\s+(?:\w+\s+)?(?:in|into|onto|against|flush|cleanly|down|within)\b)|seating|benches?|sitting)\b/.test(text);

  if (
    hasSeatingWord &&
    !isNegated("seat") &&
    !isNegated("seating") &&
    !isNegated("bench") &&
    !isNegated("sitting surface")
  ) {
    add("seating_surface", "A seating surface or bench-like sitting area is visible.", 82);
    add("seating_present", "Integrated seating is visible.", 78);
  }

  if (
    includesAny(text, ["backrest", "back rail", "spindle back", "spindled back", "rail back"])
  ) {
    add("backrest_present", "A backrest or back rail is visible.", 78);
  }

  if (includesAny(text, ["spindle", "spindles", "turned spindle", "spindle rail"])) {
    add("spindle_back", "Spindles are visible in the back or side rail.", 78);
    add("spindle_gallery", "Spindle gallery or rail detail is visible.", 70);
  }

  const hasSeatingContext =
  hasSeatingWord &&
  !isNegated("seat") &&
  !isNegated("seating") &&
  !isNegated("bench") &&
  !isNegated("sitting surface");

if (
  hasSeatingContext &&
  includesAny(text, [
    "secondary surface",
    "side surface",
    "raised surface",
    "raised platform",
    "small table surface",
  ]) &&
  !isNegated("secondary surface") &&
  !isNegated("side surface") &&
  !isNegated("raised surface") &&
  !isNegated("raised platform") &&
  !isNegated("table surface")
) {
  add("secondary_surface", "A secondary raised surface is visible beside the seating area.", 86);
}

  if (
    includesAny(text, ["writing", "writing surface", "desk surface", "work surface"]) &&
    !isNegated("writing") &&
    !isNegated("writing surface") &&
    !isNegated("desk") &&
    !isNegated("desk surface") &&
    !isNegated("work surface")
  ) {
    add("writing_surface", "A writing or work surface is visible.", 84);
  }

  if (
    includesAny(text, ["telephone", "phone shelf", "telephone shelf", "phone platform"]) &&
    !isNegated("telephone") &&
    !isNegated("phone") &&
    !isNegated("phone shelf") &&
    !isNegated("telephone shelf") &&
    !isNegated("phone platform")
  ) {
    add("telephone_shelf", "A telephone shelf or phone platform is visible.", 86);
  }

  if (includesAny(text, ["roos", "sweetheart cedar"])) {
    add("roos_label", "Roos cedar chest label is visible.", 94);
  }

  if (includesAny(text, ["lane cedar"])) {
    add("lane_label", "Lane cedar chest label is visible.", 94);
  }

  if (includesAny(text, ["cedar lined", "cedar interior"])) {
    add("cedar_lining", "Cedar-lined interior is visible.", 84);
  }

  if (includesAny(text, ["drop front", "drop-front", "fall front"])) {
    add("drop_front_desk", "Drop-front writing surface is visible.", 84);
  }

  if (includesAny(text, ["pigeonhole", "pigeon hole", "cubby", "cubbies"])) {
    add("pigeonholes", "Interior cubbies or pigeonholes are visible.", 78);
  }

  if (
    text.includes("mirror") &&
    !includesAny(text, ["no mirror", "mirror not", "no attached mirror", "no mirror or bonnet"]) &&
    // "mirror-image" / "mirror-matched" describe BOOKMATCHED VENEER GRAIN, not a
    // mirror. Bare substring matching on "mirror" otherwise fabricates a
    // mirror_present clue on flame/crotch veneer pieces ("bilateral mirror-image
    // bookmatched walnut"). Exclude the veneer-grain phrasings.
    !includesAny(text, ["mirror-image", "mirror image", "mirror-matched", "mirror matched", "mirror match", "mirrored grain", "mirrored figure"])
  ) {
    add("mirror_present", "Mirror is visible.", 72);
  }

  // Metal-frame bed cue. A headboard/footboard ALONE does not imply metal —
  // wooden bedsteads have them too — so require explicit metal-bed language, or
  // a head/footboard accompanied by a metal material word. Wooden beds route to
  // form_bedstead via the scoreForms wooden-bedstead block instead of being
  // mis-flagged as iron beds here.
  const metalBedLanguage = includesAny(text, [
    "iron bed", "brass bed", "metal bed", "metal bedstead", "iron bedstead",
    "cast-iron bed", "cast iron bed", "wrought-iron bed", "wrought iron bed",
    "tubular steel bed", "tubular-steel bed", "steel bed",
  ]);
  const headFootWithMetal =
    includesAny(text, ["headboard", "footboard"]) &&
    includesAny(text, ["iron", "brass", "metal", "steel", "wrought", "tubular", "japanned", "chrome", "nickel-plated"]);
  if (metalBedLanguage || headFootWithMetal) {
    add("metal_bed_frame", "Iron or metal bed frame is visible.", 88);
  }

  if (includesAny(text, ["pedestal", "single column"])) {
    add("pedestal_column", "Single-column pedestal form is visible.", 84);
  }

  if (includesAny(text, ["armchair", "upholstered chair"])) {
    add("armchair_form", "Armchair form is visible.", 82);
  }

  if (includesAny(text, ["metal frame", "metal furniture", "metal structure", "steel frame", "iron frame"])) {
    add("metal_frame", "Metal frame or metal furniture structure is visible.", 72);
  }

  if (includesAny(text, ["wicker", "woven reed", "woven body", "reed furniture"])) {
    add("woven_body", "Woven wicker or reed body construction is visible.", 76);
  }

  if (includesAny(text, ["upholstered", "fabric covered", "cushion", "cushioned", "padded seat", "padded back"])) {
    add("fully_upholstered", "Upholstered or cushioned surfaces are visible.", 74);
  }

  if (
    text.includes("cabriole") &&
    !includesAny(text, ["no cabriole", "no turned or cabriole", "not cabriole"])
  ) {
    add("cabriole_leg", "Cabriole legs are visible.", 72);
  }

  if (text.includes("barley twist")) {
    add("barley_twist", "Barley twist supports are visible.", 76);
  }

  if (text.includes("drawer")) {
    add("drawer_present", "Drawer evidence is visible.", 58);
  }

  if (text.includes("door")) {
    add("door_present", "Door evidence is visible.", 58);
  }

  if (includesAny(text, ["cabinet", "cupboard", "hutch"])) {
    add("cabinet_form", "Cabinet or cupboard form is visible.", 68);
  }

  return dedupeObservations(out);
}
function tIncludes(text: string, word: string) {
  return text.includes(word);
}
function classifyPrimaryMaterial(digest: EvidenceDigest): {
  primary: "wood" | "metal" | "woven" | "plastic" | "mixed" | "unknown";
  confidence: number;
} {
  const clues = new Set(digest.clue_keys || []);
  const has = (...keys: string[]) => keys.some((k) => clues.has(k));

  const metalScore =
    (has("metal_frame") ? 2 : 0) +
    (has("tubular_steel") ? 3 : 0) +
    (has("wrought_iron") ? 2 : 0) +
    (has("cast_iron") ? 2 : 0) +
    (has("brass_frame") ? 2 : 0) +
    (has("chrome_frame") ? 3 : 0);

  const wovenScore =
    (has("woven_body") ? 3 : 0) +
    (has("rattan_frame") ? 3 : 0) +
    (has("cane_panels") ? 1 : 0);

  const plasticScore =
    (has("molded_plastic") ? 3 : 0) +
    (has("acrylic_clear") ? 3 : 0);

  const woodScore =
    (has("solid_wood_construction") ? 2 : 0) +
    (has("solid_plank_back") ? 2 : 0) +
    (has("frame_and_panel_sides") ? 2 : 0) +
    (has("drawer_box_joinery") ? 1 : 0);

  const scores = [
    { type: "metal", score: metalScore },
    { type: "woven", score: wovenScore },
    { type: "plastic", score: plasticScore },
    { type: "wood", score: woodScore },
  ].sort((a, b) => b.score - a.score);

  const top = scores[0];
  const second = scores[1];

  if (!top || top.score === 0) {
    return { primary: "unknown", confidence: 0 };
  }

  if (second && second.score > 0 && Math.abs(top.score - second.score) <= 1) {
    return { primary: "mixed", confidence: 0.6 };
  }

  return {
    primary: top.type as "wood" | "metal" | "woven" | "plastic",
    confidence: Math.min(1, top.score / 5),
  };
}
// Dust-cover material/attachment is a real dating signal that was previously
// captured (clue `dust_cover`) but routed to [construction] with no date. The
// model already describes the material in prose, so we read it here and
// synthesize dated clue keys — no P0 prompt change. Synthetic non-woven fabric
// and stapled attachment are post-WWII anchors (hard-negative post-1950 floors,
// which also count as modern-construction evidence for the reproduction gate);
// woven cotton cambric is broad. Existence alone stays undated.
export function deriveDustCoverClues(observations: Observation[]): Observation[] {
  const dc = observations.find(
    (o) =>
      !o.negated &&
      (o.clue === "dust_cover" || /dust[\s-]?cover|dust panel|cambric/i.test(o.description || ""))
  );
  if (!dc) return [];
  const text = `${dc.clue || ""} ${dc.description || ""}`.toLowerCase();
  const out: Observation[] = [];
  const add = (clue: string, description: string, confidence: number, hard_negative: boolean) =>
    out.push({ type: "upholstery", clue, description, confidence, source_image: "derived", hard_negative, low_confidence_flag: false });

  if (/non[\s-]?woven|nonwoven|spun[\s-]?bond|polypropylene|polyester scrim|pellon|synthetic (dust|cambric|cover|fabric)/.test(text)) {
    add("dust_cover_synthetic_nonwoven", "Dust cover is a synthetic non-woven (spunbonded) fabric — a post-WWII upholstery material, so the piece cannot predate it.", 80, true);
  } else if (/cambric|woven (cotton|fabric|black)|black woven|woven dust|cotton dust/.test(text)) {
    add("dust_cover_cambric_woven", "Dust cover is woven cotton cambric — standard factory upholstery practice across a broad period; not a tight date on its own.", 70, false);
  }
  if (/stapl/.test(text)) {
    add("dust_cover_stapled", "Dust cover is stapled to the frame — pneumatic/electric staple attachment is a post-WWII practice.", 75, true);
  }
  return out;
}

export type LabelDate = {
  year: number;
  kind: "production" | "founding" | "patent" | "bare";
  floor: number;
  ceiling: number | null;
};

// M9a: read a YEAR off a maker label / inscription and weigh it by ROLE. A year
// is usually NOT the production date — "Est. 1847" / "Since 1852" / "Pat. 1893"
// are founding/patent dates → a terminus-post-quem FLOOR only (the piece is
// at-or-after, possibly much later). Only a signed, dated piece ("fecit / made /
// dated / anno 19XX") is an actual production date → a tight floor=ceiling. A
// bare year with no qualifying context is treated conservatively as a floor.
// (Maker/line recognition — e.g. Hooker "Seven Seas" → 1990s — is M9b, not here.)
export function parseLabelDate(observations: Observation[]): LabelDate | null {
  const text = observations
    .filter(
      (o) =>
        !o.negated &&
        // Exclude the engine's OWN maker-matcher output (maker_mark_* clues). Their
        // description carries a synthesized "Dating reference: 1933–2005" operating
        // WINDOW that is already consumed by the maker-mark date anchor. Re-scanning
        // it here makes the "latest TPQ wins" rule promote the window's CEILING (e.g.
        // 2005, a firm's closing year) to a floor — the M12 window-end-as-floor bug.
        !String(o.clue || "").startsWith("maker_mark_") &&
        (o.type === "label" ||
          o.clue === "maker_label" ||
          o.clue === "visible_text" ||
          /\blabel\b|stamp|maker'?s?\s*mark|inscription|signed|stencil|placard/i.test(o.description || ""))
    )
    .map((o) => `${o.clue || ""} ${o.description || ""}`)
    .join("  ")
    .toLowerCase();
  if (!text) return null;

  const matches = [...text.matchAll(/\b(1[789]\d\d|20\d\d)\b/g)];
  if (matches.length === 0) return null;

  const FOUNDING = /establish|\best\.?\b|\bsince\b|founded|in business|serving|quality[^.]*\bsince\b|company[^.]*\b1[789]\d\d/;
  const PATENT = /\bpat\.?\b|patent|copyright|©|reg(\.|istered)|design no/;
  const PRODUCTION = /fecit|\bmade\b|\bdated\b|\banno\b|crafted|completed|wrought/;

  let production: number | null = null;
  let floorOnly: { year: number; kind: "founding" | "patent" | "bare" } | null = null;

  for (const m of matches) {
    const year = parseInt(m[1], 10);
    const i = m.index ?? 0;
    const win = text.slice(Math.max(0, i - 40), i + 40);
    if (PRODUCTION.test(win) && !FOUNDING.test(win)) {
      production = production == null ? year : Math.max(production, year);
    } else {
      const kind = FOUNDING.test(win) ? "founding" : PATENT.test(win) ? "patent" : "bare";
      if (!floorOnly || year > floorOnly.year) floorOnly = { year, kind }; // latest TPQ wins
    }
  }

  if (production != null) return { year: production, kind: "production", floor: production, ceiling: production };
  if (floorOnly) return { year: floorOnly.year, kind: floorOnly.kind, floor: floorOnly.year, ceiling: null };
  return null;
}

// #6 Phase 1: the model frequently writes an explicit production era in STYLE
// observation prose ("c. 1890-1915", "American production circa 1920s-1950s") that
// the engine otherwise discards (the style dating layer reads only a formal
// attribution). Parse those windows and, ONLY as a last resort (see the call site:
// no hard construction/joinery/fastener/toolmark/wood/hardware layer dated the piece,
// no maker date, no convergence), use them as a Low-confidence anchor instead of the
// hardcoded catch-all. Requires ≥2 windows that AGREE (non-empty intersection) so a
// single offhand mention can't drive the date; hedged "or later" obs are skipped.
export function parseStyleProseDate(
  observations: Observation[]
): { floor: number; ceiling: number } | null {
  const windows: Array<[number, number]> = [];
  for (const o of observations) {
    if (o.negated || o.type !== "style") continue;
    const d = String(o.description || "");
    if (/\bor later\b|\bnot\b|reproduction of/i.test(d)) continue;
    // decade range: "1920s-1950s" → [1920, 1959]
    let m = d.match(/\b(1[789]\d0)s\s*[–-]\s*(1[789]\d0)s\b/);
    if (m) { windows.push([parseInt(m[1], 10), parseInt(m[2], 10) + 9]); continue; }
    // year range: "c. 1890-1915" → [1890, 1915]
    m = d.match(/\b(1[789]\d{2}|20\d{2})\s*[–-]\s*(1[789]\d{2}|20\d{2})\b/);
    if (m) {
      const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
      if (b > a) { windows.push([a, b]); continue; }
    }
    // single decade: "1920s" → [1920, 1929]
    m = d.match(/\b(1[789]\d0)s\b/);
    if (m) { windows.push([parseInt(m[1], 10), parseInt(m[1], 10) + 9]); continue; }
  }
  if (windows.length < 2) return null;
  // Intersection — the era all parsed windows agree on. Empty ⇒ they disagree ⇒
  // too noisy to anchor on.
  const floor = Math.max(...windows.map((w) => w[0]));
  const ceiling = Math.min(...windows.map((w) => w[1]));
  if (floor > ceiling) return null;
  return { floor, ceiling };
}

function detectStructuralPatterns(observations: Observation[]): Observation[] {
  const hasClue = (clue: string) =>
    observations.some((o) => o.clue === clue);

  const text = observations
    .map((o) => `${o.clue || ""} ${o.description || ""}`)
    .join(" ")
    .toLowerCase();

  const hasText = (...phrases: string[]) =>
    phrases.some((phrase) => text.includes(phrase));

  const out: Observation[] = [];

  // 🧠 MATERIAL CLASSIFICATION (Step 1 → Step 2 bridge)
  const digest = buildEvidenceDigest(observations);
  const material = classifyPrimaryMaterial(digest);

  // 🚫 Only block clearly non-traditional structural materials
  const blocksTraditionalWoodFrameStyles =
    material.primary === "metal" ||
    material.primary === "plastic" ||
    material.primary === "woven";

  // =========================
  // MODERN / NON-WOOD FRIENDLY
  // =========================

 if (
  (hasClue("flat_paddle_armrests") ||
    hasText(
      "paddle armrests",
      "flat wooden armrests",
      "flat paddle",
      "flat wood arm caps",
      "wood arm caps",
      "flat arm caps"
    )) &&
  (hasClue("spindle_back") ||
    hasText("spindle back", "vertical turned spindles")) &&
  (hasClue("splayed_legs") ||
    hasClue("tapered_leg") ||
    hasText(
      "splayed legs",
      "outward splay",
      "tapered legs",
      "splayed outward",
      "splayed outward slightly",
      "four round tapered legs"
    ))
) {
  out.push({
    type: "structure",
    clue: "mcm_structural_pattern",
    description:
      "Combined paddle or flat arm caps, spindle back, and splayed/tapered legs form a consistent mid-century modern structural pattern.",
    confidence: 86,
    source_image: "derived",
    hard_negative: false,
    low_confidence_flag: false,
  });
}
  // =========================
  // UPHOLSTERED (ALWAYS ALLOW)
  // =========================

  if (
    (hasClue("cabriole_leg") ||
      hasText("cabriole leg", "queen anne leg", "curved leg")) &&
    (hasClue("channel_back_fan_back") ||
      hasText("channel back", "fan back upholstery", "radiating upholstery")) &&
    (hasClue("upholstery_fabric") ||
      hasText("fully upholstered", "upholstered armchair"))
  ) {
    out.push({
      type: "structure",
      clue: "queen_anne_revival_pattern",
      description:
        "Cabriole legs, channel/fan back upholstery, and fully upholstered frame form a consistent Queen Anne / Colonial Revival upholstered pattern.",
      confidence: 84,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  if (
    (hasClue("armchair_form") ||
      hasText("armchair", "upholstered chair", "throne chair", "club chair")) &&
    (hasClue("barley_twist") ||
      hasText("barley twist", "rope twist", "spiral rope", "twisted columns")) &&
    (hasClue("acanthus_carving") ||
      hasText("acanthus", "scrollwork")) &&
    (hasClue("claw_feet") ||
      hasText("claw feet", "paw feet")) &&
    (hasClue("channel_back") ||
      hasText("channel back", "fan back")) &&
    (hasClue("fully_upholstered") ||
      hasText("fully upholstered"))
  ) {
    out.push({
      type: "structure",
      clue: "renaissance_revival_upholstered_armchair_pattern",
      description:
        "Heavily carved supports, acanthus detail, claw/paw feet, and full upholstery form a Renaissance Revival upholstered pattern.",
      confidence: 88,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }
  if (
  (hasClue("armchair_form") || hasText("armchair", "upholstered chair")) &&
  (hasClue("fluted_legs") || hasText("fluted legs", "reeded legs")) &&
  (hasClue("arm_supports") || hasText("reeded arm", "curved arm support", "arm supports")) &&
  (hasClue("upholstery_fabric") || hasClue("fully_upholstered") || hasText("upholstered seat", "upholstered back", "damask"))
) {
  out.push({
    type: "structure",
    clue: "colonial_georgian_revival_upholstered_armchair_pattern",
    description:
      "Fluted or reeded legs, exposed curved arm supports, and full upholstery form a Colonial / Georgian Revival upholstered armchair pattern.",
    confidence: 86,
    source_image: "derived",
    hard_negative: false,
    low_confidence_flag: false,
  });
}

  // =========================
  // LOUNGE-CHAIR FORM SYNTHESIZERS
  // Posture-based seating identity (deeper seat, lower seat height, more
  // reclined back, often fully upholstered) — distinct from arm-based
  // armchair_form per form_armchair.cousin_form_contrasts architectural
  // decision. Emits lounge_chair_form + club_chair_form + barrel_tub_back
  // so the armchairVeto at engine.ts:2504 (which blocks telephone-bench
  // mis-routing when seating + secondary_surface co-occur on an
  // upholstered lounge form) becomes reachable from textual perception
  // evidence in addition to direct LLM-emitted clues.
  // Canonical: lib/constraints/forms.ts form_lounge_chair (7 subtypes).
  // =========================

  const hasBarrelTubCues =
    hasClue("barrel_tub_back") ||
    hasText(
      "barrel back",
      "barrel-back",
      "tub back",
      "tub-back",
      "tub chair",
      "barrel chair",
      "cylindrical back",
      "wrap-around back",
      "wraparound back",
    );

  const hasClubCues =
    hasText(
      "club chair",
      "leather club",
      "smoking chair",
      "library club",
      "gentleman's chair",
    );

  const hasDeepLoungeCues =
    hasClue("fully_upholstered") &&
    (hasClue("button_tufting") ||
      hasClue("velvet_cover") ||
      hasClue("arm_upholstery") ||
      hasText(
        "rolled arms",
        "deep seat",
        "low seat",
        "reclined back",
        "overstuffed",
        "deep cushion",
        "loose cushion",
        "lounge chair",
        "easy chair",
      ));

  if (
    !hasClue("barrel_tub_back") &&
    hasBarrelTubCues &&
    (hasClue("seating_surface") ||
      hasClue("armchair_form") ||
      hasClue("backrest_present"))
  ) {
    out.push({
      type: "structure",
      clue: "barrel_tub_back",
      description:
        "Textual barrel/tub/cylindrical back vocabulary on a seating form indicates barrel-back construction.",
      confidence: 76,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  if (
    !hasClue("lounge_chair_form") &&
    (hasDeepLoungeCues ||
      (hasBarrelTubCues &&
        (hasClue("seating_surface") || hasClue("armchair_form"))) ||
      hasText(
        "lounge chair",
        "easy chair",
        "bergère",
        "bergere",
        "barrel chair",
        "tub chair",
      ) ||
      hasClubCues)
  ) {
    out.push({
      type: "form",
      clue: "lounge_chair_form",
      description:
        "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair.",
      confidence: 78,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  if (
    !hasClue("club_chair_form") &&
    hasClubCues &&
    (hasClue("fully_upholstered") ||
      hasClue("armchair_form") ||
      hasText("leather", "deep cushion", "rolled arms"))
  ) {
    out.push({
      type: "form",
      clue: "club_chair_form",
      description:
        "Club-chair vocabulary with deep upholstery indicates club chair variant. Canonical: form_lounge_chair / subtype_lounge_club.",
      confidence: 76,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  // =========================
  // WING-CHAIR FORM SYNTHESIZER
  // Structural wings extending forward from the upper back — distinct
  // from armchair (arm-based) and lounge chair (posture-based) per the
  // wing-as-structural-feature decision documented in form_wing_chair,
  // form_armchair, and form_lounge_chair cousin_form_contrasts. Emits
  // wingback_form so the armchairVeto at engine.ts:2504 (telephone-bench
  // mis-routing block) becomes reachable on wing chairs as well as
  // standard upholstered seating.
  // Canonical: lib/constraints/forms.ts form_wing_chair (8 subtypes).
  // =========================

  const hasWingCues =
    hasText(
      "wing chair",
      "wing chairs",
      "wingback",
      "wing-back",
      "wing back",
      "side wings",
      "draft wings",
      "fireside wing",
      "queen anne wing",
      "chippendale wing",
      "federal wing",
      "wing recliner",
      "wing-back club",
    );

  if (
    !hasClue("wingback_form") &&
    hasWingCues &&
    (hasClue("seating_surface") ||
      hasClue("armchair_form") ||
      hasClue("backrest_present"))
  ) {
    out.push({
      type: "form",
      clue: "wingback_form",
      description:
        "Structural side wings extending forward from upper back indicate wing-chair form. Canonical: form_wing_chair.",
      confidence: 80,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  // =========================
  // SLIPPER-CHAIR FORM SYNTHESIZER
  // Armless + low-seated + small-scale + upholstered coincident triplet —
  // distinct from side_chair (typically upright, often exposed wood),
  // armchair (has arms), lounge_chair (larger-scale, typically arm-bearing),
  // and wing_chair (has wings) per the structural-triplet decision
  // documented in form_slipper_chair.cousin_form_contrasts. Emits
  // slipper_chair_form so the armchairVeto at engine.ts:2504 covers
  // vanity-slipper-chair-near-vanity telephone-bench mis-routing scenarios
  // (a vanity slipper chair photographed next to its paired vanity could
  // otherwise fire the seating + secondary_surface composite-pattern
  // threshold and mis-route to telephone bench).
  // Canonical: lib/constraints/forms.ts form_slipper_chair (8 subtypes).
  // =========================

  const hasSlipperCues =
    hasText(
      "slipper chair",
      "slipper chairs",
      "boudoir chair",
      "boudoir slipper",
      "bedroom chair",
      "dressing chair",
      "vanity chair",
      "vanity slipper",
      "armless upholstered chair",
      "armless slipper",
      "low upholstered chair",
      "low armless chair",
      "lady's chair",
      "ladies chair",
    );

  if (
    !hasClue("slipper_chair_form") &&
    hasSlipperCues &&
    (hasClue("seating_surface") || hasClue("backrest_present")) &&
    !hasClue("armchair_form")
  ) {
    out.push({
      type: "form",
      clue: "slipper_chair_form",
      description:
        "Armless, low-seated, small-scale upholstered seating with bedroom / boudoir / dressing-room vocabulary indicates slipper-chair form. Canonical: form_slipper_chair.",
      confidence: 78,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  // =========================
  // WOOD-FRAME DEPENDENT STYLES
  // =========================
  if (
    !blocksTraditionalWoodFrameStyles &&
    (hasClue("louis_xvi_french_neoclassical") || hasText("louis xvi", "louis 16", "french neoclassical")) &&
    (hasClue("tapered_leg") || hasClue("cylinder_roll") || hasClue("parquetry_veneer") || hasClue("stringing_inlay") || hasClue("ormolu_mounts") || hasClue("brass_foot_sabots"))
  ) {
    out.push({
      type: "structure",
      clue: "louis_xvi_revival_pattern",
      description:
        "Louis XVI / French neoclassical style vocabulary combined with tapered legs, parquetry veneer, stringing inlay, ormolu mounts, brass foot sabots, or cylinder-roll construction supports a Louis XVI Revival pattern. In the American market this is treated as revival-era production rather than 18th-century French manufacture.",
      confidence: 84,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }
  if (
    !blocksTraditionalWoodFrameStyles &&
    (hasClue("slat_back") || hasClue("spindle_back")) &&
    (hasClue("square_legs") || hasText("rectilinear legs")) &&
    (hasClue("exposed_joinery") || hasClue("mortise_and_tenon")) &&
    (hasClue("oak_primary") || hasText("oak"))
  ) {
    out.push({
      type: "structure",
      clue: "mission_arts_crafts_structural_pattern",
      description:
        "Rectilinear form, exposed joinery, and oak construction indicate Mission / Arts & Crafts.",
      confidence: 90,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  if (
    !blocksTraditionalWoodFrameStyles &&
    (hasClue("cabriole_leg") || hasText("cabriole")) &&
    (hasClue("shell_carving") || hasText("shell motif")) &&
    (hasClue("symmetrical_case_form") || hasText("dresser", "chest")) &&
    !hasClue("hand_cut_dovetails")
  ) {
    out.push({
      type: "structure",
      clue: "colonial_revival_pattern",
      description:
        "Cabriole legs, shell carving, and symmetrical case form indicate Colonial Revival.",
      confidence: 84,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  if (
    !blocksTraditionalWoodFrameStyles &&
    (hasClue("ladder_back") || hasClue("slat_back")) &&
    (hasClue("tapered_leg")) &&
    (hasClue("minimal_ornament")) &&
    !hasClue("inlay")
  ) {
    out.push({
      type: "structure",
      clue: "shaker_pattern",
      description:
        "Simple slat-back form, tapered legs, and minimal ornament indicate Shaker.",
      confidence: 84,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  if (
    !blocksTraditionalWoodFrameStyles &&
    (hasClue("turned_leg") || hasText("vase turning")) &&
    (hasClue("stretcher_base")) &&
    (hasClue("rectangular_case"))
  ) {
    out.push({
      type: "structure",
      clue: "william_and_mary_pattern",
      description:
        "Turned legs, stretcher base, and rectilinear case indicate William & Mary.",
      confidence: 82,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  if (
    !blocksTraditionalWoodFrameStyles &&
    (hasClue("tapered_leg")) &&
    (hasClue("inlay") || hasText("string inlay")) &&
    (hasClue("bow_front") || hasText("shield back"))
  ) {
    out.push({
      type: "structure",
      clue: "federal_hepplewhite_sheraton_pattern",
      description:
        "Tapered legs, inlay, and delicate proportions indicate Federal / Sheraton.",
      confidence: 84,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  if (
    !blocksTraditionalWoodFrameStyles &&
    (hasClue("scroll_carving")) &&
    (hasClue("floral_carving")) &&
    (hasClue("serpentine_front"))
  ) {
    out.push({
      type: "structure",
      clue: "rococo_revival_pattern",
      description:
        "Scroll carving, floral carving, and serpentine forms indicate Rococo Revival.",
      confidence: 86,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  // LLM-emitted `*_revival_cues` clues synthesize a colonial_revival_pattern
  // so the structural-pattern penalty pulls attribution away from original-
  // period families (Louis XVI 1770–1830, Federal, etc.) toward the post-
  // 1876 Colonial Revival umbrella.
  if (
    !blocksTraditionalWoodFrameStyles &&
    (hasClue("neoclassical_revival_cues") || hasClue("colonial_revival_cues"))
  ) {
    out.push({
      type: "structure",
      clue: "colonial_revival_pattern",
      description:
        "Revival-marker cues (neoclassical/colonial *_revival_*) indicate Colonial Revival umbrella, not original-period attribution.",
      confidence: 80,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  // Golden Oak Era detector. Factory-era oak case goods (dressers, sideboards,
  // washstands, hall trees, desks) commonly read as oak + flat-sawn grain +
  // multiple-drawer case + late-Victorian hardware (round wood knobs, lock
  // escutcheons, porcelain casters) with no hand-cut joinery. Without this
  // detector, the original Empire/American Classical alias tokens (e.g.,
  // "empire" in empire_transitional_style) over-anchor pre-1860 attribution
  // on what is plainly 1890–1915 factory production. Per appraiser direction,
  // Golden Oak Era is NOT a style — it is a vernacular dating/material/
  // market-era marker. The synthesized clue routes via canonical map to
  // the wood-evidence layer (wood_variant_evidence_golden_oak_era) for
  // dating contribution, and via STRUCTURAL_PATTERN_FAMILY to
  // style_family_colonial_revival (the broadest post-1876 umbrella) for
  // competitive suppression of pre-1876 family attributions — without
  // claiming Golden Oak Era is itself a style.
  const oakSpecies =
    hasClue("wood_species_oak") ||
    hasClue("oak_primary") ||
    hasClue("wood_species_oak_group") ||
    hasText("oak");
  const oakGrain =
    hasClue("flat_sawn_oak_grain") ||
    hasClue("quarter_sawn_oak") ||
    hasClue("golden_oak_era_possible") ||
    hasText("flat-sawn oak", "quarter-sawn oak", "cathedral grain", "golden oak");
  const caseForm =
    hasClue("multiple_drawer_case") ||
    hasClue("drawer_present") ||
    hasText("chest of drawers", "dresser", "sideboard", "washstand");
  const factoryEraHardware =
    hasClue("round_wood_knob") ||
    hasClue("lock_escutcheons") ||
    hasClue("porcelain_caster");
  if (
    !blocksTraditionalWoodFrameStyles &&
    oakSpecies &&
    oakGrain &&
    caseForm &&
    factoryEraHardware &&
    !hasClue("hand_cut_dovetails") &&
    !hasClue("hand_forged_nail") &&
    !hasClue("pit_saw_marks")
  ) {
    out.push({
      // Materials-layer signal (not structure): Golden Oak Era is a wood +
      // finish + market-era anchor authored as an oak variant in
      // woodIdentification.ts (wood_variant_golden_oak_era) with paired
      // evidence in woodEvidence.ts. The dateHint resolves from canonical
      // (peak 1890–1915) via engineCanonicalMap; category routes the signal
      // into the wood layer of the dating overlap.
      type: "materials",
      clue: "golden_oak_structural_pattern",
      description:
        "Oak primary wood, flat-sawn or quarter-sawn oak grain, multiple-drawer case, and factory-era hardware (round wood knobs / lock escutcheons / porcelain casters) with no hand-cut joinery indicate Golden Oak Era factory production (c. 1890–1915 peak).",
      confidence: 82,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  // =========================
  // MATERIAL-AGNOSTIC (DO NOT BLOCK)
  // =========================

  if (
    (hasClue("stepped_profile") || hasClue("waterfall_edge")) &&
    (hasClue("geometric_veneer") || hasClue("burled_veneer")) &&
    (hasClue("chrome_hardware") || hasText("bakelite"))
  ) {
    out.push({
      type: "structure",
      clue: "art_deco_pattern",
      description:
        "Stepped forms, geometric veneer, and chrome/Bakelite indicate Art Deco.",
      confidence: 86,
      source_image: "derived",
      hard_negative: false,
      low_confidence_flag: false,
    });
  }

  // =========================
  // EXISTING CLEANUP (UNCHANGED)
  // =========================

  const PRIORITY_ORDER = [
    "mcm_structural_pattern",
    "queen_anne_revival_pattern",
    "colonial_georgian_revival_upholstered_armchair_pattern",
    "mission_arts_crafts_structural_pattern",
    "louis_xvi_revival_pattern",
    "colonial_revival_pattern",
    "shaker_pattern",
    "william_and_mary_pattern",
    "federal_hepplewhite_sheraton_pattern",
    "rococo_revival_pattern",
    "art_deco_pattern"
  ];

  const sorted = [...out].sort((a, b) => {
    const aRank = PRIORITY_ORDER.indexOf(a.clue || "");
    const bRank = PRIORITY_ORDER.indexOf(b.clue || "");
    return (aRank === -1 ? 999 : aRank) - (bRank === -1 ? 999 : bRank) || b.confidence - a.confidence;
  });

  const selected: Observation[] = [];
  const usedFamilies = new Set<string>();

  for (const pattern of sorted) {
    const family = pattern.clue || "";
    if (usedFamilies.has(family)) continue;
    selected.push(pattern);
    usedFamilies.add(family);
  }

  return selected;
}

 
// The p0 perception prompt emits observation types in the singular
// (material / fastener / toolmark / wood), but every downstream scoring and
// dating table — AUTHORITY_RANK, the dating-overlap CATEGORY_TO_LAYER map,
// CLUE_LIBRARY categories, the structural-evidence gates — keys on the plural
// canonical form. Left unreconciled, any LLM-emitted construction or material
// observation (the strongest age anchors) falls through to the default
// authority of 2 AND never reaches its dating-overlap layer, silently
// discarding genuine-age evidence. Normalize once at ingestion so every
// consumer sees the canonical vocabulary. (wood collapses into materials —
// the "wood" dating layer is keyed by the "materials" category.)
const OBSERVATION_TYPE_ALIASES: Record<string, string> = {
  material: "materials",
  fastener: "fasteners",
  toolmark: "toolmarks",
  wood: "materials",
};
function canonicalObservationType(t: string | null | undefined): string {
  const key = String(t || "context").toLowerCase().trim();
  return OBSERVATION_TYPE_ALIASES[key] ?? key;
}

const vocabSnapShadowEnabled = () =>
  process.env.P0_VOCAB_SNAP_SHADOW === "1" || process.env.P0_VOCAB_SNAP_SHADOW === "true";

export function buildEvidenceDigest(observations: Observation[], perception?: Perception): EvidenceDigest {
  // Normalize emitted types to the canonical vocabulary before anything reads
  // them (see OBSERVATION_TYPE_ALIASES). Mutating here means by_type, p4
  // weighting, and the dating overlap all agree downstream.
  observations.forEach((o) => {
    o.type = canonicalObservationType(o.type);
  });

  // On a wood-primary piece, metal-FRAME material keys (brass_frame,
  // tubular_steel, chrome_frame, metal_frame) are false twins of incidental
  // metal — brass hinges, an enameled-steel insert — and must not drive form,
  // style, or dating. Drop both the keys and their observations here so the
  // whole pipeline (frame digest, scoreForms, p4, dating overlap) sees one
  // consistent de-twinned digest.
  const presentKeys = observations
    .filter((o) => !o.negated)
    .map((o) => normalizeClueKey(o.clue))
    .filter(Boolean) as string[];
  const twinSuppress = new Set(falseTwinMaterialsToSuppress(presentKeys));
  const keptObservations = twinSuppress.size
    ? observations.filter((o) => {
        const k = normalizeClueKey(o.clue);
        return !(k != null && twinSuppress.has(k));
      })
    : observations;

  const by_type: Record<string, Observation[]> = {};
  keptObservations.forEach((o) => {
    if (!by_type[o.type]) by_type[o.type] = [];
    by_type[o.type].push(o);
  });

  // Rejected candidates (negated) never enter clue_keys — they must not route
  // forms or contribute positive evidence to any clue_keys consumer (scoreForms,
  // material classification, dating, style).
  const clue_keys = uniq(
    keptObservations
      .filter((o) => !o.negated)
      .map((o) => normalizeClueKey(o.clue))
      .filter(Boolean) as string[]
  );
  const hard_negatives = uniq(keptObservations.filter((o) => o.hard_negative).map((o) => o.clue || o.description));
  const strongest_observations = [...keptObservations].sort((a, b) => b.confidence - a.confidence).slice(0, 10);

  // Stage 1B shadow (observe-only). When enabled, compute what canonical-vocab
  // snapping WOULD produce and record the diff vs the current clue_keys — but do
  // NOT change clue_keys. Lets us measure drift on live scans with zero behavior
  // change before enforcing the controlled vocabulary.
  let vocab_shadow: VocabShadow | undefined;
  if (vocabSnapShadowEnabled()) {
    const changed: { from: string; to: string; method: SnapMethod }[] = [];
    const unmatched: string[] = [];
    const shadowClueKeys: string[] = [];
    for (const o of keptObservations) {
      if (o.negated || !o.clue) continue;
      const currentKey = normalizeClueKey(o.clue);
      const snap = snapToCanonical(o.clue, o.type);
      if (snap.canonical) {
        shadowClueKeys.push(snap.canonical);
        if (snap.canonical !== currentKey) changed.push({ from: currentKey ?? o.clue, to: snap.canonical, method: snap.method });
      } else if (currentKey) {
        unmatched.push(currentKey);
      }
    }
    vocab_shadow = { total: keptObservations.filter((o) => !o.negated && o.clue).length, changed, unmatched: uniq(unmatched), shadowClueKeys: uniq(shadowClueKeys) };
  }

  return { observations: keptObservations, observation_count: keptObservations.length, by_type, clue_keys, hard_negatives, strongest_observations, perception, vocab_shadow };
}

function computeMissingEvidence(images: any[]) {
  const types = new Set(images.map((img) => String(img?.image_type || "")));
  return {
    underside_photo: !types.has("underside"),
    back_photo: !types.has("back"),
    joinery_photo: !types.has("joinery_closeup"),
    hardware_photo: !types.has("hardware_closeup"),
    label_photo: !types.has("label_makers_mark"),
  };
}
// Block 14: full rewrite. Detection consumes Block 12 vocabulary (velvet_cover,
// button_tufting, coil_spring, etc.) in addition to the legacy clue keys.
// Produces structured {identification, range, confidence, date_floor,
// date_ceiling, note}. Originality inference vs frame dating is applied
// later in dateFromEvidence once the frame envelope is known.
export function detectUpholsteryLayer(digest: EvidenceDigest): UpholsteryLayer | null {
  const clues = new Set(digest.clue_keys);
  const has = (...keys: string[]) => keys.some((k) => clues.has(k));

  // Block 12 cover vocabulary
  const cover_velvet = has("velvet_cover");
  const cover_damask = has("damask_cover");
  const cover_brocade = has("brocade_cover");
  const cover_jacquard = has("jacquard_cover");
  const cover_chintz = has("chintz_cover");
  const cover_needlepoint = has("needlepoint_cover");
  const cover_haircloth = has("haircloth_cover");
  const cover_leather = has("leather_cover");
  const cover_vinyl = has("vinyl_cover");
  const anyCover =
    cover_velvet || cover_damask || cover_brocade || cover_jacquard ||
    cover_chintz || cover_needlepoint || cover_haircloth ||
    cover_leather || cover_vinyl;

  // Block 12 construction vocabulary
  const spring_hand_tied = has("hand_tied_coil_spring");
  const spring_coil = has("coil_spring");
  const spring_marshall = has("marshall_pocket_coil");
  const spring_serpentine = has("serpentine_spring");
  const spring_drop_in = has("drop_in_spring_unit");
  const spring_none = has("no_spring_seat");
  const fill_horsehair = has("horsehair_stuffing");
  const fill_cotton = has("cotton_batting");
  const fill_foam = has("foam_padding");
  const fill_polyurethane = has("polyurethane_foam");
  const fill_feather = has("feather_down_fill");
  const web_jute = has("jute_webbing");
  const web_elastic = has("elastic_webbing");
  const attach_button_tuft = has("button_tufting");
  const attach_nailhead = has("nailhead_trim");
  const attach_hand_tacks = has("hand_tacks");
  const attach_staples = has("upholstery_staple_construction");

  // Legacy generic markers (pre-Block-12 vocabulary)
  const legacyPresence =
    has("fully_upholstered", "upholstery_fabric", "visible_springs",
        "exposed_upholstery_tacks", "tufted_upholstery");
  const legacyTraditional =
    has("horsehair_cotton_stuffing", "burlap_visible", "burlap_foundation",
        "dark_coarse_fibrous_stuffing", "coarse_black_fiber_stuffing",
        "traditional_upholstery_fill", "burlap_backing", "webbing_visible");
  const legacyModern =
    has("synthetic_fabric_pattern", "vinyl_or_bonded_leather",
        "uniform_machine_tufting", "clean_modern_fabric");

  const upholsteryPresent =
    anyCover || spring_hand_tied || spring_coil || spring_marshall ||
    spring_serpentine || spring_drop_in || spring_none ||
    fill_horsehair || fill_cotton || fill_foam || fill_polyurethane ||
    fill_feather || web_jute || web_elastic ||
    attach_button_tuft || attach_nailhead || attach_hand_tacks ||
    attach_staples || legacyPresence || legacyTraditional || legacyModern;

  if (!upholsteryPresent) return null;

  // Bare-seat guard (Batch A / T1a). A rush, cane, splint, solid-plank, or expanded-
  // metal-mesh seat IS the seating surface — not upholstery. On such pieces the
  // "upholstery" signal is almost always a negation (no_spring_seat / "no webbing") or
  // a generic false positive (fully_upholstered), or a STRUCTURAL spring mistaken for
  // an upholstery coil (the Woodard patio chair's metal bounce spring → coil_spring,
  // which otherwise floors the envelope at 1780–1830). Suppress the phantom layer UNLESS
  // there is real upholstery evidence — an actual cover, stuffing/fill, or tufting/
  // nailhead — on top of the bare surface (e.g. a cushioned slip seat).
  const bareSeatSurface = has(
    "rush_seat_natural_fiber", "rush_seat_weave", "rush_back_panel",
    "rush_weave_pattern_diagonal_fill", "rush_aged_intact",
    "octagonal_seat_plank", "solid_plank_seat", "plank_seat",
    "expanded_metal_mesh_seat", "metal_mesh_seat",
    "caned_seat", "cane_seat", "splint_seat"
  );
  const realUpholsteryEvidence =
    anyCover || fill_horsehair || fill_cotton || fill_foam ||
    fill_polyurethane || fill_feather || legacyTraditional ||
    attach_button_tuft || attach_nailhead;
  if (bareSeatSurface && !realUpholsteryEvidence) return null;

  // Classify the construction/era profile. Most-specific signals win.
  const modernSynthetic = fill_polyurethane || fill_foam ||
    spring_serpentine || spring_drop_in || attach_staples ||
    cover_vinyl || legacyModern;
  const earlyTwentiethTraditional = spring_coil && (fill_horsehair || fill_cotton);
  const victorianTraditional = fill_horsehair && (cover_haircloth || attach_hand_tacks);
  const handCraftedSpring = spring_hand_tied;

  // Cover identification phrase (covers + tufting are the most visible signals
  // and drive the report's identification string).
  const coverPhrase =
    cover_velvet ? "velvet" :
    cover_haircloth ? "haircloth" :
    cover_leather ? "leather" :
    cover_vinyl ? "vinyl" :
    cover_damask ? "damask" :
    cover_brocade ? "brocade" :
    cover_jacquard ? "jacquard" :
    cover_chintz ? "chintz" :
    cover_needlepoint ? "needlepoint" :
    null;
  const tuftPhrase = attach_button_tuft ? "button-tufted" : null;
  const nailheadPhrase = attach_nailhead ? "nailhead-trimmed" : null;
  const constructionPhrase =
    handCraftedSpring ? "hand-tied coil spring construction" :
    spring_marshall ? "Marshall pocket-coil construction" :
    spring_drop_in ? "drop-in spring unit" :
    spring_serpentine ? "serpentine spring construction" :
    spring_coil ? "coil spring construction" :
    spring_none ? "no-spring stuffed seat" :
    null;

  const identificationParts = [
    tuftPhrase,
    coverPhrase,
    nailheadPhrase,
    "upholstery",
    constructionPhrase ? `with ${constructionPhrase}` : null,
  ].filter(Boolean);
  const identification = identificationParts.length > 1
    ? identificationParts.join(" ")
        .replace(/^./, (c) => c.toUpperCase())
    : "Upholstery present (insufficient detail to classify)";

  // Era classification → date envelope. Specific construction combinations
  // anchor narrower windows; generic presence falls through to broad ranges.
  // Mid-century velvet+button-tufting+synthetic markers is the Hollywood
  // Regency / 60s-70s reupholstery profile Block 14 was scoped to address.
  if (modernSynthetic && (cover_velvet || attach_button_tuft)) {
    return {
      identification,
      range: "c. 1955–1980",
      confidence: "Moderate",
      date_floor: 1955,
      date_ceiling: 1980,
      note: "Synthetic-era construction markers (polyurethane foam, staple attachment, or serpentine/drop-in spring) combined with velvet cover and button tufting are characteristic of mid-century reupholstery, frequently 1960s–1970s.",
    };
  }

  if (modernSynthetic) {
    return {
      identification,
      range: "post-1950",
      confidence: "Moderate",
      date_floor: 1950,
      date_ceiling: 2010,
      note: "Synthetic-era upholstery materials (polyurethane foam, staples, or vinyl cover) indicate later modern or replacement upholstery.",
    };
  }

  if (victorianTraditional) {
    return {
      identification,
      range: "c. 1860–1900",
      confidence: "Moderate",
      date_floor: 1860,
      date_ceiling: 1900,
      note: "Horsehair stuffing with haircloth cover or hand-tacked attachment supports Victorian-era traditional upholstery.",
    };
  }

  if (handCraftedSpring && (fill_horsehair || fill_cotton || web_jute)) {
    return {
      identification,
      range: "c. 1870–1930",
      confidence: "Moderate",
      date_floor: 1870,
      date_ceiling: 1930,
      note: "Hand-tied coil springs with horsehair, cotton, or jute webbing is canonical pre-WWII traditional upholstery construction.",
    };
  }

  if (earlyTwentiethTraditional || legacyTraditional) {
    return {
      identification,
      range: "c. 1880–1920",
      confidence: "Moderate",
      date_floor: 1880,
      date_ceiling: 1920,
      note: "Traditional spring + natural-fiber stuffing combination is consistent with late 19th to early 20th century work.",
    };
  }

  if (cover_haircloth) {
    return {
      identification,
      range: "c. 1840–1900",
      confidence: "Moderate",
      date_floor: 1840,
      date_ceiling: 1900,
      note: "Haircloth cover is canonical Victorian upholstery fabric.",
    };
  }

  // Cover-only or attachment-only — wide envelope; cover material alone
  // doesn't tightly date the upholstery without construction confirmation.
  if (anyCover || attach_button_tuft || attach_nailhead) {
    return {
      identification,
      range: "broad — cover-only signal",
      confidence: "Low",
      date_floor: null,
      date_ceiling: null,
      note: "Cover material or surface attachment is visible but underlying construction (springs, webbing, stuffing) is not, so the upholstery date envelope is broad. Underside or cushion-removed photos would tighten this.",
    };
  }

  // Construction signal without cover identification — fall through to broad
  return {
    identification,
    range: "unknown upholstery date",
    confidence: "Low",
    date_floor: null,
    date_ceiling: null,
    note: "Upholstery is present but lacks combined cover + construction evidence for independent dating.",
  };
}

// Block 14: build a frame-only digest by filtering out clues categorized as
// "upholstery" in CLUE_LIBRARY. Used to keep form ID, style attribution,
// and frame-date computation independent of upholstery evidence.
export function buildFrameDigest(digest: EvidenceDigest): EvidenceDigest {
  const upholsteryClueKeys = new Set<string>(
    Object.entries(CLUE_LIBRARY)
      .filter(([, meta]: [string, any]) => meta?.category === "upholstery")
      .map(([k]) => k)
  );
  return {
    ...digest,
    clue_keys: (digest.clue_keys || []).filter((k) => !upholsteryClueKeys.has(k)),
    observations: (digest.observations || []).filter(
      (o) => !o.clue || !upholsteryClueKeys.has(o.clue)
    ),
  };
}

// Block 14: compare frame and upholstery date envelopes to infer whether
// upholstery is likely original to the frame. Default detached; only flag
// likely-original when envelopes substantially overlap AND the canonical
// library's per-entry replacement_likelihood signals support originality.
//
// Block 15: now consults getReplacementLikelihood from the canonical
// library per upholstery clue present, replacing Block 14's hardcoded
// traditional/modern clue-list heuristics with authoritative library data.
// "low" replacement = durable (hand-tied coils, hand-tacks, horsehair) —
// often survives reupholstery. "high" replacement = commonly replaced
// (cover fabrics, button-tufted cushions, foam pads). "medium" = neutral.
function applyOriginalityInference(
  upholsteryLayer: UpholsteryLayer,
  frame: { date_floor?: number; date_ceiling?: number },
  digest: EvidenceDigest
): UpholsteryLayer {
  const uf = upholsteryLayer.date_floor;
  const uc = upholsteryLayer.date_ceiling;
  const ff = frame.date_floor;
  const fc = frame.date_ceiling;

  // Need numeric ranges on both sides to make any inference
  if (uf == null || uc == null || ff == null || fc == null) {
    return upholsteryLayer;
  }

  const overlap = !(uc < ff || uf > fc);
  const upholsteryLater = uf > fc;
  const upholsteryEarlier = uc < ff;

  // Block 15: tally canonical replacement-likelihood signals across the
  // upholstery clues actually present in this digest.
  const upholsteryClues = (digest.clue_keys || []).filter(
    (k) => CLUE_LIBRARY[k]?.category === "upholstery"
  );
  let lowReplCount = 0;
  let highReplCount = 0;
  const lowReplKeys: string[] = [];
  const highReplKeys: string[] = [];
  for (const k of upholsteryClues) {
    const rl = getReplacementLikelihood(k);
    if (rl === "low") { lowReplCount++; lowReplKeys.push(k); }
    if (rl === "high") { highReplCount++; highReplKeys.push(k); }
  }

  // Likely original: envelopes overlap, at least one low-replacement
  // canonical marker present, and no high-replacement marker dominates.
  if (overlap && lowReplCount > 0 && highReplCount <= lowReplCount) {
    return {
      ...upholsteryLayer,
      original_likely: true,
      cross_reference_note: `Upholstery dating overlaps the frame envelope and the canonical library marks ${lowReplCount} present feature(s) (${lowReplKeys.join(", ")}) as low-replacement-likelihood (durable construction that typically survives reupholstery). Originality is plausible.`,
    };
  }

  if (upholsteryLater) {
    const yearsLater = uf - fc;
    const highReplPhrase = highReplCount > 0
      ? ` Canonical high-replacement-likelihood markers present (${highReplKeys.join(", ")}) reinforce this reading.`
      : "";
    return {
      ...upholsteryLayer,
      original_likely: false,
      cross_reference_note: `Upholstery dating (${upholsteryLayer.range}) is later than the frame envelope (${ff}–${fc}); a reupholstery approximately ${yearsLater} years after the frame is the most likely reading.${highReplPhrase}`,
    };
  }

  if (upholsteryEarlier) {
    return {
      ...upholsteryLayer,
      original_likely: false,
      cross_reference_note: `Upholstery dating (${upholsteryLayer.range}) reads earlier than the frame envelope (${ff}–${fc}); this is unusual and may indicate misidentified construction markers or salvaged upholstery on a later frame.`,
    };
  }

  // Overlap but replacement-likelihood doesn't support originality
  return {
    ...upholsteryLayer,
    original_likely: false,
    cross_reference_note: highReplCount > 0
      ? `Upholstery and frame date envelopes overlap, but ${highReplCount} canonical high-replacement-likelihood feature(s) (${highReplKeys.join(", ")}) are present; originality cannot be inferred.`
      : "Upholstery and frame date envelopes overlap, but canonical replacement-likelihood signals do not clearly support originality.",
  };
}
function buildDateTighteningEvidence(digest: EvidenceDigest) {
  const clues = new Set(digest.clue_keys || []);
  const has = (...keys: string[]) => keys.some((k) => clues.has(k));

  const needs: string[] = [];

  const hadHardware = has(
    "hardware_present",
    "original_hardware",
    "brass_hardware",
    "caster",
    "lock",
    "hinge",
    "drawer_pull"
  );

  const hadJoinery = has(
    "dovetail",
    "hand_cut_dovetail",
    "machine_cut_dovetail",
    "mortise_tenon",
    "joinery_visible"
  );

  const hadUnderside = has(
    "underside_visible",
    "seat_underside",
    "case_bottom",
    "drawer_bottom",
    "frame_bottom"
  );

  const hadFasteners = has(
    "screw",
    "nail",
    "cut_nail",
    "wire_nail",
    "phillips_screw",
    "slotted_screw"
  );

  const hadLabel = has(
    "maker_label",
    "paper_label",
    "brand_mark",
    "stamp",
    "metal_tag"
  );

  const hadUpholsterySystem = has(
    "webbing",
    "springs",
    "tacking",
    "dust_cover",
    "upholstery_underlayer"
  );

  needs.push(hadUnderside ? "additional underside photos" : "underside photos");
  needs.push(hadJoinery ? "additional joinery details" : "joinery details");
  needs.push(hadFasteners ? "additional fastener evidence" : "fastener evidence");
  needs.push(hadHardware ? "additional hardware details" : "hardware details");

  if (has("fully_upholstered", "upholstery_fabric", "upholstery_material")) {
    needs.push(
      hadUpholsterySystem
        ? "additional upholstery-system evidence"
        : "upholstery-system evidence such as webbing, springs, tacking, or dust cover"
    );
  }

  needs.push(hadLabel ? "additional label or maker-mark photos" : "maker label or stamp photos");

  return `A tighter date would require ${needs.slice(0, 4).join(", ")}.`;
}
function buildIntakeSummary(intake: any): string {
  if (!intake) return "No intake details provided.";
  return Object.entries(intake)
    .filter(([, v]) => v !== "" && v !== false && v != null)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(" | ") || "No intake details provided.";
}

function addIntakeObservations(intake: any, observations: Observation[]): Observation[] {
  const out = [...observations];
  const add = (clue: string, description: string) => {
    if (out.some((o) => o.clue === clue)) return;
    const meta = getClueMeta(clue);
    out.push({ type: meta?.category || "context", clue, description, confidence: 55, source_image: "intake", hard_negative: false });
  };
  if (intake?.has_drawers) add("drawer_present", "User indicates drawers are present");
  if (intake?.has_doors) add("door_present", "User indicates doors are present");
  return dedupeObservations(out);
}

// Block 1 D-PH3-7: scoreForms returns canonical form_id alongside free-text label.
// `form` field preserved as backward-compat display string; `form_id` is null
// when the engine label has no canonical FormEntry equivalent (e.g., style-as-form
// labels like "Victorian Eastlake furniture" — those route to style_context in p3).
export type ScoredForm = {
  form: string;
  form_id: string | null;
  score: number;
  support: string[];
};

export function scoreForms(digest: EvidenceDigest): ScoredForm[] {
  const clues = new Set(digest.clue_keys);
  // T2a: on a wood-primary piece, incidental metal hardware (a cast-iron tilt
  // mechanism, brass hinges/locks, an enameled-steel basin) must not add
  // "Metal/Iron/Brass furniture" or "Toledo-style industrial" form candidates —
  // those mis-drive the form, the style-context label, and value. Genuinely-metal
  // pieces (woodPrimary false) keep them.
  const woodPrimary = isWoodPrimary(clues);
  // Rejected-candidate prose ("...not a clock case") must not drive text-based
  // form matching either — exclude negated observations from the haystack (#15).
  const text = `${digest.perception?.raw_text || ""} ${digest.observations.filter((o) => !o.negated).map((o) => `${o.clue} ${o.description}`).join(" ")}`.toLowerCase();

  const scores: Record<string, { form: string; score: number; support: string[] }> = {};

const material = classifyPrimaryMaterial(digest);

const blocksTraditionalWoodForms =
  material.primary === "metal" ||
  material.primary === "plastic" ||
  material.primary === "woven";

const isBlockedTraditionalForm = (form: string) => {
  if (!blocksTraditionalWoodForms) return false;

  const f = form.toLowerCase();

  return (
    f.includes("cabinet") ||
    f.includes("case furniture") ||
    f.includes("sideboard") ||
    f.includes("buffet") ||
    f.includes("dresser") ||
    f.includes("chest of drawers") ||
    f.includes("bookcase") ||
    f.includes("secretary") ||
    f.includes("drop-front") ||
    f.includes("slant-front") ||
    f.includes("roll-top") ||
    f.includes("william and mary") ||
    f.includes("chippendale") ||
    f.includes("federal") ||
    f.includes("hepplewhite") ||
    f.includes("sheraton") ||
    f.includes("jacobean") ||
    f.includes("tudor") ||
    f.includes("rococo") ||
    f.includes("gothic") ||
    f.includes("eastlake") ||
    f.includes("colonial revival") ||
    f.includes("shaker")
  );
};

const add = (form: string, score: number, support: string) => {
  if (isBlockedTraditionalForm(form)) return;

  if (!scores[form]) scores[form] = { form, score: 0, support: [] };
  scores[form].score += score;
  if (!scores[form].support.includes(support)) scores[form].support.push(support);
};

const hasAny = (...keys: string[]) => keys.some((k) => clues.has(k));

  // Chamber-pot commode / close stool. Computed once up front because it both
  // adds the commode form (below) and suppresses cousin forms whose text-matches
  // otherwise fire on commode prose (a commode is not a nightstand).
  const commodeEvidence = commodeEvidencePresent(clues);

  // Highest-authority maker/form labels
  if (clues.has("roos_label")) add("Roos cedar chest / hope chest", 120, "Visible Roos label directly supports the identification.");
  if (clues.has("lane_label")) add("Lane cedar chest / hope chest", 120, "Visible Lane label directly supports the identification.");

  // Composite seating / telephone / writing bench pattern
  let benchScore = 0;
  const benchSupport: string[] = [];

  if (hasAny("seating_surface", "seating_present")) {
    benchScore += 35;
    benchSupport.push("seating surface");
  }

  if (hasAny("backrest_present", "spindle_back", "spindle_gallery")) {
    benchScore += 25;
    benchSupport.push("backrest or spindle rail");
  }

  if (hasAny("secondary_surface", "writing_surface")) {
    benchScore += 35;
    benchSupport.push("secondary writing or side surface");
  }

  if (clues.has("telephone_shelf")) {
    benchScore += 45;
    benchSupport.push("telephone shelf or phone platform");
  }

  if (hasAny("drop_front_desk", "pigeonholes")) {
    benchScore += 35;
    benchSupport.push("desk or secretary features");
  }

  // Armchair / lounge / upholstered-seating evidence vetoes telephone-bench
  // routing. Previously a piece with `armchair_form` + `barrel_tub_back` +
  // `secondary_surface` (e.g., a tub chair with a side table feature
  // perceived in-frame) was scored as a telephone bench because the
  // composite-pattern threshold (65) fires on seating + secondary_surface
  // alone — even though full upholstery, tufting, and barrel/tub forms are
  // structurally incompatible with telephone-bench identity.
  const armchairVeto = hasAny(
    "armchair_form",
    "barrel_tub_back",
    "fully_upholstered",
    "button_tufting",
    "wingback_form",
    "lounge_chair_form",
    "club_chair_form",
    "slipper_chair_form",
  );

  const hasTelephoneBenchEvidence =
  !armchairVeto && (
    clues.has("telephone_shelf") ||
    (
      hasAny("seating_surface", "seating_present") &&
      hasAny("secondary_surface")
    )
  );

if (benchScore >= 65 && hasTelephoneBenchEvidence) {
    const label =
      hasAny("drop_front_desk", "pigeonholes")
        ? "Telephone bench / secretary combination"
        : hasAny("telephone_shelf")
        ? "Telephone bench"
        : "Telephone bench / writing bench combination";

    add(
      label,
      benchScore,
      `Composite functional pattern: ${benchSupport.join(", ")}.`
    );
  }

  // Desk and secretary forms.
  // Block 7b2: form-defining features take precedence over sub-features.
  // When a cylinder closure is present, pigeonholes and drop-front-style
  // writing surfaces (letter slots etc.) inside the cylinder are
  // sub-features of the cylinder desk — NOT independent evidence for
  // Secretary or drop-front secretary forms. Slant-front carries the
  // same precedence over pigeonholes (pigeonholes inside a slant-front
  // are part of slant-front identity). Without this suppression,
  // letter-slot observations were boosting Secretary above Cylinder
  // even when cylinder was clearly the dominant structural form.
  const cylinderActive = clues.has("cylinder_roll");
  const slantActive = clues.has("slant_front");
  // Cover-mechanism desk cluster, distinct from the rigid-cover cylinder desk.
  // Per each form's cousin_form_contrasts: cylinder = rigid curved cover;
  // Wooton = cabinet-office interior enclosed by outer doors; roll-top =
  // flexible slatted (S-roll/C-roll) rolling cover, typically a larger office
  // desk; tambour = sliding tambour, usually smaller or cabinet-fronted.
  // Gated on !cylinderActive so pieces the resolver already read as a rigid
  // cylinder stay routed to form_cylinder_desk; these branches only add the
  // previously-unreachable slatted/tambour/Wooton identities. Round-up
  // discipline: emit the cover-cluster identity and let the post-selection
  // subtype evaluator descend to S-roll/C-roll/grade variants only when
  // evidence clears its 0.65 confidence floor.
  const wootonNamed = includesAny(text, ["wooton", "wootton"]);
  const rollTopCover =
    !cylinderActive &&
    includesAny(text, [
      "roll-top", "roll top", "rolltop", "s-roll", "c-roll",
      "slatted cover", "slatted tambour", "tambour slat", "rolling slat",
    ]);
  const tambourCover =
    !cylinderActive &&
    !rollTopCover &&
    includesAny(text, ["tambour"]);
  const coverClusterActive = wootonNamed || rollTopCover || tambourCover;
  // Fall/slope-front writing-desk family (vertical or hinged fall front; cousins
  // of the slant-front and bookcase-topped secretary). Per fall_front_desk's
  // cousin_form_contrasts: secretary combines a desk WITH bookcase/chest storage;
  // escritoire is more cabinet-like (no bookcase); secrétaire à abattant is a
  // tall French cabinet with a vertical fall; bureau à gradins adds desk-born
  // tiers/galleries (vs. a hutch desk's larger upper storage). Folded into
  // deskFormDominant so a specifically-named fall-front identity suppresses the
  // generic drop-front/pigeonhole Secretary emission (those are sub-features
  // here). Bare "drop-front" is intentionally left to the Secretary route as
  // the broad round-up identity for the American market.
  const abattantDesk = includesAny(text, [
    "secrétaire à abattant", "secretaire a abattant", "abattant",
    "tall fall-front secretary", "drop-front cabinet secretary", "french fall-front cabinet",
  ]);
  const gradinsDesk = includesAny(text, [
    "bureau à gradins", "bureau a gradins", "gradins",
    "writing desk with superstructure", "gallery writing desk", "tiered writing desk",
  ]);
  const escritoireDesk = includesAny(text, ["escritoire"]);
  const fallFrontDesk = includesAny(text, [
    "fall-front", "fall front", "fall-lid", "fall lid",
    "folding-front", "wall-mounted fall-front", "compact fall-front",
  ]);
  const fallFrontFamilyActive = abattantDesk || gradinsDesk || escritoireDesk || fallFrontDesk;
  const deskFormDominant = cylinderActive || slantActive || coverClusterActive || fallFrontFamilyActive;
  if (clues.has("drop_front_desk") && !deskFormDominant) add("Secretary desk / drop-front desk", 90, "Drop-front writing surface is visible.");
  if (clues.has("pigeonholes") && !deskFormDominant) add("Secretary desk / writing desk", 65, "Interior cubbies or pigeonholes are visible.");
  if (slantActive) add("Slant-front desk", 100, "Slant-front writing surface is visible.");
    if (cylinderActive) {
    add(
      // FORM label stays style-free — a bureau à cylindre is the French
      // cylinder-desk form regardless of style; the "Louis XVI / Centennial
      // Revival" framing comes from the (independent) style attribution +
      // reconciliation. Baking the style into the form name doubled it once the
      // style label was prepended ("Centennial French Louis XVI Revival Louis
      // XVI Revival cylinder desk"). The neoclassical cues still distinguish the
      // French bureau à cylindre from a plain American cylinder roll-top.
      hasAny("parquetry_veneer", "ormolu_mounts", "brass_foot_sabots", "louis_xvi_french_neoclassical", "louis_xvi_revival_pattern")
        ? "Cylinder desk (bureau à cylindre)"
        : "Cylinder roll-top desk",
      125,
      "Cylinder roll-top closure, writing surface, interior compartments, and kneehole desk configuration support a cylinder desk reading."
    );
  }
  if (wootonNamed) {
    add("Wooton desk", 122, "Cabinet-office desk with outer doors enclosing a fitted interior (Wooton patent type).");
  } else if (rollTopCover) {
    add("Roll-top desk", 110, "Flexible slatted (S-roll/C-roll) rolling cover over a fitted writing interior.");
  } else if (tambourCover) {
    add("Tambour desk", 100, "Sliding tambour closure over a fitted writing interior.");
  }
  // Fall/slope-front family emit (most specific French cabinet forms first).
  if (abattantDesk) {
    add("Secrétaire à abattant", 105, "Tall French cabinet desk with a vertical fall front over a fitted interior.");
  } else if (gradinsDesk) {
    add("Bureau à gradins", 102, "Writing desk with a stepped superstructure of small drawers or a gallery.");
  } else if (escritoireDesk) {
    add("Escritoire", 100, "Cabinet-like fall-front writing desk without a bookcase top.");
  } else if (fallFrontDesk) {
    add("Fall-front desk", 98, "Hinged vertical fall-front writing surface over a fitted interior.");
  }

  // Institutional / public-task desk cluster.
  // These seven forms share identical group-level distinguishing_features, so
  // discrimination is driven by each form's authored common_aliases and the
  // cluster's cousin_form_contrasts: clerk's = occupational (ledger / counting-
  // house) vs. standing = posture/height-based; school = student + classroom
  // hardware vs. teacher's = schoolmaster/instructor; reception = greeting /
  // check-in vs. transaction counter = exchange / payment / service. Evaluated
  // as a single priority chain (one institutional identity per piece, per the
  // round-up discipline): strong distinctive terms first, with the generic
  // "counter desk" / "service desk" left as the transaction-counter catch
  // since those aliases live on form_transaction_counter_desk.
  // "schoolhouse" also names a pendant-light style and a wall-clock style;
  // exclude those so a schoolhouse light/pendant routes to form_pendant_light
  // and a schoolhouse clock routes to form_wall_clock, not a desk.
  const instSchool = !includesAny(text, [
    "schoolhouse light", "schoolhouse pendant", "schoolhouse globe",
    "schoolhouse fixture", "schoolhouse shade", "schoolhouse lamp", "schoolhouse clock",
  ]) && includesAny(text, [
    "school desk", "student desk", "schoolhouse", "schoolchild", "pupil desk",
    "attached-seat", "attached seat school", "sled-base", "lift-lid school",
    "tablet-arm desk", "tablet arm desk", "classroom desk", "combo desk",
    "one-room schoolhouse", "dorm desk", "homework desk",
  ]);
  const instTeacher = includesAny(text, [
    "teacher's desk", "teachers desk", "teacher desk", "schoolmaster",
    "schoolmistress", "instructor's desk", "instructor desk", "classroom pedestal",
  ]);
  // Standing/speaking lecterns are form_lectern (a stand, not a desk); release
  // them from the writing-lectern desk cue so they route to form_lectern.
  const instLectern = !includesAny(text, [
    "standing lectern", "floor lectern", "speaker's lectern", "speakers lectern",
    "speaking lectern", "church lectern", "presentation lectern", "acrylic lectern",
    "conductor's lectern", "fixed lectern",
  ]) && includesAny(text, [
    "lectern", "writing lectern", "ecclesiastical desk", "vestry desk",
    "sacristy desk", "scriptorium", "manuscript desk", "monastic writing",
    "monk's writing", "registry desk", "sign-in desk", "guest book desk",
    "guestbook desk", "marriage registry", "reading slope",
  ]);
  // A caged teller station / wicket is a bank FIXTURE (form_bank_fixture), not a
  // counter desk; release those two from the transaction-desk "teller" cue.
  const instTransactionStrong = !includesAny(text, ["teller cage", "teller wicket"]) && includesAny(text, [
    "teller", "cashier", "checkout desk", "register desk", "point of sale",
    "sales counter", "host stand", "maître d", "maitre d", "help desk",
    "support desk", "information desk", "returns desk", "customer service desk",
  ]);
  const instReception = includesAny(text, [
    "reception desk", "reception counter", "front desk", "check-in desk",
    "check in desk", "concierge", "nurse station", "nurses station",
    "security desk", "guard desk", "lobby security", "checkpoint desk",
    "welcome desk",
  ]);
  const instClerk = includesAny(text, [
    "clerk's desk", "clerks desk", "counting-house", "counting house",
    "ledger desk", "bookkeeper", "accountant's desk", "accountant desk",
    "mail-sorting", "mail sorting desk", "sorting desk", "postal desk",
    "post office clerk", "bank clerk", "store clerk",
  ]);
  const instStanding = includesAny(text, [
    "standing desk", "stand-up desk", "sit-stand", "sit stand",
    "height-adjustable desk", "height adjustable desk", "crank-adjustable desk",
    "electric height", "adjustable standing", "high writing desk",
    "high office desk", "wheelchair-accessible desk",
  ]);
  const instTransactionGeneric = includesAny(text, [
    "transaction desk", "counter desk", "service desk", "order desk",
    "catalog order", "showroom desk", "retail desk",
  ]);
  if (instSchool) {
    add("School desk", 105, "Student/classroom desk with institutional hardware (attached seat, lift-lid, or tablet arm).");
  } else if (instTeacher) {
    add("Teacher's desk", 102, "Classroom instructor's desk (schoolmaster/teacher form).");
  } else if (instLectern) {
    add("Lectern desk", 100, "Sloped reading/writing lectern or registry desk.");
  } else if (instTransactionStrong) {
    add("Transaction counter desk", 100, "Public-facing counter prioritizing exchange, payment, or service (teller, cashier, checkout, or help desk).");
  } else if (instReception) {
    add("Reception desk", 98, "Greeting / check-in counter (front desk, concierge, or reception station).");
  } else if (instClerk) {
    add("Clerk's desk", 100, "Occupational ledger / counting-house desk (bookkeeper, accountant, or sorting clerk).");
  } else if (instStanding) {
    add("Standing desk", 95, "Stand-height or sit-stand / height-adjustable work desk (posture-based form).");
  } else if (instTransactionGeneric) {
    add("Transaction counter desk", 92, "Service / counter desk for public transactions.");
  }

  // Seated pedestal / knee desk cluster + multi-user pair. Discriminated by the
  // cluster's cousin_form_contrasts: partner's = two-sided / bilateral access
  // (overrides pedestal/executive); benching = system-based open-plan multi-user
  // run; Davenport = compact side-drawer sloped desk; credenza desk = low cabinet
  // with work-surface/office function; executive = larger scale / suite context;
  // kneehole = central user opening; pedestal = drawer-support structure and the
  // cluster's broad catch-all (40 aliases: tanker, banker's, legal, government,
  // industrial single-user office desks). Gated on !deskFormDominant so the
  // pedestals + kneehole intrinsic to a roll-top/cylinder/slant desk are not
  // re-emitted here as independent evidence. One identity per piece (round-up).
  const davenportDesk =
    includesAny(text, [
      "davenport desk", "captain davenport", "ship captain's desk",
      "side-drawer davenport", "lift-top davenport", "campaign davenport",
    ]) ||
    (text.includes("davenport") &&
      includesAny(text, ["writing", "side drawer", "side-drawer", "sloped", "slope", "lift-top", "lift top", "desk"]) &&
      !includesAny(text, ["sofa", "settee", "couch", "loveseat", "sleeper"]));
  const partnersDesk = includesAny(text, [
    "partner's desk", "partners desk", "partner desk", "double-sided desk",
    "two-sided desk", "two-person desk", "double desk", "face-to-face desk",
    "opposed work desk", "partner workstation", "double writing table",
  ]);
  // Qualified bench-desk alias forms only (never bare "bench desk", which is a
  // substring of "workbench desk" -> would steal the workbench-desk form).
  const benchingDesk = includesAny(text, [
    "benching", "office benching", "shared bench desk", "linear bench desk",
    "open-plan bench desk", "open plan bench desk", "team bench desk",
    "hot-desk", "hot desk", "side-by-side desk", "bench-style shared",
  ]);
  const credenzaDesk =
    includesAny(text, [
      "credenza desk", "desk credenza", "office credenza desk",
      "computer credenza", "storage credenza desk", "wall credenza desk",
      "executive credenza desk",
    ]) ||
    (text.includes("credenza") && includesAny(text, ["desk", "work surface", "keyboard", "office work"]));
  // "executive l-desk" / "executive u-desk" are intentionally NOT gated here:
  // they appear in both the executive and the L/U alias lists, and the L/U
  // configuration is the more specific structural identity, so they fall
  // through to the office-equipment chain below.
  const executiveDesk = includesAny(text, [
    "executive desk", "executive pedestal", "executive suite desk",
    "executive return", "desk suite", "office suite desk",
    "executive bow-front", "managerial desk",
  ]);
  const kneeholeDesk = includesAny(text, [
    "kneehole desk", "knee-hole desk", "flat-top kneehole", "compact kneehole",
    "domestic kneehole", "georgian kneehole", "queen anne kneehole",
    "chippendale kneehole", "federal kneehole", "victorian kneehole",
    "kneehole writing", "central kneehole", "kneehole recess", "kneehole opening",
  ]);
  const pedestalDesk = includesAny(text, [
    "pedestal desk", "twin-pedestal", "twin pedestal", "double-pedestal desk",
    "single-pedestal desk", "return-pedestal", "tanker desk", "banker's desk",
    "bank officer", "lawyer's desk", "attorney's desk", "barrister's desk",
    "bureau desk", "kneehole bureau", "government desk", "civil service desk",
    "administrative pedestal", "foreman's desk", "factory office desk",
    "industrial pedestal", "law office pedestal", "legal desk",
    "bureau writing desk", "bureau cabinet desk",
  ]);
  if (!deskFormDominant) {
    if (partnersDesk) {
      add("Partner's desk", 100, "Two-sided / bilateral-access desk for two facing users.");
    } else if (benchingDesk) {
      add("Benching desk", 95, "System-based open-plan multi-user bench desking.");
    } else if (davenportDesk) {
      add("Davenport desk", 100, "Compact desk with a sloped/lift top and characteristic side drawers.");
    } else if (credenzaDesk) {
      add("Credenza desk", 92, "Low credenza-style cabinet with a work-surface / office function.");
    } else if (executiveDesk) {
      add("Executive desk", 98, "Large pedestal/suite desk with managerial scale or office-suite context.");
    } else if (kneeholeDesk) {
      add("Kneehole desk", 94, "Desk emphasizing a central knee opening flanked by drawers.");
    } else if (pedestalDesk) {
      add("Pedestal desk", 88, "Seated single-user desk built on drawer pedestals (incl. tanker, banker's, legal, government, industrial office desks).");
    }
  }

  // Office-equipment / machine-support desk cluster. Per the cluster's
  // cousin_form_contrasts: typewriter = drop-well / machine platform; computer
  // = keyboard / monitor / tower / cable support (gaming/esports/streaming are
  // computer-desk subtypes); modular workstation = component / panel / cubicle
  // systems furniture; L = one return, U = wraps three sides with a bridge.
  // Configuration (L/U) is checked before the generic computer catch so a
  // "computer L-desk" routes to the L form. !deskFormDominant-gated for
  // consistency with the other desk clusters.
  const typewriterDesk = includesAny(text, [
    "typewriter desk", "drop-well typewriter", "drop well typewriter",
    "machine-platform typewriter", "lift-top typewriter", "secretarial typewriter",
  ]);
  const modularWorkstation = includesAny(text, [
    "modular workstation", "modular office desk", "systems furniture",
    "systems desk", "action office", "herman miller systems",
    "steelcase systems", "panel-based workstation", "cubicle desk",
    "cubicle workstation", "open-plan workstation", "office cubicle",
  ]);
  const uShapedDesk = includesAny(text, [
    "u-shaped desk", "u-desk", "u-configuration", "bridge-and-credenza",
  ]);
  const lShapedDesk = includesAny(text, [
    "l-shaped desk", "l-desk", "l-configuration", "corner l-desk",
  ]);
  const computerDesk = includesAny(text, [
    "computer desk", "keyboard tray", "keyboard-tray", "monitor shelf",
    "monitor-shelf", "tower cabinet", "tower-cabinet", "pc desk", "gaming desk",
    "esports", "streaming desk", "rgb gaming", "multi-monitor", "laptop workstation",
    "laptop desk", "computer workstation",
  ]);
  if (!deskFormDominant) {
    if (typewriterDesk) {
      add("Typewriter desk", 100, "Desk with a drop well, lift platform, or machine shelf sized for a typewriter.");
    } else if (modularWorkstation) {
      add("Modular workstation desk", 96, "Component / panel-based systems-furniture workstation or cubicle.");
    } else if (uShapedDesk) {
      add("U-shaped desk", 96, "Desk that wraps the user on three sides with a bridge and credenza return.");
    } else if (lShapedDesk) {
      add("L-shaped desk", 96, "Desk with a single perpendicular return forming an L.");
    } else if (computerDesk) {
      add("Computer desk", 92, "Desk with keyboard tray, monitor shelf, tower cabinet, or cable management for computer equipment (incl. gaming/streaming).");
    }
  }

  // Open writing-surface desk cluster: writing surface visible when not in use,
  // no enclosing cover (distinct from the fall-front / cover families above).
  // Distinctive named forms with little cross-overlap. !deskFormDominant-gated.
  const bonheurDuJour = includesAny(text, [
    "bonheur du jour", "bonheur-du-jour", "writing table with cabinet",
    "cabinet writing table", "small secretary table",
  ]);
  const carltonHouse = includesAny(text, ["carlton house", "curved-back writing desk"]);
  const bureauPlat = includesAny(text, [
    "bureau plat", "flat-top writing desk", "formal writing table", "french writing table",
  ]);
  const kidneyDesk = includesAny(text, [
    "kidney desk", "kidney-shaped writing", "kidney shaped writing",
    "ladies' kidney", "leather-top kidney",
  ]);
  if (!deskFormDominant) {
    if (bonheurDuJour) {
      add("Bonheur du jour", 100, "Small ladies' writing table with a raised cabinet superstructure.");
    } else if (carltonHouse) {
      add("Carlton House desk", 100, "Writing desk with a curved bank of drawers and pigeonholes wrapping a U-shaped top.");
    } else if (bureauPlat) {
      add("Bureau plat", 98, "Flat-top French writing table/desk with an open work surface.");
    } else if (kidneyDesk) {
      add("Kidney desk", 98, "Kidney/curved-outline writing desk, usually leather-topped.");
    }
  }

  // Conversion flag: a non-desk source object repurposed AS a desk. Per the
  // convertible cluster's cousin_form_contrasts, an explicit conversion should
  // be classified as the converted form rather than the purpose-built cousin,
  // so the armoire-desk and workbench-desk gates below yield to it ("converted
  // armoire desk" -> converted_cabinet_desk; "converted workbench desk" ->
  // converted_industrial_desk).
  const convertedSource = includesAny(text, [
    "converted", "conversion", "reclaimed", "repurposed", "upcycled",
  ]);

  // Cabinet-integrated + architectural built-in desk clusters. Per the
  // cousin_form_contrasts: Murphy folds away / integrates with a wall-bed or
  // cabinet system; wall unit is a wall system with substantial cabinet storage
  // plus a work surface; built-in is permanently installed in architectural
  // cabinetry/millwork (vs. a removable wall desk); wall desk is simply mounted;
  // hutch adds open upper storage (vs. a secretary's concealed fitted interior);
  // armoire is a tall freestanding wardrobe-like enclosure and the broad
  // "cabinet desk" catch. Ordered most-specific-architectural first;
  // !deskFormDominant-gated.
  // Murphy is defined by wall-bed / wall integration, NOT folding alone (an
  // armoire desk also folds away — "Folding armoire desk" is an armoire alias),
  // so the gate requires wall/wall-bed/Murphy context rather than bare "fold".
  const murphyDesk = includesAny(text, [
    "murphy desk", "fold-down wall desk", "fold down wall desk", "wall-bed desk",
    "wall bed desk", "cabinet murphy desk",
  ]);
  const wallUnitDesk = includesAny(text, [
    "wall unit desk", "wall system desk", "wall-spanning desk", "wall unit with desk",
    "entertainment center desk", "library wall unit desk",
  ]);
  const builtInDesk = includesAny(text, [
    "built-in desk", "built in desk", "architectural desk", "millwork desk",
    "alcove built-in", "window-seat built-in", "under-stair built-in",
    "kitchen office built-in", "bookcase-integrated built-in", "built-in writing",
  ]);
  const wallDesk = includesAny(text, [
    "wall desk", "floating wall desk", "wall-mounted desk", "wall mounted desk",
    "wall-mounted writing", "wall-hung writing", "hanging writing cupboard",
    "wall-mounted writing cupboard", "compact wall desk",
  ]);
  const hutchDesk = includesAny(text, [
    "hutch desk", "desk with hutch", "computer hutch", "student hutch",
    "executive hutch", "secretary hutch", "hutch top",
  ]);
  const armoireDesk = !convertedSource && includesAny(text, [
    "armoire desk", "computer armoire", "secretary armoire", "hideaway desk",
    "wardrobe desk", "cabinet workstation", "closet desk", "cabinet hideaway",
    "armoire hideaway", "concealed desk", "enclosed cabinet desk",
    "office cabinet desk", "standing cabinet desk", "locking cabinet desk",
    "desk cabinet", "storage cabinet desk", "cabinet desk",
  ]);
  if (!deskFormDominant) {
    if (murphyDesk) {
      add("Murphy desk", 98, "Fold-away desk integrated with a wall-bed or cabinet system.");
    } else if (wallUnitDesk) {
      add("Wall unit desk", 96, "Wall system combining substantial cabinet storage with a usable work surface.");
    } else if (builtInDesk) {
      add("Built-in desk", 96, "Desk permanently installed as part of architectural cabinetry or millwork.");
    } else if (wallDesk) {
      add("Wall desk", 94, "Wall-mounted (removable) writing desk or writing cupboard.");
    } else if (hutchDesk) {
      add("Hutch desk", 95, "Desk with an added open upper hutch storage unit.");
    } else if (armoireDesk) {
      add("Armoire desk", 95, "Tall freestanding wardrobe-like cabinet enclosing a fold-away desk interior.");
    }
  }

  // Task-specific + portable desk clusters. Per field_desk's cousin_form_
  // contrasts: a writing box is a portable case-like object; a tabletop desk is
  // an organizer/cabinet meant to sit on other furniture; a field desk implies
  // mobile work use (campaign/military/naval/expedition). Task-specific work
  // desks (artist's drawing/drafting, laboratory, workbench) are gated on their
  // trade language. Workbench avoids the bare "industrial desk" / "service
  // desk" / "bench desk" terms (those collide with the convertible-industrial,
  // transaction, and benching forms). !deskFormDominant-gated.
  const writingBoxDesk = includesAny(text, [
    "writing box", "writing slope", "lap desk", "lap laptop desk", "portable writing slope",
  ]);
  const fieldDesk = includesAny(text, [
    "field desk", "campaign desk", "campaign writing table", "folding field",
    "knockdown campaign", "officer's campaign", "field officer", "army field desk",
    "navy writing desk", "naval desk", "expedition desk", "explorer's desk",
    "survey expedition", "colonial expedition", "barracks desk", "shipboard desk",
    "marine writing desk", "military desk",
  ]);
  const tabletopDesk = includesAny(text, [
    "tabletop desk", "table-top desk", "tabletop writing cabinet",
    "tabletop secrétaire", "tabletop secretaire",
  ]);
  const artistDesk = includesAny(text, [
    "artist's desk", "artists desk", "drawing desk", "drafting table desk",
    "illustrator", "tilting artist", "art table desk", "studio desk",
  ]);
  const laboratoryDesk = includesAny(text, [
    "laboratory desk", "science desk", "lab work desk", "lab desk",
    "research desk", "technician's desk", "technician desk",
  ]);
  const workbenchDesk = !convertedSource && includesAny(text, [
    "workbench desk", "workbench", "industrial work desk", "maker desk",
    "craft workbench", "jeweler's desk", "jeweler desk", "watchmaker",
    "precision work desk", "craftsperson", "machinist", "mechanic's desk",
    "garage desk", "parts desk", "tool desk", "tool-storage desk", "shop desk",
    "workshop desk", "factory desk", "maintenance desk",
  ]);
  if (!deskFormDominant) {
    if (writingBoxDesk) {
      add("Writing box", 100, "Portable case-like writing box / slope with a fitted interior (incl. lap desks).");
    } else if (fieldDesk) {
      add("Field desk", 100, "Portable folding/knockdown campaign or military field desk for mobile work.");
    } else if (tabletopDesk) {
      add("Tabletop desk", 98, "Writing cabinet/organizer meant to rest on another piece of furniture.");
    } else if (artistDesk) {
      add("Artist's desk", 98, "Drawing/drafting desk with an adjustable or tilting work surface.");
    } else if (laboratoryDesk) {
      add("Laboratory desk", 96, "Science/research/technician work desk with durable task surfaces.");
    } else if (workbenchDesk) {
      add("Workbench desk", 96, "Heavy utilitarian trade/workshop desk (jeweler, watchmaker, machinist, shop, factory).");
    }
  }

  // Convertible / repurposed desk cluster: a source object (instrument, sewing
  // or treadle machine, leaf table, cabinet, dressing table, industrial piece)
  // serving desk function, plus the telephone desk. Per the cousin_form_
  // contrasts, classify the conversion only when desk/writing function is
  // evident; otherwise the base table/instrument form (already reachable) keeps
  // its route. Gated on explicit conversion/desk language so a plain drop-leaf
  // or gateleg table, or a telephone bench, is NOT pulled in here. Order keeps
  // qualified forms ahead of the broad "converted cabinet" catch; sewing is
  // checked before treadle so a "treadle-base sewing machine desk" routes to
  // the sewing form. !deskFormDominant-gated.
  const pianoDesk = includesAny(text, [
    "piano desk", "piano conversion", "reclaimed-piano desk", "piano case desk",
    "repurposed piano desk",
  ]);
  const organDesk = includesAny(text, [
    "organ desk", "organ conversion", "pump organ desk", "reed organ desk",
    "parlor organ desk", "organ case desk", "repurposed organ desk",
  ]);
  const sewingMachineDesk = includesAny(text, [
    "sewing machine desk", "sewing cabinet desk", "singer machine conversion",
    "singer cabinet conversion", "singer treadle conversion", "sewing cabinet conversion",
  ]);
  const treadleDesk = includesAny(text, [
    "treadle base desk", "treadle machine desk", "treadle-base desk",
    "industrial treadle base", "decorative treadle base", "treadle base conversion",
    "repurposed treadle desk",
  ]);
  const telephoneDesk = includesAny(text, [
    "telephone desk", "phone desk", "telephone table desk",
    "directory-compartment telephone desk", "telephone stand desk",
  ]);
  const dropLeafDesk = includesAny(text, [
    "drop-leaf desk", "drop leaf desk", "drop-leaf writing desk", "drop-leaf desk-table",
    "hinged-leaf desk", "folding-leaf desk",
  ]);
  const gatelegDesk = includesAny(text, [
    "gateleg desk", "gate-leg desk", "gateleg writing desk", "pivot-leg desk", "swing-leg desk",
  ]);
  const convertedDressingTableDesk = includesAny(text, [
    "dressing table desk", "vanity desk", "makeup table desk", "vanity conversion desk",
    "dressing table conversion", "converted dressing table",
  ]);
  const convertedIndustrialDesk = includesAny(text, [
    "converted industrial desk", "converted workbench desk", "factory cart desk",
    "machine base desk", "converted tool chest desk", "industrial conversion desk",
    "reclaimed industrial desk",
  ]);
  const convertedCabinetDesk = includesAny(text, [
    "converted cabinet desk", "converted armoire desk", "converted wardrobe desk",
    "converted cupboard desk", "repurposed cabinet desk", "cabinet-to-desk conversion",
  ]);
  if (!deskFormDominant) {
    if (pianoDesk) {
      add("Piano desk", 96, "Desk converted from a piano case.");
    } else if (organDesk) {
      add("Organ desk", 96, "Desk converted from a pump/reed/parlor organ case.");
    } else if (sewingMachineDesk) {
      add("Sewing machine desk", 96, "Desk built from or as a sewing-machine cabinet (incl. Singer treadle cabinet conversions).");
    } else if (treadleDesk) {
      add("Converted treadle machine desk", 96, "Desk built on a reused cast-iron treadle-machine base.");
    } else if (telephoneDesk) {
      add("Telephone desk", 96, "Writing desk with a telephone shelf and directory storage (telephone desk, not a seated gossip bench).");
    } else if (dropLeafDesk) {
      add("Drop-leaf desk", 95, "Writing desk with hinged drop leaves (desk function, not a plain drop-leaf table).");
    } else if (gatelegDesk) {
      add("Gateleg desk", 104, "Writing desk with swinging gate-leg supports (desk function, not a plain gateleg table).");
    } else if (convertedDressingTableDesk) {
      add("Converted dressing table desk", 95, "Dressing table / vanity repurposed with a writing-desk function.");
    } else if (convertedIndustrialDesk) {
      add("Converted industrial desk", 95, "Industrial object (factory cart, machine base, tool chest) repurposed as a desk.");
    } else if (convertedCabinetDesk) {
      add("Converted cabinet desk", 94, "Cabinet, cupboard, wardrobe, or armoire repurposed as a desk.");
    }
  }

  // Table forms
  if (clues.has("drop_leaf_hinged")) add("Drop-leaf table", 90, "Drop-leaf construction is visible.");
  if (clues.has("gateleg_support")) add("Gateleg table", 100, "Gate-leg support is visible.");
  if (clues.has("extension_mechanism")) add("Extension table", 82, "Extension mechanism is visible.");
  // Pedestal-column resolution. A single-column / tripod support resolves to a
  // specific form by WHAT IT CARRIES — the cousin split the canonical map's
  // "Pedestal stand" NO_MATCH note intends: candle stand = small single-object
  // top; plant stand = planter support; pedestal table = a full table top on a
  // central column. When carried-object cues are absent the generic "Pedestal
  // stand" stands (round-up). Shape-defined pedestal tables (tilt-top, drum,
  // piecrust) are emitted in the shape cluster below and outscore these.
  const pedestalSupport = clues.has("pedestal_column");
  const seatingOrIndustrial = hasAny(
    "seating_surface", "backrest_present", "toledo_industrial_style",
    "mid_century_industrial_office", "height_adjustment_mechanism",
    "swivel_mechanism", "four_leg_caster_base",
  );
  const candleStandCues = includesAny(text, [
    "candle stand", "candlestand", "candle-stand", "candle table", "tripod candle",
  ]);
  const plantStandCues = includesAny(text, [
    "plant stand", "fern stand", "jardiniere stand", "jardinière stand",
    "planter stand", "plant table",
  ]);
  // "round pedestal table" intentionally omitted — the canonical map routes that
  // phrase to form_drum_table (handled in the shape cluster's drum gate below).
  const pedestalTableCues = includesAny(text, [
    "pedestal table", "pedestal dining", "center pedestal table",
    "tulip table", "tulip pedestal", "gueridon", "guéridon", "capstan table", "loo table",
  ]);
  if (!seatingOrIndustrial) {
    if (candleStandCues) {
      add("Candle stand", 96, "Small turned/tripod stand sized to hold a single object such as a candle.");
    } else if (plantStandCues) {
      add("Plant stand", 96, "Pedestal/stand designed to hold a plant or jardinière.");
    } else if (pedestalTableCues) {
      add("Pedestal table", 98, "Table top carried on a central pedestal column rather than four legs.");
    } else if (pedestalSupport) {
      add("Pedestal stand", 88, "Single-column pedestal form is visible.");
    }
  }

  // Shape/structure-defined table cluster. Gated on text matching each form's
  // existing common_aliases (the FORM_LABEL_TO_CANONICAL routes already exist;
  // only this producer emission was missing). One shape identity per piece;
  // the more specific edge/leaf feature is checked first (piecrust before
  // tilt-top; Pembroke/Sutherland score above the generic drop-leaf/gateleg
  // table emissions so the named form wins when it also trips those clues).
  const lowboyTable = includesAny(text, ["lowboy"]);
  const demiluneTable = includesAny(text, [
    "demilune", "demi-lune", "half-moon table", "half moon table",
    "semicircular table", "semi-circular table", "half-round table", "half-round console",
  ]);
  const piecrustTable = includesAny(text, [
    "piecrust", "pie-crust", "pie crust", "scalloped-edge table", "scalloped tea table",
  ]);
  const tiltTopTable = includesAny(text, [
    "tilt-top", "tilt top", "tip-top table", "flip-top table", "tilt table",
    "tilting tea table", "tilting top", "birdcage table", "birdcage tilt-top",
  ]);
  const drumTable = includesAny(text, ["drum table", "drum side table", "round pedestal table"]);
  const pembrokeTable = includesAny(text, ["pembroke"]);
  const sutherlandTable = includesAny(text, ["sutherland"]);
  const trestleTable = includesAny(text, [
    "trestle table", "trestle dining", "refectory table", "refectory dining",
    "monastery table", "abbey table", "sawhorse table", "a-frame table", "x-base table",
    "draw-leaf trestle",
  ]);
  const nestingTables = includesAny(text, ["nesting table", "nest of tables", "stacking tables"]);
  const etagereTable = includesAny(text, [
    "etagere table", "étagère table", "tier table", "tiered display table",
  ]);
  if (lowboyTable) {
    add("Lowboy", 100, "Low table-height case-and-table hybrid with drawers on tall legs.");
  } else if (demiluneTable) {
    add("Demilune table", 100, "Semicircular / half-moon top — the defining feature.");
  } else if (piecrustTable) {
    add("Piecrust table", 102, "Scalloped, carved pie-crust raised-edge top (often a tilt-top tea table).");
  } else if (tiltTopTable) {
    add("Tilt-top table", 98, "Top that tilts/tips from horizontal to vertical, often on a tripod birdcage.");
  } else if (drumTable) {
    add("Drum table", 100, "Round drum-shaped top, usually over a pedestal with frieze drawers.");
  } else if (pembrokeTable) {
    add("Pembroke table", 104, "Small drop-leaf table with short hinged leaves and an apron drawer.");
  } else if (sutherlandTable) {
    add("Sutherland table", 106, "Very narrow gateleg drop-leaf table with a thin closed footprint.");
  } else if (trestleTable) {
    add("Trestle table", 100, "Long top on two trestle-like end supports joined by a stretcher.");
  } else if (nestingTables) {
    add("Nesting tables", 100, "Set of graduated tables that slide/stack beneath one another.");
  } else if (etagereTable) {
    add("Etagere table", 98, "Display table with multiple open tiers or shelves.");
  }

  // Height-defined table cluster, round-up-to-dominant per appraiser call:
  // emit the common identity and split to the rarer cousin only on an explicit
  // term. Low (coffee/cocktail), standing (pub/bistro), seated dining
  // (dining/kitchen/breakfast). Each is a small priority chain.
  // Low tables in front of seating: coffee is dominant; cocktail only when named.
  const cocktailTable = includesAny(text, ["cocktail table"]);
  const coffeeTable = includesAny(text, ["coffee table"]);
  if (cocktailTable) {
    add("Cocktail table", 94, "Low table in front of seating, explicitly a cocktail table.");
  } else if (coffeeTable) {
    add("Coffee table", 92, "Low table placed in front of seating for drinks/books.");
  }
  // Standing / counter height: pub (tavern/bar) vs bistro (café/counter).
  const pubTable = includesAny(text, [
    "pub table", "tavern table", "bar-height table", "bar height table", "bar table",
  ]);
  const bistroTable = includesAny(text, [
    "bistro table", "bistro café", "bistro cafe", "café table", "cafe table",
    "sidewalk café", "sidewalk cafe", "ice-cream parlor table", "soda-fountain table",
    "counter-height table", "patio bistro",
  ]);
  if (pubTable) {
    add("Pub table", 95, "Tall standing/bar-height table for use while standing or on stools.");
  } else if (bistroTable) {
    add("Bistro table", 95, "Small round café/bistro table, often counter height.");
  }
  // Seated dining height: kitchen (utility/farmhouse) and breakfast (nook/
  // dinette) split off their cues; dining is the dominant fallback.
  const kitchenTable = includesAny(text, [
    "kitchen table", "kitchen dining", "kitchen utility table", "farmhouse table", "farm table",
    "farm kitchen", "enamel table", "enamel-top", "porcelain top table", "hoosier table",
    "formica table", "laminate kitchen", "baking table", "bread table", "utility table",
  ]);
  const breakfastTable = includesAny(text, [
    "breakfast table", "breakfast nook", "nook table", "dinette", "sunroom table",
    "apartment dining table",
  ]);
  const diningTable = includesAny(text, ["dining table", "dining room table"]);
  if (kitchenTable) {
    add("Kitchen table", 92, "Domestic utility/farmhouse dining-height kitchen table.");
  } else if (breakfastTable) {
    add("Breakfast table", 92, "Small informal seated-dining table (nook/dinette scale).");
  } else if (diningTable) {
    add("Dining table", 90, "Large seated-dining surface for meals.");
  }

  // Work-table cluster (function-defined; gated on explicit terms so they don't
  // collide with the writing-desk / drafting-desk / sewing-machine-desk and
  // workbench-desk forms, which require "desk"/"machine"/"workbench" language).
  if (includesAny(text, ["drafting table", "architect's table", "drawing table", "drafting board"])) {
    add("Drafting table", 92, "Adjustable/tilting drafting/drawing work table.");
  } else if (includesAny(text, ["sewing table", "needlework table", "work table for sewing"])) {
    add("Sewing table", 92, "Small work table fitted for sewing/needlework storage.");
  } else if (includesAny(text, ["library table"])) {
    add("Library table", 90, "Substantial reading/writing library table, often with frieze drawers.");
  } else if (includesAny(text, ["writing table"])) {
    add("Writing table", 90, "Seated writing/correspondence table with an open work surface.");
  } else if (includesAny(text, ["work table"])) {
    add("Work table", 88, "Task-oriented domestic/craft work table.");
  }

  // Placement / decorative table cluster. Round-up-to-dominant: specific named
  // forms first; the generic small-auxiliary forms (occasional, then side) act
  // as the catch tail, and parlor's Victorian cues take precedence over the
  // generic center table. Shape forms (drum/tilt-top/piecrust) are emitted
  // earlier and outscore these, so a "drum side table" stays a drum table.
  if (includesAny(text, ["game table", "games table", "card table", "gaming table"])) {
    add("Game table", 94, "Table for cards/board games, often with a folding or reversible top.");
  } else if (includesAny(text, ["tea table"])) {
    add("Tea table", 92, "Small table for serving tea/refreshments.");
  } else if (includesAny(text, ["tray table", "tv tray", "folding tray"])) {
    add("Tray table", 92, "Lightweight auxiliary table built around a tray-like top.");
  } else if (includesAny(text, ["ottoman table", "ottoman coffee table", "cocktail ottoman", "upholstered coffee table"])) {
    // Scored above the coffee/cocktail height forms: an ottoman-table is often
    // also described as a "coffee table", but the upholstered hybrid is the
    // more specific identity.
    add("Ottoman table", 96, "Seating-zone hybrid combining an upholstered ottoman with a table top.");
  } else if (includesAny(text, ["pier table"])) {
    add("Pier table", 90, "Wall table placed between windows, often with a mirror plinth.");
  } else if (includesAny(text, ["sofa table"])) {
    add("Sofa table", 90, "Long narrow table designed to stand behind or beside a sofa.");
  } else if (includesAny(text, ["console table", "hall console", "hall table"])) {
    add("Console table", 90, "Narrow wall-oriented table for an entry, hall, or behind seating.");
  } else if (includesAny(text, [
    "parlor table", "parlour table", "marble-top parlor", "marble-top parlour",
    "eastlake table", "aesthetic movement table", "renaissance revival parlor",
    "rococo revival parlor", "golden oak parlor", "drawing-room table", "sitting-room table",
  ])) {
    add("Parlor table", 90, "Victorian decorative parlor/sitting-room table (often marble-topped).");
  } else if (includesAny(text, ["center table", "centre table"])) {
    add("Center table", 88, "Room-centered table for display, social setting, or reading.");
  } else if (includesAny(text, ["occasional table", "accent table", "drink table", "martini table", "occasional stand", "accent stand"])) {
    add("Occasional table", 88, "Small auxiliary/accent table.");
  } else if (includesAny(text, ["side table", "end table"])) {
    add("Side table", 88, "Small auxiliary table placed beside seating or a bed.");
  }

  // Chest and storage forms
  if (clues.has("cedar_lining") || clues.has("lift_lid")) {
    add(
      "Cedar chest / hope chest",
      clues.has("cedar_lining") ? 85 : 65,
      "Chest form and/or cedar interior are visible."
    );
  }

  // Case furniture forms
  if (clues.has("multiple_drawer_case")) {
    add("Chest of drawers / dresser", 70, "Multiple stacked drawers are visible.");
  }

  if (clues.has("drawer_present") && !hasAny("seating_present", "seating_surface", "telephone_shelf", "secondary_surface", "writing_surface")) {
    add("Dresser / drawer case", 42, "Drawer evidence is visible without stronger competing functional features.");
  }

  if (clues.has("door_present") && clues.has("drawer_present")) {
    add("Cabinet / dresser combination", 48, "Doors and drawers are both visible.");
  }

  if (clues.has("cabinet_form")) {
    add("Cabinet", 35, "Cabinet form is visible.");
  }

  if (clues.has("open_shelving")) {
    add("Bookcase / open shelving unit", 60, "Open shelving is visible.");
  }

  // Kitchen / utility-storage cluster (family_general_storage_specialty):
  // Hoosier cabinet, freestanding kitchen cabinet, step-back cupboard, pie
  // safe, jelly cupboard, jam cupboard, dough box. These canonicals existed
  // with label routes but no detector (the route authors left "resolve at
  // scoreForms" notes). They share aliases ("kitchen cupboard", "country
  // cupboard"), so checks run most-diagnostic-first; the broad freestanding
  // kitchen cabinet is the fallback. Gated !deskFormDominant so a fall-front/
  // cylinder desk isn't pulled in. Each emitted label has a
  // FORM_LABEL_TO_CANONICAL route.
  const pieSafe = includesAny(text, [
    "pie safe", "pie cupboard", "pie chest", "tin safe", "punched-tin safe",
    "punched tin safe", "pierced tin", "punched tin", "meat safe",
  ]);
  const hoosierCabinet = includesAny(text, [
    "hoosier", "kitchen workstation", "sellers cabinet", "napanee", "mcdougall",
    "coppes", "boone cabinet", "flour bin", "flour sifter",
  ]);
  const doughBox = includesAny(text, [
    "dough box", "dough trough", "bread trough", "kneading trough", "kneading box", "dough bin",
  ]);
  const stepBackCupboard = includesAny(text, [
    "step-back cupboard", "stepback cupboard", "step back cupboard",
    "step-back hutch", "stepback hutch", "two-piece cupboard", "two piece cupboard",
  ]);
  const jellyCupboard = includesAny(text, ["jelly cupboard"]);
  const jamCupboard = includesAny(text, ["jam cupboard", "preserve cupboard", "jar cupboard"]);
  const kitchenStorageCabinet = includesAny(text, [
    "kitchen cabinet", "kitchen cupboard", "pantry cabinet", "utility cabinet",
    "dry goods cabinet", "dry-goods cabinet", "baker's cabinet", "bakers cabinet",
    "farmhouse cabinet", "painted kitchen cupboard", "kitchen storage cabinet",
  ]);
  // Definitive kitchen-storage cues (hoosier, flour bin/sifter, pierced/punched
  // tin, dough trough, step-back geometry, jelly/jam) win even over the desk
  // cover-mechanism cluster: a Hoosier legitimately has a tambour/roll front but
  // is NOT a desk. Hence these bypass the !deskFormDominant gate and score above
  // the cover-cluster forms (roll-top 110 / tambour 100). The broad
  // "kitchen cabinet" fallback is generic, so it stays gated on !deskFormDominant.
  const strongKitchenCue = pieSafe || hoosierCabinet || doughBox || stepBackCupboard || jellyCupboard || jamCupboard;
  if (strongKitchenCue) {
    if (pieSafe) {
      add("Pie safe", 112, "Ventilated food-storage safe with pierced/punched tin (or screen) panels.");
    } else if (hoosierCabinet) {
      add("Hoosier cabinet", 112, "Integrated freestanding kitchen workstation (flour bin/sifter, pull-out work surface, maker-line cabinetry).");
    } else if (doughBox) {
      add("Dough box", 112, "Trough/kneading box for mixing, proofing, or storing bread dough.");
    } else if (stepBackCupboard) {
      add("Step-back cupboard", 112, "Two-piece cupboard with a shallower upper section set back from a deeper base.");
    } else if (jellyCupboard) {
      add("Jelly cupboard", 112, "Tall narrow country preserve-storage cupboard.");
    } else if (jamCupboard) {
      add("Jam cupboard", 110, "Country pantry/preserve-storage cupboard (jam, jars, crocks, dry goods).");
    }
  } else if (kitchenStorageCabinet && !deskFormDominant) {
    add("Kitchen cabinet", 96, "Freestanding kitchen/pantry storage cabinet without the full Hoosier workstation system.");
  }

  // Bedroom clothing-storage cluster. NOTE: this is a SPATIAL/functional family
  // — each form keeps its own identity (dresser is a form, not the cluster).
  // Detectors are ordered most-diagnostic-first and gated so lines stay crisp:
  //   - dresser is CUE-GATED vs chest of drawers (per appraiser direction):
  //     emits only on dresser cues; plain stacked drawers stay "Chest of
  //     drawers / dresser" (70 -> form_chest_of_drawers). Welsh/kitchen/pewter
  //     dresser (dining) excluded.
  //   - chifforobe (wardrobe+drawers) checked before wardrobe; armoire before
  //     wardrobe ("French wardrobe"); washstand before nightstand (commode);
  //     highboy before low chest; nightstand before low chest ("bedside chest").
  //   - armoire/wardrobe/dressing-table also require NO "desk" context so the
  //     armoire-desk / vanity-desk conversions stay on their desk forms.
  const deskContext = includesAny(text, ["desk"]);
  const trunkForm = includesAny(text, [
    "steamer trunk", "travel trunk", "storage trunk", "footlocker", "wardrobe trunk",
    "shipping trunk", "immigrant trunk", "luggage trunk", "dome-top trunk",
    "camelback trunk", "flat-top trunk", "steamer chest", "trunk",
  ]);
  const chifforobeForm = includesAny(text, [
    "chifforobe", "chifferobe", "chiffrobe", "wardrobe chest", "wardrobe dresser",
    "gentleman's wardrobe", "gentlemans wardrobe", "gentleman's chest", "gentlemans chest",
    "robe chest", "combination wardrobe",
  ]);
  const washstandForm = includesAny(text, [
    "washstand", "wash stand", "basin stand", "water stand", "chamber stand",
    "shaving stand", "wash basin stand", "pitcher and basin", "commode washstand",
  ]);
  const highboyForm = includesAny(text, [
    "highboy", "high chest", "high chest of drawers", "tallboy",
    "chest on frame", "chest-on-frame", "chest on chest", "chest-on-chest", "bonnet-top highboy",
  ]);
  const dressingTableForm = includesAny(text, [
    "dressing table", "vanity table", "makeup table", "make-up table",
    "dressing vanity", "kneehole vanity", "toilet table", "dressing bureau", "vanity",
  ]);
  const armoireForm = includesAny(text, [
    "armoire", "french wardrobe", "french cabinet", "tv armoire", "entertainment armoire",
    "linen press", "clothes press",
  ]);
  const wardrobeForm = includesAny(text, [
    "wardrobe", "clothes closet", "clothes cabinet", "wardrobe cabinet",
    "mirrored wardrobe", "knockdown wardrobe", "knock-down wardrobe",
  ]);
  const nightstandForm = includesAny(text, [
    "nightstand", "night stand", "bedside table", "bedside cabinet", "bedside chest",
    "night table", "night cabinet", "bed table",
  ]);
  const dresserExclude = includesAny(text, [
    "welsh dresser", "welsh-dresser", "kitchen dresser", "pewter dresser",
    "country dresser", "pine dresser", "farmhouse dresser", "plate rack dresser",
    "hairdresser", "hair dresser", // "hairdresser" contains "dresser" as a substring
  ]);
  const dresserForm = !dresserExclude && includesAny(text, [
    "dresser", "bedroom bureau", "bureau dresser", "double dresser", "triple dresser",
    "low dresser", "drawer dresser", "mirrored dresser", "dresser with mirror",
  ]);
  const lowChestForm = includesAny(text, [
    "low chest", "small chest", "short chest", "low drawer chest",
    "bachelor's chest", "bachelors chest", "compact chest",
  ]);
  if (!deskFormDominant) {
    if (trunkForm) {
      add("Trunk", 98, "Travel/steamer trunk or footlocker — a portable lidded transport chest.");
    } else if (chifforobeForm) {
      add("Chifforobe", 100, "Combination wardrobe-and-drawers case (clothes-hanging side plus a bank of drawers).");
    } else if (washstandForm) {
      add("Washstand", 100, "Bedroom basin/pitcher stand for washing (often with backsplash, towel bar, or commode storage).");
    } else if (highboyForm) {
      add("Highboy", 100, "Tall two-part chest of drawers raised on legs or a frame (high chest).");
    } else if (dressingTableForm && !deskContext) {
      add("Dressing table", 98, "Kneehole grooming table with a mirror, for seated dressing (vanity).");
    } else if (armoireForm && !deskContext) {
      add("Armoire", 98, "Large freestanding clothes/storage cabinet (French wardrobe / press).");
    } else if (wardrobeForm && !deskContext) {
      add("Wardrobe", 98, "Freestanding clothes-hanging cabinet (clothes closet).");
    } else if (nightstandForm && !commodeEvidence) {
      add("Nightstand", 96, "Bedside table/cabinet sized for use beside a bed.");
    } else if (dresserForm) {
      add("Dresser", 96, "Width-dominant bedroom drawer case for grooming/dressing (often with mirror), distinct from a taller single-column chest of drawers.");
    } else if (lowChestForm) {
      add("Low chest", 95, "Low/short chest of drawers (bachelor's or bedside scale).");
    }
  }

  // Dining / display service-storage cluster. Twelve forms had canonical
  // content and (mostly) routes but no scoreForms detector, so china cabinets,
  // sideboards, buffets, hutches, etc. fell to generic "Cabinet" (35) ->
  // form_china_cabinet. Ordered most-diagnostic-first with collision gates:
  //   - corner geometry outranks hutch/china/curio structure;
  //   - "open hutch"/"kitchen dresser"/"country dresser" -> Welsh dresser (open
  //     plate-rack), checked before hutch;
  //   - "china hutch"/"buffet hutch" -> Hutch (not china/buffet), so hutch is
  //     checked before china cabinet and buffet;
  //   - "standing/hall sideboard" -> Huntboard, checked before sideboard;
  //   - credenza-storage vs credenza DESK and hutch vs hutch DESK reuse the
  //     desk-section consts (credenzaDesk / hutchDesk) so desks stay desks;
  //   - all gated !deskFormDominant. Sideboard is the most generic service case
  //     and is checked last.
  const cellaretteForm = includesAny(text, [
    "cellarette", "cellaret", "wine cooler", "bottle case", "decanter case",
    "tantalus", "liquor cabinet", "chest-form cellarette",
  ]);
  const breakfrontForm = includesAny(text, ["breakfront", "break-front", "broken-front", "broken front"]);
  const cornerCabinetForm = includesAny(text, [
    "corner cabinet", "corner cupboard", "corner china cabinet", "corner hutch",
    "corner display cabinet", "corner curio", "built-in corner cupboard",
    "hanging corner cupboard", "pie-shaped cabinet", "pie-shaped corner",
  ]);
  const welshDresserForm = includesAny(text, [
    "welsh dresser", "welsh-dresser", "kitchen dresser", "country dresser",
    "pewter cupboard", "plate rack dresser", "pine dresser", "open hutch", "farmhouse dresser",
  ]);
  const huntboardForm = includesAny(text, [
    "huntboard", "hunt board", "hunting board", "southern huntboard",
    "standing sideboard", "hall sideboard",
  ]);
  const credenzaStorageForm = !credenzaDesk && includesAny(text, [
    "credenza", "sideboard credenza", "media credenza", "mid-century credenza",
    "mid century credenza", "mcm credenza", "storage credenza", "floating credenza",
  ]);
  const hutchForm = !hutchDesk && !includesAny(text, ["step-back", "stepback"]) && includesAny(text, [
    "hutch", "china hutch", "dining hutch", "kitchen hutch", "buffet hutch",
    "buffet and hutch", "country hutch", "display hutch", "cupboard hutch",
  ]);
  const chinaCabinetForm = includesAny(text, ["china cabinet", "china closet", "china display"]);
  const curioForm = includesAny(text, ["curio cabinet", "curio"]) && !includesAny(text, ["curiosities", "cabinet of curiosities"]);
  const buffetForm = includesAny(text, ["buffet", "dining cabinet"]);
  const serverForm = includesAny(text, ["serving table", "serving board", "serving cabinet", "dining server"]) ||
    (/\bserver\b/.test(text) && !includesAny(text, ["server rack", "rack server", "network server", "file server", "web server", "blade server", "server equipment", "server cabinet"]));
  const sideboardForm = text.includes("sideboard");
  if (!deskFormDominant) {
    if (cellaretteForm) {
      add("Cellarette", 100, "Small lidded or cased liquor- and bottle-storage form (wine cooler / tantalus).");
    } else if (breakfrontForm) {
      add("Breakfront", 98, "Large cabinet/bookcase whose center section projects forward of the flanking sections.");
    } else if (cornerCabinetForm) {
      add("Corner cabinet", 98, "Triangular cabinet/cupboard built to stand in a room corner (corner geometry outranks hutch/china structure).");
    } else if (welshDresserForm) {
      add("Welsh dresser", 98, "Country dresser with an OPEN plate-rack upper over a base of drawers and cupboards.");
    } else if (huntboardForm) {
      add("Huntboard", 96, "Tall stand-up-height Southern sideboard-family service case.");
    } else if (credenzaStorageForm) {
      add("Credenza", 95, "Long low storage case for dining/living/office service (no work surface — distinct from a credenza desk).");
    } else if (hutchForm) {
      add("Hutch", 95, "Two-part dining case: an enclosed or glazed display upper over a service-storage base.");
    } else if (chinaCabinetForm) {
      add("China cabinet", 96, "Glazed dining-room cabinet for displaying and storing china and serveware.");
    } else if (curioForm) {
      add("Curio cabinet", 96, "Display-dominant glazed cabinet for collectibles and decorative objects.");
    } else if (buffetForm) {
      add("Buffet", 94, "Long low dining-room serving/storage cabinet (sideboard family; retail 'buffet').");
    } else if (serverForm) {
      add("Server", 94, "Smaller auxiliary dining serving cabinet/table for staging food and serveware.");
    } else if (sideboardForm) {
      add("Sideboard", 94, "Long dining-room service case with drawers and cupboards for linens, flatware, and serveware.");
    }
  }

  // Entry / support hall-piece cluster. Twenty forms with no scoreForms
  // detector. Ordered most-diagnostic-first with collision gates:
  //   - the four bare-word forms (pedestal/screen/mirror/box) use ONLY
  //     multi-word cues so they never fire on incidental words (e.g. bare
  //     "mirror" inside a dresser/wardrobe description, or "box" inside dough
  //     box / writing box);
  //   - display pedestal stays narrow (sculpture/column) so plant stands and
  //     pedestal tables keep their own emitters;
  //   - hall tree absorbs the combo cues ("hat tree"/"coat tree"/"hall stand")
  //     and is checked before hat rack / coat rack / umbrella stand;
  //   - "charging valet" -> valet stand (checked before charging station).
  //   Gated !deskFormDominant.
  const funeralBierForm = includesAny(text, ["funeral bier", "coffin stand", "casket bier", "catafalque", "funeral stand", "bier"]);
  const hammockStandForm = includesAny(text, ["hammock stand", "hammock frame"]);
  const aquariumStandForm = includesAny(text, ["aquarium stand", "fish tank stand", "terrarium stand", "vivarium stand", "tank stand"]);
  const smokingStandForm = includesAny(text, ["smoking stand", "ash stand", "tobacco stand", "pipe stand", "smoker's stand", "smokers stand", "cigarette stand", "humidor stand"]);
  const packageStationForm = includesAny(text, ["package station", "parcel station", "package locker", "delivery locker", "parcel locker", "smart package", "package pickup"]);
  const valetStandForm = includesAny(text, ["valet stand", "suit valet", "clothes valet", "gentleman's valet", "gentlemans valet", "dressing valet", "charging valet", "suit stand", "valet rack"]);
  const chargingStationForm = includesAny(text, ["charging station", "charging tower", "device charging", "device tower", "usb charging", "multi-device charging", "charging dock"]);
  const telephoneStandForm = includesAny(text, ["telephone stand", "telephone table", "telephone cabinet", "phone stand", "phone cabinet", "gossip bench", "telephone bench", "telephone seat"]);
  const hallTreeForm = includesAny(text, ["hall tree", "hall stand", "hat tree", "coat tree", "cloak stand", "vestibule tree", "entry tree", "tree hall stand"]);
  const umbrellaStandForm = includesAny(text, ["umbrella stand", "umbrella holder", "cane stand", "stick stand", "walking stick stand"]);
  const hatRackForm = includesAny(text, ["hat rack", "hat stand", "hat hooks"]);
  const coatRackForm = includesAny(text, ["coat rack", "coat hooks", "hall hooks", "entry hooks", "garment rack"]);
  const petUtilityForm = includesAny(text, ["pet furniture", "pet feeding station", "pet crate", "dog crate cabinet", "cat feeding station", "dog feeding station", "crate furniture", "concealed crate cabinet"]);
  const toyStorageForm = includesAny(text, ["toy storage", "toy box", "toy chest", "doll cabinet", "nursery organizer", "nursery storage", "play storage", "children's storage", "childrens storage"]);
  const entryOrganizerForm = includesAny(text, ["entry organizer", "entryway organizer", "foyer organizer", "mudroom organizer", "shoe organizer", "shoe rack", "mail organizer", "key organizer", "entryway cubby"]);
  const benchUtilityForm = includesAny(text, ["mudroom bench", "locker bench", "team bench", "dugout bench", "athletic bench", "utility bench", "storage bench", "entry bench"]);
  const pedestalDisplayForm = includesAny(text, ["display pedestal", "sculpture pedestal", "sculpture stand", "statue stand", "bust stand", "display column", "display plinth", "marble pedestal", "pedestal plinth"]);
  const mirrorForm = includesAny(text, ["cheval mirror", "floor mirror", "pier mirror", "overmantel mirror", "over-mantel mirror", "looking glass", "wall mirror", "standing mirror", "full-length mirror", "hall mirror", "trumeau mirror", "dressing mirror"]);
  const screenForm = includesAny(text, ["folding screen", "room divider", "room screen", "dressing screen", "shoji screen", "privacy screen", "fire screen", "fireplace screen", "four-panel screen", "three-panel screen", "coromandel screen"]);
  const boxForm = includesAny(text, ["keepsake box", "trinket box", "decorative box", "document box", "deed box", "bible box", "ballot box", "strong box", "storage box", "jewelry box", "desk box", "letter box"]);
  if (!deskFormDominant) {
    if (funeralBierForm) {
      add("Funeral bier", 100, "Stand or low platform for supporting a coffin/casket (bier / catafalque).");
    } else if (hammockStandForm) {
      add("Hammock stand", 100, "Freestanding frame that supports a hammock without trees or posts.");
    } else if (aquariumStandForm) {
      add("Aquarium stand", 100, "Reinforced stand built to carry the weight of an aquarium or terrarium tank.");
    } else if (smokingStandForm) {
      add("Smoking stand", 100, "Small stand for tobacco, pipes, ashes, or a humidor.");
    } else if (packageStationForm) {
      add("Package station", 98, "Entry parcel/delivery locker or drop station for received packages.");
    } else if (valetStandForm) {
      add("Valet stand", 98, "Standing rack for laying out a suit, with bars/hooks for jacket, trousers, and accessories.");
    } else if (chargingStationForm) {
      add("Charging station", 96, "Stand or dock organizing and charging multiple devices.");
    } else if (telephoneStandForm) {
      add("Telephone stand", 96, "Small stand, table, or bench-and-shelf form for a telephone (gossip bench).");
    } else if (hallTreeForm) {
      add("Hall tree", 98, "Tall combination entry stand: hooks for coats/hats plus mirror, umbrella drip pan, and often a seat.");
    } else if (umbrellaStandForm) {
      add("Umbrella stand", 96, "Floor receptacle for umbrellas, canes, and walking sticks.");
    } else if (hatRackForm) {
      add("Hat rack", 95, "Rack or stand of pegs/hooks specifically for hats.");
    } else if (coatRackForm) {
      add("Coat rack", 95, "Rack or stand of hooks/pegs for hanging coats and garments in an entry.");
    } else if (petUtilityForm) {
      add("Pet furniture", 96, "Furniture built around a pet function (feeding station, concealed crate cabinet).");
    } else if (toyStorageForm) {
      add("Toy storage", 95, "Child's toy box, chest, or nursery storage organizer.");
    } else if (entryOrganizerForm) {
      add("Entry organizer", 94, "Entry/mudroom organizer for shoes, mail, keys, and small items (cubbies/hooks).");
    } else if (benchUtilityForm) {
      add("Utility bench", 94, "Utility/locker/mudroom or team bench for seating plus gear staging.");
    } else if (pedestalDisplayForm) {
      add("Pedestal", 94, "Vertical display pedestal/column for elevating a sculpture, bust, or decorative object.");
    } else if (mirrorForm) {
      add("Mirror", 95, "Standalone mirror form (cheval, pier, overmantel, wall, or looking glass).");
    } else if (screenForm) {
      add("Screen", 95, "Folding screen / room divider (or fire screen) used to partition or shield space.");
    } else if (boxForm) {
      add("Box", 94, "Small lidded box form (keepsake, document, deed, or storage box).");
    }
  }

  // Lighting-fixture cluster. Fourteen forms (beyond the already-wired floor/
  // table/oil/kerosene/banquet lamps) had canonical content and (mostly) routes
  // but no scoreForms detector. All text-cue based; ordered specific-first so
  // the two abstract catch-all parents (wall lighting form / hanging lighting
  // form) only fire when no specific wall- or hanging-fixture form matched:
  //   - candelabrum (branched/multi-arm) checked before candlestick (single);
  //   - gas bracket ("gas sconce") checked before sconce;
  //   - billiard / lantern / chandelier / pendant checked before the generic
  //     hanging catch-all. Scores (92-96) beat the generic lamp emitters
  //     (Floor/Table/Oil 86-90) for the same piece (e.g. torchiere floor lamp).
  const billiardLightForm = includesAny(text, ["billiard light", "pool table light", "snooker light", "pool hall light", "saloon light", "linear billiard"]);
  const torchereForm = includesAny(text, ["torchere", "torchère", "torchiere", "torchière", "floor torch", "floor uplighter"]);
  const candelabrumForm = includesAny(text, ["candelabrum", "candelabra", "candelabras", "girandole", "branched candle", "multi-candle holder", "multi-arm candlestick", "branched candlestick", "seven-branch"]);
  const candlestickForm = includesAny(text, ["candlestick", "candle stick", "candleholder", "candle holder", "chamberstick", "pricket", "taper holder", "hog-scraper candlestick", "push-up candlestick"]);
  const argandLampForm = includesAny(text, ["argand lamp", "astral lamp", "sinumbra lamp", "solar lamp", "circular wick lamp", "draft lamp"]);
  const bettyLampForm = includesAny(text, ["betty lamp", "grease lamp", "fat lamp", "pan lamp", "rat-tail lamp", "crusie"]);
  const studentLampForm = includesAny(text, ["student lamp", "study lamp", "banker's lamp", "bankers lamp", "banker lamp", "library lamp", "rochester lamp", "double student lamp", "kerosene student lamp"]);
  const gasBracketForm = includesAny(text, ["gas bracket", "gas wall bracket", "gas sconce", "gaslight bracket", "gas arm", "gas wall light", "gas-mantle bracket", "wall gas fixture"]);
  const sconceForm = includesAny(text, ["sconce", "wall sconce", "wall light", "wall fixture", "wall bracket light", "candle sconce", "electric sconce", "mirror-back sconce", "wall mounted lamp", "wall-mounted lamp"]);
  const lanternHangingForm = includesAny(text, ["hanging lantern", "ceiling lantern", "hall lantern", "entry lantern", "porch lantern", "pierced-tin hanging lantern"]);
  const chandelierForm = includesAny(text, ["chandelier", "gasolier", "gaselier", "electrolier", "multi-light fixture", "multi-arm chandelier", "candle chandelier", "crystal chandelier"]);
  const pendantLightForm = includesAny(text, ["pendant light", "pendant lamp", "hanging pendant", "ceiling pendant", "drop light", "schoolhouse light", "schoolhouse pendant", "industrial pendant", "pulley pendant", "rise and fall light", "mini pendant"]);
  const wallLightingForm = includesAny(text, ["wall lighting fixture", "wall luminaire", "picture light", "wall washer", "wall lighting form"]);
  const hangingLightingForm = includesAny(text, ["hanging light fixture", "ceiling light fixture", "ceiling fixture", "flush mount", "semi-flush", "flush-mount light", "hanging lighting form"]);
  if (billiardLightForm) {
    add("Billiard light", 96, "Long multi-shade fixture hung over a billiard/pool table.");
  } else if (torchereForm) {
    add("Torchère", 94, "Tall floor-standing candle/torch stand or upward-throwing floor uplight.");
  } else if (candelabrumForm) {
    add("Candelabrum", 96, "Branched multi-arm candle holder (girandole).");
  } else if (candlestickForm) {
    add("Candlestick", 95, "Single-light candle holder (chamberstick, pricket, taper holder).");
  } else if (argandLampForm) {
    add("Argand lamp", 95, "Early circular-wick oil lamp with side font (astral / sinumbra / solar variants).");
  } else if (bettyLampForm) {
    add("Betty lamp", 96, "Early iron grease/fat lamp with a wick channel (crusie family).");
  } else if (studentLampForm) {
    add("Student lamp", 94, "Adjustable shaded reading lamp with a side font (banker's / library / Rochester type).");
  } else if (gasBracketForm) {
    add("Gas bracket", 96, "Wall-mounted gas (or gas-electric) lighting arm; gas evidence dominates over plain sconce reading.");
  } else if (sconceForm) {
    add("Sconce", 95, "Wall-mounted light bracket (candle, electric, or kerosene).");
  } else if (lanternHangingForm) {
    add("Hanging lantern", 95, "Enclosed hanging hall/entry/porch lantern fixture.");
  } else if (chandelierForm) {
    add("Chandelier", 96, "Multi-arm radial ceiling fixture (candle, gas/gasolier, or electric/electrolier).");
  } else if (pendantLightForm) {
    add("Pendant light", 94, "Single hanging ceiling fixture on a rod, chain, or cord (schoolhouse, industrial, pulley).");
  } else if (wallLightingForm) {
    add("Wall lighting form", 88, "Wall-mounted lighting fixture not specifically a sconce or gas bracket (picture light, wall washer).");
  } else if (hangingLightingForm) {
    add("Hanging lighting form", 88, "Ceiling/hanging lighting fixture not specifically a chandelier, pendant, lantern, or billiard light (flush/semi-flush mount).");
  }

  // Clocks + musical/mechanical + misc cluster. Nineteen orphaned forms with no
  // scoreForms detector. All text-cue based. Collision notes: clock types are
  // mutually distinct ("schoolhouse clock" -> wall clock, also excluded from the
  // school-desk cue above); media forms avoid bare "wall unit"/"workstation" so
  // they don't steal Wall unit desk / Modular workstation desk; pump organ and
  // sewing-machine cabinet defer to their desk variants when "desk" is present
  // (reusing the bedroom-block deskContext). cylinder_desk is intentionally NOT
  // here — it is already reachable via the cylinder/roll-top emit.
  const tallCaseClockForm = includesAny(text, ["tall case clock", "tall-case clock", "longcase clock", "grandfather clock", "grandmother clock", "granddaughter clock", "floor clock", "standing clock"]);
  const wallClockForm = includesAny(text, ["wall clock", "hanging clock", "banjo clock", "gallery clock", "regulator clock", "schoolhouse clock", "calendar clock"]);
  const shelfClockForm = includesAny(text, ["shelf clock", "mantel clock", "mantle clock", "bracket clock", "table clock", "steeple clock", "ogee clock", "kitchen clock"]);
  const jukeboxForm = includesAny(text, ["jukebox", "juke box", "music machine", "coin-operated music"]);
  const pinballForm = includesAny(text, ["pinball machine", "pinball", "pin game", "electromechanical pinball", "em pinball", "solid state pinball"]);
  const arcadeForm = includesAny(text, ["arcade cabinet", "arcade machine", "arcade game", "video game cabinet", "upright arcade"]);
  const vendingForm = includesAny(text, ["vending machine", "snack machine", "soda machine", "beverage machine", "coke machine", "cigarette machine", "vending"]);
  const spinningWheelForm = includesAny(text, ["spinning wheel", "saxony wheel", "castle wheel", "great wheel", "walking wheel", "wool wheel", "flax wheel"]);
  // Word-boundary loom detection. Substring matching previously fired on "loom"
  // inside "machine-loomed" (jacquard fabric descriptions), routing upholstered
  // seating to form_loom at score 98. \bloom(s)?\b matches the genuine loom words
  // (incl. the "loom" in "weaving/floor/table/treadle/hand loom") but not
  // "loomed"/"machine-loomed"/"heirloom".
  const loomForm = /\b(?:looms?|handlooms?)\b/.test(text);
  const pumpOrganForm = !deskContext && includesAny(text, ["pump organ", "reed organ", "parlor organ", "cabinet organ", "harmonium", "pump organ cabinet"]);
  const iceboxForm = includesAny(text, ["icebox", "ice box", "oak icebox", "zinc-lined icebox", "ice chest"]);
  const sewingMachineCabinetForm = !deskContext && !text.includes("converted") && includesAny(text, ["sewing machine cabinet", "treadle sewing machine", "sewing machine stand", "drop-head sewing machine", "drophead sewing machine", "sewing machine base"]);
  const mediaConsoleForm = includesAny(text, ["media console", "entertainment console", "radio console", "television console", "tv console", "stereo console", "record player console", "hi-fi console", "hifi console", "phonograph cabinet"]);
  const mediaWallForm = includesAny(text, ["media wall", "entertainment wall", "entertainment center", "home theater unit", "media center", "tv wall unit"]);
  const mediaStorageForm = includesAny(text, ["media storage", "media tower", "cd tower", "cd storage", "dvd tower", "dvd storage", "disc tower", "game tower", "video game storage"]);
  const equipmentRackForm = includesAny(text, ["equipment rack", "audio rack", "stereo rack", "server rack", "network rack", "speaker cabinet", "loudspeaker cabinet", "speaker enclosure"]);
  const interactiveConsoleForm = includesAny(text, ["interactive console", "gaming console", "gaming tower", "gaming pc", "vr station", "vr setup", "control console", "digital interface console"]);
  const musicalInstrumentForm = includesAny(text, ["music cabinet", "sheet music cabinet", "music stand cabinet", "instrument storage cabinet"]);
  const basketForm = includesAny(text, ["wicker basket", "sewing basket", "picnic basket", "laundry basket", "market basket", "storage basket", "splint basket", "nantucket basket", "gathering basket", "woven basket", "basketry"]);
  if (tallCaseClockForm) {
    add("Tall case clock", 98, "Floor-standing weight-driven clock in a tall case (grandfather/longcase).");
  } else if (wallClockForm) {
    add("Wall clock", 96, "Wall-hung clock (banjo, regulator, schoolhouse, gallery, or calendar).");
  } else if (shelfClockForm) {
    add("Shelf clock", 96, "Small mantel/shelf clock (steeple, ogee, bracket, or kitchen clock).");
  } else if (jukeboxForm) {
    add("Jukebox", 100, "Coin-operated music-playing machine cabinet.");
  } else if (pinballForm) {
    add("Pinball machine", 100, "Coin-operated pinball game cabinet (electromechanical or solid-state).");
  } else if (arcadeForm) {
    add("Arcade cabinet", 100, "Upright/cocktail video-game arcade cabinet.");
  } else if (vendingForm) {
    add("Vending machine", 98, "Coin-operated vending/dispensing machine (snack, soda, cigarette).");
  } else if (spinningWheelForm) {
    add("Spinning wheel", 100, "Hand-spinning wheel (Saxony, castle, or great/walking wheel).");
  } else if (loomForm) {
    add("Loom", 98, "Weaving loom (floor, table, or treadle).");
  } else if (pumpOrganForm) {
    add("Pump organ cabinet", 98, "Reed/parlor pump organ in its furniture cabinet (harmonium).");
  } else if (iceboxForm) {
    add("Icebox", 98, "Pre-electric ice-cooled food-storage cabinet (zinc/oak icebox).");
  } else if (sewingMachineCabinetForm) {
    add("Sewing machine cabinet", 94, "Treadle sewing machine in its cabinet/stand (not a desk conversion).");
  } else if (mediaConsoleForm) {
    add("Media console", 95, "Low AV/media console (radio, phonograph, stereo, or TV console cabinet).");
  } else if (mediaWallForm) {
    add("Media wall", 94, "Large entertainment center / home-theater wall unit.");
  } else if (mediaStorageForm) {
    add("Media storage unit", 94, "Tower or rack for CDs, DVDs, discs, or game media.");
  } else if (equipmentRackForm) {
    add("Equipment rack", 94, "Rack/enclosure for audio, network, or server equipment (incl. speaker cabinet).");
  } else if (interactiveConsoleForm) {
    add("Interactive console", 92, "Gaming/VR/control console station.");
  } else if (musicalInstrumentForm) {
    add("Musical instrument furniture", 90, "Furniture built around a musical instrument (sheet-music cabinet, instrument storage).");
  } else if (basketForm) {
    add("Basket", 95, "Woven basket form (wicker, splint, sewing, picnic, or market basket).");
  }

  // Industrial / professional / institutional cluster. Concrete forms get
  // distinctive cues; the abstract catch-alls (built-in/shelving/rack/env/
  // workstation/kitchen-utility/beverage/hospitality/educational/industrial-
  // station) get minimal guarded cues and lower scores so concrete forms win.
  // Collision notes: rack/shelving use ONLY qualified terms so they don't fire
  // on bare "rack"/"shelving" (coat/hat/equipment rack and bookcase open-shelving
  // are handled earlier); standing lecterns + teller cages were released from the
  // institutional-desk cues above; package/delivery lockers stay form_package_station.
  const drySinkForm = includesAny(text, ["dry sink"]);
  const barberStationForm = includesAny(text, ["barber station", "barber chair", "barber counter", "barbershop", "barber's workstation", "barber workstation"]);
  const salonStationForm = includesAny(text, ["salon station", "styling station", "hairdresser station", "beauty salon station", "salon chair", "beauty station"]);
  const timeClockForm = includesAny(text, ["time clock", "punch clock", "attendance station", "time stamp clock", "factory time clock", "bundy clock"]);
  const cabinetCuriositiesForm = includesAny(text, ["cabinet of curiosities", "wunderkammer", "curiosity cabinet", "specimen cabinet"]);
  const easelForm = includesAny(text, ["easel", "artist's easel", "artists easel", "studio easel", "display easel", "tripod easel"]);
  const musicStandForm = includesAny(text, ["music stand", "sheet music stand", "orchestra stand", "conductor's stand", "folding music stand"]);
  const pulpitForm = includesAny(text, ["pulpit", "preaching pulpit", "wineglass pulpit", "wine-glass pulpit"]);
  const lecternForm = includesAny(text, ["standing lectern", "floor lectern", "speaker's lectern", "speakers lectern", "speaking lectern", "church lectern", "presentation lectern", "acrylic lectern", "conductor's lectern", "fixed lectern"]);
  const podiumForm = includesAny(text, ["podium", "speaker's podium", "speakers podium", "presentation podium", "conductor's podium", "winner's podium", "award podium"]);
  const churchFurnishingForm = includesAny(text, ["altar", "baptismal font", "communion table", "prie-dieu", "prie dieu", "kneeler", "credence table", "church furnishing", "tabernacle stand", "sanctuary furniture"]);
  const showcaseForm = includesAny(text, ["showcase", "display case", "glass display case", "jewelry showcase", "jewelry case", "store display case", "museum display case", "glass showcase"]);
  const kioskForm = includesAny(text, ["kiosk", "information kiosk", "mall kiosk", "newsstand", "ticket kiosk", "retail kiosk"]);
  const bankFixtureForm = includesAny(text, ["bank fixture", "teller cage", "teller wicket", "safe deposit box unit", "bank vault gate", "banking wicket"]);
  const utilityCartForm = includesAny(text, ["utility cart", "serving cart", "tea cart", "tea trolley", "bar cart", "drinks trolley", "kitchen cart", "rolling cart", "service trolley", "hostess cart", "microwave cart"]);
  const lockerForm = includesAny(text, ["locker", "gym locker", "school locker", "employee locker", "storage locker", "metal locker", "locker unit"]);
  const scientificStandForm = includesAny(text, ["scientific stand", "laboratory stand", "microscope stand", "telescope stand", "lab stand", "specimen stand", "retort stand"]);
  const safetyFixtureForm = includesAny(text, ["safety fixture", "fire extinguisher cabinet", "first aid cabinet", "eyewash station", "fire hose cabinet", "aed cabinet", "safety cabinet"]);
  const retailFixtureForm = includesAny(text, ["retail fixture", "store fixture", "gondola shelving", "gondola unit", "slatwall", "slat wall", "merchandising fixture", "display gondola", "point-of-purchase display", "pegboard display"]);
  const shelvingSystemForm = includesAny(text, ["shelving system", "industrial shelving", "metal shelving", "wire shelving", "storage shelving", "boltless shelving", "rivet shelving", "warehouse shelving", "modular shelving"]);
  const rackForm = includesAny(text, ["display rack", "storage rack", "utility rack", "wire rack", "metal rack", "warehouse rack", "pallet rack", "dunnage rack", "drying rack", "luggage rack", "wine rack"]);
  const builtInStorageForm = includesAny(text, ["built-in storage", "built-in cabinetry", "fitted storage", "fitted cabinetry", "architectural built-in"]);
  const envUtilityForm = includesAny(text, ["radiator cover", "radiator cabinet", "humidifier cabinet", "hvac cabinet", "heater cover", "register cover", "environmental utility"]);
  const workstationAccessoryForm = includesAny(text, ["workstation accessory", "monitor stand", "monitor riser", "keyboard tray", "cpu holder", "monitor arm"]);
  const kitchenUtilityUnitForm = includesAny(text, ["kitchen utility unit", "kitchen work unit", "utility prep unit"]);
  const beverageServiceForm = includesAny(text, ["beverage station", "coffee station", "beverage service", "drink station", "beverage counter"]);
  const hospitalityFixtureForm = includesAny(text, ["hospitality fixture", "hotel fixture", "hospitality station", "hotel luggage stand"]);
  const educationalFixtureForm = includesAny(text, ["educational fixture", "classroom fixture", "interactive whiteboard stand"]);
  const industrialStationForm = includesAny(text, ["industrial station", "assembly station", "packing station", "industrial work station"]);
  if (drySinkForm) {
    add("Dry sink", 96, "Country cabinet with a recessed well top for a water basin (pre-plumbing washing).");
  } else if (barberStationForm) {
    add("Barber station", 96, "Barber's service station/counter (mirror, drawers, tool storage; barber chair context).");
  } else if (salonStationForm) {
    add("Salon station", 96, "Hairdresser/beauty styling station (mirror, drawers, tool storage).");
  } else if (timeClockForm) {
    add("Time clock station", 96, "Workplace time/attendance clock station (punch/bundy clock and card rack).");
  } else if (cabinetCuriositiesForm) {
    add("Cabinet of curiosities", 96, "Specimen/curiosity display cabinet (wunderkammer).");
  } else if (easelForm) {
    add("Easel", 96, "Standing frame for supporting a canvas, artwork, or display board.");
  } else if (musicStandForm) {
    add("Music stand", 95, "Adjustable stand holding sheet music for a player or conductor.");
  } else if (pulpitForm) {
    add("Pulpit", 96, "Elevated enclosed preaching stand in a church.");
  } else if (lecternForm) {
    add("Lectern", 95, "Standing speaking lectern with a sloped reading top (not a writing desk).");
  } else if (podiumForm) {
    add("Podium", 94, "Raised speaker's stand/platform for presentations or ceremonies.");
  } else if (churchFurnishingForm) {
    add("Church furnishing", 94, "Ecclesiastical furniture (altar, font, communion/credence table, kneeler/prie-dieu).");
  } else if (showcaseForm) {
    add("Showcase", 94, "Glazed retail/museum display case for presenting merchandise or objects.");
  } else if (kioskForm) {
    add("Kiosk", 95, "Freestanding small-footprint retail/information booth or stand.");
  } else if (bankFixtureForm) {
    add("Bank fixture", 92, "Banking-hall fixture (teller cage/wicket, safe-deposit unit) rather than a counter desk.");
  } else if (utilityCartForm) {
    add("Utility cart", 94, "Wheeled service/utility cart or trolley (tea cart, bar cart, kitchen cart).");
  } else if (lockerForm) {
    add("Locker", 94, "Compartmented metal/wood locker unit for personal storage (gym/school/employee).");
  } else if (scientificStandForm) {
    add("Scientific stand", 94, "Laboratory/optical instrument stand (microscope, telescope, retort, specimen).");
  } else if (safetyFixtureForm) {
    add("Safety fixture", 94, "Safety-equipment fixture (fire extinguisher / first-aid / eyewash / hose / AED cabinet).");
  } else if (retailFixtureForm) {
    add("Retail fixture", 92, "Store merchandising fixture (gondola, slatwall, pegboard, point-of-purchase display).");
  } else if (shelvingSystemForm) {
    add("Shelving system", 92, "Industrial/utility shelving system (boltless/rivet, wire, or metal shelving).");
  } else if (rackForm) {
    add("Rack", 92, "Open utility/storage rack (display, pallet, wire, drying, luggage, or wine rack).");
  } else if (builtInStorageForm) {
    add("Built-in storage", 90, "Architectural built-in cabinetry/storage fitted to the structure.");
  } else if (envUtilityForm) {
    add("Environmental utility form", 90, "Furniture concealing an environmental utility (radiator cover, humidifier/HVAC cabinet).");
  } else if (workstationAccessoryForm) {
    add("Workstation accessory", 90, "Desktop/workstation accessory (monitor stand/riser, keyboard tray, CPU holder).");
  } else if (kitchenUtilityUnitForm) {
    add("Kitchen utility unit", 90, "Kitchen/work utility prep unit (not a full kitchen cabinet or Hoosier).");
  } else if (beverageServiceForm) {
    add("Beverage service form", 88, "Beverage/coffee service station or counter.");
  } else if (hospitalityFixtureForm) {
    add("Hospitality fixture", 88, "Hotel/hospitality service fixture.");
  } else if (educationalFixtureForm) {
    add("Educational fixture", 88, "Classroom/educational fixture (not a school desk).");
  } else if (industrialStationForm) {
    add("Industrial station", 88, "Factory/industrial work or assembly/packing station.");
  }
 // Industrial / Toledo-style task chair. Gated on !woodPrimary (T2a): a wooden
 // banker's/office chair with a cast-iron tilt mechanism (swivel_mechanism) is not
 // a metal Toledo task chair.
if (
  !woodPrimary &&
  hasAny(
    "toledo_industrial_style",
    "mid_century_industrial_office",
    "height_adjustment_mechanism",
    "swivel_mechanism",
    "stamped_metal_seat_support_bracket",
    "four_leg_caster_base",
    "circular_footring_stretcher"
  )
) {
  add(
    "Toledo-style mid-century industrial task chair",
    hasAny("toledo_industrial_style", "mid_century_industrial_office") ? 115 : 85,
    "Bent plywood seat/back, painted steel frame, casters, height adjustment, swivel mechanism, and footring/stretcher pattern support a Toledo-style industrial task chair reading."
  );
}
 
  // Seating forms
   if (clues.has("renaissance_revival_upholstered_armchair_pattern")) {
    add(
      "Renaissance Revival upholstered armchair",
      118,
      "Combined armchair form, carved barley/rope-twist supports, acanthus carving, claw or paw feet, fan/channel back, and full upholstery support a Renaissance Revival / late Victorian parlor chair reading."
    );
  }
   if (clues.has("mission_arts_crafts_structural_pattern")) {
    add(
      "Mission / Arts & Crafts furniture",
      116,
      "Slat or spindle back, rectilinear legs, exposed or mortise-and-tenon joinery, and oak construction support a Mission / Arts & Crafts reading."
    );
  }
 if (clues.has("mcm_structural_pattern")) {
  add(
    "Mid-century modern spindle-back lounge chair",
    105,
    "Combined paddle/rail arms, spindle back, barrel-back form, and splayed/tapered legs support a mid-century modern chair reading."
  );
}
  if (clues.has("colonial_georgian_revival_upholstered_armchair_pattern")) {
  add(
    "Colonial / Georgian Revival upholstered armchair",
    112,
    "Fluted or reeded legs, exposed curved arm supports, and full upholstery support a Colonial / Georgian Revival upholstered armchair reading."
  );
}

  // ── Seating-form resolution (stress-test fix #12, 2026-05-20) ──────────
  // Root-cause fix for the armchair-vs-settee override bug. scoreForms
  // previously scored only armchair + bench among seating forms; the other
  // 8 seating canonical forms (sofa, settee, lounge_chair, wing_chair,
  // recliner, stool, ottoman, slipper_chair) had NO clue-key scoring path
  // and were reachable ONLY if the LLM emitted their exact display name.
  // Result: armchair_form (the one general seating clue WITH a scoring
  // path) captured everything — a settee whose observations explicitly
  // said "sized for two persons / two-seat settee/loveseat, not a single
  // armchair" still scored as "Upholstered armchair" because Settee and
  // Sofa had no way to compete.
  //
  // This block adds scoring coverage for the seating class and lets
  // multi-person + posture + wing + recliner evidence OUTSCORE or SUPPRESS
  // the armchair_form clue when the observations describe a different
  // seating form. Scores are calibrated above the armchair clue's 62-82
  // so a correctly-evidenced settee/sofa/lounge wins the primary slot.

  // Multi-person seating language. The LLM frequently emits armchair_form
  // while DESCRIBING two-person seating in the observation prose. Matching
  // explicit multi-occupant phrases (not bare "sofa", which appears in
  // upholstery-technique descriptions like "parlor sofa construction").
  const multiPersonSeating =
    /\b(two[- ]?persons?|two[- ]?seat(er|s)?|three[- ]?seat(er|s)?|sized for two|settee|love[- ]?seats?|loveseats?)\b/.test(text);

  if (
    multiPersonSeating &&
    hasAny("seating_surface", "seating_present", "armchair_form", "backrest_present", "fully_upholstered")
  ) {
    if (/\bsettee\b/.test(text)) {
      add("Settee", 96, "Observations describe two-person seating with settee proportions — not a single armchair.");
    } else if (/\blove[- ]?seats?\b|\bloveseats?\b/.test(text)) {
      add("Loveseat", 96, "Observations describe two-person loveseat-scale seating — not a single armchair.");
    } else {
      add("Sofa", 92, "Observations describe multi-person seating — not a single armchair.");
    }
  }

  // Lounge chair — posture-based lounge identity (deep seat, low seat
  // height, reclined back). Only when NOT multi-person (a two-person
  // lounge piece is a sofa/settee, not a lounge chair).
  if (clues.has("lounge_chair_form") && !multiPersonSeating) {
    add(
      "Lounge chair",
      clues.has("armchair_form") ? 86 : 80,
      "Posture-based lounge-chair identity — deeper seat, lower seat height, reclined back — distinct from upright armchair form."
    );
  }

  // Wing chair — wing/wingback evidence.
  if (/\bwing[- ]?backs?\b|\bwing chairs?\b|\bwingbacks?\b/.test(text)) {
    add("Wing chair", 88, "Wing or wingback chair form (enclosing side wings) is visible.");
  }

  // Recliner — reclining mechanism.
  if (/\brecliner|reclining (mechanism|chair|seat)|la-?z-?boy\b/.test(text)) {
    add("Recliner", 90, "Reclining mechanism or recliner form is visible.");
  }

  // Commode / close stool — a hinged-lid case enclosing a chamber-pot basin
  // (circular aperture cut in an interior seat board). Scored above the plain
  // "Stool" text-match below AND above the bedroom-cousin tier (washstand /
  // nightstand / low chest, all <=100): the chamber-pot aperture is definitive,
  // but the term "close stool" contains "stool" and these pieces were also
  // colloquially called "night stands"/"commodes", so the cousin text-matches
  // otherwise steal the slot. Ungated by backrest so a stray backrest read
  // can't suppress it.
  if (commodeEvidence) {
    add("Commode (close stool)", 108, "Hinged-lid case with a circular aperture cut for a chamber-pot basin — a close stool / commode.");
  }

  // Stool — backless single-user seating. Only when no backrest evidence
  // (a stool by definition has no back) and not a close-stool commode.
  if (
    /\bstools?\b|\btabourets?\b/.test(text) &&
    !hasAny("backrest_present", "spindle_back") &&
    !commodeEvidence
  ) {
    add("Stool", 72, "Backless single-user stool form is visible.");
  }

  // Armchair scoring — gated so it does NOT fire when the observations
  // describe multi-person seating (settee/sofa/loveseat). Without this
  // gate, armchair_form scored "Upholstered armchair" even on explicit
  // two-person pieces, capturing the primary slot from the correct form.
  if (clues.has("armchair_form") && !multiPersonSeating) {
    add(
      "Upholstered armchair",
      clues.has("cabriole_leg") ? 82 : 62,
      "Armchair form is visible."
    );
  }

  if (hasAny("seating_surface", "seating_present") && !hasAny("secondary_surface", "writing_surface", "telephone_shelf", "drop_front_desk", "pigeonholes")) {
    add("Bench / seating furniture", 55, "Seating surface is visible without stronger desk or telephone features.");
  }

  // Named seating-TYPE cluster. The block above is the generic seating OVERRIDE
  // system (armchair clue vs multi-person vs wing/recliner/lounge/stool/bench),
  // and those labels already route to form_armchair/sofa/settee/etc. These 19
  // forms are SPECIFIC named chair types that were orphaned — orthogonal to the
  // override: a named type (windsor/ladderback/morris/...) correctly outscores
  // the generic "Upholstered armchair" (62-82), "Stool" (72), and "Bench" (55).
  // Collision ordering (most-specific first): the "folding/rocking X" boundary
  // forms resolve to their TYPE before the generic folding/rocking detectors
  // (folding auditorium -> theater; rocking Adirondack -> adirondack; Morris
  // rocker -> morris); bar stool/counter stool -> bar chair (beats Stool);
  // ottoman/footstool excludes "ottoman table" so the Ottoman TABLE keeps its
  // emitter. Single-chair named types carry no multi-person cue, so the
  // Settee/Sofa/Loveseat override is unaffected.
  const morrisChairForm = includesAny(text, ["morris chair", "morris rocker", "morris recliner", "mission recliner", "mission rocker recliner", "mission lounge chair", "adjustable-back chair", "adjustable back chair", "adjustable-back lounge chair", "bow-arm morris", "flat-arm morris", "stickley-style chair"]);
  const adirondackForm = includesAny(text, ["adirondack chair", "adirondack", "adirondak", "westport chair", "westport adirondack", "muskoka chair", "fan-back adirondack", "folding adirondack", "rocking adirondack", "poly adirondack", "composite adirondack", "hdpe adirondack"]);
  const papasanForm = includesAny(text, ["papasan", "papa-san", "mamasan", "double papasan", "wicker bowl chair", "hanging papasan"]);
  const beanBagForm = includesAny(text, ["bean bag", "beanbag", "sacco chair", "sacco-style chair", "crash pad chair", "lounge sack", "memory foam bean bag"]);
  const butterflyForm = includesAny(text, ["butterfly chair", "butterfly sling", "bkf chair", "b.k.f. chair", "hardoy chair", "sling chair", "leather sling chair", "canvas sling chair", "hide sling chair", "cowhide butterfly"]);
  const theaterSeatForm = includesAny(text, ["theater seat", "theatre seat", "auditorium seat", "auditorium chair", "cinema seat", "movie theater seat", "movie theatre seat", "opera seat", "opera house seat", "stadium seat", "arena seat", "lecture hall seat", "folding auditorium seat", "assembly hall seat", "church auditorium seat"]);
  const pewForm = includesAny(text, ["pew", "church pew", "meetinghouse pew", "meetinghouse bench", "chapel pew", "box pew", "sanctuary pew", "congregational pew", "gothic revival pew", "cut-down pew", "salvage pew"]);
  const windsorForm = includesAny(text, ["windsor chair", "windsor armchair", "windsor settee", "windsor", "sack-back", "bow-back", "hoop-back", "comb-back", "arrow-back", "fan-back", "birdcage windsor", "firehouse windsor", "captain's chair"]);
  const ladderbackForm = includesAny(text, ["ladder-back", "ladderback", "ladder back", "slat-back chair", "slat back chair"]);
  const chaiseForm = includesAny(text, ["chaise longue", "chaise lounge", "fainting couch", "fainting sofa", "recamier", "récamier", "meridienne", "méridienne", "duchesse brisée", "duchesse brisee", "long chair", "sun lounger", "pool lounger", "outdoor lounger", "patio chaise", "garden chaise", "chaise"]);
  const daybedForm = includesAny(text, ["daybed", "day bed", "studio couch", "couch bed", "day couch", "trundle daybed", "sleigh daybed", "convertible couch", "backed daybed", "bolster daybed"]);
  const gliderForm = includesAny(text, ["porch glider", "lawn glider", "metal glider", "metal lawn glider", "glider bench", "patio glider", "outdoor glider", "steel glider", "tin glider", "spring glider", "porch glider bench"]);
  const foldingChairForm = includesAny(text, ["folding chair", "folding seat", "camp chair", "camping chair", "director's chair", "directors chair", "samsonite chair", "bistro folding chair"]);
  const slipperChairForm = includesAny(text, ["slipper chair", "boudoir chair", "boudoir slipper", "tufted slipper chair", "vanity chair", "dressing chair", "bedroom slipper chair"]);
  const barChairForm = includesAny(text, ["bar chair", "bar stool", "counter stool", "counter-height stool", "pub stool", "swivel bar stool", "breakfast bar stool", "kitchen counter stool"]);
  const rockingChairForm = includesAny(text, ["rocking chair", "rocker", "platform rocker", "boston rocker", "bentwood rocker", "pressed-back rocker", "nursing rocker", "sewing rocker", "cane rocker"]);
  const milkingStoolForm = includesAny(text, ["milking stool", "milk stool", "dairy stool", "cow stool"]);
  const ottomanFootstoolForm = includesAny(text, ["footstool", "foot stool", "hassock", "pouffe", "pouf", "tuffet", "storage ottoman", "lounge ottoman", "vanity ottoman", "bench ottoman"]) ||
    (text.includes("ottoman") && !includesAny(text, ["ottoman table", "ottoman coffee table", "ottoman cocktail table", "ottoman side table", "cocktail ottoman table"]));
  const sideChairForm = includesAny(text, ["side chair", "dining side chair", "armless dining chair", "pull-up chair", "balloon-back chair", "balloon back chair", "press-back chair", "klismos chair"]);
  if (morrisChairForm) {
    add("Morris chair", 96, "Arts-and-Crafts armchair with an exposed manually adjustable reclining back.");
  } else if (adirondackForm) {
    add("Adirondack chair", 96, "Slat-seat/back outdoor lounge chair with wide flat arms (Westport/Muskoka type).");
  } else if (papasanForm) {
    add("Papasan chair", 96, "Bowl-shaped cushion seat resting in a round bent rattan/metal frame.");
  } else if (beanBagForm) {
    add("Bean bag chair", 96, "Fabric sack filled with loose pellets/foam, conforming to the sitter.");
  } else if (butterflyForm) {
    add("Butterfly chair", 95, "Sling seat (leather/canvas) hung on an X-shaped folding metal frame (BKF/Hardoy).");
  } else if (theaterSeatForm) {
    add("Theater seat", 95, "Row/auditorium seating with tip-up seats (theater, cinema, opera, stadium).");
  } else if (pewForm) {
    add("Pew", 96, "Bench-form congregational/assembly seating with architectural ends (church/meetinghouse).");
  } else if (windsorForm) {
    add("Windsor chair", 95, "Spindle-back chair with a solid saddle seat and splayed legs (sack/bow/comb/fan-back).");
  } else if (ladderbackForm) {
    add("Ladderback chair", 95, "Chair with horizontal slat (ladder) back rails.");
  } else if (chaiseForm) {
    add("Chaise longue", 95, "Elongated single-person reclining seat (fainting couch / récamier / lounger).");
  } else if (daybedForm) {
    add("Daybed", 94, "Seating-height bed-depth lounge for sitting and reclining (studio couch / trundle daybed).");
  } else if (gliderForm) {
    add("Porch glider", 94, "Suspended porch/lawn seat that glides on a pivoting under-frame.");
  } else if (foldingChairForm) {
    add("Folding chair", 93, "Collapsible single-user chair (camp, director's, or event folding chair).");
  } else if (slipperChairForm) {
    add("Slipper chair", 94, "Low armless upholstered bedroom/boudoir chair.");
  } else if (barChairForm) {
    add("Bar chair", 92, "Counter/bar-height seat (bar or counter stool), distinct from a low backless stool.");
  } else if (rockingChairForm) {
    add("Rocking chair", 94, "Chair mounted on curved rockers (Boston, bentwood, pressed-back, platform rocker).");
  } else if (milkingStoolForm) {
    add("Milking stool", 92, "Low short-legged work stool (dairy/milking form).");
  } else if (ottomanFootstoolForm) {
    add("Footstool", 90, "Footrest/ottoman/hassock/pouf — a low padded support, not a table.");
  } else if (sideChairForm) {
    add("Side chair", 90, "Armless single-user chair (dining side chair / pull-up chair).");
  }

  // Bed forms
  // Lighting forms (lamps). Routed BEFORE the metal/brass material families so a
  // lamp's brass/iron base does not fall through to the brass-bed / iron-bed /
  // metal-furniture material traps (#14). lamp_form and lighting evidence have
  // no other scoreForms path; the 14+ lamp forms in forms.ts were otherwise
  // reachable only by exact-name LLM emission (same orphaned-form pattern as #12).
  const lampSignal =
    hasAny(
      "lamp_form", "table_lamp_form", "floor_lamp_form", "lamp_base", "lamp_shade",
      "lamp_socket", "lamp_harp", "lamp_finial", "slag_glass_shade", "leaded_glass_shade"
    ) ||
    includesAny(text, [
      "table lamp", "floor lamp", "lamp shade", "lampshade", "slag glass", "leaded glass",
      "panel lamp", "lamp base", "lamp socket", "lamp harp", "electric lamp", "banquet lamp",
      "boudoir lamp", "gone with the wind lamp",
    ]);
  if (lampSignal) {
    // Functional identity outranks decorative styling and fuel-word resemblance
    // (#16). POSITIVE electric evidence (socket/cord/E26 clue or phrase, or
    // electrified-conversion language) is checked FIRST and wins — so a fuel
    // word that only appears in NEGATING prose the engine itself emits
    // ("electric rather than oil/kerosene function") cannot route the lamp to a
    // fuel form. Fuel-type keywords are only consulted INSIDE a positive
    // burner/font/wick/chimney gate, so bare/negated "kerosene"/"oil" never
    // reaches them.
    const electricEvidence =
      hasAny("electric_table_lamp", "electric_lamp", "lamp_socket_visible", "lamp_socket") ||
      includesAny(text, [
        "electric cord", "electric lamp", "electric socket", "electric wiring", "electrified",
        "medium-base", "medium base", "e26", "pull-chain socket", "keyless socket",
        "wired for electric", "light socket", "lamp socket", "bulb socket",
      ]);
    const fuelEvidence = includesAny(text, [
      "kerosene burner", "oil burner", "wick mechanism", "fuel font", "fuel fount",
      "oil reservoir", "kerosene reservoir", "burner and font", "center-draft burner", "glass chimney",
    ]);
    const floorForm = includesAny(text, ["floor lamp", "standing lamp", "torchere", "torchière", "torchiere", "bridge lamp"]);

    if (floorForm) {
      add("Floor lamp", 88, "Floor-standing lamp form (tall shaft, weighted base) is visible.");
    } else if (electricEvidence) {
      add("Table lamp", 90, "Surface-set electric table lamp form (shade, socket or harp, decorative base) is visible.");
    } else if (fuelEvidence && includesAny(text, ["kerosene", "coal oil", "center-draft", "center draft"])) {
      add("Kerosene lamp", 86, "Kerosene burner, font, or chimney evidence is visible.");
    } else if (fuelEvidence && includesAny(text, ["whale oil", "sperm oil", "lard oil", "camphene", "burning fluid", "fluid lamp"])) {
      add("Oil lamp", 86, "Fluid or oil burner and font evidence is visible.");
    } else if (fuelEvidence) {
      add("Oil lamp", 80, "Fuel-burning lamp form (burner, font, or wick) is visible.");
    } else if (includesAny(text, ["banquet lamp", "gone with the wind", "gwtw"])) {
      add("Banquet lamp", 84, "Tall ornate parlor / banquet lamp form is visible.");
    } else {
      add("Table lamp", 88, "Surface-set table lamp form (shade, socket or harp, decorative base) is visible.");
    }
  }

  if (clues.has("metal_bed_frame") && !lampSignal) {
    // Block 9: seating signals suppress Iron bed frame. A chair with iron
    // frame is not a bed regardless of the metal_bed_frame clue firing.
    // The LLM sometimes emits metal_bed_frame on any iron/steel-framed
    // furniture; this guard prevents Iron bed frame from outranking
    // chair-specific form scores. Mutual exclusion: bed and chair forms
    // are categorically distinct (mattress platform vs seat surface).
    const seatingPresent = clues.has("seating_surface")
      || clues.has("seating_present")
      || clues.has("backrest_present")
      || clues.has("armchair_form")
      || clues.has("mcm_structural_pattern")
      || clues.has("toledo_industrial_style")
      || clues.has("mid_century_industrial_office")
      || clues.has("renaissance_revival_upholstered_armchair_pattern")
      || clues.has("colonial_georgian_revival_upholstered_armchair_pattern")
      || clues.has("mission_arts_crafts_structural_pattern");
    if (!seatingPresent) {
      add("Iron bed frame", 95, "Metal headboard, footboard, or bed frame structure is visible.");
    }
  }

  // Wooden bedstead cluster (form_bedstead). Per the iron/wood split (appraiser
  // decision 2026-05-19), metal-frame beds route to form_iron_bed (handled
  // above) and wooden beds route here. Gated against three collisions:
  //   - metal cues  → stay on form_iron_bed
  //   - "daybed"    → stay on form_daybed (side-facing lounge bed)
  //   - seating     → a bed is not a chair/settee
  // Subtypes checked most-specific-first so substrings don't steal (e.g.
  // "half-tester bed" contains "tester bed"; "sleigh daybed" — routed to
  // form_daybed — does not contain "sleigh bed").
  const metalBedCue =
    clues.has("metal_bed_frame") ||
    hasAny("tubular_steel", "wrought_iron", "cast_iron", "brass_frame", "chrome_frame") ||
    includesAny(text, [
      "iron bed", "brass bed", "metal bed", "metal bedstead", "iron bedstead",
      "cast-iron bed", "cast iron bed", "wrought-iron bed", "wrought iron bed",
      "tubular steel bed", "tubular-steel bed", "steel bed frame",
    ]);
  const daybedCue = includesAny(text, ["daybed", "day bed", "studio couch", "couch bed", "day couch"]);
  const bedSeatingPresent =
    clues.has("seating_surface") || clues.has("seating_present") ||
    clues.has("backrest_present") || clues.has("armchair_form");

  const halfTesterBed = includesAny(text, ["half-tester", "half tester"]);
  const testerBed = includesAny(text, ["tester bed", "canopy bed", "full tester", "full-tester"]);
  const fourPosterBed = includesAny(text, ["four-poster", "four poster", "poster bed", "pencil-post bed", "pencil post bed"]);
  const sleighBed = includesAny(text, ["sleigh bed"]);
  const spoolBed = includesAny(text, ["spool bed", "jenny lind"]);
  const ropeBed = includesAny(text, ["rope bed"]);
  const cannonballBed = includesAny(text, ["cannonball bed", "cannon-ball bed"]);
  const lowPostBed = includesAny(text, ["low-post bed", "low post bed"]);
  const panelBed = includesAny(text, ["panel bed"]);
  const genericWoodBed = includesAny(text, [
    "bedstead", "wooden bed", "wood bed", "wood-frame bed", "wood frame bed", "wooden bedframe",
  ]);

  if (!lampSignal && !metalBedCue && !daybedCue && !bedSeatingPresent) {
    if (halfTesterBed) {
      add("Half-tester bed", 100, "Wooden bed with a partial overhead tester projecting over the head end.");
    } else if (testerBed) {
      add("Tester bed", 100, "Wooden four-post bed with a full overhead canopy/tester structure.");
    } else if (fourPosterBed) {
      add("Four-poster bed", 100, "Wooden bed with four tall corner posts (no overhead tester).");
    } else if (sleighBed) {
      add("Sleigh bed", 100, "Wooden bed with head and foot scrolled outward in a sleigh silhouette.");
    } else if (spoolBed) {
      add("Spool bed", 100, "Wooden bed with turned spool/bobbin-like posts and rails (Jenny Lind).");
    } else if (ropeBed) {
      add("Rope bed", 100, "Wooden bed with a rope-laced mattress-support system through rail holes.");
    } else if (cannonballBed) {
      add("Cannonball bed", 98, "Wooden bed with rounded cannonball finials topping the posts.");
    } else if (lowPostBed) {
      add("Low-post bed", 98, "Wooden bed with short corner posts and restrained vertical emphasis.");
    } else if (panelBed) {
      add("Panel bed", 96, "Wooden bed with panel-and-frame headboard/footboard (common in factory suites).");
    } else if (genericWoodBed) {
      add("Bedstead", 92, "Wooden sleeping-support frame (headboard and/or footboard plus rails).");
    }
  }

     // Non-wood and mixed-material form families. Gated on !lampSignal so a lamp's
     // metal/brass base does not register as bed/metal furniture (#14).
  if (!lampSignal && !woodPrimary && hasAny("metal_frame", "tubular_steel", "wrought_iron", "cast_iron", "brass_frame", "chrome_frame")) {
    add("Metal furniture", 62, "Metal frame or metal furniture construction is visible.");
  }

  if (!lampSignal && !woodPrimary && hasAny("tubular_steel", "chrome_frame", "chrome_and_laminate")) {
    add("Modernist / chrome-frame furniture", 74, "Tubular steel, chrome, or chrome-and-laminate construction supports a modernist or mid-century furniture reading.");
  }

  if (!lampSignal && !woodPrimary && hasAny("wrought_iron", "cast_iron")) {
    add("Iron furniture", 72, "Iron or cast/wrought metal construction is visible.");
  }

  if (!lampSignal && !woodPrimary && hasAny("brass_frame")) {
    add("Brass bed or brass-frame furniture", 70, "Brass frame or brass rail construction is visible.");
  }

    if (
    hasAny("fully_upholstered", "visible_springs", "tufted_upholstery", "exposed_upholstery_tacks") &&
    !clues.has("renaissance_revival_upholstered_armchair_pattern")
  ) {
    add("Upholstered seating", 76, "Upholstery, cushion, spring, or upholstery-tack evidence is visible.");
  }

  if (hasAny("woven_body", "rattan_frame")) {
    add("Wicker / rattan furniture", 78, "Woven wicker, reed, or rattan construction is visible.");
  }

  if (hasAny("cane_panels")) {
    add("Caned seating or caned-back furniture", 62, "Cane panel, cane seat, or cane back construction is visible.");
  }

  if (hasAny("glass_top")) {
    add("Glass-top table or mixed-material table", 48, "Glass top or glass shelf evidence is visible.");
  }

  if (hasAny("laminate_surface", "formica_surface", "chrome_and_laminate")) {
    add("Mid-century laminate / dinette furniture", 72, "Laminate, Formica, chrome, or utility-surface evidence supports mid-century or later furniture.");
  }

  if (hasAny("molded_plastic", "acrylic_clear")) {
    add("Modern plastic / acrylic furniture", 74, "Molded plastic, acrylic, or Lucite-style furniture material is visible.");
  }
  // Style-context forms
    if (clues.has("jacobean_tudor_revival_case_pattern")) {
    add(
      "Jacobean / Tudor Revival case furniture",
      116,
      "Barley-twist or spiral-turned supports, heavy geometric carving, paneled construction, and case-furniture form support a Jacobean / Tudor Revival cabinet, sideboard, buffet, or dresser reading."
    );
  } else if (clues.has("barley_twist") || includesAny(text, ["jacobean", "heavy carving", "spiral turned", "twist leg"])) {
    add(
      "Jacobean Revival cabinet / sideboard",
      72,
      "Historicist carving or turned supports support Jacobean Revival context."
    );
  }
       if (clues.has("william_and_mary_pattern")) {
    add(
      "William and Mary furniture",
      108,
      "Turned bulbous or vase-form legs, stretcher base, and rectilinear case form support a William and Mary reading."
    );
  }
     if (clues.has("federal_hepplewhite_sheraton_pattern")) {
    add(
      "Federal / Hepplewhite / Sheraton furniture",
      112,
      "Slender tapered legs, inlay or banding, and bow-front, serpentine, shield-back, spade-foot, or delicate-proportion cues support a Federal / Hepplewhite / Sheraton reading."
    );
  }
     if (clues.has("chippendale_pattern")) {
    add(
      "Chippendale furniture",
      110,
      "Cabriole legs, claw or ball-and-claw feet, and pierced splat, ribbon-back, fretwork, broken-pediment, or flame-finial details support a Chippendale reading."
    );
  }
   if (clues.has("victorian_eastlake_pattern")) {
    add(
      "Victorian Eastlake furniture",
      112,
      "Incised linear carving, spindle gallery or turned-spindle detail, and geometric applied ornament support a Victorian Eastlake reading."
    );
  }
   if (clues.has("rococo_revival_pattern")) {
    add(
      "Rococo Revival furniture",
      114,
      "Cabriole or sinuous legs, scroll carving, naturalistic floral or fruit carving, and serpentine or flowing outlines support a Rococo Revival reading."
    );
  }
   if (clues.has("gothic_revival_pattern")) {
    add(
      "Gothic Revival furniture",
      114,
      "Pointed or lancet arches, tracery, and clustered-column, buttress, or cathedral-panel details support a Gothic Revival reading."
    );
  }
     if (clues.has("art_deco_pattern")) {
    add(
      "Art Deco / Machine Age furniture",
      114,
      "Stepped or waterfall profile, geometric or figured veneer, and chrome, Bakelite, or streamlined hardware support an Art Deco / Machine Age reading."
    );
  }
       if (clues.has("edwardian_pattern")) {
    add(
      "Edwardian furniture",
      108,
      "Slender tapered legs, light inlay or painted detail, and delicate proportions, oval mirror, or light gallery details support an Edwardian reading."
    );
  }
       if (clues.has("art_nouveau_pattern")) {
    add(
      "Art Nouveau furniture",
      110,
      "Whiplash curves, organic or floral motifs, and asymmetrical or flowing forms support an Art Nouveau reading."
    );
  }
     if (clues.has("shaker_pattern")) {
    add(
      "Shaker furniture",
      110,
      "Ladder-back or slat-back form, simple tapered legs, and minimal ornament with absence of carving or decorative veneer support a Shaker reading."
    );
  }
    if (clues.has("colonial_revival_pattern")) {
    add(
      "Colonial Revival furniture",
      104,
      "Cabriole legs, shell or claw/pad-foot ornament, and symmetrical case or seating form support a Colonial Revival reading rather than proof of 18th-century origin."
    );
  } else if (clues.has("cabriole_leg") || clues.has("shell_carving") || clues.has("claw_or_pad_foot")) {
    add(
      "Queen Anne / Colonial Revival furniture",
      48,
      "Cabriole legs, shell carving, or related revival style cues are visible."
    );
  }
    // 🧠 PATTERN → FORM LOCKING
  // Strong structural patterns should protect their matching form from generic regression.
  // This does not create new evidence; it only reinforces already-detected derived patterns.

  const protectForm = (form: string, bonus: number, support: string) => {
    if (!scores[form]) return;
    scores[form].score += bonus;

    if (!scores[form].support.includes(support)) {
      scores[form].support.push(support);
    }
  };

  if (clues.has("renaissance_revival_upholstered_armchair_pattern")) {
    protectForm(
      "Renaissance Revival upholstered armchair",
      18,
      "Pattern-to-form lock: Renaissance Revival upholstered armchair pattern protects this specific form from generic upholstered seating."
    );
  }

  if (clues.has("mission_arts_crafts_structural_pattern")) {
    protectForm(
      "Mission / Arts & Crafts furniture",
      16,
      "Pattern-to-form lock: Mission / Arts & Crafts structural pattern protects this specific form from generic seating or case furniture."
    );
  }

  if (clues.has("mcm_structural_pattern")) {
    protectForm(
      "Mid-century modern spindle-back lounge chair",
      16,
      "Pattern-to-form lock: MCM structural pattern protects this specific chair form from generic seating."
    );
  }

  if (clues.has("jacobean_tudor_revival_case_pattern")) {
    protectForm(
      "Jacobean / Tudor Revival case furniture",
      16,
      "Pattern-to-form lock: Jacobean / Tudor Revival case pattern protects this specific case-furniture reading from generic cabinet fallback."
    );
  }

  if (clues.has("federal_hepplewhite_sheraton_pattern")) {
    protectForm(
      "Federal / Hepplewhite / Sheraton furniture",
      14,
      "Pattern-to-form lock: Federal / Hepplewhite / Sheraton pattern protects this specific style-form reading."
    );
  }

  if (clues.has("colonial_revival_pattern")) {
    protectForm(
      "Colonial Revival furniture",
      12,
      "Pattern-to-form lock: Colonial Revival pattern protects this revival reading from loose Queen Anne or generic case-furniture fallback."
    );
  }
  // Functional hierarchy corrections
  const strongFunctionalSignals = hasAny(
    "seating_surface",
    "seating_present",
    "telephone_shelf",
    "secondary_surface",
    "writing_surface",
    "drop_front_desk",
    "pigeonholes"
  );

  if (strongFunctionalSignals) {
    if (scores["Cabinet"]) scores["Cabinet"].score -= 25;
    if (scores["Dresser / drawer case"]) scores["Dresser / drawer case"].score -= 25;
    if (scores["Chest of drawers / dresser"]) scores["Chest of drawers / dresser"].score -= 20;
    if (scores["Cabinet / dresser combination"]) scores["Cabinet / dresser combination"].score -= 15;
  }

  // Avoid negative or zero-score results
  // 🧠 GENERIC FORM SUPPRESSION (ANTI-REGRESSION)

let results = Object.values(scores).map((s) => ({
  ...s,
  score: Math.max(1, s.score),
}));

const GENERIC_FORMS = [
  "seating",
  "chair",
  "armchair",
  "upholstered seating",
  "table",
  "cabinet",
  "case furniture",
  "furniture",
];

const isGeneric = (form: string) =>
  GENERIC_FORMS.some((g) => form.toLowerCase().includes(g));

const hasSpecific = results.some(
  (r) => r.score >= 60 && !isGeneric(r.form)
);

if (hasSpecific) {
  results = results.filter(
    (r) => !isGeneric(r.form) || r.score >= 55
  );
}

// Block 1 D-PH3-7: resolve canonical form_id for each result via FORM_LABEL_TO_CANONICAL.
// NO_MATCH → form_id stays null; engine label preserved as `form` for display backward-compat.
const withCanonical: ScoredForm[] = results.map((r) => {
  const lookup = canonicalFormIdForLabel(r.form);
  return {
    ...r,
    form_id: lookup === NO_MATCH ? null : lookup,
  };
});

return withCanonical.sort((a, b) => b.score - a.score);
}
function buildReportEvidenceSupport(digest: EvidenceDigest, formSupport: string[]): string[] {
  const priorityOrder: Record<string, number> = {
    construction: 1,
    joinery: 1,
    toolmarks: 1,
    fasteners: 1,
    materials: 2,
    material: 2,
    hardware: 3,
    finish: 4,
    condition: 5,
    style: 6,
    structure: 6,
    form: 9,
    function: 9,
    context: 10,
  };

  const bannedPhrases = [
    "drawer evidence is visible",
    "drawers total visible",
    "chest has multiple drawers",
    "piece is a chest of drawers",
    "drawer storage",
  ];

  const evidence = [...digest.observations]
    .filter((o) => {
      const text = o.description.toLowerCase();
      if (bannedPhrases.some((p) => text.includes(p))) return false;
      return true;
    })
    .sort((a, b) => {
      const pa = priorityOrder[a.type] || 10;
      const pb = priorityOrder[b.type] || 10;
      if (pa !== pb) return pa - pb;
      return b.confidence - a.confidence;
    })
    .map((o) => o.description);

  const combined = [...evidence, ...formSupport];

  return uniq(combined).slice(0, 10);
}
function deriveStyleContext(digest: EvidenceDigest): string | null {
    const text = `${digest.perception?.raw_text || ""} ${digest.observations
    .map((o) => `${o.clue || ""} ${o.description}`)
    .join(" ")}`.toLowerCase();

  const has = (word: string) => text.includes(word);
  const hasClue = (clue: string) =>
    (digest.clue_keys || []).includes(clue) ||
    digest.observations.some((o) => o.clue === clue);

  const not = (word: string) =>
    includesAny(text, [
      `no ${word}`,
      `not ${word}`,
      `without ${word}`,
      `${word} not`,
    ]);

  // Golden Oak Era guard: per appraiser direction, Golden Oak Era is NOT
  // a style — it is a vernacular dating / material / market-era marker
  // tied to wood species, finish, and cut pattern (oak + flat-sawn or
  // quarter-sawn grain + warm honey finish + factory-era hardware,
  // c. 1890-1915 peak). Pieces from the Golden Oak Era can be in any
  // actual style (Eastlake, Mission, Colonial Revival, Empire Revival,
  // etc.) — Golden Oak is the common production-era denominator, not
  // the style language. Surfacing "Golden Oak Era" as a style_context
  // string (which then composed into display_form as "Golden Oak Era
  // Chest of drawers") was an architectural mismatch — analogous to
  // calling both a Mustang Mach 1 and a Dodge Super Bee "muscle cars"
  // as if that were their style.
  //
  // Return null here so deriveStyleContext does NOT claim a style on
  // Golden Oak Era pieces. The era marker is properly carried by:
  // (a) the wood-evidence layer (wood_variant_evidence_golden_oak_era
  //     in woodEvidence.ts with period_associations: peak 1890-1915,
  //     emergence 1870, decline 1915-1925)
  // (b) the dating overlap convergence (wood layer contributes the
  //     1890-1915 window)
  // (c) supporting-evidence surfacing in the report (era context
  //     framed as wood/finish/market-era anchor, not style)
  //
  // The early return ALSO preserves the original guard purpose: it
  // prevents the Empire fallback below from misfiring on factory-era
  // oak pieces whose descriptions happen to contain words like "empire"
  // or "transitional" (e.g., empire_transitional_style clue on a
  // Golden Oak dresser).
  if (hasClue("golden_oak_era_possible") || hasClue("golden_oak_structural_pattern")) {
    return null;
  }

  // Jacobean
  if (
    (has("barley twist") && !not("barley twist")) ||
    (has("heavy carving") && !not("heavy carving"))
  ) {
    return "Jacobean Revival";
  }

  // Queen Anne ONLY if clearly present
  if (
    (has("cabriole") && !not("cabriole")) ||
    (has("shell carving") && !not("shell"))
  ) {
    return "Queen Anne / Colonial Revival";
  }

  // Empire
  if (
    includesAny(text, ["empire", "scrolled feet", "ogee", "serpentine"]) &&
    !includesAny(text, ["not empire", "no empire"])
  ) {
    return "American Empire / late Classical Revival";
  }

  return null;
}

function dateFromEvidence(digest: EvidenceDigest, form: string) {
  // Block 14: detect upholstery from the FULL digest first, then switch the
  // function's internal `digest` to a frame-only filtered view. All
  // subsequent clue checks, text scans, and style/material classifiers see
  // only frame evidence — keeping form ID + frame dating independent of
  // upholstery (which is reported as its own track).
  const upholsteryLayer = detectUpholsteryLayer(digest);
  digest = buildFrameDigest(digest);

  const clues = new Set(digest.clue_keys);
  const support = buildReportEvidenceSupport(digest, []);
  const limitations: string[] = [];

  const text = `${digest.perception?.raw_text || ""} ${digest.observations
    .map((o) => `${o.clue || ""} ${o.description}`)
    .join(" ")}`.toLowerCase();

  const has = (...keys: string[]) => keys.some((k) => clues.has(k));

  const style = deriveStyleContext(digest);
  const material = classifyPrimaryMaterial(digest);

const materialDateGuard = (() => {
  if (material.primary === "plastic") {
    return {
      range: "post-1945",
      confidence: "Moderate" as const,
      note:
        "Plastic or acrylic furniture material prevents an early antique date unless there is separate evidence of later replacement parts on an older frame.",
    };
  }

  if (has("acrylic_clear", "molded_plastic")) {
    return {
      range: "post-1945",
      confidence: "Moderate" as const,
      note:
        "Molded plastic, acrylic, or Lucite-style material supports postwar modern or later production.",
    };
  }

  if (has("tubular_steel", "chrome_frame", "chrome_and_laminate")) {
    return {
      range: "c. 1925–1975",
      confidence: "Moderate" as const,
      note:
        "Tubular steel, chrome, or chrome-and-laminate construction supports Machine Age, modernist, mid-century, or later production rather than early wood-frame dating.",
    };
  }

  if (material.primary === "woven" || has("woven_body", "rattan_frame")) {
    return {
      range: "broadly late 19th to 20th century",
      confidence: "Low" as const,
      note:
        "Wicker, reed, or rattan construction requires form, joinery, wrapping method, finish, and hardware evidence for tighter dating.",
    };
  }

  return null;
})();
  const hasStyleEvidence = has(
    "neoclassical_louis_xvi_style",
    "queen_anne_georgian_revival",
    "regency_style_cues",
    "regency_federal_style",
    "oval_medallion_back",
    "cabriole_leg",
    "reeded_tapered_front_legs",
    "saber_rear_legs",
    "scroll_arm_terminals"
  );

  const hasEarlyConstructionEvidence = has(
    "hand_cut_joinery",
    "hand_cut_dovetails",
    "hand_forged_nail",
    "cut_nail",
    "early_webbing",
    "early_tacking",
    "irregular_hand_turning",
    "tool_mark_variation"
  );

  const hasMakerDateAnchor = (digest.observations || []).some(
    (o) => o.type === "label" && o.clue && o.confidence > 80
  );

  if (hasStyleEvidence && !hasEarlyConstructionEvidence && !hasMakerDateAnchor) {
    limitations.push(
      "Style is treated as design vocabulary, not proof of age; construction, underside, upholstery-system, or maker evidence is required to support an early date."
    );
  }

  // Path 1+2 minimum-viable wiring (Block 23a follow-up): lookup now spans
  // both canonical MAKER_ENTRIES (77) and legacy MAKER_MARKS (25) via
  // findMakerMarkById, returning a normalized NormalizedMakerMark shape.
  // Downstream code below (mark.maker, mark.mark_type, mark.date_range,
  // mark.dating_authority) consumes the normalized shape unchanged.
  const makerMarkObservation = (digest.observations || [])
    .filter((o) => o.type === "label" && o.clue)
    .map((o) => {
      const mark = findMakerMarkById(String(o.clue));
      return mark ? { observation: o, mark } : null;
    })
    .filter(Boolean)[0] as any;

  if (
    makerMarkObservation &&
    makerMarkObservation.observation.confidence >= 70 &&
    makerMarkObservation.mark.dating_authority !== "low"
  ) {
    // Path 3 wiring: enrich support and limitations with canonical
    // attribution_confidence_rule and false_positive_warnings (canonical
    // entries only; legacy entries leave these undefined). Surface
    // Confidence Ladder tier (Rule #7) explicitly so report prose
    // declares the tier and basis rather than asserting unframed.
    const mk = makerMarkObservation.mark as NormalizedMakerMark;
    const ladder = makerConfidenceLadderTier(mk, false);

    const enrichedSupport: string[] = [
      `Maker mark detected: ${mk.maker}.`,
      `Mark type: ${mk.mark_type}.`,
      `Dating reference: ${mk.date_range}.`,
      `Confidence tier (per Maker Mark Attribution Confidence Ladder): ${ladder.tier} — ${ladder.basis}`,
    ];
    if (mk.region) {
      enrichedSupport.push(`Region: ${mk.region}.`);
    }
    if (mk.attribution_confidence_rule) {
      enrichedSupport.push(`Attribution discipline: ${mk.attribution_confidence_rule}`);
    }
    enrichedSupport.push(...support);

    const enrichedLimitations: string[] = [
      "Date range is anchored to the detected maker mark; confirm the mark is original to the piece and not a later replacement or unrelated label.",
    ];
    if (mk.false_positive_warnings && mk.false_positive_warnings.length > 0) {
      enrichedLimitations.push(
        `False-positive warnings for ${mk.maker}: ${mk.false_positive_warnings.join(" ")}`
      );
    }

    return {
      range: mk.date_range,
      confidence: ladder.tier === "HIGH" ? "High" : ladder.tier === "MEDIUM" ? "Moderate" : "Low",
      support: enrichedSupport,
      limitations: enrichedLimitations,
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }

  // Label/form-specific anchors
  if (clues.has("roos_label")) {
    return {
      range: "c. 1940–1960",
      confidence: "High",
      support,
      limitations,
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }

  if (clues.has("lane_label")) {
    return {
      range: "c. 1930–1965",
      confidence: "High",
      support,
      limitations,
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }

  if (form.includes("Telephone bench")) {
    return {
      range: "c. 1900–1935",
      confidence: "High",
      support,
      limitations,
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }

  if (form.includes("Iron bed")) {
    return {
      range: "c. 1880–1920",
      confidence: "High",
      support,
      limitations,
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
  if (materialDateGuard && !hasMakerDateAnchor) {
  return {
    range: materialDateGuard.range,
    confidence: materialDateGuard.confidence,
    support,
    limitations: [
      ...limitations,
      materialDateGuard.note,
    ],
    upholstery_layer: upholsteryLayer,
    date_tightening_evidence: buildDateTighteningEvidence(digest),
  };
}
  // Pattern-based dating
   if (has("renaissance_revival_upholstered_armchair_pattern")) {
    return {
      range: "c. 1870–1900",
      confidence: "Moderate",
      support: [
        "The combined armchair form, heavily carved barley/rope-twist supports, acanthus carving, claw or paw feet, fan/channel back, and full upholstery support a Renaissance Revival / late Victorian parlor chair pattern.",
        ...support,
      ],
      limitations: [
        "Frame date is based on visible form and carved structural vocabulary; underside, joinery, fasteners, and internal frame construction would be needed to confirm or tighten the date.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
   if (has("jacobean_tudor_revival_case_pattern")) {
    return {
      range: "c. 1890–1935",
      confidence: "Moderate",
      support: [
        "The combined barley-twist or spiral-turned supports, heavy geometric carving, paneled construction, and case-furniture form support a Jacobean / Tudor Revival production pattern.",
        ...support,
      ],
      limitations: [
        "Frame date is based on visible structural and decorative patterning; drawer joinery, fasteners, secondary woods, and maker-label evidence would be needed to narrow the date further.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
     if (has("louis_xvi_revival_pattern")) {
    return {
      range: "c. 1880–1925",
      confidence: "Moderate",
      support: [
        "Louis XVI / French neoclassical style vocabulary combined with tapered legs, parquetry veneer, stringing inlay, ormolu mounts, brass foot sabots, or cylinder-roll construction supports a Louis XVI Revival pattern. In the American market this style is treated as late-Victorian to early-20th-century revival production rather than 18th-century French manufacture.",
        ...support,
      ],
      limitations: [
        "Construction details, joinery, fasteners, secondary woods, underside evidence, and any maker labels are needed to narrow the date and to distinguish American or European revival production from later 20th-century reproductions.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
     if (has("william_and_mary_pattern")) {
    return {
      range: hasEarlyConstructionEvidence ? "c. 1690–1730" : "c. 1890–1930",
    confidence: "Moderate",
      support: [
        "Turned bulbous or vase-form legs, stretcher base, and rectilinear case form support a William and Mary pattern.",
        ...support,
      ],
      limitations: [
        hasEarlyConstructionEvidence
  ? "Early construction evidence supports a possible period William and Mary date; joinery, fasteners, secondary woods, surface oxidation, underside construction, and provenance would refine it further."
  : "William and Mary styling is treated as revival-era unless early joinery, fasteners, tool marks, secondary woods, surface oxidation, or provenance confirm true period production.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
   if (has("federal_hepplewhite_sheraton_pattern")) {
    return {
          range: hasEarlyConstructionEvidence ? "c. 1780–1830" : "c. 1890–1940",
    confidence: "Moderate",
      support: [
        "Slender tapered legs, inlay or banding, and bow-front, serpentine, shield-back, spade-foot, or delicate-proportion cues support a Federal / Hepplewhite / Sheraton pattern.",
        ...support,
      ],
      limitations: [
        hasEarlyConstructionEvidence
  ? "Early construction evidence supports a possible period Federal / Hepplewhite / Sheraton date; drawer joinery, fasteners, secondary woods, underside construction, and maker-label evidence would refine it further."
  : "Federal / Hepplewhite / Sheraton styling is treated as revival-era unless early joinery, fasteners, tool marks, secondary woods, or provenance confirm true period production.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
   if (has("chippendale_pattern")) {
    return {
          range: hasEarlyConstructionEvidence ? "c. 1750–1780" : "c. 1890–1940",
    confidence: "Moderate",
      support: [
        "Cabriole legs, claw or ball-and-claw feet, and pierced splat, ribbon-back, fretwork, broken-pediment, or flame-finial details support a Chippendale pattern.",
        ...support,
      ],
      limitations: [
        hasEarlyConstructionEvidence
  ? "Early construction evidence supports a possible period Chippendale date; joinery, fasteners, secondary woods, underside construction, surface oxidation, and provenance would refine it further."
  : "Chippendale styling is treated as revival-era unless early joinery, fasteners, tool marks, secondary woods, surface oxidation, or provenance confirm true period production.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
   if (has("victorian_eastlake_pattern")) {
    return {
      range: "c. 1870–1890",
      confidence: "Moderate",
      support: [
        "Incised linear carving, spindle gallery or turned-spindle detail, and geometric applied ornament support a Victorian Eastlake production pattern.",
        ...support,
      ],
      limitations: [
        "Date is based on visible Eastlake design vocabulary and structural ornament; drawer joinery, fasteners, secondary woods, underside construction, and maker-label evidence would help confirm or narrow the range.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
   if (has("rococo_revival_pattern")) {
    return {
      range: "c. 1840–1870",
      confidence: "Moderate",
      support: [
        "Cabriole or sinuous legs, scroll carving, naturalistic floral or fruit carving, and serpentine or flowing outlines support a Rococo Revival production pattern.",
        ...support,
      ],
      limitations: [
        "Date is based on visible Rococo Revival design vocabulary and structure; joinery, fasteners, secondary woods, upholstery system, underside construction, and maker-label evidence would help confirm or narrow the range.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
   if (has("gothic_revival_pattern")) {
    return {
      range: "c. 1840–1880",
      confidence: "Moderate",
      support: [
        "Pointed or lancet arches, tracery, and clustered-column, buttress, or cathedral-panel details support a Gothic Revival production pattern.",
        ...support,
      ],
      limitations: [
        "Date is based on visible Gothic Revival design vocabulary and structural ornament; joinery, fasteners, secondary woods, underside construction, and maker-label evidence would help confirm or narrow the range.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
     if (has("art_deco_pattern")) {
    return {
      range: "c. 1925–1945",
      confidence: "Moderate",
      support: [
        "Stepped or waterfall profile, geometric or figured veneer, and chrome, Bakelite, or streamlined hardware support an Art Deco / Machine Age production pattern.",
        ...support,
      ],
      limitations: [
        "Date is based on visible Art Deco / Machine Age design and construction cues; drawer joinery, hardware backs, fasteners, secondary woods, underside construction, and maker-label evidence would help confirm or narrow the range.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
       if (has("edwardian_pattern")) {
    return {
      range: "c. 1900–1915",
      confidence: "Moderate",
      support: [
        "Slender tapered legs, light inlay or painted detail, and delicate proportions, oval mirror, or light gallery details support an Edwardian pattern.",
        ...support,
      ],
      limitations: [
        "Date is based on visible Edwardian design and construction vocabulary; joinery, fasteners, underside construction, secondary woods, and maker-label evidence would help confirm or refine the date.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
       if (has("art_nouveau_pattern")) {
    return {
      range: "c. 1890–1915",
      confidence: "Moderate",
      support: [
        "Whiplash curves, organic or floral motifs, and asymmetrical or flowing forms support an Art Nouveau pattern.",
        ...support,
      ],
      limitations: [
        "Date is based on visible Art Nouveau design vocabulary; joinery, fasteners, underside construction, secondary woods, and maker-label evidence would help confirm or refine the date.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
     if (has("shaker_pattern")) {
    return {
      range: "c. 1820–1900",
      confidence: "Moderate",
      support: [
        "Ladder-back or slat-back form, simple tapered legs, and minimal ornament with absence of carving or decorative veneer support a Shaker pattern.",
        ...support,
      ],
      limitations: [
        "Date is based on visible Shaker design and construction vocabulary; joinery, fasteners, underside construction, secondary woods, surface oxidation, and provenance would be needed to distinguish true Shaker production from later Shaker-style or vernacular work.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
   if (has("colonial_revival_pattern")) {
    return {
      range: "c. 1890–1940",
      confidence: "Moderate",
      support: [
        "Cabriole legs, shell or claw/pad-foot ornament, and symmetrical case or seating form support a Colonial Revival production pattern rather than proof of 18th-century origin.",
        ...support,
      ],
      limitations: [
        "Frame date is based on visible revival-style patterning; drawer joinery, fasteners, underside construction, secondary woods, and maker-label evidence would be needed to narrow the date further.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
  if (has("mcm_structural_pattern")) {
    return {
      range: "c. 1950–1975",
      confidence: "Moderate",
      support: [
        "The combined paddle/rail arms, spindle back, barrel-back form, and splayed/tapered legs support a mid-century modern production pattern.",
        ...support,
      ],
      limitations: [
        "Underside construction, joinery, fasteners, or maker-label evidence would be needed to narrow the date further.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }

  if (has("queen_anne_revival_pattern")) {
    return {
      range: "c. 1930–1970",
      confidence: "Moderate",
      support: [
        "Cabriole legs, fan/channel back upholstery, and fully upholstered frame support a mid-20th-century Queen Anne / Colonial Revival pattern.",
        ...support,
      ],
      limitations: [
        "Underside construction, joinery, fasteners, and upholstery system would refine dating further.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
    if (
  has("fluted_legs") &&
  has("reeded_arm_stiles") &&
  has("upholstered_seat_and_back") &&
  has("curved_arm_supports")
) {
  return {
    range: "c. 1940–1970",
    confidence: "Moderate",
    support: [
      "Fluted legs, reeded arm supports, and fully upholstered seat and back support a mid-20th-century formal dining or parlor armchair pattern.",
      ...support,
    ],
    limitations: [
      "Styling references earlier Georgian or Chippendale design, but construction and upholstery indicate later production; joinery and underside construction would refine the date further.",
    ],
    upholstery_layer: upholsteryLayer,
    date_tightening_evidence: buildDateTighteningEvidence(digest),
  };
}
    if (has("colonial_georgian_revival_upholstered_armchair_pattern")) {
  return {
    range: "c. 1940–1970",
    confidence: "Moderate",
    support: [
      "Fluted or reeded legs, exposed curved arm supports, and full upholstery support a mid-20th-century Colonial / Georgian Revival upholstered armchair pattern.",
      ...support,
    ],
    limitations: [
      "The styling references earlier Georgian or Chippendale design vocabulary, but the visible upholstered form and revival construction support later production. Underside construction, joinery, fasteners, and upholstery system would refine the date further.",
    ],
    upholstery_layer: upholsteryLayer,
    date_tightening_evidence: buildDateTighteningEvidence(digest),
  };
}
    if (has("mission_arts_crafts_structural_pattern")) {
    return {
      range: "c. 1900–1925",
      confidence: "Moderate",
      support: [
        "Slat or spindle back, rectilinear legs, exposed or mortise-and-tenon joinery, and oak construction support a Mission / Arts & Crafts production pattern.",
        ...support,
      ],
      limitations: [
        "Joinery details, fasteners, underside construction, and maker-label evidence would refine the date further.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
  if (has("neoclassical_cane_barrel_pattern")) {
    return {
      range: "c. 1940–1970",
      confidence: "Moderate",
      support: [
        "Barrel form, cane panels, fluted legs, and rosette ornamentation align with mid-century neoclassical and Hollywood Regency production.",
        ...support,
      ],
      limitations: [
        "Joinery, fasteners, and upholstery construction would refine dating further.",
      ],
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }

  // Hard modern anchors
  const confirmedModernHardNegative = has(
    "phillips_screw",
    "staple_fastener",
    "modern_concealed_hinge",
    "plywood_structural",
    "plywood_drawer_bottom"
  );

  if (confirmedModernHardNegative) {
    return {
      range: has("modern_concealed_hinge")
        ? "post-1950"
        : has("staple_fastener")
        ? "post-1945"
        : has("phillips_screw")
        ? "post-1935"
        : "post-1920",
      confidence: "High",
      support,
      limitations,
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }

  const traditionalConstructionScore =
    (has("solid_plank_back") ? 2 : 0) +
    (has("solid_wood_construction") ? 2 : 0) +
    (has("solid_wood_side_panels") ? 1.5 : 0) +
    (has("frame_and_panel_sides") ? 1.5 : 0) +
    (has("solid_wood_drawer_construction") ? 1.5 : 0) +
    (has("wooden_drawer_runners") ? 1.5 : 0) +
    (has("no_phillips_screws_observed") ? 0.5 : 0);

  const transitionalFactoryScore =
    (has("machine_dovetails") ? 2 : 0) +
    (has("dowel_joinery") ? 2 : 0) +
    (has("wire_nail") ? 1.5 : 0) +
    (has("band_saw_lines") ? 1.5 : 0) +
    (has("sheet_back_panel") ? 1 : 0) +
    (has("possible_plywood_or_laminated_panel") ? 0.5 : 0);

  const earlyHandmadeScore =
    (has("hand_cut_dovetails") ? 2.5 : 0) +
    (has("cut_nail") ? 2 : 0) +
    (has("hand_forged_nail") ? 3 : 0) +
    (has("pit_saw_marks") ? 3 : 0) +
    (has("slotted_handmade_screw") ? 2 : 0);

  const strongPre1920Signals =
    (has("solid_plank_back") ? 1 : 0) +
    (has("wooden_drawer_runners") ? 1 : 0) +
    (has("solid_wood_construction") ? 1 : 0) +
    (has("solid_wood_drawer_construction") ? 1 : 0);

  // Traditional / vernacular construction signals — tables, stands, stools, and
  // country pieces whose dating evidence is joinery- and form-based, not
  // drawer/dovetail-based. The case-piece scores above are blind to these, so a
  // table's convergent pre-1920 evidence never reached threshold and fell
  // through to "Broad". Pegged/drawbored mortise-and-tenon is a strong pre-1920
  // hand / early-industrial signal; box stretchers, traditional square-block
  // leg joinery, and hand-applied folk paint corroborate.
  const traditionalVernacularScore =
    (has("pegged_mortise_tenon", "drawbored_joint", "drawbore_pegged_joint", "pinned_mortise_tenon") ? 2 : 0) +
    (has("mortise_and_tenon") ? 1 : 0) +
    (has("box_stretcher_frame", "h_stretcher", "stretchers") ? 1 : 0) +
    (has("square_leg_block_transition") ? 1 : 0) +
    (has("two_tone_painted_decoration", "folk_painted_decoration", "hand_painted_decoration") ? 1 : 0);

  const absenceOfModern =
    !has("phillips_screw") &&
    !has("staple_fastener") &&
    !has("modern_concealed_hinge") &&
    !has("plywood_structural") &&
    !has("plywood_drawer_bottom") &&
    // Modern material / upholstery markers also defeat an absence-of-modern
    // read, keeping this honest on mid-century pieces (vinyl, foam, molded
    // plastic, tubular steel, laminate, particleboard/MDF are post-1930s).
    !has("vinyl_cover") &&
    !has("foam_padding") &&
    !has("molded_plastic") &&
    !has("tubular_steel") &&
    !has("laminate_surface") &&
    !has("formica_surface") &&
    !has("particle_board") &&
    !has("mdf_panel");

  const conflictingSignals =
    has("possible_plywood_or_laminated_panel") &&
    has("solid_wood_construction");

  if (conflictingSignals) {
    limitations.push(
      "Conflicting panel signals detected; solid wood vs possible laminated construction should be verified."
    );
  }

  if (
  style === "American Empire / late Classical Revival" &&
  has("american_empire_style") &&
  has("multiple_drawer_case") &&
  has("solid_wood_side_panels", "solid_plank_back", "side_panel_frame_and_panel") &&
  absenceOfModern
) {
  const hasTighteningEvidence =
    has("drawer_joinery_visible") ||
    has("wooden_knob_pulls") ||
    has("keyhole_escutcheons") ||
    earlyHandmadeScore >= 2;

  return {
    range: "c. 1830–1870",
    confidence: hasTighteningEvidence ? "Moderate" : "Low",
    support,
    limitations: [
      ...limitations,
      "American Empire / late Classical styling is supported by the scrolled feet and case form, while solid side panels, plank back, and frame-and-panel construction support a 19th-century working range. A tighter date still requires clear dovetail, nail, underside, or fastener evidence.",
    ],
    upholstery_layer: upholsteryLayer,
    date_tightening_evidence: buildDateTighteningEvidence(digest),
  };
}

  if (earlyHandmadeScore >= 3 && !transitionalFactoryScore) {
    return {
      range: "c. 1830–1890",
      confidence: "Moderate",
      support,
      limitations,
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }

  // Absence of modern markers + convergent pre-1920 construction (case-piece OR
  // vernacular/table) is a positive dating read: the lack of modern evidence
  // caps the ceiling, and the convergent traditional signals set the floor.
  // This is the "lack of modern evidence IS evidence" rule — it must fire for a
  // turned-and-stretchered painted table, not only for chests with drawers.
  if (absenceOfModern && (strongPre1920Signals + traditionalVernacularScore) >= 2) {
    const post1900Hardware = has("stamped_metal_bracket", "top_attachment_brackets", "top_attachment_method");
    return {
      range: conflictingSignals
        ? "c. 1900–1930"
        : post1900Hardware
          ? "c. 1900–1920"
          : "c. 1890–1920",
      confidence: "Moderate",
      support,
      limitations,
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }

  if (traditionalConstructionScore >= 3) {
    return {
      range: "late 19th to early 20th century",
      confidence: "Moderate",
      support,
      limitations,
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }

  if (transitionalFactoryScore >= 2) {
    return {
      range: "c. 1880–1935",
      confidence: "Moderate",
      support,
      limitations,
      upholstery_layer: upholsteryLayer,
      date_tightening_evidence: buildDateTighteningEvidence(digest),
    };
  }
  // 🧠 NEGATIVE EVIDENCE DATE FLOOR (CONSERVATIVE)

const dateFloorClues = new Set(digest.clue_keys || []);

const hasDateFloorClue = (...keys: string[]) =>
  keys.some((k) => dateFloorClues.has(k));

const earlySignals = [
  "hand_cut_dovetails",
  "hand_forged_nail",
  "pit_saw_marks",
  "rosehead_nail",
  "irregular_hand_joinery"
];

const modernSignals = [
  "wire_nail",
  "machine_dovetails",
  "plywood_structural",
  "phillips_screw",
  "staple_fastener",
  "modern_concealed_hinge"
];

const earlyCount = earlySignals.filter((key) => hasDateFloorClue(key)).length;
const modernCount = modernSignals.filter((key) => hasDateFloorClue(key)).length;

// If NO early evidence AND multiple modern indicators → set a floor
const hasStyle = (k: string) => (digest.clue_keys || []).includes(k);

const strongRevivalStructure =
  hasStyle("reeded_tapered_front_legs") ||
  hasStyle("fluted_turned_front_legs") ||
  hasStyle("saber_rear_legs") ||
  hasStyle("sabre_rear_legs") ||
  hasStyle("open_arm_construction") ||
  hasStyle("open_arm_design") ||
  hasStyle("shaped_apron");

const strongRevivalStyle =
  hasStyle("louis_xvi_neoclassical_style") ||
  hasStyle("neoclassical_louis_xvi_style") ||
  hasStyle("neoclassical_style_reference") ||
  hasStyle("medallion_oval_back") ||
  hasStyle("oval_medallion_back");
const dateFloorOverride =
  earlyCount === 0 &&
  (
    modernCount >= 2 ||
    (strongRevivalStructure && strongRevivalStyle)
  )
    ? {
        range: "c. 1930–present",
        confidence: "Moderate" as const,
      }
    : null;
  return {
    range:
      dateFloorOverride?.range ||
      (style ? "Broadly late 19th to 20th century" : "Broad, not tightly dated"),
    confidence: dateFloorOverride?.confidence || "Low",
    support,
    limitations: [
      ...limitations,
      "More construction, underside, back, or label evidence would refine the date.",
    ],
    upholstery_layer: upholsteryLayer,
    date_tightening_evidence: buildDateTighteningEvidence(digest),
  };
}
 
function valueBand(form: string, dateRange: string, digest?: EvidenceDigest) {
  let low = 25;
  let high = 300;

  const f = String(form || "").toLowerCase();
  const d = String(dateRange || "").toLowerCase();
  const clues = new Set(digest?.clue_keys || []);
  const text = `${digest?.perception?.raw_text || ""} ${(digest?.observations || [])
    .map((o) => `${o.clue || ""} ${o.description}`)
    .join(" ")}`.toLowerCase();

  const has = (...keys: string[]) => keys.some((k) => clues.has(k));
  const textHas = (...words: string[]) => words.some((w) => text.includes(w));
  // Negation-aware variant for condition dampeners. A sentence led by "no /
  // not / without / free of" describes ABSENCE of damage, not damage — e.g.
  // the structural_integrity observation "No visible broken joints, missing
  // stretchers, or collapsed structure" must NOT trigger a "missing/broken"
  // penalty on a structurally SOUND piece. Split on sentence boundaries and
  // skip any sentence carrying a leading negation cue.
  const NEGATION_CUES = ["no ", "not ", "without ", "free of ", "free from "];
  const textHasUnnegated = (...words: string[]) => {
    const sentences = text.split(/[.;]/);
    return words.some((w) =>
      sentences.some((s) => s.includes(w) && !NEGATION_CUES.some((n) => s.includes(n)))
    );
  };

  // Base form lanes
  if (f.includes("telephone bench")) {
    low = 60; high = 325;
  } else if (f.includes("cedar chest") || f.includes("roos") || f.includes("lane")) {
    low = 60; high = 300;
  } else if (f.includes("iron bed")) {
    low = 40; high = 225;
  } else if (f.includes("queen anne")) {
    low = 50; high = 300;
  } else if (f.includes("jacobean")) {
    low = 125; high = 550;
  } else if (f.includes("pedestal")) {
    low = 35; high = 175;
  } else if (f.includes("cabinet") || f.includes("dresser") || f.includes("drawers") || f.includes("chest of drawers")) {
    low = 75; high = 350;
  }

  // Date / age influence
  let ageFactor = 1;
  if (d.includes("1830") || d.includes("1860")) ageFactor *= 1.15;
  else if (d.includes("1870") || d.includes("1890") || d.includes("1910") || d.includes("1920")) ageFactor *= 1.08;
  else if (d.includes("post-1950") || d.includes("post-1960") || d.includes("1980")) ageFactor *= 0.75;

  // Sellability score: market reality, not theoretical appraisal value
  let sellability = 50;
  const factors: Array<{ label: string; delta: number; category: "material" | "construction" | "form" | "condition" | "style" }> = [];
  const bump = (label: string, delta: number, category: "material" | "construction" | "form" | "condition" | "style") => {
    sellability += delta;
    factors.push({ label, delta, category });
  };

  // Non-wood material adjustments
  if (has("molded_plastic", "acrylic_clear")) {
    low = Math.max(low, 30);
    high = Math.min(high, 300);
    bump("Molded plastic or acrylic construction", 5, "material");
  }

  if (has("laminate_surface", "formica_surface", "chrome_and_laminate")) {
    low = Math.max(low, 60);
    high = Math.min(high, 450);
    bump("Laminate or Formica surface (mid-century appeal)", 8, "material");
  }

  if (has("woven_body", "rattan_frame")) {
    low = Math.max(low, 75);
    high = Math.min(high, 500);
    bump("Woven body or rattan frame", 10, "material");
  }

  if (has("fully_upholstered", "visible_springs", "tufted_upholstery")) {
    low = Math.max(low, 75);
    high = Math.min(high, 600);
    bump("Upholstered construction", 6, "material");
  }

  if (has("metal_frame", "wrought_iron", "cast_iron", "brass_frame")) {
    low = Math.max(low, 50);
    high = Math.min(high, 400);
    bump("Metal frame (wrought iron, cast iron, or brass)", 6, "material");
  }

  if (has("tubular_steel", "chrome_frame")) {
    low = Math.max(low, 120);
    high = Math.max(high, 900);
    bump("Tubular steel or chrome frame (modernist appeal)", 12, "material");
  }

  if (has("glass_top")) {
    bump("Glass top", 2, "material");
  }

  if (has("laminate_surface") && has("molded_plastic")) {
    bump("Mixed budget materials (laminate + plastic)", -5, "material");
  }

  // Positive signals
  if (has("solid_wood_construction")) bump("Solid wood construction", 5, "construction");
  if (has("solid_plank_back")) bump("Solid plank back panel", 5, "construction");
  if (has("frame_and_panel_sides")) bump("Frame-and-panel side construction", 4, "construction");
  if (has("solid_wood_drawer_construction")) bump("Solid wood drawer construction", 4, "construction");
  if (has("maker_label", "roos_label", "lane_label")) bump("Maker label or branded mark present", 8, "construction");
  if (textHas("empire", "jacobean", "mission", "arts and crafts", "queen anne")) bump("Collectible style vocabulary (Empire / Jacobean / Mission / Arts & Crafts / Queen Anne)", 4, "style");
  if (textHas("unusual", "scarce", "rare", "highboy", "telephone")) bump("Unusual or scarce form noted", 5, "style");

  // Market dampeners
  if (f.includes("dresser") || f.includes("drawers") || f.includes("chest of drawers")) bump("Dresser / chest of drawers (oversupplied category)", -8, "form");
  if (textHasUnnegated("finish loss", "finish_worn", "worn finish", "water stain", "white haze")) bump("Finish loss, water staining, or white haze", -12, "condition");
  if (textHasUnnegated("scratches", "surface damage", "top_surface_damage", "top_surface_condition")) bump("Surface scratches or top damage", -8, "condition");
  if (textHasUnnegated("missing", "broken", "loose", "veneer loss", "structural damage")) bump("Missing / broken / loose parts or veneer loss", -15, "condition");
  // Painted-over / altered surface and heavy paint loss. The engine flags
  // these as clue keys; they were previously unpenalized because the text
  // dampeners above don't match "paint loss" / "repaint". An altered (over-
  // painted) finish forfeits original-surface value, and heavy paint loss is
  // a real condition hit — both depress resale even when the frame is sound.
  if (has("paint_loss_heavy")) bump("Heavy paint or finish loss", -12, "condition");
  if (has("refinished_surface", "multiple_paint_layers", "overpainted_surface", "repainted_surface"))
    bump("Altered / non-original (over)painted finish", -10, "condition");
  if (
    textHas("insect damage", "powder post", "powderpost", "woodworm", "wood rot", "dry rot", "wet rot", "rotted", "wood deterioration", "crumbling") ||
    Array.from(clues).some((k) => k.includes("insect") || k.includes("woodworm") || k.includes("wood_rot"))
  ) {
    bump("Insect damage or wood rot (structural integrity, restoration cost)", -15, "condition");
  }
  if (has("possible_plywood_or_laminated_panel")) bump("Possible plywood or laminated panel construction", -8, "construction");
  if (!has("hand_cut_dovetails", "machine_dovetails", "cut_nail", "wire_nail", "hand_forged_nail")) bump("No diagnostic joinery or fastener evidence", -5, "construction");

  const sellabilityRaw = sellability;
  sellability = clamp(sellability, 20, 90);
  const clampedNote = sellability !== sellabilityRaw
    ? (sellabilityRaw > 90 ? "Clamped at 90 (ceiling)" : "Clamped at 20 (floor)")
    : null;

  // Convert sellability into value pressure
  const marketFactor = 0.65 + sellability / 140;
  const finalLow = Math.round(low * ageFactor * marketFactor);
  const finalHigh = Math.round(high * ageFactor * marketFactor);

  const mid = (finalLow + finalHigh) / 2;

  return {
    dealer_buy: [
      Math.round(finalLow * 0.35),
      Math.round(finalLow * 0.75),
    ],
    quick_sale: [
      Math.round(finalLow * 0.65),
      Math.round(mid * 0.75),
    ],
    marketplace: [
      Math.round(mid * 0.65),
      Math.round(finalHigh * 0.9),
    ],
    as_found_retail: [
      Math.round(finalHigh * 0.8),
      Math.round(finalHigh * 1.15),
    ],
    restored_retail: [
      Math.round(finalHigh * 1.15),
      Math.round(finalHigh * 1.85),
    ],
    sellability_score: sellability,
    sellability_factors: factors,
    sellability_clamped_note: clampedNote,
    age_factor: ageFactor,
    market_factor: marketFactor,
  };
}

function buildDecisionGuidance(args: {
  gate: Phase1Gate;
  dating: any;
  form: any;
  conflict: any;
  valuation: any;
  digest: EvidenceDigest;
  intake: any;
}) {
  const { gate, form, conflict, valuation, digest, intake } = args;

  const text = `${digest.perception?.raw_text || ""} ${digest.observations
    .map((o) => `${o.clue || ""} ${o.description}`)
    .join(" ")} ${String(intake?.condition_notes || "")} ${String(intake?.known_alterations || "")}`.toLowerCase();

  const clues = new Set(digest.clue_keys || []);
  const has = (...keys: string[]) => keys.some((k) => clues.has(k));
  const textHas = (...words: string[]) => words.some((w) => text.includes(w));

  const negotiation: string[] = [];
  const selling: string[] = [];

  const addPair = (buyerTip: string, sellerTip: string) => {
    if (!negotiation.includes(buyerTip)) negotiation.push(buyerTip);
    if (!selling.includes(sellerTip)) selling.push(sellerTip);
  };

  negotiation.push("Verify the areas not shown in the photos before committing, especially underside, back, drawer corners, and fasteners.");
  selling.push("Use clear, level photos of the full form first, then add close-ups of construction, hardware, labels, and condition details.");

  if (gate.confidence_cap === "Low" || gate.confidence_cap === "Inconclusive") {
    addPair(
      "Use the limited evidence as negotiation leverage; the price should reflect that the identification and date are still broad.",
      "Reduce buyer hesitation by adding the missing evidence photos before listing, especially the strongest structural views."
    );
  } else if (gate.confidence_cap === "Moderate") {
    addPair(
      "Negotiate conservatively if the seller is pricing it as a confirmed antique without enough structural proof.",
      "Present the identification as evidence-supported but avoid overstating certainty beyond the visible construction clues."
    );
  } else {
    addPair(
      "The evidence is stronger than average, so negotiate from market reality rather than trying to dismiss the identification.",
      "Lead with the strongest confirmed evidence because it gives buyers confidence in the identification."
    );
  }

  if (textHas("finish loss", "worn finish", "water stain", "white haze", "scratches", "surface damage", "veneer loss", "missing", "broken", "loose", "structural damage")) {
    addPair(
      "Use visible wear, damage, missing parts, or loose structure as fair reasons to ask for a lower price.",
      "Do not frame condition problems as strengths; clean, stabilize, and photograph them honestly while emphasizing stronger form and construction features."
    );
  }

  if (textHas("refinished", "polyurethane", "later finish", "painted", "paint loss") || has("polyurethane")) {
    addPair(
      "If the surface appears refinished or later-treated, negotiate below prices for untouched original finish examples.",
      "Describe the surface honestly and focus the listing on form, usability, construction, and decorative appeal rather than original finish."
    );
  }

  if (textHas("replacement hardware", "replaced hardware", "hardware replacement") || has("phillips_screw", "staple_fastener", "modern_concealed_hinge")) {
    addPair(
      "Use modern or replacement hardware as a reason to avoid paying full original-period pricing.",
      "If hardware may be replaced, avoid calling it all original; instead, highlight the structure, form, and any hardware that is clearly period-appropriate."
    );
  }

  if (has("solid_wood_construction", "solid_plank_back", "frame_and_panel_sides", "hand_cut_dovetails", "machine_dovetails", "cut_nail", "wire_nail", "mortise_and_tenon")) {
    addPair(
      "Acknowledge the stronger construction evidence, but still compare the price to realistic local resale rather than theoretical antique value.",
      "Highlight the strongest construction clues in the listing because informed buyers respond to visible evidence."
    );
  }

  // Wood-primary pieces should not get metal-furniture tips just because an
  // incidental metal/glass clue fired (brass hinges/mounts, steel/enamel parts,
  // door glass → metal_frame/brass_frame/tubular_steel false twins). Gate the
  // metal block on the piece NOT being wood-primary (audit S009/S010/S014/S015/S017).
  const woodPrimary = isWoodPrimary(clues);
  if (
    has("metal_frame", "tubular_steel", "wrought_iron", "cast_iron", "brass_frame", "chrome_frame") &&
    !woodPrimary
  ) {
    addPair(
      "For metal furniture, check welds, bends, plating wear, rust, and structural looseness before agreeing to the price.",
      "For metal furniture, highlight clean lines, original finish or plating, stable joints, and any distinctive design features."
    );
  }

  if (has("fully_upholstered", "visible_springs", "tufted_upholstery")) {
    addPair(
      "For upholstered pieces, use fabric wear, odor risk, spring condition, and reupholstery cost as negotiation points.",
      "For upholstered pieces, photograph the full silhouette, legs, frame clues, tufting, fabric condition, and underside construction if accessible."
    );
  }

  if (has("woven_body", "rattan_frame", "cane_panels")) {
    addPair(
      "For wicker, rattan, or cane, negotiate based on breaks, sagging, missing strands, brittle areas, and repair difficulty.",
      "For wicker, rattan, or cane, highlight intact weaving, attractive shape, light weight, porch/sunroom appeal, and any unusual form."
    );
  }

  if (has("maker_label", "roos_label", "lane_label")) {
    addPair(
      "A maker label improves confidence, so focus negotiation more on condition, demand, and resale margin than on identity.",
      "Photograph the label clearly and mention it early in the listing because labels reduce buyer uncertainty."
    );
  }

  const formText = String(form?.display_form || form?.form || "").toLowerCase();

  if (formText.includes("dresser") || formText.includes("chest of drawers") || formText.includes("drawer case")) {
    addPair(
      "Large drawer cases can be slower to sell; use size, transport difficulty, and local demand as negotiation points.",
      "Measure it clearly and show scale; for drawer cases, buyers need to know it will fit and that drawers operate properly."
    );
  }

  if (formText.includes("telephone bench") || formText.includes("writing bench")) {
    addPair(
      "Because this is a niche form, negotiate based on how quickly you realistically expect to resell it.",
      "Use the unusual function as a selling hook; photograph the seat, back, and side writing or phone surface together."
    );
  }

  if (formText.includes("desk") || formText.includes("secretary") || formText.includes("roll-top") || formText.includes("slant-front")) {
    addPair(
      "Check writing surfaces, cubbies, hinges, and moving parts before paying; repairs can quickly reduce margin.",
      "Show the writing surface open and closed, plus interior compartments, because function drives buyer interest."
    );
  }

  if (formText.includes("table")) {
    addPair(
      "Check wobble, leaf movement, repairs, and top condition before agreeing to the price.",
      "Photograph the top, base, and any extension or leaf mechanism; table buyers care about stability and usable surface."
    );
  }

  const marketplace = valuation?.platform_breakdown?.marketplace?.range || valuation?.display;
  if (marketplace) {
    negotiation.push(`Use the marketplace lane as the practical ceiling for negotiation; this scan points to about ${marketplace} for typical resale exposure.`);
    selling.push(`Price near the realistic marketplace lane, about ${marketplace}, unless better photos or stronger evidence justify the upper end.`);
  }

  if (typeof valuation?.sellability_score === "number") {
    if (valuation.sellability_score < 45) {
      addPair(
        "Because sellability is weak, only buy if the price leaves room for a slow sale or added cleanup work.",
        "Improve sellability before listing with better photos, light cleaning, accurate measurements, and honest condition notes."
      );
    } else if (valuation.sellability_score >= 70) {
      addPair(
        "The piece appears reasonably sellable, so do not expect extreme discounts unless condition or transport issues are present.",
        "Lean into the piece’s strongest visual and evidence-supported features; they tend to attract buyer interest when priced realistically."
      );
    }
  }

  if (Array.isArray(conflict?.conflict_notes) && conflict.conflict_notes.length > 0) {
    addPair(
      "Use mixed evidence or possible restoration as a reason to stay below top-of-market pricing.",
      "Explain mixed evidence plainly; buyers trust listings that separate confirmed construction from possible later changes."
    );
  }

  if (negotiation.length < 4) {
    negotiation.push("Leave room for transportation, cleaning, small repairs, and the time it may take to resell.");
  }

  if (selling.length < 4) {
    selling.push("Include dimensions, clear condition photos, and the strongest identification evidence in the first few listing lines.");
  }

  return {
    negotiation_tips: uniq(negotiation).slice(0, 6),
    selling_tips: uniq(selling).slice(0, 6),
    contradiction_guard: "Buyer-facing weaknesses are framed as negotiation leverage; seller-facing weaknesses are framed as items to disclose, mitigate, or photograph honestly rather than as selling strengths.",
  };
}
/**
 * Normalized maker-mark shape used by engine.ts downstream paths
 * (matchMakerMarks + dating-anchor lookup at the maker-mark branch in
 * computeDatingEnvelope). Both the legacy 25-entry MAKER_MARKS array and
 * the new 77-entry MAKER_ENTRIES library adapt to this shape so downstream
 * code stays unchanged. Field shape mirrors the legacy schema verbatim
 * because consumers were written against it.
 */
type NormalizedMakerMark = {
  id: string;
  maker: string;
  mark_text_patterns: string[];
  mark_type: string;
  date_range: string;
  confidence_weight: number; // 0–1 scale
  dating_authority: "high" | "moderate" | "low";
  source_library: "legacy" | "canonical"; // diagnostic — which array supplied the entry

  // Path 3 (reasoning-rules wiring): rich-field passthrough from canonical
  // entries. Legacy entries leave these undefined.
  region?: string;
  false_positive_warnings?: string[];
  attribution_confidence_rule?: string;
};

/**
 * Adapter — translates a MakerMarkEntry (new canonical) or a
 * MakerMarkEntry_Legacy (legacy) into the NormalizedMakerMark shape.
 * Per Block 23a + path 1/2 minimum-viable wiring: enables downstream
 * consumption of all 77 canonical maker entries without changing the
 * legacy 25-entry array or any downstream consumer code.
 *
 * Field translation rules (canonical → normalized):
 *  - maker_name → maker
 *  - known_mark_types[0] → mark_type (first declared type)
 *  - period_associations[0] → date_range (period_label preferred; else
 *    "{date_floor}–{date_ceiling}" or "{date_floor}–present")
 *  - positive_authority → dating_authority + confidence_weight
 *    (8 or 9 → high / 0.8–0.9; 6 or 7 → moderate / 0.6–0.7; else low)
 */
function normalizeMakerMark(entry: any): NormalizedMakerMark {
  // Legacy entries have a 'maker' field; canonical entries have 'maker_name'.
  if (typeof entry?.maker === "string" && typeof entry?.maker_name === "undefined") {
    return {
      id: entry.id,
      maker: entry.maker,
      mark_text_patterns: entry.mark_text_patterns || [],
      mark_type: entry.mark_type || "unknown",
      date_range: entry.date_range || "uncertain",
      confidence_weight: typeof entry.confidence_weight === "number" ? entry.confidence_weight : 0.5,
      dating_authority: entry.dating_authority || "moderate",
      source_library: "legacy",
    };
  }

  // Canonical MakerMarkEntry — derive legacy fields from new schema. A maker's
  // date_range must span its FULL active life, not just the first sub-period: a
  // firm like Globe-Wernicke carries several mark-form periods (1899–1915 paper
  // label, 1916–1930 stamp, 1930–1955 continuing), and the piece could be from
  // any of them. So aggregate across ALL period_associations: floor = earliest,
  // ceiling = latest — and if any period is open-ended (firm still active),
  // report a floor-only "post-<floor>" (terminus post quem).
  const periods: any[] = Array.isArray(entry?.period_associations) ? entry.period_associations : [];
  // Aggregate only the maker's OWN production periods. A revival/style/repro
  // sub-period (e.g. Phyfe's "Phyfe-style revival period" 1880–1940) is when
  // OTHERS made pieces in the maker's manner — a piece bearing the actual mark
  // is from the maker's own production, so those periods must not widen its span.
  const ownProduction = periods.filter(
    (p) => !/revival|reproduction|\bstyle\b|centennial|afterwave|aftermarket/i.test(String(p?.period_label || ""))
  );
  const usePeriods = ownProduction.length ? ownProduction : periods;
  const periodFloors = usePeriods.map((p) => p?.date_floor).filter((n: any): n is number => typeof n === "number");
  const periodCeilings = usePeriods.map((p) => p?.date_ceiling).filter((n: any): n is number => typeof n === "number");
  const anyOpenCeiling = usePeriods.some((p) => typeof p?.date_floor === "number" && typeof p?.date_ceiling !== "number");
  const minFloor = periodFloors.length ? Math.min(...periodFloors) : null;
  const maxCeiling = periodCeilings.length ? Math.max(...periodCeilings) : null;
  const date_range =
    minFloor == null
      ? (usePeriods[0]?.period_label && String(usePeriods[0].period_label).trim() ? String(usePeriods[0].period_label) : "uncertain")
      : anyOpenCeiling || maxCeiling == null
        ? `post-${minFloor}`
        : `${minFloor}–${maxCeiling}`;

  const auth = typeof entry?.positive_authority === "number" ? entry.positive_authority : 7;
  const dating_authority: "high" | "moderate" | "low" =
    auth >= 8 ? "high" : auth >= 6 ? "moderate" : "low";
  const confidence_weight = Math.max(0.5, Math.min(0.95, auth / 10));

  return {
    id: entry.id,
    maker: entry.maker_name || "Unknown maker",
    mark_text_patterns: Array.isArray(entry.mark_text_patterns) ? entry.mark_text_patterns : [],
    mark_type: Array.isArray(entry.known_mark_types) && entry.known_mark_types.length > 0
      ? String(entry.known_mark_types[0])
      : "unknown",
    date_range,
    confidence_weight,
    dating_authority,
    source_library: "canonical",
    region: typeof entry.region === "string" ? entry.region : undefined,
    false_positive_warnings: Array.isArray(entry.false_positive_warnings) && entry.false_positive_warnings.length > 0
      ? entry.false_positive_warnings.slice()
      : undefined,
    attribution_confidence_rule: typeof entry.attribution_confidence_rule === "string" && entry.attribution_confidence_rule.trim().length > 0
      ? entry.attribution_confidence_rule
      : undefined,
  };
}

/**
 * Look up a maker entry by id across both libraries. Returns normalized
 * shape or null. Canonical (new) library is checked first so new entries
 * take precedence when ids overlap (none currently do — legacy ids start
 * with 'globe_wernicke_', 'hitchcock_', etc.; new ids start with
 * 'maker_mark_' — but the precedence rule is explicit for safety).
 */
function findMakerMarkById(id: string): NormalizedMakerMark | null {
  if (!id) return null;
  const canonical = MAKER_ENTRIES.find((e) => e.id === id);
  if (canonical) return normalizeMakerMark(canonical);
  const legacy = MAKER_MARKS.find((m) => m.id === id);
  if (legacy) return normalizeMakerMark(legacy);
  return null;
}

/**
 * Returns the first pattern (verbatim from mark_text_patterns) that
 * appears as substring in the raw text. Used by matchMakerMarks to know
 * WHICH pattern fired so attribution rules can introspect the match.
 */
function findMatchingPattern(text: string, patterns: string[]): string | null {
  const lowerText = String(text || "").toLowerCase();
  const isWordChar = (c: string) => /[a-z0-9]/.test(c);
  for (const pattern of patterns || []) {
    const p = String(pattern || "");
    const lp = p.toLowerCase();
    if (!lp) continue;
    // Word-boundary substring match: the matched span must not be flanked by
    // alphanumeric characters. A short pattern like "sligh" then matches the word
    // "sligh" / "Sligh Furniture" but NOT inside "slight"/"slightly"; "manufacturer"
    // still matches the standalone word. Internal punctuation in a pattern
    // (e.g. "charles r. sligh", "globe-wernicke") is unaffected — only the OUTER
    // boundaries are checked. Fixes the M12 substring false-positive family.
    let from = 0;
    while (from <= lowerText.length) {
      const idx = lowerText.indexOf(lp, from);
      if (idx < 0) break;
      const before = idx > 0 ? lowerText[idx - 1] : "";
      const after = idx + lp.length < lowerText.length ? lowerText[idx + lp.length] : "";
      if ((!before || !isWordChar(before)) && (!after || !isWordChar(after))) return p;
      from = idx + 1;
    }
  }
  return null;
}

/**
 * Heuristic: does this string look like initials, monogram, or 2-3 character
 * abbreviation? Per Universal Rule #2 (Initials Are Not Enough). Examples
 * that match: "GW", "G.W.", "G W", "B&G", "JHB". Examples that don't:
 * "Globe-Wernicke", "Berkey & Gay", "Lane Co".
 */
function looksLikeInitials(s: string): boolean {
  const trimmed = String(s || "").trim();
  if (trimmed.length === 0) return false;
  if (trimmed.length > 6) return false;
  // Strip common punctuation and whitespace, then count alphanumeric chars
  const stripped = trimmed.replace(/[.\s&\-_/\\]/g, "");
  if (stripped.length === 0) return false;
  if (stripped.length > 4) return false;
  // Should be all letters (initials) — digits suggest serial/model, not initials
  if (!/^[A-Za-z]+$/.test(stripped)) return false;
  return true;
}

/**
 * Path 3 wiring — MAKER_ATTRIBUTION_REASONING_RULES applied to a text
 * match. Implements the two most concrete universal rules:
 *
 *   - Universal Rule #2 (Initials Are Not Enough) — demotes any match
 *     where the matched pattern is initials-like (≤4 letters, no full
 *     word) to LOW confidence with explicit caveat
 *   - Globe-Wernicke Attribution Correction (Rule #8) — operationalized
 *     specific case of Rule #2 for Globe-Wernicke; if the entry is the
 *     Globe-Wernicke canonical AND the match is initials-only ("GW",
 *     "G.W.", "G W"), apply the Globe-Wernicke-specific caveat from the
 *     seed rule_statement
 *
 * Other Universal Rules (City Not Maker, Association Not Single, Retail
 * Not Maker, Line Name Not Maker) require static pattern lists that are
 * not yet authored in the canonical library; left as pass-through for
 * Path 4 data-authoring task. Per-entry false_positive_warnings carry
 * maker-specific operationalizations meanwhile.
 *
 * Returns the demotion outcome: a new mark with adjusted confidence/
 * authority, plus a caveat string and rule_name for traceability.
 */
type AttributionGuardResult = {
  mark: NormalizedMakerMark;
  rule_applied: string | null;
  caveat: string | null;
  attribution_suppressed: boolean;
};

function applyMakerAttributionRules(
  matchedPattern: string,
  mark: NormalizedMakerMark
): AttributionGuardResult {
  const trimmed = String(matchedPattern || "").trim();

  // Rule #8 — Globe-Wernicke specific correction (most specific, check first)
  if (
    mark.id.includes("globe_wernicke") &&
    looksLikeInitials(trimmed)
  ) {
    return {
      mark: {
        ...mark,
        confidence_weight: 0.25,
        dating_authority: "low",
      },
      rule_applied: "Globe-Wernicke Attribution Correction",
      caveat: `Detected initials "${trimmed}" alone are insufficient for Globe-Wernicke attribution. Initials may appear as monogram, owner mark, drawer chalk mark, shipping mark, or retailer code. Globe-Wernicke attribution requires full Globe-Wernicke wording, a recognized label or tag, or maker-specific sectional bookcase evidence (sectional stacking system, distinctive hardware, characteristic placement).`,
      attribution_suppressed: true,
    };
  }

  // Rule #2 — Universal Initials Not Enough (general case)
  if (looksLikeInitials(trimmed)) {
    return {
      mark: {
        ...mark,
        confidence_weight: Math.min(mark.confidence_weight, 0.3),
        dating_authority: "low",
      },
      rule_applied: "Universal Rule: Initials Are Not Enough",
      caveat: `Detected initials "${trimmed}" alone do not establish ${mark.maker} attribution. Initials may identify a maker only when they appear within a known maker-specific device, label, stencil, burn mark, paper tag, or model-code format. Surface as low-confidence pending full maker name, branded device, or supporting construction-and-form evidence.`,
      attribution_suppressed: true,
    };
  }

  // Pass-through: match is substantive (full name, known device, or
  // characteristic wording). Confidence and authority preserved from
  // the canonical entry's positive_authority calibration.
  return {
    mark,
    rule_applied: null,
    caveat: null,
    attribution_suppressed: false,
  };
}

/**
 * Confidence Ladder (Rule #7) — maps a NormalizedMakerMark + match
 * substantiveness to one of four tiers: HIGH / MEDIUM / LOW / CONFLICT.
 * Per seed app-safe maker mark confidence ladder. Returns the tier
 * label + a one-line evidence basis citation suitable for report prose.
 *
 * Conflict tier is reserved for downstream callers that have access to
 * construction/material evidence and can detect mark-vs-construction
 * mismatches; this function returns HIGH/MEDIUM/LOW based on the mark
 * alone. Conflict detection lives in computeDatingEnvelope.
 */
function makerConfidenceLadderTier(
  mark: NormalizedMakerMark,
  attributionSuppressed: boolean
): { tier: "HIGH" | "MEDIUM" | "LOW"; basis: string } {
  if (attributionSuppressed) {
    return {
      tier: "LOW",
      basis: "Attribution rule applied; initials/partial match alone is insufficient for confident attribution.",
    };
  }
  if (mark.dating_authority === "high" && mark.confidence_weight >= 0.85) {
    return {
      tier: "HIGH",
      basis: "Full maker name or known maker-specific device matched; date range derived from canonical period associations.",
    };
  }
  if (mark.dating_authority === "high" || mark.confidence_weight >= 0.7) {
    return {
      tier: "MEDIUM",
      basis: "Partial label match or moderate-confidence canonical entry; full attribution requires additional construction or form evidence.",
    };
  }
  return {
    tier: "LOW",
    basis: "Weak or ambiguous match; treat as candidate evidence pending confirmation.",
  };
}

export function matchMakerMarks(rawText: string, observations: any[] = []) {
  const text = String(rawText || "").toLowerCase();
  if (!text) return [];
   // 🔒 HARD GUARD: only allow maker mark detection if valid label/text evidence exists
  const hasValidLabelEvidence = observations.some((obs) =>
    obs.type === "label" ||
    obs.source_image === "label_makers_mark" ||
    obs.source_image === "phase0_visible_text"
  );

  if (!hasValidLabelEvidence) return [];

  // Path 1+2 minimum-viable wiring (Block 23a follow-up): scan BOTH the
  // canonical 77-entry MAKER_ENTRIES library and the legacy 25-entry
  // MAKER_MARKS array. Canonical first so new entries take precedence when
  // a maker_name collision exists; legacy fallback ensures any maker still
  // only present in the old shim continues working.
  //
  // Path 3 (reasoning-rules wiring): for each match we now track WHICH
  // pattern fired (via findMatchingPattern) so applyMakerAttributionRules
  // can introspect the match and demote/qualify low-specificity matches
  // per Universal Rule #2 (Initials Are Not Enough) and Rule #8
  // (Globe-Wernicke Correction).
  type Matched = { mark: NormalizedMakerMark; matched_pattern: string };

  const canonicalMatches: Matched[] = [];
  for (const entry of [...MAKER_ENTRIES, ...AUTHORED_MAKER_ENTRIES]) {
    const patterns = Array.isArray((entry as any).mark_text_patterns)
      ? ((entry as any).mark_text_patterns as string[])
      : [];
    const matched = findMatchingPattern(text, patterns);
    if (matched) {
      canonicalMatches.push({ mark: normalizeMakerMark(entry), matched_pattern: matched });
    }
  }

  const legacyMatches: Matched[] = [];
  for (const legacy of MAKER_MARKS) {
    const matched = findMatchingPattern(text, legacy.mark_text_patterns);
    if (matched) {
      legacyMatches.push({ mark: normalizeMakerMark(legacy), matched_pattern: matched });
    }
  }

  // Dedupe by maker+id combo (canonical first; legacy duplicates skipped
  // when same id appears in both, which currently it never does — legacy
  // ids start with maker name, canonical ids start with 'maker_mark_').
  const seenMakers = new Set<string>();
  const combined: Matched[] = [];
  for (const m of [...canonicalMatches, ...legacyMatches]) {
    const dedupeKey = `${m.mark.maker.toLowerCase()}::${m.mark.id}`;
    if (seenMakers.has(dedupeKey)) continue;
    seenMakers.add(dedupeKey);
    combined.push(m);
  }

  return combined.map(({ mark, matched_pattern }) => {
    // Path 3: apply attribution rules to the matched pattern
    const guarded = applyMakerAttributionRules(matched_pattern, mark);
    const finalMark = guarded.mark;
    const ladder = makerConfidenceLadderTier(finalMark, guarded.attribution_suppressed);

    // Description differs by suppression state. Suppressed attributions
    // surface as candidate evidence with the rule caveat rather than as
    // "Detected maker mark." This prevents the report from confidently
    // attributing on initials-alone matches.
    const description = guarded.attribution_suppressed && guarded.caveat
      ? `Possible ${finalMark.maker} match (low confidence; ${ladder.tier} per Confidence Ladder). ${guarded.caveat}`
      : `Detected maker mark: ${finalMark.maker}. Mark type: ${finalMark.mark_type}. Dating reference: ${finalMark.date_range}. Confidence tier: ${ladder.tier}.`;

    return {
      type: "label",
      clue: finalMark.id,
      description,
      confidence: Math.round(finalMark.confidence_weight * 100),
      source_image: "phase0_visible_text",
      hard_negative: false,
      low_confidence_flag: finalMark.confidence_weight < 0.7,
    };
  });
}
export const PE = {
  async callClaude(
    system: string,
    content: any[],
    mode: "field_scan" | "full_analysis",
    maxTokensOverride?: number
  ): Promise<ClaudeResult> {
    const max_tokens = maxTokensOverride ?? (mode === "full_analysis" ? 16000 : 8000);
    // temperature: 0 keeps observations ~90-95% reproducible across runs (vs
    // ~50-70% at the API default of 1.0), which an evidence-driven appraisal
    // needs. Caching marks the ~51.5K-token static reference block as an
    // ephemeral cached prefix; images + intake follow in `messages`, so they
    // don't invalidate it (Field and Full share one cache entry).
    const requestBody = JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens,
      temperature: 0,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content }],
    });

    // Transient infrastructure failures (429 rate-limit, 529 overload, 5xx, and
    // network/transport throws) are retried with short backoff, so a momentary
    // blip is NOT reported to the user as "your photos weren't good enough".
    // Deterministic failures (other 4xx, unparseable JSON) return immediately —
    // retrying only burns tokens. Every error is tagged with the HTTP status +
    // API error type so callers can tell an infra failure from an empty read.
    const isTransientStatus = (s: number) => s === 429 || s === 529 || (s >= 500 && s < 600);
    const MAX_ATTEMPTS = 3;
    let lastError: any = "unknown_error";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
          body: requestBody,
        });
        if (res.status === 413) {
          const err = new Error("Payload too large");
          err.name = "PayloadTooLargeError";
          throw err;
        }
        const data = await res.json();
        if (res.ok) {
          const raw = Array.isArray(data?.content) ? data.content.map((b: any) => b?.text || "").join("\n") : "";
          const parsed = parseModelJson(raw);
          if (parsed) return { ok: true, parsed, raw };
          return { ok: false, error: { type: "no_valid_json", raw } };
        }
        lastError = {
          type: "api_error",
          status: res.status,
          api_error_type: data?.error?.type ?? data?.type ?? null,
          message: data?.error?.message ?? null,
        };
        if (isTransientStatus(res.status) && attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 700 * attempt));
          continue;
        }
        return { ok: false, error: lastError };
      } catch (e: any) {
        if (e?.name === "PayloadTooLargeError") throw e;
        // A thrown fetch is a network/transport failure — transient by nature.
        lastError = { type: "network_error", message: e?.message || "unknown_error" };
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 700 * attempt));
          continue;
        }
        return { ok: false, error: lastError };
      }
    }
    return { ok: false, error: lastError };
  },

  imgs(images: any[]) {
    const out: any[] = [];
    for (const img of images || []) {
      if (!img?.data_url) continue;
      const [head, base] = String(img.data_url).split(",");
      const mediaType = head?.match(/data:(.*?);/)?.[1] || "image/jpeg";
      out.push({ type: "image", source: { type: "base64", media_type: mediaType, data: base } });
      out.push({ type: "text", text: `[Image type: ${img.image_type || "unknown"}]` });
    }
    return out;
  },

  async p0(caseData: any, images: any[], intake: any, onPhase?: any) {
    const system = `
You are the Phase 0 evidence scanner for New Creations Woodcraft.

You scan the submitted photos ONE TIME ONLY.

Your job is NOT final identification or valuation.
Your job is to extract and store visible evidence in a structured way so later phases can reason from it.

Return JSON only.

You MUST return this exact structure:

{
  "perception": {
    "labels": [],
    "maker_names": [],
    "materials": [],
    "forms": [],
    "functional_features": [],
    "style_cues": [],
    "construction_cues": [],
    "condition_cues": [],
    "visible_text": []
  },
  "observations": [
    {
      "category": "form | function | structure | material | hardware | style | label | condition | construction",
      "key": "short_snake_case_key",
      "value": "visible fact or true/false",
      "description": "plain evidence statement",
      "confidence": 0-100,
      "source_image": "overall_front | overall_side | underside | back | hardware_closeup | joinery_closeup | label_makers_mark | unknown",
      "hard_negative": false
    }
  ]
}

Minimum evidence contract:
Even when uncertain, you MUST return low-confidence observations rather than an empty list.

Always check for and report:

FORM SIGNALS:
- seating surface
- flat surface
- secondary surface
- backrest
- side rails
- vertical supports
- drawers
- doors
- shelves
- mirror
- pedestal / column
- bed rails / headboard / footboard

FORM-DEFINING STRUCTURAL FEATURES (look carefully — these are highest-
priority structural identifiers that resolve form ambiguity. Use the
preferred key whenever the feature is visible, even if also visible
inside or alongside other forms):
- cylinder roll-top or tambour roll-top closure (curved/cylindrical
  rotating closure over writing surface; common on bureau à cylindre
  desks; the cylinder itself is the form-defining feature even when
  letter slots / pigeonholes are visible inside)
  → key: cylinder_roll
- slant-front writing surface (angled hinged writing flap, characteristic
  of slant-front desks)
  → key: slant_front
- drop-front desk (vertical writing surface that hinges down to horizontal,
  characteristic of secretary desks; distinct from cylinder closure)
  → key: drop_front_desk
- pigeonholes / interior cubbies / letter slots (compartmented interior
  visible inside a desk; can occur inside cylinder, slant-front, OR
  drop-front desks — does not by itself determine form)
  → key: pigeonholes
- drop-leaf hinged construction (table with hinged side leaves that
  fold down; defines drop-leaf table form)
  → key: drop_leaf_hinged
- gateleg support (pivoting leg structure swings out to support a
  drop leaf; defines gateleg table form)
  → key: gateleg_support
- extension mechanism (table that extends with inserted leaves)
  → key: extension_mechanism
- pedestal column or central pedestal base
  → key: pedestal_column
- lift-lid or hinged-top chest construction (defines blanket chest
  and storage chest forms)
  → key: lift_lid
- multiple stacked drawers in single case (defines chest-of-drawers
  form vs single drawer cases)
  → key: multiple_drawer_case
- metal bed frame structural members (iron, brass, or steel BED
  components — only when the piece is clearly a bed: mattress
  platform, headboard/footboard, side rails meant to support a
  mattress. Do NOT emit for chairs, tables, stools, desks, or
  other metal-framed furniture even when iron/steel structure is
  visible. If the metal frame is clearly part of a non-bed form,
  use metal_frame instead.)
  → key: metal_bed_frame
- telephone shelf / telephone bench shelf (defines telephone
  bench/stand form)
  → key: telephone_shelf
- cedar lining (aromatic red cedar interior; defines cedar/hope
  chest form)
  → key: cedar_lining

CRITICAL: When multiple form-defining features are visible (e.g., cylinder
closure WITH interior pigeonholes), emit ALL of them as separate
observations — the engine reasons about which is form-defining vs
sub-feature based on combinatorial rules. Do NOT suppress a cylinder
observation because pigeonholes are also visible inside.

FUNCTION SIGNALS:
- sitting
- writing
- storage
- display
- sleeping
- telephone use
- grooming / dressing
- mechanical function

STRUCTURAL SIGNALS:
- legs
- rails
- stretchers
- spindles
- backrest
- hinges
- panels
- frame members
- visible joinery
- visible fasteners

JOINERY EVIDENCE (look carefully at drawer corners, case corners, drawer bottoms, panel attachments):
- hand-cut dovetails (irregular spacing, slightly uneven angles, hand-marked scribe lines visible)
  → key: hand_cut_dovetails
- machine dovetails (uniform spacing and angles, perfectly identical pins/tails)
  → key: machine_dovetails
- dowel joinery (visible dowel ends or round-peg construction at joints)
  → key: dowel_joinery
- mortise-and-tenon (visible rectangular tenon ends, pegged joints)
  → key: mortise_and_tenon
- welded joints (continuous metal-to-metal weld bead between frame members; common on industrial metal furniture)
  → key: welded_joint
- frame-and-panel side construction (rail-and-stile framework holding floating panel)
  → key: frame_and_panel_sides
- solid plank back (single solid board back rather than plywood sheet)
  → key: solid_plank_back

FASTENER EVIDENCE (look at drawer sides, drawer bottom attachment, back panel, hardware mounts):
- hand-forged nails (irregular hammered heads, square shanks, pre-industrial)
  → key: hand_forged_nail
- cut nails (tapered rectangular cross-section, machine-cut from sheet, 1790s-1890s)
  → key: cut_nail
- wire nails (round shanks, uniform machine-made, post-1880)
  → key: wire_nail
- phillips-head screws (cross-recess heads; HARD NEGATIVE for any pre-1934 claim)
  → key: phillips_screw  (set hard_negative: true)
- staple fasteners (U-shaped wire staples used structurally; HARD NEGATIVE for any pre-1945 claim)
  → key: staple_fastener  (set hard_negative: true)
- slotted screws (single horizontal slot head; common across 19th-20th century)
  → key: slotted_screw

TOOLMARK EVIDENCE (look at secondary surfaces, drawer bottoms, back panels, undersides):
- pit-saw marks (irregular diagonal saw kerfs, hand-sawn, pre-1830)
  → key: pit_saw_marks
- circular saw marks (curved arc patterns, post-1830 milling)
  → key: circular_saw_arcs
- band saw lines (straight parallel cuts, post-1870)
  → key: band_saw_lines
- hand-plane chatter or scallops (subtle ridges from hand planing, pre-1880)
  → key: hand_plane_chatter

FINISH EVIDENCE (look at all visible wood surfaces):
- shellac crazing (fine network of cracks in original surface; 1800-1920)
  → key: shellac_crazing
- intact shellac (warm amber surface, no plastic feel)
  → key: shellac_intact
- polyurethane (thick plastic-like film; HARD NEGATIVE for pre-1960 surface, indicates later refinish or modern)
  → key: polyurethane
- lacquer finish (smooth, harder than shellac; common mid-century)
  → key: lacquer_finish
- painted metal finish (enamel or industrial paint on metal frame, often pastel mid-century colors)
  → key: painted_metal_finish
- refinished surface (uniform modern coating over what should be aged original)
  → key: refinished_surface

HARDWARE EVIDENCE (look at pulls, hinges, locks, casters, mechanisms):
- porcelain caster (white/cream ceramic wheel; 1830-1900)
  → key: porcelain_caster
- modern caster (rubber, plastic, or metal wheel; post-1900)
  → key: modern_caster
- decorative bail pull (curved brass swing handle on a backplate)
  → key: decorative_bail_pull
- turned wooden knob / round wood knob
  → key: round_wood_knob
- modern concealed cup hinge (cylindrical European-style cup hinge; HARD NEGATIVE for pre-1950)
  → key: modern_concealed_hinge  (set hard_negative: true)
- swivel mechanism (rotating seat or top with circular swivel plate visible)
  → key: swivel_mechanism
- height adjustment mechanism (perforated bracket, ratchet, or pin-and-hole adjuster)
  → key: height_adjustment_mechanism
- stamped metal bracket (industrially-stamped sheet-metal support)
  → key: stamped_metal_bracket
- lock escutcheons (decorative keyhole plates)
  → key: lock_escutcheons

UPHOLSTERY EVIDENCE (look at any visible upholstery — under cushions, on
exposed springs, deck visible when cushions removed, frame attachment
points, cover material on seat/back/arms):

REQUIRED — cover material identification: If ANY upholstered surface is
visible in the photos, you MUST classify the cover material using one of
the cover keys below (velvet_cover, damask_cover, haircloth_cover,
leather_cover, vinyl_cover, chintz_cover, needlepoint_cover, brocade_cover,
jacquard_cover). If uncertain between two, pick the best fit and note the
uncertainty in the observation description. Saying "upholstered surfaces
are visible" without classifying the cover material is insufficient — it
produces broad date envelopes and inconclusive reports. Velvet specifically:
smooth lustrous pile fabric, often with sheen; CUT-PILE vs UNCUT-PILE
contrast can create stripes or figured patterns — striped or figured velvet
is still velvet_cover (common in mid-century reupholstery, 1950s–1970s).

REQUIRED — tufting identification: If tufting (regular dimples across the
cushion surface) is visible, examine whether the dimples are held by
covered buttons. If yes → key: button_tufting. If dimples are held by
stitches with no visible buttons → still set button_tufting and note
"stitch-tufted, no buttons" in the description. Do not describe tufting
without classifying it.

- coil springs visible under seat (individual upright metal coils)
  → key: coil_spring (or hand_tied_coil_spring if hand-tied with twine)
- serpentine / sinuous / zigzag spring (horizontal continuous wire)
  → key: serpentine_spring
- drop-in spring unit (factory-assembled cushion spring pack)
  → key: drop_in_spring_unit
- marshall / pocket coil springs (springs in individual fabric pockets)
  → key: marshall_pocket_coil
- no-spring seat construction (stuffed seat without spring lift)
  → key: no_spring_seat
- jute / linen / hemp webbing (natural-fiber strap support)
  → key: jute_webbing
- elastic webbing (rubber/synthetic stretch strap)
  → key: elastic_webbing
- horsehair stuffing (curly black hair stuffing visible at tears or under deck)
  → key: horsehair_stuffing
- cotton batting (white fluffy cotton layer)
  → key: cotton_batting
- foam padding generic (modern foam cushion)
  → key: foam_padding
- polyurethane foam (yellow or white synthetic foam)
  → key: polyurethane_foam
- feather / down fill (loose feather cushion fill)
  → key: feather_down_fill
- button tufting (deep regular buttoned indentations)
  → key: button_tufting
- decorative nailhead trim (visible row of brass nails along upholstery edge)
  → key: nailhead_trim
- hand tacks (cut nails or upholstery tacks securing fabric to frame, pre-staple era)
  → key: hand_tacks
- staples for upholstery attachment (machine staples securing fabric; HARD NEGATIVE for pre-1945 ORIGINAL upholstery, but commonly seen on reupholstered antique frames)
  → key: upholstery_staple_construction
- velvet cover (smooth pile fabric, often with sheen)
  → key: velvet_cover
- damask cover (woven figured pattern in single color, reversible)
  → key: damask_cover
- haircloth / horsehair cover (stiff black horsehair-woven cover, characteristic Victorian)
  → key: haircloth_cover
- leather cover (genuine leather)
  → key: leather_cover
- vinyl / faux leather cover (synthetic; common 1950s+)
  → key: vinyl_cover
- chintz cover (printed glazed cotton)
  → key: chintz_cover
- needlepoint cover (hand-stitched needlework)
  → key: needlepoint_cover
- brocade cover (multi-color woven figured fabric)
  → key: brocade_cover
- jacquard cover (machine-loomed figured fabric)
  → key: jacquard_cover

WOOD / SUBSTRATE EVIDENCE (look at drawer bottoms, case backs, secondary surfaces):
- structural plywood (multi-ply laminated panel; HARD NEGATIVE for pre-1920 case construction)
  → key: plywood_structural  (set hard_negative: true)
- plywood drawer bottom (multi-ply panel as drawer bottom; HARD NEGATIVE for pre-1920)
  → key: plywood_drawer_bottom  (set hard_negative: true)
- bent or molded plywood (curved/shaped plywood seat shell or backrest; mid-century)
  → key: bent_molded_plywood
- cedar lining (aromatic red cedar interior, characteristic of hope/blanket chests)
  → key: cedar_lining
- thick veneer (visibly thick veneer cuts, pre-rotary-veneer era)
  → key: thick_veneer
- solid wood construction (single solid board, not laminated)
  → key: solid_wood_construction

Important reasoning rules:
- Functional features outrank storage features.
- Do not call a telephone bench or secretary combination a dresser just because drawers are present.
- A bench seat + raised writing/phone surface + backrest should be captured as possible telephone/writing bench evidence.
- A drop-front writing surface or cubbies should be captured as secretary/desk evidence.
- Labels and maker marks are highest-authority evidence.
- Use low confidence if uncertain, but do not omit visible form evidence.
- ALWAYS use the preferred keys above when the evidence is visible. The keys are how the engine routes observations to dating envelopes.
- It is better to use a preferred key with low confidence than to use no key at all.
- Multiple keys may apply to a single piece — emit each as a separate observation.
- Regional / national origin (e.g. "Danish", "Italian", "French") is NOT established by form or style vocabulary alone. When a piece reads as Scandinavian-influenced, Continental, etc., describe the design INFLUENCE rather than asserting a country of manufacture, and note that domestic / American commercial production of the same look is usually equally possible. Only attribute a specific country of origin when a maker's label, stamp, or documented provenance supports it.
- Material identification from a distance is provisional. For cover materials especially (vinyl_cover vs a very smooth woven fabric; leather vs faux leather/bonded leather), keep confidence at moderate or lower unless a close-up shows texture, grain, sheen, seams, or wear that confirms it — and name the alternative material in the description. Still emit the best-fit cover key (see the upholstery contract above); just calibrate confidence and state the uncertainty.

Preferred form-signal keys:
seating_surface, backrest_present, spindle_back, secondary_surface, writing_surface, telephone_shelf, drop_front_desk, pigeonholes, mirror_present, drawer_present, door_present, open_shelving, pedestal_column, metal_bed_frame, armchair_form, cabriole_leg, barley_twist, clock_case_form, roos_label, lane_label, maker_label.

Preferred clock-evidence keys (use whenever the piece is a clock — mantel, shelf, kitchen, parlor, tall case, or wall clock):
clock_case_form (any clock case), arched_glazed_dial_door (round-top/arch-top mantel clock, c. 1870-1910), turned_spindle_gallery (Victorian gingerbread, c. 1875-1900), scrolled_side_corbels (Victorian shelf clock ornament, c. 1870-1900), reverse_painted_lower_tablet (American Victorian shelf clock, c. 1850-1900), winding_arbors (2 = 8-day time-and-strike, 1 = time-only, 3 = time-strike-chime), striking_mechanism (mechanical strike train), pendulum_bob_cast (decorative cast brass pendulum bob, c. 1860-1910), brass_dial_bezel (American mantel clock, c. 1860-1920), roman_numeral_dial (Roman numerals on paper/enamel dial, pre-1920 dominant), metal_hands (steel or blued-steel clock hands).

Preferred evidence-library keys (use whenever the evidence is visible):
hand_cut_dovetails, machine_dovetails, dowel_joinery, mortise_and_tenon, welded_joint, frame_and_panel_sides, solid_plank_back, hand_forged_nail, cut_nail, wire_nail, phillips_screw, staple_fastener, slotted_screw, pit_saw_marks, circular_saw_arcs, band_saw_lines, hand_plane_chatter, shellac_crazing, shellac_intact, polyurethane, lacquer_finish, painted_metal_finish, refinished_surface, porcelain_caster, modern_caster, decorative_bail_pull, round_wood_knob, modern_concealed_hinge, swivel_mechanism, height_adjustment_mechanism, stamped_metal_bracket, lock_escutcheons, plywood_structural, plywood_drawer_bottom, bent_molded_plywood, cedar_lining, thick_veneer, solid_wood_construction, sheet_back_panel.

Preferred upholstery-evidence keys (Block 12 — use whenever the piece has visible upholstery):
coil_spring, hand_tied_coil_spring, serpentine_spring, drop_in_spring_unit, marshall_pocket_coil, no_spring_seat, jute_webbing, elastic_webbing, horsehair_stuffing, cotton_batting, foam_padding, polyurethane_foam, feather_down_fill, button_tufting, nailhead_trim, hand_tacks, upholstery_staple_construction, velvet_cover, damask_cover, haircloth_cover, leather_cover, vinyl_cover, chintz_cover, needlepoint_cover, brocade_cover, jacquard_cover.

Preferred non-wood material, joinery, and condition keys (Batch 1-3 non-wood taxonomy — use whenever the piece is primarily metal, wicker, or mixed-material rather than wood):

Metal joining methods (emit whichever is visible at frame intersections, tube junctions, or seam lines):
- hand_forged_metal_joint — visible hammer marks at the joint, irregular forge fusion line, slight bulge or upset where pieces meet, forge scale on adjacent surfaces. Pre-1900 wrought-iron dominant.
- riveted_metal_joint — domed, flush, countersunk, or decorative rivet heads visible at joints; repeating rivet pattern along seams or at structural junctions. c. 1850-1940 industrial.
- brazed_metal_joint — thin brass-colored infill line at lap or butt seam; brass fillet at the joint corner; color contrast between brass infill and parent metal. Especially diagnostic on brass beds and brass lighting.
- soldered_metal_joint — dull silver or gray solder line at lap or butt seam; small soft bead or fillet. Common in tinware, pewter, lightweight brass, lighting bodies.
- welded_joint — visible weld bead with rippled scallop or fish-scale pattern (oxyacetylene) or coarser stick-weld pattern (arc); heat-discoloration zone around the joint. Post-1910 widespread.
- spot_welded_joint — small circular dimples or discolored spots at regular intervals along an overlapped sheet-metal seam, typically 1/4-1/2 inch diameter spaced 1-3 inches apart. Post-1925 industrial.
- mig_tig_welded_joint — clean uniform weld bead with fine ripple (TIG: stacked-dime appearance; MIG: smoother continuous bead); minimal spatter; minimal heat-discoloration zone. Post-1948 / TIG post-1941. PRIMARY REPRODUCTION-DETECTION SIGNAL on pieces styled as 19th-c. wrought iron or Victorian brass.
- crimped_folded_seam — raised, folded, or grooved seam visible along sheet-metal joint with no solder/braze/weld/rivets. Post-1850 industrial sheet-metal.
- wire_wrapped_metal_joint — visible wire wrap, banding, or coil at the joint; common in wicker-and-iron hybrid construction and decorative lighting bands.

Metal materials (emit whenever metal frame components are visible):
- metal_frame, wrought_iron, cast_iron, brass_frame, tubular_steel, chrome_frame, painted_metal_finish.

Metal wear and condition signals (emit when visible — important for restoration assessment and reproduction detection):
- rust_pitting — active iron or steel oxidation with surface pitting.
- plating_loss — chrome, nickel, or brass plating wear-through to base metal. Note: thinner plating wearing through to steel is a period-brass-bed signal c. 1880-1920; uniform thick plating without wear-through is a modern-reproduction signal.
- joint_corrosion — corrosion concentrated at metal joints (galvanic, crevice, or stress).
- weld_repair_visible — a modern weld over an original joint of a different type; record the weld as restoration evidence and preserve the original joining method as the dating signal.
- powder_coat_overspray — modern powder-coat finish (post-1960s) covering an earlier metal piece; obscures original finish and surface wear.
- bent_or_sprung_metal — permanent deformation from use or stress.

Wicker era / style dating anchors (emit when wicker, rattan, reed, or paper-fiber construction is visible):
- lloyd_loom_paper_fiber — uniform twisted-paper strands wrapped around a wire core; visible at broken strands and frame edges. Post-1917 HARD anchor (Marshall B. Lloyd 1917 patent; Heywood-Wakefield production). A piece otherwise styled or attributed pre-1917 cannot be Lloyd loom in original construction.
- bar_harbor_style_wicker — open airy weave, geometric forms, minimal curlicue ornament, often white-painted or natural finish. c. 1900-1920 American resort wicker era.
- victorian_curlicue_wicker — heavy ornament with scrolls, curlicues, hearts, fans, photo-frame insets, densely decorated backs. c. 1880-1900 Victorian.
- mid_century_streamlined_wicker — lighter forms, simpler curves, often paired with steel or aluminum frames; often imported Filipino or Asian-Pacific work. c. 1945-1970.
- paper_fiber_construction — broader category that includes Lloyd loom paper fiber; uniform extruded paper strands vs. the irregular tapered profile of natural plant fibers.

Wicker weave-pattern signals (sub-diagnostic; combine with era/material anchors above):
- wicker_weave_close — tight close weave with minimal gaps between strands; quality/formal production.
- wicker_weave_open — open or airy weave with visible gaps between strands; Bar Harbor era signal.
- wicker_weave_basket — basket-weave pattern (alternating over-under in groups of two or more strands).

Wicker materials (existing keys; emit whenever visible):
- woven_body, rattan_frame, cane_panels.

Wicker condition signals:
- wicker_strand_breakage — broken, missing, or unraveled strands.
- wicker_paint_buildup — multiple paint layers obscuring original finish, weave detail, and material identification.

Critical observation discipline for non-wood pieces:
1. ALWAYS describe joining method visible at frame intersections — it is often the strongest dating signal on metal furniture.
2. Distinguish reproductions: MIG/TIG-clean bead on Victorian-styled iron or brass = post-1948 reproduction; uniform thick brass plating with no wear-through = often modern reproduction; powder-coat finish on a piece styled pre-1960s = refinish or reproduction.
3. Preserve original joining method as the dating signal even if later weld repair is present — record the repair separately as weld_repair_visible.
4. On wicker: distinguish paper fiber (uniform extruded strands, post-1917) from natural reed/rattan (irregular tapered plant fibers). This single distinction often controls dating.
5. Report era-anchor markers (lloyd_loom_paper_fiber, bar_harbor_style_wicker, victorian_curlicue_wicker) even when uncertain — the engine will weigh them appropriately.

${UPHOLSTERY_CANONICAL_APPENDIX}

${JOINERY_CANONICAL_APPENDIX}

${FASTENER_CANONICAL_APPENDIX}

${HARDWARE_CANONICAL_APPENDIX}

${FINISH_CANONICAL_APPENDIX}

${TOOLMARK_CANONICAL_APPENDIX}

${WOOD_IDENTIFICATION_CANONICAL_APPENDIX}

${WOOD_EVIDENCE_CANONICAL_APPENDIX}

${MAKER_MARK_CANONICAL_APPENDIX}
`;

    const result = await this.callClaude(
      system,
      [
        ...this.imgs(images),
        { type: "text", text: `Intake context: ${buildIntakeSummary(intake)}` },
      ],
      intake.analysis_mode
    );

    const parsedForEvidence = result.ok
  ? result.parsed
  : result.error && result.error.raw
  ? parseModelJson(String(result.error.raw).replace(/^json\s*/i, "")) || {
      perception: {
        labels: [],
        maker_names: [],
        materials: [],
        forms: [],
        functional_features: [],
        style_cues: [],
        construction_cues: [],
        condition_cues: [],
        visible_text: [],
      },
      observations: [
        {
          category: "context",
          key: "phase0_extraction_limited",
          description:
            "Phase 0 did not return clean structured evidence. The report relies on available intake and visible form signals.",
          confidence: 20,
          source_image: "unknown",
          hard_negative: false,
        },
      ],
    }
  : {};

let observations = normalizeObservationsFromParsed(parsedForEvidence);
let perception = normalizePerception(parsedForEvidence, observations);

observations = addIntakeObservations(intake, observations);
observations = promotePerceptionObservations(observations, perception);

const structuralPatternMatches = detectStructuralPatterns(observations);
observations = dedupeObservations([...observations, ...structuralPatternMatches]);

const dustCoverMatches = deriveDustCoverClues(observations);
observations = dedupeObservations([...observations, ...dustCoverMatches]);

perception = normalizePerception(parsedForEvidence, observations);

const makerMarkLabelText = observations
  .filter((o) => !o.negated && (o.type === "label" || o.clue === "maker_label" || o.clue === "visible_text"))
  .map((o) => o.description || "")
  .join("  ");
const makerMarkMatches = matchMakerMarks(`${perception.raw_text || ""}  ${makerMarkLabelText}`, observations);
observations = dedupeObservations([...observations, ...makerMarkMatches]);

const digest = buildEvidenceDigest(observations, perception);

if (digest.vocab_shadow && (digest.vocab_shadow.changed.length || digest.vocab_shadow.unmatched.length)) {
  console.log("[vocab-shadow]", JSON.stringify(digest.vocab_shadow));
}

const languageAlignmentDebug = {
  vocab_shadow: digest.vocab_shadow ?? null,
  raw_phase0_observations: Array.isArray(parsedForEvidence?.observations)
    ? parsedForEvidence.observations.map((o: any) => ({
        raw_type: o?.type || o?.category || null,
        raw_clue: o?.clue || o?.key || o?.reference_id || null,
        raw_description:
          o?.description ||
          o?.observed_value_text ||
          o?.text ||
          o?.value ||
          null,
      }))
    : [],

  normalized_observations: observations.map((o) => ({
    type: o.type,
    clue: o.clue || null,
    description: o.description,
    confidence: o.confidence,
    source_image: o.source_image || null,
  })),

  digest_clue_keys: digest.clue_keys,

  derived_pattern_clues: observations
    .filter((o) => o.source_image === "derived")
    .map((o) => o.clue)
    .filter(Boolean),

  unmatched_observations: observations
    .filter((o) => !o.clue)
    .map((o) => o.description),
};

    observations.forEach((obs) => {
      API.addObservation(caseData.id, {
        observation_type: obs.type,
        clue: obs.clue || null,
        reference_id: obs.clue || null,
        observed_value_text: obs.description,
        source_image: obs.source_image || null,
        raw_confidence: Number((obs.confidence / 100).toFixed(3)),
        effective_confidence: Number((obs.confidence / 100).toFixed(3)),
        hard_negative: Boolean(obs.hard_negative),
        low_confidence_flag: Boolean(obs.low_confidence_flag),
      });
    });

    const res = {
  ok: true,
  observations,
  perception,
  evidence_digest: digest,
  note: result.ok
    ? "Phase 0 scanned photos once and stored evidence."
    : "Phase 0 used limited intake-derived evidence because extraction failed.",
  raw_error: result.ok ? null : result.error,
raw_result: result.ok ? result.raw : null,
parsed_result: result.ok ? result.parsed : null,
debug: {
    phase0_result_ok: result.ok,
    phase0_error: result.ok ? null : result.error,
    image_count: Array.isArray(images) ? images.length : 0,
    image_types: (images || []).map((img: any) => img?.image_type || "unknown"),
    language_alignment: languageAlignmentDebug,
  },
};
    onPhase?.("p0", res);
    return res;
  },

  /**
   * Deep-extraction recovery pass. Triggered by runAllPhases when the
   * primary p0() scan returns zero structured observations. Re-prompts
   * the LLM with a permissive "describe everything" instruction and an
   * extended token budget (24000 vs the 16000 full-analysis default) to
   * recover observations from photos that the structured-schema first
   * pass couldn't extract. Returns observations + perception in the same
   * shape as p0() for drop-in substitution. Recovery typically takes
   * 25-40 seconds; only fires on the rare empty-observations case (est.
   * 1-3% of scans in steady state, higher during prompt-development).
   */
  async runDeepExtraction(
    images: any[],
    intake: any
  ): Promise<{
    observations: Observation[];
    perception: Perception;
    recovered: boolean;
    recovery_reason: string;
    recovery_error: any;
    raw: string | null;
  }> {
    const recoverySystem = `You are an expert American furniture appraiser performing a RECOVERY extraction pass. The initial structured-schema scan of these photos returned zero usable observations. This second pass is designed to capture ANY visible evidence, even when uncertain or partial.

INSTRUCTIONS:

1. Look at every photo in careful detail. Do not skip any image. For each photo, scan systematically: overall form → primary materials → joinery visible at corners and intersections → hardware (knobs, pulls, hinges, casters) → fasteners (nail or screw heads) → finish character → wear and condition → any visible marks, labels, stamps, or text.

2. Be permissive about uncertainty. An observation with confidence 20 and a partial description is far more valuable than no observations at all. Use low confidence (20-40) freely for uncertain observations. Use higher confidence (60-90) only for clear and unambiguous evidence.

3. Return a JSON object with this exact structure:

{
  "perception": {
    "labels": [],
    "maker_names": [],
    "materials": [],
    "forms": [],
    "functional_features": [],
    "style_cues": [],
    "construction_cues": [],
    "condition_cues": [],
    "visible_text": []
  },
  "observations": [
    {
      "type": "<form|material|joinery|fastener|hardware|finish|toolmark|wood|label|condition|style|context>",
      "clue": "<one of the canonical clue keys below, or null if uncertain>",
      "description": "<plain-language description of what you see — be specific about what photo and what part of the piece>",
      "confidence": <number 0-100>,
      "source_image": "<image identifier or 'unknown'>",
      "hard_negative": false,
      "low_confidence_flag": <true if confidence < 50, otherwise false>
    }
  ]
}

4. CRITICAL: Return AT LEAST ONE observation. If you can see furniture at all — any form, any material, any construction detail — emit observations for what you see.

5. Common clue keys to use when applicable (otherwise leave clue null and put the detail in description):
   - Form: seating_surface, backrest_present, drawer_present, door_present, mirror_present, metal_bed_frame, armchair_form, cabriole_leg, secondary_surface, writing_surface, pedestal_column, open_shelving
   - Material: solid_wood_construction, plywood_structural, metal_frame, wrought_iron, cast_iron, brass_frame, tubular_steel, chrome_frame, glass_top, marble_top, laminate_surface, formica_surface, woven_body, rattan_frame, cane_panels, paper_fiber_construction, lloyd_loom_paper_fiber
   - Joinery: hand_cut_dovetails, machine_dovetails, dowel_joinery, mortise_and_tenon, welded_joint, riveted_metal_joint, brazed_metal_joint, soldered_metal_joint, mig_tig_welded_joint, spot_welded_joint, hand_forged_metal_joint
   - Fastener: hand_forged_nail, cut_nail, wire_nail, slotted_screw, phillips_screw, staple_fastener
   - Hardware: porcelain_caster, modern_caster, decorative_bail_pull, round_wood_knob, modern_concealed_hinge, swivel_mechanism, lock_escutcheons
   - Finish: shellac_crazing, shellac_intact, polyurethane, lacquer_finish, painted_metal_finish, refinished_surface
   - Toolmark: pit_saw_marks, circular_saw_arcs, band_saw_lines, hand_plane_chatter
   - Condition: rust_pitting, plating_loss, joint_corrosion, wicker_strand_breakage, weld_repair_visible
   - Label: maker_label, roos_label, lane_label

6. If the photos genuinely show no furniture (entirely blank, dark beyond recovery, or non-furniture content), emit one observation: {"type": "context", "clue": null, "description": "Photos do not show recognizable furniture content. [Brief description of what is visible instead.]", "confidence": 80, "source_image": "unknown", "hard_negative": false, "low_confidence_flag": false}

Begin recovery extraction now. Do not return the empty observations array under any circumstances.`;

    const result = await this.callClaude(
      recoverySystem,
      [
        ...this.imgs(images),
        { type: "text", text: `Intake context: ${buildIntakeSummary(intake)}` },
      ],
      "full_analysis",
      24000
    );

    const parsed = result.ok
      ? result.parsed
      : result.error && (result.error as any).raw
        ? parseModelJson(String((result.error as any).raw).replace(/^json\s*/i, ""))
        : null;

    const observations = parsed ? normalizeObservationsFromParsed(parsed) : [];
    const perception = parsed
      ? normalizePerception(parsed, observations)
      : {
          labels: [],
          maker_names: [],
          materials: [],
          forms: [],
          functional_features: [],
          style_cues: [],
          construction_cues: [],
          condition_cues: [],
          visible_text: [],
        } as Perception;

    return {
      observations,
      perception,
      recovered: observations.length > 0,
      recovery_reason: result.ok
        ? "p0_returned_empty"
        : (result.error && (result.error as any).type) === "no_valid_json"
          ? "p0_callClaude_no_valid_json"
          : "p0_callClaude_failed",
      recovery_error: result.ok ? null : (result.error ?? null),
      raw: result.ok ? result.raw || null : ((result.error as any)?.raw || null),
    };
  },

  p1(caseData: any, intake: any, digest: EvidenceDigest, images: any[]): Phase1Gate {
    const missing = computeMissingEvidence(images);
    const count = digest.observation_count;
    // fallback_form is the engine's "extraction returned nothing" sentinel, not
    // real evidence — it must not count as form/identification evidence here.
    const evidenceEmpty = digest.clue_keys.includes("fallback_form") || count === 0;
    const hasLabel = digest.clue_keys.some((k) => k.includes("label"));
    const hasForm = (digest.by_type.form || []).some((o: any) => o.clue !== "fallback_form");
    const hasConstruction = ["construction", "joinery", "toolmarks", "fasteners", "materials"].some((t) => (digest.by_type[t] || []).length > 0);

    let pct = 40;
    if (count >= 4) pct += 15;
    if (hasForm) pct += 15;
    if (hasConstruction) pct += 15;
    if (hasLabel) pct += 20;
    pct = clamp(pct, 25, 94);

    // Stress-test fix #4 refined (2026-05-20): confidence cap based on
    // DATING-STRUCTURAL evidence categories, not all "structural" categories.
    //
    // Original fix (2c6c72b) counted construction, joinery, fastener,
    // toolmark, hardware, material, finish, wood as "structural" — and a
    // chair with construction (5 clues, all observed from front/side
    // photos) + material (visible wood species) + finish (surface
    // observation) still hit the 88% / "High" cap. Appraiser feedback:
    // "production-date confidence should remain moderate until construction
    // evidence is available." Construction evidence = the things photos
    // typically DON'T capture without intentional detail shots: joinery,
    // fasteners, tool marks, hardware close-ups, wood-evidence beyond
    // surface identification.
    //
    // Refined distinction:
    //   DATING-STRUCTURAL categories — require detail photos (underside,
    //   close-ups, hardware shots) to surface, and genuinely anchor
    //   dating confidence:
    //     joinery, fastener, toolmark, hardware, wood
    //
    //   SURFACE-STRUCTURAL categories — observable from typical front/
    //   side photos, useful but don't anchor dating without the
    //   dating-structural layer:
    //     construction, material, finish
    //
    // Cap progression now keys ONLY on dating-structural categories:
    //   0 dating-structural categories  → cap at 72 (Moderate)
    //   1 dating-structural category    → cap at 80 (Moderate)
    //   2 dating-structural categories  → cap at 86 (High threshold)
    //   3+ dating-structural categories → cap at 94 (full High allowed)
    //
    // Effect on the French Louis XVI medallion chair scan that surfaced
    // this refinement: chair has 0 dating-structural categories (only
    // construction / material / finish observations from exterior).
    // Cap drops from 88 to 72 — honest Moderate confidence reflecting
    // the missing dating-detail photos.
    // Canonical (plural) category names — must match the normalized
    // observation types in digest.by_type (see canonicalObservationType).
    const DATING_STRUCTURAL_CATEGORIES = [
      "joinery",
      "fasteners",
      "toolmarks",
      "hardware",
      "materials",
    ];
    const datingStructuralCount = DATING_STRUCTURAL_CATEGORIES.filter((cat) => {
      const observations = digest.by_type[cat] || [];
      return observations.length > 0;
    }).length;
    const structuralCap =
      datingStructuralCount === 0
        ? 72
        : datingStructuralCount === 1
          ? 80
          : datingStructuralCount === 2
            ? 86
            : 94;
    pct = Math.min(pct, structuralCap);

    const next: string[] = [];

const hasDatingEvidence = digest.clue_keys.some((k) =>
  [
    "hand_cut_dovetails",
    "machine_dovetails",
    "cut_nail",
    "wire_nail",
    "hand_forged_nail",
    "phillips_screw",
    "staple_fastener",
    "solid_plank_back",
    "solid_wood_construction",
    "plywood_structural",
    "plywood_drawer_bottom",
  ].includes(k)
);

const hasDrawerCase =
  digest.clue_keys.includes("drawer_present") ||
  digest.clue_keys.includes("multiple_drawer_case");

const hasPossiblePanelConflict =
  digest.clue_keys.includes("possible_plywood_or_laminated_panel") ||
  digest.perception?.raw_text?.toLowerCase().includes("plywood_or_solid");

if (hasPossiblePanelConflict) {
  next.push("Close-up of side panel edge to confirm solid wood vs. plywood or laminate");
}

if (hasDrawerCase) {
  next.push("Clear drawer-corner close-up to confirm dovetail, dado, nailed, or butt construction");
}

if (missing.underside_photo) {
  next.push("Underside photo for fasteners, tool marks, drawer runners, and case construction");
}

if (!hasDatingEvidence && missing.hardware_photo) {
  next.push("Hardware or fastener close-up if screws, nails, locks, hinges, or casters are visible");
}

if (missing.back_photo) {
  next.push("Back photo for backboard, panel, and material evidence");
}

if (missing.label_photo) {
  next.push("Maker's mark or label, if present");
}
 
    // Sufficiency summary — surfaces the dating-structural-evidence reality
    // so the user understands why confidence is what it is. When the
    // photos don't capture dating-detail evidence (joinery, fasteners,
    // toolmarks, hardware close-ups, underside), the message explicitly
    // notes that the dating side is moderate even if style / form / label
    // are strong. Per stress-test fix #4 refined — addresses the
    // appraiser observation that style confidence and dating confidence
    // were being blended together too aggressively.
    let sufficiencySummary: string;
    if (evidenceEmpty) {
      sufficiencySummary = "The photos did not yield usable structured evidence, so no identification, dating, or valuation could be supported. Re-shoot with better lighting, focus, and angle — clear full-form shots plus close-ups of joinery, any maker's mark or label, and the underside.";
    } else if (datingStructuralCount === 0) {
      sufficiencySummary = hasLabel
        ? "Label evidence anchors the identification. Dating confidence remains moderate without detail-photo evidence (joinery, fasteners, toolmarks, hardware close-ups, or underside)."
        : hasForm
          ? "Visible form and style evidence support a working identification. Dating confidence remains moderate until detail-photo evidence is captured (joinery, fasteners, hardware close-ups, underside)."
          : "Evidence remains broad. More visible form, construction-detail, or label evidence would materially improve the result.";
    } else if (datingStructuralCount === 1) {
      sufficiencySummary = hasLabel
        ? "Label evidence anchors the identification; one dating-detail evidence category present. Additional joinery, fastener, or hardware detail would refine the dating envelope."
        : "Working identification supported by one dating-detail evidence category. Additional joinery, fastener, or hardware close-ups would refine the dating envelope.";
    } else if (datingStructuralCount === 2) {
      sufficiencySummary = hasLabel
        ? "Label plus two dating-detail evidence categories give the assessment a strong anchor."
        : "Two dating-detail evidence categories support a working identification and dating envelope.";
    } else {
      sufficiencySummary = hasLabel
        ? "Rich evidence across label and multiple dating-detail categories gives the assessment its strongest anchor."
        : "Multiple dating-detail evidence categories (joinery, fasteners, toolmarks, hardware, wood) support both identification and dating with high confidence.";
    }

    return {
      confidence_cap: toConfidenceBand(pct),
      confidence_cap_pct: pct,
      missing_evidence: missing,
      evidence_sufficiency_summary: sufficiencySummary,
      can_run: { dating: count > 0, form: count > 0, weighting: count > 0, conflict_check: count > 1, valuation_ready: count > 1 },
      next_best_evidence: uniq(next).slice(0, 5),
    };
  },

  p2(digest: EvidenceDigest, gate: Phase1Gate): Phase2Result {
    // Block 14: form scoring uses frame-filtered digest so upholstery clues
    // (velvet, button-tufting, springs) don't influence form identification.
    const frameDigest = buildFrameDigest(digest);
    const ranked = scoreForms(frameDigest);
    const best = ranked[0];
    const form = best?.form || "Unclassified furniture";
    const raw = dateFromEvidence(digest, form);

    // Block 1 step 7: populate numeric date envelope from range string parse (D-PH3-13 #4).
    const { date_floor, date_ceiling } = parseRangeToNumeric(raw.range);

    // Block 1 step 7: surface canonical diagnostic_caution_text in support array
    // for any digest clue whose canonical entry carries one (D-PH3-13 #3).
    // Replaces hardcoded engine-internal messages for plywood, phillips, staples, etc.
    const support: string[] = Array.isArray(raw.support) ? [...raw.support] : [];
    const seenTexts = new Set(support);
    for (const clueKey of digest.clue_keys || []) {
      const text = getCanonicalCautionText(clueKey);
      if (text && !seenTexts.has(text)) {
        support.push(`Canonical guidance (${clueKey}): ${text}`);
        seenTexts.add(text);
      }
    }

    const result: Phase2Result = { ...raw, support };
    if (date_floor !== null) result.date_floor = date_floor;
    if (date_ceiling !== null) result.date_ceiling = date_ceiling;

    // Block 14: apply originality inference now that frame envelope is known.
    if (result.upholstery_layer) {
      result.upholstery_layer = applyOriginalityInference(
        result.upholstery_layer,
        { date_floor: result.date_floor, date_ceiling: result.date_ceiling },
        digest
      );
    }

    return result;
  },

  p3(digest: EvidenceDigest, gate: Phase1Gate, intake: any): Phase3Result {
    // Block 14: frame-only digest for form identification and style
    // attribution. Upholstery clues feed the separate upholstery_layer
    // track in p2 and must not influence frame ID or style here.
    const frameDigest = buildFrameDigest(digest);
    const ranked = scoreForms(frameDigest);
    const rawBest = ranked[0];

    // Block 1 D-PH3-13 #2: when the highest-scoring scoreForms label is a
    // style-as-form (e.g., "Victorian Eastlake furniture", form_id NO_MATCH),
    // prefer the highest-scoring NON-style-label alternative as the actual form,
    // and surface the style label as style_context. This separates form
    // identification from style attribution.
    const bestForm = ranked.find((r) => r.form_id !== null) || rawBest;
    const styleAsFormPrimary = rawBest && rawBest !== bestForm ? rawBest : null;

    const form = bestForm?.form || "Unclassified furniture";
    const form_id = bestForm?.form_id ?? null;
    const alternatives = ranked
      .filter((r) => r !== bestForm)
      .slice(0, 3)
      .map((r) => r.form);
    // alternative_form_ids must exclude the picked form. The reference-
    // equality filter (.filter((r) => r !== bestForm)) is insufficient
    // because scoreForms can return multiple ranked entries that resolve
    // to the same canonical form_id (e.g., "Dresser" label and "Chest of
    // drawers" label both → form_chest_of_drawers). Without the form_id
    // dedupe, alternative_form_ids would contain the picked form's own id
    // — which broke evaluateCousinContrast self-matching before its
    // defensive filter was added (a1580ec discovery). Fixing here at the
    // source so all downstream consumers benefit.
    const bestFormId = bestForm?.form_id ?? null;
    const alternative_form_ids = ranked
      .filter((r) => r !== bestForm)
      .filter((r) => r.form_id !== bestFormId)
      .slice(0, 3)
      .map((r) => r.form_id)
      .filter((id): id is string => id !== null);

    // Confidence ladder uses the actual form's score, not the (possibly higher) style-label score.
    const confidencePct = bestForm
      ? Math.min(gate.confidence_cap_pct, bestForm.score >= 80 ? 90 : bestForm.score >= 45 ? 72 : 48)
      : 35;

    const observedStyle = [...(frameDigest.observations || [])]
      .filter((o) => o.type === "style" && o.clue && (o.confidence || 0) >= 70)
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];

    const styleFromObservation = observedStyle
      ? String(observedStyle.clue)
          .replace(/_style$/i, "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : null;

    // If scoreForms promoted a style-label, treat it as authoritative style context
    // (it's the strongest style signal the engine detected).
    const styleFromForm = styleAsFormPrimary
      ? styleAsFormPrimary.form.replace(/\s+furniture$/i, "").trim()
      : null;

    // Block 1 step 6: subtype + dimensional evaluators consume canonical FormEntry data.
    // Anti-back wired in step 7 (needs dateFromEvidence numeric envelope).
    // Block 14: frame-filtered observations so subtype evaluator isn't
    // pulled by upholstery descriptions.
    const observationDescriptions = (frameDigest.observations || []).map((o) => o.description || "");
    const subtype = evaluateSubtype(form_id, observationDescriptions);
    const dimensional_check = evaluateDimensional(form_id, intake);

    // Block 4 B5: hybrid form annotation (mule chest → chest of drawers +
    // blanket chest hybrid). Only fires when FormEntry.secondary_form_associations
    // is populated (currently 1 form per Path A audit; expands as canonical
    // authoring surfaces additional hybrid identities).
    const hybrid = evaluateHybridForm(form_id);

    // Parking-lot 2d lean wiring: cousin_form_contrasts from the picked
    // form, matched against p3-scored alternative form names/ids. Surfaces
    // in the report for "why this form, not that one" explanation. Does
    // NOT influence scoring.
    const cousin_contrasts = evaluateCousinContrast(form_id, alternative_form_ids);

    // Surface the picked form's free-text regional / period context and the
    // general cousin-form contrasts for the report's "Regional & period
    // context" and "How it differs" dropdowns. Authoring documentation that
    // was previously engine-side only. Does NOT influence scoring.
    const regional_period_notes = getRegionalPeriodNotes(form_id);
    const cousin_form_contrasts = getCousinFormContrasts(form_id);

    // Block 2a: structured style attribution from styleFamilies.ts.
    // Falls back to engine-derived style strings when no canonical match.
    // Block 14: frame-filtered clue keys so style attribution can't see
    // upholstery vocabulary (velvet, button-tufting, etc.) when scoring
    // frame styles.
    // Maker/identity labels (e.g. "New Haven Clock Co.") are not style vocabulary.
    // Tokenizing them into the style haystack let the place name "New Haven" seed
    // the token "new", which matched the contemporary family's "New Traditional"
    // alias and mislabeled a Victorian clock as a post-1990 reproduction. Exclude
    // [label]-type observations from style attribution (subtype eval still gets all).
    const styleDescriptions = (frameDigest.observations || [])
      .filter((o) => o.type !== "label")
      .map((o) => o.description || "");
    const styleRanked = attributeStyle(frameDigest.clue_keys || [], styleDescriptions);

    // Distinctiveness gate (2026-05-20): only attributions that rest on real
    // style evidence (a distinctive token or a structured clue key) are
    // authoritative. A match built solely from generic tokens scraped from
    // observation PROSE — e.g. "victorian"/"revival" harvested from a hedging
    // sentence like "consistent with late Victorian or Colonial Revival forms"
    // — is the engine citing its own comparative language as evidence. Those
    // (supported === false) are demoted to non-authoritative style_influences:
    // surfaced as "worth checking", never the headline label, and never
    // seeding the dating layers (style / style_wave) or valuation.
    const supportedRanked = styleRanked.filter((s) => s.supported);
    const unsupportedRanked = styleRanked.filter((s) => !s.supported);
    const style_attribution = supportedRanked[0] ?? null;

    // Stress-test fix #10 (2026-05-20): suppress adjacent revival-family
    // bleed in surfaced alternatives.
    //
    // Issue surfaced by the Colonial Revival Queen Anne chair scan: the
    // engine surfaced "Spanish Colonial Revival / Mission Revival" as an
    // alternative because it matched the same two generic tokens
    // ("colonial", "revival") that Colonial Revival matched. Same matched
    // terms, same confidence — but Spanish Colonial has no distinct
    // identifying evidence (no "spanish", no "mission" tokens fired).
    // Reports read as a cluster of stylistic possibilities rather than
    // disciplined evidence-first conclusions.
    //
    // Two-part filter applied before slicing to 3:
    //
    //   1. Confidence floor (0.55) — alternatives below this threshold
    //      represent weak matches that add noise without information.
    //      The wave search already uses 0.4 as its floor; alternatives
    //      surfaced in the user-facing report deserve a higher bar.
    //
    //   2. Matched-term distinctness — alternatives whose matched_terms
    //      are entirely subsumed by terms already seen in the primary
    //      attribution or in higher-confidence alternatives are
    //      suppressed. The alternative must contribute at least one
    //      DISTINCT matched term to be surfaced. This filters the
    //      Spanish-Colonial-Revival-piggybacking-on-Colonial-Revival
    //      case directly.
    //
    // Both filters apply only to user-facing alternative surfacing.
    // Internal logic (cousin contrasts, style-wave seeding, etc.) that
    // operates on the full styleRanked list is unaffected.
    const ALT_CONFIDENCE_FLOOR = 0.55;
    const seenMatchedTerms = new Set<string>();
    if (style_attribution && Array.isArray((style_attribution as any).matched_terms)) {
      for (const t of (style_attribution as any).matched_terms as string[]) {
        seenMatchedTerms.add(t.toLowerCase());
      }
    }
    const style_alternatives: StyleAttribution[] = [];
    for (const alt of supportedRanked.slice(1)) {
      if (style_alternatives.length >= 3) break;
      if ((alt.confidence ?? 0) < ALT_CONFIDENCE_FLOOR) continue;
      const altTerms = Array.isArray((alt as any).matched_terms)
        ? ((alt as any).matched_terms as string[]).map((t) => t.toLowerCase())
        : [];
      const hasDistinctTerm =
        altTerms.length === 0 || altTerms.some((t) => !seenMatchedTerms.has(t));
      if (!hasDistinctTerm) continue;
      style_alternatives.push(alt);
      for (const t of altTerms) seenMatchedTerms.add(t);
    }

    // Non-authoritative style influences: prose-only generic matches that were
    // demoted from authoritative attribution. Surfaced in the report as a
    // hedged "style influences worth checking" note — never the headline
    // label, never a dating layer, never a valuation input. Capped at 2 and
    // required to clear the same confidence floor so the note stays disciplined.
    const style_influences: StyleAttribution[] = [];
    for (const inf of unsupportedRanked) {
      if (style_influences.length >= 2) break;
      if ((inf.confidence ?? 0) < ALT_CONFIDENCE_FLOOR) continue;
      // A candidate worth noting must rest on more than a lone generic era word.
      // A single "victorian" token surfacing "Rococo Revival" is noise, not a
      // tentative read — suppress it rather than show a misleading influence.
      const infTerms = Array.isArray((inf as any).matched_terms) ? ((inf as any).matched_terms as string[]) : [];
      if (infTerms.length < 2) continue;
      style_influences.push(inf);
    }

    // Block 9: controlled style-supporting evidence. Pulls forward undated
    // observations whose clues are categorically aligned with the surfaced
    // style attribution (via CLUE_STYLE_ASSOCIATIONS mapping) when the
    // attribution confidence is at least 0.5. Surfaces as supporting context
    // in the report — does NOT add to dating-overlap (would double-count).
    const style_supporting_evidence = collectStyleSupportingEvidence(
      style_attribution,
      frameDigest.observations ?? []
    );

    // style_context string: prefer canonical attribution name, then engine-derived fallback.
    const style = style_attribution?.name
      || styleFromForm
      || deriveStyleContext(frameDigest)
      || styleFromObservation;

    // Only a SUPPORTED style attribution may prefix the form NAME. The text-cue
    // guesses (deriveStyleContext / styleFromObservation) AND the form-scorer
    // artifact (styleFromForm) are context-only and must not rename the object —
    // e.g. "Modernist / chrome-frame Stool" on a Victorian commode (S017): there
    // styleFromForm is itself "Modernist / chrome-frame", fed by the tubular_steel
    // → "Modernist/chrome-frame furniture" form candidate (an M6 false-positive on
    // "iron/steel screws"). All non-attribution sources still surface separately in
    // the hedged style-context field.
    const namePrefixStyle = pickNamePrefixStyle(style_attribution);

    // Block 2c D-PH3-10: append common_aliases parenthetical to display_form when
    // canonical form has aliases. Surfaces user-trust language without surrendering
    // canonical identification ("Identified as buffet (also commonly called sideboard)").
    const aliases = getCommonAliasesForDisplay(form_id, 2);
    const styledForm = composeStyledForm(namePrefixStyle, form);
    const display_form = aliases.length
      ? `${styledForm} (also commonly called: ${aliases.join(", ")})`
      : styledForm;

    return {
      form,
      form_id,
      display_form,
      style_context: style,
      confidence: toConfidenceBand(confidencePct),
      confidence_pct: confidencePct,
      support: buildReportEvidenceSupport(frameDigest, bestForm?.support || []),
      alternatives,
      alternative_form_ids,
      subtype,
      dimensional_check,
      style_attribution,
      style_alternatives,
      style_influences,
      hybrid,
      cousin_contrasts,
      regional_period_notes,
      cousin_form_contrasts,
      style_supporting_evidence,
    };
  },

 p4(digest: EvidenceDigest): Phase4Result {
  const AUTHORITY_RANK: Record<string, number> = {
    construction: 10,
    joinery: 9,
    toolmarks: 8,
    fasteners: 8,
    materials: 6,
    hardware: 6,
    label: 10,
    form: 7,
    function: 7,
    structure: 7,
    finish: 4,
    alteration: 4,
    style: 3,
    context: 2,
    other: 2,
  };

  const REPLACEMENT_RISK: Record<string, number> = {
    modern_concealed_hinge: 0.1,
    phillips_screw: 0.1,
    staple_fastener: 0.05,
    plywood_structural: 0.02,
    plywood_drawer_bottom: 0.02,

    decorative_bail_pull: 0.45,
    porcelain_caster: 0.35,
    round_wood_knob: 0.4,

    shellac_crazing: 0.2,
    polyurethane: 0.15,

    cabriole_leg: 0.25,
    shell_carving: 0.25,
    claw_or_pad_foot: 0.3,
    barley_twist: 0.25,
    heavy_carving: 0.25,
  };

  // Block 2c trim: all DATE_HINTS entries except thick_veneer are now covered
  // by meta?.dateHint (canonical first, CLUE_LIBRARY fallback). thick_veneer
  // is NO_MATCH canonical AND absent from CLUE_LIBRARY (knowledge migrated
  // to prose-only notes in woodEvidence per Block 0.5d D-PH3HCL-S2). Keeping
  // a minimal single-entry fallback rather than introducing a synthetic
  // CLUE_LIBRARY entry just for this case.
  const DATE_HINTS: Record<string, string> = {
    thick_veneer: "pre-1910",
  };

  const photoCounts: Record<string, Set<string>> = {};

  digest.observations.forEach((o) => {
    const clue = o.clue || o.description;
    if (!photoCounts[clue]) photoCounts[clue] = new Set();
    if (o.source_image) photoCounts[clue].add(o.source_image);
  });

  const weighted_clues = digest.observations
    .filter((o) => !o.negated)
    .map((o) => {
      const meta = getClueMeta(o.clue);
      const clue = o.clue || o.description;
      const category = meta?.category || o.type || "context";

      const base = meta?.weight ?? 0.45;
      const authority = AUTHORITY_RANK[category] || 2;
      const effectiveConfidence = clamp(o.confidence / 100, 0.05, 0.99);
      const replacementRisk = REPLACEMENT_RISK[clue] ?? 0.2;
      const photoCount = photoCounts[clue]?.size || 1;

      let adjusted = base;

      if (authority >= 9) adjusted += 0.07;
      else if (authority >= 7) adjusted += 0.04;
      else if (authority <= 3) adjusted -= 0.08;

      if (effectiveConfidence >= 0.8) adjusted += 0.06;
      else if (effectiveConfidence >= 0.6) adjusted += 0.03;
      else if (effectiveConfidence < 0.4) adjusted -= 0.1;

      if (photoCount >= 3) adjusted += 0.08;
      else if (photoCount === 2) adjusted += 0.04;

      if (replacementRisk >= 0.35) adjusted -= replacementRisk * 0.22;

      if (o.low_confidence_flag) adjusted -= 0.05;

      if (o.hard_negative || meta?.hardNegative) adjusted = Math.max(adjusted, 0.88);

      adjusted = clamp(adjusted, 0.05, 0.98);

      const reasons: string[] = [];
      reasons.push(meta?.dateHint || DATE_HINTS[clue] || "contextual evidence");
      reasons.push(`authority ${authority}/10`);
      if (photoCount > 1) reasons.push(`seen in ${photoCount} photo types`);
      if (replacementRisk >= 0.35) reasons.push(`replacement risk ${Math.round(replacementRisk * 100)}%`);
      if (o.hard_negative || meta?.hardNegative) reasons.push("hard negative");

      return {
        clue,
        display_label: clue.replace(/_/g, " "),
        category,
        authority_rank: authority,
        date_hint: meta?.dateHint || DATE_HINTS[clue] || null,
        replacement_risk: replacementRisk,
        base_weight: Number(base.toFixed(3)),
        adjusted_weight: Number(adjusted.toFixed(3)),
        confidence_reason: `${o.description} (${reasons.join("; ")})`,
        hard_negative: Boolean(o.hard_negative || meta?.hardNegative),
        effective_confidence: Number(effectiveConfidence.toFixed(3)),
        source_images: o.source_image ? [o.source_image] : [],
      };
    })
    .sort((a, b) => {
      if (a.hard_negative && !b.hard_negative) return -1;
      if (!a.hard_negative && b.hard_negative) return 1;
      if (b.authority_rank !== a.authority_rank) return b.authority_rank - a.authority_rank;
      return b.adjusted_weight - a.adjusted_weight;
    });

  const categoryMap: Record<string, { sum: number; count: number; maxAuthority: number }> = {};

  weighted_clues.forEach((w) => {
    if (!categoryMap[w.category]) {
      categoryMap[w.category] = { sum: 0, count: 0, maxAuthority: 0 };
    }
    categoryMap[w.category].sum += w.adjusted_weight;
    categoryMap[w.category].count += 1;
    categoryMap[w.category].maxAuthority = Math.max(categoryMap[w.category].maxAuthority, w.authority_rank);
  });

  const category_scores = Object.entries(categoryMap)
    .map(([category, v]) => ({
      category,
      avg_weight: Number((v.sum / v.count).toFixed(3)),
      count: v.count,
      authority_rank: v.maxAuthority,
      score: Math.round((v.sum / v.count) * 100),
    }))
    .sort((a, b) => {
      if (b.authority_rank !== a.authority_rank) return b.authority_rank - a.authority_rank;
      return b.score - a.score;
    });

  return {
    weighted_clues,
    confidence_drivers: {
      increased: weighted_clues
        .filter((w) => !w.hard_negative && w.adjusted_weight >= 0.65)
        .slice(0, 5)
        .map((w) => `${w.display_label} — ${w.confidence_reason}`),
      limited: weighted_clues
        .filter((w) => w.hard_negative || w.adjusted_weight < 0.5)
        .slice(0, 5)
        .map((w) => w.hard_negative ? `${w.display_label} — hard negative` : `${w.display_label} — limited weight`),
    },
    category_scores,
  };
},
p5(digest: EvidenceDigest, weighting: Phase4Result, dating: Phase2Result, form: Phase3Result): Phase5Result {
  const { weighted_clues } = weighting;

  const highAuthority = weighted_clues.filter(w => w.authority_rank >= 8);
  const lowAuthority = weighted_clues.filter(w => w.authority_rank <= 4);
  const hardNegatives = weighted_clues.filter(w => w.hard_negative);

  const conflicts: string[] = [];
  const resolutions: string[] = [];
  const supporting_context: string[] = []; // Block 7a sub-task 3

  // Block 7a sub-task 2: numeric date-range overlap helper. Two date hints
  // are compatible (no conflict) when their parsed year ranges overlap.
  // Replaces the prior string-equality comparison which over-flagged any
  // distinct-string pair as a conflict (e.g., "post-1900" vs "post-1910"
  // surfaced as conflict despite both pointing the same direction).
  // Returns true when ranges are INCOMPATIBLE (genuine conflict).
  const datesIncompatible = (hintA: string | null | undefined, hintB: string | null | undefined): boolean => {
    if (!hintA || !hintB) return false;
    const a = parseRangeToNumeric(hintA);
    const b = parseRangeToNumeric(hintB);
    if (a.date_floor === null && a.date_ceiling === null) return false; // unparseable; no claim
    if (b.date_floor === null && b.date_ceiling === null) return false;
    const aLo = a.date_floor ?? -Infinity;
    const aHi = a.date_ceiling ?? Infinity;
    const bLo = b.date_floor ?? -Infinity;
    const bHi = b.date_ceiling ?? Infinity;
    // Disjoint: one range ends before the other begins.
    return aHi < bLo || bHi < aLo;
  };

  // Block 7a sub-task 3: check whether a clue's date_hint aligns with the
  // overall dating envelope. Used to route hard-neg cautions: compatible
  // dating → supporting context; incompatible → genuine conflict.
  const clueAlignsWithDating = (clueHint: string | null | undefined): boolean => {
    if (!clueHint) return true; // no claim → no conflict
    const cRange = parseRangeToNumeric(clueHint);
    if (cRange.date_floor === null && cRange.date_ceiling === null) return true;
    if ((dating.date_floor ?? null) === null && (dating.date_ceiling ?? null) === null) return true;
    const cLo = cRange.date_floor ?? -Infinity;
    const cHi = cRange.date_ceiling ?? Infinity;
    const dLo = dating.date_floor ?? -Infinity;
    const dHi = dating.date_ceiling ?? Infinity;
    return !(cHi < dLo || dHi < cLo);
  };

  // Block 1 step 7: B4 anti-back-classification check via canonical
  // FormEntry.anti_classification_guidance. Surfaces guidance_text in conflicts
  // + recommended reroute targets in resolutions when form's boundary_date
  // is violated by the dating envelope.
  const antiBack = evaluateAntiBackClassification(
    form.form_id ?? null,
    dating.date_floor ?? null,
    dating.date_ceiling ?? null
  );
  if (antiBack) {
    conflicts.push(`Anti-back-classification: ${antiBack.guidance_text}`);
    const reroute = antiBack.reroute_form_ids.length
      ? ` Suggested reroute: ${antiBack.reroute_form_ids.join(", ")}.`
      : "";
    resolutions.push(
      `Form ${form.form_id} ${antiBack.boundary_type} boundary (${antiBack.boundary_date}) violated; pre-boundary identification preferred.${reroute}`
    );
  }
  const clues = new Set(digest.clue_keys || []);
  const has = (...keys: string[]) => keys.some((k) => clues.has(k));

  // Transitional-piece reframing: when two style attributions OR two waves
  // from different families surface AND their date ranges intersect, treat
  // the intersection as a CONFIRMATION signal, not a conflict. Surfaces as
  // supporting_context with framing the appraiser would actually use
  // ("both vocabularies were in production c. YYYY–YYYY") rather than the
  // legacy "competing attributions" framing that read as engine confusion.
  // When a canonical named transitional period covers the pair (per
  // lib/constraints/transitionalPeriods.ts), use its diagnostic_caution_text
  // for trade-period framing instead of the generic transitional convergence
  // wording.
  const bestIntersection = form.best_style_intersection ?? null;
  if (bestIntersection) {
    const namedPeriod = bestIntersection.named_transitional_period;
    if (namedPeriod && namedPeriod.diagnostic_caution_text) {
      supporting_context.push(namedPeriod.diagnostic_caution_text);
    } else {
      const tightnessQualifier =
        bestIntersection.width <= 25
          ? "tightly anchors"
          : bestIntersection.width <= 40
          ? "anchors"
          : "is broadly consistent with";
      const layerNoun = bestIntersection.kind === "wave" ? "revival waves" : "style families";
      supporting_context.push(
        `Transitional convergence — both ${bestIntersection.participants.join(" and ")} ${layerNoun} were in production c. ${bestIntersection.date_floor}–${bestIntersection.date_ceiling}; the overlap ${tightnessQualifier} a transitional dating window of c. ${bestIntersection.date_floor}–${bestIntersection.date_ceiling}.`
      );
    }
    if ((form.style_intersections ?? []).length > 1) {
      const others = (form.style_intersections ?? []).slice(1, 3);
      for (const o of others) {
        supporting_context.push(
          `Additional ${o.kind}-level overlap — ${o.source_summary}.`
        );
      }
    }
  }

  // Impossible-pair detection: when two style attributions fire whose
  // canonical compatibility class is "impossible" (no historical
  // co-production window per lib/constraints/styleCompatibility.ts),
  // surface as a p5 conflict with reproduction-signal framing. This is
  // independent of intersection math because impossible pairs usually
  // don't have overlapping date envelopes.
  const impossiblePairs = detectImpossiblePairs(
    form.style_attribution ?? null,
    form.style_alternatives ?? []
  );
  for (const ip of impossiblePairs) {
    const text =
      ip.compatibility_entry.diagnostic_caution_text ??
      `${ip.participants[0]} and ${ip.participants[1]} both attribute to this piece, but these styles did not historically co-occur. This usually indicates a reproduction, decorator's eclectic mix, or LLM mis-read — verify the attributions and/or look for revival-era construction evidence.`;
    conflicts.push(`Impossible style co-attribution: ${text}`);
    resolutions.push(
      `Per canonical style compatibility matrix, ${ip.participants[0]} and ${ip.participants[1]} have no historical co-production window. Down-weight both attributions and treat the piece as a revival, reproduction, or eclectic later work pending further evidence.`
    );
  }

  // Block 7a sub-task 2: detect conflicts via numeric date-range incompatibility
  // (not string mismatch). Only flag pairs whose parsed year ranges are disjoint
  // (e.g., pre-1860 alongside post-1934 = genuine conflict). Same-direction
  // hints like "post-1900" + "post-1910" no longer fire false-positive conflicts.
  highAuthority.forEach((strong) => {
    lowAuthority.forEach((weak) => {
      if (datesIncompatible(strong.date_hint, weak.date_hint)) {
        conflicts.push(
          `${weak.display_label} (${weak.date_hint}) conflicts with ${strong.display_label} (${strong.date_hint})`
        );
        // Resolve by authority
        resolutions.push(
          `${strong.display_label} carries greater authority (${strong.authority_rank}/10) and is favored over ${weak.display_label}.`
        );
      }
    });
  });

 if (
  has("cabriole_leg", "nailhead_trim") &&
  has("button_tufting", "chesterfield_tufting", "chesterfield_adjacent") &&
  has("vinyl_or_bonded_leather", "upholstery_material")
) {
  conflicts.push(
    "Traditional Chesterfield / Queen Anne styling is present, but synthetic vinyl or bonded-leather upholstery points to modern revival production rather than an original period piece."
  );

  resolutions.push(
    "Date should be shifted forward because material evidence overrides traditional style cues."
  );
}
 
  // Hard negative overrides. Per D-PH3-11: hard-negative override stays
  // engine-internal logic (universal rule, not per-entry data). Block 2c
  // upgrade: surface canonical diagnostic_caution_text when the canonical
  // entry carries it.
  //
  // Block 7a sub-task 3: route by date-alignment. When a hard-neg's dating
  // is COMPATIBLE with the overall dating envelope (e.g., plywood + MCM
  // piece), the hard-neg is supporting evidence, not a conflict. When dating
  // is INCOMPATIBLE (e.g., plywood + Federal-period claim), it's a genuine
  // conflict that overrides the form/style call.
  hardNegatives.forEach((hn) => {
    const aligns = clueAlignsWithDating(hn.date_hint);
    const canonicalText = getCanonicalCautionText(hn.clue);
    if (aligns) {
      // Compatible dating → supporting context, not a conflict.
      if (canonicalText) {
        supporting_context.push(
          `${hn.display_label} (hard-negative class): ${canonicalText}`
        );
      } else {
        supporting_context.push(
          `${hn.display_label} indicates ${hn.date_hint ?? "categorical period"} construction; consistent with the dating envelope.`
        );
      }
    } else {
      // Incompatible dating → genuine conflict requiring authority override.
      const guidanceSuffix = canonicalText ? ` Canonical guidance: ${canonicalText}` : "";
      resolutions.push(
        `${hn.display_label} is a hard-negative indicator and overrides conflicting stylistic or lower-authority evidence.${guidanceSuffix}`
      );
    }
  });

  // Replacement logic
  weighted_clues.forEach((w) => {
    if (w.replacement_risk >= 0.35 && w.authority_rank <= 6) {
      resolutions.push(
        `${w.display_label} has elevated replacement risk and is down-weighted in interpretation.`
      );
    }
  });

  // Consolidated summary
  const summary =
    resolutions.length > 0
      ? "Conflicts were resolved by prioritizing higher-authority construction and structural evidence over stylistic or replaceable features."
      : "No significant conflicts detected between evidence categories.";

  return {
    conflicts: conflicts.slice(0, 6),
    resolutions: resolutions.slice(0, 6),
    summary,
    supporting_context: supporting_context.slice(0, 6),
  };
},

 p6(gate: Phase1Gate, dating: Phase2Result, form: Phase3Result, weighting: Phase4Result, conflict: Phase5Result, digest?: EvidenceDigest): Phase6Result {
  // Gate valuation on evidence sufficiency. Without this, a scan that yielded
  // no usable observations (only the fallback_form sentinel) still produced
  // confident dollar ranges and a sellability score — anchoring on nothing.
  const insufficientForValuation =
    (digest?.clue_keys?.includes("fallback_form") ?? false) ||
    (digest?.observation_count ?? 0) === 0;

  const vb = insufficientForValuation
    ? null
    : valueBand(
        form.display_form || form.form || "Unknown",
        dating.range || "",
        digest
      );

  const moneyRange = (range: number[]) => `$${range[0]} – $${range[1]}`;

  const valuationBreakdown = vb && {
    dealer_buy: {
      label: "Dealer Buy / Trade-In",
      range: moneyRange(vb.dealer_buy),
      note: "Conservative acquisition range for a reseller who needs margin.",
    },
    quick_sale: {
      label: "Quick Local Sale",
      range: moneyRange(vb.quick_sale),
      note: "Likely fast-sale range for local pickup or limited marketing.",
    },
    marketplace: {
      label: "Standard Marketplace",
      range: moneyRange(vb.marketplace),
      note: "Likely general resale range with average photos, description, and local exposure.",
    },
    as_found_retail: {
      label: "As-Found Retail",
      range: moneyRange(vb.as_found_retail),
      note: "Likely curated retail or antique-shop range without full restoration.",
    },
    restored_retail: {
      label: "Restored Retail",
      range: moneyRange(vb.restored_retail),
      note: "Potential upper range after appropriate restoration, presentation, and patient selling.",
    },
  };

  // Block 3a: build 8-layer dating-overlap data for Full Analysis viz (D-PH3-6).
  // Engine produces structured data; React rendering lands in Block 3b.
  // Block 16: pass form-emergence / form-extinction boundaries from the
  // form's anti_classification_guidance so layer bands are clipped by
  // form impossibility (e.g., telephone bench style band can't extend
  // before 1900 even if the canonical Louis XVI style period is 1770s).
  const formBoundaries = getFormDatingBoundaries(form.form_id ?? null);
  const dating_overlap = buildDatingOverlap(
    weighting.weighted_clues || [],
    form.style_attribution ?? null,
    form.style_waves ?? [],
    // Form layer = the form's catalog production span, NOT this analysis's own
    // computed date. Re-injecting the computed date made the form layer a
    // circular, high-authority echo of the conclusion it was meant to support.
    getFormDatingEnvelope(form.form_id ?? null),
    formBoundaries,
    form.best_style_intersection ?? null
  );

  return {
    supported_findings: [
      `The strongest supported reading is ${form.display_form || form.form}.`,
      `Current dating evidence supports ${dating.range}.`,
      // Block 7a sub-task 3: hard-negative cues with dating compatible with
      // the overall envelope surface here as supporting context (no longer
      // mislabeled as "cautions and conflicts" when they actually agree).
      ...((conflict as Phase5Result).supporting_context || []),
      // Block 9: undated observations categorically aligned with the style
      // attribution surface here as supporting context for the style call.
      // These don't independently narrow dating but bolster the style read.
      ...(form.style_supporting_evidence && form.style_supporting_evidence.length > 0
        ? [`Supporting ${form.style_context ?? "style"} attribution: ${form.style_supporting_evidence.map((s) => s.display_label).join(", ")} (these features are characteristic of the style but don't independently narrow dating).`]
        : []),
      // Resale lane / valuation breakdown / sellability score now render in
      // the dedicated Resale Valuation section in app/page.tsx (full_analysis
      // mode); removed from supported_findings to avoid visual duplication.
    ],
    tentative_findings: [
      ...(conflict.conflicts || []),
      ...(conflict.resolutions || []),
    ],
    more_evidence_needed: gate.next_best_evidence || [],
    summary: `Evidence-first result: ${form.display_form || form.form}. Dating: ${dating.range}. ${conflict.summary || gate.evidence_sufficiency_summary}`,
    valuation: vb
      ? {
          ...vb,
          display: valuationBreakdown.marketplace.range,
          low: vb.marketplace[0],
          high: vb.marketplace[1],
          platform_breakdown: valuationBreakdown,
        }
      : {
          insufficient_evidence: true,
          note: "Not enough evidence to estimate value. The photos didn't yield usable identification or construction detail — re-shoot with clearer, well-lit photos (full form plus close-ups of joinery, any maker's mark, and the underside) for a valuation.",
        },
    dating_overlap,
  };
},

async runAllPhases(caseData: any, images: any[], intake: any, onPhase?: any) {
  const stage_outputs: Record<string, any> = {};

  const p0 = await this.p0(caseData, images, intake, onPhase);
  stage_outputs.p0 = p0;

  // (P0 debug logs removed in Block 0.55; re-instrument as needed)

  if (!p0.observations || p0.observations.length === 0) {
    // Recovery pass: deep-extraction re-prompt with permissive instructions
    // and extended token budget. Fires only when the primary p0() scan
    // returned zero observations (est. 1-3% steady-state, higher during
    // prompt development). Adds ~25-40 seconds when triggered; only paid
    // when needed. Prior behavior emitted a single fallback_form placeholder
    // observation that downstream scoreForms never consumed — silent dead end.
    const recovery = await this.runDeepExtraction(images, intake);
    stage_outputs.p0_recovery = recovery;
    onPhase?.("p0_recovery", recovery);

    if (recovery.recovered) {
      p0.observations = recovery.observations;
      p0.perception = recovery.perception;
      p0.note = "Phase 0 used deep-extraction recovery after initial pass returned no observations.";
      (p0 as any).recovery_metadata = {
        recovered: true,
        recovery_reason: recovery.recovery_reason,
        observation_count: recovery.observations.length,
        triggered_at: new Date().toISOString(),
      };
    } else {
      // Recovery also returned nothing. Distinguish a genuine empty read from a
      // SERVICE failure (the API call errored or returned unparseable output) —
      // the latter must NOT be blamed on the user's photos. The fallback
      // observation carries the honest message; recovery_metadata carries the
      // structured reason for the UI and the engine trace.
      const serviceFailure =
        recovery.recovery_reason === "p0_callClaude_failed" ||
        recovery.recovery_reason === "p0_callClaude_no_valid_json";
      p0.observations = [
        {
          type: "form",
          clue: "fallback_form",
          description: serviceFailure
            ? "A service error interrupted this scan — the analysis engine returned an error or could not be reached, so no evidence was extracted. This is NOT a problem with your photos. Please try again in a moment."
            : "Furniture is visible, but neither the initial extraction nor the deep-recovery pass returned structured observations. Try photos with better lighting, focus, or angle.",
          confidence: 20,
          source_image: "fallback",
          hard_negative: false,
          low_confidence_flag: true,
        },
      ];
      (p0 as any).recovery_metadata = {
        recovered: false,
        recovery_reason: recovery.recovery_reason,
        recovery_error: recovery.recovery_error,
        service_failure: serviceFailure,
        observation_count: 0,
        triggered_at: new Date().toISOString(),
      };
    }
  }

  p0.evidence_digest = buildEvidenceDigest(p0.observations, p0.perception);
  const digest = p0.evidence_digest;

  const p1 = this.p1(caseData, intake, digest, images);
  stage_outputs.p1 = p1; onPhase?.("p1", p1);

  const p2 = this.p2(digest, p1);
  stage_outputs.p2 = p2; onPhase?.("p2", p2);

  const p3 = this.p3(digest, p1, intake);

  // Block 2b: style-wave aggregation runs post-p3 (needs p2 dating envelope).
  // Mutates p3 in place so downstream phases see style_waves in form context.
  if (p3.style_attribution || (p3.style_alternatives && p3.style_alternatives.length > 0)) {
    const allAttributions = [
      ...(p3.style_attribution ? [p3.style_attribution] : []),
      ...(p3.style_alternatives ?? []),
    ];
    const observationDescriptions = (digest.observations || []).map((o: any) => o.description || "");
    p3.style_waves = aggregateStyleWaves(
      allAttributions,
      p2.date_floor ?? null,
      p2.date_ceiling ?? null,
      observationDescriptions
    );
  }

  // Transitional-piece intersection: compute date-envelope overlaps across
  // competing style attributions and across waves from different parent
  // families. Surfaces the "both vocabularies were in production c.
  // YYYY–YYYY" dating window that makes transitional pieces a CONFIRMATION
  // signal rather than a confusion signal.
  if (p3.style_attribution || (p3.style_alternatives ?? []).length > 0 || (p3.style_waves ?? []).length > 0) {
    const intersectionResult = computeStyleIntersections(
      p3.style_attribution ?? null,
      p3.style_alternatives ?? [],
      p3.style_waves ?? []
    );
    p3.style_intersections = intersectionResult.intersections;
    p3.best_style_intersection = intersectionResult.best;

    // Compute the set of alternative attributions that should be suppressed
    // from the chart's partner Style row because their canonical
    // compatibility class with the winning attribution is "stacked_revival"
    // (umbrella co-attribution, not a transitional moment).
    if (p3.style_attribution && (p3.style_alternatives ?? []).length > 0) {
      const winnerId = p3.style_attribution.style_family_id;
      const suppressed: string[] = [];
      for (const alt of p3.style_alternatives ?? []) {
        const compat = findStyleCompatibility(winnerId, alt.style_family_id);
        if (compat?.compatibility_class === "stacked_revival") {
          suppressed.push(alt.style_family_id);
        }
      }
      p3.stacked_revival_partner_ids = suppressed;
    }
  }

  stage_outputs.p3 = p3; onPhase?.("p3", p3);

  const p4 = this.p4(digest);
  stage_outputs.p4 = p4; onPhase?.("p4", p4);

  const p5 = this.p5(digest, p4, p2, p3);
  stage_outputs.p5 = p5; onPhase?.("p5", p5);

  const p6 = this.p6(p1, p2, p3, p4, p5, digest);
stage_outputs.p6 = p6; onPhase?.("p6", p6);

// Block 7b3: convergence override for the user-facing Working Range.
// When dating_overlap reveals ≥3 evidence layers converging on a tighter
// date range than p2's initial fallback, mutate p2 with the refined dating.
// Feature-flagged in engineDatingOverlap.ts (CONVERGENCE_OVERRIDE_ENABLED).
// Mutation is scoped to the report layer — p5/p6 internal logic already ran
// against the unrefined p2; this only affects what the UI shows.
if (p6.dating_overlap) {
  // Block 14: convergence refinement uses a frame-only overlap so the
  // upholstery layer's dates can't pull the refined p2 envelope.
  // The full overlap (p6.dating_overlap) is still passed to the viz
  // unchanged.
  const frameClues = (stage_outputs.p4?.weighted_clues || []).filter(
    (c: any) => c.category !== "upholstery"
  );
  // Block 16: same form-boundary clipping applies to the frame-only
  // overlap used for convergence refinement.
  const frameBoundaries = getFormDatingBoundaries(p3.form_id ?? null);
  const frameOverlap = buildDatingOverlap(
    frameClues,
    p3.style_attribution ?? null,
    p3.style_waves ?? [],
    // Form layer = catalog production span, not p2's own computed date.
    // Feeding p2 back into the convergence that refines p2 was circular.
    getFormDatingEnvelope(p3.form_id ?? null),
    frameBoundaries,
    p3.best_style_intersection ?? null
  );
  // Positive modern-construction evidence (plywood, staples, phillips, polyurethane,
  // MIG/TIG, etc.) = hard-negative clues whose date hint is unambiguously post-1920+.
  // Required before any post-WWII reproduction date may win the convergence.
  const hasModernConstruction = (frameClues as any[]).some(
    (w) =>
      w?.hard_negative &&
      typeof w?.date_hint === "string" &&
      /post[-\s]*(19[2-9]\d|20\d\d)/i.test(w.date_hint)
  );
  const refined = refineDatingFromConvergence(
    {
      range: p2.range,
      date_floor: p2.date_floor ?? null,
      date_ceiling: p2.date_ceiling ?? null,
      confidence: String(p2.confidence ?? ""),
    },
    frameOverlap,
    hasModernConstruction
  );
  if (refined.refined) {
    p2.range = refined.range;
    p2.date_floor = refined.date_floor ?? undefined;
    p2.date_ceiling = refined.date_ceiling ?? undefined;
    p2.confidence = refined.confidence;
    const supportArr = Array.isArray(p2.support) ? [...p2.support] : [];
    supportArr.push(`Engine reasoning: ${refined.reason}`);
    p2.support = supportArr;
    stage_outputs.p2 = p2;
  }

  // M9a: weigh a maker-label year by ROLE. A signed/dated production year is the
  // highest-authority date and anchors floor=ceiling directly — UNLESS modern
  // construction contradicts it (then the label is suspect/later; defer to
  // construction and flag it). A founding/patent/bare year is only a terminus
  // post quem: clamp the FLOOR up to it, never a ceiling, never a tight date.
  const labelDate = parseLabelDate(digest.observations);
  if (labelDate) {
    const s = Array.isArray(p2.support) ? [...p2.support] : [];
    if (labelDate.kind === "production" && !hasModernConstruction) {
      p2.date_floor = labelDate.floor;
      p2.date_ceiling = labelDate.ceiling ?? undefined;
      p2.range = `c. ${labelDate.floor}`;
      p2.confidence = "High";
      s.push(`A signed/dated maker inscription gives an explicit production year of ${labelDate.floor}; a literal made-date is the highest-authority dating evidence and anchors the date directly.`);
      p2.support = s;
      stage_outputs.p2 = p2;
    } else if (labelDate.kind === "production" && hasModernConstruction) {
      s.push(`Caution: the label reads a production year of ${labelDate.year}, but modern construction evidence is present — the inscription may be a later addition or the part replaced; dated by construction rather than the label.`);
      p2.support = s;
      stage_outputs.p2 = p2;
    } else {
      const cur = typeof p2.date_floor === "number" ? p2.date_floor : null;
      if (cur == null || labelDate.floor > cur) {
        p2.date_floor = labelDate.floor;
        if (typeof p2.date_ceiling === "number" && p2.date_ceiling < labelDate.floor) {
          p2.date_ceiling = undefined; // prior ceiling predates the floor → can't be right
          p2.range = `post-${labelDate.floor}`;
        }
        const kindWord = labelDate.kind === "founding" ? "company-founding" : labelDate.kind === "patent" ? "patent/registration" : "label";
        s.push(`The label's ${labelDate.year} ${kindWord} date is a terminus post quem (the piece cannot predate it), applied as a floor only — not as the production date.`);
        p2.support = s;
        stage_outputs.p2 = p2;
      }
    }
  }

  // #6 Phase 1: style-prose date as a last-resort anchor. Fires ONLY when the date is
  // not backed by anything stronger — no convergence override, no maker/label date,
  // and NO hard construction layer (joinery/fastener/toolmark/wood/hardware) produced
  // a date — yet the model wrote a corroborated production era in style prose. This is
  // the vernacular/craft case (e.g. a mid-century carved-rose rocker whose only datable
  // signal is "circa 1920s-1950s") that otherwise falls to the hardcoded c.1890-1920
  // catch-all. Low confidence; cannot override construction (the gate guarantees none
  // dated the piece), so it can't repeat the M11 revival-wave late-pull on real evidence.
  if (!refined.refined && !labelDate) {
    const HARD_LAYERS = ["joinery", "fastener", "toolmark", "wood", "hardware"];
    const hardConstructionDated = (frameOverlap.layers || []).some(
      (l: any) => HARD_LAYERS.includes(l.layer) && (l.date_floor != null || l.date_ceiling != null)
    );
    if (!hardConstructionDated) {
      const prose = parseStyleProseDate(digest.observations);
      if (prose) {
        p2.date_floor = prose.floor;
        p2.date_ceiling = prose.ceiling;
        p2.range = prose.floor === prose.ceiling ? `c. ${prose.floor}` : `c. ${prose.floor}–${prose.ceiling}`;
        p2.confidence = "Low";
        const s2 = Array.isArray(p2.support) ? [...p2.support] : [];
        s2.push(
          `No datable construction evidence, but the style reads consistently as ${p2.range} across multiple observations; the working range is anchored there (style-derived, low confidence) rather than a generic default.`
        );
        p2.support = s2;
        stage_outputs.p2 = p2;
      }
    }
  }

  // T1b: p6.supported_findings is built (line ~8770) BEFORE the convergence
  // refinement and parseLabelDate finalize p2.range, so its "Current dating
  // evidence supports …" line captured the stale pre-refinement range and could
  // contradict the headline working range (e.g. a c.1914 signed-date clock whose
  // supported-findings still read "Broadly late 19th to 20th century"). Re-point
  // it at the final p2.range now that dating is settled.
  if (stage_outputs.p6 && Array.isArray(stage_outputs.p6.supported_findings)) {
    stage_outputs.p6.supported_findings = stage_outputs.p6.supported_findings.map((line: string) =>
      typeof line === "string" && /^Current dating evidence supports /.test(line)
        ? `Current dating evidence supports ${p2.range}.`
        : line
    );
  }

  // Re-cap identification confidence on ACTUAL dating contribution. The p1 gate
  // caps on dating-structural category PRESENCE, but a category full of undated
  // / open observations (joinery "spans eras", wood "species unidentified")
  // doesn't date the piece — so a scan can hit High off three present-but-
  // undated categories. Count dating-structural LAYERS that actually
  // contributed a parseable date in the overlap; map that to the same cap
  // ladder. This only ever LOWERS confidence (datedCount <= presentCount).
  const DATING_CONTRIB_LAYERS = ["joinery", "fastener", "toolmark", "hardware", "wood"];
  const datedContribCount = (frameOverlap.layers || []).filter(
    (l) =>
      DATING_CONTRIB_LAYERS.includes(l.layer) &&
      l.source_count > 0 &&
      (l.date_floor != null || l.date_ceiling != null)
  ).length;
  const datedCap =
    datedContribCount === 0 ? 72 : datedContribCount === 1 ? 80 : datedContribCount === 2 ? 86 : 94;
  if (typeof p3.confidence_pct === "number" && datedCap < p3.confidence_pct) {
    p3.confidence_pct = datedCap;
    p3.confidence = toConfidenceBand(datedCap);
    p1.confidence_cap_pct = Math.min(p1.confidence_cap_pct, datedCap);
    p1.confidence_cap = toConfidenceBand(p1.confidence_cap_pct);
    stage_outputs.p3 = p3;
    stage_outputs.p1 = p1;
  }
}

// Post-final-assessment style reconciliation. Runs AFTER convergence
// refinement settles the final dating envelope so it can compare the
// attribution-time style winner against the date the engine actually
// converged on. Refines the displayed label to the appraiser-voice
// identification (revival wave name when dates match a wave, named
// transitional period when applicable, reproduction framing when dates
// fall outside all known windows). Mutates p3.final_style and updates
// p3.display_form so downstream report / chart rendering uses the
// reconciled label.
{
  const hasImpossiblePair = ((p5 as Phase5Result).conflicts || []).some(
    (c: string) => typeof c === "string" && c.startsWith("Impossible style co-attribution:")
  );
  // Era context: vernacular dating/material/market-era markers that are NOT
  // styles (Golden Oak Era and future analogs). Surfaced into the era_only
  // reconciliation branch so pieces with no style attribution but clear era
  // identification get a proper market-context label instead of "Unresolved".
  // Detected from clue presence at the call site rather than from style_context
  // (which deriveStyleContext now correctly leaves null for Golden Oak).
  const hasGoldenOakEra = (digest.clue_keys ?? []).some(
    (k) => k === "golden_oak_era_possible" || k === "golden_oak_structural_pattern"
  ) || (digest.observations ?? []).some(
    (o) => o.clue === "golden_oak_era_possible" || o.clue === "golden_oak_structural_pattern"
  );
  const eraContext = hasGoldenOakEra ? "Golden Oak Era" : null;

  // A date past the canonical style ceiling only forces a "reproduction" call
  // when something genuinely modern is present. Detect hard-negative clues
  // whose date hint is unambiguously machine-age (post-1920+): plywood,
  // phillips screws, staples, polyurethane, particle board, etc.
  const hasModernHardNegative = (p4.weighted_clues || []).some(
    (w: any) =>
      w.hard_negative &&
      typeof w.date_hint === "string" &&
      /post[-\s]*(19[2-9]\d|20\d\d)/i.test(w.date_hint)
  );

  // Revival cues: a Revival-family alternative attribution, or any clue key
  // containing "revival" (colonial_revival_style_cues, queen_anne_revival_pattern,
  // etc.). Lets reconcileFinalStyle default an undated original-period style to
  // its revival reading rather than claiming an original 18th-c. piece.
  const revivalAltName = ((p3 as any).style_alternatives ?? []).find(
    (a: any) => typeof a?.name === "string" && /revival/i.test(a.name)
  )?.name ?? null;
  const hasRevivalClue = (digest.clue_keys ?? []).some((k) => /revival/i.test(k));
  const hasRevivalCues = Boolean(revivalAltName) || hasRevivalClue;
  const revivalLabelHint = revivalAltName ?? (hasRevivalClue ? "Colonial Revival" : null);

  const reconciled = reconcileFinalStyle({
    styleAttribution: p3.style_attribution ?? null,
    styleWaves: p3.style_waves ?? [],
    bestIntersection: p3.best_style_intersection ?? null,
    finalDatingFloor: p2.date_floor ?? null,
    finalDatingCeiling: p2.date_ceiling ?? null,
    styleContext: p3.style_context ?? null,
    eraContext,
    hasImpossiblePair,
    hasModernHardNegative,
    hasRevivalCues,
    revivalLabelHint,
  });
  p3.final_style = reconciled;

  // Update display_form to use the reconciled label only when the
  // reconciliation actually refines the original attribution-time choice
  // (kind ∈ {named_transitional, revival_wave, reproduction, impossible_pair}).
  // For original_period / context_only / unresolved, the existing
  // display_form is already correct.
  const refinedKinds: Array<typeof reconciled.kind> = [
    "named_transitional",
    "revival_wave",
    "reproduction",
    "impossible_pair",
    "late_period",
  ];
  if (refinedKinds.includes(reconciled.kind) && p3.form) {
    const base = p3.form;
    const styled = composeStyledForm(reconciled.final_style_label, base);
    // Preserve the canonical "(also commonly called: ...)" aliases tail
    // when the prior display_form had one.
    const aliasesMatch = (p3.display_form || "").match(/\s\(also commonly called:[^)]*\)\s*$/);
    p3.display_form = aliasesMatch ? styled + aliasesMatch[0] : styled;
  }

  // Drop a subtype whose own production window is fully disjoint from the
  // computed frame dating — it cannot coexist with the date (audit: mule_chest
  // 1700–1850 surfaced on an 1890–1920 apothecary chest (S011) and a 1900–1910
  // Regency bookcase (S015)). Pure-win filter; date-compatible subtypes are kept.
  if (subtypeDisjointFromDating(p3.subtype, p2.date_floor, p2.date_ceiling)) {
    p3.subtype = null;
  }

  stage_outputs.p3 = p3;
}

const fieldValue = p6.valuation || valueBand(p3.display_form || p3.form, p2.range, digest);

const p7 = buildDecisionGuidance({
  gate: p1,
  dating: p2,
  form: p3,
  conflict: p5,
  valuation: fieldValue,
  digest,
  intake,
});

stage_outputs.p7 = p7; onPhase?.("p7", p7);

const recommendation = recommendationFromValue({
  askingPrice: intake?.asking_price,
  valueLow: fieldValue.low,
  valueHigh: fieldValue.high,
  confidenceBand: p1?.confidence_cap,
  conflictCount: Array.isArray(p5?.conflict_notes) ? p5.conflict_notes.length : 0,
  profile: intake?.picker_profile,
  largeForm: isLargeForm(p3.display_form || p3.form, intake?.approximate_height, intake?.approximate_width),
  repairSignals: hasRepairSignals(intake?.condition_notes, intake?.known_alterations),
});
  return {
    id: caseData.id,
    status: "complete",
    analysis_mode: intake?.analysis_mode || caseData.analysis_mode || "full_analysis",
    stage_outputs,
    observations: digest.observations,
    evidence_digest: digest,
    final_report: p6.summary,
    field_scan: {
      identification: p3.display_form || p3.form,
      confidence: p3.confidence,
      date_range: p2.range,
      valueRange: fieldValue.display,
      recommendation: recommendation.recommendation,
      recommendation_display: recommendation.label,
      recommendation_reasoning: recommendation.explanation,
    },
  };
},
};
 
