# Style Family Authoring Template — Louis XVI / French Neoclassical

**Goal:** Add 1 new StyleFamilyEntry + 2-3 StyleRevivalWaveEntry entries to
`lib/constraints/styleFamilies.ts` covering the Louis XVI / French Neoclassical
gap surfaced during Block 7 verification.

**Where to insert in the file:**
- StyleFamilyEntry goes inside `STYLE_FAMILIES` array. Logical alphabetical
  position is after `style_family_hollywood_regency` and before
  `style_family_jacobean` (or wherever you prefer — array order doesn't affect
  engine behavior, just readability).
- StyleRevivalWaveEntry entries go inside `STYLE_REVIVAL_WAVES` array. Logical
  position is grouped with the parent family.

**What stays mechanical (already filled in below):**
- `id`, `category`, `assessment_layer`, authority values, `maker_associations`
- Field structure / TypeScript shape

**What needs your appraiser knowledge (marked `[FILL IN]`):**
- `name`: the canonical display name
- `indicator_text`: 1-2 sentence summary with date hint
- `family_description`: 1-sentence description of the style
- `core_visual_identity`: longer prose describing visual markers
- `period_associations`: original-period date range(s)
- `original_emergence_summary` / `original_conclusion_summary`: dates
- `canonical_source_aliases`: alternate names the LLM or user might use
- For each revival wave: dates, traits, contrast, design subtleties

---

## 1. StyleFamilyEntry — paste into STYLE_FAMILIES array

```typescript
  {
    id: "style_family_louis_xvi_french_neoclassical",
    category: "style_family",
    positive_authority: 4,
    hard_negative_authority: 4,
    indicator_text: "[FILL IN: 1-2 sentences. Example: 'Refined French neoclassicism — tapered fluted legs, parquetry veneer, stringing inlay, ormolu mounts, brass foot sabots, restrained classical proportions; c.1770-1810.']",
    notes: "Per Block 7 canonical authoring — Louis XVI / French Neoclassical gap surfaced during Toledo/cylinder-desk verification scan. The LLM identifies pieces with French neoclassical vocabulary (ormolu mounts, brass sabots, tapered fluted legs, parquetry) but no canonical family existed to attribute to; engine fell back to mcm_structural_pattern. 4/4 per D-SW41-6 uniform authority convention. canonical_source_aliases per D-SW41-11.",
    name: "[FILL IN: canonical display name, e.g., 'Louis XVI / French Neoclassical']",
    family_description: "[FILL IN: 1 sentence. Example: 'The French neoclassical style of the late 18th century — drawn from antique Greek and Roman sources, with restrained ornament, tapered fluted legs, and refined ormolu mounts.']",
    core_visual_identity: "[FILL IN: longer prose. Example: 'Restrained classical proportions; tapered fluted or reeded legs; parquetry and marquetry veneers; stringing and banding inlay; ormolu (gilt-bronze) mounts; brass foot sabots; cylinder roll-top desks (bureau à cylindre); guilloché, laurel, and rosette motifs; satinwood, kingwood, and tulipwood veneers; restrained urn and swag motifs distinct from the heavier Empire vocabulary that followed.']",
    period_associations: [
      { period_label: "[FILL IN: e.g., 'Original Louis XVI period']", date_floor: 1770, date_ceiling: 1810 },
      // Add a second period_associations entry if there was an overlap period worth flagging.
    ],
    original_emergence_summary: "Original emergence: c. [FILL IN: e.g., 1770]",
    original_conclusion_summary: "Original conclusion: c. [FILL IN: e.g., 1810, terminating with the French Empire period]",
    assessment_layer: "style_and_waves",
    canonical_source_aliases: [
      // Add aliases for what the LLM or user might call this style.
      // Pattern: each alias becomes a token the engine matches against
      // observation text. Specific tokens (uncommon to other families)
      // outweigh generic tokens (like "french" or "neoclassical").
      "Louis XVI",
      "French Neoclassical",
      "Bureau à Cylindre",
      // "[FILL IN: add appraiser-known additional aliases]"
    ],
    maker_associations: [],
  },
```

---

## 2. StyleRevivalWaveEntry — paste into STYLE_REVIVAL_WAVES array

**How many revival waves?** Look at Federal (5 waves) as the upper-bound; most
families have 2-3. Each wave is a distinct re-emergence period with its own
design character. Common Louis XVI revival waves to consider:

