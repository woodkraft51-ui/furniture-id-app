/**
 * Phase 1 analyzer for the commode repeat-scan study. Run:
 *   node --import tsx scripts/analyzeCommodeRuns.ts
 *
 * Prints (1) raw clue-key frequency across the 5 identical-input runs,
 * (2) the same keys collapsed into canonical concepts to show that the
 * UNDERLYING observations are stable even though the model's key NAMES drift,
 * and (3) the outcome variance (form / style / value).
 */
import { COMMODE_RUNS } from "../tests/fixtures/commodeRuns";

const N = COMMODE_RUNS.length;

// Synonym clusters observed across the 5 runs. Members are different key names
// the model coined for the SAME physical feature.
const CONCEPTS: Record<string, string[]> = {
  "commode function": ["commode_function", "commode_chamber_pot_function", "commode_close_stool_function"],
  "circular aperture": ["circular_aperture_seat_board", "circular_aperture_cutout", "circular_cutout_platform"],
  "turned corner posts": ["corner_post_construction", "turned_corner_posts", "vertical_supports"],
  "mortise-and-tenon": ["mortise_and_tenon", "corner_post_mortise_and_tenon"],
  "victorian commode style": ["victorian_commode_form", "victorian_utilitarian_commode_form", "victorian_utility_commode", "victorian_utilitarian_commode"],
  "post-top finials": ["turned_finials_on_posts", "turned_finial_post_tops", "corner_post_tenon_tops"],
  "bun feet": ["bun_feet", "turned_bun_feet", "turned_bun_foot_style"],
  "enameled basin": ["enameled_steel_insert", "enameled_steel_basin", "enameled_ware_chamber_pot", "enameled_ware_insert", "enameled_ware_white_blue_rim"],
  "lid crack": ["lid_crack_split", "top_panel_crack", "top_split_crack", "lid_split_crack"],
  "two-board lid/seat": ["two_part_hinged_lid", "two_board_top", "two_board_lid_panel", "two_part_seat_board"],
  "maker-label text": ["visible_text_us_standard", "visible_text", "label_text_full", "visible_text_label"],
  "brass bracket/catch": ["stamped_metal_bracket", "brass_lid_catch_or_bracket"],
  "brass tarnish": ["tarnished_brass_hardware", "brass_hardware_oxidation", "hinge_tarnish"],
  "interior seat frame": ["interior_seat_frame", "interior_floor_split_boards"],
  "FALSE TWIN: brass_frame": ["brass_frame"],
  "FALSE TWIN: tubular_steel": ["tubular_steel"],
};

const runsWithAny = (keys: string[]) =>
  COMMODE_RUNS.filter((r) => keys.some((k) => r.clueKeys.includes(k))).map((r) => r.run);

// 1. Raw key frequency
const allKeys = new Set<string>();
for (const r of COMMODE_RUNS) for (const k of r.clueKeys) allKeys.add(k);
const rawFreq = [...allKeys]
  .map((k) => ({ k, runs: runsWithAny([k]) }))
  .sort((a, b) => b.runs.length - a.runs.length || a.k.localeCompare(b.k));

console.log(`\n=== RAW CLUE-KEY FREQUENCY across ${N} identical-input runs ===`);
console.log(`distinct key names emitted: ${allKeys.size}`);
const systematic = rawFreq.filter((x) => x.runs.length === N);
console.log(`\nstable as a NAME (${N}/${N}): ${systematic.map((x) => x.k).join(", ")}`);
console.log(`\nkeys appearing in only 1 run (pure churn / hallucination):`);
for (const x of rawFreq.filter((x) => x.runs.length === 1)) console.log(`  1/${N}  ${x.k}`);

// 2. Concept-collapsed frequency
console.log(`\n=== SAME OBSERVATIONS, COLLAPSED TO CONCEPTS ===`);
console.log(`(shows the feature is stable even when the key name is not)`);
for (const [concept, members] of Object.entries(CONCEPTS)) {
  const runs = runsWithAny(members);
  const distinctNames = members.filter((m) => allKeys.has(m));
  console.log(`  ${runs.length}/${N}  ${concept}  —  ${distinctNames.length} distinct name(s): ${distinctNames.join(", ")}`);
}

// 3. Outcome variance
console.log(`\n=== OUTCOME VARIANCE (identical input) ===`);
for (const r of COMMODE_RUNS) {
  console.log(
    `  run ${r.run}: ${r.formLabel.padEnd(34)} | ${r.styleContext.padEnd(22)} | $${r.valueLow}-${r.valueHigh} | sell ${r.sellability}` +
    (r.subtype ? ` | subtype ${r.subtype.id} [${r.subtype.dateFloor}-${r.subtype.dateCeiling ?? "∞"}]` : "")
  );
}
const forms = new Set(COMMODE_RUNS.map((r) => r.formLabel));
const styles = new Set(COMMODE_RUNS.map((r) => r.styleContext));
const lows = COMMODE_RUNS.map((r) => r.valueLow);
const highs = COMMODE_RUNS.map((r) => r.valueHigh);
console.log(`\n  distinct forms: ${forms.size} (${[...forms].join(" / ")})`);
console.log(`  distinct style contexts: ${styles.size} (${[...styles].join(" / ")})`);
console.log(`  value low spans $${Math.min(...lows)}-${Math.max(...lows)} ; high spans $${Math.min(...highs)}-${Math.max(...highs)} (${(Math.max(...highs) / Math.min(...highs)).toFixed(1)}x)`);
console.log("");
