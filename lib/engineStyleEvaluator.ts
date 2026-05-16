/**
 * lib/engineStyleEvaluator.ts — Block 2a
 *
 * Consumes lib/constraints/styleFamilies.ts to produce structured style
 * attribution from observation evidence. Replaces engine's free-text
 * style derivation (deriveStyleContext + ad-hoc observation parsing).
 *
 * Per synthesis 7.B.3: style attribution proceeds independently from
 * form identification. This evaluator returns a structured attribution
 * { style_family_id, name, date range, confidence, matched_terms } that
 * p3 surfaces alongside form_id.
 *
 * Matching strategy (D-PH3-8 inline):
 *   1. For each style family, build token set from name +
 *      canonical_source_aliases (lowercase, hyphens→spaces).
 *   2. For each engine clue key or observation description, extract
 *      tokens.
 *   3. Match tokens; rank by match count + canonical positive_authority.
 *   4. Top attribution wins; alternatives carried for report layer.
 *
 * Block 2b (style-wave aggregator) will reuse the attribution to filter
 * STYLE_REVIVAL_WAVES and surface wave-level evidence.
 */

import { STYLE_FAMILIES, STYLE_REVIVAL_WAVES } from "./constraints/styleFamilies";
import type { StyleFamilyEntry, StyleRevivalWaveEntry } from "./constraints/styleFamilies";

export type StyleAttribution = {
  style_family_id: string;
  name: string;
  date_floor: number | null;
  date_ceiling: number | null;
  confidence: number;            // 0-1; 2+ token matches = strong (≥0.7), 1 match = weak (~0.5)
  matched_terms: string[];
};

// Tokens that appear in nearly every style name and shouldn't gate matches
const STOP_TOKENS = new Set([
  "and", "the", "of", "or", "style", "pattern", "case", "form",
  "revival", "movement", "period", "early", "late", "modern",
]);

type FamilyIndex = {
  family: StyleFamilyEntry;
  tokens: Set<string>; // tokens that uniquely-ish identify this family
};

let familyIndex: FamilyIndex[] | null = null;
// token → number of families it appears in. Used for inverse-frequency weighting:
// specific tokens like "eastlake" (1 family) carry more weight than shared
// tokens like "victorian" (appears as alias in multiple families).
let tokenFrequency: Map<string, number> | null = null;

function tokenize(s: string): string[] {
  return String(s)
    .toLowerCase()
    .replace(/[-/]/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3);
}

function buildIndex(): FamilyIndex[] {
  return STYLE_FAMILIES.map((family) => {
    const sources = [
      family.name ?? "",
      ...((family as any).canonical_source_aliases ?? []),
    ];
    const tokens = new Set<string>();
    for (const src of sources) {
      for (const t of tokenize(src)) {
        if (!STOP_TOKENS.has(t)) tokens.add(t);
      }
    }
    return { family, tokens };
  });
}

function buildFrequencyMap(idx: FamilyIndex[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const { tokens } of idx) {
    tokens.forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1));
  }
  return freq;
}

function getIndex(): FamilyIndex[] {
  if (!familyIndex) {
    familyIndex = buildIndex();
    tokenFrequency = buildFrequencyMap(familyIndex);
  }
  return familyIndex;
}

// Inverse-document-frequency style weight: token appearing in 1 family scores 1.0;
// in 2 families scores 0.5; in N families scores 1/N. Forces specific matches
// to outrank shared ones ("eastlake" beats "victorian").
function tokenWeight(token: string): number {
  const f = tokenFrequency?.get(token) ?? 1;
  return 1 / f;
}

function periodEnvelope(family: StyleFamilyEntry): { date_floor: number | null; date_ceiling: number | null } {
  const periods = (family as any).period_associations as Array<{ date_floor?: number; date_ceiling?: number }> | undefined;
  if (!periods?.length) return { date_floor: null, date_ceiling: null };
  let floor: number | null = null;
  let ceiling: number | null = null;
  for (const p of periods) {
    if (typeof p.date_floor === "number") floor = floor === null ? p.date_floor : Math.min(floor, p.date_floor);
    if (typeof p.date_ceiling === "number") ceiling = ceiling === null ? p.date_ceiling : Math.max(ceiling, p.date_ceiling);
  }
  return { date_floor: floor, date_ceiling: ceiling };
}

