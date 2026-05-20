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

  /**
   * Block 23 schema extension (parallel to Blocks 17/19/20/21/22 pattern).
   * Engine surfaces this field via getCanonicalCautionText when a maker
   * clue fires. The shared CanonicalEntry.caution_text field is NOT
   * engine-read; diagnostic warning text intended for user-facing
   * surfacing must live here. Authored content target: the seed's
   * Confidence Rule + False Positive Warning prose per-maker (highest-
   * authority appraiser-voice content). Populated during the eventual
   * Phase 3 engine integration when MAKER_ENTRIES is wired in.
   */
  diagnostic_caution_text?: string;
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
export const MAKER_ENTRIES: MakerMarkEntry[] = [
  // ─────────────────────────────────────────────────────────────
  // BATCH 1 — Early American & Regional Cabinetmaking (2 entries)
  // ─────────────────────────────────────────────────────────────
  {
    id: "maker_mark_cabinetmaker_paper_labels_and_inscriptions",
    category: "maker_mark",
    positive_authority: 5,
    hard_negative_authority: 6,
    indicator_text: "Early-American cabinetmaker paper labels, trade labels, and handwritten inscriptions on furniture from late 18th to mid-19th century.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Early American and Regional Cabinetmaking section. Generic-discipline maker entry covering the broad cabinetmaker-label class rather than a specific firm. Per-firm cabinetmaker entries (Phyfe, Belter, etc.) live in the Victorian batch.",
    maker_name: "Cabinetmaker paper labels and inscriptions (generic)",
    region: "Various American colonies and early states",
    furniture_categories: ["case_furniture", "tables", "clock_cases", "secretaries"],
    known_mark_types: ["paper_label", "stencil", "ink_stamp", "impressed_mark"],
    common_mark_locations: [
      { physical_location: "drawer_bottom" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside", physical_location_notes: "underside of tables" },
      { physical_location: "case_interior_framing", physical_location_notes: "secretary interiors and clock cases" },
    ],
    known_wording: ["made by", "cabinetmaker", "manufacturer"],
    visual_traits: "Printed paper trade labels, handwritten ink inscriptions, chalk marks, pencil workmen marks, shipping marks. Wording varies widely by shop and period.",
    mark_text_patterns: ["made by", "cabinetmaker", "manufacturer"],
    period_associations: [
      { period_label: "Late 18th to mid-19th century cabinetmaker label era", date_floor: 1770, date_ceiling: 1860,
        usage_notes: "Per seed Date Range: 'Mostly late 18th to mid-19th century, with earlier exceptions.'" },
    ],
    dating_clues: "Wording (printer typography; trade-label engraving style); paper stock and ink chemistry can date labels independently of construction. Handwritten inscriptions vary by shop hand.",
    false_positive_warnings: [
      "Handwritten names may be owner names, mover marks, repairer notes, or family names rather than maker marks (per seed Early American False Positive Warning).",
      "Chalk and pencil workmen marks may be batch / inventory / shipping marks rather than maker attribution.",
    ],
    attribution_confidence_rule: "Treat as high confidence only if wording clearly says 'made by,' 'cabinetmaker,' 'manufacturer,' or includes a known trade label.",
    related_names: [],
  },
  {
    id: "maker_mark_shaker_communities",
    category: "maker_mark",
    positive_authority: 4,
    hard_negative_authority: 7,
    indicator_text: "Shaker community-produced furniture, late 18th century through early 20th century, with later reproductions and Shaker-style imitations widespread.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Early American section Shaker entry. Low positive_authority reflects that most Shaker pieces are unmarked; high hard_negative_authority reflects very common 'Shaker style' misattribution to utility pieces and reproductions.",
    maker_name: "Shaker communities (Mount Lebanon, Hancock, Canterbury, Pleasant Hill, Union Village, Sabbathday Lake, etc.)",
    region: "New York, Massachusetts, New Hampshire, Kentucky, Ohio, Maine",
    furniture_categories: ["chairs", "case_goods", "tables", "boxes_and_carriers", "religious_community_furniture"],
    known_mark_types: ["paper_label", "ink_stamp", "stencil"],
    common_mark_locations: [
      { physical_location: "case_back", physical_location_notes: "institutional / community marks where present" },
      { physical_location: "underside" },
      { physical_location: "drawer_bottom" },
    ],
    known_wording: ["Mount Lebanon", "Hancock", "Canterbury", "Pleasant Hill", "Sabbathday Lake"],
    visual_traits: "Simple, austere construction; pegged joints; ladder-back chairs; tilters on chair backs; minimal carving or decoration. Pieces often unmarked.",
    mark_text_patterns: ["shaker", "mount lebanon", "hancock", "canterbury", "pleasant hill", "sabbathday lake"],
    period_associations: [
      { period_label: "Shaker community production era", date_floor: 1780, date_ceiling: 1920,
        usage_notes: "Per seed Date Range: 'Late 18th century through early 20th century production, with later reproductions.'" },
    ],
    dating_clues: "Community-specific construction details (tilter design, ladder-back proportions); chair-tape patterns; wood preferences vary by community. Provenance and institutional history typically more reliable than marks for dating.",
    false_positive_warnings: [
      "Simple, austere construction alone is not enough to call something Shaker (per seed False Positive Warning). Many utility pieces and later reproductions imitate Shaker traits.",
      "Shaker-style 20th-century reproductions (1950s onward) are widespread and frequently misattributed.",
    ],
    attribution_confidence_rule: "Require provenance, community-specific construction, or documented institutional history for high-confidence Shaker attribution. Style alone is insufficient.",
    related_names: ["Shaker reproductions"],
  },
  // ─────────────────────────────────────────────────────────────
  // BATCH 2 — 19th-Century and Victorian Makers (10 entries)
  // ─────────────────────────────────────────────────────────────
  {
    id: "maker_mark_duncan_phyfe",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Duncan Phyfe (c. 1790s-1847) New York City Neoclassical cabinetmaker; widespread 'Phyfe-style' revivals.",
    notes: "Per Maker_Mark_Replacement_Seed.docx 19th-Century section. High hard_negative_authority reflects extremely common 'Duncan Phyfe style' over-attribution to any Neoclassical New York furniture.",
    maker_name: "Duncan Phyfe",
    region: "New York City",
    furniture_categories: ["dining_furniture", "card_tables", "sofas", "chairs", "case_pieces", "neoclassical_forms"],
    known_mark_types: ["paper_label", "ink_stamp"],
    common_mark_locations: [
      { physical_location: "underside", physical_location_notes: "under tabletops" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "frame_rail", physical_location_notes: "underside rails" },
    ],
    known_wording: ["D. Phyfe", "Duncan Phyfe"],
    visual_traits: "When present, marks may identify 'D. Phyfe' or New York cabinetmaking. Saber legs, lyres, brass paw feet, and reeded columns are characteristic style elements but appear on countless revival pieces.",
    mark_text_patterns: ["d. phyfe", "duncan phyfe", "d.phyfe"],
    period_associations: [
      { period_label: "Duncan Phyfe workshop activity", date_floor: 1792, date_ceiling: 1847,
        usage_notes: "Per seed Date Range: 'c. 1790s to 1847 workshop activity.'" },
      { period_label: "Phyfe-style revival period", date_floor: 1880, date_ceiling: 1940,
        usage_notes: "Per seed: 'later Phyfe-style revivals.' Colonial Revival and Federal Revival programs widely reproduced Phyfe-style furniture." },
    ],
    dating_clues: "Pre-1847 production only; revival labels and modern reproductions postdate. Construction details (secondary woods, joinery, hardware) date the piece independently of style.",
    false_positive_warnings: [
      "'Duncan Phyfe style' is extremely common and does not equal Duncan Phyfe maker attribution (per seed False Positive Warning).",
      "Saber legs, lyres, brass paw feet, and reeded columns are style evidence only, not maker evidence.",
      "Universal Rule #5 line_name_not_maker: 'Phyfe' as style descriptor versus 'D. Phyfe' as maker mark.",
    ],
    attribution_confidence_rule: "Do not attribute to Phyfe without label, provenance, or scholarly comparison.",
    related_names: ["Duncan Phyfe & Sons"],
  },
  {
    id: "maker_mark_lambert_hitchcock",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 8,
    indicator_text: "Lambert Hitchcock / Hitchcock Chair Company stenciled chairs and rockers, original early 19th-century production and mid-20th-century revival.",
    notes: "Per Maker_Mark_Replacement_Seed.docx 19th-Century section. Single entry covers both original and revival production; anti_classification_guidance encodes the 1948 revival boundary. Hard_negative_authority elevated due to widespread 'Hitchcock-style' stenciled chair reproductions and the original-vs-revival ambiguity.",
    maker_name: "Lambert Hitchcock / Hitchcock Chair Company",
    region: "Hitchcocksville (later Riverton), Connecticut",
    furniture_categories: ["chairs", "rockers", "rush_seat_chairs", "stenciled_seating"],
    known_mark_types: ["stencil", "paper_label"],
    common_mark_locations: [
      { physical_location: "upholstery_back", physical_location_notes: "back of seat (chair-back stencil)" },
      { physical_location: "frame_rail", physical_location_notes: "crest rail and rear rail" },
      { physical_location: "underside" },
    ],
    known_wording: ["L. Hitchcock. Hitchcocksville. Conn. Warranted.", "Hitchcock", "Hitchcocksville"],
    visual_traits: "Black or dark green painted chairs with gold/bronze stenciling. Stencil wording variants including 'L. Hitchcock. Hitchcocksville. Conn. Warranted.' Original production stenciling did not begin at the very start of operations; absence of stencil does not automatically disprove early production.",
    mark_text_patterns: ["l. hitchcock", "hitchcock", "hitchcocksville", "warranted"],
    period_associations: [
      { period_label: "Original Hitchcock production", date_floor: 1820, date_ceiling: 1864,
        usage_notes: "Per seed: 'Original Hitchcock production begins in the early 19th century.' Workshop closed in 1864 per industry history." },
      { period_label: "Hitchcock Chair Company revival production", date_floor: 1948,
        usage_notes: "Per seed Special Caution: 'a 1948 revival effort that recreated early styles, initially without the right to use the stenciled name.' Revival production continues; legitimate Hitchcock Company products but not early 19th-century originals." },
    ],
    dating_clues: "Stencil typography and paint chemistry differ between original (1820s-1864) and revival (1948-onward) production. Construction details (secondary woods, fasteners, paint composition) date the piece independently of stencil wording.",
    false_positive_warnings: [
      "'Hitchcock style' stenciled chairs are common (per seed False Positive Warning). Similar black paint, rush seats, and gold stenciling alone are not enough.",
      "Mid-20th-century revival Hitchcock Company products may be legitimate but are not early 19th-century originals.",
      "Universal Rule #5 line_name_not_maker partially applies: 'Hitchcock-style' versus authentic L. Hitchcock workshop.",
    ],
    attribution_confidence_rule: "High confidence requires correct stencil wording, correct placement, correct chair form, appropriate finish, and construction consistent with the claimed period. Original vs revival attribution requires construction-evidence reconciliation.",
    related_names: ["Hitchcock Chair Company", "Hitchcock-Sanford & Co.", "Riverton Hitchcock"],
    anti_classification_guidance: {
      boundary_date: 1948,
      boundary_type: "form_emergence",
      guidance_text: "1948 marks the Hitchcock Chair Company revival boundary. Pieces predating 1948 may be original Lambert Hitchcock workshop production (1820-1864) OR post-workshop-closure intermediate production (1864-1948); pieces postdating 1948 are revival production. Construction evidence (paint composition, secondary woods, fastener types) must reconcile with claimed period independent of stencil wording. Per seed Special Caution.",
      prominence: "prominent",
    },
  },
  {
    id: "maker_mark_john_henry_belter",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 8,
    indicator_text: "John Henry Belter, c. 1840s-1860s New York City Rococo Revival furniture maker, laminated rosewood parlor furniture.",
    notes: "Per Maker_Mark_Replacement_Seed.docx 19th-Century section. Belter's patented laminated construction is more distinctive than any maker mark; most genuine pieces are unmarked.",
    maker_name: "John Henry Belter",
    region: "New York City",
    furniture_categories: ["parlor_furniture", "laminated_rosewood_chairs", "sofas", "tables", "rococo_revival_seating"],
    known_mark_types: ["paper_label", "ink_stamp"],
    common_mark_locations: [
      { physical_location: "underside" },
      { physical_location: "frame_rail", physical_location_notes: "seat rails" },
      { physical_location: "structural_reinforcement", physical_location_notes: "hidden frame components" },
    ],
    known_wording: ["Belter", "J.H. Belter", "John H. Belter"],
    visual_traits: "Patented laminated rosewood construction (typically 6-8 layers); high-quality carving; pierced backs with Rococo Revival floral and grape-vine motifs. Construction evidence more diagnostic than marks.",
    mark_text_patterns: ["belter", "j.h. belter", "john h. belter"],
    period_associations: [
      { period_label: "Belter workshop production", date_floor: 1844, date_ceiling: 1867,
        usage_notes: "Per seed Date Range: 'c. 1840s to 1860s.' Workshop closed shortly after Belter's 1863 death." },
    ],
    dating_clues: "Patented lamination technique (6-8 layers); high-quality hand carving; pierced rosewood backs. Patent and construction evidence often more important than labels.",
    false_positive_warnings: [
      "'Belter style' is frequently misapplied to any carved Rococo Revival rosewood parlor piece (per seed False Positive Warning).",
      "Many contemporaries (Roux, Meeks, others) made similar laminated parlor furniture; lamination alone is not Belter-specific.",
    ],
    attribution_confidence_rule: "Require laminated construction, high-quality carving, form comparison, provenance, or mark. Do not attribute from style alone.",
    related_names: ["J. H. Belter & Co."],
  },
  {
    id: "maker_mark_alexander_roux",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Alexander Roux, c. 1830s-1880s New York City Rococo and Renaissance Revival cabinetmaker.",
    notes: "Per Maker_Mark_Replacement_Seed.docx 19th-Century section.",
    maker_name: "Alexander Roux",
    region: "New York City",
    furniture_categories: ["parlor_furniture", "case_furniture", "rococo_revival", "renaissance_revival"],
    known_mark_types: ["paper_label", "stencil", "ink_stamp", "retailer_label"],
    common_mark_locations: [
      { physical_location: "case_back" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "underside" },
    ],
    known_wording: ["A. Roux", "Roux", "Alexander Roux", "479 Broadway"],
    visual_traits: "High-quality Rococo Revival and Renaissance Revival carved case furniture. Labels and stamps reasonably common compared to Belter; sometimes paired with retailer or cabinetmaker labels.",
    mark_text_patterns: ["a. roux", "alexander roux", "roux"],
    period_associations: [
      { period_label: "Alexander Roux workshop production", date_floor: 1836, date_ceiling: 1881,
        usage_notes: "Per seed Date Range: 'c. 1830s to 1880s.'" },
    ],
    dating_clues: "Address changes on labels can narrow date (Broadway addresses through 1860s).",
    false_positive_warnings: [
      "New York Rococo Revival does not automatically mean Roux (per seed False Positive Warning).",
      "Many contemporaries produced similar parlor and case furniture in New York during this era.",
    ],
    attribution_confidence_rule: "Require label, provenance, or strong construction and design match.",
    related_names: ["Roux & Co."],
  },
  {
    id: "maker_mark_herter_brothers",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Herter Brothers, c. 1860s through early 20th century, New York City elite Aesthetic Movement and Renaissance Revival custom interiors.",
    notes: "Per Maker_Mark_Replacement_Seed.docx 19th-Century section. High-end commissions for Vanderbilt, Morgan, and similar Gilded Age clients; documented commission attribution often more reliable than marks alone.",
    maker_name: "Herter Brothers",
    region: "New York City",
    furniture_categories: ["aesthetic_movement_furniture", "renaissance_revival", "custom_interiors", "high_style_case_goods"],
    known_mark_types: ["paper_label", "ink_stamp", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "case_back" },
      { physical_location: "underside" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
    ],
    known_wording: ["Herter Brothers", "Herter Bros", "Herter Bro's", "New York"],
    visual_traits: "Inlaid Aesthetic Movement and Renaissance Revival case furniture; ebonized finishes with marquetry; high-style commissioned work. Marks paired with associated interior documentation for elite commissions.",
    mark_text_patterns: ["herter brothers", "herter bros", "herter bro's"],
    period_associations: [
      { period_label: "Herter Brothers workshop production", date_floor: 1864, date_ceiling: 1906,
        usage_notes: "Per seed Date Range: 'c. 1860s to early 20th century.'" },
    ],
    dating_clues: "Commission records and documented interior schemes (Vanderbilt, Morgan, Mark Hopkins, etc.) date specific pieces independently of marks.",
    false_positive_warnings: [
      "High-style Aesthetic Movement furniture is often over-attributed (per seed False Positive Warning).",
      "Contemporary firms (Pottier & Stymus, Sypher & Co.) produced similar Aesthetic and Renaissance Revival furniture.",
    ],
    attribution_confidence_rule: "Require mark, provenance, documented commission, or very strong scholarly match.",
    related_names: ["Herter Bros & Co."],
  },
  {
    id: "maker_mark_pottier_and_stymus",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Pottier & Stymus, mid-to-late 19th century New York City Renaissance Revival and Aesthetic Movement high-style cabinetmakers.",
    notes: "Per Maker_Mark_Replacement_Seed.docx 19th-Century section.",
    maker_name: "Pottier & Stymus",
    region: "New York City",
    furniture_categories: ["renaissance_revival", "aesthetic_movement", "high_style_parlor", "case_furniture"],
    known_mark_types: ["paper_label", "ink_stamp"],
    common_mark_locations: [
      { physical_location: "case_back" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "underside" },
    ],
    known_wording: ["Pottier & Stymus", "Pottier and Stymus", "P&S", "New York"],
    visual_traits: "Renaissance Revival and Aesthetic Movement high-style parlor and case furniture. Labels and stamped marks typical; competitor to Herter Brothers in Gilded Age elite commissions.",
    mark_text_patterns: ["pottier & stymus", "pottier and stymus", "pottier", "stymus"],
    period_associations: [
      { period_label: "Pottier & Stymus production", date_floor: 1859, date_ceiling: 1900,
        usage_notes: "Per seed Date Range: 'Mid-to-late 19th century.'" },
    ],
    dating_clues: "Style progression from Renaissance Revival (1860s-1870s) through Aesthetic Movement (1870s-1880s) into eclectic late-Victorian (1880s-1890s).",
    false_positive_warnings: [
      "Do not attribute all elaborate carved Victorian furniture to Pottier & Stymus (per seed False Positive Warning).",
      "Herter Brothers, Roux, and Marcotte produced contemporaneous high-style work that overlaps stylistically.",
    ],
    attribution_confidence_rule: "Mark or documented provenance required for high confidence.",
    related_names: [],
  },
  {
    id: "maker_mark_r_j_horner",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "R. J. Horner, late 19th to early 20th century New York City Victorian carved case furniture maker.",
    notes: "Per Maker_Mark_Replacement_Seed.docx 19th-Century section. Known for carved griffins, lion heads, and quarter-sawn oak — features frequently over-attributed.",
    maker_name: "R. J. Horner",
    region: "New York City",
    furniture_categories: ["case_pieces", "hall_trees", "dining_furniture", "desks", "chairs", "carved_oak_furniture", "carved_mahogany"],
    known_mark_types: ["paper_label", "ink_stamp", "metal_tag"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside", physical_location_notes: "underside of tables" },
      { physical_location: "case_back", physical_location_notes: "rear panels" },
    ],
    known_wording: ["R. J. Horner", "Horner", "R. J. Horner & Co.", "61st Street"],
    visual_traits: "Heavily carved oak and mahogany case pieces; griffins, lion heads, and figural carving; quarter-sawn oak Golden Oak era production. Paper labels, stamps, and plaques on interior surfaces.",
    mark_text_patterns: ["r. j. horner", "r.j. horner", "horner & co", "horner"],
    period_associations: [
      { period_label: "R. J. Horner production", date_floor: 1886, date_ceiling: 1915,
        usage_notes: "Per seed Date Range: 'Late 19th to early 20th century.'" },
    ],
    dating_clues: "Address changes on labels (61st Street, 36th Street); catalog form comparison.",
    false_positive_warnings: [
      "Carved griffins, lion heads, and quarter-sawn oak do not prove Horner (per seed False Positive Warning).",
      "Many late-Victorian carved-oak makers (Karpen, Stomps-Burkhardt, Mitchell & Rammelsberg) produced similar work.",
    ],
    attribution_confidence_rule: "Require maker label/stamp or documented catalog match.",
    related_names: ["R. J. Horner & Co.", "Horner Bros."],
  },
  {
    id: "maker_mark_mitchell_and_rammelsberg",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Mitchell & Rammelsberg, mid-to-late 19th century Cincinnati Victorian case-furniture manufacturer.",
    notes: "Per Maker_Mark_Replacement_Seed.docx 19th-Century section. Major Midwestern factory producer in the Victorian era.",
    maker_name: "Mitchell & Rammelsberg",
    region: "Cincinnati, Ohio",
    furniture_categories: ["case_furniture", "parlor_suites", "bedroom_suites", "victorian_revival_forms"],
    known_mark_types: ["paper_label", "stencil", "retailer_label", "ink_stamp", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "backboard", physical_location_notes: "mirror backs" },
    ],
    known_wording: ["Mitchell & Rammelsberg", "Mitchell and Rammelsberg", "Cincinnati"],
    visual_traits: "Victorian case furniture and matched parlor/bedroom suites; Renaissance Revival and Eastlake-era output. Paper labels and shipping labels common; some branded marks on better-grade work.",
    mark_text_patterns: ["mitchell & rammelsberg", "mitchell and rammelsberg", "m&r"],
    period_associations: [
      { period_label: "Mitchell & Rammelsberg production", date_floor: 1846, date_ceiling: 1881,
        usage_notes: "Per seed Date Range: 'Mid-to-late 19th century.' Continued as Mitchell Furniture Company after 1881." },
    ],
    dating_clues: "Style progression Renaissance Revival → Eastlake → late-Victorian; address and partnership changes on labels.",
    false_positive_warnings: [
      "Cincinnati origin alone is not enough (per seed False Positive Warning).",
      "Universal Rule #2 city_not_maker: Cincinnati had multiple major factory furniture firms.",
    ],
    attribution_confidence_rule: "Require mark, shipping label, or provenance.",
    related_names: ["Mitchell Furniture Co."],
  },
  {
    id: "maker_mark_wooton_desk_company",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 7,
    indicator_text: "Wooton Desk Company, c. 1870s-1890s Indianapolis patent desks with distinctive cabinet-desk configurations.",
    notes: "Per Maker_Mark_Replacement_Seed.docx 19th-Century section. Wooton's patented configuration is so distinctive that form alone narrows attribution significantly; high positive_authority reflects strong form-evidence.",
    maker_name: "Wooton Desk Company",
    region: "Indianapolis, Indiana",
    furniture_categories: ["patent_desks", "secretary_desks", "cabinet_desks"],
    known_mark_types: ["paper_label", "ink_stamp", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "show_surface", physical_location_notes: "interior writing compartment" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
      { physical_location: "door_panel", physical_location_notes: "door interiors" },
    ],
    known_wording: ["Wooton", "Wooton Desk Co.", "Wm. S. Wooton", "Indianapolis"],
    visual_traits: "Patented multi-compartment cabinet-desk configuration with hinged side wings; distinctive interior layout; quarter-sawn oak or walnut; patent dates often appear on interior labels.",
    mark_text_patterns: ["wooton", "wm. s. wooton", "w.s. wooton", "indianapolis"],
    period_associations: [
      { period_label: "Wooton Desk Company classic patent desk era", date_floor: 1870, date_ceiling: 1893,
        usage_notes: "Per seed Date Range: 'c. 1870s to 1890s for classic Wooton patent desks.'" },
    ],
    dating_clues: "Patent date stamps; configuration grade (Ordinary / Standard / Extra / Superior); interior layout details.",
    false_positive_warnings: [
      "Other cabinet desks can be mistaken for Wooton (per seed False Positive Warning).",
      "Contemporary cabinet-desk makers (Moore & Co., Cutler Desk Co.) produced similar but distinct forms.",
    ],
    attribution_confidence_rule: "Require patented configuration, interior layout, hardware pattern, and mark or catalog comparison.",
    related_names: ["Wm. S. Wooton Desk Co.", "Indiana Desk Co."],
  },
  {
    id: "maker_mark_a_h_andrews",
    category: "maker_mark",
    positive_authority: 6,
    hard_negative_authority: 7,
    indicator_text: "A. H. Andrews / A. Andrews Co., late 19th to early 20th century Chicago office and institutional furniture.",
    notes: "Per Maker_Mark_Replacement_Seed.docx 19th-Century section.",
    maker_name: "A. H. Andrews / A. Andrews Co.",
    region: "Chicago, Illinois",
    furniture_categories: ["office_furniture", "school_furniture", "roll_top_desks", "institutional_furniture"],
    known_mark_types: ["metal_tag", "paper_label", "decal", "branded_stamp", "stencil"],
    common_mark_locations: [
      { physical_location: "show_surface", physical_location_notes: "interior of roll-top compartments", functional_role: "specialized_function" },
      { physical_location: "drawer_side" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["A. H. Andrews", "A. Andrews Co.", "Andrews", "Chicago"],
    visual_traits: "Chicago institutional and office furniture; roll-top desks; school furniture; metal tags or decals on interior surfaces common.",
    mark_text_patterns: ["a. h. andrews", "a.h. andrews", "a. andrews co", "andrews"],
    period_associations: [
      { period_label: "A. H. Andrews / A. Andrews Co. production", date_floor: 1865, date_ceiling: 1925,
        usage_notes: "Per seed Date Range: 'Late 19th to early 20th century.'" },
    ],
    dating_clues: "Chicago address changes on labels; catalog form comparison.",
    false_positive_warnings: [
      "Chicago office furniture alone does not prove Andrews (per seed False Positive Warning).",
      "Universal Rule #2 city_not_maker: Chicago had multiple major office-furniture firms.",
    ],
    attribution_confidence_rule: "Look for full company wording, Chicago address, or matched catalog form.",
    related_names: ["A. H. Andrews & Co."],
  },
  // ─────────────────────────────────────────────────────────────
  // BATCH 3 — Grand Rapids and Major American Factory Makers (7)
  // ─────────────────────────────────────────────────────────────
  {
    id: "maker_mark_grand_rapids_furniture_association_triangle",
    category: "maker_mark",
    positive_authority: 5,
    hard_negative_authority: 9,
    indicator_text: "Grand Rapids Furniture Association triangle trademark — regional ASSOCIATION mark, NOT a single-maker attribution.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Grand Rapids section. Routes to Universal Rule #4 (association_not_single) and Universal Rule #2 (city_not_maker) per MAKER_ATTRIBUTION_REASONING_RULES. Authoring as a maker entry per seed structure but the entry's very high hard_negative_authority (9) enforces 'do NOT attribute to specific Grand Rapids maker from triangle alone.'",
    maker_name: "Grand Rapids Furniture Association triangle mark",
    region: "Grand Rapids, Michigan (association mark, not single-maker)",
    furniture_categories: ["various_types_across_participating_manufacturers"],
    known_mark_types: ["association_mark"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Grand Rapids", "Grand Rapids Furniture Association", "GRFMA"],
    visual_traits: "Triangle trademark device associated with Grand Rapids manufacture; regional quality/association mark protecting Grand Rapids-made furniture against inferior imitations.",
    mark_text_patterns: ["grand rapids", "grfma", "furniture association"],
    period_associations: [
      { period_label: "Grand Rapids Furniture Association usage era", date_floor: 1900, date_ceiling: 1940,
        usage_notes: "Per seed Date Range: 'Early 20th century association usage.'" },
    ],
    dating_clues: "Association membership records (where available) date specific firms' use of the triangle.",
    false_positive_warnings: [
      "Do not identify the piece as Berkey & Gay, Sligh, Widdicomb, Imperial, or another Grand Rapids firm from the triangle alone (per seed False Positive Warning).",
      "See Universal Rule #4 association_not_single: this is an association mark, not a single-maker mark.",
      "See Universal Rule #2 city_not_maker: 'Grand Rapids' identifies regional production, not specific maker.",
    ],
    attribution_confidence_rule: "Use as regional evidence only unless paired with a maker-specific mark. The triangle alone supports 'Grand Rapids regional production' attribution; specific maker requires separate maker-specific mark.",
    related_names: ["Berkey & Gay", "Widdicomb", "John Widdicomb", "Sligh", "Imperial", "Phoenix", "Stickley Brothers", "Limbert", "Macey", "Gunn"],
  },
  {
    id: "maker_mark_berkey_and_gay",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 7,
    indicator_text: "Berkey & Gay Furniture Co., late 19th through early 20th century Grand Rapids high-grade furniture manufacturer.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Grand Rapids section. Strict 'B&G alone not enough' attribution discipline per seed Confidence Rule.",
    maker_name: "Berkey & Gay Furniture Co.",
    region: "Grand Rapids, Michigan",
    furniture_categories: ["bedroom_furniture", "dining_furniture", "parlor_furniture", "renaissance_revival", "colonial_revival", "empire_revival"],
    known_mark_types: ["paper_label", "branded_stamp", "burned_mark"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "backboard", physical_location_notes: "mirror backs" },
      { physical_location: "case_back" },
      { physical_location: "case_top", physical_location_notes: "underside of tops" },
      { physical_location: "case_top", physical_location_notes: "undersides of marble tops; 'B&G' context initials" },
    ],
    known_wording: ["Berkey & Gay Furniture Co., Grand Rapids", "Berkey & Gay", "B&G"],
    visual_traits: "High-grade bedroom, dining, and parlor case furniture across multiple revival styles. Paper labels, burned/branded marks, drawer trademarks. 'B&G' context marks may appear on undersides of marble tops as supporting (not standalone) evidence.",
    mark_text_patterns: ["berkey & gay", "berkey and gay", "berkey&gay"],
    period_associations: [
      { period_label: "Berkey & Gay primary production era", date_floor: 1873, date_ceiling: 1929,
        usage_notes: "Per seed Date Range: 'Late 19th century through early 20th century; commonly encountered c. 1880s to 1920s.'" },
    ],
    dating_clues: "Label format evolution; revival-style period markers (Renaissance Revival 1880s; Colonial Revival 1900-1929).",
    false_positive_warnings: [
      "'B&G' alone is not enough (per seed False Positive Warning).",
      "See Universal Rule #1 initials_not_enough: 'B&G' may be retailer mark, owner initials, or contextual marble-top mark requiring corroboration.",
      "See Universal Rule #2 city_not_maker: 'Grand Rapids' alone is not enough.",
    ],
    attribution_confidence_rule: "High confidence requires full label/trademark, burned mark, or 'B&G' plus a known Berkey & Gay furniture context and matching construction.",
    related_names: [],
  },
  {
    id: "maker_mark_widdicomb_furniture_co",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Widdicomb Furniture Co., late 19th century through 20th century Grand Rapids case-goods manufacturer; distinct from John Widdicomb.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Grand Rapids section. DO NOT MERGE with John Widdicomb per seed Confidence Rule.",
    maker_name: "Widdicomb Furniture Co.",
    region: "Grand Rapids, Michigan",
    furniture_categories: ["case_goods", "bedroom_furniture", "modern_design", "designer_lines"],
    known_mark_types: ["paper_label", "metal_tag", "branded_stamp", "decal"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Widdicomb Furniture Co.", "Widdicomb"],
    visual_traits: "Late-Victorian through 20th-century case goods including bedroom suites; mid-century designer-line collaborations.",
    mark_text_patterns: ["widdicomb furniture", "widdicomb"],
    period_associations: [
      { period_label: "Widdicomb Furniture Co. production", date_floor: 1858, date_ceiling: 1971,
        usage_notes: "Per seed Date Range: 'Late 19th century through 20th century.'" },
    ],
    dating_clues: "Label format evolution; mid-century designer-line metal tags.",
    false_positive_warnings: [
      "Grand Rapids modern furniture is not automatically Widdicomb (per seed False Positive Warning).",
      "Do NOT merge Widdicomb Furniture Co. with John Widdicomb per seed Confidence Rule and Universal Rule #5 line_name_not_maker; the two firms are distinct.",
    ],
    attribution_confidence_rule: "Require Widdicomb label or strong catalog/model match. Distinguish from John Widdicomb via exact firm wording.",
    related_names: ["John Widdicomb"],
  },
  {
    id: "maker_mark_john_widdicomb",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "John Widdicomb, 20th-century Grand Rapids high-end reproduction and designer furniture; distinct from Widdicomb Furniture Co.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Grand Rapids section. DO NOT MERGE with Widdicomb Furniture Co. per seed Confidence Rule.",
    maker_name: "John Widdicomb",
    region: "Grand Rapids, Michigan",
    furniture_categories: ["high_end_reproduction", "designer_furniture", "case_goods"],
    known_mark_types: ["paper_label", "branded_stamp", "metal_tag"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["John Widdicomb", "John Widdicomb Co."],
    visual_traits: "20th-century high-quality reproduction furniture and designer collaborations; distinct firm and label format from Widdicomb Furniture Co.",
    mark_text_patterns: ["john widdicomb"],
    period_associations: [
      { period_label: "John Widdicomb production", date_floor: 1897, date_ceiling: 2002,
        usage_notes: "Per seed Date Range: '20th century.'" },
    ],
    dating_clues: "Label evolution; designer collaboration documentation.",
    false_positive_warnings: [
      "Do not merge Widdicomb Furniture Co. and John Widdicomb unless mark wording supports it (per seed False Positive Warning).",
      "Universal Rule #5 line_name_not_maker partially applies: 'Widdicomb' as surname is shared but firms are distinct.",
    ],
    attribution_confidence_rule: "Require 'John Widdicomb' specifically in mark wording; do not infer from 'Widdicomb' alone.",
    related_names: ["Widdicomb Furniture Co."],
  },
  {
    id: "maker_mark_sligh_furniture_co",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 6,
    indicator_text: "Sligh Furniture Co., 20th-century Grand Rapids / Holland Michigan office furniture, desks, and grandfather clocks.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Grand Rapids section.",
    maker_name: "Sligh Furniture Co.",
    region: "Grand Rapids / Holland, Michigan",
    furniture_categories: ["desks", "office_furniture", "grandfather_clocks", "case_goods"],
    known_mark_types: ["paper_label", "branded_stamp", "decal"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "case_interior_framing", physical_location_notes: "clock case interior", functional_role: "specialized_function" },
      { physical_location: "drawer_front", physical_location_notes: "desk drawer interiors" },
    ],
    known_wording: ["Sligh Furniture Co.", "Sligh", "Charles R. Sligh Co."],
    visual_traits: "20th-century desks, office furniture, and grandfather clocks; clock label formats differ from case-furniture labels.",
    mark_text_patterns: ["sligh furniture", "sligh", "charles r. sligh"],
    period_associations: [
      { period_label: "Sligh Furniture Co. production", date_floor: 1933, date_ceiling: 2005,
        usage_notes: "Per seed Date Range: '20th century.' (Charles R. Sligh Co. founded 1933.)" },
    ],
    dating_clues: "Clock vs case-furniture label format distinguishes product lines.",
    false_positive_warnings: [
      "Sligh clocks and Sligh case furniture may have different label formats (per seed False Positive Warning).",
    ],
    attribution_confidence_rule: "Require full Sligh wording or product label.",
    related_names: ["Charles R. Sligh Co.", "Sligh-Lowry Furniture Co."],
  },
  {
    id: "maker_mark_imperial_furniture_co",
    category: "maker_mark",
    positive_authority: 6,
    hard_negative_authority: 7,
    indicator_text: "Imperial Furniture Co., late 19th to mid-20th century Grand Rapids tables and library furniture.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Grand Rapids section. 'Imperial' as style/quality term widely used; full company wording required.",
    maker_name: "Imperial Furniture Co.",
    region: "Grand Rapids, Michigan",
    furniture_categories: ["tables", "occasional_furniture", "desks", "library_furniture"],
    known_mark_types: ["paper_label", "branded_stamp", "decal"],
    common_mark_locations: [
      { physical_location: "underside", physical_location_notes: "undersides of tables" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
    ],
    known_wording: ["Imperial Furniture Co.", "Imperial Furniture Co., Grand Rapids", "Imperial"],
    visual_traits: "Tables, occasional furniture, library furniture; Grand Rapids factory production. Paper labels and branded marks on undersides.",
    mark_text_patterns: ["imperial furniture", "imperial furniture co"],
    period_associations: [
      { period_label: "Imperial Furniture Co. production", date_floor: 1903, date_ceiling: 1954,
        usage_notes: "Per seed Date Range: 'Late 19th to mid-20th century.'" },
    ],
    dating_clues: "Label format evolution; style progression Mission → Colonial Revival → mid-century.",
    false_positive_warnings: [
      "'Imperial' can be a style/quality term (per seed False Positive Warning). Require company wording.",
      "Universal Rule #5 line_name_not_maker: 'Imperial' as descriptor versus 'Imperial Furniture Co.' as firm.",
    ],
    attribution_confidence_rule: "Require full 'Imperial Furniture Co.' wording.",
    related_names: [],
  },
  {
    id: "maker_mark_phoenix_furniture_co",
    category: "maker_mark",
    positive_authority: 6,
    hard_negative_authority: 7,
    indicator_text: "Phoenix Furniture Co., late 19th to early 20th century Grand Rapids Victorian and revival case-furniture producer.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Grand Rapids section.",
    maker_name: "Phoenix Furniture Co.",
    region: "Grand Rapids, Michigan",
    furniture_categories: ["victorian_case_furniture", "revival_furniture"],
    known_mark_types: ["paper_label", "stencil", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Phoenix Furniture Co.", "Phoenix Furniture Co., Grand Rapids", "Phoenix"],
    visual_traits: "Victorian and revival case furniture from Grand Rapids factory production. Paper labels, stencils, branded marks.",
    mark_text_patterns: ["phoenix furniture", "phoenix furniture co"],
    period_associations: [
      { period_label: "Phoenix Furniture Co. production", date_floor: 1872, date_ceiling: 1911,
        usage_notes: "Per seed Date Range: 'Late 19th to early 20th century.'" },
    ],
    dating_clues: "Label format and style progression Victorian → Eastlake → Colonial Revival.",
    false_positive_warnings: [
      "Phoenix may appear as a city, symbol, or retailer name (per seed False Positive Warning). Require full maker context.",
      "Universal Rule #2 city_not_maker: 'Phoenix' (Arizona) is a city; the firm is Grand Rapids based.",
    ],
    attribution_confidence_rule: "Require full maker context — 'Phoenix Furniture Co.' wording with Grand Rapids attribution.",
    related_names: [],
  },
  // ─────────────────────────────────────────────────────────────
  // BATCH 4 — Office, Bookcase, and Institutional Makers (5)
  // ─────────────────────────────────────────────────────────────
  {
    id: "maker_mark_globe_wernicke_co",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 9,
    indicator_text: "Globe-Wernicke Co., late 19th to mid-20th century Cincinnati sectional bookcase and office furniture manufacturer.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Office/Bookcase section. ★ RESOLVES BLOCK 27 D-MM27-12 FORWARD-REFERENCE: this entry id 'maker_mark_globe_wernicke_co' matches MAKER_ATTRIBUTION_REASONING_RULES rule #8 (globe_wernicke_correction) applies_to_entry_types FK. Very high hard_negative_authority (9) reflects the seed's explicit 'GW alone must never identify Globe-Wernicke' discipline and the rule #8 worked-example correction.",
    maker_name: "Globe-Wernicke Co.",
    region: "Cincinnati, Ohio; later multiple locations",
    furniture_categories: ["stacking_bookcases", "barrister_bookcases", "office_furniture", "filing_systems"],
    known_mark_types: ["paper_label", "metal_tag", "decal", "catalog_plate", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "case_back", physical_location_notes: "inside bookcase backs (interior surface)" },
      { physical_location: "underside", physical_location_notes: "underside or rear of sections" },
      { physical_location: "drawer_front", physical_location_notes: "interior of drawer/filing units" },
      { physical_location: "backboard", physical_location_notes: "back panels" },
    ],
    known_wording: ["The Globe-Wernicke Co.", "Globe-Wernicke", "Globe Wernicke", "Cincinnati"],
    visual_traits: "Stacking sectional bookcases and barrister bookcases with distinctive door-mechanism hardware; office furniture; filing systems. Full labels and metal tags on interior surfaces; sectional unit labels. Mark form evolution: paper label (early; c. 1899-1915) → stamped mark (later; c. 1916-1930) → continuing production with various label / decal / metal tag forms (c. 1930-1955).",
    mark_text_patterns: ["globe-wernicke", "globe wernicke", "the globe-wernicke co"],
    period_associations: [
      { period_label: "Globe-Wernicke early paper-label era", date_floor: 1899, date_ceiling: 1915,
        usage_notes: "Per Block 23 legacy variant preservation: early paper labels used on sectional bookcases prior to corporate restructuring. Strongest with full 'Globe-Wernicke' wording and paper-label form on interior bookcase surfaces. Preserved from legacy globe_wernicke_paper_label_early entry." },
      { period_label: "Globe-Wernicke stamped-mark era", date_floor: 1916, date_ceiling: 1930,
        usage_notes: "Per Block 23 legacy variant preservation: later stamped marks following corporate restructuring; commonly reads 'Globe-Wernicke Co Cincinnati'. Stamp form is distinct from earlier paper labels and from later mixed-form continuing production. Preserved from legacy globe_wernicke_stamped_mark_late entry." },
      { period_label: "Globe-Wernicke continuing production", date_floor: 1930, date_ceiling: 1955,
        usage_notes: "Per seed Date Range: 'Late 19th to mid-20th century.' Mixed label / decal / metal tag forms continue through the firm's late production." },
    ],
    dating_clues: "Hardware system evolution (early lever mechanisms vs later integrated tracks); catalog/style numbers; address evolution on labels.",
    false_positive_warnings: [
      "'GW' alone must NEVER identify Globe-Wernicke (per seed False Positive Warning and rule #8 globe_wernicke_correction).",
      "A monogram, owner initials, drawer chalk mark, shipping mark, or retailer code may use 'GW' without being Globe-Wernicke.",
      "See Universal Rule #1 initials_not_enough: initials require contextual maker-specific device or label.",
      "If object is not a sectional bookcase, file, desk, or office/storage form, confidence is sharply reduced even with partial label evidence.",
    ],
    attribution_confidence_rule: "High confidence requires full 'Globe-Wernicke' wording, sectional bookcase construction matching Globe-Wernicke, correct hardware/door system, and label placement. Per seed App Rule: if detected text is only 'GW,' return 'Possible initials; insufficient for Globe-Wernicke attribution.'",
    related_names: [],
  },
  {
    id: "maker_mark_macey",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Macey / Macey Company, late 19th to early 20th century Grand Rapids stacking bookcase and office furniture maker.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Office/Bookcase section. Sectional bookcases similar to Globe-Wernicke, Gunn, and Lundstrom.",
    maker_name: "Macey / Macey Company",
    region: "Grand Rapids, Michigan",
    furniture_categories: ["stacking_bookcases", "office_furniture"],
    known_mark_types: ["paper_label", "decal", "metal_tag"],
    common_mark_locations: [
      { physical_location: "case_back", physical_location_notes: "bookcase section backs/interiors" },
      { physical_location: "underside" },
      { physical_location: "case_back" },
    ],
    known_wording: ["Macey", "Macey Company", "The Macey Co."],
    visual_traits: "Sectional stacking bookcases competing with Globe-Wernicke; office furniture. Paper labels and decals on interior surfaces.",
    mark_text_patterns: ["macey company", "the macey co", "macey"],
    period_associations: [
      { period_label: "Macey Company production", date_floor: 1893, date_ceiling: 1930,
        usage_notes: "Per seed Date Range: 'Late 19th to early 20th century.'" },
    ],
    dating_clues: "Catalog form comparison; label format evolution.",
    false_positive_warnings: [
      "Similar sectional bookcases were made by Globe-Wernicke, Gunn, Lundstrom, and others (per seed False Positive Warning).",
      "Universal Rule #2 city_not_maker: 'Grand Rapids' alone insufficient.",
    ],
    attribution_confidence_rule: "Require full Macey wording or catalog match.",
    related_names: ["The Macey Co.", "Globe-Wernicke", "Gunn", "Lundstrom"],
  },
  {
    id: "maker_mark_gunn_furniture_co",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Gunn Furniture Co., late 19th to early 20th century Grand Rapids desks, sectional bookcases, and office furniture.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Office/Bookcase section.",
    maker_name: "Gunn Furniture Co.",
    region: "Grand Rapids, Michigan",
    furniture_categories: ["desks", "sectional_bookcases", "office_furniture"],
    known_mark_types: ["paper_label", "branded_stamp", "decal"],
    common_mark_locations: [
      { physical_location: "case_back", physical_location_notes: "bookcase backs" },
      { physical_location: "drawer_front", physical_location_notes: "desk drawer interiors" },
      { physical_location: "case_back" },
    ],
    known_wording: ["Gunn Furniture Co.", "Gunn", "Gunn Sectional"],
    visual_traits: "Desks, sectional bookcases, and office furniture from Grand Rapids; sectional-bookcase form competes directly with Globe-Wernicke and Macey.",
    mark_text_patterns: ["gunn furniture", "gunn sectional", "gunn"],
    period_associations: [
      { period_label: "Gunn Furniture Co. production", date_floor: 1879, date_ceiling: 1930,
        usage_notes: "Per seed Date Range: 'Late 19th to early 20th century.'" },
    ],
    dating_clues: "Catalog form comparison; hardware evolution.",
    false_positive_warnings: [
      "Do not identify a sectional bookcase as Gunn without mark or construction details (per seed False Positive Warning).",
      "Sectional-bookcase form is widely shared with Globe-Wernicke, Macey, Lundstrom, and others.",
    ],
    attribution_confidence_rule: "Require Gunn label or branded mark with construction confirmation.",
    related_names: ["Globe-Wernicke", "Macey", "Lundstrom"],
  },
  {
    id: "maker_mark_shaw_walker",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Shaw-Walker, late 19th through 20th century Muskegon Michigan filing cabinets and office systems.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Office/Bookcase section.",
    maker_name: "Shaw-Walker",
    region: "Muskegon, Michigan",
    furniture_categories: ["filing_cabinets", "office_systems", "metal_office_furniture", "wood_office_furniture"],
    known_mark_types: ["metal_tag", "decal", "paper_label", "catalog_plate"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "movable_hardware_attachment", physical_location_notes: "file cabinet fronts" },
      { physical_location: "case_back" },
    ],
    known_wording: ["Shaw-Walker", "Shaw Walker", "Muskegon, Michigan"],
    visual_traits: "Filing cabinets, office systems, both metal and wood office furniture. Metal tags and decals on drawer interiors and cabinet fronts.",
    mark_text_patterns: ["shaw-walker", "shaw walker", "shawwalker"],
    period_associations: [
      { period_label: "Shaw-Walker production", date_floor: 1899, date_ceiling: 1990,
        usage_notes: "Per seed Date Range: 'Late 19th through 20th century.'" },
    ],
    dating_clues: "Patent date stamps; catalog model numbers; metal-vs-wood transitions reflect manufacturing era.",
    false_positive_warnings: [
      "Office furniture forms are highly standardized (per seed False Positive Warning). Require mark.",
    ],
    attribution_confidence_rule: "Require Shaw-Walker mark or catalog match.",
    related_names: [],
  },
  {
    id: "maker_mark_yawman_and_erbe",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Yawman & Erbe, late 19th to 20th century Rochester New York filing cabinets and document storage systems.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Office/Bookcase section.",
    maker_name: "Yawman & Erbe",
    region: "Rochester, New York",
    furniture_categories: ["office_systems", "filing_cabinets", "document_storage"],
    known_mark_types: ["metal_tag", "paper_label", "ink_stamp", "catalog_plate"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "movable_hardware_attachment" },
      { physical_location: "case_back" },
    ],
    known_wording: ["Yawman & Erbe", "Yawman and Erbe", "Y&E", "Rochester"],
    visual_traits: "Filing cabinets and document storage systems; competitor to Shaw-Walker and Globe-Wernicke filing lines. Metal tags and stamped marks.",
    mark_text_patterns: ["yawman & erbe", "yawman and erbe"],
    period_associations: [
      { period_label: "Yawman & Erbe production", date_floor: 1882, date_ceiling: 1985,
        usage_notes: "Per seed Date Range: 'Late 19th to 20th century.'" },
    ],
    dating_clues: "Patent plate dates; catalog model numbers.",
    false_positive_warnings: [
      "Do not attribute generic file cabinets without full mark or patent plate (per seed False Positive Warning).",
      "See Universal Rule #1 initials_not_enough: 'Y&E' initials require corroboration.",
    ],
    attribution_confidence_rule: "Require full 'Yawman & Erbe' wording or patent plate.",
    related_names: [],
  },
  // ─────────────────────────────────────────────────────────────
  // BATCH 5 — Arts & Crafts, Mission, and Stickley-Related (7)
  // ─────────────────────────────────────────────────────────────
  {
    id: "maker_mark_gustav_stickley",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Gustav Stickley / Craftsman Workshops, c. 1900-1916 Eastwood/Syracuse New York classic Gustav Stickley Mission and Arts & Crafts production.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Arts & Crafts section. DO NOT MERGE with L. & J.G. Stickley, Stickley Brothers, or Stickley Associated Cabinetmakers per seed lineage discipline.",
    maker_name: "Gustav Stickley / Craftsman Workshops",
    region: "Eastwood / Syracuse, New York",
    furniture_categories: ["mission", "arts_and_crafts", "oak_furniture", "chairs", "tables", "sideboards", "desks", "bookcases"],
    known_mark_types: ["branded_stamp", "decal", "paper_label", "burned_mark"],
    common_mark_locations: [
      { physical_location: "underside" },
      { physical_location: "case_back" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "frame_rail", physical_location_notes: "seat rails (chairs)" },
    ],
    known_wording: ["Gustav Stickley", "Stickley", "Als Ik Kan", "Craftsman Workshops"],
    visual_traits: "Mission and Arts & Crafts oak furniture; shopmarks include joiner's compass mark and 'Als Ik Kan' device; red decal variants. Quarter-sawn oak; exposed mortise-and-tenon joinery; iron hardware.",
    mark_text_patterns: ["gustav stickley", "stickley", "als ik kan", "craftsman workshops"],
    period_associations: [
      { period_label: "Gustav Stickley classic production", date_floor: 1900, date_ceiling: 1916,
        usage_notes: "Per seed Date Range: 'c. 1900 to 1916 for classic Gustav Stickley production.'" },
    ],
    dating_clues: "Decal/shopmark variants date specific production periods (red decal 1902-1903; joiner's compass with 'Als Ik Kan' 1904-1912; later branded marks 1912-1916).",
    false_positive_warnings: [
      "'Mission style,' quarter-sawn oak, exposed tenons, and corbels do not prove Gustav Stickley (per seed False Positive Warning).",
      "Do not merge Gustav Stickley with L. & J.G. Stickley, Stickley Brothers, or Stickley Associated Cabinetmakers without mark-specific wording.",
      "Universal Rule #5 line_name_not_maker: 'Stickley' alone is shared across multiple Stickley firms.",
    ],
    attribution_confidence_rule: "Require correct shopmark or label, matching construction quality, appropriate oak, hardware, finish, and catalog form.",
    related_names: ["L. & J.G. Stickley", "Stickley Brothers", "Stickley Associated Cabinetmakers", "Craftsman Workshops"],
    anti_classification_guidance: {
      boundary_date: 1916,
      boundary_type: "form_extinction",
      guidance_text: "Gustav Stickley's Craftsman Workshops closed in 1916. Pieces postdating 1916 are not Gustav Stickley; check L. & J.G. Stickley (Fayetteville) or Stickley Manufacturing Company successor firms via their specific marks.",
      prominence: "prominent",
    },
  },
  {
    id: "maker_mark_l_and_jg_stickley",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "L. & J. G. Stickley, early 20th century Fayetteville New York Mission and later traditional furniture; distinct firm from Gustav Stickley.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Arts & Crafts section. DO NOT MERGE with Gustav Stickley per seed lineage discipline.",
    maker_name: "L. & J. G. Stickley",
    region: "Fayetteville, New York",
    furniture_categories: ["mission", "arts_and_crafts", "traditional_furniture", "later_traditional"],
    known_mark_types: ["paper_label", "branded_stamp", "decal", "metal_tag"],
    common_mark_locations: [
      { physical_location: "underside" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
    ],
    known_wording: ["L. & J. G. Stickley", "Stickley Fayetteville", "Handcraft", "The Work of L. & J. G. Stickley"],
    visual_traits: "Mission and Arts & Crafts oak; later traditional period furniture. Paper labels, branded marks, decals (early), metal tags (later).",
    mark_text_patterns: ["l. & j. g. stickley", "l & jg stickley", "l & j g stickley", "stickley fayetteville", "handcraft"],
    period_associations: [
      { period_label: "L. & J. G. Stickley Mission era", date_floor: 1902, date_ceiling: 1922,
        usage_notes: "Per seed Date Range: 'Early 20th century onward.'" },
      { period_label: "L. & J. G. Stickley traditional era and continuing production", date_floor: 1922,
        usage_notes: "Continued production into the present under successor management." },
    ],
    dating_clues: "Mark/label format evolution; 'Handcraft' device 1902-1912; later branded marks; metal tags in mid-20th-century production.",
    false_positive_warnings: [
      "Do not merge L. & J. G. Stickley with Gustav Stickley unless mark wording supports it (per seed False Positive Warning).",
      "Universal Rule #5 line_name_not_maker: 'Stickley' alone is shared across multiple firms.",
    ],
    attribution_confidence_rule: "Full firm wording or firm-specific label required.",
    related_names: ["Gustav Stickley", "Stickley Brothers", "Stickley Manufacturing Co."],
  },
  {
    id: "maker_mark_stickley_brothers",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 8,
    indicator_text: "Stickley Brothers Company, early 20th century Grand Rapids Mission, Arts & Crafts, and Colonial Revival production; distinct from Gustav and L. & J. G. Stickley.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Arts & Crafts section. DO NOT MERGE with other Stickley firms.",
    maker_name: "Stickley Brothers Company",
    region: "Grand Rapids, Michigan",
    furniture_categories: ["mission", "arts_and_crafts", "colonial_revival", "bedroom_furniture", "dining_furniture"],
    known_mark_types: ["paper_label", "decal", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Stickley Brothers", "Stickley Bros.", "Stickley Brothers Co.", "Grand Rapids"],
    visual_traits: "Mission and Arts & Crafts furniture plus broader Colonial Revival bedroom and dining suites; Grand Rapids factory production.",
    mark_text_patterns: ["stickley bros", "stickley brothers"],
    period_associations: [
      { period_label: "Stickley Brothers Company production", date_floor: 1891, date_ceiling: 1950,
        usage_notes: "Per seed Date Range: 'Early 20th century.' Founded 1891; ceased production mid-20th century." },
    ],
    dating_clues: "Label format evolution; Mission peak (1900-1915) vs Colonial Revival expansion (1915-1940).",
    false_positive_warnings: [
      "'Stickley' alone is too broad. There were multiple Stickley firms (per seed False Positive Warning).",
      "Universal Rule #5 line_name_not_maker applies: 'Stickley' surname shared across distinct firms.",
    ],
    attribution_confidence_rule: "Require exact firm wording — 'Stickley Brothers' or 'Stickley Bros.' specifically.",
    related_names: ["Gustav Stickley", "L. & J. G. Stickley", "Stickley Associated Cabinetmakers"],
  },
  {
    id: "maker_mark_stickley_associated_cabinetmakers",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 8,
    indicator_text: "Stickley Associated Cabinetmakers, early 20th century New York Arts & Crafts firm; frequently confused with other Stickley entities.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Arts & Crafts section. DO NOT MERGE with other Stickley firms.",
    maker_name: "Stickley Associated Cabinetmakers",
    region: "New York",
    furniture_categories: ["arts_and_crafts"],
    known_mark_types: ["paper_label", "decal"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Stickley Associated Cabinetmakers", "Associated Cabinetmakers"],
    visual_traits: "Arts & Crafts furniture; specific labels or decals identifying the associated company.",
    mark_text_patterns: ["stickley associated cabinetmakers", "associated cabinetmakers"],
    period_associations: [
      { period_label: "Stickley Associated Cabinetmakers production", date_floor: 1916, date_ceiling: 1920,
        usage_notes: "Per seed Date Range: 'Early 20th century.' Short-lived firm." },
    ],
    dating_clues: "Specific labels identify this firm distinctly from other Stickley entities.",
    false_positive_warnings: [
      "Frequently confused with other Stickley entities (per seed False Positive Warning).",
      "Universal Rule #5 line_name_not_maker: 'Stickley' surname shared across multiple firms.",
    ],
    attribution_confidence_rule: "Require specific 'Stickley Associated Cabinetmakers' wording in label.",
    related_names: ["Gustav Stickley", "L. & J. G. Stickley", "Stickley Brothers"],
  },
  {
    id: "maker_mark_limbert",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Charles P. Limbert Co., early 20th century Grand Rapids and Holland Michigan Arts & Crafts and Mission producer; distinctive Dutch Arts & Crafts cutout forms.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Arts & Crafts section.",
    maker_name: "Charles P. Limbert Co.",
    region: "Grand Rapids and Holland, Michigan",
    furniture_categories: ["arts_and_crafts", "mission", "dutch_arts_and_crafts_forms"],
    known_mark_types: ["paper_label", "branded_stamp", "decal"],
    common_mark_locations: [
      { physical_location: "underside" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
    ],
    known_wording: ["Limbert", "Charles P. Limbert Co.", "Limberts Holland Dutch Arts & Crafts"],
    visual_traits: "Mission and Arts & Crafts furniture distinguished by Dutch Arts & Crafts cutout side panels; quarter-sawn oak; iron and copper hardware.",
    mark_text_patterns: ["limbert", "charles p. limbert", "limberts holland"],
    period_associations: [
      { period_label: "Charles P. Limbert Co. production", date_floor: 1902, date_ceiling: 1944,
        usage_notes: "Per seed Date Range: 'Early 20th century.'" },
    ],
    dating_clues: "Label format evolution; cutout-panel style markers.",
    false_positive_warnings: [
      "Cutout side panels and Mission oak alone are not enough (per seed False Positive Warning).",
      "Other Mission makers used similar cutout details; mark required.",
    ],
    attribution_confidence_rule: "Require mark or strong catalog comparison.",
    related_names: ["Limbert"],
  },
  {
    id: "maker_mark_lifetime_furniture",
    category: "maker_mark",
    positive_authority: 6,
    hard_negative_authority: 7,
    indicator_text: "Lifetime Furniture / Grand Rapids Bookcase & Chair Co., early 20th century Grand Rapids Mission and Arts & Crafts.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Arts & Crafts section. 'Lifetime' is also a marketing phrase used by other makers; branded context required.",
    maker_name: "Lifetime Furniture / Grand Rapids Bookcase & Chair Co.",
    region: "Grand Rapids, Michigan",
    furniture_categories: ["mission", "arts_and_crafts"],
    known_mark_types: ["paper_label", "decal", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Lifetime", "Lifetime Furniture", "Grand Rapids Bookcase & Chair Co."],
    visual_traits: "Mission and Arts & Crafts furniture; 'Lifetime' labels and decals; branded marks on better-grade work.",
    mark_text_patterns: ["lifetime furniture", "grand rapids bookcase & chair", "lifetime"],
    period_associations: [
      { period_label: "Grand Rapids Bookcase & Chair Co. / Lifetime production", date_floor: 1903, date_ceiling: 1930,
        usage_notes: "Per seed Date Range: 'Early 20th century.'" },
    ],
    dating_clues: "Label format evolution.",
    false_positive_warnings: [
      "'Lifetime' can be a marketing phrase. Require branded context (per seed False Positive Warning).",
      "Universal Rule #5 line_name_not_maker: 'Lifetime' as quality claim versus 'Lifetime Furniture' as firm.",
    ],
    attribution_confidence_rule: "Require branded context — 'Lifetime Furniture' or 'Grand Rapids Bookcase & Chair Co.' wording.",
    related_names: ["Grand Rapids Bookcase & Chair Co."],
  },
  {
    id: "maker_mark_roycroft",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Roycroft, late 19th to early 20th century East Aurora New York Arts & Crafts community; orb-and-cross device is the canonical Roycroft mark.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Arts & Crafts section.",
    maker_name: "Roycroft",
    region: "East Aurora, New York",
    furniture_categories: ["arts_and_crafts", "accessories", "community_workshop_production"],
    known_mark_types: ["branded_stamp", "burned_mark", "paper_label", "ink_stamp"],
    common_mark_locations: [
      { physical_location: "underside" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "show_surface", physical_location_notes: "burned-in orb-and-cross device on show surfaces" },
    ],
    known_wording: ["Roycroft", "Roycroft Shops", "East Aurora", "Aurora N.Y."],
    visual_traits: "Distinctive orb-and-cross Roycroft device (carved or burned); Arts & Crafts furniture, lighting, leather, and accessories. Community workshop production.",
    mark_text_patterns: ["roycroft", "east aurora"],
    period_associations: [
      { period_label: "Roycroft Shops community production", date_floor: 1895, date_ceiling: 1938,
        usage_notes: "Per seed Date Range: 'Late 19th to early 20th century; later revival.' Original community ceased operation 1938." },
      { period_label: "Roycroft revival production", date_floor: 1976,
        usage_notes: "Modern Roycroft revival operations." },
    ],
    dating_clues: "Orb-and-cross device variations across early (1895-1905) and mature (1905-1938) production phases.",
    false_positive_warnings: [
      "Arts & Crafts handwork alone is not Roycroft (per seed False Positive Warning).",
      "Many Arts & Crafts community workshops produced similar work without Roycroft attribution.",
    ],
    attribution_confidence_rule: "Require mark, provenance, or highly specific workshop comparison.",
    related_names: ["Roycroft Shops", "Roycrofters-At-Large Association"],
  },
  // ─────────────────────────────────────────────────────────────
  // BATCH 6 — Wicker, Rattan, and Reed (4 entries; lineage cluster)
  // ─────────────────────────────────────────────────────────────
  {
    id: "maker_mark_heywood_brothers",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Heywood Brothers, 19th century to 1897 Gardner Massachusetts wicker, reed, rattan, and institutional seating; predecessor to Heywood Brothers & Wakefield Co.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Wicker section. Pre-merger entity; merged 1897 with Wakefield Rattan Co. to form Heywood Brothers & Wakefield Company.",
    maker_name: "Heywood Brothers",
    region: "Gardner, Massachusetts",
    furniture_categories: ["chairs", "wicker", "reed", "rattan", "institutional_seating"],
    known_mark_types: ["paper_label", "metal_tag", "stencil"],
    common_mark_locations: [
      { physical_location: "underside" },
      { physical_location: "upholstery_attachment_point", physical_location_notes: "seat frames" },
      { physical_location: "frame_rail" },
    ],
    known_wording: ["Heywood Brothers", "Heywood Bros.", "Heywood Bros. & Co.", "Gardner, Mass."],
    visual_traits: "Wicker, reed, and rattan chairs and institutional seating from Gardner Massachusetts. Paper labels and stencils on undersides.",
    mark_text_patterns: ["heywood brothers", "heywood bros"],
    period_associations: [
      { period_label: "Heywood Brothers pre-merger production", date_floor: 1826, date_ceiling: 1897,
        usage_notes: "Per seed Date Range: '19th century to 1897 merger.' Founded as Heywood Brothers in 1826." },
    ],
    dating_clues: "Pre-1897 label wording lacks 'Wakefield'; 'Established 1826' in later Heywood-Wakefield labels refers to the older Heywood lineage, not the production date of the piece.",
    false_positive_warnings: [
      "'Established 1826' in later Heywood-Wakefield labels refers to the older Heywood lineage, not necessarily the production date (per seed False Positive Warning).",
      "Heywood-style wicker forms were produced by many Gardner-area firms.",
    ],
    attribution_confidence_rule: "Require Heywood-specific label without Wakefield wording to confirm pre-1897 production.",
    related_names: ["Wakefield Rattan Co.", "Heywood Brothers & Wakefield Co.", "Heywood-Wakefield Co."],
    anti_classification_guidance: {
      boundary_date: 1897,
      boundary_type: "form_extinction",
      guidance_text: "Heywood Brothers as a standalone firm ceased in the 1897 merger with Wakefield Rattan Co. Pieces postdating 1897 with Heywood + Wakefield co-attribution are Heywood Brothers & Wakefield Co. production (separate entry maker_mark_heywood_brothers_and_wakefield_co); pieces post-1921 are Heywood-Wakefield Co. (separate entry).",
      prominence: "prominent",
    },
  },
  {
    id: "maker_mark_wakefield_rattan_co",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Wakefield Rattan Co., 19th century to 1897 Wakefield Massachusetts rattan and wicker furniture; predecessor to Heywood Brothers & Wakefield Co.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Wicker section. Pre-merger entity; merged 1897 with Heywood Brothers.",
    maker_name: "Wakefield Rattan Co.",
    region: "Wakefield, Massachusetts",
    furniture_categories: ["rattan", "wicker"],
    known_mark_types: ["paper_label", "metal_tag", "stencil"],
    common_mark_locations: [
      { physical_location: "underside" },
      { physical_location: "upholstery_attachment_point", physical_location_notes: "seat frames" },
      { physical_location: "frame_rail" },
    ],
    known_wording: ["Wakefield Rattan Co.", "Wakefield Rattan", "Wakefield, Mass."],
    visual_traits: "Rattan and wicker furniture from Wakefield Massachusetts. Paper labels, tags, and stencils.",
    mark_text_patterns: ["wakefield rattan"],
    period_associations: [
      { period_label: "Wakefield Rattan Co. pre-merger production", date_floor: 1855, date_ceiling: 1897,
        usage_notes: "Per seed Date Range: '19th century to 1897 merger.'" },
    ],
    dating_clues: "Pre-1897 label wording lacks 'Heywood'; specific Wakefield Rattan labels distinguish from later Heywood + Wakefield co-attribution.",
    false_positive_warnings: [
      "Wakefield as a place or family name is not enough (per seed False Positive Warning).",
      "Universal Rule #2 city_not_maker: 'Wakefield, Mass.' is a city.",
      "Universal Rule #5 line_name_not_maker: 'Wakefield' surname appears in multiple later firm names.",
    ],
    attribution_confidence_rule: "Require 'Wakefield Rattan' or 'Wakefield Rattan Co.' wording, not 'Wakefield' alone.",
    related_names: ["Heywood Brothers", "Heywood Brothers & Wakefield Co.", "Heywood-Wakefield Co."],
    anti_classification_guidance: {
      boundary_date: 1897,
      boundary_type: "form_extinction",
      guidance_text: "Wakefield Rattan Co. as a standalone firm ceased in the 1897 merger with Heywood Brothers. Pieces postdating 1897 are Heywood Brothers & Wakefield Co. (separate entry).",
      prominence: "prominent",
    },
  },
  {
    id: "maker_mark_heywood_brothers_and_wakefield_co",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 7,
    indicator_text: "Heywood Brothers & Wakefield Company, 1897-1921 post-merger Gardner and Wakefield Massachusetts wicker, reed, chairs, baby carriages, institutional and wood furniture.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Wicker section. The 1897 merger of Heywood Brothers and Wakefield Rattan Co. created this firm name; renamed Heywood-Wakefield Co. in 1921.",
    maker_name: "Heywood Brothers & Wakefield Company",
    region: "Gardner and Wakefield, Massachusetts",
    furniture_categories: ["wicker", "reed", "chairs", "baby_carriages", "institutional_furniture", "wood_furniture"],
    known_mark_types: ["paper_label", "metal_tag", "stencil"],
    common_mark_locations: [
      { physical_location: "underside", physical_location_notes: "underside labels" },
      { physical_location: "upholstery_attachment_point", physical_location_notes: "seat frames" },
      { physical_location: "case_back" },
    ],
    known_wording: ["Heywood Brothers & Wakefield Company", "Heywood Bros. & Wakefield Co.", "Gardner, Mass."],
    visual_traits: "Wicker, reed, chairs, baby carriages, institutional furniture, and later wood furniture. Labels using full 'Heywood Brothers & Wakefield Company' wording.",
    mark_text_patterns: ["heywood brothers & wakefield", "heywood bros & wakefield", "heywood brothers and wakefield"],
    period_associations: [
      { period_label: "Heywood Brothers & Wakefield Co. era", date_floor: 1897, date_ceiling: 1921,
        usage_notes: "Per seed: 'This exact firm name supports post-1897 and pre-1921 unless later use is demonstrated.'" },
    ],
    dating_clues: "Exact firm name 'Heywood Brothers & Wakefield Company' supports post-1897 and pre-1921 dating per seed Dating Rule.",
    false_positive_warnings: [
      "Post-1921 wicker pieces with co-branded 'Heywood' + 'Wakefield' wording use the Heywood-Wakefield Co. name (renamed 1921).",
    ],
    attribution_confidence_rule: "High confidence requires the exact 'Heywood Brothers & Wakefield Company' wording on the label; absence of this wording or use of shortened 'Heywood-Wakefield' suggests post-1921 production.",
    related_names: ["Heywood Brothers", "Wakefield Rattan Co.", "Heywood-Wakefield Co."],
    anti_classification_guidance: [
      {
        boundary_date: 1897,
        boundary_type: "form_emergence",
        guidance_text: "Heywood Brothers & Wakefield Company emerged from the 1897 merger of Heywood Brothers and Wakefield Rattan Co.; pieces predating 1897 are pre-merger entities (Heywood Brothers or Wakefield Rattan Co. — separate entries).",
        prominence: "standard",
      },
      {
        boundary_date: 1921,
        boundary_type: "form_extinction",
        guidance_text: "Heywood Brothers & Wakefield Company name was shortened to Heywood-Wakefield Company in 1921; pieces postdating 1921 use the Heywood-Wakefield Co. name (separate entry maker_mark_heywood_wakefield_co).",
        prominence: "prominent",
      },
    ],
  },
  {
    id: "maker_mark_heywood_wakefield_co",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 7,
    indicator_text: "Heywood-Wakefield Company, 1921-onward Gardner Massachusetts wicker, mid-century modern birch case goods, dining, bedroom, tables, institutional furniture; renamed from Heywood Brothers & Wakefield Company in 1921.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Wicker section. Single entry spans 1921-onward including MCM peak (1930s-1970s); per Block 28a A-7 cross-batch coordination decision, this entry covers full range with phase-aware period_associations. Block 28b cross-references rather than re-authoring.",
    maker_name: "Heywood-Wakefield Company",
    region: "Gardner, Massachusetts",
    furniture_categories: ["wicker", "chairs", "institutional_furniture", "mcm_birch_case_goods", "dining", "bedroom", "tables"],
    known_mark_types: ["paper_label", "metal_tag", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "left-hand drawer interiors typical" },
      { physical_location: "underside", physical_location_notes: "underside of tables/chairs" },
      { physical_location: "case_back" },
      { physical_location: "frame_rail", physical_location_notes: "wicker frames" },
    ],
    known_wording: ["Heywood-Wakefield", "Fine Furniture by Heywood-Wakefield", "Established 1826", "Gardner, Mass."],
    visual_traits: "Wicker era (1921-1930s); mid-century modern blond birch case goods (1930s-1970s) with characteristic curved forms and 'champagne' or 'wheat' finish. Eagle stamp introduced 1949 (post-WWII). Paper labels reading 'Fine Furniture by Heywood-Wakefield, Established 1826, Gardner, Mass.'",
    mark_text_patterns: ["heywood-wakefield", "heywood wakefield", "fine furniture by heywood"],
    period_associations: [
      { period_label: "Heywood-Wakefield wicker continuation era", date_floor: 1921, date_ceiling: 1940,
        usage_notes: "Pre-MCM continuation of wicker production from the prior Heywood Brothers & Wakefield Co." },
      { period_label: "Heywood-Wakefield mid-century modern birch era", date_floor: 1930, date_ceiling: 1970,
        usage_notes: "Per seed: 'mid-century modern production especially c. 1930s to 1970s.' Blond birch case goods and curved-form MCM signature." },
      { period_label: "Heywood-Wakefield eagle-stamp era", date_floor: 1949, date_ceiling: 1979,
        usage_notes: "Per seed: 'eagle stamp after 1949 and is usually found on undersides or drawer areas.'" },
    ],
    dating_clues: "Eagle stamp dates post-1949; label wording 'Fine Furniture by Heywood-Wakefield, Established 1826, Gardner, Mass.' is post-1921 firm-name shortening. Construction (wicker vs MCM birch) phases the production.",
    false_positive_warnings: [
      "Light birch finish alone does not prove Heywood-Wakefield (per seed False Positive Warning). Many companies made blond furniture.",
      "'Established 1826' refers to the original Heywood Brothers lineage, not the production date of the piece.",
    ],
    attribution_confidence_rule: "Eagle stamp or full label plus matching birch construction and known finish/color is high confidence; form alone is medium to low.",
    related_names: ["Heywood Brothers", "Wakefield Rattan Co.", "Heywood Brothers & Wakefield Co."],
    anti_classification_guidance: {
      boundary_date: 1921,
      boundary_type: "form_emergence",
      guidance_text: "Heywood-Wakefield Company name emerged in 1921 from the renaming of Heywood Brothers & Wakefield Company; pieces predating 1921 with co-branded 'Heywood' + 'Wakefield' wording use the earlier 'Heywood Brothers & Wakefield Company' name (separate entry maker_mark_heywood_brothers_and_wakefield_co).",
      prominence: "prominent",
    },
  },
  // ─────────────────────────────────────────────────────────────
  // BATCH 7 — Cedar Chests, Trunks, and Bedroom Furniture (4)
  // ─────────────────────────────────────────────────────────────
  {
    id: "maker_mark_lane_company",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 6,
    indicator_text: "Lane Company / Lane Furniture, 1912-onward Altavista Virginia cedar chests, case goods, tables, bedroom and dining furniture.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Cedar Chests section. Distinctive backwards-serial-number date system for cedar chests. Legacy entry maker_mark_lane_furniture_label preserved in MAKER_MARKS legacy array. Safety-recall note for old cedar chest locks routes to notes, not dating_clues.",
    maker_name: "Lane Company / Lane Furniture",
    region: "Altavista, Virginia",
    furniture_categories: ["cedar_chests", "case_goods", "tables", "bedroom_furniture", "dining_furniture", "occasional_furniture"],
    known_mark_types: ["paper_label", "burned_mark", "branded_stamp", "serial_style_number", "ink_stamp"],
    common_mark_locations: [
      { physical_location: "case_bottom", physical_location_notes: "chest bottom" },
      { physical_location: "lid_or_top_movable", physical_location_notes: "underside of lid", functional_role: "specialized_function" },
      { physical_location: "case_carcass", physical_location_notes: "inside chest" },
      { physical_location: "case_back" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
    ],
    known_wording: ["Lane", "The Lane Co.", "Lane Furniture", "Altavista, Virginia"],
    visual_traits: "Cedar chests with characteristic aromatic cedar interior; 'Lane' paper labels, burned/stamped marks, serial numbers (backwards-date format), style numbers, warranty labels, lock notices on cedar chests.",
    mark_text_patterns: ["lane", "the lane co", "lane furniture"],
    period_associations: [
      { period_label: "Lane Company production", date_floor: 1912,
        usage_notes: "Per seed Date Range: '1912 onward; cedar chests especially 20th century; cedar chest production ended in the 21st century.'" },
    ],
    dating_clues: "Lane cedar chests commonly use serial numbers read backward as manufacture dates per seed Dating Clue, with caveats for some earlier or unusual examples. Style number alone is not a date.",
    false_positive_warnings: [
      "Style number alone is not a date (per seed False Positive Warning).",
      "A serial number may include plant digits or exceptions; backwards-date system has documented exceptions.",
    ],
    attribution_confidence_rule: "High confidence requires Lane name plus serial/style format or original label. Safety Note (per seed): Old Lane cedar chest locks may require safety replacement; flag separately from maker attribution.",
    related_names: ["The Lane Co.", "Lane Bros.", "Action Industries"],
  },
  {
    id: "maker_mark_roos_manufacturing",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Roos Manufacturing / Ed Roos Co., early 20th century Chicago / Forest Park Illinois cedar chests and hope chests with heart/sweetheart/tree motif labels.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Cedar Chests section. Legacy entry maker_mark_roos_sweetheart_label preserved in MAKER_MARKS legacy array.",
    maker_name: "Roos Manufacturing / Ed Roos Co.",
    region: "Chicago / Forest Park, Illinois",
    furniture_categories: ["cedar_chests", "hope_chests", "blanket_chests"],
    known_mark_types: ["paper_label", "decal", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "lid_or_top_movable", physical_location_notes: "chest interior lid", functional_role: "specialized_function" },
      { physical_location: "case_bottom", physical_location_notes: "chest bottom" },
      { physical_location: "case_back" },
      { physical_location: "case_carcass", physical_location_notes: "paper label inside" },
    ],
    known_wording: ["Roos", "Ed Roos Co.", "Roos Mfg. Co.", "Sweetheart", "Forest Park"],
    visual_traits: "Cedar chest interiors with paper labels using heart/sweetheart/tree motifs depending on period. 'Sweetheart' label era (1920-1939) is the best-documented variant.",
    mark_text_patterns: ["roos", "sweetheart", "ed roos", "forest park"],
    period_associations: [
      { period_label: "Roos Manufacturing / Ed Roos Co. era", date_floor: 1900, date_ceiling: 1970,
        usage_notes: "Per seed Date Range: 'Early 20th century; Roos Manufacturing and Ed Roos labels vary by period.'" },
    ],
    dating_clues: "Label motif variation (heart, sweetheart, tree) date specific production phases; 'Sweetheart' label 1920-1939 well-documented.",
    false_positive_warnings: [
      "Heart motifs alone do not prove Roos (per seed False Positive Warning).",
    ],
    attribution_confidence_rule: "Require label wording or branded mark.",
    related_names: ["Ed Roos Company", "Roos Mfg. Co."],
  },
  {
    id: "maker_mark_cavalier",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Cavalier, 20th-century Chattanooga Tennessee cedar chest and furniture manufacturer.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Cedar Chests section.",
    maker_name: "Cavalier",
    region: "Chattanooga, Tennessee",
    furniture_categories: ["cedar_chests", "furniture"],
    known_mark_types: ["paper_label", "metal_tag", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "lid_or_top_movable", physical_location_notes: "underside of chest lid", functional_role: "specialized_function" },
      { physical_location: "case_bottom" },
      { physical_location: "case_back" },
    ],
    known_wording: ["Cavalier", "Cavalier Corp.", "Chattanooga, Tenn."],
    visual_traits: "Cedar chests competing with Lane and Roos; paper labels, metal plates, branded marks on chest interiors.",
    mark_text_patterns: ["cavalier", "cavalier corp"],
    period_associations: [
      { period_label: "Cavalier production", date_floor: 1920, date_ceiling: 1980,
        usage_notes: "Per seed Date Range: '20th century.'" },
    ],
    dating_clues: "Label format evolution; competitor to Lane in the cedar-chest category.",
    false_positive_warnings: [
      "Cedar chest form alone is not Lane/Roos/Cavalier (per seed False Positive Warning). Require label.",
    ],
    attribution_confidence_rule: "Require Cavalier label or branded mark.",
    related_names: ["Lane Company", "Roos Manufacturing", "Caswell-Runyan"],
  },
  {
    id: "maker_mark_caswell_runyan",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Caswell-Runyan, early to mid-20th century Huntington Indiana cedar chests, radio cabinets, and case goods.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Cedar Chests section. Often confused with Lane if only cedar chest form is considered.",
    maker_name: "Caswell-Runyan",
    region: "Huntington, Indiana",
    furniture_categories: ["cedar_chests", "radio_cabinets", "case_goods"],
    known_mark_types: ["paper_label", "decal", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "lid_or_top_movable", physical_location_notes: "underside of chest lid", functional_role: "specialized_function" },
      { physical_location: "case_bottom" },
      { physical_location: "case_back" },
    ],
    known_wording: ["Caswell-Runyan", "Caswell Runyan", "Huntington, Indiana"],
    visual_traits: "Cedar chests, radio cabinets, and case goods. Paper labels, decals, branded marks.",
    mark_text_patterns: ["caswell-runyan", "caswell runyan"],
    period_associations: [
      { period_label: "Caswell-Runyan production", date_floor: 1905, date_ceiling: 1955,
        usage_notes: "Per seed Date Range: 'Early to mid-20th century.'" },
    ],
    dating_clues: "Radio-cabinet production phases (1920s-1940s) date specific lines.",
    false_positive_warnings: [
      "Often confused with Lane if only cedar chest form is considered (per seed False Positive Warning).",
    ],
    attribution_confidence_rule: "Require Caswell-Runyan label or branded mark.",
    related_names: ["Lane Company", "Roos Manufacturing", "Cavalier"],
  },
  // ─────────────────────────────────────────────────────────────
  // BLOCK 28b — 20TH-CENTURY ONWARD MAKERS (38 entries)
  // BATCH 1 — Mid-Century Modern and 20th-Century Case Goods (27)
  // ─────────────────────────────────────────────────────────────
  {
    id: "maker_mark_herman_miller",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Herman Miller, 20th-century to present Zeeland Michigan modern seating, office furniture, and licensed designer collaborations (Eames, Nelson).",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section. Eames and Nelson designer-licensed entries authored separately in Batch 2. Per seed Eames Label Caution: labels and patent labels changed over time and are useful for authentication and dating per Eames.com documentation.",
    maker_name: "Herman Miller",
    region: "Zeeland, Michigan",
    furniture_categories: ["modern_seating", "office_furniture", "eames_designs", "nelson_designs", "storage_systems"],
    known_mark_types: ["paper_label", "foil_label", "metal_tag", "impressed_mark", "ink_stamp", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "upholstery_seat", physical_location_notes: "underside of molded shells" },
      { physical_location: "base_or_plinth" },
      { physical_location: "upholstery_seat", physical_location_notes: "seat bottoms" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
    ],
    known_wording: ["Herman Miller", "Herman Miller Zeeland Michigan", "Eames Office"],
    visual_traits: "Modern seating including molded fiberglass shells, lounge chairs, office systems. Paper, foil, and metal labels; patent labels for licensed Eames designs; molded shell stamps; date labels.",
    mark_text_patterns: ["herman miller", "zeeland"],
    period_associations: [
      { period_label: "Herman Miller modern production era", date_floor: 1923,
        usage_notes: "Per seed Date Range: '20th century to present.' Founded 1923; pivoted to modern under D.J. De Pree." },
    ],
    dating_clues: "Eames patent labels documented 1957 through 1993 per Eames.com; label/stamp variation dates specific production periods. Shell-stamp molded marks date production phases.",
    false_positive_warnings: [
      "Eames-style form without Herman Miller / Vitra / authorized label is not enough (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Eames-style' versus authentic Herman Miller licensed production.",
    ],
    attribution_confidence_rule: "Require correct label/stamp, construction, hardware, dimensions, and production details.",
    related_names: ["Eames Office", "Vitra (European licensee)", "Charles Eames", "Ray Eames", "George Nelson"],
  },
  {
    id: "maker_mark_knoll",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Knoll / Knoll Associates, 1938-onward New York / Pennsylvania modernist furniture and office systems; Saarinen, Bertoia, Mies, Florence Knoll licensed production.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section. Single entry per pre-addressed CC Q3 (naming variation rather than firm succession). Saarinen and Bertoia designer-licensed entries authored separately in Batch 2.",
    maker_name: "Knoll / Knoll Associates",
    region: "New York / Pennsylvania",
    furniture_categories: ["saarinen_designs", "bertoia_designs", "mies_designs", "florence_knoll_designs", "office_systems", "seating", "tables"],
    known_mark_types: ["paper_label", "foil_label", "decal", "ink_stamp"],
    common_mark_locations: [
      { physical_location: "upholstery_seat", physical_location_notes: "underside of seats" },
      { physical_location: "base_or_plinth", physical_location_notes: "table bases" },
      { physical_location: "upholstery_seat", physical_location_notes: "upholstery tags" },
      { physical_location: "case_back" },
    ],
    known_wording: ["Knoll", "Knoll Associates", "Knoll International"],
    visual_traits: "Tulip tables, wire chairs, Barcelona chairs, Florence Knoll-style sofas, and office systems. Paper, foil, and decal labels; fabric labels on upholstered examples; stamped marks.",
    mark_text_patterns: ["knoll", "knoll associates", "knoll international"],
    period_associations: [
      { period_label: "Knoll / Knoll Associates production", date_floor: 1938,
        usage_notes: "Per seed Date Range: '1938 onward.'" },
    ],
    dating_clues: "Label format evolution: paper labels common throughout; foil labels mid-century; later labels post-1970s. Knoll products are generally well marked per seed.",
    false_positive_warnings: [
      "Tulip tables, wire chairs, Barcelona chairs, and Florence Knoll-style sofas are heavily copied (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: '[Designer]-style' versus authentic Knoll licensed production.",
    ],
    attribution_confidence_rule: "Without label or strong construction match, cap attribution at 'Knoll style / after Knoll.'",
    related_names: ["Eero Saarinen", "Harry Bertoia", "Ludwig Mies van der Rohe", "Florence Knoll", "Hans Knoll"],
  },
  {
    id: "maker_mark_drexel",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Drexel / Drexel Heritage, 20th-century Drexel/Morganton North Carolina case goods, dining, bedroom, mid-century and traditional lines; Drexel Heritage name adopted late 1960s.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section. Single combined seed entry per Op A-4 Surfacing 1 resolution (Mike-approved default): seed treats Drexel and Drexel Heritage as combined entry with 1969 name change within the entry. AntiClassificationGuidance encodes the 1969 boundary as form_emergence within this single entry (NOT reciprocal-pair pattern, which doesn't fit seed structure). Heritage / Drexel Heritage authored as separate entry per seed structure.",
    maker_name: "Drexel / Drexel Heritage",
    region: "Drexel / Morganton, North Carolina",
    furniture_categories: ["case_goods", "dining", "bedroom", "mid_century_lines", "traditional_lines"],
    known_mark_types: ["burned_mark", "paper_label", "stencil", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside", physical_location_notes: "underside of tables/chairs" },
    ],
    known_wording: ["Drexel", "Drexel Heritage", "Declaration", "Profile", "Precedent", "Triune"],
    visual_traits: "Case goods, dining, and bedroom furniture across mid-century lines (Declaration, Profile) and traditional lines (Precedent, Triune). Burned marks, paper labels, stencils, serial/model numbers.",
    mark_text_patterns: ["drexel", "drexel heritage", "declaration", "precedent", "triune"],
    period_associations: [
      { period_label: "Drexel production (pre-Heritage naming)", date_floor: 1903, date_ceiling: 1969,
        usage_notes: "Drexel founding 1903 per industry history; pre-1969 Drexel naming era." },
      { period_label: "Drexel Heritage naming era", date_floor: 1969,
        usage_notes: "Per seed: 'Drexel Heritage name after late 1960s corporate development.' Post-1969 production." },
    ],
    dating_clues: "Mark variant disambiguates Drexel (pre-1969) from Drexel Heritage (post-1969); line names (Declaration, Profile) date specific mid-century production. Per seed Dating Caution: secondary sources report marks and serial numbers in variable locations; use date codes carefully and do not overread a number without known format.",
    false_positive_warnings: [
      "'Declaration' or walnut MCM form alone does not prove Drexel (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Declaration' as line name requires Drexel maker confirmation.",
    ],
    attribution_confidence_rule: "Require Drexel mark, model/line label, or strong catalog match.",
    related_names: ["Heritage / Drexel Heritage", "Drexel Furniture Co."],
    anti_classification_guidance: {
      boundary_date: 1969,
      boundary_type: "form_emergence",
      guidance_text: "Drexel Heritage naming adopted in late 1960s corporate development. Pre-1969 production uses 'Drexel' naming; post-1969 production may use 'Drexel' or 'Drexel Heritage' marks. Mark variant alone is suggestive but not definitive boundary evidence; cross-reference construction and line-name details. Per Op A-4 Surfacing 1 resolution: seed treats Drexel and Drexel Heritage as combined entry rather than reciprocal-pair lineage.",
      prominence: "standard",
    },
  },
  {
    id: "maker_mark_broyhill",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Broyhill, 20th-century Lenoir North Carolina case goods, bedroom, and dining including Brasilia and Sculptra MCM lines.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Broyhill",
    region: "Lenoir, North Carolina",
    furniture_categories: ["case_goods", "bedroom", "dining", "brasilia_line", "sculptra_line", "saga_line"],
    known_mark_types: ["paper_label", "stencil", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "case_back" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "underside" },
    ],
    known_wording: ["Broyhill", "Brasilia", "Sculptra", "Saga", "Premier"],
    visual_traits: "20th-century factory case goods including MCM Brasilia line (arched pulls; Brazilian-modernist influence) and Sculptra line. Paper labels, stenciled numbers, product labels.",
    mark_text_patterns: ["broyhill", "brasilia", "sculptra"],
    period_associations: [
      { period_label: "Broyhill production era", date_floor: 1926,
        usage_notes: "Per seed Date Range: '20th century.' Founded 1926." },
    ],
    dating_clues: "Per seed Format Clue: label format uses group number plus item number, such as XXXX-XX or XXX-XXX. Line-name evolution (Brasilia 1962-1966 MCM peak) dates specific production.",
    false_positive_warnings: [
      "Brasilia-like arched pulls or 'atomic' hardware can be copied or confused with other makers (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Brasilia' could be Broyhill Brasilia, Brasilia-style knockoff, or different maker's similar-named line.",
    ],
    attribution_confidence_rule: "Require Broyhill label, stenciled number matching known format, or catalog match.",
    related_names: [],
  },
  {
    id: "maker_mark_bassett",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Bassett, 20th-century onward Bassett Virginia bedroom, dining, and case goods producer.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Bassett",
    region: "Bassett, Virginia",
    furniture_categories: ["bedroom", "dining", "case_goods", "mcm_lines", "traditional_lines"],
    known_mark_types: ["paper_label", "branded_stamp", "stencil", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Bassett", "Bassett Furniture", "Bassett, Virginia"],
    visual_traits: "20th-century factory bedroom, dining, and case goods across MCM and traditional lines.",
    mark_text_patterns: ["bassett"],
    period_associations: [
      { period_label: "Bassett production era", date_floor: 1902,
        usage_notes: "Per seed Date Range: '20th century onward.' Founded 1902." },
    ],
    dating_clues: "Style line evolution; label format change over decades.",
    false_positive_warnings: [
      "'Bassett style' or Virginia production is not enough (per seed False Positive Warning).",
      "See Universal Rule #2 city_not_maker: Virginia production includes multiple firms.",
    ],
    attribution_confidence_rule: "Require Bassett label or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_kent_coffey",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Kent-Coffey, mid-20th century North Carolina bedroom and dining furniture; MCM lines collectible.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Kent-Coffey",
    region: "North Carolina",
    furniture_categories: ["bedroom", "dining", "mid_century_lines"],
    known_mark_types: ["stencil", "paper_label", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Kent-Coffey", "Kent Coffey"],
    visual_traits: "Mid-century walnut bedroom and dining case goods; MCM lines feature distinctive hardware and tapered legs.",
    mark_text_patterns: ["kent-coffey", "kent coffey"],
    period_associations: [
      { period_label: "Kent-Coffey production era", date_floor: 1925, date_ceiling: 1985,
        usage_notes: "Per seed Date Range: 'Mid-20th century.'" },
    ],
    dating_clues: "Line names and model numbers; MCM peak 1950s-1960s.",
    false_positive_warnings: [
      "Similar walnut case goods are often misattributed (per seed False Positive Warning).",
    ],
    attribution_confidence_rule: "Require Kent-Coffey label or stenciled mark.",
    related_names: [],
  },
  {
    id: "maker_mark_american_of_martinsville",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "American of Martinsville, 20th-century Martinsville Virginia bedroom, dining, hotel, and MCM case goods.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "American of Martinsville",
    region: "Martinsville, Virginia",
    furniture_categories: ["bedroom", "dining", "hotel_furniture", "mcm_case_goods"],
    known_mark_types: ["paper_label", "branded_stamp", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["American of Martinsville", "American Martinsville"],
    visual_traits: "20th-century factory bedroom, dining, hotel furniture, and MCM case goods. High-quality walnut MCM production typical mid-century output.",
    mark_text_patterns: ["american of martinsville", "american martinsville"],
    period_associations: [
      { period_label: "American of Martinsville production era", date_floor: 1906,
        usage_notes: "Per seed Date Range: '20th century.' Founded 1906." },
    ],
    dating_clues: "Style line evolution; label format change.",
    false_positive_warnings: [
      "High-quality walnut MCM casework alone is not enough (per seed False Positive Warning).",
      "See Universal Rule #2 city_not_maker: Martinsville Virginia includes multiple makers.",
    ],
    attribution_confidence_rule: "Require American of Martinsville label or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_united_furniture",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "United Furniture, 20th-century Lexington North Carolina mid-century case goods, bedroom, and dining.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section. Frequently confused with Broyhill, Kent-Coffey, Bassett, and American of Martinsville.",
    maker_name: "United Furniture",
    region: "Lexington, North Carolina",
    furniture_categories: ["mid_century_case_goods", "bedroom", "dining"],
    known_mark_types: ["paper_label", "stencil", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["United Furniture", "United"],
    visual_traits: "Mid-century case goods, bedroom, and dining. Similar visual profile to other NC/VA factory MCM makers; mark required to distinguish.",
    mark_text_patterns: ["united furniture"],
    period_associations: [
      { period_label: "United Furniture production era", date_floor: 1925, date_ceiling: 1990,
        usage_notes: "Per seed Date Range: '20th century.'" },
    ],
    dating_clues: "Model numbers; line names.",
    false_positive_warnings: [
      "Often confused with Broyhill, Kent-Coffey, Bassett, and American of Martinsville (per seed False Positive Warning).",
      "See Universal Rule #2 city_not_maker: Lexington NC includes multiple firms (cross-reference Lexington maker entry).",
    ],
    attribution_confidence_rule: "Require United Furniture label or stenciled mark with model match.",
    related_names: ["Lexington (NC firm, distinct)"],
  },
  {
    id: "maker_mark_stanley_furniture",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Stanley Furniture, 20th-century onward Stanleytown Virginia case goods, bedroom, dining; Young America line.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Stanley Furniture",
    region: "Stanleytown, Virginia",
    furniture_categories: ["case_goods", "bedroom", "dining", "young_america_line"],
    known_mark_types: ["paper_label", "branded_stamp", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Stanley Furniture", "Stanley", "Young America"],
    visual_traits: "20th-century case goods, bedroom, and dining; Young America line is the youth furniture line.",
    mark_text_patterns: ["stanley furniture", "stanley", "young america"],
    period_associations: [
      { period_label: "Stanley Furniture production era", date_floor: 1924,
        usage_notes: "Per seed Date Range: '20th century onward.' Founded 1924." },
    ],
    dating_clues: "Line-name evolution; label format change.",
    false_positive_warnings: [
      "Traditional revival style alone is not enough (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Young America' is Stanley's line, not a separate maker.",
    ],
    attribution_confidence_rule: "Require Stanley Furniture label or branded mark.",
    related_names: ["Young America (Stanley line)"],
  },
  {
    id: "maker_mark_thomasville",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 6,
    indicator_text: "Thomasville, 20th-century onward Thomasville North Carolina dining, bedroom, case goods, and upholstery.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section. Legacy entry maker_mark_thomasville (legacy id 'thomasville_label') preserved in MAKER_MARKS legacy array; coexists with this new MakerMarkEntry per Q5 Option K.",
    maker_name: "Thomasville",
    region: "Thomasville, North Carolina",
    furniture_categories: ["dining", "bedroom", "case_goods", "upholstery"],
    known_mark_types: ["paper_label", "branded_stamp", "ink_stamp", "metal_tag"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface; drawer stamps common" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Thomasville", "Thomasville Furniture"],
    visual_traits: "20th-century factory dining, bedroom, case goods, and upholstery. Paper labels, branded marks, drawer stamps, metal tags.",
    mark_text_patterns: ["thomasville"],
    period_associations: [
      { period_label: "Thomasville production era", date_floor: 1904,
        usage_notes: "Per seed Date Range: '20th century onward.' Founded 1904." },
    ],
    dating_clues: "Drawer-stamp date formats; label evolution.",
    false_positive_warnings: [
      "'Thomasville style' is not a maker attribution (per seed False Positive Warning).",
      "See Universal Rule #2 city_not_maker: 'Thomasville' is also a city in NC and elsewhere.",
      "See Universal Rule #5 line_name_not_maker: 'Thomasville-style' versus authentic Thomasville production.",
    ],
    attribution_confidence_rule: "Require Thomasville label or drawer stamp.",
    related_names: [],
  },
  {
    id: "maker_mark_henredon",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 7,
    indicator_text: "Henredon, 20th-century Morganton North Carolina high-end case goods, upholstery, and designer collections.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Henredon",
    region: "Morganton, North Carolina",
    furniture_categories: ["high_end_case_goods", "upholstery", "designer_collections"],
    known_mark_types: ["branded_stamp", "paper_label", "metal_tag", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "upholstery_seat", physical_location_notes: "upholstery tags" },
    ],
    known_wording: ["Henredon", "Henredon Furniture"],
    visual_traits: "High-end case goods, upholstery, and designer collections. Branded marks, paper labels, metal tags, model labels.",
    mark_text_patterns: ["henredon"],
    period_associations: [
      { period_label: "Henredon production era", date_floor: 1945,
        usage_notes: "Per seed Date Range: '20th century.' Founded 1945." },
    ],
    dating_clues: "Designer collection evolution; model labels date specific lines.",
    false_positive_warnings: [
      "High-end traditional style is not enough (per seed False Positive Warning).",
    ],
    attribution_confidence_rule: "Require Henredon label or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_heritage_drexel_heritage",
    category: "maker_mark",
    positive_authority: 6,
    hard_negative_authority: 7,
    indicator_text: "Heritage / Drexel Heritage, mid-to-late 20th century North Carolina traditional and revival case goods; distinct from Drexel / Drexel Heritage combined entry.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section line 133 — separate seed entry from line-115 'Drexel / Drexel Heritage' per Op A-4 Surfacing 1 resolution. Maker_name 'Heritage' or 'Drexel Heritage' may overlap with the combined Drexel entry's later naming; full manufacturer context required.",
    maker_name: "Heritage / Drexel Heritage",
    region: "North Carolina",
    furniture_categories: ["traditional_case_goods", "revival_case_goods"],
    known_mark_types: ["paper_label", "branded_stamp", "ink_stamp"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Heritage", "Drexel Heritage"],
    visual_traits: "Traditional and revival case goods; labels and stamps using 'Heritage' or 'Drexel Heritage.'",
    mark_text_patterns: ["heritage", "drexel heritage"],
    period_associations: [
      { period_label: "Heritage / Drexel Heritage production era", date_floor: 1950, date_ceiling: 1995,
        usage_notes: "Per seed Date Range: 'Mid-to-late 20th century.'" },
    ],
    dating_clues: "Label wording (Heritage vs Drexel Heritage) and corporate context date specific production phases.",
    false_positive_warnings: [
      "'Heritage' can also be a generic line/marketing term. Require full manufacturer context (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Heritage' is widely used by other makers as line/quality designation.",
    ],
    attribution_confidence_rule: "Require full manufacturer context — 'Heritage' alone is insufficient; 'Drexel Heritage' or combined label evidence required.",
    related_names: ["Drexel / Drexel Heritage"],
  },
  {
    id: "maker_mark_century_furniture",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Century Furniture, 20th-century onward Hickory North Carolina high-end case goods and upholstery.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Century Furniture",
    region: "Hickory, North Carolina",
    furniture_categories: ["high_end_case_goods", "upholstery"],
    known_mark_types: ["paper_label", "branded_stamp", "metal_tag"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "upholstery_seat", physical_location_notes: "upholstery tags" },
    ],
    known_wording: ["Century Furniture", "Century"],
    visual_traits: "High-end case goods and upholstery. Paper labels, branded marks, metal tags, upholstery tags.",
    mark_text_patterns: ["century furniture"],
    period_associations: [
      { period_label: "Century Furniture production era", date_floor: 1947,
        usage_notes: "Per seed Date Range: '20th century onward.' Founded 1947." },
    ],
    dating_clues: "Designer collection labels; label evolution.",
    false_positive_warnings: [
      "'Century' may appear in other contexts. Require proper label (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Century' as descriptor versus 'Century Furniture' as firm.",
    ],
    attribution_confidence_rule: "Require proper Century Furniture label.",
    related_names: [],
  },
  {
    id: "maker_mark_baker_furniture",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 7,
    indicator_text: "Baker Furniture, 20th-century onward Grand Rapids Michigan high-end traditional, modern, and designer collections.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section. Legacy entry maker_mark_baker_furniture (legacy id 'baker_furniture_label') preserved in MAKER_MARKS legacy array.",
    maker_name: "Baker Furniture",
    region: "Grand Rapids, Michigan",
    furniture_categories: ["high_end_traditional", "modern", "designer_collections"],
    known_mark_types: ["metal_tag", "paper_label", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface; drawer labels" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Baker Furniture", "Baker", "Baker Knapp & Tubbs"],
    visual_traits: "High-end traditional, modern, and designer collection case goods. Metal tags, paper labels, branded marks, drawer labels.",
    mark_text_patterns: ["baker furniture", "baker knapp"],
    period_associations: [
      { period_label: "Baker Furniture production era", date_floor: 1890,
        usage_notes: "Per seed Date Range: '20th century onward.' Founded 1890." },
    ],
    dating_clues: "Designer collection labels; label evolution.",
    false_positive_warnings: [
      "Baker-style quality is not proof. Require mark or catalog match (per seed False Positive Warning).",
      "See Universal Rule #2 city_not_maker: Grand Rapids includes multiple high-end makers.",
    ],
    attribution_confidence_rule: "Require Baker Furniture mark or catalog match.",
    related_names: ["Baker Knapp & Tubbs"],
  },
  {
    id: "maker_mark_kittinger",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 7,
    indicator_text: "Kittinger, 20th-century Buffalo New York high-end reproduction furniture; Colonial Williamsburg exclusive licensee 1937-1990.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section. Legacy entry maker_mark_kittinger (legacy id 'kittinger_label') preserved in MAKER_MARKS legacy array. Williamsburg reproduction licensing has its own dating discipline distinct from period-style reproduction generally.",
    maker_name: "Kittinger Furniture",
    region: "Buffalo, New York",
    furniture_categories: ["high_end_reproduction", "institutional_furniture", "williamsburg_reproductions"],
    known_mark_types: ["paper_label", "branded_stamp", "metal_tag", "catalog_plate"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Kittinger", "Kittinger Furniture", "Colonial Williamsburg Reproduction"],
    visual_traits: "High-end reproduction furniture; Williamsburg license labels distinctive. Historically accurate 18th-century-style construction details.",
    mark_text_patterns: ["kittinger", "colonial williamsburg reproduction"],
    period_associations: [
      { period_label: "Kittinger general production", date_floor: 1866,
        usage_notes: "Per seed Date Range: '20th century.' Firm founded 1866." },
      { period_label: "Kittinger Colonial Williamsburg exclusive licensee era", date_floor: 1937, date_ceiling: 1990,
        usage_notes: "Per seed Dating Note: 'Kittinger is known for historically accurate reproductions and was the exclusive Colonial Williamsburg reproduction licensee from 1937 to 1990.'" },
    ],
    dating_clues: "Williamsburg license labels date 1937-1990 production window per seed. Style reproduces 18th-century forms but production dates 20th-century — 'date the object by production evidence, not by the period style reproduced' per seed Confidence Rule.",
    false_positive_warnings: [
      "18th-century style does not mean 18th-century date; Kittinger pieces are often high-quality reproductions (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Colonial Williamsburg' is licensed reproduction program, not maker; license-holder identification required.",
    ],
    attribution_confidence_rule: "Treat Kittinger labels as high maker evidence, but date the object by production evidence, not by the period style reproduced.",
    related_names: ["Colonial Williamsburg Foundation", "Kittinger Manufacturing Co."],
  },
  {
    id: "maker_mark_kindel",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Kindel, 20th-century onward Grand Rapids Michigan high-end reproductions and designer lines.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section. Legacy entry maker_mark_kindel (legacy id 'kindel_furniture_label') preserved in MAKER_MARKS legacy array.",
    maker_name: "Kindel Furniture",
    region: "Grand Rapids, Michigan",
    furniture_categories: ["high_end_reproductions", "designer_lines"],
    known_mark_types: ["paper_label", "metal_tag", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Kindel", "Kindel Furniture", "Kindel Grand Rapids"],
    visual_traits: "High-end reproduction furniture and designer collaborations.",
    mark_text_patterns: ["kindel"],
    period_associations: [
      { period_label: "Kindel production era", date_floor: 1901,
        usage_notes: "Per seed Date Range: '20th century onward.' Founded 1901." },
    ],
    dating_clues: "Designer collaboration labels; period of production.",
    false_positive_warnings: [
      "Grand Rapids plus high quality is not enough (per seed False Positive Warning).",
      "See Universal Rule #2 city_not_maker: Grand Rapids includes multiple high-end makers (Baker, Kindel, Widdicomb, John Widdicomb).",
    ],
    attribution_confidence_rule: "Require Kindel label or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_councill_craftsmen",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Councill Craftsmen, 20th-century Denton North Carolina high-end traditional and reproduction case goods.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Councill Craftsmen",
    region: "Denton, North Carolina",
    furniture_categories: ["high_end_traditional", "reproduction_case_goods"],
    known_mark_types: ["paper_label", "branded_stamp", "metal_tag"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Councill Craftsmen", "Councill"],
    visual_traits: "High-end traditional and reproduction case goods; Chippendale and Queen Anne style reproductions.",
    mark_text_patterns: ["councill craftsmen", "councill"],
    period_associations: [
      { period_label: "Councill Craftsmen production era", date_floor: 1925, date_ceiling: 2007,
        usage_notes: "Per seed Date Range: '20th century.'" },
    ],
    dating_clues: "Label evolution.",
    false_positive_warnings: [
      "Traditional Chippendale / Queen Anne style alone is not enough (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Chippendale-style' versus Councill Craftsmen reproduction.",
    ],
    attribution_confidence_rule: "Require Councill Craftsmen label or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_craftique",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Craftique, 20th-century Mebane North Carolina solid mahogany traditional reproductions.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Craftique",
    region: "Mebane, North Carolina",
    furniture_categories: ["solid_mahogany_traditional_reproductions"],
    known_mark_types: ["paper_label", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Craftique", "Craftique Mebane"],
    visual_traits: "Solid mahogany traditional reproduction furniture.",
    mark_text_patterns: ["craftique"],
    period_associations: [
      { period_label: "Craftique production era", date_floor: 1946,
        usage_notes: "Per seed Date Range: '20th century.' Founded 1946." },
    ],
    dating_clues: "Label evolution.",
    false_positive_warnings: [
      "Solid mahogany reproduction furniture is not automatically Craftique (per seed False Positive Warning).",
    ],
    attribution_confidence_rule: "Require Craftique label or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_pennsylvania_house",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Pennsylvania House, 20th-century Lewisburg Pennsylvania Colonial Revival dining, bedroom, and case goods.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Pennsylvania House",
    region: "Lewisburg, Pennsylvania",
    furniture_categories: ["colonial_revival", "dining", "bedroom", "case_goods"],
    known_mark_types: ["paper_label", "burned_mark", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Pennsylvania House"],
    visual_traits: "Colonial Revival case goods; maple and cherry colonial reproductions.",
    mark_text_patterns: ["pennsylvania house"],
    period_associations: [
      { period_label: "Pennsylvania House production era", date_floor: 1887,
        usage_notes: "Per seed Date Range: '20th century.' Founded 1887." },
    ],
    dating_clues: "Label evolution.",
    false_positive_warnings: [
      "Pennsylvania style or maple/cherry colonial furniture is not enough (per seed False Positive Warning).",
      "See Universal Rule #2 city_not_maker: 'Pennsylvania' as state is too broad.",
    ],
    attribution_confidence_rule: "Require Pennsylvania House label or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_tell_city_chair_co",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Tell City Chair Co., 20th-century Tell City Indiana chairs, dining sets, and hard-rock maple furniture.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Tell City Chair Co.",
    region: "Tell City, Indiana",
    furniture_categories: ["chairs", "dining_sets", "hard_rock_maple_furniture"],
    known_mark_types: ["paper_label", "branded_stamp", "stencil"],
    common_mark_locations: [
      { physical_location: "underside", physical_location_notes: "chair seat undersides" },
      { physical_location: "frame_rail" },
      { physical_location: "case_back" },
    ],
    known_wording: ["Tell City Chair Co.", "Tell City"],
    visual_traits: "Hard-rock maple chairs and dining sets; colonial-style seating.",
    mark_text_patterns: ["tell city chair", "tell city"],
    period_associations: [
      { period_label: "Tell City Chair Co. production era", date_floor: 1865, date_ceiling: 2011,
        usage_notes: "Per seed Date Range: '20th century.' Founded 1865 (German immigrant community)." },
    ],
    dating_clues: "Label evolution.",
    false_positive_warnings: [
      "Maple colonial chair form is not enough (per seed False Positive Warning).",
      "See Universal Rule #2 city_not_maker: 'Tell City' is the place name on the maker.",
    ],
    attribution_confidence_rule: "Require Tell City Chair Co. label or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_willett_furniture",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Willett Furniture, 20th-century Louisville Kentucky solid cherry traditional forms.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Willett Furniture",
    region: "Louisville, Kentucky",
    furniture_categories: ["solid_cherry_traditional"],
    known_mark_types: ["paper_label", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Willett", "Willett Furniture", "Willett Louisville"],
    visual_traits: "Solid cherry traditional forms; colonial-style case goods and tables.",
    mark_text_patterns: ["willett"],
    period_associations: [
      { period_label: "Willett Furniture production era", date_floor: 1934, date_ceiling: 1988,
        usage_notes: "Per seed Date Range: '20th century.'" },
    ],
    dating_clues: "Label evolution.",
    false_positive_warnings: [
      "Cherry colonial furniture is not automatically Willett (per seed False Positive Warning).",
    ],
    attribution_confidence_rule: "Require Willett label or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_ethan_allen",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 6,
    indicator_text: "Ethan Allen, 20th-century onward Vermont / New England corporate identity Colonial Revival, traditional, modern, and upholstery.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section. Legacy entry maker_mark_ethan_allen (legacy id 'ethan_allen_label') preserved in MAKER_MARKS legacy array. Broad manufacturing network beyond Vermont per seed.",
    maker_name: "Ethan Allen",
    region: "Vermont / New England (broad manufacturing network)",
    furniture_categories: ["colonial_revival", "traditional", "modern", "upholstery"],
    known_mark_types: ["paper_label", "branded_stamp", "metal_tag", "ink_stamp"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface; drawer stamps" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Ethan Allen", "Ethan Allen Inc."],
    visual_traits: "Colonial Revival, traditional, modern, and upholstery output. Paper labels, branded marks, metal tags, drawer stamps.",
    mark_text_patterns: ["ethan allen"],
    period_associations: [
      { period_label: "Ethan Allen production era", date_floor: 1932,
        usage_notes: "Per seed Date Range: '20th century onward.' Founded 1932." },
    ],
    dating_clues: "Style line evolution; label format change.",
    false_positive_warnings: [
      "Colonial style alone is not enough (per seed False Positive Warning).",
      "See Universal Rule #2 city_not_maker: 'Vermont' or 'New England' as region descriptor is generic.",
    ],
    attribution_confidence_rule: "Require Ethan Allen label or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_pulaski",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Pulaski, 20th-century onward Pulaski Virginia curio cabinets, bedroom, dining, clocks, and case goods.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Pulaski",
    region: "Pulaski, Virginia",
    furniture_categories: ["curio_cabinets", "bedroom", "dining", "clocks", "case_goods"],
    known_mark_types: ["paper_label", "ink_stamp", "metal_tag"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Pulaski", "Pulaski Furniture"],
    visual_traits: "Curio cabinets, bedroom and dining furniture, clocks, and case goods.",
    mark_text_patterns: ["pulaski"],
    period_associations: [
      { period_label: "Pulaski production era", date_floor: 1955,
        usage_notes: "Per seed Date Range: '20th century onward.' Founded 1955." },
    ],
    dating_clues: "Model numbers and line names.",
    false_positive_warnings: [
      "Curio cabinet form is not enough (per seed False Positive Warning).",
      "See Universal Rule #2 city_not_maker: 'Pulaski, Virginia' includes the maker but cities and states named Pulaski exist elsewhere.",
    ],
    attribution_confidence_rule: "Require Pulaski label or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_lexington",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Lexington, 20th-century onward Lexington North Carolina case goods, bedroom, dining; modern and traditional lines.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section. Distinct from United Furniture (also Lexington NC).",
    maker_name: "Lexington",
    region: "Lexington, North Carolina",
    furniture_categories: ["case_goods", "bedroom", "dining", "modern_lines", "traditional_lines"],
    known_mark_types: ["paper_label", "branded_stamp", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Lexington", "Lexington Furniture"],
    visual_traits: "Case goods, bedroom, and dining furniture across modern and traditional lines.",
    mark_text_patterns: ["lexington furniture", "lexington"],
    period_associations: [
      { period_label: "Lexington Furniture production era", date_floor: 1903,
        usage_notes: "Per seed Date Range: '20th century onward.' Lexington Furniture Industries founded 1903." },
    ],
    dating_clues: "Line names and model numbers.",
    false_positive_warnings: [
      "City of Lexington or Lexington-style wording alone is not enough (per seed False Positive Warning).",
      "See Universal Rule #2 city_not_maker: Lexington NC includes multiple firms (Lexington itself + United Furniture).",
      "See Universal Rule #5 line_name_not_maker: 'Lexington-style' versus authentic Lexington Furniture production.",
    ],
    attribution_confidence_rule: "Require Lexington Furniture label or branded mark with model match.",
    related_names: ["United Furniture (also Lexington NC, distinct)"],
  },
  {
    id: "maker_mark_hooker_furniture",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Hooker Furniture, 20th-century onward Martinsville Virginia desks, case goods, entertainment, and office furniture.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Hooker Furniture",
    region: "Martinsville, Virginia",
    furniture_categories: ["desks", "case_goods", "entertainment_furniture", "office_furniture"],
    known_mark_types: ["paper_label", "branded_stamp", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Hooker Furniture", "Hooker"],
    visual_traits: "Desks, case goods, entertainment, and office furniture.",
    mark_text_patterns: ["hooker furniture", "hooker"],
    period_associations: [
      { period_label: "Hooker Furniture production era", date_floor: 1924,
        usage_notes: "Per seed Date Range: '20th century onward.' Founded 1924." },
    ],
    dating_clues: "Model numbers and line names.",
    false_positive_warnings: [
      "Modern office furniture forms are generic; require mark (per seed False Positive Warning).",
    ],
    attribution_confidence_rule: "Require Hooker Furniture label or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_harden",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Harden, 20th-century McConnellsville New York solid cherry traditional furniture.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section.",
    maker_name: "Harden",
    region: "McConnellsville, New York",
    furniture_categories: ["solid_cherry_traditional"],
    known_mark_types: ["paper_label", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
      { physical_location: "case_back" },
      { physical_location: "underside" },
    ],
    known_wording: ["Harden", "Harden Furniture"],
    visual_traits: "Solid cherry traditional furniture.",
    mark_text_patterns: ["harden"],
    period_associations: [
      { period_label: "Harden production era", date_floor: 1844,
        usage_notes: "Per seed Date Range: '20th century.' Firm founded 1844; 20th-century production dominant." },
    ],
    dating_clues: "Label evolution.",
    false_positive_warnings: [
      "Solid cherry alone is not enough (per seed False Positive Warning).",
    ],
    attribution_confidence_rule: "Require Harden label or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_nichols_and_stone",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Nichols & Stone, 19th-century origins / 20th-century dominant production Gardner Massachusetts Windsor chairs, dining chairs, and colonial revival seating.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Mid-Century Modern section. Seed organizationally places this entry in MCM section despite 19th-century origins; 20th-century production dominant per seed.",
    maker_name: "Nichols & Stone",
    region: "Gardner, Massachusetts",
    furniture_categories: ["windsor_chairs", "dining_chairs", "colonial_revival_seating"],
    known_mark_types: ["branded_stamp", "paper_label", "ink_stamp"],
    common_mark_locations: [
      { physical_location: "underside", physical_location_notes: "chair seat undersides" },
      { physical_location: "frame_rail" },
    ],
    known_wording: ["Nichols & Stone", "Nichols and Stone", "Gardner, Mass."],
    visual_traits: "Windsor chairs, dining chairs, and colonial revival seating.",
    mark_text_patterns: ["nichols & stone", "nichols and stone"],
    period_associations: [
      { period_label: "Nichols & Stone 19th-century origins", date_floor: 1857, date_ceiling: 1900,
        usage_notes: "Per seed Date Range: '19th century origins.'" },
      { period_label: "Nichols & Stone 20th-century dominant production", date_floor: 1900, date_ceiling: 2008,
        usage_notes: "Per seed Date Range: '20th century production common.'" },
    ],
    dating_clues: "Label evolution; 19th-century origins vs 20th-century dominant production phases.",
    false_positive_warnings: [
      "Windsor form alone is not enough (per seed False Positive Warning).",
      "See Universal Rule #2 city_not_maker: Gardner MA is shared with Heywood Brothers and Heywood-Wakefield Co. (cross-reference Block 28a entries).",
    ],
    attribution_confidence_rule: "Require Nichols & Stone label or branded mark.",
    related_names: ["Heywood Brothers (Gardner MA, distinct)", "Heywood-Wakefield Co. (Gardner MA, distinct)"],
  },
  // ─────────────────────────────────────────────────────────────
  // BATCH 2 — Designer / Modern Licensed Production (4 entries)
  // Per Q2 Option G: MakerMarkEntry shape; maker_name encodes
  // licensed collaboration; region maps to license-holder
  // production location; elevated hard_negative_authority for
  // pervasive style-misattribution risk.
  // ─────────────────────────────────────────────────────────────
  {
    id: "maker_mark_eames_for_herman_miller",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 8,
    indicator_text: "Eames designs (Charles and Ray Eames) for Herman Miller licensed production, late 1940s onward Zeeland Michigan.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Designer/Modern Licensed Production section. Authored per Block 28b Q2 Option G as MakerMarkEntry; maker_name encodes the licensed collaboration; region maps to Herman Miller production location. Elevated hard_negative_authority (8) reflects pervasive Eames-style knockoff industry. Per Eames.com documentation: labels and stamps changed over time and are among the quickest ways to authenticate Eames designs; multiple patent labels documented from 1957 through 1993.",
    maker_name: "Eames designs for Herman Miller",
    region: "Zeeland, Michigan (Herman Miller production)",
    furniture_categories: ["molded_fiberglass_chairs", "lounge_chair_670_ottoman_671", "shell_chairs", "aluminum_group", "soft_pad_group", "wire_chairs", "lcw_lcm_dcw", "esu_storage_units"],
    known_mark_types: ["paper_label", "foil_label", "metal_tag", "impressed_mark", "ink_stamp", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "upholstery_seat", physical_location_notes: "underside of molded shell" },
      { physical_location: "base_or_plinth" },
      { physical_location: "underside" },
    ],
    known_wording: ["Herman Miller", "Eames Office", "Charles Eames", "Charles & Ray Eames", "Made in U.S.A."],
    visual_traits: "Molded fiberglass shell chairs (1948-onward), Lounge Chair 670 + Ottoman 671 (1956-onward), wire chairs, aluminum group, soft pad group, plywood LCW/LCM/DCW. Herman Miller labels, Eames Office labels, patent labels documented 1957 through 1993.",
    mark_text_patterns: ["herman miller", "eames office", "charles eames"],
    period_associations: [
      { period_label: "Eames-for-Herman-Miller licensed production era", date_floor: 1946,
        usage_notes: "Per seed Date Range: 'Late 1940s onward.' Eames Office began collaboration with Herman Miller in 1946." },
    ],
    dating_clues: "Patent labels documented 1957 through 1993 per Eames.com; label/stamp variations date specific production phases. Shell construction (1st-generation rope-edge fiberglass; later smooth-edge; later polypropylene).",
    false_positive_warnings: [
      "'Eames style' is not an attribution. Knockoffs are common (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Eames' is a designer name; manufacturer requires Herman Miller label (or licensed Vitra label for European production).",
    ],
    attribution_confidence_rule: "Require label/stamp plus correct construction details.",
    related_names: ["Charles Eames", "Ray Eames", "Eames Office", "Herman Miller", "Vitra (European licensee)"],
  },
  {
    id: "maker_mark_nelson_for_herman_miller",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 8,
    indicator_text: "Nelson designs (George Nelson) for Herman Miller licensed production, mid-20th century onward Zeeland Michigan.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Designer/Modern Licensed Production section. Authored per Block 28b Q2 Option G. Elevated hard_negative_authority (8) reflects pervasive Nelson-style knockoff industry (slatted benches, modular storage, thin-line case goods widely copied).",
    maker_name: "Nelson designs for Herman Miller",
    region: "Zeeland, Michigan (Herman Miller production)",
    furniture_categories: ["slatted_benches", "modular_storage", "thin_line_case_goods", "ball_clock_and_clocks", "marshmallow_sofa", "coconut_chair"],
    known_mark_types: ["paper_label", "foil_label", "metal_tag", "ink_stamp", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "underside", physical_location_notes: "bench underside" },
      { physical_location: "case_back" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface" },
    ],
    known_wording: ["Herman Miller", "George Nelson", "Nelson Associates"],
    visual_traits: "Slatted benches, modular storage systems (CSS, ESU after Eames), thin-line case goods, ball clocks. Herman Miller labels, model labels, case labels.",
    mark_text_patterns: ["herman miller", "george nelson", "nelson"],
    period_associations: [
      { period_label: "Nelson-for-Herman-Miller licensed production era", date_floor: 1945,
        usage_notes: "Per seed Date Range: 'Mid-20th century onward.' Nelson became Herman Miller design director in 1945." },
    ],
    dating_clues: "Label variation dates specific production phases.",
    false_positive_warnings: [
      "Slatted benches, modular storage, and thin-line case goods are widely copied (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Nelson' is a designer name; manufacturer requires Herman Miller label.",
    ],
    attribution_confidence_rule: "Require Herman Miller label, model label, or case label plus correct construction details.",
    related_names: ["George Nelson", "Nelson Associates", "Herman Miller"],
  },
  {
    id: "maker_mark_saarinen_for_knoll",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 9,
    indicator_text: "Saarinen designs (Eero Saarinen) for Knoll licensed production, mid-20th century onward New York / Pennsylvania production.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Designer/Modern Licensed Production section. Authored per Block 28b Q2 Option G. Very high hard_negative_authority (9) reflects pervasive Tulip-style knockoff industry — Tulip tables and chairs are among the most heavily copied designs in 20th-century furniture.",
    maker_name: "Saarinen designs for Knoll",
    region: "New York / Pennsylvania (Knoll production)",
    furniture_categories: ["tulip_tables", "tulip_chairs", "womb_chair", "pedestal_collection"],
    known_mark_types: ["paper_label", "foil_label", "decal", "ink_stamp"],
    common_mark_locations: [
      { physical_location: "base_or_plinth", physical_location_notes: "pedestal base underside" },
      { physical_location: "upholstery_seat", physical_location_notes: "underside of seats" },
    ],
    known_wording: ["Knoll", "Knoll Associates", "Eero Saarinen", "Knoll International"],
    visual_traits: "Tulip tables and chairs (1956-onward pedestal collection), Womb Chair (1948). Knoll labels, decals, underside tags, later labels.",
    mark_text_patterns: ["knoll", "eero saarinen", "saarinen"],
    period_associations: [
      { period_label: "Saarinen-for-Knoll licensed production era", date_floor: 1948,
        usage_notes: "Per seed Date Range: 'Mid-20th century onward.' Saarinen-Knoll collaboration including Womb Chair 1948 and Pedestal collection 1956." },
    ],
    dating_clues: "Label variation dates production phases; pedestal collection 1956-onward distinct from earlier Womb Chair.",
    false_positive_warnings: [
      "Tulip tables and chairs are heavily copied (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Saarinen' is a designer name; 'Tulip-style' is widely-copied form; manufacturer requires Knoll label.",
    ],
    attribution_confidence_rule: "Without label and construction evidence, return 'Saarinen-style tulip form,' not 'Knoll.'",
    related_names: ["Eero Saarinen", "Knoll", "Knoll Associates"],
  },
  {
    id: "maker_mark_bertoia_for_knoll",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 9,
    indicator_text: "Bertoia designs (Harry Bertoia) for Knoll licensed production, 1950s onward New York / Pennsylvania production.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Designer/Modern Licensed Production section. Authored per Block 28b Q2 Option G. Very high hard_negative_authority (9) reflects pervasive wire-chair knockoff industry — Bertoia wire chairs are among the most heavily reproduced designs in 20th-century furniture.",
    maker_name: "Bertoia designs for Knoll",
    region: "New York / Pennsylvania (Knoll production)",
    furniture_categories: ["wire_chairs", "diamond_chair", "side_chair_420", "bird_chair"],
    known_mark_types: ["paper_label", "foil_label", "decal", "ink_stamp"],
    common_mark_locations: [
      { physical_location: "upholstery_seat", physical_location_notes: "cushion labels" },
      { physical_location: "underside", physical_location_notes: "underside labels" },
    ],
    known_wording: ["Knoll", "Knoll Associates", "Harry Bertoia"],
    visual_traits: "Wire chairs including Diamond Chair (model 422), Side Chair (model 420), Bird Chair, Asymmetric Chaise. Knoll labels, cushion labels, underside labels.",
    mark_text_patterns: ["knoll", "harry bertoia", "bertoia"],
    period_associations: [
      { period_label: "Bertoia-for-Knoll licensed production era", date_floor: 1952,
        usage_notes: "Per seed Date Range: '1950s onward.' Bertoia-Knoll collaboration from 1952." },
    ],
    dating_clues: "Label variation; finish (chrome vs powder-coat) dates phases.",
    false_positive_warnings: [
      "Wire chairs are widely reproduced (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Bertoia' is a designer name; 'Diamond Chair' and similar are heavily-copied forms; manufacturer requires Knoll label.",
    ],
    attribution_confidence_rule: "Require label or precise construction match.",
    related_names: ["Harry Bertoia", "Knoll", "Knoll Associates"],
  },
  // ─────────────────────────────────────────────────────────────
  // BATCH 3 — Upholstery and Seating Makers (4 entries)
  // ─────────────────────────────────────────────────────────────
  {
    id: "maker_mark_hickory_chair",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Hickory Chair, 20th-century onward Hickory North Carolina high-end chairs, dining chairs, upholstery, and reproductions.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Upholstery and Seating Makers section.",
    maker_name: "Hickory Chair",
    region: "Hickory, North Carolina",
    furniture_categories: ["high_end_chairs", "dining_chairs", "upholstery", "reproductions"],
    known_mark_types: ["paper_label", "branded_stamp", "ink_stamp"],
    common_mark_locations: [
      { physical_location: "upholstery_seat", physical_location_notes: "seat underside" },
      { physical_location: "upholstery_dust_cover" },
      { physical_location: "underside", physical_location_notes: "frame underside" },
      { physical_location: "frame_rail", physical_location_notes: "chair rails" },
    ],
    known_wording: ["Hickory Chair", "Hickory Chair Company"],
    visual_traits: "High-end chairs, dining chairs, upholstery, and reproductions. Labels, branded marks, upholstery tags on seat underside, dust cover, frame underside.",
    mark_text_patterns: ["hickory chair"],
    period_associations: [
      { period_label: "Hickory Chair production era", date_floor: 1911,
        usage_notes: "Per seed Date Range: '20th century onward.' Founded 1911." },
    ],
    dating_clues: "Label evolution.",
    false_positive_warnings: [
      "High-quality chair frame alone is not enough (per seed False Positive Warning).",
      "See Universal Rule #2 city_not_maker: Hickory NC includes multiple makers (Hickory Chair + Century Furniture).",
    ],
    attribution_confidence_rule: "Require Hickory Chair label or branded mark with upholstery tag confirmation.",
    related_names: [],
  },
  {
    id: "maker_mark_hancock_and_moore",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Hancock & Moore, 20th-century onward North Carolina leather upholstery chairs and sofas.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Upholstery and Seating Makers section.",
    maker_name: "Hancock & Moore",
    region: "North Carolina",
    furniture_categories: ["leather_upholstery", "chairs", "sofas"],
    known_mark_types: ["paper_label", "branded_stamp", "ink_stamp"],
    common_mark_locations: [
      { physical_location: "upholstery_seat", physical_location_notes: "under cushions" },
      { physical_location: "upholstery_dust_cover" },
      { physical_location: "underside", physical_location_notes: "frame underside" },
    ],
    known_wording: ["Hancock & Moore", "Hancock and Moore"],
    visual_traits: "Leather upholstery chairs and sofas; Chesterfield-style and traditional leather seating. Upholstery tags, labels, branded marks.",
    mark_text_patterns: ["hancock & moore", "hancock and moore"],
    period_associations: [
      { period_label: "Hancock & Moore production era", date_floor: 1981,
        usage_notes: "Per seed Date Range: '20th century onward.' Founded 1981." },
    ],
    dating_clues: "Label evolution.",
    false_positive_warnings: [
      "Leather Chesterfield-style furniture is not automatically Hancock & Moore (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Chesterfield' is a style, not a maker.",
    ],
    attribution_confidence_rule: "Require Hancock & Moore upholstery tag, label, or branded mark.",
    related_names: [],
  },
  {
    id: "maker_mark_sikes_chair_co",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 6,
    indicator_text: "Sikes Chair Co., late 19th to 20th century Buffalo New York chairs, office chairs, and institutional seating. Specialty-naming convention (chair-specific firm name) makes attribution easier than generic 'Furniture Co.' names.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Upholstery and Seating Makers section. Per seed: 'Antique Trader notes that specialty factories that include the product type, such as Sikes Chair Co., are easier to recognize as makers than generic Furniture Co. names.' This insight elevates positive_authority to 8 and reduces hard_negative_authority to 6.",
    maker_name: "Sikes Chair Co.",
    region: "Buffalo, New York",
    furniture_categories: ["chairs", "office_chairs", "institutional_seating"],
    known_mark_types: ["paper_label", "branded_stamp", "ink_stamp", "metal_tag"],
    common_mark_locations: [
      { physical_location: "underside", physical_location_notes: "chair seat undersides" },
      { physical_location: "frame_rail" },
    ],
    known_wording: ["Sikes Chair Co.", "Sikes Chair Company", "Buffalo, New York"],
    visual_traits: "Office chairs, institutional seating, and chair-specialty production. Labels and stamps identifying Sikes Chair Co.",
    mark_text_patterns: ["sikes chair"],
    period_associations: [
      { period_label: "Sikes Chair Co. production era", date_floor: 1880, date_ceiling: 1955,
        usage_notes: "Per seed Date Range: 'Late 19th to 20th century.'" },
    ],
    dating_clues: "Label format evolution.",
    false_positive_warnings: [
      "Other Buffalo chair-makers existed; require full Sikes Chair Co. wording.",
    ],
    attribution_confidence_rule: "Require full Sikes Chair Co. wording; specialty-naming convention makes attribution more reliable than generic 'Furniture Co.' names per seed.",
    related_names: [],
  },
  {
    id: "maker_mark_murphy_chair_co",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Murphy Chair Co., late 19th to 20th century Detroit / Owensboro chairs, folding furniture, and institutional seating.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Upholstery and Seating Makers section. Region varies by period per seed.",
    maker_name: "Murphy Chair Co.",
    region: "Detroit, Michigan / Owensboro, Kentucky (varies by period)",
    furniture_categories: ["chairs", "folding_furniture", "institutional_seating"],
    known_mark_types: ["paper_label", "branded_stamp", "ink_stamp", "catalog_plate"],
    common_mark_locations: [
      { physical_location: "underside", physical_location_notes: "chair seat undersides" },
      { physical_location: "frame_rail" },
    ],
    known_wording: ["Murphy Chair Co.", "Murphy Chair Company"],
    visual_traits: "Chairs, folding furniture, and institutional seating. Labels, stamps, patent plates.",
    mark_text_patterns: ["murphy chair"],
    period_associations: [
      { period_label: "Murphy Chair Co. production era", date_floor: 1880, date_ceiling: 1960,
        usage_notes: "Per seed Date Range: 'Late 19th to 20th century.'" },
    ],
    dating_clues: "Patent plate dates; Detroit vs Owensboro period of production.",
    false_positive_warnings: [
      "Folding chair mechanisms need maker-specific patent or label support (per seed False Positive Warning).",
    ],
    attribution_confidence_rule: "Require Murphy Chair Co. label, stamp, or patent plate.",
    related_names: [],
  },
  // ─────────────────────────────────────────────────────────────
  // BATCH 4 — Clock and Specialty Furniture Makers (3 entries)
  // Per Block 28a A-5 D-PA-5 precedent: clock dial mark locations
  // use physical_location: "show_surface" + physical_location_notes:
  // "clock dial face" + functional_role: "specialized_function".
  // ─────────────────────────────────────────────────────────────
  {
    id: "maker_mark_howard_miller",
    category: "maker_mark",
    positive_authority: 8,
    hard_negative_authority: 7,
    indicator_text: "Howard Miller, 20th-century onward Zeeland Michigan clocks, grandfather clocks, wall clocks, and mantel clocks.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Clock and Specialty Furniture Makers section. Per seed False Positive Warning: 'Movement maker and case maker may differ' — captured in notes for clock-specific evidence accumulation discipline. Howard Miller is a sibling firm to Herman Miller (Howard Miller is son of Herman Miller's founder D.J. De Pree's father-in-law); both in Zeeland MI.",
    maker_name: "Howard Miller",
    region: "Zeeland, Michigan",
    furniture_categories: ["clocks", "grandfather_clocks", "wall_clocks", "mantel_clocks"],
    known_mark_types: ["paper_label", "branded_stamp", "metal_tag", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "show_surface", physical_location_notes: "clock dial face", functional_role: "specialized_function" },
      { physical_location: "door_panel", physical_location_notes: "inside case door (interior face)" },
      { physical_location: "case_back" },
      { physical_location: "show_surface", physical_location_notes: "clock movement plate (interior)", functional_role: "specialized_function" },
    ],
    known_wording: ["Howard Miller", "Howard Miller Clock Co.", "Zeeland, Michigan"],
    visual_traits: "Grandfather clocks, wall clocks, mantel clocks. Dial marks, movement labels, case labels, serial/model tags.",
    mark_text_patterns: ["howard miller"],
    period_associations: [
      { period_label: "Howard Miller production era", date_floor: 1926,
        usage_notes: "Per seed Date Range: '20th century onward.' Founded 1926." },
    ],
    dating_clues: "Movement plate marks (movement maker can differ from case maker per seed); serial/model tags date specific production; case style evolution.",
    false_positive_warnings: [
      "Movement maker and case maker may differ (per seed False Positive Warning). A clock signed Howard Miller on the case may have a different-maker movement; conversely, Howard Miller movements may appear in other-maker cases.",
    ],
    attribution_confidence_rule: "Require Howard Miller case label or dial mark; cross-reference movement maker for full attribution.",
    related_names: ["Herman Miller (sibling firm, Zeeland MI, distinct)"],
  },
  {
    id: "maker_mark_ridgeway",
    category: "maker_mark",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Ridgeway, 20th-century Virginia / later corporate ownership grandfather clocks.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Clock and Specialty Furniture Makers section.",
    maker_name: "Ridgeway",
    region: "Virginia / later corporate ownership",
    furniture_categories: ["grandfather_clocks"],
    known_mark_types: ["paper_label", "branded_stamp", "metal_tag", "serial_style_number"],
    common_mark_locations: [
      { physical_location: "show_surface", physical_location_notes: "clock dial face", functional_role: "specialized_function" },
      { physical_location: "case_back" },
      { physical_location: "door_panel", physical_location_notes: "inside case door (interior face)" },
    ],
    known_wording: ["Ridgeway", "Ridgeway Clocks"],
    visual_traits: "Grandfather clocks. Dial marks, case labels, model labels.",
    mark_text_patterns: ["ridgeway"],
    period_associations: [
      { period_label: "Ridgeway production era", date_floor: 1926, date_ceiling: 2018,
        usage_notes: "Per seed Date Range: '20th century.'" },
    ],
    dating_clues: "Model labels; corporate ownership changes affect later production.",
    false_positive_warnings: [
      "Clock dial brand may not identify all components (per seed False Positive Warning). Movement maker may differ from case maker.",
    ],
    attribution_confidence_rule: "Require Ridgeway case label or dial mark with model identification.",
    related_names: [],
  },
  {
    id: "maker_mark_colonial_manufacturing_co",
    category: "maker_mark",
    positive_authority: 6,
    hard_negative_authority: 7,
    indicator_text: "Colonial Manufacturing Co., early to mid-20th century Zeeland Michigan clocks, desks, and furniture.",
    notes: "Per Maker_Mark_Replacement_Seed.docx Clock and Specialty Furniture Makers section. Third Zeeland MI maker (alongside Herman Miller and Howard Miller).",
    maker_name: "Colonial Manufacturing Co.",
    region: "Zeeland, Michigan",
    furniture_categories: ["clocks", "desks", "furniture"],
    known_mark_types: ["paper_label", "branded_stamp"],
    common_mark_locations: [
      { physical_location: "show_surface", physical_location_notes: "clock dial face", functional_role: "specialized_function" },
      { physical_location: "case_back" },
      { physical_location: "drawer_front", physical_location_notes: "interior surface (desks)" },
    ],
    known_wording: ["Colonial", "Colonial Manufacturing Co.", "Zeeland, Michigan"],
    visual_traits: "Clocks, desks, and furniture. Labels and branded marks.",
    mark_text_patterns: ["colonial manufacturing"],
    period_associations: [
      { period_label: "Colonial Manufacturing Co. production era", date_floor: 1906, date_ceiling: 1970,
        usage_notes: "Per seed Date Range: 'Early to mid-20th century.'" },
    ],
    dating_clues: "Label evolution.",
    false_positive_warnings: [
      "'Colonial' as style is not the maker (per seed False Positive Warning).",
      "See Universal Rule #5 line_name_not_maker: 'Colonial' is widely-used style designation.",
      "See Universal Rule #2 city_not_maker: Zeeland MI includes multiple makers (Herman Miller, Howard Miller, Colonial Manufacturing).",
    ],
    attribution_confidence_rule: "Require full 'Colonial Manufacturing Co.' wording in label.",
    related_names: ["Herman Miller (Zeeland MI, distinct)", "Howard Miller (Zeeland MI, distinct)"],
  },
  {
    id: "maker_mark_new_haven_clock_co",
    category: "maker_mark",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    indicator_text: "New Haven Clock Co. paper label, dial print, or movement-plate stamp on an American mantel/shelf clock — major Connecticut clockmaker, 1853-1956, ~35 million clocks produced.",
    notes: "Authored 2026-05-20 during stress-test fix #4 (clock authoring). Surfaced when an Eastlake walnut shelf clock scan correctly extracted 'MADE BY NEW HAVEN CLOCK CO. NEW HAVEN, CONN., U.S.A.' from both interior paper label and dial face, plus 'ECLIPSE' model name from the pendulum cartouche, but had no maker entry to attribute to. Founded 1853 in New Haven, Connecticut as Jerome Mfg. Co.; renamed New Haven Clock Co. 1856; one of the 'Big Six' Connecticut clockmakers alongside Seth Thomas, Ansonia, Waterbury, Welch, Ingraham, Gilbert. Acquired Waterbury Clock Co. interests in 1944; ceased clock manufacturing 1956 as quartz/electric clocks displaced spring-driven production. Documented model lines include Eclipse, Saturn, Athol, Cabinet, Time, plus thousands of un-named line variations. Paper labels are the most common surviving attribution evidence (typically deteriorated foxing); dial-printed text and movement-plate stamps less commonly survive.",
    maker_name: "New Haven Clock Co.",
    region: "New Haven, Connecticut, USA",
    furniture_categories: ["mantel_clock", "shelf_clock", "wall_clock", "kitchen_clock", "parlor_clock"],
    known_mark_types: ["paper_label", "ink_stamp", "impressed_mark"],
    common_mark_locations: [
      { physical_location: "case_back", physical_location_notes: "paper label on the inside back of the case; commonly partially deteriorated with foxing/browning but maker name typically legible" },
      { physical_location: "show_surface", physical_location_notes: "printed text at the lower arc of the paper dial face: 'MADE BY NEW HAVEN CLOCK CO. NEW HAVEN, CONN., U.S.A.' or similar wording" },
      { physical_location: "case_interior_framing", physical_location_notes: "stamped or etched maker mark on the brass movement plate visible through the rear access opening" },
    ],
    known_wording: [
      "New Haven Clock Co.",
      "The New Haven Clock Co.",
      "MADE BY NEW HAVEN CLOCK CO.",
      "MADE BY NEW HAVEN CLOCK CO. NEW HAVEN, CONN., U.S.A.",
      "NEW HAVEN, CONN., U.S.A.",
      "New Haven Conn",
      "New Haven Clock Company",
    ],
    visual_traits: "Paper labels typically rectangular with bordered text and centered maker name; pre-1900 labels often more elaborate with line ornament, after 1900 simpler text-only layouts. Dial-printed text usually black ink on cream/white paper dial, positioned at the lower arc beneath the center post. Movement-plate stamps either struck-impression (older) or acid-etched/printed (later) on the brass front plate of the movement.",
    mark_text_patterns: [
      "new haven clock",
      "made by new haven clock",
      "the new haven clock",
      "new haven clock co",
      "new haven, conn",
      "n.h. clock co",
    ],
    period_associations: [
      {
        period_label: "Active production era",
        date_floor: 1853,
        date_ceiling: 1956,
        usage_notes: "Founded 1853 as Jerome Mfg. Co., renamed New Haven Clock Co. 1856. Mantel/shelf clock production peaked c. 1875-1920. Ceased manufacturing 1956.",
      },
    ],
    dating_clues: "Paper-label format varies by era — pre-1900 labels often more elaborate with line ornament and bordered text; post-1900 labels simpler text-only. Model line names (Eclipse, Saturn, Athol, Cabinet, etc.) on the pendulum bob, dial, or label can narrow dating to within 5-10 years when cross-referenced against New Haven Clock Co. catalogs (multiple catalog reprints in print and online collector references). Case style narrows dating further: gingerbread c. 1875-1900, Eastlake c. 1875-1895, steeple c. 1845-1875 (Jerome era, pre-rename to NHCC c. 1856), round-top c. 1870-1910, tambour c. 1900-1940. Movement design (count-wheel vs rack-and-snail strike) helps date: count-wheel pre-1870, rack-and-snail post-1870.",
    false_positive_warnings: [
      "Generic 'New Haven' reference (city name alone) does NOT identify NHCC — New Haven, Connecticut housed multiple clock-related firms historically. Require the full firm name or a recognized NHCC label/dial format.",
      "Initials 'N.H.' or 'NH' alone are insufficient — could reference geographic origin (New Haven, New Hampshire, etc.) rather than the manufacturer. Apply Universal Rule #2 (Initials Are Not Enough).",
      "Confused with New Haven Carriage Co., New Haven Manufacturing Co., or other 'New Haven'-prefixed firms — these are distinct companies in different categories. NHCC produced clocks; confirm the object is a clock and the label refers specifically to Clock Co.",
    ],
    attribution_confidence_rule: "High confidence requires (a) full 'New Haven Clock Co.' wording in label, dial print, OR movement-plate stamp, AND (b) object is a clock (mantel, shelf, wall, or kitchen — NHCC also produced wall clocks and a few tall case clocks but their volume was shelf/mantel clocks), AND (c) construction and case style consistent with documented NHCC production era (pre-1956). When label is deteriorated and only partial text is legible ('NEW HAVEN' alone or 'CLOCK CO.' alone), surface at MEDIUM confidence with explicit caveat. Model-line text (Eclipse, Saturn, etc.) on the pendulum bob or dial counts as supporting evidence when paired with confirmed NHCC label.",
    related_names: [
      "Jerome Mfg. Co.",
      "Chauncey Jerome",
      "New Haven Watch Co.",
      "Waterbury Clock Co.",
    ],
    anti_classification_guidance: {
      boundary_date: 1853,
      boundary_type: "form_emergence",
      guidance_text: "New Haven Clock Co. cannot predate 1853 (Jerome Mfg. Co. founding date) under that name; pre-1856 production may carry 'Jerome' or 'Chauncey Jerome' attribution. Attribution of NHCC label on a piece otherwise constructed pre-1853 indicates a later marriage or replacement label.",
      prominence: "standard",
    },
  },
];

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
// Block 23 orphan cleanup: removed thonet_mark and wallace_nutting_label
// per Mike's "drop the 4 orphans entirely" decision. Legacy shim entries
// had no parallel in the new docx-aligned MAKER_ENTRIES schema and the
// legacy content was too sparse to mechanically migrate without authoring
// fresh content from general knowledge.
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
// Block 23 orphan cleanup: removed karges_furniture_label
// per Mike's drop-the-orphans decision.
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
// Block 23 orphan cleanup: removed toledo_metal_furniture_label
// per Mike's drop-the-orphans decision.
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
  // Block 23 cleanup: removed globe_wernicke_gw_office_equip_service_label
  // per Mike's per-variant decision. The variant's bare "GW" / "G W" patterns
  // actively conflicted with the new schema's rule #8 ("'GW' alone must NEVER
  // identify Globe-Wernicke"). Globe-Wernicke variants 1 + 2 (early paper
  // label + later stamped mark) are preserved both in the legacy shim above
  // and enriched into the new-schema maker_mark_globe_wernicke_co entry.
];
