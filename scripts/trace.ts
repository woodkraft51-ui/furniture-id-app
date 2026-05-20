/**
 * scripts/trace.ts — Block 0.55 diagnostic harness
 *
 * Drives PE.runAllPhases deterministically against a fabricated fixture.
 * Stubs PE.callClaude so no real LLM call happens. Outputs stage_outputs,
 * final_report, evidence_digest, observations, and field_scan as readable
 * JSON to stdout. Supports --piece <name> for future fixture loading from
 * scripts/trace-fixtures/ (Block 0.6 will populate; for now falls back to
 * the hardcoded placeholder).
 *
 * Expected invocation (once node_modules is present):
 *   npx ts-node scripts/trace.ts
 *   npx ts-node scripts/trace.ts --piece roos_cedar_chest
 *
 * Block 0.6 enabler: provides clean baseline trace capability.
 */

import { PE } from "../lib/engine";
import { API } from "../lib/store";

// Node global declaration — avoids @types/node hard dependency in sandbox.
declare const process: { argv: string[]; exit: (code: number) => void } | undefined;

type Fixture = {
  caseData: { id: string };
  images: Array<{ data_url: string; image_type: string; name?: string }>;
  intake: any;
  perceptionStub: any;
};

const BASE_INTAKE = {
  analysis_mode: "full_analysis",
  asking_price: "",
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

const BASE_PERCEPTION = {
  labels: [],
  maker_names: [],
  materials: [],
  forms: [],
  functional_features: [],
  style_cues: [],
  construction_cues: [],
  condition_cues: [],
  visible_text: [],
  raw_text: "trace fixture (no real LLM call)",
};

const obs = (clue: string, description: string, confidence = 80) => ({
  clue,
  description,
  confidence,
  source_image: "trace",
});

const PLACEHOLDER_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-placeholder" },
  images: [{ data_url: "data:image/png;base64,", image_type: "label", name: "placeholder.png" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "cedar", user_category_guess: "blanket_chest" },
  perceptionStub: { perception: BASE_PERCEPTION, observations: [] },
};

// Fixture 1: Roos cedar chest — exercises label + cedar_lining + lift_lid branches in scoreForms
const ROOS_CEDAR_CHEST_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-roos-cedar-chest" },
  images: [{ data_url: "data:image/png;base64,", image_type: "label" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "cedar", user_category_guess: "blanket_chest",
            known_provenance: "Roos paper label visible on lid interior" },
  perceptionStub: {
    perception: { ...BASE_PERCEPTION, raw_text: "Roos Sweetheart label; cedar-lined chest with hinged lift-lid" },
    observations: [
      obs("roos_label", "Roos Sweetheart paper label visible on interior", 95),
      obs("cedar_lining", "Cedar-lined interior throughout", 90),
      obs("lift_lid", "Hinged lift-top construction", 88),
    ],
  },
};

// Fixture 2: Eastlake dresser — exercises victorian_eastlake_pattern + multiple_drawer_case branches
const EASTLAKE_DRESSER_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-eastlake-dresser" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "walnut", user_category_guess: "dresser", has_drawers: true,
            condition_notes: "incised geometric carving on drawer fronts; original brass eastlake pulls" },
  perceptionStub: {
    perception: { ...BASE_PERCEPTION, raw_text: "Walnut chest of drawers with incised geometric carving and Eastlake pulls" },
    observations: [
      obs("victorian_eastlake_pattern", "Incised geometric carving consistent with Eastlake aesthetic c. 1870-1890", 85),
      obs("multiple_drawer_case", "Stacked drawer case construction", 90),
      obs("eastlake_pull", "Geometric incised brass Eastlake-style pulls", 80),
      obs("machine_dovetails", "Uniform machine-cut dovetails visible on drawer sides", 85),
    ],
  },
};

// Fixture 3: Plywood "Federal" reproduction — exercises HARD NEGATIVE conflict + Federal style branches
const PLYWOOD_FEDERAL_REPRO_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-plywood-federal-repro" },
  images: [{ data_url: "data:image/png;base64,", image_type: "drawer" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "mahogany", user_category_guess: "chest_of_drawers", has_drawers: true,
            known_provenance: "seller claims Federal period c. 1810; pulls appear period-correct" },
  perceptionStub: {
    perception: { ...BASE_PERCEPTION, raw_text: "Mahogany case with reeded columns; plywood drawer bottoms visible" },
    observations: [
      obs("plywood_drawer_bottom", "Plywood drawer bottoms visible on multiple drawers", 95),
      obs("federal_hepplewhite_sheraton_pattern", "Reeded columns and inlaid stringing consistent with Federal styling", 75),
      obs("multiple_drawer_case", "Stacked drawer case", 90),
      obs("phillips_screw", "Phillips-head screws securing drawer slides", 95),
    ],
  },
};

// Fixture 4: Pre-1860 piece — exercises hand-cut dovetails + cut nails + hand-forged hardware
// Should fire early-construction path; date envelope should anchor pre-1860 with high confidence
const PRE_1860_PIECE_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-pre-1860-piece" },
  images: [{ data_url: "data:image/png;base64,", image_type: "drawer" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "cherry", user_category_guess: "chest_of_drawers", has_drawers: true,
            known_provenance: "estate find; family history suggests early-to-mid 19th century",
            condition_notes: "irregular hand-cut dovetails; hand-forged nails throughout; chamfered drawer bottoms" },
  perceptionStub: {
    perception: { ...BASE_PERCEPTION, raw_text: "Cherry chest of drawers; irregular hand-cut dovetails; hand-forged nails; chamfered solid-board drawer bottoms" },
    observations: [
      obs("hand_cut_dovetails", "Irregular hand-cut dovetails with uneven angles on drawer sides", 92),
      obs("hand_forged_nail", "Square hand-forged nail heads visible on drawer-front attachment", 88),
      obs("cut_nail", "Tapered rectangular cut nails on back panel", 85),
      obs("multiple_drawer_case", "Three-drawer stacked case construction", 90),
      obs("pit_saw_marks", "Diagonal pit-saw marks on secondary surfaces", 80),
    ],
  },
};

// Fixture 5: MCM molded plastic chair — exercises material-gate logic (plastic → post-1945)
// Should fire material-primary-plastic gate; date locks to c. 1945+ regardless of other signals
const MCM_PLASTIC_CHAIR_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-mcm-plastic-chair" },
  images: [{ data_url: "data:image/png;base64,", image_type: "side" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "", user_category_guess: "chair",
            condition_notes: "single-piece molded plastic seat-back; chrome tubular legs; no upholstery" },
  perceptionStub: {
    perception: { ...BASE_PERCEPTION, raw_text: "Molded plastic shell chair with chrome tubular base, mid-century modernist design" },
    observations: [
      obs("molded_plastic", "Single-piece molded plastic seat and backrest shell", 95),
      obs("tubular_steel", "Chrome-plated tubular steel base", 90),
      obs("seating_present", "Seat surface present", 95),
      obs("backrest_present", "Backrest present", 95),
      obs("mcm_structural_pattern", "Mid-century modernist design language", 80),
    ],
  },
};