/**
 * Score each style family against the observation evidence; return ranked attributions.
 * Empty array if no family matches.
 */
export function attributeStyle(
  clueKeys: string[],
  observationDescriptions: string[]
): StyleAttribution[] {
  // Count token APPEARANCES across clue keys + descriptions. Repeated tokens
  // (e.g., "eastlake" in both victorian_eastlake_pattern + eastlake_pull) carry
  // more weight than singletons, biasing attribution toward the appraiser's
  // most-emphasized style signal.
  const haystack = new Map<string, number>();
  const bump = (t: string) => haystack.set(t, (haystack.get(t) ?? 0) + 1);
  for (const k of clueKeys) for (const t of tokenize(k)) bump(t);
  for (const d of observationDescriptions) for (const t of tokenize(d)) bump(t);

  const results: StyleAttribution[] = [];
  for (const { family, tokens } of getIndex()) {
    const matched: string[] = [];
    let weightedScore = 0;
    tokens.forEach((t) => {
      const count = haystack.get(t);
      if (count) {
        matched.push(t);
        weightedScore += tokenWeight(t) * count;
      }
    });
    if (matched.length === 0) continue;

    // baseConf scales linearly with weightedScore, capped at 1.0.
    // Each unique-match appearance contributes 0.35, so:
    //   1× specific match → 0.35; 2× → 0.70; 3× → 1.0.
    // Repeated tokens stack (eastlake appearing in 2 clue keys + 2 obs descriptions → 1.0).
    const baseConf = Math.min(1.0, weightedScore * 0.35);
    const authority = typeof (family as any).positive_authority === "number"
      ? (family as any).positive_authority / 10
      : 0.5;
    const confidence = Number((baseConf * (0.7 + 0.3 * authority)).toFixed(2));

    const { date_floor, date_ceiling } = periodEnvelope(family);
    results.push({
      style_family_id: family.id,
      name: family.name,
      date_floor,
      date_ceiling,
      confidence,
      matched_terms: matched,
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

// ── Block 2b: Style-wave aggregator ──────────────────────────────────────

export type StyleWaveAttribution = {
  wave_id: string;
  wave_name: string;
  parent_style_id: string;
  wave_number: number;
  date_floor: number | null;
  date_ceiling: number | null;
  signals_matched: string[];      // human-readable list of what matched
  signal_count: number;            // gate threshold per D-PH3-9 (2-of-N rule)
};

// Index by parent_style_id for fast lookup during aggregation
let wavesByParent: Map<string, StyleRevivalWaveEntry[]> | null = null;
function getWavesByParent(): Map<string, StyleRevivalWaveEntry[]> {
  if (wavesByParent) return wavesByParent;
  const m = new Map<string, StyleRevivalWaveEntry[]>();
  for (const w of STYLE_REVIVAL_WAVES) {
    const arr = m.get(w.parent_style_id) ?? [];
    arr.push(w);
    m.set(w.parent_style_id, arr);
  }
  wavesByParent = m;
  return m;
}

function datesOverlap(
  aFloor: number | null,
  aCeiling: number | null,
  bFloor: number | null,
  bCeiling: number | null
): boolean {
  if (aFloor === null && aCeiling === null) return false;
  if (bFloor === null && bCeiling === null) return false;
  const aLo = aFloor ?? -Infinity;
  const aHi = aCeiling ?? Infinity;
  const bLo = bFloor ?? -Infinity;
  const bHi = bCeiling ?? Infinity;
  return aLo <= bHi && bLo <= aHi;
}

/**
 * Block 2b — Style-wave aggregation.
 *
 * Per D-PH3-9 (2-of-N rule): surface a wave attribution only when at least
 * 2 evidence layers point to the same wave. Layers per wave:
 *   1. Style family attribution matches wave.parent_style_id
 *   2. Dating envelope overlaps wave.date_floor/date_ceiling
 *   3. ≥1 design_subtleties.signal token matches observation text
 *
 * Reaching ≥2 of these layers qualifies the wave for surfacing.
 * Per Q5 framing: output reads as supporting evidence, not authoritative
 * attribution ("consistent with X wave, c. YYYY-ZZZZ").
 */
export function aggregateStyleWaves(
  styleAttributions: StyleAttribution[],
  dateFloor: number | null,
  dateCeiling: number | null,
  observationDescriptions: string[]
): StyleWaveAttribution[] {
  if (styleAttributions.length === 0) return [];

  // Build observation token set (used for design_subtleties signal matching)
  const obsTokens = new Set<string>();
  for (const d of observationDescriptions) for (const t of tokenize(d)) obsTokens.add(t);

  const wavesIdx = getWavesByParent();
  const matched: StyleWaveAttribution[] = [];

  // Only seed wave search from reasonably-confident attributions (≥0.5).
  // Lower-confidence alternatives often surface noise (e.g., mcm_plastic_chair
  // attribution alternative "postmodern" 0.29 → 2010+ Memphis Revival wave).
  // Floor balances signal vs noise. 0.5 was too aggressive (filtered out
  // mcm 0.43 attribution which had a real 3/3-signal wave hit).
  // 0.4 catches weak-but-valid 2-token matches and filters 0.29 noise.
  const ATTRIBUTION_FLOOR = 0.4;
  const attributionIdsArr = Array.from(
    new Set(
      styleAttributions
        .filter((s) => s.confidence >= ATTRIBUTION_FLOOR)
        .map((s) => s.style_family_id)
    )
  );

  for (const styleId of attributionIdsArr) {
    const waves = wavesIdx.get(styleId) ?? [];
    for (const wave of waves) {
      const signals: string[] = [];

      // Layer 1: style family attribution matched (always true here, we're iterating from attributions)
      signals.push(`Style family attribution: ${styleId}`);

      // Layer 2: dating envelope overlaps wave date range
      const wFloor = (wave as any).date_floor ?? null;
      const wCeiling = (wave as any).date_ceiling ?? null;
      if (datesOverlap(dateFloor, dateCeiling, wFloor, wCeiling)) {
        const dateLabel = wFloor != null && wCeiling != null
          ? `c. ${wFloor}-${wCeiling}`
          : wFloor != null ? `post-${wFloor}` : `pre-${wCeiling}`;
        signals.push(`Dating envelope overlaps wave range (${dateLabel})`);
      }

      // Layer 3: design_subtleties signal token match in observation text
      const subtleties = ((wave as any).design_subtleties ?? []) as Array<{ signal: string }>;
      for (const sub of subtleties) {
        const sigTokens = tokenize(sub.signal).filter((t) => !STOP_TOKENS.has(t) && t.length >= 4);
        const sigMatched = sigTokens.filter((t) => obsTokens.has(t));
        if (sigMatched.length > 0) {
          signals.push(`Design signal "${sub.signal}" matched on ${sigMatched.join(", ")}`);
          break; // single subtlety match counts as layer-3 hit; don't multi-count
        }
      }

      // D-PH3-9: 2-of-N gate
      if (signals.length >= 2) {
        matched.push({
          wave_id: wave.id,
          wave_name: wave.name,
          parent_style_id: styleId,
          wave_number: (wave as any).wave_number ?? 0,
          date_floor: wFloor,
          date_ceiling: wCeiling,
          signals_matched: signals,
          signal_count: signals.length,
        });
      }
    }
  }

  // Sort: more signals first, then earliest wave date
  return matched.sort((a, b) => {
    if (b.signal_count !== a.signal_count) return b.signal_count - a.signal_count;
    return (a.date_floor ?? 9999) - (b.date_floor ?? 9999);
  });
}
