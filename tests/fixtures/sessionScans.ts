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

const commode_close_stool: ScanFixture = {
  label: "commode_close_stool",
  note: "#7 target — enameled-pot maker label (United States Stamping Co.) inflates P1 cap to High ('Label plus… strong anchor') though the model says it's the insert's label, NOT the cabinet. Also backrest_present synthesized from 'case back rail' (FP, #10 sibling); #4 converges-at 1800-1940 vs working 1900-1920; #9 header High vs dating Moderate. Form correct (commode).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "lift_lid", confidence: 68, description: "The top is a hinged lift-lid construction; the side view clearly shows the lid open on brass hinges, defining this as a lift-lid chest/commode form." },
    { type: "function", clue: "commode_chamber_pot_cabinet", confidence: 70, description: "Interior has a circular cutout in the seat board sized to receive a chamber pot (enameled basin visible inside). This is a Victorian-era close stool / bedside commode / chamber pot cabinet." },
    { type: "form", clue: "seating_surface", confidence: 68, description: "The hinged top lid and the interior seat board with circular cutout function as a commode seat surface when lid is open." },
    { type: "structure", clue: "vertical_supports", confidence: 82, description: "Four turned corner posts visible at each corner of the case, extending from the frame down to turned bun feet. Posts show lathe-turned profile with cylindrical shaft." },
    { type: "structure", clue: "bun_feet", confidence: 82, description: "Four turned bun feet visible at base of corner posts — compressed spherical/bun profile typical of Victorian-era case furniture, c. 1860–1910." },
    { type: "construction", clue: "frame_and_panel_sides", confidence: 75, description: "Side panels appear to be solid wood boards set within the corner-post frame." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 72, description: "Corner posts and horizontal rails show mortise-and-tenon joinery typical of Victorian case furniture." },
    { type: "construction", clue: "solid_wood_construction", confidence: 88, description: "All visible surfaces — top, side panels, interior seat board — appear to be solid wood boards, not veneered or plywood construction." },
    { type: "materials", clue: "wood_species_oak_group", confidence: 45, description: "The side panels and top show open ring-porous grain consistent with oak. Some areas may be walnut or a darker hardwood on the posts." },
    { type: "hardware", clue: "butt_hinge", confidence: 62, description: "Two brass butt hinges visible attaching the lift-lid to the case back rail. Hinges show aged brass patina." },
    { type: "hardware", clue: "machine_made_hinge", confidence: 62, description: "The brass butt hinges appear machine-made with relatively uniform barrel and leaf geometry, consistent with post-1840 industrial hardware production." },
    { type: "hardware", clue: "slotted_screw", confidence: 62, description: "Slotted screw heads visible securing the brass hinges and the brass latch/catch plate. Single-slot heads consistent with pre-1934 hardware." },
    { type: "hardware", clue: "stamped_metal_bracket", confidence: 45, description: "A rectangular brass latch/catch plate is visible on the interior lid rail, secured with multiple slotted screws." },
    { type: "label", clue: "maker_label", confidence: 85, description: "Shield-shaped foil/paper label on the enameled chamber pot basin reads: 'U.S. Standard / Enameled Ware / United States Stamping Co. / Moundsville / W. Va.' This is the maker label for the enameled insert, not the wooden cabinet itself. United States Stamping Co. operated in Moundsville, WV, producing enameled ware c. 1880s–1930s." },
    { type: "condition", clue: "surface_crack_split", confidence: 54, description: "The two-board top shows a significant crack/split running along the glue joint between the two boards. Consistent with seasonal wood movement over many decades." },
    { type: "condition", clue: "shellac_intact", confidence: 45, description: "The warm amber-brown surface finish appears to be an aged shellac or oil-varnish finish with natural patina and wear. No plastic-like polyurethane sheen visible." },
    { type: "condition", clue: "age_wear_patina", confidence: 54, description: "Surface scratches, finish loss at edges, darkening in recesses, and overall aged patina consistent with extended use over many decades." },
    { type: "style", clue: "victorian_utilitarian_form", confidence: 52, description: "The overall form — rectilinear box with turned corner posts, bun feet, hinged lid, and chamber pot insert — is characteristic of Victorian-era bedroom commode / close stool furniture, c. 1860–1910." },
    { type: "materials", clue: "enameled_steel_basin", confidence: 84, description: "The chamber pot insert is white enameled steel/iron with a dark blue rim band. The U.S. Standard Enameled Ware label confirms this is a stamped and enameled metal basin." },
    { type: "construction", clue: "two_board_top", confidence: 95, description: "The top lid is constructed from two solid boards joined edge-to-edge, visible from the crack/split along the center joint line." },
    { type: "construction", clue: "circular_cutout_seat_board", confidence: 96, description: "The interior seat board has a large circular cutout to receive the enameled chamber pot. The cutout edges show age-darkened wood and wear consistent with long use." },
    { type: "structure", clue: "turned_corner_posts_with_finials", confidence: 82, description: "The four corner posts extend above the top rail and terminate in small turned finial-like caps visible in the underside view." },
    { type: "visible_text", clue: "visible_text", confidence: 50, description: "Full text visible on shield-shaped label on the enameled basin insert." },
    { type: "form", clue: "seating_present", confidence: 78, description: "Integrated seating is visible." },
    { type: "structure", clue: "backrest_present", confidence: 78, description: "A backrest or back rail is visible." },
    { type: "form", clue: "cabinet_form", confidence: 68, description: "Cabinet or cupboard form is visible." },
  ],
  asSeen: {
    formId: "Commode (close stool)",
    display: "Commode (close stool) (also commonly called: close stool, chamber-pot commode)",
    finalStyleKind: "unresolved",
    dateRange: "c. 1900–1920",
    dateFloor: 1900,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

const art_deco_candelabrum: ScanFixture = {
  // Cast brass/bronze 5-arm Art Deco candelabrum — NOT furniture (#12 out-of-scope target).
  // BUG TRACKED: a phantom date FLOOR of 1940 with NO label/maker present. 1940 is the
  // CEILING of the style prose ("c. 1920-1940" in art_deco_style_cues / scandinavian_modern)
  // mis-applied as a floor; the reported range "c. 1925-1995" also mismatches its own floor
  // (#8 range-vs-floor incoherence). Both reproduce deterministically from the structured obs.
  // REDUCED FIDELITY: the LIVE scan rendered "c. 1850 onward (open)" with style "unresolved";
  // this raw_text-less reconstruction renders "c. 1925-1995"/original_period instead. That
  // delta is raw_text-dependent (style reconciliation + open-onward rendering) and is NOT the
  // tracked bug, so asSeen pins the reproduced deterministic output (the 1940 phantom floor).
  label: "art_deco_candelabrum",
  note: "Out-of-scope candelabrum; tracks the phantom 1940 date floor scraped from style prose (no label present) + the range/floor incoherence (#7/#8/#12).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "candelabra_form", confidence: 68, description: "Five-arm candelabra with symmetrically arranged curved arms radiating from a central stem, each terminating in an urn-shaped candle cup. Central arm is elevated above the four flanking arms." },
    { type: "function", clue: "candle_holding", confidence: 70, description: "Five individual urn-shaped candle cups, each with a collar/bobeche at the base, designed to hold taper candles." },
    { type: "materials", clue: "brass_frame", confidence: 45, description: "Piece appears to be cast brass or bronze throughout. Dark brown patina with green verdigris oxidation visible at base edges and joint areas, consistent with aged brass or bronze." },
    { type: "materials", clue: "metal_frame", confidence: 84, description: "Entire candelabra is metal construction — arms, cups, central knop, stem, and octagonal base are all metal, likely cast brass or bronze with applied dark patina finish." },
    { type: "structure", clue: "pedestal_column", confidence: 82, description: "Central vertical stem rises from octagonal base through a fluted spherical knop to a collar from which the five arms radiate." },
    { type: "style", clue: "art_deco_style_cues", confidence: 52, description: "Multiple Art Deco design vocabulary elements present: octagonal base, fluted spherical knop, streamlined urn-shaped cups, symmetrical five-arm arrangement. Overall aesthetic consistent with Art Deco decorative metalwork c. 1920-1940." },
    { type: "structure", clue: "octagonal_base", confidence: 82, description: "Flat octagonal base plate with chamfered edges supports the entire candelabra. Base shows green verdigris patina at edges." },
    { type: "style", clue: "fluted_spherical_knop", confidence: 52, description: "Central decorative element is a prominently fluted (ribbed) sphere or melon-form knop. Characteristic decorative motif in Art Deco and early 20th-century metalwork, also seen in Arts & Crafts and Scandinavian Modern metalwork." },
    { type: "construction", clue: "cast_metal_construction", confidence: 85, description: "All components appear to be cast metal rather than fabricated from sheet or tube. Casting quality consistent with sand casting or lost-wax casting. No visible seam lines." },
    { type: "construction", clue: "brazed_metal_joint", confidence: 60, description: "Joints between arms and central stem collar appear to be brazed or soldered rather than welded. No visible weld bead." },
    { type: "condition", clue: "patina_dark_overall", confidence: 54, description: "Entire surface carries a deep dark brown patina over brass or bronze. Consistent across arms, cups, knop, and stem." },
    { type: "condition", clue: "joint_corrosion", confidence: 54, description: "Green verdigris visible at the base surface, base edges, and at the knop-to-stem junction. Consistent with aged brass or bronze." },
    { type: "style", clue: "urn_shaped_candle_cups", confidence: 52, description: "Each of the five candle cups is urn or goblet shaped. Consistent with Art Deco and early 20th-century candelabra design vocabulary." },
    { type: "style", clue: "swept_curved_arms", confidence: 52, description: "Arms sweep in a smooth continuous curve from the central collar outward and up to the candle cups. Characteristic of early-to-mid 20th-century candelabra design." },
    { type: "style", clue: "five_arm_symmetry", confidence: 52, description: "Five arms arranged symmetrically with a graduated stepped silhouette consistent with formal dining candelabra design." },
    { type: "condition", clue: "no_visible_damage", confidence: 54, description: "No visible cracks, breaks, missing components, bent arms, or structural damage. All five candle cups appear intact." },
    { type: "materials", clue: "painted_metal_finish", confidence: 80, description: "The dark surface finish does not appear to be painted enamel. The patina shows natural oxidation and verdigris consistent with chemical patination or natural aging of brass/bronze." },
    { type: "style", clue: "scandinavian_modern_design_influence", confidence: 45, description: "The combination of fluted spherical knop, octagonal base, clean urn cups, and dark patinated bronze is consistent with Scandinavian Art Deco and early Modern metalwork c. 1920-1940. Design influence only; no maker mark or provenance visible." },
  ],
  asSeen: {
    formId: "Candelabrum",
    display: "Art Deco Candelabrum (also commonly called: Candelabrum, Candelabra)",
    finalStyleKind: "original_period",
    dateRange: "c. 1925–1995",
    dateFloor: 1940,
    dateCeiling: 1995,
    confidence: "Low",
  },
};

