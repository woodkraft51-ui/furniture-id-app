'use client';

import React, { useMemo, useState } from "react";
import { API } from "../lib/store";

type ImageRecord = {
  image_type: string;
  data_url: string;
  name?: string;
};
 
type CoreImageMap = Record<string, ImageRecord | null>;
type GroupImageMap = Record<string, ImageRecord[]>;

type IntakeState = {
  analysis_mode: "full_analysis" | "field_scan";
  asking_price: string;
  picker_profile?: any;
  approximate_height: string;
  approximate_width: string;
  primary_wood_guess: string;
  where_acquired: string;
  known_provenance: string;
  known_alterations: string;
  user_category_guess: string;
  condition_notes: string;
  notes: string;
  has_drawers: boolean;
  has_doors: boolean;
  folds_or_expands: boolean;
  has_mechanical_parts: boolean;
  suggests_prior_function: boolean;
};

type ReportShape = {
  id?: string;
  status?: string;
  analysis_mode?: "full_analysis" | "field_scan";
  final_report?: string;
  stage_outputs?: Record<string, any>;
  observations?: any[];
  images?: any[];
  evidence_digest?: any;
};

type RecommendationLevel = "BUY_NOW" | "BUY" | "CONSIDER" | "PASS";

const CORE_SLOTS = [
  { key: "overall_front", label: "Overall Front", desc: "Full front view of the piece.", required: true },
  { key: "overall_side", label: "Overall Side / Profile", desc: "Shows depth, silhouette, and side structure.", required: true },
  { key: "underside", label: "Underside", desc: "Best for saw marks, fasteners, and hidden structure.", required: false },
  { key: "back", label: "Back Panel", desc: "Useful for milling, backboards, and secondary wood.", required: false },
  { key: "label_makers_mark", label: "Label or Maker's Mark", desc: "Stamps, paper labels, serial tags, branded hardware.", required: false },
] as const;

const GROUP_SLOTS = [
  { key: "hardware", image_type: "hardware_closeup", label: "Hardware Evidence", helper: "Pulls, hinges, locks, latches, casters, escutcheons, brackets." },
  { key: "construction", image_type: "joinery_closeup", label: "Construction Details", helper: "Drawer corners, rails, braces, joinery, tool marks, underside details." },
] as const;

