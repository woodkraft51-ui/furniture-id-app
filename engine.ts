const HISTORICAL_CLUE_LIBRARY = {

  // ── Structural mechanisms ───────────────────────────────────
  drop_leaf_hinged: {
    indicator_text: "Hinged drop leaves are the defining feature of the drop-leaf table family, produced continuously in American furniture-making from approximately 1720 through the early twentieth century.",
    typical_date_range: "1720–1930",
    evidence_category: "construction",
    priority: 1,
  },
  gateleg_support: {
    indicator_text: "A pivoting gate-leg support was the primary mechanism for carrying drop leaves before the Pembroke bracket became common. Widely made circa 1680–1800 and revived in later Colonial Revival production circa 1880–1930.",
    typical_date_range: "1680–1800, revival 1880–1930",
    evidence_category: "construction",
    priority: 1,
  },
  rule_joint: {
    indicator_text: "The rule joint — a rounded interlocking profile at the leaf edge — required skilled handwork and is characteristic of furniture made before factory methods became dominant, generally pre-1870.",
    typical_date_range: "pre-1870",
    evidence_category: "joinery",
    priority: 2,
  },
  swing_leg: {
    indicator_text: "A swing-leg leaf support is associated with the Pembroke-style drop-leaf table, widely made from the Federal period through Victorian production, approximately 1780–1900.",
    typical_date_range: "1780–1900",
    evidence_category: "construction",
    priority: 2,
  },
  lift_lid: {
    indicator_text: "A hinged or removable top indicates a storage chest form. Blanket chests and storage trunks with this construction were produced throughout the eighteenth and nineteenth centuries.",
    typical_date_range: "1700–1900",
    evidence_category: "construction",
    priority: 1,
  },
  multiple_drawer_case: {
    indicator_text: "A stacked drawer case is one of the most consistently produced forms in American furniture, made continuously from approximately 1700 onward. Dating relies on joinery and fastener evidence.",
    typical_date_range: "1700–present",
    evidence_category: "construction",
    priority: 2,
  },
  slant_front: {
    indicator_text: "A slant-front writing surface was the standard desk form in the American colonial and Federal periods, remaining in active production through the mid-nineteenth century.",
    typical_date_range: "1700–1860",
    evidence_category: "construction",
    priority: 1,
  },
  cylinder_roll: {
    indicator_text: "A cylinder or tambour roll-top was closely associated with late Victorian office furniture. The form was produced primarily from approximately 1870 to 1920.",
    typical_date_range: "1870–1920",
    evidence_category: "construction",
    priority: 1,
  },
  pedestal_base: {
    indicator_text: "A single central pedestal supporting a top was used across several centuries for breakfast tables, tilt-top tables, and parlor tables. Dating depends on leg form and fasteners.",
    typical_date_range: "1780–1920",
    evidence_category: "construction",
    priority: 2,
  },

  // ── Hardware ────────────────────────────────────────────────
  porcelain_caster: {
    indicator_text: "Porcelain casters of this type were widely used on American furniture between approximately 1830 and 1900, and were gradually replaced by rubber-wheeled casters through the early twentieth century.",
    typical_date_range: "1830–1900",
    evidence_category: "hardware",
    priority: 1,
  },
  victorian_strap_hinge: {
    indicator_text: "Long decorative strap hinges in this style were widely associated with Victorian-era case furniture and chests, commonly used from approximately 1865 to 1895.",
    typical_date_range: "1865–1895",
    evidence_category: "hardware",
    priority: 2,
  },
  batwing_brass_pull: {
    indicator_text: "Bat-wing brass bail pulls with rosette backplates are strongly associated with the William and Mary and early Queen Anne periods, typically made from approximately 1720 to 1790.",
    typical_date_range: "1720–1790",
    evidence_category: "hardware",
    priority: 1,
  },
  eastlake_pull: {
    indicator_text: "Geometric incised brass hardware in the Eastlake style was fashionable during the Aesthetic Movement period, primarily used from approximately 1870 to 1890.",
    typical_date_range: "1870–1890",
    evidence_category: "hardware",
    priority: 2,
  },
  modern_concealed_hinge: {
    indicator_text: "Cup-style concealed hinges are a HARD NEGATIVE for antique claims — this hardware type was not produced before approximately 1950 and is a strong indicator of modern manufacture or replacement.",
    typical_date_range: "post-1950",
    evidence_category: "hardware",
    priority: 1,
    hard_negative: true,
  },

  // ── Fasteners ───────────────────────────────────────────────
  phillips_screw: {
    indicator_text: "Phillips-head screws were not in common use before approximately 1934. Their presence is a HARD NEGATIVE for any pre-1930 manufacture claim and strongly suggests either post-1935 production or later hardware replacement.",
    typical_date_range: "post-1934",
    evidence_category: "fasteners",
    priority: 1,
    hard_negative: true,
  },
  slotted_machine_screw: {
    indicator_text: "Slotted machine-cut screws with uniform threading were widely used from approximately 1840 onward and remained common until the widespread adoption of Phillips screws after the 1930s.",
    typical_date_range: "1840–1935",
    evidence_category: "fasteners",
    priority: 2,
  },
  slotted_handmade_screw: {
    indicator_text: "Hand-cut slotted screws with off-center slots and irregular threading are characteristic of early American manufacture, typically pre-1840, and are a strong indicator of period construction.",
    typical_date_range: "pre-1840",
    evidence_category: "fasteners",
    priority: 1,
  },
  cut_nail: {
    indicator_text: "Rectangular cut nails with a tapered cross-section were the dominant fastener in American furniture from approximately 1790 to 1890, when wire nails became widely available.",
    typical_date_range: "1790–1890",
    evidence_category: "fasteners",
    priority: 1,
  },
  wire_nail: {
    indicator_text: "Round wire nails with a uniform shank became widely available in the United States after approximately 1880 and quickly displaced cut nails in furniture production.",
    typical_date_range: "post-1880",
    evidence_category: "fasteners",
    priority: 2,
  },
  hand_forged_nail: {
    indicator_text: "Hand-forged nails with an irregular hammered head and four-sided taper are characteristic of pre-industrial construction and are a strong indicator of furniture made before approximately 1800.",
    typical_date_range: "pre-1800",
    evidence_category: "fasteners",
    priority: 1,
  },
  staple_fastener: {
    indicator_text: "U-shaped wire staples used as structural fasteners are a HARD NEGATIVE for antique claims — this fastener type was not used in furniture construction before approximately 1945.",
    typical_date_range: "post-1945",
    evidence_category: "fasteners",
    priority: 1,
    hard_negative: true,
  },

  // ── Joinery ─────────────────────────────────────────────────
  hand_cut_dovetails: {
    indicator_text: "Hand-cut dovetails with irregular spacing and slightly uneven angles are characteristic of pre-industrial craftsmanship, generally indicating furniture made before approximately 1860.",
    typical_date_range: "pre-1860",
    evidence_category: "joinery",
    priority: 1,
  },
  machine_dovetails: {
    indicator_text: "Perfectly uniform machine-cut dovetails became common after approximately 1860 and indicate factory or semi-factory production rather than individual hand craftsmanship.",
    typical_date_range: "post-1860",
    evidence_category: "joinery",
    priority: 2,
  },
  mortise_and_tenon: {
    indicator_text: "Mortise-and-tenon joinery was the standard structural method for American furniture from the earliest colonial period through the early twentieth century, offering limited dating value on its own.",
    typical_date_range: "1620–1920",
    evidence_category: "joinery",
    priority: 3,
  },
  dowel_joinery: {
    indicator_text: "Round wooden dowels as the primary structural joint became common after approximately 1900 and are associated with factory production methods rather than traditional hand craftsmanship.",
    typical_date_range: "post-1900",
    evidence_category: "joinery",
    priority: 2,
  },
  plywood_drawer_bottom: {
    indicator_text: "Plywood drawer bottoms are a HARD NEGATIVE for antique claims — plywood structural components were not used in furniture before approximately 1920, strongly indicating later production.",
    typical_date_range: "post-1920",
    evidence_category: "joinery",
    priority: 1,
    hard_negative: true,
  },

  // ── Toolmarks ───────────────────────────────────────────────
  circular_saw_arcs: {
    indicator_text: "Curved circular saw arc marks on secondary surfaces indicate post-1830 production. Water-powered circular saws became widespread in American mills by approximately 1840.",
    typical_date_range: "post-1830",
    evidence_category: "toolmarks",
    priority: 2,
  },
  pit_saw_marks: {
    indicator_text: "Irregular diagonal pit-saw marks on secondary surfaces indicate pre-industrial production, characteristic of furniture made before approximately 1830.",
    typical_date_range: "pre-1830",
    evidence_category: "toolmarks",
    priority: 1,
  },
  band_saw_lines: {
    indicator_text: "Fine straight parallel band-saw marks indicate post-1870 production. Band saws became widely available in American furniture factories from approximately 1870 onward.",
    typical_date_range: "post-1870",
    evidence_category: "toolmarks",
    priority: 2,
  },
  hand_plane_chatter: {
    indicator_text: "Subtle hand-plane chatter marks on secondary surfaces indicate hand preparation rather than machine planing, a characteristic of pre-industrial or small-shop production.",
    typical_date_range: "pre-1880",
    evidence_category: "toolmarks",
    priority: 3,
  },

  // ── Materials ───────────────────────────────────────────────
  thick_veneer: {
    indicator_text: "Thicker veneer construction is associated with earlier veneer-cutting techniques prior to the adoption of modern rotary veneer methods, generally indicating pre-1910 production.",
    typical_date_range: "pre-1910",
    evidence_category: "materials",
    priority: 2,
  },
  plywood_structural: {
    indicator_text: "Structural plywood panels are a HARD NEGATIVE for antique claims — plywood structural components were not available before approximately 1905 and were not common in furniture until after 1920.",
    typical_date_range: "post-1920",
    evidence_category: "materials",
    priority: 1,
    hard_negative: true,
  },
  poplar_secondary: {
    indicator_text: "Poplar as a secondary wood is particularly characteristic of nineteenth-century American furniture production, widely used from approximately 1820 through 1920.",
    typical_date_range: "1820–1920",
    evidence_category: "materials",
    priority: 2,
  },

  // ── Finish ──────────────────────────────────────────────────
  shellac_crazing: {
    indicator_text: "Shellac finish with characteristic age crazing — a fine network of cracks — indicates an original surface dating from the shellac era, approximately 1800 to 1920.",
    typical_date_range: "1800–1920",
    evidence_category: "finish",
    priority: 2,
  },
  polyurethane: {
    indicator_text: "A thick plastic-like film finish indicates polyurethane, which was not available before approximately 1960. Its presence suggests either post-1960 manufacture or a later refinish over original surfaces.",
    typical_date_range: "post-1960",
    evidence_category: "finish",
    priority: 1,
    hard_negative: false,
  },
};