// Italian Renaissance Revival sgabello hall chair (carved walnut/oak, octagonal
// plank seat, trestle base, grotesque mask). Primary ID is CORRECT (Side chair).
// TRACKED: (a) NARRATIVE-vs-WORKING-RANGE contradiction (#4) — a supported attr
// (Renaissance Revival, conf 0.82, 1860–1885) AND a formed convergence zone
// (1860–1885, 3 layers) coexist with a "Broad, not tightly dated"/Low frame range,
// and the dating narrative still leads with "Evidence converges at c. 1860–1885";
// (b) M6 phantom upholstery — fully_upholstered (conf 74) on a hard plank seat →
// "Upholstery present" section + bogus "Upholstered seating/armchair" alts;
// (c) key-vs-content — armchair_form (wt 0.93, top form clue) described as "no
// armrests... side chair". Date is broad (no floor/ceiling) so those are null.
const renaissance_revival_sgabello: ScanFixture = {
  label: "renaissance_revival_sgabello",
  note: "Renaissance Revival sgabello; tracks the narrative/working-range contradiction (convergence claimed yet range Broad) + M6 phantom upholstery on a plank seat (#4/M6).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Octagonal solid plank seat visible in overall_side and joinery_closeup images; no upholstery; carved concentric circle medallion on seat surface." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Tall, elaborately carved backrest panel rising well above seat height; urn-form splat with scrollwork, acanthus, grotesque mask, and crest carving visible in overall_front and joinery_closeup images." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "No armrests visible; piece is a side chair or hall chair form without arms." },
    { type: "style", clue: "grotesque_mask_carving", confidence: 52, description: "Prominent grotesque bearded male mask (Green Man / mascaron) carved in high relief on the lower back support / trestle section, visible in overall_front and joinery_closeup images. Classic Renaissance Revival / Baroque decorative motif." },
    { type: "style", clue: "urn_form_splat", confidence: 52, description: "Upper backrest carved in the form of a vase or urn with scrolled volutes, acanthus leaves, floral rosette, oval cartouche medallion, and fish-scale / imbrication crest. Characteristic of Italian Renaissance-inspired sgabello or hall chair form." },
    { type: "style", clue: "acanthus_carving", confidence: 52, description: "Acanthus leaf carving visible throughout: on the lower back support, on the trestle base, and on the crest of the backrest. Deeply undercut relief carving." },
    { type: "style", clue: "gadrooning_egg_dart", confidence: 52, description: "Egg-and-dart or leaf-and-dart border carved along the seat edge apron; gadrooning / lobed molding visible on the seat apron and lower back support. Visible in overall_side and joinery_closeup." },
    { type: "style", clue: "paw_feet", confidence: 52, description: "Carved paw or claw feet visible at the base of the trestle supports in overall_front image. Consistent with Renaissance Revival and Baroque seating." },
    { type: "style", clue: "strapwork_scrollwork", confidence: 52, description: "Interlaced strapwork and C-scroll / S-scroll ornament visible throughout the backrest and trestle base. Characteristic of Mannerist and Renaissance Revival decorative vocabulary." },
    { type: "style", clue: "oval_cartouche_medallion", confidence: 52, description: "Smooth oval medallion / cartouche carved in relief at the center of the upper backrest splat, surrounded by floral and scroll ornament. Visible in joinery_closeup (upper back image)." },
    { type: "style", clue: "fish_scale_imbrication_crest", confidence: 52, description: "Fish-scale or imbrication pattern carved on the crest rail / pediment of the backrest, flanked by scrolled volutes. Visible in joinery_closeup (upper back image). Characteristic of Italian Renaissance and Baroque revival carving." },
    { type: "style", clue: "sgabello_hall_chair_form", confidence: 52, description: "Overall form consistent with an Italian sgabello or Renaissance-style hall chair: solid plank octagonal seat, trestle-form base with carved supports, tall carved panel backrest with urn-form splat. No upholstery. This form was popular in Italian Renaissance originals and widely revived in the 19th century." },
    { type: "materials", clue: "solid_wood_construction", confidence: 45, description: "Seat plank appears to be solid wood with visible grain and a board join line visible in the joinery_closeup (seat top view). Backrest and base also appear to be solid carved wood throughout. No veneer or laminate visible." },
    { type: "materials", clue: "wood_species_walnut_or_oak", confidence: 45, description: "Wood color is a warm medium-dark brown with reddish undertones visible on the seat surface in the joinery_closeup (seat top). Grain visible on seat surface appears relatively open and coarse, possibly oak; however the warm brown tone and depth of color could also indicate walnut or a dark-stained hardwood. Species uncertain without closer examination." },
    { type: "construction", clue: "octagonal_seat_plank", confidence: 96, description: "Seat is an octagonal solid plank with chamfered corners, carved concentric circle medallion on the surface, and leaf-and-dart carved apron edge. Visible clearly in joinery_closeup (seat top view) and overall_side." },
    { type: "construction", clue: "trestle_base_construction", confidence: 90, description: "Base consists of trestle-form carved supports rather than four individual legs. The supports are heavily carved with grotesque mask, scrollwork, acanthus, and terminate in paw feet. Visible in overall_front and joinery_closeup." },
    { type: "construction", clue: "backrest_panel_separate_from_seat", confidence: 45, description: "The carved backrest panel appears to be a separate carved element attached to the seat plank at its base, consistent with sgabello construction where the back is a distinct carved board. The junction between back and seat is visible in overall_side." },
    { type: "construction", clue: "board_join_on_seat", confidence: 45, description: "A faint board join line is visible on the seat surface in the joinery_closeup (seat top view), suggesting the seat plank may be composed of two boards edge-glued together rather than a single wide board." },
    { type: "condition", clue: "shellac_intact", confidence: 45, description: "Seat surface shows a warm amber-brown finish with age-consistent mellowing and wear. Finish appears to be an older oil or shellac-type surface rather than a thick modern plastic coating. No obvious polyurethane pooling or plastic sheen visible." },
    { type: "condition", clue: "darkening_in_carved_recesses", confidence: 54, description: "Carved recesses throughout the backrest and base show accumulated dark patina / dirt consistent with age. The high-relief carved surfaces show lighter wear on the peaks and darker accumulation in the valleys, consistent with genuine age rather than artificial distressing." },
    { type: "condition", clue: "wear_on_seat_surface", confidence: 54, description: "Seat surface shows uneven wear and color variation consistent with use over time. The central medallion area appears slightly lighter/more worn than the surrounding field." },
    { type: "condition", clue: "no_visible_breaks_or_repairs", confidence: 54, description: "No obvious breaks, cracks, repairs, or replaced elements visible in the photographs. Carving appears intact throughout." },
    { type: "style", clue: "renaissance_revival_style", confidence: 52, description: "The overall decorative vocabulary is consistent with Renaissance Revival or Baroque Revival decorative style. This style was popular in Europe and America c. 1840–1900, with Italian Renaissance-inspired hall chairs (sgabello form) particularly associated with the second half of the 19th century." },
    { type: "style", clue: "carving_depth_and_quality", confidence: 52, description: "Carving throughout is deeply undercut with high relief, suggesting skilled hand carving. However, some repetitive elements could be consistent with either skilled hand carving or late 19th-century factory carving with hand finishing." },
    { type: "style", clue: "bead_and_reel_border", confidence: 52, description: "Repeating bead-and-reel or circle-and-dot border visible on the lower back support section flanking the grotesque mask. Consistent with Renaissance Revival decorative vocabulary." },
    { type: "style", clue: "tassel_carving", confidence: 52, description: "Carved tassels or pendant drops visible flanking the grotesque mask on the lower back support. Consistent with Renaissance Revival and Baroque decorative carving." },
    { type: "style", clue: "fleur_de_lis_motif", confidence: 52, description: "Fleur-de-lis or similar heraldic motif visible at the base of the trestle support in overall_front image." },
    { type: "function", clue: "sitting", confidence: 70, description: "Piece is a chair with seating surface and backrest; primary function is sitting. The hard unupholstered seat and tall decorative back suggest a hall or ceremonial chair rather than a comfort seating piece." },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "materials", clue: "fully_upholstered", confidence: 74, description: "Upholstered or cushioned surfaces are visible." },
  ],
  asSeen: {
    formId: "Side chair",
    display: "Renaissance Revival Side chair (also commonly called: Dining chair, Armless chair)",
    finalStyleKind: "unresolved",
    dateRange: "Broad, not tightly dated",
    dateFloor: null,
    dateCeiling: null,
    confidence: "Low",
  },
};

