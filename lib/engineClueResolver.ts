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
  return undefined;
}

// Synthesize a CLUE_LIBRARY-shape meta object from a canonical entry.
function metaFromCanonical(entry: any): ClueMeta {
  const positiveAuthority = typeof entry?.positive_authority === "number" ? entry.positive_authority : 5;
  // 1-10 scale → 0-1 weight. Mirror engine's CLUE_LIBRARY 0-1 range.
  const weight = positiveAuthority / 10;
  // hardNegative when canonical entry flags hard_negative OR when
  // hard_negative_authority dominates (signaling exclusion semantics).
  const hardNegative = entry?.hard_negative === true
    || (typeof entry?.hard_negative_authority === "number" && entry.hard_negative_authority >= 8);

  return {
    category: engineCategoryFor(entry?.category ?? "other"),
    weight,
    hardNegative: hardNegative || undefined,
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
