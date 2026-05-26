import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildAuthoredMakers, partitionAuthoredMakers } from "../scripts/generateAuthoredMakers";
import { AUTHORED_MAKER_ENTRIES } from "../lib/constraints/makersAuthored.generated";

import { buildDatingOverlap, refineDatingFromConvergence } from "../lib/engineDatingOverlap";
import { buildDatingFindingNarrative } from "../lib/datingFindingNarrative";
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
import { buildEvidenceDigest, buildFrameDigest, scoreForms, deriveDustCoverClues, parseLabelDate, matchMakerMarks } from "../lib/engine";
import { buildCanonicalVocabulary } from "../scripts/generateCanonicalVocabulary";
import { CANONICAL_VOCABULARY } from "../lib/constraints/canonicalVocabulary.generated";
import { snapToCanonical, isCanonicalKey } from "../lib/engineVocabulary";

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

test("Phase 2: on every real commode run, any emitted metal twin is suppressed and none remain", () => {
  for (const run of COMMODE_RUNS) {
    assert.ok(isWoodPrimary(run.clueKeys), `run ${run.run} should be wood-primary`);
    const suppress = new Set(falseTwinMaterialsToSuppress(run.clueKeys));
    // any false twin that WAS emitted must be suppressed (some runs emit none)
    for (const twin of ["brass_frame", "tubular_steel"]) {
      if (run.clueKeys.includes(twin)) {
        assert.ok(suppress.has(twin), `run ${run.run} should suppress ${twin}`);
      }
    }
    // the de-twinned key set keeps the real evidence and drops the twins
    const kept = run.clueKeys.filter((k) => !suppress.has(k));
    assert.ok(!kept.includes("brass_frame") && !kept.includes("tubular_steel"));
    assert.ok(kept.includes("solid_wood_construction"));
    assert.ok(
      kept.some((k) => /commode|close_stool|chamber_pot|circular/.test(k)),
      `run ${run.run} keeps a commode key`
    );
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
  assert.equal(canonicalClueKey("commode_close_stool_form"), "commode_function");
  assert.equal(canonicalClueKey("circular_cutout_interior"), "circular_aperture_seat_board");
  // canonical targets and unknowns are returned unchanged
  assert.equal(canonicalClueKey("commode_function"), "commode_function");
  assert.equal(canonicalClueKey("some_unrelated_key"), "some_unrelated_key");
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
    description: /commode|close_stool|chamber_pot/.test(k)
      ? "Victorian close stool / commode / night stand with a fitted chamber-pot basin"
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
    // the false-twin / text-artifact / cousin forms must not appear as a resolved pick
    assert.ok(!ranked.some((r) => r.form_id === "form_stool"), `run ${run.run} must not score Stool`);
    assert.ok(!ranked.some((r) => r.form_id === "form_iron_bed"), `run ${run.run} must not score Brass bed`);
    assert.ok(!ranked.some((r) => r.form_id === "form_nightstand"), `run ${run.run} must not score Nightstand`);
  }
});

// ── Stage 1 / Component A: canonical vocabulary generation ───────────────────
test("Vocab: committed artifact is in sync with its sources (drift guard)", () => {
  const rebuilt = buildCanonicalVocabulary();
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(rebuilt)),
    JSON.parse(JSON.stringify(CANONICAL_VOCABULARY)),
    "canonicalVocabulary.generated.ts is stale — run: node --import tsx scripts/generateCanonicalVocabulary.ts"
  );
});

test("Vocab: every scoreForms routing key is covered by the enforce-able vocabulary union", () => {
  const evidenceIds = Object.values(CANONICAL_VOCABULARY.evidence).flat().map((e: any) => e.id);
  const union = new Set<string>([
    ...evidenceIds,
    ...CANONICAL_VOCABULARY.woodEvidenceKeys,
    ...CANONICAL_VOCABULARY.meta.coverageGaps.routingKeysNotInClueLibrary,
  ]);
  for (const key of CANONICAL_VOCABULARY.meta.minedRoutingKeys) {
    assert.ok(union.has(key), `routing key ${key} is not covered by the vocabulary union`);
  }
});

