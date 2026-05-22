'use client';

import React from "react";
import Link from "next/link";
import { API } from "../../lib/store";
import {
  getBasket,
  addToBasket,
  removeFromBasket,
  COMPARE_BASKET_EVENT,
  COMPARE_BASKET_MAX,
} from "../../lib/compareBasket";

/**
 * My Scans — list view of every persisted case (Stage 2 of the
 * persistence rollout). Stage 1 (commit 514ffd6) landed the IndexedDB
 * data layer that auto-saves cases on scan completion; this page
 * surfaces those saved cases for browsing.
 *
 * UX flow:
 *   - Landing here shows all persisted cases, most recent first
 *   - Each row carries an overall_front thumbnail, form name (from
 *     p3.display_form), mode badge (Field Scan / Full Analysis),
 *     confidence label, scan date, and View + Delete actions
 *   - Click "View" → navigates to /?view=case-XXXX
 *     The main page detects the query param on mount, loads the case
 *     into the in-memory store via API.loadSavedCase, sets report state
 *     to the loaded case, hides the landing, and strips the param from
 *     the URL so a refresh doesn't re-trigger the load (Stage 3 wiring
 *     in app/page.tsx)
 *   - Click "Delete" → confirms via window.confirm, calls
 *     API.deleteSavedCase, refreshes the list
 *
 * Empty state:
 *   - When IndexedDB has zero saved cases, shows a friendly empty
 *     state with a back link to start a scan
 *
 * Performance:
 *   - Listing 50+ scans is fine — listCases() returns full case
 *     objects but rendering is lightweight (~one img tag per row)
 *   - Thumbnails are the original full-resolution data_url
 *     downsized via CSS to 60×60. If sluggish on lower-end devices
 *     with 100+ saved cases, future optimization can downsize
 *     on-save in Stage 1 (lib/persistence.ts) and store a thumbnail
 *     alongside the full data.
 */
