import { API } from "./store";

export type RuntimeMode = "mock" | "live";
export type EngineMode = "LIVE" | "SIMULATED_FALLBACK";

export let EVIDENCE_ADAPTER_MODE: RuntimeMode = "live";
export let FULL_ANALYSIS_MODE: RuntimeMode = "live";

export interface RuntimeProbe {
  engine_mode: EngineMode;
  runtime_mode: RuntimeMode;
  full_analysis_mode: RuntimeMode;
  evidence_adapter_mode: RuntimeMode;
  live_llm_enabled: boolean;
  live_field_scan: boolean;
  backend_endpoint: string;
  simulation_reason: string;
}

export function getRuntimeProbe(): RuntimeProbe {
  const fullMock = FULL_ANALYSIS_MODE === "mock";
  const fieldMock = EVIDENCE_ADAPTER_MODE === "mock";

  return {
    engine_mode: fullMock || fieldMock ? "SIMULATED_FALLBACK" : "LIVE",
    runtime_mode: fullMock || fieldMock ? "mock" : "live",
    full_analysis_mode: FULL_ANALYSIS_MODE,
    evidence_adapter_mode: EVIDENCE_ADAPTER_MODE,
    live_llm_enabled: !fullMock,
    live_field_scan: !fieldMock,
    backend_endpoint: "/api/analyze",
    simulation_reason:
      fullMock || fieldMock
        ? `FULL_ANALYSIS_MODE=${FULL_ANALYSIS_MODE}; EVIDENCE_ADAPTER_MODE=${EVIDENCE_ADAPTER_MODE}`
        : "Live mode. Client calls /api/analyze",
  };
}

export const RUNTIME_MODE: RuntimeMode = getRuntimeProbe().runtime_mode;

type GenericRecord = Record<string, any>;

type Observation = {
  type: string;
  clue?: string | null;
  description: string;
  confidence: number;
  source_image?: string | null;
  hard_negative?: boolean;
  low_confidence_flag?: boolean;
};

type WeightedClue = {
  clue: string;
  display_label: string;
  category: string;
  base_weight: number;
  adjusted_weight: number;
  confidence_reason: string;
  hard_negative: boolean;
  effective_confidence: number;
  source_images: string[];
};

type EvidenceDigest = {
  observations: Observation[];
  observation_count: number;
  by_type: Record<string, Observation[]>;
  clue_keys: string[];
  likely_forms: string[];
  hard_negatives: string[];
  strongest_observations: Observation[];
};

type MissingEvidenceMap = {
  underside_photo: boolean;
  back_photo: boolean;
  joinery_photo: boolean;
  hardware_photo: boolean;
  label_photo: boolean;
};

type Phase1Gate = {
  confidence_cap: "High" | "Moderate" | "Low" | "Inconclusive";
  confidence_cap_pct: number;
  missing_evidence: MissingEvidenceMap;
  evidence_sufficiency_summary: string;
  can_run: {
    dating: boolean;
    form: boolean;
    weighting: boolean;
    conflict_check: boolean;
    valuation_ready: boolean;
  };
  next_best_evidence: string[];
};

type Phase2Dating = {
  range: string;
  confidence: "High" | "Moderate" | "Low" | "Inconclusive";
  support: string[];
  limitations: string[];
};

type Phase3Form = {
  form: string;
  display_form: string;
  style_context: string | null;
  confidence: "High" | "Moderate" | "Low" | "Inconclusive";
  support: string[];
  alternatives: string[];
};

type Phase4Weighting = {
  weighted_clues: WeightedClue[];
  confidence_drivers: {
    increased: string[];
    limited: string[];
  };
  category_scores: Array<{ category: string; score: number; count: number }>;
};

type Phase5Conflict = {
  conflict_notes: string[];
  confidence_adjustment: number;
  restoration_interpretation: string | null;
};

type Phase6Synthesis = {
  supported_findings: string[];
  tentative_findings: string[];
  more_evidence_needed: string[];
  summary: string;
};

type ClaudeResult =
  | { ok: true; parsed: any; raw: string }
  | { ok: false; error: any };

const CLUE_LIBRARY: Record<
  string,
  {
    category: string;
    baseWeight: number;
    hardNegative?: boolean;
    replacementRisk?: number;
    dateHint?: string;
    explanation: string;
  }