// ── Utility: look up clue in library ────────────────────────────
// Returns null if not found.
function getClueIndicator(clueKey) {
  const key = (clueKey || "").replace(/-/g,"_").toLowerCase();
  return HISTORICAL_CLUE_LIBRARY[key] || null;
}

// ── Utility: generate indicators from an array of clue keys ─────
// Field Scan: topN = 3 (highest-priority only)
// Full Analysis: topN = null (all matches)
function generateIndicators(clueKeys, topN) {
  const matched = [];
  const seen = new Set();
  for (const key of (clueKeys || [])) {
    const entry = getClueIndicator(key);
    if (entry && !seen.has(key)) {
      seen.add(key);
      matched.push({ key: key, ...entry });
    }
  }
  // Sort: hard negatives first, then by priority ascending (1 = highest)
  matched.sort(function(a, b) {
    if (a.hard_negative && !b.hard_negative) return -1;
    if (!a.hard_negative && b.hard_negative) return 1;
    return (a.priority || 99) - (b.priority || 99);
  });
  return topN ? matched.slice(0, topN) : matched;
}


// ============================================================
// CONFIDENCE WEIGHTING SYSTEM
// ============================================================
// Maps clue keys to base_weight, replacement_risk, and reason.
// Base weights mirror WM tier philosophy but are per-clue.
// adjusted_weight = base_weight × visibility × multi-photo × (1 - replacement_risk × !supported)
// ============================================================
const CLUE_WEIGHT_TABLE = {
  // ── Structural / mechanical (0.80–0.95) ────────────────────
  drop_leaf_hinged: { base: 0.90, typical_weight: 0.90, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "defining structural form signature — rarely altered", explanation: "defining structural form signature — rarely altered" },
  gateleg_support: { base: 0.92, typical_weight: 0.92, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "irreplaceable structural mechanism — high form confidence", explanation: "irreplaceable structural mechanism — high form confidence" },
  rule_joint:            { base: 0.85, replacement_risk: 0.08, category: "joinery",      reason: "skilled hand joinery — strong period indicator" },
  swing_leg: { base: 0.82, typical_weight: 0.82, replacement_risk: 0.08, replacement_risk_label: "very_low", priority_level: "high", category: "construction", reason: "structural leaf support — reliable form indicator", explanation: "structural leaf support — reliable form indicator" },
  butterfly_support: { base: 0.85, typical_weight: 0.85, replacement_risk: 0.08, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "distinctive structural mechanism", explanation: "distinctive structural mechanism" },
  lift_lid: { base: 0.88, typical_weight: 0.88, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "defining chest form feature", explanation: "defining chest form feature" },
  multiple_drawer_case: { base: 0.80, typical_weight: 0.80, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "high", category: "construction", reason: "defining case form", explanation: "defining case form" },
  slant_front: { base: 0.88, typical_weight: 0.88, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "defining desk form signature", explanation: "defining desk form signature" },
  cylinder_roll: { base: 0.90, typical_weight: 0.90, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "irreplaceable roll-top mechanism", explanation: "irreplaceable roll-top mechanism" },
  pedestal_base: { base: 0.82, typical_weight: 0.82, replacement_risk: 0.10, replacement_risk_label: "low", priority_level: "high", category: "construction", reason: "structural base form", explanation: "structural base form" },
  tilt_top: { base: 0.88, typical_weight: 0.88, replacement_risk: 0.08, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "distinctive tilt mechanism", explanation: "distinctive tilt mechanism" },
  tripod_base: { base: 0.85, typical_weight: 0.85, replacement_risk: 0.08, replacement_risk_label: "very_low", priority_level: "very_high", category: "construction", reason: "characteristic pedestal form", explanation: "characteristic pedestal form" },
  extension_mechanism: { base: 0.85, typical_weight: 0.85, replacement_risk: 0.10, replacement_risk_label: "low", priority_level: "very_high", category: "construction", reason: "table extension mechanism", explanation: "table extension mechanism" },
  drawer_present: { base: 0.75, typical_weight: 0.75, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "high", category: "construction", reason: "presence of drawers indicates case form", explanation: "presence of drawers indicates case form" },

  // ── Joinery / construction (0.70–0.90) ─────────────────────
  hand_cut_dovetails: { base: 0.88, typical_weight: 0.88, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "joinery", reason: "hand craftsmanship — strong pre-industrial indicator", explanation: "hand craftsmanship — strong pre-industrial indicator" },
  machine_dovetails: { base: 0.82, typical_weight: 0.82, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "high", category: "joinery", reason: "factory production indicator — reliable dating clue", explanation: "factory production indicator — reliable dating clue" },
  mortise_and_tenon: { base: 0.72, typical_weight: 0.72, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "high", category: "joinery", reason: "traditional joinery — present across many centuries", explanation: "traditional joinery — present across many centuries" },
  dowel_joinery: { base: 0.70, typical_weight: 0.70, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "high", category: "joinery", reason: "post-1900 factory method indicator", explanation: "post-1900 factory method indicator" },
  frame_and_panel: { base: 0.75, typical_weight: 0.75, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "high", category: "joinery", reason: "panel construction method — spans many periods", explanation: "panel construction method — spans many periods" },
  solid_board_drawer_bottom: { base: 0.80, typical_weight: 0.80, replacement_risk: 0.08, replacement_risk_label: "very_low", priority_level: "high", category: "joinery", reason: "pre-machine bottom construction indicator", explanation: "pre-machine bottom construction indicator" },

  // ── Toolmarks (0.70–0.85) ───────────────────────────────────
  pit_saw_marks: { base: 0.85, typical_weight: 0.85, replacement_risk: 0.02, replacement_risk_label: "very_low", priority_level: "very_high", category: "toolmarks", reason: "pre-industrial milling — strong pre-1830 indicator", explanation: "pre-industrial milling — strong pre-1830 indicator" },
  circular_saw_arcs: { base: 0.78, typical_weight: 0.78, replacement_risk: 0.02, replacement_risk_label: "very_low", priority_level: "high", category: "toolmarks", reason: "post-1830 mill mark — reliable dating clue", explanation: "post-1830 mill mark — reliable dating clue" },
  band_saw_lines: { base: 0.75, typical_weight: 0.75, replacement_risk: 0.02, replacement_risk_label: "very_low", priority_level: "high", category: "toolmarks", reason: "post-1870 factory sawing", explanation: "post-1870 factory sawing" },
  hand_plane_chatter: { base: 0.70, typical_weight: 0.70, replacement_risk: 0.02, replacement_risk_label: "very_low", priority_level: "high", category: "toolmarks", reason: "hand preparation — pre-industrial indicator", explanation: "hand preparation — pre-industrial indicator" },

  // ── Materials (0.50–0.80) ───────────────────────────────────
  poplar_secondary: { base: 0.68, typical_weight: 0.68, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "moderate", category: "materials", reason: "19th-century secondary wood — useful regional indicator", explanation: "19th-century secondary wood — useful regional indicator" },
  thick_veneer: { base: 0.62, typical_weight: 0.62, replacement_risk: 0.10, replacement_risk_label: "low", priority_level: "moderate", category: "materials", reason: "early veneer technique — pre-1910 indicator", explanation: "early veneer technique — pre-1910 indicator" },
  plywood_structural: { base: 0.90, typical_weight: 0.90, replacement_risk: 0.02, replacement_risk_label: "very_low", priority_level: "very_high", category: "materials", reason: "HARD NEGATIVE — post-1920 structural material", explanation: "HARD NEGATIVE — post-1920 structural material" },
  plywood_drawer_bottom: { base: 0.88, typical_weight: 0.88, replacement_risk: 0.02, replacement_risk_label: "very_low", priority_level: "very_high", category: "materials", reason: "HARD NEGATIVE — post-1920 drawer bottom material", explanation: "HARD NEGATIVE — post-1920 drawer bottom material" },

  // ── Hardware (0.35–0.75) ────────────────────────────────────
  porcelain_caster: { base: 0.68, typical_weight: 0.68, replacement_risk: 0.35, replacement_risk_label: "high", priority_level: "moderate", category: "hardware", reason: "period hardware — often survives but sometimes replaced", explanation: "period hardware — often survives but sometimes replaced" },
  victorian_strap_hinge: { base: 0.62, typical_weight: 0.62, replacement_risk: 0.40, replacement_risk_label: "high", priority_level: "moderate", category: "hardware", reason: "decorative period hardware — replacement risk moderate", explanation: "decorative period hardware — replacement risk moderate" },
  batwing_brass_pull: { base: 0.65, typical_weight: 0.65, replacement_risk: 0.50, replacement_risk_label: "high", priority_level: "moderate", category: "hardware", reason: "period pull — commonly replaced; corroborated by structure", explanation: "period pull — commonly replaced; corroborated by structure" },
  eastlake_pull: { base: 0.60, typical_weight: 0.60, replacement_risk: 0.45, replacement_risk_label: "high", priority_level: "moderate", category: "hardware", reason: "Eastlake period hardware — often replaced", explanation: "Eastlake period hardware — often replaced" },
  modern_concealed_hinge:{ base: 0.92, replacement_risk: 0.10, category: "hardware", reason: "HARD NEGATIVE — post-1950 hinge eliminates antique claim" },

  // ── Fasteners (0.60–0.90) ───────────────────────────────────
  hand_forged_nail: { base: 0.88, typical_weight: 0.88, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "fasteners", reason: "pre-1800 production indicator — rarely added later", explanation: "pre-1800 production indicator — rarely added later" },
  cut_nail: { base: 0.82, typical_weight: 0.82, replacement_risk: 0.08, replacement_risk_label: "very_low", priority_level: "high", category: "fasteners", reason: "1790–1890 fastener — strong dating clue", explanation: "1790–1890 fastener — strong dating clue" },
  wire_nail: { base: 0.72, typical_weight: 0.72, replacement_risk: 0.15, replacement_risk_label: "low", priority_level: "high", category: "fasteners", reason: "post-1880 fastener — occasionally used in repairs", explanation: "post-1880 fastener — occasionally used in repairs" },
  slotted_handmade_screw:{ base: 0.82, replacement_risk: 0.10, category: "fasteners", reason: "pre-1840 screw — distinctive hand-cut characteristics" },
  slotted_machine_screw: { base: 0.62, typical_weight: 0.62, replacement_risk: 0.45, replacement_risk_label: "high", priority_level: "moderate", category: "fasteners", reason: "1840–1935 screw — frequently replaced; moderate weight", explanation: "1840–1935 screw — frequently replaced; moderate weight" },
  phillips_screw: { base: 0.90, typical_weight: 0.90, replacement_risk: 0.10, replacement_risk_label: "low", priority_level: "very_high", category: "fasteners", reason: "HARD NEGATIVE — post-1934; eliminates pre-1930 claim", explanation: "HARD NEGATIVE — post-1934; eliminates pre-1930 claim" },
  staple_fastener: { base: 0.90, typical_weight: 0.90, replacement_risk: 0.05, replacement_risk_label: "very_low", priority_level: "very_high", category: "fasteners", reason: "HARD NEGATIVE — post-1945 industrial fastener", explanation: "HARD NEGATIVE — post-1945 industrial fastener" },

  // ── Finish / surface (0.25–0.60) ───────────────────────────
  shellac_crazing: { base: 0.55, typical_weight: 0.55, replacement_risk: 0.20, replacement_risk_label: "moderate", priority_level: "moderate", category: "finish", reason: "original period finish — useful but refinishing is common", explanation: "original period finish — useful but refinishing is common" },
  shellac_intact: { base: 0.50, typical_weight: 0.50, replacement_risk: 0.25, replacement_risk_label: "moderate", priority_level: "moderate", category: "finish", reason: "intact shellac — helpful context clue", explanation: "intact shellac — helpful context clue" },
  oil_finish_patina: { base: 0.38, typical_weight: 0.38, replacement_risk: 0.30, replacement_risk_label: "moderate", priority_level: "low", category: "finish", reason: "low specificity — oil finishes span all eras", explanation: "low specificity — oil finishes span all eras" },
  polyurethane: { base: 0.65, typical_weight: 0.65, replacement_risk: 0.15, replacement_risk_label: "low", priority_level: "moderate", category: "finish", reason: "post-1960 finish — indicates modern production or refinish", explanation: "post-1960 finish — indicates modern production or refinish" },
  refinished_surface: { base: 0.45, typical_weight: 0.45, replacement_risk: 0.60, replacement_risk_label: "very_high", priority_level: "low", category: "alteration", reason: "refinishing removes dating evidence from surface", explanation: "refinishing removes dating evidence from surface" },
};