export default function MyScansPage() {
  const [cases, setCases] = React.useState<any[] | null>(null);
  const [error, setError] = React.useState<string>("");
  const [basket, setBasket] = React.useState<string[]>([]);

  // Track the comparison basket and keep it in sync across this page.
  React.useEffect(() => {
    const sync = () => setBasket(getBasket());
    sync();
    window.addEventListener(COMPARE_BASKET_EVENT, sync);
    return () => window.removeEventListener(COMPARE_BASKET_EVENT, sync);
  }, []);

  const toggleCompare = (id: string) => {
    if (basket.includes(id)) {
      removeFromBasket(id);
    } else {
      const res = addToBasket(id);
      if (res === "full") {
        setError(`Comparison holds up to ${COMPARE_BASKET_MAX} scans — remove one first.`);
        return;
      }
    }
    setError("");
  };

  // Load on mount
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await API.listSavedCases();
        if (cancelled) return;
        // Sort most-recent-first by persisted_at, then by id descending
        const sorted = [...list].sort((a, b) => {
          const aT = a?.persisted_at || "";
          const bT = b?.persisted_at || "";
          if (aT !== bT) return bT.localeCompare(aT);
          return String(b?.id || "").localeCompare(String(a?.id || ""));
        });
        setCases(sorted);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Failed to load saved scans.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const deleteCase = async (id: string) => {
    const ok = window.confirm(`Delete saved scan ${id}? This cannot be undone.`);
    if (!ok) return;
    try {
      await API.deleteSavedCase(id);
      setCases((prev) => (prev || []).filter((c) => c.id !== id));
    } catch (e: any) {
      setError(e?.message || "Failed to delete.");
    }
  };

  return (
    <main style={mainStyle}>
      <Link href="/" style={backLinkStyle}>
        ← Back to start
      </Link>

      <h1 style={headlineStyle}>My Scans</h1>
      <p style={subtitleStyle}>
        Every scan you run is saved here automatically. Click any saved scan to view its report again.
        Add scans to the comparison basket to view them side by side.
      </p>

      {basket.length > 0 && (
        <Link href="/compare" style={compareLinkStyle}>
          Compare {basket.length} {basket.length === 1 ? "scan" : "scans"} →
        </Link>
      )}

      {error && <div style={errorStyle}>{error}</div>}

      {cases === null && (
        <div style={loadingStyle}>Loading saved scans…</div>
      )}

      {cases !== null && cases.length === 0 && (
        <div style={emptyStateStyle}>
          <div style={emptyTitleStyle}>No saved scans yet.</div>
          <div style={emptyBodyStyle}>
            Run a Field Scan or Full Analysis and it&apos;ll appear here automatically. You can come back and review your scans any time.
          </div>
          <Link href="/" style={emptyCtaStyle}>
            Start a scan →
          </Link>
        </div>
      )}

      {cases !== null && cases.length > 0 && (
        <div style={listStyle}>
          {cases.map((c) => (
            <ScanRow
              key={c.id}
              caseData={c}
              onDelete={() => deleteCase(c.id)}
              inBasket={basket.includes(c.id)}
              onToggleCompare={() => toggleCompare(c.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function ScanRow({
  caseData,
  onDelete,
  inBasket,
  onToggleCompare,
}: {
  caseData: any;
  onDelete: () => void;
  inBasket: boolean;
  onToggleCompare: () => void;
}) {
  const id = caseData?.id || "?";
  const mode = caseData?.analysis_mode === "field_scan" ? "Field Scan" : "Full Analysis";
  const modeColor = caseData?.analysis_mode === "field_scan" ? "#1a2e4e" : "#6b4400";

  const p3 = caseData?.stage_outputs?.p3 || {};
  const formName = p3?.display_form || p3?.form || "Unknown form";
  const confidence = p3?.confidence || caseData?.stage_outputs?.p2?.confidence || "—";

  // Pick a thumbnail from the case images. Prefer overall_front for
  // structured intakes; fall back to the first available image for
  // field scans (which carry sequential image_types).
  const images = (caseData?.images || []) as any[];
  const thumb =
    images.find((i: any) => i?.image_type === "overall_front")?.data_url ||
    images[0]?.data_url ||
    null;

  const persistedAt = caseData?.persisted_at
    ? formatTimestamp(caseData.persisted_at)
    : "—";

  return (
    <div style={rowStyle}>
      <div style={thumbContainerStyle}>
        {thumb ? (
          <img src={thumb} alt="" style={thumbStyle} />
        ) : (
          <div style={thumbPlaceholderStyle}>—</div>
        )}
      </div>
      <div style={metaContainerStyle}>
        <div style={metaTitleStyle}>{formName}</div>
        <div style={metaRowStyle}>
          <span style={{ ...modeBadgeStyle, color: modeColor, borderColor: modeColor }}>{mode}</span>
          <span style={metaDotStyle}>·</span>
          <span style={metaTextStyle}>Confidence: <strong>{confidence}</strong></span>
        </div>
        <div style={metaSubStyle}>
          {persistedAt} <span style={metaDotStyle}>·</span> {id}
        </div>
      </div>
      <div style={actionsStyle}>
        <Link href={`/?view=${encodeURIComponent(id)}`} style={viewButtonStyle}>
          View →
        </Link>
        <button
          type="button"
          onClick={onToggleCompare}
          style={inBasket ? compareButtonActiveStyle : compareButtonStyle}
        >
          {inBasket ? "In compare ✓" : "Compare"}
        </button>
        <button type="button" onClick={onDelete} style={deleteButtonStyle}>
          Delete
        </button>
      </div>
    </div>
  );
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const datePart = d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timePart = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${datePart}, ${timePart}`;
  } catch {
    return iso;
  }
}

// ─────────────────────────────────────────────────────────────────────
// Styles — brand palette: cream / navy / gold / dark walnut / body
// ─────────────────────────────────────────────────────────────────────

const NAVY = "#1a2e4e";
const GOLD = "#b9956a";
const CREAM = "#f5f0e8";
const BORDER = "#d9ccb5";
const DARK = "#352719";
const BODY = "#594734";
const SUBTLE = "#8a7c6a";

const mainStyle: React.CSSProperties = {
  maxWidth: 820,
  margin: "0 auto",
  padding: "32px 24px 64px",
  color: DARK,
  fontFamily:
    "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
};

const backLinkStyle: React.CSSProperties = {
  fontSize: 13,
  color: BODY,
  textDecoration: "none",
  display: "inline-block",
  marginBottom: 16,
};

const headlineStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: 28,
  lineHeight: 1.15,
  fontWeight: 700,
  letterSpacing: "-0.01em",
};

const subtitleStyle: React.CSSProperties = {
  margin: "0 0 24px",
  fontSize: 14,
  color: BODY,
  lineHeight: 1.55,
};

const errorStyle: React.CSSProperties = {
  padding: "10px 14px",
  background: "#fff4f4",
  border: "1px solid #e6c5c5",
  borderRadius: 8,
  color: "#7a2222",
  fontSize: 13,
  marginBottom: 16,
};

const loadingStyle: React.CSSProperties = {
  padding: "20px",
  textAlign: "center",
  color: SUBTLE,
  fontSize: 14,
  fontStyle: "italic",
};

const emptyStateStyle: React.CSSProperties = {
  padding: "32px 28px",
  background: "#fff",
  border: `1px solid ${BORDER}`,
  borderLeft: `3px solid ${GOLD}`,
  borderRadius: 10,
  textAlign: "center",
};

const emptyTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: DARK,
  marginBottom: 8,
};

const emptyBodyStyle: React.CSSProperties = {
  fontSize: 14,
  color: BODY,
  lineHeight: 1.55,
  marginBottom: 18,
};

const emptyCtaStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 18px",
  background: NAVY,
  color: "#fff",
  textDecoration: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
};

const listStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "12px 14px",
  background: "#fff",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
};

const thumbContainerStyle: React.CSSProperties = {
  flexShrink: 0,
  width: 60,
  height: 60,
  borderRadius: 6,
  overflow: "hidden",
  background: CREAM,
  border: `1px solid ${BORDER}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const thumbStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const thumbPlaceholderStyle: React.CSSProperties = {
  color: SUBTLE,
  fontSize: 18,
};

const metaContainerStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

const metaTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: DARK,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const metaRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  color: BODY,
  flexWrap: "wrap",
};

const modeBadgeStyle: React.CSSProperties = {
  padding: "1px 8px",
  border: "1px solid",
  borderRadius: 12,
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const metaTextStyle: React.CSSProperties = {
  fontSize: 13,
  color: BODY,
};

const metaDotStyle: React.CSSProperties = {
  color: BORDER,
};

const metaSubStyle: React.CSSProperties = {
  fontSize: 12,
  color: SUBTLE,
  marginTop: 2,
};

const actionsStyle: React.CSSProperties = {
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  alignItems: "stretch",
};

const viewButtonStyle: React.CSSProperties = {
  padding: "7px 14px",
  background: NAVY,
  color: "#fff",
  textDecoration: "none",
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  textAlign: "center",
  whiteSpace: "nowrap",
};

const deleteButtonStyle: React.CSSProperties = {
  padding: "6px 12px",
  background: "transparent",
  color: SUBTLE,
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};

const compareButtonStyle: React.CSSProperties = {
  padding: "6px 12px",
  background: "transparent",
  color: NAVY,
  border: `1px solid ${GOLD}`,
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
};

const compareButtonActiveStyle: React.CSSProperties = {
  ...compareButtonStyle,
  background: NAVY,
  color: "#fff",
  border: `1px solid ${NAVY}`,
};

const compareLinkStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: 16,
  padding: "8px 16px",
  background: NAVY,
  color: "#fff",
  textDecoration: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
};
