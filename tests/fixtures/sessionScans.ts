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
  note: "P5 ruled pre-1880; date came out 1920–1930. cut_nail(1790–1890)+hand_plane_chatter(pre-1880) low-conf so #111 didn't clamp. (Rush seat had a phantom 'no-spring stuffed seat' upholstery layer — T1a: now suppressed.)",
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
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Ladderback chair",
    display: "Centennial Chippendale Revival Ladderback chair (also commonly called: Slat-back chair, Ladder chair)",
    styleContext: "Chippendale",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
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
    // Negation re-baseline: hand_plane_chatter is now correctly negated ("machine
    // planing rather than hand planing"), and the Sears freight label is retained
    // (quoted-transcription rule) despite "...not a maker's mark". The hand-tool
    // floor drops out, so the date widens to post-1940 and the label-vs-machine
    // conflict lowers confidence to Moderate.
    dateRange: "post-1940",
    dateFloor: null, // reconstruction replays floor 1940 vs live 1920 (hard-negative floor calibration) — not asserted
    dateCeiling: null,
    confidence: "Moderate",
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
  // KNOWN-RED (deferred): the negation re-baseline correctly negates
  // painted_metal_finish ("does not appear to be painted enamel … patina/verdigris
  // … bronze/brass"), but that finish clue's `dateHint: post-1900` was the ONLY hard
  // 20th-c anchor — the deco style cues (art_deco_style_cues etc.) carry no date hint
  // and contribute 0, so dating collapses to "c. 1850 onward / unresolved". This is a
  // separate downstream root cause (style cues don't anchor dating), tracked for a
  // future pass; the asSeen below is left at the PRE-negation expectation on purpose
  // so the gate flags it until the downstream fix lands.
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
  note: "Renaissance Revival sgabello; tracks the narrative/working-range contradiction (convergence claimed yet range Broad) + M6 phantom upholstery on a plank seat [T1a: now suppressed] (#4/M6).",
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
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Upholstered armchair",
    display: "Mid-Century Modern / American Modernism Upholstered armchair (also commonly called: Arm chair, Easy chair)",
    styleContext: "Mid-Century Modern / American Modernism",
    finalStyleKind: "original_period",
    dateRange: "c. 1960–1979",
    dateFloor: 1960,
    dateCeiling: 1979,
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
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Chest of drawers / dresser",
    display: "Colonial Revival Queen Anne Chest of drawers / dresser (also commonly called: chest, drawer chest)",
    styleContext: "Queen Anne",
    finalStyleKind: "revival_wave",
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
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "China cabinet",
    display: "Interwar and Postwar Mahogany Chippendale China cabinet",
    styleContext: "Chippendale",
    finalStyleKind: "revival_wave",
    dateRange: "Broadly late 19th to 20th century",
    dateFloor: 1900,
    dateCeiling: 2000,
    confidence: "Low",
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
  note: "Oak swivel banker's office chair (~1900–1920, date correct). Validates fix#1 metal→wood + fix#2 + T2a live: cast/wrought_iron from the tilt mechanism no longer make a wood chair 'Toledo industrial' (style now Unresolved) or add Iron/Metal alt-forms. Still tracks modern_caster n=3 + phantom 'Upholstered'.",
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
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Upholstered armchair",
    display: "Arts and Crafts / Mission / Craftsman Upholstered armchair (also commonly called: Arm chair, Easy chair)",
    styleContext: "Arts and Crafts / Mission / Craftsman",
    finalStyleKind: "original_period",
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
  note: "Mid-century craft rocker (~1930s–50s). #6 Phase 1 FIXES the date: with no hard construction layer to date it, the corroborated style prose ('circa 1920s-1950s' + '1930s-1950s') now anchors c.1930–1959 (Low) instead of the 1890–1920 catch-all — the clean style-prose case (its only datable signal is style). Still tracks severe M1 (7/15 keyless) + #10 American-Empire default (style label unchanged).",
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
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Rocking chair",
    display: "Arts and Crafts / Mission / Craftsman Rocking chair",
    styleContext: "Arts and Crafts / Mission / Craftsman",
    finalStyleKind: "original_period",
    dateRange: "c. 1920–1930",
    dateFloor: 1920,
    dateCeiling: 1930,
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
  note: "W&M burl escritoire-on-stand; genuine-early evidence MISDATED as 'Late 20th-C Formal Traditional' 1900–2000. Root: 7-layer convergence (1650–1920) rejected by 160y width cap + revival-wave late-pull. fix#1 edge: floor 1840 < OPEN_FLOOR_MIN_YEAR 1850 → can't help pre-1850. T2a: veneer now reads wood-primary → brass_frame 'Brass bed'/'Metal furniture' alt-forms suppressed; form is the synonymous 'Slant-front desk' (Escritoire now alt #1). The wrong-late date (M11 revival late-pull; the 160y width-cap is a separate co-occurring root, not M11 itself) is still open.",
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
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Slant-front desk",
    display: "Interwar Traditional William and Mary Slant-front desk (also commonly called: Slant-front desk, Slant-lid desk)",
    styleContext: "William and Mary",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1940–1945",
    dateFloor: 1940,
    dateCeiling: 1945,
    confidence: "Moderate",
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
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Loom",
    display: "Loom (also commonly called: Loom, Weaving loom)",
    finalStyleKind: "unresolved",
    dateRange: "c. 1920–1950",
    dateFloor: 1920,
    dateCeiling: 1950,
    confidence: "Low",
  },
};

// Woodard-style wrought-iron / expanded-metal-mesh patio armchair (~1940s–60s,
// Chantilly Rose pattern). Metal clues are CORRECT here (genuinely a metal chair).
// Date post-1945 is RIGHT. But the "evidence shows" narrative is GARBLED (#8, worst
// flavor yet): inverted "1945–1910" and a degenerate "1910–1910 (0 corroborating
// layers)" zero-width zone. ROOT: coil_spring is mis-dated c.1780–1830 (antique
// upholstery coil) and applied to a mid-century STEEL BOUNCE-spring base → sets the
// overall envelope to 1780–1830 on a post-WWII chair (M2 clue-data mis-map). P5
// correctly resolves welded(1910) over coil_spring(1780–1830) so the date holds at
// post-1945, but the stale 1780–1830 envelope drives the broken narrative math.
// M6 phantom upholstery layer ("Upholstery with coil spring construction") on an
// all-metal mesh chair. M8 "Upholstered armchair" (no upholstery). modern_caster n=4
// (foot glides). VALIDATION: fix#4b ("tactile feel of the piece", not "wood") + value
// differentiated UP (Woodard collectible). Mis-keyed door_present / maker_label obs.
const woodard_wrought_iron_patio_chair: ScanFixture = {
  label: "woodard_wrought_iron_patio_chair",
  note: "Woodard wrought-iron patio chair (~1940s–60s); date post-1945 CORRECT but #8 narrative GARBLED (inverted '1945–1910', degenerate '1910–1910 0-layer zone'). Root: coil_spring mis-dated 1780–1830 poisons the envelope on a steel bounce-spring chair. M6 phantom upholstery [T1a: coil_spring layer now suppressed → envelope no longer floored at 1780], M8 'Upholstered'. fix#4b validated.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Expanded metal mesh seat panel visible, rectangular form set within tubular metal frame rails." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Arched expanded metal mesh backrest panel visible, fan/shield shaped, set within curved tubular frame with decorative crest rail." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Chair has two armrests with decorative leaf/floral cast metal appliques set within oval cartouche frames on each arm." },
    { type: "structure", clue: "metal_frame", confidence: 82, description: "Entire structural frame is metal — tubular rod construction forming legs, seat rails, arm supports, and back uprights." },
    { type: "style", clue: "painted_metal_finish", confidence: 52, description: "Entire chair painted in sage/celadon green enamel or paint. Multiple paint layers visible at chip points. Consistent with mid-century outdoor furniture repainting cycles." },
    { type: "style", clue: "floral_leaf_motif", confidence: 52, description: "Decorative flat cast or stamped metal leaf-and-flower motifs applied to crest rail, arm cartouches, and front apron rail. Motifs show leaf veining detail. Consistent with Woodard Chantilly Rose or similar mid-century American garden furniture pattern." },
    { type: "construction", clue: "welded_joint", confidence: 75, description: "Frame intersections at leg-to-rail junctions and stretcher connections appear welded. Paint coverage obscures bead detail but no rivets or bolts visible at structural joints. Consistent with mid-20th century welded steel outdoor furniture." },
    { type: "construction", clue: "swivel_mechanism", confidence: 90, description: "A prominent circular coil spring element is visible beneath the seat frame in multiple images. This is a spring-action or bounce mechanism characteristic of Woodard and similar mid-century spring-base patio chairs, allowing the seat to flex/bounce on the coil." },
    { type: "construction", clue: "expanded_metal_mesh_seat", confidence: 96, description: "Both seat and back panels are expanded metal mesh (diamond-pattern perforated sheet metal), not woven wire. This is a distinct industrial material — expanded steel sheet — common in mid-century American outdoor furniture." },
    { type: "hardware", clue: "modern_caster", confidence: 62, description: "Front legs terminate in small rubber or plastic cap feet/glides visible at ground contact points. Rear legs appear to have similar caps. One cap shows rust bleed-through suggesting metal contact beneath." },
    { type: "condition", clue: "rust_pitting", confidence: 54, description: "Rust breakthrough visible at multiple joint areas, leg feet, and where paint has chipped. Orange-brown rust staining visible at seat frame corners and foot caps. Indicates outdoor exposure over extended period." },
    { type: "condition", clue: "paint_loss_chipping", confidence: 54, description: "Paint chipping visible at crest rail, arm joints, seat frame corners, and decorative applique attachment points. Multiple paint layers visible at chip edges suggesting the chair has been repainted at least once." },
    { type: "style", clue: "victorian_garden_furniture_influence", confidence: 52, description: "Overall aesthetic combines Victorian-influenced floral/leaf ornament with mid-century American outdoor furniture construction. Arched shield-back form, scrolled crest, and leaf appliques are characteristic of Woodard, Salterini, or Russell Woodard-era American wrought iron garden furniture c. 1940s-1960s." },
    { type: "construction", clue: "spring_base_mechanism", confidence: 92, description: "Circular coil spring visible beneath seat in side and underside views. This spring connects the seat frame to the leg base, providing a bounce/spring action. This is a defining construction feature of Woodard and similar mid-century spring-action patio chairs." },
    { type: "style", clue: "crest_rail_ornament", confidence: 52, description: "Crest rail features a central flower/rose motif flanked by scrolling leaf-and-vine branches extending to the outer frame. Motifs are flat stamped or cast metal elements welded or attached to the frame. Consistent with Woodard Chantilly Rose or Salterini rose pattern." },
    { type: "form", clue: "secondary_surface", confidence: 68, description: "No secondary surface (table, shelf, or writing surface) present. This is a standalone armchair." },
    { type: "construction", clue: "tubular_steel", confidence: 90, description: "Frame members are round-section tubular or solid rod metal, consistent with tubular steel or wrought iron rod construction used in mid-century American outdoor furniture." },
    { type: "condition", clue: "joint_corrosion", confidence: 54, description: "Corrosion concentrated at welded joint areas and where paint has failed, particularly at seat frame corners and leg-to-rail junctions. Consistent with galvanic or crevice corrosion at paint-failed metal joints." },
    { type: "style", clue: "arm_cartouche_oval", confidence: 52, description: "Each armrest features an oval cartouche frame enclosing a flat leaf-and-branch decorative applique. This oval arm panel is a characteristic design element of Woodard and similar mid-century wrought iron garden furniture lines." },
    { type: "construction", clue: "arc_welded_joint", confidence: 45, description: "At visible joint areas (seat frame corners, stretcher connections), the joining method appears to be welded rather than riveted or bolted. Paint obscures bead detail but no rivet heads or bolt hardware visible. Arc or MIG welding consistent with mid-20th century production." },
    { type: "condition", clue: "refinished_surface", confidence: 54, description: "Multiple paint layers visible at chip points on crest rail and arm joints, suggesting the chair has been repainted at least once over its original finish. Current color is sage/celadon green." },
    { type: "form", clue: "multiple_chairs_present", confidence: 68, description: "Side and wider views show at least two additional matching chairs in the background, indicating this is part of a set. A table may also be partially visible." },
    { type: "construction", clue: "door_present", confidence: 50, description: "mid-century American outdoor furniture style" },
    { type: "label", clue: "maker_label", confidence: 50, description: "cast or stamped flat decorative leaf/flower appliques" },
    { type: "upholstery", clue: "coil_spring", confidence: 50, description: "coil spring base element visible under seat" },
    { type: "materials", clue: "molded_plastic", confidence: 50, description: "rubber or plastic feet caps on front legs" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
  ],
  asSeen: {
    formId: "Upholstered armchair",
    display: "Upholstered armchair (also commonly called: Arm chair, Easy chair)",
    finalStyleKind: "context_only",
    dateRange: "post-1945",
    dateFloor: 1945,
    dateCeiling: null,
    confidence: "Moderate",
  },
};

// Barley-twist rush-seat rocking armchair (Jacobean/Arts & Crafts revival idiom).
// Form correct (Rocking chair). Date c.1890–1920 is plausibly right (barley-twist
// rush rocker = turn-of-century revival), but it's the fix#1 SECOND-PATH (6122
// vernacular rule) MASKED-CORRECT — a GUARD that an eventual second-path fix must NOT
// break (companion to the oak chest, via the vernacular rule rather than the placeholder).
// M6/M7 phantom upholstery on a RUSH seat (n=3, = S008/S012): jute_webbing ("No webbing
// visible", negation) + no_spring_seat ("no spring/no padding", negation) +
// fully_upholstered (conf 74, false) → "Upholstery with no-spring stuffed seat" layer +
// "Upholstered seating/armchair" alt-forms. Candidate: suppress these when rush_seat_weave
// present. M5: style Unresolved despite barley-twist/finials revival vocabulary.
const barley_twist_rush_seat_rocker: ScanFixture = {
  label: "barley_twist_rush_seat_rocker",
  note: "Barley-twist rush rocker; fix#1 second-path (6122) MASKED-CORRECT (~1890–1920 plausible) — guard. M6/M7 phantom upholstery on a rush seat (n=3, jute_webbing/no_spring_seat negations + fully_upholstered FP → 'no-spring stuffed seat') [T1a: now suppressed]. Form correct; style Unresolved (M5).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Rush-woven seat panel visible spanning the seat frame rails; trapezoidal seat typical of armchair rockers." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Rush-woven back panel spanning between two upper horizontal rails, framed by barley-twist back posts with finials." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Flat paddle-shaped arm rests visible on both sides, supported by barley-twist arm posts; chair is an armchair rocker." },
    { type: "style", clue: "barley_twist", confidence: 52, description: "Prominent barley-twist (spiral rope-twist) turnings visible on back posts, arm supports, and front legs. This is the dominant decorative vocabulary of the chair." },
    { type: "structure", clue: "rocker_blades", confidence: 82, description: "Long curved rocker blades visible at base in side view; chair is a rocking chair. Blades appear to be solid flat-sawn boards." },
    { type: "structure", clue: "finial_posts", confidence: 82, description: "Turned acorn or ball finials visible atop both back posts above the rush back panel." },
    { type: "structure", clue: "round_tenon", confidence: 82, description: "Round tenon joinery visible where stretchers and rungs enter the turned legs and posts; consistent with traditional chair construction." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 82, description: "Joinery closeup shows the rocker blade mortised into the leg base; visible joint line and slight finish separation at the mortise shoulder, consistent with mortise-and-tenon attachment of rocker to leg." },
    { type: "upholstery", clue: "jute_webbing", confidence: 50, description: "No webbing visible; seat support is provided entirely by the woven rush seat panel spanning the frame rails." },
    { type: "upholstery", clue: "no_spring_seat", confidence: 50, description: "Rush-woven seat with no spring construction; seat is a traditional flat rush weave over the frame rails with no upholstery padding or spring support." },
    { type: "materials", clue: "rush_seat_weave", confidence: 84, description: "Tightly woven rush (natural plant fiber, likely bulrush or sea grass) covering both the seat and back panel. Weave pattern shows characteristic four-corner diagonal fill pattern typical of traditional rush seating. Strands appear natural/organic rather than paper fiber." },
    { type: "materials", clue: "solid_wood_construction", confidence: 45, description: "All frame members appear to be solid turned wood; no veneer or laminate visible. Wood appears to be a medium-density hardwood, possibly oak or elm based on color and grain visible at worn areas." },
    { type: "condition", clue: "finish_loss_at_joints", confidence: 54, description: "Joinery closeup shows significant finish and wood loss at the rocker-to-leg joint; red/raw wood exposed, paint or finish flaking. Indicates stress at this joint and age-related wear." },
    { type: "condition", clue: "surface_oxidation_patina", confidence: 54, description: "Overall wood surfaces show aged oxidation and patina; finish appears worn and mellow rather than fresh. Consistent with significant age." },
    { type: "condition", clue: "rush_aged_intact", confidence: 54, description: "Rush weave on both seat and back appears intact and complete with no major breaks or missing strands visible, though darkened with age and use. Rush has aged to a warm amber-brown tone." },
    { type: "condition", clue: "refinished_surface", confidence: 40, description: "Wood surfaces appear to have been stripped or lightly refinished at some point; finish is thin and worn, not original thick shellac. Difficult to confirm from photos; may simply be heavily worn original finish." },
    { type: "style", clue: "turned_stretchers", confidence: 52, description: "Multiple turned stretchers visible connecting legs front-to-back and side-to-side; front stretcher shows bobbin or vase turning. Consistent with traditional chair construction." },
    { type: "style", clue: "flat_paddle_arms", confidence: 52, description: "Flat, slightly curved paddle-shaped arm rests visible; arms are solid flat boards rather than turned or upholstered. Arms attach to barley-twist arm posts." },
    { type: "structure", clue: "rush_back_panel", confidence: 82, description: "Rush-woven back panel spans between two horizontal rails (top and bottom of back) framed by the barley-twist back posts; back panel is rectangular and fully woven." },
    { type: "construction", clue: "rush_weave_pattern_diagonal_fill", confidence: 95, description: "Rush weave shows the classic diagonal-fill four-corner pattern on both seat and back; strands run parallel in groups from each corner meeting at center, creating a characteristic X or chevron pattern. This is traditional hand-woven rush technique." },
    { type: "structure", clue: "rocker_blade_flat_sawn", confidence: 80, description: "Rocker blades appear to be flat-sawn solid wood boards; grain visible on the face of the blade in the joinery closeup. Blades are long and curved." },
    { type: "condition", clue: "joint_stress_cracking", confidence: 54, description: "Visible cracking and finish separation at the rocker-to-leg joint in the joinery closeup; wood appears stressed at this high-load connection point." },
    { type: "style", clue: "back_post_finials", confidence: 52, description: "Turned ball or acorn finials cap both back posts above the rush back panel; finials are clearly visible in front and back views." },
    { type: "construction", clue: "webbing_rail_joinery", confidence: 75, description: "Rush seat wraps around the four seat rails; tack holes or wrap points visible at corners where rush terminates on the rails. Traditional rush attachment method." },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating" },
    { type: "materials", clue: "fully_upholstered", confidence: 74, description: "Upholstered or cushioned surfaces are visible." },
  ],
  asSeen: {
    formId: "Rocking chair",
    display: "Rocking chair",
    finalStyleKind: "unresolved",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

// Biedermeier flame-walnut fall-front secretary. Strong ORIGINAL-period evidence
// (thick hand-cut pre-rotary veneer, woodworm holes, 100yr+ verdigris, porcelain
// 1840–1930, Biedermeier 1815–1860). Form CORRECT (Secretary desk, High). Same
// valuation-critical failure as the W&M escritoire (n=2): output "Biedermeier Revival,
// c.1900–2000" — reconciliation explicitly aligns to the 1900–1920 revival wave "not
// the original period." NEW precise mechanism: a convergence zone DID form at 1800–1920
// (5 layers, includes the original Biedermeier 1815–1860) and is only 120y wide (UNDER
// the 160y cap) — yet P2 output the 1900–2000 PLACEHOLDER instead, because
// refineDatingFromConvergence only overrides p2 when the zone is TIGHTER than p2, and
// the unsupported placeholder (width 100) is "tighter" than the evidence zone (width
// 120). The catch-all blocks the real convergence on a width technicality. Plus the
// fix#1 pre-1850 edge (max real floor 1800 < OPEN_FLOOR_MIN_YEAR 1850 → anchor bails),
// same as the escritoire. M11 dating-convergence cluster, n=2 — the M11 tag now lives
// in this fixture's note (it was comment-only before, so the tally undercounted it).
const biedermeier_flame_walnut_secretary: ScanFixture = {
  label: "biedermeier_flame_walnut_secretary",
  note: "Biedermeier flame-walnut secretary; M11 dating-convergence failure (genuine-period evidence → 'Biedermeier Revival' 1900–2000; n=2 with escritoire). Mechanism: a qualifying 1800–1920 convergence zone (120y, under the cap) is blocked because the unsupported 1900–2000 placeholder is 'tighter' → refineDatingFromConvergence won't override. fix#1 pre-1850 edge again (floor 1800<1850). Form correct.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "drop_front_desk", confidence: 68, description: "The upper section features a large vertical drop-front panel that hinges down to create a horizontal writing surface. The panel is veneered with figured walnut and has a central lock escutcheon with ring pull. When open it reveals an interior fitted with small drawers and a central door." },
    { type: "form", clue: "pigeonholes", confidence: 68, description: "Interior of the drop-front section reveals multiple small drawers arranged in banks on left and right sides flanking a central door/compartment. These function as letter/document storage cubbies typical of secretary desk interiors." },
    { type: "form", clue: "multiple_drawer_case", confidence: 68, description: "The lower case section contains three large full-width drawers with bail pulls and lock escutcheons, stacked vertically below the drop-front writing section." },
    { type: "form", clue: "drawer_present", confidence: 68, description: "Three large exterior drawers in lower case plus approximately 8-10 small interior drawers in the secretary section are visible." },
    { type: "form", clue: "door_present", confidence: 45, description: "A central door is visible in the interior of the secretary section, flanked by small drawers. The door appears to have a small lock or ring pull. When open it reveals a shallow interior compartment." },
    { type: "function", clue: "writing_surface", confidence: 45, description: "The drop-front panel when lowered creates a large flat writing surface. The interior surface of the writing flap shows a lighter secondary wood (possibly pine or fruitwood) with visible wear and insect/worm holes consistent with age." },
    { type: "style", clue: "biedermeier_style_cues", confidence: 52, description: "The piece exhibits strong Biedermeier/Continental Empire design vocabulary: rectilinear form with minimal carved ornament, dramatic figured walnut veneer as primary decorative element, canted/chamfered top corners, rounded cock-bead molding rails, bracket feet with light-colored secondary wood plinth, and restrained proportions. This design influence is consistent with Central European production c. 1815-1850, though domestic American production of similar forms is also possible." },
    { type: "materials", clue: "thick_veneer", confidence: 80, description: "The walnut veneer on drawer fronts, drop-front panel, and case sides appears substantially thick with dramatic flame/crotch figure. The veneer shows the characteristic heavy cut associated with pre-rotary-veneer era production. Visible at edges and wear points." },
    { type: "materials", clue: "flame_figure", confidence: 84, description: "The walnut veneer on all major surfaces displays dramatic flame/crotch figure with swirling cathedral grain patterns. This is a hallmark of high-quality Continental European and American Empire/Biedermeier veneered case furniture." },
    { type: "materials", clue: "plain_sliced_veneer", confidence: 45, description: "The veneer appears to be plain-sliced or book-matched, showing symmetrical flame figure on the large drop-front panel and drawer fronts. The dramatic cathedral grain is consistent with plain-sliced walnut veneer." },
    { type: "hardware", clue: "porcelain_knob", confidence: 62, description: "The small interior drawers in the secretary section are fitted with small round white porcelain knobs. Cream/white ceramic, small diameter, consistent with porcelain knob hardware common 1840-1930." },
    { type: "hardware", clue: "decorative_bail_pull", confidence: 62, description: "The three large exterior drawers are fitted with cast brass bail pulls — swinging curved handles on decorative backplates with scrolled/foliate ornament. The pulls show significant green patination consistent with aged brass." },
    { type: "hardware", clue: "lock_escutcheons", confidence: 45, description: "Each of the three large exterior drawers has a decorative cast brass lock escutcheon centered between the bail pulls. The drop-front panel also has a lock escutcheon with ring pull. The escutcheons show scrolled/rococo ornament and significant patination." },
    { type: "hardware", clue: "stamped_escutcheon", confidence: 62, description: "The escutcheons appear to be cast rather than stamped — three-dimensional scrolled ornament with depth and weight consistent with cast brass rather than thin stamped sheet metal." },
    { type: "hardware", clue: "cast_escutcheon", confidence: 62, description: "The lock escutcheons on the exterior drawers appear cast with scrolled foliate ornament, showing depth and three-dimensional relief consistent with cast brass hardware. Significant green patination throughout." },
    { type: "structure", clue: "bracket_feet", confidence: 45, description: "The case rests on bracket feet visible at the base. The feet appear to be a lighter-colored secondary wood (possibly fruitwood or maple) forming a plinth/base section, consistent with Biedermeier construction where a contrasting lighter wood is used for the base plinth." },
    { type: "construction", clue: "secondary_wood_contrast", confidence: 45, description: "A distinctly lighter-colored secondary wood is visible at the base/plinth area and on the interior writing surface. This contrasting lighter wood against the dark walnut veneer is characteristic of Biedermeier and Continental Empire construction." },
    { type: "condition", clue: "worm_insect_holes", confidence: 54, description: "The interior writing surface shows numerous small dark holes consistent with woodworm/insect damage. This suggests significant age and/or storage in conditions favorable to wood-boring insects." },
    { type: "condition", clue: "shellac_intact", confidence: 54, description: "The exterior surfaces show a warm amber finish with depth and patina consistent with old shellac or spirit varnish. The finish shows age-appropriate wear without the plastic-like build of polyurethane." },
    { type: "condition", clue: "surface_wear_patina", confidence: 54, description: "Significant surface wear and scratches visible on the top, drop-front panel, and case sides. The wear pattern is consistent with long-term use and age. Hardware shows heavy green patination." },
    { type: "style", clue: "chamfered_top_corners", confidence: 52, description: "The top of the case has canted/chamfered corners cut at 45 degrees rather than being square. This is a characteristic Biedermeier and Continental Empire design feature." },
    { type: "style", clue: "rounded_cock_bead_rails", confidence: 52, description: "Rounded half-round molding rails separate the drop-front section from the drawer section. This rounded cock-bead or torus molding is a characteristic Biedermeier/Empire design element." },
    { type: "construction", clue: "interior_open_compartment", confidence: 45, description: "The joinery_closeup image shows the interior central door open, revealing a shallow open compartment. The interior walls appear to be a lighter secondary wood (possibly pine) with visible age darkening and worm holes." },
    { type: "construction", clue: "solid_wood_construction", confidence: 45, description: "The case sides appear to be solid wood rather than veneered plywood. The interior compartment walls show solid wood construction without visible lamination layers." },
    { type: "materials", clue: "walnut_veneer_primary", confidence: 84, description: "Walnut (likely European walnut / Juglans regia) is the primary show wood, applied as veneer on all major exterior surfaces. The figure is dramatic flame/crotch pattern consistent with high-quality walnut veneer selection." },
    { type: "construction", clue: "interior_small_drawers_layout", confidence: 90, description: "The secretary interior has approximately 4-5 small drawers on the left bank and 4-5 small drawers on the right bank, flanking a central door/compartment. All small drawers have porcelain knobs." },
    { type: "hardware", clue: "ring_pull_on_drop_front", confidence: 62, description: "The drop-front panel has a small ring pull integrated with the lock escutcheon at the top center of the panel, used to pull the front down to open." },
    { type: "style", clue: "minimal_carved_ornament", confidence: 52, description: "The case has virtually no carved ornament — decoration is achieved entirely through the figured veneer, molding profiles, and hardware. This restrained approach is characteristic of Biedermeier design philosophy." },
    { type: "condition", clue: "hardware_patination", confidence: 54, description: "The brass bail pulls and escutcheons show heavy green verdigris patination consistent with aged brass that has not been polished. This level of patination is consistent with significant age (likely 100+ years)." },
    { type: "construction", clue: "drop_front_support_lopers", confidence: 45, description: "The drop-front writing surface when open appears to be supported by pull-out lopers (sliding support arms) visible at the sides of the writing surface. This is the standard construction method for drop-front secretary desks." },
  ],
  asSeen: {
    formId: "Secretary desk / drop-front desk",
    display: "Biedermeier Revival Secretary desk / drop-front desk (also commonly called: Secretary desk, Secretary bookcase)",
    finalStyleKind: "revival_wave",
    dateRange: "Broadly late 19th to 20th century",
    dateFloor: 1900,
    dateCeiling: 2000,
    confidence: "Low",
  },
};

