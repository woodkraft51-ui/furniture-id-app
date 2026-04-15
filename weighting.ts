const AUTHORITY_RANK = {
  construction: 10,
  joinery:      9,
  toolmarks:    8,
  fasteners:    8,
  materials:    6,
  hardware:     6,
  finish:       4,
  alteration:   4,
  style:        3,
  other:        2,
};

// Clue pairs that frequently conflict and their standard interpretation
const KNOWN_CONFLICT_PATTERNS = [
  {
    id: "hardware_replacement",
    high_auth_categories: ["construction", "joinery", "toolmarks"],
    low_auth_categories:  ["hardware", "fasteners"],
    low_auth_clues:       ["slotted_machine_screw","phillips_screw","wire_nail","staple_fastener"],
    interpretation:       "Later hardware or fasteners may reflect repair or restoration rather than original manufacture.",
    confidence_adjustment: -0.05,
    restoration_type:     "replacement hardware",
  },
  {
    id: "refinish_over_original",
    high_auth_categories: ["construction", "joinery"],
    low_auth_categories:  ["finish"],
    low_auth_clues:       ["polyurethane","refinished_surface"],
    interpretation:       "Later finish treatment may obscure or replace original surface evidence.",
    confidence_adjustment: -0.03,
    restoration_type:     "refinishing",
  },
  {
    id: "revival_style_vs_construction",
    high_auth_categories: ["joinery", "toolmarks", "fasteners"],
    low_auth_categories:  ["style"],
    interpretation:       "Style may reflect a later revival period rather than original manufacture. Construction evidence takes authority.",
    confidence_adjustment: -0.05,
    restoration_type:     null,
  },
  {
    id: "modern_fastener_in_antique_structure",
    high_auth_categories: ["construction", "joinery"],
    low_auth_clues:       ["phillips_screw","staple_fastener","plywood_structural"],
    interpretation:       "Modern fasteners found alongside antique structural evidence — likely later repair.",
    confidence_adjustment: -0.04,
    restoration_type:     "structural repair",
  },
];

