/**
 * lib/engineDatingOverlap.ts — Block 3a
 *
 * Produces structured per-layer date data for the dating-overlap visualization
 * in the Full Analysis report. Per D-PH3-6: 8 evidence layers (form, joinery,
 * fastener, wood, finish, toolmark, style-wave, hardware), each with a date
 * envelope; convergence-zone highlights where ≥N layers' envelopes overlap.
 *
 * Engine-side data only. React visualization rendering is Block 3b.
 *
 * Strategy: scan p4.weighted_clues (category-keyed), aggregate per-layer
 * date envelope from each clue's date_hint (parsed via parseRangeToNumeric).
 * Style + style-wave layers pull from p3 directly. Form layer pulls from
 * p2 overall envelope (form-specific dating already integrated there).
 */

import { parseRangeToNumeric } from "./engineClueResolver";

export type LayerName =
  | "form"
  | "joinery"
  | "fastener"
  | "wood"
  | "finish"
  | "toolmark"
  | "style"
  | "style_wave"
  | "hardware"
  | "upholstery";

export type LayerDateBand = {
  layer: LayerName;
  date_floor: number | null;
  date_ceiling: number | null;
  source_count: number;        // distinct clues that contributed parseable dates
  source_clues: string[];      // up to 4 sample clue keys for display
  confidence: "high" | "moderate" | "low" | "none";
  // Block 5: diagnostic surface — observations present in this category but
  // without a parseable date_hint. Lets the viz show "evidence present, no
  // date band" instead of falsely reading as "no signal."
  present_without_dates: number;
  undated_clues: string[];     // up to 4 sample undated clue keys
};

export type ConvergenceZone = {
  date_floor: number;
  date_ceiling: number;
  layer_count: number;
  layers: LayerName[];
};

export type DatingOverlapData = {
  layers: LayerDateBand[];      // always 8 entries (one per LayerName above except style+style_wave kept distinct)
  convergence_zones: ConvergenceZone[];
  overall_floor: number | null; // tightest agreed-upon floor across layers
  overall_ceiling: number | null;
};

// ── Block 7b3: convergence-override refinement for p2 ───────────────────

export type RefinedDating = {
  range: string;
  date_floor: number | null;
  date_ceiling: number | null;
  confidence: "High" | "Moderate" | "Low";
  reason: string;
  refined: boolean;       // false when convergence doesn't beat original p2; original returned
};

/**
 * Block 7b3 — when the dating-overlap convergence is sharper than p2's
 * original date range, propose refined dating for the report's Working Range.
 * Feature-flagged for easy disable.
 *
 * Override rule:
 * - Convergence zone must have ≥3 layers agreeing
 * - Width ≤60 years (anything wider is no improvement over current behavior)
 * - Convergence range must be TIGHTER than current p2 range (smaller width)
 *   OR p2 has no parseable numeric range
 *
 * When override fires, confidence bumps based on convergence layer count:
 *   3 layers → Moderate
 *   4 layers → Moderate
 *   5+ layers → High
 */
export const CONVERGENCE_OVERRIDE_ENABLED = true; // Block 7b3 feature flag

export function refineDatingFromConvergence(
  original: {
    range: string;
    date_floor: number | null;
    date_ceiling: number | null;
    confidence: string;
  },
  overlap: DatingOverlapData
): RefinedDating {
  const fallback: RefinedDating = {
    range: original.range,
    date_floor: original.date_floor,
    date_ceiling: original.date_ceiling,
    confidence: normalizeConfidence(original.confidence),
    reason: "no convergence override applied",
    refined: false,
  };

  if (!CONVERGENCE_OVERRIDE_ENABLED) return fallback;
  if (!overlap.convergence_zones?.length) return fallback;

  // Pick the strongest qualifying convergence zone: most layers, then narrowest.
  const qualifying = overlap.convergence_zones
    .filter((z) => z.layer_count >= 3 && (z.date_ceiling - z.date_floor) <= 60)
    .sort((a, b) => {
      if (b.layer_count !== a.layer_count) return b.layer_count - a.layer_count;
      return (a.date_ceiling - a.date_floor) - (b.date_ceiling - b.date_floor);
    });
  if (qualifying.length === 0) return fallback;

  const best = qualifying[0];
  const convergenceWidth = best.date_ceiling - best.date_floor;
  const originalWidth =
    original.date_floor !== null && original.date_ceiling !== null
      ? original.date_ceiling - original.date_floor
      : Infinity; // no parseable original → convergence wins

  // Only override when convergence is strictly tighter (not equal)
  if (convergenceWidth >= originalWidth) return fallback;

  const confidence: "High" | "Moderate" | "Low" =
    best.layer_count >= 5 ? "High" : "Moderate";

  return {
    range: `c. ${best.date_floor}–${best.date_ceiling}`,
    date_floor: best.date_floor,
    date_ceiling: best.date_ceiling,
    confidence,
    reason: `${best.layer_count} evidence layers converge on this period (${best.layers.join(", ")}); tighter than the initial broad envelope.`,
    refined: true,
  };
}