// Labeled Phoenix Chair Co. (Sheboygan, WI) Colonial Revival Windsor rocker, "Busy
// since 1875", model No. 962-4½. Form correct (Windsor chair). Date c.1890–1920 (6122
// catch-all) is plausible for a Phoenix Windsor (~1890–1950). KEY: M12 WRONG-ENTITY
// hallucination (n=2, = Lloyd Flanders) — the matcher fabricated THREE wrong marks
// (Phoenix FURNITURE Co. of Grand Rapids 1872–1911 from "Phoenix"; Grand Rapids
// Association triangle; generic cabinetmaker) even though the model EXPLICITLY
// disambiguated "Phoenix Chair Co. … distinct from Phoenix Furniture Co." The
// word-boundary M12 fix can't catch this (real words, wrong entity); the correct maker
// (Phoenix Chair Co.) is absent from the seed DB so the matcher grabbed the nearest
// "Phoenix". All 3 are LOW authority so they didn't anchor the date (mitigation held),
// but they pollute attribution. M9: real maker + "Busy since 1875" founding TPQ not
// surfaced. #10: spurious "Spindle Gallery" style label again (= S001).
const phoenix_chair_co_windsor_rocker: ScanFixture = {
  label: "phoenix_chair_co_windsor_rocker",
  note: "Labeled Phoenix Chair Co. Windsor rocker; M12 wrong-entity (n=2): matcher hallucinated Phoenix FURNITURE Co. + 2 more from 'Phoenix Chair Co.' despite the model disambiguating them — word-boundary fix can't catch (real words/wrong entity); correct maker absent from DB. LOW-authority so date held (c.1890–1920). M9 real-maker/'since 1875' unparsed; #10 'Spindle Gallery' (= S001).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "label", clue: "maker_label", confidence: 85, description: "Paper label affixed to underside of seat reads 'Phoenix Chair Co. / SHEBOYGAN, WISCONSIN / Busy since 1875 / No. 962-4½ / Fin. [handwritten]'. Label is aged, yellowed, and partially translucent but fully legible. This is a high-authority maker identification." },
    { type: "label", clue: "visible_text", confidence: 85, description: "Model or style number handwritten on label as 'No. 962-4½'. A 'Fin.' line follows with partially legible handwritten finish designation. These are production/order identifiers consistent with factory chair labeling practice." },
    { type: "form", clue: "seating_surface", confidence: 68, description: "Solid saddle-shaped plank seat visible from front, side, and underside views. Seat is deeply saddled/carved for comfort, characteristic of Windsor chair construction." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Continuous bent hoop/bow crest rail forming the back and arm rail in one piece, with vertical spindles and a central shaped splat. Classic Windsor bow-back or hoop-back form." },
    { type: "form", clue: "spindle_back", confidence: 45, description: "Multiple turned vertical spindles visible flanking a central decorative splat. Spindles are slender and round-tenoned into the seat and bow rail. Count appears to be approximately 7 spindles plus central splat." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Continuous arm rail sweeps from the bow back down to arm terminals supported by turned arm posts/balusters on each side. Classic Windsor continuous-arm or bow-arm configuration." },
    { type: "style", clue: "windsor_rocker_form", confidence: 52, description: "Chair is a Windsor-style rocking chair with bow/hoop back, saddle seat, turned legs, turned stretchers, and curved rocker runners. Central splat has incised shield/urn/arrow decorative motif consistent with Colonial Revival Windsor production." },
    { type: "style", clue: "central_splat_incised_motif", confidence: 52, description: "Central back splat has a shaped profile with incised decorative lines forming a shield or urn-and-arrow motif. This decorative element is characteristic of late 19th to early 20th century Colonial Revival Windsor production, distinguishing it from plain-spindle Windsor forms." },
    { type: "structure", clue: "round_tenon", confidence: 82, description: "All spindles, arm posts, and legs appear to use round tenon joinery socketed into the seat plank and bow rail, consistent with Windsor chair construction tradition. Visible at leg-to-seat and spindle-to-bow junctions." },
    { type: "structure", clue: "turned_legs", confidence: 82, description: "Four turned legs with vase/baluster turning profiles visible from front and side. Turning is well-defined with multiple coves and swells. Legs terminate into rocker runners." },
    { type: "structure", clue: "stretchers", confidence: 82, description: "Turned H-stretcher or box-stretcher system visible connecting the legs. Front stretcher and side/back stretchers visible. Stretchers are turned with baluster profiles matching the legs." },
    { type: "structure", clue: "rocker_runners", confidence: 82, description: "Curved rocker runners visible from front, side, and back views. Runners are substantial in width and curve gracefully. Ends of runners show wear consistent with use. Runners appear to be attached to the leg bottoms via turned tenon sockets." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "All visible components — seat, bow rail, spindles, legs, stretchers, arm rail, and rockers — appear to be solid wood. No veneer or laminate visible. Seat underside shows solid plank construction with natural wood grain." },
    { type: "materials", clue: "wood_species_likely_maple_or_birch", confidence: 45, description: "Wood appears to be a tight-grained hardwood stained very dark (near-black/dark walnut tone). Grain visible on seat underside shows fine, relatively uniform texture consistent with maple or birch — both common in factory Windsor chair production of the late 19th to mid-20th century. Species cannot be confirmed without closer examination." },
    { type: "finish", clue: "refinished_surface", confidence: 55, description: "The chair is finished in a very dark, near-black stain that is uniform across all surfaces including the seat underside. The darkness and uniformity suggest either a factory-applied dark finish or a later refinish. Some wear through the finish is visible at the rocker ends and seat edges, suggesting the finish has some age." },
    { type: "condition", clue: "wear_at_contact_points", confidence: 54, description: "Visible wear through the dark finish at rocker runner ends, seat edges, and arm terminals. Scratches visible on seat underside. Wear pattern is consistent with genuine use over time rather than artificial distressing." },
    { type: "condition", clue: "paper_label_aged", confidence: 54, description: "Paper label on seat underside is yellowed, aged, and partially translucent with age-related foxing/staining. Label is intact and fully legible. Age of label is consistent with mid-20th century or earlier production." },
    { type: "construction", clue: "saddle_seat_carved", confidence: 96, description: "Seat is a carved saddle/pommel form — deeply shaped with a central ridge and scooped sides — visible from front and side views. This is a defining Windsor chair construction feature requiring hand or machine shaping of a solid plank." },
    { type: "construction", clue: "bent_bow_rail", confidence: 95, description: "The continuous hoop/bow back and arm rail is a single steam-bent or bent-laminated member forming the entire upper perimeter of the chair. Visible from front, side, and back views. No visible joints in the bow rail." },
    { type: "construction", clue: "turned_arm_supports", confidence: 96, description: "Two turned baluster-form arm posts visible on each side, supporting the continuous arm/bow rail. Turning profiles match the leg turnings, suggesting unified factory production." },
    { type: "style", clue: "colonial_revival_windsor", confidence: 52, description: "The combination of bow-back Windsor form, central decorative splat with incised motif, dark stain finish, and factory production by Phoenix Chair Co. of Sheboygan WI is consistent with Colonial Revival Windsor chair production, broadly c. 1890-1950." },
    { type: "label", clue: "maker_geographic_origin", confidence: 85, description: "Label explicitly states 'SHEBOYGAN, WISCONSIN' as the manufacturing location. Phoenix Chair Co. of Sheboygan WI is a documented American chair manufacturer, distinct from Phoenix Furniture Co. of Grand Rapids MI. The 'Busy since 1875' tagline indicates the company's founding or operating date." },
    { type: "form", clue: "rocking_chair_form", confidence: 68, description: "Chair has curved rocker runners attached to the leg bases, definitively identifying this as a rocking chair rather than a static Windsor armchair." },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
    { type: "label", clue: "maker_mark_cabinetmaker_paper_labels_and_inscriptions", confidence: 50, description: "Detected maker mark: Cabinetmaker paper labels and inscriptions (generic). Mark type: paper_label. Dating reference: 1770–1860. Confidence tier: LOW." },
    { type: "label", clue: "maker_mark_grand_rapids_furniture_association_triangle", confidence: 50, description: "Detected maker mark: Grand Rapids Furniture Association triangle mark. Mark type: association_mark. Dating reference: 1900–1940. Confidence tier: LOW." },
    { type: "label", clue: "maker_mark_phoenix_furniture_co", confidence: 60, description: "Detected maker mark: Phoenix Furniture Co.. Mark type: paper_label. Dating reference: 1872–1911. Confidence tier: LOW." },
  ],
  asSeen: {
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Windsor chair",
    display: "Interwar Mass-Market Colonial Windsor chair (also commonly called: Spindle chair, Sack-back chair)",
    styleContext: "Colonial Revival",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

// Rococo Revival / Naturalistic Victorian parlor armchair (carved crest, oval-cartouche
// back, serpentine arms, cabriole legs, walnut, socket casters, jacquard cover). SUCCESS
// / control: output is CORRECT (Upholstered armchair, c.1850–1890, Rococo Revival
// original_period). VALIDATES #6 Phase 1 GENERALIZING to a 2nd piece: no hard
// construction layer dated it, so the consistent "c.1850-1890" style prose
// (carved_crest_rail + rococo_revival_vocabulary) anchored the date — without #6 it
// would have hit the 6122 catch-all (c.1890-1920, too late). Latent: a 1845–1920
// convergence zone formed but didn't override (wider than the 1890-1920 it competed
// with — same relative-width issue as Biedermeier/escritoire); #6 masked it.
// Form genuinely upholstered (T1a correctly NOT fired). M7 caster negations
// (porcelain_caster/modern_caster "not…") correctly dropped.
const rococo_revival_parlor_armchair: ScanFixture = {
  label: "rococo_revival_parlor_armchair",
  note: "Rococo Revival Victorian parlor armchair — SUCCESS/control. Correct: Upholstered armchair, c.1850–1890, Rococo Revival (orig). Validates #6 Phase 1 generalizing (style prose 'c.1850-1890' anchored the date, no construction to date it; without #6 → 6122 catch-all 1890-1920). M7 caster negations dropped; T1a correctly didn't fire (genuinely upholstered).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Fully upholstered seat cushion present, floral tapestry fabric, seat fills the chair frame between the arms." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Shaped oval/cartouche back frame with upholstered back panel insert and carved crest rail above." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Chair has two sweeping curved arms with shaped arm supports connecting to the seat rail; classic parlor armchair form." },
    { type: "style", clue: "carved_crest_rail", confidence: 52, description: "Prominent carved crest rail at top of back featuring scrolling C-curves, acanthus leaf motifs, and a central foliate device — characteristic Rococo Revival / Victorian parlor chair ornament, c. 1850-1890." },
    { type: "style", clue: "cabriole_leg", confidence: 52, description: "Front legs visible in side view show a curved cabriole-style profile, consistent with Rococo Revival and Victorian parlor seating vocabulary." },
    { type: "style", clue: "serpentine_arm", confidence: 52, description: "Arms sweep in a continuous S-curve from the back stile down to the arm pad, a hallmark of Victorian Rococo Revival and late Victorian parlor chair design." },
    { type: "style", clue: "oval_cartouche_back", confidence: 52, description: "Back frame forms a shaped oval/cartouche outline with the carved crest rail cresting above it — a Rococo Revival and Victorian parlor chair signature form." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Frame members appear to be solid hardwood throughout — arms, back stiles, seat rails, and legs all show solid wood profiles with no visible veneer edges or lamination." },
    { type: "materials", clue: "wood_species_walnut_or_mahogany", confidence: 60, description: "Frame wood shows warm reddish-brown to dark brown coloration with fine grain visible at worn areas; consistent with black walnut or mahogany. Walnut slightly more probable given the warm brown tone and grain character." },
    // negated: live P0 caught these as negations ("not porcelain" / "not a modern…
    // caster") and dropped them; un-negated they'd wrongly date the hardware layer
    // post-1900 and block #6 (fidelity convention: encode what the original run did).
    { type: "hardware", clue: "porcelain_caster", confidence: 45, negated: true, description: "Caster visible at front leg base is cast metal (iron or brass-toned), not porcelain. The wheel appears to be a small cast metal roller caster with a socket-type mounting cup, heavily oxidized/patinated." },
    { type: "hardware", clue: "modern_caster", confidence: 45, negated: true, description: "Caster appears to be a period-appropriate cast metal socket caster, not a modern rubber or plastic wheel caster. Heavy oxidation and patina consistent with age. Likely a Victorian-era brass or iron socket caster, c. 1860-1910." },
    { type: "hardware", clue: "period_socket_caster", confidence: 62, description: "Close-up shows a cast metal socket-type caster with a cup that receives the leg tenon; the wheel is a small cast metal roller. This style of socket caster is consistent with Victorian parlor furniture, c. 1860-1910. Heavy surface oxidation and patina support age." },
    { type: "condition", clue: "upholstery_worn_fraying", confidence: 54, description: "Both seat and back upholstery panels show significant wear, fraying at edges, and the back panel appears partially detached from the frame. Fabric is intact but deteriorated." },
    { type: "condition", clue: "wood_damage_arm_end", confidence: 54, description: "Close-up of front leg/arm junction shows significant wood fiber damage and splitting at the arm end near the caster socket — likely from stress, impact, or age-related joint failure." },
    { type: "condition", clue: "shellac_intact", confidence: 45, description: "Frame surfaces show a warm amber-brown finish with age-consistent patina and wear at high-contact areas. Finish appears to be original shellac or early varnish rather than modern polyurethane — no thick plastic film visible." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 50, description: "Seat and back upholstery fabric shows a large-scale multi-color floral pattern with complex repeat. The woven structure with high pattern complexity and machine-loomed appearance is consistent with jacquard upholstery fabric. Could also be classified as brocade; jacquard is the best fit given the machine-loomed regularity of the pattern repeat." },
    { type: "construction", clue: "back_panel_loose", confidence: 85, description: "Back view reveals the back upholstery panel is a separate pad trimmed with black gimp/braid edging, sitting loosely within the back frame rather than being tightly tacked. This is a later or replacement upholstery campaign." },
    { type: "upholstery", clue: "nailhead_trim", confidence: 50, description: "No decorative nailhead trim visible on the upholstery edges; the back panel is edged with black gimp/braid trim instead." },
    { type: "construction", clue: "stretcher_present", confidence: 90, description: "A horizontal stretcher rail is visible connecting the rear legs near the base, providing structural reinforcement — consistent with Victorian parlor chair construction." },
    { type: "structure", clue: "rear_leg_form", confidence: 72, description: "Rear legs visible in back view appear to splay outward and slightly backward in a curved profile, consistent with Victorian parlor chair construction." },
    { type: "style", clue: "rococo_revival_vocabulary", confidence: 52, description: "The combination of carved scrolling crest rail with acanthus motifs, shaped oval back, serpentine arms, and cabriole-influenced legs collectively presents a strong Rococo Revival / Victorian parlor chair vocabulary, c. 1850-1890." },
    { type: "condition", clue: "caster_oxidation", confidence: 54, description: "The cast metal caster shows heavy surface oxidation and darkening consistent with significant age — no bright plating or modern finish visible." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 55, description: "The caster socket close-up reveals the leg end terminates in a turned tenon that seats into the caster cup — consistent with mortise-and-tenon or round-tenon joinery at the leg-to-caster junction. Frame joinery method for arm-to-back and leg-to-rail connections cannot be directly confirmed." },
    { type: "form", clue: "vertical_supports", confidence: 68, description: "Four legs visible: front legs with cabriole-style curve and caster feet; rear legs with splayed profile and caster feet." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "back cushion partially detached" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating" },
  ],
  asSeen: {
    formId: "Upholstered armchair",
    display: "Rococo Revival / Naturalistic Victorian Upholstered armchair (also commonly called: Arm chair, Easy chair)",
    finalStyleKind: "original_period",
    dateRange: "c. 1850–1890",
    dateFloor: 1850,
    dateCeiling: 1890,
    confidence: "Low",
  },
};

const hollywood_regency_cane_wing_chair: ScanFixture = {
  label: "hollywood_regency_cane_wing_chair",
  // Cane-paneled button-tufted wingback chair — Hollywood Regency / transitional
  // traditional, ~1960s–80s. Date c.1900–1980 OK (contains truth); form correct (Wing
  // chair); upholstery dating excellent (button-tufted, c.1955–1980, flagged as later
  // reupholstery via foam_padding). TWO tracked items: (1) M18 keyword style-family
  // mis-attribution (n=3+) — "French Provincial" prose matched ["french","revival",
  // "provincial"] → "Louis XVI / French Neoclassical" → label "French Louis XVI
  // Revival" on a Hollywood Regency chair (mitigated: revival-wave reconciliation kept
  // the date right). (2) cane→wicker overreach — genuine cane panels → "Wicker/rattan
  // furniture" alt-form + wicker limitation on a wood-frame chair. CONTRAST/GUARD: the
  // convergence override WORKED here (P2 adopted the 1900–1980 zone) because real
  // post-1900 layers exist (foam 1930–1960, lacquer 1920–1980) — unlike escritoire/
  // Biedermeier where the placeholder blocked the zone.
  // TAG HISTORY: item (1) was originally filed as M11; split to M18 on 2026-05-27 —
  // M11 is reserved for the dating-convergence late-pull, this is a label-only bug.
  note: "Hollywood Regency cane wing chair (~1960s–80s); date c.1900–1980 OK, form correct, upholstery dating excellent (later reupholstery flagged). M18 keyword/style-family mis-attribution (French Provincial → 'French Louis XVI Revival', n=3+; wrong-LABEL only, date unharmed). cane→wicker overreach. CONTRAST: convergence override WORKED (real post-1900 layers).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 71, description: "Fully upholstered tufted seat cushion visible from front and overhead views; broad padded seat surface." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Tall high-back upholstered backrest with button tufting visible; wingback silhouette with pronounced ear/wing extensions at top." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Chair has wing extensions flanking the high back; classic wingback/porter's chair form with cane-paneled wings and sides." },
    { type: "structure", clue: "cane_panels", confidence: 82, description: "Large woven cane panels fill the wing areas on both sides of the backrest and the lower side panels below the seat rail; cane is machine-woven open-hexagonal pattern (not hand-caned peg-hole style)." },
    { type: "structure", clue: "woven_body", confidence: 82, description: "Cane weave body panels visible on wings and side panels; open hexagonal weave pattern consistent with machine-pressed sheet cane rather than hand-caned individual strands." },
    { type: "structure", clue: "rattan_frame", confidence: 45, description: "Frame is solid wood (appears to be walnut or mahogany stained hardwood), not rattan; cane panels are inset into the wood frame." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Curved serpentine wood frame members visible at wings, seat rail, and legs; dark reddish-brown finish consistent with walnut or mahogany-stained hardwood; smooth molded profile on frame edges." },
    { type: "style", clue: "style_cues", confidence: 58, description: "Combination of high wingback form, cane-paneled wings and sides, curved serpentine frame, and button-tufted upholstery is characteristic of Hollywood Regency / Colonial Revival / transitional traditional style popular c. 1960s-1980s." },
    { type: "structure", clue: "vertical_supports", confidence: 82, description: "Four tapered straight legs visible; front legs appear slightly splayed/tapered; rear legs visible in back view as dark tapered members." },
    { type: "upholstery", clue: "velvet_cover", confidence: 50, description: "Cover fabric shows upright pile with nap-direction shading visible across tufted surfaces; olive/gold-green color with matte pile sheen consistent with cut-pile velvet or chenille velvet. Best-fit classification: velvet_cover (chenille-type velvet)." },
    { type: "upholstery", clue: "button_tufting", confidence: 50, description: "Regular grid of deep tufted dimples visible across both the seat cushion and the back panel; small covered buttons visible at each tuft intersection. Button tufting confirmed on back panel closeup images." },
    { type: "upholstery", clue: "foam_padding", confidence: 50, description: "Seat and back cushions show puffy rounded tufted squares with uniform resilience and rounded edges consistent with polyurethane foam or foam-over-spring construction rather than traditional horsehair or cotton batting alone; cushions retain shape suggesting foam substrate." },
    { type: "condition", clue: "condition_cues", confidence: 57, description: "Upholstery fabric shows significant soiling, staining, and pile crush across seat and back; back exterior panel shows heavy soiling and possible small tear/snag at center. Cane panels appear intact but darkened with age/dirt. Wood frame shows minor scuffs and wear at edges but no major damage visible." },
    { type: "condition", clue: "refinished_surface", confidence: 54, description: "Wood frame finish appears original or lightly maintained; no obvious stripping or modern polyurethane overcoat visible; finish shows age-consistent wear at contact points." },
    { type: "construction", clue: "frame_and_panel_sides", confidence: 92, description: "Wing and side panels are constructed as wood frame members holding inset cane panels; the curved wood stile/rail framework is visible surrounding each cane panel section." },
    { type: "style", clue: "style_cues", confidence: 58, description: "Frame shows pronounced S-curve or serpentine profile on the wing/back stiles visible in side view; curved molded wood frame is a decorative feature associated with French Provincial, Hollywood Regency, and Colonial Revival chair forms." },
    { type: "materials", clue: "lacquer_finish", confidence: 60, description: "Wood frame shows a smooth, hard, uniform dark finish consistent with lacquer or catalyzed finish; no shellac crazing visible; finish appears factory-applied." },
    { type: "construction", clue: "wicker_weave_close", confidence: 85, description: "Cane panels show a close, tight hexagonal weave pattern; the regularity and uniformity of the weave pattern is consistent with machine-pressed sheet cane rather than hand-caned individual strand work." },
    { type: "condition", clue: "wicker_strand_breakage", confidence: 54, description: "Cane panels appear largely intact with no obvious broken or missing strands visible in the available images; cane is darkened but structurally present." },
    { type: "form", clue: "seating_surface", confidence: 48, description: "Seat cushion is a separate tufted pad sitting within the seat frame; appears to be a drop-in or tied cushion rather than fully attached upholstery." },
    { type: "style", clue: "style_cues", confidence: 58, description: "Front legs appear to be straight tapered legs without cabriole curve; rear legs are straight tapered; leg style is consistent with transitional traditional or Colonial Revival chair production c. 1960s-1980s." },
    { type: "condition", clue: "condition_cues", confidence: 57, description: "Back exterior upholstery panel shows heavy soiling, staining, and a small snag or tear at center-back; fabric appears original and unrestored." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstered back exterior" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating" },
    { type: "context", clue: "french_provincial_style", confidence: 48, description: "Frame shows pronounced S-curve or serpentine profile on the wing/back stiles visible in side view; curved molded wood frame is a decorative feature associated with French Provincial, Hollywood Regency, and Colonial Revival chair forms." },
    { type: "style", clue: "cabriole_leg", confidence: 72, description: "Cabriole legs are visible." },
    { type: "form", clue: "wingback_form", confidence: 80, description: "Structural side wings extending forward from upper back indicate wing-chair form. Canonical: form_wing_chair." },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
  ],
  asSeen: {
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Wing chair",
    display: "1980s Glam Revival Wing chair (also commonly called: Wingback chair, Wing-back chair)",
    styleContext: "Hollywood Regency",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1920–1995",
    dateFloor: 1920,
    dateCeiling: 1995,
    confidence: "Moderate",
  },
};

const victorian_barrel_back_parlor_chair: ScanFixture = {
  label: "victorian_barrel_back_parlor_chair",
  // Barrel/tub-back Victorian/Edwardian parlor chair the model read as "approximately
  // 1880–1910" — yet output the LEGACY 1900–2000 placeholder catch-all (disjoint above
  // the 1700–1920 envelope). PROVEN not caused by our fixes: #6 declined (only ONE
  // dated style obs, victorian_edwardian_parlor_chair "1880-1910"; needs ≥2 to anchor),
  // and fix#1 declined (only construction floor is round_tenon post-1700, < the 1850
  // OPEN_FLOOR_MIN_YEAR). This fixture sits in the GAP between the conservative
  // carve-outs and gets the untouched legacy default — the canonical specimen of the
  // placeholder problem we still need to attack head-on (relax #6's ≥2 when a dated
  // style obs exists / lower the pre-1850 floor / convergence). M8-ish: barrel-back
  // parlor chair → "Lounge chair".
  note: "Victorian barrel-back parlor chair (model: ~1880–1910) → LEGACY 1900–2000 placeholder. PROVEN not us: #6 declined (1 dated style obs <2), fix#1 declined (floor 1700 <1850). The canonical gap specimen for the placeholder catch-all we still need to attack head-on. M8: barrel-back → 'Lounge chair'.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Circular upholstered drop-in seat pad visible, round seat frame beneath." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Continuous curved barrel/tub back rail wraps around the sitter, forming a full encircling backrest and arm rest in one piece." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Barrel-back tub chair form with continuous curved crest rail serving as both back and arms; classic Victorian/Edwardian parlor corner or tub armchair." },
    { type: "style", clue: "reeded_crest_rail", confidence: 52, description: "Continuous reeded/fluted decoration carved along the full curved crest rail, a characteristic Victorian and Edwardian decorative motif on parlor seating." },
    { type: "style", clue: "pierced_splat", confidence: 52, description: "Two pierced carved splats visible at left and right sides of the back, each featuring scrolled volute and fan/palmette motifs. Consistent with late Victorian or Edwardian decorative vocabulary." },
    { type: "structure", clue: "turned_center_spindle", confidence: 82, description: "A single turned decorative spindle rises from the seat rail to the crest rail at the center back, with ring-and-vase turning profile visible." },
    { type: "style", clue: "cabriole_leg", confidence: 52, description: "Cabriole-style legs visible at front corners, curving outward at knee and tapering to foot with casters. Consistent with Victorian/Edwardian parlor chair production." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Frame members appear to be solid hardwood throughout — crest rail, splats, legs, and seat rail all show solid wood profiles with no visible veneer edges or laminate layers." },
    { type: "materials", clue: "wood_species_mahogany_group", confidence: 60, description: "Dark reddish-brown wood with fine even texture and smooth planed surfaces visible on frame members. Consistent with mahogany or walnut; mahogany slightly more probable given color and grain character, but walnut cannot be excluded at this resolution." },
    { type: "construction", clue: "steam_bent_or_laminated_crest_rail", confidence: 75, description: "The continuous curved barrel crest rail wraps nearly 270 degrees around the seat. This degree of curvature in a solid wood rail typically indicates steam bending or laminated bent construction. No visible lamination lines at this resolution." },
    { type: "condition", clue: "crest_rail_crack", confidence: 54, description: "A visible crack or split is present at the junction of the crest rail near the center back spindle attachment point. Structural concern." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 50, description: "The seat cover shows a small repeating geometric/diamond pattern with subtle color variation. The regularity of the repeat and the woven texture suggest a machine-loomed jacquard or similar woven fabric. Confidence moderate due to image resolution." },
    { type: "upholstery", clue: "no_spring_seat", confidence: 45, description: "The seat appears to be a drop-in pad or stuffed seat without visible spring crown. The seat profile is relatively flat rather than domed, suggesting stuffed/padded construction without coil springs, though springs beneath burlap cannot be fully excluded." },
    { type: "upholstery", clue: "hand_tacks", confidence: 50, description: "Small tack heads visible along the lower edge of the seat rail where the upholstery fabric is attached to the seat frame. Spacing appears hand-driven rather than stapled." },
    { type: "condition", clue: "upholstery_soiled", confidence: 54, description: "Seat cover fabric is heavily soiled with staining and discoloration across the surface. Fabric also shows fraying at the seat edge where it meets the seat rail." },
    { type: "condition", clue: "finish_wear", confidence: 45, description: "Finish shows wear and minor losses at edges and high-contact areas of the frame, consistent with age-related use wear. Surface appears to retain an older finish (shellac or varnish) rather than a modern polyurethane coating." },
    { type: "style", clue: "victorian_edwardian_parlor_chair", confidence: 52, description: "The combination of barrel/tub back form, reeded crest rail, pierced scrolled splats, cabriole legs, and turned center spindle is consistent with late Victorian or Edwardian parlor seating, approximately 1880-1910." },
    { type: "construction", clue: "round_tenon", confidence: 65, description: "The turned center spindle connects to both the seat rail and crest rail; round tenon joinery is the most probable attachment method for this type of turned spindle in period chair construction." },
    { type: "condition", clue: "dust_cover_torn", confidence: 45, description: "The dust cover or cambric fabric visible beneath the seat frame appears torn or missing in sections." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "fabric fraying at seat edge" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating" },
    { type: "structure", clue: "spindle_back", confidence: 78, description: "Spindles are visible in the back or side rail." },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
    { type: "structure", clue: "barrel_tub_back", confidence: 76, description: "Textual barrel/tub/cylindrical back vocabulary on a seating form indicates barrel-back construction." },
    { type: "upholstery", clue: "dust_cover_cambric_woven", confidence: 70, description: "Dust cover is woven cotton cambric — standard factory upholstery practice across a broad period; not a tight date on its own." },
  ],
  asSeen: {
    formId: "Lounge chair",
    display: "Lounge chair (also commonly called: Easy chair, Club chair)",
    finalStyleKind: "context_only",
    dateRange: "Broadly late 19th to 20th century",
    dateFloor: 1900,
    dateCeiling: 2000,
    confidence: "Low",
  },
};

const eastlake_oak_settee: ScanFixture = {
  label: "eastlake_oak_settee",
  // Eastlake / Modern Gothic oak settee — SUCCESS / control. Everything correct:
  // form Settee (beat lounge_chair_form), style Eastlake (supported, original_period),
  // date c.1870–1890 (convergence zone 1870–1895 ADOPTED). The "convergence-worked"
  // counterpart to the escritoire/Biedermeier disjoint-late failures: succeeds because
  // a real BOUNDED in-era dating layer exists (eastlake_hardware → 1870–1895) to anchor
  // the zone. IRONY worth logging: eastlake_hardware is really a STYLE obs ("Not hardware
  // per se…") mis-keyed to hardware — that mislabel is what gave the bounded anchor;
  // routing it correctly to style (wt 0.37, no date) could REMOVE the anchor. So this is
  // a guard against both convergence regressions AND over-eager style→hardware re-routing.
  note: "Eastlake oak settee — SUCCESS/control. Correct: Settee, Eastlake (orig), c.1870–1890 (convergence 1870–1895 adopted). Convergence-worked because eastlake_hardware gives a bounded in-era anchor (vs escritoire/Biedermeier pre-1850-only). Irony: eastlake_hardware is a mis-keyed STYLE obs whose mislabel supplied the anchor — guard against re-routing it.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Wide upholstered seat accommodating two persons; consistent with settee or loveseat form." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Fully upholstered backrest with carved crest rail above; arched top profile framed by carved oak." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Two open arms with scrolled volute terminals and pierced carved brackets beneath arm rails; settee (two-seat) form with full arms on both sides." },
    { type: "style", clue: "eastlake_hardware", confidence: 52, description: "Overall decorative vocabulary strongly consistent with Eastlake Aesthetic Movement: incised linear carving, fan/feather motifs on crest rail, beaded molding border around back panel, ball finials at crest corners, geometric and stylized plant ornament. Not hardware per se but the carved ornamental language is canonical Eastlake c. 1870-1895." },
    { type: "style", clue: "style_cues", confidence: 52, description: "Fan/feather carved crest rail with ball finials, beaded molding border, scrolled volute arm terminals, pierced carved arm brackets, and saber-style front legs are all characteristic of American Eastlake or Late Victorian parlor seating c. 1875-1900." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Frame members visible at arms, legs, crest rail, and side rails show solid wood construction with visible grain consistent with oak. No veneer or laminate visible on structural members." },
    { type: "materials", clue: "wood_species_oak_group", confidence: 82, description: "Warm honey-amber color, visible open grain pattern on arm rails and leg surfaces, and ray fleck visible on flat-sawn surfaces consistent with oak. Golden Oak era finish tone." },
    { type: "style", clue: "carved_crest_rail", confidence: 52, description: "Crest rail features deeply carved fan/feather or acanthus-leaf motifs with repeating incised vertical elements and ball finials at the corners; highly ornate Eastlake/Late Victorian decorative carving." },
    { type: "construction", clue: "scrolled_side_corbels", confidence: 88, description: "Scrolled volute corbels visible at the lower corners of the backrest where it meets the seat rail; characteristic Victorian parlor seating ornament c. 1870-1900." },
    { type: "construction", clue: "pierced_carved_arm_bracket", confidence: 92, description: "Arm brackets beneath the arm rails are pierced (fretwork/cutout) with scrolled foliate motifs; visible on both side views. Characteristic Eastlake/Late Victorian decorative construction detail." },
    { type: "construction", clue: "beaded_molding_border", confidence: 93, description: "Continuous beaded (rope-bead) molding runs along the inner edge of the backrest frame surrounding the upholstered panel; visible in front and angled closeup views. Characteristic Eastlake decorative molding detail." },
    { type: "hardware", clue: "nailhead_trim", confidence: 62, description: "Continuous row of brass-colored nailheads visible along the perimeter of both the seat and back upholstered panels; nailheads appear individually placed with slight spacing variation consistent with hand-tacked application rather than modern strip nailhead." },
    { type: "upholstery", clue: "velvet_cover", confidence: 50, description: "Cover fabric shows cut-pile velvet characteristics: raised pile surface with blue floral/foliate pattern on cream/tan ground, visible pile direction shading, and soft matte texture consistent with cotton or rayon velvet. Confidence moderate — could be a chenille or jacquard weave with similar appearance." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 45, description: "Alternative classification: the blue floral pattern on cream ground could be a jacquard-woven fabric rather than velvet; the pattern regularity and two-color contrast are consistent with jacquard upholstery. Best-fit classification remains velvet_cover but jacquard_cover is a plausible alternative." },
    { type: "condition", clue: "upholstery_wear", confidence: 54, description: "Seat upholstery shows sagging and distortion at the front edge, with fabric pulling away slightly from the seat rail; visible in side and overhead views. Back upholstery appears in better condition." },
    { type: "condition", clue: "frame_condition", confidence: 54, description: "Wood frame appears structurally sound with no visible breaks, cracks, or major repairs. Finish shows age-consistent patina and slight darkening at wear points on arm rails. No obvious refinishing evidence." },
    { type: "construction", clue: "saber_front_legs", confidence: 80, description: "Front legs show a curved saber or scroll profile rather than straight turned legs; visible in side view. Rear legs appear straight. This leg form is consistent with Late Victorian parlor seating." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 60, description: "Arm rail to back post and seat rail to leg connections appear to use mortise-and-tenon joinery based on the tight shoulder-line fits visible at arm-to-post junctions in closeup views; no visible mechanical fasteners at these joints. Confidence moderate — joinery is hidden by upholstery and finish." },
    { type: "construction", clue: "ball_finials", confidence: 95, description: "Turned ball finials visible at the top corners of the crest rail; characteristic Late Victorian/Eastlake parlor seating ornament." },
    { type: "construction", clue: "back_panel_upholstered_both_sides", confidence: 92, description: "Back view shows the reverse of the back panel is also upholstered with the same fabric and nailhead trim; the back of the settee is finished for display, consistent with parlor/reception room use." },
    { type: "construction", clue: "rear_legs_straight", confidence: 85, description: "Rear legs visible in back view appear straight and square-sectioned, contrasting with the curved front legs; consistent with Late Victorian parlor seating construction." },
    { type: "style", clue: "fan_feather_carving", confidence: 52, description: "Crest rail features repeating carved fan or feather motifs with incised vertical striations and rounded tops; this specific ornamental vocabulary is strongly associated with Eastlake Aesthetic Movement furniture c. 1875-1895." },
    { type: "upholstery", clue: "hand_tacks", confidence: 50, description: "Nailhead spacing along seat and back perimeter shows slight irregularity consistent with individually hand-placed upholstery tacks rather than modern strip nailhead application." },
    { type: "form", clue: "settee_two_seat_form", confidence: 68, description: "Seat width accommodates two persons; backrest spans full width; arms on both sides; consistent with parlor settee or loveseat form rather than single armchair." },
    { type: "construction", clue: "arm_rail_scroll_terminal", confidence: 90, description: "Arm rails terminate at the front in carved scrolled volutes (ram's-head or scroll form); visible in front and side views. Characteristic Late Victorian/Eastlake parlor seating arm treatment." },
    { type: "construction", clue: "seat_rail_carved_apron", confidence: 78, description: "Seat rail below the seat cushion shows carved decorative treatment visible in the angled closeup; consistent with Eastlake incised or relief-carved apron decoration." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstered seat and back" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating_surface" },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
  ],
  asSeen: {
    formId: "Settee",
    display: "Eastlake / Modern Gothic Settee (also commonly called: Settee, Small sofa)",
    finalStyleKind: "original_period",
    dateRange: "c. 1870–1890",
    dateFloor: 1870,
    dateCeiling: 1890,
    confidence: "Moderate",
  },
};

const rococo_renaissance_carved_settee: ScanFixture = {
  label: "rococo_renaissance_carved_settee",
  // Heavily-carved mid-Victorian (~1860–1880) Rococo/Renaissance Revival settee
  // (dragons, grotesque mask, heraldic shield, paw feet). Form correct (Settee), style
  // FAMILY correct (Rococo Revival), but dated c.1920–1925 — ~50yr late. THE CLEAREST
  // M11/revival cluster specimen: two zones formed — 1845–1910 (REAL evidence: finish +
  // upholstery + style + style_wave) and 1920–1925 (style_wave-only revival overlap) —
  // and the convergence PICKER chose the LATER revival-wave zone (higher weighted
  // authority from a synthetic revival-wave intersection / narrower tiebreak), then
  // labeled it a 1920s "French Provincial / Rococo Domestic Revival." Unifies the
  // cluster: escritoire/Biedermeier = revival+placeholder beat a (pre-1850) zone;
  // THIS = revival style_wave-only zone beats a real multi-layer zone. Controls
  // (Eastlake, cane-wing) succeed because real IN-ERA layers win. The head-on fix:
  // real construction/material/finish/upholstery layers must outweigh style_wave/
  // revival zones in both the picker and the placeholder-override.
  note: "Mid-Victorian (~1860–80) carved Rococo/Renaissance settee dated c.1920–1925 (~50yr late). CLEAREST M11/revival case: convergence picker chose a style_wave-only revival zone (1920–1925) OVER the real-evidence zone (1845–1910: finish+upholstery+style). Form/style-family correct; date + revival label wrong. Unifies the cluster; head-on fix = real-evidence layers must outweigh revival style_waves.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Fully upholstered seat cushion visible across the full width of the settee/loveseat form." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Upholstered back panel present, framed by heavily carved crest rail above and scrolled side supports." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Two open arms with scrolled terminals and carved figural arm posts visible on both sides of the seating form; this is a settee or parlor sofa with arms rather than a single armchair." },
    { type: "style", clue: "rococo_revival_ornament", confidence: 52, description: "Heavily carved crest rail with scrolling acanthus leaves, C-scrolls, and figural elements (dragons/griffins, heraldic shield) strongly consistent with Rococo Revival or Renaissance Revival parlor furniture, c. 1845-1880." },
    { type: "style", clue: "renaissance_revival_ornament", confidence: 52, description: "Heraldic shield cartouche in crest rail center, grotesque mask arm terminal, and dragon/griffin figural carvings are characteristic of Renaissance Revival high-style parlor furniture, c. 1860-1880, as well as Rococo Revival. Both style waves are plausible." },
    { type: "style", clue: "cabriole_leg", confidence: 52, description: "Front legs visible in overall_front image show cabriole-style curved form terminating in carved paw feet, consistent with Rococo Revival seating." },
    { type: "style", clue: "paw_feet", confidence: 52, description: "Carved paw feet visible at the base of the front cabriole legs, a characteristic ornamental feature of Rococo Revival and Renaissance Revival parlor seating." },
    { type: "style", clue: "figural_carved_crest", confidence: 52, description: "Crest rail features deeply carved figural elements including what appear to be dragons or griffins flanking a central heraldic cartouche, with scrolling acanthus foliage throughout. High-relief figural carving of this quality is associated with high-style Victorian parlor furniture, c. 1850-1885." },
    { type: "style", clue: "grotesque_mask_arm_terminal", confidence: 52, description: "Arm terminal carved as a full human/classical face (grotesque mask or caryatid bust) with surrounding foliage, visible in overall_side closeup. This is a Renaissance Revival and high Rococo Revival ornamental motif, c. 1855-1880." },
    { type: "style", clue: "dragon_griffin_carving", confidence: 52, description: "Carved creature with open mouth, scaled body, and leonine features visible in joinery_closeup of crest rail — consistent with dragon, griffin, or chimera motif used in Renaissance Revival and high Victorian carved furniture." },
    { type: "style", clue: "heraldic_shield_cartouche", confidence: 52, description: "Central crest rail features a carved heraldic shield or cartouche flanked by scrollwork and figural creatures, consistent with Renaissance Revival heraldic ornament." },
    { type: "materials", clue: "solid_wood_construction", confidence: 45, description: "Frame appears to be solid hardwood throughout — the depth and complexity of the carved relief work on crest rail, arm terminals, and legs is consistent with solid wood carving rather than applied composition ornament. Dark reddish-brown color and finish sheen suggest mahogany or walnut." },
    { type: "materials", clue: "wood_species_mahogany_group", confidence: 60, description: "Deep reddish-brown color with warm undertones and high-polish finish visible on frame is consistent with mahogany (Honduran or Cuban). Walnut is also possible. The color and finish sheen lean toward mahogany. Confidence is moderate as species identification from finish color alone is provisional." },
    { type: "finish", clue: "shellac_intact", confidence: 55, description: "Frame surface shows warm amber-reddish high-gloss finish with deep color saturation consistent with intact shellac or early varnish. No obvious plastic-film buildup or polyurethane pooling visible. Finish appears well-preserved and integrated with the carved surfaces." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 45, description: "Seat and back upholstery shows a repeating floral pattern (daisy/flower sprigs on a textured ground) with high pattern complexity and machine-loomed regularity. The fabric appears to be a jacquard-woven textile in gold/champagne tones. Damask is also possible. Best-fit classification: jacquard_cover." },
    { type: "upholstery", clue: "nailhead_trim", confidence: 50, description: "Continuous row of small brass-colored nailheads visible along the perimeter of the seat, back, and arm upholstery panels. Nailheads appear relatively uniform in spacing and size, consistent with decorative nailhead trim used in Victorian parlor upholstery." },
    { type: "upholstery", clue: "damask_cover", confidence: 45, description: "Alternative classification to jacquard_cover: the fabric could be a damask with a woven floral repeat in a single color family (gold on gold). The ground texture and pattern are consistent with damask weave. Uncertainty between jacquard and damask noted; jacquard selected as primary classification due to pattern complexity." },
    { type: "condition", clue: "upholstery_condition", confidence: 45, description: "Upholstery fabric appears intact with no obvious tears or major staining visible in the photos. Some slight color variation or soiling may be present on the seat surface but overall condition appears good for the age of the piece." },
    { type: "condition", clue: "frame_condition", confidence: 54, description: "Carved wood frame appears intact with no visible breaks, losses, or repairs to the carving. Finish is well-preserved and polished. No obvious structural damage visible." },
    { type: "hardware", clue: "nailhead_trim", confidence: 62, description: "Decorative brass-colored nailhead trim applied along upholstery edges; consistent with Victorian parlor upholstery practice. Spacing appears relatively uniform suggesting possible strip-nailhead application rather than individually hand-driven tacks, but individual placement cannot be ruled out at this resolution." },
    { type: "construction", clue: "carved_solid_frame", confidence: 45, description: "The depth and three-dimensionality of the carved ornament on the crest rail (dragons, scrolls, heraldic shield), arm terminals (grotesque mask), and legs (paw feet) is consistent with solid wood carving rather than applied composition or cast ornament. The carving appears to be integral to the frame members." },
    { type: "style", clue: "scrolled_arm_supports", confidence: 52, description: "Arm supports show scrolled volute form at the arm terminal and scrolled bracket at the junction with the seat rail, consistent with Rococo Revival and Renaissance Revival seating design vocabulary." },
    { type: "style", clue: "acanthus_leaf_carving", confidence: 52, description: "Acanthus leaf and C-scroll ornament visible throughout the crest rail carving, consistent with Rococo Revival and Renaissance Revival decorative vocabulary, c. 1845-1885." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstered seat and back panels" },
    { type: "form", clue: "seating_present", confidence: 50, description: "carved seating" },
  ],
  asSeen: {
    formId: "Settee",
    display: "French Provincial / Rococo Domestic Revival Settee (also commonly called: Settee, Small sofa)",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1920–1925",
    dateFloor: 1920,
    dateCeiling: 1925,
    confidence: "Moderate",
  },
};

const porter_balloon_canopy_chair: ScanFixture = {
  label: "porter_balloon_canopy_chair",
  note:
    "Mahogany Balloon/Porter (canopy) chair — fauteuil de portier — w/ wood-rib " +
    "dome back, individually-upholstered velvet panels, gimp/braid trim, carved " +
    "cabriole legs + scroll feet. M8 + M11/revival cluster. (a) M8 form: the " +
    "definitive `porter_chair_form`/`dome_canopy_back` clues lose to generic " +
    "`armchair_form`(0.93)/`seating_surface`(0.85)/`lounge_chair_form`(0.78) → " +
    "P3 picks form_lounge_chair (\"Lounge chair\"); porter chair never surfaces, " +
    "even in alternatives. (b) Date driven by the M11/revival cluster, NOT the " +
    "frame: the only convergence zones are 1920–1930 (style_wave-only, 2 layers) " +
    "and 1920–1970 (finish + LATER REUPHOLSTERY velvet/foam + style_wave). The " +
    "velvet_cover/foam_padding upholstery is flagged itself as a c.1955–1980 " +
    "reupholstery (originality cannot be inferred) yet still floors the frame " +
    "date; revival style_waves anchor 1920–1930. Result \"French Louis XVI " +
    "Revival Lounge chair, c.1920–1930\". User's read: a high-construction porter " +
    "chair with individually-upholstered panels is clearly NOT a reproduction → " +
    "genuine period piece, short window; the engine missed it. Same root as the " +
    "carved-settee / Biedermeier / china-cabinet revival-wave-beats-real-evidence " +
    "and reupholstery-confounds-frame-date cluster. No in-era construction layer " +
    "(joinery/fastener/toolmark all empty) so nothing anchors an early date.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Fully upholstered seat cushion visible on front view; loose seat cushion with velvet cover present." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Tall dome-shaped canopy back (porter's chair / fauteuil de portier form) with wood rib framework dividing upholstered panels; back rises well above seated occupant's head." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Open armrests with carved wood arm supports and upholstered arm pads visible on both front and side views." },
    { type: "form", clue: "dome_canopy_back", confidence: 68, description: "Distinctive balloon/dome-shaped canopy back characteristic of a porter's chair (fauteuil de portier); wood ribs radiate from crest to form segmented dome structure upholstered in velvet panels." },
    { type: "style", clue: "cabriole_leg", confidence: 52, description: "Four cabriole legs visible with carved knees and scroll/pad feet; consistent with Louis XV / Rococo Revival style vocabulary." },
    { type: "style", clue: "shell_crest_carving", confidence: 52, description: "Carved shell (coquille) motif at the apex of the dome crest rail, a hallmark of Louis XV Rococo vocabulary." },
    { type: "style", clue: "rococo_revival_style_cues", confidence: 52, description: "Combination of cabriole legs, carved shell crest, serpentine apron, acanthus-carved arm supports, and scrolled arm terminals all consistent with Louis XV / Rococo Revival design influence. Domestic American or European commercial production of this look is equally plausible; no country of origin can be confirmed from form alone." },
    { type: "style", clue: "carved_serpentine_apron", confidence: 52, description: "Shaped/serpentine front apron rail with carved floral or foliate detail visible at center; consistent with Louis XV-influenced frame construction." },
    { type: "construction", clue: "wood_rib_dome_framework", confidence: 96, description: "Dome canopy back constructed with multiple curved wood ribs radiating from crest, creating segmented bays filled with upholstered velvet panels; ribs trimmed with braid/gimp. Visible on front, back, and joinery closeup images." },
    { type: "construction", clue: "solid_wood_construction", confidence: 88, description: "Frame members including legs, arm supports, apron, and dome ribs appear to be solid wood (likely mahogany or mahogany-stained hardwood) based on visible grain, carving depth, and finish behavior." },
    { type: "materials", clue: "wood_species_mahogany_group", confidence: 65, description: "Frame wood shows warm reddish-brown color with high-gloss finish consistent with mahogany or mahogany-stained hardwood; carving depth and surface sheen support this identification provisionally. Could also be walnut or stained beech/birch." },
    { type: "upholstery", clue: "velvet_cover", confidence: 50, description: "All upholstered surfaces — seat, interior back panels, exterior back panels, arm pads, and loose lumbar pillow — covered in a smooth pile velvet fabric. Front interior appears black/very dark; back exterior appears deep navy/midnight blue. Nap-direction shading and pile sheen visible confirming velvet classification. Likely synthetic or cotton velvet given the context; rayon or polyester velvet consistent with mid-to-late 20th century or contemporary production." },
    { type: "upholstery", clue: "no_spring_seat", confidence: 45, description: "Seat cushion appears to be a drop-in or loose cushion with relatively flat profile; no visible coil spring crown or serpentine spring evidence. Likely foam-padded loose cushion construction." },
    { type: "upholstery", clue: "foam_padding", confidence: 50, description: "Seat cushion has uniform flat profile consistent with foam padding rather than traditional spring-and-stuffing construction; consistent with mid-to-late 20th century or contemporary upholstery." },
    { type: "upholstery", clue: "gimp_braid_trim", confidence: 45, description: "Decorative braid/gimp trim applied along all wood rib edges on both interior and exterior dome surfaces; trim appears to be a matching dark navy/black color. Visible on front, back, and side images." },
    { type: "condition", clue: "velvet_wear_scuffing", confidence: 54, description: "Exterior back velvet panels show visible scuff marks, directional pile disturbance, and surface soiling — particularly in the lower back panels. Interior seat also shows dust/lint accumulation." },
    { type: "condition", clue: "frame_finish_intact", confidence: 54, description: "Wood frame finish appears largely intact with high gloss; minor wear visible at arm support edges and apron corners. No significant finish loss or crazing observed." },
    { type: "condition", clue: "upholstery_edge_wear", confidence: 54, description: "Side view shows slight fraying or wear at the outer edge of the dome canopy where upholstery meets the frame; braid trim shows minor separation at one point on the side." },
    { type: "finish", clue: "lacquer_finish", confidence: 55, description: "Frame surfaces show a hard, high-gloss finish with uniform sheen across all carved and flat surfaces; behavior more consistent with lacquer or polyurethane than shellac. No crazing or amber patina typical of aged shellac observed." },
    { type: "hardware", clue: "no_visible_hardware", confidence: 45, description: "No pulls, locks, casters, or other hardware visible on this seating form. Arm pad appears to have a small upholstered button at the front scroll terminal." },
    { type: "construction", clue: "carved_arm_support", confidence: 94, description: "Arm supports are carved solid wood with acanthus-leaf or egg-and-dart style carved detail at the top; scrolled arm terminal at front. Visible in joinery closeup." },
    { type: "construction", clue: "scroll_foot", confidence: 90, description: "Cabriole legs terminate in small scroll or pad feet; visible on front and side views. No casters present." },
    { type: "style", clue: "porter_chair_form", confidence: 52, description: "Overall form is a classic porter's chair (fauteuil de portier / balloon-back hall chair): tall dome canopy back with wood rib framework, open arms, cabriole legs, and serpentine apron. This form originated in 18th-century France and England and has been widely reproduced through the 19th, 20th, and 21st centuries." },
    { type: "upholstery", clue: "loose_lumbar_pillow", confidence: 50, description: "Small loose lumbar/accent pillow in matching black velvet visible resting against the interior back of the chair." },
    { type: "construction", clue: "upholstered_panel_segments", confidence: 96, description: "Both interior and exterior dome surfaces divided into discrete upholstered panel segments by the wood rib framework; each panel independently upholstered and trimmed with braid. This segmented panel construction is characteristic of the porter's chair form." },
    { type: "context", clue: "french_provincial_style", confidence: 48, description: "Louis XV / Rococo Revival" },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstered panels between ribs" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
  ],
  asSeen: {
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Lounge chair",
    display: "French Provincial / Rococo Domestic Revival Lounge chair (also commonly called: Easy chair, Club chair)",
    styleContext: "Rococo Revival / Naturalistic Victorian",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1920–1980",
    dateFloor: 1920,
    dateCeiling: 1980,
    confidence: "Low",
  },
};

