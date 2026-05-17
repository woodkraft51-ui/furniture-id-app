# Engine Consumability Spec

What the engine's parsers, text-matchers, and canonical-field readers will
actually consume. Anything authored that doesn't match these formats /
fields sits invisible to the engine.

Sources of truth (read-only scan, no source edits):
- `lib/engine.ts` — CLUE_LIBRARY, getClueMeta, detectClueFromText, normalizeClueKey
- `lib/engineClueResolver.ts` — parseRangeToNumeric, dateHintFor, getClueMetaFromCanonical, getCanonicalCautionText, getReplacementLikelihood, buildUpholsteryCanonicalAppendix
- `lib/engineCanonicalMap.ts` — CLUE_TO_CANONICAL, FORM_LABEL_TO_CANONICAL, CLUE_TO_ALTERNATIVES, KEPT_IN_ENGINE
- `lib/engineFormEvaluators.ts` — evaluateSubtype, evaluateAntiBackClassification, getFormDatingBoundaries, evaluateDimensional, getCommonAliasesForDisplay, evaluateHybridForm
- `lib/engineStyleEvaluator.ts` — attributeStyle, collectStyleSupportingEvidence, aggregateStyleWaves
- `lib/engineDatingOverlap.ts` — buildDatingOverlap

---

## 1. Date-range string parsers (`parseRangeToNumeric`)

Source: `engineClueResolver.ts:325-395`. Patterns are evaluated in this exact
order — the FIRST match wins, so authoring choices that put a bare year
ahead of a richer phrase will lose the richer parse.

### Accepted formats (in match order)

| # | Regex / pattern | Input example | Output `{floor, ceiling}` | Notes |
|---|-----------------|---------------|---------------------------|-------|
| 1 | `(\d{4})\s*[-–]\s*(\d{4})` | `"c. 1830-1870"`, `"c. 1830–1870"`, `"1700–1860"`, `"1885 - 1915"` | `{1830, 1870}` | Both hyphen `-` and en-dash `–` work. Leading `"c."`, `"ca."`, `"circa"` ignored — the regex finds the digits anywhere. Whitespace tolerated. |
| 2 | `post[-\s]+(\d{4})` (case-insensitive) | `"post-1934"`, `"post 1934"`, `"POST-1934"` | `{1934, null}` | Hyphen OR whitespace as separator. |
| 3 | `pre[-\s]+(\d{4})` (case-insensitive) | `"pre-1860"`, `"pre 1860"` | `{null, 1860}` | Same as above. |
| 4 | `(\d{3})0'?s\b` | `"1870s"`, `"1870's"` | `{1870, 1879}` | Curly apostrophe `’` is NOT accepted — only straight apostrophe `'`. `"1875s"` will NOT match (must end in `0`). |
| 5 | `(?:^\|\s)(?:c\.\|ca\.\|circa)\s*(\d{4})` (case-insensitive) | `"c. 1900"`, `"ca. 1900"`, `"circa 1900"`, `"Circa 1900"` | `{1890, 1910}` (±10y band) | Only fires when there's NO range hyphen (would have matched rule #1). The dot after `c`/`ca` IS required by the pattern. `"c 1900"` (no dot) will NOT match here — falls through to rule #8 bare-year (`{1895, 1905}`). |
| 6 | `(early\|mid(?:dle)?\|late)\s+(?:of\s+the\s+)?(\d{1,2})(?:st\|nd\|rd\|th)\s+c(?:entury\|\.)` (case-insensitive) | `"early 19th century"`, `"mid 20th c."`, `"middle of the 19th century"`, `"late 18th c."` | early → `{1800, 1830}`; mid → `{1830, 1870}`; late → `{1870, 1900}` | Phase phrase + ordinal + century-word. |
| 7 | `(\d{1,2})(?:st\|nd\|rd\|th)\s+c(?:entury\|\.)` (case-insensitive) | `"19th century"`, `"19th c."` | `{1800, 1900}` | Bare century. |
| 8 | `\b(\d{4})\b` (last resort) | `"1850"`, `"made in 1850"` | `{1845, 1855}` (±5y band) | Sanity-clamped to 1600 ≤ year ≤ 2050. Otherwise returns `{null, null}`. |

Empty / `null` / `undefined` input → `{null, null}`.

### Will NOT parse (returns `{null, null}` or wrong parse)

- **`"1885 to 1915"`** — no hyphen/en-dash. Falls to rule #8, returns `{1880, 1890}` (bare year on first match `1885`) — silently wrong.
- **`"1885–"`** or **`"–1915"`** (single-sided en-dash) — no second 4-digit year, fails rule #1; falls to bare-year rule with ±5y band.
- **`"1870’s"`** (curly apostrophe) — fails decade regex; falls to bare-year, returns `{1865, 1875}`.
- **`"1880s-1920s"`** — first `0s` matches rule #4 only if it precedes a word boundary. Here `1880s-` has `s-` then digits, so rule #4 fires on `1880s` → `{1880, 1889}` — misses the actual span.
- **`"between 1830 and 1870"`** — no hyphen/en-dash between the digits; falls to bare-year on `1830` → `{1825, 1835}`.
- **`"c. 1900s"`** — rule #4 matches FIRST (decade `1900s`) → `{1900, 1909}`, ignoring the circa-marker.
- **`"19c."`** / **`"C19"`** / **`"nineteenth century"`** — none of the patterns accept these; returns `{null, null}`.
- **`"Q4 1880"`** / **`"third quarter 19th c."`** — quarter phrase not recognized; bare-century may fire on the trailing piece for the latter, others fall to bare-year.
- **`"post 1934-1945"`** — rule #1 fires first on the digit pair, ignoring `post` → `{1934, 1945}`, which silently re-interprets an open-ended hint as closed.
- **`"1934+"`** / **`"after 1934"`** / **`"before 1860"`** — no match for the `+`/`after`/`before` forms; falls to bare-year `{1929, 1939}` etc.
- **`"1700-1800; revival 1880-1920"`** — rule #1 grabs the FIRST pair `{1700, 1800}` and stops; the revival range is invisible.

