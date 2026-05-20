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
 *   6. No style attribution but a non-empty style_context fallback was
 *      produced by deriveStyleContext (Jacobean, Queen Anne / Colonial
 *      Revival, American Empire / late Classical Revival from text cues).
 *      → use the style_context as the final label. Note: Golden Oak Era
 *      pieces are NOT handled here — per appraiser direction, Golden Oak
 *      is a vernacular dating/material/era marker (NOT a style), and
 *      deriveStyleContext returns null for Golden Oak clues. The era
 *      anchor surfaces via the wood-evidence dating layer instead.
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
  | "late_period"          // dating sits modestly past the canonical ceiling, no modern hard negative — provincial / persistence production, not a reproduction
  | "reproduction"         // dating falls outside all waves AND original period
  | "context_only"         // no style attribution; using style_context fallback (Jacobean / Queen Anne / Empire text cues; NOT Golden Oak — that's a wood/era marker, not a style)
  | "era_only"             // no style attribution; era marker present (Golden Oak Era and similar vernacular dating/material/market-era anchors that are NOT styles). Final label frames the era as a market-context identification.
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

/**
 * Strip the "Academic" qualifier from a style-family display label.
 *
 * Stress-test fix #2 (2026-05-20). Two consecutive revival-chair scans
 * surfaced the same pattern: commercial American revival pieces (French
 * Provincial chair labeled "Academic French Louis XV Revival"; Colonial
 * Revival Queen Anne chair labeled "Academic Colonial Revival" patterns)
 * were getting the "Academic" qualifier despite not demonstrating the
 * stylistic purity, carving sophistication, refined proportions, or
 * formal execution that the label implies.
 *
 * Per appraiser direction: "Academic" should ONLY apply when carving
 * depth, proportional refinement, period high-end maker marks, or
 * other positive evidence of academic execution is present. The
 * default behavior should be to NOT use "Academic" — most c.1900-1930
 * American revival production was commercial, not academic.
 *
 * Until Fix #1 (commercial simplification suppression) lands with the
 * positive-evidence detection that would let us conditionally restore
 * "Academic" on pieces that demonstrate it, the safest default is to
 * strip the qualifier entirely. Applied at label-display time only —
 * the canonical style_family_id and family lookup are unchanged so
 * engine reasoning still works against the original entries.
 *
 * Edge cases handled:
 *   "Academic French Louis XVI Revival" → "French Louis XVI Revival"
 *   "Academic / Museum Colonial Revival" → "Museum-aware Colonial Revival"
 *   "Academic Colonial Revival Chippendale" → "Colonial Revival Chippendale"
 *   "Academic Federal / Sheraton Revival" → "Federal / Sheraton Revival"
 */