const renaissance_revival_tufted_armchair: ScanFixture = {
  label: "renaissance_revival_tufted_armchair",
  note:
    "Terracotta button-tufted barrel-back Victorian parlor ARMCHAIR (Renaissance " +
    "Revival, ~1865-1885) misidentified as a 'Renaissance Revival Parlor TABLE'. " +
    "M14 (new mechanism): style-prefix form-ID text bleed. scoreForms builds its " +
    "match haystack from clue+description text; the parlor-table block " +
    "(engine.ts ~4228-4233) matches bare style-prefixes with NO table noun — " +
    "'renaissance revival parlor', 'rococo revival parlor', 'golden oak parlor'. " +
    "The shaped_apron_carved observation says '...consistent with Renaissance " +
    "Revival parlor chair construction', whose substring 'renaissance revival " +
    "parlor' fires add('Parlor table', 90). That 90 beats the genuine seating " +
    "forms — Lounge chair (86: lounge_chair_form+armchair_form) and Upholstered " +
    "armchair (62) — taking the primary slot by 4 points, even though all 31 " +
    "clues and all 3 alternative forms are seating. INTERMITTENT: only fires when " +
    "perception writes '<style> revival parlor' adjacently; sibling parlor " +
    "fixtures phrase it differently and ID correctly. Blast radius: any Victorian " +
    "SEATING piece whose prose says '<style> Revival parlor ...'. The 3 " +
    "bare-prefix triggers are redundant — a real parlor table's prose already " +
    "contains 'parlor table' (first list entry). Candidate fixes: (a) require the " +
    "table noun in the trigger; (b) guard all table forms when strong seating " +
    "clues are present and no table clue is. asSeen records the PRODUCTION (main) " +
    "outcome: c.1850-1920 / original_period, frame conf Low (the 'Moderate' the " +
    "user saw is the separate P1 display cap) — a reasonable read for a ~1865-1885 " +
    "piece. DATING (resolved — NOT an engine regression): the earlier fidelity ✗ " +
    "was a fixture-faithfulness artifact. The modern_caster obs self-negates ('no " +
    "modern caster evidence visible'); a real scan's p0 sets negated:true " +
    "(descriptionNegatesClue matches 'no modern caster' / 'rather than modern'), " +
    "excluding it from weighted_clues. The corpus harness STUBS p0, so that flag " +
    "was missing — modern_caster's post-1900 envelope then drove the hardware " +
    "layer to a 1900 floor, which the evidence-floor anchor latched onto → " +
    "c.1900-1920 / late_period. With negated:true now set on the obs (as a real " +
    "scan produces), the branch reproduces main EXACTLY: c.1850-1920 / " +
    "original_period. The 1960-1990 style_wave exists but was not the binding " +
    "constraint. SYSTEMIC NOTE: the harness skips p0 negation normalization for " +
    "stubbed fixtures — fixtures must carry `negated` explicitly (or the harness " +
    "should apply descriptionNegatesClue); tracked as a corpus-infra follow-up.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Large rounded upholstered seat cushion visible; chair has a full seating surface." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Tall upholstered barrel/tub-style back with button tufting and carved crest rail above." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Chair has fully developed arms with carved scroll supports and turned finials at arm terminals; classic Victorian parlor armchair form." },
    { type: "style", clue: "renaissance_revival_crest", confidence: 52, description: "Pierced carved crest rail with central cartouche/shield motif flanked by scrolled volutes and a fan/shell element above; characteristic Renaissance Revival ornament, c. 1860–1885." },
    { type: "style", clue: "scrolled_side_corbels", confidence: 52, description: "Scrolled volute corbels visible on the back stiles flanking the crest rail; Victorian parlor chair ornament consistent with Renaissance Revival / Rococo Revival transition, c. 1860–1885." },
    { type: "style", clue: "incised_scroll_decoration", confidence: 52, description: "Incised scroll and volute decoration visible on arm supports and lower back stile area; characteristic of Renaissance Revival and Eastlake-adjacent Victorian carving vocabulary." },
    { type: "style", clue: "turned_arm_finials", confidence: 52, description: "Turned wooden finials at the front of each arm terminal; pyramid/cone-shaped turning visible; common Victorian parlor chair detail c. 1860–1890." },
    { type: "style", clue: "barrel_back_form", confidence: 52, description: "Chair back is curved/barrel-shaped in plan view, wrapping around the sitter; visible clearly in back and side views; common in Victorian parlor seating c. 1860–1890." },
    { type: "style", clue: "shaped_apron_carved", confidence: 52, description: "Front seat rail has a shaped/scalloped apron with carved cartouche element at center; consistent with Renaissance Revival parlor chair construction." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Frame members visible at crest rail, stiles, arm supports, legs, and apron appear to be solid wood throughout; no veneer or laminate visible on structural members." },
    { type: "materials", clue: "walnut_probable", confidence: 72, description: "Frame wood is dark brown with warm undertones and fine grain visible at carved surfaces; consistent with black walnut, the dominant Victorian parlor chair wood c. 1860–1890. Could also be stained mahogany or cherry but walnut is most probable given color and grain." },
    { type: "hardware", clue: "porcelain_caster", confidence: 62, description: "Small casters visible on front legs; appear to be small wheel casters with brass/metal housing; at this scale difficult to confirm porcelain vs. early rubber, but the small size and period context suggest porcelain or early brass-cup casters consistent with Victorian parlor furniture c. 1840–1910." },
    { type: "hardware", clue: "modern_caster", confidence: 60, negated: true, description: "Casters appear to be period-appropriate small wheel type rather than modern rubber or plastic casters; no modern caster evidence visible." },
    { type: "construction", clue: "turned_front_legs", confidence: 90, description: "Front legs are turned with ring/reel turnings visible; consistent with Victorian parlor chair construction c. 1860–1890." },
    { type: "construction", clue: "saber_rear_legs", confidence: 88, description: "Rear legs are curved/saber-style, splaying outward and backward; visible in side and back views; common in Victorian parlor seating." },
    { type: "condition", clue: "wood_cracking_apron", confidence: 45, description: "Significant wood cracking and checking visible on the front seat apron/rail; wood appears to have split along grain lines, consistent with age-related drying and stress; supports genuine age rather than reproduction." },
    { type: "condition", clue: "finish_darkened_aged", confidence: 45, description: "Wood finish is deeply darkened with age patina; surface appears to have original or early shellac/varnish finish that has oxidized and darkened over decades; no evidence of modern polyurethane coating." },
    { type: "condition", clue: "shellac_intact", confidence: 54, description: "Frame surfaces show warm amber-brown aged finish consistent with intact original shellac or early varnish; no plastic-like polyurethane sheen visible; finish appears integrated with age wear." },
    { type: "upholstery", clue: "velvet_cover", confidence: 50, description: "Cover fabric shows upright pile with nap-direction shading visible across the seat, back, and arms; the terracotta/dusty rose color and pile texture are consistent with cotton or rayon velvet; some areas show pile compression and wear consistent with age. Could be a chenille-weave fabric rather than true cut-pile velvet — the texture appears slightly looped/chenille-like in close-up views — but velvet_cover is the best-fit classification. Confidence moderate." },
    { type: "upholstery", clue: "button_tufting", confidence: 50, description: "Regular grid of deep tufted dimples visible across the back upholstery; dimples appear to be held by covered buttons (small round protrusions visible at each dimple center); classic Victorian button tufting pattern." },
    { type: "upholstery", clue: "gimp_trim_border", confidence: 50, description: "Decorative gimp/braid trim visible along all upholstery edges on back, seat, and arms; Greek-key or scroll pattern gimp in matching terracotta color; consistent with Victorian parlor upholstery finishing practice." },
    { type: "upholstery", clue: "upholstery_wear", confidence: 50, description: "Upholstery shows soiling, pile compression, and fraying at edges; consistent with age and use; some areas of gimp trim appear loose or frayed." },
    { type: "style", clue: "victorian_parlor_chair", confidence: 52, description: "Overall form, ornament vocabulary (pierced crest, scrolled volutes, incised carving, turned finials, barrel back, button tufting, gimp trim, casters) is consistent with American Victorian parlor armchair production c. 1865–1885, most likely Renaissance Revival style." },
    { type: "construction", clue: "carved_pierced_crest_rail", confidence: 88, description: "Crest rail features pierced/fretwork carving with central cartouche, flanking scrolls, and fan/shell element; carving appears hand-finished with some tool mark variation visible; consistent with Victorian factory-assisted hand carving c. 1865–1885." },
    { type: "construction", clue: "round_tenon", confidence: 45, description: "Arm support construction and back stile connections suggest mortise-and-tenon or round tenon joinery typical of Victorian chair frame construction; joints not directly visible but implied by structural integrity and period construction norms." },
    { type: "condition", clue: "upholstery_likely_replaced", confidence: 45, description: "The current velvet/chenille cover in terracotta color with matching gimp trim appears to be a reupholstery campaign rather than original Victorian fabric; the fabric and trim style are consistent with mid-to-late 20th century reupholstery work, though the frame is clearly Victorian period." },
    { type: "style", clue: "tufted_upholstery", confidence: 50, description: "button tufted back" },
    { type: "form", clue: "seating_present", confidence: 50, description: "upholstered seating" },
    { type: "materials", clue: "fully_upholstered", confidence: 74, description: "Upholstered or cushioned surfaces are visible." },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
    { type: "structure", clue: "barrel_tub_back", confidence: 76, description: "Textual barrel/tub/cylindrical back vocabulary on a seating form indicates barrel-back construction." },
  ],
  asSeen: {
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Parlor table",
    display: "Rococo to Renaissance Revival Transition Parlor table (also commonly called: Parlor table, Parlour table)",
    styleContext: "Rococo Revival / Naturalistic Victorian",
    finalStyleKind: "named_transitional",
    dateRange: "c. 1850–1920",
    dateFloor: 1850,
    dateCeiling: 1920,
    confidence: "Low",
  },
};

