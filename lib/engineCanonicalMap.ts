/**
 * lib/engineCanonicalMap.ts — W0b namespace alignment
 *
 * Maps engine-internal clue keys (CLUE_LIBRARY) and engine-internal form labels
 * (scoreForms hardcoded strings) to canonical entry IDs in lib/constraints/*.
 *
 * Per Block 1 D-PH3-12: Block 1 cuts CLUE_LIBRARY entries for joinery /
 * fasteners / toolmarks / finish / wood + form-anchored entries that have
 * canonical FormEntry equivalents. KEEPS CLUE_LIBRARY entries for synthesized
 * pattern observations (the `*_pattern` keys from detectStructuralPatterns)
 * and material/style observations without canonical homes.
 *
 * Per D-PH3-1: where canonical splits engine's coarse keys into multiple
 * subtypes (cut_nail → hand-headed/machine-headed; wire_nail → common/finish/
 * box; staple_fastener → construction/upholstery; hand_forged_nail → rosehead/
 * L-head/T-head), the primary mapping targets the subcategory level. Specific
 * type-level routing happens when LLM observation surfaces the finer detail.
 *
 * Three lookup tables:
 *   CLUE_TO_CANONICAL — engine clue key → canonical entry ID (or NO_MATCH)
 *   FORM_LABEL_TO_CANONICAL — engine form label → canonical form_id
 *   CLUE_TO_ALTERNATIVES — multi-target mappings (subcategory + type list)
 */

export const NO_MATCH = "__NO_MATCH__" as const;
export type CanonicalLookup = string | typeof NO_MATCH;

