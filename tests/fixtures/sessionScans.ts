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
  note: "Modern China-import cedar chest; M12 corpus target. After Fix2 (parseLabelDate ignores maker_mark_* clues) the maker window is no longer collapsed to its closing year: floor 2005→1933 (proper TPQ window 1933–2005). Live, Fix1 (word-boundary matcher) prevents the hallucinated Sligh match entirely; the corpus stubs P0 so the pre-baked clue persists and validates the consumption-side fix. Still tracks chest→table misID (M8) + self-contradictory FPs (M6).",
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
    // Post-Fix2: TPQ floor is the maker-window FLOOR (founding 1933), not the
    // collapsed closing year (was 2005). Ceiling remains the window end.
    dateFloor: 1933,
    dateCeiling: 2005,
    confidence: "Moderate",
  },
};

// Teal Space Age "Swivit" molded-plastic pedestal shell chair (Equipted Products
// Inc., Maple Plain MN, c.1960s–70s). The 2nd M12 fixture and the clincher: the
// SAME hallucinated maker_mark_sligh_furniture_co (1933–2005) fires here as on the
// china_import_cedar_chest — two unrelated labels ("Swivit/Maple Plain MN" here,
// "Made in China" there) → identical Sligh hallucination → identical 2005 floor.
// A 1960s–70s chair gets floored to post-2005 by a fabricated mark, ignoring the
// real Space Age plastic evidence (molded_plastic "postwar+", space_age_pedestal,
// teal_turquoise, patents_pending). Also: a 2nd phantom mark stacks on
// (maker_mark_cabinetmaker_paper_labels_and_inscriptions 1770–1860). M8 + phantom
// "Upholstered armchair" on a hard plastic shell (0 upholstery clues) + armchair_form
// key-vs-content ("armless"). M7 negations (metal_frame/painted_metal/bent_plywood,
// all "no/not", conf 82–84) correctly dropped here. M12/M8/M7 — entangled.
const swivit_space_age_pedestal_chair: ScanFixture = {
  label: "swivit_space_age_pedestal_chair",
  note: "Space Age Swivit plastic chair; 2nd M12 fixture. Same hallucinated Sligh mark as the cedar chest, on a different label. After Fix2 the 2005 floor-collapse is gone (floor→1935, real plastic evidence). Live, Fix1 prevents the Sligh match (the 'slight' substring trigger) entirely. Still tracks M8 phantom 'Upholstered armchair' on a hard shell.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Single-piece molded shell provides integrated seat and backrest in a bucket/scoop form." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Backrest is integral to the molded shell; no separate backrest component." },
    { type: "form", clue: "pedestal_column", confidence: 68, description: "Chair sits on a single central pedestal column that flares into a wide square-rounded base, tulip-pedestal style." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "No armrests present; this is an armless shell/bucket chair." },
    { type: "structure", clue: "bent_molded_plywood", confidence: 82, description: "Shell is not bent plywood; it is a single-piece molded plastic or fiberglass shell, not laminated wood." },
    { type: "materials", clue: "metal_frame", confidence: 84, description: "No visible metal frame components; both shell and base appear to be molded plastic or fiberglass/polymer construction throughout." },
    { type: "materials", clue: "painted_metal_finish", confidence: 84, description: "Base is black molded plastic or rubber-like polymer, not painted metal. Surface texture and form are consistent with injection-molded or rotationally-molded plastic." },
    { type: "style", clue: "style_cue_space_age_pedestal", confidence: 52, description: "Tulip-inspired pedestal base with organic molded shell in teal/turquoise is characteristic of Space Age / mid-century modern seating design vocabulary, c. 1960s-1970s." },
    { type: "label", clue: "maker_label", confidence: 85, description: "Embossed text on the front lower edge of the base reads 'Swivit' in stylized script, followed by 'Equipted Products Inc. | Patents Pending | Maple Plain Minnesota'. This is a maker/brand mark molded directly into the base." },
    { type: "label", clue: "visible_text_swivit", confidence: 85, description: "Brand name 'Swivit' visible in embossed stylized script on the base edge, visible in multiple images." },
    { type: "label", clue: "visible_text_manufacturer", confidence: 45, description: "Manufacturer name 'Equipted Products Inc.' with location 'Maple Plain Minnesota' and 'Patents Pending' embossed on base edge. Note: 'Equipted' appears to be the brand's own spelling." },
    { type: "construction", clue: "single_piece_molded_shell", confidence: 95, description: "The seat/back shell is a single continuous molded unit with no seams, joints, or separate components visible. Consistent with injection-molded ABS plastic or fiberglass-reinforced polyester." },
    { type: "construction", clue: "molded_plastic_base", confidence: 92, description: "The pedestal base is a single molded unit — square with rounded corners tapering to a central column — in black polymer. Underside shows hollow interior consistent with rotationally-molded or blow-molded plastic." },
    { type: "construction", clue: "hollow_base_interior", confidence: 90, description: "Underside view shows the base is hollow with a large concave interior cavity, consistent with rotationally-molded or blow-molded plastic construction rather than solid cast material." },
    { type: "condition", clue: "surface_scratches_base", confidence: 54, description: "Multiple surface scratches and scuff marks visible on the underside and sides of the black base, consistent with normal use wear." },
    { type: "condition", clue: "shell_surface_wear", confidence: 54, description: "Minor surface scuffs and slight color variation/fading visible on the teal shell, particularly at edges and high-contact areas. No cracks or structural damage visible." },
    { type: "condition", clue: "structural_integrity", confidence: 54, description: "No visible cracks, breaks, or structural failures in either the shell or the base. Chair appears structurally sound." },
    { type: "style", clue: "teal_turquoise_color", confidence: 52, description: "Shell is a distinctive teal/turquoise blue color, a color palette strongly associated with mid-century modern and Space Age design of the 1960s-1970s." },
    { type: "style", clue: "patents_pending_mark", confidence: 52, description: "'Patents Pending' embossed on base indicates the product was in active patent application status at time of manufacture, suggesting an early production run." },
    { type: "function", clue: "sitting", confidence: 70, description: "Object is clearly a chair designed for sitting; the shell provides a contoured seat and back." },
    { type: "style", clue: "geometric_faceted_shell_back", confidence: 52, description: "The back of the shell shows a faceted, multi-planar geometric form rather than a smooth continuous curve, visible in the back view. This is a distinctive design feature differentiating it from smooth tulip-style shells." },
    { type: "materials", clue: "fiberglass_or_abs_shell", confidence: 65, description: "Shell surface texture, matte finish, and slight translucency at edges suggest either fiberglass-reinforced polyester or ABS plastic. The matte texture with slight surface variation is more consistent with fiberglass than smooth-surface ABS, but cannot be confirmed without tactile examination." },
    { type: "construction", clue: "shell_to_base_attachment", confidence: 88, description: "Shell attaches to the pedestal at a single central column point. The column narrows at the junction between base and shell, visible in side and back views." },
    { type: "style", clue: "maple_plain_minnesota_origin", confidence: 52, description: "Manufacturer location identified as Maple Plain, Minnesota — a small town west of Minneapolis. This is a regional American manufacturer, not a major national furniture brand." },
    { type: "materials", clue: "molded_plastic", confidence: 50, description: "all-plastic construction" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "label", clue: "maker_mark_cabinetmaker_paper_labels_and_inscriptions", confidence: 50, description: "Detected maker mark: Cabinetmaker paper labels and inscriptions (generic). Mark type: paper_label. Dating reference: 1770–1860. Confidence tier: LOW." },
    { type: "label", clue: "maker_mark_sligh_furniture_co", confidence: 70, description: "Detected maker mark: Sligh Furniture Co.. Mark type: paper_label. Dating reference: 1933–2005. Confidence tier: MEDIUM." },
  ],
  asSeen: {
    formId: "Upholstered armchair",
    display: "Upholstered armchair (also commonly called: Arm chair, Easy chair)",
    finalStyleKind: "context_only",
    // Post-Fix2: the hallucinated Sligh window no longer slams the floor to its 2005
    // closing year; the date now falls to the real molded-plastic evidence (floor
    // 1935, "early-to-mid 20th century or later"). Was floor 2005 pre-fix. The range
    // string is raw_text-dependent narrative (live rendered "Broad, not tightly dated").
    dateRange: "c. 1935 onward (early-to-mid 20th century or later)",
    dateFloor: 1935,
    dateCeiling: null,
    confidence: "Low",
  },
};