const victorian_platform_rocker_armchair: ScanFixture = {
  label: "victorian_platform_rocker_armchair",
  note:
    "Green-upholstered Victorian platform-rocker ARMCHAIR (swept-wing back, " +
    "scrolled open arm brackets, reeded legs, claw feet; ~1875-1899). Form and " +
    "date both land ~right (form_armchair; c.1875-1899) but for the WRONG reasons. " +
    "M13 (new mechanism): an intrinsically-datable construction clue carries no " +
    "date envelope, so the tightest signal is sidelined and confidence is " +
    "under-credited. platform_rocker_mechanism is the highest-signal observation " +
    "(conf 95, type construction) and its own prose says the mechanism was " +
    "'patented and popularized in the 1870s-1890s' — a tight construction date " +
    "band. But P4 weights it 0.580 with NO date annotation, and the Dating overlap " +
    "shows construction joinery/fastener/toolmark all '0 contributing clues' -> " +
    "Convergence zones: none. The date is instead reconstructed from the WEAKEST " +
    "classes: style attribution (1810-1850, the original Empire period — wrong " +
    "band), the 1860-1935 style_waves, and a broad cover-only upholstery signal, " +
    "landing c.1875-1899 at Low frame confidence with zero convergence. Root " +
    "cause: platform_rocker is wired only as a FORM keyword (engine.ts ~4961, the " +
    "'Rocking chair' alternative); there is no construction-clue -> date-band " +
    "mapping for platform_rocker_mechanism. This is the INVERSE of the " +
    "revival-late-pull cluster (escritoire/settee): there a weak revival signal " +
    "wrongly DOMINATES and pulls late; here a strong construction signal wrongly " +
    "contributes NOTHING. A confidence-calibration defect, not a date-accuracy " +
    "one. Candidate fix: give patent-era mechanism clues (platform_rocker_" +
    "mechanism, etc.) a construction date envelope (~1870-1895) so they anchor " +
    "dating and form a real convergence (construction + style_wave + upholstery), " +
    "tightening the range and lifting the confidence cap. Secondary: spindle_back " +
    "(78) and spindle_gallery (70) read like perception false-positives on a " +
    "fully-upholstered platform rocker (no spindle structure; nothing else " +
    "corroborates) — undated so harmless to the date, but they pollute the form " +
    "alternatives.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Fully upholstered seat cushion present, integrated into the chair frame with no separate loose cushion." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Tall upholstered backrest with swept-back wing-like upper sides, fully upholstered front and back surfaces." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Chair has open wooden arms with scrolled volute bracket supports connecting arm rail to seat rail on both sides." },
    { type: "form", clue: "platform_rocker_base", confidence: 68, description: "Chair sits on a platform rocker base — a flat sled-like lower platform with curved legs ending in claw feet, connected to the upper chair frame via a rocking mechanism. This is the defining platform rocker form, distinct from a standard rocking chair with curved runners." },
    { type: "style", clue: "scrolled_volute_arm_bracket", confidence: 52, description: "Open scrolled volute (C-scroll or S-scroll) carved bracket visible on both arm supports, connecting the arm rail to the seat rail. This is a characteristic Victorian-era decorative element seen on platform rockers and parlor chairs c. 1870–1900." },
    { type: "style", clue: "claw_foot", confidence: 52, description: "Carved claw-and-ball or paw feet visible on all four legs of the platform base. Feet appear to be carved wooden paw/claw forms, consistent with Victorian parlor furniture c. 1860–1900." },
    { type: "style", clue: "reeded_leg", confidence: 52, description: "Front legs of the platform base show vertical reeding (parallel carved channels) on the leg shaft above the claw foot, consistent with Empire Revival and late Victorian decorative vocabulary." },
    { type: "style", clue: "swept_wing_back", confidence: 52, description: "The upper backrest has swept outward wing-like extensions at the top corners, giving a wingback silhouette. The back curves gracefully from a wide top to a narrower lower section." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Frame members including arms, back stiles, seat rail, and platform base appear to be solid wood throughout — no veneer or laminate visible at any exposed edge or wear point." },
    { type: "materials", clue: "wood_species_mahogany_group", confidence: 60, description: "Frame wood shows deep reddish-brown color with warm undertones and fine grain visible at worn areas. Consistent with mahogany or walnut; the reddish-brown tone and fine texture lean toward mahogany. Could also be walnut stained darker. Moderate confidence given photo lighting." },
    { type: "materials", clue: "wood_species_walnut_group", confidence: 45, description: "Frame wood could alternatively be black walnut — the deep brown with warm reddish tones is consistent with walnut. Cannot definitively distinguish from mahogany without closer inspection of grain pore structure." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 50, description: "The green upholstery fabric shows a repeating small-scale leaf/vine pattern woven into the fabric surface. The pattern has high complexity with tonal variation (darker green pattern on lighter green ground), consistent with a jacquard-woven fabric. The pattern repeats with machine regularity. Could potentially be a damask (same-color reversible weave) but the leaf motif and tonal contrast suggest jacquard. Classified as jacquard_cover; damask_cover is the close alternative." },
    { type: "upholstery", clue: "damask_cover", confidence: 50, description: "The green fabric could alternatively be a damask — single-color woven figured fabric with reversible pattern. The tonal leaf pattern is consistent with damask weave. Cannot definitively distinguish jacquard from damask without examining the reverse side. Jacquard_cover is the primary classification." },
    { type: "upholstery", clue: "button_tufting", confidence: 50, description: "No button tufting visible on seat or back surfaces. The upholstery is smooth and flat without dimples or buttons." },
    { type: "upholstery", clue: "no_spring_seat", confidence: 45, description: "The seat appears relatively flat without the crowned dome profile typical of hand-tied coil springs. However, the upholstery is intact and the seat construction cannot be confirmed without removing the cover. Classified as possible no-spring or drop-in unit seat." },
    { type: "upholstery", clue: "refinished_upholstery", confidence: 50, description: "The green jacquard/damask fabric appears relatively clean and unworn compared to the aged wooden frame with visible scratches and finish wear. The fabric shows no significant soiling, fading, or period-consistent wear. This strongly suggests the chair has been reupholstered at some point after original manufacture, likely within the last few decades." },
    { type: "condition", clue: "frame_wear", confidence: 54, description: "Visible scratches, scuffs, and finish wear on the arm surfaces, seat rail, and platform base. Wear patterns are consistent with age and use. Some areas show lighter wood color beneath the finish at high-contact points." },
    { type: "condition", clue: "upholstery_debris", confidence: 54, description: "Lint, dust, and small debris particles visible on the upholstered seat and arm areas, consistent with normal use." },
    { type: "construction", clue: "platform_rocker_mechanism", confidence: 95, description: "The chair uses a platform rocker construction: the upper chair body (seat, back, arms) is mounted on a separate lower platform base via a spring or pivot mechanism that allows rocking motion without curved runners. The platform base has its own legs with claw feet. This mechanism was patented and popularized in the 1870s–1890s." },
    { type: "construction", clue: "open_carved_arm_bracket", confidence: 96, description: "The arm supports are open carved scrolled brackets rather than solid panels or turned spindles. The scroll/volute form is cut through the wood creating an open decorative silhouette. Visible on both sides from front and side views." },
    { type: "construction", clue: "upholstered_back_exterior", confidence: 96, description: "The back of the chair is fully upholstered on the exterior surface with the same green fabric, with a welt/piping trim at the edges. This is visible in the back view image." },
    { type: "construction", clue: "welt_cord_trim", confidence: 90, description: "Welt cord (piping) trim visible along the edges of the back upholstery panel, creating a defined border between the fabric and the wooden frame. Consistent with professional upholstery work." },
    { type: "style", clue: "victorian_platform_rocker_style", confidence: 52, description: "The combination of platform rocker base, scrolled open arm brackets, claw feet, reeded legs, and swept wingback silhouette is characteristic of American Victorian parlor platform rockers, c. 1875–1900. This form was mass-produced by numerous American furniture factories during this period." },
    { type: "style", clue: "empire_revival_influence", confidence: 52, description: "The swept-back wing silhouette, scrolled arm supports, and platform base with claw feet show some Empire Revival influence, which was common in American Victorian parlor furniture of the 1870s–1890s. However, the overall form is more specifically a platform rocker type than a pure Empire Revival piece." },
    { type: "hardware", clue: "claw_foot_carved", confidence: 62, description: "All four feet of the platform base are carved wooden claw/paw forms. The front feet show more detail with visible carved toe/claw articulation. The rear feet are also claw forms. These are integral carved wood, not applied metal hardware." },
    { type: "label", clue: "maker_label", confidence: 85, description: "No maker label, stamp, stencil, or mark visible in any of the provided images." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstered seat and back panel" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "structure", clue: "spindle_back", confidence: 78, description: "Spindles are visible in the back or side rail." },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
    { type: "structure", clue: "colonial_georgian_revival_upholstered_armchair_pattern", confidence: 86, description: "Fluted or reeded legs, exposed curved arm supports, and full upholstery form a Colonial / Georgian Revival upholstered armchair pattern." },
    { type: "form", clue: "wingback_form", confidence: 80, description: "Structural side wings extending forward from upper back indicate wing-chair form. Canonical: form_wing_chair." },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
  ],
  asSeen: {
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Colonial / Georgian Revival upholstered armchair",
    display: "Colonial / Georgian Revival upholstered armchair (also commonly called: Arm chair, Easy chair)",
    styleContext: "American Empire / late Classical Revival",
    finalStyleKind: "context_only",
    dateRange: "c. 1875–1899",
    dateFloor: 1875,
    dateCeiling: 1899,
    confidence: "Low",
  },
};

