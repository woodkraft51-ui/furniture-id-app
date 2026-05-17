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

// Tokens that appear in nearly every style name and shouldn't gate matches.
// Block 10a expansion: added generic period/material/regional words that
// caused false-positive attributions in real LLM scans (e.g., "american"
// matching style_family_early_colonial's aliases on a Toledo industrial chair;
// "windsor" matching across multiple revival families without being style-
// defining alone).
const STOP_TOKENS = new Set([
  "and", "the", "of", "or", "style", "pattern", "case", "form",
  "movement", "period", "early", "late", "modern",
  // "revival" intentionally NOT stopped: it is the morphological anchor
  // that distinguishes post-1876 revival families (colonial_revival,
  // rococo_revival, gothic_revival, etc.) from their original-period
  // counterparts. Stopping it collapsed clues like
  // `neoclassical_revival_cues` onto Louis XVI (1770–1830) rather than
  // routing to Colonial Revival.
  // Block 10a additions:
  "american", "century", "antique", "windsor",
  "design", "design's", "designed",
  "type", "types", "form", "forms",
  "wood", "wooden", "metal", "fabric",
  "general", "generic", "classic",
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
 *
 * Block 10a discipline tightening (revised after fixture impact review):
 * - STOP_TOKENS expanded above to catch generic words that produced single-
 *   token false-positive attributions in real scans ("american", "century",
 *   "windsor" etc.) — primary surgical lever.
 * - Structural-pattern competitive suppression: when detectStructuralPatterns
 *   clues fire (mcm_structural_pattern, toledo_industrial_style, etc.),
 *   competing style attributions get a 30% penalty unless they're in the
 *   same family as the structural pattern. Higher-authority structural
 *   detection should outrank alias-token matching when they disagree.
 * - Soft floor: single-token attributions require confidence ≥ 0.60 to
 *   surface; multi-token can pass at the lower 0.45 floor. Catches "single
 *   weak token wins" failure mode without killing legitimate single-token
 *   matches that score high on their own merit.
 */
const SINGLE_TOKEN_CONFIDENCE_FLOOR = 0.60;
const MULTI_TOKEN_CONFIDENCE_FLOOR = 0.45;

// Maps detectStructuralPatterns synthesized keys to the style family they
// canonically belong to. When one of these fires in the digest, attributions
// to other families get a competitive penalty.
const STRUCTURAL_PATTERN_FAMILY: Record<string, string> = {
  mcm_structural_pattern: "style_family_mid_century_modern",
  toledo_industrial_style: "style_family_mid_century_modern",
  mid_century_industrial_office: "style_family_mid_century_modern",
  victorian_eastlake_pattern: "style_family_eastlake",
  rococo_revival_pattern: "style_family_rococo_revival",
  gothic_revival_pattern: "style_family_gothic_revival",
  federal_hepplewhite_sheraton_pattern: "style_family_federal",
  chippendale_pattern: "style_family_chippendale",
  jacobean_tudor_revival_case_pattern: "style_family_jacobean",
  william_and_mary_pattern: "style_family_william_and_mary",
  art_deco_pattern: "style_family_art_deco",
  // Block 24: removed `edwardian_pattern: "style_family_edwardian"` — dangling
  // reference per Block 24a audit. No such style_family exists in canonical
  // or in Styles_and_Waves.docx. Mike's call: drop the reference rather than
  // author Edwardian. Re-add if Edwardian is added to docx + canonical later.
  art_nouveau_pattern: "style_family_art_nouveau",
  shaker_pattern: "style_family_shaker",
  colonial_revival_pattern: "style_family_colonial_revival",
  // LLM-emitted revival cues route to Colonial Revival so original-period
  // families (Louis XVI 1770–1830, Federal, etc.) take the competitive
  // penalty when revival markers are present.
  neoclassical_revival_cues: "style_family_colonial_revival",
  colonial_revival_cues: "style_family_colonial_revival",
  mission_arts_crafts_structural_pattern: "style_family_arts_and_crafts",
  louis_xvi_revival_pattern: "style_family_louis_xvi_french_neoclassical",
  queen_anne_revival_pattern: "style_family_queen_anne",
  american_empire_style: "style_family_american_classical",
};

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

  // Block 10a: identify structural-pattern families that fired in the digest.
  // Style attributions to families OTHER than these get a competitive penalty
  // (structural pattern detection is higher-authority than alias token matching).
  const structuralFamiliesPresent = new Set<string>();
  for (const k of clueKeys) {
    const fam = STRUCTURAL_PATTERN_FAMILY[k];
    if (fam) structuralFamiliesPresent.add(fam);
  }

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
    let confidence = Number((baseConf * (0.7 + 0.3 * authority)).toFixed(2));

    // Block 10a: competitive suppression. If structural-pattern detection
    // points to a different family, penalize this attribution by 30%.
    if (structuralFamiliesPresent.size > 0 && !structuralFamiliesPresent.has(family.id)) {
      confidence = Number((confidence * 0.7).toFixed(2));
    }

    // Block 10a: soft confidence floor. Single-token matches must be
    // high-confidence (deep token match, dominant family); multi-token can
    // pass at lower floor.
    const requiredFloor = matched.length === 1
      ? SINGLE_TOKEN_CONFIDENCE_FLOOR
      : MULTI_TOKEN_CONFIDENCE_FLOOR;
    if (confidence < requiredFloor) continue;

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

// ── Block 9: Controlled style-supporting evidence ───────────────────────
//
// Maps engine clue keys (typically clues with broad/unparseable dateHints
// that the dating-overlap diagnostic surfaces as "found but not parsed") to
// the style families they categorically belong to. Used by p3 to surface
// these clues as SUPPORTING EVIDENCE for the style attribution in the
// report — not as independent date contributions (avoids double-counting
// against the style's own date envelope).
//
// "Controlled" gates per Mike's authorization:
// - Only fires when style_attribution.confidence ≥ 0.5 (high-floor style)
// - Only the clues with categorical alignment to a SPECIFIC style family
//   are listed (no fishing for marginal associations)
// - Mapping is conservative; broader cross-family clues (e.g., tapered_leg
//   appears in many neoclassical-adjacent styles) stay multi-mapped only
//   where the appraiser-knowledge alignment is clean

export const CLUE_STYLE_ASSOCIATIONS: Record<string, string[]> = {
  // Louis XVI / French Neoclassical category
  louis_xvi_french_neoclassical: ["style_family_louis_xvi_french_neoclassical"],
  ormolu_mounts: ["style_family_louis_xvi_french_neoclassical", "style_family_american_classical"],
  brass_foot_sabots: ["style_family_louis_xvi_french_neoclassical", "style_family_american_classical"],
  parquetry_veneer: ["style_family_louis_xvi_french_neoclassical", "style_family_federal", "style_family_william_and_mary"],
  stringing_inlay: ["style_family_louis_xvi_french_neoclassical", "style_family_federal", "style_family_american_classical"],

  // Federal / English Neoclassical category
  tapered_leg: ["style_family_federal", "style_family_louis_xvi_french_neoclassical", "style_family_american_classical"],

  // Queen Anne / Chippendale family
  cabriole_leg: ["style_family_queen_anne", "style_family_chippendale", "style_family_rococo_revival"],
  shell_carving: ["style_family_queen_anne", "style_family_chippendale", "style_family_federal"],
  claw_or_pad_foot: ["style_family_queen_anne", "style_family_chippendale"],

  // Jacobean / William and Mary family
  barley_twist: ["style_family_jacobean", "style_family_william_and_mary"],

  // Eastlake / Arts and Crafts family
  spindle_gallery: ["style_family_eastlake", "style_family_arts_and_crafts"],

  // American Classical (Empire)
  rope_carved_pilasters: ["style_family_american_classical"],
  overhanging_top: ["style_family_american_classical"],

  // Heavy carving — multiple revival styles
  heavy_carving: ["style_family_renaissance_revival", "style_family_gothic_revival", "style_family_jacobean"],
};

export type StyleSupportingObservation = {
  clue: string;
  display_label: string;
  description: string;
  style_family_id: string;
};

/**
 * Block 9 — collect undated observations that are categorically aligned
 * with the surfaced style attribution. Per Mike's "controlled way" lock:
 * only fires when style attribution is reasonably confident; only clues
 * with explicit mappings in CLUE_STYLE_ASSOCIATIONS participate.
 *
 * Result surfaces in the report as supporting context for the style
 * attribution. Does NOT contribute to dating-overlap layers (would
 * double-count against the style attribution's own date envelope).
 */
const STYLE_SUPPORTING_CONFIDENCE_FLOOR = 0.5;

export function collectStyleSupportingEvidence(
  styleAttribution: StyleAttribution | null,
  observations: Array<{ clue?: string | null; description?: string; date_hint?: string | null }>
): StyleSupportingObservation[] {
  if (!styleAttribution) return [];
  if (styleAttribution.confidence < STYLE_SUPPORTING_CONFIDENCE_FLOOR) return [];
  const targetFamilyId = styleAttribution.style_family_id;

  const result: StyleSupportingObservation[] = [];
  const seenClues = new Set<string>();
  for (const obs of observations) {
    const clue = obs.clue;
    if (!clue || seenClues.has(clue)) continue;
    const associations = CLUE_STYLE_ASSOCIATIONS[clue];
    if (!associations || !associations.includes(targetFamilyId)) continue;
    seenClues.add(clue);
    result.push({
      clue,
      display_label: clue.replace(/_/g, " "),
      description: obs.description ?? "",
      style_family_id: targetFamilyId,
    });
  }
  return result;
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

  // Index attribution confidences so Layer 1 can be gated on attribution strength.
  const attrConf = new Map<string, number>();
  for (const a of styleAttributions) {
    const prior = attrConf.get(a.style_family_id) ?? 0;
    if (a.confidence > prior) attrConf.set(a.style_family_id, a.confidence);
  }
  // Layer 1 (attribution as a corroborating signal) only counts when the
  // attribution is high-confidence. Below this floor, the attribution is
  // just the iteration anchor — not an independent signal. Previously
  // Layer 1 was pushed unconditionally, collapsing the 2-of-N gate to
  // "one of Layer 2 or Layer 3" and letting weak/false attributions
  // (e.g., 0.4 MCM from noisy text) emit waves on a single date overlap.
  const ATTRIBUTION_AS_SIGNAL_FLOOR = 0.6;

  for (const styleId of attributionIdsArr) {
    const waves = wavesIdx.get(styleId) ?? [];
    for (const wave of waves) {
      const signals: string[] = [];

      // Layer 1: style family attribution matched — only as an independent
      // signal when the attribution is itself high-confidence.
      if ((attrConf.get(styleId) ?? 0) >= ATTRIBUTION_AS_SIGNAL_FLOOR) {
        signals.push(`Style family attribution (high-confidence): ${styleId}`);
      }

      // Layer 2: dating envelope overlaps wave date range
      const wFloor = (wave as any).date_floor ?? null;
      const wCeiling = (wave as any).date_ceiling ?? null;
      if (datesOverlap(dateFloor, dateCeiling, wFloor, wCeiling)) {
        const dateLabel = wFloor != null && wCeiling != null
          ? `c. ${wFloor}-${wCeiling}`
          : wFloor != null ? `post-${wFloor}` : `pre-${wCeiling}`;
        signals.push(`Dating envelope overlaps wave range (${dateLabel})`);
      }

      // Layer 3: design_subtleties signal match against observation text.
      // Prefer the curated `engine_match_tokens` phrase list when authored
      // (a phrase matches when all its content tokens appear in the
      // observation set); fall back to tokenizing the human prose `signal`
      // for waves authored without tokens.
      const subtleties = ((wave as any).design_subtleties ?? []) as Array<{
        signal: string;
        engine_match_tokens?: string[];
      }>;
      for (const sub of subtleties) {
        let sigMatched: string[] = [];
        if (Array.isArray(sub.engine_match_tokens) && sub.engine_match_tokens.length > 0) {
          for (const phrase of sub.engine_match_tokens) {
            const phraseTokens = tokenize(phrase).filter((t) => t.length >= 4);
            if (phraseTokens.length > 0 && phraseTokens.every((t) => obsTokens.has(t))) {
              sigMatched.push(phrase);
            }
          }
        } else {
          const sigTokens = tokenize(sub.signal).filter((t) => !STOP_TOKENS.has(t) && t.length >= 4);
          sigMatched = sigTokens.filter((t) => obsTokens.has(t));
        }
        if (sigMatched.length > 0) {
          signals.push(`Design signal "${sub.signal}" matched on ${sigMatched.join(", ")}`);
          break; // single subtlety match counts as layer-3 hit; don't multi-count
        }
      }

      // D-PH3-9: 2-of-N gate (now genuine: Layer 1 only counts when the
      // attribution itself is high-confidence, so low-confidence
      // attributions must produce BOTH a date overlap AND a design-signal
      // match to surface a wave).
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
