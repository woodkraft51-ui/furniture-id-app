const WM = {
  tiers: {
    hidden_structure: 10,
    construction:      9,
    toolmarks:         8,
    fasteners:         8,
    interior_logic:    8,
    hardware:          6,
    materials:         6,
    repairs:           5,
    finish:            4,
    style:             3,
    provenance:        1,
  },
  negative_rules: {
    phillips_screw_pre1930: -15,
    particle_board:         -25,
    plywood_pre1905:        -20,
    mdf:                    -25,
    staple_fastener:        -15,
    polyurethane_original:  -10,
    modern_concealed_hinge: -15,
    orbital_sander_swirl:   -8,
  },
  bands: {
    High:         [85, 100],
    Moderate:     [65, 84],
    Low:          [40, 64],
    Inconclusive: [0,  39],
  },
  bandOf(pct) {
    if (pct >= 85) return "High";
    if (pct >= 65) return "Moderate";
    if (pct >= 40) return "Low";
    return "Inconclusive";
  },
  // Per-clue scores derived from tier base weights
  clues: {
    // Tier: toolmarks (8)
    pit_saw_marks:           { tier:"toolmarks",   age_support: 12, era:"pre-1830" },
    circular_saw_arcs:       { tier:"toolmarks",   age_support: 10, era:"post-1830" },
    band_saw_lines:          { tier:"toolmarks",   age_support: 10, era:"post-1870" },
    hand_plane_chatter:      { tier:"toolmarks",   age_support:  4, era:"any" },
    machine_routing_uniform: { tier:"toolmarks",   age_support:  8, era:"post-1900" },
    // Tier: fasteners (8)
    hand_forged_nail:        { tier:"fasteners",   age_support: 10, era:"1600-1800" },
    cut_nail:                { tier:"fasteners",   age_support: 10, era:"1790-1890" },
    wire_nail:               { tier:"fasteners",   age_support: 10, era:"post-1880" },
    slotted_handmade_screw:  { tier:"fasteners",   age_support: 10, era:"1770-1840" },
    slotted_machine_screw:   { tier:"fasteners",   age_support:  6, era:"post-1840" },
    phillips_screw:          { tier:"fasteners",   age_opposing: 15, era:"post-1930", negative_rule:"phillips_screw_pre1930" },
    staple_fastener:         { tier:"fasteners",   age_opposing: 15, era:"post-1945", negative_rule:"staple_fastener" },
    // Tier: construction (9)
    hand_cut_dovetails:      { tier:"construction", age_support: 12, originality_support: 12, era:"pre-1860" },
    machine_dovetails:       { tier:"construction", age_support: 10, era:"post-1860" },
    mortise_and_tenon:       { tier:"construction", age_support:  8, originality_support:  8, era:"1600-1900" },
    dowel_joinery:           { tier:"construction", age_support:  6, era:"post-1900" },
    butt_joint_screwed:      { tier:"construction", age_opposing:  8, originality_opposing: 8, era:"modern" },
    frame_and_panel:         { tier:"construction", originality_support: 6 },
    solid_board_drawer_bottom:{ tier:"construction", originality_support: 6 },
    glue_blocks:             { tier:"construction", originality_support: 4 },
    plywood_drawer_bottom:   { tier:"construction", age_opposing: 15, negative_rule:"plywood_pre1905" },
    // Tier: hidden_structure (10)
    pedal_cavity_structure:  { tier:"hidden_structure", form_support: 12, conversion_support: 12, era:"1850-1920" },
    treadle_mount:           { tier:"hidden_structure", form_support: 12, conversion_support: 12, era:"1860-1910" },
    ice_chamber:             { tier:"hidden_structure", form_support: 12, conversion_support: 12, era:"1880-1920" },
    structural_void:         { tier:"hidden_structure", conversion_support: 8 },
    // Tier: materials (6)
    poplar_secondary:        { tier:"materials",   age_support:  5, era:"19th-century" },
    gumwood_secondary:       { tier:"materials",   age_support:  4, era:"1880-1940" },
    pine_secondary:          { tier:"materials",   originality_support: 3 },
    plywood_structural:      { tier:"materials",   age_opposing: 20, negative_rule:"plywood_pre1905" },
    particle_board:          { tier:"materials",   age_opposing: 25, originality_opposing: 25, negative_rule:"particle_board" },
    mdf:                     { tier:"materials",   age_opposing: 25, originality_opposing: 25, negative_rule:"mdf" },
    // Tier: hardware (6)
    porcelain_caster:        { tier:"hardware",    age_support:  8, era:"1830-1870" },
    wood_caster:             { tier:"hardware",    age_support:  6, era:"1800-1840" },
    victorian_strap_hinge:   { tier:"hardware",    age_support:  6, style_support: 4, era:"1865-1895" },
    batwing_brass_pull:      { tier:"hardware",    age_support:  8, era:"1720-1790", max_multiplier: 0.5 },
    eastlake_pull:           { tier:"hardware",    age_support:  6, style_support: 4, era:"1870-1890" },
    surface_lock:            { tier:"hardware",    age_support:  4, era:"1750-present" },
    modern_concealed_hinge:  { tier:"hardware",    age_opposing: 15, originality_opposing: 15, negative_rule:"modern_concealed_hinge" },
    // Tier: finish (4)
    shellac:                 { tier:"finish",      age_support:  4, era:"1800-1920" },
    oil_finish:              { tier:"finish",      age_support:  2, era:"any" },
    polyurethane:            { tier:"finish",      originality_opposing: 10, negative_rule:"polyurethane_original" },
    // Tier: interior_logic (8)
    interior_matches_form:       { tier:"interior_logic", form_support: 15 },
    cavity_matches_mechanism:    { tier:"interior_logic", form_support: 15, original_form_support: 15 },
    proportions_fit_form:        { tier:"interior_logic", form_support:  8 },
    leg_structure_fits:          { tier:"interior_logic", form_support:  8 },
    storage_arrangement_fits:    { tier:"interior_logic", form_support:  6 },
    use_conflicts_with_structure:{ tier:"interior_logic", conversion_support: 10 },
    mechanism_removed:           { tier:"interior_logic", conversion_support:  8 },
    incompatible_top_added:      { tier:"interior_logic", conversion_support:  8 },
  },
  // Conflict penalties
  penalties: {
    style_vs_construction:           -8,
    hardware_vs_structure_replaced:  -4,
    hardware_vs_structure_original: -10,
    finish_newer_than_structure:     -5,
    interior_logic_vs_form:         -10,
    composite_mismatch:             -12,
    missing_critical_evidence:       -5,
  },
  // Conflict recoveries
  recoveries: {
    revival_style:                    5,
    replacement_hardware:             4,
    antique_repair:                   3,
    conversion:                       6,
    composite_marriage_piece:         3,
    early_industrial_transition:      4,
    rural_persistence_older_methods:  4,
  },
  // Valuation modifiers (%)
  value_modifiers: {
    strong_originality:               +10,
    rare_desirable_form:              +10,
    attractive_documented_conversion: +4,
    strong_decorative_appeal:         +4,
    known_provenance:                 +5,
    major_alteration:                 -8,
    modern_refinish:                  -5,
    replaced_hardware_only:           -3,
    severe_structural_instability:   -10,
    weak_market_style:                -5,
    incomplete_conversion:            -6,
    missing_original_components:      -4,
  },
};