**Authoring rule:** Use `"c. YYYY–YYYY"` or `"YYYY-YYYY"` for ranges; `"post-YYYY"` / `"pre-YYYY"` for open-ended; `"YYYY's"` (straight apostrophe) for decades; period phrases as listed in row 6/7. Avoid `"to"`, `"between"`, curly apostrophes, multi-range strings, and the `"+"` / `"after"` / `"before"` shorthand.

---

## 2. Canonical field consumers

All canonical-entry reads in the engine. If a field is not listed here, **no
engine code consumes it** today — see §6.

### `getClueMeta` (`engine.ts:55`)

Composes from two sources and merges:
- **Canonical side**: calls `getClueMetaFromCanonical` (below).
- **Inline side**: looks up `CLUE_LIBRARY[clueKey]`.

Merge rules:
- Canonical wins when present. Inline only consumed for the `hardNegative` OR-merge and the tighter-of-the-two `dateHint`.
- `dateHint` chosen by `dateHintWidth(...)` — narrower wins; ties go to canonical.
- `hardNegative` is OR'd between sources (either flagging it makes it hard-negative).

### `getClueMetaFromCanonical` → `metaFromCanonical` (`engineClueResolver.ts:144-162`)

Reads from canonical entry:

| Field | Type expected | Used for | Missing behavior |
|-------|---------------|----------|------------------|
| `id` | string | index key (must match value in `CLUE_TO_CANONICAL`) | entry skipped from index |
| `category` | string | routes to engine `AUTHORITY_RANK` bucket via `engineCategoryFor` prefix-match (`joinery_*`, `fastener_*`, `toolmark_*`, `finish_*`, `hardware_*`, `substrate_evidence*`, `wood_species_evidence*`, `cut_grain_evidence*`, `upholstery_construction*`, `upholstery_cover*`) | falls through as raw string ("pass through unknown") |
| `positive_authority` | number 1–10 | divided by 10 to produce `weight` (0–1) | defaults to `5` → weight `0.5` |
| `hard_negative` | boolean (must be literal `true`) | sets `hardNegative` flag | undefined |
| `date_floor`, `date_ceiling`, `notes`, `period_associations` | see `dateHintFor` below | `dateHint` string | undefined |

**Note:** `hard_negative_authority` is NOT consumed — only the literal `hard_negative: true` flag.

### `dateHintFor` (`engineClueResolver.ts:67-141`)

Priority order:

1. **Both `entry.date_floor` AND `entry.date_ceiling` are numbers** → `"c. ${floor}–${ceiling}"` (en-dash).
2. **Only `entry.date_floor` is a number** → `"post-${floor}"`.
3. **Only `entry.date_ceiling` is a number** → `"pre-${ceiling}"`.
4. **`entry.notes` regex `/typical_date_range\s+"([^"]+)"/`** → use the quoted contents verbatim. (This is the HCL attribution marker convention preserved in `notes`.)
5. **`entry.period_associations` array** — branches on whether `entry.category` starts with `"upholstery_construction"` or `"upholstery_cover"`:
   - **Upholstery (Block 15 exception)**: scans ALL periods, picks the period with the **tightest closed span** (`date_ceiling - date_floor`). Falls back to first open-ended period if no closed period exists. Rationale: upholstery convention has `period[0]` = open-ended "continuous-use era" with the diagnostic window in `period[1+]`.
   - **Non-upholstery (Block 10b first-wins)**: takes `period_associations[0]`. Closed → `"c. floor–ceiling"`; open-ended → `"post-floor"` or `"pre-ceiling"`. If `[0]` has neither, falls back to scanning for tightest closed period across the array, then first open-ended.
6. Returns `undefined`.

**Field types required:** `period_associations` is `Array<{date_floor?: number; date_ceiling?: number; period_label?: string; ...}>`. The engine only inspects `date_floor` and `date_ceiling` — `period_label` and `usage_notes` are not consumed.

### `getCanonicalCautionText` (`engineClueResolver.ts:208-215`)

- **Reads:** `entry.diagnostic_caution_text` (string).
- Returns `null` if missing/empty or not a string.
- **CRITICAL nomenclature mismatch:** the shared `CanonicalEntry.caution_text` field in `entryShape.ts:69` is **NOT** read by this function. Only `diagnostic_caution_text` is consumed. Today only `woodEvidence.ts` entries populate `diagnostic_caution_text`; the `caution_text` populated on finish/joinery/hardware/toolmark/woodIdentification entries is **invisible to this consumer**.

### `getReplacementLikelihood` (`engineClueResolver.ts:225-235`)

