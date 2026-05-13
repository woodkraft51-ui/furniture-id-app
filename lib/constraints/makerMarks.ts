// makerMarks.ts
//
// Maker marks library. Phase 2 Session 6 expansion (Block 27+).
//
// Architecture:
// - MakerMarkEntry: canonical interface extending CanonicalEntry. Authored
//   per Maker_Mark_Replacement_Seed.docx canonical shape. Block 28 populates
//   the MAKER_ENTRIES array with ~78-82 entries.
// - MakerAttributionReasoningRule: meta-rule entries parallel to
//   WoodEvidenceReasoningRule. 8 entries authored in Block 27 from the seed's
//   Core Attribution Rule + 5 Universal False-Positive Rules + 4-tier
//   Confidence Ladder + Globe-Wernicke worked-example correction.
// - MakerMarkEntry_Legacy + MAKER_MARKS array: legacy 25-entry inventory
//   preserved verbatim for engine.ts compat per Block 27 D-MM27-9 Phase 2 /
//   Phase 3 separation. Phase 3 weighting integration block activates the new
//   schema and deprecates legacy.

import type {
  CanonicalEntry,
  AntiClassificationGuidance,
  PeriodAssociation,
  PositionOnPiece,
  ReasoningRuleMigrationTarget,
} from "./entryShape";

/**
 * MarkType enum — 13 canonical mark types from
 * Maker_Mark_Replacement_Seed.docx + "unknown" appraiser-honest fallback per
 * Block 27 D-MM27-6. Replaces the legacy 10-value mark_type literal-union
 * which had 5 dead-coded values (branded_mark, metal_tag, decal, signature,
 * unknown) and conflated paper_label vs label. The new enum aligns to seed
 * canonical categories with disambiguated naming.
 */
export type MarkType =
  | "branded_stamp"
  | "paper_label"
  | "foil_label"
  | "decal"
  | "stencil"
  | "metal_tag"
  | "burned_mark"
  | "ink_stamp"
  | "impressed_mark"
  | "serial_style_number"
  | "catalog_plate"
  | "retailer_label"
  | "association_mark"
  | "unknown";

/**
 * MakerMarkEntry — canonical maker-mark entry per Block 27 D-MM27-4.
 * Extends CanonicalEntry. category literal-typed to "maker_mark". 15 declared
 * fields per Maker_Mark_Replacement_Seed.docx canonical entry shape.
 *
 * Field roster sources:
 * - maker_name, region, furniture_categories, known_mark_types, known_wording,
 *   visual_traits, mark_text_patterns, dating_clues, false_positive_warnings,
 *   attribution_confidence_rule, related_names: direct from seed canonical
 *   entry-shape spec.
 * - common_mark_locations: PositionOnPiece[] per D-MM27-7 (first non-wood
 *   library to exercise the cross-library PositionOnPiece architecture from
 *   entryShape.ts).
 * - period_associations: PeriodAssociation[] per D-MM27-2 cross-library
 *   PeriodAssociation reuse.
 * - anti_classification_guidance: optional AntiClassificationGuidance |
 *   AntiClassificationGuidance[] for maker emergence/extinction dates (firm
 *   founding year; firm cessation year; major name-change boundaries) per
 *   Block 16 AntiClassificationGuidance relocation precedent.
 *
 * Authority calibration per D-MM27-8: Block 28 populates per-entry authority
 * from seed Attribution Confidence Rule per maker (expected range 6-8/6-8
 * depending on attribution rigor required for the specific maker).
 */
export interface MakerMarkEntry extends CanonicalEntry {
  category: "maker_mark";

  /** Canonical maker name (e.g., "Globe-Wernicke Co.", "L. & J.G. Stickley"). */
  maker_name: string;

  /** Geographic region of production (city / state / country as applicable). */
  region: string;

  /** Furniture categories the maker produced (e.g., ["bookcase", "office_storage"]). */
  furniture_categories: string[];

