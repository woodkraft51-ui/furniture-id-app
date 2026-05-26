/**
 * lib/datingFindingNarrative.ts
 *
 * Builds a human-readable "what the evidence shows" headline + optional
 * detail paragraph for the Dating Overlap by Evidence Layer section.
 * The narrative synthesizes the engine's structured outputs (convergence
 * zones, style attribution, final-style reconciliation, working date
 * range) into appraiser-voice prose that explains the dating finding.
 *
 * Pure function — UI-free, easily testable. Consumed by the DatingOverlap
 * section in app/page.tsx.
 *
 * Architecture:
 * - Branches by FinalStyleKind (most specific first) so each
 *   reconciliation case gets its own framing
 * - Falls through to convergence-zone + working-range framing when
 *   final_style isn't conclusive (unresolved kind)
 * - Falls further through to "widest individual signal" framing when
 *   no convergence zones exist
 * - Caution tones reserved for impossible_pair / reproduction cases
 *
 * Edge cases handled:
 * - impossible_pair (Chippendale × Art Deco fantasy)
 * - reproduction (post-period dating + original-style vocabulary)
 * - era_only (Golden Oak Era and similar vernacular era markers)
 * - named_transitional (documented transitional period)
 * - transitional_generic (untyped style intersection)
 * - revival_wave (Centennial / Edwardian / Postwar etc. revivals)
 * - original_period (attribution dates within original period)
 * - context_only (Jacobean/Queen Anne/Empire from text cues)
 * - unresolved with convergence (zones exist but no style)
 * - unresolved without convergence (limited evidence)
 * - no data (defensive null return)
 */

import type { ConvergenceZone, DatingOverlapData, LayerDateBand } from "./engineDatingOverlap";
import { pickStrongestZoneIndex } from "./engineDatingOverlap";
import type { FinalStyleReconciliation } from "./engineStyleReconciliation";
import type { StyleAttribution } from "./engineStyleEvaluator";

export type NarrativeTone = "confident" | "qualified" | "tentative" | "caution";

export type DatingFindingNarrative = {
  headline: string;
  detail?: string;
  tone: NarrativeTone;
};

// Human-readable layer labels for prose. Mirrors LAYER_LABELS in
// app/page.tsx but maintained here to avoid UI dependency in this module.
const LAYER_HUMAN_LABELS: Record<string, string> = {
  form: "form",
  style: "style attribution",
  style_wave: "design distinctives",
  joinery: "joinery",
  fastener: "fasteners",
  fasteners: "fasteners",
  toolmark: "toolmarks",
  toolmarks: "toolmarks",
  wood: "wood/substrate",
  finish: "finish",
  hardware: "hardware",
  upholstery: "upholstery",
};

function humanLayer(layer: string): string {
  return LAYER_HUMAN_LABELS[layer] ?? layer.replace(/_/g, " ");
}

