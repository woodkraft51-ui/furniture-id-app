# Deployment Log

Render auto-deploys `main`. Each row below is one clean deploy. **Rollback-to** is
the prior known-good `main` commit — to undo a deploy, redeploy its Rollback-to SHA
in Render.

| Deploy | Date | Status | Shipped | Source branch | Rollback-to (prior `main`) |
|---|---|---|---|---|---|
| 001 | 2026-05-27 | pending merge approval | Brings `main` up to the dev branch: **M15** dating-narrative guard + `stress-test-findings.md` doc hygiene, on top of the accumulated dating-fix stack (T1a/T1b/T1c, T2a, #6 Phase-1, #111-b termini, M12 …) and the scan-corpus harness + fixtures. **Caveat:** carries the known **M14** tufted-armchair dating regression (this branch dates it 1900/late_period; prior `main` correctly says 1850/original). | `claude/zen-gauss-91qvM` | `ada0032` |

## How to roll back
1. In Render, open the service → **Deploys**.
2. Redeploy the **Rollback-to** commit for the deploy you want to undo.
3. Record the rollback as a new row (Status: `rollback`, Shipped: `revert NNN`).

## Logging the next deploy
- The resulting `main` SHA of the deploy just shipped becomes the **Rollback-to** of the next one.
- Capture it right after the squash-merge: `git rev-parse origin/main`, then add the new row before merging the next branch.
