/**
 * Stage 1 / Component B — canonical-vocabulary snapping (ingest normalization).
 *
 * Deterministic, auditable cascade that maps a model-emitted clue key to a
 * canonical key so run-to-run synonym drift never reaches form routing:
 *   exact  → the key is already canonical
 *   alias  → a curated synonym (CLUE_KEY_ALIASES, via the generated vocab)
 *   lexical→ category-scoped token-overlap match (handles spelling/ordering/
 *            suffix drift; NOT semantic synonyms — those need the alias table)
 *   unmatched → preserved as an observation but not allowed to drive routing
 *
 * No runtime embeddings: matching is pure token-set Jaccard so results are
 * deterministic and explainable. Backed by lib/constraints/canonicalVocabulary.generated.ts.
 */
import { CANONICAL_VOCABULARY } from "./constraints/canonicalVocabulary.generated";

export type SnapMethod = "exact" | "alias" | "lexical" | "unmatched";
export type SnapResult = { canonical: string | null; method: SnapMethod; score?: number };

const EVIDENCE_IDS: string[] = Object.values(CANONICAL_VOCABULARY.evidence)
  .flatMap((entries) => (entries as readonly { id: string }[]).map((e) => e.id));
const CANONICAL_KEYS = new Set<string>([...EVIDENCE_IDS, ...CANONICAL_VOCABULARY.woodEvidenceKeys]);
const CATEGORY_KEYS = new Map<string, string[]>();
for (const [cat, entries] of Object.entries(CANONICAL_VOCABULARY.evidence)) {
  CATEGORY_KEYS.set(cat, (entries as readonly { id: string }[]).map((e) => e.id));
}
const ALIASES = CANONICAL_VOCABULARY.aliases as Record<string, string>;

const STOP = new Set(["type", "category", "evidence", "group", "present", "visible", "form", "the", "and", "of", "with"]);
const slug = (s: string) => String(s || "").toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_");
const toks = (s: string) => new Set(s.split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !STOP.has(t)));

const LEXICAL_THRESHOLD = 0.6;

/** Snap a raw model clue key to a canonical key. `category` (the observation's
 * emitted category) scopes the lexical fallback to that category's keys to avoid
 * cross-category false snaps. Always deterministic. */
export function snapToCanonical(rawKey: string, category?: string): SnapResult {
  const key = slug(rawKey);
  if (!key) return { canonical: null, method: "unmatched" };
  if (CANONICAL_KEYS.has(key)) return { canonical: key, method: "exact" };

  const aliased = ALIASES[key];
  if (aliased && CANONICAL_KEYS.has(aliased)) return { canonical: aliased, method: "alias" };

  const pool = (category && CATEGORY_KEYS.get(category)) || EVIDENCE_IDS.concat(CANONICAL_VOCABULARY.woodEvidenceKeys);
  const kt = toks(key);
  if (kt.size) {
    let best: { id: string; score: number } | null = null;
    for (const cand of pool) {
      const ct = toks(cand);
      if (!ct.size) continue;
      let inter = 0;
      for (const t of kt) if (ct.has(t)) inter++;
      const union = kt.size + ct.size - inter;
      const score = union ? inter / union : 0;
      // deterministic: higher score wins; ties break alphabetically
      if (!best || score > best.score || (score === best.score && cand < best.id)) best = { id: cand, score };
    }
    if (best && best.score >= LEXICAL_THRESHOLD) {
      return { canonical: best.id, method: "lexical", score: +best.score.toFixed(2) };
    }
  }
  return { canonical: null, method: "unmatched" };
}

export function isCanonicalKey(rawKey: string): boolean {
  return CANONICAL_KEYS.has(slug(rawKey));
}

export const CANONICAL_KEY_COUNT = CANONICAL_KEYS.size;
