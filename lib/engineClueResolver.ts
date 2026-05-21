/**
 * lib/engineClueResolver.ts — Block 1 step 5
 *
 * Resolver layer that synthesizes engine CLUE_LIBRARY-shape metadata from
 * canonical constraint library entries. Replaces direct CLUE_LIBRARY[clueKey]
 * reads in engine.ts for clues that have been migrated to canonical (per
 * D-PH3-12 list in engineCanonicalMap.ts CLUE_TO_CANONICAL).
 *
 * Strategy: lazy-build a Map<canonicalId, ClueMeta> at first call; lookup
 * uses CLUE_TO_CANONICAL to find the canonical entry, then synthesizes the
 * engine-shape meta object. KEPT_IN_ENGINE clues return null (caller falls
 * back to CLUE_LIBRARY).
 */

import { CLUE_TO_CANONICAL, NO_MATCH } from "./engineCanonicalMap";

// Canonical library imports
import { JOINERY_TYPES, JOINERY_CATEGORIES } from "./constraints/joinery";
import { FASTENER_TYPES, FASTENER_SUBCATEGORIES, FASTENER_CATEGORIES } from "./constraints/fasteners";
import { TOOLMARK_TYPES, TOOLMARK_CATEGORIES } from "./constraints/toolmarks";
import { FINISH_TYPES, FINISH_CATEGORIES } from "./constraints/finish";
import { HARDWARE_TYPES, HARDWARE_CATEGORIES } from "./constraints/hardware";
import { SUBSTRATE_EVIDENCE, SPECIES_EVIDENCE, CUT_GRAIN_EVIDENCE, WOOD_DIAGNOSTIC_SIGNALS } from "./constraints/woodEvidence";
import { UPHOLSTERY_CONSTRUCTION_CATEGORIES, UPHOLSTERY_CONSTRUCTION_TYPES } from "./constraints/upholsteryConstruction";
import { UPHOLSTERY_COVER_CATEGORIES, UPHOLSTERY_COVER_TYPES } from "./constraints/upholsteryCovers";
import { WOOD_CATEGORIES, NATURAL_WOOD_SPECIES, ENGINEERED_SUBSTRATES, CUT_GRAIN_PHENOMENA } from "./constraints/woodIdentification";
import { MAKER_ENTRIES } from "./constraints/makerMarks";

// Engine CLUE_LIBRARY entry shape (matches the inline declaration in engine.ts:68).
export type ClueMeta = {
  category: string;
  hardNegative?: boolean;
  formHint?: string;
  dateHint?: string;
  weight: number;
};

// Map canonical entry category to engine AUTHORITY_RANK category key.
//
// Block 20: honor the entry's `assessment_layer` field when present, per the
// D-FA33-5 dual-assessment architecture intent. Fasteners library uses this
// to route upholstery-related fasteners (machine staples, hand tacks,
// decorative brass tacks/nailheads) to the upholstery dating-overlap layer
// despite their `fastener_*` canonical ID prefix. Without this override
// the engine routed staples to the fasteners layer in defiance of the
// authored intent — a silent routing bug surfaced by Block 20a audit.
//
// Recognized assessment_layer values:
//   - "upholstery" → routes to "upholstery" layer (override)
//   - "style_and_waves" → routes to "style_wave" layer (override)
//   - "frame" or undefined → falls back to canonical-ID-prefix routing
//     (default behavior for the majority of entries)
function engineCategoryFor(entry: any): string {
  const al = entry?.assessment_layer;
  if (al === "upholstery") return "upholstery";
  if (al === "style_and_waves") return "style_wave";

  const canonicalCategory = String(entry?.category ?? "other");
  if (canonicalCategory.startsWith("joinery_")) return "joinery";
  if (canonicalCategory.startsWith("fastener_")) return "fasteners";
  if (canonicalCategory.startsWith("toolmark_")) return "toolmarks";
  if (canonicalCategory.startsWith("finish_")) return "finish";
  if (canonicalCategory.startsWith("hardware_")) return "hardware";
  if (canonicalCategory.startsWith("substrate_evidence")) return "materials";
  if (canonicalCategory.startsWith("wood_species_evidence")) return "materials";
  if (canonicalCategory.startsWith("cut_grain_evidence")) return "materials";
  // Block 12: upholstery construction + cover entries route to a single
  // "upholstery" category, surfaced as its own layer in dating-overlap viz.
  if (canonicalCategory.startsWith("upholstery_construction")) return "upholstery";
  if (canonicalCategory.startsWith("upholstery_cover")) return "upholstery";
  return canonicalCategory; // pass through unknown
}

// Best-effort dateHint extraction from canonical entry.
// Priority: explicit date_floor/date_ceiling on entry; else HCL attribution
// embedded in notes field (preserved as provenance markers in Block 0.5d);
// else period_associations.
//
// Block 15: upholstery_construction_* and upholstery_cover_* entries use a
// different period_associations convention than joinery/fasteners/etc.
// Their period[0] is typically an open-ended "continuous-use era" (e.g.,
// velvet period[0] = {date_floor: 1600} with no ceiling; hand-tied coil
// period[0] = {date_floor: 1800} with no ceiling). The DIAGNOSTIC window
// for upholstery dating lives in period[1+] (e.g., velvet period[1] =
// {date_floor: 1800, date_ceiling: 1970}). For upholstery, prefer the
// tightest CLOSED period regardless of order. Non-upholstery libraries
// continue to use Block 10b's first-wins rule.
// Persistent construction techniques whose authored historical span is a
// "dominant usage period," NOT an exclusive window. The canonical M&T family
// note records the migrated HCL text verbatim: mortise-and-tenon "was the
// standard structural method for American furniture from the earliest colonial
// period through the early twentieth century, offering limited dating value on
// its own" — and in practice it persisted through the mid-century (spindle-back
// lounge chairs still use round-tenon/M&T) and to the present. Emitting its
// closed numeric range (1620–1920) made the engine (a) fire false disjoint-
// range conflicts against genuinely later material evidence (e.g. post-1930
// vinyl / foam upholstery) and (b) anchor the overall dating envelope floor to
// 1620 on plainly modern pieces. These techniques are treated as
// non-dating/informational: a prose hint that does not parse to a numeric band,
// matching how other spans-eras evidence (refinished_surface, fully_upholstered)
// already behaves. The clue still surfaces in the dating-overlap chart as
// "present, no parseable date" rather than silently disappearing. Distinguishes
// construction-technology *persistence* from construction-era *exclusivity*:
// genuinely era-bound joinery (hand-cut dovetails, biscuit joints) keeps its
// numeric range and still conflicts with incompatible evidence.
const PERSISTENT_NONDATING_CANONICAL_IDS = new Set<string>([
  "joinery_category_mortise_and_tenon_family",
  // Dowel/peg joinery spans eras: drawbored/pegged mortise-and-tenon is
  // centuries old, while uniform machine doweling is a factory-era method. The
  // LLM emits dowel_joinery for both, so a hard "post-1900" floor falsely
  // late-dated plainly Victorian pieces. Per the canonical
  // joinery_alone_never_dates_furniture meta-rule, treat it as non-dating on
  // its own; corroborating evidence still anchors the date.
  "joinery_type_dowel_joinery",
]);