// Block 1 deletes these CLUE_LIBRARY entries; engine now reads canonical entry directly.
export const CLUE_TO_CANONICAL: Record<string, CanonicalLookup> = {
  // ── JOINERY (delete from CLUE_LIBRARY) ────────────────────────────────────
  hand_cut_dovetails: "joinery_type_hand_cut_drawer_dovetails",
  machine_dovetails: "joinery_type_machine_cut_drawer_dovetails",
  mortise_and_tenon: "joinery_category_mortise_and_tenon_family",
  dowel_joinery: "joinery_type_dowel_joinery",
  rule_joint: NO_MATCH, // no canonical joinery entry; appraiser knowledge lives in engine
  drawer_box_joinery: NO_MATCH, // meta-clue (which-joinery-type-on-drawer); no single canonical

  // ── TOOLMARKS (delete from CLUE_LIBRARY) ──────────────────────────────────
  pit_saw_marks: "toolmark_type_pit_saw_marks",
  circular_saw_arcs: "toolmark_type_circular_saw_arcs",
  band_saw_lines: "toolmark_type_band_saw_lines",
  // hand_plane_chatter not in engine CLUE_LIBRARY but exists canonical: toolmark_type_hand_plane_chatter

  // ── FASTENERS (delete from CLUE_LIBRARY) ──────────────────────────────────
  hand_forged_nail: "fastener_subcategory_hand_forged_nails",
  cut_nail: "fastener_subcategory_cut_nails",
  wire_nail: "fastener_subcategory_wire_nails",
  phillips_screw: "fastener_type_phillips_wood_screw",
  staple_fastener: "fastener_subcategory_machine_staples",
  no_phillips_screws_observed: NO_MATCH, // negation observation; not an entry

  // ── FINISH (delete from CLUE_LIBRARY) ─────────────────────────────────────
  shellac_crazing: "finish_type_shellac_crazing",
  polyurethane: "finish_type_polyurethane",
  // shellac_intact / oil_finish_patina / refinished_surface exist canonical but not in engine CLUE_LIBRARY

  // ── WOOD / SUBSTRATES (delete from CLUE_LIBRARY) ──────────────────────────
  plywood_structural: "substrate_evidence_plywood",
  plywood_drawer_bottom: "substrate_evidence_plywood", // cross-references joinery_type_plywood_drawer_bottom
  cedar_lining: "wood_species_evidence_cedar_group",
  sheet_back_panel: NO_MATCH, // generic; specific substrate inferred from context
  // Golden Oak Era market/finish/era variant — routes the LLM-emitted
  // `golden_oak_era_possible` clue to the wood-variant evidence entry so the
  // engine resolves the dateHint from canonical period_associations (peak
  // 1890–1915) rather than from a CLUE_LIBRARY inline string. Per appraiser
  // direction (May 2026 session): Golden Oak is a wood-HCL anchor, not a
  // style family.
  golden_oak_era_possible: "wood_variant_evidence_golden_oak_era",
  golden_oak_structural_pattern: "wood_variant_evidence_golden_oak_era",

  // ── HARDWARE (delete from CLUE_LIBRARY where canonical exists) ────────────
  modern_concealed_hinge: "hardware_type_concealed_euro_hinge",
  porcelain_caster: "hardware_type_porcelain_caster",
  decorative_bail_pull: "hardware_category_pull_hardware", // category-level; LLM may specify type
  round_wood_knob: "hardware_type_turned_wooden_knob",
  wood_knob_pulls: "hardware_type_turned_wooden_knob",
  lock_escutcheons: "hardware_category_escutcheons",
  ormolu_mounts: NO_MATCH, // french-style mount; not in canonical hardware yet
  brass_foot_sabots: NO_MATCH, // french-style mount; not in canonical hardware yet

  // ── FORM-ANCHORED CLUES (delete from CLUE_LIBRARY where canonical FormEntry exists) ──
  telephone_shelf: "form_telephone_stand", // closest canonical; telephone_bench not in forms.ts
  slant_front: "form_slant_front_desk",
  cylinder_roll: "form_cylinder_desk",
  drop_leaf_hinged: "form_drop_leaf_table",
  gateleg_support: NO_MATCH, // form_gateleg_desk exists but is for desk form; table version not present
  lift_lid: "form_blanket_chest",
  multiple_drawer_case: "form_chest_of_drawers",
  metal_bed_frame: "form_bedstead",

  // ── MAKER LABELS (delete from CLUE_LIBRARY; route to makerMarks.ts) ───────
  maker_label: NO_MATCH, // generic; specific label captured via makerMarks lookup
  roos_label: NO_MATCH, // specific maker; lives in makerMarks.ts MAKER_ENTRIES
  lane_label: NO_MATCH, // specific maker; lives in makerMarks.ts MAKER_ENTRIES

  // ── UPHOLSTERY CONSTRUCTION (Block 12) ────────────────────────────────────
  coil_spring: "upholstery_construction_type_early_coil_spring",
  hand_tied_coil_spring: "upholstery_construction_type_hand_tied_coil_springs",
  serpentine_spring: "upholstery_construction_type_sinuous_serpentine_spring",
  drop_in_spring_unit: "upholstery_construction_type_drop_in_spring_unit",
  marshall_pocket_coil: "upholstery_construction_type_marshall_pocket_coil",
  no_spring_seat: "upholstery_construction_category_no_spring_upholstery",
  jute_webbing: "upholstery_construction_type_linen_hemp_jute_webbing",
  elastic_webbing: "upholstery_construction_type_elastic_webbing",
  horsehair_stuffing: "upholstery_construction_type_horsehair",
  cotton_batting: "upholstery_construction_type_cotton_batting",
  foam_padding: "upholstery_construction_type_latex_foam",
  polyurethane_foam: "upholstery_construction_type_polyurethane_foam",
  feather_down_fill: "upholstery_construction_type_feather_fill",
  upholstery_staple_construction: "upholstery_construction_type_staples",
  hand_tacks: "upholstery_construction_type_hand_tacks",
  nailhead_trim: "upholstery_construction_type_decorative_brass_nails_nailhead_trim",
  // button_tufting routes to construction category (no specific tufting type entry)
  button_tufting: "upholstery_construction_category_layering_textiles_and_foundation_covers",

  // ── UPHOLSTERY COVERS (Block 12) ──────────────────────────────────────────
  velvet_cover: "upholstery_cover_type_velvet",
  damask_cover: "upholstery_cover_type_damask",
  haircloth_cover: "upholstery_cover_type_haircloth_horsehair",
  leather_cover: "upholstery_cover_type_full_grain_top_grain_leather",
  vinyl_cover: "upholstery_cover_type_vinyl_naugahyde_faux_leather",
  chintz_cover: "upholstery_cover_type_chintz",
  needlepoint_cover: "upholstery_cover_type_needlework",
  brocade_cover: "upholstery_cover_type_brocade",
  jacquard_cover: "upholstery_cover_type_jacquard",

  // ── KEPT IN CLUE_LIBRARY (per D-PH3-12 — no canonical home or pattern-synthesized) ──
  // These are listed here as KEPT_IN_ENGINE for documentation; not deleted from CLUE_LIBRARY.
  // (Block 2 may migrate the *_pattern keys to styleFamilies.ts integration.)
};

