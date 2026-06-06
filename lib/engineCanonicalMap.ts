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
  // Pegged / drawbored M&T are DISTINCT dated canonical entries (not the
  // persistent-nondating family). The LLM emits these keys but they were
  // unwired, so a drawbored peg — a strong pre-1920 vernacular signal — dated
  // nothing and left the joinery row blank in the visual reference.
  pegged_mortise_tenon: "joinery_type_pegged_mortise_and_tenon",
  pegged_mortise_and_tenon: "joinery_type_pegged_mortise_and_tenon",
  drawbored_mortise_tenon: "joinery_type_drawbored_mortise_and_tenon",
  drawbored_mortise_and_tenon: "joinery_type_drawbored_mortise_and_tenon",
  // ── Reachability pass: dated joinery entries with no clue route. Edge / case
  // / tenon / dovetail / veneer / metal-joint methods. (confirmat, cam-lock,
  // corrugated joinery skipped — duplicate fastener concepts already wired;
  // plywood_drawer_bottom already routes to substrate.) ──
  butt_edge_glued: "joinery_type_butt_edge_glued",
  tongue_and_groove: "joinery_type_tongue_and_groove",
  spline_joint: "joinery_type_spline_joint",
  biscuit_joint: "joinery_type_biscuit_joint",
  butterfly_key: "joinery_type_butterfly_dutchman_key",
  dutchman_key: "joinery_type_butterfly_dutchman_key",
  butt_joint: "joinery_type_basic_butt_corner",
  rabbet_joint: "joinery_type_rabbet_joint",
  miter_joint: "joinery_type_miter_joint",
  locked_miter: "joinery_type_locked_miter",
  half_lap_joint: "joinery_type_half_lap_joint",
  bridle_joint: "joinery_type_bridle_joint",
  finger_joint: "joinery_type_finger_box_joint",
  box_joint: "joinery_type_finger_box_joint",
  through_dovetail: "joinery_type_through_dovetail",
  sliding_dovetail: "joinery_type_sliding_dovetail",
  half_blind_dovetail: "joinery_type_half_blind_dovetail",
  secret_mitered_dovetail: "joinery_type_secret_mitered_dovetail",
  stapled_drawer_joinery: "joinery_type_stapled_drawer_joinery",
  frame_and_panel: "joinery_type_frame_and_panel",
  frame_and_panel_sides: "joinery_type_frame_and_panel",
  through_mortise_and_tenon: "joinery_type_through_mortise_and_tenon",
  blind_mortise_and_tenon: "joinery_type_blind_mortise_and_tenon",
  wedged_tenon: "joinery_type_wedged_tenon",
  round_tenon_joinery: "joinery_type_round_tenon_joinery",
  round_tenon: "joinery_type_round_tenon_joinery",
  splayed_wedged_through_tenons: "joinery_type_splayed_wedged_through_tenons",
  pocket_screw_joinery: "joinery_type_pocket_screw_joinery",
  pocket_screw: "joinery_type_pocket_screw_joinery",
  hammer_veneering: "joinery_type_hammer_veneering",
  vacuum_press_veneering: "joinery_type_vacuum_press_veneering",
  knuckle_joint: "joinery_type_knuckle_joint",
  coopered_joinery: "joinery_type_coopered_joinery",
  bed_bolt_joinery: "joinery_type_bed_bolt_joinery",
  cnc_interlocking_joinery: "joinery_type_cnc_interlocking_joinery",
  corner_block_reinforcement: "joinery_type_corner_block_reinforcement",
  webbing_rail_joinery: "joinery_type_webbing_rail_joinery",
  factory_case_construction: "joinery_type_factory_case_construction",
  glued_and_nailed_casework: "joinery_type_glued_and_nailed_casework",
  dado_joint: "joinery_type_dado_joint",
  hand_forged_metal_joint: "joinery_type_hand_forged_metal_joint",
  riveted_metal_joint: "joinery_type_riveted_metal_joint",
  brazed_metal_joint: "joinery_type_brazed_metal_joint",
  soldered_metal_joint: "joinery_type_soldered_metal_joint",
  arc_welded_joint: "joinery_type_oxyacetylene_arc_welded_joint",
  spot_welded_joint: "joinery_type_spot_welded_joint",
  mig_tig_welded_joint: "joinery_type_mig_tig_welded_joint",
  crimped_or_folded_seam: "joinery_type_crimped_or_folded_seam",
  wire_wrapped_metal_joint: "joinery_type_wire_wrapped_metal_joint",
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
  // Slotted wood screw — the textbook datable fastener (canonical primary
  // dominance 1840–1940). The LLM emits `slotted_screw` constantly but it was
  // unwired, so it landed in "hardware" with NO date band. Wiring it to the
  // canonical fastener entry routes it to the FASTENER layer with its dated
  // window — exactly the kind of layered dating clue the visual reference
  // should show.
  slotted_screw: "fastener_type_slotted_wood_screw",
  slotted_wood_screw: "fastener_type_slotted_wood_screw",
  // ── Reachability pass: dated fastener entries that previously had no clue
  // route (the visual reference's fastener row stayed blank). Each key below is
  // now both instructed to the P0 model (via the canonical appendix) and routed
  // to its dated entry. Nails: ──
  rosehead_nail: "fastener_type_rosehead_nail",
  l_head_nail: "fastener_type_l_head_t_head_nail",
  t_head_nail: "fastener_type_l_head_t_head_nail",
  hand_headed_cut_nail: "fastener_type_early_hand_headed_cut_nail",
  machine_headed_cut_nail: "fastener_type_machine_headed_cut_nail",
  brad_nail: "fastener_type_brad_finish_cut_nail",
  common_wire_nail: "fastener_type_common_wire_nail",
  finish_nail: "fastener_type_finish_nail",
  box_nail: "fastener_type_box_nail",
  // Screws / drives:
  handmade_wood_screw: "fastener_type_handmade_wood_screw",
  brass_wood_screw: "fastener_type_brass_wood_screw",
  brass_screw: "fastener_type_brass_wood_screw",
  steel_wood_screw: "fastener_type_steel_wood_screw",
  steel_screw: "fastener_type_steel_wood_screw",
  robertson_screw: "fastener_type_robertson",
  square_drive_screw: "fastener_type_robertson",
  torx_screw: "fastener_type_torx",
  allen_screw: "fastener_type_allen_hex_socket_screw",
  hex_socket_screw: "fastener_type_allen_hex_socket_screw",
  machine_cut_screw: "fastener_subcategory_machine_cut_screws",
  modern_drive_screw: "fastener_subcategory_modern_drive_types",
  confirmat_screw: "fastener_type_confirmat_screw",
  // Bolts / knock-down / specialty (cam_lock kept for hardware; here the
  // knock-down fastener uses the distinct cam_lock_connector key):
  carriage_bolt: "fastener_type_carriage_bolt",
  threaded_rod: "fastener_type_threaded_rod",
  barrel_nut: "fastener_type_barrel_nut_cross_dowel",
  cross_dowel: "fastener_type_barrel_nut_cross_dowel",
  cam_lock_connector: "fastener_type_cam_lock_connector",
  corrugated_fastener: "fastener_type_corrugated_fastener",
  compression_plate_fastener: "fastener_type_biscuit_compression_plate",

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
  // ── Reachability pass: dated WOOD-EVIDENCE entries with no clue route (the
  // chart's Wood/Substrate row). Wire to wood_species_evidence / cut_grain_
  // evidence / substrate_evidence / wood_diagnostic_signal — these route to the
  // materials layer. (The parallel woodIdentification library is for species ID,
  // not the dating layer; left unwired to avoid key collisions. plywood already
  // wired above.) Substrates (strong daters): ──
  hardboard: "substrate_evidence_hardboard_masonite",
  masonite: "substrate_evidence_hardboard_masonite",
  particleboard: "substrate_evidence_particleboard",
  mdf: "substrate_evidence_mdf",
  mdf_core: "wood_diagnostic_signal_mdf_core",
  composite_veneer_core: "substrate_evidence_composite_veneer_cores",
  // Cut grain / veneer methods:
  flat_sawn: "cut_grain_evidence_flat_sawn",
  quarter_sawn: "cut_grain_evidence_quarter_sawn",
  rift_sawn: "cut_grain_evidence_rift_sawn",
  live_sawn: "cut_grain_evidence_live_sawn",
  burl_figure: "cut_grain_evidence_burl",
  birdseye_figure: "cut_grain_evidence_birdseye",
  curly_figure: "cut_grain_evidence_curly_figure",
  quilted_figure: "cut_grain_evidence_quilted_figure",
  flame_figure: "cut_grain_evidence_flame_figure",
  spalted_figure: "cut_grain_evidence_spalted_figure",
  crotch_figure: "cut_grain_evidence_crotch_figure",
  ray_fleck: "cut_grain_evidence_ray_fleck",
  ribbon_stripe: "cut_grain_evidence_ribbon_stripe",
  rotary_cut_veneer: "cut_grain_evidence_rotary_cut_veneer",
  plain_sliced_veneer: "cut_grain_evidence_plain_sliced_veneer",
  bookmatching: "cut_grain_evidence_bookmatching",
  slip_matching: "cut_grain_evidence_slip_matching",
  chatoyance: "cut_grain_evidence_chatoyance",
  hand_sawn_veneer: "cut_grain_evidence_hand_sawn_veneer",
  thick_veneer: "cut_grain_evidence_thick_veneer",
  heart_pine_grain: "cut_grain_evidence_heart_pine",
  // Diagnostic signals (substrate/veneer thickness — strong modern vs early):
  massive_solid_oak: "wood_diagnostic_signal_massive_solid_oak",
  thick_walnut_veneer: "wood_diagnostic_signal_thick_walnut_veneer",
  thin_walnut_veneer_over_plywood: "wood_diagnostic_signal_thin_walnut_veneer_over_plywood",
  quarter_sawn_white_oak: "wood_diagnostic_signal_quarter_sawn_white_oak",
  satinwood_inlay: "wood_diagnostic_signal_satinwood_inlay",
  gumwood_stained_dark: "wood_diagnostic_signal_gumwood_stained_dark",
  heavy_rosewood_veneer: "wood_diagnostic_signal_heavy_rosewood_veneer",
  // Species (broad daters, but populate the wood layer; LLM emits wood_species_*):
  wood_species_oak: "wood_species_evidence_oak_group",
  wood_species_ash: "wood_species_evidence_ash",
  wood_species_elm: "wood_species_evidence_elm",
  wood_species_hickory: "wood_species_evidence_hickory",
  wood_species_walnut: "wood_species_evidence_walnut_group",
  wood_species_walnut_group: "wood_species_evidence_walnut_group",
  wood_species_cherry: "wood_species_evidence_cherry_group",
  wood_species_maple: "wood_species_evidence_maple_group",
  wood_species_mahogany: "wood_species_evidence_mahogany_group",
  wood_species_mahogany_group: "wood_species_evidence_mahogany_group",
  wood_species_birch: "wood_species_evidence_birch_group",
  wood_species_beech: "wood_species_evidence_beech_group",
  wood_species_poplar: "wood_species_evidence_poplar_group",
  wood_species_gumwood: "wood_species_evidence_gumwood_group",
  wood_species_basswood: "wood_species_evidence_basswood",
  wood_species_pine: "wood_species_evidence_pine_group",
  wood_species_redwood: "wood_species_evidence_redwood",
  wood_species_rosewood: "wood_species_evidence_rosewood_group",
  wood_species_ebony: "wood_species_evidence_ebony_group",
  wood_species_satinwood: "wood_species_evidence_satinwood_group",
  wood_species_zebrawood: "wood_species_evidence_zebrawood",
  wood_species_teak: "wood_species_evidence_teak",

  // ── HARDWARE (delete from CLUE_LIBRARY where canonical exists) ────────────
  modern_concealed_hinge: "hardware_type_concealed_euro_hinge",
  porcelain_caster: "hardware_type_porcelain_caster",
  decorative_bail_pull: "hardware_category_pull_hardware", // category-level; LLM may specify type
  round_wood_knob: "hardware_type_turned_wooden_knob",
  wood_knob_pulls: "hardware_type_turned_wooden_knob",
  lock_escutcheons: "hardware_category_escutcheons",
  ormolu_mounts: NO_MATCH, // french-style mount; not in canonical hardware yet
  brass_foot_sabots: NO_MATCH, // french-style mount; not in canonical hardware yet
  // ── Reachability pass: dated hardware entries with no clue route. Pulls,
  // knobs, locks, escutcheons, hinges, casters, brackets, era-hardware.
  // (upholstery_tacks skipped — upholstery layer + fastener collision.) ──
  drop_bail_pull: "hardware_type_drop_pull_bail_pull",
  batwing_pull: "hardware_type_batwing_bail_pull",
  chippendale_pull: "hardware_type_chippendale_bail_pull",
  sheraton_oval_pull: "hardware_type_sheraton_oval_bail_pull",
  porcelain_knob: "hardware_type_porcelain_knob",
  pressed_glass_knob: "hardware_type_pressed_glass_knob",
  depression_glass_knob: "hardware_type_depression_glass_knob",
  bin_pull: "hardware_type_bin_pull",
  cardholder_bin_pull: "hardware_type_cardholder_bin_pull",
  ring_pull: "hardware_type_ring_pull",
  half_mortise_lock: "hardware_type_half_mortise_lock",
  full_mortise_lock: "hardware_type_full_mortise_lock",
  surface_mount_lock: "hardware_type_surface_mount_lock",
  cam_lock: "hardware_type_cam_lock",
  pierced_escutcheon: "hardware_type_pierced_escutcheon",
  stamped_escutcheon: "hardware_type_stamped_escutcheon",
  cast_escutcheon: "hardware_type_cast_escutcheon",
  butt_hinge: "hardware_type_butt_hinge",
  hand_forged_hinge: "hardware_type_hand_forged_butt_hinge",
  machine_made_hinge: "hardware_type_machine_made_butt_hinge",
  hl_hinge: "hardware_type_h_l_hinge",
  strap_hinge: "hardware_type_strap_hinge",
  piano_hinge: "hardware_type_piano_hinge",
  butterfly_hinge: "hardware_type_butterfly_hinge",
  wooden_caster: "hardware_type_wooden_caster",
  rubber_caster: "hardware_type_rubber_caster",
  corner_bracket: "hardware_type_campaign_corner_bracket",
  edge_strapping: "hardware_type_edge_strapping",
  draw_leaf_support: "hardware_type_draw_leaf_support_hardware",
  tilt_top_lock: "hardware_type_tilt_top_lock_hardware",
  cylinder_desk_mechanism: "hardware_type_cylinder_desk_mechanism",
  decorative_nailhead_trim: "hardware_type_decorative_nailhead_trim",
  coil_spring_hardware: "hardware_type_coil_spring_hardware",
  eastlake_hardware: "hardware_type_eastlake_hardware",
  eastlake_brass_pull: "hardware_type_eastlake_brass_pull",
  art_deco_hardware: "hardware_type_art_deco_hardware",
  mcm_hardware: "hardware_type_mid_century_modern_hardware",
  industrial_hardware: "hardware_type_machine_age_industrial_hardware",
  bakelite_hardware: "hardware_type_bakelite_hardware",
  lucite_hardware: "hardware_type_acrylic_lucite_hardware",

  // ── FORM-ANCHORED CLUES (delete from CLUE_LIBRARY where canonical FormEntry exists) ──
  telephone_shelf: "form_telephone_stand", // closest canonical; telephone_bench not in forms.ts
  slant_front: "form_slant_front_desk",
  cylinder_roll: "form_cylinder_desk",
  drop_leaf_hinged: "form_drop_leaf_table",
  gateleg_support: NO_MATCH, // form_gateleg_desk exists but is for desk form; table version not present
  lift_lid: "form_blanket_chest",
  multiple_drawer_case: "form_chest_of_drawers",
  metal_bed_frame: "form_iron_bed",

  // ── Phase 0 Part A direct object-form clues (2026-05-28) ────────────────
  // Twelve new form-signal clue keys authored alongside the P0 prompt
  // additions. Each routes to an EXISTING canonical form_id; settee, three
  // rocker variants, the case forms, and the dressing table all land here.
  // Subtype attachments and the peacock chair are held back to Part B.
  settee_two_seat_form:  "form_settee",
  windsor_chair_form:    "form_windsor_chair",
  rocking_chair_form:    "form_rocking_chair",
  windsor_rocker_form:   "form_rocking_chair",
  parlor_rocker_form:    "form_rocking_chair",
  platform_rocker_form:  "form_rocking_chair",
  chest_of_drawers_form: "form_chest_of_drawers",
  dresser_form:          "form_dresser",
  bistro_table_form:     "form_bistro_cafe_table",
  china_cabinet_form:    "form_china_cabinet",
  dressing_table_form:   "form_dressing_table",
  milking_stool_form:    "form_stool",

  // ── CLOCK CLUE ROUTES (stress-test fix #4, 2026-05-20) ────────────────────
  // form_shelf_clock + form_tall_case_clock + form_wall_clock canonicals
  // already exist in forms.ts (user-authored); the gap was that NO clue
  // keys routed to them, so the LLM emitting rich clock observations
  // (arched_glazed_dial_door, turned_spindle_gallery, etc.) had nowhere
  // for that evidence to land — the engine returned "Unclassified
  // furniture" on clocks. These routes wire the common clock clue keys
  // to form_shelf_clock as the umbrella canonical (covers mantel /
  // shelf / kitchen / gingerbread / Victorian / Eastlake / steeple /
  // beehive / round-top / black mantel / tambour / novelty subtypes).
  // Tall case clocks and wall clocks have distinctive clue keys (longcase
  // chamber, hood, weight drop, hanging hardware) — those would route
  // to their dedicated forms when LLM emits them; current LLM observation
  // patterns center on shelf-clock evidence per the stress-test scans.
  metal_clock_form: "form_shelf_clock",
  clock_case_form: "form_shelf_clock",
  arched_glazed_dial_door: "form_shelf_clock",
  turned_spindle_gallery: "form_shelf_clock",
  scrolled_side_corbels: "form_shelf_clock",
  reverse_painted_lower_tablet: "form_shelf_clock",
  winding_arbors: "form_shelf_clock",
  striking_mechanism: "form_shelf_clock",
  pendulum_bob_cast: "form_shelf_clock",
  brass_dial_bezel: "form_shelf_clock",

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
  // Taxonomy-gap forms (#22) — labels for the new scoreForms routes.
  "Harpsichord": "form_harpsichord",
  "Planter": "form_planter",
  "Pedestal chair": "form_pedestal_chair",
  "Music box": "form_music_box",
  "Office chair": "form_office_chair",
  "Peacock chair": "form_peacock_chair",
  "Patio chair": "form_patio_chair",
  // Cedar chests
  "Roos cedar chest / hope chest": "form_blanket_chest",
  "Lane cedar chest / hope chest": "form_blanket_chest",
  "Cedar chest / hope chest": "form_blanket_chest",

  // Industrial / professional / institutional cluster (scoreForms detectors added).
  "Dry sink": "form_dry_sink",
  "Barber station": "form_barber_station",
  "Salon station": "form_salon_station",
  "Time clock station": "form_time_clock_station",
  "Cabinet of curiosities": "form_cabinet_of_curiosities",
  "Easel": "form_easel",
  "Music stand": "form_music_stand",
  "Pulpit": "form_pulpit",
  "Lectern": "form_lectern",
  "Podium": "form_podium",
  "Church furnishing": "form_church_furnishing",
  "Showcase": "form_showcase",
  "Kiosk": "form_kiosk",
  "Bank fixture": "form_bank_fixture",
  "Utility cart": "form_utility_cart",
  "Locker": "form_locker",
  "Scientific stand": "form_scientific_stand",
  "Safety fixture": "form_safety_fixture",
  "Retail fixture": "form_retail_fixture",
  "Shelving system": "form_shelving_system",
  "Rack": "form_rack",
  "Built-in storage": "form_built_in_storage",
  "Environmental utility form": "form_environmental_utility_form",
  "Workstation accessory": "form_workstation_accessory",
  "Kitchen utility unit": "form_kitchen_utility_unit",
  "Beverage service form": "form_beverage_service_form",
  "Hospitality fixture": "form_hospitality_fixture",
  "Educational fixture": "form_educational_fixture",
  "Industrial station": "form_industrial_station",
  // Entry / support hall-piece cluster (scoreForms detectors added).
  "Hall tree": "form_hall_tree",
  "Coat rack": "form_coat_rack",
  "Hat rack": "form_hat_rack",
  "Umbrella stand": "form_umbrella_stand",
  "Valet stand": "form_valet_stand",
  "Smoking stand": "form_smoking_stand",
  "Pedestal": "form_pedestal",
  "Aquarium stand": "form_aquarium_stand",
  "Screen": "form_screen",
  "Mirror": "form_mirror",
  "Telephone stand": "form_telephone_stand",
  "Charging station": "form_charging_station",
  "Package station": "form_package_station",
  "Box": "form_box",
  "Hammock stand": "form_hammock_stand",
  "Funeral bier": "form_funeral_bier",
  "Toy storage": "form_toy_storage",
  "Utility bench": "form_bench_utility",
  "Entry organizer": "form_entry_organizer",
  "Pet furniture": "form_pet_utility",
  // Desks
  "Telephone bench": "form_telephone_stand",
  "Telephone bench / secretary combination": "form_telephone_stand",
  "Telephone bench / writing bench combination": "form_telephone_stand",
  "Secretary desk / drop-front desk": "form_secretary_desk",
  "Secretary desk / writing desk": "form_secretary_desk",
  "Slant-front desk": "form_slant_front_desk",
  "Cylinder desk (bureau à cylindre)": "form_cylinder_desk",
  "Louis XVI Revival cylinder desk (bureau à cylindre)": "form_cylinder_desk", // legacy fused label; kept as matching alias
  "Cylinder roll-top desk": "form_cylinder_desk",
  // Cover-mechanism cluster — distinct cousins of the cylinder desk.
  "Roll-top desk": "form_roll_top_desk",
  "Tambour desk": "form_tambour_desk",
  "Wooton desk": "form_wooton_desk",
  // Institutional / public-task cluster.
  "School desk": "form_school_desk",
  "Teacher's desk": "form_teachers_desk",
  "Lectern desk": "form_lectern_desk",
  "Transaction counter desk": "form_transaction_counter_desk",
  "Reception desk": "form_reception_desk",
  "Clerk's desk": "form_clerks_desk",
  "Standing desk": "form_standing_desk",
  // Seated pedestal / knee cluster + multi-user pair.
  "Partner's desk": "form_partners_desk",
  "Benching desk": "form_benching_desk",
  "Davenport desk": "form_davenport_desk",
  "Credenza desk": "form_credenza_desk",
  "Executive desk": "form_executive_desk",
  "Kneehole desk": "form_kneehole_desk",
  "Pedestal desk": "form_pedestal_desk",
  // Office-equipment / machine-support cluster.
  "Typewriter desk": "form_typewriter_desk",
  "Modular workstation desk": "form_modular_workstation_desk",
  "U-shaped desk": "form_u_shaped_desk",
  "L-shaped desk": "form_l_shaped_desk",
  "Computer desk": "form_computer_desk",
  // Fall/slope-front writing-desk family.
  "Secrétaire à abattant": "form_secretaire_a_abattant",
  "Bureau à gradins": "form_bureau_a_gradins",
  "Escritoire": "form_escritoire",
  "Fall-front desk": "form_fall_front_desk",
  // Open writing-surface cluster.
  "Bonheur du jour": "form_bonheur_du_jour",
  "Carlton House desk": "form_carlton_house_desk",
  "Bureau plat": "form_bureau_plat",
  "Kidney desk": "form_kidney_desk",
  // Cabinet-integrated + architectural built-in clusters.
  "Murphy desk": "form_murphy_desk",
  "Wall unit desk": "form_wall_unit_desk",
  "Built-in desk": "form_built_in_desk",
  "Wall desk": "form_wall_desk",
  "Hutch desk": "form_hutch_desk",
  "Armoire desk": "form_armoire_desk",
  // Task-specific + portable clusters.
  "Writing box": "form_writing_box",
  "Field desk": "form_field_desk",
  "Tabletop desk": "form_tabletop_desk",
  "Artist's desk": "form_artists_desk",
  "Laboratory desk": "form_laboratory_desk",
  "Workbench desk": "form_workbench_desk",
  // Convertible / repurposed cluster.
  "Piano desk": "form_piano_desk",
  "Organ desk": "form_organ_desk",
  "Sewing machine desk": "form_sewing_machine_desk",
  "Converted treadle machine desk": "form_converted_treadle_machine_desk",
  "Telephone desk": "form_telephone_desk",
  "Drop-leaf desk": "form_drop_leaf_desk",
  "Gateleg desk": "form_gateleg_desk",
  "Converted dressing table desk": "form_converted_dressing_table_desk",
  "Converted industrial desk": "form_converted_industrial_desk",
  "Converted cabinet desk": "form_converted_cabinet_desk",

  // Tables — comprehensive bare-alias routes for existing canonicals.
  // Previously a pre-existing gap: ~16 table canonicals existed in forms.ts
  // but had no engine-label routes here. Surfaced during Tier A
  // form_occasional_table / form_cocktail_table integration (9aae961).
  "Drop-leaf table": "form_drop_leaf_table",
  "Gateleg table": "form_gateleg_table", // remapped from form_drop_leaf_table per #6 elevation (commit lands with drum/gateleg pair); subtype within form_drop_leaf_table remains as cross-reference
  "Extension table": "form_extension_table",
  "Dining table": "form_dining_table",
  "Dining room table": "form_dining_table",
  "Side table": "form_side_table",
  "End table": "form_side_table",
  "Coffee table": "form_coffee_table",
  "Tea table": "form_tea_table",
  "Center table": "form_center_table",
  "Parlor table": "form_parlor_table", // remapped from form_center_table per Tier C parlor_table elevation; center_table cousin-contrast cross-reference remains in form_center_table
  "Console table": "form_console_table",
  "Console": "form_console_table",
  "Hall console": "form_console_table",
  "Sofa table": "form_sofa_table",
  "Pedestal table": "form_pedestal_table",
  "Pier table": "form_pier_table",
  // Pedestal-column split targets (resolved at scoreForms from carried-object
  // cues). Previously unmapped despite the line ~349 note assuming they existed.
  "Candle stand": "form_candle_stand",
  "Plant stand": "form_plant_stand",
  "Pub table": "form_pub_table",
  "Tavern table": "form_pub_table",
  "Library table": "form_library_table",
  "Writing table": "form_writing_table",
  "Drafting table": "form_drafting_table",
  "Architect's table": "form_drafting_table",
  "Sewing table": "form_sewing_table",
  "Dressing table": "form_dressing_table",
  "Vanity table": "form_dressing_table",
  // Bedroom clothing-storage cluster (orphaned forms now wired with scoreForms
  // detectors). "Dresser" is the form, NOT the cluster — cue-gated against
  // chest of drawers, so plain stacked drawers stay form_chest_of_drawers.
  "Dresser": "form_dresser",
  "Low chest": "form_low_chest",
  "Highboy": "form_highboy",
  "Chifforobe": "form_chifforobe",
  "Wardrobe": "form_wardrobe",
  "Armoire": "form_armoire",
  "Washstand": "form_washstand",
  "Commode (close stool)": "form_commode",
  "Nightstand": "form_nightstand",
  "Trunk": "form_trunk",
  "Game table": "form_game_table",
  "Card table": "form_game_table", // card table is a game-table subtype
  "Gaming table": "form_game_table",
  "Nesting table": "form_nesting_tables",
  "Nesting tables": "form_nesting_tables",
  "Nest of tables": "form_nesting_tables",
  "Tray table": "form_tray_table",
  "TV tray": "form_tray_table",
  "Folding tray": "form_tray_table",
  "Etagere table": "form_etagere_table",
  "Étagère table": "form_etagere_table",
  "Etagere": "form_etagere_table",
  "Étagère": "form_etagere_table",
  "Tier table": "form_etagere_table",
  "Tiered display table": "form_etagere_table",
  "Ottoman table": "form_ottoman_table",
  "Lowboy": "form_lowboy",
  "Pedestal stand": NO_MATCH, // intentionally generic; resolves at scoreForms via pedestal-table vs plant-stand vs candle-stand structural cues

  // Pedestal-cluster elevations (#6) — peer canonicals lifted from
  // form_pedestal_table subtypes per appraiser elevation decision.
  // Existing subtype cross-references in form_pedestal_table remain.
  "Tilt-top table": "form_tilt_top_table",
  "Tip-top table": "form_tilt_top_table",
  "Tilt table": "form_tilt_top_table",
  "Flip-top table": "form_tilt_top_table",
  "Tilting tea table": "form_tilt_top_table",
  "Tripod tilt-top table": "form_tilt_top_table", // subtype_tilt_top_tripod
  "Birdcage table": "form_tilt_top_table", // subtype_tilt_top_birdcage (cross-references subtype_piecrust_birdcage)
  "Birdcage tilt-top table": "form_tilt_top_table", // subtype_tilt_top_birdcage
  "Piecrust table": "form_piecrust_table", // edge identity dominant; subtype_tilt_top_piecrust cross-references
  "Pie-crust table": "form_piecrust_table",
  "Pie crust table": "form_piecrust_table",
  "Piecrust tea table": "form_piecrust_table", // subtype_piecrust_tea
  "Piecrust tilt-top table": "form_piecrust_table", // subtype_piecrust_tilt_top (cross-references subtype_tilt_top_piecrust)
  "Chippendale piecrust table": "form_piecrust_table", // subtype_piecrust_chippendale
  "Chippendale tea table": "form_piecrust_table", // subtype_piecrust_chippendale
  "Birdcage piecrust table": "form_piecrust_table", // subtype_piecrust_birdcage
  "Tripod piecrust table": "form_piecrust_table", // subtype_piecrust_tripod
  "Scalloped-edge table": "form_piecrust_table",
  "Scalloped tea table": "form_piecrust_table",
  "Carved-edge tea table": "form_piecrust_table",
  "Raised-edge tea table": "form_piecrust_table",
  "Mahogany piecrust table": "form_piecrust_table",
  "Colonial Revival piecrust table": "form_piecrust_table", // subtype_piecrust_revival
  // Note: "Colonial Revival tea table" appears in both form_tilt_top_table
  // and form_piecrust_table alias lists. Routed to form_piecrust_table
  // because the Colonial Revival tea-table tradition is more strongly
  // associated with piecrust edge treatment than with tilt mechanism
  // alone. Tilt-top revival examples activate via "Tilt-top table" or
  // "Colonial Revival tilt-top table" if the latter is used.
  "Colonial Revival tea table": "form_piecrust_table",
  "Drum table": "form_drum_table",
  "Library drum table": "form_drum_table", // subtype_drum_library
  "Round drum table": "form_drum_table",
  "Round pedestal table": "form_drum_table", // drum-shaped pedestal table; bare "Pedestal table" still routes to form_pedestal_table
  "Regency drum table": "form_drum_table", // subtype_drum_regency
  "Empire drum table": "form_drum_table", // subtype_drum_empire
  "Leather-top table": "form_drum_table", // subtype_drum_leather_top (boundary form; routes here when drum body is present)
  "Leather top drum table": "form_drum_table", // subtype_drum_leather_top
  "Leather-topped drum table": "form_drum_table",
  "Center drum table": "form_drum_table", // subtype_drum_center
  "Drum side table": "form_drum_table", // subtype_drum_side_lamp
  "Side drum table": "form_drum_table",
  "Occasional drum table": "form_drum_table", // subtype_drum_occasional
  "Pedestal drum table": "form_drum_table",
  "Round library table": "form_drum_table", // round library table identity overlaps drum and library; drum structure dominates
  "Circular library table": "form_drum_table",
  "Drawer drum table": "form_drum_table", // subtype_drum_storage
  "Storage drum table": "form_drum_table", // subtype_drum_storage
  // Note: "Lamp table" intentionally NOT mapped to form_drum_table —
  // bare alias is too ambiguous between drum-shaped lamp tables, side
  // tables with lamps, and lamp-specific tables; resolves at scoreForms.
  // "Center table" stays routed to form_center_table; drum-center
  // examples activate via "Center drum table" alias above.
  "Gate-leg table": "form_gateleg_table",
  "Gate leg table": "form_gateleg_table",
  "Drop-leaf gateleg": "form_gateleg_table",
  "Gateleg drop-leaf table": "form_gateleg_table",
  "Colonial gateleg": "form_gateleg_table",
  "Colonial Revival gateleg": "form_gateleg_table", // subtype_gateleg_colonial_revival
  "Barley-twist table": "form_gateleg_table", // subtype_gateleg_barley_twist
  "Barley-twist gateleg": "form_gateleg_table", // subtype_gateleg_barley_twist
  "William and Mary gateleg": "form_gateleg_table", // subtype_gateleg_william_and_mary
  "Folding dining table": "form_gateleg_table", // per user authoring; gateleg is the dominant folding-dining-table form
  "Drop-side dining table": "form_gateleg_table",
  "Drop-leaf dining table": "form_gateleg_table", // gateleg-specific dining variant
  "Small gateleg table": "form_gateleg_table", // subtype_gateleg_small
  "Kitchen gateleg table": "form_gateleg_table", // subtype_gateleg_kitchen
  "Breakfast gateleg table": "form_gateleg_table", // subtype_gateleg_breakfast
  "English gateleg table": "form_gateleg_table",
  "Trestle table": "form_trestle_table",
  "Trestle dining table": "form_trestle_table",
  "Refectory table": "form_trestle_table", // subtype_trestle_refectory
  "Refectory dining table": "form_trestle_table", // subtype_trestle_refectory
  "Monastery table": "form_trestle_table", // subtype_trestle_refectory
  "Abbey table": "form_trestle_table",
  "Harvest table": "form_trestle_table", // overlaps with subtype_kitchen_table_farm; trestle wins when end-support construction dominates
  "Sawhorse table": "form_trestle_table", // subtype_trestle_sawhorse
  "A-frame table": "form_trestle_table", // subtype_trestle_sawhorse
  "X-base table": "form_trestle_table",
  "Jacobean table": "form_trestle_table", // subtype_trestle_jacobean_revival
  "Jacobean Revival table": "form_trestle_table", // subtype_trestle_jacobean_revival
  "Tudor table": "form_trestle_table", // subtype_trestle_jacobean_revival
  "Mission trestle table": "form_trestle_table", // subtype_trestle_arts_crafts
  "Arts and Crafts trestle table": "form_trestle_table", // subtype_trestle_arts_crafts
  "Craftsman trestle table": "form_trestle_table", // subtype_trestle_arts_crafts
  "Library trestle table": "form_trestle_table", // subtype_trestle_library
  "Work trestle table": "form_trestle_table", // subtype_trestle_work
  "Draw-leaf trestle table": "form_trestle_table", // subtype_trestle_draw_leaf
  // Note: "Farm table", "Farmhouse table" stay routed to form_kitchen_table
  // (existing mappings per Tier A integration). Per trestle's own cousin
  // contrast, farm-table identity is use/context vocabulary; trestle activates
  // via "Trestle table" alias or via scoreForms structural cues when end-
  // support construction dominates. "Hall table" intentionally NOT mapped —
  // hall tables are more commonly console-table or hall-context tables;
  // trestle-as-hall-table examples activate via "Trestle table" alias.
  // Note: "Tea table", "Tripod table", "Pedestal table", "Candle stand",
  // "Candle table", "Occasional table" intentionally NOT remapped here —
  // they retain their existing routes to form_tea_table, form_pedestal_table
  // (Tripod is a subtype within), form_candle_stand, form_occasional_table.
  // The new canonicals activate via the more specific aliases above.
  // "Parlor table" WAS remapped from form_center_table to form_parlor_table
  // per the Tier C parlor_table elevation (see Tables section above).

  // Tier C peer-canonical elevations — parlor/Pembroke/Sutherland/demilune
  // forms lifted from cousin/subtype status per appraiser elevation.
  // Existing subtype cross-references in parent canonicals remain.
  "Parlour table": "form_parlor_table",
  "Victorian parlor table": "form_parlor_table",
  "Victorian parlour table": "form_parlor_table",
  "Marble-top parlor table": "form_parlor_table", // subtype_parlor_table_marble_top
  "Eastlake parlor table": "form_parlor_table", // subtype_parlor_table_eastlake
  "Eastlake table": "form_parlor_table", // Eastlake-style table; routes to parlor_table when parlor vocabulary dominates
  "Aesthetic Movement table": "form_parlor_table", // subtype_parlor_table_aesthetic_movement
  "Renaissance Revival parlor table": "form_parlor_table", // subtype_parlor_table_renaissance_revival
  "Rococo Revival parlor table": "form_parlor_table", // subtype_parlor_table_rococo_revival
  "Pedestal parlor table": "form_parlor_table", // subtype_parlor_table_pedestal
  "Golden Oak parlor table": "form_parlor_table", // subtype_parlor_table_golden_oak
  "Sitting-room table": "form_parlor_table",
  "Drawing-room table": "form_parlor_table",
  "Front-room table": "form_parlor_table",
  // Note: "Lamp table", "Display table", "Marble top table",
  // "Renaissance Revival table" (bare), "Rococo Revival table" (bare),
  // "Victorian accent table", "Victorian side table",
  // "Oak/Walnut/Rosewood parlor table" intentionally NOT mapped to
  // form_parlor_table — too generic (Lamp/Display already routed),
  // boundary with side/occasional/wood-only descriptors, or style-only
  // labels that need scoreForms structural disambiguation.

  "Pembroke table": "form_pembroke_table",
  "Pembroke side table": "form_pembroke_table",
  "Pembroke drop-leaf table": "form_pembroke_table",
  "Federal Pembroke table": "form_pembroke_table", // subtype_pembroke_federal
  "Sheraton Pembroke table": "form_pembroke_table", // subtype_pembroke_sheraton_hepplewhite
  "Hepplewhite Pembroke table": "form_pembroke_table", // subtype_pembroke_sheraton_hepplewhite
  "Colonial Revival Pembroke table": "form_pembroke_table", // subtype_pembroke_revival
  "Mahogany Pembroke table": "form_pembroke_table",
  // Note: "Lamp table", "Bedside table", "Drop-leaf side table",
  // "Small drop-leaf table", "Drop-side table", "Drop leaf end table",
  // "Small leaf table" intentionally NOT mapped to form_pembroke_table
  // — too generic; Bedside table belongs to form_nightstand identity
  // when bedroom storage dominates.

  "Sutherland table": "form_sutherland_table",
  "Sutherland drop-leaf": "form_sutherland_table",
  "Sutherland drop-leaf table": "form_sutherland_table",
  "Victorian Sutherland table": "form_sutherland_table",
  "Edwardian Sutherland table": "form_sutherland_table", // subtype_sutherland_edwardian
  "Mahogany Sutherland table": "form_sutherland_table",
  "Walnut Sutherland table": "form_sutherland_table",
  // Note: "Narrow drop-leaf table", "Slim drop-leaf table", "Folding side
  // table", "Drop-leaf occasional table", "Drop-leaf tea table",
  // "Parlor drop-leaf table", "Drop-side table", "Tea table" intentionally
  // NOT mapped — too generic or have own canonicals; scoreForms resolves
  // narrow-footprint cases via structural cues.

  "Demilune table": "form_demilune_table",
  "Demi-lune table": "form_demilune_table",
  "Half-moon table": "form_demilune_table",
  "Half moon table": "form_demilune_table",
  "Semicircular table": "form_demilune_table",
  "Semi-circular table": "form_demilune_table",
  "Demilune console": "form_demilune_table", // subtype_demilune_console
  "Demi-lune console": "form_demilune_table",
  "Half-round console": "form_demilune_table",
  "Half-round table": "form_demilune_table",
  "Federal demilune": "form_demilune_table", // subtype_demilune_federal
  "Sheraton demilune": "form_demilune_table", // subtype_demilune_sheraton_hepplewhite
  "Hepplewhite demilune": "form_demilune_table", // subtype_demilune_sheraton_hepplewhite
  "Neoclassical console": "form_demilune_table",
  "Pair of demilunes": "form_demilune_table", // subtype_demilune_pair
  "Fold-over demilune": "form_demilune_table", // subtype_demilune_card_table
  "Demilune card table": "form_demilune_table", // subtype_demilune_card_table
  // Note: "Hall table", "Entry table", "Entryway table", "Pier table",
  // "Federal table", "Wall table" intentionally NOT mapped to
  // form_demilune_table — Hall/Entry/Wall are placement-context labels
  // (resolve at scoreForms), Pier table has its own canonical
  // (form_pier_table), Federal table is style-only.

  "Bistro table": "form_bistro_cafe_table",
  "Bistro café table": "form_bistro_cafe_table",
  "Bistro cafe table": "form_bistro_cafe_table",
  "Café table": "form_bistro_cafe_table",
  "Cafe table": "form_bistro_cafe_table",
  "Sidewalk café table": "form_bistro_cafe_table",
  "Sidewalk cafe table": "form_bistro_cafe_table",
  "Paris café table": "form_bistro_cafe_table",
  "French café table": "form_bistro_cafe_table",
  "Counter-height table": "form_bistro_cafe_table", // subtype_bistro_counter_height
  "Patio bistro table": "form_bistro_cafe_table", // subtype_bistro_outdoor_patio
  "Patio café table": "form_bistro_cafe_table", // subtype_bistro_outdoor_patio
  "Cast-iron bistro table": "form_bistro_cafe_table", // subtype_bistro_cast_iron
  "Marble-top café table": "form_bistro_cafe_table", // subtype_bistro_marble_top
  "Ice-cream parlor table": "form_bistro_cafe_table", // subtype_bistro_cast_iron (commercial context)
  "Soda-fountain table": "form_bistro_cafe_table", // subtype_bistro_cast_iron (commercial context)
  "Commercial café table": "form_bistro_cafe_table", // subtype_bistro_commercial_restaurant
  "Folding café table": "form_bistro_cafe_table", // subtype_bistro_folding_cafe
  "Bar-height table": "form_pub_table", // bar/pub context dominates per bistro_cafe_table's bar-height cousin contrast
  "Bar table": "form_pub_table", // bar context dominates; bistro/café for non-bar-height examples
  // Note: "Pub table" stays routed to form_pub_table (existing); bistro
  // aliases include it but pub context controls. "Apartment dining table",
  // "Small dining table", "Round kitchen table", "Breakfast table" stay
  // routed to form_breakfast_table (Tier A); these are domestic seated-
  // dining-height labels not commercial café identity. "Restaurant table"
  // intentionally NOT mapped — too generic; resolves at scoreForms.

  // Case furniture
  "Chest of drawers / dresser": "form_chest_of_drawers",
  "Dresser / drawer case": "form_chest_of_drawers",
  "Cabinet / dresser combination": "form_chest_of_drawers",
  "Cabinet": "form_china_cabinet", // closest; multiple canonical cabinets exist
  "Bookcase / open shelving unit": "form_bookcase",

  // Beds
  "Iron bed frame": "form_iron_bed",
  "Brass bed or brass-frame furniture": "form_iron_bed",
  // NOTE: ↑ Redirected from form_bedstead → form_iron_bed on appraiser
  // approval (2026-05-19). Iron and brass beds are structurally distinct
  // from wooden bedsteads (metal frame, brazed/riveted/welded joinery,
  // japanned/plated/powder-coat finish) and route to the dedicated
  // form_iron_bed canonical with its metal-frame dating evidence pathway.
  // form_bedstead — wooden-bed routes (the iron/brass split sent metal beds to
  // form_iron_bed above; wooden beds route here). Emitted by the scoreForms
  // wooden-bedstead block (gated against metal/daybed/seating collisions).
  "Bedstead": "form_bedstead",
  "Four-poster bed": "form_bedstead", // subtype_four_poster_bed
  "Tester bed": "form_bedstead", // subtype_tester_bed (canopy bed)
  "Half-tester bed": "form_bedstead", // subtype_half_tester_bed
  "Low-post bed": "form_bedstead", // subtype_low_post_bed
  "Rope bed": "form_bedstead", // subtype_rope_bed
  "Sleigh bed": "form_bedstead", // subtype_sleigh_bed (NB: "Sleigh daybed" → form_daybed)
  "Spool bed": "form_bedstead", // subtype_spool_bed (Jenny Lind)
  "Cannonball bed": "form_bedstead", // cannonball-finial poster variant
  "Panel bed": "form_bedstead", // subtype_panel_bed

  // Iron bed routes — Batch 2 non-wood taxonomy expansion (2026-05-19)
  "Iron bed": "form_iron_bed",
  "Iron bedstead": "form_iron_bed",
  "Metal bed": "form_iron_bed",
  "Metal bedstead": "form_iron_bed",
  "Brass bed": "form_iron_bed",
  "Brass bedstead": "form_iron_bed",
  "Victorian brass bed": "form_iron_bed", // subtype_iron_bed_victorian_brass
  "Antique brass bed": "form_iron_bed",
  "Antique iron bed": "form_iron_bed",
  "Cast iron bed": "form_iron_bed", // subtype_iron_bed_painted_iron
  "Cast-iron bed": "form_iron_bed",
  "Wrought iron bed": "form_iron_bed",
  "Wrought-iron bed": "form_iron_bed",
  "Painted iron bed": "form_iron_bed", // subtype_iron_bed_painted_iron
  "Japanned iron bed": "form_iron_bed", // subtype_iron_bed_painted_iron (japanned finish c. 1850-1910)
  "Adirondack iron bed": "form_iron_bed", // subtype_iron_bed_adirondack_or_camp
  "Camp bed": "form_iron_bed", // subtype_iron_bed_adirondack_or_camp (boundary form with military/folding camp beds)
  "Cottage iron bed": "form_iron_bed", // subtype_iron_bed_adirondack_or_camp
  "Farmhouse iron bed": "form_iron_bed",
  "Tubular steel bed": "form_iron_bed", // subtype_iron_bed_tubular_steel_institutional
  "Tubular-steel bed": "form_iron_bed", // subtype_iron_bed_tubular_steel_institutional
  "Hospital bed": "form_iron_bed", // subtype_iron_bed_tubular_steel_institutional (historic; modern medical equipment out of scope)
  "Sanatorium bed": "form_iron_bed", // subtype_iron_bed_tubular_steel_institutional
  "Dormitory bed": "form_iron_bed", // subtype_iron_bed_tubular_steel_institutional
  "Institutional metal bed": "form_iron_bed", // subtype_iron_bed_tubular_steel_institutional
  "Cast-iron daybed": "form_iron_bed", // subtype_iron_bed_cast_iron_daybed (boundary form with form_daybed)
  "Iron fainting couch": "form_iron_bed", // subtype_iron_bed_cast_iron_daybed
  // Note: the CLUE_TO_CANONICAL metal_bed_frame alias was redirected to
  // form_iron_bed on 2026-05-19 (line 89 above) on appraiser approval.
  // Seating-suppression guard at engine.ts:3106-3115 continues to prevent
  // chair-form pieces from mis-routing when the LLM over-emits
  // metal_bed_frame on any iron/steel-framed furniture.

  // Clock routes — stress-test fix #4 (2026-05-20). form_shelf_clock,
  // form_tall_case_clock, and form_wall_clock canonicals already existed
  // in forms.ts; these aliases let LLM-emitted form labels reach them.
  "Mantel clock": "form_shelf_clock", // subtype_shelf_clock_mantel_clock
  "Mantle clock": "form_shelf_clock",
  "Shelf clock": "form_shelf_clock",
  "Kitchen clock": "form_shelf_clock", // subtype_shelf_clock_gingerbread
  "Parlor clock": "form_shelf_clock",
  "Gingerbread clock": "form_shelf_clock", // subtype_shelf_clock_gingerbread
  "Victorian shelf clock": "form_shelf_clock",
  "Victorian mantel clock": "form_shelf_clock",
  "Victorian gingerbread clock": "form_shelf_clock", // subtype_shelf_clock_gingerbread
  "Victorian kitchen clock": "form_shelf_clock", // subtype_shelf_clock_gingerbread
  "Eastlake mantel clock": "form_shelf_clock", // subtype_shelf_clock_eastlake
  "Eastlake shelf clock": "form_shelf_clock", // subtype_shelf_clock_eastlake
  "Steeple clock": "form_shelf_clock", // subtype_shelf_clock_steeple
  "Beehive clock": "form_shelf_clock", // subtype_shelf_clock_beehive
  "Round-top mantel clock": "form_shelf_clock", // subtype_shelf_clock_round_top
  "Round-top shelf clock": "form_shelf_clock", // subtype_shelf_clock_round_top
  "Arch-top mantel clock": "form_shelf_clock", // subtype_shelf_clock_round_top
  "Black mantel clock": "form_shelf_clock", // subtype_shelf_clock_black_mantel
  "Tambour clock": "form_shelf_clock", // subtype_shelf_clock_tambour_clock
  "Tambour mantel clock": "form_shelf_clock", // subtype_shelf_clock_tambour_clock
  "Connecticut shelf clock": "form_shelf_clock",
  "American shelf clock": "form_shelf_clock",
  "American mantel clock": "form_shelf_clock",
  "Antique mantel clock": "form_shelf_clock",
  "Antique shelf clock": "form_shelf_clock",
  "Seth Thomas mantel clock": "form_shelf_clock",
  "Ansonia mantel clock": "form_shelf_clock",
  "Waterbury mantel clock": "form_shelf_clock",
  "New Haven mantel clock": "form_shelf_clock",
  "Welch shelf clock": "form_shelf_clock",
  "Gilbert clock": "form_shelf_clock",
  "Ingraham clock": "form_shelf_clock",
  "Sessions clock": "form_shelf_clock",
  // Musical / mechanical + misc cluster (scoreForms detectors added).
  "Jukebox": "form_jukebox",
  "Arcade cabinet": "form_arcade_cabinet",
  "Pinball machine": "form_pinball_machine",
  "Loom": "form_loom",
  "Spinning wheel": "form_spinning_wheel",
  "Vending machine": "form_vending_machine",
  "Pump organ cabinet": "form_pump_organ_cabinet",
  "Musical instrument furniture": "form_musical_instrument_furniture",
  "Media console": "form_media_console",
  "Media storage unit": "form_media_storage_unit",
  "Media wall": "form_media_wall",
  "Equipment rack": "form_equipment_rack",
  "Interactive console": "form_interactive_console",
  "Icebox": "form_icebox",
  "Sewing machine cabinet": "form_sewing_machine_cabinet",
  "Basket": "form_basket",
  // Tall case clock + wall clock aliases route to their existing forms
  "Tall case clock": "form_tall_case_clock",
  "Grandfather clock": "form_tall_case_clock", // subtype grandfather
  "Grandmother clock": "form_tall_case_clock", // subtype grandmother
  "Granddaughter clock": "form_tall_case_clock", // subtype granddaughter
  "Longcase clock": "form_tall_case_clock",
  "Wall clock": "form_wall_clock",
  "Banjo clock": "form_wall_clock",
  "Schoolhouse clock": "form_wall_clock",
  "Regulator clock": "form_wall_clock",
  "Gallery clock": "form_wall_clock",
  "Calendar clock": "form_wall_clock",
  // Generic "Clock" — fallback to shelf_clock since mantel/shelf dominates
  // American antique production volume
  "Clock": "form_shelf_clock",
  "Antique clock": "form_shelf_clock",


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
  // Note: "Recliner" was previously mapped to form_lounge_chair here; remapped
  // to form_recliner below (the bare alias is mechanism-dominant per
  // form_recliner authoring decision; subtype_lounge_recliner remains as
  // cross-reference for club-chair-styled recliners).
  "Wing chair": "form_wing_chair",
  "Wingback chair": "form_wing_chair",
  "Wingback armchair": "form_wing_chair",
  "Wing-back chair": "form_wing_chair",
  "Queen Anne wing chair": "form_wing_chair", // subtype_wing_queen_anne within form_wing_chair
  "Chippendale wing chair": "form_wing_chair", // subtype_wing_chippendale within form_wing_chair
  "Federal wing chair": "form_wing_chair", // subtype_wing_federal within form_wing_chair
  "Fireside chair": "form_wing_chair",
  // Note: "Wing recliner" was previously mapped to form_wing_chair here;
  // remapped to form_recliner below (the bare alias is mechanism-dominant
  // per form_recliner authoring decision; subtype_wing_recliner remains
  // as cross-reference for wing-chair-styled recliners).
  // Note: "Easy chair" intentionally remains mapped to form_lounge_chair above
  // per modern dominant usage; 18th-century English period usage where
  // "easy chair" = wing chair is handled at scoreForms via structural cues
  // (wing presence routes to form_wing_chair regardless of common-alias hit).
  // Named seating-type forms (scoreForms detectors added; orphaned routes).
  "Side chair": "form_side_chair",
  "Bar chair": "form_bar_chair",
  "Folding chair": "form_folding_chair",
  "Ladderback chair": "form_ladderback_chair",
  "Windsor chair": "form_windsor_chair",
  "Rocking chair": "form_rocking_chair",
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
  "Bench / seating furniture": "form_bench",
  "Bench": "form_bench",
  "Hall bench": "form_bench", // subtype_bench_hall
  "Entry bench": "form_bench",
  "Foyer bench": "form_bench",
  "Piano bench": "form_bench", // subtype_bench_piano
  "Storage bench": "form_bench", // subtype_bench_storage
  "Window bench": "form_bench", // subtype_bench_window
  "Window seat": "form_bench", // subtype_bench_window
  "Garden bench": "form_bench", // subtype_bench_garden_park
  "Park bench": "form_bench", // subtype_bench_garden_park
  "Dining bench": "form_bench", // subtype_bench_dining
  "Farmhouse bench": "form_bench", // subtype_bench_dining
  "Upholstered bench": "form_bench", // subtype_bench_upholstered
  "Bed-end bench": "form_bench", // subtype_bench_upholstered
  "Vanity bench": "form_bench", // subtype_bench_upholstered
  "School bench": "form_bench", // subtype_bench_school
  "Settle bench": "form_bench", // subtype_bench_settle
  "Ottoman": "form_ottoman_footstool",
  "Footstool": "form_ottoman_footstool", // subtype_ottoman_footstool
  "Foot stool": "form_ottoman_footstool",
  "Footrest": "form_ottoman_footstool",
  "Hassock": "form_ottoman_footstool", // subtype_ottoman_hassock
  "Pouf": "form_ottoman_footstool", // subtype_ottoman_pouf
  "Pouffe": "form_ottoman_footstool",
  "Tuffet": "form_ottoman_footstool", // subtype_ottoman_tuffet
  "Storage ottoman": "form_ottoman_footstool", // subtype_ottoman_storage
  "Cocktail ottoman": "form_ottoman_footstool", // subtype_ottoman_cocktail (boundary form with form_ottoman_table)
  "Lounge ottoman": "form_ottoman_footstool", // subtype_ottoman_lounge
  "Bench ottoman": "form_ottoman_footstool", // subtype_ottoman_bench
  "Vanity ottoman": "form_ottoman_footstool",
  "Pew": "form_pew",
  "Church pew": "form_pew", // subtype_pew_church
  "Meetinghouse pew": "form_pew", // subtype_pew_meetinghouse
  "Meetinghouse bench": "form_pew",
  "Chapel pew": "form_pew",
  "Box pew": "form_pew", // subtype_pew_box
  "Gothic Revival pew": "form_pew", // subtype_pew_gothic_revival
  "Sanctuary pew": "form_pew",
  "Congregational pew": "form_pew",
  "Short pew": "form_pew", // subtype_pew_short (cut-down conversion)
  "Cut-down pew": "form_pew", // subtype_pew_short
  "Salvage pew": "form_pew", // subtype_pew_short
  "Sofa": "form_sofa",
  "Couch": "form_sofa",
  "Davenport": "form_sofa", // ambiguous with Davenport desk; resolves at scoreForms via construction cues
  "Divan": "form_sofa",
  "Loveseat": "form_sofa", // subtype_sofa_loveseat within form_sofa
  "Love seat": "form_sofa",
  "Sectional": "form_sofa", // subtype_sofa_sectional within form_sofa (post-1940)
  "Sectional sofa": "form_sofa", // subtype_sofa_sectional
  "Sectional couch": "form_sofa",
  "Sleeper sofa": "form_sofa", // subtype_sofa_sleeper within form_sofa (post-1899)
  "Sofa bed": "form_sofa", // subtype_sofa_sleeper
  "Convertible sofa": "form_sofa", // subtype_sofa_sleeper
  "Pull-out sofa": "form_sofa", // subtype_sofa_sleeper
  "Reclining sofa": "form_sofa", // subtype_sofa_reclining
  "Recliner sofa": "form_sofa", // subtype_sofa_reclining
  "Chesterfield": "form_sofa", // subtype_sofa_chesterfield
  "Chesterfield sofa": "form_sofa", // subtype_sofa_chesterfield
  "Tuxedo sofa": "form_sofa", // subtype_sofa_tuxedo
  "Camelback sofa": "form_sofa", // subtype_sofa_camelback
  "Lawson sofa": "form_sofa", // subtype_sofa_lawson
  "Parlor sofa": "form_sofa",
  "Parlor couch": "form_sofa",
  "Mid-century sofa": "form_sofa", // subtype_sofa_mcm
  "MCM sofa": "form_sofa", // subtype_sofa_mcm
  "Danish modern sofa": "form_sofa", // subtype_sofa_mcm
  "Settee": "form_settee",
  "Parlor settee": "form_settee", // subtype_settee_parlor
  "Hall settee": "form_settee", // subtype_settee_hall
  "Cane settee": "form_settee", // subtype_settee_cane_back
  "Cane-back settee": "form_settee", // subtype_settee_cane_back
  "Windsor settee": "form_settee", // subtype_settee_windsor
  "Wicker settee": "form_settee", // subtype_settee_wicker_rattan
  "Rattan settee": "form_settee", // subtype_settee_wicker_rattan
  "Porch settee": "form_settee",
  "Reception settee": "form_settee",
  // Note: "Canapé" / "Canape" intentionally NOT mapped — historically loose
  // term spanning sofa, settee, and chaise; resolves at scoreForms via
  // structural cues (depth, posture, lounge-vs-upright character).
  "Chaise longue": "form_chaise_longue",
  "Chaise lounge": "form_chaise_longue", // American misspelling, treated as alias
  "Long chair": "form_chaise_longue",
  "Fainting couch": "form_chaise_longue", // subtype_chaise_fainting_couch
  "Fainting sofa": "form_chaise_longue", // subtype_chaise_fainting_couch
  "Recamier": "form_chaise_longue", // subtype_chaise_recamier
  "Récamier": "form_chaise_longue", // subtype_chaise_recamier
  "Méridienne": "form_chaise_longue", // subtype_chaise_meridienne
  "Meridienne": "form_chaise_longue", // subtype_chaise_meridienne
  "Duchesse brisée": "form_chaise_longue", // subtype_chaise_duchesse_brisee
  "Duchesse brisee": "form_chaise_longue",
  "Patio chaise": "form_chaise_longue", // subtype_chaise_outdoor
  "Pool lounger": "form_chaise_longue", // subtype_chaise_outdoor
  "Outdoor lounger": "form_chaise_longue", // subtype_chaise_outdoor
  "Sun lounger": "form_chaise_longue", // subtype_chaise_outdoor
  "Garden chaise": "form_chaise_longue", // subtype_chaise_outdoor
  "Sectional chaise": "form_chaise_longue", // subtype_chaise_sectional_terminal (cross-references subtype_sofa_sectional)
  "Daybed": "form_daybed",
  "Day bed": "form_daybed",
  "Studio couch": "form_daybed", // subtype_daybed_studio_couch
  "Couch bed": "form_daybed",
  "Day couch": "form_daybed",
  "Lounge bed": "form_daybed",
  "Settee bed": "form_daybed",
  "Trundle daybed": "form_daybed", // subtype_daybed_trundle
  "Iron daybed": "form_daybed", // subtype_daybed_iron
  "Wood daybed": "form_daybed", // subtype_daybed_wood_frame
  "Upholstered daybed": "form_daybed", // subtype_daybed_upholstered
  "Platform daybed": "form_daybed", // subtype_daybed_modern_platform
  "Modern daybed": "form_daybed", // subtype_daybed_modern_platform
  "Mid-century daybed": "form_daybed", // subtype_daybed_mid_century
  "MCM daybed": "form_daybed", // subtype_daybed_mid_century
  "Sleigh daybed": "form_daybed", // subtype_daybed_sleigh
  "Backed daybed": "form_daybed", // subtype_daybed_backed
  "Bolster daybed": "form_daybed",
  "Twin daybed": "form_daybed",
  "Convertible couch": "form_daybed", // boundary form with subtype_sofa_sleeper; resolves at scoreForms
  "Porch bed": "form_daybed",
  "Sleeping porch bed": "form_daybed",
  "Guest bed": "form_daybed", // ambiguous with form_bedstead; resolves at scoreForms via structural cues
  // Note: "Trundle bed", "Cot", "Futon", "Campaign bed" intentionally NOT
  // mapped — sleeping-first vs day-use boundary; resolves at scoreForms
  // (subtype_daybed_trundle handles day-use trundle; form_bedstead handles
  // sleeping-first trundle).
  "Recliner": "form_recliner",
  "Reclining chair": "form_recliner",
  "La-Z-Boy": "form_recliner", // brand-as-form alias
  "La-Z-Boy style chair": "form_recliner",
  "Lazy Boy": "form_recliner",
  "Easy recliner": "form_recliner",
  "Rocker recliner": "form_recliner", // subtype_recliner_rocker
  "Rocking recliner": "form_recliner", // subtype_recliner_rocker
  "Swivel recliner": "form_recliner", // subtype_recliner_swivel
  "Glider recliner": "form_recliner",
  "Wall-hugger": "form_recliner", // subtype_recliner_wall_hugger
  "Wall hugger recliner": "form_recliner", // subtype_recliner_wall_hugger
  "Power recliner": "form_recliner", // subtype_recliner_power (post-1980)
  "Electric recliner": "form_recliner", // subtype_recliner_power
  "Lift chair": "form_recliner", // subtype_recliner_lift (post-1980)
  "Lift recliner": "form_recliner", // subtype_recliner_lift
  "Push-back chair": "form_recliner", // subtype_recliner_push_back
  "Push-back recliner": "form_recliner", // subtype_recliner_push_back
  "Lever recliner": "form_recliner", // subtype_recliner_manual_lever
  "Manual recliner": "form_recliner", // subtype_recliner_manual_lever
  "Club recliner": "form_recliner", // subtype_recliner_club (cross-refs subtype_lounge_recliner)
  "Wing recliner": "form_recliner", // subtype_recliner_wing (cross-refs subtype_wing_recliner)
  "Theater recliner": "form_recliner",
  "Home theater recliner": "form_recliner",
  "Massage recliner": "form_recliner",
  // Note: "Easy chair" intentionally NOT remapped — already routes to
  // form_lounge_chair per earlier mapping; only mechanism-evidenced
  // chairs should route to form_recliner.

  "Morris chair": "form_morris_chair",
  "Mission Morris chair": "form_morris_chair",
  "Craftsman Morris chair": "form_morris_chair",
  "Arts and Crafts Morris chair": "form_morris_chair",
  "Stickley Morris chair": "form_morris_chair", // subtype_morris_stickley_type — attribution requires marks/proof
  "Stickley-style chair": "form_morris_chair", // subtype_morris_stickley_type
  "Morris recliner": "form_morris_chair", // exposed manual adjustable back, not integrated mechanical recliner
  "Mission recliner": "form_morris_chair", // exposed manual adjustable back; modern Mission-styled integrated recliners should route via mechanism evidence
  "Mission lounge chair": "form_morris_chair", // Mission adjustable-back lounge → Morris identity; non-adjustable Mission armchairs resolve at scoreForms
  "Adjustable-back chair": "form_morris_chair",
  "Adjustable back chair": "form_morris_chair",
  "Adjustable-back lounge chair": "form_morris_chair",
  "Bow-arm Morris chair": "form_morris_chair", // subtype_morris_bow_arm
  "Flat-arm Morris chair": "form_morris_chair", // subtype_morris_flat_arm
  "Peg-adjusted Morris chair": "form_morris_chair", // subtype_morris_peg_adjusted
  "Chain-adjusted Morris chair": "form_morris_chair", // subtype_morris_chain_adjusted
  "Oak Morris chair": "form_morris_chair",
  "Quartersawn oak Morris chair": "form_morris_chair",
  "Morris rocker": "form_morris_chair", // subtype_morris_rocker (Morris adjustable-back identity dominates over rocking-base motion)
  "Mission rocker recliner": "form_morris_chair", // subtype_morris_rocker; mechanism-evidenced modern Mission recliners route via mechanism cues

  "Beanbag": "form_bean_bag_chair",
  "Bean bag": "form_bean_bag_chair",
  "Bean bag chair": "form_bean_bag_chair",
  "Beanbag chair": "form_bean_bag_chair",
  "Bean bag lounger": "form_bean_bag_chair", // subtype_bean_bag_lounger
  "Beanbag lounger": "form_bean_bag_chair", // subtype_bean_bag_lounger
  "Bean bag sofa": "form_bean_bag_chair", // subtype_bean_bag_chair_sofa
  "Bean bag loveseat": "form_bean_bag_chair", // subtype_bean_bag_chair_sofa
  "Lounge sack": "form_bean_bag_chair", // subtype_bean_bag_oversized / subtype_bean_bag_foam_filled
  "Memory foam bean bag": "form_bean_bag_chair", // subtype_bean_bag_foam_filled
  "Gaming bean bag": "form_bean_bag_chair", // subtype_bean_bag_gaming
  "Crash chair": "form_bean_bag_chair",
  "Crash pad chair": "form_bean_bag_chair",
  "Sacco chair": "form_bean_bag_chair", // subtype_bean_bag_sacco_type — designer attribution requires label/provenance
  "Sacco-style chair": "form_bean_bag_chair", // subtype_bean_bag_sacco_type
  "Oversized bean bag": "form_bean_bag_chair", // subtype_bean_bag_oversized
  "Media room bean bag": "form_bean_bag_chair", // subtype_bean_bag_gaming / subtype_bean_bag_oversized
  "Kids bean bag": "form_bean_bag_chair", // subtype_bean_bag_child
  "Outdoor bean bag": "form_bean_bag_chair", // subtype_bean_bag_outdoor
  // Note: "Foam chair", "Foam-filled chair", "Floor chair", "Floor lounger",
  // "Gaming chair", "Dorm chair" intentionally NOT mapped — too ambiguous
  // (rigid foam-shell chairs, modern gaming chairs with frames, and dorm
  // furniture span multiple forms). Frameless body-conforming evidence
  // resolves at scoreForms.

  "Papasan": "form_papasan_chair",
  "Papasan chair": "form_papasan_chair",
  "Papa-san chair": "form_papasan_chair",
  "Mamasan": "form_papasan_chair", // subtype_papasan_double_mamasan
  "Mamasan chair": "form_papasan_chair", // subtype_papasan_double_mamasan
  "Double papasan": "form_papasan_chair", // subtype_papasan_double_mamasan
  "Double papasan chair": "form_papasan_chair", // subtype_papasan_double_mamasan
  "Wicker papasan": "form_papasan_chair", // subtype_papasan_traditional
  "Rattan papasan": "form_papasan_chair", // subtype_papasan_traditional
  "Wicker bowl chair": "form_papasan_chair",
  "Swivel papasan": "form_papasan_chair", // subtype_papasan_swivel
  "Hanging papasan": "form_papasan_chair", // subtype_papasan_hanging (suspension may reroute if swing-chair behavior dominates)
  "Outdoor papasan": "form_papasan_chair", // subtype_papasan_outdoor
  "Resin wicker papasan": "form_papasan_chair", // subtype_papasan_modern_synthetic
  "Dorm papasan": "form_papasan_chair", // subtype_papasan_child_or_dorm
  // Note: "Bowl chair", "Round bowl chair", "Satellite chair", "Round chair",
  // "Rattan chair", "Saucer chair", "Moon chair", "Dish chair", "Circle
  // chair" intentionally NOT mapped — too ambiguous (bowl/round/rattan
  // span papasan/saucer/moon/butterfly/wicker forms; resolve at
  // scoreForms via bowl-frame + removable round cushion evidence).

  "Butterfly chair": "form_butterfly_chair",
  "Butterfly sling chair": "form_butterfly_chair",
  "BKF chair": "form_butterfly_chair", // subtype_butterfly_classic
  "B.K.F. chair": "form_butterfly_chair", // subtype_butterfly_classic
  "Hardoy chair": "form_butterfly_chair", // subtype_butterfly_hardoy — true attribution requires documentation
  "Hardoy butterfly chair": "form_butterfly_chair", // subtype_butterfly_hardoy
  "Bonet chair": "form_butterfly_chair", // subtype_butterfly_hardoy
  "Bonet-Kurchan-Ferrari chair": "form_butterfly_chair", // subtype_butterfly_hardoy
  "Leather sling chair": "form_butterfly_chair", // subtype_butterfly_leather
  "Hide sling chair": "form_butterfly_chair", // subtype_butterfly_leather
  "Cowhide butterfly chair": "form_butterfly_chair", // subtype_butterfly_leather
  "Canvas sling chair": "form_butterfly_chair", // subtype_butterfly_canvas
  "MCM butterfly chair": "form_butterfly_chair", // subtype_butterfly_classic
  "Mid-century sling chair": "form_butterfly_chair",
  "Modern sling chair": "form_butterfly_chair",
  "Folding sling chair": "form_butterfly_chair", // subtype_butterfly_folding (boundary form with form_folding_chair)
  // Note: "Sling chair", "Outdoor sling chair", "Patio sling chair",
  // "Dorm chair", "Casual lounge chair", "Safari chair" intentionally NOT
  // mapped — "Sling chair" alone spans butterfly/deck/patio dining/director
  // forms; "Safari chair" is structurally different (campaign-derived
  // wood frame, separate seat/back panels); resolve at scoreForms via
  // four-corner suspended sling geometry evidence.

  "Adirondack chair": "form_adirondack_chair",
  "Adirondak chair": "form_adirondack_chair", // common misspelling
  "Westport chair": "form_adirondack_chair", // subtype_adirondack_westport — Bunnell attribution requires documentation
  "Westport Adirondack": "form_adirondack_chair", // subtype_adirondack_westport
  "Muskoka chair": "form_adirondack_chair", // Canadian regional naming for Adirondack-type
  "Fan-back Adirondack": "form_adirondack_chair", // subtype_adirondack_fan_back
  "Folding Adirondack": "form_adirondack_chair", // subtype_adirondack_folding (boundary form with form_folding_chair)
  "Rocking Adirondack": "form_adirondack_chair", // subtype_adirondack_rocking (boundary form with form_rocking_chair)
  "Poly Adirondack": "form_adirondack_chair", // subtype_adirondack_composite (post-1990)
  "Composite Adirondack": "form_adirondack_chair", // subtype_adirondack_composite
  "HDPE Adirondack": "form_adirondack_chair", // subtype_adirondack_composite
  "Recycled plastic Adirondack": "form_adirondack_chair", // subtype_adirondack_composite
  "Child Adirondack": "form_adirondack_chair", // subtype_adirondack_child
  "Double Adirondack": "form_adirondack_chair", // subtype_adirondack_double
  "Adirondack tête-à-tête": "form_adirondack_chair", // subtype_adirondack_double
  // Note: "Lawn chair", "Camp chair", "Porch chair", "Garden chair",
  // "Deck chair", "Patio chair", "Outdoor lounge chair", "Rustic lounge
  // chair", "Plank lounge chair" intentionally NOT mapped — these are
  // outdoor-use vocabulary that span Adirondack/butterfly/folding/deck/
  // patio dining/rustic camp forms. Adirondack identity requires the
  // combined sloped-seat + reclined-back + wide-arm + plank geometry;
  // resolve at scoreForms via structural evidence rather than location.

  "Porch glider": "form_porch_lawn_glider",
  "Lawn glider": "form_porch_lawn_glider",
  "Metal glider": "form_porch_lawn_glider", // subtype_glider_metal_lawn
  "Metal lawn glider": "form_porch_lawn_glider", // subtype_glider_metal_lawn
  "Glider bench": "form_porch_lawn_glider", // subtype_glider_bench
  "Glider loveseat": "form_porch_lawn_glider", // subtype_glider_loveseat
  "Glider settee": "form_porch_lawn_glider", // subtype_glider_loveseat
  "Porch glider bench": "form_porch_lawn_glider", // subtype_glider_bench
  "Patio glider": "form_porch_lawn_glider", // subtype_glider_cushioned_patio
  "Outdoor glider": "form_porch_lawn_glider",
  "Vintage lawn glider": "form_porch_lawn_glider", // subtype_glider_metal_lawn
  "Tin glider": "form_porch_lawn_glider", // subtype_glider_metal_lawn
  "Steel glider": "form_porch_lawn_glider", // subtype_glider_metal_lawn
  "Bunting glider": "form_porch_lawn_glider", // subtype_glider_metal_lawn — maker attribution requires documentation
  "Lloyd glider": "form_porch_lawn_glider", // subtype_glider_metal_lawn
  "Howell glider": "form_porch_lawn_glider", // subtype_glider_metal_lawn
  "Shott glider": "form_porch_lawn_glider", // subtype_glider_metal_lawn
  "Cosco glider": "form_porch_lawn_glider", // subtype_glider_metal_lawn
  // Note: "Porch swing" and "Swing bench" intentionally NOT mapped to
  // form_porch_lawn_glider — per the canonical's own cousin contrast,
  // porch swings suspend from overhead chains/rope/beam while gliders
  // rest on a stationary ground base with linkage/hanger mechanism.
  // These aliases route to porch-swing logic when that canonical exists.

  "Theater seat": "form_theater_auditorium_seat", // subtype_theater_seat
  "Theatre seat": "form_theater_auditorium_seat", // subtype_theater_seat
  "Auditorium chair": "form_theater_auditorium_seat", // subtype_auditorium_seat
  "Auditorium seat": "form_theater_auditorium_seat", // subtype_auditorium_seat
  "Cinema seat": "form_theater_auditorium_seat", // subtype_cinema_seat
  "Movie theater seat": "form_theater_auditorium_seat", // subtype_cinema_seat
  "Movie theatre seat": "form_theater_auditorium_seat", // subtype_cinema_seat
  "Opera seat": "form_theater_auditorium_seat", // subtype_opera_house_seat
  "Opera house seat": "form_theater_auditorium_seat", // subtype_opera_house_seat
  "Lecture hall seat": "form_theater_auditorium_seat", // subtype_lecture_hall_seat
  "Stadium seat": "form_theater_auditorium_seat", // subtype_stadium_seat
  "Arena seat": "form_theater_auditorium_seat", // subtype_stadium_seat
  "Folding auditorium seat": "form_theater_auditorium_seat", // subtype_folding_auditorium
  "Assembly hall seat": "form_theater_auditorium_seat", // subtype_church_auditorium_seat
  "Church auditorium seat": "form_theater_auditorium_seat", // subtype_church_auditorium_seat (continuous pews route to form_pew)
  "Salvaged theater seat": "form_theater_auditorium_seat", // subtype_salvaged_row_seat
  "Salvaged auditorium seat": "form_theater_auditorium_seat", // subtype_salvaged_row_seat
  "Antique theater seat": "form_theater_auditorium_seat",
  "Vintage theater seat": "form_theater_auditorium_seat",
  // Note: "Row seating", "Fixed row seat", "Fold-up seat", "Flip-up seat",
  // "Fixed seat", "Institutional seat", "Theater row", "Auditorium row",
  // "Home theater seat" intentionally NOT mapped — "Row seating" /
  // "Fixed seat" / "Institutional seat" are too generic and span pews,
  // benches, fixed industrial seating, etc.; fold/flip-up alone doesn't
  // establish row mounting; "Home theater seat" is a domestic-use label
  // commonly applied to recliners that should route to form_recliner;
  // "Theater row" / "Auditorium row" describe row sections rather than
  // form. Resolve at scoreForms via individual-station + row-mounting
  // evidence.

  // ───────────────────────────────────────────────────────────────────
  // Dining cases — Item 16 Batch A (Tier B dining storage elevations)
  // ───────────────────────────────────────────────────────────────────

  "Hutch": "form_hutch",
  "hutch": "form_hutch",
  "China hutch": "form_hutch", // subtype_hutch_china_hutch (dominant retail use; Welsh dresser also lists this as alias but the canonical there flags it as misuse)
  "Dining hutch": "form_hutch",
  "Kitchen hutch": "form_hutch",
  "Buffet and hutch": "form_hutch", // subtype_hutch_buffet_hutch
  "Buffet hutch": "form_hutch", // subtype_hutch_buffet_hutch
  "Country hutch": "form_hutch", // subtype_hutch_country_hutch
  "Display hutch": "form_hutch",
  "Cupboard hutch": "form_hutch",
  // Note: "Step-back hutch" intentionally routes to form_step_back_cupboard
  // (line 1004 below) — step-back geometry is the diagnostic that controls
  // even when the upper section is glazed/dining-oriented. The hutch
  // canonical's subtype_hutch_stepback_hutch acknowledges this routing.
  "Open-shelf hutch": "form_hutch", // subtype_hutch_open_shelf_hutch (boundary form with Welsh dresser when British/country-dresser configuration dominates)
  // Note: "China cupboard" intentionally NOT mapped — too ambiguous;
  // can route to form_china_cabinet (existing canonical) or form_hutch
  // depending on base-plus-upper structure evidence; resolve at scoreForms.

  "Breakfront": "form_breakfront",
  "Breakfront cabinet": "form_breakfront",
  "Breakfront china cabinet": "form_breakfront", // subtype_breakfront_china_cabinet
  "Break-front": "form_breakfront",
  "Broken-front cabinet": "form_breakfront",
  "Georgian breakfront": "form_breakfront",
  "Colonial Revival breakfront": "form_breakfront",
  "Breakfront bookcase": "form_breakfront", // subtype_breakfront_bookcase (routes to bookcase family if dining evidence absent)
  "Breakfront secretary": "form_breakfront", // subtype_breakfront_secretary_bookcase (should NOT route as dining storage if writing function dominates)
  "Breakfront secretary bookcase": "form_breakfront", // subtype_breakfront_secretary_bookcase
  // Note: "Formal china cabinet" intentionally NOT mapped — bare term
  // without "breakfront" qualifier should route to form_china_cabinet;
  // breakfront identity requires actual projecting center geometry.

  "Corner cabinet": "form_corner_cabinet",
  "Corner cupboard": "form_corner_cabinet",
  "Corner china cabinet": "form_corner_cabinet", // subtype_corner_cabinet_glazed
  "Corner hutch": "form_corner_cabinet", // corner geometry outranks hutch base-plus-upper structure
  "Corner display cabinet": "form_corner_cabinet", // subtype_corner_cabinet_glazed
  "Built-in corner cupboard": "form_corner_cabinet", // subtype_corner_cabinet_built_in
  "Hanging corner cupboard": "form_corner_cabinet", // subtype_corner_cabinet_hanging
  "Corner curio": "form_corner_cabinet", // subtype_corner_cabinet_glazed (display-only function may secondarily route to form_curio_cabinet via dual-routing if implemented)
  "Pie-shaped cabinet": "form_corner_cabinet",

  "Huntboard": "form_huntboard",
  "Hunt board": "form_huntboard",
  "Hunting board": "form_huntboard",
  "Southern huntboard": "form_huntboard", // subtype_huntboard_southern_country
  "Standing sideboard": "form_huntboard",
  "Hall sideboard": "form_huntboard", // huntboard hall-service tradition
  // Note: "Tall sideboard", "Country sideboard", "Serving board" intentionally
  // NOT mapped — "Tall sideboard" alone is ambiguous (could be a tall but
  // ordinary sideboard not Huntboard); "Country sideboard" overlaps with
  // Welsh dresser and other country forms; "Serving board" is too generic
  // (could be cutting board, charcuterie board, or any service surface).
  // Resolve at scoreForms via height tier + regional construction evidence.

  "Credenza": "form_credenza", // distinct from form_credenza_desk; storage form dominates modern retail use
  "Dining credenza": "form_credenza", // subtype_credenza_dining
  "Office credenza": "form_credenza", // subtype_credenza_office (NOT credenza_desk unless work surface present)
  "Mid-century credenza": "form_credenza", // subtype_credenza_mid_century
  "Mid century credenza": "form_credenza", // subtype_credenza_mid_century
  "MCM credenza": "form_credenza", // subtype_credenza_mid_century
  "Sideboard credenza": "form_credenza", // subtype_credenza_sideboard_crossover
  "Media credenza": "form_credenza", // subtype_credenza_media
  "Storage credenza": "form_credenza",
  "Tambour credenza": "form_credenza", // subtype_credenza_tambour
  "Floating credenza": "form_credenza", // subtype_credenza_floating_wall_mounted
  // Note: "Low cabinet", "Modern sideboard" intentionally NOT mapped —
  // "Low cabinet" is too generic; "Modern sideboard" should route to
  // form_sideboard with credenza-crossover noted (subtype_credenza_
  // sideboard_crossover handles ambiguous cases at scoreForms).

  "Welsh dresser": "form_welsh_dresser",
  "Kitchen dresser": "form_welsh_dresser", // subtype_welsh_dresser_country
  "Country dresser": "form_welsh_dresser", // subtype_welsh_dresser_country
  "Pewter cupboard": "form_welsh_dresser", // open-rack display tradition
  "Plate rack dresser": "form_welsh_dresser", // subtype_welsh_dresser_plate_rack
  "Pine dresser": "form_welsh_dresser", // subtype_welsh_dresser_pine
  "Open hutch": "form_welsh_dresser", // open-rack upper distinguishes from form_hutch (glazed/enclosed upper)
  "Farmhouse dresser": "form_welsh_dresser",
  // Note: "China hutch" appears in Welsh dresser aliases but per the
  // canonical's own anti_classification_guidance ("false use of 'hutch'
  // for open-rack dressers") this is flagged as a misuse; the alias is
  // routed to form_hutch (above) where the dominant retail use sits.

  // Sideboard-family service cases + china cabinet (scoreForms detectors added
  // with the dining/display cluster; previously these fell to generic
  // "Cabinet" -> form_china_cabinet).
  "Sideboard": "form_sideboard",
  "Buffet": "form_buffet",
  "Server": "form_server",
  "China cabinet": "form_china_cabinet",
  "Curio": "form_curio_cabinet",
  "Curio cabinet": "form_curio_cabinet",
  "Vitrine": "form_curio_cabinet", // subtype_curio_cabinet_vitrine (no separate vitrine canonical yet)
  "Glass display cabinet": "form_curio_cabinet",
  "Collectibles cabinet": "form_curio_cabinet",
  "Lighted curio": "form_curio_cabinet", // subtype_curio_cabinet_modern_lighted
  "Lighted curio cabinet": "form_curio_cabinet", // subtype_curio_cabinet_modern_lighted
  "Bowed-glass curio": "form_curio_cabinet", // subtype_curio_cabinet_bowed_glass
  "Tabletop curio": "form_curio_cabinet", // subtype_curio_cabinet_tabletop
  "Wall curio": "form_curio_cabinet", // subtype_curio_cabinet_wall_mounted
  // Note: "Display cabinet" intentionally NOT mapped — too ambiguous;
  // spans curio/china cabinet/hutch/museum cases. "Corner curio"
  // intentionally routes to form_corner_cabinet (corner geometry outranks
  // display-only function) per the corner cabinet aliases above.

  "Cellarette": "form_cellarette",
  "Cellaret": "form_cellarette",
  "Wine cooler": "form_cellarette", // historic furniture-form sense, not modern thermoelectric appliance
  "Bottle case": "form_cellarette",
  "Liquor cabinet": "form_cellarette", // modern bar-cellarette boundary; subtype_cellarette_modern_bar_cabinet
  "Decanter case": "form_cellarette",
  "Tantalus": "form_cellarette", // subtype_cellarette_tantalus
  "Chest-form cellarette": "form_cellarette", // subtype_cellarette_chest
  // Note: "Bar cabinet" intentionally NOT mapped — flagged in the
  // cellarette canonical for separate bar-cabinet canonical if one exists;
  // modern bar cabinets with full cocktail service and barware storage
  // are functionally broader than historic cellarette bottle storage.

  // ───────────────────────────────────────────────────────────────────
  // Kitchen storage — Item 16 Batch C (Tier B kitchen storage elevations)
  // ───────────────────────────────────────────────────────────────────

  "Hoosier": "form_hoosier_cabinet",
  "Hoosier cabinet": "form_hoosier_cabinet",
  "Hoosier cupboard": "form_hoosier_cabinet",
  "Kitchen workstation": "form_hoosier_cabinet", // Hoosier is the canonical workstation form
  "Sellers cabinet": "form_hoosier_cabinet", // subtype_hoosier_cabinet_seller_or_maker_labeled — maker attribution requires label/hardware/catalog match
  "McDougall cabinet": "form_hoosier_cabinet", // subtype_hoosier_cabinet_seller_or_maker_labeled
  "Napanee cabinet": "form_hoosier_cabinet", // subtype_hoosier_cabinet_seller_or_maker_labeled
  "Coppes cabinet": "form_hoosier_cabinet", // subtype_hoosier_cabinet_seller_or_maker_labeled
  "Boone cabinet": "form_hoosier_cabinet", // subtype_hoosier_cabinet_seller_or_maker_labeled
  "Flour cabinet": "form_hoosier_cabinet", // flour-bin diagnostic
  // Note: "Kitchen cabinet" appears in Hoosier aliases but routes to
  // form_kitchen_cabinet (broader freestanding storage) below; Hoosier
  // identity requires the workstation diagnostics (flour bin, sifter,
  // pull-out work surface, accessory fittings). "Baker's cabinet" routes
  // to form_kitchen_cabinet below (also a kitchen_cabinet alias).

  "Kitchen cabinet": "form_kitchen_cabinet",
  "Kitchen cupboard": "form_kitchen_cabinet",
  "Pantry cabinet": "form_kitchen_cabinet", // subtype_kitchen_cabinet_pantry_cabinet
  "Utility cabinet": "form_kitchen_cabinet", // subtype_kitchen_cabinet_utility_cabinet
  "Farmhouse cabinet": "form_kitchen_cabinet",
  "Dry goods cabinet": "form_kitchen_cabinet", // subtype_kitchen_cabinet_pantry_cabinet
  "Baker's cabinet": "form_kitchen_cabinet", // also listed under Hoosier aliases; routed here as the broader form (Hoosier identity requires specific workstation diagnostics)
  "Bakers cabinet": "form_kitchen_cabinet",
  "Painted kitchen cupboard": "form_kitchen_cabinet", // subtype_kitchen_cabinet_enamel_or_painted
  // Note: "Freestanding cabinet" intentionally NOT mapped — too generic;
  // could be any freestanding case piece (kitchen cabinet, cupboard,
  // wardrobe, bookcase). Resolve at scoreForms via kitchen-function
  // evidence (food-storage compartments, pantry wear, etc.).

  "Step-back cupboard": "form_step_back_cupboard",
  "Stepback cupboard": "form_step_back_cupboard",
  "Step back cupboard": "form_step_back_cupboard",
  "Stepback hutch": "form_step_back_cupboard", // step-back geometry outranks hutch dining-display routing
  "Step-back hutch": "form_step_back_cupboard", // also appears in form_hutch subtype as boundary form; step-back geometry controls when food-storage cupboard dominates
  "Two-piece cupboard": "form_step_back_cupboard",
  "Glazed step-back cupboard": "form_step_back_cupboard", // subtype_step_back_cupboard_glazed
  // Note: "Country cupboard", "Kitchen cupboard", "Farmhouse cupboard",
  // "Cupboard hutch" intentionally NOT mapped to step_back_cupboard —
  // "Kitchen cupboard" routes to form_kitchen_cabinet (above) as the
  // broader form; the others are too ambiguous (could be step-back,
  // jelly, jam, kitchen cabinet, or hutch). Resolve at scoreForms via
  // side-profile setback evidence (the diagnostic geometry).

  "Dough box": "form_dough_box",
  "Dough trough": "form_dough_box", // subtype_dough_box_trough
  "Bread trough": "form_dough_box", // subtype_dough_box_trough
  "Kneading trough": "form_dough_box", // subtype_dough_box_trough
  "Dough bin": "form_dough_box",
  "Farmhouse dough box": "form_dough_box",
  "Primitive dough box": "form_dough_box",
  // Note: "Bread box" intentionally NOT mapped — modern bread box is a
  // countertop kitchen accessory, not the historic dough-box furniture
  // form. Bread-trough variants route via "Bread trough" above; small
  // tabletop bread containers are out of scope for case-piece routing.

  "Jam cupboard": "form_jam_cupboard",
  "Preserve cupboard": "form_jam_cupboard", // preserves/jars storage
  "Jar cupboard": "form_jam_cupboard",

  // Jelly cupboard — peer of jam cupboard; takes the "jelly cupboard" label per
  // the jam-cupboard canonical's deferral note. (Route was assumed present but
  // never added; the scoreForms detector emits this label.)
  "Jelly cupboard": "form_jelly_cupboard",

  // Pie safe — ventilated food-storage safe (pierced/punched tin or screen
  // panels are the diagnostic). Routes were missing entirely.
  "Pie safe": "form_pie_safe",
  "Pie cupboard": "form_pie_safe",
  "Pie chest": "form_pie_safe",
  "Tin safe": "form_pie_safe",
  "Punched-tin safe": "form_pie_safe",
  "Meat safe": "form_pie_safe", // regional (esp. Southern) alias for the ventilated safe

  // ───────────────────────────────────────────────────────────────────
  // Suspended lighting — Item 17 Batch E (Tier B lighting elevations)
  // ───────────────────────────────────────────────────────────────────

  "Chandelier": "form_chandelier",
  "Ceiling chandelier": "form_chandelier",
  "Crystal chandelier": "form_chandelier", // subtype_chandelier_crystal
  "Candle chandelier": "form_chandelier", // subtype_chandelier_candle
  "Gas chandelier": "form_chandelier", // subtype_chandelier_gas — preserve original fuel-system lineage even when electrified
  "Gasolier": "form_chandelier", // subtype_chandelier_gas (period term)
  "Gaselier": "form_chandelier", // subtype_chandelier_gas (period spelling variant)
  "Gas-electric chandelier": "form_chandelier", // subtype_chandelier_gas_electric
  "Electric chandelier": "form_chandelier", // subtype_chandelier_electric
  "Electrolier": "form_chandelier", // subtype_chandelier_electric (period term)
  "Art-glass chandelier": "form_chandelier", // subtype_chandelier_art_glass
  "Colonial Revival chandelier": "form_chandelier", // subtype_chandelier_colonial_revival
  "Multi-light fixture": "form_chandelier", // multi-light radial structure
  "Multi-arm chandelier": "form_chandelier",
  // Note: "Pendant chandelier" intentionally NOT mapped — ambiguous;
  // resolve at scoreForms via multi-arm vs single-drop evidence.

  "Pendant": "form_pendant_light",
  "Pendant light": "form_pendant_light",
  "Hanging pendant": "form_pendant_light",
  "Single pendant": "form_pendant_light",
  "Ceiling pendant": "form_pendant_light",
  "Drop light": "form_pendant_light",
  "Schoolhouse light": "form_pendant_light", // subtype_pendant_light_schoolhouse
  "Schoolhouse pendant": "form_pendant_light", // subtype_pendant_light_schoolhouse
  "Industrial pendant": "form_pendant_light", // subtype_pendant_light_industrial
  "Pulley pendant": "form_pendant_light", // subtype_pendant_light_pulley
  "Rise and fall light": "form_pendant_light", // subtype_pendant_light_pulley
  "Pendant cluster": "form_pendant_light", // subtype_pendant_light_cluster
  "Mid-century pendant": "form_pendant_light", // subtype_pendant_light_mid_century
  // Note: "Art-glass pendant" intentionally NOT mapped — overlaps with
  // form_chandelier "Art-glass chandelier" routing when multi-shade;
  // resolve at scoreForms via single-drop vs multi-light evidence.

  "Hanging lantern": "form_lantern_hanging",
  "Ceiling lantern": "form_lantern_hanging",
  "Hall lantern": "form_lantern_hanging",
  "Entry lantern": "form_lantern_hanging",
  "Porch lantern": "form_lantern_hanging",
  "Colonial lantern": "form_lantern_hanging", // subtype_lantern_hanging_colonial_revival — revival vocabulary common
  "Pierced-tin hanging lantern": "form_lantern_hanging", // subtype_lantern_hanging_pierced_tin
  "Kerosene hanging lamp": "form_lantern_hanging", // subtype_lantern_hanging_kerosene
  "Arts and Crafts lantern": "form_lantern_hanging", // subtype_lantern_hanging_arts_crafts
  // Note: "Tin lantern", "Gas lantern" intentionally NOT mapped —
  // "Tin lantern" alone is ambiguous (could be portable lantern vs
  // hanging); "Gas lantern" spans hanging lantern / gas sconce /
  // exterior gas fixtures. Resolve at scoreForms via mounting evidence
  // (suspension vs wall-projection vs portable handle).

  "Billiard light": "form_billiard_light",
  "Pool table light": "form_billiard_light",
  "Snooker light": "form_billiard_light",
  "Pool hall light": "form_billiard_light",
  "Saloon light": "form_billiard_light",
  "Linear billiard fixture": "form_billiard_light",
  "Gas billiard light": "form_billiard_light", // subtype_billiard_light_gas
  "Slag-glass billiard light": "form_billiard_light", // subtype_billiard_light_slag_glass
  "Advertising billiard light": "form_billiard_light", // subtype_billiard_light_advertising
  // Note: "Game room light", "Bar light" intentionally NOT mapped —
  // too generic; span billiard light / pendant / chandelier / sconce
  // depending on architecture. Billiard light identity requires the
  // long horizontal multi-shade task-lighting layout (line spacing
  // over an elongated table surface). Resolve at scoreForms.

  // ───────────────────────────────────────────────────────────────────
  // Portable surface lighting — Item 17 Batch D (Tier B lighting)
  // ───────────────────────────────────────────────────────────────────

  // Lighting forms missing a label->id route (scoreForms detectors added).
  "Torchère": "form_torchere",
  "Candelabrum": "form_candelabrum",
  "Wall lighting form": "form_wall_lighting_form",
  "Hanging lighting form": "form_hanging_lighting_form",
  "Candlestick": "form_candlestick",
  "Candle stick": "form_candlestick",
  "Candleholder": "form_candlestick",
  "Single candleholder": "form_candlestick",
  "Chamberstick": "form_candlestick", // subtype_candlestick_chamberstick
  "Pricket stick": "form_candlestick", // subtype_candlestick_pricket
  "Pricket candlestick": "form_candlestick", // subtype_candlestick_pricket
  "Push-up candlestick": "form_candlestick", // subtype_candlestick_push_up
  "Hog-scraper candlestick": "form_candlestick", // subtype_candlestick_hog_scraper
  "Taper holder": "form_candlestick",

  "Oil lamp": "form_oil_lamp", // generic pre-kerosene fluid lighting; kerosene burner/chimney evidence reroutes to form_kerosene_lamp at scoreForms
  "Fluid lamp": "form_oil_lamp",
  "Whale oil lamp": "form_oil_lamp", // subtype_oil_lamp_whale_oil
  "Sperm oil lamp": "form_oil_lamp", // subtype_oil_lamp_sperm_oil
  "Lard oil lamp": "form_oil_lamp", // subtype_oil_lamp_lard_oil
  "Burning-fluid lamp": "form_oil_lamp", // subtype_oil_lamp_fluid_or_camphene
  "Camphene lamp": "form_oil_lamp", // subtype_oil_lamp_fluid_or_camphene
  "Converted oil lamp": "form_oil_lamp", // subtype_oil_lamp_electrified
  // Note: "Astral lamp" and "Sinumbra lamp" intentionally route to
  // form_argand_lamp (below) — the canonical Argand burner technology
  // is the diagnostic, and both astral and sinumbra are explicit
  // Argand subtypes per the argand_lamp canonical.

  "Kerosene lamp": "form_kerosene_lamp",
  "Coal oil lamp": "form_kerosene_lamp", // period synonym for kerosene
  "Center-draft lamp": "form_kerosene_lamp", // subtype_kerosene_lamp_center_draft
  "Aladdin lamp": "form_kerosene_lamp", // subtype_kerosene_lamp_aladdin — maker attribution requires marked burner/font/model
  "Aladdin mantle lamp": "form_kerosene_lamp", // subtype_kerosene_lamp_aladdin
  "Rayo lamp": "form_kerosene_lamp", // subtype_kerosene_lamp_rayo — attribution requires marked parts/catalog match
  "Finger lamp": "form_kerosene_lamp", // subtype_kerosene_lamp_finger_lamp
  "Hurricane lamp": "form_kerosene_lamp", // common retail term for kerosene lamp with chimney; railroad/utility hurricane lanterns route via lantern form at scoreForms
  "Converted kerosene lamp": "form_kerosene_lamp", // subtype_kerosene_lamp_electrified
  // Note: "Parlor lamp" appears in both kerosene and banquet aliases.
  // Routing decision: banquet lamp gets it (tall ornate parlor form is
  // the dominant retail use of "parlor lamp"); kerosene parlor lamps
  // smaller than banquet scale resolve at scoreForms via dimensional
  // evidence. "Oil lamp" intentionally NOT routed here — that bare
  // alias routes to form_oil_lamp above (broader form); kerosene
  // identity requires kerosene burner/chimney evidence.

  "Argand lamp": "form_argand_lamp",
  "Astral lamp": "form_argand_lamp", // subtype_argand_lamp_astral (astral is an Argand variant per canonical; sinumbra likewise routes here)
  "Sinumbra lamp": "form_argand_lamp", // subtype_argand_lamp_sinumbra
  "Solar lamp": "form_argand_lamp", // period term for Argand-derived lighting
  "Circular wick lamp": "form_argand_lamp", // diagnostic Argand burner technology
  "Draft lamp": "form_argand_lamp",
  "Converted Argand lamp": "form_argand_lamp", // subtype_argand_lamp_converted_kerosene or _electrified
  // Note: "Early oil lamp" intentionally NOT mapped — too generic;
  // Argand identity requires circular wick / chimney draft evidence,
  // not just early date. Resolve at scoreForms via burner inspection.

  "Betty lamp": "form_betty_lamp",
  "Grease lamp": "form_betty_lamp",
  "Fat lamp": "form_betty_lamp",
  "Pan lamp": "form_betty_lamp", // shallow pan/grease lighting
  "Iron betty lamp": "form_betty_lamp",
  "Lidded betty lamp": "form_betty_lamp", // subtype_betty_lamp_lidded
  "Rat-tail lamp": "form_betty_lamp", // subtype_betty_lamp_rat_tail
  "Early grease light": "form_betty_lamp",
  // Note: "Primitive lamp" intentionally NOT mapped — too generic;
  // primitive-looking lighting spans betty lamp / oil lamp / candlestick /
  // reproductions. Betty lamp identity requires pan/grease construction.

  "Student lamp": "form_student_lamp",
  "Study lamp": "form_student_lamp",
  "Reading lamp": "form_student_lamp",
  "Double student lamp": "form_student_lamp", // subtype_student_lamp_double_burner
  "Kerosene student lamp": "form_student_lamp", // subtype_student_lamp_kerosene
  "Rochester student lamp": "form_student_lamp", // subtype_student_lamp_rochester_or_bh_type — attribution requires marks
  "Bradley and Hubbard student lamp": "form_student_lamp", // subtype_student_lamp_rochester_or_bh_type
  "Bradley & Hubbard student lamp": "form_student_lamp",
  "Banker lamp": "form_student_lamp", // subtype_student_lamp_bankers_or_library
  "Banker's lamp": "form_student_lamp",
  "Library lamp": "form_student_lamp", // subtype_student_lamp_bankers_or_library
  // Note: "Desk lamp" intentionally NOT mapped — too generic; spans
  // student lamp / table lamp / modern task lighting. Student lamp
  // identity requires adjustable/offset task-light architecture.

  "Banquet lamp": "form_banquet_lamp",
  "Parlor lamp": "form_banquet_lamp", // dominant retail use is for tall ornate parlor form
  "Victorian banquet lamp": "form_banquet_lamp",
  "GWTW lamp": "form_banquet_lamp", // subtype_banquet_lamp_gone_with_the_wind
  "Gone With the Wind lamp": "form_banquet_lamp", // subtype_banquet_lamp_gone_with_the_wind
  "Tall kerosene lamp": "form_banquet_lamp",
  "Converted banquet lamp": "form_banquet_lamp", // subtype_banquet_lamp_electrified
  "Painted glass lamp": "form_banquet_lamp", // subtype_banquet_lamp_painted_glass
  "Formal parlor lamp": "form_banquet_lamp",

  // Surface-set / freestanding lamps. Previously orphaned: no engine label
  // routed to form_table_lamp or form_floor_lamp, so lamp_form fell through to
  // the brass-bed material trap (#14). scoreForms now emits these labels.
  "Table lamp": "form_table_lamp",
  "Electric table lamp": "form_table_lamp",
  "Slag glass lamp": "form_table_lamp", // slag glass is shade material, not a distinct form
  "Slag-glass lamp": "form_table_lamp",
  "Leaded glass lamp": "form_table_lamp", // leaded/panel shade material; form remains table lamp
  "Leaded-glass lamp": "form_table_lamp",
  "Panel lamp": "form_table_lamp", // bent/slag glass panel shade; table lamp form
  "Boudoir lamp": "form_table_lamp", // subtype_table_lamp_boudoir_lamp
  "Floor lamp": "form_floor_lamp",
  "Standing lamp": "form_floor_lamp",
  "Bridge lamp": "form_floor_lamp", // subtype_floor_lamp_bridge_lamp
  "Torchiere lamp": "form_floor_lamp", // subtype_floor_lamp_torchiere_lamp

  // ───────────────────────────────────────────────────────────────────
  // Wall lighting — Item 17 Batch F (Tier B wall lighting elevations)
  // ───────────────────────────────────────────────────────────────────

  "Sconce": "form_sconce",
  "Wall sconce": "form_sconce",
  "Wall light": "form_sconce",
  "Wall fixture": "form_sconce",
  "Wall bracket light": "form_sconce",
  "Candle sconce": "form_sconce", // subtype_sconce_candle
  "Electric sconce": "form_sconce", // subtype_sconce_electric
  "Kerosene wall lamp": "form_sconce", // subtype_sconce_kerosene
  "Kerosene wall sconce": "form_sconce", // subtype_sconce_kerosene
  "Mirror-back sconce": "form_sconce", // subtype_sconce_mirror_back
  "Two-arm sconce": "form_sconce",
  "Single-arm sconce": "form_sconce",
  "Wall mounted lamp": "form_sconce",
  // Note: "Gas sconce" intentionally routes to form_gas_bracket (below)
  // per the sconce canonical's own subtype_sconce_gas guidance ("If gas
  // system is the dominant diagnostic, compare standalone form_gas_
  // bracket"). Gas evidence is the dominant diagnostic when the alias
  // explicitly includes "gas".

  "Gas bracket": "form_gas_bracket",
  "Gas wall bracket": "form_gas_bracket",
  "Gas sconce": "form_gas_bracket", // gas evidence dominates; routes per sconce canonical's own guidance
  "Gas wall light": "form_gas_bracket",
  "Gaslight bracket": "form_gas_bracket",
  "Gas arm": "form_gas_bracket",
  "Swing-arm gas bracket": "form_gas_bracket", // subtype_gas_bracket_swing_arm
  "Gas-electric bracket": "form_gas_bracket", // subtype_gas_bracket_gas_electric
  "Gas-electric wall bracket": "form_gas_bracket", // subtype_gas_bracket_gas_electric
  "Converted gas bracket": "form_gas_bracket", // subtype_gas_bracket_electrified
  "Wall gas fixture": "form_gas_bracket",
  "Gas-mantle bracket": "form_gas_bracket", // subtype_gas_bracket_mantle
  "Single-arm gas bracket": "form_gas_bracket", // subtype_gas_bracket_single_arm
  "Double-arm gas bracket": "form_gas_bracket", // subtype_gas_bracket_double_arm
  "Reflector gas bracket": "form_gas_bracket", // subtype_gas_bracket_reflector


  // Note: "Jelly cupboard" intentionally NOT remapped — already routes
  // to form_jelly_cupboard (existing canonical at line 1946+); jam_cupboard
  // and jelly_cupboard are peer forms with overlapping aliases. The jam
  // cupboard canonical itself lists "jelly cupboard" as an alias but
  // notes the existing jelly_cupboard form takes that label per
  // convention. "Pantry cupboard", "Country cupboard", "Kitchen cupboard",
  // "Primitive cupboard", "Farmhouse cupboard" intentionally NOT mapped
  // — too generic; span jam/jelly/kitchen cabinet/step-back/Welsh dresser.
  // Resolve at scoreForms via open-shelf vs enclosed evidence.

  "Stool": "form_stool",
  "Tabouret": "form_stool", // subtype_stool_tabouret
  "Counter stool": "form_stool", // subtype_stool_counter
  "Kitchen stool": "form_stool",
  "Bar stool": "form_stool", // subtype_stool_bar (backed bar stools route to form_bar_chair)
  "Piano stool": "form_stool", // subtype_stool_piano
  "Vanity stool": "form_stool", // subtype_stool_vanity
  "Dressing stool": "form_stool", // subtype_stool_vanity
  "Shop stool": "form_stool", // subtype_stool_work
  "Work stool": "form_stool", // subtype_stool_work
  "Drafting stool": "form_stool", // subtype_stool_drafting
  "Lab stool": "form_stool", // subtype_stool_work
  "Laboratory stool": "form_stool", // subtype_stool_work
  "Industrial stool": "form_stool", // subtype_stool_work
  "Swivel stool": "form_stool", // subtype_stool_swivel
  "Screw stool": "form_stool", // subtype_stool_swivel
  "Step stool": "form_stool", // subtype_stool_step (boundary form with ladder/access support)
  "Joint stool": "form_stool", // subtype_stool_joint
  "Hearth stool": "form_stool", // subtype_stool_low
  "Three-legged stool": "form_stool", // subtype_stool_low
  "Tripod stool": "form_stool",
  "Saddle stool": "form_stool",
  "Milking stool": "form_milking_stool", // specialty canonical retains identity for dairy/work-context examples; subtype_stool_milking within form_stool is the broader vernacular cross-reference
  // Note: "Seat", "Footstool", "Foot stool" intentionally NOT mapped to
  // form_stool — "Seat" is too generic; "Footstool"/"Foot stool" route
  // to form_ottoman_footstool (soft support dominant) per the
  // ottoman/footstool canonical mappings above.
  "Kitchen table": "form_kitchen_table",
  "Kitchen utility table": "form_kitchen_table",
  "Kitchen dining table": "form_kitchen_table",
  "Farm table": "form_kitchen_table", // subtype_kitchen_table_farm
  "Farmhouse table": "form_kitchen_table", // subtype_kitchen_table_farm
  "Farm kitchen table": "form_kitchen_table", // subtype_kitchen_table_farm
  "Enamel table": "form_kitchen_table", // subtype_kitchen_table_enamel_top (c. 1900-1950)
  "Enamel-top table": "form_kitchen_table", // subtype_kitchen_table_enamel_top
  "Porcelain top table": "form_kitchen_table", // subtype_kitchen_table_enamel_top
  "Hoosier table": "form_kitchen_table", // subtype_kitchen_table_enamel_top (Hoosier-era kitchen)
  "Hoosier-era table": "form_kitchen_table",
  "Chrome kitchen table": "form_kitchen_table", // subtype_kitchen_table_chrome_laminate
  "Formica table": "form_kitchen_table", // subtype_kitchen_table_chrome_laminate (laminate is kitchen-table-dominant; subtype_breakfast_table_dinette cross-references)
  "Laminate kitchen table": "form_kitchen_table", // subtype_kitchen_table_chrome_laminate
  "Drop-leaf kitchen table": "form_kitchen_table", // subtype_kitchen_table_drop_leaf
  "Gateleg kitchen table": "form_kitchen_table", // subtype_kitchen_table_drop_leaf
  "Baking table": "form_kitchen_table", // subtype_kitchen_table_work
  "Bread table": "form_kitchen_table", // subtype_kitchen_table_work
  "Utility table": "form_kitchen_table",
  "Apartment table": "form_kitchen_table",
  "Breakfast table": "form_breakfast_table",
  "Breakfast nook table": "form_breakfast_table", // subtype_breakfast_table_nook
  "Nook table": "form_breakfast_table", // subtype_breakfast_table_nook
  "Dinette table": "form_breakfast_table", // subtype_breakfast_table_dinette (c. 1920-present; cross-references subtype_kitchen_table_dinette when work/prep evidence dominates)
  "Chrome dinette table": "form_breakfast_table", // subtype_breakfast_table_dinette
  "Round breakfast table": "form_breakfast_table", // subtype_breakfast_table_round
  "Drop-leaf breakfast table": "form_breakfast_table", // subtype_breakfast_table_drop_leaf
  "Gateleg breakfast table": "form_breakfast_table", // subtype_breakfast_table_drop_leaf
  "Pedestal breakfast table": "form_breakfast_table", // subtype_breakfast_table_pedestal
  "Sunroom table": "form_breakfast_table",
  "Apartment dining table": "form_breakfast_table",
  "Small dining table": "form_breakfast_table",
  "Round kitchen table": "form_breakfast_table", // small-round informal eating identity dominates
  "Laminate table": "form_breakfast_table",
  // Note: "Bistro table", "Café table", "Cafe table" now mapped to
  // form_bistro_cafe_table per Tier C item 8 elevation (see Tier C
  // peer-canonical elevations section above). Bistro/café identity is
  // height-tier-dependent (dining 28-31, counter 34-36, bar 40-42);
  // bar-height examples cross-reference form_pub_table.
  "Work table": "form_work_table", // bare alias routes to the broader work/task table canonical (subtype_kitchen_table_work cross-references this for kitchen-context overlap)
  "Occasional table": "form_occasional_table",
  "Accent table": "form_occasional_table", // subtype_occasional_accent
  "Drink table": "form_occasional_table", // subtype_occasional_martini boundary; no form_drink_table canonical yet
  "Martini table": "form_occasional_table", // subtype_occasional_martini
  "Decorative table": "form_occasional_table",
  "Occasional stand": "form_occasional_table",
  "Accent stand": "form_occasional_table",
  "Display table": "form_occasional_table",
  "Display stand": "form_occasional_table",
  "Corner table": "form_occasional_table",
  "Sculptural table": "form_occasional_table",
  "Novelty table": "form_occasional_table", // subtype_occasional_novelty
  "Cocktail table": "form_cocktail_table",
  "Glass cocktail table": "form_cocktail_table", // subtype_cocktail_glass (c. 1930+)
  "Brass cocktail table": "form_cocktail_table",
  "Chrome cocktail table": "form_cocktail_table",
  "Lucite cocktail table": "form_cocktail_table",
  "Acrylic cocktail table": "form_cocktail_table",
  "Tray-top cocktail table": "form_cocktail_table", // subtype_cocktail_tray_top
  "Storage cocktail table": "form_cocktail_table", // subtype_cocktail_storage
  "Lift-top cocktail table": "form_cocktail_table", // subtype_cocktail_storage (post-1990 strong consumer marker)
  "Round cocktail table": "form_cocktail_table", // subtype_cocktail_round
  "Oval cocktail table": "form_cocktail_table", // subtype_cocktail_oval
  "Square cocktail table": "form_cocktail_table", // subtype_cocktail_square
  "Hollywood Regency cocktail table": "form_cocktail_table",
  "MCM cocktail table": "form_cocktail_table", // subtype_cocktail_modern_sculptural
  "Modern cocktail table": "form_cocktail_table", // subtype_cocktail_modern_sculptural
  "Lounge table": "form_cocktail_table", // low seating-zone table identity dominates
  // Note: bare aliases "Side table", "End table", "Coffee table", "Pedestal
  // table", "Nesting table", "Nest of tables", "Tray table", "Center table",
  // "Console table", "Sofa table", "Tea table" route to their named parent
  // canonicals in the Tables section above (form_side_table, form_coffee_table,
  // etc.). form_occasional_table and form_cocktail_table activate via the
  // unique aliases above and via scoreForms structural cues when the more
  // specific parent canonicals don't match. "Small table", "Low table",
  // "Living room table", "Folding table", "Tiered table", "Tiered stand"
  // remain intentionally unmapped — too generic; resolve at scoreForms.
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
