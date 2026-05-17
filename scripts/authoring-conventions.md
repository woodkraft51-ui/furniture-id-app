# Authoring Conventions (extracted from existing canonical libraries)

Established patterns across the canonical evidence libraries as of
2026-05-17. Use this as the discipline reference when authoring new
content into existing or new entry fields (in particular the Block 18
upholstery gaps: `wear_characteristics`, `cousin_contrasts`,
`regional_persistence_notes`, `related_form_types`).

Scope: `lib/constraints/forms.ts`, `joinery.ts`, `fasteners.ts`,
`finish.ts`, `hardware.ts`, `toolmarks.ts`, `woodEvidence.ts`,
`woodIdentification.ts`, `styleFamilies.ts`, `upholsteryCovers.ts`,
`upholsteryConstruction.ts`, with cross-checks in `makerMarks.ts`,
`spatialBehaviors.ts`, `families.ts`, `constructionLogic.ts`,
`entryShape.ts`.

## Dating conventions

### Open-ended "present-day" ranges

Two established conventions exist; both are valid, but they are NOT
interchangeable. Choose by field type.

**Convention A — structured `PeriodAssociation` / `StyleAssociation`
entries: OMIT `date_ceiling`.**

This is canonically documented in `entryShape.ts` lines 136-138, 149-151:
> The `date_ceiling?` omitted-means-present convention is durable across
> audit-log generations and avoids the year drift that a fixed sentinel
> (e.g., 2026) would introduce.
> "Latest year the period applies. Optional; omitted means the period
> extends to present."

Examples (all libraries):
- `upholsteryCovers.ts:577` — `{ period_label: "Continuous use", date_floor: 1600, usage_notes: "..." }` (Linen)
- `upholsteryCovers.ts:607` — `{ period_label: "Continuous use", date_floor: 1700, usage_notes: "..." }` (Cotton)
- `upholsteryCovers.ts:742` — `{ period_label: "Industrial mechanized era", date_floor: 1800, usage_notes: "..." }` (Jacquard)
- `upholsteryConstruction.ts:576` — `{ period_label: "Colonial Revival and reproduction slip-seat use", date_floor: 1880 }`
- `upholsteryConstruction.ts:648` — `{ period_label: "Traditional woven webbing era", date_floor: 1700 }`
- `fasteners.ts:452-454` — `{ period_label: "Specialty persistence", date_floor: 1900, usage_notes: "Persisted in specialty uses later per seed." }`
- `woodEvidence.ts:2024` and `joinery.ts:1667-1733` use `date_ceiling: 2030` as a sentinel — but these are minority pre-convention holdovers (~20 instances across the codebase) and should NOT be followed for new authoring per the `entryShape.ts` lock.

**`date_ceiling: null`, `date_ceiling: 9999`, and `date_ceiling: 2025/2026`
do not appear at all** (0 occurrences across all canonical files).
**`date_ceiling: 2030`** appears 21 times — treat as legacy, not pattern.

**Convention B — narrative `date_range_summary` / prose fields: write
"to present" in words.**

`date_range_summary` is consistently authored as prose (a sentence
fragment, ending with a period). Open-ended ranges are spelled out:
- `"1600 to present, strongest in early domestic, slip, underlayer, and reproduction contexts."` (Linen, line 579)
- `"1700s to present, expanding strongly in the 19th century."` (Cotton, line 609)
- `"1600s to present, strongest 17th to 19th century and revival/reproduction use."` (Wool, line 640)
- `"1600s to present; especially formal 18th, 19th, and revival upholstery."` (Velvet)
- `"1700s to present."` (linen/hemp/jute webbing, line 650) — even a one-clause prose form is fine.

The phrase `to present` appears 38 times in `upholsteryConstruction.ts`
and 65 times in `upholsteryCovers.ts`. No `–present`, `-present`, or
numeric sentinel ever appears in narrative date_range_summary fields in
the upholstery libraries.

### Date-range strings in narrative fields

**Conflict across libraries.** Three patterns coexist:

1. **En-dash with `c.` prefix** — used by `fasteners.ts` (33 occurrences)
   and `joinery.ts` (38 occurrences):
   - `"c. 1600–1830 primary dominance. Rural persistence into late 19th century."`
   - `"c. 1790–1900 primary dominance."`
   - `"Introduced c. 1880s. Dominant by c. 1895–1910 onward."`

2. **ASCII hyphen, no `c.` prefix** — used by `hardware.ts`:
   - `"Early examples 1680-1780; Federal/Hepplewhite wave 1780-1820; ..."`
   - `"1840-1930 primary. Continued limited use afterward."`

3. **Word-form "X to Y" / "X to present"** — used uniformly by
   `upholsteryCovers.ts` and `upholsteryConstruction.ts`. ZERO en-dash
   in these files; all ranges are written as prose.