function dateHintFor(entry: any): string | undefined {
  if (
    typeof entry?.id === "string" &&
    PERSISTENT_NONDATING_CANONICAL_IDS.has(entry.id)
  ) {
    return "spans eras (colonial period to present); limited dating value on its own";
  }
  // Wood SPECIES IDENTITY is non-dating. Per the canonical caution "wood alone
  // should never date furniture", and because the walnut/oak group entries lead
  // with a CLOSED Pilgrim/Early-Colonial window (1620–1700) that the firstClosed
  // rule below would otherwise adopt as the authored diagnostic — anchoring the
  // whole dating envelope floor to the 1600s on plainly later pieces (a Victorian
  // walnut chest, a 1900–1930 slag-glass lamp). Treat species identity as
  // supporting/undated, matching the generic `wood_species` key (no canonical
  // route → already shows "present, no parseable date"). Substrates
  // (substrate_evidence_* — plywood/MDF/particleboard), cut-grain methods
  // (cut_grain_evidence_*), and wood_diagnostic_signal_* remain genuinely
  // diagnostic and keep their numeric ranges — only species IDENTITY is excluded.
  if (entry?.category === "wood_species_evidence") {
    return "wood species; supporting/regional evidence, not a dating signal on its own";
  }
  if (typeof entry?.date_floor === "number" && typeof entry?.date_ceiling === "number") {
    return `c. ${entry.date_floor}–${entry.date_ceiling}`;
  }
  if (typeof entry?.date_floor === "number") return `post-${entry.date_floor}`;
  if (typeof entry?.date_ceiling === "number") return `pre-${entry.date_ceiling}`;
  // Parse "typical_date_range \"<range>\"" out of HCL attribution markers in notes.
  const notes = String(entry?.notes ?? "");
  const m = notes.match(/typical_date_range\s+"([^"]+)"/);
  if (m) return m[1];

  const periods = entry?.period_associations;
  if (Array.isArray(periods) && periods.length > 0) {
    const first = periods[0];
    const firstClosed =
      typeof first?.date_floor === "number" && typeof first?.date_ceiling === "number";
    // When period[0] is a CLOSED window it IS the authored diagnostic — use it
    // as written (the early hand-tool clues, e.g. cut_nail / hand_forged_nail,
    // correctly lead with their early window; reordering them later-dates the
    // piece). Only when period[0] is OPEN-ENDED was the curated peak buried:
    // joinery through_mortise_and_tenon leads with "post-1700" and hides a
    // 1890–1920 peak; wood poplar_group leads with "post-1800" and hides a
    // 1850–1940 peak; hardware/upholstery do this routinely. In that case dig
    // out the tightest CLOSED period so the authored diagnostic window — right
    // there in the same array — is actually used, instead of a timid post-YYYY.
    if (firstClosed) {
      return `c. ${first.date_floor}–${first.date_ceiling}`;
    }
    let tightestFloor: number | null = null;
    let tightestCeiling: number | null = null;
    let tightestSpan = Infinity;
    for (const p of periods) {
      if (typeof p?.date_floor === "number" && typeof p?.date_ceiling === "number") {
        const span = p.date_ceiling - p.date_floor;
        if (span < tightestSpan) {
          tightestSpan = span;
          tightestFloor = p.date_floor;
          tightestCeiling = p.date_ceiling;
        }
      }
    }
    if (tightestFloor !== null && tightestCeiling !== null) {
      return `c. ${tightestFloor}–${tightestCeiling}`;
    }
    // No closed period anywhere — genuinely persistent "still in use" evidence
    // (e.g. butt hinge). Emit the open-ended bound from period[0].
    if (typeof first?.date_floor === "number") return `post-${first.date_floor}`;
    if (typeof first?.date_ceiling === "number") return `pre-${first.date_ceiling}`;
    for (const p of periods) {
      if (typeof p?.date_floor === "number") return `post-${p.date_floor}`;
      if (typeof p?.date_ceiling === "number") return `pre-${p.date_ceiling}`;
    }
  }
  return undefined;
}

// Synthesize a CLUE_LIBRARY-shape meta object from a canonical entry.
function metaFromCanonical(entry: any): ClueMeta {
  const positiveAuthority = typeof entry?.positive_authority === "number" ? entry.positive_authority : 5;
  // 1-10 scale → 0-1 weight. Mirror engine's CLUE_LIBRARY 0-1 range.
  const weight = positiveAuthority / 10;
  // hardNegative: ONLY when canonical entry has explicit hard_negative flag.
  // Do NOT infer from hard_negative_authority (that's confidence in the
  // exclusion if interpreted exclusionary, not a flag that this IS exclusionary).
  // Engine's inline CLUE_LIBRARY hardNegative flag is OR'd in via getClueMeta
  // caller for entries known-categorical per audit log (phillips_screw,
  // staple_fastener, plywood, modern_concealed_hinge).
  const hardNegative = entry?.hard_negative === true || undefined;

  return {
    category: engineCategoryFor(entry),
    weight,
    hardNegative,
    dateHint: dateHintFor(entry),
  };
}

// Lazy-built index: canonical_id → canonical entry. Built on first call.
let canonicalIndex: Map<string, any> | null = null;

function buildIndex(): Map<string, any> {
  const idx = new Map<string, any>();
  const sources = [
    ...JOINERY_CATEGORIES, ...JOINERY_TYPES,
    ...FASTENER_CATEGORIES, ...FASTENER_SUBCATEGORIES, ...FASTENER_TYPES,
    ...TOOLMARK_CATEGORIES, ...TOOLMARK_TYPES,
    ...FINISH_CATEGORIES, ...FINISH_TYPES,
    ...HARDWARE_CATEGORIES, ...HARDWARE_TYPES,
    ...SUBSTRATE_EVIDENCE, ...SPECIES_EVIDENCE,
    // Block 12: upholstery libraries
    ...UPHOLSTERY_CONSTRUCTION_CATEGORIES, ...UPHOLSTERY_CONSTRUCTION_TYPES,
    ...UPHOLSTERY_COVER_CATEGORIES, ...UPHOLSTERY_COVER_TYPES,
  ];
  for (const entry of sources) {
    if (entry?.id) idx.set(entry.id, entry);
  }
  return idx;
}

/**
 * Resolve canonical-derived meta for an engine clue key.
 * Returns null when the clue is KEPT_IN_ENGINE (caller should fall back
 * to CLUE_LIBRARY) or when the canonical lookup returns NO_MATCH.
 */
export function getClueMetaFromCanonical(engineKey: string): ClueMeta | null {
  const canonicalId = CLUE_TO_CANONICAL[engineKey];
  if (!canonicalId || canonicalId === NO_MATCH) return null;

  if (!canonicalIndex) canonicalIndex = buildIndex();
  const entry = canonicalIndex.get(canonicalId);
  if (!entry) return null;

  return metaFromCanonical(entry);
}

