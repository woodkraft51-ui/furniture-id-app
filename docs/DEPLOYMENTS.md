# Deployment Log

Render auto-deploys `main`. Each row below is one clean deploy. **Rollback-to** is
the prior known-good `main` commit — to undo a deploy, redeploy its Rollback-to SHA
in Render.

| Deploy | Date | Status | Shipped | Source branch | Rollback-to (prior `main`) |
|---|---|---|---|---|---|
| 001 | 2026-05-27 | deployed — PR #123 → `main` `8b1f81b` | Brings `main` up to the dev branch: **M15** dating-narrative guard + `stress-test-findings.md` doc hygiene, on top of the accumulated dating-fix stack (T1a/T1b/T1c, T2a, #6 Phase-1, #111-b termini, M12 …) and the scan-corpus harness + fixtures. The suspected **M14** tufted-armchair dating regression was investigated and proved to be a fixture-faithfulness artifact (stubbed-`p0` skipped negation), **not** an engine regression — branch reproduces main exactly; corpus 32/32 green. | `claude/zen-gauss-91qvM` | `ada0032` |
| 002 | 2026-05-28 | deployed — PR #126 → `main` `8deecd5` | First **engine-behavior** deploy since 001: negation hardening (#15/#15a) — the scan corpus now re-derives `negated` exactly as production does (it was consuming stale hand-baked flags), and `descriptionNegatesClue` splits a negated *presence* from a contrasted *subtype* via a quote-rule + affirmation-guard. `swivit`/`sears`/`golden_oak` re-baselined; `art_deco_candelabrum` left KNOWN-RED (#15a: style cues don't anchor dating). Adds the **first CI gate** (`.github/workflows/ci.yml`: typecheck + 125 tests on every push/PR) and promotes the scan corpus to a real test (`tests/corpus.test.ts`, `KNOWN_RED` allowlist). Vercel→Render doc/comment cleanup. (The 39-fixture corpus itself already reached `main` via record-keeping merge #125.) typecheck clean; 125/125 tests; corpus 38/39 green. | `claude/zen-gauss-91qvM` | `f6187fc` |

## How to roll back
1. In Render, open the service → **Deploys**.
2. Redeploy the **Rollback-to** commit for the deploy you want to undo.
3. Record the rollback as a new row (Status: `rollback`, Shipped: `revert NNN`).

## Logging the next deploy
- The resulting `main` SHA of the deploy just shipped becomes the **Rollback-to** of the next one.
- Capture it right after the squash-merge: `git rev-parse origin/main`, then add the new row before merging the next branch.
