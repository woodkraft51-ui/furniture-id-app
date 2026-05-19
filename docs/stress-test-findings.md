# Stress-Test Findings & Post-Test Fix Queue

> **Status:** Active stress test in progress (2026-05-20). User running 50 scans on real American antique furniture pieces. Issues observed during testing are recorded here for batch-fix work after the test completes.
>
> Already-fixed items are listed at the bottom for reference. This document is the canonical record of patterns the stress test surfaced — keep it updated as new patterns emerge.

---

## Open Issues — Ranked by Stress-Test Impact

### 1. Commercial simplification suppression (HIGHEST PRIORITY)

**Surfaced by:** French Provincial Revival upholstered armchair scan, 2026-05-20.

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

**Surfaced by:** French Provincial Revival upholstered armchair scan (95% confidence cap with major unknowns: no underside, no joinery visibility, no fastener evidence, no rail structure).

**Issue:** `Phase1Gate.confidence_cap_pct` currently calculates from observation count + clue authority. Doesn't account for what's MISSING — when structural-evidence layers (joinery, fasteners, toolmarks, wood-evidence) have 0 contributing clues, the cap should drop regardless of style cap.

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

## Already-Fixed During This Stress Test (for reference)

| Issue | Commit | Fix |
|---|---|---|
| LLM non-determinism (same scan, different results) | `719889e` | `temperature: 0` on Claude API calls |
| "Alternate possibilities" undermined authority | `c499f34` | Removed from report display |
| Silent failure on 9-photo uploads | `04663d8` | Pre-upload payload + count validation; 413 surfacing in full-analysis mode |
| Revival pieces labeled as period (Rule 1 firing without date check) | `7a16150` | Date-overlap guard on `reconcileFinalStyle` Rule 1 |
| Clock evidence captured but routed nowhere | `3c0374f` | Wired clue routes + alias routes to existing `form_shelf_clock`; extended Victorian subtypes; NHCC maker entry; P0 prompt updated |

---

## How to Use This Document

When you're ready to batch-fix after the stress test:

1. Read through items 1-9 in order; the priority is roughly ranked
2. For each item: review the surfacing scan(s), the code location, and the proposed approach
3. Re-examine the proposed approach with the additional stress-test data you've gathered — some calibration decisions are better made with more examples in hand
4. Decide which fixes to batch together (e.g., #1 + #2 + #5 cluster naturally around the style-evaluation engine; #3 + #8 cluster around dating-envelope logic; #4 + #7 are tactical narrative/UX wins)
5. Address them as separate commits per issue or per cluster, with clear commit messages tying back to the scan data