// Fixture 6: Colonial Revival tub/lounge chair misdiagnosed as a telephone
// bench + Louis XVI + MCM. Synthesized from a real diagnostic trace
// (May 2026) that surfaced four engine bugs simultaneously:
//   - Form: telephone_stand winning over armchair (composite-pattern
//     threshold fired on seating + secondary_surface alone)
//   - Form subtype: telephone_cabinet at confidence 1.0 with
//     matched_attributes: [] (subtype scoring did not require ≥1 match)
//   - Style: Louis XVI / French Neoclassical (1770–1830) winning over
//     Colonial Revival because "revival" was stopword-filtered and the
//     `neoclassical` token anchored to the original-period family
//   - Style waves: MCM waves firing on a false CNC-derived date hint
//     because the 2-of-N gate effectively required only one of
//     {date overlap, design signal} (Layer 1 was pushed unconditionally)
//   - Dating overlap: reversed envelopes (e.g., finish 1880–1830)
//     flowing through parseRangeToNumeric without normalization
// Expected post-fix behavior:
//   - form attribution = form_armchair (telephone-bench vetoed by armchair_form)
//   - colonial_revival_pattern synthesized; Louis XVI penalized
//   - no MCM waves with empty matched signals
//   - shellac_intact envelope normalized to 1830–1880, not 1880–1830
const COLONIAL_REVIVAL_LOUNGE_CHAIR_MISDIAGNOSED_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-colonial-revival-lounge-chair-misdiagnosed" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: {
    ...BASE_INTAKE,
    primary_wood_guess: "walnut",
    user_category_guess: "chair",
    condition_notes:
      "tufted velvet upholstery; cane side panels; tapered front legs with block corners; decorative rosette applique blocks at arm terminals; possible incised maker mark near back rail; OCR picked up 'CNC' text on a faded paper label",
  },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Walnut tub/barrel-back armchair with full upholstery, button-tufted velvet seat and back, cane-paneled sides, square tapered front legs with block-corner detail and decorative rosette applique. Possible incised maker mark partially legible. Faded paper label includes the letters 'CNC'.",
    },
    observations: [
      obs("seating_surface", "Loose tufted seat cushion present within a framed wooden seat platform; clearly a seating form", 95),
      obs("backrest_present", "Upholstered backrest present", 95),
      obs("armchair_form", "Full upholstered arms continuing to flared arm terminals; classic armchair form", 92),
      obs("barrel_tub_back", "Curved continuous barrel/tub back rail wraps from one arm around through back", 90),
      obs("cane_panel_sides", "Both side panels feature woven cane in open hexagonal weave; machine-pressed sheet cane appearance", 85),
      obs("pressed_sheet_cane", "Machine-pressed sheet cane with regular geometric repeat", 85),
      obs("tapered_legs", "Square-section tapered front legs with incised panel carving near top", 88),
      obs("block_corner_detail", "Block-corner detail at the junction of arm and leg", 82),
      obs("decorative_rosette_applique", "Carved rosette applique blocks at arm terminals", 84),
      obs("neoclassical_revival_cues", "Tapered legs + rosette applique + block corners read as neoclassical revival vocabulary", 80),
      obs("possible_maker_mark_incised", "Possible incised maker mark partially legible near back rail", 60),
      obs("velvet_cover", "Velvet upholstery cover on seat, back, and arms", 90),
      obs("button_tufting", "Button-tufted back and seat cushion", 88),
      obs("foam_padding", "Foam padding under velvet cover (modern foam compression)", 75),
      obs("arm_upholstery", "Full upholstered arms", 92),
      obs("wood_species_walnut_group", "Visible frame wood reads as walnut group", 80),
      obs("shellac_intact", "Shellac finish appears intact on exposed wood", 70),
      obs("wear_at_arm_terminals", "Wear and minor abrasion at arm terminals consistent with use", 70),
      obs("fully_upholstered", "Frame is fully upholstered; seat, back, and arms covered", 92),
      // The "secondary_surface" observation is what triggered telephone-bench
      // misrouting pre-fix: a small side-attached writing/holding surface was
      // perceived in-frame on the lounge chair photo.
      obs("secondary_surface", "Small flat surface visible adjacent to one arm", 55),
    ],
  },
};

