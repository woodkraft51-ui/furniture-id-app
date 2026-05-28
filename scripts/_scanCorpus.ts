/**
 * Scan-corpus regression harness (dev tool — not app code).
 *
 *   node --import tsx scripts/_scanCorpus.ts            → run all fixtures, print summary + fidelity gate
 *   node --import tsx scripts/_scanCorpus.ts --snapshot → also write baseline JSON
 *   node --import tsx scripts/_scanCorpus.ts --diff     → compare current run to the baseline (fixed/unchanged/regressed)
 *
 * Stubs PE.p0 so runAllPhases runs the deterministic P1–P7 pipeline on the
 * reconstructed observations from each scan's trace. Measures how a CODE change
 * alters outcomes for past scans; cannot predict model (P0) behavior.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { PE, promotePerceptionObservations, descriptionNegatesClue } from "../lib/engine";
import { SESSION_SCANS, type ScanFixture } from "../tests/fixtures/sessionScans";

// Clues synthesized by promotePerceptionObservations — stripped before re-running
// the derivation so a fixture's rawText drives synthesis (lets us validate the
// P0-derivation seating-verb fix, which the p0 stub otherwise bypasses).
const PROMOTE_DERIVED = new Set(["seating_surface", "seating_present"]);

const BASELINE = path.resolve(process.cwd(), "scripts/.scanCorpus.baseline.json");

function findRecon(so: any): any {
  for (const k of Object.keys(so || {})) {
    const v = so[k];
    if (v && typeof v === "object" && (v.final_style_label || v.final_style_reason)) return v;
    if (v?.final_style && (v.final_style.final_style_label || v.final_style.kind)) return v.final_style;
  }
  return so?.p3?.final_style || null;
}

function summarize(result: any) {
  const so = result?.stage_outputs || {};
  const p2 = so.p2 || {};
  const p3 = so.p3 || {};
  const p6 = so.p6 || {};
  const recon = findRecon(so);
  const clueKeys: string[] = result?.evidence_digest?.clue_keys || [];
  const zones = (p6.dating_overlap?.convergence_zones || []).map(
    (z: any) => `${z.date_floor}–${z.date_ceiling}[${z.specific_layer_count ?? z.layer_count}L]`
  );
  return {
    seatingSynth: clueKeys.includes("seating_surface"),
    formId: p3.form ?? p3.form_id ?? p3.best_form ?? null,
    display: p3.display_form ?? p3.display ?? null,
    styleContext: p3.style_context ?? p3.styleContext ?? null,
    styleAttribution: p3.style_attribution?.name ?? null,
    finalStyleLabel: recon?.final_style_label ?? null,
    finalStyleKind: recon?.kind ?? null,
    dateRange: p2.range ?? null,
    dateFloor: p2.date_floor ?? null,
    dateCeiling: p2.date_ceiling ?? null,
    confidence: p2.confidence ?? null,
    convergence: zones,
    // Batch A: surface the upholstery layer + alternative forms so the
    // phantom-upholstery and metal-alt-form fixes are visible in --diff.
    upholsteryId: p2.upholstery_layer?.identification ?? null,
    altForms: (p3.alternatives as string[]) ?? [],
    // T1b: the "Current dating evidence supports X" line must track the final
    // working range (no stale pre-refinement date).
    supportedDate: (so.p6?.supported_findings || []).find((s: string) =>
      /Current dating evidence supports/.test(s)) ?? null,
  };
}

export async function runFixture(fx: ScanFixture) {
  let observations: any[] = fx.observations.map((o) => ({ ...o }));
  const perception: any = fx.perception ?? { raw_text: "" };
  // When a fixture supplies rawText, re-run the P0 seating/spindle derivation on
  // it (after stripping the previously-synthesized clues) so the seating-verb
  // fix is exercised end-to-end rather than bypassed by the p0 stub.
  if ((fx as any).rawText) {
    perception.raw_text = (fx as any).rawText;
    observations = promotePerceptionObservations(
      observations.filter((o) => !PROMOTE_DERIVED.has(o.clue as string)),
      perception
    );
  }
  // Re-derive `negated` exactly as production does (normalizeObservationsFromParsed
  // sets `negated: descriptionNegatesClue(clue, description)` inside p0, which this
  // harness stubs). Without this the corpus uses stale hand-baked flags and is blind
  // to any negation-detection change.
  for (const o of observations) o.negated = descriptionNegatesClue(o.clue, o.description);
  // Stub the model phase; everything downstream is deterministic.
  (PE as any).p0 = async () => ({ observations, perception, recovered: true });
  const caseData: any = { id: fx.label, images: [], analysis_mode: "full_analysis" };
  const result = await (PE as any).runAllPhases(caseData, [], fx.intake ?? { analysis_mode: "full_analysis" });
  return summarize(result);
}

export function fidelity(got: any, asSeen: ScanFixture["asSeen"]) {
  const checks: [string, any, any][] = [
    ["formId", got.formId, asSeen.formId],
    ["dateRange", got.dateRange, asSeen.dateRange],
    ["dateFloor", got.dateFloor, asSeen.dateFloor],
    ["dateCeiling", got.dateCeiling, asSeen.dateCeiling],
    ["confidence", got.confidence, asSeen.confidence],
    ["finalStyleKind", got.finalStyleKind, asSeen.finalStyleKind],
  ];
  const mismatches = checks.filter(([, g, e]) => e != null && String(g) !== String(e));
  return { ok: mismatches.length === 0, mismatches };
}

async function main() {
  const mode = process.argv.includes("--diff") ? "diff" : process.argv.includes("--snapshot") ? "snapshot" : "run";
  const current: Record<string, any> = {};

  for (const fx of SESSION_SCANS) {
    const got = await runFixture(fx);
    current[fx.label] = got;
    console.log(`\n### ${fx.label}`);
    console.log(`   form   : ${got.formId}  |  display: ${got.display}`);
    console.log(`   style  : attr=${got.styleAttribution}  context=${got.styleContext}  final=${got.finalStyleLabel} (${got.finalStyleKind})`);
    console.log(`   date   : ${got.dateRange}  [floor ${got.dateFloor} / ceil ${got.dateCeiling}]  conf=${got.confidence}`);
    console.log(`   zones  : ${got.convergence.join(", ") || "none"}  |  seating_surface synth: ${got.seatingSynth}`);
    const fid = fidelity(got, fx.asSeen);
    if (fid.ok) {
      console.log(`   FIDELITY: ✓ reproduces as-seen`);
    } else {
      console.log(`   FIDELITY: ✗ diverges — ${fid.mismatches.map(([k, g, e]) => `${k}: got ${g}, expected ${e}`).join(" | ")}`);
    }
  }

  if (mode === "snapshot") {
    fs.writeFileSync(BASELINE, JSON.stringify(current, null, 2));
    console.log(`\n[snapshot written to ${BASELINE}]`);
  } else if (mode === "diff") {
    if (!fs.existsSync(BASELINE)) { console.log("\n[no baseline — run --snapshot first]"); return; }
    const base = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
    console.log(`\n===== DIFF vs baseline =====`);
    for (const fx of SESSION_SCANS) {
      const b = base[fx.label], c = current[fx.label];
      if (!b) { console.log(`  ${fx.label}: (new)`); continue; }
      const changed = JSON.stringify(b) !== JSON.stringify(c);
      console.log(`  ${changed ? "CHANGED" : "unchanged"}: ${fx.label}${changed ? `\n    was: ${b.dateRange} / ${b.finalStyleLabel} / ${b.formId}\n    now: ${c.dateRange} / ${c.finalStyleLabel} / ${c.formId}` : ""}`);
    }
  }
}

// Only run the CLI when invoked directly (node … _scanCorpus.ts), not when
// imported by tests/corpus.test.ts.
const invokedDirectly = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) main().catch((e) => { console.error(e); process.exit(1); });
