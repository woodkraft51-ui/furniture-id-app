/**
 * Photo example illustrations for full-analysis intake guidance.
 *
 * Each entry is rendered inside ExampleModal when the user clicks
 * "View example" next to a photo slot in the intake form. The SVG
 * strings are mini-schematics showing what a good photo looks like —
 * framing, level, key features to capture.
 *
 * Multi-scenario entries (currently: construction) carry a `scenarios`
 * array; ExampleModal renders one tab per scenario.
 *
 * Recovered from commit d939b3a (intake guidance system deleted
 * during the May 16 Block 1 / Phase 3 Block 0.55 cleanup). SVG content
 * preserved verbatim from the original. Modal chrome restyled to the
 * Proof Sleuth navy + gold palette; the photo-example SVGs themselves
 * keep their realistic wood-tone palette — they represent what a
 * photograph of furniture looks like, not brand assets.
 *
 * Keys align with the current CORE_SLOTS keys in app/page.tsx
 * (overall_front, overall_side, underside) and the GROUP_SLOTS
 * key for construction (image_type joinery_closeup). Slots without
 * a corresponding key here render without a "View example" link.
 */

export type PhotoExampleScenario = {
  label: string;
  checks: string[];
  svg: string;
};

export type PhotoExampleEntry =
  | { title: string; tips: string[]; svg: string; scenarios?: never }
  | { title: string; scenarios: PhotoExampleScenario[]; tips?: never; svg?: never };