// ── CLUE_PRIORITY_TABLE — public alias for CLUE_WEIGHT_TABLE ──────
// Satisfies the document's requested name. Both names reference the same object.
const CLUE_PRIORITY_TABLE = CLUE_WEIGHT_TABLE;

// ── getClueByPriority — return all entries matching a priority level ──
function getClueByPriority(priorityLevel) {
  return Object.keys(CLUE_PRIORITY_TABLE)
    .filter(function(k) { return CLUE_PRIORITY_TABLE[k].priority_level === priorityLevel; })
    .map(function(k) { return { clue: k, ...CLUE_PRIORITY_TABLE[k] }; });
}

// ── filterByPriority — return weighted clues at or above a threshold ──
// Used by Field Scan (threshold="high") and Full Analysis (threshold="contextual")
var PRIORITY_ORDER = ["very_high","high","moderate","low","contextual"];
function filterByPriority(weightedClues, minLevel) {
  var minIdx = PRIORITY_ORDER.indexOf(minLevel);
  if (minIdx === -1) minIdx = 4;
  return weightedClues.filter(function(c) {
    var entry = CLUE_PRIORITY_TABLE[c.clue];
    if (!entry) return minIdx >= 3; // unknown clues pass at low+ threshold
    var entryIdx = PRIORITY_ORDER.indexOf(entry.priority_level);
    return entryIdx !== -1 && entryIdx <= minIdx;
  });
}