const modern_louis_xvi_repro_lounge_chair: ScanFixture = {
  label: "modern_louis_xvi_repro_lounge_chair",
  note:
    "Modern Louis XVI / French Neoclassical REPRODUCTION lounge chair (CNC/machine-" +
    "assisted carving, foam cushion, jacquard). The final answer is RIGHT (modern " +
    "repro, c.1900-2000) but the REASONING is garbage — that is the goldmine. M15 " +
    "(new): the narrative's 'strongest layer convergence' is decoupled from the " +
    "working range and asserts FALSE consistency. The revival_wave headline " +
    "template (datingFindingNarrative.ts:220) hardcodes '...consistent with the " +
    "working range {workingRange}' with no check that the zone overlaps " +
    "[finalDatingFloor, finalDatingCeiling]; here it prints 'strongest convergence " +
    "c.1800-1810 ... consistent with the working range c.1900-2000' — disjoint by a " +
    "century. The dating engine (refineDatingFromConvergence) CORRECTLY rejected " +
    "the 1800-1810 zone and kept P2's 1900-2000, but the narrative's independent " +
    "findStrongestZone (:137) resurfaces the rejected zone as 'strongest'. A " +
    "sibling guard is needed next to the zero-corroborating-layer null (:142): " +
    "null/suppress strongest when it does not overlap the working range. M13 " +
    "(root): the modern-production construction clues (carved_ornament_machine_" +
    "assisted '20th-21st c.', reeded_rail_detail 'machine') carry NO date envelope " +
    "and are not hard_negative+post-19xx, so hasModernConstruction=false " +
    "(engine.ts:8850) and no modern convergence zone forms — P2 reads them " +
    "qualitatively to floor 1900 but the convergence machinery is blind; same " +
    "no-date-envelope mechanism as the platform rocker. Underneath: style " +
    "attribution's ORIGINAL period (1770-1810) is admitted as a 'high'-authority " +
    "dating layer that seeds the bogus 1800-1810 zone (the early-direction twin of " +
    "the revival-late-pull cluster; style is low-weight in the ranked display but " +
    "high-authority in convergence). M16 (user principle): the working range " +
    "'Broadly late 19th to 20th century' = c.1900-2000 is a ~100-YEAR span on a " +
    "recent piece — unacceptable/garbage even when technically correct (a 100y band " +
    "is only defensible for pieces several centuries old). The same 100y span " +
    "recurs on the escritoire / biedermeier / barrel-back fixtures. Fidelity: the " +
    "final date/form reproduce; the corruption is in the narrative layer, which the " +
    "gate does not assert on.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Upholstered seat cushion present; chair is clearly a seating form." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Upholstered back panel set within carved wood frame; loose lumbar/bolster cushion rests against it." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Both arms present with scrolled volute terminals; chair is a fully-armed lounge/accent chair." },
    { type: "style", clue: "scrolled_arm_volute", confidence: 52, description: "Arm terminals terminate in large carved scrolled volutes (ram's-head / cornucopia scroll style), characteristic of Neoclassical, Regency, and Empire-revival seating vocabulary." },
    { type: "style", clue: "leaf_carved_crest_rail", confidence: 52, description: "Top crest rail carries a continuous row of carved leaf/acanthus-tip ornament running its full width, a Neoclassical / Regency / Colonial Revival decorative motif." },
    { type: "style", clue: "reeded_back_post", confidence: 52, description: "Rear view and close-up show multiple parallel reeds running the length of the back post/rail — a Neoclassical / Regency / Federal-revival ornamental detail." },
    { type: "style", clue: "carved_apron_seat_rail", confidence: 52, description: "Front seat rail carries a carved leaf-and-rosette motif centered on the apron, consistent with Neoclassical revival ornament." },
    { type: "style", clue: "carved_rosette_leg_top", confidence: 52, description: "Carved sunburst/rosette medallions visible at the upper leg/arm junction on both sides, a Neoclassical decorative accent." },
    { type: "style", clue: "tapered_carved_leg", confidence: 52, description: "Front legs are tapered and carry carved leaf ornament near the top, consistent with Neoclassical / Regency / Empire revival leg treatment." },
    { type: "style", clue: "saber_leg_rear", confidence: 52, description: "Rear legs show a pronounced outward saber curve, a hallmark of Regency and American Empire seating forms and their 20th-century revivals." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Frame members — arms, legs, crest rail, seat rail — appear to be solid wood throughout; no veneer or laminate visible on structural members." },
    { type: "finish", clue: "shellac_intact", confidence: 55, description: "Frame finish shows warm amber-brown tone with darkening in carved recesses; consistent with intact shellac or lacquer. No obvious polyurethane plastic sheen visible. Moderate confidence — could be lacquer or varnish." },
    { type: "condition", clue: "finish_wear_in_recesses", confidence: 54, description: "Carved recesses show accumulated darkening and minor wear consistent with age and use; no active damage or flaking observed." },
    { type: "construction", clue: "reeded_rail_detail", confidence: 85, description: "Close-up of back rail shows multiple parallel rounded reeds machined or carved into the rail surface; reeds are uniform and consistent, suggesting machine-assisted production rather than hand-carved individual reeds." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 50, description: "Seat, back panel, and loose cushions are covered in a large-scale floral pattern fabric with complex repeat; the pattern shows high complexity with multi-tone olive, gold, and brown coloration consistent with machine-loomed jacquard upholstery fabric. Could also be classified as damask (single-color reversible woven figure) but the multi-tone color variation and pile-like texture suggest jacquard rather than true damask." },
    { type: "upholstery", clue: "loose_seat_cushion", confidence: 45, description: "Seat has a loose drop-in cushion rather than a tight-seat construction; cushion appears to have some loft suggesting foam or spring interior." },
    { type: "upholstery", clue: "foam_padding", confidence: 50, description: "Loose seat cushion shows consistent loft and shape retention consistent with polyurethane foam fill; no visible coil spring crown or feather-down softness. Consistent with post-1960 upholstery construction." },
    { type: "upholstery", clue: "loose_back_cushion", confidence: 50, description: "A loose lumbar/bolster pillow in matching fabric rests against the upholstered back panel; this is a decorative accessory cushion, not the primary back upholstery." },
    { type: "style", clue: "neoclassical_revival_style", confidence: 52, description: "Overall vocabulary — scrolled volute arms, reeded back posts, leaf-carved crest rail, carved apron with rosette, tapered legs with leaf carving, saber rear legs — is consistent with Neoclassical / Regency / Empire revival design. This vocabulary was popular in original Regency/Empire period (c. 1800–1840) and extensively revived in American furniture production c. 1890–1940 and again c. 1980–2010 in traditional-style upholstered seating." },
    { type: "construction", clue: "upholstered_back_panel_in_frame", confidence: 85, description: "Back upholstery is set within the carved wood frame rather than over it; the fabric is tacked or stapled to the inner face of the back frame members, visible from the rear view." },
    { type: "condition", clue: "upholstery_condition_good", confidence: 54, description: "Upholstery fabric appears clean, intact, and without visible tears, stains, or significant wear; consistent with relatively recent upholstery or well-maintained original." },
    { type: "construction", clue: "carved_ornament_machine_assisted", confidence: 70, description: "Carved details (leaf crest rail, apron rosette, leg ornament) show consistent depth and regularity across multiple elements; likely machine-routed or CNC-assisted carving with possible hand-finishing, consistent with 20th–21st century production-quality traditional furniture rather than fully hand-carved antique work." },
    { type: "style", clue: "open_arm_chair_form", confidence: 52, description: "Arms are open (exposed wood frame arms, not fully upholstered); the arm pad/rest area is not upholstered — arms are entirely carved wood, consistent with a fauteuil or open-arm lounge chair form." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstered back panel set within frame" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
  ],
  asSeen: {
    formId: "Lounge chair",
    display: "Modern Louis XVI / French Neoclassical Reproduction Lounge chair (also commonly called: Easy chair, Club chair)",
    finalStyleKind: "revival_wave",
    dateRange: "Broadly late 19th to 20th century",
    dateFloor: 1900,
    dateCeiling: 2000,
    confidence: "Low",
  },
};

const eastlake_renaissance_revival_rocker: ScanFixture = {
  label: "eastlake_renaissance_revival_rocker",
  note:
    "Eastlake-influenced Renaissance Revival Victorian rocking chair (carved " +
    "lion-head medallion, incised V-groove, walnut burl panels; truly c.1870-1895). " +
    "Engine returned 'Rocking chair', style UNRESOLVED, c.1890-1920. M17 (new): " +
    "keyless-observation routing. Perception emitted 21 observations but 8 carry NO " +
    "clue_key (clue=''), and ALL FOUR style observations are among them — the " +
    "explicit 'American Renaissance Revival / Eastlake c.1870-1890' reads. Net is a " +
    "double failure: (a) the keyless style evidence is dropped from attribution, so " +
    "style_attribution=none, style_wave=none, final_style='Unresolved' on a piece " +
    "screaming Eastlake/Renaissance Revival; and (b) the same keyless observations " +
    "are still carried into P4 weighting and the Block-14 frame/upholstery split " +
    "using their ENTIRE description STRING as the clue id (see the frame-clue list, " +
    "and 'present but undated: ...Close-up of the arm post...'). So keyless obs are " +
    "half-ignored (no attribution/dating contribution) and half-mangled " +
    "(description-as-key). Secondary date issue: the working range c.1890-1920 RUNS " +
    "PAST its own strongest fastener — cut_nail (1790-1890, authority 8/10, which " +
    "P5 correctly favored over the post-1950 foam) caps at 1890, and every style " +
    "read centers 1870-1890, yet the frame floor/ceiling is 1890-1920. With style " +
    "lost, the date defaults later than the evidence supports (an Eastlake/RenRev " +
    "piece is ~1875-1890, not 1890-1920). Fixing the keyless routing should restore " +
    "the style attribution and pull the date back onto the evidence.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "armchair_form", confidence: 68, description: "Overall front view shows a Victorian-era rocking chair with upholstered back and seat, open arms with carved terminals, turned front legs, and curved rocker runners. The chair has a tall upholstered back panel and a rounded upholstered seat." },
    { type: "style", clue: "", confidence: 58, description: "Front view: The crest rail features a central carved lion-head or floral medallion roundel flanked by carved foliate/acanthus corner blocks. The lower apron shows a carved fan/shell motif with a central carved rosette. These are characteristic of American Renaissance Revival or Eastlake-influenced furniture, circa 1870-1890." },
    { type: "materials", clue: "solid_wood_construction", confidence: 45, description: "Front and side views show a solid walnut or walnut-stained hardwood frame. The crest rail and apron areas show what appears to be burl veneer panels inset into the solid wood frame, visible as a lighter, figured wood grain pattern on the crest rail." },
    { type: "style", clue: "", confidence: 58, description: "Side view clearly shows the curved rocker runners extending well beyond the front and rear legs. The back post is straight and tall, the seat is circular/oval. The overall silhouette is consistent with an American Victorian platform or standard rocking chair, c. 1875-1895." },
    { type: "condition", clue: "", confidence: 45, description: "Underside view shows the seat bottom is heavily worn, with significant finish loss, dark staining, and what appears to be old varnish crazing and surface degradation. The wood grain is exposed in many areas. This is consistent with age-related wear on an unfinished or minimally finished interior surface." },
    { type: "fasteners", clue: "cut_nail", confidence: 50, description: "Underside view shows multiple small nail or tack heads visible in the seat platform wood. The pattern and size suggest cut tacks or wire tacks used to secure the original upholstery foundation. Some appear to be staples from a later reupholstery." },
    { type: "condition", clue: "polyurethane_foam", confidence: 54, description: "Joinery closeup (seat underside detail) shows the seat platform is a solid wood panel, heavily aged and darkened, with visible grain running across the width. A yellow foam pad is visible sitting on top of the original seat platform, indicating a later reupholstery added modern foam over the original foundation." },
    { type: "construction_cues", clue: "mortise_and_tenon", confidence: 45, description: "Joinery closeup showing turned front leg meeting the seat rail and stretcher. The turned leg appears to enter the seat rail via a mortise-and-tenon or round tenon joint. The stretcher similarly enters the leg with a round tenon. This is consistent with standard Victorian chair construction." },
    { type: "style", clue: "", confidence: 58, description: "Top-down view of the chair laid flat shows the carved apron detail clearly: a central carved rosette medallion flanked by carved foliate/acanthus corner blocks at the arm terminals, and a fan/shell carved motif at the center bottom of the apron. The burl veneer inset panels on the crest rail are also visible. This ornamental vocabulary is consistent with American Renaissance Revival furniture, c. 1870-1890." },
    { type: "hardware", clue: "nailhead_trim", confidence: 45, description: "Close-up of the arm/back junction shows the nailhead trim in detail. The nailheads are round, domed, and appear to be oxidized brass or japanned metal. They are set into a blue woven gimp/braid trim. The nailheads show faceted or patterned tops, suggesting they may be decorative reproduction or period nailheads. The blue gimp trim appears to be a later reupholstery addition." },
    { type: "joinery", clue: "", confidence: 72, description: "Close-up of the arm post where it meets the seat rail shows a rectangular tenon or bridle joint. A small incised decorative V-groove or chamfer mark is visible on the arm post face, which is a characteristic Eastlake decorative incised line detail. The joint appears tight with no visible gap." },
    { type: "style", clue: "", confidence: 58, description: "The incised V-groove/chamfer decoration visible on the arm post in the joinery closeup is a hallmark of the Eastlake style (Charles Locke Eastlake influence), popular in American furniture c. 1876-1890. This, combined with the carved medallions and burl veneer panels, strongly suggests an Eastlake-influenced Renaissance Revival American rocking chair." },
    { type: "finish", clue: "shellac_intact", confidence: 45, description: "The arm and back post wood surfaces visible in the joinery closeup show a warm amber-brown finish with some surface scratches but overall intact. The sheen and color are consistent with an original or early shellac/varnish finish, possibly touched up. No evidence of polyurethane (which would appear more plastic-like)." },
    { type: "condition", clue: "fully_upholstered", confidence: 54, description: "Back view shows the back of the upholstered panel with the same blue gimp and nailhead border. The back of the crest rail shows the wood is solid and intact. The rocker runners visible at bottom show wear consistent with use. The back post shows some surface scratches but no major structural damage visible." },
    { type: "materials", clue: "fully_upholstered", confidence: 45, description: "The upholstery fabric on both seat and back is a cream/ivory ground with a small-scale repeating floral/sprig pattern in pink/rose. This appears to be a woven cotton or cotton-blend fabric, likely a later replacement upholstery (not original Victorian). The blue gimp trim is also a later addition consistent with a mid-to-late 20th century reupholstery." },
    { type: "materials", clue: "", confidence: 45, description: "The primary wood appears to be walnut based on the dark reddish-brown color, straight grain visible on the arm posts and legs, and the overall warm tone. The burl veneer panels on the crest rail show a figured, swirling grain pattern consistent with walnut burl. Secondary/interior wood on the seat platform appears to be a lighter, less figured wood possibly poplar or pine used as a secondary wood." },
    { type: "construction_cues", clue: "", confidence: 50, description: "Side view shows the turned front legs with multiple ring turnings and a vase-shaped element near the top. The stretchers between legs are also turned with ring details. This lathe-turned work is consistent with factory production of the Victorian era, not hand-turned artisan work, suggesting a commercially manufactured piece." },
    { type: "upholstery", clue: "foam_padding", confidence: 50, description: "foam over original seat platform" },
    { type: "upholstery", clue: "jute_webbing", confidence: 50, description: "burlap/jute webbing" },
    { type: "structure", clue: "backrest_present", confidence: 50, description: "backrest_present" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating_surface" },
  ],
  asSeen: {
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Rocking chair",
    display: "Italian Renaissance / Neo-Renaissance Revival Rocking chair",
    styleContext: "Renaissance Revival",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

const wicker_rattan_barrel_lounge_chair: ScanFixture = {
  label: "wicker_rattan_barrel_lounge_chair",
  note:
    "Dark-painted wicker/rattan barrel-back lounge chair (loose ticking-stripe " +
    "cushion). Form lounge_chair CORRECT (lounge_chair_form conf 78 fired and won — " +
    "posture path working, contrast the Louis XVI repro where it didn't fire). But " +
    "date = 'Broad, not tightly dated' and style UNRESOLVED on a piece that is " +
    "datable BY TRADITION. WICKER-ERA DATING GAP (extends M13/#18): the engine " +
    "captured every wicker-era clue — victorian_curlicue_wicker (c.1880-1900), " +
    "bar_harbor_style_wicker (c.1900-1920), mid_century_streamlined_wicker " +
    "(c.1945-1970), wicker_weave_open (c.1900-1920) — but each carries its date band " +
    "only in DESCRIPTION PROSE and is typed style/construction, so NONE reach a " +
    "dating layer: overlap is form-only (1700->open), 0 convergence zones. NEGATION " +
    "(#15) DETECTION-WINDOW GAP: bar_harbor_style_wicker ('does NOT exhibit the Bar " +
    "Harbor weave') and victorian_curlicue_wicker ('NO scrolls, curlicues visible') " +
    "self-negate yet enter as POSITIVE 0.64, and bar_harbor even STEERS the P5 " +
    "conflict toward Bar Harbor (1900-1920) over mid-century. descriptionNegatesClue " +
    "misses them because the negation names ABSENT ATTRIBUTES ('no scrolls') not the " +
    "clue's canonical phrase ('victorian curlicue wicker'), which never appears " +
    "contiguous with the negation cue. Contrast: solid_wood_construction / " +
    "maker_label / painted_metal_finish / chintz_cover DID negate (canonical phrase " +
    "IS contiguous with 'no'/'not') — hence negated:true on those four, matching the " +
    "as-seen run (they were dropped from the frame split). STYLE UNRESOLVED + form " +
    "headline drops 'wicker' (just 'Lounge chair'; Wicker/rattan only an alternative). " +
    "DATA HYGIENE: rattan_frame emitted twice (construction conf 88 + materials conf " +
    "84) double-counts in P4 + the undated bucket (dedupe keys on type|clue|description).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Wicker-woven seat surface present; loose ticking-stripe cushion placed on top in one image." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Large rounded barrel-style backrest with arched crest rail, fully wicker-woven, visible in all images." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Chair has integrated wicker armrests on both sides with open cutout holes at the arm-to-back junction, confirming armchair form." },
    { type: "function", clue: "sitting", confidence: 70, description: "Piece is a seating chair designed for sitting; loose cushion present in one view." },
    { type: "materials", clue: "woven_body", confidence: 84, description: "Entire chair body — seat, back, arms, apron — is wicker-woven over a structural rattan or reed frame." },
    { type: "materials", clue: "rattan_frame", confidence: 84, description: "Structural frame members visible at legs, stretcher, and arm/back crest are rattan poles, dark-painted, with characteristic node rings visible at leg wraps." },
    { type: "style", clue: "mid_century_streamlined_wicker", confidence: 52, description: "Chair exhibits streamlined rounded barrel-back form, relatively simple curves without Victorian curlicue ornament, consistent with mid-century or later wicker production c. 1945–1980. No scrolls, fans, or heavy Victorian ornament visible." },
    { type: "style", clue: "wicker_weave_close", confidence: 52, description: "Weave on seat, back panel, and arm panels is tight and close with minimal gaps between strands, indicating quality production weave." },
    { type: "style", clue: "wicker_weave_open", confidence: 52, description: "Lower apron band shows a more open basket-weave pattern with visible gaps, contrasting with the tighter weave above." },
    { type: "style", clue: "wicker_weave_basket", confidence: 52, description: "Lower apron section exhibits a basket-weave over-under pattern in groups, visible in the front image." },
    { type: "construction", clue: "rattan_frame", confidence: 88, description: "Legs are rattan poles with visible node-ring wrapping at joints; front legs show turned/wrapped decorative banding; stretcher bar connects front legs at base." },
    { type: "condition", clue: "wicker_strand_breakage", confidence: 54, description: "Fraying and loose strand ends visible at the open cutout edges of the arm-to-back junction on both sides; minor strand breakage at rear leg wrap area visible in side view." },
    { type: "condition", clue: "painted_metal_finish", confidence: 54, negated: true, description: "Frame is not metal; rattan poles appear dark-painted or stained rather than painted metal. No metal frame members detected." },
    { type: "condition", clue: "wicker_paint_buildup", confidence: 45, description: "The dark brown/black coloration on the outer arm panels, crest rail, and legs appears to be a painted or stained finish applied over the wicker and rattan; the natural tan interior weave suggests either selective painting or a two-tone intentional design. Multiple paint layers cannot be confirmed from photos." },
    { type: "style", clue: "bar_harbor_style_wicker", confidence: 52, description: "Chair does not exhibit the open airy geometric Bar Harbor weave; weave is close and the form is more rounded/barrel-back than the angular Bar Harbor style." },
    { type: "style", clue: "victorian_curlicue_wicker", confidence: 52, description: "No scrolls, curlicues, fans, hearts, or heavy Victorian ornament visible. Form is clean and streamlined." },
    { type: "upholstery", clue: "chintz_cover", confidence: 40, negated: true, description: "Loose seat cushion visible in joinery_closeup image shows a blue-and-white ticking stripe pattern on what appears to be a cotton fabric. This is a ticking stripe cotton cover, not chintz. Best classified as a plain woven cotton stripe — no glaze visible. Cushion is a loose drop-in pad, not integral upholstery." },
    { type: "upholstery", clue: "button_tufting", confidence: 50, description: "Loose seat cushion shows regular grid of tufted dimples across its surface; buttons or stitching hold the tufting. Appears stitch-tufted with visible button or tie points at regular intervals." },
    { type: "upholstery", clue: "no_spring_seat", confidence: 50, description: "The wicker seat base has no spring construction; it is a flat woven surface. The loose cushion is a simple padded drop-in with no spring lift." },
    { type: "materials", clue: "solid_wood_construction", confidence: 92, negated: true, description: "No solid wood construction detected; piece is rattan-framed wicker throughout." },
    { type: "label", clue: "maker_label", confidence: 85, negated: true, description: "No maker label, stamp, tag, or visible text detected in any of the three images." },
    { type: "structure", clue: "vertical_supports", confidence: 82, description: "Four rattan pole legs visible; front legs show decorative wrapped banding; rear legs visible in side view as straight dark rattan poles." },
    { type: "structure", clue: "stretchers", confidence: 82, description: "A horizontal stretcher bar connects the two front legs at the base, visible in the front image." },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "loose seat cushion" },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
    { type: "structure", clue: "barrel_tub_back", confidence: 76, description: "Textual barrel/tub/cylindrical back vocabulary on a seating form indicates barrel-back construction." },
  ],
  asSeen: {
    formId: "Lounge chair",
    display: "Lounge chair (also commonly called: Easy chair, Club chair)",
    finalStyleKind: "unresolved",
    dateRange: "Broad, not tightly dated",
    dateFloor: null,
    dateCeiling: null,
    confidence: "Low",
  },
};

