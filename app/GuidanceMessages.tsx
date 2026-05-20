'use client';

/**
 * GuidanceMessages — inline suggestion block displayed in the
 * full-analysis intake form, below the photo upload sections. Surfaces
 * which non-required photo types are still missing once the user has
 * uploaded at least 2 photos.
 *
 * The threshold-of-2 is intentional: don't pester the user before they
 * have any input; once they've started, suggest the missing pieces.
 *
 * Reads structuredMissingEvidence (computed in page.tsx) and maps
 * each true key to the appraiser-voice suggestion text below.
 * Restored from commit d939b3a with a fresh take — drop the emoji
 * icons (don't match brand) and use a small inline gold bullet
 * instead.
 */

type Props = {
  missing: {
    underside_photo?: boolean;
    back_photo?: boolean;
    joinery_photo?: boolean;
    hardware_photo?: boolean;
    label_photo?: boolean;
  } | null | undefined;
  totalPhotos: number;
  style?: React.CSSProperties;
};

const NAVY = "#1a2e4e";
const GOLD = "#b9956a";
const BORDER = "#d9ccb5";
const DARK = "#352719";
const BODY = "#594734";

const SUGGESTIONS: Record<string, string> = {
  underside_photo:
    "An underside photo often reveals saw marks and fasteners that strongly support dating.",
  back_photo:
    "A back-panel photo can reveal milling style and backboard construction characteristic of specific periods.",
  joinery_photo:
    "A close-up of drawer joinery or internal framing helps confirm construction method (hand-cut vs. machine-cut dovetails, dowels, etc.).",
  hardware_photo:
    "Hardware close-ups help determine whether hinges, pulls, or casters are original to the piece.",
  label_photo:
    "Maker labels or stamped marks can sometimes identify the manufacturer with high confidence.",
};

export default function GuidanceMessages({ missing, totalPhotos, style }: Props) {
  if (!missing || totalPhotos < 2) return null;

  const active = Object.entries(missing)
    .filter(([, v]) => v === true)
    .map(([k]) => ({ key: k, text: SUGGESTIONS[k] }))
    .filter((entry) => Boolean(entry.text));

  if (active.length === 0) return null;

  return (
    <div style={{ ...containerStyle, ...style }}>
      <div style={headingStyle}>To strengthen results, if available:</div>
      <ul style={listStyle}>
        {active.map((entry) => (
          <li key={entry.key} style={itemStyle}>
            <span style={bulletStyle}>•</span>
            <span style={textStyle}>{entry.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  marginTop: 14,
  padding: "14px 16px",
  border: `1px solid ${BORDER}`,
  borderLeft: `3px solid ${GOLD}`,
  borderRadius: 8,
  background: "#fffaf0",
};

const headingStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: NAVY,
  marginBottom: 10,
  letterSpacing: "0.01em",
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const itemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
};

const bulletStyle: React.CSSProperties = {
  flex: "0 0 auto",
  color: GOLD,
  fontWeight: 700,
  fontSize: 14,
  lineHeight: 1.5,
};

const textStyle: React.CSSProperties = {
  flex: 1,
  fontSize: 13,
  lineHeight: 1.5,
  color: BODY,
};
