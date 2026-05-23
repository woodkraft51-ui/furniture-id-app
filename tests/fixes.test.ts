import { test } from "node:test";
import assert from "node:assert/strict";

import { buildDatingOverlap } from "../lib/engineDatingOverlap";
import { reconcileFinalStyle } from "../lib/engineStyleReconciliation";
import { evaluateSubtype } from "../lib/engineFormEvaluators";
import {
  pickNamePrefixStyle,
  subtypeDisjointFromDating,
  isWoodPrimary,
  falseTwinMaterialsToSuppress,
  canonicalClueKey,
  commodeEvidencePresent,
} from "../lib/engineReportHelpers";
import { COMMODE_RUNS } from "./fixtures/commodeRuns";
import { buildEvidenceDigest, buildFrameDigest, scoreForms } from "../lib/engine";

const woodLayer = (clues: any[]) =>
  buildDatingOverlap(clues, null, [], null).layers.find((l) => l.layer === "wood")!;

// ── Fix #1: metal/glass material clues must not date the wood layer ─────────
test("Fix #1: a metal material clue alone produces NO wood date band", () => {
  const wood = woodLayer([{ clue: "brass_frame", category: "materials", date_hint: "1900-1930" }]);
  assert.equal(wood.date_floor, null);
  assert.equal(wood.date_ceiling, null);
  assert.ok(wood.undated_clues.includes("brass_frame"));
  assert.equal(wood.present_without_dates, 1);
});

test("Fix #1: a real wood clue dates the layer; the metal clue stays parked", () => {
  const wood = woodLayer([
    { clue: "brass_frame", category: "materials", date_hint: "1900-1930" },
    { clue: "oak", category: "materials", date_hint: "1880-1920" },
  ]);
  assert.equal(wood.date_floor, 1880);
  assert.equal(wood.date_ceiling, 1920);
  assert.ok(wood.source_clues.includes("oak"));
  assert.ok(!wood.source_clues.includes("brass_frame"));
  assert.ok(wood.undated_clues.includes("brass_frame"));
});

// ── Fix #5: "overlaps" vs "falls within" wording in reconciliation ──────────
const baseReconcile = {
  styleWaves: [],
  bestIntersection: null,
  styleContext: null,
  hasImpossiblePair: false,
};

test("Fix #5: a partial overlap says 'overlaps', not 'falls within'", () => {
  const r = reconcileFinalStyle({
    ...baseReconcile,
    styleAttribution: { name: "Art Nouveau", date_floor: 1895, date_ceiling: 1930, style_family_id: "x" } as any,
    finalDatingFloor: 1925,
    finalDatingCeiling: 1975,
  });
  assert.equal(r.kind, "original_period");
  assert.match(r.final_style_reason, /overlaps/);
  assert.doesNotMatch(r.final_style_reason, /falls within/);
});

test("Fix #5: a contained range says 'falls within'", () => {
  const r = reconcileFinalStyle({
    ...baseReconcile,
    styleAttribution: { name: "Victorian", date_floor: 1850, date_ceiling: 1950, style_family_id: "x" } as any,
    finalDatingFloor: 1900,
    finalDatingCeiling: 1910,
  });
  assert.equal(r.kind, "original_period");
  assert.match(r.final_style_reason, /falls within/);
});

// ── Fix #3 (dates): evaluateSubtype returns the subtype's date bounds ────────
test("Fix #3: evaluateSubtype populates date_floor/date_ceiling from the subtype", () => {
  const r = evaluateSubtype("form_chest_of_drawers", [
    "Hybrid chest combining a lift-top blanket-chest upper compartment over one or more drawers in the lower section.",
  ]);
  assert.ok(r, "expected a subtype assignment");
  assert.equal(r!.subtype_id, "subtype_mule_chest");
  assert.equal(r!.date_floor, 1700);
  assert.equal(r!.date_ceiling, 1850);
});

// ── Fix #2: only a supported style attribution may prefix the form name ─────
test("Fix #2: pickNamePrefixStyle returns the attribution name", () => {
  assert.equal(pickNamePrefixStyle({ name: "Empire" }), "Empire");
});

test("Fix #2: pickNamePrefixStyle returns null without an attribution", () => {
  assert.equal(pickNamePrefixStyle(null), null);
  assert.equal(pickNamePrefixStyle({ name: "" }), null);
  assert.equal(pickNamePrefixStyle(undefined), null);
});