// Fixture 7: Golden Oak dresser misdiagnosed as American Classical / Empire
// c. 1845–1850. Synthesized from a real diagnostic trace (May 2026) where:
//   - Form correctly read as form_chest_of_drawers
//   - Style attribution incorrectly anchored to style_family_american_classical
//     (0.83 confidence, matched only on the single token "empire" from
//     `empire_transitional_style`)
//   - 10 style waves surfaced across american_classical/rococo_revival/
//     contemporary_transitional families with empty matched_signals (Layer 1
//     + Layer 2 passed the gate without Layer 3 because attribution ≥0.6)
//   - Style_wave dating layer polluted to 1845–2025
//   - Convergence picked the 1845–1850 zone (hardware + style + style_wave =
//     3 layers, narrowest) over the 1890–1900 zone (form + hardware +
//     style_wave = 3 layers, wider) despite hardware being all replacement-
//     risk porcelain casters and round wood knobs
//   - round_wood_knob dated as "post-1750" because the canonical period_associations
//     first entry is open-ended ("Continuous use" from 1750); the curated peak
//     "Especially common 1820-1910" was ignored by the first-wins rule
//   - golden_oak_era_possible LLM clue had zero references in the engine
// Expected post-fix behavior:
//   - form = form_chest_of_drawers (unchanged — was already correct)
//   - style attribution NOT american_classical, OR confidence sharply reduced
//   - style_family_golden_oak_era now in the alternates / structural pattern set
//   - No 10-wave proliferation; only design-signal-matching waves surface
//   - working range pulled toward c. 1890–1915 (Golden Oak peak), not 1845–1850
//   - round_wood_knob dateHint reads as "c. 1820–1910" (peak), not "post-1750"
const GOLDEN_OAK_DRESSER_MISDIAGNOSED_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-golden-oak-dresser-misdiagnosed" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: {
    ...BASE_INTAKE,
    primary_wood_guess: "oak",
    user_category_guess: "dresser",
    has_drawers: true,
    condition_notes:
      "oak chest of drawers; flat-sawn cathedral grain on drawer fronts and case sides; two over four drawer layout with curved/rounded upper drawers; round wood knobs throughout; lock escutcheons on lower drawers; porcelain casters at base; horizontal plank back; wood-on-wood drawer runners; bracket feet with scrolled profile; flat overhanging top",
  },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Oak chest of drawers / dresser with bold flat-sawn cathedral grain across drawer fronts, case sides, and top; ring-porous pore structure consistent with red oak (no visible ray fleck — flat-sawn rather than quarter-sawn). Two over four drawer configuration: upper row of two small side-by-side drawers with a curved/rounded drawer rail below them; lower rows are full-width graduated drawers. Round wood knobs throughout; lock escutcheons on lower drawers. Porcelain casters at base. Bracket feet with a scrolled profile. Flat overhanging top. Horizontal plank back constructed from multiple solid wood boards with visible seam lines. Drawer interiors show solid single-board drawer bottoms in pale secondary wood (pine/poplar). Drawer sides show wear consistent with wood-on-wood drawer runners. No hand-cut dovetails visible at case corners (rabbet or butt joint construction). Honey-amber Golden Oak era finish.",
    },
    observations: [
      obs("multiple_drawer_case", "Two-over-four drawer configuration; chest-of-drawers form", 92),
      obs("drawer_present", "Multiple drawers present", 95),
      obs("two_over_four_drawer_configuration", "Top row of two small drawers; lower rows full-width graduated", 88),
      obs("curved_drawer_rail", "Curved/rounded drawer rail divides upper drawers from lower stack", 80),
      obs("scrolled_bracket_feet", "Bracket feet with shallow scrolled profile at base", 78),
      obs("flat_top_overhanging", "Flat top with broad overhang on all three sides", 75),
      obs("wood_species_oak", "Primary wood reads as oak (ring-porous open grain)", 90),
      obs("flat_sawn_oak_grain", "Bold cathedral flat-sawn oak grain across fronts, sides, and top; no ray fleck (not quarter-sawn)", 88),
      obs("golden_oak_era_possible", "Honey-amber finish + flat-sawn oak + factory-era proportions read as Golden Oak Era production", 82),
      obs("empire_transitional_style", "Curved upper drawer rail + overhanging top read as transitional late-Empire decorative vocabulary on a factory case", 60),
      obs("solid_wood_construction", "Drawer fronts, sides, and bottoms read as solid wood throughout; no plywood lamination at edges", 85),
      obs("solid_plank_back", "Back panel constructed from multiple horizontal solid wood boards with visible seam lines (pre-plywood method)", 82),
      obs("back_panel_horizontal_boards", "Horizontal plank back, multiple boards", 82),
      obs("frame_and_panel_sides", "Side construction shows central floating panel framed by stiles and rails", 80),
      obs("drawer_side_secondary_wood", "Drawer sides in a lighter secondary wood (pine/poplar), distinct from oak drawer fronts", 80),
      obs("secondary_wood_drawer_bottom", "Drawer bottoms in pale secondary wood (pine/poplar)", 80),
      obs("drawer_kicker_runner_system", "Wood-on-wood drawer runner/kicker system; no metal slides", 80),
      obs("case_corner_joinery", "Case side meets top board with rabbet or butt joint at corners; no visible hand-cut dovetail tails", 70),
      obs("round_wood_knob", "Round turned wood knobs on all drawers", 85),
      obs("lock_escutcheons", "Lock escutcheons visible on lower drawers", 75),
      obs("porcelain_caster", "Porcelain casters at base (likely replacement; one shows mismatched chip)", 70),
      obs("finish_worn_not_refinished", "Honey-amber finish appears original; wear consistent with age, not refinishing", 70),
      obs("age_darkening_patina", "Even age-darkening across exposed oak surfaces", 70),
      obs("structural_integrity", "Case structurally tight; no significant racking or repair evidence", 75),
      obs("cabriole_leg", "No cabriole legs visible — bracket feet only (negative observation captured by the LLM as a style-vocabulary contrast cue)", 30),
    ],
  },
};

// Fixture 8: Transitional Victorian eclectic piece carrying BOTH Rococo
// Revival vocabulary (serpentine curves, scroll/floral carving, naturalistic
// motifs) AND Renaissance Revival vocabulary (architectural mass, pediment
// top, burled panels, incised medallions). Exercises the new
// engineStyleIntersection logic (May 2026 session): when two style
// attributions surface with overlapping date envelopes, the intersection
// (here c. 1860–1870 — the high Rococo Revival 1845-1870 ∩ Renaissance
// Revival 1860-1885 overlap) is the most likely production window and
// becomes a confirmation signal rather than a "competing attributions"
// conflict. Most real Victorian pieces are transitional like this.
const TRANSITIONAL_ROCOCO_RENAISSANCE_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-transitional-rococo-renaissance" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: {
    ...BASE_INTAKE,
    primary_wood_guess: "walnut",
    user_category_guess: "parlor table",
    condition_notes:
      "Mid-Victorian walnut parlor table with serpentine front and scrolled apron; burled walnut panels with incised medallions; small architectural pediment with central rosette; marble top removed; cabriole-like front legs with carved floral/grape clusters at knees",
  },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Mid-Victorian walnut parlor table mixing rococo revival and renaissance revival vocabularies. Serpentine front rail with scrolled apron and floral/grape naturalistic carving at the knees of the cabriole-like front legs (rococo revival vocabulary). Burled walnut panels on the apron framed by incised renaissance medallions and a small architectural pediment with central rosette (renaissance revival vocabulary). Marble top removed (rectangular shadow visible on the carcass top). Walnut throughout the show surfaces; pine secondary. Machine-cut dovetails on the apron joinery. Shellac finish.",
    },
    observations: [
      // Rococo Revival vocabulary — fires rococo_revival_pattern + token "rococo"
      obs("scroll_carving", "Scrolled apron with bold S-scroll motifs on the front rail", 85),
      obs("floral_carving", "Carved floral and grape clusters at the knees of the cabriole front legs", 88),
      obs("serpentine_front", "Pronounced serpentine front rail with curved corner returns", 88),
      obs("cabriole_leg", "Cabriole-like front legs with carved floral knees, classic rococo revival vocabulary", 82),
      obs("naturalistic_victorian_carving", "Naturalistic rococo revival carving program — leaves, grapes, scrolls in continuous flow across the apron", 80),
      // Renaissance Revival vocabulary — token "renaissance" + architectural-mass cues
      obs("renaissance_revival_pediment", "Small architectural renaissance pediment over center of apron with central carved rosette", 82),
      obs("burled_walnut_panels", "Burled walnut decorative panels framed by incised renaissance medallions", 85),
      obs("incised_medallion", "Incised renaissance-style medallion carving framing the burled panels", 80),
      obs("architectural_mass", "Architectural mass + pediment treatment characteristic of renaissance revival case furniture", 75),
      obs("marble_top_evidence", "Rectangular shadow on carcass top indicates a removed marble top (renaissance revival convention)", 70),
      // Construction / material / fasteners — lands in the 1860s-1880s window
      obs("wood_species_walnut_group", "Walnut throughout the show surfaces; characteristic mid-Victorian primary wood", 90),
      obs("machine_dovetails", "Machine-cut dovetails on apron drawer joinery", 88),
      obs("mortise_and_tenon", "Mortise-and-tenon apron-to-leg joinery", 82),
      obs("cut_nail", "Square tapered cut nails on secondary surfaces", 78),
      obs("shellac_intact", "Shellac finish appears intact on exposed walnut", 70),
      obs("drawer_present", "Single apron drawer", 80),
      obs("secondary_wood_drawer_bottom", "Pine secondary wood on drawer bottom and dust panel", 75),
    ],
  },
};

