import { API } from "./store";

export type PrecisionLevel = "low" | "medium" | "high";
export type RecommendationLevel =
  | "BUY_NOW"
  | "BUY"
  | "CONSIDER_IF_NEGOTIABLE"
  | "PASS";

type Observation = {
  type: string;
  clue?: string | null;
  description: string;
  confidence: number;
  source_image?: string | null;
  hard_negative?: boolean;
  low_confidence_flag?: boolean;
};

type FieldScanProfile = {
  restoration_skill?: "none" | "basic" | "intermediate" | "advanced";
  buying_purpose?: "resale" | "personal" | "both";
  deal_target?: "small" | "moderate" | "strong" | "exceptional";
  work_tolerance?: "none" | "light" | "moderate" | "heavy";
  storage_space?: "very_limited" | "moderate" | "large";
  selling_method?: "local_pickup" | "local_delivery" | "nationwide" | "mixed";
  sales_priority?: "fast" | "profit" | "balanced";
  personal_priority?: "function" | "beauty" | "character" | "balanced";
  repair_skills?: string[];
  large_item_penalty?: "yes" | "no";
};

type FieldScanIntake = {
  asking_price?: string | number;
  user_category_guess?: string;
  primary_wood_guess?: string;
  where_acquired?: string;
  condition_notes?: string;
  known_alterations?: string;
  notes?: string;

  has_drawers?: boolean;
  has_doors?: boolean;
  folds_or_expands?: boolean;
  has_mechanical_parts?: boolean;
  suggests_prior_function?: boolean;

  picker_profile?: FieldScanProfile;
};

type MissingEvidenceMap = {
  front_photo: boolean;
  side_photo: boolean;
  underside_photo: boolean;
  back_photo: boolean;
  joinery_photo: boolean;
  hardware_photo: boolean;
};

type EvidenceDigest = {
  observations: Observation[];
  observation_count: number;
  clue_keys: string[];
  hard_negatives: string[];
  strongest_observations: Observation[];
};

type StructuralSupport = {
  structural_observation_count: number;
  mechanism_count: number;
  joinery_count: number;
  fastener_count: number;
  toolmark_count: number;
  structural_material_count: number;
  supportive_view_count: number;
  supportive_views: string[];
  strong_form_supported: boolean;
};

type FS0Result = {
  ok: true;
  observations: Observation[];
  evidence_digest: EvidenceDigest;
  note: string;
  raw_error?: any;
};

type FS1Result = {
  precision_level: PrecisionLevel;
  confidence_statement: "broad" | "supported" | "well_supported";
  evidence_summary: string;
  missing_evidence: MissingEvidenceMap;
  structural_evidence_present: boolean;
  structural_support: StructuralSupport;
  next_best_evidence: string[];
};

type FS2Result = {
  primary_identification: string;
  alternate_identification: string | null;
  style_context: string;
  date_range: string;
  date_reasoning: string;
};

type FS3Result = {
  condition_lane: "low_risk" | "moderate_risk" | "high_risk";
  labor_lane: "low" | "medium" | "high";
  risk_flags: string[];
};

type FS4Result = {
  valuation_low: number;
  valuation_high: number;
  valuation_display: string;
  value_reasoning: string;
};

type FS5Result = {
  recommendation: RecommendationLevel;
  recommendation_display: string;
  margin_estimate: number | null;
  fit_score: number;
  recommendation_reasoning: string;
};

type FS6Result = {
  headline: string;
  supported_summary: string[];
  limitations_summary: string[];
  next_steps: string[];
  final_report: string;
};

type ClaudeResult =
  | { ok: true; parsed: any; raw: string }
  | { ok: false; error: any };

const CLUE_LIBRARY: Record<
  string,
  {
    category: string;
    structural?: boolean;
    hardNegative?: boolean;
    explanation: string;
    formHint?: string;
  }