// Factory oak bow-front Colonial Revival chest of drawers (machine dovetails,
// wire nails, glass knobs). Output c.1890–1920 is ACCEPTABLE — the piece really is
// ~1890–1920 — but it's the fix#1 catch-all "masked-correct": the evidence envelope
// is ~1880–1925 (tightest real floor wire_nail post-1880; ceilings glass_knob 1925 /
// shellac 1920; convergence zone 1860–1925), and the 1890/1920 bounds are the
// hardcode landing on a coincidentally-right neighborhood. The clean fix#1 target
// where the evidence-derived answer is knowable. Also tracks: modern_caster FP (key
// says "modern", description says "wooden casters" → phantom post-1900 hardware
// signal, 2nd occurrence after S014-R) and M6 phantom door_present/cabinet_form on
// a doorless 3-drawer chest. Form (chest of drawers) is correct.
const colonial_revival_oak_bowfront_chest: ScanFixture = {
  label: "colonial_revival_oak_bowfront_chest",
  note: "Factory oak Colonial Revival bow-front chest; fix#1 catch-all masked-correct (output 1890–1920, evidence ~1880–1925) + modern_caster FP from 'wooden casters' + M6 phantom door/cabinet.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "multiple_drawer_case", confidence: 68, description: "Case contains three drawers total: two smaller drawers side-by-side in the upper tier and one full-width drawer below, defining a chest-of-drawers form." },
    { type: "form", clue: "drawer_present", confidence: 68, description: "Two half-width drawers in upper row and one full-width drawer below; all fitted with glass knob pulls." },
    { type: "style", clue: "cabriole_leg", confidence: 52, description: "All four legs exhibit a cabriole profile with a curved knee and outward splay, terminating in a small pad or scroll foot. Front legs are more pronounced; rear legs are simpler cabriole forms visible in side and back views." },
    { type: "style", clue: "bow_front_case", confidence: 52, description: "The case front has a pronounced bow (convex curve) across the full width, visible in the overall front view and confirmed by the curved apron/skirt at the base." },
    { type: "hardware", clue: "pressed_glass_knob", confidence: 62, description: "All four drawer pulls are faceted glass knobs, appearing hexagonal or multi-faceted in form, consistent with pressed glass knobs common 1860–1925 and in Colonial Revival use into the 1930s–1950s." },
    { type: "hardware", clue: "wooden_caster", confidence: 62, description: "Caster closeup images show small wooden-wheel casters with iron/metal mounting hardware on all four legs. The wheels appear to be wood (not porcelain, not rubber), heavily worn and oxidized. Consistent with wooden casters used c. 1750–1880 primary, with persistence into early factory era." },
    { type: "hardware", clue: "rust_pitting", confidence: 62, description: "The caster mounting hardware shows significant iron oxidation and rust pitting, consistent with extended age and outdoor or damp storage exposure." },
    { type: "construction", clue: "machine_dovetails", confidence: 92, description: "Joinery closeup of the pulled drawer shows uniform, evenly spaced, identically sized dovetail pins and tails at the drawer front-to-side corner joint. The geometry is perfectly repetitive with machine-cut precision, consistent with machine dovetails common after c. 1870–1885 in factory production." },
    { type: "construction", clue: "solid_plank_back", confidence: 95, description: "The back panel visible in the back image consists of multiple horizontal solid wood planks (not plywood sheet), nailed to the case frame. Three or four horizontal boards are visible with visible grain and board seams." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Case sides, back boards, and drawer components all appear to be solid wood construction with no visible plywood lamination layers at any edge or exposed surface." },
    { type: "materials", clue: "wood_species_oak", confidence: 84, description: "The case sides visible in the side view show prominent open-pore ring-porous grain structure with visible ray fleck, consistent with oak. The drawer fronts also show open-grain oak texture beneath the worn finish. Likely flat-sawn oak on drawer fronts and case sides." },
    { type: "materials", clue: "secondary_wood_drawer_sides", confidence: 75, description: "The drawer side visible in the joinery closeup is a lighter-colored, finer-grained wood distinct from the dark oak drawer front, consistent with poplar or maple used as secondary wood in factory-era case goods." },
    { type: "condition", clue: "finish_wear_heavy", confidence: 54, description: "Drawer fronts and case surfaces show extensive finish loss, scratching, and abrasion across the entire front face. The original dark finish has worn through to bare wood in many areas, especially on the lower drawer and upper drawer fronts." },
    { type: "condition", clue: "shellac_crazing", confidence: 54, description: "The remaining finish on the case sides and top shows a network of fine surface checking consistent with aged shellac or early varnish crazing. Confidence is moderate as the heavy wear makes definitive finish chemistry identification difficult." },
    { type: "label", clue: "visible_text_back", confidence: 45, description: "Stenciled or painted block letters 'HCP' appear on the upper back board of the case. This appears to be an owner's mark, inventory mark, or institutional mark rather than a maker's mark. Per maker-mark rules, initials alone are insufficient for maker attribution." },
    { type: "construction", clue: "wire_nail", confidence: 60, description: "The back boards appear to be attached with small nails visible at the edges; at this resolution they appear to be round-shank wire nails rather than cut nails, consistent with post-1880 factory production. Confidence is moderate as nail heads are not fully resolved." },
    { type: "structure", clue: "vertical_supports_legs", confidence: 82, description: "Four legs support the case: two front cabriole legs with pronounced knee curve and pad/scroll feet, and two rear legs that are simpler cabriole or tapered forms. All four legs terminate in small casters." },
    { type: "style", clue: "colonial_revival_style_cue", confidence: 52, description: "The combination of bow-front case form, cabriole legs, pressed glass knobs, and oak construction is consistent with Colonial Revival or Queen Anne Revival factory production, commonly dated c. 1890–1920." },
    { type: "construction", clue: "factory_case_construction", confidence: 88, description: "Machine-cut dovetails, uniform drawer construction, solid plank back with wire nails, and consistent secondary wood usage all point to factory case construction rather than hand-crafted individual cabinetmaking." },
    { type: "condition", clue: "condition_overall", confidence: 54, description: "Heavy finish loss across all drawer fronts and case surfaces; casters show significant rust and wear; back boards show age staining and minor checking. The piece is structurally intact but cosmetically distressed." },
    { type: "hardware", clue: "modern_caster", confidence: 50, description: "wooden casters" },
    { type: "construction", clue: "door_present", confidence: 58, description: "Door evidence is visible." },
    { type: "form", clue: "cabinet_form", confidence: 68, description: "Cabinet or cupboard form is visible." },
  ],
  asSeen: {
    formId: "Chest of drawers / dresser",
    display: "Chest of drawers / dresser (also commonly called: chest, drawer chest)",
    finalStyleKind: "context_only",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

// Vernacular painted-pine milking/foot stool (plank legs, through-tenons, hand-plane
// chatter, multiple paint layers, deep patina). Form correct (Milking stool, High).
// MIS-DATED ~50yr late: output 1900–2000 is DISJOINT from the engine's own envelope
// (1800–1920) — ceiling 2000 is 80yr past it — ignoring a clean early toolmark layer
// (1850–1880). ROOT: through_mortise_and_tenon is mis-dated c.1890–1920 (a traditional
// joint wrongly treated as a late marker), creating a joinery layer disjoint from the
// toolmark layer → 0 convergence → late default. Also M6 woven_body (conf 76) +
// wicker_paint_buildup (conf 50) on a SOLID-WOOD stool — IDENTICAL signature to S001 —
// injecting "Wicker/rattan" alt-form #1 + a phantom wicker dating limitation (fix#1/#5/#6).
const vernacular_painted_milking_stool: ScanFixture = {
  label: "vernacular_painted_milking_stool",
  note: "Vernacular pine milking stool. fix#1 SHIPPED: the false 1900–2000 catch-all is now overridden by the evidence floor → c.1890 onward (was disjoint from the 1800–1920 envelope). Floor still 1890 (over-pulled by the separate through_mortise_and_tenon revival-window mis-date — out of scope). Also tracks M6 woven_body FP on solid wood (= S001, fix#5 candidate).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Rectangular top surface with heavily rounded corners serves as a seating or foot-rest surface; two-board construction visible with a longitudinal split/seam running the length of the top." },
    { type: "form", clue: "stool_form", confidence: 68, description: "Small low stool approximately 8-10 inches tall with rectangular top and four splayed plank legs; classic vernacular foot stool or milking stool form." },
    { type: "structure", clue: "plank_legs", confidence: 82, description: "Four legs cut from flat planks (not turned), splayed outward at an angle; legs are rectangular in cross-section and taper slightly toward the foot. Visible on all views." },
    { type: "structure", clue: "splayed_leg_angle", confidence: 82, description: "All four legs splay outward from the seat for stability; splay angle visible clearly in front and side views, consistent with vernacular stool construction." },
    { type: "structure", clue: "cutout_arch_between_legs", confidence: 82, description: "Arched or V-shaped cutout visible between the paired legs on each end, cut from the lower portion of the plank leg assembly; visible in side and joinery closeup views. This is a characteristic vernacular stool construction detail." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 88, description: "Four rectangular mortise slots visible on the underside of the seat top; slots are arranged in pairs near each end of the seat, consistent with through-tenon leg attachment. Slots appear hand-cut with slightly irregular edges." },
    { type: "construction", clue: "through_mortise_and_tenon", confidence: 82, description: "The rectangular mortise openings visible on the top face of the seat confirm through-tenon construction where leg tenons pass completely through the seat board; consistent with traditional vernacular stool construction." },
    { type: "construction", clue: "two_board_seat", confidence: 45, description: "The seat top appears to be composed of two boards joined edge-to-edge; a longitudinal seam/split runs the full length of the top surface, visible in front and joinery closeup views." },
    { type: "construction", clue: "solid_wood_construction", confidence: 95, description: "All components appear to be solid wood throughout; no lamination, plywood, or engineered substrate visible at any edge, split, or worn area." },
    { type: "materials", clue: "wood_species_pine_group", confidence: 55, description: "Grain pattern visible on underside and worn areas suggests a straight-grained softwood, likely pine or similar conifer; wood is relatively lightweight in appearance and shows checking consistent with pine. Species not definitively identifiable under heavy paint." },
    { type: "finish", clue: "painted_surface_black", confidence: 55, description: "Entire exterior surface covered in black paint; paint is heavily alligatored, crazed, and peeling revealing warm amber/brown wood beneath and evidence of earlier paint layers." },
    { type: "finish", clue: "multiple_paint_layers", confidence: 55, description: "At least two distinct paint layers visible at worn edges and losses: a lower reddish-brown or red layer beneath the dominant black layer." },
    { type: "condition", clue: "heavy_paint_loss_and_wear", confidence: 54, description: "Extensive paint loss across all surfaces; paint is alligatoring, flaking, and peeling throughout. Bare wood exposed at high-wear areas. Consistent with very old painted surface." },
    { type: "condition", clue: "seat_split_along_grain", confidence: 54, description: "A longitudinal crack/split runs the length of the seat top; consistent with seasonal wood movement over many decades." },
    { type: "condition", clue: "deep_age_patina", confidence: 54, description: "Underside of seat shows deep amber-brown oxidation and dirt accumulation consistent with extended age; surface is darkened and worn smooth at contact points." },
    { type: "condition", clue: "leg_foot_wear", confidence: 54, description: "Leg feet show significant wear and rounding at the floor contact points, consistent with long-term use; paint completely worn away at feet." },
    { type: "construction", clue: "hand_plane_chatter", confidence: 45, description: "Underside of seat shows subtle surface texture that may include hand-plane marks; surface is not machine-smooth and shows slight irregularity consistent with hand-planed preparation, though heavy paint and age obscure definitive identification." },
    { type: "construction", clue: "band_saw_lines", confidence: 40, description: "The leg surfaces show fine parallel horizontal lines that could be band-saw or circular-saw mill marks; lines are relatively straight and closely spaced. Alternatively could be paint crazing. Moderate uncertainty." },
    { type: "style", clue: "vernacular_country_primitive", confidence: 52, description: "Form, construction, and finish are consistent with vernacular/country/primitive American furniture tradition; no decorative elements, turned parts, or stylistic ornament present. Purely utilitarian construction." },
    { type: "hardware", clue: "no_metal_hardware_visible", confidence: 45, description: "No metal hardware of any kind visible on the stool; no nails, screws, bolts, or brackets observed. Construction appears to rely entirely on mortise-and-tenon joinery and possibly glue." },
    { type: "construction", clue: "rounded_seat_corners", confidence: 95, description: "All four corners of the rectangular seat top are heavily rounded/chamfered, giving the top an oval-rectangular profile; this rounding appears intentional and is consistent with traditional stool construction." },
    { type: "structure", clue: "four_leg_configuration", confidence: 82, description: "Four legs arranged in two pairs (two per end), each pair cut from a single plank with an arch cut between them; this creates a two-legged-plank-per-end configuration rather than four independent turned legs." },
    { type: "condition", clue: "surface_dirt_accumulation", confidence: 54, description: "Significant dirt, grime, and debris accumulation visible on all surfaces, particularly in recesses, paint losses, and the underside; consistent with long-term use and storage without cleaning." },
    { type: "condition", clue: "wicker_paint_buildup", confidence: 50, description: "multiple paint layers visible" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "materials", clue: "woven_body", confidence: 76, description: "Woven wicker or reed body construction is visible." },
  ],
  asSeen: {
    formId: "Milking stool",
    display: "Milking stool",
    finalStyleKind: "unresolved",
    // POST fix#1: the unsupported "broadly late 19th to 20th century" catch-all
    // (fake 1900/2000) no longer survives — the evidence-floor anchor overrides it,
    // dropping the disjoint 2000 ceiling and anchoring at the most-recent layer floor.
    // Floor is 1890 (the joinery layer), still over-pulled by the separate
    // through_mortise_and_tenon revival-window mis-date (out of scope) — once that's
    // fixed this should fall to the toolmark window ~1850–1880.
    dateRange: "c. 1890 onward (late 19th century or later)",
    dateFloor: 1890,
    dateCeiling: null,
    confidence: "Low",
  },
};