// Fixture 9: 1980s-90s decorator's fantasy reproduction carrying BOTH
// Chippendale vocabulary (cabriole legs, claw-and-ball feet, pierced
// splat, shell carving) AND Art Deco vocabulary (waterfall edges, stepped
// profile, chrome hardware, geometric veneer). This is an "impossible"
// historical pairing per lib/constraints/styleCompatibility.ts —
// original Chippendale ends c. 1785 and Art Deco begins c. 1925, so any
// piece carrying both vocabularies is reproduction, decorator's mix,
// fantasy, or LLM mis-read. Exercises detectImpossiblePairs() and the
// p5 reproduction-signal conflict surfacing.
const CHIPPENDALE_ART_DECO_FANTASY_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-chippendale-art-deco-fantasy" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: {
    ...BASE_INTAKE,
    primary_wood_guess: "mahogany",
    user_category_guess: "side chair",
    condition_notes:
      "1980s-90s decorator-styled side chair mixing Chippendale leg/splat vocabulary with Art Deco waterfall edges and chrome trim; phillips screws throughout; mahogany veneer over plywood substrate",
  },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Side chair with mixed-vocabulary fantasy design. Chippendale-style cabriole legs with claw-and-ball feet at front; pierced Chippendale splat with carved shell motif at the crest. But the apron carries a waterfall edge with stepped profile, the front rail has chrome trim, and the underside shows phillips screws securing plywood drawer slip rails. Geometric veneer pattern on the apron face. Reads as an 1980s or 1990s decorator's Chippendale-Deco fantasy piece, not original-period production.",
    },
    observations: [
      // Chippendale vocabulary — fires style_family_chippendale via token matches
      obs("cabriole_leg", "Chippendale-style cabriole legs at the front of the chair", 88),
      obs("claw_or_pad_foot", "Carved claw-and-ball feet on the front Chippendale legs", 85),
      obs("shell_carving", "Carved shell motif at the crest rail, Chippendale vocabulary", 82),
      obs("pierced_splat", "Pierced Chippendale-style center splat with C-scroll fretwork", 85),
      obs("chippendale_pattern", "Overall splat + cabriole + claw-foot + shell program reads as Chippendale-style", 80),
      // Art Deco vocabulary — fires art_deco_pattern detector + token matches
      obs("waterfall_edge", "Apron carries a pronounced waterfall edge profile", 80),
      obs("stepped_profile", "Stepped geometric profile at the front rail of the apron", 78),
      obs("chrome_hardware", "Chrome trim band on the front rail and chrome accent at the leg-to-rail junction", 85),
      obs("geometric_veneer", "Geometric Art Deco veneer pattern across the apron face", 75),
      // Construction giveaways for reproduction-era production
      obs("phillips_screw", "Phillips-head screws securing plywood slip rails under the seat", 95),
      obs("plywood_structural", "Plywood substrate visible at the seat underside, mahogany veneer over plywood", 90),
      obs("wood_species_mahogany_group", "Mahogany veneer on show surfaces", 80),
      obs("machine_dovetails", "Machine-cut joinery on apron-to-leg connections", 82),
    ],
  },
};

// Fixture 10: Centennial Colonial Revival Chippendale chest of drawers
// c. 1900. Colonial Revival × Chippendale is explicitly "stacked_revival"
// per the canonical compatibility matrix (Chippendale Revival is one of
// the most common Colonial Revival vocabularies, especially in mahogany
// dining and case furniture). Exercises:
//   - both attributions surfacing above the 0.5 confidence floor
//   - engine flagging Chippendale alternative in
//     p3.stacked_revival_partner_ids
//   - intersection logic SUPPRESSING the transitional convergence
//     framing (no best_style_intersection)
//   - p5 NOT surfacing "transitional convergence" prose for this pair
//   - chart's partner Style row suppressed (verified via the engine-side
//     suppressed_partner_ids list that drives the chart filter)
const CENTENNIAL_COLONIAL_REVIVAL_CHIPPENDALE_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-centennial-colonial-revival-chippendale" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: {
    ...BASE_INTAKE,
    primary_wood_guess: "mahogany",
    user_category_guess: "chest of drawers",
    has_drawers: true,
    condition_notes:
      "Centennial-era academic Colonial Revival Chippendale chest of drawers, c. 1900. Mahogany show surfaces; cabriole legs with ball-and-claw feet; carved shell motif on the apron; pierced cresting; machine-cut dovetails on drawer construction.",
  },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Academic Centennial Colonial Revival Chippendale chest of drawers c. 1900. Mahogany show wood with carved Chippendale-style shell motif at the apron, cabriole legs terminating in ball-and-claw feet, and pierced Chippendale fretwork at the cresting. Machine-cut dovetails throughout the drawer construction (no hand-cut joinery). Solid plank back panel. Standard Centennial-era academic Colonial Revival production — revives Chippendale vocabulary at scale through Grand Rapids-style factory methods.",
    },
    observations: [
      // Form / structure
      obs("multiple_drawer_case", "Chest of drawers with four full-width graduated drawers", 92),
      obs("drawer_present", "Multiple drawers visible", 95),
      obs("symmetrical_case_form", "Symmetrical case form characteristic of Colonial Revival case furniture", 80),
      // Chippendale vocabulary
      obs("cabriole_leg", "Cabriole legs with C-curve at front of case", 88),
      obs("claw_or_pad_foot", "Ball-and-claw feet on front cabriole legs, classic Chippendale vocabulary", 85),
      obs("shell_carving", "Carved shell motif at the apron, Chippendale shell carving program", 82),
      obs("pierced_splat", "Pierced Chippendale fretwork at the cresting above the top drawer", 78),
      // chippendale_pattern routes via STRUCTURAL_PATTERN_FAMILY to
      // style_family_chippendale so the family enters structuralFamiliesPresent
      // alongside Colonial Revival (via colonial_revival_cues), preventing the
      // 30% competitive suppression that would otherwise drop Chippendale below
      // the single-token confidence floor.
      obs("chippendale_pattern", "Overall splat + cabriole + claw-foot + shell program reads as Chippendale-style", 80),
      // Colonial Revival markers — Centennial-era academic production
      obs("centennial_colonial_revival_pattern", "Academic Centennial Colonial Revival production reviving Chippendale vocabulary at scale", 80),
      obs("colonial_revival_cues", "Restrained classical shaping and factory-era proportions consistent with Colonial Revival reuse of Chippendale", 78),
      // Construction giveaways for post-1876 production
      obs("machine_dovetails", "Machine-cut dovetails throughout drawer construction; no hand-cut joinery visible", 90),
      obs("wood_species_mahogany_group", "Mahogany show wood across drawer fronts, sides, and case", 85),
      obs("solid_plank_back", "Solid plank back panel", 78),
      obs("secondary_wood_drawer_bottom", "Pale secondary wood (pine/poplar) on drawer bottoms", 75),
    ],
  },
};

