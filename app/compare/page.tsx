'use client';

import React from "react";
import Link from "next/link";
import { API } from "../../lib/store";
import {
  getBasket,
  removeFromBasket,
  clearBasket,
  COMPARE_BASKET_EVENT,
  COMPARE_BASKET_MAX,
} from "../../lib/compareBasket";

type RecLevel = "BUY_NOW" | "BUY" | "CONSIDER" | "PASS";

function recStyle(rec?: string): React.CSSProperties {
  if (rec === "BUY_NOW") return { background: "#dff3e4", border: "1px solid #9ec8a9", color: "#1f5a2b" };
  if (rec === "BUY") return { background: "#e8f6ea", border: "1px solid #afcfb6", color: "#245b2f" };
  if (rec === "CONSIDER") return { background: "#fbf2d9", border: "1px solid #d9c27d", color: "#7a5a12" };
  if (rec === "PASS") return { background: "#f8dede", border: "1px solid #d7a1a1", color: "#7a2626" };
  return { background: "#f1ece2", border: "1px solid #d9ccb5", color: "#6a5845" };
}

export default function ComparePage() {
  const [cases, setCases] = React.useState<any[] | null>(null);

  const load = React.useCallback(async () => {
    const ids = getBasket();
    const loaded = await Promise.all(ids.map((id) => API.loadSavedCase(id)));
    // Keep basket order; drop any ids that no longer resolve (deleted scans).
    setCases(loaded.filter(Boolean));
  }, []);

  React.useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener(COMPARE_BASKET_EVENT, onChange);
    return () => window.removeEventListener(COMPARE_BASKET_EVENT, onChange);
  }, [load]);

  return (
    <main style={mainStyle}>
      <Link href="/" style={backLinkStyle}>← Back to start</Link>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <h1 style={headlineStyle}>Compare Scans</h1>
        {cases !== null && cases.length > 0 && (
          <button type="button" onClick={() => clearBasket()} style={clearButtonStyle}>
            Clear all
          </button>
        )}
      </div>
      <p style={subtitleStyle}>
        Up to {COMPARE_BASKET_MAX} saved scans, side by side. Add scans from a Field Scan
        result or from <Link href="/scans" style={inlineLinkStyle}>My Scans</Link>.
      </p>

      {cases === null && <div style={loadingStyle}>Loading…</div>}

      {cases !== null && cases.length === 0 && (
        <div style={emptyStateStyle}>
          <div style={emptyTitleStyle}>Nothing to compare yet.</div>
          <div style={emptyBodyStyle}>
            Run a Field Scan and tap “Add to comparison”, or pick scans from My Scans.
          </div>
          <Link href="/scans" style={emptyCtaStyle}>Go to My Scans →</Link>
        </div>
      )}

      {cases !== null && cases.length > 0 && (
        <div style={gridStyle}>
          {cases.map((c) => (
            <CompareColumn key={c.id} caseData={c} onRemove={() => removeFromBasket(c.id)} />
          ))}
        </div>
      )}
    </main>
  );
}

