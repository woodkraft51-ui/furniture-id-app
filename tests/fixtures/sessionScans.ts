/**
 * Session scan corpus — reconstructed P0 observations from the Engine Trace of
 * scans reviewed in-session, so a candidate code change can be run through the
 * deterministic pipeline (PE.runAllPhases with p0 stubbed) and diffed against
 * the outcome the scan actually produced ("asSeen").
 *
 * FIDELITY NOTES:
 *  - observations are lifted verbatim from the trace's P0 Observations block
 *    (type/clue/description/confidence).
 *  - `negated`/`hard_negative` are INFERRED. Critically, they are set to match
 *    what the ORIGINAL run did, not what is "correct" — e.g. jute_webbing here
 *    means "No webbing" but the engine treated it as a positive clue, so
 *    negated=false. That reproduces the as-seen outcome; a #17 fix is tested by
 *    flipping it and re-running.
 *  - perception is minimal (raw_text empty); downstream maker-matching reads the
 *    label/visible_text observation descriptions, which are present.
 */

export type FixtureObservation = {
  type: string;
  clue: string;
  description: string;
  confidence: number;
  negated?: boolean;
  hard_negative?: boolean;
};

export type ScanFixture = {
  label: string;
  note?: string;
  observations: FixtureObservation[];
  perception?: Record<string, any>;
  intake?: Record<string, any>;
  // When set, the harness re-runs the P0 seating/spindle derivation on this text
  // (stripping previously-synthesized clues first) so P0-derivation fixes like the
  // seating-verb (#10) are exercised end-to-end instead of bypassed by the stub.
  rawText?: string;
  /** The outcome this scan actually produced, for the fidelity gate. */
  asSeen: {
    formId?: string;
    display?: string;
    styleContext?: string;
    finalStyleKind?: string;
    dateRange?: string;
    dateFloor?: number | null;
    dateCeiling?: number | null;
    confidence?: string;
  };
};

const minimalPerception = {
  labels: [], maker_names: [], materials: [], forms: [], functional_features: [],
  style_cues: [], construction_cues: [], condition_cues: [], visible_text: [], raw_text: "",
};

