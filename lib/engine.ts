import { API } from "./store";

export type RuntimeMode = "mock" | "live";
export type EngineMode = "LIVE" | "SIMULATED_FALLBACK";
 
export const RUNTIME_MODE: RuntimeMode = "live";

export function getRuntimeProbe() {
  return {
    engine_mode: "LIVE" as EngineMode,
    runtime_mode: "live" as RuntimeMode,
    full_analysis_mode: "live" as RuntimeMode,
    evidence_adapter_mode: "live" as RuntimeMode,
    live_llm_enabled: true,
    live_field_scan: true,
    backend_endpoint: "/api/analyze",
    simulation_reason: "NCW PE engine active. Phase 0 scans images once; later phases reason from stored evidence.",
  };
}
 
type Observation = {
  type: string;
  clue?: string | null;
  description: string;
  confidence: number;
  source_image?: string | null;
  hard_negative?: boolean;
  low_confidence_flag?: boolean;
};

type EvidenceDigest = {
  observations: Observation[];
  observation_count: number;
  by_type: Record<string, Observation[]>;
  clue_keys: string[];
  hard_negatives: string[];
  strongest_observations: Observation[];
  perception?: Perception;
};

type Perception = {
  labels: string[];
  maker_names: string[];
  materials: string[];
  forms: string[];
  functional_features: string[];
  style_cues: string[];
  construction_cues: string[];
  condition_cues: string[];
  visible_text: string[];
  raw_text: string;
};

type Phase1Gate = {
  confidence_cap: "High" | "Moderate" | "Low" | "Inconclusive";
  confidence_cap_pct: number;
  missing_evidence: Record<string, boolean>;
  evidence_sufficiency_summary: string;
  can_run: Record<string, boolean>;
  next_best_evidence: string[];
};

type ClaudeResult =
  | { ok: true; parsed: any; raw: string }
  | { ok: false; error: any };

