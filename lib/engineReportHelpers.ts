/**
 * Small pure decision helpers extracted from the engine report-assembly path
 * so their behavior can be unit-tested in isolation (deterministic, no model
 * call). Each mirrors logic that previously lived inline in lib/engine.ts; the
 * WHY/audit context stays at the call sites.
 */

/** Only a SUPPORTED style attribution may prefix the form NAME. Context-only
 * sources (form-scorer artifact, text-cue guesses) are intentionally NOT
 * accepted here — the helper has access to nothing but the attribution. */
export function pickNamePrefixStyle(
  styleAttribution: { name?: string | null } | null | undefined
): string | null {
  return styleAttribution?.name || null;
}

/** True when a subtype's own production window is disjoint from the computed
 * frame dating (so it cannot coexist with the date and should be dropped). The
 * frame dating must be fully known; the subtype window may be open-ended — a
 * null bound is treated as ±infinity, so a [1970, null] reproduction subtype is
 * still dropped from a 1900–1930 frame (audit: run-5 brass-bed revival, whose
 * null ceiling previously let it survive). */
export function subtypeDisjointFromDating(
  subtype: { date_floor?: number | null; date_ceiling?: number | null } | null | undefined,
  p2DateFloor: number | null | undefined,
  p2DateCeiling: number | null | undefined
): boolean {
  if (!subtype) return false;
  if (typeof p2DateFloor !== "number" || typeof p2DateCeiling !== "number") return false;
  const disjointAbove =
    typeof subtype.date_floor === "number" && subtype.date_floor > p2DateCeiling;
  const disjointBelow =
    typeof subtype.date_ceiling === "number" && subtype.date_ceiling < p2DateFloor;
  return disjointAbove || disjointBelow;
}

/** True when the piece reads as wood-primary (solid-wood construction markers
 * or any wood_species_* clue). Used to suppress metal-furniture care tips that
 * an incidental metal/glass clue would otherwise trigger. */
export function isWoodPrimary(clueKeys: Iterable<string>): boolean {
  const set = clueKeys instanceof Set ? clueKeys : new Set(clueKeys);
  const WOOD_PRIMARY_KEYS = [
    "solid_wood_construction",
    "solid_wood_secondary_underframe",
    "softwood_secondary_wood",
    "solid_plank_back",
    "solid_plank_drawer_bottom",
  ];
  return (
    WOOD_PRIMARY_KEYS.some((k) => set.has(k)) ||
    // Wood species, veneer over a wood substrate, or a named secondary wood all
    // mean the piece is wood — a veneered burl-walnut escritoire is wood-primary
    // even with no "solid_wood_construction" key (T2a).
    Array.from(set).some(
      (k) =>
        k.startsWith("wood_species_") ||
        k.startsWith("secondary_wood") ||
        k.endsWith("_veneer")
    )
  );
}

/** Metal-FRAME material keys that imply a metal-structured piece (a brass bed, a
 * tubular-steel modernist frame). On a wood-primary piece these are false twins
 * of incidental metal — brass hinges read as `brass_frame`, an enameled-steel
 * basin read as `tubular_steel` — and they wrongly drive form/style/value
 * (audit: Victorian commode repeatedly mis-scored "Brass bed" / "Modernist /
 * chrome-frame", inflating value ~3x). */
const FALSE_TWIN_FRAME_MATERIALS = new Set<string>([
  "brass_frame",
  "tubular_steel",
  "chrome_frame",
  "metal_frame",
]);

/** Given a piece's clue keys, return the false-twin metal-frame keys that should
 * be suppressed because the piece is wood-primary (so a metal FRAME is
 * impossible). Empty when the piece is not wood-primary — a genuine brass bed or
 * tubular-steel chair has no solid-wood markers, so its frame keys survive. */
