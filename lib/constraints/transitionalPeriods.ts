/**
 * lib/constraints/transitionalPeriods.ts — Named historical transitional periods
 *
 * Canonical authoring per appraiser direction (May 2026 session). Entries
 * here represent named historical moments when one style family
 * transitioned into another OR when two families co-produced in a
 * recognizable transitional window with its own appraiser-vocabulary
 * trade-period name.
 *
 * Lookup: an adjacent pair in styleCompatibility.ts may carry
 * `named_transitional_period_id` pointing to an entry here. When present,
 * the engine uses this entry's prose + period_associations in the report
 * INSTEAD OF the generic "transitional convergence" wording. The piece's
 * identity reads as e.g. "Rococo-to-Renaissance Revival transitional
 * parlor table, c. 1860–1875" — what an actual appraiser would say.
 *
 * Not every adjacent pair gets a named-period entry. Skipped:
 *   - Pennsylvania German × Queen Anne (regional folk overlap, not named)
 *   - Chippendale × Louis XVI / French Neoclassical (no fixed American
 *     trade name; mostly elite/import-influenced)
 *   - Federal × Louis XVI / French Neoclassical (shared neoclassical
 *     vocabulary; co-attribution is influence-level, not transition)
 *   - Gothic Revival × Rococo Revival (Victorian eclecticism, not a
 *     named stylistic merger)
 *   - Eastlake × Colonial Revival (Centennial-era eclectic, not a named
 *     trade transition)
 *   - Art Nouveau × Arts and Crafts (no single American trade name)
 *   - Art Deco × Hollywood Regency (glamour overlap, not direct
 *     evolutionary transition)
 *   - Mid-Century Modern × Postmodern (narrow late-1970s window; the
 *     compat entry handles the case via the date_floor/ceiling on the
 *     impossible-by-canonical pair)
 */

import type { PeriodAssociation } from "./entryShape";
import type { RegionalPattern } from "./woodIdentification";

export type TransitionalPeriodEntry = {
  id: string;
  category: "transitional_period";
  positive_authority: number;
  hard_negative_authority: number;
  name: string;
  parent_style_ids: [string, string];
  indicator_text: string;
  description: string;
  period_associations: PeriodAssociation[];
  core_visual_identity: string;
  common_forms?: string[];
  regional_patterns?: RegionalPattern[];
  maker_associations?: string[];
  diagnostic_caution_text?: string;
  notes: string;
};

export function findTransitionalPeriod(id: string): TransitionalPeriodEntry | null {
  return TRANSITIONAL_PERIODS.find((p) => p.id === id) ?? null;
}

export function findTransitionalPeriodByPair(a: string, b: string): TransitionalPeriodEntry | null {
  return TRANSITIONAL_PERIODS.find((p) => {
    const [pa, pb] = p.parent_style_ids;
    return (pa === a && pb === b) || (pa === b && pb === a);
  }) ?? null;
}

