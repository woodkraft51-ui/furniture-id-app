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
  // Sum of LAYER_AUTHORITY for the layers contributing to this zone. Used
  // by refineDatingFromConvergence to break ties between zones with equal
  // layer counts (the prior "narrower wins" rule produced wrong answers
  // when low-authority layers crowded a tight zone, e.g., hardware+style+
  // style_wave converging at 1845–1850 on a Golden Oak dresser whose
  // form+hardware envelope actually pointed at 1890–1900).
  authority_sum: number;
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
 * - Convergence zone must have ≥3 layers agreeing (or be a synthetic
 *   style-intersection zone)
 * - Width within a generous absolute sanity cap (ABSOLUTE_WIDTH_CAP); wide
 *   evidence-rich zones are allowed rather than discarded in favor of a worse
 *   broad fallback
 * - Convergence range must be TIGHTER than current p2 range (smaller width)
 *   OR p2 has no parseable numeric range
 *
 * When override fires, confidence scales with width AND layer count:
 *   width ≤60, 5+ layers → High
 *   width ≤60          → Moderate
 *   width ≤110, 4+ layers → Moderate
 *   otherwise          → Low
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

  // Pick the strongest qualifying convergence zone: highest authority sum,
  // then most layers, then narrowest. Previously the picker sorted by layer
  // count alone, with ties broken by narrowness — that let a tight zone of
  // low-authority layers (style + style_wave + replacement-risk hardware)
  // beat a wider zone of high-authority layers (form + hardware + wood).
  //
  // Synthetic style-intersection zones (authority_sum ≥ 20, injected from
  // engineStyleIntersection.computeStyleIntersections) bypass the
  // layer_count threshold. The intersection IS the corroboration — it
  // means two independent style families' production windows agree on the
  // same era, which is stronger evidence than three weak layers happening
  // to overlap.
  const SYNTHETIC_INTERSECTION_AUTHORITY_FLOOR = 20;
  // Generous absolute sanity cap. The OLD behavior hard-rejected any zone wider
  // than 60y, which threw away legitimate evidence-rich convergences (e.g. a
  // 4-layer wood+finish+style+style_wave zone at 1815–1910) and fell back to
  // p2's broad no-anchor default (often "late 19th–20th c." → 1900–2000). That
  // reported a WORSE date than the engine's own convergence. We now accept wide
  // zones and rely on the relative-width check below (override only when tighter
  // than p2) plus width-scaled confidence. The cap only blocks absurd spans.
  const ABSOLUTE_WIDTH_CAP = 160;
  const qualifying = overlap.convergence_zones
    .filter((z) => {
      const widthOk = (z.date_ceiling - z.date_floor) <= ABSOLUTE_WIDTH_CAP;
      if (!widthOk) return false;
      const isSyntheticIntersection = z.authority_sum >= SYNTHETIC_INTERSECTION_AUTHORITY_FLOOR;
      return isSyntheticIntersection || z.layer_count >= 3;
    })
    .sort((a, b) => {
      if (b.authority_sum !== a.authority_sum) return b.authority_sum - a.authority_sum;
      if (b.layer_count !== a.layer_count) return b.layer_count - a.layer_count;
      return (a.date_ceiling - a.date_floor) - (b.date_ceiling - b.date_floor);
    });
  if (qualifying.length === 0) return fallback;

  let best = qualifying[0];

  // Synthetic-intersection containment. A synthetic style intersection zone
  // (authority_sum ≥ FLOOR, injected from two style families'/waves' production
  // windows agreeing) is given dominating authority so it can refine a genuine
  // transitional reading. But a COINCIDENTAL overlap must not OVERRIDE genuine
  // construction/material evidence that points elsewhere.
  //
  // Compare the synthetic against the STRONGEST genuine evidence zone (qualifying
  // is sorted by authority desc, so the first non-synthetic ≥3-layer zone is the
  // strongest). Only let real evidence displace the synthetic when that strongest
  // genuine zone DISAGREES (is disjoint). When they overlap, the synthetic is a
  // legitimate tightening and is kept.
  //
  // CRITICAL: do NOT switch to just any disjoint genuine zone. A weaker, LATER
  // genuine zone (e.g. wood+finish+style_wave at 1900–1910, driven by revival
  // waves) must not displace a synthetic that already agrees with the dominant
  // EARLY evidence (e.g. wood+finish+style at 1815–1860). The earlier prior
  // implementation used `.find(disjoint)`, which grabbed the late zone and
  // reported 1900–1910 on a piece whose strongest evidence sat at 1815–1860.
  const isSynthetic = (z: ConvergenceZone) =>
    z.authority_sum >= SYNTHETIC_INTERSECTION_AUTHORITY_FLOOR;
  const overlapsZone = (a: ConvergenceZone, b: ConvergenceZone) =>
    a.date_ceiling >= b.date_floor && b.date_ceiling >= a.date_floor;
  if (isSynthetic(best)) {
    const strongestGenuine = qualifying.find(
      (z) => !isSynthetic(z) && z.layer_count >= 3
    );
    if (strongestGenuine && !overlapsZone(strongestGenuine, best)) {
      best = strongestGenuine;
    }
  }

  // Hard-negative post-floor enforcement. Open-ended post-YYYY layer
  // envelopes (e.g., phillips_screw post-1935, plywood_drawer_bottom
  // post-1920, polyurethane post-1960) are construction-anchor floors: any
  // valid final date MUST be ≥ the latest such floor. The convergence
  // picker doesn't see them as anchors — it only counts overlapping years.
  // Without this clamp, a Federal-style reproduction with phillips screws
  // can converge on 1905–1910 (style + plywood overlap) and report a date
  // that pre-dates one of its own hard-negative observations. Clamp the
  // zone's floor up to the maximum post-floor; if that pushes floor past
  // ceiling, slide the ceiling up by the original zone width.
  let zFloor = best.date_floor;
  let zCeiling = best.date_ceiling;
  let hardFloorClamped = false;
  for (const l of overlap.layers) {
    // The form layer's open-ended span (catalog production floor) is not a
    // construction hard-negative — only material/fastener/finish post-floors
    // (plywood, phillips, polyurethane) should clamp the date forward.
    if (l.layer === "form") continue;
    if (l.date_floor != null && l.date_ceiling == null && l.date_floor > zFloor) {
      const width = zCeiling - zFloor;
      zFloor = l.date_floor;
      if (zFloor > zCeiling) zCeiling = zFloor + width;
      hardFloorClamped = true;
    }
  }

  const convergenceWidth = zCeiling - zFloor;
  const originalWidth =
    original.date_floor !== null && original.date_ceiling !== null
      ? original.date_ceiling - original.date_floor
      : Infinity; // no parseable original → convergence wins

  // Only override when convergence is strictly tighter (not equal)
  if (convergenceWidth >= originalWidth) return fallback;

  // Confidence scales with BOTH layer count and width. A wide convergence is a
  // real improvement over a broad fallback but shouldn't be reported with the
  // same confidence as a tight one — so wide zones step down to Low/Moderate.
  let confidence: "High" | "Moderate" | "Low";
  if (convergenceWidth <= 60) {
    confidence = best.layer_count >= 5 ? "High" : "Moderate";
  } else if (convergenceWidth <= 110) {
    confidence = best.layer_count >= 4 ? "Moderate" : "Low";
  } else {
    confidence = "Low";
  }

  return {
    range: `c. ${zFloor}–${zCeiling}`,
    date_floor: zFloor,
    date_ceiling: zCeiling,
    confidence,
    reason: hardFloorClamped
      ? `${best.layer_count} evidence layers converge on ${best.date_floor}–${best.date_ceiling}; hard-negative post-floor evidence clamps the floor to ${zFloor}.`
      : `${best.layer_count} evidence layers converge on this period (${best.layers.join(", ")}); tighter than the initial broad envelope.`,
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
  // p4 already computes these on every weighted_clue (lib/engine.ts AUTHORITY_RANK
  // + REPLACEMENT_RISK tables); previously dropped on the way into the dating
  // overlap. They are now used by convergence-zone selection to (a) sum layer
  // authority instead of counting layers and (b) skip replacement-risk hardware
  // from contributing to any layer envelope (porcelain casters, round wood knobs,
  // decorative bail pulls are commonly replaced and should not anchor an early
  // date even when authentically authored).
  authority_rank?: number;
  replacement_risk?: number;
};