/**
 * Block 1 step 7: return the canonical entry's diagnostic_caution_text (if any)
 * for a given engine clue key. Used by dateFromEvidence post-process to surface
 * canonical guidance in support arrays (e.g., substrate_evidence_plywood text
 * replacing engine-hardcoded "post-1920" message per D-PH3-13 #3).
 */
export function getCanonicalCautionText(engineKey: string): string | null {
  const canonicalId = CLUE_TO_CANONICAL[engineKey];
  if (!canonicalId || canonicalId === NO_MATCH) return null;
  if (!canonicalIndex) canonicalIndex = buildIndex();
  const entry = canonicalIndex.get(canonicalId);
  const text = entry?.diagnostic_caution_text;
  return typeof text === "string" && text.length > 0 ? text : null;
}

/**
 * Block 15: return the canonical entry's replacement_likelihood for an engine
 * clue key. Used by Block 14 originality inference to distinguish features
 * that typically survive reupholstery (low — durable construction like
 * hand-tied coils, mortise-and-tenon frames) from features commonly
 * replaced (high — cover fabrics, button-tufting cushions). Replaces
 * hardcoded clue-list heuristics with authoritative library data.
 */
export function getReplacementLikelihood(
  engineKey: string
): "low" | "medium" | "high" | undefined {
  const canonicalId = CLUE_TO_CANONICAL[engineKey];
  if (!canonicalId || canonicalId === NO_MATCH) return undefined;
  if (!canonicalIndex) canonicalIndex = buildIndex();
  const entry = canonicalIndex.get(canonicalId);
  const rl = entry?.replacement_likelihood;
  if (rl === "low" || rl === "medium" || rl === "high") return rl;
  return undefined;
}

/**
 * Block 15: build per-entry identifying-characteristics appendix for the P0
 * LLM system prompt. Iterates engine upholstery clue keys, looks each one up
 * in the canonical library, and assembles a structured guidance block listing
 * the canonical entry's identifying_characteristics. Surfaces library-
 * authored diagnostic detail (e.g., velvet's nap-direction shading, hand-
 * tied coil's twine crossings) to the LLM at perception time so it can
 * apply the same diagnostic vocabulary as the engine.
 *
 * Called once at engine module init; the result is interpolated into the
 * system prompt template literal.
 */