function resolveConflicts(weightedClues) {
  if (!weightedClues || !weightedClues.length) {
    return {
      restoration_interpretation: { likely_restoration_present: false, possible_restoration_types: [], confidence_reason: "" },
      conflict_notes: [],
      confidence_adjustment: 0,
      resolved_clues: weightedClues || [],
    };
  }

  var notes = [];
  var restorationTypes = new Set();
  var totalAdjustment = 0;
  var resolvedClues = weightedClues.map(function(c) { return { ...c }; });

  // Build category maps
  var byCategory = {};
  resolvedClues.forEach(function(c) {
    if (!byCategory[c.category]) byCategory[c.category] = [];
    byCategory[c.category].push(c);
  });

  // Find highest-authority category present
  var presentCats = Object.keys(byCategory);
  var maxAuthority = Math.max.apply(null, presentCats.map(function(k) { return AUTHORITY_RANK[k] || 0; }));
  var highAuthClues = resolvedClues.filter(function(c) { return (AUTHORITY_RANK[c.category] || 0) >= 8; });
  var lowAuthHardware = resolvedClues.filter(function(c) { return c.category === "hardware" || c.category === "fasteners"; });

  // ── Apply known conflict patterns ───────────────────────────
  KNOWN_CONFLICT_PATTERNS.forEach(function(pattern) {
    var highPresent = highAuthClues.length > 0 &&
      pattern.high_auth_categories.some(function(cat) { return byCategory[cat] && byCategory[cat].length > 0; });
    var lowPresent  = (pattern.low_auth_clues || []).some(function(key) {
      return resolvedClues.some(function(c) { return c.clue === key; });
    }) || (pattern.low_auth_categories || []).some(function(cat) {
      return byCategory[cat] && byCategory[cat].length > 0;
    });

    if (highPresent && lowPresent) {
      notes.push(pattern.interpretation);
      totalAdjustment += (pattern.confidence_adjustment || 0);
      if (pattern.restoration_type) restorationTypes.add(pattern.restoration_type);

      // Downweight the offending low-authority clues
      resolvedClues.forEach(function(c) {
        var isOffender = (pattern.low_auth_clues || []).includes(c.clue) ||
          (pattern.low_auth_categories || []).includes(c.category);
        if (isOffender) {
          var penalty = Math.abs(pattern.confidence_adjustment || 0.05) * 1.5;
          c.adjusted_weight = Math.max(0.05, c.adjusted_weight - penalty);
          c.confidence_reason += " [downweighted: " + pattern.id + "]";
        }
      });
    }
  });

  // ── General rule: any hardware clue vs strong construction ──
  if (highAuthClues.length >= 2 && lowAuthHardware.length > 0) {
    var highAvg = highAuthClues.reduce(function(s, c) { return s + c.adjusted_weight; }, 0) / highAuthClues.length;
    var lowAvg  = lowAuthHardware.reduce(function(s, c) { return s + c.adjusted_weight; }, 0) / lowAuthHardware.length;
    if (highAvg > lowAvg + 0.20) {
      // Clear authority gap — hardware outweighed by construction
      if (!notes.some(function(n) { return n.includes("hardware"); })) {
        notes.push("Hardware evidence was given lower authority than structural and construction clues, which are more historically reliable indicators.");
      }
      restorationTypes.add("possible hardware replacement");
    }
  }

  // ── Hard negatives always win ────────────────────────────────
  var hardNegs = resolvedClues.filter(function(c) { return c.hard_negative; });
  hardNegs.forEach(function(hn) {
    notes.push(hn.display_label.charAt(0).toUpperCase() + hn.display_label.slice(1) +
      " is a hard negative — this clue cannot be explained by restoration and limits the date range definitively.");
    totalAdjustment -= 0.08;
  });

  // ── Build restoration interpretation object ──────────────────
  var restorationTypes_arr = Array.from(restorationTypes);
  var restorationPresent = restorationTypes_arr.length > 0 && !restorationTypes_arr.every(function(t) { return t === "possible hardware replacement"; });
  var confidenceReason = restorationPresent
    ? "Possible " + restorationTypes_arr.join(", ") + " may explain mixed clues. Construction evidence takes authority."
    : notes.length > 0
    ? "Some clue conflicts noted — see Conflict Notes below."
    : "";

  return {
    restoration_interpretation: {
      likely_restoration_present: restorationPresent,
      possible_restoration_types: restorationTypes_arr,
      confidence_reason:          confidenceReason,
    },
    conflict_notes:       notes,
    confidence_adjustment: Math.max(-0.25, totalAdjustment),
    resolved_clues:        resolvedClues,
  };
}


// ============================================================
// DECISION-REPORT LANGUAGE SYSTEM
// ============================================================
// Controls phrasing, tone, and structure for all report text.
// buildNarrative(weightedClues, resolvedConflicts, mode) → object
// mode: "field_scan" | "full_analysis"
// ============================================================

// ── Phrase bank by confidence tier ──────────────────────────
const REPORT_LANGUAGE = {
  high: {
    observation: ["clearly visible", "can be seen in the photographs", "is present", "is clearly identifiable"],
    interpretation: ["strongly consistent with", "a defining feature of", "characteristic of", "a reliable indicator of"],
    form: ["This is", "The object is", "The evidence confirms this is"],
  },
  moderate: {
    observation: ["appears to be", "is visible", "is present in the photographs"],
    interpretation: ["commonly associated with", "typically indicates", "consistent with", "often found on"],
    form: ["This is most likely", "The evidence suggests this is", "The available evidence points to"],
  },
  low: {
    observation: ["may be present", "appears possible"],
    interpretation: ["may indicate", "could suggest", "is sometimes associated with"],
    form: ["The evidence tentatively suggests", "Based on available photographs, this may be"],
  },
};

// ── Pick a phrase by confidence level ───────────────────────
function phrase(conf, bucket) {
  var tier = conf >= 0.75 ? "high" : conf >= 0.50 ? "moderate" : "low";
  var arr  = (REPORT_LANGUAGE[tier] || REPORT_LANGUAGE.moderate)[bucket] || [];
  return arr[0] || "";
}

