/**
 * Phase 1 (lock-constants) data fixtures: five identical-input scans of one
 * Victorian close-stool / commode (same 8 photos, same fields, same order).
 * Captured from the P0 perception + final report of each run. Used by the
 * frequency analyzer (scripts/analyzeCommodeRuns.ts) and by the deterministic
 * guard/canonicalization/regression tests in later phases.
 *
 * These are real model outputs — the variance between runs is the subject of
 * study, so do NOT "tidy" the key names; that drift is the data.
 */

export type CommodeRun = {
  run: number;
  formId: string;
  formLabel: string;
  styleContext: string; // "Unresolved" when no context derived
  dateFloor: number | null;
  dateCeiling: number | null;
  valueLow: number;
  valueHigh: number;
  sellability: number;
  /** Subtype assigned in P3, if any (run 5 attached a 1970+ reproduction). */
  subtype?: { id: string; dateFloor: number | null; dateCeiling: number | null };
  /** P0 clue keys, verbatim and in emission order. */
  clueKeys: string[];
};

export const COMMODE_RUNS: CommodeRun[] = [
  {
    run: 1,
    formId: "form_stool",
    formLabel: "Stool",
    styleContext: "Modernist / chrome-frame",
    dateFloor: 1900,
    dateCeiling: 1930,
    valueLow: 386,
    valueHigh: 943,
    sellability: 72,
    clueKeys: [
      "lift_lid", "commode_function", "seating_surface", "vertical_supports", "bun_feet",
      "frame_and_panel_sides", "solid_wood_construction", "wood_species_oak_group", "butt_hinge",
      "machine_made_hinge", "slotted_screw", "stamped_metal_bracket", "maker_label",
      "visible_text_us_standard", "enameled_steel_insert", "circular_aperture_seat_board",
      "two_part_hinged_lid", "lid_crack_split", "surface_wear_scratches", "shellac_intact",
      "corner_post_construction", "mortise_and_tenon", "victorian_commode_form", "interior_seat_frame",
      "brass_hardware_material", "tarnished_brass_hardware", "turned_finials_on_posts",
      "brass_frame", "tubular_steel", "seating_present",
    ],
  },
  {
    run: 2,
    formId: "form_stool",
    formLabel: "Stool",
    styleContext: "Modernist / chrome-frame",
    dateFloor: 1900,
    dateCeiling: 1930,
    valueLow: 367,
    valueHigh: 896,
    sellability: 64,
    clueKeys: [
      "lift_lid", "seating_surface", "commode_chamber_pot_function", "maker_label", "visible_text",
      "enameled_steel_basin", "wood_species_oak_group", "turned_corner_posts", "bun_feet",
      "frame_and_panel_sides", "circular_aperture_cutout", "solid_wood_construction",
      "interior_floor_split_boards", "butt_hinge", "brass_lid_catch_or_bracket", "slotted_screw",
      "top_panel_crack", "surface_wear_scratches", "shellac_intact", "age_patina_consistent",
      "victorian_utilitarian_commode_form", "turned_bun_foot_style", "corner_post_mortise_and_tenon",
      "turned_finial_post_tops", "enameled_ware_white_blue_rim", "tubular_steel", "brass_frame",
      "seating_present", "door_present",
    ],
  },
  {
    run: 3,
    formId: "form_stool",
    formLabel: "Stool",
    styleContext: "Unresolved",
    dateFloor: 1900,
    dateCeiling: 1920,
    valueLow: 132,
    valueHigh: 314,
    sellability: 60,
    clueKeys: [
      "lift_lid", "commode_function", "seating_surface", "turned_corner_posts", "bun_feet",
      "turned_finials_on_posts", "wood_species_oak_group", "solid_wood_construction",
      "frame_and_panel_sides", "butt_hinge", "slotted_screw", "stamped_metal_bracket",
      "circular_aperture_seat_board", "two_board_top", "top_split_crack", "surface_wear_scratches",
      "shellac_intact", "maker_label", "enameled_ware_chamber_pot", "victorian_commode_form",
      "corner_block_reinforcement", "mortise_and_tenon", "label_text_full", "hinge_tarnish",
      "interior_seat_frame", "brass_frame", "seating_present",
    ],
  },
  {
    run: 4,
    formId: "form_stool",
    formLabel: "Stool",
    styleContext: "Modernist / chrome-frame",
    dateFloor: 1900,
    dateCeiling: 1930,
    valueLow: 386,
    valueHigh: 943,
    sellability: 72,
    clueKeys: [
      "lift_lid", "commode_close_stool_function", "seating_surface", "turned_corner_posts", "bun_feet",
      "frame_and_panel_sides", "wood_species_oak_group", "solid_wood_construction", "butt_hinge",
      "machine_made_hinge", "stamped_metal_bracket", "slotted_screw", "maker_label",
      "visible_text_label", "enameled_steel_basin", "circular_aperture_seat_board",
      "corner_block_reinforcement", "lid_split_crack", "surface_wear_scratches", "shellac_intact",
      "victorian_utility_commode", "turned_finial_post_tops", "two_part_seat_board",
      "brass_hardware_oxidation", "brass_frame", "tubular_steel", "seating_present",
    ],
  },
  {
    run: 5,
    formId: "form_iron_bed",
    formLabel: "Brass bed or brass-frame furniture",
    styleContext: "Modernist / chrome-frame",
    dateFloor: 1900,
    dateCeiling: 1930,
    valueLow: 386,
    valueHigh: 943,
    sellability: 72,
    subtype: { id: "subtype_iron_bed_brass_revival", dateFloor: 1970, dateCeiling: null },
    clueKeys: [
      "lift_lid", "commode_chamber_pot_function", "seating_surface", "vertical_supports",
      "turned_bun_feet", "turned_corner_posts", "solid_wood_construction", "wood_species_oak_group",
      "frame_and_panel_sides", "butt_hinge", "machine_made_hinge", "slotted_screw",
      "stamped_metal_bracket", "maker_label", "enameled_ware_insert", "lid_crack_split",
      "surface_wear_scratches", "shellac_intact", "victorian_utilitarian_commode",
      "circular_cutout_platform", "two_board_lid_panel", "label_text_full", "enameled_steel_basin",
      "corner_post_tenon_tops", "brass_frame", "tubular_steel", "seating_present", "backrest_present",
    ],
  },
  {
    // Re-scan after Phases 2-4 were committed, but run against pre-fix code
    // (the branch was not deployed). Recorded outcome is therefore the OLD
    // behavior. Notable: this run coined NEW synonyms (commode_close_stool_form,
    // chamber_pot_cabinet, circular_cutout_interior, enameled_ware_white_basin)
    // that the exact-match alias table did not cover — the reason the commode
    // detector was made substring-based.
    run: 6,
    formId: "form_stool",
    formLabel: "Stool",
    styleContext: "Modernist / chrome-frame",
    dateFloor: 1900,
    dateCeiling: 1930,
    valueLow: 386,
    valueHigh: 943,
    sellability: 72,
    clueKeys: [
      "lift_lid", "commode_close_stool_form", "chamber_pot_cabinet", "vertical_supports",
      "mortise_and_tenon", "solid_wood_construction", "wood_species_oak_group", "enameled_steel_basin",
      "maker_label", "butt_hinge", "machine_made_hinge", "slotted_screw", "stamped_metal_bracket",
      "turned_bun_feet", "turned_finial_post_tops", "molded_top_edge", "surface_scratches",
      "top_board_crack", "side_panel_crack", "shellac_intact", "two_board_lid_construction",
      "circular_cutout_interior", "frame_and_panel_sides", "interior_frame_visible", "visible_text",
      "hardware_tarnish", "enameled_ware_white_basin", "brass_frame", "tubular_steel", "cabinet_form",
    ],
  },
  {
    // First live re-scan after the fix deployed. Regressed to Nightstand: the
    // model's commode description said "...night stand with chamber pot", which
    // tripped the bedside-cabinet text-match (Nightstand, 96) — tying the
    // commode's score and winning on insertion order. Recorded outcome is that
    // pre-fix flip; the fix scores the commode above the cousin tier and gates
    // the nightstand match when commode evidence is present.
    run: 7,
    formId: "form_nightstand",
    formLabel: "Nightstand",
    styleContext: "Unresolved",
    dateFloor: 1900,
    dateCeiling: 1920,
    valueLow: 155,
    valueHigh: 353,
    sellability: 54,
    clueKeys: [
      "lift_lid", "commode_chamber_pot_cabinet", "vertical_supports", "bun_feet",
      "turned_finials_on_posts", "solid_wood_construction", "wood_species_oak_group",
      "frame_and_panel_sides", "mortise_and_tenon", "butt_hinge", "machine_made_hinge",
      "slotted_screw", "stamped_metal_bracket", "maker_label", "enameled_steel_basin",
      "lid_panel_split", "surface_wear_scratches", "shellac_intact", "hardware_tarnish",
      "circular_aperture_seat_board", "two_part_hinged_lid", "victorian_utilitarian_form",
      "corner_post_leg_construction", "visible_text", "cabinet_form",
    ],
  },
];