function joinHuman(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function formatRange(floor: number | null | undefined, ceiling: number | null | undefined): string {
  if (floor != null && ceiling != null) {
    // T1c: never render an inverted ("c. 1945–1910") or zero-width ("c. 1910–1910")
    // range. An inverted pair means the floor is the binding terminus-post-quem;
    // a degenerate pair is a single year, not a span.
    if (floor > ceiling) return `post-${floor}`;
    if (floor === ceiling) return `c. ${floor}`;
    return `c. ${floor}–${ceiling}`;
  }
  if (floor != null) return `post-${floor}`;
  if (ceiling != null) return `pre-${ceiling}`;
  return "uncertain";
}

function findStrongestZone(zones: ConvergenceZone[]): { zone: ConvergenceZone; idx: number } | null {
  if (zones.length === 0) return null;
  // Delegate to the shared picker so the narrative's "strongest zone" always
  // matches the chart chip's (specificity-weighted authority + layer count).
  const idx = pickStrongestZoneIndex(zones);
  return { zone: zones[idx], idx };
}

// Layers that genuinely corroborate the zone (specificity >= 0.5) — the same
// count the chart chip headlines, so prose and chip never disagree. Falls back
// to the raw layer count for older report shapes.
function corroboratingCount(zone: ConvergenceZone): number {
  return zone.specific_layer_count ?? zone.layer_count;
}

function summarizeZoneLayers(zone: ConvergenceZone): string {
  // Enumerate only the corroborating (specific) layers so the listed layers
  // match corroboratingCount — a broad/open-ended layer that merely spans the
  // zone shouldn't be named as if it pins the date. Falls back to all layers
  // for older report shapes or zones with no specific subset recorded.
  const src =
    zone.specific_layers && zone.specific_layers.length > 0
      ? zone.specific_layers
      : zone.layers;
  return joinHuman(src.map(humanLayer));
}

export function buildDatingFindingNarrative(input: {
  data: DatingOverlapData;
  styleAttribution: StyleAttribution | null;
  finalStyle: FinalStyleReconciliation | null;
  finalDatingFloor: number | null;
  finalDatingCeiling: number | null;
}): DatingFindingNarrative | null {
  const { data, styleAttribution, finalStyle, finalDatingFloor, finalDatingCeiling } = input;

  // Defensive: no useful data at all → no narrative
  if (
    data.layers.length === 0 &&
    data.convergence_zones.length === 0 &&
    !styleAttribution &&
    !finalStyle
  ) {
    return null;
  }

  let strongest = findStrongestZone(data.convergence_zones);
  // T1c: a zone with ZERO corroborating (specific) layers is a degenerate
  // artifact of open-ended layers intersecting at a point — not a real
  // convergence. Don't let it be presented as "the strongest layer convergence"
  // (which produced "c. 1910–1910 (0 corroborating layers)" on the Woodard chair).
  if (strongest && corroboratingCount(strongest.zone) <= 0) strongest = null;
  const workingRange = formatRange(finalDatingFloor, finalDatingCeiling);
  const kind = finalStyle?.kind;
  const styleName = styleAttribution?.name ?? null;

  // ─── Case 1: impossible_pair ───
  // Two incompatible styles fired together. Caution tone.
  if (kind === "impossible_pair") {
    const styleLabel = styleName ?? "the attributed style";
    return {
      headline:
        `This piece carries ${styleLabel} vocabulary, but evidence dates it ${workingRange} — well after the original ${styleLabel} period. ` +
        `Best read as a reproduction or fantasy piece combining style elements that didn't coexist historically.`,
      detail: finalStyle?.final_style_reason,
      tone: "caution",
    };
  }

  // ─── Case 2: reproduction ───
  // Original-style vocabulary, post-period dating.
  if (kind === "reproduction") {
    const styleLabel = styleName ?? "The attributed style";
    return {
      headline:
        `${styleLabel} vocabulary on a piece dating ${workingRange} — well after the original ${styleLabel} period. ` +
        `This is later production, not original-period.`,
      detail: finalStyle?.final_style_reason,
      tone: "qualified",
    };
  }

  // ─── Case 2.5: late_period (provincial / persistence production) ───
  // Date sits modestly past the canonical ceiling with no modern hard
  // negative — authentic late-period production, not a reproduction.
  if (kind === "late_period") {
    const styleLabel = styleName ?? "the attributed style";
    const headline =
      `Evidence dates this piece ${workingRange} — just past the canonical ${styleLabel} period, but with no modern-construction markers. ` +
      `This reads as genuine late-period / provincial production, where regional shops kept making the form past the fashionable peak — not a later reproduction.`;
    return { headline, detail: finalStyle?.final_style_reason, tone: "qualified" };
  }

  // ─── Case 3: era_only (Golden Oak Era and similar vernacular markers) ───
  if (kind === "era_only") {
    const eraName = finalStyle?.final_style_label?.replace(/\s+market production$/, "") ?? "the era";
    const convergenceClause = strongest
      ? ` Evidence converges most strongly at ${formatRange(strongest.zone.date_floor, strongest.zone.date_ceiling)} (${corroboratingCount(strongest.zone)} corroborating layer${corroboratingCount(strongest.zone) !== 1 ? "s" : ""}: ${summarizeZoneLayers(strongest.zone)}).`
      : "";
    return {
      headline:
        `No specific style attribution — the piece carries ${eraName} market-production markers (wood species, finish, cut pattern, factory hardware). ` +
        `${eraName} is a production-era anchor, not a style; pieces from this era can be in any of several actual styles or have no specific style language.${convergenceClause}`,
      tone: "qualified",
    };
  }

  // ─── Case 4: named_transitional (documented transitional period) ───
  if (kind === "named_transitional") {
    const headline = `${finalStyle?.final_style_label} — both style vocabularies were in production during this window. Working range ${workingRange}.`;
    const detail = strongest
      ? `Strongest layer convergence: ${formatRange(strongest.zone.date_floor, strongest.zone.date_ceiling)} (${corroboratingCount(strongest.zone)} corroborating layer${corroboratingCount(strongest.zone) !== 1 ? "s" : ""}: ${summarizeZoneLayers(strongest.zone)}). ${finalStyle?.final_style_reason ?? ""}`.trim()
      : finalStyle?.final_style_reason;
    return { headline, detail, tone: "confident" };
  }

  // ─── Case 5: transitional_generic (untyped style intersection) ───
  if (kind === "transitional_generic") {
    return {
      headline:
        `Transitional piece — two style vocabularies overlap at ${workingRange}. This piece sits in the overlap window and may combine elements from both. ${finalStyle?.final_style_label ?? ""}`,
      detail: finalStyle?.final_style_reason,
      tone: "confident",
    };
  }

  // ─── Case 6: revival_wave ───
  if (kind === "revival_wave") {
    const headline = strongest
      ? `Evidence aligns with ${finalStyle?.final_style_label}. The strongest layer convergence is ${formatRange(strongest.zone.date_floor, strongest.zone.date_ceiling)} (${corroboratingCount(strongest.zone)} corroborating layer${corroboratingCount(strongest.zone) !== 1 ? "s" : ""}: ${summarizeZoneLayers(strongest.zone)}), consistent with the working range ${workingRange}.`
      : `Evidence aligns with ${finalStyle?.final_style_label}. Working range ${workingRange}.`;
    const detail =
      data.convergence_zones.length > 1 && strongest
        ? `A secondary convergence zone exists, but the ${formatRange(strongest.zone.date_floor, strongest.zone.date_ceiling)} reading is the strongest — it carries the most corroborating specific layers and the highest weighted authority.`
        : undefined;
    return { headline, detail, tone: "confident" };
  }

  // ─── Case 7: original_period ───
  if (kind === "original_period") {
    const styleLabel = styleName ?? "the attributed style";
    const headline = strongest
      ? `Evidence places this piece in the original ${styleLabel} period, ${workingRange}. The strongest layer convergence is ${formatRange(strongest.zone.date_floor, strongest.zone.date_ceiling)} (${corroboratingCount(strongest.zone)} corroborating layer${corroboratingCount(strongest.zone) !== 1 ? "s" : ""}: ${summarizeZoneLayers(strongest.zone)}).`
      : `Evidence places this piece in the original ${styleLabel} period, ${workingRange}.`;
    return { headline, tone: "confident" };
  }

  // ─── Case 8: context_only (Jacobean/Queen Anne/Empire from text cues) ───
  if (kind === "context_only") {
    const headline = `No formal style attribution; piece identified via "${finalStyle?.final_style_label}" derived from text cues. Working range ${workingRange}.`;
    const detail = strongest
      ? `Strongest layer convergence: ${formatRange(strongest.zone.date_floor, strongest.zone.date_ceiling)} (${corroboratingCount(strongest.zone)} corroborating layer${corroboratingCount(strongest.zone) !== 1 ? "s" : ""}).`
      : undefined;
    return { headline, detail, tone: "qualified" };
  }

  // ─── Case 9: unresolved with convergence — zones exist ───
  if (data.convergence_zones.length > 0 && strongest) {
    // "unresolved" means style + date couldn't be reconciled into a period —
    // NOT that no style was found. A style is often attributed here, so don't
    // claim "no specific style was attributed" when styleAttribution exists.
    const styleClause = styleName
      ? `style reads as ${styleName}, though the evidence doesn't resolve it to a specific period`
      : `no specific style was attributed`;
    const rangeSentence =
      workingRange === "uncertain"
        ? `The working range stays broad pending tighter evidence.`
        : `Working range ${workingRange}.`;
    return {
      headline:
        `Evidence converges at ${formatRange(strongest.zone.date_floor, strongest.zone.date_ceiling)} (${corroboratingCount(strongest.zone)} corroborating layer${corroboratingCount(strongest.zone) !== 1 ? "s" : ""}: ${summarizeZoneLayers(strongest.zone)}); ${styleClause}. ` +
        rangeSentence,
      tone: "qualified",
    };
  }

  // ─── Case 10: unresolved without convergence — fall back to layer signals ───
  const datedLayers = (data.layers ?? []).filter(
    (l) => l.date_floor != null || l.date_ceiling != null
  );
  if (datedLayers.length === 0) {
    return {
      headline:
        `Limited dating evidence — no individual layer produced a parseable date range. ` +
        `Identification rests on form and material observations alone.`,
      tone: "tentative",
    };
  }

  // Find the narrowest individual layer signal as the strongest single anchor
  let narrowest: LayerDateBand = datedLayers[0];
  let narrowestWidth =
    (narrowest.date_ceiling ?? 2040) - (narrowest.date_floor ?? 1600);
  for (const l of datedLayers.slice(1)) {
    const w = (l.date_ceiling ?? 2040) - (l.date_floor ?? 1600);
    if (w < narrowestWidth) {
      narrowest = l;
      narrowestWidth = w;
    }
  }

  const broadSentence =
    workingRange === "uncertain"
      ? `The working range remains broad.`
      : `Working range remains broad at ${workingRange}.`;
  return {
    headline:
      `Evidence layers don't converge on a tight window. ` +
      `Narrowest individual signal: ${humanLayer(narrowest.layer)} at ${formatRange(narrowest.date_floor, narrowest.date_ceiling)}. ` +
      broadSentence,
    tone: "tentative",
  };
}
