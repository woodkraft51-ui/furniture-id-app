import { test } from "node:test";
import assert from "node:assert/strict";

import { buildDatingOverlap } from "../lib/engineDatingOverlap";
import { reconcileFinalStyle } from "../lib/engineStyleReconciliation";
import { evaluateSubtype } from "../lib/engineFormEvaluators";
import {
  pickNamePrefixStyle,
  subtypeDisjointFromDating,
  isWoodPrimary,
} from "../lib/engineReportHelpers";

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
