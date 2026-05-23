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
import { CLUE_KEY_ALIASES } from "../lib/engineReportHelpers";
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

// Presentation categories for canonical keys the engine uses but CLUE_LIBRARY
// does not define (mined scoreForms routing keys + alias targets). Category is
// for the P0 list / snapping only — it does NOT assign a CLUE_LIBRARY weight, so
// it can't change dating/weighting behavior. (Triage; see PARKING_LOT.md for
// the follow-up to promote these into CLUE_LIBRARY properly.)
const MANUAL_KEY_CATEGORIES: Record<string, string> = {
  // style / structural-pattern signals
  art_deco_pattern: "style", art_nouveau_pattern: "style", chippendale_pattern: "style",
  colonial_georgian_revival_upholstered_armchair_pattern: "style", colonial_revival_pattern: "style",
  edwardian_pattern: "style", federal_hepplewhite_sheraton_pattern: "style", gothic_revival_pattern: "style",
  jacobean_tudor_revival_case_pattern: "style", louis_xvi_revival_pattern: "style",
  mcm_structural_pattern: "style", mission_arts_crafts_structural_pattern: "style",
  renaissance_revival_upholstered_armchair_pattern: "style", rococo_revival_pattern: "style",
  shaker_pattern: "style", victorian_eastlake_pattern: "style", william_and_mary_pattern: "style",
  toledo_industrial_style: "style", mid_century_industrial_office: "style", victorian_commode_form: "style",
  // form signals (lamps + chair forms)
  lamp_form: "form", floor_lamp_form: "form", table_lamp_form: "form", electric_lamp: "form",
  electric_table_lamp: "form", lamp_base: "form", lamp_finial: "form", lamp_harp: "form",
  lamp_shade: "form", lamp_socket: "form", lamp_socket_visible: "form",
  barrel_tub_back: "form", club_chair_form: "form", lounge_chair_form: "form",
  slipper_chair_form: "form", wingback_form: "form",
  // materials
  leaded_glass_shade: "materials", slag_glass_shade: "materials", enameled_steel_basin: "materials",
  // structure / hardware / construction / function
  circular_footring_stretcher: "structure", four_leg_caster_base: "structure",
  stamped_metal_seat_support_bracket: "hardware",
  circular_aperture_seat_board: "construction", commode_function: "function",
  // alias targets the engine recognizes but CLUE_LIBRARY doesn't define
  bun_feet: "style", turned_finials_on_posts: "style", visible_text: "label",
};

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
  const evidence: Record<string, { id: string; category: string; dateHint?: string; weight?: number; disqualifying?: true; source: string }[]> = {};
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
      source: "clue_library",
    });
    if (meta.hardNegative) disqualifying.push(id);
  }

  // wood species/substrate clue-keys harvested from woodEvidence (clue-key-style ids only)
  const woodKeys = uniqSorted(
    [...SPECIES_EVIDENCE, ...SUBSTRATE_EVIDENCE]
      .map((e: any) => e?.id as string)
      .filter((id) => /^(wood_species|wood_subspecies|wood_variant|substrate|engineered)_/.test(id))
  );
  const woodSet = new Set(woodKeys);

  // coverage gaps: keys the engine routes/prompts on that CLUE_LIBRARY doesn't define
  const routingKeysNotInClueLibrary = uniqSorted([...routingKeys].filter((k) => !clueLibKeys.has(k)));
  const promptKeysNotInClueLibrary = uniqSorted([...promptKeys.keys()].filter((k) => !clueLibKeys.has(k)));

  // Fold in canonical keys the engine uses that CLUE_LIBRARY doesn't define:
  //  - mined routing keys outside CLUE_LIBRARY
  //  - alias TARGETS (e.g. commode_function) — consumed by substring helpers the
  //    miner can't see, so they'd otherwise be absent from the canonical set.
  // Alias SYNONYMS (the drifted left-hand side) are NOT canonical and excluded.
  const aliasSynonyms = new Set(Object.keys(CLUE_KEY_ALIASES));
  const aliasTargets = uniqSorted(Object.values(CLUE_KEY_ALIASES));
  const extraCanonical = uniqSorted(
    [...routingKeysNotInClueLibrary, ...aliasTargets].filter(
      (k) => !clueLibKeys.has(k) && !woodSet.has(k) && !aliasSynonyms.has(k)
    )
  );
  const unclassifiedKeys: string[] = [];
  for (const k of extraCanonical) {
    const cat = MANUAL_KEY_CATEGORIES[k];
    if (!cat) { unclassifiedKeys.push(k); continue; }
    (evidence[cat] ??= []).push({ id: k, category: cat, source: "engine_routing" });
  }

  for (const cat of Object.keys(evidence)) evidence[cat].sort((a, b) => a.id.localeCompare(b.id));

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

  // crosswalk every canonical clue key to deep taxonomy
  const allClueKeys = uniqSorted([...clueLibKeys, ...woodKeys, ...routingKeys, ...promptKeys.keys(), ...extraCanonical]);
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
      foldedEngineKeys: extraCanonical.length - unclassifiedKeys.length,
      aliases: Object.keys(CLUE_KEY_ALIASES).length,
      allClueKeys: allClueKeys.length,
    },
    minedRoutingKeys: uniqSorted([...routingKeys]),
    coverageGaps: { routingKeysNotInClueLibrary, promptKeysNotInClueLibrary },
    unclassifiedKeys,
    crosswalk: { mapped: Object.keys(xwalk.mapped).length, unmapped: xwalk.gaps.length },
  };

  // synonym → canonical (the snap-to-canonical alias layer, sorted)
  const aliases: Record<string, string> = {};
  for (const k of Object.keys(CLUE_KEY_ALIASES).sort()) aliases[k] = CLUE_KEY_ALIASES[k];

  return {
    meta,
    evidence,
    disqualifying: uniqSorted(disqualifying),
    woodEvidenceKeys: woodKeys,
    aliases,
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
