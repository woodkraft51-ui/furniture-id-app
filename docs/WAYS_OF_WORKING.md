# Ways of Working — engine-fix process

How we move from "I see a problem" to "it's shipped on `main`". There is one
**default process** that protects against subtle regressions, and a **fast-path**
for fixes that are obviously small, additive, and clean.

The point isn't to pick the path that's most fun — it's to match the ceremony
to the actual risk. Big or speculative changes earn the long loop; trivially
safe ones don't need it.

---

## Default process (the formal loop)

Used for any fix where the blast radius isn't obviously bounded.

1. **Snapshot the corpus baseline.**
   `node --import tsx scripts/_scanCorpus.ts --snapshot` — freezes the current
   output of all 39 fixtures into the gitignored baseline JSON. This is the
   "before" picture we'll compare against.
2. **Diagnose.** Read the failing scan, identify the symptom, trace it through
   the engine until you find the mechanism (not just the surface).
3. **Compare against the corpus.** Which existing fixtures show the same
   symptom or mechanism? Is this a known pattern (one of the M1–M18 / #15a /
   #15b findings) or a new one?
4. **Assign to the problem-solving list.** Add the entry to
   `docs/stress-test-findings.md` (new finding) or note the existing finding
   it maps to. This is the audit trail.
5. **Apply the targeted root-cause fix.** One mechanism, smallest change that
   resolves it. No drive-by cleanups.
6. **Measure blast radius.**
   - `node --import tsx scripts/_scanCorpus.ts --diff` — shows CHANGED vs
     unchanged for every fixture, including internal field shifts that the
     fidelity gate doesn't catch.
   - `npm test` — 125 tests (86 unit + 39 corpus fidelity).
   - `npm run typecheck` — clean.
7. **Study the diff carefully.** Anything CHANGED needs a defensible reason.
   "Outward verdict identical, internal evidence tightened" is good. "A
   fixture's date moved" is a decision point: update the fixture's `asSeen`
   (re-baseline) or revert and rethink.
8. **PR + CI + squash-merge.** CI runs typecheck + 125 tests on the PR. On
   green, squash-merge to `main` — Render auto-deploys.
9. **Record the deploy** in `docs/DEPLOYMENTS.md` with the new `main` SHA and
   the rollback target (the prior `main` HEAD).

---

## Fast-path (skip the deliberation phase, keep the safety net)

When the fix is **clearly** small, additive, traceable, and safe, the
diagnose-and-deliberate write-up is overhead we don't need. The safety net
(CI + corpus tests + PR audit) stays. Only the deliberation compresses.

### All of these must hold

- **Small.** Roughly 1–5 lines in 1–2 files. (Doc edits don't count.)
- **Additive only.** The change can ADD detection/tolerance/coverage. It
  cannot *drop or weaken* anything — no narrowing a regex, no removing a
  clue, no tightening a threshold downward.
- **Mechanically traceable.** You can describe the chain from observation →
  engine code → wrong output in concrete terms. Not "I think this might
  be it."
- **Maps to an existing finding family.** The bug class is already on the
  problem-solving list (or is a clean sub-finding of one). First contact
  with a new bug class earns the full loop.
- **Corpus diff is clean.** Zero outward-verdict regressions across all 39
  fixtures. Internal shifts are acceptable only if defensible (tighter
  zones, dropped ghost evidence — good; verdicts changing — full loop).
- **Tests pass.** 125/125 before and after.

### Fast-path workflow

1. Snapshot the baseline (still cheap, still worth it — it's how you prove
   the diff is clean).
2. Apply the fix.
3. `npm test` + corpus `--diff`.
4. If clean — small focused PR titled with the finding number.
5. Brief findings-doc entry (the audit trail is non-negotiable).
6. CI green → squash-merge → deploy log.

### Still required (don't skip)

- **PR.** No direct pushes to `main` for anything that touches engine code.
- **CI.** The 125-test gate runs regardless of how confident we are.
- **Findings doc entry.** Future-you needs to know this happened and why.

---

## When the fast-path doesn't apply

- **Scoring weights, convergence-zone algorithm, form-routing core, P0
  parsing, dating-layer assembly** — high blast radius by nature.
- **Anything that DROPS coverage.** Narrowing a regex, removing a clue from
  `CLUE_LIBRARY`, raising a confidence threshold. These can silently mask
  real signals; need the full diff scrutiny.
- **Changes that shift `asSeen`-encoded outputs across multiple fixtures.**
  Re-baselining requires understanding why each one moved.
- **First fix in a new bug class.** Map the problem space (find adjacent
  cases in the corpus, write the finding) before fixing.
- **Hypothesis-only diagnoses.** If the mechanism isn't traceable end-to-end,
  the fix isn't really targeted — earn the full loop until it is.

---

## Case study — #15b (2026-05-28)

**Symptom.** An American Art Deco waterfall vanity (c. 1935–1948) returned
`c. 1860–1910 / Art Deco vocabulary (post-1860 reproduction)`.

**Trace.** `thick_veneer` clue self-negates in prose ("rather than hand-sawn
thick veneer") but `descriptionNegatesClue` returned false. The gap regex
`(?:\w+\s+){0,3}` between "rather than" and "thick veneer" failed because
`\w+` doesn't traverse the hyphen in "hand-sawn". The clue entered scoring
as positive evidence, anchoring a false pre-1910 ceiling on the wood layer.

**Fix.** `\w+` → `[\w-]+` in the gap regex. One character.

**Fast-path eligibility check.**
- Small: 1 character. ✓
- Additive: `\w+` is a subset of `[\w-]+`; every previously-matched string
  still matches. ✓
- Traceable: regex error with a clean cause→effect chain through the engine. ✓
- Existing family: sub-finding of #15 (negation), sibling of #15a. ✓
- Corpus diff clean: 38/39 unchanged; 1 fixture had outward verdict identical
  with internal zones cleaned up. ✓
- Tests: 125/125 before and after. ✓

**Outcome.** Diagnosed, applied, validated, and shipped in one session,
without the diagnose-and-deliberate write-up overhead. CI + corpus +
findings-doc audit trail intact.