> = {
  drop_leaf_hinged: {
    category: "construction",
    structural: true,
    explanation: "Defining drop-leaf mechanism.",
    formHint: "Drop-leaf table",
  },
  gateleg_support: {
    category: "construction",
    structural: true,
    explanation: "Defining gateleg support structure.",
    formHint: "Gateleg table",
  },
  rule_joint: {
    category: "joinery",
    structural: true,
    explanation: "Leaf-edge joinery clue.",
    formHint: "Drop-leaf table",
  },
  swing_leg: {
    category: "construction",
    structural: true,
    explanation: "Leaf-support mechanism.",
    formHint: "Drop-leaf table",
  },
  lift_lid: {
    category: "construction",
    structural: true,
    explanation: "Chest-form mechanism.",
    formHint: "Blanket chest",
  },
  slant_front: {
    category: "construction",
    structural: true,
    explanation: "Desk-form mechanism.",
    formHint: "Slant-front desk",
  },
  cylinder_roll: {
    category: "construction",
    structural: true,
    explanation: "Roll-top mechanism.",
    formHint: "Roll-top desk",
  },
  extension_mechanism: {
    category: "construction",
    structural: true,
    explanation: "Table extension mechanism.",
    formHint: "Extension table",
  },

  hand_cut_dovetails: {
    category: "joinery",
    structural: true,
    explanation: "Strong construction clue.",
  },
  machine_dovetails: {
    category: "joinery",
    structural: true,
    explanation: "Factory joinery clue.",
  },
  mortise_and_tenon: {
    category: "joinery",
    structural: true,
    explanation: "Traditional structural joinery.",
  },
  dowel_joinery: {
    category: "joinery",
    structural: true,
    explanation: "Later joinery clue.",
  },

  pit_saw_marks: {
    category: "toolmarks",
    structural: true,
    explanation: "Early milling evidence.",
  },
  circular_saw_arcs: {
    category: "toolmarks",
    structural: true,
    explanation: "Post-1830 milling evidence.",
  },
  band_saw_lines: {
    category: "toolmarks",
    structural: true,
    explanation: "Later factory sawing evidence.",
  },
  hand_plane_chatter: {
    category: "toolmarks",
    structural: true,
    explanation: "Hand-prepared surface clue.",
  },

  hand_forged_nail: {
    category: "fasteners",
    structural: true,
    explanation: "Early fastener evidence.",
  },
  cut_nail: {
    category: "fasteners",
    structural: true,
    explanation: "19th-century fastener evidence.",
  },
  wire_nail: {
    category: "fasteners",
    structural: true,
    explanation: "Later fastener evidence.",
  },
  slotted_handmade_screw: {
    category: "fasteners",
    structural: true,
    explanation: "Earlier screw evidence.",
  },
  slotted_machine_screw: {
    category: "fasteners",
    structural: true,
    explanation: "Machine screw evidence.",
  },
  phillips_screw: {
    category: "fasteners",
    structural: true,
    hardNegative: true,
    explanation: "Hard negative for early manufacture claims.",
  },
  staple_fastener: {
    category: "fasteners",
    structural: true,
    hardNegative: true,
    explanation: "Hard negative for antique structural claims.",
  },

  plywood_structural: {
    category: "materials",
    structural: true,
    hardNegative: true,
    explanation: "Hard negative for earlier antique claims.",
  },
  plywood_drawer_bottom: {
    category: "materials",
    structural: true,
    hardNegative: true,
    explanation: "Hard negative for earlier antique claims.",
  },
  modern_concealed_hinge: {
    category: "hardware",
    hardNegative: true,
    explanation: "Hard negative for early antique manufacture claims.",
  },

  porcelain_caster: {
    category: "hardware",
    explanation: "Helpful but replaceable hardware clue.",
  },
  victorian_strap_hinge: {
    category: "hardware",
    explanation: "Helpful but replaceable hardware clue.",
  },
  batwing_brass_pull: {
    category: "hardware",
    explanation: "Helpful but replaceable hardware clue.",
  },
  eastlake_pull: {
    category: "hardware",
    explanation: "Helpful but replaceable hardware clue.",
  },

  polyurethane: {
    category: "finish",
    explanation: "Later finish clue.",
  },
  shellac_crazing: {
    category: "finish",
    explanation: "Helpful surface clue.",
  },

  drawer_present: {
    category: "construction",
    explanation: "Supports case-piece reading.",
    formHint: "Chest of drawers",
  },
  door_present: {
    category: "construction",
    explanation: "Supports cabinet-form reading.",
    formHint: "Cabinet",
  },
};