// ── Fix #3 (gate): drop a subtype whose window is disjoint from the dating ──
test("Fix #3 gate: a disjoint subtype window is flagged for dropping", () => {
  assert.equal(subtypeDisjointFromDating({ date_floor: 1700, date_ceiling: 1850 }, 1890, 1920), true);
  assert.equal(subtypeDisjointFromDating({ date_floor: 1980, date_ceiling: 2000 }, 1890, 1920), true);
});

test("Fix #3 gate: an overlapping subtype window is kept", () => {
  assert.equal(subtypeDisjointFromDating({ date_floor: 1700, date_ceiling: 1850 }, 1800, 1900), false);
});

test("Fix #3 gate: missing subtype or non-numeric dating is never disjoint", () => {
  assert.equal(subtypeDisjointFromDating(null, 1890, 1920), false);
  assert.equal(subtypeDisjointFromDating({ date_floor: 1700, date_ceiling: 1850 }, null, 1920), false);
  assert.equal(subtypeDisjointFromDating({ date_floor: null, date_ceiling: null }, 1890, 1920), false);
});

test("Fix #3 gate: an open-ended subtype window outside the frame is dropped", () => {
  // run-5 brass-bed revival: [1970, ∞) on a 1900–1930 frame — null ceiling
  assert.equal(subtypeDisjointFromDating({ date_floor: 1970, date_ceiling: null }, 1900, 1930), true);
  // (−∞, 1850] on a 1900–1930 frame — null floor
  assert.equal(subtypeDisjointFromDating({ date_floor: null, date_ceiling: 1850 }, 1900, 1930), true);
});

test("Fix #3 gate: an open-ended subtype that still overlaps is kept", () => {
  assert.equal(subtypeDisjointFromDating({ date_floor: 1920, date_ceiling: null }, 1900, 1930), false);
  assert.equal(subtypeDisjointFromDating({ date_floor: null, date_ceiling: 1925 }, 1900, 1930), false);
});

// ── Fix #4a: wood-primary suppresses metal-furniture tips ───────────────────
test("Fix #4a: a wood_species_* clue marks the piece wood-primary", () => {
  assert.equal(isWoodPrimary(new Set(["wood_species_oak", "metal_frame"])), true);
});

test("Fix #4a: a solid-wood construction marker marks the piece wood-primary", () => {
  assert.equal(isWoodPrimary(new Set(["solid_wood_construction"])), true);
});

test("Fix #4a: a metal-only piece is NOT wood-primary (tips show)", () => {
  assert.equal(isWoodPrimary(new Set(["metal_frame", "tubular_steel"])), false);
  assert.equal(isWoodPrimary([]), false);
});

// ── Phase 2: false-twin metal-frame guard ───────────────────────────────────
test("Phase 2: false-twin frame keys are suppressed on a wood-primary piece", () => {
  const got = falseTwinMaterialsToSuppress([
    "solid_wood_construction", "wood_species_oak_group", "butt_hinge", "brass_frame", "tubular_steel",
  ]).sort();
  assert.deepEqual(got, ["brass_frame", "tubular_steel"]);
});

test("Phase 2: a genuine metal piece keeps its frame keys (not wood-primary)", () => {
  assert.deepEqual(falseTwinMaterialsToSuppress(["metal_frame", "tubular_steel", "chrome_frame"]), []);
});

test("Phase 2: no false twins present → nothing suppressed", () => {
  assert.deepEqual(falseTwinMaterialsToSuppress(["solid_wood_construction", "butt_hinge"]), []);
});

test("Phase 2: guard fires on all 5 real commode runs (brass_frame always, twins removed)", () => {
  for (const run of COMMODE_RUNS) {
    assert.ok(isWoodPrimary(run.clueKeys), `run ${run.run} should be wood-primary`);
    const suppress = new Set(falseTwinMaterialsToSuppress(run.clueKeys));
    // brass_frame fired in every run and must be suppressed
    assert.ok(suppress.has("brass_frame"), `run ${run.run} should suppress brass_frame`);
    // tubular_steel only when it was emitted
    assert.equal(
      suppress.has("tubular_steel"),
      run.clueKeys.includes("tubular_steel"),
      `run ${run.run} tubular_steel suppression should match emission`
    );
    // the de-twinned key set keeps the real evidence and drops the twins
    const kept = run.clueKeys.filter((k) => !suppress.has(k));
    assert.ok(!kept.includes("brass_frame") && !kept.includes("tubular_steel"));
    assert.ok(kept.includes("solid_wood_construction"));
    assert.ok(kept.some((k) => k.includes("commode")), `run ${run.run} keeps a commode key`);
  }
});