// Marker for entries that Block 1 leaves in CLUE_LIBRARY.
// Documents which engine keys have no canonical destination yet, for Block 2/3 follow-up.
export const KEPT_IN_ENGINE: Record<string, string> = {
  // Generic structural observations
  seating_present: "no canonical evidence entry; structural observation",
  seating_surface: "no canonical evidence entry; structural observation",
  backrest_present: "no canonical evidence entry; structural observation",
  spindle_back: "no canonical evidence entry; structural observation",
  secondary_surface: "no canonical evidence entry; functional observation",
  writing_surface: "no canonical evidence entry; functional observation",
  drop_front_desk: "engine construction observation; gates form_secretary_desk inference",
  pigeonholes: "engine construction observation; supports secretary desk inference",
  mirror_present: "generic observation",
  open_shelving: "generic observation",
  pedestal_column: "form-anchored but no canonical pedestal-stand form",
  armchair_form: "generic observation; canonical form_armchair exists but routing handled by scoreForms taxonomy",
  upholstered_back: "generic upholstery observation",
  drawer_present: "generic observation",
  door_present: "generic observation",
  cabinet_form: "generic observation",
  extension_mechanism: "construction observation; form_extension_table not yet authored",

  // Style cues (no styleFamilies.ts integration yet — Block 2)
  cabriole_leg: "style cue; defer to Block 2 style integration",
  shell_carving: "style cue; defer to Block 2 style integration",
  claw_or_pad_foot: "style cue; defer to Block 2 style integration",
  barley_twist: "style cue; defer to Block 2 style integration",
  heavy_carving: "style cue; defer to Block 2 style integration",
  spindle_gallery: "style cue; defer to Block 2 style integration",
  tapered_leg: "style cue; defer to Block 2 style integration",
  louis_xvi_french_neoclassical: "style cue; defer to Block 2 style integration",
  parquetry_veneer: "veneer style cue; defer to Block 2",
  stringing_inlay: "veneer style cue; defer to Block 2",
  rope_carved_pilasters: "Empire/transitional style cue; defer to Block 2",
  overhanging_top: "Empire/transitional structure cue; defer to Block 2",
  tufted_upholstery: "upholstery style cue; no canonical home yet",

  // Material observations (no upholstery/metal/plastic canonical libraries populated)
  metal_frame: "material observation; no canonical entry",
  tubular_steel: "material observation; no canonical entry",
  wrought_iron: "material observation; no canonical entry",
  cast_iron: "material observation; no canonical entry",
  brass_frame: "material observation; no canonical entry",
  chrome_frame: "material observation; no canonical entry",
  fully_upholstered: "upholstery observation; no canonical entry",
  visible_springs: "upholstery construction observation; no canonical entry",
  exposed_upholstery_tacks: "upholstery construction observation",
  woven_body: "material observation; no canonical entry",
  rattan_frame: "material observation; no canonical entry",
  cane_panels: "material observation; no canonical entry",
  glass_top: "material observation; no canonical entry",
  laminate_surface: "material observation; no canonical entry",
  formica_surface: "material observation; no canonical entry",
  chrome_and_laminate: "material observation; no canonical entry",
  molded_plastic: "material observation; no canonical entry",
  acrylic_clear: "material observation; no canonical entry",

  // Construction observations not in canonical
  solid_wood_construction: "construction observation; no canonical entry",
  solid_wood_side_panels: "construction observation; no canonical entry",
  frame_and_panel_sides: "construction observation; canonical joinery_type_frame_and_panel covers the technique",
  solid_plank_back: "construction observation; no canonical entry",
  possible_plywood_or_laminated_panel: "ambiguous observation; no canonical entry",
};