// Fixture: roll-top desk — exercises the cover-mechanism cluster wiring.
// Slatted/S-roll rolling cover with no "cylinder" language must route to the
// newly-reachable form_roll_top_desk (not the rigid cylinder desk), and the
// interior pigeonholes must be suppressed as a sub-feature (deskFormDominant).
const ROLL_TOP_DESK_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-roll-top-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "oak", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Quarter-sawn oak roll-top desk with an S-roll slatted tambour cover that retracts into a curved housing; fitted interior of pigeonholes and small drawers; double-pedestal kneehole base.",
    },
    observations: [
      obs("writing_surface", "Fixed writing surface revealed when the slatted cover retracts", 85),
      obs("pigeonholes", "Fitted interior of pigeonholes and small drawers", 80),
    ],
  },
};

// Fixture: tambour desk — sliding tambour, smaller/ladies' scale, no slat/roll
// or cylinder language → form_tambour_desk.
const TAMBOUR_DESK_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-tambour-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "mahogany", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Small mahogany tambour writing desk; sliding tambour shutters close over a fitted interior; ladies' scale on tapered legs.",
    },
    observations: [obs("writing_surface", "Writing surface behind sliding tambour shutters", 82)],
  },
};

// Fixture: Wooton desk — cabinet-office secretary with hinged outer doors;
// explicit Wooton naming → form_wooton_desk.
const WOOTON_DESK_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-wooton-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "walnut", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Wooton patent cabinet office secretary desk; rotary type with a fitted pigeonhole interior enclosed behind two hinged outer doors.",
    },
    observations: [obs("pigeonholes", "Fitted pigeonhole interior behind hinged outer doors", 80)],
  },
};

// Control fixture: rigid cylinder desk — confirms the cover-cluster wiring does
// NOT regress existing cylinder routing (form_cylinder_desk stays the pick).
const CYLINDER_DESK_CONTROL_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-cylinder-desk-control" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "mahogany", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Bureau à cylindre with a rigid curved cylinder cover (cylinder closure) over a fitted writing interior and kneehole base.",
    },
    observations: [
      obs("cylinder_roll", "Rigid curved cylinder closure", 88),
      obs("pigeonholes", "Interior letter slots and pigeonholes", 78),
    ],
  },
};

// Institutional / public-task desk cluster fixtures. Each gates on its
// authored distinctive language; the chain must keep cousins separate
// (clerk's vs standing; school vs teacher's; reception vs transaction).
const SCHOOL_DESK_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-school-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "oak", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Cast-iron and oak one-room schoolhouse desk; lift-lid school desk with an attached-seat sled base and a tablet-arm writing surface.",
    },
    observations: [obs("writing_surface", "Hinged lift-lid student writing surface", 80)],
  },
};
const CLERK_VS_STANDING_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-clerks-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "walnut", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      // "standing ledger desk" deliberately mixes posture + occupational
      // language; the chain must pick clerk's (occupational wins).
      raw_text:
        "Tall sloped standing ledger desk from a counting-house; high bookkeeper's desk with a slanted ledger surface used with a stool.",
    },
    observations: [obs("writing_surface", "Sloped ledger writing surface", 80)],
  },
};
const RECEPTION_DESK_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-reception-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Hotel lobby reception desk / front desk with a raised transaction counter and concierge check-in station.",
    },
    observations: [obs("writing_surface", "Raised counter work surface", 78)],
  },
};
const TRANSACTION_COUNTER_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-transaction-counter-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Bank teller counter desk / cashier checkout station with a transaction surface and register well.",
    },
    observations: [obs("writing_surface", "Teller transaction surface", 78)],
  },
};

// Seated pedestal / knee + multi-user cluster fixtures.
// Davenport must beat the sofa "Davenport" (map sends bare "Davenport" to
// form_sofa) via desk-context cues; partner's must beat executive when the
// piece is two-sided; pedestal is the metal-tanker catch-all; kneehole must
// beat pedestal when the central opening is the emphasis.
const DAVENPORT_DESK_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-davenport-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "mahogany", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Compact Victorian Davenport desk; small ship captain's writing desk with a sloped lift-top writing surface over a bank of side drawers.",
    },
    observations: [obs("writing_surface", "Sloped lift-top writing surface", 80)],
  },
};
const PARTNERS_EXECUTIVE_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-partners-executive-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "oak", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      // "executive partner's desk" appears in BOTH executive and partner's
      // aliases; two-sided access must win (partner's), per cousin contrast.
      raw_text:
        "Large executive partner's desk; double-sided pedestal desk finished on both faces for two users seated face-to-face.",
    },
    observations: [obs("writing_surface", "Leather-inset writing surface on both sides", 80)],
  },
};
const PEDESTAL_TANKER_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-pedestal-tanker-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      // Steel piece -> blocksTraditionalWoodForms; "Pedestal desk" label must
      // still emit (not in the blocked-traditional substring list).
      raw_text:
        "Mid-century gray steel government tanker desk; double-pedestal office desk with stamped-steel drawer banks and a linoleum top.",
    },
    observations: [obs("metal_frame", "Stamped sheet-steel case and pedestals", 85)],
  },
};
const KNEEHOLE_DESK_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-kneehole-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "walnut", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Georgian kneehole desk; compact kneehole writing desk with a recessed central knee opening flanked by short drawer stacks.",
    },
    observations: [obs("writing_surface", "Flat writing top over a central kneehole recess", 80)],
  },
};

