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
      aria-label="Field Scan icon: an antique chair silhouette inside rounded viewfinder focus brackets, with a scanning reticle centered on a gold seat."
    >
      {/* Filter: subtle gold-tinted drop shadow under the chair body.
          Gold tint (rather than gray) keeps the shadow inside the brand
          palette and reads as warm rather than clinical. Low opacity +
          small spread = barely-noticed dimensionality. */}
      <defs>
        <filter id="fsSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1.5"
            stdDeviation="1.5"
            floodColor={GOLD}
            floodOpacity="0.30"
          />
        </filter>
      </defs>

      {/* Viewfinder focus brackets — gold, bolder strokes, ROUNDED corners
          (3px radius) for softer feel without losing the scanning cue. */}
      <path
        d="M 8 22 L 8 11 Q 8 8 11 8 L 22 8"
        stroke={GOLD}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 74 8 L 85 8 Q 88 8 88 11 L 88 22"
        stroke={GOLD}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 88 74 L 88 85 Q 88 88 85 88 L 74 88"
        stroke={GOLD}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 22 88 L 11 88 Q 8 88 8 85 L 8 74"
        stroke={GOLD}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Antique chair silhouette — navy structure + gold seat cushion.
          Era-neutral (tall back with spindles, simple seat, turned legs
          hinted via turn-ring accents). Wrapped in a group so the drop
          shadow applies to the whole chair as a unit. */}
      <g filter="url(#fsSoftShadow)">
        {/* Crest rail — slight upward curve at top */}
        <path
          d="M 30 24 Q 48 18 66 24 L 66 28 L 30 28 Z"
          fill={NAVY}
        />

        {/* Four back spindles */}
        <line x1="36" y1="28" x2="36" y2="52" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="44" y1="28" x2="44" y2="52" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="52" y1="28" x2="52" y2="52" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="28" x2="60" y2="52" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" />

        {/* Seat — NOW GOLD (color rebalance). Reads as upholstered or
            warm-wood seat cushion against the navy structural frame. */}
        <path
          d="M 26 52 L 70 52 L 70 58 L 26 58 Z"
          fill={GOLD}
        />

        {/* Four turned legs — wider stroke + turn-ring accents */}
        <path d="M 30 58 L 30 78" stroke={NAVY} strokeWidth="4" strokeLinecap="round" />
        <path d="M 66 58 L 66 78" stroke={NAVY} strokeWidth="4" strokeLinecap="round" />
        <line x1="27" y1="68" x2="33" y2="68" stroke={NAVY} strokeWidth="2" />
        <line x1="63" y1="68" x2="69" y2="68" stroke={NAVY} strokeWidth="2" />

        {/* Stretcher between front legs */}
        <line x1="30" y1="72" x2="66" y2="72" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Scanning reticle — NAVY (flipped from gold so it reads against
          the now-gold seat). Small, decisive, centered on the seat. */}
      <circle cx="48" cy="55" r="4" stroke={NAVY} strokeWidth="2" fill="none" />
      <line x1="48" y1="48" x2="48" y2="51" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="59" x2="48" y2="62" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
      <line x1="41" y1="55" x2="44" y2="55" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
      <line x1="52" y1="55" x2="55" y2="55" stroke={NAVY} strokeWidth="2" strokeLinecap="round" />
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
      aria-label="Full Analysis icon: an annotated case-file document with gold heading, marginal review check, and verification seal."
    >
      {/* Filter: same soft gold-tinted drop shadow as Field Scan — keeps
          both icons visually consistent. */}
      <defs>
        <filter id="faSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1.5"
            stdDeviation="1.5"
            floodColor={GOLD}
            floodOpacity="0.30"
          />
        </filter>
      </defs>

      {/* Document group with shadow — both pages share the soft shadow
          so they read as a layered case file rather than separate sheets. */}
      <g filter="url(#faSoftShadow)">
        {/* Background page peeking behind the main */}
        <path
          d="M 24 22 L 64 22 L 64 84 L 24 84 Z"
          fill="#fff"
          stroke={NAVY}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Main document with folded top-right corner */}
        <path
          d="M 14 12 L 60 12 L 74 26 L 74 78 L 14 78 Z"
          fill="#fff"
          stroke={NAVY}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Folded corner — cream fill for "page lifted" look */}
        <path
          d="M 60 12 L 60 26 L 74 26 Z"
          fill={CREAM}
          stroke={NAVY}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </g>

      {/* Document heading bar — NOW GOLD (color rebalance). Reads as a
          report-header band warming the doc without losing the
          professional case-file feel. */}
      <rect x="22" y="36" width="28" height="5" fill={GOLD} rx="1" />

      {/* Body text lines — navy, decisive */}
      <line x1="22" y1="48" x2="60" y2="48" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
      <line x1="22" y1="56" x2="64" y2="56" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />
      <line x1="22" y1="64" x2="52" y2="64" stroke={NAVY} strokeWidth="3" strokeLinecap="round" />

      {/* Gold marginal annotation — checkmark beside the second text
          line ("evidence verified" on this finding) */}
      <path
        d="M 65 53 L 68 57 L 73 50"
        stroke={GOLD}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Small gold seal in lower-right of doc body — abstract "verified
          / completed case file" mark */}
      <circle cx="62" cy="71" r="6" stroke={GOLD} strokeWidth="2.5" fill="none" />
      <circle cx="62" cy="71" r="2" fill={GOLD} />
    </svg>
  );
}