// ── Ladderback (country Chippendale rush-seat) — keystone for #2 / #111-b / #3 ──
// As-seen: form_ladderback_chair, "French Louis XVI Revival", c.1920–1930, High.
// P5 resolved hand_plane_chatter (pre-1880) over cabriole_leg, then date said 1920–1930.
const ladderback: ScanFixture = {
  label: "ladderback_country_chippendale",
  note: "P5 ruled pre-1880; date came out 1920–1930. cut_nail(1790–1890)+hand_plane_chatter(pre-1880) low-conf so #111 didn't clamp.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Rush-woven seat surface visible across all front, side, and back views; woven in traditional radiating pattern from corner to corner." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Tall ladder-back style backrest with three horizontal pierced splats and a shaped crest rail; all visible in front and back views." },
    { type: "style", clue: "pierced_splat_ladder_back", confidence: 52, description: "Three horizontal back slats each feature a symmetrical pierced openwork design with a central circular void flanked by scrolled cutouts; crest rail similarly pierced. This is a distinctive country/provincial interpretation of Chippendale-influenced ladder-back design." },
    { type: "style", clue: "serpentine_crest_rail", confidence: 52, description: "Crest rail has a gently serpentine or yoke-shaped profile with scrolled ends and central pierced decoration; visible in front and back views." },
    { type: "structure", clue: "tapered_leg", confidence: 82, description: "All four legs are square in section with slight taper toward the foot; no turning or cabriole shaping. Visible in front, side, and joinery closeup views." },
    { type: "structure", clue: "stretcher_system", confidence: 82, description: "Full H-stretcher system visible: front stretcher, rear stretcher, and two side stretchers connecting all four legs near the floor. Stretchers are rectangular in section." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 85, description: "Stretcher-to-leg and rail-to-leg joints appear to be mortise-and-tenon construction; shoulder lines visible at stretcher intersections with legs in joinery closeup images. No visible mechanical fasteners at these joints." },
    { type: "construction", clue: "pegged_mortise_and_tenon", confidence: 72, description: "A small circular peg or nail head is visible at the seat rail corner where the rail meets the rear leg (joinery closeup of seat corner). The peg appears oxidized and flush, consistent with a wooden peg or early cut nail securing a mortise-and-tenon joint." },
    { type: "materials", clue: "rush_seat_natural_fiber", confidence: 45, description: "Seat is woven with twisted natural rush or similar plant fiber (possibly sea grass or cattail rush); strands are irregular in diameter and show natural color variation from tan to dark brown, consistent with aged natural rush rather than paper fiber or synthetic cord." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "All frame members — legs, seat rails, stretchers, back posts, splats, and crest rail — appear to be solid wood throughout. No veneer, plywood, or laminate visible at any exposed edge or cross-section." },
    { type: "materials", clue: "wood_species_cherry_group", confidence: 55, description: "Wood exhibits warm reddish-brown tone with fine grain and smooth texture consistent with cherry (Prunus serotina). Could also be fruitwood or walnut; the fine grain, warm amber-red color, and absence of pronounced open pores or ray fleck suggest cherry or a similar diffuse-porous hardwood. Confidence moderate due to finish and lighting." },
    { type: "condition", clue: "age_wear_patina", confidence: 54, description: "Significant age-consistent wear visible on leg surfaces, seat rail corners, and stretchers: surface scratches, dark oxidation in grain, worn edges, and accumulated grime in recesses. Consistent with genuine long-term use rather than artificial distressing." },
    { type: "condition", clue: "rush_seat_wear_damage", confidence: 54, description: "Rush seat shows wear and partial breakage/fraying at the center area visible in the joinery closeup of the seat underside; strands are darkened and compressed from use. Some strands appear broken or missing near center." },
    { type: "condition", clue: "shellac_intact", confidence: 45, description: "Surface finish appears to be a warm amber oil or shellac finish; no thick plastic film visible. Finish shows wear-through at high-contact areas (leg edges, seat rail corners) consistent with original or early shellac/oil finish rather than polyurethane." },
    { type: "hardware", clue: "cut_nail", confidence: 45, description: "A small dark nail head is visible at the seat rail corner in the joinery closeup (seat corner detail image). The head appears slightly irregular and oxidized black; could be a cut nail or early wire nail. Insufficient resolution to confirm nail type with certainty." },
    { type: "style", clue: "country_provincial_chippendale_influence", confidence: 52, description: "The pierced splat ladder-back with scrolled openwork, serpentine crest rail, and square tapered legs without cabriole shaping reflects a country or provincial interpretation of Chippendale-influenced chair design. The form is consistent with American country chairs of the late 18th to early 19th century, or later revival/reproduction work in the same tradition." },
    { type: "construction", clue: "no_spring_seat", confidence: 96, description: "Seat is a woven rush surface directly on the seat frame with no upholstery, padding, or spring system. This is a traditional no-spring rush seat construction." },
    { type: "construction", clue: "jute_webbing", confidence: 90, description: "No webbing visible; seat support is provided entirely by the woven rush surface itself, which spans the seat frame opening." },
    { type: "structure", clue: "back_posts_continuous", confidence: 82, description: "Rear legs continue upward uninterrupted to form the back posts of the chair, a traditional chair construction method. Visible in side and back views." },
    { type: "style", clue: "no_armrest", confidence: 52, description: "Chair is a side chair with no arms; no armrests visible in any view." },
    { type: "condition", clue: "seat_rail_corner_wear", confidence: 54, description: "Seat rail corner blocks show significant surface scratching, dark staining, and edge wear consistent with long-term use and age. Visible in the joinery closeup of the seat corner." },
    { type: "construction", clue: "hand_plane_chatter", confidence: 35, description: "Stretcher and rail surfaces in the joinery closeups show slight surface irregularity and tool marks that may be consistent with hand planing, though the finish and age patina make definitive identification uncertain." },
    { type: "style", clue: "ladder_back_three_slat", confidence: 52, description: "Back has three horizontal slats (plus crest rail) in a ladder configuration; each slat features identical pierced openwork decoration. Consistent with ladder-back chair tradition spanning 18th–19th century American and European country furniture." },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "style", clue: "cabriole_leg", confidence: 72, description: "Cabriole legs are visible." },
  ],
  // asSeen REFRESHED to current production (post-#111-b, live on main). The
  // original live scan showed the BUG — c. 1920–1930 / "French Louis XVI Revival"
  // (revival_wave). #111-b's terminus cap fixed it to c. 1770–1880 / original_period;
  // this baseline now guards against re-breaking that.
  asSeen: {
    formId: "Ladderback chair",
    display: "Louis XVI / French Neoclassical Ladderback chair (also commonly called: Slat-back chair, Ladder chair)",
    styleContext: "Louis XVI / French Neoclassical",
    finalStyleKind: "original_period",
    dateRange: "c. 1770–1880",
    dateFloor: 1770,
    dateCeiling: 1880,
    confidence: "Moderate",
  },
};

