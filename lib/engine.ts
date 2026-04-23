// ==============================
// ENGINE v2 — PERCEPTION FIRST
// ==============================

export type Perception = {
  materials: string[];
  features: string[];
  style: string[];
  labels: string[];
  rawText: string;
};

export type IdentificationResult = {
  primary: string;
  secondary: string | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reasoning: string[];
};


// ==============================
// 🔎 PERCEPTION LAYER
// ==============================

export function buildPerception(observations: any[]): Perception {
  const text = observations
    .map(o => `${o.clue || ""} ${o.description || ""}`)
    .join(" ")
    .toLowerCase();

  const has = (words: string[]) => words.some(w => text.includes(w));

  const perception: Perception = {
    materials: [],
    features: [],
    style: [],
    labels: [],
    rawText: text
  };

  // ---- MATERIAL DETECTION ----
  if (has(["metal", "iron", "steel", "brass"])) perception.materials.push("metal");
  if (has(["upholstered", "fabric", "cushion"])) perception.materials.push("upholstery");
  if (has(["wood", "oak", "cedar", "walnut"])) perception.materials.push("wood");

  // ---- FEATURE DETECTION ----
  if (has(["drawer"])) perception.features.push("drawers");
  if (has(["door"])) perception.features.push("doors");
  if (has(["bench", "seat"])) perception.features.push("seating");
  if (has(["mirror"])) perception.features.push("mirror");
  if (has(["drop front", "writing surface"])) perception.features.push("desk");
  if (has(["pigeonhole", "cubby"])) perception.features.push("cubbies");
  if (has(["telephone shelf", "phone shelf"])) perception.features.push("telephone");
  if (has(["shelf", "shelves"])) perception.features.push("shelving");
  if (has(["column", "pedestal"])) perception.features.push("pedestal");
  if (has(["headboard", "footboard", "bed"])) perception.features.push("bed");

  // ---- STYLE DETECTION ----
  if (has(["cabriole", "shell carving"])) perception.style.push("queen_anne");
  if (has(["barley twist", "jacobean"])) perception.style.push("jacobean");
  if (has(["mission", "arts and crafts"])) perception.style.push("mission");

  // ---- LABEL DETECTION ----
  if (has(["roos"])) perception.labels.push("roos");
  if (has(["lane"])) perception.labels.push("lane");

  return perception;
}


// ==============================
// 🧠 FORM CLASSIFIER (CORE FIX)
// ==============================

export function classifyForm(p: Perception): IdentificationResult {

  const r: IdentificationResult = {
    primary: "Unknown",
    secondary: null,
    confidence: "LOW",
    reasoning: []
  };

  const has = (f: string) => p.features.includes(f);
  const style = (s: string) => p.style.includes(s);

  // =========================
  // 🏆 LABEL OVERRIDE (TOP)
  // =========================
  if (p.labels.includes("roos")) {
    r.primary = "Roos Cedar Chest";
    r.confidence = "HIGH";
    r.reasoning.push("Manufacturer label detected");
    return r;
  }

  if (p.labels.includes("lane")) {
    r.primary = "Lane Cedar Chest";
    r.confidence = "HIGH";
    r.reasoning.push("Manufacturer label detected");
    return r;
  }

  // =========================
  // 🔥 HYBRID / FUNCTION FIRST
  // =========================
  if (has("seating") && has("telephone")) {
    r.primary = "Telephone Bench";
    r.secondary = "Hybrid Seating Storage";
    r.confidence = "HIGH";
    r.reasoning.push("Seating + telephone shelf combination");
    return r;
  }

  if (has("seating") && has("desk")) {
    r.primary = "Secretary / Telephone Bench Combo";
    r.confidence = "HIGH";
    r.reasoning.push("Seating + writing surface");
    return r;
  }

  if (has("seating") && has("cubbies")) {
    r.primary = "Telephone Bench / Secretary Hybrid";
    r.confidence = "HIGH";
    r.reasoning.push("Seating + cubbies");
    return r;
  }

  // =========================
  // 🛏️ MATERIAL-DRIVEN FORMS
  // =========================
  if (has("bed") && p.materials.includes("metal")) {
    r.primary = "Iron Bed";
    r.confidence = "HIGH";
    r.reasoning.push("Metal + bed structure");
    return r;
  }

  if (has("pedestal")) {
    r.primary = "Pedestal Stand";
    r.confidence = "HIGH";
    r.reasoning.push("Column structure");
    return r;
  }

  // =========================
  // 🪑 UPHOLSTERED FURNITURE
  // =========================
  if (p.materials.includes("upholstery")) {
    if (style("queen_anne")) {
      r.primary = "Queen Anne Style Armchair";
      r.confidence = "HIGH";
      r.reasoning.push("Cabriole legs + upholstery");
      return r;
    }

    r.primary = "Upholstered Chair";
    r.confidence = "MEDIUM";
    return r;
  }

  // =========================
  // 🪵 CASE GOODS
  // =========================
  if (has("drawers") && has("doors")) {
    r.primary = "Armoire / Dresser Combination";
    r.confidence = "MEDIUM";
    return r;
  }

  if (has("drawers")) {
    r.primary = "Chest of Drawers";
    r.confidence = "MEDIUM";
    return r;
  }

  if (has("doors")) {
    if (style("jacobean")) {
      r.primary = "Jacobean Revival Cabinet";
      r.confidence = "HIGH";
      return r;
    }

    r.primary = "Cabinet";
    r.confidence = "MEDIUM";
    return r;
  }

  // =========================
  // 🧠 FALLBACK
  // =========================
  r.primary = "Unclassified Furniture";
  r.confidence = "LOW";
  r.reasoning.push("Insufficient functional signals");

  return r;
}


// ==============================
// 🚀 MAIN ENGINE ENTRY
// ==============================

export function runEngine(observations: any[]): IdentificationResult {

  const perception = buildPerception(observations);

  const result = classifyForm(perception);

  return result;
}
