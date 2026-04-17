'use client';
 
import { useState, useRef, useEffect } from "react";

// ============================================================
// EVIDENCE WEIGHTING MATRIX  — single authoritative source
// All phase scoring references WM.tiers and WM.negative_rules
// ============================================================
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
const caseStore = {};
let caseCounter  = 1000;
let obsCounter   = 0;

const API = {
  createCase(data) {
    const id = `case-${++caseCounter}`;
    caseStore[id] = {
      id, status: "new",
      notes_from_user: data.notes       || "",
      dimensions_text: data.dimensions  || "",
      provenance_text: data.provenance  || "",
      images:          [],
      intake_answers:  [],
      // case_observations  — append-only; Phase 0 writes here
      // human_reviewed_ids — set of obs IDs locked from overwrite
      observations:          [],
      human_reviewed_ids:    new Set(),
      stage_outputs:  {},
      conflicts:      [],
      scores:         null,
      form_assessment:null,
      valuations:     [],
      final_report:   null,
    };
    return { case_id: id };
  },

  addImage(caseId, d) {
    caseStore[caseId].images.push({
      id: `img-${Date.now()}-${Math.random()}`,
      case_id: caseId,
      ...d,
    });
    return caseStore[caseId].images.slice(-1)[0];
  },

  // ── Non-destructive observation writer ────────────────────
  // Phase 0 calls this for every clue it finds.
  // Rules:
  //   • Always appends new observations.
  //   • Never deletes existing observations.
  //   • Never overwrites an entry whose id is in human_reviewed_ids.
  //   • created_by_stage is recorded so provenance is always clear.
  addObservation(caseId, obs) {
    const c = caseStore[caseId];
    if (!c) throw new Error("Case not found");
    const id = `obs-${++obsCounter}`;
    const entry = {
      id,
      case_id:            caseId,
      observation_type:   obs.observation_type,
      reference_table:    obs.reference_table    || null,
      reference_id:       obs.reference_id       || null,
      observed_value_text:obs.observed_value_text,
      source_image_id:    obs.source_image_id    || null,
      // confidence triple
      raw_confidence:     obs.raw_confidence,
      weight_multiplier:  obs.weight_multiplier,
      effective_confidence: parseFloat(
        (obs.raw_confidence * obs.weight_multiplier).toFixed(4)
      ),
      confidence_score:   obs.raw_confidence,   // legacy field kept for compat
      is_hidden_surface:  obs.is_hidden_surface  || false,
      region_label:       obs.region_label       || null,
      created_by_stage:   obs.created_by_stage   || "phase_0_visual_scan",
      human_reviewed:     false,
      created_at:         new Date().toISOString(),
    };
    c.observations.push(entry);
    return entry;
  },

  // Mark an observation as human-reviewed — locks it from overwrite
  markReviewed(caseId, obsId) {
    const c = caseStore[caseId];
    if (!c) throw new Error("Case not found");
    c.human_reviewed_ids.add(obsId);
    const obs = c.observations.find(o => o.id === obsId);
    if (obs) obs.human_reviewed = true;
    return { locked: obsId };
  },

  getObservations(caseId) {
    return caseStore[caseId].observations || [];
  },

  async analyzeCase(caseId, intakeAnswers, onPhase) {
    const c = caseStore[caseId];
    c.status = "analyzing";
    c.intake_answers = intakeAnswers;

    // Compute missing_evidence flags from submitted images before analysis runs.
    // These are recorded on the case object and passed to the engine.
    // They drive confidence caps in Phase 1 and surface guidance messages in the UI.
    const imageTypes = new Set(c.images.map(i => i.image_type));
    c.missing_evidence = {
      underside_photo: !imageTypes.has("underside"),
      back_photo:      !imageTypes.has("back"),
      joinery_photo:   !imageTypes.has("joinery_closeup"),
      hardware_photo:  !imageTypes.has("hardware_closeup"),
      label_photo:     !imageTypes.has("label_makers_mark"),
    };

    const result = await PE.runAllPhases(c, c.images, intakeAnswers, onPhase);
    Object.assign(c, result);
    // Expose visual_evidence at case level
    if (c.stage_outputs && c.stage_outputs["0_visual_scan"]) {
      c.visual_evidence = c.stage_outputs["0_visual_scan"];
    }
    c.status = "complete";
    return { case_id: caseId, status: "complete" };
  },

  async quickAnalyzeCase(caseId, intakeAnswers, onPhase) {
    const c = caseStore[caseId];
    c.status = "analyzing";
    c.intake_answers = intakeAnswers;
    const result = await PE.runQuickMode(c, c.images, intakeAnswers, onPhase);
    c.stage_outputs  = result.stage_outputs;
    c.quick_result   = result.quick_result;
    // Expose visual_evidence at case level for cross-mode access
    if (result.stage_outputs && result.stage_outputs["0_evidence_digest"]) {
      c.visual_evidence = result.stage_outputs["0_evidence_digest"];
    }
    c.status = "quick_complete";
    return { case_id: caseId, status: "quick_complete" };
  },

  getReport(caseId) {
    const c = caseStore[caseId];
    return {
      case_id:          caseId,
      status:           c.status,
      final_report:     c.final_report,
      scores:           c.scores,
      form_assessment:  c.form_assessment,
      valuations:       c.valuations,
      stage_outputs:    c.stage_outputs,
      conflicts:        c.conflicts,
      observations:     c.observations,
      missing_evidence: c.missing_evidence || {},
    };
  },
};

// ============================================================
// PROMPT ENGINE  — v0.3
// Single authoritative weight source: WM object above.
// All 7 phases, full trigger logic, scorecard accumulation.
// ============================================================

// ============================================================
// EVIDENCE DIGEST ADAPTER
// ============================================================
// Single integration point for Stage 0 image analysis.
// mode: "mock"  — returns structured stub data for UI/pipeline testing
// mode: "live"  — calls Anthropic API directly (blocked inside artifact sandbox)
//
// To switch to a supported proxy or backend, replace the "live" branch only.
// The mock response is tuned to a drop-leaf / gateleg table test case.
// ============================================================
type EngineMode = "live" | "mock";

let EVIDENCE_ADAPTER_MODE: EngineMode = "live"; // "mock" | "live" — Field Scan evidence extractor
let FULL_ANALYSIS_MODE: EngineMode = "live"; // "mock" | "live" — Full Analysis phase engine
//
// To connect a real backend:
//   Set FULL_ANALYSIS_MODE = "live"  and ensure api.anthropic.com is reachable
//   Set EVIDENCE_ADAPTER_MODE = "live" and replace PE.callClaudeQuick() with your proxy


// ============================================================
// RUNTIME MODE PROBE
// Evaluates the exact reason the engine is simulated or live.
// Called once at startup and on every result render.
// ============================================================
function getRuntimeMode() {
  const fullMock = String(FULL_ANALYSIS_MODE) === "mock";
  const fieldMock = String(EVIDENCE_ADAPTER_MODE) === "mock";

  const reasons = [];
  if (fullMock)  reasons.push('FULL_ANALYSIS_MODE="mock"');
  if (fieldMock) reasons.push('EVIDENCE_ADAPTER_MODE="mock"');
  if (!fullMock && !fieldMock) reasons.push("flags=live — fetch result determines actual mode");

  const mode = (fullMock || fieldMock) ? "SIMULATED_FALLBACK" : "LIVE";

  return {
    engine_mode:                mode,
    live_llm_enabled:           !fullMock,
    live_field_scan:            !fieldMock,
    anthropic_key_present:      false,   // injected by platform proxy — not visible to JS
    fetch_blocked:              false,   // unknown until first call — check per-call logs
    backend_endpoint_available: true,    // platform proxy at api.anthropic.com/v1/messages
    api_version_header:         "2023-06-01",
    full_analysis_flag:         typeof FULL_ANALYSIS_MODE    !== "undefined" ? FULL_ANALYSIS_MODE    : "undefined",
    field_scan_flag:            typeof EVIDENCE_ADAPTER_MODE !== "undefined" ? EVIDENCE_ADAPTER_MODE : "undefined",
    simulation_reason:          reasons.join(" | ") || "none — live mode active",
    primary_trigger:            reasons[0] || "none — live mode active",
  };
}

const RUNTIME_MODE = getRuntimeMode();
console.info("[NCW Runtime]", JSON.stringify(RUNTIME_MODE, null, 2));



async function runEvidenceDigest(images, context) {
  const photoCount  = images.filter(function(i){ return i.data_url; }).length;
  const imageLabels = images.map(function(i){ return i.image_type; }).join(", ");

  console.info("[NCW Adapter] runEvidenceDigest — mode:", EVIDENCE_ADAPTER_MODE,
    "| photos:", photoCount, "| types:", imageLabels);

  if (EVIDENCE_ADAPTER_MODE === "mock") {
    // ── Mock profiles — selectable by user guess ─────────────────
    // Each profile simulates a different furniture form for testing.
    const MOCK_PROFILES = {
      "drop-leaf table": {
        broad_form_guess: "drop-leaf table", primary_wood_guess: "walnut",
        strongest_mechanism: "drop_leaf_hinged",
        mechanisms_detected: {
          drop_leaf_hinged: { present:true, confidence:85, note:"Hinge line visible along both long edges of top" },
          gateleg_support:  { present:true, confidence:72, note:"Pivoting gate leg assembly visible" },
          rule_joint:       { present:true, confidence:60, note:"Rounded interlocking profile at leaf join" },
        },
        evidence_digest: [
          "Drop leaves visible on both sides — fold seam runs full length of each long edge",
          "Gate leg assembly present — pivoting leg swings out to support raised leaf",
          "Rule joint profile visible at leaf-to-top junction",
          "Four turned legs with stretcher base",
          "Walnut primary wood — tight grain visible",
          "Cut nails on underside apron — rectangular cross-section (1790–1890)",
          "Circular saw arcs on underside boards (post-1830)",
        ],
        fastener_clues: [{clue:"cut_nail", visual_confidence:65, source_photo:"underside", era:"1790-1890"}],
        toolmark_clues: [{clue:"circular_saw_arcs", visual_confidence:60, source_photo:"underside"}],
      },
      "chest": {
        broad_form_guess: "blanket chest", primary_wood_guess: "pine",
        strongest_mechanism: "lift_lid",
        mechanisms_detected: {
          lift_lid:      { present:true, confidence:90, note:"Hinged top lifts to reveal interior storage" },
          till_interior: { present:true, confidence:65, note:"Small till tray visible near hinge end" },
        },
        evidence_digest: [
          "Hinged lid lifts to reveal interior — classic blanket chest form",
          "Small till tray visible inside near hinge end",
          "Pine primary wood — wide boards, visible knots",
          "Wrought iron strap hinges on back",
          "Cut nails visible on corner boards",
          "Hand plane marks visible on interior surfaces",
        ],
        fastener_clues: [{clue:"cut_nail", visual_confidence:70, source_photo:"overall_front", era:"1790-1890"}],
        toolmark_clues: [{clue:"hand_plane_chatter", visual_confidence:55, source_photo:"interior"}],
      },
      "desk": {
        broad_form_guess: "slant-front desk", primary_wood_guess: "cherry",
        strongest_mechanism: "slant_front",
        mechanisms_detected: {
          slant_front:   { present:true, confidence:88, note:"Angled fall-front writing surface visible" },
          drawer_present:{ present:true, confidence:80, note:"Four drawers below fall front" },
        },
        evidence_digest: [
          "Slant-front fall-front writing surface — folds down to reveal fitted interior",
          "Four graduated drawers below fall front",
          "Fitted interior with pigeonholes and small drawers visible",
          "Cherry primary wood — reddish-brown patina",
          "Bail brass hardware on drawer fronts",
          "Hand-cut dovetails visible on drawer corners",
        ],
        fastener_clues: [{clue:"slotted_handmade_screw", visual_confidence:60, source_photo:"hardware_closeup", era:"pre-1840"}],
        toolmark_clues: [{clue:"hand_plane_chatter", visual_confidence:50, source_photo:"underside"}],
      },
      "dresser": {
        broad_form_guess: "chest of drawers", primary_wood_guess: "walnut",
        strongest_mechanism: "multiple_drawer_case",
        mechanisms_detected: {
          multiple_drawer_case: { present:true, confidence:88, note:"Five-drawer case configuration" },
          mirror_attachment:    { present:true, confidence:70, note:"Mirror frame mount visible at top" },
        },
        evidence_digest: [
          "Five-drawer graduated case — classic Victorian dresser form",
          "Mirror attachment hardware at top of case",
          "Walnut primary wood with burl veneer panels on drawer fronts",
          "Machine dovetails on drawer corners",
          "Porcelain casters under each foot",
          "Eastlake-style incised brass pulls on all drawers",
        ],
        fastener_clues: [{clue:"wire_nail", visual_confidence:55, source_photo:"underside", era:"post-1880"}],
        toolmark_clues: [{clue:"band_saw_lines", visual_confidence:60, source_photo:"underside"}],
      },
    };
    // Select profile based on user guess, default to drop-leaf table
    const guessLower = (context.userGuess || "").toLowerCase();
    const selectedProfile =
      (guessLower.includes("chest") || guessLower.includes("trunk")) ? MOCK_PROFILES["chest"] :
      (guessLower.includes("desk") || guessLower.includes("secretary")) ? MOCK_PROFILES["desk"] :
      (guessLower.includes("dresser") || guessLower.includes("drawer")) ? MOCK_PROFILES["dresser"] :
      MOCK_PROFILES["drop-leaf table"];
    const mock = {
      _adapter_mode: "mock",
      photos_used_count: photoCount,
      photo_types_included: images.map(function(i){ return i.image_type; }),
      image_quality_overall: "good",
      ...selectedProfile,
      // Ensure all required mechanism keys are present
      mechanisms_detected: {
        drop_leaf_hinged:{present:false,confidence:0,note:""},gateleg_support:{present:false,confidence:0,note:""},
        rule_joint:{present:false,confidence:0,note:""},swing_leg:{present:false,confidence:0,note:""},
        lift_lid:{present:false,confidence:0,note:""},till_interior:{present:false,confidence:0,note:""},
        slant_front:{present:false,confidence:0,note:""},cylinder_roll:{present:false,confidence:0,note:""},
        multiple_drawer_case:{present:false,confidence:0,note:""},door_present:{present:false,confidence:0,note:""},
        pedestal_base:{present:false,confidence:0,note:""},tilt_top:{present:false,confidence:0,note:""},
        tripod_base:{present:false,confidence:0,note:""},mirror_attachment:{present:false,confidence:0,note:""},
        drawer_present:{present:false,confidence:0,note:""},
        ...(selectedProfile.mechanisms_detected || {}),
      },
      hard_negatives: [],
    };
    console.info("[NCW Adapter] Mock digest ready — mechanisms:",
      Object.keys(mock.mechanisms_detected).filter(function(k){ return mock.mechanisms_detected[k].present; }),
      "| evidence items:", mock.evidence_digest.length);
    return mock;
  }

  // ── Live mode — direct Anthropic API call ────────────────────
  // NOTE: This path is blocked inside the Claude artifact sandbox.
  // Replace with a supported proxy endpoint when deploying outside sandbox.
  console.warn("[NCW Adapter] live mode — direct fetch to api.anthropic.com (may be blocked in sandbox)");
  // Build per-type guidance for the model
  const typeGuidance = images.filter(function(i){ return i.data_url; }).map(function(i, idx) {
    const tg = {
      underside:        "Photo " + (idx+1) + " (UNDERSIDE): Focus extraction on saw marks, nail types, joinery — primary dating evidence",
      back_panel:       "Photo " + (idx+1) + " (BACK PANEL): Focus extraction on backboard construction, fasteners, secondary wood — age clues",
      overall_front:    "Photo " + (idx+1) + " (OVERALL FRONT): Extract form, structural mechanisms, leg type, hardware visibility",
      hardware_closeup: "Photo " + (idx+1) + " (HARDWARE): Extract hardware type, fastener type, originality indicators",
      joinery_closeup:  "Photo " + (idx+1) + " (JOINERY): Extract joint type, cut method, drawer construction",
      overall_side:     "Photo " + (idx+1) + " (SIDE VIEW): Extract form profile, depth, mechanism visibility",
    }[i.image_type] || ("Photo " + (idx+1) + " (" + (i.image_type||"unknown").toUpperCase() + ")");
    return tg;
  }).join("; ");
  return await PE.callClaudeQuick(
    "You are the Mechanism Detection engine. " +
    "Photos: " + photoCount + " | " + typeGuidance,
    PE.imgs(images)
  );
}


// ── parseModelJSON ───────────────────────────────────────────────────
// Tolerant JSON extractor used by all AI phases.
// Handles responses where the model adds preamble or trailing text.
// Throws on total failure so callClaude's catch block captures it.
function parseModelJSON(responseText) {
  if (!responseText) throw new Error("Empty response text");
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid response format — no JSON object found");
  try {
    return JSON.parse(jsonMatch[0]);
  } catch(err) {
    throw new Error("JSON parse failed: " + err.message);
  }
}


// ── Runtime mode badge — rendered in both Field Scan and Full Analysis results ──
function RuntimeModeBadge() {
  const m = RUNTIME_MODE;
  const isLive = m.engine_mode === "LIVE";
  const isSim  = m.engine_mode === "SIMULATED_FALLBACK";

  const cfg = isLive ? {
    label: "LIVE ENGINE",
    bg: "#edf5ec", border: "#7db87a", color: "#2a5a28",
    icon: "●",
  } : isSim ? {
    label: "SIMULATED FALLBACK",
    bg: "#fdf6ec", border: "#e8c87a", color: "#7a5010",
    icon: "◎",
  } : {
    label: "ENGINE UNAVAILABLE",
    bg: "#fdf0f0", border: "#e8a0a0", color: "#7a2020",
    icon: "✕",
  };

  const [open, setOpen] = useState(false);

  return (
    <div style={{marginBottom:12, fontFamily:"sans-serif"}}>
      <div
        onClick={function(){ setOpen(function(o){ return !o; }); }}
        style={{
          display:"inline-flex", alignItems:"center", gap:6, cursor:"pointer",
          background:cfg.bg, border:"1px solid " + cfg.border, borderRadius:3,
          padding:"3px 10px", fontSize:11, fontWeight:700,
          letterSpacing:"0.08em", color:cfg.color, userSelect:"none",
        }}
      >
        <span style={{fontSize:9}}>{cfg.icon}</span>
        {cfg.label}
        <span style={{fontSize:9, opacity:0.6}}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{
          marginTop:4, padding:"10px 12px", background:"#f5f0e8",
          border:"1px solid #d4c9b4", borderRadius:3,
          fontSize:11, fontFamily:"monospace", color:"#555",
          display:"flex", flexDirection:"column", gap:3,
        }}>
          <div><strong>engine_mode:</strong> {m.engine_mode}</div>
          <div><strong>live_llm_enabled:</strong> {String(m.live_llm_enabled)}</div>
          <div><strong>anthropic_key_present:</strong> {String(m.anthropic_key_present)}</div>
          <div><strong>fetch_blocked:</strong> {String(m.fetch_blocked)}</div>
          <div><strong>backend_endpoint_available:</strong> {String(m.backend_endpoint_available)}</div>
          <div><strong>api_version_header:</strong> {m.api_version_header}</div>
          <div><strong>full_analysis_flag:</strong> {m.full_analysis_flag}</div>
          <div><strong>field_scan_flag:</strong> {m.field_scan_flag}</div>
          <div><strong>primary_trigger:</strong> {m.primary_trigger}</div>
          <div><strong>simulation_reason:</strong> {m.simulation_reason}</div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PICKER PROFILE SETUP — multi-step guided questionnaire
// ============================================================
function PickerProfileSetup({ draft, setDraft, step, setStep, onSave, onCancel }) {
  const sf = draft;

  // Build the visible step list based on current answers
  const steps = [];

  // Step 0 — restoration skill (always)
  steps.push({
    id: "restoration_skill",
    q: "How comfortable are you restoring furniture?",
    type: "single",
    opts: [
      { v:"none",         l:"None",         sub:"I only buy finished, ready-to-use pieces" },
      { v:"basic",        l:"Basic",         sub:"Cleaning, waxing, tightening loose joints" },
      { v:"intermediate", l:"Intermediate",  sub:"Refinishing, veneer repair, light structural" },
      { v:"advanced",     l:"Advanced",      sub:"Full structural repairs and complete restoration" },
    ],
  });

  // Step 1 — buying purpose (always)
  steps.push({
    id: "buying_purpose",
    q: "What are you usually buying for?",
    type: "single",
    opts: [
      { v:"resale",       l:"Resale",       sub:"Flip for profit — speed and margin matter" },
      { v:"personal",     l:"Personal Use", sub:"Keeping it — quality and character matter most" },
      { v:"both",         l:"Both",         sub:"Mix of resale and pieces I keep" },
    ],
  });

  // Step 2 — deal target (always)
  steps.push({
    id: "deal_target",
    q: "What kind of deal are you hoping to score?",
    type: "single",
    opts: [
      { v:"small",       l:"Small profit",      sub:"Buy at ~60–70% of resale value" },
      { v:"moderate",    l:"Moderate flip",      sub:"Buy at ~40–50% of resale value" },
      { v:"strong",      l:"Strong deal",        sub:"Buy at ~25–40% of resale value" },
      { v:"exceptional", l:"Exceptional deal",   sub:"Buy under ~25% of resale value" },
    ],
  });

  // Step 3 — work tolerance (always)
  steps.push({
    id: "work_tolerance",
    q: "How much work are you willing to put into a piece?",
    type: "single",
    opts: [
      { v:"none",     l:"None",                 sub:"Must be ready to sell or use immediately" },
      { v:"light",    l:"Light cleanup only",    sub:"Dusting, minor cleaning, hardware swap" },
      { v:"moderate", l:"Moderate restoration",  sub:"Refinishing, minor repairs, some time invested" },
      { v:"heavy",    l:"Heavy projects",        sub:"Major work is fine — I have time and skill" },
    ],
  });

  // Step 4 — storage space (always)
  steps.push({
    id: "storage_space",
    q: "How much storage space do you have?",
    type: "single",
    opts: [
      { v:"very_limited", l:"Very limited",             sub:"Apartment, small garage — size matters a lot" },
      { v:"moderate",     l:"Moderate",                  sub:"Standard garage or shed space" },
      { v:"large",        l:"Large workshop or storage", sub:"Plenty of room — size not a constraint" },
    ],
  });

  // Conditional: selling method (if resale or both)
  if (sf.buying_purpose === "resale" || sf.buying_purpose === "both") {
    steps.push({
      id: "selling_method",
      q: "How do you usually sell items?",
      type: "single",
      opts: [
        { v:"local_pickup",  l:"Local pickup only",   sub:"Buyers come to me — no hauling" },
        { v:"local_delivery",l:"Local delivery",       sub:"I deliver within my area" },
        { v:"nationwide",    l:"Nationwide shipping",  sub:"I ship — no geographic limit on buyers" },
        { v:"mixed",         l:"Mixed",                sub:"Depends on the piece" },
      ],
    });
    steps.push({
      id: "sales_priority",
      q: "What matters more when selling?",
      type: "single",
      opts: [
        { v:"fast",     l:"Fast sale",       sub:"Turnover and cash flow — move it quickly" },
        { v:"profit",   l:"Maximum profit",  sub:"Hold for the right price — patience pays" },
        { v:"balanced", l:"Balanced",        sub:"Reasonable speed at fair margin" },
      ],
    });
  }

  // Conditional: personal use priorities
  if (sf.buying_purpose === "personal") {
    steps.push({
      id: "personal_priority",
      q: "What matters most when buying for yourself?",
      type: "single",
      opts: [
        { v:"function",   l:"Function",            sub:"It needs to work well in my space" },
        { v:"beauty",     l:"Beauty",               sub:"Aesthetics and visual appeal first" },
        { v:"character",  l:"Historical character", sub:"Age, patina, and provenance matter most" },
        { v:"balanced",   l:"Balanced",             sub:"All three matter equally" },
      ],
    });
  }

  // Conditional: repair skills (if intermediate or advanced)
  if (sf.restoration_skill === "intermediate" || sf.restoration_skill === "advanced") {
    steps.push({
      id: "repair_skills",
      q: "Which repairs are you comfortable handling?",
      type: "multi",
      opts: [
        { v:"structural",   l:"Structural repairs",  sub:"Repairing breaks, rebuilding joints" },
        { v:"refinishing",  l:"Refinishing",          sub:"Stripping and applying new finish" },
        { v:"veneer",       l:"Veneer repair",        sub:"Patching, regluing, or replacing veneer" },
        { v:"regluing",     l:"Regluing joints",      sub:"Chair rungs, cabinet corners, etc." },
        { v:"upholstery",   l:"Upholstery work",      sub:"Fabric replacement and padding" },
      ],
    });
  }

  // Conditional: large item penalty (if very limited storage)
  if (sf.storage_space === "very_limited") {
    steps.push({
      id: "large_item_penalty",
      q: "Should the app heavily penalize large furniture in buy scores?",
      type: "single",
      opts: [
        { v:"yes", l:"Yes", sub:"Deprioritize large pieces — I don't have room" },
        { v:"no",  l:"No",  sub:"I'll judge size case by case" },
      ],
    });
  }

  // Review step (always last)
  steps.push({ id: "_review", q: "Your picker profile is ready.", type: "review" });

  const cur = steps[step] || steps[0];
  const total = steps.length;
  const isLast = step === total - 1;
  const isFirst = step === 0;
  const val = sf[cur.id];

  const handleSingle = (v) => setDraft(function(d){ return {...d, [cur.id]: v}; });
  const handleMulti = (v) => setDraft(function(d){
    const arr = d.repair_skills || [];
    const next = arr.includes(v) ? arr.filter(function(x){ return x !== v; }) : [...arr, v];
    return {...d, repair_skills: next};
  });
  const canAdvance = cur.type === "review" || cur.type === "multi"
    ? true
    : !!sf[cur.id];

  const pill = {
    display:"inline-block", padding:"8px 16px", borderRadius:20,
    fontSize:13, cursor:"pointer", fontFamily:"'Georgia',serif",
    border:"2px solid transparent", marginBottom:8, marginRight:8,
    transition:"all 0.15s",
  };
  const pillActive = { background:"#5a3e1b", color:"#fdf8ef", borderColor:"#5a3e1b" };
  const pillInactive = { background:"#faf6ef", color:"#4a3728", borderColor:"#d4c4a0" };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(20,14,6,0.72)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, padding:20,
    }}>
      <div style={{
        background:"#fdfaf4", borderRadius:8, maxWidth:520, width:"100%",
        maxHeight:"90vh", overflowY:"auto",
        boxShadow:"0 8px 40px rgba(0,0,0,0.35)",
        fontFamily:"'Georgia',serif",
      }}>
        {/* Header */}
        <div style={{
          background:"#5a3e1b", borderRadius:"8px 8px 0 0",
          padding:"18px 24px", display:"flex", alignItems:"center", gap:12,
        }}>
          <span style={{fontSize:22}}>🎯</span>
          <div>
            <div style={{color:"#fdf8ef", fontWeight:700, fontSize:15}}>Picker Profile Setup</div>
            <div style={{color:"#c8a870", fontSize:12, marginTop:2}}>Personalizes your Field Scan buy scores</div>
          </div>
          <div style={{marginLeft:"auto", color:"#c8a870", fontSize:11, fontFamily:"sans-serif"}}>
            Step {step + 1} of {total}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{height:3, background:"#e8ddb8"}}>
          <div style={{height:"100%", width:((step+1)/total*100)+"%", background:"#8b6914", transition:"width 0.3s"}} />
        </div>

        {/* Body */}
        <div style={{padding:"28px 28px 20px"}}>

          {cur.type === "review" ? (
            // ── Review screen ─────────────────────────────────
            <div>
              <div style={{fontSize:18, fontWeight:700, color:"#3a2010", marginBottom:6}}>Your picker profile is ready.</div>
              <div style={{fontSize:13, color:"#7a6040", marginBottom:20, lineHeight:1.6}}>
                The Field Scan "Should I Buy?" engine will use these preferences when scoring pieces.
              </div>
              <div style={{background:"#faf6ef", border:"1px solid #d4c4a0", borderRadius:6, padding:"14px 16px"}}>
                {[
                  ["Restoration skill",   sf.restoration_skill],
                  ["Buying purpose",      sf.buying_purpose],
                  ["Deal target",         sf.deal_target],
                  ["Work tolerance",      sf.work_tolerance],
                  ["Storage space",       sf.storage_space],
                  ["Selling method",      sf.selling_method],
                  ["Sales priority",      sf.sales_priority],
                  ["Personal priority",   sf.personal_priority],
                  ["Repair skills",       sf.repair_skills && sf.repair_skills.length > 0 ? sf.repair_skills.join(", ") : null],
                  ["Large item penalty",  sf.large_item_penalty !== undefined ? (sf.large_item_penalty === "yes" ? "Yes" : "No") : null],
                ].filter(function(r){ return r[1]; }).map(function(r, i){
                  return (
                    <div key={i} style={{
                      display:"flex", justifyContent:"space-between",
                      padding:"6px 0", borderBottom:"1px solid #e8ddb8",
                      fontSize:12, fontFamily:"sans-serif",
                    }}>
                      <span style={{color:"#888"}}>{r[0]}</span>
                      <span style={{color:"#3a2010", fontWeight:600}}>{String(r[1]).replace(/_/g," ")}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // ── Question screen ────────────────────────────────
            <div>
              <div style={{fontSize:16, fontWeight:700, color:"#3a2010", marginBottom:20, lineHeight:1.5}}>
                {cur.q}
              </div>

              {cur.type === "single" && (
                <div>
                  {cur.opts.map(function(opt){
                    const active = sf[cur.id] === opt.v;
                    return (
                      <div
                        key={opt.v}
                        onClick={function(){ handleSingle(opt.v); }}
                        style={{
                          display:"flex", alignItems:"flex-start", gap:12,
                          padding:"12px 14px", borderRadius:6, cursor:"pointer",
                          border:"2px solid " + (active ? "#8b6914" : "#e0d5c0"),
                          background: active ? "#fdf6e8" : "#fdfaf4",
                          marginBottom:8, transition:"all 0.15s",
                        }}
                      >
                        <div style={{
                          width:18, height:18, borderRadius:"50%", flexShrink:0, marginTop:1,
                          border:"2px solid " + (active ? "#8b6914" : "#c8b888"),
                          background: active ? "#8b6914" : "transparent",
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                          {active && <div style={{width:6,height:6,borderRadius:"50%",background:"#fdf8ef"}} />}
                        </div>
                        <div>
                          <div style={{fontSize:13,fontWeight:active?700:600,color:"#3a2010"}}>{opt.l}</div>
                          {opt.sub && <div style={{fontSize:11,color:"#888",marginTop:2,fontFamily:"sans-serif"}}>{opt.sub}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {cur.type === "multi" && (
                <div>
                  <div style={{fontSize:12,color:"#888",fontFamily:"sans-serif",marginBottom:12}}>Select all that apply</div>
                  {cur.opts.map(function(opt){
                    const arr = sf.repair_skills || [];
                    const active = arr.includes(opt.v);
                    return (
                      <div
                        key={opt.v}
                        onClick={function(){ handleMulti(opt.v); }}
                        style={{
                          display:"flex", alignItems:"flex-start", gap:12,
                          padding:"12px 14px", borderRadius:6, cursor:"pointer",
                          border:"2px solid " + (active ? "#8b6914" : "#e0d5c0"),
                          background: active ? "#fdf6e8" : "#fdfaf4",
                          marginBottom:8, transition:"all 0.15s",
                        }}
                      >
                        <div style={{
                          width:16, height:16, borderRadius:3, flexShrink:0, marginTop:1,
                          border:"2px solid " + (active ? "#8b6914" : "#c8b888"),
                          background: active ? "#8b6914" : "transparent",
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                          {active && <span style={{color:"#fdf8ef",fontSize:10,lineHeight:1}}>✓</span>}
                        </div>
                        <div>
                          <div style={{fontSize:13,fontWeight:active?700:600,color:"#3a2010"}}>{opt.l}</div>
                          {opt.sub && <div style={{fontSize:11,color:"#888",marginTop:2,fontFamily:"sans-serif"}}>{opt.sub}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{
          padding:"16px 28px 24px", display:"flex", gap:10,
          borderTop:"1px solid #e8ddb8",
        }}>
          {!isFirst && (
            <button
              onClick={function(){ setStep(function(s){ return s - 1; }); }}
              style={{
                padding:"10px 20px", borderRadius:4, border:"1px solid #c8b888",
                background:"#fdfaf4", color:"#5a3e1b", fontSize:13, cursor:"pointer",
                fontFamily:"'Georgia',serif",
              }}
            >← Back</button>
          )}
          {onCancel && isFirst && (
            <button
              onClick={onCancel}
              style={{
                padding:"10px 20px", borderRadius:4, border:"1px solid #c8b888",
                background:"#fdfaf4", color:"#888", fontSize:13, cursor:"pointer",
                fontFamily:"sans-serif",
              }}
            >Skip for now</button>
          )}
          <div style={{flex:1}} />
          {!isLast ? (
            <button
              onClick={function(){ if (canAdvance) setStep(function(s){ return s + 1; }); }}
              style={{
                padding:"10px 24px", borderRadius:4,
                border:"none", background: canAdvance ? "#5a3e1b" : "#c8b888",
                color:"#fdf8ef", fontSize:13, cursor: canAdvance ? "pointer" : "not-allowed",
                fontFamily:"'Georgia',serif", fontWeight:600,
              }}
            >Next →</button>
          ) : (
            <button
              onClick={function(){ onSave(sf); }}
              style={{
                padding:"10px 24px", borderRadius:4, border:"none",
                background:"#5a3e1b", color:"#fdf8ef", fontSize:13,
                cursor:"pointer", fontFamily:"'Georgia',serif", fontWeight:600,
              }}
            >Save Profile ✓</button>
          )}
        </div>
      </div>
    </div>
  );
}


// ============================================================
// HISTORICAL CLUE LIBRARY
// ============================================================
// Maps observed clue keys to historical indicator text,
// typical date ranges, and evidence categories.
// Consumed by Tier 2 rendering in BOTH Field Scan and Full Analysis.
// Field Scan: top 2–3 highest-priority entries only.
// Full Analysis: full set with deeper context.
// ============================================================
const HISTORICAL_CLUE_LIBRARY = {

  // ── Structural mechanisms ───────────────────────────────────
  drop_leaf_hinged: {
    indicator_text: "Hinged drop leaves are the defining feature of the drop-leaf table family, produced continuously in American furniture-making from approximately 1720 through the early twentieth century.",
    typical_date_range: "1720–1930",
    evidence_category: "construction",
    priority: 1,
  },
  gateleg_support: {
    indicator_text: "A pivoting gate-leg support was the primary mechanism for carrying drop leaves before the Pembroke bracket became common. Widely made circa 1680–1800 and revived in later Colonial Revival production circa 1880–1930.",
    typical_date_range: "1680–1800, revival 1880–1930",
    evidence_category: "construction",
    priority: 1,
  },
  rule_joint: {
    indicator_text: "The rule joint — a rounded interlocking profile at the leaf edge — required skilled handwork and is characteristic of furniture made before factory methods became dominant, generally pre-1870.",
    typical_date_range: "pre-1870",
    evidence_category: "joinery",
    priority: 2,
  },
  swing_leg: {
    indicator_text: "A swing-leg leaf support is associated with the Pembroke-style drop-leaf table, widely made from the Federal period through Victorian production, approximately 1780–1900.",
    typical_date_range: "1780–1900",
    evidence_category: "construction",
    priority: 2,
  },
  lift_lid: {
    indicator_text: "A hinged or removable top indicates a storage chest form. Blanket chests and storage trunks with this construction were produced throughout the eighteenth and nineteenth centuries.",
    typical_date_range: "1700–1900",
    evidence_category: "construction",
    priority: 1,
  },
  multiple_drawer_case: {
    indicator_text: "A stacked drawer case is one of the most consistently produced forms in American furniture, made continuously from approximately 1700 onward. Dating relies on joinery and fastener evidence.",
    typical_date_range: "1700–present",
    evidence_category: "construction",
    priority: 2,
  },
  slant_front: {
    indicator_text: "A slant-front writing surface was the standard desk form in the American colonial and Federal periods, remaining in active production through the mid-nineteenth century.",
    typical_date_range: "1700–1860",
    evidence_category: "construction",
    priority: 1,
  },
  cylinder_roll: {
    indicator_text: "A cylinder or tambour roll-top was closely associated with late Victorian office furniture. The form was produced primarily from approximately 1870 to 1920.",
    typical_date_range: "1870–1920",
    evidence_category: "construction",
    priority: 1,
  },
  pedestal_base: {
    indicator_text: "A single central pedestal supporting a top was used across several centuries for breakfast tables, tilt-top tables, and parlor tables. Dating depends on leg form and fasteners.",
    typical_date_range: "1780–1920",
    evidence_category: "construction",
    priority: 2,
  },

  // ── Hardware ────────────────────────────────────────────────
  porcelain_caster: {
    indicator_text: "Porcelain casters of this type were widely used on American furniture between approximately 1830 and 1900, and were gradually replaced by rubber-wheeled casters through the early twentieth century.",
    typical_date_range: "1830–1900",
    evidence_category: "hardware",
    priority: 1,
  },
  victorian_strap_hinge: {
    indicator_text: "Long decorative strap hinges in this style were widely associated with Victorian-era case furniture and chests, commonly used from approximately 1865 to 1895.",
    typical_date_range: "1865–1895",
    evidence_category: "hardware",
    priority: 2,
  },
  batwing_brass_pull: {
    indicator_text: "Bat-wing brass bail pulls with rosette backplates are strongly associated with the William and Mary and early Queen Anne periods, typically made from approximately 1720 to 1790.",
    typical_date_range: "1720–1790",
    evidence_category: "hardware",
    priority: 1,
  },
  eastlake_pull: {
    indicator_text: "Geometric incised brass hardware in the Eastlake style was fashionable during the Aesthetic Movement period, primarily used from approximately 1870 to 1890.",
    typical_date_range: "1870–1890",
    evidence_category: "hardware",
    priority: 2,
  },
  modern_concealed_hinge: {
    indicator_text: "Cup-style concealed hinges are a HARD NEGATIVE for antique claims — this hardware type was not produced before approximately 1950 and is a strong indicator of modern manufacture or replacement.",
    typical_date_range: "post-1950",
    evidence_category: "hardware",
    priority: 1,
    hard_negative: true,
  },

  // ── Fasteners ───────────────────────────────────────────────
  phillips_screw: {
    indicator_text: "Phillips-head screws were not in common use before approximately 1934. Their presence is a HARD NEGATIVE for any pre-1930 manufacture claim and strongly suggests either post-1935 production or later hardware replacement.",
    typical_date_range: "post-1934",
    evidence_category: "fasteners",
    priority: 1,
    hard_negative: true,
  },
  slotted_machine_screw: {
    indicator_text: "Slotted machine-cut screws with uniform threading were widely used from approximately 1840 onward and remained common until the widespread adoption of Phillips screws after the 1930s.",
    typical_date_range: "1840–1935",
    evidence_category: "fasteners",
    priority: 2,
  },
  slotted_handmade_screw: {
    indicator_text: "Hand-cut slotted screws with off-center slots and irregular threading are characteristic of early American manufacture, typically pre-1840, and are a strong indicator of period construction.",
    typical_date_range: "pre-1840",
    evidence_category: "fasteners",
    priority: 1,
  },
  cut_nail: {
    indicator_text: "Rectangular cut nails with a tapered cross-section were the dominant fastener in American furniture from approximately 1790 to 1890, when wire nails became widely available.",
    typical_date_range: "1790–1890",
    evidence_category: "fasteners",
    priority: 1,
  },
  wire_nail: {
    indicator_text: "Round wire nails with a uniform shank became widely available in the United States after approximately 1880 and quickly displaced cut nails in furniture production.",
    typical_date_range: "post-1880",
    evidence_category: "fasteners",
    priority: 2,
  },
  hand_forged_nail: {
    indicator_text: "Hand-forged nails with an irregular hammered head and four-sided taper are characteristic of pre-industrial construction and are a strong indicator of furniture made before approximately 1800.",
    typical_date_range: "pre-1800",
    evidence_category: "fasteners",
    priority: 1,
  },
  staple_fastener: {
    indicator_text: "U-shaped wire staples used as structural fasteners are a HARD NEGATIVE for antique claims — this fastener type was not used in furniture construction before approximately 1945.",
    typical_date_range: "post-1945",
    evidence_category: "fasteners",
    priority: 1,
    hard_negative: true,
  },

  // ── Joinery ─────────────────────────────────────────────────
  hand_cut_dovetails: {
    indicator_text: "Hand-cut dovetails with irregular spacing and slightly uneven angles are characteristic of pre-industrial craftsmanship, generally indicating furniture made before approximately 1860.",
    typical_date_range: "pre-1860",
    evidence_category: "joinery",
    priority: 1,
  },
  machine_dovetails: {
    indicator_text: "Perfectly uniform machine-cut dovetails became common after approximately 1860 and indicate factory or semi-factory production rather than individual hand craftsmanship.",
    typical_date_range: "post-1860",
    evidence_category: "joinery",
    priority: 2,
  },
  mortise_and_tenon: {
    indicator_text: "Mortise-and-tenon joinery was the standard structural method for American furniture from the earliest colonial period through the early twentieth century, offering limited dating value on its own.",
    typical_date_range: "1620–1920",
    evidence_category: "joinery",
    priority: 3,
  },
  dowel_joinery: {
    indicator_text: "Round wooden dowels as the primary structural joint became common after approximately 1900 and are associated with factory production methods rather than traditional hand craftsmanship.",
    typical_date_range: "post-1900",
    evidence_category: "joinery",
    priority: 2,
  },
  plywood_drawer_bottom: {
    indicator_text: "Plywood drawer bottoms are a HARD NEGATIVE for antique claims — plywood structural components were not used in furniture before approximately 1920, strongly indicating later production.",
    typical_date_range: "post-1920",
    evidence_category: "joinery",
    priority: 1,
    hard_negative: true,
  },

  // ── Toolmarks ───────────────────────────────────────────────
  circular_saw_arcs: {
    indicator_text: "Curved circular saw arc marks on secondary surfaces indicate post-1830 production. Water-powered circular saws became widespread in American mills by approximately 1840.",
    typical_date_range: "post-1830",
    evidence_category: "toolmarks",
    priority: 2,
  },
  pit_saw_marks: {
    indicator_text: "Irregular diagonal pit-saw marks on secondary surfaces indicate pre-industrial production, characteristic of furniture made before approximately 1830.",
    typical_date_range: "pre-1830",
    evidence_category: "toolmarks",
    priority: 1,
  },
  band_saw_lines: {
    indicator_text: "Fine straight parallel band-saw marks indicate post-1870 production. Band saws became widely available in American furniture factories from approximately 1870 onward.",
    typical_date_range: "post-1870",
    evidence_category: "toolmarks",
    priority: 2,
  },
  hand_plane_chatter: {
    indicator_text: "Subtle hand-plane chatter marks on secondary surfaces indicate hand preparation rather than machine planing, a characteristic of pre-industrial or small-shop production.",
    typical_date_range: "pre-1880",
    evidence_category: "toolmarks",
    priority: 3,
  },

  // ── Materials ───────────────────────────────────────────────
  thick_veneer: {
    indicator_text: "Thicker veneer construction is associated with earlier veneer-cutting techniques prior to the adoption of modern rotary veneer methods, generally indicating pre-1910 production.",
    typical_date_range: "pre-1910",
    evidence_category: "materials",
    priority: 2,
  },
  plywood_structural: {
    indicator_text: "Structural plywood panels are a HARD NEGATIVE for antique claims — plywood structural components were not available before approximately 1905 and were not common in furniture until after 1920.",
    typical_date_range: "post-1920",
    evidence_category: "materials",
    priority: 1,
    hard_negative: true,
  },
  poplar_secondary: {
    indicator_text: "Poplar as a secondary wood is particularly characteristic of nineteenth-century American furniture production, widely used from approximately 1820 through 1920.",
    typical_date_range: "1820–1920",
    evidence_category: "materials",
    priority: 2,
  },

  // ── Finish ──────────────────────────────────────────────────
  shellac_crazing: {
    indicator_text: "Shellac finish with characteristic age crazing — a fine network of cracks — indicates an original surface dating from the shellac era, approximately 1800 to 1920.",
    typical_date_range: "1800–1920",
    evidence_category: "finish",
    priority: 2,
  },
  polyurethane: {
    indicator_text: "A thick plastic-like film finish indicates polyurethane, which was not available before approximately 1960. Its presence suggests either post-1960 manufacture or a later refinish over original surfaces.",
    typical_date_range: "post-1960",
    evidence_category: "finish",
    priority: 1,
    hard_negative: false,
  },
};

// ── Utility: look up clue in library ────────────────────────────
// Returns null if not found.
function getClueIndicator(clueKey) {
  const key = (clueKey || "").replace(/-/g,"_").toLowerCase();
  return HISTORICAL_CLUE_LIBRARY[key] || null;
}

// ── Utility: generate indicators from an array of clue keys ─────
// Field Scan: topN = 3 (highest-priority only)
// Full Analysis: topN = null (all matches)
function generateIndicators(clueKeys, topN) {
  const matched = [];
  const seen = new Set();
  for (const key of (clueKeys || [])) {
    const entry = getClueIndicator(key);
    if (entry && !seen.has(key)) {
      seen.add(key);
      matched.push({ key: key, ...entry });
    }
  }
  // Sort: hard negatives first, then by priority ascending (1 = highest)
  matched.sort(function(a, b) {
    if (a.hard_negative && !b.hard_negative) return -1;
    if (!a.hard_negative && b.hard_negative) return 1;
    return (a.priority || 99) - (b.priority || 99);
  });
  return topN ? matched.slice(0, topN) : matched;
}


// ============================================================
// CONFIDENCE WEIGHTING SYSTEM
// ============================================================
// Maps clue keys to base_weight, replacement_risk, and reason.
// Base weights mirror WM tier philosophy but are per-clue.
// adjusted_weight = base_weight × visibility × multi-photo × (1 - replacement_risk × !supported)
// ============================================================
const CLUE_WEIGHT_TABLE = {
  // ── Structural / mechanical (0.80–0.95) ────────────────────
  drop_leaf_hinged: { base: 0.90, typical_weight: 0.90, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "defining structural form signature — rarely altered", explanation: "defining structural form signature — rarely altered" },
  gateleg_support: { base: 0.92, typical_weight: 0.92, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "irreplaceable structural mechanism — high form confidence", explanation: "irreplaceable structural mechanism — high form confidence" },
  rule_joint:            { base: 0.85, replacement_risk: 0.08, category: "joinery",      reason: "skilled hand joinery — strong period indicator" },
  swing_leg: { base: 0.82, typical_weight: 0.82, replacement_risk: 0.08, replacement_risk_label: "very_low", priority_level: "high", category: "construction", reason: "structural leaf support — reliable form indicator", explanation: "structural leaf support — reliable form indicator" },
  butterfly_support: { base: 0.85, typical_weight: 0.85, replacement_risk: 0.08, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "distinctive structural mechanism", explanation: "distinctive structural mechanism" },
  lift_lid: { base: 0.88, typical_weight: 0.88, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "defining chest form feature", explanation: "defining chest form feature" },
  multiple_drawer_case: { base: 0.80, typical_weight: 0.80, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "high", category: "construction", reason: "defining case form", explanation: "defining case form" },
  slant_front: { base: 0.88, typical_weight: 0.88, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "defining desk form signature", explanation: "defining desk form signature" },
  cylinder_roll: { base: 0.90, typical_weight: 0.90, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "irreplaceable roll-top mechanism", explanation: "irreplaceable roll-top mechanism" },
  pedestal_base: { base: 0.82, typical_weight: 0.82, replacement_risk: 0.10, replacement_risk_label: "low", priority_level: "high", category: "construction", reason: "structural base form", explanation: "structural base form" },
  tilt_top: { base: 0.88, typical_weight: 0.88, replacement_risk: 0.08, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "distinctive tilt mechanism", explanation: "distinctive tilt mechanism" },
  tripod_base: { base: 0.85, typical_weight: 0.85, replacement_risk: 0.08, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "characteristic pedestal form", explanation: "characteristic pedestal form" },
  extension_mechanism: { base: 0.85, typical_weight: 0.85, replacement_risk: 0.10, replacement_risk_label: "low", priority_level: "very_high", category: "construction", reason: "table extension mechanism", explanation: "table extension mechanism" },
  drawer_present: { base: 0.75, typical_weight: 0.75, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "high", category: "construction", reason: "presence of drawers indicates case form", explanation: "presence of drawers indicates case form" },

  // ── Joinery / construction (0.70–0.90) ─────────────────────
  hand_cut_dovetails: { base: 0.88, typical_weight: 0.88, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "joinery", reason: "hand craftsmanship — strong pre-industrial indicator", explanation: "hand craftsmanship — strong pre-industrial indicator" },
  machine_dovetails: { base: 0.82, typical_weight: 0.82, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "high", category: "joinery", reason: "factory production indicator — reliable dating clue", explanation: "factory production indicator — reliable dating clue" },
  mortise_and_tenon: { base: 0.72, typical_weight: 0.72, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "high", category: "joinery", reason: "traditional joinery — present across many centuries", explanation: "traditional joinery — present across many centuries" },
  dowel_joinery: { base: 0.70, typical_weight: 0.70, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "high", category: "joinery", reason: "post-1900 factory method indicator", explanation: "post-1900 factory method indicator" },
  frame_and_panel: { base: 0.75, typical_weight: 0.75, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "high", category: "joinery", reason: "panel construction method — spans many periods", explanation: "panel construction method — spans many periods" },
  solid_board_drawer_bottom: { base: 0.80, typical_weight: 0.80, replacement_risk: 0.08, replacement_risk_label: "very_low", priority_level: "high", category: "joinery", reason: "pre-machine bottom construction indicator", explanation: "pre-machine bottom construction indicator" },

  // ── Toolmarks (0.70–0.85) ───────────────────────────────────
  pit_saw_marks: { base: 0.85, typical_weight: 0.85, replacement_risk: 0.02, replacement_risk_label: "very_low", priority_level: "very_high", category: "toolmarks", reason: "pre-industrial milling — strong pre-1830 indicator", explanation: "pre-industrial milling — strong pre-1830 indicator" },
  circular_saw_arcs: { base: 0.78, typical_weight: 0.78, replacement_risk: 0.02, replacement_risk_label: "very_low", priority_level: "high", category: "toolmarks", reason: "post-1830 mill mark — reliable dating clue", explanation: "post-1830 mill mark — reliable dating clue" },
  band_saw_lines: { base: 0.75, typical_weight: 0.75, replacement_risk: 0.02, replacement_risk_label: "very_low", priority_level: "high", category: "toolmarks", reason: "post-1870 factory sawing", explanation: "post-1870 factory sawing" },
  hand_plane_chatter: { base: 0.70, typical_weight: 0.70, replacement_risk: 0.02, replacement_risk_label: "very_low", priority_level: "high", category: "toolmarks", reason: "hand preparation — pre-industrial indicator", explanation: "hand preparation — pre-industrial indicator" },

  // ── Materials (0.50–0.80) ───────────────────────────────────
  poplar_secondary: { base: 0.68, typical_weight: 0.68, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "moderate", category: "materials", reason: "19th-century secondary wood — useful regional indicator", explanation: "19th-century secondary wood — useful regional indicator" },
  thick_veneer: { base: 0.62, typical_weight: 0.62, replacement_risk: 0.10, replacement_risk_label: "low", priority_level: "moderate", category: "materials", reason: "early veneer technique — pre-1910 indicator", explanation: "early veneer technique — pre-1910 indicator" },
  plywood_structural: { base: 0.90, typical_weight: 0.90, replacement_risk: 0.02, replacement_risk_label: "very_low", priority_level: "very_high", category: "materials", reason: "HARD NEGATIVE — post-1920 structural material", explanation: "HARD NEGATIVE — post-1920 structural material" },
  plywood_drawer_bottom: { base: 0.88, typical_weight: 0.88, replacement_risk: 0.02, replacement_risk_label: "very_low", priority_level: "very_high", category: "materials", reason: "HARD NEGATIVE — post-1920 drawer bottom material", explanation: "HARD NEGATIVE — post-1920 drawer bottom material" },

  // ── Hardware (0.35–0.75) ────────────────────────────────────
  porcelain_caster: { base: 0.68, typical_weight: 0.68, replacement_risk: 0.35, replacement_risk_label: "high", priority_level: "moderate", category: "hardware", reason: "period hardware — often survives but sometimes replaced", explanation: "period hardware — often survives but sometimes replaced" },
  victorian_strap_hinge: { base: 0.62, typical_weight: 0.62, replacement_risk: 0.40, replacement_risk_label: "high", priority_level: "moderate", category: "hardware", reason: "decorative period hardware — replacement risk moderate", explanation: "decorative period hardware — replacement risk moderate" },
  batwing_brass_pull: { base: 0.65, typical_weight: 0.65, replacement_risk: 0.50, replacement_risk_label: "high", priority_level: "moderate", category: "hardware", reason: "period pull — commonly replaced; corroborated by structure", explanation: "period pull — commonly replaced; corroborated by structure" },
  eastlake_pull: { base: 0.60, typical_weight: 0.60, replacement_risk: 0.45, replacement_risk_label: "high", priority_level: "moderate", category: "hardware", reason: "Eastlake period hardware — often replaced", explanation: "Eastlake period hardware — often replaced" },
  modern_concealed_hinge:{ base: 0.92, replacement_risk: 0.10, category: "hardware", reason: "HARD NEGATIVE — post-1950 hinge eliminates antique claim" },

  // ── Fasteners (0.60–0.90) ───────────────────────────────────
  hand_forged_nail: { base: 0.88, typical_weight: 0.88, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "fasteners", reason: "pre-1800 production indicator — rarely added later", explanation: "pre-1800 production indicator — rarely added later" },
  cut_nail: { base: 0.82, typical_weight: 0.82, replacement_risk: 0.08, replacement_risk_label: "very_low", priority_level: "high", category: "fasteners", reason: "1790–1890 fastener — strong dating clue", explanation: "1790–1890 fastener — strong dating clue" },
  wire_nail: { base: 0.72, typical_weight: 0.72, replacement_risk: 0.15, replacement_risk_label: "low", priority_level: "high", category: "fasteners", reason: "post-1880 fastener — occasionally used in repairs", explanation: "post-1880 fastener — occasionally used in repairs" },
  slotted_handmade_screw:{ base: 0.82, replacement_risk: 0.10, category: "fasteners", reason: "pre-1840 screw — distinctive hand-cut characteristics" },
  slotted_machine_screw: { base: 0.62, typical_weight: 0.62, replacement_risk: 0.45, replacement_risk_label: "high", priority_level: "moderate", category: "fasteners", reason: "1840–1935 screw — frequently replaced; moderate weight", explanation: "1840–1935 screw — frequently replaced; moderate weight" },
  phillips_screw: { base: 0.90, typical_weight: 0.90, replacement_risk: 0.10, replacement_risk_label: "low", priority_level: "very_high", category: "fasteners", reason: "HARD NEGATIVE — post-1934; eliminates pre-1930 claim", explanation: "HARD NEGATIVE — post-1934; eliminates pre-1930 claim" },
  staple_fastener: { base: 0.90, typical_weight: 0.90, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "fasteners", reason: "HARD NEGATIVE — post-1945 industrial fastener", explanation: "HARD NEGATIVE — post-1945 industrial fastener" },

  // ── Finish / surface (0.25–0.60) ───────────────────────────
  shellac_crazing: { base: 0.55, typical_weight: 0.55, replacement_risk: 0.20, replacement_risk_label: "moderate", priority_level: "moderate", category: "finish", reason: "original period finish — useful but refinishing is common", explanation: "original period finish — useful but refinishing is common" },
  shellac_intact: { base: 0.50, typical_weight: 0.50, replacement_risk: 0.25, replacement_risk_label: "moderate", priority_level: "moderate", category: "finish", reason: "intact shellac — helpful context clue", explanation: "intact shellac — helpful context clue" },
  oil_finish_patina: { base: 0.38, typical_weight: 0.38, replacement_risk: 0.30, replacement_risk_label: "moderate", priority_level: "low", category: "finish", reason: "low specificity — oil finishes span all eras", explanation: "low specificity — oil finishes span all eras" },
  polyurethane: { base: 0.65, typical_weight: 0.65, replacement_risk: 0.15, replacement_risk_label: "low", priority_level: "moderate", category: "finish", reason: "post-1960 finish — indicates modern production or refinish", explanation: "post-1960 finish — indicates modern production or refinish" },
  refinished_surface: { base: 0.45, typical_weight: 0.45, replacement_risk: 0.60, replacement_risk_label: "very_high", priority_level: "low", category: "alteration", reason: "refinishing removes dating evidence from surface", explanation: "refinishing removes dating evidence from surface" },
};

// ── CLUE_PRIORITY_TABLE — public alias for CLUE_WEIGHT_TABLE ──────
// Satisfies the document's requested name. Both names reference the same object.
const CLUE_PRIORITY_TABLE = CLUE_WEIGHT_TABLE;

// ── getClueByPriority — return all entries matching a priority level ──
function getClueByPriority(priorityLevel) {
  return Object.keys(CLUE_PRIORITY_TABLE)
    .filter(function(k) { return CLUE_PRIORITY_TABLE[k].priority_level === priorityLevel; })
    .map(function(k) { return { clue: k, ...CLUE_PRIORITY_TABLE[k] }; });
}

// ── filterByPriority — return weighted clues at or above a threshold ──
// Used by Field Scan (threshold="high") and Full Analysis (threshold="contextual")
var PRIORITY_ORDER = ["very_high","high","moderate","low","contextual"];
function filterByPriority(weightedClues, minLevel) {
  var minIdx = PRIORITY_ORDER.indexOf(minLevel);
  if (minIdx === -1) minIdx = 4;
  return weightedClues.filter(function(c) {
    var entry = CLUE_PRIORITY_TABLE[c.clue];
    if (!entry) return minIdx >= 3; // unknown clues pass at low+ threshold
    var entryIdx = PRIORITY_ORDER.indexOf(entry.priority_level);
    return entryIdx !== -1 && entryIdx <= minIdx;
  });
}

// ── getPriorityExplanation — generate a brief priority explanation string ──
function getPriorityExplanation(clueKey) {
  var entry = CLUE_PRIORITY_TABLE[clueKey];
  if (!entry) return null;
  var pl = entry.priority_level.replace(/_/g," ");
  var rl = entry.replacement_risk_label ? entry.replacement_risk_label.replace(/_/g," ") : "unknown";
  return entry.explanation + " Priority: " + pl + ". Replacement risk: " + rl + ".";
}

// ── computeClueWeights ──────────────────────────────────────────
// Takes observations_by_type (from Phase 0 or evidence cache).
// Returns an array of weighted clue objects with adjusted_weight and reason.
// Also detects multi-photo confirmation and hard-negative presence.
function computeClueWeights(observationsByType) {
  if (!observationsByType || typeof observationsByType !== "object") return [];

  // Flatten all observations into one array with their type
  const allObs = [];
  Object.keys(observationsByType).forEach(function(typeName) {
    var arr = observationsByType[typeName] || [];
    arr.forEach(function(obs) {
      allObs.push({ ...obs, _category: typeName });
    });
  });

  // Count how many photos each clue appears in (by source_image)
  const cluePhotoCounts = {};
  allObs.forEach(function(obs) {
    var key = obs.clue || obs.reference_id || "";
    if (!cluePhotoCounts[key]) cluePhotoCounts[key] = new Set();
    if (obs.source_image) cluePhotoCounts[key].add(obs.source_image);
    if (obs.photo_index)  cluePhotoCounts[key].add("idx_" + obs.photo_index);
  });

  // Detect whether any hard-negative clues are present
  var hasHardNeg = allObs.some(function(obs) {
    var entry = CLUE_WEIGHT_TABLE[obs.clue || obs.reference_id || ""];
    return entry && (obs.clue === "phillips_screw" || obs.clue === "staple_fastener" ||
      obs.clue === "plywood_structural" || obs.clue === "plywood_drawer_bottom" ||
      obs.clue === "modern_concealed_hinge");
  });

  // Build weighted clue array (one entry per unique clue key)
  var seen = new Set();
  var weighted = [];

  allObs.forEach(function(obs) {
    var clueKey = obs.clue || obs.reference_id || "";
    if (!clueKey || seen.has(clueKey)) return;
    seen.add(clueKey);

    var entry = CLUE_WEIGHT_TABLE[clueKey];
    var visConf = typeof obs.visual_confidence === "number" ? obs.visual_confidence / 100 : 0.5;
    var effConf = typeof obs.effective_confidence === "number" ? obs.effective_confidence : visConf;

    // Base weight from table or fall back to WM tier category
    var base = entry ? entry.base : (
      obs._category === "mechanical_structures" ? 0.82 :
      obs._category === "joinery"    ? 0.75 :
      obs._category === "toolmarks"  ? 0.72 :
      obs._category === "materials"  ? 0.58 :
      obs._category === "hardware"   ? 0.55 :
      obs._category === "fasteners"  ? 0.68 :
      obs._category === "finish"     ? 0.40 : 0.50
    );
    var replacementRisk = entry ? entry.replacement_risk : 0.20;
    var category = entry ? entry.category : (obs._category || "other");
    var baseReason = entry ? entry.reason : "weight estimated from category defaults";

    // ── Adjustment factors ───────────────────────────────────
    var adjustment = 0;
    var reasons = [];

    // A0. Structural source type — underside vs back_panel weight emphasis
    var srcType = obs.source_image || "";
    if (srcType === "underside" && (category === "joinery" || category === "toolmarks")) {
      adjustment += 0.06; reasons.push("underside view — strong for " + category);
    }
    if (srcType === "back_panel" && (category === "fasteners" || category === "materials")) {
      adjustment += 0.06; reasons.push("back panel — strong for fasteners/materials");
    }
    if (srcType === "back_panel" && category === "joinery") {
      adjustment -= 0.04; // back panel weaker for joinery than underside
    }

    // A. Visibility quality
    if (effConf >= 0.80) { adjustment += 0.08; reasons.push("clearly visible"); }
    else if (effConf >= 0.60) { adjustment += 0.03; }
    else if (effConf < 0.40) { adjustment -= 0.10; reasons.push("faint or partial visibility"); }

    // B. Multi-photo confirmation
    var photoCount = cluePhotoCounts[clueKey] ? cluePhotoCounts[clueKey].size : 1;
    if (photoCount >= 3) { adjustment += 0.10; reasons.push("confirmed in " + photoCount + " photos"); }
    else if (photoCount === 2) { adjustment += 0.05; reasons.push("confirmed in 2 photos"); }

    // C. Replacement / alteration risk
    if (replacementRisk > 0.35) {
      adjustment -= (replacementRisk * 0.30);
      reasons.push("replacement risk: " + Math.round(replacementRisk * 100) + "%");
    }

    // D. Hard-negative conflict penalty — non-hard-neg hardware loses weight when hard-neg present
    if (hasHardNeg && category === "hardware" && !obs.hard_negative) {
      adjustment -= 0.10;
      reasons.push("weight reduced: hard negative present in same scan");
    }

    // E. Low-confidence flag
    if (obs.low_confidence_flag) { adjustment -= 0.05; reasons.push("flagged as low confidence"); }

    var adjusted = Math.min(0.98, Math.max(0.05, base + adjustment));

    weighted.push({
      clue:              clueKey,
      display_label:     clueKey.replace(/_/g, " "),
      category:          category,
      base_weight:       parseFloat(base.toFixed(3)),
      adjusted_weight:   parseFloat(adjusted.toFixed(3)),
      confidence_reason: baseReason + (reasons.length ? " (" + reasons.join("; ") + ")" : ""),
      photo_sources:     obs.source_image ? [obs.source_image] : [],
      photo_index:       obs.photo_index || null,
      hard_negative:     !!(obs.hard_negative),
      effective_confidence: effConf,
    });
  });

  // Sort: hard negatives first, then by adjusted_weight desc
  weighted.sort(function(a, b) {
    if (a.hard_negative && !b.hard_negative) return -1;
    if (!a.hard_negative && b.hard_negative) return 1;
    return b.adjusted_weight - a.adjusted_weight;
  });

  return weighted;
}

// ── deriveConfidenceDrivers ─────────────────────────────────────
// From a weighted clue array, produce the two driver lists for the panel.
// topN controls how many items to show (3 for FS, 5 for FA).
function deriveConfidenceDrivers(weightedClues, topN) {
  topN = topN || 5;
  var increased = [];
  var limited   = [];

  // Increased: top N non-hard-neg clues with adjusted_weight >= 0.65
  weightedClues
    .filter(function(c) { return !c.hard_negative && c.adjusted_weight >= 0.65; })
    .slice(0, topN)
    .forEach(function(c) {
      increased.push(c.display_label + (c.photo_index ? " (Photo " + c.photo_index + ")" : ""));
    });

  // Limited: hard negatives + low-weight clues + high replacement risk
  weightedClues
    .filter(function(c) { return c.hard_negative; })
    .forEach(function(c) {
      limited.push(c.display_label + " — hard negative");
    });
  weightedClues
    .filter(function(c) { return !c.hard_negative && c.adjusted_weight < 0.55 && c.adjusted_weight > 0; })
    .slice(0, 3)
    .forEach(function(c) {
      limited.push(c.display_label + " — " + (c.confidence_reason.split("(")[0].trim()));
    });

  return { increased: increased.slice(0, topN), limited: limited.slice(0, topN) };
}

// ── deriveCategoryScores ────────────────────────────────────────
// Aggregate adjusted weights by category for the Evidence Weight panel.
function deriveCategoryScores(weightedClues) {
  var cats = {};
  weightedClues.forEach(function(c) {
    if (!cats[c.category]) cats[c.category] = { sum: 0, count: 0 };
    cats[c.category].sum   += c.adjusted_weight;
    cats[c.category].count += 1;
  });
  // Normalise to 0–100 percentage
  var entries = Object.keys(cats).map(function(k) {
    return { category: k, avg: cats[k].sum / cats[k].count, count: cats[k].count };
  });
  var maxAvg = Math.max.apply(null, entries.map(function(e){ return e.avg; }).concat([0.01]));
  return entries.map(function(e) {
    return { ...e, score: Math.round((e.avg / maxAvg) * 100) };
  }).sort(function(a, b) { return b.score - a.score; });
}


// ============================================================
// CONFLICT RESOLUTION LAYER
// ============================================================
// Authority hierarchy mirrors document specification:
//   structural (10) > joinery (9) > toolmarks (8) > fasteners (8)
//   > materials (6) > hardware (6) > finish (4) > style (3)
//
// resolveConflicts(weightedClues) → { restoration_interpretation,
//   conflict_notes, confidence_adjustment, resolved_clues }
// ============================================================

const AUTHORITY_RANK = {
  construction: 10,
  joinery:      9,
  toolmarks:    8,
  fasteners:    8,
  materials:    6,
  hardware:     6,
  finish:       4,
  alteration:   4,
  style:        3,
  other:        2,
};

// Clue pairs that frequently conflict and their standard interpretation
const KNOWN_CONFLICT_PATTERNS = [
  {
    id: "hardware_replacement",
    high_auth_categories: ["construction", "joinery", "toolmarks"],
    low_auth_categories:  ["hardware", "fasteners"],
    low_auth_clues:       ["slotted_machine_screw","phillips_screw","wire_nail","staple_fastener"],
    interpretation:       "Later hardware or fasteners may reflect repair or restoration rather than original manufacture.",
    confidence_adjustment: -0.05,
    restoration_type:     "replacement hardware",
  },
  {
    id: "refinish_over_original",
    high_auth_categories: ["construction", "joinery"],
    low_auth_categories:  ["finish"],
    low_auth_clues:       ["polyurethane","refinished_surface"],
    interpretation:       "Later finish treatment may obscure or replace original surface evidence.",
    confidence_adjustment: -0.03,
    restoration_type:     "refinishing",
  },
  {
    id: "revival_style_vs_construction",
    high_auth_categories: ["joinery", "toolmarks", "fasteners"],
    low_auth_categories:  ["style"],
    interpretation:       "Style may reflect a later revival period rather than original manufacture. Construction evidence takes authority.",
    confidence_adjustment: -0.05,
    restoration_type:     null,
  },
  {
    id: "modern_fastener_in_antique_structure",
    high_auth_categories: ["construction", "joinery"],
    low_auth_clues:       ["phillips_screw","staple_fastener","plywood_structural"],
    interpretation:       "Modern fasteners found alongside antique structural evidence — likely later repair.",
    confidence_adjustment: -0.04,
    restoration_type:     "structural repair",
  },
];

function resolveConflicts(weightedClues) {
  if (!weightedClues || !weightedClues.length) {
    return {
      restoration_interpretation: { likely_restoration_present: false, possible_restoration_types: [], confidence_reason: "" },
      conflict_notes: [],
      confidence_adjustment: 0,
      resolved_clues: weightedClues || [],
    };
  }

  var notes = [];
  var restorationTypes = new Set();
  var totalAdjustment = 0;
  var resolvedClues = weightedClues.map(function(c) { return { ...c }; });

  // Build category maps
  var byCategory = {};
  resolvedClues.forEach(function(c) {
    if (!byCategory[c.category]) byCategory[c.category] = [];
    byCategory[c.category].push(c);
  });

  // Find highest-authority category present
  var presentCats = Object.keys(byCategory);
  var maxAuthority = Math.max.apply(null, presentCats.map(function(k) { return AUTHORITY_RANK[k] || 0; }));
  var highAuthClues = resolvedClues.filter(function(c) { return (AUTHORITY_RANK[c.category] || 0) >= 8; });
  var lowAuthHardware = resolvedClues.filter(function(c) { return c.category === "hardware" || c.category === "fasteners"; });

  // ── Apply known conflict patterns ───────────────────────────
  KNOWN_CONFLICT_PATTERNS.forEach(function(pattern) {
    var highPresent = highAuthClues.length > 0 &&
      pattern.high_auth_categories.some(function(cat) { return byCategory[cat] && byCategory[cat].length > 0; });
    var lowPresent  = (pattern.low_auth_clues || []).some(function(key) {
      return resolvedClues.some(function(c) { return c.clue === key; });
    }) || (pattern.low_auth_categories || []).some(function(cat) {
      return byCategory[cat] && byCategory[cat].length > 0;
    });

    if (highPresent && lowPresent) {
      notes.push(pattern.interpretation);
      totalAdjustment += (pattern.confidence_adjustment || 0);
      if (pattern.restoration_type) restorationTypes.add(pattern.restoration_type);

      // Downweight the offending low-authority clues
      resolvedClues.forEach(function(c) {
        var isOffender = (pattern.low_auth_clues || []).includes(c.clue) ||
          (pattern.low_auth_categories || []).includes(c.category);
        if (isOffender) {
          var penalty = Math.abs(pattern.confidence_adjustment || 0.05) * 1.5;
          c.adjusted_weight = Math.max(0.05, c.adjusted_weight - penalty);
          c.confidence_reason += " [downweighted: " + pattern.id + "]";
        }
      });
    }
  });

  // ── General rule: any hardware clue vs strong construction ──
  if (highAuthClues.length >= 2 && lowAuthHardware.length > 0) {
    var highAvg = highAuthClues.reduce(function(s, c) { return s + c.adjusted_weight; }, 0) / highAuthClues.length;
    var lowAvg  = lowAuthHardware.reduce(function(s, c) { return s + c.adjusted_weight; }, 0) / lowAuthHardware.length;
    if (highAvg > lowAvg + 0.20) {
      // Clear authority gap — hardware outweighed by construction
      if (!notes.some(function(n) { return n.includes("hardware"); })) {
        notes.push("Hardware evidence was given lower authority than structural and construction clues, which are more historically reliable indicators.");
      }
      restorationTypes.add("possible hardware replacement");
    }
  }

  // ── Hard negatives always win ────────────────────────────────
  var hardNegs = resolvedClues.filter(function(c) { return c.hard_negative; });
  hardNegs.forEach(function(hn) {
    notes.push(hn.display_label.charAt(0).toUpperCase() + hn.display_label.slice(1) +
      " is a hard negative — this clue cannot be explained by restoration and limits the date range definitively.");
    totalAdjustment -= 0.08;
  });

  // ── Build restoration interpretation object ──────────────────
  var restorationTypes_arr = Array.from(restorationTypes);
  var restorationPresent = restorationTypes_arr.length > 0 && !restorationTypes_arr.every(function(t) { return t === "possible hardware replacement"; });
  var confidenceReason = restorationPresent
    ? "Possible " + restorationTypes_arr.join(", ") + " may explain mixed clues. Construction evidence takes authority."
    : notes.length > 0
    ? "Some clue conflicts noted — see Conflict Notes below."
    : "";

  return {
    restoration_interpretation: {
      likely_restoration_present: restorationPresent,
      possible_restoration_types: restorationTypes_arr,
      confidence_reason:          confidenceReason,
    },
    conflict_notes:       notes,
    confidence_adjustment: Math.max(-0.25, totalAdjustment),
    resolved_clues:        resolvedClues,
  };
}


// ============================================================
// DECISION-REPORT LANGUAGE SYSTEM
// ============================================================
// Controls phrasing, tone, and structure for all report text.
// buildNarrative(weightedClues, resolvedConflicts, mode) → object
// mode: "field_scan" | "full_analysis"
// ============================================================

// ── Phrase bank by confidence tier ──────────────────────────
const REPORT_LANGUAGE = {
  high: {
    observation: ["clearly visible", "can be seen in the photographs", "is present", "is clearly identifiable"],
    interpretation: ["strongly consistent with", "a defining feature of", "characteristic of", "a reliable indicator of"],
    form: ["This is", "The object is", "The evidence confirms this is"],
  },
  moderate: {
    observation: ["appears to be", "is visible", "is present in the photographs"],
    interpretation: ["commonly associated with", "typically indicates", "consistent with", "often found on"],
    form: ["This is most likely", "The evidence suggests this is", "The available evidence points to"],
  },
  low: {
    observation: ["may be present", "appears possible"],
    interpretation: ["may indicate", "could suggest", "is sometimes associated with"],
    form: ["The evidence tentatively suggests", "Based on available photographs, this may be"],
  },
};

// ── Pick a phrase by confidence level ───────────────────────
function phrase(conf, bucket) {
  var tier = conf >= 0.75 ? "high" : conf >= 0.50 ? "moderate" : "low";
  var arr  = (REPORT_LANGUAGE[tier] || REPORT_LANGUAGE.moderate)[bucket] || [];
  return arr[0] || "";
}

// ── Build Confirmed Observations prose ──────────────────────
function buildObservationsText(weightedClues) {
  if (!weightedClues || !weightedClues.length) return null;
  var strong = weightedClues.filter(function(c){ return c.adjusted_weight >= 0.70 && !c.hard_negative; }).slice(0,5);
  if (!strong.length) strong = weightedClues.slice(0,3);
  var parts = strong.map(function(c){
    return c.display_label + (c.photo_index ? " (Photo " + c.photo_index + ")" : "");
  });
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0] + " is visible in the photographs.";
  var last = parts.pop();
  return parts.join(", ") + ", and " + last + " are visible in the photographs.";
}

// ── Build Historical Interpretation prose ───────────────────
function buildInterpretationText(weightedClues, formLabel, conf) {
  var confLevel = conf === "High" || conf === "Very High" ? 0.80 : conf === "Moderate" ? 0.60 : 0.40;
  var structural = weightedClues.filter(function(c){
    return c.category === "construction" || c.category === "joinery";
  }).slice(0,2);
  var hardware   = weightedClues.filter(function(c){ return c.category === "hardware" || c.category === "fasteners"; }).slice(0,1);

  var sentences = [];
  if (formLabel && formLabel !== "Unknown" && formLabel !== "Undetermined") {
    sentences.push(phrase(confLevel, "form") + " a " + formLabel + ".");
  }
  if (structural.length) {
    var clueList = structural.map(function(c){ return c.display_label; }).join(" and ");
    sentences.push(clueList + " " + phrase(confLevel, "interpretation") + " this form.");
  }
  if (hardware.length) {
    var entry = HISTORICAL_CLUE_LIBRARY[hardware[0].clue];
    if (entry) {
      sentences.push(hardware[0].display_label.charAt(0).toUpperCase() + hardware[0].display_label.slice(1) +
        " " + phrase(Math.min(confLevel, 0.65), "interpretation") + " the " + entry.typical_date_range + " period.");
    }
  }
  return sentences.join(" ") || null;
}

// ── Build Confidence Limits prose ───────────────────────────
function buildConfidenceLimitsText(resolvedConflicts, missingPhotoTypes) {
  var sentences = [];
  // Missing photos
  var missing = missingPhotoTypes || [];
  var hasStructuralMissing = missing.indexOf("underside") === -1 && missing.indexOf("back_panel") === -1;
  if (hasStructuralMissing && missing.indexOf("joinery_closeup") === -1) {
    sentences.push("Additional hidden structure photos (underside or back panel) or joinery close-ups would improve dating precision.");
  }
  // Conflict notes as limitations
  if (resolvedConflicts && resolvedConflicts.conflict_notes && resolvedConflicts.conflict_notes.length) {
    sentences.push("Some clue conflicts were noted — see the Conflict Interpretation section for detail.");
  }
  return sentences.slice(0,2).join(" ") || null;
}

// ── Master narrative builder ─────────────────────────────────
// Returns: { observations, interpretation, conflict, limits, summary }
function buildNarrative(weightedClues, resolvedConflicts, formLabel, conf, photoTypes, mode) {
  var obsText    = buildObservationsText(weightedClues);
  var interpText = buildInterpretationText(weightedClues, formLabel, conf);
  var limText    = buildConfidenceLimitsText(resolvedConflicts, photoTypes);
  var ri = resolvedConflicts && resolvedConflicts.restoration_interpretation;
  var conflictText = ri && ri.likely_restoration_present
    ? "Some hardware or surface elements may reflect later restoration or repair work, which is common in furniture that has remained in use. " + ri.confidence_reason
    : null;

  // Field Scan: concise bullets  Full Analysis: connected prose
  if (mode === "field_scan") {
    return {
      observations:    obsText,
      interpretation:  interpText,
      conflict:        conflictText,
      limits:          limText,
      // Short summary sentence for the signal card area
      summary: interpText
        ? interpText.split(".")[0] + "."
        : obsText
          ? "Evidence from the photographs supports this identification."
          : "Identification based on available visual evidence.",
    };
  }
  // Full Analysis: richer prose
  return {
    observations:    obsText,
    interpretation:  interpText,
    conflict:        conflictText,
    limits:          limText,
    summary: [obsText, interpText].filter(Boolean).join(" ") || "Analysis based on submitted photographs.",
  };
}


const PE = {

  async callClaude(system, userContent) {
    // ── Mock short-circuit — only fires when FULL_ANALYSIS_MODE="mock" ──
    if (String(FULL_ANALYSIS_MODE) === "mock") {
      console.info("[NCW callClaude] engine_mode=SIMULATED api_call_attempted=false fallback_triggered=true reason=mock_flag");
      return { ok:false, error_type:"mock_mode", error_message:'Set FULL_ANALYSIS_MODE="live" to enable real calls.', raw_response:"" };
    }

    // ── Live path — attempt real API call ──────────────────────────
    // NOTE: No x-api-key header — this artifact runs behind the Claude platform
    // proxy which injects auth automatically. Adding a key here would be both
    // insecure (exposed in JS) and wrong (proxy rejects conflicting auth headers).
    console.info("[NCW callClaude] engine_mode=LIVE api_call_attempted=true target=api.anthropic.com/v1/messages");
    console.info("[NCW callClaude] fetch_starting=true model=claude-sonnet-4-6 proxy_auth=platform_injected");
    let res, data;
    try {
      res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1200,
          system,
          messages: [{ role: "user", content: userContent }],
        }),
      });
      console.info("[NCW callClaude] fetch_resolved=true status=" + res.status);
      data = await res.json();
      console.info("[NCW callClaude] api_http_status=" + res.status + " response_keys=" + Object.keys(data).join(","));
      if (res.status === 401) {
        console.warn("[NCW callClaude] 401 UNAUTHORIZED — proxy did not inject auth. This artifact may be running outside the Claude platform sandbox.");
      }
    } catch(fetchErr) {
      console.warn("[NCW callClaude] fetch_resolved=false — request blocked before response. Likely cause: sandbox network policy blocks outbound fetch to api.anthropic.com from this artifact origin.");
      console.warn("[NCW callClaude] error=" + fetchErr.message);
      return { ok:false, error_type:"fetch_blocked", error_message: "Fetch blocked — sandbox network policy. This app requires the Claude artifact runtime to proxy API calls.", raw_response:"", retry_attempted:false };
    }

    // API-level error (auth, rate limit, server error)
    if (data.error) {
      console.warn("[NCW callClaude] api_error fallback_triggered=true type=" + (data.error.type||"?") + " message=" + (data.error.message||"?"));
      return {
        ok: false,
        error_type: "api_error",
        error_message: data.error.message || "Anthropic API returned an error",
        raw_response: JSON.stringify(data.error),
        retry_attempted: false,
      };
    }

    const raw = data.content ? data.content.map(b => b.text || "").join("\n") : "";
    console.info("[NCW callClaude] raw_llm_response_length=" + raw.length + " fallback_triggered=" + (!raw.trim()));

    if (!raw.trim()) {
      return {
        ok: false,
        error_type: "empty_response",
        error_message: "Model returned an empty response",
        raw_response: "",
        retry_attempted: false,
      };
    }

    // ── Response sanitizer — four explicit steps ─────────────────
    // Step 1: remove markdown code fences  (```json...``` or ```...```)
    // Step 2: trim leading prose / whitespace before the first {
    // Step 3: extract the outermost { ... } JSON object
    // Step 4: parse — throws on failure so the retry path fires
    const sanitize = (text) => {
      // Step 1: strip markdown fences
      let s = text.replace(/`{3}json[\s\S]*?`{3}|`{3}[\s\S]*?`{3}/g, "").trim();
      // Step 2: trim anything before the first {
      const firstBrace = s.indexOf("{");
      if (firstBrace > 0) s = s.slice(firstBrace);
      // Step 3: extract outermost { ... }
      const jsonMatch = s.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in response");
      // Step 4: parse
      return JSON.parse(jsonMatch[0]);
    };
    try {
      const parsed = sanitize(raw);
      return { ok: true, ...parsed };
    } catch (parseErr) {
      // Retry once with a tighter instruction
      try {
        let retryRes, retryData;
        try {
          retryRes = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 1200,
              system: system + "\n\nCRITICAL: Your previous response could not be parsed as JSON. Return ONLY a valid JSON object. No markdown. No explanation. No code fences. Begin your response with { and end with }.",
              messages: [
                { role: "user",      content: userContent },
                { role: "assistant", content: raw },
                { role: "user",      content: "Your response was not valid JSON. Return only the JSON object now, starting with {." },
              ],
            }),
          });
          retryData = await retryRes.json();
        } catch(retryFetchErr) {
          throw retryFetchErr; // fall through to outer catch(retryErr)
        }
        const retryRaw      = retryData.content.map(b => b.text || "").join("\n") || "";
        const retryParsed   = sanitize(retryRaw);
        return { ok: true, ...retryParsed };
      } catch (retryErr) {
        return {
          ok: false,
          error_type: "json_parse_error",
          error_message: `JSON parse failed: ${parseErr.message}. Retry also failed: ${retryErr.message}`,
          raw_response: raw,
          retry_attempted: true,
        };
      }
    }
  },

  // Validate a phase result — throws a structured PhaseError if result is an error object
  assertPhase(result, stageName, phaseLabel) {
    if (!result || result.ok === false) {
      const err = new Error(result.error_message || "Unknown phase error") as Error & {
  isPhaseError?: boolean;
  stage_name?: string;
  phase_label?: string;
  error_type?: string;
  error_message?: string;
  raw_response?: string;
  retry_attempted?: boolean;
};

err.isPhaseError = true;
err.stage_name = stageName;
err.phase_label = phaseLabel;
err.error_type = result.error_type || "unknown_error";
err.error_message = result.error_message || "No error details available";
err.raw_response = result.raw_response || "";
err.retry_attempted = (result && result.retry_attempted != null) ? result.retry_attempted : false;
              console.error(`[NCW Phase Error] case:${stageName}`, {
        stage_name: err.stage_name,
        error_type: err.error_type,
        error_message: err.error_message,
        raw_response: (err.raw_response || "").slice(0, 500),
      });
      throw err;
    }
    return result;
  },

  imgs(images) {
    const out = [];
    for (const img of images) {
      if (!img.data_url) continue;
      const [h, b] = img.data_url.split(",");
      const mt = h.match(/data:(.*?);/)[1] || "image/jpeg";
      out.push({ type: "image", source: { type: "base64", media_type: mt, data: b } });
      out.push({ type: "text", text: `[Image view: ${img.image_type}]` });
    }
    return out;
  },

  triggered(p1, key) {
    return p1.phase_triggers[key] !== false;
  },

  // Serialize WM for prompt injection
  wmSummary() {
    return `AUTHORITATIVE WEIGHT MATRIX (WM):
Tier weights: ${JSON.stringify(WM.tiers)}
Hard negative rules: ${JSON.stringify(WM.negative_rules)}
Conflict penalties: ${JSON.stringify(WM.penalties)}
Conflict recoveries: ${JSON.stringify(WM.recoveries)}
Confidence bands: High=85-100, Moderate=65-84, Low=40-64, Inconclusive=<40
Formula: confidence_pct = supporting / (supporting + opposing) × 100`;
  },

  // ============================================================
  // PHASE NORMALIZER
  // Sits between every raw model response and every phase validator.
  // Architecture: Prompt → raw response → normalize() → assertPhase → phase logic
  //
  // Each normalizer:
  //   A. Maps field aliases to canonical names
  //   B. Coerces types ("yes"→true, "0.72"→0.72, object→array when needed)
  //   C. Fills missing fields with safe defaults
  //   D. Accepts partial payloads — only fails when nothing recoverable
  //   E. Logs repair steps to console
  //
  // Called as: PE.normalize(raw, 'p1_intake')
  // Returns:   normalized object with ok:true, or original ok:false error object
  // ============================================================
  normalize(raw, phase) {
    // If callClaude returned a parse error, attempt extraction from raw_response
    if (raw && raw.ok === false && raw.raw_response) {
      const rr = raw.raw_response;
      const s = rr.indexOf("{"), e = rr.lastIndexOf("}");
      if (s !== -1 && e > s) {
        try {
          const recovered = JSON.parse(rr.slice(s, e + 1));
          console.info("[NCW Normalizer] Recovered JSON from raw_response for", phase);
          raw = recovered;  // fall through to alias/default logic below
        } catch(_re) {
          console.warn("[NCW Normalizer] Recovery parse failed for", phase, "— returning error");
          return raw;
        }
      } else {
        return raw;
      }
    }
    if (!raw || raw.ok === false) return raw;

    const toBool = (v) => {
      if (typeof v === "boolean") return v;
      if (typeof v === "number")  return v !== 0;
      if (typeof v === "string") {
        const s = v.toLowerCase().trim();
        if (["yes","true","present","1","detected","found","positive"].includes(s)) return true;
        if (["no","false","absent","none","0","not detected","negative","not found","n/a"].includes(s)) return false;
      }
      return false;
    };
    const toNum = (v, def=0) => { const n=parseFloat(v); return isNaN(n)?def:n; };
    const toArr = (v) => { if (Array.isArray(v)) return v; if (!v) return []; if (typeof v==="object") return [v]; return []; };
    const toConf = (v) => {
      if (!v) return "Low";
      const s=String(v).toLowerCase();
      if (s.includes("high")) return "High";
      if (s.includes("mod"))  return "Moderate";
      if (s.includes("inc"))  return "Inconclusive";
      return "Low";
    };

    const repairs = [];
    const alias = (obj: any, from: string, to: string, coerce?: (value: any) => any) => {
      if (obj[from] !== undefined && obj[to] === undefined) {
        obj[to] = coerce ? coerce(obj[from]) : obj[from];
        repairs.push(`${from}→${to}`);
      }
    };
    const n = { ...raw };

    switch (phase) {

      case "p1_intake": {
        // ── Primary aliases ──
        alias(n,"images_present","visible_image_types",toArr);
        alias(n,"image_types","visible_image_types",toArr);
        alias(n,"sufficiency","evidence_sufficiency");
        alias(n,"quality_notes","image_quality_notes");
        alias(n,"user_guess","user_stated_category");
        alias(n,"category_guess","user_stated_category");
        alias(n,"form_guess","broad_form_guess");
        alias(n,"wood","visible_primary_wood");
        alias(n,"primary_wood","visible_primary_wood");
        alias(n,"condition","overall_condition");
        alias(n,"flags","red_flags",toArr);
        alias(n,"triggers","phase_triggers");
        alias(n,"caps","confidence_caps");
        alias(n,"recommendation","proceed_recommendation");
        // ── Extended aliases — common LLM variations ──
        alias(n,"image_list","visible_image_types",toArr);
        alias(n,"photos","visible_image_types",toArr);
        alias(n,"photo_types","visible_image_types",toArr);
        alias(n,"evidence_quality","evidence_sufficiency");
        alias(n,"overall_evidence_sufficiency","evidence_sufficiency");
        alias(n,"quality","image_quality_notes");
        alias(n,"image_quality","image_quality_notes");
        alias(n,"stated_category","user_stated_category");
        alias(n,"user_category","user_stated_category");
        alias(n,"form","broad_form_guess");
        alias(n,"furniture_type","broad_form_guess");
        alias(n,"primary_wood_species","visible_primary_wood");
        alias(n,"secondary_wood","visible_secondary_wood");
        alias(n,"secondary_wood_species","visible_secondary_wood");
        alias(n,"red_flags_noted","red_flags",toArr);
        alias(n,"concerns","red_flags",toArr);
        alias(n,"phase_trigger_rules","phase_triggers");
        alias(n,"confidence_cap_rules","confidence_caps");
        alias(n,"proceed","proceed_recommendation");
        // ── Functional-mechanism fields (requested normalization) ──
        const toBoolLocal = function(v) {
          if (typeof v === "boolean") return v;
          if (typeof v === "number")  return v !== 0;
          if (typeof v === "string") {
            const s = v.toLowerCase().trim();
            if (["yes","true","present","1","detected","found","positive"].includes(s)) return true;
            if (["no","false","absent","none","0","not detected","negative","not found","n/a"].includes(s)) return false;
          }
          return false;
        };
        alias(n,"folds","folds_or_expands",toBoolLocal);
        alias(n,"expands","folds_or_expands",toBoolLocal);
        alias(n,"folds_expands","folds_or_expands",toBoolLocal);
        alias(n,"mechanical","mechanical_parts",toBoolLocal);
        alias(n,"mechanism","mechanical_parts",toBoolLocal);
        alias(n,"has_mechanism","mechanical_parts",toBoolLocal);
        alias(n,"prior_function","conversion_possible",toBoolLocal);
        alias(n,"conversion","conversion_possible",toBoolLocal);
        alias(n,"convertible","conversion_possible",toBoolLocal);
        alias(n,"drawers","has_drawers",toBoolLocal);
        alias(n,"doors","has_doors",toBoolLocal);
        if (n.folds_or_expands  === undefined) { n.folds_or_expands  = false; }
        if (n.mechanical_parts  === undefined) { n.mechanical_parts  = false; }
        if (n.conversion_possible=== undefined) { n.conversion_possible = false; }
        if (n.has_drawers       === undefined) { n.has_drawers        = false; }
        if (n.has_doors         === undefined) { n.has_doors          = false; }
        n.folds_or_expands   = toBoolLocal(n.folds_or_expands);
        n.mechanical_parts   = toBoolLocal(n.mechanical_parts);
        n.conversion_possible= toBoolLocal(n.conversion_possible);
        n.has_drawers        = toBoolLocal(n.has_drawers);
        n.has_doors          = toBoolLocal(n.has_doors);

        if (!n.visible_image_types)    { n.visible_image_types=[]; repairs.push("default visible_image_types"); }
        if (!n.evidence_sufficiency)   { n.evidence_sufficiency="Moderate"; repairs.push("default evidence_sufficiency"); }
        if (!n.image_quality_notes)    n.image_quality_notes="";
        if (!n.user_stated_category)   n.user_stated_category=null;
        if (!n.broad_form_guess)       n.broad_form_guess=null;
        if (!n.visible_primary_wood)   n.visible_primary_wood=null;
        if (!n.visible_secondary_wood) n.visible_secondary_wood=null;
        if (!n.overall_condition)      { n.overall_condition="unknown"; repairs.push("default overall_condition"); }
        if (!Array.isArray(n.red_flags)) { n.red_flags=[]; repairs.push("default red_flags"); }
        if (!Array.isArray(n.missing_critical_evidence)) { n.missing_critical_evidence=[]; repairs.push("default missing_critical_evidence"); }

        if (!n.evidence_inventory || typeof n.evidence_inventory !== "object") {
          const cats=["overall_form_view","underside_hidden_surface","hardware_closeup","joinery_drawer_construction","interior_structure","finish_closeup","back_board"];
          const inv={};
          for (const c of cats) inv[c]=n[c]?String(n[c]):"absent";
          n.evidence_inventory=inv; repairs.push("reconstructed evidence_inventory");
        }
        for (const k of Object.keys(n.evidence_inventory)) {
          const v=n.evidence_inventory[k];
          if (typeof v==="boolean") { n.evidence_inventory[k]=v?"present":"absent"; repairs.push(`evidence_inventory.${k} bool→str`); }
          if (!n.evidence_inventory[k]) n.evidence_inventory[k]="absent";
        }

        const capDefs={date_confidence_cap:"none",construction_confidence_cap:"none",hardware_originality_cap:"none",form_confidence_cap:"none",overall_confidence_cap:"none",valuation_confidence_cap:"none"};
        if (!n.confidence_caps||typeof n.confidence_caps!=="object") { n.confidence_caps={...capDefs}; repairs.push("default confidence_caps"); }
        else { for (const[k,v] of Object.entries(capDefs)) { if (!n.confidence_caps[k]) n.confidence_caps[k]=v; } }

        const trigDefs={run_dating_grid:true,run_form_engine:true,run_construction:true,run_hardware:true};
        if (!n.phase_triggers||typeof n.phase_triggers!=="object") { n.phase_triggers={...trigDefs}; repairs.push("default phase_triggers (all true)"); }
        else { for (const[k,v] of Object.entries(trigDefs)) { if (n.phase_triggers[k]===undefined) n.phase_triggers[k]=v; else n.phase_triggers[k]=toBool(n.phase_triggers[k]); } }

        if (!n.proceed_recommendation) n.proceed_recommendation="proceed";
        break;
      }

      case "p2_dating": {
        alias(n,"toolmarks","toolmark_observations",toArr);
        alias(n,"fasteners","fastener_observations",toArr);
        alias(n,"joinery","joinery_observations",toArr);
        alias(n,"materials","material_observations",toArr);
        alias(n,"finish","finish_observations",toArr);
        alias(n,"date_range","primary_date_range");
        alias(n,"dating_range","primary_date_range");
        alias(n,"estimated_date","primary_date_range");
        alias(n,"date_band","primary_date_range");
        alias(n,"confidence","dating_confidence",toConf);
        alias(n,"key_clues","key_dating_evidence",toArr);
        alias(n,"supporting_clues","key_dating_evidence",toArr);
        alias(n,"hard_negatives","hard_negatives_triggered",toArr);
        alias(n,"negative_evidence","negative_evidence_applied",toArr);

        if (!n.toolmark_observations)    { n.toolmark_observations=[]; repairs.push("default toolmark_observations"); }
        if (!n.fastener_observations)    { n.fastener_observations=[]; repairs.push("default fastener_observations"); }
        if (!n.joinery_observations)     { n.joinery_observations=[]; repairs.push("default joinery_observations"); }
        if (!n.material_observations)    { n.material_observations=[]; repairs.push("default material_observations"); }
        if (!n.finish_observations)      { n.finish_observations=[]; repairs.push("default finish_observations"); }
        if (!n.primary_date_range)       { n.primary_date_range="Date uncertain"; repairs.push("default primary_date_range"); }
        if (!n.earliest_possible_year)   { n.earliest_possible_year=1800; repairs.push("default earliest_possible_year"); }
        if (!n.latest_possible_year)     { n.latest_possible_year=1975; repairs.push("default latest_possible_year"); }
        if (!n.key_dating_evidence)      { n.key_dating_evidence=[]; repairs.push("default key_dating_evidence"); }
        if (!n.negative_evidence_applied) { n.negative_evidence_applied=[]; repairs.push("default negative_evidence_applied"); }
        if (!n.dating_conflicts)         { n.dating_conflicts=[]; repairs.push("default dating_conflicts"); }
        if (!n.hard_negatives_triggered) { n.hard_negatives_triggered=[]; repairs.push("default hard_negatives_triggered"); }
        if (n.age_support_points===undefined)  { n.age_support_points=0;  repairs.push("default age_support_points"); }
        if (n.age_opposing_points===undefined) { n.age_opposing_points=0; repairs.push("default age_opposing_points"); }
        if (!n.dating_confidence)        { n.dating_confidence="Low"; repairs.push("default dating_confidence"); }
        else n.dating_confidence=toConf(n.dating_confidence);
        if (!n.era_intersection_logic)   n.era_intersection_logic="";
        if (!n.caps_applied)             n.caps_applied=[];
        if (!Array.isArray(n.new_observations))       { n.new_observations=[]; repairs.push("default new_observations"); }
        if (!Array.isArray(n.candidates))             { n.candidates=[]; repairs.push("default candidates"); }
        if (!Array.isArray(n.eliminated))             { n.eliminated=[]; repairs.push("default eliminated"); }
        if (!Array.isArray(n.confidence_adjustments)) { n.confidence_adjustments=[]; repairs.push("default confidence_adjustments"); }
        n.phase2_schema_valid = true;
        break;
      }

      case "p3_form": {
        alias(n,"current_form","current_form_candidate");
        alias(n,"form","current_form_candidate");
        alias(n,"identified_form","current_form_candidate");
        alias(n,"original_form","original_form_candidate");
        alias(n,"alternates","alternate_form_candidates",toArr);
        alias(n,"alternate_forms","alternate_form_candidates",toArr);
        alias(n,"converted","is_conversion",toBool);
        alias(n,"is_converted","is_conversion",toBool);
        alias(n,"conversion_evidence_list","conversion_evidence",toArr);
        alias(n,"conversion_prob","conversion_probability");
        alias(n,"form_conf","form_confidence",toConf);
        alias(n,"confidence","form_confidence",toConf);
        alias(n,"reasoning","form_reasoning");
        alias(n,"form_support","form_support_points",toNum);
        alias(n,"form_opposing","form_opposing_points",toNum);
        alias(n,"conversion_support","conversion_support_points",toNum);

        if (!n.form_detection_method)      { n.form_detection_method="visual_impression"; repairs.push("default form_detection_method"); }
        if (n.mechanical_signature_detected===undefined) n.mechanical_signature_detected=null;
        if (!n.current_form_candidate)    { n.current_form_candidate="unknown"; repairs.push("default current_form_candidate"); }
        if (!n.original_form_candidate)   { n.original_form_candidate=n.current_form_candidate; repairs.push("original_form_candidate←current"); }
        if (!n.alternate_form_candidates)  n.alternate_form_candidates=[];
        if (!n.form_scoring_detail)        n.form_scoring_detail=[];
        if (n.form_support_points===undefined)     { n.form_support_points=0;    repairs.push("default form_support_points"); }
        if (n.form_opposing_points===undefined)    { n.form_opposing_points=0;   repairs.push("default form_opposing_points"); }
        if (n.conversion_support_points===undefined) { n.conversion_support_points=0; repairs.push("default conversion_support_points"); }
        if (n.conversion_opposing_points===undefined) n.conversion_opposing_points=0;
        if (n.current_form_score===undefined)   n.current_form_score=0;
        if (n.original_form_score===undefined)  n.original_form_score=0;
        if (n.is_conversion===undefined)         { n.is_conversion=false; repairs.push("default is_conversion=false"); }
        else n.is_conversion=toBool(n.is_conversion);
        if (!n.conversion_evidence)        n.conversion_evidence=[];
        if (!n.conversion_probability)    { n.conversion_probability="Low"; repairs.push("default conversion_probability"); }
        if (!n.form_confidence)           { n.form_confidence="Low"; repairs.push("default form_confidence"); }
        else n.form_confidence=toConf(n.form_confidence);
        if (!n.form_conflicts)             n.form_conflicts=[];
        if (!n.form_reasoning)            { n.form_reasoning="Insufficient evidence to determine form."; repairs.push("default form_reasoning"); }
        if (!n.caps_applied)               n.caps_applied=[];
        break;
      }

      case "p4_construction": {
        alias(n,"joinery_type","primary_joinery_type");
        alias(n,"joinery","primary_joinery_type");
        alias(n,"manufacturing","manufacturing_mode");
        alias(n,"manufacturing_method","manufacturing_mode");
        alias(n,"drawer_bottom","drawer_construction");
        alias(n,"back_construction","back_panel_construction");
        alias(n,"secondary_wood_species","secondary_wood");
        alias(n,"wood_species","secondary_wood");
        alias(n,"anomalies","structural_anomalies",toArr);
        alias(n,"special","special_structures",toArr);
        alias(n,"hard_negatives","hard_negatives_triggered",toArr);
        alias(n,"date_range","construction_date_range");
        alias(n,"construction_date","construction_date_range");
        alias(n,"confidence","construction_confidence",toConf);
        alias(n,"conflicts","construction_conflicts",toArr);

        if (!n.construction_scoring_detail) n.construction_scoring_detail=[];
        if (n.age_support_points===undefined)    { n.age_support_points=0;    repairs.push("default age_support_points"); }
        if (n.age_opposing_points===undefined)   { n.age_opposing_points=0;   repairs.push("default age_opposing_points"); }
        if (n.originality_support_points===undefined)  n.originality_support_points=0;
        if (n.originality_opposing_points===undefined) n.originality_opposing_points=0;
        if (n.form_support_from_structure===undefined)       n.form_support_from_structure=0;
        if (n.conversion_support_from_structure===undefined) n.conversion_support_from_structure=0;
        if (!n.manufacturing_mode)    { n.manufacturing_mode="unknown"; repairs.push("default manufacturing_mode"); }
        if (!n.primary_joinery_type)  { n.primary_joinery_type="unknown"; repairs.push("default primary_joinery_type"); }
        if (n.joinery_confidence===undefined) n.joinery_confidence=0;
        if (!n.drawer_construction)   n.drawer_construction="";
        if (!n.back_panel_construction) n.back_panel_construction="";
        if (!n.secondary_wood)        n.secondary_wood="";
        if (!n.special_structures)    n.special_structures=[];
        if (!n.structural_anomalies)  n.structural_anomalies=[];
        if (!n.hard_negatives_triggered) n.hard_negatives_triggered=[];
        if (!n.construction_date_range) { n.construction_date_range="unknown"; repairs.push("default construction_date_range"); }
        if (!n.construction_conflicts)  n.construction_conflicts=[];
        if (!n.construction_confidence) { n.construction_confidence="Low"; repairs.push("default construction_confidence"); }
        else n.construction_confidence=toConf(n.construction_confidence);
        if (!n.caps_applied) n.caps_applied=[];
        break;
      }

      case "p5_hardware": {
        alias(n,"hardware","hardware_scoring_detail",toArr);
        alias(n,"hardware_items","hardware_scoring_detail",toArr);
        alias(n,"date_range","hardware_date_range");
        alias(n,"hardware_date","hardware_date_range");
        alias(n,"consistency","hardware_consistency");
        alias(n,"style_family","style_family_suggested");
        alias(n,"style","style_family_suggested");
        alias(n,"concerns","originality_concerns",toArr);
        alias(n,"conflicts","hardware_conflicts",toArr);
        alias(n,"hard_negatives","hard_negatives_triggered",toArr);
        alias(n,"confidence","hardware_confidence",toConf);
        alias(n,"notes","hardware_notes");

        if (!n.hardware_scoring_detail)  { n.hardware_scoring_detail=[]; repairs.push("default hardware_scoring_detail"); }
        if (n.age_support_points===undefined)    { n.age_support_points=0;    repairs.push("default age_support_points"); }
        if (n.age_opposing_points===undefined)   { n.age_opposing_points=0;   repairs.push("default age_opposing_points"); }
        if (n.originality_support_points===undefined)  n.originality_support_points=0;
        if (n.originality_opposing_points===undefined) n.originality_opposing_points=0;
        if (!n.hard_negatives_triggered) n.hard_negatives_triggered=[];
        if (!n.hardware_date_range)      { n.hardware_date_range="unknown"; repairs.push("default hardware_date_range"); }
        if (!n.hardware_consistency)     { n.hardware_consistency="unknown"; repairs.push("default hardware_consistency"); }
        if (n.style_family_suggested===undefined) n.style_family_suggested=null;
        if (!n.originality_concerns)     n.originality_concerns=[];
        if (!n.hardware_conflicts)       n.hardware_conflicts=[];
        if (!n.hardware_confidence)      { n.hardware_confidence="Low"; repairs.push("default hardware_confidence"); }
        else n.hardware_confidence=toConf(n.hardware_confidence);
        if (!n.hardware_notes)           n.hardware_notes="";
        if (!n.caps_applied)             n.caps_applied=[];
        break;
      }

      case "p6_conflict": {
        alias(n,"conflicts","conflicts_detected",toArr);
        alias(n,"conflict_list","conflicts_detected",toArr);
        alias(n,"issues","conflicts_detected",toArr);
        alias(n,"net_adjustment","total_net_adjustment",toNum);
        alias(n,"classification","object_classification_suggested");
        alias(n,"interpretation","conflict_interpretation_for_report");
        alias(n,"conflict_summary_text","conflict_summary");

        if (!n.conflicts_detected)      { n.conflicts_detected=[]; repairs.push("default conflicts_detected"); }
        if (n.no_conflicts_detected===undefined) n.no_conflicts_detected=n.conflicts_detected.length===0;
        if (n.total_penalty===undefined)    n.total_penalty=0;
        if (n.total_recovery===undefined)   n.total_recovery=0;
        if (n.total_net_adjustment===undefined) { n.total_net_adjustment=n.total_recovery-n.total_penalty; repairs.push("computed total_net_adjustment"); }
        if (!n.conflict_summary)        n.conflict_summary="";
        if (!n.object_classification_suggested) { n.object_classification_suggested="unknown"; repairs.push("default object_classification_suggested"); }
        if (!n.conflict_interpretation_for_report) n.conflict_interpretation_for_report="";
        break;
      }

      case "p7_reconciliation": {
        alias(n,"date_range","reconciled_date_range");
        alias(n,"final_date","reconciled_date_range");
        alias(n,"date","reconciled_date_range");
        alias(n,"style","reconciled_style_family");
        alias(n,"style_family","reconciled_style_family");
        alias(n,"form","reconciled_form");
        alias(n,"current_form","reconciled_form");
        alias(n,"original","original_form");
        alias(n,"alterations_list","alterations",toArr);
        alias(n,"changes","alterations",toArr);
        alias(n,"evidence","supporting_evidence",toArr);
        alias(n,"key_evidence","supporting_evidence",toArr);
        alias(n,"conflicts","conflicts_found",toArr);
        alias(n,"negative_clues","negative_evidence_applied",toArr);
        alias(n,"confidence_pct","confidence_percent",toNum);
        alias(n,"confidence_score","confidence_percent",toNum);
        alias(n,"confidence","confidence_band",toConf);
        alias(n,"band","confidence_band",toConf);
        alias(n,"classification","object_classification");
        alias(n,"notes","reconciliation_notes");
        alias(n,"summary","reconciliation_notes");

        if (!n.reconciled_date_range)     { n.reconciled_date_range="Undetermined"; repairs.push("default reconciled_date_range"); }
        if (!n.reconciled_form)           { n.reconciled_form="unknown"; repairs.push("default reconciled_form"); }
        if (!n.original_form)              n.original_form=n.reconciled_form;
        if (!n.alterations)                n.alterations=[];
        if (!n.supporting_evidence)       { n.supporting_evidence=[]; repairs.push("default supporting_evidence"); }
        if (!n.conflicts_found)            n.conflicts_found=[];
        if (!n.negative_evidence_applied)  n.negative_evidence_applied=[];
        if (n.confidence_percent===undefined) { n.confidence_percent=50; repairs.push("default confidence_percent=50"); }
        if (!n.confidence_band)            { n.confidence_band=WM.bandOf(toNum(n.confidence_percent,50)); repairs.push("computed confidence_band"); }
        else n.confidence_band=toConf(n.confidence_band);
        if (!n.object_classification)      n.object_classification=n.object_classification_suggested||"unknown";
        if (!n.reconciliation_notes)      { n.reconciliation_notes=""; repairs.push("default reconciliation_notes"); }
        if (!n.scorecard)                  n.scorecard={};
        if (n.overall_supporting_points===undefined) n.overall_supporting_points=0;
        if (n.overall_opposing_points===undefined)   n.overall_opposing_points=0;
        break;
      }

      case "p8_valuation": {
        alias(n,"market_estimates","valuations",toArr);
        alias(n,"estimates","valuations",toArr);
        alias(n,"value_ranges","valuations",toArr);
        alias(n,"lanes","valuations",toArr);
        alias(n,"drivers","value_drivers",toArr);
        alias(n,"detractors","value_detractors",toArr);
        alias(n,"market_context","market_notes");
        alias(n,"notes","market_notes");

        if (!n.valuations) { n.valuations=[]; repairs.push("default valuations"); }
        n.valuations=toArr(n.valuations).map((v,i)=>{
          if (!v||typeof v!=="object") return null;
          const vn={...v};
          if (!vn.market_lane) { vn.market_lane=vn.lane||vn.name||vn.type||`lane_${i}`; repairs.push(`valuation[${i}] market_lane from alias`); }
          if (vn.low===undefined&&vn.low_estimate!==undefined) vn.low=vn.low_estimate;
          if (vn.high===undefined&&vn.high_estimate!==undefined) vn.high=vn.high_estimate;
          if (vn.low===undefined) { vn.low=0; repairs.push(`valuation[${i}] default low`); }
          if (vn.high===undefined) vn.high=vn.low;
          vn.low=toNum(vn.low); vn.high=toNum(vn.high);
          if (!vn.rationale) vn.rationale="";
          return vn;
        }).filter(Boolean);

        if (!n.value_drivers)    { n.value_drivers=[]; repairs.push("default value_drivers"); }
        if (!n.value_detractors) { n.value_detractors=[]; repairs.push("default value_detractors"); }
        if (!n.market_notes)      n.market_notes="";
        if (n.valuation_skipped===undefined) n.valuation_skipped=false;
        if (!n.value_adjustments_applied) n.value_adjustments_applied=[];
        break;
      }

      default: break;
    }

    if (repairs.length>0) console.info(`[NCW Normalizer:${phase}] Repaired ${repairs.length} field(s): ${repairs.join(", ")}`);
    n._normalized=true; n._phase=phase; n._repairs=repairs;
    return n;
  },


  // ============================================================
  // VISUAL EVIDENCE LIBRARY
  // Defines every clue category the scanner can match.
  // Each entry includes:
  //   reference_table  — which DB table holds this clue
  //   reference_id     — id in that table (from WM.clues keys)
  //   observation_type — category label written to case_observations
  //   image_types      — which image slots are relevant for this clue
  //   is_hidden_surface— true if evidence is typically on an unexposed surface
  //   weight_multiplier— default multiplier; reduced for low-quality images
  //   description      — what Claude should look for visually
  // ============================================================
  VISUAL_LIBRARY: [

    // ── TOOLMARKS ──────────────────────────────────────────────
    {
      clue_key:         "pit_saw_marks",
      reference_table:  "toolmark_clues",
      observation_type: "toolmark",
      image_types:      ["underside","back","joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Irregular, slightly curved or diagonal saw marks from a hand-operated pit saw. Lines are uneven, may show slight waviness, spacing varies. Found on undersides of boards and rough secondary surfaces. Pre-1830.",
    },
    {
      clue_key:         "circular_saw_arcs",
      reference_table:  "toolmark_clues",
      observation_type: "toolmark",
      image_types:      ["underside","back","joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Parallel arc-shaped marks in consistent curved patterns from a circular saw blade. Lines curve uniformly in one direction. Post-1830, strong indicator post-1840.",
    },
    {
      clue_key:         "band_saw_lines",
      reference_table:  "toolmark_clues",
      observation_type: "toolmark",
      image_types:      ["underside","back","joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Thin, straight, closely-spaced parallel lines from a band saw blade. Marks are very fine and uniform. Post-1870.",
    },
    {
      clue_key:         "hand_plane_chatter",
      reference_table:  "toolmark_clues",
      observation_type: "toolmark",
      image_types:      ["underside","back","joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 0.7,
      description: "Subtle, slightly irregular ridges or scallop patterns from hand planing. Surface appears slightly undulating rather than perfectly flat. Any era but indicates hand finishing.",
    },
    {
      clue_key:         "machine_routing_uniform",
      reference_table:  "toolmark_clues",
      observation_type: "toolmark",
      image_types:      ["joinery_closeup","overall_front"],
      is_hidden_surface: false,
      weight_multiplier: 0.9,
      description: "Perfectly uniform routed profile with consistent depth and smooth walls on moldings or grooves. No variation in depth or width. Post-1900.",
    },

    // ── FASTENERS ──────────────────────────────────────────────
    {
      clue_key:         "hand_forged_nail",
      reference_table:  "fastener_clues",
      observation_type: "fastener",
      image_types:      ["underside","back","joinery_closeup","hardware_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Nail with irregular, hammered head — not perfectly round or flat. Shank tapers on all four sides (not just two). Head may be slightly off-center. Pre-1800.",
    },
    {
      clue_key:         "cut_nail",
      reference_table:  "fastener_clues",
      observation_type: "fastener",
      image_types:      ["underside","back","joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Rectangular cross-section nail cut from sheet metal. Head is flat and rectangular. Shank tapers on two sides only, remaining sides parallel. 1790–1890.",
    },
    {
      clue_key:         "wire_nail",
      reference_table:  "fastener_clues",
      observation_type: "fastener",
      image_types:      ["underside","back","joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Round cross-section nail with circular head. Shank is perfectly cylindrical. Modern appearance. Post-1880.",
    },
    {
      clue_key:         "slotted_handmade_screw",
      reference_table:  "fastener_clues",
      observation_type: "fastener",
      image_types:      ["hardware_closeup","joinery_closeup"],
      is_hidden_surface: false,
      weight_multiplier: 1.0,
      description: "Slotted screw with off-center slot, irregular thread spacing, and slightly uneven head. Tip may be blunt rather than sharp point. 1770–1840.",
    },
    {
      clue_key:         "slotted_machine_screw",
      reference_table:  "fastener_clues",
      observation_type: "fastener",
      image_types:      ["hardware_closeup","joinery_closeup"],
      is_hidden_surface: false,
      weight_multiplier: 0.8,
      description: "Slotted screw with centered slot, uniform threads, perfectly round head. Sharp pointed tip. Post-1840.",
    },
    {
      clue_key:         "phillips_screw",
      reference_table:  "fastener_clues",
      observation_type: "fastener",
      image_types:      ["hardware_closeup","joinery_closeup","underside"],
      is_hidden_surface: false,
      weight_multiplier: 1.0,
      description: "Cross-shaped Phillips head recess. Unmistakable X pattern in head. Hard negative for pre-1930 claims. Post-1930.",
    },

    // ── JOINERY ────────────────────────────────────────────────
    {
      clue_key:         "hand_cut_dovetails",
      reference_table:  "construction_clues",
      observation_type: "joinery",
      image_types:      ["joinery_closeup","underside"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Dovetail joints with slightly irregular pin spacing, varying angles, and subtle hand-cut variation. Pins and tails may differ slightly in width. Saw lines not perfectly parallel. Pre-1860 (rural to 1890).",
    },
    {
      clue_key:         "machine_dovetails",
      reference_table:  "construction_clues",
      observation_type: "joinery",
      image_types:      ["joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Dovetail joints with perfectly uniform pin spacing and identical angles throughout. Machine-perfect regularity. Post-1860.",
    },
    {
      clue_key:         "mortise_and_tenon",
      reference_table:  "construction_clues",
      observation_type: "joinery",
      image_types:      ["joinery_closeup","overall_side"],
      is_hidden_surface: false,
      weight_multiplier: 0.9,
      description: "Rectangular peg-in-slot joint visible at frame corners or stretchers. May show wooden pegs or wedges. Frame members meet at right angles with no metal fasteners at joint. 1600–1900.",
    },
    {
      clue_key:         "dowel_joinery",
      reference_table:  "construction_clues",
      observation_type: "joinery",
      image_types:      ["joinery_closeup"],
      is_hidden_surface: false,
      weight_multiplier: 0.8,
      description: "Round wooden dowel pegs visible at joint faces. Perfectly round holes. Post-1900 indicator.",
    },
    {
      clue_key:         "solid_board_drawer_bottom",
      reference_table:  "construction_clues",
      observation_type: "construction",
      image_types:      ["joinery_closeup","underside"],
      is_hidden_surface: true,
      weight_multiplier: 0.9,
      description: "Drawer bottom made from a single solid wood board, usually chamfered at edges to fit groove. Grain runs side to side. May show shrinkage cracks. Pre-industrial indicator.",
    },
    {
      clue_key:         "plywood_drawer_bottom",
      reference_table:  "construction_clues",
      observation_type: "construction",
      image_types:      ["joinery_closeup","underside"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Drawer bottom showing visible plywood layers at edges — multiple thin laminated layers. HARD NEGATIVE for antique claim. Post-1920.",
    },

    // ── HARDWARE ───────────────────────────────────────────────
    {
      clue_key:         "victorian_strap_hinge",
      reference_table:  "hardware_types",
      observation_type: "hardware",
      image_types:      ["hardware_closeup","overall_front"],
      is_hidden_surface: false,
      weight_multiplier: 0.9,
      description: "Long decorative strap hinge with Gothic or Victorian revival styling — pointed ends, ornate surface detail, surface-mounted. 1865–1895. Check for matching patina and mounting screw type.",
    },
    {
      clue_key:         "batwing_brass_pull",
      reference_table:  "hardware_types",
      observation_type: "hardware",
      image_types:      ["hardware_closeup","overall_front"],
      is_hidden_surface: false,
      weight_multiplier: 0.5,   // max 0.5 — high replacement risk
      description: "Bat-wing shaped brass bail pull with willow or batwing backplate. 18th-century style. 1720–1790 originally but HIGH replacement risk — always apply 0.5 multiplier max.",
    },
    {
      clue_key:         "eastlake_pull",
      reference_table:  "hardware_types",
      observation_type: "hardware",
      image_types:      ["hardware_closeup","overall_front"],
      is_hidden_surface: false,
      weight_multiplier: 0.9,
      description: "Incised geometric or stylized pull with angular Eastlake aesthetic — angular, machined surface ornament. 1870–1890.",
    },
    {
      clue_key:         "porcelain_caster",
      reference_table:  "hardware_types",
      observation_type: "hardware",
      image_types:      ["hardware_closeup","overall_front","overall_side"],
      is_hidden_surface: false,
      weight_multiplier: 0.9,
      description: "Caster with white porcelain or ceramic wheel and metal fork bracket. Wheel is ceramic, not rubber or metal. 1830–1870.",
    },
    {
      clue_key:         "modern_concealed_hinge",
      reference_table:  "hardware_types",
      observation_type: "hardware",
      image_types:      ["hardware_closeup","overall_front"],
      is_hidden_surface: false,
      weight_multiplier: 1.0,
      description: "European-style cup hinge with circular cup mortised into door face. Fully concealed when door closed. HARD NEGATIVE for antique claim. Post-1950.",
    },

    // ── CONVERSION CAVITIES ────────────────────────────────────
    {
      clue_key:         "pedal_cavity_structure",
      reference_table:  "construction_clues",
      observation_type: "hidden_structure",
      image_types:      ["underside","overall_side","overall_front"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Internal cavity or void at lower section consistent with pump organ pedal mechanism — typically 6–10 inches deep, full width, with evidence of bellows mounting points or pedal pivot hardware. 1850–1920.",
    },
    {
      clue_key:         "treadle_mount",
      reference_table:  "construction_clues",
      observation_type: "hidden_structure",
      image_types:      ["underside","overall_side"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Structural mounting hardware or cavity for treadle mechanism — iron bracket holes, pivot points, or reinforced lower frame consistent with sewing machine treadle. 1860–1910.",
    },
    {
      clue_key:         "ice_chamber",
      reference_table:  "construction_clues",
      observation_type: "hidden_structure",
      image_types:      ["overall_front","overall_side"],
      is_hidden_surface: false,
      weight_multiplier: 1.0,
      description: "Insulated interior chamber with thick walls, metal liner, or drain fitting. Upper compartment for ice block, lower for food. 1880–1920.",
    },

    // ── FINISH PATTERNS ────────────────────────────────────────
    {
      clue_key:         "shellac",
      reference_table:  "finish_types",
      observation_type: "finish",
      image_types:      ["overall_front","hardware_closeup"],
      is_hidden_surface: false,
      weight_multiplier: 0.7,
      description: "Shellac finish shows characteristic crazing or alligatoring with age — fine network of cracks. Warm amber tone. Dissolves with alcohol (test not visual). 1800–1920.",
    },
    {
      clue_key:         "oil_finish",
      reference_table:  "finish_types",
      observation_type: "finish",
      image_types:      ["overall_front","joinery_closeup"],
      is_hidden_surface: false,
      weight_multiplier: 0.5,
      description: "Low-sheen penetrating oil finish. Surface appears to have absorbed the finish rather than built a film coat. No surface film, no crazing. Any era.",
    },
    {
      clue_key:         "polyurethane",
      reference_table:  "finish_types",
      observation_type: "finish",
      image_types:      ["overall_front","hardware_closeup"],
      is_hidden_surface: false,
      weight_multiplier: 0.8,
      description: "Thick plastic-looking film coat. High or semi-gloss plastic sheen. May show peeling, chipping, or clouding at edges. NEGATIVE indicator for original antique finish. Post-1960.",
    },
  ],
  // ─────────────────────────────────────────────────────────────
  // PHASE 0 — Visual Evidence Scanner  (single authoritative definition)
  //
  // TOLERANCE CONTRACT — never hard-fails if photos are present:
  //   1. Raw result parsed → recovery layer normalizes it
  //   2. Aliases: detected_clues/clues/findings/items → observations
  //   3. observations may be object (by-type) OR flat array → both handled
  //   4. Each observation: missing fields filled with safe defaults
  //   5. JSON parse failure → one automatic retry with tighter prompt
  //   6. Total failure → safe empty p0 + phase_0_status flag, pipeline continues
  //
  // Minimal acceptable raw payload:
  //   { "observations": { "toolmarks": [...], ... } }   ← object-by-type (preferred)
  //   { "observations": [...] }                          ← flat array (also accepted)
  //   { "detected_clues": [...] }                        ← alias accepted
  //
  // Output shape consumed by all downstream phases:
  //   { skipped, total_observations, observations_by_type,
  //     hard_negatives_detected, images_scanned, scan_summary,
  //     phase_0_status, recovery_used,
  //     primary_wood_observed, secondary_wood_observed,
  //     broad_form_impression, condition_impression, anomalies_noted }
  // ─────────────────────────────────────────────────────────────
  async p0(images) {
    // ── Safe empty result — used when total failure occurs ─────
    const safeEmpty = (reason, rawResponse) => ({
      skipped:                false,
      phase_0_status:         "no_reliable_observations_recovered",
      recovery_used:          false,
      total_observations:     0,
      observations_by_type:   {},
      hard_negatives_detected:[],
      images_scanned:         (images || []).filter(i => i.data_url).length,
      scan_summary:           { scan_confidence:"low", images_scanned:[], image_quality_issues:[], total_observations:0, hard_negatives_found:[] },
      primary_wood_observed:  "",
      secondary_wood_observed:"",
      broad_form_impression:  "",
      condition_impression:   "unknown",
      anomalies_noted:        [],
      notes:                  `Images present but no structured clues extracted. Reason: ${reason}`,
      _raw_response:          rawResponse || "",
      _expected_schema:       '{ "observations": { "toolmarks":[...], "fasteners":[...], "joinery":[...], "hardware":[...], "conversion_cavities":[...], "finish":[...], "mechanical_structures":[...] } }',
    });

    if (!images || images.length === 0) {
      return { ...safeEmpty("No images submitted", ""), skipped: true, skip_reason: "No images submitted" };
    }

    // ── Recovery parser ────────────────────────────────────────
    // Normalizes any plausible raw model output into observations_by_type.
    const KNOWN_TYPES = ["toolmarks","fasteners","joinery","hardware","conversion_cavities","finish","construction","mechanical_structures"];
    const ALIAS_KEYS  = ["detected_clues","clues","findings","items","evidence","results","clue_list"];

    const recoverObservations = (parsed, imageArr) => {
      if (!parsed || typeof parsed !== "object") return null;

      // 1. observations field — object (by-type) or array (flat)
      let raw = parsed.observations;

      // 2. Try known aliases if observations missing
      if (raw === undefined || raw === null) {
        for (const alias of ALIAS_KEYS) {
          if (parsed[alias] !== undefined) { raw = parsed[alias]; break; }
        }
      }

      // 3. Still nothing — try root-level type keys directly
      if (raw === undefined || raw === null) {
        const rootByType = {};
        for (const t of KNOWN_TYPES) {
          if (Array.isArray(parsed[t]) && parsed[t].length > 0) rootByType[t] = parsed[t];
        }
        if (Object.keys(rootByType).length > 0) raw = rootByType;
      }

      // 4. Last resort — convert Stage A raw_visual_observations into mechanical_structures
      if ((raw === undefined || raw === null) && Array.isArray(parsed.raw_visual_observations)) {
        const mechClues = [];
        for (const imgEntry of parsed.raw_visual_observations) {
          const label = imgEntry.image_label || "unknown";
          for (const clue of (imgEntry.clues || [])) {
            const c = clue.toLowerCase();
            const key =
              c.includes("drop leaf") || c.includes("hinged leaf") || c.includes("fold") ? "drop_leaf_hinged" :
              c.includes("gate leg") || c.includes("gateleg") || c.includes("swing leg") || c.includes("pivot leg") ? "gateleg_support" :
              c.includes("caster") || c.includes("wheel") ? "porcelain_caster" :
              c.includes("drawer") ? "drawer_present" :
              c.includes("door") ? "door_present" :
              c.includes("turned leg") ? "turned_leg" :
              c.includes("tapered leg") ? "tapered_leg" :
              c.includes("stretcher") ? "stretcher" :
              c.includes("apron") ? "apron" :
              "form_clue";
            mechClues.push({
              clue: key,
              source_image: label,
              visual_confidence: 55,
              low_confidence_flag: false,
              weight_multiplier: 0.8,
              visual_description: clue,
              implied_form: parsed.broad_form_impression || "",
              observation_type: "mechanical_structures",
            });
          }
        }
        if (mechClues.length > 0) raw = { mechanical_structures: mechClues };
      }

      if (raw === undefined || raw === null) return null;

      // 4. Normalize into by-type object
      let byType = {};

      if (Array.isArray(raw)) {
        // Flat array — group by observation_type or type field
        for (const obs of raw) {
          if (!obs || typeof obs !== "object") continue;
          const t = obs.observation_type || obs.type || obs.category || "unknown";
          if (!byType[t]) byType[t] = [];
          byType[t].push(obs);
        }
      } else if (typeof raw === "object") {
        // Already by-type — accept directly
        byType = raw;
      }

      // 5. Normalize each observation's fields — fill defaults for missing
      const normalizeObs = (obs, typeName, imageArr) => {
        if (!obs || typeof obs !== "object") return null;
        const srcImage = obs.source_image || obs.source_image_id || obs.image_type || obs.image || null;
        // Resolve 1-based photo index from image array
        const photoIdx = srcImage && imageArr
          ? (function(){
              var idx = imageArr.findIndex(function(img){ return img.image_type === srcImage || img.storage_key === srcImage; });
              return idx >= 0 ? idx + 1 : null;
            })()
          : null;
        return {
          clue:               obs.clue         || obs.clue_key    || obs.label     || obs.name    || "unknown_clue",
          source_image:       srcImage,
          photo_index:        photoIdx,
          image_region:       obs.image_region || obs.region_label  || obs.region   || obs.location || null,
          visual_confidence:  typeof obs.visual_confidence === "number" ? obs.visual_confidence
                            : typeof obs.confidence       === "number" ? obs.confidence * 100
                            : typeof obs.raw_confidence   === "number" ? obs.raw_confidence * 100
                            : 40,   // default low confidence
          low_confidence_flag:(obs.low_confidence_flag != null) ? obs.low_confidence_flag : (obs.visual_confidence < 60),
          weight_multiplier:  typeof obs.weight_multiplier === "number"
                              ? Math.min(1, Math.max(0, obs.weight_multiplier))
                              : obs.visual_confidence < 60 ? 0.5 : 1.0,
          hard_negative:      (obs.hard_negative != null) ? obs.hard_negative : false,
          visual_description: obs.visual_description || obs.observed_value_text || obs.description || obs.notes || obs.clue || "",
          era_implication:    obs.era_implication    || obs.era    || "",
          observation_type:   obs.observation_type   || typeName   || "unknown",
          notes:              obs.notes || "",
          _recovered:         true,
        };
      };

      const normalized = {};
      for (const [typeName, arr] of Object.entries(byType)) {
        if (!Array.isArray(arr)) continue;
        const normArr = arr.map(function(o){ return normalizeObs(o, typeName, imageArr); }).filter(Boolean);
        if (normArr.length > 0) normalized[typeName] = normArr;
      }

      return Object.keys(normalized).length > 0 ? normalized : null;
    };

    // ── Build the prompt ───────────────────────────────────────
    const sys = `You are the Visual Evidence Scanner for the NCW American Furniture Identification Engine.
Scope: American furniture, 1600–present.

════════════════════════════════════════════════════════
STAGE A — RAW VISUAL OBSERVATIONS  (do this first)
════════════════════════════════════════════════════════

Look at EVERY submitted image carefully. For each image, write down every visible physical clue in plain English.

DO NOT identify the furniture yet.
DO NOT infer style or date yet.
DO NOT skip weak or uncertain clues — label them tentative if needed.

Record anything you can see, including:
• hinged leaves / drop leaves / fold lines at top edge
• swing leg, gate leg, pivot leg, or gate frame
• turned legs, square-tapered legs, cabriole legs, straight legs
• stretchers between legs
• casters (wheels) under feet
• drawers — how many, what joinery at corners if visible
• doors — hinged, sliding, paneled
• underside rails, apron, or support structure
• support brackets, butterfly brackets, rule joints
• hinge hardware — type, location, scale
• pull hardware — bail, knob, ring, Eastlake, ceramic
• lock escutcheons
• fastener types — nail heads, screw heads
• saw marks on underside boards
• panel construction — solid, frame-and-panel, plywood
• wood species clues — grain pattern, color, figure
• finish appearance — sheen, crazing, color
• labels, stamps, stencils, maker marks
• repairs — patches, replaced boards, new fasteners
• signs of conversion — ghost holes, removed mechanisms, mismatched wood
• anything structurally absent that you would expect to see

CRITICAL RULE: If the photos clearly show a table form with hinged leaves,
you MUST record "hinged leaves visible" and "drop leaf form" in at least one image entry.
Do not omit obvious table mechanisms even at low confidence.

════════════════════════════════════════════════════════
STAGE B — NORMALIZED EVIDENCE SCHEMA  (do this second)
════════════════════════════════════════════════════════

Convert your Stage A observations into structured evidence fields.

Use these exact observation types: toolmarks, fasteners, joinery, hardware, conversion_cavities, finish, mechanical_structures.

For mechanical_structures, use these clue keys when applicable:
drop_leaf_hinged, gateleg_support, rule_joint, swing_leg, butterfly_support,
lift_lid, till_interior, drawer_present, multiple_drawer_case, door_present,
slant_front, cylinder_roll, fall_front, pedestal_base, tilt_top, tripod_base,
extension_mechanism, washstand_splash, mirror_attachment.

HARD NEGATIVES (always flag): phillips_screw, staple_fastener, plywood_drawer_bottom, modern_concealed_hinge, particle_board, mdf.

visual_confidence scale:
80–100 = clearly visible  |  50–79 = visible with some uncertainty  |  20–49 = possible, mark low_confidence_flag:true  |  below 20 = omit

MINIMUM OUTPUT RULE:
• If you recorded any table-form clues in Stage A, observations.mechanical_structures must not be empty.
• If ANY clues were visible, observations must not be an empty object.
• broad_form_impression is REQUIRED if any form is evident.

════════════════════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════════════════════

Respond ONLY in valid JSON. Begin with { and include both stages:

{
  "raw_visual_observations": [
    {
      "image_label": "overall_front",
      "clues": [
        "drop leaves visible on both sides of the fixed center top",
        "turned legs with small casters at base",
        "gate leg or swing leg visible folded against apron"
      ]
    }
  ],
  "scan_summary": {
    "images_scanned": [],
    "image_quality_issues": [],
    "total_observations": 0,
    "hard_negatives_found": [],
    "scan_confidence": "high|moderate|low"
  },
  "observations": {
    "toolmarks":             [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "weight_multiplier":1.0, "visual_description":"", "era_implication":"" } ],
    "fasteners":             [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "weight_multiplier":1.0, "hard_negative":false, "visual_description":"", "era_implication":"" } ],
    "joinery":               [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "weight_multiplier":1.0, "hard_negative":false, "visual_description":"", "era_implication":"" } ],
    "hardware":              [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "weight_multiplier":1.0, "hard_negative":false, "visual_description":"", "era_implication":"" } ],
    "conversion_cavities":   [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "weight_multiplier":1.0, "visual_description":"", "structural_implication":"" } ],
    "finish":                [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "weight_multiplier":1.0, "visual_description":"" } ],
    "mechanical_structures": [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "form_signature":"", "visual_description":"", "implied_form":"" } ]
  },
  "mechanical_form_signature": "",
  "primary_wood_observed": "",
  "secondary_wood_observed": "",
  "broad_form_impression": "",
  "condition_impression": "excellent|good|fair|poor",
  "anomalies_noted": []
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;

    // ── Call Claude — with fallback retry ──────────────────────
    let rawResult = null;
    let rawResponseText = "";
    try {
      rawResult = await this.callClaude(sys, [
        ...this.imgs(images),
        { type: "text", text: "Scan all submitted images. Report only what you can actually see. Respond ONLY in valid JSON starting with {." },
      ]);
      // callClaude already retries once on parse failure and tags ok:false on error
    } catch(e) {
      console.error("[NCW P0] callClaude threw:", e.message);
      rawResult = { ok: false, error_type: "runtime_error", error_message: e.message, raw_response: "" };
    }

    // ── Tolerance layer ────────────────────────────────────────
    // callClaude returns { ok: false, ... } on API or parse error.
    // If ok === false, attempt recovery from raw_response text if present.
    if (rawResult.ok === false) {
      const rawText = rawResult.raw_response || "";
      console.warn("[NCW P0] callClaude returned ok:false. Type:", rawResult.error_type, "— attempting partial recovery from raw text.");
      rawResponseText = rawText;

      // Try to extract JSON from raw text (may be wrapped in prose or partial)
      let recovered = null;
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) recovered = JSON.parse(jsonMatch[0]);
      } catch(_e) { /* recovery attempt failed */ }

      if (!recovered) {
        console.warn("[NCW P0] Partial recovery failed. Returning safe empty result. Pipeline continues with low-confidence caps.");
        return safeEmpty(`callClaude error: ${rawResult.error_type} — ${rawResult.error_message}`, rawText);
      }

      // Recovery succeeded — continue with recovered object
      rawResult = recovered;
      console.info("[NCW P0] Partial recovery succeeded from raw text.");
    }

    // ── Normalize the parsed result ────────────────────────────
    const observationsByType = recoverObservations(rawResult, images);

    if (!observationsByType) {
      console.warn("[NCW P0] recoverObservations returned null — no usable observations. Returning safe empty result.");
      return safeEmpty("No observations field found in response", rawResponseText);
    }

    // ── Count and flag hard negatives ──────────────────────────
    const HARD_NEG_CLUES = new Set(["phillips_screw","plywood_structural","plywood_drawer_bottom","particle_board","mdf","modern_concealed_hinge","staple_fastener"]);
    const hardNegativesDetected = [];
    let totalObs = 0;

    for (const [typeName, obsArr] of Object.entries(observationsByType as Record<string, any[]>)) {
  for (const obs of (Array.isArray(obsArr) ? obsArr : [])) {
        totalObs++;
        if (HARD_NEG_CLUES.has(obs.clue) && obs.visual_confidence >= 40) {
          hardNegativesDetected.push({
            clue_key:           obs.clue,
            visual_confidence:  obs.visual_confidence,
            effective_confidence: (obs.visual_confidence / 100) * obs.weight_multiplier,
            region_label:       obs.image_region || null,
            source_image_id:    obs.source_image  || null,
          });
        }
      }
    }

    // ── Assemble canonical output ──────────────────────────────
    const recoveryUsed = !!(
  (rawResult as any)._recovery ||
  Object.values(observationsByType as Record<string, any[]>)
    .flat()
    .some((o: any) => o._recovered)
);
    if (recoveryUsed) console.info(`[NCW P0] Recovery normalization applied. Total observations recovered: ${totalObs}`);

    return {
      skipped:                false,
      phase_0_status:         totalObs > 0 ? "ok" : "no_observations_found",
      recovery_used:          recoveryUsed,
      total_observations:     totalObs,
      observations_by_type:   observationsByType,
      hard_negatives_detected:hardNegativesDetected,
      images_scanned:         images.filter(i => i.data_url).length,
      scan_summary:           rawResult.scan_summary || { scan_confidence: totalObs > 0 ? "low" : "none", images_scanned:[], image_quality_issues:[], total_observations: totalObs, hard_negatives_found: hardNegativesDetected.map(h => h.clue_key) },
      mechanical_form_signature: rawResult.mechanical_form_signature || "",
      primary_wood_observed:  rawResult.primary_wood_observed   || "",
      secondary_wood_observed:rawResult.secondary_wood_observed || "",
      broad_form_impression:  rawResult.broad_form_impression   || rawResult.mechanical_form_signature || "",
      condition_impression:   rawResult.condition_impression    || "unknown",
      anomalies_noted:        rawResult.anomalies_noted         || [],
      created_by_stage:       "phase_0_visual_scan",
      non_destructive:        true,
    };
  },


  // ─────────────────────────────────────────────────────────────
  // PHASE 0b — Targeted Visual Scanner
  // Called by each reasoning phase (p2–p5) for its own evidence
  // category. Sends only the relevant images and a tight,
  // category-specific prompt. Returns structured observations
  // that are MERGED with the full scan results before scoring.
  //
  // This implements the "Both" strategy:
  //   Phase 0  = broad full scan — catches everything visible
  //   Phase 0b = targeted follow-up — goes deeper on one category
  //              using the phase's specific knowledge
  //
  // Low-confidence rule: visual_confidence < 60 → weight_multiplier ×0.5,
  // flag as low_confidence. Observation is still recorded and scored.
  // ─────────────────────────────────────────────────────────────
  async p0_targeted(images, category, existingObs, context) {
    // Select relevant images for this category
    const categoryImageMap = {
      toolmarks:          ["underside","back","joinery_closeup"],
      fasteners:          ["underside","back","joinery_closeup","hardware_closeup"],
      joinery:            ["joinery_closeup","underside"],
      construction:       ["joinery_closeup","underside","back"],
      hardware:           ["hardware_closeup","overall_front","overall_side"],
      hidden_structure:   ["underside","overall_side","overall_front"],
      finish:             ["overall_front","hardware_closeup"],
    };
    const relevantTypes = categoryImageMap[category] || [];
    const targetImages  = images.filter(i => relevantTypes.includes(i.image_type) && i.data_url);
    if (targetImages.length === 0) return { skipped: true, category, skip_reason: "No relevant images for this category", new_observations: [] };

    // Category-specific clue definitions
    const categoryClues = {
      toolmarks: [
        { clue:"pit_saw_marks",           look_for:"Irregular diagonal or vertical straight lines, rough texture, slight waviness. Pre-1830.", hard_negative:false },
        { clue:"circular_saw_arcs",       look_for:"Curved arc marks in consistent radius patterns. Post-1830, strong post-1840.", hard_negative:false },
        { clue:"band_saw_lines",          look_for:"Very fine, straight, closely-spaced parallel lines. Post-1870.", hard_negative:false },
        { clue:"hand_plane_chatter",      look_for:"Subtle regular ridges or scallop patterns across grain direction. Any era.", hard_negative:false },
        { clue:"machine_routing_uniform", look_for:"Perfectly uniform routed profile, consistent depth, smooth walls on moldings. Post-1900.", hard_negative:false },
      ],
      fasteners: [
        { clue:"hand_forged_nail",       look_for:"Irregular hammered head, not perfectly round. Shank tapers on all four sides. Pre-1800.", hard_negative:false },
        { clue:"cut_nail",               look_for:"Rectangular cross-section, flat rectangular head, tapers on two sides only. 1790–1890.", hard_negative:false },
        { clue:"wire_nail",              look_for:"Round shank, circular head, perfectly cylindrical. Post-1880.", hard_negative:false },
        { clue:"slotted_handmade_screw", look_for:"Off-center slot, irregular thread pitch, blunt or tapered tip. 1770–1840.", hard_negative:false },
        { clue:"slotted_machine_screw",  look_for:"Centered slot, uniform threads, sharp point, perfectly round head. Post-1840.", hard_negative:false },
        { clue:"phillips_screw",         look_for:"Cross-shaped X recess in head. HARD NEGATIVE — post-1930.", hard_negative:true },
        { clue:"staple_fastener",        look_for:"U-shaped wire staple driven into wood. HARD NEGATIVE — post-1945.", hard_negative:true },
      ],
      joinery: [
        { clue:"hand_cut_dovetails",          look_for:"Dovetails with slightly irregular pin spacing, varying angles, subtle hand-cut variation. Knife scribe lines may be visible. Pre-1860.", hard_negative:false },
        { clue:"machine_dovetails",           look_for:"Perfectly uniform pin spacing, identical angles, machine-perfect regularity. Post-1860.", hard_negative:false },
        { clue:"mortise_and_tenon",           look_for:"Rectangular peg-in-slot at frame corners. May show wooden pegs or wedges. 1600–1900.", hard_negative:false },
        { clue:"dowel_joinery",               look_for:"Round wooden pegs at joint faces, perfectly round holes. Post-1900.", hard_negative:false },
        { clue:"solid_board_drawer_bottom",   look_for:"Single solid board chamfered at edges, grain runs side to side, may show shrinkage cracks. Pre-1920.", hard_negative:false },
        { clue:"plywood_drawer_bottom",       look_for:"Laminated layers visible at drawer bottom edge. HARD NEGATIVE — post-1920.", hard_negative:true },
        { clue:"frame_and_panel",             look_for:"Floating panel within grooved frame, panel edges visible in groove. Any era.", hard_negative:false },
        { clue:"butt_joint_screwed",          look_for:"Simple flat joint held with screws only, no interlocking. Modern indicator.", hard_negative:false },
      ],
      hardware: [
        { clue:"victorian_strap_hinge",     look_for:"Long decorative strap hinge, Gothic or Victorian revival styling, pointed ends, ornate surface detail. 1865–1895.", hard_negative:false },
        { clue:"batwing_brass_pull",        look_for:"Bat-wing shaped brass bail pull with rosette backplate. HIGH replacement risk — note any oxidation or hole mismatch. 1720–1790.", hard_negative:false },
        { clue:"eastlake_pull",             look_for:"Geometric brass pull, incised angular decoration, machined surface ornament. 1870–1890.", hard_negative:false },
        { clue:"porcelain_caster",          look_for:"White ceramic or porcelain wheel on metal fork bracket. Not rubber, not metal wheel. 1830–1870.", hard_negative:false },
        { clue:"wood_caster",               look_for:"Turned wooden wheel caster. 1800–1840.", hard_negative:false },
        { clue:"surface_lock",              look_for:"Surface-mounted lock plate with visible keyhole. 1750–present.", hard_negative:false },
        { clue:"modern_concealed_hinge",    look_for:"Cup-style hinge recessed into door face. Circular cup mortise. HARD NEGATIVE — post-1950.", hard_negative:true },
        { clue:"phillips_in_hardware_mount",look_for:"Phillips screw visible in hardware mounting hole — hard negative for antique hardware originality.", hard_negative:true },
        { clue:"filled_pull_holes",         look_for:"Plugged or filled screw holes visible beside or near current hardware — indicates replacement.", hard_negative:false },
        { clue:"hardware_shadow_mismatch",  look_for:"Ghost outline or shadow of previous hardware that does not match current hardware shape — indicates replacement.", hard_negative:false },
      ],
      hidden_structure: [
        { clue:"pedal_cavity_structure",  look_for:"Rectangular void or cavity at base consistent with foot pedals — typically full-width, 6–10 inches deep, may show bellows mount points or pedal pivot hardware. 1850–1920.", hard_negative:false },
        { clue:"treadle_mount",           look_for:"Iron bracket holes, pivot points, or reinforced lower frame for treadle mechanism. 1860–1910.", hard_negative:false },
        { clue:"ice_chamber",             look_for:"Lined interior compartment, thick walls, metal liner, drain fitting. Upper ice, lower food. 1880–1920.", hard_negative:false },
        { clue:"structural_void",         look_for:"Unexplained void, cavity, or dead space inconsistent with current form — suggests removed mechanism.", hard_negative:false },
        { clue:"removed_mechanism_ghost", look_for:"Mounting holes, wear patterns, hardware shadows, or routed channels indicating a removed original mechanism.", hard_negative:false },
        { clue:"incompatible_top_surface",look_for:"Surface material or profile visually inconsistent with the base — different wood aging, different style era, added marble/glass.", hard_negative:false },
      ],
      finish: [
        { clue:"shellac_crazing",    look_for:"Fine crackle or alligator pattern in amber/orange surface film. 1800–1920.", hard_negative:false },
        { clue:"shellac_intact",     look_for:"Smooth amber/orange surface with slight sheen, no crackle. 1800–1920.", hard_negative:false },
        { clue:"oil_finish_patina",  look_for:"Deep mellow glow, no surface film, grain fully visible, no sheen. Any era.", hard_negative:false },
        { clue:"milk_paint",         look_for:"Opaque matte surface, chalky texture, often chipped or worn through to wood. 1700–1900.", hard_negative:false },
        { clue:"polyurethane",       look_for:"Plastic-like surface sheen, possible orange-peel texture, may peel or chip at edges. HARD NEGATIVE for original finish. Post-1960.", hard_negative:true },
        { clue:"painted_over_original",   look_for:"Brush strokes over original finish visible at edges, chips, or worn areas.", hard_negative:false },
        { clue:"refinished_surface", look_for:"Uniform new finish obscuring age patina, no wear at natural contact points (edges, handles, feet).", hard_negative:false },
      ],
    };

    const clues = categoryClues[category] || [];
    if (clues.length === 0) return { skipped: true, category, skip_reason: "No clue definitions for category", new_observations: [] };

    // Summarize what the full scan already found for this category
    const alreadyFound = (existingObs[category] || [])
      .map(o => `${o.clue} (confidence ${o.visual_confidence}, region: ${o.image_region || "unspecified"})`)
      .join("; ") || "none detected in full scan";

    const clueList = clues.map(c =>
      `• ${c.clue}${c.hard_negative ? " ⚠ HARD NEGATIVE" : ""}\n  LOOK FOR: ${c.look_for}`
    ).join("\n\n");

    const sys = `You are the Targeted Visual Scanner for the NCW American Furniture Identification Engine.
You are performing a FOCUSED re-examination of specific images for one evidence category: ${category.toUpperCase()}.

This is the second pass of a two-pass visual system:
• Pass 1 (Phase 0 full scan): broad sweep of all categories across all images
• Pass 2 (this scan): deep focused examination of ${category} evidence in relevant images only

YOUR TASK
Look carefully at the submitted image(s) and report ONLY ${category} evidence.
Be more precise than the full scan. Note exact locations. Describe what you see in forensic detail.

WHAT THE FULL SCAN ALREADY FOUND FOR ${category.toUpperCase()}:
${alreadyFound}
Do NOT simply repeat the same observations. Look for additional detail, confirm or refute findings,
or identify evidence the full scan may have missed.

CLUES TO SCAN FOR:
${clueList}

CONFIDENCE SCORING (0–100):
• 80–100: Unmistakably visible — clear identifying features present
• 60–79:  Clearly visible but minor ambiguity (lighting, angle, partial view)
• 40–59:  Probably present but unclear — APPLY ×0.5 weight, flag as low_confidence
• 20–39:  Possibly present — APPLY ×0.5 weight, flag as low_confidence
• below 20: Do NOT report — insufficient signal

WEIGHT MULTIPLIER RULES:
• Default: 1.0
• visual_confidence < 60: override to 0.5, set low_confidence_flag = true
• Image blurry or out of focus: reduce by additional 0.2
• Clue only partially visible: reduce by 0.1
• Hard negative clue: always report if confidence > 20, apply ×1.0 (never discount hard negatives)

REGION LABEL: Be specific. Examples:
"lower left corner", "center of drawer face", "right hinge mount area",
"entire underside surface", "top right quadrant of back panel"

IMAGE QUALITY: If an image is too blurry, dark, or obstructed to read this category reliably,
set image_quality to "poor" and note why. Still attempt to report any visible clues.

CONSERVATIVE RULE: Only report what you can actually see.
Do not report evidence because the form type commonly has it.
A low-confidence observation is more useful than a fabricated one.

Additional context from prior phases: ${context || "none"}

Respond ONLY in valid JSON:
{
  "category": "${category}",
  "images_examined": [],
  "image_quality_notes": "",
  "new_observations": [
    {
      "clue": "",
      "source_image": "",
      "image_region": "",
      "visual_confidence": 0,
      "low_confidence_flag": false,
      "weight_multiplier": 1.0,
      "effective_confidence": 0,
      "hard_negative": false,
      "visual_description": "",
      "era_implication": "",
      "confirms_full_scan": true,
      "notes": ""
    }
  ],
  "full_scan_corrections": [
    {
      "original_clue": "",
      "correction": "confirms|refutes|adds_detail",
      "note": ""
    }
  ],
  "targeted_summary": ""
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;

    const imgContent = [];
    for (const img of targetImages) {
      const [h, b] = img.data_url.split(",");
      const mt = h.match(/data:(.*?);/)[1] || "image/jpeg";
      imgContent.push({ type:"image", source:{ type:"base64", media_type:mt, data:b } });
      imgContent.push({ type:"text",  text:`[Image: ${img.image_type}]` });
    }
    imgContent.push({ type:"text", text:`Perform targeted ${category} scan. Report only what you actually see.` });

    const result = await this.callClaude(sys, imgContent);

    // Write new targeted observations to case_observations via API
    if (Array.isArray(result.new_observations) && result.new_observations.length > 0 && context.caseId) {
      for (const obs of result.new_observations) {
        if (!obs.clue || obs.visual_confidence < 20) continue;
        const libEntry = this.VISUAL_LIBRARY.find(c => c.clue_key === obs.clue);
        API.addObservation(context.caseId, {
          observation_type:    category,
          reference_table:     libEntry.reference_table || null,
          reference_id:        obs.clue,
          observed_value_text: obs.visual_description || obs.clue,
          source_image_id:     obs.source_image,
          raw_confidence:      obs.visual_confidence / 100,
          weight_multiplier:   obs.weight_multiplier,
          is_hidden_surface:   (libEntry && libEntry.is_hidden_surface != null) ? libEntry.is_hidden_surface : false,
          region_label:        obs.image_region || null,
          created_by_stage:    `phase_0b_targeted_${category}`,
          image_quality:       result.image_quality_notes ? "flagged" : "ok",
        });
      }
    }

    return result;
  },

  // Helper: merge full scan + targeted scan observations for a category
  mergeVisualObs(fullScanObs, targetedResult, category) {
    const full     = fullScanObs[category] || [];
    const targeted = targetedResult.new_observations || [];

    // Build a map of existing clue keys from full scan
    const fullKeys = new Set(full.map(o => o.clue));

    // Add targeted observations that are new or have higher confidence
    const merged = [...full];
    for (const t of targeted) {
      if (!t.clue || t.visual_confidence < 20) continue;
      if (!fullKeys.has(t.clue)) {
        // New clue found in targeted scan — add it
        merged.push(t);
      } else {
        // Clue already in full scan — if targeted has higher confidence, upgrade
        const existing = merged.find(o => o.clue === t.clue);
        if (existing && t.visual_confidence > existing.visual_confidence) {
          existing.visual_confidence  = t.visual_confidence;
          existing.weight_multiplier  = t.weight_multiplier;
          existing.image_region       = t.image_region || existing.image_region;
          existing.visual_description = t.visual_description || existing.visual_description;
          existing.low_confidence_flag= t.low_confidence_flag;
          existing.source             = "targeted_scan_upgraded";
        }
      }
    }
    return merged;
  },
  async p1(caseData, images, intake, p0) {
    const imageTypesPresent = images.map(i => i.image_type);
    const sys = `You are the Intake Controller for the NCW American Furniture Identification Engine.
Scope: American furniture, 1600–present.

PURPOSE
Inventory all submitted evidence. Apply confidence caps. Set downstream phase triggers.
Do NOT assign any positive scoring — this phase constrains later phases only.

EVIDENCE CATEGORIES — assess each as present | partial | absent:
• overall_form_view        — overall_front or overall_side image present
• underside_hidden_surface — underside showing saw marks, nails, unfinished wood
• hardware_closeup         — dedicated hardware image (hinges, pulls, locks, casters)
• joinery_drawer_construction — joinery_closeup showing dovetails or drawer corners
• interior_structure       — interior view showing shelves, cavities, or mechanism remnants
• finish_closeup           — close view of surface finish or patina
• back_board               — back panel showing secondary wood and tool marks

EVIDENCE SUFFICIENCY:
• High     — 4+ categories present including underside + joinery
• Moderate — 2–3 categories present
• Low      — only overall shot(s), no structural evidence

CONFIDENCE CAP RULES (a cap can only LOWER a band, never raise it):
• underside_hidden_surface absent            → date_confidence_cap = "Moderate"
• joinery_drawer_construction absent         → construction_confidence_cap = "Moderate"
• hardware_closeup absent                    → hardware_originality_cap = "Low"
• interior_structure absent AND complex case piece suspected → form_confidence_cap = "Moderate"
• only one overall photo, nothing structural → overall_confidence_cap = "Low"
• evidence_sufficiency = "Low"              → valuation_confidence_cap = "Low"

PHASE TRIGGER RULES:
• run_dating_grid  — true if underside OR joinery_closeup OR back_board visible
• run_form_engine  — true if overall_front OR overall_side OR interior_structure visible
• run_construction — true if joinery_closeup OR back_board OR underside visible
• run_hardware     — true if hardware_closeup visible OR hardware apparent in any overall shot

Image types submitted: ${JSON.stringify(imageTypesPresent)}

Respond ONLY in valid JSON, no markdown fences:
{
  "visible_image_types": [],
  "evidence_inventory": {
    "overall_form_view": "present|partial|absent",
    "underside_hidden_surface": "present|partial|absent",
    "hardware_closeup": "present|partial|absent",
    "joinery_drawer_construction": "present|partial|absent",
    "interior_structure": "present|partial|absent",
    "finish_closeup": "present|partial|absent",
    "back_board": "present|partial|absent"
  },
  "evidence_sufficiency": "Moderate",
  "missing_critical_evidence": [],
  "image_quality_notes": "",
  "user_stated_category": null,
  "broad_form_guess": null,
  "visible_primary_wood": null,
  "visible_secondary_wood": null,
  "overall_condition": "good",
  "red_flags": [],
  "confidence_caps": {
    "date_confidence_cap": "none",
    "construction_confidence_cap": "none",
    "hardware_originality_cap": "none",
    "form_confidence_cap": "none",
    "overall_confidence_cap": "none",
    "valuation_confidence_cap": "none"
  },
  "phase_triggers": {
    "run_dating_grid": true,
    "run_form_engine": true,
    "run_construction": true,
    "run_hardware": true
  },
  "proceed_recommendation": "proceed"
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    let p1raw;
    try {
      p1raw = await this.callClaude(sys, [
        ...this.imgs(images),
        { type: "text", text: `Visual Scanner observations (Phase 0): ${JSON.stringify(p0.scan_summary || {})}\nImage quality issues: ${JSON.stringify(p0.scan_summary.image_quality_issues || [])}\nIntake answers: ${JSON.stringify(intake)}\nUser notes: ${caseData.notes_from_user || "none"}` },
      ]);
    } catch(callErr) {
      console.warn("[NCW P1] callClaude threw:", callErr.message, "— routing to fallback");
      p1raw = { ok:false, error_type:"call_threw", error_message: callErr.message, raw_response:"" };
    }
    console.info("[NCW P1] raw callClaude ok:", p1raw && p1raw.ok,
      "| type:", typeof p1raw,
      "| keys:", p1raw ? Object.keys(p1raw).join(", ") : "null",
      "| raw_response_len:", (p1raw && p1raw.raw_response || "").length);
    const p1normalized = this.normalize(p1raw, "p1_intake");
    console.info("[NCW P1] after normalize ok:", p1normalized && p1normalized.ok,
      "| evidence_sufficiency:", p1normalized && p1normalized.evidence_sufficiency);
    // ── Self-tolerant fallback: if still ok:false, synthesize from available images ──
    if (!p1normalized || p1normalized.ok === false) {
      console.warn("[NCW P1] Normalize failed — synthesizing safe p1 from image types");
      const imageTypes = new Set(images.map(function(i){ return i.image_type; }));
      return {
        ok: true,
        _synthesized: true,
        visible_image_types:    Array.from(imageTypes),
        evidence_inventory: {
          overall_form_view:          (imageTypes.has("overall_front")||imageTypes.has("overall_side")) ? "present" : "absent",
          underside_hidden_surface:   imageTypes.has("underside")       ? "present" : "absent",
          hardware_closeup:           imageTypes.has("hardware_closeup") ? "present" : "absent",
          joinery_drawer_construction:imageTypes.has("joinery_closeup")  ? "present" : "absent",
          interior_structure:         imageTypes.has("interior")         ? "present" : "absent",
          finish_closeup:             imageTypes.has("finish_closeup")   ? "present" : "absent",
          back_board:                 imageTypes.has("back")             ? "present" : "absent",
        },
        evidence_sufficiency:  images.length >= 3 ? "Moderate" : "Low",
        missing_critical_evidence: [],
        image_quality_notes:   "Synthesized from available images — P1 LLM call failed",
        user_stated_category:  intake.user_category_guess || null,
        broad_form_guess:      intake.user_category_guess || null,
        visible_primary_wood:  null,
        visible_secondary_wood:null,
        overall_condition:     "unknown",
        red_flags:             [],
        confidence_caps: { date_confidence_cap:"none", construction_confidence_cap:"none", hardware_originality_cap:"none", form_confidence_cap:"none", overall_confidence_cap:"none", valuation_confidence_cap:"none" },
        phase_triggers: { run_dating_grid:true, run_form_engine:true, run_construction:true, run_hardware:true },
        folds_or_expands:    false,
        mechanical_parts:    false,
        conversion_possible: false,
        has_drawers:         false,
        has_doors:           false,
        proceed_recommendation: "proceed",
        _debug: {
          raw_phase1_response:    (p1raw && p1raw.raw_response) || "",
          normalized_phase1_payload: "fallback — LLM call failed",
          validation_result:      "fallback_synthesized",
        },
        raw_response: (p1raw && p1raw.raw_response) || "",
      };
    }
    // Attach debug fields to successful normalized result
    p1normalized._debug = {
      raw_phase1_response:    (p1raw && p1raw.raw_response) || (p1raw && JSON.stringify(p1raw).slice(0,300)) || "",
      normalized_phase1_payload: "ok",
      validation_result:      "normalized",
    };
    return p1normalized;
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 2 — Rapid Dating Grid
  // Trigger: run_dating_grid = true
  // Reads from p0 visual observations first.
  // Style is ignored except as tie-breaker when structural weak.
  // ─────────────────────────────────────────────────────────────
  async p2(caseData, images, p0, p1) {
    const sys = `You are the Rapid Dating Grid engine for the NCW American Furniture Identification Engine.
Scope: American furniture, 1600–present.

${this.wmSummary()}

PURPOSE
Build an initial date band by intersecting physical clue era windows.
IGNORE decorative style except as tie-breaker when Tier A–D evidence is weak.

SCORING — use these exact values from the WM clue table:

TIER: toolmarks (weight ${WM.tiers.toolmarks})
• pit_saw_marks           → age_support +12, era pre-1830
• circular_saw_arcs       → age_support +10, era post-1830 (strong post-1840)
• band_saw_lines          → age_support +10, era post-1870
• hand_plane_chatter      → age_support +4, era any
• machine_routing_uniform → age_support +8, era post-1900

TIER: fasteners (weight ${WM.tiers.fasteners})
• hand_forged_nail        → age_support +10, era 1600–1800
• cut_nail                → age_support +10, era 1790–1890
• wire_nail               → age_support +10, era post-1880
• slotted_handmade_screw  → age_support +10, era 1770–1840
• slotted_machine_screw   → age_support +6,  era post-1840
• phillips_screw (original) → age_opposing +${Math.abs(WM.negative_rules.phillips_screw_pre1930)} — HARD NEGATIVE for any pre-1930 claim
• staple_fastener         → age_opposing +${Math.abs(WM.negative_rules.staple_fastener)} — HARD NEGATIVE

TIER: construction (weight ${WM.tiers.construction})
• hand_cut_dovetails      → age_support +10, era pre-1860
• machine_dovetails       → age_support +10, era post-1860
• mortise_and_tenon       → age_support +8,  era 1600–1900

TIER: materials (weight ${WM.tiers.materials})
• poplar secondary        → age_support +5, era 19th century
• gumwood secondary       → age_support +4, era 1880–1940
• plywood structural      → age_opposing +${Math.abs(WM.negative_rules.plywood_pre1905)} — HARD NEGATIVE eliminates pre-1905
• particle_board          → age_opposing +${Math.abs(WM.negative_rules.particle_board)} — HARD NEGATIVE eliminates antique
• MDF                     → age_opposing +${Math.abs(WM.negative_rules.mdf)} — HARD NEGATIVE eliminates antique

TIER: finish (weight ${WM.tiers.finish})
• shellac                 → age_support +4, era 1800–1920
• oil_finish              → age_support +2, era any
• polyurethane (original) → age_opposing +10

DATE RANGE LOGIC:
1. List every clue observed with confidence score (0–100).
2. Record each clue's era window.
3. Intersect all Tier A–D windows → primary_date_range.
4. Hard negatives OVERRIDE supporting evidence — if triggered, state what era is eliminated.
5. Tier G–I clues narrow further only.

CONFLICT: If 2+ Tier A–D clues produce non-overlapping date ranges → set dating_conflict flag, lower confidence to Low.

CONFIDENCE:
• High     — 4+ Tier A–D clues align in narrow range, no conflict
• Moderate — 2–3 clues align, minor conflict, or only 1 strong clue
• Low      — 1 clue only, major conflict, or hard negative present
Apply date_confidence_cap from Phase 1 if it lowers the result.

Phase 1 output: ${JSON.stringify(p1)}

Respond ONLY in valid JSON:
{
  "toolmark_observations":  [{"clue":"","confidence":0,"age_support":0,"age_opposing":0,"era_window":"","notes":""}],
  "fastener_observations":  [{"clue":"","confidence":0,"age_support":0,"age_opposing":0,"era_window":"","notes":""}],
  "joinery_observations":   [{"clue":"","confidence":0,"age_support":0,"age_opposing":0,"era_window":"","notes":""}],
  "material_observations":  [{"clue":"","confidence":0,"age_support":0,"age_opposing":0,"era_window":"","notes":""}],
  "finish_observations":    [{"clue":"","confidence":0,"age_support":0,"age_opposing":0,"notes":""}],
  "age_support_points":     0,
  "age_opposing_points":    0,
  "hard_negatives_triggered": [],
  "era_intersection_logic": "",
  "primary_date_range":     "",
  "earliest_possible_year": 1600,
  "latest_possible_year":   2025,
  "key_dating_evidence":    [],
  "negative_evidence_applied": [],
  "dating_conflicts":       [],
  "dating_confidence":      "Moderate",
  "caps_applied":           []
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    // Phase 2 uses images for context but reads clues primarily from p0 observations.
    // First run a targeted toolmark/fastener scan, then merge with full scan results.
    const targeted = await this.p0_targeted(
      images,
      "toolmarks",
      p0.observations_by_type,
      { caseId: caseData.id, phase: "dating_grid" }
    );
    const targetedFasteners = await this.p0_targeted(
      images,
      "fasteners",
      p0.observations_by_type,
      { caseId: caseData.id, phase: "dating_grid" }
    );
    const mergedToolmarks = Array.isArray((targeted || {}).new_observations)
      ? this.mergeVisualObs(p0.observations_by_type, targeted, "toolmarks")
      : (Array.isArray((p0.observations_by_type || {}).toolmarks) ? p0.observations_by_type.toolmarks : []);
    const mergedFasteners = Array.isArray((targetedFasteners || {}).new_observations)
      ? this.mergeVisualObs(p0.observations_by_type, targetedFasteners, "fasteners")
      : (Array.isArray((p0.observations_by_type || {}).fasteners) ? p0.observations_by_type.fasteners : []);
    const visualObs = { ...(p0.observations_by_type || {}), toolmarks: mergedToolmarks, fasteners: mergedFasteners };

    let p2raw;
    try {
      p2raw = await this.callClaude(sys, [
        ...this.imgs(images),
        { type: "text", text: `VISUAL SCANNER OBSERVATIONS (full scan + targeted re-examination — use as primary evidence):\nToolmarks: ${JSON.stringify(mergedToolmarks)}\nFasteners: ${JSON.stringify(mergedFasteners)}\nJoinery: ${JSON.stringify(visualObs.joinery||[])}\nFinish: ${JSON.stringify(visualObs.finish||[])}\nHard negatives found: ${JSON.stringify(p0.scan_summary.hard_negatives_found||[])}\nTargeted toolmark summary: ${targeted.targeted_summary||""}\nTargeted fastener summary: ${targetedFasteners.targeted_summary||""}\n\nPhase 1 (Intake): ${JSON.stringify(p1)}` },
      ]);
    } catch(callErr) {
      console.warn("[NCW P2] callClaude threw:", callErr.message, "— using fallback");
      p2raw = { ok:false, error_type:"call_threw", error_message: callErr.message, raw_response:"" };
    }

    console.info("[NCW P2] callClaude ok:", p2raw && p2raw.ok,
      "| error_type:", (p2raw && p2raw.error_type) || "none",
      "| raw_preview:", (p2raw && p2raw.raw_response || "").slice(0, 80));

    // If the network call failed, synthesize a minimal safe p2 from available evidence
    if (!p2raw || p2raw.ok === false) {
      console.warn("[NCW P2] Synthesizing safe fallback p2");
      const hasUndersideObs = (mergedToolmarks.length + mergedFasteners.length) > 0;
      return {
        ok: true,
        _synthesized: true,
        _raw_phase2_response_preview: (p2raw && p2raw.raw_response || "").slice(0, 200),
        phase2_json_extracted: false,
        phase2_schema_valid:   false,
        toolmark_observations:     mergedToolmarks,
        fastener_observations:     mergedFasteners,
        joinery_observations:      [],
        material_observations:     [],
        finish_observations:       [],
        primary_date_range:        hasUndersideObs ? "Date uncertain — engine unavailable" : "Date uncertain — engine unavailable",
        earliest_possible_year:    1800,
        latest_possible_year:      1975,
        dating_confidence:         "Low",
        key_dating_evidence:       mergedToolmarks.slice(0,3).map(o => o.clue || ""),
        negative_evidence_applied: [],
        hard_negatives_triggered:  [],
        dating_conflicts:          [],
        caps_applied:              [],
        era_intersection_logic:    "Synthesized from image observations — P2 LLM call failed",
        age_support_points:        0,
        age_opposing_points:       0,
        new_observations:          [],
        candidates:                [],
        eliminated:                [],
        confidence_adjustments:    [],
      };
    }

    const p2normalized = this.normalize(p2raw, "p2_dating");

    // Guarantee schema completeness on the normalized result
    if (!Array.isArray(p2normalized.new_observations))       p2normalized.new_observations = [];
    if (!Array.isArray(p2normalized.candidates))             p2normalized.candidates = [];
    if (!Array.isArray(p2normalized.eliminated))             p2normalized.eliminated = [];
    if (!Array.isArray(p2normalized.confidence_adjustments)) p2normalized.confidence_adjustments = [];
    p2normalized._raw_phase2_response_preview = (p2raw.raw_response || "").slice(0, 200);
    p2normalized.phase2_json_extracted = true;
    p2normalized.phase2_schema_valid   = true;

    return p2normalized;
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 3 — Form Decision Engine
  // Trigger: run_form_engine = true
  // Most credibility-critical phase. Three separate determinations.
  // ─────────────────────────────────────────────────────────────
  async p3(caseData, images, p0, p1, p2) {
    const forms = DB.forms
      .map(f => `${f.name} [${f.parent_category}, ${f.common_eras}${f.common_conversion_targets ? ` → converts to: ${f.common_conversion_targets}` : ""}]`)
      .join("\n");
    const sys = `You are the Form Decision Engine for the NCW American Furniture Identification Engine.
THIS IS THE MOST CREDIBILITY-CRITICAL PHASE. Three separate determinations required.

${this.wmSummary()}

AVAILABLE FORMS:
${forms}

FORM DETECTION — RUN FIRST, BEFORE SCORING
Inspect the images for structural mechanisms and form signatures before any style or category analysis.
These signatures identify furniture form with higher certainty than proportion or appearance alone.

STEP 1 — MECHANICAL FORM SIGNATURES (check in order):
If ANY of these are clearly visible, classify that specific form and record it as form_detection_method = "mechanical_signature":

DROP-LEAF & GATE TABLE FAMILY:
• hinged leaves + visible gateleg or swing support       → "gateleg drop-leaf table"
• hinged leaves + swing leg (no gate frame)              → "pembroke table"
• hinged leaves + butterfly bracket visible              → "butterfly drop-leaf table"
• hinged leaves visible, support not identified          → "drop-leaf table"

CHEST / TRUNK FAMILY:
• hinged or removable top/lid + till or interior visible → "blanket chest"
• hinged or lift top, no till                            → "storage chest or trunk"

DESK FAMILY:
• angled fall-front writing surface                      → "slant-front desk"
• cylinder roll or tambour shutter over writing surface  → "rolltop desk"
• flat fall-front panel + pigeonhole interior visible    → "secretary desk"
• flat fall-front only                                   → "fall-front desk"

PEDESTAL TABLE FAMILY:
• single central column + tilt hardware visible          → "tilt-top table"
• single central column + tripod legs                   → "tripod pedestal table"
• single central column + platform base                 → "pedestal table"

SPECIALIZED:
• pedal cavity void at base                              → "pump organ cabinet" (likely converted)
• treadle iron bracket mount                             → "sewing machine cabinet"
• zinc/metal-lined interior chamber                      → "icebox"
• adjustable angled shelf/rack                           → "music stand or Canterbury"

STEP 2 — BROAD STRUCTURAL FORM (if no mechanism visible):
Use overall structure and interior logic when no specific mechanism is detected:
• 4+ stacked drawers, no superstructure                 → "chest of drawers"
• 2–3 drawers + mirror mount visible                    → "dresser"
• full-length door(s), tall narrow case                 → "wardrobe"
• raised splash rail + basin shelf                      → "washstand"
• door + drawer combination, case piece                 → appropriate case piece form

STEP 3 — RECORD DETECTION METHOD:
• form_detection_method = "mechanical_signature" — form driven by a specific mechanism (Steps above)
• form_detection_method = "structural_logic"     — form driven by proportions and interior layout
• form_detection_method = "visual_impression"    — form suggested by overall appearance only (weakest)
• mechanical_signature_detected = the specific clue name, or null

Only fall back to broad labels like "table" or "cabinet" when no more specific form can be justified.
Always prefer the narrowest defensible furniture form.

PURPOSE — three independent determinations, do NOT collapse:
1. current_form  — what the object is being used as NOW
2. original_form — what it was originally built as
3. conversion_probability — how likely the form has changed

SCORING — Tier: interior_logic (weight ${WM.tiers.interior_logic}):

FORM SUPPORT POINTS:
• Interior structure layout strongly matches known form                    → form_support +15
• Specialized structural cavity matches known mechanism (pedal/treadle/ice)→ form_support +15 AND original_form_support +15
• Overall proportions clearly fit a specific known form                    → form_support +8
• Leg/support structure fits known form pattern                            → form_support +8
• Storage arrangement matches known form                                   → form_support +6
• Decorative elements typical of known form (Tier J, weight ${WM.tiers.style})          → form_support +4 (weak)

CONVERSION SUPPORT POINTS:
• Current surface use/function conflicts with visible structure             → conversion_support +10
• Original mechanism/cavity present but non-functional or removed          → conversion_support +8
• Later incompatible top added (wrong material or era)                     → conversion_support +8
• Current use impossible without blocking original mechanism               → conversion_support +10
• Structural voids or filled areas suggest removed components              → conversion_support +6
• Hardware mounting patterns inconsistent with current form function       → conversion_support +5

FORM OPPOSITION POINTS:
• Proportions do not fit named form                                        → form_opposing +6
• Structure actively contradicts named form                                → form_opposing +10

CONFIDENCE THRESHOLDS:
• form_support ≥ 70  → form_confidence = "High"
• form_support 45–69 → form_confidence = "Moderate"
• form_support < 45  → form_confidence = "Low"

CONVERSION THRESHOLDS:
• conversion_support ≥ 25 → conversion_probability = "High"
• 15–24               → "Moderate"
• < 15                → "Low"

CONFLICT TRIGGER:
If top two form candidates are within 15 points of each other → set form_conflict flag.
If both original_form and current_form independently exceed threshold → set form_conflict flag.
Do NOT collapse — preserve both candidates.

Apply form_confidence_cap from Phase 1.

SCHEMA CONTRACT — REQUIRED FIELDS WITH SAFE DEFAULTS:
You MUST include every field below in your response, even when evidence is incomplete or uncertain.
Never omit a field. If uncertain, use these safe defaults:
• current_form_candidate   → "unknown" (never omit, never leave blank)
• original_form_candidate  → same as current_form_candidate if no conversion evidence, else best guess or "unknown"
• alternate_form_candidates→ [] (empty array is valid)
• form_scoring_detail      → [] (empty array is valid when no evidence available)
• form_support_points      → 0
• form_opposing_points     → 0
• conversion_support_points→ 0
• conversion_opposing_points→ 0
• current_form_score       → 0
• original_form_score      → 0
• is_conversion            → false (default unless evidence supports conversion)
• conversion_evidence      → [] (empty array is valid)
• conversion_probability   → "Low"
• form_confidence          → "Low" (use Low when evidence is insufficient, not omit)
• form_conflicts           → []
• form_reasoning           → "Insufficient evidence to determine form with confidence." (never omit)
• caps_applied             → []

Phase 1: ${JSON.stringify(p1)}
Phase 2: ${JSON.stringify(p2)}

Respond ONLY in valid JSON. Begin with { and end with }. Include every field listed:
{
  "form_detection_method":     "mechanical_signature|structural_logic|visual_impression",
  "mechanical_signature_detected": null,
  "form_scoring_detail": [{"criterion":"","track":"form_support|conversion_support|form_opposing","score":0,"observed":""}],
  "form_support_points":       0,
  "form_opposing_points":      0,
  "conversion_support_points": 0,
  "conversion_opposing_points":0,
  "current_form_candidate":    "unknown",
  "current_form_score":        0,
  "original_form_candidate":   "unknown",
  "original_form_score":       0,
  "alternate_form_candidates": [],
  "is_conversion":             false,
  "conversion_evidence":       [],
  "conversion_probability":    "Low",
  "form_confidence":           "Low",
  "form_conflicts":            [],
  "form_reasoning":            "Insufficient evidence to determine form with confidence.",
  "caps_applied":              []
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    // Targeted scan for hidden_structure — cavities are the most critical form evidence
    const targetedStructure = await this.p0_targeted(
      images,
      "hidden_structure",
      p0.observations_by_type,
      { caseId: caseData.id, phase: "form_decision", prior_form_guess: p0.broad_form_impression }
    );
    const mergedStructure = this.mergeVisualObs(p0.observations_by_type, targetedStructure, "hidden_structure");

    let _raw_p3;
    try {
      _raw_p3 = await this.callClaude(sys, [
      ...this.imgs(images),
      { type: "text", text: `VISUAL SCANNER OBSERVATIONS (full scan + targeted hidden_structure re-examination):\nConversion cavities / hidden structure: ${JSON.stringify(mergedStructure)}\nHardware: ${JSON.stringify(p0.observations_by_type.hardware||[])}\nBroad form impression: ${p0.broad_form_impression||"unknown"}\nTargeted structure summary: ${targetedStructure.targeted_summary||""}\n\nPhase 1: ${JSON.stringify(p1)}\nPhase 2: ${JSON.stringify(p2)}` },
    ]);
    } catch(_e_p3) {
      console.warn("[NCW P3] callClaude threw:", _e_p3.message);
      _raw_p3 = { ok:false, error_type:"call_threw", error_message: _e_p3.message, raw_response:"" };
    }
    if (!_raw_p3 || _raw_p3.ok === false) {
      console.warn("[NCW P3] Returning safe fallback");
      return {
        ok: true, _synthesized: true, _engine_status: "llm_unavailable",
        current_form_candidate: "Unknown", original_form_candidate: "Unknown",
        is_conversion: false, conversion_probability: "Low",
        form_confidence: "Low", form_support_points: 0, form_opposing_points: 0,
        conversion_support_points: 0, conversion_opposing_points: 0,
        alternate_form_candidates: [], form_scoring_detail: [], conversion_evidence: [],
        form_reasoning: "P3 LLM call failed — form unknown",
        form_detection_method: "broad_fallback", mechanical_signature_detected: null,
      };
    }
    return this.normalize(_raw_p3, "p3_form");
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 4 — Construction Analysis
  // Trigger: run_construction = true
  // Reads joinery + hidden structure from p0 observations.
  // Construction outranks style. Conflicts → flag + explain.
  // ─────────────────────────────────────────────────────────────
  async p4(caseData, images, p0, p1, p2, p3) {
    const sys = `You are the Construction Analysis engine for the NCW American Furniture Identification Engine.

${this.wmSummary()}

PURPOSE
Evaluate how the piece was physically built. Establish manufacturing era, mode, and originality.
Construction OUTRANKS style (Tier J weight ${WM.tiers.style} vs construction Tier weight ${WM.tiers.construction}).
If they conflict, create a construction_conflict and attempt an explanation.

MANUFACTURING MODES:
• hand_craft (pre-1830)
• transitional_craft (1830–1870)
• early_factory (1860–1900)
• factory_production (post-1890)
• modern_production (post-1950)

SCORING:

TIER: hidden_structure (weight ${WM.tiers.hidden_structure}) — HIGHEST:
• Pedal cavity / treadle mount / ice chamber → form_support +12, conversion_support +12
• Structural voids from removed mechanism   → conversion_support +8

TIER: construction (weight ${WM.tiers.construction}):
• hand_cut_dovetails (irregular, hand variation) → age_support +12, originality_support +12
• machine_dovetails (uniform)                   → age_support +10
• mortise_and_tenon (hand-fitted)               → age_support +8, originality_support +8
• dowel_joinery                                 → age_support +6 (post-1900 indicator)
• butt_joint_screwed                            → age_opposing +8, originality_opposing +8
• frame_and_panel                               → originality_support +6
• solid_board_drawer_bottom                     → originality_support +6
• glue_blocks                                   → originality_support +4
• plywood_drawer_bottom                         → age_opposing +15 HARD NEGATIVE (WM: plywood_pre1905 = ${WM.negative_rules.plywood_pre1905})

TIER: materials (weight ${WM.tiers.materials}):
• plywood structural   → age_opposing +${Math.abs(WM.negative_rules.plywood_pre1905)} HARD NEGATIVE eliminates pre-1905
• particle_board       → age_opposing +${Math.abs(WM.negative_rules.particle_board)}, originality_opposing +25 HARD NEGATIVE
• MDF                  → age_opposing +${Math.abs(WM.negative_rules.mdf)}, originality_opposing +25 HARD NEGATIVE
• poplar secondary     → age_support +5
• gumwood secondary    → age_support +4 (1880–1940)
• pine secondary       → originality_support +3

CONFLICT EXPLANATIONS — attempt one if construction conflicts with style or form:
revival_style | replacement_parts | antique_repair | conversion | composite_marriage_piece |
early_industrial_transition | rural_persistence_of_older_methods

Apply construction_confidence_cap from Phase 1.

Phase 1: ${JSON.stringify(p1)}
Phase 2: ${JSON.stringify(p2)}
Phase 3: ${JSON.stringify(p3)}

Respond ONLY in valid JSON:
{
  "construction_scoring_detail": [{"observation":"","tier":"hidden_structure|construction|materials","tracks":["age_support"],"score":0,"notes":""}],
  "age_support_points":             0,
  "age_opposing_points":            0,
  "originality_support_points":     0,
  "originality_opposing_points":    0,
  "form_support_from_structure":    0,
  "conversion_support_from_structure":0,
  "manufacturing_mode":             "",
  "primary_joinery_type":           "",
  "joinery_confidence":             0,
  "drawer_construction":            "",
  "back_panel_construction":        "",
  "secondary_wood":                 "",
  "special_structures":             [],
  "structural_anomalies":           [],
  "hard_negatives_triggered":       [],
  "construction_date_range":        "",
  "construction_conflicts":         [{"conflict":"","explanation_attempted":"","resolved":false}],
  "construction_confidence":        "Moderate",
  "caps_applied":                   []
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    // Targeted scans — joinery is the primary dating surface; construction catches materials
    const targetedJoinery      = await this.p0_targeted(images, "joinery",      p0.observations_by_type, { caseId:caseData.id, phase:"construction_analysis" });
    const targetedConstruction = await this.p0_targeted(images, "construction", p0.observations_by_type, { caseId:caseData.id, phase:"construction_analysis" });
    const mergedJoinery      = this.mergeVisualObs(p0.observations_by_type, targetedJoinery,      "joinery");
    const mergedConstruction = this.mergeVisualObs(p0.observations_by_type, targetedConstruction, "construction");

    let _raw_p4;
    try {
      _raw_p4 = await this.callClaude(sys, [
      ...this.imgs(images),
      { type: "text", text: `VISUAL SCANNER OBSERVATIONS (full scan + targeted joinery/construction re-examination):\nJoinery: ${JSON.stringify(mergedJoinery)}\nConstruction: ${JSON.stringify(mergedConstruction)}\nConversion cavities: ${JSON.stringify(p0.observations_by_type.conversion_cavities||[])}\nToolmarks: ${JSON.stringify(p0.observations_by_type.toolmarks||[])}\nSecondary wood observed: ${p0.secondary_wood_observed||"unknown"}\nTargeted joinery summary: ${targetedJoinery.targeted_summary||""}\nTargeted construction summary: ${targetedConstruction.targeted_summary||""}\n\nP1: ${JSON.stringify(p1)}\nP2: ${JSON.stringify(p2)}\nP3: ${JSON.stringify(p3)}` },
    ]);
    } catch(_e_p4) {
      console.warn("[NCW P4] callClaude threw:", _e_p4.message);
      _raw_p4 = { ok:false, error_type:"call_threw", error_message: _e_p4.message, raw_response:"" };
    }
    if (!_raw_p4 || _raw_p4.ok === false) {
      console.warn("[NCW P4] Returning safe fallback");
      return {
        ok: true, _synthesized: true, _engine_status: "llm_unavailable",
        primary_joinery_type: "unknown", manufacturing_mode: "unknown",
        drawer_construction: "unknown", back_panel_construction: "unknown",
        secondary_wood: "", construction_date_range: "Date uncertain",
        construction_confidence: "Low", construction_support_points: 0, construction_opposing_points: 0,
        structural_anomalies: [], special_structures: [], hard_negatives_triggered: [],
        construction_conflicts: [], caps_applied: [],
      };
    }
    return this.normalize(_raw_p4, "p4_construction");
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 5 — Hardware Analysis
  // Trigger: run_hardware = true
  // Reads hardware observations directly from p0 visual scan.
  // Hardware MUST NOT override construction unless originality ×1.0.
  // ─────────────────────────────────────────────────────────────
  async p5(caseData, images, p0, p1, p2, p3, p4) {
    const styles = DB.style_families.map(s => `${s.name} (${s.era_start}–${s.era_end})`).join(", ");
    const sys = `You are the Hardware Analysis engine for the NCW American Furniture Identification Engine.

${this.wmSummary()}

PURPOSE
Examine all visible hardware. Assess date band, originality, and replacement risk.
Hardware is Tier weight ${WM.tiers.hardware} — supports but does NOT override Tier A–E (weights ${WM.tiers.hidden_structure}–${WM.tiers.interior_logic})
unless originality multiplier is ×1.0 (clearly original).

KNOWN HARDWARE:
• porcelain_caster:       1830–1870, replacement_risk moderate → age_support +8
• wood_caster:            1800–1840, replacement_risk moderate → age_support +6
• victorian_strap_hinge:  1865–1895, replacement_risk moderate → age_support +6, style +4 (Gothic/Victorian Revival)
• batwing_brass_pull:     1720–1790, replacement_risk HIGH → age_support +8, max_multiplier ×0.5
• eastlake_pull:          1870–1890, replacement_risk moderate → age_support +6, style +4 (Eastlake)
• surface_lock:           1750–present, replacement_risk moderate → age_support +4
• modern_concealed_hinge: 1950+, replacement_risk low → age_opposing +${Math.abs(WM.negative_rules.modern_concealed_hinge)}, originality_opposing +15 HARD NEGATIVE

STYLE FAMILIES: ${styles}

ORIGINALITY ASSESSMENT — check all indicators before assigning multiplier:
Indicators of replacement (each present reduces originality confidence):
- Enlarged or plugged screw holes around mount
- Finish disturbance or fresh wood around mount
- Oxidation mismatch between hardware and surrounding wood
- Wear pattern on hardware differs from surrounding wood
- Screws inconsistent with construction era (e.g., phillips in 19th c. mount)
- Hardware shadow/ghost outline does not match current hardware

MULTIPLIERS:
• Clearly original (0 indicators)   → ×1.0 (full score)
• Uncertain (1–2 minor indicators)  → ×0.5
• Likely replaced (3+ indicators)   → ×0.25
• batwing_brass_pull                → max ×0.5 regardless (inherent replacement risk)

HARD NEGATIVES (apply regardless of stated originality):
• phillips_screws in any original mount → age_opposing +${Math.abs(WM.negative_rules.phillips_screw_pre1930)}, originality_opposing +12
• filled/plugged pull holes             → originality_opposing +8
• hardware shadow mismatch             → originality_opposing +8
• finish visibly disturbed around mount→ originality_opposing +6
• modern_concealed_hinge               → age_opposing +${Math.abs(WM.negative_rules.modern_concealed_hinge)}, originality_opposing +15

CONFLICT: If hardware date range conflicts with P4 construction date range by >30 years → flag conflict.
If hardware likely replaced → lower influence. If appears original AND conflicts → higher severity.

Apply hardware_originality_cap from Phase 1.

P1: ${JSON.stringify(p1)}
P3 (Form): ${JSON.stringify(p3)}
P4 (Construction): ${JSON.stringify(p4)}

Respond ONLY in valid JSON:
{
  "hardware_scoring_detail": [
    {"type":"","location":"","originality_indicators_against":[],"appears_original":true,"originality_multiplier":1.0,"raw_score":0,"adjusted_score":0,"date_range":"","notes":""}
  ],
  "age_support_points":          0,
  "age_opposing_points":         0,
  "originality_support_points":  0,
  "originality_opposing_points": 0,
  "hard_negatives_triggered":    [],
  "hardware_date_range":         "",
  "hardware_consistency":        "consistent",
  "style_family_suggested":      null,
  "originality_concerns":        [],
  "hardware_conflicts":          [{"conflict":"","severity":"low|medium|high","likely_replaced":true}],
  "hardware_confidence":         "Moderate",
  "hardware_notes":              "",
  "caps_applied":                []
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    // Targeted scans — hardware is the primary focus; finish helps assess originality
    const targetedHardware = await this.p0_targeted(
      images, "hardware", p0.observations_by_type,
      { caseId:caseData.id, phase:"hardware_analysis",
        construction_date: p4.construction_date_range || "unknown",
        joinery_found: p4.primary_joinery_type || "unknown" }
    );
    const targetedFinish = await this.p0_targeted(
      images, "finish", p0.observations_by_type,
      { caseId:caseData.id, phase:"hardware_analysis" }
    );
    const mergedHardware = this.mergeVisualObs(p0.observations_by_type, targetedHardware, "hardware");
    const mergedFinish   = this.mergeVisualObs(p0.observations_by_type, targetedFinish,   "finish");

    let _raw_p5;
    try {
      _raw_p5 = await this.callClaude(sys, [
      ...this.imgs(images),
      { type: "text", text: `VISUAL SCANNER OBSERVATIONS (full scan + targeted hardware/finish re-examination):\nHardware: ${JSON.stringify(mergedHardware)}\nFinish: ${JSON.stringify(mergedFinish)}\nHard negatives found: ${JSON.stringify(p0.scan_summary.hard_negatives_found||[])}\nTargeted hardware summary: ${targetedHardware.targeted_summary||""}\nTargeted finish summary: ${targetedFinish.targeted_summary||""}\n\nP1: ${JSON.stringify(p1)}\nP3: ${JSON.stringify(p3)}\nP4: ${JSON.stringify(p4)}` },
    ]);
    } catch(_e_p5) {
      console.warn("[NCW P5] callClaude threw:", _e_p5.message);
      _raw_p5 = { ok:false, error_type:"call_threw", error_message: _e_p5.message, raw_response:"" };
    }
    if (!_raw_p5 || _raw_p5.ok === false) {
      console.warn("[NCW P5] Returning safe fallback");
      return {
        ok: true, _synthesized: true, _engine_status: "llm_unavailable",
        hardware_scoring_detail: [], hardware_date_range: "Date uncertain",
        hardware_consistency: "unknown", style_family_suggested: null,
        hardware_confidence: "Low", hardware_support_points: 0, hardware_opposing_points: 0,
        originality_concerns: [], hardware_conflicts: [], hard_negatives_triggered: [],
        hardware_notes: "P5 LLM call failed", caps_applied: [],
      };
    }
    return this.normalize(_raw_p5, "p5_hardware");
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 6 — Conflict Detection Engine
  // Runs between Hardware Analysis and Reconciliation.
  // Does NOT override evidence — interprets and explains contradictions.
  // Sources: conflict_resolution_rules + p0 visual scan + all prior phases.
  // ─────────────────────────────────────────────────────────────
  async p6_conflict(p0, p1, p2, p3, p4, p5) {
    const rules = DB.conflict_resolution_rules;
    const sys = `You are the Conflict Detection Engine for the NCW American Furniture Identification Engine.

PURPOSE
Detect contradictions between evidence types observed in prior phases.
Explain them using known conflict patterns from the conflict_resolution_rules table.
Do NOT override evidence. Do NOT change scores. Record conflicts and compute net confidence adjustments.
The Reconciliation phase will consult your output before forming final conclusions.

CRITICAL RULE: The engine must say "likely revival", "likely hardware replacement",
"likely marriage piece", "likely conversion", or "likely rural persistence"
INSTEAD of incorrectly rejecting or misidentifying the object.
It is always better to explain a contradiction than to suppress it.

CONFLICT RESOLUTION RULES TABLE (seeded reference data):
${JSON.stringify(rules, null, 2)}

CONFLICT DETECTION LOGIC — actively search for each pattern:

1. REVIVAL STYLE
   Condition: style_date implied by decorative language < construction_date implied by toolmarks/joinery
   Example: Colonial-style decorative vocabulary + machine dovetails (post-1860)
   Action: Apply revival_style rule. penalty=${rules[0].confidence_penalty}, recovery=${rules[0].confidence_recovery}

2. HARDWARE REPLACEMENT
   Condition: modern fastener type observed in hardware mount + antique structural evidence elsewhere
   Example: Phillips screws in hinge mortise + hand-cut dovetails in case
   Action: Apply hardware_replacement rule. penalty=${rules[1].confidence_penalty}, recovery=${rules[1].confidence_recovery}

3. MARRIAGE PIECE
   Condition: two major structural components (e.g. base + top, case + doors) show clearly different
              construction eras, wood aging patterns, or joinery types inconsistent with single origin
   Example: base with hand-cut dovetails (pre-1860) + top with plywood panels (post-1920)
   Action: Apply marriage_piece rule. penalty=${rules[2].confidence_penalty}, recovery=${rules[2].confidence_recovery}
   Note: Zero recovery — composite status must be clearly stated.

4. CONVERSION FURNITURE
   Condition: specialized structural cavity present + original mechanism absent + new surface use present
   Example: Pedal cavity structure + no keyboard/bellows + marble top or desk surface added
   Action: Apply conversion_furniture rule. penalty=${rules[3].confidence_penalty}, recovery=${rules[3].confidence_recovery}
   Note: Record BOTH original_form and current_form explicitly.

5. RURAL PERSISTENCE
   Condition: early joinery methods (hand-cut dovetails, mortise and tenon) + later fastener types
              (wire nails, slotted machine screws) + NO strong industrial features
   Example: Hand-cut dovetails + wire nails, no circular saw arcs, no machine routing
   Action: Apply rural_persistence rule. penalty=${rules[4].confidence_penalty}, recovery=${rules[4].confidence_recovery}

SEVERITY LEVELS:
• low    — minor inconsistency, strong explanation available (hardware_replacement, rural_persistence)
• medium — notable conflict, partial explanation (revival_style, conversion_furniture)
• high   — major structural contradiction, no full explanation (marriage_piece, unresolved composites)

CONFIDENCE ADJUSTMENT ARITHMETIC:
net_adjustment = confidence_penalty + confidence_recovery
Example: conversion_furniture → -6 + 6 = 0 net (conflict explained, no residual penalty)
Example: marriage_piece → -10 + 0 = -10 net (conflict recorded, cannot be explained away)
Example: hardware_replacement → -4 + 3 = -1 net

Multiple conflicts: sum all net_adjustments.

All prior phase evidence:
P1 (Intake): ${JSON.stringify(p1)}
P2 (Dating Grid): ${JSON.stringify(p2)}
P3 (Form Decision): ${JSON.stringify(p3)}
P4 (Construction): ${JSON.stringify(p4)}
P5 (Hardware): ${JSON.stringify(p5)}

Respond ONLY in valid JSON:
{
  "conflicts_detected": [
    {
      "conflict_type": "revival_style|hardware_replacement|marriage_piece|conversion_furniture|rural_persistence",
      "rule_id": 1,
      "trigger_evidence_a": "",
      "trigger_evidence_b": "",
      "supporting_observations": [],
      "likely_explanation": "",
      "severity": "low|medium|high",
      "confidence_penalty": 0,
      "confidence_recovery": 0,
      "net_adjustment": 0,
      "resolved": true,
      "resolution_narrative": ""
    }
  ],
  "no_conflicts_detected": false,
  "total_penalty": 0,
  "total_recovery": 0,
  "total_net_adjustment": 0,
  "conflict_summary": "",
  "object_classification_suggested": "original|altered|revival|composite|converted",
  "conflict_interpretation_for_report": ""
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    let _raw_p6_conflict;
    try {
      _raw_p6_conflict = await this.callClaude(sys, [
      { type: "text", text: `VISUAL SCANNER (Phase 0) — all observations:\n${JSON.stringify(p0.observations_by_type||{})}\nAnomalies noted: ${JSON.stringify(p0.anomalies_noted||[])}\n\nP1: ${JSON.stringify(p1)}\nP2: ${JSON.stringify(p2)}\nP3: ${JSON.stringify(p3)}\nP4: ${JSON.stringify(p4)}\nP5: ${JSON.stringify(p5)}` },
    ]);
    } catch(_e_p6_conflict) {
      console.warn("[NCW P6_CONFLICT] callClaude threw:", _e_p6_conflict.message);
      _raw_p6_conflict = { ok:false, error_type:"call_threw", error_message: _e_p6_conflict.message, raw_response:"" };
    }
    if (!_raw_p6_conflict || _raw_p6_conflict.ok === false) {
      console.warn("[NCW P6_CONFLICT] Returning safe fallback");
      return {
        ok: true, _synthesized: true, _engine_status: "llm_unavailable",
        conflicts_detected: [], total_net_adjustment: 0,
        object_classification_suggested: "unknown",
        conflict_interpretation_for_report: "P6 LLM call failed",
        conflict_summary: "",
      };
    }
    return this.normalize(_raw_p6_conflict, "p6_conflict");
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 7 — Reconciliation  (was Phase 6)
  // Now consults conflict engine output (p6_conflict) before
  // forming final conclusions.
  // ─────────────────────────────────────────────────────────────
  async p7(p1, p2, p3, p4, p5, p6c) {
    const sys = `You are the Reconciliation engine for the NCW American Furniture Identification Engine.

${this.wmSummary()}

PURPOSE
Synthesize all prior evidence into a single coherent identification.
You do NOT create new evidence. You resolve contradictions, apply the priority hierarchy,
compute the final scorecard, and produce the confidence band.

CONFLICT ENGINE RESULTS — CONSULT FIRST:
The Conflict Detection Engine (Phase 6) has already identified and classified all evidence
contradictions. Use its output to:
• Accept its object_classification_suggested as a strong starting point
• Apply its total_net_adjustment to your confidence computation
• Use its conflict_interpretation_for_report verbatim in reconciliation_notes
• Do NOT re-litigate resolved conflicts — accept the engine's explanations
• For unresolved HIGH-severity conflicts: cap confidence_band at "Low"

Phase 6 Conflict Engine output: ${JSON.stringify(p6c)}

EVIDENCE PRIORITY ORDER — lower-tier evidence NEVER overrides higher tier:
1.  hidden_structure    (tier weight ${WM.tiers.hidden_structure}) — specialized cavities, internal mechanism evidence
2.  construction        (tier weight ${WM.tiers.construction}) — how the piece was physically built
3.  toolmarks           (tier weight ${WM.tiers.toolmarks}) — saw technology on hidden surfaces
4.  fasteners           (tier weight ${WM.tiers.fasteners}) — nail and screw types
5.  interior_logic      (tier weight ${WM.tiers.interior_logic}) — form identification from structure
6.  hardware (×1.0 only)(tier weight ${WM.tiers.hardware}) — fittings with confirmed originality
7.  materials           (tier weight ${WM.tiers.materials}) — wood species and engineered materials
8.  repairs             (tier weight ${WM.tiers.repairs}) — repair marks and alteration evidence
9.  finish              (tier weight ${WM.tiers.finish}) — finish family and patina
10. style               (tier weight ${WM.tiers.style}) — decorative vocabulary (WEAK)
11. provenance          (tier weight ${WM.tiers.provenance}) — user-stated claims (WEAKEST)

CRITICAL: Tier weights 8–10 (tiers 10, 9, 8, 8, 8 above) MUST dominate conclusions.
Style (weight ${WM.tiers.style}) and provenance (weight ${WM.tiers.provenance}) NEVER outweigh strong physical evidence.

CONFLICT PENALTIES (add to opposing_points — use Conflict Engine totals when available):
• style conflicts with construction        → ${WM.penalties.style_vs_construction}
• hardware vs structure, likely replaced   → ${WM.penalties.hardware_vs_structure_replaced}
• hardware vs structure, appears original  → ${WM.penalties.hardware_vs_structure_original}
• finish significantly newer than structure→ ${WM.penalties.finish_newer_than_structure}
• interior logic conflicts with form label → ${WM.penalties.interior_logic_vs_form}
• major composite/marriage mismatch        → ${WM.penalties.composite_mismatch}
• missing critical evidence category       → ${WM.penalties.missing_critical_evidence} per category (max 2)

CONFLICT RECOVERIES (subtract from opposing_points when explanation resolves conflict):
• revival_style                     → recover ${WM.recoveries.revival_style}
• replacement_hardware              → recover ${WM.recoveries.replacement_hardware}
• antique_repair                    → recover ${WM.recoveries.antique_repair}
• conversion                        → recover ${WM.recoveries.conversion}
• composite_marriage_piece          → recover ${WM.recoveries.composite_marriage_piece}
• early_industrial_transition       → recover ${WM.recoveries.early_industrial_transition}
• rural_persistence_older_methods   → recover ${WM.recoveries.rural_persistence_older_methods}

HARD NEGATIVE MATRIX (apply immediately when triggered — add directly to opposing_points):
• phillips_screws original to structure → ${WM.negative_rules.phillips_screw_pre1930} age
• particle_board present               → ${WM.negative_rules.particle_board} age/originality
• MDF present                          → ${WM.negative_rules.mdf} age/originality
• staple_fastener structural           → ${WM.negative_rules.staple_fastener} age/originality
• plywood structural                   → ${WM.negative_rules.plywood_pre1905} age
• polyurethane as original finish      → ${WM.negative_rules.polyurethane_original} originality
• modern_concealed_hinge               → ${WM.negative_rules.modern_concealed_hinge} age/originality
• orbital_sander_swirl on "untouched"  → ${WM.negative_rules.orbital_sander_swirl} originality

CONFIDENCE FORMULA (from WM):
confidence_pct = overall_supporting_points / (overall_supporting_points + overall_opposing_points) × 100
Then apply conflict engine total_net_adjustment: confidence_pct += total_net_adjustment
Bands: High=85-100, Moderate=65-84, Low=40-64, Inconclusive=<40
After computing: apply any remaining caps from Phase 1 (caps can only LOWER, never raise).

UNRESOLVED HIGH-WEIGHT CONFLICT CAP:
If any high-severity conflict from the Conflict Engine remains unresolved → cap confidence_band at "Low".

OBJECT CLASSIFICATION — use conflict engine's suggestion unless physical evidence contradicts it:
• original   — no significant alterations; original form and function intact
• altered    — original form intact but significant modifications made
• revival    — later reproduction of earlier style; construction confirms post-style-era date
• composite  — parts from different pieces married together
• converted  — original form and function changed to different use

Accumulate the FULL SCORECARD by summing contributions from all prior phases.
All phase outputs:
P1: ${JSON.stringify(p1)}
P2: ${JSON.stringify(p2)}
P3: ${JSON.stringify(p3)}
P4: ${JSON.stringify(p4)}
P5: ${JSON.stringify(p5)}

Respond ONLY in valid JSON:
{
  "scorecard": {
    "age_support_points":          0,
    "age_opposing_points":         0,
    "form_support_points":         0,
    "form_opposing_points":        0,
    "originality_support_points":  0,
    "originality_opposing_points": 0,
    "conversion_support_points":   0,
    "conversion_opposing_points":  0,
    "negative_penalty_total":      0,
    "confidence_caps_applied":     []
  },
  "reconciliation_priority_log": [
    {"priority_rank":1,"tier":"hidden_structure","tier_weight":10,"evidence_type":"","finding":"","weight_applied":0,"source_phase":""}
  ],
  "conflicts_found": [
    {"conflict":"","tier_involved":"","penalty_applied":0,"explanation_attempted":"","recovery_applied":0,"resolved":true,"resolution_note":""}
  ],
  "negative_evidence_triggered": [
    {"rule":"","penalty":0,"tracks_affected":[]}
  ],
  "conflict_engine_net_adjustment": 0,
  "object_classification":        "original",
  "reconciled_date_range":        "",
  "reconciled_style_family":      null,
  "reconciled_form":              "",
  "original_form":                "",
  "alterations":                  [],
  "supporting_evidence":          [],
  "overall_supporting_points":    0,
  "overall_opposing_points":      0,
  "raw_confidence_percent":       0,
  "confidence_percent":           0,
  "confidence_band":              "Moderate",
  "unresolved_high_weight_conflict": false,
  "reconciliation_notes":         ""
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    let _raw_p7;
    try {
      _raw_p7 = await this.callClaude(sys, [
      { type: "text", text: `P1: ${JSON.stringify(p1)}\nP2: ${JSON.stringify(p2)}\nP3: ${JSON.stringify(p3)}\nP4: ${JSON.stringify(p4)}\nP5: ${JSON.stringify(p5)}\nP6_Conflicts: ${JSON.stringify(p6c)}` },
    ]);
    } catch(_e_p7) {
      console.warn("[NCW P7] callClaude threw:", _e_p7.message);
      _raw_p7 = { ok:false, error_type:"call_threw", error_message: _e_p7.message, raw_response:"" };
    }
    if (!_raw_p7 || _raw_p7.ok === false) {
      console.warn("[NCW P7] Returning safe fallback");
      return {
        ok: true, _synthesized: true, _engine_status: "llm_unavailable",
        reconciled_form: "Unknown", reconciled_date_range: "Date uncertain — engine unavailable",
        reconciled_style_family: null, original_form: null,
        confidence_percent: 40, confidence_band: "Low",
        overall_supporting_points: 0, overall_opposing_points: 0,
        scorecard: {}, supporting_evidence: [], conflicts_found: [],
        alterations: [], negative_evidence_applied: [],
        reconciliation_notes: "P7 LLM call failed", object_classification: "unknown",
      };
    }
    return this.normalize(_raw_p7, "p7_reconciliation");
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 8 — Valuation  (was Phase 7)
  // Trigger: reconciliation complete, band ≠ Inconclusive,
  //          form_confidence ≥ Moderate
  // Values the object AS IT EXISTS NOW.
  // ─────────────────────────────────────────────────────────────
  async p8(p3, p7) {
    const band = p7.confidence_band || "Moderate";
    const formConf = p3.form_confidence || "Moderate";

    if (band === "Inconclusive") {
      return { valuation_skipped: true, skip_reason: "Identification is Inconclusive — minimum Moderate required for valuation.", valuations: [], value_drivers: [], value_detractors: [], market_notes: "", value_adjustments_applied: [] };
    }
    if (formConf === "Low" && band === "Low") {
      return { valuation_skipped: true, skip_reason: "Both form and age confidence are Low — valuation cannot proceed reliably.", valuations: [], value_drivers: [], value_detractors: [], market_notes: "", value_adjustments_applied: [] };
    }

    const provisional = band === "Low" || formConf === "Low";
    const sys = `You are the Valuation engine for the NCW American Furniture Identification Engine.
${provisional ? "⚠️  PROVISIONAL — confidence is Low. The narrative must explicitly state this is a provisional estimate." : ""}

${this.wmSummary()}

CRITICAL: Value the object AS IT EXISTS NOW, not as a hypothetical perfect original.

VALUE MODIFIERS (from WM) — apply applicable ones as percentage adjustments to base:
Positive: ${JSON.stringify(Object.fromEntries(Object.entries(WM.value_modifiers).filter(([,v])=>v>0)))}
Negative: ${JSON.stringify(Object.fromEntries(Object.entries(WM.value_modifiers).filter(([,v])=>v<0)))}

MARKET LANES — all five required:
1. dealer_buy       — what a knowledgeable dealer pays to acquire for resale
2. quick_sale       — estate sale or fast local disposal
3. marketplace      — Facebook Marketplace / peer-to-peer
4. as_found_retail  — retail asking price, current unrestored condition
5. restored_retail  — retail after appropriate professional restoration

Base estimates on 2024–2025 American antique furniture market.
Consider regional variation: high-style urban vs. general secondary market.
All values in USD.

Identification: ${JSON.stringify(p7)}
Form assessment: ${JSON.stringify(p3)}
Confidence band: ${band}

Respond ONLY in valid JSON:
{
  "valuation_skipped":  false,
  "provisional":        ${provisional},
  "valuations": [
    {"market_lane":"dealer_buy",      "low":0,"high":0,"rationale":""},
    {"market_lane":"quick_sale",      "low":0,"high":0,"rationale":""},
    {"market_lane":"marketplace",     "low":0,"high":0,"rationale":""},
    {"market_lane":"as_found_retail", "low":0,"high":0,"rationale":""},
    {"market_lane":"restored_retail", "low":0,"high":0,"rationale":""}
  ],
  "value_adjustments_applied": [{"factor":"","direction":"positive|negative","adjustment_percent":0}],
  "value_drivers":    [],
  "value_detractors": [],
  "market_notes":     ""
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    let _raw_p8;
    try {
      _raw_p8 = await this.callClaude(sys, [
      { type: "text", text: `Form: ${JSON.stringify(p3)}\nReconciliation: ${JSON.stringify(p7)}` },
    ]);
    } catch(_e_p8) {
      console.warn("[NCW P8] callClaude threw:", _e_p8.message);
      _raw_p8 = { ok:false, error_type:"call_threw", error_message: _e_p8.message, raw_response:"" };
    }
    if (!_raw_p8 || _raw_p8.ok === false) {
      console.warn("[NCW P8] Returning safe fallback");
      return {
        ok: true, _synthesized: true, _engine_status: "llm_unavailable",
        valuations: [], value_drivers: [], value_detractors: [],
        market_notes: "P8 LLM call failed — valuation unavailable",
        value_adjustments: [],
      };
    }
    return this.normalize(_raw_p8, "p8_valuation");
  },

  // ─────────────────────────────────────────────────────────────
  // ORCHESTRATOR — 9-phase pipeline (Phase 0 + 8 reasoning phases)
  // ─────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────
  // QUICK MODE — independent schema and validator
  // Completely separate from full-analysis validation.
  // Schema: QuickScanResponse
  // ─────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────
  // QUICK MODE — independent schema, tolerant validator, fallback interpreter
  // Completely separate from full-analysis validation.
  // Schema: QuickScanResponse (relaxed — degrades gracefully)
  // ─────────────────────────────────────────────────────────────

  // QuickScanResponse — informational fields that MUST have at least one
  // present to accept the response. All others get safe defaults if missing.
  QUICK_SCHEMA: {
    // At least ONE of these must be non-empty to accept the response
    informational: ["likely_identification","estimated_date_range","confidence","short_reason"],
    // These get defaults if missing — never block the result
    optional_with_defaults: ["estimated_value_low","estimated_value_high","buy_guidance"],
    // Field alias map: alternative names models sometimes use → canonical name
    aliases: {
      possible_item:    "likely_identification",
      item:             "likely_identification",
      identification:   "likely_identification",
      form:             "likely_identification",
      likely_form:      "likely_identification",
      date_estimate:    "estimated_date_range",
      date_range:       "estimated_date_range",
      period:           "estimated_date_range",
      estimated_period: "estimated_date_range",
      certainty:        "confidence",
      confidence_level: "confidence",
      rating:           "confidence",
      reason:           "short_reason",
      rationale:        "short_reason",
      explanation:      "short_reason",
      buying_rationale: "short_reason",
      value_low:        "estimated_value_low",
      low:              "estimated_value_low",
      value_high:       "estimated_value_high",
      high:             "estimated_value_high",
      signal:           "buy_guidance",
      buying_signal:    "buy_guidance",
      guidance:         "buy_guidance",
      recommendation:   "buy_guidance",
    },
  },

  // Normalize a raw parsed object into QuickScanResponse canonical fields.
  // 1. Apply alias mapping for any non-standard field names.
  // 2. Fill missing fields with safe defaults.
  // 3. Normalize confidence and buy_guidance to expected value sets.
  normalizeQuickResponse(parsed) {
    if (!parsed || typeof parsed !== "object") return null;
    const out = { ...parsed };

    // Apply aliases
    for (const [alias, canonical] of Object.entries(this.QUICK_SCHEMA.aliases) as [string, string][]) {
  if ((out as Record<string, any>)[alias] !== undefined && (out as Record<string, any>)[canonical] === undefined) {
    (out as Record<string, any>)[canonical] = (out as Record<string, any>)[alias];
  }
}

    // Normalize confidence — 4-level ladder:
    // "Very High" | "High" | "Moderate" | "Low"
    if (out.confidence) {
      const c = String(out.confidence).toLowerCase().replace(/[_\s-]+/g," ");
      if      (c.includes("very high") || c.includes("very_high")) out.confidence = "Very High";
      else if (c.includes("high"))                                  out.confidence = "High";
      else if (c.includes("mod"))                                   out.confidence = "Moderate";
      else                                                          out.confidence = "Low";
    }

    // Normalize buy_guidance
    if (out.buy_guidance) {
      const g = String(out.buy_guidance).toLowerCase();
      if      (g.includes("buy") && !g.includes("over"))  out.buy_guidance = "Buy";
      else if (g.includes("fair") || g.includes("ok"))    out.buy_guidance = "Fair Price";
      else if (g.includes("over") || g.includes("high"))  out.buy_guidance = "Overpriced";
      else if (g.includes("pass") || g.includes("skip"))  out.buy_guidance = "Pass";
      else if (g.includes("caut"))                        out.buy_guidance = "Caution";
    }

    // Safe defaults for missing fields
    if (!out.likely_identification)  out.likely_identification  = "Undetermined";
    if (!out.estimated_date_range)   out.estimated_date_range   = "Unknown";
    if (!out.confidence)             out.confidence             = "Low";
    // Ensure confidence is one of the four valid ladder values
    if (!["Very High","High","Moderate","Low"].includes(out.confidence)) out.confidence = "Low";
    if (!out.short_reason)           out.short_reason           = "";
    if (out.estimated_value_low  === undefined) out.estimated_value_low  = 0;
    if (out.estimated_value_high === undefined) out.estimated_value_high = 0;
    if (!out.buy_guidance)           out.buy_guidance           = "Caution";

    return out;
  },

  // Validate a Quick Mode response — TOLERANT.
  // Accepts if at least ONE informational field is non-empty.
  // Missing fields get defaults via normalizeQuickResponse.
  // Only rejects if ZERO informational fields are present.
  validateQuickResponse(raw, parsed) {
    if (!parsed || typeof parsed !== "object") {
      console.warn("[NCW Quick] JSON parse failure, raw:", raw.slice(0,300));
      return { ok: false, error_type:"json_parse_error", raw_response: raw || "" };
    }

    // Apply aliases before checking
    const normalized = this.normalizeQuickResponse(parsed);

    // Check at least one informational field is meaningful
    const hasAny = this.QUICK_SCHEMA.informational.some(f =>
      normalized[f] && normalized[f] !== "Undetermined" && normalized[f] !== "Unknown" && normalized[f] !== ""
    );

    if (!hasAny) {
      console.warn("[NCW Quick] No informational fields found. Raw:", raw.slice(0,300));
      return { ok: false, error_type:"no_informational_fields", raw_response: raw || "" };
    }

    console.info("[NCW Quick] Response accepted. Fields:", Object.keys(normalized).join(", "));
    return { ok: true, data: normalized };
  },

  // callClaudeQuick — independent caller for Quick Mode
  async callClaudeQuick(system, userContent) {
    // When userContent is an array (vision call), prepend a text instruction block
    // so the model receives an explicit question alongside the images.
    const contentToSend = Array.isArray(userContent)
      ? [{ type: "text", text: "Examine each photo carefully and return the JSON analysis requested in the system prompt." }, ...userContent]
      : userContent;

    const imgCount = Array.isArray(userContent) ? userContent.filter(b => b.type === "image").length : 0;
    console.info("[NCW Quick] Sending request — images:", imgCount, "| model: claude-sonnet-4-6 | max_tokens: 1800");
    if (imgCount === 0) console.warn("[NCW Quick] WARNING: no images in request — vision call will return nothing useful");

    // Log the request structure (truncating base64 data for readability)
    const debugPayload = {
      model: "claude-sonnet-4-6",
      max_tokens: 1800,
      system_len: system.length,
      messages_content_types: contentToSend.map(b => b.type + (b.type === "image" ? "(" + (b.source && b.source.media_type) + ",len=" + (b.source && b.source.data && b.source.data.length) + ")" : "(len=" + (b.text||"").length + ")")),
    };
    console.info("[NCW Quick] Request structure:", JSON.stringify(debugPayload));

    // ── Diagnostics object — written to at every stage, returned on failure ──
    const diag: Record<string, any> = {
  model_name: this.QUICK_SCHEMA.model_name,
  endpoint: this.QUICK_SCHEMA.endpoint,
  http_status: null,
  fetch_ok: null,
  response_content_type: null,
  response_text_preview: null,
  parsed_top_level_keys: null,
  has_data_content: null,
  has_data_error: null,
  caught_exception: null,
};
    diag.cf_request_payload_built = true;
    console.info("[NCW Stage0] CF: request_payload_built");

    let res, bodyText, data;
    diag.cf_fetch_started = true;
    console.info("[NCW Stage0] CF: fetch_started");
    try {
      res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model:      "claude-sonnet-4-6",
          max_tokens: 1800,
          system,
          messages:   [{ role: "user", content: contentToSend }],
        }),
      });
    diag.cf_fetch_resolved = true;
    console.info("[NCW Stage0] CF: fetch_resolved | status:", res && res.status);
    } catch(fetchErr) {
      diag.caught_exception = "fetch() threw: " + fetchErr.message;
      console.error("[NCW Quick] fetch() threw:", fetchErr.message);
      return { ok:false, error_type:"fetch_threw", raw_response:"", _diag: diag };
    }

    // ── Read raw body text BEFORE attempting JSON parse ──────────
    diag.http_status            = res.status;
    diag.fetch_ok               = res.ok;
    diag.response_content_type  = res.headers.get("content-type") || "(none)";
    console.info("[NCW Quick] http_status:", diag.http_status,
      "| fetch_ok:", diag.fetch_ok,
      "| content-type:", diag.response_content_type);

    try {
      bodyText = await res.text();
    } catch(textErr) {
      diag.caught_exception = "res.text() threw: " + textErr.message;
      console.error("[NCW Quick] res.text() threw:", textErr.message);
      return { ok:false, error_type:"body_read_error", raw_response:"", _diag: diag };
    }

    diag.cf_response_text_read = true;
    console.info("[NCW Stage0] CF: response_text_read | len:", bodyText.length);
    diag.response_text_preview = bodyText.slice(0, 300);
    console.info("[NCW Quick] response_text_preview (first 300):", diag.response_text_preview);
    console.info("[NCW Quick] body_total_length:", bodyText.length);

    // ── Parse JSON ───────────────────────────────────────────────
    diag.cf_json_parse_started = true;
    console.info("[NCW Stage0] CF: json_parse_started");
    try {
      data = JSON.parse(bodyText);
    } catch(jsonErr) {
      diag.caught_exception = "JSON.parse threw: " + jsonErr.message;
      console.error("[NCW Quick] JSON.parse threw:", jsonErr.message, "| body[:200]:", bodyText.slice(0,200));
      return { ok:false, error_type:"json_parse_body", raw_response: bodyText, _diag: diag };
    }

    diag.cf_json_parse_finished = true;
    console.info("[NCW Stage0] CF: json_parse_finished");
    diag.parsed_top_level_keys = Object.keys(data).join(", ");
    diag.has_data_content      = Array.isArray(data.content);
    diag.has_data_error        = !!data.error;
    console.info("[NCW Quick] parsed_top_level_keys:", diag.parsed_top_level_keys);
    console.info("[NCW Quick] has_data_content:", diag.has_data_content,
      "| has_data_error:", diag.has_data_error);

    if (data.content) {
      console.info("[NCW Quick] content_block_count:", data.content.length,
        "| block_types:", data.content.map(b => b.type).join(", "));
      data.content.forEach(function(b, i) {
        console.info("[NCW Quick] block[" + i + "] type=" + b.type +
          " text_len=" + (b.text || "").length +
          " first80=" + (b.text || "").slice(0, 80));
      });
    }

    if (data.error) {
      console.warn("[NCW Quick] data.error:", JSON.stringify(data.error));
      return { ok:false, error_type:"api_error", raw_response: JSON.stringify(data.error), _diag: diag };
    }

    if (!data.content || !Array.isArray(data.content)) {
      console.warn("[NCW Quick] no content array in response. Full data:", JSON.stringify(data).slice(0,400));
      return { ok:false, error_type:"bad_response_shape", raw_response: bodyText, _diag: diag };
    }

    const raw = data.content.map(function(b) { return b.text || ""; }).join("\n") || "";
    console.info("[NCW Quick] extracted_raw_len:", raw.length,
      "| stop_reason:", data.stop_reason,
      "| usage:", JSON.stringify(data.usage || {}),
      "| raw_first_300:", raw.slice(0, 300));

    if (!raw.trim()) {
      console.warn("[NCW Quick] empty response text | stop_reason:", data.stop_reason);
      return { ok:false, error_type:"empty_response", raw_response: bodyText, stop_reason: data.stop_reason, _diag: diag };
    }

    const sanitizeQ = (text) => {
      let s = text.replace(/`{3}json[\s\S]*?`{3}|`{3}[\s\S]*?`{3}/g, "").trim();
      const firstBrace = s.indexOf("{");
      if (firstBrace > 0) s = s.slice(firstBrace);
      const m = s.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON object found in response");
      return JSON.parse(m[0]);
    };
    try {
      const parsed = sanitizeQ(raw);
      console.info("[NCW Quick] Parse OK. Top-level keys:", Object.keys(parsed).join(", "));
      diag.cf_stage0_returned = true;
      console.info("[NCW Stage0] CF: stage0_returned (success)");
      return Object.assign({}, parsed, { _diag: diag });
    } catch(_e1) {
      console.warn("[NCW Quick] JSON parse failed. raw[:300]:", String(bodyText || "").slice(0, 300));
      // One retry with tighter instruction
      try {
        const r2 = await fetch("/api/analyze", {
          method:"POST", headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01"},
          body: JSON.stringify({
            model:"claude-sonnet-4-6", max_tokens:1800,
            system: system + "\n\nCRITICAL: Return ONLY valid JSON. Start with { and end with }. No markdown.",
            messages:[
              { role:"user",      content: contentToSend },
              { role:"assistant", content: raw },
              { role:"user",      content: "Return only the JSON object now, starting with {." },
            ],
          }),
        });
        const d2   = await r2.json();
        if (!d2.content || !Array.isArray(d2.content)) {
          return { ok:false, error_type:"bad_response_shape_retry", raw_response: JSON.stringify(d2) };
        }
        const raw2 = d2.content.map(b => b.text||"").join("\n") || "";
        console.info("[NCW Quick] Retry raw length:", raw2.length);
        return { ok: true, ...sanitizeQ(raw2) };
      } catch(_e2) {
        console.warn("[NCW Quick] Parse failed after retry.");
        return { ok:false, error_type:"json_parse_error", raw_response: raw };
      }
    }
  },

  // ─────────────────────────────────────────────────────────────
  // FIELD SCAN PIPELINE  — 5 stages
  //
  // Stage 0: Photo Evidence Digest  — scan ALL photos, build combined digest
  // Stage 1: Form Recognition       — detect structural/mechanical signatures
  // Stage 2: Narrow Identification  — resolve specific form from signatures
  // Stage 3: Date Estimation        — date from fasteners, toolmarks, hardware
  // Stage 4: Market / Buy Guidance  — valuation and buy signal
  //
  // Each stage has ONE job.
  // The digest is built once and passed through every downstream stage.
  // Adding more photos updates the digest and reruns from Stage 1.
  // ─────────────────────────────────────────────────────────────
  async runQuickMode(caseData, images, intake, onPhase) {
    const so          = {};
    const askingPrice = parseFloat(intake.asking_price) || null;

    // ── Evidence cache: build a fingerprint of current images ──
    // Only re-run Stage 0 when the image set has actually changed.
    const imgFingerprint = images.filter(function(i){ return i.data_url; })
      .map(function(i){ return i.image_type + ":" + (i.data_url || "").length; }).join("|");
    const cached = caseData._evidence_cache;
    const cacheHit = cached && cached.fingerprint === imgFingerprint && cached.digest;
    if (cacheHit) {
      console.info("[NCW runQuickMode] Cache hit — reusing Stage 0 evidence digest (fingerprint unchanged)");
    }

    // ── Stage 0: Photo Evidence Digest ──────────────────────────
    // Scan ALL submitted photos in a SINGLE call.
    // Build a combined evidence list that updates as photos are added.
    // This is the only stage that looks at images directly.
    const photoCount  = images.filter(i => i.data_url).length;
    const imageLabels = images.map(i => i.image_type).join(", ");

    let digest: Record<string, any> = {
      photos_used_count:       photoCount,
      photo_types_included:    images.map(i => i.image_type),
      evidence_digest:         [],
      mechanical_signatures:   [],
      strongest_signature:     null,
      fastener_clues:          [],
      toolmark_clues:          [],
      hardware_clues:          [],
      primary_wood_guess:      "",
      broad_form_guess:        "",
      hard_negatives:          [],
      image_quality_overall:   "unknown",
    };

    try {
      const digestResult = cacheHit
        ? cached.digest  // reuse cached result — no API call
        : await runEvidenceDigest(images, {
            photoCount, imageLabels, userGuess: intake.user_category_guess || "",
          });
      console.info("[NCW FS Stage0] digestResult.ok:", digestResult.ok, "| keys:", Object.keys(digestResult).join(", "));
if ((digestResult as any)._diag) { (digest as any)._diag = (digestResult as any)._diag; }
if (digestResult.ok !== false) {
  digest = { ...digest, ...digestResult };
  if ((digestResult as any)._diag) (digest as any)._diag = (digestResult as any)._diag;
}
        digest.photos_used_count    = photoCount;
        digest.photo_types_included = images.map(i => i.image_type);
        if (!digest.mechanisms_detected) digest.mechanisms_detected = {};
        // ── Fallback extractor: if evidence_digest empty but LLM saw the images, ──
        // synthesize minimal clues from broad_form_guess + mechanisms_detected
        if ((!digest.evidence_digest || digest.evidence_digest.length === 0) && digest.broad_form_guess) {
          digest.evidence_digest = ["Broad form observed: " + digest.broad_form_guess];
        }
        if ((!digest.evidence_digest || digest.evidence_digest.length === 0)) {
          // Last-resort: extract any present mechanisms into prose
          const mechProse = Object.entries((digest.mechanisms_detected || {}) as Record<string, any>)
  .filter(([, v]) => v && (v as any).present)
  .map(([k, v]) => k.replace(/_/g, " ") + ((v as any).note ? " — " + (v as any).note : ""));
         if (mechProse.length > 0) digest.evidence_digest = mechProse;
console.info(
  "[NCW FS Stage0] Digest after merge — evidence_digest:",
  digest.evidence_digest,
  "| mechanisms:",
  Object.keys(digest.mechanisms_detected || {}).filter(k => digest.mechanisms_detected[k].present)
);
      } else {
        // Store the raw failure response in digest so debug panel can read it
        digest._raw_response = digestResult.raw_response || "";
        digest._raw_response_len = (digestResult.raw_response || "").length;
        digest._error_type       = digestResult.error_type || "unknown";
        // Store full diagnostics object if available
        if (digestResult._diag) {
          digest._diag = digestResult._diag;
        }
        console.warn("[NCW FS Stage0] Digest degraded — error_type:", digestResult.error_type, "| raw (first 400):", (digestResult.raw_response||"").slice(0,400));
      }
    } catch(e) {
      digest._cf_catch_message = e.message;
      digest._cf_catch_stack   = (e.stack || "").slice(0, 300);
      console.error("[NCW FS Stage0] CAUGHT:", e.message, "stack:", (e.stack||"").slice(0,200));
    }
    // Store raw response length for debug visibility
    digest._raw_response_len = digest._raw_response ? digest._raw_response.length : 0;
    so["0_evidence_digest"] = digest;
    if (typeof onPhase === "function") onPhase(0, digest);
    // Store in caseData evidence cache for reuse on rerun or mode upgrade
    caseData._evidence_cache = { fingerprint: imgFingerprint, digest: digest };
    caseData._visual_evidence = digest;  // canonical visual_evidence alias

    // ── Client-side mechanism resolver ───────────────────────────
    // Reads structured mechanisms_detected flags + prose evidence_digest.
    // Applies form taxonomy: family → subfamily → specific form.
    // Runs BEFORE Stage 1 and pre-populates formResult if signatures clear.
    const mech = digest.mechanisms_detected || {};
    const mechPresent = (key, minConf = 25) =>
      !!(mech[key] && mech[key].present === true && (mech[key].confidence || 0) >= minConf);
    const digestProse = (digest.evidence_digest || []).join(" ").toLowerCase();
    // Also check mechanical_signatures array
    const sigClues = (digest.mechanical_signatures || []).map(s => (s.clue || s.implied_form || "").toLowerCase()).join(" ");
    const anyOf = (...terms) => terms.some(t => digestProse.includes(t) || sigClues.includes(t));

    let clientSideFamily    = null;
    let clientSideSubfamily = null;
    let clientSideForm      = null;
    let clientSideKey       = null;
    let clientSideMethod    = "broad_fallback";
    let clientSideConf      = "Low";

    // TABLE FAMILY
    if (mechPresent("drop_leaf_hinged") || anyOf("leaf","drop leaf","hinged leaf","hinge line","leaf seam","fold seam")) {
      clientSideFamily = "table";
      clientSideKey    = "table";
      if (mechPresent("gateleg_support") || anyOf("gateleg","gate leg","gate support","swing gate","swing frame","pivot leg","swing-leg","pivoting leg","extra leg","secondary leg")) {
        clientSideSubfamily = "drop-leaf table";
        clientSideForm      = "gateleg drop-leaf table";
        clientSideMethod    = "mechanical_signature";
        clientSideConf      = "Moderate";
      } else if (mechPresent("swing_leg") || anyOf("swing leg","pembroke","single pivot leg")) {
        clientSideSubfamily = "drop-leaf table";
        clientSideForm      = "pembroke table";
        clientSideMethod    = "mechanical_signature";
        clientSideConf      = "Moderate";
      } else {
        clientSideSubfamily = "drop-leaf table";
        clientSideForm      = "drop-leaf table";
        clientSideMethod    = "mechanical_signature";
        clientSideConf      = "Moderate";
      }
    } else if (mechPresent("extension_mechanism") || anyOf("extension","slide mechanism","extra leaf")) {
      clientSideFamily    = "table";
      clientSideSubfamily = "extension table";
      clientSideForm      = "extension dining table";
      clientSideKey       = "table";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "Moderate";
    } else if ((mechPresent("pedestal_base") && mechPresent("tilt_top")) || anyOf("tilt top","tilt-top")) {
      clientSideFamily    = "table";
      clientSideSubfamily = "tilt-top table";
      clientSideForm      = "tilt-top table";
      clientSideKey       = "table";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "High";
    } else if (mechPresent("tripod_base") || anyOf("tripod","candlestand")) {
      clientSideFamily    = "table";
      clientSideSubfamily = "pedestal table";
      clientSideForm      = "tripod pedestal table";
      clientSideKey       = "table";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "High";
    } // CHEST FAMILY
    else if (mechPresent("lift_lid") || anyOf("lift lid","hinged top","hinged lid","chest lid","lid hinge")) {
      clientSideFamily = "chest";
      clientSideKey    = "chest";
      if (mechPresent("till_interior") || anyOf("till","tray inside","interior tray")) {
        clientSideSubfamily = "blanket chest";
        clientSideForm      = "blanket chest";
      } else {
        clientSideSubfamily = "storage chest";
        clientSideForm      = "storage chest or trunk";
      }
      clientSideMethod = "mechanical_signature";
      clientSideConf   = "High";
    } // DESK FAMILY
    else if (mechPresent("cylinder_roll") || anyOf("rolltop","roll top","tambour","cylinder roll")) {
      clientSideFamily    = "desk";
      clientSideSubfamily = "rolltop desk";
      clientSideForm      = "rolltop desk";
      clientSideKey       = "desk";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "High";
    } else if (mechPresent("slant_front") || anyOf("slant front","slant-front")) {
      clientSideFamily    = "desk";
      clientSideSubfamily = "slant-front desk";
      clientSideForm      = "slant-front desk";
      clientSideKey       = "desk";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "High";
    } else if (mechPresent("fall_front") || anyOf("fall front","secretary","fall-front")) {
      clientSideFamily    = "desk";
      clientSideSubfamily = "secretary desk";
      clientSideForm      = "secretary desk";
      clientSideKey       = "desk";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "Moderate";
    } // SPECIALIZED
    else if (mechPresent("pedal_cavity_structure") || anyOf("pedal","organ")) {
      clientSideFamily    = "specialized";
      clientSideSubfamily = "organ cabinet";
      clientSideForm      = "pump organ cabinet (converted)";
      clientSideKey       = "specialized";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "High";
    } else if (mechPresent("treadle_mount") || anyOf("treadle","sewing machine")) {
      clientSideFamily    = "specialized";
      clientSideSubfamily = "sewing cabinet";
      clientSideForm      = "sewing machine cabinet";
      clientSideKey       = "specialized";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "High";
    } else if (mechPresent("washstand_splash") || anyOf("washstand","splash back","basin shelf")) {
      clientSideFamily    = "cabinet";
      clientSideSubfamily = "washstand";
      clientSideForm      = "washstand";
      clientSideKey       = "cabinet";
      clientSideMethod    = "structural_logic";
      clientSideConf      = "Moderate";
    }

    // TABLE FALLBACK: user guess "table" + any table-related evidence
    if (!clientSideFamily) {
      const g = (intake.user_category_guess || "").toLowerCase();
      if (g.includes("table") && anyOf("leg","top","rail","caster","apron","turned leg","stretcher")) {
        clientSideFamily    = "table";
        clientSideSubfamily = "table";
        clientSideForm      = "table";
        clientSideKey       = "table";
        clientSideMethod    = "broad_fallback";
        clientSideConf      = "Low";
      }
    }

    console.info("[NCW FS Client-Resolver]", { form: clientSideForm, method: clientSideMethod, conf: clientSideConf, mechKeys: Object.keys(mech).filter(k => mech[k].present) });



    // ── Stage 1: Form Recognition ────────────────────────────────
    // FORM FAMILY TAXONOMY:
    //   family (e.g. table) → subfamily (e.g. drop-leaf table) → specific form (e.g. gateleg drop-leaf table)
    // Client-side pre-populated form is used if LLM call fails or returns weaker result.
    let formResult = {
      form_family:          clientSideFamily    || "unknown",
      subfamily:            clientSideSubfamily || null,
      recognized_form:      clientSideForm      || null,
      recognition_method:   clientSideMethod,
      signature_used:       null,
      form_confidence:      clientSideConf,
      broad_form_key:       clientSideKey       || "cabinet",
      is_broad_category:    !clientSideForm || clientSideMethod === "broad_fallback",
      alternate_forms:      [],
      recognition_notes:    "",
    };

    try {
      const fResult = await this.callClaudeQuick(
        `You are the Form Recognition engine for the NCW Field Scan Furniture Identification Engine.

Your ONLY job: identify the furniture form using the three-level taxonomy below.
Do NOT estimate dates. Do NOT assign values. Just classify the form.

FORM TAXONOMY — always output all three levels:
Level 1 — FORM FAMILY:   table | chest | cabinet | desk | seating | stand | bed | specialized
Level 2 — SUBFAMILY:     specific mechanism or subtype family
Level 3 — SPECIFIC FORM: narrowest defensible form name

EVIDENCE FROM ${digest.photos_used_count} PHOTOS:
${JSON.stringify(digest.evidence_digest)}

STRUCTURAL MECHANISMS DETECTED:
${JSON.stringify(
  Object.entries(mech as Record<string, any>)
    .filter(([, v]) => (v as any).present)
    .map(([k, v]) => ({
      mechanism: k,
      confidence: (v as any).confidence,
      note: (v as any).note
    }))
)}
Strongest mechanism: ${digest.strongest_mechanism || "none detected"}

CLIENT-SIDE FORM CANDIDATE (pre-computed): ${clientSideForm || "none"}
CLIENT-SIDE METHOD: ${clientSideMethod}

USER GUESS (light prior — mechanisms take priority): ${intake.user_category_guess || "none"}

TAXONOMY RULES — apply in order:

TABLE FAMILY:
• drop_leaf_hinged + gateleg_support (ANY confidence > 0)  → family:table | subfamily:drop-leaf table | form:gateleg drop-leaf table
• drop_leaf_hinged + swing_leg                             → family:table | subfamily:drop-leaf table | form:pembroke table
• drop_leaf_hinged only                                    → family:table | subfamily:drop-leaf table | form:drop-leaf table
• extension_mechanism                                      → family:table | subfamily:extension table  | form:extension dining table
• pedestal_base + tilt_top                                 → family:table | subfamily:tilt-top table   | form:tilt-top table
• tripod_base                                              → family:table | subfamily:pedestal table   | form:tripod pedestal table
• general table evidence only                              → family:table | subfamily:table            | form:table

CHEST FAMILY:
• lift_lid + till_interior  → family:chest | subfamily:blanket chest | form:blanket chest
• lift_lid only             → family:chest | subfamily:storage chest | form:storage chest or trunk

DESK FAMILY:
• cylinder_roll             → family:desk | subfamily:rolltop desk     | form:rolltop desk
• slant_front               → family:desk | subfamily:slant-front desk | form:slant-front desk
• fall_front + pigeonholes  → family:desk | subfamily:secretary desk   | form:secretary desk
• fall_front only           → family:desk | subfamily:fall-front desk  | form:fall-front desk

CABINET / CASE FAMILY:
• washstand_splash          → family:cabinet | subfamily:washstand    | form:washstand
• multiple_drawer_case (4+) → family:cabinet | subfamily:chest of drawers | form:chest of drawers
• multiple_drawer_case + mirror → family:cabinet | subfamily:dresser  | form:dresser
• door_present (tall case)  → family:cabinet | subfamily:wardrobe     | form:wardrobe

SPECIALIZED:
• pedal_cavity_structure    → family:specialized | subfamily:organ cabinet       | form:pump organ cabinet (converted)
• treadle_mount             → family:specialized | subfamily:sewing cabinet      | form:sewing machine cabinet

IMPORTANT:
• IF the client-side candidate is "gateleg drop-leaf table" — accept it unless you have strong evidence against it
• NEVER output "Undetermined" — always return the best available form at any taxonomy level
• If only form_family is determinable, return that with subfamily and specific_form as null

CONFIDENCE:
• "Very High" — multiple confirming mechanisms clearly present
• "High"      — single clear mechanism confirmed
• "Moderate"  — mechanism partially visible or family clear but subtype uncertain
• "Low"       — broad family only

BROAD_FORM_KEY — one of: chest | table | cabinet | dresser | wardrobe | desk | seating | stand | shelf | specialized

OUTPUT — all fields required:
{
  "form_family":     "table",
  "subfamily":       "drop-leaf table",
  "recognized_form": "gateleg drop-leaf table",
  "recognition_method": "mechanical_signature|structural_logic|visual_impression|broad_fallback",
  "signature_used":  "the specific mechanism that drove identification",
  "form_confidence": "Very High|High|Moderate|Low",
  "broad_form_key":  "table",
  "is_broad_category": false,
  "alternate_forms": [],
  "recognition_notes": "one sentence"
}

Respond ONLY in valid JSON. Begin with {.`,
        []
      );

      if (fResult.ok !== false && fResult.recognized_form && fResult.recognized_form !== "Undetermined") {
        // LLM returned a valid result — use it if it's at least as specific as client-side
        const llmIsSpecific = fResult.recognition_method !== "broad_fallback" || !clientSideForm;
        if (llmIsSpecific || !clientSideForm) {
          formResult = { ...formResult, ...fResult };
        } else {
          // Keep client-side result if LLM fell back but client-side found a form
          console.info("[NCW FS Stage1] Keeping client-side form over LLM broad fallback:", clientSideForm, ">", fResult.recognized_form);
          formResult.form_family  = fResult.form_family || clientSideFamily || "unknown";
          formResult.subfamily    = fResult.subfamily   || clientSideSubfamily || null;
          formResult.alternate_forms = fResult.alternate_forms || [];
          formResult.recognition_notes = fResult.recognition_notes || "";
        }
      } else {
        console.warn("[NCW FS Stage1] LLM Form Recognition failed or returned Undetermined — using client-side resolver result");
        // Keep the client-side formResult already set
      }
    } catch(e) { console.warn("[NCW FS Stage1] Error:", e.message); }

    // Final safety net — never return null form
    if (!formResult.recognized_form) {
      const g = (intake.user_category_guess || "").toLowerCase();
      formResult.recognized_form = g || digest.broad_form_guess || "furniture (form undetermined)";
      formResult.form_family     = formResult.form_family || "unknown";
      formResult.is_broad_category = true;
      formResult.form_confidence   = "Low";
    }

    so["1_form_recognition"] = formResult;
    if (typeof onPhase === "function") onPhase(1, formResult);



    // ── Stage 2: Date Estimation ─────────────────────────────────
    // Uses digest. One job: date the piece from fasteners/toolmarks/hardware.
    let dateResult = {
      primary_date_range:  "Date uncertain",
      dating_confidence:   "Low",
      key_dating_evidence: [],
      hard_negatives:      digest.hard_negatives || [],
    };
    try {
      const dResult = await this.callClaudeQuick(
        `You are the Dating Engine for the NCW Field Scan Furniture Identification Engine.
Your ONLY job: estimate the manufacture date from fastener, toolmark, and hardware evidence.

FORM IDENTIFIED: ${formResult.recognized_form}
FASTENER CLUES: ${JSON.stringify(digest.fastener_clues)}
TOOLMARK CLUES: ${JSON.stringify(digest.toolmark_clues)}
HARDWARE CLUES: ${JSON.stringify(digest.hardware_clues)}
HARD NEGATIVES: ${JSON.stringify(digest.hard_negatives)}

DATE RULES:
• hand_forged_nail → pre-1800
• cut_nail → 1790–1890
• wire_nail → post-1880
• slotted_handmade_screw → 1770–1840
• slotted_machine_screw → post-1840
• phillips_screw → post-1930 (HARD NEGATIVE)
• pit_saw_marks → pre-1830
• circular_saw_arcs → post-1830
• band_saw_lines → post-1870
• porcelain_caster → 1830–1870
• victorian_strap_hinge → 1865–1895
• batwing_brass_pull → 1720–1790

If no dating clues: return a wide band based on the identified form's known era.

OUTPUT:
{
  "primary_date_range": "e.g. 1870–1910 or wide band 1840–1920",
  "dating_confidence": "High|Moderate|Low",
  "key_dating_evidence": ["list strongest 2-4 dating clues"],
  "hard_negatives": []
}
Respond ONLY in valid JSON. Begin with {.`,
        []  // No images — uses digest only
      );
      if (dResult.ok !== false && dResult.primary_date_range) {
        dateResult = { ...dateResult, ...dResult };
      }
    } catch(e) { console.warn("[NCW FS Stage2] Date estimation error:", e.message); }
    so["2_date_estimation"] = dateResult;
    if (typeof onPhase === "function") onPhase(2, dateResult);

    // ── Stage 3: Market / Buy Guidance ───────────────────────────
    // Uses form + date only. One job: value and signal.
    let marketResult = {
      estimated_value_low:  0,
      estimated_value_high: 0,
      buy_guidance:         "Caution",
      short_reason:         "",
    };
    try {
      const mResult = await this.callClaudeQuick(
        `You are the Market Guidance engine for the NCW Field Scan Furniture Identification Engine.
Provide a realistic retail value range and buy signal for this piece.

FORM: ${formResult.recognized_form}
DATE: ${dateResult.primary_date_range}
HARD NEGATIVES: ${JSON.stringify(digest.hard_negatives)}
ASKING PRICE: ${askingPrice !== null ? "$"+askingPrice : "not provided"}

PICKER PROFILE (buyer preferences — adjust guidance accordingly):
${intake._picker_profile ? JSON.stringify(intake._picker_profile) : "not set"}

BUY SIGNAL RULES:
• "Buy"     — clear pre-1920 form, no hard negatives, good resale potential
• "Caution" — uncertain form OR mid-period OR inspection needed
• "Pass"    — hard negatives present OR likely modern reproduction
If picker profile sets deal_target="exceptional", raise the bar for "Buy" — only strong deals qualify.
If picker profile sets work_tolerance="none", downgrade pieces needing restoration to "Caution".
If picker profile sets storage_space="very_limited", penalize large forms (wardrobes, sideboards).

VALUE: Realistic USD retail range for this form in typical antique market condition.
If hard negatives present, reduce range significantly. If form is uncertain, use wide range or 0.

OUTPUT:
{
  "estimated_value_low": 0,
  "estimated_value_high": 0,
  "buy_guidance": "Buy|Caution|Pass",
  "short_reason": "one sentence"
}
Respond ONLY in valid JSON. Begin with {.`,
        []
      );
      if (mResult.ok !== false) marketResult = { ...marketResult, ...mResult };
    } catch(e) { console.warn("[NCW FS Stage3] Market guidance error:", e.message); }
    so["3_market_guidance"] = marketResult;
    if (typeof onPhase === "function") onPhase(3, marketResult);

    // ── Price comparison (client-side) ───────────────────────────
    const valLow  = Number(marketResult.estimated_value_low)  || 0;
    const valHigh = Number(marketResult.estimated_value_high) || 0;
    let priceGuidance = null;
    // Picker-aware price thresholds
    const _pp = intake._picker_profile || {};
    const _dealThreshold = {
      exceptional: 0.25, strong: 0.40, moderate: 0.50, small: 0.65,
    }[_pp.deal_target] || 0.60;
    const _workPenalty = _pp.work_tolerance === "none" ? 0.10 : 0; // shrinks "good buy" window if no restoration
    if (askingPrice !== null && valLow > 0 && valHigh > 0) {
      if      (askingPrice < valLow * (_dealThreshold + _workPenalty)) priceGuidance = "GOOD BUY";
      else if (askingPrice <= valHigh)                                 priceGuidance = "FAIR PRICE";
      else                                                             priceGuidance = "OVERPRICED";
    } else if (askingPrice !== null && (valLow === 0 && valHigh === 0)) {
      priceGuidance = "UNAVAILABLE";
    }

    // ── Broad-form fallback key ───────────────────────────────────
    const broadFormKey = formResult.broad_form_key || (() => {
      const g = (intake.user_category_guess || "").toLowerCase();
      if (g.includes("chest") || g.includes("trunk")) return "chest";
      if (g.includes("table"))  return "table";
      if (g.includes("chair") || g.includes("stool"))  return "seating";
      if (g.includes("desk"))   return "desk";
      if (g.includes("dresser") || g.includes("drawer")) return "dresser";
      if (g.includes("wardrobe")) return "wardrobe";
      return "cabinet";
    })();

    return {
      stage_outputs: so,
      quick_result: {
        // Identification — taxonomy layers
        likely_identification:  formResult.recognized_form,
        form_family:            formResult.form_family || broadFormKey,
        subfamily:              formResult.subfamily || null,
        broad_form_key:         broadFormKey,
        form_signature_used:    formResult.signature_used,
        recognition_method:     formResult.recognition_method,
        is_broad_category:      formResult.is_broad_category,
        mechanisms_detected:    Object.keys(digest.mechanisms_detected || {}).filter(k => (digest.mechanisms_detected[k] && digest.mechanisms_detected[k].present)),
        followup_photo_suggestions: [],
        // Date
        estimated_date_range:   dateResult.primary_date_range,
        // Confidence
        confidence:             formResult.form_confidence,
        // Value
        estimated_value_low:    valLow,
        estimated_value_high:   valHigh,
        buy_guidance:           marketResult.buy_guidance,
        short_reason:           marketResult.short_reason,
        asking_price:           askingPrice,
        price_guidance:         priceGuidance,
        // Evidence digest — displayed in result UI
        photos_used_count:      digest.photos_used_count,
        photo_types_included:   digest.photo_types_included,
        evidence_digest:        digest.evidence_digest || [],
        key_dating_evidence:    dateResult.key_dating_evidence || [],
        hard_negatives:         digest.hard_negatives || [],
        primary_wood:           digest.primary_wood_guess || "",
        recommend_full:         true,
      },
    };
  },



  async runAllPhases(caseData, images, intake, onPhase) {
    const so   = {};
    const skip = (reason) => ({
      ok: true, skipped: true, skip_reason: reason,
      age_support_points: 0, age_opposing_points: 0,
      originality_support_points: 0, originality_opposing_points: 0,
      form_support_points: 0, form_opposing_points: 0,
      conversion_support_points: 0, conversion_opposing_points: 0,
    });

    // ── Phase runner helper: wraps each phase in try/catch,
    //    validates the result, logs errors, and throws a structured PhaseError.
    const runPhase = async (key, label, stageName, fn) => {
      try {
        const result = await fn();
        // Debug: log raw result before assertPhase
        if (key === "1_intake") {
          console.info("[NCW P1 Debug] raw result ok:", result && result.ok,
            "| keys:", result ? Object.keys(result).join(", ") : "null");
          if (result && result.ok === false) {
            console.warn("[NCW P1 Debug] raw_response:", (result.raw_response||"").slice(0,500));
          } else {
            console.info("[NCW P1 Debug] normalized payload keys:", result ? Object.keys(result).join(", ") : "null");
            console.info("[NCW P1 Debug] evidence_inventory:", JSON.stringify(result.evidence_inventory));
            console.info("[NCW P1 Debug] phase_triggers:", JSON.stringify(result.phase_triggers));
            console.info("[NCW P1 Debug] evidence_sufficiency:", result.evidence_sufficiency);
          }
        }
        this.assertPhase(result, stageName, label);   // throws PhaseError if ok===false
        so[key] = result;
        onPhase(parseInt(key.split("_")[0]), result);
        return result;
      } catch (err) {
        // Enrich with phase metadata if not already a PhaseError
        if (!err.isPhaseError) {
          err.isPhaseError    = true;
          err.stage_name      = stageName;
          err.phase_label     = label;
          err.error_type      = err.error_type || "runtime_error";
          err.error_message   = err.message    || "Unexpected error";
          err.raw_response    = err.raw_response || "";
          err.retry_attempted = false;
        }
        console.error(`[NCW PhaseError] ${stageName}`, {
          case_id:       caseData.id,
          stage_name:    err.stage_name,
          error_type:    err.error_type,
          error_message: err.error_message,
          raw_response:  err.raw_response.slice(0, 500),
        });
        // Store partial result in stage_outputs so UI can show what ran
        so[key] = { ok: false, stage_name: stageName, error_type: err.error_type, error_message: err.error_message, raw_response: err.raw_response };
        // Re-throw as a structured payload the UI can unpack
        const payload = {
          ok:            false,
          failed_stage:  label,
          error: {
            stage_name:      err.stage_name,
            phase_label:     err.phase_label,
            error_type:      err.error_type,
            error_message:   err.error_message,
            raw_response:    err.raw_response    || "",
            retry_attempted: (err.retry_attempted != null) ? err.retry_attempted : false,
          },
        };
        const richErr = new Error(JSON.stringify(payload)) as Error & {
  phasePayload?: any;
};

richErr.phasePayload = payload;
throw richErr;
      }
    };

    // Phase 0 — Visual Evidence Scanner
    // NOT routed through runPhase/assertPhase — p0 is self-tolerant and never throws.
    // If Field Scan already ran on these images, reuse its evidence cache.
    const priorEvidence = caseData._evidence_cache;
    const fullImgFingerprint = (images || []).filter(function(i){ return i.data_url; })
      .map(function(i){ return i.image_type + ":" + (i.data_url||"").length; }).join("|");
    const fullCacheHit = priorEvidence && priorEvidence.fingerprint === fullImgFingerprint
      && priorEvidence.digest && priorEvidence.digest.phase_0_status;
    let p0;
    if (fullCacheHit) {
      console.info("[NCW P0] Cache hit — reusing Field Scan evidence (no re-extraction needed)");
      p0 = priorEvidence.digest;
    } else try {
      p0 = await this.p0(images);
      so["0_visual_scan"] = p0;
      if (typeof onPhase === "function") onPhase(0, p0);
      console.info("[NCW P0] Complete. status:", p0.phase_0_status, "| obs:", p0.total_observations, "| recovery:", p0.recovery_used);
    } catch(e) {
      console.error("[NCW P0] Unexpected throw:", e.message);
      p0 = {
        skipped:false, phase_0_status:"unexpected_throw", recovery_used:false,
        total_observations:0, observations_by_type:{}, hard_negatives_detected:[],
        images_scanned: images.filter(i=>i.data_url).length,
        scan_summary:{ scan_confidence:"none" }, primary_wood_observed:"",
        secondary_wood_observed:"", broad_form_impression:"", condition_impression:"unknown",
        anomalies_noted:[], _error: e.message,
      };
      so["0_visual_scan"] = p0;
      onPhase(0, p0);
    }

    // Phase 1 — Intake Controller
    const p1 = await runPhase("1_intake", "Phase 1 — Intake Controller", "phase_1_intake",
      () => this.p1(caseData, images, intake, p0));

    // Phase 2 — Rapid Dating Grid (conditional)
    const p2 = this.triggered(p1, "run_dating_grid")
      ? await runPhase("2_dating", "Phase 2 — Rapid Dating Grid", "phase_2_dating",
          () => this.p2(caseData, images, p0, p1))
      : skip("No structural dating evidence visible");
    if (!p2.skipped) { so["2_dating"] = p2; if (typeof onPhase === "function") onPhase(2, p2); }

    // Phase 3 — Form Decision Engine (conditional)
    const p3 = this.triggered(p1, "run_form_engine")
      ? await runPhase("3_form", "Phase 3 — Form Decision Engine", "phase_3_form_decision",
          () => this.p3(caseData, images, p0, p1, p2))
      : { ...skip("No overall form visible"), current_form_candidate:"Unknown", original_form_candidate:"Unknown", is_conversion:false, conversion_probability:"Low", form_confidence:"Low", alternate_form_candidates:[] };
    if (!p3.skipped) { so["3_form"] = p3; if (typeof onPhase === "function") onPhase(3, p3); }

    // Phase 4 — Construction Analysis (conditional)
    const p4 = this.triggered(p1, "run_construction")
      ? await runPhase("4_construction", "Phase 4 — Construction Analysis", "phase_4_construction",
          () => this.p4(caseData, images, p0, p1, p2, p3))
      : skip("No construction detail visible");
    if (!p4.skipped) { so["4_construction"] = p4; if (typeof onPhase === "function") onPhase(4, p4); }

    // Phase 5 — Hardware Analysis (conditional)
    const p5 = this.triggered(p1, "run_hardware")
      ? await runPhase("5_hardware", "Phase 5 — Hardware Analysis", "phase_5_hardware",
          () => this.p5(caseData, images, p0, p1, p2, p3, p4))
      : skip("No hardware visible");
    if (!p5.skipped) { so["5_hardware"] = p5; if (typeof onPhase === "function") onPhase(5, p5); }

    // Phase 6 — Conflict Detection Engine
    const p6c = await runPhase("6_conflict", "Phase 6 — Conflict Detection Engine", "phase_6_conflict",
      () => this.p6_conflict(p0, p1, p2, p3, p4, p5));

    // Phase 7 — Reconciliation
    const p7 = await runPhase("7_reconciliation", "Phase 7 — Reconciliation", "phase_7_reconciliation",
      () => this.p7(p1, p2, p3, p4, p5, p6c));

    // Phase 8 — Valuation
    const p8 = await runPhase("8_valuation", "Phase 8 — Valuation", "phase_8_valuation",
      () => this.p8(p3, p7));

    // ── Assemble final outputs ───────────────────────────────
    const sc      = p7.scorecard || {};
    const sup     = p7.overall_supporting_points || 0;
    const opp     = p7.overall_opposing_points   || 0;
    const rawConf = opp > 0 ? (sup / (sup + opp)) * 100 : sup > 0 ? 88 : 50;
    const confPct = Math.min(100, Math.max(0, p7.confidence_percent || rawConf));
    const confBand = p7.confidence_band || WM.bandOf(confPct);

    const scores = {
      ...sc,
      overall_supporting_points:  sup,
      overall_opposing_points:    opp,
      raw_confidence_percent:     Math.round(rawConf),
      overall_confidence_percent: Math.round(confPct),
      confidence_band:            confBand,
      conflict_net_adjustment:    p6c.total_net_adjustment || 0,
    };

    const conflicts = [
      ...(p6c.conflicts_detected || []).map(c => ({
        conflict_type:       c.conflict_type,
        evidence_a:          c.trigger_evidence_a,
        evidence_b:          c.trigger_evidence_b,
        likely_explanation:  c.likely_explanation,
        severity:            c.severity,
        confidence_penalty:  c.confidence_penalty,
        confidence_recovery: c.confidence_recovery,
        net_adjustment:      c.net_adjustment,
        resolved:            c.resolved,
        resolution_narrative:c.resolution_narrative,
      })),
      ...(p7.conflicts_found || []).map(c => ({
        conflict_type:       "evidence_conflict",
        evidence_a:          c.conflict,
        likely_explanation:  c.explanation_attempted,
        confidence_penalty:  c.penalty_applied || 0,
        resolved:            c.resolved || false,
        resolution_narrative:c.recovery_applied ? `+${c.recovery_applied} pts recovered — ${c.resolution_note || ""}` : "",
      })),
    ];

    const form_assessment = {
      current_form_candidate:   p3.current_form_candidate,
      original_form_candidate:  p3.original_form_candidate,
      alternate_form_candidates:p3.alternate_form_candidates || [],
      conversion_probability:   p3.conversion_probability,
      form_confidence:          p3.form_confidence,
      object_classification:    p7.object_classification || p6c.object_classification_suggested || "unknown",
    };

    const valuations = (p8.valuations || []).map(v => ({
      market_lane:    v.market_lane,
      low_estimate:   v.low,
      high_estimate:  v.high,
      currency:       "USD",
      rationale:      v.rationale,
      confidence_band:confBand,
    }));

    const identName = p3.is_conversion
      ? `${p3.original_form_candidate} converted to ${p3.current_form_candidate}`
      : (p3.current_form_candidate || "Form undetermined");

    const final_report = {
      identified_object_name:     identName,
      original_form_text:         p3.original_form_candidate,
      current_form_text:          p3.current_form_candidate,
      object_classification:      p7.object_classification || p6c.object_classification_suggested || "unknown",
      date_range_text:            p7.reconciled_date_range || p2.primary_date_range || "Undetermined",
      style_family:               p7.reconciled_style_family,
      confidence_text:            `${confBand} (${Math.round(confPct)}%)`,
      supporting_evidence:        p7.supporting_evidence || [],
      alterations:                p7.alterations || [],
      summary_text:               p7.reconciliation_notes || "",
      conflict_interpretation:    p6c.conflict_interpretation_for_report || "",
      conflicts_detected:         p6c.conflicts_detected || [],
      valuations,
      value_drivers:              p8.value_drivers || [],
      value_detractors:           p8.value_detractors || [],
      market_notes:               p8.market_notes || "",
      valuation_skipped:          p8.valuation_skipped || false,
      valuation_provisional:      p8.provisional || false,
      value_adjustments:          p8.value_adjustments_applied || [],
    };

    return { stage_outputs: so, conflicts, scores, form_assessment, valuations, final_report };
  },

  // ── Observation digest builder ────────────────────────────
  // Compact structured summary of Phase 0 observations,
  // injected into every downstream phase prompt.
  _buildObsDigest(caseId, p0) {
    const observations = API.getObservations(caseId);
    if (!observations.length) return { empty: true, summary: "No visual observations recorded." };

    const grouped = {};
    for (const obs of observations) {
      if (!grouped[obs.observation_type]) grouped[obs.observation_type] = [];
      grouped[obs.observation_type].push({
        clue:                obs.reference_id,
        observed:            obs.observed_value_text,
        raw_confidence:      obs.raw_confidence,
        weight_multiplier:   obs.weight_multiplier,
        effective_confidence:obs.effective_confidence,
        is_hidden_surface:   obs.is_hidden_surface,
        region:              obs.region_label,
        human_reviewed:      obs.human_reviewed,
      });
    }
    for (const t of Object.keys(grouped)) {
      grouped[t].sort((a, b) => b.effective_confidence - a.effective_confidence);
    }
    const hard_negatives = p0.hard_negatives_detected || [];
    return {
      empty:            false,
      total:            observations.length,
      by_type:          grouped,
      hard_negatives,
      summary: `Phase 0 found ${observations.length} visual observations across ${Object.keys(grouped).length} evidence types.${hard_negatives.length ? ` ⚠ ${hard_negatives.length} hard negative(s) detected.` : ""}`,
    };
  },
};

// ============================================================
// UI CONSTANTS
// ============================================================
// Core photo slots — one upload per slot
// ── Photo coaching examples ───────────────────────────────────
// Each entry has an SVG illustration (drawn inline, no external
// assets) and bullet-point guidance describing what makes it good.
// Keyed to slot.key or group.key.
const PHOTO_EXAMPLES = {
  overall_front: {
    title: "Overall Front — Good Example",
    tips: [
      "Entire piece visible from top to bottom",
      "Camera held level, not angled up or down",
      "Legs and top both fully in frame",
      "Neutral, straight-on angle — no perspective distortion",
      "Even lighting — avoid harsh shadows across the face",
    ],
    // SVG: a simple cabinet schematic showing correct framing
    svg: `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <rect width="200" height="220" fill="#f5efe4"/>
      <!-- frame guide dashes -->
      <rect x="8" y="8" width="184" height="204" rx="2" fill="none" stroke="#d4c9b4" stroke-width="1" stroke-dasharray="4 3"/>
      <!-- piece body -->
      <rect x="38" y="30" width="124" height="150" rx="2" fill="#e8dcc8" stroke="#8b6914" stroke-width="1.5"/>
      <!-- top rail -->
      <rect x="38" y="30" width="124" height="14" rx="2" fill="#d4c4a0" stroke="#8b6914" stroke-width="1"/>
      <!-- two drawer faces -->
      <rect x="46" y="52" width="108" height="36" rx="1" fill="#ddd0b0" stroke="#8b6914" stroke-width="1"/>
      <circle cx="100" cy="70" r="4" fill="#8b6914"/>
      <rect x="46" y="96" width="108" height="36" rx="1" fill="#ddd0b0" stroke="#8b6914" stroke-width="1"/>
      <circle cx="100" cy="114" r="4" fill="#8b6914"/>
      <!-- door panel below drawers -->
      <rect x="46" y="140" width="50" height="34" rx="1" fill="#ddd0b0" stroke="#8b6914" stroke-width="1"/>
      <rect x="102" y="140" width="50" height="34" rx="1" fill="#ddd0b0" stroke="#8b6914" stroke-width="1"/>
      <!-- legs -->
      <rect x="42" y="180" width="10" height="28" rx="1" fill="#c8b888" stroke="#8b6914" stroke-width="1"/>
      <rect x="148" y="180" width="10" height="28" rx="1" fill="#c8b888" stroke="#8b6914" stroke-width="1"/>
      <!-- camera level indicator -->
      <line x1="8" y1="100" x2="28" y2="100" stroke="#5a6b52" stroke-width="1.5" stroke-dasharray="3 2"/>
      <line x1="172" y1="100" x2="192" y2="100" stroke="#5a6b52" stroke-width="1.5" stroke-dasharray="3 2"/>
      <!-- check mark -->
      <circle cx="170" cy="40" r="12" fill="#5a6b52"/>
      <path d="M164 40 l4 4 l8-8" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,
  },
  overall_side: {
    title: "Overall Side / Profile — Good Example",
    tips: [
      "Full profile visible — top to floor",
      "Depth of the piece clearly shown",
      "Leg structure and taper visible",
      "Doors or leaves closed for a clean read",
      "Stand at the same height as the piece mid-point",
    ],
    svg: `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <rect width="200" height="220" fill="#f5efe4"/>
      <rect x="8" y="8" width="184" height="204" rx="2" fill="none" stroke="#d4c9b4" stroke-width="1" stroke-dasharray="4 3"/>
      <!-- side view of case — narrow profile -->
      <rect x="70" y="30" width="60" height="150" rx="2" fill="#e8dcc8" stroke="#8b6914" stroke-width="1.5"/>
      <!-- top -->
      <rect x="65" y="25" width="70" height="10" rx="1" fill="#d4c4a0" stroke="#8b6914" stroke-width="1"/>
      <!-- back edge line -->
      <line x1="130" y1="30" x2="130" y2="180" stroke="#8b6914" stroke-width="1" stroke-dasharray="3 2"/>
      <!-- depth arrow -->
      <line x1="70" y1="200" x2="130" y2="200" stroke="#5a6b52" stroke-width="1.5" marker-end="url(#arr)"/>
      <text x="92" y="215" font-size="9" fill="#5a6b52" font-family="sans-serif">depth</text>
      <!-- legs -->
      <rect x="74" y="180" width="8" height="26" rx="1" fill="#c8b888" stroke="#8b6914" stroke-width="1"/>
      <rect x="118" y="180" width="8" height="26" rx="1" fill="#c8b888" stroke="#8b6914" stroke-width="1"/>
      <!-- level line -->
      <line x1="8" y1="100" x2="60" y2="100" stroke="#5a6b52" stroke-width="1.5" stroke-dasharray="3 2"/>
      <line x1="140" y1="100" x2="192" y2="100" stroke="#5a6b52" stroke-width="1.5" stroke-dasharray="3 2"/>
      <circle cx="170" cy="40" r="12" fill="#5a6b52"/>
      <path d="M164 40 l4 4 l8-8" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,
  },
  underside: {
    title: "Underside — Good Example",
    tips: [
      "Show the full underside if possible, or at least the center",
      "Saw marks clearly visible — look for arc or straight patterns",
      "Include visible fasteners — nails or screws in frame members",
      "Capture any structural joints or rail connections",
      "Good lighting — use a flashlight if needed, avoid glare",
    ],
    svg: `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <rect width="200" height="220" fill="#2a2218"/>
      <rect x="8" y="8" width="184" height="204" rx="2" fill="none" stroke="#5a4a30" stroke-width="1" stroke-dasharray="4 3"/>
      <!-- underside surface -->
      <rect x="20" y="30" width="160" height="140" rx="2" fill="#3a3020" stroke="#8b6914" stroke-width="1.5"/>
      <!-- center rail -->
      <rect x="90" y="30" width="18" height="140" fill="#4a3c28" stroke="#8b6914" stroke-width="1"/>
      <!-- cross rail -->
      <rect x="20" y="90" width="160" height="16" fill="#4a3c28" stroke="#8b6914" stroke-width="1"/>
      <!-- saw marks — arc pattern (circular saw) -->
      <path d="M30 40 Q60 55 90 40" stroke="#8b6914" stroke-width="0.8" fill="none" opacity="0.7"/>
      <path d="M30 50 Q60 65 90 50" stroke="#8b6914" stroke-width="0.8" fill="none" opacity="0.7"/>
      <path d="M30 60 Q60 75 90 60" stroke="#8b6914" stroke-width="0.8" fill="none" opacity="0.7"/>
      <path d="M110 40 Q140 55 170 40" stroke="#8b6914" stroke-width="0.8" fill="none" opacity="0.7"/>
      <path d="M110 50 Q140 65 170 50" stroke="#8b6914" stroke-width="0.8" fill="none" opacity="0.7"/>
      <!-- nails -->
      <circle cx="40" cy="95" r="3" fill="#c8b888"/>
      <circle cx="80" cy="95" r="3" fill="#c8b888"/>
      <circle cx="120" cy="95" r="3" fill="#c8b888"/>
      <circle cx="160" cy="95" r="3" fill="#c8b888"/>
      <!-- flashlight beam suggestion -->
      <ellipse cx="30" cy="150" rx="20" ry="12" fill="#f5efe4" opacity="0.12"/>
      <!-- label -->
      <text x="100" y="195" text-anchor="middle" font-size="8" fill="#8b6914" font-family="sans-serif">saw marks · fasteners · joints</text>
      <circle cx="170" cy="24" r="12" fill="#5a6b52"/>
      <path d="M164 24 l4 4 l8-8" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,
  },
  construction: {
    title: "Construction Details — What to Photograph",
    // Multi-scenario: array of { label, checks, svg }
    // ExampleModal renders a tab for each scenario.
    scenarios: [
      {
        label: "Drawer Joint",
        checks: [
          "Joint fills most of the frame",
          "Pins and tails both visible",
          "Corner of the drawer box in view",
          "Sharp focus on the joint line",
        ],
        svg: `<svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <rect width="260" height="200" fill="#1e1610"/>
          <rect x="0" y="0" width="130" height="200" fill="#3d2e1a"/>
          <line x1="0" y1="30" x2="130" y2="32" stroke="#4a3820" stroke-width="1.2" opacity="0.6"/>
          <line x1="0" y1="60" x2="130" y2="58" stroke="#4a3820" stroke-width="1.0" opacity="0.5"/>
          <line x1="0" y1="95" x2="130" y2="97" stroke="#4a3820" stroke-width="1.2" opacity="0.6"/>
          <line x1="0" y1="130" x2="130" y2="128" stroke="#4a3820" stroke-width="0.8" opacity="0.4"/>
          <line x1="0" y1="160" x2="130" y2="162" stroke="#4a3820" stroke-width="1.0" opacity="0.5"/>
          <rect x="130" y="0" width="130" height="200" fill="#4a3820"/>
          <line x1="130" y1="25" x2="260" y2="27" stroke="#5a4830" stroke-width="1.0" opacity="0.5"/>
          <line x1="130" y1="55" x2="260" y2="53" stroke="#5a4830" stroke-width="0.8" opacity="0.4"/>
          <line x1="130" y1="85" x2="260" y2="87" stroke="#5a4830" stroke-width="1.2" opacity="0.5"/>
          <line x1="130" y1="120" x2="260" y2="118" stroke="#5a4830" stroke-width="0.8" opacity="0.4"/>
          <line x1="130" y1="155" x2="260" y2="157" stroke="#5a4830" stroke-width="1.0" opacity="0.5"/>
          <polygon points="118,0 142,0 148,40 112,40" fill="#2a1e10" stroke="#6a5030" stroke-width="0.8"/>
          <polygon points="118,54 140,54 145,94 115,94" fill="#2a1e10" stroke="#6a5030" stroke-width="0.8"/>
          <polygon points="120,108 141,108 146,148 116,148" fill="#2a1e10" stroke="#6a5030" stroke-width="0.8"/>
          <polygon points="119,162 140,162 144,200 117,200" fill="#2a1e10" stroke="#6a5030" stroke-width="0.8"/>
          <polygon points="118,0 130,0 130,20 115,20" fill="#2a1e10" stroke="#6a5030" stroke-width="0.8"/>
          <polygon points="148,40 156,40 152,54 145,54" fill="#150f08" opacity="0.55"/>
          <polygon points="145,94 153,94 149,108 142,108" fill="#150f08" opacity="0.55"/>
          <polygon points="146,148 154,148 150,162 143,162" fill="#150f08" opacity="0.55"/>
          <rect x="0" y="0" width="10" height="200" fill="url(#rl1)" opacity="0.4"/>
          <defs><linearGradient id="rl1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f5d090" stop-opacity="0.7"/><stop offset="100%" stop-color="#f5d090" stop-opacity="0"/></linearGradient></defs>
          <rect x="4" y="6" width="114" height="16" rx="2" fill="#1a1410" opacity="0.7"/>
          <text x="10" y="17" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Joint fills the frame</text>
          <rect x="4" y="28" width="122" height="16" rx="2" fill="#1a1410" opacity="0.7"/>
          <text x="10" y="39" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Pins and tails visible</text>
          <rect x="4" y="50" width="128" height="16" rx="2" fill="#1a1410" opacity="0.7"/>
          <text x="10" y="61" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Corner of drawer box</text>
        </svg>`,
      },
      {
        label: "Internal Rail",
        checks: [
          "Rail or brace fills the frame",
          "How it connects to the case visible",
          "Secondary wood identifiable",
          "Fasteners at joints included",
        ],
        svg: `<svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <rect width="260" height="200" fill="#1a1c12"/>
          <rect x="0" y="120" width="260" height="80" fill="#2e2e1a"/>
          <line x1="0" y1="130" x2="260" y2="132" stroke="#3a3820" stroke-width="1" opacity="0.6"/>
          <line x1="0" y1="148" x2="260" y2="146" stroke="#3a3820" stroke-width="0.8" opacity="0.5"/>
          <line x1="0" y1="164" x2="260" y2="166" stroke="#3a3820" stroke-width="1" opacity="0.6"/>
          <rect x="0" y="0" width="20" height="200" fill="#302818"/>
          <rect x="240" y="0" width="20" height="200" fill="#302818"/>
          <rect x="0" y="55" width="260" height="28" fill="#a89060" rx="1"/>
          <line x1="0" y1="62" x2="260" y2="63" stroke="#b8a070" stroke-width="0.8" opacity="0.5"/>
          <line x1="0" y1="70" x2="260" y2="69" stroke="#b8a070" stroke-width="0.6" opacity="0.4"/>
          <line x1="0" y1="76" x2="260" y2="77" stroke="#b8a070" stroke-width="0.6" opacity="0.3"/>
          <rect x="18" y="60" width="14" height="18" fill="#1a1610" rx="1"/>
          <rect x="228" y="60" width="14" height="18" fill="#1a1610" rx="1"/>
          <polygon points="20,120 52,120 20,88" fill="#8a7048" stroke="#6a5030" stroke-width="0.8"/>
          <polygon points="240,120 208,120 240,88" fill="#8a7048" stroke="#6a5030" stroke-width="0.8"/>
          <circle cx="22" cy="69" r="4" fill="#706050" stroke="#4a3820" stroke-width="0.8"/>
          <circle cx="238" cy="69" r="4" fill="#706050" stroke="#4a3820" stroke-width="0.8"/>
          <rect x="0" y="0" width="260" height="55" fill="url(#tg1)" opacity="0.25"/>
          <defs><linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8d8a0" stop-opacity="0.5"/><stop offset="100%" stop-color="#e8d8a0" stop-opacity="0"/></linearGradient></defs>
          <rect x="4" y="6" width="128" height="16" rx="2" fill="#0e100a" opacity="0.75"/>
          <text x="10" y="17" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Rail fills the frame</text>
          <rect x="4" y="28" width="140" height="16" rx="2" fill="#0e100a" opacity="0.75"/>
          <text x="10" y="39" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Connection to case visible</text>
          <rect x="4" y="50" width="146" height="16" rx="2" fill="#0e100a" opacity="0.75"/>
          <text x="10" y="61" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Secondary wood identifiable</text>
        </svg>`,
      },
      {
        label: "Saw Marks",
        checks: [
          "Marks visible across the surface",
          "Raking light reveals the texture",
          "Arc or line pattern readable",
          "No flash glare hiding the marks",
        ],
        svg: `<svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <rect width="260" height="200" fill="#2e2010"/>
          <line x1="0" y1="20" x2="260" y2="22" stroke="#382a14" stroke-width="1.5" opacity="0.7"/>
          <line x1="0" y1="45" x2="260" y2="43" stroke="#382a14" stroke-width="1.2" opacity="0.6"/>
          <line x1="0" y1="72" x2="260" y2="74" stroke="#382a14" stroke-width="1.5" opacity="0.7"/>
          <line x1="0" y1="100" x2="260" y2="98" stroke="#382a14" stroke-width="1.0" opacity="0.5"/>
          <line x1="0" y1="128" x2="260" y2="130" stroke="#382a14" stroke-width="1.5" opacity="0.7"/>
          <line x1="0" y1="158" x2="260" y2="156" stroke="#382a14" stroke-width="1.2" opacity="0.6"/>
          <line x1="0" y1="182" x2="260" y2="184" stroke="#382a14" stroke-width="1.0" opacity="0.5"/>
          <path d="M-10,8 Q80,-12 170,8"  stroke="#c8a060" stroke-width="1.4" fill="none" opacity="0.85"/>
          <path d="M-10,22 Q80,2 170,22"  stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M-10,36 Q80,16 170,36"  stroke="#c8a060" stroke-width="1.4" fill="none" opacity="0.85"/>
          <path d="M-10,50 Q80,30 170,50"  stroke="#c8a060" stroke-width="1.0" fill="none" opacity="0.7"/>
          <path d="M-10,64 Q80,44 170,64"  stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M90,0 Q180,18 270,0"   stroke="#c8a060" stroke-width="1.4" fill="none" opacity="0.85"/>
          <path d="M90,14 Q180,32 270,14"  stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M90,28 Q180,46 270,28"  stroke="#c8a060" stroke-width="1.4" fill="none" opacity="0.85"/>
          <path d="M90,42 Q180,60 270,42"  stroke="#c8a060" stroke-width="1.0" fill="none" opacity="0.7"/>
          <path d="M90,56 Q180,74 270,56"  stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M-10,78 Q80,58 170,78"  stroke="#c8a060" stroke-width="1.3" fill="none" opacity="0.8"/>
          <path d="M-10,92 Q80,72 170,92"  stroke="#c8a060" stroke-width="1.1" fill="none" opacity="0.75"/>
          <path d="M-10,106 Q80,86 170,106" stroke="#c8a060" stroke-width="1.3" fill="none" opacity="0.8"/>
          <path d="M90,70 Q180,88 270,70"  stroke="#c8a060" stroke-width="1.3" fill="none" opacity="0.8"/>
          <path d="M90,84 Q180,102 270,84"  stroke="#c8a060" stroke-width="1.1" fill="none" opacity="0.75"/>
          <path d="M90,98 Q180,116 270,98"  stroke="#c8a060" stroke-width="1.3" fill="none" opacity="0.8"/>
          <path d="M-10,120 Q80,100 170,120" stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M-10,134 Q80,114 170,134" stroke="#c8a060" stroke-width="1.0" fill="none" opacity="0.7"/>
          <path d="M-10,148 Q80,128 170,148" stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M90,112 Q180,130 270,112" stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M90,126 Q180,144 270,126" stroke="#c8a060" stroke-width="1.0" fill="none" opacity="0.7"/>
          <path d="M90,140 Q180,158 270,140" stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M-10,162 Q80,142 170,162" stroke="#c8a060" stroke-width="1.1" fill="none" opacity="0.75"/>
          <path d="M-10,176 Q80,156 170,176" stroke="#c8a060" stroke-width="1.1" fill="none" opacity="0.75"/>
          <path d="M90,154 Q180,172 270,154" stroke="#c8a060" stroke-width="1.1" fill="none" opacity="0.75"/>
          <path d="M90,168 Q180,186 270,168" stroke="#c8a060" stroke-width="1.1" fill="none" opacity="0.75"/>
          <rect x="0" y="0" width="30" height="200" fill="url(#sr1)" opacity="0.35"/>
          <defs><linearGradient id="sr1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f0d890" stop-opacity="0.7"/><stop offset="100%" stop-color="#f0d890" stop-opacity="0"/></linearGradient></defs>
          <rect x="4" y="142" width="154" height="16" rx="2" fill="#0e0a06" opacity="0.78"/>
          <text x="10" y="153" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Marks across full surface</text>
          <rect x="4" y="162" width="158" height="16" rx="2" fill="#0e0a06" opacity="0.78"/>
          <text x="10" y="173" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Arc pattern clearly readable</text>
          <rect x="4" y="182" width="148" height="16" rx="2" fill="#0e0a06" opacity="0.78"/>
          <text x="10" y="193" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ No glare obscuring marks</text>
        </svg>`,
      },
    ],
  },
};

const CORE_SLOTS = [
  {
    key:          "overall_front",
    label:        "Overall Front",
    icon:         "⬜",
    desc:         "Shows full form and proportions",
    evidence_hint: null,
    has_example:  true,
  },
  {
    key:          "overall_side",
    label:        "Overall Side / Profile",
    icon:         "◧",
    desc:         "Shows depth, silhouette, and leg structure",
    evidence_hint: null,
    has_example:  true,
  },
  {
    key:          "underside",
    label:        "Underside",
    icon:         "⬇",
    desc:         "Reveals saw marks, fasteners, and hidden construction clues",
    evidence_hint: "Strongest dating surface — shows saw marks and nail types",
    has_example:  true,
  },
  {
    key:          "back",
    label:        "Back Panel",
    icon:         "⬛",
    desc:         "Reveals milling style, backboard construction, and materials",
    evidence_hint: "Useful for dating — shows secondary wood and milling technique",
    has_example:  false,
  },
  {
    key:          "label_makers_mark",
    label:        "Label or Maker's Mark",
    icon:         "🏷",
    desc:         "Paper labels, stamps, stencils, serial numbers, or branded hardware",
    optional:     true,
    evidence_hint: null,
    has_example:  false,
  },
];

// Multi-upload evidence groups
const EVIDENCE_GROUPS = [
  {
    key:        "hardware",
    image_type: "hardware_closeup",
    label:      "Hardware Evidence",
    icon:       "⬡",
    helper:     "Upload close-ups of any hardware that may help identify or date the piece — hinges, pulls, latches, locks, escutcheons, casters, catches, or brackets.",
    btnLabel:   "Add another hardware photo",
    has_example: false,
  },
  {
    key:        "construction",
    image_type: "joinery_closeup",
    label:      "Construction Details",
    icon:       "⊞",
    helper:     "Close-ups of joints, rails, dovetails, braces, or tool marks. Pull out a drawer and photograph the corner — or photograph any visible framing, braces, or saw marks on exposed surfaces.",
    btnLabel:   "Add another construction photo",
    has_example: true,
  },
];

const INTAKE_QS = [
  { key:"approximate_height", label:"Height (in)",                         type:"text",     placeholder:"e.g. 48",                               group:"dims" },
  { key:"approximate_width",  label:"Width (in)",                          type:"text",     placeholder:"e.g. 36",                               group:"dims" },
  { key:"primary_wood_guess", label:"Wood species",                        type:"text",     placeholder:"walnut, oak, unknown…",                 group:"main" },
  { key:"where_acquired",     label:"Where acquired",                      type:"text",     placeholder:"estate sale, dealer, attic…",           group:"main" },
  { key:"known_provenance",   label:"Known history or provenance",         type:"textarea", placeholder:"Family history, labels, inscriptions…", group:"main" },
  { key:"known_alterations",  label:"Anything altered, missing, or replaced?", type:"textarea", placeholder:"Examples: replaced hardware, missing drawers, added top, missing mirror, converted from another use", group:"main" },
  { key:"user_category_guess",label:"What do you think it is?",               type:"text",     placeholder:"desk, cabinet, table…",                 group:"main" },
  { key:"condition_notes",    label:"Condition or restoration notes",          type:"textarea", placeholder:"Examples: scratches, veneer lifting, refinished surface, loose joints, repairs", group:"main" },
];

// Functional clue toggles — feed conversion detection in Phase 3 / Conflict Engine
const FUNCTIONAL_CLUES = [
  { key:"has_drawers",           label:"Does it have drawers?" },
  { key:"has_doors",             label:"Does it have doors?" },
  { key:"folds_or_expands",      label:"Does it fold or expand?" },
  { key:"has_mechanical_parts",  label:"Does it have pedals, cranks, or mechanical parts?" },
  { key:"suggests_prior_function",label:"Does anything suggest it used to serve another function?" },
];

// ── Expert-voice guidance messages ───────────────────────────
// Keyed to missing_evidence flags. Benefit-based, "if available"
// phrasing. Never warnings — always appraiser-style suggestions.
const GUIDANCE_MESSAGES = {
  underside_photo: {
    icon: "⬇",
    text: "If available, an underside photo often reveals saw marks and fasteners that help date a piece.",
  },
  back_photo: {
    icon: "⬛",
    text: "A back panel photo can reveal milling style and backboard construction used in different periods.",
  },
  joinery_photo: {
    icon: "⊞",
    text: "Close-ups of drawer joinery or internal framing can help confirm construction methods.",
  },
  hardware_photo: {
    icon: "⬡",
    text: "Hardware close-ups can help determine whether hinges, pulls, or casters are original to the piece.",
  },
  label_photo: {
    icon: "🏷",
    text: "Maker labels or stamped marks can sometimes identify the manufacturer.",
  },
};

// Compute missing evidence flags from current image state (for intake UI).
// Mirrors the logic in API.analyzeCase so guidance is live before analysis runs.
function computeMissingEvidence(images, groupImages) {
  const imageKeys = new Set(Object.keys(images));
  const groupTypes = new Set(
  Object.values(groupImages as Record<string, any[]>)
    .flat()
    .map((i: any) => i.image_type)
);
  return {
    underside_photo: !imageKeys.has("underside"),
    back_photo:      !imageKeys.has("back"),
    joinery_photo:   !imageKeys.has("joinery_closeup") && !groupTypes.has("joinery_closeup"),
    hardware_photo:  !imageKeys.has("hardware_closeup") && !groupTypes.has("hardware_closeup"),
    label_photo:     !imageKeys.has("label_makers_mark"),
  };
}

// Render the guidance block given a missing_evidence map.
// Used in both the intake screen and the report page.
function GuidanceMessages({ missing, totalPhotos, style }) {
  if (!missing || totalPhotos < 2) return null;
  const active = Object.entries(missing)
    .filter(([, v]) => v)
    .map(([k]) => GUIDANCE_MESSAGES[k])
    .filter(Boolean);
  if (active.length === 0) return null;
  return (
    <div style={{ ...guidanceStyles.block, ...style }}>
      <div style={guidanceStyles.title}>To strengthen results, if available:</div>
      {active.map((g, i) => (
        <div key={i} style={guidanceStyles.row}>
          <span style={guidanceStyles.icon}>{g.icon}</span>
          <span style={guidanceStyles.text}>{g.text}</span>
        </div>
      ))}
    </div>
  );
}

const guidanceStyles = {
  block: { background:"#fdfaf2", border:`1px solid #e8ddb8`, borderRadius:3, padding:"14px 16px", display:"flex", flexDirection:"column", gap:9 },
  title: { fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#8b6914", fontFamily:"sans-serif", marginBottom:2 },
  row:   { display:"flex", alignItems:"flex-start", gap:9 },
  icon:  { fontSize:13, color:"#8b6914", flexShrink:0, lineHeight:1.55 },
  text:  { fontSize:13, color:"#4a3728", lineHeight:1.6, fontFamily:"'Georgia',serif" },
};

// ── Photo coaching modal ──────────────────────────────────────
// Handles two formats:
//   • Single SVG (overall_front, overall_side, underside):
//     ex.svg + ex.tips
//   • Multi-scenario (construction):
//     ex.scenarios = [{ label, checks, svg }, ...]
//     Renders a tab row so users can browse Drawer Joint / Rail / Saw Marks.
function ExampleModal({ exampleKey, onClose }) {
  const ex = PHOTO_EXAMPLES[exampleKey];
  const [tab, setTab] = useState(0);
  if (!ex) return null;

  const isMulti = Array.isArray(ex.scenarios);
  const current = isMulti ? ex.scenarios[tab] : ex;
  const tips    = isMulti ? current.checks : current.tips;

  return (
    <div style={exStyles.overlay} onClick={onClose}>
      <div style={exStyles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={exStyles.header}>
          <span style={exStyles.title}>{ex.title}</span>
          <button style={exStyles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Scenario tabs — only for multi-scenario entries */}
        {isMulti && (
          <div style={exStyles.tabRow}>
            {ex.scenarios.map((s, i) => (
              <button
                key={i}
                style={{ ...exStyles.tabBtn, ...(tab === i ? exStyles.tabBtnActive : {}) }}
                onClick={() => setTab(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Illustration */}
        <div
          style={exStyles.illustration}
          dangerouslySetInnerHTML={{ __html: current.svg }}
        />

        {/* Guidance tips / checks */}
        <div style={exStyles.tipsBlock}>
          <div style={exStyles.tipsLabel}>
            {isMulti ? "What to include in this photo:" : "What makes this a good photo:"}
          </div>
          <ul style={exStyles.tipsList}>
            {tips.map((tip, i) => (
              <li key={i} style={exStyles.tipItem}>
                <span style={exStyles.tipCheck}>✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <button style={exStyles.dismissBtn} onClick={onClose}>
          Got it — take photo
        </button>
      </div>
    </div>
  );
}

const exStyles: any = {
  overlay:      { position:"fixed", inset:0, background:"rgba(26,20,16,0.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:16 },
  modal:        { background:"#faf6ef", borderRadius:6, maxWidth:380, width:"100%", maxHeight:"90vh", overflowY:"auto", display:"flex", flexDirection:"column" },
  header:       { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 18px 12px", borderBottom:"1px solid #d4c9b4" },
  title:        { fontSize:14, fontWeight:600, color:"#1a1410", fontFamily:"'Georgia',serif", lineHeight:1.3 },
  closeBtn:     { background:"none", border:"none", fontSize:16, color:"#aaa", cursor:"pointer", padding:"0 2px", lineHeight:1 },
  tabRow:       { display:"flex", borderBottom:"1px solid #d4c9b4", padding:"0 18px" },
  tabBtn:       { background:"none", border:"none", borderBottom:"2px solid transparent", padding:"10px 14px 8px", fontSize:12, color:"#4a3728", cursor:"pointer", fontFamily:"sans-serif", letterSpacing:"0.04em", transition:"all 0.15s" },
  tabBtnActive: { borderBottomColor:"#8b6914", color:"#1a1410", fontWeight:600 },
  illustration: { padding:"16px 18px 0", height:200, flexShrink:0 },
  tipsBlock:    { padding:"14px 18px 0" },
  tipsLabel:    { fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#8b6914", fontFamily:"sans-serif", marginBottom:10 },
  tipsList:     { listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:7 },
  tipItem:      { display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"#4a3728", lineHeight:1.5, fontFamily:"'Georgia',serif" },
  tipCheck:     { color:"#5a6b52", flexShrink:0, fontWeight:600, marginTop:1 },
  dismissBtn:   { margin:"16px 18px 18px", background:"#1a1410", color:"#f5efe4", border:"none", padding:"12px", fontSize:13, cursor:"pointer", borderRadius:3, fontFamily:"'Georgia',serif", textAlign:"center" },
};

// ============================================================
// ROUTE REGISTRY
// Defines the two top-level routes and their valid steps.
// Each route has its own intake, analysis, and result steps.
// Shared services: image storage, Claude API caller, DB lookups.
// ============================================================
const ROUTES = {
  field_scan: {
    id:          "field_scan",
    label:       "Field Scan",
    steps:       ["quick_intake", "quick_result"],
    analyzeStep: "quick_intake",
    resultStep:  "quick_result",
    // Validators: Field Scan does NOT use Full Analysis validator
    minPhotos:   2,
    maxPhotos:   6,
  },
  full_analysis: {
    id:          "full_analysis",
    label:       "Full Analysis",
    steps:       ["intake", "report"],
    analyzeStep: "intake",
    resultStep:  "report",
    minPhotos:   2,
    maxPhotos:   20,
  },
};

// ── Field Scan Response Schema ────────────────────────────────
// Independent of FullAnalysisResponse.
// Fields: likely_identification, estimated_date_range,
//         confidence, is_broad_category, buy_guidance,
//         estimated_value_low/high, short_reason.
const FieldScanResponseSchema = {
  required: ["likely_identification","estimated_date_range","confidence","buy_guidance","short_reason"],
  optional: ["estimated_value_low","estimated_value_high","is_broad_category","key_clues","hard_negatives"],
};

// ── Full Analysis Response Schema ─────────────────────────────
// Independent of FieldScanResponse.
// All 7+ phase outputs + final_report + scores + valuations.
const FullAnalysisResponseSchema = {
  required: ["final_report","scores","stage_outputs"],
  optional: ["conflicts","form_assessment","valuations","observations"],
};

// Validate Field Scan response — NEVER throws, always returns a result.
function validateFieldScanResponse(data) {
  if (!data || typeof data !== "object") return { ok:false, reason:"not_object" };
  const hasId = data.likely_identification && data.likely_identification !== "Undetermined";
  if (!hasId) return { ok:false, reason:"no_identification" };
  return { ok:true };
}

// Validate Full Analysis response — throws if required fields missing.
function validateFullAnalysisResponse(data) {
  if (!data.final_report) throw new Error("Full analysis response missing final_report");
  return true;
}

const PHASES = [
  { key:"0_visual_scan",    label:"Visual Evidence Scan",        short:"00", note:"Full scan — all 6 evidence categories across all images" },
  { key:"1_intake",         label:"Intake Controller",           short:"01", note:"Evidence inventory · confidence caps · phase triggers" },
  { key:"2_dating",         label:"Rapid Dating Grid",           short:"02", note:"Targeted toolmark/fastener scan + date intersection" },
  { key:"3_form",           label:"Form Decision Engine",        short:"03", note:"Targeted structure scan + current/original/conversion" },
  { key:"4_construction",   label:"Construction Analysis",       short:"04", note:"Targeted joinery scan + manufacturing mode" },
  { key:"5_hardware",       label:"Hardware Analysis",           short:"05", note:"Targeted hardware/finish scan + originality ×" },
  { key:"6_conflict",       label:"Conflict Detection Engine",   short:"06", note:"Revival · replacement · marriage · conversion · rural" },
  { key:"7_reconciliation", label:"Reconciliation",              short:"07", note:"Priority synthesis · scorecard · confidence band" },
  { key:"8_valuation",      label:"Valuation",                   short:"08", note:"5-lane market estimate" },
];

// ============================================================
// APP — Two-Route Architecture
//
// Route A: FIELD SCAN   (mode="field_scan")
//   Steps: intro → quick_intake → [analyzing overlay] → quick_result
//   Engine: runFieldScan() — 3-phase lightweight pipeline
//   Schema: FieldScanResponse (independent validator)
//   Photos: additive, 2–6, auto-rerun on add
//   Failure: degrades to broad category, never hard-fails
//
// Route B: FULL ANALYSIS  (mode="full_analysis")
//   Steps: intro → intake → [analyzing overlay] → report
//   Engine: runFullAnalysis() — 9-phase full pipeline
//   Schema: FullAnalysisResponse (strict validator)
//   Photos: slot-based core + appendable evidence groups
//   Failure: structured phase error with debug panel
//
// Shared services: image storage, Claude API caller, DB lookups,
//   observation writer, photo upload component, coaching modal.
// ============================================================
export default function App() {
  // ── Shared router state ───────────────────────────────────
  const [step,        setStep]        = useState("intro");
  const [mode,        setMode]        = useState(null);   // "field_scan" | "full_analysis"
  const [caseId,      setCaseId]      = useState(null);
  const [analyzing,   setAnalyzing]   = useState(false);
  const [error,       setError]       = useState(null);
  const [debugOpen,   setDebugOpen]   = useState(false);
  const [exampleOpen, setExampleOpen] = useState(null);

  // ── Field Scan route state ────────────────────────────────
  // Images shared between routes (Field Scan can upgrade to Full Analysis keeping photos)
  const [images,      setImages]      = useState({});
  const [answers,     setAnswers]     = useState({});
  const [quickResult, setQuickResult] = useState(null);
  const [quickScanVersion, setQuickScanVersion] = useState(0);

  // ── Full Analysis route state ─────────────────────────────
  const [groupImages, setGroupImages] = useState({ hardware:[], construction:[] });
  const [clues,       setClues]       = useState({});
  const [phasesDone,  setPhasesDone]  = useState({});
  const [currentPhase,setCurrentPhase]= useState(0);
  const [report,      setReport]      = useState(null);
  const [activeTab,   setActiveTab]   = useState("summary");

  // ── Picker Profile ────────────────────────────────────────
  const [pickerProfile,     setPickerProfile]     = useState(null);
  const [showPickerSetup,   setShowPickerSetup]   = useState(false);
  const [pickerSetupDraft,  setPickerSetupDraft]  = useState({});
  const [pickerStep,        setPickerStep]        = useState(0);

  // ── Shared refs ───────────────────────────────────────────
  const coreRefs  = useRef({});
  const groupRefs = useRef({});
  const quickAddRefs = useRef({});

  // ── Route entry ───────────────────────────────────────────
  // Creates a new case and routes to the correct intake screen.
  const handleStart = (selectedMode, transferEvidence = null) => {
    const r = API.createCase({});
    // If upgrading from Field Scan, transfer evidence cache to new case
    if (transferEvidence && caseId && caseStore[caseId] && caseStore[caseId]._evidence_cache) {
      caseStore[r.case_id]._evidence_cache = caseStore[caseId]._evidence_cache;
      caseStore[r.case_id]._visual_evidence = caseStore[caseId]._visual_evidence;
      console.info("[NCW handleStart] Evidence cache transferred from Field Scan case", caseId, "→", r.case_id);
    }
    setCaseId(r.case_id);
    setMode(selectedMode);
    // Route A: Field Scan intake
    // Route B: Full Analysis intake
    setStep(selectedMode === "field_scan" ? "quick_intake" : "intake");
  };

  // ── Load Picker Profile from storage on first mount ─────────
  useEffect(function() {
    (async function() {
      try {
        const stored =
  typeof window !== 'undefined'
    ? localStorage.getItem("picker_profile")
    : null;

if (stored) {
  const loaded = JSON.parse(stored);
  setPickerProfile(loaded);
  console.info(
    "[NCW Storage] Picker profile loaded:",
    JSON.stringify(loaded).slice(0, 80)
  );
  return; // profile found — skip setup
}
      } catch(_e) {
        console.info("[NCW Storage] No saved profile or storage unavailable:", _e.message);
      }
      // No profile saved — show setup
      if (!pickerProfile && !showPickerSetup) {
        setShowPickerSetup(true);
        setPickerStep(0);
        setPickerSetupDraft({});
      }
    })();
  }, []);

  // ── Auto-rerun Field Scan when a photo is added ───────────
  useEffect(() => {
    if (quickScanVersion > 0 && step === "quick_result") {
      handleQuickAnalyze(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickScanVersion]);

  // Quick Mode handler
  const handleQuickAnalyze = async (isRerun = false) => {
    if (!caseId) return;
    setQuickResult(null);  // clear stale result before scan starts
    setAnalyzing(true); setError(null); setPhasesDone({}); setCurrentPhase(0);
    setStep("quick_scanning"); // single scanning step: hides intake + result screens

    try {
      // Register any newly added images not yet in the case store
      const existingIds = new Set((caseStore[caseId].images || []).map(i => i.storage_key));
      for (const [key, img] of Object.entries(images as Record<string, any>)) {
        if (!existingIds.has(key)) {
          API.addImage(caseId, { storage_key:key, image_type:img.image_type, is_primary:key==="overall_front", data_url:img.data_url });
        }
      }
      // Re-add all images on full rerun to pick up latest state
      if (isRerun) {
        caseStore[caseId].images = [];
        for (const [key, img] of Object.entries(images as Record<string, any>)) {
          API.addImage(caseId, { storage_key:key, image_type:img.image_type, is_primary:key==="overall_front", data_url:img.data_url });
        }
      }

      let phaseIdx = 0;
      await API.quickAnalyzeCase(caseId, { ...answers, _picker_profile: pickerProfile }, (phaseNum, phaseData) => {
        phaseIdx++;
        setPhasesDone(prev => ({ ...prev, [phaseNum]: phaseData }));
        setCurrentPhase(phaseIdx);
      });
      const c = caseStore[caseId];
      setQuickResult(c.quick_result);
      setAnalyzing(false);  // clear analyzing BEFORE switching step
      setStep("quick_result");
      return;  // skip the setAnalyzing(false) at the end
    } catch (e) {
      // Quick Mode NEVER hard-fails on usable images.
      // On any unexpected error: synthesize a degraded result from available state
      // so the user always sees something actionable and can add more photos.
      console.warn("[NCW Quick] Unexpected error — building degraded result:", e.message);
      const userGuess = (answers as any).user_category_guess || "";
      const fallbackId = userGuess
        ? `${userGuess} (broad category — limited evidence)`
        : "American antique furniture (broad category — limited evidence)";
      const _g = (((answers as any).user_category_guess) || "").toLowerCase();
      const _broadFormKey =
        (_g.includes("chest") || _g.includes("trunk")) ? "chest" :
        _g.includes("table")    ? "table"   :
        (_g.includes("chair") || _g.includes("stool")) ? "seating" :
        _g.includes("desk")     ? "desk"    :
        (_g.includes("cabinet") || _g.includes("cupboard")) ? "cabinet" :
        (_g.includes("dresser") || _g.includes("drawer")) ? "dresser" :
        _g.includes("wardrobe") ? "wardrobe" :
        (_g.includes("shelf") || _g.includes("bookcase")) ? "shelf" :
        _g.includes("stand")    ? "stand"   : "cabinet";
      const degradedResult = {
        likely_identification: fallbackId,
        broad_form_key:        _broadFormKey,
        estimated_date_range:  "Date uncertain — add underside or joinery photo",
         confidence:            "Low",
        is_broad_category:     true,
        estimated_value_low:   0,
        estimated_value_high:  0,
        buy_guidance:          "Caution",
        short_reason:          "Insufficient evidence for a specific identification. Add an underside, joinery, or hardware photo to improve the result.",
        asking_price:          parseFloat((answers as any).asking_price) || null,
        price_guidance:        null,
        key_clues:             [],
        hard_negatives:        [],
        observations:          [],
        primary_wood:          "",
        recommend_full:        true,
        is_degraded_fallback:  true,
      };
      // Store degraded result so result screen renders
      if (caseStore[caseId]) {
        caseStore[caseId].quick_result = degradedResult;
        caseStore[caseId].status = "quick_complete";
      }
      setQuickResult(degradedResult);
      setAnalyzing(false);  // clear analyzing BEFORE switching step
      setStep("quick_result");
      // Show a soft non-blocking notice (not a blocking error)
      setError({ isQuickMode:true, isDegraded:true, error_type: e.isQuickError ? e.quickError.error_type : "runtime_error", error_message:"Analysis returned limited results. Add a clearer photo to improve confidence.", raw_response: e.quickError.raw_response || "" });
    }
    setAnalyzing(false);
  };

  // Add a photo during Quick Mode and auto-rerun
  const handleQuickAddPhoto = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      setImages(prev => ({ ...prev, [key]: { file, data_url: e.target.result, image_type: key } }));
      // Auto-rerun after state update — use version increment to trigger effect
      setQuickScanVersion(v => v + 1);
    };
    reader.readAsDataURL(file);
  };

  // Upgrade from Field Scan → Full Analysis: keep images, switch route
  const handleUpgradeToFull = () => {
    // Same caseId is kept — Full Analysis will reuse the Field Scan evidence cache.
    // PE.runAllPhases p0 will detect _evidence_cache and skip re-extraction.
    if (caseId && caseStore[caseId] && caseStore[caseId]._evidence_cache) {
      console.info("[NCW Upgrade] Evidence cache present — Full Analysis will skip image re-extraction");
    }
    setStep("intake");
    setMode("full_analysis");
    setQuickResult(null);
    setError(null);
  };

  const reset = () => {
    setStep("intro"); setMode(null); setCaseId(null);
    setImages({}); setGroupImages({ hardware:[], construction:[] });
    setAnswers({}); setClues({});
    setReport(null); setQuickResult(null);
    setError(null); setDebugOpen(false); setPhasesDone({}); setCurrentPhase(0);
    setQuickScanVersion(0);
  };
  const handleCoreUpload = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setImages(prev => ({
      ...prev,
      [key]: { file, data_url: e.target.result, image_type: key },
    }));
    reader.readAsDataURL(file);
  };

  // Evidence group upload (append)
  const handleGroupUpload = (groupKey, imageType, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setGroupImages(prev => ({
      ...prev,
      [groupKey]: [
        ...prev[groupKey],
        { file, data_url: e.target.result, image_type: imageType, id: `${groupKey}-${Date.now()}` },
      ],
    }));
    reader.readAsDataURL(file);
  };

  // Remove a group image by id
  const removeGroupImage = (groupKey, id) => {
    setGroupImages(prev => ({
      ...prev,
      [groupKey]: prev[groupKey].filter(img => img.id !== id),
    }));
  };

  const handleAnalyze = async () => {
    if (!caseId) return;
    setAnalyzing(true); setError(null); setDebugOpen(false); setPhasesDone({}); setCurrentPhase(1);
    try {
      // Add core images
      for (const [key, img] of Object.entries(images as Record<string, any>)) {
        API.addImage(caseId, {
          storage_key: key, image_type: img.image_type,
          is_primary: key === "overall_front", data_url: img.data_url,
        });
      }
      // Add group images
      for (const [groupKey, imgs] of Object.entries(groupImages)) {
        const group = EVIDENCE_GROUPS.find(g => g.key === groupKey);
        imgs.forEach((img, i) => {
          API.addImage(caseId, {
            storage_key: `${groupKey}_${i}`,
            image_type:  group.image_type || groupKey,
            is_primary:  false,
            data_url:    img.data_url,
          });
        });
      }
      await API.analyzeCase(caseId, { ...answers, ...clues }, (phaseNum, phaseData) => {
        setPhasesDone(prev => ({ ...prev, [phaseNum]: phaseData }));
        setCurrentPhase(phaseNum + 1);
      });
      const r = API.getReport(caseId);
      setReport(r);
      setStep("report");
    } catch (e) {
      // Try to unpack a structured phase error payload
      if (e.phasePayload) {
        setError(e.phasePayload);
      } else {
        // Try to parse a JSON-encoded payload from the message
        try {
          const parsed = JSON.parse(e.message);
          if (parsed.ok === false && parsed.error) {
            setError(parsed);
          } else {
            setError({ ok: false, failed_stage: "Unknown phase", error: { stage_name: "unknown", phase_label: "Unknown", error_type: "unknown_error", error_message: e.message || "An unknown error occurred", raw_response: "", retry_attempted: false } });
          }
        } catch(_e3) {
          // Plain string error — wrap it so UI always has a consistent shape
          setError({ ok: false, failed_stage: "Unknown phase", error: { stage_name: "unknown", phase_label: "Unknown", error_type: "unknown_error", error_message: e.message || "An unknown formatting error occurred. No phase details were returned.", raw_response: "", retry_attempted: false } });
        }
      }
    }
    setAnalyzing(false);
  };

  // Total photo count across core + groups
  const coreCount  = Object.keys(images).length;
  const groupCount = Object.values(groupImages).reduce((s, arr) => s + arr.length, 0);
  const totalPhotos = coreCount + groupCount;
  const canAnalyze  = totalPhotos >= 2 && !analyzing;

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={S.root}>
      <div style={S.bgTexture} />

      {/* Picker Profile Setup modal */}
      {showPickerSetup && (
        <PickerProfileSetup
          draft={pickerSetupDraft}
          setDraft={setPickerSetupDraft}
          step={pickerStep}
          setStep={setPickerStep}
          onSave={function(profile){
            const clean = { ...profile };
            if (clean.large_item_penalty !== undefined)
              clean.large_item_penalty = clean.large_item_penalty === "yes";
            if (!clean.repair_skills) clean.repair_skills = [];
            setPickerProfile(clean);
            setShowPickerSetup(false);
            // Persist to storage
            (async function(){
              try {
                if (typeof window !== 'undefined') { localStorage.setItem("picker_profile", JSON.stringify(clean)); }
                console.info("[NCW Storage] Picker profile persisted");
              } catch(_e) {
                console.info("[NCW Storage] Could not persist profile:", _e.message);
              }
            })();
          }}
          onCancel={pickerProfile ? null : function(){ setShowPickerSetup(false); }}
        />
      )}

      {/* Photo coaching modal — rendered at root so it overlays everything */}
      {exampleOpen && (
        <ExampleModal
          exampleKey={exampleOpen}
          onClose={() => setExampleOpen(null)}
        />
      )}

      {/* Header */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logoArea} onClick={step !== "intro" ? reset : undefined} title="Return to start">
            <span style={S.logoMark}>◈</span>
            <div>
              <div style={S.logoName}>NCW</div>
              <div style={S.logoSub}>Furniture Identification Engine</div>
            </div>
          </div>
          {/* Picker profile gear button */}
          <button
            onClick={function(){
              setPickerSetupDraft(pickerProfile || {});
              setPickerStep(0);
              setShowPickerSetup(true);
            }}
            title={pickerProfile ? "Edit Picker Profile" : "Set Up Picker Profile"}
            style={{
              background:"none", border:"1px solid #d4c4a0", borderRadius:4,
              padding:"4px 10px", cursor:"pointer", color:"#8b6914",
              fontSize:12, fontFamily:"sans-serif",
              display:"flex", alignItems:"center", gap:5,
            }}
          >
            <span>🎯</span>
            <span>{pickerProfile ? "Profile" : "Setup"}</span>
          </button>
          {caseId && (
            <div style={S.caseTagArea}>
              <span style={S.caseIdText}>#{caseId.split("-")[1]}</span>
              <span style={S.stepChip}>
                {mode === "field_scan"
                  ? (step === "quick_result" ? "Field Scan — Result" : step === "quick_scanning" ? "Field Scan — Scanning" : "Field Scan")
                  : step === "report" ? "Full Analysis — Report" : "Full Analysis"}
              </span>
            </div>
          )}
        </div>
      </header>

      <main style={S.main}>

        {/* ── INTRO / MODE SELECTOR ── */}
        {step === "intro" && (
          <div style={S.centered}>
            <div style={S.introCard}>
              <div style={S.introEra}>American Furniture · 1600 – Present</div>
              <h1 style={S.introTitle}>NCW Furniture<br />Identification Engine</h1>
              <p style={S.introDesc}>Choose how you want to evaluate the piece.</p>

              <div style={S.modeGrid}>
                {/* ── ROUTE A: Field Scan card ── */}
                <div style={S.modeCard} onClick={() => handleStart("field_scan")}>
                  <div style={S.modeCardTop}>
                    <span style={S.modeIcon}>⚡</span>
                    <span style={{...S.modeBadge, background:"#edf5ec", borderColor:"#a8cca6", color:"#3a6b38"}}>Field Scan</span>
                  </div>
                  <div style={S.modeCardTitle}>Field Scan</div>
                  <div style={S.modeCardContext}>Antique malls · flea markets · estate sales · auctions</div>
                  <div style={S.modeCardDesc}>Take 2–3 photos for a fast identification and buying guidance.</div>
                  <div style={S.modeOutputList}>
                    {["Likely form","Rough date range","Confidence level","Buy / Caution / Pass signal"].map(o => (
                      <div key={o} style={S.modeOutputItem}><span style={S.modeOutputDot}>◆</span>{o}</div>
                    ))}
                  </div>
                  <div style={S.modeTime}>⏱ 15–20 seconds</div>
                  <div style={{...S.modeBtn, ...S.modeBtnQuick}}>Start Field Scan →</div>
                </div>

                {/* ── ROUTE B: Full Analysis card ── */}
                <div style={S.modeCard} onClick={() => handleStart("full_analysis")}>
                  <div style={S.modeCardTop}>
                    <span style={S.modeIcon}>◈</span>
                    <span style={{...S.modeBadge}}>Expert Mode</span>
                  </div>
                  <div style={S.modeCardTitle}>Full Analysis</div>
                  <div style={S.modeCardContext}>Detailed construction and dating analysis</div>
                  <div style={S.modeCardDesc}>Upload multiple evidence photos for a complete 9-phase evaluation.</div>
                  <div style={S.modeOutputList}>
                    {["Detailed identification","Evidence summary","Construction analysis","Conflict detection","Valuation estimate"].map(o => (
                      <div key={o} style={S.modeOutputItem}><span style={S.modeOutputDot}>◆</span>{o}</div>
                    ))}
                  </div>
                  <div style={S.modeTime}>⏱ 60–90 seconds</div>
                  <div style={{...S.modeBtn, ...S.modeBtnFull}}>Begin Full Analysis →</div>
                </div>
              </div>

              <p style={S.versionNote}>v0.4 · Proof of Concept · 9-Phase Engine</p>

              {/* Picker profile status on intro card */}
              {pickerProfile && (
                <div style={{
                  background:"#faf6ef", border:"1px solid #d4c4a0", borderRadius:5,
                  padding:"10px 14px", marginBottom:12, marginTop:4,
                  display:"flex", alignItems:"center", gap:10, fontFamily:"sans-serif",
                }}>
                  <span style={{fontSize:16}}>🎯</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12, fontWeight:600, color:"#5a3e1b"}}>Picker Profile Active</div>
                    <div style={{fontSize:11, color:"#888", marginTop:2}}>
                      {[pickerProfile.restoration_skill, pickerProfile.buying_purpose, pickerProfile.deal_target]
                        .filter(Boolean).map(function(v){ return v.replace(/_/g," "); }).join(" · ")}
                    </div>
                  </div>
                  <button
                    onClick={function(){
                      setPickerSetupDraft(pickerProfile);
                      setPickerStep(0);
                      setShowPickerSetup(true);
                    }}
                    style={{
                      fontSize:11, color:"#8b6914", background:"none",
                      border:"1px solid #d4c4a0", borderRadius:3,
                      padding:"3px 8px", cursor:"pointer",
                    }}
                  >Edit</button>
                </div>
              )}


              {/* ── Discovery section ── */}
              <div style={{
                display:"flex", alignItems:"flex-start", gap:18,
                background:"#faf6ef", border:"1px solid #d4c4a0",
                borderRadius:5, padding:"20px 22px", marginTop:22,
                textAlign:"left",
              }}>
                {/* Magnifying glass icon — SVG engraved style */}
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none"
                  xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0, marginTop:2}}>
                  <circle cx="15" cy="15" r="10.5" stroke="#8b6914" strokeWidth="2" fill="none"/>
                  <circle cx="15" cy="15" r="7" stroke="#8b6914" strokeWidth="0.8"
                    strokeDasharray="1.5 2.5" fill="none" opacity="0.5"/>
                  <line x1="22.5" y1="22.5" x2="33" y2="33" stroke="#8b6914" strokeWidth="2.5"
                    strokeLinecap="round"/>
                  <line x1="22.5" y1="22.5" x2="31" y2="31" stroke="#c8a040" strokeWidth="1"
                    strokeLinecap="round" opacity="0.6"/>
                  <circle cx="11" cy="11" r="1.5" fill="#c8a040" opacity="0.4"/>
                </svg>

                <div style={{flex:1}}>
                  <div style={{
                    fontSize:13, fontWeight:700, letterSpacing:"0.06em",
                    textTransform:"uppercase", color:"#5a3e1b",
                    fontFamily:"'Georgia',serif", marginBottom:7,
                  }}>Search Out the Story</div>

                  <p style={{
                    fontSize:13, color:"#4a3728", lineHeight:1.7,
                    fontFamily:"'Georgia',serif", margin:"0 0 12px",
                  }}>
                    Our identification engine examines construction clues, joinery, hardware,
                    and form to uncover the hidden history inside every piece of furniture.
                  </p>

                  <div style={{
                    fontSize:11.5, color:"#7a6040", lineHeight:1.75,
                    fontFamily:"'Georgia',serif", fontStyle:"italic",
                    borderLeft:"2px solid #d4c4a0", paddingLeft:11,
                  }}>
                    "It is the glory of God to conceal a thing:<br />
                    but the honour of kings is to search out a matter."
                    <span style={{
                      display:"block", marginTop:4, fontSize:10.5,
                      fontStyle:"normal", letterSpacing:"0.05em",
                      color:"#8b6914", textTransform:"uppercase",
                    }}>— Proverbs 25:2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            ROUTE B — FULL ANALYSIS
            Steps: intake → [analyzing overlay] → report
            Engine: runFullAnalysis (9-phase, strict validation)
            Schema: FullAnalysisResponse
            Photos: slot-based core + appendable evidence groups
        ════════════════════════════════════════════════════ */}

        {/* ── FULL ANALYSIS INTAKE ── */}
        {step === "intake" && (
          <div style={S.intakePage}>

            {/* ══ EVIDENCE INFO PANEL ═════════════════════════════ */}
            <div style={S.evidenceInfoPanel}>
              <div style={S.evidenceInfoTitle}>Evidence the system evaluates</div>
              <ul style={S.evidenceInfoList}>
                {[
                  "Form & proportions",
                  "Construction methods",
                  "Joinery",
                  "Hardware & fasteners",
                  "Tool marks & milling",
                  "Labels & maker's marks",
                ].map(item => (
                  <li key={item} style={S.evidenceInfoItem}>
                    <span style={S.evidenceInfoCheck}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div style={S.evidenceInfoFooter}>
                Upload photos below so the system can evaluate these clues.
              </div>
            </div>

            {/* ══ SECTION 1: EVIDENCE PHOTOS ══════════════════════ */}
            <div style={S.intakeSection}>
              <div style={S.sectionLabel}>01 — Evidence Photos</div>
              <h2 style={S.sectionTitle}>Photograph Your Piece</h2>
              <p style={S.sectionDesc}>
                The underside and back panel are the most important surfaces for accurate dating.
                Use the evidence groups below to add as many supporting close-ups as you need.
              </p>

              {/* ── Core photos ── */}
              <div style={S.coreGroupHeader}>
                <span style={S.coreGroupLabel}>Core Photos</span>
                <span style={S.coreGroupSub}>One photo per view</span>
              </div>

              <div style={S.photoStack}>
                {CORE_SLOTS.map((slot) => {
                  const img = images[slot.key];
                  return (
                    <div key={slot.key} style={{ ...S.photoCard, ...(img ? S.photoCardFilled : {}) }}>

                      {/* Camera input — opens device camera */}
                      <input
                        type="file" accept="image/*" capture="environment"
                        style={{ display:"none" }}
                        ref={el => { coreRefs.current[`${slot.key}_cam`] = el; }}
                        onChange={e => handleCoreUpload(slot.key, e.target.files[0])}
                      />
                      {/* Library input — opens photo library, no capture attribute */}
                      <input
                        type="file" accept="image/*"
                        style={{ display:"none" }}
                        ref={el => { coreRefs.current[`${slot.key}_lib`] = el; }}
                        onChange={e => handleCoreUpload(slot.key, e.target.files[0])}
                      />

                      {/* Thumbnail or placeholder */}
                      <div style={S.photoCardLeft}>
                        {img
                          ? <img src={img.data_url} alt={slot.label} style={S.photoThumb} />
                          : <div style={S.photoPlaceholder}><span style={S.photoPlaceholderIcon}>{slot.icon}</span></div>
                        }
                      </div>

                      {/* Labels + action buttons */}
                      <div style={S.photoCardBody}>
                        <div style={S.photoCardTitleRow}>
                          <span style={S.photoCardTitle}>{slot.label}</span>
                          {/* Only the Label/Maker's Mark slot gets an "Optional" badge */}
                          {slot.optional && <span style={S.optionalTag}>Optional</span>}
                          {/* See example button — only on slots with coaching content */}
                          {slot.has_example && !img && (
                            <button
                              style={S.exampleBtn}
                              onClick={e => { e.stopPropagation(); setExampleOpen(slot.key); }}
                            >
                              See example
                            </button>
                          )}
                          {img && <span style={S.photoCardCheck}>✓</span>}
                        </div>
                        <div style={S.photoCardHint}>{slot.desc}</div>
                        {/* Show a subtle value hint for high-value structural slots not yet uploaded */}
                        {!img && slot.evidence_hint && (
                          <div style={S.photoCardEvidenceHint}>◆ {slot.evidence_hint}</div>
                        )}

                       
                        {/* Two-button row — always visible */}
                        <div style={S.uploadBtnRow}>
                          <button
                            style={S.uploadBtnCamera}
                            onClick={() => coreRefs.current[`${slot.key}_cam`].click()}
                          >
                            📷 {img ? "Retake" : "Take Photo"}
                          </button>
                          <button
                            style={S.uploadBtnLibrary}
                            onClick={() => coreRefs.current[`${slot.key}_lib`].click()}
                          >
                            🖼 {img ? "Replace" : "Choose from Library"}
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* ── Evidence groups (multi-upload) ── */}
              {EVIDENCE_GROUPS.map((group) => {
                const groupImgs = groupImages[group.key] || [];
                return (
                  <div key={group.key} style={S.evidenceGroup}>
                    {/* Group header */}
                    <div style={S.evidenceGroupHeader}>
                      <div style={S.evidenceGroupTitleRow}>
                        <span style={S.evidenceGroupIcon}>{group.icon}</span>
                        <span style={S.evidenceGroupTitle}>{group.label}</span>
                        {/* Softer label — not "Optional" */}
                        <span style={S.helpfulTag}>Helpful — improves accuracy</span>
                        {/* See example button for groups with coaching content */}
                        {group.has_example && (
                          <button
                            style={S.exampleBtn}
                            onClick={() => setExampleOpen("construction")}
                          >
                            See example
                          </button>
                        )}
                      </div>
                      <span style={S.evidenceGroupCount}>
                        {groupImgs.length > 0 ? `${groupImgs.length} added` : "Add as many as needed"}
                      </span>
                    </div>

                    <p style={S.evidenceGroupHelper}>{group.helper}</p>

                    {/* Thumbnails */}
                    {groupImgs.length > 0 && (
                      <div style={S.groupThumbGrid}>
                        {groupImgs.map((img) => (
                          <div key={img.id} style={S.groupThumbWrap}>
                            <img src={img.data_url} alt={group.label} style={S.groupThumb} />
                            <button
                              style={S.groupThumbRemove}
                              onClick={() => removeGroupImage(group.key, img.id)}
                              title="Remove"
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Two hidden inputs per group */}
                    <input
                      type="file" accept="image/*" capture="environment"
                      style={{ display:"none" }}
                      ref={el => { groupRefs.current[`${group.key}_cam`] = el; }}
                      onChange={e => { handleGroupUpload(group.key, group.image_type, e.target.files[0]); e.target.value = ""; }}
                    />
                    <input
                      type="file" accept="image/*"
                      style={{ display:"none" }}
                      ref={el => { groupRefs.current[`${group.key}_lib`] = el; }}
                      onChange={e => { handleGroupUpload(group.key, group.image_type, e.target.files[0]); e.target.value = ""; }}
                    />

                    {/* Two-button row for evidence groups */}
                    <div style={S.uploadBtnRow}>
                      <button
                        style={S.uploadBtnCamera}
                        onClick={() => groupRefs.current[`${group.key}_cam`].click()}
                      >
                        📷 Take Photo
                      </button>
                      <button
                        style={S.uploadBtnLibrary}
                        onClick={() => groupRefs.current[`${group.key}_lib`].click()}
                      >
                        🖼 Choose from Library
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* ══ PHOTO PROGRESS INDICATOR ════════════════════════ */}
            <div style={S.progressSection}>
              <div style={S.progressBar}>
                <div style={{ ...S.progressFill, width:`${Math.min(100,(totalPhotos/7)*100)}%` }} />
              </div>
              <div style={S.progressText}>
                <strong>{totalPhotos}</strong> photo{totalPhotos !== 1 ? "s" : ""} added
                {groupCount > 0 && (
                  <span style={S.progressBreakdown}> · {coreCount} core, {groupCount} evidence</span>
                )}
              </div>

              {/* Expert-voice guidance — non-blocking, appears after 2+ photos */}
              <GuidanceMessages
                missing={computeMissingEvidence(images, groupImages)}
                totalPhotos={totalPhotos}
                style={{ marginTop: 12 }}
              />
            </div>

            {/* ══ SECTION 2: DETAILS ══════════════════════════════ */}
            <div style={S.intakeSection}>
              <div style={S.sectionLabel}>02 — Details</div>
              <h2 style={S.sectionTitle}>Tell Us About It</h2>

              <div style={S.formStack}>
                {/* Dimensions */}
                <div style={S.dimRow}>
                  {["approximate_height","approximate_width"].map(key => {
                    const q = INTAKE_QS.find(q => q.key === key);
                    return (
                      <div key={key} style={S.dimField}>
                        <label style={S.fieldLabel}>{q.label}</label>
                        <input style={S.fieldInput} type="text" inputMode="decimal"
                          placeholder={q.placeholder}
                          value={answers[key]||""}
                          onChange={e => setAnswers(p => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    );
                  })}
                </div>

                {/* Text fields */}
                {INTAKE_QS.filter(q => q.group === "main").map(q => (
                  <div key={q.key} style={S.formField}>
                    <label style={S.fieldLabel}>{q.label}</label>
                    {q.type === "textarea"
                      ? <textarea style={{ ...S.fieldInput, ...S.fieldTA }}
                          placeholder={q.placeholder}
                          value={answers[q.key]||""}
                          onChange={e => setAnswers(p => ({ ...p, [q.key]: e.target.value }))} />
                      : <input style={S.fieldInput} type="text"
                          placeholder={q.placeholder}
                          value={answers[q.key]||""}
                          onChange={e => setAnswers(p => ({ ...p, [q.key]: e.target.value }))} />
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* ══ SECTION 3: FUNCTIONAL CLUES ═════════════════════ */}
            <div style={S.intakeSection}>
              <div style={S.sectionLabel}>03 — Functional Clues <span style={S.optionalInline}>(optional)</span></div>
              <h2 style={S.sectionTitle}>How Does It Work?</h2>
              <p style={S.sectionDesc}>
                These details help the engine detect conversion furniture, marriage pieces,
                and form changes that photographs alone may not reveal.
              </p>

              <div style={S.cluesList}>
                {FUNCTIONAL_CLUES.map(clue => {
                  const on = !!clues[clue.key];
                  return (
                    <div
                      key={clue.key}
                      style={{ ...S.clueRow, ...(on ? S.clueRowOn : {}) }}
                      onClick={() => setClues(p => ({ ...p, [clue.key]: !p[clue.key] }))}
                    >
                      <span style={S.clueLabel}>{clue.label}</span>
                      {/* Toggle */}
                      <div style={{ ...S.toggle, ...(on ? S.toggleOn : {}) }}>
                        <div style={{ ...S.toggleThumb, ...(on ? S.toggleThumbOn : {}) }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ══ SECTION 4: ANALYZE BUTTON ═══════════════════════ */}
            <div style={S.analyzeSection}>
              {error && (() => {
                // error is either a structured payload or a plain string (fallback)
                const isStructured = typeof error === "object" && error.error;
                const phaseLabel   = isStructured ? (error.failed_stage || "Unknown phase") : "Unknown phase";
                const errDetail    = isStructured ? error.error : null;
                const errType      = errDetail.error_type      || "unknown_error";
                const errMsg       = errDetail.error_message   || (typeof error === "string" ? error : "An unknown formatting error occurred. No phase details were returned.");
                const rawResp      = errDetail.raw_response    || "";
                const retried      = (errDetail && errDetail.retry_attempted != null) ? errDetail.retry_attempted : false;
                const stageName    = errDetail.stage_name      || "unknown";

                return (
                  <div style={S.phaseErrorCard}>
                    <div style={S.phaseErrorHeader}>
                      <span style={S.phaseErrorIcon}>⚠</span>
                      <div>
                        <div style={S.phaseErrorTitle}>Analysis Error</div>
                        <div style={S.phaseErrorPhase}>{phaseLabel} returned an invalid response</div>
                      </div>
                    </div>
                    <div style={S.phaseErrorType}>{errType.replace(/_/g," ")}</div>
                    <div style={S.phaseErrorMsg}>{errMsg}</div>
                    {retried && <div style={S.phaseErrorRetry}>⟳ Retry was attempted — retry also failed</div>}

                    {/* Collapsible debug panel */}
                    <button
                      style={S.phaseErrorDebugToggle}
                      onClick={() => setDebugOpen(o => !o)}
                    >
                      {debugOpen ? "▲ Hide Debug Details" : "▼ Show Debug Details"}
                    </button>

                    {debugOpen && (
                      <div style={S.phaseErrorDebugPanel}>
                        <div style={S.debugRow}>
                          <span style={S.debugKey}>Phase</span>
                          <span style={S.debugVal}>{stageName}</span>
                        </div>
                        <div style={S.debugRow}>
                          <span style={S.debugKey}>Error Type</span>
                          <span style={S.debugVal}>{errType}</span>
                        </div>
                        <div style={S.debugRow}>
                          <span style={S.debugKey}>Message</span>
                          <span style={S.debugVal}>{errMsg}</span>
                        </div>
                        <div style={S.debugRow}>
                          <span style={S.debugKey}>Retry Attempted</span>
                          <span style={S.debugVal}>{retried ? "Yes" : "No"}</span>
                        </div>
                        {rawResp && (
                          <div style={S.debugRowStack}>
                            <span style={S.debugKey}>Raw Response</span>
                            <pre style={S.debugRaw}>{rawResp}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
              <button
                style={{ ...S.analyzeBtn, ...(!canAnalyze ? S.analyzeBtnDisabled : {}) }}
                onClick={canAnalyze ? handleAnalyze : undefined}
                disabled={!canAnalyze}
              >
                {analyzing ? "Analyzing…" : "Analyze Furniture"}
              </button>
              <p style={S.analyzeHint}>
                {totalPhotos < 2
                  ? "Upload at least 2 photos so the system can evaluate construction details."
                  : "Analysis will proceed with the photos provided. Missing evidence categories will apply confidence caps rather than blocking results."}
              </p>
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════
            ROUTE A — FIELD SCAN
            Steps: quick_intake → [analyzing overlay] → quick_result
            Engine: runFieldScan (3-phase, graceful degradation)
            Schema: FieldScanResponse (independent validator)
            Photos: additive 2–6, auto-rerun on add
        ════════════════════════════════════════════════════ */}

        {/* ── FIELD SCAN INTAKE ── */}
        {step === "quick_intake" && (
          <div style={S.quickPage}>
            <div style={S.quickHeader}>
              <div style={S.quickModeBadge}>⚡ Field Scan</div>
              <h2 style={S.quickTitle}>Take 2–3 Photos</h2>
              <p style={S.quickSubtitle}>A front view plus a hidden structure photo (underside or back panel) and hardware gives the best result. Any 2 photos will work.</p>
            </div>

            {/* Photo slots — simple grid, no elaborate cards */}
            <div style={S.quickPhotoGrid}>
              {[
                { key:"overall_front",    label:"Overall Front",      hint:"Show the whole piece" },
                { key:"underside",        label:"Underside",           hint:"Saw marks, nails — best for dating", structural:true },
                { key:"back_panel",       label:"Back Panel",          hint:"Backboards, fasteners, secondary wood", structural:true },
                { key:"hardware_closeup", label:"Hardware Close-up",   hint:"Hinges, pulls, casters" },
              ].map(slot => {
                const img = images[slot.key];
                return (
                  <div key={slot.key} style={{ ...S.quickSlot, ...(img ? S.quickSlotFilled : {}) }}>
                    <input type="file" accept="image/*" capture="environment" style={{display:"none"}}
                      ref={el => { coreRefs.current[`${slot.key}_cam`] = el; }}
                      onChange={e => handleCoreUpload(slot.key, e.target.files[0])} />
                    <input type="file" accept="image/*" style={{display:"none"}}
                      ref={el => { coreRefs.current[`${slot.key}_lib`] = el; }}
                      onChange={e => handleCoreUpload(slot.key, e.target.files[0])} />
                    {img ? (
                      <div style={S.quickSlotFilled}>
                        <img src={img.data_url} alt={slot.label} style={S.quickThumb} />
                        <div style={S.quickSlotCheck}>✓ {slot.label}</div>
                      </div>
                    ) : (
                      <>
                        <div style={S.quickSlotLabel}>{slot.label}</div>
                        <div style={S.quickSlotHint}>{slot.hint}</div>
                        <div style={S.quickUploadRow}>
                          <button style={S.quickUploadBtn} onClick={() => coreRefs.current[`${slot.key}_cam`].click()}>📷 Camera</button>
                          <button style={S.quickUploadBtn} onClick={() => coreRefs.current[`${slot.key}_lib`].click()}>🖼 Library</button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={S.quickCount}>{Object.keys(images).length} of 3 photos added</div>

            {/* Optional guess + asking price */}
            <div style={S.quickGuessBlock}>
              <label style={S.quickGuessLabel}>What do you think it is? <span style={{color:"#aaa",fontWeight:400}}>(optional)</span></label>
              <input style={S.quickGuessInput} type="text" placeholder="e.g. table, cabinet, chair…"
                value={(answers as any).user_category_guess || ""}
                onChange={e => setAnswers(p => ({...p, user_category_guess: e.target.value}))} />
            </div>

            {/* Asking price — optional, visually subtle */}
            <div style={S.quickGuessBlock}>
              <label style={S.quickGuessLabel}>
                Asking price <span style={{color:"#aaa",fontWeight:400}}>(optional — enables buy guidance)</span>
              </label>
              <div style={S.quickPriceRow}>
                <span style={S.quickPriceDollar}>$</span>
                <input
                  style={S.quickPriceInput}
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  min="0"
                  step="1"
                  value={(answers as any).asking_price || ""}
                  onChange={e => setAnswers(p => ({...p, asking_price: e.target.value}))}
                />
              </div>
            </div>

            {/* Quick Mode error — only shown for true API/network failures, not degraded results */}
            {error && !error.isDegraded && (() => {
              const errMsg  = error.error_message || "Quick scan couldn't interpret the results. Please try again or add another photo.";
              const rawResp = error.raw_response  || "";
              return (
                <div style={S.quickErrorCard}>
                  <div style={S.quickErrorMsg}>{errMsg}</div>
                  {rawResp && (
                    <>
                      <button style={S.quickErrorDebugBtn} onClick={() => setDebugOpen(o => !o)}>
                        {debugOpen ? "▲ Hide details" : "▼ Show details"}
                      </button>
                      {debugOpen && (
                        <div style={S.quickErrorDebugPanel}>
                          <div style={S.quickErrorDebugLine}><strong>Type:</strong> {error.error_type||"unknown"}</div>
                          <div style={S.quickErrorDebugLine}><strong>Raw response:</strong></div>
                          <pre style={S.quickErrorRaw}>{rawResp.slice(0,600)}{rawResp.length>600?"…":""}</pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })()}

            <button
              style={{...S.quickAnalyzeBtn,...(Object.keys(images).length < 2 ? S.quickAnalyzeBtnDisabled:{})}}
              onClick={Object.keys(images).length >= 2 && !analyzing ? () => handleQuickAnalyze(false) : undefined}
              disabled={Object.keys(images).length < 2 || analyzing}
            >
              {analyzing ? "Scanning…" : Object.keys(images).length < 2 ? "Add at least 2 photos" : "⚡ Run Field Scan"}
            </button>
          </div>
        )}

        {/* ── FIELD SCAN RESULT ── */}
        {step === "quick_result" && quickResult && (() => {
          const guidance = quickResult.buy_guidance || "Caution";
          const priceGuidance = quickResult.price_guidance; // "GOOD BUY" | "FAIR PRICE" | "OVERPRICED" | "UNKNOWN" | null

          // Signal config driven by buy_guidance (QuickScanResponse field)
          const signalConfig = {
            "Buy":        { label:"Good Candidate",    color:"#3a6b38", bg:"#edf5ec", border:"#a8cca6" },
            "Caution":    { label:"Inspect Carefully", color:"#7a6010", bg:"#fdf8ec", border:"#d8c870" },
            "Pass":       { label:"Pass",              color:"#8b3a2a", bg:"#fdf0ec", border:"#d8a090" },
            "Fair Price": { label:"Fair Price",        color:"#7a6010", bg:"#fdf8ec", border:"#d8c870" },
            "Overpriced": { label:"Overpriced",        color:"#8b3a2a", bg:"#fdf0ec", border:"#d8a090" },
            "Unknown":    { label:"Value Unknown",     color:"#888",    bg:"#f5f5f5", border:"#ccc"    },
          }[guidance] || { label:"Uncertain", color:"#888", bg:"#f5f5f5", border:"#ccc" };

          const priceConfig = {
            "GOOD BUY":    { label:"GOOD BUY",           color:"#3a6b38", bg:"#edf5ec", border:"#a8cca6" },
            "FAIR PRICE":  { label:"FAIR PRICE",          color:"#7a6010", bg:"#fdf8ec", border:"#d8c870" },
            "OVERPRICED":  { label:"OVERPRICED",          color:"#8b3a2a", bg:"#fdf0ec", border:"#d8a090" },
            "UNKNOWN":     { label:"VALUE UNKNOWN",       color:"#888",    bg:"#f5f5f5", border:"#ccc"   },
            "UNAVAILABLE": { label:"BUYING GUIDANCE\nUNAVAILABLE", color:"#888", bg:"#f5f5f5", border:"#ccc" },
          }[priceGuidance] || null;

          const hasValue       = quickResult.estimated_value_low > 0 || quickResult.estimated_value_high > 0;
          const hasAskingPrice = quickResult.asking_price !== null && quickResult.asking_price !== undefined;
          // -- safe locals for entire result screen
          const shortReason    = quickResult && typeof quickResult.short_reason === "string"       ? quickResult.short_reason            : "";
          const likelyId       = quickResult && typeof quickResult.likely_identification === "string" ? quickResult.likely_identification : "Identification uncertain";
          const formFamily     = (quickResult && quickResult.form_family)  || "";
          const subfamily      = (quickResult && quickResult.subfamily)    || "";
          const mechanismsDetected  = Array.isArray(quickResult.mechanisms_detected)       ? quickResult.mechanisms_detected       : [];
          const evidenceDigest      = Array.isArray(quickResult.evidence_digest)            ? quickResult.evidence_digest           : [];
          const hardNegatives       = Array.isArray(quickResult.hard_negatives)             ? quickResult.hard_negatives            : [];
          const keyDatingEvidence   = Array.isArray(quickResult.key_dating_evidence)        ? quickResult.key_dating_evidence       : [];
          const photoTypesIncluded  = Array.isArray(quickResult.photo_types_included)       ? quickResult.photo_types_included      : Object.keys(images);
          const followupSuggestions = Array.isArray(quickResult.followup_photo_suggestions) ? quickResult.followup_photo_suggestions : [];

          return (
            <div style={S.quickResultPage}>

              <RuntimeModeBadge />

              {/* ── Page tagline ── */}
              <div style={{
                textAlign:"center", padding:"8px 0 14px",
                fontSize:13, color:"#8b6914", fontFamily:"'Georgia',serif",
                fontStyle:"italic", letterSpacing:"0.03em",
                borderBottom:"1px solid #e8ddb8", marginBottom:16,
              }}>
                We explain the evidence behind every identification.
              </div>

              {/* ══ TIER 1: CONFIRMED OBSERVATIONS ═══════════════════════════ */}
              {(() => {
                const digestItems = evidenceDigest;
                const dateItems   = keyDatingEvidence;
                const photoCount  = quickResult.photos_used_count || Object.keys(images).length;
                const photoTypes  = photoTypesIncluded;

                const allEvidence = [
                  ...digestItems,
                  ...dateItems.filter(function(d){ return !digestItems.includes(d); }),
                ].slice(0, 6);

                return (
                  <div style={S.quickResultBlock}>
                    <div style={{
                      fontSize:10, fontFamily:"sans-serif", letterSpacing:"0.12em",
                      textTransform:"uppercase", color:"#8b6914", fontWeight:700, marginBottom:6,
                    }}>1 — Confirmed Observations</div>
                    <div style={{
                      fontSize:12, color:"#7a6040", fontFamily:"sans-serif",
                      marginBottom:10, fontStyle:"italic",
                    }}>What the photos show directly</div>
                    {allEvidence.length > 0 ? (
                      <ul style={{listStyle:"none", padding:0, margin:"0 0 8px", display:"flex", flexDirection:"column", gap:6}}>
                        {allEvidence.map(function(item, i){
                          return (
                            <li key={i} style={{display:"flex", gap:8, fontSize:13, color:"#3a2010", lineHeight:1.55, fontFamily:"'Georgia',serif"}}>
                              <span style={{color:"#5a6b52", flexShrink:0, marginTop:2}}>◆</span>
                              <span>{item}</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div style={{fontSize:13, color:"#aaa", fontFamily:"sans-serif", fontStyle:"italic"}}>
                        No specific observations extracted — add a hidden structure photo (underside or back panel), joinery, or hardware photo.
                      </div>
                    )}
                    {photoTypes.length > 0 && (
                      <div style={{fontSize:10,color:"#aaa",fontFamily:"sans-serif",marginTop:4}}>
                        From {photoCount} photo{photoCount!==1?"s":""}: {photoTypes.map(function(t){ return t.replace(/_/g," "); }).join(", ")}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ══ TIER 2: EVIDENCE-BASED INDICATORS ════════════════════════ */}
              {(() => {
                // Build interpretation bullets from mechanisms + evidence prose
                const indicators = [];
                const recMethod = quickResult.recognition_method || "visual_impression";
                const conf      = quickResult.confidence || "Low";

                // ── Language system: build narrative prose ──
                var fsObsByType = (function(){
                  var dig = caseStore[caseId] && caseStore[caseId].stage_outputs &&
                    caseStore[caseId].stage_outputs["0_evidence_digest"];
                  return dig && dig.mechanisms_detected
                    ? { mechanical_structures: Object.keys(dig.mechanisms_detected)
                          .filter(function(k){ return dig.mechanisms_detected[k] && dig.mechanisms_detected[k].present; })
                          .map(function(k){ return { clue:k, visual_confidence:dig.mechanisms_detected[k].confidence||60, _category:"construction" }; }),
                        fasteners: (dig.fastener_clues||[]).map(function(fc){ return { clue:fc.clue, visual_confidence:fc.visual_confidence||50, _category:"fasteners" }; }),
                      }
                    : {};
                })();
                var fsWeightedAll = computeClueWeights(fsObsByType);
                // Field Scan: filter to high+ priority clues for concise output
                var fsWeighted  = filterByPriority(fsWeightedAll, "high");
                if (!fsWeighted.length) fsWeighted = fsWeightedAll; // fallback: show all if nothing passes
                var fsResolved  = resolveConflicts(fsWeighted);
                var fsNarrative = buildNarrative(
                  fsWeighted, fsResolved,
                  likelyId, quickResult.confidence,
                  Array.isArray(quickResult.photo_types_included) ? quickResult.photo_types_included : Object.keys(images),
                  "field_scan"
                );

                // ── Historical Clue Library lookup (Field Scan: top 3) ──
                // Collect all clue keys from mechanisms + evidence digest keywords
                const fsClueKeys = [];
                if (Array.isArray(quickResult.mechanisms_detected)) {
                  quickResult.mechanisms_detected.forEach(function(m){ fsClueKeys.push(m); });
                }
                // Also pull from stage0 digest mechanical_signatures if available
                const fsDigest = caseStore[caseId] && caseStore[caseId].stage_outputs &&
                  caseStore[caseId].stage_outputs["0_evidence_digest"];
                if (fsDigest && Array.isArray(fsDigest.fastener_clues)) {
                  fsDigest.fastener_clues.forEach(function(fc){ if (fc.clue) fsClueKeys.push(fc.clue); });
                }
                if (fsDigest && Array.isArray(fsDigest.toolmark_clues)) {
                  fsDigest.toolmark_clues.forEach(function(tc){ if (tc.clue) fsClueKeys.push(tc.clue); });
                }

                // Generate top 3 indicators from library
                const libIndicators = generateIndicators(fsClueKeys, 3);
                libIndicators.forEach(function(entry){
                  indicators.push({
                    text: entry.indicator_text,
                    range: entry.typical_date_range,
                    hardNeg: !!entry.hard_negative,
                  });
                });

                // Confidence context note (always last)
                const confNote = conf === "High" || conf === "Very High"
                  ? "The combination of visible structural mechanisms provides a high-confidence basis for the identification presented below."
                  : conf === "Moderate"
                  ? "The available evidence supports a probable identification. Additional construction photos would strengthen the conclusion."
                  : "Current evidence supports only a broad category identification — a hidden structure photo (underside or back panel) or joinery close-up would significantly narrow the result.";
                indicators.push({ text: confNote, range: null, hardNeg: false });

                if (!indicators.length) return null;
                return (
                  <div style={S.quickResultBlock}>
                    <div style={{
                      fontSize:10, fontFamily:"sans-serif", letterSpacing:"0.12em",
                      textTransform:"uppercase", color:"#5a6b52", fontWeight:700, marginBottom:6,
                    }}>2 — Evidence-Based Indicators</div>
                    <div style={{
                      fontSize:12, color:"#7a6040", fontFamily:"sans-serif",
                      marginBottom:10, fontStyle:"italic",
                    }}>What these clues typically suggest</div>
                    {fsNarrative && fsNarrative.interpretation && (
                      <div style={{
                        fontSize:13, color:"#3a2010", fontFamily:"'Georgia',serif",
                        lineHeight:1.75, marginBottom:12, padding:"10px 12px",
                        background:"#faf6ef", borderRadius:4, border:"1px solid #e8ddb8",
                      }}>
                        {fsNarrative.interpretation}
                      </div>
                    )}
                    <div style={{display:"flex", flexDirection:"column", gap:8}}>
                      {indicators.map(function(ind, i){
                        const txt   = typeof ind === "string" ? ind : ind.text;
                        const range = typeof ind === "object" ? ind.range : null;
                        const isHN  = typeof ind === "object" && ind.hardNeg;
                        return (
                          <div key={i} style={{
                            fontSize:13, color: isHN ? "#8b3014" : "#4a3728", lineHeight:1.65,
                            fontFamily:"'Georgia',serif",
                            borderLeft:"2px solid " + (isHN ? "#d8a090" : "#c8b888"), paddingLeft:10,
                          }}>
                            {txt}
                            {range && <span style={{fontSize:10,color:"#aaa",fontFamily:"sans-serif",marginLeft:8}}>({range})</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* ══ TIER 3: LIKELY IDENTIFICATION ════════════════════════════ */}
              <div style={S.quickResultBlock}>
                <div style={{
                  fontSize:10, fontFamily:"sans-serif", letterSpacing:"0.12em",
                  textTransform:"uppercase", color:"#3a5878", fontWeight:700, marginBottom:6,
                }}>3 — Likely Identification</div>
                <div style={{
                  fontSize:12, color:"#7a6040", fontFamily:"sans-serif",
                  marginBottom:10, fontStyle:"italic",
                }}>Synthesis of the evidence above</div>
                <div style={S.quickResultId}>{(quickResult.likely_identification && typeof quickResult.likely_identification === "string") ? quickResult.likely_identification : "Undetermined"}</div>

                {/* Form family / subfamily taxonomy row */}
                {((quickResult.form_family || quickResult.subfamily)) && (
                  <div style={{display:"flex", flexWrap:"wrap", gap:6, marginTop:10}}>
                    {(quickResult.form_family && quickResult.form_family !== "unknown") && (
                      <div style={{
                        fontSize:11, fontFamily:"sans-serif", letterSpacing:"0.08em",
                        background:"#f0f4ee", border:"1px solid #a8cca6", color:"#3a6b38",
                        padding:"3px 10px", borderRadius:2,
                      }}>
                        {(quickResult.form_family || "").toUpperCase()}
                      </div>
                    )}
                    {(quickResult.subfamily && quickResult.subfamily !== quickResult.form_family && quickResult.subfamily !== quickResult.likely_identification) && (
                      <div style={{
                        fontSize:11, fontFamily:"sans-serif", letterSpacing:"0.08em",
                        background:"#fdfaf2", border:"1px solid #d8c870", color:"#7a6010",
                        padding:"3px 10px", borderRadius:2,
                      }}>
                        {quickResult.subfamily}
                      </div>
                    )}
                  </div>
                )}

                {/* Structural signature note */}
                {quickResult.form_signature_used && (
                  <div style={{fontSize:12, color:"#5a6b52", fontFamily:"sans-serif", marginTop:8, display:"flex", alignItems:"center", gap:6}}>
                    <span style={{color:"#5a6b52"}}>◆</span>
                    <span>Identified by structural signature: <strong>{quickResult.form_signature_used.replace(/_/g," ")}</strong></span>
                  </div>
                )}
              </div>

              {/* ── Buy signal card ── */}
              <div style={{ ...S.signalCard, background:signalConfig.bg, borderColor:signalConfig.border }}>
                <div style={S.signalBody}>
                  <div style={{ ...S.signalLabel, color:signalConfig.color }}>{signalConfig.label}</div>
                  <div style={S.signalRationale}>{(quickResult.short_reason && typeof quickResult.short_reason === "string") ? quickResult.short_reason : ""}</div>
                </div>
              </div>

              {/* ── Date + Confidence ── */}
              <div style={S.quickMetaRow}>
                <div style={S.quickMetaBox}>
                  <div style={S.quickMetaLabel}>Estimated Date</div>
                  <div style={S.quickMetaValue}>{quickResult.estimated_date_range || "Undetermined"}</div>
                </div>
                <div style={S.quickMetaBox}>
                  <div style={S.quickMetaLabel}>Confidence</div>
                  {/* 4-level confidence ladder */}
                  {(() => {
                    const conf = quickResult.confidence || "Low";
                    // safe locals (likelyId, formFamily, subfamily, mechanismsDetected, etc.) declared in outer scope
                const confConfig = {
                      "Very High": { color:"#2a5a28", bg:"#e8f5e7", border:"#90c490", label:"Very High", note:"Form clearly visible" },
                      "High":      { color:"#3a6b38", bg:"#edf5ec", border:"#a8cca6", label:"High",      note:"Structural mechanism confirmed" },
                      "Moderate":  { color:"#7a6010", bg:"#fdf8ec", border:"#d8c870", label:"Moderate",  note:"Form strongly suggested" },
                      "Low":       { color:"#8b3a2a", bg:"#fdf0ec", border:"#d8a090", label:"Low",       note:"Broad category only" },
                    }[conf] || { color:"#8b3a2a", bg:"#fdf0ec", border:"#d8a090", label:"Low", note:"Limited evidence" };
                    return (
                      <div style={{
                        background: confConfig.bg, border:`1px solid ${confConfig.border}`,
                        borderRadius:3, padding:"6px 12px", display:"inline-block",
                      }}>
                        <div style={{ fontSize:16, color:confConfig.color, fontWeight:600, fontFamily:"'Georgia',serif" }}>
                          {confConfig.label}
                        </div>
                        <div style={{ fontSize:10, color:confConfig.color, fontFamily:"sans-serif", letterSpacing:"0.06em", marginTop:2, opacity:0.85 }}>
                          {confConfig.note}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ── Market value + price comparison ── */}
              {(hasValue || hasAskingPrice) && (
                <div style={S.quickResultBlock}>
                  <div style={S.quickResultBlockTitle}>Market Value</div>

                  {hasValue ? (
                    <div style={S.quickValueRange}>
                      ${quickResult.estimated_value_low.toLocaleString()} – ${quickResult.estimated_value_high.toLocaleString()}
                    </div>
                  ) : (
                    <div style={{...S.quickValueRange, color:"#aaa", fontSize:14}}>Could not estimate</div>
                  )}

                  {hasAskingPrice && (
                    <div style={S.quickAskingRow}>
                      <div style={S.quickAskingBox}>
                        <div style={S.quickMetaLabel}>Asking Price</div>
                        <div style={S.quickMetaValue}>${Number(quickResult.asking_price).toLocaleString()}</div>
                      </div>
                      {priceConfig && (
                        <div style={{...S.quickPriceGuidanceBadge, background:priceConfig.bg, borderColor:priceConfig.border, color:priceConfig.color}}>
                          {priceConfig.label}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}



              {/* ── Hard negatives ── */}
              {hardNegatives.length > 0 && (
                <div style={S.quickHardNeg}>
                  <div style={S.quickHardNegTitle}>⚠ Hard Negatives Detected</div>
                  {hardNegatives.map((n,i) => (
                    <div key={i} style={S.quickHardNegItem}>{n}</div>
                  ))}
                </div>
              )}


              {/* ── Confidence Drivers panel (powered by CLUE_WEIGHT_TABLE) ── */}
              {(() => {
                // Compute weights from Stage 0 evidence digest observations
                var dig = caseStore[caseId] && caseStore[caseId].stage_outputs &&
                  caseStore[caseId].stage_outputs["0_evidence_digest"];
                var obsByType = dig && dig.mechanisms_detected
                  ? {
                      mechanical_structures: Object.keys(dig.mechanisms_detected)
                        .filter(function(k){ return dig.mechanisms_detected[k] && dig.mechanisms_detected[k].present; })
                        .map(function(k){ return {
                          clue: k, visual_confidence: dig.mechanisms_detected[k].confidence || 60,
                          source_image: (dig.photo_types_included||[])[0] || null,
                        }; }),
                      fasteners: (dig.fastener_clues||[]).map(function(fc){ return {
                        clue: fc.clue, visual_confidence: fc.visual_confidence || 50,
                        source_image: fc.source_photo || null,
                      }; }),
                      toolmarks: (dig.toolmark_clues||[]).map(function(tc){ return {
                        clue: tc.clue, visual_confidence: tc.visual_confidence || 50,
                        source_image: tc.source_photo || null,
                      }; }),
                    }
                  : {};
                var weighted = computeClueWeights(obsByType);
                var drivers  = deriveConfidenceDrivers(weighted, 3);
                var increased = drivers.increased;
                var limited   = drivers.limited;

                // Supplement limited list with missing photo types
                var photoTypes = Array.isArray(quickResult.photo_types_included) ? quickResult.photo_types_included : Object.keys(images);
                var hasStructural = photoTypes.includes("underside") || photoTypes.includes("back_panel");
                if (!hasStructural && limited.length < 4) limited.push("No hidden structure photo (underside or back panel) submitted");
                if (!photoTypes.includes("joinery_closeup") && limited.length < 4) limited.push("Joinery closeup not submitted");
                if (weighted.length === 0) {
                  increased.push("Broad form suggested by visual impression");
                  limited.push("No structured clue observations available");
                }

                if (!increased.length && !limited.length) return null;
                return (
                  <div style={{
                    ...S.quickResultBlock,
                    background:"#f9f5ed", border:"1px solid #d4c9b4",
                  }}>
                    <div style={{
                      fontSize:10, fontFamily:"sans-serif", letterSpacing:"0.12em",
                      textTransform:"uppercase", color:"#8b6914", fontWeight:700, marginBottom:10,
                    }}>Confidence Drivers</div>
                    <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                      <div>
                        <div style={{fontSize:11,fontFamily:"sans-serif",color:"#4a8b48",fontWeight:600,marginBottom:6}}>Confidence Increased By</div>
                        {increased.map(function(s,i){
                          return <div key={i} style={{fontSize:12,color:"#3a2010",fontFamily:"'Georgia',serif",marginBottom:4,paddingLeft:10,borderLeft:"2px solid #a8cca6"}}>{"• "+s}</div>;
                        })}
                        {!increased.length && <div style={{fontSize:11,color:"#aaa",fontFamily:"sans-serif"}}>None identified</div>}
                      </div>
                      <div>
                        <div style={{fontSize:11,fontFamily:"sans-serif",color:"#8b6020",fontWeight:600,marginBottom:6}}>Confidence Limited By</div>
                        {limited.map(function(s,i){
                          return <div key={i} style={{fontSize:12,color:"#3a2010",fontFamily:"'Georgia',serif",marginBottom:4,paddingLeft:10,borderLeft:"2px solid #d8c870"}}>{"• "+s}</div>;
                        })}
                        {!limited.length && <div style={{fontSize:11,color:"#aaa",fontFamily:"sans-serif"}}>No limitations noted</div>}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ── Conflict Notes (Field Scan condensed) ── */}
              {(() => {
                var dig = caseStore[caseId] && caseStore[caseId].stage_outputs &&
                  caseStore[caseId].stage_outputs["0_evidence_digest"];
                var obsByType = dig && dig.mechanisms_detected
                  ? {
                      mechanical_structures: Object.keys(dig.mechanisms_detected)
                        .filter(function(k){ return dig.mechanisms_detected[k] && dig.mechanisms_detected[k].present; })
                        .map(function(k){ return { clue:k, visual_confidence: dig.mechanisms_detected[k].confidence||60, _category:"construction" }; }),
                      fasteners: (dig.fastener_clues||[]).map(function(fc){ return { clue:fc.clue, visual_confidence:fc.visual_confidence||50, _category:"fasteners" }; }),
                      hardware:  (dig.hardware_clues||[]).map(function(hc){ return { clue:hc.clue, visual_confidence:hc.visual_confidence||50, _category:"hardware" }; }),
                    }
                  : {};
                var weighted  = computeClueWeights(obsByType);
                var resolved  = resolveConflicts(weighted);
                var notes = resolved.conflict_notes;
                var ri    = resolved.restoration_interpretation;
                if (!notes.length && !ri.likely_restoration_present) return null;
                return (
                  <div style={{
                    ...S.quickResultBlock,
                    background:"#fdf8f0", border:"1px solid #e8d0b0",
                  }}>
                    <div style={{
                      fontSize:10, fontFamily:"sans-serif", letterSpacing:"0.12em",
                      textTransform:"uppercase", color:"#8b5014", fontWeight:700, marginBottom:8,
                    }}>Conflict Notes</div>
                    {ri.likely_restoration_present && (
                      <div style={{
                        fontSize:12, color:"#5a3e1b", fontFamily:"'Georgia',serif",
                        fontStyle:"italic", marginBottom:8, lineHeight:1.6,
                        borderLeft:"2px solid #e8c090", paddingLeft:8,
                      }}>
                        Possible restoration or repair may explain mixed clues.
                      </div>
                    )}
                    {notes.slice(0,3).map(function(note, i){
                      return (
                        <div key={i} style={{
                          fontSize:12, color:"#4a3728", fontFamily:"'Georgia',serif",
                          lineHeight:1.6, marginBottom:5, display:"flex", gap:8,
                        }}>
                          <span style={{color:"#c89050", flexShrink:0}}>◆</span>
                          <span>{note}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* ── Progressive photo capture ── */}
              {(() => {
                const totalQuickPhotos = Object.keys(images).length;
                const lowConf = quickResult.confidence === "Low" || quickResult.confidence === "Moderate"
                  || quickResult.is_broad_category || quickResult.is_degraded_fallback;
                // Only show additive photo panel when confidence is not Very High
                const showImprovePanel = lowConf && quickResult.confidence !== "Very High";

                // ── Form-aware follow-up slot map ─────────────────────
                // Keys must match the image_type values used in handleQuickAddPhoto.
                // Each entry: { key, label, hint }
                const FORM_FOLLOWUP_SLOTS = {
                  chest: [
                    { key:"overall_front",    label:"Interior view",         hint:"Open the lid — show the interior lining and bottom boards" },
                    { key:"back_panel",       label:"Back panel or underside", hint:"Back panel: secondary wood and fastener type. Underside: saw marks and nail pattern." },
                    { key:"hardware_closeup", label:"Lock or hinge close-up", hint:"Lock plates, strap hinges, and bail handles help date the piece" },
                    { key:"joinery_closeup",  label:"Corner joinery",         hint:"Dovetails or nailed corners at the chest corners" },
                    { key:"back",             label:"Back panel",             hint:"Back construction and secondary wood reveal manufacturing era" },
                  ],
                  table: [
                    { key:"overall_side",     label:"Leaf support or gate",   hint:"Side view shows leaf mechanism — gate leg, swing leg, or bracket" },
                    { key:"underside",        label:"Underside or back panel", hint:"Underside: apron saw marks and nail types. Back panel: secondary wood and fasteners." },
                    { key:"hardware_closeup", label:"Hinge or caster detail", hint:"Hinge type at leaf joint, or caster type if present" },
                    { key:"joinery_closeup",  label:"Leg attachment",         hint:"Where the leg meets the apron — mortise or dowel?" },
                  ],
                  cabinet: [
                    { key:"overall_front",    label:"Interior shelves",       hint:"Open a door — show shelf construction and interior finish" },
                    { key:"hardware_closeup", label:"Door hinges close-up",   hint:"Hinge type and fasteners help date the piece" },
                    { key:"back",             label:"Back panel",             hint:"Back construction and wood reveal manufacturing era" },
                    { key:"joinery_closeup",  label:"Drawer joinery",         hint:"If drawers are present — photograph a drawer corner" },
                    { key:"underside",        label:"Underside",              hint:"Saw marks and nail types for dating" },
                  ],
                  dresser: [
                    { key:"joinery_closeup",  label:"Drawer corner joinery",  hint:"Pull out a drawer — photograph the corner dovetails or joints" },
                    { key:"back_panel",       label:"Back panel or underside", hint:"Back panel: secondary wood and fasteners. Underside: saw marks on case bottom." },
                    { key:"hardware_closeup", label:"Pull or bail hardware",   hint:"Original hardware is one of the strongest dating clues" },
                    { key:"back",             label:"Back panel",             hint:"Back construction reveals period of manufacture" },
                  ],
                  wardrobe: [
                    { key:"overall_front",    label:"Interior hanging space",  hint:"Open the door — show the interior rod, hooks, or shelves" },
                    { key:"hardware_closeup", label:"Hinge and lock hardware", hint:"Hinge type and escutcheon help date the piece" },
                    { key:"back",             label:"Back panel",             hint:"Back boards and attachment method reveal manufacturing era" },
                    { key:"joinery_closeup",  label:"Cornice or case joinery", hint:"How the top section meets the case" },
                    { key:"underside",        label:"Underside or foot",       hint:"Foot construction and nail types help date the piece" },
                  ],
                  desk: [
                    { key:"joinery_closeup",  label:"Drawer joinery",         hint:"Drawer corner — hand-cut or machine dovetails?" },
                    { key:"overall_front",    label:"Interior compartments",  hint:"Open the fall front or drawer — show fitted interior" },
                    { key:"underside",        label:"Writing surface underside", hint:"Saw marks and construction underneath the writing surface" },
                    { key:"hardware_closeup", label:"Hardware close-up",      hint:"Pulls, locks, or escutcheons help date the piece" },
                  ],
                  seating: [
                    { key:"underside",        label:"Underside of seat",      hint:"Leg attachment method and nail types for dating" },
                    { key:"joinery_closeup",  label:"Leg or back joinery",    hint:"How the leg or back spindle joins the seat" },
                    { key:"hardware_closeup", label:"Hardware or casters",    hint:"Caster type if present — helps narrow the date range" },
                    { key:"back",             label:"Back of chair",          hint:"Back rail construction and secondary wood" },
                  ],
                  stand: [
                    { key:"underside",        label:"Underside or foot",      hint:"Foot construction and nail types help date the piece" },
                    { key:"joinery_closeup",  label:"Leg attachment",         hint:"How the leg joins the top or shelf" },
                    { key:"hardware_closeup", label:"Hardware if present",    hint:"Any hardware — casters, hinges, pulls" },
                    { key:"back",             label:"Back panel or rails",    hint:"Back construction if enclosed" },
                  ],
                  shelf: [
                    { key:"back",             label:"Back panel",             hint:"Back boards reveal manufacturing era and secondary wood" },
                    { key:"joinery_closeup",  label:"Shelf bracket or joint", hint:"How shelves attach to the uprights" },
                    { key:"underside",        label:"Underside of top",       hint:"Saw marks on the top underside help date the piece" },
                    { key:"hardware_closeup", label:"Hardware if present",    hint:"Any glass door hinges, pulls, or latches" },
                  ],
                  specialized: [
                    { key:"overall_side",     label:"Side or profile view",   hint:"Shows the full depth and any mechanism housing" },
                    { key:"underside",        label:"Interior or underside",  hint:"Mechanism cavity or interior structure" },
                    { key:"hardware_closeup", label:"Hardware close-up",      hint:"Hinges, stops, or specialized mechanism hardware" },
                    { key:"joinery_closeup",  label:"Case joinery",           hint:"Corner construction and secondary wood" },
                    { key:"back",             label:"Back panel",             hint:"Back construction and milling marks" },
                  ],
                };

                // ── Specific-form follow-up slots ────────────────────
                // Keyed by form_signature_used — more precise than broad_form_key.
                // Only present for forms where signature-based slots differ from the family default.
                const SPECIFIC_FORM_SLOTS = {
                  "gateleg drop-leaf table": [
                    { key:"overall_side",     label:"Gate leg extended",      hint:"Show the gate swing leg in its open, supporting position" },
                    { key:"hardware_closeup", label:"Gate hinge area",        hint:"Close-up of where the gate leg pivots from the fixed frame" },
                    { key:"joinery_closeup",  label:"Leaf joint (rule joint)", hint:"The interlocking joint between the center top and the drop leaf" },
                    { key:"underside",        label:"Underside rail",         hint:"Apron construction and leg attachment under the center section" },
                  ],
                  "pembroke table": [
                    { key:"overall_side",     label:"Swing leg extended",     hint:"Show the single swing leg supporting the raised leaf" },
                    { key:"joinery_closeup",  label:"Leaf joint",             hint:"The joint between center top and leaf — rule joint or butt" },
                    { key:"underside",        label:"Underside",              hint:"Drawer if present, apron construction, nail types" },
                    { key:"hardware_closeup", label:"Hardware detail",        hint:"Any hardware on the drawer or leaf support" },
                  ],
                  "drop-leaf table": [
                    { key:"overall_side",     label:"Leaf support mechanism", hint:"Show how the leaf is supported when raised — gate, bracket, or swing" },
                    { key:"joinery_closeup",  label:"Leaf joint",             hint:"Joint between center top and leaf edge" },
                    { key:"underside",        label:"Underside",              hint:"Apron, leg attachment, and nail types for dating" },
                    { key:"hardware_closeup", label:"Hardware if present",    hint:"Any hinges, locks, or casters" },
                  ],
                  "blanket chest": [
                    { key:"overall_front",    label:"Open lid — interior",    hint:"Show the interior lining, till if present, and bottom boards" },
                    { key:"underside",        label:"Bottom boards",          hint:"Saw marks and nail types on the underside — critical for dating" },
                    { key:"hardware_closeup", label:"Lid hinge and lock",     hint:"Hinge type, lock plate, and bail handle if present" },
                    { key:"joinery_closeup",  label:"Corner joinery",         hint:"Front corner — dovetails or nailed butt joint?" },
                  ],
                  "storage chest or trunk": [
                    { key:"overall_front",    label:"Open lid — interior",    hint:"Show the interior construction and lining material" },
                    { key:"hardware_closeup", label:"Hinge and lock hardware", hint:"Hardware type helps date the piece" },
                    { key:"underside",        label:"Bottom construction",    hint:"Bottom boards and nail types for dating" },
                    { key:"joinery_closeup",  label:"Corner joinery",         hint:"Corner construction reveals hand vs machine made" },
                  ],
                  "slant-front desk": [
                    { key:"overall_front",    label:"Interior pigeonholes",   hint:"Open the fall front — show the fitted interior" },
                    { key:"joinery_closeup",  label:"Drawer joinery",         hint:"Pull out a small interior drawer — photograph the corner" },
                    { key:"hardware_closeup", label:"Escutcheon and hardware", hint:"Lock plate, pull style, and hinge type" },
                    { key:"underside",        label:"Underside",              hint:"Saw marks and construction underneath" },
                  ],
                  "rolltop desk": [
                    { key:"overall_front",    label:"Roll open — interior",   hint:"Open the tambour roll to show the interior writing surface" },
                    { key:"joinery_closeup",  label:"Pedestal drawer joinery", hint:"Pull out a side pedestal drawer — photograph the corner" },
                    { key:"hardware_closeup", label:"Hardware detail",        hint:"Lock, pulls, and tambour track hardware" },
                    { key:"back",             label:"Back panel",             hint:"Back construction and secondary wood" },
                  ],
                  "secretary desk": [
                    { key:"overall_front",    label:"Interior compartments",  hint:"Open the fall front fully — show the pigeonholes and drawers" },
                    { key:"joinery_closeup",  label:"Drawer joinery",         hint:"Remove an interior drawer — photograph the corner joint" },
                    { key:"hardware_closeup", label:"Lock and escutcheon",    hint:"Fall-front lock plate and hinge type" },
                    { key:"underside",        label:"Underside",              hint:"Saw marks under the lower case section" },
                  ],
                  "tilt-top table": [
                    { key:"overall_side",     label:"Tilt mechanism",         hint:"Show the hinge block or bird-cage mechanism that allows tilting" },
                    { key:"underside",        label:"Top underside",          hint:"Show the underside of the top — tilt block, catches, saw marks" },
                    { key:"joinery_closeup",  label:"Column and platform",    hint:"Where the column meets the platform supporting the top" },
                    { key:"hardware_closeup", label:"Hardware if present",    hint:"Any catch, lock, or metal fitting on the tilt mechanism" },
                  ],
                  "washstand": [
                    { key:"overall_front",    label:"Basin area and shelf",   hint:"Show the full front — splash rail, basin shelf, and lower storage" },
                    { key:"hardware_closeup", label:"Hardware close-up",      hint:"Hinges, pulls, and towel bar hardware" },
                    { key:"back",             label:"Back panel",             hint:"Back construction and splash board detail" },
                    { key:"underside",        label:"Underside",              hint:"Foot construction and secondary wood" },
                  ],
                  "chest of drawers": [
                    { key:"joinery_closeup",  label:"Drawer corner joinery",  hint:"Pull out a drawer fully — photograph the corner joint" },
                    { key:"underside",        label:"Case underside",         hint:"Saw marks on the bottom of the case" },
                    { key:"hardware_closeup", label:"Pull hardware",          hint:"Bail pulls, knobs, or escutcheons — style and originality" },
                    { key:"back",             label:"Back panel",             hint:"Back boards reveal manufacturing method and era" },
                  ],
                  "dresser": [
                    { key:"joinery_closeup",  label:"Drawer corner joinery",  hint:"Pull out a drawer — photograph the corner joint" },
                    { key:"hardware_closeup", label:"Pull hardware",          hint:"Original hardware is among the strongest dating clues" },
                    { key:"overall_side",     label:"Mirror attachment",      hint:"How the mirror attaches to the case — hardware and bracket type" },
                    { key:"back",             label:"Back panel",             hint:"Back construction reveals manufacturing era" },
                  ],
                  "pump organ cabinet (converted)": [
                    { key:"overall_side",     label:"Pedal cavity",           hint:"Show the lower section — is the pedal cavity still visible?" },
                    { key:"overall_front",    label:"Keyboard area",          hint:"Show where the keyboard or mechanism was removed" },
                    { key:"hardware_closeup", label:"Gothic hinge hardware",  hint:"Victorian strap hinges if present — strong dating clue" },
                    { key:"back",             label:"Back panel",             hint:"Back construction and internal structure" },
                  ],
                  "table": [
                    { key:"overall_side",     label:"Gate leg or leaf support", hint:"Side view showing the gate swing leg or bracket in open or closed position" },
                    { key:"underside",        label:"Underside / apron",        hint:"Apron construction, hinge mounting, saw marks for dating" },
                    { key:"hardware_closeup", label:"Leaf hinge close-up",      hint:"Hinge type at leaf joint — helps date the piece" },
                    { key:"joinery_closeup",  label:"Leg and apron joinery",    hint:"How the leg meets the apron — mortise and tenon or other joint" },
                  ],
                  "drop-leaf table": [
                    { key:"overall_side",     label:"Leaf support mechanism",   hint:"Show how the leaf is supported — gate, swing leg, or bracket" },
                    { key:"hardware_closeup", label:"Leaf hinge close-up",      hint:"Hinge type at leaf join — butterfly, rule joint, or butt hinge" },
                    { key:"underside",        label:"Underside",                hint:"Apron construction and nail types for dating" },
                    { key:"joinery_closeup",  label:"Leg or apron joinery",     hint:"How the leg joins the apron" },
                  ],
                };

                // ── Slot resolver — taxonomy-aware: specific form → subfamily → form family ──
                const formKey    = quickResult.broad_form_key || "cabinet";
                const specificKey = likelyId.toLowerCase().trim();
                const subfamilyKey = subfamily.toLowerCase().trim();
                const familyKey    = formFamily.toLowerCase().trim();
                const specificSlots = (specificKey && SPECIFIC_FORM_SLOTS[specificKey])
                                   || (subfamilyKey && SPECIFIC_FORM_SLOTS[subfamilyKey])
                                   || (familyKey && SPECIFIC_FORM_SLOTS[familyKey]);
                const allSlots = specificSlots || FORM_FOLLOWUP_SLOTS[formKey] || FORM_FOLLOWUP_SLOTS.cabinet;
                const missingSlots = allSlots.filter(s => !images[s.key]).slice(0, 6 - totalQuickPhotos);

                // Form-aware date hint — specific form first, then broad family
                const specificDateHints = {
                  "gateleg drop-leaf table": "add a gate leg or leaf hinge photo",
                  "pembroke table":           "add a swing leg or leaf joint photo",
                  "drop-leaf table":          "add a leaf support or underside photo",
                  "table":                   "add a hidden structure photo (underside or back panel) or leaf support photo",
                  "drop-leaf table family":  "add a leaf support or gate leg photo",
                  "blanket chest":            "add an interior or bottom board photo",
                  "storage chest or trunk":   "add an interior or hardware photo",
                  "slant-front desk":         "add an interior or drawer joinery photo",
                  "rolltop desk":             "add an interior or pedestal drawer photo",
                  "secretary desk":           "add an interior compartment or lock photo",
                  "tilt-top table":           "add a tilt mechanism or top underside photo",
                  "washstand":                "add a basin area or hardware photo",
                  "chest of drawers":         "add a drawer joinery or hardware photo",
                  "dresser":                  "add a drawer joinery or hardware photo",
                };
                const broadDateHints = {
                  chest:      "add an interior, bottom board, or lock/hinge photo",
                  table:      "add a gate leg, leaf support, or hidden structure photo (underside or back panel)",
                  cabinet:    "add an interior, back panel, or hinge photo",
                  dresser:    "add a drawer joinery or hardware photo",
                  wardrobe:   "add an interior or hinge photo",
                  desk:       "add a drawer joinery or interior compartment photo",
                  seating:    "add a hidden structure photo (underside or back panel) or leg joinery photo",
                  stand:      "add a hidden structure photo (underside or back panel) or leg attachment photo",
                  shelf:      "add a back panel or shelf bracket photo",
                  specialized:"add a side profile or interior photo",
                };
                const dateHintSuffix = specificDateHints[specificKey] || specificDateHints[subfamilyKey] || broadDateHints[formKey] || broadDateHints[familyKey] || "add a hardware or hidden structure photo (underside or back panel)";

                return (
                  <div style={S.progressiveCaptureBlock}>
                    {/* Scanning overlay for rerun */}
                    {/* scanning state handled by quick_scanning step */}

                    {/* Broad-category notice — form-aware */}
                    {(quickResult.is_broad_category || quickResult.is_degraded_fallback) && !analyzing && (
                      <div style={{
                        background:"#fdfaf2", border:"1px solid #e8ddb8", borderRadius:4,
                        padding:"12px 16px", marginBottom:12, fontSize:13, color:"#7a6010",
                        fontFamily:"sans-serif", display:"flex", alignItems:"flex-start", gap:10,
                      }}>
                        <span style={{fontSize:15, flexShrink:0}}>◆</span>
                        <span>
                          <strong>Broad category result.</strong>{" "}
                          To narrow the identification, {dateHintSuffix}.
                        </span>
                      </div>
                    )}

                    {/* Suggestion panel — form-aware follow-up prompts */}
                    {showImprovePanel && missingSlots.length > 0 && !analyzing && (
                      <div style={S.progressiveSuggestion}>
                        <div style={S.progressiveSuggestionTitle}>Improve this result with one more photo:</div>
                        <div style={S.progressiveSuggestionList}>
                          {missingSlots.map(slot => (
                            <div key={slot.key} style={S.progressiveSuggestionItem}>
                              <div>
                                <div style={S.progressiveSuggestionLabel}>• {slot.label}</div>
                                <div style={S.progressiveSuggestionHint}>{slot.hint}</div>
                              </div>
                              <div style={S.progressiveAddBtns}>
                                <input type="file" accept="image/*" capture="environment" style={{display:"none"}}
                                  ref={el => (quickAddRefs.current[`${slot.key}_cam`] = el)}
                                  onChange={e => handleQuickAddPhoto(slot.key, e.target.files[0])} />
                                <input type="file" accept="image/*" style={{display:"none"}}
                                  ref={el => (quickAddRefs.current[`${slot.key}_lib`] = el)}
                                  onChange={e => handleQuickAddPhoto(slot.key, e.target.files[0])} />
                                <button style={S.progressiveMiniBtn} onClick={() => quickAddRefs.current[`${slot.key}_cam`].click()}>📷</button>
                                <button style={S.progressiveMiniBtn} onClick={() => quickAddRefs.current[`${slot.key}_lib`].click()}>🖼</button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={S.progressivePhotoCount}>{totalQuickPhotos} photo{totalQuickPhotos!==1?"s":""} · Adding a photo reruns the scan automatically</div>
                      </div>
                    )}

                    {/* General add-another button when confidence is good or slots remain */}
                    {!showImprovePanel && totalQuickPhotos < 6 && !analyzing && (
                      <div style={S.progressiveAddBlock}>
                        <div style={S.progressiveAddTitle}>+ Add another photo</div>
                        <div style={S.progressiveAddHint}>Adding a photo will rerun the scan automatically. {6 - totalQuickPhotos} photo{6-totalQuickPhotos!==1?"s":""} remaining.</div>
                        {(() => {
                          const nextSlot = allSlots.find(s => !images[s.key]);
                          if (!nextSlot) return null;
                          return (
                            <div style={S.quickUploadRow}>
                              <input type="file" accept="image/*" capture="environment" style={{display:"none"}}
                                ref={el => (quickAddRefs.current[`add_cam`] = el)}
                                onChange={e => handleQuickAddPhoto(nextSlot.key, e.target.files[0])} />
                              <input type="file" accept="image/*" style={{display:"none"}}
                                ref={el => (quickAddRefs.current[`add_lib`] = el)}
                                onChange={e => handleQuickAddPhoto(nextSlot.key, e.target.files[0])} />
                              <button style={S.quickUploadBtn} onClick={() => quickAddRefs.current[`add_cam`].click()}>📷 Take Photo</button>
                              <button style={S.quickUploadBtn} onClick={() => quickAddRefs.current[`add_lib`].click()}>🖼 Choose from Library</button>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── Upgrade path ── */}
              <div style={S.upgradeBlock}>
                <div style={S.upgradeTitle}>Want a deeper analysis?</div>
                <div style={S.upgradeDesc}>Run the full 9-phase engine with construction analysis, conflict detection, and valuation across 5 market lanes.</div>
                <div style={S.upgradeHints}>
                  {(({
                    "gateleg drop-leaf table": ["gate leg photo","leaf joint photo","underside rail"],
                    "pembroke table":           ["swing leg photo","leaf joint photo","underside"],
                    "drop-leaf table":          ["leaf support photo","underside rail","hardware close-up"],
                    "blanket chest":            ["interior/lid photo","bottom board photo","corner joinery"],
                    "slant-front desk":         ["interior compartments","drawer joinery","hardware close-up"],
                    "rolltop desk":             ["interior photo","pedestal drawer joinery","hardware close-up"],
                    "secretary desk":           ["interior compartments","drawer joinery","lock close-up"],
                    "tilt-top table":           ["tilt mechanism photo","top underside","column detail"],
                    "washstand":                ["basin area photo","hardware close-up","back panel"],
                    "chest of drawers":         ["drawer joinery photo","hardware close-up","back panel"],
                  })[likelyId.toLowerCase().trim()]
                  || ({
                    chest:      ["interior photo","bottom board photo","corner joinery"],
                    table:      ["underside or back panel","leg attachment photo","hardware close-up"],
                    cabinet:    ["interior photo","back panel photo","hardware close-up"],
                    dresser:    ["drawer joinery photo","hardware close-up","back panel"],
                    wardrobe:   ["interior photo","hinge close-up","back panel"],
                    desk:       ["drawer joinery","interior compartments","hardware close-up"],
                    seating:    ["underside or back panel","leg joinery","back detail"],
                    stand:      ["underside or back panel","leg attachment","hardware if present"],
                    shelf:      ["back panel photo","bracket joinery","hardware close-up"],
                    specialized:["side profile photo","interior photo","hardware close-up"],
                  })[quickResult.broad_form_key] || ["underside or back panel","joinery close-up","hardware close-up"])
                    .map(h => <span key={h} style={S.upgradeHint}>+ {h}</span>)}
                </div>
                <button style={S.upgradeBtn} onClick={handleUpgradeToFull}>Run Full Evaluation →</button>
              </div>

              <button style={S.quickNewScanBtn} onClick={reset}>← New Scan</button>

              {/* ── Debug panel ── */}
              {(() => {
                const _dbg  = caseStore[caseId];
                const _qr   = (_dbg && _dbg.quick_result)    || quickResult || {};
                const _so   = (_dbg && _dbg.stage_outputs)   || {};
                const _dig  = _so["0_evidence_digest"]        || {};
                const _mkeys = Object.keys(_dig.mechanisms_detected || {}).filter(function(k){ return _dig.mechanisms_detected[k] && _dig.mechanisms_detected[k].present; });
                const _rawResp = (_dig && _dig._raw_response) || (caseStore[caseId] && caseStore[caseId]._stage0_raw) || "";
                return (
                  <details style={{marginTop:16, fontSize:11, fontFamily:"monospace", color:"#888", background:"#f5f0e8", borderRadius:4, padding:"10px 14px"}}>
                    <summary style={{cursor:"pointer", fontWeight:600, color:"#8b6914"}}>▶ Field Scan Debug</summary>
                    <div style={{marginTop:8, display:"flex", flexDirection:"column", gap:4}}>
                      <div><strong>engine_mode:</strong> {RUNTIME_MODE.engine_mode}</div>
                      <div><strong>live_llm_enabled:</strong> {String(RUNTIME_MODE.live_llm_enabled)}</div>
                      <div><strong>anthropic_key_present:</strong> {String(RUNTIME_MODE.anthropic_key_present)}</div>
                      <div><strong>fetch_blocked:</strong> {String(RUNTIME_MODE.fetch_blocked)}</div>
                      <div><strong>simulation_reason:</strong> {RUNTIME_MODE.simulation_reason}</div>
                      <div><strong>backend_endpoint_available:</strong> {String(RUNTIME_MODE.backend_endpoint_available)}</div>
                      <div><strong>api_version_header:</strong> {RUNTIME_MODE.api_version_header}</div>
                      <div style={{borderTop:"1px solid #d4c9b4", marginTop:4, paddingTop:4}}></div>
                      <div><strong>fs_step:</strong> {step}{analyzing ? " (scanning)" : ""}</div>
                      <div><strong>result_stale:</strong> {step === "quick_scanning" ? "yes — scan in progress" : "no — result is current"}</div>
                      <div style={{borderTop:"1px solid #d4c9b4", marginTop:4, paddingTop:4, fontWeight:600, color:"#8b6914"}}>Adapter</div>
                      <div><strong>adapter_mode:</strong> {_dig._adapter_mode || EVIDENCE_ADAPTER_MODE || "—"} {_dig._adapter_mode === "mock" ? "⚠ using mock data" : ""}</div>
                      <div style={{borderTop:"1px solid #d4c9b4", marginTop:4, paddingTop:4, fontWeight:600, color:"#8b6914"}}>Control flow</div>
                      {(function(){
                        var cf = (_dig._diag) || {};
                        var markers = ["cf_request_payload_built","cf_fetch_started","cf_fetch_resolved",
                          "cf_response_text_read","cf_json_parse_started","cf_json_parse_finished","cf_stage0_returned"];
                        return markers.map(function(m){
                          var hit = !!cf[m];
                          return <div key={m} style={{color: hit ? "#3a6b38" : "#c0392b"}}>
                            {hit ? "✓" : "✗"} {m.replace("cf_","")}
                          </div>;
                        });
                      })()}
                      {_dig._cf_catch_message && <div style={{color:"#c0392b"}}><strong>caught:</strong> {_dig._cf_catch_message}</div>}
                      <div style={{borderTop:"1px solid #d4c9b4", marginTop:4, paddingTop:4, fontWeight:600, color:"#8b6914"}}>Network diagnostics</div>
                      <div><strong>model_name:</strong> {(_dig._diag && _dig._diag.model_name) || "claude-sonnet-4-6"}</div>
                      <div><strong>endpoint:</strong> {(_dig._diag && _dig._diag.endpoint) || "/api/analyze"}</div>
                      <div><strong>http_status:</strong> {(_dig._diag && _dig._diag.http_status != null) ? String(_dig._diag.http_status) : "—"}</div>
                      <div><strong>fetch_ok:</strong> {(_dig._diag && _dig._diag.fetch_ok != null) ? String(_dig._diag.fetch_ok) : "—"}</div>
                      <div><strong>response_content_type:</strong> {(_dig._diag && _dig._diag.response_content_type) || "—"}</div>
                      <div><strong>has_data_content:</strong> {(_dig._diag && _dig._diag.has_data_content != null) ? String(_dig._diag.has_data_content) : "—"}</div>
                      <div><strong>has_data_error:</strong> {(_dig._diag && _dig._diag.has_data_error != null) ? String(_dig._diag.has_data_error) : "—"}</div>
                      <div><strong>parsed_top_level_keys:</strong> {(_dig._diag && _dig._diag.parsed_top_level_keys) || "—"}</div>
                      <div><strong>caught_exception:</strong> {(_dig._diag && _dig._diag.caught_exception) || "none"}</div>
                      <div><strong>response_text_preview:</strong></div>
                      <div style={{paddingLeft:12, fontFamily:"monospace", fontSize:10, wordBreak:"break-all", color:"#555"}}>
                        {(_dig._diag && _dig._diag.response_text_preview) || "(none)"}
                      </div>
                      <div style={{borderTop:"1px solid #d4c9b4", marginTop:4, paddingTop:4, fontWeight:600, color:"#8b6914"}}>Evidence pipeline</div>
                      <div><strong>stage0_error:</strong> {_dig._error_type || "none"}</div>
                      <div><strong>raw_response_len:</strong> {(_dig._raw_response_len || 0)} chars{(_dig._raw_response_len || 0) === 0 ? " (none)" : ""}</div>
                      <div><strong>image_count_sent:</strong> {Object.keys(images).length}</div>
                      <div><strong>digest_item_count:</strong> {(_dig.evidence_digest || []).length}</div>
                      <div style={{borderTop:"1px solid #d4c9b4", marginTop:4, paddingTop:4, fontWeight:600, color:"#8b6914"}}>Recognition</div>
                      <div><strong>form_family_candidate:</strong> {_qr.form_family || "—"}</div>
                      <div><strong>subfamily_candidate:</strong> {_qr.subfamily || "—"}</div>
                      <div><strong>result_state:</strong> {_qr.is_degraded_fallback ? "degraded_fallback" : _qr.is_broad_category ? "broad_category" : "identified"}</div>
                      <div><strong>recognition_method:</strong> {_qr.recognition_method || "—"}</div>
                      <div><strong>mechanisms_detected:</strong> {JSON.stringify(_mkeys)}</div>
                      <div><strong>evidence_digest ({(_dig.evidence_digest || []).length} items):</strong></div>
                      {(_dig.evidence_digest || []).map(function(d, i){ return <div key={i} style={{paddingLeft:12}}>• {d}</div>; })}
                      {(_dig.evidence_digest || []).length === 0 && <div style={{paddingLeft:12, color:"#aaa"}}>(none)</div>}
                    </div>
                  </details>
                );
              })()}
            </div>
          );
        })()}

        {/* ── ANALYSIS PROGRESS SCREEN ── */}
        {step === "quick_scanning" && (
          <div style={S.analysisScreen}>
            <div style={S.analysisScreenInner}>
              <RuntimeModeBadge />

              {/* Header */}
              <div style={S.analysisHeader}>
                <div style={S.analysisLogo}>{mode === "field_scan" ? "⚡" : "◈"}</div>
                <h2 style={S.analysisTitle}>
                  {mode === "field_scan" ? "Field Scan in Progress" : "Analyzing Your Piece"}
                </h2>
                <p style={S.analysisSubtitle}>
                  {mode === "field_scan"
                    ? `Scanning ${Object.keys(images).length} photo${Object.keys(images).length !== 1 ? "s" : ""} — building evidence digest`
                    : `Running ${PHASES.length} reasoning phases against the evidence database`}
                </p>
              </div>

              {/* Phase tracker — Field Scan uses its own 4-stage list */}
              {mode === "field_scan" ? (
                <div style={S.analysisPhasesWrap}>
                  {[
                    { key:"0_evidence_digest",  label:"Photo Evidence Digest",  short:"01", note:"Scanning all photos — building combined evidence list" },
                    { key:"1_form_recognition", label:"Form Recognition",        short:"02", note:"Detecting structural mechanisms and form signatures" },
                    { key:"2_date_estimation",  label:"Date Estimation",         short:"03", note:"Dating from fasteners, toolmarks, and hardware" },
                    { key:"3_market_guidance",  label:"Market Guidance",         short:"04", note:"Estimating value and buy signal" },
                  ].map((ph, i) => {
                    const done   = phasesDone[i];
                    const active = currentPhase === i && !done;
                    return (
                      <div key={ph.key} style={{ ...S.analysisPhaseRow, ...(active ? S.analysisPhaseRowActive : {}) }}>
                        <div style={S.analysisPhaseLeft}>
                          {done ? (
                            <div style={{ ...S.analysisPhaseCircle, ...S.analysisPhaseCircleDone }}>✓</div>
                          ) : active ? (
                            <div style={{ ...S.analysisPhaseCircle, ...S.analysisPhaseCircleActive }}>
                              <span style={S.spinner}>◌</span>
                            </div>
                          ) : (
                            <div style={S.analysisPhaseCircle}>
                              <span style={S.analysisPhaseNum}>{ph.short}</span>
                            </div>
                          )}
                          {i < 3 && <div style={{ ...S.analysisConnector, ...(done ? S.analysisConnectorDone : {}) }} />}
                        </div>
                        <div style={S.analysisPhaseRight}>
                          <div style={{ ...S.analysisPhaseName, ...(done ? S.analysisPhaseDone : active ? S.analysisPhaseActive : S.analysisPhasePending) }}>
                            {ph.label}
                          </div>
                          <div style={S.analysisPhaseDesc}>{ph.note}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
              <div style={S.analysisPhasesWrap}>
                {PHASES.map((ph, i) => {
                  const phaseIndex = i; // 0-indexed matches onPhase callback
                  const done   = phasesDone[phaseIndex];
                  const active = currentPhase === phaseIndex && !done;
                  return (
                    <div key={ph.key} style={{ ...S.analysisPhaseRow, ...(active ? S.analysisPhaseRowActive : {}) }}>
                      {/* Left: status indicator */}
                      <div style={S.analysisPhaseLeft}>
                        {done ? (
                          <div style={{ ...S.analysisPhaseCircle, ...S.analysisPhaseCircleDone }}>✓</div>
                        ) : active ? (
                          <div style={{ ...S.analysisPhaseCircle, ...S.analysisPhaseCircleActive }}>
                            <span style={S.spinner}>◌</span>
                          </div>
                        ) : (
                          <div style={S.analysisPhaseCircle}>
                            <span style={S.analysisPhaseNum}>{ph.short}</span>
                          </div>
                        )}
                        {i < PHASES.length - 1 && (
                          <div style={{ ...S.analysisConnector, ...(done ? S.analysisConnectorDone : {}) }} />
                        )}
                      </div>
                      {/* Right: label + description */}
                      <div style={S.analysisPhaseRight}>
                        <div style={{
                          ...S.analysisPhaseName,
                          ...(done ? S.analysisPhaseDone : active ? S.analysisPhaseActive : S.analysisPhasePending),
                        }}>
                          {ph.label}
                        </div>
                        <div style={S.analysisPhaseDesc}>{ph.note}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}

              <p style={S.analysisFootnote}>
                {mode === "field_scan" ? "Scanning photos — usually under 20 seconds." : "This may take up to a minute. Do not close this screen."}
              </p>
            </div>
          </div>
        )}

        {/* ── REPORT ── */}
        {step === "report" && report.final_report && (() => {
          const fr = report.final_report;
          const sc = report.scores;
          return (
            <div style={S.reportWrap}>
              {/* Report header */}
              <div style={S.reportHeader}>
                {/* Engine status banner — shown when phase(s) used synthesized fallbacks */}
                {(() => {
                  const so = report.stage_outputs || {};
                  const isMock = typeof FULL_ANALYSIS_MODE !== "undefined" && FULL_ANALYSIS_MODE === "mock";
                  const hasSynthesized = Object.values(so).some(function(p){ return p && p._synthesized; });
                  if (!isMock && !hasSynthesized) return null;
                  return (
                    <div style={{
                      background:"#fdf6ec", border:"1px solid #e8c87a", borderRadius:4,
                      padding:"10px 14px", marginBottom:14, fontSize:12.5,
                      fontFamily:"sans-serif", color:"#7a5010",
                      display:"flex", alignItems:"flex-start", gap:10,
                    }}>
                      <span style={{fontSize:15, flexShrink:0}}>⚠</span>
                      <div>
                        <strong>{isMock ? "Mock mode active" : "Analysis engine unavailable"}</strong>
                        <div style={{marginTop:3, color:"#9a6820"}}>
                          {isMock
                            ? "Full Analysis is running in mock mode. Set FULL_ANALYSIS_MODE=\"live\" to enable real calls."
                            : "LIVE ENGINE ENABLED — Backend connection active. One or more phases returned empty responses. Check DevTools console for api_http_status and raw_llm_response_length per phase."}
                        </div>
                      </div>
                    </div>
                  );
                })()}
                <RuntimeModeBadge />
                <div style={S.sectionLabel}>Case #{caseId.split("-")[1]} · Final Report</div>
                <h1 style={S.reportTitle}>{fr.identified_object_name}</h1>
                <div style={S.metaRow}>
                  <span style={S.metaBadge}>{fr.date_range_text}</span>
                  <span style={{...S.metaBadge,...S.metaBadgeDark}}>Confidence: {fr.confidence_text}</span>
                  {fr.style_family && <span style={S.metaBadge}>{fr.style_family}</span>}
                  {fr.object_classification && fr.object_classification !== "unknown" && (
                    <span style={{...S.metaBadge,...S.metaBadgeClass}}>{fr.object_classification}</span>
                  )}
                  {fr.valuation_provisional && <span style={{...S.metaBadge,...S.metaBadgeWarn}}>⚠ Provisional</span>}
                </div>

                {/* Expert-voice guidance for missing evidence — shown at top of report */}
                <GuidanceMessages
                  missing={report.missing_evidence}
                  totalPhotos={2}
                  style={{ marginTop: 16 }}
                />
              </div>

              {/* Tabs */}
              <div style={S.tabBar}>
                {["summary","visual","evidence","stages","valuation"].map(t => (
                  <button key={t} style={{...S.tabBtn,...(activeTab===t?S.tabActive:{})}} onClick={()=>setActiveTab(t)}>
                    {t === "visual" ? "Visual Scan" : t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>

              {/* ── Summary Tab ── */}
              {activeTab === "summary" && (() => {
                // ── Helpers ────────────────────────────────────────
                // Convert a support/opposing pair into a strength label
                const strengthLabel = (sup, opp) => {
                  if (!sup && !opp) return null;
                  const pct = opp > 0 ? (sup / (sup + opp)) * 100 : sup > 0 ? 90 : 0;
                  if (pct >= 80) return "Strong";
                  if (pct >= 60) return "Moderate";
                  if (pct >= 35) return "Limited";
                  return "Weak";
                };
                const strengthStyle = (label) => {
                  if (label === "Strong")   return { color:"#3a6b38", background:"#edf5ec", borderColor:"#a8cca6" };
                  if (label === "Moderate") return { color:"#7a6010", background:"#fdf8ec", borderColor:"#d8c870" };
                  if (label === "Limited")  return { color:"#7a4820", background:"#fdf2ec", borderColor:"#d8a870" };
                  return                          { color:"#888",     background:"#f5f5f5",  borderColor:"#ccc"    };
                };

                // Derive evidence-strength rows from scorecard
                const evidenceStrengths = sc ? [
                  { label:"Dating evidence",       sup: sc.age_support_points,          opp: sc.age_opposing_points         },
                  { label:"Construction evidence", sup: sc.originality_support_points,  opp: sc.originality_opposing_points },
                  { label:"Form evidence",         sup: sc.form_support_points,         opp: sc.form_opposing_points        },
                  { label:"Hardware evidence",     sup: sc.conversion_support_points,   opp: sc.conversion_opposing_points  },
                ].filter(r => r.sup || r.opp) : [];

                // Derive "what would improve confidence" from missing_evidence
                const improvements = [];
                const me = report.missing_evidence || {};
                if (me.underside_photo || me.back_photo)
                  improvements.push("Underside or back panel photos would strengthen the dating assessment — saw marks and fasteners are the most reliable dating clues.");
                if (me.joinery_photo)
                  improvements.push("A close-up of drawer joints or internal framing would help confirm the construction period.");
                if (me.hardware_photo)
                  improvements.push("Hardware close-ups would help assess whether fittings are original to the piece.");
                if (me.label_photo)
                  improvements.push("A photo of any labels, stamps, or maker's marks could help identify the manufacturer or narrow the date.");
                if (faNarr && faNarr.limits) improvements.push(faNarr.limits);

                // Derive a short one-sentence primary reasoning from reconciliation
                const p7data = (report.stage_outputs && report.stage_outputs["7_reconciliation"]) || null;
                const primaryReason = (p7data && p7data.reconciliation_notes)
                  ? p7data.reconciliation_notes.split(/\.\s/)[0].replace(/\.$/, "") + "."
                  : fr.summary_text
                    ? fr.summary_text.split(/\.\s/)[0].replace(/\.$/, "") + "."
                    : null;

                // Language-system narrative
                const p0soNarr  = report.stage_outputs && report.stage_outputs["0_visual_scan"];
                const faWc      = computeClueWeights(p0soNarr ? p0soNarr.observations_by_type : {});
                const faRes     = resolveConflicts(faWc);
                const faNarr    = buildNarrative(
                  faWc, faRes,
                  fr.identified_object_name,
                  (sc && sc.confidence_band) || "Low",
                  Object.keys(report.missing_evidence || {}),
                  "full_analysis"
                );

                // Collect detected clues from visual scan observations
                const observations = report.observations || [];
                const detectedClues = observations
                  .filter(o => (o.effective_confidence || 0) >= 0.45)
                  .sort((a, b) => (b.effective_confidence || 0) - (a.effective_confidence || 0))
                  .slice(0, 10)
                  .map(o => ({
                    label: o.reference_id.replace(/_/g, " ") || o.observed_value_text,
                    type:  o.observation_type,
                    conf:  o.effective_confidence,
                    low:   (o.effective_confidence || 0) < 0.65,
                  }));

                // Also pull key_dating_evidence from phase 2 as a fallback
                const p2data = (report.stage_outputs && report.stage_outputs["2_dating"]) || null;
                const keyDatingClues = (p2data && p2data.key_dating_evidence) || [];

                // Conflicting signals — from conflict engine + reconciliation
                const conflictSignals = [
                  ...(fr.conflicts_detected || []).map(c => c.likely_explanation),
                  ...(fr.alterations || []),
                ].filter(Boolean).slice(0, 5);

                return (
                  <div style={S.tabContent}>

                    {/* ══ 1. IDENTIFICATION SUMMARY ══════════════════ */}
                    <div style={S.appraisalCard}>
                      <div style={S.appraisalEyebrow}>Identification Summary</div>

                      <div style={S.appraisalIdRow}>
                        <div style={S.appraisalIdMain}>
                          <div style={S.appraisalIdLabel}>Likely Identification</div>
                          <div style={S.appraisalIdValue}>{fr.identified_object_name}</div>
                        </div>
                        {fr.object_classification && fr.object_classification !== "unknown" && (
                          <div style={S.appraisalClassChip}>{fr.object_classification}</div>
                        )}
                      </div>

                      <div style={S.appraisalMetaRow}>
                        <div style={S.appraisalMeta}>
                          <div style={S.appraisalMetaLabel}>Estimated Date</div>
                          <div style={S.appraisalMetaValue}>{fr.date_range_text}</div>
                        </div>
                        {fr.style_family && (
                          <div style={S.appraisalMeta}>
                            <div style={S.appraisalMetaLabel}>Style</div>
                            <div style={S.appraisalMetaValue}>{fr.style_family}</div>
                          </div>
                        )}
                       
                        <div style={S.appraisalMeta}>
                          <div style={S.appraisalMetaLabel}>Confidence</div>
                          <div style={{
                            ...S.appraisalMetaValue,
                            ...S.appraisalConfValue,
                            ...confidenceBandStyle((sc && sc.confidence_band) || ""),
                          }}>
                            {fr.confidence_text}
                          </div>
                        </div>
                      </div>

                      {primaryReason && (
                        <div style={S.appraisalReason}>
                          {primaryReason}
                        </div>
                      )}
                      {faNarr && faNarr.observations && (
                        <div style={{
                          fontSize:13, color:"#4a3728", fontFamily:"'Georgia',serif",
                          lineHeight:1.75, marginTop:10, padding:"10px 14px",
                          background:"#faf6ef", borderRadius:4, border:"1px solid #e8ddb8",
                        }}>
                          {[faNarr.observations, faNarr.interpretation].filter(Boolean).join(" ")}
                        </div>
                      )}
                    </div>

                    {/* ══ 2. EVIDENCE DETECTED ═══════════════════════ */}
                    {(detectedClues.length > 0 || keyDatingClues.length > 0) && (
                      <div style={S.appraisalSection}>
                        <div style={S.appraisalSectionTitle}>Evidence Detected</div>
                        <div style={S.clueCloud}>
                          {/* Visual scan clues */}
                          {detectedClues.map((clue, i) => (
                            <div key={i} style={{
                              ...S.clueChip,
                              ...(clue.low ? S.clueChipLow : S.clueChipNormal),
                            }}>
                              {clue.label}
                              {clue.low && <span style={S.clueChipLowMark}> *</span>}
                            </div>
                          ))}
                          {/* Key dating clues from phase 2 (de-duped) */}
                          {keyDatingClues
                            .filter(k => !detectedClues.some(c => c.label === k))
                            .map((k, i) => (
                              <div key={`kd-${i}`} style={{...S.clueChip,...S.clueChipNormal}}>{k}</div>
                          ))}
                        </div>
                        {detectedClues.some(c => c.low) && (
                          <div style={S.clueCloudNote}>* Low visual confidence — included at reduced weight</div>
                        )}
                      </div>
                    )}

                    {/* Fallback: supporting evidence bullets if no visual obs */}
                    {detectedClues.length === 0 && keyDatingClues.length === 0 && fr.supporting_evidence.length > 0 && (
                      <div style={S.appraisalSection}>
                        <div style={S.appraisalSectionTitle}>Evidence Detected</div>
                        <div style={S.clueCloud}>
                          {fr.supporting_evidence.map((e, i) => (
                            <div key={i} style={{...S.clueChip,...S.clueChipNormal}}>{e}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ══ 3. EVIDENCE STRENGTH ═══════════════════════ */}
                    {evidenceStrengths.length > 0 && (
                      <div style={S.appraisalSection}>
                        <div style={S.appraisalSectionTitle}>Evidence Strength</div>
                        <div style={S.strengthGrid}>
                          {evidenceStrengths.map(row => {
                            const label = strengthLabel(row.sup, row.opp);
                            if (!label) return null;
                            const sStyle = strengthStyle(label);
                            return (
                              <div key={row.label} style={S.strengthRow}>
                                <span style={S.strengthRowLabel}>{row.label}</span>
                                <span style={{ ...S.strengthBadge, ...sStyle }}>{label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}


                    {/* ══ CONFIDENCE DRIVERS ══════════════════════════ */}
                    {(fr.supporting_evidence && fr.supporting_evidence.length > 0) && (() => {
                      const limited = [];
                      if (report.missing_evidence) {
                        if (report.missing_evidence.underside) limited.push("Underside construction not examined");
                        if (report.missing_evidence.joinery)   limited.push("Joinery details not photographed");
                        if (report.missing_evidence.hardware)  limited.push("Hardware not examined in detail");
                      }
                      return (
                        <div style={{
                          ...S.appraisalSection,
                          background:"#f9f5ed", border:"1px solid #d4c9b4", borderRadius:4,
                          padding:"14px 16px",
                        }}>
                          <div style={{...S.appraisalSectionTitle, marginBottom:10}}>Confidence Drivers</div>
                          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
                            <div>
                              <div style={{fontSize:11,fontFamily:"sans-serif",color:"#4a8b48",fontWeight:600,marginBottom:6}}>Confidence Increased By</div>
                              {(function(){
                                var p0so = report.stage_outputs && report.stage_outputs["0_visual_scan"];
                                var wc   = computeClueWeights(p0so ? p0so.observations_by_type : {});
                                var drv  = deriveConfidenceDrivers(wc, 5);
                                var items = drv.increased.length ? drv.increased : fr.supporting_evidence.slice(0,4);
                                return items.map(function(s,i){
                                  return <div key={i} style={{fontSize:12,color:"#3a2010",fontFamily:"'Georgia',serif",marginBottom:4,paddingLeft:10,borderLeft:"2px solid #a8cca6"}}>{"• "+s}</div>;
                                });
                              })()}
                            </div>
                            <div>
                              <div style={{fontSize:11,fontFamily:"sans-serif",color:"#8b6020",fontWeight:600,marginBottom:6}}>Confidence Limited By</div>
                              {(function(){
                                var p0so = report.stage_outputs && report.stage_outputs["0_visual_scan"];
                                var wc   = computeClueWeights(p0so ? p0so.observations_by_type : {});
                                var drv  = deriveConfidenceDrivers(wc, 5);
                                // Also add restoration flag if detected
                                var res2 = resolveConflicts(wc);
                                var ri2  = res2.restoration_interpretation;
                                var restNote = ri2.likely_restoration_present ? ["Possible restoration may affect some evidence"] : [];
                                var items = drv.limited.concat(restNote);
                                if (!items.length) items = limited;
                                return items.length
                                  ? items.slice(0,5).map(function(s,i){ return <div key={i} style={{fontSize:12,color:"#3a2010",fontFamily:"'Georgia',serif",marginBottom:4,paddingLeft:10,borderLeft:"2px solid #d8c870"}}>{"• "+s}</div>; })
                                  : <div style={{fontSize:11,color:"#aaa",fontFamily:"sans-serif"}}>No significant limitations noted</div>;
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* ══ EVIDENCE WEIGHT ══════════════════════════════ */}
                    {(() => {
                      var p0so = report.stage_outputs && report.stage_outputs["0_visual_scan"];
                      var wc   = computeClueWeights(p0so ? p0so.observations_by_type : {});
                      var cats = deriveCategoryScores(wc);
                      // Fall back to scorecard if no weighted clues
                      if (!cats.length && sc) {
                        cats = [
                          {category:"construction", score: Math.round(((sc.form_support_points||0)/Math.max((sc.form_support_points||0)+(sc.form_opposing_points||0),1))*100)},
                          {category:"fasteners",    score: Math.round(((sc.age_support_points||0)/Math.max((sc.age_support_points||0)+(sc.age_opposing_points||0),1))*100)},
                        ].filter(function(c){ return c.score > 0; });
                      }
                      if (!cats.length) return null;
                      var catLabels = { construction:"Construction clues", joinery:"Joinery", toolmarks:"Toolmarks",
                        materials:"Material clues", hardware:"Hardware", fasteners:"Fasteners", finish:"Finish / surface",
                        alteration:"Alteration clues", other:"Other" };
                      return (
                        <div style={S.appraisalSection}>
                          <div style={{...S.appraisalSectionTitle, marginBottom:10}}>Evidence Weight</div>
                          <div style={{display:"flex",flexDirection:"column",gap:8}}>
                            {cats.slice(0,6).map(function(cat,i){
                              return (
                                <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                                  <div style={{width:140,fontSize:12,fontFamily:"sans-serif",color:"#5a3e1b",flexShrink:0}}>
                                    {catLabels[cat.category]||cat.category}
                                    <span style={{fontSize:10,color:"#aaa",marginLeft:4}}>×{cat.count}</span>
                                  </div>
                                  <div style={{flex:1,height:8,background:"#e8e0d4",borderRadius:4,overflow:"hidden"}}>
                                    <div style={{width:cat.score+"%",height:"100%",
                                      background:cat.score>=75?"#4a8b48":cat.score>=50?"#8b7014":"#8b3014",borderRadius:4}} />
                                  </div>
                                  <div style={{width:38,fontSize:11,color:"#888",fontFamily:"monospace",textAlign:"right"}}>{cat.score}%</div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{fontSize:10,color:"#aaa",fontFamily:"sans-serif",marginTop:6}}>
                            Avg adjusted weight per category · ×N = observation count
                          </div>
                        </div>
                      );
                    })()}

                    {/* ══ 4. CONFLICT INTERPRETATION ══════════════════ */}
                    {(() => {
                      var p0so = report.stage_outputs && report.stage_outputs["0_visual_scan"];
                      var wc   = computeClueWeights(p0so ? p0so.observations_by_type : {});
                      var res  = resolveConflicts(wc);
                      var ri   = res.restoration_interpretation;
                      var cnotes = res.conflict_notes;
                      // Also fold in Phase 6 conflict engine output
                      var engineConflicts = (fr.conflicts_detected || []).map(function(c){ return c.likely_explanation; }).filter(Boolean);
                      var allNotes = cnotes.concat(engineConflicts.filter(function(n){
                        return !cnotes.some(function(cn){ return cn.includes(n.slice(0,30)); });
                      })).slice(0, 6);
                      // Always show if Phase 6 has conflicts or client-side resolved conflicts
                      if (!allNotes.length && !ri.likely_restoration_present && !conflictSignals.length) return null;
                      return (
                        <div style={{...S.appraisalSection, background:"#fdf8f0", border:"1px solid #e8d0b0", borderRadius:4, padding:"14px 16px"}}>
                          <div style={{...S.appraisalSectionTitle, color:"#8b5014", marginBottom:10}}>Conflict Interpretation</div>

                          {/* Authority hierarchy note */}
                          {wc.length > 0 && (
                            <div style={{fontSize:11, color:"#7a5010", fontFamily:"sans-serif", marginBottom:10,
                              background:"#fdf0e0", borderRadius:3, padding:"6px 10px"}}>
                              Evidence authority applied: structural/joinery clues weighted above hardware and finish.
                            </div>
                          )}

                          {/* Restoration interpretation */}
                          {ri.likely_restoration_present && (
                            <div style={{
                              fontSize:13, color:"#5a3e1b", fontFamily:"'Georgia',serif",
                              fontStyle:"italic", marginBottom:10, lineHeight:1.65,
                              borderLeft:"3px solid #e8c090", paddingLeft:10,
                            }}>
                              {ri.confidence_reason}
                            </div>
                          )}
                          {ri.possible_restoration_types && ri.possible_restoration_types.length > 0 && (
                            <div style={{fontSize:11, color:"#888", fontFamily:"sans-serif", marginBottom:10}}>
                              Possible restoration: {ri.possible_restoration_types.join(" · ")}
                            </div>
                          )}

                          {/* Conflict notes */}
                          {allNotes.map(function(note, i){
                            return (
                              <div key={i} style={{
                                fontSize:12, color:"#4a3728", fontFamily:"'Georgia',serif",
                                lineHeight:1.65, marginBottom:7,
                                display:"flex", gap:8,
                              }}>
                                <span style={{color:"#c89050", flexShrink:0, marginTop:2}}>◆</span>
                                <span>{note}</span>
                              </div>
                            );
                          })}

                          {/* Confidence impact note */}
                          {res.confidence_adjustment < -0.05 && (
                            <div style={{fontSize:10, color:"#aaa", fontFamily:"sans-serif", marginTop:8, borderTop:"1px solid #f0e0c8", paddingTop:6}}>
                              Conflict resolution applied a modest confidence reduction ({Math.round(Math.abs(res.confidence_adjustment)*100)}%) to account for unresolved evidence inconsistencies.
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* ══ 5. WHAT WOULD IMPROVE CONFIDENCE ══════════ */}
                    {improvements.length > 0 && (
                      <div style={S.appraisalSection}>
                        <div style={S.appraisalSectionTitle}>What Would Improve Confidence</div>
                        <ul style={S.improvementList}>
                          {improvements.map((imp, i) => (
                            <li key={i} style={S.improvementItem}>
                              <span style={S.improvementIcon}>↑</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                );
              })()}

              {/* ── Visual Scan Tab ── */}
              {activeTab === "visual" && (() => {
                const p0data    = (report.stage_outputs && report.stage_outputs["0_visual_scan"]) || null;
                const p2data    = (report.stage_outputs && report.stage_outputs["2_dating"]) || null;
                const p3data    = (report.stage_outputs && report.stage_outputs["3_form"]) || null;
                const p4data    = (report.stage_outputs && report.stage_outputs["4_construction"]) || null;
                const p5data    = (report.stage_outputs && report.stage_outputs["5_hardware"]) || null;
                const observations = report.observations || [];

                // Group stored case_observations by type
                const byType = {};
                for (const obs of observations) {
                  const t = obs.observation_type || "other";
                  if (!byType[t]) byType[t] = [];
                  byType[t].push(obs);
                }
                const typeOrder = ["toolmark","fastener","joinery","construction","hardware","hidden_structure","finish"];
                const sortedTypes = [...typeOrder.filter(t => byType[t]), ...Object.keys(byType).filter(t => !typeOrder.includes(t))];

                // Collect targeted scan summaries from phase outputs
                const targetedSummaries = [
                  { phase:"Phase 2 — Dating",       key:"toolmarks+fasteners",  summary: (p2data && p2data.targeted_toolmark_summary) || p2data.targeted_summary },
                  { phase:"Phase 3 — Form",          key:"hidden_structure",     summary: (p3data && p3data.targeted_structure_summary) || p3data.targeted_summary },
                  { phase:"Phase 4 — Construction",  key:"joinery+construction", summary: (p4data && p4data.targeted_joinery_summary)  || p4data.targeted_summary },
                  { phase:"Phase 5 — Hardware",      key:"hardware+finish",      summary: (p5data && p5data.targeted_hardware_summary) || p5data.targeted_summary },
                ].filter(s => s.summary);

                return (
                  <div style={S.tabContent}>

                    {/* ── Two-pass architecture banner ── */}
                    <div style={S.vsArchBanner}>
                      <div style={S.vsArchStep}>
                        <div style={S.vsArchNum}>Pass 1</div>
                        <div style={S.vsArchLabel}>Full Scan</div>
                        <div style={S.vsArchNote}>All 6 categories · all images</div>
                      </div>
                      <div style={S.vsArchArrow}>→</div>
                      <div style={S.vsArchStep}>
                        <div style={S.vsArchNum}>Pass 2</div>
                        <div style={S.vsArchLabel}>Targeted Scans</div>
                        <div style={S.vsArchNote}>Per-phase · focused images only</div>
                      </div>
                      <div style={S.vsArchArrow}>→</div>
                      <div style={S.vsArchStep}>
                        <div style={S.vsArchNum}>Merge</div>
                        <div style={S.vsArchLabel}>Best Evidence</div>
                        <div style={S.vsArchNote}>Higher confidence wins · new clues added</div>
                      </div>
                    </div>

                    {/* Scanner summary stats */}
                    <div style={S.block}>
                      <div style={S.blockTitle}>Visual Evidence Scanner — Results</div>
                      <div style={S.vsSummaryRow}>
                        <div style={S.vsStatBox}>
                          <div style={S.vsStatNum}>{(p0data && p0data.total_observations) || observations.length}</div>
                          <div style={S.vsStatLabel}>Total Observations</div>
                        </div>
                        <div style={S.vsStatBox}>
                          <div style={S.vsStatNum}>{(p0data && p0data.images_scanned) || 0}</div>
                          <div style={S.vsStatLabel}>Images Scanned</div>
                        </div>
                        <div style={S.vsStatBox}>
                          <div style={S.vsStatNum}>{sortedTypes.length}</div>
                          <div style={S.vsStatLabel}>Evidence Types</div>
                        </div>
                        <div style={{...S.vsStatBox,...((p0data && p0data.hard_negatives_detected && p0data.hard_negatives_detected.length) ? S.vsStatBoxWarn : {})}}>
                          <div style={S.vsStatNum}>{(p0data && p0data.hard_negatives_detected && p0data.hard_negatives_detected.length) || 0}</div>
                          <div style={S.vsStatLabel}>Hard Negatives</div>
                        </div>
                      </div>
                      <div style={S.vsNonDestructive}>
                        ✓ Non-destructive · append-only · observations locked once reviewed
                      </div>
                    </div>

                    {/* Hard negatives callout */}
                    {(p0data && p0data.hard_negatives_detected && p0data.hard_negatives_detected.length > 0) && (
                      <div style={{...S.block, borderColor:C.rust}}>
                        <div style={{...S.blockTitle, color:C.rust}}>⚠ Hard Negatives Detected</div>
                        {(p0data && p0data.hard_negatives_detected || []).map((hn,i) => (
                          <div key={i} style={S.hardNegRow}>
                            <span style={S.hardNegClue}>{hn.clue_key}</span>
                            <span style={S.hardNegConf}>eff. {(hn.effective_confidence != null ? hn.effective_confidence : 0).toFixed(2)}</span>
                            {hn.region_label && <span style={S.hardNegRegion}>{hn.region_label}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Targeted scan summaries */}
                    {targetedSummaries.length > 0 && (
                      <div style={S.block}>
                        <div style={S.blockTitle}>Targeted Scan Findings</div>
                        {targetedSummaries.map((ts,i) => (
                          <div key={i} style={S.targetedRow}>
                            <div style={S.targetedPhase}>{ts.phase}</div>
                            <div style={S.targetedCategory}>{ts.key}</div>
                            <div style={S.targetedSummary}>{ts.summary}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Observations by type — merged full + targeted */}
                    {sortedTypes.map(type => (
                      <div key={type} style={S.block}>
                        <div style={S.blockTitle}>{type.replace(/_/g," ")} observations</div>
                        <div style={S.vsObsHeader}>
                          <span style={{width:180}}>Clue</span>
                          <span style={{flex:1}}>Description</span>
                          <span style={{width:55, textAlign:"right"}}>Raw</span>
                          <span style={{width:35, textAlign:"right"}}>×</span>
                          <span style={{width:55, textAlign:"right"}}>Eff.</span>
                          <span style={{width:130}}>Region</span>
                          <span style={{width:60}}>Source</span>
                        </div>
                        {(byType[type] || [])
                          .sort((a,b) => (b.effective_confidence||0) - (a.effective_confidence||0))
                          .map((obs,i) => {
                            const isTargeted = (obs.created_by_stage && obs.created_by_stage.includes("targeted")) || false;
                            const isLowConf  = (obs.effective_confidence||0) < 0.5;
                            return (
                              <div key={i} style={{
                                ...S.vsObsRow,
                                ...(obs.human_reviewed ? S.vsObsRowReviewed : {}),
                                ...(isLowConf ? S.vsObsRowLowConf : {}),
                              }}>
                                <span style={{...S.vsObsClue, width:180}}>{(obs.reference_id || "").replace(/_/g," ")}</span>
                                <span style={{...S.vsObsText, flex:1}}>{obs.observed_value_text}</span>
                                <span style={{...S.vsObsNum, width:55}}>{(obs.raw_confidence != null ? obs.raw_confidence : 0).toFixed(2)}</span>
                                <span style={{...S.vsObsNum, width:35, color:"#aaa"}}>{(obs.weight_multiplier != null ? obs.weight_multiplier : 1).toFixed(1)}</span>
                                <span style={{...S.vsObsNum, width:55, ...confColor(obs.effective_confidence)}}>{obs.effective_confidence.toFixed(2)}</span>
                                <span style={{...S.vsObsRegion, width:130}}>{obs.region_label || "—"}</span>
                                <span style={{width:60, fontSize:10, color:isTargeted?C.bronze:"#ccc", fontFamily:"sans-serif"}}>
                                  {isTargeted ? "targeted" : "full"}
                                </span>
                                {obs.human_reviewed && <span style={S.vsReviewedTag}>🔒</span>}
                                {isLowConf && <span style={S.vsLowConfTag}>low</span>}
                              </div>
                            );
                          })}
                      </div>
                    ))}

                    {observations.length === 0 && (
                      <div style={S.block}>
                        <p style={S.summaryPara}>No visual observations recorded. Phase 0 may have been skipped or returned no detections above the threshold.</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              
              {/* ── Evidence Tab — Structured Dataset from Phase 0 ── */}
              {activeTab === "evidence" && (() => {
                const p0 = (report.stage_outputs && report.stage_outputs["0_visual_scan"]) || {};
                const byType = p0.observations_by_type || {};
                const allTypes = ["mechanical_structures","toolmarks","fasteners","joinery","hardware","conversion_cavities","finish"];
                const typeLabels = {
                  mechanical_structures: "Structural Mechanisms",
                  toolmarks:             "Toolmarks",
                  fasteners:             "Fasteners",
                  joinery:               "Joinery",
                  hardware:              "Hardware",
                  conversion_cavities:   "Conversion Evidence",
                  finish:                "Finish",
                };

                // Build object_form_candidates from mechanical_structures
                const mechObs  = byType.mechanical_structures || [];
                const formCandidates = mechObs
                  .filter(function(o){ return (o.visual_confidence||0) >= 30; })
                  .sort(function(a,b){ return (b.visual_confidence||0)-(a.visual_confidence||0); })
                  .slice(0, 5);

                // Confidence bar helper
                const confBar = function(conf) {
                  const pct = Math.round((conf||0));
                  const col = pct>=75?"#4a8b48":pct>=50?"#8b7014":"#8b3014";
                  return (
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:80,height:6,background:"#e8e0d4",borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:pct+"%",height:"100%",background:col,borderRadius:3}} />
                      </div>
                      <span style={{fontSize:10,color:col,fontFamily:"monospace",minWidth:28}}>{pct}%</span>
                    </div>
                  );
                };

                return (
                  <div style={S.tabContent}>

                    {/* Phase 0 status summary */}
                    <div style={{
                      background:"#f5f0e8", border:"1px solid #d4c9b4", borderRadius:4,
                      padding:"12px 16px", marginBottom:16, fontFamily:"sans-serif",
                      display:"flex", alignItems:"center", gap:24, flexWrap:"wrap",
                    }}>
                      <div style={{fontSize:12, color:"#5a3e1b"}}>
                        <strong>Visual Evidence Scanner</strong>
                        <span style={{marginLeft:8, color:"#888"}}>Phase 0</span>
                      </div>
                      <div style={{fontSize:12, color:"#555"}}>
                        <strong>{p0.total_observations||0}</strong> observations
                      </div>
                      <div style={{fontSize:12, color:"#555"}}>
                        <strong>{p0.images_scanned||0}</strong> images scanned
                      </div>
                      <div style={{fontSize:12, color:(p0.hard_negatives_detected&&p0.hard_negatives_detected.length)?"#8b3014":"#555"}}>
                        <strong>{(p0.hard_negatives_detected||[]).length}</strong> hard negatives
                      </div>
                      <div style={{fontSize:12, color:"#555"}}>
                        Status: <strong style={{color:p0.phase_0_status==="ok"?"#4a8b48":"#8b7014"}}>{p0.phase_0_status||"—"}</strong>
                      </div>
                    </div>

                    {/* Object form candidates */}
                    {formCandidates.length > 0 && (
                      <div style={S.block}>
                        <div style={S.blockTitle}>Object Form Candidates</div>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          {formCandidates.map(function(obs, i){
                            return (
                              <div key={i} style={{
                                display:"flex", alignItems:"center", gap:12,
                                padding:"8px 12px", background:"#faf6ef",
                                border:"1px solid #d4c9b4", borderRadius:4,
                              }}>
                                <div style={{flex:1}}>
                                  <div style={{fontSize:13, fontWeight:600, color:"#3a2010", fontFamily:"'Georgia',serif"}}>
                                    {(obs.clue||"").replace(/_/g," ")}
                                  </div>
                                  {obs.implied_form && <div style={{fontSize:11,color:"#888",fontFamily:"sans-serif",marginTop:2}}>→ {obs.implied_form}</div>}
                                  {obs.visual_description && <div style={{fontSize:11,color:"#666",fontFamily:"sans-serif",marginTop:2}}>{obs.visual_description}</div>}
                                </div>
                                <div style={{textAlign:"right"}}>
                                  {confBar(obs.visual_confidence)}
                                  {obs.source_image && <div style={{fontSize:10,color:"#aaa",marginTop:3}}>{obs.source_image}</div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Hard negatives */}
                    {(p0.hard_negatives_detected||[]).length > 0 && (
                      <div style={{...S.block, borderColor:"#c07050"}}>
                        <div style={{...S.blockTitle, color:"#8b3014"}}>⚠ Hard Negatives — Override Antique Claims</div>
                        {(p0.hard_negatives_detected||[]).map(function(hn,i){
                          return (
                            <div key={i} style={{
                              display:"flex", alignItems:"center", gap:12, padding:"6px 0",
                              borderBottom:"1px solid #f0e8d8", fontFamily:"sans-serif",
                            }}>
                              <div style={{flex:1}}>
                                <span style={{fontSize:13,fontWeight:600,color:"#8b3014"}}>{(hn.clue_key||"").replace(/_/g," ")}</span>
                                {hn.region_label && <span style={{marginLeft:8,fontSize:11,color:"#888"}}>{hn.region_label}</span>}
                              </div>
                              {confBar((hn.effective_confidence||0)*100)}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Evidence categories */}
                    {allTypes.map(function(typeName){
                      const obs = byType[typeName] || [];
                      if (obs.length === 0) return null;
                      return (
                        <div key={typeName} style={S.block}>
                          <div style={{...S.blockTitle, display:"flex", justifyContent:"space-between"}}>
                            <span>{typeLabels[typeName]||typeName.replace(/_/g," ")}</span>
                            <span style={{fontSize:11,fontWeight:400,color:"#aaa"}}>{obs.length} observation{obs.length!==1?"s":""}</span>
                          </div>
                          {obs
                            .slice()
                            .sort(function(a,b){return (b.visual_confidence||0)-(a.visual_confidence||0);})
                            .map(function(ob, i){
                              return (
                                <div key={i} style={{
                                  display:"flex", alignItems:"flex-start", gap:12,
                                  padding:"8px 0", borderBottom:"1px solid #f0e8d8",
                                  fontFamily:"sans-serif",
                                }}>
                                  {/* Clue name + description */}
                                  <div style={{flex:1}}>
                                    <div style={{
                                      fontSize:12, fontWeight:600, color:"#3a2010",
                                      display:"flex", alignItems:"center", gap:6,
                                    }}>
                                      {(ob.clue||ob.reference_id||"unknown").replace(/_/g," ")}
                                      {ob.hard_negative && (
                                        <span style={{fontSize:9,background:"#f0d8d0",color:"#8b3014",borderRadius:2,padding:"1px 4px"}}>HARD NEG</span>
                                      )}
                                      {ob.low_confidence_flag && (
                                        <span style={{fontSize:9,background:"#f0ead0",color:"#8b7014",borderRadius:2,padding:"1px 4px"}}>tentative</span>
                                      )}
                                    </div>
                                    {ob.visual_description && (
                                      <div style={{fontSize:11,color:"#666",marginTop:2,lineHeight:1.5}}>{ob.visual_description}</div>
                                    )}
                                    {ob.era_implication && (
                                      <div style={{fontSize:10,color:"#8b6914",marginTop:2}}>Era: {ob.era_implication}</div>
                                    )}
                                    {(function(){
                                      var entry = getClueIndicator(ob.clue||ob.reference_id||"");
                                      var prioExp = getPriorityExplanation(ob.clue||ob.reference_id||"");
                                      if (!entry) return null;
                                      return (
                                        <div style={{fontSize:11,color:"#5a3e1b",marginTop:4,fontFamily:"'Georgia',serif",
                                          fontStyle:"italic",borderLeft:"2px solid #d4c4a0",paddingLeft:6,lineHeight:1.5}}>
                                          {entry.indicator_text}
                                          <span style={{marginLeft:6,fontSize:10,color:"#aaa",fontFamily:"sans-serif",fontStyle:"normal"}}>({entry.typical_date_range})</span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  {/* Confidence + source */}
                                  <div style={{textAlign:"right",flexShrink:0,minWidth:100}}>
                                    {confBar(ob.visual_confidence||0)}
                                    <div style={{fontSize:10,color:"#aaa",marginTop:3}}>
                                    {ob.source_image||"—"}
                                    {ob.photo_index && <span style={{marginLeft:4,color:"#8b6914",fontWeight:600}}>Photo {ob.photo_index}</span>}
                                  </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}

                    {/* Empty state */}
                    {Object.keys(byType).length === 0 && (
                      <div style={S.block}>
                        <p style={S.summaryPara}>No structured evidence extracted. Phase 0 returned no observations above the confidence threshold.</p>
                        <p style={S.summaryPara}>Add an underside photo, joinery closeup, or hardware closeup to improve extraction.</p>
                      </div>
                    )}

                    {/* Raw phase notes */}
                    {p0.broad_form_impression && (
                      <div style={{
                        marginTop:8, padding:"10px 14px", background:"#f5f0e8",
                        border:"1px solid #d4c9b4", borderRadius:4,
                        fontSize:12, fontFamily:"sans-serif", color:"#5a3e1b",
                      }}>
                        <strong>Scanner impression:</strong> {p0.broad_form_impression}
                        {p0.primary_wood_observed && <span style={{marginLeft:12}}>· <strong>Primary wood:</strong> {p0.primary_wood_observed}</span>}
                        {p0.condition_impression && <span style={{marginLeft:12}}>· <strong>Condition:</strong> {p0.condition_impression}</span>}
                      </div>
                    )}

                  </div>
                );
              })()}

{activeTab === "stages" && (
                <div style={S.tabContent}>
                  {PHASES.map(ph => {
                    const data = report.stage_outputs[ph.key];
                    if (!data) return null;
                    return (
                      <div key={ph.key} style={S.stageBlock}>
                        <div style={S.stageHead}>
                          <span style={S.stageNum}>{ph.short}</span>
                          <div>
                            <div style={S.stageLabel}>{ph.label}{report.stage_outputs && report.stage_outputs[ph.key] && report.stage_outputs[ph.key]._synthesized && <span style={{marginLeft:6,fontSize:10,color:"#b87020",background:"#fdf0dc",borderRadius:2,padding:"1px 5px",fontFamily:"sans-serif"}}>simulated</span>}</div>
                            <div style={S.stageNote}>{ph.note}</div>
                          </div>
                          {data.skipped && <span style={S.skippedChip}>Skipped — {data.skip_reason}</span>}
                        </div>
                        {!data.skipped && <pre style={S.stageJson}>{JSON.stringify(data, null, 2)}</pre>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Valuation Tab ── */}
              {activeTab === "valuation" && (
                <div style={S.tabContent}>
                  {fr.valuation_skipped ? (
                    <div style={S.block}>
                      <div style={S.blockTitle}>Valuation</div>
                      <p style={S.summaryPara}>⚠ {(report.stage_outputs && report.stage_outputs["7_valuation"] && report.stage_outputs["7_valuation"].skip_reason) || ""}</p>
                    </div>
                  ) : (
                    <>
                      {fr.valuation_provisional && (
                        <div style={S.provisionalBanner}>⚠ Provisional — identification confidence is Low. These are rough estimates only.</div>
                      )}
                      <div style={S.valGrid}>
                        {fr.valuations.map(v => (
                          <div key={v.market_lane} style={S.valCard}>
                            <div style={S.valLane}>{v.market_lane.replace(/_/g," ")}</div>
                            <div style={S.valRange}>${(v.low_estimate||0).toLocaleString()} – ${(v.high_estimate||0).toLocaleString()}</div>
                            <div style={S.valRationale}>{v.rationale}</div>
                          </div>
                        ))}
                      </div>
                      {fr.value_adjustments.length > 0 && (
                        <div style={S.block}>
                          <div style={S.blockTitle}>Adjustments Applied</div>
                          <ul style={S.evidList}>
                            {fr.value_adjustments.map((a,i)=>(
                              <li key={i} style={S.evidItem}>
                                <span style={a.direction==="positive"?S.dotGreen:S.dotAmber}>{a.direction==="positive"?"▲":"▼"}</span>
                                {a.factor} ({a.direction==="positive"?"+":""}{a.adjustment_percent}%)
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {fr.value_drivers.length > 0 && (
                        <div style={S.block}>
                          <div style={S.blockTitle}>Value Drivers</div>
                          <ul style={S.evidList}>{fr.value_drivers.map((v,i)=><li key={i} style={S.evidItem}><span style={S.dotGreen}>▲</span>{v}</li>)}</ul>
                        </div>
                      )}
                      {fr.value_detractors.length > 0 && (
                        <div style={S.block}>
                          <div style={S.blockTitle}>Value Detractors</div>
                          <ul style={S.evidList}>{fr.value_detractors.map((v,i)=><li key={i} style={S.evidItem}><span style={S.dotAmber}>▼</span>{v}</li>)}</ul>
                        </div>
                      )}
                      {fr.market_notes && (
                        <div style={S.block}>
                          <div style={S.blockTitle}>Market Context</div>
                          <p style={S.summaryPara}>{fr.market_notes}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Footer */}
              <div style={S.reportFooter}>
                <button style={S.newCaseBtn} onClick={reset}>← New Case</button>
                <div style={S.footerNote}>NCW Furniture Identification Engine · v0.3 · Weight Matrix Active</div>
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
}

// Helper for conflict severity chip color
function severityStyle(sev) {
  if (sev === "high")   return { background:"#fdf0ec", color:C.rust,  borderColor:"#e8b090" };
  if (sev === "medium") return { background:"#fdf8ec", color:"#a07020", borderColor:"#e0c880" };
  return                       { background:"#f0f4ee", color:C.sage,  borderColor:"#b5c4ae" };
}

// Helper for confidence band coloring on the appraisal card
function confidenceBandStyle(band) {
  if (band === "High")         return { color:"#3a6b38" };
  if (band === "Moderate")     return { color:"#7a6010" };
  if (band === "Low")          return { color:C.rust    };
  if (band === "Inconclusive") return { color:"#888"    };
  return {};
}

// Helper for effective_confidence color coding in visual scan table
function confColor(eff) {
  if (eff >= 0.7) return { color: C.sage,   fontWeight: 600 };
  if (eff >= 0.4) return { color: C.bronze, fontWeight: 600 };
  return                 { color: "#bbb" };
}

// ============================================================
// STYLES
// ============================================================
const C = {
  parchment: "#f5efe4", cream: "#faf6ef", ink: "#1a1410",
  sepia: "#4a3728", bronze: "#8b6914", rust: "#c0703a",
  sage: "#5a6b52", divider: "#d4c9b4", card: "#fdfaf4",
  shadow: "rgba(26,20,16,0.10)",
};
const S: any = {
  root:        { minHeight:"100vh", background:C.cream, fontFamily:"'Georgia','Times New Roman',serif", color:C.ink, position:"relative", overflowX:"hidden" },
  bgTexture:   { position:"fixed", inset:0, backgroundImage:`radial-gradient(circle at 18% 18%, rgba(139,105,20,0.05) 0%, transparent 55%), radial-gradient(circle at 82% 82%, rgba(90,107,82,0.04) 0%, transparent 55%)`, pointerEvents:"none", zIndex:0 },
  header:      { borderBottom:`1px solid ${C.divider}`, background:C.ink, position:"sticky", top:0, zIndex:100 },
  headerInner: { maxWidth:1160, margin:"0 auto", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  logoArea:    { display:"flex", alignItems:"center", gap:12, cursor:"pointer" },
  logoMark:    { fontSize:24, color:C.bronze },
  logoName:    { fontSize:18, fontWeight:700, letterSpacing:"0.12em", color:C.parchment },
  logoSub:     { fontSize:9, color:C.bronze, letterSpacing:"0.18em", textTransform:"uppercase", marginTop:1, fontFamily:"sans-serif" },
  caseTagArea: { display:"flex", alignItems:"center", gap:8 },
  caseIdText:  { fontSize:11, color:"#888", fontFamily:"monospace" },
  stepChip:    { fontSize:10, background:C.bronze, color:C.ink, padding:"3px 9px", borderRadius:2, letterSpacing:"0.1em", fontFamily:"sans-serif" },
  main:        { position:"relative", zIndex:1 },
  centered:    { minHeight:"calc(100vh - 56px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 20px" },
  introCard:   { maxWidth:560, textAlign:"center", width:"100%" },
  introEra:    { fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:C.bronze, marginBottom:16, fontFamily:"sans-serif" },
  introTitle:  { fontSize:"clamp(32px, 8vw, 52px)", lineHeight:1.1, margin:"0 0 18px", fontWeight:400, letterSpacing:"-0.01em" },
  introDesc:   { fontSize:15, lineHeight:1.75, color:C.sepia, marginBottom:24 },
  phasePillRow:{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center", marginBottom:28 },
  phasePill:   { fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", border:`1px solid ${C.divider}`, color:C.sepia, padding:"4px 10px", borderRadius:2, fontFamily:"sans-serif" },
  ctaBtn:      { display:"inline-block", background:C.ink, color:C.parchment, border:"none", padding:"14px 32px", fontSize:14, letterSpacing:"0.08em", cursor:"pointer", fontFamily:"'Georgia',serif", borderRadius:2 },
  ctaDisabled: { background:C.divider, color:C.sepia, cursor:"not-allowed" },
  versionNote: { fontSize:10, color:C.divider, marginTop:12, fontFamily:"sans-serif" },

  // ── Mode selector (landing page) ──────────────────────────────
  modeGrid:        { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24, width:"100%", maxWidth:560 },
  modeCard:        { background:C.card, border:`1.5px solid ${C.divider}`, borderRadius:6, padding:"20px 18px", cursor:"pointer", display:"flex", flexDirection:"column", gap:10, transition:"border-color 0.2s", textAlign:"left" },
  modeCardTop:     { display:"flex", alignItems:"center", justifyContent:"space-between" },
  modeIcon:        { fontSize:22, lineHeight:1 },
  modeBadge:       { fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", background:C.parchment, border:`1px solid ${C.divider}`, color:C.sepia, padding:"2px 8px", borderRadius:2, fontFamily:"sans-serif" },
  modeCardTitle:   { fontSize:18, fontWeight:400, color:C.ink, lineHeight:1.2 },
  modeCardContext: { fontSize:10, color:C.bronze, fontFamily:"sans-serif", letterSpacing:"0.04em", marginTop:-4 },
  modeCardDesc:    { fontSize:12, color:C.sepia, lineHeight:1.6, fontFamily:"sans-serif" },
  modeOutputList:  { display:"flex", flexDirection:"column", gap:5, margin:"4px 0" },
  modeOutputItem:  { display:"flex", alignItems:"flex-start", gap:7, fontSize:12, color:C.sepia, fontFamily:"sans-serif" },
  modeOutputDot:   { color:C.bronze, fontSize:8, flexShrink:0, marginTop:3 },
  modeTime:        { fontSize:10, color:"#aaa", fontFamily:"sans-serif", letterSpacing:"0.06em" },
  modeBtn:         { padding:"10px 0", fontSize:13, fontFamily:"'Georgia',serif", borderRadius:2, textAlign:"center", marginTop:4 },
  modeBtnQuick:    { background:"#3a6b38", color:"#fff" },
  modeBtnFull:     { background:C.ink, color:C.parchment },

  // ── Quick Mode intake ─────────────────────────────────────────
  quickPage:          { maxWidth:480, margin:"0 auto", padding:"32px 20px 48px", display:"flex", flexDirection:"column", gap:20 },
  quickHeader:        { textAlign:"center" },
  quickModeBadge:     { display:"inline-block", fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", background:"#edf5ec", border:"1px solid #a8cca6", color:"#3a6b38", padding:"3px 12px", borderRadius:2, fontFamily:"sans-serif", marginBottom:10 },
  quickTitle:         { fontSize:26, fontWeight:400, margin:"0 0 8px", color:C.ink },
  quickSubtitle:      { fontSize:14, color:C.sepia, lineHeight:1.6, margin:0 },
  quickPhotoGrid:     { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 },
  quickSlot:          { border:`1.5px dashed ${C.divider}`, borderRadius:4, padding:14, background:C.card, display:"flex", flexDirection:"column", gap:8, minHeight:130, alignItems:"center", justifyContent:"center", textAlign:"center" },
  quickSlotFilled:    { border:`1.5px solid #a8cca6`, background:"#f0f5ef", borderRadius:4, padding:10, display:"flex", flexDirection:"column", alignItems:"center", gap:6 },
  quickThumb:         { width:"100%", height:80, objectFit:"cover", borderRadius:2 },
  quickSlotCheck:     { fontSize:11, color:"#3a6b38", fontFamily:"sans-serif", fontWeight:600 },
  quickSlotLabel:     { fontSize:12, fontWeight:600, color:C.sepia, fontFamily:"sans-serif" },
  quickSlotHint:      { fontSize:10, color:"#aaa", fontFamily:"sans-serif", lineHeight:1.4 },
  quickUploadRow:     { display:"flex", gap:6, width:"100%" },
  quickUploadBtn:     { flex:1, background:"none", border:`1px solid ${C.divider}`, padding:"6px 0", fontSize:10, cursor:"pointer", borderRadius:2, color:C.sepia, fontFamily:"sans-serif" },
  quickCount:         { fontSize:12, color:C.sepia, fontFamily:"sans-serif", textAlign:"center" },
  quickGuessBlock:    { display:"flex", flexDirection:"column", gap:6 },
  quickGuessLabel:    { fontSize:12, fontWeight:600, color:C.sepia, fontFamily:"sans-serif" },
  quickGuessInput:    { border:`1px solid ${C.divider}`, background:C.card, padding:"10px 12px", fontSize:14, color:C.ink, fontFamily:"'Georgia',serif", borderRadius:2 },
  quickError:         { background:"#fdf0ec", border:`1px solid ${C.rust}`, color:C.rust, padding:"10px 14px", borderRadius:2, fontSize:13, fontFamily:"sans-serif" },
  quickErrorCard:     { background:"#fdf0ec", border:`1.5px solid #d8a090`, borderRadius:4, padding:"14px 16px", display:"flex", flexDirection:"column", gap:8 },
  quickErrorMsg:      { fontSize:14, color:"#8b3a2a", lineHeight:1.6, fontFamily:"'Georgia',serif" },
  quickErrorDebugBtn: { background:"none", border:`1px solid #d8a090`, color:"#8b3a2a", padding:"4px 10px", fontSize:10, cursor:"pointer", borderRadius:2, fontFamily:"sans-serif", letterSpacing:"0.06em", alignSelf:"flex-start" },
  quickErrorDebugPanel:{ background:"rgba(26,20,16,0.04)", border:`1px solid ${C.divider}`, borderRadius:2, padding:"10px 12px", display:"flex", flexDirection:"column", gap:6 },
  quickErrorDebugLine:{ fontSize:11, color:C.sepia, fontFamily:"sans-serif" },
  quickErrorRaw:      { fontSize:10, color:C.sepia, fontFamily:"monospace", whiteSpace:"pre-wrap", wordBreak:"break-word", margin:0, maxHeight:140, overflowY:"auto" },
  quickPriceRow:      { display:"flex", alignItems:"center", gap:0 },
  quickPriceDollar:   { fontSize:15, color:C.sepia, padding:"9px 8px 9px 12px", background:C.parchment, border:`1px solid ${C.divider}`, borderRight:"none", borderRadius:"2px 0 0 2px", lineHeight:1 },
  quickPriceInput:    { flex:1, border:`1px solid ${C.divider}`, borderLeft:"none", background:C.card, padding:"9px 12px 9px 4px", fontSize:15, color:C.ink, fontFamily:"'Georgia',serif", borderRadius:"0 2px 2px 0", outline:"none" },
  quickValueRange:    { fontSize:22, color:C.ink, fontWeight:400, marginBottom:8 },
  quickAskingRow:     { display:"flex", alignItems:"center", gap:12, paddingTop:10, borderTop:`1px solid ${C.divider}` },
  quickAskingBox:     { flex:1 },
  quickPriceGuidanceBadge:{ fontSize:13, fontWeight:700, fontFamily:"sans-serif", letterSpacing:"0.08em", padding:"6px 14px", borderRadius:3, border:"1.5px solid", flexShrink:0 },

  // ── Progressive photo capture ─────────────────────────────────
  progressiveCaptureBlock:  { display:"flex", flexDirection:"column", gap:10 },
  progressiveScanning:      { display:"flex", alignItems:"center", gap:10, background:"#fdf8ec", border:"1px solid #d8c870", borderRadius:3, padding:"10px 14px", fontSize:13, color:"#7a6010", fontFamily:"sans-serif" },
  progressiveScanningDot:   { fontSize:16, animation:"none" },
  progressiveSuggestion:    { background:"#f5f8f4", border:"1px solid #c8d8c0", borderRadius:4, padding:"14px 16px" },
  progressiveSuggestionTitle:{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:"#3a6b38", fontFamily:"sans-serif", marginBottom:10 },
  progressiveSuggestionList: { display:"flex", flexDirection:"column", gap:10 },
  progressiveSuggestionItem: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 },
  progressiveSuggestionLabel:{ fontSize:13, color:C.ink, fontFamily:"'Georgia',serif", lineHeight:1.4 },
  progressiveSuggestionHint: { fontSize:10, color:"#888", fontFamily:"sans-serif", marginTop:2 },
  progressiveAddBtns:        { display:"flex", gap:6, flexShrink:0 },
  progressiveMiniBtn:        { background:"none", border:`1px solid ${C.divider}`, width:32, height:32, cursor:"pointer", borderRadius:2, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" },
  progressivePhotoCount:     { fontSize:10, color:"#aaa", fontFamily:"sans-serif", marginTop:10, textAlign:"right" },
  progressiveAddBlock:       { background:C.card, border:`1px solid ${C.divider}`, borderRadius:4, padding:"14px 16px" },
  progressiveAddTitle:       { fontSize:13, color:C.bronze, fontFamily:"sans-serif", fontWeight:600, marginBottom:4 },
  progressiveAddHint:        { fontSize:11, color:"#aaa", fontFamily:"sans-serif", marginBottom:10 },
  quickAnalyzeBtn:    { background:"#3a6b38", color:"#fff", border:"none", padding:"16px", fontSize:15, cursor:"pointer", fontFamily:"'Georgia',serif", borderRadius:3, textAlign:"center" },
  quickAnalyzeBtnDisabled:{ background:C.divider, color:C.sepia, cursor:"not-allowed" },

  // ── Quick Mode results ────────────────────────────────────────
  quickResultPage:    { maxWidth:480, margin:"0 auto", padding:"24px 20px 48px", display:"flex", flexDirection:"column", gap:16 },
  signalCard:         { border:"2px solid", borderRadius:6, padding:"18px 20px", display:"flex", alignItems:"flex-start", gap:14 },
  signalIndicator:    { fontSize:28, lineHeight:1, flexShrink:0 },
  signalBody:         { flex:1 },
  signalLabel:        { fontSize:18, fontWeight:700, fontFamily:"sans-serif", marginBottom:6 },
  signalRationale:    { fontSize:13, color:C.sepia, lineHeight:1.6, fontFamily:"'Georgia',serif" },
  quickResultBlock:   { background:C.card, border:`1px solid ${C.divider}`, borderRadius:4, padding:"16px 18px" },
  quickResultBlockTitle:{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:C.bronze, fontFamily:"sans-serif", marginBottom:8 },
  quickResultId:      { fontSize:20, color:C.ink, fontWeight:400, lineHeight:1.3 },
  quickResultSub:     { fontSize:12, color:C.sepia, fontFamily:"sans-serif", marginTop:4 },
  quickMetaRow:       { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  quickMetaBox:       { background:C.card, border:`1px solid ${C.divider}`, borderRadius:4, padding:"14px 16px" },
  quickMetaLabel:     { fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:C.sepia, fontFamily:"sans-serif", marginBottom:5 },
  quickMetaValue:     { fontSize:16, color:C.ink, fontWeight:400 },
  quickClueRow:       { display:"flex", flexWrap:"wrap", gap:7 },
  quickClue:          { fontSize:11, background:C.parchment, border:`1px solid ${C.divider}`, color:C.ink, padding:"4px 10px", borderRadius:2, fontFamily:"sans-serif" },
  quickNoteList:      { listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:7 },
  quickNoteItem:      { display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:C.sepia, lineHeight:1.6 },
  quickNoteDot:       { color:C.bronze, fontSize:10, flexShrink:0, marginTop:3 },
  quickHardNeg:       { background:"#fdf0ec", border:`1px solid #e8b090`, borderRadius:4, padding:"14px 16px" },
  quickHardNegTitle:  { fontSize:12, color:C.rust, fontFamily:"sans-serif", fontWeight:600, marginBottom:6 },
  quickHardNegItem:   { fontSize:12, color:C.sepia, fontFamily:"sans-serif", marginTop:4 },
  upgradeBlock:       { background:"#f5f8f4", border:`1px solid #c8d8c0`, borderRadius:4, padding:"18px 20px", display:"flex", flexDirection:"column", gap:10 },
  upgradeTitle:       { fontSize:14, fontWeight:600, color:C.ink, fontFamily:"'Georgia',serif" },
  upgradeDesc:        { fontSize:12, color:C.sepia, lineHeight:1.6, fontFamily:"sans-serif" },
  upgradeHints:       { display:"flex", flexWrap:"wrap", gap:7 },
  upgradeHint:        { fontSize:10, color:"#3a6b38", background:"#edf5ec", border:"1px solid #a8cca6", padding:"2px 9px", borderRadius:2, fontFamily:"sans-serif" },
  upgradeBtn:         { background:C.ink, color:C.parchment, border:"none", padding:"12px", fontSize:13, cursor:"pointer", fontFamily:"'Georgia',serif", borderRadius:2, textAlign:"center" },
  quickNewScanBtn:    { background:"none", border:`1px solid ${C.divider}`, padding:"10px", fontSize:13, cursor:"pointer", color:C.sepia, fontFamily:"'Georgia',serif", borderRadius:2, textAlign:"center" },
  intakePage:  { maxWidth:680, margin:"0 auto", padding:"0 0 40px" },
  // Evidence info panel
  evidenceInfoPanel:  { margin:"20px 20px 0", padding:"16px 20px", background:C.parchment, border:`1px solid ${C.divider}`, borderRadius:6 },
  evidenceInfoTitle:  { fontSize:11, letterSpacing:"0.16em", textTransform:"uppercase", color:C.bronze, fontFamily:"sans-serif", marginBottom:12 },
  evidenceInfoList:   { listStyle:"none", padding:0, margin:"0 0 12px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 12px" },
  evidenceInfoItem:   { display:"flex", alignItems:"center", gap:7, fontSize:13, color:C.sepia },
  evidenceInfoCheck:  { color:C.sage, flexShrink:0, fontSize:12, fontWeight:700 },
  evidenceInfoFooter: { fontSize:12, color:"#aaa", fontFamily:"sans-serif", fontStyle:"italic", borderTop:`1px solid ${C.divider}`, paddingTop:10, marginTop:4 },
  intakeSection:{ padding:"28px 20px 0" },
  sectionLabel:{ fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:C.bronze, marginBottom:5, fontFamily:"sans-serif" },
  sectionTitle:{ fontSize:22, fontWeight:400, margin:"0 0 8px", lineHeight:1.2 },
  sectionDesc: { fontSize:13, lineHeight:1.7, color:C.sepia, marginBottom:20 },
  photoStack:  { display:"flex", flexDirection:"column", gap:12 },
  // Core group header
  coreGroupHeader: { display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:12 },
  coreGroupLabel:  { fontSize:13, fontWeight:600, color:C.ink },
  coreGroupSub:    { fontSize:11, color:"#aaa", fontFamily:"sans-serif" },
  // Evidence group
  evidenceGroup:        { marginTop:20, paddingTop:20, borderTop:`1px solid ${C.divider}` },
  evidenceGroupHeader:  { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 },
  evidenceGroupTitleRow:{ display:"flex", alignItems:"center", gap:8 },
  evidenceGroupIcon:    { fontSize:16, opacity:0.65 },
  evidenceGroupTitle:   { fontSize:13, fontWeight:600, color:C.ink },
  evidenceGroupCount:   { fontSize:11, color:"#aaa", fontFamily:"sans-serif", flexShrink:0 },
  evidenceGroupHelper:  { fontSize:12, color:C.sepia, lineHeight:1.65, fontFamily:"sans-serif", margin:"0 0 14px", fontStyle:"italic" },
  groupThumbGrid:  { display:"flex", flexWrap:"wrap", gap:10, marginBottom:14 },
  groupThumbWrap:  { position:"relative", flexShrink:0 },
  groupThumb:      { width:80, height:80, objectFit:"cover", borderRadius:4, display:"block", border:`1px solid ${C.divider}` },
  groupThumbRemove:{ position:"absolute", top:-6, right:-6, width:20, height:20, borderRadius:"50%", background:C.rust, color:"#fff", border:"none", fontSize:14, lineHeight:"20px", textAlign:"center", cursor:"pointer", padding:0, fontFamily:"sans-serif" },
  addEvidenceBtn:  { width:"100%", background:"none", border:`1.5px dashed ${C.divider}`, borderRadius:4, padding:"13px 0", fontSize:13, letterSpacing:"0.03em", cursor:"pointer", color:C.bronze, fontFamily:"sans-serif", textAlign:"center" },
  progressBreakdown:{ color:"#aaa", fontFamily:"sans-serif", fontSize:11 },
  progressGuidance:{ fontSize:12, color:"#aaa", fontFamily:"sans-serif", marginTop:4 },
  // Functional clues section
  optionalInline:  { fontSize:10, letterSpacing:"0.1em", color:"#aaa", fontFamily:"sans-serif", marginLeft:6, textTransform:"uppercase" },
  cluesList:       { display:"flex", flexDirection:"column", gap:2 },
  clueRow:         { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:C.card, border:`1px solid ${C.divider}`, borderRadius:6, cursor:"pointer", userSelect:"none", transition:"background 0.15s" },
  clueRowOn:       { background:"#f0f6ee", border:`1px solid #b5c9ae` },
  clueLabel:       { fontSize:14, color:C.ink, lineHeight:1.4, paddingRight:16 },
  // Toggle switch
  toggle:          { flexShrink:0, width:44, height:26, borderRadius:13, background:C.divider, position:"relative", transition:"background 0.2s" },
  toggleOn:        { background:C.sage },
  toggleThumb:     { position:"absolute", top:3, left:3, width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.2)", transition:"transform 0.2s" },
  toggleThumbOn:   { transform:"translateX(18px)" },
  photoCard:   { display:"flex", alignItems:"flex-start", gap:14, background:C.card, border:`1.5px solid ${C.divider}`, borderRadius:6, padding:"14px", position:"relative" },
  photoCardFilled:{ border:`1.5px solid ${C.sage}`, background:"#f4f8f2" },
  photoCardLeft:{ flexShrink:0 },
  photoThumb:  { width:70, height:70, objectFit:"cover", borderRadius:4, display:"block" },
  photoPlaceholder:{ width:70, height:70, borderRadius:4, background:C.parchment, border:`1px dashed ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"center" },
  photoPlaceholderIcon:{ fontSize:22, opacity:0.3 },
  photoCardBody:{ flex:1, minWidth:0 },
  photoCardTitleRow:{ display:"flex", alignItems:"center", gap:8, marginBottom:3 },
  photoCardTitle:{ fontSize:14, fontWeight:600, color:C.ink },
  photoCardCheck:{ fontSize:13, color:C.sage, marginLeft:"auto" },
  photoCardHint:{ fontSize:12, color:C.sepia, fontFamily:"sans-serif", marginBottom:6 },
  photoCardEvidenceHint:{ fontSize:10, color:C.bronze, fontFamily:"sans-serif", marginBottom:10, lineHeight:1.4, letterSpacing:"0.02em" },
  // See example button — small, unobtrusive, inside card title row
  exampleBtn: { background:"none", border:`1px solid ${C.bronze}`, color:C.bronze, padding:"2px 8px", fontSize:10, cursor:"pointer", fontFamily:"sans-serif", borderRadius:2, letterSpacing:"0.06em", marginLeft:6, flexShrink:0, lineHeight:1.6 },
  // Replaces "Optional" on evidence groups
  helpfulTag: { fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", background:"#f0f4ee", border:`1px solid #b5c4ae`, color:C.sage, padding:"2px 7px", borderRadius:2, fontFamily:"sans-serif", marginLeft:4 },
  evidenceGuidanceBlock:{ marginTop:12, background:"#fdfaf2", border:`1px solid #e8ddb8`, borderRadius:3, padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 },
  evidenceGuidanceTitle:{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:C.bronze, fontFamily:"sans-serif", marginBottom:2 },
  evidenceGuidanceRow:  { display:"flex", alignItems:"flex-start", gap:8 },
  evidenceGuidanceIcon: { fontSize:13, color:C.bronze, flexShrink:0, lineHeight:1.5 },
  evidenceGuidanceText: { fontSize:12, color:C.sepia, lineHeight:1.55, fontFamily:"sans-serif" },
  // Two-button upload row
  uploadBtnRow:    { display:"flex", gap:8 },
  uploadBtnCamera: { flex:1, background:C.ink, color:C.parchment, border:"none", borderRadius:4, padding:"9px 0", fontSize:12, cursor:"pointer", fontFamily:"sans-serif", letterSpacing:"0.03em", textAlign:"center" },
  uploadBtnLibrary:{ flex:1, background:"none", color:C.sepia, border:`1.5px solid ${C.divider}`, borderRadius:4, padding:"9px 0", fontSize:12, cursor:"pointer", fontFamily:"sans-serif", letterSpacing:"0.03em", textAlign:"center" },
  // Keep old photoBtn/photoBtnFilled for any remaining uses
  photoBtn:    { flexShrink:0, background:"none", border:`1.5px solid ${C.divider}`, borderRadius:4, padding:"8px 14px", fontSize:12, cursor:"pointer", color:C.sepia, fontFamily:"sans-serif", letterSpacing:"0.06em" },
  photoBtnFilled:{ borderColor:C.sage, color:C.sage },
  optionalTag: { fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", background:C.parchment, border:`1px solid ${C.divider}`, color:"#999", padding:"1px 6px", borderRadius:2, fontFamily:"sans-serif" },
  progressSection:{ padding:"18px 20px 0" },
  progressBar: { height:4, background:C.divider, borderRadius:2, overflow:"hidden", marginBottom:8 },
  progressFill:{ height:"100%", background:C.bronze, borderRadius:2, transition:"width 0.4s ease" },
  progressText:{ fontSize:13, color:C.sepia, fontFamily:"sans-serif" },
  progressNote:{ color:"#aaa" },
  formStack:   { display:"flex", flexDirection:"column", gap:14 },
  dimRow:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  dimField:    { display:"flex", flexDirection:"column", gap:4 },
  formField:   { display:"flex", flexDirection:"column", gap:4 },
  fieldLabel:  { fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:C.sepia, fontFamily:"sans-serif" },
  fieldInput:  { border:`1px solid ${C.divider}`, background:C.card, padding:"11px 12px", fontSize:14, color:C.ink, fontFamily:"'Georgia',serif", borderRadius:4, outline:"none", WebkitAppearance:"none" },
  fieldTA:     { minHeight:72, resize:"vertical" },
  errorBox:    { background:"#fdf0ec", border:`1px solid ${C.rust}`, color:C.rust, padding:"10px 14px", borderRadius:4, fontSize:13, fontFamily:"sans-serif" },
  // ── Structured phase error card ──────────────────────────────
  phaseErrorCard:       { background:"#fdf0ec", border:`2px solid ${C.rust}`, borderRadius:4, padding:"20px 22px", marginBottom:16 },
  phaseErrorHeader:     { display:"flex", alignItems:"flex-start", gap:12, marginBottom:10 },
  phaseErrorIcon:       { fontSize:20, color:C.rust, flexShrink:0, lineHeight:1.2 },
  phaseErrorTitle:      { fontSize:15, fontWeight:700, color:C.rust, fontFamily:"sans-serif" },
  phaseErrorPhase:      { fontSize:12, color:C.sepia, fontFamily:"sans-serif", marginTop:2 },
  phaseErrorType:       { fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:C.rust, fontFamily:"sans-serif", marginBottom:6, opacity:0.7 },
  phaseErrorMsg:        { fontSize:13, color:C.ink, lineHeight:1.6, marginBottom:8 },
  phaseErrorRetry:      { fontSize:11, color:"#a05020", fontFamily:"sans-serif", marginBottom:8, fontStyle:"italic" },
  phaseErrorDebugToggle:{ background:"none", border:`1px solid ${C.rust}`, color:C.rust, padding:"5px 12px", fontSize:11, cursor:"pointer", fontFamily:"sans-serif", borderRadius:2, letterSpacing:"0.06em", marginTop:4 },
  phaseErrorDebugPanel: { marginTop:14, background:"rgba(26,20,16,0.04)", border:`1px solid ${C.divider}`, borderRadius:2, padding:"14px 16px" },
  debugRow:             { display:"flex", alignItems:"flex-start", gap:16, padding:"5px 0", borderBottom:`1px solid ${C.divider}` },
  debugRowStack:        { display:"flex", flexDirection:"column", gap:6, padding:"8px 0" },
  debugKey:             { width:120, fontSize:11, fontWeight:600, color:C.sepia, fontFamily:"sans-serif", letterSpacing:"0.06em", textTransform:"uppercase", flexShrink:0, paddingTop:1 },
  debugVal:             { fontSize:12, color:C.ink, fontFamily:"monospace", lineHeight:1.5, wordBreak:"break-word" },
  debugRaw:             { fontSize:10, color:C.sepia, fontFamily:"monospace", lineHeight:1.5, background:"rgba(26,20,16,0.06)", padding:"10px 12px", borderRadius:2, overflowX:"auto", whiteSpace:"pre-wrap", wordBreak:"break-word", maxHeight:240, overflowY:"auto", margin:0 },
  analyzeSection:{ padding:"24px 20px 0", display:"flex", flexDirection:"column", gap:10 },
  analyzeBtn:  { width:"100%", background:C.ink, color:C.parchment, border:"none", padding:"18px 0", fontSize:16, letterSpacing:"0.06em", cursor:"pointer", fontFamily:"'Georgia',serif", borderRadius:4, textAlign:"center" },
  analyzeBtnDisabled:{ background:C.divider, color:C.sepia, cursor:"not-allowed" },
  analyzeHint: { textAlign:"center", fontSize:12, color:"#aaa", margin:0, fontFamily:"sans-serif" },
  analysisScreen:{ minHeight:"calc(100vh - 56px)", background:C.cream, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"0 0 40px" },
  analysisScreenInner:{ width:"100%", maxWidth:560, padding:"32px 20px 0" },
  analysisHeader:{ textAlign:"center", marginBottom:32 },
  analysisLogo:{ fontSize:30, color:C.bronze, marginBottom:12 },
  analysisTitle:{ fontSize:22, fontWeight:400, margin:"0 0 6px" },
  analysisSubtitle:{ fontSize:13, color:C.sepia, margin:0, fontFamily:"sans-serif" },
  analysisPhasesWrap:{ display:"flex", flexDirection:"column" },
  analysisPhaseRow:{ display:"flex", gap:16, minHeight:64 },
  analysisPhaseRowActive:{},
  analysisPhaseLeft:{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0, width:36 },
  analysisPhaseCircle:{ width:36, height:36, borderRadius:"50%", border:`2px solid ${C.divider}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:C.cream, zIndex:1 },
  analysisPhaseCircleDone:{ background:C.sage, borderColor:C.sage, color:"#fff", fontWeight:700, fontSize:14 },
  analysisPhaseCircleActive:{ background:C.bronze, borderColor:C.bronze, color:"#fff" },
  analysisConnector:{ flex:1, width:2, background:C.divider, margin:"2px 0" },
  analysisConnectorDone:{ background:C.sage },
  analysisPhaseRight:{ flex:1, paddingBottom:20, paddingTop:6 },
  analysisPhaseName:{ fontSize:14, fontWeight:600, marginBottom:3 },
  analysisPhaseActive:{ color:C.bronze },
  analysisPhaseDone:{ color:C.sage },
  analysisPhasePending:{ color:"#bbb" },
  analysisPhaseDesc:{ fontSize:12, fontFamily:"sans-serif", lineHeight:1.5, color:"#aaa" },
  analysisPhaseNum:{ fontSize:10, fontFamily:"monospace", color:C.sepia },
  spinner:     { display:"inline-block", fontSize:16 },
  analysisFootnote:{ textAlign:"center", fontSize:11, color:"#bbb", fontFamily:"sans-serif", marginTop:8, padding:"0 20px" },
  reportWrap:  { maxWidth:980, margin:"0 auto", padding:"28px 20px 48px" },
  reportHeader:{ marginBottom:24, borderBottom:`1px solid ${C.divider}`, paddingBottom:20 },
  reportTitle: { fontSize:"clamp(22px, 5vw, 34px)", fontWeight:400, margin:"6px 0 12px", lineHeight:1.2, letterSpacing:"-0.01em" },
  metaRow:     { display:"flex", flexWrap:"wrap", gap:7 },

  // ── Professional appraisal summary styles ──────────────────
  appraisalCard:       { background:C.card, border:`1.5px solid ${C.divider}`, borderRadius:4, padding:"22px 24px" },
  appraisalEyebrow:    { fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:C.bronze, fontFamily:"sans-serif", marginBottom:14 },
  appraisalIdRow:      { display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:16 },
  appraisalIdMain:     { flex:1 },
  appraisalIdLabel:    { fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:C.sepia, fontFamily:"sans-serif", marginBottom:4 },
  appraisalIdValue:    { fontSize:"clamp(17px,4vw,22px)", color:C.ink, lineHeight:1.3, fontWeight:400 },
  appraisalClassChip:  { fontSize:11, background:"#eef2eb", border:`1px solid #b5c4ae`, color:C.sage, padding:"3px 10px", borderRadius:2, fontFamily:"sans-serif", letterSpacing:"0.06em", flexShrink:0, alignSelf:"flex-start", marginTop:4 },
  appraisalMetaRow:    { display:"flex", flexWrap:"wrap", gap:20, marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${C.divider}` },
  appraisalMeta:       { display:"flex", flexDirection:"column", gap:3 },
  appraisalMetaLabel:  { fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:C.sepia, fontFamily:"sans-serif" },
  appraisalMetaValue:  { fontSize:15, color:C.ink, fontWeight:400 },
  appraisalConfValue:  { fontWeight:600 },
  appraisalReason:     { fontSize:14, color:C.sepia, lineHeight:1.7, fontStyle:"italic" },

  appraisalSection:    { display:"flex", flexDirection:"column", gap:12 },
  appraisalSectionTitle:{ fontSize:11, letterSpacing:"0.16em", textTransform:"uppercase", color:C.bronze, fontFamily:"sans-serif" },

  // Evidence detected — chip cloud
  clueCloud:      { display:"flex", flexWrap:"wrap", gap:8 },
  clueChip:       { fontSize:12, padding:"5px 12px", borderRadius:2, border:"1px solid", fontFamily:"sans-serif", lineHeight:1.4 },
  clueChipNormal: { background:C.card, borderColor:C.divider, color:C.ink },
  clueChipLow:    { background:"#fdfaf4", borderColor:"#e0d4b0", color:C.sepia, opacity:0.8 },
  clueChipLowMark:{ color:C.bronze, fontWeight:700 },
  clueCloudNote:  { fontSize:10, color:"#aaa", fontFamily:"sans-serif", marginTop:2 },

  // Evidence strength grid
  strengthGrid:     { display:"flex", flexDirection:"column", gap:8 },
  strengthRow:      { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.divider}` },
  strengthRowLabel: { fontSize:13, color:C.ink },
  strengthBadge:    { fontSize:11, padding:"3px 12px", borderRadius:2, border:"1px solid", fontFamily:"sans-serif", letterSpacing:"0.06em", fontWeight:600 },

  // Conflicting signals
  conflictSignalList: { listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:8 },
  conflictSignalItem: { display:"flex", alignItems:"flex-start", gap:10, fontSize:13, color:C.sepia, lineHeight:1.6 },
  conflictSignalDot:  { color:"#c8903a", flexShrink:0, marginTop:2, fontSize:11 },

  // What would improve confidence
  improvementList: { listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:9 },
  improvementItem: { display:"flex", alignItems:"flex-start", gap:10, fontSize:13, color:C.sepia, lineHeight:1.6, fontFamily:"'Georgia',serif" },
  improvementIcon: { color:C.sage, flexShrink:0, fontWeight:700, marginTop:1, fontSize:13, fontFamily:"sans-serif" },
  metaBadge:   { fontSize:11, background:C.card, border:`1px solid ${C.divider}`, color:C.sepia, padding:"4px 12px", borderRadius:2, fontFamily:"sans-serif", letterSpacing:"0.05em" },
  metaBadgeDark:{ background:C.ink, color:C.parchment, border:"none" },
  metaBadgeClass:{ background:"#eef2eb", borderColor:"#b5c4ae", color:C.sage },
  metaBadgeWarn:{ background:"#fdf0ec", borderColor:"#e8b090", color:C.rust },
  tabBar:      { display:"flex", overflowX:"auto", borderBottom:`1px solid ${C.divider}`, marginBottom:24, WebkitOverflowScrolling:"touch" },
  tabBtn:      { background:"none", border:"none", padding:"11px 18px", fontSize:13, letterSpacing:"0.05em", cursor:"pointer", color:C.sepia, fontFamily:"sans-serif", borderBottom:"2px solid transparent", whiteSpace:"nowrap", flexShrink:0 },
  tabActive:   { color:C.ink, borderBottomColor:C.ink },
  tabContent:  { display:"flex", flexDirection:"column", gap:20 },
  quadGrid:    { display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 },
  quadCard:    { background:C.card, border:`1px solid ${C.divider}`, padding:"16px 18px", borderRadius:4 },
  quadLabel:   { fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:C.bronze, marginBottom:5, fontFamily:"sans-serif" },
  quadVal:     { fontSize:15, color:C.ink, lineHeight:1.3 },
  block:       { background:C.card, border:`1px solid ${C.divider}`, padding:"18px 20px", borderRadius:4 },
  blockTitle:  { fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:C.bronze, marginBottom:12, fontFamily:"sans-serif" },
  evidList:    { listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:7 },
  evidItem:    { display:"flex", alignItems:"flex-start", gap:8, fontSize:13, lineHeight:1.6 },
  dotGreen:    { color:C.sage, flexShrink:0, marginTop:2 },
  dotAmber:    { color:C.rust, flexShrink:0, marginTop:2 },
  summaryPara: { fontSize:13, lineHeight:1.8, color:C.sepia, margin:0 },
  scoreGrid:   { display:"flex", flexDirection:"column", gap:10 },
  scoreRow:    { display:"flex", alignItems:"center", gap:10 },
  scoreLabel:  { width:110, fontSize:11, color:C.sepia, fontFamily:"sans-serif", flexShrink:0 },
  scoreBarWrap:{ flex:1, height:5, background:C.divider, borderRadius:3, overflow:"hidden" },
  scoreBarFill:{ height:"100%", background:C.bronze, borderRadius:3, transition:"width 0.6s" },
  scoreBarNeg: { background:C.rust },
  scoreNums:   { width:64, textAlign:"right", fontSize:11, fontFamily:"monospace", color:C.sepia },
  scoreOpp:    { color:"#bbb" },
  scoreTotalRow:{ display:"flex", justifyContent:"space-between", borderTop:`1px solid ${C.divider}`, paddingTop:9, marginTop:3, fontSize:12, color:C.ink },
  scoreTotalVal:{ fontWeight:700, color:C.bronze, fontFamily:"monospace" },
  evidField:   { marginBottom:9, fontSize:12 },
  evidKey:     { fontWeight:600, color:C.sepia, fontFamily:"sans-serif", fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase", marginRight:5 },
  evidVal:     { color:C.ink },
  subList:     { margin:"4px 0 0 12px", padding:0, listStyle:"disc", color:C.sepia },
  subItem:     { fontSize:11, lineHeight:1.6, marginBottom:2 },
  hwTable:     { marginTop:10, border:`1px solid ${C.divider}`, borderRadius:2, overflow:"hidden" },
  hwHead:      { display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr", gap:6, padding:"6px 10px", background:C.parchment, fontSize:9, letterSpacing:"0.1em", color:C.sepia, fontFamily:"sans-serif", textTransform:"uppercase" },
  hwRow:       { display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr", gap:6, padding:"8px 10px", borderTop:`1px solid ${C.divider}`, fontSize:11 },
  conflictCard:{ background:"#fef9f4", border:`1px solid #e8d5b8`, borderRadius:2, padding:"12px 14px", marginBottom:9 },
  conflictTypeTag:{ fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:C.bronze, fontFamily:"sans-serif", marginBottom:5 },
  conflictText:{ fontSize:12, color:C.ink, marginBottom:4, lineHeight:1.5 },
  conflictResolution:{ fontSize:12, color:C.sepia, marginBottom:3, lineHeight:1.5, fontStyle:"italic" },
  conflictRecovery:{ fontSize:11, color:C.sage, fontFamily:"sans-serif", marginBottom:5 },
  conflictFooter:{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginTop:5 },
  conflictStatus:{ fontSize:10, color:"#aaa", fontFamily:"sans-serif" },
  severityChip:{ fontSize:9, padding:"2px 7px", borderRadius:2, border:"1px solid", fontFamily:"sans-serif", letterSpacing:"0.06em" },
  adjustmentText:{ fontSize:10, color:"#aaa", fontFamily:"monospace" },
  resolvedChip:{ fontSize:10, color:C.sage, fontFamily:"sans-serif", marginLeft:"auto" },
  unresolvedChip:{ fontSize:10, color:C.rust, fontFamily:"sans-serif", marginLeft:"auto" },
  priorityRow: { display:"flex", alignItems:"flex-start", gap:10, padding:"5px 0", borderBottom:`1px solid ${C.divider}` },
  priorityRank:{ width:24, fontSize:10, color:"#aaa", fontFamily:"monospace", flexShrink:0 },
  priorityTier:{ width:140, fontSize:10, color:C.bronze, fontFamily:"sans-serif", flexShrink:0 },
  priorityFinding:{ fontSize:12, color:C.ink, lineHeight:1.5 },
  stageBlock:  { background:C.card, border:`1px solid ${C.divider}`, borderRadius:4, overflow:"hidden", marginBottom:10 },
  stageHead:   { display:"flex", alignItems:"center", gap:10, padding:"11px 16px", borderBottom:`1px solid ${C.divider}`, background:C.parchment },
  stageNum:    { width:24, height:24, borderRadius:"50%", background:C.ink, color:C.parchment, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontFamily:"monospace", flexShrink:0 },
  stageLabel:  { fontSize:12, fontWeight:600, fontFamily:"sans-serif", color:C.ink },
  stageNote:   { fontSize:9, color:"#aaa", fontFamily:"sans-serif", marginTop:1 },
  skippedChip: { marginLeft:"auto", fontSize:10, color:"#aaa", fontFamily:"sans-serif", fontStyle:"italic" },
  stageJson:   { padding:"12px 16px", margin:0, fontSize:10, lineHeight:1.55, color:C.sepia, overflowX:"auto", fontFamily:"monospace", background:"transparent" },
  provisionalBanner:{ background:"#fdf0ec", border:`1px solid #e8b090`, color:C.rust, padding:"9px 14px", borderRadius:2, fontSize:12, fontFamily:"sans-serif", marginBottom:14 },
  valGrid:     { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 },
  valCard:     { background:C.card, border:`1px solid ${C.divider}`, padding:"16px 18px", borderRadius:4 },
  valLane:     { fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:C.bronze, marginBottom:5, fontFamily:"sans-serif" },
  valRange:    { fontSize:20, color:C.ink, marginBottom:6 },
  valRationale:{ fontSize:11, color:C.sepia, lineHeight:1.6, fontFamily:"sans-serif" },
  reportFooter:{ marginTop:36, borderTop:`1px solid ${C.divider}`, paddingTop:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 },
  newCaseBtn:  { background:"none", border:`1px solid ${C.divider}`, padding:"9px 16px", fontSize:13, cursor:"pointer", color:C.sepia, fontFamily:"'Georgia',serif", borderRadius:2 },
  footerNote:  { fontSize:10, color:C.divider, fontFamily:"sans-serif" },
  vsSummaryRow:    { display:"flex", gap:10, marginBottom:12, flexWrap:"wrap" },
  vsStatBox:       { flex:"1 1 70px", background:C.parchment, border:`1px solid ${C.divider}`, borderRadius:3, padding:"10px 14px", textAlign:"center" },
  vsStatBoxWarn:   { background:"#fdf0ec", borderColor:"#e8b090" },
  vsStatNum:       { fontSize:20, fontWeight:400, color:C.ink, marginBottom:2 },
  vsStatLabel:     { fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:C.sepia, fontFamily:"sans-serif" },
  vsNonDestructive:{ fontSize:10, color:C.sage, fontFamily:"sans-serif", fontStyle:"italic", marginTop:7 },
  hardNegRow:      { display:"flex", alignItems:"center", gap:12, padding:"7px 0", borderBottom:`1px solid ${C.divider}`, flexWrap:"wrap" },
  hardNegClue:     { fontSize:12, color:C.rust, fontFamily:"monospace", minWidth:160 },
  hardNegConf:     { fontSize:11, color:C.sepia, fontFamily:"monospace" },
  hardNegRegion:   { fontSize:10, color:"#aaa", fontFamily:"sans-serif", marginLeft:"auto" },
  vsObsHeader:     { display:"flex", gap:6, padding:"5px 0", borderBottom:`1px solid ${C.divider}`, fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:C.sepia, fontFamily:"sans-serif", marginBottom:3 },
  vsObsRow:        { display:"flex", alignItems:"flex-start", gap:6, padding:"7px 0", borderBottom:`1px solid ${C.divider}` },
  vsObsRowReviewed:{ background:"#f5fbf4" },
  vsObsClue:       { fontSize:11, color:C.bronze, fontFamily:"monospace", flexShrink:0 },
  vsObsText:       { fontSize:11, color:C.ink, lineHeight:1.5 },
  vsObsNum:        { fontSize:11, fontFamily:"monospace", flexShrink:0, textAlign:"right" },
  vsObsRegion:     { fontSize:10, color:"#aaa", fontFamily:"sans-serif", flexShrink:0 },
  vsReviewedTag:   { fontSize:11, marginLeft:3, flexShrink:0 },
  warnText:        { color:C.rust },
  imageCount:      { fontSize:11, color:C.sepia, fontFamily:"sans-serif" },
};