// ── Victorian dome-top trunk — #111-b stress case (industrial saw + cut nails) ──
// As-seen: form_trunk, no style, c.1890–1920 Moderate. Carries circular_saw_arcs
// (toolmark 1830–1880) + cut_nail (1790–1890) — both ≤1900, which #111-b's
// blunt layer gate would treat as caps. circular_saw_arcs is an INDUSTRIAL-onset
// signal, so capping on its 1880 "ceiling" would be wrong. Descriptions are
// abbreviated — this piece has no style/maker attribution, so dating runs off
// clue-key date_hints, not prose.
const victorianTrunk: ScanFixture = {
  label: "victorian_dome_top_trunk",
  note: "Industrial circular_saw_arcs (1830–1880) + cut_nail (≤1890); should NOT be capped to ≤1880 by a saw-mark. OWNER-CONFIRMED: the circular_saw_arcs read is ERRONEOUS (no arcs on the real piece — worn pine secondary surfaces); the model self-hedged ('not clearly curved arcs at this resolution') yet emitted it at conf 45. Canonical 'don't cap/anchor on a misread, self-doubted toolmark' case.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "lift_lid", confidence: 68, description: "Dome-top hinged lid; lift-lid storage trunk form." },
    { type: "form", clue: "dome_top_trunk", confidence: 68, description: "Rounded/domed camelback lid, Victorian c. 1860–1900." },
    { type: "function", clue: "multiple_drawer_case", confidence: 70, description: "Trunk with lift lid for storage and transport; travel/steamer trunk." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "All panels solid wood planks, not plywood; multiple boards per panel with butt joints." },
    { type: "materials", clue: "wood_species_pine_group", confidence: 72, description: "Straight grain with knots, resinous, pine/softwood; flat-sawn bottom boards." },
    { type: "hardware", clue: "edge_strapping", confidence: 62, description: "Continuous iron strap banding on all edges, secured with dome-headed nails/tacks." },
    { type: "hardware", clue: "riveted_metal_joint", confidence: 45, description: "Banding nailed rather than riveted; dome-headed cut nails or tacks." },
    { type: "hardware", clue: "surface_mount_lock", confidence: 62, description: "Brass surface-mount lock plate with keyhole and hasp latch." },
    { type: "hardware", clue: "lock_escutcheons", confidence: 62, description: "Brass lock plate with circular keyhole escutcheon, heavy patina." },
    { type: "hardware", clue: "half_mortise_lock", confidence: 45, description: "Half-mortise or surface-mount trunk lock with hasp; Victorian c. 1860–1900." },
    { type: "hardware", clue: "ring_pull", confidence: 62, description: "Side handles are arched iron strap handles, not ring pulls." },
    { type: "hardware", clue: "hand_forged_metal_joint", confidence: 62, description: "Rough-textured iron strap handle consistent with hand-forged or early machine iron; pre-1900." },
    { type: "hardware", clue: "butt_hinge", confidence: 62, description: "Flat iron butt hinges securing the lid, slotted screws visible." },
    { type: "fasteners", clue: "cut_nail", confidence: 45, description: "Dome-headed cut nails/tacks with rectangular/tapered cross-section; consistent with pre-1895." },
    { type: "fasteners", clue: "slotted_screw", confidence: 50, description: "Slotted screws securing hinge plates; consistent with pre-1930s hardware." },
    { type: "construction", clue: "butt_edge_glued", confidence: 75, description: "Planks joined edge-to-edge with butt joints, glued and/or nailed." },
    { type: "construction", clue: "solid_plank_back", confidence: 90, description: "Back panel multiple solid wood planks rather than plywood." },
    { type: "construction", clue: "glued_and_nailed_casework", confidence: 45, description: "Butt-joined planks secured with nails and possibly glue; factory trunk production of the late 19th century." },
    { type: "construction", clue: "wooden_slat_reinforcement", confidence: 90, description: "Underside wooden slat battens/skids; Victorian-era trunk construction." },
    { type: "style", clue: "dome_top_victorian_trunk", confidence: 52, description: "Dome/camelback lid, iron strap banding, surface-mount brass lock; American Victorian trunk c. 1860–1900." },
    { type: "condition", clue: "finish_loss", confidence: 45, description: "Finish/coating loss with bare wood exposed on front and lid." },
    { type: "condition", clue: "wood_splitting", confidence: 54, description: "Lid corner splitting and batten delamination." },
    { type: "condition", clue: "rust_pitting", confidence: 54, description: "Iron banding and handle hardware show rust and oxidation." },
    { type: "condition", clue: "shellac_intact", confidence: 45, description: "Warm amber-orange sheen, possibly original shellac/varnish partially intact." },
    { type: "condition", clue: "general_wear", confidence: 54, description: "Heavy age-consistent wear: scratches, darkening, finish loss, surface checking." },
    { type: "construction", clue: "circular_saw_arcs", confidence: 45, description: "Straight parallel saw marks on secondary surfaces, consistent with circular-saw industrial milling rather than pit-saw." },
    { type: "hardware", clue: "trunk_handle_iron_strap", confidence: 62, description: "Arched iron strap handles with oval mounting plates; standard Victorian trunk handle." },
    { type: "materials", clue: "wrought_iron", confidence: 50, description: "Iron strap banding nailed to wood." },
    { type: "construction", clue: "drawer_present", confidence: 58, description: "Drawer evidence is visible." },
  ],
  asSeen: {
    formId: "Trunk",
    display: "Trunk (also commonly called: travel trunk, steamer trunk)",
    finalStyleKind: "unresolved",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

// ── 1960s Sears Roebuck builder-grade dresser — modern control + #111-b stress ──
// As-seen: form_dresser, "American Empire / late Classical Revival" (deriveStyleContext
// bug), post-1920 High. Owner-dated 1960s. Carries wire_nail (1880–1894) and
// circular_saw_arcs (1830–1880) — continuing-technique onsets with WRONG early
// ceilings that the blunt #111-b would treat as termini and try to cap ≤1880.
// It escapes only because there is NO qualifying convergence zone. Validates the
// curated-terminus refinement (exclude wire_nail/circular_saw_arcs).
const sears1960sDresser: ScanFixture = {
  label: "sears_1960s_builder_dresser",
  note: "Owner-dated 1960s; engine maxed at post-1920. wire_nail (1880–1894) + circular_saw_arcs (1830–1880) are continuing-technique onsets with wrong early ceilings — must NOT be #111-b termini. Also deriveStyleContext 'American Empire' (3rd) + seating-verb ('runners seat into the case').",
  perception: minimalPerception,
  // The verb-of-fitting sentence that synthesized spurious seating (#10). With the
  // fix, the harness re-derivation must NOT synthesize seating_surface here.
  rawText: "Dado slots in the case interior where drawer runners and dividers seat into the case sides; machine-cut dado profile.",
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "multiple_drawer_case", confidence: 68, description: "Three full-width drawers stacked vertically in a single case; chest of drawers / dresser form." },
    { type: "form", clue: "drawer_present", confidence: 68, description: "Three drawers on the front face, each with two round knob pulls." },
    { type: "style", clue: "style_cues", confidence: 52, description: "Shaped serpentine apron, turned front legs with vase-and-ring profile, square tapered rear legs, applied scroll/foliate decoration on drawer fronts; consistent with Colonial Revival factory production c. 1900–1930." },
    { type: "hardware", clue: "round_wood_knob", confidence: 45, description: "Six small round dark knobs; turned wood or composition; factory production c. 1900–1940." },
    { type: "style", clue: "applied_decoration", confidence: 52, description: "Large applied scroll/foliate decorative elements on lower drawer fronts; Colonial Revival factory ornament c. 1910–1930." },
    { type: "structure", clue: "turned_front_legs", confidence: 82, description: "Front legs turned with vase-and-ring profile, painted; rear legs square and straight." },
    { type: "structure", clue: "shaped_apron", confidence: 82, description: "Lower front rail/apron has a shaped serpentine profile with a bead molding strip." },
    { type: "condition", clue: "refinished_surface", confidence: 54, description: "Case painted gray/cream (later decorative paint); top stripped/unpainted showing raw grain." },
    { type: "condition", clue: "paint_wear", confidence: 54, description: "Paint chipping and wear on legs, edges, and top edge." },
    { type: "construction", clue: "sheet_back_panel", confidence: 45, description: "Back panel a single large flat sheet (hardboard/Masonite or thin plywood) set into a solid pine frame." },
    { type: "construction", clue: "plywood_structural", confidence: 85, description: "Underside shows a large plywood panel with visible laminated plies at the edges; factory production post-1920, more commonly post-1930.", hard_negative: true },
    { type: "construction", clue: "factory_case_construction", confidence: 88, description: "Underside reveals dado slots, machine-cut drawer runners, standardized secondary members; machine-consistent factory case construction." },
    { type: "construction", clue: "dado_joint", confidence: 80, description: "Dado slots in the case interior where drawer runners and dividers seat into the case sides; machine-cut dado profile." },
    { type: "joinery", clue: "machine_dovetails", confidence: 85, description: "Drawer corner dovetails with uniform spacing and consistent geometry; machine-cut, c. 1880–1930." },
    { type: "construction", clue: "hand_plane_chatter", confidence: 60, description: "Drawer side shows fine parallel ridges/chatter; uniform texture suggesting machine planing rather than hand planing." },
    { type: "fasteners", clue: "wire_nail", confidence: 50, description: "Round-headed nail with circular cross-section at a case joint; wire nail, post-1880." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Back frame members solid pine; the back panel itself is a sheet material." },
    { type: "label", clue: "maker_label", confidence: 85, description: "Partially intact paper freight/shipping label: 'FREIGHT AND EXPRESS AGENTS IF NOT CALLED FOR IN 15 DAYS NOTIFY US / FROM SEARS ROEBUCK CO.' This is a retail/shipping label, not a maker's mark; consistent with Sears catalog furniture c. 1900–1940." },
    { type: "label", clue: "visible_text", confidence: 45, description: "Stenciled 'G041' (possible model number) and 'FACT-2' (factory designation); production/inventory codes." },
    { type: "structure", clue: "corner_block_reinforcement", confidence: 75, description: "Triangular corner blocks at leg-to-case junctions; factory case reinforcement." },
    { type: "structure", clue: "turned_leg_detail", confidence: 82, description: "Front leg turned vase-and-ring profile transitioning into a shaped bracket/apron." },
    { type: "materials", clue: "wood_species", confidence: 55, description: "Back frame pine; primary case wood under paint possibly poplar or gumwood; common factory woods in Colonial Revival production c. 1900–1930." },
    { type: "condition", clue: "condition_overall", confidence: 54, description: "Fair: paint worn and chipping; top stripped; back label deteriorated; back panel delamination at top edge." },
    { type: "construction", clue: "circular_saw_arcs", confidence: 60, description: "Secondary wood surfaces show relatively straight saw marks consistent with circular or band saw milling; post-1880 factory production." },
    { type: "form", clue: "seating_surface", confidence: 82, description: "A seating surface or bench-like sitting area is visible." },
    { type: "form", clue: "seating_present", confidence: 78, description: "Integrated seating is visible." },
  ],
  asSeen: {
    formId: "Dresser",
    display: "Dresser (also commonly called: bureau, bedroom dresser)",
    styleContext: "American Empire / late Classical Revival",
    finalStyleKind: "context_only",
    dateRange: "post-1920",
    dateFloor: null, // reconstruction replays floor 1940 vs live 1920 (hard-negative floor calibration) — not asserted
    dateCeiling: null,
    confidence: "High",
  },
};