// ============================================================
// REFERENCE DATABASE  — mirrors PostgreSQL seed data
// ============================================================
const DB = {
  forms: [
    { id:"f01", name:"pump organ cabinet",     parent_category:"specialized", common_eras:"1870–1900", common_conversion_targets:"desk,cabinet,bar" },
    { id:"f02", name:"drop-leaf table",        parent_category:"table",       common_eras:"1700s–1900s" },
    { id:"f03", name:"gate-leg table",         parent_category:"table",       common_eras:"1600s–1900s" },
    { id:"f04", name:"washstand",              parent_category:"case_piece",  common_eras:"1820–1900",  common_conversion_targets:"bathroom_vanity" },
    { id:"f05", name:"sideboard",              parent_category:"case_piece",  common_eras:"1780–1900" },
    { id:"f06", name:"buffet",                 parent_category:"case_piece",  common_eras:"1870–1930" },
    { id:"f07", name:"server",                 parent_category:"case_piece",  common_eras:"1870–1930" },
    { id:"f08", name:"dresser",                parent_category:"case_piece",  common_eras:"1800s–present" },
    { id:"f09", name:"chest of drawers",       parent_category:"case_piece",  common_eras:"1700s–present" },
    { id:"f10", name:"blanket chest",          parent_category:"case_piece",  common_eras:"1700s–1900s",  common_conversion_targets:"bench" },
    { id:"f11", name:"pie safe",               parent_category:"case_piece",  common_eras:"1820–1880" },
    { id:"f12", name:"jelly cupboard",         parent_category:"case_piece",  common_eras:"1800s" },
    { id:"f13", name:"china cabinet",          parent_category:"case_piece",  common_eras:"1880s–present" },
    { id:"f14", name:"bookcase",               parent_category:"case_piece",  common_eras:"1700s–present" },
    { id:"f15", name:"wardrobe",               parent_category:"case_piece",  common_eras:"1800s–present" },
    { id:"f16", name:"writing table",          parent_category:"desk",        common_eras:"1700s–present" },
    { id:"f17", name:"secretary desk",         parent_category:"desk",        common_eras:"1700s–1900s" },
    { id:"f18", name:"slant-front desk",       parent_category:"desk",        common_eras:"1700s–1800s" },
    { id:"f19", name:"Windsor chair",          parent_category:"seating",     common_eras:"1700s–present" },
    { id:"f20", name:"rocking chair",          parent_category:"seating",     common_eras:"1800s–present" },
    { id:"f21", name:"milking stool",          parent_category:"seating",     common_eras:"1800s–early 1900s" },
    { id:"f22", name:"sewing machine cabinet", parent_category:"specialized", common_eras:"1870–1910",   common_conversion_targets:"nightstand,side_table" },
    { id:"f23", name:"icebox",                 parent_category:"specialized", common_eras:"1880–1920",   common_conversion_targets:"bar,beverage_cabinet" },
  ],
  style_families: [
    { id:"s01", name:"Queen Anne",              era_start:1720, era_end:1760 },
    { id:"s02", name:"Federal",                 era_start:1780, era_end:1820 },
    { id:"s03", name:"Empire",                  era_start:1815, era_end:1845 },
    { id:"s04", name:"Rococo Revival",          era_start:1845, era_end:1870 },
    { id:"s05", name:"Renaissance Revival",     era_start:1860, era_end:1885 },
    { id:"s06", name:"Gothic Revival",          era_start:1865, era_end:1895 },
    { id:"s07", name:"Eastlake",                era_start:1870, era_end:1890 },
    { id:"s08", name:"Colonial Revival",        era_start:1880, era_end:1930 },
    { id:"s09", name:"Arts and Crafts / Mission",era_start:1895, era_end:1925 },
    { id:"s10", name:"Art Deco",                era_start:1925, era_end:1940 },
    { id:"s11", name:"Mid-Century Modern",      era_start:1945, era_end:1970 },
  ],
  market_lanes: [
    { id:1, name:"dealer_buy",       description:"Dealer acquisition price" },
    { id:2, name:"quick_sale",       description:"Fast local/estate sale" },
    { id:3, name:"marketplace",      description:"Facebook Marketplace peer-to-peer" },
    { id:4, name:"as_found_retail",  description:"Retail unrestored" },
    { id:5, name:"restored_retail",  description:"Retail after restoration" },
  ],

  // ── conflict_resolution_rules  (mirrors PostgreSQL table) ───
  // Each rule defines a known contradiction pattern.
  // The Conflict Detection Engine matches observed evidence pairs
  // against these rules and applies penalty + recovery arithmetic.
  conflict_resolution_rules: [
    {
      id: 1,
      conflict_type:       "revival_style",
      trigger_evidence_a:  "early_style_language",
      trigger_evidence_b:  "late_construction_methods",
      likely_explanation:  "Revival furniture reproducing an earlier style using later construction methods",
      confidence_penalty:  -6,
      confidence_recovery:  4,
      notes: "Style date < construction date. Colonial design with machine dovetails is the canonical example.",
    },
    {
      id: 2,
      conflict_type:       "hardware_replacement",
      trigger_evidence_a:  "modern_fastener",
      trigger_evidence_b:  "antique_structure",
      likely_explanation:  "Original hardware likely replaced during repair or restoration — structure remains antique",
      confidence_penalty:  -4,
      confidence_recovery:  3,
      notes: "Phillips screws in 19th-century joinery. Hardware score penalized; structure score preserved.",
    },
    {
      id: 3,
      conflict_type:       "marriage_piece",
      trigger_evidence_a:  "different_wood_aging",
      trigger_evidence_b:  "inconsistent_joinery",
      likely_explanation:  "Composite object assembled from components originating in different pieces or eras",
      confidence_penalty: -10,
      confidence_recovery:  0,
      notes: "Base from one era, top from another. Zero recovery — composite status must be stated plainly in report.",
    },
    {
      id: 4,
      conflict_type:       "conversion_furniture",
      trigger_evidence_a:  "specialized_cavity",
      trigger_evidence_b:  "missing_original_mechanism",
      likely_explanation:  "Furniture repurposed from its original function to a new use",
      confidence_penalty:  -6,
      confidence_recovery:  6,
      notes: "Pump organ cabinet → desk is the canonical example. Full recovery when conversion is clearly documented.",
    },
    {
      id: 5,
      conflict_type:       "rural_persistence",
      trigger_evidence_a:  "early_joinery_methods",
      trigger_evidence_b:  "later_fasteners",
      likely_explanation:  "Older construction techniques persisted in rural or small-workshop settings alongside later fastener materials",
      confidence_penalty:  -4,
      confidence_recovery:  3,
      notes: "Hand-cut dovetails with wire nails. No strong industrial features. Common in 1880–1910 American rural work.",
    },
  ],
};

// ============================================================
// CASE STORE  — in-memory, mirrors PostgreSQL case tables
// Includes case_observations table for Phase 0 visual scan.
// ============================================================