  /** Mark types this maker used per MarkType enum. */
  known_mark_types: MarkType[];

  /** Where on the piece the maker's marks typically appear per Block 22.5
   * D-PA-1 PositionOnPiece architecture. First non-wood library to exercise
   * the cross-library PositionOnPiece artifact per D-MM27-7. */
  common_mark_locations: PositionOnPiece[];

  /** Canonical wording strings that appear on the maker's marks. */
  known_wording: string[];

  /** Free-form visual-trait prose describing what the mark looks like
   * (typography, logo elements, color, paper stock, etc.). */
  visual_traits: string;

  /** Substring patterns for engine text-match against extracted mark text.
   * Subset / normalized form of known_wording optimized for case-insensitive
   * includes matching. Parallels the legacy MAKER_MARKS mark_text_patterns
   * field. */
  mark_text_patterns: string[];

  /** Period associations covering the maker's active production window(s).
   * Reuses cross-library PeriodAssociation per D-MM27-2. */
  period_associations: PeriodAssociation[];

  /** Free-form prose describing how this maker's marks help with dating
   * (date-stamp formats; label-version chronology; address changes; etc.). */
  dating_clues: string;

  /** Known false-positive scenarios for this maker — patterns that look like
   * this maker's marks but are not (initials ambiguity; line names; retail
   * labels; etc.). Supports rule #2-#6 Universal False-Positive Rules. */
  false_positive_warnings: string[];

  /** Maker-specific attribution confidence rule prose. Per-maker
   * operationalization of the Core Attribution Rule (D-MM27-N rule #1) and
   * Universal False-Positive Rules (rules #2-#6). Block 28 populates from seed
   * per-maker Attribution Confidence Rule content. */
  attribution_confidence_rule: string;

  /** Related names: subsidiaries, predecessor/successor firms, sister
   * companies, licensed manufacturers, common confusable makers. */
  related_names: string[];

  /** Optional maker emergence/extinction date boundaries (firm founding year,
   * cessation year, major name-change boundaries). Reuses cross-library
   * AntiClassificationGuidance per Block 16 relocation precedent. */
  anti_classification_guidance?:
    | AntiClassificationGuidance
    | AntiClassificationGuidance[];
}

/**
 * MakerAttributionReasoningRule — meta-rule entries governing maker-
 * attribution evidence interpretation. Parallel shape to
 * WoodEvidenceReasoningRule in woodEvidence.ts. Authored Block 27 per
 * D-MM27-5; 8 entries cover the seed Core Attribution Rule + 5 Universal
 * False-Positive Rules + 4-tier Confidence Ladder + Globe-Wernicke worked-
 * example correction.
 *
 * Authority calibration per D-WE22-11 / D-WE26-8 meta-rule supremacy: 9/9 on
 * all reasoning-rule entries. migration_status: "complete" convention per
 * Block 26 D-WE26-11 applies.
 */
export interface MakerAttributionReasoningRule extends CanonicalEntry {
  category: "maker_attribution_reasoning_rule";

  /** Short canonical name for the rule. */
  rule_name: string;

  /** Canonical rule statement. */
  rule_statement: string;

  /** Appraiser-voice rationale explaining why the rule holds and how it
   * conditions maker-attribution evidence weighting. */
  rationale: string;

  /** Eventual integration point per cross-library
   * ReasoningRuleMigrationTarget enum. */
  migration_target: ReasoningRuleMigrationTarget;

  /** Optional list of entry types or specific entry ids this rule conditions. */
  applies_to_entry_types?: string[];

  /** True for rules that govern reasoning across all evidence libraries
   * (parallel to WoodEvidenceReasoningRule.cross_layer_scope per D-WE26-6 /
   * D-PA-1 Independent Layer Evaluation Standard canonicalization). False
   * or omitted for maker-attribution-layer-only rules. */
  cross_layer_scope?: boolean;
}

