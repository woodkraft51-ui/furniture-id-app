'use client';

import React from "react";
import { RUNTIME_MODE } from "../lib/engine";

function RuntimeModeBadge() {
  const m = RUNTIME_MODE;
const isLive = m === "live";
const isSim = m === "mock";

  const cfg = isLive ? {
    label: "LIVE ENGINE",
    bg: "#edf5ec", border: "#7db87a", color: "#2a5a28",
    icon: "●",
  } : isSim ? {
    label: "SIMULATED FALLBACK",
    bg: "#fdf6ec", border: "#e8c87a", color: "#7a5010",
    icon: "◎",
  } : {
    label: "ENGINE UNAVAILABLE",
    bg: "#fdf0f0", border: "#e8a0a0", color: "#7a2020",
    icon: "✕",
  };

  const [open, setOpen] = React.useState(false);

  return (
  <div style={{ marginBottom: 12, fontFamily: "sans-serif" }}>
    <div
      onClick={function () { setOpen(function (o) { return !o; }); }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        cursor: "pointer",
        background: cfg.bg,
        color: cfg.color,
        border: "1px solid " + cfg.border,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      <span>{cfg.label}</span>
      <span style={{ fontSize: 9, opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
    </div>

    {open && (
      <div
        style={{
          marginTop: 4,
          padding: "10px 12px",
          background: "#f5f0e8",
          border: "1px solid #d4c9b4",
          borderRadius: 3,
          fontSize: 11,
          fontFamily: "monospace",
          color: "#555",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <div><strong>engine_mode:</strong> {m}</div>
        <div><strong>is_live:</strong> {String(m === "live")}</div>
        <div><strong>is_mock:</strong> {String(m === "mock")}</div>
      </div>
    )}
  </div>
);
      >
        <span style={{fontSize:9}}>{cfg.icon}</span>
        {cfg.label}
        <span style={{fontSize:9, opacity:0.6}}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{
          marginTop:4, padding:"10px 12px", background:"#f5f0e8",
          border:"1px solid #d4c9b4", borderRadius:3,
          fontSize:11, fontFamily:"monospace", color:"#555",
          display:"flex", flexDirection:"column", gap:3,
        }}>
         <div><strong>engine_mode:</strong> {m}</div>
<div><strong>is_live:</strong> {String(m === "live")}</div>
<div><strong>is_mock:</strong> {String(m === "mock")}</div>
      )}
    </div>
  );
}

// ============================================================
// PICKER PROFILE SETUP — multi-step guided questionnaire
// ============================================================
