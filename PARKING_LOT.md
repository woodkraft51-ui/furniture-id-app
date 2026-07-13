# Parking Lot — cleanups & follow-ups

Tracking list for deferred work surfaced during the commode-determinism fix and
the Stage 1 vocabulary migration. Newest context at top of each section.

## Appraiser-voice for low-confidence dating rationale (2026-06-07, owner, real-world test pass)

**Parked — product/voice, not a bug.** Surfaced on scan 10 (vernacular bar stool, honestly
dated "c. 1880 onward, Low, limited evidence"). The *date* was correct and appropriately
humble; the owner's point is the **copy** is cold. A real appraiser explains *why* it's broad
with warmth and authority, e.g.:

> "Construction for this form hasn't changed much over the past 150 years. There have been
> subtle differences, but from the evidence available in the photographs submitted, …"

vs. the current terse "Limited evidence — working range remains broad at post-1880."

**Why it's tractable (and on-brand):** brand promise is "the tool professionals use." The
warm explanation can be **assembled from data the engine already holds** —
- the authored per-form period-context paragraph (era-span language),
- the era-spanning clue notes (e.g. `round_tenon` → "spans eras, colonial to present"),
- the explicit list of dating layers that returned **no datable signal**,
- replacement/limitation notes.
This is the *output-side* instantiation of the reframe (authored reference → user-facing
prose), parallel to the computation-side wires.

**Hard constraint:** compose **deterministically** from authored fields, reusing the maker-wire
template (`composeFormDisplay` / `resolveMakerAttribution`). **Do NOT** route this through an
LLM synthesis step — owner has rejected that, and a templated appraiser-voice is *more*
trustworthy because every sentence traces to an authored basis. Applies especially to the
"Current limitations" / "How we dated it · Limited evidence" copy on Low-confidence results.

**Next action when unparked:** scope a small "dating-rationale composer" that turns
(working range + which layers fired + which were era-spanning + limitation notes) into an
appraiser-voiced paragraph, sourced entirely from authored content.

## Instrument taxonomy — gaps + overlap (2026-06-07, real-world test pass scans 03/08)