// ── Build Confirmed Observations prose ──────────────────────
function buildObservationsText(weightedClues) {
  if (!weightedClues || !weightedClues.length) return null;
  var strong = weightedClues.filter(function(c){ return c.adjusted_weight >= 0.70 && !c.hard_negative; }).slice(0,5);
  if (!strong.length) strong = weightedClues.slice(0,3);
  var parts = strong.map(function(c){
    return c.display_label + (c.photo_index ? " (Photo " + c.photo_index + ")" : "");
  });
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0] + " is visible in the photographs.";
  var last = parts.pop();
  return parts.join(", ") + ", and " + last + " are visible in the photographs.";
}

// ── Build Historical Interpretation prose ───────────────────
function buildInterpretationText(weightedClues, formLabel, conf) {
  var confLevel = conf === "High" || conf === "Very High" ? 0.80 : conf === "Moderate" ? 0.60 : 0.40;
  var structural = weightedClues.filter(function(c){
    return c.category === "construction" || c.category === "joinery";
  }).slice(0,2);
  var hardware   = weightedClues.filter(function(c){ return c.category === "hardware" || c.category === "fasteners"; }).slice(0,1);

  var sentences = [];
  if (formLabel && formLabel !== "Unknown" && formLabel !== "Undetermined") {
    sentences.push(phrase(confLevel, "form") + " a " + formLabel + ".");
  }
  if (structural.length) {
    var clueList = structural.map(function(c){ return c.display_label; }).join(" and ");
    sentences.push(clueList + " " + phrase(confLevel, "interpretation") + " this form.");
  }
  if (hardware.length) {
    var entry = HISTORICAL_CLUE_LIBRARY[hardware[0].clue];
    if (entry) {
      sentences.push(hardware[0].display_label.charAt(0).toUpperCase() + hardware[0].display_label.slice(1) +
        " " + phrase(Math.min(confLevel, 0.65), "interpretation") + " the " + entry.typical_date_range + " period.");
    }
  }
  return sentences.join(" ") || null;
}

// ── Build Confidence Limits prose ───────────────────────────
function buildConfidenceLimitsText(resolvedConflicts, missingPhotoTypes) {
  var sentences = [];
  // Missing photos
  var missing = missingPhotoTypes || [];
  var hasStructuralMissing = missing.indexOf("underside") === -1 && missing.indexOf("back_panel") === -1;
  if (hasStructuralMissing && missing.indexOf("joinery_closeup") === -1) {
    sentences.push("Additional hidden structure photos (underside or back panel) or joinery close-ups would improve dating precision.");
  }
  // Conflict notes as limitations
  if (resolvedConflicts && resolvedConflicts.conflict_notes && resolvedConflicts.conflict_notes.length) {
    sentences.push("Some clue conflicts were noted — see the Conflict Interpretation section for detail.");
  }
  return sentences.slice(0,2).join(" ") || null;
}

// ── Master narrative builder ─────────────────────────────────
// Returns: { observations, interpretation, conflict, limits, summary }
function buildNarrative(weightedClues, resolvedConflicts, formLabel, conf, photoTypes, mode) {
  var obsText    = buildObservationsText(weightedClues);
  var interpText = buildInterpretationText(weightedClues, formLabel, conf);
  var limText    = buildConfidenceLimitsText(resolvedConflicts, photoTypes);
  var ri = resolvedConflicts && resolvedConflicts.restoration_interpretation;
  var conflictText = ri && ri.likely_restoration_present
    ? "Some hardware or surface elements may reflect later restoration or repair work, which is common in furniture that has remained in use. " + ri.confidence_reason
    : null;

  // Field Scan: concise bullets  Full Analysis: connected prose
  if (mode === "field_scan") {
    return {
      observations:    obsText,
      interpretation:  interpText,
      conflict:        conflictText,
      limits:          limText,
      // Short summary sentence for the signal card area
      summary: interpText
        ? interpText.split(".")[0] + "."
        : obsText
          ? "Evidence from the photographs supports this identification."
          : "Identification based on available visual evidence.",
    };
  }
  // Full Analysis: richer prose
  return {
    observations:    obsText,
    interpretation:  interpText,
    conflict:        conflictText,
    limits:          limText,
    summary: [obsText, interpText].filter(Boolean).join(" ") || "Analysis based on submitted photographs.",
  };
}