export function buildUpholsteryCanonicalAppendix(): string {
  if (!canonicalIndex) canonicalIndex = buildIndex();

  const lines: string[] = [];
  lines.push("PER-LIBRARY UPHOLSTERY IDENTIFYING DETAILS (Block 15 — canonical library guidance):");
  lines.push("Use these per-entry identifying characteristics from the canonical upholstery library");
  lines.push("to classify what you observe. When you see one of these features, set the listed key");
  lines.push("and reference the matching characteristic in your observation description.");
  lines.push("");

  // Iterate engine upholstery keys in CLUE_TO_CANONICAL deterministic order.
  for (const [engineKey, canonicalId] of Object.entries(CLUE_TO_CANONICAL)) {
    if (!canonicalId || canonicalId === NO_MATCH) continue;
    if (!canonicalId.startsWith("upholstery_construction") &&
        !canonicalId.startsWith("upholstery_cover")) continue;

    const entry = canonicalIndex.get(canonicalId);
    if (!entry) continue;

    const name = entry.name || engineKey;
    const ic: string[] = Array.isArray(entry.identifying_characteristics)
      ? entry.identifying_characteristics
      : [];
    if (ic.length === 0) continue;

    lines.push(`${String(name).toUpperCase()} (key: ${engineKey}):`);
    for (const c of ic) {
      lines.push(`- ${c}`);
    }
    // Block 17: surface wear_characteristics when populated. Distinct from
    // identifying_characteristics — these are diagnostic markers visible on
    // USED examples (crushed pile, broken twine, sagging webbing) and help
    // the LLM verify a feature on a piece that's been in use vs a pristine
    // catalog photo.
    const wc: string[] = Array.isArray((entry as any).wear_characteristics)
      ? (entry as any).wear_characteristics
      : [];
    if (wc.length > 0) {
      lines.push(`- Wear / condition diagnostic markers:`);
      for (const w of wc) {
        lines.push(`  • ${w}`);
      }
    }
    // Replacement-likelihood hint helps the LLM frame originality in its
    // descriptive prose ("velvet cover — commonly replaced", "hand-tied coils
    // — durable, often original").
    const rl = entry.replacement_likelihood;
    if (rl === "high" || rl === "medium" || rl === "low") {
      lines.push(`- Replacement likelihood: ${rl} (${rl === "high" ? "commonly replaced in reupholstery" : rl === "low" ? "durable, often survives reupholstery" : "moderate persistence"}).`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Block 19: build per-entry identifying-characteristics appendix for the P0
 * LLM system prompt, sourced from the JOINERY canonical library. Iterates
 * JOINERY_TYPES + JOINERY_CATEGORIES directly (NOT CLUE_TO_CANONICAL), so
 * every authored canonical joinery entry surfaces to the LLM at perception
 * time — including the ~41 entries that lack an engine clue key today.
 * For entries that DO have a CLUE_TO_CANONICAL mapping, the engine key is
 * annotated alongside so the LLM can tag the observation structurally.
 *
 * Different shape from buildUpholsteryCanonicalAppendix because upholstery
 * has dense engine-key coverage (26 of 47 construction + 60 covers) while
 * joinery has sparse coverage (4 of 45 types). Iterating the canonical
 * library directly extracts value from the richer authoring even before
 * structured engine keys exist.
 *
 * Called once at engine module init; result interpolated into the system
 * prompt template literal.
 */
export function buildJoineryCanonicalAppendix(): string {
  // Build reverse map: canonical_id → engine_key (for the few joinery
  // canonical ids that have a mapping).
  const canonicalToEngine = new Map<string, string>();
  for (const [engineKey, canonicalId] of Object.entries(CLUE_TO_CANONICAL)) {
    if (!canonicalId || canonicalId === NO_MATCH) continue;
    if (canonicalId.startsWith("joinery_")) {
      canonicalToEngine.set(canonicalId, engineKey);
    }
  }

  const lines: string[] = [];
  lines.push("PER-LIBRARY JOINERY IDENTIFYING DETAILS (Block 19 — canonical library guidance):");
  lines.push("Use these per-entry identifying characteristics from the canonical joinery library");
  lines.push("to describe what you observe in joinery surfaces. When an entry below has an");
  lines.push("engine key listed, set that key in your observation. When an entry has no engine");
  lines.push("key listed, still describe the feature in your observation text using the entry's");
  lines.push("vocabulary — engine-side text fallbacks will route the description when present.");
  lines.push("");

  // Categories first (high-level structural buckets — descriptive context
  // only, no engine keys typically; uses category_description + unique_
  // category_traits + identifying_elements + common_in field names per
  // JoineryCategoryEntry interface). Then types (specific construction
  // methods — full identifying_characteristics + wear_characteristics +
  // replacement_likelihood + date_range_summary).
  lines.push("### Joinery categories (top-level structural buckets)");
  lines.push("");
  for (const entry of JOINERY_CATEGORIES) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : "";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}:`);
    if (typeof e.category_description === "string" && e.category_description.length > 0) {
      lines.push(`- ${e.category_description}`);
    }
    const uct: string[] = Array.isArray(e.unique_category_traits) ? e.unique_category_traits : [];
    for (const t of uct) lines.push(`- ${t}`);
    const ie: string[] = Array.isArray(e.identifying_elements) ? e.identifying_elements : [];
    for (const c of ie) lines.push(`- ${c}`);
    const ci: string[] = Array.isArray(e.common_in) ? e.common_in : [];
    if (ci.length > 0) lines.push(`- Common in: ${ci.join(", ")}`);
    lines.push("");
  }

  lines.push("### Joinery types (specific construction methods)");
  lines.push("");
  for (const entry of JOINERY_TYPES) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : " (no engine key — describe in observation text)";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}:`);

    const ic: string[] = Array.isArray(e.identifying_characteristics) ? e.identifying_characteristics : [];
    for (const c of ic) lines.push(`- ${c}`);

    const wc: string[] = Array.isArray(e.wear_characteristics) ? e.wear_characteristics : [];
    if (wc.length > 0) {
      lines.push(`- Wear / condition diagnostic markers:`);
      for (const w of wc) lines.push(`  • ${w}`);
    }

    const rl = e.replacement_likelihood;
    if (rl === "high" || rl === "medium" || rl === "low") {
      lines.push(`- Replacement likelihood: ${rl} (${rl === "high" ? "commonly replaced during restoration" : rl === "low" ? "durable, original joinery typically survives" : "moderate persistence"}).`);
    }

    const drs = e.date_range_summary;
    if (typeof drs === "string" && drs.length > 0) {
      lines.push(`- Date range: ${drs}`);
    }

    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Block 20: same shape as buildJoineryCanonicalAppendix but for the fastener
 * library. Iterates FASTENER_CATEGORIES + FASTENER_SUBCATEGORIES +
 * FASTENER_TYPES directly so all 40 authored canonical fastener entries
 * surface to the LLM at perception time. Fastener engine-key coverage is
 * better than joinery (more entries with CLUE_TO_CANONICAL mappings) but
 * still sparse vs canonical depth; iterating the library directly extracts
 * value from the rich per-entry authoring beyond what engine keys alone
 * surface.
 *
 * Three-tier surfacing: categories (top-level context), subcategories (the
 * intermediate tier introduced in fasteners library; uses
 * subcategory_description + assessment_layer), types (specific fasteners).
 *
 * Called once at engine module init; result interpolated into the system
 * prompt template literal.
 */
export function buildFastenerCanonicalAppendix(): string {
  // Reverse-map: canonical_id → engine_key (joinery already does this for
  // its own appendix; fasteners-side equivalent here).
  const canonicalToEngine = new Map<string, string>();
  for (const [engineKey, canonicalId] of Object.entries(CLUE_TO_CANONICAL)) {
    if (!canonicalId || canonicalId === NO_MATCH) continue;
    if (canonicalId.startsWith("fastener_")) {
      canonicalToEngine.set(canonicalId, engineKey);
    }
  }

  const lines: string[] = [];
  lines.push("PER-LIBRARY FASTENER IDENTIFYING DETAILS (Block 20 — canonical library guidance):");
  lines.push("Use these per-entry identifying characteristics from the canonical fastener library");
  lines.push("to describe what you observe in fastener evidence. When an entry below has an");
  lines.push("engine key listed, set that key in your observation. When an entry has no engine");
  lines.push("key listed, still describe the feature in your observation text using the entry's");
  lines.push("vocabulary — engine-side text fallbacks will route the description when present.");
  lines.push("");
  lines.push("Note: STAPLES subcategories (3A upholstery_tacks, 3B machine_staples) and the");
  lines.push("decorative brass tack type carry assessment_layer: \"upholstery\" — the engine");
  lines.push("routes their dating-overlap evidence to the upholstery layer, not the fasteners");
  lines.push("layer, per the dual-assessment architecture wired in engineCategoryFor.");
  lines.push("");

  lines.push("### Fastener categories (top-level structural buckets)");
  lines.push("");
  for (const entry of FASTENER_CATEGORIES) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : "";
    const layerAnnot = e.assessment_layer === "upholstery" ? ` [→ upholstery layer]` : "";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}${layerAnnot}:`);
    if (typeof e.category_description === "string" && e.category_description.length > 0) {
      lines.push(`- ${e.category_description}`);
    }
    const uct: string[] = Array.isArray(e.unique_category_traits) ? e.unique_category_traits : [];
    for (const t of uct) lines.push(`- ${t}`);
    const cie: string[] = Array.isArray(e.core_identifying_elements) ? e.core_identifying_elements : [];
    for (const c of cie) lines.push(`- ${c}`);
    const wc: string[] = Array.isArray(e.wear_characteristics) ? e.wear_characteristics : [];
    if (wc.length > 0) {
      lines.push(`- Wear / condition diagnostic markers:`);
      for (const w of wc) lines.push(`  • ${w}`);
    }
    lines.push("");
  }

  lines.push("### Fastener subcategories (mid-tier between category and type)");
  lines.push("");
  for (const entry of FASTENER_SUBCATEGORIES) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : "";
    const layerAnnot = e.assessment_layer === "upholstery" ? ` [→ upholstery layer]` : "";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}${layerAnnot}:`);
    if (typeof e.subcategory_description === "string" && e.subcategory_description.length > 0) {
      lines.push(`- ${e.subcategory_description}`);
    }
    const ut: string[] = Array.isArray(e.unique_traits) ? e.unique_traits : [];
    for (const t of ut) lines.push(`- ${t}`);
    const ic: string[] = Array.isArray(e.identifying_characteristics) ? e.identifying_characteristics : [];
    for (const c of ic) lines.push(`- ${c}`);
    const wc: string[] = Array.isArray(e.wear_characteristics) ? e.wear_characteristics : [];
    if (wc.length > 0) {
      lines.push(`- Wear / condition diagnostic markers:`);
      for (const w of wc) lines.push(`  • ${w}`);
    }
    const rl = e.replacement_likelihood;
    if (rl === "high" || rl === "medium" || rl === "low") {
      lines.push(`- Replacement likelihood: ${rl} (${rl === "high" ? "commonly replaced; restoration-contamination class" : rl === "low" ? "durable; original construction typically survives" : "moderate persistence"}).`);
    }
    const drs = e.date_range_summary;
    if (typeof drs === "string" && drs.length > 0) lines.push(`- Date range: ${drs}`);
    lines.push("");
  }

  lines.push("### Fastener types (specific fastener identifications)");
  lines.push("");
  for (const entry of FASTENER_TYPES) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : " (no engine key — describe in observation text)";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}:`);

    const ic: string[] = Array.isArray(e.identifying_characteristics) ? e.identifying_characteristics : [];
    for (const c of ic) lines.push(`- ${c}`);

    const wc: string[] = Array.isArray(e.wear_characteristics) ? e.wear_characteristics : [];
    if (wc.length > 0) {
      lines.push(`- Wear / condition diagnostic markers:`);
      for (const w of wc) lines.push(`  • ${w}`);
    }

    const rl = e.replacement_likelihood;
    if (rl === "high" || rl === "medium" || rl === "low") {
      lines.push(`- Replacement likelihood: ${rl} (${rl === "high" ? "commonly replaced during restoration" : rl === "low" ? "durable, original fastener typically survives" : "moderate persistence"}).`);
    }

    const drs = e.date_range_summary;
    if (typeof drs === "string" && drs.length > 0) lines.push(`- Date range: ${drs}`);

    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Block 21: same pattern as buildJoineryCanonicalAppendix and
 * buildFastenerCanonicalAppendix but for the hardware library. Iterates
 * HARDWARE_CATEGORIES + HARDWARE_TYPES directly (NOT CLUE_TO_CANONICAL),
 * so every authored canonical hardware entry surfaces to the LLM at
 * perception time. Hardware library uses a TWO-tier structure (categories
 * + types) — no intermediate subcategory tier like fasteners.
 *
 * The hardware_category_upholstery_hardware category carries
 * assessment_layer: "upholstery" per the D-FA33-5 dual-assessment
 * architecture. Its three type entries (upholstery_tacks,
 * decorative_nailhead_trim, coil_spring_hardware) inherit this routing
 * and are annotated [→ upholstery layer] in the appendix.
 *
 * Called once at engine module init; result interpolated into the system
 * prompt template literal.
 */
export function buildHardwareCanonicalAppendix(): string {
  const canonicalToEngine = new Map<string, string>();
  for (const [engineKey, canonicalId] of Object.entries(CLUE_TO_CANONICAL)) {
    if (!canonicalId || canonicalId === NO_MATCH) continue;
    if (canonicalId.startsWith("hardware_")) {
      canonicalToEngine.set(canonicalId, engineKey);
    }
  }

  // Pre-compute which categories carry assessment_layer: "upholstery" so
  // type entries inherit and annotate correctly.
  const upholsteryRoutedCategories = new Set<string>();
  for (const cat of HARDWARE_CATEGORIES) {
    if ((cat as any).assessment_layer === "upholstery") {
      upholsteryRoutedCategories.add((cat as any).id);
    }
  }

  const lines: string[] = [];
  lines.push("PER-LIBRARY HARDWARE IDENTIFYING DETAILS (Block 21 — canonical library guidance):");
  lines.push("Use these per-entry identifying characteristics from the canonical hardware library");
  lines.push("to describe what you observe in hardware evidence. When an entry below has an");
  lines.push("engine key listed, set that key in your observation. When an entry has no engine");
  lines.push("key listed, still describe the feature in your observation text using the entry's");
  lines.push("vocabulary — engine-side text fallbacks will route the description when present.");
  lines.push("");
  lines.push("Note: hardware_category_upholstery_hardware carries assessment_layer:");
  lines.push("\"upholstery\" — the engine routes its types' dating-overlap evidence (upholstery");
  lines.push("tacks, decorative nailhead trim, coil spring hardware) to the upholstery layer,");
  lines.push("not the hardware layer, per the dual-assessment architecture wired in");
  lines.push("engineCategoryFor.");
  lines.push("");

  lines.push("### Hardware categories (top-level structural buckets)");
  lines.push("");
  for (const entry of HARDWARE_CATEGORIES) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : "";
    const layerAnnot = e.assessment_layer === "upholstery" ? ` [→ upholstery layer]` : "";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}${layerAnnot}:`);
    if (typeof e.category_description === "string" && e.category_description.length > 0) {
      lines.push(`- ${e.category_description}`);
    }
    const uct: string[] = Array.isArray(e.unique_category_traits) ? e.unique_category_traits : [];
    for (const t of uct) lines.push(`- ${t}`);
    const ie: string[] = Array.isArray(e.identifying_elements) ? e.identifying_elements : [];
    for (const c of ie) lines.push(`- ${c}`);
    const ci: string[] = Array.isArray(e.common_in) ? e.common_in : [];
    if (ci.length > 0) lines.push(`- Common in: ${ci.join(", ")}`);
    lines.push("");
  }

  lines.push("### Hardware types (specific hardware identifications)");
  lines.push("");
  for (const entry of HARDWARE_TYPES) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : " (no engine key — describe in observation text)";
    const layerAnnot = upholsteryRoutedCategories.has(e.parent_category_id) ? ` [→ upholstery layer]` : "";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}${layerAnnot}:`);

    const ic: string[] = Array.isArray(e.identifying_characteristics) ? e.identifying_characteristics : [];
    for (const c of ic) lines.push(`- ${c}`);

    const wc: string[] = Array.isArray(e.wear_characteristics) ? e.wear_characteristics : [];
    if (wc.length > 0) {
      lines.push(`- Wear / condition diagnostic markers:`);
      for (const w of wc) lines.push(`  • ${w}`);
    }

    const rl = e.replacement_likelihood;
    if (rl === "high" || rl === "medium" || rl === "low") {
      lines.push(`- Replacement likelihood: ${rl} (${rl === "high" ? "commonly replaced during restoration" : rl === "low" ? "durable, original hardware typically survives" : "moderate persistence"}).`);
    }

    const drs = e.date_range_summary;
    if (typeof drs === "string" && drs.length > 0) lines.push(`- Date range: ${drs}`);

    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Block 22 (engine pull-through): finish library canonical appendix.
 * Iterates FINISH_CATEGORIES (3) + FINISH_TYPES (5) = 8 entries directly.
 * Two-tier surfacing (no subcategory tier). Finish is engine-routed via
 * canonical-id prefix "finish_" → "finish" layer in engineCategoryFor.
 */
export function buildFinishCanonicalAppendix(): string {
  const canonicalToEngine = new Map<string, string>();
  for (const [engineKey, canonicalId] of Object.entries(CLUE_TO_CANONICAL)) {
    if (!canonicalId || canonicalId === NO_MATCH) continue;
    if (canonicalId.startsWith("finish_")) canonicalToEngine.set(canonicalId, engineKey);
  }
  const lines: string[] = [];
  lines.push("PER-LIBRARY FINISH IDENTIFYING DETAILS (Block 22 — canonical library guidance):");
  lines.push("Use these per-entry identifying characteristics from the canonical finish library");
  lines.push("to describe surface-finish evidence. When an entry has an engine key listed, set");
  lines.push("that key in your observation. Engine routes finish_* canonical ids to the finish");
  lines.push("dating-overlap layer.");
  lines.push("");
  lines.push("### Finish categories (natural / synthetic / alteration)");
  lines.push("");
  for (const entry of FINISH_CATEGORIES) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : "";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}:`);
    if (typeof e.description === "string" && e.description.length > 0) lines.push(`- ${e.description}`);
    if (typeof e.date_range_summary === "string") lines.push(`- Date range: ${e.date_range_summary}`);
    if (typeof e.indicator_text === "string") lines.push(`- ${e.indicator_text}`);
    lines.push("");
  }
  lines.push("### Finish types (specific finish identifications)");
  lines.push("");
  for (const entry of FINISH_TYPES) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : " (no engine key — describe in observation text)";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}:`);
    const ic: string[] = Array.isArray(e.identifying_characteristics) ? e.identifying_characteristics : [];
    for (const c of ic) lines.push(`- ${c}`);
    if (typeof e.finish_chemistry === "string") lines.push(`- Finish chemistry: ${e.finish_chemistry}`);
    const rl = e.replacement_likelihood;
    if (rl === "high" || rl === "medium" || rl === "low") {
      lines.push(`- Replacement likelihood: ${rl} (${rl === "high" ? "commonly replaced during restoration" : rl === "low" ? "durable, original finish typically survives" : "moderate persistence"}).`);
    }
    if (typeof e.date_range_summary === "string") lines.push(`- Date range: ${e.date_range_summary}`);
    if (typeof e.diagnostic_caution_text === "string") lines.push(`- Caution: ${e.diagnostic_caution_text}`);
    lines.push("");
  }
  return lines.join("\n");
}

/**
 * Block 22 (engine pull-through): toolmarks library canonical appendix.
 * Iterates TOOLMARK_CATEGORIES + TOOLMARK_TYPES (~8 entries). Two-tier.
 * Engine routes toolmark_* canonical ids to the toolmarks dating-overlap
 * layer. hand_vs_machine_classification surfaced because it's the
 * library's signature dating axis.
 */
export function buildToolmarkCanonicalAppendix(): string {
  const canonicalToEngine = new Map<string, string>();
  for (const [engineKey, canonicalId] of Object.entries(CLUE_TO_CANONICAL)) {
    if (!canonicalId || canonicalId === NO_MATCH) continue;
    if (canonicalId.startsWith("toolmark_")) canonicalToEngine.set(canonicalId, engineKey);
  }
  const lines: string[] = [];
  lines.push("PER-LIBRARY TOOLMARK IDENTIFYING DETAILS (Block 22 — canonical library guidance):");
  lines.push("Use these per-entry identifying characteristics from the canonical toolmarks");
  lines.push("library to describe production-surface evidence. Toolmark types carry");
  lines.push("hand_vs_machine_classification — a key dating axis distinguishing pre-industrial");
  lines.push("hand work from industrial-era machine work.");
  lines.push("");
  lines.push("### Toolmark categories");
  lines.push("");
  for (const entry of TOOLMARK_CATEGORIES) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : "";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}:`);
    if (typeof e.description === "string") lines.push(`- ${e.description}`);
    if (typeof e.date_range_summary === "string") lines.push(`- Date range: ${e.date_range_summary}`);
    lines.push("");
  }
  lines.push("### Toolmark types (specific production-surface evidence)");
  lines.push("");
  for (const entry of TOOLMARK_TYPES) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : " (no engine key — describe in observation text)";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}:`);
    const ic: string[] = Array.isArray(e.identifying_characteristics) ? e.identifying_characteristics : [];
    for (const c of ic) lines.push(`- ${c}`);
    if (typeof e.hand_vs_machine_classification === "string") {
      lines.push(`- Production era: ${e.hand_vs_machine_classification.replace(/_/g, " ")}`);
    }
    const rl = e.replacement_likelihood;
    if (rl === "high" || rl === "medium" || rl === "low") {
      lines.push(`- Replacement likelihood: ${rl}.`);
    }
    if (typeof e.date_range_summary === "string") lines.push(`- Date range: ${e.date_range_summary}`);
    if (typeof e.diagnostic_caution_text === "string") lines.push(`- Caution: ${e.diagnostic_caution_text}`);
    lines.push("");
  }
  return lines.join("\n");
}

/**
 * Block 22 (engine pull-through): wood identification library canonical
 * appendix. Iterates WOOD_CATEGORIES (5) + NATURAL_WOOD_SPECIES (~36 with
 * nested subspecies) + ENGINEERED_SUBSTRATES (~6) + CUT_GRAIN_PHENOMENA
 * (~27). Surface focus: species names + identifying_elements +
 * typical_structural_role + period anchoring. The identification side is
 * about WHAT WOOD it is; evidence-side patterns are in
 * buildWoodEvidenceCanonicalAppendix.
 */
export function buildWoodIdentificationCanonicalAppendix(): string {
  const canonicalToEngine = new Map<string, string>();
  for (const [engineKey, canonicalId] of Object.entries(CLUE_TO_CANONICAL)) {
    if (!canonicalId || canonicalId === NO_MATCH) continue;
    if (canonicalId.startsWith("wood_species") || canonicalId.startsWith("wood_category") ||
        canonicalId.startsWith("engineered_substrate") || canonicalId.startsWith("cut_grain_phenomenon")) {
      canonicalToEngine.set(canonicalId, engineKey);
    }
  }
  const lines: string[] = [];
  lines.push("PER-LIBRARY WOOD IDENTIFICATION DETAILS (Block 22 — canonical library guidance):");
  lines.push("Use these per-entry identifying elements from the canonical wood identification");
  lines.push("library to classify what wood you observe. Identification produces what evidence");
  lines.push("consumes — name the species/substrate/figure phenomenon when visible, and the");
  lines.push("engine will combine it with construction evidence to date the piece.");
  lines.push("");
  lines.push("### Wood categories (top-level classification)");
  lines.push("");
  for (const entry of WOOD_CATEGORIES) {
    const e = entry as any;
    const name = e.name || e.id;
    lines.push(`${String(name).toUpperCase()}:`);
    if (typeof e.description === "string") lines.push(`- ${e.description.slice(0, 400)}`);
    const sit: string[] = Array.isArray(e.shared_identifying_traits) ? e.shared_identifying_traits : [];
    for (const c of sit.slice(0, 6)) lines.push(`- ${c}`);
    lines.push("");
  }
  lines.push("### Wood species (~36 entries; subspecies nested under parent)");
  lines.push("");
  for (const entry of NATURAL_WOOD_SPECIES) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : "";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}:`);
    if (typeof e.scientific_name === "string") lines.push(`- Scientific name: ${e.scientific_name}`);
    const ie: string[] = Array.isArray(e.identifying_elements) ? e.identifying_elements : [];
    for (const c of ie.slice(0, 5)) lines.push(`- ${c}`);
    if (typeof e.typical_structural_role === "string") lines.push(`- Typical role: ${e.typical_structural_role.replace(/_/g, " ")}`);
    const subs = Array.isArray(e.subspecies) ? e.subspecies : [];
    if (subs.length > 0) {
      lines.push(`- Subspecies: ${subs.map((s: any) => s.name).join(", ")}`);
    }
    lines.push("");
  }
  lines.push("### Engineered substrates (plywood, MDF, particleboard, etc.)");
  lines.push("");
  for (const entry of ENGINEERED_SUBSTRATES) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : "";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}:`);
    if (typeof e.description === "string") lines.push(`- ${e.description.slice(0, 300)}`);
    const ia = e.introduction_anchor;
    if (ia && typeof ia.widespread_adoption_year === "number") {
      lines.push(`- Introduction: earliest plausible ${ia.earliest_plausible_year ?? "?"}; widespread by ${ia.widespread_adoption_year}.`);
    }
    lines.push("");
  }
  lines.push("### Cut / grain / figure phenomena (~27 entries — visible patterns)");
  lines.push("");
  for (const entry of CUT_GRAIN_PHENOMENA) {
    const e = entry as any;
    const name = e.name || e.id;
    const engineKey = canonicalToEngine.get(e.id);
    const keyAnnot = engineKey ? ` (key: ${engineKey})` : "";
    lines.push(`${String(name).toUpperCase()}${keyAnnot}:`);
    const ic: string[] = Array.isArray(e.identifying_elements) ? e.identifying_elements : [];
    for (const c of ic.slice(0, 4)) lines.push(`- ${c}`);
    if (typeof e.diagnostic_caution_text === "string") lines.push(`- Caution: ${e.diagnostic_caution_text.slice(0, 300)}`);
    lines.push("");
  }
  return lines.join("\n");
}

/**
 * Block 22 (engine pull-through): wood evidence library canonical appendix.
 * Iterates SPECIES_EVIDENCE + SUBSTRATE_EVIDENCE + CUT_GRAIN_EVIDENCE +
 * WOOD_DIAGNOSTIC_SIGNALS. Surface focus: period associations + usage roles
 * + diagnostic_caution_text (heavily populated on this library). The
 * evidence side answers HOW the wood evidence factors into dating.
 */
export function buildWoodEvidenceCanonicalAppendix(): string {
  const lines: string[] = [];
  lines.push("PER-LIBRARY WOOD EVIDENCE DETAILS (Block 22 — canonical library guidance):");
  lines.push("Wood-as-evidence patterns conditioning period, regional, and style-wave");
  lines.push("attribution. Wood alone never dates furniture — these entries condition how");
  lines.push("wood evidence joins construction + form + fasteners to refine dating. Pair the");
  lines.push("identification appendix (species/substrate/cut) with these entries' usage_role,");
  lines.push("period_associations, and diagnostic_caution_text.");
  lines.push("");
  lines.push("### Species evidence (27 entries — per-species period + regional + usage)");
  lines.push("");
  for (const entry of SPECIES_EVIDENCE) {
    const e = entry as any;
    lines.push(`SPECIES EVIDENCE: ${e.species_id}${e.subspecies_id ? ` (subspecies: ${e.subspecies_id})` : ""}:`);
    const usage = Array.isArray(e.usage_role) ? e.usage_role : (e.usage_role ? [e.usage_role] : []);
    if (usage.length > 0) lines.push(`- Usage roles: ${usage.join(", ")}`);
    if (typeof e.usage_role_notes === "string") lines.push(`- ${e.usage_role_notes.slice(0, 300)}`);
    const sw: string[] = Array.isArray(e.style_wave_associations) ? e.style_wave_associations : [];
    if (sw.length > 0) lines.push(`- Style waves: ${sw.slice(0, 6).join(", ")}`);
    if (typeof e.diagnostic_caution_text === "string") lines.push(`- Caution: ${e.diagnostic_caution_text.slice(0, 400)}`);
    lines.push("");
  }
  lines.push("### Substrate evidence (plywood / particleboard / MDF / hardboard — adoption curves)");
  lines.push("");
  for (const entry of SUBSTRATE_EVIDENCE) {
    const e = entry as any;
    lines.push(`SUBSTRATE EVIDENCE: ${e.substrate_id}:`);
    const ac = e.adoption_curve;
    if (ac && typeof ac.earliest_plausible_year === "number") {
      lines.push(`- Adoption: earliest ${ac.earliest_plausible_year}; widespread ${ac.widespread_adoption_year}${ac.dominance_year ? `; dominant ${ac.dominance_year}` : ""}.`);
    }
    const usage = Array.isArray(e.usage_role) ? e.usage_role : (e.usage_role ? [e.usage_role] : []);
    if (usage.length > 0) lines.push(`- Usage roles: ${usage.join(", ")}`);
    if (typeof e.diagnostic_caution_text === "string") lines.push(`- Caution: ${e.diagnostic_caution_text.slice(0, 400)}`);
    lines.push("");
  }
  lines.push("### Cut/grain evidence (~37 entries — composed species+cut patterns)");
  lines.push("");
  for (const entry of CUT_GRAIN_EVIDENCE) {
    const e = entry as any;
    lines.push(`CUT/GRAIN EVIDENCE: ${e.cut_phenomenon_id}${e.species_id ? ` × ${e.species_id}` : ""}${e.subspecies_id ? ` × ${e.subspecies_id}` : ""}:`);
    const usage = Array.isArray(e.usage_role) ? e.usage_role : (e.usage_role ? [e.usage_role] : []);
    if (usage.length > 0) lines.push(`- Usage roles: ${usage.join(", ")}`);
    const sw: string[] = Array.isArray(e.style_wave_associations) ? e.style_wave_associations : [];
    if (sw.length > 0) lines.push(`- Style waves: ${sw.slice(0, 6).join(", ")}`);
    if (typeof e.diagnostic_caution_text === "string") lines.push(`- Caution: ${e.diagnostic_caution_text.slice(0, 300)}`);
    lines.push("");
  }
  lines.push("### Composed multi-entity diagnostic signals (~9 entries — strongest signals)");
  lines.push("");
  for (const entry of WOOD_DIAGNOSTIC_SIGNALS) {
    const e = entry as any;
    lines.push(`SIGNAL: ${e.signal_description}`);
    lines.push(`- Meaning: ${e.diagnostic_meaning}`);
    const sw: string[] = Array.isArray(e.style_wave_associations) ? e.style_wave_associations : [];
    if (sw.length > 0) lines.push(`- Style waves: ${sw.slice(0, 4).join(", ")}`);
    lines.push("");
  }
  return lines.join("\n");
}

/**
 * Block 23 (engine pull-through): maker marks library canonical appendix.
 * Iterates MAKER_ENTRIES (77). Per-maker surfacing of attribution-confidence
 * rules + false-positive warnings — the highest-authority appraiser-voice
 * content per maker. NOTE: MAKER_ENTRIES is not yet engine-wired today
 * (engine.ts imports only the legacy MAKER_MARKS shim per Block 23a audit).
 * This appendix surfaces the new schema's content to the LLM at perception
 * time so the LLM applies the same attribution discipline whether or not
 * Phase 3 engine integration has shipped.
 */
export function buildMakerMarkCanonicalAppendix(): string {
  const lines: string[] = [];
  lines.push("PER-LIBRARY MAKER MARK IDENTIFYING DETAILS (Block 23 — canonical library guidance):");
  lines.push("Use these per-maker attribution rules from the canonical maker library when you");
  lines.push("observe a maker mark, label, stamp, decal, stencil, brand, or attribution clue.");
  lines.push("The Core Attribution Rule: a maker mark should only create a HIGH-CONFIDENCE");
  lines.push("attribution when at least one of (a) full or near-full maker name, (b) known");
  lines.push("branded device + supporting construction context, (c) maker-specific serial/");
  lines.push("style/model/label format, or (d) retail label + separate construction evidence");
  lines.push("is present. Initials alone are LOW authority. Style-line names are NOT maker");
  lines.push("names. Retail labels are NOT always maker labels. Geographic association marks");
  lines.push("(Grand Rapids triangle, etc.) are NOT single-maker marks.");
  lines.push("");
  for (const entry of MAKER_ENTRIES) {
    const e = entry as any;
    lines.push(`MAKER: ${e.maker_name}`);
    if (typeof e.region === "string") lines.push(`- Region: ${e.region}`);
    const fc: string[] = Array.isArray(e.furniture_categories) ? e.furniture_categories : [];
    if (fc.length > 0) lines.push(`- Furniture: ${fc.join(", ")}`);
    const mt: string[] = Array.isArray(e.known_mark_types) ? e.known_mark_types : [];
    if (mt.length > 0) lines.push(`- Mark types: ${mt.join(", ")}`);
    const kw: string[] = Array.isArray(e.known_wording) ? e.known_wording : [];
    if (kw.length > 0) lines.push(`- Known wording: ${kw.slice(0, 6).map((w: string) => `"${w}"`).join(", ")}`);
    const pa = Array.isArray(e.period_associations) ? e.period_associations : [];
    if (pa.length > 0) {
      const ranges = pa.map((p: any) => {
        const f = p.date_floor, c = p.date_ceiling;
        return f && c ? `${f}-${c}` : f ? `post-${f}` : c ? `pre-${c}` : "?";
      });
      lines.push(`- Period(s): ${ranges.join("; ")}`);
    }
    if (typeof e.attribution_confidence_rule === "string") {
      lines.push(`- Attribution rule: ${e.attribution_confidence_rule.slice(0, 350)}`);
    }
    const fpw: string[] = Array.isArray(e.false_positive_warnings) ? e.false_positive_warnings : [];
    if (fpw.length > 0) {
      lines.push(`- False-positive warnings:`);
      for (const w of fpw.slice(0, 3)) lines.push(`  • ${w.slice(0, 250)}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