// Golden Oak / Chippendale Revival bow-front curved-glass china cabinet, c.1890–1915.
// Form correct (China cabinet, High). The CLEAREST #6 case: the model stated the date
// verbatim ("c.1890-1915") in SIX style observations, but ALL NINE style observations
// collapsed to the generic key `style_cues` (24 obs → 14 keys), landing at weight 0.41
// with the style dating layer contributing 0 clues — so the explicitly-dated Golden Oak
// evidence carried ZERO dating authority (M1 at scale). With style discarded, P2 fell to
// the late default 1900–2000 (floor 1900/ceil 2000), DISJOINT from both the 1750–1940
// envelope and the formed convergence zone 1840–1920 (fastener+hardware+finish); the
// form layer is post-1880, so the evidence-derived answer is ~1890–1920. fix#1 + #6 + M1.
// Minor: glass_top M6 (curved glass SIDES → "glass top"); #8 layer-count ("2" vs zone 3).
const golden_oak_curved_glass_china_cabinet: ScanFixture = {
  label: "golden_oak_curved_glass_china_cabinet",
  note: "Golden Oak curved-glass china cabinet; model said c.1890-1915 verbatim but 9 style obs collapsed to generic style_cues (0 dating authority) → late default 1900–2000, disjoint from the 1840–1920 convergence zone. fix#1 disjoint + #6 dated-prose-ignored + M1 style_cues collapse.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "door_present", confidence: 68, description: "Single glazed door with flat central stile and curved glass panels flanking; door has keyhole escutcheon and butt hinge visible." },
    { type: "form", clue: "open_shelving", confidence: 68, description: "Interior visible through glass shows at least one shelf inside the display cabinet." },
    { type: "form", clue: "cabriole_leg", confidence: 68, description: "Four cabriole legs visible terminating in carved claw-and-ball feet; legs show pronounced knee and ankle typical of Chippendale-revival cabriole form." },
    { type: "style", clue: "style_cues", confidence: 58, description: "Carved claw-and-ball feet on all four cabriole legs; well-defined talons gripping a ball, consistent with Chippendale Revival / Golden Oak era production c. 1890-1915." },
    { type: "style", clue: "style_cues", confidence: 58, description: "Applied carved pineapple-and-shell corbels at upper corners of door frame stiles; diamond-faceted pineapple form with shell cap above, characteristic of late Victorian / Golden Oak decorative carving vocabulary." },
    { type: "style", clue: "style_cues", confidence: 58, description: "Carved fan/shell motif centered on the lower apron between the front cabriole legs; radiating fluted petals consistent with Chippendale Revival ornament." },
    { type: "style", clue: "style_cues", confidence: 58, description: "Curved bow-front form with bent curved glass panels on both sides of the central door; characteristic of American china cabinet / curio cabinet production c. 1890-1915." },
    { type: "style", clue: "style_cues", confidence: 58, description: "Stepped molded cornice at top of case with multiple ogee and flat molding profiles; top surface shows open grain consistent with oak." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Frame members, stiles, rails, legs, and cornice all appear to be solid oak; open grain with visible ray fleck on some surfaces consistent with flat-sawn or slightly quarter-sawn oak." },
    { type: "materials", clue: "style_cues", confidence: 84, description: "Open ring-porous grain with visible ray structure on door stile and apron surfaces; consistent with American red or white oak, typical of Golden Oak era production." },
    { type: "hardware", clue: "lock_escutcheons", confidence: 62, description: "Ornate cast brass escutcheon with scrolled Rococo-style surround visible on door stile; keyhole opening present; tarnished brass consistent with age." },
    { type: "hardware", clue: "butt_hinge", confidence: 45, description: "Butt hinge visible at door edge in side/hinge closeup; appears to be machine-made with uniform barrel; brass or brass-plated; slotted screws visible though image is blurry." },
    { type: "hardware", clue: "machine_made_hinge", confidence: 62, description: "Hinge barrel appears uniform and machine-made rather than hand-forged; consistent with post-1840 machine production; tarnished brass coloration." },
    { type: "hardware", clue: "slotted_screw", confidence: 62, description: "Screw heads visible at hinge mounting appear to have single slotted heads consistent with pre-Phillips era hardware; image blurry but no cross-recess visible." },
    { type: "condition", clue: "condition_cues", confidence: 60, description: "Significant white paint drips and finish loss visible on door stile and lower case; original finish largely intact on case body and legs but door frame shows heavy surface deterioration." },
    { type: "condition", clue: "shellac_crazing", confidence: 54, description: "Surface of door stile and case members shows crazing and flaking consistent with aged shellac or early varnish finish breaking down; not a modern polyurethane failure pattern." },
    { type: "condition", clue: "condition_cues", confidence: 60, description: "Green moss or biological growth visible on top cornice surface, indicating prolonged storage in damp or outdoor-adjacent conditions." },
    { type: "condition", clue: "condition_cues", confidence: 60, description: "Despite surface finish deterioration, case appears structurally sound; legs, frame, and glass panels appear intact with no visible breaks or major structural failures." },
    { type: "style", clue: "style_cues", confidence: 58, description: "Overall form — bow-front curved glass china cabinet with cabriole legs, claw-and-ball feet, pineapple corbels, shell apron, and oak construction — is highly characteristic of American Golden Oak / Chippendale Revival production c. 1890-1915." },
    { type: "construction", clue: "frame_and_panel_sides", confidence: 88, description: "Sides are curved bent glass rather than wood panel construction; case uses a frame-and-glass construction rather than frame-and-panel wood sides." },
    { type: "construction", clue: "style_cues", confidence: 82, description: "Pineapple and shell corbels appear to be applied carved elements attached to the stile faces rather than carved in-the-round from the stile stock itself; consistent with factory production methods of the Golden Oak era." },
    { type: "function", clue: "style_cues", confidence: 70, description: "Form is a freestanding display cabinet (china cabinet / vitrine) intended for displaying decorative objects behind glazed curved glass panels; single locking door provides access." },
    { type: "materials", clue: "glass_top", confidence: 50, description: "curved bent glass panels" },
    { type: "form", clue: "cabinet_form", confidence: 68, description: "Cabinet or cupboard form is visible." },
  ],
  asSeen: {
    formId: "China cabinet",
    display: "China cabinet",
    finalStyleKind: "context_only",
    // Reduced fidelity: live rendered "Broadly late 19th to 20th century"/1900–2000/Low
    // (convergence zone 1840–1920); this obs-only reconstruction (no raw_text) renders
    // 1900–1930/Moderate (zone 1800–1940). The range/ceiling/confidence delta is
    // raw_text-dependent and NOT the tracked bug. What reproduces deterministically and
    // IS the bug: the 9 style_cues observations contribute 0 to the style dating layer
    // (M1 collapse / #6 dated-prose-ignored) and the floor sits at 1900, not the
    // evidence-supported ~1890. Pinned to the harness's deterministic output.
    dateRange: "late 19th to early 20th century",
    dateFloor: 1900,
    dateCeiling: 1930,
    confidence: "Moderate",
  },
};

