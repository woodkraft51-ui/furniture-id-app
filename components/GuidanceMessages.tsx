'use client';

export default function PickerProfileSetup({ draft, setDraft, step, setStep, onSave, onCancel }) {
  if (!missing || totalPhotos < 2) return null;
  const active = Object.entries(missing)
    .filter(([, v]) => v)
    .map(([k]) => GUIDANCE_MESSAGES[k])
    .filter(Boolean);
  if (active.length === 0) return null;
  return (
    <div style={{ ...guidanceStyles.block, ...style }}>
      <div style={guidanceStyles.title}>To strengthen results, if available:</div>
      {active.map((g, i) => (
        <div key={i} style={guidanceStyles.row}>
          <span style={guidanceStyles.icon}>{g.icon}</span>
          <span style={guidanceStyles.text}>{g.text}</span>
        </div>
      ))}
    </div>
  );
}

const guidanceStyles = {
  block: { background:"#fdfaf2", border:`1px solid #e8ddb8`, borderRadius:3, padding:"14px 16px", display:"flex", flexDirection:"column", gap:9 },
  title: { fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#8b6914", fontFamily:"sans-serif", marginBottom:2 },
  row:   { display:"flex", alignItems:"flex-start", gap:9 },
  icon:  { fontSize:13, color:"#8b6914", flexShrink:0, lineHeight:1.55 },
  text:  { fontSize:13, color:"#4a3728", lineHeight:1.6, fontFamily:"'Georgia',serif" },
};

// ── Photo coaching modal ──────────────────────────────────────
// Handles two formats:
//   • Single SVG (overall_front, overall_side, underside):
//     ex.svg + ex.tips
//   • Multi-scenario (construction):
//     ex.scenarios = [{ label, checks, svg }, ...]
//     Renders a tab row so users can browse Drawer Joint / Rail / Saw Marks.