> = {
  drop_leaf_hinged: {
    category: "construction",
    baseWeight: 0.9,
    dateHint: "1720–1930",
    explanation: "Defining structural form signature.",
  },
  gateleg_support: {
    category: "construction",
    baseWeight: 0.92,
    dateHint: "1680–1800; revival 1880–1930",
    explanation: "Strong structural evidence for gate-leg/drop-leaf table forms.",
  },
    rule_joint: {
    category: "joinery",
    baseWeight: 0.78,
    dateHint: "1700–1930",
    explanation: "Useful joinery evidence for drop-leaf construction, but not by itself a decisive early-date indicator.",
  },
  swing_leg: {
    category: "construction",
    baseWeight: 0.82,
    dateHint: "1780–1900",
    explanation: "Structural leaf-support mechanism.",
  },
  lift_lid: {
    category: "construction",
    baseWeight: 0.88,
    dateHint: "1700–1900",
    explanation: "Defining chest form feature.",
  },
  multiple_drawer_case: {
    category: "construction",
    baseWeight: 0.8,
    dateHint: "1700–present",
    explanation: "Case-form indicator; needs corroboration for precise form.",
  },
  drawer_present: {
    category: "construction",
    baseWeight: 0.74,
    explanation: "Supports case-piece or desk interpretations.",
  },
  door_present: {
    category: "construction",
    baseWeight: 0.72,
    explanation: "Supports cabinet, safe, or wardrobe interpretations.",
  },
  slant_front: {
    category: "construction",
    baseWeight: 0.88,
    dateHint: "1700–1860",
    explanation: "Strong defining desk-form feature.",
  },
  cylinder_roll: {
    category: "construction",
    baseWeight: 0.9,
    dateHint: "1870–1920",
    explanation: "Strong defining roll-top desk feature.",
  },
  tilt_top: {
    category: "construction",
    baseWeight: 0.88,
    explanation: "Distinctive table mechanism.",
  },
  extension_mechanism: {
    category: "construction",
    baseWeight: 0.85,
    explanation: "Distinctive table mechanism.",
  },

  hand_cut_dovetails: {
    category: "joinery",
    baseWeight: 0.88,
    dateHint: "pre-1860",
    explanation: "Strong pre-industrial joinery evidence.",
  },
  machine_dovetails: {
    category: "joinery",
    baseWeight: 0.82,
    dateHint: "post-1860",
    explanation: "Factory-era joinery indicator.",
  },
  mortise_and_tenon: {
    category: "joinery",
    baseWeight: 0.72,
    dateHint: "1620–1920",
    explanation: "Traditional joinery that spans many periods.",
  },
  dowel_joinery: {
    category: "joinery",
    baseWeight: 0.7,
    dateHint: "post-1900",
    explanation: "Later machine-oriented joinery clue.",
  },
  plywood_drawer_bottom: {
    category: "materials",
    baseWeight: 0.88,
    hardNegative: true,
    dateHint: "post-1920",
    explanation: "Hard negative for earlier antique claims.",
  },

  pit_saw_marks: {
    category: "toolmarks",
    baseWeight: 0.85,
    dateHint: "pre-1830",
    explanation: "Pre-industrial milling evidence.",
  },
  circular_saw_arcs: {
    category: "toolmarks",
    baseWeight: 0.78,
    dateHint: "post-1830",
    explanation: "Post-1830 milling evidence.",
  },
  band_saw_lines: {
    category: "toolmarks",
    baseWeight: 0.75,
    dateHint: "post-1870",
    explanation: "Post-1870 factory sawing evidence.",
  },
  hand_plane_chatter: {
    category: "toolmarks",
    baseWeight: 0.7,
    dateHint: "pre-1880",
    explanation: "Hand-prepared surface evidence.",
  },

  poplar_secondary: {
    category: "materials",
    baseWeight: 0.68,
    dateHint: "1820–1920",
    explanation: "Useful secondary-wood context clue.",
  },
  thick_veneer: {
    category: "materials",
    baseWeight: 0.62,
    dateHint: "pre-1910",
    explanation: "Earlier veneer technique clue.",
  },
  plywood_structural: {
    category: "materials",
    baseWeight: 0.9,
    hardNegative: true,
    dateHint: "post-1920",
    explanation: "Hard negative for earlier antique claims.",
  },

  porcelain_caster: {
    category: "hardware",
    baseWeight: 0.68,
    replacementRisk: 0.35,
    dateHint: "1830–1900",
    explanation: "Useful period hardware, but somewhat replaceable.",
  },
  victorian_strap_hinge: {
    category: "hardware",
    baseWeight: 0.62,
    replacementRisk: 0.4,
    dateHint: "1865–1895",
    explanation: "Period hardware with moderate replacement risk.",
  },
  batwing_brass_pull: {
    category: "hardware",
    baseWeight: 0.65,
    replacementRisk: 0.5,
    dateHint: "1720–1790",
    explanation: "Period pull, but commonly replaced.",
  },
  eastlake_pull: {
    category: "hardware",
    baseWeight: 0.6,
    replacementRisk: 0.45,
    dateHint: "1870–1890",
    explanation: "Period hardware, but commonly replaced.",
  },
  modern_concealed_hinge: {
    category: "hardware",
    baseWeight: 0.92,
    hardNegative: true,
    dateHint: "post-1950",
    explanation: "Hard negative for early antique manufacture claims.",
  },

  hand_forged_nail: {
    category: "fasteners",
    baseWeight: 0.88,
    dateHint: "pre-1800",
    explanation: "Strong pre-industrial fastener evidence.",
  },
  cut_nail: {
    category: "fasteners",
    baseWeight: 0.82,
    dateHint: "1790–1890",
    explanation: "Strong 19th-century fastener evidence.",
  },
  wire_nail: {
    category: "fasteners",
    baseWeight: 0.72,
    replacementRisk: 0.15,
    dateHint: "post-1880",
    explanation: "Later fastener evidence; possible repair contamination.",
  },
  slotted_handmade_screw: {
    category: "fasteners",
    baseWeight: 0.82,
    dateHint: "pre-1840",
    explanation: "Strong early screw evidence.",
  },
  slotted_machine_screw: {
    category: "fasteners",
    baseWeight: 0.62,
    replacementRisk: 0.45,
    dateHint: "1840–1935",
    explanation: "Moderate fastener clue with replacement risk.",
  },
  phillips_screw: {
    category: "fasteners",
    baseWeight: 0.9,
    hardNegative: true,
    dateHint: "post-1934",
    explanation: "Hard negative for pre-1930 manufacture claims.",
  },
  staple_fastener: {
    category: "fasteners",
    baseWeight: 0.9,
    hardNegative: true,
    dateHint: "post-1945",
    explanation: "Hard negative for antique structural manufacture claims.",
  },

  shellac_crazing: {
    category: "finish",
    baseWeight: 0.55,
    replacementRisk: 0.2,
    dateHint: "1800–1920",
    explanation: "Helpful finish clue, but less authoritative than structure.",
  },
  polyurethane: {
    category: "finish",
    baseWeight: 0.65,
    replacementRisk: 0.15,
    dateHint: "post-1960",
    explanation: "Later finish clue; may indicate modern manufacture or refinish.",
  },
};

const DATE_PRIORITY_ORDER = [
  "pre-1800",
  "1790–1890",
  "post-1830",
  "pre-1830",
  "pre-1860",
  "post-1860",
  "post-1870",
  "1830–1900",
  "1865–1895",
  "1870–1890",
  "1820–1920",
  "pre-1910",
  "post-1880",
  "1840–1935",
  "1700–1860",
  "1720–1930",
  "1680–1800; revival 1880–1930",
  "1780–1900",
  "1700–1900",
  "1700–present",
  "post-1900",
  "post-1920",
  "post-1934",
  "post-1945",
  "post-1950",
  "post-1960",
  "1620–1920",
];

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
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === openChar) depth++;
    if (ch === closeChar) depth--;

    if (depth === 0) {
      return cleaned.slice(start, i + 1);
    }
  }

  return null;
}

function parseModelJson(raw: string): any | null {
  const cleaned = cleanJsonText(raw);

  const full = tryJsonParse(cleaned);
  if (full) return full;

  const balanced = extractBalancedJson(cleaned);
  if (!balanced) return null;

  return tryJsonParse(balanced);
}

function collectTextSnippets(value: any, out: string[] = []): string[] {
  if (value == null) return out;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) out.push(trimmed);
    return out;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectTextSnippets(item, out);
    return out;
  }

  if (typeof value === "object") {
    for (const v of Object.values(value)) collectTextSnippets(v, out);
  }

  return out;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function toConfidenceBand(pct: number): "High" | "Moderate" | "Low" | "Inconclusive" {
  if (pct >= 85) return "High";
  if (pct >= 65) return "Moderate";
  if (pct >= 40) return "Low";
  return "Inconclusive";
}