export const TRANSITIONAL_PERIODS: TransitionalPeriodEntry[] = [
  {
    id: "transitional_period_early_colonial_to_jacobean",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "Early Colonial / Jacobean-Derived Overlap",
    parent_style_ids: ["style_family_early_colonial", "style_family_jacobean"],
    indicator_text: "Mid-17th to mid-18th century American overlap c. 1650–1750: early frame-and-panel construction, heavy proportions, low stretchers, turned legs, blocky casework, regional simplification — earliest American forms drawing on Jacobean and Carolean vocabulary while remaining survival-based and regional.",
    description: "Not a clean stylistic handoff so much as an early colonial overlap. The earliest American forms were often simplified, regional, and survival-based, while Jacobean and Carolean vocabulary supplied the heavier framed construction, turned supports, paneled surfaces, applied moldings, and rectangular massing. Diagnostic language should emphasize early frame-and-panel structure, heavy proportions, low stretchers, turned legs, blocky casework, and regional simplification rather than refined court-style ornament.",
    period_associations: [
      { period_label: "Early colonial Jacobean-derived overlap", date_floor: 1650, date_ceiling: 1750 },
    ],
    core_visual_identity: "Heavy framed construction, turned legs and supports, paneled surfaces, applied moldings, rectangular massing, low stretchers; regional simplification rather than refined court ornament.",
    common_forms: ["Joined chests", "blanket chests", "court cupboards", "wainscot chairs", "trestle tables", "early stools", "early case forms"],
    maker_associations: [],
    diagnostic_caution_text: "Early Colonial / Pilgrim and Jacobean / Carolean-derived vocabularies both present — consistent with mid-17th to mid-18th century American production in the early colonial overlap, not a true stylistic transition.",
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_early_colonial × style_family_jacobean.",
  },
  {
    id: "transitional_period_jacobean_to_william_and_mary",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "Jacobean to William and Mary Transition",
    parent_style_ids: ["style_family_jacobean", "style_family_william_and_mary"],
    indicator_text: "Transition c. 1680–1725 from heavy rectilinear Jacobean-derived construction toward taller, lighter, more vertical William and Mary forms — trumpet turning, ball feet, Spanish feet, high stretchers, arched aprons, japanning, burl veneers, baroque verticality.",
    description: "The transition moves from heavy rectilinear Jacobean-derived construction toward taller, lighter, more vertical William and Mary forms. Diagnostic cues include a shift from broad blocky massing and heavy turnings into trumpet turning, ball feet, Spanish feet, high stretchers, arched aprons, japanning, burl veneers, and more architectural verticality. Pieces in this overlap may retain heavy joined construction while showing newer baroque leg and stretcher vocabulary.",
    period_associations: [
      { period_label: "Jacobean to William and Mary transition", date_floor: 1680, date_ceiling: 1725 },
    ],
    core_visual_identity: "Mixed: heavy joined construction with emerging trumpet turning, ball or Spanish feet, high stretchers, arched aprons, japanning, burl veneers, baroque verticality.",
    common_forms: ["High chests", "dressing tables", "side chairs", "gateleg tables", "early desks", "chests-on-frames"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_jacobean × style_family_william_and_mary.",
  },
  {
    id: "transitional_period_william_and_mary_to_queen_anne",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "William and Mary to Queen Anne Transition",
    parent_style_ids: ["style_family_william_and_mary", "style_family_queen_anne"],
    indicator_text: "Transition c. 1720–1725 (extending slightly later in conservative regions) from vertical, turned, stretchered, baroque furniture toward smoother, lighter, curvilinear Queen Anne vocabulary.",
    description: "The visual movement is from vertical, turned, stretchered, baroque furniture toward the smoother, lighter, curvilinear Queen Anne vocabulary. Transitional examples may combine William and Mary case proportions, stretchers, or turned legs with emerging cabriole legs, pad feet, cyma curves, shell carving, and more restrained ornament. Diagnostic language should watch for mixed leg systems, stretcher retention, or early cabriole use on otherwise older case architecture.",
    period_associations: [
      { period_label: "William and Mary to Queen Anne transition", date_floor: 1720, date_ceiling: 1730 },
    ],
    core_visual_identity: "Mixed: turned legs with stretchers alongside emerging cabriole legs and pad feet; cyma curves, shell carving, restrained ornament on otherwise older case architecture.",
    common_forms: ["Highboys", "lowboys", "side chairs", "tea tables", "dressing tables", "early desks"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_william_and_mary × style_family_queen_anne.",
  },
  {
    id: "transitional_period_queen_anne_to_chippendale",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "Queen Anne to Chippendale Transition",
    parent_style_ids: ["style_family_queen_anne", "style_family_chippendale"],
    indicator_text: "Transition c. 1750–1780 preserving Queen Anne curvilinear form while adding ornamental, architectural, Rococo-influenced Chippendale vocabulary — cabriole legs continuing alongside heavier carving, claw-and-ball feet, pierced splats, fretwork, more elaborate pediments.",
    description: "This transition preserves Queen Anne curvilinear form while adding the more ornamental, architectural, and Rococo-influenced Chippendale vocabulary. Diagnostic overlap includes cabriole legs continuing alongside heavier carving, claw-and-ball feet, pierced splats, Gothic or Chinese fretwork, more elaborate pediments, and stronger mahogany use in high-style examples. A transitional attribution is reasonable when the form is Queen Anne in silhouette but Chippendale in ornament intensity.",
    period_associations: [
      { period_label: "Queen Anne to Chippendale transition", date_floor: 1750, date_ceiling: 1780 },
    ],
    core_visual_identity: "Queen Anne silhouette (cabriole legs, pad feet, cyma curves) carrying Chippendale ornament intensity (claw-and-ball feet, pierced splats, Gothic or Chinese fretwork, elaborate pediments, stronger mahogany).",
    common_forms: ["Side chairs", "armchairs", "high chests", "desks", "tea tables", "card tables", "looking-glass frames"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_queen_anne × style_family_chippendale.",
  },
  {
    id: "transitional_period_chippendale_to_federal",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "Chippendale to Federal Transition",
    parent_style_ids: ["style_family_chippendale", "style_family_federal"],
    indicator_text: "Transition c. 1780–1785 (with regional conservatism extending later) from heavier Rococo, Gothic, and Chinese Chippendale vocabulary toward the lighter, straighter, elliptical, classical Federal idiom.",
    description: "The transition moves from heavier Rococo, Gothic, and Chinese Chippendale vocabulary toward the lighter, straighter, elliptical, and classical Federal idiom. Transitional pieces may show Chippendale case massing or chair splat traditions combined with Federal inlay, tapered legs, bellflowers, ovals, urns, stringing, and more delicate surface ornament. The key diagnostic contrast is carved sculptural ornament versus planar inlaid neoclassical ornament.",
    period_associations: [
      { period_label: "Chippendale to Federal transition", date_floor: 1780, date_ceiling: 1810 },
    ],
    core_visual_identity: "Chippendale case massing or chair splat traditions combined with Federal inlay, tapered legs, bellflowers, ovals, urns, stringing; carved sculptural ornament giving way to planar inlaid neoclassical ornament.",
    common_forms: ["Dining chairs", "sideboards", "card tables", "chests", "desks", "bookcases", "secretary desks"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_chippendale × style_family_federal.",
  },
  {
    id: "transitional_period_federal_to_american_classical",
    category: "transitional_period",
    positive_authority: 5,
    hard_negative_authority: 5,
    name: "Federal to American Classical / Empire Transition",
    parent_style_ids: ["style_family_federal", "style_family_american_classical"],
    indicator_text: "Major early American transition c. 1810–1840 (strongest c. 1815–1830). Federal restraint with emerging Greco-Roman support vocabulary: scroll supports, paw feet, columns, lyres, brass mounts, saber legs, stronger mahogany surfaces. Often described as late Federal, Classical, or Duncan Phyfe period.",
    description: "This is one of the most important early American transitions. Federal furniture is lighter, linear, inlaid, and elliptical; American Classical / Empire becomes heavier, more sculptural, more archaeological, and more Greco-Roman. Diagnostic overlap includes Federal case restraint with emerging scroll supports, paw feet, columns, lyres, brass mounts, saber legs, and stronger mahogany surfaces. Transitional pieces often retain Federal proportions but introduce the bolder Greco-Roman support vocabulary associated with the Empire period.",
    period_associations: [
      { period_label: "Strongest Federal-to-Empire transition", date_floor: 1815, date_ceiling: 1830 },
      { period_label: "Broader Federal-to-Empire transition window", date_floor: 1810, date_ceiling: 1840 },
    ],
    core_visual_identity: "Federal proportions and case restraint with emerging Greco-Roman support vocabulary — scroll supports, paw feet, columns, lyres, brass mounts, saber legs, stronger mahogany. Often called Late Federal, Classical, or Duncan Phyfe period.",
    common_forms: ["Card tables", "work tables", "sideboards", "sofas", "pier tables", "center tables", "dining chairs", "secretary desks"],
    maker_associations: ["Duncan Phyfe"],
    diagnostic_caution_text: "Federal and American Classical / Empire vocabularies both present — consistent with the Federal-to-Empire transitional window c. 1810–1840 (strongest c. 1815–1830), often called Late Federal, Classical, or Duncan Phyfe period.",
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_federal × style_family_american_classical.",
  },
  {
    id: "transitional_period_american_classical_to_gothic_revival",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "Empire to Gothic Revival Transition",
    parent_style_ids: ["style_family_american_classical", "style_family_gothic_revival"],
    indicator_text: "Transition c. 1840–1850 from classical mass, scrolls, columns, and paw feet toward pointed arches, tracery, crockets, trefoils, quatrefoils, and vertical medievalized ornament.",
    description: "The transition moves from classical mass, scrolls, columns, and paw feet toward pointed arches, tracery, crockets, trefoils, quatrefoils, and vertical medievalized ornament. Transitional examples may keep heavy Empire case mass or scroll supports while adding Gothic panels, pointed moldings, or church-like architectural details. The diagnostic issue is whether the piece is still fundamentally classical with Gothic trim, or truly Gothic Revival in structure and design intent.",
    period_associations: [
      { period_label: "Empire to Gothic Revival transition", date_floor: 1840, date_ceiling: 1850 },
    ],
    core_visual_identity: "Heavy Empire case mass or scroll supports retained while Gothic panels, pointed moldings, tracery, trefoils/quatrefoils, or church-like architectural details emerge.",
    common_forms: ["Bookcases", "cabinets", "hall chairs", "side chairs", "tables", "beds", "church or institutional furniture"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_american_classical × style_family_gothic_revival.",
  },
  {
    id: "transitional_period_rococo_to_renaissance_revival",
    category: "transitional_period",
    positive_authority: 5,
    hard_negative_authority: 5,
    name: "Rococo to Renaissance Revival Transition",
    parent_style_ids: ["style_family_rococo_revival", "style_family_renaissance_revival"],
    indicator_text: "High Victorian transitional window c. 1860–1875. Fluid, asymmetrical, naturalistic Rococo Revival carving (scrolls, fruit, flowers, cabriole curves) co-occurs with heavier, architectural, rectilinear, classical Renaissance Revival mass (columns, pediments, incised panels, masks, medallions, burl panels).",
    description: "This transition shifts from the fluid, asymmetrical, naturalistic carving of Rococo Revival toward the heavier, architectural, rectilinear, and classical mass of Renaissance Revival. Transitional pieces may retain carved fruit, flowers, and scrolls while adding columns, pediments, incised panels, masks, medallions, burl panels, and more formal case architecture. Diagnostic wording should emphasize the balance between organic carving and architectural monumentality.",
    period_associations: [
      { period_label: "Rococo-to-Renaissance Revival transitional production", date_floor: 1860, date_ceiling: 1875 },
    ],
    core_visual_identity: "Rococo Revival vocabulary (carved fruit, flowers, scrolls, cabriole curves, serpentine fronts) balanced against Renaissance Revival architectural mass (columns, pediments, incised panels, masks, medallions, burl panels, formal case architecture).",
    common_forms: ["Bedroom suites", "parlor sets", "sideboards", "bookcases", "wardrobes", "marble-top tables"],
    maker_associations: [],
    diagnostic_caution_text: "Rococo Revival and Renaissance Revival vocabularies both present — consistent with mid-Victorian transitional production c. 1860–1875. The piece is most accurately identified as Rococo-to-Renaissance Revival transitional rather than as either pure style.",
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_rococo_revival × style_family_renaissance_revival.",
  },
  {
    id: "transitional_period_renaissance_revival_to_eastlake",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "Renaissance Revival to Eastlake Transition",
    parent_style_ids: ["style_family_renaissance_revival", "style_family_eastlake"],
    indicator_text: "Late Victorian eclectic transition c. 1870–1885 from heavy, carved, Renaissance-inspired monumentality toward flatter, more rectilinear Eastlake ornament (incised lines, geometric carving, spoon carving, chamfered edges, applied panels).",
    description: "This transition moves from heavy, carved, Renaissance-inspired monumentality toward flatter, more rectilinear Eastlake ornament. Diagnostic overlap includes large case forms with architectural mass but with incised lines, geometric carving, spoon carving, shallow relief, chamfered edges, and applied panels replacing deep sculptural carving. The key distinction is carved depth and classical monumentality versus machine-aided linear ornament and reform-era geometry.",
    period_associations: [
      { period_label: "Renaissance Revival to Eastlake transition", date_floor: 1870, date_ceiling: 1885 },
    ],
    core_visual_identity: "Large case forms with Renaissance architectural mass but with Eastlake incised lines, geometric and spoon carving, shallow relief, chamfered edges, and applied panels replacing deep sculptural carving.",
    common_forms: ["Dressers", "washstands", "beds", "sideboards", "hall trees", "wardrobes", "marble-top tables"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_renaissance_revival × style_family_eastlake.",
  },
  {
    id: "transitional_period_eastlake_aesthetic_movement",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "Aesthetic Movement Eastlake (Modern Gothic / Japanesque Eastlake)",
    parent_style_ids: ["style_family_eastlake", "style_family_aesthetic_movement"],
    indicator_text: "Strong co-attribution zone in high Victorian furniture c. 1870–1890. Eastlake reform-era geometry (rectilinear structure, incising, chamfering, shallow machine carving) combined with Aesthetic Movement ornament (asymmetry, ebonized surfaces, gilt incising, stylized natural motifs, bamboo-like turnings, Japanese fans and birds).",
    description: "This is a strong co-attribution zone in high Victorian furniture. Eastlake contributes rectilinear reform geometry, incising, chamfering, and shallow machine carving; the Aesthetic Movement adds asymmetry, ebonized surfaces, gilt incising, stylized natural motifs, bamboo-like turnings, Japanese fans, birds, flowers, and open display arrangements. Diagnostic language should allow overlap when the piece shows reform-era geometry plus Japanesque or art-for-art's-sake ornament.",
    period_associations: [
      { period_label: "Aesthetic Movement Eastlake co-attribution window", date_floor: 1870, date_ceiling: 1890 },
    ],
    core_visual_identity: "Eastlake reform-era geometry + Aesthetic Movement / Japanesque ornament: rectilinear structure with incised lines, chamfered edges, plus ebonized surfaces, gilt incising, stylized natural motifs, bamboo-like turnings, Japanese fans, birds, flowers, open display arrangements.",
    common_forms: ["Sideboards", "cabinets", "hall stands", "desks", "music cabinets", "occasional tables", "bedroom suites"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_eastlake × style_family_aesthetic_movement. This is more a stacked co-attribution than a stylistic handoff, but the appraiser supplied a named-period treatment.",
  },
  {
    id: "transitional_period_eastlake_to_arts_and_crafts",
    category: "transitional_period",
    positive_authority: 5,
    hard_negative_authority: 5,
    name: "Eastlake to Mission / Arts and Crafts Transition",
    parent_style_ids: ["style_family_eastlake", "style_family_arts_and_crafts"],
    indicator_text: "Important transition c. 1890–1900 for factory oak pieces. Eastlake's incised, rectilinear, machine-friendly surface ornament gives way to the heavier, plainer, exposed-joinery, quarter-sawn oak vocabulary of Mission and Arts and Crafts. Easy to overcall as original Mission when actually late Victorian or Golden Oak-era transitional factory furniture.",
    description: "This transition is visually important for factory oak pieces. Eastlake's incised, rectilinear, machine-friendly surface ornament gives way to the heavier, plainer, exposed-joinery, quarter-sawn oak vocabulary of Mission and Arts and Crafts. Transitional examples may have straight posts, blocky proportions, oak construction, and geometric layouts but still retain incised floral or linear decoration. This zone is especially vulnerable to overcalling pieces as original Mission when they are actually late Victorian or Golden Oak-era transitional factory furniture.",
    period_associations: [
      { period_label: "Eastlake to Mission / Arts and Crafts transition", date_floor: 1890, date_ceiling: 1900 },
    ],
    core_visual_identity: "Straight posts, blocky proportions, oak construction, geometric layouts retaining incised floral or linear Eastlake decoration; Mission-style massing emerging without fully shedding late Victorian reform vocabulary.",
    common_forms: ["Rockers", "side chairs", "desks", "bookcases", "hall trees", "beds", "dressers", "sideboards"],
    maker_associations: [],
    diagnostic_caution_text: "Eastlake and Mission / Arts and Crafts vocabularies both present — consistent with the late-Victorian-to-Mission factory transition c. 1890–1900. Watch for the common mis-call of original Mission on what is actually transitional factory production.",
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_eastlake × style_family_arts_and_crafts. High-value diagnostic; one of the most-commonly-miscalled transitions.",
  },
  {
    id: "transitional_period_aesthetic_movement_to_arts_and_crafts",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "Aesthetic Movement to Arts and Crafts Transition (Japanesque Continuation)",
    parent_style_ids: ["style_family_aesthetic_movement", "style_family_arts_and_crafts"],
    indicator_text: "Transition c. 1895–1915 as Aesthetic Movement Japanesque interest continues into Arts and Crafts through simplicity, exposed structure, flat planes, stylized nature, and honest materials.",
    description: "The Aesthetic Movement's Japanesque interest continues into Arts and Crafts through simplicity, exposed structure, flat planes, stylized nature, and honest materials. Diagnostic overlap includes ebonized or dark surfaces, asymmetry, open shelving, Japanese-inspired brackets, restrained carving, and rectilinear structure. The difference is that Aesthetic examples are more decorative and art-display oriented, while Arts and Crafts examples are more material-centered, joinery-centered, and reformist.",
    period_associations: [
      { period_label: "Aesthetic-to-Arts-and-Crafts continuation window", date_floor: 1895, date_ceiling: 1915 },
    ],
    core_visual_identity: "Ebonized or dark surfaces, asymmetry, open shelving, Japanese-inspired brackets, restrained carving, rectilinear structure. Aesthetic examples lean decorative/art-display; Arts and Crafts examples lean material-centered, joinery-centered, reformist.",
    common_forms: ["Cabinets", "bookcases", "screens", "desks", "sideboards", "occasional tables", "chairs"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_aesthetic_movement × style_family_arts_and_crafts.",
  },
  {
    id: "transitional_period_tudor_to_arts_and_crafts",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "Arts and Crafts Tudor / Tudor Oak Revival",
    parent_style_ids: ["style_family_tudor_revival", "style_family_arts_and_crafts"],
    indicator_text: "Co-attribution zone c. 1900–1920 reflecting shared taste for oak, visible structure, medievalism, and anti-industrial historical craft references. Tudor / Jacobean Revival contributes turned legs, bulbous supports, strapwork, linenfold panels, dark oak, Elizabethan massing; Arts and Crafts contributes rectilinear simplicity, exposed joinery, handcraft rhetoric, quarter-sawn oak.",
    description: "This overlap reflects the shared taste for oak, visible structure, medievalism, and anti-industrial historical craft references. Tudor/Jacobean Revival contributes turned legs, bulbous supports, strapwork, linenfold panels, dark oak, and Elizabethan massing; Arts and Crafts contributes rectilinear simplicity, exposed joinery, handcraft rhetoric, and quarter-sawn oak. Diagnostic language should allow co-attribution when medieval revival ornament is placed on Arts and Crafts construction or proportions.",
    period_associations: [
      { period_label: "Arts and Crafts Tudor / Tudor Oak Revival", date_floor: 1900, date_ceiling: 1920 },
    ],
    core_visual_identity: "Medieval revival ornament (turned legs, bulbous supports, strapwork, linenfold panels, dark oak, Elizabethan massing) placed on Arts and Crafts construction or proportions (rectilinear simplicity, exposed joinery, handcraft rhetoric, quarter-sawn oak).",
    common_forms: ["Dining sets", "sideboards", "library tables", "bookcases", "hall benches", "settles", "desks"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_tudor_revival × style_family_arts_and_crafts.",
  },
  {
    id: "transitional_period_arts_and_crafts_spanish_colonial",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "Mission / California Mission / Spanish Mission Overlap",
    parent_style_ids: ["style_family_spanish_colonial_revival", "style_family_arts_and_crafts"],
    indicator_text: "Same-vocabulary overlap c. 1895–1920 (Mission overlap), broader c. 1915–1940 (Spanish/Mediterranean). 'Mission' appears in both family names; diagnostic distinction depends on whether the piece is rectilinear Craftsman oak furniture or Spanish/California Mission architecture-derived furniture with arches, leather, ironwork, plank forms, southwestern or monastic cues.",
    description: "This is partly a same-vocabulary overlap because 'Mission' appears in both the Arts and Crafts / Mission / Craftsman family and the Spanish Colonial / Mission / Mediterranean Revival family. Diagnostic distinction depends on whether the piece is rectilinear Craftsman oak furniture or Spanish/California Mission architecture-derived furniture with arches, leather, ironwork, plank forms, and southwestern or monastic cues. Co-attribution is expected when a piece uses Mission vocabulary broadly.",
    period_associations: [
      { period_label: "Mission overlap", date_floor: 1895, date_ceiling: 1920 },
      { period_label: "Broader Spanish / Mediterranean overlap", date_floor: 1915, date_ceiling: 1940 },
    ],
    core_visual_identity: "Either rectilinear Craftsman oak (Arts and Crafts side) OR Spanish/California Mission architecture-derived form with arches, leather, ironwork, plank forms, southwestern or monastic cues (Spanish Colonial side). Co-occurrence common when the piece uses Mission vocabulary broadly.",
    common_forms: ["Chairs", "rockers", "settles", "desks", "tables", "benches", "dining sets"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_spanish_colonial_revival × style_family_arts_and_crafts. The shared 'Mission' vocabulary is the source of much real-world co-attribution.",
  },
  {
    id: "transitional_period_rustic_arts_and_crafts",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "Craftsman Rustic / Adirondack Arts and Crafts / Lodge Furniture",
    parent_style_ids: ["style_family_arts_and_crafts", "style_family_rustic"],
    indicator_text: "Lodge-era overlap c. 1895–1930. Both traditions value material honesty and visible structure: Rustic/Adirondack emphasizes branches, logs, bark, twig work, lodge scale, camp identity; Arts and Crafts emphasizes designed rectilinear joinery and craft discipline.",
    description: "Both traditions value material honesty and visible structure, but Rustic/Adirondack emphasizes branches, logs, bark, twig work, lodge scale, and camp identity, while Arts and Crafts emphasizes designed rectilinear joinery and craft discipline. Overlap is expected in lodge interiors where Mission-style oak or Craftsman forms are adapted to rustic settings.",
    period_associations: [
      { period_label: "Craftsman rustic / lodge co-occurrence", date_floor: 1895, date_ceiling: 1930 },
    ],
    core_visual_identity: "Mission-style oak or Craftsman forms adapted to rustic settings — branches, logs, bark, twig work, lodge scale, camp identity co-occurring with rectilinear joinery and craft discipline.",
    common_forms: ["Rockers", "settles", "tables", "benches", "beds", "lodge chairs", "bookcases"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_rustic × style_family_arts_and_crafts.",
  },
  {
    id: "transitional_period_arts_and_crafts_to_art_deco",
    category: "transitional_period",
    positive_authority: 5,
    hard_negative_authority: 5,
    name: "Late Arts and Crafts to Early Art Deco Transition",
    parent_style_ids: ["style_family_arts_and_crafts", "style_family_art_deco"],
    indicator_text: "Transition c. 1925–1930 (utility/depression overlap c. 1920–1940). Exposed joinery, plain oak, rectilinear craft honesty, and Mission massing give way to sleeker geometry, veneers, stepped forms, waterfall fronts, exotic woods, and machine-age ornament. High-value diagnostic zone for avoiding false 'Mission' calls on later factory pieces.",
    description: "This transition moves from exposed joinery, plain oak, rectilinear craft honesty, and Mission massing toward sleeker geometry, veneers, stepped forms, waterfall fronts, exotic woods, and machine-age ornament. Transitional examples may retain sturdy Craftsman proportions or oak construction while introducing stepped profiles, decorative veneers, or simplified Deco geometry. This is a high-value diagnostic zone for avoiding false 'Mission' calls on later factory pieces.",
    period_associations: [
      { period_label: "Arts and Crafts to Art Deco transition", date_floor: 1925, date_ceiling: 1930 },
      { period_label: "Utility / Depression overlap", date_floor: 1920, date_ceiling: 1940 },
    ],
    core_visual_identity: "Sturdy Craftsman proportions or oak construction retained while stepped profiles, decorative veneers, or simplified Deco geometry emerge.",
    common_forms: ["Desks", "bookcases", "bedroom suites", "dining sets", "occasional tables", "cabinets"],
    maker_associations: [],
    diagnostic_caution_text: "Late Arts and Crafts and early Art Deco vocabularies both present — consistent with the c. 1925–1930 transitional window (or 1920–1940 utility/Depression-era overlap). Watch for the common mis-call of original Mission on factory pieces that are actually transitional Deco-era production.",
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_arts_and_crafts × style_family_art_deco.",
  },
  {
    id: "transitional_period_art_deco_to_streamline_moderne",
    category: "transitional_period",
    positive_authority: 5,
    hard_negative_authority: 5,
    name: "Art Deco to Streamline Moderne Transition",
    parent_style_ids: ["style_family_art_deco", "style_family_streamline_moderne"],
    indicator_text: "Transition c. 1930–1945. Streamline Moderne IS the named later Deco transition: Art Deco's stepped geometry, sunbursts, chevrons, exotic veneers, and vertical glamour soften into Streamline's rounded corners, horizontal bands, waterfall edges, chrome, speed lines, and machine-age aerodynamic form.",
    description: "Streamline Moderne develops from Art Deco but softens and accelerates it visually. Art Deco uses stepped geometry, sunbursts, chevrons, exotic veneers, and vertical glamour; Streamline favors rounded corners, horizontal bands, waterfall edges, chrome, speed lines, and machine-age aerodynamic form. Co-attribution is expected when a piece has Deco glamour but Streamline curves and horizontal motion.",
    period_associations: [
      { period_label: "Art Deco to Streamline Moderne transition", date_floor: 1930, date_ceiling: 1945 },
    ],
    core_visual_identity: "Deco glamour vocabulary (stepped geometry, sunbursts, chevrons, exotic veneers, vertical glamour) softening into Streamline's rounded corners, horizontal bands, waterfall edges, chrome, speed lines, machine-age aerodynamic form.",
    common_forms: ["Waterfall bedroom suites", "vanities", "dressers", "radios", "bars", "cabinets", "desks", "occasional tables"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_art_deco × style_family_streamline_moderne.",
  },
  {
    id: "transitional_period_streamline_to_mid_century_modern",
    category: "transitional_period",
    positive_authority: 5,
    hard_negative_authority: 5,
    name: "Streamline to Mid-Century Modern Transition",
    parent_style_ids: ["style_family_streamline_moderne", "style_family_mid_century_modern"],
    indicator_text: "Transition c. 1940–1945 (with visual carryover into early postwar production) from prewar aerodynamic modernism into postwar functional modernism.",
    description: "This transition moves from prewar aerodynamic modernism into postwar functional modernism. Streamline retains rounded corners, horizontal speed, waterfall edges, and machine-age surfaces; Mid-Century Modern becomes lighter, more modular, more biomorphic or Scandinavian-influenced, and often uses tapered legs, plywood, molded forms, and cleaner silhouettes. Transitional pieces can show rounded Deco/Streamline cases with emerging postwar leg and hardware treatments.",
    period_associations: [
      { period_label: "Streamline to MCM transition", date_floor: 1940, date_ceiling: 1945 },
      { period_label: "Visual carryover into early postwar production", date_floor: 1945, date_ceiling: 1955 },
    ],
    core_visual_identity: "Rounded Deco/Streamline cases with emerging postwar leg and hardware treatments — Streamline's rounded corners and waterfall edges retained while tapered legs, plywood, molded forms, and lighter silhouettes emerge.",
    common_forms: ["Bedroom suites", "dressers", "desks", "cabinets", "radios", "tables", "seating"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_streamline_moderne × style_family_mid_century_modern.",
  },
  {
    id: "transitional_period_hollywood_regency_mid_century",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "Hollywood Regency / Regency Modern",
    parent_style_ids: ["style_family_hollywood_regency", "style_family_mid_century_modern"],
    indicator_text: "Co-production zone c. 1940–1965 (called Hollywood Regency, Regency Modern, or glam modern depending on form). Modern construction and proportions carry Hollywood Regency's glamour, lacquer, brass, glass, mirrored surfaces, faux bamboo, neoclassical motifs, and theatrical scale.",
    description: "This is a co-production and design-layer overlap rather than a pure chronological transition. Hollywood Regency adds glamour, lacquer, brass, glass, mirrored surfaces, faux bamboo, neoclassical motifs, and theatrical scale; Mid-Century Modern adds clean silhouettes, tapered legs, modularity, and modern materials. Co-attribution is reasonable where a piece has modern construction and proportions but glamorous Regency surface language.",
    period_associations: [
      { period_label: "Hollywood Regency / Regency Modern co-production", date_floor: 1940, date_ceiling: 1965 },
    ],
    core_visual_identity: "Modern construction and proportions (clean silhouettes, tapered legs, modularity, modern materials) carrying Hollywood Regency surface language (glamour, lacquer, brass, glass, mirrored surfaces, faux bamboo, neoclassical motifs, theatrical scale).",
    common_forms: ["Credenzas", "consoles", "coffee tables", "chairs", "bedroom furniture", "bar carts", "mirrors"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_hollywood_regency × style_family_mid_century_modern. Co-production overlap rather than evolutionary transition.",
  },
  {
    id: "transitional_period_postmodern_to_contemporary_transitional",
    category: "transitional_period",
    positive_authority: 4,
    hard_negative_authority: 4,
    name: "Postmodern to Contemporary Transitional / Eclectic Historicism",
    parent_style_ids: ["style_family_postmodern", "style_family_contemporary_transitional"],
    indicator_text: "Transition c. 1990–1995 (with postmodern influence continuing in later revival/eclectic design). High-contrast, ironic, sculptural Postmodern design gives way to softer, marketable transitional furniture blending traditional silhouettes with simplified modern surfaces.",
    description: "This transition moves from high-contrast, ironic, sculptural Postmodern design toward softer, marketable transitional furniture that blends traditional silhouettes with simplified modern surfaces. Diagnostic overlap includes playful proportions, exaggerated historical references, laminate or commercial finishes, and simplified mass-market eclecticism. By the late 1990s and 2000s, the more aggressive Memphis language usually gives way to safer transitional traditional design.",
    period_associations: [
      { period_label: "Postmodern to Contemporary Transitional", date_floor: 1990, date_ceiling: 1995 },
      { period_label: "Continued postmodern influence in later eclectic design", date_floor: 1995, date_ceiling: 2010 },
    ],
    core_visual_identity: "Playful proportions, exaggerated historical references, laminate or commercial finishes, simplified mass-market eclecticism; aggressive Memphis language softening into safer transitional traditional design through the late 1990s and 2000s.",
    common_forms: ["Office furniture", "cabinets", "tables", "chairs", "entertainment centers", "commercial seating", "bedroom suites"],
    maker_associations: [],
    notes: "Per appraiser-supplied authoring (May 2026 session). Pair: style_family_postmodern × style_family_contemporary_transitional.",
  },
];