test("Vocab: harvested counts and crosswalk are sane", () => {
  assert.equal(CANONICAL_VOCABULARY.forms.length, CANONICAL_VOCABULARY.meta.counts.forms);
  assert.ok(CANONICAL_VOCABULARY.forms.length > 200, "should have harvested all forms");
  assert.ok(CANONICAL_VOCABULARY.meta.counts.evidenceCategories >= 12, "should have the category taxonomy");
  assert.ok(CANONICAL_VOCABULARY.disqualifying.length > 0, "should harvest disqualifying keys");
  // crosswalk sanity: a clue key with an obvious taxonomy twin resolves to it
  assert.ok(
    (CANONICAL_VOCABULARY.crosswalk as any).shellac_intact?.some((m: any) => m.lib === "finish"),
    "shellac_intact should crosswalk to a finish taxonomy entry"
  );
});

// ── Stage 1 / Component B: snap-to-canonical ingest normalization ────────────
test("Snap: an already-canonical key resolves exactly (with slug normalization)", () => {
  assert.deepEqual(snapToCanonical("commode_function", "function"), { canonical: "commode_function", method: "exact" });
  assert.deepEqual(snapToCanonical("Circular-Aperture-Seat-Board"), { canonical: "circular_aperture_seat_board", method: "exact" });
  assert.equal(isCanonicalKey("commode_function"), true);
  assert.equal(isCanonicalKey("commode_close_stool_form"), false);
});

test("Snap: curated synonyms resolve via the alias layer", () => {
  const cases: [string, string][] = [
    ["commode_close_stool_form", "commode_function"],
    ["chamber_pot_cabinet", "commode_function"],
    ["circular_cutout_interior", "circular_aperture_seat_board"],
    ["enameled_ware_white_basin", "enameled_steel_basin"],
    ["turned_bun_feet", "bun_feet"],
  ];
  for (const [raw, expected] of cases) {
    const r = snapToCanonical(raw);
    assert.equal(r.canonical, expected, `${raw} should snap to ${expected} (got ${r.canonical})`);
    assert.equal(r.method, "alias", `${raw} should resolve via alias`);
  }
});

test("Snap: a novel lexical variant (not in the alias table) snaps within its category", () => {
  const r = snapToCanonical("circular_seat_aperture", "construction");
  assert.equal(r.canonical, "circular_aperture_seat_board");
  assert.equal(r.method, "lexical");
  assert.ok((r.score ?? 0) >= 0.6);
});

test("Snap: an unrecognizable key is preserved as unmatched, never force-mapped", () => {
  assert.deepEqual(snapToCanonical("blarg_unknown_widget", "materials"), { canonical: null, method: "unmatched" });
  assert.deepEqual(snapToCanonical(""), { canonical: null, method: "unmatched" });
});

// ── Stage 1B: shadow ingest wiring (observe-only, flag-gated) ────────────────
test("Shadow: P0_VOCAB_SNAP_SHADOW records a diff WITHOUT changing clue_keys", () => {
  const obs = () => ([
    { type: "construction", clue: "circular_seat_aperture", description: "circular hole in an interior seat board", confidence: 70, negated: false },
    { type: "construction", clue: "solid_wood_construction", description: "solid wood", confidence: 80, negated: false },
    { type: "materials", clue: "wood_species_oak_group", description: "oak", confidence: 50, negated: false },
    { type: "function", clue: "blarg_unknown_widget", description: "mystery feature", confidence: 40, negated: false },
  ]);
  const off = buildEvidenceDigest(obs() as any);
  assert.equal(off.vocab_shadow, undefined, "no shadow when flag is off");

  process.env.P0_VOCAB_SNAP_SHADOW = "1";
  const on = buildEvidenceDigest(obs() as any);
  delete process.env.P0_VOCAB_SNAP_SHADOW;

  // zero behavior change: clue_keys identical with and without the flag
  assert.deepEqual(on.clue_keys, off.clue_keys);
  // shadow populated; the lexical remap and the unmatched key are both captured
  assert.ok(on.vocab_shadow, "shadow present when flag is on");
  assert.ok(
    on.vocab_shadow!.changed.some((c) => c.to === "circular_aperture_seat_board" && c.method === "lexical"),
    "should record the lexical remap of circular_seat_aperture"
  );
  assert.ok(on.vocab_shadow!.unmatched.includes("blarg_unknown_widget"), "should record the unmatched key");
});

