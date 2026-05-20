/**
 * lib/constraints/styleCompatibility.ts — Pairwise style-family compatibility matrix
 *
 * Canonical authoring per appraiser direction (May 2026 session). Encodes
 * the closed-enum compatibility relationship between every pair of
 * style_family entries (lib/constraints/styleFamilies.ts) that an appraiser
 * has classified as historically meaningful. Three classes:
 *
 *   "adjacent"        — the two style families historically transitioned
 *                       into each other or co-produced in a narrow window.
 *                       Their intersection IS the transitional production
 *                       window. May link to a TransitionalPeriodEntry
 *                       (lib/constraints/transitionalPeriods.ts) for a
 *                       named-trade-period treatment in the report.
 *
 *   "stacked_revival" — the two styles are conventionally co-attributed
 *                       because one functions as an umbrella, revival
 *                       vehicle, or shared design vocabulary of the other
 *                       (e.g., Federal × Chippendale on a post-1876 piece
 *                       IS Colonial Revival Chippendale). Co-attribution
 *                       is the expected pattern, NOT diagnostic of a
 *                       transitional moment. Engine should SUPPRESS the
 *                       "transitional convergence" framing and the partner
 *                       Style row on the chart — collapse to a single
 *                       attribution label with the umbrella style.
 *
 *   "impossible"      — the two styles have no historical co-production
 *                       window (large date gap + cultural break). Joint
 *                       attribution indicates one of: reproduction,
 *                       decorator's eclectic mix, restoration mixture,
 *                       fantasy piece, or LLM mis-read. Engine should
 *                       surface as p5 conflict with reproduction-signal
 *                       framing and downgrade BOTH attribution confidences.
 *
 * Pair ordering is canonicalized via styleCompatibilityKey() so lookup
 * works regardless of which family was attributed first.
 *
 * Alias-only entries from the appraiser's authoring (e.g., Federal ×
 * Hepplewhite, Arts & Crafts × Mission, Tudor Revival × Jacobean Revival)
 * are NOT included as live entries because the named alias is not a
 * separate style_family in the canonical — it lives inside the parent
 * family's name/canonical_source_aliases. The engine therefore never emits
 * a separate attribution for the alias, and a compat entry would be a
 * no-op. Those are captured in ALIAS_DOCUMENTATION below as canonical
 * provenance for future authoring sessions.
 */

export type StyleCompatibilityClass = "adjacent" | "stacked_revival" | "impossible";

export type StyleCompatibilityEntry = {
  id: string;
  pair: [string, string]; // style_family_ids; canonicalized alphabetically
  compatibility_class: StyleCompatibilityClass;

  // For "adjacent" entries: the intersection window (used by the engine
  // when computing transitional dating). Optional; omitted when the
  // historical transition window matches the simple date intersection
  // (which the engine computes automatically) or when the pair is
  // adjacent without a clean shared window (regional overlaps, eclecticism).
  date_floor?: number;
  date_ceiling?: number;

  // For "adjacent" entries: optional FK to the canonical named
  // transitional period (lib/constraints/transitionalPeriods.ts). When
  // present, the engine uses the named period's prose + dating envelope
  // in the report instead of the generic "transitional convergence"
  // framing. Omitted for adjacent pairs that don't have a named period
  // (regional folk overlap, shared vocabulary, eclecticism, etc.).
  named_transitional_period_id?: string;

  // Free-form character of the pair beyond the 3-way enum. NOT consumed by
  // engine logic; documents the appraiser's reasoning for the
  // classification. Values used: "transitional", "shared_vocabulary",
  // "regional_folk", "victorian_eclectic", "centennial_eclectic",
  // "narrow_window", "stacked_co_attribution", "umbrella", "alias", etc.
  transition_character?: string;

  notes: string;

  // Surfaces in p5 supporting_context (adjacent) or conflicts (impossible)
  // when both families fire. Optional; defaults applied at engine layer
  // when omitted.
  diagnostic_caution_text?: string;
};

// Canonicalize a pair so lookup works regardless of input ordering.
export function styleCompatibilityKey(a: string, b: string): [string, string] {
  return a <= b ? [a, b] : [b, a];
}

export function findStyleCompatibility(a: string, b: string): StyleCompatibilityEntry | null {
  const [x, y] = styleCompatibilityKey(a, b);
  return STYLE_COMPATIBILITY.find(
    (e) => e.pair[0] === x && e.pair[1] === y
  ) ?? null;
}

