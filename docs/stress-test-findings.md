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

### Recorded but DEFERRED from the lamp rerun (reinforce existing open issues)

The same lamp scan reinforced two existing calibration/synthesis issues (appraiser: "the remaining weakness is mainly overclassification"):

- **Style over-classification → #11 / #1.** Engine labeled an American Victorian/Edwardian slag-glass lamp as "French Louis XVI Revival" on thin token matches (`["revival","bronze"]`, tied 0.82 with Rococo Revival `["revival","victorian"]`). The decorative program (scallop shells, foliate borders, scrolled feet, theatrical casting) reads Naturalistic Victorian / Rococo Revival, not restrained Louis XVI neoclassicism. The engine should prefer the broader period-accurate label when the specific-style match is thin or tied. Deferred to the #11/#1 style-breadth work (needs the commercial-simplification / decorative-romanticizing weighting).
- **Dating narrowed too tightly → #8 / #3.** Final range c. 1920–1930 was driven by style-wave reconciliation; construction evidence (channel-set slag glass, pot-metal casting, paneled shade) supports a broader c. 1895–1930 (strongest ~1905–1925). Convergence-zone selection over-weighted the 2-layer style_wave zone over the 4-layer construction zone. Deferred to #8 convergence-zone selection.

---

## Already-Fixed During This Stress Test (for reference)

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
| Functional evidence overridden by fuel-word / styling resemblance (#16) | _this commit_ | Electric-first lamp routing; evaluateSubtype functional-contradiction guard + tie→null ambiguity guard |

---

## How to Use This Document

When you're ready to batch-fix after the stress test:

1. Read through the open items in order; the priority is roughly ranked
2. For each item: review the surfacing scan(s), the code location, and the proposed approach
3. Re-examine the proposed approach with the additional stress-test data you've gathered — some calibration decisions are better made with more examples in hand
4. Decide which fixes to batch together (e.g., #1 + #2 + #5 cluster naturally around the style-evaluation engine; #3 + #8 cluster around dating-envelope logic; #4 + #7 are tactical narrative/UX wins)
5. Address them as separate commits per issue or per cluster, with clear commit messages tying back to the scan data
