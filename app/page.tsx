'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { API } from "../lib/store";
import { buildDatingFindingNarrative, type DatingFindingNarrative } from "../lib/datingFindingNarrative";
import { pickStrongestZoneIndex } from "../lib/engineDatingOverlap";
import WelcomeLanding from "./WelcomeLanding";
import ExampleModal from "./ExampleModal";
import GuidanceMessages from "./GuidanceMessages";
import TraceReport from "./TraceReport";
import PickerProfileSetup from "./PickerProfileSetup";
import GlossaryText from "./GlossaryText";
import { PHOTO_EXAMPLES } from "../lib/intake";
import { recommendationFromValue, isLargeForm, hasRepairSignals } from "../lib/fieldRecommendation";
import { getProfile, saveProfile, hasBeenPrompted, markPrompted } from "../lib/profile";
import { getBasket, addToBasket, isInBasket, COMPARE_BASKET_EVENT, COMPARE_BASKET_MAX } from "../lib/compareBasket";

const LANDING_DISMISSED_KEY = "proof_sleuth_landing_dismissed";

/**
 * Engine Trace visibility — secret-code reveal (see the render gate near the
 * bottom of Page() and the keydown listener in Page()'s effects).
 *
 * The trace data is computed on EVERY scan and is always present in the report
 * object; this flag only controls whether the diagnostic SECTION is displayed.
 * It defaults to hidden for end users. Type TRACE_REVEAL_CODE anywhere on the
 * page (outside a text field) to toggle it on or off — the choice is remembered
 * in localStorage across reloads, and works on a report that's already on
 * screen as well as a fresh page.
 *
 * NOTE: this is obscurity, not a security boundary. The code ships in the
 * client bundle, so a determined user reading the JS could find it. That's an
 * acceptable bar here: the trace exposes no secrets, only the same evidence
 * already used to build that user's own report. Change the word freely.
 *
 * The trace surfaces per-phase visibility into engine reasoning:
 * P0 observations, Block 14 frame/upholstery split, P3 form +
 * style attribution, P4 weighted clues by category, dating overlap
 * per-layer evidence sources, P5 conflicts + resolutions, P2 frame
 * dating + upholstery layer, P1 gate. Used to verify that evidence
 * captured at Phase 0 is being routed correctly downstream.
 */
const TRACE_REVEAL_CODE = "xyzzy";
const TRACE_VISIBLE_KEY = "wk_trace_visible";
// Mobile reveal: tapping a hidden corner hotspot TRACE_TAP_COUNT times within
// TRACE_TAP_WINDOW_MS toggles the same trace. The window is generous enough to
// trigger comfortably by hand while still ignoring stray, spaced-out taps.
const TRACE_TAP_COUNT = 3;
const TRACE_TAP_WINDOW_MS = 1500;

// CORE_SLOTS key → PHOTO_EXAMPLES key. Slots without an entry render
// without a "View example" link. GROUP_SLOTS map by their `key` (not
// image_type) — currently only "construction" has an example.
const EXAMPLE_KEY_FOR_SLOT: Record<string, string> = {
  overall_front: "overall_front",
  overall_side: "overall_side",
  underside: "underside",
  construction: "construction",
};

// Viewport-aware sizing for the DatingOverlapViz mobile responsiveness.
// React inline styles don't support @media; this hook tracks window width
// and returns breakpoint flags consumers can switch on. Initial value is
// false/false so SSR renders the desktop layout; the effect adjusts after
// mount.
function useViewport() {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return {
    width,
    isMobile: width <= 640,
    isTablet: width > 640 && width <= 1024,
  };
}

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
  engine_version?: string;
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

// Block 11 P4-1: client-side image downscaling. Keeps request payloads small
// and reliable for Full Analysis. Modern phone photos are typically 2-4MB each;
// a 5-photo Full Analysis can blow request size limits. Downscale
// to max 1600px longer edge, JPEG quality 0.82 → typical ~300-600KB/photo.
// Skip re-encoding when image is already small (<1.5MB AND ≤1600px longer
// edge) — avoids unnecessary processing time + potential quality loss
// from re-encoding already-compressed JPEGs.
const MAX_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.82;
const SKIP_DOWNSCALE_BYTES = 1_500_000;

// media_types Anthropic's vision API accepts. Anything else MUST be re-encoded
// before it reaches the model, or the request 400s with invalid_request_error.
const ANTHROPIC_SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function isHeicFile(file: File): boolean {
  const type = (file.type || "").toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  // iOS often hands a HEIC to a file input with an EMPTY MIME type, so also
  // sniff the filename — otherwise it slips through as "not HEIC" and 400s.
  return /\.(heic|heif)$/i.test(file.name || "");
}

type DecodedImage = {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  close: () => void;
};

// Decode a blob to something drawable. Prefer createImageBitmap (faster and
// applies EXIF orientation); fall back to <img> where it's unavailable.
async function decodeToImage(blob: Blob): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(blob, { imageOrientation: "from-image" });
      return {
        width: bmp.width,
        height: bmp.height,
        draw: (ctx, w, h) => ctx.drawImage(bmp, 0, 0, w, h),
        close: () => bmp.close(),
      };
    } catch {
      // fall through to the <img> path below
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Image decode failed"));
      i.src = url;
    });
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
      close: () => {},
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Normalize any picked/captured photo into a downscaled JPEG so the request to
// Anthropic always carries a supported media_type. HEIC (the iPhone default) is
// decoded via heic2any first, because browsers outside Safari can't decode it
// natively — previously such a file was shipped AS-IS and rejected with a 400.
// Throws if the file genuinely can't be converted, so the caller can skip it
// instead of poisoning the whole request with an unsupported original.
async function downscaleImageFile(file: File): Promise<File> {
  const heic = isHeicFile(file);
  if (!file.type.startsWith("image/") && !heic) return file; // not an image — leave untouched

  // HEIC/HEIF → JPEG up front. Dynamic import keeps the ~1.4MB decoder out of the
  // initial bundle; it only loads the first time a HEIC is actually seen.
  let source: Blob = file;
  if (heic) {
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: JPEG_QUALITY });
    source = Array.isArray(converted) ? converted[0] : converted;
  }

  let decoded: DecodedImage | null = null;
  try {
    decoded = await decodeToImage(source);
    const longerEdge = Math.max(decoded.width, decoded.height);

    // Already a supported, small-enough image: pass through untouched.
    if (!heic && longerEdge <= MAX_IMAGE_EDGE && file.size <= SKIP_DOWNSCALE_BYTES && ANTHROPIC_SUPPORTED_TYPES.has(file.type)) {
      return file;
    }

    const scale = longerEdge > MAX_IMAGE_EDGE ? MAX_IMAGE_EDGE / longerEdge : 1;
    const targetWidth = Math.max(1, Math.round(decoded.width * scale));
    const targetHeight = Math.max(1, Math.round(decoded.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable in this browser");
    decoded.draw(ctx, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", JPEG_QUALITY);
    });
    if (!blob) throw new Error("Could not encode image to JPEG");

    const baseName = file.name.replace(/\.(heic|heif|png|webp|gif)$/i, ".jpg") || "photo.jpg";
    return new File([blob], baseName, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    decoded?.close();
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Block 11: downscale first to keep the upload payload small.
      const processed = await downscaleImageFile(file);
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(processed);
    } catch (e) {
      reject(e);
    }
  });
}

function bandColor(band?: string) {
  if (band === "High") return "#2f6f3e";
  if (band === "Moderate") return "#7a5a12";
  if (band === "Low") return "#7a4a12";
  return "#7a2626";
}

/** Format an ISO timestamp for the "Viewing saved scan from..." banner.
 *  Returns the original string if parsing fails — defensive against
 *  unexpected persisted_at values. */
function formatSavedScanTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const datePart = d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timePart = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${datePart} at ${timePart}`;
  } catch {
    return iso;
  }
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

function evidenceMeaning(text: string): string {
  const t = String(text || "").toLowerCase();

  if (t.includes("seating surface") || t.includes("bench")) {
    return "This confirms the piece was designed for sitting, which immediately narrows the form away from cabinets or tables.";
  }

  if (t.includes("writing surface") || t.includes("writing or work surface") || t.includes("writing/work surface")) {
    return "This indicates a dedicated writing or work surface, consistent with a desk, secretary, or writing table.";
  }

  // Match "raised surface" only — the bench-feature support is literally
  // "A secondary raised surface is visible beside the seating area." Matching
  // bare "secondary surface" false-fired on "secondary wood surfaces" /
  // "secondary surfaces received minimal finishing" (interior carcass wood on a
  // desk), wrongly annotating it as a bench feature.
  if (t.includes("raised surface")) {
    return "This indicates a secondary raised surface beside a seat, consistent with a writing bench or telephone bench.";
  }

  if (t.includes("spindle")) {
    return "Spindle construction spans many periods — Windsor and stick furniture through mid-century modern and later — so it helps define the form but does not by itself narrow the date.";
  }

  if (t.includes("turned")) {
    return "Turned elements indicate lathe-shaped components, a technique used continuously from the 18th century to the present; on its own it does not pin the date to a specific era.";
  }

  if (t.includes("paint") || t.includes("finish")) {
    return "Surface finish may indicate later refinishing and should be considered when judging originality.";
  }

  // ✅ DEFAULT: DO NOT OVERRIDE GOOD EVIDENCE
  return "";
}

function pickSupportingEvidence(report: ReportShape | null): string[] {
  const digest = report?.evidence_digest;
  const observations = Array.isArray(digest?.observations)
    ? digest.observations
    : [];

  if (!observations.length) {
    const p2 = report?.stage_outputs?.p2;
    const p3 = report?.stage_outputs?.p3;
    const p4 = report?.stage_outputs?.p4;
    const fallback: string[] = [];

    if (Array.isArray(p3?.support)) fallback.push(...p3.support);
    if (Array.isArray(p2?.support)) fallback.push(...p2.support);
    if (Array.isArray(p4?.confidence_drivers?.increased)) {
      fallback.push(...p4.confidence_drivers.increased);
    }

    return Array.from(
      new Set(fallback.map((item) => String(item || "").trim()).filter(Boolean))
    ).slice(0, 10);
  }

  const priority: Record<string, number> = {
  // 🔴 Highest authority (structure)
  construction: 1,
  joinery: 2,
  toolmarks: 3,
  fasteners: 4,

  // 🟠 Strong secondary
  materials: 5,
  material: 5,
  structure: 6,

  // 🟡 Moderate
  hardware: 7,
  function: 8,
  form: 9,

  // 🔵 Weak / easily altered
  finish: 10,
  alteration: 10,
  condition: 11,

  // ⚪ Lowest authority
  style: 12,
  context: 13,
};

  return Array.from(
    new Set(
      [...observations]
        .filter((o: any) => String(o?.description || "").trim())
        .sort((a: any, b: any) => {
          const pa = priority[String(a?.type || "context")] || 10;
          const pb = priority[String(b?.type || "context")] || 10;

          if (pa !== pb) return pa - pb;

          return Number(b?.confidence || 0) - Number(a?.confidence || 0);
        })
        .map((o: any) => String(o.description).trim())
    )
  ).slice(0, 10);
}

function SectionCard({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section style={{ background: "#fffdf9", border: "1px solid #ded3bf", borderRadius: 12, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      <h3 style={{ margin: "0 0 10px", fontSize: 18, color: "#3e2f1f" }}>{title}</h3>
      {children}
    </section>
  );
}

// Block 3b: Dating-overlap visualization per D-PH3-6 lock.
// 9 timeline rows (one per evidence layer: form / joinery / fastener / wood /
// finish / toolmark / style / style_wave / hardware), each with a colored band
// showing the layer's date envelope. Convergence zones rendered as overlaid
// vertical green highlights where ≥3 layers agree (Q5 framing: supporting
// evidence anchor, not authoritative).

type LayerBand = {
  layer: string;
  date_floor: number | null;
  date_ceiling: number | null;
  source_count: number;
  source_clues: string[];
  confidence: "high" | "moderate" | "low" | "none";
  present_without_dates?: number;
  undated_clues?: string[];
};

type ConvergenceZone = {
  date_floor: number;
  date_ceiling: number;
  layer_count: number;
  // Sum of LAYER_AUTHORITY weights for contributing layers.
  authority_sum: number;
  // Specificity-weighted analogues; the engine qualifies and ranks zones on
  // these, and the chart headlines specific_layer_count so broad/open-ended
  // containers don't overstate "N layers agree". Optional for back-compat with
  // any cached report shape.
  effective_layer_count?: number;
  weighted_authority?: number;
  specific_layer_count?: number;
  layers: string[];
};

type DatingOverlapData = {
  layers: LayerBand[];
  convergence_zones: ConvergenceZone[];
  overall_floor: number | null;
  overall_ceiling: number | null;
};

// Color per layer — distinct enough to read at row level without clashing
// when convergence highlight overlays.
const LAYER_COLORS: Record<string, string> = {
  form:       "#8b6f47",  // warm brown (form is the central call)
  joinery:    "#7a4a3a",  // dark red-brown
  fastener:   "#7a7a7a",  // steel gray
  toolmark:   "#9c7b4f",  // tan
  wood:       "#5d7a4a",  // green-brown (wood/material)
  hardware:   "#a87143",  // copper
  finish:     "#c9a76b",  // amber
  upholstery: "#a8645f",  // muted rose (Block 12 — upholstery is its own layer)
  style:      "#7d6b9c",  // muted lavender
  style_wave: "#6e8ba8",  // muted blue
};

const LAYER_LABELS: Record<string, string> = {
  form: "Form",
  joinery: "Joinery",
  fastener: "Fasteners",
  toolmark: "Toolmarks",
  wood: "Wood/Substrate",
  hardware: "Hardware",
  finish: "Finish",
  upholstery: "Upholstery",
  style: "Style attribution",
  style_wave: "Style wave",
};

// Per-wave color palette — sequential hues all in the muted style-family
// register so the Style row reads as a single "wave lineage" even with 3–4
// distinct blocks side by side. Original-period block uses a 5th, ghosted
// tone so the viewer's eye separates "lineage" from "production windows."
const WAVE_PALETTE = ["#6b8aa8", "#8b6f9c", "#7a9c6b", "#a8826b", "#a8617b"];
const ORIGINAL_PERIOD_COLOR = "#b4a5c2"; // light, ghosted lavender

// Partner Style row (transitional-pair second attribution) uses a warm-rust
// palette so the eye reads it as "second voice" not "duplicate of primary."
const PARTNER_WAVE_PALETTE = ["#a8714a", "#9c6b3a", "#8a5a3a", "#7a5a4a"];
const PARTNER_ORIGINAL_PERIOD_COLOR = "#cda58e";

// Transitional overlap highlight — slightly more saturated than the
// standard convergence-zone green so the eye treats it as a stronger
// "they agree" signal than a generic layer-overlap convergence.
const TRANSITIONAL_OVERLAP_FILL = "rgba(82, 142, 105, 0.28)";
const TRANSITIONAL_OVERLAP_BORDER = "rgba(46, 96, 60, 0.7)";

type StyleAttributionForViz = {
  name?: string;
  style_family_id?: string;
  date_floor: number | null;
  date_ceiling: number | null;
  confidence?: number;
} | null;

type StyleWaveForViz = {
  wave_id?: string;
  wave_name?: string;
  date_floor: number | null;
  date_ceiling: number | null;
  signals_matched?: string[];
  parent_style_id?: string;
};

type StyleIntersectionForViz = {
  kind: "family" | "wave";
  participants: string[];
  date_floor: number;
  date_ceiling: number;
  width: number;
  source_summary: string;
} | null;

// Confidence floor above which an alternative attribution earns its own
// Style row on the chart. Matches the engine-side QUALIFYING_ATTRIBUTION_
// CONFIDENCE so the chart shows what the engine reasoned about.
const ALTERNATIVE_ATTRIBUTION_FLOOR = 0.5;

// Pull just the quoted design-signal name out of a signals_matched string
// like:  Design signal "machine-age restraint" matched on machine
// Returns null when the string isn't a Layer 3 design-signal match.
function extractDesignDistinctive(signal: string): string | null {
  const m = signal.match(/^Design signal\s+"([^"]+)"/);
  return m ? m[1] : null;
}

type StyleBlock = {
  kind: "original" | "wave";
  label: string;
  date_floor: number | null;
  date_ceiling: number | null;
  color: string;
  distinctives: string[];
  wave_id?: string;
};

// Helper: render a Style row + a Design Distinctives row from a list of
// StyleBlocks at a given vertical offset. Used twice for transitional
// pieces (primary + partner) so both Style rows render with identical
// geometry and the transitional-overlap highlight can span them cleanly.
function renderStyleRowPair(
  blocks: StyleBlock[],
  rowTopOffset: number,
  ctx: {
    yearToPct: (y: number) => number;
    clampPct: (p: number) => number;
    axisMin: number;
    axisMax: number;
    rowHeight: number;
    keyPrefix: string;
  }
) {
  const styleRowTop = rowTopOffset;
  const distinctivesRowTop = rowTopOffset + ctx.rowHeight;
  return (
    <React.Fragment key={`${ctx.keyPrefix}-style-pair`}>
      {blocks.map((b, bi) => {
        const floor = b.date_floor ?? ctx.axisMin;
        const ceiling = b.date_ceiling ?? ctx.axisMax;
        const left = ctx.clampPct(ctx.yearToPct(floor));
        const right = ctx.clampPct(ctx.yearToPct(ceiling));
        const width = Math.max(0.5, right - left);
        const dateLabel =
          b.date_floor != null && b.date_ceiling != null
            ? `${b.date_floor}–${b.date_ceiling}`
            : b.date_floor != null
            ? `post-${b.date_floor}`
            : `pre-${b.date_ceiling}`;
        const isOriginal = b.kind === "original";
        return (
          <div key={`${ctx.keyPrefix}-style-block-${bi}`}>
            <div
              style={{
                position: "absolute",
                top: styleRowTop + 5,
                left: `${left}%`,
                width: `${width}%`,
                height: ctx.rowHeight - 10,
                background: isOriginal ? "transparent" : b.color,
                border: isOriginal ? `1px dashed ${b.color}` : "none",
                opacity: isOriginal ? 0.85 : 0.8,
                borderRadius: 4,
              }}
              title={
                isOriginal
                  ? `Original style period: ${dateLabel}. Shown for lineage; the piece is most likely from one of the revival waves to the right.`
                  : `${b.label}: ${dateLabel}${b.distinctives.length ? ` — distinctives: ${b.distinctives.join(", ")}` : ""}`
              }
            />
            {width >= 14 && (
              <div
                style={{
                  position: "absolute",
                  top: styleRowTop + 6,
                  left: `${left}%`,
                  width: `${width}%`,
                  height: ctx.rowHeight - 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: isOriginal ? b.color : "#fff",
                  fontWeight: 600,
                  textShadow: isOriginal ? "none" : "0 1px 1px rgba(0,0,0,0.2)",
                  pointerEvents: "none",
                }}
              >
                {dateLabel}
              </div>
            )}
          </div>
        );
      })}
      {blocks
        .filter((b) => b.kind === "wave" && b.distinctives.length > 0)
        .map((b, bi) => {
          const floor = b.date_floor ?? ctx.axisMin;
          const ceiling = b.date_ceiling ?? ctx.axisMax;
          const left = ctx.clampPct(ctx.yearToPct(floor));
          const right = ctx.clampPct(ctx.yearToPct(ceiling));
          const width = Math.max(0.5, right - left);
          const shown = b.distinctives.slice(0, 2);
          const more = b.distinctives.length - shown.length;
          const chipText = shown.join(" · ") + (more > 0 ? ` +${more}` : "");
          return (
            <div
              key={`${ctx.keyPrefix}-distinctive-${bi}`}
              style={{
                position: "absolute",
                top: distinctivesRowTop + 6,
                left: `${left}%`,
                width: `${width}%`,
                height: ctx.rowHeight - 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 6px",
                boxSizing: "border-box",
                pointerEvents: "auto",
              }}
              title={`Wave-distinguishing design subtleties for ${b.label}: ${b.distinctives.join(", ")}`}
            >
              <span
                style={{
                  display: "inline-block",
                  maxWidth: "100%",
                  padding: "2px 8px",
                  borderRadius: 10,
                  background: b.color,
                  opacity: 0.85,
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {chipText}
              </span>
            </div>
          );
        })}
    </React.Fragment>
  );
}

// Tone → visual palette for the dating-finding headline callout.
// Confident: cream-on-warm, dark text (default appraiser-voice).
// Qualified: same as confident, slightly muted (caveats acknowledged).
// Tentative: gray-on-muted (weak evidence; encourage caution).
// Caution: amber-on-warm (reproduction / impossible pair; clearly different).
const TONE_PALETTE: Record<DatingFindingNarrative["tone"], {
  bg: string;
  border: string;
  text: string;
  accent: string;
  label: string;
}> = {
  confident: { bg: "#f0ebd9", border: "#c9b990", text: "#3d2d1f", accent: "#7a5a3a", label: "What the evidence shows" },
  qualified: { bg: "#f3eedd", border: "#cdbe96", text: "#4a3a28", accent: "#8a7350", label: "What the evidence shows" },
  tentative: { bg: "#eee9dd", border: "#c4b89e", text: "#5c4a37", accent: "#8a785f", label: "Limited evidence" },
  caution:   { bg: "#f8e8d4", border: "#d8a96b", text: "#5a3a1a", accent: "#a26a2a", label: "Dating caution" },
};

function DatingFindingCallout({
  narrative,
  dateFloor,
  dateCeiling,
  identification,
  confidenceBand,
}: {
  narrative: DatingFindingNarrative;
  dateFloor?: number | null;
  dateCeiling?: number | null;
  identification?: string | null;
  confidenceBand?: string | null;
}) {
  const palette = TONE_PALETTE[narrative.tone];
  const dateAnswer =
    dateFloor != null && dateCeiling != null
      ? `c. ${dateFloor}–${dateCeiling}`
      : dateFloor != null
      ? `after ${dateFloor}`
      : dateCeiling != null
      ? `before ${dateCeiling}`
      : null;
  // The pill reports the engine's REAL dating confidence (the p2 band), not the
  // narrative tone — a Low/Inconclusive date must never read as "Confident".
  const confidenceWord =
    confidenceBand ||
    (narrative.tone === "confident"
      ? "Confident"
      : narrative.tone === "qualified"
      ? "Qualified"
      : narrative.tone === "tentative"
      ? "Tentative"
      : "Caution");
  const pillColor = confidenceBand ? bandColor(confidenceBand) : palette.accent;
  // Lead with the identification we're actually confident about; the numeric
  // date is demoted to a muted subline. When dating confidence is Low/
  // Inconclusive or the span is wide (≥80 yr), the date is flagged as a broad
  // estimate so it never reads as a precise headline answer.
  const spanWide =
    dateFloor != null && dateCeiling != null && dateCeiling - dateFloor >= 80;
  const dateUncertain =
    spanWide || confidenceBand === "Low" || confidenceBand === "Inconclusive";
  return (
    <div
      style={{
        marginBottom: 14,
        padding: "14px 16px",
        borderRadius: 10,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderLeft: `4px solid ${palette.accent}`,
        color: palette.text,
        lineHeight: 1.6,
        fontSize: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: dateAnswer ? 4 : 6,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            color: palette.accent,
          }}
        >
          {palette.label}
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: "#fff",
            background: pillColor,
            padding: "2px 8px",
            borderRadius: 999,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {confidenceWord}
        </span>
      </div>
      {identification ? (
        <>
          <div style={{ fontSize: 22, fontWeight: 800, color: palette.text, lineHeight: 1.25, marginBottom: dateAnswer ? 3 : 6 }}>
            {identification}
          </div>
          {dateAnswer && (
            <div style={{ fontSize: 13, color: palette.text, opacity: 0.75, marginBottom: 6 }}>
              Estimated production: {dateAnswer}
              {dateUncertain && " — broad estimate; underside, construction, or maker evidence would narrow it"}
            </div>
          )}
        </>
      ) : (
        dateAnswer && (
          <div style={{ fontSize: 24, fontWeight: 800, color: palette.text, lineHeight: 1.2, marginBottom: 6 }}>
            {dateAnswer}
          </div>
        )
      )}
      <div style={{ fontSize: 14, color: palette.text }}>{narrative.headline}</div>
      {narrative.detail && (
        <div style={{ marginTop: 8, fontSize: 13, color: palette.text, opacity: 0.85, lineHeight: 1.55 }}>
          {narrative.detail}
        </div>
      )}
    </div>
  );
}

// Ranked-evidence list — the redesigned lead dating visual. Each datable
// layer is a row (date range + strength bar), ranked by how tightly it pins
// the date; ✓ marks layers whose range agrees with the convergence window.
// Layers with no datable signal collapse into a footnote; Style is always
// shown but as low-weight context, pinned last. Replaces the timeline
// DatingOverlapViz (kept dormant below during redesign review).
const RANK_LAYER_AUTHORITY: Record<string, number> = {
  joinery: 9, fastener: 8, toolmark: 8, form: 7, construction: 6, hardware: 6,
  wood: 6, upholstery: 5, finish: 4, style: 3, style_wave: 2,
};
const RANK_LAYER_LABELS: Record<string, string> = {
  form: "Form", construction: "Construction", joinery: "Joinery", fastener: "Fasteners", toolmark: "Toolmarks",
  wood: "Wood", hardware: "Hardware", finish: "Finish", upholstery: "Upholstery",
};

// Collapsible disclosure used for the Date & Style detail dropdowns
// (regional/period context, "how it differs"). Native <details>, no JS.
function DetailDropdown({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} style={{ borderTop: "1px solid #eadfcf", marginTop: 8 }}>
      <summary style={{ cursor: "pointer", padding: "12px 0 10px", fontWeight: 600, fontSize: 15, color: "#3d2d1f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{title}</span>
      </summary>
      <div style={{ paddingBottom: 12, fontSize: 14, color: "#574634", lineHeight: 1.6 }}>{children}</div>
    </details>
  );
}

function EvidenceRankedList({
  data,
  styleAttribution,
  p2Floor,
  p2Ceiling,
}: {
  data: DatingOverlapData;
  styleAttribution?: StyleAttributionForViz;
  p2Floor?: number | null;
  p2Ceiling?: number | null;
}) {
  // Resolve the convergence window the rows are measured against: prefer the
  // engine's resolved working range, then the strongest convergence zone, then
  // the overall envelope. Mirrors the DatingFindingCallout above it.
  const zones = data.convergence_zones ?? [];
  const sIdx = pickStrongestZoneIndex(zones);
  const sZone = sIdx >= 0 ? zones[sIdx] : null;
  const winFloor = p2Floor ?? sZone?.date_floor ?? data.overall_floor ?? null;
  const winCeiling = p2Ceiling ?? sZone?.date_ceiling ?? data.overall_ceiling ?? null;
  const haveWindow = winFloor != null && winCeiling != null;

  type Row = {
    key: string; label: string; rangeText: string;
    strength: number; tag: string; agrees: boolean; isStyle: boolean;
  };

  const spanScore = (span: number) =>
    span <= 20 ? 1 : span <= 35 ? 0.82 : span <= 55 ? 0.6 : span <= 80 ? 0.4 : 0.25;
  const confScore = (c: string) =>
    c === "high" ? 1 : c === "moderate" ? 0.7 : c === "low" ? 0.4 : 0;
  // A layer's allowed range is [floor ?? -inf, ceiling ?? +inf]; it "agrees"
  // when that interval overlaps the convergence window with positive width.
  // A single touching endpoint (e.g. "before 1830" vs a window opening at
  // 1830) is treated as mild tension, not agreement, so it gets no checkmark.
  const overlaps = (f: number | null, c: number | null) => {
    if (!haveWindow) return true;
    return (f ?? -Infinity) < (winCeiling as number) && (c ?? Infinity) > (winFloor as number);
  };
  const rangeText = (f: number | null, c: number | null) =>
    f != null && c != null ? `${f}–${c}` : f != null ? `after ${f}` : c != null ? `before ${c}` : "";

  const datable: Row[] = [];
  const noSignal: string[] = [];

  for (const l of data.layers) {
    if (l.layer === "style" || l.layer === "style_wave") continue; // style handled below
    const label = RANK_LAYER_LABELS[l.layer] ?? l.layer;
    const hasFloor = l.date_floor != null;
    const hasCeiling = l.date_ceiling != null;
    // Datable if at least one bound is known; one-sided bounds ("after 1860",
    // "before 1830") are real signals, not absences.
    if ((!hasFloor && !hasCeiling) || l.confidence === "none") {
      if (l.source_count > 0 || (l.present_without_dates ?? 0) > 0) noSignal.push(label);
      continue;
    }
    const span = hasFloor && hasCeiling ? (l.date_ceiling as number) - (l.date_floor as number) : null;
    const auth = RANK_LAYER_AUTHORITY[l.layer] ?? 4;
    const strength = Math.round(
      (0.4 * (span == null ? 0.3 : spanScore(span)) + 0.35 * (auth / 9) + 0.25 * confScore(l.confidence)) * 100
    );
    datable.push({
      key: l.layer, label,
      rangeText: rangeText(l.date_floor, l.date_ceiling),
      strength,
      tag: span == null ? "open" : span <= 30 ? "strong" : span <= 55 ? "moderate" : "broad",
      agrees: overlaps(l.date_floor, l.date_ceiling), isStyle: false,
    });
  }
  datable.sort((a, b) => b.strength - a.strength);

  // Style row — always shown when present, as low-weight context, pinned last.
  let styleRow: Row | null = null;
  if (styleAttribution && (styleAttribution.date_floor != null || styleAttribution.date_ceiling != null)) {
    styleRow = {
      key: "style",
      label: styleAttribution.name ? `Style — ${styleAttribution.name}` : "Style",
      rangeText: rangeText(styleAttribution.date_floor, styleAttribution.date_ceiling),
      strength: 22, tag: "minor",
      agrees: overlaps(styleAttribution.date_floor, styleAttribution.date_ceiling),
      isStyle: true,
    };
  }

  const rows: Row[] = styleRow ? [...datable, styleRow] : datable;
  if (rows.length === 0 && noSignal.length === 0) return null;

  const agreeCount = datable.filter((r) => r.agrees).length;
  // T1c: winFloor (from p2) and winCeiling (from a fallback zone/envelope) can come
  // from mismatched sources and invert ("c. 1945–1910") or collapse ("c. 1910–1910").
  // Render the floor as the binding terminus instead of a backwards/degenerate span.
  const windowText = !haveWindow
    ? null
    : (winFloor as number) > (winCeiling as number)
    ? `post-${winFloor}`
    : (winFloor as number) === (winCeiling as number)
    ? `c. ${winFloor}`
    : `c. ${winFloor}–${winCeiling}`;

  const C = {
    ink: "#3d2d1f", muted: "#6a5845", faint: "#a89e90", line: "#eadfcf",
    good: "#3f7d4e", track: "#ece4d6", bar: "#b88a52", styleBar: "#bcae9a",
  };

  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 12 }}>
        {windowText && (
          <strong style={{ color: C.ink }}>
            {agreeCount} layer{agreeCount === 1 ? "" : "s"} point to {windowText}.{" "}
          </strong>
        )}
        {noSignal.length > 0 && (
          <>{noSignal.length} layer{noSignal.length === 1 ? "" : "s"} had no datable signal. </>
        )}
        {styleRow && <>Style shown as low-weight context.</>}
      </div>

      <div style={{ fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", color: C.faint, marginBottom: 6 }}>
        Evidence, ranked by how tightly it pins the date
      </div>

      <div>
        {rows.map((r, i) => (
          <div
            key={r.key}
            style={{
              display: "grid",
              gridTemplateColumns: "16px 1fr 124px",
              gap: 10,
              alignItems: "center",
              padding: "9px 0",
              borderTop: i === 0 ? "none" : `1px solid ${C.line}`,
              opacity: r.isStyle ? 0.72 : 1,
            }}
          >
            <div style={{ textAlign: "center", fontSize: 14, color: !r.isStyle && r.agrees ? C.good : C.faint }}>
              {!r.isStyle && r.agrees ? "✓" : "·"}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: C.ink, fontStyle: r.isStyle ? "italic" : "normal" }}>
                {r.label}
              </div>
              <div style={{ fontSize: 12, color: C.muted, fontVariantNumeric: "tabular-nums" }}>
                {r.rangeText}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 8, background: C.track, borderRadius: 5, overflow: "hidden" }}>
                <div
                  style={{
                    width: `${Math.max(12, Math.min(95, r.strength))}%`,
                    height: "100%",
                    background: r.isStyle ? C.styleBar : C.bar,
                    borderRadius: 5,
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: C.muted, minWidth: 48, textAlign: "right" }}>{r.tag}</div>
            </div>
          </div>
        ))}
      </div>

      {noSignal.length > 0 && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: "pointer", fontSize: 13, color: C.muted, padding: "8px 0 0", borderTop: `1px solid ${C.line}` }}>
            {noSignal.length} layer{noSignal.length === 1 ? "" : "s"} present, no datable signal
          </summary>
          <div style={{ fontSize: 13, color: C.muted, padding: "8px 0 2px", lineHeight: 1.7 }}>
            {noSignal.join(" · ")}
          </div>
        </details>
      )}
    </div>
  );
}

function DatingOverlapViz({
  data,
  styleAttribution,
  styleAlternatives,
  styleWaves,
  bestStyleIntersection,
  suppressedPartnerIds,
}: {
  data: DatingOverlapData;
  styleAttribution?: StyleAttributionForViz;
  styleAlternatives?: Array<NonNullable<StyleAttributionForViz>>;
  styleWaves?: StyleWaveForViz[];
  bestStyleIntersection?: StyleIntersectionForViz;
  suppressedPartnerIds?: string[];
}) {
  const waves = styleWaves ?? [];
  // Filter alternatives by qualifying confidence floor — only render an
  // alternative as its own Style row when the engine actually treated it
  // as a co-occurring attribution worth reasoning about. Then suppress
  // any alternative whose canonical compatibility with the winning
  // attribution is "stacked_revival" (the engine flags these in
  // p3.stacked_revival_partner_ids — those are expected umbrella
  // co-attributions, not transitional moments that earn a partner row).
  const suppressed = new Set(suppressedPartnerIds ?? []);
  const qualifiedAlternatives = (styleAlternatives ?? []).filter(
    (a) =>
      a &&
      typeof a.confidence === "number" &&
      a.confidence >= ALTERNATIVE_ATTRIBUTION_FLOOR &&
      !(a.style_family_id && suppressed.has(a.style_family_id))
  );
  // Cap at the single best transitional partner — beyond 2 Style rows the
  // chart gets unwieldy and the marginal alternative adds noise.
  const transitionalPartner = qualifiedAlternatives[0] ?? null;
  // Style row + Design Distinctives row are rendered separately at the top,
  // so drop the legacy aggregated `style` and `style_wave` rows from the
  // standard per-layer loop. Their dates still feed the axis-range
  // computation below so the chart frames them correctly.
  const dataLayers = data.layers.filter((l) => l.layer !== "style" && l.layer !== "style_wave");

  // Determine axis range from EVERYTHING that will render — non-style
  // layers + style attribution + every individual wave. Otherwise the
  // axis can clip the per-wave blocks at the right edge.
  const allFloors: number[] = [];
  const allCeilings: number[] = [];
  for (const l of dataLayers) {
    if (l.date_floor != null) allFloors.push(l.date_floor);
    if (l.date_ceiling != null) allCeilings.push(l.date_ceiling);
  }
  if (styleAttribution?.date_floor != null) allFloors.push(styleAttribution.date_floor);
  if (styleAttribution?.date_ceiling != null) allCeilings.push(styleAttribution.date_ceiling);
  if (transitionalPartner?.date_floor != null) allFloors.push(transitionalPartner.date_floor);
  if (transitionalPartner?.date_ceiling != null) allCeilings.push(transitionalPartner.date_ceiling);
  for (const w of waves) {
    if (w.date_floor != null) allFloors.push(w.date_floor);
    if (w.date_ceiling != null) allCeilings.push(w.date_ceiling);
  }
  if (bestStyleIntersection) {
    allFloors.push(bestStyleIntersection.date_floor);
    allCeilings.push(bestStyleIntersection.date_ceiling);
  }
  if (allFloors.length === 0 && allCeilings.length === 0) {
    return <div style={{ fontSize: 14, color: "#776654", fontStyle: "italic" }}>No date evidence to chart.</div>;
  }
  const dataMin = allFloors.length > 0 ? Math.min(...allFloors) : 1700;
  const dataMax = allCeilings.length > 0 ? Math.max(...allCeilings) : 2030;
  // Pad axis 30 years either side, clamp to project domain
  const axisMin = Math.max(1600, Math.floor((dataMin - 30) / 10) * 10);
  const axisMax = Math.min(2040, Math.ceil((dataMax + 30) / 10) * 10);
  const axisSpan = axisMax - axisMin;

  const yearToPct = (y: number) => ((y - axisMin) / axisSpan) * 100;
  const clampPct = (p: number) => Math.max(0, Math.min(100, p));

  const viewport = useViewport();

  // Tick marks — density adapts to viewport so labels don't overlap.
  // Desktop: every 50 years (or 20 for narrow spans). Mobile: every 100
  // years for wide spans to prevent "165017001750..." concatenation
  // visible on phone-width charts where each tick has ~30-40px of room.
  const tickStep = viewport.isMobile
    ? (axisSpan > 300 ? 100 : axisSpan > 150 ? 50 : 25)
    : (axisSpan > 200 ? 50 : 20);
  const ticks: number[] = [];
  for (let y = Math.ceil(axisMin / tickStep) * tickStep; y <= axisMax; y += tickStep) ticks.push(y);

  // ── Compose Style row blocks ────────────────────────────────────────
  // The Style row reads as a single lineage: original period (when the
  // attribution period doesn't already match a "wave 1 / Original X" wave)
  // on the left, each surfaced revival wave to the right in chronological
  // order. Each wave gets a distinct hue from WAVE_PALETTE so the viewer
  // can match a wave block to its Design Distinctives chips below.
  // (StyleBlock type defined at module scope for the renderStyleRowPair helper.)
  const styleBlocks: StyleBlock[] = [];
  // De-dupe: if a wave's date range substantially overlaps the attribution
  // period (i.e. it IS the "Original X" wave), don't render a separate
  // attribution block — the wave already covers it.
  const sortedWaves = [...waves].sort((a, b) => (a.date_floor ?? 9999) - (b.date_floor ?? 9999));
  const attrFloor = styleAttribution?.date_floor ?? null;
  const attrCeiling = styleAttribution?.date_ceiling ?? null;
  const attrCoveredByWave = sortedWaves.some((w) => {
    if (attrFloor == null || attrCeiling == null || w.date_floor == null || w.date_ceiling == null) return false;
    // "Substantially overlaps" = at least 75% of the attribution period is covered by the wave.
    const overlap = Math.max(0, Math.min(attrCeiling, w.date_ceiling) - Math.max(attrFloor, w.date_floor));
    const attrSpan = Math.max(1, attrCeiling - attrFloor);
    return overlap / attrSpan >= 0.75;
  });
  if (styleAttribution && (attrFloor != null || attrCeiling != null) && !attrCoveredByWave) {
    styleBlocks.push({
      kind: "original",
      label: "Original period",
      date_floor: attrFloor,
      date_ceiling: attrCeiling,
      color: ORIGINAL_PERIOD_COLOR,
      distinctives: [],
    });
  }
  // Partition waves by parent_style_id so the primary Style row shows only
  // the winner's waves; the partner Style row shows the partner's waves.
  // For pieces with no qualifying alternative, all waves go on the primary
  // row (current behavior preserved).
  const primaryParentId = styleAttribution?.style_family_id ?? null;
  const partnerParentId = transitionalPartner?.style_family_id ?? null;
  const primaryWaves = transitionalPartner
    ? sortedWaves.filter((w) => !partnerParentId || w.parent_style_id !== partnerParentId)
    : sortedWaves;
  const partnerWaves = transitionalPartner
    ? sortedWaves.filter((w) => w.parent_style_id === partnerParentId)
    : [];

  primaryWaves.forEach((w, idx) => {
    const distinctives = (w.signals_matched ?? [])
      .map(extractDesignDistinctive)
      .filter((s): s is string => Boolean(s));
    styleBlocks.push({
      kind: "wave",
      label: w.wave_name ?? w.wave_id ?? `Wave ${idx + 1}`,
      date_floor: w.date_floor,
      date_ceiling: w.date_ceiling,
      color: WAVE_PALETTE[idx % WAVE_PALETTE.length],
      distinctives,
      wave_id: w.wave_id,
    });
  });

  // Build partner-row style blocks (the second Style row for transitional
  // pieces). Uses a complementary palette so the partner reads as a
  // sibling story, not a duplicate of the primary row.
  const partnerStyleBlocks: StyleBlock[] = [];
  if (transitionalPartner) {
    const ptrFloor = transitionalPartner.date_floor ?? null;
    const ptrCeil = transitionalPartner.date_ceiling ?? null;
    const partnerCoveredByWave = partnerWaves.some((w) => {
      if (ptrFloor == null || ptrCeil == null || w.date_floor == null || w.date_ceiling == null) return false;
      const overlap = Math.max(0, Math.min(ptrCeil, w.date_ceiling) - Math.max(ptrFloor, w.date_floor));
      const span = Math.max(1, ptrCeil - ptrFloor);
      return overlap / span >= 0.75;
    });
    if ((ptrFloor != null || ptrCeil != null) && !partnerCoveredByWave) {
      partnerStyleBlocks.push({
        kind: "original",
        label: "Original period",
        date_floor: ptrFloor,
        date_ceiling: ptrCeil,
        color: PARTNER_ORIGINAL_PERIOD_COLOR,
        distinctives: [],
      });
    }
    partnerWaves.forEach((w, idx) => {
      const distinctives = (w.signals_matched ?? [])
        .map(extractDesignDistinctive)
        .filter((s): s is string => Boolean(s));
      partnerStyleBlocks.push({
        kind: "wave",
        label: w.wave_name ?? w.wave_id ?? `Partner wave ${idx + 1}`,
        date_floor: w.date_floor,
        date_ceiling: w.date_ceiling,
        color: PARTNER_WAVE_PALETTE[idx % PARTNER_WAVE_PALETTE.length],
        distinctives,
        wave_id: w.wave_id,
      });
    });
  }

  // ── Between-wave conditional callout ────────────────────────────────
  // Surfaces only when the strongest convergence zone (driven by non-style
  // construction/material evidence) falls in the gap between two surfaced
  // wave blocks. Wording approved by appraiser (May 2026 session).
  const waveBlocks = styleBlocks.filter((b) => b.kind === "wave");
  const strongestZone = data.convergence_zones[0] ?? null;
  let betweenWaveCallout: string | null = null;
  if (strongestZone && waveBlocks.length >= 2) {
    const zoneOverlapsAnyWave = waveBlocks.some(
      (w) =>
        w.date_floor != null &&
        w.date_ceiling != null &&
        strongestZone.date_ceiling >= w.date_floor &&
        strongestZone.date_floor <= w.date_ceiling
    );
    const waveBefore = waveBlocks.some(
      (w) => w.date_ceiling != null && strongestZone.date_floor > w.date_ceiling
    );
    const waveAfter = waveBlocks.some(
      (w) => w.date_floor != null && strongestZone.date_ceiling < w.date_floor
    );
    if (!zoneOverlapsAnyWave && waveBefore && waveAfter) {
      betweenWaveCallout =
        "Furniture styles never really go dormant. Between the major revival waves, smaller shops and regional makers keep producing at lower volume — and your piece's construction evidence lands in one of those quieter intervals rather than at a wave peak.";
    }
  }

  // ── Row order ───────────────────────────────────────────────────────
  // Top: Style (combined original + waves) + Design Distinctives.
  // Below: Form / Construction / Joinery / Fastener / Toolmark / Wood /
  //        Hardware / Finish / Upholstery (construction added per #18).
  const layerOrder = ["form", "construction", "joinery", "fastener", "toolmark", "wood", "hardware", "finish", "upholstery"];
  const layersOrdered = layerOrder
    .map((name) => dataLayers.find((l) => l.layer === name))
    .filter((l): l is LayerBand => Boolean(l));

  // Row height adapts to viewport so wrapped multi-line labels (mobile) get
  // enough vertical room without breaking chart-bar alignment. Bars are
  // positioned absolutely using ROW_HEIGHT × index, so both columns stay
  // in sync as long as every row uses the same height.
  const ROW_HEIGHT = viewport.isMobile ? 44 : 28;
  // Row-label column width adapts to viewport so the chart pane gets enough
  // pixels on phones. Mobile rows wrap to multiple lines but stay compact.
  const LABEL_WIDTH = viewport.isMobile ? 96 : viewport.isTablet ? 130 : 150;
  const LABEL_FONT = viewport.isMobile ? 11 : 13;
  const LABEL_SUB_FONT = viewport.isMobile ? 10 : 12;
  const PLOT_TOP_PADDING = 50; // tick labels + zone-summary chips (year ticks at top:2; zone chips at top:22-44; bands start at PLOT_TOP_PADDING-4=46)
  const ZONE_LABEL_TOP = 22; // top offset for convergence-zone chip labels
  const ZONE_LABEL_HEIGHT = 22;
  // Chip min/max widths shrink on mobile so they're less likely to overflow
  // the chart edges. Chip overflow is also clamped by the plot column's
  // overflow: hidden, but tighter widths look cleaner.
  const ZONE_CHIP_MIN_WIDTH = viewport.isMobile ? 90 : 120;
  const ZONE_CHIP_MAX_WIDTH = viewport.isMobile ? 160 : 240;

  // Measure the plot column's width so zone chips can be clamped to stay
  // within the visible chart area (chips otherwise overflow past the right
  // edge on narrow viewports when zones cluster near the axis extremes).
  const plotRef = useRef<HTMLDivElement | null>(null);
  const [plotWidth, setPlotWidth] = useState<number>(0);
  // Progressive-disclosure toggles: per-clue sourcing (replaces hover-only
  // tooltips so touch users can see it) and the chart explainer. Default closed.
  const [showSourcing, setShowSourcing] = useState(false);
  const [showHowToRead, setShowHowToRead] = useState(false);
  useEffect(() => {
    if (!plotRef.current) return;
    const el = plotRef.current;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setPlotWidth(w);
    });
    ro.observe(el);
    setPlotWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  // Top rows: Style (primary) + Design Distinctives + optional partner
  // Style + optional partner Design Distinctives. Each pair only renders
  // when its data is present.
  const hasPrimaryStyle = styleBlocks.length > 0;
  const hasPartnerStyle = partnerStyleBlocks.length > 0;
  const topRowCount = (hasPrimaryStyle ? 2 : 0) + (hasPartnerStyle ? 2 : 0);
  const PLOT_HEIGHT = (topRowCount + layersOrdered.length) * ROW_HEIGHT;
  const styleFamilyLabel = styleAttribution?.name ? `Style: ${styleAttribution.name}` : "Style";
  const partnerStyleLabel = transitionalPartner?.name ? `Style: ${transitionalPartner.name}` : "Style (partner)";

  // Identify the strongest convergence zone for "strongest" badge labeling.
  // Uses the shared picker (lib/engineDatingOverlap) so the chart chip and the
  // dating narrative always agree on which zone is strongest.
  const strongestZoneIdx = pickStrongestZoneIndex(data.convergence_zones);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {/* Header: axis info + overall envelope. On mobile, stack vertically
          and shorten the axis description so it doesn't wrap awkwardly. */}
      <div
        style={{
          display: "flex",
          flexDirection: viewport.isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: viewport.isMobile ? "flex-start" : "baseline",
          gap: viewport.isMobile ? 4 : 0,
          fontSize: viewport.isMobile ? 12 : 13,
          color: "#574634",
        }}
      >
        <span>
          {viewport.isMobile
            ? `Axis ${axisMin}–${axisMax}.`
            : styleBlocks.length > 0
              ? `Style lineage on top; construction and material evidence below. Axis ${axisMin}–${axisMax}.`
              : `Per-layer date envelopes (${axisMin}–${axisMax}). Each row shows one evidence layer's date range.`}
        </span>
        {data.overall_floor !== null && data.overall_ceiling !== null && (
          <span>
            Overall envelope: <strong>{data.overall_floor}–{data.overall_ceiling}</strong>
          </span>
        )}
      </div>

      {/* Chart canvas: labels on left, timeline on right */}
      <div style={{ display: "grid", gridTemplateColumns: `${LABEL_WIDTH}px 1fr`, alignItems: "stretch" }}>
        {/* Left labels column */}
        <div style={{ paddingTop: PLOT_TOP_PADDING }}>
          {hasPrimaryStyle && (
            <>
              <div
                style={{
                  height: ROW_HEIGHT,
                  display: "flex",
                  alignItems: "center",
                  fontSize: LABEL_FONT,
                  lineHeight: 1.2,
                  color: "#3e2f1f",
                  paddingRight: 8,
                  fontWeight: 700,
                  overflow: "hidden",
                }}
                title={
                  styleAttribution?.name
                    ? `We know the style is ${styleAttribution.name}; the blocks to the right show which wave or production window the piece most likely belongs to.`
                    : "Style lineage: original period (lighter block) and surfaced revival waves."
                }
              >
                {styleFamilyLabel}
              </div>
              <div
                style={{
                  height: ROW_HEIGHT,
                  display: "flex",
                  alignItems: "center",
                  fontSize: LABEL_SUB_FONT,
                  lineHeight: 1.2,
                  color: "#5c4a37",
                  paddingRight: 8,
                  fontWeight: 600,
                  fontStyle: "italic",
                  overflow: "hidden",
                }}
                title="Design subtleties — the small distinguishing details that point to one wave over another. Each chip is color-matched to the wave it supports above."
              >
                Design Distinctives
              </div>
            </>
          )}
          {hasPartnerStyle && (
            <>
              <div
                style={{
                  height: ROW_HEIGHT,
                  display: "flex",
                  alignItems: "center",
                  fontSize: LABEL_FONT,
                  lineHeight: 1.2,
                  color: "#3e2f1f",
                  paddingRight: 8,
                  fontWeight: 700,
                  overflow: "hidden",
                }}
                title={
                  transitionalPartner?.name
                    ? `${transitionalPartner.name} also fires above threshold — your piece carries both vocabularies. Where the two Style rows agree on the same period (highlighted band) is the transitional production window.`
                    : "Second style attribution; shown when a transitional piece carries two style vocabularies."
                }
              >
                {partnerStyleLabel}
              </div>
              <div
                style={{
                  height: ROW_HEIGHT,
                  display: "flex",
                  alignItems: "center",
                  fontSize: LABEL_SUB_FONT,
                  lineHeight: 1.2,
                  color: "#5c4a37",
                  paddingRight: 8,
                  fontWeight: 600,
                  fontStyle: "italic",
                  overflow: "hidden",
                }}
                title="Design subtleties supporting the partner attribution."
              >
                Design Distinctives
              </div>
            </>
          )}
          {layersOrdered.map((l) => (
            <div
              key={l.layer}
              style={{
                height: ROW_HEIGHT,
                display: "flex",
                alignItems: "center",
                fontSize: LABEL_FONT,
                lineHeight: 1.2,
                color: l.confidence === "none" ? "#aaa092" : "#3e2f1f",
                paddingRight: 8,
                fontWeight: 600,
              }}
              title={l.source_count > 0 ? `${l.source_count} contributing clue(s): ${l.source_clues.join(", ")}` : "no signal"}
            >
              {LAYER_LABELS[l.layer] ?? l.layer}
            </div>
          ))}
        </div>

        {/* Plot column */}
        <div
          ref={plotRef}
          style={{
            position: "relative",
            background: "#fdf9ef",
            borderLeft: "1px solid #ded3bf",
            borderRight: "1px solid #ded3bf",
            paddingTop: PLOT_TOP_PADDING,
            height: PLOT_HEIGHT + PLOT_TOP_PADDING,
            overflow: "hidden",
          }}
        >
          {/* Tick labels + gridlines */}
          {ticks.map((y) => (
            <div
              key={`tick-${y}`}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${yearToPct(y)}%`,
                width: 1,
                background: "#ebe0ca",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  left: -16,
                  fontSize: 11,
                  color: "#8a785f",
                  width: 32,
                  textAlign: "center",
                }}
              >
                {y}
              </div>
            </div>
          ))}

          {/* Convergence zones (rendered first so they sit BEHIND bands) */}
          {data.convergence_zones.map((z, i) => {
            const left = clampPct(yearToPct(z.date_floor));
            const right = clampPct(yearToPct(z.date_ceiling));
            const width = Math.max(0.5, right - left);
            const isStrongest = i === strongestZoneIdx;
            return (
              <div
                key={`zone-${i}`}
                title={`Convergence: ${z.specific_layer_count ?? z.layer_count} corroborating layer(s) on ${z.date_floor}–${z.date_ceiling} (${z.layers.join(", ")})`}
                style={{
                  position: "absolute",
                  top: PLOT_TOP_PADDING - 4,
                  bottom: 0,
                  left: `${left}%`,
                  width: `${width}%`,
                  background: isStrongest ? "rgba(123, 178, 121, 0.30)" : "rgba(123, 178, 121, 0.12)",
                  borderLeft: `1px dashed rgba(75, 134, 70, ${isStrongest ? 0.75 : 0.4})`,
                  borderRight: `1px dashed rgba(75, 134, 70, ${isStrongest ? 0.75 : 0.4})`,
                  pointerEvents: "none",
                }}
              />
            );
          })}

          {/* Zone summary chips — positioned above each green band so users
              can identify zone ranges without measuring against the axis.
              Chips are CENTERED on the zone midpoint with a minimum width
              of ~120px so narrow zones (e.g., 10-year ranges) get readable
              labels that may extend beyond the band edges. "strongest"
              badge marks the highest-authority zone. */}
          {data.convergence_zones.map((z, i) => {
            const leftPct = clampPct(yearToPct(z.date_floor));
            const rightPct = clampPct(yearToPct(z.date_ceiling));
            const rawCenterPct = (leftPct + rightPct) / 2;
            // Clamp chip center so the chip stays within the plot column.
            // Chip is rendered with translateX(-50%), so to keep the right
            // edge at <= 100% we need centerPct <= 100 - chipHalfWidth%; and
            // centerPct >= chipHalfWidth% for the left edge. Uses the
            // chip's MIN width as a conservative estimate (actual chip may
            // grow up to maxWidth, in which case it could overflow slightly,
            // but the plot column's overflow:hidden catches it visually).
            const chipHalfWidthPct = plotWidth > 0
              ? (ZONE_CHIP_MIN_WIDTH / 2 / plotWidth) * 100
              : 0;
            const centerPct = Math.max(
              chipHalfWidthPct,
              Math.min(100 - chipHalfWidthPct, rawCenterPct)
            );
            const isStrongest = i === strongestZoneIdx;
            const layerSummary = z.layers
              .map((l) => LAYER_LABELS[l] ?? l)
              .join(", ");
            const corrobCount = z.specific_layer_count ?? z.layer_count;
            return (
              <div
                key={`zone-label-${i}`}
                title={`Zone ${i + 1}: ${z.date_floor}–${z.date_ceiling} · ${corrobCount} corroborating layer${corrobCount !== 1 ? "s" : ""}${z.layer_count > corrobCount ? ` (${z.layer_count} total incl. broad/open-ended)` : ""}: ${layerSummary}${isStrongest ? " · STRONGEST convergence" : ""}`}
                style={{
                  position: "absolute",
                  top: ZONE_LABEL_TOP,
                  left: `${centerPct}%`,
                  transform: "translateX(-50%)",
                  height: ZONE_LABEL_HEIGHT,
                  minWidth: ZONE_CHIP_MIN_WIDTH,
                  maxWidth: ZONE_CHIP_MAX_WIDTH,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: viewport.isMobile ? 3 : 5,
                  padding: viewport.isMobile ? "0 5px" : "0 8px",
                  boxSizing: "border-box",
                  borderRadius: 4,
                  background: isStrongest ? "rgba(75, 134, 70, 0.9)" : "rgba(123, 178, 121, 0.6)",
                  border: isStrongest ? "1px solid rgba(40, 90, 38, 0.9)" : "1px solid rgba(75, 134, 70, 0.7)",
                  color: isStrongest ? "#fff" : "#1f3a1d",
                  fontSize: viewport.isMobile ? 10 : 11,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  pointerEvents: "auto",
                  zIndex: 2,
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {z.date_floor}–{z.date_ceiling} · {corrobCount}
                  {viewport.isMobile ? "L" : ` layer${corrobCount !== 1 ? "s" : ""}`}
                </span>
                {isStrongest && (
                  <span
                    style={{
                      fontSize: viewport.isMobile ? 8 : 9,
                      fontWeight: 700,
                      padding: viewport.isMobile ? "1px 3px" : "1px 5px",
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.3)",
                      color: "#fff",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    {viewport.isMobile ? "★" : "Strongest"}
                  </span>
                )}
              </div>
            );
          })}

          {/* Transitional overlap highlight — vertical band spanning both
              Style rows where the engine's best style intersection lives.
              Rendered FIRST so style blocks sit on top of it. */}
          {bestStyleIntersection && hasPartnerStyle && (() => {
            const left = clampPct(yearToPct(bestStyleIntersection.date_floor));
            const right = clampPct(yearToPct(bestStyleIntersection.date_ceiling));
            const width = Math.max(0.5, right - left);
            // Span: primary style row through partner Design Distinctives row.
            const topY = PLOT_TOP_PADDING - 2;
            const bottomRowEnd = PLOT_TOP_PADDING + (hasPrimaryStyle ? 2 : 0) * ROW_HEIGHT + 2 * ROW_HEIGHT;
            const height = bottomRowEnd - topY;
            return (
              <div
                title={`Transitional overlap — ${bestStyleIntersection.source_summary}. This is the date window in which both style vocabularies were in production.`}
                style={{
                  position: "absolute",
                  top: topY,
                  left: `${left}%`,
                  width: `${width}%`,
                  height,
                  background: TRANSITIONAL_OVERLAP_FILL,
                  border: `1.5px dashed ${TRANSITIONAL_OVERLAP_BORDER}`,
                  borderRadius: 3,
                  pointerEvents: "auto",
                }}
              />
            );
          })()}

          {/* Top rows: Style (primary) + Design Distinctives, plus optional
              partner Style + Design Distinctives rows for transitional pieces. */}
          {hasPrimaryStyle && renderStyleRowPair(
            styleBlocks,
            PLOT_TOP_PADDING,
            { yearToPct, clampPct, axisMin, axisMax, rowHeight: ROW_HEIGHT, keyPrefix: "primary" }
          )}
          {hasPartnerStyle && renderStyleRowPair(
            partnerStyleBlocks,
            PLOT_TOP_PADDING + (hasPrimaryStyle ? 2 : 0) * ROW_HEIGHT,
            { yearToPct, clampPct, axisMin, axisMax, rowHeight: ROW_HEIGHT, keyPrefix: "partner" }
          )}

          {/* Per-layer bands */}
          {layersOrdered.map((l, idx) => {
            const rowTop = PLOT_TOP_PADDING + (topRowCount + idx) * ROW_HEIGHT;
            if (l.confidence === "none" || (l.date_floor === null && l.date_ceiling === null)) {
              // Block 5: distinguish "evidence present, no parseable date" from
              // true "no signal" — surfaces P4-2 diagnostic state to user.
              const undatedCount = l.present_without_dates ?? 0;
              if (undatedCount > 0) {
                const undatedSamples = (l.undated_clues ?? []).slice(0, 3).map((c) => c.replace(/_/g, " ")).join(", ");
                return (
                  <div
                    key={`band-${l.layer}`}
                    style={{
                      position: "absolute",
                      top: rowTop + 5,
                      left: 4,
                      right: 4,
                      height: ROW_HEIGHT - 10,
                      borderRadius: 4,
                      border: "1px dashed #b8a572",
                      background: "rgba(184, 165, 114, 0.10)",
                      pointerEvents: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      color: "#6e5a36",
                      fontStyle: "italic",
                      padding: "0 8px",
                      boxSizing: "border-box",
                    }}
                    title={`${undatedCount} observation${undatedCount !== 1 ? "s" : ""} present, no parseable date: ${undatedSamples}${(l.undated_clues?.length ?? 0) > 3 ? "…" : ""}`}
                  >
                    {undatedCount} observation{undatedCount !== 1 ? "s" : ""} present, no parseable date
                  </div>
                );
              }
              return (
                <div
                  key={`band-${l.layer}`}
                  style={{
                    position: "absolute",
                    top: rowTop + ROW_HEIGHT / 2 - 1,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: "repeating-linear-gradient(90deg, #e6dcc8 0 4px, transparent 4px 8px)",
                    pointerEvents: "none",
                  }}
                  title="no signal"
                />
              );
            }
            // Clamp open-ended bounds to axis
            const floor = l.date_floor ?? axisMin;
            const ceiling = l.date_ceiling ?? axisMax;
            const left = clampPct(yearToPct(floor));
            const right = clampPct(yearToPct(ceiling));
            const width = Math.max(0.5, right - left);
            const color = LAYER_COLORS[l.layer] ?? "#7a5a3a";
            const opacity = l.confidence === "high" ? 0.85 : l.confidence === "moderate" ? 0.65 : 0.45;
            const dateLabel =
              l.date_floor != null && l.date_ceiling != null
                ? `${l.date_floor}–${l.date_ceiling}`
                : l.date_floor != null
                ? `post-${l.date_floor}`
                : `pre-${l.date_ceiling}`;
            return (
              <div key={`band-${l.layer}`}>
                <div
                  style={{
                    position: "absolute",
                    top: rowTop + 5,
                    left: `${left}%`,
                    width: `${width}%`,
                    height: ROW_HEIGHT - 10,
                    background: color,
                    opacity,
                    borderRadius: 4,
                  }}
                  title={`${LAYER_LABELS[l.layer] ?? l.layer}: ${dateLabel} (${l.confidence} confidence; ${l.source_count} clue${l.source_count !== 1 ? "s" : ""})`}
                />
                {/* Date label adjacent to the band, if there's room */}
                {width >= 12 && (
                  <div
                    style={{
                      position: "absolute",
                      top: rowTop + 6,
                      left: `${left}%`,
                      width: `${width}%`,
                      height: ROW_HEIGHT - 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      color: "#fff",
                      fontWeight: 600,
                      textShadow: "0 1px 1px rgba(0,0,0,0.2)",
                      pointerEvents: "none",
                    }}
                  >
                    {dateLabel}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* "How to read this" footer — static explainer of the chart's visual
          language. Helps casual users decode wide-vs-narrow bars, empty
          rows, the "no parseable date" state, the green convergence bands,
          and (when present) the transitional overlap highlight. */}
      <div
        style={{
          fontSize: 12,
          color: "#574634",
          lineHeight: 1.6,
          padding: "10px 12px",
          borderRadius: 8,
          background: "#f6efde",
          border: "1px solid #e3d3b3",
        }}
      >
        <button
          type="button"
          onClick={() => setShowHowToRead((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 8,
            background: "transparent",
            border: "none",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            font: "inherit",
            fontWeight: 700,
            color: "#3d2d1f",
            textAlign: "left",
          }}
          aria-expanded={showHowToRead}
        >
          <span>How to read this chart</span>
          <span style={{ fontSize: 11, color: "#8a785f" }}>{showHowToRead ? "Hide ▲" : "Show ▼"}</span>
        </button>
        {showHowToRead && (
        <div style={{ display: "grid", gap: 4, marginTop: 6 }}>
          <div>
            <strong>Each row</strong> shows the date envelope for one evidence layer (style, joinery, hardware, etc.).
            <strong> Wide bars</strong> mean the evidence supports a long span — usually because the technique or
            material was used continuously through the period.
            <strong> Narrow bars</strong> pinpoint specific eras and carry stronger dating weight.
          </div>
          {data.convergence_zones.length > 0 && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 12,
                  marginTop: 4,
                  background: "rgba(123, 178, 121, 0.4)",
                  border: "1px dashed rgba(75, 134, 70, 0.7)",
                  flexShrink: 0,
                }}
              />
              <div>
                <strong>Green vertical bands</strong> mark <strong>convergence zones</strong> where multiple layers
                agree on the same date range. These are the strongest dating signals. The chip-label above each band
                shows the zone&apos;s range and the count of <em>corroborating</em> layers — broad or open-ended layers
                that merely span (rather than pinpoint) the range are not counted. The darker green chip marked
                &ldquo;strongest&rdquo; identifies the highest-authority zone (most corroborating layers and/or
                highest-authority evidence). Currently
                showing {data.convergence_zones.length === 1 ? "1 convergence zone" : `${data.convergence_zones.length} convergence zones`}.
              </div>
            </div>
          )}
          {bestStyleIntersection && hasPartnerStyle && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 12,
                  marginTop: 4,
                  background: TRANSITIONAL_OVERLAP_FILL,
                  border: `1.5px dashed ${TRANSITIONAL_OVERLAP_BORDER}`,
                  flexShrink: 0,
                }}
              />
              <div>
                <strong>Orange-bordered band on the Style rows</strong> marks the
                <strong> transitional overlap</strong> — the date window in which both style vocabularies were
                in production simultaneously. Pieces in this window often combine elements from both styles.
              </div>
            </div>
          )}
          <div>
            <strong>Empty rows</strong> mean no observations were recorded for that layer.
            Rows marked &ldquo;<em>N observation(s) present, no parseable date</em>&rdquo; mean the engine found
            evidence (e.g., visible hardware or wood) but couldn&apos;t anchor the observation to a specific year window.
          </div>
        </div>
        )}
      </div>

      {/* Evidence sourcing (progressive disclosure) — replaces hover-only
          tooltips so touch users (field/booth) can see what backs each layer. */}
      <div style={{ borderRadius: 8, background: "#faf6ea", border: "1px solid #e3d3b3", overflow: "hidden" }}>
        <button
          type="button"
          onClick={() => setShowSourcing((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: 8,
            background: "transparent",
            border: "none",
            padding: "10px 12px",
            margin: 0,
            cursor: "pointer",
            font: "inherit",
            fontWeight: 700,
            fontSize: 13,
            color: "#3d2d1f",
            textAlign: "left",
          }}
          aria-expanded={showSourcing}
        >
          <span>Evidence sourcing — what backs each layer</span>
          <span style={{ fontSize: 11, color: "#8a785f", flexShrink: 0 }}>{showSourcing ? "Hide ▲" : "Show ▼"}</span>
        </button>
        {showSourcing && (
          <div style={{ padding: "0 12px 12px", display: "grid", gap: 8 }}>
            {layersOrdered
              .filter(
                (l) =>
                  (l.source_clues?.length ?? 0) > 0 ||
                  (l.undated_clues?.length ?? 0) > 0 ||
                  l.date_floor != null ||
                  l.date_ceiling != null
              )
              .map((l) => {
                const range =
                  l.date_floor != null && l.date_ceiling != null
                    ? `${l.date_floor}–${l.date_ceiling}`
                    : l.date_floor != null
                    ? `post-${l.date_floor}`
                    : l.date_ceiling != null
                    ? `pre-${l.date_ceiling}`
                    : "no parseable date";
                const clues = (l.source_clues ?? []).map((c) => c.replace(/_/g, " "));
                const undated = (l.undated_clues ?? []).map((c) => c.replace(/_/g, " "));
                return (
                  <div
                    key={`src-${l.layer}`}
                    style={{ border: "1px solid #ece0c6", borderRadius: 6, background: "#fffdf9", padding: "8px 10px" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#3d2d1f" }}>
                        {LAYER_LABELS[l.layer] ?? l.layer}
                      </span>
                      <span style={{ fontSize: 12, color: bandColor(l.confidence), whiteSpace: "nowrap" }}>
                        {range} · {l.confidence}
                      </span>
                    </div>
                    {clues.length > 0 && (
                      <div style={{ marginTop: 4, fontSize: 12, color: "#5c4a37", lineHeight: 1.5 }}>
                        {clues.join(", ")}
                      </div>
                    )}
                    {undated.length > 0 && (
                      <div style={{ marginTop: 4, fontSize: 12, color: "#776654", fontStyle: "italic", lineHeight: 1.5 }}>
                        Present but undated: {undated.join(", ")}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Conditional between-wave callout. Fires only when construction
          convergence sits in the gap between two surfaced revival waves. */}
      {betweenWaveCallout && (
        <div
          style={{
            marginTop: 4,
            padding: "10px 12px",
            borderRadius: 8,
            background: "#fbf4e3",
            border: "1px solid #e3d3b3",
            fontSize: 13,
            color: "#3d2d1f",
            lineHeight: 1.55,
          }}
        >
          {betweenWaveCallout}
        </div>
      )}
    </div>
  );
}

function UploadTooLargeNotice({ onAdjust, onSwitchToFull }: { onAdjust: () => void; onSwitchToFull: () => void }) {
  return (
    <div style={{ marginTop: 14, padding: 16, borderRadius: 12, background: "#fdf7ec", border: "1px solid #e3d3b3", color: "#3d2d1f" }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#352719" }}>Photos too large to scan together.</div>
      <div style={{ marginTop: 8, lineHeight: 1.6, color: "#594734" }}>
        Modern phones often produce files large enough to exceed what a single Field Scan can handle in one go. Two ways forward:
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700, color: "#4a3725" }}>Reduce photo count.</div>
        <div style={{ marginTop: 4, lineHeight: 1.6, color: "#594734" }}>
          Fewer high-detail photos almost always produce better results than many — the engine relies on construction detail more than photo count, so dropping one or two photos rarely hurts identification.
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700, color: "#4a3725" }}>Switch to Full Analysis.</div>
        <div style={{ marginTop: 4, lineHeight: 1.6, color: "#594734" }}>
          Designed for deeper looks where more photos are useful. Your photos and the details you've entered will carry over.
        </div>
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={onAdjust} style={uploadTanButton}>Adjust photos</button>
        <button type="button" onClick={onSwitchToFull} style={uploadBrownButton}>Switch to Full Analysis with these photos</button>
      </div>
    </div>
  );
}

/**
 * Friendly user-facing labels for each engine phase. Wired into
 * RunButton via the currentPhase state. Replaces the generic
 * "Analyzing..." spinner so the 35-60s wait feels purposeful and
 * communicates the depth of work happening behind the scenes.
 *
 * Phase keys come from the engine's onPhase callbacks in runAllPhases
 * (lib/engine.ts). Unknown phase keys fall back to "Working..." so
 * the UI doesn't break if the engine adds a new phase before the
 * label table is updated.
 */
const PHASE_LABELS: Record<string, string> = {
  starting: "Preparing your photos...",
  p0: "Reading photos and extracting evidence...",
  p0_recovery: "Running deep extraction recovery...",
  p1: "Checking evidence quality...",
  p2: "Building dating envelope...",
  p3: "Identifying form and style...",
  p4: "Cross-checking signals...",
  p5: "Flagging conflicts and cautions...",
  p6: "Generating valuation and summary...",
  p7: "Compiling negotiation and selling tips...",
};

function getPhaseStatusText(phase: string | null): string {
  if (!phase) return "Analyzing...";
  return PHASE_LABELS[phase] || "Working...";
}

function RunButton({ label, disabled, isRunning, onClick, currentPhase }: { label: string; disabled: boolean; isRunning: boolean; onClick: () => void; currentPhase?: string | null }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 13, color: "#6b5c4f", marginBottom: 6 }}>Add more detail for a tighter result, or run it now.</div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{ ...primaryButton, opacity: disabled || isRunning ? 0.7 : 1, cursor: disabled || isRunning ? "not-allowed" : "pointer" }}
      >
        {isRunning ? getPhaseStatusText(currentPhase ?? null) : label}
      </button>
    </div>
  );
}
function TipsList({ items }: { items?: string[] }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <div style={emptyText}>No tips were returned.</div>;
  }

  return (
    <ul style={listStyle}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

type ValuationShape = {
  display?: string;
  insufficient_evidence?: boolean;
  note?: string;
  sellability_score?: number;
  sellability_factors?: Array<{ label: string; delta: number; category: string }>;
  sellability_clamped_note?: string | null;
  age_factor?: number;
  market_factor?: number;
  platform_breakdown?: Record<
    "dealer_buy" | "quick_sale" | "marketplace" | "as_found_retail" | "restored_retail",
    { label: string; range: string; note: string }
  >;
};

/**
 * AppraiserReviewCTA — conditional call-to-action shown in the report
 * when one or more triggers fire indicating that the piece may benefit
 * from hands-on professional review beyond what automated photo
 * analysis can resolve. Triggers are computed by appraiserReviewTriggers
 * useMemo inside Page() and passed in.
 *
 * Trust-preserving framing: opens with "may merit" not "needs"; names
 * specific WHY from the triggers; lists what hands-on review adds that
 * photos can't capture (weight, joint integrity under stress, surface
 * smell, period-correct restoration scope); positions Michael / NCW as
 * the natural extension — not the paid tier of the app.
 *
 * Navy left-border (vs gold on the Field→Full upsell) visually
 * distinguishes the two upsell types without breaking brand palette.
 */
function AppraiserReviewCTA({ triggers }: { triggers: { reason: string }[] }) {
  if (!triggers || triggers.length === 0) return null;
  const reasonText = triggers.map((t) => t.reason).join(" ");
  return (
    <SectionCard title="">
      <div
        style={{
          background: "#fff",
          border: "1px solid #d9ccb5",
          borderLeft: "3px solid #1a2e4e",
          borderRadius: 8,
          padding: "16px 18px",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: "#352719",
            fontSize: 16,
            marginBottom: 8,
          }}
        >
          This piece may merit in-person review.
        </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            color: "#594734",
            marginBottom: 14,
          }}
        >
          {reasonText} A hands-on assessment can confirm details that photos
          can&apos;t capture: weight, joint integrity under stress, surface smell
          as a finish and age indicator, period-correct restoration scope,
          and the tactile feel of the piece. New Creations Woodcraft offers
          this service directly with Michael.
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            fontSize: 14,
          }}
        >
          <a
            href="mailto:michael@newcreationswoodcraft.com"
            style={{
              color: "#1a2e4e",
              textDecoration: "none",
              fontWeight: 600,
              borderBottom: "1px solid #b9956a",
              paddingBottom: 1,
            }}
          >
            michael@newcreationswoodcraft.com
          </a>
          <span style={{ color: "#d9ccb5" }}>·</span>
          <a
            href="https://newcreationswoodcraft.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#1a2e4e",
              textDecoration: "none",
              fontWeight: 600,
              borderBottom: "1px solid #b9956a",
              paddingBottom: 1,
            }}
          >
            newcreationswoodcraft.com →
          </a>
        </div>
      </div>
    </SectionCard>
  );
}

function ResaleValuationSection({ valuation, formLabel }: { valuation?: ValuationShape; formLabel?: string }) {
  const { isMobile } = useViewport();
  if (valuation?.insufficient_evidence) {
    return (
      <div style={emptyText}>
        {valuation.note || "Not enough evidence to estimate value. Re-shoot with clearer, well-lit photos for a valuation."}
      </div>
    );
  }
  if (!valuation || !valuation.platform_breakdown) {
    return <div style={emptyText}>No resale valuation was returned.</div>;
  }

  const breakdown = valuation.platform_breakdown;
  const laneOrder: Array<keyof typeof breakdown> = ["dealer_buy", "quick_sale", "marketplace", "as_found_retail", "restored_retail"];
  // Sellability score is intentionally NOT surfaced in the UI — a 0-100 number
  // reads as false-precision gamification. It still drives the market_factor
  // multiplier internally; the factor breakdown below explains what helps/hurts.
  const factors = Array.isArray(valuation.sellability_factors) ? valuation.sellability_factors : [];
  const positiveFactors = factors.filter((f) => f.delta > 0);
  const negativeFactors = factors.filter((f) => f.delta < 0);

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#6a5845", letterSpacing: 0.3, textTransform: "uppercase" }}>Standard marketplace</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#3d2d1f", lineHeight: 1.2 }}>{breakdown.marketplace.range}</div>
      </div>

      <div style={{ border: "1px solid #e5d8c2", borderRadius: 10, overflow: "hidden", background: "#fffefb" }}>
        {laneOrder.map((key, idx) => {
          const lane = breakdown[key];
          const isHeadline = key === "marketplace";
          // Mobile (<= 640px): stack as "label | range" on top row with the note
          // wrapping below at full width — the desktop 3-column layout squeezed the
          // note column to near-zero on phones (the first two cols locked in ~250px+).
          return (
            <div
              key={key}
              style={
                isMobile
                  ? {
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gridTemplateAreas: '"label range" "note note"',
                      columnGap: 12,
                      rowGap: 4,
                      padding: "10px 14px",
                      borderTop: idx === 0 ? "none" : "1px solid #efe4d0",
                      background: isHeadline ? "#fbf3e3" : "transparent",
                      alignItems: "baseline",
                    }
                  : {
                      display: "grid",
                      gridTemplateColumns: "minmax(140px, 1fr) minmax(110px, 140px) minmax(0, 2fr)",
                      gap: 12,
                      padding: "10px 14px",
                      borderTop: idx === 0 ? "none" : "1px solid #efe4d0",
                      background: isHeadline ? "#fbf3e3" : "transparent",
                      alignItems: "baseline",
                    }
              }
            >
              <div style={{ gridArea: isMobile ? "label" : undefined, fontSize: 13, fontWeight: isHeadline ? 700 : 600, color: "#3d2d1f" }}>{lane.label}</div>
              <div style={{ gridArea: isMobile ? "range" : undefined, fontSize: 14, fontWeight: 700, color: "#3d2d1f", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{lane.range}</div>
              <div style={{ gridArea: isMobile ? "note" : undefined, fontSize: 12.5, color: "#5c4a37", lineHeight: 1.5 }}>{lane.note}</div>
            </div>
          );
        })}
      </div>

      <details style={{ marginTop: 14, fontSize: 13, color: "#574634" }}>
        <summary style={{ cursor: "pointer", fontWeight: 600, color: "#5a3e1b", padding: "6px 0" }}>
          How this was estimated
        </summary>
        <div style={{ marginTop: 8, padding: "10px 14px", background: "#fbf6ec", border: "1px solid #e5d8c2", borderRadius: 8, lineHeight: 1.6 }}>
          <p style={{ margin: "0 0 10px" }}>
            These ranges are <strong>heuristic estimates</strong>, not based on comparable sales. They are computed from form type, date range, and visible construction / condition signals — not from auction records or marketplace listings.
          </p>
          <p style={{ margin: "0 0 10px" }}>
            Formula: a base price band for{formLabel ? <> a <em>{formLabel.toLowerCase()}</em></> : " the form bucket"} is multiplied by an age factor
            {typeof valuation.age_factor === "number" ? <> (<strong>{valuation.age_factor.toFixed(2)}×</strong>)</> : null} and a market factor
            {typeof valuation.market_factor === "number" ? <> (<strong>{valuation.market_factor.toFixed(2)}×</strong>)</> : null} derived from condition and desirability signals. Lane ratios then split the result into Dealer Buy through Restored Retail.
          </p>
          {(positiveFactors.length > 0 || negativeFactors.length > 0) && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontWeight: 700, color: "#3d2d1f", marginBottom: 6 }}>What&rsquo;s helping or hurting value on this piece:</div>
              {positiveFactors.length > 0 && (
                <ul style={{ margin: "4px 0 8px", paddingLeft: 18 }}>
                  {positiveFactors.map((f, i) => (
                    <li key={`p${i}`} style={{ color: "#3a7d44" }}>
                      <strong style={{ fontVariantNumeric: "tabular-nums" }}>+{f.delta}</strong> <span style={{ color: "#3d2d1f" }}>{f.label}</span>
                    </li>
                  ))}
                </ul>
              )}
              {negativeFactors.length > 0 && (
                <ul style={{ margin: "4px 0 8px", paddingLeft: 18 }}>
                  {negativeFactors.map((f, i) => (
                    <li key={`n${i}`} style={{ color: "#a04a2e" }}>
                      <strong style={{ fontVariantNumeric: "tabular-nums" }}>{f.delta}</strong> <span style={{ color: "#3d2d1f" }}>{f.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#6a5845", fontStyle: "italic" }}>
            Treat these as orientation, not appraisal. Real market comparables for the specific piece should override these estimates when available.
          </p>
        </div>
      </details>
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
  const [uploadTooLarge, setUploadTooLarge] = useState(false);

  // Phase progress state — populated by the onPhase callback wired into
  // API.analyzeCase. Replaces the generic "Analyzing..." spinner with
  // phase-specific status so the 35-60s wait feels purposeful and
  // signals the depth of work happening behind the scenes. Set to null
  // before/after a run; set to a phase key while a run is in progress.
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);

  // Photo-example modal state. When set to a PHOTO_EXAMPLES key, the
  // ExampleModal renders with the matching illustration + checklist.
  // Wired into "View example" links rendered next to photo slots.
  const [openExampleKey, setOpenExampleKey] = useState<string | null>(null);

  // First-visit landing screen. null = pre-hydration / unknown; true = show
  // landing; false = user has dismissed previously. Layout still renders
  // logo header during the pre-hydration moment so the page never looks
  // broken. Once known, landing shows on first visit and is dismissed when
  // the user picks a mode (persisted to localStorage).
  const [showLanding, setShowLanding] = useState<boolean | null>(null);
  const [traceVisible, setTraceVisible] = useState(false);
  const { isMobile } = useViewport();

  // Flip the trace and persist the choice. Shared by the desktop secret-code
  // keydown handler and the mobile corner-tap gesture.
  const toggleTrace = useCallback(() => {
    setTraceVisible((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(TRACE_VISIBLE_KEY, next ? "true" : "false");
      } catch {
        // ignore persistence failure
      }
      return next;
    });
  }, []);

  // Mobile gesture: count rapid taps on the hidden corner hotspot. Timestamps
  // live in a ref so taps don't trigger re-renders; only those inside the
  // rolling window count toward the threshold.
  const traceTapTimes = useRef<number[]>([]);
  const onTraceHotspotTap = useCallback(() => {
    const now = Date.now();
    const recent = traceTapTimes.current.filter((t) => now - t < TRACE_TAP_WINDOW_MS);
    recent.push(now);
    if (recent.length >= TRACE_TAP_COUNT) {
      traceTapTimes.current = [];
      toggleTrace();
    } else {
      traceTapTimes.current = recent;
    }
  }, [toggleTrace]);

  // Picker Profile wizard state. The wizard (app/PickerProfileSetup.tsx) is a
  // controlled component: the parent owns the in-progress draft and step.
  const [showPickerProfile, setShowPickerProfile] = useState(false);
  const [pickerDraft, setPickerDraft] = useState<any>({});
  const [pickerStep, setPickerStep] = useState(0);

  // Comparison-basket count, kept in sync for the header indicator.
  const [compareCount, setCompareCount] = useState(0);
  const [compareNote, setCompareNote] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const dismissed = window.localStorage.getItem(LANDING_DISMISSED_KEY) === "true";
      setShowLanding(!dismissed);
    } catch {
      // localStorage unavailable (private mode, etc.) — default to showing
      setShowLanding(true);
    }
  }, []);

  // Hydrate the saved Picker Profile into intake on mount so the field-scan
  // scorer picks it up; keep the comparison-basket count in sync.
  useEffect(() => {
    const saved = getProfile();
    if (saved) setIntake((prev) => ({ ...prev, picker_profile: saved }));
    const syncCount = () => setCompareCount(getBasket().length);
    syncCount();
    window.addEventListener(COMPARE_BASKET_EVENT, syncCount);
    return () => window.removeEventListener(COMPARE_BASKET_EVENT, syncCount);
  }, []);

  const handleSaveProfile = (profile: any) => {
    saveProfile(profile);
    setIntake((prev) => ({ ...prev, picker_profile: profile }));
    setShowPickerProfile(false);
  };

  const handleSkipProfile = () => {
    markPrompted();
    setShowPickerProfile(false);
  };

  const openPickerProfile = () => {
    setPickerDraft(intake.picker_profile || {});
    setPickerStep(0);
    setShowPickerProfile(true);
  };

  const handleAddToCompare = () => {
    const cid = report?.id || activeCaseId;
    if (!cid) return;
    const res = addToBasket(cid);
    setCompareNote(
      res === "full"
        ? `Comparison holds up to ${COMPARE_BASKET_MAX} scans — remove one first.`
        : ""
    );
  };

  // Secret-code reveal for the Engine Trace. Display-only: the trace data is
  // always computed and present in `report`; this just toggles the section.
  // Restores the last choice from localStorage, then listens for the code typed
  // anywhere outside a text field. Typing it again toggles back off.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(TRACE_VISIBLE_KEY) === "true") setTraceVisible(true);
    } catch {
      // localStorage unavailable — trace stays hidden
    }
    let buffer = "";
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't capture keystrokes while the user is typing into a form field.
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;
      if (e.key.length !== 1) return; // ignore modifiers, arrows, Enter, etc.
      buffer = (buffer + e.key.toLowerCase()).slice(-TRACE_REVEAL_CODE.length);
      if (buffer === TRACE_REVEAL_CODE) {
        buffer = "";
        toggleTrace();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleTrace]);

  const dismissLandingWithMode = (mode: "full_analysis" | "field_scan") => {
    setIntake((prev) => ({ ...prev, analysis_mode: mode }));
    setShowLanding(false);
    try {
      window.localStorage.setItem(LANDING_DISMISSED_KEY, "true");
    } catch {
      // ignore
    }
    // First-run: offer the Picker Profile the first time someone enters Field
    // Scan, since it personalizes the buy score. Only prompt once.
    if (mode === "field_scan" && !getProfile() && !hasBeenPrompted()) {
      setPickerDraft({});
      setPickerStep(0);
      setShowPickerProfile(true);
    }
  };

  const returnToLanding = () => {
    setShowLanding(true);
    // Return-to-landing also exits historical-scan view if active.
    setViewingSavedScanId(null);
    setViewingSavedScanTimestamp(null);
    try {
      window.localStorage.removeItem(LANDING_DISMISSED_KEY);
    } catch {
      // ignore
    }
  };

  /**
   * Stage 3 of persistence rollout — view a saved scan via URL query
   * param. When the page loads with ?view=case-XXXX:
   *   1. Look up the case in IndexedDB via API.loadSavedCase()
   *      (which also hydrates the in-memory caseStore so subsequent
   *      getReport/getObservations calls work as if the case was
   *      created in this session)
   *   2. Set the report state to the loaded case
   *   3. Hide the landing screen
   *   4. Strip the ?view= param from the URL via history.replaceState
   *      so a page refresh doesn't re-trigger the load (and the URL
   *      stays clean)
   *
   * State: viewingSavedScanId is non-null only while a historical scan
   * is being displayed. Used by the "Viewing saved scan from {date}"
   * banner above the report. Reset to null when the user starts a new
   * scan or navigates back to the landing.
   */
  const [viewingSavedScanId, setViewingSavedScanId] = useState<string | null>(null);
  const [viewingSavedScanTimestamp, setViewingSavedScanTimestamp] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("view");
    if (!viewId) return;

    let cancelled = false;
    (async () => {
      try {
        const loaded = await API.loadSavedCase(viewId);
        if (cancelled || !loaded) return;
        setReport(API.getReport(viewId));
        setShowLanding(false);
        setViewingSavedScanId(viewId);
        setViewingSavedScanTimestamp(loaded?.persisted_at || null);
        // Strip ?view= from URL so a refresh doesn't re-trigger
        const url = new URL(window.location.href);
        url.searchParams.delete("view");
        window.history.replaceState({}, "", url.toString());
        // Scroll to top so user lands at the report header, not mid-form
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (e) {
        if (cancelled) return;
        console.warn("[page] Failed to load saved scan", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Inconclusive scan detection: when the engine's deep-extraction
   * recovery also fails (Phase 0 returned nothing and the recovery pass
   * couldn't extract anything either), the engine emits a fallback_form
   * clue as a last-resort placeholder. The presence of that clue marks
   * the scan as inconclusive — the report didn't produce confident
   * results. Future subscription/quota system should read this signal
   * (or report.observations directly) to avoid counting failed scans
   * against user limits.
   */
  const isInconclusiveScan = useMemo(() => {
    if (!report?.observations) return false;
    return report.observations.some(
      (o: any) => o?.clue === "fallback_form"
    );
  }, [report]);

  // When an inconclusive scan was caused by a SERVICE failure (the API call
  // errored or returned unparseable output) rather than a genuine empty read,
  // the message must say so — blaming the user's photos for an infrastructure
  // error is wrong. recovery_metadata carries this signal from the engine.
  const scanServiceFailure = useMemo(
    () => Boolean(report?.stage_outputs?.p0?.recovery_metadata?.service_failure),
    [report]
  );
  const scanServiceFailureDetail = useMemo(() => {
    const e = report?.stage_outputs?.p0?.recovery_metadata?.recovery_error;
    if (!e) return null;
    if (typeof e === "string") return e;
    const status = e.status ? `HTTP ${e.status}` : null;
    const t = e.api_error_type || e.type || null;
    // Include the API's actual error message — without it a 400 is unactionable
    // guesswork (media_type vs size vs base64 vs request shape).
    const msg = typeof e.message === "string" && e.message.trim() ? e.message.trim() : null;
    return [status, t, msg].filter(Boolean).join(" · ") || null;
  }, [report]);

  const analysisMode = intake.analysis_mode;

  /**
   * Conditional appraiser-review CTA triggers. The CTA fires when the
   * report surfaces evidence patterns that legitimately exceed what
   * automated photo analysis can resolve — pieces that would benefit
   * from hands-on inspection by Michael at New Creations Woodcraft.
   *
   * Three triggers, each independently defensible:
   *   1. Engine flagged conflict_notes — multiple dating signals disagree
   *   2. Value threshold ($1,500+) — economic justification for in-person
   *   3. User-flagged complexity — known_alterations or condition_notes
   *      contains substantive content (>20 chars)
   *
   * Multiple firing → reasons concat. None firing → CTA doesn't render.
   * This protects user trust: the CTA only appears when there's a real
   * reason the engine isn't enough.
   *
   * Computed inside the Page component because it needs access to the
   * phase stage_outputs (p5, p6) and the fieldValue useMemo. Stage
   * outputs are read inside the render later; we destructure here so
   * the trigger logic is testable in isolation if extracted.
   */
  const appraiserReviewTriggers = useMemo(() => {
    if (!report) return [] as { reason: string }[];

    const triggers: { reason: string }[] = [];
    const stageOutputs = report.stage_outputs || {};
    const p5 = stageOutputs.p5 || null;
    const p6 = stageOutputs.p6 || null;

    // Trigger 1: engine-flagged conflicts
    const conflictNotes = p5?.conflict_notes;
    if (Array.isArray(conflictNotes) && conflictNotes.length > 0) {
      triggers.push({
        reason:
          "The engine flagged multiple dating or attribution signals in your photos that disagree, which often requires hands-on inspection to resolve.",
      });
    }

    // Trigger 2: value threshold ($1,500+)
    let highValueDetected = false;
    let highValueSource = "";
    if (analysisMode === "field_scan") {
      // fieldValue is computed via fieldValueBand earlier in the render;
      // recompute here from the same inputs to avoid temporal-dependency
      // on render order. fieldValueBand returns { low, high } numbers.
      const p1 = stageOutputs.p1 || null;
      const p2 = stageOutputs.p2 || null;
      const p3 = stageOutputs.p3 || null;
      const conflictCount = Array.isArray(p5?.conflict_notes) ? p5.conflict_notes.length : 0;
      const fv = fieldValueBand(
        p3?.display_form || p3?.form || "Unknown",
        p2?.range || "Unknown",
        conflictCount,
        p1?.confidence_cap
      );
      if (fv && typeof fv.high === "number" && fv.high >= 1500) {
        highValueDetected = true;
        highValueSource = "field-scan value range";
      }
    } else if (analysisMode === "full_analysis") {
      // Parse the restored_retail range string ("$X – $Y") and check upper bound
      const restoredRetail =
        p6?.valuation?.platform_breakdown?.restored_retail?.range;
      if (typeof restoredRetail === "string") {
        const match = restoredRetail.match(/\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/);
        if (match) {
          const upper = parseInt(match[2].replace(/,/g, ""), 10);
          if (!isNaN(upper) && upper >= 1500) {
            highValueDetected = true;
            highValueSource = "restored-retail valuation";
          }
        }
      }
    }
    if (highValueDetected) {
      triggers.push({
        reason: `The estimated value range (per ${highValueSource}) puts this piece in a tier where in-person review is economically justified by the stakes involved.`,
      });
    }

    // Trigger 3: user-flagged complexity in intake (substantive content)
    const alterations = (intake.known_alterations || "").trim();
    const condition = (intake.condition_notes || "").trim();
    if (alterations.length > 20 || condition.length > 20) {
      triggers.push({
        reason:
          "You noted alterations, missing parts, or condition concerns in your intake. These often benefit from physical inspection to assess restoration scope and originality.",
      });
    }

    return triggers;
  }, [
    report,
    analysisMode,
    intake.known_alterations,
    intake.condition_notes,
  ]);

  const structuredMissingEvidence = useMemo(() => computeMissingEvidenceFromStructured(coreImages, groupImages), [coreImages, groupImages]);
  const fieldMissingEvidence = useMemo(() => computeMissingEvidenceFromImages(fieldPhotos), [fieldPhotos]);
  const totalPhotos = useMemo(() => {
    if (analysisMode === "field_scan") return fieldPhotos.length;
    const coreCount = Object.values(coreImages).filter(Boolean).length;
    const groupCount = (Object.values(groupImages) as ImageRecord[][]).reduce((sum, arr) => sum + arr.length, 0);
    return coreCount + groupCount;
  }, [analysisMode, coreImages, groupImages, fieldPhotos]);

  const allImages = useMemo(() => {
    if (analysisMode === "field_scan") return fieldPhotos;
    const core = Object.values(coreImages).filter(Boolean) as ImageRecord[];
    const grouped = Object.values(groupImages).flat();
    return [...core, ...grouped];
  }, [analysisMode, coreImages, groupImages, fieldPhotos]);

  // Convert one file to an ImageRecord. Surfaces a clear message and skips the
  // file if it can't be turned into a supported format (rare: corrupt input),
  // rather than letting an undecodable original reach the API and 400.
  async function buildImageRecord(file: File, imageType: string): Promise<ImageRecord | null> {
    try {
      return { image_type: imageType, data_url: await fileToDataUrl(file), name: file.name };
    } catch (e) {
      const why = e instanceof Error ? e.message : "unsupported image";
      setError(`Couldn't process "${file.name || "photo"}" (${why}) — skipped it. Your other photos are fine.`);
      return null;
    }
  }

  async function handleCoreUpload(slotKey: string, fileList: FileList | null) {
    if (!fileList || !fileList[0]) return;
    setError("");
    const record = await buildImageRecord(fileList[0], slotKey);
    if (!record) return;
    setCoreImages((prev) => ({ ...prev, [slotKey]: record }));
  }

  async function handleGroupUpload(groupKey: string, imageType: string, fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError("");
    const nextImages: ImageRecord[] = [];
    for (const file of Array.from(fileList)) {
      const record = await buildImageRecord(file, imageType);
      if (record) nextImages.push(record);
    }
    if (nextImages.length === 0) return;
    setGroupImages((prev) => ({ ...prev, [groupKey]: [...(prev[groupKey] || []), ...nextImages] }));
  }

  async function handleFieldUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError("");
    const nextImages: ImageRecord[] = [];
    for (const file of Array.from(fileList)) {
      const nextIndex = fieldPhotos.length + nextImages.length;
      const record = await buildImageRecord(file, inferFieldImageType(nextIndex));
      if (record) nextImages.push(record);
    }
    if (nextImages.length === 0) return;
    setFieldPhotos((prev) => [...prev, ...nextImages]);
  }

  async function handleFieldRefinementUpload(imageType: string, fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError("");
    const nextImages: ImageRecord[] = [];
    for (const file of Array.from(fileList)) {
      const record = await buildImageRecord(file, imageType);
      if (record) nextImages.push(record);
    }
    if (nextImages.length === 0) return;
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
    setUploadTooLarge(false);
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

    // Pre-upload payload guard. Render runs a long-lived Node server with no
    // serverless body cap, so this is a sanity ceiling — not a platform limit.
    // It keeps a single scan comfortably under Anthropic's per-image size
    // limits and surfaces a clear message instead of a failed request if a
    // photo set is unusually large. Photos are already downscaled (see
    // downscaleImageFile), so normal scans land far below this.
    //
    // Estimate payload size by summing data_url string lengths. data_urls
    // are base64-encoded (1 char ≈ 1 byte payload) plus a small prefix.
    const PAYLOAD_BYTE_LIMIT = 20_000_000;
    const totalDataUrlBytes = allImages.reduce((sum, img) => {
      const url = (img && (img as any).data_url) ? String((img as any).data_url) : "";
      return sum + url.length;
    }, 0);

    if (totalDataUrlBytes > PAYLOAD_BYTE_LIMIT) {
      const mb = (totalDataUrlBytes / 1_000_000).toFixed(1);
      setError(
        `Photos total ${mb} MB after compression, which exceeds the ${(PAYLOAD_BYTE_LIMIT / 1_000_000).toFixed(1)} MB per-scan upload limit. Try removing the lowest-detail photos (cropped close-ups beat wide shots for the engine) or running with fewer images.`
      );
      return;
    }

    // Soft count cap: more than 10 photos rarely improves analysis and
    // routinely pushes payloads over the platform limit. Suggest pruning
    // before attempting.
    const PHOTO_COUNT_SOFT_CAP = 10;
    if (allImages.length > PHOTO_COUNT_SOFT_CAP) {
      setError(
        `${allImages.length} photos is more than the engine can effectively use. Reduce to ${PHOTO_COUNT_SOFT_CAP} or fewer — choose your highest-detail shots (joinery close-ups, label, underside) over wide angle views. Fewer good photos beat more redundant ones.`
      );
      return;
    }

    setIsRunning(true);
    setCurrentPhase("starting");
    // Starting a new scan clears any historical-view state — the new
    // report should not be presented as a saved-scan view.
    setViewingSavedScanId(null);
    setViewingSavedScanTimestamp(null);
    try {
      const created = API.createCase({ notes: intake.notes, analysis_mode: intake.analysis_mode });
      const caseId = created.case_id;
      setActiveCaseId(caseId);
      for (const img of allImages) API.addImage(caseId, img);
      // Phase progress callback — fires once per phase as the engine
      // moves through p0 → p7 (and p0_recovery if Phase 0 returned
      // empty observations). currentPhase drives the RunButton's
      // status text via PHASE_LABELS lookup.
      await API.analyzeCase(caseId, intake, (phase: string) => {
        setCurrentPhase(phase);
      });
      setReport(API.getReport(caseId));
    } catch (e: any) {
      const msg = e?.message || "";
      const is413 =
        e?.name === "PayloadTooLargeError" ||
        /\b413\b|payload too large|request entity too large/i.test(msg);
      if (is413) {
        // Field-scan path: UploadTooLargeNotice renders below the Run
        // button with "Switch to Full Analysis" CTA. Full-analysis path:
        // no such CTA available (they're already on full), so surface
        // the error via setError so the existing inline error display
        // in the full-analysis Run button section shows a clear message.
        // Pre-upload validation (above) should normally catch this BEFORE
        // the API call; this catch handles edge cases where the platform
        // 413s on a payload that slipped just past our client estimate.
        if (analysisMode === "full_analysis") {
          setError(
            "Photos are too large to scan in a single Full Analysis. Try removing the lowest-detail photos, or use the highest-detail close-ups (joinery, label, underside) — fewer good photos beat more redundant ones."
          );
        }
        setUploadTooLarge(true);
      } else {
        setError(msg || "Analysis failed.");
      }
    } finally {
      setIsRunning(false);
      setCurrentPhase(null);
    }
  }

  /**
   * Migrate field-scan photos into structured full-analysis slots and
   * switch the form to Full Analysis mode.
   *
   * Wired into two contexts:
   *   1. UploadTooLargeNotice — when a field scan payload exceeds size
   *      limits, user can convert to full analysis (which subdivides
   *      the upload across structured slots).
   *   2. Field → Full upsell card at the end of a field-scan report —
   *      "Want the complete case file?" recommendation.
   *
   * Photo mapping follows the existing inferFieldImageType convention:
   *   - fieldPhotos[0] → coreImages.overall_front
   *   - fieldPhotos[1] → coreImages.overall_side
   *   - fieldPhotos[2..] → groupImages.construction (joinery_closeup)
   *
   * Side effects:
   *   - Clears any active report (post-report context — user is
   *     starting fresh in full-analysis mode)
   *   - Scrolls to top so user lands at the form header rather than
   *     at the bottom of the dismissed report
   */
  function switchToFullAnalysisWithPhotos() {
    const photos = fieldPhotos;
    const nextCore: CoreImageMap = {
      overall_front: photos[0]
        ? { ...photos[0], image_type: "overall_front" }
        : null,
      overall_side: photos[1]
        ? { ...photos[1], image_type: "overall_side" }
        : null,
      underside: null,
      back: null,
      label_makers_mark: null,
    };
    const extras = photos.slice(2).map((p) => ({ ...p, image_type: "joinery_closeup" }));
    setCoreImages(nextCore);
    setGroupImages((prev) => ({ ...prev, construction: [...prev.construction, ...extras] }));
    setFieldPhotos([]);
    setUploadTooLarge(false);
    setError("");
    setReport(null);
    updateIntake("analysis_mode", "full_analysis" as any);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    setUploadTooLarge(false);
    setIsRunning(false);
  }
  
