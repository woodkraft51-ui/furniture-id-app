'use client';

import React from "react";

/**
 * TraceReport — diagnostic engine trace surfaced at the bottom of the
 * full-analysis report. Provides per-phase visibility into what the
 * engine captured, routed, and accrued so the appraiser can verify
 * that evidence collected at Phase 0 is being used correctly downstream.
 *
 * Used during app validation. Gated by a DEBUG_TRACE constant in
 * page.tsx so it can be hidden with a single boolean flip for launch
 * (and re-enabled in dev environments later).
 *
 * Recovered/rebuilt from a reference screenshot of the prior trace UI.
 * Sections match the engine's phase outputs (p0 through p6):
 *   - P0 Perception (observations + clue keys)
 *   - Frame/Upholstery clue split (Block 14)
 *   - Form identification (P3)
 *   - Style attribution ranking (P3)
 *   - Style waves detected
 *   - P4 Weighted clues (by category)
 *   - Dating overlap (per-layer evidence sources + convergence zones)
 *   - P5 Conflicts + resolutions
 *   - P2 Frame dating + upholstery layer
 *
 * Defensive rendering: every section guards against missing data.
 * If a phase output is absent or partial, the section displays "none"
 * or skips gracefully rather than throwing.
 */

type Props = {
  report: any;
};

const NAVY = "#1a2e4e";
const GOLD = "#b9956a";
const CREAM = "#f5f0e8";
const BORDER = "#d9ccb5";
const DARK = "#352719";
const BODY = "#594734";
const SUBTLE = "#8a7c6a";