- **Reads:** `entry.replacement_likelihood`.
- **Accepts (strict equality):** `"low"`, `"medium"`, `"high"` (lowercase only).
- **Anything else** (uppercase, `"Low"`, `"med"`, `"none"`, `0.5`, `"unknown"`, missing) → returns `undefined`.

### `buildUpholsteryCanonicalAppendix` (`engineClueResolver.ts:249-303`)

Called ONCE at module init (`engine.ts:8`). Iterates `CLUE_TO_CANONICAL` looking for canonical IDs prefixed `upholstery_construction` or `upholstery_cover`. Per matching entry, surfaces into the LLM system prompt:

| Field | Type | Surfaced as |
|-------|------|-------------|
| `name` | string | UPPERCASED header `"${NAME} (key: ${engineKey}):"` (falls back to `engineKey`) |
| `identifying_characteristics` | string[] | bullet `- ${c}` per entry. **If empty/missing, the whole entry is SKIPPED — name and wear/replacement won't surface either.** |
| `wear_characteristics` (Block 17) | string[] | bulleted under `"Wear / condition diagnostic markers:"`. Only surfaces if array has items. |
| `replacement_likelihood` | `"low"\|"medium"\|"high"` | annotated line (`"commonly replaced in reupholstery"` / `"durable, often survives reupholstery"` / `"moderate persistence"`). Other values silently dropped. |

**No other fields from the upholstery entry are surfaced to the LLM via this appendix.** `unique_traits`, `description`, `cousin_contrasts`, `style_associations`, `maker_associations`, `period_associations`, `regional_persistence_notes`, `anti_classification_guidance`, `common_observed_locations`, `related_*` arrays — all invisible.

### `attributeStyle` (`engineStyleEvaluator.ts:171-242`)

Reads from `STYLE_FAMILIES` entries:

| Field | Type | Use |
|-------|------|-----|
| `name` | string | tokenized (lowercased, hyphens→spaces, ≥3 chars, STOP_TOKENS removed) into matching set |
| `canonical_source_aliases` | string[] | tokenized same way; appended to matching set |
| `positive_authority` | number 1–10 | divided by 10 → 0–1 confidence multiplier (defaults to 0.5 if missing) |
| `period_associations` | `Array<{date_floor?, date_ceiling?}>` | scanned in `periodEnvelope`: min of all `date_floor`, max of all `date_ceiling` (UNION, not first-wins) |
| `id` | string | identity for results + competitive structural-pattern suppression lookup |

**STOP_TOKENS** (never matched against): `and`, `the`, `of`, `or`, `style`, `pattern`, `case`, `form`, `revival`, `movement`, `period`, `early`, `late`, `modern`, `american`, `century`, `antique`, `windsor`, `design`, `design's`, `designed`, `type`, `types`, `forms`, `wood`, `wooden`, `metal`, `fabric`, `general`, `generic`, `classic`.

Authoring a `canonical_source_aliases` value of `"American Federal Style"` contributes ZERO matching tokens (all three are stop tokens). Aliases need at least one non-stop, ≥3-char content word.

`collectStyleSupportingEvidence` reads NOTHING from canonical entries — only from the hardcoded `CLUE_STYLE_ASSOCIATIONS` map.

`aggregateStyleWaves` reads from `STYLE_REVIVAL_WAVES`:
- `id`, `name`, `parent_style_id`, `wave_number`
- `date_floor`, `date_ceiling` (top-level, NOT inside `period_associations`)
- `design_subtleties: Array<{signal: string}>` — tokenized like style names; ≥4-char tokens that survive STOP_TOKENS are matched against observation tokens.

### `getForm` / `evaluateSubtype` / `evaluateAntiBackClassification` / `getFormDatingBoundaries` / `evaluateDimensional` / `evaluateHybridForm` / `getCommonAliasesForDisplay` (`engineFormEvaluators.ts`)

Reads from `FORMS` `FormEntry`:

| Field | Type | Consumed by | Notes |
|-------|------|-------------|-------|
| `id` | string | index key | required |
| `name` | string | `evaluateHybridForm` (display) | falls back to `form_id` |
| `subtypes` | `FormSubtype[]` | `evaluateSubtype` | each subtype needs `id`, `name`, and `distinguishing_attributes: string[]` |
| `subtypes[].distinguishing_attributes` | string[] | `evaluateSubtype` | tokenized lowercase + split on non-alphanumeric; **only tokens of length ≥4** count. Confidence = matched_attrs / total_attrs. Must reach `≥0.65` floor. |
| `anti_classification_guidance` | `AntiClassificationGuidance \| AntiClassificationGuidance[]` | `evaluateAntiBackClassification`, `getFormDatingBoundaries` | single object normalized to array. Per-guidance reads: `boundary_date: number` (required), `boundary_type: "form_emergence" \| "form_extinction"` (strict), `guidance_text: string`, `pre_boundary_classifications?: string[]`, `post_boundary_classifications?: string[]`, `prominence: "prominent" \| "standard"` |
| `dimensional_thresholds` | `{height_min?, height_max?, width_min?, width_max?, ...}` | `evaluateDimensional` | only `height_min/max` and `width_min/max` are consumed; `depth_min/max`, `weight_min/max`, `notes` are NOT read by the evaluator. |
| `common_aliases` | string[] | `getCommonAliasesForDisplay` | strips `"(context)"` parenthetical, dedups (case-insensitive), top-N. |
| `secondary_form_associations` | string[] (form ids) | `evaluateHybridForm` | only surfaces when non-empty. |