// ── Phase 3: clue-key canonicalization ──────────────────────────────────────
test("Phase 3: synonym variants map to one canonical key; unknowns pass through", () => {
  assert.equal(canonicalClueKey("commode_chamber_pot_function"), "commode_function");
  assert.equal(canonicalClueKey("commode_close_stool_function"), "commode_function");
  assert.equal(canonicalClueKey("victorian_utility_commode"), "victorian_commode_form");
  assert.equal(canonicalClueKey("circular_cutout_platform"), "circular_aperture_seat_board");
  assert.equal(canonicalClueKey("brass_lid_catch_or_bracket"), "stamped_metal_bracket");
  assert.equal(canonicalClueKey("label_text_full"), "visible_text");
  // canonical targets and unknowns are returned unchanged
  assert.equal(canonicalClueKey("commode_function"), "commode_function");
  assert.equal(canonicalClueKey("some_unrelated_key"), "some_unrelated_key");
});

test("Phase 3: canonicalization makes the commode-identity keys 5/5 across runs", () => {
  const canon = (run: { clueKeys: string[] }) => new Set(run.clueKeys.map(canonicalClueKey));
  for (const key of ["commode_function", "victorian_commode_form", "circular_aperture_seat_board"]) {
    for (const run of COMMODE_RUNS) {
      assert.ok(canon(run).has(key), `run ${run.run} should yield ${key} after canonicalization`);
    }
  }
});

test("Phase 3: canonicalization recovers the recognized dated/label keys in every run", () => {
  const canon = (run: { clueKeys: string[] }) => new Set(run.clueKeys.map(canonicalClueKey));
  // stamped_metal_bracket (post-1900) — run 2 emitted brass_lid_catch_or_bracket
  // visible_text — runs coined visible_text_us_standard / label_text_full / visible_text_label
  for (const key of ["stamped_metal_bracket", "visible_text"]) {
    for (const run of COMMODE_RUNS) {
      assert.ok(canon(run).has(key), `run ${run.run} should yield ${key} after canonicalization`);
    }
  }
});

// ── Phase 4: commode form routing (end-to-end through scoreForms) ────────────
test("Phase 4: commodeEvidencePresent fires on every run's canonicalized keys", () => {
  for (const run of COMMODE_RUNS) {
    const canon = run.clueKeys.map(canonicalClueKey);
    assert.ok(commodeEvidencePresent(canon), `run ${run.run} should read as a commode`);
  }
  // a plain stool (seating, no aperture/commode-function) does not
  assert.equal(commodeEvidencePresent(["seating_surface", "seating_present", "bun_feet"]), false);
});

// Build a faithful digest from a run's clue keys: each key becomes an
// observation, and the commode/close-stool key carries the diagnostic
// "close stool" prose (which otherwise trips the plain "Stool" text-match).
function digestFromRun(clueKeys: string[]) {
  const observations = clueKeys.map((k) => ({
    type: "construction",
    clue: k,
    description: /commode|close_stool/.test(k)
      ? "Victorian close stool / commode with a fitted chamber-pot basin"
      : k.replace(/_/g, " "),
    confidence: 70,
    negated: false,
  }));
  return buildFrameDigest(buildEvidenceDigest(observations as any));
}

test("Phase 4: the commode wins end-to-end on all 5 runs (not Stool, not Brass bed)", () => {
  for (const run of COMMODE_RUNS) {
    const ranked = scoreForms(digestFromRun(run.clueKeys));
    const best = ranked.find((r) => r.form_id !== null);
    assert.equal(
      best?.form_id,
      "form_commode",
      `run ${run.run} should resolve to form_commode (got ${best?.form_id} / "${best?.form}")`
    );
    // the false-twin / text-artifact forms must not appear as a resolved pick
    assert.ok(!ranked.some((r) => r.form_id === "form_stool"), `run ${run.run} must not score Stool`);
    assert.ok(!ranked.some((r) => r.form_id === "form_iron_bed"), `run ${run.run} must not score Brass bed`);
  }
});
