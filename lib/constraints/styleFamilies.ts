// styleFamilies.ts
//
// Style families library. Phase 2 Session 9 first library and
// EIGHTH canonical evidence library (after wood, maker,
// joinery, fastener, hardware, upholstery covers, upholstery
// construction). Block 41 ships schema foundation + 26
// STYLE_FAMILIES + 6 STYLE_REASONING_RULES + empty STYLE_
// REVIVAL_WAVES scaffold; Block 42 authors ~108 STYLE_REVIVAL
// _WAVES from Styles_and_Waves.docx per-style revival-wave
// content and closes Phase 2 Session 9.
//
// Architecture per Block 41 D-SW41-1 through D-SW41-13:
// - EIGHTH canonical evidence library (D-SW41-3). Distinguished
//   by interpretive-uncertainty discipline + low-weight
//   authority architecture per Mike's appraiser-honest framing
//   of style identification as qualitatively different from
//   AG-floor + canonical-source artifact-level evidence.
// - NEW assessment_layer "style_and_waves" (D-SW41-4). Library-
//   level constant STYLE_FAMILIES_ASSESSMENT_LAYER. Single
//   integrated output per Q4=G; NO evidence_sub_layer field.
//   Third distinct assessment_layer after "frame" + "upholstery".
// - EIGHTH canonical-library encoding of the Independent Layer
//   Evaluation Standard via Rule #6 style_evidence_layer
//   _independence (cross_layer_scope: true) — COMPLETES ILE
//   encoding across all 8 Phase 2 evidence libraries (D-SW41-5).
// - NEW interpretive-uncertainty-authority convention (D-SW41-6):
//   STYLE_FAMILIES 4/4 uniform + STYLE_REVIVAL_WAVES 3/3 uniform
//   (Block 42). Authority values encode the layer's
//   epistemological status directly; visibly lower than the
//   prior 7 evidence libraries (which run 7/7-9/9). Forward-
//   applicable convention.
// - 5 interfaces per Q1=A (D-SW41-7): StyleFamilyEntry +
//   StyleRevivalWaveEntry + StyleReasoningRule + DesignSubtlety
//   (library-local) + StyleFamilyMakerAssociation (library-
//   local).
// - DesignSubtlety lives on StyleRevivalWaveEntry ONLY, NOT on
//   StyleFamilyEntry (Mike B-3/B-4 resolution). Family-level
//   visual character lives in StyleFamilyEntry.core_visual
//   _identity as canonical verbatim prose. DesignSubtlety.aspect
//   enum LOCKED per CC A-6 canonical-derived 9-token typology
//   (D-SW41-8 + D-HW36-14 canonical-enumeration-supersedes-
//   informal-preview discipline).
// - maker_associations SCHEMA-PRESENT-CONTENT-DEFERRED per
//   D-HW35-6 (D-SW41-9; FIFTH application). StyleFamilyEntry
//   carries the optional field; all 26 entries leave it [].
// - Single-directional cross-library FK per Q6=L + D-FA33-8
//   (D-SW41-10): NO reverse-references on StyleFamilyEntry.
//   styleFamilies.ts is the CANONICAL TARGET for the
//   style_associations populations in the hardware + upholstery
//   covers libraries; engine-layer Phase 3 resolves via name-
//   matching to StyleFamilyEntry.name + canonical_source_aliases.
// - canonical_source_aliases field convention (D-SW41-11):
//   style families with slash-separated canonical names carry
//   the alternate names as an aliases array. 15 of 26 families
//   carry aliases per CC A-4 canonical inspection (corrects the
//   plan-retransmit preliminary 13-count per D-HW36-14 — THIRD
//   application of D-HW36-14 this block).
// - 6 reasoning rules per Q3=E (D-SW41-12): 5 canonical Cross-
//   Wave Identification principles + 1 ILE encoding rule. Five
//   NEW reasoning-rule TYPES established (D-SW41-13). All at
//   9/9 per meta-rule supremacy.
// - engine.ts UNCHANGED per D-MM27-9 Phase 2 / Phase 3
//   separation.
//
// NOTE: AntiClassificationGuidance is intentionally NOT
// imported — no Block 41 interface uses it (style families are
// reference taxonomy, not artifact-level evidence with crisp
// AG date boundaries). This is the minor surfacing pre-
// authorized in the approved plan.

import type {
  CanonicalEntry,
  PeriodAssociation,
  ReasoningRuleMigrationTarget,
} from "./entryShape";

/**
 * Library-level assessment routing per Q4=G + locked
 * architectural baseline. EIGHTH canonical evidence library;
 * opens the "style_and_waves" assessment layer — the third
 * distinct assessment_layer after "frame" and "upholstery".
 *
 * Single integrated output per Q4=G: style identification +
 * design-subtleties date estimate produce a single integrated
 * output via revival-wave date range. NO evidence_sub_layer
 * constant (contrast: upholstery covers + upholstery
 * construction libraries declare evidence_sub_layer "cover" /
 * "system" for sub-output surfacing per D-UC37-3; the style
 * library has no sub-output split).
 */
export const STYLE_FAMILIES_ASSESSMENT_LAYER = "style_and_waves" as const;

/**
 * StyleFamilyEntry — top-level original-period style family per
 * Block 41 D-SW41-7. 26 entries per Styles_and_Waves.docx
 * canonical enumeration (paragraphs 1-211).
 *
 * Field roster:
 * - category: literal "style_family"
 * - name: primary canonical style name verbatim (full slash-
 *   separated phrasing where the canonical source uses it)
 * - family_description: concise defensible-default summary
 *   (the canonical source has no discrete description field;
 *   filled per the defensible-defaults DESCRIPTION discipline,
 *   marked in notes)
 * - core_visual_identity: canonical "Core visual identity"
 *   prose VERBATIM
 * - period_associations: PeriodAssociation[] — single-entry for
 *   most families; multi-entry where the canonical source gives
 *   a distinct datable "overlap into / survivals into /
 *   continues later" secondary window (10 of 26 per A-5)
 * - original_emergence_summary: canonical "Original emergence"
 *   sentence verbatim
 * - original_conclusion_summary: canonical "Original
 *   conclusion / Conclusion" sentence verbatim
 * - assessment_layer: literal "style_and_waves" per D-SW41-4
 * - canonical_source_aliases?: alternate names split from
 *   slash-separated canonical phrasing (15 of 26 per D-SW41-11)
 * - maker_associations?: StyleFamilyMakerAssociation[] —
 *   SCHEMA-PRESENT-CONTENT-DEFERRED per D-SW41-9; all 26
 *   entries leave this []
 *
 * NO design_subtleties field (Mike B-3/B-4 resolution —
 * DesignSubtlety lives on StyleRevivalWaveEntry only). NO
 * evidence_sub_layer. NO reverse-FK fields (single-directional
 * cross-library FK per D-SW41-10).
 */
