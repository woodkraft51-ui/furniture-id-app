'use client';

import { useState } from "react";
import { PHOTO_EXAMPLES } from "../lib/intake";

/**
 * ExampleModal — overlay that shows a photo-example illustration with
 * a checklist of what makes a good photo. Triggered from a "View
 * example" link on photo slots in the full-analysis intake form.
 *
 * Multi-scenario entries (currently: construction → drawer joint /
 * internal rail / saw marks) render with tabs at the top; single-
 * scenario entries render the illustration + tips directly.
 *
 * Restored from commit d939b3a; modal chrome restyled to the Proof
 * Sleuth navy + gold palette (cream background, navy header text,
 * gold tab-active accent, navy dismiss button). The photo-example
 * SVG illustrations themselves preserve their realistic wood-tone
 * palette — they represent what a photograph of furniture looks
 * like, not brand assets.
 */

type Props = {
  exampleKey: string;
  onClose: () => void;
};

const NAVY = "#1a2e4e";
const GOLD = "#b9956a";
const CREAM = "#f5f0e8";
const BORDER = "#d9ccb5";
const DARK = "#352719";
const BODY = "#594734";

export default function ExampleModal({ exampleKey, onClose }: Props) {
  const ex = PHOTO_EXAMPLES[exampleKey];
  const [tab, setTab] = useState(0);

  if (!ex) return null;

  const isMulti = "scenarios" in ex && Array.isArray(ex.scenarios);
  const current = isMulti ? (ex as any).scenarios[tab] : ex;
  const tips: string[] = isMulti ? current.checks : (ex as any).tips;
  const svg: string = isMulti ? current.svg : (ex as any).svg;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>{ex.title}</span>
          <button
            type="button"
            style={styles.closeBtn}
            onClick={onClose}
            aria-label="Close example"
          >
            ✕
          </button>
        </div>

        {isMulti && (
          <div style={styles.tabRow}>
            {(ex as any).scenarios.map((s: any, i: number) => (
              <button
                key={i}
                type="button"
                style={{
                  ...styles.tabBtn,
                  ...(tab === i ? styles.tabBtnActive : {}),
                }}
                onClick={() => setTab(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div
          style={styles.illustration}
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <div style={styles.tipsBlock}>
          <div style={styles.tipsLabel}>
            {isMulti ? "What to include in this photo:" : "What makes this a good photo:"}
          </div>
          <ul style={styles.tipsList}>
            {tips.map((tip, i) => (
              <li key={i} style={styles.tipItem}>
                <span style={styles.tipCheck}>✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <button type="button" style={styles.dismissBtn} onClick={onClose}>
          Got it — take photo →
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(26, 46, 78, 0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 300,
    padding: 16,
  },
  modal: {
    background: "#fff",
    borderRadius: 12,
    maxWidth: 420,
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 12px 40px rgba(26, 46, 78, 0.25)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px 14px",
    borderBottom: `1px solid ${BORDER}`,
    background: CREAM,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: DARK,
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    lineHeight: 1.3,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    color: BODY,
    cursor: "pointer",
    padding: "2px 6px",
    lineHeight: 1,
    fontFamily: "inherit",
  },
  tabRow: {
    display: "flex",
    borderBottom: `1px solid ${BORDER}`,
    padding: "0 16px",
    background: "#fff",
    overflowX: "auto",
  },
  tabBtn: {
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    padding: "11px 14px 9px",
    fontSize: 12,
    color: BODY,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.03em",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
  },
  tabBtnActive: {
    borderBottomColor: GOLD,
    color: NAVY,
    fontWeight: 700,
  },
  illustration: {
    padding: "18px 20px 0",
    height: 220,
    flexShrink: 0,
  },
  tipsBlock: {
    padding: "16px 20px 0",
  },
  tipsLabel: {
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: GOLD,
    fontFamily: "inherit",
    fontWeight: 700,
    marginBottom: 10,
  },
  tipsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  tipItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: 13,
    color: BODY,
    lineHeight: 1.5,
    fontFamily: "inherit",
  },
  tipCheck: {
    color: GOLD,
    flexShrink: 0,
    fontWeight: 700,
    marginTop: 1,
  },
  dismissBtn: {
    margin: "18px 20px 20px",
    background: NAVY,
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    fontSize: 14,
    cursor: "pointer",
    borderRadius: 8,
    fontFamily: "inherit",
    fontWeight: 600,
    textAlign: "center",
    letterSpacing: "0.01em",
  },
};