function titleCase(text: string): string {
  return String(text || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function asString(v: any): string {
  return typeof v === "string" ? v.trim() : "";
}

function asNumber(v: any, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function normalizeClueKey(v: any): string | null {
  const key = asString(v).toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_");
  return key || null;
}

function descriptionFromObservation(o: any): string {
  return (
    asString(o?.description) ||
    asString(o?.observed_value_text) ||
    asString(o?.text) ||
    asString(o?.value) ||
    "Unknown observation"
  );
}

function detectClueFromText(text: string): string | null {
  const t = text.toLowerCase();

    if (t.includes("drop leaf") || t.includes("drop-leaf")) return "drop_leaf_hinged";

  const mentionsGateLeg = t.includes("gate leg") || t.includes("gate-leg");
  const mentionsSwingLeg = t.includes("swing leg") || t.includes("swing-leg");

  const rejectsGateLeg =
    t.includes("no gate leg") ||
    t.includes("no gate-leg") ||
    t.includes("no swing leg") ||
    t.includes("no swing-leg") ||
    t.includes("no gate leg mechanism") ||
    t.includes("no gate-leg mechanism") ||
    t.includes("no swing leg mechanism") ||
    t.includes("no swing-leg mechanism") ||
    t.includes("not clearly visible") ||
    t.includes("not visible") ||
    t.includes("not confirmed") ||
    t.includes("if any") ||
    t.includes("though the support mechanism") ||
    t.includes("without a swing-out leg support");

  if ((mentionsGateLeg || mentionsSwingLeg) && !rejectsGateLeg) {
    return "gateleg_support";
  }

  if (t.includes("rule joint") || t.includes("rule-joint")) return "rule_joint";
  if (mentionsSwingLeg && !rejectsGateLeg) return "swing_leg";
  if (t.includes("lift lid") || t.includes("hinged lid")) return "lift_lid";
  if (t.includes("slant front") || t.includes("fall front")) return "slant_front";
  if (t.includes("roll top") || t.includes("tambour") || t.includes("cylinder roll")) return "cylinder_roll";
  if (t.includes("tilt top")) return "tilt_top";
  if (t.includes("extension mechanism")) return "extension_mechanism";
  if (t.includes("drawer")) return "drawer_present";
  if (t.includes("door")) return "door_present";

  if (t.includes("hand cut dovetail") || t.includes("hand-cut dovetail")) return "hand_cut_dovetails";
  if (t.includes("machine dovetail")) return "machine_dovetails";
  if (t.includes("mortise") && t.includes("tenon")) return "mortise_and_tenon";
  if (t.includes("dowel")) return "dowel_joinery";
  if (t.includes("plywood drawer bottom")) return "plywood_drawer_bottom";

    const mentionsPitSaw = t.includes("pit saw");
  const mentionsCircularSaw = t.includes("circular saw");
  const mentionsBandSaw = t.includes("band saw");

  const rejectsPitSaw =
    t.includes("rather than pit saw") ||
    t.includes("not pit saw") ||
    t.includes("instead of pit saw") ||
    t.includes("more consistent with circular") ||
    t.includes("more consistent with band saw") ||
    t.includes("consistent with circular or band saw");

  if (mentionsCircularSaw && !mentionsBandSaw) return "circular_saw_arcs";
  if (mentionsBandSaw && !mentionsCircularSaw) return "band_saw_lines";
  if (mentionsCircularSaw && mentionsBandSaw) return "band_saw_lines";
  if (mentionsPitSaw && !rejectsPitSaw) return "pit_saw_marks";

  if (t.includes("hand plane") || t.includes("plane chatter")) return "hand_plane_chatter";

  if (t.includes("poplar")) return "poplar_secondary";
  if (t.includes("thick veneer")) return "thick_veneer";
  if (t.includes("structural plywood")) return "plywood_structural";

  if (t.includes("porcelain caster")) return "porcelain_caster";
  if (t.includes("strap hinge")) return "victorian_strap_hinge";
  if (t.includes("batwing")) return "batwing_brass_pull";
  if (t.includes("eastlake")) return "eastlake_pull";
  if (t.includes("concealed hinge")) return "modern_concealed_hinge";

  if (t.includes("hand forged nail") || t.includes("hand-forged nail")) return "hand_forged_nail";
  if (t.includes("cut nail")) return "cut_nail";
  if (t.includes("wire nail")) return "wire_nail";
  if (t.includes("handmade slotted screw") || t.includes("hand-cut screw")) return "slotted_handmade_screw";
  if (t.includes("machine screw")) return "slotted_machine_screw";
  if (t.includes("phillips")) return "phillips_screw";
  if (t.includes("staple")) return "staple_fastener";

  if (t.includes("shellac")) return "shellac_crazing";
  if (t.includes("polyurethane")) return "polyurethane";

  return null;
}

function normalizeObservationsFromParsed(parsed: any): Observation[] {
  if (!parsed || typeof parsed !== "object") return [];

  const direct = Array.isArray(parsed.observations) ? parsed.observations : [];
  const normalized: Observation[] = [];

  const push = (raw: any) => {
    const description = descriptionFromObservation(raw);
        let clue =
      normalizeClueKey(raw?.clue) ||
      normalizeClueKey(raw?.reference_id) ||
      detectClueFromText(description);

    const desc = description.toLowerCase();
    if (
      clue === "pit_saw_marks" &&
      (
        desc.includes("rather than pit saw") ||
        desc.includes("not pit saw") ||
        desc.includes("instead of pit saw") ||
        desc.includes("more consistent with circular") ||
        desc.includes("more consistent with band saw") ||
        desc.includes("consistent with circular or band saw")
      )
    ) {
      if (desc.includes("band saw")) clue = "band_saw_lines";
      else if (desc.includes("circular saw")) clue = "circular_saw_arcs";
      else clue = null;
    }
    if (
      clue === "polyurethane" &&
      (
        desc.includes("no obvious") ||
        desc.includes("inconclusive") ||
        desc.includes("cannot confirm") ||
        desc.includes("not clearly visible")
      )
    ) {
      clue = null;
    }
        if (
      clue === "gateleg_support" &&
      (
        desc.includes("no gate leg") ||
        desc.includes("no gate-leg") ||
        desc.includes("no swing leg") ||
        desc.includes("no swing-leg") ||
        desc.includes("no gate leg mechanism") ||
        desc.includes("no gate-leg mechanism") ||
        desc.includes("no swing leg mechanism") ||
        desc.includes("no swing-leg mechanism") ||
        desc.includes("not clearly visible") ||
        desc.includes("not visible") ||
        desc.includes("not confirmed") ||
        desc.includes("if any") ||
        desc.includes("though the support mechanism") ||
        desc.includes("without a swing-out leg support")
      )
    ) {
      clue = null;
    }
    const meta = clue ? CLUE_LIBRARY[clue] : null;

    normalized.push({
      type: asString(raw?.type) || asString(raw?.observation_type) || meta?.category || "unknown",
      clue,
      description,
      confidence: clamp(
        asNumber(raw?.confidence, NaN) ||
          Math.round(asNumber(raw?.raw_confidence, 0.4) * 100) ||
          45,
        5,
        99
      ),
      source_image:
        asString(raw?.source_image) ||
        asString(raw?.source_image_id) ||
        asString(raw?.region_label) ||
        null,
      hard_negative: Boolean(raw?.hard_negative || meta?.hardNegative),
      low_confidence_flag: asNumber(raw?.confidence, 50) < 45,
    });
  };

  if (direct.length) {
    direct.forEach(push);
    return dedupeObservations(normalized);
  }

  const clues = Array.isArray(parsed.clues) ? parsed.clues : [];
  clues.forEach(push);

  if (normalized.length) {
    return dedupeObservations(normalized);
  }

  const snippets = collectTextSnippets(parsed);
  const textDump = snippets.join(" | ");

  if (!textDump.trim()) return [];

  const recovered: Observation[] = [];
  const possiblePieces = textDump
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const piece of possiblePieces) {
    const clue = detectClueFromText(piece);
    if (!clue && piece.length < 8) continue;
    const meta = clue ? CLUE_LIBRARY[clue] : null;

    recovered.push({
      type: meta?.category || "context",
      clue,
      description: piece,
      confidence: clue ? 60 : 40,
      source_image: null,
      hard_negative: Boolean(meta?.hardNegative),
      low_confidence_flag: !clue,
    });
  }

  return dedupeObservations(recovered);
}

function dedupeObservations(observations: Observation[]): Observation[] {
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

function computeMissingEvidence(images: GenericRecord[]): MissingEvidenceMap {
  const types = new Set(images.map((img) => String(img?.image_type || "")));

  return {
    underside_photo: !types.has("underside"),
    back_photo: !types.has("back"),
    joinery_photo: !types.has("joinery_closeup"),
    hardware_photo: !types.has("hardware_closeup"),
    label_photo: !types.has("label_makers_mark"),
  };
}

function buildEvidenceDigest(observations: Observation[]): EvidenceDigest {
  const byType: Record<string, Observation[]> = {};

  for (const obs of observations) {
    if (!byType[obs.type]) byType[obs.type] = [];
    byType[obs.type].push(obs);
  }

  const clueKeys = uniq(
    observations
      .map((o) => normalizeClueKey(o.clue))
      .filter(Boolean) as string[]
  );

  const likelyForms = uniq(
    observations
      .filter((o) => o.type === "form" || o.type === "construction")
      .map((o) => o.description)
      .filter(Boolean)
  );

  const hardNegatives = uniq(
    observations
      .filter((o) => o.hard_negative)
      .map((o) => o.clue || o.description)
      .filter(Boolean)
  );

  const strongest = [...observations]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);

  return {
    observations,
    observation_count: observations.length,
    by_type: byType,
    clue_keys: clueKeys,
    likely_forms: likelyForms,
    hard_negatives: hardNegatives,
    strongest_observations: strongest,
  };
}

function buildIntakeSummary(intake: GenericRecord): string {
  if (!intake || typeof intake !== "object") return "No intake details provided.";

  const parts: string[] = [];

  const push = (label: string, value: any) => {
    const text =
      typeof value === "string"
        ? value.trim()
        : typeof value === "number"
        ? String(value)
        : typeof value === "boolean"
        ? value
          ? "yes"
          : "no"
        : "";
    if (text) parts.push(`${label}: ${text}`);
  };

  push("User category guess", intake.user_category_guess);
  push("Wood species guess", intake.primary_wood_guess);
  push("Where acquired", intake.where_acquired);
  push("Known provenance", intake.known_provenance);
  push("Known alterations", intake.known_alterations);
  push("Condition notes", intake.condition_notes);
  push("Height", intake.approximate_height);
  push("Width", intake.approximate_width);
  push("User notes", intake.notes);

  const functionalKeys = [
    "has_drawers",
    "has_doors",
    "folds_or_expands",
    "has_mechanical_parts",
    "suggests_prior_function",
  ];

  for (const key of functionalKeys) {
    if (typeof intake[key] === "boolean") {
      parts.push(`${key}: ${intake[key] ? "yes" : "no"}`);
    }
  }

  return parts.length ? parts.join(" | ") : "No intake details provided.";
}

function applyIntakeFunctionalClues(intake: GenericRecord, observations: Observation[]): Observation[] {
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

  if (intake?.has_drawers === true) {
    add("construction", "drawer_present", "User indicates drawers are present", 58);
  }

  if (intake?.has_doors === true) {
    add("construction", "door_present", "User indicates doors are present", 58);
  }

  if (intake?.folds_or_expands === true) {
    add("construction", null, "User indicates the piece folds or expands", 55);
  }

  if (intake?.has_mechanical_parts === true) {
    add("construction", null, "User indicates pedals, cranks, or mechanical parts are present", 55);
  }

  if (intake?.suggests_prior_function === true) {
    add("context", null, "User indicates the piece may have served an earlier function", 55);
  }

  return dedupeObservations(next);
}

function computeClueWeights(observations: Observation[]): WeightedClue[] {
  const grouped = new Map<string, Observation[]>();

  for (const obs of observations) {
    const key = obs.clue || obs.description.toLowerCase();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(obs);
  }

  const weighted: WeightedClue[] = [];

  for (const [key, group] of grouped.entries()) {
    const clue = group[0].clue || key;
    const meta = CLUE_LIBRARY[clue];

    const category = meta?.category || group[0].type || "other";
    const baseWeight = meta?.baseWeight ?? fallbackBaseWeightForCategory(category);
    const replacementRisk = meta?.replacementRisk ?? 0.2;
    const hasHardNegative = Boolean(meta?.hardNegative || group.some((g) => g.hard_negative));

    const avgConfidence =
      group.reduce((sum, g) => sum + clamp(g.confidence / 100, 0.05, 0.99), 0) / group.length;

    let adjusted = baseWeight;

    if (avgConfidence >= 0.8) adjusted += 0.08;
    else if (avgConfidence >= 0.6) adjusted += 0.03;
    else if (avgConfidence < 0.4) adjusted -= 0.1;

    const sourceImages = uniq(
      group.map((g) => g.source_image || "").filter(Boolean)
    );

    if (sourceImages.length >= 2) adjusted += 0.05;
    if (sourceImages.length >= 3) adjusted += 0.05;

    if (replacementRisk > 0.35) adjusted -= replacementRisk * 0.3;
    if (group.some((g) => g.low_confidence_flag)) adjusted -= 0.05;

    adjusted = clamp(adjusted, 0.05, 0.98);

    const reasonParts: string[] = [];
    reasonParts.push(meta?.explanation || "Weighted from evidence category.");
    if (avgConfidence >= 0.8) reasonParts.push("Clearly visible.");
    if (avgConfidence < 0.4) reasonParts.push("Visibility is limited.");
    if (sourceImages.length >= 2) reasonParts.push(`Confirmed across ${sourceImages.length} images.`);
    if (replacementRisk > 0.35) reasonParts.push("Moderate replacement risk lowers authority.");
    if (hasHardNegative) reasonParts.push("This clue acts as a hard negative.");

    weighted.push({
      clue,
      display_label: titleCase(clue),
      category,
      base_weight: Number(baseWeight.toFixed(3)),
      adjusted_weight: Number(adjusted.toFixed(3)),
      confidence_reason: reasonParts.join(" "),
      hard_negative: hasHardNegative,
      effective_confidence: Number(avgConfidence.toFixed(3)),
      source_images: sourceImages,
    });
  }

  weighted.sort((a, b) => {
    if (a.hard_negative && !b.hard_negative) return -1;
    if (!a.hard_negative && b.hard_negative) return 1;
    return b.adjusted_weight - a.adjusted_weight;
  });

  return weighted;
}

function fallbackBaseWeightForCategory(category: string): number {
  switch (category) {
    case "construction":
      return 0.82;
    case "joinery":
      return 0.78;
    case "toolmarks":
      return 0.74;
    case "fasteners":
      return 0.72;
    case "materials":
      return 0.6;
    case "hardware":
      return 0.56;
    case "finish":
      return 0.42;
    default:
      return 0.5;
  }
}

function deriveConfidenceDrivers(weightedClues: WeightedClue[]): {
  increased: string[];
  limited: string[];
} {
  const increased = weightedClues
    .filter((c) => !c.hard_negative && c.adjusted_weight >= 0.65)
    .slice(0, 5)
    .map((c) => c.display_label);

  const limited = [
    ...weightedClues
      .filter((c) => c.hard_negative)
      .slice(0, 5)
      .map((c) => `${c.display_label} — hard negative`),
    ...weightedClues
      .filter((c) => !c.hard_negative && c.adjusted_weight < 0.55)
      .slice(0, 3)
      .map((c) => `${c.display_label} — limited authority`),
  ];

  return {
    increased: uniq(increased),
    limited: uniq(limited).slice(0, 5),
  };
}

function deriveCategoryScores(weightedClues: WeightedClue[]): Array<{ category: string; score: number; count: number }> {
  const sums: Record<string, { sum: number; count: number }> = {};

  for (const clue of weightedClues) {
    if (!sums[clue.category]) sums[clue.category] = { sum: 0, count: 0 };
    sums[clue.category].sum += clue.adjusted_weight;
    sums[clue.category].count += 1;
  }

  const entries = Object.entries(sums).map(([category, v]) => ({
    category,
    avg: v.sum / v.count,
    count: v.count,
  }));

  const maxAvg = Math.max(0.01, ...entries.map((e) => e.avg));

  return entries
    .map((e) => ({
      category: e.category,
      score: Math.round((e.avg / maxAvg) * 100),
      count: e.count,
    }))
    .sort((a, b) => b.score - a.score);
}

function gateEvidence(digest: EvidenceDigest, missing: MissingEvidenceMap): Phase1Gate {
  const obsCount = digest.observation_count;
  const hardNegCount = digest.hard_negatives.length;

  let capPct = 88;
  const nextBest: string[] = [];

    const hasJoinery = (digest.by_type?.joinery || []).length > 0;
  const hasHardware = (digest.by_type?.hardware || []).length > 0;
  const hasConstruction = (digest.by_type?.construction || []).length > 0;
  const hasFasteners = (digest.by_type?.fasteners || []).length > 0;

  const structuralEvidenceCount =
    [hasJoinery, hasConstruction, hasFasteners].filter(Boolean).length;

  if (!hasFasteners && !hasConstruction) {
    nextBest.push("Underside photo for saw marks and fasteners");
  }
  if (!hasJoinery) {
    nextBest.push("Joinery close-up for drawer construction or framing");
  }
  if (!hasHardware) {
    nextBest.push("Hardware close-up to judge originality");
  }
  if (missing.back_photo) {
    nextBest.push("Back panel photo for milling and secondary wood");
  }
  if (missing.label_photo) {
    nextBest.push("Maker's mark or label if present");
  }

  if (structuralEvidenceCount === 0) capPct -= 25;
  else if (structuralEvidenceCount === 1) capPct -= 10;

  if (obsCount < 3) capPct -= 22;
  else if (obsCount < 6) capPct -= 10;

  if (hardNegCount > 0) capPct -= Math.min(12, hardNegCount * 4);

  capPct = clamp(capPct, 20, 92);

  const capBand = toConfidenceBand(capPct);

    let summary = "Evidence is sufficient for a cautious evidence-first assessment.";
  if (obsCount < 3) {
    summary = "Evidence is sparse. Conclusions should stay tentative until more visible evidence is provided.";
  } else if (structuralEvidenceCount >= 2) {
    summary = "Strong visible evidence supports a narrower reading, though hidden structure could refine it further.";
  } else if (hardNegCount > 0) {
    summary = "Assessment is possible, but hard negatives limit how early or original the piece can be claimed to be.";
  } else {
    summary = "Visible evidence allows a broad reading; additional structural detail could narrow it further.";
  }

  return {
    confidence_cap: capBand,
    confidence_cap_pct: capPct,
    missing_evidence: missing,
    evidence_sufficiency_summary: summary,
    can_run: {
      dating: obsCount >= 2,
      form: obsCount >= 2,
      weighting: obsCount >= 1,
      conflict_check: obsCount >= 3,
      valuation_ready: obsCount >= 6 && structuralEvidenceCount >= 2,
    },
    next_best_evidence: uniq(nextBest).slice(0, 5),
  };
}

function dateFromEvidence(digest: EvidenceDigest, gate: Phase1Gate): Phase2Dating {
  if (!gate.can_run.dating) {
    return {
      range: "Unknown",
      confidence: "Inconclusive",
      support: [],
      limitations: ["Not enough structural evidence to support a date range."],
    };
  }

  const clueSet = new Set(digest.clue_keys);
  const support = digest.strongest_observations.slice(0, 4).map((o) => o.description);
  const limitations: string[] = [];

  if (gate.missing_evidence.underside_photo) {
    limitations.push("No underside photo, so saw-mark and fastener dating evidence may be incomplete.");
  }
  if (gate.missing_evidence.joinery_photo) {
    limitations.push("No joinery close-up, so construction dating evidence is limited.");
  }
  if (digest.hard_negatives.length) {
    limitations.push(`Hard negatives present: ${digest.hard_negatives.map(titleCase).join(", ")}.`);
  }

  const hasVeryLate =
    clueSet.has("phillips_screw") ||
    clueSet.has("staple_fastener") ||
    clueSet.has("plywood_structural") ||
    clueSet.has("plywood_drawer_bottom") ||
    clueSet.has("modern_concealed_hinge");

  const hasLaterIndustrial =
    clueSet.has("wire_nail") ||
    clueSet.has("slotted_machine_screw") ||
    clueSet.has("machine_dovetails") ||
    clueSet.has("dowel_joinery");

  const hasVictorianEra =
    clueSet.has("porcelain_caster") ||
    clueSet.has("victorian_strap_hinge") ||
    clueSet.has("eastlake_pull");

  const hasMid19thStructural =
    clueSet.has("cut_nail") ||
    clueSet.has("circular_saw_arcs");

  const hasEarlyOnlySignals =
    clueSet.has("hand_forged_nail") ||
    clueSet.has("pit_saw_marks") ||
    clueSet.has("hand_cut_dovetails") ||
    clueSet.has("slotted_handmade_screw");

  const hasEarlierStyleJoinery =
    clueSet.has("rule_joint");

  if (hasVeryLate) {
    return {
      range: "post-1935",
      confidence: toConfidenceBand(Math.min(gate.confidence_cap_pct, 78)),
      support,
      limitations,
    };
  }

  if (hasVictorianEra && hasLaterIndustrial) {
    return {
      range: "1880–1920",
      confidence: toConfidenceBand(Math.min(gate.confidence_cap_pct, 78)),
      support,
      limitations,
    };
  }

  if (hasVictorianEra && hasMid19thStructural) {
    return {
      range: "1850–1900",
      confidence: toConfidenceBand(Math.min(gate.confidence_cap_pct, 76)),
      support,
      limitations,
    };
  }

  if (hasLaterIndustrial) {
    return {
      range: "1880–1920",
      confidence: toConfidenceBand(Math.min(gate.confidence_cap_pct, 72)),
      support,
      limitations,
    };
  }

  if (hasMid19thStructural && hasEarlierStyleJoinery) {
    return {
      range: "1830–1890",
      confidence: toConfidenceBand(Math.min(gate.confidence_cap_pct, 72)),
      support,
      limitations,
    };
  }

  if (hasMid19thStructural) {
    return {
      range: "1830–1890",
      confidence: toConfidenceBand(Math.min(gate.confidence_cap_pct, 68)),
      support,
      limitations,
    };
  }

  if (hasEarlyOnlySignals) {
    return {
      range: "pre-1860",
      confidence: toConfidenceBand(Math.min(gate.confidence_cap_pct, 68)),
      support,
      limitations,
    };
  }

  if (hasEarlierStyleJoinery) {
    return {
      range: "Broadly 19th century",
      confidence: toConfidenceBand(Math.min(gate.confidence_cap_pct, 62)),
      support,
      limitations,
    };
  }

  return {
    range: "Broadly antique or vintage, but not tightly dated",
    confidence: toConfidenceBand(Math.min(gate.confidence_cap_pct, 45)),
    support,
    limitations: limitations.length
      ? limitations
      : ["No strong date-specific clues were identified."],
  };
}
function scoreFormCandidates(observations: Observation[], intake: GenericRecord): Record<string, number> {
  const text = observations
    .map((o) => `${o.clue || ""} ${o.description}`.toLowerCase())
    .join(" | ");

  const score: Record<string, number> = {
    "Drop-leaf table": 0,
    "Gate-leg table": 0,
    "Blanket chest": 0,
    "Chest of drawers": 0,
    "Dresser": 0,
    "Cabinet": 0,
    "Slant-front desk": 0,
    "Roll-top desk": 0,
    "Table": 0,
  };

  if (text.includes("drop leaf") || text.includes("drop_leaf_hinged")) score["Drop-leaf table"] += 6;
  if (text.includes("gate leg") || text.includes("gateleg_support")) {
    score["Drop-leaf table"] += 4;
    score["Gate-leg table"] += 6;
  }
  if (text.includes("rule joint")) score["Drop-leaf table"] += 3;
  if (text.includes("swing leg")) score["Drop-leaf table"] += 2;
  if (text.includes("table")) score["Table"] += 2;

  if (text.includes("lift lid")) score["Blanket chest"] += 6;
  if (text.includes("drawer")) {
    score["Chest of drawers"] += 3;
    score["Dresser"] += 3;
  }
  if (text.includes("door")) score["Cabinet"] += 3;

  if (text.includes("slant front") || text.includes("fall front")) score["Slant-front desk"] += 7;
  if (text.includes("roll top") || text.includes("tambour") || text.includes("cylinder roll")) {
    score["Roll-top desk"] += 8;
  }

  const guess = asString(intake?.user_category_guess).toLowerCase();
  if (guess.includes("desk")) {
    score["Slant-front desk"] += 2;
    score["Roll-top desk"] += 2;
  }
  if (guess.includes("cabinet")) score["Cabinet"] += 2;
  if (guess.includes("dresser")) score["Dresser"] += 2;
  if (guess.includes("chest")) {
    score["Blanket chest"] += 2;
    score["Chest of drawers"] += 2;
  }
  if (guess.includes("table")) {
    score["Table"] += 2;
    score["Drop-leaf table"] += 1;
  }

  return score;
}
function deriveStyleContext(observations: Observation[], clueKeys: string[]): string | null {
  const text = observations.map((o) => o.description.toLowerCase()).join(" | ");
  const clueSet = new Set(clueKeys);

  const hasVictorianHardware =
    clueSet.has("porcelain_caster") || clueSet.has("victorian_strap_hinge");

  const hasTurnedVictorianLegs =
    text.includes("turned") ||
    text.includes("ring-and-cylinder") ||
    text.includes("ring and cylinder") ||
    text.includes("baluster") ||
    text.includes("reeded") ||
    text.includes("fluted");

  if (hasVictorianHardware && hasTurnedVictorianLegs) {
    return "Victorian";
  }

  if (hasTurnedVictorianLegs) {
    return "Victorian-influenced";
  }

  return null;
}

function deriveDisplayForm(form: string, styleContext: string | null, observations: Observation[], clueKeys: string[]): string {
  const text = observations.map((o) => o.description.toLowerCase()).join(" | ");
  const clueSet = new Set(clueKeys);

  if (form === "Drop-leaf table") {
    const hasDiningScaleLanguage =
      text.includes("dining") ||
      text.includes("all four legs") ||
      text.includes("apron") ||
      clueSet.has("porcelain_caster");

    if (styleContext === "Victorian" && hasDiningScaleLanguage) {
      return "Victorian drop-leaf dining table";
    }

    if (styleContext === "Victorian") {
      return "Victorian drop-leaf table";
    }

    if (hasDiningScaleLanguage) {
      return "Drop-leaf dining table";
    }
  }

  return styleContext ? `${styleContext} ${form}` : form;
}
function identifyForm(observations: Observation[], digest: EvidenceDigest, gate: Phase1Gate, intake: GenericRecord): Phase3Form {
  if (!gate.can_run.form) {
        return {
      form: "Unknown",
      display_form: "Unknown",
      style_context: null,
      confidence: "Inconclusive",
      support: [],
      alternatives: ["More overall and structural photos are needed before assigning form."],
    };
  }

  const scores = scoreFormCandidates(observations, intake);
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const best = ranked[0];
  const second = ranked[1];

  if (!best || best[1] <= 0) {
        const fallbackForm = digest.likely_forms[0] || "Uncertain case or table form";
    const fallbackStyle = deriveStyleContext(observations, digest.clue_keys);

    return {
      form: fallbackForm,
      display_form: deriveDisplayForm(fallbackForm, fallbackStyle, observations, digest.clue_keys),
      style_context: fallbackStyle,
      confidence: "Low",
      support: digest.strongest_observations.slice(0, 3).map((o) => o.description),
      alternatives: ["No form candidate clearly outranked the others."],
    };
  }

  const gap = best[1] - (second?.[1] || 0);
  const rawPct = gap >= 4 ? 80 : gap >= 2 ? 68 : 52;
  const capped = Math.min(rawPct, gate.confidence_cap_pct);

    const styleContext = deriveStyleContext(observations, digest.clue_keys);
  const displayForm = deriveDisplayForm(best[0], styleContext, observations, digest.clue_keys);

  return {
    form: best[0],
    display_form: displayForm,
    style_context: styleContext,
    confidence: toConfidenceBand(capped),
    support: digest.strongest_observations.slice(0, 4).map((o) => o.description),
    alternatives: ranked
      .slice(1, 4)
      .filter((entry) => entry[1] > 0)
      .map((entry) => entry[0]),
  };
}

function resolveConflicts(
  digest: EvidenceDigest,
  weightedClues: WeightedClue[],
  dating: Phase2Dating,
  form: Phase3Form
): Phase5Conflict {
  const notes: string[] = [];
  let adjustment = 0;
  let restorationInterpretation: string | null = null;

  const hardNegs = weightedClues.filter((w) => w.hard_negative).map((w) => w.clue);
  const structural = weightedClues.filter((w) =>
    ["construction", "joinery", "toolmarks", "fasteners"].includes(w.category)
  );
  const replaceable = weightedClues.filter((w) =>
    ["hardware", "finish"].includes(w.category)
  );

  if (hardNegs.includes("phillips_screw") && dating.range.includes("pre-")) {
    notes.push("Phillips screw evidence conflicts with an early manufacture claim; later repair or later production is more likely.");
    adjustment -= 8;
  }

  if (hardNegs.includes("plywood_structural") || hardNegs.includes("plywood_drawer_bottom")) {
    notes.push("Plywood evidence limits how early the piece can reasonably be dated.");
    adjustment -= 10;
  }

  if (
    replaceable.some((w) => w.clue === "eastlake_pull" || w.clue === "batwing_brass_pull") &&
    structural.some((w) => w.clue === "machine_dovetails" || w.clue === "dowel_joinery")
  ) {
    notes.push("Period-style hardware may be original, later replacement, or revival styling; structure should carry more authority than decorative hardware.");
    adjustment -= 4;
  }

  if (
    form.form === "Drop-leaf table" &&
    !digest.clue_keys.includes("drop_leaf_hinged") &&
    !digest.clue_keys.includes("gateleg_support") &&
    !digest.clue_keys.includes("rule_joint")
  ) {
    notes.push("The form reading leans on broad visual clues more than defining mechanism evidence.");
    adjustment -= 6;
  }

  if (digest.hard_negatives.length && !restorationInterpretation) {
    restorationInterpretation =
      "Some observed features appear later than a strict original antique reading would allow. That may reflect later repair, replacement, refinish, or a later manufacture date.";
  }
  const clueSet = new Set(weightedClues.map((w) => w.clue));

  const hasEarlierDatingPull =
    clueSet.has("rule_joint") ||
    clueSet.has("hand_cut_dovetails") ||
    clueSet.has("hand_forged_nail") ||
    clueSet.has("pit_saw_marks") ||
    clueSet.has("slotted_handmade_screw");

  const hasLaterDatingPull =
    clueSet.has("wire_nail") ||
    clueSet.has("slotted_machine_screw") ||
    clueSet.has("machine_dovetails") ||
    clueSet.has("dowel_joinery") ||
    clueSet.has("polyurethane");

  if (hasEarlierDatingPull && hasLaterDatingPull) {
    notes.push(
      "Mixed-period dating signals are present. Earlier-style construction details appear alongside later fasteners or finish evidence, so the result should favor a later practical date lane unless hidden structure proves otherwise."
    );
    adjustment -= 4;
  }
  return {
    conflict_notes: notes,
    confidence_adjustment: adjustment,
    restoration_interpretation: restorationInterpretation,
  };
}

function synthesize(
  gate: Phase1Gate,
  dating: Phase2Dating,
  form: Phase3Form,
  weighting: Phase4Weighting,
  conflict: Phase5Conflict
): Phase6Synthesis {
  const supported: string[] = [];
  const tentative: string[] = [];
  const moreEvidence: string[] = [...gate.next_best_evidence];

    supported.push(`The strongest supported reading is ${form.display_form} (${form.confidence.toLowerCase()} confidence).`);

  if (dating.range !== "Unknown") {
    supported.push(`Current dating evidence most strongly supports ${dating.range}.`);
  }

  if (weighting.confidence_drivers.increased.length) {
    supported.push(
      `Confidence is most improved by ${weighting.confidence_drivers.increased
        .slice(0, 3)
        .join(", ")}.`
    );
  }

  if (weighting.confidence_drivers.limited.length) {
    tentative.push(
      `Confidence remains limited by ${weighting.confidence_drivers.limited
        .slice(0, 3)
        .join(", ")}.`
    );
  }

  if (conflict.conflict_notes.length) {
    tentative.push(conflict.conflict_notes[0]);
  }

  if (conflict.restoration_interpretation) {
    tentative.push(conflict.restoration_interpretation);
  }

  const summaryParts = [
    `Evidence-first result: ${form.display_form}.`,
    `Dating: ${dating.range}.`,
    gate.evidence_sufficiency_summary,
  ];

  if (tentative.length) {
    summaryParts.push(`Remaining caution: ${tentative[0]}`);
  }

  return {
    supported_findings: uniq(supported),
    tentative_findings: uniq(tentative),
    more_evidence_needed: uniq(moreEvidence).slice(0, 5),
    summary: summaryParts.join(" "),
  };
}

function buildFinalReportText(synthesis: Phase6Synthesis): string {
  const lead = synthesis.supported_findings[0] || "Evidence-first assessment completed.";
  const caution = synthesis.tentative_findings[0]
    ? ` ${synthesis.tentative_findings[0]}`
    : "";
  const next = synthesis.more_evidence_needed[0]
    ? ` Next best evidence: ${synthesis.more_evidence_needed[0]}.`
    : "";
  return `${lead}${caution}${next}`.trim();
}

export const PE: {
  callClaude: (system: string, content: any[]) => Promise<ClaudeResult>;
  imgs: (images: any[]) => any[];
  p0: (caseData: any, images: any[], intake: any, onPhase?: any) => Promise<any>;
  p1: (caseData: any, intake: any, digest: EvidenceDigest, images: any[]) => Phase1Gate;
  p2: (digest: EvidenceDigest, gate: Phase1Gate) => Phase2Dating;
  p3: (digest: EvidenceDigest, gate: Phase1Gate, intake: any) => Phase3Form;
  p4: (digest: EvidenceDigest) => Phase4Weighting;
  p5: (digest: EvidenceDigest, weighting: Phase4Weighting, dating: Phase2Dating, form: Phase3Form) => Phase5Conflict;
  p6: (gate: Phase1Gate, dating: Phase2Dating, form: Phase3Form, weighting: Phase4Weighting, conflict: Phase5Conflict) => Phase6Synthesis;
  runAllPhases: (caseData: any, images: any[], intake: any, onPhase?: any) => Promise<any>;
} = {
  async callClaude(system: string, content: any[]): Promise<ClaudeResult> {
    if (FULL_ANALYSIS_MODE === "mock") {
      return { ok: false, error: "mock_mode" };
    }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1800,
          system,
          messages: [{ role: "user", content }],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data };
      }

      const raw = Array.isArray(data?.content)
        ? data.content.map((b: any) => b?.text || "").join("\n")
        : "";

      if (!raw.trim()) {
        return { ok: false, error: "empty_response" };
      }

      const parsed = parseModelJson(raw);
      if (!parsed) {
        return { ok: false, error: "no_valid_json" };
      }

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

  async p0(caseData: any, images: any[], intake: any, onPhase?: any) {
    const count = images.filter((i: any) => Boolean(i?.data_url)).length;
    const intakeSummary = buildIntakeSummary(intake);

    if (count === 0) {
      const emptyDigest = buildEvidenceDigest([]);
      const res = {
        ok: true,
        observations: [],
        evidence_digest: emptyDigest,
        note: "No images were provided.",
      };
      onPhase?.("p0", res);
      return res;
    }

    const system = `
You are a furniture evidence extraction system.

Your task:
- Read the uploaded furniture photos once.
- Extract only directly visible evidence.
- Do not identify age, value, maker, or form beyond what is visibly supportable.
- If uncertain, keep confidence lower rather than guessing.
- Use clue keys when they are clearly supported.
- It is acceptable to report observations without clue keys when evidence is real but the exact label is uncertain.

Return JSON only in this exact structure:
{
  "observations": [
    {
      "type": "construction | joinery | toolmarks | fasteners | materials | hardware | finish | form | context",
      "clue": "optional_known_clue_key",
      "description": "plain evidence statement",
      "confidence": 0-100,
      "source_image": "overall_front | overall_side | underside | back | hardware_closeup | joinery_closeup | label_makers_mark | unknown",
      "hard_negative": false
    }
  ]
}

Known clue keys include:
drop_leaf_hinged, gateleg_support, rule_joint, swing_leg, lift_lid, multiple_drawer_case,
drawer_present, door_present, slant_front, cylinder_roll, tilt_top, extension_mechanism,
hand_cut_dovetails, machine_dovetails, mortise_and_tenon, dowel_joinery, plywood_drawer_bottom,
pit_saw_marks, circular_saw_arcs, band_saw_lines, hand_plane_chatter,
poplar_secondary, thick_veneer, plywood_structural,
porcelain_caster, victorian_strap_hinge, batwing_brass_pull, eastlake_pull, modern_concealed_hinge,
hand_forged_nail, cut_nail, wire_nail, slotted_handmade_screw, slotted_machine_screw, phillips_screw, staple_fastener,
shellac_crazing, polyurethane

Remember:
- Lead with visible evidence.
- Do not invent hidden structure you cannot see.
- Do not overclaim originality.
`;

    const result = await this.callClaude(system, [
      ...this.imgs(images),
      { type: "text", text: `Intake context: ${intakeSummary}` },
    ]);

    let observations: Observation[] = [];

    if (result.ok) {
      observations = normalizeObservationsFromParsed(result.parsed);
    }

    observations = applyIntakeFunctionalClues(intake || {}, observations);
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

    const res = {
      ok: true,
      observations,
      evidence_digest: digest,
      note: result.ok ? "Evidence extracted from a single image pass." : "LLM extraction failed. Proceeding with limited or intake-derived evidence only.",
      raw_error: result.ok ? null : result.error,
    };

    onPhase?.("p0", res);
    return res;
  },

  p1(caseData: any, intake: any, digest: EvidenceDigest, images: any[]): Phase1Gate {
    const missing = computeMissingEvidence(images);
    return gateEvidence(digest, missing);
  },

  p2(digest: EvidenceDigest, gate: Phase1Gate): Phase2Dating {
    return dateFromEvidence(digest, gate);
  },

  p3(digest: EvidenceDigest, gate: Phase1Gate, intake: any): Phase3Form {
    return identifyForm(digest.observations, digest, gate, intake || {});
  },

  p4(digest: EvidenceDigest): Phase4Weighting {
    const weightedClues = computeClueWeights(digest.observations);
    return {
      weighted_clues: weightedClues,
      confidence_drivers: deriveConfidenceDrivers(weightedClues),
      category_scores: deriveCategoryScores(weightedClues),
    };
  },

  p5(
    digest: EvidenceDigest,
    weighting: Phase4Weighting,
    dating: Phase2Dating,
    form: Phase3Form
  ): Phase5Conflict {
    return resolveConflicts(digest, weighting.weighted_clues, dating, form);
  },

  p6(
    gate: Phase1Gate,
    dating: Phase2Dating,
    form: Phase3Form,
    weighting: Phase4Weighting,
    conflict: Phase5Conflict
  ): Phase6Synthesis {
    return synthesize(gate, dating, form, weighting, conflict);
  },

  async runAllPhases(caseData: any, images: any[], intake: any, onPhase?: any) {
    const stage_outputs: Record<string, any> = {};

    const p0 = await this.p0(caseData, images, intake, onPhase);
    stage_outputs.p0 = p0;

    const observationsFromStore = (API.getObservations(caseData.id) || []).map((o: any) => ({
      type: asString(o?.observation_type) || "unknown",
      clue: normalizeClueKey(o?.clue || o?.reference_id),
      description: descriptionFromObservation(o),
      confidence: clamp(Math.round(asNumber(o?.raw_confidence, 0.45) * 100), 5, 99),
      source_image: asString(o?.source_image) || null,
      hard_negative: Boolean(o?.hard_negative),
      low_confidence_flag: Boolean(o?.low_confidence_flag),
    })) as Observation[];

    const digest =
      observationsFromStore.length > 0
        ? buildEvidenceDigest(observationsFromStore)
        : p0.evidence_digest;

    const p1 = this.p1(caseData, intake, digest, images);
    stage_outputs.p1 = p1;
    onPhase?.("p1", p1);

    const p2 = this.p2(digest, p1);
    stage_outputs.p2 = p2;
    onPhase?.("p2", p2);

    const p3 = this.p3(digest, p1, intake);
    stage_outputs.p3 = p3;
    onPhase?.("p3", p3);

    const p4 = this.p4(digest);
    stage_outputs.p4 = p4;
    onPhase?.("p4", p4);

    const p5 = this.p5(digest, p4, p2, p3);
    stage_outputs.p5 = p5;
    onPhase?.("p5", p5);

    const p6 = this.p6(p1, p2, p3, p4, p5);
    stage_outputs.p6 = p6;
    onPhase?.("p6", p6);

    return {
      stage_outputs,
      evidence_digest: digest,
      final_report: buildFinalReportText(p6),
    };
  },
};