// Office-equipment cluster fixtures. Typewriter must beat computer (drop-well
// vs keyboard/monitor); an "Executive L-desk" must route to L-shaped (config
// beats the executive tier); modular/cubicle systems are their own form.
const TYPEWRITER_DESK_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-typewriter-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "oak", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Early-20th-century secretarial typewriter desk with a spring-loaded drop-well that lifts the machine platform up to the work surface.",
    },
    observations: [obs("writing_surface", "Work surface beside a typewriter drop well", 80)],
  },
};
const COMPUTER_GAMING_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-computer-gaming-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Black laminate multi-monitor RGB gaming desk / computer desk with a sliding keyboard tray, monitor shelf, and cable management grommets.",
    },
    observations: [obs("laminate_surface", "Black laminate work surface with cable grommets", 80)],
  },
};
const L_SHAPED_EXECUTIVE_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-l-shaped-executive-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "walnut", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      // "Executive L-desk" is in both alias lists; the L configuration wins.
      raw_text:
        "Executive L-desk: a walnut-veneer office desk with a single perpendicular return forming an L-shaped configuration.",
    },
    observations: [obs("writing_surface", "Main work surface with one perpendicular return", 80)],
  },
};
const MODULAR_CUBICLE_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-modular-cubicle-desk" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Herman Miller Action Office panel-based cubicle workstation; modular systems-furniture desk with hang-on work surfaces and partition panels.",
    },
    observations: [obs("laminate_surface", "Hang-on laminate work surface on partition panels", 80)],
  },
};

// Fall/slope-front + open writing-surface cluster fixtures.
const mkDesk = (id: string, wood: string, raw_text: string, ob = "writing_surface", obDesc = "Writing surface"): Fixture => ({
  caseData: { id: `trace-fixture-${id}` },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: wood, user_category_guess: "desk" },
  perceptionStub: {
    perception: { ...BASE_PERCEPTION, raw_text },
    observations: [obs(ob, obDesc, 80)],
  },
});
const mkTable = (id: string, wood: string, raw_text: string, extraObs: Array<{ clue: string; description: string }> = []): Fixture => ({
  caseData: { id: `trace-fixture-${id}` },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: wood, user_category_guess: "table" },
  perceptionStub: {
    perception: { ...BASE_PERCEPTION, raw_text },
    observations: extraObs.map((o) => obs(o.clue, o.description, 82)),
  },
});
// Escritoire must beat the generic drop-front Secretary route (cabinet-like
// fall-front, no bookcase) — deskFormDominant suppresses the Secretary emit.
const ESCRITOIRE_FIXTURE = mkDesk("escritoire", "oak",
  "Cabinet escritoire: a tall cabinet-like fall-front writing desk with a vertical fall lid over a fitted pigeonhole interior, no bookcase top.",
  "pigeonholes", "Fitted pigeonhole interior behind the fall");
const ABATTANT_FIXTURE = mkDesk("abattant", "mahogany",
  "Secrétaire à abattant: a tall French cabinet desk with a flat vertical fall front that drops to form the writing surface over interior drawers.",
  "pigeonholes", "Interior drawers and pigeonholes behind the abattant fall");
const GRADINS_FIXTURE = mkDesk("gradins", "walnut",
  "Bureau à gradins: a writing desk with a stepped tiered superstructure of small drawers (gradins) and a gallery across the back of the work surface.");
// Control: a true bookcase-topped drop-front secretary must STILL route to the
// Secretary form (no fall-front-family term present).
const SECRETARY_DROP_FRONT_CONTROL_FIXTURE: Fixture = {
  caseData: { id: "trace-fixture-secretary-drop-front-control" },
  images: [{ data_url: "data:image/png;base64,", image_type: "front" }],
  intake: { ...BASE_INTAKE, primary_wood_guess: "mahogany", user_category_guess: "desk" },
  perceptionStub: {
    perception: {
      ...BASE_PERCEPTION,
      raw_text:
        "Drop-front secretary desk with a glazed bookcase top over a slant writing surface and a chest of drawers below.",
    },
    observations: [
      obs("drop_front_desk", "Hinged drop-front writing surface", 88),
      obs("pigeonholes", "Interior pigeonholes", 78),
    ],
  },
};
const BONHEUR_FIXTURE = mkDesk("bonheur-du-jour", "satinwood",
  "Bonheur du jour: a small ladies' writing table with a raised cabinet superstructure of small drawers and a leather-inset writing slide.");
const CARLTON_FIXTURE = mkDesk("carlton-house", "mahogany",
  "Carlton House desk: a writing desk with a curved-back bank of small drawers and pigeonholes wrapping a U-shaped leather-topped writing surface.");
const BUREAU_PLAT_FIXTURE = mkDesk("bureau-plat", "mahogany",
  "Bureau plat: a flat-top French writing table / formal writing desk with a leather-inset open work surface and three frieze drawers, gilt-bronze mounts.");
const KIDNEY_FIXTURE = mkDesk("kidney", "walnut",
  "Victorian kidney desk: a kidney-shaped writing desk with a leather top and curved drawer pedestals.");