/**
 * Block 1 step 7: parse engine free-text date range strings into numeric
 * { date_floor, date_ceiling } per D-PH3-13 #4. Handles common engine formats:
 *   "c. 1830-1870" / "c. 1830–1870" / "1700–1860" → { 1830, 1870 }
 *   "post-1934"                                   → { 1934, null }
 *   "pre-1860"                                    → { null, 1860 }
 * Block 5 expansion (real-data formats observed in LLM outputs):
 *   "c. 1900" / "ca. 1900" / "circa 1900"         → { 1890, 1910 } (±10y)
 *   "1870s" / "1870's"                            → { 1870, 1879 }
 *   "early 19th century"                          → { 1800, 1830 }
 *   "mid 19th century" / "middle of the 19th c."  → { 1830, 1870 }
 *   "late 19th century"                           → { 1870, 1900 }
 *   "early 20th century"                          → { 1900, 1930 }
 *   "mid 20th century"                            → { 1930, 1970 }
 *   "late 20th century"                           → { 1970, 2000 }
 *   "19th century" / "19th c."                    → { 1800, 1900 }
 *   "1850" (bare year)                            → { 1850, 1850 }
 *
 * Returns { null, null } when no defensible parse is available.
 */
export function parseRangeToNumeric(range: string | null | undefined): {
  date_floor: number | null;
  date_ceiling: number | null;
} {
  if (!range) return { date_floor: null, date_ceiling: null };
  const r = String(range).trim();

  // Range form: "c. 1830-1870" / "c. 1830–1870" / "1700–1860"
  const rangeMatch = r.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) {
    const y1 = parseInt(rangeMatch[1], 10);
    const y2 = parseInt(rangeMatch[2], 10);
    // Normalize reversed inputs (e.g. "1880-1830") so downstream aggregators
    // and renderers always see floor ≤ ceiling.
    return { date_floor: Math.min(y1, y2), date_ceiling: Math.max(y1, y2) };
  }

  // Open-ended: "post-YYYY"
  const postMatch = r.match(/post[-\s]+(\d{4})/i);
  if (postMatch) {
    return { date_floor: parseInt(postMatch[1], 10), date_ceiling: null };
  }

  // Open-ended: "pre-YYYY"
  const preMatch = r.match(/pre[-\s]+(\d{4})/i);
  if (preMatch) {
    return { date_floor: null, date_ceiling: parseInt(preMatch[1], 10) };
  }

  // Decade: "1870s" / "1870's"
  const decadeMatch = r.match(/(\d{3})0'?s\b/);
  if (decadeMatch) {
    const decadeStart = parseInt(decadeMatch[1] + "0", 10);
    return { date_floor: decadeStart, date_ceiling: decadeStart + 9 };
  }

  // Circa / approximate single year: "c. 1900" / "ca. 1900" / "circa 1900"
  // Treats as a ±10-year band — common appraiser usage.
  const circaMatch = r.match(/(?:^|\s)(?:c\.|ca\.|circa)\s*(\d{4})/i);
  if (circaMatch) {
    const center = parseInt(circaMatch[1], 10);
    return { date_floor: center - 10, date_ceiling: center + 10 };
  }

  // Century period phrases: "early 19th century", "mid 20th c.", "late 18th century", etc.
  const centuryPhraseMatch = r.match(/(early|mid(?:dle)?|late)\s+(?:of\s+the\s+)?(\d{1,2})(?:st|nd|rd|th)\s+c(?:entury|\.)/i);
  if (centuryPhraseMatch) {
    const phase = centuryPhraseMatch[1].toLowerCase();
    const century = parseInt(centuryPhraseMatch[2], 10);
    const centuryStart = (century - 1) * 100;
    if (phase.startsWith("early")) return { date_floor: centuryStart, date_ceiling: centuryStart + 30 };
    if (phase.startsWith("mid"))   return { date_floor: centuryStart + 30, date_ceiling: centuryStart + 70 };
    if (phase.startsWith("late"))  return { date_floor: centuryStart + 70, date_ceiling: centuryStart + 100 };
  }

  // Bare century: "19th century" / "19th c."
  const bareCenturyMatch = r.match(/(\d{1,2})(?:st|nd|rd|th)\s+c(?:entury|\.)/i);
  if (bareCenturyMatch) {
    const century = parseInt(bareCenturyMatch[1], 10);
    const centuryStart = (century - 1) * 100;
    return { date_floor: centuryStart, date_ceiling: centuryStart + 100 };
  }

  // Bare 4-digit year as last resort (point estimate, ±5y band for visibility)
  const bareYearMatch = r.match(/\b(\d{4})\b/);
  if (bareYearMatch) {
    const year = parseInt(bareYearMatch[1], 10);
    // Sanity check — furniture date range is roughly 1600-2050
    if (year >= 1600 && year <= 2050) {
      return { date_floor: year - 5, date_ceiling: year + 5 };
    }
  }

  return { date_floor: null, date_ceiling: null };
}
