// upholsteryCovers.ts
//
// Upholstery covers library. Phase 2 Session 7 fourth library
// (four-file evidence libraries architecture; joinery shipped
// Blocks 30-31; fasteners shipped Blocks 33-34; hardware shipped
// Blocks 35-36). Block 37 ships schema foundation + 10 categories
// + 7 reasoning rules + empty types scaffold + two-assessment-
// with-sub-output-surfacing convention capture (D-UC37-3) + first
// library-level "upholstery" assessment_layer application
// (D-UC37-4); Block 38 follows with 44 UPHOLSTERY_COVER_TYPES
// content authoring from American_Furniture_Textile_Reference.docx
// canonical source covers section (paragraphs 0-437).
//
// Architecture per Block 37 D-UC37-1 through D-UC37-13:
// - UpholsteryCoverCategoryEntry: 10 top-level category entries.
//   All entries route to assessment_layer "upholstery" +
//   evidence_sub_layer "cover" at library level per D-UC37-3 +
//   D-UC37-4. First library-level "upholstery" assessment_layer
//   application (prior libraries used per-subcategory override
//   per D-FA33-5 or per-category override per D-HW35-7).
// - UpholsteryCoverTypeEntry: per-type entries; Block 38 authors
//   44. Schema includes 5 FK fields per D-UC37-8: 4 cross-library
//   (related_construction_types, related_hardware_types,
//   related_fastener_types, related_form_types) + 1 intra-library
//   (related_cover_types).
// - UpholsteryCoverReasoningRule: 7 meta-rule entries per Q5=H
//   expanded set + D-UC37-7 (canonical-source rigor over fixed
//   5-rule pattern). cross_layer_scope: true on Rule #1
//   (covers_alone_never_dates_furniture) + Rule #5
//   (cover_evidence_layer_independence; SIXTH canonical-library
//   encoding of Independent Layer Evaluation Standard per
//   D-UC37-9).
// - UpholsteryCoverMakerAssociation: library-local interface (NOT
//   promoted to entryShape.ts per D-UC37-6 + schema-occurrence
//   rule doesn't fire). Block 38 leaves maker_associations: []
//   empty arrays for ALL 44 type entries per D-UC37-6 SCHEMA-
//   PRESENT-CONTENT-DEFERRED discipline (D-HW35-6 application).
// - Two-assessment-with-sub-output-surfacing convention per
//   D-UC37-3 (forward-applicable extension of D-FA33-5 dual-
//   assessment architecture). Per Mike's appraiser-practice
//   judgment: covers + construction libraries BOTH route to
//   single "upholstery" assessment_layer at library level;
//   engine surfaces upholstery system date + visible cover date
//   as SUB-OUTPUTS within unified upholstery assessment section
//   on report. Sub-layer routing via explicit evidence_sub_layer
//   field at library level + per-category-entry.
// - engine.ts UNCHANGED per Phase 2 / Phase 3 separation.

import type {
  CanonicalEntry,
  PeriodAssociation,
  StyleAssociation,
  AntiClassificationGuidance,
  ReasoningRuleMigrationTarget,
  PhysicalLocation,
} from "./entryShape";

/**
 * Library-level assessment routing constants per D-FA33-5 dual-
 * assessment architecture + D-UC37-3 two-assessment-with-sub-
 * output-surfacing convention. Engine reads these constants for
 * library-level routing to "upholstery" assessment section with
 * "cover" sub-output identification. Forward-applicable: Block 39
 * upholsteryConstruction.ts will declare parallel constants
 * (UPHOLSTERY_CONSTRUCTION_ASSESSMENT_LAYER = "upholstery";
 * UPHOLSTERY_CONSTRUCTION_EVIDENCE_SUB_LAYER = "system") per
 * D-UC37-3 sub-layer routing mechanism.
 */
export const UPHOLSTERY_COVERS_ASSESSMENT_LAYER = "upholstery" as const;
export const UPHOLSTERY_COVERS_EVIDENCE_SUB_LAYER = "cover" as const;

/**
 * UpholsteryCoverCategoryEntry — top-level upholstery cover
 * category per Block 37 D-UC37-1. 10 categories per American
 * _Furniture_Textile_Reference.docx covers section (Op A-4
 * enumeration). All entries carry assessment_layer "upholstery"
 * + evidence_sub_layer "cover" per D-UC37-3 + D-UC37-4 library-
 * level uniform routing.
 *
 * Field roster:
 * - category: literal "upholstery_cover_category"
 * - name: canonical category name verbatim from seed
 * - category_description: prose description from seed (Wicker
 *   category absorbs general-intro content per D-UC37-11
 *   Surfacing 1 resolution)
 * - unique_category_traits: array from seed
 * - core_identifying_elements?: optional bullet array per
 *   D-JN30-9 + D-FA33-Surfacing-2 field-naming variance
 *   precedent
 * - assessment_layer: literal "upholstery" per D-UC37-4 first
 *   library-level application
 * - evidence_sub_layer: literal "cover" per D-UC37-3 sub-output
 *   routing mechanism
 */
export interface UpholsteryCoverCategoryEntry extends CanonicalEntry {
  category: "upholstery_cover_category";
  name: string;
  category_description: string;
  unique_category_traits: string[];
  core_identifying_elements?: string[];
  assessment_layer: "upholstery";
  evidence_sub_layer: "cover";
}

/**
 * UpholsteryCoverTypeEntry — per-cover-type canonical entry per
 * Block 37 D-UC37-1. Flat fields parallel to MakerMarkEntry +
 * JoineryTypeEntry + FastenerTypeEntry + HardwareTypeEntry
 * pattern. Block 38 authors 44 entries per Op A-5 + D-UC37-11.
 *
 * Field roster (~17 fields beyond CanonicalEntry):
 * - category: literal "upholstery_cover_type"
 * - name: cover type name verbatim from seed
 * - parent_category_id: FK to UpholsteryCoverCategoryEntry.id
 * - description: prose from seed
 * - unique_traits: array from seed
 * - identifying_characteristics: array from seed
 * - period_associations: PeriodAssociation[] from seed DATE
 *   RANGE
 * - date_range_summary: prose summary from seed
 * - style_associations?: StyleAssociation[] per D-UC37-5 sparse
 *   population (~18% est per A-5 style density check)
 * - maker_associations?: UpholsteryCoverMakerAssociation[] per
 *   D-UC37-6 SCHEMA-PRESENT-CONTENT-DEFERRED (Block 38 leaves
 *   arrays EMPTY for ALL 44 type entries; no canonical textile-
 *   manufacturer content in seed)
 * - common_observed_locations?: PhysicalLocation[] —
 *   identification helper per D-FA33-6 (location HELPS
 *   identification but NOT routing); cover entries typically
 *   populate upholstery_seat / upholstery_back / upholstery_arm
 *   / upholstery_support_layer / upholstery_attachment_point /
 *   upholstery_dust_cover values
 * - anti_classification_guidance?: AG entry on industrial-
 *   introduction-boundary cover types (Vinyl 1930+, Rayon 1900+,
 *   Nylon 1940+, Polyester 1950+, Acrylic 1950+, Olefin 1960+,
 *   Microfiber 1980+, Synthetic Resin Wicker 1980+, Paper Fiber
 *   Rush 1880+, Paper Fiber Wicker 1880+) per Block 38 Op A
 *   AG candidate identification. 10 AGs expected at Block 38;
 *   most apply D-HW36-15 decade-range AG-floor interpretation
 *   discipline.
 * - replacement_likelihood: "low" | "medium" | "high" per D-AP32
 *   -3 + D-FA33-7 + Mike's covers-are-replacement-prone-by-axis
 *   framing. Covers ARE the replacement-prone class (covers
 *   date the upholstery campaign per D-UC37-3 + Rule #2).
 * - regional_persistence_notes?: regional/rural-persistence
 *   prose per Rule #3 + Block 35 D-HW35-Rule-3 precedent
 * - related_cover_types?: intra-library FK linking related cover
 *   types (e.g., chintz ↔ toile printed-cotton family;
 *   jacquard ↔ damask figured-weave family)
 * - related_construction_types?: cross-library FK to
 *   upholsteryConstruction.ts entries per D-UC37-8 (forward-
 *   reference for Block 38; resolves at Block 40 construction
 *   library content authoring). Category 7 Canvas/Webbing/
 *   Burlap/Muslin entries primary cross-reference target.
 * - related_hardware_types?: cross-library FK to hardware.ts
 *   per D-UC37-8 (decorative trim references → hardware
 *   UPHOLSTERY HARDWARE category: upholstery_tacks +
 *   decorative_nailhead_trim)
 * - related_fastener_types?: cross-library FK to fasteners.ts
 *   per D-UC37-8 (attachment evidence → fasteners Cat 3 STAPLES
 *   + decorative-brass-nailhead-trim)
 * - related_form_types?: cross-library FK to forms.ts per
 *   D-UC37-8 (upholstered-form appropriateness; sparse
 *   population per canonical-source warrant)
 */
export interface UpholsteryCoverTypeEntry extends CanonicalEntry {
  category: "upholstery_cover_type";
  name: string;
  parent_category_id: string;
  description: string;
  unique_traits: string[];
  identifying_characteristics: string[];
  /**
   * Block 17: visible degradation patterns specific to this cover type.
   * Authored from the canonical source's "Identifying elements" wear-side
   * content (e.g., velvet: "crushed wear on seats and arms, pile loss at
   * edges, deep color shift when brushed"). Distinct from
   * identifying_characteristics which is positive identification; this
   * field is for diagnostic markers visible on USED / WORN examples.
   * Consumed by Block 15 LLM prompt appendix when populated.
   */
  wear_characteristics?: string[];
  /**
   * Block 17: narrative cousin-contrast descriptions distinguishing this
   * cover type from visually similar covers. Parallels forms.ts
   * cousin_form_contrasts. The related_cover_types FK array captures the
   * structural relationship; cousin_contrasts captures the prose
   * disambiguation language from the canonical source (e.g., velvet:
   * "Velvet has cut pile. Velour usually has a knit or softer modern
   * hand. Plush has a longer pile. Mohair velvet is more resilient
   * and lustrous."). Not yet engine-consumed; available for future
   * cousin-contrast evaluator (parallel to P4-6 backlog item).
   */
  cousin_contrasts?: string[];
  period_associations: PeriodAssociation[];
  date_range_summary: string;
  style_associations?: StyleAssociation[];
  maker_associations?: UpholsteryCoverMakerAssociation[];
  common_observed_locations?: PhysicalLocation[];
  anti_classification_guidance?:
    | AntiClassificationGuidance
    | AntiClassificationGuidance[];
  replacement_likelihood: "low" | "medium" | "high";
  regional_persistence_notes?: string;
  related_cover_types?: string[];
  related_construction_types?: string[];
  related_hardware_types?: string[];
  related_fastener_types?: string[];
  related_form_types?: string[];
}

/**
 * UpholsteryCoverMakerAssociation — library-local associative
 * interface per Block 37 D-UC37-6. NOT promoted to entryShape.ts;
 * schema-occurrence rule does not fire for upholstery-covers-only
 * structure (only library that needs to encode textile-
 * manufacturer association; other libraries cross-reference
 * makers via MAKER_ENTRIES.id at maker_id field or via context-
 * specific shapes).
 *
 * Per D-UC37-6 SCHEMA-PRESENT-CONTENT-DEFERRED discipline (D-HW35
 * -6 application): Block 38 leaves maker_associations arrays
 * EMPTY on ALL upholstery cover type entries. Textile canonical
 * source has ZERO textile-manufacturer documentation; per-type
 * content deferred to validation-phase one-offs + post-launch
 * systematic authoring with NO scheduled Block-N authoring plan.
 *
 * Shape: maker_name (free-text per per-canonical-source
 * flexibility; textile manufacturers may not have MAKER_ENTRIES
 * counterparts since the textile reference does not surface
 * maker FK candidates) + optional date window + attribution
 * notes.
 */
export interface UpholsteryCoverMakerAssociation {
  maker_name: string;
  date_floor?: number;
  date_ceiling?: number;
  attribution_notes?: string;
}

/**
 * UpholsteryCoverReasoningRule — meta-rule entries per Block 37
 * D-UC37-7 Q5=H expanded set. 7 entries authored Block 37
 * (canonical-source rigor warrants expanded set vs prior 5-rule
 * pattern across wood / maker / joinery / fastener / hardware
 * libraries per D-UC37-7 NEW convention: canonical-source rigor
 * determines reasoning-rule count per library; the fixed 5-rule
 * pattern was canonical-source-actual coincidence, not
 * architectural mandate).
 *
 * Authority 9/9 per meta-rule supremacy precedent (D-WE26-8 /
 * D-MM27-5); migration_status "complete" per D-WE26-11 convention.
 *
 * cross_layer_scope: true on exactly 2 rules per Block 33/35/36
 * pattern: Rule #1 (covers_alone_never_dates_furniture; meta-rule
 * supremacy) + Rule #5 (cover_evidence_layer_independence; SIXTH
 * canonical-library encoding of Independent Layer Evaluation
 * Standard per D-UC37-9).
 *
 * Two NEW canonical reasoning rule TYPES per Q5=H + D-UC37-7
 * expanded set:
 * - Rule #6: cover_revival_warning (NEW; D-UC37-12; fifth new
 *   evidence-library reasoning-rule TYPE after restoration_false
 *   _signals + replacement_fastener_risk + restoration
 *   _contamination + reproduction_hardware_warning)
 * - Rule #7: cover_axis_sub_output_routing (NEW; D-UC37-13;
 *   operationalizes D-UC37-3 two-assessment-with-sub-output-
 *   surfacing convention at reasoning-rule level)
 */
export interface UpholsteryCoverReasoningRule extends CanonicalEntry {
  category: "upholstery_cover_reasoning_rule";
  rule_name: string;
  rule_statement: string;
  rationale: string;
  migration_target: ReasoningRuleMigrationTarget;
  applies_to_entry_types?: string[];
  cross_layer_scope?: boolean;
}

/**
 * UPHOLSTERY_COVER_CATEGORIES — 10 top-level upholstery cover
 * categories per Block 37 D-UC37-1. Per D-UC37-10 authority
 * calibration: 4 categories at 8/8 (Patterned and Figured + Pile
 * + Leather and Skin + Modern Synthetic — era-anchor + AG-anchor
 * + canonical-rigor categories); 6 categories at 7/7 (Plain Woven
 * + Haircloth/Animal-Hair + Printed + Canvas/Webbing + Cane/Rush
 * /Splint + Wicker — medium-strong canonical-source rationale).
 *
 * ALL 10 categories carry assessment_layer "upholstery" +
 * evidence_sub_layer "cover" per D-UC37-3 + D-UC37-4 library-
 * level uniform routing (first library-level "upholstery"
 * assessment_layer application; no per-category overrides).
 */