export function falseTwinMaterialsToSuppress(clueKeys: Iterable<string>): string[] {
  const set = clueKeys instanceof Set ? clueKeys : new Set(clueKeys);
  if (!isWoodPrimary(set)) return [];
  return [...set].filter((k) => FALSE_TWIN_FRAME_MATERIALS.has(k));
}

/** The model coins many synonymous clue-key names for the same feature across
 * runs (commode_function / commode_chamber_pot_function / commode_close_stool_function).
 * Collapsing them to one canonical key — applied at the single normalization hook
 * every consumer routes through — stops hint-bearing keys from appearing and
 * vanishing on phrasing alone, and lets form/date routing fire regardless of which
 * synonym was emitted. Only unambiguous synonyms are mapped; generic terms
 * (e.g. vertical_supports) are intentionally left alone. Keys are already
 * slug-normalized (lowercase, underscores) before lookup. */
export const CLUE_KEY_ALIASES: Record<string, string> = {
  // commode / close-stool identity (the substring detector in
  // commodeEvidencePresent is the robust path; these aliases only dedupe the
  // observed synonyms for a tidier clue set)
  commode_chamber_pot_function: "commode_function",
  commode_close_stool_function: "commode_function",
  commode_close_stool_form: "commode_function",
  close_stool_function: "commode_function",
  chamber_pot_cabinet: "commode_function",
  victorian_utilitarian_commode_form: "victorian_commode_form",
  victorian_utilitarian_commode: "victorian_commode_form",
  victorian_utility_commode: "victorian_commode_form",
  circular_aperture_cutout: "circular_aperture_seat_board",
  circular_cutout_platform: "circular_aperture_seat_board",
  circular_cutout_interior: "circular_aperture_seat_board",
  // enameled-steel basin / insert
  enameled_steel_insert: "enameled_steel_basin",
  enameled_ware_chamber_pot: "enameled_steel_basin",
  enameled_ware_insert: "enameled_steel_basin",
  enameled_ware_white_blue_rim: "enameled_steel_basin",
  enameled_ware_white_basin: "enameled_steel_basin",
  // dated brass bracket plate (recovers the recognized post-1900 key)
  brass_lid_catch_or_bracket: "stamped_metal_bracket",
  // maker-label text (recovers the recognized visible_text key)
  visible_text_us_standard: "visible_text",
  visible_text_label: "visible_text",
  label_text_full: "visible_text",
  // turned bun feet
  turned_bun_feet: "bun_feet",
  turned_bun_foot_style: "bun_feet",
  // post-top finials
  turned_finial_post_tops: "turned_finials_on_posts",
  corner_post_tenon_tops: "turned_finials_on_posts",
};

/** Map a slug-normalized clue key through the alias table; passthrough when no
 * alias exists. */
export function canonicalClueKey(key: string): string {
  return CLUE_KEY_ALIASES[key] ?? key;
}

/** Chamber-pot commode / close-stool signature. The model coins a new synonym
 * for the function/form key almost every run (commode_function,
 * commode_close_stool_form, commode_chamber_pot_function, chamber_pot_cabinet,
 * victorian_commode_form, ...), so this matches the stable word STEMS as
 * substrings rather than exact keys — that is what makes it robust to the
 * run-to-run vocabulary drift that an exact alias table cannot keep up with. */
export function commodeEvidencePresent(clueKeys: Iterable<string>): boolean {
  const set = clueKeys instanceof Set ? clueKeys : new Set(clueKeys);
  const joined = [...set].join(" ");
  // "commode" / "close stool" / "chamber pot" are highly specific to this form
  // and appear in the function or form key of every observed scan.
  if (/commode|close[_ ]?stool|chamber[_ ]?pot/.test(joined)) return true;
  // Corroborating structural fallback: a circular aperture/cutout cut to receive
  // a basin (the defining feature), even if no commode-word key was emitted.
  if (
    /circular[_ ](aperture|cutout|hole|opening)/.test(joined) &&
    /basin|seat|chamber|interior_floor/.test(joined)
  ) {
    return true;
  }
  return false;
}
