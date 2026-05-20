/**
 * lib/engineFormEvaluators.ts — Block 1 step 6
 *
 * Evaluators that consume FormEntry-specific canonical fields after p3
 * scoreForms emits a canonical form_id. Per the Block 1 decomposition:
 *
 *   B2 Subtype evaluator — reads FormEntry.subtypes[]; picks best subtype
 *   when confidence ≥ 0.65 (Q4 lock).
 *
 *   B4 Anti-back-classification checker — reads FormEntry.anti_classification_guidance
 *   (handles single-object OR array shape); flags violations when the
 *   dating envelope crosses a boundary_date; surfaces guidance_text and
 *   pre/post_boundary_classifications reroute targets.
 *
 * B1 dimensional + B3 cousin contrast evaluators are stubs in this file;
 * implementations land in follow-on steps if trace pieces surface need.
 */

import { FORMS } from "./constraints/forms";
import type { FormEntry, FormSubtype } from "./constraints/forms";
import type { AntiClassificationGuidance } from "./constraints/entryShape";

// Lazy-built index from form_id → FormEntry.
let formsIndex: Map<string, FormEntry> | null = null;
function getForm(form_id: string): FormEntry | undefined {
  if (!formsIndex) {
    formsIndex = new Map(FORMS.map((f) => [f.id, f]));
  }
  return formsIndex.get(form_id);
}

// ── B2 Subtype evaluator ─────────────────────────────────────────────────

export type SubtypeAssignment = {
  subtype_id: string;
  subtype_name: string;
  confidence: number;
  matched_attributes: string[];
};

const SUBTYPE_CONFIDENCE_FLOOR = 0.65; // Q4 lock

// Stress-test fix #13 (2026-05-20): generic-token stop-list.
// evaluateSubtype matched a subtype attribute on ANY ≥4-char token
// appearing in the observation haystack. Generic furniture words
// ("armchair", "seat", "table", "chair") appear in nearly every
// chair/table observation, so a subtype whose only overlap with the
// evidence was a generic word still scored a match — e.g. the dining-
// armchair subtype matched on "armchair" + "seat" and was assigned to
// a lounge parlor settee at confidence 1.0, despite zero dining-table
// context and an explicit lounge_chair_form posture observation.
//
// Fix: require a subtype attribute to share at least one DISTINCTIVE
// token (not in this stop-list) with the observation haystack before
// it counts as matched. The dining subtype's distinctive token is
// "dining" — absent from a parlor-settee haystack, so the subtype no
// longer matches. Distinctive tokens (gingerbread, spindle, brass,
// tubing, fluted, etc.) are unaffected.
const GENERIC_SUBTYPE_TOKENS = new Set<string>([
  // Furniture-universal nouns
  "chair", "chairs", "armchair", "armchairs", "seat", "seats", "seating",
  "seated", "table", "tables", "wood", "wooden", "hardwood", "softwood",
  "legs", "foot", "feet", "back", "backs", "front", "fronts", "side",
  "sides", "frame", "frames", "form", "forms", "piece", "pieces",
  "cushion", "cushions", "panel", "panels", "surface", "surfaces",
  "rail", "rails", "support", "supports", "edge", "edges", "case",
  "cabinet", "drawer", "drawers", "door", "doors", "leg",
  // Common descriptive adjectives / connectives that carry no
  // subtype-discriminative power
  "used", "with", "this", "that", "usually", "often", "common",
  "commonly", "typical", "typically", "height", "depth", "width",
  "inch", "inches", "style", "styles", "period", "antique",
  "furniture", "made", "appears", "appear", "consistent", "head",
  "top", "bottom", "overall", "design", "decorative", "ornament",
  "ornamental", "finish", "finished", "visible", "upholstered",
  "upholstery", "carved", "carving", "construction", "across",
  "between", "along", "from", "into", "onto", "over", "under",
  "above", "below", "where", "when", "while", "which", "their",
  "than", "then", "have", "been", "were", "they", "them",
]);

/**
 * Pick the best subtype for the given form_id given observation descriptions.
 * Returns null when no subtype reaches the SUBTYPE_CONFIDENCE_FLOOR.
 *
 * Scoring: keyword presence in observation descriptions against each
 * subtype's distinguishing_attributes. An attribute counts as matched only
 * when it shares a DISTINCTIVE (non-generic) ≥4-char token with the
 * observation haystack. Confidence = matched / total attrs.
 */