// ── Reproduction gate: construction evidence outranks late style/revival waves ──
// Models the parlor-table failure: a synthetic style-wave zone (1960–1965) vs a
// genuine high-authority construction zone (1850–1920). The pre-existing
// synthetic-containment guard misses it (the construction zone's real authority
// sum >=20 makes it read as "synthetic" and get skipped), so the reproduction
// gate is what must rescue it.
function reproOverlapFixture() {
  return {
    layers: [
      { layer: "joinery", date_floor: 1850, date_ceiling: 1909, source_count: 1, source_clues: ["hammer_veneering"] },
      { layer: "fastener", date_floor: 1850, date_ceiling: 1940, source_count: 1, source_clues: ["slotted_screw"] },
      { layer: "finish", date_floor: 1850, date_ceiling: 1920, source_count: 1, source_clues: ["shellac_intact"] },
    ],
    convergence_zones: [
      { date_floor: 1960, date_ceiling: 1965, authority_sum: 24, weighted_authority: 24, effective_layer_count: 2, specific_layer_count: 1, layers: ["style_wave"] },
      { date_floor: 1850, date_ceiling: 1920, authority_sum: 23, weighted_authority: 23, effective_layer_count: 3, specific_layer_count: 3, layers: ["joinery", "fastener", "finish", "style_wave"] },
    ],
  } as any;
}

test("Repro gate: a post-WWII style zone cannot win the date without modern-construction evidence", () => {
  const p2 = { range: "c. 1960–1965", date_floor: 1960, date_ceiling: 1965, confidence: "Moderate" };
  const r = refineDatingFromConvergence(p2, reproOverlapFixture(), /* hasModernConstructionEvidence */ false);
  assert.ok(r.refined, "should override the wrong-modern p2");
  assert.equal(r.date_floor, 1850, `should anchor to the construction era, got ${r.date_floor}`);
  assert.ok((r.date_floor ?? 9999) < 1945, "must not report a post-WWII reproduction date");
});

test("Repro gate: WITH modern-construction evidence, a modern date is allowed to stand", () => {
  const p2 = { range: "c. 1960–1965", date_floor: 1960, date_ceiling: 1965, confidence: "Moderate" };
  const r = refineDatingFromConvergence(p2, reproOverlapFixture(), /* hasModernConstructionEvidence */ true);
  assert.ok((r.date_floor ?? 0) >= 1945, `modern date should stand when evidence supports it, got ${r.date_floor}`);
});

// ── Construction-ceiling gate (generalizes the repro gate below 1945) ────────
// Layer band shape with an explicit confidence (the repro fixture omits it).
const cLayer = (layer: any, fl: number | null, ce: number | null, conf: any, clue: string) =>
  ({ layer, date_floor: fl, date_ceiling: ce, confidence: conf, source_count: fl == null ? 0 : 1, source_clues: [clue], present_without_dates: 0, undated_clues: [] }) as any;
const cZone = (fl: number, ce: number, auth: number, wAuth: number, eff: number, spec: number, layers: any[]) =>
  ({ date_floor: fl, date_ceiling: ce, layer_count: layers.length, authority_sum: auth, weighted_authority: wAuth, effective_layer_count: eff, specific_layer_count: spec, layers }) as any;

// Regency-Gothic cabinet: hand-cut dovetails cap joinery at 1860 (moderate layer),
// but a revival-wave intersection zone (1900–1910) outranks the genuine broad zone.
const regencyGothicFixture = () => ({
  layers: [
    cLayer("form", 1780, 1900, "high", "cabinet_form"),
    cLayer("joinery", 1500, 1860, "moderate", "hand_cut_dovetails"),
    cLayer("finish", 1800, 1920, "low", "shellac_intact"),
    cLayer("style", 1840, 1930, "high", "gothic_revival_style"),
    cLayer("style_wave", 1840, 1940, "high", "wave"),
  ],
  convergence_zones: [
    cZone(1900, 1910, 24, 24, 2.0, 1, ["style_wave"]),
    cZone(1800, 1920, 30, 18, 3.0, 3, ["form", "joinery", "finish", "style", "style_wave"]),
  ],
  overall_floor: 1800, overall_ceiling: 1940,
}) as any;

