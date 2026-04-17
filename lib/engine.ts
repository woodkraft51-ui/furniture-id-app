export const EVIDENCE_ADAPTER_MODE: "mock" | "live" = "live";
export const FULL_ANALYSIS_MODE: "mock" | "live" = "live";
export const RUNTIME_MODE: "mock" | "live" = FULL_ANALYSIS_MODE;
//
// To connect a real backend:
//   Set FULL_ANALYSIS_MODE = "live"  and ensure api.anthropic.com is reachable
//   Set EVIDENCE_ADAPTER_MODE = "live" and replace PE.callClaudeQuick() with your proxy


// ============================================================
// RUNTIME MODE PROBE
// Evaluates the exact reason the engine is simulated or live.
// Called once at startup and on every result render.
// ============================================================
function getRuntimeMode() {
  const fullMock  = (typeof FULL_ANALYSIS_MODE     !== "undefined" && FULL_ANALYSIS_MODE     === "mock");
  const fieldMock = (typeof EVIDENCE_ADAPTER_MODE  !== "undefined" && EVIDENCE_ADAPTER_MODE  === "mock");

  const reasons = [];
  if (fullMock)  reasons.push('FULL_ANALYSIS_MODE="mock"');
  if (fieldMock) reasons.push('EVIDENCE_ADAPTER_MODE="mock"');
  if (!fullMock && !fieldMock) reasons.push("flags=live — fetch result determines actual mode");

  const mode = (fullMock || fieldMock) ? "SIMULATED_FALLBACK" : "LIVE";

  return {
    engine_mode:                mode,
    live_llm_enabled:           !fullMock,
    live_field_scan:            !fieldMock,
    anthropic_key_present:      false,   // injected by platform proxy — not visible to JS
    fetch_blocked:              false,   // unknown until first call — check per-call logs
    backend_endpoint_available: true,    // platform proxy at api.anthropic.com/v1/messages
    api_version_header:         "2023-06-01",
    full_analysis_flag:         typeof FULL_ANALYSIS_MODE    !== "undefined" ? FULL_ANALYSIS_MODE    : "undefined",
    field_scan_flag:            typeof EVIDENCE_ADAPTER_MODE !== "undefined" ? EVIDENCE_ADAPTER_MODE : "undefined",
    simulation_reason:          reasons.join(" | ") || "none — live mode active",
    primary_trigger:            reasons[0] || "none — live mode active",
  };
}

const runtimeProbe = getRuntimeMode();
console.info("[NCW Runtime]", JSON.stringify(runtimeProbe, null, 2));



async function runEvidenceDigest(images, context) {
  const photoCount  = images.filter(function(i){ return i.data_url; }).length;
  const imageLabels = images.map(function(i){ return i.image_type; }).join(", ");

  console.info("[NCW Adapter] runEvidenceDigest — mode:", EVIDENCE_ADAPTER_MODE,
    "| photos:", photoCount, "| types:", imageLabels);

  if (EVIDENCE_ADAPTER_MODE === "mock") {
    // ── Mock profiles — selectable by user guess ─────────────────
    // Each profile simulates a different furniture form for testing.
    const MOCK_PROFILES = {
      "drop-leaf table": {
        broad_form_guess: "drop-leaf table", primary_wood_guess: "walnut",
        strongest_mechanism: "drop_leaf_hinged",
        mechanisms_detected: {
          drop_leaf_hinged: { present:true, confidence:85, note:"Hinge line visible along both long edges of top" },
          gateleg_support:  { present:true, confidence:72, note:"Pivoting gate leg assembly visible" },
          rule_joint:       { present:true, confidence:60, note:"Rounded interlocking profile at leaf join" },
        },
        evidence_digest: [
          "Drop leaves visible on both sides — fold seam runs full length of each long edge",
          "Gate leg assembly present — pivoting leg swings out to support raised leaf",
          "Rule joint profile visible at leaf-to-top junction",
          "Four turned legs with stretcher base",
          "Walnut primary wood — tight grain visible",
          "Cut nails on underside apron — rectangular cross-section (1790–1890)",
          "Circular saw arcs on underside boards (post-1830)",
        ],
        fastener_clues: [{clue:"cut_nail", visual_confidence:65, source_photo:"underside", era:"1790-1890"}],
        toolmark_clues: [{clue:"circular_saw_arcs", visual_confidence:60, source_photo:"underside"}],
      },
      "chest": {
        broad_form_guess: "blanket chest", primary_wood_guess: "pine",
        strongest_mechanism: "lift_lid",
        mechanisms_detected: {
          lift_lid:      { present:true, confidence:90, note:"Hinged top lifts to reveal interior storage" },
          till_interior: { present:true, confidence:65, note:"Small till tray visible near hinge end" },
        },
        evidence_digest: [
          "Hinged lid lifts to reveal interior — classic blanket chest form",
          "Small till tray visible inside near hinge end",
          "Pine primary wood — wide boards, visible knots",
          "Wrought iron strap hinges on back",
          "Cut nails visible on corner boards",
          "Hand plane marks visible on interior surfaces",
        ],
        fastener_clues: [{clue:"cut_nail", visual_confidence:70, source_photo:"overall_front", era:"1790-1890"}],
        toolmark_clues: [{clue:"hand_plane_chatter", visual_confidence:55, source_photo:"interior"}],
      },
      "desk": {
        broad_form_guess: "slant-front desk", primary_wood_guess: "cherry",
        strongest_mechanism: "slant_front",
        mechanisms_detected: {
          slant_front:   { present:true, confidence:88, note:"Angled fall-front writing surface visible" },
          drawer_present:{ present:true, confidence:80, note:"Four drawers below fall front" },
        },
        evidence_digest: [
          "Slant-front fall-front writing surface — folds down to reveal fitted interior",
          "Four graduated drawers below fall front",
          "Fitted interior with pigeonholes and small drawers visible",
          "Cherry primary wood — reddish-brown patina",
          "Bail brass hardware on drawer fronts",
          "Hand-cut dovetails visible on drawer corners",
        ],
        fastener_clues: [{clue:"slotted_handmade_screw", visual_confidence:60, source_photo:"hardware_closeup", era:"pre-1840"}],
        toolmark_clues: [{clue:"hand_plane_chatter", visual_confidence:50, source_photo:"underside"}],
      },
      "dresser": {
        broad_form_guess: "chest of drawers", primary_wood_guess: "walnut",
        strongest_mechanism: "multiple_drawer_case",
        mechanisms_detected: {
          multiple_drawer_case: { present:true, confidence:88, note:"Five-drawer case configuration" },
          mirror_attachment:    { present:true, confidence:70, note:"Mirror frame mount visible at top" },
        },
        evidence_digest: [
          "Five-drawer graduated case — classic Victorian dresser form",
          "Mirror attachment hardware at top of case",
          "Walnut primary wood with burl veneer panels on drawer fronts",
          "Machine dovetails on drawer corners",
          "Porcelain casters under each foot",
          "Eastlake-style incised brass pulls on all drawers",
        ],
        fastener_clues: [{clue:"wire_nail", visual_confidence:55, source_photo:"underside", era:"post-1880"}],
        toolmark_clues: [{clue:"band_saw_lines", visual_confidence:60, source_photo:"underside"}],
      },
    };
    // Select profile based on user guess, default to drop-leaf table
    const guessLower = (context.userGuess || "").toLowerCase();
    const selectedProfile =
      (guessLower.includes("chest") || guessLower.includes("trunk")) ? MOCK_PROFILES["chest"] :
      (guessLower.includes("desk") || guessLower.includes("secretary")) ? MOCK_PROFILES["desk"] :
      (guessLower.includes("dresser") || guessLower.includes("drawer")) ? MOCK_PROFILES["dresser"] :
      MOCK_PROFILES["drop-leaf table"];
    const mock = {
      _adapter_mode: "mock",
      photos_used_count: photoCount,
      photo_types_included: images.map(function(i){ return i.image_type; }),
      image_quality_overall: "good",
      ...selectedProfile,
      // Ensure all required mechanism keys are present
      mechanisms_detected: {
        drop_leaf_hinged:{present:false,confidence:0,note:""},gateleg_support:{present:false,confidence:0,note:""},
        rule_joint:{present:false,confidence:0,note:""},swing_leg:{present:false,confidence:0,note:""},
        lift_lid:{present:false,confidence:0,note:""},till_interior:{present:false,confidence:0,note:""},
        slant_front:{present:false,confidence:0,note:""},cylinder_roll:{present:false,confidence:0,note:""},
        multiple_drawer_case:{present:false,confidence:0,note:""},door_present:{present:false,confidence:0,note:""},
        pedestal_base:{present:false,confidence:0,note:""},tilt_top:{present:false,confidence:0,note:""},
        tripod_base:{present:false,confidence:0,note:""},mirror_attachment:{present:false,confidence:0,note:""},
        drawer_present:{present:false,confidence:0,note:""},
        ...(selectedProfile.mechanisms_detected || {}),
      },
      hard_negatives: [],
    };
    console.info("[NCW Adapter] Mock digest ready — mechanisms:",
      Object.keys(mock.mechanisms_detected).filter(function(k){ return mock.mechanisms_detected[k].present; }),
      "| evidence items:", mock.evidence_digest.length);
    return mock;
  }

  // ── Live mode — direct Anthropic API call ────────────────────
  // NOTE: This path is blocked inside the Claude artifact sandbox.
  // Replace with a supported proxy endpoint when deploying outside sandbox.
  console.warn("[NCW Adapter] live mode — direct fetch to api.anthropic.com (may be blocked in sandbox)");
  // Build per-type guidance for the model
  const typeGuidance = images.filter(function(i){ return i.data_url; }).map(function(i, idx) {
    const tg = {
      underside:        "Photo " + (idx+1) + " (UNDERSIDE): Focus extraction on saw marks, nail types, joinery — primary dating evidence",
      back_panel:       "Photo " + (idx+1) + " (BACK PANEL): Focus extraction on backboard construction, fasteners, secondary wood — age clues",
      overall_front:    "Photo " + (idx+1) + " (OVERALL FRONT): Extract form, structural mechanisms, leg type, hardware visibility",
      hardware_closeup: "Photo " + (idx+1) + " (HARDWARE): Extract hardware type, fastener type, originality indicators",
      joinery_closeup:  "Photo " + (idx+1) + " (JOINERY): Extract joint type, cut method, drawer construction",
      overall_side:     "Photo " + (idx+1) + " (SIDE VIEW): Extract form profile, depth, mechanism visibility",
    }[i.image_type] || ("Photo " + (idx+1) + " (" + (i.image_type||"unknown").toUpperCase() + ")");
    return tg;
  }).join("; ");
  return await PE.callClaudeQuick(
    "You are the Mechanism Detection engine. " +
    "Photos: " + photoCount + " | " + typeGuidance,
    PE.imgs(images)
  );
}


// ── parseModelJSON ───────────────────────────────────────────────────
// Tolerant JSON extractor used by all AI phases.
// Handles responses where the model adds preamble or trailing text.
// Throws on total failure so callClaude's catch block captures it.
function parseModelJSON(responseText) {
  if (!responseText) throw new Error("Empty response text");
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid response format — no JSON object found");
  try {
    return JSON.parse(jsonMatch[0]);
  } catch(err) {
    throw new Error("JSON parse failed: " + err.message);
  }
}


// RuntimeModeBadge removed from engine.ts.
// Keep UI components in components/RuntimeModeBadge.tsx.

// ============================================================
// PickerProfileSetup removed from engine.ts.
// Keep UI components in components/PickerProfileSetup.tsx.

// Remaining PickerProfileSetup block removed from engine.ts.


// ============================================================
// HISTORICAL CLUE LIBRARY
// ============================================================
// Maps observed clue keys to historical indicator text,
// typical date ranges, and evidence categories.
// Consumed by Tier 2 rendering in BOTH Field Scan and Full Analysis.
// Field Scan: top 2–3 highest-priority entries only.
// Full Analysis: full set with deeper context.
// ============================================================