function CompareColumn({ caseData, onRemove }: { caseData: any; onRemove: () => void }) {
  const id = caseData?.id || "?";
  const p2 = caseData?.stage_outputs?.p2 || {};
  const p3 = caseData?.stage_outputs?.p3 || {};
  const fs = caseData?.field_scan || {};
  const mode = caseData?.analysis_mode === "field_scan" ? "Field Scan" : "Full Analysis";

  const formName = fs.identification || p3?.display_form || p3?.form || "Unknown form";
  const dateRange = fs.date_range || p2?.range || "—";
  const valueRange = fs.valueRange || "—";
  const confidence = fs.confidence || p3?.confidence || p2?.confidence || "—";
  const rec: string | undefined = fs.recommendation;
  const recDisplay = fs.recommendation_display || (rec ? rec.replace(/_/g, " ") : null);

  const images = (caseData?.images || []) as any[];
  const thumb =
    images.find((i: any) => i?.image_type === "overall_front")?.data_url ||
    images[0]?.data_url ||
    null;

  return (
    <div style={columnStyle}>
      <div style={thumbBoxStyle}>
        {thumb ? <img src={thumb} alt="" style={thumbImgStyle} /> : <div style={thumbPlaceholderStyle}>—</div>}
      </div>

      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div style={modeBadgeStyle}>{mode}</div>
        <div style={formNameStyle}>{formName}</div>

        {recDisplay && (
          <div style={{ ...recStyle(rec), borderRadius: 8, padding: "8px 10px", fontWeight: 800, letterSpacing: "0.03em", fontSize: 15 }}>
            {recDisplay}
          </div>
        )}

        <Field label="Date lane" value={dateRange} />
        <Field label="Resale lane" value={valueRange} />
        <Field label="Confidence" value={confidence} />

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
          <Link href={`/?view=${encodeURIComponent(id)}`} style={openButtonStyle}>Open full report →</Link>
          <button type="button" onClick={onRemove} style={removeButtonStyle}>Remove</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "#8a7c6a" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#352719" }}>{value}</div>
    </div>
  );
}

const NAVY = "#1a2e4e";
const GOLD = "#b9956a";
const CREAM = "#f5f0e8";
const BORDER = "#d9ccb5";
const DARK = "#352719";
const BODY = "#594734";
const SUBTLE = "#8a7c6a";

const mainStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "32px 24px 64px",
  color: DARK,
  fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
};
const backLinkStyle: React.CSSProperties = { fontSize: 13, color: BODY, textDecoration: "none", display: "inline-block", marginBottom: 16 };
const headlineStyle: React.CSSProperties = { margin: "0 0 8px", fontSize: 28, lineHeight: 1.15, fontWeight: 700, letterSpacing: "-0.01em" };
const subtitleStyle: React.CSSProperties = { margin: "0 0 24px", fontSize: 14, color: BODY, lineHeight: 1.55 };
const inlineLinkStyle: React.CSSProperties = { color: NAVY, textDecoration: "none", borderBottom: `1px solid ${GOLD}` };
const loadingStyle: React.CSSProperties = { padding: 20, textAlign: "center", color: SUBTLE, fontSize: 14, fontStyle: "italic" };
const clearButtonStyle: React.CSSProperties = { padding: "6px 12px", background: "transparent", color: SUBTLE, border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" };

const emptyStateStyle: React.CSSProperties = { padding: "32px 28px", background: "#fff", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${GOLD}`, borderRadius: 10, textAlign: "center" };
const emptyTitleStyle: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: DARK, marginBottom: 8 };
const emptyBodyStyle: React.CSSProperties = { fontSize: 14, color: BODY, lineHeight: 1.55, marginBottom: 18 };
const emptyCtaStyle: React.CSSProperties = { display: "inline-block", padding: "10px 18px", background: NAVY, color: "#fff", textDecoration: "none", borderRadius: 8, fontSize: 14, fontWeight: 600 };

const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, alignItems: "stretch" };
const columnStyle: React.CSSProperties = { display: "flex", flexDirection: "column", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" };
const thumbBoxStyle: React.CSSProperties = { width: "100%", aspectRatio: "4 / 3", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${BORDER}` };
const thumbImgStyle: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const thumbPlaceholderStyle: React.CSSProperties = { color: SUBTLE, fontSize: 22 };
const modeBadgeStyle: React.CSSProperties = { alignSelf: "flex-start", padding: "1px 8px", border: `1px solid ${NAVY}`, color: NAVY, borderRadius: 12, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" };
const formNameStyle: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: DARK, lineHeight: 1.3 };
const openButtonStyle: React.CSSProperties = { padding: "7px 14px", background: NAVY, color: "#fff", textDecoration: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, textAlign: "center" };
const removeButtonStyle: React.CSSProperties = { padding: "6px 12px", background: "transparent", color: SUBTLE, border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" };