export function evaluateSubtype(
  form_id: string | null,
  observationDescriptions: string[]
): SubtypeAssignment | null {
  if (!form_id) return null;
  const form = getForm(form_id);
  if (!form?.subtypes?.length) return null;

  const haystack = observationDescriptions
    .map((d) => String(d).toLowerCase())
    .join(" | ");

  let best: SubtypeAssignment | null = null;
  for (const st of form.subtypes) {
    const attrs = (st.distinguishing_attributes ?? []) as string[];
    if (!attrs.length) continue;
    const matched: string[] = [];
    for (const attr of attrs) {
      // Tokenize attribute and require at least one DISTINCTIVE (non-generic)
      // ≥4-char content-word match. Generic furniture tokens (armchair, seat,
      // table, etc.) are filtered out so a subtype can't match on words that
      // appear in nearly every observation — see GENERIC_SUBTYPE_TOKENS and
      // stress-test fix #13.
      const tokens = String(attr)
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length >= 4 && !GENERIC_SUBTYPE_TOKENS.has(t));
      if (tokens.some((t) => haystack.includes(t))) {
        matched.push(attr);
      }
    }
    const confidence = matched.length / attrs.length;
    // Require at least one actual attribute match. Without this, a subtype
    // whose attrs all fail token-matching would still surface (e.g. the
    // telephone_cabinet subtype was assigned confidence 1.0 with
    // matched_attributes: [] when the form scoring fired on unrelated
    // composite-pattern evidence).
    if (matched.length > 0 && confidence >= SUBTYPE_CONFIDENCE_FLOOR && (!best || confidence > best.confidence)) {
      best = {
        subtype_id: st.id,
        subtype_name: st.name,
        confidence: Number(confidence.toFixed(2)),
        matched_attributes: matched,
      };
    }
  }
  return best;
}

// ── B4 Anti-back-classification evaluator ────────────────────────────────

export type AntiBackViolation = {
  boundary_date: number;
  boundary_type: "form_emergence" | "form_extinction";
  guidance_text: string;
  reroute_form_ids: string[]; // pre_boundary_classifications for emergence; post_ for extinction
  prominence: "prominent" | "standard";
};

/**
 * Check whether the form's anti_classification_guidance flags a violation
 * given the (best-estimate) dating envelope. Returns null when no violation
 * or no guidance is populated on the form.
 *
 * Rule: form_emergence boundary violated when ANY plausible date ≤ boundary_date.
 *       form_extinction boundary violated when ANY plausible date ≥ boundary_date.
 * Reroute targets: pre_boundary_classifications for emergence; post_ for extinction.
 */
export function evaluateAntiBackClassification(
  form_id: string | null,
  dateFloor: number | null,
  dateCeiling: number | null
): AntiBackViolation | null {
  if (!form_id) return null;
  const form = getForm(form_id);
  if (!form?.anti_classification_guidance) return null;

  // Normalize to array (some forms have single object, some have array per inspection).
  const guidances: AntiClassificationGuidance[] = Array.isArray(form.anti_classification_guidance)
    ? form.anti_classification_guidance
    : [form.anti_classification_guidance];

  for (const g of guidances) {
    if (g.boundary_type === "form_emergence" && dateFloor !== null && dateFloor < g.boundary_date) {
      return {
        boundary_date: g.boundary_date,
        boundary_type: g.boundary_type,
        guidance_text: g.guidance_text,
        reroute_form_ids: g.pre_boundary_classifications ?? [],
        prominence: g.prominence,
      };
    }
    if (g.boundary_type === "form_extinction" && dateCeiling !== null && dateCeiling > g.boundary_date) {
      return {
        boundary_date: g.boundary_date,
        boundary_type: g.boundary_type,
        guidance_text: g.guidance_text,
        reroute_form_ids: g.post_boundary_classifications ?? [],
        prominence: g.prominence,
      };
    }
  }
  return null;
}

// ── B1 Dimensional + B3 Cousin contrast — stubs ──────────────────────────