const french_bistro_iron_faux_stone_table: ScanFixture = {
  label: "french_bistro_iron_faux_stone_table",
  note:
    "French bistro/garden IRON table: scrolled wrought/cast-iron trestle base, oval " +
    "faux-stone top (painted MDF/laminate, NOT natural stone). Form bistro_cafe_table " +
    "CORRECT. Three failures stacked. (1) WICKER VOCAB MISFIRES ON IRON: " +
    "victorian_curlicue_wicker fired (its own prose says 'NOT wicker; however the " +
    "scrollwork...') AND woven_body ('Woven wicker or reed body construction is " +
    "visible') conf 76 — there is NO wicker on this iron table. Both enter POSITIVE: " +
    "victorian_curlicue_wicker (0.64) becomes a style clue + drives the P5 conflict; " +
    "woven_body seeds the 'Wicker/rattan furniture' alt-form + the bogus 'Wicker, " +
    "reed, or rattan construction...' limitation. The 'Not wicker' negation is missed " +
    "(canonical phrase not contiguous with the cue — same window gap as the wicker " +
    "chair). (2) THIN-TOKEN STYLE MISFIRE (#1/#11): attribution matched the single " +
    "token 'french' (from french_bistro_garden_table_influence) -> 'Louis XVI / " +
    "French Neoclassical' conf 0.6, leaking that formal-style label into the form " +
    "display ('Louis XVI / French Neoclassical Bistro table') on a garden/bistro " +
    "table that is NOT Louis XVI. (3) MODERN-MATERIAL CLUE NOT DATED (M13 class): the " +
    "faux-stone laminate/MDF top (top_material_ambiguous, refinished_surface) is the " +
    "strongest 'later-20th-c reproduction' signal but carries no date envelope, so " +
    "the date rests on the partly-bogus wicker-driven style_wave (1880-1930) + " +
    "welded_joint (post-1910) and lands c.1900-1930 — too early for a welded, " +
    "laminate-topped repro. seating_surface ('No seating surface present') correctly " +
    "negated:true (dropped in the as-seen run). door_present (conf 58, 'Door evidence " +
    "is visible') is a hallucination on a table — left positive (as-seen).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "flat_surface", confidence: 68, description: "Oval tabletop visible in both overall_front and overall_side images; substantial thickness approximately 1.5-2 inches at edge." },
    { type: "form", clue: "seating_surface", confidence: 68, negated: true, description: "No seating surface present; this is a table form only." },
    { type: "structure", clue: "metal_frame", confidence: 82, description: "Entire base structure is metal — two trestle-style end supports with scrolled volutes connected by a central horizontal stretcher bar, all in dark iron-toned metal." },
    { type: "style", clue: "victorian_curlicue_wicker", confidence: 52, description: "Not wicker; however, the scrollwork ornament vocabulary (volutes, C-scrolls, S-scrolls, foliate terminals) is consistent with Victorian garden furniture or French bistro/jardinière iron table aesthetic, c. 1880–1940." },
    { type: "materials", clue: "wrought_iron", confidence: 45, description: "Base appears to be wrought or cast iron with dark brown-black finish showing surface oxidation. The scrolled rod elements suggest wrought iron or tubular steel bent and assembled; cast iron more likely for the flat decorative panels visible in joinery_closeup." },
    { type: "materials", clue: "painted_metal_finish", confidence: 84, description: "Metal base shows a dark brown-black painted or powder-coated finish with visible surface oxidation and rust patina over the paint layer." },
    { type: "materials", clue: "rust_pitting", confidence: 80, description: "Active iron oxidation visible on base members, particularly at lower scrolled feet and stretcher areas visible in underside and joinery_closeup images." },
    { type: "materials", clue: "refinished_surface", confidence: 45, description: "Tabletop surface shows a mottled faux-stone or decorative painted finish in gray-brown-mauve tones. The surface appears to be a painted or laminate faux-marble/stone treatment rather than natural stone — the pattern is too uniform and soft-edged for natural stone, and the top appears lightweight relative to its size. Could be painted MDF, painted wood, or a laminate panel." },
    { type: "construction", clue: "welded_joint", confidence: 60, description: "Joints between scrolled iron members and structural uprights visible in joinery_closeup images. The junction points appear to be welded or brazed rather than hand-forged; no visible rivet heads. Weld or braze fillet visible at scroll-to-upright junctions." },
    { type: "construction", clue: "brazed_metal_joint", confidence: 45, description: "At scroll junctions visible in joinery_closeup, the joining method appears to be brazing or welding — a fillet of material is visible at the joint corners. No rivet heads visible. Consistent with late 19th to mid 20th century decorative iron furniture production." },
    { type: "style", clue: "scrollwork_ornament", confidence: 52, description: "Elaborate C-scroll and S-scroll ornament throughout the base: scrolled volutes at top apron connecting to tabletop, scrolled feet at base, central decorative panel with symmetrical scroll composition. Style vocabulary consistent with French garden/bistro table tradition or Victorian decorative ironwork, c. 1880–1950." },
    { type: "structure", clue: "frame_members", confidence: 82, description: "Two trestle-style end supports, each composed of vertical uprights with scrolled feet and scrolled top apron, connected by a horizontal stretcher bar at mid-height. The stretcher is visible in the underside closeup." },
    { type: "structure", clue: "stretchers", confidence: 82, description: "Horizontal stretcher bar connecting the two trestle end supports visible in underside and joinery_closeup images." },
    { type: "condition", clue: "joint_corrosion", confidence: 54, description: "Corrosion concentrated at metal joints and lower base members visible in underside and joinery_closeup images; surface rust and oxidation present throughout base." },
    { type: "condition", clue: "condition_overall", confidence: 54, description: "Base shows moderate oxidation and surface rust consistent with age or outdoor/semi-outdoor use. Tabletop surface shows wear and mottling but is structurally intact. No major structural damage visible." },
    { type: "materials", clue: "top_material_ambiguous", confidence: 65, description: "Tabletop surface texture in overall_side closeup shows a mottled gray-brown-mauve pattern that reads as faux-stone painting or decorative laminate rather than natural stone. The edge profile appears relatively thin and uniform. Natural stone of this size would typically show more weight and a crisper edge profile. Most likely a painted wood, MDF, or laminate panel with faux-stone decorative finish." },
    { type: "style", clue: "french_bistro_garden_table_influence", confidence: 52, description: "The combination of oval top, scrolled iron trestle base with decorative apron and feet, and overall proportions is consistent with French bistro table or garden table design influence. This form was popular in American decorative furniture from c. 1890 through the mid-20th century and continues in reproduction production. Domestic American commercial production of this look is equally plausible as French origin." },
    { type: "hardware", clue: "top_attachment", confidence: 45, description: "In joinery_closeup (back image), a flat metal bracket or plate is visible at the top of the iron apron where it meets the underside of the tabletop. This appears to be the attachment point for the top to the iron base." },
    { type: "construction", clue: "cast_iron_decorative_panel", confidence: 45, description: "The central decorative panel visible in the joinery_closeup (back image) — showing a symmetrical scroll composition with a central fleur-de-lis-like element — appears to be a cast iron or cast metal decorative insert rather than bent rod work. The complexity and symmetry of the pattern suggests casting." },
    { type: "function", clue: "display_or_dining", confidence: 70, description: "Table height and oval top proportions suggest use as a dining table, side table, or display table. The form is consistent with a bistro-style dining table or decorative hall/entry table." },
    { type: "materials", clue: "woven_body", confidence: 76, description: "Woven wicker or reed body construction is visible." },
    { type: "construction", clue: "door_present", confidence: 58, description: "Door evidence is visible." },
  ],
  asSeen: {
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Bistro table",
    display: "Bistro table (also commonly called: Bistro table, Bistro café table)",
    styleContext: "American Empire / late Classical Revival",
    finalStyleKind: "context_only",
    dateRange: "c. 1900 onward (early-to-mid 20th century or later)",
    dateFloor: 1900,
    confidence: "Low",
  },
};

const painted_gilt_rococo_revival_settee: ScanFixture = {
  label: "painted_gilt_rococo_revival_settee",
  note:
    "Painted/gilt carved-wood two-seat settee in Louis XV / Rococo Revival " +
    "vocabulary (cabriole legs, serpentine floral crest, scrolled arms, button + " +
    "channel tufting, foam) — a 20th-c reproduction. Form settee CORRECT (beat " +
    "lounge_chair_form conf 78). The 'reproduction / impossible_pair' verdict is " +
    "RIGHT in spirit but reached for the WRONG reason — two style-attribution token " +
    "bugs. (1) THIN-TOKEN MISFIRE DRIVES IMPOSSIBLE_PAIR: 'Postmodern / Memphis / " +
    "Radical Design Influence' attributes at conf 0.60 on the SINGLE generic token " +
    "'influence', which leaks from clue names/descriptions (louis_xv_revival_" +
    "INFLUENCE, 'design influence'). That bogus Postmodern (1980s) vs Rococo Revival " +
    "(Victorian) pairing is what trips the P5 impossible-pair conflict; the " +
    "reproduction conclusion rides on a generic-word collision, not real " +
    "incompatible-style evidence. (2) SUB-STYLE MISLABEL (#5/#9): the piece is Louis " +
    "XV / Rococo Revival but the PRIMARY label is 'Louis XVI / French Neoclassical' — " +
    "the 'louis' token (from louis_xv_revival_influence, i.e. Louis XV) plus " +
    "tapered_leg (a Louis XVI/neoclassical signal that misfired on CABRIOLE legs, " +
    "conf 82, its own prose says 'tapered cabriole form') pushed Louis XVI. Rococo " +
    "Revival tied at 0.82 but lost the primary slot. DATE c.1920-1930 likely ~20y " +
    "early — frame reads mid-century commercial (louis_xv_revival_influence " +
    "'c.1940s-1970s'; upholstery c.1955-1980); the style-wave revival-overlap " +
    "anchored 1920-1930. Only nailhead_trim negated ('No decorative nailhead trim " +
    "visible'), matching the as-seen drop; painted_metal_finish ('Frame is wood, not " +
    "metal') stays POSITIVE — the negation targets 'metal', not the clue's term, so " +
    "it isn't caught and it supplies the post-1900 finish floor on a wood frame.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Fully upholstered seat platform present; single integrated seat cushion without loose cushion, typical of parlor settee construction." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Tall serpentine-shaped upholstered backrest with channel tufting and button tufting visible; fan/shell radiating channel pattern from center crest downward." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Two-seat settee (loveseat/canapé) with fully upholstered scrolled arms on both sides; arm fronts show rolled upholstered pads." },
    { type: "style", clue: "cabriole_leg", confidence: 52, description: "Cabriole legs visible on front corners and rear; painted/gilded cream-gold finish; legs terminate in scroll or pad foot form consistent with Louis XV / Rococo Revival style." },
    { type: "style", clue: "rococo_revival_style", confidence: 52, description: "Serpentine crest rail with carved floral and foliate bouquet at center top crest; scrolled arm terminals; cabriole legs; overall Louis XV / Rococo Revival design vocabulary strongly present." },
    { type: "style", clue: "carved_floral_crest", confidence: 52, description: "Prominent carved floral and leaf bouquet applied to center of crest rail; roses and foliage visible; painted cream-gold to match frame finish." },
    { type: "style", clue: "serpentine_crest_rail", confidence: 52, description: "Crest rail has pronounced serpentine double-curve (S-curve) silhouette with scrolled ends; characteristic of Louis XV revival and Victorian parlor seating." },
    { type: "upholstery", clue: "button_tufting", confidence: 50, description: "Regular grid of button tufting visible across the lower back panel; buttons appear covered with matching fabric; combined with vertical channel tufting in upper back creating a hybrid channel-and-button tufted back." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 50, description: "Upholstery fabric shows a repeating small floral pattern with woven figure visible on both the seat and exterior back panels; pattern complexity and machine-loomed regularity suggest jacquard weave; could also be a damask — the pattern appears woven-in rather than printed, with slight sheen variation. Best-fit classification: jacquard_cover. Uncertainty: damask_cover also possible." },
    { type: "upholstery", clue: "damask_cover", confidence: 45, description: "Alternative cover classification: the fabric may be a damask with single-color woven floral repeat; the reversible-contrast characteristic of damask is plausible given the tone-on-tone appearance. Confidence lower than jacquard_cover classification; both are possible." },
    { type: "upholstery", clue: "nailhead_trim", confidence: 50, negated: true, description: "No decorative nailhead trim visible; upholstery edges are finished with gimp/braid cord trim rather than nailheads." },
    { type: "upholstery", clue: "gimp_braid_trim", confidence: 50, description: "Woven gimp or braid trim visible along the upholstery-to-frame transition on the back exterior and seat rail; consistent with mid-20th century or later upholstery finishing practice." },
    { type: "condition", clue: "upholstery_tears_seat", confidence: 45, description: "Significant fabric tears and splitting visible on the seat surface; underlying fill material (appears to be cotton batting or foam) exposed through tears; staining also present." },
    { type: "condition", clue: "upholstery_wear_arms", confidence: 54, description: "Arm front upholstery shows splitting and fraying; fabric deteriorating at the rolled arm pad areas on both sides." },
    { type: "condition", clue: "frame_paint_wear", confidence: 54, description: "Painted/gilded cream-gold frame shows wear and chipping at legs, arm scrolls, and lower rail areas; underlying wood visible at wear points." },
    { type: "materials", clue: "painted_metal_finish", confidence: 84, description: "Frame is wood, not metal; the cream-gold finish is paint or gesso-and-gilt applied to a carved wood frame." },
    { type: "materials", clue: "solid_wood_construction", confidence: 82, description: "Frame members visible at wear points and leg areas appear to be solid wood (likely beech, poplar, or similar secondary hardwood) with painted/gilded surface finish; no lamination or veneer visible on frame." },
    { type: "style", clue: "louis_xv_revival_influence", confidence: 52, description: "Overall design vocabulary — cabriole legs, serpentine crest, carved floral crest, scrolled arms, painted/gilded frame — is consistent with Louis XV revival or French Provincial revival design influence. This describes design influence, not country of manufacture; American commercial production of this style was widespread c. 1940s–1970s." },
    { type: "construction", clue: "upholstered_exterior_back", confidence: 95, description: "Exterior back panel is fully upholstered with the same or similar floral fabric; gimp trim borders the upholstered back panel where it meets the frame; visible in side and back views." },
    { type: "construction", clue: "channel_tufting_back", confidence: 94, description: "Vertical channel tufting (parallel vertical channels of fabric) visible in the upper back radiating from center in a fan/shell pattern; combined with button tufting in the lower back zone." },
    { type: "upholstery", clue: "foam_padding", confidence: 45, description: "Tears in seat fabric reveal what appears to be a relatively flat, compressed fill material; could be foam padding or compressed cotton batting; the flat profile of the seat and the way tears expose fill suggests foam or thick cotton batting rather than coil springs with deep crown." },
    { type: "condition", clue: "general_soiling_staining", confidence: 54, description: "General soiling and staining visible across seat surface and arm areas; pink/red staining visible on seat and lower arm areas; fabric faded and discolored overall." },
    { type: "structure", clue: "tapered_leg", confidence: 82, description: "Four cabriole legs visible (two front, two rear); painted cream-gold finish matching frame; front legs more elaborately shaped with scroll detail at knee; rear legs simpler tapered cabriole form." },
    { type: "style", clue: "scrolled_arm_terminals", confidence: 52, description: "Arm terminals scroll outward and downward in a C-scroll form; painted/gilded wood visible at arm scroll ends; consistent with Louis XV / Rococo Revival seating vocabulary." },
    { type: "construction", clue: "gimp_cord_upholstery_edge", confidence: 85, description: "Woven cord gimp trim applied along the perimeter of the upholstered back exterior and seat rail junction; this finishing method is consistent with mid-20th century commercial upholstery practice." },
    { type: "condition", clue: "back_panel_upholstery_intact", confidence: 54, description: "Exterior back upholstery panel appears mostly intact with minor wear; some small tears or punctures visible in back panel fabric; overall better condition than seat and arms." },
    { type: "style", clue: "beaded_molding_frame", confidence: 52, description: "Fine beaded or rope-twist molding visible along the inner edge of the crest rail frame where it meets the upholstery; decorative detail consistent with Louis XV revival frame carving." },
    { type: "context", clue: "french_provincial_style", confidence: 48, description: "Louis XV revival" },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstered exterior back panel" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
  ],
  asSeen: {
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Settee",
    display: "Rococo Revival / Naturalistic Victorian Settee (also commonly called: Settee, Small sofa)",
    styleContext: "Rococo Revival / Naturalistic Victorian",
    finalStyleKind: "unresolved",
    dateRange: "c. 1900 onward (early-to-mid 20th century or later)",
    dateFloor: 1900,
    confidence: "Low",
  },
};

