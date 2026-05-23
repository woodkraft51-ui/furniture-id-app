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

/** True when a subtype's own production window is fully disjoint from the
 * computed frame dating (so it cannot coexist with the date and should be
 * dropped). Requires all four bounds to be real numbers. */
export function subtypeDisjointFromDating(
  subtype: { date_floor?: number | null; date_ceiling?: number | null } | null | undefined,
  p2DateFloor: number | null | undefined,
  p2DateCeiling: number | null | undefined
): boolean {
  return (
    !!subtype &&
    typeof p2DateFloor === "number" &&
    typeof p2DateCeiling === "number" &&
    typeof subtype.date_floor === "number" &&
    typeof subtype.date_ceiling === "number" &&
    (subtype.date_ceiling < p2DateFloor || subtype.date_floor > p2DateCeiling)
  );
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