function normalizeConfidence(c: string): "High" | "Moderate" | "Low" {
  const v = String(c).toLowerCase();
  if (v.startsWith("hi")) return "High";
  if (v.startsWith("mo")) return "Moderate";
  return "Low";
}

// Engine clue category → layer name. Note "fastener" (singular) matches p4
// category "fasteners" (plural per AUTHORITY_RANK).
const CATEGORY_TO_LAYER: Record<string, LayerName> = {
  joinery: "joinery",
  fasteners: "fastener",
  toolmarks: "toolmark",
  finish: "finish",
  hardware: "hardware",
  materials: "wood",
  upholstery: "upholstery",
};

type WeightedClue = {
  clue: string;
  category: string;
  date_hint?: string | null;
};

function aggregateRange(ranges: Array<{ floor: number | null; ceiling: number | null }>) {
  let floor: number | null = null;
  let ceiling: number | null = null;
  for (const r of ranges) {
    if (r.floor != null) floor = floor === null ? r.floor : Math.min(floor, r.floor);
    if (r.ceiling != null) ceiling = ceiling === null ? r.ceiling : Math.max(ceiling, r.ceiling);
  }
  return { floor, ceiling };
}

/**
 * Build per-layer date bands for the 8 evidence layers.
 */
export function buildDatingOverlap(
  weightedClues: WeightedClue[],
  styleAttribution: { date_floor: number | null; date_ceiling: number | null; confidence: number } | null,
  styleWaves: Array<{ date_floor: number | null; date_ceiling: number | null }>,
  formDating: { date_floor: number | null; date_ceiling: number | null } | null
): DatingOverlapData {
  // Bucket weighted_clues per evidence-library layer
  const buckets: Partial<Record<LayerName, Array<{ clue: string; floor: number | null; ceiling: number | null }>>> = {};
  // Block 5: parallel bucket for present-but-undated observations. Diagnostic
  // surface — when LLM returns observations in an evidence category but date_hint
  // doesn't parse, the layer would otherwise read as "no signal" (wrong — there
  // IS signal, just no parseable date band).
  const undatedBuckets: Partial<Record<LayerName, string[]>> = {};
  for (const wc of weightedClues) {
    const layer = CATEGORY_TO_LAYER[wc.category];
    if (!layer) continue;
    const { date_floor, date_ceiling } = parseRangeToNumeric(wc.date_hint ?? null);
    if (date_floor === null && date_ceiling === null) {
      (undatedBuckets[layer] ||= []).push(wc.clue);
      continue;
    }
    (buckets[layer] ||= []).push({ clue: wc.clue, floor: date_floor, ceiling: date_ceiling });
  }

  const layers: LayerDateBand[] = [];

  // Form layer: pull from form-specific dating envelope (p2 overall envelope)
  layers.push({
    layer: "form",
    date_floor: formDating?.date_floor ?? null,
    date_ceiling: formDating?.date_ceiling ?? null,
    source_count: formDating?.date_floor !== null || formDating?.date_ceiling !== null ? 1 : 0,
    source_clues: formDating?.date_floor !== null || formDating?.date_ceiling !== null ? ["form-dated envelope"] : [],
    confidence: formDating?.date_floor !== null && formDating?.date_ceiling !== null ? "high" : "low",
    present_without_dates: 0,
    undated_clues: [],
  });

  // 7 evidence-library layers (Block 12 added upholstery)
  for (const layerName of ["joinery", "fastener", "toolmark", "wood", "hardware", "finish", "upholstery"] as LayerName[]) {
    const items = buckets[layerName] ?? [];
    const undated = undatedBuckets[layerName] ?? [];
    const { floor, ceiling } = aggregateRange(items.map((i) => ({ floor: i.floor, ceiling: i.ceiling })));
    layers.push({
      layer: layerName,
      date_floor: floor,
      date_ceiling: ceiling,
      source_count: items.length,
      source_clues: items.slice(0, 4).map((i) => i.clue),
      confidence:
        items.length === 0 ? "none" :
        items.length >= 3 ? "high" :
        items.length === 2 ? "moderate" : "low",
      present_without_dates: undated.length,
      undated_clues: undated.slice(0, 4),
    });
  }

  // Style layer (from style_attribution if confidence ≥ 0.5)
  const styleConf = styleAttribution?.confidence ?? 0;
  const styleHasDates = styleAttribution && (styleAttribution.date_floor != null || styleAttribution.date_ceiling != null);
  layers.push({
    layer: "style",
    date_floor: styleHasDates && styleConf >= 0.5 ? styleAttribution!.date_floor : null,
    date_ceiling: styleHasDates && styleConf >= 0.5 ? styleAttribution!.date_ceiling : null,
    source_count: styleHasDates && styleConf >= 0.5 ? 1 : 0,
    source_clues: styleHasDates && styleConf >= 0.5 ? ["style attribution"] : [],
    confidence: styleConf >= 0.7 ? "high" : styleConf >= 0.5 ? "moderate" : styleConf >= 0.4 ? "low" : "none",
    present_without_dates: 0,
    undated_clues: [],
  });

  // Style-wave layer (union of all surfaced waves)
  const waveRange = aggregateRange(styleWaves.map((w) => ({ floor: w.date_floor, ceiling: w.date_ceiling })));
  layers.push({
    layer: "style_wave",
    date_floor: waveRange.floor,
    date_ceiling: waveRange.ceiling,
    source_count: styleWaves.length,
    source_clues: styleWaves.slice(0, 4).map((_, i) => `wave-${i + 1}`),
    confidence:
      styleWaves.length === 0 ? "none" :
      styleWaves.length >= 3 ? "high" :
      styleWaves.length === 2 ? "moderate" : "low",
    present_without_dates: 0,
    undated_clues: [],
  });

  // Convergence zones: scan year-by-year across all populated layers; find spans
  // where ≥3 layers' envelopes contain that year. Threshold of 3 keeps zones
  // meaningful (≥2 is too noisy when style + style-wave + form often overlap
  // trivially; ≥3 requires at least one evidence-library layer agreement).
  const CONVERGENCE_THRESHOLD = 3;
  const populated = layers.filter(
    (l) => l.date_floor != null || l.date_ceiling != null
  );

  if (populated.length === 0) {
    return { layers, convergence_zones: [], overall_floor: null, overall_ceiling: null };
  }

  // Compute scan range: from earliest floor to latest ceiling (cap at 2030 if open-ended).
  const earliest = Math.min(...populated.map((l) => l.date_floor ?? l.date_ceiling ?? 2030));
  const latest = Math.max(...populated.map((l) => l.date_ceiling ?? l.date_floor ?? 2030));

  const zones: ConvergenceZone[] = [];
  let currentZone: { start: number; layers: Set<LayerName> } | null = null;

  for (let year = earliest; year <= latest; year += 5) {
    const yearLayers: LayerName[] = [];
    for (const l of populated) {
      const lo = l.date_floor ?? -Infinity;
      const hi = l.date_ceiling ?? Infinity;
      if (year >= lo && year <= hi) yearLayers.push(l.layer);
    }
    if (yearLayers.length >= CONVERGENCE_THRESHOLD) {
      if (!currentZone) {
        currentZone = { start: year, layers: new Set(yearLayers) };
      } else {
        yearLayers.forEach((l) => currentZone!.layers.add(l));
      }
    } else if (currentZone) {
      zones.push({
        date_floor: currentZone.start,
        date_ceiling: year - 5,
        layer_count: currentZone.layers.size,
        layers: Array.from(currentZone.layers),
      });
      currentZone = null;
    }
  }
  if (currentZone) {
    zones.push({
      date_floor: currentZone.start,
      date_ceiling: latest,
      layer_count: currentZone.layers.size,
      layers: Array.from(currentZone.layers),
    });
  }

  // Overall envelope: union of populated layers (engine's most-conservative read)
  const overall = aggregateRange(populated.map((l) => ({ floor: l.date_floor, ceiling: l.date_ceiling })));

  return {
    layers,
    convergence_zones: zones,
    overall_floor: overall.floor,
    overall_ceiling: overall.ceiling,
  };
}