export interface StyleFamilyEntry extends CanonicalEntry {
  category: "style_family";
  name: string;
  family_description: string;
  core_visual_identity: string;
  period_associations: PeriodAssociation[];
  original_emergence_summary: string;
  original_conclusion_summary: string;
  assessment_layer: "style_and_waves";
  canonical_source_aliases?: string[];
  maker_associations?: StyleFamilyMakerAssociation[];
}

/**
 * StyleRevivalWaveEntry — per-style revival wave per Block 41
 * D-SW41-7. Schema defined this block; STYLE_REVIVAL_WAVES
 * array is an empty scaffold until Block 42 authors ~108 wave
 * entries from the canonical "Revival waves" subsections.
 *
 * Field roster:
 * - category: literal "style_revival_wave"
 * - name: canonical wave name verbatim
 * - parent_style_id: FK to StyleFamilyEntry.id
 * - wave_number: canonical "Wave N" ordinal
 * - date_floor / date_ceiling: canonical wave "Dates: c. X-Y"
 * - traits_summary: canonical "Traits:" prose verbatim
 * - contrast_summary: canonical "Contrast from..." prose
 *   verbatim
 * - design_subtleties: DesignSubtlety[] — populated at Block 42
 *   by decomposing the per-wave Traits + Contrast prose into
 *   aspect-tagged subtleties
 * - assessment_layer: literal "style_and_waves" per D-SW41-4
 */
export interface StyleRevivalWaveEntry extends CanonicalEntry {
  category: "style_revival_wave";
  name: string;
  parent_style_id: string;
  wave_number: number;
  date_floor: number;
  date_ceiling: number;
  traits_summary: string;
  contrast_summary: string;
  design_subtleties: DesignSubtlety[];
  assessment_layer: "style_and_waves";
}

/**
 * StyleReasoningRule — meta-rule entries per Block 41 D-SW41-12.
 * 6 entries: 5 canonical Cross-Wave Identification principles
 * (Styles_and_Waves.docx paragraphs 213-231) + 1 Independent
 * Layer Evaluation Standard encoding rule. Five NEW canonical
 * reasoning-rule TYPES established this block (D-SW41-13);
 * 12 total reasoning-rule TYPES in the canonical record after
 * Block 41.
 *
 * Authority 9/9 per meta-rule supremacy precedent (D-WE26-8 /
 * D-MM27-5); migration_status "complete" per D-WE26-11
 * convention; migration_target "engine_reasoning".
 *
 * cross_layer_scope: true on exactly 1 rule — Rule #6
 * style_evidence_layer_independence — the EIGHTH canonical-
 * library encoding of the Independent Layer Evaluation Standard
 * (D-SW41-5), completing the ILE encoding across all 8 Phase 2
 * evidence libraries.
 */
export interface StyleReasoningRule extends CanonicalEntry {
  category: "style_reasoning_rule";
  rule_name: string;
  rule_statement: string;
  rationale: string;
  migration_target: ReasoningRuleMigrationTarget;
  applies_to_entry_types?: string[];
  cross_layer_scope?: boolean;
}

/**
 * DesignSubtlety — library-local interface per Block 41
 * D-SW41-7. Captures one aspect-tagged design observation used
 * to distinguish original-period instances of a style from its
 * revival-wave instances. Populated on StyleRevivalWaveEntry
 * entries at Block 42; defined (not populated) this block.
 *
 * aspect enum LOCKED per CC A-6 canonical-derived 9-token
 * typology (D-SW41-8 + D-HW36-14): the 9 recurring decomposition
 * dimensions of the canonical per-wave "Traits" + "Contrast
 * from..." prose. The preliminary claude.ai-side 9-token draft
 * (scale / ornateness / style_influence / finish / material /
 * proportion / carving / joinery_hint / regional_marker) was
 * superseded by canonical-source inspection per D-HW36-14.
 *
 * weight: all design subtleties are "low" per Mike's appraiser-
 * practice — the style/waves layer is a LOW-WEIGHTED evidence
 * layer joining the reconciliation pool, consistent with the
 * interpretive-uncertainty-authority convention (D-SW41-6).
 */
export interface DesignSubtlety {
  aspect:
    | "massing_and_proportion"
    | "line_and_silhouette"
    | "carving_character"
    | "leg_and_foot_vocabulary"
    | "ornament_and_motif"
    | "surface_and_finish"
    | "material_palette"
    | "construction_expression"
    | "hardware_character";
  signal: string;
  weight: "low";
}

/**
 * StyleFamilyMakerAssociation — library-local associative
 * interface per Block 41 D-SW41-9. NOT promoted to entryShape
 * .ts; the schema-occurrence rule does not fire for style-
 * family-only structure.
 *
 * Per D-SW41-9 SCHEMA-PRESENT-CONTENT-DEFERRED discipline
 * (D-HW35-6 FIFTH application): all 26 StyleFamilyEntry entries
 * leave maker_associations []. The canonical source has ZERO
 * style-family maker documentation; per-family content deferred
 * to validation-phase one-offs + post-launch authoring with NO
 * scheduled Block-N authoring plan.
 */
export interface StyleFamilyMakerAssociation {
  maker_name: string;
  date_floor?: number;
  date_ceiling?: number;
  attribution_notes?: string;
}

/**
 * STYLE_FAMILIES — 26 original-period style families per Block
 * 41 D-SW41-1. All entries at 4/4 authority (D-SW41-6
 * interpretive-uncertainty-authority convention — uniform, no
 * style-by-style variance even for canonically-richer families
 * like Federal or Chippendale; authority encodes the layer's
 * epistemological status, not intra-layer canonical richness).
 * All entries assessment_layer "style_and_waves"; all
 * maker_associations [] per D-SW41-9.
 *
 * 15 of 26 carry canonical_source_aliases per D-SW41-11 (slash-
 * separated canonical names); 11 single-canonical-name families
 * omit the field.
 */