// ── getPriorityExplanation — generate a brief priority explanation string ──
function getPriorityExplanation(clueKey) {
  var entry = CLUE_PRIORITY_TABLE[clueKey];
  if (!entry) return null;
  var pl = entry.priority_level.replace(/_/g," ");
  var rl = entry.replacement_risk_label ? entry.replacement_risk_label.replace(/_/g," ") : "unknown";
  return entry.explanation + " Priority: " + pl + ". Replacement risk: " + rl + ".";
}

// ── computeClueWeights ──────────────────────────────────────────
// Takes observations_by_type (from Phase 0 or evidence cache).
// Returns an array of weighted clue objects with adjusted_weight and reason.
// Also detects multi-photo confirmation and hard-negative presence.
function computeClueWeights(observationsByType) {
  if (!observationsByType || typeof observationsByType !== "object") return [];

  // Flatten all observations into one array with their type
  const allObs = [];
  Object.keys(observationsByType).forEach(function(typeName) {
    var arr = observationsByType[typeName] || [];
    arr.forEach(function(obs) {
      allObs.push({ ...obs, _category: typeName });
    });
  });

  // Count how many photos each clue appears in (by source_image)
  const cluePhotoCounts = {};
  allObs.forEach(function(obs) {
    var key = obs.clue || obs.reference_id || "";
    if (!cluePhotoCounts[key]) cluePhotoCounts[key] = new Set();
    if (obs.source_image) cluePhotoCounts[key].add(obs.source_image);
    if (obs.photo_index)  cluePhotoCounts[key].add("idx_" + obs.photo_index);
  });

  // Detect whether any hard-negative clues are present
  var hasHardNeg = allObs.some(function(obs) {
    var entry = CLUE_WEIGHT_TABLE[obs.clue || obs.reference_id || ""];
    return entry && (obs.clue === "phillips_screw" || obs.clue === "staple_fastener" ||
      obs.clue === "plywood_structural" || obs.clue === "plywood_drawer_bottom" ||
      obs.clue === "modern_concealed_hinge");
  });

  // Build weighted clue array (one entry per unique clue key)
  var seen = new Set();
  var weighted = [];

  allObs.forEach(function(obs) {
    var clueKey = obs.clue || obs.reference_id || "";
    if (!clueKey || seen.has(clueKey)) return;
    seen.add(clueKey);

    var entry = CLUE_WEIGHT_TABLE[clueKey];
    var visConf = typeof obs.visual_confidence === "number" ? obs.visual_confidence / 100 : 0.5;
    var effConf = typeof obs.effective_confidence === "number" ? obs.effective_confidence : visConf;

    // Base weight from table or fall back to WM tier category
    var base = entry ? entry.base : (
      obs._category === "mechanical_structures" ? 0.82 :
      obs._category === "joinery"    ? 0.75 :
      obs._category === "toolmarks"  ? 0.72 :
      obs._category === "materials"  ? 0.58 :
      obs._category === "hardware"   ? 0.55 :
      obs._category === "fasteners"  ? 0.68 :
      obs._category === "finish"     ? 0.40 : 0.50
    );
    var replacementRisk = entry ? entry.replacement_risk : 0.20;
    var category = entry ? entry.category : (obs._category || "other");
    var baseReason = entry ? entry.reason : "weight estimated from category defaults";

    // ── Adjustment factors ───────────────────────────────────
    var adjustment = 0;
    var reasons = [];

    // A0. Structural source type — underside vs back_panel weight emphasis
    var srcType = obs.source_image || "";
    if (srcType === "underside" && (category === "joinery" || category === "toolmarks")) {
      adjustment += 0.06; reasons.push("underside view — strong for " + category);
    }
    if (srcType === "back_panel" && (category === "fasteners" || category === "materials")) {
      adjustment += 0.06; reasons.push("back panel — strong for fasteners/materials");
    }
    if (srcType === "back_panel" && category === "joinery") {
      adjustment -= 0.04; // back panel weaker for joinery than underside
    }

    // A. Visibility quality
    if (effConf >= 0.80) { adjustment += 0.08; reasons.push("clearly visible"); }
    else if (effConf >= 0.60) { adjustment += 0.03; }
    else if (effConf < 0.40) { adjustment -= 0.10; reasons.push("faint or partial visibility"); }

    // B. Multi-photo confirmation
    var photoCount = cluePhotoCounts[clueKey] ? cluePhotoCounts[clueKey].size : 1;
    if (photoCount >= 3) { adjustment += 0.10; reasons.push("confirmed in " + photoCount + " photos"); }
    else if (photoCount === 2) { adjustment += 0.05; reasons.push("confirmed in 2 photos"); }

    // C. Replacement / alteration risk
    if (replacementRisk > 0.35) {
      adjustment -= (replacementRisk * 0.30);
      reasons.push("replacement risk: " + Math.round(replacementRisk * 100) + "%");
    }

    // D. Hard-negative conflict penalty — non-hard-neg hardware loses weight when hard-neg present
    if (hasHardNeg && category === "hardware" && !obs.hard_negative) {
      adjustment -= 0.10;
      reasons.push("weight reduced: hard negative present in same scan");
    }

    // E. Low-confidence flag
    if (obs.low_confidence_flag) { adjustment -= 0.05; reasons.push("flagged as low confidence"); }

    var adjusted = Math.min(0.98, Math.max(0.05, base + adjustment));

    weighted.push({
      clue:              clueKey,
      display_label:     clueKey.replace(/_/g, " "),
      category:          category,
      base_weight:       parseFloat(base.toFixed(3)),
      adjusted_weight:   parseFloat(adjusted.toFixed(3)),
      confidence_reason: baseReason + (reasons.length ? " (" + reasons.join("; ") + ")" : ""),
      photo_sources:     obs.source_image ? [obs.source_image] : [],
      photo_index:       obs.photo_index || null,
      hard_negative:     !!(obs.hard_negative),
      effective_confidence: effConf,
    });
  });

  // Sort: hard negatives first, then by adjusted_weight desc
  weighted.sort(function(a, b) {
    if (a.hard_negative && !b.hard_negative) return -1;
    if (!a.hard_negative && b.hard_negative) return 1;
    return b.adjusted_weight - a.adjusted_weight;
  });

  return weighted;
}

