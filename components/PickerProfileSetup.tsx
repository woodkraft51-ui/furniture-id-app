'use client';

export default function PickerProfileSetup(...)
  const sf = draft;

  // Build the visible step list based on current answers
  const steps = [];

  // Step 0 — restoration skill (always)
  steps.push({
    id: "restoration_skill",
    q: "How comfortable are you restoring furniture?",
    type: "single",
    opts: [
      { v:"none",         l:"None",         sub:"I only buy finished, ready-to-use pieces" },
      { v:"basic",        l:"Basic",         sub:"Cleaning, waxing, tightening loose joints" },
      { v:"intermediate", l:"Intermediate",  sub:"Refinishing, veneer repair, light structural" },
      { v:"advanced",     l:"Advanced",      sub:"Full structural repairs and complete restoration" },
    ],
  });

  // Step 1 — buying purpose (always)
  steps.push({
    id: "buying_purpose",
    q: "What are you usually buying for?",
    type: "single",
    opts: [
      { v:"resale",       l:"Resale",       sub:"Flip for profit — speed and margin matter" },
      { v:"personal",     l:"Personal Use", sub:"Keeping it — quality and character matter most" },
      { v:"both",         l:"Both",         sub:"Mix of resale and pieces I keep" },
    ],
  });

  // Step 2 — deal target (always)
  steps.push({
    id: "deal_target",
    q: "What kind of deal are you hoping to score?",
    type: "single",
    opts: [
      { v:"small",       l:"Small profit",      sub:"Buy at ~60–70% of resale value" },
      { v:"moderate",    l:"Moderate flip",      sub:"Buy at ~40–50% of resale value" },
      { v:"strong",      l:"Strong deal",        sub:"Buy at ~25–40% of resale value" },
      { v:"exceptional", l:"Exceptional deal",   sub:"Buy under ~25% of resale value" },
    ],
  });

  // Step 3 — work tolerance (always)
  steps.push({
    id: "work_tolerance",
    q: "How much work are you willing to put into a piece?",
    type: "single",
    opts: [
      { v:"none",     l:"None",                 sub:"Must be ready to sell or use immediately" },
      { v:"light",    l:"Light cleanup only",    sub:"Dusting, minor cleaning, hardware swap" },
      { v:"moderate", l:"Moderate restoration",  sub:"Refinishing, minor repairs, some time invested" },
      { v:"heavy",    l:"Heavy projects",        sub:"Major work is fine — I have time and skill" },
    ],
  });

  // Step 4 — storage space (always)
  steps.push({
    id: "storage_space",
    q: "How much storage space do you have?",
    type: "single",
    opts: [
      { v:"very_limited", l:"Very limited",             sub:"Apartment, small garage — size matters a lot" },
      { v:"moderate",     l:"Moderate",                  sub:"Standard garage or shed space" },
      { v:"large",        l:"Large workshop or storage", sub:"Plenty of room — size not a constraint" },
    ],
  });

  // Conditional: selling method (if resale or both)
  if (sf.buying_purpose === "resale" || sf.buying_purpose === "both") {
    steps.push({
      id: "selling_method",
      q: "How do you usually sell items?",
      type: "single",
      opts: [
        { v:"local_pickup",  l:"Local pickup only",   sub:"Buyers come to me — no hauling" },
        { v:"local_delivery",l:"Local delivery",       sub:"I deliver within my area" },
        { v:"nationwide",    l:"Nationwide shipping",  sub:"I ship — no geographic limit on buyers" },
        { v:"mixed",         l:"Mixed",                sub:"Depends on the piece" },
      ],
    });
    steps.push({
      id: "sales_priority",
      q: "What matters more when selling?",
      type: "single",
      opts: [
        { v:"fast",     l:"Fast sale",       sub:"Turnover and cash flow — move it quickly" },
        { v:"profit",   l:"Maximum profit",  sub:"Hold for the right price — patience pays" },
        { v:"balanced", l:"Balanced",        sub:"Reasonable speed at fair margin" },
      ],
    });
  }

  // Conditional: personal use priorities
  if (sf.buying_purpose === "personal") {
    steps.push({
      id: "personal_priority",
      q: "What matters most when buying for yourself?",
      type: "single",
      opts: [
        { v:"function",   l:"Function",            sub:"It needs to work well in my space" },
        { v:"beauty",     l:"Beauty",               sub:"Aesthetics and visual appeal first" },
        { v:"character",  l:"Historical character", sub:"Age, patina, and provenance matter most" },
        { v:"balanced",   l:"Balanced",             sub:"All three matter equally" },
      ],
    });
  }

  // Conditional: repair skills (if intermediate or advanced)
  if (sf.restoration_skill === "intermediate" || sf.restoration_skill === "advanced") {
    steps.push({
      id: "repair_skills",
      q: "Which repairs are you comfortable handling?",
      type: "multi",
      opts: [
        { v:"structural",   l:"Structural repairs",  sub:"Repairing breaks, rebuilding joints" },
        { v:"refinishing",  l:"Refinishing",          sub:"Stripping and applying new finish" },
        { v:"veneer",       l:"Veneer repair",        sub:"Patching, regluing, or replacing veneer" },
        { v:"regluing",     l:"Regluing joints",      sub:"Chair rungs, cabinet corners, etc." },
        { v:"upholstery",   l:"Upholstery work",      sub:"Fabric replacement and padding" },
      ],
    });
  }

  // Conditional: large item penalty (if very limited storage)
  if (sf.storage_space === "very_limited") {
    steps.push({
      id: "large_item_penalty",
      q: "Should the app heavily penalize large furniture in buy scores?",
      type: "single",
      opts: [
        { v:"yes", l:"Yes", sub:"Deprioritize large pieces — I don't have room" },
        { v:"no",  l:"No",  sub:"I'll judge size case by case" },
      ],
    });
  }

  // Review step (always last)
  steps.push({ id: "_review", q: "Your picker profile is ready.", type: "review" });

  const cur = steps[step] || steps[0];
  const total = steps.length;
  const isLast = step === total - 1;
  const isFirst = step === 0;
  const val = sf[cur.id];

  const handleSingle = (v) => setDraft(function(d){ return {...d, [cur.id]: v}; });
  const handleMulti = (v) => setDraft(function(d){
    const arr = d.repair_skills || [];
    const next = arr.includes(v) ? arr.filter(function(x){ return x !== v; }) : [...arr, v];
    return {...d, repair_skills: next};
  });
  const canAdvance = cur.type === "review" || cur.type === "multi"
    ? true
    : !!sf[cur.id];

  const pill = {
    display:"inline-block", padding:"8px 16px", borderRadius:20,
    fontSize:13, cursor:"pointer", fontFamily:"'Georgia',serif",
    border:"2px solid transparent", marginBottom:8, marginRight:8,
    transition:"all 0.15s",
  };
  const pillActive = { background:"#5a3e1b", color:"#fdf8ef", borderColor:"#5a3e1b" };
  const pillInactive = { background:"#faf6ef", color:"#4a3728", borderColor:"#d4c4a0" };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(20,14,6,0.72)",
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, padding:20,
    }}>
      <div style={{
        background:"#fdfaf4", borderRadius:8, maxWidth:520, width:"100%",
        maxHeight:"90vh", overflowY:"auto",
        boxShadow:"0 8px 40px rgba(0,0,0,0.35)",
        fontFamily:"'Georgia',serif",
      }}>
        {/* Header */}
        <div style={{
          background:"#5a3e1b", borderRadius:"8px 8px 0 0",
          padding:"18px 24px", display:"flex", alignItems:"center", gap:12,
        }}>
          <span style={{fontSize:22}}>🎯</span>
          <div>
            <div style={{color:"#fdf8ef", fontWeight:700, fontSize:15}}>Picker Profile Setup</div>
            <div style={{color:"#c8a870", fontSize:12, marginTop:2}}>Personalizes your Field Scan buy scores</div>
          </div>
          <div style={{marginLeft:"auto", color:"#c8a870", fontSize:11, fontFamily:"sans-serif"}}>
            Step {step + 1} of {total}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{height:3, background:"#e8ddb8"}}>
          <div style={{height:"100%", width:((step+1)/total*100)+"%", background:"#8b6914", transition:"width 0.3s"}} />
        </div>

        {/* Body */}
        <div style={{padding:"28px 28px 20px"}}>

          {cur.type === "review" ? (
            // ── Review screen ─────────────────────────────────
            <div>
              <div style={{fontSize:18, fontWeight:700, color:"#3a2010", marginBottom:6}}>Your picker profile is ready.</div>
              <div style={{fontSize:13, color:"#7a6040", marginBottom:20, lineHeight:1.6}}>
                The Field Scan "Should I Buy?" engine will use these preferences when scoring pieces.
              </div>
              <div style={{background:"#faf6ef", border:"1px solid #d4c4a0", borderRadius:6, padding:"14px 16px"}}>
                {[
                  ["Restoration skill",   sf.restoration_skill],
                  ["Buying purpose",      sf.buying_purpose],
                  ["Deal target",         sf.deal_target],
                  ["Work tolerance",      sf.work_tolerance],
                  ["Storage space",       sf.storage_space],
                  ["Selling method",      sf.selling_method],
                  ["Sales priority",      sf.sales_priority],
                  ["Personal priority",   sf.personal_priority],
                  ["Repair skills",       sf.repair_skills && sf.repair_skills.length > 0 ? sf.repair_skills.join(", ") : null],
                  ["Large item penalty",  sf.large_item_penalty !== undefined ? (sf.large_item_penalty === "yes" ? "Yes" : "No") : null],
                ].filter(function(r){ return r[1]; }).map(function(r, i){
                  return (
                    <div key={i} style={{
                      display:"flex", justifyContent:"space-between",
                      padding:"6px 0", borderBottom:"1px solid #e8ddb8",
                      fontSize:12, fontFamily:"sans-serif",
                    }}>
                      <span style={{color:"#888"}}>{r[0]}</span>
                      <span style={{color:"#3a2010", fontWeight:600}}>{String(r[1]).replace(/_/g," ")}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // ── Question screen ────────────────────────────────
            <div>
              <div style={{fontSize:16, fontWeight:700, color:"#3a2010", marginBottom:20, lineHeight:1.5}}>
                {cur.q}
              </div>

              {cur.type === "single" && (
                <div>
                  {cur.opts.map(function(opt){
                    const active = sf[cur.id] === opt.v;
                    return (
                      <div
                        key={opt.v}
                        onClick={function(){ handleSingle(opt.v); }}
                        style={{
                          display:"flex", alignItems:"flex-start", gap:12,
                          padding:"12px 14px", borderRadius:6, cursor:"pointer",
                          border:"2px solid " + (active ? "#8b6914" : "#e0d5c0"),
                          background: active ? "#fdf6e8" : "#fdfaf4",
                          marginBottom:8, transition:"all 0.15s",
                        }}
                      >
                        <div style={{
                          width:18, height:18, borderRadius:"50%", flexShrink:0, marginTop:1,
                          border:"2px solid " + (active ? "#8b6914" : "#c8b888"),
                          background: active ? "#8b6914" : "transparent",
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                          {active && <div style={{width:6,height:6,borderRadius:"50%",background:"#fdf8ef"}} />}
                        </div>
                        <div>
                          <div style={{fontSize:13,fontWeight:active?700:600,color:"#3a2010"}}>{opt.l}</div>
                          {opt.sub && <div style={{fontSize:11,color:"#888",marginTop:2,fontFamily:"sans-serif"}}>{opt.sub}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {cur.type === "multi" && (
                <div>
                  <div style={{fontSize:12,color:"#888",fontFamily:"sans-serif",marginBottom:12}}>Select all that apply</div>
                  {cur.opts.map(function(opt){
                    const arr = sf.repair_skills || [];
                    const active = arr.includes(opt.v);
                    return (
                      <div
                        key={opt.v}
                        onClick={function(){ handleMulti(opt.v); }}
                        style={{
                          display:"flex", alignItems:"flex-start", gap:12,
                          padding:"12px 14px", borderRadius:6, cursor:"pointer",
                          border:"2px solid " + (active ? "#8b6914" : "#e0d5c0"),
                          background: active ? "#fdf6e8" : "#fdfaf4",
                          marginBottom:8, transition:"all 0.15s",
                        }}
                      >
                        <div style={{
                          width:16, height:16, borderRadius:3, flexShrink:0, marginTop:1,
                          border:"2px solid " + (active ? "#8b6914" : "#c8b888"),
                          background: active ? "#8b6914" : "transparent",
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                          {active && <span style={{color:"#fdf8ef",fontSize:10,lineHeight:1}}>✓</span>}
                        </div>
                        <div>
                          <div style={{fontSize:13,fontWeight:active?700:600,color:"#3a2010"}}>{opt.l}</div>
                          {opt.sub && <div style={{fontSize:11,color:"#888",marginTop:2,fontFamily:"sans-serif"}}>{opt.sub}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{
          padding:"16px 28px 24px", display:"flex", gap:10,
          borderTop:"1px solid #e8ddb8",
        }}>
          {!isFirst && (
            <button
              onClick={function(){ setStep(function(s){ return s - 1; }); }}
              style={{
                padding:"10px 20px", borderRadius:4, border:"1px solid #c8b888",
                background:"#fdfaf4", color:"#5a3e1b", fontSize:13, cursor:"pointer",
                fontFamily:"'Georgia',serif",
              }}
            >← Back</button>
          )}
          {onCancel && isFirst && (
            <button
              onClick={onCancel}
              style={{
                padding:"10px 20px", borderRadius:4, border:"1px solid #c8b888",
                background:"#fdfaf4", color:"#888", fontSize:13, cursor:"pointer",
                fontFamily:"sans-serif",
              }}
            >Skip for now</button>
          )}
          <div style={{flex:1}} />
          {!isLast ? (
            <button
              onClick={function(){ if (canAdvance) setStep(function(s){ return s + 1; }); }}
              style={{
                padding:"10px 24px", borderRadius:4,
                border:"none", background: canAdvance ? "#5a3e1b" : "#c8b888",
                color:"#fdf8ef", fontSize:13, cursor: canAdvance ? "pointer" : "not-allowed",
                fontFamily:"'Georgia',serif", fontWeight:600,
              }}
            >Next →</button>
          ) : (
            <button
              onClick={function(){ onSave(sf); }}
              style={{
                padding:"10px 24px", borderRadius:4, border:"none",
                background:"#5a3e1b", color:"#fdf8ef", fontSize:13,
                cursor:"pointer", fontFamily:"'Georgia',serif", fontWeight:600,
              }}
            >Save Profile ✓</button>
          )}
        </div>
      </div>
    </div>
  );
}


