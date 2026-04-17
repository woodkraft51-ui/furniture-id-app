'use client';
import { useState } from "react";
function ExampleModal({ exampleKey, onClose }) {
  const ex = PHOTO_EXAMPLES[exampleKey];
  const [tab, setTab] = useState(0);
  if (!ex) return null;

  const isMulti = Array.isArray(ex.scenarios);
  const current = isMulti ? ex.scenarios[tab] : ex;
  const tips    = isMulti ? current.checks : current.tips;

  return (
    <div style={exStyles.overlay} onClick={onClose}>
      <div style={exStyles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={exStyles.header}>
          <span style={exStyles.title}>{ex.title}</span>
          <button style={exStyles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Scenario tabs — only for multi-scenario entries */}
        {isMulti && (
          <div style={exStyles.tabRow}>
            {ex.scenarios.map((s, i) => (
              <button
                key={i}
                style={{ ...exStyles.tabBtn, ...(tab === i ? exStyles.tabBtnActive : {}) }}
                onClick={() => setTab(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Illustration */}
        <div
          style={exStyles.illustration}
          dangerouslySetInnerHTML={{ __html: current.svg }}
        />

        {/* Guidance tips / checks */}
        <div style={exStyles.tipsBlock}>
          <div style={exStyles.tipsLabel}>
            {isMulti ? "What to include in this photo:" : "What makes this a good photo:"}
          </div>
          <ul style={exStyles.tipsList}>
            {tips.map((tip, i) => (
              <li key={i} style={exStyles.tipItem}>
                <span style={exStyles.tipCheck}>✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <button style={exStyles.dismissBtn} onClick={onClose}>
          Got it — take photo
        </button>
      </div>
    </div>
  );
}

const exStyles = {
  overlay:      { position:"fixed", inset:0, background:"rgba(26,20,16,0.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:16 },
  modal:        { background:"#faf6ef", borderRadius:6, maxWidth:380, width:"100%", maxHeight:"90vh", overflowY:"auto", display:"flex", flexDirection:"column" },
  header:       { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 18px 12px", borderBottom:"1px solid #d4c9b4" },
  title:        { fontSize:14, fontWeight:600, color:"#1a1410", fontFamily:"'Georgia',serif", lineHeight:1.3 },
  closeBtn:     { background:"none", border:"none", fontSize:16, color:"#aaa", cursor:"pointer", padding:"0 2px", lineHeight:1 },
  tabRow:       { display:"flex", borderBottom:"1px solid #d4c9b4", padding:"0 18px" },
  tabBtn:       { background:"none", border:"none", borderBottom:"2px solid transparent", padding:"10px 14px 8px", fontSize:12, color:"#4a3728", cursor:"pointer", fontFamily:"sans-serif", letterSpacing:"0.04em", transition:"all 0.15s" },
  tabBtnActive: { borderBottomColor:"#8b6914", color:"#1a1410", fontWeight:600 },
  illustration: { padding:"16px 18px 0", height:200, flexShrink:0 },
  tipsBlock:    { padding:"14px 18px 0" },
  tipsLabel:    { fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#8b6914", fontFamily:"sans-serif", marginBottom:10 },
  tipsList:     { listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:7 },
  tipItem:      { display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:"#4a3728", lineHeight:1.5, fontFamily:"'Georgia',serif" },
  tipCheck:     { color:"#5a6b52", flexShrink:0, fontWeight:600, marginTop:1 },
  dismissBtn:   { margin:"16px 18px 18px", background:"#1a1410", color:"#f5efe4", border:"none", padding:"12px", fontSize:13, cursor:"pointer", borderRadius:3, fontFamily:"'Georgia',serif", textAlign:"center" },
};

// ============================================================
// ROUTE REGISTRY
// Defines the two top-level routes and their valid steps.
// Each route has its own intake, analysis, and result steps.
// Shared services: image storage, Claude API caller, DB lookups.
// ============================================================