export const UPHOLSTERY_COVER_CATEGORIES: UpholsteryCoverCategoryEntry[] = [
  {
    id: "upholstery_cover_category_plain_woven_upholstery_fabrics",
    category: "upholstery_cover_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Plain-woven utility upholstery fabrics in linen, cotton, and wool; broad-range materials (1600s-present) with style associations skewing colonial / Federal / Victorian domestic and revival contexts.",
    notes: "Per American_Furniture_Textile_Reference.docx Category 1 Plain Woven Upholstery Fabrics (paragraphs 1-28). 7/7 medium-strong per D-UC37-10 — broad-range materials; less era-anchor rigor per category-level. Block 38 authoring populates 3 types: Linen (1600-present), Cotton (1700s-present), Wool Broadcloth/Worsted/Serge (1600s-present).",
    name: "Plain Woven Upholstery Fabrics",
    category_description: "Plain-woven upholstery fabrics produced from linen, cotton, and wool fibers. Span the longest date range of any covers category (1600s to present) with strong colonial and Federal-period domestic origins, expanding through 19th-century mass-market production and continuing as utility/slip/underlayer fabrics through contemporary use.",
    unique_category_traits: [
      "Simple plain-weave structure (single warp / single weft interlacing)",
      "Natural-fiber materials (linen / cotton / wool)",
      "Broad date range with no industrial-introduction boundary",
      "Style associations skew colonial / Federal / Victorian domestic / revival contexts",
    ],
    core_identifying_elements: [
      "Uniform plain-weave structure",
      "Fiber-specific identifying signals (linen uneven thread thickness + gray-beige oxidation; cotton soft hand + machine consistency; wool broadcloth dense felted finish)",
      "Hand-sewn seams on early examples; machine seams from late 19th century",
      "Patina + fade patterns consistent with century-scale exposure",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "cover",
  },
  {
    id: "upholstery_cover_category_patterned_and_figured_upholstery_fabrics",
    category: "upholstery_cover_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Patterned and figured weave fabrics (damask, brocade, jacquard, tapestry, turkey work, needlework); ERA-ANCHOR + INDUSTRIAL-INTRODUCTION canonical rigor per Jacquard 1800s+ mechanized weaving anchor + Turkey Work 1600s-1700s tight era anchor.",
    notes: "Per American_Furniture_Textile_Reference.docx Category 2 Patterned and Figured Upholstery Fabrics (paragraphs 29-83). 8/8 per D-UC37-10 — Jacquard 1800s+ industrial-introduction anchor + Turkey Work 1600s-1700s tight era anchor + style-rich content (Federal/Empire/Rococo Revival/Renaissance Revival/Victorian/Eastlake/Hollywood Regency). Block 38 authoring populates 6 types: Damask, Brocade, Jacquard, Tapestry, Turkey Work, Needlework/Needlepoint/Crewel/Embroidered.",
    name: "Patterned and Figured Upholstery Fabrics",
    category_description: "Patterned and figured woven upholstery fabrics carrying complex pattern through weave structure (damask reversible figured weave; brocade supplementary threads; jacquard-controlled loom patterns) or hand-worked decoration (turkey work pile imitating Oriental carpets; needlework/needlepoint/crewel/embroidered hand-stitched covers). Strong style-anchor category with formal parlor + revival-furniture associations across Federal / Empire / Rococo Revival / Renaissance Revival / Victorian / Eastlake / Hollywood Regency contexts.",
    unique_category_traits: [
      "Pattern through weave structure (damask, brocade, jacquard, tapestry) or hand-worked decoration (turkey work, needlework)",
      "Strong style-anchor associations (formal parlor + revival-furniture contexts)",
      "Jacquard 1800s+ industrial-introduction anchor (mechanized Jacquard weaving enables complex pattern at industrial scale)",
      "Turkey Work 1600s-early 1700s tight era anchor (colonial high-style imitation of Oriental carpets)",
    ],
    core_identifying_elements: [
      "Pattern complexity beyond plain weave (figured / supplementary / pictorial)",
      "Style-period motif vocabulary (florals / acanthus / pomegranate / scroll / pictorial scenes)",
      "Weave-structure diagnostics (damask satin/matte contrast; brocade floating threads on reverse; jacquard regular repeat with high pattern complexity)",
      "Hand-stitching evidence on needlework/crewel/embroidered types",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "cover",
  },
  {
    id: "upholstery_cover_category_pile_fabrics",
    category: "upholstery_cover_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Pile-construction fabrics (velvet, plush, mohair velvet, velour) with era-tight canonical anchors; Plush mid-1800s-early 1900s Victorian peak; Mohair Velvet late 1800s+ Mission/Arts and Crafts/Art Deco anchor; PRIMARY DATING-EVIDENCE CATEGORY per pile-construction era diagnostics.",
    notes: "Per American_Furniture_Textile_Reference.docx Category 3 Pile Fabrics (paragraphs 84-120). 8/8 era-anchor per D-UC37-10 — Velvet/Plush/Mohair/Velour era-tight canonical anchors with rich style content (Parlor/Empire/Rococo Revival/Renaissance Revival/Eastlake/Art Deco/Hollywood Regency/Mission/Arts and Crafts/Morris chairs). Block 38 authoring populates 4 types: Velvet (1600s-present), Plush (mid-1800s-early 1900s), Mohair Velvet (late 1800s-present), Velour (late 1800s-present).",
    name: "Pile Fabrics",
    category_description: "Pile-construction upholstery fabrics with dense upright fiber pile creating soft hand, light-absorbing surface, and directional nap. Includes velvet (dense formal pile; 1600s-present formal upholstery), plush (longer pile mid-1800s-early 1900s Victorian peak), mohair velvet (resilient lustrous mohair fiber pile; late 1800s+ Mission/Arts and Crafts/Art Deco anchor), and velour (softer pile less formal than velvet; late 1800s-present).",
    unique_category_traits: [
      "Dense upright fiber pile with directional nap",
      "Soft light-absorbing hand",
      "Era-tight canonical anchors (Velvet 1600s+ formal; Plush mid-1800s-early-1900s Victorian peak; Mohair Velvet late-1800s+ Mission/Deco; Velour late-1800s+)",
      "Strong style associations across Empire / Rococo Revival / Renaissance Revival / Eastlake / Art Deco / Hollywood Regency / Mission / Arts and Crafts",
    ],
    core_identifying_elements: [
      "Pile-construction visible (upright fibers vs flat-weave)",
      "Nap direction shading + light-absorption",
      "Fiber-specific identifying signals (silk velvet luxurious sheen; cotton velvet soft matte; mohair velvet resilient lustrous; velour softer less-formal pile)",
      "Compression wear on seat front + arm tops + back-edge fade",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "cover",
  },
  {
    id: "upholstery_cover_category_haircloth_horsehair_and_animal_hair_fabrics",
    category: "upholstery_cover_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Animal-hair upholstery fabrics (horsehair primary; camel/goat/other hair blends secondary); specialty material category with Federal / Victorian / institutional / arts-and-crafts associations; 1700s-present range.",
    notes: "Per American_Furniture_Textile_Reference.docx Category 4 Haircloth, Horsehair, and Animal-Hair Fabrics (paragraphs 121-139). 7/7 per D-UC37-10 — specialty material category; broad range. Block 38 authoring populates 2 types: Haircloth/Horsehair Upholstery (1700s-present; strongest 18th-19th-early 20th century), Camel/Goat/Other Hair Blends (1800s-present).",
    name: "Haircloth, Horsehair, and Animal-Hair Fabrics",
    category_description: "Animal-hair upholstery fabrics woven with horsehair (primary), camel hair, goat hair, or other animal-hair fibers in weft with wool or cotton warp. Stiff, glossy, slick weave with strong Federal / Victorian / institutional / arts-and-crafts associations. Specialty material category with broad date range and continued reproduction use.",
    unique_category_traits: [
      "Stiff glossy slick weave from animal-hair fiber",
      "Horsehair weft + wool/cotton warp standard construction",
      "Specialty material category",
      "Federal / Victorian / institutional / arts-and-crafts associations",
    ],
    core_identifying_elements: [
      "Visible horsehair fiber in weft (long stiff hair-fiber length)",
      "Glossy slick surface unlike fabric textiles",
      "Stiff hand resistant to draping",
      "Color palette typically black / dark brown / mottled animal-hair natural tones",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "cover",
  },
  {
    id: "upholstery_cover_category_printed_upholstery_and_slip_fabrics",
    category: "upholstery_cover_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Printed cotton/linen upholstery and slip fabrics (chintz glazed printed cotton; toile monochrome scenic; ticking utility stripes); 1700s-present with Colonial / Victorian / Colonial Revival / country / contemporary associations.",
    notes: "Per American_Furniture_Textile_Reference.docx Category 5 Printed Upholstery and Slip Fabrics (paragraphs 140-167). 7/7 per D-UC37-10 — broad-range materials. Block 38 authoring populates 3 types: Chintz (1700s-present), Toile (1700s-present; Colonial Revival/Federal/Victorian Revival), Ticking (1700s-present; utilitarian/country/cottage).",
    name: "Printed Upholstery and Slip Fabrics",
    category_description: "Printed cotton or linen upholstery and slip fabrics with applied surface decoration. Chintz (glazed printed cotton, often floral, decorative; 1700s-present Colonial-through-contemporary), Toile (printed pastoral/scenic pattern, usually monochrome on light ground; 1700s-present with strong Colonial Revival associations), Ticking (striped or check pattern, cotton or linen, sturdy mattress/pillow utility fabric; 1700s-present utilitarian/country/cottage contexts).",
    unique_category_traits: [
      "Applied surface print (not woven pattern)",
      "Cotton or linen ground fabric",
      "Style-period vocabulary range (florals / pastoral scenes / utility stripes)",
      "Slip-cover and decorative-cover applications",
    ],
    core_identifying_elements: [
      "Print on one face vs both faces (slip-cover printing typically face only)",
      "Print method diagnostics (block-print early examples; roller-print 19th-century industrial; screen-print 20th-century)",
      "Glazed finish on Chintz",
      "Pastoral/scenic monochrome composition on Toile",
      "Linear stripe/check pattern on Ticking",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "cover",
  },
  {
    id: "upholstery_cover_category_leather_and_skin_upholstery",
    category: "upholstery_cover_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Leather and skin upholstery (full-grain/top-grain natural leather; embossed/tooled/gilt decorative leather; vinyl/Naugahyde/faux leather 1930s+ AG anchor); PRIMARY DATING-EVIDENCE CATEGORY per Vinyl 1930s industrial-introduction AG floor + rich canonical content on grain-aging diagnostics.",
    notes: "Per American_Furniture_Textile_Reference.docx Category 6 Leather and Skin Upholstery (paragraphs 168-195). 8/8 AG-anchor per D-UC37-10 — Vinyl 1930s+ industrial-introduction AG anchor (Block 38 AG candidate) + rich canonical content on natural-leather grain-aging diagnostics. Block 38 authoring populates 3 types: Full-Grain/Top-Grain Leather (1600s-present), Embossed/Tooled/Gilt Leather (1600s-present), Vinyl/Naugahyde/Faux Leather (1930s+ AG anchor).",
    name: "Leather and Skin Upholstery",
    category_description: "Animal-hide upholstery (full-grain and top-grain leather), decorative-worked leather (embossed, tooled, or gilt leather), and synthetic leather substitutes (vinyl, Naugahyde, faux leather). Natural leather spans 1600s-present with strong colonial / Federal / Spanish Colonial / Dutch-influenced / Mission associations. Decorative-worked leather spans 1600s-present with high-style and luxury upholstery contexts. Vinyl/Naugahyde/faux leather opens 1930s+ industrial-introduction era with mid-century modern / diner / office furniture / Hollywood Regency contexts.",
    unique_category_traits: [
      "Animal-hide or synthetic-hide construction (vs woven textile)",
      "Grain texture visible (natural leather) or imitation grain (vinyl)",
      "Surface ages with use (creasing, patina, cracking on natural leather; brittleness / surface-failure on aged vinyl)",
      "Vinyl 1930s+ industrial-introduction AG anchor (Block 38)",
    ],
    core_identifying_elements: [
      "Grain pattern (natural leather random; vinyl uniform repeating)",
      "Surface flexibility (leather stretches/creases; vinyl coating cracks/peels)",
      "Edge construction (raw-cut leather edges; folded-and-stitched vinyl edges)",
      "Attachment evidence (hand tacks on early leather; staples on vinyl mid-century onward)",
      "Decorative-work evidence (embossing depth, tooling lines, gilt application)",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "cover",
  },
  {
    id: "upholstery_cover_category_canvas_webbing_and_textile_support_surfaces",
    category: "upholstery_cover_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Foundation/support textile category: stretched canvas seats/backs + upholstery webbing + burlap/hessian + muslin/cambric dust covers; UTILITY CATEGORY with substantial cross-library overlap to upholsteryConstruction.ts (Block 39-40 forward-reference per D-UC37-8 related_construction_types FK).",
    notes: "Per American_Furniture_Textile_Reference.docx Category 7 Canvas, Webbing, and Textile Support Surfaces (paragraphs 196-232). 7/7 utility per D-UC37-10. **PRIMARY CROSS-LIBRARY OVERLAP CATEGORY**: all 4 types in this category cross-reference Block 39-40 upholsteryConstruction.ts entries per D-UC37-8 — per-canonical-source fidelity convention preserves both axes (covers axis = visible textile surface; construction axis = foundation/hidden support). Block 38 authoring populates 4 types: Stretched Canvas Seat/Back (1700s-present), Upholstery Webbing (1700s-present), Burlap/Hessian (1800s-present), Muslin/Cambric Dust Cover (1800s-present).",
    name: "Canvas, Webbing, and Textile Support Surfaces",
    category_description: "Foundation and support textile category covering stretched canvas (campaign / military / utilitarian / folding furniture seat or back), upholstery webbing (interlaced textile straps supporting upholstery foundation; jute/linen/cotton/rubberized/synthetic), burlap/hessian (coarse jute fabric used as upholstery foundation / dust layer / support), and muslin/cambric (lightweight plain-woven cotton bottom dust cover or inner lining). Universal foundation/support category in upholstered furniture from 1700s through present.",
    unique_category_traits: [
      "Foundation/support function (not decorative visible cover)",
      "Substantial cross-library overlap with upholsteryConstruction.ts per D-UC37-8",
      "Per-canonical-source fidelity preserves both cover-axis and construction-axis evidence interpretations",
      "Utility weave construction (plain weave / interlaced straps / coarse jute / lightweight muslin)",
    ],
    core_identifying_elements: [
      "Foundation position on piece (under decorative covers; bottom dust cover; webbing rails)",
      "Coarseness gradient (canvas heavy plain weave; webbing interlaced straps; burlap coarse open weave; muslin/cambric lightweight)",
      "Material identification (jute burlap brown coarse; cotton muslin/cambric tight light; linen/hemp canvas heavy)",
      "Attachment evidence consistent with foundation role (tacks on webbing rails; stretched across frame on canvas)",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "cover",
  },
  {
    id: "upholstery_cover_category_cane_rush_splint_and_woven_seat_materials",
    category: "upholstery_cover_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Seat-surface woven materials category: hand cane / pressed cane / natural rush / paper fiber rush / splint / shaker tape / rawhide; 1600s-present with Colonial / Federal / Victorian / Shaker / Appalachian / Spanish Colonial vernacular contexts; Paper Fiber Rush 1880s+ AG anchor (Block 38).",
    notes: "Per American_Furniture_Textile_Reference.docx Category 8 Cane, Rush, Splint, and Woven Seat Materials (paragraphs 233-296). 7/7 broad-range per D-UC37-10. Block 38 authoring populates 7 types: Hand Cane/Strand Cane (1650s-present), Pressed Cane/Sheet Cane (late 1800s-present), Natural Rush (1600s-present), Paper Fiber Rush (late 1800s-present AG candidate), Splint Seat (1600s-present Colonial/Appalachian), Shaker Tape (late 1700s-present), Rawhide/Leather Lacing (1600s-present Colonial/Spanish Colonial).",
    name: "Cane, Rush, Splint, and Woven Seat Materials",
    category_description: "Seat-surface woven materials covering hand cane (strand cane woven through frame holes; 1650s-present Colonial/Federal/Victorian), pressed cane (machine-pressed sheet cane; late 1800s-present Late-Victorian/Arts-and-Crafts), natural rush (plant rushes twisted/woven; 1600s-present colonial/country/farmhouse vernacular), paper fiber rush (paper-fiber cord imitating natural rush; late 1800s+ AG anchor), splint seat (flat ash/oak/hickory strips; 1600s-present Colonial/Appalachian/vernacular), shaker tape (woven fabric ribbon tacked horizontally + vertically; late 1700s-present Shaker), rawhide/leather lacing (rawhide strips laced through frame holes; 1600s-present Colonial/Spanish Colonial/frontier).",
    unique_category_traits: [
      "Seat-surface woven structural material (vs upholstered seat surface)",
      "Material-class diversity (cane / rush / splint / tape / rawhide)",
      "Strong vernacular and regional associations (Colonial / Appalachian / Shaker / Spanish Colonial / frontier)",
      "Paper Fiber Rush late-1800s+ industrial-introduction AG candidate (Block 38)",
    ],
    core_identifying_elements: [
      "Weave pattern (cane octagonal-hole pattern; rush spiral twist; splint flat strips horizontal-vertical; shaker tape orthogonal grid)",
      "Material identification (rattan-bark cane glossy; natural-rush plant fibers spiral; ash/oak/hickory splint flat strips; paper-fiber imitations darker uniform)",
      "Front-rail wear (broken cane at front rail signals age; intact pristine signals recent repair)",
      "Attachment evidence (cane woven through holes; rush twisted around rails; splint woven through gaps; shaker tape tacked at ends)",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "cover",
  },
  {
    id: "upholstery_cover_category_wicker_rattan_reed_willow_and_basketry_furniture_materials",
    category: "upholstery_cover_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Furniture-frame woven materials category: rattan / reed / willow / paper fiber wicker / bamboo / synthetic resin wicker; 1840s-present with American wicker peak 1870s-1940s + revival waves; Synthetic Resin Wicker late-20th-century+ AG anchor + Paper Fiber Wicker late-1800s+ AG anchor (Block 38).",
    notes: "Per American_Furniture_Textile_Reference.docx Category 9 Wicker, Rattan, Reed, Willow, and Basketry Furniture Materials (paragraphs 297-360). 7/7 broad-range per D-UC37-10. Per D-UC37-11 Surfacing 1 resolution: 'Wicker, General Category' intro (paragraphs 298-306) absorbed into category_description + unique_category_traits + core_identifying_elements per A-4-canonical-enumeration-supersedes-A-6-informal-preview discipline per D-HW36-14. Block 38 authoring populates 6 types: Rattan (1840s-present), Reed (1850s-present), Willow (1840s-present), Paper Fiber Wicker (late 1800s-mid 1900s AG candidate), Bamboo (1870s-1920s Aesthetic Movement/Art Deco), Synthetic Resin Wicker (late 20th century+ AG candidate; 1980s+ per D-HW36-15 decade-range interpretation).",
    name: "Wicker, Rattan, Reed, Willow, and Basketry Furniture Materials",
    category_description: "Furniture-frame woven materials category covering wicker construction in rattan, reed, willow, paper fiber, bamboo, and synthetic resin. Wicker is a weaving method (not a single material) applied across these materials to produce open-weave furniture forms. American wicker expands after the 1840s with elaborate Victorian wicker production peaking 1870s-1890s. Arts and Crafts wicker (simpler/heavier) emerges c. 1900-1920s. Stick wicker and streamlined forms appear 1930s. Synthetic resin wicker enters production late 20th century onward. Major American production concentrated in Northeast and Midwest 19th-early 20th centuries with strong porch / resort / summer-house use contexts.",
    unique_category_traits: [
      "Furniture-frame woven construction (vs seat-surface materials in Category 8)",
      "Weaving method applies across multiple natural and synthetic materials",
      "American wicker production peak 1870s-1940s with revival waves later",
      "Style era diagnostics (Victorian elaborate 1870s-1890s; Arts and Crafts simpler 1900-1920s; Stick wicker / streamlined 1930s; Synthetic Resin late 20th century+)",
      "Paper Fiber Wicker + Synthetic Resin Wicker industrial-introduction AG anchors (Block 38)",
    ],
    core_identifying_elements: [
      "Material identification (rattan natural nodes glossy; reed thin natural less-glossy; willow flexible heavier branches; paper-fiber wicker uniform twisted-paper appearance; bamboo distinctive jointed framework; synthetic resin plastic-uniform no natural nodes)",
      "Weave pattern (open-weave wicker characteristic vs tight-woven basketry)",
      "Style era diagnostics (elaborate Victorian curls / heavy Arts and Crafts geometry / streamlined 1930s / uniform synthetic late 20th century)",
      "Frame integration (wicker over wood frame standard; bamboo as structural frame distinctive)",
      "Aging signals (dryness / brittleness on natural materials; UV-fade + cracking on synthetic resin)",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "cover",
  },
  {
    id: "upholstery_cover_category_modern_synthetic_and_blended_upholstery_fabrics",
    category: "upholstery_cover_category",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Modern synthetic and blended upholstery fabrics; ALL 6 TYPES carry industrial-introduction AG floors: Rayon 1900+, Nylon 1940+, Polyester 1950+, Acrylic 1950+, Olefin 1960+, Microfiber 1980+; PRIMARY DATING-EVIDENCE CATEGORY per dense AG-anchor distribution.",
    notes: "Per American_Furniture_Textile_Reference.docx Category 10 Modern Synthetic and Blended Upholstery Fabrics (paragraphs 361-416). 8/8 AG-dense per D-UC37-10 — 6 of 6 types are AG candidates per Block 38 (densest AG distribution of any covers category). All 6 types apply D-HW36-15 decade-range AG-floor interpretation discipline (canonical seed phrasing 'Early 1900s' / '1940s' / '1950s' / '1960s' / '1980s' → conservative decade-floor year per D-HW36-15). Block 38 authoring populates 6 types: Rayon (1900+), Nylon (1940+), Polyester (1950+), Acrylic (1950+), Olefin/Polypropylene (1960+), Microfiber/Microsuede (1980+).",
    name: "Modern Synthetic and Blended Upholstery Fabrics",
    category_description: "Modern synthetic and blended upholstery fabrics produced from regenerated cellulose (rayon) or synthetic polymer (nylon / polyester / acrylic / olefin / polypropylene / microfiber / microsuede). Each material carries an industrial-introduction AG floor reflecting polymer-chemistry production-window emergence: Rayon early 1900s, Nylon 1940s post-WWII, Polyester 1950s, Acrylic 1950s, Olefin/Polypropylene 1960s, Microfiber/Microsuede 1980s. Style associations skew Art Deco (rayon 1920s-1950s), commercial / office / mid-century modern (nylon 1940s+), modern decorator (polyester 1960s+), patio / mid-century modern (acrylic), outdoor (olefin), contemporary stain-resistant (microfiber).",
    unique_category_traits: [
      "Synthetic polymer or regenerated-cellulose construction (vs natural-fiber categories)",
      "Industrial-introduction AG anchor on every type (densest AG distribution of any covers category)",
      "Polymer-chemistry production-window era diagnostics",
      "Style-era diagnostics (Art Deco / mid-century modern / commercial / contemporary)",
    ],
    core_identifying_elements: [
      "Material identification (rayon soft drape sheen silk-imitation; nylon strong smooth shiny resilient; polyester durable wrinkle-resistant bright dyes; acrylic wool-like colorfast outdoor-suitable; olefin lightweight moisture-resistant; microfiber ultra-fine suede-like stain-resistant)",
      "Burn test diagnostics (synthetic polymers melt vs natural fibers char; not normally appropriate for canonical analysis but referenced in canonical-source for forensic context)",
      "Production-era markers (early rayon limited dyestability; nylon post-WWII commercial dominance; polyester 1960s+ decorator dominance; microfiber 1990s+ stain-resistant dominance)",
      "Industrial weave consistency (machine-uniform vs hand-loomed variation)",
    ],
    assessment_layer: "upholstery",
    evidence_sub_layer: "cover",
  },
];

/**
 * UPHOLSTERY_COVER_TYPES — per-cover-type canonical entries.
 * Empty in Block 37 scaffold; Block 38 authors 44 entries from
 * American_Furniture_Textile_Reference.docx canonical source
 * covers section per Op A-5 + D-UC37-11 Surfacing 1 resolution
 * (44 types vs plan preview 45; Wicker general intro absorbed
 * into category-level content per A-4-canonical-enumeration-
 * supersedes-A-6-informal-preview discipline per D-HW36-14).
 */
export const UPHOLSTERY_COVER_TYPES: UpholsteryCoverTypeEntry[] = [
  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-1: PLAIN WOVEN UPHOLSTERY FABRICS (3 entries)
  // ═══════════════════════════════════════════════════════════
  {
    id: "upholstery_cover_type_linen",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Plain-woven flax fabric with crisp hand, slubbed irregularity, and gray-beige oxidation; 1600s-present with strongest deployment in early domestic / slip / underlayer / reproduction contexts.",
    notes: "Per American_Furniture_Textile_Reference.docx Plain Woven Upholstery Fabrics > Linen (paragraphs 2-10). 7/7 per A-7 (broad-range; less era-anchor rigor). replacement_likelihood HIGH per A-8 category default. maker_associations: [] per D-UC37-6.",
    name: "Linen",
    parent_category_id: "upholstery_cover_category_plain_woven_upholstery_fabrics",
    description: "Made from flax; crisp hand; slubbed irregularity in older examples; matte surface; relatively strong but can become brittle with age.",
    unique_traits: [
      "Flax fiber construction",
      "Crisp matte hand",
      "Slubbed irregularity in older examples",
    ],
    identifying_characteristics: [
      "Uneven thread thickness",
      "Dry hand",
      "Gray-beige oxidation",
      "Hand-sewn seams on early examples",
      "Fading toward tan or ivory",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1600, usage_notes: "Strongest in early domestic, slip, underlayer, and reproduction contexts." },
    ],
    date_range_summary: "1600 to present, strongest in early domestic, slip, underlayer, and reproduction contexts.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_dust_cover"],
    replacement_likelihood: "high",
  },
  {
    id: "upholstery_cover_type_cotton",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Plain-woven cotton fabric; softer than linen + takes printed patterns well; 1700s-present with strongest deployment after industrial spinning expanded; Southern + rural + mass-market American furniture associations.",
    notes: "Per American_Furniture_Textile_Reference.docx Plain Woven Upholstery Fabrics > Cotton (paragraphs 11-19). 7/7 per A-7. replacement_likelihood HIGH per A-8 category default. regional_persistence_notes populated per D-UC38-9 strict canonical fidelity (canonical 'Strong in Southern, rural, and later mass-market' explicit reference). maker_associations: [] per D-UC37-6.",
    name: "Cotton",
    parent_category_id: "upholstery_cover_category_plain_woven_upholstery_fabrics",
    description: "Plain-woven cotton fabric softer than linen with matte surface and high print receptivity.",
    unique_traits: [
      "Softer than linen",
      "Matte surface",
      "More absorbent",
      "Takes printed patterns well",
    ],
    identifying_characteristics: [
      "Soft fraying",
      "Flatter yarns",
      "Printed floral or geometric designs",
      "Frequent use in chintz, ticking, muslin, and later decorator fabrics",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1700, usage_notes: "Expanding strongly in the 19th century after industrial spinning." },
    ],
    date_range_summary: "1700s to present, expanding strongly in the 19th century.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_dust_cover"],
    replacement_likelihood: "high",
    regional_persistence_notes: "Strong in Southern, rural, and later mass-market American furniture per canonical-source verbatim reference. Cotton production and industrial spinning expanded after 18th-century mechanization; rural Southern domestic textile economy carried cotton upholstery and slip-cover traditions through the 19th-century mass-market expansion.",
  },
  {
    id: "upholstery_cover_type_wool_broadcloth_worsted_serge",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Dense plain/twill/worsted wool upholstery fabric; 1600s-present with strongest 17th-19th century use plus revival/reproduction; early colonial + Federal-period urban context.",
    notes: "Per American_Furniture_Textile_Reference.docx Plain Woven Upholstery Fabrics > Wool Broadcloth, Worsted, and Serge (paragraphs 20-28). 7/7 per A-7. replacement_likelihood HIGH per A-8 category default. NO regional_persistence_notes per D-UC38-9 strict canonical fidelity (seed says 'wealthier urban interiors' — urban not rural per Surfacing 3 discipline). maker_associations: [] per D-UC37-6.",
    name: "Wool Broadcloth, Worsted, and Serge",
    parent_category_id: "upholstery_cover_category_plain_woven_upholstery_fabrics",
    description: "Dense warm resilient wool upholstery fabric in plain, twill, or tightly worsted construction.",
    unique_traits: [
      "Dense, warm, resilient",
      "Can be plain, twill, or tightly worsted",
    ],
    identifying_characteristics: [
      "Slight nap",
      "Moth damage",
      "Felting",
      "Wool odor when damp",
      "Dark oxidation",
      "Abrasion on seat fronts and arms",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1600, usage_notes: "Strongest 17th to 19th century and revival/reproduction use." },
    ],
    date_range_summary: "1600s to present, strongest 17th to 19th century and revival/reproduction use.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    replacement_likelihood: "high",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-2: PATTERNED AND FIGURED UPHOLSTERY FABRICS (6 entries)
  // ═══════════════════════════════════════════════════════════
  {
    id: "upholstery_cover_type_damask",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Reversible figured-weave fabric with floral/scroll/pomegranate/acanthus/geometric motifs through satin-vs-matte contrast; 1600s-present with 17th-19th-century elite seating + later revival use multi-period; ERA-ANCHOR canonical-source rigor.",
    notes: "Per American_Furniture_Textile_Reference.docx Patterned and Figured Upholstery Fabrics > Damask (paragraphs 30-38). 8/8 era-anchor per A-7 (17th-19th century elite + Colonial/Victorian Revival multi-period). replacement_likelihood HIGH per A-8 category default. Multi-period period_associations per D-UC38-2 + Q5 Option J. style_associations populated per D-UC38-5 strict canonical fidelity (3+ style waves). maker_associations: [] per D-UC37-6.",
    name: "Damask",
    parent_category_id: "upholstery_cover_category_patterned_and_figured_upholstery_fabrics",
    description: "Reversible figured weave usually depicting floral, scroll, pomegranate, acanthus, or geometric motifs through satin-versus-matte contrast in the weave structure.",
    unique_traits: [
      "Reversible figured weave",
      "Pattern through weave structure (satin vs matte contrast)",
      "Floral, scroll, pomegranate, acanthus, or geometric motifs",
    ],
    identifying_characteristics: [
      "Large-scale repeating pattern",
      "Same pattern visible on both sides with inverted contrast",
      "Silk damask suggests elite older work; rayon damask 20th century; polyester damask with foam backing late 20th century",
    ],
    period_associations: [
      { period_label: "Elite high-style era", date_floor: 1600, date_ceiling: 1899, usage_notes: "17th to 19th century elite seating." },
      { period_label: "Revival era", date_floor: 1880, date_ceiling: 1940, usage_notes: "Colonial Revival and Victorian Revival upholstery." },
    ],
    date_range_summary: "1600s to present; especially 17th to 19th century elite seating and later revival use.",
    style_associations: [
      { style_label: "Colonial Revival", date_floor: 1880, date_ceiling: 1940, usage_notes: "Reproduction-market revival on high-style chairs, sofas, settees, parlor suites." },
      { style_label: "Victorian Revival", date_floor: 1860, date_ceiling: 1910, usage_notes: "Victorian-era reproduction wave." },
    ],
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    replacement_likelihood: "high",
    related_cover_types: ["upholstery_cover_type_jacquard", "upholstery_cover_type_brocade"],
  },
  {
    id: "upholstery_cover_type_brocade",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Supplementary-thread figured fabric with often raised/metallic/multicolor pattern and floating threads on reverse; 1700s-present multi-period across Empire/Rococo/Renaissance Revival/Victorian/Hollywood Regency.",
    notes: "Per American_Furniture_Textile_Reference.docx Patterned and Figured Upholstery Fabrics > Brocade (paragraphs 39-47). 8/8 era-anchor per A-7. replacement_likelihood HIGH per A-8 category default. Multi-period per D-UC38-2. style_associations 5+ style waves per D-UC38-5. maker_associations: [] per D-UC37-6.",
    name: "Brocade",
    parent_category_id: "upholstery_cover_category_patterned_and_figured_upholstery_fabrics",
    description: "Figured fabric with supplementary threads creating raised, metallic, or multicolor pattern with floating threads visible on the reverse.",
    unique_traits: [
      "Supplementary threads",
      "Often raised, metallic, or multicolor",
      "Floating threads on reverse",
    ],
    identifying_characteristics: [
      "Pattern stands out from ground weave",
      "Reverse shows floating threads",
      "Synthetic metallic yarns + bright polyester grounds suggest post-1950",
    ],
    period_associations: [
      { period_label: "Formal-use era", date_floor: 1700, date_ceiling: 1900, usage_notes: "Strongest formal use in 18th and 19th century interiors." },
      { period_label: "Revival era", date_floor: 1860, date_ceiling: 1960, usage_notes: "19th-century and later revival waves: Rococo Revival, Renaissance Revival, Hollywood Regency." },
    ],
    date_range_summary: "1700s to present; strongest formal use in 18th, 19th, and revival interiors.",
    style_associations: [
      { style_label: "Empire", date_floor: 1810, date_ceiling: 1845 },
      { style_label: "Rococo Revival", date_floor: 1840, date_ceiling: 1880 },
      { style_label: "Renaissance Revival", date_floor: 1860, date_ceiling: 1890 },
      { style_label: "Victorian", date_floor: 1860, date_ceiling: 1910 },
      { style_label: "Hollywood Regency", date_floor: 1930, date_ceiling: 1970 },
    ],
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    replacement_likelihood: "high",
    related_cover_types: ["upholstery_cover_type_damask", "upholstery_cover_type_jacquard"],
  },
  {
    id: "upholstery_cover_type_jacquard",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Jacquard-controlled loom fabric with complex woven pattern (may imitate damask, brocade, tapestry, matelassé); early 1800s+ industrial-introduction anchor.",
    notes: "Per American_Furniture_Textile_Reference.docx Patterned and Figured Upholstery Fabrics > Jacquard Upholstery (paragraphs 48-56). 8/8 industrial-introduction era-anchor per A-7 (mechanized Jacquard weaving). replacement_likelihood HIGH per A-8 category default. style_associations 4 style waves per D-UC38-5. maker_associations: [] per D-UC37-6.",
    name: "Jacquard Upholstery",
    parent_category_id: "upholstery_cover_category_patterned_and_figured_upholstery_fabrics",
    description: "Complex woven pattern produced by Jacquard-controlled loom (1801 Jacquard mechanism); may imitate damask, brocade, tapestry, or matelassé.",
    unique_traits: [
      "Jacquard-controlled loom production",
      "Complex woven pattern with high motif complexity",
      "Can imitate damask, brocade, tapestry, or matelassé",
    ],
    identifying_characteristics: [
      "Regular repeat with high pattern complexity",
      "Earlier examples may use wool, cotton, silk, or blends",
      "Rayon Jacquards suggest early-mid 20th century",
      "Polyester Jacquards generally post-1950",
    ],
    period_associations: [
      { period_label: "Industrial mechanized era", date_floor: 1800, usage_notes: "Major importance after mechanized Jacquard weaving (1801+)." },
    ],
    date_range_summary: "Early 1800s to present, with major importance after mechanized Jacquard weaving.",
    style_associations: [
      { style_label: "Victorian", date_floor: 1860, date_ceiling: 1910 },
      { style_label: "Eastlake", date_floor: 1870, date_ceiling: 1895 },
      { style_label: "Renaissance Revival", date_floor: 1860, date_ceiling: 1890 },
      { style_label: "Colonial Revival", date_floor: 1880, date_ceiling: 1940 },
    ],
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    replacement_likelihood: "high",
    related_cover_types: ["upholstery_cover_type_damask", "upholstery_cover_type_brocade"],
  },
  {
    id: "upholstery_cover_type_tapestry",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Heavy pictorial/floral woven fabric with dense face and muted colors; 1700s-present with 19th-early-20th-century revival peak across Victorian/Renaissance/Gothic/Jacobean Revival contexts.",
    notes: "Per American_Furniture_Textile_Reference.docx Patterned and Figured Upholstery Fabrics > Tapestry Upholstery (paragraphs 57-65). 7/7 per A-7. replacement_likelihood HIGH per A-8 category default. Multi-period per D-UC38-2. style_associations 5 style waves per D-UC38-5. maker_associations: [] per D-UC37-6.",
    name: "Tapestry Upholstery",
    parent_category_id: "upholstery_cover_category_patterned_and_figured_upholstery_fabrics",
    description: "Heavy pictorial or floral woven fabric (wool / cotton / blended) with dense face and muted colors imitating tapestry-weaving aesthetic.",
    unique_traits: [
      "Heavy pictorial or floral weave",
      "Often wool, cotton, or blended fiber",
      "Dense face with muted colors",
    ],
    identifying_characteristics: [
      "Pictorial / floral motif rendering",
      "Heavy hand vs lighter damask/brocade",
      "Muted color palette",
      "Muted naturalistic floral tapestry fits late 19th-early 20th century; machine tapestry with synthetic backing later 20th century",
    ],
    period_associations: [
      { period_label: "Continuous formal use", date_floor: 1700, date_ceiling: 1899, usage_notes: "1700s-19th century formal context." },
      { period_label: "Revival peak", date_floor: 1860, date_ceiling: 1920, usage_notes: "19th century to early 20th century revival furniture peak." },
    ],
    date_range_summary: "1700s to present; especially 19th century to early 20th century revival furniture.",
    style_associations: [
      { style_label: "Victorian", date_floor: 1860, date_ceiling: 1910 },
      { style_label: "Renaissance Revival", date_floor: 1860, date_ceiling: 1890 },
      { style_label: "Gothic Revival", date_floor: 1830, date_ceiling: 1900 },
      { style_label: "Jacobean Revival", date_floor: 1900, date_ceiling: 1940 },
      { style_label: "Medieval Revival", date_floor: 1880, date_ceiling: 1930, usage_notes: "Medieval revival designs often support Gothic or Renaissance Revival context." },
    ],
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    replacement_likelihood: "high",
  },
  {
    id: "upholstery_cover_type_turkey_work",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Wool pile rug-like textile imitating Oriental carpet effects on early colonial high-style chairs; 1600s-early-1700s strongest with revival examples later; LOW replacement_likelihood override per canonical-source rarity.",
    notes: "Per American_Furniture_Textile_Reference.docx Patterned and Figured Upholstery Fabrics > Turkey Work (paragraphs 66-74). 8/8 tight era anchor per A-7 (1600s-early-1700s strongest). replacement_likelihood LOW override per D-FA34-3 notes-field-marker — canonical-source rigor: 'Original turkey work on American furniture is rare. Presence should be treated carefully because many examples are later restoration or museum-grade reproduction.' Multi-period per D-UC38-2. maker_associations: [] per D-UC37-6.",
    name: "Turkey Work",
    parent_category_id: "upholstery_cover_category_patterned_and_figured_upholstery_fabrics",
    description: "Wool pile textile imitating Oriental carpet effects through rug-like knotted construction on early colonial high-style chairs.",
    unique_traits: [
      "Wool pile textile",
      "Rug-like knotted construction",
      "Imitates Oriental carpet effects",
    ],
    identifying_characteristics: [
      "Knotted pile visible on face",
      "Heavy rug-like hand",
      "Geometric or floral motifs in carpet aesthetic",
      "Original American examples extremely rare",
    ],
    period_associations: [
      { period_label: "Strongest era", date_floor: 1600, date_ceiling: 1729, usage_notes: "1600s to early 1700s strongest on colonial high-style chairs." },
      { period_label: "Revival era", date_floor: 1880, date_ceiling: 1940, usage_notes: "Revival examples later; many surviving examples are reproduction or museum-grade." },
    ],
    date_range_summary: "1600s to early 1700s strongest; revival examples later.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    replacement_likelihood: "low",
  },
  {
    id: "upholstery_cover_type_needlework",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Hand-worked decorative stitching over ground fabric with visible individual stitches; 1600s-present with strongest 17th-19th-century domestic + high-style covers and Colonial Revival later use.",
    notes: "Per American_Furniture_Textile_Reference.docx Patterned and Figured Upholstery Fabrics > Needlework, Needlepoint, Crewel, and Embroidered Covers (paragraphs 75-83). 7/7 per A-7. replacement_likelihood HIGH per A-8 category default. Multi-period per D-UC38-2. style_associations 1 explicit style wave per D-UC38-5. maker_associations: [] per D-UC37-6.",
    name: "Needlework, Needlepoint, Crewel, and Embroidered Covers",
    parent_category_id: "upholstery_cover_category_patterned_and_figured_upholstery_fabrics",
    description: "Hand-worked decorative stitching over ground fabric (canvas / linen / cotton) with visible individual stitches in needlepoint, crewel, or embroidered technique.",
    unique_traits: [
      "Hand-worked decorative stitching",
      "Ground fabric base (canvas / linen / cotton)",
      "Visible individual stitches",
    ],
    identifying_characteristics: [
      "Stitch direction and density visible on face",
      "Ground fabric visible at edges or wear points",
      "Color palette consistent with hand-dye era",
      "Genteel domestic and urban settings common; also strong in Colonial Revival interiors",
    ],
    period_associations: [
      { period_label: "Domestic / high-style era", date_floor: 1600, date_ceiling: 1899, usage_notes: "Strongest 17th-19th century domestic or high-style covers." },
      { period_label: "Colonial Revival era", date_floor: 1880, date_ceiling: 1940, usage_notes: "Colonial Revival reproduction wave on chair seats, fire screens, piano benches, formal occasional chairs." },
    ],
    date_range_summary: "1600s to present; strongest as domestic or high-style covers from 17th through 19th century, with Colonial Revival use later.",
    style_associations: [
      { style_label: "Colonial Revival", date_floor: 1880, date_ceiling: 1940, usage_notes: "Reproduction-market revival on chair seats + fire screens + piano benches." },
    ],
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    replacement_likelihood: "high",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-3: PILE FABRICS (4 entries)
  // ═══════════════════════════════════════════════════════════
  {
    id: "upholstery_cover_type_velvet",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Dense upright pile fabric with soft hand + strong directional nap + rich light absorption; 1600s-present multi-period across Empire/Rococo/Renaissance Revival/Eastlake/Art Deco/Hollywood Regency.",
    notes: "Per American_Furniture_Textile_Reference.docx Pile Fabrics > Velvet (paragraphs 85-93). 8/8 era-anchor multi-period per A-7. replacement_likelihood HIGH per A-8. Multi-period per D-UC38-2. style_associations 6 style waves per D-UC38-5 (densest style coverage of any covers type). maker_associations: [] per D-UC37-6.",
    name: "Velvet",
    parent_category_id: "upholstery_cover_category_pile_fabrics",
    description: "Dense upright pile fabric with soft hand and strong directional nap producing rich light absorption.",
    unique_traits: [
      "Dense upright pile",
      "Soft hand",
      "Strong directional nap",
      "Rich light absorption",
    ],
    identifying_characteristics: [
      "Upright fiber pile visible at angle",
      "Nap-direction shading",
      "Silk velvet luxurious sheen; cotton velvet soft matte; rayon velvet early-mid 20th century; synthetic velvet mostly post-1950",
    ],
    period_associations: [
      { period_label: "Formal-use continuous era", date_floor: 1600, usage_notes: "Formal upholstery from 1600s." },
      { period_label: "Multi-revival era", date_floor: 1800, date_ceiling: 1970, usage_notes: "Empire / Rococo Revival / Renaissance Revival / Eastlake / Art Deco / Hollywood Regency revival waves." },
    ],
    date_range_summary: "1600s to present; especially formal 18th, 19th, and revival upholstery.",
    style_associations: [
      { style_label: "Empire", date_floor: 1810, date_ceiling: 1845 },
      { style_label: "Rococo Revival", date_floor: 1840, date_ceiling: 1880 },
      { style_label: "Renaissance Revival", date_floor: 1860, date_ceiling: 1890 },
      { style_label: "Eastlake", date_floor: 1870, date_ceiling: 1895 },
      { style_label: "Art Deco", date_floor: 1925, date_ceiling: 1945 },
      { style_label: "Hollywood Regency", date_floor: 1930, date_ceiling: 1970 },
    ],
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    replacement_likelihood: "high",
    related_cover_types: ["upholstery_cover_type_plush", "upholstery_cover_type_mohair_velvet", "upholstery_cover_type_velour"],
  },
  {
    id: "upholstery_cover_type_plush",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Longer-pile fabric than velvet with heavy soft luxurious hand and directional shading; mid-1800s-early-1900s strongest with later revival/novelty use; Victorian/Eastlake/Renaissance Revival.",
    notes: "Per American_Furniture_Textile_Reference.docx Pile Fabrics > Plush (paragraphs 94-102). 7/7 per A-7. replacement_likelihood HIGH per A-8. Multi-period per D-UC38-2. style_associations 3 style waves per D-UC38-5. maker_associations: [] per D-UC37-6.",
    name: "Plush",
    parent_category_id: "upholstery_cover_category_pile_fabrics",
    description: "Pile fabric with longer pile than velvet producing heavy, soft, luxurious hand with thick directional shading.",
    unique_traits: [
      "Longer pile than velvet",
      "Heavy, soft, luxurious hand",
      "Thick pile directional shading",
    ],
    identifying_characteristics: [
      "Pile length longer than velvet (visible to touch)",
      "Heavier hand than velvet",
      "Deep red, green, gold, or brown plush on Victorian frames may fit 1870s-1890s",
    ],
    period_associations: [
      { period_label: "Strongest era", date_floor: 1840, date_ceiling: 1910, usage_notes: "Mid-1800s to early 1900s strongest on Victorian parlor furniture." },
      { period_label: "Revival use", date_floor: 1910, usage_notes: "Later revival and novelty use." },
    ],
    date_range_summary: "Mid-1800s to early 1900s strongest; later revival and novelty use.",
    style_associations: [
      { style_label: "Victorian", date_floor: 1860, date_ceiling: 1910 },
      { style_label: "Eastlake", date_floor: 1870, date_ceiling: 1895 },
      { style_label: "Renaissance Revival", date_floor: 1860, date_ceiling: 1890 },
    ],
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    replacement_likelihood: "high",
    related_cover_types: ["upholstery_cover_type_velvet", "upholstery_cover_type_mohair_velvet"],
  },
  {
    id: "upholstery_cover_type_mohair_velvet",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Mohair-fiber pile velvet — more resilient and lustrous than cotton velvet + crush-resistant; late-1800s-present with Mission/Arts and Crafts/Art Deco/office/high-grade 20th-century upholstery anchor.",
    notes: "Per American_Furniture_Textile_Reference.docx Pile Fabrics > Mohair Velvet (paragraphs 103-111). 8/8 tight-era anchor per A-7. replacement_likelihood HIGH per A-8. Multi-period per D-UC38-2. style_associations 3 style waves per D-UC38-5. maker_associations: [] per D-UC37-6.",
    name: "Mohair Velvet",
    parent_category_id: "upholstery_cover_category_pile_fabrics",
    description: "Pile velvet woven from mohair (angora goat fiber) producing resilient lustrous surface resistant to crushing.",
    unique_traits: [
      "Mohair fiber pile",
      "More resilient than cotton velvet",
      "Lustrous surface",
      "Resistant to crushing",
    ],
    identifying_characteristics: [
      "Lustrous sheen vs cotton velvet matte",
      "Crush-resistance distinctive",
      "Olive, brown, rust, deep green, burgundy mohair fits early-20th-century Arts and Crafts or library contexts",
    ],
    period_associations: [
      { period_label: "Arts and Crafts era", date_floor: 1900, date_ceiling: 1920, usage_notes: "Mission seating + Morris chairs + Arts and Crafts library contexts." },
      { period_label: "Art Deco + 20th-century commercial era", date_floor: 1925, usage_notes: "Art Deco chairs + theater seating + office chairs + high-quality sofas." },
    ],
    date_range_summary: "Late 1800s to present; especially Arts and Crafts, Art Deco, office, and high-grade 20th-century upholstery.",
    style_associations: [
      { style_label: "Mission", date_floor: 1900, date_ceiling: 1920, usage_notes: "Morris chairs + Arts and Crafts library context." },
      { style_label: "Arts and Crafts", date_floor: 1895, date_ceiling: 1920 },
      { style_label: "Art Deco", date_floor: 1925, date_ceiling: 1945 },
    ],
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    replacement_likelihood: "high",
    related_cover_types: ["upholstery_cover_type_velvet", "upholstery_cover_type_plush"],
  },
  {
    id: "upholstery_cover_type_velour",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Soft pile fabric less formal than velvet; cotton, rayon, or synthetic construction; late-1800s-present strongest mid-20th-century onward.",
    notes: "Per American_Furniture_Textile_Reference.docx Pile Fabrics > Velour (paragraphs 112-120). 7/7 per A-7. replacement_likelihood HIGH per A-8. Single-period per A-5 (one era emphasis). maker_associations: [] per D-UC37-6.",
    name: "Velour",
    parent_category_id: "upholstery_cover_category_pile_fabrics",
    description: "Soft pile fabric less formal than velvet; constructed from cotton, rayon, or synthetic fiber.",
    unique_traits: [
      "Soft pile fabric",
      "Less formal than velvet",
      "May be cotton, rayon, or synthetic",
    ],
    identifying_characteristics: [
      "Shorter and less directional pile than velvet",
      "Mid-20th century onward dominant",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1900, usage_notes: "Strongest mid-20th century onward." },
    ],
    date_range_summary: "Early 1900s to present; strongest mid-20th century onward.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    replacement_likelihood: "high",
    related_cover_types: ["upholstery_cover_type_velvet", "upholstery_cover_type_plush"],
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-4: HAIRCLOTH, HORSEHAIR, AND ANIMAL-HAIR FABRICS (2 entries)
  // ═══════════════════════════════════════════════════════════
  {
    id: "upholstery_cover_type_haircloth_horsehair",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Stiff glossy slick woven fabric with horsehair weft and wool/cotton warp; 1700s-early-1900s strongest; 19th-century formal urban + middle-class household context.",
    notes: "Per American_Furniture_Textile_Reference.docx Haircloth, Horsehair, and Animal-Hair Fabrics > Haircloth / Horsehair Upholstery (paragraphs 122-130). 7/7 per A-7. replacement_likelihood MEDIUM per A-8 category default. NO regional_persistence_notes per D-UC38-9 strict canonical fidelity (urban context, not rural). maker_associations: [] per D-UC37-6.",
    name: "Haircloth / Horsehair Upholstery",
    parent_category_id: "upholstery_cover_category_haircloth_horsehair_and_animal_hair_fabrics",
    description: "Stiff glossy slick fabric woven with horsehair weft and wool or cotton warp, typically dark brown or black.",
    unique_traits: [
      "Stiff glossy slick fabric",
      "Horsehair weft",
      "Wool or cotton warp",
      "Usually dark brown or black",
    ],
    identifying_characteristics: [
      "Very smooth shiny surface",
      "Stiff hand",
      "Ribbed texture",
      "Brittle splitting at folds",
      "Prickly broken hairs",
    ],
    period_associations: [
      { period_label: "Primary use", date_floor: 1700, date_ceiling: 1929, usage_notes: "Strongest 18th, 19th, and early 20th century formal seating." },
    ],
    date_range_summary: "1700s to early 1900s strongest; occasional later restoration use.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    replacement_likelihood: "medium",
  },
  {
    id: "upholstery_cover_type_camel_goat_hair_blends",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Animal-hair blend fabric (camel/goat/other hair) with firm hand + subtle luster + coarse fiber + muted natural colors; 1800s-present specialty or blend use.",
    notes: "Per American_Furniture_Textile_Reference.docx Haircloth, Horsehair, and Animal-Hair Fabrics > Camel Hair, Goat Hair, and Other Hair Blends (paragraphs 131-139). 7/7 per A-7. replacement_likelihood MEDIUM per A-8 category default. maker_associations: [] per D-UC37-6.",
    name: "Camel Hair, Goat Hair, and Other Hair Blends",
    parent_category_id: "upholstery_cover_category_haircloth_horsehair_and_animal_hair_fabrics",
    description: "Durable animal-hair-blend fabric using camel hair, goat hair, or other animal hairs with firm hand and subtle luster.",
    unique_traits: [
      "Durable animal-hair yarns",
      "Firm hand",
      "Subtle luster",
    ],
    identifying_characteristics: [
      "Coarse fiber",
      "Muted natural colors",
      "Stiff abrasion-resistant face",
    ],
    period_associations: [
      { period_label: "Continuous specialty use", date_floor: 1800, usage_notes: "Usually specialty or blend use." },
    ],
    date_range_summary: "1800s to present, usually specialty or blend use.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    replacement_likelihood: "medium",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-5: PRINTED UPHOLSTERY AND SLIP FABRICS (3 entries)
  // ═══════════════════════════════════════════════════════════
  {
    id: "upholstery_cover_type_chintz",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Glazed printed cotton fabric — often floral, colorful, decorative — with glazed/waxy finish; 1700s-present multi-period with late-19th + 20th-century revival waves; Cottage + Colonial Revival contexts.",
    notes: "Per American_Furniture_Textile_Reference.docx Printed Upholstery and Slip Fabrics > Chintz (paragraphs 141-149). 7/7 per A-7. replacement_likelihood HIGH per A-8 category default. Multi-period per D-UC38-2. style_associations 2 style contexts per D-UC38-5. maker_associations: [] per D-UC37-6.",
    name: "Chintz",
    parent_category_id: "upholstery_cover_category_printed_upholstery_and_slip_fabrics",
    description: "Glazed printed cotton fabric with floral or decorative printing on glazed waxy finish.",
    unique_traits: [
      "Glazed printed cotton",
      "Often floral, colorful, decorative",
      "Glazed/waxy finish",
    ],
    identifying_characteristics: [
      "Surface glaze visible (waxy or shiny finish)",
      "Hand-blocked irregularity = earlier work; roller-printed regularity = 19th century; plastic-like glaze = modern decorator fabric",
    ],
    period_associations: [
      { period_label: "Colonial use", date_floor: 1700, date_ceiling: 1880, usage_notes: "1700s baseline use through 19th century domestic." },
      { period_label: "Revival eras", date_floor: 1880, usage_notes: "Major revival use in late 19th and 20th centuries; Colonial Revival and cottage contexts." },
    ],
    date_range_summary: "1700s to present; major revival use in late 19th and 20th centuries.",
    style_associations: [
      { style_label: "Cottage", date_floor: 1880, usage_notes: "Cottage and country interiors." },
      { style_label: "Colonial Revival", date_floor: 1880, date_ceiling: 1940 },
    ],
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    replacement_likelihood: "high",
    related_cover_types: ["upholstery_cover_type_toile"],
  },
  {
    id: "upholstery_cover_type_toile",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Printed pastoral/scenic pattern usually monochrome on light ground; late-1700s-present with Colonial Revival + French Provincial revival waves and late-20th-century country/French interiors.",
    notes: "Per American_Furniture_Textile_Reference.docx Printed Upholstery and Slip Fabrics > Toile (paragraphs 150-158). 7/7 per A-7. replacement_likelihood HIGH per A-8 category default. Multi-period per D-UC38-2. style_associations 2 style waves per D-UC38-5. maker_associations: [] per D-UC37-6.",
    name: "Toile",
    parent_category_id: "upholstery_cover_category_printed_upholstery_and_slip_fabrics",
    description: "Printed pastoral or scenic pattern usually rendered monochrome on light ground; common French Toile de Jouy aesthetic.",
    unique_traits: [
      "Printed pastoral/scenic pattern",
      "Usually monochrome on light ground",
      "Pictorial composition",
    ],
    identifying_characteristics: [
      "Monochrome pictorial print (blue, red, sepia on cream/white)",
      "Pastoral scenes + figural compositions",
      "Toile on older frame usually = later re-covering per canonical reproduction-market dynamics",
    ],
    period_associations: [
      { period_label: "Original era", date_floor: 1770, date_ceiling: 1850 },
      { period_label: "Revival surges", date_floor: 1880, usage_notes: "Popularity surges late 19th century, mid-20th century, late-20th-century country/French interiors." },
    ],
    date_range_summary: "Late 1700s to present; strong Colonial Revival and French Provincial revival use.",
    style_associations: [
      { style_label: "Colonial Revival", date_floor: 1880, date_ceiling: 1940 },
      { style_label: "French Provincial Revival", date_floor: 1900 },
    ],
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    replacement_likelihood: "high",
    related_cover_types: ["upholstery_cover_type_chintz"],
  },
  {
    id: "upholstery_cover_type_ticking",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Striped or check pattern cotton or linen fabric — sturdy utility mattress/pillow cover; 1700s-present strong in rustic/vernacular/utilitarian settings.",
    notes: "Per American_Furniture_Textile_Reference.docx Printed Upholstery and Slip Fabrics > Ticking (paragraphs 159-167). 7/7 per A-7. replacement_likelihood HIGH per A-8 category default. maker_associations: [] per D-UC37-6.",
    name: "Ticking",
    parent_category_id: "upholstery_cover_category_printed_upholstery_and_slip_fabrics",
    description: "Durable striped or check pattern cotton or linen fabric originally associated with mattresses and utility covers.",
    unique_traits: [
      "Durable striped or check pattern",
      "Cotton or linen fiber",
      "Sturdy mattress/pillow cover utility",
    ],
    identifying_characteristics: [
      "Narrow blue, brown, black, or red stripes",
      "Dense twill or plain weave",
      "Utilitarian feel",
    ],
    period_associations: [
      { period_label: "Continuous utility use", date_floor: 1700, usage_notes: "Common in rural, vernacular, and utilitarian settings." },
    ],
    date_range_summary: "1700s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_dust_cover"],
    replacement_likelihood: "high",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-6: LEATHER AND SKIN UPHOLSTERY (3 entries; 1 AG)
  // ═══════════════════════════════════════════════════════════
  {
    id: "upholstery_cover_type_full_grain_top_grain_leather",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Animal-hide upholstery (full-grain or top-grain) with grain visible; 1600s-present with strong colonial / Federal / Spanish Colonial / Dutch-influenced / Mission associations.",
    notes: "Per American_Furniture_Textile_Reference.docx Leather and Skin Upholstery > Full-Grain and Top-Grain Leather (paragraphs 169-177). 7/7 per A-7. replacement_likelihood MEDIUM per A-8 category default (period leather may survive). style_associations 2 style waves per D-UC38-5. maker_associations: [] per D-UC37-6.",
    name: "Full-Grain and Top-Grain Leather",
    parent_category_id: "upholstery_cover_category_leather_and_skin_upholstery",
    description: "Animal hide upholstery with grain visible at surface; stretches and creases with use; full-grain retains hair-side intact, top-grain has lightly sanded surface.",
    unique_traits: [
      "Animal hide surface",
      "Grain visible",
      "Stretches and creases with use",
    ],
    identifying_characteristics: [
      "Random natural grain pattern (vs uniform vinyl)",
      "Raw-cut leather edges",
      "Patina and creasing consistent with use age",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1600, usage_notes: "Strong colonial through Mission and modern contexts." },
    ],
    date_range_summary: "1600s to present.",
    style_associations: [
      { style_label: "Spanish Colonial", date_floor: 1600, date_ceiling: 1800 },
      { style_label: "Mission", date_floor: 1900, date_ceiling: 1920 },
    ],
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    replacement_likelihood: "medium",
    related_cover_types: ["upholstery_cover_type_embossed_tooled_gilt_leather", "upholstery_cover_type_vinyl_naugahyde_faux_leather"],
  },
  {
    id: "upholstery_cover_type_embossed_tooled_gilt_leather",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Decoratively-worked leather with embossed/tooled/gilt surface decoration; 1600s-present strongest in Spanish Colonial / Southwest / California Mission / Renaissance Revival high-style luxury contexts.",
    notes: "Per American_Furniture_Textile_Reference.docx Leather and Skin Upholstery > Embossed, Tooled, or Gilt Leather (paragraphs 178-186). 7/7 per A-7 (style-rich but no AG-anchor or industrial-introduction era-anchor; medium-strong canonical rationale). replacement_likelihood MEDIUM per A-8 category default. style_associations 3 style waves per D-UC38-5. maker_associations: [] per D-UC37-6.",
    name: "Embossed, Tooled, or Gilt Leather",
    parent_category_id: "upholstery_cover_category_leather_and_skin_upholstery",
    description: "Decoratively-worked leather with surface decoration worked into or onto the hide via embossing, tooling, burnishing, painting, or gilt application; formal symmetry common.",
    unique_traits: [
      "Decoration worked into/onto leather",
      "Burnished, painted, or gilded surface",
      "Formal symmetry common",
    ],
    identifying_characteristics: [
      "Embossing depth visible at angle",
      "Tooling lines in regular patterns",
      "Gilt application at decorative motifs",
      "Stronger in Spanish Colonial, Southwest, California Mission, and Renaissance Revival contexts",
    ],
    period_associations: [
      { period_label: "Continuous high-style use", date_floor: 1600, usage_notes: "Especially high-style and luxury upholstery." },
    ],
    date_range_summary: "1600s to present.",
    style_associations: [
      { style_label: "Spanish Colonial", date_floor: 1600, date_ceiling: 1800 },
      { style_label: "Renaissance Revival", date_floor: 1860, date_ceiling: 1890 },
      { style_label: "California Mission", date_floor: 1890, date_ceiling: 1920 },
    ],
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    replacement_likelihood: "medium",
    related_cover_types: ["upholstery_cover_type_full_grain_top_grain_leather"],
  },
  {
    id: "upholstery_cover_type_vinyl_naugahyde_faux_leather",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Synthetic coated fabric imitating leather (flexible, wipeable, often uniform grain); AG floor 1930s+ industrial-introduction era per D-HW36-15 decade-range interpretation discipline.",
    notes: "Per American_Furniture_Textile_Reference.docx Leather and Skin Upholstery > Vinyl, Naugahyde, and Faux Leather (paragraphs 187-195). 8/8 AG anchor per A-7. replacement_likelihood HIGH per A-8 category default. AG floor 1930 per D-UC38-4 + D-HW36-15 decade-range discipline (seed canonical phrasing '1930s to present'; 1930 selected as conservative decade-floor anchor with notes-field marker per D-FA34-3). maker_associations: [] per D-UC37-6.",
    name: "Vinyl, Naugahyde, and Faux Leather",
    parent_category_id: "upholstery_cover_category_leather_and_skin_upholstery",
    description: "Synthetic coated fabric imitating leather appearance — flexible, wipeable, often uniform grain on woven or non-woven backing.",
    unique_traits: [
      "Synthetic coated fabric",
      "Imitating leather appearance",
      "Flexible and wipeable",
      "Often uniform grain pattern",
    ],
    identifying_characteristics: [
      "Uniform repeating grain (vs random natural leather grain)",
      "Surface coating may crack or peel with age",
      "Folded-and-stitched edges (vs raw-cut leather)",
      "Red, turquoise, yellow, white, or black vinyl often supports 1940s-1960s diner or mid-century contexts",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1930, usage_notes: "Seed canonical phrasing '1930s to present' — 1930 selected as conservative decade-floor anchor per D-HW36-15 decade-range interpretation discipline." },
    ],
    date_range_summary: "1930s to present; strongest after 1940s.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    anti_classification_guidance: {
      boundary_date: 1930,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1930 presence of Vinyl/Naugahyde/Faux Leather indicates either repair-introduction (Replacement Likelihood Cover-Specific + Cover Revival Warning per UpholsteryCoverReasoningRule #2 + #6) or misidentification; this synthetic coated fabric did not exist in pre-1930 original construction. Seed canonical phrasing '1930s to present' — 1930 conservative decade-floor anchor per D-HW36-15 decade-range interpretation discipline + D-FA34-3 notes-field-marker precedent. Strongest after 1940s in diner, office, mid-century commercial seating contexts.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
    related_cover_types: ["upholstery_cover_type_full_grain_top_grain_leather"],
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-7: CANVAS, WEBBING, AND TEXTILE SUPPORT (4 entries; 4 cross-library FK forward-references)
  // ═══════════════════════════════════════════════════════════
  {
    id: "upholstery_cover_type_stretched_canvas",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Heavy plain-woven cotton/linen/hemp canvas stretched across frame; 1700s-present support/campaign/folding/industrial/casual furniture textile.",
    notes: "Per American_Furniture_Textile_Reference.docx Canvas, Webbing, and Textile Support Surfaces > Stretched Canvas Seat or Back (paragraphs 197-205). 7/7 per A-7. replacement_likelihood MEDIUM per A-8 category default. **related_construction_types FORWARD-REFERENCE REMOVED at Block 40** per D-UCN39-13 + D-UC40-14 appraiser-honest-discipline-supersedes-FK-completion convention (FIRST application): the construction section of American_Furniture_Textile_Reference.docx has NO dedicated canvas construction type — canvas appears only as a contrast-point mention (construction paragraph 472, 'differs from canvas because it is strap-based'). Rather than author a content-thin canvas_foundation construction entry purely to satisfy this forward-reference, the unwarranted FK is removed. maker_associations: [] per D-UC37-6.",
    name: "Stretched Canvas Seat or Back",
    parent_category_id: "upholstery_cover_category_canvas_webbing_and_textile_support_surfaces",
    description: "Heavy plain-woven cotton, linen, or hemp canvas stretched across frame as functional seat or back surface.",
    unique_traits: [
      "Heavy plain-woven cotton, linen, or hemp",
      "Stretched across frame",
      "Structural cloth function",
    ],
    identifying_characteristics: [
      "Tacked, nailed, laced, or screwed to frame",
      "Sagging center on aged examples",
      "Stress tears at corners",
      "Often painted, waxed, or dirty",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1700, usage_notes: "Strongest as support, campaign, folding, industrial, and casual furniture textile." },
    ],
    date_range_summary: "1700s to present; strongest as support, campaign, folding, industrial, and casual furniture textile.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_support_layer"],
    replacement_likelihood: "medium",
  },
  {
    id: "upholstery_cover_type_upholstery_webbing",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Interlaced textile straps supporting upholstery foundation (jute/linen/cotton/rubberized/synthetic); 1700s-present universal in upholstered furniture; cross-library FK forward-reference to upholsteryConstruction.ts.",
    notes: "Per American_Furniture_Textile_Reference.docx Canvas, Webbing, and Textile Support Surfaces > Upholstery Webbing (paragraphs 206-214). 7/7 per A-7. replacement_likelihood MEDIUM per A-8 category default. **related_construction_types FORWARD-REFERENCE RESOLVED at Block 40** per D-UC38-7 + D-UC40-15: aligned to natural id upholstery_construction_type_linen_hemp_jute_webbing. maker_associations: [] per D-UC37-6.",
    name: "Upholstery Webbing",
    parent_category_id: "upholstery_cover_category_canvas_webbing_and_textile_support_surfaces",
    description: "Interlaced textile straps supporting upholstery foundation in jute, linen, cotton, rubberized, or synthetic construction.",
    unique_traits: [
      "Interlaced textile straps",
      "Supports upholstery foundation",
      "Universal in upholstered furniture",
    ],
    identifying_characteristics: [
      "Jute, linen, cotton, rubberized, or synthetic strap material",
      "Tacked or stapled to frame",
      "Woven crisscross support pattern",
      "Hand-tacked jute supports 19th or early 20th century work; staples indicate later repair",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1700, usage_notes: "Universal in upholstered furniture; jute common in traditional upholstery." },
    ],
    date_range_summary: "1700s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_support_layer", "upholstery_attachment_point"],
    replacement_likelihood: "medium",
    related_construction_types: ["upholstery_construction_type_linen_hemp_jute_webbing"],
  },
  {
    id: "upholstery_cover_type_burlap_hessian",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Coarse jute fabric used as upholstery foundation / dust layer / support; 1800s-present open weave tan/brown; cross-library FK forward-reference to upholsteryConstruction.ts.",
    notes: "Per American_Furniture_Textile_Reference.docx Canvas, Webbing, and Textile Support Surfaces > Burlap / Hessian (paragraphs 215-223). 7/7 per A-7. replacement_likelihood MEDIUM per A-8 category default. **related_construction_types FORWARD-REFERENCE RESOLVED at Block 40** per D-UC38-7 + D-UC40-15: aligned to natural id upholstery_construction_type_burlap_hessian_over_springs. maker_associations: [] per D-UC37-6.",
    name: "Burlap / Hessian",
    parent_category_id: "upholstery_cover_category_canvas_webbing_and_textile_support_surfaces",
    description: "Coarse jute fabric used as upholstery foundation, dust layer, or support with open weave and tan/brown coloring.",
    unique_traits: [
      "Coarse jute fabric",
      "Upholstery foundation / dust layer / support function",
      "Open weave",
      "Tan/brown coloring",
    ],
    identifying_characteristics: [
      "Coarse open weave visible",
      "Brown jute color",
      "Foundation position under decorative covers",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1800 },
    ],
    date_range_summary: "1800s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_support_layer"],
    replacement_likelihood: "medium",
    related_construction_types: ["upholstery_construction_type_burlap_hessian_over_springs"],
  },
  {
    id: "upholstery_cover_type_muslin_cambric_dust_cover",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Lightweight plain-woven cotton bottom dust cover or inner lining; 1800s-present; cross-library FK forward-reference to upholsteryConstruction.ts.",
    notes: "Per American_Furniture_Textile_Reference.docx Canvas, Webbing, and Textile Support Surfaces > Muslin and Cambric Dust Cover (paragraphs 224-232). 7/7 per A-7. replacement_likelihood MEDIUM per A-8 category default. **related_construction_types FORWARD-REFERENCE RESOLVED at Block 40** per D-UC38-7 + D-UC40-15: aligned to natural id upholstery_construction_type_muslin_cambric. maker_associations: [] per D-UC37-6.",
    name: "Muslin and Cambric Dust Cover",
    parent_category_id: "upholstery_cover_category_canvas_webbing_and_textile_support_surfaces",
    description: "Lightweight plain-woven cotton fabric used as bottom dust cover or inner lining on upholstered furniture.",
    unique_traits: [
      "Lightweight plain-woven cotton",
      "Bottom dust cover function",
      "Inner lining function",
    ],
    identifying_characteristics: [
      "Lightweight tight cotton weave",
      "Position on bottom of upholstered piece",
      "Often tacked or stapled to bottom rails",
      "Black synthetic cambric dust covers point 20th-century or later upholstery campaigns per Rule #4",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1800 },
    ],
    date_range_summary: "1800s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_dust_cover"],
    replacement_likelihood: "medium",
    related_construction_types: ["upholstery_construction_type_muslin_cambric"],
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-8: CANE, RUSH, SPLINT, AND WOVEN SEAT MATERIALS (7 entries; 1 AG; 4 regional_persistence)
  // ═══════════════════════════════════════════════════════════
  {
    id: "upholstery_cover_type_hand_cane_strand_cane",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Hand-woven thin strips from rattan outer bark through holes in seat rail; 1650s-present Colonial / Federal / Victorian / contemporary reproduction.",
    notes: "Per American_Furniture_Textile_Reference.docx Cane, Rush, Splint, and Woven Seat Materials > Hand Cane / Strand Cane (paragraphs 234-242). 7/7 per A-7. replacement_likelihood HIGH per A-8 category default. maker_associations: [] per D-UC37-6.",
    name: "Hand Cane / Strand Cane",
    parent_category_id: "upholstery_cover_category_cane_rush_splint_and_woven_seat_materials",
    description: "Thin strips from rattan outer bark hand-woven through holes drilled in seat rail.",
    unique_traits: [
      "Rattan outer bark strips",
      "Hand-woven through holes in seat rail",
      "Octagonal-hole weave pattern",
    ],
    identifying_characteristics: [
      "Glossy rattan-bark cane",
      "Octagonal-hole pattern through holes in seat rail",
      "Broken cane at front rail signals age",
    ],
    period_associations: [
      { period_label: "Continuous use", date_floor: 1650, usage_notes: "Strongest 18th, 19th, and revival contexts." },
    ],
    date_range_summary: "1650s to present; strongest 18th, 19th, and revival contexts.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat"],
    replacement_likelihood: "high",
    related_cover_types: ["upholstery_cover_type_pressed_cane_sheet_cane"],
  },
  {
    id: "upholstery_cover_type_pressed_cane_sheet_cane",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Machine-pressed rattan or paper cane in pre-woven sheet form; late-1800s-present Late Victorian / Arts and Crafts / contemporary.",
    notes: "Per American_Furniture_Textile_Reference.docx Cane, Rush, Splint, and Woven Seat Materials > Pressed Cane / Sheet Cane (paragraphs 243-251). 7/7 per A-7. replacement_likelihood HIGH per A-8 category default. maker_associations: [] per D-UC37-6.",
    name: "Pressed Cane / Sheet Cane",
    parent_category_id: "upholstery_cover_category_cane_rush_splint_and_woven_seat_materials",
    description: "Machine-pressed rattan or paper cane in pre-woven sheet form installed in groove around seat opening.",
    unique_traits: [
      "Machine-pressed rattan or paper cane",
      "Pre-woven sheet form",
      "Industrial-era introduction",
    ],
    identifying_characteristics: [
      "Pre-woven sheet with regular machine pattern",
      "Installed in groove around seat opening (spline-set)",
      "Uniform machine consistency vs hand-woven variation",
    ],
    period_associations: [
      { period_label: "Industrial era", date_floor: 1880 },
    ],
    date_range_summary: "Late 1800s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat"],
    replacement_likelihood: "high",
    related_cover_types: ["upholstery_cover_type_hand_cane_strand_cane"],
  },
  {
    id: "upholstery_cover_type_natural_rush",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Plant rushes (water-plant material) twisted into rope and woven as seat; 1600s-present strong in rural New England, Pennsylvania, Appalachian, Midwestern, and Shaker-related furniture traditions.",
    notes: "Per American_Furniture_Textile_Reference.docx Cane, Rush, Splint, and Woven Seat Materials > Natural Rush (paragraphs 252-260). 7/7 per A-7. replacement_likelihood HIGH per A-8 category default. regional_persistence_notes populated per D-UC38-9 strict canonical fidelity (canonical 'Strong in rural New England, Pennsylvania, Appalachian, Midwestern, and Shaker-related' explicit reference). maker_associations: [] per D-UC37-6.",
    name: "Natural Rush",
    parent_category_id: "upholstery_cover_category_cane_rush_splint_and_woven_seat_materials",
    description: "Plant rushes (water-plant material) twisted into rope and woven as seat surface in spiral or warp-weft pattern.",
    unique_traits: [
      "Plant rushes (water-plant material)",
      "Twisted into rope",
      "Woven as seat",
    ],
    identifying_characteristics: [
      "Natural plant fiber spiral twist",
      "Greenish-brown natural color aging to gray-brown",
      "Spiral pattern around rails",
    ],
    period_associations: [
      { period_label: "Continuous vernacular use", date_floor: 1600, usage_notes: "Strongest in colonial and country furniture." },
    ],
    date_range_summary: "1600s to present; strongest colonial and country furniture.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat"],
    replacement_likelihood: "high",
    regional_persistence_notes: "Strong in rural New England, Pennsylvania, Appalachian, Midwestern, and Shaker-related furniture traditions per canonical-source verbatim reference. Natural rush seat weaving carried forward through rural-domestic textile economy and Shaker community production into late 19th and 20th centuries; persistence pattern reinforces Rule #3 rural_persistence canonical anchor.",
    related_cover_types: ["upholstery_cover_type_paper_fiber_rush"],
  },
  {
    id: "upholstery_cover_type_paper_fiber_rush",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Paper or paper-fiber cord twisted/woven imitating natural rush; AG floor 1880 (late-1800s industrial-introduction era per D-HW36-15 decade-range interpretation discipline); replaces natural rush in much 20th-century production.",
    notes: "Per American_Furniture_Textile_Reference.docx Cane, Rush, Splint, and Woven Seat Materials > Paper Fiber Rush (paragraphs 261-269). 8/8 AG anchor per A-7. replacement_likelihood HIGH per A-8 category default. AG floor 1880 per D-UC38-4 + D-HW36-15 decade-range discipline (seed canonical phrasing 'Late 1800s to present'; 1880 selected as conservative decade-floor anchor with notes-field marker per D-FA34-3). maker_associations: [] per D-UC37-6.",
    name: "Paper Fiber Rush",
    parent_category_id: "upholstery_cover_category_cane_rush_splint_and_woven_seat_materials",
    description: "Paper or paper-fiber cord twisted and woven in pattern imitating natural rush seat construction.",
    unique_traits: [
      "Paper or paper-fiber cord material",
      "Twisted and woven like natural rush",
      "Industrial-era substitute for natural rush",
    ],
    identifying_characteristics: [
      "Uniform paper-fiber appearance (vs natural-rush variation)",
      "Darker more uniform aging",
      "Often used on factory-made chairs late 19th-mid 20th century",
    ],
    period_associations: [
      { period_label: "Industrial era", date_floor: 1880, usage_notes: "Seed canonical phrasing 'Late 1800s to present' — 1880 selected as conservative decade-floor anchor per D-HW36-15 decade-range interpretation discipline." },
    ],
    date_range_summary: "Late 1800s to present; common 20th century.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat"],
    anti_classification_guidance: {
      boundary_date: 1880,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1880 presence of Paper Fiber Rush indicates either repair-introduction (Replacement Likelihood Cover-Specific + Cover Revival Warning per UpholsteryCoverReasoningRule #2 + #6) or misidentification; paper-fiber-rush production began in late-19th-century industrial era. Seed canonical phrasing 'Late 1800s to present' — 1880 conservative decade-floor anchor per D-HW36-15 decade-range interpretation discipline + D-FA34-3 notes-field-marker precedent. Pre-1880 rush-style seats are natural rush (not paper fiber).",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
    related_cover_types: ["upholstery_cover_type_natural_rush"],
  },
  {
    id: "upholstery_cover_type_splint_seat",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Flat strips of ash, oak, or hickory woven as seat; 1600s-present strong in rural Appalachian / New England / Shaker / Midwestern vernacular furniture.",
    notes: "Per American_Furniture_Textile_Reference.docx Cane, Rush, Splint, and Woven Seat Materials > Splint Seat (paragraphs 270-278). 7/7 per A-7. replacement_likelihood HIGH per A-8 category default. regional_persistence_notes populated per D-UC38-9 strict canonical fidelity (canonical 'Strong in rural, Appalachian, New England, Shaker, and Midwestern vernacular' explicit reference). maker_associations: [] per D-UC37-6.",
    name: "Splint Seat",
    parent_category_id: "upholstery_cover_category_cane_rush_splint_and_woven_seat_materials",
    description: "Flat strips of ash, oak, or hickory wood woven horizontally and vertically as chair seat surface.",
    unique_traits: [
      "Flat strips of ash, oak, or hickory",
      "Woven as seat",
      "Rural vernacular construction",
    ],
    identifying_characteristics: [
      "Flat wood strips (vs round cane/rush)",
      "Orthogonal weave pattern",
      "Natural wood-color aging",
    ],
    period_associations: [
      { period_label: "Continuous vernacular use", date_floor: 1600, usage_notes: "Strongest in colonial and Appalachian regions." },
    ],
    date_range_summary: "1600s to present; strongest colonial and Appalachian regions.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat"],
    replacement_likelihood: "high",
    regional_persistence_notes: "Strong in rural, Appalachian, New England, Shaker, and Midwestern vernacular furniture per canonical-source verbatim reference. Splint seat construction carried forward through rural Appalachian and Shaker craftsman traditions into 20th-century production; persistence pattern reinforces Rule #3 rural_persistence canonical anchor.",
  },
  {
    id: "upholstery_cover_type_shaker_tape",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Woven fabric ribbon tacked horizontally and vertically at chair-seat ends; late-1700s-present strongly associated with Shaker furniture and Shaker-style reproductions.",
    notes: "Per American_Furniture_Textile_Reference.docx Cane, Rush, Splint, and Woven Seat Materials > Shaker Tape (paragraphs 279-287). 7/7 per A-7. replacement_likelihood HIGH per A-8 category default. regional_persistence_notes populated per D-UC38-9 strict canonical fidelity (canonical 'Strongly associated with Shaker furniture and Shaker-style reproductions' explicit reference). maker_associations: [] per D-UC37-6.",
    name: "Shaker Tape",
    parent_category_id: "upholstery_cover_category_cane_rush_splint_and_woven_seat_materials",
    description: "Woven fabric ribbon tacked horizontally and vertically as chair-seat surface in orthogonal grid construction.",
    unique_traits: [
      "Woven fabric ribbon",
      "Tacked horizontally and vertically",
      "Orthogonal grid construction",
    ],
    identifying_characteristics: [
      "Woven fabric tape (cotton or wool blend)",
      "Tacked at end-rails",
      "Color contrast patterns common in Shaker tradition",
    ],
    period_associations: [
      { period_label: "Continuous Shaker-tradition use", date_floor: 1770 },
    ],
    date_range_summary: "Late 1700s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat"],
    replacement_likelihood: "high",
    regional_persistence_notes: "Strongly associated with Shaker furniture and Shaker-style reproductions per canonical-source verbatim reference. Shaker community production carried Shaker tape construction through 19th and 20th centuries; Shaker-style reproduction market continues to present. Regional/cultural persistence pattern reinforces Rule #3 rural_persistence canonical anchor (Shaker communities span rural New England + Appalachian + Midwestern regions).",
  },
  {
    id: "upholstery_cover_type_rawhide_leather_lacing",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Rawhide strips laced through holes in chair frame; 1600s-present Southwest / Spanish Colonial / California Mission / ranch and lodge furniture.",
    notes: "Per American_Furniture_Textile_Reference.docx Cane, Rush, Splint, and Woven Seat Materials > Rawhide / Leather Lacing Seats (paragraphs 288-296). 7/7 per A-7. replacement_likelihood HIGH per A-8 category default. regional_persistence_notes populated per D-UC38-9 strict canonical fidelity (canonical 'Southwest, Spanish Colonial, California Mission, ranch and lodge furniture' explicit reference). maker_associations: [] per D-UC37-6.",
    name: "Rawhide / Leather Lacing Seats",
    parent_category_id: "upholstery_cover_category_cane_rush_splint_and_woven_seat_materials",
    description: "Rawhide strips laced through holes drilled in chair frame as seat surface construction.",
    unique_traits: [
      "Rawhide strips",
      "Laced through holes in frame",
      "Spanish Colonial / frontier vernacular construction",
    ],
    identifying_characteristics: [
      "Rawhide visible as light tan / amber lacing",
      "Lacing pattern through holes drilled in frame",
      "Aging to darker brown with use",
    ],
    period_associations: [
      { period_label: "Continuous Southwest/Spanish-Colonial use", date_floor: 1600, usage_notes: "Strongest in colonial and Spanish-colonial contexts." },
    ],
    date_range_summary: "1600s to present; strongest colonial and Spanish-colonial contexts.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    replacement_likelihood: "high",
    regional_persistence_notes: "Southwest, Spanish Colonial, California Mission, ranch and lodge furniture per canonical-source verbatim reference. Rawhide lacing seat construction carried forward through Southwest and Spanish-Colonial regional traditions into 19th- and 20th-century ranch and lodge furniture production. Regional persistence pattern reinforces Rule #3 rural_persistence canonical anchor (Southwest / California Mission regional context).",
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-9: WICKER/RATTAN/REED/WILLOW (6 entries; 2 AG)
  // ═══════════════════════════════════════════════════════════
  {
    id: "upholstery_cover_type_rattan",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Tropical climbing palm material — flexible, natural nodes, glossy skin; 1840s-present American wicker construction; LOW replacement_likelihood (structural).",
    notes: "Per American_Furniture_Textile_Reference.docx Wicker, Rattan, Reed, Willow, and Basketry Furniture Materials > Rattan (paragraphs 307-315). 7/7 per A-7. replacement_likelihood LOW per A-8 (structural; rarely fully replaced). maker_associations: [] per D-UC37-6.",
    name: "Rattan",
    parent_category_id: "upholstery_cover_category_wicker_rattan_reed_willow_and_basketry_furniture_materials",
    description: "Tropical climbing palm material with flexible stems, natural nodes, and glossy skin used in wicker furniture construction.",
    unique_traits: [
      "Tropical climbing palm material",
      "Flexible stems",
      "Natural nodes visible",
      "Glossy skin",
    ],
    identifying_characteristics: [
      "Natural nodes at intervals",
      "Glossy bark surface",
      "Flexible curved-form construction",
    ],
    period_associations: [
      { period_label: "American wicker era", date_floor: 1840, usage_notes: "American wicker expands after 1840s; elaborate Victorian wicker 1870s-1890s." },
    ],
    date_range_summary: "1840s to present.",
    maker_associations: [],
    common_observed_locations: ["frame_rail", "frame_stile", "case_carcass"],
    replacement_likelihood: "low",
    related_cover_types: ["upholstery_cover_type_reed", "upholstery_cover_type_willow"],
  },
  {
    id: "upholstery_cover_type_reed",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Thin rattan or marsh-plant material woven tightly; 1850s-present; LOW replacement_likelihood (structural).",
    notes: "Per American_Furniture_Textile_Reference.docx Wicker, Rattan, Reed, Willow, and Basketry Furniture Materials > Reed (paragraphs 316-324). 7/7 per A-7. replacement_likelihood LOW per A-8 (structural). maker_associations: [] per D-UC37-6.",
    name: "Reed",
    parent_category_id: "upholstery_cover_category_wicker_rattan_reed_willow_and_basketry_furniture_materials",
    description: "Thin rattan core or marsh-plant material woven tightly in wicker furniture construction.",
    unique_traits: [
      "Thin rattan core or marsh-plant material",
      "Tightly woven",
    ],
    identifying_characteristics: [
      "Thinner less-glossy than rattan",
      "Tight weave pattern",
    ],
    period_associations: [
      { period_label: "American wicker era", date_floor: 1850 },
    ],
    date_range_summary: "1850s to present.",
    maker_associations: [],
    common_observed_locations: ["frame_rail", "frame_stile", "case_carcass"],
    replacement_likelihood: "low",
    related_cover_types: ["upholstery_cover_type_rattan", "upholstery_cover_type_willow"],
  },
  {
    id: "upholstery_cover_type_willow",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Flexible willow branches/twigs — less glossy than rattan, heavier; 1840s-present; LOW replacement_likelihood (structural).",
    notes: "Per American_Furniture_Textile_Reference.docx Wicker, Rattan, Reed, Willow, and Basketry Furniture Materials > Willow (paragraphs 325-333). 7/7 per A-7. replacement_likelihood LOW per A-8 (structural). maker_associations: [] per D-UC37-6.",
    name: "Willow",
    parent_category_id: "upholstery_cover_category_wicker_rattan_reed_willow_and_basketry_furniture_materials",
    description: "Flexible willow branches or twigs woven into wicker furniture forms.",
    unique_traits: [
      "Flexible willow branches/twigs",
      "Less glossy than rattan",
      "Heavier hand",
    ],
    identifying_characteristics: [
      "Willow-tree-branch appearance",
      "Matte natural surface",
      "Heavier wicker construction than rattan",
    ],
    period_associations: [
      { period_label: "American wicker era", date_floor: 1840 },
    ],
    date_range_summary: "1840s to present.",
    maker_associations: [],
    common_observed_locations: ["frame_rail", "frame_stile", "case_carcass"],
    replacement_likelihood: "low",
    related_cover_types: ["upholstery_cover_type_rattan", "upholstery_cover_type_reed"],
  },
  {
    id: "upholstery_cover_type_paper_fiber_wicker",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Twisted paper fiber woven like wicker; AG floor 1880 (late-1800s industrial-introduction era per D-HW36-15); strongest late-1800s-mid-1900s with continued later use.",
    notes: "Per American_Furniture_Textile_Reference.docx Wicker, Rattan, Reed, Willow, and Basketry Furniture Materials > Paper Fiber Wicker / Fiber Rush Wicker (paragraphs 334-342). 8/8 AG anchor per A-7. replacement_likelihood MEDIUM per A-8 (repair-prone). AG floor 1880 per D-UC38-4 + D-HW36-15 decade-range discipline (seed canonical phrasing 'Late 1800s to mid-1900s strongest'; 1880 selected as conservative decade-floor anchor with notes-field marker per D-FA34-3). maker_associations: [] per D-UC37-6.",
    name: "Paper Fiber Wicker / Fiber Rush Wicker",
    parent_category_id: "upholstery_cover_category_wicker_rattan_reed_willow_and_basketry_furniture_materials",
    description: "Twisted paper fiber woven in wicker construction as substitute for natural rattan/reed/willow.",
    unique_traits: [
      "Twisted paper fiber material",
      "Woven like wicker",
      "Industrial-era natural-material substitute",
    ],
    identifying_characteristics: [
      "Uniform paper-fiber appearance (vs natural-material variation)",
      "Darker more uniform aging",
      "Often factory-made furniture late 19th-mid 20th century",
    ],
    period_associations: [
      { period_label: "Industrial era", date_floor: 1880, usage_notes: "Seed canonical phrasing 'Late 1800s to mid-1900s strongest' — 1880 selected as conservative decade-floor anchor per D-HW36-15." },
    ],
    date_range_summary: "Late 1800s to mid-1900s strongest; still used later.",
    maker_associations: [],
    common_observed_locations: ["frame_rail", "frame_stile", "case_carcass"],
    anti_classification_guidance: {
      boundary_date: 1880,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1880 presence of Paper Fiber Wicker indicates either repair-introduction (Replacement Likelihood Cover-Specific + Cover Revival Warning per UpholsteryCoverReasoningRule #2 + #6) or misidentification; paper-fiber-wicker production began in late-19th-century industrial era. Seed canonical phrasing 'Late 1800s to mid-1900s strongest' — 1880 conservative decade-floor anchor per D-HW36-15 decade-range interpretation discipline + D-FA34-3 notes-field-marker precedent. Pre-1880 wicker furniture is natural rattan/reed/willow (not paper fiber).",
      prominence: "prominent",
    },
    replacement_likelihood: "medium",
    related_cover_types: ["upholstery_cover_type_rattan", "upholstery_cover_type_reed", "upholstery_cover_type_willow"],
  },
  {
    id: "upholstery_cover_type_bamboo",
    category: "upholstery_cover_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Bamboo framework and woven material; 1800s-present in American interiors strongest in Aesthetic Movement / Victorian exotic / mid-century tropical (tiki) / contemporary use.",
    notes: "Per American_Furniture_Textile_Reference.docx Wicker, Rattan, Reed, Willow, and Basketry Furniture Materials > Bamboo (paragraphs 343-351). 7/7 per A-7. replacement_likelihood LOW per A-8 (structural). Multi-period per D-UC38-2. style_associations 4 style waves per D-UC38-5. maker_associations: [] per D-UC37-6.",
    name: "Bamboo",
    parent_category_id: "upholstery_cover_category_wicker_rattan_reed_willow_and_basketry_furniture_materials",
    description: "Bamboo framework and woven material used in furniture construction with distinctive jointed stem segments.",
    unique_traits: [
      "Bamboo framework",
      "Bamboo woven material",
      "Distinctive jointed stem segments",
    ],
    identifying_characteristics: [
      "Visible jointed stem segments",
      "Lightweight construction",
      "Yellow-tan natural color aging to brown",
    ],
    period_associations: [
      { period_label: "Aesthetic Movement era", date_floor: 1875, date_ceiling: 1900, usage_notes: "Aesthetic Movement bamboo furniture late 19th century." },
      { period_label: "Mid-century tropical/tiki era", date_floor: 1950, date_ceiling: 1980, usage_notes: "Mid-century bamboo/tiki revival c. 1950s-1970s." },
    ],
    date_range_summary: "1800s to present in American interiors; strongest Aesthetic Movement, Victorian exotic, mid-century tropical, and contemporary use.",
    style_associations: [
      { style_label: "Aesthetic Movement", date_floor: 1875, date_ceiling: 1900 },
      { style_label: "Victorian Exotic", date_floor: 1870, date_ceiling: 1900 },
      { style_label: "Mid-Century Tropical/Tiki", date_floor: 1950, date_ceiling: 1980 },
      { style_label: "Contemporary", date_floor: 1990 },
    ],
    maker_associations: [],
    common_observed_locations: ["frame_rail", "frame_stile", "case_carcass"],
    replacement_likelihood: "low",
  },
  {
    id: "upholstery_cover_type_synthetic_resin_wicker",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Plastic or resin imitation wicker for outdoor furniture; no natural nodes; AG floor 1980 (late-20th-century industrial-introduction era per D-HW36-15).",
    notes: "Per American_Furniture_Textile_Reference.docx Wicker, Rattan, Reed, Willow, and Basketry Furniture Materials > Synthetic Resin Wicker (paragraphs 352-360). 8/8 AG anchor per A-7. replacement_likelihood MEDIUM per A-8 (modern repair-prone). AG floor 1980 per D-UC38-4 + D-HW36-15 decade-range discipline (seed canonical phrasing 'Late 20th century to present' + category-level 'synthetic resin wicker is late 20th century onward'; 1980 selected as conservative decade-floor anchor with notes-field marker per D-FA34-3). maker_associations: [] per D-UC37-6.",
    name: "Synthetic Resin Wicker",
    parent_category_id: "upholstery_cover_category_wicker_rattan_reed_willow_and_basketry_furniture_materials",
    description: "Plastic or resin imitation of wicker materials for outdoor furniture applications; uniform synthetic appearance without natural nodes.",
    unique_traits: [
      "Plastic or resin imitation",
      "Outdoor furniture material",
      "No natural nodes",
    ],
    identifying_characteristics: [
      "Uniform plastic appearance",
      "No natural-fiber variation",
      "UV-fade + cracking with outdoor exposure",
      "Often dark brown / black / espresso colorways",
    ],
    period_associations: [
      { period_label: "Late 20th-century era", date_floor: 1980, usage_notes: "Seed canonical phrasing 'Late 20th century to present' — 1980 selected as conservative decade-floor anchor per D-HW36-15." },
    ],
    date_range_summary: "Late 20th century to present.",
    maker_associations: [],
    common_observed_locations: ["frame_rail", "frame_stile", "case_carcass"],
    anti_classification_guidance: {
      boundary_date: 1980,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1980 presence of Synthetic Resin Wicker indicates either repair-introduction (Replacement Likelihood Cover-Specific + Cover Revival Warning per UpholsteryCoverReasoningRule #2 + #6) or misidentification; synthetic-resin-wicker production began in late-20th-century era. Seed canonical phrasing 'Late 20th century to present' + category-level 'synthetic resin wicker is late 20th century onward' — 1980 conservative decade-floor anchor per D-HW36-15 decade-range interpretation discipline + D-FA34-3 notes-field-marker precedent. Pre-1980 wicker furniture is natural rattan/reed/willow or paper-fiber wicker (not synthetic resin).",
      prominence: "prominent",
    },
    replacement_likelihood: "medium",
    related_cover_types: ["upholstery_cover_type_rattan", "upholstery_cover_type_paper_fiber_wicker"],
  },

  // ═══════════════════════════════════════════════════════════
  // Sub-batch C-10: MODERN SYNTHETIC AND BLENDED (6 entries; 6 AG; ALL D-HW36-15)
  // ═══════════════════════════════════════════════════════════
  {
    id: "upholstery_cover_type_rayon",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Regenerated cellulose fiber with soft drape + sheen + silk-imitation aesthetic; AG floor 1900 (early-1900s industrial-introduction era per D-HW36-15); Art Deco + 1930s-1950s era anchor.",
    notes: "Per American_Furniture_Textile_Reference.docx Modern Synthetic and Blended Upholstery Fabrics > Rayon (paragraphs 362-370). 8/8 AG anchor per A-7. replacement_likelihood HIGH per A-8 category default. AG floor 1900 per D-UC38-4 + D-HW36-15 decade-range discipline (seed canonical phrasing 'Early 1900s to present'; 1900 selected as conservative decade-floor anchor with notes-field marker per D-FA34-3). style_associations 1 explicit style wave per D-UC38-5. maker_associations: [] per D-UC37-6.",
    name: "Rayon",
    parent_category_id: "upholstery_cover_category_modern_synthetic_and_blended_upholstery_fabrics",
    description: "Regenerated cellulose synthetic fiber producing soft drape, sheen, and silk-imitation aesthetic in upholstery applications.",
    unique_traits: [
      "Regenerated cellulose fiber",
      "Soft drape",
      "Sheen and silk-imitation",
    ],
    identifying_characteristics: [
      "Silk-like sheen",
      "Soft drape (unlike crisp cotton)",
      "Strong in 1930s-1950s formal living room contexts",
    ],
    period_associations: [
      { period_label: "Industrial era", date_floor: 1900, usage_notes: "Seed canonical phrasing 'Early 1900s to present' — 1900 selected as conservative decade-floor anchor per D-HW36-15." },
    ],
    date_range_summary: "Early 1900s to present; strongest 1920s to 1950s.",
    style_associations: [
      { style_label: "Art Deco", date_floor: 1925, date_ceiling: 1945 },
    ],
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    anti_classification_guidance: {
      boundary_date: 1900,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1900 presence of Rayon indicates either repair-introduction (Replacement Likelihood Cover-Specific + Cover Revival Warning per UpholsteryCoverReasoningRule #2 + #6) or misidentification; rayon production began in early-20th-century era. Seed canonical phrasing 'Early 1900s to present' — 1900 conservative decade-floor anchor per D-HW36-15 decade-range interpretation discipline + D-FA34-3 notes-field-marker precedent. Pre-1900 silk-like upholstery is natural silk (not regenerated cellulose).",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
  },
  {
    id: "upholstery_cover_type_nylon",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Strong synthetic fiber — resilient, smooth, sometimes shiny; AG floor 1940 (1940s post-WWII industrial-introduction era per D-HW36-15); commercial seating / office / mid-century modern.",
    notes: "Per American_Furniture_Textile_Reference.docx Modern Synthetic and Blended Upholstery Fabrics > Nylon (paragraphs 371-379). 8/8 AG anchor per A-7. replacement_likelihood HIGH per A-8 category default. AG floor 1940 per D-UC38-4 + D-HW36-15 decade-range discipline (seed canonical phrasing '1940s to present'; 1940 selected as conservative decade-floor anchor with notes-field marker per D-FA34-3). NO style_associations per D-UC38-5 strict canonical fidelity (canonical-source temporal-only context, no explicit style wave). maker_associations: [] per D-UC37-6.",
    name: "Nylon",
    parent_category_id: "upholstery_cover_category_modern_synthetic_and_blended_upholstery_fabrics",
    description: "Strong synthetic polyamide fiber with resilient smooth surface and occasional sheen used in commercial and office upholstery.",
    unique_traits: [
      "Strong synthetic fiber",
      "Resilient",
      "Smooth surface",
      "Sometimes shiny",
    ],
    identifying_characteristics: [
      "Resilient hand (springs back from compression)",
      "Smooth surface",
      "Post-WWII commercial seating + office + mid-century upholstery blends",
    ],
    period_associations: [
      { period_label: "Post-WWII era", date_floor: 1940, usage_notes: "Seed canonical phrasing '1940s to present' — 1940 selected as conservative decade-floor anchor per D-HW36-15." },
    ],
    date_range_summary: "1940s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    anti_classification_guidance: {
      boundary_date: 1940,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1940 presence of Nylon indicates either repair-introduction (Replacement Likelihood Cover-Specific + Cover Revival Warning per UpholsteryCoverReasoningRule #2 + #6) or misidentification; nylon commercial production began in post-WWII era. Seed canonical phrasing '1940s to present' — 1940 conservative decade-floor anchor per D-HW36-15 decade-range interpretation discipline + D-FA34-3 notes-field-marker precedent.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
  },
  {
    id: "upholstery_cover_type_polyester",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Durable wrinkle-resistant synthetic fiber taking bright dyes; AG floor 1950 (1950s industrial-introduction era per D-HW36-15); dominant late-20th-century upholstery fiber.",
    notes: "Per American_Furniture_Textile_Reference.docx Modern Synthetic and Blended Upholstery Fabrics > Polyester (paragraphs 380-388). 8/8 AG anchor per A-7. replacement_likelihood HIGH per A-8 category default. AG floor 1950 per D-UC38-4 + D-HW36-15 decade-range discipline. NO style_associations per D-UC38-5 strict canonical fidelity. maker_associations: [] per D-UC37-6.",
    name: "Polyester",
    parent_category_id: "upholstery_cover_category_modern_synthetic_and_blended_upholstery_fabrics",
    description: "Durable wrinkle-resistant synthetic fiber taking bright dyes; often blended in upholstery applications.",
    unique_traits: [
      "Durable",
      "Wrinkle-resistant",
      "Takes bright dyes",
      "Often blended",
    ],
    identifying_characteristics: [
      "Synthetic uniform fiber appearance",
      "Bright dye saturation common",
      "Dominant late-20th-century decorator + commercial upholstery fiber",
    ],
    period_associations: [
      { period_label: "Industrial era", date_floor: 1950, usage_notes: "Seed canonical phrasing '1950s to present, dominant late 20th-century upholstery fiber' — 1950 selected as conservative decade-floor anchor per D-HW36-15." },
    ],
    date_range_summary: "1950s to present; dominant late 20th-century upholstery fiber.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    anti_classification_guidance: {
      boundary_date: 1950,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1950 presence of Polyester indicates either repair-introduction (Replacement Likelihood Cover-Specific + Cover Revival Warning per UpholsteryCoverReasoningRule #2 + #6) or misidentification; polyester commercial production began in 1950s. Seed canonical phrasing '1950s to present' — 1950 conservative decade-floor anchor per D-HW36-15 decade-range interpretation discipline + D-FA34-3 notes-field-marker precedent.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
  },
  {
    id: "upholstery_cover_type_acrylic",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Wool-like synthetic with good colorfastness; AG floor 1950 (1950s industrial-introduction era per D-HW36-15); often used for outdoor/casual furniture + patio + mid-century modern.",
    notes: "Per American_Furniture_Textile_Reference.docx Modern Synthetic and Blended Upholstery Fabrics > Acrylic (paragraphs 389-397). 8/8 AG anchor per A-7. replacement_likelihood HIGH per A-8 category default. AG floor 1950 per D-UC38-4 + D-HW36-15 decade-range discipline. NO style_associations per D-UC38-5 strict canonical fidelity. maker_associations: [] per D-UC37-6.",
    name: "Acrylic",
    parent_category_id: "upholstery_cover_category_modern_synthetic_and_blended_upholstery_fabrics",
    description: "Wool-like synthetic fiber with good colorfastness; often used for outdoor and casual upholstery applications.",
    unique_traits: [
      "Wool-like synthetic",
      "Good colorfastness",
      "Often outdoor/casual application",
    ],
    identifying_characteristics: [
      "Wool-imitation hand",
      "Colorfast UV-stable",
      "Common in patio / mid-century / casual contexts",
    ],
    period_associations: [
      { period_label: "Industrial era", date_floor: 1950, usage_notes: "Seed canonical phrasing '1950s to present' — 1950 selected as conservative decade-floor anchor per D-HW36-15." },
    ],
    date_range_summary: "1950s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    anti_classification_guidance: {
      boundary_date: 1950,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1950 presence of Acrylic indicates either repair-introduction (Replacement Likelihood Cover-Specific + Cover Revival Warning per UpholsteryCoverReasoningRule #2 + #6) or misidentification; acrylic commercial production began in 1950s. Seed canonical phrasing '1950s to present' — 1950 conservative decade-floor anchor per D-HW36-15 decade-range interpretation discipline + D-FA34-3 notes-field-marker precedent.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
  },
  {
    id: "upholstery_cover_type_olefin_polypropylene",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Lightweight moisture-resistant synthetic fiber suitable for outdoor use; AG floor 1960 (1960s industrial-introduction era per D-HW36-15).",
    notes: "Per American_Furniture_Textile_Reference.docx Modern Synthetic and Blended Upholstery Fabrics > Olefin / Polypropylene (paragraphs 398-406). 8/8 AG anchor per A-7. replacement_likelihood HIGH per A-8 category default. AG floor 1960 per D-UC38-4 + D-HW36-15 decade-range discipline. NO style_associations per D-UC38-5 strict canonical fidelity. maker_associations: [] per D-UC37-6.",
    name: "Olefin / Polypropylene",
    parent_category_id: "upholstery_cover_category_modern_synthetic_and_blended_upholstery_fabrics",
    description: "Lightweight moisture-resistant synthetic polyolefin fiber suitable for outdoor and high-moisture upholstery applications.",
    unique_traits: [
      "Lightweight",
      "Moisture-resistant",
      "Outdoor-suitable",
    ],
    identifying_characteristics: [
      "Lighter weight than other synthetics",
      "Hydrophobic surface",
      "Outdoor patio + commercial use common",
    ],
    period_associations: [
      { period_label: "Industrial era", date_floor: 1960, usage_notes: "Seed canonical phrasing '1960s to present' — 1960 selected as conservative decade-floor anchor per D-HW36-15." },
    ],
    date_range_summary: "1960s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back"],
    anti_classification_guidance: {
      boundary_date: 1960,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1960 presence of Olefin/Polypropylene indicates either repair-introduction (Replacement Likelihood Cover-Specific + Cover Revival Warning per UpholsteryCoverReasoningRule #2 + #6) or misidentification; olefin/polypropylene commercial production began in 1960s. Seed canonical phrasing '1960s to present' — 1960 conservative decade-floor anchor per D-HW36-15 decade-range interpretation discipline + D-FA34-3 notes-field-marker precedent.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
  },
  {
    id: "upholstery_cover_type_microfiber_microsuede",
    category: "upholstery_cover_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Ultra-fine synthetic fibers with suede-like hand + stain/soil resistance; AG floor 1980 (1980s industrial-introduction era per D-HW36-15); strongest 1990s-present.",
    notes: "Per American_Furniture_Textile_Reference.docx Modern Synthetic and Blended Upholstery Fabrics > Microfiber / Microsuede (paragraphs 407-415). 8/8 AG anchor per A-7. replacement_likelihood HIGH per A-8 category default. AG floor 1980 per D-UC38-4 + D-HW36-15 decade-range discipline. NO style_associations per D-UC38-5 strict canonical fidelity. maker_associations: [] per D-UC37-6.",
    name: "Microfiber / Microsuede",
    parent_category_id: "upholstery_cover_category_modern_synthetic_and_blended_upholstery_fabrics",
    description: "Ultra-fine synthetic fibers producing suede-like hand with stain and soil resistance; contemporary family-room upholstery dominant.",
    unique_traits: [
      "Ultra-fine synthetic fibers",
      "Suede-like hand",
      "Stain/soil resistant",
    ],
    identifying_characteristics: [
      "Velvety suede-imitation surface",
      "Stain-resistance evident on use",
      "Common in sofas + recliners + sectionals + family-room furniture",
    ],
    period_associations: [
      { period_label: "Late 20th century", date_floor: 1980, usage_notes: "Seed canonical phrasing '1980s to present, strongest 1990s to present' — 1980 selected as conservative decade-floor anchor per D-HW36-15." },
    ],
    date_range_summary: "1980s to present; strongest 1990s to present.",
    maker_associations: [],
    common_observed_locations: ["upholstery_seat", "upholstery_back", "upholstery_arm"],
    anti_classification_guidance: {
      boundary_date: 1980,
      boundary_type: "form_emergence",
      guidance_text: "Pre-1980 presence of Microfiber/Microsuede indicates either repair-introduction (Replacement Likelihood Cover-Specific + Cover Revival Warning per UpholsteryCoverReasoningRule #2 + #6) or misidentification; microfiber/microsuede commercial production began in 1980s. Seed canonical phrasing '1980s to present, strongest 1990s to present' — 1980 conservative decade-floor anchor per D-HW36-15 decade-range interpretation discipline + D-FA34-3 notes-field-marker precedent.",
      prominence: "prominent",
    },
    replacement_likelihood: "high",
  },
];

/**
 * UPHOLSTERY_COVER_REASONING_RULES — 7 meta-rule entries per
 * Block 37 D-UC37-7 Q5=H expanded set. All entries authority 9/9;
 * migration_status "complete"; migration_target engine_reasoning.
 * cross_layer_scope: true on Rule #1 (covers_alone_never_dates
 * _furniture) + Rule #5 (cover_evidence_layer_independence).
 *
 * SIXTH canonical-library encoding of Independent Layer Evaluation
 * Standard per D-UC37-9 (after wood rule #7, maker rule #1, joinery
 * rule #5, fastener rule #5, hardware rule #5).
 *
 * Two NEW canonical reasoning rule TYPES per D-UC37-12 + D-UC37
 * -13 (fifth + sixth new evidence-library reasoning-rule TYPES
 * after restoration_false_signals + replacement_fastener_risk +
 * restoration_contamination + reproduction_hardware_warning):
 * - Rule #6 cover_revival_warning (revival textiles can mislead
 *   attribution; Colonial Revival + Victorian Revival + Rococo
 *   Revival + Renaissance Revival waves canonical anchors)
 * - Rule #7 cover_axis_sub_output_routing (operationalizes
 *   D-UC37-3 two-assessment-with-sub-output-surfacing convention
 *   at reasoning-rule level; evidence_sub_layer "cover" routes
 *   to "visible cover date" sub-output within unified upholstery
 *   assessment section on report)
 */
export const UPHOLSTERY_COVER_REASONING_RULES: UpholsteryCoverReasoningRule[] = [
  {
    id: "upholstery_cover_reasoning_covers_alone_never_dates_furniture",
    category: "upholstery_cover_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Covers Alone Never Date Furniture",
    rule_statement: "Cover evidence — cover type, weave, pattern, color, fiber material, era-canonical style class — is NEVER primary dating authority alone for whole-piece dating. Cover evidence routes to the cover-axis sub-output within the unified upholstery assessment section per D-UC37-3 two-assessment-with-sub-output-surfacing convention; the cover-axis sub-output dates the visible upholstery campaign, NOT necessarily the original construction. Whole-piece dating combines cover evidence with frame construction + joinery + fasteners + hardware evidence (frame assessment) AND with construction-axis evidence (upholstery system sub-output within upholstery assessment). A cover identification in isolation cannot date a piece; covers are routinely replaced during reupholstery campaigns spanning the piece's lifetime.",
    rationale: "Per American_Furniture_Textile_Reference.docx Quick Identification Hierarchy canonical-source verbatim anchor (paragraphs 427-434): 'For dating, do not let fabric style alone control the conclusion. Use this order: 1. Frame construction and joinery. 2. Fasteners and attachment method. 3. Textile material and weave. 4. Wear, oxidation, and tack history. 5. Pattern, color, and style. 6. Regional or maker context.' Plus Operational Rule canonical-source verbatim anchor (paragraph 435): 'A Victorian frame with modern polyester damask is still a Victorian frame with later upholstery. A Colonial Revival chair with rush does not become 18th century because the seat is rush. A hand-caned seat narrows the seat method, not the whole chair date, unless the frame evidence agrees.' Cover evidence ranks #3 + #5 + #6 in canonical hierarchy (textile material/weave + pattern/color/style + regional context); frame construction/joinery + fasteners/attachment ranks #1 + #2 above cover evidence. Parallel discipline to wood / joinery / maker / fastener / hardware library 'X alone never dates' meta-rules — SIXTH canonical-library encoding of the pattern. cross_layer_scope: true reflects governance over cover evidence combination with all other evidence layers at both frame and upholstery assessment outputs per D-UC37-3 sub-output-surfacing convention.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_cover_type", "upholstery_cover_category"],
    cross_layer_scope: true,
    notes: "SIXTH canonical-library encoding of layer-independence meta-rule (after wood rule #1, maker rule #1, joinery rule #1, fastener rule #1, hardware rule #1). Specifically operates within the upholstery assessment section per D-UC37-3 two-assessment-with-sub-output-surfacing convention; cover-axis sub-output dates the upholstery campaign, not whole-piece original construction. Canonical-source rigor (textile reference explicitly enumerates 6-tier hierarchy with cover evidence at ranks #3 + #5 + #6) is STRONGER than implicit hierarchies in prior libraries — Mike's Q5=H expanded reasoning rule set + D-UC37-7 canonical-source-rigor-over-fixed-pattern convention applies.",
  },
  {
    id: "upholstery_cover_reasoning_replacement_likelihood_cover_specific",
    category: "upholstery_cover_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Replacement Likelihood Cover-Specific",
    rule_statement: "Covers are the MOST-REPLACED canonical evidence class on antique furniture in the canonical replacement-likelihood-by-axis framework (covers > hardware > fasteners > joinery > wood per D-AP32-3 ranking extension). Cover-axis evidence dates the upholstery campaign (when the visible cover was installed), NOT the original frame construction. Reupholstery campaigns over a piece's century-scale lifetime routinely span multiple cover generations; original covers survive only on rare canonical-source-explicit-original cases (turkey work survivors, untouched-original-leather with hand-tack attachment evidence and matching frame oxidation). Diagnostic anchors for distinguishing original-period covers from later upholstery campaigns: attachment evidence (hand tacks + square nails + rosehead nails + irregular tack spacing on older work; staples on modern repair), backing evidence (latex/foam/synthetic-scrim/black-cambric as 20th-century markers), wear pattern consistency with frame age (original covers show age-consistent wear at attachment points; replacement covers look too clean relative to frame).",
    rationale: "Per American_Furniture_Textile_Reference.docx Attachment Evidence canonical-source section (paragraphs 423-424) + Backing Evidence canonical-source section (paragraphs 425-426) + Wear Patterns canonical-source section (paragraphs 421-422). Operationalization of D-AP32-3 replacement-likelihood discipline for cover sub-layer per D-UC37-3. Per Mike's covers-are-replacement-prone-by-axis framing: covers ARE the replacement class; the cover-axis sub-output dates the visible upholstery campaign as a feature, not a bug. Engine routing per D-UC37-3 surfaces cover-axis sub-output as 'visible cover date' within unified upholstery assessment section; whole-piece dating combines cover evidence with frame + construction-axis evidence for canonical attribution.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_cover_type", "upholstery_cover_category"],
    cross_layer_scope: false,
    notes: "Per-entry replacement_likelihood field operationalizes this rule per cover type per Block 38 authoring. Covers ARE replacement-prone-by-axis: the cover-axis evidence dates the upholstery campaign as canonical sub-output per D-UC37-3. Distinct from prior libraries' replacement-likelihood discipline which framed replacement as evidence-distortion risk; for covers, replacement IS the canonical dating signal at the cover sub-layer level.",
  },
  {
    id: "upholstery_cover_reasoning_pattern_color_wear_dating_framework",
    category: "upholstery_cover_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Pattern Color Wear Dating Framework",
    rule_statement: "Pattern scale, color cues, and wear patterns are diagnostic evidence axes for cover-axis dating per canonical-source Period Pattern and Wear Cues section. Pattern scale: large formal repeats support high-style or revival upholstery (damask / brocade / tapestry); small-scale florals suggest cottage / Colonial Revival / Victorian domestic / country contexts; oversized abstract patterns point mid-20th-century or later. Color cues: early natural dyes fade unevenly toward brown / tan / olive / rust; bright aniline colors become plausible after mid-19th century; synthetic jewel tones + avocado + harvest gold + burnt orange + teal + mauve + gray-beige trend cycles support 20th-century dating. Wear patterns: seat-front abrasion + arm-top darkening + back-edge sun fade + tack-line tearing + broken cane at front rail are meaningful; original upholstery shows age-consistent wear at attachment points; replacement upholstery looks too clean relative to frame.",
    rationale: "Per American_Furniture_Textile_Reference.docx Period Pattern and Wear Cues canonical-source section (paragraphs 416-435) — synthesis of three sub-sections: Pattern Scale (paragraphs 417-418), Color Cues (paragraphs 419-420), Wear Patterns (paragraphs 421-422). Canonical-source rigor provides operational rules for per-type evidence interpretation; engine reasoning uses this framework to weigh cover-type pattern/color/wear evidence within the cover-axis sub-output per D-UC37-3 routing. Pattern scale + color cues operate primarily on Patterned/Figured + Printed + Pile categories; wear patterns operate universally across all covers categories.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_cover_type"],
    cross_layer_scope: false,
    notes: "Operational framework rule (not meta-rule). Engine applies pattern scale + color cues + wear patterns diagnostics per Block 38 per-type unique_traits + identifying_characteristics field content. Canonical-source explicit dye-era boundaries (natural dyes pre-mid-19th-century; aniline post-mid-19th-century; synthetic jewel tones 20th-century) provide canonical anchors for color-cue dating.",
  },
  {
    id: "upholstery_cover_reasoning_attachment_and_backing_evidence_framework",
    category: "upholstery_cover_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Attachment and Backing Evidence Framework",
    rule_statement: "Attachment evidence and backing evidence are cover-axis diagnostics with strong cross-library cross-references to fasteners + hardware libraries. Attachment evidence: hand tacks + square nails + rosehead nails + irregular tack spacing support older upholstery work; staples indicate modern upholstery or repair; a frame with several generations of tack holes suggests repeated reupholstery, not original fabric. Backing evidence: latex backing + foam lamination + synthetic scrim + plastic mesh + black cambric dust covers generally point to 20th-century or later upholstery campaigns. Engine reasoning cross-references fasteners library Category 3 STAPLES (upholstery_staple + decorative-brass-nailhead-trim) + hardware library UPHOLSTERY HARDWARE category (upholstery_tacks + decorative_nailhead_trim) for attachment evidence resolution per D-UC37-8 related_fastener_types + related_hardware_types FK fields.",
    rationale: "Per American_Furniture_Textile_Reference.docx Attachment Evidence canonical-source section (paragraphs 423-424) + Backing Evidence canonical-source section (paragraphs 425-426). Direct cross-library references to fasteners library (staples + tacks + nails) and hardware library (decorative nailhead trim + upholstery tacks) embedded in canonical-source text. D-UC37-8 cross-library FK fields (related_fastener_types + related_hardware_types) operationalize the canonical-source cross-references at the type-entry level. Per Mike's two-assessment-with-sub-output-surfacing convention (D-UC37-3): attachment + backing evidence often surfaces the upholstery campaign date (cover-axis sub-output) more sharply than the cover material itself, especially when the cover is era-canonical (e.g., a damask cover could be 1880 or 1980; staple attachment evidence definitively places it post-1940s).",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_cover_type"],
    cross_layer_scope: false,
    notes: "Strong cross-library coupling per D-UC37-8 + canonical-source explicit cross-references. Backing evidence (latex / foam / synthetic scrim / plastic mesh / black cambric) provides hard 20th-century markers analogous to industrial-introduction AG floors but in narrative form rather than per-type AG entry. Engine applies backing evidence as supporting context for AG resolution on modern synthetic cover types.",
  },
  {
    id: "upholstery_cover_reasoning_cover_evidence_layer_independence",
    category: "upholstery_cover_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Cover Evidence Layer Independence",
    rule_statement: "Cover evidence (cover type, weave, pattern scale, color cues, wear patterns, attachment evidence, backing evidence, fiber material, era-canonical style class, replacement_likelihood) is evaluated independently from other evidence layers (wood, maker marks, form, construction logic, joinery, fasteners, hardware, upholstery construction). Cover-axis findings must NOT be biased by upstream findings from other layers. The engine must not, for example, use a tentative form attribution to narrow cover-type candidates, nor use observed location to pre-filter cover types. Each layer outputs independent evidence; cross-layer combination occurs at the report layer via two-assessment-with-sub-output-surfacing per D-UC37-3 (frame assessment combines wood + maker + form + construction + joinery + fasteners + hardware; upholstery assessment combines covers + upholstery construction as sub-outputs).",
    rationale: "Per Block 22.5 D-PA-1 Independent Layer Evaluation Standard. Canonicalized for upholstery covers library per the pattern established by wood reasoning rule #7 (wood_evidence_layer_independence), maker reasoning rule #1 (core_maker_attribution_rule cross_layer_scope), joinery reasoning rule #5 (joinery_evidence_layer_independence), fastener reasoning rule #5 (fastener_evidence_layer_independence), and hardware reasoning rule #5 (hardware_evidence_layer_independence). SIXTH canonical-library encoding of ILE Standard per D-UC37-9. The rule explicitly blocks dependency-wiring proposals that would create downstream-evidence-from-upstream-evidence inference biases on the cover axis. Per American_Furniture_Textile_Reference.docx Quick Identification Hierarchy canonical-source anchor, cover evidence ranks #3 + #5 + #6 in canonical hierarchy below frame + fasteners evidence (ranks #1 + #2); layer-independence ensures the engine reasons cover evidence on its own merits before combining with other layers at the report layer per D-UC37-3 sub-output-surfacing convention.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_cover_type", "upholstery_cover_category", "upholstery_cover_reasoning_rule"],
    cross_layer_scope: true,
    notes: "SIXTH canonical-library encoding of Independent Layer Evaluation Standard (after wood, maker, joinery, fastener, hardware) per D-UC37-9. Cross-library convention reinforced: each evidence-library reasoning-rule set includes one layer-independence canonical artifact per ILE precedent. Operationally integrates with D-UC37-3 two-assessment-with-sub-output-surfacing convention — cover-axis evidence layer outputs are independent inputs to the unified upholstery assessment section's cover sub-output (alongside construction-axis evidence inputs to system sub-output).",
  },
  {
    id: "upholstery_cover_reasoning_cover_revival_warning",
    category: "upholstery_cover_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Cover Revival Warning",
    rule_statement: "Revival textiles routinely reproduce earlier-era covers and can mislead attribution. Colonial Revival (1880-1940), Victorian Revival, Rococo Revival, Renaissance Revival, Gothic Revival, Jacobean Revival, and Hollywood Regency revival waves all canonically reproduce earlier-era patterned / figured / pile / leather covers. Reproduction covers appearing on furniture may indicate restoration introduction, revival-era manufacturing context, or contemporary furniture in period style — none of which establish dating for the underlying piece. The engine must distinguish original-period covers (carrying canonical dating evidence) from revival-era reproductions (carrying revival-period dating evidence, NOT the imitated-period evidence). Canonical revival patterns include: damask + brocade across multiple revival waves (1700s + 1880-1940); tapestry across Victorian + Renaissance Revival + Gothic Revival + Jacobean Revival; needlework/needlepoint Colonial Revival reproductions; chintz + toile Colonial Revival + Victorian Revival; turkey work revival examples; hand cane Colonial Revival reproductions; rush Colonial Revival reproductions.",
    rationale: "Per American_Furniture_Textile_Reference.docx style-references across covers section repeatedly enumerate revival waves: Damask 'Colonial Revival, Victorian Revival' (paragraph 30+); Brocade 'Empire, Rococo Revival, Renaissance Revival, Victorian, Hollywood Regency' (paragraph 39+); Tapestry 'Victorian, Renaissance Revival, Gothic Revival, Jacobean Revival' (paragraph 57+); Jacquard 'Victorian, Eastlake, Renaissance Revival, Colonial Revival' (paragraph 48+); Velvet 'Empire, Rococo Revival, Renaissance Revival, Eastlake, Art Deco, Hollywood Regency' (paragraph 85+); plus Operational Rule canonical-source verbatim anchor (paragraph 435): 'A Colonial Revival chair with rush does not become 18th century because the seat is rush.' NEW canonical reasoning rule per D-UC37-12 — fifth new evidence-library reasoning-rule TYPE after restoration_false_signals (joinery Rule #3) + replacement_fastener_risk (fastener Rule #2) + restoration_contamination (fastener Rule #4) + reproduction_hardware_warning (hardware Rule #4). Cover-axis-specific revival warning because cover-revival reproductions are canonically DESIGNED to mimic earlier-era covers (unlike replacement fasteners which are typically modernity-marked).",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_cover_type", "upholstery_cover_category"],
    cross_layer_scope: false,
    notes: "NEW canonical reasoning rule per D-UC37-12. Cross-references hardware Rule #4 reproduction_hardware_warning + joinery Rule #3 restoration_false_signals (same revival-era reproduction-market dynamics; different evidence axes). Operational anchor for cover-revival distinguishing: cover-revival reproductions carry revival-era dating evidence (1880-1940 Colonial Revival window; mid-20th-century Hollywood Regency window) and must be combined with frame + construction evidence per D-UC37-3 to date the actual piece vs the imitated period.",
  },
  {
    id: "upholstery_cover_reasoning_cover_axis_sub_output_routing",
    category: "upholstery_cover_reasoning_rule",
    positive_authority: 9,
    hard_negative_authority: 9,
    migration_status: "complete",
    rule_name: "Cover Axis Sub-Output Routing",
    rule_statement: "Cover-axis evidence routes to the 'visible cover date' sub-output within the unified upholstery assessment section on report per D-UC37-3 two-assessment-with-sub-output-surfacing convention. Engine reads library-level constants UPHOLSTERY_COVERS_ASSESSMENT_LAYER = 'upholstery' + UPHOLSTERY_COVERS_EVIDENCE_SUB_LAYER = 'cover' (paired with upholsteryConstruction.ts UPHOLSTERY_CONSTRUCTION_ASSESSMENT_LAYER = 'upholstery' + UPHOLSTERY_CONSTRUCTION_EVIDENCE_SUB_LAYER = 'system' at Block 39) and aggregates cover-axis evidence to produce the 'visible cover date' sub-output (when the visible upholstery cover was installed). Construction-axis evidence aggregates to the 'upholstery system date' sub-output (when the upholstery foundation system was installed). Both sub-outputs surface within unified upholstery assessment section on report; whole-piece dating combines frame assessment with both upholstery sub-outputs per appraiser-practice convention.",
    rationale: "Operationalizes D-UC37-3 two-assessment-with-sub-output-surfacing convention at reasoning-rule level. Per Mike's appraiser-practice judgment: covers + construction libraries BOTH route to single 'upholstery' assessment_layer at library level; engine surfaces upholstery system date + visible cover date as SUB-OUTPUTS within unified upholstery assessment section on report. Distinct from three-assessment architecture (rejected by Mike at Q2) which would have three independent assessments on report. Sub-layer routing via explicit evidence_sub_layer field on UpholsteryCoverCategoryEntry + UpholsteryCoverTypeEntry per D-UC37-3 + D-UC37-4. NEW canonical reasoning rule per D-UC37-13 — sixth new evidence-library reasoning-rule TYPE after restoration_false_signals + replacement_fastener_risk + restoration_contamination + reproduction_hardware_warning + cover_revival_warning. Engine-layer routing rule operationalizing canonical sub-output discipline.",
    migration_target: "engine_reasoning",
    applies_to_entry_types: ["upholstery_cover_type", "upholstery_cover_category"],
    cross_layer_scope: false,
    notes: "NEW canonical reasoning rule per D-UC37-13. Engine-layer routing rule (not evidence-interpretation rule). Pairs with future upholsteryConstruction.ts Rule #N construction_axis_sub_output_routing at Block 39. Together they operationalize D-UC37-3 two-assessment-with-sub-output-surfacing convention at the reasoning-rule level. Per D-MM27-9 Phase 2 / Phase 3 separation: rule is encoded as canonical content here; engine.ts implementation of sub-output aggregation deferred to Phase 3 engine implementation.",
  },
];