export const STYLE_FAMILIES: StyleFamilyEntry[] = [
  {
    id: "style_family_early_colonial",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Heavy, rectilinear, joined 17th-century construction — board and joined chests, trestle tables, wainscot and turned chairs, thick members, geometric chip carving; c.1620-1700 with rural survival later.",
    notes: "Per Styles_and_Waves.docx style #1. 4/4 per D-SW41-6 interpretive-uncertainty-authority convention. canonical_source_aliases per D-SW41-11 (slash-separated canonical name). period_associations multi-entry per A-5 ('with rural survival later'). family_description is defensible-default fill per the DESCRIPTION discipline (canonical source has no discrete description field). maker_associations: [] per D-SW41-9 schema-present-content-deferred.",
    name: "Early Colonial / Pilgrim / Seventeenth-Century American",
    family_description: "The earliest American furniture style — heavy joined oak construction of the 17th century, low in visual refinement and built for utility.",
    core_visual_identity: "Heavy, rectilinear, joined construction; board chests, joined chests, trestle tables, wainscot chairs, turned chairs, simple cupboards; thick members; low visual refinement compared with later urban cabinetmaking; carving is usually geometric, chip-carved, lunette, split-spindle, or applied rather than fluid.",
    period_associations: [
      { period_label: "Original Pilgrim / Seventeenth-Century period", date_floor: 1620, date_ceiling: 1700 },
      { period_label: "Rural survival later", date_floor: 1700, date_ceiling: 1750 },
    ],
    original_emergence_summary: "Original emergence: c. 1620",
    original_conclusion_summary: "Original conclusion: c. 1700, with rural survival later",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["Pilgrim", "Seventeenth-Century American", "Early Colonial"],
    maker_associations: [],
  },
  {
    id: "style_family_jacobean",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "English Renaissance-derived massing — heavy turnings, carved panels, joined frames, applied split turnings, dark finishes, boxy proportions; c.1650-1720 with rural survivals.",
    notes: "Per Styles_and_Waves.docx style #2. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 — ADDED at Block 41 per CC A-4 canonical inspection (the plan-retransmit preliminary alias list omitted this slash-separated family; corrected per D-HW36-14). period_associations multi-entry per A-5 ('with rural survivals'). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Jacobean / Carolean-Derived Colonial",
    family_description: "English Renaissance-derived colonial furniture — heavy, dark, boxy joined work carried into the American colonies through the late 17th and early 18th centuries.",
    core_visual_identity: "English Renaissance-derived massing; heavy turnings, carved panels, rectangular forms, joined frames, applied split turnings, dark finishes, boxy proportions.",
    period_associations: [
      { period_label: "Original Jacobean Colonial period", date_floor: 1650, date_ceiling: 1720 },
      { period_label: "Rural survivals", date_floor: 1720, date_ceiling: 1770 },
    ],
    original_emergence_summary: "Original emergence in America: c. 1650",
    original_conclusion_summary: "Original conclusion: c. 1720, with rural survivals",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["Carolean-Derived Colonial", "Jacobean"],
    maker_associations: [],
  },
  {
    id: "style_family_william_and_mary",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Tall, vertical, baroque-influenced forms — trumpet turnings, ball/Spanish/bun feet, stretchers, highboys, dressing tables, veneered and japanned surfaces; c.1680-1725.",
    notes: "Per Styles_and_Waves.docx style #3. 4/4 per D-SW41-6. Single canonical name — no canonical_source_aliases. family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "William and Mary",
    family_description: "The first baroque-influenced American style — taller and lighter than Jacobean work, with trumpet turnings, veneered surfaces, and japanning.",
    core_visual_identity: "Tall, vertical, baroque-influenced forms; trumpet turnings, ball feet, Spanish feet, bun feet, stretchers, highboys, dressing tables, veneered surfaces, japanning, cresting, and a lighter, taller profile than earlier Jacobean work. The Met notes that William and Mary fell out of fashion in America by the 1720s, after which Queen Anne and Chippendale massing became dominant.",
    period_associations: [
      { period_label: "Original William and Mary period", date_floor: 1680, date_ceiling: 1725 },
    ],
    original_emergence_summary: "Original emergence in America: c. 1680",
    original_conclusion_summary: "Original conclusion: c. 1725",
    assessment_layer: "style_and_waves",
    maker_associations: [],
  },
  {
    id: "style_family_queen_anne",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Cabriole legs, pad and slipper feet, shell carving, curved crest rails, cyma curves, restrained elegance; c.1720-1760 with overlap into the 1770s.",
    notes: "Per Styles_and_Waves.docx style #4. 4/4 per D-SW41-6. Single canonical name — no canonical_source_aliases. period_associations multi-entry per A-5 ('with overlap into the 1770s'). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Queen Anne",
    family_description: "The graceful early-Georgian American style — cabriole legs and cyma curves bringing controlled, restrained elegance after William and Mary.",
    core_visual_identity: "Cabriole legs, pad feet, slipper feet, shell carving, curved crest rails, cyma curves, restrained elegance, lighter visual movement than William and Mary. Christie’s gives the American Queen Anne period broadly around 1730–1760.",
    period_associations: [
      { period_label: "Original Queen Anne period", date_floor: 1720, date_ceiling: 1760 },
      { period_label: "Overlap into the 1770s", date_floor: 1760, date_ceiling: 1780 },
    ],
    original_emergence_summary: "Original emergence in America: c. 1720",
    original_conclusion_summary: "Original conclusion: c. 1760, with overlap into the 1770s",
    assessment_layer: "style_and_waves",
    maker_associations: [],
  },
  {
    id: "style_family_chippendale",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "More robust and ornate than Queen Anne — ball-and-claw feet, carved knees, pierced splats, Chinese fretwork, Gothic tracery, serpentine fronts, broken pediments, bold carving; c.1750-1785.",
    notes: "Per Styles_and_Waves.docx style #5. 4/4 per D-SW41-6. Single canonical name — no canonical_source_aliases. family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Chippendale",
    family_description: "The bold, ornate high-style of the mid-to-late 18th century — robust carving, ball-and-claw feet, and pattern-book ornament in mahogany.",
    core_visual_identity: "More robust and ornate than Queen Anne; ball-and-claw feet, carved knees, pierced splats, Chinese fretwork, Gothic tracery, serpentine fronts, broken pediments, bold carving, mahogany in high-style urban examples.",
    period_associations: [
      { period_label: "Original Chippendale period", date_floor: 1750, date_ceiling: 1785 },
    ],
    original_emergence_summary: "Original emergence in America: c. 1750",
    original_conclusion_summary: "Original conclusion: c. 1785",
    assessment_layer: "style_and_waves",
    maker_associations: [],
  },
  {
    id: "style_family_pennsylvania_german",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Painted chests, blanket boxes, schranks, dower chests, turned chairs — tulips, hearts, birds, compass stars, bright paint, regional Germanic motifs, sturdy rural construction; c.1720-1830 with later folk survivals.",
    notes: "Per Styles_and_Waves.docx style #6. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 (slash-separated canonical name). period_associations multi-entry per A-5 ('with later folk survivals'). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Pennsylvania German / Pennsylvania Dutch / American Folk Baroque",
    family_description: "Regional Germanic folk furniture — brightly painted chests and case pieces decorated with tulips, hearts, birds, and compass stars on sturdy rural construction.",
    core_visual_identity: "Painted chests, blanket boxes, schranks, turned chairs, dower chests, tulips, hearts, birds, compass stars, bright paint, regional Germanic motifs, sturdy rural construction.",
    period_associations: [
      { period_label: "Original Pennsylvania German period", date_floor: 1720, date_ceiling: 1830 },
      { period_label: "Later folk survivals", date_floor: 1830, date_ceiling: 1900 },
    ],
    original_emergence_summary: "Original emergence: c. 1720",
    original_conclusion_summary: "Original conclusion: c. 1830, with later folk survivals",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["Pennsylvania Dutch", "American Folk Baroque", "Pennsylvania German"],
    maker_associations: [],
  },
  {
    id: "style_family_federal",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Light, refined neoclassicism — tapered legs, inlay, bellflowers, stringing, ovals, urns, swags, satinwood, figured veneers, tambour doors, bow and serpentine fronts; c.1780-1825 with overlap into the 1830s.",
    notes: "Per Styles_and_Waves.docx style #7. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 (slash-separated canonical name). period_associations multi-entry per A-5 ('with overlap into the 1830s'). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Federal / Adam / Hepplewhite / Sheraton",
    family_description: "The light, refined neoclassical style of the early republic — drawn from British design books, with tapered legs, inlay, and figured veneers.",
    core_visual_identity: "Light, refined neoclassicism; tapered legs, inlay, bellflowers, stringing, ovals, urns, swags, satinwood, figured veneers, tambour doors, bow fronts, serpentine fronts. Federal furniture drew from British design books by Hepplewhite, Sheraton, and related neoclassical sources.",
    period_associations: [
      { period_label: "Original Federal period", date_floor: 1780, date_ceiling: 1825 },
      { period_label: "Overlap into the 1830s", date_floor: 1825, date_ceiling: 1840 },
    ],
    original_emergence_summary: "Original emergence: c. 1780",
    original_conclusion_summary: "Original conclusion: c. 1825, with overlap into the 1830s",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["Adam", "Hepplewhite", "Sheraton", "Federal"],
    maker_associations: [],
  },
  {
    id: "style_family_american_classical",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Heavy classical massing — columns, scrolls, paw feet, lyres, acanthus, saber legs, marble tops, thick veneers, mahogany, bold architectural presence; c.1810-1845 with survivals into c.1850.",
    notes: "Per Styles_and_Waves.docx style #8. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 (slash-separated canonical name). period_associations multi-entry per A-5 ('with survivals into c. 1850'). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "American Classical / American Empire / Greco-Roman",
    family_description: "The bold late-neoclassical style — heavy classical massing with columns, paw feet, lyres, and acanthus carving in dark mahogany.",
    core_visual_identity: "Heavy classical massing, columns, scrolls, paw feet, lyres, acanthus, saber legs, marble tops, thick veneers, mahogany, bold architectural presence.",
    period_associations: [
      { period_label: "Original American Classical period", date_floor: 1810, date_ceiling: 1845 },
      { period_label: "Survivals into c. 1850", date_floor: 1845, date_ceiling: 1850 },
    ],
    original_emergence_summary: "Original emergence: c. 1810",
    original_conclusion_summary: "Original conclusion: c. 1845, with survivals into c. 1850",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["American Empire", "Greco-Roman", "American Classical"],
    maker_associations: [],
  },
  {
    id: "style_family_shaker",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Plain utility — clean lines, minimal ornament, ladderback chairs, tape seats, peg rails, built-ins, oval boxes, honest joinery, balanced proportions; c.1820-1860 with community production later.",
    notes: "Per Styles_and_Waves.docx style #9. 4/4 per D-SW41-6. Single canonical name — no canonical_source_aliases. period_associations multi-entry per A-5 ('with community production later'). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Shaker",
    family_description: "The plain, utilitarian furniture of the Shaker communities — clean lines, honest joinery, and minimal ornament expressing religious communal values.",
    core_visual_identity: "Plain utility, clean lines, minimal ornament, ladderback chairs, tape seats, peg rails, built-ins, drawers, oval boxes, honest joinery, balanced proportions.",
    period_associations: [
      { period_label: "Original Shaker major production", date_floor: 1820, date_ceiling: 1860 },
      { period_label: "Continued community production", date_floor: 1860, date_ceiling: 1930 },
    ],
    original_emergence_summary: "Original emergence: c. 1820",
    original_conclusion_summary: "Original conclusion as major production: c. 1860, with community production later",
    assessment_layer: "style_and_waves",
    maker_associations: [],
  },
  {
    id: "style_family_gothic_revival",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Pointed arches, tracery, crockets, quatrefoils, trefoil cutouts, cathedral chair backs, dark woods, verticality, church-like ornament; c.1840-1870 with institutional survivals.",
    notes: "Per Styles_and_Waves.docx style #10. 4/4 per D-SW41-6. Single canonical name — no canonical_source_aliases. period_associations multi-entry per A-5 ('with institutional survivals'). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Gothic Revival",
    family_description: "The romantic-medievalist Victorian style — pointed arches, tracery, and church-like ornament brought to domestic furniture.",
    core_visual_identity: "Pointed arches, tracery, crockets, quatrefoils, trefoil cutouts, cathedral chair backs, dark woods, verticality, church-like ornament. Victorian style histories commonly place Gothic Revival among the early-to-mid Victorian revival styles.",
    period_associations: [
      { period_label: "Original Gothic Revival period", date_floor: 1840, date_ceiling: 1870 },
      { period_label: "Institutional survivals", date_floor: 1870, date_ceiling: 1930 },
    ],
    original_emergence_summary: "Original emergence in American furniture: c. 1840",
    original_conclusion_summary: "Original conclusion: c. 1870, with institutional survivals",
    assessment_layer: "style_and_waves",
    maker_associations: [],
  },
  {
    id: "style_family_rococo_revival",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Serpentine curves, flowing cabriole-like legs, carved roses/grapes/fruit/leaves, pierced cresting, balloon-back chairs, parlor suites, laminated rosewood; c.1845-1870 with naturalistic carving continuing later.",
    notes: "Per Styles_and_Waves.docx style #11. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 — ADDED at Block 41 per CC A-4 canonical inspection (the plan-retransmit preliminary alias list omitted this slash-separated family; corrected per D-HW36-14). period_associations multi-entry per A-5 (SAPFM broader naturalist style c.1850-1914). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Rococo Revival / Naturalistic Victorian",
    family_description: "The flowing, naturalistic high-Victorian parlor style — serpentine curves and deeply carved fruit and floral ornament, often in laminated rosewood.",
    core_visual_identity: "Serpentine curves, cabriole-like flowing legs, carved roses, grapes, fruit, leaves, pierced cresting, balloon-back chairs, parlor suites, laminated rosewood in high-style examples. SAPFM notes a broader naturalist style extending c. 1850–1914, beyond the narrower Rococo Revival window.",
    period_associations: [
      { period_label: "High Rococo Revival", date_floor: 1845, date_ceiling: 1870 },
      { period_label: "Broader naturalist style continues", date_floor: 1870, date_ceiling: 1914 },
    ],
    original_emergence_summary: "Original emergence in America: c. 1845",
    original_conclusion_summary: "Original conclusion: c. 1870 for high Rococo Revival; naturalistic carving continues later",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["Naturalistic Victorian", "Rococo Revival"],
    maker_associations: [],
  },
  {
    id: "style_family_renaissance_revival",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Architectural mass — columns, pediments, medallions, incised ornament, burled panels, marble tops, large sideboards, beds, bookcases, hall pieces; c.1860-1885.",
    notes: "Per Styles_and_Waves.docx style #12. 4/4 per D-SW41-6. Single canonical name — no canonical_source_aliases. family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Renaissance Revival",
    family_description: "The monumental, architectonic high-Victorian style — columns, pediments, medallions, and burled panels on large case pieces.",
    core_visual_identity: "Architectural mass, columns, pediments, medallions, incised ornament, burled panels, marble tops, large sideboards, beds, bookcases, and hall pieces.",
    period_associations: [
      { period_label: "Original Renaissance Revival period", date_floor: 1860, date_ceiling: 1885 },
    ],
    original_emergence_summary: "Original emergence in America: c. 1860",
    original_conclusion_summary: "Original conclusion: c. 1885",
    assessment_layer: "style_and_waves",
    maker_associations: [],
  },
  {
    id: "style_family_eastlake",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Rectilinear forms, incised lines, shallow carving, geometric ornament, turned spindles, brackets, chamfers, visible construction logic; c.1870-1890.",
    notes: "Per Styles_and_Waves.docx style #13. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 (slash-separated canonical name). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Eastlake / Modern Gothic",
    family_description: "The rectilinear reform style of the late 19th century — incised lines, shallow geometric carving, and honest, visible construction logic.",
    core_visual_identity: "Rectilinear forms, incised lines, shallow carving, geometric ornament, turned spindles, brackets, chamfers, visible construction logic, lower relief than Rococo or Renaissance Revival.",
    period_associations: [
      { period_label: "Original Eastlake period", date_floor: 1870, date_ceiling: 1890 },
    ],
    original_emergence_summary: "Original emergence: c. 1870",
    original_conclusion_summary: "Original conclusion: c. 1890",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["Modern Gothic", "Eastlake"],
    maker_associations: [],
  },
  {
    id: "style_family_aesthetic_movement",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Ebonized surfaces, asymmetry, incised gold lines, bamboo-like turnings, shelves, Japanese fans/cranes/sunflowers, geometric panels, mixed media, art furniture; c.1870-1895.",
    notes: "Per Styles_and_Waves.docx style #14. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 (slash-separated canonical name). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Aesthetic Movement / Japanesque",
    family_description: "The art-furniture style of the 1870s-1890s — ebonized surfaces, asymmetry, incised gold lines, and exoticized Japanese motifs.",
    core_visual_identity: "Ebonized surfaces, asymmetry, incised gold lines, bamboo-like turnings, shelves, Japanese fans, cranes, sunflowers, geometric panels, mixed media, art furniture.",
    period_associations: [
      { period_label: "Original Aesthetic Movement period", date_floor: 1870, date_ceiling: 1895 },
    ],
    original_emergence_summary: "Original emergence in America: c. 1870",
    original_conclusion_summary: "Original conclusion: c. 1895",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["Japanesque", "Aesthetic Movement"],
    maker_associations: [],
  },
  {
    id: "style_family_arts_and_crafts",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Straight lines, exposed joinery, through-tenons, corbels, slats, honest construction, oak, fumed finish, leather, simple hardware, sturdy horizontal mass; c.1895-1930.",
    notes: "Per Styles_and_Waves.docx style #15. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 (slash-separated canonical name). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Arts and Crafts / Mission / Craftsman",
    family_description: "The honest-construction reform style of the early 20th century — straight lines, exposed joinery, and fumed oak expressing craft morality.",
    core_visual_identity: "Straight lines, exposed joinery, through-tenons, corbels, slats, honest construction, oak, fumed finish, leather, simple hardware, sturdy horizontal mass. American Arts and Crafts/Mission is commonly dated around the late 19th century into the early 20th century.",
    period_associations: [
      { period_label: "Original Arts and Crafts period", date_floor: 1895, date_ceiling: 1930 },
    ],
    original_emergence_summary: "Original emergence: c. 1895",
    original_conclusion_summary: "Original conclusion as dominant style: c. 1930",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["Mission", "Craftsman", "Arts and Crafts"],
    maker_associations: [],
  },
  {
    id: "style_family_art_nouveau",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Whiplash curves, flowing organic lines, flowers, vines, female figures, asymmetry, sinuous metalwork, carved or inlaid natural motifs; c.1890-1915.",
    notes: "Per Styles_and_Waves.docx style #16. 4/4 per D-SW41-6. Single canonical name — no canonical_source_aliases. family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Art Nouveau",
    family_description: "The sinuous, organic turn-of-the-century style — whiplash curves and flowing botanical motifs, decorative where Arts and Crafts is structural.",
    core_visual_identity: "Whiplash curves, flowing organic lines, flowers, vines, female figures, asymmetry, sinuous metalwork, carved or inlaid natural motifs.",
    period_associations: [
      { period_label: "Original Art Nouveau period", date_floor: 1890, date_ceiling: 1915 },
    ],
    original_emergence_summary: "Original emergence in American furniture: c. 1890",
    original_conclusion_summary: "Original conclusion: c. 1915",
    assessment_layer: "style_and_waves",
    maker_associations: [],
  },
  {
    id: "style_family_colonial_revival",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "A long-running revival umbrella — reinterpretations of early American, William and Mary, Queen Anne, Chippendale, Federal, and Pennsylvania German forms; c.1876 to present in successive waves.",
    notes: "Per Styles_and_Waves.docx style #17. 4/4 per D-SW41-6. Single canonical name — no canonical_source_aliases. period_associations single-entry, date_ceiling omitted (canonical 'Still active, with waves' — extends-to-present convention). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Colonial Revival",
    family_description: "Not one style but a long-running revival umbrella — successive waves reinterpreting early American forms from the Centennial onward.",
    core_visual_identity: "Revival of early American, William and Mary, Queen Anne, Chippendale, Federal, and Pennsylvania German forms. It is not one style but a long-running revival umbrella. Antique references commonly identify Colonial Revival as beginning in the late 19th century and continuing through several 20th-century waves.",
    period_associations: [
      { period_label: "Colonial Revival umbrella, still active in waves", date_floor: 1876 },
    ],
    original_emergence_summary: "Original emergence as a revival style: c. 1876",
    original_conclusion_summary: "Conclusion: Still active, with waves",
    assessment_layer: "style_and_waves",
    maker_associations: [],
  },
  {
    id: "style_family_tudor_revival",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Dark oak, linenfold panels, heavy turnings, trestle tables, carved panels, strapwork, barley twist, shield backs, Tudor arches; c.1880-1940 as major production, with later revivals.",
    notes: "Per Styles_and_Waves.docx style #18. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 (slash-separated canonical name). NOTE alias-token overlap with style #2 'Jacobean' (per A-4a): name-matching resolution uses exact-full-token equality — 'Jacobean Revival' here is a distinct full token from 'Jacobean' on style #2. family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Tudor Revival / Jacobean Revival / Elizabethan Revival",
    family_description: "The dark-oak medieval-Renaissance revival of the late 19th and early 20th centuries — linenfold panels, strapwork, barley twist, and Tudor arches.",
    core_visual_identity: "Dark oak, linenfold panels, heavy turnings, trestle tables, carved panels, strapwork, barley twist, shield backs, Tudor arches.",
    period_associations: [
      { period_label: "Tudor Revival major production", date_floor: 1880, date_ceiling: 1940 },
    ],
    original_emergence_summary: "Original American revival emergence: c. 1880",
    original_conclusion_summary: "Conclusion: c. 1940 as major production, with later revivals",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["Jacobean Revival", "Elizabethan Revival", "Tudor Revival"],
    maker_associations: [],
  },
  {
    id: "style_family_spanish_colonial_revival",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Heavy wood, iron hardware, plank construction, trestle forms, leather, nailheads, arches, carved panels, tile, dark stain, Southwestern/California mission influence; c.1890-1940 as major wave, with later revivals.",
    notes: "Per Styles_and_Waves.docx style #19. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 (slash-separated canonical name). NOTE alias-token overlap with style #15 'Mission' (per A-4a): name-matching resolution uses exact-full-token equality — 'Mission Revival' here is a distinct full token from 'Mission' on style #15. family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Spanish Colonial Revival / Mission Revival / Mediterranean Revival",
    family_description: "The Southwestern/Mediterranean revival of the early 20th century — heavy wood, iron hardware, arches, leather, and tile in a regional California-Spanish idiom.",
    core_visual_identity: "Heavy wood, iron hardware, plank construction, trestle forms, leather, nailheads, arches, carved panels, tile, dark stain, Southwestern or California mission influence.",
    period_associations: [
      { period_label: "Spanish Colonial Revival major wave", date_floor: 1890, date_ceiling: 1940 },
    ],
    original_emergence_summary: "Original emergence: c. 1890",
    original_conclusion_summary: "Conclusion as major wave: c. 1940, with later revivals",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["Mission Revival", "Mediterranean Revival", "Spanish Colonial Revival"],
    maker_associations: [],
  },
  {
    id: "style_family_art_deco",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Geometric ornament, stepped forms, exotic veneers, lacquer, chrome, mirror, ziggurats, sunbursts, waterfall fronts, skyscraper verticality; c.1925-1940 with overlap into Streamline Moderne.",
    notes: "Per Styles_and_Waves.docx style #20. 4/4 per D-SW41-6. Single canonical name — no canonical_source_aliases. period_associations multi-entry per A-5 ('with overlap into Streamline Moderne'). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Art Deco",
    family_description: "The geometric, glamorous modern-decorative style of the interwar years — stepped forms, exotic veneers, lacquer, chrome, and skyscraper verticality.",
    core_visual_identity: "Geometric ornament, stepped forms, exotic veneers, lacquer, chrome, mirror, ziggurats, sunbursts, waterfall fronts, skyscraper verticality. Art Deco is tied to the international modern decorative style publicized after the 1925 Paris exposition.",
    period_associations: [
      { period_label: "Original Art Deco period", date_floor: 1925, date_ceiling: 1940 },
      { period_label: "Overlap into Streamline Moderne", date_floor: 1940, date_ceiling: 1945 },
    ],
    original_emergence_summary: "Original emergence in American furniture: c. 1925",
    original_conclusion_summary: "Conclusion: c. 1940, with overlap into Streamline Moderne",
    assessment_layer: "style_and_waves",
    maker_associations: [],
  },
  {
    id: "style_family_streamline_moderne",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Rounded corners, horizontal speed lines, chrome pulls, tubular steel, smooth surfaces, aerodynamic forms, machine-age optimism; c.1930-1945.",
    notes: "Per Styles_and_Waves.docx style #21. 4/4 per D-SW41-6. Single canonical name — no canonical_source_aliases. family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Streamline Moderne",
    family_description: "The smooth, aerodynamic machine-age style — rounded corners and horizontal speed lines distinguishing it from the stepped verticality of Art Deco.",
    core_visual_identity: "Rounded corners, horizontal speed lines, chrome pulls, tubular steel, smooth surfaces, aerodynamic forms, machine-age optimism. Recent design summaries distinguish Streamline Moderne from Art Deco by its smoother, aerodynamic, horizontal character.",
    period_associations: [
      { period_label: "Original Streamline Moderne period", date_floor: 1930, date_ceiling: 1945 },
    ],
    original_emergence_summary: "Original emergence: c. 1930",
    original_conclusion_summary: "Conclusion: c. 1945",
    assessment_layer: "style_and_waves",
    maker_associations: [],
  },
  {
    id: "style_family_mid_century_modern",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Clean lines, low profiles, tapered legs, molded plywood, fiberglass, steel, aluminum, laminate, open forms, functional clarity, organic and geometric shapes; c.1940-1970 with later revivals.",
    notes: "Per Styles_and_Waves.docx style #22. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 (slash-separated canonical name). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Mid-Century Modern / American Modernism",
    family_description: "The postwar American modern style — clean lines, low profiles, tapered legs, and new materials (molded plywood, fiberglass, aluminum) with functional clarity.",
    core_visual_identity: "Clean lines, low profiles, tapered legs, molded plywood, fiberglass, steel, aluminum, laminate, open forms, functional clarity, organic and geometric shapes. MoMA exhibited Charles Eames’s molded plywood chairs in 1946, and Herman Miller became a major producer of Eames furniture, which helps anchor the American postwar modern design moment.",
    period_associations: [
      { period_label: "Original Mid-Century Modern period", date_floor: 1940, date_ceiling: 1970 },
    ],
    original_emergence_summary: "Original emergence: c. 1940",
    original_conclusion_summary: "Conclusion as dominant wave: c. 1970, with later revivals",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["American Modernism", "Mid-Century Modern"],
    maker_associations: [],
  },
  {
    id: "style_family_hollywood_regency",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Glamorous neoclassicism — lacquer, brass, glass, mirrors, bamboo motifs, Greek key, faux finishes, bold contrast, small-scale luxury, theatrical silhouettes; c.1930-1965.",
    notes: "Per Styles_and_Waves.docx style #23. 4/4 per D-SW41-6. Single canonical name — no canonical_source_aliases. family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Hollywood Regency",
    family_description: "The glamorous, theatrical decorator style — lacquer, brass, mirrors, and neoclassical motifs at small-scale luxury.",
    core_visual_identity: "Glamorous neoclassicism; lacquer, brass, glass, mirrors, bamboo motifs, Greek key, faux finishes, bold contrast, small-scale luxury, theatrical silhouettes.",
    period_associations: [
      { period_label: "Original Hollywood Regency period", date_floor: 1930, date_ceiling: 1965 },
    ],
    original_emergence_summary: "Original emergence: c. 1930",
    original_conclusion_summary: "Conclusion as major original wave: c. 1965",
    assessment_layer: "style_and_waves",
    maker_associations: [],
  },
  {
    id: "style_family_rustic",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Natural logs, twig work, bark surfaces, plank forms, leather, iron, pine, knotty wood, regional cabin or ranch identity; c.1890 to present (ongoing).",
    notes: "Per Styles_and_Waves.docx style #24. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 (slash-separated canonical name). period_associations single-entry, date_ceiling omitted (canonical 'Ongoing' — extends-to-present convention). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Rustic / Adirondack / Lodge / Western / Ranch",
    family_description: "The ongoing regional cabin-and-ranch idiom — natural logs, twig work, bark surfaces, and knotty wood expressing rustic leisure identity.",
    core_visual_identity: "Natural logs, twig work, bark surfaces, plank forms, leather, iron, pine, knotty wood, regional cabin or ranch identity.",
    period_associations: [
      { period_label: "Rustic idiom, ongoing", date_floor: 1890 },
    ],
    original_emergence_summary: "Original emergence: c. 1890",
    original_conclusion_summary: "Conclusion: Ongoing",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["Adirondack", "Lodge", "Western", "Ranch", "Rustic"],
    maker_associations: [],
  },
  {
    id: "style_family_postmodern",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Anti-modernist play — bright color, laminate, asymmetry, exaggerated geometry, historical references used ironically, sculptural furniture; c.1980-1995, with revival after c.2010.",
    notes: "Per Styles_and_Waves.docx style #25. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 (slash-separated canonical name). period_associations single-entry per A-5 (the 'revival after c.2010' is revival-wave content for Block 42, not the original-style window). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Postmodern / Memphis / Radical Design Influence",
    family_description: "The anti-modernist play of the 1980s — bright color, laminate, exaggerated geometry, and ironic historical quotation in sculptural furniture.",
    core_visual_identity: "Anti-modernist play, bright color, laminate, asymmetry, exaggerated geometry, historical references used ironically, sculptural furniture. The Memphis Group formed in 1980 and was active in the 1980s, with furniture and objects known for bright colors, bold shapes, and plastic laminate.",
    period_associations: [
      { period_label: "Original Postmodern / Memphis period", date_floor: 1980, date_ceiling: 1995 },
    ],
    original_emergence_summary: "Original emergence in American interiors: c. 1980",
    original_conclusion_summary: "Conclusion as dominant wave: c. 1995, with revival after c. 2010",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["Memphis", "Radical Design", "Postmodern"],
    maker_associations: [],
  },
  {
    id: "style_family_contemporary_transitional",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "Blending of historical references with modern proportions — simplified Chippendale, Federal, Regency, Mission, farmhouse, and MCM vocabulary, cleaner scale, mixed finishes, less strict period accuracy; c.1990 to present (ongoing).",
    notes: "Per Styles_and_Waves.docx style #26. 4/4 per D-SW41-6. canonical_source_aliases per D-SW41-11 (slash-separated canonical name). period_associations single-entry, date_ceiling omitted (canonical 'Ongoing' — extends-to-present convention). family_description defensible-default. maker_associations: [] per D-SW41-9.",
    name: "Contemporary Transitional / New Traditional / Eclectic Historicism",
    family_description: "The ongoing eclectic-historicist idiom — historical references blended with modern proportions in simplified, mixed-finish vocabulary.",
    core_visual_identity: "Blending of historical references with modern proportions; simplified Chippendale, Federal, Regency, Mission, farmhouse, and MCM vocabulary; often cleaner scale, mixed finishes, and less strict period accuracy.",
    period_associations: [
      { period_label: "Contemporary Transitional idiom, ongoing", date_floor: 1990 },
    ],
    original_emergence_summary: "Emergence: c. 1990",
    original_conclusion_summary: "Conclusion: Ongoing",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: ["New Traditional", "Eclectic Historicism", "Contemporary Transitional"],
    maker_associations: [],
  },
];