**Form fields NOT read by these evaluators:** `parent_category`, `common_conversion_targets`, `distinguishing_features`, `regional_period_notes`, `cousin_form_contrasts`, `family_id`, `spatial_behavior_id`, `dimensional_thresholds.depth_*`, `dimensional_thresholds.weight_*`, `dimensional_thresholds.notes`, `date_floor`/`date_ceiling` on the form itself (the FORM layer in dating-overlap is fed by p2 result, not by the FormEntry top-level dates).

---

## 3. Text fallback matchers (`detectClueFromText`)

Source: `engine.ts:814-982`. `t = text.toLowerCase()`. Every match is `t.includes(substring)` via `includesAny`. **All substrings are matched case-insensitively against the lowercased input. Authoring with title-case is fine — the matcher lowercases first.** Order matters: earlier patterns shadow later ones.

A global negation guard runs first via `isNegated(phrase)` — checks for `"no ${phrase}"`, `"not ${phrase}"`, `"without ${phrase}"`, `"${phrase} not"`, `"absence of ${phrase}"`, `"no visible ${phrase}"`. Each clue line passes its OWN guard phrase, which usually differs from the substrings (e.g., guard `"hand-tied"` for the `hand_tied_coil_spring` line).

Also: if input contains `"not visible"`, `"not confirmed"`, `"cannot confirm"`, or `"unclear"` anywhere, function returns `null` immediately.

### Labels
- `roos_label` ← `roos`, `sweetheart cedar`
- `lane_label` ← `lane cedar`
- `maker_label` ← `maker label`, `manufacturer label`, `paper label`, `stamp`

### Function (high priority)
- `telephone_shelf` ← `telephone`, `phone shelf`, `telephone shelf` (negation guard `"telephone"`)
- `writing_surface` ← `writing surface`, `desk surface`
- `secondary_surface` ← `secondary surface`, `raised surface`

### Form
- `seating_present` ← `bench seat`, `integrated seat`, `seating`
- `backrest_present` ← `backrest`, `back rail`
- `drawer_present` ← `drawer` (any occurrence)
- `door_present` ← `door` (any occurrence)
- `cabriole_leg` ← `cabriole`
- `barley_twist` ← `barley twist`

### Form-defining (block 7b2)
- `cylinder_roll` ← `cylinder roll`, `cylinder lid`, `cylinder closure`, `tambour cylinder`, `bureau a cylindre`, `bureau à cylindre`, `cylindre`, `rolling cylinder`; OR bare `cylinder` (when input does not include `hydraulic`)
- `slant_front` ← `slant front`, `slant-front`, `slant top`, `slanted writing`
- `drop_leaf_hinged` ← `drop-leaf`, `drop leaf`, `hinged leaf`
- `gateleg_support` ← `gateleg`, `gate-leg`, `gate leg`
- `lift_lid` ← `lift lid`, `lift-lid`, `hinged top chest`, `blanket chest top`, `lift top`
- `extension_mechanism` ← `extension mechanism`, `extension table`, `leaf extension`
- `pedestal_column` ← `pedestal column`, `central pedestal`, `pedestal base`
- `drop_front_desk` ← `drop-front desk`, `drop front desk`, `drop-front writing surface`, `drop front writing`
- `pigeonholes` ← `pigeonhole`, `pigeon hole`, `interior cubbies`, `letter slot`

### Joinery
- `hand_cut_dovetails` ← `hand-cut dovetail`, `hand cut dovetail`, `irregular dovetail`
- `machine_dovetails` ← `machine-cut dovetail`, `machine cut dovetail`, `uniform dovetail`, `machine dovetail`; OR bare `dovetail` (conservative default fallback)
- `welded_joint` ← `welded`, `weld bead`, `weld joint`
- `dowel_joinery` ← `dowel joinery`, `dowel construction`, `dowel join`, `dowel peg`
- `mortise_and_tenon` ← `mortise and tenon`, `mortise-and-tenon`, `tenon joint`, `pegged tenon`

### Fasteners (specific before generic)
- `phillips_screw` ← `phillips screw`, `phillips-head`, `phillips head`, `cross-recess`
- `staple_fastener` ← `staple fastener`, `wire staple`, `structural staple`
- `hand_forged_nail` ← `hand-forged nail`, `hand forged nail`, `hammered nail head`, `forged nail`
- `cut_nail` ← `cut nail`, `tapered nail`, `rectangular nail`
- `wire_nail` ← `wire nail`, `round nail shank`
- `slotted_screw` ← `slotted screw`, `slotted-head screw`

### Toolmarks
- `pit_saw_marks` ← `pit-saw`, `pit saw`, `irregular diagonal saw`
- `circular_saw_arcs` ← `circular saw`, `circular-saw arc`, `saw arc`
- `band_saw_lines` ← `band saw`, `band-saw`
- `hand_plane_chatter` ← `hand-plane`, `hand plane`, `plane chatter`, `plane scallop`

