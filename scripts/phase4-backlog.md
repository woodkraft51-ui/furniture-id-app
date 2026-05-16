# Phase 4 Backlog

Captured during Block 4 (2026-05-16). Items surfaced during Phase 3 engine
integration work that aren't blocking Phase 3 completion but should land
before launch or in Phase 5 continuous-improvement infrastructure.

---

## P4-1 — Full Analysis payload size handling

**Surfaced during**: Block 3b verification via Vercel preview deployment.

**Problem**: Vercel serverless functions cap request payloads at 4.5MB. A
typical Full Analysis run with 5 high-resolution phone photos (each 2-4MB)
exceeds this limit; the request dies silently with HTTP 413
FUNCTION_PAYLOAD_TOO_LARGE before reaching the engine.

**Current state**: Field Scan mode has the `UploadTooLargeNotice` component
(app/page.tsx:334) that prompts the user to reduce photo count or switch
modes. Full Analysis has no equivalent guard; the throbber spins, the
request 413s, and the report never renders.

**Fix scope**:
- Add client-side image downscaling before submit (target ≤1MB/photo;
  max 1600px wide, JPEG quality 0.8)
- OR: extend UploadTooLargeNotice pattern to Full Analysis
- OR: switch /api/analyze to Edge Runtime (different limits)
- Estimated 2-4 hours

**Priority**: Pre-launch. Real users will hit this on day one.

---

## P4-2 — Evidence-vocabulary expansion in LLM observation parsing

**Surfaced during**: Block 3b rendering verification — dating-overlap viz
showed many "no signal" layers on real-photo runs.

**Problem**: P0 (LLM perception phase) returns observations keyed against
the engine's CLUE_LIBRARY vocabulary (~86 entries) plus
detectStructuralPatterns-synthesized keys (~17). The canonical evidence
libraries (joinery, fasteners, toolmarks, finish, hardware, wood) contain
hundreds of entries that the LLM prompt doesn't explicitly elicit. Real
photos surface many evidence types that never become structured
observations.

**Effect on viz**: Form/style/style-wave layers fire from any token match;
evidence layers only fire when canonical-mapped observations arrive. Result
is style-heavy reports with sparse evidence-library contributions even for
pieces rich in structural evidence.

**Fix scope**: Prompt-engineering work to elicit broader observation
vocabulary; possibly observation-shape expansion to support canonical
entry IDs as observation keys directly. Estimated 6-12 hours.

**Priority**: Pre-launch quality. Distinguishes "the engine knows things"
from "the engine acts on what it knows."

---

## P4-3 — Layer noise dampening on dating overlap

**Surfaced during**: Block 3b rendering verification — style and style_wave
layers dominate visual when other layers are quiet.

**Problem**: Style attribution and style-wave aggregator can fire from
loose token matches (e.g., one "victorian" token surfaces a wide date band).
On pieces with sparse evidence-library contributions, these visually
outweigh the higher-authority canonical evidence layers.

**Fix scope**:
- Apply stricter visual weight scaling per layer confidence
  (high/moderate/low)
- OR: gate style_wave layer rendering when style attribution confidence
  is below a threshold
- OR: add visual treatment that signals "supporting evidence only" vs
  "primary signal" per Q5 framing intent
- Estimated 2-4 hours

**Priority**: Pre-launch UX polish.

---

## P4-4 — Form layer circularity on dating overlap

**Surfaced during**: Block 3b rendering verification.

**Problem**: The "form" row in the dating-overlap viz currently mirrors
the P2 overall envelope. But P2 itself derives from form-substring
short-circuits in dateFromEvidence (e.g., `form.includes("Telephone bench")`
forces 1900-1935). The form row is therefore partially circular —
visualizing the same date envelope as the consensus.

**Fix scope**: Differentiate "form-name-based envelope" (derived from
the form_id's anti_classification_guidance.boundary_date or
period_associations) from "evidence-aggregated envelope" (the
P2 result). Show the form's intrinsic dates as the form row; let the
overall envelope appear as a separate convergence anchor.

**Estimated 3-6 hours**. May require canonical FormEntry schema work
(adding date_floor/date_ceiling at form level for forms that lack
anti_classification_guidance).

**Priority**: Pre-launch interpretability.

---

## P4-5 — Subtype evaluator scoring naïveté

**Surfaced during**: Block 1 step 6 trace verification.

**Problem**: Subtype evaluator (engineFormEvaluators.ts:evaluateSubtype)
uses content-word presence matching against
FormSubtype.distinguishing_attributes. Loose matches (e.g., "chest" +
"drawers" common to all chest_of_drawers subtypes) inflate confidence;
trace shows 0.75 confidence on the same subtype across multiple fixtures
just because observation descriptions contain generic case-furniture
language.