// A. Sydney Logan tall-case (grandfather) clock, dial signed "fecit Philadae. anno
// 1914". Re-scan of S009. VALIDATES M9 LIVE: the signed production year is now parsed
// and anchors the date to c.1914 (floor=ceiling=1914, High) — the original S009 buried
// it at 1900–1930. Also validates fix#2 (display is "Trunk", not prefixed by the
// context-only "American Empire…" style). STILL BROKEN (tracked): M8 form clock→Trunk
// (intermittent; "Tall case clock" sits in alternatives), #10 spurious "American Empire
// / late Classical Revival" style context on a Georgian/Colonial Revival clock, M1
// keyless style/inscription obs (weight 0.37, 0 dating authority), M6 mirror_present
// from the glazed pendulum lenticle. NOTE the live report ALSO showed a stale
// "Supported Findings: …Broadly late 19th to 20th century" contradicting the c.1914
// headline (#8 — supported-findings string not refreshed after the parseLabelDate override).
const logan_1914_tall_case_clock: ScanFixture = {
  label: "logan_1914_tall_case_clock",
  note: "Logan 1914 signed tall-case clock; validates M9 (signed year → c.1914) + fix#2 (no style-prefix on form name) live. Still M8 clock→Trunk, #10 spurious Empire context, #8 stale Supported-Findings date.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "door_present", confidence: 68, description: "Overall front view shows a full tall case (grandfather) clock in three sections: bonnet/hood at top with broken-arch pediment, trunk section with arched door, and base with raised panel door and bracket feet. Approximately 7-8 feet tall. Classic American longcase clock form." },
    { type: "materials", clue: "solid_wood_construction", confidence: 45, description: "Case is constructed of solid wood throughout — appears to be cherry or mahogany based on the warm reddish-brown color and grain visible on the trunk door and side panels. Grain pattern consistent with solid wood, not veneer, on the trunk and base panels." },
    { type: "style", clue: "", confidence: 58, description: "Broken-arch (swan-neck) pediment with carved rosette medallions at each arch terminus and a central carved shell/fan finial on a plinth. This is a hallmark of American Georgian and Colonial Revival tall case clock design, consistent with Philadelphia tradition." },
    { type: "style", clue: "", confidence: 58, description: "Rope-twist (barley-twist) carved columns flank the bonnet on both sides. Visible clearly in overall_front, overall_side, and the joinery_closeup of the bonnet. These are turned and carved from solid wood." },
    { type: "style", clue: "", confidence: 58, description: "Carved foliate/vine frieze band runs across the full width of the bonnet below the cornice molding. Visible in the joinery_closeup of the bonnet side view — shows intricate carved vine and berry/leaf motif in relief." },
    { type: "label", clue: "maker_label", confidence: 85, description: "Engraved text on the arched dial cartouche/boss reads: 'I see the Hours, invisible to thee, / And lift my voice lest unperceived they flee. / A. Sydney Logan / fecit Philadae. anno 1914'. This identifies the maker as A. Sydney Logan, made in Philadelphia, anno (year) 1914. 'Fecit' is Latin for 'made it.'" },
    { type: "hardware", clue: "lock_escutcheons", confidence: 45, description: "Small keyhole escutcheon visible on the trunk door, left side, in the overall_side and joinery_closeup images. Appears to be a simple brass or iron escutcheon for a door lock." },
    { type: "hardware", clue: "mirror_present", confidence: 62, description: "The trunk door has a glazed lenticle (oval/arched window) in its upper portion, allowing view of the pendulum. Visible clearly in the joinery_closeup of the bonnet side — shows a small arched glass panel set into the raised-panel trunk door." },
    { type: "construction_cues", clue: "door_present", confidence: 45, description: "Interior of trunk visible in the open-door joinery_closeup: shows three weight cables/chains hanging, consistent with a three-train movement (time, strike, chime). Pendulum rod and bob visible. Interior back board appears to be painted or stained dark." },
    { type: "finish", clue: "shellac_intact", confidence: 45, description: "Wood case finish appears to be a warm lacquer or shellac/varnish — shows even sheen across trunk and bonnet surfaces. The reddish-brown tone is consistent with cherry or mahogany with an amber finish. No obvious refinishing evidence; finish appears aged and consistent." },
    { type: "style", clue: "door_present", confidence: 52, description: "Base section has a raised panel door with ogee bracket feet — visible in overall_front and the open-door view. The bracket feet have a simple ogee profile. This is consistent with American Federal/Georgian tall case clock case design." },
    { type: "visible_text", clue: "", confidence: 50, description: "Full text on the arched dial cartouche: 'I see the Hours, invisible to thee, / And lift my voice lest unperceived they flee. / A. Sydney Logan / fecit Philadae. anno 1914'. The poetic inscription is a motto about time. 'Philadae' is an abbreviation for Philadelphiae (Philadelphia). 'Anno 1914' gives the year of manufacture." },
  ],
  asSeen: {
    formId: "Trunk",
    display: "Trunk (also commonly called: travel trunk, steamer trunk)",
    finalStyleKind: "context_only",
    dateRange: "c. 1914",
    dateFloor: 1914,
    dateCeiling: 1914,
    confidence: "High",
  },
};