const CLUE_LIBRARY: Record<string, { category: string; hardNegative?: boolean; formHint?: string; dateHint?: string; weight: number }> = {
  maker_label: { category: "label", weight: 0.98 },
  roos_label: { category: "label", formHint: "Roos cedar chest / hope chest", dateHint: "c. 1940–1960", weight: 0.99 },
  lane_label: { category: "label", formHint: "Lane cedar chest / hope chest", dateHint: "c. 1930–1965", weight: 0.99 },

  seating_present: { category: "form", weight: 0.78 },
  telephone_shelf: { category: "form", formHint: "Telephone bench", dateHint: "c. 1900–1935", weight: 0.9 },
  seating_surface: { category: "form", formHint: "Bench or chair", weight: 0.78 },
  backrest_present: { category: "structure", formHint: "Bench or chair", weight: 0.72 },
  spindle_back: { category: "structure", formHint: "Bench or telephone bench", weight: 0.76 },
  secondary_surface: { category: "function", formHint: "Writing bench or telephone bench", weight: 0.82 },
  writing_surface: { category: "function", formHint: "Desk or writing bench", weight: 0.84 },
  drop_front_desk: { category: "construction", formHint: "Secretary desk", weight: 0.88 },
  pigeonholes: { category: "construction", formHint: "Secretary desk", weight: 0.82 },
  mirror_present: { category: "form", weight: 0.62 },
  open_shelving: { category: "form", weight: 0.65 },
  pedestal_column: { category: "form", formHint: "Pedestal stand", weight: 0.9 },
  metal_bed_frame: { category: "form", formHint: "Iron bed frame", dateHint: "c. 1880–1920", weight: 0.92 },
  armchair_form: { category: "form", formHint: "Armchair", weight: 0.86 },
  upholstered_back: { category: "materials", weight: 0.72 },

  drawer_present: { category: "construction", weight: 0.45 },
  multiple_drawer_case: { category: "construction", formHint: "Chest of drawers / dresser", weight: 0.78 },
  door_present: { category: "construction", weight: 0.5 },
  cabinet_form: { category: "form", formHint: "Cabinet", weight: 0.74 },
  lift_lid: { category: "construction", formHint: "Blanket chest / storage chest", weight: 0.86 },
  cedar_lining: { category: "materials", formHint: "Cedar chest / hope chest", weight: 0.88 },

  cabriole_leg: { category: "style", dateHint: "18th century form; common revival c. 1890–1940", weight: 0.68 },
  shell_carving: { category: "style", weight: 0.65 },
  claw_or_pad_foot: { category: "style", weight: 0.62 },
  barley_twist: { category: "style", dateHint: "Jacobean Revival c. 1890–1935", weight: 0.78 },
  heavy_carving: { category: "style", weight: 0.65 },
  spindle_gallery: { category: "style", weight: 0.62 },

  drop_leaf_hinged: { category: "construction", formHint: "Drop-leaf table", dateHint: "1720–1930", weight: 0.9 },
  gateleg_support: { category: "construction", formHint: "Gateleg table", dateHint: "1680–1800; revival 1880–1930", weight: 0.92 },
  rule_joint: { category: "joinery", weight: 0.78 },
  slant_front: { category: "construction", formHint: "Slant-front desk", dateHint: "1700–1860", weight: 0.9 },
  cylinder_roll: { category: "construction", formHint: "Roll-top desk", dateHint: "1870–1920", weight: 0.92 },
  extension_mechanism: { category: "construction", formHint: "Extension table", weight: 0.85 },

  hand_cut_dovetails: { category: "joinery", dateHint: "pre-1860", weight: 0.88 },
  machine_dovetails: { category: "joinery", dateHint: "post-1860", weight: 0.82 },
  mortise_and_tenon: { category: "joinery", weight: 0.72 },
  dowel_joinery: { category: "joinery", dateHint: "post-1900", weight: 0.72 },

  pit_saw_marks: { category: "toolmarks", dateHint: "pre-1830", weight: 0.86 },
  circular_saw_arcs: { category: "toolmarks", dateHint: "post-1830", weight: 0.78 },
  band_saw_lines: { category: "toolmarks", dateHint: "post-1870", weight: 0.75 },

  hand_forged_nail: { category: "fasteners", dateHint: "pre-1800", weight: 0.88 },
  cut_nail: { category: "fasteners", dateHint: "1790–1890", weight: 0.82 },
  wire_nail: { category: "fasteners", dateHint: "post-1880", weight: 0.72 },
  phillips_screw: { category: "fasteners", hardNegative: true, dateHint: "post-1934", weight: 0.9 },
  staple_fastener: { category: "fasteners", hardNegative: true, dateHint: "post-1945", weight: 0.9 },
  plywood_structural: { category: "materials", hardNegative: true, dateHint: "post-1920", weight: 0.9 },
  plywood_drawer_bottom: { category: "materials", hardNegative: true, dateHint: "post-1920", weight: 0.88 },
  sheet_back_panel: { category: "materials", dateHint: "post-1900", weight: 0.72 },
  modern_concealed_hinge: { category: "hardware", hardNegative: true, dateHint: "post-1950", weight: 0.92 },

  porcelain_caster: { category: "hardware", dateHint: "1830–1900", weight: 0.65 },
  decorative_bail_pull: { category: "hardware", weight: 0.55 },
  round_wood_knob: { category: "hardware", weight: 0.5 },
  shellac_crazing: { category: "finish", dateHint: "1800–1920", weight: 0.55 },
  polyurethane: { category: "finish", dateHint: "post-1960", weight: 0.62 },
  possible_plywood_or_laminated_panel: {
  category: "construction",
  dateHint: "uncertain panel construction; does not confirm modern manufacture",
  weight: 0.25,
  },
 
  metal_frame: {
    category: "materials",
    dateHint: "metal furniture construction; date depends on form, joints, plating, and fasteners",
    weight: 0.70,
  },
  tubular_steel: {
    category: "materials",
    dateHint: "tubular steel furniture became especially associated with modernist and mid-century production",
    weight: 0.78,
  },
  wrought_iron: {
    category: "materials",
    dateHint: "wrought iron furniture spans Victorian, garden, and revival production; date depends on construction and finish",
    weight: 0.72,
  },
  cast_iron: {
    category: "materials",
    dateHint: "cast iron furniture and bed components are common in late 19th and early 20th century production",
    weight: 0.74,
  },
  brass_frame: {
    category: "materials",
    dateHint: "brass beds and brass-mounted furniture were especially common from the late Victorian period into the early 20th century",
    weight: 0.72,
  },
  chrome_frame: {
    category: "materials",
    dateHint: "chrome-plated furniture strongly suggests Art Deco, Machine Age, mid-century, or later modern production",
    weight: 0.78,
  },

  fully_upholstered: {
    category: "materials",
    dateHint: "upholstered seating spans many periods; dating depends on frame, springs, stuffing, legs, and upholstery method",
    weight: 0.68,
  },
  visible_springs: {
    category: "construction",
    dateHint: "visible spring construction supports upholstered seating analysis; coil, sinuous, and webbing types affect dating",
    weight: 0.72,
  },
  tufted_upholstery: {
    category: "style",
    dateHint: "tufted upholstery is common across Victorian, Chesterfield, traditional, and revival seating forms",
    weight: 0.58,
  },
  exposed_upholstery_tacks: {
    category: "construction",
    dateHint: "visible upholstery tacks can support older or traditional upholstery methods, but may also be decorative",
    weight: 0.58,
  },

  woven_body: {
    category: "materials",
    dateHint: "woven wicker or reed construction appears in Victorian, porch, Arts and Crafts, and later revival furniture",
    weight: 0.72,
  },
  rattan_frame: {
    category: "materials",
    dateHint: "rattan furniture is common in porch, tropical, mid-century, and revival production",
    weight: 0.72,
  },
  cane_panels: {
    category: "materials",
    dateHint: "cane panels appear on many 19th and 20th century chairs, settees, beds, and Colonial Revival forms",
    weight: 0.62,
  },

  glass_top: {
    category: "materials",
    dateHint: "glass tops are often replacement or protective surfaces unless integrated into the original design",
    weight: 0.42,
  },
  laminate_surface: {
    category: "materials",
    dateHint: "laminate surfaces generally support mid-century or later production unless used as a later alteration",
    weight: 0.68,
  },
  formica_surface: {
    category: "materials",
    dateHint: "Formica or similar laminate is strongly associated with mid-century and later furniture",
    weight: 0.70,
  },
  chrome_and_laminate: {
    category: "materials",
    dateHint: "chrome and laminate combinations strongly support mid-century kitchen, dinette, or utility furniture",
    weight: 0.78,
  },

  molded_plastic: {
    category: "materials",
    dateHint: "molded plastic furniture generally indicates postwar modern or later production",
    weight: 0.76,
  },
  acrylic_clear: {
    category: "materials",
    dateHint: "clear acrylic or Lucite furniture generally indicates mid-20th century or later modern production",
    weight: 0.78,
  },
  no_phillips_screws_observed: {
  category: "fasteners",
  dateHint: "absence of visible Phillips screws; removes post-1934 fastener evidence but does not independently date the piece",
  weight: 0.35,
},
    solid_wood_construction: {
  category: "construction",
  dateHint: "solid wood construction; not a plywood indicator",
  weight: 0.72,
},
  solid_wood_side_panels: {
  category: "construction",
  dateHint: "solid side-panel construction; supports pre-plywood or traditional case construction",
  weight: 0.72,
},

frame_and_panel_sides: {
  category: "construction",
  dateHint: "traditional frame-and-panel side construction; dating depends on joinery and fasteners",
  weight: 0.74,
},

solid_plank_back: {
  category: "construction",
  dateHint: "solid plank back construction; usually pre-plywood or traditional case construction",
  weight: 0.78,
},

wood_knob_pulls: {
  category: "hardware",
  dateHint: "wooden knob pulls are common on 19th and early 20th century case furniture, but may be replaced",
  weight: 0.55,
},

lock_escutcheons: {
  category: "hardware",
  dateHint: "drawer lock escutcheons support period case-furniture construction but are not independently decisive",
  weight: 0.56,
},

drawer_box_joinery: {
  category: "joinery",
  dateHint: "drawer-box joinery evidence; dating depends on whether hand-cut, machine-cut, dado, or butt construction is visible",
  weight: 0.62,
},

rope_carved_pilasters: {
  category: "style",
  dateHint: "Empire or transitional case-furniture style cue; lower authority than construction",
  weight: 0.58,
},

overhanging_top: {
  category: "structure",
  dateHint: "overhanging cornice or top board supports Empire or transitional case-furniture form",
  weight: 0.58,
},
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function asString(v: any) {
  return typeof v === "string" ? v.trim() : "";
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function toConfidenceBand(pct: number): "High" | "Moderate" | "Low" | "Inconclusive" {
  if (pct >= 85) return "High";
  if (pct >= 65) return "Moderate";
  if (pct >= 40) return "Low";
  return "Inconclusive";
}

function cleanJsonText(raw: string): string {
  return String(raw || "").replace(/```json/gi, "").replace(/```/g, "").trim();
}

function tryJsonParse(text: string): any | null {
  try { return JSON.parse(text); } catch { return null; }
}

function extractBalancedJson(text: string): string | null {
  const cleaned = cleanJsonText(text);
  const start = cleaned.indexOf("{");
  if (start < 0) return null;
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") depth--;
    if (depth === 0) return cleaned.slice(start, i + 1);
  }
  return null;
}

function parseModelJson(raw: string): any | null {
  if (!raw) return null;

  let text = String(raw).trim();

  if (text.startsWith("```")) {
    text = text
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();
  }

  return tryJsonParse(text) || tryJsonParse(extractBalancedJson(text) || "");
}

function normalizeClueKey(v: any): string | null {
  const key = asString(v).toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_");
  return key || null;
}

function normalizePhase0Clue(raw: any): string | null {
  const key = normalizeClueKey(raw?.clue || raw?.key || raw?.reference_id);
  const valueText = String(raw?.value ?? "").toLowerCase();
  const desc = descriptionFromObservation(raw).toLowerCase();

  if (!key) return null;

  if (key === "phillips_screw") {
  const saysNoPhillips =
    desc.includes("no phillips") ||
    desc.includes("no visible phillips") ||
    desc.includes("phillips screws not observed") ||
    desc.includes("not observed") ||
    desc.includes("without phillips");

  if (saysNoPhillips) {
    return "no_phillips_screws_observed";
  }

  return key;
}
  
  if (key === "plywood_structural" || key === "plywood_drawer_bottom") {
  const saysNoPlywood =
    valueText === "false" ||
    desc.includes("no plywood") ||
    desc.includes("not plywood") ||
    desc.includes("without visible laminate") ||
    desc.includes("without laminate") ||
    desc.includes("no visible laminate") ||
    desc.includes("solid wood grain") ||
    desc.includes("solid wood throughout") ||
    desc.includes("rather than plywood") ||
    desc.includes("pre-plywood") ||
    desc.includes("not a plywood") ||
    desc.includes("no visible plywood") ||
    desc.includes("solid wood planks");

  const saysPossiblePlywood =
    desc.includes("possible plywood") ||
    desc.includes("possibly plywood") ||
    desc.includes("could indicate") ||
    desc.includes("may indicate") ||
    desc.includes("laminated panel") ||
    desc.includes("layered edge");

  if (saysNoPlywood && !saysPossiblePlywood) {
    return "solid_wood_construction";
  }

  if (saysPossiblePlywood) {
    return "possible_plywood_or_laminated_panel";
  }

  return key;
}

  if (
    key === "empire_style_feet" ||
    key === "scrolled_empire_feet" ||
    key === "scrolled_feet" ||
    key === "rounded_pilaster_stiles" ||
    key === "empire_style" ||
    key === "ogee_curved_top_rail"
  ) {
    return "american_empire_style";
  }

  if (
  key === "drawer_configuration" ||
  key === "drawer_count" ||
  key === "tall_chest_form" ||
  key === "top_row_split_drawers" ||
  key === "split_top_drawer_row" ||
  key === "drawer_depth_graduation" ||
  key === "storage" ||
  key === "chest_of_drawers" ||
  key === "tall_chest" ||
  key === "highboy_form" ||
  key === "highboy_style"
) {
  return "multiple_drawer_case";
}

  if (key === "primary_wood_oak") {
    return "oak_primary";
  }

  if (
    key === "secondary_wood_drawer_box" ||
    key === "drawer_bottom_material" ||
    key === "drawer_runner_type"
  ) {
    return "solid_wood_drawer_construction";
  }

  if (key === "back_panel_construction" || key === "plank_back_panels") {
    return "solid_plank_back";
  }

  return key;
}

function includesAny(text: string, words: string[]) {
  return words.some((w) => text.includes(w));
}

function collectText(value: any, out: string[] = []): string[] {
  if (value == null) return out;
  if (typeof value === "string") {
    if (value.trim()) out.push(value.trim());
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((v) => collectText(v, out));
    return out;
  }
  if (typeof value === "object") Object.values(value).forEach((v) => collectText(v, out));
  return out;
}

function detectClueFromText(text: string): string | null {
  const t = text.toLowerCase();

  // GLOBAL NEGATION GUARD
  const isNegated = (phrase: string) =>
    includesAny(t, [
      `no ${phrase}`,
      `not ${phrase}`,
      `without ${phrase}`,
      `${phrase} not`,
      `absence of ${phrase}`,
      `no visible ${phrase}`,
    ]);

  // Skip vague / uncertain statements entirely
  if (includesAny(t, ["not visible", "not confirmed", "cannot confirm", "unclear"])) return null;

  // LABELS
  if (includesAny(t, ["roos", "sweetheart cedar"])) return "roos_label";
  if (includesAny(t, ["lane cedar"])) return "lane_label";
  if (includesAny(t, ["maker label", "manufacturer label", "paper label", "stamp"])) return "maker_label";

  // FUNCTION (HIGH PRIORITY)
  if (!isNegated("telephone") && includesAny(t, ["telephone", "phone shelf", "telephone shelf"])) return "telephone_shelf";
  if (!isNegated("writing surface") && includesAny(t, ["writing surface", "desk surface"])) return "writing_surface";
  if (!isNegated("secondary surface") && includesAny(t, ["secondary surface", "raised surface"])) return "secondary_surface";

  // FORM
  if (!isNegated("seating") && includesAny(t, ["bench seat", "integrated seat", "seating"])) return "seating_present";
  if (!isNegated("backrest") && includesAny(t, ["backrest", "back rail"])) return "backrest_present";

  // DRAWERS (lower priority)
  if (!isNegated("drawer") && t.includes("drawer")) return "drawer_present";
  if (!isNegated("door") && t.includes("door")) return "door_present";

  // STYLE (low authority, guard heavily)
  if (!isNegated("cabriole") && t.includes("cabriole")) return "cabriole_leg";
  if (!isNegated("barley twist") && t.includes("barley twist")) return "barley_twist";

  // MATERIAL / CONSTRUCTION
  if (!isNegated("plywood") && includesAny(t, ["plywood", "sheet back"])) return "sheet_back_panel";

// --- NON-WOOD MATERIAL DETECTION ---

if (t.includes("metal")) return "metal_frame";
if (t.includes("steel")) return "tubular_steel";
if (t.includes("iron")) return "wrought_iron";
if (t.includes("brass")) return "brass_frame";
if (t.includes("chrome")) return "chrome_frame";

if (t.includes("upholstered") || t.includes("fabric") || t.includes("cushion")) return "fully_upholstered";
if (t.includes("tufted")) return "tufted_upholstery";
if (t.includes("springs")) return "visible_springs";

if (t.includes("wicker")) return "woven_body";
if (t.includes("rattan")) return "rattan_frame";
if (t.includes("cane")) return "cane_panels";

if (t.includes("glass")) return "glass_top";
if (t.includes("laminate")) return "laminate_surface";
if (t.includes("formica")) return "formica_surface";

if (t.includes("plastic")) return "molded_plastic";
if (t.includes("acrylic") || t.includes("lucite")) return "acrylic_clear";
 
  return null;
}
function descriptionFromObservation(o: any): string {
  return asString(o?.description) || asString(o?.observed_value_text) || asString(o?.text) || asString(o?.value) || "Unknown observation";
}
function normalizeObservationsFromParsed(parsed: any): Observation[] {
  const direct = Array.isArray(parsed?.observations) ? parsed.observations : [];
  const out: Observation[] = [];

  const push = (raw: any) => {
    const description =
      asString(raw?.description) ||
      asString(raw?.value) ||
      asString(raw?.observed_value_text) ||
      asString(raw?.text) ||
      "Visible furniture evidence";

    const clue =
  normalizePhase0Clue(raw) ||
  detectClueFromText(description);

    const meta = clue ? CLUE_LIBRARY[clue] : undefined;

    const type =
      asString(raw?.type) ||
      asString(raw?.category) ||
      meta?.category ||
      "context";

    out.push({
      type,
      clue,
      description,
      confidence: clamp(
        typeof raw?.confidence === "number" ? raw.confidence : 45,
        5,
        99
      ),
      source_image: asString(raw?.source_image) || null,
      hard_negative: Boolean(
  raw?.hard_negative === true &&
  raw?.value !== false &&
  String(raw?.value).toLowerCase() !== "false"
),
      low_confidence_flag:
        typeof raw?.confidence === "number" ? raw.confidence < 45 : true,
    });
  };

  if (direct.length) {
    direct.forEach(push);
  } else {
    collectText(parsed).forEach((t) => {
      const clue = detectClueFromText(t);
      push({
        category: clue ? CLUE_LIBRARY[clue]?.category : "context",
        key: clue,
        description: t,
        confidence: clue ? 55 : 35,
      });
    });
  }

  return dedupeObservations(out);
}

function dedupeObservations(observations: Observation[]): Observation[] {
  const seen = new Set<string>();
  return observations.filter((o) => {
    const key = `${o.type}|${o.clue || ""}|${o.description.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizePerception(parsed: any, observations: Observation[]): Perception {
  const p = parsed?.perception || {};
  const arr = (v: any) => Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : [];
  const raw = [...collectText(p), ...observations.map((o) => `${o.clue || ""} ${o.description}`)].join(" | ");
  const t = raw.toLowerCase();

  const perception: Perception = {
    labels: arr(p.labels),
    maker_names: arr(p.maker_names),
    materials: arr(p.materials),
    forms: arr(p.forms),
    functional_features: arr(p.functional_features),
    style_cues: arr(p.style_cues),
    construction_cues: arr(p.construction_cues),
    condition_cues: arr(p.condition_cues),
    visible_text: arr(p.visible_text),
    raw_text: raw,
  };

  const add = (key: keyof Perception, value: string) => {
    const current = perception[key];
    if (Array.isArray(current) && !current.includes(value)) current.push(value);
  };

  if (includesAny(t, ["roos", "sweetheart cedar"])) { add("labels", "Roos label"); add("maker_names", "Roos"); }
  if (includesAny(t, ["lane cedar"])) { add("labels", "Lane label"); add("maker_names", "Lane"); }
  if (includesAny(t, ["metal", "iron", "steel", "brass"])) add("materials", "metal");
  if (includesAny(t, ["upholstered", "fabric", "cushion"])) add("materials", "upholstery");
  if (includesAny(t, ["wood", "oak", "cedar", "walnut"])) add("materials", "wood");
  if (includesAny(t, ["telephone", "phone shelf"])) add("functional_features", "telephone shelf");
  if (includesAny(t, ["bench", "seat", "seating"])) add("functional_features", "seating");
  if (includesAny(t, ["drop front", "writing surface"])) add("functional_features", "drop-front desk");
  if (includesAny(t, ["pigeonhole", "cubby"])) add("functional_features", "pigeonholes");
  if (t.includes("mirror")) add("functional_features", "mirror");
  if (includesAny(t, ["cabriole", "shell carving"])) add("style_cues", "Queen Anne / Colonial Revival");
  if (includesAny(t, ["barley twist", "jacobean", "heavy carving"])) add("style_cues", "Jacobean Revival");

  return perception;
}

function promotePerceptionObservations(observations: Observation[], perception: Perception): Observation[] {
  const out = [...observations];
  const text = perception.raw_text.toLowerCase();
const negatesSeatingOrWriting =
  includesAny(text, [
    "no seating",
    "no seating surface",
    "no visible seating",
    "no writing surface",
    "no secondary function",
  ]);
  const add = (clue: string, description: string, confidence = 72, source = "perception") => {
    if (out.some((o) => o.clue === clue)) return;
    const meta = CLUE_LIBRARY[clue];
    out.push({
      type: meta?.category || "context",
      clue,
      description,
      confidence,
      source_image: source,
      hard_negative: Boolean(meta?.hardNegative),
      low_confidence_flag: confidence < 45,
    });
  };

  // Broad form/function/structure guarantees
  if (!negatesSeatingOrWriting && includesAny(text, ["seat", "seating", "bench", "sitting surface"])) {
    add("seating_surface", "A seating surface or bench-like sitting area is visible.", 82);
    add("seating_present", "Integrated seating is visible.", 78);
  }

  if (includesAny(text, ["backrest", "back rail", "spindle back", "spindled back", "rail back"])) {
    add("backrest_present", "A backrest or back rail is visible.", 78);
  }

  if (includesAny(text, ["spindle", "spindles", "turned spindle", "spindle rail"])) {
    add("spindle_back", "Spindles are visible in the back or side rail.", 78);
    add("spindle_gallery", "Spindle gallery or rail detail is visible.", 70);
  }

  if (!negatesSeatingOrWriting && includesAny(text, ["secondary surface", "side surface", "raised surface", "raised platform", "small table surface", "writing surface", "work surface"])) {
    add("secondary_surface", "A secondary raised surface is visible beside the seating area.", 86);
  }

  if (!negatesSeatingOrWriting && includesAny(text, ["writing", "writing surface", "desk surface", "work surface"])) {
    add("writing_surface", "A writing or work surface is visible.", 84);
  }

  if (!negatesSeatingOrWriting && includesAny(text, ["telephone", "phone shelf", "telephone shelf", "phone platform"])) {
    add("telephone_shelf", "A telephone shelf or phone platform is visible.", 86);
  }

  if (includesAny(text, ["turned leg", "turned legs", "turned support", "turned supports"])) {
    add("spindle_gallery", "Turned supports or spindle-like elements are visible.", 68);
  }

  // Existing specific clues
  if (includesAny(text, ["roos", "sweetheart cedar"])) add("roos_label", "Roos cedar chest label is visible.", 94);
  if (includesAny(text, ["lane cedar"])) add("lane_label", "Lane cedar chest label is visible.", 94);
  if (includesAny(text, ["cedar lined", "cedar interior"])) add("cedar_lining", "Cedar-lined interior is visible.", 84);
  if (includesAny(text, ["drop front", "drop-front", "fall front"])) add("drop_front_desk", "Drop-front writing surface is visible.", 84);
  if (includesAny(text, ["pigeonhole", "pigeon hole", "cubby", "cubbies"])) add("pigeonholes", "Interior cubbies or pigeonholes are visible.", 78);
  if (
  text.includes("mirror") &&
  !includesAny(text, ["no mirror", "mirror not", "no attached mirror", "no mirror or bonnet"])
) {
  add("mirror_present", "Mirror is visible.", 72);
}
  if (includesAny(text, ["iron bed", "metal bed", "headboard", "footboard"])) add("metal_bed_frame", "Iron or metal bed frame is visible.", 88);
  if (includesAny(text, ["pedestal", "single column"])) add("pedestal_column", "Single-column pedestal form is visible.", 84);
  if (includesAny(text, ["armchair", "upholstered chair"])) add("armchair_form", "Armchair form is visible.", 82);
   if (includesAny(text, ["metal frame", "metal furniture", "metal structure", "steel frame", "iron frame"])) {
    add("metal_frame", "Metal frame or metal furniture structure is visible.", 72);
  }

  if (includesAny(text, ["wicker", "woven reed", "woven body", "reed furniture"])) {
    add("woven_body", "Woven wicker or reed body construction is visible.", 76);
  }

  if (includesAny(text, ["upholstered", "fabric covered", "cushion", "cushioned", "padded seat", "padded back"])) {
    add("fully_upholstered", "Upholstered or cushioned surfaces are visible.", 74);
  }
  if (
  text.includes("cabriole") &&
  !includesAny(text, ["no cabriole", "no turned or cabriole", "not cabriole"])
) {
  add("cabriole_leg", "Cabriole legs are visible.", 72);
}
  if (text.includes("barley twist")) add("barley_twist", "Barley twist supports are visible.", 76);
  if (text.includes("drawer")) add("drawer_present", "Drawer evidence is visible.", 58);
  if (text.includes("door")) add("door_present", "Door evidence is visible.", 58);
  if (includesAny(text, ["cabinet", "cupboard", "hutch"])) add("cabinet_form", "Cabinet or cupboard form is visible.", 68);

  return dedupeObservations(out);
}

function tIncludes(text: string, word: string) {
  return text.includes(word);
}

function buildEvidenceDigest(observations: Observation[], perception?: Perception): EvidenceDigest {
  const by_type: Record<string, Observation[]> = {};
  observations.forEach((o) => {
    if (!by_type[o.type]) by_type[o.type] = [];
    by_type[o.type].push(o);
  });

  const clue_keys = uniq(observations.map((o) => normalizeClueKey(o.clue)).filter(Boolean) as string[]);
  const hard_negatives = uniq(observations.filter((o) => o.hard_negative).map((o) => o.clue || o.description));
  const strongest_observations = [...observations].sort((a, b) => b.confidence - a.confidence).slice(0, 10);

  return { observations, observation_count: observations.length, by_type, clue_keys, hard_negatives, strongest_observations, perception };
}

function computeMissingEvidence(images: any[]) {
  const types = new Set(images.map((img) => String(img?.image_type || "")));
  return {
    underside_photo: !types.has("underside"),
    back_photo: !types.has("back"),
    joinery_photo: !types.has("joinery_closeup"),
    hardware_photo: !types.has("hardware_closeup"),
    label_photo: !types.has("label_makers_mark"),
  };
}

function buildIntakeSummary(intake: any): string {
  if (!intake) return "No intake details provided.";
  return Object.entries(intake)
    .filter(([, v]) => v !== "" && v !== false && v != null)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(" | ") || "No intake details provided.";
}

function addIntakeObservations(intake: any, observations: Observation[]): Observation[] {
  const out = [...observations];
  const add = (clue: string, description: string) => {
    if (out.some((o) => o.clue === clue)) return;
    const meta = CLUE_LIBRARY[clue];
    out.push({ type: meta?.category || "context", clue, description, confidence: 55, source_image: "intake", hard_negative: false });
  };
  if (intake?.has_drawers) add("drawer_present", "User indicates drawers are present");
  if (intake?.has_doors) add("door_present", "User indicates doors are present");
  return dedupeObservations(out);
}

function scoreForms(digest: EvidenceDigest): Array<{ form: string; score: number; support: string[] }> {
  const clues = new Set(digest.clue_keys);
  const text = `${digest.perception?.raw_text || ""} ${digest.observations.map((o) => `${o.clue} ${o.description}`).join(" ")}`.toLowerCase();

  const scores: Record<string, { form: string; score: number; support: string[] }> = {};

  const add = (form: string, score: number, support: string) => {
    if (!scores[form]) scores[form] = { form, score: 0, support: [] };
    scores[form].score += score;
    if (!scores[form].support.includes(support)) scores[form].support.push(support);
  };

  const hasAny = (...keys: string[]) => keys.some((k) => clues.has(k));

  // Highest-authority maker/form labels
  if (clues.has("roos_label")) add("Roos cedar chest / hope chest", 120, "Visible Roos label directly supports the identification.");
  if (clues.has("lane_label")) add("Lane cedar chest / hope chest", 120, "Visible Lane label directly supports the identification.");

  // Composite seating / telephone / writing bench pattern
  let benchScore = 0;
  const benchSupport: string[] = [];

  if (hasAny("seating_surface", "seating_present")) {
    benchScore += 35;
    benchSupport.push("seating surface");
  }

  if (hasAny("backrest_present", "spindle_back", "spindle_gallery")) {
    benchScore += 25;
    benchSupport.push("backrest or spindle rail");
  }

  if (hasAny("secondary_surface", "writing_surface")) {
    benchScore += 35;
    benchSupport.push("secondary writing or side surface");
  }

  if (clues.has("telephone_shelf")) {
    benchScore += 45;
    benchSupport.push("telephone shelf or phone platform");
  }

  if (hasAny("drop_front_desk", "pigeonholes")) {
    benchScore += 35;
    benchSupport.push("desk or secretary features");
  }

  if (benchScore >= 65) {
    const label =
      hasAny("drop_front_desk", "pigeonholes")
        ? "Telephone bench / secretary combination"
        : hasAny("telephone_shelf")
        ? "Telephone bench"
        : "Telephone bench / writing bench combination";

    add(
      label,
      benchScore,
      `Composite functional pattern: ${benchSupport.join(", ")}.`
    );
  }

  // Desk and secretary forms
  if (clues.has("drop_front_desk")) add("Secretary desk / drop-front desk", 90, "Drop-front writing surface is visible.");
  if (clues.has("pigeonholes")) add("Secretary desk / writing desk", 65, "Interior cubbies or pigeonholes are visible.");
  if (clues.has("slant_front")) add("Slant-front desk", 100, "Slant-front writing surface is visible.");
  if (clues.has("cylinder_roll")) add("Roll-top desk", 105, "Roll-top or tambour mechanism is visible.");

  // Table forms
  if (clues.has("drop_leaf_hinged")) add("Drop-leaf table", 90, "Drop-leaf construction is visible.");
  if (clues.has("gateleg_support")) add("Gateleg table", 100, "Gate-leg support is visible.");
  if (clues.has("extension_mechanism")) add("Extension table", 82, "Extension mechanism is visible.");
  if (clues.has("pedestal_column")) add("Pedestal stand", 88, "Single-column pedestal form is visible.");

  // Chest and storage forms
  if (clues.has("cedar_lining") || clues.has("lift_lid")) {
    add(
      "Cedar chest / hope chest",
      clues.has("cedar_lining") ? 85 : 65,
      "Chest form and/or cedar interior are visible."
    );
  }

  // Case furniture forms
  if (clues.has("multiple_drawer_case")) {
    add("Chest of drawers / dresser", 70, "Multiple stacked drawers are visible.");
  }

  if (clues.has("drawer_present") && !hasAny("seating_present", "seating_surface", "telephone_shelf", "secondary_surface", "writing_surface")) {
    add("Dresser / drawer case", 42, "Drawer evidence is visible without stronger competing functional features.");
  }

  if (clues.has("door_present") && clues.has("drawer_present")) {
    add("Cabinet / dresser combination", 48, "Doors and drawers are both visible.");
  }

  if (clues.has("cabinet_form")) {
    add("Cabinet", 35, "Cabinet form is visible.");
  }

  if (clues.has("open_shelving")) {
    add("Bookcase / open shelving unit", 60, "Open shelving is visible.");
  }

  // Seating forms
  if (clues.has("armchair_form")) {
    add(
      "Upholstered armchair",
      clues.has("cabriole_leg") ? 82 : 62,
      "Armchair form is visible."
    );
  }

  if (hasAny("seating_surface", "seating_present") && !hasAny("secondary_surface", "writing_surface", "telephone_shelf", "drop_front_desk", "pigeonholes")) {
    add("Bench / seating furniture", 55, "Seating surface is visible without stronger desk or telephone features.");
  }

  // Bed forms
  if (clues.has("metal_bed_frame")) {
    add("Iron bed frame", 95, "Metal headboard, footboard, or bed frame structure is visible.");
  }
     // Non-wood and mixed-material form families
  if (hasAny("metal_frame", "tubular_steel", "wrought_iron", "cast_iron", "brass_frame", "chrome_frame")) {
    add("Metal furniture", 62, "Metal frame or metal furniture construction is visible.");
  }

  if (hasAny("tubular_steel", "chrome_frame", "chrome_and_laminate")) {
    add("Modernist / chrome-frame furniture", 74, "Tubular steel, chrome, or chrome-and-laminate construction supports a modernist or mid-century furniture reading.");
  }

  if (hasAny("wrought_iron", "cast_iron")) {
    add("Iron furniture", 72, "Iron or cast/wrought metal construction is visible.");
  }

  if (hasAny("brass_frame")) {
    add("Brass bed or brass-frame furniture", 70, "Brass frame or brass rail construction is visible.");
  }

  if (hasAny("fully_upholstered", "visible_springs", "tufted_upholstery", "exposed_upholstery_tacks")) {
    add("Upholstered seating", 76, "Upholstery, cushion, spring, or upholstery-tack evidence is visible.");
  }

  if (hasAny("woven_body", "rattan_frame")) {
    add("Wicker / rattan furniture", 78, "Woven wicker, reed, or rattan construction is visible.");
  }

  if (hasAny("cane_panels")) {
    add("Caned seating or caned-back furniture", 62, "Cane panel, cane seat, or cane back construction is visible.");
  }

  if (hasAny("glass_top")) {
    add("Glass-top table or mixed-material table", 48, "Glass top or glass shelf evidence is visible.");
  }

  if (hasAny("laminate_surface", "formica_surface", "chrome_and_laminate")) {
    add("Mid-century laminate / dinette furniture", 72, "Laminate, Formica, chrome, or utility-surface evidence supports mid-century or later furniture.");
  }

  if (hasAny("molded_plastic", "acrylic_clear")) {
    add("Modern plastic / acrylic furniture", 74, "Molded plastic, acrylic, or Lucite-style furniture material is visible.");
  }
  // Style-context forms
  if (clues.has("barley_twist") || includesAny(text, ["jacobean", "heavy carving", "spiral turned", "twist leg"])) {
    add("Jacobean Revival cabinet / sideboard", 72, "Historicist carving or turned supports support Jacobean Revival context.");
  }

  if (clues.has("cabriole_leg") || clues.has("shell_carving") || clues.has("claw_or_pad_foot")) {
    add("Queen Anne / Colonial Revival furniture", 48, "Cabriole legs, shell carving, or related revival style cues are visible.");
  }

  // Functional hierarchy corrections
  const strongFunctionalSignals = hasAny(
    "seating_surface",
    "seating_present",
    "telephone_shelf",
    "secondary_surface",
    "writing_surface",
    "drop_front_desk",
    "pigeonholes"
  );

  if (strongFunctionalSignals) {
    if (scores["Cabinet"]) scores["Cabinet"].score -= 25;
    if (scores["Dresser / drawer case"]) scores["Dresser / drawer case"].score -= 25;
    if (scores["Chest of drawers / dresser"]) scores["Chest of drawers / dresser"].score -= 20;
    if (scores["Cabinet / dresser combination"]) scores["Cabinet / dresser combination"].score -= 15;
  }

  // Avoid negative or zero-score results
  return Object.values(scores)
    .map((s) => ({ ...s, score: Math.max(1, s.score) }))
    .sort((a, b) => b.score - a.score);
}
function buildReportEvidenceSupport(digest: EvidenceDigest, formSupport: string[]): string[] {
  const priorityOrder: Record<string, number> = {
    construction: 1,
    joinery: 1,
    toolmarks: 1,
    fasteners: 1,
    materials: 2,
    material: 2,
    hardware: 3,
    finish: 4,
    condition: 5,
    style: 6,
    structure: 6,
    form: 9,
    function: 9,
    context: 10,
  };

  const bannedPhrases = [
    "drawer evidence is visible",
    "drawers total visible",
    "chest has multiple drawers",
    "piece is a chest of drawers",
    "drawer storage",
  ];

  const evidence = [...digest.observations]
    .filter((o) => {
      const text = o.description.toLowerCase();
      if (bannedPhrases.some((p) => text.includes(p))) return false;
      return true;
    })
    .sort((a, b) => {
      const pa = priorityOrder[a.type] || 10;
      const pb = priorityOrder[b.type] || 10;
      if (pa !== pb) return pa - pb;
      return b.confidence - a.confidence;
    })
    .map((o) => o.description);

  const combined = [...evidence, ...formSupport];

  return uniq(combined).slice(0, 10);
}
function deriveStyleContext(digest: EvidenceDigest): string | null {
    const text = `${digest.perception?.raw_text || ""} ${digest.observations
    .map((o) => `${o.clue || ""} ${o.description}`)
    .join(" ")}`.toLowerCase();

  const has = (word: string) => text.includes(word);

  const not = (word: string) =>
    includesAny(text, [
      `no ${word}`,
      `not ${word}`,
      `without ${word}`,
      `${word} not`,
    ]);

  // Jacobean
  if (
    (has("barley twist") && !not("barley twist")) ||
    (has("heavy carving") && !not("heavy carving"))
  ) {
    return "Jacobean Revival";
  }

  // Queen Anne ONLY if clearly present
  if (
    (has("cabriole") && !not("cabriole")) ||
    (has("shell carving") && !not("shell"))
  ) {
    return "Queen Anne / Colonial Revival";
  }

  // Empire
  if (
    includesAny(text, ["empire", "scrolled feet", "ogee", "serpentine"]) &&
    !includesAny(text, ["not empire", "no empire"])
  ) {
    return "American Empire / late Classical Revival";
  }

  return null;
}

function dateFromEvidence(digest: EvidenceDigest, form: string) {
  const clues = new Set(digest.clue_keys);
  const style = deriveStyleContext(digest);
  const support = buildReportEvidenceSupport(digest, []);
  const limitations: string[] = [];

  const text = `${digest.perception?.raw_text || ""} ${digest.observations
    .map((o) => `${o.clue || ""} ${o.description}`)
    .join(" ")}`.toLowerCase();

  const has = (...keys: string[]) => keys.some((k) => clues.has(k));

  // Label/form-specific anchors stay first.
  if (clues.has("roos_label")) return { range: "c. 1940–1960", confidence: "High", support, limitations };
  if (clues.has("lane_label")) return { range: "c. 1930–1965", confidence: "High", support, limitations };
  if (form.includes("Telephone bench")) return { range: "c. 1900–1935", confidence: "High", support, limitations };
  if (form.includes("Iron bed")) return { range: "c. 1880–1920", confidence: "High", support, limitations };

  // True hard negatives only.
  const confirmedModernHardNegative = has(
    "phillips_screw",
    "staple_fastener",
    "modern_concealed_hinge",
    "plywood_structural",
    "plywood_drawer_bottom"
  );

  if (confirmedModernHardNegative) {
    return {
      range: has("modern_concealed_hinge") ? "post-1950" : has("staple_fastener") ? "post-1945" : has("phillips_screw") ? "post-1935" : "post-1920",
      confidence: "High",
      support,
      limitations,
    };
  }

  // Evidence groups, modeled from the older weighting file: construction/joinery outrank style.
  const traditionalConstructionScore =
    (has("solid_plank_back") ? 2 : 0) +
    (has("solid_wood_construction") ? 2 : 0) +
    (has("solid_wood_side_panels") ? 1.5 : 0) +
    (has("frame_and_panel_sides") ? 1.5 : 0) +
    (has("solid_wood_drawer_construction") ? 1.5 : 0) +
    (has("wooden_drawer_runners") ? 1.5 : 0) +
    (has("no_phillips_screws_observed") ? 0.5 : 0);

  const transitionalFactoryScore =
    (has("machine_dovetails") ? 2 : 0) +
    (has("dowel_joinery") ? 2 : 0) +
    (has("wire_nail") ? 1.5 : 0) +
    (has("band_saw_lines") ? 1.5 : 0) +
    (has("sheet_back_panel") ? 1 : 0) +
    (has("possible_plywood_or_laminated_panel") ? 0.5 : 0);

  const earlyHandmadeScore =
    (has("hand_cut_dovetails") ? 2.5 : 0) +
    (has("cut_nail") ? 2 : 0) +
    (has("hand_forged_nail") ? 3 : 0) +
    (has("pit_saw_marks") ? 3 : 0) +
    (has("slotted_handmade_screw") ? 2 : 0);

  const empireOrRevival =
    style === "American Empire / late Classical Revival" ||
    includesAny(text, ["empire", "scroll feet", "scrolled feet", "serpentine", "ogee", "turned wood knobs"]);
    const strongPre1920Signals =
    (has("solid_plank_back") ? 1 : 0) +
    (has("wooden_drawer_runners") ? 1 : 0) +
    (has("solid_wood_construction") ? 1 : 0) +
    (has("solid_wood_drawer_construction") ? 1 : 0);

  const absenceOfModern =
    !has("phillips_screw") &&
    !has("staple_fastener") &&
    !has("modern_concealed_hinge") &&
    !has("plywood_structural") &&
    !has("plywood_drawer_bottom");
  
    const phase0EarlyBias =
    includesAny(text, ["1850", "1860", "1870", "1880", "1890", "victorian", "transitional"]);
    const strongStyleAlignment =
  style === "American Empire / late Classical Revival" &&
  strongPre1920Signals >= 2 &&
  absenceOfModern;

if (strongStyleAlignment) {
  return {
    range: "c. 1870–1910",
    confidence: strongPre1920Signals >= 3 ? "High" : "Moderate",
    support,
    limitations,
  };
}
    if (earlyHandmadeScore >= 3 && !transitionalFactoryScore) {
    return {
      range: "c. 1830–1890",
      confidence: "Moderate",
      support,
      limitations,
    };
  }
const strongPre1880Signals =
  (has("hand_cut_dovetails") ? 1 : 0) +
  (has("cut_nail") ? 1 : 0) +
  (has("hand_forged_nail") ? 1 : 0) +
  (has("pit_saw_marks") ? 1 : 0);

if (empireOrRevival && strongPre1880Signals >= 2) {
  return {
    range: "c. 1830–1860",
    confidence: "Moderate",
    support,
    limitations: [
      "Style strongly matches Empire period; confirmation of early fasteners or joinery would increase confidence.",
    ],
  };
}

  const trueEarlyEmpireEvidence =
    earlyHandmadeScore >= 2 ||
    has("hand_cut_dovetails") ||
    has("cut_nail") ||
    has("hand_forged_nail") ||
    has("pit_saw_marks") ||
    has("slotted_handmade_screw");

  const revivalEvidence =
    has("oak_primary") ||
    has("solid_wood_drawer_construction") ||
    has("wire_nail") ||
    has("machine_dovetails") ||
    has("dowel_joinery") ||
    has("band_saw_lines") ||
    includesAny(text, ["oak", "quartersawn", "quarter sawn", "late victorian", "revival"]);

  if (trueEarlyEmpireEvidence && !revivalEvidence) {
    return {
      range: "c. 1830–1860",
      confidence: "Moderate",
      support,
      limitations: [
        "Empire-period styling is supported, but confirmation from drawer joinery, fasteners, or tool marks would strengthen the date.",
      ],
    };
  }

  if (trueEarlyEmpireEvidence && revivalEvidence) {
    return {
      range: "c. 1830–1860 possible; c. 1890–1920 also plausible",
      confidence: "Low",
      support,
      limitations: [
        "The piece shows Empire styling plus mixed construction/material evidence. Close drawer-corner, fastener, and underside photos are needed to separate original Empire from later revival production.",
      ],
    };
  }
const conflictingSignals =
  has("possible_plywood_or_laminated_panel") &&
  has("solid_wood_construction");
  if (absenceOfModern && strongPre1920Signals >= 2) {
    return {
      range: conflictingSignals ? "c. 1900–1930" : "c. 1890–1920",
      confidence: conflictingSignals ? "Moderate" : "Moderate",
      support,
      limitations: [
        "No confirmed modern materials are visible, but early handmade joinery or fasteners are not confirmed. Treat this as likely revival or transitional production unless stronger early construction evidence appears.",
      ],
    };
  }

if (conflictingSignals) {
  limitations.push(
    "Conflicting panel signals detected; solid wood vs possible laminated construction should be verified."
  );
}
  return {
    range: "c. 1890–1930",
    confidence: "Moderate",
    support,
    limitations,
  };

  if (traditionalConstructionScore >= 3) {
    return {
      range: "late 19th to early 20th century",
      confidence: "Moderate",
      support,
      limitations,
    };
  }

  if (transitionalFactoryScore >= 2) {
    return {
      range: "c. 1880–1935",
      confidence: "Moderate",
      support,
      limitations,
    };
  }

  return {
    range: style ? "Broadly late 19th to 20th century" : "Broad, not tightly dated",
    confidence: "Low",
    support,
    limitations: ["More construction, underside, back, or label evidence would refine the date."],
  };
}

function valueBand(form: string, dateRange: string, digest?: EvidenceDigest) {
  let low = 25;
  let high = 300;

  const f = String(form || "").toLowerCase();
  const d = String(dateRange || "").toLowerCase();
  const clues = new Set(digest?.clue_keys || []);
  const text = `${digest?.perception?.raw_text || ""} ${(digest?.observations || [])
    .map((o) => `${o.clue || ""} ${o.description}`)
    .join(" ")}`.toLowerCase();

  const has = (...keys: string[]) => keys.some((k) => clues.has(k));
  const textHas = (...words: string[]) => words.some((w) => text.includes(w));

  // Base form lanes
  if (f.includes("telephone bench")) {
    low = 60; high = 325;
  } else if (f.includes("cedar chest") || f.includes("roos") || f.includes("lane")) {
    low = 60; high = 300;
  } else if (f.includes("iron bed")) {
    low = 40; high = 225;
  } else if (f.includes("queen anne")) {
    low = 50; high = 300;
  } else if (f.includes("jacobean")) {
    low = 125; high = 550;
  } else if (f.includes("pedestal")) {
    low = 35; high = 175;
  } else if (f.includes("cabinet") || f.includes("dresser") || f.includes("drawers") || f.includes("chest of drawers")) {
    low = 75; high = 350;
  }

  // Date / age influence
  let ageFactor = 1;
  if (d.includes("1830") || d.includes("1860")) ageFactor *= 1.15;
  else if (d.includes("1870") || d.includes("1890") || d.includes("1910") || d.includes("1920")) ageFactor *= 1.08;
  else if (d.includes("post-1950") || d.includes("post-1960") || d.includes("1980")) ageFactor *= 0.75;

  // Sellability score: market reality, not theoretical appraisal value
  let sellability = 50;

  // Non-wood material adjustments
  if (has("molded_plastic", "acrylic_clear")) {
    low = Math.max(low, 30);
    high = Math.min(high, 300);
    sellability += 5;
  }

  if (has("laminate_surface", "formica_surface", "chrome_and_laminate")) {
    low = Math.max(low, 60);
    high = Math.min(high, 450);
    sellability += 8;
  }

  if (has("woven_body", "rattan_frame")) {
    low = Math.max(low, 75);
    high = Math.min(high, 500);
    sellability += 10;
  }

  if (has("fully_upholstered", "visible_springs", "tufted_upholstery")) {
    low = Math.max(low, 75);
    high = Math.min(high, 600);
    sellability += 6;
  }

  if (has("metal_frame", "wrought_iron", "cast_iron", "brass_frame")) {
    low = Math.max(low, 50);
    high = Math.min(high, 400);
    sellability += 6;
  }

  if (has("tubular_steel", "chrome_frame")) {
    low = Math.max(low, 120);
    high = Math.max(high, 900);
    sellability += 12;
  }

  if (has("glass_top")) {
    sellability += 2;
  }

  if (has("laminate_surface") && has("molded_plastic")) {
    sellability -= 5;
  }

  // Positive signals
  if (has("solid_wood_construction")) sellability += 5;
  if (has("solid_plank_back")) sellability += 5;
  if (has("frame_and_panel_sides")) sellability += 4;
  if (has("solid_wood_drawer_construction")) sellability += 4;
  if (has("maker_label", "roos_label", "lane_label")) sellability += 8;
  if (textHas("empire", "jacobean", "mission", "arts and crafts", "queen anne")) sellability += 4;
  if (textHas("unusual", "scarce", "rare", "highboy", "telephone")) sellability += 5;

  // Market dampeners
  if (f.includes("dresser") || f.includes("drawers") || f.includes("chest of drawers")) sellability -= 8;
  if (textHas("finish loss", "finish_worn", "worn finish", "water stain", "white haze")) sellability -= 12;
  if (textHas("scratches", "surface damage", "top_surface_damage", "top_surface_condition")) sellability -= 8;
  if (textHas("missing", "broken", "loose", "veneer loss", "structural damage")) sellability -= 15;
  if (has("possible_plywood_or_laminated_panel")) sellability -= 8;
  if (!has("hand_cut_dovetails", "machine_dovetails", "cut_nail", "wire_nail", "hand_forged_nail")) sellability -= 5;

  sellability = clamp(sellability, 20, 90);

  // Convert sellability into value pressure
  const marketFactor = 0.65 + sellability / 140;
  const finalLow = Math.round(low * ageFactor * marketFactor);
  const finalHigh = Math.round(high * ageFactor * marketFactor);

  const mid = (finalLow + finalHigh) / 2;

  return {
    dealer_buy: [
      Math.round(finalLow * 0.35),
      Math.round(finalLow * 0.75),
    ],
    quick_sale: [
      Math.round(finalLow * 0.65),
      Math.round(mid * 0.75),
    ],
    marketplace: [
      Math.round(mid * 0.65),
      Math.round(finalHigh * 0.9),
    ],
    as_found_retail: [
      Math.round(finalHigh * 0.8),
      Math.round(finalHigh * 1.15),
    ],
    restored_retail: [
      Math.round(finalHigh * 1.15),
      Math.round(finalHigh * 1.85),
    ],
    sellability_score: sellability,
  };
}

function fieldRecommendation(asking: any, low: number, high: number) {
  const price = Number(String(asking || "").replace(/[$,]/g, "").trim());
  if (!Number.isFinite(price) || price <= 0) return { recommendation: "CONSIDER", label: "CONSIDER", explanation: "No asking price was entered, so this recommendation stays conservative." };
  const margin = Math.round((low + high) / 2) - price;
  if (margin >= 175) return { recommendation: "BUY_NOW", label: "BUY NOW", explanation: "The estimated value lane supports a strong buy at the entered price." };
  if (margin >= 50) return { recommendation: "BUY", label: "BUY", explanation: "The piece appears promising at the entered price." };
  if (margin >= 0) return { recommendation: "CONSIDER", label: "CONSIDER", explanation: "There may be upside, but margin is limited." };
  return { recommendation: "PASS", label: "PASS", explanation: "The entered price appears high against the field-scan value lane." };
}
function buildDecisionGuidance(args: {
  gate: Phase1Gate;
  dating: any;
  form: any;
  conflict: any;
  valuation: any;
  digest: EvidenceDigest;
  intake: any;
}) {
  const { gate, form, conflict, valuation, digest, intake } = args;

  const text = `${digest.perception?.raw_text || ""} ${digest.observations
    .map((o) => `${o.clue || ""} ${o.description}`)
    .join(" ")} ${String(intake?.condition_notes || "")} ${String(intake?.known_alterations || "")}`.toLowerCase();

  const clues = new Set(digest.clue_keys || []);
  const has = (...keys: string[]) => keys.some((k) => clues.has(k));
  const textHas = (...words: string[]) => words.some((w) => text.includes(w));

  const negotiation: string[] = [];
  const selling: string[] = [];

  const addPair = (buyerTip: string, sellerTip: string) => {
    if (!negotiation.includes(buyerTip)) negotiation.push(buyerTip);
    if (!selling.includes(sellerTip)) selling.push(sellerTip);
  };

  negotiation.push("Verify the areas not shown in the photos before committing, especially underside, back, drawer corners, and fasteners.");
  selling.push("Use clear, level photos of the full form first, then add close-ups of construction, hardware, labels, and condition details.");

  if (gate.confidence_cap === "Low" || gate.confidence_cap === "Inconclusive") {
    addPair(
      "Use the limited evidence as negotiation leverage; the price should reflect that the identification and date are still broad.",
      "Reduce buyer hesitation by adding the missing evidence photos before listing, especially the strongest structural views."
    );
  } else if (gate.confidence_cap === "Moderate") {
    addPair(
      "Negotiate conservatively if the seller is pricing it as a confirmed antique without enough structural proof.",
      "Present the identification as evidence-supported but avoid overstating certainty beyond the visible construction clues."
    );
  } else {
    addPair(
      "The evidence is stronger than average, so negotiate from market reality rather than trying to dismiss the identification.",
      "Lead with the strongest confirmed evidence because it gives buyers confidence in the identification."
    );
  }

  if (textHas("finish loss", "worn finish", "water stain", "white haze", "scratches", "surface damage", "veneer loss", "missing", "broken", "loose", "structural damage")) {
    addPair(
      "Use visible wear, damage, missing parts, or loose structure as fair reasons to ask for a lower price.",
      "Do not frame condition problems as strengths; clean, stabilize, and photograph them honestly while emphasizing stronger form and construction features."
    );
  }

  if (textHas("refinished", "polyurethane", "later finish", "painted", "paint loss") || has("polyurethane")) {
    addPair(
      "If the surface appears refinished or later-treated, negotiate below prices for untouched original finish examples.",
      "Describe the surface honestly and focus the listing on form, usability, construction, and decorative appeal rather than original finish."
    );
  }

  if (textHas("replacement hardware", "replaced hardware", "hardware replacement") || has("phillips_screw", "staple_fastener", "modern_concealed_hinge")) {
    addPair(
      "Use modern or replacement hardware as a reason to avoid paying full original-period pricing.",
      "If hardware may be replaced, avoid calling it all original; instead, highlight the structure, form, and any hardware that is clearly period-appropriate."
    );
  }

  if (has("solid_wood_construction", "solid_plank_back", "frame_and_panel_sides", "hand_cut_dovetails", "machine_dovetails", "cut_nail", "wire_nail", "mortise_and_tenon")) {
    addPair(
      "Acknowledge the stronger construction evidence, but still compare the price to realistic local resale rather than theoretical antique value.",
      "Highlight the strongest construction clues in the listing because informed buyers respond to visible evidence."
    );
  }

  if (has("metal_frame", "tubular_steel", "wrought_iron", "cast_iron", "brass_frame", "chrome_frame")) {
    addPair(
      "For metal furniture, check welds, bends, plating wear, rust, and structural looseness before agreeing to the price.",
      "For metal furniture, highlight clean lines, original finish or plating, stable joints, and any distinctive design features."
    );
  }

  if (has("fully_upholstered", "visible_springs", "tufted_upholstery")) {
    addPair(
      "For upholstered pieces, use fabric wear, odor risk, spring condition, and reupholstery cost as negotiation points.",
      "For upholstered pieces, photograph the full silhouette, legs, frame clues, tufting, fabric condition, and underside construction if accessible."
    );
  }

  if (has("woven_body", "rattan_frame", "cane_panels")) {
    addPair(
      "For wicker, rattan, or cane, negotiate based on breaks, sagging, missing strands, brittle areas, and repair difficulty.",
      "For wicker, rattan, or cane, highlight intact weaving, attractive shape, light weight, porch/sunroom appeal, and any unusual form."
    );
  }

  if (has("maker_label", "roos_label", "lane_label")) {
    addPair(
      "A maker label improves confidence, so focus negotiation more on condition, demand, and resale margin than on identity.",
      "Photograph the label clearly and mention it early in the listing because labels reduce buyer uncertainty."
    );
  }

  const formText = String(form?.display_form || form?.form || "").toLowerCase();

  if (formText.includes("dresser") || formText.includes("chest of drawers") || formText.includes("drawer case")) {
    addPair(
      "Large drawer cases can be slower to sell; use size, transport difficulty, and local demand as negotiation points.",
      "Measure it clearly and show scale; for drawer cases, buyers need to know it will fit and that drawers operate properly."
    );
  }

  if (formText.includes("telephone bench") || formText.includes("writing bench")) {
    addPair(
      "Because this is a niche form, negotiate based on how quickly you realistically expect to resell it.",
      "Use the unusual function as a selling hook; photograph the seat, back, and side writing or phone surface together."
    );
  }

  if (formText.includes("desk") || formText.includes("secretary") || formText.includes("roll-top") || formText.includes("slant-front")) {
    addPair(
      "Check writing surfaces, cubbies, hinges, and moving parts before paying; repairs can quickly reduce margin.",
      "Show the writing surface open and closed, plus interior compartments, because function drives buyer interest."
    );
  }

  if (formText.includes("table")) {
    addPair(
      "Check wobble, leaf movement, repairs, and top condition before agreeing to the price.",
      "Photograph the top, base, and any extension or leaf mechanism; table buyers care about stability and usable surface."
    );
  }

  const marketplace = valuation?.platform_breakdown?.marketplace?.range || valuation?.display;
  if (marketplace) {
    negotiation.push(`Use the marketplace lane as the practical ceiling for negotiation; this scan points to about ${marketplace} for typical resale exposure.`);
    selling.push(`Price near the realistic marketplace lane, about ${marketplace}, unless better photos or stronger evidence justify the upper end.`);
  }

  if (typeof valuation?.sellability_score === "number") {
    if (valuation.sellability_score < 45) {
      addPair(
        "Because sellability is weak, only buy if the price leaves room for a slow sale or added cleanup work.",
        "Improve sellability before listing with better photos, light cleaning, accurate measurements, and honest condition notes."
      );
    } else if (valuation.sellability_score >= 70) {
      addPair(
        "The piece appears reasonably sellable, so do not expect extreme discounts unless condition or transport issues are present.",
        "Lean into the piece’s strongest visual and evidence-supported features; the sellability score suggests there is buyer interest if priced realistically."
      );
    }
  }

  if (Array.isArray(conflict?.conflict_notes) && conflict.conflict_notes.length > 0) {
    addPair(
      "Use mixed evidence or possible restoration as a reason to stay below top-of-market pricing.",
      "Explain mixed evidence plainly; buyers trust listings that separate confirmed construction from possible later changes."
    );
  }

  if (negotiation.length < 4) {
    negotiation.push("Leave room for transportation, cleaning, small repairs, and the time it may take to resell.");
  }

  if (selling.length < 4) {
    selling.push("Include dimensions, clear condition photos, and the strongest identification evidence in the first few listing lines.");
  }

  return {
    negotiation_tips: uniq(negotiation).slice(0, 6),
    selling_tips: uniq(selling).slice(0, 6),
    contradiction_guard: "Buyer-facing weaknesses are framed as negotiation leverage; seller-facing weaknesses are framed as items to disclose, mitigate, or photograph honestly rather than as selling strengths.",
  };
}
export const PE = {
  async callClaude(system: string, content: any[]): Promise<ClaudeResult> {
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          system,
          messages: [{ role: "user", content }],
        }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data };
      const raw = Array.isArray(data?.content) ? data.content.map((b: any) => b?.text || "").join("\n") : "";
      const parsed = parseModelJson(raw);

if (parsed) {
  return { ok: true, parsed, raw };
}

console.log("CLAUDE RAW NON-JSON RESPONSE:", raw);

return {
  ok: false,
  error: {
    type: "no_valid_json",
    raw,
  },
};
    } catch (e: any) {
      return { ok: false, error: e?.message || "unknown_error" };
    }
  },

  imgs(images: any[]) {
    const out: any[] = [];
    for (const img of images || []) {
      if (!img?.data_url) continue;
      const [head, base] = String(img.data_url).split(",");
      const mediaType = head?.match(/data:(.*?);/)?.[1] || "image/jpeg";
      out.push({ type: "image", source: { type: "base64", media_type: mediaType, data: base } });
      out.push({ type: "text", text: `[Image type: ${img.image_type || "unknown"}]` });
    }
    return out;
  },

  async p0(caseData: any, images: any[], intake: any, onPhase?: any) {
    const system = `
You are the Phase 0 evidence scanner for New Creations Woodcraft.

You scan the submitted photos ONE TIME ONLY.

Your job is NOT final identification or valuation.
Your job is to extract and store visible evidence in a structured way so later phases can reason from it.

Return JSON only.

You MUST return this exact structure:

{
  "perception": {
    "labels": [],
    "maker_names": [],
    "materials": [],
    "forms": [],
    "functional_features": [],
    "style_cues": [],
    "construction_cues": [],
    "condition_cues": [],
    "visible_text": []
  },
  "observations": [
    {
      "category": "form | function | structure | material | hardware | style | label | condition | construction",
      "key": "short_snake_case_key",
      "value": "visible fact or true/false",
      "description": "plain evidence statement",
      "confidence": 0-100,
      "source_image": "overall_front | overall_side | underside | back | hardware_closeup | joinery_closeup | label_makers_mark | unknown",
      "hard_negative": false
    }
  ]
}

Minimum evidence contract:
Even when uncertain, you MUST return low-confidence observations rather than an empty list.

Always check for and report:

FORM SIGNALS:
- seating surface
- flat surface
- secondary surface
- backrest
- side rails
- vertical supports
- drawers
- doors
- shelves
- mirror
- pedestal / column
- bed rails / headboard / footboard

FUNCTION SIGNALS:
- sitting
- writing
- storage
- display
- sleeping
- telephone use
- grooming / dressing
- mechanical function

STRUCTURAL SIGNALS:
- legs
- rails
- stretchers
- spindles
- backrest
- hinges
- panels
- frame members
- visible joinery
- visible fasteners

Important reasoning rules:
- Functional features outrank storage features.
- Do not call a telephone bench or secretary combination a dresser just because drawers are present.
- A bench seat + raised writing/phone surface + backrest should be captured as possible telephone/writing bench evidence.
- A drop-front writing surface or cubbies should be captured as secretary/desk evidence.
- Labels and maker marks are highest-authority evidence.
- Use low confidence if uncertain, but do not omit visible form evidence.

Preferred keys when applicable:
seating_surface, backrest_present, spindle_back, secondary_surface, writing_surface, telephone_shelf, drop_front_desk, pigeonholes, mirror_present, drawer_present, door_present, open_shelving, pedestal_column, metal_bed_frame, armchair_form, cabriole_leg, barley_twist, roos_label, maker_label, cedar_lining, sheet_back_panel, phillips_screw, plywood_structural.
`;

    const result = await this.callClaude(system, [
      ...this.imgs(images),
      { type: "text", text: `Intake context: ${buildIntakeSummary(intake)}` },
    ]);

    const parsedForEvidence = result.ok
  ? result.parsed
  : result.error && result.error.raw
  ? parseModelJson(String(result.error.raw).replace(/^json\s*/i, "")) || {
      perception: {
        labels: [],
        maker_names: [],
        materials: [],
        forms: [],
        functional_features: [],
        style_cues: [],
        construction_cues: [],
        condition_cues: [],
        visible_text: [],
      },
      observations: [
        {
          category: "context",
          key: "phase0_extraction_limited",
          description:
            "Phase 0 did not return clean structured evidence. The report relies on available intake and visible form signals.",
          confidence: 20,
          source_image: "unknown",
          hard_negative: false,
        },
      ],
    }
  : {};

let observations = normalizeObservationsFromParsed(parsedForEvidence);
let perception = normalizePerception(parsedForEvidence, observations);
observations = addIntakeObservations(intake, observations);
observations = promotePerceptionObservations(observations, perception);
perception = normalizePerception(parsedForEvidence, observations);
    const digest = buildEvidenceDigest(observations, perception);

    observations.forEach((obs) => {
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
    });

    const res = {
      ok: true,
      observations,
      perception,
      evidence_digest: digest,
      note: result.ok ? "Phase 0 scanned photos once and stored evidence." : "Phase 0 used limited intake-derived evidence because extraction failed.",
      raw_error: result.ok ? null : result.error,
    };
    onPhase?.("p0", res);
    return res;
  },

  p1(caseData: any, intake: any, digest: EvidenceDigest, images: any[]): Phase1Gate {
    const missing = computeMissingEvidence(images);
    const count = digest.observation_count;
    const hasLabel = digest.clue_keys.some((k) => k.includes("label"));
    const hasForm = (digest.by_type.form || []).length > 0;
    const hasConstruction = ["construction", "joinery", "toolmarks", "fasteners", "materials"].some((t) => (digest.by_type[t] || []).length > 0);

    let pct = 40;
    if (count >= 4) pct += 15;
    if (hasForm) pct += 15;
    if (hasConstruction) pct += 15;
    if (hasLabel) pct += 20;
    pct = clamp(pct, 25, 94);

    const next: string[] = [];

const hasDatingEvidence = digest.clue_keys.some((k) =>
  [
    "hand_cut_dovetails",
    "machine_dovetails",
    "cut_nail",
    "wire_nail",
    "hand_forged_nail",
    "phillips_screw",
    "staple_fastener",
    "solid_plank_back",
    "solid_wood_construction",
    "plywood_structural",
    "plywood_drawer_bottom",
  ].includes(k)
);

const hasDrawerCase =
  digest.clue_keys.includes("drawer_present") ||
  digest.clue_keys.includes("multiple_drawer_case");

const hasPossiblePanelConflict =
  digest.clue_keys.includes("possible_plywood_or_laminated_panel") ||
  digest.perception?.raw_text?.toLowerCase().includes("plywood_or_solid");

if (hasPossiblePanelConflict) {
  next.push("Close-up of side panel edge to confirm solid wood vs. plywood or laminate");
}

if (hasDrawerCase) {
  next.push("Clear drawer-corner close-up to confirm dovetail, dado, nailed, or butt construction");
}

if (missing.underside_photo) {
  next.push("Underside photo for fasteners, tool marks, drawer runners, and case construction");
}

if (!hasDatingEvidence && missing.hardware_photo) {
  next.push("Hardware or fastener close-up if screws, nails, locks, hinges, or casters are visible");
}

if (missing.back_photo) {
  next.push("Back photo for backboard, panel, and material evidence");
}

if (missing.label_photo) {
  next.push("Maker's mark or label, if present");
}
 
    return {
      confidence_cap: toConfidenceBand(pct),
      confidence_cap_pct: pct,
      missing_evidence: missing,
      evidence_sufficiency_summary: hasLabel
        ? "Label evidence gives the assessment a strong anchor."
        : hasForm
        ? "Visible form evidence supports a working identification; structural details can refine date and originality."
        : "Evidence remains broad; more visible form or construction detail would improve the result.",
      can_run: { dating: count > 0, form: count > 0, weighting: count > 0, conflict_check: count > 1, valuation_ready: count > 1 },
      next_best_evidence: uniq(next).slice(0, 5),
    };
  },

  p2(digest: EvidenceDigest, gate: Phase1Gate) {
    const ranked = scoreForms(digest);
    const best = ranked[0];
    const form = best?.form || "Unclassified furniture";
    return dateFromEvidence(digest, form);
  },

  p3(digest: EvidenceDigest, gate: Phase1Gate, intake: any) {
    const ranked = scoreForms(digest);
    const best = ranked[0];
    const alternatives = ranked.slice(1, 4).map((r) => r.form);
    const style =
  deriveStyleContext(digest) ||
  (digest.clue_keys.includes("victorian_style") ? "Victorian" : null);
    const form = best?.form || "Unclassified furniture";
    const confidencePct = best ? Math.min(gate.confidence_cap_pct, best.score >= 80 ? 90 : best.score >= 45 ? 72 : 48) : 35;

    return {
      form,
      display_form: style && !form.toLowerCase().includes(style.toLowerCase()) ? `${form}` : form,
      style_context: style,
      confidence: toConfidenceBand(confidencePct),
      support: buildReportEvidenceSupport(digest, best?.support || []),
      alternatives,
    };
  },

 p4(digest: EvidenceDigest) {
  const AUTHORITY_RANK: Record<string, number> = {
    construction: 10,
    joinery: 9,
    toolmarks: 8,
    fasteners: 8,
    materials: 6,
    hardware: 6,
    label: 10,
    form: 7,
    function: 7,
    structure: 7,
    finish: 4,
    alteration: 4,
    style: 3,
    context: 2,
    other: 2,
  };

  const REPLACEMENT_RISK: Record<string, number> = {
    modern_concealed_hinge: 0.1,
    phillips_screw: 0.1,
    staple_fastener: 0.05,
    plywood_structural: 0.02,
    plywood_drawer_bottom: 0.02,

    decorative_bail_pull: 0.45,
    porcelain_caster: 0.35,
    round_wood_knob: 0.4,

    shellac_crazing: 0.2,
    polyurethane: 0.15,

    cabriole_leg: 0.25,
    shell_carving: 0.25,
    claw_or_pad_foot: 0.3,
    barley_twist: 0.25,
    heavy_carving: 0.25,
  };

  const DATE_HINTS: Record<string, string> = {
    hand_forged_nail: "pre-1800",
    cut_nail: "1790–1890",
    wire_nail: "post-1880",
    phillips_screw: "post-1934",
    staple_fastener: "post-1945",
    hand_cut_dovetails: "pre-1860",
    machine_dovetails: "post-1860",
    dowel_joinery: "post-1900",
    pit_saw_marks: "pre-1830",
    circular_saw_arcs: "post-1830",
    band_saw_lines: "post-1870",
    plywood_structural: "post-1920",
    plywood_drawer_bottom: "post-1920",
    sheet_back_panel: "post-1900",
    modern_concealed_hinge: "post-1950",
    shellac_crazing: "1800–1920",
    polyurethane: "post-1960",
    thick_veneer: "pre-1910",
    porcelain_caster: "1830–1900",
    cylinder_roll: "1870–1920",
    slant_front: "1700–1860",
    gateleg_support: "1680–1800; revival 1880–1930",
    drop_leaf_hinged: "1720–1930",
  };

  const photoCounts: Record<string, Set<string>> = {};

  digest.observations.forEach((o) => {
    const clue = o.clue || o.description;
    if (!photoCounts[clue]) photoCounts[clue] = new Set();
    if (o.source_image) photoCounts[clue].add(o.source_image);
  });

  const weighted_clues = digest.observations
    .map((o) => {
      const meta = o.clue ? CLUE_LIBRARY[o.clue] : undefined;
      const clue = o.clue || o.description;
      const category = meta?.category || o.type || "context";

      const base = meta?.weight ?? 0.45;
      const authority = AUTHORITY_RANK[category] || 2;
      const effectiveConfidence = clamp(o.confidence / 100, 0.05, 0.99);
      const replacementRisk = REPLACEMENT_RISK[clue] ?? 0.2;
      const photoCount = photoCounts[clue]?.size || 1;

      let adjusted = base;

      if (authority >= 9) adjusted += 0.07;
      else if (authority >= 7) adjusted += 0.04;
      else if (authority <= 3) adjusted -= 0.08;

      if (effectiveConfidence >= 0.8) adjusted += 0.06;
      else if (effectiveConfidence >= 0.6) adjusted += 0.03;
      else if (effectiveConfidence < 0.4) adjusted -= 0.1;

      if (photoCount >= 3) adjusted += 0.08;
      else if (photoCount === 2) adjusted += 0.04;

      if (replacementRisk >= 0.35) adjusted -= replacementRisk * 0.22;

      if (o.low_confidence_flag) adjusted -= 0.05;

      if (o.hard_negative || meta?.hardNegative) adjusted = Math.max(adjusted, 0.88);

      adjusted = clamp(adjusted, 0.05, 0.98);

      const reasons: string[] = [];
      reasons.push(meta?.dateHint || DATE_HINTS[clue] || "contextual evidence");
      reasons.push(`authority ${authority}/10`);
      if (photoCount > 1) reasons.push(`seen in ${photoCount} photo types`);
      if (replacementRisk >= 0.35) reasons.push(`replacement risk ${Math.round(replacementRisk * 100)}%`);
      if (o.hard_negative || meta?.hardNegative) reasons.push("hard negative");

      return {
        clue,
        display_label: clue.replace(/_/g, " "),
        category,
        authority_rank: authority,
        date_hint: meta?.dateHint || DATE_HINTS[clue] || null,
        replacement_risk: replacementRisk,
        base_weight: Number(base.toFixed(3)),
        adjusted_weight: Number(adjusted.toFixed(3)),
        confidence_reason: `${o.description} (${reasons.join("; ")})`,
        hard_negative: Boolean(o.hard_negative || meta?.hardNegative),
        effective_confidence: Number(effectiveConfidence.toFixed(3)),
        source_images: o.source_image ? [o.source_image] : [],
      };
    })
    .sort((a, b) => {
      if (a.hard_negative && !b.hard_negative) return -1;
      if (!a.hard_negative && b.hard_negative) return 1;
      if (b.authority_rank !== a.authority_rank) return b.authority_rank - a.authority_rank;
      return b.adjusted_weight - a.adjusted_weight;
    });

  const categoryMap: Record<string, { sum: number; count: number; maxAuthority: number }> = {};

  weighted_clues.forEach((w) => {
    if (!categoryMap[w.category]) {
      categoryMap[w.category] = { sum: 0, count: 0, maxAuthority: 0 };
    }
    categoryMap[w.category].sum += w.adjusted_weight;
    categoryMap[w.category].count += 1;
    categoryMap[w.category].maxAuthority = Math.max(categoryMap[w.category].maxAuthority, w.authority_rank);
  });

  const category_scores = Object.entries(categoryMap)
    .map(([category, v]) => ({
      category,
      avg_weight: Number((v.sum / v.count).toFixed(3)),
      count: v.count,
      authority_rank: v.maxAuthority,
      score: Math.round((v.sum / v.count) * 100),
    }))
    .sort((a, b) => {
      if (b.authority_rank !== a.authority_rank) return b.authority_rank - a.authority_rank;
      return b.score - a.score;
    });

  return {
    weighted_clues,
    confidence_drivers: {
      increased: weighted_clues
        .filter((w) => !w.hard_negative && w.adjusted_weight >= 0.65)
        .slice(0, 5)
        .map((w) => `${w.display_label} — ${w.confidence_reason}`),
      limited: weighted_clues
        .filter((w) => w.hard_negative || w.adjusted_weight < 0.5)
        .slice(0, 5)
        .map((w) => w.hard_negative ? `${w.display_label} — hard negative` : `${w.display_label} — limited weight`),
    },
    category_scores,
  };
},
p5(digest: EvidenceDigest, weighting: any, dating: any, form: any) {
  const { weighted_clues } = weighting;

  const highAuthority = weighted_clues.filter(w => w.authority_rank >= 8);
  const lowAuthority = weighted_clues.filter(w => w.authority_rank <= 4);
  const hardNegatives = weighted_clues.filter(w => w.hard_negative);

  const conflicts: string[] = [];
  const resolutions: string[] = [];

  // Detect conflicts
  highAuthority.forEach((strong) => {
    lowAuthority.forEach((weak) => {
      if (
        strong.date_hint &&
        weak.date_hint &&
        strong.date_hint !== weak.date_hint
      ) {
        conflicts.push(
          `${weak.display_label} (${weak.date_hint}) conflicts with ${strong.display_label} (${strong.date_hint})`
        );

        // Resolve by authority
        resolutions.push(
          `${strong.display_label} carries greater authority (${strong.authority_rank}/10) and is favored over ${weak.display_label}.`
        );
      }
    });
  });

  // Hard negative overrides
  hardNegatives.forEach((hn) => {
    resolutions.push(
      `${hn.display_label} is a hard-negative indicator and overrides conflicting stylistic or lower-authority evidence.`
    );
  });

  // Replacement logic
  weighted_clues.forEach((w) => {
    if (w.replacement_risk >= 0.35 && w.authority_rank <= 6) {
      resolutions.push(
        `${w.display_label} has elevated replacement risk and is down-weighted in interpretation.`
      );
    }
  });

  // Consolidated summary
  const summary =
    resolutions.length > 0
      ? "Conflicts were resolved by prioritizing higher-authority construction and structural evidence over stylistic or replaceable features."
      : "No significant conflicts detected between evidence categories.";

  return {
    conflicts: conflicts.slice(0, 6),
    resolutions: resolutions.slice(0, 6),
    summary,
  };
},

 p6(gate: any, dating: any, form: any, weighting: any, conflict: any, digest?: EvidenceDigest) {
  const vb = valueBand(
    form.display_form || form.form || "Unknown",
    dating.range || "",
    digest
  );

  const moneyRange = (range: number[]) => `$${range[0]} – $${range[1]}`;

  const valuationBreakdown = {
    dealer_buy: {
      label: "Dealer Buy / Trade-In",
      range: moneyRange(vb.dealer_buy),
      note: "Conservative acquisition range for a reseller who needs margin.",
    },
    quick_sale: {
      label: "Quick Local Sale",
      range: moneyRange(vb.quick_sale),
      note: "Likely fast-sale range for local pickup or limited marketing.",
    },
    marketplace: {
      label: "Standard Marketplace",
      range: moneyRange(vb.marketplace),
      note: "Likely general resale range with average photos, description, and local exposure.",
    },
    as_found_retail: {
      label: "As-Found Retail",
      range: moneyRange(vb.as_found_retail),
      note: "Likely curated retail or antique-shop range without full restoration.",
    },
    restored_retail: {
      label: "Restored Retail",
      range: moneyRange(vb.restored_retail),
      note: "Potential upper range after appropriate restoration, presentation, and patient selling.",
    },
  };

  return {
    supported_findings: [
      `The strongest supported reading is ${form.display_form || form.form}.`,
      `Current dating evidence supports ${dating.range}.`,
      `Marketplace resale lane: ${valuationBreakdown.marketplace.range}.`,
      `Full valuation breakdown: Dealer Buy ${valuationBreakdown.dealer_buy.range}; Quick Sale ${valuationBreakdown.quick_sale.range}; Marketplace ${valuationBreakdown.marketplace.range}; As-Found Retail ${valuationBreakdown.as_found_retail.range}; Restored Retail ${valuationBreakdown.restored_retail.range}.`,
      `Sellability score: ${vb.sellability_score}/100.`,
    ],
    tentative_findings: [
      ...(conflict.conflicts || []),
      ...(conflict.resolutions || []),
    ],
    more_evidence_needed: gate.next_best_evidence || [],
    summary: `Evidence-first result: ${form.display_form || form.form}. Dating: ${dating.range}. ${conflict.summary || gate.evidence_sufficiency_summary}`,
    valuation: {
      ...vb,
      display: valuationBreakdown.marketplace.range,
      low: vb.marketplace[0],
      high: vb.marketplace[1],
      platform_breakdown: valuationBreakdown,
    },
  };
},

async runAllPhases(caseData: any, images: any[], intake: any, onPhase?: any) {
  const stage_outputs: Record<string, any> = {};

  const p0 = await this.p0(caseData, images, intake, onPhase);
  stage_outputs.p0 = p0;

  console.log("----- PHASE 0 DEBUG START -----");
  console.log("P0 RAW ERROR:", p0.raw_error);
  console.log("P0 PERCEPTION:", p0.perception);
  console.log("P0 OBSERVATIONS:", p0.observations);
  console.log("IMAGES PASSED TO P0:", images);
  console.log("----- PHASE 0 DEBUG END -----");

  if (!p0.observations || p0.observations.length === 0) {
    p0.observations = [
      {
        type: "form",
        clue: "fallback_form",
        description: "Furniture is visible, but Phase 0 did not return structured observations.",
        confidence: 20,
        source_image: "fallback",
        hard_negative: false,
        low_confidence_flag: true,
      },
    ];
  }

  p0.evidence_digest = buildEvidenceDigest(p0.observations, p0.perception);
  const digest = p0.evidence_digest;

  const p1 = this.p1(caseData, intake, digest, images);
  stage_outputs.p1 = p1; onPhase?.("p1", p1);

  const p2 = this.p2(digest, p1);
  stage_outputs.p2 = p2; onPhase?.("p2", p2);

  const p3 = this.p3(digest, p1, intake);
  stage_outputs.p3 = p3; onPhase?.("p3", p3);

  const p4 = this.p4(digest);
  stage_outputs.p4 = p4; onPhase?.("p4", p4);

  const p5 = this.p5(digest, p4, p2, p3);
  stage_outputs.p5 = p5; onPhase?.("p5", p5);

  const p6 = this.p6(p1, p2, p3, p4, p5, digest);
stage_outputs.p6 = p6; onPhase?.("p6", p6);

const fieldValue = p6.valuation || valueBand(p3.display_form || p3.form, p2.range, digest);

const p7 = buildDecisionGuidance({
  gate: p1,
  dating: p2,
  form: p3,
  conflict: p5,
  valuation: fieldValue,
  digest,
  intake,
});

stage_outputs.p7 = p7; onPhase?.("p7", p7);

const recommendation = fieldRecommendation(
  intake?.asking_price,
  fieldValue.low,
  fieldValue.high
);
  return {
    id: caseData.id,
    status: "complete",
    analysis_mode: intake?.analysis_mode || caseData.analysis_mode || "full_analysis",
    stage_outputs,
    observations: digest.observations,
    evidence_digest: digest,
    final_report: p6.summary,
    field_scan: {
      identification: p3.display_form || p3.form,
      confidence: p3.confidence,
      date_range: p2.range,
      valueRange: fieldValue.display,
      recommendation: recommendation.recommendation,
      recommendation_display: recommendation.label,
      recommendation_reasoning: recommendation.explanation,
    },
  };
},
};
 