**For new upholstery authoring, follow Convention 3 (prose "X to Y" /
"X to present") in `date_range_summary` and `regional_persistence_notes`.**
Inside `indicator_text` and `notes`, the ASCII hyphen form
(`1600s-present`, `mid-1800s-early 1900s`) is established and used
heavily (32+ instances of `1600s-present`, etc.).

### Decade and century formats

Decade format: `1880s`, `1830s`, `1920s`, `late 1700s`, `mid-1800s`,
`early 1900s`. Never `1880's` (zero occurrences). Never `the 1880s`
in canonical prose either (rare; appears mostly in narrative context).

Century format — **inconsistent within upholstery**:
- `19th century` (space): 20 in upholsteryCovers, 12 in upholsteryConstruction
- `19th-century` (hyphenated): 10 in upholsteryCovers, 3 in upholsteryConstruction
- `20th century` (space): 29 / 30 split roughly evenly
- The space-form is the majority. Word forms (`nineteenth century`) never appear.

Heuristic from observed use: hyphenate when the century word is acting
as a compound adjective immediately preceding a noun
(`19th-century interiors`); leave it open otherwise (`strongest 17th to
19th century`).

### period_associations conventions

Structure (from `entryShape.ts` `PeriodAssociation`):
- `period_label`: REQUIRED, human-authored, sourced verbatim from
  canonical "Common Time Periods" / chronological-breakdown content
  where possible. Sentence-case prose: `"Pre-spring slip-seat era"`,
  `"Continuous use"`, `"Industrial mechanized era"`,
  `"Colonial Revival and reproduction slip-seat use"`,
  `"Specialty persistence"`.
- `date_floor`: REQUIRED, numeric year (e.g., `1600`, `1880`).
- `date_ceiling`: OPTIONAL, omit for open-ended-to-present windows.
- `usage_notes`: OPTIONAL, appraiser-voice prose. Per `entryShape.ts`
  line 154-155: "Omit unless adding value beyond `period_label`." When
  present, usage_notes are short complete sentences ending with a
  period, capitalized: e.g., `"17th to 19th century elite seating."`

Style associations follow the same shape; `date_floor` is OPTIONAL on
`StyleAssociation` (unlike `PeriodAssociation`).

## Vocabulary conventions

### Capitalization

**`name` field — library-dependent.**
- Title Case: `joinery.ts`, `fasteners.ts`, `hardware.ts`,
  `upholsteryCovers.ts`, `upholsteryConstruction.ts`, `styleFamilies.ts`,
  `toolmarks.ts`, `makerMarks.ts`, `woodEvidence.ts`. Examples:
  `"Linen"`, `"Velvet"`, `"Hand-Forged Nails"`, `"Mortise-and-Tenon Family"`,
  `"Hand-Tied Coil Springs"`, `"Wool Broadcloth, Worsted, and Serge"`.
- Lowercase: `woodIdentification.ts` (species: `"oak"`, `"ash"`,
  `"walnut"`, `"cherry"`, `"maple"`) and `forms.ts` (forms: `"washstand"`,
  `"sideboard"`, `"highboy"`, `"chest of drawers"`). These are
  established library-internal conventions; do not change them.
- Sentence case: `finish.ts` (`"Natural finishes"`, `"Shellac crazing"`,
  `"Polyurethane finish"`).

**For new upholstery authoring: `name` is Title Case (already
established).**

**Material/fabric terms in prose (description, notes, indicator_text,
identifying_characteristics):**
- Lowercase in mid-sentence: `"velvet, plush, mohair velvet, velour"`
  (line 348); `"chintz, ticking, muslin"` (line 604); `"hand cane",
  "natural rush"`.
- Capitalized when the term is functioning as a defined name/heading,
  not a noun: `"Velvet has cut pile. Velour usually has a knit..."`
  (cousin-contrast prose, line 189-190).
- Standard English prose rules apply — no special canonical override.

### Hyphenation

These compounds are LOCKED in current usage (no variants found):
- `horsehair` (one word, lowercase in prose) — 31 + 17 occurrences.
  Never `horse hair`, never `horse-hair`.
- `nailhead` (one word) — 7 hardware + 16 upholsteryConstruction.
  Never `nail-head`.
- `hand-tied` (hyphenated) — 17 occurrences. Never `hand tied`.
- `hand-tack` / `hand-tacked` (hyphenated) — 8 occurrences.
- `hand-sewn` (hyphenated).
- `hand-stitched` (hyphenated).
- `slip-cover` (hyphenated noun phrase) — used in upholsteryCovers.
  Note: forms with `slip seat` (two words, no hyphen) when describing
  the seat construction itself, e.g., `"Stuffed Slip Seat"`.
