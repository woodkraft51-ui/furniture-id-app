// Throwaway: renders the redesigned report (ranked dating visual + headline +
// Date & Style detail with real dropdowns) against trace fixtures, to a static
// HTML file for visual review. Mirrors the components in app/page.tsx and pulls
// dropdown text through the live engine helpers.
import fs from "fs";
import { getRegionalPeriodNotes, getCousinFormContrasts } from "../lib/engineFormEvaluators";

const RANK_LAYER_AUTHORITY: Record<string, number> = { joinery:9,fastener:8,toolmark:8,form:7,hardware:6,wood:6,upholstery:5,finish:4,style:3,style_wave:2 };
const RANK_LAYER_LABELS: Record<string, string> = { form:"Form",joinery:"Joinery",fastener:"Fasteners",toolmark:"Toolmarks",wood:"Wood",hardware:"Hardware",finish:"Finish",upholstery:"Upholstery" };
const C = { ink:"#3d2d1f",muted:"#6a5845",faint:"#a89e90",line:"#eadfcf",good:"#3f7d4e",track:"#ece4d6",bar:"#b88a52",styleBar:"#bcae9a" };
const esc = (s:string)=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

function pickStrongestZoneIndex(zones:any[]){
  if(!zones||!zones.length) return -1;
  let bi=0,best=zones[0];
  for(let i=1;i<zones.length;i++){const z=zones[i];
    const zs=z.specific_layer_count??z.layer_count??0, bs=best.specific_layer_count??best.layer_count??0;
    if(zs>bs||(zs===bs&&(z.weighted_authority??z.authority_sum??0)>(best.weighted_authority??best.authority_sum??0))){best=z;bi=i;}}
  return bi;
}