const victorian_spindle_gallery_parlor_rocker: ScanFixture = {
  label: "victorian_spindle_gallery_parlor_rocker",
  note:
    "Victorian parlor rocking chair (turned spindle gallery + ball finials above an " +
    "upholstered back, swept arms, curved rockers, needlepoint/jacquard cover, hand " +
    "nailhead tacks; ~1870-1910). Form rocking_chair CORRECT — good #17 control that " +
    "rocking chair is reachable (rocking_chair + rocker_runners won; armchair_form " +
    "did not derail it). Date c.1890-1920 reasonable. KEY ISSUE — a NON-STYLE " +
    "FEATURE BECOMES THE STYLE via a CROSS-DOMAIN clue: there is no Victorian / " +
    "Eastlake parlor style family, so style attribution is empty and the final label " +
    "falls back to 'Spindle Gallery' (context_only) — a construction/ornament " +
    "feature, not a style. Worse, the contributing clues spindle_gallery / " +
    "turned_spindle_gallery are authored for Victorian shelf CLOCKS " +
    "(turned_spindle_gallery date hint: 'turned-spindle gallery at the top of a " +
    "shelf CLOCK case ... kitchen CLOCK production c.1875-1900') — a clock-domain " +
    "clue firing on a chair's spindle row and then surfacing as the piece's STYLE. " +
    "Two threads: (a) missing Victorian-parlor/Eastlake style family for a very " +
    "common form; (b) clue-domain collision (a clock-specific clue matches a chair " +
    "feature). Secondary: needlepoint_cover (c.1600-1899) pulls the upholstery floor " +
    "to 1600 — loose. No clues negated (all 28 P0 keys present in the as-seen run).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Upholstered seat panel present, supported on a wooden frame with stretchers below." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Upholstered back panel present, framed by turned spindles above and a curved crest rail with ball finials." },
    { type: "form", clue: "spindle_back", confidence: 68, description: "Row of turned decorative spindles visible between the crest rail and the top of the upholstered back panel; spindles are vase/baluster-turned." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Curved swept arms extend from the back posts forward and downward to the front seat rail area, forming an open armchair configuration." },
    { type: "function", clue: "rocking_chair", confidence: 70, description: "Curved rocker runners visible beneath the legs; chair is clearly a rocking chair form." },
    { type: "structure", clue: "rocker_runners", confidence: 82, description: "Curved bentwood-style rocker runners visible at base; runners are wide and flat-profiled with a slight upward curl at each end, finished in the same dark red-brown as the frame." },
    { type: "structure", clue: "stretchers", confidence: 82, description: "Multiple turned stretcher rails visible connecting front legs and side rails beneath the seat." },
    { type: "style", clue: "ball_finials", confidence: 52, description: "Prominent turned ball finials cap both back posts; finials are large, round, and well-defined — a characteristic Victorian parlor rocker ornament." },
    { type: "style", clue: "victorian_parlor_rocker_form", confidence: 52, description: "Overall form — ball finials, turned spindle gallery above upholstered back, swept curved arms, upholstered seat and back with decorative tack trim, curved rockers — is consistent with Victorian-era American parlor rocking chair production, c. 1870–1910." },
    { type: "construction", clue: "round_tenon", confidence: 80, description: "Turned spindles and stretchers appear to be joined via round tenon joinery into mortised sockets in the rails and posts, consistent with chair-frame construction of the period." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Frame members appear to be solid wood throughout — posts, arms, rockers, spindles, and stretchers all show consistent solid-wood profiles with no visible veneer or lamination." },
    { type: "materials", clue: "wood_species_mahogany_group", confidence: 45, description: "Frame wood is a warm red-brown with fine grain and smooth surface; color and finish are consistent with mahogany or a mahogany-stained hardwood (possibly walnut or cherry). Grain detail visible on rocker runner suggests a diffuse-porous hardwood. Species uncertain from photos alone." },
    { type: "materials", clue: "needlepoint_cover", confidence: 72, description: "Both the seat and back upholstery panels show a dense floral pattern with visible stitch texture — the surface has a looped/cut pile texture with clearly defined floral motifs in pink, rust, green, and gold on a tan ground. The texture and pattern density are consistent with needlepoint or a needlepoint-style carpet/tapestry weave rather than printed fabric. Stitch direction and density are visible at the hardware closeup." },
    { type: "materials", clue: "jacquard_cover", confidence: 55, description: "Alternative classification: the cover could be a machine-woven Jacquard tapestry fabric rather than hand-stitched needlepoint. The regularity of the pattern and the looped pile texture visible in the closeup are consistent with machine-woven tapestry/Jacquard upholstery fabric common in Victorian parlor furniture. Confidence in needlepoint_cover is moderate; jacquard_cover is a plausible alternative." },
    { type: "hardware", clue: "nailhead_trim", confidence: 62, description: "Rows of decorative tack/nailhead trim visible along all four edges of both the seat and back upholstery panels. Tack heads are dark (oxidized brass or iron), domed, with a slightly floral/rosette embossed pattern visible in the hardware closeup. Spacing appears hand-placed with slight irregularity." },
    { type: "hardware", clue: "hand_tacks", confidence: 62, description: "Tack heads show slight irregularity in spacing and alignment consistent with hand-driven placement rather than machine stapling. Multiple tack heads visible along back panel edges with oxidized dark patina." },
    { type: "condition", clue: "upholstery_wear", confidence: 54, description: "Upholstery fabric shows significant wear: fading, pile loss in central areas of seat, fraying at front edge of seat, and general soiling. The fabric is intact but clearly aged." },
    { type: "condition", clue: "finish_wear_at_contact_points", confidence: 54, description: "Wood finish shows wear and lightening at arm tops and high-contact areas visible in side view; consistent with long-term use wear." },
    { type: "condition", clue: "green_corrosion_on_hardware", confidence: 45, description: "A small area of green corrosion (verdigris) is visible on what appears to be a bolt or tack at the front lower rail of the seat — consistent with brass hardware oxidation over extended time." },
    { type: "condition", clue: "shellac_intact", confidence: 54, description: "Wood surfaces show a warm amber-brown finish with moderate sheen; no plastic-like thick film visible. Finish appears consistent with shellac or early varnish rather than polyurethane. Some surface wear and dulling at contact points." },
    { type: "structure", clue: "no_spring_seat", confidence: 45, description: "The seat upholstery panel appears relatively flat and thin without the crowned dome profile typical of coil-spring construction. The seat fabric appears to be stretched over a flat or lightly padded surface, suggesting no-spring or minimal-padding construction." },
    { type: "style", clue: "turned_spindle_gallery", confidence: 52, description: "A row of turned vase/baluster spindles forms a decorative gallery between the crest rail and the top of the upholstered back panel — a characteristic Victorian gingerbread/parlor rocker ornamental feature, c. 1875–1900." },
    { type: "structure", clue: "curved_arms", confidence: 82, description: "Arms are gracefully curved in a sweeping arc from the back post down to the front, with no flat horizontal arm pad — consistent with Victorian sewing rocker or platform rocker arm style." },
    { type: "structure", clue: "rocker_runner_profile", confidence: 80, description: "Rocker runners are wide, flat-profiled, and slightly tapered at the ends with a gentle upward curl. The runners appear to be steam-bent or shaped solid wood rather than laminated. This wide flat runner profile is associated with late Victorian and Edwardian-era American rocking chairs." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 70, description: "The junction of the back post with the crest rail and the spindle insertions are consistent with mortise-and-tenon or round-tenon socket joinery typical of Victorian chair construction." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstered seat and back panel" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating" },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
  ],
  asSeen: {
    formId: "Rocking chair",
    display: "Rocking chair",
    styleContext: "Spindle Gallery",
    finalStyleKind: "context_only",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

const hollywood_regency_rococo_lounge_chair: ScanFixture = {
  label: "hollywood_regency_rococo_lounge_chair",
  note:
    "Cream/gold painted carved-wood lounge chair, Rococo Revival / Louis XV " +
    "vocabulary with Hollywood Regency execution (pierced acanthus crest, cabriole " +
    "scroll-foot legs, tufted jacquard, foam) — a mid-century (c.1950s-1980s) " +
    "painted repro. RECURS the settee's threads (n=2). (1) SUB-STYLE MISLABEL " +
    "#5/#9: clearly Louis XV / Rococo Revival but labeled 'French Louis XVI Revival' " +
    "/ 'Louis XVI / French Neoclassical'. THREE families tied at conf 0.82 — Louis " +
    "XVI (['louis','french','revival','provincial']), Hollywood Regency " +
    "(['hollywood','regency']), Rococo Revival (['rococo','revival']) — and Louis " +
    "XVI won the primary slot, arguably the LEAST apt of the three (Hollywood Regency " +
    "or Rococo Revival fit better). The tiebreak rides 'louis'/'french' tokens. " +
    "(2) painted_metal_finish fires on a WOOD frame (its prose: 'Frame is not " +
    "metal... Not a metal finish') yet stays POSITIVE — the negation targets " +
    "'metal', not the clue term — and supplies the post-1900 finish floor (n=2 with " +
    "the settee). (3) DATE c.1920-1930 ~30-40y too early: the piece reads mid-century " +
    "Hollywood Regency (hollywood_regency_style_cue 'c.1950s-1980s', post-1950 " +
    "jacquard, foam c.1930-1960) but the Academic French Louis XVI Revival wave " +
    "(1900-1930) anchors the frame date; the HR/mid-century cues are category style " +
    "(wt 0.37) and never feed a dated layer (M13/#3 class). MINOR: visible_text " +
    "fired on an incidental 3M sandpaper package in the scene ('not a furniture " +
    "maker mark') — scene-object contamination, benign here (no maker matched). No " +
    "clues negated (all 24 P0 keys present in the as-seen run).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Upholstered seat with loose cushion visible; chair is clearly a seating form." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "High tufted backrest with carved crest rail and pierced openwork elements visible." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Fully upholstered arms with carved wooden arm supports and scrolled terminals visible on both sides." },
    { type: "style", clue: "cabriole_leg", confidence: 52, description: "Cabriole legs with scroll feet visible at front corners; cream-painted with gold accent highlights; characteristic of Louis XV / Rococo Revival seating." },
    { type: "style", clue: "style_cue_rococo_revival", confidence: 52, description: "Overall form exhibits Rococo Revival / Louis XV revival characteristics: pierced carved crest with acanthus and floral motifs, serpentine seat rail, cabriole legs, scrolled arm terminals, and cream-and-gold painted finish. This is a design influence/vocabulary, not a country-of-origin claim; American commercial production of this look is common from c.1940s–1980s." },
    { type: "construction", clue: "carved_wood_frame", confidence: 96, description: "Exposed carved wood frame visible at crest rail, arm supports, seat rail, and legs. Carving includes pierced openwork acanthus scrolls, grape clusters, and floral motifs. Frame is painted cream/ivory with gold accent highlights." },
    { type: "style", clue: "pierced_carved_crest", confidence: 45, description: "Crest rail features pierced/openwork carved decoration with scrolling acanthus, floral, and possibly musical instrument motifs (violin-like shape visible in upper crest closeup). Characteristic of high-style Rococo Revival or Hollywood Regency parlor chairs." },
    { type: "finish", clue: "painted_metal_finish", confidence: 55, description: "Frame is not metal; it is wood painted cream/ivory with gold accent paint applied to carved relief details. Not a metal finish." },
    { type: "finish", clue: "refinished_surface", confidence: 55, description: "Frame shows cream/ivory paint over carved wood with gold highlights on relief areas. Paint wear at edges and carved details reveals underlying wood or gesso, suggesting the current paint finish is a later decorative campaign rather than original natural wood finish. Consistent with mid-20th-century or later Hollywood Regency-style painted finish." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 50, description: "Upholstery fabric shows a large-scale repeating floral pattern (roses, acanthus leaves) with high pattern complexity and multi-tone coloring (gold, sage green, pink, blue). The woven figured pattern with regular repeat and visible warp/weft structure is consistent with jacquard upholstery fabric. Rayon or polyester jacquard suggested by the sheen and color palette; likely post-1950 fabric." },
    { type: "upholstery", clue: "button_tufting", confidence: 50, description: "Regular grid of deep tufting dimples visible across the back panel, each held by a small covered button. Button tufting is clearly visible in both the overall front and the back closeup images. Approximately 4–5 columns and 5–6 rows of buttons visible." },
    { type: "upholstery", clue: "foam_padding", confidence: 50, description: "The loose seat cushion shows a thick, rounded profile consistent with foam padding rather than traditional spring-and-hair construction. The cushion retains a uniform shape without the crowned dome typical of hand-tied coil springs. Likely polyurethane foam core." },
    { type: "condition", clue: "upholstery_soiling", confidence: 54, description: "Tufting buttons and surrounding fabric show dark soiling/discoloration, particularly concentrated at the button dimples on the back panel. Fabric also shows general compression wear and some bunching at the back-arm junction." },
    { type: "condition", clue: "paint_wear_on_frame", confidence: 54, description: "Cream paint shows wear and chipping at carved edges and high-relief areas, revealing underlying wood or gesso substrate. Most visible on the pierced crest rail and arm scroll terminals." },
    { type: "construction", clue: "loose_seat_cushion", confidence: 95, description: "Seat has a separate loose cushion sitting on an upholstered seat deck, rather than a fully fixed drop-in seat. The cushion is covered in the same jacquard fabric as the rest of the chair." },
    { type: "style", clue: "gadrooned_or_rope_twist_molding", confidence: 52, description: "Top rail of the chair back shows a rope-twist or gadrooned molding profile visible in the back closeup image, consistent with Louis XV revival decorative vocabulary." },
    { type: "materials", clue: "solid_wood_construction", confidence: 70, description: "Exposed carved frame members at crest, arms, seat rail, and legs appear to be solid wood (or wood with gesso overlay for carved details). No visible plywood or laminated substrate at exposed edges." },
    { type: "style", clue: "hollywood_regency_style_cue", confidence: 52, description: "The combination of cream-and-gold painted Rococo Revival frame, heavily tufted back, floral jacquard upholstery, and ornate pierced carving is consistent with Hollywood Regency or Italian Provincial style popular in American commercial furniture production c.1950s–1980s. This is a style-influence observation, not a country-of-origin claim." },
    { type: "label", clue: "visible_text", confidence: 45, description: "A 3M sandpaper/abrasive product package (3M All Purpose, grit 160) is visible on the ground in front of the chair. This is not a furniture maker mark; it is an incidental item in the scene, possibly related to restoration work in progress." },
    { type: "context", clue: "french_provincial_style", confidence: 48, description: "Rococo Revival / Louis XV style" },
    { type: "style", clue: "tufted_upholstery", confidence: 50, description: "button tufted back" },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "loose seat cushion over upholstered seat deck" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
  ],
  asSeen: {
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Lounge chair",
    display: "Hollywood Regency Lounge chair (also commonly called: Easy chair, Club chair)",
    styleContext: "Hollywood Regency",
    finalStyleKind: "unresolved",
    dateRange: "c. 1900 onward (early-to-mid 20th century or later)",
    dateFloor: 1900,
    confidence: "Low",
  },
};

const eastlake_spindle_gallery_parlor_settee: ScanFixture = {
  label: "eastlake_spindle_gallery_parlor_settee",
  note:
    "Eastlake / Aesthetic Movement Victorian parlor SETTEE (turned spindle gallery + " +
    "ball finials, fan/sunburst carved medallions, walnut; ~1870-1895). Form settee " +
    "CORRECT — armchair_form self-negated ('rather than a single armchair') and was " +
    "dropped, so settee won cleanly (lounge_chair_form 78 didn't derail). RECURS the " +
    "parlor rocker's 'Spindle Gallery' non-style fallback (n=2), with a SHARPER root " +
    "cause: the piece is saturated with Eastlake vocabulary (eastlake_hardware, " +
    "turned_spindle_gallery, carved_medallion_back, fan_sunburst_carving all cite " +
    "'Eastlake Aesthetic Movement c.1870-1895' in prose) but the ONLY Eastlake-" +
    "ATTRIBUTING clue is eastlake_hardware — and its description self-negates ('No " +
    "Eastlake hardware visible, but the ornament is Eastlake'), so it is correctly " +
    "dropped and Eastlake attribution is LOST. The Eastlake ORNAMENT clues don't " +
    "attribute the family, so style falls back to 'Spindle Gallery' (context_only). " +
    "GAP: need Eastlake/Aesthetic attribution from ORNAMENT, not just hardware. " +
    "CLOCK-DOMAIN CLUE COLLISION (n=2): turned_spindle_gallery AND scrolled_side_" +
    "corbels are both authored for Victorian shelf CLOCKS (date hints cite 'shelf " +
    "clock case' and 'flanking the dial of a shelf clock') yet fire on this settee. " +
    "MINOR: round_wood_knob fired on turned ball FINIALS ('not functional knobs') — " +
    "clue misfire, but replacement-risk-excluded from dating so benign. negated:true " +
    "on eastlake_hardware / barley_twist / button_tufting / armchair_form (all " +
    "self-negate with the canonical phrase contiguous), matching the as-seen run.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Wide upholstered seat cushion spanning the full width of the settee frame, accommodating two or more sitters." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Arched crest rail backrest with upholstered back cushion set within an open carved and turned wood frame." },
    { type: "form", clue: "armchair_form", confidence: 68, negated: true, description: "Piece has two scroll-terminal arms extending from the back frame, characteristic of a parlor settee or loveseat form rather than a single armchair." },
    { type: "style", clue: "eastlake_hardware", confidence: 52, negated: true, description: "No Eastlake hardware visible, but the overall decorative vocabulary — turned ball finials in a gallery row, incised carved ornament, geometric open fretwork, sunburst/fan medallions, and rectilinear-influenced proportions — is strongly consistent with the Eastlake Aesthetic Movement style, c. 1870–1895." },
    { type: "style", clue: "turned_spindle_gallery", confidence: 52, description: "A row of turned ball-topped spindles runs along the top of the back crest rail, a hallmark of Victorian Eastlake/Aesthetic Movement parlor seating, c. 1875–1900." },
    { type: "style", clue: "scrolled_side_corbels", confidence: 52, description: "Scroll-volute arm terminals visible at both ends of the crest rail / arm junction, consistent with Victorian parlor seating ornament." },
    { type: "style", clue: "barley_twist", confidence: 52, negated: true, description: "No barley twist turnings visible; instead, straight turned legs with reeding and ball-turned front leg tops are present." },
    { type: "structure", clue: "spindle_back", confidence: 82, description: "Open back frame incorporates multiple turned spindles in fan/sunburst arrangements within the side panels of the back, flanking the central upholstered back cushion." },
    { type: "structure", clue: "vertical_supports", confidence: 82, description: "Turned front legs visible in side view; reeded or ring-turned profile consistent with late Victorian production." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 55, description: "Frame construction of back rails, spindles, and arm posts is consistent with mortise-and-tenon joinery typical of Victorian parlor seating; no direct exposure of joint visible but construction quality and period suggest this method." },
    { type: "construction", clue: "round_tenon", confidence: 60, description: "Turned spindles in the fan/sunburst back panels are likely seated in round-tenon sockets in the rails, consistent with Victorian chair and settee construction." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Frame members appear to be solid wood throughout — crest rail, arm posts, spindles, legs, and carved elements all show solid wood profiles with no visible veneer edges or lamination." },
    { type: "materials", clue: "wood_species", confidence: 45, description: "Frame wood shows warm medium-to-dark brown coloration with subtle grain visible on flat surfaces; consistent with black walnut or a walnut-stained hardwood (possibly gumwood or birch stained to imitate walnut). Walnut was the dominant parlor seating wood in the Eastlake/Renaissance Revival era." },
    { type: "condition", clue: "refinished_surface", confidence: 45, description: "Arm post surfaces show finish wear and some loss/chipping visible in the joinery closeup image, suggesting the current finish may be aged original or a later refinish. Surface appears somewhat uniform in sheen, which could indicate a later coating." },
    { type: "condition", clue: "shellac_intact", confidence: 45, description: "Warm amber-brown surface sheen on frame members is consistent with intact or lightly refreshed shellac finish; no obvious plastic-like polyurethane build visible, though confirmation requires closer inspection." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 50, description: "Seat and back cushions are covered in a mauve/dusty rose fabric with a regular repeating fan/palmette motif in two-tone (lighter pink pattern on darker ground). The pattern complexity, machine regularity, and woven structure are consistent with a jacquard-woven upholstery fabric. Could also be a brocade; best fit is jacquard given the flat woven appearance without obvious raised supplementary weft floats." },
    { type: "upholstery", clue: "button_tufting", confidence: 50, negated: true, description: "No button tufting visible on either the seat or back cushion surfaces; upholstery appears smooth and untufted." },
    { type: "upholstery", clue: "foam_padding", confidence: 50, description: "The relatively flat, even profile of the seat cushion is consistent with modern foam padding rather than traditional horsehair or coil-spring construction; this would indicate later reupholstery." },
    { type: "style", clue: "carved_medallion_back", confidence: 52, description: "Central lower back rail features a carved foliate/acanthus medallion motif; flanking side panels have carved circular medallions with incised geometric detail — all consistent with Eastlake Aesthetic Movement ornament, c. 1870–1895." },
    { type: "style", clue: "fan_sunburst_carving", confidence: 52, description: "Fan/sunburst radiating spindle arrangements visible in both side back panels, with circular carved medallion at the base of each fan — a characteristic Eastlake/Aesthetic Movement decorative motif." },
    { type: "hardware", clue: "round_wood_knob", confidence: 62, description: "Multiple turned ball finials (sphere-topped turnings) are mounted along the top crest rail gallery and at arm post junctions — these are turned wooden ball ornaments, not functional knobs, but share the same turned-wood vocabulary." },
    { type: "condition", clue: "finish_wear_on_arms", confidence: 54, description: "Visible finish loss and surface chipping on the arm post/arm pad junction area visible in the joinery closeup; consistent with age-related wear at a high-contact zone." },
    { type: "style", clue: "arched_crest_rail", confidence: 52, description: "The crest rail of the back describes a gentle arch from side post to side post, framing the upholstered back cushion — a common Victorian parlor seating form element." },
    { type: "structure", clue: "legs", confidence: 82, description: "Front legs are turned with ring/reel profile and appear to taper toward the foot; visible in the side view image. Consistent with late Victorian parlor seating leg forms." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "woven upholstery fabric" },
    { type: "form", clue: "seating_present", confidence: 50, description: "Victorian seating" },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
  ],
  asSeen: {
    // Task A re-baseline 2026-05-28: distinctive/shared phrase gate in
    // style attribution (engineStyleEvaluator.ts) closed shared-token
    // mis-attributions. New verdict captured here.
    formId: "Settee",
    display: "Eastlake / Modern Gothic Settee (also commonly called: Settee, Small sofa)",
    styleContext: "Eastlake / Modern Gothic",
    finalStyleKind: "original_period",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

const midcentury_neoclassical_cane_lounge_chair: ScanFixture = {
  label: "midcentury_neoclassical_cane_lounge_chair",
  note:
    "Mid-century (c.1960s-70s) Hollywood Regency / neoclassical-revival LOUNGE/CLUB " +
    "chair: wood frame with machine-pressed CANE side+back panels, fluted tapered " +
    "legs, carved rosette corner blocks, velvet button-tufted cushions, foam. " +
    "CONTRAST WIN on style: 'Modern Louis XVI / French Neoclassical Reproduction' is " +
    "DEFENSIBLE here — fluted tapered legs are genuinely Louis XVI/neoclassical " +
    "(matched 'xvi','neoclassical'), unlike the Rococo settee/lounge that were Louis " +
    "XV mislabeled as XVI. So Louis XVI attribution works when the evidence is " +
    "really neoclassical (useful contrast for the #5 sub-style thread). Recurring " +
    "gaps: (1) M16 100-YEAR SPAN (n=2): working range c.1900-2000 on an obviously " +
    "1960s-70s piece — a 1900-1930 convergence (wood/upholstery/style_wave) exists " +
    "but P2 reports 'No layer convergence' and anchors the evidence-floor at 1900 " +
    "with an open ceiling -> 2000. (2) M13-class: the strongest mid-century signals " +
    "(carved_rosette_ornament '1960s-70s' [hardware], style_cues '1960s-70s' " +
    "[style]) carry no dated layer, so they never pin the date later. (3) CANE-> " +
    "WICKER OVERREACH (n=2 with HR cane wing chair): cane PANELS set in a routed " +
    "wood-frame groove trigger woven_body/cane_panels -> 'Wicker/rattan furniture' " +
    "alt-form + the 'Wicker, reed, or rattan construction...' limitation on a " +
    "WOOD-framed chair; cane_panels also dates the WOOD/substrate layer (1900-2000). " +
    "POSITIVE control (M12): visible_text + maker_label fired on ambiguous incised " +
    "corner-block marks but NO maker was hallucinated (maker_label negated via " +
    "'rather than a maker mark', conf 30). negated:true on maker_label, matching the " +
    "as-seen run.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Loose tufted seat cushion resting on a wood-framed seat platform; chair is clearly a seating form." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Chair has full arms with upholstered arm pads, cane side panels filling the arm/side area, and a barrel-curved back — consistent with a barrel-back armchair or club chair form." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Curved barrel back with cane panel and a separate loose back cushion resting against it." },
    { type: "structure", clue: "cane_panels", confidence: 82, description: "Machine-woven cane panels visible on both side panels and the back panel of the chair. Cane is set into a routed groove in the wood frame rail. Pattern is the standard hexagonal open-weave cane." },
    { type: "structure", clue: "woven_body", confidence: 82, description: "Cane weave body panels on sides and back; close-weave hexagonal pattern consistent with machine-pressed sheet cane set into a routed groove rather than hand-pegged strand cane." },
    { type: "construction", clue: "wicker_weave_close", confidence: 80, description: "Cane panel weave is tight and close with a regular hexagonal pattern; consistent with machine-pressed sheet cane common in mid-20th-century production." },
    { type: "structure", clue: "vertical_supports", confidence: 82, description: "Four tapered, fluted legs visible — front legs are square-sectioned with fluting, rear legs visible in side and back views. Legs taper toward the foot." },
    { type: "style", clue: "carved_corner_block", confidence: 52, description: "Square corner blocks at the arm-to-back-post junction carry a cast or carved floral rosette motif — a sunflower/daisy pattern in relief. Visible on both front arm corners. This is a decorative hardware or carved-wood accent consistent with neoclassical revival or Hollywood Regency styling." },
    { type: "style", clue: "style_cues", confidence: 52, description: "Combination of barrel back, fluted tapered legs, carved rosette corner blocks, cane panels, and gold striped velvet tufted cushions is consistent with Hollywood Regency or neoclassical revival styling popular in American furniture c. 1960s–1970s." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 55, description: "The square corner block at the arm-to-post junction in the joinery closeup shows a through-block construction where the arm rail meets the back post. The block geometry and the way the rail seats into it suggests mortise-and-tenon or through-tenon joinery at this junction, though the joint itself is not fully exposed." },
    { type: "materials", clue: "solid_wood_construction", confidence: 82, description: "Frame members — legs, rails, back rail, arm rails — appear to be solid wood (likely walnut or walnut-stained hardwood) based on visible grain, color, and the way the carved rosette block is rendered. No visible veneer peeling or laminate edges." },
    { type: "materials", clue: "wood_species", confidence: 55, description: "Frame is medium-to-dark brown with warm undertones. Could be black walnut, walnut-stained mahogany, or walnut-stained poplar/gumwood. Grain visible on the back rail in the back-view image shows a diffuse-porous hardwood. Species not definitively identifiable from photos alone." },
    { type: "upholstery", clue: "velvet_cover", confidence: 50, description: "Seat and back cushions are covered in a gold/olive-green striped cut-pile velvet. Upright pile is visible at angle; nap-direction shading creates the stripe pattern (alternating cut-pile direction stripes). Consistent with rayon or synthetic velvet common in 1960s–1970s American furniture. The striped pattern is created by alternating pile direction, not by woven color stripes — this is still classified as velvet_cover." },
    { type: "upholstery", clue: "button_tufting", confidence: 50, description: "Both seat and back cushions show deep regular button tufting with covered fabric buttons visible at each dimple. Buttons are covered in the same striped velvet as the cushion face. Regular grid pattern of tufting across the seat cushion; back cushion has a smaller grid of buttons." },
    { type: "upholstery", clue: "foam_padding", confidence: 50, description: "Cushion profile and the way the tufting pulls into the cushion surface is consistent with polyurethane foam fill rather than traditional spring or horsehair construction. Cushions are loose (not attached) and have a modern foam-like profile." },
    { type: "upholstery", clue: "no_spring_seat", confidence: 45, description: "The seat appears to be a loose drop-in cushion resting on the wood frame platform rather than a sprung seat. No coil spring or serpentine spring evidence visible through the cane side panels or frame." },
    { type: "condition", clue: "condition_cues", confidence: 54, description: "Wood frame shows minor surface wear and darkening at contact points. Cane panels appear intact with no visible breaks or sagging. Cushion velvet shows minor soiling and a small stain visible on the seat cushion in the closeup. Arm pad velvet shows slight fraying at one edge (visible in back view). Overall condition is good for age." },
    { type: "condition", clue: "refinished_surface", confidence: 50, description: "Wood frame finish appears relatively uniform and smooth without significant shellac crazing or deep patina. Could be original lacquer or a later refinish. No definitive evidence of stripping or sanding loss, but the finish reads as a mid-century lacquer or varnish rather than aged shellac." },
    { type: "hardware", clue: "carved_rosette_ornament", confidence: 45, description: "Cast or carved floral rosette (sunflower/daisy motif) applied to or carved into the square corner block at the front arm-to-post junction. Appears to be a separate applied metal or carved wood ornament with a central boss and radiating petals. Consistent with neoclassical revival decorative hardware c. 1960s–1970s." },
    { type: "style", clue: "fluted_legs", confidence: 52, description: "Front legs are square-sectioned with vertical fluting — a neoclassical motif associated with Louis XVI, Federal, and neoclassical revival styles. Legs taper toward the foot." },
    { type: "form", clue: "barrel_back_form", confidence: 68, description: "The back rail curves in a continuous barrel arc from one arm post to the other, visible clearly in the back-view image. This barrel-back form is characteristic of certain neoclassical and mid-century club chair designs." },
    { type: "visible_text", clue: "visible_text", confidence: 40, description: "No maker labels, stamps, stencils, or legible text visible in any of the submitted images. The joinery closeup of the corner block shows incised marks that could be a maker's stamp or assembly mark, but the characters are not clearly legible — possibly 'H' or similar letter forms incised into the wood block." },
    { type: "label", clue: "maker_label", confidence: 30, negated: true, description: "The joinery closeup of the rear arm corner block shows what appears to be incised or stamped characters on the face of the square block — possibly a maker's mark, model number, or assembly mark. Characters appear to include vertical and horizontal strokes but are not clearly legible in the image. Low confidence; could be tool marks or decorative incising rather than a maker mark." },
    { type: "context", clue: "french_provincial_style", confidence: 48, description: "Louis XVI influence" },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "small stain on seat cushion" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating" },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
    { type: "structure", clue: "barrel_tub_back", confidence: 76, description: "Textual barrel/tub/cylindrical back vocabulary on a seating form indicates barrel-back construction." },
    { type: "form", clue: "club_chair_form", confidence: 76, description: "Club-chair vocabulary with deep upholstery indicates club chair variant. Canonical: form_lounge_chair / subtype_lounge_club." },
  ],
  asSeen: {
    formId: "Lounge chair",
    display: "Modern Louis XVI / French Neoclassical Reproduction Lounge chair (also commonly called: Easy chair, Club chair)",
    styleContext: "Louis XVI / French Neoclassical",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1900–2000",
    dateFloor: 1900,
    dateCeiling: 2000,
    confidence: "Low",
  },
};

// ── Art Deco waterfall vanity — keystone for #15b (hyphenated-negation gap regex) ──
// As-seen pre-fix was c. 1860–1910 / "Art Deco vocabulary (post-1860 reproduction)" —
// thick_veneer's self-negation ("...rather than hand-sawn thick veneer") was missed
// because the W gap regex didn't traverse "hand-sawn", so its pre-1910 dateHint
// anchored a false ceiling on the wood layer. Fix shipped in Deploy 003. This fixture
// pins the post-fix verdict; if a future regression re-breaks hyphenated-negation
// detection, this is the canary.
const art_deco_waterfall_vanity: ScanFixture = {
  label: "art_deco_waterfall_vanity",
  note:
    "American Art Deco / Streamlined Moderne waterfall vanity, c. 1935-1948, " +
    "original-period — twin-pedestal kneehole vanity with rounded waterfall corners, " +
    "reeded pilasters, geometric brass-inlay center drawer, lion-head ring pulls, " +
    "walnut/gumwood veneer over plywood, machine dovetails, broken scroll corbel. " +
    "Surfacing case for #15b: thick_veneer observation self-negates in prose " +
    "(\"relatively thin and uniform... rather than hand-sawn thick veneer\") but " +
    "the negation detector's gap regex (W = `(?:\\w+\\s+){0,3}`) failed on " +
    "\"hand-sawn\" because `\\w+` doesn't cross hyphens. Fix widens W to " +
    "`[\\w-]+\\s+`. Pre-fix verdict: c. 1860-1910 / reproduction. Post-fix verdict " +
    "encoded in asSeen below.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "flat_surface", confidence: 68, description: "Flat writing/vanity surface visible on top of the kneehole desk with raised back gallery rail." },
    { type: "form", clue: "drawer_present", confidence: 68, description: "Multiple drawers visible: one upper center drawer, two drawers per pedestal side (four total pedestal drawers), plus lower drawers with horizontal bar pulls. Consistent with kneehole desk form." },
    { type: "form", clue: "multiple_drawer_case", confidence: 68, description: "Two pedestal banks each containing at least two drawers, plus a center drawer, totaling five or more drawers in a kneehole desk configuration." },
    { type: "style", clue: "style_cue_art_deco", confidence: 52, description: "Strongly rounded waterfall corners on pedestal tops and sides, reeded pilaster columns flanking pedestals, stepped molding profiles, geometric diamond/lattice brass inlay accents on center drawer front, and overall streamlined horizontal emphasis are canonical Art Deco / Streamlined Moderne design vocabulary, c. 1925–1945." },
    { type: "style", clue: "style_cue_waterfall_corners", confidence: 52, description: "Rounded waterfall-style corners on pedestal tops and outer edges — a defining Streamlined Moderne / Art Deco furniture feature common in American factory production c. 1930–1945." },
    { type: "style", clue: "style_cue_reeded_pilasters", confidence: 52, description: "Vertical reeded (multi-groove) pilaster columns visible flanking the outer edges of both pedestals, a decorative motif common in Art Deco and late Colonial Revival furniture c. 1925–1945." },
    { type: "style", clue: "style_cue_carved_scroll_corbels", confidence: 52, description: "Carved scroll/volute corbels with rosette/wheel motif visible at the base of each pedestal outer corner — decorative carved feet with scroll and circular carved detail, consistent with Art Deco or late Empire Revival ornament." },
    { type: "hardware", clue: "ring_pull", confidence: 62, description: "Cast brass lion-head ring pulls on upper pedestal drawers. Lion-head with suspended ring is a classical motif associated with Empire Revival, Colonial Revival, and Art Deco furniture hardware. Visible verdigris patina on the cast brass head indicates age-consistent oxidation." },
    { type: "hardware", clue: "cast_escutcheon", confidence: 62, description: "Lion-head backplate is cast brass with detailed relief modeling of mane, face, and ring mount — cast hardware rather than stamped, consistent with quality production hardware." },
    { type: "condition", clue: "hardware_verdigris_patina", confidence: 54, description: "Green verdigris oxidation visible on the cast brass lion-head pull, indicating genuine age-consistent patina on brass hardware rather than new reproduction hardware." },
    { type: "construction", clue: "machine_dovetails", confidence: 80, description: "Drawer corner joinery visible in open drawer closeup shows uniform, evenly-spaced dovetail pins and tails consistent with machine-cut dovetails. Spacing and geometry appear repetitive and mechanically precise rather than hand-cut irregular." },
    { type: "construction", clue: "factory_case_construction", confidence: 85, description: "Back panel view shows plywood or thin panel construction on case back with visible layered edges; secondary wood drawer sides are lighter-colored softwood or poplar consistent with factory production. Construction prioritizes speed and material economy." },
    { type: "materials", clue: "possible_plywood_or_laminated_panel", confidence: 85, hard_negative: true, description: "Back panel visible in rear view shows thin panel construction with what appears to be plywood or hardboard sheet back panels on the case. Layered edge visible at case back opening." },
    { type: "materials", clue: "thick_veneer", confidence: 45, description: "Veneer on show surfaces (drawer fronts, pedestal sides, top) appears to be factory-applied rotary-cut or plain-sliced veneer over a substrate. Veneer appears relatively thin and uniform, consistent with factory production rather than hand-sawn thick veneer." },
    { type: "materials", clue: "wood_species_identification", confidence: 45, description: "Show surfaces display warm brown coloration with subtle figure. The grain pattern on drawer fronts and pedestal sides shows broad cathedral-like figure consistent with flat-sawn walnut veneer or gumwood stained dark. Hardware closeup shows open straight grain on the drawer face suggesting possible walnut or stained gumwood. Secondary wood on drawer sides appears to be a lighter-colored wood (poplar or basswood)." },
    { type: "construction", clue: "sheet_back_panel", confidence: 82, description: "Rear view shows thin sheet back panels on both pedestal cases, consistent with factory production using plywood or hardboard back panels rather than solid plank backs." },
    { type: "condition", clue: "surface_wear", confidence: 54, description: "Top surface shows significant wear, scratches, water staining, and finish degradation. Veneer surface on top is heavily worn with dark staining and surface crazing/checking visible." },
    { type: "condition", clue: "shellac_crazing", confidence: 54, description: "Top surface shows fine network of finish crazing/checking consistent with aged shellac or early lacquer finish degradation. The craze pattern and darkening are consistent with original finish aging rather than polyurethane." },
    { type: "condition", clue: "veneer_damage", confidence: 54, description: "Veneer lifting and edge damage visible at multiple locations including top edges and pedestal corners. Some veneer loss visible at wear points." },
    { type: "condition", clue: "carved_foot_damage", confidence: 54, description: "Carved scroll corbel foot at lower pedestal corner shows breakage/damage — the carved scroll element is partially broken away from the base, with raw wood exposed at the break." },
    { type: "label", clue: "visible_text", confidence: 45, description: "Back panel shows chalk or pencil markings '300' on left pedestal back and what appears to be 'mm' or similar notation — likely factory batch/inventory/shipping marks rather than maker attribution. Insufficient for maker identification." },
    { type: "structure", clue: "kneehole_opening", confidence: 82, description: "Central kneehole opening between two pedestal banks with shaped apron/bracket above the opening featuring ogee or cyma-recta profile cutout — characteristic kneehole desk form." },
    { type: "structure", clue: "raised_back_gallery", confidence: 82, description: "A raised back rail/gallery is visible at the rear of the top surface, slightly elevated above the main writing surface — common on vanity desks and dressing tables of this era." },
    { type: "style", clue: "style_cue_geometric_brass_inlay", confidence: 52, description: "Two vertical rectangular panels with geometric diamond/lattice brass or gilt inlay decoration visible on the center drawer front — a characteristic Art Deco decorative accent motif, c. 1925–1945." },
    { type: "hardware", clue: "horizontal_bar_pull", confidence: 62, description: "Lower drawers on both pedestals have horizontal carved/applied bar pulls with geometric incised decoration — a simpler pull type consistent with Art Deco / Streamlined Moderne production hardware." },
    { type: "construction", clue: "secondary_wood_drawer_sides", confidence: 72, description: "Drawer sides visible in open drawer closeup are a pale, light-colored secondary wood — consistent with poplar or basswood used as secondary structural wood in factory case production of this era." },
    { type: "materials", clue: "veneer_substrate", confidence: 84, description: "Show surfaces on pedestal sides, drawer fronts, and top appear to be veneered over a substrate (likely plywood or solid secondary wood core). The grain pattern on the curved waterfall corners suggests bent or shaped substrate with veneer applied over it." },
    { type: "form", clue: "writing_surface", confidence: 68, description: "Flat top surface functions as a writing or vanity surface. The raised back gallery and kneehole configuration are consistent with either a writing desk or a vanity/dressing table." },
    { type: "condition", clue: "overall_condition", confidence: 54, description: "Overall condition is fair. Significant surface wear on top, veneer damage at edges and corners, broken carved foot element, hardware patina/verdigris, and finish degradation throughout. Structurally appears intact but cosmetically requires restoration work." },
    { type: "structure", clue: "backrest_present", confidence: 78, description: "A backrest or back rail is visible." },
    { type: "form", clue: "pedestal_column", confidence: 84, description: "Single-column pedestal form is visible." },
  ],
  asSeen: {
    // Post-#15b verdict (Deploy 003). The fix moved the dating +25 years toward
    // the true Art Deco window (was c. 1860–1910/reproduction pre-fix) and flipped
    // finalStyleKind from "reproduction" to "revival_wave". Still not at the ideal
    // original-period c. 1925–1945 because ring_pull (c.1840–1900) and
    // shellac_crazing (1800–1920) library dates drag the floor — same family as
    // #15a (clue library calibration for 20th-c usage), tracked separately.
    formId: "Converted dressing table desk",
    display: "High Art Deco Converted dressing table desk (also commonly called: Converted dressing table desk, Converted vanity desk)",
    styleContext: "Art Deco",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1880–1935",
    dateFloor: 1880,
    dateCeiling: 1935,
    confidence: "Moderate",
  },
};

const knight_garrard_french_provincial_radio_phonograph_console: ScanFixture = {
  label: "knight_garrard_french_provincial_radio_phonograph_console",
  note: "S018 mid-1950s American console radio-phonograph (KNIGHT amp + GARRARD RC80 1952-1958 + AM/FM KC/MC pre-1975 + 6-8 vacuum tubes pre-1960 + 1950s French Provincial cabinet vocab). Header date c. 1920-1980 is the CONVERGENCE-ZONE WIDTH, not the engine's frame_floor/ceiling 1975-1980 — and 1975-1980 itself is wrong. Two failures stack: (M9) GARRARD RC80 1952-1958 explicit-date prose in the label description never extracted to date_floor/ceiling, and (M11) art_deco_hardware → style_family_art_deco conf 0.92 by matched_terms ['art','deco'] → 1970s Deco Revival wave 1970-1985 anchored late. The post-1964 'Made in England' TPQ from maker_mark_authored_england is also being applied piece-wide rather than to the English chassis only. New: M12 — P2 'Frame range' string (1920-1980) is wider than the engine's own frame_floor/ceiling (1975-1980); the broader convergence-zone string surfaces in the header.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "label", clue: "maker_label", confidence: 88, description: "The radio tuner dial clearly reads 'KNIGHT' — a house brand sold by Allied Radio Corporation of Chicago. This identifies the radio/amplifier chassis brand." },
    { type: "label", clue: "maker_label", confidence: 88, description: "Metal identification plate on turntable chassis reads 'GARRARD / Automatic Record Changer / Model R.C. 80. / Schedule No. 48600 / MADE IN ENGLAND'. Garrard Engineering and Manufacturing Co. Ltd., Swindon, England. The RC80 was produced approximately 1952–1958, supporting a mid-1950s date for the electronics." },
    { type: "function", clue: "mechanical_function", confidence: 70, description: "This is a console radio-phonograph combination unit: AM/FM radio tuner with vacuum tube amplifier chassis and Garrard automatic record changer integrated into a wooden cabinet." },
    { type: "form", clue: "door_present", confidence: 68, description: "Two hinged doors on the lower cabinet section open to reveal the speaker grille. Doors are flat panel construction with round wooden knob pulls." },
    { type: "form", clue: "drop_front_desk", confidence: 68, description: "The upper section has a drop-front hinged lid that opens forward and downward to reveal the turntable and radio controls. Support arms (visible as metal rods) hold the lid horizontal when open. This is the defining access mechanism for the electronics compartment." },
    { type: "style", clue: "cabriole_leg", confidence: 52, description: "The lower cabinet rests on four cabriole-style legs with pad feet, visible at the base corners. This French Provincial styling detail is common on mid-century console furniture of the 1950s." },
    { type: "style", clue: "scalloped_apron", confidence: 52, description: "A shaped/scalloped apron rail is visible between the lower cabinet base and the feet, consistent with French Provincial or traditional mid-century styling." },
    { type: "materials", clue: "wood_species_walnut_group", confidence: 65, description: "The cabinet surfaces show warm reddish-brown wood with fine straight grain consistent with walnut or mahogany veneer over a plywood or solid wood substrate. The color and grain pattern are consistent with either species; definitive identification requires closer examination." },
    { type: "construction", clue: "plywood_structural", confidence: 70, description: "The side panel visible in the overall_side image shows a smooth, consistent surface with no visible solid-wood grain variation, suggesting veneer over plywood substrate. The back panel is hardboard. This is consistent with mid-century factory cabinet construction." },
    { type: "construction", clue: "sheet_back_panel", confidence: 95, description: "The back of the cabinet is covered with a dark hardboard panel (visible in back image), consistent with mid-century factory production. The panel is torn/damaged in the lower section, revealing the interior." },
    { type: "hardware", clue: "round_wood_knob", confidence: 62, description: "Two round turned wooden knobs are visible on the drawer/shelf divider between the upper electronics compartment and the lower speaker cabinet. These are simple turned wood pulls consistent with mid-century production." },
    { type: "condition", clue: "refinished_surface", confidence: 45, description: "The top surface shows scratches and wear marks visible in the overall_side image. The finish appears to be an original lacquer or shellac with age-consistent wear rather than a modern refinish. Some areas show finish loss." },
    { type: "condition", clue: "lacquer_finish", confidence: 54, description: "The cabinet surfaces show a smooth, moderately glossy finish consistent with nitrocellulose lacquer, common on mid-century American furniture and radio cabinets. The warm amber tone and surface behavior suggest lacquer rather than polyurethane." },
    { type: "hardware", clue: "vacuum_tubes_visible", confidence: 62, description: "Multiple vacuum tubes are clearly visible in the open back of the chassis (back image). Approximately 6–8 tubes of varying sizes are visible, confirming this is a tube-type (valve) amplifier/receiver, consistent with pre-transistor era electronics (pre-1960s dominant)." },
    { type: "label", clue: "visible_text", confidence: 85, description: "The radio dial shows both AM (in kilocycles/KC) and FM (in megacycles/MC) bands. The use of 'KC' and 'MC' rather than 'kHz' and 'MHz' is consistent with pre-1975 American radio nomenclature. FM coverage 88–108 MC is the standard US FM broadcast band established in 1945." },
    { type: "style", clue: "art_deco_hardware", confidence: 52, description: "The radio tuner dial bezel has a stepped/molded frame with Art Deco geometric styling, consistent with late 1940s–early 1950s American radio design vocabulary. The overall cabinet styling is more traditional/French Provincial." },
    { type: "function", clue: "speaker_grille", confidence: 70, description: "The lower cabinet section contains a large speaker grille covered with green woven/textured fabric in a diamond/ogee pattern. This is the speaker enclosure for the console system. The green color and ogee-pattern weave are characteristic of mid-century American console furniture." },
    { type: "label", clue: "turntable_instruction_plate", confidence: 85, description: "A brass metal instruction plate is visible on the turntable chassis reading 'INSTRUCTIONS / SETTING: SET SPEED / PLATFORM PICK-UP / USE CORRECT RECORD SPINDLE / OPERATION: PLACE UP TO 10 RECORDS ON RECORD SPINDLE AND SWITCH ON / FOR DETAILED INSTRUCTIONS SEE SERVICE MANUAL'. This confirms automatic record changer functionality." },
    { type: "hardware", clue: "speed_selector_45", confidence: 62, description: "The Garrard RC80 speed selector plate shows '45' RPM setting visible, confirming this changer supports 45 RPM records (introduced 1949 by RCA Victor), providing a post-1949 terminus post quem for the turntable." },
    { type: "construction", clue: "frame_and_panel_sides", confidence: 65, description: "The lower cabinet doors appear to be flat panel construction within a molded frame. The overall cabinet construction uses frame members with panel infill, consistent with mid-century factory case construction." },
    { type: "condition", clue: "condition_overall", confidence: 54, description: "The cabinet shows age-consistent wear: surface scratches on top, dust accumulation, finish wear on the drop-front lid surface, torn hardboard back panel, and loose wiring visible at the back. The vacuum tube chassis appears intact but electrical safety should be evaluated before use." },
    { type: "construction", clue: "height_measurement", confidence: 90, description: "A tape measure in the overall_side image shows the cabinet height reaching approximately 44 inches at the top, providing a dimensional reference for the piece." },
    { type: "style", clue: "french_provincial_influence", confidence: 52, description: "The cabinet combines cabriole feet, scalloped apron, and molded edge profiles characteristic of French Provincial styling popular in American furniture of the 1950s. This is a design influence, not a French-made piece — domestic American commercial production of this style was widespread." },
    { type: "hardware", clue: "control_knobs_bakelite", confidence: 62, description: "Five black control knobs are visible on the radio/amplifier panel to the right of the tuner dial. These appear to be black bakelite or phenolic resin knobs, consistent with mid-century American electronics production." },
    { type: "construction", clue: "support_arm_hardware", confidence: 95, description: "Two metal support arms (visible as silver/chrome rods) are attached to the drop-front lid and the cabinet sides to hold the lid open horizontally when in use. These are functional hardware elements specific to console phonograph cabinet design." },
    { type: "context", clue: "french_provincial_style", confidence: 48, description: "French Provincial influenced cabriole feet" },
    { type: "structure", clue: "spindle_back", confidence: 78, description: "Spindles are visible in the back or side rail." },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
    { type: "construction", clue: "drawer_present", confidence: 58, description: "Drawer evidence is visible." },
    { type: "form", clue: "cabinet_form", confidence: 68, description: "Cabinet or cupboard form is visible." },
    { type: "label", clue: "maker_mark_authored_england", confidence: 70, description: "Detected maker mark: England. Mark type: paper_label. Dating reference: post-1964. Confidence tier: MEDIUM." },
  ],
  asSeen: {
    formId: "Media console",
    display: "1970s Deco Revival Media console (also commonly called: Media console, Entertainment console)",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1920–1980",
    dateFloor: 1975,
    dateCeiling: 1980,
    confidence: "High",
  },
};