const INITIAL_INTAKE: IntakeState = {
  analysis_mode: "full_analysis",
  asking_price: "",
  picker_profile: undefined,
  approximate_height: "",
  approximate_width: "",
  primary_wood_guess: "",
  where_acquired: "",
  known_provenance: "",
  known_alterations: "",
  user_category_guess: "",
  condition_notes: "",
  notes: "",
  has_drawers: false,
  has_doors: false,
  folds_or_expands: false,
  has_mechanical_parts: false,
  suggests_prior_function: false,
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function bandColor(band?: string) {
  if (band === "High") return "#2f6f3e";
  if (band === "Moderate") return "#7a5a12";
  if (band === "Low") return "#7a4a12";
  return "#7a2626";
}

function inferFieldImageType(index: number): string {
  if (index === 0) return "overall_front";
  if (index === 1) return "overall_side";
  return "detail";
}

function computeMissingEvidenceFromImages(images: ImageRecord[]) {
  const types = new Set(images.map((img) => String(img?.image_type || "")));
  return {
    underside_photo: !types.has("underside"),
    back_photo: !types.has("back"),
    joinery_photo: !types.has("joinery_closeup"),
    hardware_photo: !types.has("hardware_closeup"),
    label_photo: !types.has("label_makers_mark"),
  };
}

function computeMissingEvidenceFromStructured(coreImages: CoreImageMap, groupImages: GroupImageMap) {
  const coreKeys = new Set(Object.entries(coreImages).filter(([, v]) => !!v).map(([k]) => k));
  const groupTypes = new Set(Object.values(groupImages).flat().map((img) => img.image_type));
  return {
    underside_photo: !coreKeys.has("underside"),
    back_photo: !coreKeys.has("back"),
    joinery_photo: !groupTypes.has("joinery_closeup"),
    hardware_photo: !groupTypes.has("hardware_closeup"),
    label_photo: !coreKeys.has("label_makers_mark"),
  };
}

function recommendationLabel(rec: RecommendationLevel) {
  if (rec === "BUY_NOW") return "BUY NOW";
  if (rec === "BUY") return "BUY";
  if (rec === "CONSIDER") return "CONSIDER";
  return "PASS";
}

function recommendationStyle(rec: RecommendationLevel): React.CSSProperties {
  if (rec === "BUY_NOW") return { background: "#dff3e4", border: "1px solid #9ec8a9", color: "#1f5a2b" };
  if (rec === "BUY") return { background: "#e8f6ea", border: "1px solid #afcfb6", color: "#245b2f" };
  if (rec === "CONSIDER") return { background: "#fbf2d9", border: "1px solid #d9c27d", color: "#7a5a12" };
  return { background: "#f8dede", border: "1px solid #d7a1a1", color: "#7a2626" };
}

function fieldValueBand(form: string, dateRange: string, conflictCount: number, confidenceBand?: string) {
  let low = 25;
  let high = 300;

  if (form.includes("Gate") || form.includes("Drop-leaf")) {
    low = 35;
    high = 300;
  } else if (form.includes("Extension")) {
    low = 50;
    high = 350;
  } else if (form.includes("Blanket chest")) {
    low = 50;
    high = 400;
  } else if (form.includes("Roll-top") || form.includes("Slant-front") || form.includes("Desk")) {
    low = 75;
    high = 500;
  } else if (form.includes("Cabinet") || form.includes("Chest of drawers") || form.includes("Dresser")) {
    low = 50;
    high = 450;
  } else if (form.includes("Bookcase")) {
    low = 40;
    high = 350;
  } else if (form.includes("Table")) {
    low = 35;
    high = 280;
  }

  if (String(dateRange || "").toLowerCase().includes("post-1935")) {
    low = Math.round(low * 0.75);
    high = Math.round(high * 0.82);
  }

  if (conflictCount >= 1) {
    low = Math.round(low * 0.92);
    high = Math.round(high * 0.9);
  }

  if (conflictCount >= 3) {
    low = Math.round(low * 0.82);
    high = Math.round(high * 0.82);
  }

  if (confidenceBand === "High") {
    low = Math.round(low * 1.05);
    high = Math.round(high * 0.9);
  } else if (confidenceBand === "Low" || confidenceBand === "Inconclusive") {
    high = Math.round(high * 1.05);
  }

  return { low, high, display: `$${low} – $${high}` };
}

function deriveFieldRecommendation(args: { askingPrice: string; valueLow: number; valueHigh: number; confidenceBand?: string; conflictCount: number }) {
  const asking = Number(String(args.askingPrice || "").replace(/[$,]/g, "").trim());
  const hasAsking = Number.isFinite(asking) && asking > 0;
  const midpoint = Math.round((args.valueLow + args.valueHigh) / 2);
  let score = 50;

  if (hasAsking) {
    const margin = midpoint - asking;
    if (margin >= 175) score += 24;
    else if (margin >= 90) score += 16;
    else if (margin >= 35) score += 8;
    else if (margin < 0) score -= 22;
  } else {
    score -= 6;
  }

  if (args.conflictCount >= 1) score -= 8;
  if (args.confidenceBand === "High") score += 8;
  if (args.confidenceBand === "Moderate") score += 3;
  if (args.confidenceBand === "Low") score -= 8;
  if (args.confidenceBand === "Inconclusive") score -= 14;

  let recommendation: RecommendationLevel = "CONSIDER";
  if (score >= 82) recommendation = "BUY_NOW";
  else if (score >= 66) recommendation = "BUY";
  else if (score < 45) recommendation = "PASS";

  if (!hasAsking && recommendation === "BUY_NOW") recommendation = "BUY";
  if (!hasAsking && recommendation === "BUY") recommendation = "CONSIDER";

  let explanation = "";
  if (!hasAsking) explanation = "No asking price was entered, so this recommendation stays conservative.";
  else if (recommendation === "BUY_NOW") explanation = "The estimated value lane and visible evidence support a strong buy at the entered price.";
  else if (recommendation === "BUY") explanation = "The piece appears promising at the entered price, with enough support for a positive field decision.";
  else if (recommendation === "CONSIDER") explanation = "There may be upside, but uncertainty or risk suggests a cautious decision.";
  else explanation = "The visible risk, weak margin, or limited support make this a pass.";

  return { recommendation, label: recommendationLabel(recommendation), explanation };
}
function evidenceMeaning(text: string): string {
  const t = String(text || "").toLowerCase();

  if (t.includes("seating surface") || t.includes("bench")) {
    return "This confirms the piece was designed for sitting, which immediately narrows the form away from cabinets or tables.";
  }

  if (t.includes("secondary surface") || t.includes("writing surface")) {
    return "This indicates a functional surface, supporting a writing bench or telephone bench rather than a simple chair.";
  }

  if (t.includes("spindle")) {
    return "Spindle construction supports late 19th to early 20th century production and helps define the form structure.";
  }

  if (t.includes("turned")) {
    return "Turned elements suggest lathe-based shaping, common in late 1800s to early 1900s production.";
  }

  if (t.includes("paint") || t.includes("finish")) {
    return "Surface finish may indicate later refinishing and should be considered when judging originality.";
  }

  // ✅ DEFAULT: DO NOT OVERRIDE GOOD EVIDENCE
  return "";
}

function pickSupportingEvidence(report: ReportShape | null): string[] {
  const p2 = report?.stage_outputs?.p2;
  const p3 = report?.stage_outputs?.p3;
  const p4 = report?.stage_outputs?.p4;
  const out: string[] = [];
  if (Array.isArray(p3?.support)) out.push(...p3.support);
  if (Array.isArray(p2?.support)) out.push(...p2.support);
  if (Array.isArray(p4?.confidence_drivers?.increased)) out.push(...p4.confidence_drivers.increased);
  return Array.from(new Set(out.map((item) => String(item || "").trim()).filter(Boolean))).slice(0, 4);
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: "#fffdf9", border: "1px solid #ded3bf", borderRadius: 12, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      <h3 style={{ margin: "0 0 10px", fontSize: 18, color: "#3e2f1f" }}>{title}</h3>
      {children}
    </section>
  );
}