function build(ov:any, styleAttribution:any, p2Floor:number|null, p2Ceiling:number|null){
  const zones=ov.convergence_zones??[];
  const si=pickStrongestZoneIndex(zones); const sz=si>=0?zones[si]:null;
  const winFloor=p2Floor ?? sz?.date_floor ?? ov.overall_floor ?? null;
  const winCeiling=p2Ceiling ?? sz?.date_ceiling ?? ov.overall_ceiling ?? null;
  const haveWindow=winFloor!=null&&winCeiling!=null;
  const spanScore=(s:number)=>s<=20?1:s<=35?0.82:s<=55?0.6:s<=80?0.4:0.25;
  const confScore=(c:string)=>c==="high"?1:c==="moderate"?0.7:c==="low"?0.4:0;
  const overlaps=(f:number|null,c:number|null)=>!haveWindow?true:(f??-Infinity)<winCeiling&&(c??Infinity)>winFloor;
  const rangeText=(f:number|null,c:number|null)=>f!=null&&c!=null?`${f}–${c}`:f!=null?`after ${f}`:c!=null?`before ${c}`:"";
  const datable:any[]=[],noSignal:string[]=[];
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
  let styleRow:any=null;
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

function renderRows(m:any){
  let h="";
  h+=`<div style="font-size:13px;color:${C.muted};line-height:1.55;margin-bottom:12px">`;
  if(m.windowText)h+=`<strong style="color:${C.ink}">${m.agreeCount} layer${m.agreeCount===1?"":"s"} point to ${m.windowText}.</strong> `;
  if(m.noSignal.length)h+=`${m.noSignal.length} layer${m.noSignal.length===1?"":"s"} had no datable signal. `;
  if(m.styleRow)h+=`Style shown as low-weight context.`;
  h+=`</div>`;
  h+=`<div style="font-size:11px;letter-spacing:.5px;text-transform:uppercase;color:${C.faint};margin-bottom:6px">Evidence, ranked by how tightly it pins the date</div>`;
  m.rows.forEach((r:any,i:number)=>{
    const mark=!r.isStyle&&r.agrees?"✓":"·";
    const markColor=!r.isStyle&&r.agrees?C.good:C.faint;
    const w=Math.max(12,Math.min(95,r.strength));
    h+=`<div style="display:grid;grid-template-columns:16px 1fr 124px;gap:10px;align-items:center;padding:9px 0;${i===0?"":`border-top:1px solid ${C.line};`}opacity:${r.isStyle?0.72:1}">
      <div style="text-align:center;font-size:14px;color:${markColor}">${mark}</div>
      <div><div style="font-weight:600;font-size:14px;color:${C.ink};${r.isStyle?"font-style:italic":""}">${esc(r.label)}</div>
      <div style="font-size:12px;color:${C.muted}">${r.rangeText}</div></div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:8px;background:${C.track};border-radius:5px;overflow:hidden"><div style="width:${w}%;height:100%;background:${r.isStyle?C.styleBar:C.bar};border-radius:5px"></div></div>
        <div style="font-size:11px;color:${C.muted};min-width:48px;text-align:right">${r.tag}</div>
      </div></div>`;
  });
  if(m.noSignal.length)h+=`<div style="margin-top:8px;font-size:13px;color:${C.muted};padding-top:8px;border-top:1px solid ${C.line}">${m.noSignal.length} layer${m.noSignal.length===1?"":"s"} present, no datable signal: ${m.noSignal.join(" · ")}</div>`;
  return h;
}

const cardCSS="background:#fffdf9;border:1px solid #ded3bf;border-radius:12px;padding:16px;box-shadow:0 1px 2px rgba(0,0,0,.04);margin-bottom:14px";
const metaRow="display:flex;justify-content:space-between;gap:12px;font-size:14px;color:#4f3f30;margin-top:4px";
const card=(title:string,inner:string)=>`<section style="${cardCSS}">${title?`<h3 style="margin:0 0 10px;font-size:18px;color:#3e2f1f">${title}</h3>`:""}${inner}</section>`;
const pill=(k:string,v:string,c?:string)=>`<span style="display:inline-flex;gap:6px;align-items:baseline;background:#efe6d6;border-radius:999px;padding:5px 12px;font-size:14px"><span style="font-size:11px;letter-spacing:.4px;text-transform:uppercase;color:#6a5845">${k}</span><strong style="color:${c||"#3e2f1f"}">${esc(v)}</strong></span>`;
const dropdown=(title:string,inner:string)=>`<details style="border-top:1px solid ${C.line};margin-top:8px"><summary style="cursor:pointer;padding:12px 0 10px;font-weight:600;font-size:15px;color:${C.ink}">${title}</summary><div style="padding-bottom:12px;font-size:14px;color:#574634;line-height:1.6">${inner}</div></details>`;
const stripAliases=(s:string)=>s.replace(/\s*\(also commonly called:[^)]*\)\s*$/i,"");

