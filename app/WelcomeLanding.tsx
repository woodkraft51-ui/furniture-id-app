'use client';

import React from "react";

/**
 * WelcomeLanding — first-visit landing screen. Presents two paths
 * (Field Scan / Full Analysis) as cards with line-art SVG icons in the
 * Proof Sleuth navy + gold palette. On selection, calls onSelectMode
 * with the chosen analysis_mode and the parent dismisses the landing.
 *
 * Behavior contract:
 *   - Landing visibility owned by parent via localStorage flag
 *     `proof_sleuth_landing_dismissed`. Parent reads on mount, hides
 *     the landing once dismissed.
 *   - Landing returns the chosen mode synchronously; parent sets
 *     intake.analysis_mode and persists dismissal flag in localStorage.
 *   - Parent renders a small "Switch mode" link in the form view so
 *     the user can return to the landing on subsequent sessions.
 *
 * Design notes:
 *   - Colors match the logo (navy #1a2e4e, gold #b9956a) and the
 *     existing layout palette (cream #f5f0e8, selection #fff7eb,
 *     border #d9ccb5, dark walnut #352719).
 *   - Cards stack vertically below 720px viewport, side-by-side above.
 *   - Hover state: subtle border + shadow elevation; full-card click
 *     target (button is the visible affordance but the entire card is
 *     clickable for touch convenience).
 *   - SVG icons embedded inline (no external request).
 */

type AnalysisMode = "full_analysis" | "field_scan";

type Props = {
  onSelectMode: (mode: AnalysisMode) => void;
};

const NAVY = "#1a2e4e";
const GOLD = "#b9956a";
const CREAM = "#f5f0e8";
const SELECTION = "#fff7eb";
const BORDER = "#d9ccb5";
const DARK = "#352719";
const BODY = "#594734";

export default function WelcomeLanding({ onSelectMode }: Props) {
  const [isCompact, setIsCompact] = React.useState(false);
  const [hovered, setHovered] = React.useState<AnalysisMode | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setIsCompact(window.innerWidth < 720);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: isCompact ? "24px 16px 40px" : "48px 32px 64px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: isCompact ? 24 : 36 }}>
        <h1
          style={{
            margin: 0,
            fontSize: isCompact ? 28 : 36,
            lineHeight: 1.15,
            color: DARK,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          Two ways to investigate
        </h1>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: isCompact ? 15 : 17,
            color: BODY,
            lineHeight: 1.5,
          }}
        >
          Choose the depth that fits the moment.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: isCompact ? "column" : "row",
          gap: isCompact ? 16 : 24,
          alignItems: "stretch",
        }}
      >
        <Card
          mode="field_scan"
          title="Field Scan"
          body="In-the-aisle decisions. Designed for the 60 seconds you have while standing in front of a piece. Quick photos, a buy-or-walk recommendation, and the evidence behind it. Optimized for thrift, estate, and auction-floor decisions."
          buttonText="Start a field scan"
          icon={<FieldScanIcon />}
          isCompact={isCompact}
          hovered={hovered === "field_scan"}
          onHover={(h) => setHovered(h ? "field_scan" : null)}
          onSelect={() => onSelectMode("field_scan")}
        />
        <Card
          mode="full_analysis"
          title="Full Analysis"
          body="The full case file. Every photo angle, every construction detail, every dating signal. Returns a complete identification with period, region, maker attribution where evidence supports it, and a valuation framework you can defend in writing."
          buttonText="Start a full analysis"
          icon={<FullAnalysisIcon />}
          isCompact={isCompact}
          hovered={hovered === "full_analysis"}
          onHover={(h) => setHovered(h ? "full_analysis" : null)}
          onSelect={() => onSelectMode("full_analysis")}
        />
      </div>

      <p
        style={{
          marginTop: isCompact ? 28 : 40,
          textAlign: "center",
          fontSize: isCompact ? 13 : 14,
          color: BODY,
          fontStyle: "italic",
          letterSpacing: "0.01em",
        }}
      >
        Photo-driven. No guesses ... only conclusions with demonstrated evidence.
      </p>
    </main>
  );
}

type CardProps = {
  mode: AnalysisMode;
  title: string;
  body: string;
  buttonText: string;
  icon: React.ReactNode;
  isCompact: boolean;
  hovered: boolean;
  onHover: (h: boolean) => void;
  onSelect: () => void;
};

