/**
 * lib/engineStyleReconciliation.ts — Post-final-assessment style refinement
 *
 * Runs AFTER convergence refinement settles the final dating envelope.
 * Looks at the engine's attribution-time style winner + surfaced waves +
 * best_style_intersection + final dating, and picks the appraiser-voice
 * style label that the date actually supports.
 *
 * The problem this solves: attribution-time style picking (p3) names the
 * style FAMILY based on token matches. But the same family's vocabulary
 * is reused across centuries via revival waves. A piece dated c. 1900
 * with Louis XVI vocabulary is most accurately "Centennial French Louis
 * XVI Revival" — not "Louis XVI / French Neoclassical" (the original
 * 1770–1810 period that the family name implies). A piece dated c. 1935
 * with Federal vocabulary is a reproduction, not Federal-period.
 *
 * Reconciliation rules in priority order:
 *
 *   1. NAMED TRANSITIONAL period present (best_style_intersection.named_transitional_period)
 *      → use the named period as the final label (e.g., "Rococo to
 *        Renaissance Revival Transition"). Appraisers recognize and use
 *        these names in catalog descriptions.
 *
 *   2. IMPOSSIBLE PAIR detected on the attributions (handled by p5 already
 *      via detectImpossiblePairs; here we frame as "[Style] vocabulary
 *      (reproduction)" since neither attribution can be the original-period
 *      identification).
 *
 *   3. SURFACED WAVE whose date range overlaps the final dating AND whose
 *      parent_style_id matches the winning attribution's family
 *      → use the wave name (e.g., "Centennial French Louis XVI Revival").
 *      Pick the wave with the tightest overlap to the final dating.
 *
 *   4. ORIGINAL PERIOD of the attribution overlaps the final dating
 *      → keep the attribution name (the piece is in its original period;
 *      no refinement needed).
 *
 *   5. Final dating is AFTER all known waves and original period
 *      → "[Style] vocabulary, post-[date] reproduction" framing.
 *
 *   6. No style attribution at all (Golden Oak Era piece, etc.)
 *      → use the style_context (already computed by deriveStyleContext;
 *      this is what surfaces e.g. "Golden Oak Era" for wood-variant pieces).
 *
 * Outputs both a structured `final_style` object AND a one-line reason so
 * the report can show the appraiser "why this label, not that one."
 */

import type { StyleAttribution, StyleWaveAttribution } from "./engineStyleEvaluator";
import type { StyleIntersection } from "./engineStyleIntersection";

export type FinalStyleKind =
  | "named_transitional"   // best_style_intersection.named_transitional_period used
  | "transitional_generic" // intersection exists but no named period
  | "revival_wave"         // surfaced wave overlaps final dating
  | "original_period"      // attribution's own date range overlaps final dating
  | "reproduction"         // dating falls outside all waves AND original period
  | "context_only"         // no style attribution; using style_context fallback (Golden Oak, etc.)
  | "impossible_pair"      // detectImpossiblePairs flagged a reproduction signal
  | "unresolved";          // no attribution, no context, no dating to reconcile against

export type FinalStyleReconciliation = {
  final_style_label: string;
  kind: FinalStyleKind;
  final_style_reason: string;
  // The wave id (when kind === "revival_wave") or named period id (when
  // kind === "named_transitional") that drove the final label. Useful for
  // downstream UI to deep-link or surface the canonical entry.
  source_id?: string;
};

function rangesOverlap(
  aFloor: number | null,
  aCeil: number | null,
  bFloor: number | null,
  bCeil: number | null
): boolean {
  const aLo = aFloor ?? -Infinity;
  const aHi = aCeil ?? Infinity;
  const bLo = bFloor ?? -Infinity;
  const bHi = bCeil ?? Infinity;
  return aHi >= bLo && bHi >= aLo;
}

function overlapWidth(
  aFloor: number | null,
  aCeil: number | null,
  bFloor: number | null,
  bCeil: number | null
): number {
  const aLo = aFloor ?? -Infinity;
  const aHi = aCeil ?? Infinity;
  const bLo = bFloor ?? -Infinity;
  const bHi = bCeil ?? Infinity;
  const lo = Math.max(aLo, bLo);
  const hi = Math.min(aHi, bHi);
  return Math.max(0, hi - lo);
}

