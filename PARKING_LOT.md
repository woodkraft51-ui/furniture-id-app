# Parking Lot — cleanups & follow-ups

Tracking list for deferred work surfaced during the commode-determinism fix and
the Stage 1 vocabulary migration. Newest context at top of each section.

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

- **Stale Vercel integration on the repo (RESOLVED 2026-05-28, pending owner dashboard click).**
  Migrated to Render (`render.yaml`). Deploy 002 retargeted all repo-side Vercel references
  (README, `.env.local.example`, `app/page.tsx` comments) to Render. To stop the
  "Vercel Preview Comments" check on PRs, the owner disconnects the integration:
  Vercel dashboard → project → **Settings → Git → Disconnect** (or Delete Project), AND
  GitHub → repo **Settings → GitHub Apps → Vercel → Configure** → remove this repo (or
  Uninstall). The junk `vercel/react-server-components-cve-vu-265dd9` branch (downgrades
  Next.js, deletes the codebase — not a real CVE fix) should be deleted via the Branches
  UI; recovery tip `ec86cd3` if ever needed.
- **Squash-merge branch hygiene.** Each follow-up PR needs a rebase-onto-`main`
  + force-push because prior PRs were squash-merged (branch tip isn't an ancestor
  of the squash commit). Expected, just noting the dance.
- **Engine trace "remove before launch."** The diagnostic trace block rendered in
  reports is marked for removal before launch.