test("Ceiling gate: a moderate+ bounded construction layer vetoes a later style-driven zone", () => {
  const p2 = { range: "late 19th–20th c.", date_floor: 1850, date_ceiling: 2000, confidence: "Low" };
  const r = refineDatingFromConvergence(p2, regencyGothicFixture(), false);
  assert.ok(r.refined, "should override the broad p2");
  assert.ok((r.date_ceiling ?? 9999) <= 1860, `must not date past the pre-1860 joinery ceiling, got ${r.date_ceiling}`);
  assert.ok((r.date_floor ?? 0) < (r.date_ceiling ?? 0), "range must not be degenerate");
});

test("Ceiling gate: a LOW-confidence construction ceiling does NOT clamp (no over-correction)", () => {
  // Same shape but joinery is LOW confidence (e.g. an ambiguous hammer-veneer read).
  // The clamp must stay out so a genuine style-driven reading is left intact.
  const lowConfJoinery = regencyGothicFixture();
  lowConfJoinery.layers[1] = cLayer("joinery", 1500, 1860, "low", "hand_cut_dovetails");
  const p2 = { range: "late 19th–20th c.", date_floor: 1850, date_ceiling: 2000, confidence: "Low" };
  const r = refineDatingFromConvergence(p2, lowConfJoinery, false);
  assert.equal(r.date_floor, 1900, `low-confidence ceiling should not clamp; expected the 1900 zone, got ${r.date_floor}`);
  assert.equal(r.date_ceiling, 1910, `low-confidence ceiling should not clamp; got ${r.date_ceiling}`);
});

// ── Dust-cover material as a dating clue (terminus post quem) ────────────────
test("Dust cover: a synthetic non-woven, stapled cover synthesizes post-1950 hard-negative anchors", () => {
  const out = deriveDustCoverClues([
    { type: "construction", clue: "dust_cover", description: "Underside has a non-woven synthetic dust cover, stapled to the frame.", confidence: 90, negated: false } as any,
  ]);
  const ids = out.map((o) => o.clue);
  assert.ok(ids.includes("dust_cover_synthetic_nonwoven"), "should detect synthetic non-woven");
  assert.ok(ids.includes("dust_cover_stapled"), "should detect stapled attachment");
  assert.ok(out.every((o) => o.hard_negative), "synthetic + stapled are modern hard-negative anchors");
});

test("Dust cover: woven cotton cambric is broad — no modern floor", () => {
  const out = deriveDustCoverClues([
    { type: "construction", clue: "dust_cover", description: "Black woven fabric dust cover on the underside.", confidence: 90, negated: false } as any,
  ]);
  assert.deepEqual(out.map((o) => o.clue), ["dust_cover_cambric_woven"]);
  assert.equal(out[0].hard_negative, false);
});

test("Dust cover: nothing synthesized when no dust cover is described", () => {
  assert.deepEqual(
    deriveDustCoverClues([{ type: "form", clue: "armchair_form", description: "open armchair", confidence: 68, negated: false } as any]),
    []
  );
});

test("Dust cover: the synthetic-cover clue floors the upholstery dating layer at 1950", () => {
  const up = buildDatingOverlap(
    [{ clue: "dust_cover_synthetic_nonwoven", category: "upholstery", date_hint: "post-1950" } as any],
    null, [], null
  ).layers.find((l) => l.layer === "upholstery")!;
  assert.equal(up.date_floor, 1950);
  assert.equal(up.date_ceiling, null);
});

// ── M9a: maker-label year weighed by ROLE (production vs founding/patent/bare) ──
const lbl = (description: string) => [{ type: "label", clue: "maker_label", description, confidence: 85, negated: false } as any];

test("M9a: a signed/dated production year is a tight date (floor = ceiling)", () => {
  const r = parseLabelDate(lbl("A. Sydney Logan fecit Philadae anno 1914"));
  assert.deepEqual(r, { year: 1914, kind: "production", floor: 1914, ceiling: 1914 });
});

test("M9a: a company-founding year is a FLOOR only (terminus post quem), not production", () => {
  const r = parseLabelDate(lbl("Fine Furniture — Established 1847"));
  assert.equal(r?.kind, "founding");
  assert.equal(r?.floor, 1847);
  assert.equal(r?.ceiling, null); // must NOT pin a ceiling/tight date
});

