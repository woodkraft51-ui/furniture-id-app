import * as PE from "./engine";
const caseStore = {};
let caseCounter  = 1000;
let obsCounter   = 0;

export const API = {
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
