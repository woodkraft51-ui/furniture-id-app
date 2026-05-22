/**
 * Field-scan buy recommendation — single source of truth.
 *
 * Used by both the live Field Scan result (app/page.tsx) and the engine's
 * persisted field_scan output (lib/engine.ts) so the recommendation a user
 * sees in the moment matches the one stored with the case (and shown later in
 * the comparison view). Pure module — no React, safe to import server-side.
 *
 * When a Picker Profile is present the score becomes profile-aware: the
 * picker's deal_target drives a price-as-%-of-value gate, and very-limited
 * storage / low work tolerance apply downgrades. With no profile the behavior
 * is identical to the original fixed-dollar-margin model.
 */

export type RecommendationLevel = "BUY_NOW" | "BUY" | "CONSIDER" | "PASS";

export function recommendationLabel(rec: RecommendationLevel): string {
  if (rec === "BUY_NOW") return "BUY NOW";
  if (rec === "BUY") return "BUY";
  if (rec === "CONSIDER") return "CONSIDER";
  return "PASS";
}

export type PickerProfile = {
  restoration_skill?: string;
  buying_purpose?: string;
  deal_target?: string;
  work_tolerance?: string;
  storage_space?: string;
  selling_method?: string;
  sales_priority?: string;
  personal_priority?: string;
  repair_skills?: string[];
  large_item_penalty?: string;
};

// deal_target → the price ceiling the picker wants, as a fraction of estimated
// resale value. Mirrors the wizard copy in app/PickerProfileSetup.tsx
// (small ≈ 60–70%, moderate ≈ 40–50%, strong ≈ 25–40%, exceptional < 25%).
const DEAL_TARGET_CEILING: Record<string, number> = {
  small: 0.65,
  moderate: 0.45,
  strong: 0.32,
  exceptional: 0.22,
};

const LARGE_FORM_HINTS = [
  "armoire", "wardrobe", "dresser", "chest of drawers", "sideboard", "buffet",
  "hutch", "china cabinet", "cabinet", "cupboard", "bookcase", "secretary",
  "headboard", "bed", "dining table", "extension table", "highboy", "lowboy",
  "credenza", "dish dresser",
];

/** Heuristic: does this piece read as bulky? Dimensions win when supplied,
 *  else fall back to form-name keywords. */
export function isLargeForm(
  formLabel?: string,
  heightIn?: string | number,
  widthIn?: string | number
): boolean {
  const h = Number(String(heightIn ?? "").replace(/[^0-9.]/g, ""));
  const w = Number(String(widthIn ?? "").replace(/[^0-9.]/g, ""));
  if (Number.isFinite(h) && h >= 55) return true;
  if (Number.isFinite(w) && w >= 50) return true;
  const f = String(formLabel || "").toLowerCase();
  return LARGE_FORM_HINTS.some((k) => f.includes(k));
}

const REPAIR_HINTS = [
  "repair", "broken", "break", "crack", "missing", "replaced", "replacement",
  "loose", "reglue", "regli", "veneer lift", "veneer loss", "water damage",
  "warp", "split", "damage", "chip", "wobble", "wobbl", "structural",
];

/** Heuristic: do the user's free-text notes mention repair / damage? */
export function hasRepairSignals(...texts: Array<string | undefined | null>): boolean {
  const t = texts.map((x) => String(x || "")).join(" ").toLowerCase();
  return REPAIR_HINTS.some((k) => t.includes(k));
}

export type RecommendationInput = {
  askingPrice: string | number;
  valueLow: number;
  valueHigh: number;
  confidenceBand?: string;
  conflictCount?: number;
  profile?: PickerProfile | null;
  largeForm?: boolean;
  repairSignals?: boolean;
};

export type RecommendationResult = {
  recommendation: RecommendationLevel;
  label: string;
  explanation: string;
};

export function recommendationFromValue(input: RecommendationInput): RecommendationResult {
  const asking = Number(String(input.askingPrice ?? "").replace(/[$,]/g, "").trim());
  const hasAsking = Number.isFinite(asking) && asking > 0;
  const midpoint = Math.round((input.valueLow + input.valueHigh) / 2);
  const conflictCount = input.conflictCount || 0;
  const profile = input.profile || null;
  const dealTarget = profile?.deal_target;
  const targetCeiling = dealTarget ? DEAL_TARGET_CEILING[dealTarget] : undefined;

  let score = 50;
  const notes: string[] = [];

  if (hasAsking && midpoint > 0 && targetCeiling) {
    // Profile-aware: judge price as a fraction of estimated value against the
    // picker's stated deal target (lower ratio = better deal for them).
    const ratio = asking / midpoint;
    if (ratio <= targetCeiling * 0.75) score += 24;
    else if (ratio <= targetCeiling) score += 15;
    else if (ratio <= targetCeiling * 1.25) score += 4;
    else if (ratio <= targetCeiling * 1.6) score -= 10;
    else score -= 24;
    const pct = Math.round(ratio * 100);
    const tgt = Math.round(targetCeiling * 100);
    notes.push(`At $${asking}, that's about ${pct}% of the estimated value — your target is buying under ~${tgt}%.`);
  } else if (hasAsking) {
    // Original fixed-dollar-margin model (no profile / no deal target).
    const margin = midpoint - asking;
    if (margin >= 175) score += 24;
    else if (margin >= 90) score += 16;
    else if (margin >= 35) score += 8;
    else if (margin < 0) score -= 22;
  } else {
    score -= 6;
  }

  if (conflictCount >= 1) score -= 8;
  if (input.confidenceBand === "High") score += 8;
  if (input.confidenceBand === "Moderate") score += 3;
  if (input.confidenceBand === "Low") score -= 8;
  if (input.confidenceBand === "Inconclusive") score -= 14;

  if (profile) {
    if (input.largeForm && profile.storage_space === "very_limited" && profile.large_item_penalty === "yes") {
      score -= 14;
      notes.push("Large piece and you flagged very limited storage, so its score is lowered.");
    }
    if (input.repairSignals) {
      if (profile.work_tolerance === "none" || profile.restoration_skill === "none") {
        score -= 12;
        notes.push("It looks like it needs work, which doesn't fit your low appetite for repairs.");
      } else if (profile.work_tolerance === "light") {
        score -= 6;
        notes.push("It may need more than light cleanup, near the edge of your stated tolerance.");
      }
    }
  }

  let recommendation: RecommendationLevel = "CONSIDER";
  if (score >= 82) recommendation = "BUY_NOW";
  else if (score >= 66) recommendation = "BUY";
  else if (score < 45) recommendation = "PASS";

  if (!hasAsking && recommendation === "BUY_NOW") recommendation = "BUY";
  if (!hasAsking && recommendation === "BUY") recommendation = "CONSIDER";

  let base = "";
  if (!hasAsking) base = "No asking price was entered, so this recommendation stays conservative.";
  else if (recommendation === "BUY_NOW") base = "The estimated value lane and visible evidence support a strong buy at the entered price.";
  else if (recommendation === "BUY") base = "The piece appears promising at the entered price, with enough support for a positive field decision.";
  else if (recommendation === "CONSIDER") base = "There may be upside, but uncertainty or risk suggests a cautious decision.";
  else base = "The visible risk, weak margin, or limited support make this a pass.";

  return {
    recommendation,
    label: recommendationLabel(recommendation),
    explanation: [base, ...notes].join(" "),
  };
}