test("M9a: a patent year is a floor only", () => {
  const r = parseLabelDate(lbl("Pat. May 1893"));
  assert.equal(r?.kind, "patent");
  assert.equal(r?.floor, 1893);
  assert.equal(r?.ceiling, null);
});

test("M9a: a label with no year yields nothing (maker/line dating is M9b, not here)", () => {
  assert.equal(parseLabelDate(lbl("Seven Seas by Hooker Furniture")), null);
});

test("M9a: a bare year with no context is treated conservatively as a floor", () => {
  const r = parseLabelDate([{ type: "label", clue: "visible_text", description: "label reads 1925", confidence: 85, negated: false } as any]);
  assert.equal(r?.kind, "bare");
  assert.equal(r?.floor, 1925);
  assert.equal(r?.ceiling, null);
});

test("M9a: with multiple non-production years, the latest terminus-post-quem wins", () => {
  const r = parseLabelDate(lbl("Established 1847. Pat. 1893."));
  assert.equal(r?.floor, 1893);
  assert.equal(r?.ceiling, null);
});

// ── M9b-core: matched maker dates reach the engine (with role-nuance) ────────
const makerLabelObs = [{ type: "label", clue: "maker_label", description: "x", confidence: 85, source_image: "label_makers_mark", negated: false } as any];

test("M9b-core: a still-active maker (Hooker) matches and yields a floor-only date (post-founding)", () => {
  const matches = matchMakerMarks("Seven Seas by Hooker Furniture", makerLabelObs);
  const hooker = matches.find((m: any) => m.clue === "maker_mark_hooker_furniture");
  assert.ok(hooker, "should match Hooker Furniture from the label text");
  assert.match(hooker!.description, /post-1924/); // founded 1924, still active → floor only, not a tight date
});

test("M9b-core: a defunct maker (Duncan Phyfe) yields a bounded range", () => {
  const matches = matchMakerMarks("stamped D. Phyfe, New York", makerLabelObs);
  const phyfe = matches.find((m: any) => m.clue === "maker_mark_duncan_phyfe");
  assert.ok(phyfe, "should match Duncan Phyfe");
  assert.match(phyfe!.description, /1792.1847/); // defunct → bounded [founded, closed]
});

test("M9b-core: maker matching is gated on real label evidence", () => {
  assert.deepEqual(matchMakerMarks("Duncan Phyfe", []), []); // no label observation → no attribution
});

// ── Self-authoring: makers.csv → generator → engine (the non-coder pipeline) ──
test("Authoring: committed authored-makers artifact is in sync with content/makers.csv", () => {
  const csv = fs.readFileSync(path.join(process.cwd(), "content/makers.csv"), "utf8");
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(buildAuthoredMakers(csv))),
    JSON.parse(JSON.stringify(AUTHORED_MAKER_ENTRIES)),
    "makersAuthored.generated.ts is stale — run: node --import tsx scripts/generateAuthoredMakers.ts"
  );
});

test("Authoring: a CSV-authored maker flows through the engine matcher and dates correctly", () => {
  // Kroehler (added from content/makers.csv; defunct 1893–1981) → bounded range
  const matches = matchMakerMarks("Labeled Kroehler Manufacturing Co.", [
    { type: "label", clue: "maker_label", description: "x", confidence: 85, source_image: "label_makers_mark", negated: false } as any,
  ]);
  const m = matches.find((x: any) => x.clue === "maker_mark_authored_kroehler_manufacturing_co");
  assert.ok(m, "a newly-authored maker should be matchable by the engine");
  assert.match(m!.description, /1893.1981/);
});

test("Authoring: the collision detector skips makers already in the canonical library", () => {
  const csv =
    "maker_name,founded,closed,mark_wording\n" +
    "Baker Furniture Co.,1890,,Baker Furniture; Baker\n" +
    "Zzyzx Chair Works,1960,,Zzyzx Chair Works";
  const { added, skipped } = partitionAuthoredMakers(csv);
  assert.ok(skipped.some((s) => /Baker/.test(s.maker_name)), "Baker should be flagged as already covered");
  assert.ok(added.some((e) => /Zzyzx/.test(e.maker_name)), "a genuinely new maker should be added");
});