export const PHOTO_EXAMPLES: Record<string, PhotoExampleEntry> = {
  overall_front: {
    title: "Overall Front — Good Example",
    tips: [
      "Entire piece visible from top to bottom",
      "Camera held level, not angled up or down",
      "Legs and top both fully in frame",
      "Neutral, straight-on angle — no perspective distortion",
      "Even lighting — avoid harsh shadows across the face",
    ],
    svg: `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <rect width="200" height="220" fill="#f5efe4"/>
      <rect x="8" y="8" width="184" height="204" rx="2" fill="none" stroke="#d4c9b4" stroke-width="1" stroke-dasharray="4 3"/>
      <rect x="38" y="30" width="124" height="150" rx="2" fill="#e8dcc8" stroke="#8b6914" stroke-width="1.5"/>
      <rect x="38" y="30" width="124" height="14" rx="2" fill="#d4c4a0" stroke="#8b6914" stroke-width="1"/>
      <rect x="46" y="52" width="108" height="36" rx="1" fill="#ddd0b0" stroke="#8b6914" stroke-width="1"/>
      <circle cx="100" cy="70" r="4" fill="#8b6914"/>
      <rect x="46" y="96" width="108" height="36" rx="1" fill="#ddd0b0" stroke="#8b6914" stroke-width="1"/>
      <circle cx="100" cy="114" r="4" fill="#8b6914"/>
      <rect x="46" y="140" width="50" height="34" rx="1" fill="#ddd0b0" stroke="#8b6914" stroke-width="1"/>
      <rect x="102" y="140" width="50" height="34" rx="1" fill="#ddd0b0" stroke="#8b6914" stroke-width="1"/>
      <rect x="42" y="180" width="10" height="28" rx="1" fill="#c8b888" stroke="#8b6914" stroke-width="1"/>
      <rect x="148" y="180" width="10" height="28" rx="1" fill="#c8b888" stroke="#8b6914" stroke-width="1"/>
      <line x1="8" y1="100" x2="28" y2="100" stroke="#5a6b52" stroke-width="1.5" stroke-dasharray="3 2"/>
      <line x1="172" y1="100" x2="192" y2="100" stroke="#5a6b52" stroke-width="1.5" stroke-dasharray="3 2"/>
      <circle cx="170" cy="40" r="12" fill="#5a6b52"/>
      <path d="M164 40 l4 4 l8-8" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,
  },

  overall_side: {
    title: "Overall Side / Profile — Good Example",
    tips: [
      "Full profile visible — top to floor",
      "Depth of the piece clearly shown",
      "Leg structure and taper visible",
      "Doors or leaves closed for a clean read",
      "Stand at the same height as the piece mid-point",
    ],
    svg: `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L6,3 L0,6 z" fill="#5a6b52"/>
        </marker>
      </defs>
      <rect width="200" height="220" fill="#f5efe4"/>
      <rect x="8" y="8" width="184" height="204" rx="2" fill="none" stroke="#d4c9b4" stroke-width="1" stroke-dasharray="4 3"/>
      <rect x="70" y="30" width="60" height="150" rx="2" fill="#e8dcc8" stroke="#8b6914" stroke-width="1.5"/>
      <rect x="65" y="25" width="70" height="10" rx="1" fill="#d4c4a0" stroke="#8b6914" stroke-width="1"/>
      <line x1="130" y1="30" x2="130" y2="180" stroke="#8b6914" stroke-width="1" stroke-dasharray="3 2"/>
      <line x1="70" y1="200" x2="130" y2="200" stroke="#5a6b52" stroke-width="1.5" marker-end="url(#arr)"/>
      <text x="92" y="215" font-size="9" fill="#5a6b52" font-family="sans-serif">depth</text>
      <rect x="72" y="180" width="8" height="26" rx="1" fill="#c8b888" stroke="#8b6914" stroke-width="1"/>
      <rect x="120" y="180" width="8" height="26" rx="1" fill="#c8b888" stroke="#8b6914" stroke-width="1"/>
      <line x1="40" y1="100" x2="62" y2="100" stroke="#5a6b52" stroke-width="1.5" stroke-dasharray="3 2"/>
      <line x1="138" y1="100" x2="160" y2="100" stroke="#5a6b52" stroke-width="1.5" stroke-dasharray="3 2"/>
      <circle cx="170" cy="40" r="12" fill="#5a6b52"/>
      <path d="M164 40 l4 4 l8-8" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,
  },

  underside: {
    title: "Underside — Good Example",
    tips: [
      "Major area of the underside visible",
      "Saw marks readable across the surface",
      "Fasteners (nails, screws) included if present",
      "Drawer rails or supports visible",
      "Avoid hard shadows from a single direct light",
    ],
    svg: `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
      <rect width="200" height="220" fill="#f5efe4"/>
      <rect x="8" y="8" width="184" height="204" rx="2" fill="none" stroke="#d4c9b4" stroke-width="1" stroke-dasharray="4 3"/>
      <rect x="20" y="40" width="160" height="140" rx="2" fill="#3d2e1a"/>
      <line x1="20" y1="60" x2="180" y2="62" stroke="#5a4830" stroke-width="1" opacity="0.6"/>
      <line x1="20" y1="80" x2="180" y2="78" stroke="#5a4830" stroke-width="1" opacity="0.5"/>
      <line x1="20" y1="100" x2="180" y2="102" stroke="#5a4830" stroke-width="1" opacity="0.6"/>
      <line x1="20" y1="120" x2="180" y2="118" stroke="#5a4830" stroke-width="1" opacity="0.5"/>
      <line x1="20" y1="140" x2="180" y2="142" stroke="#5a4830" stroke-width="1" opacity="0.6"/>
      <line x1="20" y1="160" x2="180" y2="158" stroke="#5a4830" stroke-width="1" opacity="0.5"/>
      <path d="M20,50 Q100,38 180,50" stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.75"/>
      <path d="M20,68 Q100,56 180,68" stroke="#c8a060" stroke-width="1.0" fill="none" opacity="0.65"/>
      <path d="M20,86 Q100,74 180,86" stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.75"/>
      <path d="M20,104 Q100,92 180,104" stroke="#c8a060" stroke-width="1.0" fill="none" opacity="0.65"/>
      <path d="M20,122 Q100,110 180,122" stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.75"/>
      <path d="M20,140 Q100,128 180,140" stroke="#c8a060" stroke-width="1.0" fill="none" opacity="0.65"/>
      <path d="M20,158 Q100,146 180,158" stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.75"/>
      <circle cx="48" cy="56" r="2" fill="#7a6248" stroke="#3d2e1a" stroke-width="0.5"/>
      <circle cx="152" cy="56" r="2" fill="#7a6248" stroke="#3d2e1a" stroke-width="0.5"/>
      <circle cx="48" cy="164" r="2" fill="#7a6248" stroke="#3d2e1a" stroke-width="0.5"/>
      <circle cx="152" cy="164" r="2" fill="#7a6248" stroke="#3d2e1a" stroke-width="0.5"/>
      <circle cx="170" cy="200" r="12" fill="#5a6b52"/>
      <path d="M164 200 l4 4 l8-8" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,
  },

  construction: {
    title: "Construction Details — What to Photograph",
    scenarios: [
      {
        label: "Drawer Joint",
        checks: [
          "Joint fills most of the frame",
          "Pins and tails both visible",
          "Corner of the drawer box in view",
          "Sharp focus on the joint line",
        ],
        svg: `<svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <defs><linearGradient id="rl1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f5d090" stop-opacity="0.7"/><stop offset="100%" stop-color="#f5d090" stop-opacity="0"/></linearGradient></defs>
          <rect width="260" height="200" fill="#1e1610"/>
          <rect x="0" y="0" width="130" height="200" fill="#3d2e1a"/>
          <line x1="0" y1="30" x2="130" y2="32" stroke="#4a3820" stroke-width="1.2" opacity="0.6"/>
          <line x1="0" y1="60" x2="130" y2="58" stroke="#4a3820" stroke-width="1.0" opacity="0.5"/>
          <line x1="0" y1="95" x2="130" y2="97" stroke="#4a3820" stroke-width="1.2" opacity="0.6"/>
          <line x1="0" y1="130" x2="130" y2="128" stroke="#4a3820" stroke-width="0.8" opacity="0.4"/>
          <line x1="0" y1="160" x2="130" y2="162" stroke="#4a3820" stroke-width="1.0" opacity="0.5"/>
          <rect x="130" y="0" width="130" height="200" fill="#4a3820"/>
          <line x1="130" y1="25" x2="260" y2="27" stroke="#5a4830" stroke-width="1.0" opacity="0.5"/>
          <line x1="130" y1="55" x2="260" y2="53" stroke="#5a4830" stroke-width="0.8" opacity="0.4"/>
          <line x1="130" y1="85" x2="260" y2="87" stroke="#5a4830" stroke-width="1.2" opacity="0.5"/>
          <line x1="130" y1="120" x2="260" y2="118" stroke="#5a4830" stroke-width="0.8" opacity="0.4"/>
          <line x1="130" y1="155" x2="260" y2="157" stroke="#5a4830" stroke-width="1.0" opacity="0.5"/>
          <polygon points="118,0 142,0 148,40 112,40" fill="#2a1e10" stroke="#6a5030" stroke-width="0.8"/>
          <polygon points="118,54 140,54 145,94 115,94" fill="#2a1e10" stroke="#6a5030" stroke-width="0.8"/>
          <polygon points="120,108 141,108 146,148 116,148" fill="#2a1e10" stroke="#6a5030" stroke-width="0.8"/>
          <polygon points="119,162 140,162 144,200 117,200" fill="#2a1e10" stroke="#6a5030" stroke-width="0.8"/>
          <polygon points="118,0 130,0 130,20 115,20" fill="#2a1e10" stroke="#6a5030" stroke-width="0.8"/>
          <polygon points="148,40 156,40 152,54 145,54" fill="#150f08" opacity="0.55"/>
          <polygon points="145,94 153,94 149,108 142,108" fill="#150f08" opacity="0.55"/>
          <polygon points="146,148 154,148 150,162 143,162" fill="#150f08" opacity="0.55"/>
          <rect x="0" y="0" width="10" height="200" fill="url(#rl1)" opacity="0.4"/>
          <rect x="4" y="6" width="114" height="16" rx="2" fill="#1a1410" opacity="0.7"/>
          <text x="10" y="17" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Joint fills the frame</text>
          <rect x="4" y="28" width="122" height="16" rx="2" fill="#1a1410" opacity="0.7"/>
          <text x="10" y="39" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Pins and tails visible</text>
          <rect x="4" y="50" width="128" height="16" rx="2" fill="#1a1410" opacity="0.7"/>
          <text x="10" y="61" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Corner of drawer box</text>
        </svg>`,
      },
      {
        label: "Internal Rail",
        checks: [
          "Rail or brace fills the frame",
          "How it connects to the case visible",
          "Secondary wood identifiable",
          "Fasteners at joints included",
        ],
        svg: `<svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <defs><linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8d8a0" stop-opacity="0.5"/><stop offset="100%" stop-color="#e8d8a0" stop-opacity="0"/></linearGradient></defs>
          <rect width="260" height="200" fill="#1a1c12"/>
          <rect x="0" y="120" width="260" height="80" fill="#2e2e1a"/>
          <line x1="0" y1="130" x2="260" y2="132" stroke="#3a3820" stroke-width="1" opacity="0.6"/>
          <line x1="0" y1="148" x2="260" y2="146" stroke="#3a3820" stroke-width="0.8" opacity="0.5"/>
          <line x1="0" y1="164" x2="260" y2="166" stroke="#3a3820" stroke-width="1" opacity="0.6"/>
          <rect x="0" y="0" width="20" height="200" fill="#302818"/>
          <rect x="240" y="0" width="20" height="200" fill="#302818"/>
          <rect x="0" y="55" width="260" height="28" fill="#a89060" rx="1"/>
          <line x1="0" y1="62" x2="260" y2="63" stroke="#b8a070" stroke-width="0.8" opacity="0.5"/>
          <line x1="0" y1="70" x2="260" y2="69" stroke="#b8a070" stroke-width="0.6" opacity="0.4"/>
          <line x1="0" y1="76" x2="260" y2="77" stroke="#b8a070" stroke-width="0.6" opacity="0.3"/>
          <rect x="18" y="60" width="14" height="18" fill="#1a1610" rx="1"/>
          <rect x="228" y="60" width="14" height="18" fill="#1a1610" rx="1"/>
          <polygon points="20,120 52,120 20,88" fill="#8a7048" stroke="#6a5030" stroke-width="0.8"/>
          <polygon points="240,120 208,120 240,88" fill="#8a7048" stroke="#6a5030" stroke-width="0.8"/>
          <circle cx="22" cy="69" r="4" fill="#706050" stroke="#4a3820" stroke-width="0.8"/>
          <circle cx="238" cy="69" r="4" fill="#706050" stroke="#4a3820" stroke-width="0.8"/>
          <rect x="0" y="0" width="260" height="55" fill="url(#tg1)" opacity="0.25"/>
          <rect x="4" y="6" width="128" height="16" rx="2" fill="#0e100a" opacity="0.75"/>
          <text x="10" y="17" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Rail fills the frame</text>
          <rect x="4" y="28" width="140" height="16" rx="2" fill="#0e100a" opacity="0.75"/>
          <text x="10" y="39" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Connection to case visible</text>
          <rect x="4" y="50" width="146" height="16" rx="2" fill="#0e100a" opacity="0.75"/>
          <text x="10" y="61" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Secondary wood identifiable</text>
        </svg>`,
      },
      {
        label: "Saw Marks",
        checks: [
          "Marks visible across the surface",
          "Raking light reveals the texture",
          "Arc or line pattern readable",
          "No flash glare hiding the marks",
        ],
        svg: `<svg viewBox="0 0 260 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
          <defs><linearGradient id="sr1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f0d890" stop-opacity="0.7"/><stop offset="100%" stop-color="#f0d890" stop-opacity="0"/></linearGradient></defs>
          <rect width="260" height="200" fill="#2e2010"/>
          <line x1="0" y1="20" x2="260" y2="22" stroke="#382a14" stroke-width="1.5" opacity="0.7"/>
          <line x1="0" y1="45" x2="260" y2="43" stroke="#382a14" stroke-width="1.2" opacity="0.6"/>
          <line x1="0" y1="72" x2="260" y2="74" stroke="#382a14" stroke-width="1.5" opacity="0.7"/>
          <line x1="0" y1="100" x2="260" y2="98" stroke="#382a14" stroke-width="1.0" opacity="0.5"/>
          <line x1="0" y1="128" x2="260" y2="130" stroke="#382a14" stroke-width="1.5" opacity="0.7"/>
          <line x1="0" y1="158" x2="260" y2="156" stroke="#382a14" stroke-width="1.2" opacity="0.6"/>
          <line x1="0" y1="182" x2="260" y2="184" stroke="#382a14" stroke-width="1.0" opacity="0.5"/>
          <path d="M-10,8 Q80,-12 170,8"  stroke="#c8a060" stroke-width="1.4" fill="none" opacity="0.85"/>
          <path d="M-10,22 Q80,2 170,22"  stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M-10,36 Q80,16 170,36"  stroke="#c8a060" stroke-width="1.4" fill="none" opacity="0.85"/>
          <path d="M-10,50 Q80,30 170,50"  stroke="#c8a060" stroke-width="1.0" fill="none" opacity="0.7"/>
          <path d="M-10,64 Q80,44 170,64"  stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M90,0 Q180,18 270,0"   stroke="#c8a060" stroke-width="1.4" fill="none" opacity="0.85"/>
          <path d="M90,14 Q180,32 270,14"  stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M90,28 Q180,46 270,28"  stroke="#c8a060" stroke-width="1.4" fill="none" opacity="0.85"/>
          <path d="M90,42 Q180,60 270,42"  stroke="#c8a060" stroke-width="1.0" fill="none" opacity="0.7"/>
          <path d="M90,56 Q180,74 270,56"  stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M-10,78 Q80,58 170,78"  stroke="#c8a060" stroke-width="1.3" fill="none" opacity="0.8"/>
          <path d="M-10,92 Q80,72 170,92"  stroke="#c8a060" stroke-width="1.1" fill="none" opacity="0.75"/>
          <path d="M-10,106 Q80,86 170,106" stroke="#c8a060" stroke-width="1.3" fill="none" opacity="0.8"/>
          <path d="M90,70 Q180,88 270,70"  stroke="#c8a060" stroke-width="1.3" fill="none" opacity="0.8"/>
          <path d="M90,84 Q180,102 270,84"  stroke="#c8a060" stroke-width="1.1" fill="none" opacity="0.75"/>
          <path d="M90,98 Q180,116 270,98"  stroke="#c8a060" stroke-width="1.3" fill="none" opacity="0.8"/>
          <path d="M-10,120 Q80,100 170,120" stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M-10,134 Q80,114 170,134" stroke="#c8a060" stroke-width="1.0" fill="none" opacity="0.7"/>
          <path d="M-10,148 Q80,128 170,148" stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M90,112 Q180,130 270,112" stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M90,126 Q180,144 270,126" stroke="#c8a060" stroke-width="1.0" fill="none" opacity="0.7"/>
          <path d="M90,140 Q180,158 270,140" stroke="#c8a060" stroke-width="1.2" fill="none" opacity="0.8"/>
          <path d="M-10,162 Q80,142 170,162" stroke="#c8a060" stroke-width="1.1" fill="none" opacity="0.75"/>
          <path d="M-10,176 Q80,156 170,176" stroke="#c8a060" stroke-width="1.1" fill="none" opacity="0.75"/>
          <path d="M90,154 Q180,172 270,154" stroke="#c8a060" stroke-width="1.1" fill="none" opacity="0.75"/>
          <path d="M90,168 Q180,186 270,168" stroke="#c8a060" stroke-width="1.1" fill="none" opacity="0.75"/>
          <rect x="0" y="0" width="30" height="200" fill="url(#sr1)" opacity="0.35"/>
          <rect x="4" y="142" width="154" height="16" rx="2" fill="#0e0a06" opacity="0.78"/>
          <text x="10" y="153" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Marks across full surface</text>
          <rect x="4" y="162" width="158" height="16" rx="2" fill="#0e0a06" opacity="0.78"/>
          <text x="10" y="173" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ Arc pattern clearly readable</text>
          <rect x="4" y="182" width="148" height="16" rx="2" fill="#0e0a06" opacity="0.78"/>
          <text x="10" y="193" font-size="9" fill="#7ab870" font-family="sans-serif" font-weight="600">✔ No glare obscuring marks</text>
        </svg>`,
      },
    ],
  },
};
