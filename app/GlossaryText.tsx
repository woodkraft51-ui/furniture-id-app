'use client';

import React from "react";
import { segmentText, type GlossaryEntry } from "../lib/glossary";

/**
 * Renders a string with recognized glossary terms made tappable. Tapping a
 * term toggles an inline popover with its definition — works on touch, unlike
 * the native title="" tooltips used elsewhere. Falls back to plain text when
 * no terms are found.
 */
export default function GlossaryText({ text }: { text: string }) {
  const [open, setOpen] = React.useState<number | null>(null);
  const segments = React.useMemo(() => segmentText(text), [text]);

  if (!segments.some((s) => s.type === "term")) return <>{text}</>;

  return (
    <>
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <React.Fragment key={i}>{seg.value}</React.Fragment>
        ) : (
          <Term
            key={i}
            surface={seg.value}
            entry={seg.entry}
            isOpen={open === i}
            onToggle={() => setOpen((prev) => (prev === i ? null : i))}
          />
        )
      )}
    </>
  );
}

function Term({
  surface,
  entry,
  isOpen,
  onToggle,
}: {
  surface: string;
  entry: GlossaryEntry;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <span style={{ position: "relative", display: "inline" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          margin: 0,
          font: "inherit",
          color: "#6b4400",
          cursor: "pointer",
          borderBottom: "1px dotted #b9956a",
          lineHeight: "inherit",
        }}
      >
        {surface}
      </button>
      {isOpen && (
        <span
          role="tooltip"
          style={{
            position: "absolute",
            left: 0,
            top: "calc(100% + 6px)",
            zIndex: 50,
            width: 260,
            maxWidth: "80vw",
            background: "#fffdf8",
            border: "1px solid #d9ccb5",
            borderLeft: "3px solid #b9956a",
            borderRadius: 8,
            padding: "10px 12px",
            boxShadow: "0 6px 24px rgba(40,28,10,0.18)",
            fontSize: 13,
            lineHeight: 1.5,
            color: "#3d2d1f",
            fontWeight: 400,
            textAlign: "left",
            whiteSpace: "normal",
          }}
        >
          <span style={{ display: "block", fontWeight: 700, marginBottom: 4, textTransform: "capitalize" }}>
            {entry.term}
          </span>
          {entry.definition}
        </span>
      )}
    </span>
  );
}
