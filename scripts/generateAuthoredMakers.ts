/**
 * Authored-maker generator. Lets a NON-CODER author makers in content/makers.csv
 * (a spreadsheet) and compiles them into lib/constraints/makersAuthored.generated.ts
 * as MakerMarkEntry[] that the engine matches and dates — no TypeScript required.
 *
 * Run:  node --import tsx scripts/generateAuthoredMakers.ts
 *
 * The validator throws a plain-language error (row number + what's wrong) so a
 * mistake in the sheet is obvious. Role-nuance matches the engine's maker dating:
 * a firm still in business (no "closed" year) becomes a FLOOR ("post-<founded>");
 * a defunct firm becomes a bounded range ("<founded>–<closed>").
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { MakerMarkEntry } from "../lib/constraints/makerMarks";
import { MAKER_ENTRIES } from "../lib/constraints/makerMarks";
import type { PeriodAssociation } from "../lib/constraints/entryShape";

const REPO = path.resolve(fileURLToPath(import.meta.url), "../..");
const CSV_PATH = path.join(REPO, "content/makers.csv");
const OUT_PATH = path.join(REPO, "lib/constraints/makersAuthored.generated.ts");

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith("#"));
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: Record<string, string> = {};
    header.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
    return row;
  });
}

const splitList = (v: string) => (v || "").split(";").map((s) => s.trim()).filter(Boolean);
const parseYear = (v: string): number | null => {
  const m = (v || "").trim().match(/^(1[6-9]\d\d|20\d\d)$/);
  return m ? parseInt(m[1], 10) : null;
};
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

// Collision detection: is this maker already in the canonical library? Compare
// by NAME CORE (drop generic corporate words; keep the distinguishing brand
// tokens) so "Baker Furniture Co." matches canonical "Baker" but "Stickley
// Brothers" does NOT collapse into "Gustav Stickley". Avoids duplicate matchers.
const NAME_STOP = new Set([
  "co", "company", "mfg", "manufacturing", "inc", "corp", "corporation",
  "industries", "furniture", "works", "cabinet", "cabinets", "tables", "table", "the", "and",
]);
const coreTokens = (name: string): Set<string> =>
  new Set(name.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((t) => t && !NAME_STOP.has(t)));
// A single shared token is too weak to claim "already covered": "Vaughan-Bassett"
// must NOT collapse into canonical "Bassett", nor "Lane Venture" into "Lane".
// So a size-1 core only collides on an EXACT set match; otherwise the smaller
// core must have ≥2 tokens AND be fully contained in the larger.
const subsetOrEqual = (a: Set<string>, b: Set<string>) => {
  if (a.size === 0 || b.size === 0) return false;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  if (small.size < 2 && small.size !== large.size) return false;
  return [...small].every((t) => large.has(t));
};
function canonicalMatchFor(makerName: string): string | null {
  const a = coreTokens(makerName);
  for (const e of MAKER_ENTRIES) {
    if (subsetOrEqual(a, coreTokens(String((e as any).maker_name || "")))) return String((e as any).maker_name);
  }
  return null;
}

function rowToEntry(row: Record<string, string>, idx: number): MakerMarkEntry {
  const where = `makers.csv row ${idx + 1}`;
    const name = (row.maker_name || "").trim();
    if (!name) throw new Error(`${where}: maker_name is required.`);
    const founded = parseYear(row.founded);
    if (founded == null) throw new Error(`${where} ("${name}"): 'founded' must be a 4-digit year (got "${row.founded}").`);
    let closed: number | null = null;
    if ((row.closed || "").trim()) {
      closed = parseYear(row.closed);
      if (closed == null) throw new Error(`${where} ("${name}"): 'closed' must be a 4-digit year or blank (got "${row.closed}").`);
      if (closed < founded) throw new Error(`${where} ("${name}"): 'closed' (${closed}) cannot be before 'founded' (${founded}).`);
    }
    const wording = splitList(row.mark_wording);
    if (wording.length === 0) throw new Error(`${where} ("${name}"): 'mark_wording' is required — the words on the label, separated by ;`);
    const categories = splitList(row.furniture_categories);

    const period: PeriodAssociation =
      closed != null
        ? { period_label: `${name} production era`, date_floor: founded, date_ceiling: closed }
        : { period_label: `${name} production era`, date_floor: founded };

    const entry: MakerMarkEntry = {
      id: `maker_mark_authored_${slug(name)}`,
      category: "maker_mark",
      positive_authority: 7,
      hard_negative_authority: 7,
      migration_status: "complete",
      notes: row.notes || "Authored via content/makers.csv.",
      maker_name: name,
      region: row.region || "Unspecified",
      furniture_categories: categories.length ? categories : ["furniture"],
      known_mark_types: ["paper_label"],
      common_mark_locations: [{ physical_location: "underside" }],
      known_wording: wording,
      visual_traits: row.notes || "",
      mark_text_patterns: wording.map((w) => w.toLowerCase()),
      period_associations: [period],
      dating_clues: "",
      false_positive_warnings: [],
      attribution_confidence_rule: "Require a clear maker label or branded mark on the piece.",
      related_names: [],
    };
    return entry;
}

export function partitionAuthoredMakers(csvText: string): {
  added: MakerMarkEntry[];
  skipped: { maker_name: string; matched: string }[];
} {
  const rows = parseCsv(csvText);
  const added: MakerMarkEntry[] = [];
  const skipped: { maker_name: string; matched: string }[] = [];
  rows.forEach((row, idx) => {
    const entry = rowToEntry(row, idx); // validates + builds (throws on bad input)
    const match = canonicalMatchFor(entry.maker_name);
    if (match) skipped.push({ maker_name: entry.maker_name, matched: match });
    else added.push(entry);
  });
  return { added, skipped };
}

// Only NEW makers (not already in the canonical library) become authored entries.
export function buildAuthoredMakers(csvText: string): MakerMarkEntry[] {
  return partitionAuthoredMakers(csvText).added;
}

function writeArtifact() {
  const csv = fs.readFileSync(CSV_PATH, "utf8");
  const { added, skipped } = partitionAuthoredMakers(csv);
  const entries = added;
  const banner =
    "// AUTO-GENERATED from content/makers.csv by scripts/generateAuthoredMakers.ts — DO NOT EDIT BY HAND.\n" +
    "// Edit content/makers.csv (a spreadsheet) and regenerate:\n" +
    "//   node --import tsx scripts/generateAuthoredMakers.ts\n\n" +
    'import type { MakerMarkEntry } from "./makerMarks";\n\n';
  const body = `export const AUTHORED_MAKER_ENTRIES: MakerMarkEntry[] = ${JSON.stringify(entries, null, 2)};\n`;
  fs.writeFileSync(OUT_PATH, banner + body);
  console.log(`wrote ${OUT_PATH}`);
  console.log(`ADDED ${added.length} new maker(s): ${added.map((e) => e.maker_name).join(", ") || "(none)"}`);
  console.log(`SKIPPED ${skipped.length} already in the canonical library:`);
  for (const s of skipped) console.log(`  • ${s.maker_name}  →  already covered by "${s.matched}"`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) writeArtifact();