/**
 * MAKER_ENTRIES — canonical per-maker library. Empty in Block 27 scaffold;
 * Block 28 authors ~78-82 entries from Maker_Mark_Replacement_Seed.docx
 * canonical maker content per D-MM27-10.
 */
export const MAKER_ENTRIES: MakerMarkEntry[] = [];

/**
 * MAKER_ATTRIBUTION_REASONING_RULES — meta-rule entries authored Block 27.
 * 8 entries: 1 core attribution rule + 5 universal false-positive rules + 1
 * confidence ladder + 1 Globe-Wernicke worked-example correction. All 9/9
 * authority; migration_target distribution: 7 engine_reasoning + 1
 * report_layer; cross_layer_scope: true on rule #1 only.
 */
export const MAKER_ATTRIBUTION_REASONING_RULES: MakerAttributionReasoningRule[] = [
  {
    id: "maker_attribution_reasoning_core_attribution_rule",
    category: "maker_attribution_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Core Maker Attribution Rule",
    rule_statement: "A furniture maker mark should only create a high-confidence maker attribution when at least one of these is present: (a) full or near-full maker name (e.g., 'Globe-Wernicke Co.', 'The Lane Co.', 'Drexel', 'Heywood-Wakefield', 'Berkey & Gay'); (b) known branded device plus supporting context (e.g., Stickley shopmark, Heywood-Wakefield eagle stamp, Lane serial/style label, Hitchcock stencil, Grand Rapids Association triangle); (c) maker-specific serial, style, model, or label format matching known placement and construction; or (d) retail label plus separate construction or form evidence (weak clue alone unless the label explicitly identifies the manufacturer). Initials alone are low authority unless contained within a known maker-specific device, label, stencil, burn mark, paper tag, or model-code format.",
    rationale: "Per Maker_Mark_Replacement_Seed.docx Core Attribution Rule (foundational meta-rule for the app). Maker mark evidence accumulates across multiple signal types: visible text, brand devices, structured format, contextual placement. No single signal type alone supports confident attribution; the four-criteria gate ensures evidence sufficiency before the engine surfaces a maker as a high-confidence attribution. The rule cross-references the 5 Universal False-Positive Rules (initials/city/association/retail/line-name disciplines) which define what DOES NOT qualify; this rule defines what DOES.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["maker_mark", "maker_attribution_reasoning_rule"],
    cross_layer_scope: true,
    notes: "Foundational meta-rule for the maker-attribution evidence-accumulation layer. cross_layer_scope: true reflects that this rule governs how maker-mark evidence combines with construction/form/material evidence at the report layer — high confidence requires both maker attribution rule satisfaction AND non-maker evidence alignment per Independent Layer Evaluation Standard (D-WE26-6). Phase 3 weighting integration consumes via engine_reasoning target.",
  },
  {
    id: "maker_attribution_reasoning_universal_initials_not_enough",
    category: "maker_attribution_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Universal Rule: Initials Are Not Enough",
    rule_statement: "Initials, monograms, or 2-3 character abbreviations alone do NOT establish maker attribution. Examples: 'GW' alone does not identify Globe-Wernicke; 'B&G' alone does not identify Berkey & Gay. Initials may identify a maker ONLY when (a) they appear within a known maker-specific device, label, stencil, burn mark, paper tag, or model-code format; OR (b) they appear in a documented maker-specific contextual placement (e.g., Berkey & Gay underside marble-top initials in matching construction context). The engine must NOT auto-attribute initials to a maker without contextual evidence; surface initials-alone matches at LOW confidence with explicit caveat.",
    rationale: "Per seed Universal False-Positive Rule #1. Initials are frequently retailer labels, owner marks, inventory marks, shipping marks, factory batch marks, repair shop initials, or family monograms — NOT maker marks. Auto-attributing 'GW' to Globe-Wernicke or 'B&G' to Berkey & Gay produces confidently-wrong attributions in these false-positive scenarios. The rule is the foundational discipline that the Globe-Wernicke worked example (rule #8) operationalizes.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["maker_mark"],
    cross_layer_scope: false,
    notes: "Operationalized in rule #8 (Globe-Wernicke worked example). Future maker entries may carry maker-specific initials-context rules in their attribution_confidence_rule field; this rule is the universal default when no specific context applies.",
  },
  {
    id: "maker_attribution_reasoning_universal_city_not_maker",
    category: "maker_attribution_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Universal Rule: A City Name Is Not a Maker",
    rule_statement: "Place names (cities, regions, towns) alone do NOT establish maker attribution. 'Grand Rapids', 'Chicago', 'Buffalo', 'Jamestown', 'Lenoir', 'High Point', 'Gardner, Mass.', and similar place identifications support regional production attribution at most (one of several plausible makers in that production center) but do not select a specific maker. The engine must NOT auto-attribute a piece to a specific maker based solely on city or region appearing on a mark; surface as 'regional evidence' rather than 'maker attribution'.",
    rationale: "Per seed Universal False-Positive Rule #2. Major American furniture production centers housed many firms simultaneously (Grand Rapids alone had Berkey & Gay, Widdicomb, John Widdicomb, Sligh, Imperial, Phoenix, Limbert, Baker, Kindel, Stickley Brothers, Macey, Gunn, and others). City attribution narrows the maker candidate pool but does not select a maker. Cross-reference rule #4 (association marks are not single-maker marks) for the related case of regional association trademarks (e.g., Grand Rapids Furniture Association triangle).",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["maker_mark"],
    cross_layer_scope: false,
    notes: "Output framing: 'Mark indicates [city] regional production; specific maker requires further evidence.' Cross-references rule #4 for association-mark cases.",
  },
  {
    id: "maker_attribution_reasoning_universal_association_not_single",
    category: "maker_attribution_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Universal Rule: Association Marks Are Not Single-Maker Marks",
    rule_statement: "Regional production association marks (e.g., Grand Rapids Furniture Association triangle, Furniture Manufacturers Association labels) identify GROUP membership in the association, not individual maker attribution. The engine must surface association marks as regional/group evidence and explicitly NOT select a specific maker from the association membership unless paired with a separate maker-specific mark or label.",
    rationale: "Per seed Universal False-Positive Rule #3. The Grand Rapids furniture triangle trademark was a regional association mark protecting Grand Rapids manufacture against inferior imitations. It supports Grand Rapids manufacture (regional evidence) but does not identify which Grand Rapids maker produced the piece. Auto-attributing association marks to specific makers produces confidently-wrong attributions across the association membership pool.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["maker_mark"],
    cross_layer_scope: false,
    notes: "When association mark is the only mark present, output framing: '[Association] regional production indicated; specific maker requires separate maker-specific mark.' When association mark co-occurs with a maker-specific mark, the maker-specific mark is the attribution anchor.",
  },
  {
    id: "maker_attribution_reasoning_universal_retail_not_maker",
    category: "maker_attribution_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Universal Rule: Retail Labels Are Not Always Maker Labels",
    rule_statement: "Retail labels from department stores, furniture stores, decorators, or upholsterers identify sales-channel provenance but NOT necessarily manufacturer. The engine must distinguish between (a) maker labels that identify the manufacturing firm; (b) retail labels that identify the sales channel; (c) decorator/upholsterer labels that identify post-manufacture work. Retail labels are treated as provenance evidence rather than maker attribution unless the retail label explicitly identifies the manufacturer (some retail labels do — e.g., 'Manufactured by [maker] for [retailer]').",
    rationale: "Per seed Universal False-Positive Rule #4. The seed notes: 'Department stores, furniture stores, decorators, and upholsterers often labeled pieces they sold or serviced. Treat them as provenance or sales-channel evidence unless they explicitly identify the manufacturer.' Auto-attributing retail labels to the labeled firm produces confidently-wrong attributions across the broad retail distribution network.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["maker_mark"],
    cross_layer_scope: false,
    notes: "Output framing: '[Retail label] indicates sales-channel provenance through [firm]; manufacturer requires separate maker mark or manufactured-by wording.'",
  },
  {
    id: "maker_attribution_reasoning_universal_line_name_not_maker",
    category: "maker_attribution_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Universal Rule: Line Names Are Not Always Maker Names",
    rule_statement: "Product line names, designer names, or licensed collection names do NOT alone establish manufacturer attribution. Examples: 'Declaration' (could be Drexel Declaration line); 'Brasilia' (could be Broyhill Brasilia); 'Eames' (designer; licensed manufacturer required — typically Herman Miller); 'Saarinen' (designer; typically Knoll); 'Colonial Williamsburg' (licensed reproduction program; Kittinger was the 1937-1990 exclusive licensee). The engine must surface line/designer names as line-level evidence and verify manufacturer attribution via separate maker mark, label, or stamp.",
    rationale: "Per seed Universal False-Positive Rule #5. Line names are widely adopted across the furniture industry; a 'Brasilia' chair could be Broyhill Brasilia, Brasilia-style knockoff, or a different maker's similar-named line. Designer names without manufacturer co-attribution are style-evidence at most (Eames-style, Saarinen-style). Licensed reproduction programs (Colonial Williamsburg) require the manufacturer-license-holder identification.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["maker_mark"],
    cross_layer_scope: false,
    notes: "Output framing: '[Line name] indicates style/line affiliation with [reference]; specific maker requires [manufacturer mark | license-holder confirmation | catalog match].' Designer-line cases (Eames, Saarinen, Bertoia, Nelson, etc.) cross-reference licensed-manufacturer maker entries (Herman Miller, Knoll).",
  },
  {
    id: "maker_attribution_reasoning_confidence_ladder",
    category: "maker_attribution_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Maker Mark Attribution Confidence Ladder",
    rule_statement: "Maker-attribution confidence resolves to one of four tiers: HIGH confidence (full maker name visible + known label/stamp/device present + correct placement + construction and form consistent + date range does not conflict with materials/fasteners); MEDIUM confidence (partial label visible + known city/line/model appears + construction and form strongly align + full maker name missing or damaged); LOW confidence (initials/chalk marks/shipping marks/numbers present + no full maker name + no known label format + no maker-specific device); NEGATIVE/CONFLICT flag (mark suggests maker/date but materials or construction conflict). Report rendering surfaces the tier plus the specific evidence basis.",
    rationale: "Per seed 'App-safe maker mark confidence ladder' section. The four-tier ladder operationalizes the Core Attribution Rule (rule #1) at the report layer: report prose explicitly states the confidence tier and the evidence basis for that tier, rather than asserting a maker attribution without confidence framing. Negative/conflict flag captures the case where mark suggests a maker but construction evidence contradicts (e.g., claimed 1880 maker with Phillips screws or post-1930 fasteners) — the engine surfaces the conflict rather than picking a side.",
    migration_target: "report_layer",
    applies_to_entry_types: ["maker_mark"],
    cross_layer_scope: false,
    notes: "Operationalized at report rendering: confidence tier label injected into report prose plus evidence basis citation. Conflict-flag handling cross-references the Independent Layer Evaluation Standard (D-WE26-6) — when maker-mark evidence and construction-evidence conflict, the report surfaces the conflict for user decision rather than resolving upstream by deferring one layer to the other.",
  },
  {
    id: "maker_attribution_reasoning_globe_wernicke_correction",
    category: "maker_attribution_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Globe-Wernicke Attribution Correction",
    rule_statement: "Globe-Wernicke maker attribution proceeds ONLY when one of the following is satisfied: (a) text contains 'Globe-Wernicke,' 'Globe Wernicke,' 'The Globe-Wernicke Co.', or a known Globe-Wernicke label/device; (b) object is a sectional/barrister bookcase with Globe-Wernicke-style hardware AND a full label or hardware/catalog confirmation. Text containing only 'GW,' 'G.W.,' 'G W,' or an ambiguous monogram must NOT be auto-attributed to Globe-Wernicke. If object is not a bookcase, file, desk, or office/storage form, confidence is sharply reduced even with partial label evidence. Full attribution requires reconciliation with construction, hardware, sectional stacking system, finish, and label placement.",
    rationale: "Per seed 'Immediate correction to the Globe-Wernicke rule' section. The seed explicitly corrects a pattern in current legacy logic ('GW -> Globe-Wernicke') as too aggressive — auto-attributing 'GW' initials to Globe-Wernicke produces confidently-wrong attributions when GW appears as monogram, owner initials, drawer chalk mark, shipping mark, or retailer code. This rule is the worked operationalization of the Universal Initials Not Enough rule (rule #2) applied to the specific Globe-Wernicke case. Future maker entries with similar initials-ambiguity cases (B&G for Berkey & Gay; etc.) may carry analogous operationalizations in their attribution_confidence_rule field per entry.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["maker_mark_globe_wernicke_co"],
    cross_layer_scope: false,
    notes: "Forward-references the maker_mark_globe_wernicke_co entry id which Block 28 authors. D-MM27-12 captures the forward-reference for traceability. Block 28 commits to the canonical id form when authoring the Globe-Wernicke maker entry; the rule's applies_to_entry_types FK reference becomes resolvable upon Block 28 ship. Until Block 28, the forward-reference is a string-content placeholder (not type-checked at compile time; canonical content is locked). Output framing per seed suggested app language: 'Detected initials GW. Initials alone are not a maker mark. Globe-Wernicke attribution requires full Globe-Wernicke wording, a recognized label/tag, or maker-specific sectional bookcase evidence.'",
  },
];

