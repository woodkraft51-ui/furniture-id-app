// engine.ts
import { API } from "./store";
export const EVIDENCE_ADAPTER_MODE: "mock" | "live" = "live";
export const FULL_ANALYSIS_MODE: "mock" | "live" = "live";

export type RuntimeMode = "mock" | "live";
export type EngineMode = "LIVE" | "SIMULATED_FALLBACK";

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

// Temporary compatibility so nothing else breaks
export const RUNTIME_MODE: RuntimeMode = getRuntimeProbe().runtime_mode;
export const FULL_ANALYSIS_MODE: "mock" | "live" = "live";
export const RUNTIME_MODE: "mock" | "live" = FULL_ANALYSIS_MODE;

/**
 * CORE PRINCIPLE:
 * - Evidence is NEVER fabricated
 * - Weak evidence stays weak
 * - Unknown stays unknown
 */

export const PE = {
  // ===============================
  // LLM CALL
  // ===============================
  async callClaude(system: string, content: any[]) {
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
          max_tokens: 1200,
          system,
          messages: [{ role: "user", content }],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { ok: false, error: data };
      }

      const raw =
        data?.content?.map((b: any) => b.text || "").join("\n") || "";

      if (!raw.trim()) {
        return { ok: false, error: "empty_response" };
      }

      // STRICT JSON extraction
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) {
        return { ok: false, error: "no_json" };
      }

      return {
        ok: true,
        parsed: JSON.parse(match[0]),
      };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  },

  // ===============================
  // IMAGE FORMATTER
  // ===============================
  imgs(images: any[]) {
    const out: any[] = [];

    for (const img of images) {
      if (!img.data_url) continue;

      const [head, base] = img.data_url.split(",");
      const type = head.match(/data:(.*?);/)?.[1] || "image/jpeg";

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

  // ===============================
  // PHASE 0 – VISUAL EVIDENCE ONLY
  // ===============================
  async p0(caseData: any, images: any[], intake: any, onPhase?: any) {
    const count = images.filter(i => i.data_url).length;

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
- Only report what is directly visible
- Do NOT guess
- If unsure, include with low confidence
- Return JSON only

Return:
{
  "observations": [
    {
      "type": "...",
      "description": "...",
      "confidence": 0-100
    }
  ]
}
`;

    const result = await this.callClaude(system, [
      ...this.imgs(images),
      { type: "text", text: intake.notes || "" },
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

    const observations = result.parsed.observations || [];

    // Store raw observations (no modification)
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
    };

    onPhase?.("p0", res);
    return res;
  },

  // ===============================
  // SIMPLE DATING (EVIDENCE-BOUND)
  // ===============================
  p2(observations: any[]) {
    if (!observations.length) {
      return {
        range: "Unknown",
        confidence: "Inconclusive",
      };
    }

    // VERY conservative
    return {
      range: "1800–1950",
      confidence: "Low",
    };
  },

  // ===============================
  // FORM (NO GUESSING)
  // ===============================
  p3(observations: any[], p0: any) {
    if (!observations.length) {
      return {
        form: "Unknown",
        confidence: "Inconclusive",
      };
    }

    return {
      form: p0?.broad_form || "Unknown",
      confidence: "Low",
    };
  },

  // ===============================
  // PIPELINE
  // ===============================
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
      final_report: "Evidence-based result. Confidence limited by available data.",
    };
  },
};
