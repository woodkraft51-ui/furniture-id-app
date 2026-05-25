// Throwaway: renders EvidenceRankedList logic against real trace fixtures to
// a static HTML file for visual review. Mirrors the component in app/page.tsx.
const fs = require("fs");

const RANK_LAYER_AUTHORITY = { joinery:9,fastener:8,toolmark:8,form:7,hardware:6,wood:6,upholstery:5,finish:4,style:3,style_wave:2 };
const RANK_LAYER_LABELS = { form:"Form",joinery:"Joinery",fastener:"Fasteners",toolmark:"Toolmarks",wood:"Wood",hardware:"Hardware",finish:"Finish",upholstery:"Upholstery" };
const C = { ink:"#3d2d1f",muted:"#6a5845",faint:"#a89e90",line:"#eadfcf",good:"#3f7d4e",track:"#ece4d6",bar:"#b88a52",styleBar:"#bcae9a" };

function pickStrongestZoneIndex(zones){ // mirror: by specific_layer_count then weighted_authority then width
  if(!zones||!zones.length) return -1;
  let bi=0,best=zones[0];
  for(let i=1;i<zones.length;i++){const z=zones[i];
    const zs=z.specific_layer_count??z.layer_count??0, bs=best.specific_layer_count??best.layer_count??0;
    if(zs>bs||(zs===bs&&(z.weighted_authority??z.authority_sum??0)>(best.weighted_authority??best.authority_sum??0))){best=z;bi=i;}}
  return bi;
}

function build(ov, styleAttribution, p2Floor, p2Ceiling){
  const zones=ov.convergence_zones??[];
  const si=pickStrongestZoneIndex(zones); const sz=si>=0?zones[si]:null;
  const winFloor=p2Floor ?? sz?.date_floor ?? ov.overall_floor ?? null;
  const winCeiling=p2Ceiling ?? sz?.date_ceiling ?? ov.overall_ceiling ?? null;
  const haveWindow=winFloor!=null&&winCeiling!=null;
  const spanScore=s=>s<=20?1:s<=35?0.82:s<=55?0.6:s<=80?0.4:0.25;
  const confScore=c=>c==="high"?1:c==="moderate"?0.7:c==="low"?0.4:0;
  const overlaps=(f,c)=>!haveWindow?true:(f??-Infinity)<=winCeiling&&(c??Infinity)>=winFloor;
  const rangeText=(f,c)=>f!=null&&c!=null?`${f}–${c}`:f!=null?`after ${f}`:c!=null?`before ${c}`:"";
  const datable=[],noSignal=[];
  for(const l of ov.layers){
    if(l.layer==="style"||l.layer==="style_wave")continue;
    const label=RANK_LAYER_LABELS[l.layer]??l.layer;
    const hf=l.date_floor!=null,hc=l.date_ceiling!=null;
    if((!hf&&!hc)||l.confidence==="none"){ if(l.source_count>0||(l.present_without_dates??0)>0)noSignal.push(label); continue; }
    const span=hf&&hc?l.date_ceiling-l.date_floor:null;
    const auth=RANK_LAYER_AUTHORITY[l.layer]??4;
    const strength=Math.round((0.4*(span==null?0.3:spanScore(span))+0.35*(auth/9)+0.25*confScore(l.confidence))*100);
    datable.push({key:l.layer,label,rangeText:rangeText(l.date_floor,l.date_ceiling),strength,
      tag:span==null?"open":span<=30?"strong":span<=55?"moderate":"broad",agrees:overlaps(l.date_floor,l.date_ceiling),isStyle:false});
  }
  datable.sort((a,b)=>b.strength-a.strength);
  let styleRow=null;
  if(styleAttribution&&(styleAttribution.date_floor!=null||styleAttribution.date_ceiling!=null)){
    styleRow={key:"style",label:styleAttribution.name?`Style — ${styleAttribution.name}`:"Style",
      rangeText:rangeText(styleAttribution.date_floor,styleAttribution.date_ceiling),strength:22,tag:"minor",
      agrees:overlaps(styleAttribution.date_floor,styleAttribution.date_ceiling),isStyle:true};
  }
  const rows=styleRow?[...datable,styleRow]:datable;
  const agreeCount=datable.filter(r=>r.agrees).length;
  const windowText=haveWindow?`c. ${winFloor}–${winCeiling}`:null;
  return {rows,noSignal,agreeCount,windowText,styleRow:!!styleRow};
}