/**
 * MakerMarkEntry_Legacy — legacy type alias preserved verbatim for engine.ts
 * compat per Block 27 D-MM27-9 / D-MM27-11. Renamed from MakerMarkEntry in
 * Block 27 to free the canonical name for the new interface. Engine.ts:2
 * imports the MAKER_MARKS array (value-import only); the type rename is
 * type-safe and engine-non-breaking. Phase 3 weighting integration block
 * activates the new MakerMarkEntry interface and deprecates this legacy
 * alias.
 */
export type MakerMarkEntry_Legacy = {
  id: string;
  maker: string;
  mark_text_patterns: string[];
  mark_type:
  | "paper_label"
  | "branded_mark"
  | "brand"
  | "stamp"
  | "stencil"
  | "label"
  | "metal_tag"
  | "decal"
  | "signature"
  | "unknown";
  date_range: string;
  confidence_weight: number; // 0–1 scale
  dating_authority: "high" | "moderate" | "low";
  notes?: string;
};

/**
 * MAKER_MARKS — legacy 25-entry inventory preserved verbatim for engine.ts
 * compat per Block 27 D-MM27-9. engine.ts:2 import + engine.ts:2349 /
 * engine.ts:3293 consumption sites unchanged. Phase 3 weighting integration
 * activates MAKER_ENTRIES and deprecates this legacy array.
 */