// Per-layer authority rank for convergence weighting. Mirrors the clue-category
// AUTHORITY_RANK in lib/engine.ts (joinery 9, fasteners 8, toolmarks 8, form 7,
// hardware 6, wood 6, upholstery 5, finish 4, style 3) plus style_wave at 2
// (style waves are diagnostic context, weakest of all dating layers).
const LAYER_AUTHORITY: Record<LayerName, number> = {
  joinery: 9,
  fastener: 8,
  toolmark: 8,
  form: 7,
  hardware: 6,
  wood: 6,
  upholstery: 5,
  finish: 4,
  style: 3,
  style_wave: 2,
};

// Replacement-risk threshold above which a hardware clue is excluded from
// contributing to its layer envelope. Porcelain casters (0.35), round wood
// knobs (0.4), decorative bail pulls (0.45) are all above this floor and
// commonly replaced; trusting them as date anchors was producing artificial
// early-convergence zones (e.g., a Golden Oak dresser convergence at 1845–1850
// driven by porcelain caster 1830–1900 + knob "post-1750").
const REPLACEMENT_RISK_EXCLUSION_THRESHOLD = 0.35;

function aggregateRange(ranges: Array<{ floor: number | null; ceiling: number | null }>) {
  let floor: number | null = null;
  let ceiling: number | null = null;
  for (const r of ranges) {
    // Defensively normalize any reversed input before folding into the running min/max.
    const f = r.floor != null && r.ceiling != null ? Math.min(r.floor, r.ceiling) : r.floor;
    const c = r.floor != null && r.ceiling != null ? Math.max(r.floor, r.ceiling) : r.ceiling;
    if (f != null) floor = floor === null ? f : Math.min(floor, f);
    if (c != null) ceiling = ceiling === null ? c : Math.max(ceiling, c);
  }
  if (floor != null && ceiling != null && floor > ceiling) {
    [floor, ceiling] = [ceiling, floor];
  }
  return { floor, ceiling };
}

