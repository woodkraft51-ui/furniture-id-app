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
    Array.from(set).some((k) => k.startsWith("wood_species_"))
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