const FIXTURES: Record<string, Fixture> = {
  placeholder: PLACEHOLDER_FIXTURE,
  roll_top_desk: ROLL_TOP_DESK_FIXTURE,
  tambour_desk: TAMBOUR_DESK_FIXTURE,
  wooton_desk: WOOTON_DESK_FIXTURE,
  cylinder_desk_control: CYLINDER_DESK_CONTROL_FIXTURE,
  school_desk: SCHOOL_DESK_FIXTURE,
  clerks_desk: CLERK_VS_STANDING_FIXTURE,
  reception_desk: RECEPTION_DESK_FIXTURE,
  transaction_counter_desk: TRANSACTION_COUNTER_FIXTURE,
  davenport_desk: DAVENPORT_DESK_FIXTURE,
  partners_executive_desk: PARTNERS_EXECUTIVE_FIXTURE,
  pedestal_tanker_desk: PEDESTAL_TANKER_FIXTURE,
  kneehole_desk: KNEEHOLE_DESK_FIXTURE,
  typewriter_desk: TYPEWRITER_DESK_FIXTURE,
  computer_gaming_desk: COMPUTER_GAMING_FIXTURE,
  l_shaped_executive_desk: L_SHAPED_EXECUTIVE_FIXTURE,
  modular_cubicle_desk: MODULAR_CUBICLE_FIXTURE,
  escritoire_desk: ESCRITOIRE_FIXTURE,
  abattant_desk: ABATTANT_FIXTURE,
  gradins_desk: GRADINS_FIXTURE,
  secretary_drop_front_control: SECRETARY_DROP_FRONT_CONTROL_FIXTURE,
  bonheur_du_jour_desk: BONHEUR_FIXTURE,
  carlton_house_desk: CARLTON_FIXTURE,
  bureau_plat_desk: BUREAU_PLAT_FIXTURE,
  kidney_desk: KIDNEY_FIXTURE,
  murphy_desk: mkDesk("murphy", "birch",
    "Murphy desk: a fold-down wall desk that folds away into a wall-bed cabinet system, with a hinged work surface."),
  built_in_desk: mkDesk("built-in", "oak",
    "Custom built-in desk: an alcove millwork desk permanently installed as architectural cabinetry under a stair, matching the room's built-in bookcases."),
  hutch_desk: mkDesk("hutch", "maple",
    "Student hutch desk: a desk with an added open upper hutch of shelves and cubbies above the work surface."),
  armoire_desk: mkDesk("armoire", "cherry",
    "Computer armoire desk: a tall freestanding wardrobe-like cabinet that encloses a fold-away desk work surface behind doors (hideaway desk)."),
  wall_unit_desk: mkDesk("wall-unit", "walnut",
    "Home office wall unit desk: a wall system combining a library bookcase wall unit with substantial cabinet storage and an integrated work surface."),
  wall_desk: mkDesk("wall", "pine",
    "Floating wall desk: a compact wall-mounted writing surface, wall-hung and removable, with no floor support."),
  writing_box: mkDesk("writing-box", "rosewood",
    "Georgian writing box / writing slope: a portable case with a hinged leather-lined sloped writing surface, ink wells, and pen channels (a lap desk)."),
  field_desk: mkDesk("field", "oak",
    "Officer's campaign field desk: a portable folding knockdown military field desk with brass-bound corners and carrying handles for mobile work."),
  artists_desk: mkDesk("artists", "pine",
    "Tilting artist's desk: a drawing / drafting desk with an adjustable tilting work surface and a pencil ledge."),
  workbench_desk: mkDesk("workbench", "maple",
    "Jeweler's workbench desk: a heavy watchmaker's workbench desk with a tool-storage drawer bank and a durable work surface.",
    "metal_frame", "Steel-edged durable work surface"),
  tabletop_desk: mkDesk("tabletop", "walnut",
    "Tabletop desk: a small tabletop writing cabinet / tabletop secrétaire organizer meant to rest on a larger table."),
  laboratory_desk: mkDesk("laboratory", "oak",
    "Laboratory desk: a science research lab work desk / technician's desk with a chemical-resistant top and equipment shelf."),
  piano_desk: mkDesk("piano", "mahogany",
    "Upright piano conversion desk: a writing desk repurposed from a reclaimed piano case, keyboard area rebuilt as a work surface."),
  organ_desk: mkDesk("organ", "walnut",
    "Pump organ conversion desk: a reed organ case repurposed as a writing desk, stops and bellows removed."),
  sewing_machine_desk: mkDesk("sewing-machine", "oak",
    "Singer treadle-base sewing machine desk: a cabinet-form sewing machine desk converted to writing use on its original treadle base."),
  treadle_desk: mkDesk("treadle", "",
    "Industrial treadle base desk: a reclaimed cast-iron treadle base conversion fitted with a plank top as a desk.",
    "cast_iron", "Cast-iron treadle base"),
  telephone_desk: mkDesk("telephone", "oak",
    "Telephone desk: a small writing desk with a telephone shelf and a directory-compartment, no seat (a phone desk, not a gossip bench)."),
  drop_leaf_desk: mkDesk("drop-leaf", "cherry",
    "Compact drop-leaf writing desk: a writing desk with hinged drop leaves that extend the work surface."),
  gateleg_desk: mkDesk("gateleg", "oak",
    "William and Mary gateleg writing desk: a writing desk with swing-leg gate-leg supports under drop leaves."),
  converted_dressing_table_desk: mkDesk("converted-dressing-table", "walnut",
    "Converted vanity desk: a dressing table repurposed as a kneehole writing desk, mirror removed (dressing table desk)."),
  converted_industrial_desk: mkDesk("converted-industrial", "",
    "Reclaimed industrial desk: a factory cart converted into a writing desk - a machine base desk with a reclaimed butcher-block work surface.",
    "metal_frame", "Reclaimed steel factory-cart base"),
  converted_cabinet_desk: mkDesk("converted-cabinet", "pine",
    "Converted armoire desk: a wardrobe cabinet converted / repurposed into a desk with an added writing surface."),
  // Guard test: a converted workbench must route to converted-industrial, not
  // the purpose-built workbench-desk form (convertedSource yields the gate).
  converted_workbench_guard: mkDesk("converted-workbench", "",
    "Converted workbench desk: a reclaimed industrial workbench repurposed into an office desk with an added writing surface.",
    "metal_frame", "Reclaimed steel workbench base"),
  // ── Tables: shape/structure-defined cluster ──
  demilune_table: mkTable("demilune", "mahogany",
    "Federal demilune table: a half-moon semicircular console table with satinwood inlay, flat against the wall."),
  piecrust_table: mkTable("piecrust", "mahogany",
    "Chippendale piecrust tilt-top tea table: a round mahogany top with a carved scalloped pie-crust raised edge on a birdcage tripod base.",
    [{ clue: "pedestal_column", description: "Tripod birdcage pedestal" }]),
  tilt_top_table: mkTable("tilt-top", "walnut",
    "Tripod tilt-top tea table: a round top that tips to vertical on a birdcage over a turned pedestal tripod.",
    [{ clue: "pedestal_column", description: "Turned pedestal tripod" }]),
  drum_table: mkTable("drum", "mahogany",
    "Regency drum table: a round leather-topped drum table with frieze drawers over a central pedestal and splayed legs.",
    [{ clue: "pedestal_column", description: "Central pedestal" }]),
  pembroke_table: mkTable("pembroke", "mahogany",
    "Sheraton Pembroke table: a small drop-leaf table with two short hinged leaves and a single apron drawer on tapered legs.",
    [{ clue: "drop_leaf_hinged", description: "Short hinged drop leaves" }]),
  sutherland_table: mkTable("sutherland", "walnut",
    "Victorian Sutherland table: a very narrow gateleg drop-leaf table with a thin closed footprint and swing-leg supports.",
    [{ clue: "gateleg_support", description: "Swing gate-leg supports" }, { clue: "drop_leaf_hinged", description: "Drop leaves" }]),
  trestle_table: mkTable("trestle", "oak",
    "Jacobean refectory trestle table: a long oak top on two trestle end supports joined by a stretcher."),
  nesting_tables: mkTable("nesting", "teak",
    "Mid-century nest of tables: a set of three graduated nesting tables that stack beneath one another."),
  etagere_table: mkTable("etagere", "brass",
    "Brass and glass etagere table: a tiered display table with three open glass shelves."),
  lowboy_table: mkTable("lowboy", "walnut",
    "Queen Anne lowboy: a low table-height case with a row of apron drawers raised on four cabriole legs."),
  // Pedestal-column split.
  candle_stand: mkTable("candle-stand", "cherry",
    "Federal candle stand: a small tripod candle stand with a round dished top on a turned column sized to hold a single candle.",
    [{ clue: "pedestal_column", description: "Turned column on tripod" }]),
  plant_stand: mkTable("plant-stand", "oak",
    "Victorian plant stand / fern stand: a tall narrow pedestal stand sized to display a single potted plant or jardinière.",
    [{ clue: "pedestal_column", description: "Tall narrow pedestal" }]),
  pedestal_table_split: mkTable("pedestal-table", "mahogany",
    "Pedestal dining table: a large round table top carried on a central pedestal column with splayed legs (tulip pedestal base).",
    [{ clue: "pedestal_column", description: "Central pedestal column" }]),
  round_pedestal_drum_control: mkTable("round-pedestal-drum", "mahogany",
    "Round pedestal table with a leather top and frieze drawers.",
    [{ clue: "pedestal_column", description: "Central pedestal" }]),
  // Height-defined cluster (round-up-to-dominant).
  coffee_table: mkTable("coffee", "teak",
    "Mid-century teak coffee table: a long low table placed in front of the sofa for drinks and books."),
  cocktail_table: mkTable("cocktail", "brass",
    "Hollywood Regency cocktail table: a low glass-and-brass cocktail table with a mirrored tray top."),
  pub_table: mkTable("pub", "oak",
    "Pub table: a tall bar-height tavern table for use standing or on stools."),
  bistro_table: mkTable("bistro", "iron",
    "Parisian sidewalk café table: a small round counter-height bistro table with a cast-iron base and marble top."),
  kitchen_table: mkTable("kitchen", "pine",
    "1950s enamel-top kitchen table: a porcelain enamel-top farmhouse kitchen utility table."),
  breakfast_table: mkTable("breakfast", "maple",
    "Breakfast nook table: a small chrome dinette breakfast table for an apartment kitchen nook."),
  dining_table: mkTable("dining", "mahogany",
    "Formal dining room table: a large mahogany seated dining table for eight."),
  // Work-table cluster.
  drafting_table: mkTable("drafting", "oak",
    "Architect's drafting table: a large tilting drafting table / drawing table with an adjustable angled top and a pencil trough."),
  sewing_table: mkTable("sewing", "walnut",
    "Victorian sewing table: a small needlework table with a fitted sewing-supply drawer and a hinged work surface."),
  library_table: mkTable("library", "oak",
    "Arts and Crafts library table: a substantial oak reading/writing library table with two frieze drawers and a lower shelf."),
  writing_table: mkTable("writing", "mahogany",
    "Sheraton writing table: a seated writing table with a leather-inset open work surface and tapered legs."),
  work_table: mkTable("work", "pine",
    "Primitive work table: a task-oriented domestic work table with a scrubbed plank top."),
  roos_cedar_chest: ROOS_CEDAR_CHEST_FIXTURE,
  eastlake_dresser: EASTLAKE_DRESSER_FIXTURE,
  plywood_federal_repro: PLYWOOD_FEDERAL_REPRO_FIXTURE,
  pre_1860_piece: PRE_1860_PIECE_FIXTURE,
  mcm_plastic_chair: MCM_PLASTIC_CHAIR_FIXTURE,
  colonial_revival_lounge_chair: COLONIAL_REVIVAL_LOUNGE_CHAIR_MISDIAGNOSED_FIXTURE,
  golden_oak_dresser: GOLDEN_OAK_DRESSER_MISDIAGNOSED_FIXTURE,
  transitional_rococo_renaissance: TRANSITIONAL_ROCOCO_RENAISSANCE_FIXTURE,
  chippendale_art_deco_fantasy: CHIPPENDALE_ART_DECO_FANTASY_FIXTURE,
  centennial_colonial_revival_chippendale: CENTENNIAL_COLONIAL_REVIVAL_CHIPPENDALE_FIXTURE,
};