/**
 * Build per-layer date bands for the 8 evidence layers.
 *
 * Block 16: optional `formBoundaries` clips every layer's date envelope by
 * the form's emergence/extinction dates from anti_classification_guidance.
 * Without this clip, layer bands (especially style attribution) extend to
 * their canonical period regardless of whether the form could exist then —
 * e.g. a telephone bench with Louis XVI rosettes draws the style band at
 * 1770s even though telephones weren't domestic before ~1900.
 */
export function buildDatingOverlap(
  weightedClues: WeightedClue[],
  styleAttribution: { date_floor: number | null; date_ceiling: number | null; confidence: number } | null,
  styleWaves: Array<{ date_floor: number | null; date_ceiling: number | null }>,
  formDating: { date_floor: number | null; date_ceiling: number | null } | null,
  formBoundaries?: { emergence_date?: number; extinction_date?: number },
  styleIntersection?: { kind: "family" | "wave"; participants: string[]; date_floor: number; date_ceiling: number } | null
): DatingOverlapData {
  // Block 16: clip helpers. Apply form's anti_classification_guidance to
  // layer floors / ceilings. emergence pulls floors UP to the boundary;
  // extinction pulls ceilings DOWN to the boundary. Bands entirely outside
  // the valid window are nulled (collapse to "no signal").
  const clipFloor = (f: number | null): number | null => {
    if (f == null) return f;
    const e = formBoundaries?.emergence_date;
    return e !== undefined && f < e ? e : f;
  };
  const clipCeiling = (c: number | null): number | null => {
    if (c == null) return c;
    const x = formBoundaries?.extinction_date;
    return x !== undefined && c > x ? x : c;
  };
  const clipBand = (
    floor: number | null,
    ceiling: number | null
  ): { floor: number | null; ceiling: number | null; collapsed: boolean } => {
    const f = clipFloor(floor);
    const c = clipCeiling(ceiling);
    // If both bounds were clipped past each other (band falls entirely
    // outside form's valid window), collapse to null.
    if (f != null && c != null && f > c) return { floor: null, ceiling: null, collapsed: true };
    return { floor: f, ceiling: c, collapsed: false };
  };
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
    // Replacement-risk clues (commonly-replaced hardware: porcelain casters,
    // round wood knobs, decorative bail pulls) are still recorded as undated
    // observations so the diagnostic surface shows "present, not used for
    // dating" rather than silently dropping them — but they do NOT
    // contribute their (often broad and authentically-authored) period
    // envelope to convergence. They were the leading cause of artificial
    // early-convergence zones on factory-era pieces with later/replacement
    // hardware.
    if (
      typeof wc.replacement_risk === "number" &&
      wc.replacement_risk >= REPLACEMENT_RISK_EXCLUSION_THRESHOLD
    ) {
      (undatedBuckets[layer] ||= []).push(wc.clue);
      continue;
    }
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

  // Block 16: apply form_emergence / form_extinction clipping to every layer
  // BEFORE convergence zone computation. Layers whose entire band falls
  // outside the form's valid window collapse to null and read as "no signal"
  // in the viz. Convergence zones built below will only consider years
  // within the clipped windows.
  if (formBoundaries && (formBoundaries.emergence_date !== undefined || formBoundaries.extinction_date !== undefined)) {
    for (const l of layers) {
      const clipped = clipBand(l.date_floor, l.date_ceiling);
      l.date_floor = clipped.floor;
      l.date_ceiling = clipped.ceiling;
      if (clipped.collapsed) {
        // Layer's entire band is outside the form's valid window — reads as
        // "no signal" in the viz rather than implying the form could exist
        // at the (impossible) original date.
        l.source_count = 0;
        l.confidence = "none";
      }
    }
  }

  // Convergence zones: scan year-by-year across all populated layers; find spans
  // where ≥3 layers' envelopes contain that year. Threshold of 3 keeps zones
  // meaningful (≥2 is too noisy when style + style-wave + form often overlap
  // trivially; ≥3 requires at least one evidence-library layer agreement).
  const CONVERGENCE_THRESHOLD = 3;
  const populated = layers.filter((l) => {
    if (l.date_floor == null && l.date_ceiling == null) return false;
    // The form layer carries the form's catalog production span, not
    // independent dating evidence. When that span is open-ended (no ceiling —
    // e.g. "secrétaire à abattant, c. 1750–present"), it covers the entire
    // axis and would merge otherwise-distinct evidence zones into one
    // over-wide zone, defeating convergence. An open-ended span carries no
    // dating information, so it doesn't vote (it still renders as an
    // informational row in the viz). Forms with a BOUNDED window (telephone
    // bench c. 1900–1935, iron bed c. 1880–1920) keep voting — their span IS
    // a dating signal. Form impossibility is still enforced separately via
    // emergence/extinction clipping above.
    if (l.layer === "form" && l.date_ceiling == null) return false;
    return true;
  });

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
      const layerList = Array.from(currentZone.layers);
      zones.push({
        date_floor: currentZone.start,
        date_ceiling: year - 5,
        layer_count: currentZone.layers.size,
        authority_sum: layerList.reduce((s, l) => s + (LAYER_AUTHORITY[l] ?? 0), 0),
        layers: layerList,
      });
      currentZone = null;
    }
  }
  if (currentZone) {
    const layerList = Array.from(currentZone.layers);
    zones.push({
      date_floor: currentZone.start,
      date_ceiling: latest,
      layer_count: currentZone.layers.size,
      authority_sum: layerList.reduce((s, l) => s + (LAYER_AUTHORITY[l] ?? 0), 0),
      layers: layerList,
    });
  }

  // Style intersection: when a transitional intersection is supplied (two
  // style families OR two waves from different families with overlapping
  // date envelopes), inject a synthetic high-authority zone so the
  // convergence picker prefers the intersection band over generic layer
  // overlaps. The synthetic zone uses style_wave as its representative
  // layer name (purely for tooltip display); its authority_sum is set to
  // dominate the picker — wave-level intersections beat family-level
  // because waves are higher-resolution evidence.
  if (
    styleIntersection &&
    styleIntersection.date_ceiling > styleIntersection.date_floor
  ) {
    const syntheticAuthoritySum = styleIntersection.kind === "wave" ? 24 : 20;
    zones.unshift({
      date_floor: styleIntersection.date_floor,
      date_ceiling: styleIntersection.date_ceiling,
      layer_count: styleIntersection.participants.length,
      authority_sum: syntheticAuthoritySum,
      layers: [styleIntersection.kind === "wave" ? "style_wave" : "style"],
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
