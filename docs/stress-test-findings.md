# Stress-Test Findings & Post-Test Fix Queue

> **Status:** Active stress test in progress (2026-05-20). User running 50 scans on real American antique furniture pieces. Issues observed during testing are recorded here for batch-fix work after the test completes.
>
> Already-fixed items are listed at the bottom for reference. This document is the canonical record of patterns the stress test surfaced — keep it updated as new patterns emerge.

---

## Open Issues — Ranked by Stress-Test Impact

### 1. Commercial simplification suppression (HIGHEST PRIORITY)

**Surfaced by:**
- French Provincial Revival upholstered armchair scan, 2026-05-20 (labeled "Academic French Louis XV Revival")
- Colonial Revival / Queen Anne channel-back chair scan, 2026-05-20 (labeled "Colonial Revival Queen Anne Upholstered armchair" at 95% confidence — far more accurate than the prior Louis XV attribution, but still over-rewards cabriole legs + rolled arms without weighing the simplified / mass-market production character)
- *Pattern strengthening across multiple scans — engine consistently over-rewards style cues vs commercial-production character on interwar American upholstered revival pieces*

**Issue:** Engine has no logic to recognize when a piece displays revival STYLING cues but also shows commercial-production CHARACTER (softened carving, simplified shaping, broader / relaxed proportions, mass-market construction, reduced sophistication). When these co-occur, the engine should suppress confidence in "academic" formal style labels and push toward "Provincial Revival" / "Commercial Revival" / "Factory Interpretation" / "Style-Influenced" framing.

**Concrete example from the chair scan:** Engine identified the piece as "Academic French Louis XV Revival Upholstered Armchair" at High confidence. The chair actually presents as commercially simplified — softened carving, broad lounge-chair proportions, mass-market construction character. Correct label would be "French Provincial Revival upholstered armchair" or "Louis XV influenced upholstered chair."

**Code locations:**
- `lib/engine.ts` — `CLUE_LIBRARY` would need new observation cluster (`simplified_carving`, `softened_proportions`, `commercial_construction_character`, `mass_market_proportional_relaxation`)
- `lib/engine.ts` — `p0` system prompt expansion to teach LLM to emit these observations on revival pieces with softened execution
- `lib/engineStyleEvaluator.ts` — new weighting logic: when commercial-simplification cluster fires alongside revival-style cues, reduce confidence in "academic" formal style labels
- `lib/constraints/styleFamilies.ts` — possibly need separate Provincial Revival style families that compete against Academic Revival families

**Proposed approach:**
1. Author 6-8 commercial-simplification observation keys with CLUE_LIBRARY entries
2. Expand P0 prompt: tell the LLM to flag when revival vocabulary is present BUT execution is commercially simplified
3. Add downweighting rule: when ≥2 simplification cues fire alongside formal revival cues, demote "Academic" qualifier and route to Provincial / Influenced framing

**Scope:** Large (~4-6 hours). This is the single highest-leverage fix for the entire commercial-revival category, which is probably half the American antique furniture market.

---

### 2. "Academic" qualifier overreach

> **FIXED** — see the Already-Fixed table below (`softenAcademicLabel` applied across all reconcileFinalStyle rules).

**Surfaced by:** French Provincial Revival upholstered armchair scan.

**Issue:** The "Academic" prefix on style attribution labels (e.g., "Academic French Louis XVI Revival") implies stylistic purity, carving sophistication, formal execution — qualities the piece often doesn't actually exhibit. Currently applied without gating on evidence.

**Code location:**
- `lib/constraints/styleFamilies.ts` — check the `name` field on French Neoclassical / Louis XV / Louis XVI style-family entries. May need to split into two variants: "Academic [Style] Revival" (high-purity execution) vs "[Style] Revival" or "[Style]-Influenced" (commercial / Provincial).

**Proposed approach:**
1. Audit existing style-family `name` values for "Academic" prefix
2. Either gate the "Academic" prefix on evidence (carving depth, proportional refinement, period maker marks) OR split into two style-family variants
3. Update display logic to pick the Provincial / Influenced variant when commercial-simplification cues are present

**Scope:** Small-medium (~1.5 hours). Tactical companion to fix #1 — they reinforce each other.

---

### 3. Dating too early / style persistence corridor

**Surfaced by:** French Provincial Revival upholstered armchair scan; pattern likely recurs on most revival pieces.

**Issue:** When style waves fire (1860-1925, 1900-1930, etc.), they anchor the dating convergence. Revival waves typically end at 1925-1930 in the canonical wave data, but American commercial revival production demonstrably extended into the 1940s-1950s — especially in upholstered seating. Result: chair likely 1925-1945 gets dated to 1900-1920.

**Code location:**
- `lib/engineDatingOverlap.ts` — `buildDatingOverlap()` and convergence zone selection
- `lib/constraints/styleFamilies.ts` — wave `date_ceiling` values
- `lib/constraints/transitionalPeriods.ts` — if revival waves are defined here

**Proposed approach (two options):**
- **A.** Extend canonical wave `date_ceiling` values on revival waves where commercial production extended later than the original wave authoring assumed. Lower-risk; localized to canonical data.
- **B.** Add a "style persistence corridor" computed at engine-time: when revival waves fire alongside commercial-simplification cues, extend the upper boundary of the dating convergence by 15-20 years to account for persistent commercial use of revival vocabulary.

**Scope:** Medium (~2-3 hours). Calibrate with stress-test data — need to see 5-10 more revival scans to know which waves consistently date too early.

---

### 4. Confidence cap too high when structural unknowns exist

> **FIXED** — see the Already-Fixed table below. P1 gate caps confidence on the count of dating-structural categories present: 0 → 72, 1 → 80, 2 → 86, 3+ → 94 (the `62/75/85` figures in the proposal below were the original draft, superseded by the shipped ladder).

**Surfaced by:**
- French Provincial Revival upholstered armchair scan (95% confidence cap with major unknowns: no underside, no joinery visibility, no fastener evidence, no rail structure)
- Colonial Revival / Queen Anne channel-back chair scan, 2026-05-20 (95% cap again with no underside, no seat support, no spring, no internal frame evidence visible — engine still blending style confidence and date confidence)
- *Pattern strengthening — same issue across multiple revival scans*

**Issue:** `Phase1Gate.confidence_cap_pct` currently calculates from observation count + clue authority. Doesn't account for what's MISSING — when structural-evidence layers (joinery, fasteners, toolmarks, wood-evidence) have 0 contributing clues, the cap should drop regardless of style cap. Reports should also surface the style-vs-date confidence distinction more clearly ("High confidence in style family · Moderate confidence in production date").

**Code location:**
- `lib/engine.ts` — `p1()` function, around the `confidence_cap_pct` calculation

**Proposed approach:**
1. Count structural-evidence layers with ≥1 contributing clue (joinery, fasteners, toolmarks, wood-evidence, hardware)
2. If structural layers contributing < 2: cap at "Moderate" (62%) regardless of style confidence
3. If structural layers contributing 2-3: cap at "Moderate-High" (75%)
4. If structural layers contributing 4+: allow "High" cap (85%+)

**Scope:** Small (~1 hour). Low risk — purely additive constraint on existing logic. Good "ship now" candidate even mid-stress-test.

---

### 5. French sub-style differentiation

**Surfaced by:** French Provincial Revival upholstered armchair scan — engine collapsed Louis XV / Louis XVI / French Neoclassical / Provincial into one category.

**Issue:** Engine appears to use a single "French Neoclassical" or similar umbrella style family for all French-derived revival pieces. Louis XV (cabriole, serpentine, S-curves) ≠ Louis XVI (fluted, urn, swag, straight tapered leg) ≠ French Neoclassical (symmetric, architectural, restrained) ≠ French Provincial (simplified country interpretation of either Louis style). These need distinct token sets and contrast rules.