/**
 * Block 16: extract form-emergence / form-extinction boundary years from a
 * FormEntry's anti_classification_guidance for use in dating-overlap layer
 * clipping. Returns the widest valid window across all guidance entries
 * (min emergence, max extinction). Returns empty object when the form is
 * not found or has no boundaries.
 *
 * For revival-cycle arrays (emergence + extinction + revival + extinction),
 * this returns the outer bounds of the valid window — the gap between
 * cycles is not currently surfaced. Viz layer clipping is conservative:
 * pieces inside the inactive gap can still display but won't drive the
 * viz floor or ceiling.
 */
export function getFormDatingBoundaries(
  form_id: string | null
): { emergence_date?: number; extinction_date?: number } {
  if (!form_id) return {};
  const form = getForm(form_id);
  if (!form?.anti_classification_guidance) return {};

  const guidances: AntiClassificationGuidance[] = Array.isArray(form.anti_classification_guidance)
    ? form.anti_classification_guidance
    : [form.anti_classification_guidance];

  let emergence: number | undefined;
  let extinction: number | undefined;
  for (const g of guidances) {
    if (g.boundary_type === "form_emergence") {
      emergence = emergence === undefined ? g.boundary_date : Math.min(emergence, g.boundary_date);
    }
    if (g.boundary_type === "form_extinction") {
      extinction = extinction === undefined ? g.boundary_date : Math.max(extinction, g.boundary_date);
    }
  }

  const out: { emergence_date?: number; extinction_date?: number } = {};
  if (emergence !== undefined) out.emergence_date = emergence;
  if (extinction !== undefined) out.extinction_date = extinction;
  return out;
}

/**
 * B1 stub. Implementation deferred — current fixtures don't populate intake
 * dimensions; evaluator becomes useful once real user submissions land.
 */
export function evaluateDimensional(
  form_id: string | null,
  intake: any
): { ok: boolean; note: string } | null {
  if (!form_id) return null;
  const form = getForm(form_id);
  if (!form?.dimensional_thresholds) return null;
  const h = parseFloat(String(intake?.approximate_height ?? ""));
  const w = parseFloat(String(intake?.approximate_width ?? ""));
  if (!isFinite(h) && !isFinite(w)) {
    return null; // no intake dimensions; skip
  }
  const d = form.dimensional_thresholds;
  const failures: string[] = [];
  if (isFinite(h)) {
    if (d.height_min != null && h < d.height_min) failures.push(`height ${h}\" below floor ${d.height_min}\"`);
    if (d.height_max != null && h > d.height_max) failures.push(`height ${h}\" above ceiling ${d.height_max}\"`);
  }
  if (isFinite(w)) {
    if (d.width_min != null && w < d.width_min) failures.push(`width ${w}\" below floor ${d.width_min}\"`);
    if (d.width_max != null && w > d.width_max) failures.push(`width ${w}\" above ceiling ${d.width_max}\"`);
  }
  return failures.length === 0
    ? { ok: true, note: "dimensional thresholds consistent with form" }
    : { ok: false, note: `dimensional thresholds violated: ${failures.join(", ")}` };
}

/**
 * Single cousin-contrast match returned by evaluateCousinContrast.
 * Surfaces in p3.cousin_contrasts and is consumed by the report-rendering
 * layer to explain "why this form, not that one" calls when the engine has
 * close alternatives. Does NOT influence scoring decisions.
 */
export type CousinContrastMatch = {
  vs_form_id: string;
  vs_form_name: string;
  contrast_text: string;
};

/**
 * B3 implementation per D-PH3-2 lean: string matching from the picked form's
 * cousin_form_contrasts against the names and form_ids of the alternative
 * forms scored by p3. Returns matched contrasts for surfacing in the report.
 *
 * Matching is intentionally permissive: each cousin_form_contrasts entry is
 * scanned for case-insensitive substring presence of any alternative form's
 * `name` (e.g., "pedestal table") or `id` (e.g., "form_pedestal_table"). When
 * an alternative form name appears in a contrast string, that contrast is
 * recorded as applying to that alternative.
 *
 * Quality is dependent on appraiser-authored prose. If a piece's picked form
 * has rich cousin_form_contrasts naming its actual alternates, matches will
 * surface. If the prose names cousin forms the engine didn't score as
 * alternates, no match — that's fine; the contrasts remain as authoring
 * documentation.
 *
 * NOT engine-consumed by scoreForms — this is post-processing for report
 * explanation. Per the D-PH3-2 lean wiring decision: if string-matching
 * quality proves insufficient in practice, escalate to structured
 * disambiguation (medium or heavy paths from the 2d discussion).
 */
