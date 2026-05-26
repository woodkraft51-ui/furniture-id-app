/**
 * Trace → fixture ingester (dev tool — not app code).
 *
 *   node --import tsx scripts/_ingestScan.ts <trace-file> <label>
 *
 * Parses a pasted Engine Trace and emits a ScanFixture literal for
 * tests/fixtures/sessionScans.ts — verbatim observations (no hand-transcription)
 * plus a seeded `asSeen` from the structured P2/P3 sections. Output is a
 * STARTING POINT: review it, add note/rawText/negated as needed, then run the
 * corpus harness to confirm it reproduces the scan before committing.
 *
 * Extraction is faithful to what the harness reads:
 *   - observations: the "Observations (N):" block ([type] clue (conf N) + desc)
 *   - asSeen.dateRange/floor/ceiling/confidence: the "Frame …" (P2) lines
 *   - asSeen.formId: the form NAME from "Best fit: form_x (Name)" (matches p3.form)
 *   - asSeen.finalStyleKind: the reconciliation "kind"
 */
import fs from "node:fs";

const tracePath = process.argv[2];
const label = process.argv[3];
if (!tracePath || !label) {
  console.error('usage: node --import tsx scripts/_ingestScan.ts <trace-file> <label>');
  process.exit(1);
}
const raw = fs.readFileSync(tracePath, "utf8");

// ── Observations block ──────────────────────────────────────────────────────
const obsStart = raw.search(/Observations\s*\(\d+\):/);
let obsEnd = raw.length;
for (const m of ["P0 vocab snapping", "Frame / Upholstery", "Frame/Upholstery"]) {
  const i = raw.indexOf(m, obsStart >= 0 ? obsStart : 0);
  if (i >= 0 && i < obsEnd) obsEnd = i;
}
const obsBlock = obsStart >= 0 ? raw.slice(obsStart, obsEnd) : "";

type Obs = { type: string; clue: string; confidence: number; description: string };
const obs: Obs[] = [];
let cur: Obs | null = null;
const headerRe = /^\[([a-z_]+)\]\s+(.*?)\s*\(conf\s+(\d+)\)\s*$/i;
for (const line of obsBlock.split(/\r?\n/)) {
  const m = line.match(headerRe);
  if (m) {
    if (cur) obs.push(cur);
    const clueRaw = m[2].trim();
    cur = { type: m[1], clue: clueRaw === "(no clue key)" ? "" : clueRaw, confidence: parseInt(m[3], 10), description: "" };
  } else if (cur) {
    const t = line.trim();
    if (t) cur.description += (cur.description ? " " : "") + t;
  }
}
if (cur) obs.push(cur);

// ── asSeen (from structured P2/P3) ──────────────────────────────────────────
const grab = (re: RegExp) => { const m = raw.match(re); return m ? m[1].trim() : undefined; };
const dateRange = grab(/Frame range:\s*(.+)/);
const floor = grab(/Frame date_floor:\s*(\d+)/);
const ceil = grab(/Frame date_ceiling:\s*(\d+)/);
const conf = grab(/Frame confidence:\s*(\w+)/);
const display = grab(/Display:\s*(.+)/);
const bf = raw.match(/Best fit:\s*\S+\s*\((.+)\)\s*$/m); // greedy: handles nested parens, e.g. "Commode (close stool)"
const formId = bf ? bf[1].trim() : undefined;
const kind = grab(/"kind"\s*:\s*"(\w+)"/);

// ── emit ────────────────────────────────────────────────────────────────────
const J = (s?: string) => JSON.stringify(s);
let out = `const ${label}: ScanFixture = {\n`;
out += `  label: ${J(label)},\n`;
out += `  note: "TODO — describe what this scan tests",\n`;
out += `  perception: minimalPerception,\n`;
out += `  intake: { analysis_mode: "full_analysis" },\n`;
out += `  observations: [\n`;
for (const o of obs) {
  out += `    { type: ${J(o.type)}, clue: ${J(o.clue)}, confidence: ${o.confidence}, description: ${J(o.description)} },\n`;
}
out += `  ],\n  asSeen: {\n`;
if (formId) out += `    formId: ${J(formId)},\n`;
if (display) out += `    display: ${J(display)},\n`;
if (kind) out += `    finalStyleKind: ${J(kind)},\n`;
if (dateRange) out += `    dateRange: ${J(dateRange)},\n`;
out += `    dateFloor: ${floor ?? "null"},\n`;
out += `    dateCeiling: ${ceil ?? "null"},\n`;
if (conf) out += `    confidence: ${J(conf)},\n`;
out += `  },\n};\n`;

if (process.argv.includes("--append")) {
  const F = "tests/fixtures/sessionScans.ts";
  let s = fs.readFileSync(F, "utf8");
  const marker = "export const SESSION_SCANS: ScanFixture[] = [";
  const idx = s.indexOf(marker);
  if (idx < 0) { console.error(`[ingest] could not find SESSION_SCANS in ${F}`); process.exit(1); }
  s = s.slice(0, idx) + out + "\n" + s.slice(idx);
  s = s.replace(/(export const SESSION_SCANS: ScanFixture\[\] = \[[^\]]*)\]/, `$1, ${label}]`);
  fs.writeFileSync(F, s);
  console.error(`[ingest] appended ${label} to ${F} (${obs.length} obs, ${obs.filter((o) => !o.clue).length} keyless). REVIEW the note, then run the harness to confirm it reproduces.`);
} else {
  console.log(out);
  console.error(`[ingest] ${obs.length} observations (${obs.filter((o) => !o.clue).length} keyless) · register ${label} in SESSION_SCANS (or re-run with --append)`);
}
