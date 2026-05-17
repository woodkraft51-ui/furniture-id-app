/**
 * lib/engineClueResolver.ts — Block 1 step 5
 *
 * Resolver layer that synthesizes engine CLUE_LIBRARY-shape metadata from
 * canonical constraint library entries. Replaces direct CLUE_LIBRARY[clueKey]
 * reads in engine.ts for clues that have been migrated to canonical (per
 * D-PH3-12 list in engineCanonicalMap.ts CLUE_TO_CANONICAL).
 *
 * Strategy: lazy-build a Map<canonicalId, ClueMeta> at first call; lookup
 * uses CLUE_TO_CANONICAL to find the canonical entry, then synthesizes the
 * engine-shape meta object. KEPT_IN_ENGINE clues return null (caller falls
 * back to CLUE_LIBRARY).
 */

import { CLUE_TO_CANONICAL, NO_MATCH } from "./engineCanonicalMap";

// Canonical library imports
import { JOINERY_TYPES, JOINERY_CATEGORIES } from "./constraints/joinery";
import { FASTENER_TYPES, FASTENER_SUBCATEGORIES, FASTENER_CATEGORIES } from "./constraints/fasteners";
import { TOOLMARK_TYPES, TOOLMARK_CATEGORIES } from "./constraints/toolmarks";
import { FINISH_TYPES, FINISH_CATEGORIES } from "./constraints/finish";
import { HARDWARE_TYPES, HARDWARE_CATEGORIES } from "./constraints/hardware";
import { SUBSTRATE_EVIDENCE, SPECIES_EVIDENCE } from "./constraints/woodEvidence";

// Engine CLUE_LIBRARY entry shape (matches the inline declaration in engine.ts:68).
export type ClueMeta = {
  category: string;
  hardNegative?: boolean;
  formHint?: string;
  dateHint?: string;
  weight: number;
};

// Map canonical entry category prefix to engine AUTHORITY_RANK category key.
function engineCategoryFor(canonicalCategory: string): string {
  if (canonicalCategory.startsWith("joinery_")) return "joinery";
  if (canonicalCategory.startsWith("fastener_")) return "fasteners";
  if (canonicalCategory.startsWith("toolmark_")) return "toolmarks";
  if (canonicalCategory.startsWith("finish_")) return "finish";
  if (canonicalCategory.startsWith("hardware_")) return "hardware";
  if (canonicalCategory.startsWith("substrate_evidence")) return "materials";
  if (canonicalCategory.startsWith("wood_species_evidence")) return "materials";
  if (canonicalCategory.startsWith("cut_grain_evidence")) return "materials";
  return canonicalCategory; // pass through unknown
}

// Best-effort dateHint extraction from canonical entry.
// Priority: explicit date_floor/date_ceiling on entry; else HCL attribution
// embedded in notes field (preserved as provenance markers in Block 0.5d);
// else null.
function dateHintFor(entry: any): string | undefined {
  if (typeof entry?.date_floor === "number" && typeof entry?.date_ceiling === "number") {
    return `c. ${entry.date_floor}–${entry.date_ceiling}`;
  }
  if (typeof entry?.date_floor === "number") return `post-${entry.date_floor}`;
  if (typeof entry?.date_ceiling === "number") return `pre-${entry.date_ceiling}`;
  // Parse "typical_date_range \"<range>\"" out of HCL attribution markers in notes.
  const notes = String(entry?.notes ?? "");
  const m = notes.match(/typical_date_range\s+"([^"]+)"/);
  if (m) return m[1];
  // Block 8: fall back to period_associations aggregate when neither top-level
  // dates nor HCL attribution exists. Many canonical entries (hardware, joinery,
  // wood, substrate libraries) carry rich period_associations: structured year
  // ranges that the prior resolver never read. This is the largest unrealized
  // canonical investment surfaced during Block 7 verification. Aggregation:
  // min(date_floors), max(date_ceilings) across all populated periods → unified
  // date range that the date parser can consume downstream.
  const periods = entry?.period_associations;
  if (Array.isArray(periods) && periods.length > 0) {
    let floor: number | null = null;
    let ceiling: number | null = null;
    for (const p of periods) {
      if (typeof p?.date_floor === "number") {
        floor = floor === null ? p.date_floor : Math.min(floor, p.date_floor);
      }
      if (typeof p?.date_ceiling === "number") {
        ceiling = ceiling === null ? p.date_ceiling : Math.max(ceiling, p.date_ceiling);
      }
    }
    if (floor !== null && ceiling !== null) return `c. ${floor}–${ceiling}`;
    if (floor !== null) return `post-${floor}`;
    if (ceiling !== null) return `pre-${ceiling}`;
  }
  return undefined;
}