function renderRows(m){
  let h="";
  h+=`<div style="font-size:13px;color:${C.muted};line-height:1.55;margin-bottom:12px">`;
  if(m.windowText)h+=`<strong style="color:${C.ink}">${m.agreeCount} layer${m.agreeCount===1?"":"s"} point to ${m.windowText}.</strong> `;
  if(m.noSignal.length)h+=`${m.noSignal.length} layer${m.noSignal.length===1?"":"s"} had no datable signal. `;
  if(m.styleRow)h+=`Style shown as low-weight context.`;
  h+=`</div>`;
  h+=`<div style="font-size:11px;letter-spacing:.5px;text-transform:uppercase;color:${C.faint};margin-bottom:6px">Evidence, ranked by how tightly it pins the date</div>`;
  m.rows.forEach((r,i)=>{
    const mark=!r.isStyle&&r.agrees?"✓":"·";
    const markColor=!r.isStyle&&r.agrees?C.good:C.faint;
    const w=Math.max(12,Math.min(95,r.strength));
    h+=`<div style="display:grid;grid-template-columns:16px 1fr 124px;gap:10px;align-items:center;padding:9px 0;${i===0?"":`border-top:1px solid ${C.line};`}opacity:${r.isStyle?0.72:1}">
      <div style="text-align:center;font-size:14px;color:${markColor}">${mark}</div>
      <div><div style="font-weight:600;font-size:14px;color:${C.ink};${r.isStyle?"font-style:italic":""}">${r.label}</div>
      <div style="font-size:12px;color:${C.muted}">${r.rangeText}</div></div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:8px;background:${C.track};border-radius:5px;overflow:hidden"><div style="width:${w}%;height:100%;background:${r.isStyle?C.styleBar:C.bar};border-radius:5px"></div></div>
        <div style="font-size:11px;color:${C.muted};min-width:48px;text-align:right">${r.tag}</div>
      </div></div>`;
  });
  if(m.noSignal.length)h+=`<div style="margin-top:8px;font-size:13px;color:${C.muted};padding-top:8px;border-top:1px solid ${C.line}">${m.noSignal.length} layer${m.noSignal.length===1?"":"s"} present, no datable signal: ${m.noSignal.join(" · ")}</div>`;
  return h;
}

const j=JSON.parse(fs.readFileSync("scripts/post-block-12-trace.json","utf8"));
const scenarios=[["eastlake_dresser","Eastlake dresser"],["roos_cedar_chest","Roos cedar chest"],["pre_1860_piece","Pre-1860 piece"]];
let cards="";
for(const [k,title] of scenarios){
  const so=j[k].stage_outputs; const ov=so.p6.dating_overlap;
  const m=build(ov,so.p3?.style_attribution??null,so.p2?.date_floor??null,so.p2?.date_ceiling??null);
  cards+=`<div style="max-width:560px;margin:0 auto 18px">
    <div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:${C.faint};margin-bottom:6px">${title} &middot; engine output</div>
    <section style="background:#fffdf9;border:1px solid #ded3bf;border-radius:12px;padding:16px;box-shadow:0 1px 2px rgba(0,0,0,.04)">
      <h3 style="margin:0 0 10px;font-size:18px;color:#3e2f1f">Dating &mdash; evidence by layer</h3>
      ${renderRows(m)}
    </section></div>`;
}
const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ranked list — real data</title><style>body{margin:0;background:#f7f3ec;font:16px/1.55 -apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:24px 16px 64px}</style></head><body>
<div style="max-width:560px;margin:0 auto 18px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:${C.faint}">Real engine output (trace fixtures) &middot; new ranked visual</div>
${cards}</body></html>`;
fs.writeFileSync("report-preview-realdata.html",html);
console.log("wrote report-preview-realdata.html");