**Code location:**
- `lib/constraints/styleFamilies.ts` — French style-family entries
- `lib/constraints/styleCompatibility.ts` — compatibility rules between French sub-styles

**Proposed approach:**
1. Audit existing French style-family entries — are they separate or merged?
2. If merged, split into 4 distinct families: Louis XV, Louis XVI, French Neoclassical, French Provincial
3. Each gets distinct token vocabulary
4. Add compatibility rules so "Louis XV + cabriole legs" doesn't read as "French Neoclassical"

**Scope:** Medium-large (~3-4 hours). Affects French revival category specifically; the broader category-collapse problem (multiple style sub-families merged) may apply to other revival categories too (English, Italian, German).

---

### 6. Upholstery probabilistic weighting

**Surfaced by:** French Provincial Revival upholstered armchair scan.

**Issue:** Current upholstery logic separates frame date from upholstery date (good — this is a recent improvement). But treats upholstery as binary: either confirms the date OR is ignored. Should provide soft-evidence path: when upholstery integration suggests period-consistent vs replacement (proportional fit, wear pattern continuity, attachment-method consistency, fabric-era plausibility), contribute small weight to frame dating without dominating.

**Code location:**
- `lib/engine.ts` — `detectUpholsteryLayer()` and the originality-inference logic

**Proposed approach:**
1. Compute upholstery-frame "integration consistency" score from existing observations
2. When score is high (period-consistent), add small contribution (~0.15 weight) to frame dating convergence
3. When score is low (clear replacement), add small NEGATIVE signal that broadens the dating envelope
4. Never let upholstery dominate — cap contribution at small weight relative to structural-evidence layers

**Scope:** Medium (~2 hours). Specific to upholstered pieces (~30% of the antique furniture market).

---

### 7. Cross-section narrative consistency

**Surfaced by:** William and Mary Revival slant-front desk scan, 2026-05-20.

**Issue:** Report sections disagreed: Primary Identification said "William and Mary to Queen Anne Transition" (1690-1730 implied), Dating said c. 1920-1930, Supporting Evidence text talked about period 17th-18th c. characteristics. Engine has no final reconciliation step that catches this.