export function reconcileFinalStyle(input: {
  styleAttribution: StyleAttribution | null;
  styleWaves: StyleWaveAttribution[];
  bestIntersection: StyleIntersection | null;
  finalDatingFloor: number | null;
  finalDatingCeiling: number | null;
  styleContext: string | null;
  hasImpossiblePair: boolean;
}): FinalStyleReconciliation {
  const {
    styleAttribution,
    styleWaves,
    bestIntersection,
    finalDatingFloor,
    finalDatingCeiling,
    styleContext,
    hasImpossiblePair,
  } = input;

  // Rule 1: Named transitional period takes precedence (highest-resolution
  // appraiser-voice identification available).
  if (bestIntersection?.named_transitional_period) {
    return {
      final_style_label: bestIntersection.named_transitional_period.name,
      kind: "named_transitional",
      final_style_reason: `Two style vocabularies (${bestIntersection.participants.join(" + ")}) co-occur in the documented ${bestIntersection.named_transitional_period.name} window.`,
      source_id: bestIntersection.named_transitional_period.id,
    };
  }

  // Rule 2: Impossible-pair detection (handled by p5 via
  // detectImpossiblePairs). Override any other framing — the piece can't
  // be either pure original style. Use winner's vocabulary + reproduction
  // framing.
  if (hasImpossiblePair && styleAttribution) {
    return {
      final_style_label: `${styleAttribution.name} vocabulary (reproduction)`,
      kind: "impossible_pair",
      final_style_reason: `Two historically-incompatible style families both fire (see p5 conflicts); the piece carries the vocabulary of ${styleAttribution.name} but cannot be original-period production.`,
    };
  }

  // Rule 3: Surfaced wave whose date range overlaps final dating AND
  // matches the winning attribution's parent style family. Prefer the
  // wave with the widest overlap to the final dating.
  if (styleAttribution && finalDatingFloor != null && finalDatingCeiling != null) {
    const matchingWaves = styleWaves
      .filter(
        (w) =>
          w.parent_style_id === styleAttribution.style_family_id &&
          rangesOverlap(w.date_floor, w.date_ceiling, finalDatingFloor, finalDatingCeiling)
      )
      .sort(
        (a, b) =>
          overlapWidth(b.date_floor, b.date_ceiling, finalDatingFloor, finalDatingCeiling) -
          overlapWidth(a.date_floor, a.date_ceiling, finalDatingFloor, finalDatingCeiling)
      );
    if (matchingWaves.length > 0) {
      const w = matchingWaves[0];
      // Skip wave-refinement when the wave IS effectively the original
      // period (same date range as the attribution itself, common when
      // the family has an "Original X" wave that duplicates its frame).
      const waveIsOriginalPeriod =
        styleAttribution.date_floor != null &&
        styleAttribution.date_ceiling != null &&
        w.date_floor === styleAttribution.date_floor &&
        w.date_ceiling === styleAttribution.date_ceiling;
      if (!waveIsOriginalPeriod) {
        return {
          final_style_label: w.wave_name,
          kind: "revival_wave",
          final_style_reason: `Final dating (c. ${finalDatingFloor}–${finalDatingCeiling}) aligns with the ${w.wave_name} (c. ${w.date_floor}–${w.date_ceiling}) wave of ${styleAttribution.name}, not the original period.`,
          source_id: w.wave_id,
        };
      }
    }
  }

  // Rule 4: Original-period overlap with final dating — attribution is
  // already correct, no refinement needed.
  if (
    styleAttribution &&
    finalDatingFloor != null &&
    finalDatingCeiling != null &&
    rangesOverlap(styleAttribution.date_floor, styleAttribution.date_ceiling, finalDatingFloor, finalDatingCeiling)
  ) {
    return {
      final_style_label: styleAttribution.name,
      kind: "original_period",
      final_style_reason: `Final dating (c. ${finalDatingFloor}–${finalDatingCeiling}) falls within the original ${styleAttribution.name} period (c. ${styleAttribution.date_floor}–${styleAttribution.date_ceiling}).`,
    };
  }

  // Rule 5: Final dating is outside the attribution's original period AND
  // outside all surfaced waves. The piece carries the style's vocabulary
  // but cannot be original; frame as reproduction.
  if (
    styleAttribution &&
    finalDatingFloor != null &&
    finalDatingCeiling != null
  ) {
    return {
      final_style_label: `${styleAttribution.name} vocabulary (post-${finalDatingFloor} reproduction)`,
      kind: "reproduction",
      final_style_reason: `Final dating (c. ${finalDatingFloor}–${finalDatingCeiling}) falls outside the original ${styleAttribution.name} period (c. ${styleAttribution.date_floor}–${styleAttribution.date_ceiling}) and no surfaced revival wave covers this dating envelope. The piece carries ${styleAttribution.name} vocabulary but is later production.`,
    };
  }

  // Rule 6: No style attribution but a context label is present (e.g.,
  // Golden Oak Era market production). Use the context as the final label.
  if (!styleAttribution && styleContext) {
    return {
      final_style_label: styleContext,
      kind: "context_only",
      final_style_reason: `No style-family attribution; piece identified via the broader context "${styleContext}" (wood / finish / market-era anchor rather than a single style language).`,
    };
  }

  // Fallback: unresolved.
  return {
    final_style_label: styleAttribution?.name ?? styleContext ?? "Unresolved",
    kind: "unresolved",
    final_style_reason:
      styleAttribution
        ? `Final dating unavailable; defaulting to attribution-time style label ${styleAttribution.name}.`
        : "No style attribution or context could be derived from the available evidence.",
  };
}