export const STYLE_COMPATIBILITY: StyleCompatibilityEntry[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // ADJACENT / TRANSITIONAL (32 entries)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "style_compat_early_colonial__jacobean",
    pair: styleCompatibilityKey("style_family_early_colonial", "style_family_jacobean"),
    compatibility_class: "adjacent",
    date_floor: 1650,
    date_ceiling: 1750,
    named_transitional_period_id: "transitional_period_early_colonial_to_jacobean",
    transition_character: "early_colonial_overlap",
    notes: "Early colonial overlap rather than a clean stylistic handoff. Earliest American forms were often simplified, regional, and survival-based; Jacobean and Carolean vocabulary supplied heavier framed construction, turned supports, paneled surfaces, applied moldings, and rectangular massing. Diagnostic language emphasizes early frame-and-panel structure, heavy proportions, low stretchers, turned legs, blocky casework, and regional simplification rather than refined court-style ornament.",
    diagnostic_caution_text: "Early Colonial / Pilgrim and Jacobean / Carolean-derived vocabularies both present — consistent with mid-17th to mid-18th century American production in the early colonial overlap, not a true stylistic transition.",
  },
  {
    id: "style_compat_jacobean__william_and_mary",
    pair: styleCompatibilityKey("style_family_jacobean", "style_family_william_and_mary"),
    compatibility_class: "adjacent",
    date_floor: 1680,
    date_ceiling: 1725,
    named_transitional_period_id: "transitional_period_jacobean_to_william_and_mary",
    transition_character: "transitional",
    notes: "Heavy rectilinear Jacobean-derived construction transitions toward taller, lighter, more vertical William and Mary forms: trumpet turning, ball feet, Spanish feet, high stretchers, arched aprons, japanning, burl veneers, more architectural verticality. Transitional pieces may retain heavy joined construction while showing newer baroque leg/stretcher vocabulary.",
  },
  {
    id: "style_compat_queen_anne__william_and_mary",
    pair: styleCompatibilityKey("style_family_william_and_mary", "style_family_queen_anne"),
    compatibility_class: "adjacent",
    date_floor: 1720,
    date_ceiling: 1730,
    named_transitional_period_id: "transitional_period_william_and_mary_to_queen_anne",
    transition_character: "transitional",
    notes: "Vertical, turned, stretchered baroque furniture transitions toward smoother, lighter, curvilinear Queen Anne vocabulary. Transitional examples may combine William and Mary case proportions, stretchers, or turned legs with emerging cabriole legs, pad feet, cyma curves, shell carving, and more restrained ornament. Watch for mixed leg systems, stretcher retention, or early cabriole use on otherwise older case architecture.",
  },
  {
    id: "style_compat_pennsylvania_german__queen_anne",
    pair: styleCompatibilityKey("style_family_queen_anne", "style_family_pennsylvania_german"),
    compatibility_class: "adjacent",
    date_floor: 1720,
    date_ceiling: 1780,
    // No named_transitional_period_id — this is regional folk overlap, not a
    // true stylistic handoff with a trade-period name.
    transition_character: "regional_folk",
    notes: "Regional co-occurrence rather than a mainstream style transition. Pennsylvania German furniture often absorbed Baroque and Queen Anne-era shapes while retaining painted decoration, folk motifs, dower-chest traditions, and regional iconography. The diagnostic distinction is that Queen Anne is a high-style Anglo-American vocabulary, while Pennsylvania German is a regional ethnic and folk tradition that may borrow curves, feet, or proportions without becoming formal Queen Anne.",
    diagnostic_caution_text: "Queen Anne curves or feet on a piece showing Pennsylvania German painted decoration, folk motifs, or dower-chest construction is regional folk vocabulary, not a true stylistic transition.",
  },
  {
    id: "style_compat_chippendale__queen_anne",
    pair: styleCompatibilityKey("style_family_queen_anne", "style_family_chippendale"),
    compatibility_class: "adjacent",
    date_floor: 1750,
    date_ceiling: 1780,
    named_transitional_period_id: "transitional_period_queen_anne_to_chippendale",
    transition_character: "transitional",
    notes: "Queen Anne curvilinear form preserved while adding ornamental, architectural, Rococo-influenced Chippendale vocabulary: cabriole legs continuing alongside heavier carving, claw-and-ball feet, pierced splats, Gothic or Chinese fretwork, more elaborate pediments, stronger mahogany use in high-style examples. Transitional attribution is reasonable when form is Queen Anne in silhouette but Chippendale in ornament intensity.",
  },
  {
    id: "style_compat_chippendale__louis_xvi_french_neoclassical",
    pair: styleCompatibilityKey("style_family_chippendale", "style_family_louis_xvi_french_neoclassical"),
    compatibility_class: "adjacent",
    date_floor: 1770,
    date_ceiling: 1785,
    // No named period — the appraiser flagged this as not having a fixed
    // American trade name; mostly elite/import-influenced contexts.
    transition_character: "narrow_window",
    notes: "Narrow high-style overlap where late Rococo Chippendale ornament begins to coexist with French neoclassical restraint: reduced Rococo carving, straighter lines, tapered legs, fluting, classical medallions, rosettes, urns, more disciplined symmetry. In American furniture, treat cautiously — French Louis XVI influence is more often a design source than a broad domestic production category.",
  },
  {
    id: "style_compat_chippendale__federal",
    pair: styleCompatibilityKey("style_family_chippendale", "style_family_federal"),
    compatibility_class: "adjacent",
    date_floor: 1780,
    date_ceiling: 1785,
    named_transitional_period_id: "transitional_period_chippendale_to_federal",
    transition_character: "transitional",
    notes: "Heavier Rococo, Gothic, and Chinese Chippendale vocabulary transitions toward lighter, straighter, elliptical, classical Federal idiom. Transitional pieces may show Chippendale case massing or chair splat traditions combined with Federal inlay, tapered legs, bellflowers, ovals, urns, stringing. Key diagnostic contrast: carved sculptural ornament vs. planar inlaid neoclassical ornament. Regional conservatism may extend the window later.",
  },
  {
    id: "style_compat_federal__louis_xvi_french_neoclassical",
    pair: styleCompatibilityKey("style_family_federal", "style_family_louis_xvi_french_neoclassical"),
    compatibility_class: "adjacent",
    date_floor: 1780,
    date_ceiling: 1810,
    // No named period — the appraiser flagged this as shared neoclassical
    // vocabulary, not a transition. Co-attribution is influence-level.
    transition_character: "shared_vocabulary",
    notes: "Shared neoclassical zone, not a transition. Louis XVI supplies French classical restraint (straight legs, fluting, rosettes, medallions, architectural symmetry); Federal / Adam / Hepplewhite / Sheraton translates related neoclassical vocabulary into Anglo-American furniture. Co-attribution should usually be phrased as influence or shared vocabulary rather than two independent American production styles unless the piece is clearly French or French-derived.",
    diagnostic_caution_text: "Louis XVI / French Neoclassical and Federal / Adam / Hepplewhite / Sheraton both attribute to this piece — these are shared neoclassical vocabularies of the same period, not a stylistic transition. Co-attribution typically indicates Anglo-American neoclassical production influenced by French sources.",
  },
  {
    id: "style_compat_american_classical__federal",
    pair: styleCompatibilityKey("style_family_federal", "style_family_american_classical"),
    compatibility_class: "adjacent",
    date_floor: 1810,
    date_ceiling: 1840,
    named_transitional_period_id: "transitional_period_federal_to_american_classical",
    transition_character: "transitional",
    notes: "One of the most important early American transitions. Federal is lighter, linear, inlaid, elliptical; American Classical / Empire becomes heavier, more sculptural, more archaeological, more Greco-Roman. Transitional overlap includes Federal case restraint with emerging scroll supports, paw feet, columns, lyres, brass mounts, saber legs, stronger mahogany surfaces. Transitional pieces often retain Federal proportions but introduce bolder Greco-Roman support vocabulary. Strongest transition c. 1815–1830.",
  },
  {
    id: "style_compat_american_classical__gothic_revival",
    pair: styleCompatibilityKey("style_family_american_classical", "style_family_gothic_revival"),
    compatibility_class: "adjacent",
    date_floor: 1840,
    date_ceiling: 1850,
    named_transitional_period_id: "transitional_period_american_classical_to_gothic_revival",
    transition_character: "transitional",
    notes: "Classical mass, scrolls, columns, and paw feet transition toward pointed arches, tracery, crockets, trefoils, quatrefoils, vertical medievalized ornament. Transitional examples may keep heavy Empire case mass or scroll supports while adding Gothic panels, pointed moldings, church-like architectural details. Diagnostic question: still fundamentally classical with Gothic trim, or truly Gothic Revival in structure and design intent.",
  },
  {
    id: "style_compat_gothic_revival__rococo_revival",
    pair: styleCompatibilityKey("style_family_gothic_revival", "style_family_rococo_revival"),
    compatibility_class: "adjacent",
    date_floor: 1845,
    date_ceiling: 1870,
    // No named period — Victorian eclecticism, not a stylistic merger.
    transition_character: "victorian_eclectic",
    notes: "Both belong to early/high Victorian decorative expansion but draw from different historical sources. Gothic Revival uses verticality, pointed arches, tracery, medieval architecture; Rococo Revival uses scrolling, naturalistic carving, cabriole curves, laminated rosewood, cartouches, flowers, grapes, C-scrolls. Co-occurrence usually signals Victorian eclecticism rather than a true style merger.",
    diagnostic_caution_text: "Gothic Revival and Rococo Revival vocabularies both present — consistent with early/high Victorian eclecticism c. 1845–1870, not a unified stylistic transition.",
  },
  {
    id: "style_compat_renaissance_revival__rococo_revival",
    pair: styleCompatibilityKey("style_family_rococo_revival", "style_family_renaissance_revival"),
    compatibility_class: "adjacent",
    date_floor: 1860,
    date_ceiling: 1875,
    named_transitional_period_id: "transitional_period_rococo_to_renaissance_revival",
    transition_character: "transitional",
    notes: "Fluid, asymmetrical, naturalistic Rococo Revival carving transitions toward heavier, architectural, rectilinear, classical mass of Renaissance Revival. Transitional pieces may retain carved fruit, flowers, scrolls while adding columns, pediments, incised panels, masks, medallions, burl panels, more formal case architecture. Diagnostic wording emphasizes the balance between organic carving and architectural monumentality.",
  },
  {
    id: "style_compat_eastlake__renaissance_revival",
    pair: styleCompatibilityKey("style_family_renaissance_revival", "style_family_eastlake"),
    compatibility_class: "adjacent",
    date_floor: 1870,
    date_ceiling: 1885,
    named_transitional_period_id: "transitional_period_renaissance_revival_to_eastlake",
    transition_character: "transitional",
    notes: "Heavy, carved, Renaissance-inspired monumentality transitions toward flatter, more rectilinear Eastlake ornament. Diagnostic overlap: large case forms with architectural mass but with incised lines, geometric carving, spoon carving, shallow relief, chamfered edges, applied panels replacing deep sculptural carving. Key distinction: carved depth + classical monumentality vs. machine-aided linear ornament + reform-era geometry.",
  },
  {
    id: "style_compat_aesthetic_movement__eastlake",
    pair: styleCompatibilityKey("style_family_eastlake", "style_family_aesthetic_movement"),
    compatibility_class: "adjacent",
    date_floor: 1870,
    date_ceiling: 1890,
    named_transitional_period_id: "transitional_period_eastlake_aesthetic_movement",
    transition_character: "stacked_co_attribution",
    notes: "Strong co-attribution zone in high Victorian furniture. Eastlake contributes rectilinear reform geometry, incising, chamfering, shallow machine carving; Aesthetic Movement adds asymmetry, ebonized surfaces, gilt incising, stylized natural motifs, bamboo-like turnings, Japanese fans, birds, flowers, open display arrangements. Allow overlap when piece shows reform-era geometry plus Japanesque or art-for-art's-sake ornament.",
  },
  {
    id: "style_compat_colonial_revival__eastlake",
    pair: styleCompatibilityKey("style_family_eastlake", "style_family_colonial_revival"),
    compatibility_class: "adjacent",
    date_floor: 1876,
    date_ceiling: 1890,
    // No named period — Centennial-era eclectic rather than a named transition.
    transition_character: "centennial_eclectic",
    notes: "Overlap because the Centennial period created renewed interest in colonial forms while Eastlake remained commercially active. Pieces may show Eastlake incising, geometric panels, and reform ornament on forms that nod toward earlier American furniture. Should NOT be called a pure colonial revival if visual weight, hardware, and ornament remain late Victorian.",
    diagnostic_caution_text: "Eastlake and Colonial Revival vocabularies both present — consistent with Centennial-era eclectic production c. 1876–1890. Watch for late-Victorian weight, hardware, and ornament that indicate this is not a pure Colonial Revival piece.",
  },
  {
    id: "style_compat_arts_and_crafts__eastlake",
    pair: styleCompatibilityKey("style_family_eastlake", "style_family_arts_and_crafts"),
    compatibility_class: "adjacent",
    date_floor: 1890,
    date_ceiling: 1900,
    named_transitional_period_id: "transitional_period_eastlake_to_arts_and_crafts",
    transition_character: "transitional",
    notes: "Visually important for factory oak pieces. Eastlake's incised, rectilinear, machine-friendly surface ornament gives way to heavier, plainer, exposed-joinery, quarter-sawn oak vocabulary of Mission and Arts and Crafts. Transitional examples may have straight posts, blocky proportions, oak construction, geometric layouts but still retain incised floral or linear decoration. This zone is especially vulnerable to overcalling pieces as original Mission when they are actually late Victorian or Golden Oak-era transitional factory furniture.",
  },
  {
    id: "style_compat_aesthetic_movement__arts_and_crafts",
    pair: styleCompatibilityKey("style_family_aesthetic_movement", "style_family_arts_and_crafts"),
    compatibility_class: "adjacent",
    date_floor: 1895,
    date_ceiling: 1915,
    named_transitional_period_id: "transitional_period_aesthetic_movement_to_arts_and_crafts",
    transition_character: "transitional",
    notes: "Aesthetic Movement's Japanesque interest continues into Arts and Crafts through simplicity, exposed structure, flat planes, stylized nature, honest materials. Diagnostic overlap: ebonized or dark surfaces, asymmetry, open shelving, Japanese-inspired brackets, restrained carving, rectilinear structure. Aesthetic examples more decorative and art-display oriented; Arts and Crafts examples more material-centered, joinery-centered, reformist.",
  },
  {
    id: "style_compat_art_nouveau__arts_and_crafts",
    pair: styleCompatibilityKey("style_family_art_nouveau", "style_family_arts_and_crafts"),
    compatibility_class: "adjacent",
    date_floor: 1895,
    date_ceiling: 1915,
    // No named period — not usually a single American trade name.
    transition_character: "transitional",
    notes: "Organic reform impulses from two different directions. Art Nouveau favors sinuous, whiplash, botanical, flowing asymmetry; Arts and Crafts favors rectilinear structure, visible joinery, material honesty, craft reform. Transitional or hybrid examples may show plain oak or handcraft construction with stylized floral carving, flowing inlays, copper strapwork, or organic pierced designs.",
  },
  // Colonial-Revival × earlier-American pairs are STACKED_REVIVAL, not adjacent
  // (per the appraiser's section-3 reclassification). Authored in the
  // STACKED_REVIVAL block below; not duplicated here.
  {
    id: "style_compat_arts_and_crafts__tudor_revival",
    pair: styleCompatibilityKey("style_family_tudor_revival", "style_family_arts_and_crafts"),
    compatibility_class: "adjacent",
    date_floor: 1900,
    date_ceiling: 1920,
    named_transitional_period_id: "transitional_period_tudor_to_arts_and_crafts",
    transition_character: "transitional",
    notes: "Shared taste for oak, visible structure, medievalism, anti-industrial historical craft references. Tudor/Jacobean Revival contributes turned legs, bulbous supports, strapwork, linenfold panels, dark oak, Elizabethan massing; Arts and Crafts contributes rectilinear simplicity, exposed joinery, handcraft rhetoric, quarter-sawn oak. Allow co-attribution when medieval revival ornament is placed on Arts and Crafts construction or proportions.",
  },
  {
    id: "style_compat_arts_and_crafts__spanish_colonial_revival",
    pair: styleCompatibilityKey("style_family_spanish_colonial_revival", "style_family_arts_and_crafts"),
    compatibility_class: "adjacent",
    date_floor: 1895,
    date_ceiling: 1940,
    named_transitional_period_id: "transitional_period_arts_and_crafts_spanish_colonial",
    transition_character: "shared_vocabulary",
    notes: "Partly same-vocabulary overlap because 'Mission' appears in both Arts and Crafts / Mission / Craftsman family AND Spanish Colonial / Mission / Mediterranean Revival family. Diagnostic distinction depends on whether piece is rectilinear Craftsman oak furniture or Spanish/California Mission architecture-derived furniture with arches, leather, ironwork, plank forms, southwestern or monastic cues. Co-attribution expected when a piece uses Mission vocabulary broadly. Strongest Mission overlap c. 1895–1920; broader Spanish/Mediterranean c. 1915–1940.",
  },
  {
    id: "style_compat_arts_and_crafts__rustic",
    pair: styleCompatibilityKey("style_family_arts_and_crafts", "style_family_rustic"),
    compatibility_class: "adjacent",
    date_floor: 1895,
    date_ceiling: 1930,
    named_transitional_period_id: "transitional_period_rustic_arts_and_crafts",
    transition_character: "shared_vocabulary",
    notes: "Both traditions value material honesty and visible structure. Rustic/Adirondack emphasizes branches, logs, bark, twig work, lodge scale, camp identity; Arts and Crafts emphasizes designed rectilinear joinery and craft discipline. Overlap expected in lodge interiors where Mission-style oak or Craftsman forms are adapted to rustic settings.",
  },
  {
    id: "style_compat_art_deco__arts_and_crafts",
    pair: styleCompatibilityKey("style_family_arts_and_crafts", "style_family_art_deco"),
    compatibility_class: "adjacent",
    date_floor: 1925,
    date_ceiling: 1930,
    named_transitional_period_id: "transitional_period_arts_and_crafts_to_art_deco",
    transition_character: "transitional",
    notes: "Exposed joinery, plain oak, rectilinear craft honesty, Mission massing transitions toward sleeker geometry, veneers, stepped forms, waterfall fronts, exotic woods, machine-age ornament. Transitional examples may retain sturdy Craftsman proportions or oak construction while introducing stepped profiles, decorative veneers, simplified Deco geometry. High-value diagnostic zone for avoiding false 'Mission' calls on later factory pieces. Utility/Depression overlap extends c. 1920–1940.",
  },
  {
    id: "style_compat_art_deco__streamline_moderne",
    pair: styleCompatibilityKey("style_family_art_deco", "style_family_streamline_moderne"),
    compatibility_class: "adjacent",
    date_floor: 1930,
    date_ceiling: 1945,
    named_transitional_period_id: "transitional_period_art_deco_to_streamline_moderne",
    transition_character: "transitional",
    notes: "Streamline Moderne IS the named later Deco transition. Art Deco uses stepped geometry, sunbursts, chevrons, exotic veneers, vertical glamour; Streamline favors rounded corners, horizontal bands, waterfall edges, chrome, speed lines, machine-age aerodynamic form. Co-attribution expected when piece has Deco glamour but Streamline curves and horizontal motion.",
  },
  {
    id: "style_compat_mid_century_modern__streamline_moderne",
    pair: styleCompatibilityKey("style_family_streamline_moderne", "style_family_mid_century_modern"),
    compatibility_class: "adjacent",
    date_floor: 1940,
    date_ceiling: 1945,
    named_transitional_period_id: "transitional_period_streamline_to_mid_century_modern",
    transition_character: "transitional",
    notes: "Prewar aerodynamic modernism into postwar functional modernism. Streamline retains rounded corners, horizontal speed, waterfall edges, machine-age surfaces; MCM becomes lighter, more modular, more biomorphic or Scandinavian-influenced, often uses tapered legs, plywood, molded forms, cleaner silhouettes. Transitional pieces can show rounded Deco/Streamline cases with emerging postwar leg and hardware treatments. Visual carryover into early postwar production.",
  },
  {
    id: "style_compat_hollywood_regency__mid_century_modern",
    pair: styleCompatibilityKey("style_family_hollywood_regency", "style_family_mid_century_modern"),
    compatibility_class: "adjacent",
    date_floor: 1940,
    date_ceiling: 1965,
    named_transitional_period_id: "transitional_period_hollywood_regency_mid_century",
    transition_character: "stacked_co_attribution",
    notes: "Co-production and design-layer overlap rather than a pure chronological transition. Hollywood Regency adds glamour, lacquer, brass, glass, mirrored surfaces, faux bamboo, neoclassical motifs, theatrical scale; Mid-Century Modern adds clean silhouettes, tapered legs, modularity, modern materials. Co-attribution reasonable where piece has modern construction and proportions but glamorous Regency surface language.",
  },
  {
    id: "style_compat_art_deco__hollywood_regency",
    pair: styleCompatibilityKey("style_family_art_deco", "style_family_hollywood_regency"),
    compatibility_class: "adjacent",
    date_floor: 1930,
    date_ceiling: 1945,
    // No named period — glamour overlap, not direct evolutionary transition.
    transition_character: "shared_vocabulary",
    notes: "Combines Art Deco's geometry and luxury materials with Hollywood Regency's theatrical glamour and neoclassical borrowing. Diagnostic cues: lacquer, mirrored surfaces, gilding, brass, glass, geometric ornament, dramatic contrast. Should be framed as a glamour overlap rather than direct evolutionary transition.",
  },
  {
    id: "style_compat_mid_century_modern__postmodern",
    pair: styleCompatibilityKey("style_family_mid_century_modern", "style_family_postmodern"),
    compatibility_class: "adjacent",
    // Date ranges DO NOT mathematically overlap by canonical (MCM 1940-1970,
    // Postmodern 1980-1995). This is a narrow late-1970s/early-1980s
    // transition window that the appraiser explicitly called out.
    date_floor: 1978,
    date_ceiling: 1985,
    // No named period — narrow window, easy to misread.
    transition_character: "narrow_window",
    notes: "Canonical ranges do not overlap. Transition occurs as late modern austerity gives way to irony, color, asymmetry, historical quotation, laminate, playful geometry, and Memphis/Radical Design influence. Treat as a tight transition only when evidence supports late 1970s or early 1980s production. Otherwise, MCM + Postmodern should be flagged as revival, later reinterpretation, or misread.",
    diagnostic_caution_text: "Mid-Century Modern and Postmodern attribution both fire — these canonical periods do not mathematically overlap. Co-attribution is only consistent with a narrow late-1970s to early-1980s transitional window; otherwise treat as MCM revival, Postmodern quotation of MCM vocabulary, or LLM misread.",
  },
  {
    id: "style_compat_contemporary_transitional__postmodern",
    pair: styleCompatibilityKey("style_family_postmodern", "style_family_contemporary_transitional"),
    compatibility_class: "adjacent",
    date_floor: 1990,
    date_ceiling: 1995,
    named_transitional_period_id: "transitional_period_postmodern_to_contemporary_transitional",
    transition_character: "transitional",
    notes: "High-contrast, ironic, sculptural Postmodern design transitions toward softer, marketable transitional furniture that blends traditional silhouettes with simplified modern surfaces. Diagnostic overlap: playful proportions, exaggerated historical references, laminate or commercial finishes, simplified mass-market eclecticism. By late 1990s/2000s, more aggressive Memphis language usually gives way to safer transitional traditional design.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // IMPOSSIBLE / HISTORICALLY INCOMPATIBLE ORIGINAL-PERIOD PAIRS (20 entries)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: "style_compat_american_classical__art_deco",
    pair: styleCompatibilityKey("style_family_american_classical", "style_family_art_deco"),
    compatibility_class: "impossible",
    notes: "Original American Classical / Empire production ends c. 1850; Art Deco begins c. 1925. ~75-year gap and major cultural break from Greco-Roman classical to machine-age modern design.",
    diagnostic_caution_text: "American Classical / Empire (c. 1810–1850) and Art Deco (c. 1925–1945) both attribute to this piece, but they did not historically co-occur. This typically indicates a reproduction, decorator's eclectic mix, restoration mixture, or LLM mis-read.",
  },
  {
    id: "style_compat_louis_xvi_french_neoclassical__mid_century_modern",
    pair: styleCompatibilityKey("style_family_louis_xvi_french_neoclassical", "style_family_mid_century_modern"),
    compatibility_class: "impossible",
    notes: "Louis XVI / French Neoclassical c. 1770–1810; Mid-Century Modern begins c. 1940. Original-period co-occurrence is impossible outside revival or later reinterpretation.",
    diagnostic_caution_text: "Louis XVI / French Neoclassical (c. 1770–1810) and Mid-Century Modern (c. 1940–1970) both attribute to this piece — these periods do not overlap. Likely reproduction, eclectic mix, or LLM mis-read.",
  },
  {
    id: "style_compat_federal__postmodern",
    pair: styleCompatibilityKey("style_family_federal", "style_family_postmodern"),
    compatibility_class: "impossible",
    notes: "Federal production c. 1780–1840; Postmodern / Memphis begins c. 1980. ~140-year cultural and production gap.",
  },
  {
    id: "style_compat_art_deco__chippendale",
    pair: styleCompatibilityKey("style_family_chippendale", "style_family_art_deco"),
    compatibility_class: "impossible",
    notes: "Original Chippendale ends c. 1785; Art Deco begins c. 1925. Co-attribution indicates revival, reproduction, or later eclectic design.",
  },
  {
    id: "style_compat_chippendale__mid_century_modern",
    pair: styleCompatibilityKey("style_family_chippendale", "style_family_mid_century_modern"),
    compatibility_class: "impossible",
    notes: "Original Chippendale is 18th century; MCM is post-1940 modernist. Any overlap is revival vocabulary on a later piece, not original co-production.",
  },
  {
    id: "style_compat_chippendale__postmodern",
    pair: styleCompatibilityKey("style_family_chippendale", "style_family_postmodern"),
    compatibility_class: "impossible",
    notes: "Date gap from original Chippendale to Postmodern design is nearly two centuries; cultural break is extreme.",
  },
  {
    id: "style_compat_art_deco__early_colonial",
    pair: styleCompatibilityKey("style_family_early_colonial", "style_family_art_deco"),
    compatibility_class: "impossible",
    notes: "Early Colonial ends c. 1750; Art Deco begins c. 1925. Cannot co-occur except as revival, reproduction, or decorative borrowing.",
  },
  {
    id: "style_compat_early_colonial__mid_century_modern",
    pair: styleCompatibilityKey("style_family_early_colonial", "style_family_mid_century_modern"),
    compatibility_class: "impossible",
    notes: "Early Colonial and MCM separated by nearly two centuries and opposite design systems.",
  },
  {
    id: "style_compat_jacobean__streamline_moderne",
    pair: styleCompatibilityKey("style_family_jacobean", "style_family_streamline_moderne"),
    compatibility_class: "impossible",
    notes: "Jacobean / Carolean-derived colonial ends c. 1770; Streamline Moderne begins c. 1930. Major date and design-culture break.",
  },
  {
    id: "style_compat_art_deco__william_and_mary",
    pair: styleCompatibilityKey("style_family_william_and_mary", "style_family_art_deco"),
    compatibility_class: "impossible",
    notes: "William and Mary ends c. 1725; Art Deco begins c. 1925. Co-attribution must be revival or fantasy, not original-period overlap.",
  },
  {
    id: "style_compat_queen_anne__streamline_moderne",
    pair: styleCompatibilityKey("style_family_queen_anne", "style_family_streamline_moderne"),
    compatibility_class: "impossible",
    notes: "Original Queen Anne ends c. 1780; Streamline Moderne begins c. 1930. Original co-occurrence impossible.",
  },
  {
    id: "style_compat_art_deco__federal",
    pair: styleCompatibilityKey("style_family_federal", "style_family_art_deco"),
    compatibility_class: "impossible",
    notes: "Federal ends c. 1840; Art Deco begins c. 1925. A piece may be Federal Revival or Deco-neoclassical, but not original Federal AND original Deco.",
  },
  {
    id: "style_compat_american_classical__mid_century_modern",
    pair: styleCompatibilityKey("style_family_american_classical", "style_family_mid_century_modern"),
    compatibility_class: "impossible",
    notes: "American Classical / Empire ends c. 1850; MCM begins c. 1940. Original co-attribution historically impossible.",
  },
  {
    id: "style_compat_gothic_revival__mid_century_modern",
    pair: styleCompatibilityKey("style_family_gothic_revival", "style_family_mid_century_modern"),
    compatibility_class: "impossible",
    notes: "Gothic Revival has later institutional survivals into early 20th century but does not naturally overlap original MCM production. Co-attribution usually indicates revival, ecclesiastical continuity, or later eclecticism.",
  },
  {
    id: "style_compat_postmodern__rococo_revival",
    pair: styleCompatibilityKey("style_family_rococo_revival", "style_family_postmodern"),
    compatibility_class: "impossible",
    notes: "Rococo Revival's original + afterwave periods end by early 20th century; Postmodern begins c. 1980. Pair requires later revival or ironic quotation.",
  },
  {
    id: "style_compat_mid_century_modern__renaissance_revival",
    pair: styleCompatibilityKey("style_family_renaissance_revival", "style_family_mid_century_modern"),
    compatibility_class: "impossible",
    notes: "Renaissance Revival production ends c. 1885; MCM begins c. 1940. Major historical and aesthetic break.",
  },
  {
    id: "style_compat_eastlake__mid_century_modern",
    pair: styleCompatibilityKey("style_family_eastlake", "style_family_mid_century_modern"),
    compatibility_class: "impossible",
    notes: "Eastlake / Modern Gothic original production ends c. 1890; MCM begins c. 1940. Shared rectilinearity alone is not enough to support co-attribution.",
  },
  {
    id: "style_compat_aesthetic_movement__postmodern",
    pair: styleCompatibilityKey("style_family_aesthetic_movement", "style_family_postmodern"),
    compatibility_class: "impossible",
    notes: "Original Aesthetic / Japanesque ends c. 1895; Postmodern begins c. 1980. Overlap would be later revival or quotation, not original co-production.",
  },
  {
    id: "style_compat_arts_and_crafts__postmodern",
    pair: styleCompatibilityKey("style_family_arts_and_crafts", "style_family_postmodern"),
    compatibility_class: "impossible",
    notes: "Original Arts and Crafts ends c. 1930; Postmodern begins c. 1980. Combined reading should be treated as revival, reproduction, or eclectic later design.",
  },
  {
    id: "style_compat_postmodern__streamline_moderne",
    pair: styleCompatibilityKey("style_family_streamline_moderne", "style_family_postmodern"),
    compatibility_class: "impossible",
    notes: "Streamline Moderne ends c. 1945; Postmodern begins c. 1980. Co-attribution requires later Neo-Deco or retro-futurist revival, not original production.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // STACKED REVIVAL / EXPECTED CO-ATTRIBUTION (real-id pairs only)
  // ═══════════════════════════════════════════════════════════════════════
  // The appraiser's section-3 list includes alias-only pairs (e.g.,
  // Federal × Hepplewhite, Arts & Crafts × Mission) where one side is part
  // of the other side's compound family name. Those are NOT separate
  // attributions in the engine; they are documented in ALIAS_DOCUMENTATION
  // below for canonical provenance. The entries here are pairs where both
  // sides reference real, distinct style_family ids.
  {
    id: "style_compat_colonial_revival__early_colonial",
    pair: styleCompatibilityKey("style_family_colonial_revival", "style_family_early_colonial"),
    compatibility_class: "stacked_revival",
    transition_character: "umbrella",
    notes: "Colonial Revival intentionally revives early American / Pilgrim / seventeenth-century vocabulary on post-1876 furniture.",
  },
  {
    id: "style_compat_colonial_revival__jacobean",
    pair: styleCompatibilityKey("style_family_colonial_revival", "style_family_jacobean"),
    compatibility_class: "stacked_revival",
    transition_character: "umbrella",
    notes: "Colonial Revival can reuse Jacobean-derived early colonial forms, especially in Centennial, Depression Maple, Early American, and heritage furniture.",
  },
  {
    id: "style_compat_colonial_revival__william_and_mary",
    pair: styleCompatibilityKey("style_family_colonial_revival", "style_family_william_and_mary"),
    compatibility_class: "stacked_revival",
    transition_character: "umbrella",
    notes: "William and Mary Revival is an expected Colonial Revival sub-vocabulary, especially after 1880.",
  },
  {
    id: "style_compat_colonial_revival__queen_anne",
    pair: styleCompatibilityKey("style_family_colonial_revival", "style_family_queen_anne"),
    compatibility_class: "stacked_revival",
    transition_character: "umbrella",
    notes: "Queen Anne Revival is a common Colonial Revival expression, especially in dining, occasional, and bedroom furniture.",
  },
  {
    id: "style_compat_chippendale__colonial_revival",
    pair: styleCompatibilityKey("style_family_chippendale", "style_family_colonial_revival"),
    compatibility_class: "stacked_revival",
    transition_character: "umbrella",
    notes: "Chippendale Revival is one of the most common Colonial Revival vocabularies, especially in mahogany dining and case furniture.",
  },
  {
    id: "style_compat_colonial_revival__federal",
    pair: styleCompatibilityKey("style_family_colonial_revival", "style_family_federal"),
    compatibility_class: "stacked_revival",
    transition_character: "umbrella",
    notes: "Federal Revival, Sheraton Revival, and Hepplewhite Revival are core Colonial Revival expressions after 1876.",
  },
  {
    id: "style_compat_american_classical__colonial_revival",
    pair: styleCompatibilityKey("style_family_american_classical", "style_family_colonial_revival"),
    compatibility_class: "stacked_revival",
    transition_character: "umbrella",
    notes: "Empire / Duncan Phyfe Revival often functions inside broader Colonial Revival or traditional revival markets.",
  },
  {
    id: "style_compat_federal__hollywood_regency",
    pair: styleCompatibilityKey("style_family_hollywood_regency", "style_family_federal"),
    compatibility_class: "stacked_revival",
    transition_character: "surface_vocabulary",
    notes: "Hollywood Regency often stacks neoclassical, Federal, Sheraton, and Regency motifs onto twentieth-century glamour furniture. Co-attribution expected when construction is modern.",
  },
  {
    id: "style_compat_american_classical__hollywood_regency",
    pair: styleCompatibilityKey("style_family_hollywood_regency", "style_family_american_classical"),
    compatibility_class: "stacked_revival",
    transition_character: "surface_vocabulary",
    notes: "Hollywood Regency frequently borrows classical, Empire, Greek, Roman, and Regency motifs as surface vocabulary rather than original-period construction evidence.",
  },
  {
    id: "style_compat_colonial_revival__contemporary_transitional",
    pair: styleCompatibilityKey("style_family_contemporary_transitional", "style_family_colonial_revival"),
    compatibility_class: "stacked_revival",
    transition_character: "umbrella",
    notes: "Contemporary New Traditional and Grandmillennial furniture often reuses Colonial Revival vocabulary in a late 20th / early 21st century eclectic context.",
  },
  {
    id: "style_compat_contemporary_transitional__federal",
    pair: styleCompatibilityKey("style_family_contemporary_transitional", "style_family_federal"),
    compatibility_class: "stacked_revival",
    transition_character: "surface_vocabulary",
    notes: "New Traditional furniture commonly revives Federal, Hepplewhite, Sheraton, and Adam motifs as heritage vocabulary.",
  },
  {
    id: "style_compat_chippendale__contemporary_transitional",
    pair: styleCompatibilityKey("style_family_contemporary_transitional", "style_family_chippendale"),
    compatibility_class: "stacked_revival",
    transition_character: "surface_vocabulary",
    notes: "Chippendale-style legs, splats, fretwork, and pediments commonly reappear in New Traditional and Eclectic Historicist furniture.",
  },
  {
    id: "style_compat_contemporary_transitional__queen_anne",
    pair: styleCompatibilityKey("style_family_contemporary_transitional", "style_family_queen_anne"),
    compatibility_class: "stacked_revival",
    transition_character: "surface_vocabulary",
    notes: "Queen Anne cabriole legs, pad feet, and curved silhouettes are frequently revived in contemporary traditional furniture.",
  },
  {
    id: "style_compat_contemporary_transitional__tudor_revival",
    pair: styleCompatibilityKey("style_family_contemporary_transitional", "style_family_tudor_revival"),
    compatibility_class: "stacked_revival",
    transition_character: "surface_vocabulary",
    notes: "Dark Academia, Heritage Eclectic, and New Traditional interiors often revive Tudor / Jacobean massing, dark finishes, and library furniture cues.",
  },
  {
    id: "style_compat_contemporary_transitional__rococo_revival",
    pair: styleCompatibilityKey("style_family_contemporary_transitional", "style_family_rococo_revival"),
    compatibility_class: "stacked_revival",
    transition_character: "surface_vocabulary",
    notes: "French Country, Shabby Chic, and Grandmillennial design often reuse Rococo Revival or French Provincial curves as decorative revival vocabulary.",
  },
  {
    id: "style_compat_art_deco__postmodern",
    pair: styleCompatibilityKey("style_family_art_deco", "style_family_postmodern"),
    compatibility_class: "stacked_revival",
    transition_character: "revival_continuation",
    notes: "1980s Postmodern design often revives Deco geometry, glamour, stepped forms, and bold contrast. Neo-Deco / Postmodern Deco is stacked revival rather than original Deco.",
  },
  {
    id: "style_compat_aesthetic_movement__mid_century_modern",
    pair: styleCompatibilityKey("style_family_mid_century_modern", "style_family_aesthetic_movement"),
    compatibility_class: "stacked_revival",
    transition_character: "revival_continuation",
    notes: "Mid-century Japanese-modern influence is a revival / continuation of Japanese design interest, not original Aesthetic Movement production.",
  },
  {
    id: "style_compat_aesthetic_movement__contemporary_transitional",
    pair: styleCompatibilityKey("style_family_contemporary_transitional", "style_family_aesthetic_movement"),
    compatibility_class: "stacked_revival",
    transition_character: "revival_continuation",
    notes: "Japandi and contemporary Japanese minimalism revive or reinterpret Japanesque design principles in a modern context, not as original Aesthetic Movement furniture.",
  },
];

