/**
 * lib/engineStyleIntersection.ts — Transitional-piece reasoning
 *
 * Computes date-envelope intersections across competing style attributions
 * and across surfaced revival waves from different parent style families.
 * The intersection band of two co-occurring styles (e.g., Rococo Revival
 * 1845–1885 ∩ Renaissance Revival 1855–1885 = 1855–1885) is the dating
 * window in which BOTH style vocabularies were in production — and is the
 * most likely production window for a piece carrying both vocabularies.
 *
 * Architectural lift addressed: previously the engine picked the top style
 * attribution as the winner and demoted alternatives by 30% via competitive
 * suppression. Style alternatives never contributed their date envelopes to
 * the dating overlap. For TRANSITIONAL pieces (which the appraiser notes
 * are the majority of real pieces), this discarded the most diagnostic
 * dating signal the engine could produce — the moment when two styles
 * historically co-occurred.
 *
 * Surfaces produced:
 *   - StyleIntersection: a single named overlap band with participants
 *     and provenance (family-pair or wave-pair).
 *   - best_intersection: the tightest qualifying intersection; consumed by
 *     the dating-overlap convergence math as a high-authority anchor and by
 *     the chart as a transitional-overlap highlight band.
 *
 * Intent: HOLD TIGHT thresholds. We don't want to label every accidental
 * 2-year overlap a "transitional" piece. Intersection must be tighter than
 * either source range (otherwise it's just one source's full range) AND
 * pulled from distinct parent style families (otherwise it's intra-family
 * wave noise we already handle).
 */

import type { StyleAttribution, StyleWaveAttribution } from "./engineStyleEvaluator";

export type StyleIntersection = {
  kind: "family" | "wave";
  participants: string[];          // display names; e.g. ["Rococo Revival", "Renaissance Revival"]
  participant_ids: string[];       // style_family_ids OR wave_ids
  date_floor: number;
  date_ceiling: number;
  width: number;                   // ceiling - floor; tighter = stronger
  source_summary: string;          // human-readable reason for surfacing
};

const QUALIFYING_ATTRIBUTION_CONFIDENCE = 0.5;

// A pair must overlap by at least this many years to count as a real
// intersection. Below this, the overlap is incidental, not historical.
const MIN_OVERLAP_YEARS = 5;

// The intersection band must be at least this much tighter than each source
// range to be considered "tightening." Otherwise the intersection is
// effectively the same as the narrower source and adds no new information.
const MIN_TIGHTENING_RATIO = 0.7; // intersection ≤ 70% of narrower source

function rangeOverlap(
  aFloor: number | null,
  aCeil: number | null,
  bFloor: number | null,
  bCeil: number | null
): { floor: number; ceiling: number } | null {
  if (aFloor == null || aCeil == null || bFloor == null || bCeil == null) return null;
  const floor = Math.max(aFloor, bFloor);
  const ceiling = Math.min(aCeil, bCeil);
  if (ceiling - floor < MIN_OVERLAP_YEARS) return null;
  return { floor, ceiling };
}

function isTightening(
  intersectionWidth: number,
  aWidth: number,
  bWidth: number
): boolean {
  const narrower = Math.min(aWidth, bWidth);
  if (narrower <= 0) return false;
  return intersectionWidth <= narrower * MIN_TIGHTENING_RATIO;
}

export type StyleIntersectionResult = {
  intersections: StyleIntersection[];
  best: StyleIntersection | null;
};

export function computeStyleIntersections(
  styleAttribution: StyleAttribution | null,
  styleAlternatives: StyleAttribution[],
  styleWaves: StyleWaveAttribution[]
): StyleIntersectionResult {
  const intersections: StyleIntersection[] = [];

  // ── Family-level intersections ──────────────────────────────────────
  // Pool: winning attribution + alternatives that meet the qualifying
  // confidence floor. Pairs must come from DIFFERENT style_family_ids
  // (an attribution paired with itself isn't an intersection).
  const familyPool: StyleAttribution[] = [];
  if (styleAttribution && styleAttribution.confidence >= QUALIFYING_ATTRIBUTION_CONFIDENCE) {
    familyPool.push(styleAttribution);
  }
  for (const alt of styleAlternatives) {
    if (alt.confidence >= QUALIFYING_ATTRIBUTION_CONFIDENCE) familyPool.push(alt);
  }
  // Dedupe by style_family_id; keep the highest-confidence representative.
  const familyById = new Map<string, StyleAttribution>();
  for (const f of familyPool) {
    const existing = familyById.get(f.style_family_id);
    if (!existing || f.confidence > existing.confidence) {
      familyById.set(f.style_family_id, f);
    }
  }
  const families = Array.from(familyById.values());

  for (let i = 0; i < families.length; i++) {
    for (let j = i + 1; j < families.length; j++) {
      const a = families[i];
      const b = families[j];
      const overlap = rangeOverlap(a.date_floor, a.date_ceiling, b.date_floor, b.date_ceiling);
      if (!overlap) continue;
      const aWidth = (a.date_ceiling ?? 0) - (a.date_floor ?? 0);
      const bWidth = (b.date_ceiling ?? 0) - (b.date_floor ?? 0);
      const interWidth = overlap.ceiling - overlap.floor;
      if (!isTightening(interWidth, aWidth, bWidth)) continue;
      intersections.push({
        kind: "family",
        participants: [a.name, b.name],
        participant_ids: [a.style_family_id, b.style_family_id],
        date_floor: overlap.floor,
        date_ceiling: overlap.ceiling,
        width: interWidth,
        source_summary: `${a.name} and ${b.name} both in production c. ${overlap.floor}–${overlap.ceiling}`,
      });
    }
  }

  // ── Wave-level intersections ────────────────────────────────────────
  // Same logic but on surfaced waves whose parent_style_ids differ.
  // Wave-level intersections are typically tighter than family-level
  // because waves are themselves tight date windows.
  for (let i = 0; i < styleWaves.length; i++) {
    for (let j = i + 1; j < styleWaves.length; j++) {
      const a = styleWaves[i];
      const b = styleWaves[j];
      // Skip same-parent waves — those are intra-family wave overlap, not
      // cross-style transitional evidence.
      if (a.parent_style_id === b.parent_style_id) continue;
      const overlap = rangeOverlap(a.date_floor, a.date_ceiling, b.date_floor, b.date_ceiling);
      if (!overlap) continue;
      const aWidth = (a.date_ceiling ?? 0) - (a.date_floor ?? 0);
      const bWidth = (b.date_ceiling ?? 0) - (b.date_floor ?? 0);
      const interWidth = overlap.ceiling - overlap.floor;
      if (!isTightening(interWidth, aWidth, bWidth)) continue;
      intersections.push({
        kind: "wave",
        participants: [a.wave_name, b.wave_name],
        participant_ids: [a.wave_id, b.wave_id],
        date_floor: overlap.floor,
        date_ceiling: overlap.ceiling,
        width: interWidth,
        source_summary: `${a.wave_name} (${a.date_floor}–${a.date_ceiling}) overlaps ${b.wave_name} (${b.date_floor}–${b.date_ceiling}) at c. ${overlap.floor}–${overlap.ceiling}`,
      });
    }
  }

  // Sort by tightness (narrowest first); ties broken by wave > family
  // (waves are higher-resolution evidence).
  intersections.sort((x, y) => {
    if (x.width !== y.width) return x.width - y.width;
    if (x.kind !== y.kind) return x.kind === "wave" ? -1 : 1;
    return 0;
  });

  return {
    intersections,
    best: intersections[0] ?? null,
  };
}