**Parked by owner.** Surfaced by scans 03 (real Lyon & Healy reed organ → "Upholstered
seating") and 08 (melodeon-tagged keyboard → "Pump organ cabinet"). Two separable issues:

1. **Missing forms (owner to author later; Claude to provide a template):**
   - **Melodeon** — not authored anywhere (no form, subtype, or alias). Nearest bucket
     today: `form_pump_organ_cabinet` (alias "Parlor organ") or the `reed_organ` subtype.
   - **Square grand piano** — not authored. Only a `square_piano` *subtype* exists under
     `form_musical_instrument_furniture`; no top-level square-piano/square-grand form.
2. **Overlap to rationalize:** two top-level instrument forms cover the same territory —
   `form_pump_organ_cabinet` AND `form_musical_instrument_furniture` (which itself holds
   `reed_organ` + `square_piano` subtypes). Competing baskets for generic keyboard-cabinet
   signals is likely part of why 03/08 routing was erratic.

**Note:** the *routing* defect (affirmation-blind — pump-organ selected without
bellows/reeds/treadles) is separate from this taxonomy gap and is tracked in the
real-world test-pass batch triage, not here. This entry is taxonomy only.

**Next action when unparked:** Claude provides an authoring template (prepopulated, like the
form-wire batch) for melodeon + square grand piano; owner authors details. Also decide
whether musical instruments are in launch scope at all (American furniture 1850–1940).

## Task B Step 6 — CLUE_ROUTING consumption attempt #2 outcome (2026-05-28)

**Conclusion (owner-locked):** Before CLUE_ROUTING consumption can ship,
Phase 0 must emit stronger direct object-form clues for the forms currently
being rescued by legacy substring / membership rules. The dictionary
architecture is sound; the gating is correct; the engine is not yet ready
because too many corpus fixtures still depend on legacy substring or
membership shortcuts instead of explicit P0 object-form clue emission.

**What was tried.** Wired the owner-approved Step 6 consumption design into
`scoreForms` and `attributeStyle`:
- Form pre-pass with centralized tier multipliers
  (`CLUE_ROUTING_TIER_MULT = {3:1.5, 2:1.0, 1:0.5}`, Clarification #1).
- Conservative-first multi-clue legacy-rule gating: a Step-4 SUPPRESS-list
  rule is skipped when ANY referenced clue is in `CLUE_ROUTING` with
  `form: null` (Clarification #3).
- Haystack suppression: dictionary-mapped clues (route OR null) excluded
  from `scoreForms`'s substring `text` and from `attributeStyle`'s token /
  phrase haystack (Clarification #2).
- Trace output gated on `CLUE_ROUTING_TRACE=1` OR `unmapped > 0`:
  `formRoute / formNull / styleRoute / styleNull / unmapped /
  suppressedLegacy / hayfiltered / winners / losers` (Clarification #7).
- Style direct-route merge into `attributeStyle` results, layered with
  Task A's existing distinctive/shared phrase gate.
- `formIdToLabel(form_id)` reverse-lookup helper + `"Armchair"` /
  `"Commode"` plain-label additions to `FORM_LABEL_TO_CANONICAL`.

The WIP wiring is preserved as commit `94bd9b7` on
`claude/zen-gauss-91qvM` as evidence; **runtime files have been rolled back
to byte-identical `origin/main` (Deploy 005) state.** Typecheck clean,
126/126 tests, **no fixtures re-baselined.**

**What the validation showed.** Corpus diff vs `origin/main` baseline:
13/40 unchanged, 27/40 diverged. Trace `unmapped=0` on every fixture
(architectural integrity check held). `suppressedLegacy` fired as
designed. Wins included `logan_1914_tall_case_clock` (clock→trunk closed)
and `jacobean_revival_tall_case_clock` (same pattern). One unit test —
`tests/fixes.test.ts:263` T2a guard — broke because it asserts that bare
material clues (`metal_frame`, `cast_iron`, `wrought_iron` — all
explicit-null in the dictionary) must still score "Metal furniture" /
"Iron furniture". That assertion encodes the pre-Step-6 behavior the
Step-4 audit explicitly forbade.

**Why we did NOT ship.** Regressions cluster into three patterns, all of
which trace back to missing upstream coverage rather than to a flaw in
the dictionary / gating architecture:

1. *"Closes-via-Tier-3" doesn't fire when the Tier 3 clue isn't emitted
   by P0.* Settee, Windsor chair, Windsor rocker, parlor rocker fixtures
   still flip to substring-fallback forms (Lounge chair / Rocking chair /
   Upholstered armchair) because the appropriate Tier 3 clues
   (`settee_two_seat_form`, `windsor_rocker_form` at Tier 3) weren't
   in those fixtures' P0 emissions. The substring fallback that used to
   catch "settee" / "windsor" is correctly suppressed by haystack
   filtering on the dictionary-mapped clues that DID fire.
2. *Gated legacy rules with no Tier-routed replacement leave fixtures
   "Unclassified".* The Sears dresser and bistro table fixtures lose
   their identity because `multiple_drawer_case` / `drawer_present` /
   "bistro" substring paths are all suppressed and nothing else
   identifies the form.
3. *Step 5 D gaps confirmed.* China cabinet, vanity, peacock chair,
   milking stool — these were expected NOT to close per Step 6 §8.

**Affirmations (owner-locked, do not relax in future attempts):**
- Explicit-null suppression remains CORRECT (Clarification #2). Do not
  loosen mapped-and-null clues into form attribution.
- Step 4 material / anatomy / member-rule suppression remains CORRECT
  (Clarifications #3 + #5). Do not relax to "rescue" any single fixture.
- Do NOT add a Tier-0 substring fallback. That would recreate the same
  unsafe substring back door the dictionary is meant to replace.
- The failed outcomes are mostly missing P0 clue-emission and
  taxonomy / subtype gaps, NOT proof that the dictionary architecture
  is wrong.
- No fixtures were re-baselined.
- No runtime code remains changed after rollback.

**Priority P0 clue-emission gaps exposed by this attempt (in priority
order — these are the prerequisites for a Step 6 retry):**
- settee / loveseat / two-seat settee
- Windsor chair vs Windsor rocker (distinct object-form clues)
- rocking chair / parlor rocker / platform rocker
- chest of drawers / dresser
- bistro table
- china cabinet / display cabinet / vitrine
- vanity / dressing table
- peacock / Emmanuelle / rattan chair
- milking stool / stool subtypes

These are P0-prompt and taxonomy work, not consumption-layer work. Each
should be addressed in a separate owner-approved formal-loop session
before a Step 6 retry is scoped.

**Pointers.** Owner-approved consumption design plan + design rationale
remain in the session plan file
`/root/.claude/plans/i-am-nearing-the-unified-hopcroft.md`. WIP wiring
diff readable at commit `94bd9b7` on `claude/zen-gauss-91qvM`. Step 4
audit decisions remain canonical for any future retry.

## Observed on live scans (instrumentation stage — logged, not fixed)

- **Material-consistency / form contradictions go uncaught (P5).** Hallucinated
  clues that contradict the rest of the evidence pass through with 0 conflicts:
  (a) a brass/bronze candelabrum emitted `woven_body` (wicker, conf 76) alongside
  `metal_frame` + "entirely metal" prose → "Wicker / rattan" alternative + wicker
  tips on an all-metal object; (b) a glazed Gothic bookcase emitted
  `seating_surface`/`seating_present` (conf 82/78) → "Bench / seating" alternative
  on a bookcase. Note (b) is especially dangerous: seating clues carry the highest
  form weights (0.88/0.85), so a hallucinated seating read can hijack form ID.
  Need a consistency/mutual-exclusion conflict layer (woven vs metal vs wood as
  primaries; seating vs glazed-case form) to drop or flag the contradicted clue.
- **Revival-wave machinery can override higher-authority construction/age
  evidence.** (a) Candelabrum: wide low-confidence metal dating (1900–2000) let
  reconciliation pick the "Contemporary Deco Glam" wave (2000+) despite verdigris
  / integrated patina / galvanic corrosion read as genuine age. (b) Gothic
  bookcase: 7 style waves + a "transitional revival" overlap anchored 1900–1910
  even though hand-cut dovetails (pre-1860) and Sheraton oval pulls (1790–1820)
  point to c. 1800–1840 — and P5 didn't flag the dovetail-vs-1900s conflict.
  Construction/joinery/age evidence should outweigh style-wave convergence; a
  pre-1860 joinery signal should hard-conflict with a 1900s+ wave date.

## Architecture / engine

- **Generic, data-driven form matcher (Stage 2).** Replace the ~2,000-line
  imperative `scoreForms` (293 `add()` calls, 247 text-substring matches,
  magic-number scores, insertion-order tie-breaks) with one matcher that scores
  each form by a declared evidence signature. Root fix for the cousin-flip
  whack-a-mole (Stool → Brass bed → Nightstand).
- **`scoreForms` text-substring matching is brittle.** 247 `includesAny(text,…)`
  matches against observation prose are the direct cause of the Stool/Nightstand
  flips (the model's prose mentioning a cousin trips a match). Subsumed by the
  Stage 2 matcher; latent risk until then.
- **Style-context text-cue false positives (`deriveStyleContext`).** Same
  text-substring brittleness, style layer: `deriveStyleContext`
  (engine.ts ~5331) fires "American Empire / late Classical Revival" on
  `includesAny(text, ["empire","scrolled feet","ogee","serpentine"])`. Observed
  live: a utilitarian commode's `molded_top_edge` description ("ogee edge")
  produced a spurious American Empire style context. `ogee`/`serpentine` are
  generic molding/shape terms, not Empire-diagnostic. Surfaced only after the
  false-twin `tubular_steel` (which used to force "Modernist") was removed — not
  a regression, just the next text cue down. Logged per instruction; no change
  yet. Fix candidate: drop the generic molding terms from the Empire trigger, or
  fold style terms into the systemic controlled-vocab / signature treatment.
- **Insertion-order tie-breaking.** Equal-score forms resolve by source-code
  position (`Array.sort` stable). That *was* the Nightstand bug. Stage 2 should
  tie-break by evidence margin.
- **Magic-number bandaids to retire once Stage 2 lands:** commode add at score
  108, the nightstand `!commodeEvidence` gate, `commodeEvidencePresent` substring
  matcher, the false-twin suppression. All become declarative signatures.

## Vocabulary / P0

- **Harvest can't see indirect-consumer keys.** The vocabulary miner captures
  `CLUE_LIBRARY` + `clues.has`/`hasAny` routing keys + prompt keys, but NOT keys
  consumed by substring helpers (e.g. `commodeEvidencePresent`). Stage 1B works
  around this by also harvesting `CLUE_KEY_ALIASES` targets; longer term, every
  canonical concept key should live in one registry rather than be implied by code.
- **40 routing keys live outside `CLUE_LIBRARY`** (`*_pattern` style keys, the
  lamp vocabulary, chair-form keys, misc). Stage 1B categorizes them for the P0
  list as *presentation only*. Follow-up: properly add them to `CLUE_LIBRARY`
  with categories + weights (a measured change — affects dating/weighting).
- **Retire the hand-maintained prompt "preferred keys" prose lists.** Once P0 is
  driven by the generated vocab, the prose lists in the prompt (which already
  drift — `slotted_screw`, `thick_veneer` are prompt-only) should be deleted in
  favor of the generated block.
- **Two parallel vocabularies (clue-key vs deep taxonomy) are not unified.**
  89 clue keys have no twin in the joinery/hardware/fasteners/wood/style
  libraries. Stage 1 emits a crosswalk for visibility; unifying them (a real
  clue-key → taxonomy_id mapping) is deferred — would enable richer dating/matching.
- **Revisit `CLUE_KEY_ALIASES` + `commodeEvidencePresent`** once snap-to-canonical
  ships — the snapping layer should subsume most of the alias table.
- **`machine_made_hinge` / `corner_block_reinforcement` emission variance.** The
  model sometimes omits these dated keys entirely (not a rename), swinging
  hardware/joinery layer confidence. Not fixable by canonicalization; consider a
  P0 prompt nudge to always check for them, or stop letting their absence swing
  confidence.

## Downstream coupling

- **`valueBand` couples to the free-text form label via substring matching**
  (engine.ts ~6104–6118) — the one place a label-wording change breaks output
  *silently*. Move valuation keying to `form_id`. Highest-risk integration point
  for any matcher swap.
- **`dateFromEvidence` takes the form label cosmetically** — minor; confirm it's
  truly cosmetic when refactoring.

## Generated artifacts / tooling

- **`canonicalVocabulary.generated.ts` is ~15k lines** (subforms + crosswalk).
  If it becomes unwieldy, split crosswalk/subforms into separate generated files.

## Ops / process

- **Stale Vercel integration on the repo (RESOLVED 2026-05-28).**
  Migrated to Render (`render.yaml`). Deploy 002 retargeted all repo-side Vercel references
  (README, `.env.local.example`, `app/page.tsx` comments) to Render, and the owner deleted
  **both** Vercel projects (`furniture-id-app`, `project-hdjvz`) on 2026-05-28 — so the
  "Vercel Preview Comments" check no longer runs on PRs. Optional remaining tidy: uninstall
  the Vercel GitHub App entirely (GitHub → Settings → GitHub Apps → Vercel → Uninstall); it
  is inert now that no project is linked. Separately, the junk
  `vercel/react-server-components-cve-vu-265dd9` branch (downgrades Next.js, deletes the
  codebase — not a real CVE fix) still needs deleting via the Branches UI; recovery tip
  `ec86cd3` if ever needed.
- **Squash-merge branch hygiene.** Each follow-up PR needs a rebase-onto-`main`
  + force-push because prior PRs were squash-merged (branch tip isn't an ancestor
  of the squash commit). Expected, just noting the dance.
- **Engine trace "remove before launch."** The diagnostic trace block rendered in
  reports is marked for removal before launch.
- **CLUE_ROUTING consumption redesign (Task B 2026-05-28, deferred).**
  Task B authoring is complete and shipped (`lib/constraints/clueRoutingMap.ts`,
  525 entries). The first attempt at runtime consumption (wiring `scoreForms` +
  `attributeStyle` to consult the dictionary first, suppress mapped clues from
  legacy substring matching) was developed under formal-loop discipline and
  ROLLED BACK on 2026-05-28 after corpus-diff inspection surfaced 12 documented
  regressions vs. 8 wins. The dictionary itself remains valid as authoring data;
  the consumption strategy needs a more sophisticated design. Requirements for
  the next consumption attempt:
  - **Multi-clue form arbitration.** When multiple form-routing clues fire on
    the same scan (e.g., `settee_two_seat_form` AND `lounge_chair_form`), the
    most specific clue must win. Simple confidence-weighted addition lets the
    generic outvote the specific. Possible mechanisms: clue specificity tier,
    suppression rules ("this clue suppresses that one"), or explicit
    `weight_modifier` on dictionary entries.
  - **Specific-form-over-generic-form priority.** A piece with `settee_two_seat_form`
    must resolve to Settee, not Lounge chair, even when both clues are present.
    A piece with `wingback_form` must resolve to Wing chair, not Lounge chair.
    Etc.
  - **Subtype-aware routing.** `Milking stool` is a subtype of `form_stool`,
    `Converted dressing table desk` is a subtype of vanity/dressing-table forms,
    `China cabinet` is its own form (not generic Cabinet). Routing to the parent
    form loses these distinctions. The dictionary should support subtype
    qualification, OR more specific clue routes need authoring.
  - **Protection against unrelated `clues.has()` membership rules.** The
    consumption rollback found that suppressing a clue's substring text removes
    it from legacy substring matching but does NOT prevent independent
    `clues.has(...)` rules in `scoreForms` from firing on the same clue id —
    producing bizarre results (e.g., `art_deco_candelabrum` → "Brass bed or
    brass-frame furniture" because brass-related `clues.has()` rules still fired
    while the legitimate Candelabrum substring evidence was suppressed). Either
    the membership-check rules need migration into the dictionary too, or the
    suppression mechanism needs to cover both substring and membership paths
    cleanly.
  - **Clear handling of form routes vs style routes as separate layers.** The
    Task B authoring established the dictionary covers both, but the rollback
    showed that mixing concerns at consumption time creates interactions. Two
    separate consumption passes (one for form, one for style) with separate
    suppression semantics may be cleaner than a unified pre-pass.
  Rollback state: `lib/engine.ts`, `lib/engineStyleEvaluator.ts`, and
  `lib/engineCanonicalMap.ts` restored to Deploy-004 state. Dictionary file
  preserved with 525 authored entries including 14 audit-pass form-route
  corrections (commit `7aa9226`). Production behavior unchanged.
- **Step 5 missing-form-routes audit — conclusion + gap list (2026-05-28).**
  Audit of corpus clues against the 243 canonical form_ids for form evidence
  not yet represented in CLUE_ROUTING. Owner approved Group A = 0, Group B
  already covered, Group C all 8 borderlines stay null per Guardrail 5
  (hardware/mechanism/construction shouldn't force form alone), Group D all
  items parked. **No dictionary entries added in Step 5.**

  **ARCHITECTURAL CONCLUSION (owner-locked):**
  The remaining form-routing failures should be addressed primarily by
  improving Phase 0 (P0) clue emission and taxonomy coverage, NOT by
  over-authoring weak construction/material/anatomy clues into form routes.
  When a form fails to identify, the right intervention is upstream (give
  the LLM a form-naming clue, or extend the canonical taxonomy), not
  downstream (back-door a feature clue into routing what its description
  hints at).

  **STEP 5 GAP LIST** — each item needs either P0 clue emission improvement,
  canonical taxonomy authoring, or both:
  1. **China cabinet / display cabinet / vitrine** — P0 clue gap. No corpus
     clue names this form; the LLM emits component features (open_shelving,
     door_present, glass_top) but no `china_cabinet_form` clue. Canonical
     forms exist; needs P0 emission.
  2. **Vanity / dressing table** — P0 clue gap. Same pattern; LLM emits
     anatomy (raised_back_gallery, writing_surface, multiple_drawer_case)
     but no vanity/dressing-table form clue. Canonical forms exist; needs P0.
  3. **Peacock chair / wicker chair / rattan chair** — taxonomy gap AND P0
     clue gap. Corpus clues exist for features (`mid_century_streamlined_
     wicker`, `ring_loop_border`, `scrollwork_medallion`, `coiled_spiral_seat`,
     `victorian_curlicue_wicker`) but `form_peacock_chair`, `form_wicker_chair`,
     `form_rattan_chair` don't exist canonically. Both layers need work.
     (Already parked in Step 3 + Task A audit.)
  4. **Sconce / candlestick / candle stand** — future corpus / P0 clue gap.
     Canonical forms (`form_sconce`, `form_candlestick`, `form_candle_stand`)
     exist but no corpus fixtures use them — no clues exist yet. Authorable
     when corpus grows to include these object types.
  5. **Lamps (table / floor / desk)** — future corpus / P0 clue gap. Same
     as #4; canonical lamp forms exist, no corpus presence.
  6. **Grandfather / grandmother / granddaughter clock subtypes** — subtype
     discrimination gap. `subtype_tall_case_clock_grandfather_clock`,
     `_grandmother_clock`, `_granddaughter_clock` exist in taxonomy, but no
     corpus clue distinguishes the three by size/proportion. `clock_case_
     form` correctly routes the parent form. Needs P0 emission of a
     dimensional/proportion clue or owner authoring of a derived rule.
  7. **Milking stool / vanity stool / bar stool subtypes** — subtype clue
     gap. Stool subtypes (`subtype_stool_milking`, `subtype_stool_vanity`,
     `subtype_stool_bar`, etc.) exist in taxonomy, but no corpus clue
     specifically names a stool subtype variant. `stool_form` correctly
     routes form_stool. Needs P0 clue emission.

  **No code or dictionary changes in Step 5.** The dictionary's 30
  form-routing entries (with tiers + subtypes from Steps 2–3) remain the
  complete current authoring. Future consumption design (Step 6) consumes
  what's authored; gap items above are tracked for future authoring sessions.
- **Step 4 `scoreForms` rule audit — owner decisions for future consumption design (2026-05-28).**
  Audit of 23 `clues.has()` / `hasAny()` form-routing rules in `scoreForms`
  (high-risk categories: beds, wicker, cabinet/shelving, trunk/chest, dresser,
  desk, seating, table, material→form). Authoring decisions captured here as
  the canonical reference for the future CLUE_ROUTING consumption redesign
  (Step 6+). **NO RUNTIME CODE CHANGED IN STEP 4.**

  **ARCHITECTURAL PRINCIPLE (owner-locked):**
  A `clues.has(X)` legacy rule must NOT fire when X is in CLUE_ROUTING with
  `form: null`. The dictionary's explicit null is a considered decision
  ("this clue does not classify a form") and a membership rule firing the
  same clue as form evidence is a back-door violation of that decision.

  **KEEP LEGACY (5 rules) — narrow, correct, safe.** These guard on clues that
  are NOT in CLUE_ROUTING; they are mechanically diagnostic (mechanism/feature
  rules) or maker-label rules. They remain valid until the maker/model layer
  or finer-grained mechanical-form routing is authored:
  - `clues.has("roos_label")` → "Roos cedar chest / hope chest" (weight 120)
  - `clues.has("lane_label")` → "Lane cedar chest / hope chest" (weight 120)
  - `clues.has("drop_leaf_hinged")` → "Drop-leaf table" (weight 90)
  - `clues.has("gateleg_support")` → "Gateleg table" (weight 100)
  - `clues.has("extension_mechanism")` → "Extension table" (weight 82)

  **SUPPRESS / GATE (18 rules) — must not back-door the dictionary.** Each
  rule guards on a clue that is in CLUE_ROUTING with `form: null` (or the
  clue is a material/anatomy/feature clue that should not force form per
  Guardrails 5/6). The future consumption design MUST gate these:

  *Material → form (must not fire on material alone):*
  - `brass_frame` → "Brass bed or brass-frame furniture" (caused
    art_deco_candelabrum regression)
  - `metal_frame` / `tubular_steel` / `wrought_iron` / `cast_iron` /
    `brass_frame` / `chrome_frame` → "Metal furniture"
  - `tubular_steel` / `chrome_frame` / `chrome_and_laminate` →
    "Modernist / chrome-frame furniture"
  - `wrought_iron` / `cast_iron` → "Iron furniture"
  - `laminate_surface` / `formica_surface` / `chrome_and_laminate` →
    "Mid-century laminate / dinette furniture"
  - `molded_plastic` / `acrylic_clear` → "Modern plastic / acrylic furniture"
  - `glass_top` → "Glass-top table or mixed-material table"
  - `cane_panels` → "Caned seating or caned-back furniture"
  - `woven_body` / `rattan_frame` → "Wicker / rattan furniture" (caused
    french_bistro_iron_faux_stone_table regression)

  *Anatomy / generic feature → form (must not fire on feature alone):*
  - `door_present` → "Cabinet / dresser combination"
  - `cabinet_form` → "Cabinet"
  - `open_shelving` → "Bookcase / open shelving unit" (caused golden_oak
    china cabinet regression)
  - `multiple_drawer_case` → "Chest of drawers / dresser" (caused
    art_deco_waterfall_vanity regression)
  - `drawer_present` → "Dresser / drawer case"
  - `pigeonholes` → "Secretary desk / writing desk"
  - `seating_surface` / `seating_present` → "Bench / seating furniture"
    (caused rococo_renaissance_carved_settee regression)

  *Dictionary-conflicting form route (must not fire when dictionary disagrees):*
  - `drop_front_desk` → "Secretary desk / drop-front desk" — conflicts with
    CLUE_ROUTING.drop_front_desk → form_fall_front_desk (Tier 3, subtype
    drop_front). Dictionary wins.

  *Bug-prone rule — suppress entirely:*
  - `brass_frame` → "Upholstered seating" — guard mentions brass_frame but
    rule reason describes upholstery (apparent label/guard mismatch). Treat
    as unsafe; do not fire.

  **CONSUMPTION DESIGN OBLIGATIONS** (carried forward to Step 6):
  - For each suppressed rule above, the future consumption code must check
    CLUE_ROUTING before letting the legacy `clues.has()` rule fire.
  - When the dictionary has `form: null` for a referenced clue, the legacy
    rule is silently skipped. (When the dictionary routes the clue to a
    form, the dictionary route is authoritative — legacy rule is also
    skipped to avoid double-counting.)
  - The 5 keep-legacy rules continue firing as today.
  - 40 additional `clues.has()` / `hasAny()` calls in `scoreForms` are
    sub-conditions inside larger composite guards (not direct rules);
    deferred to a separate pass once these 23 are wired into the
    consumption design.
- **Subtype taxonomy gaps surfaced by Task B Step 3 (2026-05-28).** The
  subtype-qualifier authoring pass over the 30 form-routing dictionary entries
  cleanly matched 6 to existing canonical subtypes but surfaced **5 gaps where
  clues clearly point to a subtype that doesn't exist yet** in
  `lib/constraints/canonicalVocabulary.generated.ts`. Per Step 3 guardrails,
  no subtype ids were invented; the affected entries route to the parent form
  only. Each gap is independently authorable as proper taxonomy work:
  1. **Platform rocker subtype under `form_rocking_chair`.** Affected clues:
     `platform_rocker_base`, `platform_rocker_mechanism`,
     `victorian_platform_rocker_style`. Note that `form_rocking_chair`
     currently has ZERO subtypes — this is the deeper gap.
  2. **Windsor rocker subtype under `form_rocking_chair`.** Affected clues:
     `windsor_rocker_form`, `victorian_windsor_rocker_style`. Cross-form
     question: should Windsor rockers sit under `form_rocking_chair`
     (functional taxonomy) or under `form_windsor_chair` (chair-family
     taxonomy)? `form_windsor_chair` has subtype variants (bow-back,
     sack-back, etc.) but no "rocker" qualifier.
  3. **Parlor rocker subtype under `form_rocking_chair`.** Affected clue:
     `victorian_parlor_rocker_form`.
  4. **Close stool / chamber-pot commode subtype under `form_commode`.**
     Affected clues: `commode_chamber_pot_cabinet`, `victorian_utilitarian_form`.
     `form_commode` currently has ZERO subtypes.
  5. **Italian sgabello subtype under `form_side_chair`** (or nested under
     `subtype_side_chair_hall` if the taxonomy supports nested subtype
     treatment). `sgabello_hall_chair_form` currently routes to
     `subtype_side_chair_hall` (generic hall side chair); the Italian
     Renaissance sgabello specificity is lost.
  Authoring these subtypes is taxonomy work — NOT part of Task B consumption
  redesign, but a prerequisite-adjacent task that will let Step 3 subtype
  routing reach full diagnostic precision when the consumption layer ships.
- **Peacock chair / wicker chair / rattan chair subtype taxonomy review (Task B audit 2026-05-28).**
  During the Task B audit pass, `peacock_fan_back_form` was kept null because the
  taxonomy has no `form_peacock_chair`, `form_wicker_chair`, or `form_rattan_chair`.
  The classic mid-century imported "peacock" / "Emmanuelle" chair form (c. 1960s-80s)
  is a recognized furniture form but currently has no canonical home. Same situation
  as Porter chair. Decision: do NOT flatten peacock/wicker chair clues to
  `form_lounge_chair` during Task B; instead, review whether to author
  `form_peacock_chair` (or a `form_wicker_seating` umbrella with peacock as a subtype)
  as proper taxonomy work. Originated from the `peacock_emmanuelle_rattan_chair`
  corpus fixture. Not Task B scope.
- **Mirror French Provincial → Rococo Revival into family vocabulary (Task B 2026-05-28).**
  Task B batch 5 routed the explicit clue `french_provincial_style` →
  `style_family_rococo_revival` at the dictionary level (Cluster B canonical
  correction — French Provincial belongs to Rococo Revival's Wave 3 "French
  Provincial / Rococo Domestic Revival, 1920–1965"). Review whether
  **"French Provincial," "French Provincial Revival,"** and related domestic
  Rococo Revival language should be added to one of:
    (a) `style_family_rococo_revival.distinctive_tokens` — strongest signal but
        risks over-triggering on pieces that use "French Provincial" loosely;
    (b) `style_family_rococo_revival.shared_tokens` — corroboration only;
    (c) a separate **wave-alias field** scoped to Wave 3 specifically — the
        cleanest semantic match but requires schema work.
  CRITICAL: keep the existing distinction sharp — the loose tokens "french" and
  "provincial" must NOT route by themselves (they stay in Louis XVI's
  shared_tokens per Task A). Only the explicit named recognition routes.
- **Mirror Louis XV → Rococo Revival into distinctive_tokens (Task B 2026-05-28).**
  Task B batch 4d routed `louis_xv_revival_influence` → `style_family_rococo_revival`
  at the dictionary level (the canonical Cluster B correction case: Louis XV Revival
  vocabulary is closely tied to Rococo Revival). This dictionary-level route should
  be **mirrored back** into `style_family_rococo_revival.distinctive_tokens` by
  adding `"louis xv revival"` (and possibly `"louis xv"`) — but only after review,
  because adding "louis xv" alone could over-trigger Rococo Revival on pieces that
  use Louis XV vocabulary loosely. See `lib/constraints/clueRoutingMap.ts` entry
  for `louis_xv_revival_influence` and the Task A authoring discussion.
- **Porter chair subtype taxonomy review (Task B 2026-05-28).** During Task B
  clue dictionary authoring, `dome_canopy_back` was left null because Porter
  chair is currently only an alias under `form_wing_chair` rather than its own
  canonical form or subtype. Flattening dome/canopy-back observations to generic
  Wing chair would lose the porter-chair specificity. Decision: review whether
  to author **Porter chair as a subtype under `form_wing_chair`**, with
  `dome_canopy_back` as a high-authority subtype clue. Originated from the
  `porter_balloon_canopy_chair` corpus fixture (currently routes to Lounge
  chair, then to Wing chair via Task A). Not in Task B scope; proper taxonomy
  authoring task.