function parseArgs(): { piece: string | null; all: boolean } {
  const argv = (typeof process !== "undefined" ? process.argv : []).slice(2);
  let piece: string | null = null;
  let all = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--piece" && argv[i + 1]) {
      piece = String(argv[i + 1]);
      i++;
    } else if (argv[i] === "--all") {
      all = true;
    }
  }
  return { piece, all };
}

function loadFixture(piece: string | null): Fixture {
  if (piece && FIXTURES[piece]) return FIXTURES[piece];
  if (piece) {
    // eslint-disable-next-line no-console
    console.error(`[trace] --piece "${piece}" not found; using placeholder. Available: ${Object.keys(FIXTURES).join(", ")}`);
  }
  return PLACEHOLDER_FIXTURE;
}

async function runFixture(name: string, fixture: Fixture): Promise<any> {
  // Store generates its own case_id; capture it and pass to runAllPhases.
  const { case_id } = (API as any).createCase({ id: fixture.caseData.id });
  const caseData = { ...fixture.caseData, id: case_id };

  (PE as any).callClaude = async (_system: string, _content: any[], _mode: string) => {
    return { ok: true, parsed: fixture.perceptionStub, raw: JSON.stringify(fixture.perceptionStub) };
  };

  const phaseTimings: Array<{ phase: string; elapsed_ms: number; payload_keys: string[] }> = [];
  const t0 = Date.now();
  let lastT = t0;

  const onPhase = (phaseName: string, payload: any) => {
    const now = Date.now();
    const elapsed = now - lastT;
    lastT = now;
    const keys = payload && typeof payload === "object" ? Object.keys(payload) : [];
    phaseTimings.push({ phase: String(phaseName), elapsed_ms: elapsed, payload_keys: keys });
    // eslint-disable-next-line no-console
    console.error(`[trace:${name}] phase=${phaseName} elapsed_ms=${elapsed} keys=${keys.length}`);
  };

  const result: any = await (PE as any).runAllPhases(
    caseData,
    fixture.images,
    fixture.intake,
    onPhase
  );

  return {
    meta: { fixture_piece: name, total_ms: Date.now() - t0, phase_timings: phaseTimings },
    stage_outputs: result?.stage_outputs ?? null,
    final_report: result?.final_report ?? null,
    evidence_digest: result?.stage_outputs?.p0?.evidence_digest ?? null,
    observations: result?.stage_outputs?.p0?.observations ?? null,
    field_scan: result?.field_scan ?? null,
  };
}

async function main(): Promise<void> {
  const { piece, all } = parseArgs();

  if (all) {
    const outputs: Record<string, any> = {};
    for (const name of Object.keys(FIXTURES)) {
      outputs[name] = await runFixture(name, FIXTURES[name]);
    }
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(outputs, null, 2));
    return;
  }

  const name = piece && FIXTURES[piece] ? piece : "placeholder";
  const fixture = loadFixture(piece);
  const output = await runFixture(name, fixture);
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(output, null, 2));
}

main().then(
  () => {
    if (typeof process !== "undefined") process.exit(0);
  },
  (err: any) => {
    // eslint-disable-next-line no-console
    console.error("[trace] FATAL:", err && err.stack ? err.stack : err);
    if (typeof process !== "undefined") process.exit(1);
  }
);
