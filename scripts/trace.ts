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

// Node global declaration — avoids @types/node hard dependency in sandbox.
declare const process: { argv: string[]; exit: (code: number) => void } | undefined;

type Fixture = {
  caseData: { id: string };
  images: Array<{ data_url: string; image_type: string; name?: string }>;
  intake: any;
  perceptionStub: any;
};

const PLACEHOLDER_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-0001" },
  images: [
    {
      data_url: "data:image/png;base64,",
      image_type: "label",
      name: "label-placeholder.png",
    },
  ],
  intake: {
    analysis_mode: "full_analysis",
    asking_price: "",
    approximate_height: "",
    approximate_width: "",
    primary_wood_guess: "cedar",
    where_acquired: "",
    known_provenance: "found at estate sale, Roos paper label visible on lid interior",
    known_alterations: "",
    user_category_guess: "blanket_chest",
    condition_notes: "",
    notes: "",
    has_drawers: false,
    has_doors: false,
    folds_or_expands: false,
    has_mechanical_parts: false,
    suggests_prior_function: false,
  },
  // Minimal Phase 0 parsed payload. p0 will fall back to fallback_form if
  // observations is empty, which is fine for a smoke trace.
  perceptionStub: {
    perception: {
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
    },
    observations: [],
  },
};

function parseArgs(): { piece: string | null } {
  const argv = (typeof process !== "undefined" ? process.argv : []).slice(2);
  let piece: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--piece" && argv[i + 1]) {
      piece = String(argv[i + 1]);
      i++;
    }
  }
  return { piece };
}

function loadFixture(piece: string | null): Fixture {
  // Block 0.6 will wire up scripts/trace-fixtures/<piece>.json loading.
  // For now we accept the flag and always fall back to the placeholder.
  if (piece) {
    // eslint-disable-next-line no-console
    console.error(
      `[trace] --piece "${piece}" requested; fixture loader not yet implemented (Block 0.6). Using placeholder.`
    );
  }
  return PLACEHOLDER_FIXTURE;
}

async function main(): Promise<void> {
  const { piece } = parseArgs();
  const fixture = loadFixture(piece);

  // Stub PE.callClaude so the run is deterministic and offline.
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
    console.error(`[trace] phase=${phaseName} elapsed_ms=${elapsed} keys=${keys.length}`);
  };

  const result: any = await (PE as any).runAllPhases(
    fixture.caseData,
    fixture.images,
    fixture.intake,
    onPhase
  );

  const total_ms = Date.now() - t0;

  const output = {
    meta: {
      fixture_piece: piece || "placeholder",
      total_ms,
      phase_timings: phaseTimings,
    },
    stage_outputs: result?.stage_outputs ?? null,
    final_report: result?.final_report ?? null,
    evidence_digest: result?.stage_outputs?.p0?.evidence_digest ?? null,
    observations: result?.stage_outputs?.p0?.observations ?? null,
    field_scan: result?.field_scan ?? null,
  };

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
