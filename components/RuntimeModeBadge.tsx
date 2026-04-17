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
    <div style={{marginBottom:12, fontFamily:"sans-serif"}}>
      <div
        onClick={function(){ setOpen(function(o){ return !o; }); }}
        style={{
          display:"inline-flex", alignItems:"center", gap:6, cursor:"pointer",
          background:cfg.bg, border:"1px solid " + cfg.border, borderRadius:3,
          padding:"3px 10px", fontSize:11, fontWeight:700,
          letterSpacing:"0.08em", color:cfg.color, userSelect:"none",
        }}
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
          <div><strong>engine_mode:</strong> {m.engine_mode}</div>
          <div><strong>live_llm_enabled:</strong> {String(m.live_llm_enabled)}</div>
          <div><strong>anthropic_key_present:</strong> {String(m.anthropic_key_present)}</div>
          <div><strong>fetch_blocked:</strong> {String(m.fetch_blocked)}</div>
          <div><strong>backend_endpoint_available:</strong> {String(m.backend_endpoint_available)}</div>
          <div><strong>api_version_header:</strong> {m.api_version_header}</div>
          <div><strong>full_analysis_flag:</strong> {m.full_analysis_flag}</div>
          <div><strong>field_scan_flag:</strong> {m.field_scan_flag}</div>
          <div><strong>primary_trigger:</strong> {m.primary_trigger}</div>
          <div><strong>simulation_reason:</strong> {m.simulation_reason}</div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PICKER PROFILE SETUP — multi-step guided questionnaire
// ============================================================