// ── Victorian fancy Windsor rocker — #6 target (era/style prose → broad date) ──
// Model read it clearly: victorian_windsor_rocker_style "c. 1870–1910", bobbin-
// turned spindles/legs/stretchers, foliate carved crest. Engine returns "Broad,
// not tightly dated" with "Spindle Gallery" (a FEATURE, not a style) in the style
// slot. Validation target for #6 (capture era/style prose as dated signal) and
// the spindle_gallery feature-as-style bug. Also: armchair_form (0.82) contradicts
// no_arms_present (0.96) — a self-contradicting clue (#10/#17 family).
const victorian_windsor_rocker: ScanFixture = {
  label: "victorian_windsor_rocker",
  note: "2nd Windsor/#6 instance — Victorian fancy rocker dated 'Broad' + 'Spindle Gallery' feature-as-style despite c.1870-1910 evidence. armchair_form contradicts no_arms_present.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Large round dished/saddled solid wood seat, deeply contoured for comfort, visible from front, side, and top views." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "High spindle back with carved crest rail and scrolled ends; spindles fan outward from seat to crest rail." },
    { type: "form", clue: "spindle_back", confidence: 68, description: "Multiple bobbin-turned spindles (approximately 9-10 visible) forming the back, mortised into seat and crest rail in Windsor-style arrangement." },
    { type: "form", clue: "rocking_chair_form", confidence: 68, description: "Curved rocker blades visible beneath the legs in side and underside views; this is a rocking chair." },
    { type: "style", clue: "carved_crest_rail", confidence: 52, description: "Wide flat crest rail with carved foliate/acanthus scroll decoration across the top surface and scrolled/volute ends; characteristic of late Victorian pressed-back or carved-back Windsor-style rockers." },
    { type: "style", clue: "bobbin_turned_spindles", confidence: 52, description: "All back spindles are bobbin-turned (alternating ball-and-reel profile), not plain tapered Windsor spindles. This is a Victorian-era decorative turning style." },
    { type: "style", clue: "bobbin_turned_legs", confidence: 52, description: "All four legs exhibit bobbin/spool turning with ball-and-reel profiles, consistent with Victorian-era production." },
    { type: "style", clue: "bobbin_turned_stretchers", confidence: 52, description: "Stretchers connecting the legs are also bobbin-turned with ball-and-reel profiles, matching the legs and spindles." },
    { type: "style", clue: "scrolled_crest_ends", confidence: 52, description: "Crest rail terminates in carved scroll/volute ends on both sides, a decorative feature common on Victorian fancy rockers and pressed-back chairs." },
    { type: "structure", clue: "round_tenon", confidence: 82, description: "Spindles and legs are mortised into the seat using round tenon joinery; spindle tops visible entering seat from below in underside/joinery views, consistent with Windsor-type round-tenon construction." },
    { type: "structure", clue: "dished_seat", confidence: 82, description: "Seat is deeply saddled/dished — carved concave from a single solid plank — visible from front and top views. Classic Windsor-type seat construction." },
    { type: "structure", clue: "solid_wood_construction", confidence: 45, description: "Seat appears to be a single solid wood plank, not laminated or veneered. Grain visible across the full seat surface." },
    { type: "structure", clue: "splayed_legs", confidence: 82, description: "Four legs splay outward from the seat at an angle, visible in side and underside views, consistent with Windsor-type seating construction." },
    { type: "structure", clue: "x_stretcher_pattern", confidence: 82, description: "Stretchers connect legs in an X or H pattern visible from underside view; all stretchers are bobbin-turned." },
    { type: "materials", clue: "two_tone_wood_finish", confidence: 45, description: "Seat is a warm reddish-brown (possibly maple, elm, or cherry with lighter finish), while spindles, legs, crest rail, and stretchers are much darker (ebonized or dark-stained). This two-tone treatment is characteristic of Victorian fancy chair production." },
    { type: "materials", clue: "wood_species_seat", confidence: 55, description: "Seat shows warm reddish-amber tone with subtle figure and open grain visible; could be maple, elm, or similar hardwood. Consistent with Windsor-tradition seat blanks." },
    { type: "condition", clue: "seat_finish_wear", confidence: 54, description: "Seat surface shows significant finish wear, whitish haze/bloom, and scratches consistent with heavy use over many decades. Finish appears partially degraded." },
    { type: "condition", clue: "rocker_blade_finish_loss", confidence: 54, description: "Rocker blades show paint or finish loss, particularly on the underside/contact surfaces, with raw wood exposed in areas." },
    { type: "condition", clue: "age_patina_present", confidence: 54, description: "Overall darkening and patina on spindles, legs, and crest rail consistent with age and use. No obvious modern refinish on these darker elements." },
    { type: "condition", clue: "structural_integrity", confidence: 54, description: "No visible broken spindles, loose joints, or structural failures observed across all views. Chair appears structurally sound." },
    { type: "style", clue: "victorian_windsor_rocker_style", confidence: 52, description: "Overall form combines Windsor-tradition round seat and spindle back with Victorian decorative elements: bobbin-turned spindles and legs, carved/pressed crest rail with foliate ornament and scrolled ends. Consistent with American Victorian fancy rocker production c. 1870-1910." },
    { type: "construction", clue: "crest_rail_mortise_attachment", confidence: 88, description: "Spindle tops are mortised into the underside of the crest rail; the crest rail is a separate shaped and carved board, not a bent hoop. Visible from back view." },
    { type: "construction", clue: "no_arms_present", confidence: 96, description: "No armrests visible; this is an armless side-chair rocker form, not an armchair rocker." },
    { type: "style", clue: "foliate_carved_crest", confidence: 52, description: "Crest rail surface shows carved or pressed foliate/acanthus scroll decoration across its face, visible from front view. Could be hand-carved or machine-pressed; resolution insufficient to confirm definitively." },
    { type: "finish", clue: "shellac_intact", confidence: 45, description: "Seat surface shows warm amber tone with some gloss remaining in protected areas; finish appears to be an older shellac or varnish rather than modern polyurethane, though degraded in wear zones. No obvious plastic-film buildup." },
    { type: "construction", clue: "rocker_blade_attachment", confidence: 90, description: "Rocker blades are attached to the bottoms of the turned legs; blades appear to be separate pieces of bent or shaped wood, not integral to the legs. Visible in side and underside views." },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating" },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
    { type: "form", clue: "armchair_form", confidence: 82, description: "Armchair form is visible." },
  ],
  asSeen: {
    formId: "Windsor chair",
    display: "Windsor chair (also commonly called: Spindle chair, Sack-back chair)",
    finalStyleKind: "context_only",
    dateRange: "Broad, not tightly dated",
    dateFloor: null,
    dateCeiling: null,
    confidence: "Low",
  },
};

export const SESSION_SCANS: ScanFixture[] = [ladderback, victorianTrunk, sears1960sDresser, victorian_windsor_rocker];