const stageOutputs = report?.stage_outputs || {};
  const p1 = stageOutputs.p1 || null;
const p2 = stageOutputs.p2 || null;
const p3 = stageOutputs.p3 || null;
const p5 = stageOutputs.p5 || null;
const p6 = stageOutputs.p6 || null;
const p7 = stageOutputs.p7 || null;
  

  const fieldValue = useMemo(() => {
    if (!p2 || !p3) return null;
    return fieldValueBand(p3?.display_form || p3?.form || "Unknown", p2?.range || "Unknown", Array.isArray(p5?.conflict_notes) ? p5.conflict_notes.length : 0, p1?.confidence_cap);
  }, [p1, p2, p3, p5]);

  const fieldRecommendation = useMemo(() => {
    if (!fieldValue) return null;
    return recommendationFromValue({
      askingPrice: intake.asking_price,
      valueLow: fieldValue.low,
      valueHigh: fieldValue.high,
      confidenceBand: p1?.confidence_cap,
      conflictCount: Array.isArray(p5?.conflict_notes) ? p5.conflict_notes.length : 0,
      profile: intake.picker_profile,
      largeForm: isLargeForm(p3?.display_form || p3?.form, intake.approximate_height, intake.approximate_width),
      repairSignals: hasRepairSignals(intake.condition_notes, intake.known_alterations),
    });
  }, [fieldValue, intake, p1, p3, p5]);

  const supportingEvidence = useMemo(() => pickSupportingEvidence(report), [report]);
  const primaryCaution = (Array.isArray(p5?.conflict_notes) && p5.conflict_notes[0]) || (Array.isArray(p2?.limitations) && p2.limitations[0]) || "Exact dating depends on construction evidence such as joinery, fasteners, and structural details. Without these, visible style may suggest a period but cannot confirm it.";
  const nextBestEvidence = (Array.isArray(p1?.next_best_evidence) && p1.next_best_evidence[0]) || "Add a structural detail such as an underside, back, or joinery view if accessible.";

  const fieldReady = fieldPhotos.length >= 2;
  const fullReady = Boolean(coreImages.overall_front && coreImages.overall_side && allImages.length >= 2);

  // Pre-hydration: render nothing in the page body. Layout header (logo +
  // tagline + studio attribution) still renders, so the page is never blank.
  if (showLanding === null) {
    return <main style={{ minHeight: "60vh", background: "#f6f1e8" }} />;
  }

  // First-visit (or explicit return-to-landing): show the two-path landing
  // screen instead of the intake form. Selecting a card dismisses the
  // landing and lands the user on the form pre-set to that mode.
  if (showLanding) {
    return (
      <main style={{ minHeight: "100vh", background: "#f6f1e8", color: "#2f2418", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
        <WelcomeLanding onSelectMode={dismissLandingWithMode} />
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f6f1e8", color: "#2f2418", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" }}>
      {/* Hidden mobile trigger for the Engine Trace: an invisible bottom-left
          hotspot. Tapping it TRACE_TAP_COUNT times quickly toggles the trace
          (the desktop equivalent of typing the reveal code). Mobile-only and
          excluded from print. */}
      {isMobile && (
        <div
          aria-hidden
          className="no-print"
          onClick={onTraceHotspotTap}
          style={{ position: "fixed", left: 0, bottom: 0, width: 64, height: 64, zIndex: 2147483647, background: "transparent" }}
        />
      )}
      {showPickerProfile && (
        <PickerProfileSetup
          draft={pickerDraft}
          setDraft={setPickerDraft}
          step={pickerStep}
          setStep={setPickerStep}
          onSave={handleSaveProfile}
          onCancel={handleSkipProfile}
        />
      )}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 60px" }}>
        {/* Back-to-landing link — small, low-weight, lives above the page h1
            so power users can return to the two-path picker any time.
            Hidden in print (the button belongs to the live app, not the
            printed report). */}
        <button
          type="button"
          onClick={returnToLanding}
          className="no-print"
          style={{
            background: "none",
            border: "none",
            padding: "4px 0",
            marginBottom: 12,
            cursor: "pointer",
            color: "#594734",
            fontSize: 13,
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ← Back to start
        </button>
        <div className="no-print" style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", marginBottom: 16, fontSize: 13 }}>
          <a href="/glossary" style={navLinkStyle}>Glossary</a>
          <a href="/compare" style={navLinkStyle}>
            Compare{compareCount > 0 ? ` (${compareCount})` : ""}
          </a>
          {analysisMode === "field_scan" && (
            <button type="button" onClick={openPickerProfile} style={navButtonStyle}>
              {intake.picker_profile ? "Edit picker profile" : "Set up picker profile"}
            </button>
          )}
        </div>
        <header className="no-print" style={{ marginBottom: 24 }}>
          {analysisMode === "field_scan" ? (
            <>
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

        <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Analysis Mode toggle removed: the landing screen (WelcomeLanding)
              owns the initial choice and the "← Back to start" link above
              owns the escape hatch. Keeping the toggle inline alongside
              the landing made the choice feel presented twice — landing
              implied "important decision," toggle implied "casual flip,"
              and the dissonance undercut both. Now the page h1 declares
              the mode; users who change their mind use Back to start. */}

          {analysisMode === "field_scan" ? (
            <>
              <SectionCard title="1. Add Photos">
                <div style={{ border: "1px dashed #ccbca2", borderRadius: 12, background: "#fffaf2", padding: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#3d2d1f" }}>Add 2–5 photos. We’ll handle the rest.</div>
                  <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65, color: "#5b4935" }}>
  <div style={{ fontWeight: 700, marginBottom: 6 }}>For best results, include:</div>
  <div>• Overall form from multiple angles</div>
  <div>• Underside or back (frame and structure)</div>
  <div>• Joinery (corners, joints, drawer construction)</div>
  <div>• Hardware (screws, nails, brackets)</div>
  <div>• Close-up of materials</div>

  <div style={{ marginTop: 10, fontWeight: 700, color: "#4a3725" }}>Important:</div>
  <div>
    Dating and identification rely heavily on construction details.
    Without joinery, fasteners, or structural views, results may remain broad even if the style appears clear.
  </div>
  <div style={{ marginTop: 8 }}>
    If your photos won't upload, you'll have a chance to either reduce the number of photos or switch to Full Analysis with the same photos already in place.
  </div>
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
                <RunButton label="Run Field Scan" disabled={isRunning || !fieldReady} isRunning={isRunning} onClick={runAnalysis} currentPhase={currentPhase} />
                {uploadTooLarge ? (
                  <UploadTooLargeNotice
                    onAdjust={() => setUploadTooLarge(false)}
                    onSwitchToFull={switchToFullAnalysisWithPhotos}
                  />
                ) : (
                  error && <div style={errorStyle}>{error}</div>
                )}
              </SectionCard>
            </>
          ) : (
            <>
              <SectionCard title="1. Core Photos">
                <div style={{ display: "grid", gap: 14 }}>
                  {CORE_SLOTS.map((slot) => {
                    const current = coreImages[slot.key];
                    const exampleKey = EXAMPLE_KEY_FOR_SLOT[slot.key];
                    return (
                      <div key={slot.key} style={{ border: "1px solid #e2d7c3", borderRadius: 10, padding: 12, background: "#fff" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                          <div>
                            <div style={{ fontWeight: 700, color: "#3d2d1f" }}>{slot.label} {slot.required ? "*" : ""}</div>
                            <div style={{ fontSize: 13, color: "#6a5845", marginTop: 4 }}>
                              {slot.desc}
                              {exampleKey && (
                                <>
                                  {" "}
                                  <button
                                    type="button"
                                    onClick={() => setOpenExampleKey(exampleKey)}
                                    style={viewExampleLinkStyle}
                                  >
                                    View example →
                                  </button>
                                </>
                              )}
                            </div>
                            {current && (
                              <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: "#5d4932" }}>
                                <span style={{ color: "#46603e", marginRight: 6 }}>✓</span>
                                Loaded: {current.name || "photo on file"}
                              </div>
                            )}
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
                    const exampleKey = EXAMPLE_KEY_FOR_SLOT[group.key];
                    return (
                      <div key={group.key} style={{ border: "1px solid #e2d7c3", borderRadius: 10, padding: 12, background: "#fff" }}>
                        <div style={{ fontWeight: 700, color: "#3d2d1f" }}>{group.label}</div>
                        <div style={{ fontSize: 13, color: "#6a5845", marginTop: 4 }}>
                          {group.helper}
                          {exampleKey && (
                            <>
                              {" "}
                              <button
                                type="button"
                                onClick={() => setOpenExampleKey(exampleKey)}
                                style={viewExampleLinkStyle}
                              >
                                View example →
                              </button>
                            </>
                          )}
                        </div>
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
                <GuidanceMessages
                  missing={structuredMissingEvidence}
                  totalPhotos={totalPhotos}
                />
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
                <RunButton label="Run Full Analysis" disabled={isRunning || !fullReady} isRunning={isRunning} onClick={runAnalysis} currentPhase={currentPhase} />
                {error && <div style={errorStyle}>{error}</div>}
              </SectionCard>
            </>
          )}
        </div>

        {/* Print / Save as PDF — small action bar above the report area
            when a report exists. Calls window.print() which opens the
            browser-native print dialog; user picks "Save as PDF" as the
            destination on desktop, or "Save to Files" / "AirPrint" on
            mobile. No external library. Hidden in print output itself
            via .no-print so the button doesn't show on the printed page. */}
        {report && (
          <div
            className="no-print"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 16,
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
              style={{
                background: "#fff",
                color: "#1a2e4e",
                border: "1px solid #b9956a",
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.01em",
              }}
            >
              Print / Save as PDF →
            </button>
          </div>
        )}

        {/* Print-only metadata header — appears at the top of the
            printed report to give context for the saved PDF: scan ID,
            mode, and date. Invisible on screen. Wrapped in .print-only
            so it only surfaces when window.print() is invoked. */}
        {report && (
          <div
            className="print-only"
            style={{
              marginTop: 12,
              padding: "10px 0",
              borderTop: "1px solid #d9ccb5",
              borderBottom: "1px solid #d9ccb5",
              fontFamily:
                "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
              fontSize: 12,
              color: "#594734",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1a2e4e",
                marginBottom: 4,
              }}
            >
              {analysisMode === "field_scan"
                ? "Field Scan Report"
                : "Full Analysis Report"}
            </div>
            <div>
              <strong>Case ID:</strong>{" "}
              {activeCaseId || viewingSavedScanId || "—"}
            </div>
            <div>
              <strong>Mode:</strong>{" "}
              {analysisMode === "field_scan" ? "Field Scan" : "Full Analysis"}
            </div>
            <div>
              <strong>Report{viewingSavedScanId ? " saved" : " generated"}:</strong>{" "}
              {formatSavedScanTimestamp(
                viewingSavedScanTimestamp || new Date().toISOString()
              )}
            </div>
            {report?.engine_version && (
              <div>
                <strong>Engine version:</strong> {report.engine_version}
              </div>
            )}
          </div>
        )}

        {/* Advisory disclaimer — shown on the report on screen AND in print
            (deliberately NOT .no-print) so the liability framing travels with
            any saved/printed PDF. Proof Sleuth gives an evidence-based reading,
            not a certified appraisal; this protects the appraiser when a user
            acts on a recommendation. */}
        {report && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              background: "#fbf7ef",
              border: "1px solid #e3d6bd",
              borderLeft: "3px solid #b9956a",
              borderRadius: 8,
              fontSize: 12.5,
              lineHeight: 1.55,
              color: "#6a5845",
            }}
          >
            <strong style={{ color: "#1a2e4e" }}>Advisory only.</strong> This is
            an evidence-based reading generated from your photos — not a
            certified appraisal, authentication, or guarantee of value. Values
            are estimates and market conditions vary. Verify independently
            before buying, selling, or insuring. For a binding valuation,{" "}
            <a
              href="https://newcreationswoodcraft.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1a2e4e", borderBottom: "1px solid #b9956a" }}
            >
              consult a professional appraiser
            </a>
            .
          </div>
        )}

        {/* Historical-view banner — shown when the report state was
            loaded from IndexedDB via ?view=case-XXX rather than from a
            fresh scan in this session. Signals that the user is looking
            at saved historical output, not at a just-run analysis. */}
        {report && viewingSavedScanId && (
          <div
            style={{
              marginTop: 20,
              padding: "12px 16px",
              background: "#f5f0e8",
              border: "1px solid #d9ccb5",
              borderLeft: "3px solid #1a2e4e",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 13, color: "#594734", lineHeight: 1.5 }}>
              <strong style={{ color: "#1a2e4e" }}>Viewing saved scan</strong>
              {viewingSavedScanTimestamp && (
                <> from {formatSavedScanTimestamp(viewingSavedScanTimestamp)}</>
              )}
              {" · "}
              <span style={{ color: "#8a7c6a" }}>{viewingSavedScanId}</span>
            </div>
            <button
              type="button"
              onClick={returnToLanding}
              className="no-print"
              style={{
                background: "none",
                border: "1px solid #d9ccb5",
                color: "#594734",
                padding: "5px 12px",
                borderRadius: 6,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Start a new scan →
            </button>
          </div>
        )}

        {report && isInconclusiveScan && (
          <div
            style={{
              marginTop: 20,
              padding: "16px 18px",
              background: "#fffaf0",
              border: "1px solid #d9ccb5",
              borderLeft: "3px solid #b9956a",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#1a2e4e",
                fontSize: 14,
                marginBottom: 6,
              }}
            >
              {scanServiceFailure
                ? "This scan hit a service error — not a photo problem."
                : "This scan didn't produce confident results."}
            </div>
            <div style={{ fontSize: 13, color: "#594734", lineHeight: 1.55 }}>
              {scanServiceFailure
                ? "The analysis engine returned an error or couldn't be reached, so no evidence could be extracted. This isn't about your photos — please try the scan again in a moment."
                : "The photos didn't yield enough structured evidence for a confident reading. Try re-shooting with better lighting, focus, or angle — or add a different combination of photos (underside, joinery close-up, or maker label)."}
            </div>
            {scanServiceFailure && scanServiceFailureDetail && (
              <div style={{ marginTop: 6, fontSize: 11, color: "#8a7355", fontFamily: "monospace" }}>
                Diagnostic: {scanServiceFailureDetail}
              </div>
            )}
            {/* TODO: when subscription/quota system lands, surface the
                quota-exemption message here:
                "Inconclusive scans don't count toward your scan quota." */}
          </div>
        )}

        {report && analysisMode === "field_scan" && p2 && p3 && fieldValue && fieldRecommendation && (
          <div style={{ marginTop: 20, display: "grid", gap: 18 }}>
            <SectionCard title="Field Scan Result">
              <div style={{ ...recommendationStyle(fieldRecommendation.recommendation), borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.03em", lineHeight: 1.1 }}>{fieldRecommendation.label}</div>
                <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55 }}>{fieldRecommendation.explanation}</div>
              </div>
              <div className="no-print" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                {(report?.id || activeCaseId) && isInBasket(report?.id || activeCaseId) ? (
                  <a href="/compare" style={{ ...navLinkStyle, fontSize: 14 }}>In comparison ✓ — view{compareCount > 0 ? ` (${compareCount})` : ""}</a>
                ) : (
                  <button type="button" onClick={handleAddToCompare} style={{ ...tinyRemoveButton, fontWeight: 600 }}>+ Add to comparison</button>
                )}
                {compareNote && <span style={{ fontSize: 12, color: "#7a2626" }}>{compareNote}</span>}
              </div>
            </SectionCard>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <SectionCard title="Likely Identification">
                <div style={metaRowStyle}><span>Best reading</span><strong>{p3?.display_form || p3?.form || "Unknown"}</strong></div>
                {p3?.style_context && <div style={{ marginTop: 10, fontSize: 14, color: "#574634", lineHeight: 1.55 }}>Broad style context: {p3.style_context}</div>}
                {Array.isArray(p3?.style_influences) && p3.style_influences.length > 0 && (
                  <div style={{ marginTop: 10, fontSize: 13, color: "#6a5845", lineHeight: 1.5, fontStyle: "italic" }}>
                    Style influences worth checking: {p3.style_influences.map((s: any) => s.name).join(", ")}. These are tentative reads from descriptive language, not confirmed by distinctive style evidence — they do not affect the dating or value above.
                  </div>
                )}
                {p3?.final_style && ["named_transitional", "revival_wave", "reproduction", "impossible_pair", "late_period"].includes(p3.final_style.kind) && (
                  <div style={{ marginTop: 6, fontSize: 13, color: "#6a5845", lineHeight: 1.5, fontStyle: "italic" }}>
                    Why this label: {p3.final_style.final_style_reason}
                  </div>
                )}
                {/* "Alternate possibilities" removed per appraiser direction:
                    when primary confidence is high the alternates undermine
                    authority; when primary confidence is low a list of also-rans
                    doesn't help the user decide. Either case the section hurt
                    more than it helped. p3.alternatives still computed by the
                    engine (used by other downstream logic / cousin contrasts)
                    but no longer rendered in the report. */}
              </SectionCard>
              <SectionCard title="Broad Date Lane">
  {/* Frame date */}
  <div style={metaRowStyle}>
    <span>Frame date</span>
    <strong>{p2?.range || "Unknown"}</strong>
  </div>

  <div style={metaRowStyle}>
    <span>Frame confidence</span>
    <strong style={{ color: bandColor(p2?.confidence) }}>
      {p2?.confidence || "Inconclusive"}
    </strong>
  </div>

  {/* Upholstery date (ONLY if present) */}
  {p2?.upholstery_layer && (
    <>
      <div style={{ marginTop: 10, borderTop: "1px solid #e5d8c2", paddingTop: 10 }} />

      <div style={metaRowStyle}>
        <span>Upholstery date</span>
        <strong>{p2.upholstery_layer.range}</strong>
      </div>

      <div style={metaRowStyle}>
        <span>Upholstery confidence</span>
        <strong style={{ color: bandColor(p2.upholstery_layer.confidence) }}>
          {p2.upholstery_layer.confidence}
        </strong>
      </div>

      {p2.upholstery_layer.note && (
        <div style={{ marginTop: 8, fontSize: 13, color: "#5c4a37", lineHeight: 1.5 }}>
          {p2.upholstery_layer.note}
        </div>
      )}
    </>
  )}
</SectionCard>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <SectionCard title="Broad Resale Lane">
                <div style={metaRowStyle}><span>Typical resale lane</span><strong>{fieldValue.display}</strong></div>
                <div style={{ marginTop: 10, fontSize: 14, color: "#574634", lineHeight: 1.55 }}>This is a broad field-use range shaped by likely form, date lane, and visible risk.</div>
              </SectionCard>
              <SectionCard title="Main Caution"><div style={{ fontSize: 14, color: "#574634", lineHeight: 1.6 }}><GlossaryText text={primaryCaution} /></div></SectionCard>
            </div>

            <SectionCard title="Key Supporting Evidence">
              {supportingEvidence.length > 0 ? <div style={{ display: "grid", gap: 12 }}>{supportingEvidence.map((item) => <div key={item} style={{ border: "1px solid #eadfcf", borderRadius: 10, padding: 12, background: "#fff" }}><div style={{ fontWeight: 700, fontSize: 14, color: "#3d2d1f", lineHeight: 1.5 }}><GlossaryText text={item} /></div>{evidenceMeaning(item) && (
  <div style={{ marginTop: 6, fontSize: 14, color: "#5c4a37", lineHeight: 1.6 }}>
    <GlossaryText text={evidenceMeaning(item)} />
  </div>
)}</div>)}</div> : <div style={emptyText}>No supporting evidence was returned.</div>}
            </SectionCard>

            <SectionCard title="Next Best Evidence"><div style={{ fontSize: 14, color: "#574634", lineHeight: 1.6 }}><GlossaryText text={nextBestEvidence} /></div></SectionCard>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <SectionCard title="Negotiating Tips">
            <TipsList items={p7?.negotiation_tips} />
            </SectionCard>

            <SectionCard title="Selling Tips">
            <TipsList items={p7?.selling_tips} />
            </SectionCard>
          </div>

            <SectionCard title="Refine This Result">
              <div style={{ fontSize: 14, color: "#574634", lineHeight: 1.6, marginBottom: 12 }}>Add a follow-up photo to tighten the result without starting over.</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <label style={uploadBrownButton}>Add Underside Photo<input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleFieldRefinementUpload("underside", e.target.files)} /></label>
                <label style={uploadTanButton}>Add Back Photo<input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleFieldRefinementUpload("back", e.target.files)} /></label>
                <label style={uploadOliveButton}>Add Construction Detail<input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleFieldRefinementUpload("joinery_closeup", e.target.files)} /></label>
                <label style={uploadGoldButton}>Add Hardware Close-Up<input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleFieldRefinementUpload("hardware_closeup", e.target.files)} /></label>
              </div>
              <RunButton label="Re-Run Field Scan" disabled={isRunning || !fieldReady} isRunning={isRunning} onClick={runAnalysis} currentPhase={currentPhase} />
            </SectionCard>

            {/* Conditional appraiser-review CTA. Fires only when triggers
                surface evidence patterns beyond what automated photo
                analysis can resolve. Trust-preserving: explains WHY this
                piece, names what hands-on adds that photos can't capture,
                and frames as "what could help" rather than "buy this." */}
            {appraiserReviewTriggers.length > 0 && (
              <AppraiserReviewCTA triggers={appraiserReviewTriggers} />
            )}

            {/* Field → Full Analysis upsell. Always offered at the end of
                a field-scan report. Photos migrate to structured slots
                following the existing inferFieldImageType convention;
                user can rearrange before submitting the full analysis.
                Not shown when there are no photos to migrate (defensive).
                Hidden in print — the upsell is interactive infrastructure,
                not part of the captured report. */}
            {fieldPhotos.length > 0 && (
              <div className="no-print">
              <SectionCard title="">
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #d9ccb5",
                    borderLeft: "3px solid #b9956a",
                    borderRadius: 8,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#352719",
                      fontSize: 16,
                      marginBottom: 6,
                    }}
                  >
                    Want the complete case file?
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: "#594734",
                      marginBottom: 14,
                    }}
                  >
                    Full Analysis returns construction-by-construction dating evidence, maker attribution where supported, and a defensible valuation framework. Your photos carry over — you can add an underside, label close-up, or hardware photos for richer results.
                  </div>
                  <button
                    type="button"
                    onClick={switchToFullAnalysisWithPhotos}
                    style={{
                      background: "#1a2e4e",
                      color: "#fff",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      letterSpacing: "0.01em",
                      fontFamily: "inherit",
                    }}
                  >
                    Start a Full Analysis →
                  </button>
                </div>
              </SectionCard>
              </div>
            )}
          </div>
        )}

        {report && analysisMode === "full_analysis" && (
          <div style={{ marginTop: 20, display: "grid", gap: 18 }}>
            {/* Headline — at-a-glance answer. Replaces the prose Analysis
                Summary and the two "Frame" cards; the frame detail (working
                range, limitations, style context) now lives in the Date &
                Style detail card placed just below the dating visual. */}
            <section style={{ background: "#fffdf9", border: "1px solid #ded3bf", borderRadius: 12, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#3e2f1f", lineHeight: 1.25 }}>{(p3?.display_form || p3?.form || "Unknown").replace(/\s*\(also commonly called:[^)]*\)\s*$/i, "")}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {[
                  { k: "Date", v: p2?.range || "Unknown", c: undefined as string | undefined },
                  ...(p3?.style_attribution?.name || p3?.style_context
                    ? [{ k: "Style", v: (p3?.style_attribution?.name || p3?.style_context) as string, c: undefined as string | undefined }]
                    : []),
                  { k: "Confidence", v: p3?.confidence || "Inconclusive", c: bandColor(p3?.confidence) },
                ].map((pill) => (
                  <span key={pill.k} style={{ display: "inline-flex", gap: 6, alignItems: "baseline", background: "#efe6d6", borderRadius: 999, padding: "5px 12px", fontSize: 14 }}>
                    <span style={{ fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase", color: "#6a5845" }}>{pill.k}</span>
                    <strong style={{ color: pill.c || "#3e2f1f" }}>{pill.v}</strong>
                  </span>
                ))}
              </div>
            </section>
            {/* Upholstery track moved below the Date & Style detail card. */}
            {p6?.dating_overlap && (
              <SectionCard title="How we dated it">
                {(() => {
                  const narrative = buildDatingFindingNarrative({
                    data: p6.dating_overlap,
                    styleAttribution: p3?.style_attribution ?? null,
                    finalStyle: p3?.final_style ?? null,
                    finalDatingFloor: p2?.date_floor ?? null,
                    finalDatingCeiling: p2?.date_ceiling ?? null,
                  });
                  if (!narrative) return null;
                  // Tone + reasoning only. The date window is carried by the
                  // headline pill and the ranked list's summary line, so the
                  // callout no longer repeats the identification or the number.
                  return <DatingFindingCallout narrative={narrative} dateFloor={null} dateCeiling={null} identification={null} confidenceBand={p2?.confidence ?? null} />;
                })()}
                <EvidenceRankedList
                  data={p6.dating_overlap}
                  styleAttribution={p3?.style_attribution ?? null}
                  p2Floor={p2?.date_floor ?? null}
                  p2Ceiling={p2?.date_ceiling ?? null}
                />
                {/* Old timeline kept dormant during redesign review — restore by
                    swapping EvidenceRankedList back to DatingOverlapViz with its
                    original props (data / styleAttribution / styleAlternatives /
                    styleWaves / bestStyleIntersection / suppressedPartnerIds). */}
              </SectionCard>
            )}
            <SectionCard title="Date & style detail">
              <div style={metaRowStyle}><span>Working range</span><strong>{p2?.range || "Unknown"}</strong></div>
              <div style={metaRowStyle}><span>Dating confidence</span><strong style={{ color: bandColor(p2?.confidence) }}>{p2?.confidence || "Inconclusive"}</strong></div>
              {p3?.style_context && <div style={{ marginTop: 10, fontSize: 14, color: "#574634", lineHeight: 1.55 }}>Broad style context: {p3.style_context}</div>}
              {Array.isArray(p3?.style_influences) && p3.style_influences.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 13, color: "#6a5845", lineHeight: 1.5, fontStyle: "italic" }}>
                  Style influences worth checking: {p3.style_influences.map((s: any) => s.name).join(", ")}. These are tentative reads from descriptive language, not confirmed by distinctive style evidence — they do not affect the dating or value.
                </div>
              )}
              {p3?.final_style && ["named_transitional", "revival_wave", "reproduction", "impossible_pair", "late_period"].includes(p3.final_style.kind) && (
                <div style={{ marginTop: 6, fontSize: 13, color: "#6a5845", lineHeight: 1.5, fontStyle: "italic" }}>
                  Why this label: {p3.final_style.final_style_reason}
                </div>
              )}
              {Array.isArray(p2?.limitations) && p2.limitations.length > 0 && <><div style={subheadStyle}>Current limitations</div><ul style={listStyle}>{p2.limitations.map((item: string) => <li key={item}>{item}</li>)}</ul></>}
              {p3?.regional_period_notes && (
                <DetailDropdown title="Regional & period context">
                  <div style={{ whiteSpace: "pre-wrap" }}>{p3.regional_period_notes}</div>
                </DetailDropdown>
              )}
              {Array.isArray(p3?.cousin_form_contrasts) && p3.cousin_form_contrasts.length > 0 && (
                <DetailDropdown title="How it differs from similar pieces">
                  <div style={{ display: "grid", gap: 8 }}>
                    {p3.cousin_form_contrasts.map((c: string, i: number) => (
                      <div key={i}>{c}</div>
                    ))}
                  </div>
                </DetailDropdown>
              )}
            </SectionCard>
            {p2?.upholstery_layer && (
              <SectionCard title="Upholstery (separate from frame)">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <div>
                    <div style={metaRowStyle}>
                      <span>Upholstery identification</span>
                      <strong>{p2.upholstery_layer.identification || "Upholstery present"}</strong>
                    </div>
                    {p2.upholstery_layer.original_likely === true && (
                      <div style={{ marginTop: 8, fontSize: 13, color: "#2f6b3a", fontWeight: 600 }}>
                        Likely original to frame
                      </div>
                    )}
                    {p2.upholstery_layer.original_likely === false && (
                      <div style={{ marginTop: 8, fontSize: 13, color: "#8a5a2a", fontWeight: 600 }}>
                        Likely a later reupholstery
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={metaRowStyle}>
                      <span>Upholstery date</span>
                      <strong>{p2.upholstery_layer.range}</strong>
                    </div>
                    <div style={metaRowStyle}>
                      <span>Upholstery confidence</span>
                      <strong style={{ color: bandColor(p2.upholstery_layer.confidence) }}>
                        {p2.upholstery_layer.confidence}
                      </strong>
                    </div>
                  </div>
                </div>
                {p2.upholstery_layer.note && (
                  <div style={{ marginTop: 12, fontSize: 13, color: "#5c4a37", lineHeight: 1.5 }}>
                    {p2.upholstery_layer.note}
                  </div>
                )}
                {p2.upholstery_layer.cross_reference_note && (
                  <div style={{ marginTop: 8, fontSize: 13, color: "#5c4a37", lineHeight: 1.5, fontStyle: "italic" }}>
                    {p2.upholstery_layer.cross_reference_note}
                  </div>
                )}
              </SectionCard>
            )}
            <SectionCard title="Key Supporting Evidence">{supportingEvidence.length > 0 ? <div style={{ display: "grid", gap: 12 }}>{supportingEvidence.map((item) => <div key={item} style={{ border: "1px solid #eadfcf", borderRadius: 10, padding: 12, background: "#fff" }}><div style={{ fontWeight: 700, fontSize: 14, color: "#3d2d1f", lineHeight: 1.5 }}><GlossaryText text={item} /></div><div style={{ marginTop: 6, fontSize: 14, color: "#5c4a37", lineHeight: 1.6 }}><GlossaryText text={evidenceMeaning(item)} /></div></div>)}</div> : <div style={emptyText}>No supporting evidence was returned.</div>}</SectionCard>
            <SectionCard title="Resale Valuation">
              <ResaleValuationSection valuation={p6?.valuation as ValuationShape | undefined} formLabel={p3?.display_form || p3?.form} />
            </SectionCard>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <SectionCard title="Supported Findings">{p6?.supported_findings?.length ? <ul style={listStyle}>{p6.supported_findings.map((item: string) => <li key={item}>{item}</li>)}</ul> : <div style={emptyText}>No supported findings were returned.</div>}</SectionCard>
              <SectionCard title="Cautions and Conflicts">{p6?.tentative_findings?.length ? <ul style={listStyle}>{p6.tentative_findings.map((item: string) => <li key={item}>{item}</li>)}</ul> : <div style={emptyText}>No major cautions were returned.</div>}</SectionCard>
            </div>
            <SectionCard title="Next Best Evidence">{Array.isArray(p6?.more_evidence_needed) && p6.more_evidence_needed.length > 0 ? <ul style={listStyle}>{p6.more_evidence_needed.map((item: string) => <li key={item}>{item}</li>)}</ul> : <div style={emptyText}>No additional evidence recommendations were returned.</div>}</SectionCard>
            <SectionCard title="Buying &amp; selling tips">
              <DetailDropdown title="When you're selling">
                <TipsList items={p7?.selling_tips} />
              </DetailDropdown>
              <DetailDropdown title="When you're buying">
                <TipsList items={p7?.negotiation_tips} />
              </DetailDropdown>
            </SectionCard>

            {/* Conditional appraiser-review CTA — same triggers as the
                field-scan report; placed at the end of full-analysis
                as the "last word" after all engine output. Frames as
                what an in-person review could add beyond what photo
                analysis is capable of. */}
            {appraiserReviewTriggers.length > 0 && (
              <AppraiserReviewCTA triggers={appraiserReviewTriggers} />
            )}

          </div>
        )}
        {/* Engine Trace diagnostic. Hidden by default; revealed by typing
            TRACE_REVEAL_CODE on desktop or the mobile corner-tap gesture.
            Rendered below either report mode (field scan + full analysis) —
            the trace data is always computed, this gate only controls display.
            Hidden in print (diagnostic noise on a paper readout). */}
        {report && traceVisible && (
          <div className="no-print">
            <TraceReport report={report} />
          </div>
        )}
      </div>
      {openExampleKey && (
        <ExampleModal
          exampleKey={openExampleKey}
          onClose={() => setOpenExampleKey(null)}
        />
      )}
    </main>
  );
}