// Modern Chinese-import cedar chest ("Made in China", product label T155-13
// "3IN1 PACK RUSTIC DRK WOOD"). Perception was perfect; everything downstream broke.
// TRACKED: (a) M12 NEW — a HALLUCINATED maker mark (maker_mark_sligh_furniture_co,
// from a non-Sligh import label) becomes the PRIMARY date anchor, overriding the
// 1900–1980 convergence AND the "Made in China" evidence; (b) maker operating-window
// END (Sligh 1933–2005) applied as a TPQ FLOOR → "2005–2005" (date-logic bug);
// (c) #8 incoherence — headline "1933–2005" vs working "2005–2005" vs convergence
// "1900–1980"; (d) M8 — cedar CHEST → "Occasional table" at HIGH conf, driven by the
// label's own "3-piece occasional table set" speculation beating lift_lid (0.96);
// (e) M6 self-contradictory FPs — cabriole_leg vs tapered_block_feet ("not cabriole"),
// multiple_drawer_case/drawer_present with no drawers. All entangled (maker-anchor +
// form scoring); fixture is a multi-bug regression target, not a one-scan fix.
const china_import_cedar_chest: ScanFixture = {
  label: "china_import_cedar_chest",
  note: "Modern China-import cedar chest; tracks M12 hallucinated-maker-mark date anchor + maker-window-end-as-floor + chest→table misID + self-contradictory FPs (M12/M8/M6/#8).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "lift_lid", confidence: 68, description: "Lid hinges open fully revealing interior storage cavity; lid stay hardware visible on both sides holding lid open. Classic blanket/storage chest lift-lid construction." },
    { type: "form", clue: "cedar_lining", confidence: 68, description: "Interior walls, floor, and underside of lid are lined with aromatic red cedar — visible purple-red streaking, fine straight grain, characteristic knotting, and light coloration consistent with eastern red cedar (Juniperus virginiana). Defines this as a cedar chest / hope chest form." },
    { type: "structure", clue: "frame_and_panel_sides", confidence: 82, description: "Front face shows two raised rectangular panels set within a rail-and-stile framework with applied molding profiles. Side panel also shows single raised panel in frame. Classic frame-and-panel case construction on exterior show surfaces." },
    { type: "materials", clue: "solid_wood_construction", confidence: 80, description: "Exterior frame members, legs, rails, stiles, and panel fields appear to be solid wood with visible grain consistent with a stained hardwood or softwood. No veneer lifting or substrate exposure visible on show surfaces." },
    { type: "materials", clue: "cedar_lining", confidence: 84, description: "Interior cedar lining confirmed: aromatic red cedar with characteristic purple-red streaking, fine grain, and knots visible on all interior surfaces including lid underside." },
    { type: "style", clue: "tapered_block_feet", confidence: 52, description: "Four corner feet are tapered square/block form with a slight stepped profile at the top — a simplified Colonial Revival or transitional traditional style foot. Not a true cabriole or bracket foot." },
    { type: "style", clue: "raised_panel_decoration", confidence: 52, description: "Front face has two raised rectangular panels with applied molding surrounds. Side has one raised panel. Molding profiles are machine-routed and uniform, consistent with factory production." },
    { type: "hardware", clue: "machine_made_hinge", confidence: 62, description: "Lid is attached with machine-made butt hinges visible at the back edge of the chest interior. Hinges appear to be standard stamped steel butt hinges with uniform edges and precision barrels. Screws appear to be slotted or Phillips type." },
    { type: "hardware", clue: "lid_stay_hardware", confidence: 62, description: "Two metal lid stay/support brackets are visible on the interior front corners of the chest, holding the lid open at a fixed angle. These are stamped metal lid supports, consistent with modern cedar chest production." },
    { type: "hardware", clue: "stamped_metal_bracket", confidence: 62, description: "Lid stay supports are stamped metal brackets — industrially produced, consistent with post-1940s cedar chest hardware." },
    { type: "label", clue: "maker_label", confidence: 85, description: "Back panel carries a product label reading 'T155-13', '3IN1 PACK RUSTIC DRK WOOD', serial number '9101337188999', and origin stamps 'Made in China / Hecho En China'. This is a retail/import product label, not a named furniture maker's mark. The '3IN1 PACK' designation suggests this chest was sold as part of a set (likely nesting tables or a 3-piece occasional table set with lift-lid storage). Country of manufacture is China." },
    { type: "label", clue: "country_of_origin", confidence: 85, description: "Both a paper sticker label and a stamped/printed mark on the back panel read 'Made in China / Hecho En China', confirming Chinese manufacture. This is a hard anchor for modern production." },
    { type: "label", clue: "product_code", confidence: 85, description: "Product/serial number T155-13 visible on label. The '3IN1 PACK RUSTIC DRK WOOD' descriptor suggests this is one piece from a 3-piece nesting or occasional table set with a rustic dark wood finish. Not a named furniture maker attribution." },
    { type: "construction", clue: "back_panel_material", confidence: 45, description: "The back panel visible in the underside/back image appears to be a thin flat sheet panel — likely hardboard (Masonite) or thin plywood — set into a solid wood frame. The surface texture and uniform tan-brown color are consistent with hardboard. This is a factory construction method." },
    { type: "construction", clue: "factory_case_construction", confidence: 96, description: "Overall construction evidence — machine-uniform raised panels, stamped metal hardware, thin back panel, 'Made in China' label, product code label — all consistent with modern factory/import production rather than hand-crafted or period American furniture." },
    { type: "condition", clue: "finish_wear_top", confidence: 45, description: "Top surface shows significant finish wear with multiple water ring stains, light-colored patches where finish has been abraded or moisture-damaged, and general surface dulling. The finish appears to be a lacquer or polyurethane-type coating that has been damaged by moisture and use." },
    { type: "condition", clue: "foot_damage", confidence: 54, description: "Front left foot shows a chip or split at the lower corner, visible in the overall_front image. Minor structural damage to one foot." },
    { type: "condition", clue: "interior_condition", confidence: 45, description: "Cedar interior appears clean, unfinished (natural cedar), and intact with no visible damage, staining, or odor-masking treatments visible. Cedar lining appears to be in good serviceable condition." },
    { type: "finish", clue: "lacquer_finish", confidence: 55, description: "Exterior surfaces show a smooth, moderately glossy finish consistent with a sprayed lacquer or polyurethane-type coating typical of Chinese import furniture production. The finish has worn and water-stained on the top surface." },
    { type: "form", clue: "multiple_drawer_case", confidence: 68, description: "Primary function is storage — large open interior cavity accessed via lift lid, cedar-lined for textile/clothing storage. Classic blanket/hope chest storage function." },
    { type: "construction", clue: "lid_construction", confidence: 45, description: "Lid underside visible in open-chest images shows multiple solid wood planks with visible grain and knots, consistent with edge-glued solid cedar or cedar-faced planks. The lid appears to be solid wood rather than veneered panel." },
    { type: "style", clue: "colonial_revival_influence", confidence: 52, description: "The overall form — raised panel sides, tapered block feet, molded lid edge, dark stained finish — reflects a Colonial Revival or traditional American style vocabulary as interpreted in modern Chinese import production. The style is decorative rather than period-authentic." },
    { type: "materials", clue: "sheet_back_panel", confidence: 50, description: "hardboard or thin plywood back panel" },
    { type: "style", clue: "cabriole_leg", confidence: 72, description: "Cabriole legs are visible." },
    { type: "construction", clue: "drawer_present", confidence: 58, description: "Drawer evidence is visible." },
    { type: "label", clue: "maker_mark_sligh_furniture_co", confidence: 70, description: "Detected maker mark: Sligh Furniture Co.. Mark type: paper_label. Dating reference: 1933–2005. Confidence tier: MEDIUM." },
  ],
  asSeen: {
    // formId check OMITTED: M8 form-misID is stochastic here — live landed
    // "Occasional table", this reconstruction lands "Nesting tables"; both are
    // label-speculation-driven table forms, neither is the actual "Cedar chest".
    // The value of this fixture is the date/maker/style anchor, which reproduces exactly.
    finalStyleKind: "context_only",
    dateRange: "1933–2005",
    dateFloor: 2005,
    dateCeiling: 2005,
    confidence: "Moderate",
  },
};

export const SESSION_SCANS: ScanFixture[] = [ladderback, victorianTrunk, sears1960sDresser, victorian_windsor_rocker, commode_close_stool, art_deco_candelabrum, renaissance_revival_sgabello, china_import_cedar_chest];