// Early-20th-c. solid-OAK swivel banker's/office armchair (Arts & Crafts / Mission
// office chair, ~1900–1920). Date is correct (c.1890–1920). VALIDATES live: batch-1
// fix#1 (cast_iron/wrought_iron parked as present-but-undated in the wood layer, not
// dating it) and fix#2 (display "Upholstered armchair", not prefixed by the style).
// STILL BROKEN (tracked): M6 metal→furniture — the incidental cast-iron TILT MECHANISM
// drives cast_iron/wrought_iron → "Iron furniture"/"Metal furniture" alt-forms + the
// style context "Toledo-style mid-century industrial task chair" (a 3rd canned
// metal-triggered default, after "American Empire"=brass and "Modernist/chrome"=tubular_steel)
// on a wooden chair. modern_caster n=3 (here genuinely a REPLACEMENT part, yet it dates
// the chair). M8 phantom "Upholstered" on a solid-wood saddle seat. M7 polyurethane key
// with a negating description (dropped). M1 3 keyless obs.
const oak_swivel_bankers_office_chair: ScanFixture = {
  label: "oak_swivel_bankers_office_chair",
  note: "Oak swivel banker's office chair (~1900–1920, date correct). Validates fix#1 metal→wood + fix#2 live. Tracks M6 cast/wrought_iron → 'Toledo industrial' style + Iron/Metal alt-forms on solid oak; modern_caster n=3 (replacement part); phantom 'Upholstered'.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "armchair_form", confidence: 68, description: "Overall front view shows a wooden swivel office/banker's armchair with a shaped crest rail, three vertical back splats with arched cutouts at their bases, a solid wood saddle seat, and curved open arms. Classic early 20th-century office chair form." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "All structural elements — crest rail, back splats, seat, arms, and base legs — appear to be solid wood throughout. The grain pattern visible on the back splats and seat is consistent with quarter-sawn or plain-sawn oak, showing prominent ray fleck on the back splats." },
    { type: "materials", clue: "", confidence: 50, description: "The wood grain visible on the back splats in the front view shows pronounced medullary ray fleck characteristic of quarter-sawn oak. The seat surface shows a plainer, straighter grain. The overall warm medium-brown color is consistent with stained oak." },
    { type: "style", clue: "", confidence: 55, description: "The back splat design features three vertical slats with arched (Gothic or tulip-shaped) cutouts at their lower ends, a curved crest rail, and curved arms — all hallmarks of Arts and Crafts / Mission-style office furniture popular circa 1900-1920. This is a classic 'banker's chair' or 'office armchair' form from that era." },
    { type: "hardware", clue: "swivel_mechanism", confidence: 62, description: "Side view clearly shows a cast iron tilt-and-swivel mechanism mounted beneath the wooden seat. The mechanism is black-painted or japanned cast iron with visible flanges and a central post. This is a period-appropriate tilting office chair mechanism consistent with early 20th-century production." },
    { type: "hardware", clue: "modern_caster", confidence: 62, description: "The joinery closeup (base detail) shows four or five modern black plastic/rubber twin-wheel casters mounted at the ends of the wooden base legs. These appear to be modern replacements, inconsistent with the period of the chair's manufacture." },
    { type: "form", clue: "pedestal_column", confidence: 68, description: "The base detail image shows a five-pronged wooden star base (five curved legs radiating from center) connected to a central black metal post/column that rises to the cast iron tilt mechanism. The wooden base legs are solid oak with a curved, swept profile." },
    { type: "hardware", clue: "wrought_iron", confidence: 45, description: "The cast iron tilt mechanism visible in the base closeup shows a complex multi-part casting with what appears to be a spring-tilt assembly. A small bolt or adjustment screw is visible at the center of the lower collar/ring. This type of mechanism is consistent with early 20th-century American office chair hardware by manufacturers such as Gunlocke, Milwaukee Chair Co., or similar." },
    { type: "materials", clue: "cast_iron", confidence: 84, description: "The tilt/swivel mechanism beneath the seat is clearly cast iron — visible in the base closeup as a black, multi-part casting with flanges, a central post, and a lower collar ring. The surface shows a painted or japanned black finish with some wear." },
    { type: "finish", clue: "polyurethane", confidence: 45, description: "The wooden surfaces show a medium-brown stained finish that appears to be a lacquer or varnish coat. The seat surface in the front view shows surface scratches and a white scuff/residue mark near center. The finish appears original or early refinish — no obvious polyurethane plastic sheen, more consistent with an older lacquer or shellac-based finish." },
    { type: "condition", clue: "modern_caster", confidence: 54, description: "The seat surface shows multiple light scratches and a white scuff mark. The arm ends show wear and rounding from use. The base leg tips show finish loss and some wood damage/chipping at the ends near the casters. Overall the chair is structurally sound with cosmetic wear consistent with age and use." },
    { type: "style", clue: "", confidence: 55, description: "The second joinery closeup (three-quarter rear view) confirms the arched cutout design at the base of each back splat — three splats with paired arch cutouts creating a Gothic or tulip motif. The crest rail has a gently curved top edge. The arms sweep forward with a graceful curve and terminate with a slight downward curl. All consistent with Arts and Crafts / Mission office chair circa 1900-1920." },
    { type: "joinery", clue: "mortise_and_tenon", confidence: 45, description: "The connection of the back splats to the crest rail and seat rail appears to use mortise-and-tenon joinery, as is typical for this type of solid oak office chair construction. No visible mechanical fasteners at these joints in any of the photos." },
    { type: "context", clue: "maker_label", confidence: 48, description: "Chair is photographed outdoors on a concrete surface with fallen leaves and a garden hose visible in background. No maker's label, stamp, or text is visible in any of the four images." },
  ],
  asSeen: {
    formId: "Upholstered armchair",
    display: "Upholstered armchair (also commonly called: Arm chair, Easy chair)",
    finalStyleKind: "context_only",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

// 1920s Jacobean Revival barley-twist tall-case (grandfather) clock. DATE + STYLE
// are CORRECT (c.1920–1925, Jacobean Revival) — a "pipeline-worked" contrast case
// like S013/S014: supported attribution (0.82, 1880–1940) → style_wave convergence
// → P2 used it. BUGS: (1) M8 clock→"Trunk" AGAIN — clock_case_form is the top form
// clue (0.850) yet form_trunk wins ("Tall case clock" demoted to alt); both clocks
// this session (Logan + this) route to trunk, so the clock→trunk misroute is
// reliable, not just intermittent. (2) Hallucinated subtype_flat_top_trunk (conf 1.0)
// on a clock — fix#3 only drops DATE-disjoint subtypes; this one has null dates so it
// survives (a fix#3 gap: form-absurd subtypes aren't gated). (3) #8 stale
// "Supported Findings" date — reads "Broadly late 19th to 20th century" while the
// headline is c.1920–1925 (2nd occurrence after the Logan clock → recurring).
// Minor: glass_top (dial glass) parked by fix#1; spindle_back/gallery FPs.
const jacobean_revival_tall_case_clock: ScanFixture = {
  label: "jacobean_revival_tall_case_clock",
  note: "1920s Jacobean Revival grandfather clock; date/style CORRECT (c.1920–1925, pipeline worked). Bugs: M8 clock→Trunk (2nd clock this session), flat-top-trunk subtype conf 1.0 (fix#3 null-date gap), #8 stale Supported-Findings date (n=2).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "clock_case_form", confidence: 68, description: "Tall case / grandfather clock form visible — three-section case with hood, waist, and base; floor-standing height; pendulum and weight chains visible in open waist." },
    { type: "style", clue: "barley_twist", confidence: 52, description: "Prominent barley-twist (spiral-turned) columns flank the waist section on both sides; visible in front and side views. Barley twist is a strong Jacobean/William & Mary revival and late Victorian stylistic signal." },
    { type: "style", clue: "turned_spindle_gallery", confidence: 52, description: "Small turned spindles/finials visible flanking the hood dial opening, consistent with Victorian decorative clock case ornament." },
    { type: "style", clue: "scrolled_side_corbels", confidence: 52, description: "Carved scroll/corbel ornament visible on the side of the hood section in the side view image, consistent with Victorian shelf/case clock ornament." },
    { type: "hardware", clue: "brass_dial_bezel", confidence: 62, description: "Square brass dial plate with cast acanthus-scroll spandrel ornaments at all four corners; brass background with applied silvered chapter ring. Consistent with American or European tall case clock dial treatment c. 1860-1930." },
    { type: "hardware", clue: "roman_numeral_dial", confidence: 62, description: "Roman numerals I through XII on the chapter ring of the clock dial; silvered/white chapter ring with black Roman numeral printing. Pre-1920 dominant format." },
    { type: "hardware", clue: "metal_hands", confidence: 62, description: "Ornate blued-steel or blackened metal clock hands with decorative spade/fleur-de-lis style cutouts visible on the dial closeup." },
    { type: "hardware", clue: "winding_arbors", confidence: 62, description: "Two weight chains visible hanging in the open waist section, suggesting an 8-day time-and-strike movement with two weights. No third chain visible for chime train." },
    { type: "hardware", clue: "pendulum_bob_cast", confidence: 45, description: "Round pendulum bob visible in the waist section; appears to be a cast brass or metal disc bob. Consistent with c. 1860-1930 tall case clock pendulum hardware." },
    { type: "style", clue: "carved_decorative_panel", confidence: 45, description: "Carved figural/foliate relief panel visible on the base section front; appears to show a figure or heraldic motif in low relief. Consistent with Jacobean revival or late Victorian decorative carving." },
    { type: "style", clue: "rope_molding", confidence: 52, description: "Rope-twist or beaded molding visible along the cornice shelf between hood and waist, and along the base top edge. Consistent with Jacobean revival and Victorian decorative case work." },
    { type: "style", clue: "broken_pediment_hood", confidence: 52, description: "Hood features a stepped/broken pediment form with raised central block; not a full arch but a flat-top stepped cornice with raised center element. Consistent with Colonial Revival or Jacobean revival tall case clock hoods." },
    { type: "materials", clue: "solid_wood_construction", confidence: 45, description: "Case appears to be constructed of solid wood throughout; dark-stained hardwood (possibly oak or walnut-stained gumwood/oak) visible on all surfaces. Barley twist columns appear to be solid turned wood." },
    { type: "style", clue: "brass_spandrel_ornaments", confidence: 52, description: "Cast brass acanthus-scroll spandrel ornaments at all four corners of the square brass dial plate; ornate foliate casting consistent with 18th-century tall case clock dial tradition or Victorian revival reproduction of same." },
    { type: "style", clue: "open_waist_design", confidence: 52, description: "The waist section is open/skeletal — flanked by barley-twist columns but without solid side panels enclosing the pendulum and weights. This is an unusual design feature; most traditional tall case clocks have enclosed waist trunks. Suggests a decorative or revival interpretation rather than a traditional English/American tall case form." },
    { type: "condition", clue: "brass_dial_patina", confidence: 54, description: "The brass dial plate shows uneven patina and tarnish, with the central boss area showing a rough/granular texture consistent with age or casting texture. The silvered chapter ring shows some discoloration. Consistent with genuine age or deliberate antiquing." },
    { type: "structure", clue: "three_section_case", confidence: 82, description: "Classic tall case clock three-section construction: hood (with dial and movement), waist (with pendulum and weights), and base (plinth/trunk base). All three sections clearly visible." },
    { type: "style", clue: "jacobean_revival_style", confidence: 52, description: "Multiple Jacobean revival style cues present: barley-twist columns, rope molding, carved relief panels, dark stained wood. This style was popular in American furniture c. 1890-1930 and in reproduction clock cases through the mid-20th century." },
    { type: "style", clue: "carved_hood_side_panel", confidence: 52, description: "Side view shows a carved rectangular panel on the hood side with raised molded border and carved interior detail, consistent with Jacobean or Colonial Revival decorative case treatment." },
    { type: "hardware", clue: "weight_driven_movement", confidence: 62, description: "Two metal chains/cables visible hanging from the movement through the open waist, indicating a weight-driven mechanical movement rather than spring-driven. Consistent with traditional tall case clock mechanics." },
    { type: "form", clue: "floor_standing_height", confidence: 45, description: "Clock is floor-standing; appears to be approximately 5-6 feet tall based on proportions relative to surrounding objects. Qualifies as a tall case / grandfather clock form." },
    { type: "label", clue: "maker_label", confidence: 80, description: "No visible maker name, label, stamp, or text inscription detected on any visible surface in any of the four images. The dial does not show a maker's name in the visible area." },
    { type: "style", clue: "no_arch_top_dial", confidence: 52, description: "The dial is square/rectangular format without an arched top, distinguishing this from the arched-dial tall case clock tradition of c. 1720-1800. Square dial format is consistent with earlier tall case clocks (pre-1720) or with later revival/reproduction pieces." },
    { type: "materials", clue: "glass_top", confidence: 50, description: "glass" },
    { type: "structure", clue: "spindle_back", confidence: 78, description: "Spindles are visible in the back or side rail." },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
  ],
  asSeen: {
    formId: "Trunk",
    display: "Tudor Revival / Jacobean Revival / Elizabethan Revival Trunk (also commonly called: travel trunk, steamer trunk)",
    finalStyleKind: "original_period",
    dateRange: "c. 1920–1925",
    dateFloor: 1920,
    dateCeiling: 1925,
    confidence: "Moderate",
  },
};