const navLinkStyle: React.CSSProperties = { color: "#1a2e4e", textDecoration: "none", fontWeight: 600, borderBottom: "1px solid #b9956a", paddingBottom: 1 };
const navButtonStyle: React.CSSProperties = { background: "none", border: "none", padding: 0, cursor: "pointer", color: "#1a2e4e", fontWeight: 600, fontFamily: "inherit", fontSize: 13, borderBottom: "1px solid #b9956a" };
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
// Subtle text link rendered inline within a photo slot's description
// when a PHOTO_EXAMPLES entry exists for that slot. Opens ExampleModal.
const viewExampleLinkStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  color: "#b9956a",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "underline",
  textUnderlineOffset: "2px",
  fontFamily: "inherit",
};
const listStyle: React.CSSProperties = { margin: "8px 0 0", paddingLeft: 18, fontSize: 14, lineHeight: 1.6, color: "#574634" };
const subheadStyle: React.CSSProperties = { marginTop: 14, marginBottom: 6, fontSize: 14, fontWeight: 700, color: "#3d2d1f" };
const metaRowStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14, color: "#4f3f30" };
const emptyText: React.CSSProperties = { fontSize: 14, color: "#6a5845" };
const errorStyle: React.CSSProperties = { marginTop: 14, padding: 12, borderRadius: 10, background: "#fff1f1", border: "1px solid #efc5c5", color: "#7a2626", fontSize: 14 };