test("Authoring: a single shared token does NOT collapse a distinct maker", () => {
  // "Vaughan-Bassett" must not be treated as already-covered by canonical "Bassett",
  // nor "Lane Venture" by canonical "Lane" — a lone shared token is too weak a match.
  const csv =
    "maker_name,founded,closed,mark_wording\n" +
    "Vaughan-Bassett Furniture Company,1919,,Vaughan-Bassett\n" +
    "Lane Venture,1972,,Lane Venture";
  const { added, skipped } = partitionAuthoredMakers(csv);
  assert.ok(added.some((e) => /Vaughan-Bassett/.test(e.maker_name)), "Vaughan-Bassett must not collapse into Bassett");
  assert.ok(added.some((e) => /Lane Venture/.test(e.maker_name)), "Lane Venture must not collapse into Lane");
  assert.equal(skipped.length, 0, "neither distinct maker should be skipped as a duplicate");
});

test("Authoring: the validator rejects bad rows with a plain-language error", () => {
  assert.throws(
    () => buildAuthoredMakers("maker_name,founded,mark_wording\n,1955,Foo Co."),
    /maker_name is required/
  );
  assert.throws(
    () => buildAuthoredMakers("maker_name,founded,closed,mark_wording\nFoo Co.,1955,1940,Foo Co."),
    /cannot be before/
  );
  assert.throws(
    () => buildAuthoredMakers("maker_name,founded,mark_wording\nFoo Co.,nineteen,Foo Co."),
    /4-digit year/
  );
});

test("M9b-core: a multi-period maker spans its FULL active life, not just the first sub-period", () => {
  // Globe-Wernicke has three mark-form periods (1899–1915, 1916–1930, 1930–1955);
  // the maker date must span 1899–1955, not bound to the first sub-period.
  const matches = matchMakerMarks("Labeled The Globe-Wernicke Co. Cincinnati", makerLabelObs);
  const gw = matches.find((m: any) => m.clue === "maker_mark_globe_wernicke_co" || /globe-?wernicke/i.test(m.description));
  assert.ok(gw, "should match Globe-Wernicke");
  assert.match(gw!.description, /1899.1955/);
  assert.doesNotMatch(gw!.description, /1899.1915\b/);
});

// ── #5 / #13: dating-finding narrative consistency ──────────────────────────
const _zone = (over: any = {}) => ({
  date_floor: 1925, date_ceiling: 1945, layer_count: 3,
  authority_sum: 15, weighted_authority: 15, effective_layer_count: 2,
  specific_layer_count: 2, layers: ["joinery", "style", "style_wave"],
  specific_layers: ["style", "style_wave"], ...over,
});
const _narrInput = (over: any = {}) => ({
  data: { layers: [], convergence_zones: [], overall_floor: null, overall_ceiling: null },
  styleAttribution: null,
  finalStyle: { kind: "unresolved", final_style_label: "X", final_style_reason: "" },
  finalDatingFloor: null, finalDatingCeiling: null, ...over,
}) as any;

test("#5a: Case 9 names the attributed style instead of claiming none", () => {
  const n = buildDatingFindingNarrative(_narrInput({
    data: { layers: [], convergence_zones: [_zone()], overall_floor: 1850, overall_ceiling: 1995 },
    styleAttribution: { name: "Art Deco", date_floor: 1925, date_ceiling: 1945, style_family_id: "x", confidence: 0.8 },
    finalStyle: { kind: "unresolved", final_style_label: "Art Deco", final_style_reason: "" },
  }));
  assert.ok(n, "narrative should be produced");
  assert.doesNotMatch(n!.headline, /no specific style was attributed/);
  assert.match(n!.headline, /Art Deco/);
});

test("#5a: Case 9 still says 'no specific style' when none was attributed", () => {
  const n = buildDatingFindingNarrative(_narrInput({
    data: { layers: [], convergence_zones: [_zone()], overall_floor: 1850, overall_ceiling: 1995 },
    styleAttribution: null,
  }));
  assert.match(n!.headline, /no specific style was attributed/);
});