export function evaluateCousinContrast(
  form_id: string | null,
  alternative_form_ids: string[],
): CousinContrastMatch[] {
  if (!form_id) return [];
  const form = getForm(form_id);
  const contrasts = (form?.cousin_form_contrasts ?? []) as string[];
  if (!contrasts.length || !alternative_form_ids.length) return [];

  // Defensive: filter out the picked form's own id from alternatives.
  // p3's alternative_form_ids construction (engine.ts:5000) has a known
  // edge case where the picked form can appear in the alternatives list
  // (the `.filter((r) => r !== bestForm)` doesn't always exclude it).
  // Without this guard, cousin contrasts would self-match.
  const altIds = alternative_form_ids.filter((id) => id !== form_id);
  if (!altIds.length) return [];

  // Build lookup of alternative forms with both name and id for matching.
  const alternatives = altIds
    .map((id) => {
      const f = getForm(id);
      return f ? { id, name: f.name.toLowerCase(), display_name: f.name } : null;
    })
    .filter((x): x is { id: string; name: string; display_name: string } => x !== null);

  if (!alternatives.length) return [];

  const matches: CousinContrastMatch[] = [];
  const seen = new Set<string>(); // dedup by (vs_form_id + contrast_text)

  for (const contrast of contrasts) {
    const haystack = contrast.toLowerCase();
    for (const alt of alternatives) {
      // Match against either the form name (e.g., "pedestal table") or the
      // form_id (e.g., "form_pedestal_table"). Form_id matching catches
      // appraiser prose that uses explicit form_X references.
      if (haystack.includes(alt.name) || haystack.includes(alt.id)) {
        const key = `${alt.id}|${contrast}`;
        if (!seen.has(key)) {
          seen.add(key);
          matches.push({
            vs_form_id: alt.id,
            vs_form_name: alt.display_name,
            contrast_text: contrast,
          });
        }
      }
    }
  }

  return matches;
}

/**
 * Block 2c D-PH3-10: return display-ready common_aliases list for a form_id.
 * Strips parenthetical context from each alias entry ("bureau (in casual...)"
 * → "bureau") and dedups. Returns top N for report rendering.
 */
export function getCommonAliasesForDisplay(form_id: string | null, limit = 3): string[] {
  if (!form_id) return [];
  const form = getForm(form_id);
  const aliases = (form?.common_aliases ?? []) as string[];
  const cleaned: string[] = [];
  const seen = new Set<string>();
  for (const raw of aliases) {
    // Take portion before first "(" if present; trim.
    const name = String(raw).split("(")[0].trim();
    if (name && !seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      cleaned.push(name);
    }
    if (cleaned.length >= limit) break;
  }
  return cleaned;
}

// ── B5 Hybrid form router ────────────────────────────────────────────────

export type HybridAnnotation = {
  primary_form_id: string;
  primary_form_name: string;
  secondary_form_ids: string[];
  secondary_form_names: string[];
};

/**
 * B5 hybrid form router per D-PH3-3 lean. Reads FormEntry.secondary_form_associations
 * for the identified form_id. Returns a hybrid annotation when the form has
 * secondary associations populated; null otherwise.
 *
 * Currently only form_chest_of_drawers populates secondary_form_associations
 * (with ["form_blanket_chest"], capturing the mule-chest hybrid identity).
 * As more forms surface hybrid character during canonical authoring, this
 * evaluator activates without code changes.
 */
export function evaluateHybridForm(form_id: string | null): HybridAnnotation | null {
  if (!form_id) return null;
  const form = getForm(form_id);
  const secondaryIds = (form?.secondary_form_associations ?? []) as string[];
  if (secondaryIds.length === 0) return null;
  const secondaryNames = secondaryIds
    .map((id) => getForm(id)?.name)
    .filter((n): n is string => Boolean(n));
  return {
    primary_form_id: form_id,
    primary_form_name: form?.name ?? form_id,
    secondary_form_ids: secondaryIds,
    secondary_form_names: secondaryNames,
  };
}
