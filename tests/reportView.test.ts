import { test } from "node:test";
import assert from "node:assert/strict";
import { PE, promotePerceptionObservations, descriptionNegatesClue } from "../lib/engine";
import { SESSION_SCANS } from "./fixtures/sessionScans";

// Safeguards for the single-source report architecture. The user-facing report
// renders ONLY from `report_view`; these tests prove `report_view` faithfully
// mirrors the reconciled phase outputs, so the user report cannot reclassify,
// out-specify, drop uncertainty, or lose alternatives relative to the engine.

const PROMOTE_DERIVED = new Set(["seating_surface", "seating_present"]);

async function runRaw(fx: any) {
  let observations: any[] = fx.observations.map((o: any) => ({ ...o }));
  const perception: any = fx.perception ?? { raw_text: "" };
  if (fx.rawText) {
    perception.raw_text = fx.rawText;
    observations = promotePerceptionObservations(
      observations.filter((o: any) => !PROMOTE_DERIVED.has(o.clue)),
      perception
    );
  }
  for (const o of observations) o.negated = descriptionNegatesClue(o.clue, o.description);
  (PE as any).p0 = async () => ({ observations, perception, recovered: true });
  const caseData: any = { id: fx.label, images: [], analysis_mode: "full_analysis" };
  return await (PE as any).runAllPhases(caseData, [], fx.intake ?? { analysis_mode: "full_analysis" });
}

for (const fx of SESSION_SCANS) {
  test(`report_view faithful to engine: ${fx.label}`, async () => {
    const r = await runRaw(fx);
    const rv = r.report_view;
    const p2 = r.stage_outputs.p2;
    const p3 = r.stage_outputs.p3;
    const p6 = r.stage_outputs.p6;

    assert.ok(rv, "report_view is present");

    // Identification == the engine's form with the alias tail split off, and is
    // NEVER more specific than the engine form (the user can't out-specify).
    const rawForm: string = p3.display_form || p3.form || "Unknown";
    const stripped = rawForm.replace(/\s*\(also commonly called:[^)]*\)\s*$/i, "").trim();
    assert.equal(rv.identification, stripped, "identification == p3 form (aliases stripped)");
    assert.ok(
      rawForm.startsWith(rv.identification),
      "user identification is a prefix of the engine form (never more specific)"
    );
    // A form absent from the engine cannot appear: identification is derived
    // from p3, so it must be non-empty and equal to the stripped engine form.
    assert.ok(rv.identification.length > 0, "identification is non-empty");

    // Style is the AUTHORITATIVE attribution only — no context fallback / influences.
    assert.equal(rv.style, p3.style_attribution?.name ?? null, "style == style_attribution.name");
    assert.equal(rv.subtype, p3.subtype?.subtype_name ?? null, "subtype == subtype_name");

    // Dating + both confidences track their phases.
    assert.equal(rv.date_range, p2.range || "Unknown", "date_range == p2.range");
    assert.equal(rv.confidence_identification, String(p3.confidence ?? "Inconclusive"));
    assert.equal(rv.confidence_dating, String(p2.confidence ?? "Inconclusive"));

    // Uncertainty is preserved verbatim — never dropped, never invented.
    assert.deepEqual(
      rv.conflicting_evidence,
      Array.isArray(p6.tentative_findings) ? p6.tentative_findings : [],
      "conflicting_evidence == p6.tentative_findings"
    );
    assert.deepEqual(
      rv.next_best_evidence,
      Array.isArray(p6.more_evidence_needed) ? p6.more_evidence_needed : [],
      "next_best_evidence == p6.more_evidence_needed"
    );
    assert.deepEqual(
      rv.supporting_evidence,
      Array.isArray(p6.supported_findings) ? p6.supported_findings : [],
      "supporting_evidence == p6.supported_findings"
    );

    // Alternatives preserved (the UI previously dropped them entirely).
    assert.deepEqual(
      rv.alternatives,
      Array.isArray(p3.alternatives) ? p3.alternatives : [],
      "alternatives == p3.alternatives"
    );

    // Valuation is the engine's authoritative object (never a client recompute).
    assert.equal(rv.valuation, p6.valuation, "valuation is the engine p6.valuation");
  });
}
