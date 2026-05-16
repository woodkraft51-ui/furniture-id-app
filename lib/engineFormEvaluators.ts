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

/**
 * Pick the best subtype for the given form_id given observation descriptions.
 * Returns null when no subtype reaches the SUBTYPE_CONFIDENCE_FLOOR.
 *
 * Scoring: simple keyword presence in observation descriptions against each
 * subtype's distinguishing_attributes. Confidence = matched / total attrs.
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
      // Tokenize attribute and require at least one ≥4-char content word match.
      const tokens = String(attr).toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 4);
      if (tokens.some((t) => haystack.includes(t))) {
        matched.push(attr);
      }
    }
    const confidence = matched.length / attrs.length;
    if (confidence >= SUBTYPE_CONFIDENCE_FLOOR && (!best || confidence > best.confidence)) {
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
 * B3 stub. Implementation deferred per D-PH3-2 — start with string matching
 * if cousin contrast quality is needed; defer to follow-on if quality bad.
 * Current return: no-op (null).
 */
export function evaluateCousinContrast(
  _form_id: string | null,
  _observationDescriptions: string[]
): null {
  return null;
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