function cleanJsonText(raw: string): string {
  return String(raw || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function tryJsonParse(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractBalancedJson(text: string): string | null {
  const cleaned = cleanJsonText(text);
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");

  let start = -1;
  let openChar = "";
  let closeChar = "";

  if (firstBrace === -1 && firstBracket === -1) return null;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
    openChar = "{";
    closeChar = "}";
  } else {
    start = firstBracket;
    openChar = "[";
    closeChar = "]";
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === openChar) depth++;
    if (ch === closeChar) depth--;

    if (depth === 0) return cleaned.slice(start, i + 1);
  }

  return null;
}

function parseModelJson(raw: string): any | null {
  const cleaned = cleanJsonText(raw);
  return tryJsonParse(cleaned) || tryJsonParse(extractBalancedJson(cleaned) || "");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function asString(v: any): string {
  return typeof v === "string" ? v.trim() : "";
}

function asNumber(v: any): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[$,]/g, "").trim();
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function titleCase(text: string) {
  return String(text || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function normalizeClueKey(v: any): string | null {
  const key = asString(v).toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_");
  return key || null;
}

function detectClueFromText(text: string): string | null {
  const t = text.toLowerCase();

  if (t.includes("gate leg") || t.includes("gate-leg")) return "gateleg_support";
  if (t.includes("drop leaf") || t.includes("drop-leaf")) return "drop_leaf_hinged";
  if (t.includes("rule joint")) return "rule_joint";
  if (t.includes("swing leg")) return "swing_leg";
  if (t.includes("lift lid") || t.includes("hinged lid")) return "lift_lid";
  if (t.includes("slant front") || t.includes("fall front")) return "slant_front";
  if (t.includes("roll top") || t.includes("tambour")) return "cylinder_roll";
  if (t.includes("extension mechanism")) return "extension_mechanism";

  if (t.includes("hand cut dovetail")) return "hand_cut_dovetails";
  if (t.includes("machine dovetail")) return "machine_dovetails";
  if (t.includes("mortise") && t.includes("tenon")) return "mortise_and_tenon";
  if (t.includes("dowel")) return "dowel_joinery";

  if (t.includes("pit saw")) return "pit_saw_marks";
  if (t.includes("circular saw")) return "circular_saw_arcs";
  if (t.includes("band saw")) return "band_saw_lines";
  if (t.includes("hand plane")) return "hand_plane_chatter";

  if (t.includes("cut nail")) return "cut_nail";
  if (t.includes("wire nail")) return "wire_nail";
  if (t.includes("phillips")) return "phillips_screw";
  if (t.includes("staple")) return "staple_fastener";
  if (t.includes("hand forged nail")) return "hand_forged_nail";
  if (t.includes("machine screw")) return "slotted_machine_screw";
  if (t.includes("handmade screw") || t.includes("hand-cut screw")) return "slotted_handmade_screw";

  if (t.includes("plywood")) return "plywood_structural";
  if (t.includes("concealed hinge")) return "modern_concealed_hinge";

  if (t.includes("porcelain caster")) return "porcelain_caster";
  if (t.includes("eastlake")) return "eastlake_pull";
  if (t.includes("strap hinge")) return "victorian_strap_hinge";
  if (t.includes("batwing")) return "batwing_brass_pull";

  if (t.includes("polyurethane")) return "polyurethane";
  if (t.includes("shellac")) return "shellac_crazing";

  if (t.includes("drawer")) return "drawer_present";
  if (t.includes("door")) return "door_present";

  return null;
}

function descriptionFromObservation(o: any): string {
  return (
    asString(o?.description) ||
    asString(o?.observed_value_text) ||
    asString(o?.value) ||
    asString(o?.text) ||
    "Unknown observation"
  );
}

function dedupeObservations(observations: Observation[]) {
  const seen = new Set<string>();
  const out: Observation[] = [];

  for (const obs of observations) {
    const key = `${obs.type}|${obs.clue || ""}|${obs.description.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(obs);
  }

  return out;
}

function normalizeObservationsFromParsed(parsed: any): Observation[] {
  if (!parsed || typeof parsed !== "object") return [];

  const direct = Array.isArray(parsed.observations) ? parsed.observations : [];
  const out: Observation[] = [];

  const push = (raw: any) => {
    const description = descriptionFromObservation(raw);
    const clue =
      normalizeClueKey(raw?.clue) ||
      normalizeClueKey(raw?.reference_id) ||
      detectClueFromText(description);

    const meta = clue ? CLUE_LIBRARY[clue] : undefined;

    out.push({
      type: asString(raw?.type) || meta?.category || "unknown",
      clue,
      description,
      confidence: clamp(
        typeof raw?.confidence === "number"
          ? raw.confidence
          : Math.round((typeof raw?.raw_confidence === "number" ? raw.raw_confidence : 0.45) * 100),
        5,
        99
      ),
      source_image: asString(raw?.source_image) || null,
      hard_negative: Boolean(raw?.hard_negative || meta?.hardNegative),
      low_confidence_flag:
        typeof raw?.confidence === "number" ? raw.confidence < 45 : false,
    });
  };

  if (direct.length) {
    direct.forEach(push);
    return dedupeObservations(out);
  }

  const snippets = JSON.stringify(parsed);
  if (!snippets) return [];

  const parts = snippets.split(/[\[\]\{\},]/).map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    const clue = detectClueFromText(part);
    if (!clue && part.length < 8) continue;
    const meta = clue ? CLUE_LIBRARY[clue] : undefined;

    out.push({
      type: meta?.category || "context",
      clue,
      description: part,
      confidence: clue ? 58 : 40,
      source_image: null,
      hard_negative: Boolean(meta?.hardNegative),
      low_confidence_flag: !clue,
    });
  }

  return dedupeObservations(out);
}

function computeMissingEvidence(images: any[]): MissingEvidenceMap {
  const types = new Set(images.map((img) => String(img?.image_type || "")));

  return {
    front_photo: !types.has("overall_front"),
    side_photo: !types.has("overall_side"),
    underside_photo: !types.has("underside"),
    back_photo: !types.has("back"),
    joinery_photo: !types.has("joinery_closeup"),
    hardware_photo: !types.has("hardware_closeup"),
  };
}

function buildEvidenceDigest(observations: Observation[]): EvidenceDigest {
  const clueKeys = uniq(
    observations
      .map((o) => normalizeClueKey(o.clue))
      .filter(Boolean) as string[]
  );

  const hardNegatives = uniq(
    observations
      .filter((o) => o.hard_negative)
      .map((o) => o.clue || o.description)
      .filter(Boolean)
  );

  const strongest = [...observations]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8);

  return {
    observations,
    observation_count: observations.length,
    clue_keys: clueKeys,
    hard_negatives: hardNegatives,
    strongest_observations: strongest,
  };
}

function buildIntakeSummary(intake: FieldScanIntake) {
  const parts: string[] = [];

  const push = (label: string, value: any) => {
    if (value === undefined || value === null) return;
    if (typeof value === "boolean") {
      parts.push(`${label}: ${value ? "yes" : "no"}`);
      return;
    }
    const text = asString(String(value));
    if (text) parts.push(`${label}: ${text}`);
  };

  push("User category guess", intake.user_category_guess);
  push("Wood species guess", intake.primary_wood_guess);
  push("Where acquired", intake.where_acquired);
  push("Condition notes", intake.condition_notes);
  push("Known alterations", intake.known_alterations);
  push("User notes", intake.notes);
  push("Has drawers", intake.has_drawers);
  push("Has doors", intake.has_doors);
  push("Folds or expands", intake.folds_or_expands);
  push("Has mechanical parts", intake.has_mechanical_parts);
  push("Suggests prior function", intake.suggests_prior_function);

  return parts.join(" | ") || "No intake details provided.";
}

function applyIntakeHints(intake: FieldScanIntake, observations: Observation[]) {
  const next = [...observations];

  const add = (type: string, clue: string | null, description: string, confidence: number) => {
    next.push({
      type,
      clue,
      description,
      confidence,
      source_image: "intake",
      hard_negative: Boolean(clue && CLUE_LIBRARY[clue]?.hardNegative),
      low_confidence_flag: false,
    });
  };

  if (intake.has_drawers) add("construction", "drawer_present", "User indicates drawers are present", 56);
  if (intake.has_doors) add("construction", "door_present", "User indicates doors are present", 56);
  if (intake.folds_or_expands) add("construction", null, "User indicates the piece folds or expands", 52);
  if (intake.has_mechanical_parts) add("construction", null, "User indicates mechanical parts are present", 52);
  if (intake.suggests_prior_function) add("context", null, "User suspects a prior function or conversion", 52);

  return dedupeObservations(next);
}

function promoteEvidenceFeatures(observations: Observation[]): Observation[] {
  const promoted = [...observations];

  const addIfMissing = (type: string, clue: string | null, description: string, confidence: number, source: string | null) => {
    const exists = promoted.some(
      (o) =>
        (clue && o.clue === clue) ||
        o.description.toLowerCase() === description.toLowerCase()
    );
    if (!exists) {
      promoted.push({
        type,
        clue,
        description,
        confidence,
        source_image: source,
        hard_negative: Boolean(clue && CLUE_LIBRARY[clue]?.hardNegative),
        low_confidence_flag: false,
      });
    }
  };

  for (const obs of observations) {
    const text = `${obs.clue || ""} ${obs.description}`.toLowerCase();
    const source = obs.source_image || null;

    if (text.includes("gate leg") || text.includes("gate-leg")) {
      addIfMissing("construction", "gateleg_support", "Gate-leg support is visibly present", 78, source);
    }
    if (text.includes("drop leaf") || text.includes("drop-leaf")) {
      addIfMissing("construction", "drop_leaf_hinged", "Drop-leaf construction is visibly present", 78, source);
    }
    if (text.includes("rule joint")) {
      addIfMissing("joinery", "rule_joint", "Rule joint appears visible at the leaf edge", 72, source);
    }
    if (text.includes("dovetail")) {
      if (text.includes("hand")) {
        addIfMissing("joinery", "hand_cut_dovetails", "Hand-cut dovetail construction appears visible", 72, source);
      } else if (text.includes("machine")) {
        addIfMissing("joinery", "machine_dovetails", "Machine-cut dovetails appear visible", 70, source);
      }
    }
    if (text.includes("cut nail")) {
      addIfMissing("fasteners", "cut_nail", "Cut nails appear visible", 72, source);
    }
    if (text.includes("wire nail")) {
      addIfMissing("fasteners", "wire_nail", "Wire nails appear visible", 70, source);
    }
    if (text.includes("phillips")) {
      addIfMissing("fasteners", "phillips_screw", "Phillips screws appear visible", 75, source);
    }
    if (text.includes("circular saw")) {
      addIfMissing("toolmarks", "circular_saw_arcs", "Circular saw marks appear visible", 70, source);
    }
    if (text.includes("band saw")) {
      addIfMissing("toolmarks", "band_saw_lines", "Band saw marks appear visible", 70, source);
    }
    if (text.includes("pit saw")) {
      addIfMissing("toolmarks", "pit_saw_marks", "Pit-saw marks appear visible", 74, source);
    }
    if (text.includes("mortise") && text.includes("tenon")) {
      addIfMissing("joinery", "mortise_and_tenon", "Mortise-and-tenon construction appears visible", 70, source);
    }
    if (text.includes("dowel")) {
      addIfMissing("joinery", "dowel_joinery", "Dowel joinery appears visible", 66, source);
    }
    if (text.includes("roll top") || text.includes("tambour")) {
      addIfMissing("construction", "cylinder_roll", "Roll-top or tambour mechanism appears visible", 80, source);
    }
    if (text.includes("slant front") || text.includes("fall front")) {
      addIfMissing("construction", "slant_front", "Slant-front desk mechanism appears visible", 80, source);
    }
  }

  return dedupeObservations(promoted);
}

function deriveStructuralSupport(digest: EvidenceDigest): StructuralSupport {
  const supportiveViews = new Set<string>();
  let mechanismCount = 0;
  let joineryCount = 0;
  let fastenerCount = 0;
  let toolmarkCount = 0;
  let structuralMaterialCount = 0;

  for (const obs of digest.observations) {
    const clue = obs.clue || "";
    const category = clue && CLUE_LIBRARY[clue] ? CLUE_LIBRARY[clue].category : obs.type;
    const source = obs.source_image || "";

    if (
      source === "underside" ||
      source === "back" ||
      source === "joinery_closeup" ||
      source === "hardware_closeup"
    ) {
      if (
        category === "construction" ||
        category === "joinery" ||
        category === "fasteners" ||
        category === "toolmarks" ||
        category === "materials"
      ) {
        supportiveViews.add(source);
      }
    }

    if (
      clue === "gateleg_support" ||
      clue === "drop_leaf_hinged" ||
      clue === "rule_joint" ||
      clue === "swing_leg" ||
      clue === "lift_lid" ||
      clue === "slant_front" ||
      clue === "cylinder_roll" ||
      clue === "extension_mechanism"
    ) {
      mechanismCount++;
    }

    if (category === "joinery") joineryCount++;
    if (category === "fasteners") fastenerCount++;
    if (category === "toolmarks") toolmarkCount++;
    if (category === "materials") structuralMaterialCount++;
  }

  const strongFormSupported =
    mechanismCount >= 1 ||
    digest.clue_keys.some((key) => ["gateleg_support", "drop_leaf_hinged", "lift_lid", "slant_front", "cylinder_roll", "extension_mechanism"].includes(key));

  const structuralObservationCount =
    mechanismCount + joineryCount + fastenerCount + toolmarkCount + structuralMaterialCount;

  return {
    structural_observation_count: structuralObservationCount,
    mechanism_count: mechanismCount,
    joinery_count: joineryCount,
    fastener_count: fastenerCount,
    toolmark_count: toolmarkCount,
    structural_material_count: structuralMaterialCount,
    supportive_view_count: supportiveViews.size,
    supportive_views: Array.from(supportiveViews),
    strong_form_supported: strongFormSupported,
  };
}

function determinePrecision(
  digest: EvidenceDigest,
  missing: MissingEvidenceMap,
  support: StructuralSupport
): PrecisionLevel {
  const hardNegCount = digest.hard_negatives.length;

  if (
    support.strong_form_supported &&
    support.structural_observation_count >= 2 &&
    support.supportive_view_count >= 1 &&
    hardNegCount <= 1
  ) {
    return "medium";
  }

  if (
    support.structural_observation_count >= 3 &&
    (support.joinery_count >= 1 || support.fastener_count >= 1 || support.toolmark_count >= 1) &&
    hardNegCount <= 1
  ) {
    return "medium";
  }

  if (
    support.structural_observation_count >= 5 &&
    support.supportive_view_count >= 2 &&
    hardNegCount === 0
  ) {
    return "high";
  }

  if (
    support.structural_observation_count >= 2 &&
    (!missing.underside_photo || !missing.back_photo || !missing.joinery_photo)
  ) {
    return "medium";
  }

  return "low";
}

function buildFs1(digest: EvidenceDigest, images: any[]): FS1Result {
  const missing = computeMissingEvidence(images);
  const support = deriveStructuralSupport(digest);
  const structural = support.structural_observation_count > 0;
  const precision = determinePrecision(digest, missing, support);

  const nextBest: string[] = [];
  if (missing.underside_photo) nextBest.push("Underside photo, if accessible");
  if (missing.back_photo) nextBest.push("Back photo, if accessible");
  if (missing.joinery_photo) nextBest.push("Joinery close-up, if accessible");
  if (missing.hardware_photo) nextBest.push("Hardware close-up, if accessible");

  let evidenceSummary = "Field Scan is operating from broad visible evidence.";
  let confidenceStatement: FS1Result["confidence_statement"] = "broad";

  if (precision === "medium") {
    evidenceSummary =
      "Field Scan includes meaningful construction support, so the result can be more specific while still staying broad.";
    confidenceStatement = "supported";
  }

  if (precision === "high") {
    evidenceSummary =
      "Field Scan includes multiple supporting construction clues, so form and date precision can be tighter than a style-only read.";
    confidenceStatement = "well_supported";
  }

  return {
    precision_level: precision,
    confidence_statement: confidenceStatement,
    evidence_summary: evidenceSummary,
    missing_evidence: missing,
    structural_evidence_present: structural,
    structural_support: support,
    next_best_evidence: uniq(nextBest).slice(0, 4),
  };
}

function identifyForm(observations: Observation[], intake: FieldScanIntake) {
  const text = observations.map((o) => `${o.clue || ""} ${o.description}`.toLowerCase()).join(" | ");
  const score: Record<string, number> = {
    "Gateleg table": 0,
    "Drop-leaf table": 0,
    "Blanket chest": 0,
    "Cabinet": 0,
    "Chest of drawers": 0,
    "Desk": 0,
    "Bookcase": 0,
    "Table": 0,
    "Slant-front desk": 0,
    "Roll-top desk": 0,
    "Extension table": 0,
  };

  if (text.includes("gateleg_support") || text.includes("gate leg")) {
    score["Gateleg table"] += 12;
    score["Table"] += 1;
  }

  if (text.includes("drop_leaf_hinged") || text.includes("drop leaf")) {
    score["Drop-leaf table"] += 11;
    score["Table"] += 1;
  }

  if (text.includes("rule_joint")) {
    score["Drop-leaf table"] += 4;
    score["Gateleg table"] += 3;
  }

  if (text.includes("swing_leg")) {
    score["Drop-leaf table"] += 4;
  }

  if (text.includes("lift_lid")) {
    score["Blanket chest"] += 11;
  }

  if (text.includes("door_present")) {
    score["Cabinet"] += 6;
  }

  if (text.includes("drawer_present")) {
    score["Chest of drawers"] += 6;
    score["Desk"] += 2;
  }

  if (text.includes("slant_front")) {
    score["Slant-front desk"] += 12;
    score["Desk"] += 2;
  }

  if (text.includes("cylinder_roll")) {
    score["Roll-top desk"] += 12;
    score["Desk"] += 2;
  }

  if (text.includes("extension_mechanism")) {
    score["Extension table"] += 11;
    score["Table"] += 2;
  }

  const guess = asString(intake.user_category_guess).toLowerCase();
  if (guess.includes("table")) {
    score["Table"] += 3;
    score["Drop-leaf table"] += 1;
    score["Gateleg table"] += 1;
    score["Extension table"] += 1;
  }
  if (guess.includes("bookcase") || guess.includes("bookshelf")) score["Bookcase"] += 6;
  if (guess.includes("cabinet")) score["Cabinet"] += 4;
  if (guess.includes("desk")) {
    score["Desk"] += 3;
    score["Slant-front desk"] += 1;
    score["Roll-top desk"] += 1;
  }
  if (guess.includes("chest") || guess.includes("dresser")) score["Chest of drawers"] += 3;

  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const best = ranked[0];
  const alt = ranked.find((r) => r[1] > 0 && r[0] !== best[0]);

  return {
    primary: best && best[1] > 0 ? best[0] : "Furniture form not confidently narrowed",
    alternate: alt ? alt[0] : null,
    primaryScore: best?.[1] || 0,
  };
}

function detectStyleContext(observations: Observation[]) {
  const text = observations.map((o) => o.description.toLowerCase()).join(" | ");

  if (text.includes("eastlake")) {
    return "Shows Eastlake or late Victorian decorative influence, though those details can be replaced or repeated later.";
  }
  if (text.includes("turned") || text.includes("caster") || text.includes("strap hinge")) {
    return "Shows features often associated with Victorian or late 19th-century styling, though those styles repeated in later periods.";
  }
  if (text.includes("mission") || text.includes("arts and crafts")) {
    return "Shows Mission or Arts and Crafts influence, though revival periods can resemble earlier work.";
  }

  return "Visible style cues help with broad context, but style alone is not enough for a tight age claim.";
}

function broadDateRange(
  digest: EvidenceDigest,
  fs1: FS1Result
) {
  const clues = new Set(digest.clue_keys);
  const support = fs1.structural_support;

  if (clues.has("phillips_screw") || clues.has("modern_concealed_hinge") || clues.has("staple_fastener")) {
    return {
      range: "Likely post-1935",
      reason: "Visible hard negatives rule out an early antique manufacture date.",
    };
  }

  if (clues.has("hand_forged_nail") || clues.has("pit_saw_marks")) {
    return {
      range: fs1.precision_level === "high" ? "Likely pre-1830" : "Broadly pre-1830 to mid-19th century",
      reason: "Early fastener or milling evidence supports an earlier date lane.",
    };
  }

  if (clues.has("hand_cut_dovetails") || clues.has("slotted_handmade_screw")) {
    return {
      range:
        fs1.precision_level === "high"
          ? "Broadly c. 1780–1860"
          : "Broadly 19th century",
      reason: "Early joinery or screw evidence supports an earlier construction period.",
    };
  }

  if (
    clues.has("cut_nail") ||
    clues.has("circular_saw_arcs") ||
    clues.has("porcelain_caster")
  ) {
    return {
      range:
        fs1.precision_level === "medium" || fs1.precision_level === "high"
          ? "Broadly c. 1830–1890"
          : "Mid-19th to early 20th century (c. 1850–1910)",
      reason: "19th-century fastener, milling, or hardware evidence supports a broad 19th-century lane.",
    };
  }

  if (
    clues.has("wire_nail") ||
    clues.has("machine_dovetails") ||
    clues.has("band_saw_lines") ||
    clues.has("dowel_joinery")
  ) {
    return {
      range:
        fs1.precision_level === "medium" || fs1.precision_level === "high"
          ? "Broadly c. 1880–1930"
          : "Late 19th to early 20th century",
      reason: "Factory-era construction clues support a late 19th to early 20th century lane.",
    };
  }

  if (support.strong_form_supported && support.structural_observation_count >= 2) {
    return {
      range: "Broadly 19th to early 20th century",
      reason: "The current read is supported by form and some construction evidence, but not enough for a tighter structural date lane.",
    };
  }

  return {
    range: "Broadly 19th to early 20th century style",
    reason: "The current read is driven more by visible form and style than by structural dating evidence.",
  };
}

function buildFs2(digest: EvidenceDigest, intake: FieldScanIntake, fs1: FS1Result): FS2Result {
  const form = identifyForm(digest.observations, intake);
  const style = detectStyleContext(digest.observations);
  const date = broadDateRange(digest, fs1);

  return {
    primary_identification: form.primary,
    alternate_identification: form.alternate,
    style_context: style,
    date_range: date.range,
    date_reasoning: date.reason,
  };
}

function buildFs3(digest: EvidenceDigest, intake: FieldScanIntake): FS3Result {
  const notes = [
    asString(intake.condition_notes).toLowerCase(),
    asString(intake.known_alterations).toLowerCase(),
    ...digest.observations.map((o) => o.description.toLowerCase()),
  ].join(" | ");

  const riskFlags: string[] = [];
  let labor: FS3Result["labor_lane"] = "low";

  if (notes.includes("loose") || notes.includes("wobb") || notes.includes("repair")) {
    riskFlags.push("Possible structural looseness or repair needs");
    labor = "medium";
  }

  if (notes.includes("veneer") || notes.includes("lifting") || notes.includes("missing")) {
    riskFlags.push("Veneer loss or missing parts may reduce value and increase labor");
    labor = labor === "medium" ? "high" : "medium";
  }

  if (notes.includes("refinish") || notes.includes("polyurethane")) {
    riskFlags.push("Surface may be refinished, which can affect originality");
  }

  if (digest.hard_negatives.length > 0) {
    riskFlags.push("Hard negatives limit how early or original the piece can be claimed to be");
  }

  let condition: FS3Result["condition_lane"] = "low_risk";
  if (riskFlags.length >= 2) condition = "moderate_risk";
  if (riskFlags.length >= 4) condition = "high_risk";

  return {
    condition_lane: condition,
    labor_lane: labor,
    risk_flags: riskFlags,
  };
}

function valuationBand(
  form: string,
  dateRange: string,
  risk: FS3Result,
  precision: PrecisionLevel
) {
  let low = 25;
  let high = 300;

  if (form.includes("Gateleg") || form.includes("Drop-leaf")) {
    low = 35;
    high = 300;
  } else if (form.includes("Extension table")) {
    low = 50;
    high = 350;
  } else if (form.includes("Blanket chest")) {
    low = 50;
    high = 400;
  } else if (form.includes("Roll-top desk") || form.includes("Slant-front desk") || form.includes("Desk")) {
    low = 75;
    high = 500;
  } else if (form.includes("Cabinet") || form.includes("Chest of drawers")) {
    low = 50;
    high = 450;
  } else if (form.includes("Bookcase")) {
    low = 40;
    high = 350;
  }

  if (dateRange.toLowerCase().includes("post-1935")) {
    low = Math.round(low * 0.7);
    high = Math.round(high * 0.8);
  }

  if (risk.condition_lane === "moderate_risk") {
    low = Math.round(low * 0.88);
    high = Math.round(high * 0.88);
  }

  if (risk.condition_lane === "high_risk") {
    low = Math.round(low * 0.72);
    high = Math.round(high * 0.72);
  }

  if (precision === "medium") {
    low = Math.round(low * 1.02);
    high = Math.round(high * 0.9);
  }

  if (precision === "high") {
    low = Math.round(low * 1.08);
    high = Math.round(high * 0.82);
  }

  return { low, high };
}

function buildFs4(fs2: FS2Result, fs3: FS3Result, fs1: FS1Result): FS4Result {
  const band = valuationBand(
    fs2.primary_identification,
    fs2.date_range,
    fs3,
    fs1.precision_level
  );

  return {
    valuation_low: band.low,
    valuation_high: band.high,
    valuation_display: `$${band.low} – $${band.high}`,
    value_reasoning:
      fs1.precision_level === "low"
        ? "This is a broad field-scan range based on visible form, broad date lane, and risk level."
        : fs1.precision_level === "medium"
        ? "This is a field-scan range narrowed by visible construction support, broad date lane, and risk level."
        : "This is a tighter field-scan range based on multiple supporting construction clues and overall risk level.",
  };
}

function profileFitScore(profile?: FieldScanProfile) {
  if (!profile) return 50;

  let score = 50;

  if (profile.restoration_skill === "advanced") score += 10;
  else if (profile.restoration_skill === "intermediate") score += 6;
  else if (profile.restoration_skill === "basic") score += 2;
  else if (profile.restoration_skill === "none") score -= 8;

  if (profile.work_tolerance === "heavy") score += 10;
  else if (profile.work_tolerance === "moderate") score += 5;
  else if (profile.work_tolerance === "light") score -= 2;
  else if (profile.work_tolerance === "none") score -= 10;

  if (profile.storage_space === "very_limited") score -= 10;
  else if (profile.storage_space === "large") score += 4;

  if (profile.buying_purpose === "resale") score += 3;
  if (profile.sales_priority === "profit") score += 4;
  if (profile.sales_priority === "fast") score -= 2;

  return clamp(score, 10, 90);
}

function recommendationFromScore(score: number): RecommendationLevel {
  if (score >= 82) return "BUY_NOW";
  if (score >= 66) return "BUY";
  if (score >= 45) return "CONSIDER_IF_NEGOTIABLE";
  return "PASS";
}

function recommendationLabel(rec: RecommendationLevel) {
  if (rec === "BUY_NOW") return "Buy Now";
  if (rec === "BUY") return "Buy";
  if (rec === "CONSIDER_IF_NEGOTIABLE") return "Consider If Negotiable";
  return "Pass";
}

function buildFs5(intake: FieldScanIntake, fs1: FS1Result, fs3: FS3Result, fs4: FS4Result): FS5Result {
  const asking = asNumber(intake.asking_price);
  const midpoint = Math.round((fs4.valuation_low + fs4.valuation_high) / 2);
  const margin = asking != null ? midpoint - asking : null;

  let score = 50;

  if (margin != null) {
    if (margin >= 175) score += 22;
    else if (margin >= 90) score += 14;
    else if (margin >= 35) score += 8;
    else if (margin < 0) score -= 22;
  }

  if (fs3.labor_lane === "medium") score -= 8;
  if (fs3.labor_lane === "high") score -= 18;

  if (fs3.condition_lane === "moderate_risk") score -= 8;
  if (fs3.condition_lane === "high_risk") score -= 15;

  score += Math.round((profileFitScore(intake.picker_profile) - 50) * 0.5);

  if (fs1.precision_level === "low") score -= 10;
  if (!fs1.structural_evidence_present) score -= 10;
  if (fs1.precision_level === "high") score += 6;

  let rec = recommendationFromScore(score);

  if (fs1.precision_level === "low" && rec === "BUY_NOW") rec = "BUY";
  if (fs1.precision_level === "low" && rec === "BUY") rec = "CONSIDER_IF_NEGOTIABLE";

  const reasoning =
    rec === "BUY_NOW"
      ? "The visible evidence, estimated value lane, and profile fit all support a strong field-scan buy."
      : rec === "BUY"
      ? "The piece appears promising, with enough visible evidence to support a positive field-scan decision."
      : rec === "CONSIDER_IF_NEGOTIABLE"
      ? "There may be upside, but uncertainty or labor risk suggests a conservative purchase price."
      : "The visible risk, weak margin, or low-confidence construction evidence make this a pass for field-scan purposes.";

  return {
    recommendation: rec,
    recommendation_display: recommendationLabel(rec),
    margin_estimate: margin,
    fit_score: clamp(score, 0, 100),
    recommendation_reasoning: reasoning,
  };
}

function buildFs6(
  fs1: FS1Result,
  fs2: FS2Result,
  fs3: FS3Result,
  fs4: FS4Result,
  fs5: FS5Result
): FS6Result {
  const supported: string[] = [];
  const limitations: string[] = [];

  supported.push(`This appears to be a ${fs2.primary_identification}.`);
  supported.push(fs2.style_context);
  supported.push(`A broad working date range is ${fs2.date_range}.`);
  supported.push(`Comparable examples typically sell between ${fs4.valuation_display}.`);

  if (fs2.alternate_identification) {
    limitations.push(`An alternate possibility is ${fs2.alternate_identification}.`);
  }

  limitations.push(fs2.date_reasoning);

  if (!fs1.structural_evidence_present) {
    limitations.push(
      "This result is driven more by visible form and style than by supporting construction evidence, so precision remains broad."
    );
  }

  limitations.push(...fs3.risk_flags.slice(0, 3));

  const nextSteps =
    fs1.next_best_evidence.length > 0
      ? fs1.next_best_evidence
      : ["Use Full Analysis for a tighter identification and value range."];

  const headline = `${fs2.primary_identification} · ${fs2.date_range} · ${fs5.recommendation_display}`;

  const finalReport = [
    `This appears to be a ${fs2.primary_identification}.`,
    fs2.style_context,
    `A broad working date range is ${fs2.date_range}.`,
    `Comparable examples typically sell between ${fs4.valuation_display}, depending on age, condition, originality, and local demand.`,
    `Recommendation: ${fs5.recommendation_display}. ${fs5.recommendation_reasoning}`,
    nextSteps.length
      ? `For a more precise result, capture: ${nextSteps.join("; ")}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    headline,
    supported_summary: supported,
    limitations_summary: limitations,
    next_steps: nextSteps,
    final_report: finalReport,
  };
}

export const FieldScan = {
  async callClaude(system: string, content: any[]): Promise<ClaudeResult> {
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1400,
          system,
          messages: [{ role: "user", content }],
        }),
      });

      const data = await res.json();

      if (!res.ok) return { ok: false, error: data };

      const raw = Array.isArray(data?.content)
        ? data.content.map((b: any) => b?.text || "").join("\n")
        : "";

      if (!raw.trim()) return { ok: false, error: "empty_response" };

      const parsed = parseModelJson(raw);
      if (!parsed) return { ok: false, error: "no_valid_json" };

      return { ok: true, parsed, raw };
    } catch (e: any) {
      return { ok: false, error: e?.message || "unknown_error" };
    }
  },

  imgs(images: any[]) {
    const out: any[] = [];

    for (const img of images) {
      if (!img?.data_url) continue;

      const [head, base] = String(img.data_url).split(",");
      const mediaType = head?.match(/data:(.*?);/)?.[1] || "image/jpeg";

      out.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base },
      });

      out.push({
        type: "text",
        text: `[Image type: ${img.image_type || "unknown"}]`,
      });
    }

    return out;
  },

  async fs0(caseData: any, images: any[], intake: FieldScanIntake, onPhase?: any): Promise<FS0Result> {
    const system = `
You are a furniture field-scan evidence extractor.

Rules:
- Report only directly visible evidence.
- Do not overclaim age, maker, or originality.
- Prefer broad but accurate visible observations.
- Use clue keys only when they are clearly supported.
- Return JSON only.

Return structure:
{
  "observations": [
    {
      "type": "construction | joinery | toolmarks | fasteners | materials | hardware | finish | form | context",
      "clue": "optional_known_clue_key",
      "description": "plain visible evidence statement",
      "confidence": 0-100,
      "source_image": "overall_front | overall_side | underside | back | hardware_closeup | joinery_closeup | unknown",
      "hard_negative": false
    }
  ]
}
`;

    const result = await this.callClaude(system, [
      ...this.imgs(images),
      { type: "text", text: `Field Scan intake context: ${buildIntakeSummary(intake)}` },
    ]);

    let observations: Observation[] = [];

    if (result.ok) {
      observations = normalizeObservationsFromParsed(result.parsed);
    }

    observations = applyIntakeHints(intake, observations);
    observations = promoteEvidenceFeatures(observations);
    const digest = buildEvidenceDigest(observations);

    for (const obs of observations) {
      API.addObservation(caseData.id, {
        observation_type: obs.type,
        clue: obs.clue || null,
        reference_id: obs.clue || null,
        observed_value_text: obs.description,
        source_image: obs.source_image || null,
        raw_confidence: Number((obs.confidence / 100).toFixed(3)),
        effective_confidence: Number((obs.confidence / 100).toFixed(3)),
        hard_negative: Boolean(obs.hard_negative),
        low_confidence_flag: Boolean(obs.low_confidence_flag),
      });
    }

    const res: FS0Result = {
      ok: true,
      observations,
      evidence_digest: digest,
      note: result.ok
        ? "Field Scan evidence extracted from a single image pass."
        : "Field Scan proceeded with limited evidence because extraction failed.",
      raw_error: result.ok ? null : result.error,
    };

    onPhase?.("fs0", res);
    return res;
  },

  async run(caseData: any, images: any[], intake: FieldScanIntake, onPhase?: any) {
    const stage_outputs: Record<string, any> = {};

    const fs0 = await this.fs0(caseData, images, intake, onPhase);
    stage_outputs.fs0 = fs0;

    const fs1 = buildFs1(fs0.evidence_digest, images);
    stage_outputs.fs1 = fs1;
    onPhase?.("fs1", fs1);

    const fs2 = buildFs2(fs0.evidence_digest, intake, fs1);
    stage_outputs.fs2 = fs2;
    onPhase?.("fs2", fs2);

    const fs3 = buildFs3(fs0.evidence_digest, intake);
    stage_outputs.fs3 = fs3;
    onPhase?.("fs3", fs3);

    const fs4 = buildFs4(fs2, fs3, fs1);
    stage_outputs.fs4 = fs4;
    onPhase?.("fs4", fs4);

    const fs5 = buildFs5(intake, fs1, fs3, fs4);
    stage_outputs.fs5 = fs5;
    onPhase?.("fs5", fs5);

    const fs6 = buildFs6(fs1, fs2, fs3, fs4, fs5);
    stage_outputs.fs6 = fs6;
    onPhase?.("fs6", fs6);

    return {
      mode: "field_scan",
      stage_outputs,
      final_report: fs6.final_report,
    };
  },
};
