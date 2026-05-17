/**
 * scripts/trace.ts — Block 0.55 diagnostic harness
 *
 * Drives PE.runAllPhases deterministically against a fabricated fixture.
 * Stubs PE.callClaude so no real LLM call happens. Outputs stage_outputs,
 * final_report, evidence_digest, observations, and field_scan as readable
 * JSON to stdout. Supports --piece <name> for future fixture loading from
 * scripts/trace-fixtures/ (Block 0.6 will populate; for now falls back to
 * the hardcoded placeholder).
 *
 * Expected invocation (once node_modules is present):
 *   npx ts-node scripts/trace.ts
 *   npx ts-node scripts/trace.ts --piece roos_cedar_chest
 *
 * Block 0.6 enabler: provides clean baseline trace capability.
 */

import { PE } from "../lib/engine";
import { API } from "../lib/store";

// Node global declaration — avoids @types/node hard dependency in sandbox.
declare const process: { argv: string[]; exit: (code: number) => void } | undefined;

type Fixture = {
  caseData: { id: string };
  images: Array<{ data_url: string; image_type: string; name?: string }>;
  intake: any;
  perceptionStub: any;
};

const BASE_INTAKE = {
  analysis_mode: "full_analysis",
  asking_price: "",
  approximate_height: "",
  approximate_width: "",
  primary_wood_guess: "",
  where_acquired: "",
  known_provenance: "",
  known_alterations: "",
  user_category_guess: "",
  condition_notes: "",
  notes: "",
  has_drawers: false,
  has_doors: false,
  folds_or_expands: false,
  has_mechanical_parts: false,
  suggests_prior_function: false,
};

const BASE_PERCEPTION = {
  labels: [],
  maker_names: [],
  materials: [],
  forms: [],
  functional_features: [],
  style_cues: [],
  construction_cues: [],
  condition_cues: [],
  visible_text: [],
  raw_text: "trace fixture (no real LLM call)",
};

const obs = (clue: string, description: string, confidence = 80) => ({
  clue,
  description,
  confidence,
  source_image: "trace",
});

const PLACEHOLDER_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-placeholder" },
  images: [{ data_url: "data:image/png;base64,", image_type: "label", name: "placeholder.png" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "cedar", user_category_guess: "blanket_chest" },
  perceptionStub: { perception: BASE_PERCEPTION, observations: [] },
};

// Fixture 1: Roos cedar chest — exercises label + cedar_lining + lift_lid branches in scoreForms
const ROOS_CEDAR_CHEST_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-roos-cedar-chest" },
  images: [{ data_url: "data:image/png;base64,", image_type: "label" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "cedar", user_category_guess: "blanket_chest",
            known_provenance: "Roos paper label visible on lid interior" },
  perceptionStub: {
    perception: { ...BASE_PERCEPTION, raw_text: "Roos Sweetheart label; cedar-lined chest with hinged lift-lid" },
    observations: [
      obs("roos_label", "Roos Sweetheart paper label visible on interior", 95),
      obs("cedar_lining", "Cedar-lined interior throughout", 90),
      obs("lift_lid", "Hinged lift-top construction", 88),
    ],
  },
};

// Fixture 2: Eastlake dresser — exercises victorian_eastlake_pattern + multiple_drawer_case branches
const EASTLAKE_DRESSER_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-eastlake-dresser" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "walnut", user_category_guess: "dresser", has_drawers: true,
            condition_notes: "incised geometric carving on drawer fronts; original brass eastlake pulls" },
  perceptionStub: {
    perception: { ...BASE_PERCEPTION, raw_text: "Walnut chest of drawers with incised geometric carving and Eastlake pulls" },
    observations: [
      obs("victorian_eastlake_pattern", "Incised geometric carving consistent with Eastlake aesthetic c. 1870-1890", 85),
      obs("multiple_drawer_case", "Stacked drawer case construction", 90),
      obs("eastlake_pull", "Geometric incised brass Eastlake-style pulls", 80),
      obs("machine_dovetails", "Uniform machine-cut dovetails visible on drawer sides", 85),
    ],
  },
};