test("#5b: narrative enumerates only corroborating (specific) layers", () => {
  const n = buildDatingFindingNarrative(_narrInput({
    data: { layers: [], convergence_zones: [_zone()], overall_floor: 1850, overall_ceiling: 1995 },
    styleAttribution: { name: "Art Deco", date_floor: 1925, date_ceiling: 1945, style_family_id: "x", confidence: 0.8 },
    finalStyle: { kind: "unresolved", final_style_label: "Art Deco", final_style_reason: "" },
  }));
  assert.match(n!.headline, /2 corroborating layers/);
  assert.doesNotMatch(n!.headline, /joinery/); // open-ended joinery must not be listed
  assert.match(n!.headline, /design distinctives/);
});

test("#13: a null working range never renders 'at uncertain'", () => {
  const n = buildDatingFindingNarrative(_narrInput({
    data: {
      layers: [{ layer: "fastener", date_floor: 1840, date_ceiling: 1940, confidence: "low", source_count: 1, source_clues: ["slotted_screw"], present_without_dates: 0, undated_clues: [] }],
      convergence_zones: [], overall_floor: 1840, overall_ceiling: 1940,
    },
  }));
  assert.doesNotMatch(n!.headline, /at uncertain/);
});

// ── #111-b: early pre-machine termini cap a runaway style-wave date ──────────
// Models the country-Chippendale ladderback: a synthetic style-wave zone
// (1920–1930) vs a genuine construction zone, where cut_nail (≤1890) and
// hand_plane_chatter (≤1880) are LOW-confidence but diagnostic early termini.
function earlyTerminusFixture() {
  return {
    layers: [
      { layer: "fastener", date_floor: 1790, date_ceiling: 1890, confidence: "low", source_count: 1, source_clues: ["cut_nail"] },
      { layer: "toolmark", date_floor: null, date_ceiling: 1880, confidence: "low", source_count: 1, source_clues: ["hand_plane_chatter"] },
      { layer: "finish", date_floor: 1800, date_ceiling: 1920, confidence: "low", source_count: 1, source_clues: ["shellac_intact"] },
    ],
    convergence_zones: [
      { date_floor: 1920, date_ceiling: 1930, authority_sum: 24, weighted_authority: 24, effective_layer_count: 2, specific_layer_count: 2, layers: ["style_wave"] },
      { date_floor: 1700, date_ceiling: 1965, authority_sum: 30, weighted_authority: 18, effective_layer_count: 3, specific_layer_count: 2, layers: ["fastener", "toolmark", "finish", "style_wave"] },
    ],
  } as any;
}

test("#111-b: a low-confidence pre-machine terminus (cut nail/plane chatter ≤1900) caps a runaway style-wave date", () => {
  // Original p2 (pre-convergence) is broad — as it is on the real ladderback,
  // which is why a tight style-wave zone overrode it in the first place.
  const p2 = { range: "broadly late 19th to 20th century", date_floor: null, date_ceiling: null, confidence: "Low" };
  const r = refineDatingFromConvergence(p2, earlyTerminusFixture(), /* hasModernConstructionEvidence */ false);
  assert.ok((r.date_ceiling ?? 9999) <= 1880, `should cap at the ≤1880 terminus, got ${r.date_ceiling}`);
  assert.ok((r.date_floor ?? 9999) < 1900, `should anchor in the construction era, got ${r.date_floor}`);
});

test("#111-b: a BROAD fastener ceiling (slotted_screw 1850–1940) does NOT cap a genuine modern date", () => {
  // The slotted_screw ceiling (1940) is > 1900 → not an early terminus → must not bind.
  const overlap = {
    layers: [
      { layer: "fastener", date_floor: 1850, date_ceiling: 1940, confidence: "low", source_count: 1, source_clues: ["slotted_screw"] },
    ],
    convergence_zones: [
      { date_floor: 1960, date_ceiling: 1970, authority_sum: 24, weighted_authority: 24, effective_layer_count: 2, specific_layer_count: 1, layers: ["style_wave"] },
    ],
  } as any;
  const p2 = { range: "c. 1960–1970", date_floor: 1960, date_ceiling: 1970, confidence: "Moderate" };
  const r = refineDatingFromConvergence(p2, overlap, /* hasModernConstructionEvidence */ true);
  assert.ok((r.date_ceiling ?? 0) > 1900, `broad fastener ceiling must not clamp a modern date, got ${r.date_ceiling}`);
});