// Maps engine's hardcoded form strings (output of scoreForms) to canonical form_id.
// Block 1: scoreForms emits canonical form_id; display_name retains the engine string per D-PH3-7.
// NO_MATCH cases keep engine free-text label only (no canonical form yet authored).
export const FORM_LABEL_TO_CANONICAL: Record<string, CanonicalLookup> = {
  // Cedar chests
  "Roos cedar chest / hope chest": "form_blanket_chest",
  "Lane cedar chest / hope chest": "form_blanket_chest",
  "Cedar chest / hope chest": "form_blanket_chest",

  // Desks
  "Telephone bench": "form_telephone_stand",
  "Telephone bench / secretary combination": "form_telephone_stand",
  "Telephone bench / writing bench combination": "form_telephone_stand",
  "Secretary desk / drop-front desk": "form_secretary_desk",
  "Secretary desk / writing desk": "form_secretary_desk",
  "Slant-front desk": "form_slant_front_desk",
  "Louis XVI Revival cylinder desk (bureau à cylindre)": "form_cylinder_desk",
  "Cylinder roll-top desk": "form_cylinder_desk",

  // Tables
  "Drop-leaf table": "form_drop_leaf_table",
  "Gateleg table": NO_MATCH, // canonical form not authored at table level
  "Extension table": "form_extension_table",
  "Pedestal stand": NO_MATCH, // canonical form not authored

  // Case furniture
  "Chest of drawers / dresser": "form_chest_of_drawers",
  "Dresser / drawer case": "form_chest_of_drawers",
  "Cabinet / dresser combination": "form_chest_of_drawers",
  "Cabinet": "form_china_cabinet", // closest; multiple canonical cabinets exist
  "Bookcase / open shelving unit": "form_bookcase",

  // Beds
  "Iron bed frame": "form_bedstead",
  "Brass bed or brass-frame furniture": "form_bedstead",

  // Seating — form_id resolution depends on style attribution (Block 2)
  "Toledo-style mid-century industrial task chair": NO_MATCH, // form_office_chair / form_task_chair not yet authored
  "Renaissance Revival upholstered armchair": "form_armchair",
  "Mission / Arts & Crafts furniture": NO_MATCH, // style-as-form; resolves in Block 2
  "Mid-century modern spindle-back lounge chair": "form_lounge_chair",
  "Lounge chair": "form_lounge_chair",
  "Club chair": "form_lounge_chair", // subtype_lounge_club within form_lounge_chair
  "Tub chair": "form_lounge_chair", // subtype_lounge_tub within form_lounge_chair
  "Barrel chair": "form_lounge_chair", // subtype_lounge_barrel within form_lounge_chair
  "Bergère chair": "form_lounge_chair", // subtype_lounge_bergere within form_lounge_chair
  "Easy chair": "form_lounge_chair", // subtype_lounge_easy within form_lounge_chair
  "Recliner": "form_lounge_chair", // subtype_lounge_recliner within form_lounge_chair
  "Wing chair": "form_wing_chair",
  "Wingback chair": "form_wing_chair",
  "Wingback armchair": "form_wing_chair",
  "Wing-back chair": "form_wing_chair",
  "Queen Anne wing chair": "form_wing_chair", // subtype_wing_queen_anne within form_wing_chair
  "Chippendale wing chair": "form_wing_chair", // subtype_wing_chippendale within form_wing_chair
  "Federal wing chair": "form_wing_chair", // subtype_wing_federal within form_wing_chair
  "Fireside chair": "form_wing_chair",
  "Wing recliner": "form_wing_chair", // subtype_wing_recliner within form_wing_chair
  // Note: "Easy chair" intentionally remains mapped to form_lounge_chair above
  // per modern dominant usage; 18th-century English period usage where
  // "easy chair" = wing chair is handled at scoreForms via structural cues
  // (wing presence routes to form_wing_chair regardless of common-alias hit).
  "Slipper chair": "form_slipper_chair",
  "Boudoir chair": "form_slipper_chair",
  "Boudoir slipper chair": "form_slipper_chair",
  "Tufted slipper chair": "form_slipper_chair",
  "Vanity chair": "form_slipper_chair", // subtype_slipper_vanity within form_slipper_chair
  "Dressing chair": "form_slipper_chair",
  "Bedroom slipper chair": "form_slipper_chair", // subtype_slipper_boudoir within form_slipper_chair
  "Victorian slipper chair": "form_slipper_chair", // subtype_slipper_victorian
  "Hollywood Regency slipper chair": "form_slipper_chair", // subtype_slipper_hollywood_regency
  // Note: "Accent chair", "Occasional chair", "Side chair", "Parlor chair",
  // "Lady's chair", "Low chair", "Armless chair", "Bedroom chair" intentionally
  // NOT mapped — too generic or overlapping with other canonical forms.
  // Resolves at scoreForms via structural cues (armless + low-seated + small-
  // scale + upholstered routes to form_slipper_chair).
  "Colonial / Georgian Revival upholstered armchair": "form_armchair",
  "Upholstered armchair": "form_armchair",
  "Bench / seating furniture": NO_MATCH, // form_bench not yet authored
  "Upholstered seating": NO_MATCH, // too generic

  // Material-anchored (catch-all forms — no canonical 1:1)
  "Metal furniture": NO_MATCH,
  "Modernist / chrome-frame furniture": NO_MATCH,
  "Iron furniture": NO_MATCH,
  "Wicker / rattan furniture": NO_MATCH,
  "Caned seating or caned-back furniture": NO_MATCH,
  "Glass-top table or mixed-material table": NO_MATCH,
  "Mid-century laminate / dinette furniture": NO_MATCH,
  "Modern plastic / acrylic furniture": NO_MATCH,

  // Style-as-form labels — these should route via style attribution (Block 2), not as forms
  "Jacobean / Tudor Revival case furniture": NO_MATCH,
  "Jacobean Revival cabinet / sideboard": NO_MATCH,
  "William and Mary furniture": NO_MATCH,
  "Federal / Hepplewhite / Sheraton furniture": NO_MATCH,
  "Chippendale furniture": NO_MATCH,
  "Victorian Eastlake furniture": NO_MATCH,
  "Rococo Revival furniture": NO_MATCH,
  "Gothic Revival furniture": NO_MATCH,
  "Art Deco / Machine Age furniture": NO_MATCH,
  "Edwardian furniture": NO_MATCH,
  "Art Nouveau furniture": NO_MATCH,
  "Shaker furniture": NO_MATCH,
  "Colonial Revival furniture": NO_MATCH,
  "Queen Anne / Colonial Revival furniture": NO_MATCH,

  // Fallback
  "Unclassified furniture": NO_MATCH,
};