### Finish (specific before generic)
- `polyurethane` ← `polyurethane`, `poly finish`, `plastic-like finish`
- `shellac_crazing` ← `shellac crazing`, `crazed shellac`, `shellac craze`
- `shellac_intact` ← `shellac`, `amber shellac` (note: `shellac crazing` already short-circuited above)
- `lacquer_finish` ← `lacquer finish`, `lacquered`, `lacquer`
- `painted_metal_finish` ← `painted metal`, `painted steel`, `enamel finish`, `sage green finish`, `industrial paint`
- `refinished_surface` ← `refinished`, `later refinish`, `modern refinish`

### Hardware
- `porcelain_caster` ← `porcelain caster`, `ceramic caster`
- `modern_caster` ← `caster wheel`, `rubber caster`, `modern caster`, `caster`
- `modern_concealed_hinge` ← `concealed hinge`, `european cup hinge`, `euro hinge`, `modern concealed`
- `swivel_mechanism` ← `swivel mechanism`, `swivel plate`, `swivel disc`, `rotating seat`
- `height_adjustment_mechanism` ← `height adjustment`, `height-adjustment`, `adjustable height`, `ratchet adjuster`, `pin adjuster`
- `stamped_metal_bracket` ← `stamped metal bracket`, `stamped bracket`, `stamped sheet metal`
- `decorative_bail_pull` ← `bail pull`, `swing pull`, `decorative pull`
- `round_wood_knob` ← `wooden knob`, `wood knob`, `turned knob`, `round wood knob`
- `lock_escutcheons` ← `escutcheon`, `keyhole plate`

### Upholstery (Block 12, most-specific first)
- `hand_tied_coil_spring` ← `hand-tied coil`, `hand tied coil`, `twine-tied spring`, `hand-tied spring`
- `marshall_pocket_coil` ← `marshall coil`, `pocket coil`, `pocketed coil`, `fabric-encased coil`
- `drop_in_spring_unit` ← `drop-in spring`, `drop in spring unit`, `drop-in cushion unit`
- `serpentine_spring` ← `serpentine spring`, `sinuous spring`, `zigzag spring`, `no-sag spring`, `no sag spring`
- `coil_spring` ← `coil spring`, `coil springs`, `metal coil under seat`
- `no_spring_seat` ← `no-spring seat`, `unsprung seat`, `stuffed without springs`
- `jute_webbing` ← `jute webbing`, `linen webbing`, `hemp webbing`, `natural-fiber webbing`, `natural fiber webbing`
- `elastic_webbing` ← `elastic webbing`, `rubber webbing`, `stretch webbing`, `pirelli webbing`
- `horsehair_stuffing` ← `horsehair stuffing`, `horse hair stuffing`, `curled hair stuffing`, `horsehair padding`
- `cotton_batting` ← `cotton batting`, `cotton padding`, `cotton wadding`
- `polyurethane_foam` ← `polyurethane foam`, `synthetic foam`, `yellow foam`, `memory foam`
- `foam_padding` ← `foam padding`, `foam cushion`, `latex foam`
- `feather_down_fill` ← `feather fill`, `down fill`, `feather and down`, `feather cushion`
- `button_tufting` ← `button tufting`, `deep buttoned`, `button-tufted`, `buttoned tufting`, `biscuit tufting`, `deep tufted`, `deeply tufted`, `tufted seat cushion`, `tufted back cushion`, `tufted cushion`
- `nailhead_trim` ← `nailhead trim`, `nail-head trim`, `decorative brass nails`, `brass tack trim`, `nailhead detailing`
- `hand_tacks` ← `hand tacks`, `hand-tacked`, `upholstery tacks`
- `upholstery_staple_construction` ← `upholstery staple`, `stapled fabric`, `fabric staples`
- `haircloth_cover` ← `haircloth`, `horsehair cloth`, `horsehair cover`, `horsehair fabric`
- `damask_cover` ← `damask cover`, `damask upholstery`, `damask fabric`
- `brocade_cover` ← `brocade cover`, `brocade upholstery`, `brocade fabric`
- `jacquard_cover` ← `jacquard cover`, `jacquard upholstery`, `jacquard weave`
- `velvet_cover` ← `velvet cover`, `velvet upholstery`, `velvet fabric`, `velvet pile`, `tufted velvet`
- `vinyl_cover` ← `vinyl cover`, `vinyl upholstery`, `naugahyde`, `faux leather`
- `leather_cover` ← `leather cover`, `leather upholstery`, `full grain leather`, `top grain leather`
- `chintz_cover` ← `chintz cover`, `chintz upholstery`, `chintz fabric`
- `needlepoint_cover` ← `needlepoint cover`, `needlework cover`, `needlepoint upholstery`

### Wood / substrate (plywood detection priority)
- `bent_molded_plywood` ← `bent plywood`, `molded plywood`, `bent-plywood`, `molded-plywood`, `bent/molded plywood`
- `plywood_drawer_bottom` ← `plywood drawer bottom`, `plywood bottom`
- `plywood_structural` ← `structural plywood`, `plywood carcass`, `plywood case`, `plywood panel`
- `cedar_lining` ← `cedar lining`, `cedar interior`, `cedar-lined`, `aromatic cedar`
- `thick_veneer` ← `thick veneer`, `heavy veneer`
- `sheet_back_panel` ← `plywood`, `sheet back` (last-resort catch-all)

