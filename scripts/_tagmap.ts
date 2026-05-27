import { SESSION_SCANS } from "../tests/fixtures/sessionScans";

const uniq = (re: RegExp, s: string) =>
  Array.from(new Set(s.match(re) || [])).sort();

const mCount: Record<string, string[]> = {};
const hCount: Record<string, string[]> = {};

for (const s of SESSION_SCANS as any[]) {
  const n = s.note || "";
  const M = uniq(/\bM[0-9]+[a-z-]*/g, n);
  const T = uniq(/\bT[0-9][a-z]/g, n);
  const H = uniq(/#[0-9]+[a-z-]*/g, n);
  console.log(s.label);
  console.log(`   M:[${M.join(",")}]  T:[${T.join(",")}]  #:[${H.join(",")}]`);
  for (const m of M) (mCount[m] ??= []).push(s.label);
  for (const h of H) (hCount[h] ??= []).push(s.label);
}

console.log("\n=== mechanism → fixtures ===");
for (const [m, fx] of Object.entries(mCount).sort((a, b) => b[1].length - a[1].length))
  console.log(`${m} (${fx.length}): ${fx.join(", ")}`);