// Synthesize a CLUE_LIBRARY-shape meta object from a canonical entry.
function metaFromCanonical(entry: any): ClueMeta {
  const positiveAuthority = typeof entry?.positive_authority === "number" ? entry.positive_authority : 5;
  // 1-10 scale → 0-1 weight. Mirror engine's CLUE_LIBRARY 0-1 range.
  const weight = positiveAuthority / 10;
  // hardNegative: ONLY when canonical entry has explicit hard_negative flag.
  // Do NOT infer from hard_negative_authority (that's confidence in the
  // exclusion if interpreted exclusionary, not a flag that this IS exclusionary).
  // Engine's inline CLUE_LIBRARY hardNegative flag is OR'd in via getClueMeta
  // caller for entries known-categorical per audit log (phillips_screw,
  // staple_fastener, plywood, modern_concealed_hinge).
  const hardNegative = entry?.hard_negative === true || undefined;

  return {
    category: engineCategoryFor(entry?.category ?? "other"),
    weight,
    hardNegative,
    dateHint: dateHintFor(entry),
  };
}

// Lazy-built index: canonical_id → canonical entry. Built on first call.
let canonicalIndex: Map<string, any> | null = null;

function buildIndex(): Map<string, any> {
  const idx = new Map<string, any>();
  const sources = [
    ...JOINERY_CATEGORIES, ...JOINERY_TYPES,
    ...FASTENER_CATEGORIES, ...FASTENER_SUBCATEGORIES, ...FASTENER_TYPES,
    ...TOOLMARK_CATEGORIES, ...TOOLMARK_TYPES,
    ...FINISH_CATEGORIES, ...FINISH_TYPES,
    ...HARDWARE_CATEGORIES, ...HARDWARE_TYPES,
    ...SUBSTRATE_EVIDENCE, ...SPECIES_EVIDENCE,
  ];
  for (const entry of sources) {
    if (entry?.id) idx.set(entry.id, entry);
  }
  return idx;
}

/**
 * Resolve canonical-derived meta for an engine clue key.
 * Returns null when the clue is KEPT_IN_ENGINE (caller should fall back
 * to CLUE_LIBRARY) or when the canonical lookup returns NO_MATCH.
 */
export function getClueMetaFromCanonical(engineKey: string): ClueMeta | null {
  const canonicalId = CLUE_TO_CANONICAL[engineKey];
  if (!canonicalId || canonicalId === NO_MATCH) return null;

  if (!canonicalIndex) canonicalIndex = buildIndex();
  const entry = canonicalIndex.get(canonicalId);
  if (!entry) return null;

  return metaFromCanonical(entry);
}

/**
 * Block 1 step 7: return the canonical entry's diagnostic_caution_text (if any)
 * for a given engine clue key. Used by dateFromEvidence post-process to surface
 * canonical guidance in support arrays (e.g., substrate_evidence_plywood text
 * replacing engine-hardcoded "post-1920" message per D-PH3-13 #3).
 */
export function getCanonicalCautionText(engineKey: string): string | null {
  const canonicalId = CLUE_TO_CANONICAL[engineKey];
  if (!canonicalId || canonicalId === NO_MATCH) return null;
  if (!canonicalIndex) canonicalIndex = buildIndex();
  const entry = canonicalIndex.get(canonicalId);
  const text = entry?.diagnostic_caution_text;
  return typeof text === "string" && text.length > 0 ? text : null;
}