### Single-token material fallbacks (no negation guard)
These trigger on bare substring; ordering means earlier wins.
- `metal_frame` ← `metal`
- `tubular_steel` ← `steel`
- `wrought_iron` ← `iron`
- `brass_frame` ← `brass`
- `chrome_frame` ← `chrome`
- `fully_upholstered` ← `upholstered`, `fabric`, `cushion`
- `tufted_upholstery` ← `tufted` (note: `button tufting` above already short-circuited)
- `visible_springs` ← `springs`
- `woven_body` ← `wicker`
- `rattan_frame` ← `rattan`
- `cane_panels` ← `cane`
- `glass_top` ← `glass`
- `laminate_surface` ← `laminate`
- `formica_surface` ← `formica`
- `molded_plastic` ← `plastic`
- `acrylic_clear` ← `acrylic`, `lucite`

**Note on clue keys:** `normalizeClueKey` (engine.ts:594) lowercases, replaces `-` with `_`, replaces whitespace with `_`. So `"Cut Nail"` / `"cut-nail"` / `"CUT_NAIL"` all become `cut_nail`.

---

## 4. `CLUE_LIBRARY` shape

Source: `engine.ts:225-528`. Inline meta keyed by engine clue key. Per-entry fields the engine reads:

| Field | Type | Required | Used for |
|-------|------|----------|----------|
| `category` | string | yes | routes to authority bucket; also used by dating-overlap layer routing via `CATEGORY_TO_LAYER` (`label`, `form`, `structure`, `function`, `construction`, `joinery`, `fasteners`, `toolmarks`, `materials`, `hardware`, `finish`, `style`, `upholstery`) |
| `weight` | number 0–1 | yes | confidence weight in scoring |
| `dateHint` | string | optional | free-text date hint, parsed by `parseRangeToNumeric` |
| `hardNegative` | boolean | optional | marks categorical dating disqualifier |
| `formHint` | string | optional | feeds form scoring / display |

Block 1 deleted many entries (joinery, fasteners, toolmarks, finish, hardware where canonical exists). Remaining inline entries are: structural patterns, form/structure/function observations, style cues, KEPT_IN_ENGINE materials, upholstery convenience keys (Block 12, mostly category-only with weight).

---

## 5. `CLUE_TO_CANONICAL` mappings

Source: `engineCanonicalMap.ts:29-122`. Engine clue key → canonical entry id, or `NO_MATCH` sentinel (`"__NO_MATCH__"`).

### Counts by library

- **Joinery** (4 mapped + 2 NO_MATCH): hand_cut_dovetails, machine_dovetails, mortise_and_tenon, dowel_joinery; NO_MATCH: rule_joint, drawer_box_joinery
- **Toolmarks** (3): pit_saw_marks, circular_saw_arcs, band_saw_lines
- **Fasteners** (5 + 1 NO_MATCH): hand_forged_nail, cut_nail, wire_nail, phillips_screw, staple_fastener; NO_MATCH: no_phillips_screws_observed
- **Finish** (2): shellac_crazing, polyurethane
- **Wood / substrates** (3 + 1 NO_MATCH): plywood_structural, plywood_drawer_bottom, cedar_lining; NO_MATCH: sheet_back_panel
- **Hardware** (6 + 2 NO_MATCH): modern_concealed_hinge, porcelain_caster, decorative_bail_pull, round_wood_knob, wood_knob_pulls, lock_escutcheons; NO_MATCH: ormolu_mounts, brass_foot_sabots
- **Forms** (7 + 1 NO_MATCH): telephone_shelf, slant_front, cylinder_roll, drop_leaf_hinged, lift_lid, multiple_drawer_case, metal_bed_frame; NO_MATCH: gateleg_support
- **Maker labels** (3 NO_MATCH; route to makerMarks): maker_label, roos_label, lane_label
- **Upholstery construction** (16): coil_spring, hand_tied_coil_spring, serpentine_spring, drop_in_spring_unit, marshall_pocket_coil, no_spring_seat, jute_webbing, elastic_webbing, horsehair_stuffing, cotton_batting, foam_padding, polyurethane_foam, feather_down_fill, upholstery_staple_construction, hand_tacks, nailhead_trim, button_tufting
- **Upholstery covers** (9): velvet_cover, damask_cover, haircloth_cover, leather_cover, vinyl_cover, chintz_cover, needlepoint_cover, brocade_cover, jacquard_cover

### `KEPT_IN_ENGINE` (documented, not migrated)

Generic structural/observation/style/material clue keys with no canonical home today — these continue to live in `CLUE_LIBRARY` only:

`seating_present`, `seating_surface`, `backrest_present`, `spindle_back`, `secondary_surface`, `writing_surface`, `drop_front_desk`, `pigeonholes`, `mirror_present`, `open_shelving`, `pedestal_column`, `armchair_form`, `upholstered_back`, `drawer_present`, `door_present`, `cabinet_form`, `extension_mechanism`, `cabriole_leg`, `shell_carving`, `claw_or_pad_foot`, `barley_twist`, `heavy_carving`, `spindle_gallery`, `tapered_leg`, `louis_xvi_french_neoclassical`, `parquetry_veneer`, `stringing_inlay`, `rope_carved_pilasters`, `overhanging_top`, `tufted_upholstery`, `metal_frame`, `tubular_steel`, `wrought_iron`, `cast_iron`, `brass_frame`, `chrome_frame`, `fully_upholstered`, `visible_springs`, `exposed_upholstery_tacks`, `woven_body`, `rattan_frame`, `cane_panels`, `glass_top`, `laminate_surface`, `formica_surface`, `chrome_and_laminate`, `molded_plastic`, `acrylic_clear`, `solid_wood_construction`, `solid_wood_side_panels`, `frame_and_panel_sides`, `solid_plank_back`, `possible_plywood_or_laminated_panel`.

