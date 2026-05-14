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
export const UPHOLSTERY_COVER_TYPES: UpholsteryCoverTypeEntry[] = [];

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
