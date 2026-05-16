/**
 * lib/constraints/toolmarks.ts
 *
 * Canonical toolmark evidence library — production-surface evidence
 * left by the method used to reduce timber or boards before final
 * assembly. Saw marks, plane marks, scrape marks, abrasion marks.
 *
 * Created Block 0.5a (D-PH3HCL-S1-N) per Path A schema foundation.
 * Block 0.5a creates the empty library shell with locked interfaces;
 * Block 0.5b populates the categories + types from Mike's authored
 * content.
 *
 * Phase 2 reopening rationale: toolmarks library identified as a real
 * Phase 2 gap during Block 0 HCL/evidence.ts orphan inspection. HCL
 * contained 4 toolmark keys (circular_saw_arcs, pit_saw_marks,
 * band_saw_lines, hand_plane_chatter) that had no canonical home in
 * the existing Phase 2 libraries. Block 0.5b authors these as
 * canonical type entries.
 */

import type {
  CanonicalEntry,
  PeriodAssociation,
  PhysicalLocation,
  PositionOnPiece,
  AntiClassificationGuidance,
  ReasoningRuleMigrationTarget,
} from "./entryShape";

export interface ToolmarkCategoryEntry extends CanonicalEntry {
  category: "toolmark_category";
  name: string;
  description: string;
  date_range_summary: string;
  category_kind: "saw_marks" | "plane_marks" | "scrape_marks" | "abrasion_marks";
}

export interface ToolmarkTypeEntry extends CanonicalEntry {
  category: "toolmark_type";
  name: string;
  parent_category_id: string;
  description: string;
  unique_traits: string[];
  identifying_characteristics: string[];
  period_associations: PeriodAssociation[];
  date_range_summary: string;
  common_observed_locations?: PhysicalLocation[];
  position_on_piece?: PositionOnPiece[];
  anti_classification_guidance?: AntiClassificationGuidance | AntiClassificationGuidance[];
  replacement_likelihood: "low" | "medium" | "high";
  hand_vs_machine_classification?: "strongly_early" | "strongly_industrial" | "transitional" | "spans_eras";
  regional_persistence_notes?: string;
  related_joinery_types?: string[];
  related_fastener_types?: string[];
  assessment_layer: "frame";
}

export interface ToolmarkReasoningRule extends CanonicalEntry {
  category: "toolmark_reasoning_rule";
  rule_name: string;
  rule_statement: string;
  rationale: string;
  migration_target: ReasoningRuleMigrationTarget;
  applies_to_entry_types?: string[];
  cross_layer_scope?: boolean;
}

export const TOOLMARK_ASSESSMENT_LAYER = "frame" as const;

