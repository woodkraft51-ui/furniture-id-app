/**
 * Single source of truth for the ENGINE version — the snapshot of the
 * dating / attribution / valuation logic that produced a given scan. This is
 * distinct from the app/build version (package.json), which tracks UI and
 * packaging. Bump this whenever engine *behavior* changes (new rules, weighting,
 * reconciliation, form routing) so that:
 *
 *   - saved scans record which engine produced them (stamped at analyze time), and
 *   - a user reviewing scan history can tell whether re-running a scan today
 *     would differ from the saved result.
 *
 * Date-stamped (YYYY.MM.DD) because the engine iterates faster than the app's
 * semver and the date is the most legible "which engine state" marker for an
 * appraiser auditing a past scan.
 *
 * Kept in its own tiny module (not engine.ts) so the root layout footer and the
 * persistence layer can import the constant without pulling the ~8k-line engine
 * into their bundles.
 */
export const ENGINE_VERSION = "2026.05.20";
