# Reapplication Matrix — the pattern for dating (and the next wires)

> Distilled from the 2026-06-04 candelabrum work. Use it when a piece reports
> "no idea" / a wrong answer despite the model clearly *seeing* something, and
> when you reapply the same shape to the next consumption point (style, form).
>
> **This doc holds the *why*, the *procedure*, and the *scars*. The *what / how /
> numbers* live in the code and the corpus — don't duplicate them here, or this
> doc will rot.** The live mechanism is the fallback ladder in
> `refineDatingFromConvergence` and its caller in `lib/engine.ts` — read the
> ordering and thresholds there, not from a prose copy.

---

## The principle (one sentence)

Evidence is ranked **comparatively** — but a comparison has no answer when there's
only one contestant, so every ranked/threshold system needs a defined behavior
for the **empty room**: take the best available signal, **name what it rests on**,
and **cap confidence by how little there is** — never collapse to "no idea" while a
real signal exists.

Corollary (the owner's framing): a clue worth 4 points is ~9% of a crowded room
and **100% of an empty one**. A *threshold* rejects the lonely-but-real clue; a
*proportion* survives it.

The shape this takes in code is a **fallback ladder**: the strongest source wins;
each rung below fires only when the rungs above can't; the lowest rungs are
labeled and pinned to low confidence. (Concrete ladder: see the code.)

---

## Reapplication procedure — applying this to the next wire (style, form)

1. **Find the thin-slice read.** The consumption point that computes from
   metadata while the rich answer sits unread (date: the category→layer map +
   zone qualifier; style: token scrape; form: alias substring-match).
2. **Widen the read** to the rich source already in hand (construction envelopes,
   observation prose, owner-authored reference fields).
3. **Add it as a low rung, not an override.** A new thin source fires only when
   better sources don't, is pinned to low confidence, and names its basis. It
   must **defer** to any stronger source (the dating last-resort defers to the
   style-prose anchor — that one yield is what keeps contrast anchor S033 correct).
4. **Calibrate the trigger from the corpus, don't guess.** Dump the deciding
   metric for every changed fixture and read the natural gap between the wins and
   the regressions off the data. (For dating it was effective-layer-count, with a
   clean gap that set the near-miss line — see the code constant for the current
   value.)
5. **Validate fixture-by-fixture.** Snapshot → `--diff` → classify each change as
   win / neutral / regression → re-baseline **only with owner approval**.

---

## The rails (each tied to a scar from this session)

- **Boundedness ≠ datable.** A bounded date hint isn't automatically a real
  *mechanism*. A soft weave trait (`wicker_weave_open`) stamped 1900–1920 on a
  mid-century chair. → admit only a **curated mechanism subset**, not "anything
  bounded."
- **Defer to the better thin-evidence source.** A near-miss zone is worse than an
  explicit era written in prose — so the last resort yields to the style-prose
  anchor. (Without this, S033 broke.)
- **Don't override an already-good answer.** Last resort is for an empty or
  contradictory room — not for narrowing a date the engine already nails.
- **Never regress a contrast anchor** — S013, S014, S021, S025, S028, S029, S030,
  **S033**, S040, S046, S049. **Check the fixture `note` for "CONTRAST CASE"
  before assuming a change is safe.** (This session S033 was nearly regressed
  because its anchor status was missed — the `--diff` + the note caught it.)
- **Label the basis, cap confidence.** The brand promise is "complete and
  thorough." A dated-from-style-alone answer must *say so*, at low confidence —
  that honesty is the feature, not a hedge.
- **Measure blast radius every time.** Every step here started too broad (13
  changed, then 5) before the `--diff` shrank it to the right 4.

---

## What's already wired (so this doc stays thin)

- **The code** — the ladder executes in `refineDatingFromConvergence` + its
  caller. Source of truth for ordering and thresholds.
- **The corpus** — the contrast anchors + the fidelity gate enforce the rails;
  the re-baselined fixtures pin the behavior green. Source of truth for "did it
  regress."
