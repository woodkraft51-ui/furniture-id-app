/**
 * Stage 1 / Component A — canonical vocabulary generator.
 *
 * Harvests a single categorized canonical vocabulary from EXISTING architecture
 * (no hand-invented terms) and writes lib/constraints/canonicalVocabulary.generated.ts.
 * Zero engine behavior change — this only produces a data artifact + reports.
 *
 * Sources (per the architecture-first directive):
 *   - CLUE_LIBRARY (engine.ts)        → categorized evidence vocabulary + disqualifying keys
 *   - prompt "Preferred … keys" lists → reconcile against CLUE_LIBRARY (surface prompt-only keys)
 *   - scoreForms routing keys (mined) → coverage check (router must not be starved)
 *   - FORMS (forms.ts)                → forms vocab (ids, aliases, family/spatial, dating, dims)
 *   - FORMS[].subtypes                → subforms vocab (ids, parent, name)
 *   - FAMILIES / SPATIAL_BEHAVIORS    → relationship metadata
 *   - deep taxonomy libs              → build-time CROSSWALK (clue key → taxonomy entry) + gaps
 *
 * Run:  node --import tsx scripts/generateCanonicalVocabulary.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CLUE_LIBRARY } from "../lib/engine";
import { FORMS } from "../lib/constraints/forms";
import { FAMILIES } from "../lib/constraints/families";
import { SPATIAL_BEHAVIORS } from "../lib/constraints/spatialBehaviors";
import { FASTENER_CATEGORIES, FASTENER_SUBCATEGORIES } from "../lib/constraints/fasteners";
import { JOINERY_CATEGORIES, JOINERY_TYPES } from "../lib/constraints/joinery";
import { HARDWARE_CATEGORIES, HARDWARE_TYPES } from "../lib/constraints/hardware";
import { FINISH_CATEGORIES, FINISH_TYPES } from "../lib/constraints/finish";
import { TOOLMARK_CATEGORIES, TOOLMARK_TYPES } from "../lib/constraints/toolmarks";
import { SPECIES_EVIDENCE, SUBSTRATE_EVIDENCE } from "../lib/constraints/woodEvidence";
import { UPHOLSTERY_CONSTRUCTION_CATEGORIES, UPHOLSTERY_CONSTRUCTION_TYPES } from "../lib/constraints/upholsteryConstruction";
import { UPHOLSTERY_COVER_CATEGORIES, UPHOLSTERY_COVER_TYPES } from "../lib/constraints/upholsteryCovers";
import { STYLE_FAMILIES, STYLE_REVIVAL_WAVES } from "../lib/constraints/styleFamilies";

const REPO = path.resolve(fileURLToPath(import.meta.url), "../..");
const ENGINE_PATH = path.join(REPO, "lib/engine.ts");
const OUT_PATH = path.join(REPO, "lib/constraints/canonicalVocabulary.generated.ts");

const STOPWORDS = new Set([
  "type", "category", "evidence", "group", "present", "visible", "form", "the", "and",
  "of", "with", "a", "subcategory", "subspecies", "variant", "construction", "cover",
]);
const tokenize = (s: string): Set<string> =>
  new Set(
    s.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !STOPWORDS.has(t))
  );
const uniqSorted = (xs: string[]) => [...new Set(xs)].sort();

// ── mine scoreForms routing keys + prompt preferred-keys from engine source ──
function mineEngineSource(src: string) {
  const routingKeys = new Set<string>();
  for (const m of src.matchAll(/clues\.has\(\s*"([a-z0-9_]+)"\s*\)/g)) routingKeys.add(m[1]);
  for (const m of src.matchAll(/hasAny\(([^)]*)\)/g)) {
    for (const lit of m[1].matchAll(/"([a-z0-9_]+)"/g)) routingKeys.add(lit[1]);
  }
  // prompt "Preferred … keys:" comma-list blocks
  const promptKeys = new Map<string, string>(); // key -> prompt block label
  for (const m of src.matchAll(/Preferred ([^\n:]+?keys?)[^:\n]*:\s*\n([a-z0-9_][a-z0-9_,\s]+?)\./g)) {
    const label = m[1].trim();
    for (const tok of m[2].split(/[,\s]+/)) {
      const k = tok.trim();
      if (/^[a-z][a-z0-9_]+$/.test(k) && k.includes("_")) promptKeys.set(k, label);
    }
  }
  return { routingKeys, promptKeys };
}

// ── deep taxonomy entries for the crosswalk ──
function taxonomyEntries(): { taxonomyId: string; name: string; lib: string }[] {
  const groups: [string, { id?: string; name?: string }[]][] = [
    ["fasteners", [...FASTENER_CATEGORIES, ...FASTENER_SUBCATEGORIES]],
    ["joinery", [...JOINERY_CATEGORIES, ...JOINERY_TYPES]],
    ["hardware", [...HARDWARE_CATEGORIES, ...HARDWARE_TYPES]],
    ["finish", [...FINISH_CATEGORIES, ...FINISH_TYPES]],
    ["toolmarks", [...TOOLMARK_CATEGORIES, ...TOOLMARK_TYPES]],
    ["wood", [...SPECIES_EVIDENCE, ...SUBSTRATE_EVIDENCE]],
    ["upholsteryConstruction", [...UPHOLSTERY_CONSTRUCTION_CATEGORIES, ...UPHOLSTERY_CONSTRUCTION_TYPES]],
    ["upholsteryCovers", [...UPHOLSTERY_COVER_CATEGORIES, ...UPHOLSTERY_COVER_TYPES]],
    ["styleFamilies", [...STYLE_FAMILIES, ...STYLE_REVIVAL_WAVES]],
  ];
  const out: { taxonomyId: string; name: string; lib: string }[] = [];
  for (const [lib, arr] of groups) {
    for (const e of arr) {
      if (e?.id) out.push({ taxonomyId: e.id, name: String(e.name ?? ""), lib });
    }
  }
  return out;
}

function crosswalk(clueKeys: string[], taxa: { taxonomyId: string; name: string; lib: string }[]) {
  const mapped: Record<string, { taxonomyId: string; lib: string; score: number }[]> = {};
  const gaps: string[] = [];
  const taxTokens = taxa.map((t) => ({ ...t, toks: new Set([...tokenize(t.taxonomyId), ...tokenize(t.name)]) }));
  for (const key of clueKeys) {
    const kt = tokenize(key);
    if (kt.size === 0) { gaps.push(key); continue; }
    const scored = taxTokens
      .map((t) => {
        let hit = 0;
        for (const tok of kt) if (t.toks.has(tok)) hit++;
        return { taxonomyId: t.taxonomyId, lib: t.lib, score: +(hit / kt.size).toFixed(2) };
      })
      .filter((s) => s.score >= 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
    if (scored.length) mapped[key] = scored;
    else gaps.push(key);
  }
  return { mapped, gaps: uniqSorted(gaps) };
}

export function buildCanonicalVocabulary(engineSource: string = fs.readFileSync(ENGINE_PATH, "utf8")) {
  const { routingKeys, promptKeys } = mineEngineSource(engineSource);

  // evidence vocabulary, grouped by CLUE_LIBRARY category
  const evidence: Record<string, { id: string; category: string; dateHint?: string; weight: number; disqualifying?: true }[]> = {};
  const disqualifying: string[] = [];
  const clueLibKeys = new Set<string>();
  for (const [id, meta] of Object.entries(CLUE_LIBRARY)) {
    clueLibKeys.add(id);
    const cat = meta.category;
    (evidence[cat] ??= []).push({
      id,
      category: cat,
      ...(meta.dateHint ? { dateHint: meta.dateHint } : {}),
      weight: meta.weight,
      ...(meta.hardNegative ? { disqualifying: true as const } : {}),
    });
    if (meta.hardNegative) disqualifying.push(id);
  }

  // wood species/substrate clue-keys harvested from woodEvidence (clue-key-style ids only)
  const woodKeys = uniqSorted(
    [...SPECIES_EVIDENCE, ...SUBSTRATE_EVIDENCE]
      .map((e: any) => e?.id as string)
      .filter((id) => /^(wood_species|wood_subspecies|wood_variant|substrate|engineered)_/.test(id))
  );

  for (const cat of Object.keys(evidence)) evidence[cat].sort((a, b) => a.id.localeCompare(b.id));

  // coverage gaps: keys the engine routes/prompts on that CLUE_LIBRARY doesn't define
  const routingKeysNotInClueLibrary = uniqSorted([...routingKeys].filter((k) => !clueLibKeys.has(k)));
  const promptKeysNotInClueLibrary = uniqSorted([...promptKeys.keys()].filter((k) => !clueLibKeys.has(k)));

  // forms + subforms
  const forms = FORMS.map((f: any) => ({
    form_id: f.id,
    label: f.name,
    aliases: uniqSorted([...(f.common_aliases ?? [])]),
    family_id: f.family_id ?? null,
    spatial_behavior_id: f.spatial_behavior_id ?? null,
    date_floor: f.date_floor ?? null,
    date_ceiling: f.date_ceiling ?? null,
    has_dimensional_thresholds: Boolean(f.dimensional_thresholds),
  })).sort((a, b) => a.form_id.localeCompare(b.form_id));

  const subforms = FORMS.flatMap((f: any) =>
    (f.subtypes ?? []).map((s: any) => ({ subtype_id: s.id, parent_form_id: f.id, name: s.name }))
  ).sort((a, b) => a.subtype_id.localeCompare(b.subtype_id));

  const relationships = {
    families: FAMILIES.map((x: any) => ({ id: x.id, name: x.name ?? x.id })).sort((a, b) => a.id.localeCompare(b.id)),
    spatialBehaviors: SPATIAL_BEHAVIORS.map((x: any) => ({ id: x.id, family_id: x.family_id ?? null })).sort((a, b) => a.id.localeCompare(b.id)),
  };

  // crosswalk every clue key (CLUE_LIBRARY ∪ wood ∪ routing ∪ prompt) to deep taxonomy
  const allClueKeys = uniqSorted([...clueLibKeys, ...woodKeys, ...routingKeys, ...promptKeys.keys()]);
  const xwalk = crosswalk(allClueKeys, taxonomyEntries());

  const meta = {
    note: "GENERATED by scripts/generateCanonicalVocabulary.ts — do not edit by hand. Run the generator to refresh.",
    counts: {
      evidenceKeys: clueLibKeys.size,
      evidenceCategories: Object.keys(evidence).length,
      disqualifying: disqualifying.length,
      woodEvidenceKeys: woodKeys.length,
      forms: forms.length,
      subforms: subforms.length,
      families: relationships.families.length,
      spatialBehaviors: relationships.spatialBehaviors.length,
      routingKeysMined: routingKeys.size,
      promptKeysMined: promptKeys.size,
      allClueKeys: allClueKeys.length,
    },
    minedRoutingKeys: uniqSorted([...routingKeys]),
    coverageGaps: { routingKeysNotInClueLibrary, promptKeysNotInClueLibrary },
    crosswalk: { mapped: Object.keys(xwalk.mapped).length, unmapped: xwalk.gaps.length },
  };

  return {
    meta,
    evidence,
    disqualifying: uniqSorted(disqualifying),
    woodEvidenceKeys: woodKeys,
    forms,
    subforms,
    relationships,
    crosswalk: xwalk.mapped,
    crosswalkGaps: xwalk.gaps,
  };
}

function writeArtifact() {
  const vocab = buildCanonicalVocabulary(fs.readFileSync(ENGINE_PATH, "utf8"));
  const banner =
    "// AUTO-GENERATED by scripts/generateCanonicalVocabulary.ts — DO NOT EDIT BY HAND.\n" +
    "// Regenerate with: node --import tsx scripts/generateCanonicalVocabulary.ts\n" +
    "// Harvested from CLUE_LIBRARY, forms.ts, families/spatialBehaviors, the deep\n" +
    "// taxonomy libraries, and mined scoreForms/prompt keys. Zero engine behavior.\n\n";
  const body = `export const CANONICAL_VOCABULARY = ${JSON.stringify(vocab, null, 2)} as const;\n`;
  fs.writeFileSync(OUT_PATH, banner + body);
  console.log(`wrote ${OUT_PATH}`);
  console.log(JSON.stringify(vocab.meta, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) writeArtifact();