- **Wave 1 (typical c. 1870-1910)**: Centennial / Beaux Arts French Revival —
  matched-suite French-style dining and parlor pieces; ormolu-rich
- **Wave 2 (typical c. 1900-1930)**: Academic French Revival — museum-inspired,
  more restrained reproduction
- **Wave 3 (typical c. 1950-present)**: Mid-century-to-modern reproduction —
  factory-produced French-style pieces sold via department stores and online
  marketplaces (this is what Mike suspects the cylinder desk actually is)

Adjust count/dates per your knowledge. Template below is for one wave; duplicate
the block for each additional wave.

```typescript
  {
    id: "style_revival_wave_[FILL IN: short_snake_case_wave_name, e.g., 'centennial_louis_xvi_revival']",
    category: "style_revival_wave",
    positive_authority: 3,
    hard_negative_authority: 3,
    indicator_text: "[FILL IN: e.g., 'Centennial French Revival Louis XVI (c. 1870–1910): Matched-suite ormolu-rich parlor and dining pieces; tapered fluted legs and parquetry veneers in industrial-grade reproduction.']",
    notes: "Per Styles_and_Waves authoring — Block 7 Louis XVI canonical authoring. design_subtleties decomposed from canonical Traits + Contrast prose. Authority 3/3 uniform per D-SW41-6 + Q6=O.",
    name: "[FILL IN: canonical wave name, e.g., 'Centennial French Revival Louis XVI']",
    parent_style_id: "style_family_louis_xvi_french_neoclassical",
    wave_number: 1,
    date_floor: [FILL IN: e.g., 1870],
    date_ceiling: [FILL IN: e.g., 1910],  // Omit this line entirely if wave runs to present
    traits_summary: "[FILL IN: 1 sentence describing what THIS wave looks like. Example: 'Matched-suite parlor and dining French-style pieces, factory-grade ormolu mounts, parquetry veneers, tapered fluted legs.']",
    contrast_summary: "[FILL IN: how this wave differs from the original or prior wave. Example: 'Contrast from original Louis XVI period: more industrial production, heavier ormolu, less hand-fitting; veneer instead of solid hardwood substrates.']",
    design_subtleties: [
      // Each subtlety is one observation in one aspect category.
      // Aspect enum (must be one of these — see DesignSubtlety interface):
      //   massing_and_proportion, line_and_silhouette, carving_character,
      //   leg_and_foot_vocabulary, ornament_and_motif, surface_and_finish,
      //   material_palette, construction_expression, hardware_character
      { aspect: "ornament_and_motif",        signal: "[FILL IN: e.g., 'ormolu mounts heavier and factory-cast']", weight: "low" },
      { aspect: "leg_and_foot_vocabulary",   signal: "[FILL IN: e.g., 'tapered fluted legs with brass foot sabots']", weight: "low" },
      { aspect: "surface_and_finish",        signal: "[FILL IN: e.g., 'parquetry veneer panels with cross-banding']", weight: "low" },
      { aspect: "construction_expression",   signal: "[FILL IN: e.g., 'factory matched-suite production']", weight: "low" },
      // Add more subtleties as your appraiser knowledge warrants. 3-6 per wave is typical.
    ],
    assessment_layer: "style_and_waves",
  },
```

---

## What happens after you populate

1. You commit the populated file (or paste the entries to me and I'll do the
   commit + push)
2. Engine immediately recognizes the new family via Block 2a style attribution
   token matching (no engine code changes needed)
3. Engine recognizes the new revival waves via Block 2b style-wave aggregator
   (no engine code changes needed)
4. Re-scan the cylinder desk: should now attribute to Louis XVI Revival
   instead of MCM; the dating-overlap viz's "Style attribution" + "Style wave"
   rows will show 1770-1810 (original) + revival period(s)
5. The form-id (Cylinder vs Secretary) still won't be fixed — that's Block 7b2
   work on scoreForms ranking

---

## Scope guard

**IN scope for this template:**
- 1 new StyleFamilyEntry: Louis XVI / French Neoclassical
- 2-3 StyleRevivalWaveEntry entries for that family

**OUT of scope (don't expand without discussing):**
- Adding other missing style families (Empire, Biedermeier, Egyptian Revival,
  etc.) — those go in separate canonical authoring blocks
- Modifying existing entries (Federal, Sheraton-as-alias, etc.) — leave alone
- Touching any engine code — that's Block 7b1/b2/b3
- Adding maker_associations content — per D-SW41-9, leave as `[]`