// Mid-century American craft panel-back rocker (~1930s–1950s per the model: Tell
// City / Cushman Colonial idiom). Form correct (Rocking chair). KEY fix#1 SECOND-PATH
// fixture: output c.1890–1920 is DISJOINT from the 1920–1980 envelope in the EARLY
// direction — its floor (1890) is 30yr below the envelope floor (lacquer_finish
// 1920–1980 is a terminus-post-quem). Root: the absenceOfModern && (strongPre1920 +
// vernacular)≥2 rule (engine.ts:6122) returns a hardcoded "c. 1890–1920" DIRECTLY,
// bypassing the evidence-floor anchor. The SHIPPED fix#1 does NOT catch this (it only
// intercepts the "Broadly late 19th to 20th century" placeholder) — this fixture
// documents the remaining path: heuristic 1890–1920 returns must be clamped to the
// latest layer floor (here lacquer ≥1920). Also: severe M1 (7/15 obs keyless), #10
// spurious "American Empire" default WITHOUT a metal trigger (generic no-attribution
// default), M8 phantom "Upholstered armchair" alt (form_rocking_chair correctly won).
const midcentury_craft_panel_back_rocker: ScanFixture = {
  label: "midcentury_craft_panel_back_rocker",
  note: "Mid-century craft rocker (~1930s–50s); fix#1 SECOND PATH — heuristic 1890–1920 (engine.ts:6122) overrides the lacquer 1920+ floor, dating too EARLY (disjoint below the 1920–1980 envelope). Shipped fix#1 misses this. Also severe M1 (7/15 keyless), #10 American-Empire default sans metal.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "armchair_form", confidence: 68, description: "Overall front view shows a full rocking chair with arms, high fan/shield-shaped back, solid wood seat, and curved rocker runners. The chair has a substantial, well-proportioned form consistent with mid-20th century American craft production." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "High, wide fan-shaped or shield-shaped backrest composed of multiple solid wood panels joined vertically. The crest rail has a scalloped/serpentine profile with a central carved rose motif. Back is notably tall relative to seat height." },
    { type: "materials", clue: "solid_wood_construction", confidence: 45, description: "All visible components appear to be solid wood throughout — seat, back panels, arms, legs, and rockers. The grain pattern and figure visible on the back panels suggest a fruitwood, possibly cherry, with warm amber-to-reddish-brown tones. No veneer or plywood construction is apparent." },
    { type: "materials", clue: "", confidence: 45, description: "The wood species appears consistent with American black cherry or possibly birch/maple with a warm stain. The back panels show a fine, relatively straight grain with subtle figure. The lighter central panel versus darker side panels may indicate two-tone staining or natural color variation between boards." },
    { type: "style", clue: "", confidence: 55, description: "The carved rose motif on the crest rail is executed in low-to-medium relief with flowing stem and leaf details, consistent with Art Nouveau or late Arts and Crafts decorative vocabulary. The scalloped crest rail profile reinforces this stylistic reading. Overall form suggests American production circa 1920s-1950s." },
    { type: "joinery", clue: "dowel_joinery", confidence: 72, description: "In the joinery closeup of the crest rail area, at least four square or diamond-shaped dark plugs or fastener heads are visible flanking the central carved panel — two on each side. These appear to be square wooden plugs covering dowels or screws used to attach the back panels to the crest rail frame. The diamond orientation of the plugs is a decorative touch." },
    { type: "fasteners", clue: "", confidence: 50, description: "Diamond/square-oriented dark plugs visible in the crest rail area of the back (joinery closeup). These could be decorative square wooden plugs covering screws or dowel ends. Their diamond orientation suggests intentional decorative placement, consistent with Arts and Crafts style hardware presentation." },
    { type: "construction", clue: "", confidence: 83, description: "The back view (back image) reveals the back panel construction clearly: three vertical solid wood panels are held within a frame consisting of a top crest rail and a lower horizontal rail. The panels appear to float within the frame or be glued edge-to-edge. The back frame is lighter in color than the panels, suggesting different wood species or finish variation." },
    { type: "form", clue: "seating_surface", confidence: 45, description: "The seat is a solid wood plank, slightly contoured or saddled, with a darker finish than the back panels. From the side view, the seat appears to have a slight forward tilt. No upholstery or cushion is present." },
    { type: "construction", clue: "dowel_joinery", confidence: 75, description: "Side view shows the rocker runners are long, gracefully curved, and appear to be steam-bent or laminated solid wood. The front legs are slightly splayed and connect to the rockers with what appear to be mortise-and-tenon or dowel joints. The arm support posts are turned or shaped and connect arm to seat rail." },
    { type: "joinery", clue: "mortise_and_tenon", confidence: 45, description: "From the side view, the junction of the back legs/posts with the seat rail and rocker appears consistent with mortise-and-tenon construction. The back post appears to pass through or seat deeply into the rocker runner. No visible metal fasteners at these joints." },
    { type: "finish", clue: "lacquer_finish", confidence: 45, description: "The overall finish appears to be a clear or lightly tinted lacquer or varnish with a semi-gloss sheen. The finish shows some wear on the seat surface and minor scratching on the back panels. No obvious crazing or alligatoring consistent with old shellac. The finish appears relatively intact and possibly refinished at some point." },
    { type: "condition", clue: "", confidence: 54, description: "Overall condition appears good to very good. Minor surface scratches visible on the back panel (front view). Some finish wear on the seat. The back panel in the joinery closeup shows some light surface marks and possible minor checking in the wood. No major structural damage, broken joints, or significant losses visible." },
    { type: "style", clue: "", confidence: 48, description: "The combination of the fan/shield back form, scalloped crest rail, carved rose decoration, solid wood seat, and graceful rocker runners is consistent with American production rocking chairs of the 1930s-1950s, possibly from a regional furniture maker or a production company such as Tell City, Cushman Colonial, or similar mid-century American manufacturers. The rose carving has a folk/craft quality." },
    { type: "construction", clue: "", confidence: 48, description: "Back view shows the rear of the back panel assembly. The three-panel back has a lighter-colored outer frame (possibly maple or birch) contrasting with the darker center panels. A horizontal stretcher rail is visible at the bottom of the back panel assembly connecting the two rear posts. The overall back construction is clean with no visible repairs." },
  ],
  asSeen: {
    formId: "Rocking chair",
    display: "Rocking chair",
    finalStyleKind: "context_only",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

// William & Mary-style burl-veneer slant-front escritoire-on-stand. Strong GENUINE-
// EARLY evidence (hand-sawn THICK veneer pre-1910, hand_cut_dovetails pre-1860,
// surface_mount_lock 1650–1850, verdigris patina, worn green baize). Form CORRECT
// (Escritoire). SEVERE MISDATE: output "Late 20th-Century Formal Traditional", c.1900–
// 2000 — i.e. a 1970–2000 reproduction — a potentially huge valuation error.
// ROOT #1: the richest convergence zone in the corpus (7 layers, 1650–1920) is REJECTED
// by ABSOLUTE_WIDTH_CAP=160 (270y wide) → falls to the 1900/2000 placeholder.
// ROOT #2: revival-wave late-pull (M11-family) — style reconciliation aligns to the
// LATEST wave (1970–2000), ignoring the early construction evidence.
// fix#1 EDGE: the placeholder fires the anchor, but max real-layer floor is 1840
// (fastener) < OPEN_FLOOR_MIN_YEAR 1850 → anchor bails → 1900–2000 survives. fix#1
// structurally can't help pre-1850 pieces. M6: brass_frame (brass lock) → "Brass bed/
// Metal furniture" alt-forms (brass_frame correctly PARKED in wood layer by shipped fix#1).
const william_mary_burl_escritoire_on_stand: ScanFixture = {
  label: "william_mary_burl_escritoire_on_stand",
  note: "W&M burl escritoire-on-stand; genuine-early evidence MISDATED as 'Late 20th-C Formal Traditional' 1900–2000. Root: 7-layer convergence (1650–1920) rejected by 160y width cap + revival-wave late-pull. fix#1 edge: floor 1840 < OPEN_FLOOR_MIN_YEAR 1850 → can't help pre-1850. Form correct (Escritoire).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "slant_front", confidence: 68, description: "Angled hinged writing flap (fall front) is clearly visible in the open position, supported by the horizontal writing surface. The slant-front is the primary form-defining feature of this desk." },
    { type: "form", clue: "pigeonholes", confidence: 68, description: "Interior of the open fall front reveals multiple small drawers arranged in a fitted interior with open cubby compartments on the flanking sides — classic pigeonhole / letter-slot interior arrangement visible in overall_front and joinery_closeup images." },
    { type: "form", clue: "drawer_present", confidence: 68, description: "Two to three exterior case drawers visible below the fall front on the case body, plus multiple small interior drawers within the fitted interior. Exterior drawers have lock escutcheons and turned brass knobs." },
    { type: "function", clue: "writing_surface", confidence: 70, description: "Fall front opens to reveal a green baize-covered writing surface. The baize is worn and faded, consistent with extended use as a writing surface." },
    { type: "style", clue: "barley_twist", confidence: 52, description: "All four legs of the stand exhibit pronounced bobbin/barley-twist turning — a defining stylistic feature of William and Mary period furniture (c. 1680–1720). The turnings are dark-stained or ebonized in appearance." },
    { type: "style", clue: "serpentine_stretcher", confidence: 52, description: "The stand base has a shaped serpentine / X-form flat stretcher connecting the four legs, with a central carved or shaped medallion. This is a characteristic William and Mary / late 17th-century stand feature." },
    { type: "materials", clue: "thick_veneer", confidence: 84, description: "Veneer losses at the case top corners and edges reveal visibly thick veneer cross-sections — consistent with hand-sawn veneer of the late 17th to early 18th century, substantially thicker than modern rotary-cut or sliced veneer." },
    { type: "materials", clue: "burl_walnut_veneer", confidence: 45, description: "The slant-front fall, case sides, and exterior drawer fronts are veneered with highly figured burl walnut veneer showing characteristic circular eye patterns and swirling grain." },
    { type: "materials", clue: "bookmatching", confidence: 84, description: "The slant-front fall panel shows bookmatched burl veneer with bilateral symmetry — mirror-image grain visible across the center seam. This is consistent with high-quality early cabinetmaking veneer work." },
    { type: "materials", clue: "crossbanding_herringbone", confidence: 82, description: "Crossbanding or herringbone banding is visible as a border strip around the slant-front fall panel and case drawer fronts, consistent with William and Mary / Queen Anne period decorative veneer technique." },
    { type: "hardware", clue: "lock_escutcheons", confidence: 62, description: "Multiple brass lock escutcheons visible: one on the slant-front fall, and additional escutcheons on the exterior case drawers. The escutcheons appear cast or pierced with decorative profiles consistent with late 17th to early 18th century hardware." },
    { type: "hardware", clue: "pierced_escutcheon", confidence: 45, description: "The escutcheon on the slant-front fall appears to be a pierced or cast brass escutcheon with decorative surround — consistent with William and Mary / Queen Anne period hardware (c. 1680–1730)." },
    { type: "hardware", clue: "round_wood_knob", confidence: 62, description: "Interior small drawers have small turned brass or bone/ivory-colored round knobs — simple turned knobs consistent with early period interior fittings. Exterior drawers also have small turned brass knobs." },
    { type: "hardware", clue: "decorative_bail_pull", confidence: 62, description: "The case side shows a cast brass bail/ring handle with decorative shell or rosette backplates — a carrying handle for the case. This is consistent with William and Mary / Queen Anne period brass hardware." },
    { type: "hardware", clue: "surface_mount_lock", confidence: 45, description: "A surface-mounted or half-mortise brass lock plate is visible on the interior drawer area. The lock plate appears to be a period surface-mount or half-mortise type consistent with 17th–18th century construction." },
    { type: "hardware", clue: "slotted_screw", confidence: 62, description: "Slotted screws visible securing the lock plate hardware on the interior drawer. Slotted screws are consistent across all pre-Phillips-head eras." },
    { type: "hardware", clue: "butt_hinge", confidence: 62, description: "Brass butt hinges visible at the fall-front hinge line connecting the slant-front writing surface to the case body. Hinges appear to be period brass butt hinges." },
    { type: "condition", clue: "veneer_losses", confidence: 54, description: "Veneer losses visible at the top corners of the case, along edges, and at the case top surface. The losses expose the secondary wood substrate beneath and reveal the thickness of the veneer." },
    { type: "condition", clue: "shellac_crazing", confidence: 54, description: "Fine network of surface crazing visible on the slant-front fall and case surfaces, consistent with aged shellac or spirit varnish finish." },
    { type: "condition", clue: "age_wear_patina", confidence: 54, description: "Extensive age-consistent wear and patina throughout: darkened secondary wood interiors, worn baize writing surface, tarnished and verdigris-covered brass hardware. All consistent with genuine extended age." },
    { type: "construction", clue: "case_on_stand", confidence: 96, description: "The desk is constructed as two separate elements: an upper case (the slant-front writing box with drawers) resting on a separate stand with turned legs and stretcher base. This two-part construction is characteristic of William and Mary period bureau-on-stand / escritoire forms." },
    { type: "construction", clue: "secondary_wood_interior", confidence: 92, description: "Interior drawer compartments and structural members show a darker, plainer secondary wood (likely oak, pine, or fruitwood) used for the carcass and interior fittings, with the figured veneer applied only to show surfaces. This is consistent with period cabinetmaking practice." },
    { type: "construction", clue: "fitted_interior_compartments", confidence: 95, description: "The interior of the fall front reveals a fully fitted arrangement of small drawers, open cubbies/pigeonholes, and at least one stepped or tiered central section. A pull-out drawer with internal subdivisions is visible — consistent with a well-appointed period writing interior." },
    { type: "construction", clue: "ebonized_stand", confidence: 85, description: "The stand legs, stretcher, and feet appear to be ebonized or made from a dark-stained hardwood, contrasting with the warm burl veneer of the upper case. This two-tone treatment is characteristic of William and Mary period English and Continental furniture." },
    { type: "construction", clue: "bun_feet", confidence: 88, description: "The stand terminates in bun feet — flattened spherical turned feet. Bun feet are a characteristic William and Mary period foot form (c. 1680–1720)." },
    { type: "materials", clue: "green_baize_writing_surface", confidence: 84, description: "The fall-front writing surface is covered with green baize (wool felt). The baize is worn, faded, and shows age-consistent surface degradation. Green baize writing surfaces are characteristic of period writing furniture." },
    { type: "style", clue: "william_and_mary_style", confidence: 52, description: "The combination of barley-twist/bobbin-turned legs, serpentine X-stretcher, bun feet, burl veneer show surfaces with crossbanding, two-part case-on-stand construction, and brass bail side handles collectively constitute a strong William and Mary style vocabulary (c. 1680–1720). This could be English, Dutch, or Continental in origin, or a later revival." },
    { type: "materials", clue: "olivewood_veneer_interior", confidence: 72, description: "The interior small drawer fronts show a highly distinctive swirling, flame-like figured veneer — consistent with olivewood veneer or burr elm veneer, both commonly used for interior fittings in late 17th to early 18th century English and Continental writing furniture." },
    { type: "hardware", clue: "brass_lock_plate_interior", confidence: 62, description: "Small brass lock plates with escutcheon openings visible on the interior small drawers. Tarnish and verdigris consistent with age." },
    { type: "condition", clue: "hardware_tarnish_verdigris", confidence: 54, description: "All visible brass hardware shows significant tarnish and green verdigris patina consistent with extended age and minimal cleaning. This is a positive age indicator." },
    { type: "construction", clue: "hand_cut_dovetails", confidence: 60, description: "Interior drawer visible in joinery_closeup shows corner joinery that appears hand-fitted. While the resolution does not permit definitive dovetail identification, the construction context strongly suggests hand-cut joinery. Confidence is moderate pending closer examination." },
    { type: "style", clue: "design_influence_william_and_mary_continental", confidence: 52, description: "The overall design vocabulary — bobbin-turned legs, serpentine stretcher, burl veneer, case-on-stand form — is consistent with William and Mary design influence as practiced in England, the Netherlands, and Continental Europe c. 1680–1720." },
    { type: "materials", clue: "brass_frame", confidence: 50, description: "brass surface-mount lock hardware" },
    { type: "construction", clue: "drop_front_desk", confidence: 84, description: "Drop-front writing surface is visible." },
    { type: "form", clue: "cabinet_form", confidence: 68, description: "Cabinet or cupboard form is visible." },
  ],
  asSeen: {
    formId: "Escritoire",
    display: "Late 20th-Century Formal Traditional Escritoire (also commonly called: Escritoire, French escritoire)",
    finalStyleKind: "revival_wave",
    dateRange: "Broadly late 19th to 20th century",
    dateFloor: 1900,
    dateCeiling: 2000,
    confidence: "Low",
  },
};