/**
 * STYLE_REVIVAL_WAVES — per-style revival wave entries. Empty
 * scaffold in Block 41; Block 42 authors ~108 entries from the
 * Styles_and_Waves.docx per-style "Revival waves" subsections
 * and closes Phase 2 Session 9.
 */
export const STYLE_REVIVAL_WAVES: StyleRevivalWaveEntry[] = [];

/**
 * STYLE_REASONING_RULES — 6 meta-rule entries per Block 41
 * D-SW41-12. Rules #1-5 are the five canonical Cross-Wave
 * Identification principles (Styles_and_Waves.docx paragraphs
 * 213-231); Rule #6 is the Independent Layer Evaluation
 * Standard encoding. Five NEW reasoning-rule TYPES established
 * (D-SW41-13). All entries authority 9/9; migration_status
 * "complete"; migration_target "engine_reasoning";
 * cross_layer_scope: true on Rule #6 only.
 */
export const STYLE_REASONING_RULES: StyleReasoningRule[] = [
  {
    id: "style_reasoning_original_period_vs_revival_distinction",
    category: "style_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Original Period vs. Revival Distinction",
    rule_statement: "Style identification must distinguish an original-period instance of a style from a later revival-wave instance of the same style. Original-period furniture usually shows the style as a living design language; revival furniture usually shows the style as a quotation — often with cleaner machine regularity, modern hardware, standardized dimensions, and construction methods from its own production era. A 'Chippendale-style' piece may be an original 1760s piece or a 1925 revival; the style family identifies what it references, not when it was made.",
    rationale: "Per Styles_and_Waves.docx Cross-Wave Identification Rules canonical anchor (paragraphs 214-215): 'Original period furniture usually shows the style as a living design language. Revival furniture usually shows the style as a quotation, often with cleaner machine regularity, modern hardware, standardized dimensions, and construction methods from its own production era.' NEW canonical reasoning-rule TYPE per D-SW41-13. Core appraiser-practice distinction underpinning the whole style-and-waves layer: every StyleFamilyEntry has an original-period window plus revival waves; the engine must not collapse the two.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["style_family", "style_revival_wave"],
    cross_layer_scope: false,
    notes: "NEW reasoning-rule TYPE per D-SW41-13 (first of five established this block). Underpins the StyleFamilyEntry (original period) vs StyleRevivalWaveEntry (revival waves) split.",
  },
  {
    id: "style_reasoning_scale_and_visual_weight_as_evidence",
    category: "style_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Scale and Visual Weight as Evidence",
    rule_statement: "Scale and visual weight are dating evidence within a style family. Earlier original styles often follow the human, room, and craft limitations of their own era; revival waves frequently exaggerate the 'recognizable' parts of a style — bigger cabriole legs, heavier claw feet, darker finishes, thicker carving, more obvious arches, stronger silhouettes. When a piece reads as enlarged or heavied relative to the original-period vocabulary, that exaggeration is itself a signal of a later revival wave.",
    rationale: "Per Styles_and_Waves.docx Cross-Wave Identification Rules canonical anchor (paragraphs 216-217): 'Earlier original styles often follow human, room, and craft limitations of their own era. Revival waves frequently exaggerate the recognizable parts: bigger cabriole legs, heavier claw feet, darker finishes, thicker carving, more obvious arches, stronger silhouettes.' NEW canonical reasoning-rule TYPE per D-SW41-13. Operationalized at Block 42 by the DesignSubtlety massing_and_proportion + carving_character aspects on revival-wave entries.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["style_family", "style_revival_wave"],
    cross_layer_scope: false,
    notes: "NEW reasoning-rule TYPE per D-SW41-13 (second of five). Maps to DesignSubtlety aspects massing_and_proportion + carving_character (Block 42 content).",
  },
  {
    id: "style_reasoning_surface_vs_structure_distinction",
    category: "style_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Surface vs. Structure Distinction",
    rule_statement: "Distinguish surface style from structural style. Original period styles often integrate construction and style — the way the piece is built IS the style. Later revivals often apply style elements onto modern carcasses: applied moldings, machine carving, veneer panels, decorative hardware, sprayed finishes, plywood, fiberboard, or standardized factory joinery. Style vocabulary visible only on the surface, over construction that belongs to a later era, indicates a revival wave rather than the original period.",
    rationale: "Per Styles_and_Waves.docx Cross-Wave Identification Rules canonical anchor (paragraphs 218-219): 'Original period styles often integrate construction and style. Later revivals often apply style elements onto modern carcasses: applied moldings, machine carving, veneer panels, decorative hardware, sprayed finishes, plywood, fiberboard, or standardized factory joinery.' NEW canonical reasoning-rule TYPE per D-SW41-13. Operationalized at Block 42 by the DesignSubtlety construction_expression + surface_and_finish aspects on revival-wave entries.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["style_family", "style_revival_wave"],
    cross_layer_scope: false,
    notes: "NEW reasoning-rule TYPE per D-SW41-13 (third of five). Maps to DesignSubtlety aspects construction_expression + surface_and_finish (Block 42 content).",
  },
  {
    id: "style_reasoning_wave_to_wave_contrast_pattern",
    category: "style_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Wave-to-Wave Contrast Pattern",
    rule_statement: "Within almost every style family, the revival waves follow a recurring contrast progression: the original period (style is functional and current); a Victorian or Centennial revival (style becomes patriotic, romantic, theatrical, or antiquarian); an early-20th-century revival (style becomes more domestic, suite-based, and factory-standard); a postwar revival (style becomes nostalgic, family-oriented, and simplified); a late-20th-century revival (style becomes large, glossy, and showroom traditional); and a contemporary revival (style becomes eclectic, lifestyle-driven, and often surface-based rather than construction-based). Wave identification benefits from placing a piece within this canonically-documented progression.",
    rationale: "Per Styles_and_Waves.docx Cross-Wave Identification Rules canonical anchor (paragraphs 220-227): the six-stage wave progression — 'Original period: Style is functional and current. Victorian or Centennial revival: Style becomes patriotic, romantic, theatrical, or antiquarian. Early 20th-century revival: Style becomes more domestic, suite-based, and factory-standard. Postwar revival: Style becomes nostalgic, family-oriented, and simplified. Late 20th-century revival: Style becomes large, glossy, and showroom traditional. Contemporary revival: Style becomes eclectic, lifestyle-driven, and often surface-based rather than construction-based.' NEW canonical reasoning-rule TYPE per D-SW41-13. Operationalized at Block 42 by the StyleRevivalWaveEntry wave_number ordering + contrast_summary content.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["style_family", "style_revival_wave"],
    cross_layer_scope: false,
    notes: "NEW reasoning-rule TYPE per D-SW41-13 (fourth of five). Underpins the StyleRevivalWaveEntry wave_number + contrast_summary fields (Block 42 content).",
  },
  {
    id: "style_reasoning_practical_appraiser_rule",
    category: "style_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Practical Appraiser Rule",
    rule_statement: "Treat style wave and construction date as separate lanes. A piece can be 'Chippendale style' but made in 1925, 'Jacobean Revival' but made in 1930, 'Federal Revival' but made in 1955, or 'Mission Revival' but made in 2005. Style vocabulary tells you what the piece is referencing; construction evidence tells you when it was made. These are different layers of evidence that must be weighted and evaluated once all evidence is collected and analyzed — the style-and-waves layer is a low-weighted contributor to the reconciliation pool, never the sole determinant of a date.",
    rationale: "Per Styles_and_Waves.docx Cross-Wave Identification Rules canonical anchor (paragraphs 228-231): 'For identification, treat style wave and construction date as separate lanes... Style vocabulary tells you what it is referencing; construction evidence tells you when it was made. These are different layers of evidence that must be weighted and evaluated once all evidence is collected and analyzed.' NEW canonical reasoning-rule TYPE per D-SW41-13. Directly grounds the D-SW41-6 interpretive-uncertainty-authority convention (STYLE_FAMILIES 4/4) and the DesignSubtlety weight 'low' field — the style layer is a low-weighted evidence contributor by canonical mandate.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["style_family", "style_revival_wave"],
    cross_layer_scope: false,
    notes: "NEW reasoning-rule TYPE per D-SW41-13 (fifth of five). Canonical grounding for the D-SW41-6 interpretive-uncertainty-authority convention + DesignSubtlety weight 'low'.",
  },
  {
    id: "style_reasoning_style_evidence_layer_independence",
    category: "style_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Style Evidence Layer Independence",
    rule_statement: "Style-and-waves evidence (style family identification, revival-wave placement, design subtleties) is evaluated independently from other evidence layers (wood, maker marks, form, construction logic, joinery, fasteners, hardware, upholstery covers, upholstery construction). Style-axis findings must NOT be biased by upstream findings from other layers, and must not bias them. The engine must not, for example, use a tentative wood-species finding to narrow style-family candidates, nor use a style-family identification to pre-filter construction-date evidence. Each layer outputs independent evidence; cross-layer combination occurs at the report/reconciliation layer, where the style-and-waves layer joins as a low-weighted contributor per the Practical Appraiser Rule.",
    rationale: "Per Block 22.5 D-PA-1 Independent Layer Evaluation Standard. Canonicalized for the style families library per the pattern established by wood reasoning rule #7, maker reasoning rule #1, joinery reasoning rule #5, fastener reasoning rule #5, hardware reasoning rule #5, upholstery covers reasoning rule #5, and upholstery construction reasoning rule #5. EIGHTH canonical-library encoding of the ILE Standard per D-SW41-5 — COMPLETES the ILE encoding across all 8 Phase 2 evidence libraries. The rule explicitly blocks dependency-wiring proposals that would create downstream-evidence-from-upstream-evidence inference biases on the style axis.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["style_family", "style_revival_wave", "style_reasoning_rule"],
    cross_layer_scope: true,
    notes: "EIGHTH canonical-library encoding of the Independent Layer Evaluation Standard (after wood, maker, joinery, fastener, hardware, upholstery covers, upholstery construction) per D-SW41-5 — COMPLETES the ILE encoding across all 8 Phase 2 evidence libraries. cross_layer_scope: true (the only Block 41 rule so flagged).",
  },
];
