import { runEngine } from "./engine";

export type FieldScanResult = {
  identification: string;
  secondary: string | null;
  confidence: string;
  recommendation: "BUY_NOW" | "BUY" | "CONSIDER" | "PASS";
  valueRange: string;
  reasoning: string[];
};


// ==============================
// 🧠 VALUE ESTIMATION (SIMPLE + EFFECTIVE)
// ==============================

function estimateValue(form: string): { low: number; high: number } {
  if (form.includes("Telephone Bench")) return { low: 100, high: 500 };
  if (form.includes("Cedar Chest")) return { low: 75, high: 350 };
  if (form.includes("Iron Bed")) return { low: 50, high: 250 };
  if (form.includes("Armchair")) return { low: 40, high: 250 };
  if (form.includes("Jacobean")) return { low: 150, high: 650 };
  if (form.includes("Pedestal")) return { low: 40, high: 200 };
  if (form.includes("Armoire")) return { low: 75, high: 450 };
  if (form.includes("Cabinet")) return { low: 50, high: 400 };
  if (form.includes("Chest of Drawers")) return { low: 75, high: 350 };

  return { low: 25, high: 250 };
}


// ==============================
// 💰 RECOMMENDATION ENGINE
// ==============================

function getRecommendation(
  value: { low: number; high: number },
  askingPrice?: number
): FieldScanResult["recommendation"] {

  if (!askingPrice) return "CONSIDER";

  const midpoint = (value.low + value.high) / 2;
  const margin = midpoint - askingPrice;

  if (margin > 150) return "BUY_NOW";
  if (margin > 50) return "BUY";
  if (margin > 0) return "CONSIDER";

  return "PASS";
}


// ==============================
// 🚀 MAIN FIELD SCAN
// ==============================

export function runFieldScan(
  observations: any[],
  askingPrice?: number
): FieldScanResult {

  // 🔎 Step 1: Identify using engine
  const result = runEngine(observations);

  // 💰 Step 2: Value estimation
  const value = estimateValue(result.primary);

  // 🧠 Step 3: Recommendation
  const recommendation = getRecommendation(value, askingPrice);

  // 🧾 Step 4: Build output
  return {
    identification: result.primary,
    secondary: result.secondary,
    confidence: result.confidence,
    recommendation,
    valueRange: `$${value.low} - $${value.high}`,
    reasoning: result.reasoning
  };
}