/**
 * Block 1 step 7: parse engine free-text date range strings into numeric
 * { date_floor, date_ceiling } per D-PH3-13 #4. Handles common engine formats:
 *   "c. 1830-1870" / "c. 1830–1870" / "1700–1860" → { 1830, 1870 }
 *   "post-1934"                                   → { 1934, null }
 *   "pre-1860"                                    → { null, 1860 }
 * Block 5 expansion (real-data formats observed in LLM outputs):
 *   "c. 1900" / "ca. 1900" / "circa 1900"         → { 1890, 1910 } (±10y)
 *   "1870s" / "1870's"                            → { 1870, 1879 }
 *   "early 19th century"                          → { 1800, 1830 }
 *   "mid 19th century" / "middle of the 19th c."  → { 1830, 1870 }
 *   "late 19th century"                           → { 1870, 1900 }
 *   "early 20th century"                          → { 1900, 1930 }
 *   "mid 20th century"                            → { 1930, 1970 }
 *   "late 20th century"                           → { 1970, 2000 }
 *   "19th century" / "19th c."                    → { 1800, 1900 }
 *   "1850" (bare year)                            → { 1850, 1850 }
 *
 * Returns { null, null } when no defensible parse is available.
 */
export function parseRangeToNumeric(range: string | null | undefined): {
  date_floor: number | null;
  date_ceiling: number | null;
} {
  if (!range) return { date_floor: null, date_ceiling: null };
  const r = String(range).trim();

  // Range form: "c. 1830-1870" / "c. 1830–1870" / "1700–1860"
  const rangeMatch = r.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) {
    return { date_floor: parseInt(rangeMatch[1], 10), date_ceiling: parseInt(rangeMatch[2], 10) };
  }

  // Open-ended: "post-YYYY"
  const postMatch = r.match(/post[-\s]+(\d{4})/i);
  if (postMatch) {
    return { date_floor: parseInt(postMatch[1], 10), date_ceiling: null };
  }

  // Open-ended: "pre-YYYY"
  const preMatch = r.match(/pre[-\s]+(\d{4})/i);
  if (preMatch) {
    return { date_floor: null, date_ceiling: parseInt(preMatch[1], 10) };
  }

  // Decade: "1870s" / "1870's"
  const decadeMatch = r.match(/(\d{3})0'?s\b/);
  if (decadeMatch) {
    const decadeStart = parseInt(decadeMatch[1] + "0", 10);
    return { date_floor: decadeStart, date_ceiling: decadeStart + 9 };
  }

  // Circa / approximate single year: "c. 1900" / "ca. 1900" / "circa 1900"
  // Treats as a ±10-year band — common appraiser usage.
  const circaMatch = r.match(/(?:^|\s)(?:c\.|ca\.|circa)\s*(\d{4})/i);
  if (circaMatch) {
    const center = parseInt(circaMatch[1], 10);
    return { date_floor: center - 10, date_ceiling: center + 10 };
  }

  // Century period phrases: "early 19th century", "mid 20th c.", "late 18th century", etc.
  const centuryPhraseMatch = r.match(/(early|mid(?:dle)?|late)\s+(?:of\s+the\s+)?(\d{1,2})(?:st|nd|rd|th)\s+c(?:entury|\.)/i);
  if (centuryPhraseMatch) {
    const phase = centuryPhraseMatch[1].toLowerCase();
    const century = parseInt(centuryPhraseMatch[2], 10);
    const centuryStart = (century - 1) * 100;
    if (phase.startsWith("early")) return { date_floor: centuryStart, date_ceiling: centuryStart + 30 };
    if (phase.startsWith("mid"))   return { date_floor: centuryStart + 30, date_ceiling: centuryStart + 70 };
    if (phase.startsWith("late"))  return { date_floor: centuryStart + 70, date_ceiling: centuryStart + 100 };
  }

  // Bare century: "19th century" / "19th c."
  const bareCenturyMatch = r.match(/(\d{1,2})(?:st|nd|rd|th)\s+c(?:entury|\.)/i);
  if (bareCenturyMatch) {
    const century = parseInt(bareCenturyMatch[1], 10);
    const centuryStart = (century - 1) * 100;
    return { date_floor: centuryStart, date_ceiling: centuryStart + 100 };
  }

  // Bare 4-digit year as last resort (point estimate, ±5y band for visibility)
  const bareYearMatch = r.match(/\b(\d{4})\b/);
  if (bareYearMatch) {
    const year = parseInt(bareYearMatch[1], 10);
    // Sanity check — furniture date range is roughly 1600-2050
    if (year >= 1600 && year <= 2050) {
      return { date_floor: year - 5, date_ceiling: year + 5 };
    }
  }

  return { date_floor: null, date_ceiling: null };
}