// ─────────────────────────────────────────────────────────────────────────
// Documentation-only: alias-side stacked-revival pairs from the appraiser's
// section-3 authoring that reference compound-family aliases (Hepplewhite,
// Sheraton, Adam, Mission, Craftsman, Mission Revival, Mediterranean
// Revival, Jacobean Revival, Elizabethan Revival, Tudor Revival,
// Adirondack, Western Ranch) rather than separate style_family ids. These
// aliases live inside the parent family's name / canonical_source_aliases
// and the engine never emits a separate attribution for them. Captured
// here for canonical provenance — if any of these aliases ever gets
// promoted to its own style_family entry, the corresponding compat
// relationship can be moved into STYLE_COMPATIBILITY above.
// ─────────────────────────────────────────────────────────────────────────
export const ALIAS_DOCUMENTATION = {
  "Federal × Hepplewhite": "Hepplewhite is part of the canonical Federal / Adam / Hepplewhite / Sheraton family name; not a separate attribution.",
  "Federal × Sheraton": "Sheraton is part of the canonical Federal / Adam / Hepplewhite / Sheraton family vocabulary; co-attribution expected by definition.",
  "Federal × Adam": "Adam is one of the neoclassical design sources inside the Federal family; not a separate incompatible style.",
  "Arts and Crafts × Mission": "Mission is part of the canonical Arts and Crafts / Mission / Craftsman family name; not a separate attribution.",
  "Arts and Crafts × Craftsman": "Craftsman is part of the canonical Arts and Crafts / Mission / Craftsman family; not a separate transition.",
  "Spanish Colonial Revival × Mission Revival": "Mission Revival is part of the canonical Spanish Colonial / Mission / Mediterranean Revival family name.",
  "Spanish Colonial Revival × Mediterranean Revival": "Mediterranean Revival is a named sub-vocabulary inside the same revival family.",
  "Tudor Revival × Jacobean Revival": "Jacobean Revival is part of the canonical Tudor / Jacobean / Elizabethan Revival family name.",
  "Tudor Revival × Elizabethan Revival": "Elizabethan Revival is part of the same revival family; not an impossible or transitional pair.",
  "Tudor Revival × Tudor Revival (alias)": "Tudor Revival is the umbrella label for the same broad medieval / early modern English revival vocabulary.",
  "Rustic × Adirondack": "Adirondack is a named sub-vocabulary inside the Rustic / Lodge / Western / Ranch family.",
  "Rustic × Western Ranch": "Western / Ranch is a canonical branch of the same rustic family.",
} as const;