// Peacock / Emmanuelle rattan armchair (true ~1960s–80s Filipino import). Bizarre,
// instructive failure: identified as a "Loom" (weaving loom) and dated c.1940–1950.
// M7→M6 (date driver): lloyd_loom_paper_fiber is the top material clue (wt 0.910) but
// its description NEGATES Lloyd loom ("natural rattan… NOT… Lloyd loom"); consumed as
// positive → wood layer 1920–1950 → convergence 1940–1950. The date rests on a clue
// asserting the piece is NOT what the clue claims.
// M8: form "Loom" on an armchair — token contamination from "lloyd_LOOM" / the
// Lloyd-Flanders maker mark → form_loom (worst form misroute in the corpus).
// M12-adjacent: hallucinated maker_mark_authored_lloyd_flanders (model said NO label)
// matched "lloyd" inside the construction phrase "Lloyd loom" — a real word match to the
// WRONG entity, so the word-boundary M12 fix does NOT catch it. fix#2 DID work
// (parseLabelDate excludes maker_mark_* → no 1906 floor).
// Negation-heavy (M7 at scale): open_shelving/pedestal_column/etc. negations consumed.
// Wicker clues are CORRECT here (it IS wicker — not the woven-on-solid-wood M6).
const peacock_emmanuelle_rattan_chair: ScanFixture = {
  label: "peacock_emmanuelle_rattan_chair",
  note: "Peacock/Emmanuelle rattan chair (~1960s–80s) → 'Loom' c.1940–1950. M7→M6: NEGATED lloyd_loom_paper_fiber (0.910, 'NOT Lloyd loom') consumed as positive drives the 1920–1950 wood date. M8 chair→loom + M12-adjacent hallucinated Lloyd Flanders mark (both from the 'Lloyd loom' token; word-boundary fix can't catch a real-word wrong-entity match). fix#2 held.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Circular woven rattan seat surface visible with concentric spiral coil pattern at center; seat is open-weave wicker construction." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Dramatically oversized circular fan-shaped backrest characteristic of peacock/emmanuelle chair form; backrest diameter substantially exceeds seat width." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Chair has two armrests integrated into the lower backrest structure; arms are woven rattan with decorative knotted/braided end caps." },
    { type: "style", clue: "mid_century_streamlined_wicker", confidence: 52, description: "Classic 'Emmanuelle' or 'peacock' chair form with oversized circular fan back, open diamond-weave field, scrollwork medallion, and ring-loop border — canonical mid-century imported wicker form, c. 1960s-1980s, typically Philippine or Asian-Pacific production." },
    { type: "materials", clue: "rattan_frame", confidence: 84, description: "Thick bent rattan poles form the structural frame including the circular back hoop, seat ring, legs, and vertical back supports; poles are smooth, round, and show natural rattan node marks." },
    { type: "materials", clue: "woven_body", confidence: 84, description: "Entire chair body — back field, seat, base skirt, arm panels — is woven with natural reed/rattan strands in multiple patterns including open diamond lattice, close weave, and decorative scrollwork." },
    { type: "construction", clue: "wire_wrapped_metal_joint", confidence: 70, description: "No visible wire-wrapped metal joints detected; frame junctions appear to be rattan-wrapped rather than wire-bound, consistent with natural-fiber construction throughout." },
    { type: "style", clue: "victorian_curlicue_wicker", confidence: 52, description: "Chair does not exhibit Victorian curlicue wicker characteristics; instead shows the cleaner mid-century peacock form with geometric open weave and restrained scrollwork medallion." },
    { type: "style", clue: "bar_harbor_style_wicker", confidence: 52, description: "Not Bar Harbor style; peacock fan-back form with elaborate scrollwork medallion is distinct from the open airy geometric Bar Harbor aesthetic." },
    { type: "construction", clue: "wicker_weave_open", confidence: 95, description: "Back field and base skirt use open diamond-lattice weave with visible gaps between strands; characteristic of mid-century peacock chair production." },
    { type: "construction", clue: "wicker_weave_close", confidence: 88, description: "Seat surface and some transitional zones use tighter close weave; multiple weave patterns coexist on the same piece." },
    { type: "construction", clue: "wicker_weave_basket", confidence: 82, description: "Arm end caps and base skirt panels show basket-weave over-under pattern in groups of strands." },
    { type: "materials", clue: "lloyd_loom_paper_fiber", confidence: 84, description: "Strands are natural plant fiber (rattan/reed) with irregular tapered profiles visible at broken ends and close-up; not uniform extruded paper-fiber strands of Lloyd loom construction." },
    { type: "condition", clue: "wicker_strand_breakage", confidence: 54, description: "Significant strand breakage and unraveling visible at the left arm junction area; multiple strands are frayed, broken, and curling away from the structure. Structural integrity of arm attachment appears compromised." },
    { type: "condition", clue: "wicker_paint_buildup", confidence: 54, description: "No paint buildup observed; chair retains natural unfinished or lightly finished rattan color throughout with no evidence of multiple paint layers obscuring weave detail." },
    { type: "style", clue: "peacock_fan_back_form", confidence: 52, description: "Oversized circular fan back with decorative scrollwork medallion at center featuring concentric spiral coils and curved rattan loops arranged in a peacock-feather or floral motif; ring-loop border trim around the full circumference of the back hoop. This is the canonical 'Emmanuelle chair' or 'peacock chair' form." },
    { type: "construction", clue: "vertical_supports", confidence: 96, description: "Two prominent vertical rattan poles rise from seat level through the back field to support the fan back structure; visible from both front and back views." },
    { type: "construction", clue: "pedestal_column", confidence: 88, description: "Chair sits on four rattan legs (not a single pedestal column); legs are wrapped rattan poles connected by an open-lattice base skirt ring." },
    { type: "construction", clue: "open_shelving", confidence: 92, description: "No shelving present; the open lattice base skirt is structural/decorative, not a functional shelf." },
    { type: "materials", clue: "natural_fiber_strands", confidence: 84, description: "Close-up shows irregular tapered natural plant fiber strands (rattan reed/cane) with visible node irregularities and organic taper — consistent with natural rattan/reed rather than paper fiber or synthetic material." },
    { type: "condition", clue: "overall_structural_integrity", confidence: 54, description: "Main fan back, seat, base, and right arm appear structurally sound. Left arm junction shows significant wicker strand failure with unraveling and breakage. No evidence of major frame breakage or collapse." },
    { type: "style", clue: "ring_loop_border", confidence: 52, description: "Distinctive chain-link or ring-loop border trim runs around the full circumference of the fan back hoop; this is a characteristic decorative element of the classic peacock/emmanuelle chair form." },
    { type: "style", clue: "scrollwork_medallion", confidence: 52, description: "Central back field features an elaborate open-work medallion of curved rattan loops and concentric spiral coils arranged symmetrically; this decorative element is characteristic of the classic peacock chair form." },
    { type: "construction", clue: "coiled_spiral_seat", confidence: 93, description: "Seat surface features a concentric spiral coil pattern at center, created by tightly wound rattan reed; characteristic construction detail of peacock chair seats." },
    { type: "label", clue: "maker_label", confidence: 85, description: "No maker label, stamp, tag, or visible text observed in any of the three images." },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "label", clue: "maker_mark_authored_lloyd_flanders", confidence: 70, description: "Detected maker mark: Lloyd Flanders. Mark type: paper_label. Dating reference: post-1906. Confidence tier: MEDIUM." },
  ],
  asSeen: {
    formId: "Loom",
    display: "Mid-Century Modern / American Modernism Loom (also commonly called: Loom, Weaving loom)",
    finalStyleKind: "original_period",
    dateRange: "c. 1940–1950",
    dateFloor: 1940,
    dateCeiling: 1950,
    confidence: "Moderate",
  },
};

export const SESSION_SCANS: ScanFixture[] = [ladderback, victorianTrunk, sears1960sDresser, victorian_windsor_rocker, commode_close_stool, art_deco_candelabrum, renaissance_revival_sgabello, china_import_cedar_chest, swivit_space_age_pedestal_chair, colonial_revival_oak_bowfront_chest, vernacular_painted_milking_stool, golden_oak_curved_glass_china_cabinet, logan_1914_tall_case_clock, oak_swivel_bankers_office_chair, jacobean_revival_tall_case_clock, midcentury_craft_panel_back_rocker, william_mary_burl_escritoire_on_stand, peacock_emmanuelle_rattan_chair];