// Multi-target mappings: where engine coarse key has multiple canonical splits (D-PH3-1).
// Primary mapping in CLUE_TO_CANONICAL targets subcategory; alternatives list specific types
// for cases where LLM observation surfaces finer granularity (e.g., "hand-headed cut nail"
// observation → fastener_type_early_hand_headed_cut_nail instead of subcategory level).
export const CLUE_TO_ALTERNATIVES: Record<string, string[]> = {
  hand_forged_nail: [
    "fastener_subcategory_hand_forged_nails", // primary
    "fastener_type_rosehead_nail",
    "fastener_type_l_head_t_head_nail",
  ],
  cut_nail: [
    "fastener_subcategory_cut_nails", // primary
    "fastener_type_early_hand_headed_cut_nail", // pre-1830
    "fastener_type_machine_headed_cut_nail", // post-1830
    "fastener_type_brad_finish_cut_nail",
  ],
  wire_nail: [
    "fastener_subcategory_wire_nails", // primary
    "fastener_type_common_wire_nail",
    "fastener_type_finish_nail",
    "fastener_type_box_nail",
  ],
  staple_fastener: [
    "fastener_subcategory_machine_staples", // primary (construction context)
    "fastener_subcategory_upholstery_tacks", // upholstery context per D-FA33-5
  ],
  plywood_drawer_bottom: [
    "substrate_evidence_plywood", // primary (substrate identification)
    "joinery_type_plywood_drawer_bottom", // joinery-level designation (D-PH3HCL-S3-3)
  ],
  decorative_bail_pull: [
    "hardware_category_pull_hardware", // primary (category)
    "hardware_type_drop_pull_bail_pull",
    "hardware_type_batwing_bail_pull",
    "hardware_type_chippendale_bail_pull",
    "hardware_type_sheraton_oval_bail_pull",
  ],
};

/**
 * Resolve an engine clue key to canonical entry ID (or NO_MATCH).
 * Primary lookup; for finer-grained alternatives see CLUE_TO_ALTERNATIVES.
 */
export function canonicalIdForClue(engineKey: string): CanonicalLookup {
  return CLUE_TO_CANONICAL[engineKey] ?? NO_MATCH;
}

/**
 * Resolve an engine form-label string to canonical form_id (or NO_MATCH).
 * Block 1 scoreForms output preserves the engine label as display_name per D-PH3-7.
 */
export function canonicalFormIdForLabel(engineLabel: string): CanonicalLookup {
  return FORM_LABEL_TO_CANONICAL[engineLabel] ?? NO_MATCH;
}

/**
 * Check whether an engine clue key has been migrated to canonical (i.e. Block 1
 * deleted its CLUE_LIBRARY entry). Returns true if migrated, false if KEPT_IN_ENGINE.
 */
export function isMigratedClue(engineKey: string): boolean {
  return engineKey in CLUE_TO_CANONICAL;
}