**Partially addressed by:** Fix 3 commit `7a16150` (Rule 1 of `reconcileFinalStyle` now guards against named-transitional-period labels firing when their date range doesn't overlap final dating).

**Remaining gap:** The Supporting Evidence prose still describes period-era characteristics even when the engine determines the piece is revival. Need narrative-generation step to filter or reframe supporting-evidence language based on final reconciliation kind.

**Code location:**
- `lib/engine.ts` — `p6()` summary generation; supporting findings list building
- Possibly `lib/datingFindingNarrative.ts`

**Proposed approach:**
1. After `reconcileFinalStyle` determines `kind` (revival_wave, reproduction, etc.), pass the kind into supporting-evidence prose generation
2. For revival/reproduction kinds: filter or reframe period-era language ("17th-c. veneered case furniture" → "revival of 17th-c. veneered case furniture forms"; "characteristic of [period]" → "in the vocabulary of [period]")

**Scope:** Medium (~2 hours).

---

### 8. Dating convergence zone selection

**Surfaced by:** Both the clock and the desk scans had multiple convergence zones; engine consistently picked the wrong one.

**Issue:** When two convergence zones exist (e.g., 1860-1910 with 3 layers vs 1920-1930 with 2 layers), the engine picks the narrower window over the higher layer-count window. Authority weighting may need adjustment to favor layer count over window width.

**Code location:**
- `lib/engineDatingOverlap.ts` — `refineDatingFromConvergence()` and the convergence-zone scoring logic

**Proposed approach:**
1. Re-check the authority_sum vs layer_count vs window_width weighting in the convergence-selection scoring
2. Increase weight of layer_count relative to window_width
3. Possibly: tie-break by structural-evidence layer presence (form / joinery / fasteners) over surface-evidence layers (style / style_wave)

**Scope:** Small-medium (~1-2 hours). Could be done with a few stress-test cases as calibration data.

---

### 9. Style attribution primary narrowing

**Surfaced by:** Clock scan — Renaissance Revival observation fired with comparable confidence (0.64) to Rococo Revival but Rococo won the primary slot.

**Issue:** When multiple style-family attributions fire with similar confidence, the primary-slot selection logic may favor wrong family due to subtle weighting differences.

**Code location:**
- `lib/engineStyleEvaluator.ts` — attribution scoring + primary selection

**Proposed approach:**
1. Audit primary-slot selection: when two attributions are within 5-10% confidence, what tie-breaks?
2. Consider weighting by token count: if one attribution has more supporting observations, prefer that one
3. Possibly: ensemble or "co-primary" treatment for closely-tied attributions

**Scope:** Medium (~2 hours). Calibrate against multiple stress-test scans.

---

### 10. Adjacent revival-family bleed / expansive alternatives

**Surfaced by:** Colonial Revival / Queen Anne channel-back chair scan, 2026-05-20.

**Issue:** Engine surfaces too many adjacent revival families with too-low signals. The chair report referenced Queen Anne, Colonial Revival, Spanish Colonial Revival, AND Mediterranean Revival across the attribution and waves sections. While interwar American upholstered furniture genuinely borrowed broadly from multiple revival vocabularies, the engine is too eager to surface neighboring families that don't have distinct supporting evidence. Result: report reads like a cluster of stylistic possibilities rather than a disciplined evidence-first conclusion.

Distinct from #9 (which is about picking the correct primary). This issue is about suppressing the *adjacent alternatives* that don't have meaningful signal — even when the primary is correct.

**Code location:**
- `lib/engineStyleEvaluator.ts` — alternative-attribution surfacing threshold
- `lib/engineStyleIntersection.ts` — wave-aggregator qualifying confidence floor

**Proposed approach:**
1. Raise the qualifying-confidence floor for surfacing alternative style families: only surface alternatives that have meaningfully high signal (e.g., confidence ≥ 0.55), not all weak matches
2. Same for wave-level alternatives — currently waves with 1 matched_signal are surfaced; consider requiring 2+ matched signals or a confidence floor
3. Consider distance / compatibility filter: when primary attribution is e.g. "Colonial Revival Queen Anne," suppress geographically/temporally distant alternatives (Spanish Colonial, Mediterranean) unless they have clearly distinct structural or ornamental evidence

**Status:** PARTIALLY FIXED by commit `c13cc43` (confidence floor 0.55 + matched-term distinctness filter on user-facing alternatives). Remaining: wave-level surfacing floor; distance/compatibility filter.

**Scope:** Small-medium (~1.5 hours). Calibrate threshold values against accumulated stress-test scans.

---

### 11. Overcomplicated style / secondary-style display labels (chart overflow)

**Surfaced by:** Rococo Revival / Naturalistic Victorian + Jacobean Revival lamp/parlor table scan, 2026-05-20. (Appraiser: "Nearly perfect on this one, but it serves as an extreme example of something I have been noticing. We're overcomplicating our style and secondary style descriptions. This description doesn't even fit on the chart.")

**Issue:** Style display labels become unwieldy compound strings that overflow the dating-overlap chart's style-row label area and read as overcomplicated in the report header. Three stacking sources:

1. **Compound style-family names.** The canonical `name` fields in styleFamilies.ts are deliberately multi-name (each style family carries every appraiser/regional naming variant): "Rococo Revival / Naturalistic Victorian", "Federal / Adam / Hepplewhite / Sheraton" (4 names), "Tudor Revival / Jacobean Revival / Elizabethan Revival", "Spanish Colonial Revival / Mission Revival / Mediterranean Revival", "Early Colonial / Pilgrim / Seventeenth-Century American". Comprehensive for the data; unwieldy for display.

2. **Form names that already contain a style word.** This scan's form best-fit was "Jacobean Revival cabinet / sideboard" — the style word is baked into the form name.

3. **Concatenation doubles it.** display_form composition (engine.ts ~6705) prepends the style label to the form name: "Rococo Revival / Naturalistic Victorian" + "Jacobean Revival cabinet / sideboard" = "Rococo Revival / Naturalistic Victorian Jacobean Revival cabinet / sideboard". Two style attributions stacked. And the chart style-row label (page.tsx:1054 `Style: ${styleAttribution.name}`) uses the full compound name verbatim, so it overflows the chart.

**Code locations:**
- `lib/constraints/styleFamilies.ts` — compound `name` fields
- `app/page.tsx:1054-1055` — chart style-row label (`styleFamilyLabel`, `partnerStyleLabel`)
- `lib/engine.ts:~6705` — display_form composition (style prefix + form)

**Proposed approach:**
1. **Add a `short_name` field to StyleFamilyEntry** — the single dominant name for display (e.g., "Rococo Revival" instead of "Rococo Revival / Naturalistic Victorian"). Keep full `name` for matching + detailed report text. Author short names for ~30 style families.
2. **Chart labels use short_name** — `page.tsx:1054-1055` switches to `styleAttribution.short_name ?? firstSegment(styleAttribution.name)`.
3. **display_form de-duplication** — when the form name already contains a style word that overlaps the style prefix, don't double it. Either drop the prefix or drop the style word from the form name. Simplest: when style prefix and form name share a style token, render the form name alone with the style as a separate "Style:" line rather than concatenating.
4. **Cap the secondary-style surfacing** — tie to issue #10 (already partially fixed); secondary styles shouldn't pile into the primary label.

**Scope:** Medium (~2-3 hours). The chart-overflow piece alone (short_name + chart label switch) is small (~1 hour) and could ship independently as a quick win. The display_form de-duplication is the larger part.

---

### 12. Form resolution overrides observations — armchair vs settee/loveseat (MAJOR LOGIC ERROR)

**Surfaced by:** Louis XV/XVI Revival upholstered seating scan, 2026-05-20.

**Issue:** The observation layer explicitly recognized two-person seating: "Wide upholstered seat cushion visible, sized for two persons — consistent with settee or loveseat form" and "piece is a two-seat settee/loveseat with full arm supports, not a single armchair." But form resolution returned `form_armchair`. The engine correctly observed the evidence, then the form-resolution layer overrode its own observations and forced the object back into the armchair category.

Per appraiser: "This is exactly the kind of downstream reconciliation failure that should be treated as a major logic error. The form engine should never allow a canonical armchair identification when the observation layer explicitly recognizes two-person seating dimensions and loveseat/settee proportions."

**Root cause:** The LLM emitted the clue key `armchair_form` (which routes to form_armchair via scoreForms taxonomy) while DESCRIBING a settee in the observation text. The engine trusts the clue key and ignores the contradicting description. There is no settee/loveseat clue key in the emitted set, and the "two persons / settee / loveseat" language lives only in description prose, which form scoring doesn't read.

**Code locations:**
- `lib/engine.ts` — scoreForms (form scoring from clue keys)
- `lib/engine.ts` — p0 system prompt (form-signal key guidance)
- `lib/engineCanonicalMap.ts` — armchair_form routing note

**Proposed approach:**
1. Engine-side detection (more robust): scan observation descriptions for two-person-seating language ("two persons", "two-seat", "settee", "loveseat", "love seat", "sized for two"). When present, override an armchair form attribution to form_sofa (which has subtype_sofa_loveseat) regardless of the armchair_form clue key.
2. Prompt-side: teach the LLM to emit a sofa/settee/loveseat form clue when the seat is sized for 2+ occupants, NOT armchair_form.
3. Both — engine detection as the safety net, prompt fix to reduce the mismatch at source.

**Scope:** Medium (~2 hours). Logic error, not calibration — does not need more stress-test data to fix. Good fix-now candidate.

---

### 13. Subtype misfire — over-permissive token matching (MAJOR LOGIC ERROR)

**Surfaced by:** Louis XV/XVI Revival upholstered seating scan, 2026-05-20 (classified as "Dining armchair / host chair" subtype with confidence 1.0).

**Issue:** The piece — a lounge/parlor settee with deep reclined seat, overstuffed upholstery, enveloping sides, theatrical cresting — was assigned the "Dining armchair / host chair" subtype. Nothing supports dining-chair logic. The engine's own posture analysis correctly recognized lounge-chair behavior (`lounge_chair_form` clue, conf 78) but the subtype resolver ignored it.

Per appraiser: "The subtype system is still over-prioritizing 'has arms + exposed frame + upright silhouette' while failing to sufficiently weight seat depth, posture angle, upholstery massing, and occupancy scale."

**Root cause:** `assignSubtype` (engineFormEvaluators.ts:53) tokenizes each subtype's `distinguishing_attributes` and matches on ANY ≥4-char token appearing in the observation-descriptions haystack. The dining subtype's attribute "Armchair used at the head or foot of a dining table; seat height usually aligns with dining chairs (17-19 inches)" matched on generic tokens ("armchair", "seat") that appear in the haystack for almost any chair. confidence = matched/total = 1/1 = 1.0 → assigned. No negative-evidence check, no semantic weighting, no consideration of contradicting clues (lounge_chair_form).

**Code location:**
- `lib/engineFormEvaluators.ts:53` — assignSubtype

**Proposed approach:**
1. Negative-evidence guard: when contradicting clues are present (e.g., lounge_chair_form contradicts dining subtypes), suppress the conflicting subtype.
2. Require DISTINCTIVE token matches, not generic ones: tokens like "armchair", "seat", "chair" appear in nearly all chair observations and shouldn't drive subtype confidence. Build a stop-list of generic tokens, OR weight matches by token rarity (IDF-style).
3. Raise the single-attribute confidence ceiling: a subtype with one attribute that matched one generic token shouldn't reach confidence 1.0. Consider requiring ≥2 distinctive matches, or capping confidence when only generic tokens matched.

**Scope:** Medium (~2-3 hours). Logic error, not calibration. The generic-token stop-list and negative-evidence guard are the highest-value pieces.

---

### 14. Lamp form-routing failure — orphaned lamp form + material "trap" routing (MAJOR LOGIC ERROR)

> **FIXED** — see the Already-Fixed table below (lamp scoring path + metal/brass-trap gating).

**Surfaced by:** Slag-glass table lamp scan, 2026-05-20 (final identification returned "Brass bed or brass-frame furniture", subtype "Victorian brass bed", confidence 1.0).

**Issue:** The perception layer correctly identified a slag-glass table lamp. The LLM emitted `lamp_form` (conf 68) and `clock_case_form` (conf 68, see #15). But the final form reconciliation returned **"Brass bed or brass-frame furniture."** Per appraiser: "the final form reconciliation catastrophically collapses... a downstream canonical-resolution failure overriding overwhelmingly correct upstream perception."

**Root cause — same systemic pattern as #12:** There is no scoreForms path for any lamp clue key. `lamp_form` appears nowhere in `engine.ts` and is not in `CLUE_TO_CANONICAL`. The 14+ lamp forms in `forms.ts` (form_table_lamp, form_floor_lamp, form_oil_lamp, form_kerosene_lamp, etc.) are reachable only by exact-name LLM label emission, never from clue-key scoring. Meanwhile the lamp's legitimate brass/metal base fired `brass_frame`, and the ONLY form `brass_frame` routes to in scoreForms is `add("Brass bed or brass-frame furniture", 70, ...)` (engine.ts:3271). With no lamp form competing, the brass-bed "trap" clue won the slot — exactly the orphaned-form pattern documented in #12 (seating) and the audit flagged in commit ad786f6.

**Code locations:**
- `lib/engine.ts` — scoreForms (no lamp scoring block; brass_frame → brass-bed trap at ~3271)
- `lib/engine.ts` — text observation extractor (~1757) and CLUE_LIBRARY (no `lamp_form`)
- `lib/engineCanonicalMap.ts` — `lamp_form` absent from CLUE_TO_CANONICAL; no "Table lamp" / lighting form-label aliases

**Proposed approach:**
1. Add a lamp/lighting scoring block in scoreForms: when `lamp_form` (or lighting evidence — shade, socket, harp, finial, slag/leaded glass panels) fires, score the appropriate lamp form (form_table_lamp as the default, rerouting to floor/oil/kerosene/banquet by distinguishing evidence).
2. Gate the brass-bed routing: do not award "Brass bed or brass-frame furniture" when lamp/lighting evidence is present (a lamp's brass base is material, not a bed). Same guard pattern as the `seatingPresent` gate already protecting the iron-bed route (engine.ts:3254).
3. Route `lamp_form` (and lighting form labels) through CLUE_TO_CANONICAL / FORM_LABEL_TO_CANONICAL to the lamp canonicals.

**Scope:** Medium (~2-3 hours). Logic error, not calibration — fix-now candidate. Part of the broader orphaned-form-scoring audit.

---

### 15. Negated observations preserved as positive clues — form routing ignores negation (MAJOR ARCHITECTURE LOGIC ERROR)

> **FIXED** — see the Already-Fixed table below (`negated` detection excludes self-rejected clues from clue_keys / scoreForms / weighting).

**Surfaced by:** Slag-glass table lamp scan, 2026-05-20.

**Issue:** The engine recorded the clue key `clock_case_form` (weight 0.850, conf 68) on the lamp scan — even though that observation's own description was **"Object is a table lamp, not a clock case."** The negation was thrown away; the clue entered scoring as positive form evidence.

Per appraiser: "Your engine currently appears to preserve rejected candidate language as active positive evidence instead of treating it as negation metadata. That is extremely dangerous because rejected candidates are still entering later scoring layers." Flagged as "an important architecture clue," not a one-off.

**Root cause:** `buildEvidenceDigest` (engine.ts:2472) builds `clue_keys` as `uniq(observations.map(o => normalizeClueKey(o.clue)))` — taking EVERY observation's `clue` regardless of (a) the `hard_negative` flag, or (b) explicit self-negation in `o.description`. The weighting layer (p4) DOES respect `hard_negative` (engine.ts:6297 filters them out of supporting clues; 6236 boosts them as negative evidence). But **scoreForms reads raw `digest.clue_keys`** (engine.ts:2900), which never excluded negated observations. Two compounding gaps:
- **Structural:** even an observation correctly flagged `hard_negative: true` still contributes its clue to `clue_keys`, so form routing counts it as present.
- **Detection:** here the LLM left `hard_negative: false` and put the negation only in prose ("...not a clock case"), so nothing flagged it as negative at all.

**Code locations:**
- `lib/engine.ts:2472` — `buildEvidenceDigest` clue_keys assembly (no negation/hard_negative exclusion)
- `lib/engine.ts:2900` — scoreForms consumes raw clue_keys
- `lib/engine.ts:1482` — LLM `hard_negative` parse (only honors explicit `raw.hard_negative === true`)

**Proposed approach:**
1. **Detection:** when an observation's description self-negates its own clue (patterns: "not a/an [X]", "is not", "rather than [X]", "[X] not present", "no [X]"), treat the observation as negative — set/honor `hard_negative` for it.
2. **Structural:** exclude `hard_negative` observations from `clue_keys` (or have scoreForms skip them), so a rejected candidate cannot route a form. Keep them available as negation metadata for the conflicts/weighting layers, which already handle them correctly.
3. Verify no legitimate positive clue relies on a negating-sounding description before excluding (audit the small set of CLUE_LIBRARY keys whose descriptions contain "no"/"not").

**Scope:** Small-medium (~1.5-2 hours). Logic/architecture error, not calibration — fix-now candidate. Highest architectural leverage of the lamp scan: it protects EVERY form/style/dating layer from rejected-candidate contamination, not just lamps.

---

### 15a. Style cues don't anchor dating — correct negation can erase the only date anchor (DOWNSTREAM of #15, KNOWN-RED)

> **OPEN / DEFERRED** — pinned by the `KNOWN_RED` allowlist in `tests/corpus.test.ts` so the corpus gate flags it until fixed. Do not re-baseline the `art_deco_candelabrum` fixture to hide it.

**Surfaced by:** the #15 negation hardening, 2026-05-27 (corpus negation re-baseline).

**Two-part fix that exposed this (both landed):**
1. **Harness faithfulness** — the scan corpus stubs `PE.p0`, the only place `normalizeObservationsFromParsed` (and thus `descriptionNegatesClue`) runs, so it had been consuming **stale hand-baked `negated` flags** and was blind to detector changes. `scripts/_scanCorpus.ts` now re-derives `negated` exactly as production does (one line in `runFixture`), and the corpus is now a real test (`tests/corpus.test.ts`, in CI) rather than a manual script. This surfaced 28 negations the corpus had been treating as positive.
2. **Detector precision** — `descriptionNegatesClue` (engine.ts) now distinguishes a negated *presence* from a contrasted *subtype*: (a) a **quote rule** — a label/mark/text clue carrying a transcribed quote is affirmed even when prose adds "...not a maker's mark" (kept the Sears freight label's dating); (b) an **affirmation guard** — a term asserted present ("Backrest is integral", "nailheads visible") survives a later subtype contrast, while a leading no/not disqualifies self-affirmation so "No Eastlake hardware visible" still negates.

**The remaining bug (`art_deco_candelabrum`, KNOWN-RED):** with `painted_metal_finish` now correctly negated ("does not appear to be painted enamel … patina/verdigris … bronze/brass"), the piece loses its **only** hard 20th-century anchor — that clue's `dateHint: post-1900`. The Art Deco style observations (`art_deco_style_cues` etc.) carry **no `dateHint` and are not in `CLUE_LIBRARY`**, so they contribute 0 to the dating layer; dating collapses from `c. 1925–1995 / original_period` to `c. 1850 onward / unresolved`. Same class as the open style-prose-ignored cluster (#6): **dated style evidence doesn't anchor dating.**

**Proposed approach:** give the deco/period style-cue clues a date envelope (CLUE_LIBRARY `dateHint`/range) or let corroborated style-prose dates anchor a floor when no construction/material anchor survives — the #6 Phase-1 mechanism, generalized to named-period style cues. Re-confirm `art_deco_candelabrum` reproduces `c. 1925–1995 / original_period`, then remove it from `KNOWN_RED`.

**Scope:** Small-medium. Calibration + small library authoring; shares a root with #6.

---

### 15b. Hyphenated intervening words break the negation gap regex (DOWNSTREAM of #15, FIXED)

> **FIXED 2026-05-28** — corpus diff confirms zero outward-verdict regressions and one positive internal cleanup. Same root family as #15; shipped via the fast-path workflow (see `docs/WAYS_OF_WORKING.md`) since the fix was small, additive, traceable, and clean against the corpus.

**Surfaced by:** Art Deco waterfall vanity scan, 2026-05-28 (kneehole/twin-pedestal vanity with rounded waterfall corners, reeded pilasters, geometric brass inlay center drawer, lion-head ring pulls).

**Issue:** The engine returned `c. 1860–1910 / Art Deco vocabulary (post-1860 reproduction)` for a textbook American Art Deco waterfall vanity (correct: c. 1935–1948, original_period). Mis-dated by ~65 years AND mis-labeled "reproduction" because the date fell outside Art Deco's 1925–1945 window.

**Root cause:** the `thick_veneer` observation self-negates — "Veneer appears relatively thin and uniform, consistent with factory production **rather than hand-sawn thick veneer**" — but `descriptionNegatesClue` returned false. Its gap regex `W = (?:\w+\s+){0,3}` allows up to 3 intervening words between the negation cue ("rather than") and the clue subject ("thick veneer"). `\w+` doesn't match hyphens, so `\w+\s+` fails on "hand-sawn ". With W=0, the pattern needs "thick veneer" immediately after "rather than" (it isn't). No match → no negation → `thick_veneer`'s `pre-1910` dateHint anchored the wood layer at 1900–1910 and built a tighter 4-layer `1860–1910` convergence zone that beat the real 3-layer Art Deco `1925–1945` zone.

**Fix:** widen the gap to `[\w-]+\s+` so hyphenated tokens like "hand-sawn" / "machine-cut" parse as a single word. One-character change, strictly additive (every previously-matched string still matches — `\w+` is a subset of `[\w-]+`).

**Code location:** `lib/engine.ts:1587` — the `W` constant inside `descriptionNegatesClue`.

**Validation (full 39-fixture corpus diff vs snapshot baseline):**
- **38/39** fixtures: bit-for-bit unchanged.
- **1/39** (`renaissance_revival_tufted_armchair`): outward verdict identical (`c. 1850–1920 / Renaissance Revival / Parlor table`), but internal convergence zones tightened from `1850–1920[3L]` + ghost `1960–1970[2L]` to a single clean `1860–1885[2L]` — a hyphen-blocked negation in this fixture's prose was silently inflating its evidence and is now correctly suppressed.
- **125/125** tests pass (86 unit + 39 corpus fidelity).

**Scope:** Tiny / fast-path.

---

### 16. Functional evidence overridden by fuel-word / decorative resemblance (MAJOR LOGIC ERROR — FIXED)

**Surfaced by:** Slag-glass electric table lamp scan, 2026-05-20 (rerun after #14/#15). Form held in the lamp family correctly (#14/#15 confirmed working) but resolved to **"French Louis XVI Revival Kerosene lamp"**, subtype "Center-draft kerosene lamp" (conf 1.0) — despite `electric_table_lamp` (conf 70), electric cord, standard E26 socket, and explicit "electric rather than oil/kerosene function" observations.

Per appraiser: "Functional identity should always outrank stylistic resemblance when determining subtype. Once electric socket architecture is confirmed visually, kerosene subtypes should either be eliminated entirely or heavily penalized unless clear conversion evidence exists."

**Root cause (two layers, same negation-contamination class as #15):**
1. **Form routing** — the #14 lamp block's fuel branch matched the bare word "kerosene" via `includesAny(text, ["kerosene", ...])`. That word appears in NEGATING prose the engine itself emits ("electric rather than oil/kerosene function"), so the lamp routed to Kerosene lamp before the Table lamp fallback. (Regression introduced by #14.)
2. **Subtype** — once on a lamp form, `evaluateSubtype` matched fuel subtypes (oil/kerosene/hurricane) on "kerosene"/"oil" leaking from the same negating prose, and several subtypes tied at conf 1.0 on tokens ubiquitous to lamps (glass, brass, electric) — first-listed arbitrarily won.

**Fix (committed):**
- `lib/engine.ts` scoreForms lamp block — **electric-first routing**: `electricEvidence` (socket/cord/E26 clues or text) routes to Table lamp; fuel branches require POSITIVE burner/font/wick/chimney evidence AND no electric/conversion signal.
- `lib/engineFormEvaluators.ts` evaluateSubtype — **functional-contradiction guard**: when electric is confirmed and no conversion language, fuel/flame subtypes (kerosene, oil, gas, candle, hurricane, wick, burner, chimney) are eliminated. **Ambiguity guard**: when ≥2 subtypes tie at top confidence, return null so the broader evidence-safe form-level identity stands instead of an arbitrary over-specific pick.

**Result:** electric slag-glass lamp now resolves to Table lamp with no forced fuel subtype.

**Scope:** Medium — logic error + regression, fixed now.

---

### 17. Systemic orphaned-form scoring — 217 of 242 forms unreachable (ARCHITECTURE GAP)

**Surfaced by:** Full audit of all 242 forms / 1,288 subtypes, 2026-05-20 (prompted by the recurring orphan pattern in #12 seating, #14 lamp). Full worklist: `docs/orphaned-forms-audit.md`.

**Issue:** A canonical form can surface as a primary identification **only** when `scoreForms` emits a hardcoded `add("label", …)` whose label maps to that form_id via `FORM_LABEL_TO_CANONICAL`. Verified that form candidates come *solely* from `scoreForms` ranked results (engine.ts:6091); `CLUE_TO_CANONICAL` and the hundreds of form-label aliases do **not** generate form candidates.

`scoreForms` emits only **64 distinct labels** — 38 map to form_ids (collapsing to just **25 reachable forms**) and 26 resolve to `NO_MATCH` (style-as-form context, no form_id). **The other 217 forms (1,124 subtypes) have no scoring path.** They surface only if the LLM's evidence happens to miss all 25 wired clue-gates (→ inconclusive/style-only result) or, worse, gets captured by a reachable "trap" label.

**Reachable forms (25):** armchair, settee, sofa, lounge chair, wing chair, recliner, stool, bench, chest of drawers, china cabinet, bookcase, blanket chest, secretary/slant-front/cylinder desk, drop-leaf/extension/gateleg table, iron bed, telephone stand, table/floor/banquet/oil/kerosene lamp.

**Orphaned by category (forms / subtypes):** desk 52/269 · table 35/213 · case_piece 29/151 · industrial 29/119 · chair 10/84 · lighting 14/83 · entry_support 20/78 · musical_mechanical 12/39 · seating 6/35 · clock 3/17 · institutional_seating 2/16 · basket 1/12 · seating_support 1/8.

**Concrete high-traffic gaps:** `form_dining_table`, `form_side_table`, `form_coffee_table` (only drop-leaf/extension/gateleg tables route); `form_side_chair` (14 subtypes), `form_rocking_chair`, `form_windsor_chair`, `form_morris_chair`, `form_slipper_chair`; `form_dresser` and `form_wardrobe` (a dresser currently reroutes to `form_chest_of_drawers` via the "Dresser / drawer case" label); **all three clocks** (`form_shelf_clock`/`form_tall_case_clock`/`form_wall_clock`).

**Clock correction:** the earlier "clock fix" (`3c0374f`) wired `CLUE_TO_CANONICAL`, label aliases, and subtypes — but **never added a `scoreForms` scoring path**, so clocks remain form-orphaned. This is the orphan pattern #14 documented, surfacing in an issue we believed closed.

**Trap mechanism (same as #14 lamp → brass bed):** broad reachable labels capture orphaned-form slots — e.g. `brass_frame` → "Brass bed or brass-frame furniture" (now gated for lamps), any cabinet clue → "Cabinet" → form_china_cabinet, any drawer case → form_chest_of_drawers. Each trap is a latent misidentification for the orphaned forms it shadows.

**Code locations:**
- `lib/engine.ts` — `scoreForms` (the 64 hardcoded `add()` labels are the entire reachable surface)
- `lib/engineCanonicalMap.ts` — `FORM_LABEL_TO_CANONICAL` (938 aliases authored, but only those scoreForms literally emits are live)

**Proposed approach (roadmap — far too large for one pass):**
1. **Prioritize by scan likelihood**, not subtype count: clocks, dining/side/coffee tables, side chair, rocking chair, dresser, wardrobe, daybed first (high American-antique traffic).
2. For each batch, add a `scoreForms` scoring block keyed on the form's diagnostic clues (mirroring the #14 lamp block) and ensure the emitted label exists in `FORM_LABEL_TO_CANONICAL`.
3. Add/verify the supporting clue vocabulary in `CLUE_LIBRARY` and the P0 prompt so the LLM emits the gating clues.
4. Audit each new block against existing trap labels (gate the trap when the more-specific form's evidence is present, as done for lamp vs brass-bed).

**Scope:** Very large (the core remaining engine build-out). Not a single fix — a prioritized program. Logic/architecture gap, not calibration.

---

### 18. Construction/mechanism evidence excluded from dating (M13) — DEFERRED ENGINE TASK

**Surfaced by:** corpus fixtures — platform-rocker armchair (`platform_rocker_mechanism`, conf 95, "patented & popularized 1870s–90s") and Louis XVI repro lounge chair (`carved_ornament_machine_assisted`, "machine/CNC carving, 20th–21st c."). Both clues carry an intrinsically datable signal yet contribute **nothing** to the date.

**Issue:** `CATEGORY_TO_LAYER` (`engineDatingOverlap.ts:493`) maps only joinery / fasteners / toolmarks / finish / hardware / materials / upholstery to dating layers. Observations the P0 model types as `construction` have no mapping, so they are dropped from dating entirely (`engineDatingOverlap.ts:648`) — even when the signal can pin a decade (a patented mechanism). At the weighted-clue level the category is `meta?.category || o.type` (`engine.ts:8275`), so a *single* clue can be rescued by authoring a `CLUE_LIBRARY` entry in a mapped category — but that is per-clue and reactive.

**Why deferred, not point-fixed:** authoring clues one at a time (e.g. `platform_rocker_mechanism` → `hardware`) fixes one clue per pass. The leverage is systemic — let authored *construction* envelopes count toward dating directly. The catch: several construction clues already carry date hints (`slant_front` 1700–1860, `cylinder_roll` 1870–1920, `drop_leaf_hinged` 1720–1930, `gateleg_support`…) that would suddenly start contributing across many pieces, so this needs a deliberate design (e.g. only construction clues with an *authored* envelope date, or a curated mechanism-dating subset) plus corpus validation. Tracked as its own engine task — deliberately **not** bundled into a deploy.

**Code locations:**
- `lib/engineDatingOverlap.ts:493` — `CATEGORY_TO_LAYER` (no `construction` key)
- `lib/engineDatingOverlap.ts:648` — unmapped categories dropped from dating
- `lib/engine.ts:8275` — weighted-clue category = `meta?.category || o.type`
- `lib/engine.ts:330` — `CLUE_LIBRARY` (where authored envelopes live)

**Scope:** Medium engine task + authoring. Logic/architecture gap, not calibration.

---

### 19. Logically-impossible date — reconciliation produces date claims that violate temporal logic (MAJOR LOGIC ERROR)

**Surfaced by:**
- S052 Art Deco walnut waterfall dresser (true c. 1925–1945) → "Art Deco vocabulary (post-1870 reproduction) Dresser, c. 1870–1910, HIGH conf, kind=reproduction"
- S054 Colonial Revival William and Mary drop-front secretary on stand (true c. 1910–1935) → "New Traditional / Grandmillennial Colonial Secretary desk, c. 1990–**2100**, HIGH conf, kind=revival_wave"

**Issue:** Reconciliation generates date claims that cannot exist in reality and then anchors HIGH confidence on them. S052 claims an Art Deco "reproduction" predating Art Deco by 55 years (you cannot reproduce a future style). S054 projects the date 74 years past today's real-world date (2026-06-04). In both cases the engine had correct style attribution conf 0.82–0.92 and a convergence zone matching the actual production period, but the reconciliation logic preferred a competing zone / wave that produced the incoherent claim.

S054 also surfaces a separate hard-negative-floor clamp bug: P2 reasoning says "hard-negative post-floor evidence clamps the floor to 1990" but `plywood_structural` HARD NEGATIVE dateHint is `c. 1905–1930`. The clamp landed at 1990 — possibly reading the convergence-zone ceiling (1870–1990) or the unparseable style_wave 1990-null as the floor anchor instead of the dateHint.

**Code locations:**
- `lib/engineStyleReconciliation.ts` — revival_wave and reproduction-kind reasons; needs temporal-logic guard
- `lib/engine.ts` P2 frame-dating path — hard-negative floor clamp computation (likely reading wrong source)
- `lib/engineStyleEvaluator.ts` — revival-wave selection picks open-ended `1990-null` waves whose null ceiling defaults to year 2100

**Proposed approach:**
1. **Temporal-logic guard on reconciliation reasons** — never emit `kind=reproduction` when working_range_floor < style_floor (you can't reproduce a future style). Never emit a frame_ceiling > current_year.
2. **Hard-negative clamp must read dateHint** — not convergence-zone ceiling, not style_wave ceiling. Audit the clamp code path; tighten to dateHint floor only.
3. **Revival-wave ceiling cap** — when a style_wave has a null ceiling, cap at current_year before using it as a date range.
4. **When style attribution is well-supported (conf ≥ 0.7) and convergence zones split**, prefer the zone whose period overlaps the style's date range rather than the older zone built on weak open-ended layer floors.

**Scope:** Medium engine task. Multiple distinct logic bugs (temporal guard + clamp source + ceiling cap). All three need to land together for the symptom to fully clear.

---

### 20. M7 negation form-routing — clue-key-substring-match across multiple clue keys (ARCHITECTURE PATTERN, extends #15)

> **#15's structural fix landed**, but the symptom recurs because the LLM emits clue keys with descriptions that negate the clue in linguistic forms the `descriptionNegatesClue` regex doesn't catch. n=4 across 3 different clue keys confirms this is an architectural issue at the form-routing layer, not specific to any one clue.

**Surfaced by:**
- `peacock_emmanuelle_rattan_chair` → form_loom via `lloyd_loom_paper_fiber` (description: "natural rattan… **NOT** Lloyd loom")
- S045 Victorian curlicue wicker rocker → form_loom via same `lloyd_loom_paper_fiber` negation
- S050 vernacular pine lift-lid storage chest → form_slant_front_desk via `slant_front` clue (description: "the lid is flat (horizontal), **NOT** a slanted writing surface")
- S053 Mission Arts & Crafts library-writing table → form_secretary_desk via `drop_front_desk` clue (description: "Drop-front writing surface is visible" — but parallel writing_surface obs explicitly states "no tilt, **no** drop-front, no cylinder closure")

**Issue:** All four specimens share an identical mechanism shape: (a) clue KEY whose name substring-matches a target form alias (`lloyd_loom_paper_fiber` → form_loom, `slant_front` → form_slant_front_desk, `drop_front_desk` → form_secretary_desk); (b) description NEGATES the clue's identity OR another observation explicitly contradicts it; (c) engine consumes the negation as positive form evidence anyway; (d) form_X catastrophically selected over the legitimate form clue. Phase 0 Part A direct-form clues (`rocking_chair_form`, `parlor_rocker_form` Tier 3 wt 0.92) fire positively on S045/S051 but lose because the KEY-substring path wins.

**Code locations:**
- `lib/engine.ts` `scoreForms` — form-routing logic that substring-matches clue KEYS against form aliases
- `lib/engine.ts` `descriptionNegatesClue` — current detector misses these linguistic forms
- `lib/engine.ts` cross-observation negation — no logic recognizes that one observation can negate another (e.g., `writing_surface` saying "no drop-front" should negate `drop_front_desk` firing in parallel)

**Proposed approach:**
1. **Per-observation negation broadening** — extend `descriptionNegatesClue` to catch the linguistic forms seen here: "is/are flat, not a [X]", "not a [X] in original construction", "no [X] visible" with various intervening words/punctuation.
2. **Cross-observation contradiction detection** — when observation A's description explicitly states the absence of feature X and observation B's clue KEY is X, treat B as negated. Audit the scoring path so contradictions get resolved before scoring.
3. **Clue-KEY-substring form-routing guard** — never let a clue whose KEY substring-matches a form alias drive that form's selection without a positive description (architectural defense in depth).

**Scope:** Medium engine task. Architectural — affects EVERY form whose alias substring-matches a clue KEY. Other clue keys likely affected (per audit): `barley_twist`, `cabriole_leg`, `mid_century_streamlined_wicker`, `bar_harbor_style_wicker`, `pedestal_column`, `parlor_rocker_form`.

---

### 21. M13 — high-authority maker label captured verbatim but not propagated to display (HIGH USER-VISIBLE IMPACT)

**Surfaced by 7 specimens, all with the full firm name in the `maker_label` observation prose:**
- S022 Globe-Wernicke Co. Cincinnati (paper labels + two HIGH-tier detector clues) → display "Bookcase / open shelving unit"
- S023 General Motors Radio Corp Dayton OH (full firm + serial 56020A + context obs "dates this piece to approximately 1929-1933") → display "Queen Anne Media console"
- S024 Regina Music Box Co. Rahway NJ (full firm + Sousa disc + patent dates + 4 corroborating clues) → display "Brass bed or brass-frame furniture"
- S027 Bassett Upholstery Division Newton NC (full firm captured 3× + MEDIUM-tier maker_mark_bassett) → display "Windsor chair"
- S030 Automatic File & Index Co. 'OK' sectional barrister (full firm + sectional construction) → display "Bookcase / open shelving unit"
- S039 Sligh Furniture Co. Grand Rapids MI (medallion + MEDIUM-tier maker_mark_sligh + LOW-tier Grand Rapids Association) → display "Colonial Revival Writing box"
- S044 Goldstrom Bros / Baltimore handwritten cursive retailer inscription → display drops the retailer entirely (new sub-variant: handwritten dealer/retailer marks)

**Issue:** When a piece carries a full firm name in the `maker_label` observation prose (and frequently in multiple corroborating clues including `maker_mark_*` detectors at MEDIUM or HIGH tier), the engine consistently surfaces the form name without the maker. The display reads "Bookcase / open shelving unit" instead of "Globe-Wernicke Co. Cincinnati Bookcase." Sibling of #9 / M9 (M9 = maker DATE not parsed; M13 = maker NAME not surfaced). Form is often also wrong (M8 on S024 Regina, S027 Bassett, S039 Sligh — see #20), but even where form is correct (S022, S030) the maker is dropped.

**Code locations:**
- `lib/engine.ts` form-display string assembly — currently `<style_context> <form_label>` template, no maker injection
- `lib/engine.ts` `matchMakerMarks` — has detector hits but the matched firm name isn't read by the display layer
- `lib/engineCanonicalMap.ts` `FORM_LABEL_TO_CANONICAL` — display labels don't carry maker placeholder

**Proposed approach:**
1. **Surface maker when matchMakerMarks fires at MEDIUM+ tier** — prepend or append the matched firm name to the display label (e.g., `"Globe-Wernicke Co. Bookcase"` or `"Bookcase by Globe-Wernicke Co."`).
2. **Also surface maker_label observation prose when it captures a firm name** even without a matchMakerMarks detector — needs a firm-name-extraction pass on label prose (a small NER-style regex set).
3. **Handwritten dealer/retailer marks** (S044 Goldstrom Bros) need separate handling — could be a sub-display line ("Retailer: …") rather than the primary maker attribution.

**Scope:** Small-medium. Calibration + display-string work; high user-visible payoff (the piece's most valuable identification anchor is currently invisible).

---

### 22. TAXONOMY-GAP form misclassification — form doesn't exist in canonical, fallback to closest-in-scope is most-confident-wrong answer (ARCHITECTURE GAP, distinct from #17)

**Surfaced by:**
- S026 modern walnut workshop harpsichord → form_music_stand (no `form_harpsichord` in canonical; `harpsichord_form` + `keyboard_instrument_case` fire as [form] clues with no canonical home; `music_desk_present` describing the sheet-music rack accessory wins by being the closest in-scope match)
- S036 mid-century fiberglass cachepot planter → "Wicker / rattan furniture" (no `form_planter` / `form_cachepot` in canonical; M0 `woven_body` false-positive on fiberglass surface + `mid_century_streamlined_wicker` route)
- S038 Space Age cone chair (Verner Panton derivative c. 1965–75) → form_bench (no `form_cone_chair` / `form_swivel_chair` / `form_pedestal_chair` / `form_space_age_chair` in canonical; seven explicit Space Age clue keys all bucket [structure] or [style] at wt 0.37–0.55; generic `pedestal_column` 0.97 + `seating_surface` 0.85 win to form_bench)

**Issue:** Distinct from #17 (orphaned forms that exist in canonical but aren't reachable via `scoreForms`). #22 is forms that DON'T EXIST in canonical at all — the piece type isn't in the engine's vocabulary, so even if the LLM correctly identifies the piece (S026: explicit "harpsichord, grand form"; S038: explicit "Verner Panton's Cone Chair"), the form-selection logic has nowhere to route it. Falls back to the closest in-scope canonical form. Worst case: the answer LOOKS confident (form correctly identified at primary-form level — "Music stand," "Bench") but is catastrophically wrong (a harpsichord is not a music stand).

**Code locations:**
- `lib/constraints/canonicalVocabulary.generated.ts` — taxonomy authoring (the gap)
- `lib/engine.ts` `scoreForms` — fallback logic when no in-scope form matches

**Proposed approach:**
1. **Author missing canonical forms** for the surfaced gaps: `form_harpsichord` (under musical_mechanical), `form_planter` / `form_cachepot` (under entry_support or new category), `form_cone_chair` / `form_swivel_chair` / `form_pedestal_chair` (under seating).
2. **Or: out-of-scope detection** — when no in-scope canonical form gets reasonable weight (best score < threshold) AND P0 emits a clue with no canonical home (`harpsichord_form`, `cone_chair_form`), surface "Out of scope — possible [piece type]" rather than forcing a fallback identification.
3. **Audit P0 output for `*_form` clue keys with no `CLUE_TO_CANONICAL` entry** — these are the canary signals that the engine's vocabulary is short.

**Scope:** Medium taxonomy + small engine. Distinct from #17 but related. The "out-of-scope" detection path (option 2) is the architectural fix; canonical authoring (option 1) is per-form.

---

### 23. CLUE_LIBRARY semantic-too-broad cluster — clues fire on pieces where they don't structurally apply (CALIBRATION CLUSTER)

**Surfaced by promotion-bar specimens (each n=3):**
- `writing_surface` (n=3: S044 marble-top pedestal stand, S046 library table, S050 storage chest) — fires at conf 84 wt 0.94 [function] on a pedestal stand with "consistent with a desk, secretary, or writing table"
- `secondary_surface` (n=3: S049 cast-iron radiator visible in background, S050 chest back gallery rail, S053 library table side shelves) — fires on background objects or primary structural features
- `drop_front_desk` (n=3: S039 Sligh flat-top console table, S048 Colonial Revival pair, S053 Mission library table) — fires on flat-top pieces with no drop-front; description literally "Drop-front writing surface is visible" while parallel writing_surface obs states "no drop-front"
- `pedestal_column` (multiple: S038 cone chair → form_bench, S044 marble-top, S047 curio cabinet, S053 4-leg library table) — fires on any centered structural support including 4-leg bases

**Issue:** The clue KEYS are useful when correctly applied, but the LLM emits them on pieces where the structural feature isn't present. Each clue carries high enough weight (drop_front_desk 0.98, writing_surface 0.94, pedestal_column 0.97) to drive form selection when it fires falsely. Drop_front_desk shows the cleanest pattern: it's genuine ~50% of the time (correctly fires on S054, S048 right-half, S053) and false ~50% of the time (S039 flat-top console table, S048 secretary attached to china cabinet, S053 library table).

Adjacent pattern noted but not promoted: `barley_twist` clue firing on spool/bobbin turning (description acknowledges "sometimes called barley-twist variant" — not actually barley twist), `tripod_base` firing on a 4-leg quadripod base (description literally "making this a quadripod rather than true tripod"), `cabriole_leg` firing on splayed scrolled legs that aren't cabriole. KEY-vs-content mismatch is a broader CLUE_LIBRARY discipline issue.

**Code locations:**
- `lib/engine.ts` P0 prompt — needs tighter trigger conditions for these clue keys
- `lib/engine.ts` `CLUE_LIBRARY` — the affected entries' description templates and trigger guidance

**Proposed approach:**
1. **Tighten P0 prompt for the worst offenders** (drop_front_desk, writing_surface, secondary_surface, pedestal_column) — explicit block conditions ("only emit drop_front_desk if you can see the front panel hinged DOWN to a horizontal writing surface AND visible hinges at the bottom edge") parallel to Phase 0 Part A authoring.
2. **CLUE_LIBRARY weight calibration** — for clues with confirmed semantic-too-broad pattern, lower the default weight or add a confidence-floor requirement.
3. **Description-conflict guard** — when two observations in the same scan structurally contradict (drop_front_desk fires while writing_surface explicitly says "no drop-front"), trust the more-specific obs and downweight the conflicting one. Same shape as the #20 architectural fix.

**Scope:** Medium calibration. Mostly P0 prompt tightening; can be authored cleanly per-clue. Highest impact: drop_front_desk gate (closes #20 partially since `drop_front_desk` is one of the three negation-form-routing offenders).

---

### 24. M0 spindle-synthesis on non-Windsor pieces drives form_windsor_chair (CALIBRATION CLUSTER, distinct from #15)

**Surfaced by 3 specimens, all with NO actual spindles:**
- S001 black country rocker (flat-slat back) → "Spindle Gallery Windsor chair"
- S027 Bassett upholstered platform rocker (flat-slat back) → "Windsor chair" (post-Phase-0-Deploy)
- S051 Mission/Arts & Crafts oak armchair (solid upholstered back panel; `solid_plank_back` at conf 82 wt 0.91 describes broad solid panel) → "Arts and Crafts / Mission / Craftsman Windsor chair"

**Issue:** P0 perception auto-emits `spindle_back` (conf 78) and `spindle_gallery` (conf 70) on any chair back regardless of whether spindles are actually present. The two clue keys substring-match against `form_windsor_chair` aliases (`"Spindle chair"`, `"Sack-back chair"`) → form_windsor_chair wins via the same KEY-substring-match path documented in #20. On S027 + S051, Phase 0 Part A's correct `rocking_chair_form` Tier 3 clue (wt 0.92) fires positively but loses to the spindle FPs. CLUE_ROUTING dictionary consumption is rolled back (see PARKING_LOT.md Step 6 retry), so the Tier 3 weight alone is insufficient to defeat KEY-substring routing.

**Distinct from #20:** #20 is about clue keys whose DESCRIPTIONS negate the clue's identity. #24 is about the synthesizer over-emitting positive spindle observations on backs that don't have spindles. Same downstream consequence (form_windsor_chair selected via alias substring-match), different upstream cause.

**Code locations:**
- `lib/engine.ts` P0 prompt — spindle_back / spindle_gallery emission triggers (currently fires on any chair back)
- `lib/engine.ts` `scoreForms` — form_windsor_chair alias substring-match path

**Proposed approach:**
1. **Tighten spindle_back / spindle_gallery P0 emission** — only emit when the back is constructed from multiple discrete vertical members (turned spindles, splats, or sticks), NOT on solid panel backs or flat-slat slat-backs.
2. **Mutual-exclusion guard** — when `solid_plank_back` fires at high weight (S051: conf 82, wt 0.91), suppress spindle_back / spindle_gallery as semantically incompatible.
3. **Windsor form-routing gate** — require Windsor-specific anatomy (`plank_seat` + `splayed_turned_legs` + spindles) for form_windsor_chair selection, not just substring-match against spindle keys. Phase 0 Part A authored `windsor_chair_form` Tier 3 clue — wire it via Step 6 consumption to gate form_windsor_chair properly.

**Scope:** Medium calibration + small engine. Closes a major M8 misclassification pattern. Pairs naturally with the Step 6 consumption retry (PARKING_LOT.md) — both need Phase 0 Part A clues to actually win form selection over substring-match paths.

---

### Recorded but DEFERRED from the lamp rerun (reinforce existing open issues)

The same lamp scan reinforced two existing calibration/synthesis issues (appraiser: "the remaining weakness is mainly overclassification"):

- **Style over-classification → #11 / #1.** Engine labeled an American Victorian/Edwardian slag-glass lamp as "French Louis XVI Revival" on thin token matches (`["revival","bronze"]`, tied 0.82 with Rococo Revival `["revival","victorian"]`). The decorative program (scallop shells, foliate borders, scrolled feet, theatrical casting) reads Naturalistic Victorian / Rococo Revival, not restrained Louis XVI neoclassicism. The engine should prefer the broader period-accurate label when the specific-style match is thin or tied. Deferred to the #11/#1 style-breadth work (needs the commercial-simplification / decorative-romanticizing weighting).
- **Dating narrowed too tightly → #8 / #3.** Final range c. 1920–1930 was driven by style-wave reconciliation; construction evidence (channel-set slag glass, pot-metal casting, paneled shade) supports a broader c. 1895–1930 (strongest ~1905–1925). Convergence-zone selection over-weighted the 2-layer style_wave zone over the 4-layer construction zone. Deferred to #8 convergence-zone selection.

---

## Already-Fixed During This Stress Test (for reference)

> **Note on commit refs:** the short hashes below are *pre-squash* references. Each fix landed via a squash-merged PR, which retires the granular commit, so these hashes no longer resolve in `git`. The fixes are verified present at the code locations cited in each issue above.

| Issue | Commit | Fix |
|---|---|---|
| LLM non-determinism (same scan, different results) | `719889e` | `temperature: 0` on Claude API calls |
| "Alternate possibilities" undermined authority | `c499f34` | Removed from report display |
| Silent failure on 9-photo uploads | `04663d8` | Pre-upload payload + count validation; 413 surfacing in full-analysis mode |
| Revival pieces labeled as period (Rule 1 firing without date check) | `7a16150` | Date-overlap guard on `reconcileFinalStyle` Rule 1 |
| Clock evidence captured but routed nowhere | `3c0374f` | Wired clue routes + alias routes to existing `form_shelf_clock`; extended Victorian subtypes; NHCC maker entry; P0 prompt updated |
| Confidence cap too high with no dating-detail evidence (#4) | `2c6c72b` + `c396be8` | P1 gate caps confidence on count of dating-structural categories (joinery / fastener / toolmark / hardware / wood); 0 → 72, 1 → 80, 2 → 86, 3+ → 94 |
| "Academic" qualifier overreach (#2) | `1557d2a` + `c396be8` | softenAcademicLabel applied across all 5 reconcileFinalStyle rules (incl. Rule 3 wave names) |
| Adjacent revival-family bleed (#10, partial) | `c13cc43` | Confidence floor 0.55 + matched-term distinctness filter on user-facing alternatives |
| Lamp routed to brass-bed trap; negated clues scored as positive (#14, #15) | `5934dea` | Lamp scoring path + metal/brass-trap gating; `negated` detection excludes self-rejected clues from clue_keys / scoreForms text / weighting |
| Functional evidence overridden by fuel-word / styling resemblance (#16) | _(squashed PR)_ | Electric-first lamp routing; evaluateSubtype functional-contradiction guard + tie→null ambiguity guard |
| "Strongest convergence" narrative claimed a century-disjoint zone (M15) | `21c2660` | Null the strongest zone in `datingFindingNarrative` when it doesn't overlap `[finalDatingFloor, finalDatingCeiling]` (narrative-only; corpus fidelity unchanged) |

---

## How to Use This Document

When you're ready to batch-fix after the stress test:

1. Read through the open items in order; the priority is roughly ranked
2. For each item: review the surfacing scan(s), the code location, and the proposed approach
3. Re-examine the proposed approach with the additional stress-test data you've gathered — some calibration decisions are better made with more examples in hand
4. Decide which fixes to batch together (e.g., #1 + #2 + #5 cluster naturally around the style-evaluation engine; #3 + #8 cluster around dating-envelope logic; #4 + #7 are tactical narrative/UX wins)
5. Address them as separate commits per issue or per cluster, with clear commit messages tying back to the scan data
