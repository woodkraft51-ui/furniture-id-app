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
    known_mark_types: ["paper_label", "metal_tag", "decal", "catalog_plate"],
    common_mark_locations: [
      { physical_location: "case_back", physical_location_notes: "inside bookcase backs (interior surface)" },
      { physical_location: "underside", physical_location_notes: "underside or rear of sections" },
      { physical_location: "drawer_front", physical_location_notes: "interior of drawer/filing units" },
      { physical_location: "backboard", physical_location_notes: "back panels" },
    ],
    known_wording: ["The Globe-Wernicke Co.", "Globe-Wernicke", "Globe Wernicke", "Cincinnati"],
    visual_traits: "Stacking sectional bookcases and barrister bookcases with distinctive door-mechanism hardware; office furniture; filing systems. Full labels and metal tags on interior surfaces; sectional unit labels.",
    mark_text_patterns: ["globe-wernicke", "globe wernicke", "the globe-wernicke co"],
    period_associations: [
      { period_label: "Globe-Wernicke sectional bookcase peak", date_floor: 1890, date_ceiling: 1930,
        usage_notes: "Per seed: 'sectional bookcases and office furniture most associated with c. 1890s to 1930s.'" },
      { period_label: "Globe-Wernicke continuing production", date_floor: 1930, date_ceiling: 1955,
        usage_notes: "Per seed Date Range: 'Late 19th to mid-20th century.'" },
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