function RunButton({ label, disabled, isRunning, onClick }: { label: string; disabled: boolean; isRunning: boolean; onClick: () => void }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 13, color: "#6b5c4f", marginBottom: 6 }}>Add more detail for a tighter result, or run it now.</div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{ ...primaryButton, opacity: disabled || isRunning ? 0.7 : 1, cursor: disabled || isRunning ? "not-allowed" : "pointer" }}
      >
        {isRunning ? "Analyzing..." : label}
      </button>
    </div>
  );
}

export default function Page() {
  const [coreImages, setCoreImages] = useState<CoreImageMap>({ overall_front: null, overall_side: null, underside: null, back: null, label_makers_mark: null });
  const [groupImages, setGroupImages] = useState<GroupImageMap>({ hardware: [], construction: [] });
  const [fieldPhotos, setFieldPhotos] = useState<ImageRecord[]>([]);
  const [intake, setIntake] = useState<IntakeState>(INITIAL_INTAKE);
  const [report, setReport] = useState<ReportShape | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  const analysisMode = intake.analysis_mode;

  const structuredMissingEvidence = useMemo(() => computeMissingEvidenceFromStructured(coreImages, groupImages), [coreImages, groupImages]);
  const fieldMissingEvidence = useMemo(() => computeMissingEvidenceFromImages(fieldPhotos), [fieldPhotos]);
  const totalPhotos = useMemo(() => {
    if (analysisMode === "field_scan") return fieldPhotos.length;
    const coreCount = Object.values(coreImages).filter(Boolean).length;
    const groupCount = Object.values(groupImages).reduce((sum, arr) => sum + arr.length, 0);
    return coreCount + groupCount;
  }, [analysisMode, coreImages, groupImages, fieldPhotos]);

  const allImages = useMemo(() => {
    if (analysisMode === "field_scan") return fieldPhotos;
    const core = Object.values(coreImages).filter(Boolean) as ImageRecord[];
    const grouped = Object.values(groupImages).flat();
    return [...core, ...grouped];
  }, [analysisMode, coreImages, groupImages, fieldPhotos]);

  async function handleCoreUpload(slotKey: string, fileList: FileList | null) {
    if (!fileList || !fileList[0]) return;
    const file = fileList[0];
    const dataUrl = await fileToDataUrl(file);
    setCoreImages((prev) => ({ ...prev, [slotKey]: { image_type: slotKey, data_url: dataUrl, name: file.name } }));
  }

  async function handleGroupUpload(groupKey: string, imageType: string, fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const nextImages: ImageRecord[] = [];
    for (const file of files) nextImages.push({ image_type: imageType, data_url: await fileToDataUrl(file), name: file.name });
    setGroupImages((prev) => ({ ...prev, [groupKey]: [...(prev[groupKey] || []), ...nextImages] }));
  }

  async function handleFieldUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const nextImages: ImageRecord[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const nextIndex = fieldPhotos.length + nextImages.length;
      nextImages.push({ image_type: inferFieldImageType(nextIndex), data_url: await fileToDataUrl(file), name: file.name });
    }
    setFieldPhotos((prev) => [...prev, ...nextImages]);
  }

  async function handleFieldRefinementUpload(imageType: string, fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const nextImages: ImageRecord[] = [];
    for (const file of files) nextImages.push({ image_type: imageType, data_url: await fileToDataUrl(file), name: file.name });
    setFieldPhotos((prev) => [...prev, ...nextImages]);
  }

  function removeCoreImage(slotKey: string) {
    setCoreImages((prev) => ({ ...prev, [slotKey]: null }));
  }

  function removeGroupImage(groupKey: string, index: number) {
    setGroupImages((prev) => ({ ...prev, [groupKey]: prev[groupKey].filter((_, i) => i !== index) }));
  }

  function removeFieldPhoto(index: number) {
    setFieldPhotos((prev) => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, image_type: inferFieldImageType(i) })));
  }

  function updateIntake<K extends keyof IntakeState>(key: K, value: IntakeState[K]) {
    setIntake((prev) => ({ ...prev, [key]: value }));
  }

  async function runAnalysis() {
    setError("");
    setReport(null);

    if (analysisMode === "field_scan") {
      if (fieldPhotos.length < 2) {
        setError("Please add at least two photos before running Field Scan.");
        return;
      }
    } else {
      if (!coreImages.overall_front || !coreImages.overall_side) {
        setError("Please upload at least an Overall Front and Overall Side photo before analyzing.");
        return;
      }
      if (allImages.length < 2) {
        setError("Please upload at least two photos before analyzing.");
        return;
      }
    }

    setIsRunning(true);
    try {
      const created = API.createCase({ notes: intake.notes, analysis_mode: intake.analysis_mode });
      const caseId = created.case_id;
      setActiveCaseId(caseId);
      for (const img of allImages) API.addImage(caseId, img);
      await API.analyzeCase(caseId, intake);
      setReport(API.getReport(caseId));
    } catch (e: any) {
      setError(e?.message || "Analysis failed.");
    } finally {
      setIsRunning(false);
    }
  }

  function resetAll() {
    setCoreImages({ overall_front: null, overall_side: null, underside: null, back: null, label_makers_mark: null });
    setGroupImages({ hardware: [], construction: [] });
    setFieldPhotos([]);
    setIntake(INITIAL_INTAKE);
    setReport(null);
    setActiveCaseId("");
    setError("");
    setIsRunning(false);
  }

  const stageOutputs = report?.stage_outputs || {};
  const p1 = stageOutputs.p1 || null;
  const p2 = stageOutputs.p2 || null;
  const p3 = stageOutputs.p3 || null;
  const p5 = stageOutputs.p5 || null;
  const p6 = stageOutputs.p6 || null;

  const fieldValue = useMemo(() => {
    if (!p2 || !p3) return null;
    return fieldValueBand(p3?.display_form || p3?.form || "Unknown", p2?.range || "Unknown", Array.isArray(p5?.conflict_notes) ? p5.conflict_notes.length : 0, p1?.confidence_cap);
  }, [p1, p2, p3, p5]);

  const fieldRecommendation = useMemo(() => {
    if (!fieldValue) return null;
    return deriveFieldRecommendation({ askingPrice: intake.asking_price, valueLow: fieldValue.low, valueHigh: fieldValue.high, confidenceBand: p1?.confidence_cap, conflictCount: Array.isArray(p5?.conflict_notes) ? p5.conflict_notes.length : 0 });
  }, [fieldValue, intake.asking_price, p1, p5]);

  const supportingEvidence = useMemo(() => pickSupportingEvidence(report), [report]);
  const primaryCaution = (Array.isArray(p5?.conflict_notes) && p5.conflict_notes[0]) || (Array.isArray(p2?.limitations) && p2.limitations[0]) || "Results remain broad until more structural evidence is visible.";
  const nextBestEvidence = (Array.isArray(p1?.next_best_evidence) && p1.next_best_evidence[0]) || "Add a structural detail such as an underside, back, or joinery view if accessible.";

  const fieldReady = fieldPhotos.length >= 2;
  const fullReady = Boolean(coreImages.overall_front && coreImages.overall_side && allImages.length >= 2);

  return (
    <main style={{ minHeight: "100vh", background: "#f6f1e8", color: "#2f2418", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 60px" }}>
        <header style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
            <img
  src="/proof-sleuth-logo.png"
  alt="Proof Sleuth"
  style={{ height: 80, width: "auto", display: "block" }}
/>
          </div>

          {analysisMode === "field_scan" ? (
            <>
              <div style={{ marginBottom: 6, fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5d4932" }}>New Creations Woodcraft</div>
              <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.15, color: "#352719" }}>Field Scan</h1>
              <p style={{ margin: "10px 0 0", maxWidth: 860, lineHeight: 1.6, color: "#594734", fontSize: 16 }}>Quick Identification and Buying Guidance · Rooted in Evidence</p>
              <p style={{ margin: "8px 0 0", maxWidth: 860, lineHeight: 1.6, color: "#6a5845", fontSize: 15 }}>Upload a few photos and receive a clear, evidence-based evaluation.</p>
            </>
          ) : (
            <>
              <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.15, color: "#352719" }}>Evidence-First Furniture Analysis</h1>
              <p style={{ margin: "10px 0 0", maxWidth: 860, lineHeight: 1.6, color: "#594734", fontSize: 16 }}>This version uses a single image pass to build the evidence ledger, then reasons from that evidence. It leads with what is clearly supported, then follows with what remains tentative and what more evidence would help confirm.</p>
            </>
          )}
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <SectionCard title="Analysis Mode">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 12, border: "1px solid #d9ccb5", borderRadius: 10, background: intake.analysis_mode === "full_analysis" ? "#fff7eb" : "#fff", cursor: "pointer", flex: 1 }}>
                <input type="radio" name="analysis_mode" checked={intake.analysis_mode === "full_analysis"} onChange={() => updateIntake("analysis_mode", "full_analysis" as any)} />
                <div><div style={{ fontWeight: 700 }}>Full Analysis</div><div style={{ fontSize: 13, color: "#6a5845", marginTop: 4 }}>Deeper intake and fuller narrative output.</div></div>
              </label>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 12, border: "1px solid #d9ccb5", borderRadius: 10, background: intake.analysis_mode === "field_scan" ? "#fff7eb" : "#fff", cursor: "pointer", flex: 1 }}>
                <input type="radio" name="analysis_mode" checked={intake.analysis_mode === "field_scan"} onChange={() => updateIntake("analysis_mode", "field_scan" as any)} />
                <div><div style={{ fontWeight: 700 }}>Field Scan</div><div style={{ fontSize: 13, color: "#6a5845", marginTop: 4 }}>Faster intake with recommendation-first output.</div></div>
              </label>
            </div>
          </SectionCard>

          {analysisMode === "field_scan" ? (
            <>
              <SectionCard title="1. Add Photos">
                <div style={{ border: "1px dashed #ccbca2", borderRadius: 12, background: "#fffaf2", padding: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#3d2d1f" }}>Add 2–5 photos. We’ll handle the rest.</div>
                  <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65, color: "#5b4935" }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>For best results, include:</div>
                    <div>• The overall form from multiple angles</div>
                    <div>• Visible construction details, if accessible</div>
                    <div>• Hardware or surface finish</div>
                    <div style={{ marginTop: 8 }}>Additional views help refine accuracy, but are not required.</div>
                  </div>
                  <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <label style={uploadBrownButton}>Upload Photos<input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleFieldUpload(e.target.files)} /></label>
                    <label style={uploadTanButton}>Take Photo<input type="file" accept="image/*" capture="environment" multiple style={{ display: "none" }} onChange={(e) => handleFieldUpload(e.target.files)} /></label>
                  </div>
                </div>
                {fieldPhotos.length > 0 && (
                  <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                    {fieldPhotos.map((img, index) => (
                      <div key={`${img.name || "field-photo"}-${index}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #eadfcf", borderRadius: 8, padding: "8px 10px", background: "#fff" }}>
                        <div style={{ fontSize: 13, color: "#4f3f30" }}>{img.name || `Photo ${index + 1}`}</div>
                        <button type="button" onClick={() => removeFieldPhoto(index)} style={tinyRemoveButton}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="2. Quick Details">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Asking Price (optional)</span>
                    <input value={intake.asking_price} onChange={(e) => updateIntake("asking_price", e.target.value as any)} style={inputStyle} placeholder="e.g. 45" />
                  </label>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Quick Details (optional)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      ["has_drawers", "Has drawers"],
                      ["has_doors", "Has doors"],
                      ["folds_or_expands", "Folds or expands"],
                      ["has_mechanical_parts", "Has mechanical parts"],
                      ["suggests_prior_function", "Suggests prior function"],
                    ].map(([key, label]) => (
                      <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4a3928" }}>
                        <input type="checkbox" checked={Boolean(intake[key as keyof IntakeState])} onChange={(e) => updateIntake(key as keyof IntakeState, e.target.checked as any)} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <RunButton label="Run Field Scan" disabled={isRunning || !fieldReady} isRunning={isRunning} onClick={runAnalysis} />
                {error && <div style={errorStyle}>{error}</div>}
              </SectionCard>
            </>
          ) : (
            <>
              <SectionCard title="1. Core Photos">
                <div style={{ display: "grid", gap: 14 }}>
                  {CORE_SLOTS.map((slot) => {
                    const current = coreImages[slot.key];
                    return (
                      <div key={slot.key} style={{ border: "1px solid #e2d7c3", borderRadius: 10, padding: 12, background: "#fff" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                          <div>
                            <div style={{ fontWeight: 700, color: "#3d2d1f" }}>{slot.label} {slot.required ? "*" : ""}</div>
                            <div style={{ fontSize: 13, color: "#6a5845", marginTop: 4 }}>{slot.desc}</div>
                            {current?.name && <div style={{ marginTop: 8, fontSize: 12, color: "#46603e" }}>Loaded: {current.name}</div>}
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <label style={uploadBrownButtonSmall}>Upload Photo<input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleCoreUpload(slot.key, e.target.files)} /></label>
                            <label style={uploadTanButtonSmall}>Take Photo<input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleCoreUpload(slot.key, e.target.files)} /></label>
                            {current && <button type="button" onClick={() => removeCoreImage(slot.key)} style={smallRemoveButton}>Remove</button>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard title="2. Additional Evidence Photos">
                <div style={{ display: "grid", gap: 14 }}>
                  {GROUP_SLOTS.map((group) => {
                    const items = groupImages[group.key] || [];
                    return (
                      <div key={group.key} style={{ border: "1px solid #e2d7c3", borderRadius: 10, padding: 12, background: "#fff" }}>
                        <div style={{ fontWeight: 700, color: "#3d2d1f" }}>{group.label}</div>
                        <div style={{ fontSize: 13, color: "#6a5845", marginTop: 4 }}>{group.helper}</div>
                        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <label style={uploadBrownButtonSmall}>Upload Photo(s)<input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleGroupUpload(group.key, group.image_type, e.target.files)} /></label>
                          <label style={uploadTanButtonSmall}>Take Photo<input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleGroupUpload(group.key, group.image_type, e.target.files)} /></label>
                        </div>
                        {items.length > 0 && (
                          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                            {items.map((img, index) => (
                              <div key={`${img.name || "img"}-${index}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #eadfcf", borderRadius: 8, padding: "8px 10px", background: "#fffaf5" }}>
                                <div style={{ fontSize: 13, color: "#4f3f30" }}>{img.name || `${group.label} ${index + 1}`}</div>
                                <button type="button" onClick={() => removeGroupImage(group.key, index)} style={tinyRemoveButton}>Remove</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              <SectionCard title="3. Intake Details">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <label style={{ display: "grid", gap: 6 }}><span style={{ fontSize: 13, fontWeight: 600 }}>Height (in)</span><input value={intake.approximate_height} onChange={(e) => updateIntake("approximate_height", e.target.value)} style={inputStyle} /></label>
                  <label style={{ display: "grid", gap: 6 }}><span style={{ fontSize: 13, fontWeight: 600 }}>Width (in)</span><input value={intake.approximate_width} onChange={(e) => updateIntake("approximate_width", e.target.value)} style={inputStyle} /></label>
                  <label style={{ display: "grid", gap: 6 }}><span style={{ fontSize: 13, fontWeight: 600 }}>Wood Species Guess</span><input value={intake.primary_wood_guess} onChange={(e) => updateIntake("primary_wood_guess", e.target.value)} style={inputStyle} /></label>
                  <label style={{ display: "grid", gap: 6 }}><span style={{ fontSize: 13, fontWeight: 600 }}>Where Acquired</span><input value={intake.where_acquired} onChange={(e) => updateIntake("where_acquired", e.target.value)} style={inputStyle} /></label>
                  <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}><span style={{ fontSize: 13, fontWeight: 600 }}>What do you think it is?</span><input value={intake.user_category_guess} onChange={(e) => updateIntake("user_category_guess", e.target.value)} style={inputStyle} /></label>
                  <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}><span style={{ fontSize: 13, fontWeight: 600 }}>Known Provenance</span><textarea value={intake.known_provenance} onChange={(e) => updateIntake("known_provenance", e.target.value)} style={textareaStyle} rows={3} /></label>
                  <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}><span style={{ fontSize: 13, fontWeight: 600 }}>Alterations, Missing Parts, or Replacements</span><textarea value={intake.known_alterations} onChange={(e) => updateIntake("known_alterations", e.target.value)} style={textareaStyle} rows={3} /></label>
                  <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}><span style={{ fontSize: 13, fontWeight: 600 }}>Condition Notes</span><textarea value={intake.condition_notes} onChange={(e) => updateIntake("condition_notes", e.target.value)} style={textareaStyle} rows={3} /></label>
                  <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}><span style={{ fontSize: 13, fontWeight: 600 }}>Additional Notes</span><textarea value={intake.notes} onChange={(e) => updateIntake("notes", e.target.value)} style={textareaStyle} rows={3} /></label>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Functional Clues</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      ["has_drawers", "Has drawers"],
                      ["has_doors", "Has doors"],
                      ["folds_or_expands", "Folds or expands"],
                      ["has_mechanical_parts", "Has pedals, cranks, or mechanical parts"],
                      ["suggests_prior_function", "Suggests a prior function"],
                    ].map(([key, label]) => (
                      <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#4a3928" }}>
                        <input type="checkbox" checked={Boolean(intake[key as keyof IntakeState])} onChange={(e) => updateIntake(key as keyof IntakeState, e.target.checked as any)} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <RunButton label="Run Full Analysis" disabled={isRunning || !fullReady} isRunning={isRunning} onClick={runAnalysis} />
                {error && <div style={errorStyle}>{error}</div>}
              </SectionCard>
            </>
          )}
        </div>

        {report && analysisMode === "field_scan" && p2 && p3 && fieldValue && fieldRecommendation && (
          <div style={{ marginTop: 20, display: "grid", gap: 18 }}>
            <SectionCard title="Field Scan Result">
              <div style={{ ...recommendationStyle(fieldRecommendation.recommendation), borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.03em", lineHeight: 1.1 }}>{fieldRecommendation.label}</div>
                <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55 }}>{fieldRecommendation.explanation}</div>
              </div>
            </SectionCard>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <SectionCard title="Likely Identification">
                <div style={metaRowStyle}><span>Best reading</span><strong>{p3?.display_form || p3?.form || "Unknown"}</strong></div>
                {p3?.style_context && <div style={{ marginTop: 10, fontSize: 14, color: "#574634", lineHeight: 1.55 }}>Broad style context: {p3.style_context}</div>}
                {Array.isArray(p3?.alternatives) && p3.alternatives.length > 0 && <><div style={subheadStyle}>Alternate possibilities</div><ul style={listStyle}>{p3.alternatives.map((item: string) => <li key={item}>{item}</li>)}</ul></>}
              </SectionCard>
              <SectionCard title="Broad Date Lane">
                <div style={metaRowStyle}><span>Working range</span><strong>{p2?.range || "Unknown"}</strong></div>
                <div style={metaRowStyle}><span>Confidence</span><strong style={{ color: bandColor(p2?.confidence) }}>{p2?.confidence || "Inconclusive"}</strong></div>
              </SectionCard>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <SectionCard title="Broad Resale Lane">
                <div style={metaRowStyle}><span>Typical resale lane</span><strong>{fieldValue.display}</strong></div>
                <div style={{ marginTop: 10, fontSize: 14, color: "#574634", lineHeight: 1.55 }}>This is a broad field-use range shaped by likely form, date lane, and visible risk.</div>
              </SectionCard>
              <SectionCard title="Main Caution"><div style={{ fontSize: 14, color: "#574634", lineHeight: 1.6 }}>{primaryCaution}</div></SectionCard>
            </div>

            <SectionCard title="Key Supporting Evidence">
              {supportingEvidence.length > 0 ? <div style={{ display: "grid", gap: 12 }}>{supportingEvidence.map((item) => <div key={item} style={{ border: "1px solid #eadfcf", borderRadius: 10, padding: 12, background: "#fff" }}><div style={{ fontWeight: 700, fontSize: 14, color: "#3d2d1f", lineHeight: 1.5 }}>{item}</div>{evidenceMeaning(item) && (
  <div style={{ marginTop: 6, fontSize: 14, color: "#5c4a37", lineHeight: 1.6 }}>
    {evidenceMeaning(item)}
  </div>
)}</div>)}</div> : <div style={emptyText}>No supporting evidence was returned.</div>}
            </SectionCard>

            <SectionCard title="Next Best Evidence"><div style={{ fontSize: 14, color: "#574634", lineHeight: 1.6 }}>{nextBestEvidence}</div></SectionCard>

            <SectionCard title="Refine This Result">
              <div style={{ fontSize: 14, color: "#574634", lineHeight: 1.6, marginBottom: 12 }}>Add a follow-up photo to tighten the result without starting over.</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <label style={uploadBrownButton}>Add Underside Photo<input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleFieldRefinementUpload("underside", e.target.files)} /></label>
                <label style={uploadTanButton}>Add Back Photo<input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleFieldRefinementUpload("back", e.target.files)} /></label>
                <label style={uploadOliveButton}>Add Construction Detail<input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleFieldRefinementUpload("joinery_closeup", e.target.files)} /></label>
                <label style={uploadGoldButton}>Add Hardware Close-Up<input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleFieldRefinementUpload("hardware_closeup", e.target.files)} /></label>
              </div>
              <RunButton label="Re-Run Field Scan" disabled={isRunning || !fieldReady} isRunning={isRunning} onClick={runAnalysis} />
            </SectionCard>
          </div>
        )}

        {report && analysisMode === "full_analysis" && (
          <div style={{ marginTop: 20, display: "grid", gap: 18 }}>
            <SectionCard title="Analysis Summary"><div style={{ fontSize: 15, lineHeight: 1.7, color: "#3e2f1f", whiteSpace: "pre-wrap" }}>{p6?.summary || report.final_report || "No final report text returned."}</div></SectionCard>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <SectionCard title="Primary Identification">
                <div style={metaRowStyle}><span>Best reading</span><strong>{p3?.display_form || p3?.form || "Unknown"}</strong></div>
                <div style={metaRowStyle}><span>Confidence</span><strong style={{ color: bandColor(p3?.confidence) }}>{p3?.confidence || "Inconclusive"}</strong></div>
                {p3?.style_context && <div style={{ marginTop: 10, fontSize: 14, color: "#574634", lineHeight: 1.55 }}>Broad style context: {p3.style_context}</div>}
                {Array.isArray(p3?.alternatives) && p3.alternatives.length > 0 && <><div style={subheadStyle}>Alternate possibilities</div><ul style={listStyle}>{p3.alternatives.map((item: string) => <li key={item}>{item}</li>)}</ul></>}
              </SectionCard>
              <SectionCard title="Dating Analysis">
                <div style={metaRowStyle}><span>Working range</span><strong>{p2?.range || "Unknown"}</strong></div>
                <div style={metaRowStyle}><span>Confidence</span><strong style={{ color: bandColor(p2?.confidence) }}>{p2?.confidence || "Inconclusive"}</strong></div>
                {Array.isArray(p2?.limitations) && p2.limitations.length > 0 && <><div style={subheadStyle}>Current limitations</div><ul style={listStyle}>{p2.limitations.map((item: string) => <li key={item}>{item}</li>)}</ul></>}
              </SectionCard>
            </div>
            <SectionCard title="Key Supporting Evidence">{supportingEvidence.length > 0 ? <div style={{ display: "grid", gap: 12 }}>{supportingEvidence.map((item) => <div key={item} style={{ border: "1px solid #eadfcf", borderRadius: 10, padding: 12, background: "#fff" }}><div style={{ fontWeight: 700, fontSize: 14, color: "#3d2d1f", lineHeight: 1.5 }}>{item}</div><div style={{ marginTop: 6, fontSize: 14, color: "#5c4a37", lineHeight: 1.6 }}>{evidenceMeaning(item)}</div></div>)}</div> : <div style={emptyText}>No supporting evidence was returned.</div>}</SectionCard>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <SectionCard title="Supported Findings">{p6?.supported_findings?.length ? <ul style={listStyle}>{p6.supported_findings.map((item: string) => <li key={item}>{item}</li>)}</ul> : <div style={emptyText}>No supported findings were returned.</div>}</SectionCard>
              <SectionCard title="Cautions and Conflicts">{p6?.tentative_findings?.length ? <ul style={listStyle}>{p6.tentative_findings.map((item: string) => <li key={item}>{item}</li>)}</ul> : <div style={emptyText}>No major cautions were returned.</div>}</SectionCard>
            </div>
            <SectionCard title="Next Best Evidence">{Array.isArray(p6?.more_evidence_needed) && p6.more_evidence_needed.length > 0 ? <ul style={listStyle}>{p6.more_evidence_needed.map((item: string) => <li key={item}>{item}</li>)}</ul> : <div style={emptyText}>No additional evidence recommendations were returned.</div>}</SectionCard>
          </div>
        )}
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", border: "1px solid #d7c8af", borderRadius: 8, padding: "10px 12px", background: "#fffefb", color: "#2f2418", fontSize: 14 };
const textareaStyle: React.CSSProperties = { ...inputStyle, resize: "vertical" };
const primaryButton: React.CSSProperties = { border: "none", background: "#5a3e1b", color: "#fffaf2", borderRadius: 10, padding: "11px 16px", fontSize: 14, fontWeight: 700 };
const uploadBrownButton: React.CSSProperties = { display: "inline-block", background: "#5a3e1b", color: "#fffaf2", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontSize: 14, fontWeight: 700 };
const uploadTanButton: React.CSSProperties = { display: "inline-block", background: "#7d6540", color: "#fffaf2", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontSize: 14, fontWeight: 700 };
const uploadOliveButton: React.CSSProperties = { display: "inline-block", background: "#8a6f47", color: "#fffaf2", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontSize: 14, fontWeight: 700 };
const uploadGoldButton: React.CSSProperties = { display: "inline-block", background: "#9a7d53", color: "#fffaf2", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontSize: 14, fontWeight: 700 };
const uploadBrownButtonSmall: React.CSSProperties = { ...uploadBrownButton, padding: "9px 12px", fontSize: 13, fontWeight: 600 };
const uploadTanButtonSmall: React.CSSProperties = { ...uploadTanButton, padding: "9px 12px", fontSize: 13, fontWeight: 600 };
const smallRemoveButton: React.CSSProperties = { border: "1px solid #cebda4", background: "#fff8ee", color: "#6f4428", borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontSize: 13 };
const tinyRemoveButton: React.CSSProperties = { border: "1px solid #cebda4", background: "#fff8ee", color: "#6f4428", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12 };
const listStyle: React.CSSProperties = { margin: "8px 0 0", paddingLeft: 18, fontSize: 14, lineHeight: 1.6, color: "#574634" };
const subheadStyle: React.CSSProperties = { marginTop: 14, marginBottom: 6, fontSize: 14, fontWeight: 700, color: "#3d2d1f" };
const metaRowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14, color: "#4f3f30" };
const emptyText: React.CSSProperties = { fontSize: 14, color: "#6a5845" };
const errorStyle: React.CSSProperties = { marginTop: 14, padding: 12, borderRadius: 10, background: "#fff1f1", border: "1px solid #efc5c5", color: "#7a2626", fontSize: 14 };
