# CLAUDE.md — orientation for any session working on furniture-id-app

Read this first. It is the durable orientation that survives container resets.
The latest session handoff is in `docs/handoffs/` (most recent date = current).

---

## Continuity policy (why this file exists)

Operating state — handoffs, the operating agreement, the deviation record, the
M-taxonomy — **lives in the repo, in version control.** It does NOT go in
`/root/.claude/`, `/tmp/`, or any path outside the repo: the execution
environment is ephemeral and reclaims those on reset. On 2026-06-04 three
"read these on day one" files were lost exactly this way. When you produce a
handoff or process note worth keeping, write it under `docs/` and commit it.

---

## What this app is

Professional-grade antique furniture identification web app, built by the
owner-developer for resale to appraisers, estate liquidators, and antique
dealers. **Brand promise: "the tool that professionals use — complete and
thorough."** Immediate scope: American antiques ~1850–1940. International
expansion is post-launch. Father's Day 2026 (June 21) is the soft/beta target
for the owner's own dealer network.

**Architecture:** `P0` = Claude Sonnet vision call → structured observations
(`clue`, `category`, `confidence`, `description` prose). `P1–P7` = deterministic
phases in `lib/engine.ts` consuming P0 to produce form ID, dating, style
attribution, valuation, and the report. Hosted on Render.

---

## The architectural reframe (settled — do not re-litigate)

> The engine has the answers in its own code — captured by P0 in observation
> descriptions and authored in canonical reference data — but throws them away
> at every consumption point and computes from a thin slice of metadata instead.

The fix is **not** smarter rules, more scoring math, or new architecture. It is
**widening consumption** at each point that currently reads only the thin slice,
to include the rich observation prose and the rich (owner-authored) reference
fields. The owner has rejected "replace the engine with an LLM synthesis step."
Work *inside* the existing pipeline.

First instantiation already shipped: the **maker wire** (`resolveMakerAttribution`,
`composeFormDisplay` in `lib/engine.ts`). Use it as the template for the next
wires (date-prose, then style-prose, then form-prose).

---

## Hard guardrails

- **Develop only on the owner's designated branch.** Never push elsewhere
  without explicit permission. Confirm the branch if there's any ambiguity.
- **Don't push, PR, or merge unless explicitly asked.**
- **Never** `--no-verify`, `--no-gpg-sign`, or `-c commit.gpgsign=false` unless
  the owner explicitly asks.
- **Never** put the model identifier in commits, PR text, code comments, or any
  pushed artifact. Chat replies only.
- GitHub access is restricted to `woodkraft51-ui/furniture-id-app`, via
  `mcp__github__*` tools (no `gh` CLI).
- **No fix ships that the corpus doesn't validate.** n≥3 promotion bar before
  scoping a fix. Don't tune one scan at the expense of others.
- **Contrast anchors must not regress:** S013, S014, S021, S025, S028, S029,
  S030, S033, S040, S046, S049.

## Don't-touch-without-asking

- `lib/engineDatingOverlap.ts` convergence-zone selection (heavily tuned).
- Task B Step 6 / CLUE_ROUTING consumption (last retry: 27/40 regressions,
  rolled back — see `PARKING_LOT.md`).
- fix#1 catch-all behavior (broad regression risk).
- The KNOWN-RED allowlist in `tests/corpus.test.ts` — those fixtures are pinned
  red on purpose; don't re-baseline to hide the symptom.

---

## Communication discipline

Honesty over flattery. Sincerity, never time-wasting. Direct. Brief beats
thorough. When the owner says "think," commit to a view — don't list options.
Don't propose multi-month roadmaps unless asked. Don't repeat their words back;
build on them. In auto mode, don't ask permission for small things — act. If a
foundational item prior sessions missed or deferred is blocking, surface it and
fix it before moving on.

---

## How work moves (cadence)

Full process in `docs/WAYS_OF_WORKING.md`: a **default formal loop** (snapshot →
diagnose → map to a finding → root-cause fix → measure blast radius via corpus
`--diff` + tests + typecheck → study diff → PR/CI/squash-merge → record deploy)
and a **fast-path** for changes that are small, additive, and clean. Corpus
expansion roughly every 5 scans.

**Health-check commands:**
- `npm run typecheck` — clean tsc
- `npm test` — unit + corpus fidelity tests
- `node --import tsx scripts/_scanCorpus.ts` — corpus regression (per-fixture
  fidelity; `--snapshot` to freeze a baseline, `--diff` to compare)

---

## M-taxonomy (failure-mechanism vocabulary)

The working shorthand for recurring failure mechanisms, used across fixture
`note` fields and `docs/stress-test-findings.md`. The standalone glossary was
lost on 2026-06-04; the definitions below are the ones **confirmed verbatim** in
surviving sources. The rest (M1, M2, M4, M6, M10, M12, M14, M16, M17, M20, M90…)
are in active use but their canonical one-line definitions need owner
ratification — until then, read them in context from the fixture notes.

| M | Confirmed meaning |
|---|---|
| **M0** | Perception over-emission — P0 synthesizes clues not actually present (e.g. spindle-synthesis on non-Windsor backs; "cabriole-style" on splayed legs). |
| **M5 (inverted reconciliation)** | `kind=reproduction` with a temporally impossible reason (e.g. "reproduction" of a style that didn't yet exist). |
| **M7** | Negation consumed as positive form routing — a clue whose KEY substring-matches a form alias drives that form even though its description negates it. |
| **M8** | Form misidentification (wrong canonical form selected). |
| **M9** | Maker **date** not parsed. |
| **M11** | Style attribution / reconciliation errors. |
| **M13** | Maker **name** captured but not surfaced to display. |
| **M15** | A "strongest" dating zone reported in the narrative that doesn't overlap the final working range. |

> **Follow-up (open):** ratify a canonical M-taxonomy glossary with the owner and
> commit it here, replacing the "to ratify" set above.

---

## Map of canonical docs

- `docs/handoffs/<date>.md` — session handoffs (latest = current state).
- `docs/WAYS_OF_WORKING.md` — engine-fix process.
- `docs/reapplication-matrix.md` — the reusable pattern (principle + procedure +
  rails) for widening a thin-slice read into a labeled, low-confidence fallback
  rung. Read before building the next wire (style-prose, form-prose).
- `docs/stress-test-findings.md` — fix queue (#1–#24), the live problem list.
- `docs/corpus-ledger.md` — generated; `node --import tsx scripts/_tagmap.ts --write`.
- `PARKING_LOT.md` — deferred work.
- `tests/fixtures/sessionScans.ts` — corpus fixtures with per-specimen `note`
  diagnostics (also the surviving deviation record).