// ── deriveConfidenceDrivers ─────────────────────────────────────
// From a weighted clue array, produce the two driver lists for the panel.
// topN controls how many items to show (3 for FS, 5 for FA).
function deriveConfidenceDrivers(weightedClues, topN) {
  topN = topN || 5;
  var increased = [];
  var limited   = [];

  // Increased: top N non-hard-neg clues with adjusted_weight >= 0.65
  weightedClues
    .filter(function(c) { return !c.hard_negative && c.adjusted_weight >= 0.65; })
    .slice(0, topN)
    .forEach(function(c) {
      increased.push(c.display_label + (c.photo_index ? " (Photo " + c.photo_index + ")" : ""));
    });

  // Limited: hard negatives + low-weight clues + high replacement risk
  weightedClues
    .filter(function(c) { return c.hard_negative; })
    .forEach(function(c) {
      limited.push(c.display_label + " — hard negative");
    });
  weightedClues
    .filter(function(c) { return !c.hard_negative && c.adjusted_weight < 0.55 && c.adjusted_weight > 0; })
    .slice(0, 3)
    .forEach(function(c) {
      limited.push(c.display_label + " — " + (c.confidence_reason.split("(")[0].trim()));
    });

  return { increased: increased.slice(0, topN), limited: limited.slice(0, topN) };
}