// Fixture 3: Plywood "Federal" reproduction — exercises HARD NEGATIVE conflict + Federal style branches
const PLYWOOD_FEDERAL_REPRO_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-plywood-federal-repro" },
  images: [{ data_url: "data:image/png;base64,", image_type: "drawer" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "mahogany", user_category_guess: "chest_of_drawers", has_drawers: true,
            known_provenance: "seller claims Federal period c. 1810; pulls appear period-correct" },
  perceptionStub: {
    perception: { ...BASE_PERCEPTION, raw_text: "Mahogany case with reeded columns; plywood drawer bottoms visible" },
    observations: [
      obs("plywood_drawer_bottom", "Plywood drawer bottoms visible on multiple drawers", 95),
      obs("federal_hepplewhite_sheraton_pattern", "Reeded columns and inlaid stringing consistent with Federal styling", 75),
      obs("multiple_drawer_case", "Stacked drawer case", 90),
      obs("phillips_screw", "Phillips-head screws securing drawer slides", 95),
    ],
  },
};

// Fixture 4: Pre-1860 piece — exercises hand-cut dovetails + cut nails + hand-forged hardware
// Should fire early-construction path; date envelope should anchor pre-1860 with high confidence
const PRE_1860_PIECE_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-pre-1860-piece" },
  images: [{ data_url: "data:image/png;base64,", image_type: "drawer" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "cherry", user_category_guess: "chest_of_drawers", has_drawers: true,
            known_provenance: "estate find; family history suggests early-to-mid 19th century",
            condition_notes: "irregular hand-cut dovetails; hand-forged nails throughout; chamfered drawer bottoms" },
  perceptionStub: {
    perception: { ...BASE_PERCEPTION, raw_text: "Cherry chest of drawers; irregular hand-cut dovetails; hand-forged nails; chamfered solid-board drawer bottoms" },
    observations: [
      obs("hand_cut_dovetails", "Irregular hand-cut dovetails with uneven angles on drawer sides", 92),
      obs("hand_forged_nail", "Square hand-forged nail heads visible on drawer-front attachment", 88),
      obs("cut_nail", "Tapered rectangular cut nails on back panel", 85),
      obs("multiple_drawer_case", "Three-drawer stacked case construction", 90),
      obs("pit_saw_marks", "Diagonal pit-saw marks on secondary surfaces", 80),
    ],
  },
};

// Fixture 5: MCM molded plastic chair — exercises material-gate logic (plastic → post-1945)
// Should fire material-primary-plastic gate; date locks to c. 1945+ regardless of other signals
const MCM_PLASTIC_CHAIR_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-mcm-plastic-chair" },
  images: [{ data_url: "data:image/png;base64,", image_type: "side" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "", user_category_guess: "chair",
            condition_notes: "single-piece molded plastic seat-back; chrome tubular legs; no upholstery" },
  perceptionStub: {
    perception: { ...BASE_PERCEPTION, raw_text: "Molded plastic shell chair with chrome tubular base, mid-century modernist design" },
    observations: [
      obs("molded_plastic", "Single-piece molded plastic seat and backrest shell", 95),
      obs("tubular_steel", "Chrome-plated tubular steel base", 90),
      obs("seating_present", "Seat surface present", 95),
      obs("backrest_present", "Backrest present", 95),
      obs("mcm_structural_pattern", "Mid-century modernist design language", 80),
    ],
  },
};