- `slubbed`, `crisp hand`, `pile loss`, `pile-construction`
  (compound-adjective hyphenated when prenominal).

### Style-name spelling

In upholstery libraries, these spellings are CANONICAL:
- `Arts and Crafts` (spelled out, NOT `Arts & Crafts`). All 14
  occurrences in `upholsteryCovers.ts` use the spelled-out form. The
  ampersand form is heavily used elsewhere (joinery, makerMarks,
  woodEvidence, etc.) — this is a real cross-library inconsistency, but
  for new upholstery authoring stay with the established
  `Arts and Crafts` form.
- `Mid-Century Modern` (hyphenated, Title Case)
- `Hollywood Regency`
- `Colonial Revival`
- `Eastlake` (always Title Case in style_label fields; the 19
  lowercase `eastlake` instances elsewhere are all inside
  `id:` strings, e.g., `"style_eastlake_..."`)
- `Renaissance Revival`, `Rococo Revival`, `Gothic Revival`,
  `Victorian Revival`, `Jacobean Revival`, `Medieval Revival` —
  consistent two-word Title Case.
- `Empire`, `Federal`, `Mission`, `Shaker`, `Aesthetic Movement`,
  `Art Deco`, `Spanish Colonial`, `California Mission`,
  `French Provincial Revival`, `Cottage`, `Contemporary`.

## Structural conventions

### Required vs optional fields per library

`CanonicalEntry` base (entryShape.ts) — REQUIRED on every entry:
`id`, `category`, `positive_authority`, `hard_negative_authority`.

`UpholsteryCoverTypeEntry` REQUIRED (per upholsteryCovers.ts ~line 170):
`id`, `category`, `positive_authority`, `hard_negative_authority`,
`indicator_text`, `name`, `parent_category_id`, `description`,
`unique_traits`, `identifying_characteristics`, `period_associations`,
`date_range_summary`, `replacement_likelihood`.

`UpholsteryConstructionTypeEntry` REQUIRED: parallel set —
`indicator_text`, `name`, `parent_category_id`, `description`,
`unique_traits`, `identifying_characteristics`, `period_associations`,
`date_range_summary`, `replacement_likelihood`.

OPTIONAL on both upholstery types (target fields for Block 18 authoring
in **bold**):
- `notes`
- **`wear_characteristics?: string[]`** (Block 17 addition; not yet populated on any upholstery entry)
- **`cousin_contrasts?: string[]`** (Block 17 addition; not yet populated)
- `style_associations?: StyleAssociation[]`
- `maker_associations?: UpholsteryCoverMakerAssociation[]` — currently
  authored as **empty array `[]`** on every entry (152 occurrences:
  89 covers + 63 construction). Per D-UC37-6
  SCHEMA-PRESENT-CONTENT-DEFERRED. Keep the `maker_associations: []`
  line on new authoring; do not delete it.
- `common_observed_locations?: PhysicalLocation[]`
- `anti_classification_guidance?` (typically only on AG-anchor entries
  like elastic webbing 1940 AG floor)
- **`regional_persistence_notes?: string`** (only ~8 cover entries
  currently populated — cotton, natural_rush, splint_seat, shaker_tape,
  rawhide_leather_lacing on covers; tow, spanish_moss, stuffed_over_the_rail
  on construction)
- `related_cover_types?: string[]`, `related_construction_types?`,
  `related_hardware_types?`, `related_fastener_types?`,
  **`related_form_types?: string[]`** (Block 17 addition; not yet populated)

### Systematically-empty fields (authoring debt vs intentional)

**Authoring debt** (the Block 18 gap fields — should be populated when
canonical source has content for them):
- `wear_characteristics`: 0/75 upholstery entries populated.
- `cousin_contrasts`: 0/75.
- `related_form_types`: 0/75.
- `regional_persistence_notes`: ~8/75 populated.

**Intentional (schema-present-content-deferred per D-UC37-6):**
- `maker_associations: []` on every upholstery entry — empty array is
  intentional. Do NOT remove the field declaration; do NOT populate
  unless adding validated textile-manufacturer attribution.

## Inconsistencies found

1. **Date-range punctuation across libraries.** fasteners + joinery use
   en-dash with `c.` prefix; hardware uses ASCII hyphen; upholstery
   uses pure prose. Risk: copying a fasteners-style
   `"c. 1880–1920"` into an upholstery `date_range_summary` would break
   the upholstery prose convention.

2. **Open-ended ceiling: `date_ceiling: 2030` legacy vs omitted-ceiling
   convention.** 21 entries (finish, hardware, joinery, toolmarks,
   woodIdentification, woodEvidence) still use the `2030` sentinel; the
   `entryShape.ts` canonical lock (line 136-138) explicitly says to OMIT.
   For new authoring, omit. Do not propagate the `2030` legacy.