**Fix scope**: Apply IDF-style token uniqueness weighting (same pattern
that fixed Block 2a style attribution tie-breaking). Tokens appearing in
many subtypes' distinguishing_attributes carry less weight than tokens
appearing in only one subtype. Estimated 1-2 hours.

**Priority**: Post-launch quality. Current behavior produces consistent
but uninformative subtype assignments.

---

## P4-6 — Cousin contrast evaluator implementation

**Surfaced during**: Block 1 step 6 (B3 was deferred per D-PH3-2 lean).

**Problem**: evaluateCousinContrast() is a stub returning null. When
multiple candidate forms tie or near-tie in scoreForms, no
disambiguation pulls from FormEntry.cousin_form_contrasts narrative
strings (175 forms have these populated).

**Fix scope**: String-matching evaluator that pulls discriminating
phrases from cousin contrast narratives and matches observation evidence
against them. Per D-PH3-2 lean: start with string matching; only migrate
to structured representation (E1) if string matching proves unreliable.
Estimated 4-8 hours initial; +8-10 hours if structured migration needed.

**Priority**: Pre-launch quality on pieces with cousin-form ambiguity
(e.g., highboy vs chest-on-chest, sideboard vs server, lowboy vs
dressing table).

---

## P4-7 — Calibration review (deferred from Phase 3 D-PH3-10)

**Status**: Per Mike's D-PH3-10 lean ("skip the formal review block;
reactive weight adjustment"), the pre-integration weighting calibration
review was not executed as a discrete block. Instead, canonical authority
values became load-bearing during Block 1 step 5; Block 2c made canonical
caution_text load-bearing in P5.

**What's deferred**: A systematic sweep across all canonical libraries
(forms, families, spatial behaviors, joinery, fasteners, toolmarks,
finish, hardware, wood, style families) to verify per-entry
positive_authority + hard_negative_authority values are calibrated
consistently against each other.

**Trigger**: Will activate when trace outputs surface authority-related
behaviors Mike disagrees with on representative pieces. Reactive rather
than scheduled.

**Priority**: Reactive. May never need scheduled execution if reactive
adjustments stay tractable.

---

## P4-8 — Verification trace fixture diversification

**Status**: Current 6 fixtures (placeholder + roos_cedar_chest +
eastlake_dresser + plywood_federal_repro + pre_1860_piece +
mcm_plastic_chair) cover most engine paths but not all. Notably absent:

- A confident-modern non-hard-negative case (e.g., MCM teak credenza
  identified positively rather than via material gate)
- A revival-period case with strong authentic-revival signals (e.g.,
  Colonial Revival highboy with Centennial-era construction markers)
- An upholstered seating case exercising the upholstery_construction
  + upholstery_covers libraries
- A maker-marked case exercising matchMakerMarks
- A pre-1860 piece with anti_classification_guidance violation
  (currently no fixture lands on a form with populated guidance)

**Fix scope**: Author 5-10 additional fixtures in scripts/trace.ts as
verification surface expands. Estimated 1-2 hours per fixture.

**Priority**: As-needed during future block development.

---

## P4-9 — Phase 3 architecture documentation update

**Status**: scripts/phase3-decomposition.md was authored 2026-05-16
before Block 1 began. Some scope-shape predictions diverged from actual
execution:

- 12 sub-blocks predicted; 4 main blocks actually shipped (Mike's "stop
  blowing things up" reframe). The original decomposition's effort
  estimates (111-179h) inflated by ~2× via per-block ceremony overhead.
- HCL integration reframe (Section 0.1) was the dominant pre-execution
  reframe; smaller post-Block-1 reframes happened during execution
  (Block 2a authority-table-cleanup → style attribution).
- Several open D-PH3-N decisions were resolved during execution rather
  than upfront.

**Fix scope**: Append a "Phase 3 retrospective" section to
phase3-decomposition.md capturing what actually shipped vs what was
planned. Includes the Mike-driven reframes that compressed the work.

**Priority**: Documentation polish before Phase 4 work begins. Helps
future readers (and Mike's successor per synthesis 14) understand the
actual phase 3 trajectory.

---

## Document maintenance

Append items here as they surface during Phase 4 work. Each item:
- Source block where it surfaced
- Problem statement
- Fix scope + estimate
- Priority (pre-launch / post-launch / reactive)

When an item ships, mark "Resolved in Block N (PR #M)" inline rather
than deleting; preserves the audit trail.