### `CLUE_TO_ALTERNATIVES`

Finer-grained canonical targets (subcategory + types): `hand_forged_nail`, `cut_nail`, `wire_nail`, `staple_fastener`, `plywood_drawer_bottom`, `decorative_bail_pull`. Engine currently only uses the primary `CLUE_TO_CANONICAL` mapping; alternatives are documented but not yet consumed by any reader.

### `FORM_LABEL_TO_CANONICAL`

Engine form-display string → canonical `form_id`. ~40 entries; NO_MATCH used heavily for style-as-form labels (Jacobean Revival, Chippendale, etc.) and material-anchored catch-alls. Authoring a NEW form-display string that doesn't appear here means the form will surface with engine label only — no canonical form fields (subtypes, anti-classification, dimensions) will be available.

---

## 6. Fields NOT consumed by any engine code

Authored into the schema, valuable as documentation, but **the engine reads nothing from these today.** Listed per-interface; not exhaustive across every library.

### `CanonicalEntry` (shared, `entryShape.ts:28`)
- `indicator_text` — used for narrative composition outside engine; engine never reads it.
- `replacement_risk` (numeric 0–1) — superseded by `replacement_likelihood` enum which IS read.
- `migration_status` — provenance flag, not consumed.
- `notes` — partially consumed: ONLY the embedded regex `/typical_date_range\s+"([^"]+)"/` is extracted by `dateHintFor`. Other notes content is invisible.
- `original_persistence` (`"low"|"medium"|"high"`) — Block 0.5a addition; **no consumer reads it yet**. Inverse-framing of `replacement_likelihood` per HCL framing.
- `is_alteration_evidence` (boolean) — Block 0.5 Op A field; no consumer.
- `caution_text` (CanonicalEntry shared field) — **NOT READ**. The engine's `getCanonicalCautionText` reads `diagnostic_caution_text` instead. Finish/joinery/hardware/toolmark/woodIdentification entries that populate `caution_text` get zero engine surfacing.
- `hard_negative_authority` — only the boolean `hard_negative` flag is read; the 1–10 authority value is ignored.

### `FormEntry` (`forms.ts:59`)
- `parent_category`, `common_conversion_targets`, `distinguishing_features`, `regional_period_notes`, `cousin_form_contrasts`, `family_id`, `spatial_behavior_id` — all unread by engine evaluators. (`distinguishing_features` and `regional_period_notes` may be surfaced in report layer but not by engine code in scope.)
- `dimensional_thresholds.depth_min/max`, `dimensional_thresholds.weight_min/max`, `dimensional_thresholds.notes` — `evaluateDimensional` only reads height+width sub-fields.
- Top-level `date_floor` / `date_ceiling` on a FormEntry — NOT used as the form's dating envelope in `engineDatingOverlap`. The form layer is fed from p2 result. (Form boundary clipping uses `anti_classification_guidance.boundary_date` instead.)

### `JoineryTypeEntry`, `FastenerTypeEntry`, `ToolmarkTypeEntry`, `FinishTypeEntry`, `HardwareTypeEntry` (non-upholstery type entries)
Engine reads only: `id`, `category`, `positive_authority`, `hard_negative`, `date_floor`, `date_ceiling`, `notes` (regex sub-match), `period_associations[*].date_floor/ceiling`, `diagnostic_caution_text` (woodEvidence only), `replacement_likelihood`.

Therefore the following are NOT consumed: `name`, `parent_category_id`, `description`, `unique_traits`, `identifying_characteristics` (NON-upholstery — only upholstery surfaces these in the LLM appendix), `date_range_summary`, `structural_role`, `hand_vs_machine_classification`, `regional_persistence_notes`, `related_*` cross-library FKs, `position_on_piece`, `common_observed_locations`, `style_associations`, `maker_associations`, `assessment_layer`, `cousin_contrasts`, `wear_characteristics` (NON-upholstery — only upholstery surfaces these), `anti_classification_guidance` on type entries (only consumed on FormEntry).

### `UpholsteryConstructionTypeEntry` / `UpholsteryCoverTypeEntry`
Consumed: `id`, `category`, `name`, `positive_authority`, `hard_negative`, `date_floor`, `date_ceiling`, `period_associations`, `identifying_characteristics`, `wear_characteristics`, `replacement_likelihood`, `notes` (regex sub-match).

NOT consumed: `parent_category_id`, `description`, `unique_traits`, `date_range_summary`, `style_associations`, `maker_associations`, `common_observed_locations`, `anti_classification_guidance` (type-level), `related_construction_types`, `related_fastener_types`, `related_hardware_types`, `related_joinery_types`, `regional_persistence_notes`, `cousin_contrasts`.

### `*ReasoningRule` entries (joinery, fasteners, hardware, upholstery, wood, maker)
**No engine code consumes any reasoning-rule entry.** The `*_REASONING_RULES` arrays are not even imported into `buildIndex` in `engineClueResolver.ts`. They're documented in canonical libraries but invisible to current engine code.