// ── deriveCategoryScores ────────────────────────────────────────
// Aggregate adjusted weights by category for the Evidence Weight panel.
function deriveCategoryScores(weightedClues) {
  var cats = {};
  weightedClues.forEach(function(c) {
    if (!cats[c.category]) cats[c.category] = { sum: 0, count: 0 };
    cats[c.category].sum   += c.adjusted_weight;
    cats[c.category].count += 1;
  });
  // Normalise to 0–100 percentage
  var entries = Object.keys(cats).map(function(k) {
    return { category: k, avg: cats[k].sum / cats[k].count, count: cats[k].count };
  });
  var maxAvg = Math.max.apply(null, entries.map(function(e){ return e.avg; }).concat([0.01]));
  return entries.map(function(e) {
    return { ...e, score: Math.round((e.avg / maxAvg) * 100) };
  }).sort(function(a, b) { return b.score - a.score; });
}


// ============================================================
// CONFLICT RESOLUTION LAYER
// ============================================================
// Authority hierarchy mirrors document specification:
//   structural (10) > joinery (9) > toolmarks (8) > fasteners (8)
//   > materials (6) > hardware (6) > finish (4) > style (3)
//
// resolveConflicts(weightedClues) → { restoration_interpretation,
//   conflict_notes, confidence_adjustment, resolved_clues }
// ============================================================