const PE = {

  async callClaude(system, userContent) {
    // ── Mock short-circuit — only fires when FULL_ANALYSIS_MODE="mock" ──
    if ((FULL_ANALYSIS_MODE as "mock" | "live") === "mock") {
      console.info("[NCW callClaude] engine_mode=SIMULATED api_call_attempted=false fallback_triggered=true reason=mock_flag");
      return { ok:false, error_type:"mock_mode", error_message:'Set FULL_ANALYSIS_MODE="live" to enable real calls.', raw_response:"" };
    }

    // ── Live path — attempt real API call ──────────────────────────
    // NOTE: No x-api-key header — this artifact runs behind the Claude platform
    // proxy which injects auth automatically. Adding a key here would be both
    // insecure (exposed in JS) and wrong (proxy rejects conflicting auth headers).
    console.info("[NCW callClaude] engine_mode=LIVE api_call_attempted=true target=api.anthropic.com/v1/messages");
    console.info("[NCW callClaude] fetch_starting=true model=claude-sonnet-4-6 proxy_auth=platform_injected");
    let res, data;
    try {
      res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1200,
          system,
          messages: [{ role: "user", content: userContent }],
        }),
      });
      console.info("[NCW callClaude] fetch_resolved=true status=" + res.status);
      data = await res.json();
      console.info("[NCW callClaude] api_http_status=" + res.status + " response_keys=" + Object.keys(data).join(","));
      if (res.status === 401) {
        console.warn("[NCW callClaude] 401 UNAUTHORIZED — proxy did not inject auth. This artifact may be running outside the Claude platform sandbox.");
      }
    } catch(fetchErr) {
      console.warn("[NCW callClaude] fetch_resolved=false — request blocked before response. Likely cause: sandbox network policy blocks outbound fetch to api.anthropic.com from this artifact origin.");
      console.warn("[NCW callClaude] error=" + fetchErr.message);
      return { ok:false, error_type:"fetch_blocked", error_message: "Fetch blocked — sandbox network policy. This app requires the Claude artifact runtime to proxy API calls.", raw_response:"", retry_attempted:false };
    }

    // API-level error (auth, rate limit, server error)
    if (data.error) {
      console.warn("[NCW callClaude] api_error fallback_triggered=true type=" + (data.error.type||"?") + " message=" + (data.error.message||"?"));
      return {
        ok: false,
        error_type: "api_error",
        error_message: data.error.message || "Anthropic API returned an error",
        raw_response: JSON.stringify(data.error),
        retry_attempted: false,
      };
    }

    const raw = data.content ? data.content.map(b => b.text || "").join("\n") : "";
    console.info("[NCW callClaude] raw_llm_response_length=" + raw.length + " fallback_triggered=" + (!raw.trim()));

    if (!raw.trim()) {
      return {
        ok: false,
        error_type: "empty_response",
        error_message: "Model returned an empty response",
        raw_response: "",
        retry_attempted: false,
      };
    }

    // ── Response sanitizer — four explicit steps ─────────────────
    // Step 1: remove markdown code fences  (```json...``` or ```...```)
    // Step 2: trim leading prose / whitespace before the first {
    // Step 3: extract the outermost { ... } JSON object
    // Step 4: parse — throws on failure so the retry path fires
    const sanitize = (text) => {
      // Step 1: strip markdown fences
      let s = text.replace(/`{3}json[\s\S]*?`{3}|`{3}[\s\S]*?`{3}/g, "").trim();
      // Step 2: trim anything before the first {
      const firstBrace = s.indexOf("{");
      if (firstBrace > 0) s = s.slice(firstBrace);
      // Step 3: extract outermost { ... }
      const jsonMatch = s.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON object found in response");
      // Step 4: parse
      return JSON.parse(jsonMatch[0]);
    };
    try {
      const parsed = sanitize(raw);
      return { ok: true, ...parsed };
    } catch (parseErr) {
      // Retry once with a tighter instruction
      try {
        let retryRes, retryData;
        try {
          retryRes = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 1200,
              system: system + "\n\nCRITICAL: Your previous response could not be parsed as JSON. Return ONLY a valid JSON object. No markdown. No explanation. No code fences. Begin your response with { and end with }.",
              messages: [
                { role: "user",      content: userContent },
                { role: "assistant", content: raw },
                { role: "user",      content: "Your response was not valid JSON. Return only the JSON object now, starting with {." },
              ],
            }),
          });
          retryData = await retryRes.json();
        } catch(retryFetchErr) {
          throw retryFetchErr; // fall through to outer catch(retryErr)
        }
        const retryRaw      = retryData.content.map(b => b.text || "").join("\n") || "";
        const retryParsed   = sanitize(retryRaw);
        return { ok: true, ...retryParsed };
      } catch (retryErr) {
        return {
          ok: false,
          error_type: "json_parse_error",
          error_message: `JSON parse failed: ${parseErr.message}. Retry also failed: ${retryErr.message}`,
          raw_response: raw,
          retry_attempted: true,
        };
      }
    }
  },

  // Validate a phase result — throws a structured PhaseError if result is an error object
  assertPhase(result, stageName, phaseLabel) {
    if (!result || result.ok === false) {
      const err: any = new Error(result.error_message || "Unknown phase error");
      err.isPhaseError    = true;
      err.stage_name      = stageName;
      err.phase_label     = phaseLabel;
      err.error_type      = result.error_type      || "unknown_error";
      err.error_message   = result.error_message   || "No error details available";
      err.raw_response    = result.raw_response     || "";
      err.retry_attempted = (result && result.retry_attempted != null) ? result.retry_attempted : false;
      console.error(`[NCW Phase Error] case:${stageName}`, {
        stage_name:    err.stage_name,
        error_type:    err.error_type,
        error_message: err.error_message,
        raw_response:  err.raw_response.slice(0, 500),
      });
      throw err;
    }
    return result;
  },

  imgs(images) {
    const out = [];
    for (const img of images) {
      if (!img.data_url) continue;
      const [h, b] = img.data_url.split(",");
      const mt = h.match(/data:(.*?);/)[1] || "image/jpeg";
      out.push({ type: "image", source: { type: "base64", media_type: mt, data: b } });
      out.push({ type: "text", text: `[Image view: ${img.image_type}]` });
    }
    return out;
  },

  triggered(p1, key) {
    return p1.phase_triggers[key] !== false;
  },

  // Serialize WM for prompt injection
  wmSummary() {
    return `AUTHORITATIVE WEIGHT MATRIX (WM):
Tier weights: ${JSON.stringify(WM.tiers)}
Hard negative rules: ${JSON.stringify(WM.negative_rules)}
Conflict penalties: ${JSON.stringify(WM.penalties)}
Conflict recoveries: ${JSON.stringify(WM.recoveries)}
Confidence bands: High=85-100, Moderate=65-84, Low=40-64, Inconclusive=<40
Formula: confidence_pct = supporting / (supporting + opposing) × 100`;
  },

  // ============================================================
  // PHASE NORMALIZER
  // Sits between every raw model response and every phase validator.
  // Architecture: Prompt → raw response → normalize() → assertPhase → phase logic
  //
  // Each normalizer:
  //   A. Maps field aliases to canonical names
  //   B. Coerces types ("yes"→true, "0.72"→0.72, object→array when needed)
  //   C. Fills missing fields with safe defaults
  //   D. Accepts partial payloads — only fails when nothing recoverable
  //   E. Logs repair steps to console
  //
  // Called as: PE.normalize(raw, 'p1_intake')
  // Returns:   normalized object with ok:true, or original ok:false error object
  // ============================================================
  normalize(raw, phase) {
    // If callClaude returned a parse error, attempt extraction from raw_response
    if (raw && raw.ok === false && raw.raw_response) {
      const rr = raw.raw_response;
      const s = rr.indexOf("{"), e = rr.lastIndexOf("}");
      if (s !== -1 && e > s) {
        try {
          const recovered = JSON.parse(rr.slice(s, e + 1));
          console.info("[NCW Normalizer] Recovered JSON from raw_response for", phase);
          raw = recovered;  // fall through to alias/default logic below
        } catch(_re) {
          console.warn("[NCW Normalizer] Recovery parse failed for", phase, "— returning error");
          return raw;
        }
      } else {
        return raw;
      }
    }
    if (!raw || raw.ok === false) return raw;

    const toBool = (v) => {
      if (typeof v === "boolean") return v;
      if (typeof v === "number")  return v !== 0;
      if (typeof v === "string") {
        const s = v.toLowerCase().trim();
        if (["yes","true","present","1","detected","found","positive"].includes(s)) return true;
        if (["no","false","absent","none","0","not detected","negative","not found","n/a"].includes(s)) return false;
      }
      return false;
    };
    const toNum = (v, def=0) => { const n=parseFloat(v); return isNaN(n)?def:n; };
    const toArr = (v) => { if (Array.isArray(v)) return v; if (!v) return []; if (typeof v==="object") return [v]; return []; };
    const toConf = (v) => {
      if (!v) return "Low";
      const s=String(v).toLowerCase();
      if (s.includes("high")) return "High";
      if (s.includes("mod"))  return "Moderate";
      if (s.includes("inc"))  return "Inconclusive";
      return "Low";
    };

    const repairs = [];
    const alias = (obj, from, to, coerce) => {
      if (obj[from] !== undefined && obj[to] === undefined) {
        obj[to] = coerce ? coerce(obj[from]) : obj[from];
        repairs.push(`${from}→${to}`);
      }
    };
    const n = { ...raw };

    switch (phase) {

      case "p1_intake": {
        // ── Primary aliases ──
        const identity = function(v) { return v; };
        alias(n,"images_present","visible_image_types",toArr);
        alias(n,"image_types","visible_image_types",toArr);
        alias(n,"sufficiency","evidence_sufficiency", identity);
       alias(n,"quality_notes","image_quality_notes", identity);
alias(n,"user_guess","user_stated_category", identity);
alias(n,"category_guess","user_stated_category", identity);
alias(n,"form_guess","broad_form_guess", identity);
alias(n,"wood","visible_primary_wood", identity);
alias(n,"primary_wood","visible_primary_wood", identity);
alias(n,"condition","overall_condition", identity);
alias(n,"flags","red_flags", toArr);
alias(n,"triggers","phase_triggers", identity);
alias(n,"caps","confidence_caps", identity);
alias(n,"recommendation","proceed_recommendation", identity);
// — Extended aliases — common LLM variations —
alias(n,"image_list","visible_image_types", toArr);
alias(n,"photos","visible_image_types", toArr);
alias(n,"photo_types","visible_image_types", toArr);
alias(n,"evidence_quality","evidence_sufficiency", identity);
alias(n,"overall_evidence_sufficiency","evidence_sufficiency", identity);
alias(n,"quality","image_quality_notes", identity);
alias(n,"image_quality","image_quality_notes", identity);
alias(n,"stated_category","user_stated_category", identity);
alias(n,"user_category","user_stated_category", identity);
alias(n,"form","broad_form_guess", identity);
alias(n,"furniture_type","broad_form_guess", identity);
alias(n,"primary_wood_species","visible_primary_wood", identity);
alias(n,"secondary_wood","visible_secondary_wood", identity);
alias(n,"secondary_wood_species","visible_secondary_wood", identity);
alias(n,"red_flags_noted","red_flags", toArr);
alias(n,"concerns","red_flags", toArr);
alias(n,"phase_trigger_rules","phase_triggers", identity);
alias(n,"confidence_cap_rules","confidence_caps", identity);
alias(n,"proceed","proceed_recommendation", identity);
        // ── Functional-mechanism fields (requested normalization) ──
        const toBoolLocal = function(v) {
          if (typeof v === "boolean") return v;
          if (typeof v === "number")  return v !== 0;
          if (typeof v === "string") {
            const s = v.toLowerCase().trim();
            if (["yes","true","present","1","detected","found","positive"].includes(s)) return true;
            if (["no","false","absent","none","0","not detected","negative","not found","n/a"].includes(s)) return false;
          }
          return false;
        };
        alias(n,"folds","folds_or_expands",toBoolLocal);
        alias(n,"expands","folds_or_expands",toBoolLocal);
        alias(n,"folds_expands","folds_or_expands",toBoolLocal);
        alias(n,"mechanical","mechanical_parts",toBoolLocal);
        alias(n,"mechanism","mechanical_parts",toBoolLocal);
        alias(n,"has_mechanism","mechanical_parts",toBoolLocal);
        alias(n,"prior_function","conversion_possible",toBoolLocal);
        alias(n,"conversion","conversion_possible",toBoolLocal);
        alias(n,"convertible","conversion_possible",toBoolLocal);
        alias(n,"drawers","has_drawers",toBoolLocal);
        alias(n,"doors","has_doors",toBoolLocal);
        if (n.folds_or_expands  === undefined) { n.folds_or_expands  = false; }
        if (n.mechanical_parts  === undefined) { n.mechanical_parts  = false; }
        if (n.conversion_possible=== undefined) { n.conversion_possible = false; }
        if (n.has_drawers       === undefined) { n.has_drawers        = false; }
        if (n.has_doors         === undefined) { n.has_doors          = false; }
        n.folds_or_expands   = toBoolLocal(n.folds_or_expands);
        n.mechanical_parts   = toBoolLocal(n.mechanical_parts);
        n.conversion_possible= toBoolLocal(n.conversion_possible);
        n.has_drawers        = toBoolLocal(n.has_drawers);
        n.has_doors          = toBoolLocal(n.has_doors);

        if (!n.visible_image_types)    { n.visible_image_types=[]; repairs.push("default visible_image_types"); }
        if (!n.evidence_sufficiency)   { n.evidence_sufficiency="Moderate"; repairs.push("default evidence_sufficiency"); }
        if (!n.image_quality_notes)    n.image_quality_notes="";
        if (!n.user_stated_category)   n.user_stated_category=null;
        if (!n.broad_form_guess)       n.broad_form_guess=null;
        if (!n.visible_primary_wood)   n.visible_primary_wood=null;
        if (!n.visible_secondary_wood) n.visible_secondary_wood=null;
        if (!n.overall_condition)      { n.overall_condition="unknown"; repairs.push("default overall_condition"); }
        if (!Array.isArray(n.red_flags)) { n.red_flags=[]; repairs.push("default red_flags"); }
        if (!Array.isArray(n.missing_critical_evidence)) { n.missing_critical_evidence=[]; repairs.push("default missing_critical_evidence"); }

        if (!n.evidence_inventory || typeof n.evidence_inventory !== "object") {
          const cats=["overall_form_view","underside_hidden_surface","hardware_closeup","joinery_drawer_construction","interior_structure","finish_closeup","back_board"];
          const inv={};
          for (const c of cats) inv[c]=n[c]?String(n[c]):"absent";
          n.evidence_inventory=inv; repairs.push("reconstructed evidence_inventory");
        }
        for (const k of Object.keys(n.evidence_inventory)) {
          const v=n.evidence_inventory[k];
          if (typeof v==="boolean") { n.evidence_inventory[k]=v?"present":"absent"; repairs.push(`evidence_inventory.${k} bool→str`); }
          if (!n.evidence_inventory[k]) n.evidence_inventory[k]="absent";
        }

        const capDefs={date_confidence_cap:"none",construction_confidence_cap:"none",hardware_originality_cap:"none",form_confidence_cap:"none",overall_confidence_cap:"none",valuation_confidence_cap:"none"};
        if (!n.confidence_caps||typeof n.confidence_caps!=="object") { n.confidence_caps={...capDefs}; repairs.push("default confidence_caps"); }
        else { for (const[k,v] of Object.entries(capDefs)) { if (!n.confidence_caps[k]) n.confidence_caps[k]=v; } }

        const trigDefs={run_dating_grid:true,run_form_engine:true,run_construction:true,run_hardware:true};
        if (!n.phase_triggers||typeof n.phase_triggers!=="object") { n.phase_triggers={...trigDefs}; repairs.push("default phase_triggers (all true)"); }
        else { for (const[k,v] of Object.entries(trigDefs)) { if (n.phase_triggers[k]===undefined) n.phase_triggers[k]=v; else n.phase_triggers[k]=toBool(n.phase_triggers[k]); } }

        if (!n.proceed_recommendation) n.proceed_recommendation="proceed";
        break;
      }

      case "p2_dating": {
        alias(n,"toolmarks","toolmark_observations",toArr);
        alias(n,"fasteners","fastener_observations",toArr);
        alias(n,"joinery","joinery_observations",toArr);
        const identity = function(v) { return v; };
        alias(n,"materials","material_observations",toArr);
        alias(n,"finish","finish_observations",toArr);
        alias(n,"date_range","primary_date_range", identity);
alias(n,"dating_range","primary_date_range", identity);
alias(n,"estimated_date","primary_date_range", identity);
alias(n,"date_band","primary_date_range", identity);
        alias(n,"confidence","dating_confidence",toConf);
        alias(n,"key_clues","key_dating_evidence",toArr);
        alias(n,"supporting_clues","key_dating_evidence",toArr);
        alias(n,"hard_negatives","hard_negatives_triggered",toArr);
        alias(n,"negative_evidence","negative_evidence_applied",toArr);

        if (!n.toolmark_observations)    { n.toolmark_observations=[]; repairs.push("default toolmark_observations"); }
        if (!n.fastener_observations)    { n.fastener_observations=[]; repairs.push("default fastener_observations"); }
        if (!n.joinery_observations)     { n.joinery_observations=[]; repairs.push("default joinery_observations"); }
        if (!n.material_observations)    { n.material_observations=[]; repairs.push("default material_observations"); }
        if (!n.finish_observations)      { n.finish_observations=[]; repairs.push("default finish_observations"); }
        if (!n.primary_date_range)       { n.primary_date_range="Date uncertain"; repairs.push("default primary_date_range"); }
        if (!n.earliest_possible_year)   { n.earliest_possible_year=1800; repairs.push("default earliest_possible_year"); }
        if (!n.latest_possible_year)     { n.latest_possible_year=1975; repairs.push("default latest_possible_year"); }
        if (!n.key_dating_evidence)      { n.key_dating_evidence=[]; repairs.push("default key_dating_evidence"); }
        if (!n.negative_evidence_applied) { n.negative_evidence_applied=[]; repairs.push("default negative_evidence_applied"); }
        if (!n.dating_conflicts)         { n.dating_conflicts=[]; repairs.push("default dating_conflicts"); }
        if (!n.hard_negatives_triggered) { n.hard_negatives_triggered=[]; repairs.push("default hard_negatives_triggered"); }
        if (n.age_support_points===undefined)  { n.age_support_points=0;  repairs.push("default age_support_points"); }
        if (n.age_opposing_points===undefined) { n.age_opposing_points=0; repairs.push("default age_opposing_points"); }
        if (!n.dating_confidence)        { n.dating_confidence="Low"; repairs.push("default dating_confidence"); }
        else n.dating_confidence=toConf(n.dating_confidence);
        if (!n.era_intersection_logic)   n.era_intersection_logic="";
        if (!n.caps_applied)             n.caps_applied=[];
        if (!Array.isArray(n.new_observations))       { n.new_observations=[]; repairs.push("default new_observations"); }
        if (!Array.isArray(n.candidates))             { n.candidates=[]; repairs.push("default candidates"); }
        if (!Array.isArray(n.eliminated))             { n.eliminated=[]; repairs.push("default eliminated"); }
        if (!Array.isArray(n.confidence_adjustments)) { n.confidence_adjustments=[]; repairs.push("default confidence_adjustments"); }
        n.phase2_schema_valid = true;
        break;
      }

      case "p3_form": {
        const identity = function(v) { return v; };
        alias(n,"current_form","current_form_candidate", identity);
alias(n,"form","current_form_candidate", identity);
alias(n,"identified_form","current_form_candidate", identity);
alias(n,"original_form","original_form_candidate", identity);
        alias(n,"alternates","alternate_form_candidates",toArr);
        alias(n,"alternate_forms","alternate_form_candidates",toArr);
        alias(n,"converted","is_conversion",toBool);
        alias(n,"is_converted","is_conversion",toBool);
        alias(n,"conversion_evidence_list","conversion_evidence",toArr);
        alias(n,"conversion_prob","conversion_probability", identity);
        alias(n,"form_conf","form_confidence",toConf);
        alias(n,"confidence","form_confidence",toConf);
        alias(n,"reasoning","form_reasoning", identity);
        alias(n,"form_support","form_support_points",toNum);
        alias(n,"form_opposing","form_opposing_points",toNum);
        alias(n,"conversion_support","conversion_support_points",toNum);

        if (!n.form_detection_method)      { n.form_detection_method="visual_impression"; repairs.push("default form_detection_method"); }
        if (n.mechanical_signature_detected===undefined) n.mechanical_signature_detected=null;
        if (!n.current_form_candidate)    { n.current_form_candidate="unknown"; repairs.push("default current_form_candidate"); }
        if (!n.original_form_candidate)   { n.original_form_candidate=n.current_form_candidate; repairs.push("original_form_candidate←current"); }
        if (!n.alternate_form_candidates)  n.alternate_form_candidates=[];
        if (!n.form_scoring_detail)        n.form_scoring_detail=[];
        if (n.form_support_points===undefined)     { n.form_support_points=0;    repairs.push("default form_support_points"); }
        if (n.form_opposing_points===undefined)    { n.form_opposing_points=0;   repairs.push("default form_opposing_points"); }
        if (n.conversion_support_points===undefined) { n.conversion_support_points=0; repairs.push("default conversion_support_points"); }
        if (n.conversion_opposing_points===undefined) n.conversion_opposing_points=0;
        if (n.current_form_score===undefined)   n.current_form_score=0;
        if (n.original_form_score===undefined)  n.original_form_score=0;
        if (n.is_conversion===undefined)         { n.is_conversion=false; repairs.push("default is_conversion=false"); }
        else n.is_conversion=toBool(n.is_conversion);
        if (!n.conversion_evidence)        n.conversion_evidence=[];
        if (!n.conversion_probability)    { n.conversion_probability="Low"; repairs.push("default conversion_probability"); }
        if (!n.form_confidence)           { n.form_confidence="Low"; repairs.push("default form_confidence"); }
        else n.form_confidence=toConf(n.form_confidence);
        if (!n.form_conflicts)             n.form_conflicts=[];
        if (!n.form_reasoning)            { n.form_reasoning="Insufficient evidence to determine form."; repairs.push("default form_reasoning"); }
        if (!n.caps_applied)               n.caps_applied=[];
        break;
      }

      case "p4_construction": {
        alias(n,"joinery_type","primary_joinery_type");
        alias(n,"joinery","primary_joinery_type");
        alias(n,"manufacturing","manufacturing_mode");
        alias(n,"manufacturing_method","manufacturing_mode");
        alias(n,"drawer_bottom","drawer_construction");
        alias(n,"back_construction","back_panel_construction");
        alias(n,"secondary_wood_species","secondary_wood");
        alias(n,"wood_species","secondary_wood");
        alias(n,"anomalies","structural_anomalies",toArr);
        alias(n,"special","special_structures",toArr);
        alias(n,"hard_negatives","hard_negatives_triggered",toArr);
        alias(n,"date_range","construction_date_range");
        alias(n,"construction_date","construction_date_range");
        alias(n,"confidence","construction_confidence",toConf);
        alias(n,"conflicts","construction_conflicts",toArr);

        if (!n.construction_scoring_detail) n.construction_scoring_detail=[];
        if (n.age_support_points===undefined)    { n.age_support_points=0;    repairs.push("default age_support_points"); }
        if (n.age_opposing_points===undefined)   { n.age_opposing_points=0;   repairs.push("default age_opposing_points"); }
        if (n.originality_support_points===undefined)  n.originality_support_points=0;
        if (n.originality_opposing_points===undefined) n.originality_opposing_points=0;
        if (n.form_support_from_structure===undefined)       n.form_support_from_structure=0;
        if (n.conversion_support_from_structure===undefined) n.conversion_support_from_structure=0;
        if (!n.manufacturing_mode)    { n.manufacturing_mode="unknown"; repairs.push("default manufacturing_mode"); }
        if (!n.primary_joinery_type)  { n.primary_joinery_type="unknown"; repairs.push("default primary_joinery_type"); }
        if (n.joinery_confidence===undefined) n.joinery_confidence=0;
        if (!n.drawer_construction)   n.drawer_construction="";
        if (!n.back_panel_construction) n.back_panel_construction="";
        if (!n.secondary_wood)        n.secondary_wood="";
        if (!n.special_structures)    n.special_structures=[];
        if (!n.structural_anomalies)  n.structural_anomalies=[];
        if (!n.hard_negatives_triggered) n.hard_negatives_triggered=[];
        if (!n.construction_date_range) { n.construction_date_range="unknown"; repairs.push("default construction_date_range"); }
        if (!n.construction_conflicts)  n.construction_conflicts=[];
        if (!n.construction_confidence) { n.construction_confidence="Low"; repairs.push("default construction_confidence"); }
        else n.construction_confidence=toConf(n.construction_confidence);
        if (!n.caps_applied) n.caps_applied=[];
        break;
      }

      case "p5_hardware": {
        alias(n,"hardware","hardware_scoring_detail",toArr);
        alias(n,"hardware_items","hardware_scoring_detail",toArr);
        alias(n,"date_range","hardware_date_range");
        alias(n,"hardware_date","hardware_date_range");
        alias(n,"consistency","hardware_consistency");
        alias(n,"style_family","style_family_suggested");
        alias(n,"style","style_family_suggested");
        alias(n,"concerns","originality_concerns",toArr);
        alias(n,"conflicts","hardware_conflicts",toArr);
        alias(n,"hard_negatives","hard_negatives_triggered",toArr);
        alias(n,"confidence","hardware_confidence",toConf);
        alias(n,"notes","hardware_notes");

        if (!n.hardware_scoring_detail)  { n.hardware_scoring_detail=[]; repairs.push("default hardware_scoring_detail"); }
        if (n.age_support_points===undefined)    { n.age_support_points=0;    repairs.push("default age_support_points"); }
        if (n.age_opposing_points===undefined)   { n.age_opposing_points=0;   repairs.push("default age_opposing_points"); }
        if (n.originality_support_points===undefined)  n.originality_support_points=0;
        if (n.originality_opposing_points===undefined) n.originality_opposing_points=0;
        if (!n.hard_negatives_triggered) n.hard_negatives_triggered=[];
        if (!n.hardware_date_range)      { n.hardware_date_range="unknown"; repairs.push("default hardware_date_range"); }
        if (!n.hardware_consistency)     { n.hardware_consistency="unknown"; repairs.push("default hardware_consistency"); }
        if (n.style_family_suggested===undefined) n.style_family_suggested=null;
        if (!n.originality_concerns)     n.originality_concerns=[];
        if (!n.hardware_conflicts)       n.hardware_conflicts=[];
        if (!n.hardware_confidence)      { n.hardware_confidence="Low"; repairs.push("default hardware_confidence"); }
        else n.hardware_confidence=toConf(n.hardware_confidence);
        if (!n.hardware_notes)           n.hardware_notes="";
        if (!n.caps_applied)             n.caps_applied=[];
        break;
      }

      case "p6_conflict": {
        alias(n,"conflicts","conflicts_detected",toArr);
        alias(n,"conflict_list","conflicts_detected",toArr);
        alias(n,"issues","conflicts_detected",toArr);
        alias(n,"net_adjustment","total_net_adjustment",toNum);
        alias(n,"classification","object_classification_suggested");
        alias(n,"interpretation","conflict_interpretation_for_report");
        alias(n,"conflict_summary_text","conflict_summary");

        if (!n.conflicts_detected)      { n.conflicts_detected=[]; repairs.push("default conflicts_detected"); }
        if (n.no_conflicts_detected===undefined) n.no_conflicts_detected=n.conflicts_detected.length===0;
        if (n.total_penalty===undefined)    n.total_penalty=0;
        if (n.total_recovery===undefined)   n.total_recovery=0;
        if (n.total_net_adjustment===undefined) { n.total_net_adjustment=n.total_recovery-n.total_penalty; repairs.push("computed total_net_adjustment"); }
        if (!n.conflict_summary)        n.conflict_summary="";
        if (!n.object_classification_suggested) { n.object_classification_suggested="unknown"; repairs.push("default object_classification_suggested"); }
        if (!n.conflict_interpretation_for_report) n.conflict_interpretation_for_report="";
        break;
      }

      case "p7_reconciliation": {
        alias(n,"date_range","reconciled_date_range");
        alias(n,"final_date","reconciled_date_range");
        alias(n,"date","reconciled_date_range");
        alias(n,"style","reconciled_style_family");
        alias(n,"style_family","reconciled_style_family");
        alias(n,"form","reconciled_form");
        alias(n,"current_form","reconciled_form");
        alias(n,"original","original_form");
        alias(n,"alterations_list","alterations",toArr);
        alias(n,"changes","alterations",toArr);
        alias(n,"evidence","supporting_evidence",toArr);
        alias(n,"key_evidence","supporting_evidence",toArr);
        alias(n,"conflicts","conflicts_found",toArr);
        alias(n,"negative_clues","negative_evidence_applied",toArr);
        alias(n,"confidence_pct","confidence_percent",toNum);
        alias(n,"confidence_score","confidence_percent",toNum);
        alias(n,"confidence","confidence_band",toConf);
        alias(n,"band","confidence_band",toConf);
        alias(n,"classification","object_classification");
        alias(n,"notes","reconciliation_notes");
        alias(n,"summary","reconciliation_notes");

        if (!n.reconciled_date_range)     { n.reconciled_date_range="Undetermined"; repairs.push("default reconciled_date_range"); }
        if (!n.reconciled_form)           { n.reconciled_form="unknown"; repairs.push("default reconciled_form"); }
        if (!n.original_form)              n.original_form=n.reconciled_form;
        if (!n.alterations)                n.alterations=[];
        if (!n.supporting_evidence)       { n.supporting_evidence=[]; repairs.push("default supporting_evidence"); }
        if (!n.conflicts_found)            n.conflicts_found=[];
        if (!n.negative_evidence_applied)  n.negative_evidence_applied=[];
        if (n.confidence_percent===undefined) { n.confidence_percent=50; repairs.push("default confidence_percent=50"); }
        if (!n.confidence_band)            { n.confidence_band=WM.bandOf(toNum(n.confidence_percent,50)); repairs.push("computed confidence_band"); }
        else n.confidence_band=toConf(n.confidence_band);
        if (!n.object_classification)      n.object_classification=n.object_classification_suggested||"unknown";
        if (!n.reconciliation_notes)      { n.reconciliation_notes=""; repairs.push("default reconciliation_notes"); }
        if (!n.scorecard)                  n.scorecard={};
        if (n.overall_supporting_points===undefined) n.overall_supporting_points=0;
        if (n.overall_opposing_points===undefined)   n.overall_opposing_points=0;
        break;
      }

      case "p8_valuation": {
        alias(n,"market_estimates","valuations",toArr);
        alias(n,"estimates","valuations",toArr);
        alias(n,"value_ranges","valuations",toArr);
        alias(n,"lanes","valuations",toArr);
        alias(n,"drivers","value_drivers",toArr);
        alias(n,"detractors","value_detractors",toArr);
        alias(n,"market_context","market_notes");
        alias(n,"notes","market_notes");

        if (!n.valuations) { n.valuations=[]; repairs.push("default valuations"); }
        n.valuations=toArr(n.valuations).map((v,i)=>{
          if (!v||typeof v!=="object") return null;
          const vn={...v};
          if (!vn.market_lane) { vn.market_lane=vn.lane||vn.name||vn.type||`lane_${i}`; repairs.push(`valuation[${i}] market_lane from alias`); }
          if (vn.low===undefined&&vn.low_estimate!==undefined) vn.low=vn.low_estimate;
          if (vn.high===undefined&&vn.high_estimate!==undefined) vn.high=vn.high_estimate;
          if (vn.low===undefined) { vn.low=0; repairs.push(`valuation[${i}] default low`); }
          if (vn.high===undefined) vn.high=vn.low;
          vn.low=toNum(vn.low); vn.high=toNum(vn.high);
          if (!vn.rationale) vn.rationale="";
          return vn;
        }).filter(Boolean);

        if (!n.value_drivers)    { n.value_drivers=[]; repairs.push("default value_drivers"); }
        if (!n.value_detractors) { n.value_detractors=[]; repairs.push("default value_detractors"); }
        if (!n.market_notes)      n.market_notes="";
        if (n.valuation_skipped===undefined) n.valuation_skipped=false;
        if (!n.value_adjustments_applied) n.value_adjustments_applied=[];
        break;
      }

      default: break;
    }

    if (repairs.length>0) console.info(`[NCW Normalizer:${phase}] Repaired ${repairs.length} field(s): ${repairs.join(", ")}`);
    n._normalized=true; n._phase=phase; n._repairs=repairs;
    return n;
  },


  // ============================================================
  // VISUAL EVIDENCE LIBRARY
  // Defines every clue category the scanner can match.
  // Each entry includes:
  //   reference_table  — which DB table holds this clue
  //   reference_id     — id in that table (from WM.clues keys)
  //   observation_type — category label written to case_observations
  //   image_types      — which image slots are relevant for this clue
  //   is_hidden_surface— true if evidence is typically on an unexposed surface
  //   weight_multiplier— default multiplier; reduced for low-quality images
  //   description      — what Claude should look for visually
  // ============================================================
  VISUAL_LIBRARY: [

    // ── TOOLMARKS ──────────────────────────────────────────────
    {
      clue_key:         "pit_saw_marks",
      reference_table:  "toolmark_clues",
      observation_type: "toolmark",
      image_types:      ["underside","back","joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Irregular, slightly curved or diagonal saw marks from a hand-operated pit saw. Lines are uneven, may show slight waviness, spacing varies. Found on undersides of boards and rough secondary surfaces. Pre-1830.",
    },
    {
      clue_key:         "circular_saw_arcs",
      reference_table:  "toolmark_clues",
      observation_type: "toolmark",
      image_types:      ["underside","back","joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Parallel arc-shaped marks in consistent curved patterns from a circular saw blade. Lines curve uniformly in one direction. Post-1830, strong indicator post-1840.",
    },
    {
      clue_key:         "band_saw_lines",
      reference_table:  "toolmark_clues",
      observation_type: "toolmark",
      image_types:      ["underside","back","joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Thin, straight, closely-spaced parallel lines from a band saw blade. Marks are very fine and uniform. Post-1870.",
    },
    {
      clue_key:         "hand_plane_chatter",
      reference_table:  "toolmark_clues",
      observation_type: "toolmark",
      image_types:      ["underside","back","joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 0.7,
      description: "Subtle, slightly irregular ridges or scallop patterns from hand planing. Surface appears slightly undulating rather than perfectly flat. Any era but indicates hand finishing.",
    },
    {
      clue_key:         "machine_routing_uniform",
      reference_table:  "toolmark_clues",
      observation_type: "toolmark",
      image_types:      ["joinery_closeup","overall_front"],
      is_hidden_surface: false,
      weight_multiplier: 0.9,
      description: "Perfectly uniform routed profile with consistent depth and smooth walls on moldings or grooves. No variation in depth or width. Post-1900.",
    },

    // ── FASTENERS ──────────────────────────────────────────────
    {
      clue_key:         "hand_forged_nail",
      reference_table:  "fastener_clues",
      observation_type: "fastener",
      image_types:      ["underside","back","joinery_closeup","hardware_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Nail with irregular, hammered head — not perfectly round or flat. Shank tapers on all four sides (not just two). Head may be slightly off-center. Pre-1800.",
    },
    {
      clue_key:         "cut_nail",
      reference_table:  "fastener_clues",
      observation_type: "fastener",
      image_types:      ["underside","back","joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Rectangular cross-section nail cut from sheet metal. Head is flat and rectangular. Shank tapers on two sides only, remaining sides parallel. 1790–1890.",
    },
    {
      clue_key:         "wire_nail",
      reference_table:  "fastener_clues",
      observation_type: "fastener",
      image_types:      ["underside","back","joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Round cross-section nail with circular head. Shank is perfectly cylindrical. Modern appearance. Post-1880.",
    },
    {
      clue_key:         "slotted_handmade_screw",
      reference_table:  "fastener_clues",
      observation_type: "fastener",
      image_types:      ["hardware_closeup","joinery_closeup"],
      is_hidden_surface: false,
      weight_multiplier: 1.0,
      description: "Slotted screw with off-center slot, irregular thread spacing, and slightly uneven head. Tip may be blunt rather than sharp point. 1770–1840.",
    },
    {
      clue_key:         "slotted_machine_screw",
      reference_table:  "fastener_clues",
      observation_type: "fastener",
      image_types:      ["hardware_closeup","joinery_closeup"],
      is_hidden_surface: false,
      weight_multiplier: 0.8,
      description: "Slotted screw with centered slot, uniform threads, perfectly round head. Sharp pointed tip. Post-1840.",
    },
    {
      clue_key:         "phillips_screw",
      reference_table:  "fastener_clues",
      observation_type: "fastener",
      image_types:      ["hardware_closeup","joinery_closeup","underside"],
      is_hidden_surface: false,
      weight_multiplier: 1.0,
      description: "Cross-shaped Phillips head recess. Unmistakable X pattern in head. Hard negative for pre-1930 claims. Post-1930.",
    },

    // ── JOINERY ────────────────────────────────────────────────
    {
      clue_key:         "hand_cut_dovetails",
      reference_table:  "construction_clues",
      observation_type: "joinery",
      image_types:      ["joinery_closeup","underside"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Dovetail joints with slightly irregular pin spacing, varying angles, and subtle hand-cut variation. Pins and tails may differ slightly in width. Saw lines not perfectly parallel. Pre-1860 (rural to 1890).",
    },
    {
      clue_key:         "machine_dovetails",
      reference_table:  "construction_clues",
      observation_type: "joinery",
      image_types:      ["joinery_closeup"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Dovetail joints with perfectly uniform pin spacing and identical angles throughout. Machine-perfect regularity. Post-1860.",
    },
    {
      clue_key:         "mortise_and_tenon",
      reference_table:  "construction_clues",
      observation_type: "joinery",
      image_types:      ["joinery_closeup","overall_side"],
      is_hidden_surface: false,
      weight_multiplier: 0.9,
      description: "Rectangular peg-in-slot joint visible at frame corners or stretchers. May show wooden pegs or wedges. Frame members meet at right angles with no metal fasteners at joint. 1600–1900.",
    },
    {
      clue_key:         "dowel_joinery",
      reference_table:  "construction_clues",
      observation_type: "joinery",
      image_types:      ["joinery_closeup"],
      is_hidden_surface: false,
      weight_multiplier: 0.8,
      description: "Round wooden dowel pegs visible at joint faces. Perfectly round holes. Post-1900 indicator.",
    },
    {
      clue_key:         "solid_board_drawer_bottom",
      reference_table:  "construction_clues",
      observation_type: "construction",
      image_types:      ["joinery_closeup","underside"],
      is_hidden_surface: true,
      weight_multiplier: 0.9,
      description: "Drawer bottom made from a single solid wood board, usually chamfered at edges to fit groove. Grain runs side to side. May show shrinkage cracks. Pre-industrial indicator.",
    },
    {
      clue_key:         "plywood_drawer_bottom",
      reference_table:  "construction_clues",
      observation_type: "construction",
      image_types:      ["joinery_closeup","underside"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Drawer bottom showing visible plywood layers at edges — multiple thin laminated layers. HARD NEGATIVE for antique claim. Post-1920.",
    },

    // ── HARDWARE ───────────────────────────────────────────────
    {
      clue_key:         "victorian_strap_hinge",
      reference_table:  "hardware_types",
      observation_type: "hardware",
      image_types:      ["hardware_closeup","overall_front"],
      is_hidden_surface: false,
      weight_multiplier: 0.9,
      description: "Long decorative strap hinge with Gothic or Victorian revival styling — pointed ends, ornate surface detail, surface-mounted. 1865–1895. Check for matching patina and mounting screw type.",
    },
    {
      clue_key:         "batwing_brass_pull",
      reference_table:  "hardware_types",
      observation_type: "hardware",
      image_types:      ["hardware_closeup","overall_front"],
      is_hidden_surface: false,
      weight_multiplier: 0.5,   // max 0.5 — high replacement risk
      description: "Bat-wing shaped brass bail pull with willow or batwing backplate. 18th-century style. 1720–1790 originally but HIGH replacement risk — always apply 0.5 multiplier max.",
    },
    {
      clue_key:         "eastlake_pull",
      reference_table:  "hardware_types",
      observation_type: "hardware",
      image_types:      ["hardware_closeup","overall_front"],
      is_hidden_surface: false,
      weight_multiplier: 0.9,
      description: "Incised geometric or stylized pull with angular Eastlake aesthetic — angular, machined surface ornament. 1870–1890.",
    },
    {
      clue_key:         "porcelain_caster",
      reference_table:  "hardware_types",
      observation_type: "hardware",
      image_types:      ["hardware_closeup","overall_front","overall_side"],
      is_hidden_surface: false,
      weight_multiplier: 0.9,
      description: "Caster with white porcelain or ceramic wheel and metal fork bracket. Wheel is ceramic, not rubber or metal. 1830–1870.",
    },
    {
      clue_key:         "modern_concealed_hinge",
      reference_table:  "hardware_types",
      observation_type: "hardware",
      image_types:      ["hardware_closeup","overall_front"],
      is_hidden_surface: false,
      weight_multiplier: 1.0,
      description: "European-style cup hinge with circular cup mortised into door face. Fully concealed when door closed. HARD NEGATIVE for antique claim. Post-1950.",
    },

    // ── CONVERSION CAVITIES ────────────────────────────────────
    {
      clue_key:         "pedal_cavity_structure",
      reference_table:  "construction_clues",
      observation_type: "hidden_structure",
      image_types:      ["underside","overall_side","overall_front"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Internal cavity or void at lower section consistent with pump organ pedal mechanism — typically 6–10 inches deep, full width, with evidence of bellows mounting points or pedal pivot hardware. 1850–1920.",
    },
    {
      clue_key:         "treadle_mount",
      reference_table:  "construction_clues",
      observation_type: "hidden_structure",
      image_types:      ["underside","overall_side"],
      is_hidden_surface: true,
      weight_multiplier: 1.0,
      description: "Structural mounting hardware or cavity for treadle mechanism — iron bracket holes, pivot points, or reinforced lower frame consistent with sewing machine treadle. 1860–1910.",
    },
    {
      clue_key:         "ice_chamber",
      reference_table:  "construction_clues",
      observation_type: "hidden_structure",
      image_types:      ["overall_front","overall_side"],
      is_hidden_surface: false,
      weight_multiplier: 1.0,
      description: "Insulated interior chamber with thick walls, metal liner, or drain fitting. Upper compartment for ice block, lower for food. 1880–1920.",
    },

    // ── FINISH PATTERNS ────────────────────────────────────────
    {
      clue_key:         "shellac",
      reference_table:  "finish_types",
      observation_type: "finish",
      image_types:      ["overall_front","hardware_closeup"],
      is_hidden_surface: false,
      weight_multiplier: 0.7,
      description: "Shellac finish shows characteristic crazing or alligatoring with age — fine network of cracks. Warm amber tone. Dissolves with alcohol (test not visual). 1800–1920.",
    },
    {
      clue_key:         "oil_finish",
      reference_table:  "finish_types",
      observation_type: "finish",
      image_types:      ["overall_front","joinery_closeup"],
      is_hidden_surface: false,
      weight_multiplier: 0.5,
      description: "Low-sheen penetrating oil finish. Surface appears to have absorbed the finish rather than built a film coat. No surface film, no crazing. Any era.",
    },
    {
      clue_key:         "polyurethane",
      reference_table:  "finish_types",
      observation_type: "finish",
      image_types:      ["overall_front","hardware_closeup"],
      is_hidden_surface: false,
      weight_multiplier: 0.8,
      description: "Thick plastic-looking film coat. High or semi-gloss plastic sheen. May show peeling, chipping, or clouding at edges. NEGATIVE indicator for original antique finish. Post-1960.",
    },
  ],
  // ─────────────────────────────────────────────────────────────
  // PHASE 0 — Visual Evidence Scanner  (single authoritative definition)
  //
  // TOLERANCE CONTRACT — never hard-fails if photos are present:
  //   1. Raw result parsed → recovery layer normalizes it
  //   2. Aliases: detected_clues/clues/findings/items → observations
  //   3. observations may be object (by-type) OR flat array → both handled
  //   4. Each observation: missing fields filled with safe defaults
  //   5. JSON parse failure → one automatic retry with tighter prompt
  //   6. Total failure → safe empty p0 + phase_0_status flag, pipeline continues
  //
  // Minimal acceptable raw payload:
  //   { "observations": { "toolmarks": [...], ... } }   ← object-by-type (preferred)
  //   { "observations": [...] }                          ← flat array (also accepted)
  //   { "detected_clues": [...] }                        ← alias accepted
  //
  // Output shape consumed by all downstream phases:
  //   { skipped, total_observations, observations_by_type,
  //     hard_negatives_detected, images_scanned, scan_summary,
  //     phase_0_status, recovery_used,
  //     primary_wood_observed, secondary_wood_observed,
  //     broad_form_impression, condition_impression, anomalies_noted }
  // ─────────────────────────────────────────────────────────────
  async p0(images) {
    // ── Safe empty result — used when total failure occurs ─────
    const safeEmpty = (reason, rawResponse) => ({
      skipped:                false,
      phase_0_status:         "no_reliable_observations_recovered",
      recovery_used:          false,
      total_observations:     0,
      observations_by_type:   {},
      hard_negatives_detected:[],
      images_scanned:         (images || []).filter(i => i.data_url).length,
      scan_summary:           { scan_confidence:"low", images_scanned:[], image_quality_issues:[], total_observations:0, hard_negatives_found:[] },
      primary_wood_observed:  "",
      secondary_wood_observed:"",
      broad_form_impression:  "",
      condition_impression:   "unknown",
      anomalies_noted:        [],
      notes:                  `Images present but no structured clues extracted. Reason: ${reason}`,
      _raw_response:          rawResponse || "",
      _expected_schema:       '{ "observations": { "toolmarks":[...], "fasteners":[...], "joinery":[...], "hardware":[...], "conversion_cavities":[...], "finish":[...], "mechanical_structures":[...] } }',
    });

    if (!images || images.length === 0) {
      return { ...safeEmpty("No images submitted", ""), skipped: true, skip_reason: "No images submitted" };
    }

    // ── Recovery parser ────────────────────────────────────────
    // Normalizes any plausible raw model output into observations_by_type.
    const KNOWN_TYPES = ["toolmarks","fasteners","joinery","hardware","conversion_cavities","finish","construction","mechanical_structures"];
    const ALIAS_KEYS  = ["detected_clues","clues","findings","items","evidence","results","clue_list"];

    const recoverObservations = (parsed, imageArr) => {
      if (!parsed || typeof parsed !== "object") return null;

      // 1. observations field — object (by-type) or array (flat)
      let raw = parsed.observations;

      // 2. Try known aliases if observations missing
      if (raw === undefined || raw === null) {
        for (const alias of ALIAS_KEYS) {
          if (parsed[alias] !== undefined) { raw = parsed[alias]; break; }
        }
      }

      // 3. Still nothing — try root-level type keys directly
      if (raw === undefined || raw === null) {
        const rootByType = {};
        for (const t of KNOWN_TYPES) {
          if (Array.isArray(parsed[t]) && parsed[t].length > 0) rootByType[t] = parsed[t];
        }
        if (Object.keys(rootByType).length > 0) raw = rootByType;
      }

      // 4. Last resort — convert Stage A raw_visual_observations into mechanical_structures
      if ((raw === undefined || raw === null) && Array.isArray(parsed.raw_visual_observations)) {
        const mechClues = [];
        for (const imgEntry of parsed.raw_visual_observations) {
          const label = imgEntry.image_label || "unknown";
          for (const clue of (imgEntry.clues || [])) {
            const c = clue.toLowerCase();
            const key =
              c.includes("drop leaf") || c.includes("hinged leaf") || c.includes("fold") ? "drop_leaf_hinged" :
              c.includes("gate leg") || c.includes("gateleg") || c.includes("swing leg") || c.includes("pivot leg") ? "gateleg_support" :
              c.includes("caster") || c.includes("wheel") ? "porcelain_caster" :
              c.includes("drawer") ? "drawer_present" :
              c.includes("door") ? "door_present" :
              c.includes("turned leg") ? "turned_leg" :
              c.includes("tapered leg") ? "tapered_leg" :
              c.includes("stretcher") ? "stretcher" :
              c.includes("apron") ? "apron" :
              "form_clue";
            mechClues.push({
              clue: key,
              source_image: label,
              visual_confidence: 55,
              low_confidence_flag: false,
              weight_multiplier: 0.8,
              visual_description: clue,
              implied_form: parsed.broad_form_impression || "",
              observation_type: "mechanical_structures",
            });
          }
        }
        if (mechClues.length > 0) raw = { mechanical_structures: mechClues };
      }

      if (raw === undefined || raw === null) return null;

      // 4. Normalize into by-type object
      let byType = {};

      if (Array.isArray(raw)) {
        // Flat array — group by observation_type or type field
        for (const obs of raw) {
          if (!obs || typeof obs !== "object") continue;
          const t = obs.observation_type || obs.type || obs.category || "unknown";
          if (!byType[t]) byType[t] = [];
          byType[t].push(obs);
        }
      } else if (typeof raw === "object") {
        // Already by-type — accept directly
        byType = raw;
      }

      // 5. Normalize each observation's fields — fill defaults for missing
      const normalizeObs = (obs, typeName, imageArr) => {
        if (!obs || typeof obs !== "object") return null;
        const srcImage = obs.source_image || obs.source_image_id || obs.image_type || obs.image || null;
        // Resolve 1-based photo index from image array
        const photoIdx = srcImage && imageArr
          ? (function(){
              var idx = imageArr.findIndex(function(img){ return img.image_type === srcImage || img.storage_key === srcImage; });
              return idx >= 0 ? idx + 1 : null;
            })()
          : null;
        return {
          clue:               obs.clue         || obs.clue_key    || obs.label     || obs.name    || "unknown_clue",
          source_image:       srcImage,
          photo_index:        photoIdx,
          image_region:       obs.image_region || obs.region_label  || obs.region   || obs.location || null,
          visual_confidence:  typeof obs.visual_confidence === "number" ? obs.visual_confidence
                            : typeof obs.confidence       === "number" ? obs.confidence * 100
                            : typeof obs.raw_confidence   === "number" ? obs.raw_confidence * 100
                            : 40,   // default low confidence
          low_confidence_flag:(obs.low_confidence_flag != null) ? obs.low_confidence_flag : (obs.visual_confidence < 60),
          weight_multiplier:  typeof obs.weight_multiplier === "number"
                              ? Math.min(1, Math.max(0, obs.weight_multiplier))
                              : obs.visual_confidence < 60 ? 0.5 : 1.0,
          hard_negative:      (obs.hard_negative != null) ? obs.hard_negative : false,
          visual_description: obs.visual_description || obs.observed_value_text || obs.description || obs.notes || obs.clue || "",
          era_implication:    obs.era_implication    || obs.era    || "",
          observation_type:   obs.observation_type   || typeName   || "unknown",
          notes:              obs.notes || "",
          _recovered:         true,
        };
      };

      const normalized = {};
      for (const [typeName, arr] of Object.entries(byType)) {
        if (!Array.isArray(arr)) continue;
        const normArr = arr.map(function(o){ return normalizeObs(o, typeName, imageArr); }).filter(Boolean);
        if (normArr.length > 0) normalized[typeName] = normArr;
      }

      return Object.keys(normalized).length > 0 ? normalized : null;
    };

    // ── Build the prompt ───────────────────────────────────────
    const sys = `You are the Visual Evidence Scanner for the NCW American Furniture Identification Engine.
Scope: American furniture, 1600–present.

════════════════════════════════════════════════════════
STAGE A — RAW VISUAL OBSERVATIONS  (do this first)
════════════════════════════════════════════════════════

Look at EVERY submitted image carefully. For each image, write down every visible physical clue in plain English.

DO NOT identify the furniture yet.
DO NOT infer style or date yet.
DO NOT skip weak or uncertain clues — label them tentative if needed.

Record anything you can see, including:
• hinged leaves / drop leaves / fold lines at top edge
• swing leg, gate leg, pivot leg, or gate frame
• turned legs, square-tapered legs, cabriole legs, straight legs
• stretchers between legs
• casters (wheels) under feet
• drawers — how many, what joinery at corners if visible
• doors — hinged, sliding, paneled
• underside rails, apron, or support structure
• support brackets, butterfly brackets, rule joints
• hinge hardware — type, location, scale
• pull hardware — bail, knob, ring, Eastlake, ceramic
• lock escutcheons
• fastener types — nail heads, screw heads
• saw marks on underside boards
• panel construction — solid, frame-and-panel, plywood
• wood species clues — grain pattern, color, figure
• finish appearance — sheen, crazing, color
• labels, stamps, stencils, maker marks
• repairs — patches, replaced boards, new fasteners
• signs of conversion — ghost holes, removed mechanisms, mismatched wood
• anything structurally absent that you would expect to see

CRITICAL RULE: If the photos clearly show a table form with hinged leaves,
you MUST record "hinged leaves visible" and "drop leaf form" in at least one image entry.
Do not omit obvious table mechanisms even at low confidence.

════════════════════════════════════════════════════════
STAGE B — NORMALIZED EVIDENCE SCHEMA  (do this second)
════════════════════════════════════════════════════════

Convert your Stage A observations into structured evidence fields.

Use these exact observation types: toolmarks, fasteners, joinery, hardware, conversion_cavities, finish, mechanical_structures.

For mechanical_structures, use these clue keys when applicable:
drop_leaf_hinged, gateleg_support, rule_joint, swing_leg, butterfly_support,
lift_lid, till_interior, drawer_present, multiple_drawer_case, door_present,
slant_front, cylinder_roll, fall_front, pedestal_base, tilt_top, tripod_base,
extension_mechanism, washstand_splash, mirror_attachment.

HARD NEGATIVES (always flag): phillips_screw, staple_fastener, plywood_drawer_bottom, modern_concealed_hinge, particle_board, mdf.

visual_confidence scale:
80–100 = clearly visible  |  50–79 = visible with some uncertainty  |  20–49 = possible, mark low_confidence_flag:true  |  below 20 = omit

MINIMUM OUTPUT RULE:
• If you recorded any table-form clues in Stage A, observations.mechanical_structures must not be empty.
• If ANY clues were visible, observations must not be an empty object.
• broad_form_impression is REQUIRED if any form is evident.

════════════════════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════════════════════

Respond ONLY in valid JSON. Begin with { and include both stages:

{
  "raw_visual_observations": [
    {
      "image_label": "overall_front",
      "clues": [
        "drop leaves visible on both sides of the fixed center top",
        "turned legs with small casters at base",
        "gate leg or swing leg visible folded against apron"
      ]
    }
  ],
  "scan_summary": {
    "images_scanned": [],
    "image_quality_issues": [],
    "total_observations": 0,
    "hard_negatives_found": [],
    "scan_confidence": "high|moderate|low"
  },
  "observations": {
    "toolmarks":             [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "weight_multiplier":1.0, "visual_description":"", "era_implication":"" } ],
    "fasteners":             [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "weight_multiplier":1.0, "hard_negative":false, "visual_description":"", "era_implication":"" } ],
    "joinery":               [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "weight_multiplier":1.0, "hard_negative":false, "visual_description":"", "era_implication":"" } ],
    "hardware":              [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "weight_multiplier":1.0, "hard_negative":false, "visual_description":"", "era_implication":"" } ],
    "conversion_cavities":   [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "weight_multiplier":1.0, "visual_description":"", "structural_implication":"" } ],
    "finish":                [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "weight_multiplier":1.0, "visual_description":"" } ],
    "mechanical_structures": [ { "clue":"", "source_image":"", "image_region":"", "visual_confidence":0, "low_confidence_flag":false, "form_signature":"", "visual_description":"", "implied_form":"" } ]
  },
  "mechanical_form_signature": "",
  "primary_wood_observed": "",
  "secondary_wood_observed": "",
  "broad_form_impression": "",
  "condition_impression": "excellent|good|fair|poor",
  "anomalies_noted": []
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;

    // ── Call Claude — with fallback retry ──────────────────────
    let rawResult = null;
    let rawResponseText = "";
    try {
      rawResult = await this.callClaude(sys, [
        ...this.imgs(images),
        { type: "text", text: "Scan all submitted images. Report only what you can actually see. Respond ONLY in valid JSON starting with {." },
      ]);
      // callClaude already retries once on parse failure and tags ok:false on error
    } catch(e) {
      console.error("[NCW P0] callClaude threw:", e.message);
      rawResult = { ok: false, error_type: "runtime_error", error_message: e.message, raw_response: "" };
    }

    // ── Tolerance layer ────────────────────────────────────────
    // callClaude returns { ok: false, ... } on API or parse error.
    // If ok === false, attempt recovery from raw_response text if present.
    if (rawResult.ok === false) {
      const rawText = rawResult.raw_response || "";
      console.warn("[NCW P0] callClaude returned ok:false. Type:", rawResult.error_type, "— attempting partial recovery from raw text.");
      rawResponseText = rawText;

      // Try to extract JSON from raw text (may be wrapped in prose or partial)
      let recovered = null;
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) recovered = JSON.parse(jsonMatch[0]);
      } catch(_e) { /* recovery attempt failed */ }

      if (!recovered) {
        console.warn("[NCW P0] Partial recovery failed. Returning safe empty result. Pipeline continues with low-confidence caps.");
        return safeEmpty(`callClaude error: ${rawResult.error_type} — ${rawResult.error_message}`, rawText);
      }

      // Recovery succeeded — continue with recovered object
      rawResult = recovered;
      console.info("[NCW P0] Partial recovery succeeded from raw text.");
    }

    // ── Normalize the parsed result ────────────────────────────
    const observationsByType = recoverObservations(rawResult, images);

    if (!observationsByType) {
      console.warn("[NCW P0] recoverObservations returned null — no usable observations. Returning safe empty result.");
      return safeEmpty("No observations field found in response", rawResponseText);
    }

    // ── Count and flag hard negatives ──────────────────────────
    const HARD_NEG_CLUES = new Set(["phillips_screw","plywood_structural","plywood_drawer_bottom","particle_board","mdf","modern_concealed_hinge","staple_fastener"]);
    const hardNegativesDetected = [];
    let totalObs = 0;

    for (const [typeName, obsArr] of Object.entries(observationsByType)) {
      for (const obs of obsArr) {
        totalObs++;
        if (HARD_NEG_CLUES.has(obs.clue) && obs.visual_confidence >= 40) {
          hardNegativesDetected.push({
            clue_key:           obs.clue,
            visual_confidence:  obs.visual_confidence,
            effective_confidence: (obs.visual_confidence / 100) * obs.weight_multiplier,
            region_label:       obs.image_region || null,
            source_image_id:    obs.source_image  || null,
          });
        }
      }
    }

    // ── Assemble canonical output ──────────────────────────────
    const recoveryUsed = !!(rawResult._recovery || Object.values(observationsByType).flat().some(o => o._recovered));
    if (recoveryUsed) console.info(`[NCW P0] Recovery normalization applied. Total observations recovered: ${totalObs}`);

    return {
      skipped:                false,
      phase_0_status:         totalObs > 0 ? "ok" : "no_observations_found",
      recovery_used:          recoveryUsed,
      total_observations:     totalObs,
      observations_by_type:   observationsByType,
      hard_negatives_detected:hardNegativesDetected,
      images_scanned:         images.filter(i => i.data_url).length,
      scan_summary:           rawResult.scan_summary || { scan_confidence: totalObs > 0 ? "low" : "none", images_scanned:[], image_quality_issues:[], total_observations: totalObs, hard_negatives_found: hardNegativesDetected.map(h => h.clue_key) },
      mechanical_form_signature: rawResult.mechanical_form_signature || "",
      primary_wood_observed:  rawResult.primary_wood_observed   || "",
      secondary_wood_observed:rawResult.secondary_wood_observed || "",
      broad_form_impression:  rawResult.broad_form_impression   || rawResult.mechanical_form_signature || "",
      condition_impression:   rawResult.condition_impression    || "unknown",
      anomalies_noted:        rawResult.anomalies_noted         || [],
      created_by_stage:       "phase_0_visual_scan",
      non_destructive:        true,
    };
  },


  // ─────────────────────────────────────────────────────────────
  // PHASE 0b — Targeted Visual Scanner
  // Called by each reasoning phase (p2–p5) for its own evidence
  // category. Sends only the relevant images and a tight,
  // category-specific prompt. Returns structured observations
  // that are MERGED with the full scan results before scoring.
  //
  // This implements the "Both" strategy:
  //   Phase 0  = broad full scan — catches everything visible
  //   Phase 0b = targeted follow-up — goes deeper on one category
  //              using the phase's specific knowledge
  //
  // Low-confidence rule: visual_confidence < 60 → weight_multiplier ×0.5,
  // flag as low_confidence. Observation is still recorded and scored.
  // ─────────────────────────────────────────────────────────────
  async p0_targeted(images, category, existingObs, context) {
    // Select relevant images for this category
    const categoryImageMap = {
      toolmarks:          ["underside","back","joinery_closeup"],
      fasteners:          ["underside","back","joinery_closeup","hardware_closeup"],
      joinery:            ["joinery_closeup","underside"],
      construction:       ["joinery_closeup","underside","back"],
      hardware:           ["hardware_closeup","overall_front","overall_side"],
      hidden_structure:   ["underside","overall_side","overall_front"],
      finish:             ["overall_front","hardware_closeup"],
    };
    const relevantTypes = categoryImageMap[category] || [];
    const targetImages  = images.filter(i => relevantTypes.includes(i.image_type) && i.data_url);
    if (targetImages.length === 0) return { skipped: true, category, skip_reason: "No relevant images for this category", new_observations: [] };

    // Category-specific clue definitions
    const categoryClues = {
      toolmarks: [
        { clue:"pit_saw_marks",           look_for:"Irregular diagonal or vertical straight lines, rough texture, slight waviness. Pre-1830.", hard_negative:false },
        { clue:"circular_saw_arcs",       look_for:"Curved arc marks in consistent radius patterns. Post-1830, strong post-1840.", hard_negative:false },
        { clue:"band_saw_lines",          look_for:"Very fine, straight, closely-spaced parallel lines. Post-1870.", hard_negative:false },
        { clue:"hand_plane_chatter",      look_for:"Subtle regular ridges or scallop patterns across grain direction. Any era.", hard_negative:false },
        { clue:"machine_routing_uniform", look_for:"Perfectly uniform routed profile, consistent depth, smooth walls on moldings. Post-1900.", hard_negative:false },
      ],
      fasteners: [
        { clue:"hand_forged_nail",       look_for:"Irregular hammered head, not perfectly round. Shank tapers on all four sides. Pre-1800.", hard_negative:false },
        { clue:"cut_nail",               look_for:"Rectangular cross-section, flat rectangular head, tapers on two sides only. 1790–1890.", hard_negative:false },
        { clue:"wire_nail",              look_for:"Round shank, circular head, perfectly cylindrical. Post-1880.", hard_negative:false },
        { clue:"slotted_handmade_screw", look_for:"Off-center slot, irregular thread pitch, blunt or tapered tip. 1770–1840.", hard_negative:false },
        { clue:"slotted_machine_screw",  look_for:"Centered slot, uniform threads, sharp point, perfectly round head. Post-1840.", hard_negative:false },
        { clue:"phillips_screw",         look_for:"Cross-shaped X recess in head. HARD NEGATIVE — post-1930.", hard_negative:true },
        { clue:"staple_fastener",        look_for:"U-shaped wire staple driven into wood. HARD NEGATIVE — post-1945.", hard_negative:true },
      ],
      joinery: [
        { clue:"hand_cut_dovetails",          look_for:"Dovetails with slightly irregular pin spacing, varying angles, subtle hand-cut variation. Knife scribe lines may be visible. Pre-1860.", hard_negative:false },
        { clue:"machine_dovetails",           look_for:"Perfectly uniform pin spacing, identical angles, machine-perfect regularity. Post-1860.", hard_negative:false },
        { clue:"mortise_and_tenon",           look_for:"Rectangular peg-in-slot at frame corners. May show wooden pegs or wedges. 1600–1900.", hard_negative:false },
        { clue:"dowel_joinery",               look_for:"Round wooden pegs at joint faces, perfectly round holes. Post-1900.", hard_negative:false },
        { clue:"solid_board_drawer_bottom",   look_for:"Single solid board chamfered at edges, grain runs side to side, may show shrinkage cracks. Pre-1920.", hard_negative:false },
        { clue:"plywood_drawer_bottom",       look_for:"Laminated layers visible at drawer bottom edge. HARD NEGATIVE — post-1920.", hard_negative:true },
        { clue:"frame_and_panel",             look_for:"Floating panel within grooved frame, panel edges visible in groove. Any era.", hard_negative:false },
        { clue:"butt_joint_screwed",          look_for:"Simple flat joint held with screws only, no interlocking. Modern indicator.", hard_negative:false },
      ],
      hardware: [
        { clue:"victorian_strap_hinge",     look_for:"Long decorative strap hinge, Gothic or Victorian revival styling, pointed ends, ornate surface detail. 1865–1895.", hard_negative:false },
        { clue:"batwing_brass_pull",        look_for:"Bat-wing shaped brass bail pull with rosette backplate. HIGH replacement risk — note any oxidation or hole mismatch. 1720–1790.", hard_negative:false },
        { clue:"eastlake_pull",             look_for:"Geometric brass pull, incised angular decoration, machined surface ornament. 1870–1890.", hard_negative:false },
        { clue:"porcelain_caster",          look_for:"White ceramic or porcelain wheel on metal fork bracket. Not rubber, not metal wheel. 1830–1870.", hard_negative:false },
        { clue:"wood_caster",               look_for:"Turned wooden wheel caster. 1800–1840.", hard_negative:false },
        { clue:"surface_lock",              look_for:"Surface-mounted lock plate with visible keyhole. 1750–present.", hard_negative:false },
        { clue:"modern_concealed_hinge",    look_for:"Cup-style hinge recessed into door face. Circular cup mortise. HARD NEGATIVE — post-1950.", hard_negative:true },
        { clue:"phillips_in_hardware_mount",look_for:"Phillips screw visible in hardware mounting hole — hard negative for antique hardware originality.", hard_negative:true },
        { clue:"filled_pull_holes",         look_for:"Plugged or filled screw holes visible beside or near current hardware — indicates replacement.", hard_negative:false },
        { clue:"hardware_shadow_mismatch",  look_for:"Ghost outline or shadow of previous hardware that does not match current hardware shape — indicates replacement.", hard_negative:false },
      ],
      hidden_structure: [
        { clue:"pedal_cavity_structure",  look_for:"Rectangular void or cavity at base consistent with foot pedals — typically full-width, 6–10 inches deep, may show bellows mount points or pedal pivot hardware. 1850–1920.", hard_negative:false },
        { clue:"treadle_mount",           look_for:"Iron bracket holes, pivot points, or reinforced lower frame for treadle mechanism. 1860–1910.", hard_negative:false },
        { clue:"ice_chamber",             look_for:"Lined interior compartment, thick walls, metal liner, drain fitting. Upper ice, lower food. 1880–1920.", hard_negative:false },
        { clue:"structural_void",         look_for:"Unexplained void, cavity, or dead space inconsistent with current form — suggests removed mechanism.", hard_negative:false },
        { clue:"removed_mechanism_ghost", look_for:"Mounting holes, wear patterns, hardware shadows, or routed channels indicating a removed original mechanism.", hard_negative:false },
        { clue:"incompatible_top_surface",look_for:"Surface material or profile visually inconsistent with the base — different wood aging, different style era, added marble/glass.", hard_negative:false },
      ],
      finish: [
        { clue:"shellac_crazing",    look_for:"Fine crackle or alligator pattern in amber/orange surface film. 1800–1920.", hard_negative:false },
        { clue:"shellac_intact",     look_for:"Smooth amber/orange surface with slight sheen, no crackle. 1800–1920.", hard_negative:false },
        { clue:"oil_finish_patina",  look_for:"Deep mellow glow, no surface film, grain fully visible, no sheen. Any era.", hard_negative:false },
        { clue:"milk_paint",         look_for:"Opaque matte surface, chalky texture, often chipped or worn through to wood. 1700–1900.", hard_negative:false },
        { clue:"polyurethane",       look_for:"Plastic-like surface sheen, possible orange-peel texture, may peel or chip at edges. HARD NEGATIVE for original finish. Post-1960.", hard_negative:true },
        { clue:"painted_over_original",   look_for:"Brush strokes over original finish visible at edges, chips, or worn areas.", hard_negative:false },
        { clue:"refinished_surface", look_for:"Uniform new finish obscuring age patina, no wear at natural contact points (edges, handles, feet).", hard_negative:false },
      ],
    };

    const clues = categoryClues[category] || [];
    if (clues.length === 0) return { skipped: true, category, skip_reason: "No clue definitions for category", new_observations: [] };

    // Summarize what the full scan already found for this category
    const alreadyFound = (existingObs[category] || [])
      .map(o => `${o.clue} (confidence ${o.visual_confidence}, region: ${o.image_region || "unspecified"})`)
      .join("; ") || "none detected in full scan";

    const clueList = clues.map(c =>
      `• ${c.clue}${c.hard_negative ? " ⚠ HARD NEGATIVE" : ""}\n  LOOK FOR: ${c.look_for}`
    ).join("\n\n");

    const sys = `You are the Targeted Visual Scanner for the NCW American Furniture Identification Engine.
You are performing a FOCUSED re-examination of specific images for one evidence category: ${category.toUpperCase()}.

This is the second pass of a two-pass visual system:
• Pass 1 (Phase 0 full scan): broad sweep of all categories across all images
• Pass 2 (this scan): deep focused examination of ${category} evidence in relevant images only

YOUR TASK
Look carefully at the submitted image(s) and report ONLY ${category} evidence.
Be more precise than the full scan. Note exact locations. Describe what you see in forensic detail.

WHAT THE FULL SCAN ALREADY FOUND FOR ${category.toUpperCase()}:
${alreadyFound}
Do NOT simply repeat the same observations. Look for additional detail, confirm or refute findings,
or identify evidence the full scan may have missed.

CLUES TO SCAN FOR:
${clueList}

CONFIDENCE SCORING (0–100):
• 80–100: Unmistakably visible — clear identifying features present
• 60–79:  Clearly visible but minor ambiguity (lighting, angle, partial view)
• 40–59:  Probably present but unclear — APPLY ×0.5 weight, flag as low_confidence
• 20–39:  Possibly present — APPLY ×0.5 weight, flag as low_confidence
• below 20: Do NOT report — insufficient signal

WEIGHT MULTIPLIER RULES:
• Default: 1.0
• visual_confidence < 60: override to 0.5, set low_confidence_flag = true
• Image blurry or out of focus: reduce by additional 0.2
• Clue only partially visible: reduce by 0.1
• Hard negative clue: always report if confidence > 20, apply ×1.0 (never discount hard negatives)

REGION LABEL: Be specific. Examples:
"lower left corner", "center of drawer face", "right hinge mount area",
"entire underside surface", "top right quadrant of back panel"

IMAGE QUALITY: If an image is too blurry, dark, or obstructed to read this category reliably,
set image_quality to "poor" and note why. Still attempt to report any visible clues.

CONSERVATIVE RULE: Only report what you can actually see.
Do not report evidence because the form type commonly has it.
A low-confidence observation is more useful than a fabricated one.

Additional context from prior phases: ${context || "none"}

Respond ONLY in valid JSON:
{
  "category": "${category}",
  "images_examined": [],
  "image_quality_notes": "",
  "new_observations": [
    {
      "clue": "",
      "source_image": "",
      "image_region": "",
      "visual_confidence": 0,
      "low_confidence_flag": false,
      "weight_multiplier": 1.0,
      "effective_confidence": 0,
      "hard_negative": false,
      "visual_description": "",
      "era_implication": "",
      "confirms_full_scan": true,
      "notes": ""
    }
  ],
  "full_scan_corrections": [
    {
      "original_clue": "",
      "correction": "confirms|refutes|adds_detail",
      "note": ""
    }
  ],
  "targeted_summary": ""
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;

    const imgContent = [];
    for (const img of targetImages) {
      const [h, b] = img.data_url.split(",");
      const mt = h.match(/data:(.*?);/)[1] || "image/jpeg";
      imgContent.push({ type:"image", source:{ type:"base64", media_type:mt, data:b } });
      imgContent.push({ type:"text",  text:`[Image: ${img.image_type}]` });
    }
    imgContent.push({ type:"text", text:`Perform targeted ${category} scan. Report only what you actually see.` });

    const result = await this.callClaude(sys, imgContent);

    // Write new targeted observations to case_observations via API
    if (Array.isArray(result.new_observations) && result.new_observations.length > 0 && context.caseId) {
      for (const obs of result.new_observations) {
        if (!obs.clue || obs.visual_confidence < 20) continue;
        const libEntry = this.VISUAL_LIBRARY.find(c => c.clue_key === obs.clue);
        API.addObservation(context.caseId, {
          observation_type:    category,
          reference_table:     libEntry.reference_table || null,
          reference_id:        obs.clue,
          observed_value_text: obs.visual_description || obs.clue,
          source_image_id:     obs.source_image,
          raw_confidence:      obs.visual_confidence / 100,
          weight_multiplier:   obs.weight_multiplier,
          is_hidden_surface:   (libEntry && libEntry.is_hidden_surface != null) ? libEntry.is_hidden_surface : false,
          region_label:        obs.image_region || null,
          created_by_stage:    `phase_0b_targeted_${category}`,
          image_quality:       result.image_quality_notes ? "flagged" : "ok",
        });
      }
    }

    return result;
  },

  // Helper: merge full scan + targeted scan observations for a category
  mergeVisualObs(fullScanObs, targetedResult, category) {
    const full     = fullScanObs[category] || [];
    const targeted = targetedResult.new_observations || [];

    // Build a map of existing clue keys from full scan
    const fullKeys = new Set(full.map(o => o.clue));

    // Add targeted observations that are new or have higher confidence
    const merged = [...full];
    for (const t of targeted) {
      if (!t.clue || t.visual_confidence < 20) continue;
      if (!fullKeys.has(t.clue)) {
        // New clue found in targeted scan — add it
        merged.push(t);
      } else {
        // Clue already in full scan — if targeted has higher confidence, upgrade
        const existing = merged.find(o => o.clue === t.clue);
        if (existing && t.visual_confidence > existing.visual_confidence) {
          existing.visual_confidence  = t.visual_confidence;
          existing.weight_multiplier  = t.weight_multiplier;
          existing.image_region       = t.image_region || existing.image_region;
          existing.visual_description = t.visual_description || existing.visual_description;
          existing.low_confidence_flag= t.low_confidence_flag;
          existing.source             = "targeted_scan_upgraded";
        }
      }
    }
    return merged;
  },
  async p1(caseData, images, intake, p0) {
    const imageTypesPresent = images.map(i => i.image_type);
    const sys = `You are the Intake Controller for the NCW American Furniture Identification Engine.
Scope: American furniture, 1600–present.

PURPOSE
Inventory all submitted evidence. Apply confidence caps. Set downstream phase triggers.
Do NOT assign any positive scoring — this phase constrains later phases only.

EVIDENCE CATEGORIES — assess each as present | partial | absent:
• overall_form_view        — overall_front or overall_side image present
• underside_hidden_surface — underside showing saw marks, nails, unfinished wood
• hardware_closeup         — dedicated hardware image (hinges, pulls, locks, casters)
• joinery_drawer_construction — joinery_closeup showing dovetails or drawer corners
• interior_structure       — interior view showing shelves, cavities, or mechanism remnants
• finish_closeup           — close view of surface finish or patina
• back_board               — back panel showing secondary wood and tool marks

EVIDENCE SUFFICIENCY:
• High     — 4+ categories present including underside + joinery
• Moderate — 2–3 categories present
• Low      — only overall shot(s), no structural evidence

CONFIDENCE CAP RULES (a cap can only LOWER a band, never raise it):
• underside_hidden_surface absent            → date_confidence_cap = "Moderate"
• joinery_drawer_construction absent         → construction_confidence_cap = "Moderate"
• hardware_closeup absent                    → hardware_originality_cap = "Low"
• interior_structure absent AND complex case piece suspected → form_confidence_cap = "Moderate"
• only one overall photo, nothing structural → overall_confidence_cap = "Low"
• evidence_sufficiency = "Low"              → valuation_confidence_cap = "Low"

PHASE TRIGGER RULES:
• run_dating_grid  — true if underside OR joinery_closeup OR back_board visible
• run_form_engine  — true if overall_front OR overall_side OR interior_structure visible
• run_construction — true if joinery_closeup OR back_board OR underside visible
• run_hardware     — true if hardware_closeup visible OR hardware apparent in any overall shot

Image types submitted: ${JSON.stringify(imageTypesPresent)}

Respond ONLY in valid JSON, no markdown fences:
{
  "visible_image_types": [],
  "evidence_inventory": {
    "overall_form_view": "present|partial|absent",
    "underside_hidden_surface": "present|partial|absent",
    "hardware_closeup": "present|partial|absent",
    "joinery_drawer_construction": "present|partial|absent",
    "interior_structure": "present|partial|absent",
    "finish_closeup": "present|partial|absent",
    "back_board": "present|partial|absent"
  },
  "evidence_sufficiency": "Moderate",
  "missing_critical_evidence": [],
  "image_quality_notes": "",
  "user_stated_category": null,
  "broad_form_guess": null,
  "visible_primary_wood": null,
  "visible_secondary_wood": null,
  "overall_condition": "good",
  "red_flags": [],
  "confidence_caps": {
    "date_confidence_cap": "none",
    "construction_confidence_cap": "none",
    "hardware_originality_cap": "none",
    "form_confidence_cap": "none",
    "overall_confidence_cap": "none",
    "valuation_confidence_cap": "none"
  },
  "phase_triggers": {
    "run_dating_grid": true,
    "run_form_engine": true,
    "run_construction": true,
    "run_hardware": true
  },
  "proceed_recommendation": "proceed"
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    let p1raw;
    try {
      p1raw = await this.callClaude(sys, [
        ...this.imgs(images),
        { type: "text", text: `Visual Scanner observations (Phase 0): ${JSON.stringify(p0.scan_summary || {})}\nImage quality issues: ${JSON.stringify(p0.scan_summary.image_quality_issues || [])}\nIntake answers: ${JSON.stringify(intake)}\nUser notes: ${caseData.notes_from_user || "none"}` },
      ]);
    } catch(callErr) {
      console.warn("[NCW P1] callClaude threw:", callErr.message, "— routing to fallback");
      p1raw = { ok:false, error_type:"call_threw", error_message: callErr.message, raw_response:"" };
    }
    console.info("[NCW P1] raw callClaude ok:", p1raw && p1raw.ok,
      "| type:", typeof p1raw,
      "| keys:", p1raw ? Object.keys(p1raw).join(", ") : "null",
      "| raw_response_len:", (p1raw && p1raw.raw_response || "").length);
    const p1normalized = this.normalize(p1raw, "p1_intake");
    console.info("[NCW P1] after normalize ok:", p1normalized && p1normalized.ok,
      "| evidence_sufficiency:", p1normalized && p1normalized.evidence_sufficiency);
    // ── Self-tolerant fallback: if still ok:false, synthesize from available images ──
    if (!p1normalized || p1normalized.ok === false) {
      console.warn("[NCW P1] Normalize failed — synthesizing safe p1 from image types");
      const imageTypes = new Set(images.map(function(i){ return i.image_type; }));
      return {
        ok: true,
        _synthesized: true,
        visible_image_types:    Array.from(imageTypes),
        evidence_inventory: {
          overall_form_view:          (imageTypes.has("overall_front")||imageTypes.has("overall_side")) ? "present" : "absent",
          underside_hidden_surface:   imageTypes.has("underside")       ? "present" : "absent",
          hardware_closeup:           imageTypes.has("hardware_closeup") ? "present" : "absent",
          joinery_drawer_construction:imageTypes.has("joinery_closeup")  ? "present" : "absent",
          interior_structure:         imageTypes.has("interior")         ? "present" : "absent",
          finish_closeup:             imageTypes.has("finish_closeup")   ? "present" : "absent",
          back_board:                 imageTypes.has("back")             ? "present" : "absent",
        },
        evidence_sufficiency:  images.length >= 3 ? "Moderate" : "Low",
        missing_critical_evidence: [],
        image_quality_notes:   "Synthesized from available images — P1 LLM call failed",
        user_stated_category:  intake.user_category_guess || null,
        broad_form_guess:      intake.user_category_guess || null,
        visible_primary_wood:  null,
        visible_secondary_wood:null,
        overall_condition:     "unknown",
        red_flags:             [],
        confidence_caps: { date_confidence_cap:"none", construction_confidence_cap:"none", hardware_originality_cap:"none", form_confidence_cap:"none", overall_confidence_cap:"none", valuation_confidence_cap:"none" },
        phase_triggers: { run_dating_grid:true, run_form_engine:true, run_construction:true, run_hardware:true },
        folds_or_expands:    false,
        mechanical_parts:    false,
        conversion_possible: false,
        has_drawers:         false,
        has_doors:           false,
        proceed_recommendation: "proceed",
        _debug: {
          raw_phase1_response:    (p1raw && p1raw.raw_response) || "",
          normalized_phase1_payload: "fallback — LLM call failed",
          validation_result:      "fallback_synthesized",
        },
        raw_response: (p1raw && p1raw.raw_response) || "",
      };
    }
    // Attach debug fields to successful normalized result
    p1normalized._debug = {
      raw_phase1_response:    (p1raw && p1raw.raw_response) || (p1raw && JSON.stringify(p1raw).slice(0,300)) || "",
      normalized_phase1_payload: "ok",
      validation_result:      "normalized",
    };
    return p1normalized;
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 2 — Rapid Dating Grid
  // Trigger: run_dating_grid = true
  // Reads from p0 visual observations first.
  // Style is ignored except as tie-breaker when structural weak.
  // ─────────────────────────────────────────────────────────────
  async p2(caseData, images, p0, p1) {
    const sys = `You are the Rapid Dating Grid engine for the NCW American Furniture Identification Engine.
Scope: American furniture, 1600–present.

${this.wmSummary()}

PURPOSE
Build an initial date band by intersecting physical clue era windows.
IGNORE decorative style except as tie-breaker when Tier A–D evidence is weak.

SCORING — use these exact values from the WM clue table:

TIER: toolmarks (weight ${WM.tiers.toolmarks})
• pit_saw_marks           → age_support +12, era pre-1830
• circular_saw_arcs       → age_support +10, era post-1830 (strong post-1840)
• band_saw_lines          → age_support +10, era post-1870
• hand_plane_chatter      → age_support +4, era any
• machine_routing_uniform → age_support +8, era post-1900

TIER: fasteners (weight ${WM.tiers.fasteners})
• hand_forged_nail        → age_support +10, era 1600–1800
• cut_nail                → age_support +10, era 1790–1890
• wire_nail               → age_support +10, era post-1880
• slotted_handmade_screw  → age_support +10, era 1770–1840
• slotted_machine_screw   → age_support +6,  era post-1840
• phillips_screw (original) → age_opposing +${Math.abs(WM.negative_rules.phillips_screw_pre1930)} — HARD NEGATIVE for any pre-1930 claim
• staple_fastener         → age_opposing +${Math.abs(WM.negative_rules.staple_fastener)} — HARD NEGATIVE

TIER: construction (weight ${WM.tiers.construction})
• hand_cut_dovetails      → age_support +10, era pre-1860
• machine_dovetails       → age_support +10, era post-1860
• mortise_and_tenon       → age_support +8,  era 1600–1900

TIER: materials (weight ${WM.tiers.materials})
• poplar secondary        → age_support +5, era 19th century
• gumwood secondary       → age_support +4, era 1880–1940
• plywood structural      → age_opposing +${Math.abs(WM.negative_rules.plywood_pre1905)} — HARD NEGATIVE eliminates pre-1905
• particle_board          → age_opposing +${Math.abs(WM.negative_rules.particle_board)} — HARD NEGATIVE eliminates antique
• MDF                     → age_opposing +${Math.abs(WM.negative_rules.mdf)} — HARD NEGATIVE eliminates antique

TIER: finish (weight ${WM.tiers.finish})
• shellac                 → age_support +4, era 1800–1920
• oil_finish              → age_support +2, era any
• polyurethane (original) → age_opposing +10

DATE RANGE LOGIC:
1. List every clue observed with confidence score (0–100).
2. Record each clue's era window.
3. Intersect all Tier A–D windows → primary_date_range.
4. Hard negatives OVERRIDE supporting evidence — if triggered, state what era is eliminated.
5. Tier G–I clues narrow further only.

CONFLICT: If 2+ Tier A–D clues produce non-overlapping date ranges → set dating_conflict flag, lower confidence to Low.

CONFIDENCE:
• High     — 4+ Tier A–D clues align in narrow range, no conflict
• Moderate — 2–3 clues align, minor conflict, or only 1 strong clue
• Low      — 1 clue only, major conflict, or hard negative present
Apply date_confidence_cap from Phase 1 if it lowers the result.

Phase 1 output: ${JSON.stringify(p1)}

Respond ONLY in valid JSON:
{
  "toolmark_observations":  [{"clue":"","confidence":0,"age_support":0,"age_opposing":0,"era_window":"","notes":""}],
  "fastener_observations":  [{"clue":"","confidence":0,"age_support":0,"age_opposing":0,"era_window":"","notes":""}],
  "joinery_observations":   [{"clue":"","confidence":0,"age_support":0,"age_opposing":0,"era_window":"","notes":""}],
  "material_observations":  [{"clue":"","confidence":0,"age_support":0,"age_opposing":0,"era_window":"","notes":""}],
  "finish_observations":    [{"clue":"","confidence":0,"age_support":0,"age_opposing":0,"notes":""}],
  "age_support_points":     0,
  "age_opposing_points":    0,
  "hard_negatives_triggered": [],
  "era_intersection_logic": "",
  "primary_date_range":     "",
  "earliest_possible_year": 1600,
  "latest_possible_year":   2025,
  "key_dating_evidence":    [],
  "negative_evidence_applied": [],
  "dating_conflicts":       [],
  "dating_confidence":      "Moderate",
  "caps_applied":           []
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    // Phase 2 uses images for context but reads clues primarily from p0 observations.
    // First run a targeted toolmark/fastener scan, then merge with full scan results.
    const targeted = await this.p0_targeted(
      images,
      "toolmarks",
      p0.observations_by_type,
      { caseId: caseData.id, phase: "dating_grid" }
    );
    const targetedFasteners = await this.p0_targeted(
      images,
      "fasteners",
      p0.observations_by_type,
      { caseId: caseData.id, phase: "dating_grid" }
    );
    const mergedToolmarks = Array.isArray((targeted || {}).new_observations)
      ? this.mergeVisualObs(p0.observations_by_type, targeted, "toolmarks")
      : (Array.isArray((p0.observations_by_type || {}).toolmarks) ? p0.observations_by_type.toolmarks : []);
    const mergedFasteners = Array.isArray((targetedFasteners || {}).new_observations)
      ? this.mergeVisualObs(p0.observations_by_type, targetedFasteners, "fasteners")
      : (Array.isArray((p0.observations_by_type || {}).fasteners) ? p0.observations_by_type.fasteners : []);
    const visualObs = { ...(p0.observations_by_type || {}), toolmarks: mergedToolmarks, fasteners: mergedFasteners };

    let p2raw;
    try {
      p2raw = await this.callClaude(sys, [
        ...this.imgs(images),
        { type: "text", text: `VISUAL SCANNER OBSERVATIONS (full scan + targeted re-examination — use as primary evidence):\nToolmarks: ${JSON.stringify(mergedToolmarks)}\nFasteners: ${JSON.stringify(mergedFasteners)}\nJoinery: ${JSON.stringify(visualObs.joinery||[])}\nFinish: ${JSON.stringify(visualObs.finish||[])}\nHard negatives found: ${JSON.stringify(p0.scan_summary.hard_negatives_found||[])}\nTargeted toolmark summary: ${targeted.targeted_summary||""}\nTargeted fastener summary: ${targetedFasteners.targeted_summary||""}\n\nPhase 1 (Intake): ${JSON.stringify(p1)}` },
      ]);
    } catch(callErr) {
      console.warn("[NCW P2] callClaude threw:", callErr.message, "— using fallback");
      p2raw = { ok:false, error_type:"call_threw", error_message: callErr.message, raw_response:"" };
    }

    console.info("[NCW P2] callClaude ok:", p2raw && p2raw.ok,
      "| error_type:", (p2raw && p2raw.error_type) || "none",
      "| raw_preview:", (p2raw && p2raw.raw_response || "").slice(0, 80));

    // If the network call failed, synthesize a minimal safe p2 from available evidence
    if (!p2raw || p2raw.ok === false) {
      console.warn("[NCW P2] Synthesizing safe fallback p2");
      const hasUndersideObs = (mergedToolmarks.length + mergedFasteners.length) > 0;
      return {
        ok: true,
        _synthesized: true,
        _raw_phase2_response_preview: (p2raw && p2raw.raw_response || "").slice(0, 200),
        phase2_json_extracted: false,
        phase2_schema_valid:   false,
        toolmark_observations:     mergedToolmarks,
        fastener_observations:     mergedFasteners,
        joinery_observations:      [],
        material_observations:     [],
        finish_observations:       [],
        primary_date_range:        hasUndersideObs ? "Date uncertain — engine unavailable" : "Date uncertain — engine unavailable",
        earliest_possible_year:    1800,
        latest_possible_year:      1975,
        dating_confidence:         "Low",
        key_dating_evidence:       mergedToolmarks.slice(0,3).map(o => o.clue || ""),
        negative_evidence_applied: [],
        hard_negatives_triggered:  [],
        dating_conflicts:          [],
        caps_applied:              [],
        era_intersection_logic:    "Synthesized from image observations — P2 LLM call failed",
        age_support_points:        0,
        age_opposing_points:       0,
        new_observations:          [],
        candidates:                [],
        eliminated:                [],
        confidence_adjustments:    [],
      };
    }

    const p2normalized = this.normalize(p2raw, "p2_dating");

    // Guarantee schema completeness on the normalized result
    if (!Array.isArray(p2normalized.new_observations))       p2normalized.new_observations = [];
    if (!Array.isArray(p2normalized.candidates))             p2normalized.candidates = [];
    if (!Array.isArray(p2normalized.eliminated))             p2normalized.eliminated = [];
    if (!Array.isArray(p2normalized.confidence_adjustments)) p2normalized.confidence_adjustments = [];
    p2normalized._raw_phase2_response_preview = (p2raw.raw_response || "").slice(0, 200);
    p2normalized.phase2_json_extracted = true;
    p2normalized.phase2_schema_valid   = true;

    return p2normalized;
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 3 — Form Decision Engine
  // Trigger: run_form_engine = true
  // Most credibility-critical phase. Three separate determinations.
  // ─────────────────────────────────────────────────────────────
  async p3(caseData, images, p0, p1, p2) {
    const forms = DB.forms
      .map(f => `${f.name} [${f.parent_category}, ${f.common_eras}${f.common_conversion_targets ? ` → converts to: ${f.common_conversion_targets}` : ""}]`)
      .join("\n");
    const sys = `You are the Form Decision Engine for the NCW American Furniture Identification Engine.
THIS IS THE MOST CREDIBILITY-CRITICAL PHASE. Three separate determinations required.

${this.wmSummary()}

AVAILABLE FORMS:
${forms}

FORM DETECTION — RUN FIRST, BEFORE SCORING
Inspect the images for structural mechanisms and form signatures before any style or category analysis.
These signatures identify furniture form with higher certainty than proportion or appearance alone.

STEP 1 — MECHANICAL FORM SIGNATURES (check in order):
If ANY of these are clearly visible, classify that specific form and record it as form_detection_method = "mechanical_signature":

DROP-LEAF & GATE TABLE FAMILY:
• hinged leaves + visible gateleg or swing support       → "gateleg drop-leaf table"
• hinged leaves + swing leg (no gate frame)              → "pembroke table"
• hinged leaves + butterfly bracket visible              → "butterfly drop-leaf table"
• hinged leaves visible, support not identified          → "drop-leaf table"

CHEST / TRUNK FAMILY:
• hinged or removable top/lid + till or interior visible → "blanket chest"
• hinged or lift top, no till                            → "storage chest or trunk"

DESK FAMILY:
• angled fall-front writing surface                      → "slant-front desk"
• cylinder roll or tambour shutter over writing surface  → "rolltop desk"
• flat fall-front panel + pigeonhole interior visible    → "secretary desk"
• flat fall-front only                                   → "fall-front desk"

PEDESTAL TABLE FAMILY:
• single central column + tilt hardware visible          → "tilt-top table"
• single central column + tripod legs                   → "tripod pedestal table"
• single central column + platform base                 → "pedestal table"

SPECIALIZED:
• pedal cavity void at base                              → "pump organ cabinet" (likely converted)
• treadle iron bracket mount                             → "sewing machine cabinet"
• zinc/metal-lined interior chamber                      → "icebox"
• adjustable angled shelf/rack                           → "music stand or Canterbury"

STEP 2 — BROAD STRUCTURAL FORM (if no mechanism visible):
Use overall structure and interior logic when no specific mechanism is detected:
• 4+ stacked drawers, no superstructure                 → "chest of drawers"
• 2–3 drawers + mirror mount visible                    → "dresser"
• full-length door(s), tall narrow case                 → "wardrobe"
• raised splash rail + basin shelf                      → "washstand"
• door + drawer combination, case piece                 → appropriate case piece form

STEP 3 — RECORD DETECTION METHOD:
• form_detection_method = "mechanical_signature" — form driven by a specific mechanism (Steps above)
• form_detection_method = "structural_logic"     — form driven by proportions and interior layout
• form_detection_method = "visual_impression"    — form suggested by overall appearance only (weakest)
• mechanical_signature_detected = the specific clue name, or null

Only fall back to broad labels like "table" or "cabinet" when no more specific form can be justified.
Always prefer the narrowest defensible furniture form.

PURPOSE — three independent determinations, do NOT collapse:
1. current_form  — what the object is being used as NOW
2. original_form — what it was originally built as
3. conversion_probability — how likely the form has changed

SCORING — Tier: interior_logic (weight ${WM.tiers.interior_logic}):

FORM SUPPORT POINTS:
• Interior structure layout strongly matches known form                    → form_support +15
• Specialized structural cavity matches known mechanism (pedal/treadle/ice)→ form_support +15 AND original_form_support +15
• Overall proportions clearly fit a specific known form                    → form_support +8
• Leg/support structure fits known form pattern                            → form_support +8
• Storage arrangement matches known form                                   → form_support +6
• Decorative elements typical of known form (Tier J, weight ${WM.tiers.style})          → form_support +4 (weak)

CONVERSION SUPPORT POINTS:
• Current surface use/function conflicts with visible structure             → conversion_support +10
• Original mechanism/cavity present but non-functional or removed          → conversion_support +8
• Later incompatible top added (wrong material or era)                     → conversion_support +8
• Current use impossible without blocking original mechanism               → conversion_support +10
• Structural voids or filled areas suggest removed components              → conversion_support +6
• Hardware mounting patterns inconsistent with current form function       → conversion_support +5

FORM OPPOSITION POINTS:
• Proportions do not fit named form                                        → form_opposing +6
• Structure actively contradicts named form                                → form_opposing +10

CONFIDENCE THRESHOLDS:
• form_support ≥ 70  → form_confidence = "High"
• form_support 45–69 → form_confidence = "Moderate"
• form_support < 45  → form_confidence = "Low"

CONVERSION THRESHOLDS:
• conversion_support ≥ 25 → conversion_probability = "High"
• 15–24               → "Moderate"
• < 15                → "Low"

CONFLICT TRIGGER:
If top two form candidates are within 15 points of each other → set form_conflict flag.
If both original_form and current_form independently exceed threshold → set form_conflict flag.
Do NOT collapse — preserve both candidates.

Apply form_confidence_cap from Phase 1.

SCHEMA CONTRACT — REQUIRED FIELDS WITH SAFE DEFAULTS:
You MUST include every field below in your response, even when evidence is incomplete or uncertain.
Never omit a field. If uncertain, use these safe defaults:
• current_form_candidate   → "unknown" (never omit, never leave blank)
• original_form_candidate  → same as current_form_candidate if no conversion evidence, else best guess or "unknown"
• alternate_form_candidates→ [] (empty array is valid)
• form_scoring_detail      → [] (empty array is valid when no evidence available)
• form_support_points      → 0
• form_opposing_points     → 0
• conversion_support_points→ 0
• conversion_opposing_points→ 0
• current_form_score       → 0
• original_form_score      → 0
• is_conversion            → false (default unless evidence supports conversion)
• conversion_evidence      → [] (empty array is valid)
• conversion_probability   → "Low"
• form_confidence          → "Low" (use Low when evidence is insufficient, not omit)
• form_conflicts           → []
• form_reasoning           → "Insufficient evidence to determine form with confidence." (never omit)
• caps_applied             → []

Phase 1: ${JSON.stringify(p1)}
Phase 2: ${JSON.stringify(p2)}

Respond ONLY in valid JSON. Begin with { and end with }. Include every field listed:
{
  "form_detection_method":     "mechanical_signature|structural_logic|visual_impression",
  "mechanical_signature_detected": null,
  "form_scoring_detail": [{"criterion":"","track":"form_support|conversion_support|form_opposing","score":0,"observed":""}],
  "form_support_points":       0,
  "form_opposing_points":      0,
  "conversion_support_points": 0,
  "conversion_opposing_points":0,
  "current_form_candidate":    "unknown",
  "current_form_score":        0,
  "original_form_candidate":   "unknown",
  "original_form_score":       0,
  "alternate_form_candidates": [],
  "is_conversion":             false,
  "conversion_evidence":       [],
  "conversion_probability":    "Low",
  "form_confidence":           "Low",
  "form_conflicts":            [],
  "form_reasoning":            "Insufficient evidence to determine form with confidence.",
  "caps_applied":              []
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    // Targeted scan for hidden_structure — cavities are the most critical form evidence
    const targetedStructure = await this.p0_targeted(
      images,
      "hidden_structure",
      p0.observations_by_type,
      { caseId: caseData.id, phase: "form_decision", prior_form_guess: p0.broad_form_impression }
    );
    const mergedStructure = this.mergeVisualObs(p0.observations_by_type, targetedStructure, "hidden_structure");

    let _raw_p3;
    try {
      _raw_p3 = await this.callClaude(sys, [
      ...this.imgs(images),
      { type: "text", text: `VISUAL SCANNER OBSERVATIONS (full scan + targeted hidden_structure re-examination):\nConversion cavities / hidden structure: ${JSON.stringify(mergedStructure)}\nHardware: ${JSON.stringify(p0.observations_by_type.hardware||[])}\nBroad form impression: ${p0.broad_form_impression||"unknown"}\nTargeted structure summary: ${targetedStructure.targeted_summary||""}\n\nPhase 1: ${JSON.stringify(p1)}\nPhase 2: ${JSON.stringify(p2)}` },
    ]);
    } catch(_e_p3) {
      console.warn("[NCW P3] callClaude threw:", _e_p3.message);
      _raw_p3 = { ok:false, error_type:"call_threw", error_message: _e_p3.message, raw_response:"" };
    }
    if (!_raw_p3 || _raw_p3.ok === false) {
      console.warn("[NCW P3] Returning safe fallback");
      return {
        ok: true, _synthesized: true, _engine_status: "llm_unavailable",
        current_form_candidate: "Unknown", original_form_candidate: "Unknown",
        is_conversion: false, conversion_probability: "Low",
        form_confidence: "Low", form_support_points: 0, form_opposing_points: 0,
        conversion_support_points: 0, conversion_opposing_points: 0,
        alternate_form_candidates: [], form_scoring_detail: [], conversion_evidence: [],
        form_reasoning: "P3 LLM call failed — form unknown",
        form_detection_method: "broad_fallback", mechanical_signature_detected: null,
      };
    }
    return this.normalize(_raw_p3, "p3_form");
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 4 — Construction Analysis
  // Trigger: run_construction = true
  // Reads joinery + hidden structure from p0 observations.
  // Construction outranks style. Conflicts → flag + explain.
  // ─────────────────────────────────────────────────────────────
  async p4(caseData, images, p0, p1, p2, p3) {
    const sys = `You are the Construction Analysis engine for the NCW American Furniture Identification Engine.

${this.wmSummary()}

PURPOSE
Evaluate how the piece was physically built. Establish manufacturing era, mode, and originality.
Construction OUTRANKS style (Tier J weight ${WM.tiers.style} vs construction Tier weight ${WM.tiers.construction}).
If they conflict, create a construction_conflict and attempt an explanation.

MANUFACTURING MODES:
• hand_craft (pre-1830)
• transitional_craft (1830–1870)
• early_factory (1860–1900)
• factory_production (post-1890)
• modern_production (post-1950)

SCORING:

TIER: hidden_structure (weight ${WM.tiers.hidden_structure}) — HIGHEST:
• Pedal cavity / treadle mount / ice chamber → form_support +12, conversion_support +12
• Structural voids from removed mechanism   → conversion_support +8

TIER: construction (weight ${WM.tiers.construction}):
• hand_cut_dovetails (irregular, hand variation) → age_support +12, originality_support +12
• machine_dovetails (uniform)                   → age_support +10
• mortise_and_tenon (hand-fitted)               → age_support +8, originality_support +8
• dowel_joinery                                 → age_support +6 (post-1900 indicator)
• butt_joint_screwed                            → age_opposing +8, originality_opposing +8
• frame_and_panel                               → originality_support +6
• solid_board_drawer_bottom                     → originality_support +6
• glue_blocks                                   → originality_support +4
• plywood_drawer_bottom                         → age_opposing +15 HARD NEGATIVE (WM: plywood_pre1905 = ${WM.negative_rules.plywood_pre1905})

TIER: materials (weight ${WM.tiers.materials}):
• plywood structural   → age_opposing +${Math.abs(WM.negative_rules.plywood_pre1905)} HARD NEGATIVE eliminates pre-1905
• particle_board       → age_opposing +${Math.abs(WM.negative_rules.particle_board)}, originality_opposing +25 HARD NEGATIVE
• MDF                  → age_opposing +${Math.abs(WM.negative_rules.mdf)}, originality_opposing +25 HARD NEGATIVE
• poplar secondary     → age_support +5
• gumwood secondary    → age_support +4 (1880–1940)
• pine secondary       → originality_support +3

CONFLICT EXPLANATIONS — attempt one if construction conflicts with style or form:
revival_style | replacement_parts | antique_repair | conversion | composite_marriage_piece |
early_industrial_transition | rural_persistence_of_older_methods

Apply construction_confidence_cap from Phase 1.

Phase 1: ${JSON.stringify(p1)}
Phase 2: ${JSON.stringify(p2)}
Phase 3: ${JSON.stringify(p3)}

Respond ONLY in valid JSON:
{
  "construction_scoring_detail": [{"observation":"","tier":"hidden_structure|construction|materials","tracks":["age_support"],"score":0,"notes":""}],
  "age_support_points":             0,
  "age_opposing_points":            0,
  "originality_support_points":     0,
  "originality_opposing_points":    0,
  "form_support_from_structure":    0,
  "conversion_support_from_structure":0,
  "manufacturing_mode":             "",
  "primary_joinery_type":           "",
  "joinery_confidence":             0,
  "drawer_construction":            "",
  "back_panel_construction":        "",
  "secondary_wood":                 "",
  "special_structures":             [],
  "structural_anomalies":           [],
  "hard_negatives_triggered":       [],
  "construction_date_range":        "",
  "construction_conflicts":         [{"conflict":"","explanation_attempted":"","resolved":false}],
  "construction_confidence":        "Moderate",
  "caps_applied":                   []
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    // Targeted scans — joinery is the primary dating surface; construction catches materials
    const targetedJoinery      = await this.p0_targeted(images, "joinery",      p0.observations_by_type, { caseId:caseData.id, phase:"construction_analysis" });
    const targetedConstruction = await this.p0_targeted(images, "construction", p0.observations_by_type, { caseId:caseData.id, phase:"construction_analysis" });
    const mergedJoinery      = this.mergeVisualObs(p0.observations_by_type, targetedJoinery,      "joinery");
    const mergedConstruction = this.mergeVisualObs(p0.observations_by_type, targetedConstruction, "construction");

    let _raw_p4;
    try {
      _raw_p4 = await this.callClaude(sys, [
      ...this.imgs(images),
      { type: "text", text: `VISUAL SCANNER OBSERVATIONS (full scan + targeted joinery/construction re-examination):\nJoinery: ${JSON.stringify(mergedJoinery)}\nConstruction: ${JSON.stringify(mergedConstruction)}\nConversion cavities: ${JSON.stringify(p0.observations_by_type.conversion_cavities||[])}\nToolmarks: ${JSON.stringify(p0.observations_by_type.toolmarks||[])}\nSecondary wood observed: ${p0.secondary_wood_observed||"unknown"}\nTargeted joinery summary: ${targetedJoinery.targeted_summary||""}\nTargeted construction summary: ${targetedConstruction.targeted_summary||""}\n\nP1: ${JSON.stringify(p1)}\nP2: ${JSON.stringify(p2)}\nP3: ${JSON.stringify(p3)}` },
    ]);
    } catch(_e_p4) {
      console.warn("[NCW P4] callClaude threw:", _e_p4.message);
      _raw_p4 = { ok:false, error_type:"call_threw", error_message: _e_p4.message, raw_response:"" };
    }
    if (!_raw_p4 || _raw_p4.ok === false) {
      console.warn("[NCW P4] Returning safe fallback");
      return {
        ok: true, _synthesized: true, _engine_status: "llm_unavailable",
        primary_joinery_type: "unknown", manufacturing_mode: "unknown",
        drawer_construction: "unknown", back_panel_construction: "unknown",
        secondary_wood: "", construction_date_range: "Date uncertain",
        construction_confidence: "Low", construction_support_points: 0, construction_opposing_points: 0,
        structural_anomalies: [], special_structures: [], hard_negatives_triggered: [],
        construction_conflicts: [], caps_applied: [],
      };
    }
    return this.normalize(_raw_p4, "p4_construction");
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 5 — Hardware Analysis
  // Trigger: run_hardware = true
  // Reads hardware observations directly from p0 visual scan.
  // Hardware MUST NOT override construction unless originality ×1.0.
  // ─────────────────────────────────────────────────────────────
  async p5(caseData, images, p0, p1, p2, p3, p4) {
    const styles = DB.style_families.map(s => `${s.name} (${s.era_start}–${s.era_end})`).join(", ");
    const sys = `You are the Hardware Analysis engine for the NCW American Furniture Identification Engine.

${this.wmSummary()}

PURPOSE
Examine all visible hardware. Assess date band, originality, and replacement risk.
Hardware is Tier weight ${WM.tiers.hardware} — supports but does NOT override Tier A–E (weights ${WM.tiers.hidden_structure}–${WM.tiers.interior_logic})
unless originality multiplier is ×1.0 (clearly original).

KNOWN HARDWARE:
• porcelain_caster:       1830–1870, replacement_risk moderate → age_support +8
• wood_caster:            1800–1840, replacement_risk moderate → age_support +6
• victorian_strap_hinge:  1865–1895, replacement_risk moderate → age_support +6, style +4 (Gothic/Victorian Revival)
• batwing_brass_pull:     1720–1790, replacement_risk HIGH → age_support +8, max_multiplier ×0.5
• eastlake_pull:          1870–1890, replacement_risk moderate → age_support +6, style +4 (Eastlake)
• surface_lock:           1750–present, replacement_risk moderate → age_support +4
• modern_concealed_hinge: 1950+, replacement_risk low → age_opposing +${Math.abs(WM.negative_rules.modern_concealed_hinge)}, originality_opposing +15 HARD NEGATIVE

STYLE FAMILIES: ${styles}

ORIGINALITY ASSESSMENT — check all indicators before assigning multiplier:
Indicators of replacement (each present reduces originality confidence):
- Enlarged or plugged screw holes around mount
- Finish disturbance or fresh wood around mount
- Oxidation mismatch between hardware and surrounding wood
- Wear pattern on hardware differs from surrounding wood
- Screws inconsistent with construction era (e.g., phillips in 19th c. mount)
- Hardware shadow/ghost outline does not match current hardware

MULTIPLIERS:
• Clearly original (0 indicators)   → ×1.0 (full score)
• Uncertain (1–2 minor indicators)  → ×0.5
• Likely replaced (3+ indicators)   → ×0.25
• batwing_brass_pull                → max ×0.5 regardless (inherent replacement risk)

HARD NEGATIVES (apply regardless of stated originality):
• phillips_screws in any original mount → age_opposing +${Math.abs(WM.negative_rules.phillips_screw_pre1930)}, originality_opposing +12
• filled/plugged pull holes             → originality_opposing +8
• hardware shadow mismatch             → originality_opposing +8
• finish visibly disturbed around mount→ originality_opposing +6
• modern_concealed_hinge               → age_opposing +${Math.abs(WM.negative_rules.modern_concealed_hinge)}, originality_opposing +15

CONFLICT: If hardware date range conflicts with P4 construction date range by >30 years → flag conflict.
If hardware likely replaced → lower influence. If appears original AND conflicts → higher severity.

Apply hardware_originality_cap from Phase 1.

P1: ${JSON.stringify(p1)}
P3 (Form): ${JSON.stringify(p3)}
P4 (Construction): ${JSON.stringify(p4)}

Respond ONLY in valid JSON:
{
  "hardware_scoring_detail": [
    {"type":"","location":"","originality_indicators_against":[],"appears_original":true,"originality_multiplier":1.0,"raw_score":0,"adjusted_score":0,"date_range":"","notes":""}
  ],
  "age_support_points":          0,
  "age_opposing_points":         0,
  "originality_support_points":  0,
  "originality_opposing_points": 0,
  "hard_negatives_triggered":    [],
  "hardware_date_range":         "",
  "hardware_consistency":        "consistent",
  "style_family_suggested":      null,
  "originality_concerns":        [],
  "hardware_conflicts":          [{"conflict":"","severity":"low|medium|high","likely_replaced":true}],
  "hardware_confidence":         "Moderate",
  "hardware_notes":              "",
  "caps_applied":                []
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    // Targeted scans — hardware is the primary focus; finish helps assess originality
    const targetedHardware = await this.p0_targeted(
      images, "hardware", p0.observations_by_type,
      { caseId:caseData.id, phase:"hardware_analysis",
        construction_date: p4.construction_date_range || "unknown",
        joinery_found: p4.primary_joinery_type || "unknown" }
    );
    const targetedFinish = await this.p0_targeted(
      images, "finish", p0.observations_by_type,
      { caseId:caseData.id, phase:"hardware_analysis" }
    );
    const mergedHardware = this.mergeVisualObs(p0.observations_by_type, targetedHardware, "hardware");
    const mergedFinish   = this.mergeVisualObs(p0.observations_by_type, targetedFinish,   "finish");

    let _raw_p5;
    try {
      _raw_p5 = await this.callClaude(sys, [
      ...this.imgs(images),
      { type: "text", text: `VISUAL SCANNER OBSERVATIONS (full scan + targeted hardware/finish re-examination):\nHardware: ${JSON.stringify(mergedHardware)}\nFinish: ${JSON.stringify(mergedFinish)}\nHard negatives found: ${JSON.stringify(p0.scan_summary.hard_negatives_found||[])}\nTargeted hardware summary: ${targetedHardware.targeted_summary||""}\nTargeted finish summary: ${targetedFinish.targeted_summary||""}\n\nP1: ${JSON.stringify(p1)}\nP3: ${JSON.stringify(p3)}\nP4: ${JSON.stringify(p4)}` },
    ]);
    } catch(_e_p5) {
      console.warn("[NCW P5] callClaude threw:", _e_p5.message);
      _raw_p5 = { ok:false, error_type:"call_threw", error_message: _e_p5.message, raw_response:"" };
    }
    if (!_raw_p5 || _raw_p5.ok === false) {
      console.warn("[NCW P5] Returning safe fallback");
      return {
        ok: true, _synthesized: true, _engine_status: "llm_unavailable",
        hardware_scoring_detail: [], hardware_date_range: "Date uncertain",
        hardware_consistency: "unknown", style_family_suggested: null,
        hardware_confidence: "Low", hardware_support_points: 0, hardware_opposing_points: 0,
        originality_concerns: [], hardware_conflicts: [], hard_negatives_triggered: [],
        hardware_notes: "P5 LLM call failed", caps_applied: [],
      };
    }
    return this.normalize(_raw_p5, "p5_hardware");
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 6 — Conflict Detection Engine
  // Runs between Hardware Analysis and Reconciliation.
  // Does NOT override evidence — interprets and explains contradictions.
  // Sources: conflict_resolution_rules + p0 visual scan + all prior phases.
  // ─────────────────────────────────────────────────────────────
  async p6_conflict(p0, p1, p2, p3, p4, p5) {
    const rules = DB.conflict_resolution_rules;
    const sys = `You are the Conflict Detection Engine for the NCW American Furniture Identification Engine.

PURPOSE
Detect contradictions between evidence types observed in prior phases.
Explain them using known conflict patterns from the conflict_resolution_rules table.
Do NOT override evidence. Do NOT change scores. Record conflicts and compute net confidence adjustments.
The Reconciliation phase will consult your output before forming final conclusions.

CRITICAL RULE: The engine must say "likely revival", "likely hardware replacement",
"likely marriage piece", "likely conversion", or "likely rural persistence"
INSTEAD of incorrectly rejecting or misidentifying the object.
It is always better to explain a contradiction than to suppress it.

CONFLICT RESOLUTION RULES TABLE (seeded reference data):
${JSON.stringify(rules, null, 2)}

CONFLICT DETECTION LOGIC — actively search for each pattern:

1. REVIVAL STYLE
   Condition: style_date implied by decorative language < construction_date implied by toolmarks/joinery
   Example: Colonial-style decorative vocabulary + machine dovetails (post-1860)
   Action: Apply revival_style rule. penalty=${rules[0].confidence_penalty}, recovery=${rules[0].confidence_recovery}

2. HARDWARE REPLACEMENT
   Condition: modern fastener type observed in hardware mount + antique structural evidence elsewhere
   Example: Phillips screws in hinge mortise + hand-cut dovetails in case
   Action: Apply hardware_replacement rule. penalty=${rules[1].confidence_penalty}, recovery=${rules[1].confidence_recovery}

3. MARRIAGE PIECE
   Condition: two major structural components (e.g. base + top, case + doors) show clearly different
              construction eras, wood aging patterns, or joinery types inconsistent with single origin
   Example: base with hand-cut dovetails (pre-1860) + top with plywood panels (post-1920)
   Action: Apply marriage_piece rule. penalty=${rules[2].confidence_penalty}, recovery=${rules[2].confidence_recovery}
   Note: Zero recovery — composite status must be clearly stated.

4. CONVERSION FURNITURE
   Condition: specialized structural cavity present + original mechanism absent + new surface use present
   Example: Pedal cavity structure + no keyboard/bellows + marble top or desk surface added
   Action: Apply conversion_furniture rule. penalty=${rules[3].confidence_penalty}, recovery=${rules[3].confidence_recovery}
   Note: Record BOTH original_form and current_form explicitly.

5. RURAL PERSISTENCE
   Condition: early joinery methods (hand-cut dovetails, mortise and tenon) + later fastener types
              (wire nails, slotted machine screws) + NO strong industrial features
   Example: Hand-cut dovetails + wire nails, no circular saw arcs, no machine routing
   Action: Apply rural_persistence rule. penalty=${rules[4].confidence_penalty}, recovery=${rules[4].confidence_recovery}

SEVERITY LEVELS:
• low    — minor inconsistency, strong explanation available (hardware_replacement, rural_persistence)
• medium — notable conflict, partial explanation (revival_style, conversion_furniture)
• high   — major structural contradiction, no full explanation (marriage_piece, unresolved composites)

CONFIDENCE ADJUSTMENT ARITHMETIC:
net_adjustment = confidence_penalty + confidence_recovery
Example: conversion_furniture → -6 + 6 = 0 net (conflict explained, no residual penalty)
Example: marriage_piece → -10 + 0 = -10 net (conflict recorded, cannot be explained away)
Example: hardware_replacement → -4 + 3 = -1 net

Multiple conflicts: sum all net_adjustments.

All prior phase evidence:
P1 (Intake): ${JSON.stringify(p1)}
P2 (Dating Grid): ${JSON.stringify(p2)}
P3 (Form Decision): ${JSON.stringify(p3)}
P4 (Construction): ${JSON.stringify(p4)}
P5 (Hardware): ${JSON.stringify(p5)}

Respond ONLY in valid JSON:
{
  "conflicts_detected": [
    {
      "conflict_type": "revival_style|hardware_replacement|marriage_piece|conversion_furniture|rural_persistence",
      "rule_id": 1,
      "trigger_evidence_a": "",
      "trigger_evidence_b": "",
      "supporting_observations": [],
      "likely_explanation": "",
      "severity": "low|medium|high",
      "confidence_penalty": 0,
      "confidence_recovery": 0,
      "net_adjustment": 0,
      "resolved": true,
      "resolution_narrative": ""
    }
  ],
  "no_conflicts_detected": false,
  "total_penalty": 0,
  "total_recovery": 0,
  "total_net_adjustment": 0,
  "conflict_summary": "",
  "object_classification_suggested": "original|altered|revival|composite|converted",
  "conflict_interpretation_for_report": ""
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    let _raw_p6_conflict;
    try {
      _raw_p6_conflict = await this.callClaude(sys, [
      { type: "text", text: `VISUAL SCANNER (Phase 0) — all observations:\n${JSON.stringify(p0.observations_by_type||{})}\nAnomalies noted: ${JSON.stringify(p0.anomalies_noted||[])}\n\nP1: ${JSON.stringify(p1)}\nP2: ${JSON.stringify(p2)}\nP3: ${JSON.stringify(p3)}\nP4: ${JSON.stringify(p4)}\nP5: ${JSON.stringify(p5)}` },
    ]);
    } catch(_e_p6_conflict) {
      console.warn("[NCW P6_CONFLICT] callClaude threw:", _e_p6_conflict.message);
      _raw_p6_conflict = { ok:false, error_type:"call_threw", error_message: _e_p6_conflict.message, raw_response:"" };
    }
    if (!_raw_p6_conflict || _raw_p6_conflict.ok === false) {
      console.warn("[NCW P6_CONFLICT] Returning safe fallback");
      return {
        ok: true, _synthesized: true, _engine_status: "llm_unavailable",
        conflicts_detected: [], total_net_adjustment: 0,
        object_classification_suggested: "unknown",
        conflict_interpretation_for_report: "P6 LLM call failed",
        conflict_summary: "",
      };
    }
    return this.normalize(_raw_p6_conflict, "p6_conflict");
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 7 — Reconciliation  (was Phase 6)
  // Now consults conflict engine output (p6_conflict) before
  // forming final conclusions.
  // ─────────────────────────────────────────────────────────────
  async p7(p1, p2, p3, p4, p5, p6c) {
    const sys = `You are the Reconciliation engine for the NCW American Furniture Identification Engine.

${this.wmSummary()}

PURPOSE
Synthesize all prior evidence into a single coherent identification.
You do NOT create new evidence. You resolve contradictions, apply the priority hierarchy,
compute the final scorecard, and produce the confidence band.

CONFLICT ENGINE RESULTS — CONSULT FIRST:
The Conflict Detection Engine (Phase 6) has already identified and classified all evidence
contradictions. Use its output to:
• Accept its object_classification_suggested as a strong starting point
• Apply its total_net_adjustment to your confidence computation
• Use its conflict_interpretation_for_report verbatim in reconciliation_notes
• Do NOT re-litigate resolved conflicts — accept the engine's explanations
• For unresolved HIGH-severity conflicts: cap confidence_band at "Low"

Phase 6 Conflict Engine output: ${JSON.stringify(p6c)}

EVIDENCE PRIORITY ORDER — lower-tier evidence NEVER overrides higher tier:
1.  hidden_structure    (tier weight ${WM.tiers.hidden_structure}) — specialized cavities, internal mechanism evidence
2.  construction        (tier weight ${WM.tiers.construction}) — how the piece was physically built
3.  toolmarks           (tier weight ${WM.tiers.toolmarks}) — saw technology on hidden surfaces
4.  fasteners           (tier weight ${WM.tiers.fasteners}) — nail and screw types
5.  interior_logic      (tier weight ${WM.tiers.interior_logic}) — form identification from structure
6.  hardware (×1.0 only)(tier weight ${WM.tiers.hardware}) — fittings with confirmed originality
7.  materials           (tier weight ${WM.tiers.materials}) — wood species and engineered materials
8.  repairs             (tier weight ${WM.tiers.repairs}) — repair marks and alteration evidence
9.  finish              (tier weight ${WM.tiers.finish}) — finish family and patina
10. style               (tier weight ${WM.tiers.style}) — decorative vocabulary (WEAK)
11. provenance          (tier weight ${WM.tiers.provenance}) — user-stated claims (WEAKEST)

CRITICAL: Tier weights 8–10 (tiers 10, 9, 8, 8, 8 above) MUST dominate conclusions.
Style (weight ${WM.tiers.style}) and provenance (weight ${WM.tiers.provenance}) NEVER outweigh strong physical evidence.

CONFLICT PENALTIES (add to opposing_points — use Conflict Engine totals when available):
• style conflicts with construction        → ${WM.penalties.style_vs_construction}
• hardware vs structure, likely replaced   → ${WM.penalties.hardware_vs_structure_replaced}
• hardware vs structure, appears original  → ${WM.penalties.hardware_vs_structure_original}
• finish significantly newer than structure→ ${WM.penalties.finish_newer_than_structure}
• interior logic conflicts with form label → ${WM.penalties.interior_logic_vs_form}
• major composite/marriage mismatch        → ${WM.penalties.composite_mismatch}
• missing critical evidence category       → ${WM.penalties.missing_critical_evidence} per category (max 2)

CONFLICT RECOVERIES (subtract from opposing_points when explanation resolves conflict):
• revival_style                     → recover ${WM.recoveries.revival_style}
• replacement_hardware              → recover ${WM.recoveries.replacement_hardware}
• antique_repair                    → recover ${WM.recoveries.antique_repair}
• conversion                        → recover ${WM.recoveries.conversion}
• composite_marriage_piece          → recover ${WM.recoveries.composite_marriage_piece}
• early_industrial_transition       → recover ${WM.recoveries.early_industrial_transition}
• rural_persistence_older_methods   → recover ${WM.recoveries.rural_persistence_older_methods}

HARD NEGATIVE MATRIX (apply immediately when triggered — add directly to opposing_points):
• phillips_screws original to structure → ${WM.negative_rules.phillips_screw_pre1930} age
• particle_board present               → ${WM.negative_rules.particle_board} age/originality
• MDF present                          → ${WM.negative_rules.mdf} age/originality
• staple_fastener structural           → ${WM.negative_rules.staple_fastener} age/originality
• plywood structural                   → ${WM.negative_rules.plywood_pre1905} age
• polyurethane as original finish      → ${WM.negative_rules.polyurethane_original} originality
• modern_concealed_hinge               → ${WM.negative_rules.modern_concealed_hinge} age/originality
• orbital_sander_swirl on "untouched"  → ${WM.negative_rules.orbital_sander_swirl} originality

CONFIDENCE FORMULA (from WM):
confidence_pct = overall_supporting_points / (overall_supporting_points + overall_opposing_points) × 100
Then apply conflict engine total_net_adjustment: confidence_pct += total_net_adjustment
Bands: High=85-100, Moderate=65-84, Low=40-64, Inconclusive=<40
After computing: apply any remaining caps from Phase 1 (caps can only LOWER, never raise).

UNRESOLVED HIGH-WEIGHT CONFLICT CAP:
If any high-severity conflict from the Conflict Engine remains unresolved → cap confidence_band at "Low".

OBJECT CLASSIFICATION — use conflict engine's suggestion unless physical evidence contradicts it:
• original   — no significant alterations; original form and function intact
• altered    — original form intact but significant modifications made
• revival    — later reproduction of earlier style; construction confirms post-style-era date
• composite  — parts from different pieces married together
• converted  — original form and function changed to different use

Accumulate the FULL SCORECARD by summing contributions from all prior phases.
All phase outputs:
P1: ${JSON.stringify(p1)}
P2: ${JSON.stringify(p2)}
P3: ${JSON.stringify(p3)}
P4: ${JSON.stringify(p4)}
P5: ${JSON.stringify(p5)}

Respond ONLY in valid JSON:
{
  "scorecard": {
    "age_support_points":          0,
    "age_opposing_points":         0,
    "form_support_points":         0,
    "form_opposing_points":        0,
    "originality_support_points":  0,
    "originality_opposing_points": 0,
    "conversion_support_points":   0,
    "conversion_opposing_points":  0,
    "negative_penalty_total":      0,
    "confidence_caps_applied":     []
  },
  "reconciliation_priority_log": [
    {"priority_rank":1,"tier":"hidden_structure","tier_weight":10,"evidence_type":"","finding":"","weight_applied":0,"source_phase":""}
  ],
  "conflicts_found": [
    {"conflict":"","tier_involved":"","penalty_applied":0,"explanation_attempted":"","recovery_applied":0,"resolved":true,"resolution_note":""}
  ],
  "negative_evidence_triggered": [
    {"rule":"","penalty":0,"tracks_affected":[]}
  ],
  "conflict_engine_net_adjustment": 0,
  "object_classification":        "original",
  "reconciled_date_range":        "",
  "reconciled_style_family":      null,
  "reconciled_form":              "",
  "original_form":                "",
  "alterations":                  [],
  "supporting_evidence":          [],
  "overall_supporting_points":    0,
  "overall_opposing_points":      0,
  "raw_confidence_percent":       0,
  "confidence_percent":           0,
  "confidence_band":              "Moderate",
  "unresolved_high_weight_conflict": false,
  "reconciliation_notes":         ""
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    let _raw_p7;
    try {
      _raw_p7 = await this.callClaude(sys, [
      { type: "text", text: `P1: ${JSON.stringify(p1)}\nP2: ${JSON.stringify(p2)}\nP3: ${JSON.stringify(p3)}\nP4: ${JSON.stringify(p4)}\nP5: ${JSON.stringify(p5)}\nP6_Conflicts: ${JSON.stringify(p6c)}` },
    ]);
    } catch(_e_p7) {
      console.warn("[NCW P7] callClaude threw:", _e_p7.message);
      _raw_p7 = { ok:false, error_type:"call_threw", error_message: _e_p7.message, raw_response:"" };
    }
    if (!_raw_p7 || _raw_p7.ok === false) {
      console.warn("[NCW P7] Returning safe fallback");
      return {
        ok: true, _synthesized: true, _engine_status: "llm_unavailable",
        reconciled_form: "Unknown", reconciled_date_range: "Date uncertain — engine unavailable",
        reconciled_style_family: null, original_form: null,
        confidence_percent: 40, confidence_band: "Low",
        overall_supporting_points: 0, overall_opposing_points: 0,
        scorecard: {}, supporting_evidence: [], conflicts_found: [],
        alterations: [], negative_evidence_applied: [],
        reconciliation_notes: "P7 LLM call failed", object_classification: "unknown",
      };
    }
    return this.normalize(_raw_p7, "p7_reconciliation");
  },

  // ─────────────────────────────────────────────────────────────
  // PHASE 8 — Valuation  (was Phase 7)
  // Trigger: reconciliation complete, band ≠ Inconclusive,
  //          form_confidence ≥ Moderate
  // Values the object AS IT EXISTS NOW.
  // ─────────────────────────────────────────────────────────────
  async p8(p3, p7) {
    const band = p7.confidence_band || "Moderate";
    const formConf = p3.form_confidence || "Moderate";

    if (band === "Inconclusive") {
      return { valuation_skipped: true, skip_reason: "Identification is Inconclusive — minimum Moderate required for valuation.", valuations: [], value_drivers: [], value_detractors: [], market_notes: "", value_adjustments_applied: [] };
    }
    if (formConf === "Low" && band === "Low") {
      return { valuation_skipped: true, skip_reason: "Both form and age confidence are Low — valuation cannot proceed reliably.", valuations: [], value_drivers: [], value_detractors: [], market_notes: "", value_adjustments_applied: [] };
    }

    const provisional = band === "Low" || formConf === "Low";
    const sys = `You are the Valuation engine for the NCW American Furniture Identification Engine.
${provisional ? "⚠️  PROVISIONAL — confidence is Low. The narrative must explicitly state this is a provisional estimate." : ""}

${this.wmSummary()}

CRITICAL: Value the object AS IT EXISTS NOW, not as a hypothetical perfect original.

VALUE MODIFIERS (from WM) — apply applicable ones as percentage adjustments to base:
Positive: ${JSON.stringify(Object.fromEntries(Object.entries(WM.value_modifiers).filter(([,v])=>v>0)))}
Negative: ${JSON.stringify(Object.fromEntries(Object.entries(WM.value_modifiers).filter(([,v])=>v<0)))}

MARKET LANES — all five required:
1. dealer_buy       — what a knowledgeable dealer pays to acquire for resale
2. quick_sale       — estate sale or fast local disposal
3. marketplace      — Facebook Marketplace / peer-to-peer
4. as_found_retail  — retail asking price, current unrestored condition
5. restored_retail  — retail after appropriate professional restoration

Base estimates on 2024–2025 American antique furniture market.
Consider regional variation: high-style urban vs. general secondary market.
All values in USD.

Identification: ${JSON.stringify(p7)}
Form assessment: ${JSON.stringify(p3)}
Confidence band: ${band}

Respond ONLY in valid JSON:
{
  "valuation_skipped":  false,
  "provisional":        ${provisional},
  "valuations": [
    {"market_lane":"dealer_buy",      "low":0,"high":0,"rationale":""},
    {"market_lane":"quick_sale",      "low":0,"high":0,"rationale":""},
    {"market_lane":"marketplace",     "low":0,"high":0,"rationale":""},
    {"market_lane":"as_found_retail", "low":0,"high":0,"rationale":""},
    {"market_lane":"restored_retail", "low":0,"high":0,"rationale":""}
  ],
  "value_adjustments_applied": [{"factor":"","direction":"positive|negative","adjustment_percent":0}],
  "value_drivers":    [],
  "value_detractors": [],
  "market_notes":     ""
}
RESPONSE FORMAT — MANDATORY:
Return ONLY a valid JSON object. No markdown. No code fences. No explanation before or after.
If uncertain about a field, use a safe default value rather than natural language.
Begin your response with { and end with }. Do not include any text outside the JSON object.
`;
    let _raw_p8;
    try {
      _raw_p8 = await this.callClaude(sys, [
      { type: "text", text: `Form: ${JSON.stringify(p3)}\nReconciliation: ${JSON.stringify(p7)}` },
    ]);
    } catch(_e_p8) {
      console.warn("[NCW P8] callClaude threw:", _e_p8.message);
      _raw_p8 = { ok:false, error_type:"call_threw", error_message: _e_p8.message, raw_response:"" };
    }
    if (!_raw_p8 || _raw_p8.ok === false) {
      console.warn("[NCW P8] Returning safe fallback");
      return {
        ok: true, _synthesized: true, _engine_status: "llm_unavailable",
        valuations: [], value_drivers: [], value_detractors: [],
        market_notes: "P8 LLM call failed — valuation unavailable",
        value_adjustments: [],
      };
    }
    return this.normalize(_raw_p8, "p8_valuation");
  },

  // ─────────────────────────────────────────────────────────────
  // ORCHESTRATOR — 9-phase pipeline (Phase 0 + 8 reasoning phases)
  // ─────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────
  // QUICK MODE — independent schema and validator
  // Completely separate from full-analysis validation.
  // Schema: QuickScanResponse
  // ─────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────
  // QUICK MODE — independent schema, tolerant validator, fallback interpreter
  // Completely separate from full-analysis validation.
  // Schema: QuickScanResponse (relaxed — degrades gracefully)
  // ─────────────────────────────────────────────────────────────

  // QuickScanResponse — informational fields that MUST have at least one
  // present to accept the response. All others get safe defaults if missing.
  QUICK_SCHEMA: {
    // At least ONE of these must be non-empty to accept the response
    informational: ["likely_identification","estimated_date_range","confidence","short_reason"],
    // These get defaults if missing — never block the result
    optional_with_defaults: ["estimated_value_low","estimated_value_high","buy_guidance"],
    // Field alias map: alternative names models sometimes use → canonical name
    aliases: {
      possible_item:    "likely_identification",
      item:             "likely_identification",
      identification:   "likely_identification",
      form:             "likely_identification",
      likely_form:      "likely_identification",
      date_estimate:    "estimated_date_range",
      date_range:       "estimated_date_range",
      period:           "estimated_date_range",
      estimated_period: "estimated_date_range",
      certainty:        "confidence",
      confidence_level: "confidence",
      rating:           "confidence",
      reason:           "short_reason",
      rationale:        "short_reason",
      explanation:      "short_reason",
      buying_rationale: "short_reason",
      value_low:        "estimated_value_low",
      low:              "estimated_value_low",
      value_high:       "estimated_value_high",
      high:             "estimated_value_high",
      signal:           "buy_guidance",
      buying_signal:    "buy_guidance",
      guidance:         "buy_guidance",
      recommendation:   "buy_guidance",
    },
  },

  // Normalize a raw parsed object into QuickScanResponse canonical fields.
  // 1. Apply alias mapping for any non-standard field names.
  // 2. Fill missing fields with safe defaults.
  // 3. Normalize confidence and buy_guidance to expected value sets.
  normalizeQuickResponse(parsed) {
    if (!parsed || typeof parsed !== "object") return null;
    const out = { ...parsed };

    // Apply aliases
    for (const [alias, canonical] of Object.entries(this.QUICK_SCHEMA.aliases)) {
      if (out[alias] !== undefined && out[canonical] === undefined) {
        out[canonical] = out[alias];
      }
    }

    // Normalize confidence — 4-level ladder:
    // "Very High" | "High" | "Moderate" | "Low"
    if (out.confidence) {
      const c = String(out.confidence).toLowerCase().replace(/[_\s-]+/g," ");
      if      (c.includes("very high") || c.includes("very_high")) out.confidence = "Very High";
      else if (c.includes("high"))                                  out.confidence = "High";
      else if (c.includes("mod"))                                   out.confidence = "Moderate";
      else                                                          out.confidence = "Low";
    }

    // Normalize buy_guidance
    if (out.buy_guidance) {
      const g = String(out.buy_guidance).toLowerCase();
      if      (g.includes("buy") && !g.includes("over"))  out.buy_guidance = "Buy";
      else if (g.includes("fair") || g.includes("ok"))    out.buy_guidance = "Fair Price";
      else if (g.includes("over") || g.includes("high"))  out.buy_guidance = "Overpriced";
      else if (g.includes("pass") || g.includes("skip"))  out.buy_guidance = "Pass";
      else if (g.includes("caut"))                        out.buy_guidance = "Caution";
    }

    // Safe defaults for missing fields
    if (!out.likely_identification)  out.likely_identification  = "Undetermined";
    if (!out.estimated_date_range)   out.estimated_date_range   = "Unknown";
    if (!out.confidence)             out.confidence             = "Low";
    // Ensure confidence is one of the four valid ladder values
    if (!["Very High","High","Moderate","Low"].includes(out.confidence)) out.confidence = "Low";
    if (!out.short_reason)           out.short_reason           = "";
    if (out.estimated_value_low  === undefined) out.estimated_value_low  = 0;
    if (out.estimated_value_high === undefined) out.estimated_value_high = 0;
    if (!out.buy_guidance)           out.buy_guidance           = "Caution";

    return out;
  },

  // Validate a Quick Mode response — TOLERANT.
  // Accepts if at least ONE informational field is non-empty.
  // Missing fields get defaults via normalizeQuickResponse.
  // Only rejects if ZERO informational fields are present.
  validateQuickResponse(raw, parsed) {
    if (!parsed || typeof parsed !== "object") {
      console.warn("[NCW Quick] JSON parse failure, raw:", raw.slice(0,300));
      return { ok: false, error_type:"json_parse_error", raw_response: raw || "" };
    }

    // Apply aliases before checking
    const normalized = this.normalizeQuickResponse(parsed);

    // Check at least one informational field is meaningful
    const hasAny = this.QUICK_SCHEMA.informational.some(f =>
      normalized[f] && normalized[f] !== "Undetermined" && normalized[f] !== "Unknown" && normalized[f] !== ""
    );

    if (!hasAny) {
      console.warn("[NCW Quick] No informational fields found. Raw:", raw.slice(0,300));
      return { ok: false, error_type:"no_informational_fields", raw_response: raw || "" };
    }

    console.info("[NCW Quick] Response accepted. Fields:", Object.keys(normalized).join(", "));
    return { ok: true, data: normalized };
  },

  // callClaudeQuick — independent caller for Quick Mode
  async callClaudeQuick(system, userContent) {
    // When userContent is an array (vision call), prepend a text instruction block
    // so the model receives an explicit question alongside the images.
    const contentToSend = Array.isArray(userContent)
      ? [{ type: "text", text: "Examine each photo carefully and return the JSON analysis requested in the system prompt." }, ...userContent]
      : userContent;

    const imgCount = Array.isArray(userContent) ? userContent.filter(b => b.type === "image").length : 0;
    console.info("[NCW Quick] Sending request — images:", imgCount, "| model: claude-sonnet-4-6 | max_tokens: 1800");
    if (imgCount === 0) console.warn("[NCW Quick] WARNING: no images in request — vision call will return nothing useful");

    // Log the request structure (truncating base64 data for readability)
    const debugPayload = {
      model: "claude-sonnet-4-6",
      max_tokens: 1800,
      system_len: system.length,
      messages_content_types: contentToSend.map(b => b.type + (b.type === "image" ? "(" + (b.source && b.source.media_type) + ",len=" + (b.source && b.source.data && b.source.data.length) + ")" : "(len=" + (b.text||"").length + ")")),
    };
    console.info("[NCW Quick] Request structure:", JSON.stringify(debugPayload));

    // ── Diagnostics object — written to at every stage, returned on failure ──
    const diag = {
      model_name:             "claude-sonnet-4-6",
      endpoint:               "/api/analyze",
      http_status:            null,
      fetch_ok:               null,
      response_content_type:  null,
      response_text_preview:  null,
      parsed_top_level_keys:  null,
      has_data_content:       null,
      has_data_error:         null,
      caught_exception:       null,
    };
    diag.cf_request_payload_built = true;
    console.info("[NCW Stage0] CF: request_payload_built");

    let res, bodyText, data;
    diag.cf_fetch_started = true;
    console.info("[NCW Stage0] CF: fetch_started");
    try {
      res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model:      "claude-sonnet-4-6",
          max_tokens: 1800,
          system,
          messages:   [{ role: "user", content: contentToSend }],
        }),
      });
    diag.cf_fetch_resolved = true;
    console.info("[NCW Stage0] CF: fetch_resolved | status:", res && res.status);
    } catch(fetchErr) {
      diag.caught_exception = "fetch() threw: " + fetchErr.message;
      console.error("[NCW Quick] fetch() threw:", fetchErr.message);
      return { ok:false, error_type:"fetch_threw", raw_response:"", _diag: diag };
    }

    // ── Read raw body text BEFORE attempting JSON parse ──────────
    diag.http_status            = res.status;
    diag.fetch_ok               = res.ok;
    diag.response_content_type  = res.headers.get("content-type") || "(none)";
    console.info("[NCW Quick] http_status:", diag.http_status,
      "| fetch_ok:", diag.fetch_ok,
      "| content-type:", diag.response_content_type);

    try {
      bodyText = await res.text();
    } catch(textErr) {
      diag.caught_exception = "res.text() threw: " + textErr.message;
      console.error("[NCW Quick] res.text() threw:", textErr.message);
      return { ok:false, error_type:"body_read_error", raw_response:"", _diag: diag };
    }

    diag.cf_response_text_read = true;
    console.info("[NCW Stage0] CF: response_text_read | len:", bodyText.length);
    diag.response_text_preview = bodyText.slice(0, 300);
    console.info("[NCW Quick] response_text_preview (first 300):", diag.response_text_preview);
    console.info("[NCW Quick] body_total_length:", bodyText.length);

    // ── Parse JSON ───────────────────────────────────────────────
    diag.cf_json_parse_started = true;
    console.info("[NCW Stage0] CF: json_parse_started");
    try {
      data = JSON.parse(bodyText);
    } catch(jsonErr) {
      diag.caught_exception = "JSON.parse threw: " + jsonErr.message;
      console.error("[NCW Quick] JSON.parse threw:", jsonErr.message, "| body[:200]:", bodyText.slice(0,200));
      return { ok:false, error_type:"json_parse_body", raw_response: bodyText, _diag: diag };
    }

    diag.cf_json_parse_finished = true;
    console.info("[NCW Stage0] CF: json_parse_finished");
    diag.parsed_top_level_keys = Object.keys(data).join(", ");
    diag.has_data_content      = Array.isArray(data.content);
    diag.has_data_error        = !!data.error;
    console.info("[NCW Quick] parsed_top_level_keys:", diag.parsed_top_level_keys);
    console.info("[NCW Quick] has_data_content:", diag.has_data_content,
      "| has_data_error:", diag.has_data_error);

    if (data.content) {
      console.info("[NCW Quick] content_block_count:", data.content.length,
        "| block_types:", data.content.map(b => b.type).join(", "));
      data.content.forEach(function(b, i) {
        console.info("[NCW Quick] block[" + i + "] type=" + b.type +
          " text_len=" + (b.text || "").length +
          " first80=" + (b.text || "").slice(0, 80));
      });
    }

    if (data.error) {
      console.warn("[NCW Quick] data.error:", JSON.stringify(data.error));
      return { ok:false, error_type:"api_error", raw_response: JSON.stringify(data.error), _diag: diag };
    }

    if (!data.content || !Array.isArray(data.content)) {
      console.warn("[NCW Quick] no content array in response. Full data:", JSON.stringify(data).slice(0,400));
      return { ok:false, error_type:"bad_response_shape", raw_response: bodyText, _diag: diag };
    }

    const raw = data.content.map(function(b) { return b.text || ""; }).join("\n") || "";
    console.info("[NCW Quick] extracted_raw_len:", raw.length,
      "| stop_reason:", data.stop_reason,
      "| usage:", JSON.stringify(data.usage || {}),
      "| raw_first_300:", raw.slice(0, 300));

    if (!raw.trim()) {
      console.warn("[NCW Quick] empty response text | stop_reason:", data.stop_reason);
      return { ok:false, error_type:"empty_response", raw_response: bodyText, stop_reason: data.stop_reason, _diag: diag };
    }

    const sanitizeQ = (text) => {
      let s = text.replace(/`{3}json[\s\S]*?`{3}|`{3}[\s\S]*?`{3}/g, "").trim();
      const firstBrace = s.indexOf("{");
      if (firstBrace > 0) s = s.slice(firstBrace);
      const m = s.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON object found in response");
      return JSON.parse(m[0]);
    };
    try {
      const parsed = sanitizeQ(raw);
      console.info("[NCW Quick] Parse OK. Top-level keys:", Object.keys(parsed).join(", "));
      diag.cf_stage0_returned = true;
      console.info("[NCW Stage0] CF: stage0_returned (success)");
      return Object.assign({}, parsed, { _diag: diag });
    } catch(_e1) {
      console.warn("[NCW Quick] JSON parse failed. cleaned[:300]:", cleaned.slice(0,300));
      // One retry with tighter instruction
      try {
        const r2 = await fetch("/api/analyze", {
          method:"POST", headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01"},
          body: JSON.stringify({
            model:"claude-sonnet-4-6", max_tokens:1800,
            system: system + "\n\nCRITICAL: Return ONLY valid JSON. Start with { and end with }. No markdown.",
            messages:[
              { role:"user",      content: contentToSend },
              { role:"assistant", content: raw },
              { role:"user",      content: "Return only the JSON object now, starting with {." },
            ],
          }),
        });
        const d2   = await r2.json();
        if (!d2.content || !Array.isArray(d2.content)) {
          return { ok:false, error_type:"bad_response_shape_retry", raw_response: JSON.stringify(d2) };
        }
        const raw2 = d2.content.map(b => b.text||"").join("\n") || "";
        console.info("[NCW Quick] Retry raw length:", raw2.length);
        return { ok: true, ...sanitizeQ(raw2) };
      } catch(_e2) {
        console.warn("[NCW Quick] Parse failed after retry.");
        return { ok:false, error_type:"json_parse_error", raw_response: raw };
      }
    }
  },

  // ─────────────────────────────────────────────────────────────
  // FIELD SCAN PIPELINE  — 5 stages
  //
  // Stage 0: Photo Evidence Digest  — scan ALL photos, build combined digest
  // Stage 1: Form Recognition       — detect structural/mechanical signatures
  // Stage 2: Narrow Identification  — resolve specific form from signatures
  // Stage 3: Date Estimation        — date from fasteners, toolmarks, hardware
  // Stage 4: Market / Buy Guidance  — valuation and buy signal
  //
  // Each stage has ONE job.
  // The digest is built once and passed through every downstream stage.
  // Adding more photos updates the digest and reruns from Stage 1.
  // ─────────────────────────────────────────────────────────────
  async runQuickMode(caseData, images, intake, onPhase) {
    const so          = {};
    const askingPrice = parseFloat(intake.asking_price) || null;

    // ── Evidence cache: build a fingerprint of current images ──
    // Only re-run Stage 0 when the image set has actually changed.
    const imgFingerprint = images.filter(function(i){ return i.data_url; })
      .map(function(i){ return i.image_type + ":" + (i.data_url || "").length; }).join("|");
    const cached = caseData._evidence_cache;
    const cacheHit = cached && cached.fingerprint === imgFingerprint && cached.digest;
    if (cacheHit) {
      console.info("[NCW runQuickMode] Cache hit — reusing Stage 0 evidence digest (fingerprint unchanged)");
    }

    // ── Stage 0: Photo Evidence Digest ──────────────────────────
    // Scan ALL submitted photos in a SINGLE call.
    // Build a combined evidence list that updates as photos are added.
    // This is the only stage that looks at images directly.
    const photoCount  = images.filter(i => i.data_url).length;
    const imageLabels = images.map(i => i.image_type).join(", ");

    let digest = {
      photos_used_count:       photoCount,
      photo_types_included:    images.map(i => i.image_type),
      evidence_digest:         [],
      mechanical_signatures:   [],
      strongest_signature:     null,
      fastener_clues:          [],
      toolmark_clues:          [],
      hardware_clues:          [],
      primary_wood_guess:      "",
      broad_form_guess:        "",
      hard_negatives:          [],
      image_quality_overall:   "unknown",
    };

    try {
      const digestResult = cacheHit
        ? cached.digest  // reuse cached result — no API call
        : await runEvidenceDigest(images, {
            photoCount, imageLabels, userGuess: intake.user_category_guess || "",
          });
      console.info("[NCW FS Stage0] digestResult.ok:", digestResult.ok, "| keys:", Object.keys(digestResult).join(", "));
      if (digestResult._diag) { digest._diag = digestResult._diag; }
      if (digestResult.ok !== false) {
        digest = { ...digest, ...digestResult };
        if (digestResult._diag) digest._diag = digestResult._diag;
        digest.photos_used_count    = photoCount;
        digest.photo_types_included = images.map(i => i.image_type);
        if (!digest.mechanisms_detected) digest.mechanisms_detected = {};
        // ── Fallback extractor: if evidence_digest empty but LLM saw the images, ──
        // synthesize minimal clues from broad_form_guess + mechanisms_detected
        if ((!digest.evidence_digest || digest.evidence_digest.length === 0) && digest.broad_form_guess) {
          digest.evidence_digest = ["Broad form observed: " + digest.broad_form_guess];
        }
        if ((!digest.evidence_digest || digest.evidence_digest.length === 0)) {
          // Last-resort: extract any present mechanisms into prose
          const mechProse = Object.entries(digest.mechanisms_detected || {})
            .filter(([, v]) => v && v.present)
            .map(([k, v]) => k.replace(/_/g, " ") + (v.note ? " — " + v.note : ""));
          if (mechProse.length > 0) digest.evidence_digest = mechProse;
        }
        console.info("[NCW FS Stage0] Digest after merge — evidence_digest:", digest.evidence_digest, "| mechanisms:", Object.keys(digest.mechanisms_detected||{}).filter(k=>digest.mechanisms_detected[k].present));
            } else {
        // Store the raw failure response in digest so debug panel can read it
        digest._raw_response     = digestResult.raw_response || "";
        digest._raw_response_len = (digestResult.raw_response || "").length;
        digest._error_type       = digestResult.error_type || "unknown";
        // Store full diagnostics object if available
        if (digestResult._diag) {
          digest._diag = digestResult._diag;
        }
        console.warn("[NCW FS Stage0] Digest degraded — error_type:", digestResult.error_type, "| raw (first 400):", (digestResult.raw_response||"").slice(0,400));
      }
    } catch(e) {
      digest._cf_catch_message = e.message;
      digest._cf_catch_stack   = (e.stack || "").slice(0, 300);
      console.error("[NCW FS Stage0] CAUGHT:", e.message, "stack:", (e.stack||"").slice(0,200));
    }
    // Store raw response length for debug visibility
    digest._raw_response_len = digest._raw_response ? digest._raw_response.length : 0;
    so["0_evidence_digest"] = digest;
    if (typeof onPhase === "function") onPhase(0, digest);
    // Store in caseData evidence cache for reuse on rerun or mode upgrade
    caseData._evidence_cache = { fingerprint: imgFingerprint, digest: digest };
    caseData._visual_evidence = digest;  // canonical visual_evidence alias

    // ── Client-side mechanism resolver ───────────────────────────
    // Reads structured mechanisms_detected flags + prose evidence_digest.
    // Applies form taxonomy: family → subfamily → specific form.
    // Runs BEFORE Stage 1 and pre-populates formResult if signatures clear.
    const mech = digest.mechanisms_detected || {};
    const mechPresent = (key, minConf = 25) =>
      !!(mech[key] && mech[key].present === true && (mech[key].confidence || 0) >= minConf);
    const digestProse = (digest.evidence_digest || []).join(" ").toLowerCase();
    // Also check mechanical_signatures array
    const sigClues = (digest.mechanical_signatures || []).map(s => (s.clue || s.implied_form || "").toLowerCase()).join(" ");
    const anyOf = (...terms) => terms.some(t => digestProse.includes(t) || sigClues.includes(t));

    let clientSideFamily    = null;
    let clientSideSubfamily = null;
    let clientSideForm      = null;
    let clientSideKey       = null;
    let clientSideMethod    = "broad_fallback";
    let clientSideConf      = "Low";

    // TABLE FAMILY
    if (mechPresent("drop_leaf_hinged") || anyOf("leaf","drop leaf","hinged leaf","hinge line","leaf seam","fold seam")) {
      clientSideFamily = "table";
      clientSideKey    = "table";
      if (mechPresent("gateleg_support") || anyOf("gateleg","gate leg","gate support","swing gate","swing frame","pivot leg","swing-leg","pivoting leg","extra leg","secondary leg")) {
        clientSideSubfamily = "drop-leaf table";
        clientSideForm      = "gateleg drop-leaf table";
        clientSideMethod    = "mechanical_signature";
        clientSideConf      = "Moderate";
      } else if (mechPresent("swing_leg") || anyOf("swing leg","pembroke","single pivot leg")) {
        clientSideSubfamily = "drop-leaf table";
        clientSideForm      = "pembroke table";
        clientSideMethod    = "mechanical_signature";
        clientSideConf      = "Moderate";
      } else {
        clientSideSubfamily = "drop-leaf table";
        clientSideForm      = "drop-leaf table";
        clientSideMethod    = "mechanical_signature";
        clientSideConf      = "Moderate";
      }
    } else if (mechPresent("extension_mechanism") || anyOf("extension","slide mechanism","extra leaf")) {
      clientSideFamily    = "table";
      clientSideSubfamily = "extension table";
      clientSideForm      = "extension dining table";
      clientSideKey       = "table";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "Moderate";
    } else if ((mechPresent("pedestal_base") && mechPresent("tilt_top")) || anyOf("tilt top","tilt-top")) {
      clientSideFamily    = "table";
      clientSideSubfamily = "tilt-top table";
      clientSideForm      = "tilt-top table";
      clientSideKey       = "table";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "High";
    } else if (mechPresent("tripod_base") || anyOf("tripod","candlestand")) {
      clientSideFamily    = "table";
      clientSideSubfamily = "pedestal table";
      clientSideForm      = "tripod pedestal table";
      clientSideKey       = "table";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "High";
    } // CHEST FAMILY
    else if (mechPresent("lift_lid") || anyOf("lift lid","hinged top","hinged lid","chest lid","lid hinge")) {
      clientSideFamily = "chest";
      clientSideKey    = "chest";
      if (mechPresent("till_interior") || anyOf("till","tray inside","interior tray")) {
        clientSideSubfamily = "blanket chest";
        clientSideForm      = "blanket chest";
      } else {
        clientSideSubfamily = "storage chest";
        clientSideForm      = "storage chest or trunk";
      }
      clientSideMethod = "mechanical_signature";
      clientSideConf   = "High";
    } // DESK FAMILY
    else if (mechPresent("cylinder_roll") || anyOf("rolltop","roll top","tambour","cylinder roll")) {
      clientSideFamily    = "desk";
      clientSideSubfamily = "rolltop desk";
      clientSideForm      = "rolltop desk";
      clientSideKey       = "desk";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "High";
    } else if (mechPresent("slant_front") || anyOf("slant front","slant-front")) {
      clientSideFamily    = "desk";
      clientSideSubfamily = "slant-front desk";
      clientSideForm      = "slant-front desk";
      clientSideKey       = "desk";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "High";
    } else if (mechPresent("fall_front") || anyOf("fall front","secretary","fall-front")) {
      clientSideFamily    = "desk";
      clientSideSubfamily = "secretary desk";
      clientSideForm      = "secretary desk";
      clientSideKey       = "desk";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "Moderate";
    } // SPECIALIZED
    else if (mechPresent("pedal_cavity_structure") || anyOf("pedal","organ")) {
      clientSideFamily    = "specialized";
      clientSideSubfamily = "organ cabinet";
      clientSideForm      = "pump organ cabinet (converted)";
      clientSideKey       = "specialized";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "High";
    } else if (mechPresent("treadle_mount") || anyOf("treadle","sewing machine")) {
      clientSideFamily    = "specialized";
      clientSideSubfamily = "sewing cabinet";
      clientSideForm      = "sewing machine cabinet";
      clientSideKey       = "specialized";
      clientSideMethod    = "mechanical_signature";
      clientSideConf      = "High";
    } else if (mechPresent("washstand_splash") || anyOf("washstand","splash back","basin shelf")) {
      clientSideFamily    = "cabinet";
      clientSideSubfamily = "washstand";
      clientSideForm      = "washstand";
      clientSideKey       = "cabinet";
      clientSideMethod    = "structural_logic";
      clientSideConf      = "Moderate";
    }

    // TABLE FALLBACK: user guess "table" + any table-related evidence
    if (!clientSideFamily) {
      const g = (intake.user_category_guess || "").toLowerCase();
      if (g.includes("table") && anyOf("leg","top","rail","caster","apron","turned leg","stretcher")) {
        clientSideFamily    = "table";
        clientSideSubfamily = "table";
        clientSideForm      = "table";
        clientSideKey       = "table";
        clientSideMethod    = "broad_fallback";
        clientSideConf      = "Low";
      }
    }

    console.info("[NCW FS Client-Resolver]", { form: clientSideForm, method: clientSideMethod, conf: clientSideConf, mechKeys: Object.keys(mech).filter(k => mech[k].present) });



    // ── Stage 1: Form Recognition ────────────────────────────────
    // FORM FAMILY TAXONOMY:
    //   family (e.g. table) → subfamily (e.g. drop-leaf table) → specific form (e.g. gateleg drop-leaf table)
    // Client-side pre-populated form is used if LLM call fails or returns weaker result.
    let formResult = {
      form_family:          clientSideFamily    || "unknown",
      subfamily:            clientSideSubfamily || null,
      recognized_form:      clientSideForm      || null,
      recognition_method:   clientSideMethod,
      signature_used:       null,
      form_confidence:      clientSideConf,
      broad_form_key:       clientSideKey       || "cabinet",
      is_broad_category:    !clientSideForm || clientSideMethod === "broad_fallback",
      alternate_forms:      [],
      recognition_notes:    "",
    };

    try {
      const fResult = await this.callClaudeQuick(
        `You are the Form Recognition engine for the NCW Field Scan Furniture Identification Engine.

Your ONLY job: identify the furniture form using the three-level taxonomy below.
Do NOT estimate dates. Do NOT assign values. Just classify the form.

FORM TAXONOMY — always output all three levels:
Level 1 — FORM FAMILY:   table | chest | cabinet | desk | seating | stand | bed | specialized
Level 2 — SUBFAMILY:     specific mechanism or subtype family
Level 3 — SPECIFIC FORM: narrowest defensible form name

EVIDENCE FROM ${digest.photos_used_count} PHOTOS:
${JSON.stringify(digest.evidence_digest)}

STRUCTURAL MECHANISMS DETECTED:
${JSON.stringify(Object.entries(mech).filter(([,v]) => v.present).map(([k,v]) => ({mechanism:k, confidence:v.confidence, note:v.note})))}
Strongest mechanism: ${digest.strongest_mechanism || "none detected"}

CLIENT-SIDE FORM CANDIDATE (pre-computed): ${clientSideForm || "none"}
CLIENT-SIDE METHOD: ${clientSideMethod}

USER GUESS (light prior — mechanisms take priority): ${intake.user_category_guess || "none"}

TAXONOMY RULES — apply in order:

TABLE FAMILY:
• drop_leaf_hinged + gateleg_support (ANY confidence > 0)  → family:table | subfamily:drop-leaf table | form:gateleg drop-leaf table
• drop_leaf_hinged + swing_leg                             → family:table | subfamily:drop-leaf table | form:pembroke table
• drop_leaf_hinged only                                    → family:table | subfamily:drop-leaf table | form:drop-leaf table
• extension_mechanism                                      → family:table | subfamily:extension table  | form:extension dining table
• pedestal_base + tilt_top                                 → family:table | subfamily:tilt-top table   | form:tilt-top table
• tripod_base                                              → family:table | subfamily:pedestal table   | form:tripod pedestal table
• general table evidence only                              → family:table | subfamily:table            | form:table

CHEST FAMILY:
• lift_lid + till_interior  → family:chest | subfamily:blanket chest | form:blanket chest
• lift_lid only             → family:chest | subfamily:storage chest | form:storage chest or trunk

DESK FAMILY:
• cylinder_roll             → family:desk | subfamily:rolltop desk     | form:rolltop desk
• slant_front               → family:desk | subfamily:slant-front desk | form:slant-front desk
• fall_front + pigeonholes  → family:desk | subfamily:secretary desk   | form:secretary desk
• fall_front only           → family:desk | subfamily:fall-front desk  | form:fall-front desk

CABINET / CASE FAMILY:
• washstand_splash          → family:cabinet | subfamily:washstand    | form:washstand
• multiple_drawer_case (4+) → family:cabinet | subfamily:chest of drawers | form:chest of drawers
• multiple_drawer_case + mirror → family:cabinet | subfamily:dresser  | form:dresser
• door_present (tall case)  → family:cabinet | subfamily:wardrobe     | form:wardrobe

SPECIALIZED:
• pedal_cavity_structure    → family:specialized | subfamily:organ cabinet       | form:pump organ cabinet (converted)
• treadle_mount             → family:specialized | subfamily:sewing cabinet      | form:sewing machine cabinet

IMPORTANT:
• IF the client-side candidate is "gateleg drop-leaf table" — accept it unless you have strong evidence against it
• NEVER output "Undetermined" — always return the best available form at any taxonomy level
• If only form_family is determinable, return that with subfamily and specific_form as null

CONFIDENCE:
• "Very High" — multiple confirming mechanisms clearly present
• "High"      — single clear mechanism confirmed
• "Moderate"  — mechanism partially visible or family clear but subtype uncertain
• "Low"       — broad family only

BROAD_FORM_KEY — one of: chest | table | cabinet | dresser | wardrobe | desk | seating | stand | shelf | specialized

OUTPUT — all fields required:
{
  "form_family":     "table",
  "subfamily":       "drop-leaf table",
  "recognized_form": "gateleg drop-leaf table",
  "recognition_method": "mechanical_signature|structural_logic|visual_impression|broad_fallback",
  "signature_used":  "the specific mechanism that drove identification",
  "form_confidence": "Very High|High|Moderate|Low",
  "broad_form_key":  "table",
  "is_broad_category": false,
  "alternate_forms": [],
  "recognition_notes": "one sentence"
}

Respond ONLY in valid JSON. Begin with {.`,
        []
      );

      if (fResult.ok !== false && fResult.recognized_form && fResult.recognized_form !== "Undetermined") {
        // LLM returned a valid result — use it if it's at least as specific as client-side
        const llmIsSpecific = fResult.recognition_method !== "broad_fallback" || !clientSideForm;
        if (llmIsSpecific || !clientSideForm) {
          formResult = { ...formResult, ...fResult };
        } else {
          // Keep client-side result if LLM fell back but client-side found a form
          console.info("[NCW FS Stage1] Keeping client-side form over LLM broad fallback:", clientSideForm, ">", fResult.recognized_form);
          formResult.form_family  = fResult.form_family || clientSideFamily || "unknown";
          formResult.subfamily    = fResult.subfamily   || clientSideSubfamily || null;
          formResult.alternate_forms = fResult.alternate_forms || [];
          formResult.recognition_notes = fResult.recognition_notes || "";
        }
      } else {
        console.warn("[NCW FS Stage1] LLM Form Recognition failed or returned Undetermined — using client-side resolver result");
        // Keep the client-side formResult already set
      }
    } catch(e) { console.warn("[NCW FS Stage1] Error:", e.message); }

    // Final safety net — never return null form
    if (!formResult.recognized_form) {
      const g = (intake.user_category_guess || "").toLowerCase();
      formResult.recognized_form = g || digest.broad_form_guess || "furniture (form undetermined)";
      formResult.form_family     = formResult.form_family || "unknown";
      formResult.is_broad_category = true;
      formResult.form_confidence   = "Low";
    }

    so["1_form_recognition"] = formResult;
    if (typeof onPhase === "function") onPhase(1, formResult);



    // ── Stage 2: Date Estimation ─────────────────────────────────
    // Uses digest. One job: date the piece from fasteners/toolmarks/hardware.
    let dateResult = {
      primary_date_range:  "Date uncertain",
      dating_confidence:   "Low",
      key_dating_evidence: [],
      hard_negatives:      digest.hard_negatives || [],
    };
    try {
      const dResult = await this.callClaudeQuick(
        `You are the Dating Engine for the NCW Field Scan Furniture Identification Engine.
Your ONLY job: estimate the manufacture date from fastener, toolmark, and hardware evidence.

FORM IDENTIFIED: ${formResult.recognized_form}
FASTENER CLUES: ${JSON.stringify(digest.fastener_clues)}
TOOLMARK CLUES: ${JSON.stringify(digest.toolmark_clues)}
HARDWARE CLUES: ${JSON.stringify(digest.hardware_clues)}
HARD NEGATIVES: ${JSON.stringify(digest.hard_negatives)}

DATE RULES:
• hand_forged_nail → pre-1800
• cut_nail → 1790–1890
• wire_nail → post-1880
• slotted_handmade_screw → 1770–1840
• slotted_machine_screw → post-1840
• phillips_screw → post-1930 (HARD NEGATIVE)
• pit_saw_marks → pre-1830
• circular_saw_arcs → post-1830
• band_saw_lines → post-1870
• porcelain_caster → 1830–1870
• victorian_strap_hinge → 1865–1895
• batwing_brass_pull → 1720–1790

If no dating clues: return a wide band based on the identified form's known era.

OUTPUT:
{
  "primary_date_range": "e.g. 1870–1910 or wide band 1840–1920",
  "dating_confidence": "High|Moderate|Low",
  "key_dating_evidence": ["list strongest 2-4 dating clues"],
  "hard_negatives": []
}
Respond ONLY in valid JSON. Begin with {.`,
        []  // No images — uses digest only
      );
      if (dResult.ok !== false && dResult.primary_date_range) {
        dateResult = { ...dateResult, ...dResult };
      }
    } catch(e) { console.warn("[NCW FS Stage2] Date estimation error:", e.message); }
    so["2_date_estimation"] = dateResult;
    if (typeof onPhase === "function") onPhase(2, dateResult);

    // ── Stage 3: Market / Buy Guidance ───────────────────────────
    // Uses form + date only. One job: value and signal.
    let marketResult = {
      estimated_value_low:  0,
      estimated_value_high: 0,
      buy_guidance:         "Caution",
      short_reason:         "",
    };
    try {
      const mResult = await this.callClaudeQuick(
        `You are the Market Guidance engine for the NCW Field Scan Furniture Identification Engine.
Provide a realistic retail value range and buy signal for this piece.

FORM: ${formResult.recognized_form}
DATE: ${dateResult.primary_date_range}
HARD NEGATIVES: ${JSON.stringify(digest.hard_negatives)}
ASKING PRICE: ${askingPrice !== null ? "$"+askingPrice : "not provided"}

PICKER PROFILE (buyer preferences — adjust guidance accordingly):
${intake._picker_profile ? JSON.stringify(intake._picker_profile) : "not set"}

BUY SIGNAL RULES:
• "Buy"     — clear pre-1920 form, no hard negatives, good resale potential
• "Caution" — uncertain form OR mid-period OR inspection needed
• "Pass"    — hard negatives present OR likely modern reproduction
If picker profile sets deal_target="exceptional", raise the bar for "Buy" — only strong deals qualify.
If picker profile sets work_tolerance="none", downgrade pieces needing restoration to "Caution".
If picker profile sets storage_space="very_limited", penalize large forms (wardrobes, sideboards).

VALUE: Realistic USD retail range for this form in typical antique market condition.
If hard negatives present, reduce range significantly. If form is uncertain, use wide range or 0.

OUTPUT:
{
  "estimated_value_low": 0,
  "estimated_value_high": 0,
  "buy_guidance": "Buy|Caution|Pass",
  "short_reason": "one sentence"
}
Respond ONLY in valid JSON. Begin with {.`,
        []
      );
      if (mResult.ok !== false) marketResult = { ...marketResult, ...mResult };
    } catch(e) { console.warn("[NCW FS Stage3] Market guidance error:", e.message); }
    so["3_market_guidance"] = marketResult;
    if (typeof onPhase === "function") onPhase(3, marketResult);

    // ── Price comparison (client-side) ───────────────────────────
    const valLow  = Number(marketResult.estimated_value_low)  || 0;
    const valHigh = Number(marketResult.estimated_value_high) || 0;
    let priceGuidance = null;
    // Picker-aware price thresholds
    const _pp = intake._picker_profile || {};
    const _dealThreshold = {
      exceptional: 0.25, strong: 0.40, moderate: 0.50, small: 0.65,
    }[_pp.deal_target] || 0.60;
    const _workPenalty = _pp.work_tolerance === "none" ? 0.10 : 0; // shrinks "good buy" window if no restoration
    if (askingPrice !== null && valLow > 0 && valHigh > 0) {
      if      (askingPrice < valLow * (_dealThreshold + _workPenalty)) priceGuidance = "GOOD BUY";
      else if (askingPrice <= valHigh)                                 priceGuidance = "FAIR PRICE";
      else                                                             priceGuidance = "OVERPRICED";
    } else if (askingPrice !== null && (valLow === 0 && valHigh === 0)) {
      priceGuidance = "UNAVAILABLE";
    }

    // ── Broad-form fallback key ───────────────────────────────────
    const broadFormKey = formResult.broad_form_key || (() => {
      const g = (intake.user_category_guess || "").toLowerCase();
      if (g.includes("chest") || g.includes("trunk")) return "chest";
      if (g.includes("table"))  return "table";
      if (g.includes("chair") || g.includes("stool"))  return "seating";
      if (g.includes("desk"))   return "desk";
      if (g.includes("dresser") || g.includes("drawer")) return "dresser";
      if (g.includes("wardrobe")) return "wardrobe";
      return "cabinet";
    })();

    return {
      stage_outputs: so,
      quick_result: {
        // Identification — taxonomy layers
        likely_identification:  formResult.recognized_form,
        form_family:            formResult.form_family || broadFormKey,
        subfamily:              formResult.subfamily || null,
        broad_form_key:         broadFormKey,
        form_signature_used:    formResult.signature_used,
        recognition_method:     formResult.recognition_method,
        is_broad_category:      formResult.is_broad_category,
        mechanisms_detected:    Object.keys(digest.mechanisms_detected || {}).filter(k => (digest.mechanisms_detected[k] && digest.mechanisms_detected[k].present)),
        followup_photo_suggestions: [],
        // Date
        estimated_date_range:   dateResult.primary_date_range,
        // Confidence
        confidence:             formResult.form_confidence,
        // Value
        estimated_value_low:    valLow,
        estimated_value_high:   valHigh,
        buy_guidance:           marketResult.buy_guidance,
        short_reason:           marketResult.short_reason,
        asking_price:           askingPrice,
        price_guidance:         priceGuidance,
        // Evidence digest — displayed in result UI
        photos_used_count:      digest.photos_used_count,
        photo_types_included:   digest.photo_types_included,
        evidence_digest:        digest.evidence_digest || [],
        key_dating_evidence:    dateResult.key_dating_evidence || [],
        hard_negatives:         digest.hard_negatives || [],
        primary_wood:           digest.primary_wood_guess || "",
        recommend_full:         true,
      },
    };
  },



  async runAllPhases(caseData, images, intake, onPhase) {
    const so   = {};
    const skip = (reason) => ({
      ok: true, skipped: true, skip_reason: reason,
      age_support_points: 0, age_opposing_points: 0,
      originality_support_points: 0, originality_opposing_points: 0,
      form_support_points: 0, form_opposing_points: 0,
      conversion_support_points: 0, conversion_opposing_points: 0,
    });

    // ── Phase runner helper: wraps each phase in try/catch,
    //    validates the result, logs errors, and throws a structured PhaseError.
    const runPhase = async (key, label, stageName, fn) => {
      try {
        const result = await fn();
        // Debug: log raw result before assertPhase
        if (key === "1_intake") {
          console.info("[NCW P1 Debug] raw result ok:", result && result.ok,
            "| keys:", result ? Object.keys(result).join(", ") : "null");
          if (result && result.ok === false) {
            console.warn("[NCW P1 Debug] raw_response:", (result.raw_response||"").slice(0,500));
          } else {
            console.info("[NCW P1 Debug] normalized payload keys:", result ? Object.keys(result).join(", ") : "null");
            console.info("[NCW P1 Debug] evidence_inventory:", JSON.stringify(result.evidence_inventory));
            console.info("[NCW P1 Debug] phase_triggers:", JSON.stringify(result.phase_triggers));
            console.info("[NCW P1 Debug] evidence_sufficiency:", result.evidence_sufficiency);
          }
        }
        this.assertPhase(result, stageName, label);   // throws PhaseError if ok===false
        so[key] = result;
        onPhase(parseInt(key.split("_")[0]), result);
        return result;
      } catch (err) {
        // Enrich with phase metadata if not already a PhaseError
        if (!err.isPhaseError) {
          err.isPhaseError    = true;
          err.stage_name      = stageName;
          err.phase_label     = label;
          err.error_type      = err.error_type || "runtime_error";
          err.error_message   = err.message    || "Unexpected error";
          err.raw_response    = err.raw_response || "";
          err.retry_attempted = false;
        }
        console.error(`[NCW PhaseError] ${stageName}`, {
          case_id:       caseData.id,
          stage_name:    err.stage_name,
          error_type:    err.error_type,
          error_message: err.error_message,
          raw_response:  err.raw_response.slice(0, 500),
        });
        // Store partial result in stage_outputs so UI can show what ran
        so[key] = { ok: false, stage_name: stageName, error_type: err.error_type, error_message: err.error_message, raw_response: err.raw_response };
        // Re-throw as a structured payload the UI can unpack
        const payload = {
          ok:            false,
          failed_stage:  label,
          error: {
            stage_name:      err.stage_name,
            phase_label:     err.phase_label,
            error_type:      err.error_type,
            error_message:   err.error_message,
            raw_response:    err.raw_response    || "",
            retry_attempted: (err.retry_attempted != null) ? err.retry_attempted : false,
          },
        };
        const richErr = new Error(JSON.stringify(payload));
        richErr.phasePayload = payload;
        throw richErr;
      }
    };

    // Phase 0 — Visual Evidence Scanner
    // NOT routed through runPhase/assertPhase — p0 is self-tolerant and never throws.
    // If Field Scan already ran on these images, reuse its evidence cache.
    const priorEvidence = caseData._evidence_cache;
    const fullImgFingerprint = (images || []).filter(function(i){ return i.data_url; })
      .map(function(i){ return i.image_type + ":" + (i.data_url||"").length; }).join("|");
    const fullCacheHit = priorEvidence && priorEvidence.fingerprint === fullImgFingerprint
      && priorEvidence.digest && priorEvidence.digest.phase_0_status;
    let p0;
    if (fullCacheHit) {
      console.info("[NCW P0] Cache hit — reusing Field Scan evidence (no re-extraction needed)");
      p0 = priorEvidence.digest;
    } else try {
      p0 = await this.p0(images);
      so["0_visual_scan"] = p0;
      if (typeof onPhase === "function") onPhase(0, p0);
      console.info("[NCW P0] Complete. status:", p0.phase_0_status, "| obs:", p0.total_observations, "| recovery:", p0.recovery_used);
    } catch(e) {
      console.error("[NCW P0] Unexpected throw:", e.message);
      p0 = {
        skipped:false, phase_0_status:"unexpected_throw", recovery_used:false,
        total_observations:0, observations_by_type:{}, hard_negatives_detected:[],
        images_scanned: images.filter(i=>i.data_url).length,
        scan_summary:{ scan_confidence:"none" }, primary_wood_observed:"",
        secondary_wood_observed:"", broad_form_impression:"", condition_impression:"unknown",
        anomalies_noted:[], _error: e.message,
      };
      so["0_visual_scan"] = p0;
      onPhase(0, p0);
    }

    // Phase 1 — Intake Controller
    const p1 = await runPhase("1_intake", "Phase 1 — Intake Controller", "phase_1_intake",
      () => this.p1(caseData, images, intake, p0));

    // Phase 2 — Rapid Dating Grid (conditional)
    const p2 = this.triggered(p1, "run_dating_grid")
      ? await runPhase("2_dating", "Phase 2 — Rapid Dating Grid", "phase_2_dating",
          () => this.p2(caseData, images, p0, p1))
      : skip("No structural dating evidence visible");
    if (!p2.skipped) { so["2_dating"] = p2; if (typeof onPhase === "function") onPhase(2, p2); }

    // Phase 3 — Form Decision Engine (conditional)
    const p3 = this.triggered(p1, "run_form_engine")
      ? await runPhase("3_form", "Phase 3 — Form Decision Engine", "phase_3_form_decision",
          () => this.p3(caseData, images, p0, p1, p2))
      : { ...skip("No overall form visible"), current_form_candidate:"Unknown", original_form_candidate:"Unknown", is_conversion:false, conversion_probability:"Low", form_confidence:"Low", alternate_form_candidates:[] };
    if (!p3.skipped) { so["3_form"] = p3; if (typeof onPhase === "function") onPhase(3, p3); }

    // Phase 4 — Construction Analysis (conditional)
    const p4 = this.triggered(p1, "run_construction")
      ? await runPhase("4_construction", "Phase 4 — Construction Analysis", "phase_4_construction",
          () => this.p4(caseData, images, p0, p1, p2, p3))
      : skip("No construction detail visible");
    if (!p4.skipped) { so["4_construction"] = p4; if (typeof onPhase === "function") onPhase(4, p4); }

    // Phase 5 — Hardware Analysis (conditional)
    const p5 = this.triggered(p1, "run_hardware")
      ? await runPhase("5_hardware", "Phase 5 — Hardware Analysis", "phase_5_hardware",
          () => this.p5(caseData, images, p0, p1, p2, p3, p4))
      : skip("No hardware visible");
    if (!p5.skipped) { so["5_hardware"] = p5; if (typeof onPhase === "function") onPhase(5, p5); }

    // Phase 6 — Conflict Detection Engine
    const p6c = await runPhase("6_conflict", "Phase 6 — Conflict Detection Engine", "phase_6_conflict",
      () => this.p6_conflict(p0, p1, p2, p3, p4, p5));

    // Phase 7 — Reconciliation
    const p7 = await runPhase("7_reconciliation", "Phase 7 — Reconciliation", "phase_7_reconciliation",
      () => this.p7(p1, p2, p3, p4, p5, p6c));

    // Phase 8 — Valuation
    const p8 = await runPhase("8_valuation", "Phase 8 — Valuation", "phase_8_valuation",
      () => this.p8(p3, p7));

    // ── Assemble final outputs ───────────────────────────────
    const sc      = p7.scorecard || {};
    const sup     = p7.overall_supporting_points || 0;
    const opp     = p7.overall_opposing_points   || 0;
    const rawConf = opp > 0 ? (sup / (sup + opp)) * 100 : sup > 0 ? 88 : 50;
    const confPct = Math.min(100, Math.max(0, p7.confidence_percent || rawConf));
    const confBand = p7.confidence_band || WM.bandOf(confPct);

    const scores = {
      ...sc,
      overall_supporting_points:  sup,
      overall_opposing_points:    opp,
      raw_confidence_percent:     Math.round(rawConf),
      overall_confidence_percent: Math.round(confPct),
      confidence_band:            confBand,
      conflict_net_adjustment:    p6c.total_net_adjustment || 0,
    };

    const conflicts = [
      ...(p6c.conflicts_detected || []).map(c => ({
        conflict_type:       c.conflict_type,
        evidence_a:          c.trigger_evidence_a,
        evidence_b:          c.trigger_evidence_b,
        likely_explanation:  c.likely_explanation,
        severity:            c.severity,
        confidence_penalty:  c.confidence_penalty,
        confidence_recovery: c.confidence_recovery,
        net_adjustment:      c.net_adjustment,
        resolved:            c.resolved,
        resolution_narrative:c.resolution_narrative,
      })),
      ...(p7.conflicts_found || []).map(c => ({
        conflict_type:       "evidence_conflict",
        evidence_a:          c.conflict,
        likely_explanation:  c.explanation_attempted,
        confidence_penalty:  c.penalty_applied || 0,
        resolved:            c.resolved || false,
        resolution_narrative:c.recovery_applied ? `+${c.recovery_applied} pts recovered — ${c.resolution_note || ""}` : "",
      })),
    ];

    const form_assessment = {
      current_form_candidate:   p3.current_form_candidate,
      original_form_candidate:  p3.original_form_candidate,
      alternate_form_candidates:p3.alternate_form_candidates || [],
      conversion_probability:   p3.conversion_probability,
      form_confidence:          p3.form_confidence,
      object_classification:    p7.object_classification || p6c.object_classification_suggested || "unknown",
    };

    const valuations = (p8.valuations || []).map(v => ({
      market_lane:    v.market_lane,
      low_estimate:   v.low,
      high_estimate:  v.high,
      currency:       "USD",
      rationale:      v.rationale,
      confidence_band:confBand,
    }));

    const identName = p3.is_conversion
      ? `${p3.original_form_candidate} converted to ${p3.current_form_candidate}`
      : (p3.current_form_candidate || "Form undetermined");

    const final_report = {
      identified_object_name:     identName,
      original_form_text:         p3.original_form_candidate,
      current_form_text:          p3.current_form_candidate,
      object_classification:      p7.object_classification || p6c.object_classification_suggested || "unknown",
      date_range_text:            p7.reconciled_date_range || p2.primary_date_range || "Undetermined",
      style_family:               p7.reconciled_style_family,
      confidence_text:            `${confBand} (${Math.round(confPct)}%)`,
      supporting_evidence:        p7.supporting_evidence || [],
      alterations:                p7.alterations || [],
      summary_text:               p7.reconciliation_notes || "",
      conflict_interpretation:    p6c.conflict_interpretation_for_report || "",
      conflicts_detected:         p6c.conflicts_detected || [],
      valuations,
      value_drivers:              p8.value_drivers || [],
      value_detractors:           p8.value_detractors || [],
      market_notes:               p8.market_notes || "",
      valuation_skipped:          p8.valuation_skipped || false,
      valuation_provisional:      p8.provisional || false,
      value_adjustments:          p8.value_adjustments_applied || [],
    };

    return { stage_outputs: so, conflicts, scores, form_assessment, valuations, final_report };
  },

  // ── Observation digest builder ────────────────────────────
  // Compact structured summary of Phase 0 observations,
  // injected into every downstream phase prompt.
  _buildObsDigest(caseId, p0) {
    const observations = API.getObservations(caseId);
    if (!observations.length) return { empty: true, summary: "No visual observations recorded." };

    const grouped = {};
    for (const obs of observations) {
      if (!grouped[obs.observation_type]) grouped[obs.observation_type] = [];
      grouped[obs.observation_type].push({
        clue:                obs.reference_id,
        observed:            obs.observed_value_text,
        raw_confidence:      obs.raw_confidence,
        weight_multiplier:   obs.weight_multiplier,
        effective_confidence:obs.effective_confidence,
        is_hidden_surface:   obs.is_hidden_surface,
        region:              obs.region_label,
        human_reviewed:      obs.human_reviewed,
      });
    }
    for (const t of Object.keys(grouped)) {
      grouped[t].sort((a, b) => b.effective_confidence - a.effective_confidence);
    }
    const hard_negatives = p0.hard_negatives_detected || [];
    return {
      empty:            false,
      total:            observations.length,
      by_type:          grouped,
      hard_negatives,
      summary: `Phase 0 found ${observations.length} visual observations across ${Object.keys(grouped).length} evidence types.${hard_negatives.length ? ` ⚠ ${hard_negatives.length} hard negative(s) detected.` : ""}`,
    };
  },
};

// ============================================================
// UI CONSTANTS
// ============================================================
// Core photo slots — one upload per slot
// ── Photo coaching examples ───────────────────────────────────
// Each entry has an SVG illustration (drawn inline, no external
// assets) and bullet-point guidance describing what makes it good.
// Keyed to slot.key or group.key.
