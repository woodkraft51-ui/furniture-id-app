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

export function buildAuthoredMakers(csvText: string): MakerMarkEntry[] {
  const rows = parseCsv(csvText);
  return rows.map((row, idx) => {
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
  });
}

function writeArtifact() {
  const entries = buildAuthoredMakers(fs.readFileSync(CSV_PATH, "utf8"));
  const banner =
    "// AUTO-GENERATED from content/makers.csv by scripts/generateAuthoredMakers.ts — DO NOT EDIT BY HAND.\n" +
    "// Edit content/makers.csv (a spreadsheet) and regenerate:\n" +
    "//   node --import tsx scripts/generateAuthoredMakers.ts\n\n" +
    'import type { MakerMarkEntry } from "./makerMarks";\n\n';
  const body = `export const AUTHORED_MAKER_ENTRIES: MakerMarkEntry[] = ${JSON.stringify(entries, null, 2)};\n`;
  fs.writeFileSync(OUT_PATH, banner + body);
  console.log(`wrote ${OUT_PATH} — ${entries.length} authored maker(s): ${entries.map((e) => e.maker_name).join(", ")}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) writeArtifact();