// Fixture 6: Colonial Revival tub/lounge chair misdiagnosed as a telephone
// bench + Louis XVI + MCM. Synthesized from a real diagnostic trace
// (May 2026) that surfaced four engine bugs simultaneously:
//   - Form: telephone_stand winning over armchair (composite-pattern
//     threshold fired on seating + secondary_surface alone)
//   - Form subtype: telephone_cabinet at confidence 1.0 with
//     matched_attributes: [] (subtype scoring did not require ≥1 match)
//   - Style: Louis XVI / French Neoclassical (1770–1830) winning over
//     Colonial Revival because "revival" was stopword-filtered and the
//     `neoclassical` token anchored to the original-period family
//   - Style waves: MCM waves firing on a false CNC-derived date hint
//     because the 2-of-N gate effectively required only one of
//     {date overlap, design signal} (Layer 1 was pushed unconditionally)
//   - Dating overlap: reversed envelopes (e.g., finish 1880–1830)
//     flowing through parseRangeToNumeric without normalization
// Expected post-fix behavior:
//   - form attribution = form_armchair (telephone-bench vetoed by armchair_form)
//   - colonial_revival_pattern synthesized; Louis XVI penalized
//   - no MCM waves with empty matched signals
//   - shellac_intact envelope normalized to 1830–1880, not 1880–1830
const COLONIAL_REVIVAL_LOUNGE_CHAIR_MISDIAGNOSED_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-colonial-revival-lounge-chair-misdiagnosed" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: {
    ...BASE_INTAKE,
    primary_wood_guess: "walnut",
    user_category_guess: "chair",
    condition_notes:
      "tufted velvet upholstery; cane side panels; tapered front legs with block corners; decorative rosette applique blocks at arm terminals; possible incised maker mark near back rail; OCR picked up 'CNC' text on a faded paper label",
  },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Walnut tub/barrel-back armchair with full upholstery, button-tufted velvet seat and back, cane-paneled sides, square tapered front legs with block-corner detail and decorative rosette applique. Possible incised maker mark partially legible. Faded paper label includes the letters 'CNC'.",
    },
    observations: [
      obs("seating_surface", "Loose tufted seat cushion present within a framed wooden seat platform; clearly a seating form", 95),
      obs("backrest_present", "Upholstered backrest present", 95),
      obs("armchair_form", "Full upholstered arms continuing to flared arm terminals; classic armchair form", 92),
      obs("barrel_tub_back", "Curved continuous barrel/tub back rail wraps from one arm around through back", 90),
      obs("cane_panel_sides", "Both side panels feature woven cane in open hexagonal weave; machine-pressed sheet cane appearance", 85),
      obs("pressed_sheet_cane", "Machine-pressed sheet cane with regular geometric repeat", 85),
      obs("tapered_legs", "Square-section tapered front legs with incised panel carving near top", 88),
      obs("block_corner_detail", "Block-corner detail at the junction of arm and leg", 82),
      obs("decorative_rosette_applique", "Carved rosette applique blocks at arm terminals", 84),
      obs("neoclassical_revival_cues", "Tapered legs + rosette applique + block corners read as neoclassical revival vocabulary", 80),
      obs("possible_maker_mark_incised", "Possible incised maker mark partially legible near back rail", 60),
      obs("velvet_cover", "Velvet upholstery cover on seat, back, and arms", 90),
      obs("button_tufting", "Button-tufted back and seat cushion", 88),
      obs("foam_padding", "Foam padding under velvet cover (modern foam compression)", 75),
      obs("arm_upholstery", "Full upholstered arms", 92),
      obs("wood_species_walnut_group", "Visible frame wood reads as walnut group", 80),
      obs("shellac_intact", "Shellac finish appears intact on exposed wood", 70),
      obs("wear_at_arm_terminals", "Wear and minor abrasion at arm terminals consistent with use", 70),
      obs("fully_upholstered", "Frame is fully upholstered; seat, back, and arms covered", 92),
      // The "secondary_surface" observation is what triggered telephone-bench
      // misrouting pre-fix: a small side-attached writing/holding surface was
      // perceived in-frame on the lounge chair photo.
      obs("secondary_surface", "Small flat surface visible adjacent to one arm", 55),
    ],
  },
};