### `StyleFamilyEntry`
Consumed: `id`, `name`, `canonical_source_aliases`, `positive_authority`, `period_associations[*].date_floor/ceiling`.
NOT consumed: any other field on a style family entry (description, indicator_text, hard_negative_authority, notes, etc.).

### `StyleRevivalWaveEntry`
Consumed: `id`, `name`, `parent_style_id`, `wave_number`, `date_floor`, `date_ceiling`, `design_subtleties[*].signal`.
NOT consumed: other `design_subtleties` sub-fields, description, etc.

### `AntiClassificationGuidance` (form-only consumer)
Consumed when on a `FormEntry`: `boundary_date`, `boundary_type`, `guidance_text`, `pre_boundary_classifications`, `post_boundary_classifications`, `prominence`. Authoring `anti_classification_guidance` on non-form entries (e.g., upholstery construction types) is invisible — only `evaluateAntiBackClassification` consumes it, and it only looks at FORMS.

### `PeriodAssociation`
Engine reads `date_floor` and `date_ceiling` ONLY. `period_label` and `usage_notes` are pure documentation.

### `StyleAssociation`
**Not read by any engine code.** Pure documentation today.

### `PositionOnPiece` / `PhysicalLocation` enum
**Not read by any engine code.** Joinery type entries that populate `position_on_piece` get zero engine routing benefit today.

### `MakerAssociation` / `MakerMarkEntry` cross-references
Engine has `makerMarks` lookups outside the scope of this scan; entries' `maker_associations: []` arrays on upholstery/joinery type entries are NOT read by the evaluators reviewed here.

---

## Authoring discipline implications — Top-5 rules

1. **Use the engine's exact date-range vocabulary.** `"c. YYYY–YYYY"` or `"YYYY-YYYY"` for ranges (en-dash and hyphen both OK); `"post-YYYY"` / `"pre-YYYY"` for open-ended; `"YYYY's"` with straight apostrophe for decades; the century phrases listed in §1 row 6/7. **Avoid** `"YYYY to YYYY"`, `"between … and …"`, curly apostrophes, multi-range strings, `"YYYY+"`, `"after YYYY"`, `"before YYYY"`, `"19c."`, and word-form centuries — these silently fail or worse, fall to bare-year ±5 and look like a parse succeeded.

2. **`replacement_likelihood` is strict lowercase enum.** Author EXACTLY `"low"`, `"medium"`, or `"high"`. `"Low"`, `"med"`, `"unknown"`, `null`, numbers, or descriptive prose all return `undefined` and the canonical entry sits unused for Block 14 originality inference and the Block 15 LLM appendix replacement-likelihood line.

3. **For caution text, populate `diagnostic_caution_text` — not `caution_text`.** The engine reads only `diagnostic_caution_text`. Today only woodEvidence entries use that field name. If you author appraiser-style "do not classify X as Y" guidance into `caution_text` on a joinery/finish/hardware entry, the engine's `getCanonicalCautionText` will return `null` and the guidance will never surface in dating support arrays. (Either rename to `diagnostic_caution_text`, or wait for an engine update that reads the shared field.)

4. **For upholstery LLM appendix, `identifying_characteristics` is the gate.** If that array is empty/missing on an `upholstery_construction_*` or `upholstery_cover_*` entry, the entire entry is skipped — its `name`, `wear_characteristics`, and `replacement_likelihood` will not surface to the LLM at perception time. Always author at least one `identifying_characteristics` string before adding wear or replacement context.

5. **Author period-association windows correctly per library convention.** For non-upholstery libraries (joinery/fasteners/toolmarks/finish/hardware/wood/style/forms), `period_associations[0]` is the **diagnostic window** (Block 10b first-wins). For upholstery construction/cover libraries, `period_associations[0]` can be the open-ended "continuous-use era" and the diagnostic window lives in `period[1+]` as a CLOSED range (Block 15 picks the tightest-span closed period). Author closed ranges (`date_floor` + `date_ceiling` BOTH numeric) when you want the engine to surface a `"c. YYYY–YYYY"` hint; author only `date_floor` when you want `"post-YYYY"`.

### Bonus discipline rules

6. **Aliases need non-stop content tokens.** Style family `canonical_source_aliases` are tokenized after stripping STOP_TOKENS (`american`, `the`, `style`, `revival`, `period`, `century`, `early`, `late`, `modern`, `windsor`, `wood`, `metal`, etc.). An alias like `"American Federal Style"` contributes zero matching tokens. Author at least one specific ≥3-char proper noun or technical term per alias.

7. **`FormEntry.subtypes[].distinguishing_attributes` needs ≥4-char keywords.** Tokens shorter than 4 chars are dropped by `evaluateSubtype`. Attributes like `"oak"`, `"see"`, `"big"` won't match. The confidence formula is `matched / total`, so spurious 3-char attributes hurt the ratio without helping matches. Use rich phrases (`"quarter-sawn"`, `"barley-twist legs"`).

8. **For text-fallback (`detectClueFromText`) — match the exact substrings.** The matcher is `t.includes(substring)` after lowercasing. Author LLM-prompt vocabulary that uses one of the literal phrases listed in §3, OR set the structured `clue` key directly. Synonyms not in the list (e.g., "rolled fabric edge", "tack roll", "spring-down cushion") will not route. When adding new authoring vocabulary, mirror it into `detectClueFromText` or rely on the LLM setting `clue` explicitly.