function softenAcademicLabel(label: string | null | undefined): string {
  if (!label) return label || "";
  return label
    .replace(/^Academic \/ Museum /, "Museum-aware ")
    .replace(/^Academic /, "")
    .trim();
}

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
  /** Vernacular dating/material/market-era marker that is NOT a style.
   * Currently populated for Golden Oak Era pieces. Used by Rule 7 (era_only)
   * when no style attribution and no style_context are present, to produce
   * a final label that frames the era as a market-context identification
   * rather than leaving the piece "Unresolved". */
  eraContext?: string | null;
  hasImpossiblePair: boolean;
  /** True when a hard-negative modern-construction marker is present (plywood
   * post-1920, phillips screws post-1935, staples post-1945, polyurethane,
   * particle board). When true, a date past the canonical style ceiling IS a
   * reproduction — the late-period / persistence path (Rule 4.5) is suppressed
   * and we fall through to reproduction framing. Absent such a marker, a date
   * modestly past the ceiling reads as genuine late-period production. */
  hasModernHardNegative?: boolean;
}): FinalStyleReconciliation {
  const {
    styleAttribution,
    styleWaves,
    bestIntersection,
    finalDatingFloor,
    finalDatingCeiling,
    styleContext,
    eraContext,
    hasImpossiblePair,
    hasModernHardNegative = false,
  } = input;

  // Fix B (original-over-revival): when the final dating FLOOR sits within the
  // attribution's original-period window and no modern-construction hard
  // negative is present, the piece is anchored in its original period — a
  // revival wave it merely clips at the late edge must NOT override that read.
  // Without this guard a 19th-c. Biedermeier piece whose evidence converges on
  // 1815–1910 gets labeled "Biedermeier Revival" only because the 1900–1910
  // tail of that range touches the 1900–1920 revival wave. When true, Rule 3
  // (revival) is skipped so reconciliation falls through to Rule 4
  // (original_period). A modern hard negative (plywood, phillips, staples)
  // disables the guard — then a date past the period genuinely is a
  // revival/reproduction.
  const anchoredInOriginalPeriod =
    !hasModernHardNegative &&
    styleAttribution != null &&
    styleAttribution.date_floor != null &&
    styleAttribution.date_ceiling != null &&
    finalDatingFloor != null &&
    finalDatingFloor >= styleAttribution.date_floor &&
    finalDatingFloor <= styleAttribution.date_ceiling;

  // Rule 1: Named transitional period takes precedence (highest-resolution
  // appraiser-voice identification available) — BUT only when the named
  // period's date range actually overlaps the final dating envelope.
  //
  // Without this guard, Rule 1 was firing too eagerly during stress-test:
  // a piece whose style VOCABULARY matched a named transitional window
  // (e.g., "William and Mary to Queen Anne Transition", 1690–1730, or
  // "Rococo to Renaissance Revival Transition", c. 1860–1875) was being
  // labeled as that ORIGINAL transitional period even when the
  // construction evidence + revival-wave evidence pointed at a
  // 19th-c-or-later REVIVAL. Result: a Victorian-revival slant-front
  // desk dated 1920–1930 got the name "William and Mary to Queen Anne
  // Transition" — implying 1690–1730. Same pattern hit a Victorian shelf
  // clock that picked up "Rococo to Renaissance Revival Transition" but
  // was actually c. 1875–1895 Eastlake.
  //
  // The fix: require the named transitional period's date range to
  // overlap the final dating envelope before applying the named-period
  // label. If it doesn't overlap, fall through to Rule 3 (revival wave
  // matching) or Rule 5 (reproduction framing) so the report's style
  // label honestly reflects what the dating actually supports.
  if (bestIntersection?.named_transitional_period) {
    const ntp = bestIntersection.named_transitional_period;
    const ntpFloor =
      ntp.period_associations && ntp.period_associations[0]
        ? ntp.period_associations[0].date_floor ?? null
        : null;
    const ntpCeiling =
      ntp.period_associations && ntp.period_associations[0]
        ? ntp.period_associations[0].date_ceiling ?? null
        : null;
    const ntpOverlapsFinalDating =
      finalDatingFloor == null ||
      finalDatingCeiling == null ||
      rangesOverlap(ntpFloor, ntpCeiling, finalDatingFloor, finalDatingCeiling);
    if (ntpOverlapsFinalDating) {
      const softParticipants = bestIntersection.participants.map(softenAcademicLabel);
      return {
        final_style_label: ntp.name,
        kind: "named_transitional",
        final_style_reason: `Two style vocabularies (${softParticipants.join(" + ")}) co-occur in the documented ${ntp.name} window.`,
        source_id: ntp.id,
      };
    }
    // Otherwise fall through. The piece carries the named period's
    // vocabulary but its dating doesn't fall within that window —
    // almost certainly a revival of the named transitional style
    // rather than the original transitional production.
  }

  // Rule 2: Impossible-pair detection (handled by p5 via
  // detectImpossiblePairs). Override any other framing — the piece can't
  // be either pure original style. Use winner's vocabulary + reproduction
  // framing.
  if (hasImpossiblePair && styleAttribution) {
    const softName = softenAcademicLabel(styleAttribution.name);
    return {
      final_style_label: `${softName} vocabulary (reproduction)`,
      kind: "impossible_pair",
      final_style_reason: `Two historically-incompatible style families both fire (see p5 conflicts); the piece carries the vocabulary of ${softName} but cannot be original-period production.`,
    };
  }

  // Rule 3: Surfaced wave whose date range overlaps final dating AND
  // matches the winning attribution's parent style family. Prefer the
  // wave with the widest overlap to the final dating. Skipped when the piece
  // is anchored in its original period (Fix B above).
  if (!anchoredInOriginalPeriod && styleAttribution && finalDatingFloor != null && finalDatingCeiling != null) {
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
        const softWaveName = softenAcademicLabel(w.wave_name);
        const softAttrName = softenAcademicLabel(styleAttribution.name);
        return {
          final_style_label: softWaveName,
          kind: "revival_wave",
          final_style_reason: `Final dating (c. ${finalDatingFloor}–${finalDatingCeiling}) aligns with the ${softWaveName} (c. ${w.date_floor}–${w.date_ceiling}) wave of ${softAttrName}, not the original period.`,
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
    const softName = softenAcademicLabel(styleAttribution.name);
    return {
      final_style_label: softName,
      kind: "original_period",
      final_style_reason: `Final dating (c. ${finalDatingFloor}–${finalDatingCeiling}) falls within the original ${softName} period (c. ${styleAttribution.date_floor}–${styleAttribution.date_ceiling}).`,
    };
  }

  // Rule 4.5: Final dating sits MODESTLY past the attribution's canonical
  // ceiling, with no modern-construction hard negative present. Real furniture
  // production doesn't stop at the canonical period boundary — regional shops,
  // provincial makers, and conservative urban cabinetmakers kept producing
  // Empire / Biedermeier / Classical forms for decades past the fashionable
  // peak. Absent a modern hard negative (plywood, phillips screws, staples,
  // polyurethane), a date a few decades past the ceiling reads as genuine
  // late-period / persistence production, NOT a 20th-century reproduction.
  // Past the tolerance — or with a modern hard negative — we fall through to
  // Rule 5's reproduction framing. This guards against the engine flipping a
  // genuinely-old piece to "reproduction" the moment its date drifts one year
  // past a hard style boundary.
  const PERSISTENCE_TOLERANCE_YEARS = 60;
  if (
    styleAttribution &&
    finalDatingFloor != null &&
    finalDatingCeiling != null &&
    styleAttribution.date_ceiling != null &&
    !hasModernHardNegative &&
    finalDatingFloor > styleAttribution.date_ceiling &&
    finalDatingFloor <= styleAttribution.date_ceiling + PERSISTENCE_TOLERANCE_YEARS
  ) {
    const softName = softenAcademicLabel(styleAttribution.name);
    return {
      final_style_label: `${softName} (late-period production)`,
      kind: "late_period",
      final_style_reason: `Final dating (c. ${finalDatingFloor}–${finalDatingCeiling}) falls just past the canonical ${softName} period (c. ${styleAttribution.date_floor}–${styleAttribution.date_ceiling}), within the window where regional and provincial shops kept producing the form. No modern-construction markers contradict an authentic piece, so this reads as late-period / persistence production rather than a later reproduction.`,
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
    const softName = softenAcademicLabel(styleAttribution.name);
    return {
      final_style_label: `${softName} vocabulary (post-${finalDatingFloor} reproduction)`,
      kind: "reproduction",
      final_style_reason: `Final dating (c. ${finalDatingFloor}–${finalDatingCeiling}) falls outside the original ${softName} period (c. ${styleAttribution.date_floor}–${styleAttribution.date_ceiling}) and no surfaced revival wave covers this dating envelope. The piece carries ${softName} vocabulary but is later production.`,
    };
  }

  // Rule 6: No style attribution but a style_context fallback is present
  // (Jacobean / Queen Anne / Empire from text cues). Use the context as
  // the final label. Note: per appraiser direction, Golden Oak Era does
  // NOT flow through this rule — Golden Oak is a vernacular era marker
  // (NOT a style), and deriveStyleContext now returns null for Golden Oak
  // clues. Era markers are handled by Rule 7 below.
  if (!styleAttribution && styleContext) {
    return {
      final_style_label: styleContext,
      kind: "context_only",
      final_style_reason: `No style-family attribution; piece identified via the broader style context "${styleContext}" derived from text cues.`,
    };
  }

  // Rule 7: No style attribution AND no style_context, but an era marker
  // (eraContext) is present. Surface the era as a market-context
  // identification — explicitly framed as NOT a style. Currently fires for
  // Golden Oak Era pieces; future vernacular era markers (Centennial Era,
  // Depression Era, Post-War Era, etc.) can route here.
  if (!styleAttribution && !styleContext && eraContext) {
    return {
      final_style_label: `${eraContext} market production`,
      kind: "era_only",
      final_style_reason: `No style-family attribution; piece carries ${eraContext} vernacular dating/material/market-era markers (wood species, finish, cut pattern, factory hardware). ${eraContext} is a production-era anchor, not a style — pieces from this era may be in any of several actual styles (Eastlake, Mission, Colonial Revival, etc.) or have no specific style language. The era marker contributes to dating via the wood-evidence layer.`,
    };
  }

  // Fallback: unresolved.
  const softName = softenAcademicLabel(styleAttribution?.name);
  return {
    final_style_label: softName || styleContext || "Unresolved",
    kind: "unresolved",
    final_style_reason:
      styleAttribution
        ? `Final dating unavailable; defaulting to attribution-time style label ${softName}.`
        : "No style attribution or context could be derived from the available evidence.",
  };
}