const j=JSON.parse(fs.readFileSync("scripts/post-block-12-trace.json","utf8"));
const scenarios:[string,string][]=[["eastlake_dresser","Eastlake dresser"],["roos_cedar_chest","Roos cedar chest"],["pre_1860_piece","Pre-1860 piece"]];
let cards="";
for(const [k,title] of scenarios){
  const so=j[k].stage_outputs; const ov=so.p6.dating_overlap; const fid=so.p3?.form_id??null;
  const m=build(ov,so.p3?.style_attribution??null,so.p2?.date_floor??null,so.p2?.date_ceiling??null);
  const styleLabel=so.p3?.style_attribution?.name||so.p3?.style_context;
  const pills=[pill("Date",so.p2?.range||"Unknown")];
  if(styleLabel)pills.push(pill("Style",styleLabel));
  pills.push(pill("Confidence",so.p3?.confidence||"Inconclusive"));
  const headline=`<section style="${cardCSS}"><div style="font-size:24px;font-weight:800;color:#3e2f1f;line-height:1.25">${esc(stripAliases(so.p3?.display_form||so.p3?.form||"Unknown"))}</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">${pills.join("")}</div></section>`;
  const dating=card("How we dated it",`<div style="font-size:12px;color:${C.faint};font-style:italic;margin-bottom:10px">[engine tone + reasoning band renders here]</div>`+renderRows(m));
  let detail=`<div style="${metaRow}"><span>Working range</span><strong>${so.p2?.range||"Unknown"}</strong></div><div style="${metaRow}"><span>Dating confidence</span><strong>${so.p2?.confidence||"Inconclusive"}</strong></div>`;
  if(so.p3?.style_context)detail+=`<div style="margin-top:10px;font-size:14px;color:#574634;line-height:1.55">Broad style context: ${esc(so.p3.style_context)}</div>`;
  if((so.p2?.limitations||[]).length)detail+=`<div style="margin-top:14px;font-weight:700;font-size:14px;color:#3d2d1f">Current limitations</div><ul style="margin:8px 0 0;padding-left:18px;font-size:14px;color:#574634;line-height:1.6">${so.p2.limitations.map((l:string)=>`<li>${esc(l)}</li>`).join("")}</ul>`;
  const regional=getRegionalPeriodNotes(fid);
  if(regional)detail+=dropdown("Regional &amp; period context",`<div style="white-space:pre-wrap">${esc(regional)}</div>`);
  const cousins=getCousinFormContrasts(fid);
  if(cousins.length)detail+=dropdown("How it differs from similar pieces",`<div style="display:grid;gap:8px">${cousins.map(c=>`<div>${esc(c)}</div>`).join("")}</div>`);
  const detailCard=card("Date &amp; style detail",detail);
  // Resale valuation — NO sellability score (Stage 4)
  const bd=so.p6?.valuation?.platform_breakdown;
  let resale="";
  if(bd){
    resale+=`<div style="margin-bottom:14px"><div style="font-size:12px;color:#6a5845;letter-spacing:.3px;text-transform:uppercase">Standard marketplace</div><div style="font-size:22px;font-weight:700;color:#3d2d1f">${esc(bd.marketplace.range)}</div></div>`;
    resale+=`<div style="border:1px solid #e5d8c2;border-radius:10px;overflow:hidden;background:#fffefb">`;
    ["dealer_buy","quick_sale","marketplace","as_found_retail","restored_retail"].forEach((key,idx)=>{const lane=bd[key];const hl=key==="marketplace";
      resale+=`<div style="display:grid;grid-template-columns:minmax(120px,1fr) minmax(90px,130px) minmax(0,2fr);gap:12px;padding:10px 14px;${idx?"border-top:1px solid #efe4d0;":""}${hl?"background:#fbf3e3;":""}align-items:baseline"><div style="font-size:13px;font-weight:${hl?700:600};color:#3d2d1f">${esc(lane.label)}</div><div style="font-size:14px;font-weight:700;color:#3d2d1f;text-align:right">${esc(lane.range)}</div><div style="font-size:12.5px;color:#5c4a37;line-height:1.5">${esc(lane.note||"")}</div></div>`;});
    resale+=`</div><div style="margin-top:10px;font-size:12px;color:${C.faint};font-style:italic">(sellability score removed from UI &mdash; still drives the multiplier internally)</div>`;
  }
  const resaleCard=resale?card("Resale valuation",resale):"";
  // Tips → buying/selling collapsibles (Stage 4)
  const tipList=(arr:string[])=>`<ul style="margin:0;padding-left:18px;font-size:14px;color:#574634;line-height:1.6">${arr.map(t=>`<li style="margin-bottom:4px">${esc(t)}</li>`).join("")}</ul>`;
  const sell=so.p7?.selling_tips||[]; const buy=so.p7?.negotiation_tips||[];
  let tips="";
  if(sell.length)tips+=dropdown("When you're selling",tipList(sell));
  if(buy.length)tips+=dropdown("When you're buying",tipList(buy));
  const tipsCard=tips?card("Buying &amp; selling tips",tips):"";
  cards+=`<div style="max-width:560px;margin:0 auto 30px"><div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:${C.faint};margin-bottom:6px">${title} &middot; engine output</div>${headline}${dating}${detailCard}${resaleCard}${tipsCard}</div>`;
}
const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Report layout — real data</title><style>body{margin:0;background:#f7f3ec;font:16px/1.55 -apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:24px 16px 64px}summary{list-style:revert}</style></head><body>
<div style="max-width:560px;margin:0 auto 18px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:${C.faint}">Stage 3 &middot; real engine output &middot; headline + dating + detail w/ dropdowns</div>
${cards}</body></html>`;
fs.writeFileSync("report-preview-realdata.html",html);
console.log("wrote report-preview-realdata.html");