export const TOOLMARK_CATEGORIES: ToolmarkCategoryEntry[] = [
  {
    id: "toolmark_category_saw_marks",
    category: "toolmark_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Saw marks are production-surface evidence left by the method used to reduce timber or boards before final assembly. They are useful dating signals when found on original secondary surfaces, especially drawer bottoms, case backs, undersides, interior partitions, and unfinished structural stock.",
    name: "Saw marks",
    description: "This category includes visible kerf, tooth, stroke, or blade-pattern evidence left by hand sawing, water-powered sawing, circular sawing, band sawing, or related milling processes. Saw marks are most useful when they appear on protected, unfinished, or clearly original surfaces rather than on later replacement boards, repairs, or freshly altered edges.",
    date_range_summary: "Spans early American hand and water-powered production through present machine production; diagnostic value depends on the specific saw pattern, surface location, and whether the marked board is original to the piece.",
    category_kind: "saw_marks",
  },
  {
    id: "toolmark_category_plane_marks",
    category: "toolmark_category",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Plane marks are surface-preparation evidence left by hand planes, transitional tooling, or machine planers. They help distinguish hand-finished surfaces from later uniform machine preparation when interpreted with construction, joinery, fasteners, and finish history.",
    name: "Plane marks",
    description: "This category includes scallops, ridges, chatter, tear-out, plane tracks, uneven hand-smoothing, and other surface-preparation marks left during board flattening, thicknessing, fitting, or final cleanup. Plane marks are especially important on undersides, drawer interiors, backboards, case bottoms, rails, stiles, and other areas that were not fully finished for display.",
    date_range_summary: "Hand-plane evidence is common in pre-industrial and early shop-made furniture and can persist in repair, rural, custom, or craft contexts after industrial planing becomes common; machine-planed uniformity becomes increasingly common in later 19th- and 20th-century production.",
    category_kind: "plane_marks",
  },
];
export const TOOLMARK_TYPES: ToolmarkTypeEntry[] = [
  {
    id: "toolmark_type_pit_saw_marks",
    category: "toolmark_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Irregular diagonal or angled pit-saw marks on original secondary surfaces are a strong pre-industrial production signal, most useful when supported by early joinery, fasteners, board preparation, and surface oxidation.",
    notes: "Per HCL migration (D-PH3HCL-S2-N). HCL priority 1, evidence_category toolmarks.",
    name: "Pit saw marks",
    parent_category_id: "toolmark_category_saw_marks",
    description: "Pit-saw marks are produced by two-person hand sawing, with one sawyer above the log and one below, usually leaving irregular, non-mechanically spaced kerf evidence. Because the motion, feed rate, blade control, and stock movement are human-controlled, the resulting marks tend to be uneven and less rhythmically uniform than powered mill marks. On American furniture, true pit-saw evidence is most diagnostic when found on original, protected, secondary stock rather than exposed surfaces or later replacement boards.",
    unique_traits: [
      "Irregular diagonal, sloping, or wandering kerf pattern rather than perfectly repeated machine spacing.",
      "Uneven stroke rhythm, tooth spacing impression, or depth variation caused by hand-controlled sawing.",
      "May show slight changes in angle, pressure, or line direction across the board.",
      "Often appears rougher and less mechanically consistent than sash-sawn, circular-sawn, or band-sawn material.",
      "Most meaningful when the surface also shows age-consistent oxidation, wear, early fasteners, and early joinery.",
    ],
    identifying_characteristics: [
      "Look first on drawer bottoms, case backs, undersides, interior partitions, backboards, and hidden structural boards.",
      "Marks should appear integral to the old surface rather than freshly exposed, sanded through, or isolated to a later repair board.",
      "True pit-saw marks should not be perfectly parallel, perfectly perpendicular, or repeated with machine-like regularity.",
      "Strongest when paired with hand-cut dovetails, wrought or early cut nails, riven or hand-prepared stock, and early surface oxidation.",
      "Weakens as a dating signal if the marked board is inconsistent with the rest of the piece, appears replaced, or carries later fasteners.",
    ],
    period_associations: [
      { period_label: "Pre-industrial pit-saw production", date_floor: 1620, date_ceiling: 1830 },
      { period_label: "Regional, rural, repair, or reused-stock persistence", date_floor: 1830, date_ceiling: 1870 },
    ],
    date_range_summary: "strongest pre-1830; possible regional or reused-stock persistence into the mid-19th century",
    position_on_piece: [
      { physical_location: "drawer_bottom", physical_location_notes: "drawer bottom" },
      { physical_location: "case_back", physical_location_notes: "case back" },
      { physical_location: "underside", physical_location_notes: "underside" },
      { physical_location: "case_interior_framing", physical_location_notes: "interior partition" },
      { physical_location: "backboard", physical_location_notes: "backboard" },
      { physical_location: "case_interior_framing", physical_location_notes: "secondary structural board" },
    ],
    caution_text: "Do not classify ordinary roughness, sanding scratches, wire-brush marks, straight sash-saw marks, band-saw marks, or circular arcs as pit-saw marks. Pit-saw evidence should be irregular and hand-controlled, and it should be evaluated only on boards likely to be original to the furniture.",
    replacement_likelihood: "low",
    original_persistence: "high",
    hand_vs_machine_classification: "strongly_early",
    regional_persistence_notes: "Pit-saw evidence can persist through reused boards, rural work, repairs, and localized production after powered milling becomes available. Treat post-1830 readings as possible but requiring stronger corroboration from joinery, fasteners, oxidation, and construction context.",
    related_joinery_types: [
      "joinery_type_hand_cut_drawer_dovetails",
      "joinery_category_mortise_and_tenon_family",
      "joinery_type_pegged_mortise_and_tenon",
    ],
    related_fastener_types: [
      "fastener_subcategory_hand_forged_nails",
      "fastener_type_early_hand_headed_cut_nail",
    ],
    assessment_layer: "frame",
  },
  {
    id: "toolmark_type_circular_saw_arcs",
    category: "toolmark_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Circular saw arcs are a strong industrial or machine-milled lumber signal. On original structural boards, they usually contradict a purely pre-industrial interpretation, though their dating strength depends on board size, location, and whether the board is original.",
    notes: "Per HCL migration (D-PH3HCL-S2-N). HCL priority 2, evidence_category toolmarks.",
    name: "Circular saw arcs",
    parent_category_id: "toolmark_category_saw_marks",
    description: "Circular saw arcs are curved kerf marks left by a rotating circular blade. The arc usually corresponds to blade rotation and is visually distinct from straight pit-saw, sash-saw, or band-saw marks. In furniture analysis, circular saw arcs are important because they usually indicate machine-milled stock, later industrial production, or replacement material, especially when found on large original boards or secondary surfaces.",
    unique_traits: [
      "Curved, arcing, crescent-shaped, or sweep-like blade marks rather than straight saw strokes.",
      "Repeated arc pattern often matching the radius and path of a rotating blade.",
      "Can appear as partial circular bands, shallow scalloped arcs, or curved kerf chatter across the wood surface.",
      "Usually more mechanically regular than pit-saw marks, though feed rate and blade condition can vary the surface.",
      "Especially diagnostic when found on original case backs, drawer bottoms, shelves, underside boards, or structural stock.",
    ],
    identifying_characteristics: [
      "Look for curved saw tracks crossing the board rather than vertical, diagonal, or straight parallel lines.",
      "Confirm that the arcs are cut marks in the wood, not sanding scratches, finish crazing, scraper marks, or later abrasion.",
      "Evaluate whether the board is original, replaced, patched, or added during later repair.",
      "On a claimed early piece, circular saw arcs on primary structural boards should trigger a conflict check against the proposed date.",
      "Circular saw arcs on small replacement parts, drawer bottoms, shelves, or backboards may date the repair rather than the whole piece.",
    ],
    period_associations: [
      { period_label: "Early industrial circular-saw adoption and mixed milling evidence", date_floor: 1830, date_ceiling: 1880 },
      { period_label: "Common industrial circular-saw production in furniture stock", date_floor: 1880, date_ceiling: 2030 },
    ],
    date_range_summary: "post-1830 as a broad industrial signal; strongest for common furniture-stock dating after c. 1880",
    position_on_piece: [
      { physical_location: "drawer_bottom", physical_location_notes: "drawer bottom" },
      { physical_location: "case_back", physical_location_notes: "case back" },
      { physical_location: "underside", physical_location_notes: "underside" },
      { physical_location: "case_interior_framing", physical_location_notes: "shelf" },
      { physical_location: "case_interior_framing", physical_location_notes: "secondary structural board" },
      { physical_location: "case_interior_framing", physical_location_notes: "later replacement board" },
    ],
    caution_text: "Circular saw arcs on a board claimed to be original to a pre-1830 piece should be treated as a hard conflict unless there is strong evidence that the board is a later replacement, repair, reused industrial board, or added component. Do not treat circular arcs alone as proof of the entire furniture date.",
    replacement_likelihood: "medium",
    original_persistence: "high",
    hand_vs_machine_classification: "strongly_industrial",
    regional_persistence_notes: "Circular-sawn stock appears unevenly by region, shop type, board size, and furniture quality. Early use may appear in mixed-construction pieces, but large original boards with clear circular-saw arcs are generally a stronger late-19th-century or later signal than a narrow early-industrial date.",
    related_joinery_types: [
      "joinery_type_machine_cut_drawer_dovetails",
      "joinery_type_factory_case_construction",
      "joinery_type_glued_and_nailed_casework",
    ],
    related_fastener_types: [
      "fastener_type_machine_headed_cut_nail",
      "fastener_subcategory_wire_nails",
      "fastener_subcategory_machine_cut_screws",
    ],
    assessment_layer: "frame",
  },
  {
    id: "toolmark_type_band_saw_lines",
    category: "toolmark_type",
    positive_authority: 8,
    hard_negative_authority: 8,
    indicator_text: "Band saw lines are a machine-sawn production signal, usually associated with later industrial, factory, shop, or repair work. They are most useful when found on original structural surfaces and when distinguished from sash-saw or other straight saw marks.",
    notes: "Per HCL migration (D-PH3HCL-S2-N). HCL priority 2, evidence_category toolmarks.",
    name: "Band saw lines",
    parent_category_id: "toolmark_category_saw_marks",
    description: "Band saw lines are left by a continuous blade running over wheels under tension. The resulting marks are usually straight, generally parallel or perpendicular to the workpiece path, and may show fine vibration or blade chatter. In furniture analysis, band-saw evidence commonly points to industrial, factory, workshop, or later repair production, especially when paired with machine joinery, uniform stock, and modern fasteners.",
    unique_traits: [
      "Straight, narrow, repeated blade lines rather than circular arcs or irregular pit-saw strokes.",
      "Often generally perpendicular to the direction of travel, with a fine mechanical rhythm.",
      "May show slight vibration, flutter, or chatter caused by blade tension and feed rate.",
      "Usually cleaner and more mechanically controlled than hand pit-saw evidence.",
      "Can resemble sash-saw marks, so spacing regularity, context, and construction evidence must be checked.",
    ],
    identifying_characteristics: [
      "Look for straight, repeated, machine-like lines on unfinished secondary surfaces, curved cutouts, shaped parts, rails, backs, or underside stock.",
      "Distinguish from sash-saw marks by looking for later construction context, finer blade evidence, and association with machine-era fabrication.",
      "Band-saw marks are especially plausible on curved or shaped furniture components that could not be efficiently cut by a circular saw.",
      "If only one component shows band-saw marks, test whether that part is a later replacement or repair.",
      "Band-saw evidence becomes stronger when paired with wire nails, machine screws, plywood, rotary veneer, machine dovetails, or factory-style construction.",
    ],
    period_associations: [
      { period_label: "Industrial band-saw adoption and shop use", date_floor: 1850, date_ceiling: 1870 },
      { period_label: "Common furniture and factory band-saw use", date_floor: 1870, date_ceiling: 2030 },
    ],
    date_range_summary: "broadly post-1850; strongest as common furniture-production evidence after c. 1870",
    position_on_piece: [
      { physical_location: "show_surface", physical_location_notes: "curved cutout component" },
      { physical_location: "frame_rail", physical_location_notes: "chair frame component" },
      { physical_location: "case_back", physical_location_notes: "case back" },
      { physical_location: "drawer_side", physical_location_notes: "generic drawer component" },
      { physical_location: "underside", physical_location_notes: "underside" },
      { physical_location: "case_carcass", physical_location_notes: "later replacement component" },
      { physical_location: "frame_rail", physical_location_notes: "factory-shaped frame component" },
    ],
    caution_text: "Do not automatically classify all straight saw marks as band-saw lines. Straight marks may come from sash saws, frame saws, later sanding, or other processes. Band-saw classification should rely on machine-era context, blade rhythm, component type, and supporting evidence.",
    replacement_likelihood: "medium",
    original_persistence: "high",
    hand_vs_machine_classification: "strongly_industrial",
    regional_persistence_notes: "Band-saw use appears earlier in some industrial and commercial shop contexts and later in smaller rural or hand-craft contexts. Treat isolated band-sawn components as possible repairs unless the overall construction supports a machine-era original build.",
    related_joinery_types: [
      "joinery_type_machine_cut_drawer_dovetails",
      "joinery_type_factory_case_construction",
      "joinery_type_dowel_joinery",
    ],
    related_fastener_types: [
      "fastener_type_machine_headed_cut_nail",
      "fastener_subcategory_wire_nails",
      "fastener_subcategory_machine_cut_screws",
    ],
    assessment_layer: "frame",
  },
  {
    id: "toolmark_type_hand_plane_chatter",
    category: "toolmark_type",
    positive_authority: 7,
    hard_negative_authority: 7,
    indicator_text: "Hand plane chatter is a hand-surface-preparation signal most useful on original secondary surfaces. It supports early, shop-made, rural, or hand-finished construction, but should not be used alone as a narrow date anchor.",
    notes: "Per HCL migration (D-PH3HCL-S2-N). HCL priority 3, evidence_category toolmarks.",
    name: "Hand plane chatter",
    parent_category_id: "toolmark_category_plane_marks",
    description: "Hand plane chatter consists of small ridges, ripples, skipping, scallops, tear-out, or uneven tracks left by a hand plane as it passes over the wood. It is caused by blade setup, grain direction, hand pressure, plane sole condition, and changing resistance across the board. In furniture analysis, it helps separate hand-prepared or hand-finished surfaces from uniformly machine-planed surfaces, especially when seen in hidden or secondary areas.",
    unique_traits: [
      "Subtle ridges, scallops, ripples, or skip marks that follow the plane stroke.",
      "Uneven surface rhythm caused by hand pressure, blade chatter, grain reversal, or inconsistent stock.",
      "Plane tracks may overlap, stop, start, or vary in depth rather than remaining perfectly uniform.",
      "Often present on secondary surfaces that were smoothed for fit but not finished for display.",
      "May coexist with scraper marks, drawknife marks, saw marks, or hand-tool fitting marks.",
    ],
    identifying_characteristics: [
      "Look on drawer sides, drawer bottoms, case interiors, undersides, backs, rails, stiles, stretchers, and hidden frame members.",
      "Use raking light to reveal shallow ridges, scallops, and overlapping plane passes.",
      "Confirm that the marks are cut into the wood surface rather than created by later sanding, finish shrinkage, water damage, or wire brushing.",
      "Strongest when paired with hand-cut joinery, uneven board thickness, early fasteners, and age-consistent oxidation.",
      "Weakens as a dating signal when found only on a repair part, heavily refinished surface, reproduction piece, or modern hand-crafted object.",
    ],
    period_associations: [
      { period_label: "Hand-plane finishing era", date_floor: 1620, date_ceiling: 1880 },
      { period_label: "Craft, rural, repair, and custom-shop persistence", date_floor: 1880, date_ceiling: 2030 },
    ],
    date_range_summary: "strongest pre-1880 as original production evidence; persists in craft, repair, and custom work",
    position_on_piece: [
      { physical_location: "drawer_side", physical_location_notes: "drawer side" },
      { physical_location: "drawer_bottom", physical_location_notes: "drawer bottom" },
      { physical_location: "case_interior_framing", physical_location_notes: "case interior surface" },
      { physical_location: "underside", physical_location_notes: "underside" },
      { physical_location: "case_back", physical_location_notes: "case back" },
      { physical_location: "frame_rail", physical_location_notes: "rail" },
      { physical_location: "frame_stile", physical_location_notes: "stile" },
      { physical_location: "frame_rail", physical_location_notes: "stretcher member" },
    ],
    caution_text: "Do not treat every uneven surface as hand plane chatter. Water damage, sanding scratches, wire-brushing, rotary tool marks, finish checking, shrinkage, and deliberate distressing can mimic hand-tool texture. Chatter must follow plausible plane movement and fit the construction context.",
    replacement_likelihood: "low",
    original_persistence: "high",
    hand_vs_machine_classification: "strongly_early",
    regional_persistence_notes: "Hand-plane work persisted after industrial planing in rural shops, repair work, custom furniture, restoration, and craft production. On post-1880 furniture, use hand plane chatter as a hand-workmanship signal rather than an automatic early-date conclusion.",
    related_joinery_types: [
      "joinery_type_hand_cut_drawer_dovetails",
      "joinery_category_mortise_and_tenon_family",
      "joinery_type_pegged_mortise_and_tenon",
    ],
    related_fastener_types: [
      "fastener_subcategory_hand_forged_nails",
      "fastener_type_machine_headed_cut_nail",
      "fastener_subcategory_handmade_screws",
    ],
    assessment_layer: "frame",
  },
];
export const TOOLMARK_REASONING_RULES: ToolmarkReasoningRule[] = [];
