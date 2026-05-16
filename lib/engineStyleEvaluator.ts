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

import { STYLE_FAMILIES } from "./constraints/styleFamilies";
import type { StyleFamilyEntry } from "./constraints/styleFamilies";

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