const FIXTURES: Record<string, Fixture> = {
  placeholder: PLACEHOLDER_FIXTURE,
  roos_cedar_chest: ROOS_CEDAR_CHEST_FIXTURE,
  eastlake_dresser: EASTLAKE_DRESSER_FIXTURE,
  plywood_federal_repro: PLYWOOD_FEDERAL_REPRO_FIXTURE,
  pre_1860_piece: PRE_1860_PIECE_FIXTURE,
  mcm_plastic_chair: MCM_PLASTIC_CHAIR_FIXTURE,
  colonial_revival_lounge_chair: COLONIAL_REVIVAL_LOUNGE_CHAIR_MISDIAGNOSED_FIXTURE,
};

function parseArgs(): { piece: string | null; all: boolean } {
  const argv = (typeof process !== "undefined" ? process.argv : []).slice(2);
  let piece: string | null = null;
  let all = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--piece" && argv[i + 1]) {
      piece = String(argv[i + 1]);
      i++;
    } else if (argv[i] === "--all") {
      all = true;
    }
  }
  return { piece, all };
}

function loadFixture(piece: string | null): Fixture {
  if (piece && FIXTURES[piece]) return FIXTURES[piece];
  if (piece) {
    // eslint-disable-next-line no-console
    console.error(`[trace] --piece "${piece}" not found; using placeholder. Available: ${Object.keys(FIXTURES).join(", ")}`);
  }
  return PLACEHOLDER_FIXTURE;
}

async function runFixture(name: string, fixture: Fixture): Promise<any> {
  // Store generates its own case_id; capture it and pass to runAllPhases.
  const { case_id } = (API as any).createCase({ id: fixture.caseData.id });
  const caseData = { ...fixture.caseData, id: case_id };

  (PE as any).callClaude = async (_system: string, _content: any[], _mode: string) => {
    return { ok: true, parsed: fixture.perceptionStub, raw: JSON.stringify(fixture.perceptionStub) };
  };

  const phaseTimings: Array<{ phase: string; elapsed_ms: number; payload_keys: string[] }> = [];
  const t0 = Date.now();
  let lastT = t0;

  const onPhase = (phaseName: string, payload: any) => {
    const now = Date.now();
    const elapsed = now - lastT;
    lastT = now;
    const keys = payload && typeof payload === "object" ? Object.keys(payload) : [];
    phaseTimings.push({ phase: String(phaseName), elapsed_ms: elapsed, payload_keys: keys });
    // eslint-disable-next-line no-console
    console.error(`[trace:${name}] phase=${phaseName} elapsed_ms=${elapsed} keys=${keys.length}`);
  };

  const result: any = await (PE as any).runAllPhases(
    caseData,
    fixture.images,
    fixture.intake,
    onPhase
  );

  return {
    meta: { fixture_piece: name, total_ms: Date.now() - t0, phase_timings: phaseTimings },
    stage_outputs: result?.stage_outputs ?? null,
    final_report: result?.final_report ?? null,
    evidence_digest: result?.stage_outputs?.p0?.evidence_digest ?? null,
    observations: result?.stage_outputs?.p0?.observations ?? null,
    field_scan: result?.field_scan ?? null,
  };
}

async function main(): Promise<void> {
  const { piece, all } = parseArgs();

  if (all) {
    const outputs: Record<string, any> = {};
    for (const name of Object.keys(FIXTURES)) {
      outputs[name] = await runFixture(name, FIXTURES[name]);
    }
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(outputs, null, 2));
    return;
  }

  const name = piece && FIXTURES[piece] ? piece : "placeholder";
  const fixture = loadFixture(piece);
  const output = await runFixture(name, fixture);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(output, null, 2));
}

main().then(
  () => {
    if (typeof process !== "undefined") process.exit(0);
  },
  (err: any) => {
    // eslint-disable-next-line no-console
    console.error("[trace] FATAL:", err && err.stack ? err.stack : err);
    if (typeof process !== "undefined") process.exit(1);
  }
);