function Card({ title, body, buttonText, icon, isCompact, hovered, onHover, onSelect }: CardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      style={{
        flex: 1,
        textAlign: "left",
        padding: isCompact ? 20 : 28,
        background: hovered ? SELECTION : "#fff",
        border: `1px solid ${hovered ? GOLD : BORDER}`,
        borderRadius: 14,
        cursor: "pointer",
        boxShadow: hovered ? "0 6px 18px rgba(26, 46, 78, 0.10)" : "0 1px 3px rgba(26, 46, 78, 0.04)",
        transition: "border-color 120ms ease, box-shadow 120ms ease, background 120ms ease",
        display: "flex",
        flexDirection: "column",
        gap: isCompact ? 14 : 18,
        font: "inherit",
        color: DARK,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>{icon}</div>

      <h2
        style={{
          margin: 0,
          fontSize: isCompact ? 22 : 24,
          lineHeight: 1.2,
          color: DARK,
          fontWeight: 700,
        }}
      >
        {title}
      </h2>

      <p
        style={{
          margin: 0,
          fontSize: isCompact ? 14 : 15,
          lineHeight: 1.55,
          color: BODY,
          flex: 1,
        }}
      >
        {body}
      </p>

      <div
        style={{
          marginTop: 4,
          padding: "10px 16px",
          background: NAVY,
          color: "#fff",
          borderRadius: 8,
          fontSize: isCompact ? 14 : 15,
          fontWeight: 600,
          textAlign: "center",
          letterSpacing: "0.01em",
        }}
      >
        {buttonText} →
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SVG icons — line-art in the logo's navy + gold palette
// ─────────────────────────────────────────────────────────────────────

function FieldScanIcon() {
  return (
    <svg
      viewBox="0 0 96 96"
      width="80"
      height="80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Field Scan icon: a chair silhouette inside camera viewfinder focus brackets."
    >
      {/* Viewfinder focus brackets — gold */}
      <path
        d="M 10 22 L 10 10 L 22 10"
        stroke={GOLD}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 74 10 L 86 10 L 86 22"
        stroke={GOLD}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 86 74 L 86 86 L 74 86"
        stroke={GOLD}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 22 86 L 10 86 L 10 74"
        stroke={GOLD}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Chair silhouette — navy line art */}
      {/* Back posts and crest rail */}
      <path
        d="M 36 30 L 36 56"
        stroke={NAVY}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 60 30 L 60 56"
        stroke={NAVY}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 34 30 Q 48 24 62 30"
        stroke={NAVY}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Two horizontal back slats */}
      <line x1="38" y1="38" x2="58" y2="38" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="46" x2="58" y2="46" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
      {/* Seat */}
      <path
        d="M 30 56 L 66 56 L 66 60 L 30 60 Z"
        fill={NAVY}
      />
      {/* Front legs */}
      <line x1="34" y1="60" x2="34" y2="76" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
      <line x1="62" y1="60" x2="62" y2="76" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
      {/* Stretcher */}
      <line x1="34" y1="70" x2="62" y2="70" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FullAnalysisIcon() {
  return (
    <svg
      viewBox="0 0 96 96"
      width="80"
      height="80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Full Analysis icon: a document page with annotation marks and a folded corner."
    >
      {/* Background document (the second page peeking out) */}
      <path
        d="M 22 22 L 64 22 L 64 84 L 22 84 Z"
        fill="#fff"
        stroke={NAVY}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Main document with folded corner — navy outline */}
      <path
        d="M 16 14 L 60 14 L 72 26 L 72 78 L 16 78 Z"
        fill="#fff"
        stroke={NAVY}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Folded corner fill */}
      <path
        d="M 60 14 L 60 26 L 72 26 Z"
        fill={CREAM}
        stroke={NAVY}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Document text lines — navy */}
      <line x1="24" y1="36" x2="56" y2="36" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="44" x2="64" y2="44" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="52" x2="48" y2="52" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="60" x2="60" y2="60" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />

      {/* Annotation circle highlighting a detail — gold accent */}
      <circle
        cx="50"
        cy="44"
        r="9"
        stroke={GOLD}
        strokeWidth="2.5"
        fill="none"
      />
      {/* Annotation arrow/leader from circle pointing outside the document */}
      <line
        x1="57"
        y1="50"
        x2="74"
        y2="62"
        stroke={GOLD}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="74"
        y1="62"
        x2="69"
        y2="60"
        stroke={GOLD}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="74"
        y1="62"
        x2="72"
        y2="57"
        stroke={GOLD}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