3. **`Arts and Crafts` vs `Arts & Crafts`.** Upholstery (14×) and
   styleFamilies (28×) spell it out; joinery (17×), makerMarks (25×),
   woodEvidence (28×), woodIdentification (16×) use the ampersand.
   For new upholstery authoring, use the spelled-out form.

4. **Century compound: `19th century` vs `19th-century`.** Both forms
   appear in roughly 2:1 ratio in upholstery. Apply the prenominal-
   compound-adjective heuristic.

5. **`name` capitalization.** Title Case in most libraries; lowercase
   in `woodIdentification.ts` (species) and `forms.ts` (forms);
   sentence case in `finish.ts`. Do not "fix" the lowercase species or
   form names — they're established library-internal conventions.

6. **`styleFamilies.ts:3206`** uses `date_ceiling: 2025` (one-off
   bug-shaped value; not a pattern).

## Recommended discipline for new authoring

Top-3 priorities for the Block 18 upholstery gap-fill:

1. **Match the upholstery prose convention for dates.** In any
   narrative field (`date_range_summary`, `regional_persistence_notes`,
   `usage_notes`, `wear_characteristics` items, `cousin_contrasts`
   items): write "X to present", "1700s to present, strongest in...",
   "17th to 19th century". Do NOT use en-dash, do NOT use `c. ` prefix,
   do NOT use `date_ceiling: 2030`.

2. **Omit `date_ceiling` on `PeriodAssociation` / `StyleAssociation`
   entries with open-ended-to-present ranges.** Per the `entryShape.ts`
   canonical lock. Do not write `date_ceiling: null`, `date_ceiling: 9999`,
   or `date_ceiling: 2030`.

3. **Use the established style-name spellings and compound hyphenation:**
   `Arts and Crafts` (not `&`), `Mid-Century Modern`, `Colonial Revival`,
   `horsehair`, `nailhead`, `hand-tied`, `hand-sewn`, `hand-tack`,
   `slip-cover` (noun), `Stuffed Slip Seat` (proper-noun construction name).

Additional discipline:

4. **Authoring shape for the four Block 18 gap fields:**
   - `wear_characteristics: string[]` — each item a short noun-phrase
     observation, matching the casing of existing `identifying_characteristics`
     items (sentence-fragment, capitalized first word, no terminal period).
     Example shape: `"Crushed pile on seat and arm tops"`,
     `"Pile loss along leading edge"`. Source from canonical "Identifying
     elements" wear-side content.
   - `cousin_contrasts: string[]` — each item a complete sentence,
     capitalized, ending with a period. Pattern from the entryShape.ts
     docstring: `"Velvet has cut pile."` / `"Velour usually has a knit or
     softer modern hand."` / `"Plush has a longer pile."` — i.e., one
     contrast claim per array item.
   - `regional_persistence_notes: string` — a single string (NOT an
     array) of one to three sentences. Existing pattern uses the suffix
     `"...per canonical-source verbatim reference."` and references
     `Rule #3 rural_persistence` when applicable. Example template:
     `"Strong in [region(s)] per canonical-source verbatim reference.
     [Material/method] carried forward through [persistence vector] into
     [end period]; persistence pattern reinforces Rule #3
     rural_persistence canonical anchor."`
   - `related_form_types: string[]` — each item is a `forms.ts` id
     (e.g., `"form_chair_side_chair"`, `"form_sofa"`). Cross-reference
     `forms.ts` for valid id strings. Use lowercase ids matching
     forms.ts naming convention.

5. **Update the `notes` field with the same accountability sentence
   established by every existing entry.** Pattern:
   `"Per American_Furniture_Textile_Reference.docx [section path]
   (paragraphs N-M). [authority] per [decision ref]. [population
   rationale]. maker_associations: [] per D-UC37-6."` When adding the
   four Block 18 fields, add one sentence per field documenting source
   paragraph and the D-UC38-9 strict-canonical-fidelity discipline.

6. **Preserve `maker_associations: []` exactly as-is.** Do not delete,
   do not populate, do not annotate.

7. **Keep field order consistent with existing entries:** `id`,
   `category`, `positive_authority`, `hard_negative_authority`,
   `indicator_text`, `notes`, `name`, `parent_category_id`,
   `description`, `unique_traits`, `identifying_characteristics`,
   **`wear_characteristics`**, **`cousin_contrasts`**,
   `period_associations`, `date_range_summary`, `style_associations`,
   `maker_associations`, `common_observed_locations`,
   `anti_classification_guidance`, `replacement_likelihood`,
   `regional_persistence_notes`, `related_cover_types`,
   `related_construction_types`, `related_hardware_types`,
   `related_fastener_types`, **`related_form_types`**.
