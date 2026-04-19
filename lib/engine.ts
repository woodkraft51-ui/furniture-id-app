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

type Observation = {
  type: string;
  description: string;
  confidence: number;
};

function cleanClaudeJSON(raw: string): any | null {
  if (!raw) return null;

  let cleaned = String(raw)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  if (firstBrace !== -1) {
    cleaned = cleaned.slice(firstBrace);
  }

  const lastBrace = cleaned.lastIndexOf("}");
  if (lastBrace !== -1) {
    cleaned = cleaned.slice(0, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[NCW] cleanClaudeJSON failed. cleaned preview:", cleaned.slice(0, 500));
    return null;
  }
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

function normalizeObservationsFromParsed(parsed: any): Observation[] {
  if (!parsed || typeof parsed !== "object") return [];

  const direct = Array.isArray(parsed.observations) ? parsed.observations : [];
  if (direct.length) {
    return direct.map((o: any) => ({
      type: typeof o?.type === "string" ? o.type : "unknown",
      description:
        typeof o?.description === "string"
          ? o.description
          : typeof o?.observed_value_text === "string"
          ? o.observed_value_text
          : "unknown",
      confidence:
        typeof o?.confidence === "number"
          ? o.confidence
          : typeof o?.raw_confidence === "number"
          ? Math.round(o.raw_confidence * 100)
          : 40,
    }));
  }

  const snippets = collectTextSnippets(parsed);
  const textDump = snippets.join(" | ").toLowerCase();

  const observations: Observation[] = [];

  const pushUnique = (type: string, description: string, confidence: number) => {
    const exists = observations.some(
      (o) => o.type === type && o.description.toLowerCase() === description.toLowerCase()
    );
    if (!exists) observations.push({ type, description, confidence });
  };

  if (textDump.includes("drop-leaf") || textDump.includes("drop leaf")) {
    pushUnique("form", "drop-leaf table", 95);
  }

  if (textDump.includes("dining table")) {
    pushUnique("form", "dining table", 80);
  }

  if (textDump.includes("rule joint") || textDump.includes("rule-joint")) {
    pushUnique("mechanism", "rule-joint leaf edge", 90);
  }

  if (textDump.includes("gate-leg") || textDump.includes("gate leg")) {
    pushUnique("mechanism", "gate-leg support", 90);
  }

  if (textDump.includes("hinge") || textDump.includes("hinged")) {
    pushUnique("mechanism", "hinged leaves", 85);
  }

  if (textDump.includes("leaf") || textDump.includes("leaves")) {
    pushUnique("structure", "side leaves present", 75);
  }

  if (textDump.includes("both leaves") || textDump.includes("two drop leaves")) {
    pushUnique("structure", "two side leaves", 85);
  }

  if (textDump.includes("raised") || textDump.includes("extended")) {
    pushUnique("configuration", "leaves shown raised or extended", 70);
  }

  if (textDump.includes("turned")) {
    pushUnique("leg", "turned legs", 70);
  }

  if (textDump.includes("reeded") || textDump.includes("fluted")) {
    pushUnique("leg", "reeded or fluted legs", 70);
  }

  if (textDump.includes("caster") || textDump.includes("casters")) {
    pushUnique("hardware", "casters present", 75);
  }

  if (!observations.length && textDump.includes("table")) {
    pushUnique("form", "table", 55);
  }

  return observations;
}

export const PE: {
  callClaude: (system: string, content: any[]) => Promise<any>;
  imgs: (images: any[]) => any[];
  p0: (caseData: any, images: any[], intake: any, onPhase?: any) => Promise<any>;
  p2: (observations: any[]) => any;
  detectFormFromObservations: (observations: any[]) => any;
  p3: (observations: any[], p0: any) => any;
  runAllPhases: (caseData: any, images: any[], intake: any, onPhase?: any) => Promise<any>;
} = {
  async callClaude(system: string, content: any[]) {
  if (FULL_ANALYSIS_MODE === "mock") {
    return { ok: false, error_type: "mock_mode", error_message: "mock_mode" };
  }

  try {
    console.info("[NCW callClaude] engine_mode=LIVE api_call_attempted=true target=api.anthropic.com/v1/messages");
    console.info("[NCW callClaude] fetch_starting=true model=claude-sonnet-4-6 proxy_auth=platform_injected");

    const payload = {
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      system,
      messages: [{ role: "user", content }],
    };

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    console.info("[NCW callClaude] fetch_resolved=true status=" + res.status);

    const contentType = res.headers.get("content-type") || "";
    const bodyText = await res.text();

    if (!res.ok) {
      let errorType = "http_error";
      if (res.status === 413) errorType = "http_413_payload_too_large";
      else if (res.status === 401 || res.status === 403) errorType = "auth_error";
      else if (res.status >= 500) errorType = "server_error";

      console.warn(
        "[NCW callClaude] non-200 response:",
        res.status,
        "| content-type:",
        contentType,
        "| raw_preview:",
        bodyText.slice(0, 300)
      );

      return {
        ok: false,
        error_type: errorType,
        error_message: `HTTP ${res.status}`,
        raw_response: bodyText || "",
        retry_attempted: false,
        http_status: res.status,
      };
    }

    let data: any = null;

    try {
      data = contentType.includes("application/json") ? JSON.parse(bodyText) : null;
    } catch (parseErr: any) {
      console.error("[NCW callClaude] response JSON parse failed:", parseErr?.message || "unknown_parse_error");
      return {
        ok: false,
        error_type: "invalid_json_response",
        error_message: parseErr?.message || "invalid_json_response",
        raw_response: bodyText || "",
        retry_attempted: false,
      };
    }

    console.info(
      "[NCW callClaude] api_http_status=200 response_keys=" +
        Object.keys(data || {}).join(",")
    );

    const raw = Array.isArray(data?.content)
      ? data.content.map((b: any) => b?.text || "").join("\n")
      : "";

    console.info(
      "[NCW callClaude] raw_llm_response_length=" +
        raw.length +
        " fallback_triggered=false"
    );

    if (!raw.trim()) {
      return {
        ok: false,
        error_type: "empty_response",
        error_message: "empty_response",
        raw_response: "",
        retry_attempted: false,
      };
    }

    const parsed = cleanClaudeJSON(raw);

    if (!parsed) {
      return {
        ok: false,
        error_type: "no_json",
        error_message: "no_json",
        raw_response: raw,
        retry_attempted: false,
      };
    }

    return {
      ok: true,
      parsed,
      raw_response: raw,
      http_status: 200,
    };
  } catch (e: any) {
    console.warn(
      "[NCW callClaude] fetch_resolved=false — request blocked before response. Likely cause: sandbox network policy blocks outbound fetch to api.anthropic.com from this artifact origin."
    );
    console.error("[NCW callClaude] error=" + (e?.message || "unknown_error"));

    return {
      ok: false,
      error_type: "fetch_failed",
      error_message: e?.message || "unknown_error",
      raw_response: "",
      retry_attempted: false,
    };
  }
},
  imgs(images: any[]) {
    const out: any[] = [];

    for (const img of images) {
      if (!img?.data_url) continue;

      const [head, base] = img.data_url.split(",");
      const type = head?.match(/data:(.*?);/)?.[1] || "image/jpeg";

      out.push({
        type: "image",
        source: { type: "base64", media_type: type, data: base },
      });

      out.push({
        type: "text",
        text: `[Image: ${img.image_type}]`,
      });
    }

    return out;
  },

  async p0(caseData: any, images: any[], intake: any, onPhase?: any) {
    const count = images.filter((i: any) => !!i?.data_url).length;

    if (count === 0) {
      const res = {
        ok: true,
        observations: [],
        note: "No images",
      };
      onPhase?.("p0", res);
      return res;
    }

    const system = `
You are an evidence extraction system.

Rules:
- Only report what is directly visible.
- Do not guess beyond the visible evidence.
- If unsure, include the clue with lower confidence.
- Return JSON only.
- If the object has a specific mechanism or form, state it plainly.

Preferred return shape:
{
  "observations": [
    {
      "type": "...",
      "description": "...",
      "confidence": 0-100
    }
  ]
}

Alternative structured JSON is acceptable if it is still valid JSON.
`;

    const result = await this.callClaude(system, [
      ...this.imgs(images),
      { type: "text", text: intake?.notes || "" },
    ]);

    if (!result.ok) {
      const fallback = {
        ok: true,
        observations: [],
        note: "LLM failed — no evidence extracted",
      };
      onPhase?.("p0", fallback);
      return fallback;
    }

    const observations = normalizeObservationsFromParsed(result.parsed);

    console.log("P0 RAW RESULT:", result.raw);
    console.log("P0 PARSED:", result.parsed);
    console.log("P0 OBS:", observations);

    for (const o of observations) {
      API.addObservation(caseData.id, {
        observation_type: o.type || "unknown",
        observed_value_text: o.description,
        raw_confidence: (o.confidence || 40) / 100,
        weight_multiplier: 1,
        recovered: false,
      });
    }

    const res = {
      ok: true,
      observations,
      broad_form:
        observations.find((o) => o.type === "form")?.description || "Unknown",
    };

    onPhase?.("p0", res);
    return res;
  },

  p2(observations: any[]) {
    if (!observations.length) {
      return {
        range: "Unknown",
        confidence: "Inconclusive",
      };
    }

    const text = observations
      .map((o: any) => String(o?.observed_value_text || o?.description || "").toLowerCase())
      .join(" ");

    if (
      text.includes("casters") ||
      text.includes("turned legs") ||
      text.includes("reeded") ||
      text.includes("fluted")
    ) {
      return {
        range: "1880–1930",
        confidence: "Low",
      };
    }

    return {
      range: "1800–1950",
      confidence: "Low",
    };
  },

  detectFormFromObservations(observations: any[]) {
    const text = observations
      .map((o: any) => String(o?.observed_value_text || o?.description || "").toLowerCase())
      .join(" ");

    const score = {
      drop_leaf: 0,
    };

    if (text.includes("drop-leaf") || text.includes("drop leaf")) score.drop_leaf += 5;
    if (text.includes("gate-leg") || text.includes("gate leg")) score.drop_leaf += 4;
    if (text.includes("rule joint") || text.includes("rule-joint")) score.drop_leaf += 3;
    if (text.includes("hinge") || text.includes("hinged")) score.drop_leaf += 3;
    if (text.includes("leaf") || text.includes("leaves")) score.drop_leaf += 2;
    if (text.includes("fold") || text.includes("drop")) score.drop_leaf += 2;
    if (text.includes("extend") || text.includes("extended")) score.drop_leaf += 1;
    if (text.includes("both leaves") || text.includes("two side leaves")) score.drop_leaf += 2;
    if (text.includes("raised")) score.drop_leaf += 1;
    if (text.includes("symmetrical")) score.drop_leaf += 1;

    if (score.drop_leaf >= 5) {
      return {
        form: "Drop-leaf table",
        confidence: "Moderate",
      };
    }

    if (score.drop_leaf >= 3) {
      return {
        form: "Drop-leaf table",
        confidence: "Low",
      };
    }

    if (text.includes("table")) {
      return {
        form: "Table",
        confidence: "Low",
      };
    }

    return null;
  },

  p3(observations: any[], p0: any) {
    if (!observations.length) {
      return {
        form: "Unknown",
        confidence: "Inconclusive",
      };
    }

    const detected = this.detectFormFromObservations(observations);

    if (detected) {
      return detected;
    }

    return {
      form: p0?.broad_form || "Unknown",
      confidence: "Low",
    };
  },

  async runAllPhases(caseData: any, images: any[], intake: any, onPhase?: any) {
    const stage_outputs: any = {};

    const p0 = await this.p0(caseData, images, intake, onPhase);
    stage_outputs.p0 = p0;

    const obs = API.getObservations(caseData.id);

    const p2 = this.p2(obs);
    stage_outputs.p2 = p2;

    const p3 = this.p3(obs, p0);
    stage_outputs.p3 = p3;

    return {
      stage_outputs,
      final_report: `Evidence-based result: ${p3.form}. Confidence remains limited by available detail.`,
    };
  },
};