const us_stamping_commode_chamber_pot_rescan: ScanFixture = {
  label: "us_stamping_commode_chamber_pot_rescan",
  note: "S019 re-rescan of the S017 Victorian close-stool commode (U.S. Stamping Co. Moundsville WV enameled basin label; same physical piece as commode_close_stool fixture). PROGRESS vs S017 original (which called it 'MODERNIST / chrome-frame Stool'): form is now CORRECTLY form_commode and the metal-FP material clues are gone — Fixes #1/#2 confirmed sticking on this piece. REMAINING: (M9, 3rd specimen with S009/S018) U.S. Stamping Co. label description literally says 'producing enameled ware c. 1890s-1930s' — wt 0.98 — but no extractor pulls the 1890s-1930s window into date_floor/ceiling. (M5 recurring) victorian_utilitarian_form clue carries 'c. 1870-1910' and 'c. 1860-1910' in its own description but is bucketed [style] @ wt 0.37 with 0 dating authority. (Fix #10 still open) the spurious DEFAULT 'American Empire / late Classical Revival' style label persists at kind=context_only — same canned label pattern documented under cross-cutting fix #10. Dev branch reproduces the live deploy's output exactly (FIDELITY ✓).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "lift_lid", confidence: 68, description: "The top is a hinged lift-lid construction, opening to reveal the interior seat board with circular cutout. Two-part lid visible from side view showing hinge line." },
    { type: "function", clue: "commode_chamber_pot_stand", confidence: 70, description: "Piece is a Victorian-era bedside commode / close stool. Interior has a circular cutout seat board holding an enameled steel basin (chamber pot). Lift-lid top conceals the basin when closed." },
    { type: "form", clue: "seating_surface", confidence: 68, description: "Interior seat board with circular cutout functions as a commode seat surface when lid is open." },
    { type: "structure", clue: "vertical_supports", confidence: 82, description: "Four turned corner posts visible, extending above the case top as finials and below as turned bun feet. Posts appear to be solid turned hardwood." },
    { type: "structure", clue: "bun_feet", confidence: 82, description: "Four turned bun feet visible at base of corner posts, with disc-and-ball turning profile typical of Victorian utilitarian furniture c. 1860-1910." },
    { type: "style", clue: "turned_finial_posts", confidence: 52, description: "Corner posts extend above the case top as turned finials with a spool/bobbin profile. Visible from underside image showing all four finial tops with central screw holes." },
    { type: "materials", clue: "wood_species_oak_group", confidence: 45, description: "Primary case panels show open grain with cathedral figure consistent with flat-sawn oak or possibly walnut. The warm reddish-brown color and grain pattern on side panels suggest oak; the darker corner posts may be walnut or stained oak. Provisional identification pending closer examination." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Case panels appear to be solid wood boards, not veneered panels. Visible grain continuity and board-edge thickness at corners support solid wood construction." },
    { type: "hardware", clue: "butt_hinge", confidence: 62, description: "Two brass butt hinges visible attaching the lid to the case back. Hinges show tarnish and age-consistent patina. Appear to be machine-made butt hinges." },
    { type: "hardware", clue: "machine_made_hinge", confidence: 62, description: "Brass butt hinges show uniform edges and precision barrel construction consistent with machine-made hardware, post-1840." },
    { type: "hardware", clue: "slotted_screw", confidence: 62, description: "Hinge screws visible in hardware closeup show single-slot heads consistent with slotted wood screws. No Phillips-head screws observed." },
    { type: "hardware", clue: "stamped_metal_bracket", confidence: 45, description: "A rectangular brass latch/catch plate is visible on the interior lid surface above the hinges. Appears to be a stamped brass lid catch or lid support bracket, secured with slotted screws." },
    { type: "label", clue: "maker_label", confidence: 85, description: "Shield-shaped foil/paper label on the enameled basin reads: 'U.S. Standard / Enameled Ware / United States Stamping Co. / Moundsville / W. Va.' This is the maker label for the enameled steel basin insert, NOT the wooden commode case. United States Stamping Co. was active in Moundsville, WV producing enameled ware c. 1890s-1930s." },
    { type: "materials", clue: "enameled_steel_basin", confidence: 84, description: "White enameled steel basin (chamber pot / commode basin) sits in the circular cutout of the seat board. Basin has a dark blue rim edge and smooth white enamel interior. Labeled as U.S. Standard Enameled Ware by United States Stamping Co., Moundsville, WV." },
    { type: "condition", clue: "lid_split_crack", confidence: 54, description: "The two-board lid shows a significant crack/split along the board joint, visible in both overall_side and joinery_closeup images. The split runs the full length of the lid joint." },
    { type: "condition", clue: "surface_wear_scratches", confidence: 54, description: "Top surface shows numerous scratches and wear marks consistent with age and use. Finish is worn but intact in most areas." },
    { type: "condition", clue: "shellac_intact", confidence: 45, description: "Surface finish appears to be an aged oil or shellac finish showing warm amber tone, wear at edges and high-contact areas, and no plastic-like film. Consistent with original or early-restored shellac or oil finish. No polyurethane characteristics observed." },
    { type: "construction", clue: "frame_and_panel_sides", confidence: 80, description: "Case sides appear to be frame-and-panel construction: corner posts serve as stiles, with horizontal rails top and bottom, and a floating or fixed panel filling the center. Visible in both front and side views." },
    { type: "construction", clue: "circular_cutout_seat_board", confidence: 45, description: "Interior seat board has a large circular cutout to accept the enameled basin. The cutout appears to have been made with a jigsaw or similar tool. The seat board is two-piece (split along center) allowing removal of the basin." },
    { type: "construction", clue: "two_board_lid", confidence: 95, description: "The hinged lid is constructed from two boards joined edge-to-edge, visible from the side view and the crack that has developed along the joint. Molded edge profile on the top perimeter." },
    { type: "style", clue: "molded_top_edge", confidence: 52, description: "The lid/top has a simple rounded or ogee molded edge profile visible at the front and side corners, consistent with Victorian utilitarian furniture." },
    { type: "construction", clue: "corner_post_finial_screw_holes", confidence: 88, description: "Underside view shows all four corner post finial tops with visible central holes, suggesting the finials are attached via a central screw or dowel to the corner posts." },
    { type: "form", clue: "multiple_drawer_case", confidence: 68, description: "The enclosed case below the seat board provides enclosed storage space, typical of Victorian commode/close stool design where the chamber pot is stored inside when not in use." },
    { type: "visible_text", clue: "visible_text", confidence: 45, description: "Full text visible on shield-shaped label on the enameled basin. Shield design with gold lettering on dark background. Blank oval field in center (possibly for model/size designation)." },
    { type: "condition", clue: "hardware_tarnish", confidence: 54, description: "Brass hinges and latch plate show significant tarnish and oxidation consistent with age. No bright polished brass visible; patina appears original and unrestored." },
    { type: "style", clue: "victorian_utilitarian_form", confidence: 52, description: "Overall form — rectilinear case with turned corner posts and bun feet, lift-lid top, enclosed chamber pot storage — is consistent with Victorian-era bedside commode / close stool production, c. 1870-1910." },
    { type: "form", clue: "seating_present", confidence: 78, description: "Integrated seating is visible." },
    { type: "construction", clue: "drawer_present", confidence: 58, description: "Drawer evidence is visible." },
  ],
  asSeen: {
    formId: "Commode (close stool)",
    display: "Commode (close stool) (also commonly called: close stool, chamber-pot commode)",
    styleContext: "American Empire / late Classical Revival",
    finalStyleKind: "context_only",
    dateRange: "late 19th to early 20th century",
    dateFloor: 1900,
    dateCeiling: 1930,
    confidence: "Moderate",
  },
};

export const SESSION_SCANS: ScanFixture[] = [ladderback, victorianTrunk, sears1960sDresser, victorian_windsor_rocker, commode_close_stool, art_deco_candelabrum, renaissance_revival_sgabello, china_import_cedar_chest, swivit_space_age_pedestal_chair, colonial_revival_oak_bowfront_chest, vernacular_painted_milking_stool, golden_oak_curved_glass_china_cabinet, logan_1914_tall_case_clock, oak_swivel_bankers_office_chair, jacobean_revival_tall_case_clock, midcentury_craft_panel_back_rocker, william_mary_burl_escritoire_on_stand, peacock_emmanuelle_rattan_chair, woodard_wrought_iron_patio_chair, barley_twist_rush_seat_rocker, biedermeier_flame_walnut_secretary, phoenix_chair_co_windsor_rocker, rococo_revival_parlor_armchair, hollywood_regency_cane_wing_chair, victorian_barrel_back_parlor_chair, eastlake_oak_settee, rococo_renaissance_carved_settee, porter_balloon_canopy_chair, renaissance_revival_tufted_armchair, victorian_platform_rocker_armchair, modern_louis_xvi_repro_lounge_chair, eastlake_renaissance_revival_rocker, wicker_rattan_barrel_lounge_chair, french_bistro_iron_faux_stone_table, painted_gilt_rococo_revival_settee, victorian_spindle_gallery_parlor_rocker, hollywood_regency_rococo_lounge_chair, eastlake_spindle_gallery_parlor_settee, midcentury_neoclassical_cane_lounge_chair, art_deco_waterfall_vanity, knight_garrard_french_provincial_radio_phonograph_console, us_stamping_commode_chamber_pot_rescan];
