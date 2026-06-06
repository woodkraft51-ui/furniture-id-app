import { test } from "node:test";
import assert from "node:assert/strict";
import { SESSION_SCANS } from "./fixtures/sessionScans";
import { runFixture, fidelity } from "../scripts/_scanCorpus";

// Fixtures whose asSeen intentionally diverges from current engine output because
// they document a separate, tracked downstream bug (see docs/stress-test-findings.md).
// Each entry must KEEP diverging — the guard below fails if a known-red fixture
// starts passing, forcing us to delete it from this set (and close the finding).
const KNOWN_RED = new Set<string>([
  // (empty) — art_deco_candelabrum was here (#15a): correct painted_metal_finish
  // negation removed its only post-1900 anchor and dating collapsed. Resolved by
  // the last-resort dating path (engineDatingOverlap.ts): an evidence-thin piece
  // whose strongest convergence zone is a near-miss now reports that zone at Low
  // confidence with an explicit basis instead of "no idea". Now c. 1925–1945.
]);

for (const fx of SESSION_SCANS) {
  const known = KNOWN_RED.has(fx.label);
  test(`corpus fidelity${known ? " [known-red]" : ""}: ${fx.label}`, async () => {
    const got = await runFixture(fx);
    const fid = fidelity(got, fx.asSeen);
    if (known) {
      assert.equal(
        fid.ok,
        false,
        `${fx.label} is on the KNOWN_RED allowlist but now reproduces its as-seen output. ` +
          `The downstream bug appears fixed — remove it from KNOWN_RED in tests/corpus.test.ts ` +
          `and close the finding in docs/stress-test-findings.md.`
      );
    } else {
      assert.ok(
        fid.ok,
        `${fx.label} diverges from as-seen: ${fid.mismatches
          .map(([k, g, e]) => `${k}: got ${g}, expected ${e}`)
          .join(" | ")}`
      );
    }
  });
}