export default function TraceReport({ report }: Props) {
  if (!report) return null;

  const stageOutputs = report.stage_outputs || {};
  const p0obs = (report.observations as any[]) || [];
  const p1 = stageOutputs.p1 || null;
  const p2 = stageOutputs.p2 || null;
  const p3 = stageOutputs.p3 || null;
  const p4 = stageOutputs.p4 || null;
  const p5 = stageOutputs.p5 || null;
  const p6 = stageOutputs.p6 || null;

  // P0 derived data
  const allClueKeys = uniq(p0obs.map((o) => o?.clue).filter(Boolean) as string[]);
  const obsCount = p0obs.length;
  const clueKeyCount = allClueKeys.length;

  // Stage 1B shadow snapping (observe-only; present only when P0_VOCAB_SNAP_SHADOW=1)
  const vocabShadow = (report.evidence_digest as any)?.vocab_shadow || null;

  // Block 14 frame/upholstery split — read from p4.weighted_clues by category
  const weightedClues = (p4?.weighted_clues as any[]) || [];
  const upholsteryCategories = new Set(["upholstery", "upholstery_cover", "upholstery_construction"]);
  const frameClues = weightedClues.filter((w) => !upholsteryCategories.has(w?.category));
  const upholsteryClues = weightedClues.filter((w) => upholsteryCategories.has(w?.category));

  // P4 category grouping
  const cluesByCategory: Record<string, any[]> = {};
  weightedClues.forEach((w) => {
    const cat = w?.category || "other";
    if (!cluesByCategory[cat]) cluesByCategory[cat] = [];
    cluesByCategory[cat].push(w);
  });
  const categoryNames = Object.keys(cluesByCategory).sort();

  // Style attribution + alternatives
  const styleAttr = p3?.style_attribution || null;
  const styleAlts = (p3?.style_alternatives as any[]) || [];
  const styleWaves = (p3?.style_waves as any[]) || [];
  const alternativeForms = (p3?.alternatives as string[]) || [];

  // Dating overlap
  const datingOverlap = p6?.dating_overlap || null;
  const overlapLayers = (datingOverlap?.layers as any[]) || [];
  const convergenceZones = (datingOverlap?.convergence_zones as any[]) || [];

  // P5 conflicts/resolutions
  const conflicts = (p5?.conflicts as any[]) || [];
  const resolutions = (p5?.resolutions as any[]) || [];
  const supportingContext = (p5?.supporting_context as string[]) || [];

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h2 style={headlineStyle}>
          Engine Trace <span style={{ fontWeight: 400, color: SUBTLE, fontSize: 14 }}>(diagnostic — remove before launch)</span>
        </h2>
        <p style={subtitleStyle}>
          Per-phase visibility into what the engine captured, routed, and accrued. Expand each section to inspect. Sections show raw structured data so you can verify the engine is processing each phase correctly.
        </p>
      </header>

      {/* ─── P0 Perception ─────────────────────────────────────────── */}
      <Section title={`P0 Perception — ${obsCount} observations, ${clueKeyCount} clue keys detected`}>
        <Subhead>Clue keys ({clueKeyCount}):</Subhead>
        <CommaList items={allClueKeys} />
        <Subhead>Observations ({obsCount}):</Subhead>
        {p0obs.length === 0 ? (
          <NoneLine />
        ) : (
          <div style={obsListStyle}>
            {p0obs.map((o, i) => (
              <div key={i} style={obsRowStyle}>
                <div style={obsHeaderStyle}>
                  [<span style={obsTypeStyle}>{o?.type || "?"}</span>]{" "}
                  <span style={obsClueStyle}>{o?.clue || "(no clue key)"}</span>
                  <span style={obsConfStyle}> (conf {o?.confidence ?? "?"})</span>
                </div>
                {o?.description && (
                  <div style={obsDescStyle}>{o.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ─── P0 vocab snapping (shadow, observe-only) ──────────────── */}
      <Section
        title={`P0 vocab snapping (shadow) — ${
          vocabShadow
            ? `${vocabShadow.changed.length} remap(s), ${vocabShadow.unmatched.length} unmatched`
            : "disabled"
        }`}
      >
        {!vocabShadow ? (
          <div style={{ fontSize: 13, color: SUBTLE, lineHeight: 1.6 }}>
            Shadow disabled. Set <code>P0_VOCAB_SNAP_SHADOW=1</code> to record what
            canonical-vocabulary snapping would do. Observe-only — it never changes{" "}
            <code>clue_keys</code> or any result.
          </div>
        ) : (
          <>
            <Subhead>Remaps ({vocabShadow.changed.length}):</Subhead>
            {vocabShadow.changed.length === 0 ? (
              <NoneLine />
            ) : (
              <div style={{ fontSize: 13, color: "#574634", lineHeight: 1.7 }}>
                {vocabShadow.changed.map((c: any, i: number) => (
                  <div key={i}>
                    <span style={{ color: "#8a3d2b" }}>{c.from}</span> → {" "}
                    <span style={{ color: "#2e6b3d" }}>{c.to}</span>{" "}
                    <span style={{ color: SUBTLE }}>
                      [{c.method}{typeof c.score === "number" ? ` ${c.score}` : ""}]
                    </span>
                  </div>
                ))}
              </div>
            )}
            <Subhead>Unmatched — preserved, not routed ({vocabShadow.unmatched.length}):</Subhead>
            <CommaList items={vocabShadow.unmatched} />
            <Subhead>Shadow clue keys ({vocabShadow.shadowClueKeys.length}):</Subhead>
            <CommaList items={vocabShadow.shadowClueKeys} />
          </>
        )}
      </Section>

      {/* ─── Block 14 Frame/Upholstery split ───────────────────────── */}
      <Section title={`Frame / Upholstery clue split (Block 14) — ${frameClues.length} frame · ${upholsteryClues.length} upholstery`}>
        <Subhead>Frame clues ({frameClues.length}):</Subhead>
        {frameClues.length === 0 ? (
          <NoneLine />
        ) : (
          <div style={annotatedClueListStyle}>
            {frameClues.map((w, i) => (
              <span key={i}>
                <span style={clueKeyStyle}>{w?.clue || "?"}</span>
                <span style={layerAnnoStyle}>[{w?.category || "?"}]</span>
                {i < frameClues.length - 1 && <span style={{ color: SUBTLE }}>, </span>}
              </span>
            ))}
          </div>
        )}
        <Subhead>Upholstery clues ({upholsteryClues.length}):</Subhead>
        {upholsteryClues.length === 0 ? (
          <div style={bodyTextStyle}>fed detectUpholsteryLayer → upholstery dating overlap layer: <span style={{ color: SUBTLE }}>none</span></div>
        ) : (
          <div style={annotatedClueListStyle}>
            {upholsteryClues.map((w, i) => (
              <span key={i}>
                <span style={clueKeyStyle}>{w?.clue || "?"}</span>
                <span style={layerAnnoStyle}>[{w?.category || "?"}]</span>
                {i < upholsteryClues.length - 1 && <span style={{ color: SUBTLE }}>, </span>}
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* ─── Form identification (P3) ──────────────────────────────── */}
      <Section title={`Form identification (P3) — best: ${p3?.form_id || p3?.form || "—"}`}>
        <KeyVal k="Best fit" v={`${p3?.form_id || "?"} (${p3?.form || "?"})`} />
        <KeyVal k="Display" v={p3?.display_form || "—"} />
        <KeyVal k="Confidence" v={p3?.confidence || "—"} />
        {p3?.style_context && <KeyVal k="Style context" v={p3.style_context} />}
        {p3?.subtype && <KeyVal k="Subtype" v={<code style={inlineCodeStyle}>{JSON.stringify(p3.subtype)}</code>} />}
        {p3?.hybrid && <KeyVal k="Hybrid" v={<code style={inlineCodeStyle}>{JSON.stringify(p3.hybrid)}</code>} />}
        {p3?.final_style && <KeyVal k="Final style reconciliation" v={<code style={inlineCodeStyle}>{JSON.stringify(p3.final_style)}</code>} />}
        <Subhead>Alternative forms considered ({alternativeForms.length}):</Subhead>
        {alternativeForms.length === 0 ? (
          <NoneLine />
        ) : (
          <ul style={listStyle}>
            {alternativeForms.map((alt, i) => (
              <li key={i} style={listItemStyle}>{alt}</li>
            ))}
          </ul>
        )}
      </Section>

      {/* ─── Style attribution ranking (P3) ────────────────────────── */}
      <Section title={`Style attribution ranking (P3) — top: ${styleAttr?.name || "—"}`}>
        <Subhead>Top attribution:</Subhead>
        {styleAttr ? (
          <code style={blockCodeStyle}>{JSON.stringify(styleAttr)}</code>
        ) : (
          <NoneLine />
        )}
        <Subhead>Alternatives ({styleAlts.length}):</Subhead>
        {styleAlts.length === 0 ? (
          <NoneLine />
        ) : (
          <div style={obsListStyle}>
            {styleAlts.map((alt: any, i: number) => (
              <div key={i} style={altRowStyle}>
                <span style={{ fontWeight: 600 }}>{alt?.name || alt?.style_family_id || "?"}</span>
                {typeof alt?.confidence === "number" && (
                  <span style={{ color: SUBTLE }}> (conf {alt.confidence.toFixed(2)})</span>
                )}
                {alt?.matched_terms && (
                  <span style={{ color: SUBTLE }}> · matched: <code style={inlineCodeStyle}>{JSON.stringify(alt.matched_terms)}</code></span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ─── Style waves detected ──────────────────────────────────── */}
      <Section title={`Style waves detected — ${styleWaves.length} wave(s)`}>
        {styleWaves.length === 0 ? (
          <NoneLine />
        ) : (
          <ul style={listStyle}>
            {styleWaves.map((w: any, i: number) => (
              <li key={i} style={listItemStyle}>
                {formatWaveRange(w)} <span style={{ color: SUBTLE }}>(parent: {w?.parent_style_family_id || w?.parent_id || "?"}, matched_signals: {w?.matched_signals_count ?? w?.matched_signals?.length ?? "?"})</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ─── P4 Weighted clues ─────────────────────────────────────── */}
      <Section title={`P4 Weighted clues — ${weightedClues.length} clues across ${categoryNames.length} categor${categoryNames.length === 1 ? "y" : "ies"}`}>
        {categoryNames.length === 0 ? (
          <NoneLine />
        ) : (
          categoryNames.map((cat) => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <Subhead>{cat} ({cluesByCategory[cat].length} clue{cluesByCategory[cat].length === 1 ? "" : "s"}):</Subhead>
              <div style={weightedRowsStyle}>
                {cluesByCategory[cat].map((w: any, i: number) => (
                  <div key={i} style={weightedRowStyle}>
                    <span style={clueKeyStyle}>{w?.clue || "?"}</span>
                    <span style={{ color: SUBTLE }}> — weight {typeof w?.adjusted_weight === "number" ? w.adjusted_weight.toFixed(3) : "?"}</span>
                    {w?.date_hint && (
                      <span style={{ color: SUBTLE }}> — date: {w.date_hint}</span>
                    )}
                    {w?.hard_negative && (
                      <span style={{ color: "#8a2222", fontWeight: 600 }}> · HARD NEGATIVE</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </Section>

      {/* ─── Dating overlap ────────────────────────────────────────── */}
      <Section title="Dating overlap — per-layer evidence sources">
        {!datingOverlap ? (
          <NoneLine />
        ) : (
          <>
            <KeyVal k="Overall envelope" v={`${datingOverlap.overall_floor ?? "?"}–${datingOverlap.overall_ceiling ?? "?"}`} />
            <div style={layerTableStyle}>
              {overlapLayers.map((layer: any, i: number) => (
                <div key={i} style={layerRowStyle}>
                  <div>
                    <span style={layerNameStyle}>{layer?.layer || "?"}</span>
                    <span style={{ color: BODY }}>
                      {" "}— {layer?.date_floor || layer?.date_ceiling
                        ? `${layer.date_floor ?? "?"}–${layer.date_ceiling ?? "?"}`
                        : "?"
                      } ({layer?.confidence || "none"}, {layer?.source_count ?? 0} contributing clue{layer?.source_count === 1 ? "" : "s"})
                    </span>
                  </div>
                  {Array.isArray(layer?.source_clues) && layer.source_clues.length > 0 && (
                    <div style={layerSourceStyle}>source: {layer.source_clues.join(", ")}</div>
                  )}
                  {typeof layer?.present_without_dates === "number" && layer.present_without_dates > 0 && (
                    <div style={layerUndatedStyle}>
                      present but undated: {layer.present_without_dates}
                      {Array.isArray(layer?.undated_clues) && layer.undated_clues.length > 0 && (
                        <> ({layer.undated_clues.join(", ")})</>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Subhead>Convergence zones ({convergenceZones.length}):</Subhead>
            {convergenceZones.length === 0 ? (
              <NoneLine />
            ) : (
              <ul style={listStyle}>
                {convergenceZones.map((z: any, i: number) => (
                  <li key={i} style={listItemStyle}>
                    {z?.date_floor}–{z?.date_ceiling} <span style={{ color: SUBTLE }}>({z?.layer_count} layers: {(z?.layers || []).join(", ")})</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Section>

      {/* ─── P5 Conflicts + resolutions ────────────────────────────── */}
      <Section title={`P5 Conflicts + resolutions — ${conflicts.length} conflict${conflicts.length === 1 ? "" : "s"}, ${resolutions.length} resolution${resolutions.length === 1 ? "" : "s"}`}>
        <Subhead>Conflicts:</Subhead>
        {conflicts.length === 0 ? (
          <NoneLine />
        ) : (
          <ul style={listStyle}>
            {conflicts.map((c: any, i: number) => (
              <li key={i} style={listItemStyle}>{typeof c === "string" ? c : JSON.stringify(c)}</li>
            ))}
          </ul>
        )}
        <Subhead>Resolutions:</Subhead>
        {resolutions.length === 0 ? (
          <NoneLine />
        ) : (
          <ul style={listStyle}>
            {resolutions.map((r: any, i: number) => (
              <li key={i} style={listItemStyle}>{typeof r === "string" ? r : JSON.stringify(r)}</li>
            ))}
          </ul>
        )}
        <Subhead>Supporting context:</Subhead>
        {supportingContext.length === 0 ? (
          <NoneLine />
        ) : (
          <ul style={listStyle}>
            {supportingContext.map((s, i) => (
              <li key={i} style={listItemStyle}>{s}</li>
            ))}
          </ul>
        )}
      </Section>

      {/* ─── P2 Frame dating + upholstery layer ────────────────────── */}
      <Section title={`P2 Frame dating + upholstery layer — frame range: ${p2?.range || "—"}`}>
        <KeyVal k="Frame range" v={p2?.range || "—"} />
        <KeyVal k="Frame confidence" v={p2?.confidence || "—"} />
        {typeof p2?.date_floor === "number" && <KeyVal k="Frame date_floor" v={String(p2.date_floor)} />}
        {typeof p2?.date_ceiling === "number" && <KeyVal k="Frame date_ceiling" v={String(p2.date_ceiling)} />}
        {Array.isArray(p2?.support) && p2.support.length > 0 && (
          <>
            <Subhead>Support:</Subhead>
            <ul style={listStyle}>
              {p2.support.map((s: string, i: number) => (
                <li key={i} style={listItemStyle}>{s}</li>
              ))}
            </ul>
          </>
        )}
        {Array.isArray(p2?.limitations) && p2.limitations.length > 0 && (
          <>
            <Subhead>Limitations:</Subhead>
            <ul style={listStyle}>
              {p2.limitations.map((s: string, i: number) => (
                <li key={i} style={listItemStyle}>{s}</li>
              ))}
            </ul>
          </>
        )}
        {p2?.upholstery_layer ? (
          <>
            <Subhead>Upholstery layer:</Subhead>
            <KeyVal k="Identification" v={p2.upholstery_layer.identification || "—"} />
            <KeyVal k="Range" v={p2.upholstery_layer.range || "—"} />
            <KeyVal k="Confidence" v={p2.upholstery_layer.confidence || "—"} />
            {p2.upholstery_layer.note && <KeyVal k="Note" v={p2.upholstery_layer.note} />}
            {typeof p2.upholstery_layer.original_likely === "boolean" && (
              <KeyVal k="Original likely" v={String(p2.upholstery_layer.original_likely)} />
            )}
            {p2.upholstery_layer.cross_reference_note && (
              <KeyVal k="Cross-reference note" v={p2.upholstery_layer.cross_reference_note} />
            )}
          </>
        ) : (
          <>
            <Subhead>Upholstery layer:</Subhead>
            <NoneLine />
          </>
        )}
      </Section>

      {/* ─── P1 Gate + evidence sufficiency ────────────────────────── */}
      <Section title={`P1 Gate — confidence cap: ${p1?.confidence_cap || "—"}`}>
        <KeyVal k="Confidence cap" v={p1?.confidence_cap || "—"} />
        {typeof p1?.confidence_cap_pct === "number" && <KeyVal k="Cap pct" v={`${p1.confidence_cap_pct}%`} />}
        {p1?.evidence_sufficiency_summary && (
          <KeyVal k="Sufficiency summary" v={p1.evidence_sufficiency_summary} />
        )}
        {Array.isArray(p1?.next_best_evidence) && p1.next_best_evidence.length > 0 && (
          <>
            <Subhead>Next best evidence ({p1.next_best_evidence.length}):</Subhead>
            <ul style={listStyle}>
              {p1.next_best_evidence.map((s: string, i: number) => (
                <li key={i} style={listItemStyle}>{s}</li>
              ))}
            </ul>
          </>
        )}
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details style={sectionStyle}>
      <summary style={summaryStyle}>{title}</summary>
      <div style={sectionBodyStyle}>{children}</div>
    </details>
  );
}

function Subhead({ children }: { children: React.ReactNode }) {
  return <div style={subheadStyle}>{children}</div>;
}

function KeyVal({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={keyvalRowStyle}>
      <strong style={keyvalKeyStyle}>{k}:</strong> <span style={keyvalValueStyle}>{v}</span>
    </div>
  );
}

function CommaList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return <NoneLine />;
  return <div style={commaListStyle}>{items.join(", ")}</div>;
}

function NoneLine() {
  return <div style={{ color: SUBTLE, fontStyle: "italic", fontSize: 13 }}>none</div>;
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function formatWaveRange(w: any): string {
  if (w?.date_floor && w?.date_ceiling) return `${w.date_floor}–${w.date_ceiling}`;
  if (w?.range) return String(w.range);
  if (w?.label) return String(w.label);
  return "?";
}

// ─────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  marginTop: 24,
  padding: "18px 20px 16px",
  background: CREAM,
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
};

const headerStyle: React.CSSProperties = {
  marginBottom: 14,
  paddingBottom: 12,
  borderBottom: `1px solid ${BORDER}`,
};

const headlineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 17,
  color: DARK,
  fontWeight: 700,
  letterSpacing: "-0.01em",
};

const subtitleStyle: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: 12.5,
  color: BODY,
  lineHeight: 1.5,
  fontStyle: "italic",
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 8,
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  background: "#fff",
};

const summaryStyle: React.CSSProperties = {
  padding: "10px 14px",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
  color: DARK,
  userSelect: "none",
};

const sectionBodyStyle: React.CSSProperties = {
  padding: "8px 16px 14px",
  borderTop: `1px solid ${BORDER}`,
  fontSize: 13,
  color: BODY,
  lineHeight: 1.55,
};

const subheadStyle: React.CSSProperties = {
  marginTop: 12,
  marginBottom: 6,
  fontSize: 12.5,
  fontWeight: 700,
  color: DARK,
  letterSpacing: "0.01em",
};

const commaListStyle: React.CSSProperties = {
  fontFamily: "Consolas, 'Courier New', monospace",
  fontSize: 12,
  lineHeight: 1.55,
  color: BODY,
  wordBreak: "break-word",
};

const obsListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  marginTop: 4,
};

const obsRowStyle: React.CSSProperties = {
  paddingLeft: 6,
  borderLeft: `2px solid ${BORDER}`,
};

const obsHeaderStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontFamily: "Consolas, 'Courier New', monospace",
};

const obsTypeStyle: React.CSSProperties = {
  color: GOLD,
  fontWeight: 700,
};

const obsClueStyle: React.CSSProperties = {
  color: NAVY,
  fontWeight: 600,
};

const obsConfStyle: React.CSSProperties = {
  color: SUBTLE,
};

const obsDescStyle: React.CSSProperties = {
  marginTop: 2,
  fontSize: 12.5,
  color: BODY,
  lineHeight: 1.45,
};

const annotatedClueListStyle: React.CSSProperties = {
  fontFamily: "Consolas, 'Courier New', monospace",
  fontSize: 12,
  lineHeight: 1.65,
  color: BODY,
  wordBreak: "break-word",
};

const clueKeyStyle: React.CSSProperties = {
  color: NAVY,
};

const layerAnnoStyle: React.CSSProperties = {
  color: GOLD,
  fontWeight: 600,
};

const bodyTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: BODY,
};

const keyvalRowStyle: React.CSSProperties = {
  marginBottom: 4,
};

const keyvalKeyStyle: React.CSSProperties = {
  color: DARK,
};

const keyvalValueStyle: React.CSSProperties = {
  color: BODY,
};

const inlineCodeStyle: React.CSSProperties = {
  fontFamily: "Consolas, 'Courier New', monospace",
  fontSize: 11.5,
  background: CREAM,
  padding: "1px 5px",
  borderRadius: 3,
  color: NAVY,
  wordBreak: "break-all",
  display: "inline-block",
};

const blockCodeStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "Consolas, 'Courier New', monospace",
  fontSize: 11.5,
  background: CREAM,
  padding: "8px 10px",
  borderRadius: 4,
  color: NAVY,
  wordBreak: "break-all",
  whiteSpace: "pre-wrap",
  marginTop: 4,
};

const altRowStyle: React.CSSProperties = {
  paddingLeft: 6,
  borderLeft: `2px solid ${BORDER}`,
  fontSize: 12.5,
};

const weightedRowsStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  paddingLeft: 8,
};

const weightedRowStyle: React.CSSProperties = {
  fontFamily: "Consolas, 'Courier New', monospace",
  fontSize: 12,
  lineHeight: 1.5,
};

const layerTableStyle: React.CSSProperties = {
  marginTop: 6,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const layerRowStyle: React.CSSProperties = {
  padding: "6px 10px",
  background: CREAM,
  borderRadius: 4,
  fontSize: 12.5,
};

const layerNameStyle: React.CSSProperties = {
  fontWeight: 700,
  color: NAVY,
  fontFamily: "Consolas, 'Courier New', monospace",
};

const layerSourceStyle: React.CSSProperties = {
  marginTop: 2,
  fontSize: 12,
  color: SUBTLE,
  fontFamily: "Consolas, 'Courier New', monospace",
};

const layerUndatedStyle: React.CSSProperties = {
  marginTop: 2,
  fontSize: 12,
  color: GOLD,
  fontStyle: "italic",
};

const listStyle: React.CSSProperties = {
  margin: "4px 0 0 18px",
  padding: 0,
  fontSize: 13,
  color: BODY,
  lineHeight: 1.55,
};

const listItemStyle: React.CSSProperties = {
  marginBottom: 2,
};