export const MAKER_MARKS: MakerMarkEntry_Legacy[] = [
  {
    id: "globe_wernicke_paper_label_early",
    maker: "Globe-Wernicke",
    mark_text_patterns: ["Globe Wernicke", "Globe-Wernicke Co"],
    mark_type: "paper_label",
    date_range: "1899–1915",
    confidence_weight: 0.95,
    dating_authority: "high",
    notes: "Early paper label used on sectional bookcases prior to corporate changes.",
  },
  {
    id: "globe_wernicke_stamped_mark_late",
    maker: "Globe-Wernicke",
    mark_text_patterns: ["Globe-Wernicke Co Cincinnati"],
    mark_type: "stamp",
    date_range: "1916–1930",
    confidence_weight: 0.92,
    dating_authority: "high",
    notes: "Later stamped mark following corporate restructuring.",
  },
  {
  id: "john_henry_belter_label",
  maker: "John Henry Belter",
  mark_text_patterns: ["Belter", "J.H. Belter"],
  mark_type: "paper_label",
  date_range: "1845–1865",
  confidence_weight: 0.98,
  dating_authority: "high",
  notes: "Rococo Revival laminated rosewood furniture maker; labels are rare but definitive."
},
{
  id: "hitchcock_chair_company_label",
  maker: "Hitchcock Chair Company",
  mark_text_patterns: ["Hitchcock", "Hitchcocksville", "Hitchcock Chair Co"],
  mark_type: "stencil",
  date_range: "1820–1880; revival 1940–present",
  confidence_weight: 0.9,
  dating_authority: "moderate",
  notes: "Stencil marks require context to distinguish original vs revival."
},
{
  id: "berkey_and_gay_label",
  maker: "Berkey & Gay",
  mark_text_patterns: ["Berkey & Gay", "Berkey and Gay"],
  mark_type: "paper_label",
  date_range: "1890–1929",
  confidence_weight: 0.95,
  dating_authority: "high",
  notes: "Grand Rapids manufacturer; labels are strong indicators of production era."
},
{
  id: "l_jg_stickley_mark",
  maker: "L. & J.G. Stickley",
  mark_text_patterns: ["L & JG Stickley", "Stickley Fayetteville", "Handcraft"],
  mark_type: "brand",
  date_range: "1900–1916",
  confidence_weight: 0.98,
  dating_authority: "high",
  notes: "True Arts & Crafts Stickley production."
},
{
  id: "stickley_brothers_mark",
  maker: "Stickley Brothers Company",
  mark_text_patterns: ["Stickley Bros", "Stickley Brothers"],
  mark_type: "paper_label",
  date_range: "1891–1950",
  confidence_weight: 0.9,
  dating_authority: "moderate",
  notes: "Separate company from L&JG; often confused."
},
{
  id: "thonet_mark",
  maker: "Thonet",
  mark_text_patterns: ["Thonet", "Gebruder Thonet"],
  mark_type: "stamp",
  date_range: "1850–1930",
  confidence_weight: 0.95,
  dating_authority: "high",
  notes: "Bentwood furniture pioneer; marks vary by factory."
},
{
  id: "wallace_nutting_label",
  maker: "Wallace Nutting",
  mark_text_patterns: ["Wallace Nutting"],
  mark_type: "paper_label",
  date_range: "1900–1941",
  confidence_weight: 0.9,
  dating_authority: "moderate"
},
  {
  id: "herman_miller_label",
  maker: "Herman Miller",
  mark_text_patterns: ["Herman Miller"],
  mark_type: "label",
  date_range: "1923–present",
  confidence_weight: 0.95,
  dating_authority: "high"
},
{
  id: "knoll_label",
  maker: "Knoll",
  mark_text_patterns: ["Knoll", "Knoll Associates"],
  mark_type: "label",
  date_range: "1938–present",
  confidence_weight: 0.95,
  dating_authority: "high"
},
{
  id: "saarinen_label",
  maker: "Eero Saarinen / Knoll",
  mark_text_patterns: ["Saarinen", "Knoll Saarinen"],
  mark_type: "label",
  date_range: "1940–1960",
  confidence_weight: 0.97,
  dating_authority: "high",
  notes: "Designer-linked identification; extremely high value impact."
},
{
  id: "heywood_wakefield_mark",
  maker: "Heywood-Wakefield",
  mark_text_patterns: ["Heywood Wakefield"],
  mark_type: "stamp",
  date_range: "1897–1969",
  confidence_weight: 0.95,
  dating_authority: "high"
},
  {
  id: "kittinger_label",
  maker: "Kittinger Furniture",
  mark_text_patterns: ["Kittinger"],
  mark_type: "label",
  date_range: "1886–present",
  confidence_weight: 0.95,
  dating_authority: "high"
},
{
  id: "baker_furniture_label",
  maker: "Baker Furniture",
  mark_text_patterns: ["Baker Furniture"],
  mark_type: "label",
  date_range: "1890–present",
  confidence_weight: 0.95,
  dating_authority: "high"
},
{
  id: "kindel_furniture_label",
  maker: "Kindel Furniture",
  mark_text_patterns: ["Kindel"],
  mark_type: "label",
  date_range: "1901–present",
  confidence_weight: 0.95,
  dating_authority: "high"
},
{
  id: "karges_furniture_label",
  maker: "Karges Furniture",
  mark_text_patterns: ["Karges"],
  mark_type: "label",
  date_range: "1886–present",
  confidence_weight: 0.95,
  dating_authority: "high"
},
  {
  id: "drexel_heritage_label",
  maker: "Drexel Heritage",
  mark_text_patterns: ["Drexel", "Drexel Heritage"],
  mark_type: "label",
  date_range: "1903–present",
  confidence_weight: 0.9,
  dating_authority: "moderate"
},
{
  id: "broyhill_label",
  maker: "Broyhill Furniture",
  mark_text_patterns: ["Broyhill"],
  mark_type: "label",
  date_range: "1926–present",
  confidence_weight: 0.9,
  dating_authority: "moderate"
},
{
  id: "lane_furniture_label",
  maker: "Lane Furniture",
  mark_text_patterns: ["Lane"],
  mark_type: "stamp",
  date_range: "1912–present",
  confidence_weight: 0.9,
  dating_authority: "moderate"
},
{
  id: "ethan_allen_label",
  maker: "Ethan Allen",
  mark_text_patterns: ["Ethan Allen"],
  mark_type: "label",
  date_range: "1932–present",
  confidence_weight: 0.9,
  dating_authority: "moderate"
},
{
  id: "thomasville_label",
  maker: "Thomasville",
  mark_text_patterns: ["Thomasville"],
  mark_type: "label",
  date_range: "1904–present",
  confidence_weight: 0.9,
  dating_authority: "moderate"
},
  {
  id: "toledo_metal_furniture_label",
  maker: "Toledo Metal Furniture Co.",
  mark_text_patterns: ["Toledo Metal Furniture"],
  mark_type: "stamp",
  date_range: "1920–1960",
  confidence_weight: 0.95,
  dating_authority: "high"
},
  {
    id: "roos_sweetheart_label",
    maker: "Ed Roos Company",
    mark_text_patterns: [
      "Roos",
      "Sweetheart",
      "Sweetheart Cedar Chest",
      "Genuine Sweetheart",
      "Ed Roos Company",
      "Forest Park"
    ],
    mark_type: "paper_label",
    date_range: "1920–1939",
    confidence_weight: 0.95,
    dating_authority: "high",
    notes: "Sweetheart label era; one of multiple Roos label variants. Heart-and-sweetheart graphic with 'Genuine Sweetheart Cedar Chest' text. Ed Roos Company name and Forest Park, IL address typically appear. Earlier Roos label variants (Roos Mfg. Co. Chicago, Ed Roos Company pre-Sweetheart, tree symbol) are not yet canonical pending appraiser research; see audit log.",
  },
  {
  id: "globe_wernicke_gw_office_equip_service_label",
  maker: "Globe-Wernicke",
  mark_text_patterns: [
    "G W",
    "GW",
    "Office Equip Service",
    "Office Equipment Service",
    "Dependable Quality"
  ],
  mark_type: "paper_label",
  date_range: "c. 1920–1940",
  confidence_weight: 0.82,
  dating_authority: "moderate",
  notes: "Partial GW shield-style office equipment/service label. Treat as a moderate-confidence Globe-Wernicke-related label unless fuller wording is visible.",
},
];
