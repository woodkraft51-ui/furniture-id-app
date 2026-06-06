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
  // separate downstream root cause (style cues don't anchor dating). RESOLVED by the
  // last-resort dating path: with no qualifying convergence and style-prose blocked
  // by the brass joinery layer, the near-miss Art Deco zone (1925–1945) is now
  // reported at Low confidence with an explicit basis. asSeen reflects the fix; the
  // 1940 floor is the pre-existing downstream "phantom floor" quirk (range still 1925–1945).
  asSeen: {
    formId: "Candelabrum",
    display: "Art Deco Candelabrum (also commonly called: Candelabrum, Candelabra)",
    finalStyleKind: "original_period",
    dateRange: "c. 1925–1945",
    dateFloor: 1940,
    dateCeiling: 1945,
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
    finalStyleKind: "original_period",
    dateRange: "c. 1860–1885",
    dateFloor: 1860,
    dateCeiling: 1885,
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
    // Post-Fix2: TPQ floor was the maker-window FLOOR (founding 1933).
    // M9 fix (2026-05-29): "post-1940s cedar chest hardware" prose in the
    // stamped_metal_bracket description is now extracted as an explicit
    // terminus-post-quem FLOOR via parseLabelDate's expanded decade-suffix
    // FLOOR pattern, pushing the floor 1933→1940. Ceiling 2005 unchanged
    // (still the maker-window end). Date string unchanged.
    dateFloor: 1940,
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
    formId: "Tall case clock",
    display: "Tall case clock (also commonly called: Tall case clock, Longcase clock)",
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
    formId: "Tall case clock",
    display: "Tudor Revival / Jacobean Revival / Elizabethan Revival Tall case clock (also commonly called: Tall case clock, Longcase clock)",
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
    formId: "Upholstered armchair",
    display: "Lloyd Flanders Upholstered armchair (also commonly called: Arm chair, Easy chair)",
    finalStyleKind: "context_only",
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
  note: "S018 mid-1950s American console radio-phonograph (KNIGHT amp + GARRARD RC80 1952-1958 + AM/FM KC/MC pre-1975 + 6-8 vacuum tubes pre-1960 + 1950s French Provincial cabinet vocab). M9 fix LANDED (2026-05-29): parseLabelDate now (a) recognizes 'produced YYYY-YYYY' as a PRODUCTION WINDOW (floor+ceiling both anchored), (b) reads 'pre-YYYY' as a terminus-ANTE-quem CEILING not a misparsed FLOOR. Garrard 'produced approximately 1952-1958' now anchors floor 1952 / ceil 1958 / conf High; pre-1975 nomenclature now caps ceiling at 1975 (compatible with the tighter Garrard window). Date narrowed from c. 1920-1980 (60-yr window, M11+M12 stack) → c. 1952-1958. Style kind correctly flipped from revival_wave '1970s Deco Revival' (wrong era) to late_period 'Art Deco (late-period production)' (correct: 1950s was the tail-end of original-period Art Deco production). M11 art_deco_hardware → Art Deco family attribution still fires but no longer mis-anchors via the 1970-1985 revival wave (the 1952 production date is incompatible). M12 header-display-range bug is no longer visible on this piece because the frame range string matches floor/ceiling now. Open: maker_mark_authored_england post-1964 sub-component TPQ scoping (the English chassis label is being applied piece-wide; tracked at n=2 with S019). Original failure stack documented for archaeology: header was the convergence-zone width 1920-1980; floor 1975 came from parseLabelDate misparsing 'pre-1975' as a TPQ floor.",
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
    // M9 fix (2026-05-29) landed: the GARRARD RC80 "produced approximately
    // 1952-1958" description now anchors as a production WINDOW (floor 1952,
    // ceiling 1958, conf High), AND the visible_text "pre-1975 American radio
    // nomenclature" is now correctly interpreted as a terminus-ANTE-quem ceiling
    // (1975) rather than a misparsed terminus-post-quem floor that drove the
    // original 1975 anchor. Style kind now resolves to late_period "Art Deco
    // (late-period production)" because the 1952 production date no longer
    // aligns with the 1970-1985 revival wave; the engine correctly identifies
    // this as the tail end of original-period Art Deco production rather than
    // a 1970s revival. Date narrowed from a 60-yr window (c. 1920-1980) to a
    // 6-yr window (c. 1952-1958) — the M9 fix's intended outcome on this piece.
    display: "Art Deco (late-period production) Media console (also commonly called: Media console, Entertainment console)",
    styleContext: "Art Deco",
    finalStyleKind: "late_period",
    dateRange: "c. 1952–1958",
    dateFloor: 1952,
    dateCeiling: 1958,
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

const federal_colonial_revival_mahogany_music_stand: ScanFixture = {
  label: "federal_colonial_revival_mahogany_music_stand",
  note: "S020 mahogany tripod music stand with turned pedestal column + cabriole-influenced legs + machine-made brass butt hinges + lacquer finish — anatomy reads as a 20th-c Colonial Revival or Federal-influenced reproduction (c. 1920-1970 per colonial_revival_style_cue's own description). Engine reported 'Hollywood Regency / Neoclassical Glamour Adaptation Music stand' c. 1920-1980 Moderate. M11 specimen #4 (joining S015/S016/S018): Federal/Adam/Hepplewhite/Sheraton family attributed at conf 0.70 with matched_terms=['federal'] — a SINGLE prose-scraped token from turned_column_pedestal's 'Federal, Regency, or Colonial Revival turning traditions' and cabriole_leg's 'Federal/Regency or Colonial Revival tripod stand forms'. Neither clue KEY contains 'federal'. The correct Colonial Revival attribution sits at conf 0.55 with TWO clue-key-sourced tokens (colonial_revival_style_cue → 'colonial' + 'revival') but loses to the prose-derived single token. Federal's 1780-1840 bounds then intersect with style waves to anchor the Hollywood Regency 1930-1970 revival wave as the final label. NEW signal for M11 scope-out: 'supported':true fires on the prose-only match — the existing prose-vs-clue-key supported-flag gate may be leaking. Also: the M11 probe Option B (hasHardLayerDate suppression of revival_wave) would NOT have caught this — finish (1920-1980 lacquer) + hardware (post-1840 hinges) both contributed dates, so hasHardLayerDate=true. Suggests Option B needs a TIGHTNESS check (open-ended or 60-yr-wide hard layers shouldn't qualify as 'hard enough' to validate a revival wave anchor). M5 also present: colonial_revival_style_cue's 'c. 1920-1970' window is in description prose but the [style] bucket @ wt 0.37 contributes 0 to dating overlap.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "flat_surface", confidence: 68, description: "Square flat platform/tray top serves as the base for the adjustable reading surface; approximately 12-14 inches square." },
    { type: "form", clue: "writing_surface", confidence: 68, description: "Hinged angled panel functions as a reading/writing or music stand surface; tilts upward from the flat platform base at an adjustable angle." },
    { type: "form", clue: "pedestal_column", confidence: 68, description: "Single turned pedestal column supports the platform top; column features vase-and-ring turning with a compressed ball element near the base transition to the tripod." },
    { type: "structure", clue: "tripod_base", confidence: 82, description: "Three splayed legs radiate from the base of the turned column; legs are cabriole-influenced with outward splay and appear to terminate in small pad or snake feet." },
    { type: "style", clue: "cabriole_leg", confidence: 45, description: "Tripod legs show a gentle outward curve reminiscent of cabriole form with pad-like feet; not full cabriole but influenced by that tradition. Consistent with Federal/Regency or Colonial Revival tripod stand forms." },
    { type: "function", clue: "reading_stand_form", confidence: 70, description: "The piece is a reading/book/music stand: hinged angled top panel lifts to present reading surface at an angle; shaped scalloped side retaining boards prevent book or sheet music from sliding off; small ledge at bottom of angled surface provides additional support." },
    { type: "hardware", clue: "butt_hinge", confidence: 62, description: "Brass butt hinges visible at the junction between the angled reading panel and the flat platform base; at least two hinges visible, appear to be machine-made brass butt hinges with uniform leaves." },
    { type: "hardware", clue: "machine_made_hinge", confidence: 62, description: "Brass hinges appear uniform and machine-made with consistent barrel and leaf geometry; no visible hand-forged irregularity." },
    { type: "style", clue: "turned_column_pedestal", confidence: 52, description: "Turned pedestal column shows vase-and-ring turning profile with a compressed ball/collar element near the base; consistent with Federal, Regency, or Colonial Revival turning traditions." },
    { type: "materials", clue: "solid_wood_construction", confidence: 80, description: "All visible components appear to be solid wood; column, platform, angled panel, and side supports show consistent wood grain and color. No visible veneer edges or substrate layers at exposed edges." },
    { type: "materials", clue: "mahogany_species", confidence: 60, description: "Wood color is deep reddish-brown with warm undertones consistent with mahogany (Honduran or similar); fine even texture visible on flat surfaces. Could also be cherry or stained gumwood/birch, but mahogany coloration and sheen are most consistent." },
    { type: "finish", clue: "lacquer_finish", confidence: 55, description: "Exterior surfaces show a smooth, hard, glossy finish with high reflectivity and uniform sheen; consistent with lacquer or polyurethane rather than shellac. No visible crazing or amber shellac character." },
    { type: "finish", clue: "refinished_surface", confidence: 45, description: "The exterior finish appears very uniform and glossy, possibly indicating a later refinish or factory lacquer application. Interior reading surface shows wear and finish loss inconsistent with the pristine exterior, suggesting the exterior may have been refinished or the piece is a later production with factory finish." },
    { type: "condition", clue: "finish_wear_interior", confidence: 54, description: "Interior reading surface (the underside of the angled panel and the platform base) shows visible finish wear, scratches, and some finish loss consistent with use; more worn than the exterior surfaces." },
    { type: "structure", clue: "scalloped_side_supports", confidence: 82, description: "Shaped/scalloped side retaining boards are attached to the platform on both sides; these have a decorative ogee or S-curve profile cut into their upper edges, functioning to retain a book or sheet music on the angled surface." },
    { type: "structure", clue: "book_ledge", confidence: 82, description: "A narrow ledge or lip is visible at the lower edge of the angled reading surface to prevent books or sheet music from sliding off; visible in side and back views." },
    { type: "style", clue: "colonial_revival_style_cue", confidence: 52, description: "Overall form — turned pedestal column, tripod splayed legs, mahogany-colored wood, brass hardware — is consistent with Colonial Revival or Federal-influenced reproduction production, commonly made c. 1920-1970 in American furniture." },
    { type: "construction", clue: "hinged_top_panel", confidence: 96, description: "The angled reading surface is attached to the flat platform base via brass butt hinges, allowing the angle to be adjusted or the panel to lie flat; this is the primary mechanical feature of the stand." },
    { type: "hardware", clue: "brass_hardware_visible", confidence: 45, description: "Brass-colored hardware visible at hinge locations; appears to be standard brass butt hinges. No other hardware (locks, pulls, casters) visible." },
    { type: "condition", clue: "overall_condition_good", confidence: 54, description: "Piece is structurally intact with no visible breaks, cracks, or missing components; finish is intact on exterior surfaces with wear limited to interior use surfaces." },
    { type: "form", clue: "no_drawers", confidence: 68, description: "No drawers are present on this piece; it is a simple pedestal reading/music stand without storage drawers." },
    { type: "label", clue: "maker_label", confidence: 85, description: "No visible maker label, stamp, stencil, or mark observed in any of the four photographs." },
    { type: "construction", clue: "drawer_present", confidence: 58, description: "Drawer evidence is visible." },
  ],
  asSeen: {
    formId: "Music stand",
    display: "Hollywood Regency / Neoclassical Glamour Adaptation Music stand (also commonly called: Music stand, Folding music stand)",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1920–1980",
    dateFloor: 1920,
    dateCeiling: 1980,
    confidence: "Low",
  },
};

const victorian_queen_anne_mahogany_washstand: ScanFixture = {
  label: "victorian_queen_anne_mahogany_washstand",
  note: "S021 mahogany cabriole-leg tripod shaving stand / washstand with porcelain knobs, brass basin recess, scrolled volute brackets, triangular shelves. Engine reported 'Victorian Queen Anne Influence Washstand' c. 1840-1920 Moderate (Low at date). M11 specimen #5 with the SAME prose-only-token shape as S020: style_family_queen_anne attributed conf 0.92 matched_terms=['queen','anne'] supported=true — neither 'queen' nor 'anne' appears in any clue KEY (only in cabriole_leg's 'Queen Anne/Georgian manner' and pad_feet's 'Queen Anne and early Georgian furniture, c. 1700-1760' description prose). The Queen Anne family bounds 1720-1780 then matched the 1870-1900 Victorian Queen Anne Influence revival wave for the final label. NOTABLE CALIBRATION TWIST: in this case the mechanism produced a PLAUSIBLE final label — porcelain knobs are post-1840, the piece IS clearly a Victorian Queen Anne revival reproduction, and the revival_wave 1870-1900 is a reasonable read. Same M11 mechanism, but with a defensible outcome. This is corpus calibration data showing that the prose-token-leakage path SOMETIMES lands right; an M11 fix needs to preserve correct outcomes like this one while suppressing the wrong-family cases (S015, S020). NOTABLE M0 perception false-positives: seating_surface (conf 82), seating_present (conf 78), spindle_back (conf 78), spindle_gallery (conf 70) all synthesized on a backless tripod washstand with no seating — recurring synthesizer over-emit on tripod stands with multiple turned columns. None drove final form (form_washstand correctly won) but they inflate the convergence and may push noise downstream.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "shaving_stand_form", confidence: 68, description: "Piece is a shaving/toilet stand: tall tripod-based stand with circular brass basin recess at top, two small drawers in a central case, lower triangular shelf with circular recess (for water basin or soap bowl), and cabriole legs. Classic Georgian/Regency shaving stand configuration." },
    { type: "form", clue: "secondary_surface", confidence: 68, description: "Triangular intermediate shelf visible between the upper basin platform and the drawer case, supported by turned baluster columns." },
    { type: "form", clue: "drawer_present", confidence: 68, description: "Two small drawers visible in the central hexagonal/octagonal case section, each fitted with a single round white knob (ivory, bone, or porcelain)." },
    { type: "form", clue: "open_shelving", confidence: 68, description: "Lower triangular shelf with a circular turned recess (likely for a water basin or soap dish) visible at the base of the stand above the cabriole legs." },
    { type: "structure", clue: "cabriole_leg", confidence: 82, description: "Three cabriole legs with pad feet visible at the base, curving outward from the lower triangular platform. Legs are gracefully curved in the Queen Anne/Georgian manner." },
    { type: "structure", clue: "tripod_base", confidence: 82, description: "Three-legged tripod base configuration with triangular lower shelf platform connecting the three cabriole legs." },
    { type: "structure", clue: "turned_spindle_supports", confidence: 82, description: "Multiple turned baluster/spindle columns visible: a central turned column connecting the upper basin platform to the intermediate shelf, and three outer turned columns connecting the intermediate shelf to the drawer case. Additional turned spindles connect the drawer case to the lower triangular shelf." },
    { type: "style", clue: "scrolled_volute_brackets", confidence: 52, description: "Scrolled volute/C-scroll arm brackets visible at the upper section connecting the outer turned columns to the basin platform rim, characteristic of Georgian and Regency decorative vocabulary." },
    { type: "style", clue: "triangular_platform_shelves", confidence: 52, description: "Both the intermediate shelf and the lower base shelf are triangular in plan, a characteristic feature of Georgian/Regency shaving and toilet stands." },
    { type: "style", clue: "georgian_regency_style_influence", confidence: 52, description: "Overall form, cabriole legs with pad feet, turned balusters, scrolled arm brackets, triangular shelves, and brass basin recess are all consistent with Georgian/Regency shaving stand design vocabulary, c. 1780-1830 or later reproductions thereof." },
    { type: "hardware", clue: "porcelain_knob", confidence: 62, description: "Two small round white knobs on the drawer fronts appear to be porcelain or bone/ivory. They are small, round, and white/cream in color, consistent with porcelain or bone knobs common on Georgian and Victorian small case furniture." },
    { type: "hardware", clue: "brass_basin_bowl", confidence: 45, description: "A circular brass basin/bowl is seated in the turned circular recess of the upper platform. The basin is bright gold-colored, appears to be stamped or spun brass, with a flat bottom and curved sides. Visible from both overall_front and overall_side views." },
    { type: "hardware", clue: "hinged_door_panel", confidence: 62, description: "A small hinged door panel is visible on the right side of the drawer case section, suggesting the case has both drawers and a small door compartment. A small hinge is visible at the right edge of the case in the joinery_closeup image." },
    { type: "materials", clue: "wood_species_mahogany_group", confidence: 65, description: "The wood is a warm dark reddish-brown with fine grain and smooth surface, consistent with mahogany or a mahogany-stained hardwood. The color, fine texture, and smooth finish are consistent with mahogany (Swietenia spp.) or a close substitute such as gumwood or birch stained to imitate mahogany." },
    { type: "finish", clue: "refinished_surface", confidence: 55, description: "The finish appears very uniform and smooth across all surfaces with no visible crazing, checking, or age-related wear patterns. This uniformity may indicate a later refinish or a reproduction piece with a modern finish rather than an original period surface." },
    { type: "finish", clue: "shellac_intact", confidence: 40, description: "The surface has a warm amber tone with moderate sheen consistent with shellac or a shellac-like finish. However, the uniformity and lack of visible wear or crazing makes it difficult to confirm as original period shellac versus a later lacquer or polyurethane." },
    { type: "condition", clue: "overall_condition_good", confidence: 45, description: "The piece appears to be in good overall condition with no visible major structural damage, missing parts, or significant losses. Minor wear may be present at the feet and base edges." },
    { type: "construction", clue: "turned_elements", confidence: 96, description: "Multiple turned elements visible throughout: baluster columns, spindle supports, the central column, and the circular basin recess rim. Turning quality appears consistent and smooth." },
    { type: "construction", clue: "circular_basin_recess", confidence: 96, description: "The upper platform has a turned circular recess that seats the brass basin bowl. The recess has a molded rim profile visible in the overall_side view." },
    { type: "construction", clue: "lower_bowl_recess", confidence: 92, description: "The lower triangular shelf has a circular turned recess with a dark molded ring, likely intended to hold a water basin, soap dish, or chamber pot. This is a characteristic feature of Georgian shaving/toilet stands." },
    { type: "function", clue: "grooming_dressing", confidence: 70, description: "The combination of a brass basin recess at top, small storage drawers, and lower bowl recess strongly indicates a grooming/dressing function — specifically a shaving stand or toilet stand used for morning ablutions." },
    { type: "construction", clue: "multiple_drawer_case", confidence: 96, description: "Only two small drawers are present in the central case section, not a full chest-of-drawers configuration. The case is a small storage module integrated into the stand." },
    { type: "style", clue: "pad_feet", confidence: 52, description: "The three cabriole legs terminate in pad feet (flat circular pads), visible in the joinery_closeup image. Pad feet are characteristic of Queen Anne and early Georgian furniture, c. 1700-1760, and are also used in later reproductions." },
    { type: "construction", clue: "solid_wood_construction", confidence: 65, description: "The legs, turned columns, and platform shelves appear to be solid wood construction rather than veneered panels. The grain visible on the drawer fronts and case sides appears consistent with solid or thick-veneered wood." },
    { type: "form", clue: "seating_surface", confidence: 82, description: "A seating surface or bench-like sitting area is visible." },
    { type: "form", clue: "seating_present", confidence: 78, description: "Integrated seating is visible." },
    { type: "structure", clue: "spindle_back", confidence: 78, description: "Spindles are visible in the back or side rail." },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
    { type: "construction", clue: "door_present", confidence: 58, description: "Door evidence is visible." },
  ],
  asSeen: {
    formId: "Washstand",
    display: "Victorian Queen Anne Influence Washstand (also commonly called: Washstand, Basin stand)",
    styleContext: "Queen Anne",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1840–1920",
    dateFloor: 1840,
    dateCeiling: 1920,
    confidence: "Low",
  },
};

const globe_wernicke_sectional_barrister_bookcase: ScanFixture = {
  label: "globe_wernicke_sectional_barrister_bookcase",
  note: "S022 Globe-Wernicke Co. Cincinnati sectional barrister bookcase, 4 stacking sections with full original paper labels reading 'MANUFACTURED BY The Globe-Wernicke Co. CINCINNATI, O. BRANCHES OR AGENCIES EVERYWHERE. PATENTED.' Per globe_wernicke_paper_label_early (conf 95, HIGH tier): paper label = 1899-1915 production. Date c. 1900-1920 reasonable but the headline IDENTIFICATION fails: display reads 'Bookcase / open shelving unit' with NO mention of Globe-Wernicke despite (a) the maker_label clue capturing the full firm name verbatim at conf 0.85, (b) maker_mark_globe_wernicke_co firing at conf 0.80 MEDIUM tier, (c) globe_wernicke_paper_label_early firing at conf 0.95 HIGH tier with the dated paper-label window 1899-1915. **NEW M-series candidate (M13): high-authority maker positively identified by the maker-mark matcher but the maker name is NOT propagated into the display form.** The two contemporaneous Logan tall-case-clock fixtures (S009) and the US Stamping Co. commode (S017/S019) showed M9 (label DATE not parsed); this is the sibling pattern — label MAKER NAME not surfaced. Also: floor=1915 is the CEILING of the 1899-1915 early-label window, used as a TPQ floor — same window-end-as-floor anti-pattern that M12 Fix2 closed for parseLabelDate but appearing in a different code path here. Also fix#10 (4th specimen): spurious DEFAULT 'American Empire / late Classical Revival' context_only label on a Golden Oak Cincinnati office bookcase that has nothing to do with American Empire. User feedback: 'Super annoying. The label clearly writes out Globe Wernicke explicitly.' Scan runtime 1min 3sec (long-side per latency conversation; no recovery_metadata in trace).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "label", clue: "maker_label", confidence: 85, description: "Paper label clearly reads 'MANUFACTURED BY The Globe-Wernicke Co. CINCINNATI, O. BRANCHES OR AGENCIES EVERYWHERE. PATENTED.' with SIZE D-10 1/4 and GRADE 299. Multiple sections carry matching labels. Full firm name present — high-authority maker attribution." },
    { type: "label", clue: "visible_text", confidence: 85, description: "Labels on individual sections show two size designations: top section labeled D-8¼ 299, and three lower sections labeled D-10¼ 299. Size and grade format is consistent with documented Globe-Wernicke catalog labeling system." },
    { type: "form", clue: "open_shelving", confidence: 68, description: "Four stacking sectional bookcase units visible, each with a glazed lift-and-slide door enclosing an open shelf interior. Classic barrister/sectional bookcase form." },
    { type: "form", clue: "door_present", confidence: 68, description: "Each of the four sections has a glazed glass door that lifts and slides back into the unit — the characteristic Globe-Wernicke lift-and-slide door mechanism." },
    { type: "structure", clue: "stacking_sectional_construction", confidence: 82, description: "Piece is composed of discrete stacking sections: a molded cornice top cap, four bookcase sections of varying depth (D-8¼ and D-10¼), and a base section with ogee molding. Sections interlock via metal clips visible at corners." },
    { type: "hardware", clue: "stamped_metal_bracket", confidence: 62, description: "Stamped/pressed metal interlocking clips visible at the corners of each stacking section junction, both on front corners and back corners. These are the characteristic Globe-Wernicke section-locking hardware. Also visible: small brass corner brackets at the top cap corners." },
    { type: "materials", clue: "quarter_sawn_oak", confidence: 84, description: "All primary show surfaces — sides, front rails, top cap, door frames — display pronounced silver ray fleck pattern characteristic of quarter-sawn white oak. Visible on the top surface close-up showing dense medullary ray fleck across the entire panel." },
    { type: "style", clue: "golden_oak_era", confidence: 52, description: "Quarter-sawn white oak primary show wood with dark finish, molded cornice cap, and ogee base molding are consistent with Golden Oak / late Victorian office furniture production c. 1899-1915." },
    { type: "construction", clue: "wire_nail", confidence: 88, description: "Back panel view shows multiple small round-head wire nails securing the back boards to the case sides and top. Consistent with factory production post-1890." },
    { type: "construction", clue: "solid_plank_back", confidence: 82, description: "Back panels appear to be solid flat-sawn oak boards (not plywood) nailed to the case backs of each section. Grain pattern and board width visible on back image. Some boards show flat-sawn cathedral grain rather than quarter-sawn, consistent with secondary wood economy." },
    { type: "construction", clue: "factory_case_construction", confidence: 95, description: "Construction shows machine-era factory production: consistent section dimensions, uniform hardware placement, standardized door mechanism, and repeating label format across all sections. No hand-fitted joinery visible; construction prioritizes repeatability and speed." },
    { type: "condition", clue: "wear_and_scratching", confidence: 54, description: "Back panels show heavy surface scratching, scuff marks, and abrasion consistent with decades of use and storage. Front show surfaces retain finish with age-darkened patina. Overall condition consistent with genuine age." },
    { type: "condition", clue: "shellac_intact", confidence: 45, description: "Show surfaces on front and sides display a warm amber-brown finish with age-darkened patina and no visible plastic-like film. Finish appears to be original shellac or early varnish consistent with Globe-Wernicke production era c. 1899-1915." },
    { type: "hardware", clue: "round_wood_knob", confidence: 62, description: "Small brass or metal button knobs visible centered on each door panel — not wooden knobs. These are the characteristic small brass lift-knobs used on Globe-Wernicke doors." },
    { type: "hardware", clue: "brass_corner_hardware", confidence: 62, description: "Small brass corner brackets visible at the top corners of the cornice cap, consistent with Globe-Wernicke top-cap hardware. Also visible as dark oxidized metal section-locking clips at each stacking junction." },
    { type: "materials", clue: "glass_doors", confidence: 45, description: "All four sections retain original glass panels in the lift-and-slide doors. Glass appears to have slight waviness/distortion in some panels consistent with early 20th-century sheet glass rather than modern float glass." },
    { type: "form", clue: "cornice_top_cap", confidence: 68, description: "Separate molded cornice top cap with ogee profile and rolled front edge sits atop the stack. Brass corner brackets at top cap corners. This is the standard Globe-Wernicke top-cap unit." },
    { type: "form", clue: "base_molding_unit", confidence: 68, description: "Separate base unit with ogee/bracket molding profile at bottom of stack, consistent with Globe-Wernicke standard base section." },
    { type: "construction", clue: "frame_and_panel_sides", confidence: 85, description: "Top surface close-up shows the top cap has a frame-and-panel construction with a raised inner panel surrounded by a molded frame. The panel and frame are both quarter-sawn oak." },
    { type: "label", clue: "patented_mark", confidence: 85, description: "Label reads 'PATENTED.' indicating the lift-and-slide door mechanism was under patent protection at time of manufacture. Globe-Wernicke held patents on their sectional bookcase system." },
    { type: "condition", clue: "labels_present_all_sections", confidence: 54, description: "All four bookcase sections retain their original paper labels, visible through the glass doors. Labels show consistent Globe-Wernicke format with size and grade designations. Label survival across all sections supports original, unaltered assembly." },
    { type: "style", clue: "cut_grain_phenomenon_ray_fleck", confidence: 52, description: "Heavy silver ray fleck visible across all primary show surfaces — sides, top cap, door frames. This is the diagnostic visual indicator of quarter-sawn white oak, the canonical Mission/Golden Oak era wood." },
    { type: "materials", clue: "glass_top", confidence: 50, description: "glass intact in all four sections" },
    { type: "label", clue: "maker_mark_globe_wernicke_co", confidence: 80, description: "Detected maker mark: Globe-Wernicke Co.. Mark type: paper_label. Dating reference: 1899-1955. Confidence tier: MEDIUM." },
    { type: "label", clue: "globe_wernicke_paper_label_early", confidence: 95, description: "Detected maker mark: Globe-Wernicke. Mark type: paper_label. Dating reference: 1899-1915. Confidence tier: HIGH." },
  ],
  asSeen: {
    formId: "Bookcase / open shelving unit",
    display: "Bookcase / open shelving unit",
    styleContext: "American Empire / late Classical Revival",
    finalStyleKind: "context_only",
    dateRange: "c. 1900–1920",
    dateFloor: 1915,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

const gm_radio_dayton_queen_anne_console_phonograph: ScanFixture = {
  label: "gm_radio_dayton_queen_anne_console_phonograph",
  note: "S023 General Motors Radio Corp combination radio-phonograph console cabinet (Dayton Ohio, serial 56020A), Queen Anne cabriole-leg figured-veneer Depression-era radio cabinet — per the context observation: 'dates this piece to approximately 1929-1933. General Motors Radio Corp was a subsidiary of GM that produced Radiola-competing console radios in this era.' Engine reported 'Queen Anne Media console' c. 1920 onward (early-to-mid 20th century or later) Moderate (Low at date), kind=unresolved. Multiple stacked failures: (M13 #2, joining S022) — maker GM RADIO CORP captured verbatim in three maker_label observations at conf 88 + the context obs says 'General Motors Radio Corp combination radio-phonograph console cabinet, serial number 56020A, manufactured in Dayton, Ohio' explicitly, yet the display drops the maker entirely. Same pattern as the Globe-Wernicke barrister bookcase: high-authority maker positively identified, display generic. (M9-adjacent, NEW shape) — the context observation literally states 'dates this piece to approximately 1929-1933' and provides the GM Radio Corp founding context. This is DATE PROSE in a [context] type observation, keyed to cabriole_leg(!). Should DOMINATE dating; never reaches date_floor/ceiling. parseLabelDate doesn't scan context-type observations. Sibling to M9 (which is about maker-label date prose); this is context-obs date prose. (M11 #6) — style_family_queen_anne attributed conf 0.92 matched_terms=['queen','anne'] supported:true on prose-only tokens (from cabriole_leg and context descriptions — neither token is in any clue KEY). Joins S020/S021 prose-token leakage pattern. (P0 quality issue, NEW) — 3 observations have NO clue key (form/condition/materials triple). Plus clue-key OVERLOAD: door_present appears as form, condition, hardware, AND style with unrelated descriptions attached; cabriole_leg appears as style AND context. The 'door_present' style obs is actually about cornice/pilaster/pediment molding having nothing to do with doors. Pollutes downstream consumption. (Final kind=unresolved) — reconciliation reason 'Final dating unavailable; defaulting to attribution-time style label Queen Anne' — when frame_floor=1920 + ceiling=null (open-ended), reconciliation can't pick a wave/period and falls to unresolved. Actual piece is unambiguously c. 1929-1933 per the maker plate (GM Radio Corp was active 1929-1933 only); engine's '1920 onward' window is 9+ years too early on the floor and infinitely too late on the ceiling.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "door_present", confidence: 68, description: "Overall front view shows a tall two-section floor-standing console cabinet. Upper section has a hinged lid (closed in front view) and a pair of small double doors in the center front concealing the radio face. Lower section has a shaped apron and a pair of arched double doors for record storage. The entire cabinet sits on four cabriole legs." },
    { type: "style", clue: "cabriole_leg", confidence: 52, description: "Four cabriole legs visible in overall front and side views, with pad feet. Legs are carved in Queen Anne style with a pronounced knee and inward curve. This is a decorative period styling choice for a 1930s radio console cabinet." },
    { type: "materials", clue: "solid_wood_construction", confidence: 45, description: "Cabinet body appears to be solid wood construction with figured burlwood or bird's-eye maple veneer applied to the front panels and sides. The veneer shows a highly figured, swirling grain pattern consistent with burlwood or bird's-eye veneer. Secondary plain wood visible on interior surfaces and side panels." },
    { type: "finish", clue: "shellac_crazing", confidence: 55, description: "Extreme shellac crazing visible across the entire front veneer surface in the joinery closeup image. The finish has broken into a mosaic of small flaking chips, consistent with aged shellac that has been exposed to moisture and temperature cycling. This is classic alligatoring/crazing of a pre-WWII shellac finish." },
    { type: "condition", clue: "door_present", confidence: 54, description: "Side panel (overall_side image) shows heavy scratching across the entire surface, with finish worn through to bare wood in multiple areas. Veneer appears intact but finish is severely degraded. The piece has clearly been stored outdoors or in a harsh environment." },
    { type: "label", clue: "maker_label", confidence: 88, description: "Metal data plate label affixed to the radio chassis (visible in back/interior image and closeup). Label reads: 'RADIO [GM logo] RECEIVER / VOLTS-115 / WATTS-95 / GENERAL MOTORS RADIO / CYCLE 50-60 / SERIAL NUMBER / 56020 A / MFD. BY GENERAL MOTORS RADIO CORP. / DAYTON, OHIO, U.S.A. / SEE LICENSE NOTICE'. This definitively identifies the radio chassis manufacturer." },
    { type: "label", clue: "maker_label", confidence: 88, description: "Secondary label on chassis reads 'PHONOGRAPH PICK UP' with two slotted screw terminals, indicating this unit is a combination radio-phonograph with a separate phonograph pickup input on the chassis." },
    { type: "visible_text", clue: "maker_label", confidence: 50, description: "Visible text on maker label: 'RADIO GM RECEIVER', 'VOLTS - 115', 'WATTS - 95', 'CYCLE 50-60', 'SERIAL NUMBER 56020 A', 'MFD. BY GENERAL MOTORS RADIO CORP.', 'DAYTON, OHIO, U.S.A.', 'SEE LICENSE NOTICE', 'PHONOGRAPH PICK UP'" },
    { type: "form", clue: "", confidence: 68, description: "Interior view with lid open (joinery_closeup image showing turntable) reveals a phonograph turntable with a circular platter and a pickup arm/tonearm assembly. The turntable is housed in the upper section of the cabinet beneath the hinged lid. A small label or tag is visible on the interior front wall of the turntable compartment." },
    { type: "hardware", clue: "round_wood_knob", confidence: 62, description: "Radio face (visible in joinery_closeup showing open doors) has two large round dark Bakelite knobs flanking the tuning dial, plus two smaller round knobs flanking a secondary indicator window. These are period-correct Bakelite control knobs typical of 1930s radio receivers." },
    { type: "hardware", clue: "door_present", confidence: 45, description: "Radio tuning dial visible when doors are open: a horizontal rectangular illuminated dial scale with frequency markings (appears to show AM broadcast band frequencies). A secondary smaller rectangular window below shows what appears to be a band selector or tone indicator. Consistent with late 1920s to mid-1930s radio design." },
    { type: "style", clue: "door_present", confidence: 52, description: "Front panel design features a shaped ogee/cyma molding at the cornice top, reeded pilasters on the sides of the upper cabinet, a shaped broken-arch pediment molding framing the door opening, and a shaped apron between the cabriole legs. This combination of Queen Anne legs with period radio styling is characteristic of late 1920s to early 1930s American console radio cabinets." },
    { type: "fasteners", clue: "slotted_screw", confidence: 50, description: "Slotted screws visible securing the maker's data plate to the radio chassis in the label closeup image. Consistent with pre-WWII manufacturing practice." },
    { type: "condition", clue: "", confidence: 54, description: "The joinery_closeup image showing the top surface of the cabinet reveals the finish has been almost entirely lost, with bare wood exposed and significant scratching. The molded cornice edge shows veneer lifting and separation at the top edge." },
    { type: "materials", clue: "", confidence: 45, description: "The figured veneer on the front panels appears to be bird's-eye maple or a similar highly figured light-colored wood that has been stained/finished to a warm brown. The swirling, mottled grain pattern is consistent with bird's-eye maple or possibly burlwood veneer. The side panels appear to be plain-grained walnut or stained oak veneer." },
    { type: "context", clue: "cabriole_leg", confidence: 48, description: "This piece is a General Motors Radio Corp combination radio-phonograph console cabinet, serial number 56020A, manufactured in Dayton, Ohio. The cabinet style with Queen Anne cabriole legs, figured veneer panels, and the radio chassis specifications (115V, 95W, 50-60 cycle) dates this piece to approximately 1929-1933. General Motors Radio Corp was a subsidiary of GM that produced Radiola-competing console radios in this era." },
  ],
  asSeen: {
    formId: "Media console",
    display: "Queen Anne Media console (also commonly called: Media console, Entertainment console)",
    finalStyleKind: "unresolved",
    dateRange: "c. 1920 onward (early-to-mid 20th century or later)",
    dateFloor: 1920,
    dateCeiling: null,
    confidence: "Low",
  },
};

const regina_music_box_disc_floor_cabinet: ScanFixture = {
  label: "regina_music_box_disc_floor_cabinet",
  note: "S024 Regina Music Box Co. (Rahway NJ) floor-model disc music box on matching cabinet stand, c. 1897-1910 (Sousa 'The Bride Elect' 1897 TPQ disc + 15-20 stored discs + Regina allegorical-muse lid lithograph + Victorian parlor cabinet form with cabriole legs, inlay banding, beaded molding). Engine catastrophically misidentified as 'Brass bed or brass-frame furniture (also commonly called: iron bed, iron bedstead)' c. 1893 HIGH confidence with 'Modernist / chrome-frame' style. Eight distinct failures stacked: (1) M8 form catastrophe: P3 chose form_iron_bed on a wooden music box because the M6 false-positive chain fired — tubular_steel keyed to 'steel disc' (the music disc!) + brass_frame keyed to 'brass mechanism components retain gold color' (the drive shaft!) — material clues describing INTERNAL MECHANISM components got routed to METAL FRAME furniture material scoring. Same shape as S017 commode → Modernist Stool. (2) Fix#1/#2 metal-FP-suppression DURABILITY REGRESSION: this is the LIVE recurrence of the exact pattern fixes #1 and #2 were shipped to mitigate (per S017-R validation block). The fix doesn't survive when 'steel'/'brass' appear in mechanical-internals descriptions instead of structural-material descriptions. Critical signal: fix #2 was validated on commode-shape pieces but doesn't generalize. (3) fix#10 'Modernist / chrome-frame' canned context_only label — 4th specimen (joining S010-alt, S016-alt, S017-primary). Now appearing as PRIMARY label not alt. Confirms the deriveStyleContext text-cue path generates this canned string from any tubular_steel/metal_frame keyword regardless of overall material context. (4) M13 #3 (PROMOTION BAR MET, n=3): Regina Music Box Co. Rahway N.J. captured verbatim in maker_label conf 85 + disc_title_and_number (Sousa 'The Bride Elect 1897') + patent_dates_visible (US Patents 1889/1893) + disc_count_storage + visible_text all referencing Regina — display drops Regina entirely. Three M13 specimens now: S022 Globe-Wernicke, S023 GM Radio Corp, S024 Regina. n≥3 — promotion bar met. (5) M9 fix regression candidate: P2 anchored frame_floor=ceiling=1893 conf High citing 'A signed/dated maker inscription gives an explicit production year of 1893; a literal made-date is the highest-authority dating evidence.' But '1893' came from patent_dates_visible description 'U.S. PATENTS. Dated Dec. 17, 1889 = June 27, 1893' — those are PATENT DATES not production. parseLabelDate's PRODUCTION_STRICT_SINGLE regex (post-M9-fix) matches '\\bdated\\b' which caught 'Dated Dec. 17, 1889 = June 27, 1893' as production-prose. Semantic edge case the M9 fix didn't anticipate: the 'Dated' patent-prose pattern. Also wrong direction: Sousa 1897 TPQ floor exists but went unused. Coincidentally close-ish to the correct date though (1893 vs actual 1897+). (6) hasModernConstruction gate failed to fire: polyurethane is hardNegative with dateHint 'c. 1960-2030' but the regex check at engine.ts:9127 looks for 'post-1920+', the literal 'c. 1960' format doesn't match. So hasModernConstruction was false even though polyurethane was present, letting the production-anchor branch run unguarded. (7) M0 perception synthesis on non-seating piece (2nd specimen, joining S021): seating_surface (conf 82), seating_present (conf 78), spindle_back (conf 78), spindle_gallery (conf 70) all fire on a backless music box cabinet. Same pattern as S021 tripod washstand — recurring synthesizer over-emit. (8) No subtype: should be form_music_box with disc subtype (if taxonomy supports it) or at minimum form_music_box not form_iron_bed. Catastrophic-net result: a clearly-identified Regina disc music box reads back as a metal bedframe with the wrong canned modern style, dated to a patent year mistaken for production. User said 'A lot of notes to take down for this one.'",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "label", clue: "maker_label", confidence: 85, description: "Disc clearly engraved with 'Regina Music Box Co. Rahway N.J.' in decorative script. This is the primary maker identification mark on the disc itself." },
    { type: "label", clue: "patent_dates_visible", confidence: 85, description: "Disc engraving reads 'U.S. PATENTS. Dated Dec. 17, 1889 = June 27, 1893.' These patent dates bracket the production window for this disc and likely the machine itself." },
    { type: "label", clue: "disc_title_and_number", confidence: 85, description: "Disc engraving reads 'THE BRIDE ELECT MARCH 1582 / By permission of The John Church Co. / Owner of the Copyright / SOUSA.' Sousa's 'The Bride Elect' march was published 1897, providing a post-quem date for this disc." },
    { type: "form", clue: "lift_lid", confidence: 68, description: "Upper music box case has a hinged lift-lid that opens to reveal the disc mechanism. Lid is propped open in all images showing the interior." },
    { type: "function", clue: "disc_music_box_mechanism", confidence: 70, description: "Large rotating steel disc with punched holes drives a comb mechanism. This is the defining functional feature of a Regina-type disc music box. The disc rotates on a central spindle driven by a clockwork motor wound by the hand crank visible on the right side." },
    { type: "hardware", clue: "winding_crank_handle", confidence: 62, description: "Black-handled hand crank visible on the right side of the upper case, used to wind the clockwork motor that drives the disc rotation." },
    { type: "hardware", clue: "brass_drive_mechanism", confidence: 62, description: "Brass-colored twisted/spiral drive rod (worm gear or drive shaft) and associated star-wheel/comb assembly visible across the center of the disc. Brass components retain gold coloration consistent with original or lightly cleaned brass." },
    { type: "form", clue: "door_present", confidence: 68, description: "Lower cabinet stand has a single door visible in the overall front image, providing enclosed storage for the disc collection." },
    { type: "form", clue: "open_shelving", confidence: 68, description: "Lower cabinet interior (visible through open door in joinery_closeup image) contains vertical wooden dividers creating individual slots for storing multiple steel discs. Approximately 15-20 discs visible stored vertically." },
    { type: "materials", clue: "steel_discs", confidence: 84, description: "Multiple large-diameter steel discs visible in storage compartment. Discs show oxidation/darkening consistent with age. Perforated holes around perimeter and punched projections across face are the music-encoding mechanism." },
    { type: "style", clue: "victorian_parlor_cabinet_form", confidence: 52, description: "Overall form is a Victorian parlor cabinet music box on a matching stand. Case has decorative inlay line banding, beaded molding on the lower cabinet, and cabriole-style legs — all consistent with late Victorian parlor furniture aesthetic c. 1890-1910." },
    { type: "style", clue: "decorative_inlay_line_banding", confidence: 52, description: "Thin light-colored inlay line banding visible on the exterior of the upper case and lower cabinet, forming rectangular border patterns with a small diamond/triangle motif at center front. Consistent with late Victorian decorative case treatment." },
    { type: "style", clue: "allegorical_lithograph_lid_interior", confidence: 52, description: "Interior of the lift lid contains a framed lithographic print depicting an allegorical muse figure surrounded by cherubs/putti playing instruments. This is a characteristic Regina Music Box Co. decorative element on their floor-model cabinets." },
    { type: "condition", clue: "polyurethane", confidence: 50, description: "The very high-gloss plastic-like sheen on the case exterior is consistent with a polyurethane or modern lacquer finish. If original, the case would more likely show shellac. This may indicate later refinishing." },
    { type: "hardware", clue: "piano_hinge", confidence: 62, description: "Lid hinges visible on the back edge of the upper case appear to be continuous or piano-style hinges, consistent with the production era of Regina music boxes (post-1880)." },
    { type: "hardware", clue: "lid_latch_hardware", confidence: 45, description: "Small metal latch/clasp hardware visible at the front center of the lid and at the corners — appears to be original nickel or chrome-plated hardware consistent with Regina production." },
    { type: "form", clue: "cabriole_leg", confidence: 68, description: "Lower cabinet stand has curved cabriole-style legs visible at the base, consistent with late Victorian parlor furniture styling c. 1890-1910." },
    { type: "style", clue: "beaded_molding", confidence: 52, description: "Beaded or rope-twist molding visible along the top edge of the lower cabinet, consistent with Victorian decorative case treatment." },
    { type: "hardware", clue: "disc_change_tool", confidence: 62, description: "A disc-changing tool (spanner/lifter with brass disc-shaped head and black turned handle) is visible resting on the lid top in the joinery_closeup image. This is the original tool used to lift and change the steel discs." },
    { type: "condition", clue: "disc_oxidation", confidence: 45, description: "Steel discs in storage show significant darkening/oxidation consistent with age. The playing disc on the mechanism appears lighter/cleaner, possibly from more recent handling." },
    { type: "label", clue: "disc_count_storage", confidence: 85, description: "Lower cabinet disc storage compartment contains approximately 15-20 steel discs stored vertically in individual wooden divider slots. All appear to be large-format Regina discs matching the playing disc diameter." },
    { type: "construction", clue: "two_piece_cabinet_construction", confidence: 45, description: "The music box appears to be a two-piece construction: an upper music box case unit sitting on a separate lower cabinet/stand. This is consistent with Regina's floor-model 'Style' cabinets (e.g., Style 35, Style 50, etc.)." },
    { type: "function", clue: "multiple_drawer_case", confidence: 70, description: "Lower cabinet provides enclosed storage for the disc collection, with vertical dividers to protect individual discs. This is a functional storage feature integrated into the music box stand." },
    { type: "label", clue: "visible_text", confidence: 85, description: "All visible text compiled from disc engravings across multiple images. The Regina Music Box Co. Rahway NJ identification is the primary maker mark. Patent dates 1889 and 1893 bracket the production window. The Bride Elect March by Sousa (published 1897) provides a post-quem date for this specific disc." },
    { type: "materials", clue: "brass_frame", confidence: 50, description: "brass mechanism components retain gold color" },
    { type: "materials", clue: "tubular_steel", confidence: 50, description: "steel disc" },
    { type: "form", clue: "seating_surface", confidence: 82, description: "A seating surface or bench-like sitting area is visible." },
    { type: "form", clue: "seating_present", confidence: 78, description: "Integrated seating is visible." },
    { type: "structure", clue: "spindle_back", confidence: 78, description: "Spindles are visible in the back or side rail." },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
    { type: "construction", clue: "drawer_present", confidence: 58, description: "Drawer evidence is visible." },
    { type: "form", clue: "cabinet_form", confidence: 68, description: "Cabinet or cupboard form is visible." },
  ],
  asSeen: {
    formId: "Music box",
    display: "Regina Music Box Co Music box (also commonly called: disc music box, cylinder music box)",
    finalStyleKind: "context_only",
    dateRange: "c. 1893",
    dateFloor: 1893,
    dateCeiling: 1893,
    confidence: "High",
  },
};

const colonial_revival_queen_anne_oak_corner_armchair: ScanFixture = {
  label: "colonial_revival_queen_anne_oak_corner_armchair",
  note: "S025 oak corner/roundabout chair (single central back splat + sweep arms to both sides + shield-shaped seat) with floral needlepoint seat, cabriole legs, scroll crest rail, brass nailhead trim, hand-tacked frame. Reupholstered (post-1950 staples on dust cover). Engine reported 'Colonial Revival Queen Anne Upholstered armchair' c. 1890-1920 Moderate. NOTABLE END-TO-END SUCCESS: frame/upholstery split worked correctly — Block 14 separated 19 frame clues from 6 upholstery clues; frame dated c. 1890-1920 Moderate, upholstery dated post-1950 separately as a reupholstery campaign; P5 conflict resolution correctly handled hand_tacks (period upholstery, 1700-1920) vs dust_cover_stapled (HARD NEGATIVE post-1950) by attaching the staple evidence to the upholstery layer not the frame. The reupholstery cross-reference note in P2 says 'a reupholstery approximately 30 years after the frame is the most likely reading' — exactly the right read. Date plausible (1890-1920 Colonial Revival production fits the form), revival_wave Colonial Revival Queen Anne label defensible. Joins S013/S014/S021 contrast cases. SUBTYPE-DETECTION-MISSED (n=3, joining S022 Globe-Wernicke barrister + S024 Regina disc): the piece is unambiguously a CORNER / ROUNDABOUT chair — corner_chair_form (conf 52, '[style]') fires explicitly, AND armchair_form (conf 68) description says 'corner/roundabout chair configuration', AND backrest_present description says 'characteristic of corner/roundabout chair form', AND shaped_seat_rail / scroll_crest_rail descriptions both mention 'corner chairs'. Yet form_corner_chair never reached the candidate list; form_armchair (weight 0.93) won via the [form] bucket while corner_chair_form sat at [style] @ 0.37. Same bucket-mis as S011 apothecary_cabinet_form — form-defining clue routed to non-form bucket loses to broader sibling. M11 prose-token leak still present (#7): style_family_queen_anne attributed conf 0.92 from matched_terms=['queen','anne'] scraped from corner_chair_form / cabriole_leg / scroll_crest_rail / shaped_seat_rail / floral_needlepoint_motif descriptions — neither token in any clue KEY. Same shape as S020/S021/S023. But like S021, the M11 mechanism produced a DEFENSIBLE outcome here (Colonial Revival Queen Anne is a reasonable read for an 1890-1920 corner chair). M5 recurring: five style-bucket clues carry useful dating prose in their descriptions (corner_chair_form 'Queen Anne through Colonial Revival', cabriole_leg 'Queen Anne / Colonial Revival', scroll_crest_rail 'Queen Anne and Colonial Revival corner chairs', shaped_seat_rail 'Queen Anne and later Colonial Revival corner chair production', floral_needlepoint_motif 'Victorian through Colonial Revival') — none reach dating layer at @ 0.37 each.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Shaped upholstered seat with serpentine/shield outline visible from above and front views." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Single central vertical splat backrest with scroll-carved top crest rail, characteristic of corner/roundabout chair form." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Chair has two curved sweep arms extending from the central back splat outward to arm terminals; corner/roundabout chair configuration with arms on two sides." },
    { type: "style", clue: "corner_chair_form", confidence: 52, description: "Chair is a corner/roundabout chair: single central back splat, arms sweeping to both sides, seat oriented diagonally. This form is associated with Queen Anne through Colonial Revival periods." },
    { type: "style", clue: "cabriole_leg", confidence: 52, description: "Legs visible in side view show curved cabriole profile with pad or scroll foot, consistent with Queen Anne / Colonial Revival styling." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Frame members — back splat, arms, seat rails, legs — appear to be solid wood throughout. Grain visible on splat and arm surfaces. No veneer or laminate evidence." },
    { type: "materials", clue: "wood_species_oak", confidence: 60, description: "Back splat shows open ring-porous grain pattern consistent with oak. Color is medium-dark brown. Could also be walnut or stained mahogany, but grain texture and pore pattern lean toward oak." },
    { type: "upholstery", clue: "needlepoint_cover", confidence: 50, description: "Seat is covered with hand-stitched needlepoint canvas depicting a floral bouquet (roses in red, yellow, white on burgundy/maroon ground). Stitch direction and density clearly visible; ground canvas visible at worn/fraying edges. Classic needlepoint upholstery cover." },
    { type: "hardware", clue: "nailhead_trim", confidence: 62, description: "Continuous row of brass-colored domed nailheads borders the entire perimeter of the seat upholstery. Nailheads show tarnish and slight irregularity consistent with individually hand-driven tacks rather than modern strip nailhead." },
    { type: "hardware", clue: "hand_tacks", confidence: 62, description: "Nailhead trim appears individually placed with slight spacing irregularity; tarnished oxidized heads visible. Consistent with hand-driven upholstery tacks rather than modern strip application." },
    { type: "condition", clue: "upholstery_damage", confidence: 54, description: "Needlepoint cover is partially torn and fraying at the front-right corner of the seat, exposing underlying stuffing/padding material beneath. Significant wear visible at this area." },
    { type: "construction", clue: "upholstery_staple_construction", confidence: 50, description: "Underside cambric dust cover shows what appear to be small metal fasteners at the perimeter — could be staples or tacks. Image resolution limits definitive classification between hand tacks and machine staples. If staples, this indicates a later reupholstery campaign." },
    { type: "construction", clue: "cambric_dust_cover", confidence: 96, description: "Black cambric/dust cover fabric is attached to the underside of the seat, covering the seat construction. This is a standard upholstery finishing technique. Cover appears intact but worn." },
    { type: "hardware", clue: "decorative_nailhead_trim", confidence: 62, description: "Brass-colored domed nailheads in continuous row around seat perimeter; tarnished with age. Nailheads appear individually placed with slight irregularity. Consistent with period upholstery tack trim rather than modern strip." },
    { type: "hardware", clue: "leg_glide_or_nail", confidence: 62, description: "Joinery closeup shows the bottom of a leg with a single domed brass/metal nail or glide cap at the foot tip. The leg end shows significant wear and oxidation of the wood surface, consistent with age." },
    { type: "condition", clue: "finish_wear", confidence: 45, description: "Leg and seat rail surfaces show worn finish with exposed wood at high-contact areas. Oxidation and darkening consistent with age. Finish appears to be a traditional oil/shellac or varnish rather than modern polyurethane." },
    { type: "style", clue: "scroll_crest_rail", confidence: 52, description: "Top of the central back splat terminates in a small scroll or volute crest, visible in front view. This is a decorative detail consistent with Queen Anne and Colonial Revival corner chairs." },
    { type: "style", clue: "shaped_seat_rail", confidence: 52, description: "Seat rail has a shaped/serpentine outline visible from above (shield/cartouche shape). This shaped seat form is consistent with Queen Anne and later Colonial Revival corner chair production." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 55, description: "Arm-to-back-splat and arm-to-seat-rail junctions appear to use mortise-and-tenon or similar traditional chair joinery. No visible mechanical fasteners at these joints. Consistent with traditional chair frame construction." },
    { type: "upholstery", clue: "no_spring_seat", confidence: 50, description: "Seat profile appears relatively flat/thin without the crowned dome typical of coil-spring construction. Likely a stuffed drop-in or tacked-over seat without springs, consistent with the chair's period and form." },
    { type: "condition", clue: "wood_oxidation_age_patina", confidence: 54, description: "Wood surfaces on legs, seat rails, and arm supports show darkened oxidation patina consistent with significant age. Leg closeup shows heavily oxidized/worn wood surface at foot." },
    { type: "style", clue: "floral_needlepoint_motif", confidence: 52, description: "Needlepoint seat depicts a multi-flower bouquet with roses in red, yellow, and white/cream on a burgundy ground with green foliage. Floral needlepoint on chair seats is associated with Victorian through Colonial Revival domestic upholstery traditions." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "needlepoint fabric" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "upholstery", clue: "dust_cover_cambric_woven", confidence: 70, description: "Dust cover is woven cotton cambric — standard factory upholstery practice across a broad period; not a tight date on its own." },
    { type: "upholstery", clue: "dust_cover_stapled", confidence: 75, description: "Dust cover is stapled to the frame — pneumatic/electric staple attachment is a post-WWII practice." },
  ],
  asSeen: {
    formId: "Upholstered armchair",
    display: "Colonial Revival Queen Anne Upholstered armchair (also commonly called: Arm chair, Easy chair)",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

const walnut_workshop_harpsichord_misid_music_stand: ScanFixture = {
  label: "walnut_workshop_harpsichord_misid_music_stand",
  note: "S026 modern American workshop harpsichord, grand/wing form, two-choir layout, black walnut case with spruce soundboard, tapered legs — descriptions explicitly identify as 'post-1950 revival movement workshop build' (modern_workshop_harpsichord_aesthetic + no_painted_case_decoration). Engine reported 'Music stand' (the sheet music desk accessory ON the harpsichord), date 'Broad, not tightly dated' Low, no style attribution. CATASTROPHIC IDENTIFICATION via a NEW M8 mechanism — TAXONOMY GAP, not form-clue-bucket-mis: harpsichord_form (conf 45, [form]) + keyboard_instrument_case (conf 68, [form]) + musical_instrument (conf 45, [function]) all fire correctly with the right buckets, but form_harpsichord / form_keyboard_instrument do NOT exist in canonical taxonomy (verified: only form_piano_desk exists which is FURNITURE in piano-shape, not the instrument; form_music_stand, form_lectern, form_easel are the music-adjacent forms). When the correct form has no canonical home, the engine falls back to the closest in-scope match — and music_desk_present (conf 45, [construction]) describing the SHEET MUSIC RACK on the harpsichord routed to form_music_stand, winning by default. P0 perception was excellent (correctly identified harpsichord, two-choir layout, walnut case, spruce soundboard, bristle dampers, hitchpins, lid prop, modern workshop aesthetic) but the form pipeline can't surface a form that doesn't exist canonically. Distinct from S009 (clock→trunk: form_tall_case_clock EXISTS but mis-routed via different clue), S017 (commode→stool: bucket-mis under metal-FP chain), S024 (Regina→iron_bed: M6+M8 chain). This is the FIRST TAXONOMY-GAP M8 specimen: the engine doesn't have musical instruments in scope and produced a confident in-scope answer ('Music stand' Moderate) instead of an honest 'out-of-scope' response. Valuation $91-$298 retail is wildly wrong (modern workshop harpsichords run $5,000-$20,000+); valuation tier scales with form-misclass. Date 'Broad, not tightly dated' is honestly correct given no datable layers converged — the two style clues (modern_workshop_harpsichord_aesthetic, no_painted_case_decoration) both explicitly say 'post-1950' / 'post-1950 revival movement' in description prose but at [style] @ 0.37 contribute 0 to dating overlap (M5 recurring, 11th specimen). NO M11 here — no style family was attributed (no Queen Anne/Federal/etc tokens in any descriptions). Useful confirmation that M11 mechanism is keyword-dependent. Also: P0 had NO false-positives — seating_surface/seating_present/spindle_back/spindle_gallery DID NOT fire on this harpsichord (unlike S021/S024 multi-column pieces); good signal that the synthesizer over-emit is specific to multi-turned-column verticality, not all complex forms.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "harpsichord_form", confidence: 45, description: "The instrument is a harpsichord (or possibly fortepiano) in grand/wing form with a characteristic asymmetric tapered case, curved bentside, keyboard at the wide end, and pointed tail. Not a piano — the shallow case depth, visible jack rail with bristle dampers, and string layout are consistent with harpsichord construction." },
    { type: "form", clue: "keyboard_instrument_case", confidence: 68, description: "Wing-shaped case typical of grand-form harpsichord: wide at keyboard end, tapering to a point at the tail, with curved bentside on the bass side and straight spine on the treble side." },
    { type: "function", clue: "musical_instrument", confidence: 45, description: "Functional keyboard instrument with full keyboard (appears to be approximately 4–5 octave range), strings, soundboard, and jack mechanism. Tuning tools (tuning hammer and mute) visible resting on the case." },
    { type: "structure", clue: "tapered_legs", confidence: 82, description: "Four tapered square-section legs visible, consistent with modern workshop harpsichord construction. Legs are slender and straight-tapered, not cabriole or turned, suggesting a modern or mid-20th-century build aesthetic." },
    { type: "materials", clue: "walnut_case", confidence: 84, description: "Case sides, lid, spine, bentside, and cheeks appear to be solid walnut or walnut-veneered panels. The warm brown color, visible grain pattern with cathedral figure on the lid, and characteristic walnut texture are consistent with black walnut (Juglans nigra). Grain is clearly visible on the lid in the overhead view." },
    { type: "materials", clue: "softwood_soundboard", confidence: 84, description: "The soundboard visible in the interior close-up shows very straight, tight, parallel grain consistent with spruce or cedar — the standard tonewoods for harpsichord soundboards. The grain is notably lighter and finer than the walnut case, and the straight parallel lines are characteristic of quarter-sawn spruce." },
    { type: "structure", clue: "two_choir_string_layout", confidence: 82, description: "The interior close-up shows two distinct rows of hitchpins and two sets of strings running parallel across the soundboard, indicating a two-choir (8' + 8' or 8' + 4') harpsichord. Two bridge lines are visible on the soundboard." },
    { type: "hardware", clue: "jack_rail_bristle_dampers", confidence: 45, description: "The jack rail is visible at the top of the keyboard area in the front view. In the interior close-up, what appears to be a row of bristle or felt dampers/jacks is visible along the nut/wrest plank area, consistent with harpsichord jack mechanism construction." },
    { type: "hardware", clue: "tuning_pins_visible", confidence: 62, description: "Rows of tuning pins are visible along the wrest plank at the keyboard end of the instrument in the interior view. The pins appear to be standard modern steel tuning pins." },
    { type: "hardware", clue: "hitchpins_visible", confidence: 62, description: "Rows of small metal hitchpins are visible along the curved bentside and tail area of the soundboard, with strings looped around them. Some strings at the tail end appear slack or missing." },
    { type: "style", clue: "modern_workshop_harpsichord_aesthetic", confidence: 52, description: "The instrument shows no painted decoration, no gilt moldings, no ornamental case painting, and no historical decorative treatment. The clean walnut case with minimal molding profiles and tapered legs is characteristic of 20th-century workshop harpsichord building tradition (post-1950 revival movement), rather than a historical Flemish, French, or Italian instrument." },
    { type: "style", clue: "no_painted_case_decoration", confidence: 52, description: "No painted interior or exterior decoration visible. Historical harpsichords typically had painted soundboards, painted case interiors, and often painted or marbled exteriors. The absence of any painted decoration strongly supports a modern (post-1950) workshop build." },
    { type: "materials", clue: "keyboard_key_covering", confidence: 60, description: "The natural keys appear white/cream and the sharps appear black. At this resolution it is not possible to distinguish genuine ivory from synthetic (plastic) key coverings. Modern workshop harpsichords typically use synthetic key coverings." },
    { type: "condition", clue: "string_condition_partial_slack", confidence: 45, description: "In the interior close-up, several strings near the tail end of the instrument appear slack, looped, or possibly broken/unstrung. This may indicate the instrument is partially unstrung for maintenance or has some string failures in the bass register." },
    { type: "condition", clue: "overall_condition_good", confidence: 45, description: "The case finish appears clean, even, and well-maintained with no visible major cracks, splits, or finish failures. The soundboard shows no visible cracks. The instrument appears to be in active use (tuning tools present, Bach bust decoration)." },
    { type: "label", clue: "visible_text_bach", confidence: 85, description: "The word 'BACH' is visible on the base of a decorative bust placed on the instrument. This is a decorative object (bust of J.S. Bach), not a maker mark on the instrument itself." },
    { type: "construction", clue: "lid_prop_stick", confidence: 45, description: "A lid prop stick (lid stay) is visible supporting the open lid at an angle, consistent with standard harpsichord lid construction. The prop appears to be a simple wooden or metal rod." },
    { type: "construction", clue: "music_desk_present", confidence: 45, description: "A music desk (music stand/rack) is visible resting on the case above the keyboard, consistent with standard harpsichord fittings. It appears to be walnut matching the case." },
    { type: "construction", clue: "bentside_curve", confidence: 95, description: "The curved bentside (bass side of the case) is clearly visible in the overhead view, showing the characteristic compound curve of a grand-form harpsichord case. The curve appears smooth and well-executed." },
    { type: "construction", clue: "soundboard_rose_absent", confidence: 70, description: "No decorative rose (the ornamental grille typically set into the soundboard of historical harpsichords) is visible in the interior views. Absence of a rose is common in modern workshop instruments and some simplified historical reproductions." },
    { type: "style", clue: "tuning_tools_present", confidence: 45, description: "A tuning hammer and what appears to be a mute or voicing tool are visible resting on the case in the interior close-up view, indicating the instrument is actively maintained and tuned." },
    { type: "materials", clue: "wood_species_walnut_group", confidence: 80, description: "The case wood shows warm brown coloration, visible open grain, and cathedral figure on the lid consistent with flat-sawn black walnut. The color and grain pattern are characteristic of American black walnut (Juglans nigra), commonly used in 20th-century American workshop harpsichord building." },
  ],
  asSeen: {
    formId: "Harpsichord",
    display: "Harpsichord (also commonly called: clavecin, clavicembalo)",
    finalStyleKind: "unresolved",
    dateRange: "Broad, not tightly dated",
    dateFloor: null,
    dateCeiling: null,
    confidence: "Low",
  },
};

const bassett_colonial_revival_upholstered_rocker_misid_windsor: ScanFixture = {
  label: "bassett_colonial_revival_upholstered_rocker_misid_windsor",
  note: "S027 Bassett Upholstery Division (Newton NC) mid-century Colonial Revival upholstered platform rocker — solid maple/cherry frame, scrolled arms, three FLAT vertical slats in the back, button-tufted mauve jacquard cushions, paired curved wooden rockers, full Bassett paper label captured. Engine displayed 'Windsor chair (also commonly called: Spindle chair, Sack-back chair)'. PHASE 0 PART A POST-DEPLOY REGRESSION: this is the FIRST scan since Deploy 006 merged that exercises the newly-authored rocking_chair_form Tier 3 clue — and the new clue FIRED CORRECTLY at conf 68 [form] weight 0.92 with description literally saying 'Paired curved wooden rockers are clearly visible... confirming rocking chair form... Not Windsor anatomy (upholstered, not plank seat with turned spindles)'. Yet the engine still picked form_windsor_chair. Why: M0 synthesizer over-emit fired spindle_back (conf 78, weight 0.83) and spindle_gallery (conf 70, weight 0.57) on a chair with THREE FLAT WIDE SLATS — no spindles. Those synthesized FPs route via substring-match against form_windsor_chair's aliases ('Spindle chair', 'Sack-back chair'), and the combined weight beats rocking_chair_form's 0.92 alone. Same exact pattern as S001 (black country rocker → 'Spindle Gallery Windsor chair'). Phase 0 Part A authored CLUE_LIBRARY + CLUE_TO_CANONICAL + CLUE_ROUTING entries for rocking_chair_form Tier 3 — but CLUE_ROUTING consumption is STILL ROLLED BACK (Step 6 wiring parked). The dictionary is data only. So even though the clue fired at proper weight, the form pipeline's substring-matching path on spindle aliases won. M0 + M8 stacked. ALSO M13 #4 (Bassett captured verbatim in 3 maker_label observations + maker_mark_bassett MEDIUM tier — display drops Bassett entirely). ALSO fix#10 5th 'American Empire / late Classical Revival' specimen (on live deploy; deterministic replay shifted to 'Spindle Gallery' canned label — the same pattern that hit S001). DEPLOYMENT-LAG OBSERVATION: live deploy returned style context 'American Empire / late Classical Revival' + date c. 1900-2000 (Broadly late 19th to 20th century). Dev branch (post-Deploy-006 merge) replays to context 'Spindle Gallery' + date null/null (Broad, not tightly dated). The deploy pipeline lags the just-merged main. asSeen reflects the dev-branch deterministic replay for FIDELITY ✓.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "rocking_chair_form", confidence: 68, description: "Paired curved wooden rockers are clearly visible beneath the chair legs in the side view, confirming rocking chair form. The chair has a full backrest, armrests, and upholstered seat and back cushions. Not Windsor anatomy (upholstered, not plank seat with turned spindles)." },
    { type: "form", clue: "seating_surface", confidence: 68, description: "Loose upholstered seat cushion resting on a solid wood seat platform/frame visible from front and side views." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Upholstered back cushion supported by a slatted wooden back frame with curved crest rail visible from front, side, and back views." },
    { type: "style", clue: "scrolled_arms", confidence: 52, description: "Prominent scrolled/curved wooden arms with a volute scroll at the front termination, visible clearly in front and side views. Colonial Revival / traditional styling influence." },
    { type: "style", clue: "style_cues", confidence: 52, description: "Scrolled arms, shaped back splats, turned front rocker support blocks, and curved crest rail suggest Colonial Revival or traditional American furniture styling, consistent with mid-20th-century production." },
    { type: "structure", clue: "vertical_supports", confidence: 82, description: "Vertical back slats visible in back view — three vertical wooden slats forming the back frame structure behind the cushion." },
    { type: "structure", clue: "solid_wood_construction", confidence: 82, description: "Frame members appear to be solid wood throughout — arms, back posts, seat rails, and rocker runners all show solid wood cross-sections and grain patterns consistent with solid hardwood construction." },
    { type: "materials", clue: "wood_species", confidence: 55, description: "Frame wood shows warm medium-brown tone with fine grain and smooth surface. Visible grain in back view shows diffuse-porous hardwood characteristics — likely maple or cherry. No strong ray fleck to suggest oak. Moderate confidence given finish obscures grain detail." },
    { type: "upholstery", clue: "serpentine_spring", confidence: 50, description: "Rear/underside view clearly shows parallel rows of sinuous/serpentine zigzag wire springs clipped into the seat frame rails, covered by a white quilted dust cover. Classic mid-20th-century upholstery construction." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 45, description: "The upholstery fabric appears to be a woven chenille or jacquard-type fabric in dusty mauve/rose color with subtle texture variation and slight ribbing. The woven texture with slight pattern complexity is consistent with a jacquard or chenille woven cover. Not velvet (no pile sheen), not damask (no reversible figured pattern). Chenille jacquard is the best fit." },
    { type: "upholstery", clue: "button_tufting", confidence: 50, description: "Back cushion shows regular grid of button-tufted dimples with covered fabric buttons visible — approximately 6 buttons in a 2x3 grid pattern on the back cushion. Seat cushion does not appear tufted." },
    { type: "upholstery", clue: "foam_padding", confidence: 50, description: "Loose seat and back cushions appear to have foam padding fill based on their boxy shape, firm edges, and consistent thickness. Consistent with mid-20th-century or later upholstery construction." },
    { type: "label", clue: "maker_label", confidence: 85, description: "Paper label clearly visible on underside/seat bottom showing 'Bassett' in large decorative lettering repeated three times, with sub-text reading 'Style', 'Quality', 'Value', 'World's Largest Furniture Manufacturer', 'Bassett Upholstery Division', 'Newton, N. C.' This is a high-confidence Bassett maker attribution — full firm name present." },
    { type: "label", clue: "visible_text", confidence: 85, description: "Label text reads: 'Bassett' (large, repeated), 'Style', 'Quality', 'Value', 'World's Largest Furniture Manufacturer', 'Bassett Upholstery Division', 'Newton, N. C.' The 'Bassett Upholstery Division' designation and Newton, NC location are specific production details supporting mid-to-late 20th century Bassett production." },
    { type: "condition", clue: "finish_wear_rear_frame", confidence: 54, description: "Rear frame members show significant finish loss, black paint or stain drips/runs, and surface degradation visible in the underside/rear view. The back posts and lower frame show irregular black marks consistent with old finish drips or paint contamination. Front and side show intact finish in better condition." },
    { type: "condition", clue: "upholstery_soiling", confidence: 54, description: "Seat cushion shows visible soiling and wear, particularly in the center. Back cushion shows some surface soiling. Fabric appears faded and compressed from use." },
    { type: "hardware", clue: "round_wood_knob", confidence: 45, description: "Small round wooden button/plug visible at back post corners in the back view — appears to be decorative wooden plugs or bolt covers at the back rail-to-post joints." },
    { type: "finish", clue: "shellac_intact", confidence: 45, description: "Front and side frame surfaces show a warm amber-brown finish with moderate sheen consistent with shellac or lacquer. No obvious plastic-like polyurethane build visible on show surfaces. Finish appears original or early refinish." },
    { type: "finish", clue: "lacquer_finish", confidence: 55, description: "The smooth, consistent medium-brown finish on show surfaces is consistent with a sprayed lacquer finish typical of mid-20th-century factory furniture production. Difficult to distinguish from shellac at this resolution." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "cushion compression" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "structure", clue: "spindle_back", confidence: 78, description: "Spindles are visible in the back or side rail." },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
    { type: "label", clue: "maker_mark_cabinetmaker_paper_labels_and_inscriptions", confidence: 50, description: "Detected maker mark: Cabinetmaker paper labels and inscriptions (generic). Mark type: paper_label. Dating reference: 1770-1860. Confidence tier: LOW." },
    { type: "label", clue: "maker_mark_bassett", confidence: 70, description: "Detected maker mark: Bassett. Mark type: paper_label. Dating reference: post-1902. Confidence tier: MEDIUM." },
    { type: "label", clue: "maker_mark_authored_best_home_furnishings", confidence: 30, description: "Possible Best Home Furnishings match (low confidence; LOW per Confidence Ladder). Detected initials \"best\" alone do not establish Best Home Furnishings attribution. Initials may identify a maker only when they appear within a known maker-specific device, label, stencil, burn mark, paper tag, or model-code format. Surface as low-confidence pending full maker name, branded device, or supporting construction-and-form evidence." },
  ],
  asSeen: {
    formId: "Rocking chair",
    display: "Bassett Rocking chair",
    styleContext: "Spindle Gallery",
    finalStyleKind: "context_only",
    dateRange: "Broad, not tightly dated",
    dateFloor: null,
    dateCeiling: null,
    confidence: "Low",
  },
};

const jacobean_revival_oak_tobacco_smoking_stand: ScanFixture = {
  label: "jacobean_revival_oak_tobacco_smoking_stand",
  note: "S028 quartersawn oak Jacobean Revival tobacco/smoker's stand — small cabinet-on-stand with turned spindle gallery, single door with strap hinges + metal-lined humidor interior, lower open shelf with arched apron, four turned legs with square block sections at joints, ray-fleck quartersawn oak primary wood. Engine reported 'Tudor Revival / Jacobean Revival / Elizabethan Revival Smoking stand' c. 1890-1930 Moderate (Low date), kind=original_period. END-TO-END SUCCESS — 5th CONTRAST CASE joining S013/S014/S021/S025/S028 (and S007 the earlier Jacobean Revival tall case clock that helped seed this pattern). What worked: (1) form_smoking_stand correctly identified from door_present + open_shelving + form clues; (2) style_family_tudor_revival attributed conf 0.92 from matched_terms ['revival','jacobean']; (3) original_period reconciliation correctly identified — final dating 1890-1930 falls within attribution period 1880-1940 (not revival_wave); (4) parseStyleProseDate (#6 fix) WORKED: 'No datable construction evidence, but the style reads consistently as c. 1890-1930 across multiple observations; the working range is anchored there (style-derived, low confidence) rather than a generic default' — exactly the fallback semantics the fix was designed for; (5) confidence cap correctly Moderate, date confidence Low — engine honest about evidence depth. M11 #8 with DEFENSIBLE OUTCOME (joining S021/S025/S028): 'revival'+'jacobean' tokens scraped from description prose (no clue KEY contains these tokens) → Tudor Revival family attribution. Outcome correct since the piece IS Tudor/Jacobean Revival 1890-1930. Same broken mechanism, defensible answer. P0 QUALITY ISSUE #2 (joining S023, n=2 promotion bar met): FIVE observations with NO clue key (form/condition/finish/materials/construction/style multi-category keyless); door_present is OVERLOADED across [form], [style], [hardware], [materials], [finish], [construction], [condition] = SEVEN buckets with unrelated descriptions (cabinet form, Jacobean style, strap hinges, metal interior lining, finish appearance, joinery, interior ring mark). Despite this P0 mess, the downstream pipeline survived and produced a defensible answer — the keyless descriptions get carried as their own clue 'keys' (long description text) in P4 weighted_clues at moderate weight. The system is robust to clue-key chaos here. M5 recurring (12th): four descriptions carry 'circa 1890-1930' / '1890-1930' / 'circa 1900-1930' dating prose, captured by parseStyleProseDate's intersection logic at ≥2 windows agree — confirms #6 fix is the right architecture for these cases.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "door_present", confidence: 68, description: "Overall front view shows a small cabinet-on-stand form with a single door cabinet in the middle section, a turned spindle gallery above, and a lower open shelf. This is consistent with a Jacobean Revival tobacco/smoker's stand, circa 1900-1930." },
    { type: "materials", clue: "solid_wood_construction", confidence: 45, description: "The primary material throughout appears to be oak, visible in the prominent ray-fleck grain pattern on the cabinet side panels (clearly visible in the overall_side and joinery_closeup images). The stiles and rails show open-grain oak texture." },
    { type: "style", clue: "door_present", confidence: 52, description: "Jacobean Revival style indicators throughout: turned baluster legs with square block sections at rail intersections, turned spindle gallery at top, strap-style decorative hinges on the door. This style was popular in English and American furniture circa 1890-1930." },
    { type: "hardware", clue: "door_present", confidence: 62, description: "Two decorative strap hinges visible on the right side of the cabinet door in the overall_front image. The hinges appear to be iron or steel with a butterfly/shield-shaped decorative plate, consistent with Jacobean Revival hardware. They show surface oxidation/darkening consistent with age." },
    { type: "hardware", clue: "round_wood_knob", confidence: 45, description: "A small round turned wood knob is visible on the left side of the cabinet door in the overall_front image, serving as the door pull. It appears to be the same oak as the rest of the piece." },
    { type: "materials", clue: "door_present", confidence: 45, description: "Interior of the cabinet (visible in joinery_closeup with door open) shows a metal-lined interior — appears to be copper or tin sheet lining the inside of the door and possibly the cabinet box. This is characteristic of a tobacco humidor or smoker's cabinet, designed to retain moisture for tobacco." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 75, description: "The leg construction shows square block sections at the points where the horizontal rails and stretchers intersect the turned legs. This block-and-turned construction is typical of mortise-and-tenon joinery where the square section accommodates the tenon entry from multiple directions. Clearly visible in multiple joinery_closeup images." },
    { type: "form", clue: "open_shelving", confidence: 45, description: "A lower open shelf with a curved/arched apron is visible beneath the cabinet section in all views. The shelf appears to be a solid wood panel with a gently arched front edge, supported by the four turned legs." },
    { type: "form", clue: "", confidence: 45, description: "Above the cabinet, there is a turned spindle gallery consisting of multiple turned balusters connecting the four corner posts. The side view (overall_side) shows two horizontal turned spindle rails connecting the posts at the top, creating a rack-like structure — possibly for holding pipes or as a decorative gallery." },
    { type: "condition", clue: "", confidence: 54, description: "The feet of the legs show significant wear — the turned foot detail is worn down and the finish is abraded at the base, visible in the joinery_closeup of the lower leg. The square block sections also show exposed raw wood grain where the dark finish has worn through, indicating genuine age and use." },
    { type: "finish", clue: "door_present", confidence: 45, description: "The overall finish appears to be a dark brown stain with a shellac or lacquer topcoat. The finish shows crazing and wear consistent with age. The interior of the cabinet box (visible in the open-door joinery_closeup) shows a lighter, less finished wood surface on the back panel." },
    { type: "materials", clue: "", confidence: 50, description: "Ray fleck pattern visible on the cabinet side panels in the overall_side and joinery_closeup images strongly suggests quartersawn oak. The medullary rays appear as lighter flecks across the grain, a hallmark of quartersawn oak commonly used in Arts & Crafts and Jacobean Revival furniture." },
    { type: "construction", clue: "", confidence: 45, description: "The joinery_closeup of the lower leg foot area shows the square block section where the arched lower stretcher/shelf meets the leg. The stretcher appears to be tenoned into the square block. The end grain of the block is visible and shows the wood is solid, not veneered." },
    { type: "condition", clue: "door_present", confidence: 54, description: "The interior of the cabinet box (visible in the open-door joinery_closeup) shows a circular ring mark on the bottom shelf, consistent with a tobacco jar or humidor container having been stored there. The interior wood is darkened from use." },
    { type: "style", clue: "", confidence: 45, description: "The overall form — small cabinet on tall turned legs with spindle gallery above and lower shelf — is consistent with an English or American Jacobean Revival tobacco/smoker's stand or pipe cabinet, a popular form from approximately 1890-1930. The piece may be English rather than American given the specific form and hardware style." },
  ],
  asSeen: {
    formId: "Smoking stand",
    display: "Tudor Revival / Jacobean Revival / Elizabethan Revival Smoking stand (also commonly called: Smoking stand, Ash stand)",
    styleContext: "Tudor Revival / Jacobean Revival / Elizabethan Revival",
    finalStyleKind: "original_period",
    dateRange: "c. 1890–1930",
    dateFloor: 1890,
    dateCeiling: 1930,
    confidence: "Low",
  },
};

const eastlake_modern_gothic_parlor_lounge_chair: ScanFixture = {
  label: "eastlake_modern_gothic_parlor_lounge_chair",
  note: "S029 Eastlake Aesthetic Movement parlor lounge chair / armchair with classic Eastlake vocabulary: incised geometric ornament, diamond-and-cross carved corner blocks, circular boss/roundel accents, rectilinear silhouette, turned-and-carved front legs with porcelain casters, corbel-style arm supports, open-frame back with set-in upholstered panel. Heavily worn period-appropriate upholstery (damask/jacquard cover, fringe trim, gimp braid) — likely later reupholstery campaign. Engine reported 'Eastlake / Modern Gothic Lounge chair' c. 1870-1895 HIGH (Moderate at frame date), kind=original_period. END-TO-END SUCCESS — 6th CONTRAST CASE joining S007/S013/S014/S021/S025/S028. What worked: (1) form_lounge_chair correctly selected via posture-based clue (lounge_chair_form 0.78) despite armchair_form weight 0.93; (2) style_family_eastlake attributed conf 0.70 from matched_terms=['eastlake'] — CRITICALLY this is NOT prose-only M11 leak: the 'eastlake' token IS in clue KEY eastlake_hardware. Proper supported attribution path. Distinguishes from S020/S021/S023/S025/S028 prose-only family attributions; (3) original_period reconciliation correctly fired (dating 1870-1895 within attribution 1870-1890); (4) convergence zone 1870-1920 spanning 5 layers (joinery, hardware, upholstery, style, style_wave) — multi-layer dating worked; (5) P5 conflict resolution down-weighted porcelain_caster correctly (replacement risk per existing rule); (6) frame/upholstery split (Block 14) correctly separated 22 frame · 6 upholstery clues; (7) confidence cap correctly High at 85%. M7 negation-as-observation specimen (n=4 joining S007/S008/S012): modern_caster fired at conf 60 with description 'Casters do not appear to be modern rubber or plastic type' — classic M7 pattern, harmless here because the weighted-clue downstream uses porcelain_caster as primary. Also notable: BOTH damask_cover AND jacquard_cover fired (LLM uncertainty between similar materials) — reasonable disambiguation behavior, both routed to [upholstery]. Alternative style attribution 'Aesthetic Movement / Japanesque' conf 0.70 with matched_terms=['aesthetic'] — this DOES leak via prose ('Eastlake Aesthetic Movement' in multiple descriptions); confirms M11 mechanism is alive but the primary attribution won via legitimate clue-key path. This fixture is an important distinction in the M11 taxonomy: clue-key-sourced family tokens (eastlake_hardware → Eastlake) are CORRECT and must not be broken by any M11 fix; only prose-only family tokens are the leak.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Large upholstered seat cushion/platform visible, spanning the full width of the chair frame." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Upholstered back panel set within a rectilinear carved wood frame; back is tall and rectangular with a crest rail above." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Single-seat chair with two armrests, each with a separate upholstered arm pad and carved wood arm support. One-person seating form confirmed." },
    { type: "style", clue: "eastlake_hardware", confidence: 52, description: "Frame exhibits classic Eastlake Aesthetic Movement ornament: incised geometric linework on stiles and rails, diamond-and-cross carved corner blocks, circular boss/roundel accents, and rectilinear overall silhouette. This is frame decoration, not hardware per se, but the Eastlake vocabulary is unmistakable and strongly dates the piece to c. 1870-1895." },
    { type: "style", clue: "style_cues", confidence: 52, description: "Incised geometric ornament, diamond motifs, circular bosses, rectilinear frame, turned front legs with carved capitals, and corbel-like arm supports are all canonical Eastlake Aesthetic Movement vocabulary, c. 1870-1895." },
    { type: "structure", clue: "legs", confidence: 82, description: "Front legs are turned with carved/reeded detail and terminate in casters. Rear legs are square-section, slightly splayed, and terminate in plain feet visible in back view." },
    { type: "hardware", clue: "porcelain_caster", confidence: 62, description: "Casters visible on front legs appear to have a ceramic/porcelain wheel — consistent with Victorian-era porcelain casters, c. 1840-1910. The greenish-gray color and rounded wheel profile are consistent with porcelain casters. Confidence moderate as close-up not available." },
    { type: "hardware", clue: "modern_caster", confidence: 60, description: "Casters do not appear to be modern rubber or plastic type; they appear older and consistent with porcelain or early metal casters." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 45, description: "The upholstery fabric shows a small-scale repeating geometric/floral medallion pattern woven into the fabric ground — consistent with a machine-loomed jacquard or brocatelle weave. The pattern is regular and repeating across seat, back, and arm pads. Could also be a damask; the pattern appears to have slight texture relief suggesting jacquard weave rather than flat damask. Confidence moderate." },
    { type: "upholstery", clue: "damask_cover", confidence: 40, description: "Alternative classification considered: the fabric could be a damask with a small repeating medallion pattern. However, the slight texture relief and the way the pattern reads suggests jacquard over damask. Noted as alternative." },
    { type: "upholstery", clue: "nailhead_trim", confidence: 50, description: "A row of small decorative nailheads is visible along the lower edge of the seat apron/front rail, securing or trimming the upholstery edge. Visible in overall_front image as a line of small dark dots." },
    { type: "upholstery", clue: "hand_tacks", confidence: 45, description: "The nailhead row along the seat apron appears to be individually placed upholstery tacks rather than a modern nailhead strip, consistent with period hand-tacked upholstery attachment." },
    { type: "condition", clue: "upholstery_wear", confidence: 45, description: "Upholstery fabric is heavily soiled, faded, and worn. Fringe trim along the seat front is severely deteriorated and fraying. Arm pad fabric is splitting and unraveling at edges. The fabric appears to be a later reupholstery campaign over the original frame." },
    { type: "condition", clue: "frame_condition", confidence: 54, description: "Wood frame shows wear and finish loss, particularly on the legs and lower rails. Some surface darkening and patina consistent with age. No obvious structural breaks visible. Frame appears sound." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Frame members appear to be solid wood throughout — stiles, rails, legs, arm supports, and carved corner blocks all appear to be solid rather than veneered. The depth of carving on corner blocks and the turned leg profiles support solid wood construction." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 55, description: "The rectilinear frame construction with stiles, rails, and arm supports is consistent with mortise-and-tenon joinery typical of Victorian parlor chair frames. No joinery is directly visible but the structural logic of the frame strongly implies M&T construction." },
    { type: "construction", clue: "corner_block_reinforcement", confidence: 50, description: "The carved corner blocks at the arm-to-stile junctions serve both decorative and structural roles; internal corner blocks are likely present at seat rail junctions as is typical in Victorian parlor chair construction." },
    { type: "structure", clue: "stretcher_rail", confidence: 82, description: "A horizontal stretcher rail is visible connecting the two rear legs at the base, visible in the back view image. This is a structural element providing racking resistance." },
    { type: "style", clue: "incised_geometric_ornament", confidence: 52, description: "Incised linework (parallel grooves, cross-hatching, geometric channels) is visible on the stiles, crest rail, and arm supports — a defining characteristic of Eastlake Aesthetic Movement furniture, c. 1870-1895." },
    { type: "style", clue: "carved_corner_blocks_diamond_motif", confidence: 52, description: "Prominent carved corner blocks at the junctions of the back stiles and seat rail feature diamond-within-square and cross motifs — highly characteristic Eastlake ornamental vocabulary." },
    { type: "style", clue: "circular_boss_roundel", confidence: 52, description: "Small circular boss/roundel accents are visible on the stiles between the carved corner blocks — another Eastlake Aesthetic Movement decorative element." },
    { type: "upholstery", clue: "button_tufting", confidence: 45, description: "No button tufting is visible on the back panel or seat. The upholstery appears to be flat/smooth without tufted dimples." },
    { type: "upholstery", clue: "fringe_trim", confidence: 50, description: "Decorative fringe trim is visible along the front edge of the seat apron — now heavily deteriorated and fraying. This is a period-appropriate decorative element for Victorian parlor seating." },
    { type: "upholstery", clue: "gimp_braid_trim", confidence: 50, description: "Gimp or braid trim is visible along the edges of the back upholstery panel (visible in back view), used to finish the upholstery edge where it meets the wood frame." },
    { type: "condition", clue: "refinished_surface", confidence: 40, description: "The frame finish appears to be an older dark finish — possibly original shellac or an early varnish — but the surface is too worn and the images too distant to confirm whether the frame has been refinished. No obvious signs of modern polyurethane pooling or plastic sheen visible." },
    { type: "structure", clue: "back_panel_open_frame", confidence: 82, description: "The back of the chair (visible in back view) shows an open wood frame with the upholstered back panel set within it — no solid wood back panel or plywood back. The frame is exposed at the rear, showing the structural stiles and rails." },
    { type: "form", clue: "crest_rail", confidence: 68, description: "A shaped crest rail is visible at the top of the back, with a slightly curved or scrolled profile and carved/incised detail, sitting above the upholstered back panel." },
    { type: "style", clue: "corbel_arm_supports", confidence: 52, description: "The arm supports (front arm posts) have a corbel-like or bracket form with carved detail — a characteristic Eastlake parlor chair feature. Visible on both front and side views." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "exposed wood frame with upholstered back panel and seat" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
  ],
  asSeen: {
    formId: "Lounge chair",
    display: "Eastlake / Modern Gothic Lounge chair (also commonly called: Easy chair, Club chair)",
    styleContext: "Eastlake / Modern Gothic",
    finalStyleKind: "original_period",
    dateRange: "c. 1870–1895",
    dateFloor: 1870,
    dateCeiling: 1895,
    confidence: "Moderate",
  },
};

const ok_brand_automatic_file_index_sectional_bookcase: ScanFixture = {
  label: "ok_brand_automatic_file_index_sectional_bookcase",
  note: "S030 Automatic File & Index Co. (Green Bay WI) 'OK' brand sectional/barrister bookcase — quartersawn white oak, two stacked glazed sections, frame-and-panel sides, chamfered top corners, original aged shellac finish with crazing. Full paper label captured verbatim: 'SECTIONAL OK BOOK CASES / MANUFACTURED BY / The Automatic File & Index Co. / GREEN BAY / WISCONSIN'. Engine reported 'Arts and Crafts / Mission / Craftsman Bookcase / open shelving unit' c. 1900-1930 Moderate (P1 cap High 86%), kind=original_period. END-TO-END SUCCESS — 7th CONTRAST CASE joining S007/S013/S014/S021/S025/S028/S029. What worked: form_bookcase correct; style_family_arts_and_crafts attributed conf 0.92 matched_terms=['arts','crafts','mission'] supported=true; kind=original_period (final 1900-1930 within attribution 1895-1930); convergence zone 1895-1930 spanning 4 layers (joinery, finish, style, style_wave); P5 down-weighted round_wood_knob for replacement risk. CRITICAL M11 sub-finding: matched_terms ['arts','crafts','mission'] are PROSE-ONLY (no clue KEY contains these tokens). Same prose-only mechanism as S020/S021/S023/S025/S028. The piece IS Mission/A&C era so outcome is defensible. Distinct from S029 where 'eastlake' WAS in clue key eastlake_hardware (proper clue-key path). Now have TWO clearly-distinguished M11 sub-patterns: clue-key-sourced (S029 correct) vs prose-only (S020/S021/S023/S025/S028/S030 — some wrong, some defensible). M13 specimen #5 — 'Automatic File & Index Co. Green Bay Wisconsin' captured verbatim in 3 label observations, display drops the maker entirely. Now 5 M13 specimens: S022 Globe-Wernicke, S023 GM Radio, S024 Regina, S027 Bassett, S030 Automatic File & Index — ALL factory/branded furniture firms. SUBTYPE-DETECTION-MISSED #4 (joining S022/S024/S025): unambiguously a SECTIONAL/BARRISTER bookcase — explicitly identified as such in multiple descriptions and the maker label — but form just stays form_bookcase. Same shape as S022 Globe-Wernicke. M7 NEGATION-AS-OBSERVATION #5: china_cabinet_form (a NEW Phase 0 Part A clue) fired at conf 68 with description 'Not a china cabinet — this is a sectional/barrister bookcase'. The LLM correctly REJECTED the Phase 0 china-cabinet candidate using the new clue key in NEGATION mode. Interesting Phase 0 Part A side-effect — useful LLM behavior. CLUE_ROUTING is rolled back so the Tier 3 china_cabinet_form clue can't pull form selection here regardless; would need to investigate negation handling if/when Step 6 re-wires consumption.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "label", clue: "maker_label", confidence: 85, description: "Paper label clearly reads 'SECTIONAL OK BOOK CASES / FINISH / MANUFACTURED BY / The Automatic File & Index Co. / GREEN BAY / WISCONSIN'. Full maker name and city/state present. High-authority attribution evidence." },
    { type: "label", clue: "visible_text", confidence: 48, description: "Product line name visible on label: 'SECTIONAL OK BOOK CASES' with 'OK' prominently centered in large type. 'FINISH' appears to be a fill-in field for finish color/type, partially illegible." },
    { type: "form", clue: "china_cabinet_form", confidence: 68, description: "Not a china cabinet — this is a sectional/barrister bookcase with two glazed sections stacked, designed for book storage. Glazed lift-front or sliding glass doors on each section. Interior shelves visible through glass. Form is horizontal/low rather than tall vitrine." },
    { type: "form", clue: "open_shelving", confidence: 68, description: "Two glazed shelf sections visible, each enclosed by a glass panel door. Interior shelf surfaces visible through glass. Consistent with sectional barrister bookcase form — each section is a self-contained glazed unit." },
    { type: "form", clue: "door_present", confidence: 68, description: "Two glass panel doors visible, one per shelf section. Each door has a small round wooden knob centered on the lower rail. Doors appear to be the lift-front or sliding type characteristic of barrister/sectional bookcases." },
    { type: "materials", clue: "wood_species_oak_group", confidence: 84, description: "Strong ray fleck pattern visible across the top surface and frame members. Tight linear grain with silver ray flake characteristic of quarter-sawn white oak. Consistent with Golden Oak / Mission era production." },
    { type: "style", clue: "cut_grain_phenomenon_quarter_sawn", confidence: 52, description: "Quarter-sawn oak with prominent ray fleck visible on top panel and apron/frame members. The medullary ray pattern is clearly visible as a wavy/flecked figure across the top surface, consistent with quarter-sawn white oak used in Golden Oak and Mission/Arts & Crafts era production c. 1890-1920." },
    { type: "hardware", clue: "round_wood_knob", confidence: 62, description: "Two small round wooden knobs visible, one centered on each glazed door section. Knobs appear turned, dark-stained wood, consistent with period production hardware on sectional bookcases c. 1895-1930." },
    { type: "construction", clue: "frame_and_panel_sides", confidence: 80, description: "Side panels show frame-and-panel construction with stile and rail members visible. The sectional units stack with a flat top cap. Corner joinery shows chamfered/rounded edges on the top cap corners." },
    { type: "condition", clue: "shellac_crazing", confidence: 54, description: "Top surface shows extensive finish crazing — a network of fine cracks and white haze/bloom consistent with aged shellac failure. The white milky patches and craze pattern across the top are characteristic of shellac deterioration from moisture exposure. Finish appears original and heavily aged." },
    { type: "condition", clue: "refinished_surface", confidence: 54, description: "Surface does not appear refinished — the crazing, bloom, and wear patterns are consistent with original aged finish rather than a later refinish campaign. Wear is integrated with the surface rather than sitting beneath a modern topcoat." },
    { type: "condition", clue: "condition_cues", confidence: 54, description: "Top surface has heavy finish deterioration with white bloom/haze and crazing. Glass panels appear intact but dirty. Frame and structural members appear sound with no visible breaks or major losses. Dust accumulation throughout consistent with long storage." },
    { type: "structure", clue: "vertical_supports", confidence: 82, description: "Four corner legs/posts visible, relatively slender, square-section, consistent with sectional bookcase stile construction. Bottom base section visible with stretcher rail at floor level." },
    { type: "structure", clue: "solid_wood_construction", confidence: 82, description: "Frame members appear to be solid quarter-sawn oak throughout — stiles, rails, top cap, and apron members all show consistent solid wood grain. No visible veneer lifting or substrate exposure at edges." },
    { type: "style", clue: "style_cues", confidence: 52, description: "Rectilinear form, quarter-sawn oak with prominent ray fleck, glazed lift-front doors, small round knobs, and stacked sectional construction are all consistent with American sectional/barrister bookcase production c. 1895-1930. The 'OK' brand and Green Bay, Wisconsin maker attribution support Midwestern factory production in this era." },
    { type: "function", clue: "display", confidence: 70, description: "Glazed doors on each section allow display of books or objects while protecting from dust. This is the defining functional feature of the barrister/sectional bookcase form — glazed protection for book storage." },
    { type: "construction", clue: "factory_case_construction", confidence: 88, description: "The sectional stacking system, consistent section dimensions, standardized glass door hardware, and uniform frame construction are consistent with factory production rather than custom hand-built cabinetry. The 'OK' brand label confirms commercial/factory origin." },
    { type: "label", clue: "visible_text", confidence: 88, description: "Geographic origin clearly stated on label: Green Bay, Wisconsin. The Automatic File & Index Co. was a Green Bay, WI manufacturer. This is a regional Midwestern factory production attribution." },
    { type: "materials", clue: "glass_panels", confidence: 45, description: "Glass panels visible in both door sections. Glass appears to be flat plate glass. Panels are dirty but intact. The glass is set into wooden frames on each sectional unit." },
    { type: "construction", clue: "chamfered_top_corners", confidence: 82, description: "Top cap corners show chamfered/clipped profile rather than sharp 90-degree corners. This is a subtle decorative detail visible on the top cap of the bookcase, consistent with period production finishing details." },
    { type: "materials", clue: "glass_top", confidence: 50, description: "glass panels intact but dirty" },
    { type: "form", clue: "cabinet_form", confidence: 68, description: "Cabinet or cupboard form is visible." },
    { type: "label", clue: "maker_mark_cabinetmaker_paper_labels_and_inscriptions", confidence: 50, description: "Detected maker mark: Cabinetmaker paper labels and inscriptions (generic). Mark type: paper_label. Dating reference: 1770-1860. Confidence tier: LOW." },
  ],
  asSeen: {
    formId: "Bookcase / open shelving unit",
    display: "Arts and Crafts / Mission / Craftsman Bookcase / open shelving unit",
    finalStyleKind: "original_period",
    dateRange: "late 19th to early 20th century",
    dateFloor: 1900,
    dateCeiling: 1930,
    confidence: "Moderate",
  },
};

const quartersawn_oak_office_bankers_swivel_tilt_chair: ScanFixture = {
  label: "quartersawn_oak_office_bankers_swivel_tilt_chair",
  note: "S031 American Victorian quartersawn oak office/banker's swivel-tilt chair, c. 1885-1910 — carved crest rail with Eastlake-style incised acanthus + scroll decoration, carved leaf/feather back-stile motifs, turned spindle arm supports, cast iron swivel-and-tilt mechanism with coil tilt spring, four-leg splayed pedestal base, deteriorated leather seat with period upholstery tacks, possible branded maker's mark on crest rail ('PRINCE'-ish text uncertain). Engine reported 'Upholstered armchair' c. 1890-1920 Moderate (P1 cap High 85%), kind=unresolved. MIXED OUTCOME — date broadly correct (1890-1920 brackets actual 1885-1910), form broadly correct (form_armchair vs more specific office/banker's subtype), but style attribution dropped despite Eastlake/Renaissance Revival being mentioned in 2 keyless [style] descriptions. SUBTYPE-MISS (5th specimen, joining S022/S024/S025/S030): four descriptions explicitly identify this as 'American Victorian office chair' / 'office/banker's swivel armchair' / 'American Victorian office/banker's chair' — form stays generic form_armchair, no office_chair / banker_chair subtype refinement. M11 NEGATIVE CALIBRATION CASE (important — useful for future M11 fix): 'eastlake' AND 'renaissance' tokens BOTH appear in description prose, but only in [style] keyless descriptions @ 0.37 each. No clue KEY contains either token. The mechanism did NOT fire here — style attribution stayed null. Confirms the threshold: prose-only single-token mentions don't trigger attribution (need >0.60 conf for single-token attribution per existing logic). Compared to S029 where eastlake_hardware clue key + multiple eastlake mentions pushed conf 0.70 over the floor. M9 PARTIAL MAKER MARK MISS (NEW shape, n=1): keyless [label] obs at conf 45 says crest rail may have pressed/branded text reading 'PRINCE' or similar. Not captured as maker_label clue, not run through matchMakerMarks. Branded furniture marks on chair backs (Heywood Bros, American Chair Co., Murphy, Prince) need a more permissive maker-mark detection path. M6 SPECIMEN (n=13): wrought_iron material clue (conf 50) keyed to 'cast iron swivel hardware' — material clue describing INTERNAL CAST IRON MECHANISM (not wrought iron, not structural), promoted to materials layer at weight 0.72. Same chain as S017/S024 — internal mechanism material misclassified. CLUE_LIBRARY DATING REFERENCE LIKELY WRONG: coil_spring dated 'c. 1780-1830' in the trace. Coil-spring upholstery wasn't widespread until 1830s-1850s; the 1780 floor is too early. Also: cut_nail (1790-1890) applied to UPHOLSTERY TACKS — semantically wrong (hand_tacks would be more accurate routing) but doesn't drag dating wildly. Two convergence zones (1800-1830 spurious from cut_nail+coil_spring+finish; 1880-1890 from fastener+hardware+finish) — engine correctly picked the later/more relevant zone for P2 frame range.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "armchair_form", confidence: 68, description: "Overall front view shows a full armchair form with curved arms, carved crest rail backrest, upholstered seat, and pedestal swivel base. This is a classic late 19th-century American oak office/banker's swivel armchair." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Quartersawn oak is clearly visible throughout — the ray fleck medullary pattern is prominently visible on the arm rail in the overall_side image and on the seat frame in the underside image. This is characteristic American quartersawn white oak used extensively in furniture c.1880-1910." },
    { type: "style", clue: "", confidence: 55, description: "Crest rail features deeply incised/carved acanthus leaf and scroll decoration at both upper corners, with a central pressed or carved decorative panel. This ornamental vocabulary is consistent with Victorian-era American furniture, specifically the Eastlake or Renaissance Revival influence popular c.1880-1900." },
    { type: "style", clue: "", confidence: 55, description: "The back stiles feature carved leaf/feather motifs at the junction with the crest rail and seat rail. This carved detail is visible in both joinery_closeup images and is consistent with high-grade American Victorian office chair production." },
    { type: "hardware", clue: "swivel_mechanism", confidence: 62, description: "Underside image clearly shows a cast iron swivel and tilt mechanism with a large coil spring (tilt-back spring). The mechanism is heavily rusted. This type of spring-tilt swivel hardware is characteristic of American office chairs manufactured c.1880-1910, often by firms like American Chair Co. or Heywood Brothers." },
    { type: "condition", clue: "rust_pitting", confidence: 54, description: "The cast iron swivel and spring mechanism visible in the underside photo shows significant surface rust and oxidation. The mechanism appears structurally intact but heavily corroded." },
    { type: "condition", clue: "", confidence: 54, description: "The leather seat upholstery is severely deteriorated — cracking, peeling, and separating from the seat frame at the front edge. The leather surface shows heavy crazing, staining, and structural failure. The tack/nail strip holding the leather is visible at the seat perimeter." },
    { type: "fasteners", clue: "cut_nail", confidence: 50, description: "Small decorative upholstery tacks/nails are visible along the perimeter of the leather seat in multiple images. These appear to be round-headed upholstery tacks consistent with period installation. Also visible in the underside image is a modern hex bolt used in the swivel mechanism, suggesting some hardware repair." },
    { type: "construction", clue: "", confidence: 90, description: "The arm supports consist of multiple turned spindle balusters — visible clearly in the joinery_closeup (back view) showing three turned oak spindles with ring-turned detail connecting the arm rail to the seat frame. This is a distinctive feature of American Victorian office chairs." },
    { type: "construction", clue: "swivel_mechanism", confidence: 45, description: "The base appears to be a four-leg splayed pedestal/claw base in oak, visible in the front and side joinery closeup images. The legs splay outward from a central column that connects to the cast iron swivel mechanism." },
    { type: "label", clue: "", confidence: 45, description: "The crest rail back panel appears to have pressed or branded lettering/text visible as lighter-toned characters against the darker oak background. The text is partially legible across multiple images — appears to be two words, possibly a maker's name or institutional identification. Letters suggest something like 'PRINCE' or similar, but cannot be confirmed with certainty. This may be a maker's brand burned or pressed into the wood." },
    { type: "finish", clue: "shellac_intact", confidence: 45, description: "The wood finish appears to be an original shellac or early lacquer finish — darkened with age and showing wear at high-contact areas (arm tops, seat frame edges) but largely intact on the back panel and crest rail. No evidence of modern polyurethane recoating." },
    { type: "materials", clue: "", confidence: 50, description: "The medullary ray fleck pattern clearly visible on the arm rail in the overall_side image confirms quartersawn oak. The fleck pattern shows the characteristic silver/ribbon grain of quartersawn white oak, consistent with American furniture production c.1880-1910." },
    { type: "context", clue: "", confidence: 48, description: "A small white label reading 'Antiques' is visible in the background of the underside photo, suggesting this piece is being sold through or evaluated by an antiques dealer." },
    { type: "style", clue: "pedestal_column", confidence: 52, description: "The overall form — quartersawn oak, carved crest rail, turned spindle arm supports, spring-tilt swivel mechanism on a four-leg pedestal base — is consistent with American Victorian office/banker's chairs produced c.1885-1905, likely by a major American chair manufacturer such as Heywood Brothers & Wakefield, American Chair Co., or a similar period producer." },
    { type: "joinery", clue: "mortise_and_tenon", confidence: 50, description: "mortise and tenon likely at back post joints" },
    { type: "materials", clue: "wrought_iron", confidence: 50, description: "cast iron swivel hardware" },
    { type: "upholstery", clue: "coil_spring", confidence: 50, description: "coil spring tilt mechanism" },
    { type: "upholstery", clue: "leather_cover", confidence: 50, description: "leather upholstery" },
    { type: "structure", clue: "backrest_present", confidence: 50, description: "carved crest rail backrest" },
  ],
  asSeen: {
    formId: "Upholstered armchair",
    display: "Upholstered armchair (also commonly called: Arm chair, Easy chair)",
    finalStyleKind: "unresolved",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

const golden_oak_bankers_office_swivel_chair_acanthus_crest: ScanFixture = {
  label: "golden_oak_bankers_office_swivel_chair_acanthus_crest",
  note: "S032 American Golden Oak Era office/banker's swivel-tilt chair, c. 1885-1910 — flat-sawn oak (NOT quartersawn, distinct from S031), wide solid-oak back panel with deeply carved acanthus + scroll crest rail, shaped vase/fiddle lower back splat, three turned baluster arm support spindles per side, cast iron coil-spring swivel-tilt pedestal mechanism, four-leg splayed oak base on casters, leather drop-in seat (heavily deteriorated) with hand-tacks + decorative nailhead trim, visible stenciled/branded/burned text on back panel (illegible). Engine reported 'Upholstered armchair' c. 1890-1920 Moderate (P1 cap High 85%), kind=context_only 'Upholstered seating'. SAME ARCHITECTURAL FAILURE SHAPE as S031 — different specimen, identical diagnostic signature. Form broadly right (form_armchair), date broadly right (1890-1920 brackets actual 1885-1910), style absent. SUBTYPE-MISS #6 (joining S022/S024/S025/S030/S031): four descriptions explicitly identify 'office/banker's swivel chair' / 'late Victorian office/banker's chairs' / 'American factory-produced office/banker's chairs' — form stays generic form_armchair. M11 NEGATIVE #2 (joining S031): style_wave_golden_oak clue + 'Golden Oak / Late Victorian' prose mentions in multiple descriptions, but no style family attribution fires. Confirms prose-only style mentions stay below the floor (calibration cases for any future M11 fix). fix#10 5th specimen with NEW canned label: this is the FIRST 'Upholstered seating' canned context_only label in the corpus (joining 'American Empire / late Classical Revival' at n=4 and 'Modernist / chrome-frame' at n=4). 'Upholstered seating' is the canned label for the LITERAL form-category default when no style attribution exists — confirms the fix #10 mechanism generates multiple canned defaults depending on the form. M13-adjacent / partial maker mark miss #2 (joining S031): visible_text clue at conf 45 says back panel shows 'stenciled, branded, or burned text' but cannot be read fully. Not captured as maker_label, not run through matchMakerMarks. Same shape as S031 'PRINCE' uncertain text — branded furniture marks on chair backs need permissive detection. M6 specimen #14: wrought_iron material clue keyed to 'cast iron' — same internal-cast-iron-mechanism-as-material-layer chain as S017/S024/S031. M7 NEGATION-AS-OBSERVATION #6 (joining S007/S008/S012/S029/S030): platform_rocker_form clue (a Phase 0 Part A new clue) fired at conf 52 with description 'This is NOT a platform rocker. The chair sits on a swivel/tilt pedestal base...' — third Phase 0 Part A negation specimen (joining S030 china_cabinet_form 'Not a china cabinet'). Phase 0 Part A direct-form clue keys are routinely used in negation by the LLM. CLUE_LIBRARY dating reference correctness #2: coil_spring still dated 'c. 1780-1830' (same wrong dating as S031). Confirms the issue at n=2.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Upholstered seat present — leather-covered drop-in seat pad attached to wooden seat frame with upholstery tacks along perimeter." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Solid one-piece wide oak back panel with carved crest rail at top; shaped lower splat connecting to seat rail. Back is broad and slightly curved." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Full armrests present on both sides — curved oak arms supported by turned spindle arm supports (three turned balusters per side visible). Arms terminate in scroll-carved ends." },
    { type: "function", clue: "swivel_mechanism", confidence: 70, description: "Chair body sits on a central iron swivel/tilt post mounted to a four-leg wooden pedestal base. The underside image clearly shows a heavy coil spring tilt mechanism with cast iron hardware — characteristic of late 19th-century banker's/office swivel chairs." },
    { type: "hardware", clue: "height_adjustment_mechanism", confidence: 45, description: "No visible height adjustment mechanism. The base appears to be a fixed-height swivel/tilt only, consistent with pre-1900 office chair design without screw-height adjustment." },
    { type: "structure", clue: "pedestal_column", confidence: 82, description: "Four-leg splayed wooden pedestal base visible — four curved legs radiating from central iron post/column. Base is solid oak with dark finish. Casters visible at leg ends." },
    { type: "hardware", clue: "coil_spring", confidence: 62, description: "Large heavy coil spring visible in the tilt mechanism under the seat — multiple coils of heavy-gauge iron/steel spring compressed between the seat frame and the swivel post hardware. This is the tilt-return spring characteristic of late Victorian office/banker's chairs." },
    { type: "style", clue: "style_cues", confidence: 52, description: "Crest rail of back panel features deeply incised acanthus leaf and scroll carving across the full width — symmetrical scrolls at corners with central leaf motifs. Additional carved leaf motifs at arm post junctions. Style is consistent with Golden Oak / Late Victorian decorative vocabulary, c. 1885-1910." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "All visible structural members — back panel, seat frame, arms, arm supports, pedestal legs — appear to be solid oak. No veneer edges or lamination visible. Grain visible on arm surface in side image shows characteristic flat-sawn oak cathedral grain." },
    { type: "materials", clue: "wood_species_oak", confidence: 84, description: "Wood grain visible on arm surface (overall_side image) shows pronounced flat-sawn cathedral grain pattern with open pores characteristic of oak. Back panel also shows open-pore oak grain. Color is warm medium-dark brown consistent with aged oak. Ray fleck not prominently visible, suggesting flat-sawn rather than quarter-sawn orientation." },
    { type: "upholstery", clue: "leather_cover", confidence: 45, description: "Seat covered in what appears to be genuine leather — visible natural grain pattern, cracking and crazing consistent with aged leather, raw-cut edges lifting at perimeter, patina and staining consistent with long use. Surface shows characteristic leather craze-cracking rather than vinyl peeling. Confidence moderate — aged leather vs. very old faux leather is difficult to distinguish definitively from photos, but the craze pattern and edge behavior favor genuine leather." },
    { type: "condition", clue: "leather_deterioration", confidence: 54, description: "Leather seat cover is heavily deteriorated — surface shows extensive crazing, cracking, staining, and lifting/separation at all edges. The leather is pulling away from the tack line around the perimeter. Seat is functionally failed and requires replacement." },
    { type: "upholstery", clue: "hand_tacks", confidence: 50, description: "Row of upholstery tacks visible along the seat perimeter securing the leather to the seat frame — visible as small domed heads in a continuous line around the seat edge. Consistent with period hand-tacked upholstery attachment." },
    { type: "upholstery", clue: "nailhead_trim", confidence: 50, description: "Decorative nailhead trim visible along the seat edge — row of small brass or iron tack heads forming a decorative border line around the seat perimeter, visible in multiple images." },
    { type: "condition", clue: "rust_pitting", confidence: 54, description: "The iron tilt/swivel mechanism hardware visible in the underside image shows heavy rust and oxidation — surface pitting and dark iron oxide throughout the cast iron components. The coil spring also shows significant rust." },
    { type: "construction", clue: "round_tenon", confidence: 82, description: "Turned arm support spindles (three per side) appear to enter the arm rail and seat rail via round tenon joinery — the turned balusters terminate in reduced-diameter tenon ends entering round mortises in the arm and seat frame. Consistent with period chair construction." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 75, description: "Back splat and back posts appear to join the seat rail via mortise-and-tenon construction — the shaped lower splat has a tenon entering the seat rail. Standard period chair frame joinery." },
    { type: "style", clue: "spindle_back", confidence: 52, description: "Three turned spindles visible under each arm — heavily turned baluster-form spindles with multiple ring turnings and bulbous forms. These are arm support spindles rather than back spindles, but the turned element vocabulary is consistent with Golden Oak / Late Victorian chair production." },
    { type: "label", clue: "visible_text", confidence: 45, description: "The back panel of the chair shows what appears to be stenciled, branded, or burned text — visible as lighter-colored letter forms against the darker oak surface. Text appears to span the width of the back panel. Individual letters are partially legible but not fully readable from available images — possible maker name, owner name, or institutional name. Requires closer examination for full attribution." },
    { type: "condition", clue: "shellac_intact", confidence: 54, description: "Wood surfaces show aged amber-brown finish consistent with original shellac or early varnish — warm tone, some surface darkening in recesses and carved areas. No obvious polyurethane plastic sheen visible. Finish appears original or very old, not recently refinished." },
    { type: "condition", clue: "condition_overall", confidence: 54, description: "Chair frame is structurally intact with no visible breaks or major losses. Wood finish is aged and darkened but not stripped. Carved decoration is intact. Upholstery is failed and requires full replacement. Tilt/swivel mechanism is heavily rusted but appears mechanically present. Overall condition is fair for the wood frame, poor for the upholstery and metal mechanism." },
    { type: "style", clue: "platform_rocker_form", confidence: 52, description: "This is NOT a platform rocker. The chair sits on a swivel/tilt pedestal base with a coil spring tilt mechanism — it is an office/banker's swivel chair, not a platform rocker. No curved rockers present." },
    { type: "style", clue: "carved_crest_rail", confidence: 52, description: "Crest rail (top rail of back) features deeply carved acanthus leaf and scroll decoration across full width — symmetrical composition with scrolls at both corners and leaf sprays. Carving is incised/relief style consistent with machine-assisted or hand-finished factory carving of the Golden Oak era." },
    { type: "style", clue: "style_wave_golden_oak", confidence: 52, description: "Multiple style indicators consistent with Golden Oak / Late Victorian office chair production c. 1885-1910: flat-sawn oak construction, acanthus scroll carving on crest rail, turned arm spindles, leather seat with nailhead trim, iron swivel/tilt pedestal base with coil spring. This form is characteristic of American factory-produced office/banker's chairs of this era." },
    { type: "construction", clue: "back_splat_shaped", confidence: 90, description: "A shaped lower back splat (vase/fiddle form) is visible between the crest rail and the seat — wider at top, narrowing at waist, connecting the broad back panel to the seat rail. Solid oak, shaped by machine or hand." },
    { type: "materials", clue: "wrought_iron", confidence: 50, description: "cast iron" },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstered seat" },
    { type: "form", clue: "seating_present", confidence: 78, description: "Integrated seating is visible." },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
  ],
  asSeen: {
    formId: "Upholstered armchair",
    display: "Upholstered armchair (also commonly called: Arm chair, Easy chair)",
    styleContext: "Upholstered seating",
    finalStyleKind: "context_only",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

const aesthetic_movement_walnut_drop_leaf_parlor_table: ScanFixture = {
  label: "aesthetic_movement_walnut_drop_leaf_parlor_table",
  note: "S033 American Aesthetic Movement / Eastlake-era walnut drop-leaf parlor or occasional table, c. 1875-1895 — two hinged drop leaves, fixed center board, cluster-column turned spindle legs (two pairs of two), X-stretcher with central turned finial, four outward-splayed reeded saber legs terminating in carved wooden paw/claw feet, walnut/walnut-stained base with intact older dark finish, top later painted gray/white (paint chipping at edges). Engine reported 'Aesthetic Movement / Japanesque Drop-leaf table' c. 1875-1895 Moderate (Low date), kind=original_period. END-TO-END SUCCESS — 8th CONTRAST CASE joining S007/S013/S014/S021/S025/S028/S029/S030. What worked: (1) form_drop_leaf_table correctly identified — drop_leaf_hinged clue at conf 68 [construction] weight 0.98 drove form selection (existing CLUE_LIBRARY entry with dateHint 1720-1930, formHint 'Drop-leaf table'); (2) style_family_aesthetic_movement attributed conf 0.70 matched_terms=['aesthetic'] supported=true — CLUE-KEY-SOURCED via aesthetic_movement_style clue (tokenizes to ['aesthetic','movement','style']). PROPER supported attribution path, NOT prose-only leak. Joins S029 eastlake_hardware → eastlake as 2nd clean clue-key-sourced family attribution; (3) original_period reconciliation correctly fired (final 1875-1895 within attribution 1870-1895); (4) parseStyleProseDate (#6 fix) WORKED: 'No datable construction evidence, but the style reads consistently as c. 1875-1895 across multiple observations' — same fallback architecture that rescued S028; (5) Alternative form 'Parlor table' surfaced as a close-miss alternative (good behavior). M11 sub-pattern reinforced: now have TWO clean clue-key-sourced examples (S029 eastlake_hardware, S033 aesthetic_movement_style) producing correct family attributions. Future M11 fix must preserve this path. M0 SYNTHESIS ON A NON-SEATING TABLE (broadens the pattern): spindle_back (conf 78) and spindle_gallery (conf 70) fired on a drop-leaf TABLE with no actual back or seating. Pattern now confirmed across SEATING pieces (S001 rocker, S027 Bassett rocker) AND non-seating multi-column structures (S021 washstand, S024 music box cabinet, S033 table). The synthesizer over-emit fires on ANY piece with multi-column verticality, not just seating. Did NOT drive form selection here (form_drop_leaf_table won via drop_leaf_hinged weight 0.98). Clue-key authoring note: drop_leaf_hinged is NOT one of the 12 Phase 0 Part A new clues — it was already in CLUE_LIBRARY pre-Deploy-006. This is the existing form-defining-clue path working correctly, not a Phase 0 Part A win.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "drop_leaf_hinged", confidence: 68, description: "Table has two hinged drop leaves visible hanging down on both sides when leaves are folded down; leaves are raised and supported in extended position in some views showing full rectangular top surface." },
    { type: "form", clue: "flat_surface", confidence: 68, description: "Rectangular flat top surface painted white/gray, with rounded corners visible when leaves are raised. Top consists of a fixed center section plus two hinged leaves." },
    { type: "structure", clue: "turned_spindle_legs", confidence: 82, description: "Four turned spindle-form column legs visible, arranged in two pairs (two at each end of the table), with ring-and-reel turning details. Legs are slender and decorative, consistent with Aesthetic Movement or late Victorian parlor table production." },
    { type: "structure", clue: "x_stretcher", confidence: 82, description: "X-form cross stretcher connects the two pairs of legs at mid-height. Stretcher members cross at center where a small turned finial/boss is mounted at the intersection. This is a characteristic feature of Victorian-era parlor and occasional tables." },
    { type: "structure", clue: "saber_legs", confidence: 82, description: "Four outward-splayed saber-form legs extend from the base of the turned column supports, curving outward and downward. Legs have reeded or fluted detailing along their length and terminate in carved paw/claw feet." },
    { type: "hardware", clue: "claw_feet", confidence: 62, description: "All four saber legs terminate in carved wooden paw or claw feet, visible in multiple images. Feet appear to be carved wood rather than cast metal, consistent with late Victorian American production c. 1870-1900." },
    { type: "style", clue: "aesthetic_movement_style", confidence: 52, description: "The combination of turned spindle legs arranged in clusters, X-stretcher with central finial, and saber legs with paw feet is consistent with Aesthetic Movement or Eastlake-influenced parlor table design, c. 1875-1895." },
    { type: "style", clue: "reeded_top_edge", confidence: 52, description: "The edge of the table top/leaves shows a reeded or stepped molding profile visible at the leaf edges, particularly visible in the overall_front image where the leaf hangs down showing the edge profile with multiple reeded bands." },
    { type: "materials", clue: "solid_wood_construction", confidence: 45, description: "Base structure including turned legs, stretchers, and saber legs appears to be solid wood construction. Wood grain visible on base members. Species appears to be walnut or dark-stained mahogany based on color and grain visible on base." },
    { type: "finish", clue: "refinished_surface", confidence: 45, description: "The table top surface has been painted over with a gray/white paint, obscuring the original wood surface. Paint shows wear, chipping at edges, and scratches indicating the paint is not original to the piece. The base retains what appears to be an older dark finish distinct from the painted top." },
    { type: "condition", clue: "paint_chipping_top", confidence: 54, description: "Gray/white paint on the top surface shows chipping and wear particularly at the edges and corners, exposing darker wood or earlier finish layers beneath. Paint loss is visible along the leaf edges in the overall_front image." },
    { type: "condition", clue: "base_finish_intact", confidence: 54, description: "The base retains a dark brown finish that appears older and more original than the painted top. Some wear and darkening visible at high-contact areas but overall the base finish appears relatively intact." },
    { type: "construction", clue: "two_part_top_with_leaves", confidence: 96, description: "The top consists of a fixed center board plus two hinged drop leaves. A visible seam/hinge line runs parallel to the long axis of the table on both sides of the center section. When leaves are raised, the top forms a large rectangle with rounded corners." },
    { type: "construction", clue: "central_finial_stretcher", confidence: 95, description: "A small turned wooden finial or boss is mounted at the center intersection of the X-stretcher. This decorative element is characteristic of Victorian parlor table design." },
    { type: "construction", clue: "leg_cluster_arrangement", confidence: 93, description: "The table base uses two pairs of turned spindle columns (two columns per end), each pair rising from a shared base block that connects to the saber legs. This cluster-column arrangement is characteristic of Victorian-era parlor and occasional tables." },
    { type: "structure", clue: "base_block_capital", confidence: 82, description: "Each pair of turned columns is joined at top and bottom by a rectangular block or capital/base element. The lower block connects to the saber leg and stretcher system. These blocks have a stepped or molded profile." },
    { type: "materials", clue: "wood_species_walnut_group", confidence: 55, description: "The base wood shows a warm dark brown color with visible grain. Could be walnut, dark-stained mahogany, or dark-stained oak. The color and grain pattern visible on the saber legs and stretchers is most consistent with walnut or a walnut-stained hardwood." },
    { type: "style", clue: "victorian_parlor_table_form", confidence: 52, description: "Overall form — drop-leaf top, cluster-column turned legs, X-stretcher with finial, outward-splayed saber legs with paw feet — is consistent with American Victorian parlor or occasional table production, most likely c. 1875-1900." },
    { type: "condition", clue: "top_board_gap", confidence: 45, description: "A visible gap or crack line runs along the center seam of the top, visible in the joinery_closeup images. This may be a hinge seam between the center board and a leaf, or a shrinkage crack in the painted top boards." },
    { type: "visible_text", clue: "partial_text_background", confidence: 50, description: "In one joinery_closeup image, a cardboard box is partially visible in the background with partial text, but it is not legible and is not associated with the furniture piece." },
    { type: "structure", clue: "spindle_back", confidence: 78, description: "Spindles are visible in the back or side rail." },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
  ],
  asSeen: {
    formId: "Drop-leaf table",
    display: "Aesthetic Movement / Japanesque Drop-leaf table (also commonly called: drop-side table, folding leaf table)",
    styleContext: "Aesthetic Movement / Japanesque",
    finalStyleKind: "original_period",
    dateRange: "c. 1875–1895",
    dateFloor: 1875,
    dateCeiling: 1895,
    confidence: "Low",
  },
};

const aesthetic_movement_moorish_revival_pierced_panel_armchair: ScanFixture = {
  label: "aesthetic_movement_moorish_revival_pierced_panel_armchair",
  note: "S034 American Aesthetic Movement / Anglo-Indian / Moorish Revival influenced walnut parlor armchair, c. 1875-1895 — deeply pierced fretwork side panels with scrolling foliate + geometric interlace, turned & fluted front legs with melon (gadrooned) finials at arm terminals, scrolled back crest, cabriole rear legs, brass cup casters, mid-20th-century floral brocade reupholstery (gimp/braid trim 1950s-1970s era). Descriptions explicitly attribute the style to 'Herter Brothers, Kimbel & Cabus, and various Grand Rapids manufacturers' c. 1875-1895. Engine reported 'Late Victorian Cottage Eastlake Afterwave Upholstered armchair' c. 1900-1925 Moderate, kind=revival_wave. WRONG-LATE BY ~25 YEARS — engine almost got it right then got dragged late. The diagnostic mechanism is interesting and NEW for the tally: NEW PATTERN — P0 B-KEY misemission cascading into revival_wave classification. modern_caster clue KEY emitted twice (conf 62 + 54) but BOTH descriptions explicitly say 'period-appropriate brass cup casters... consistent with late 19th century American parlor furniture hardware' and 'patina and surface corrosion consistent with age'. The LLM wrote LATE-19TH-CENTURY but routed to the modern_caster KEY (which carries post-1900 dating + likely hard-negative semantics). The engine reasoning trace says it explicitly: '2 specific evidence layers converge on 1885-1895; hard-negative post-floor evidence clamps the floor to 1900.' So a B-KEY-style misemission (description says X, clue key says Y) clamps the floor 1885→1900, intersects with the 1885-1910 Eastlake Afterwave only at 1900-1910, and the final label becomes the revival_wave instead of original_period. This is M6/B-KEY + downstream cascade. Different mechanism than S015/S016/S018 keyword revival anchoring (which was prose-keyword-driven). Engine ACTUALLY COMPUTED THE CORRECT CONVERGENCE — Transitional convergence note: 'both Late Victorian Cottage Eastlake Afterwave and Original Aesthetic / Japanesque revival waves were in production c. 1885-1895; the overlap tightly anchors a transitional dating window of c. 1885-1895.' The engine identified the right window then discarded it for the wrong-late label. M11 sub-finding: BOTH 'eastlake' AND 'aesthetic' tokens are prose-only here (no clue KEY contains either). TWO attributions tied at conf 0.70 — primary Eastlake, alternative Aesthetic Movement. The piece is actually more Aesthetic Movement / Moorish Revival than pure Eastlake; engine picked the wrong one of the two but both attribution mechanisms are prose-only. M5 - 5 keyless [style]/[construction]/[materials] observations carrying detailed dating prose (1870s-1890s, 1875-1895, 1875-1890) all routed to non-dating layers, contributing 0 to the dating overlap. parseStyleProseDate didn't rescue this one because the convergence math already produced a (wrong-late) answer via the B-KEY. NEW specific wave label in corpus: 'Late Victorian Cottage Eastlake Afterwave' — a verbose, oddly specific style wave name not seen in prior fixtures. Worth tracking the style_revival_waves vocabulary correctness. NOT fix#10 (this is a specific wave label not a canned default). NOT M13 (Herter Brothers / Kimbel & Cabus mentioned in descriptions are SPECULATIVE attribution, no actual maker label visible).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "armchair_form", confidence: 68, description: "Overall front view shows a fully upholstered armchair with padded seat, back, and arms. The chair has a barrel-like form with a slightly scrolled/curved back crest rail. The overall silhouette is characteristic of late Victorian parlor seating, circa 1875-1895." },
    { type: "materials", clue: "solid_wood_construction", confidence: 78, description: "The exposed frame throughout all images shows a dark reddish-brown hardwood, most likely walnut or mahogany. The grain and color visible on the back rail, arm supports, and leg surfaces is consistent with American black walnut, commonly used in Eastlake and Aesthetic Movement furniture." },
    { type: "style", clue: "", confidence: 58, description: "The side panels of the chair (visible in overall_front, overall_side, and both joinery_closeup images) feature deeply pierced/fretwork carved decorative panels with scrolling foliate and geometric interlace motifs. This type of pierced carved panel is strongly associated with the Aesthetic Movement and Anglo-Indian influenced furniture of the 1870s-1890s, as well as Moorish Revival style." },
    { type: "style", clue: "", confidence: 58, description: "Front legs are turned with multiple ring turnings and a fluted lower section, topped by a square block with a melon-carved (gadrooned) finial at the arm terminal. This combination of turning, fluting, and melon finial is characteristic of Eastlake-influenced American furniture from the 1875-1890 period." },
    { type: "hardware", clue: "modern_caster", confidence: 62, description: "Brass casters are visible at the base of the front turned legs in the overall_front and joinery_closeup images. The casters appear to be period-appropriate brass cup casters with a small wheel, consistent with late 19th century American parlor furniture hardware. Some patina and wear visible." },
    { type: "style", clue: "cabriole_leg", confidence: 52, description: "The rear legs visible in the back and overall_side images are cabriole-form, curving outward and then tapering to a small foot. This is an unusual combination with the Eastlake front legs and may indicate a transitional or eclectic Victorian piece, or a later reupholstering that obscures original construction details." },
    { type: "finish", clue: "shellac_intact", confidence: 55, description: "The exposed wood surfaces on the back rail, arm supports, and legs show a dark, somewhat glossy finish consistent with shellac or an early lacquer. The finish appears aged but largely intact with some darkening and minor wear at contact points." },
    { type: "condition", clue: "fully_upholstered", confidence: 45, description: "The upholstery fabric — a cream/ivory ground brocade with floral motifs in rust, green, and brown — appears to be a later reupholstering, likely mid-20th century based on the fabric style. The green gimp/braid trim along the edges is consistent with 1950s-1970s reupholstery work. The original fabric would have been different." },
    { type: "construction", clue: "", confidence: 75, description: "The joinery_closeup image shows the arm support post (front leg upper section) with a square mortise block where the arm rail meets the leg. This mortise-block construction at the arm junction is typical of American Victorian parlor chair construction. The turned post rises from the seat rail through a square transitional block to the melon finial." },
    { type: "style", clue: "brocade_cover", confidence: 52, description: "The back view (back image) shows the back upholstery is shaped with a curved/scrolled top rail and the fabric wraps around to the exterior of the back. The back exterior shows the same floral brocade fabric, suggesting a full upholstered back treatment. The curved back crest with scroll terminals at the top corners is visible." },
    { type: "materials", clue: "", confidence: 70, description: "The pierced carved side panels visible in all images appear to be solid wood fretwork — carved through a solid panel rather than applied overlay. The depth and three-dimensionality of the carving, with scrolling acanthus and interlace motifs, is consistent with hand or machine-assisted carving on solid walnut or mahogany panels." },
    { type: "condition", clue: "modern_caster", confidence: 54, description: "The brass casters at the front legs show significant patina and some surface corrosion/darkening, consistent with age. The caster wheels appear functional. No obvious breaks or repairs visible in the caster hardware." },
    { type: "style", clue: "", confidence: 58, description: "The overall design combining pierced Moorish/Islamic-inspired fretwork panels, turned and fluted legs, melon finials, and scrolled back crest is consistent with the Anglo-Indian or Aesthetic Movement influence on American Victorian furniture, particularly pieces made in the 1875-1895 period. This style was popularized by makers such as Herter Brothers, Kimbel & Cabus, and various Grand Rapids manufacturers." },
  ],
  asSeen: {
    formId: "Upholstered armchair",
    display: "Late Victorian Cottage Eastlake Afterwave Upholstered armchair (also commonly called: Arm chair, Easy chair)",
    styleContext: "Eastlake / Modern Gothic",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1900–1925",
    dateFloor: 1900,
    dateCeiling: 1925,
    confidence: "Moderate",
  },
};

const victorian_bent_iron_sling_upholstered_rocking_chair: ScanFixture = {
  label: "victorian_bent_iron_sling_upholstered_rocking_chair",
  note: "S035 Victorian bent-iron sling-upholstered rocking lounge chair, c. 1850-1900 (the descriptions cite R.W. Winfield Birmingham as a comparable maker). Continuous bent iron frame (uprights, arm supports, rocker runners all one piece, japanned dark finish), single-panel velvet sling seat+back suspended between frame members, padded bolster arm pads with twisted cord trim, multi-color twisted-cord fringe + tassels, acanthus-leaf jacquard border trim. Engine reported 'Rocking chair' c. 1925-1975 Moderate (LIVE returned kind=context_only 'American Empire / late Classical Revival'; dev replay returns kind=unresolved — DEPLOYMENT-LAG DELTA like S019/S027). Date WRONG-LATE by ~50-75 years vs actual c. 1850-1900. KEY FINDINGS: (1) PHASE 0 PART A WIN — form_rocking_chair correctly chosen via rocking_chair_form clue at conf 68 [form] weight 0.92, beating armchair_form weight 0.93. The Tier 2→Tier 3 upgrade in Phase 0 Part A (CLUE_LIBRARY weight boost) helped here. FIRST POSITIVE post-Deploy-006 finding for the Part A upgrades on a non-trivial case. (2) M6 SPECIMEN #15 + CASCADE — tubular_steel clue (conf 50) keyed to bare 'iron or steel' description on a BENT-IRON Victorian chair (not tubular steel at all). M6 chain promotes tubular_steel to materials layer, which then anchors Machine Age dating (1925-1975) per the engine's stated rule: 'Tubular steel, chrome, or chrome-and-laminate construction supports Machine Age, modernist, mid-century, or later production rather than early wood-frame dating.' (3) DATE-DRAGGED-LATE BY M6 — same M6 chain as S017 commode and S024 Regina music box, but here it dragged DATE not FORM. The form clue beat the M6 chain (Phase 0 Part A upgrade), but the M6 chain then dragged the date instead. Useful calibration: when form clue is strong enough to win, M6 manifests as wrong-late date instead of wrong form. (4) 'Modernist / chrome-frame furniture' appearing as ALT FORM — same M6 cascade as S017/S024 (where it was PRIMARY). Confirms the alt-form spawning is reliable signal of M6 contamination. (5) fix#10 'American Empire / late Classical Revival' 5th specimen (LIVE only; joining S009/S011/S019/S022). Dev replay produces null context — same deployment-lag pattern as S019/S027. (6) painted_metal_finish dateHint 'post-1900' + tubular_steel + riveted_metal_joint converge at 1900-1940, then M6 stretches the ceiling to 1975 because of tubular_steel modernist association. (7) NO M11 — no style family attribution fires despite victorian_iron_rocker_form clue carrying 'c. 1850-1900' in description. M5 specimen — 7 [style] @ 0.37 clues all carrying Victorian dating prose, none reach dating layer. (8) Engine HONESTLY surfaced the limitation: 'Tubular steel... supports Machine Age, modernist, mid-century, or later production' — the system is being transparent about what's driving the late dating, even though the underlying tubular_steel emission is a P0 misemission. (9) Valuation correctly flagged 'in-person review' tier ($1183-$1904 restored retail) — high-end Victorian iron rockers genuinely command this range.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "rocking_chair_form", confidence: 68, description: "Paired curved rocker runners visible beneath the chair legs/base in side and back views; the entire frame curves continuously from crest rail through arm supports down to rocker runners. This is a rocking chair form." },
    { type: "form", clue: "seating_surface", confidence: 68, description: "Continuous sling-style upholstered seat and back panel suspended between the metal frame members, forming a single curved seating and back surface." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "High curved backrest integral to the sling upholstery panel, terminating at a scrolled crest rail with decorative woven border trim." },
    { type: "structure", clue: "metal_frame", confidence: 45, description: "Entire structural frame is metal — appears to be flat strap iron or bar iron bent into continuous sweeping curves forming uprights, arm supports, and rocker runners. No visible wood structural members." },
    { type: "style", clue: "scrolled_crest_rail", confidence: 52, description: "The top rail of the backrest terminates in outward-curling volute/scroll ends at both upper corners, a characteristic Victorian decorative metalwork motif visible in the joinery closeup of the crest area." },
    { type: "style", clue: "victorian_iron_rocker_form", confidence: 52, description: "The overall form — continuous bent iron frame, sling upholstery, scrolled crest, curved arm supports, rocker runners — is consistent with Victorian-era iron rocking chairs, a form popular c. 1850-1900 in Britain and America. The design vocabulary closely resembles documented examples attributed to makers such as R.W. Winfield (Birmingham) or similar Victorian iron furniture manufacturers." },
    { type: "construction", clue: "sling_seat_construction", confidence: 90, description: "The upholstery is a single continuous sling panel (seat and back in one piece) suspended between the metal frame members rather than being attached to a wooden seat frame. This is visible in the back/underside view where the fabric hangs freely between the frame." },
    { type: "construction", clue: "bent_metal_continuous_frame", confidence: 82, description: "The side profile reveals that the back uprights and rocker runners appear to be formed from continuous bent metal members — the upright curves sweep down and forward to form the rocker base without visible separate joints at the transition. This is a hallmark of Victorian bent-iron furniture construction." },
    { type: "hardware", clue: "riveted_metal_joint", confidence: 40, description: "At the arm support attachment points and frame intersections, small fastening points are visible but resolution is insufficient to confirm rivet heads vs. bolts. Riveted construction would be consistent with Victorian iron furniture manufacture. Confidence low due to image resolution at joints." },
    { type: "materials", clue: "painted_metal_finish", confidence: 80, description: "The metal frame shows a dark brown-black surface treatment — likely japanned (black lacquered) or painted finish over iron, consistent with Victorian iron furniture finishing practice. Surface shows age-consistent wear and oxidation through the finish." },
    { type: "condition", clue: "rust_pitting", confidence: 54, description: "The metal frame shows surface oxidation and darkening consistent with age; some areas appear to show surface corrosion beneath the finish, particularly at the rocker base members visible in the back view." },
    { type: "upholstery", clue: "velvet_cover", confidence: 50, description: "The primary upholstery cover is a gold/amber-colored velvet — upright pile fabric with characteristic nap-direction shading visible across the seat and back panel. The pile is heavily crushed and worn in high-contact areas. The sheen and texture are consistent with cotton or rayon velvet rather than silk velvet. This is the dominant cover material." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 50, description: "The border trim at the top crest rail and seat front edge is a woven figured fabric with acanthus leaf / foliate repeat pattern in cream, tan, green, and rust tones. The pattern complexity and machine-woven regularity suggest a Jacquard-woven upholstery border trim. This is used as a decorative border band, not the primary cover." },
    { type: "upholstery", clue: "nailhead_trim", confidence: 45, description: "Along the edges of the woven border trim where it meets the metal frame, small regularly-spaced attachment points are visible that may be decorative nailheads or tacks securing the trim. Resolution is insufficient for certainty." },
    { type: "upholstery", clue: "no_spring_seat", confidence: 50, description: "The sling construction — a single fabric panel suspended between frame members — does not incorporate springs. The seat support is entirely the tension of the fabric sling itself. No coil or serpentine spring structure is possible in this construction type." },
    { type: "condition", clue: "velvet_wear_heavy", confidence: 54, description: "The velvet cover shows extensive pile crushing, soiling, staining (multiple dark spots and tide marks visible in the closeup), and surface abrasion. The pile is significantly flattened across the seat area. The fabric appears original or very old — the wear pattern is consistent with long-term use rather than recent damage." },
    { type: "condition", clue: "upholstery_lifting", confidence: 54, description: "In the underside/joinery closeup, the seat front corner shows the velvet panel lifting away from the woven border trim, exposing the interior construction. The fabric is partially detached at this corner." },
    { type: "style", clue: "decorative_fringe_trim", confidence: 52, description: "Multi-colored twisted rope fringe hangs from the seat front edge — cream, rust/terracotta, and dark green twisted cord fringe approximately 3-4 inches long. This decorative fringe treatment is characteristic of Victorian upholstery finishing, c. 1860-1900." },
    { type: "style", clue: "twisted_cord_trim", confidence: 52, description: "Multi-colored twisted rope cord (cream, rust, green) is used as edge trim along the arm pad edges, crest rail, and seat border — a characteristic Victorian upholstery passementerie treatment." },
    { type: "style", clue: "tassel_accents", confidence: 52, description: "Small decorative tassels are visible at the scrolled crest rail corner ends and at the arm pad ends — consistent with Victorian decorative upholstery passementerie." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "The chair has two armrests — padded cylindrical arm bolsters covered in matching gold velvet with twisted cord trim, mounted on curved metal arm support members extending from the main frame." },
    { type: "style", clue: "acanthus_leaf_border", confidence: 52, description: "The woven border trim features a repeating acanthus leaf / foliate scroll pattern in muted earth tones — a motif strongly associated with Victorian decorative arts and upholstery trim of the second half of the 19th century." },
    { type: "construction", clue: "arm_pad_construction", confidence: 88, description: "The arm pads are separate padded bolster-form cushions covered in matching gold velvet with twisted cord edging, attached to the curved metal arm support members. They appear to be stuffed pad construction without springs." },
    { type: "condition", clue: "fringe_soiled_intact", confidence: 54, description: "The decorative fringe at the seat front is intact but shows soiling and some tangling/matting of the twisted cord elements. The woven border trim is intact but faded and soiled." },
    { type: "style", clue: "high_back_reclined_profile", confidence: 52, description: "The side profile shows a dramatically reclined high-back form — the back is tall and angled well back from vertical, and the seat is low and deep. This reclined sling profile is characteristic of Victorian iron rocking/lounging chairs designed for relaxed seating." },
    { type: "materials", clue: "tubular_steel", confidence: 50, description: "iron or steel" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "materials", clue: "fully_upholstered", confidence: 74, description: "Upholstered or cushioned surfaces are visible." },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
  ],
  asSeen: {
    formId: "Rocking chair",
    display: "Rocking chair",
    finalStyleKind: "unresolved",
    dateRange: "c. 1925–1975",
    dateFloor: 1925,
    dateCeiling: 1975,
    confidence: "Moderate",
  },
};

const mcm_atomic_age_fiberglass_bullet_planter_tripod: ScanFixture = {
  label: "mcm_atomic_age_fiberglass_bullet_planter_tripod",
  note: "S036 mid-century atomic-age FIBERGLASS bullet cachepot / planter on tripod tapered wooden legs with brass ferrule tips, c. 1955-1968 (per descriptions: 'American MCM production c. 1955-1970', 'canonical atomic-age / mid-century modern decorative vocabulary, c. 1955-1968', 'aged polyester resin fiberglass, c. 1950s-1960s'). Decorative starburst-floral decal characteristic of atomic-age accessories. Engine reported 'Mid-Century Modern / American Modernism Wicker / rattan furniture' c. 1940-1940 (degenerate single-year), kind=original_period. MULTIPLE STACKED FAILURES — user flagged 'got some issues here'. (1) CATASTROPHIC FORM MISIDENTIFICATION — display 'Wicker / rattan furniture' on a fiberglass cachepot planter. form_id field shows '?' suggesting no canonical form_id matched. Caused by M0 woven_body false-positive (conf 76, weight 0.750) + mid_century_streamlined_wicker style clue with 'wicker' in clue KEY (even though its own description literally says 'Not wicker'). M0 description says 'Woven wicker or reed body construction is visible' — but the piece is SMOOTH FIBERGLASS. The LLM hallucinated weaving from the fiberglass surface texture (which fiberglass_shell description noted as 'visible fibrous texture/weave pattern' on the resin). M0 + M7-paired-with-M6 form catastrophe. (2) TAXONOMY GAP — like S026 harpsichord, planters/cachepots aren't in the canonical furniture taxonomy. Engine has no form_planter / form_cachepot to route to, so it fell back to the closest in-scope form (wicker furniture via the M0 weave hallucination). Second TAXONOMY-GAP M8 specimen. (3) M11 attribution path was clean (clue-key-sourced): matched_terms=['mid'] from mid_century_streamlined_wicker clue KEY tokenizes to ['mid','century','streamlined','wicker']. 'mid' IS in clue key. Conf 0.85 supported=true. Proper supported path — joins S029 eastlake_hardware + S033 aesthetic_movement_style as third clean clue-key-sourced specimen. (4) WRONG P5 CONFLICT RESOLUTION — engine identified conflict between mid_century_streamlined_wicker (c. 1945-1970) and slotted_screw (c. 1840-1940), resolved IN FAVOR of slotted_screw with 'authority 8/10'. But slotted_screw's 1940 ceiling isn't a hard ceiling — slotted screws were in continuing use until Phillips became dominant in the 1950s-60s; the piece is clearly MCM 1955+. P5 dropped the style evidence wrongly, anchoring the date at the slotted_screw 1940 ceiling. This is M10-INVERSE (M10 was about terminus-post-quem floor being DROPPED downward; this is the same authority-tiebreak mechanism dropping a STYLE FLOOR upward). Also the slotted_screw observation itself was conf 45 with description 'difficult to confirm at this resolution... possibly Phillips screws' — uncertain emission treated as 8/10 authority. (5) DEGENERATE SINGLE-YEAR DATE RANGE 'c. 1940-1940' — the convergence zone 1940-1940 (intersection of style 1940-1970 floor + slotted_screw 1840-1940 ceiling) produces floor=ceiling=1940. The user-facing 'c. 1940-1940' display is bizarre — looks like a UI/template bug. New display-layer issue worth tracking. (6) MULTIPLE M7 NEGATION SPECIMENS in one scan: pedestal_column conf 68 'No pedestal column present', mid_century_streamlined_wicker conf 52 'Not wicker', brass_frame conf 52 'not a full brass frame'. Three M7 negations on the same piece. (7) ENGINE HONESTLY SURFACED 'Wicker, reed, or rattan construction requires form, joinery, wrapping method... for tighter dating' as a limitation — confirming the engine internally thinks this is wicker (driven by M0 woven_body misemission).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "pedestal_column", confidence: 68, description: "No pedestal column present; instead a tripod of three splayed tapered wooden legs supports the bowl from below." },
    { type: "form", clue: "bowl_planter_form", confidence: 68, description: "Large hemispherical/bullet-shaped bowl form, open at top, closed at bottom, functioning as a decorative planter or cachepot. Approximately 16-20 inches in diameter estimated." },
    { type: "materials", clue: "fiberglass_shell", confidence: 45, description: "Bowl shell appears to be molded fiberglass — visible fibrous texture/weave pattern on exterior surface, off-white/cream color, lightweight appearance, surface crazing consistent with aged fiberglass resin. Not ceramic or metal." },
    { type: "style", clue: "mid_century_streamlined_wicker", confidence: 52, description: "Not wicker. Piece is a mid-century modern fiberglass bullet planter — atomic/space-age aesthetic with splayed tapered legs and starburst floral decal, strongly consistent with American MCM production c. 1955-1970." },
    { type: "style", clue: "style_cue_atomic_age_mcm", confidence: 52, description: "Overall form, tripod splayed tapered legs with brass ferrule tips, bullet/hemisphere bowl shape, and starburst/daisy floral decal are all canonical atomic-age / mid-century modern decorative vocabulary, c. 1955-1968." },
    { type: "structure", clue: "tripod_leg_base", confidence: 82, description: "Three tapered turned wooden legs splayed outward at approximately 30-35 degrees from vertical, arranged in triangular tripod configuration supporting the bowl from its underside." },
    { type: "hardware", clue: "brass_ferrule_tips", confidence: 62, description: "Each wooden leg terminates in a conical brass ferrule/cap tip. Brass shows age-consistent patina and some oxidation/verdigris at the very tips. This is a canonical MCM decorative hardware detail on bullet planters and similar atomic-age accessories." },
    { type: "construction", clue: "threaded_rod_leg_attachment", confidence: 45, description: "Underside view (joinery_closeup image) shows a central threaded rod or bolt protruding from the bottom of the bowl shell, with what appears to be a washer/nut assembly. This rod passes through the bowl bottom and connects to the leg hub assembly. Rust/oxidation staining visible around the hardware." },
    { type: "construction", clue: "leg_hub_attachment", confidence: 82, description: "Underside view shows three threaded fastener holes/bolts in triangular arrangement at the bowl bottom center — these are the attachment points for the three wooden legs. Consistent with a metal hub or plate sandwiched between bowl bottom and leg assembly." },
    { type: "hardware", clue: "slotted_screw", confidence: 45, description: "The three fastener heads visible on the bowl underside appear to be slotted or possibly Phillips screws — difficult to confirm at this resolution, but round dark heads visible in triangular pattern consistent with machine screws securing leg bracket." },
    { type: "style", clue: "starburst_floral_decal", confidence: 52, description: "A printed/applied decal is visible on the side of the bowl showing stylized daisy/starburst flowers in olive green, teal/blue, and white/cream on a tan/amber background panel. This is a canonical atomic-age decorative motif applied to MCM planters, c. 1955-1968. Decal shows age — edges lifting, background yellowed." },
    { type: "condition", clue: "decal_lifting_aged", confidence: 54, description: "The decorative decal on the bowl side shows edge lifting, yellowing of the background, and age-consistent deterioration. Consistent with original decal applied at manufacture, not a recent addition." },
    { type: "condition", clue: "fiberglass_surface_crazing", confidence: 54, description: "Fine network of surface crazing/checking visible on the fiberglass exterior, especially visible in raking light on the overall_front image. Consistent with aged polyester resin fiberglass, c. 1950s-1960s production." },
    { type: "condition", clue: "interior_dirt_accumulation", confidence: 54, description: "Interior bowl bottom shows significant dirt, dust, and debris accumulation with rust staining around the leg attachment hardware. Consistent with use as a planter over many decades." },
    { type: "condition", clue: "rust_pitting", confidence: 54, description: "Rust/iron oxidation staining visible around the leg attachment hardware on the bowl interior bottom. The metal hardware (likely steel) has corroded, leaving brown staining on the surrounding fiberglass surface." },
    { type: "materials", clue: "wood_legs_species", confidence: 45, description: "Tapered turned wooden legs show medium-warm brown tone with visible grain. Color and grain pattern suggest walnut or possibly birch/maple stained to walnut tone — consistent with MCM leg materials. Legs show wear and minor surface damage." },
    { type: "construction", clue: "turned_tapered_legs", confidence: 95, description: "Legs are lathe-turned, tapering from a wider diameter at the top (bowl attachment) to a narrower diameter at the bottom (brass ferrule). Smooth conical taper consistent with machine turning. No hand-tool irregularity visible." },
    { type: "function", clue: "planter_cachepot_function", confidence: 70, description: "Object is a decorative planter or cachepot — open bowl form designed to hold a potted plant. No drainage holes visible in the fiberglass shell (consistent with cachepot rather than direct planting use). The interior bottom shows soil/dirt residue from plant use." },
    { type: "style", clue: "brass_frame", confidence: 52, description: "Brass is present only as decorative ferrule tips on the leg ends — not a full brass frame. The brass tips are a characteristic MCM decorative hardware detail on bullet planters and atomic-age accessories." },
    { type: "condition", clue: "plating_loss", confidence: 54, description: "One brass ferrule tip (visible in overall_front, front-left leg) shows wear-through or corrosion at the very tip, exposing darker base metal beneath the brass. Consistent with floor contact wear over decades of use." },
    { type: "materials", clue: "woven_body", confidence: 76, description: "Woven wicker or reed body construction is visible." },
  ],
  asSeen: {
    formId: "Planter",
    display: "Mid-Century Modern / American Modernism Planter (also commonly called: jardiniere, jardinière)",
    styleContext: "Mid-Century Modern / American Modernism",
    finalStyleKind: "original_period",
    dateRange: "c. 1940–1970",
    dateFloor: 1940,
    dateCeiling: 1970,
    confidence: "Moderate",
  },
};

const mid_century_lime_vinyl_telephone_gossip_bench: ScanFixture = {
  label: "mid_century_lime_vinyl_telephone_gossip_bench",
  note: "Mid-century lime/avocado-green vinyl GOSSIP BENCH / TELEPHONE BENCH (asymmetric two-part form: tub/barrel chair on left + flat upholstered side platform on right for telephone), c. 1965-1975 → reported as 'Mid-Century Modern / American Modernism Lounge chair', Broad/Low date. The asymmetric two-part form is unmistakable in the photo but P0 perception saw only the chair half. M0 PERCEPTION MISS at root: NO secondary_surface observation, NO telephone_bench_form, NO gossip_bench observation, NO asymmetric_form / side_platform / writing_surface clue. All 20 observations describe the barrel-chair LEFT side as if it were the whole piece. The engine's own form_lounge_chair context vocabulary EXPLICITLY warns about this exact case: 'a secondary_surface observation on a clearly-upholstered lounge form usually indicates LLM mis-perception of a separate object in the image, NOT a telephone-bench identification' — but that warning is BACKWARDS for this fixture: here a secondary_surface observation would have been the CORRECT identification trigger, and its ABSENCE is what locked the form to lounge_chair. M0→M8 cascade: perception miss → form misclassification → catastrophic ID (form_telephone_bench / form_gossip_bench should have been chosen). Date logic actually behaves correctly given the (wrong) lounge_chair form selection: 4-layer convergence 1940-1970 (hardware + upholstery + style + style_wave), upholstery correctly split as post-1950 vinyl/foam/nailhead, P1 cap Moderate, frame range honestly Broad/Low because no joinery/finish/wood layers fire (no underside/back photos). The dating-overlap engine is being conservative. The failure is entirely upstream in P0. NEW M0 sub-pattern (n=1): asymmetric multi-component furniture (telephone bench, secretary-bookcase with the desk extended, dresser-with-attached-mirror) where P0 perceives only ONE component as the whole piece. Distinct from prior M0 specimens (spindle-back synthesis, woven_body false-positive on fiberglass) — those were over-emission; this is under-perception of structural complexity. Worth watching for recurrence on other multi-component forms. Also notable: M11 prose-only token leak fired again — style_family_mid_century_modern attributed conf 0.7 from matched_terms=['mid'] (only 'mid' token, scraped from prose), supported=true. Defensible outcome (the upholstery IS mid-century), but the mechanism is the same prose-only path documented in S020/S021/S023/S025/S028/S030/S033.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Upholstered seat cushion integrated into barrel/tub chair shell; single seat visible from front and side views." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Continuous curved barrel-form backrest wrapping around from arm to arm; tufted on interior face." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Single-seat tub/barrel chair with integrated curved arms forming continuous shell with backrest; one seat, two outer armrests." },
    { type: "style", clue: "barrel_tub_chair_form", confidence: 52, description: "Fully rounded barrel/tub silhouette with continuous curved back and arms; characteristic of mid-century lounge and reception seating forms." },
    { type: "upholstery", clue: "vinyl_cover", confidence: 50, description: "Lime/avocado green cover material exhibits high surface sheen, uniform color, and visible surface creasing consistent with vinyl/faux leather rather than genuine leather. Genuine leather alternative possible but uniform grain pattern and plastic-like sheen favor vinyl. Color (lime green) strongly supports mid-century vinyl context, c. 1950s–1970s." },
    { type: "upholstery", clue: "button_tufting", confidence: 50, description: "Regular grid of button dimples visible across the interior backrest surface; approximately 12–15 dimples arranged in rows. Dimples appear stitch-tufted or button-tufted without large decorative covered buttons visible — small low-profile buttons or stitch points only." },
    { type: "hardware", clue: "nailhead_trim", confidence: 62, description: "Continuous row of small metal nailhead trim running along all exposed edges of the barrel shell: top rim, front arm edges, and lower apron edge. Nailheads appear silver/chrome-toned, closely and uniformly spaced, consistent with machine-strip nailhead application common post-1950." },
    { type: "structure", clue: "tapered_leg", confidence: 82, description: "Four tapered straight wood legs visible; dark reddish-brown finish (mahogany or walnut stain); legs are slender and slightly splayed, consistent with mid-century modern leg design. Two front legs visible from front view; all four visible from rear/side view." },
    { type: "style", clue: "style_cues", confidence: 52, description: "Combination of barrel tub form, avocado/lime green vinyl cover, tapered wood legs, button tufting, and chrome nailhead trim is consistent with mid-century American lounge or reception seating, c. 1955–1975. Color palette (lime/avocado green) is particularly diagnostic of late 1960s–early 1970s American interior design." },
    { type: "materials", clue: "solid_wood_construction", confidence: 72, description: "Legs appear to be solid turned/tapered wood with dark stained finish; no visible lamination or hollow construction at leg bases visible in rear view." },
    { type: "condition", clue: "refinished_surface", confidence: 54, description: "No evidence of refinishing on legs; finish appears consistent and original. Upholstery cover shows no obvious reupholstery seams inconsistent with original construction." },
    { type: "condition", clue: "condition_overall", confidence: 54, description: "Upholstery surface shows minor creasing and light surface wear on seat; no major tears, cracks, or peeling visible. Nailhead trim appears intact and complete. Legs show minor scuffing at bases. Overall condition assessed as good." },
    { type: "upholstery", clue: "foam_padding", confidence: 50, description: "Seat and back padding profile consistent with foam cushioning rather than spring-and-stuffing construction; flat seat profile and uniform back padding suggest polyurethane or latex foam fill, consistent with post-1955 production." },
    { type: "construction", clue: "upholstered_barrel_shell", confidence: 95, description: "The back and arms form a single continuous curved barrel shell fully upholstered in vinyl; the shell wraps from one front arm edge around the back to the other front arm edge without interruption. This is a defining structural feature of the tub/barrel chair form." },
    { type: "style", clue: "color_palette_diagnostic", confidence: 52, description: "The lime/avocado green color of the vinyl cover is a strong period color signal associated with American interior design c. 1965–1975 (avocado green era). This color in vinyl upholstery on a tub chair form supports a late 1960s–early 1970s production or reupholstery date." },
    { type: "hardware", clue: "decorative_nailhead_trim", confidence: 62, description: "Uniform closely-spaced silver/chrome-toned nailhead trim along all exposed upholstery edges. Spacing appears machine-strip consistent rather than individually hand-placed; supports post-1950 upholstery campaign." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "fully upholstered barrel shell" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating" },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
    { type: "structure", clue: "barrel_tub_back", confidence: 76, description: "Textual barrel/tub/cylindrical back vocabulary on a seating form indicates barrel-back construction." },
  ],
  asSeen: {
    formId: "Lounge chair",
    display: "Mid-Century Modern / American Modernism Lounge chair (also commonly called: Easy chair, Club chair)",
    finalStyleKind: "original_period",
    dateRange: "c. 1940–1970",
    dateFloor: 1940,
    dateCeiling: 1970,
    confidence: "Low",
  },
};

const space_age_cone_chair_panton_derivative_misid_bench: ScanFixture = {
  label: "space_age_cone_chair_panton_derivative_misid_bench",
  note: "Space Age / Atomic Age CONE CHAIR (Verner Panton 1958 Cone Chair derivative or commercial knock-off), c. 1965-1975, swivel mechanism + 4-leg spider base + conical upholstered body + oval floating backrest on tubular post + aluminum trim ring — canonical Space Age vocabulary verbatim in the engine's own observation descriptions. Reported as 'Art Deco Bench / seating furniture', c. 1900 onward, Moderate. M8 FORM MISCLASSIFICATION + M11 PROSE-ONLY TOKEN LEAK stacked. M8 mechanism: cone_chair_form (52), space_age_form (52), oval_floating_backrest (52), aluminum_trim_ring (52), conical_body (82), four_leg_spider_base (82), tubular_metal_backrest_post (82) — SEVEN distinct Space Age clue keys fire, all bucketed [structure] or [style] at weight 0.37-0.55. The dominant [form] clues are pedestal_column (0.97) + seating_surface (0.85) + seating_present (0.82) — generic seating/pedestal weights win form selection. pedestal_column at wt 0.97 explains form_bench: a seating piece with a central pedestal base could be a counter stool / bar table / pedestal seat — but on this piece pedestal_column describes the central column connecting the cone body to the spider base, not a pedestal-style seating support. Same generic-beats-specific weighting bug as S012 / S017 / S025. Alternative forms list is bizarre: 'Toledo-style mid-century industrial task chair' as alt #1 on a Panton-style Space Age cone chair — generic substring match to 'mid-century'. M11 mechanism: style_family_art_deco attributed conf 0.53 (notably LOW), matched_terms=['art','deco'], supported=true. The tokens 'Art Deco' come from jacquard_cover (80) + fan_shell_pattern_fabric (52) descriptions about the UPHOLSTERY FABRIC PATTERN — 'fan/shell (Art Deco-style scallop) woven pattern', 'geometric Art Deco-influenced pattern woven into the green upholstery fabric'. The fabric pattern IS Art Deco-derived but the chair is 1960s-70s Space Age production with a contextual/incidental Art Deco fabric motif (probably a later reupholstery — the engine even notes the jacquard fabric likely matched original-or-replacement upholstery). NEW M11 sub-pattern shape: SECONDARY-DECORATIVE-FEATURE-DESCRIPTION-DRIVEN family attribution. The Art Deco family is attributed not from the piece's primary style but from a textile-pattern description for an incidental upholstery feature. Tokens scraped from a decorative-detail description override SEVEN clue keys explicitly identifying Space Age. Joins S015/S018/S020/S023/S025/S033/S034 in the M11 prose-only specimen set. Style waves = 0 (no waves detected for Art Deco family on a piece that doesn't fit the period). Date math: P2 honestly anchored to c. 1900 onward via 4-layer convergence 1900-1960 (hardware + finish + upholstery + style) but ceiling unbounded because no Space Age style_wave fires (Space Age isn't in style attribution). True date c. 1965-1975 sits in the descriptions but NO clue contributes that window to dating overlap. M5 recurring: cone_chair_form description literally says 'Verner Panton Cone Chair (1958) and related commercial derivatives produced through the 1960s–1970s' — 1960-1975 anchor in plain text, [style] @ 0.37, 0 dating contribution. Upholstery correctly split as post-1950 vinyl. THIRD TAXONOMY-GAP variant: form_cone_chair / form_swivel_chair / form_pedestal_chair would all be more appropriate but none exists in the taxonomy (after S026 harpsichord + S036 planter — Space Age cone chair is the third specimen of canonical-form-gap-driving-fallback-to-closest-in-scope).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Round circular upholstered seat pad visible, covered in dark green patterned fabric with fan/shell motif repeat." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Oval/egg-shaped upholstered backrest pad mounted on a single tubular metal post rising from the seat area; backrest floats independently above the seat." },
    { type: "form", clue: "pedestal_column", confidence: 68, description: "Central column connects conical body to four-leg spider base; the entire seat assembly sits atop a central pedestal-style post." },
    { type: "style", clue: "space_age_form", confidence: 52, description: "Strongly Space Age / Atomic Age design vocabulary: conical upholstered body tapering to a point at the bottom, oval floating backrest on a single post, spider base with swept legs — characteristic of late 1960s–1970s futuristic furniture design." },
    { type: "structure", clue: "metal_frame", confidence: 82, description: "Four-leg spider base in cast or stamped aluminum/steel with swept curved legs terminating in small glide feet; painted or anodized silver-gray finish." },
    { type: "hardware", clue: "swivel_mechanism", confidence: 62, description: "Visible aluminum/chrome trim ring at the junction between the conical body and the seat pad; the seat rotates on the base — consistent with a swivel plate mechanism between the cone body and the spider base." },
    { type: "structure", clue: "conical_body", confidence: 82, description: "The lower body of the chair is a downward-tapering cone shape, upholstered in dark green vinyl or faux leather, narrowing to a point that connects to the central column of the spider base." },
    { type: "materials", clue: "vinyl_cover", confidence: 78, description: "The conical lower body appears covered in dark green vinyl or faux leather — smooth surface with slight sheen and no visible natural grain variation; consistent with vinyl/Naugahyde upholstery common in late 1960s–1970s commercial and residential seating." },
    { type: "materials", clue: "jacquard_cover", confidence: 80, description: "The seat pad and oval backrest are covered in a dark green fabric with a repeating fan/shell (Art Deco-style scallop) woven pattern visible on both surfaces. The pattern appears machine-loomed with high regularity — consistent with a jacquard or brocade woven upholstery fabric. The same pattern appears on both seat and backrest, suggesting original or matched reupholstery." },
    { type: "style", clue: "fan_shell_pattern_fabric", confidence: 52, description: "Repeating fan/scallop shell motif visible across the seat and backrest fabric — a geometric Art Deco-influenced pattern woven into the green upholstery fabric. Pattern is highly regular and machine-produced." },
    { type: "structure", clue: "tubular_metal_backrest_post", confidence: 82, description: "Single curved tubular metal post (silver-gray, appears aluminum or painted steel) rises from the seat area and supports the oval backrest pad via a circular mounting plate visible on the back of the backrest." },
    { type: "hardware", clue: "stamped_metal_bracket", confidence: 45, description: "Circular metal mounting plate/disc visible on the back of the oval backrest where the tubular post attaches; appears to be a stamped or cast metal plate." },
    { type: "structure", clue: "four_leg_spider_base", confidence: 82, description: "Four swept curved legs radiate from a central column hub; legs are flat-profile metal (cast or stamped), curving outward and downward, terminating in small adjustable glide feet. Base is silver-gray painted or anodized metal." },
    { type: "hardware", clue: "modern_caster", confidence: 62, description: "No casters visible; legs terminate in small fixed glide feet (not rolling casters)." },
    { type: "condition", clue: "rust_pitting", confidence: 54, description: "Light surface oxidation and minor wear visible on the metal spider base legs, particularly at the foot tips; no severe rust pitting observed." },
    { type: "condition", clue: "painted_metal_finish", confidence: 54, description: "Spider base and tubular backrest post appear to have a silver-gray painted or anodized finish; some wear and scuffing visible on the base legs consistent with age and use." },
    { type: "materials", clue: "foam_padding", confidence: 84, description: "Seat pad and oval backrest appear to have foam padding beneath the fabric cover, evidenced by the rounded, cushioned profile of both elements." },
    { type: "style", clue: "aluminum_trim_ring", confidence: 52, description: "A visible aluminum or chrome-finished trim ring separates the circular seat pad from the upper edge of the conical body — a characteristic detail of Space Age / mid-century modern swivel seating design." },
    { type: "style", clue: "oval_floating_backrest", confidence: 52, description: "The backrest is an independent oval/egg-shaped upholstered pad mounted on a single post, visually floating above and behind the seat — a hallmark of Space Age furniture design vocabulary, c. 1965–1975." },
    { type: "function", clue: "sitting", confidence: 70, description: "Chair form with seat, backrest, and base — designed for seated use." },
    { type: "style", clue: "no_armrests", confidence: 52, description: "No armrests visible on this chair; the design is armless with only seat and floating oval backrest." },
    { type: "condition", clue: "fabric_condition_intact", confidence: 54, description: "Upholstery fabric on seat and backrest appears intact with no visible tears, fraying, or major staining visible in the photos." },
    { type: "style", clue: "cone_chair_form", confidence: 52, description: "The overall silhouette — conical downward-tapering upholstered body, circular seat, oval floating backrest on post, spider base — is consistent with the 'cone chair' typology popularized in Space Age design, referencing forms such as Verner Panton's Cone Chair (1958) and related commercial derivatives produced through the 1960s–1970s." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "fan/shell pattern fabric" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
  ],
  asSeen: {
    formId: "Pedestal chair",
    display: "Art Deco Pedestal chair (also commonly called: tulip chair, cone chair)",
    finalStyleKind: "unresolved",
    dateRange: "c. 1955 onward (mid 20th century or later)",
    dateFloor: 1955,
    dateCeiling: null,
    confidence: "Low",
  },
};

const sligh_grand_rapids_colonial_revival_writing_console_table_misid_writing_box: ScanFixture = {
  label: "sligh_grand_rapids_colonial_revival_writing_console_table_misid_writing_box",
  note: "Sligh Furniture Co. (Grand Rapids, MI) Colonial Revival WRITING/CONSOLE TABLE, c. 1933-1955, four turned-fluted legs + three-drawer apron + hand-painted floral center medallion + carved swag-tassel-acanthus corner pilasters + rope-twist gadroon molding + Sligh medallion label on inner leg. Reported as 'Colonial Revival WRITING BOX', Broad/Low date, no maker in display. Multiple failures stacked: (1) M8 CATASTROPHE — writing box (= small portable lap desk) vs the actual form (large floor-standing 4-leg console/writing table) are completely different objects. Root cause: drop_front_desk clue fired at conf 84 weight 0.98 [construction] with description LITERALLY 'Drop-front writing surface is visible' — pure M6 FALSE-POSITIVE. The piece has NO drop-front; flat_surface (conf 68) explicitly observes 'Rectangular flat top surface consistent with a writing table or console table; no writing slope or drop-front visible.' So TWO observations directly contradict each other and the higher-weight false one (drop_front_desk @ 0.98 [construction]) beats the correct one (flat_surface @ 0.52 [form]). M6-into-form mechanism: drop_front_desk routes a writing-box/secretary-desk form weight, alternatives list shows 'Secretary desk / drop-front desk' as alt #1 + 'Writing table' as alt #2 + 'Console table' as alt #3 — engine ranked the false-positive form winner over the two true forms. (2) M13 SIBLING (6th specimen) — SLIGH FURNITURE COMPANY captured verbatim in maker_label conf 85 wt 0.98 + maker_mark_sligh_furniture_co (MEDIUM tier, 1933-2005 reference) + maker_mark_grand_rapids_furniture_association_triangle (LOW tier, 1900-1940 reference) — three label clues, full firm name, dated firm reference. Display reads 'Colonial Revival Writing box' with NO mention of Sligh. M13 now n=6 across S022 Globe-Wernicke + S023 GM Radio + S024 Regina + S027 Bassett + S030 Automatic File & Index + S039 Sligh. (3) M9 FIX WORKING (positive datapoint) — visible_text observation description literally says 'Sligh Furniture Co. as a distinct entity operated from 1933 onward' → parseLabelDate correctly extracted 1933 as TPQ floor → frame_floor=1933, frame_ceiling=null. Engine reasoning trace literally says: 'The label 1933 label date is a terminus post quem (the piece cannot predate it), applied as a floor only — not as the production date.' Clean M9 fix behavior. (4) M6 secondary — mirror_present (conf 72 wt 0.69) fired from open_stretcher_with_mirror_panel description 'a mirrored OR GLAZED panel insert' — uncertain observation got mapped to high-weight form-defining 'mirror is visible' clue. This piece doesn't have a mirror in any meaningful furniture-form sense; the lower stretcher decorative panel is ambiguous. mirror_present likely helped writing-box selection (writing slope often has interior mirror). (5) M11 CLUE-KEY-SOURCED Colonial Revival — attributed conf 0.82 from matched_terms=['colonial','revival']. The tokens 'colonial' and 'revival' appear MULTIPLE TIMES in style descriptions but neither is in any clue KEY (style_cues, rope_twist_molding, painted_decorative_panel, beaded_molding, carved_ornament_neoclassical). So this is PROSE-ONLY but the outcome is correct/defensible (the piece IS Colonial Revival). Joins S020/S021/S023/S025/S028/S030/S033/S034/S038 in the prose-only specimen set; this is a defensible-outcome calibration target alongside S021/S025/S028/S030/S033. (6) round_wood_knob and decorative_bail_pull both M7 NEGATION-AS-OBSERVATION — descriptions literally say 'Hardware is cast brass rosette/floral knobs, NOT turned wood knobs' and 'No bail pulls present'. Caught and resolved in P5 with 'down-weighted in interpretation' notes, which is the right handling. M7 now n=4 properly handled in addition to the 3-prior promoted-to-tally specimens. Net: pure M8 form catastrophe driven by drop_front_desk M6 false-positive + M13 maker dropped + M9 fix working + M11 prose-only defensible attribution. The piece is correctly identified as Colonial Revival 1933+ in date and style; the catastrophe is form (writing box vs writing table — wrong category of object) and maker (Sligh dropped).",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "label", clue: "maker_label", confidence: 85, description: "Circular metal medallion tag affixed to secondary wood (light-colored rail/leg), reading 'SLIGH FURNITURE COMPANY / ESTABLISHED 1880 / GRAND RAPIDS'. Full maker name present — high-authority attribution to Sligh Furniture Co., Grand Rapids, Michigan." },
    { type: "form", clue: "flat_surface", confidence: 68, description: "Rectangular flat top surface consistent with a writing table or console table; no writing slope or drop-front visible." },
    { type: "form", clue: "drawer_present", confidence: 68, description: "Three drawer fronts visible across the apron: two flanking drawers with single rosette knobs each, and a central decorative painted panel drawer. All appear to be functional drawers." },
    { type: "style", clue: "style_cues", confidence: 52, description: "Rope-twist (gadroon) carved molding along apron top and bottom edges; swag-and-tassel carved pilaster capitals at corner stiles; fluted turned legs; beaded molding surrounding center painted panel; scrolled carved apron brackets — all consistent with Neoclassical/Colonial Revival decorative vocabulary as produced by Grand Rapids factories c. 1920s–1950s." },
    { type: "hardware", clue: "round_wood_knob", confidence: 62, description: "Hardware is cast brass rosette/floral knobs, not turned wood knobs. Circular cast brass pulls with floral/daisy relief pattern, one per flanking drawer." },
    { type: "hardware", clue: "decorative_bail_pull", confidence: 62, description: "No bail pulls present; hardware consists of cast brass rosette knobs (single-post attachment). Not bail/swing hardware." },
    { type: "hardware", clue: "stamped_metal_bracket", confidence: 45, description: "Hardware appears to be cast brass rosette knobs rather than stamped metal brackets. Floral relief detail visible on knob face in closeup." },
    { type: "materials", clue: "solid_wood_construction", confidence: 45, description: "Drawer fronts show warm reddish-brown wood with ribbon-stripe figure consistent with mahogany veneer. Corner stile carved ornament appears to be applied carved wood or composition ornament over a solid stile. Top surface shows flat-sawn or plain-sliced veneer with some figure." },
    { type: "materials", clue: "thick_veneer", confidence: 55, description: "Veneer thickness not directly measurable from photos; no chips or lifted corners exposing cross-section. Provisionally not confirmed as thick hand-sawn veneer; likely machine-sliced commercial veneer consistent with early-to-mid 20th century factory production." },
    { type: "style", clue: "carved_ornament_neoclassical", confidence: 45, description: "Corner stile closeup reveals deeply carved neoclassical ornament: shield/cartouche motif, swag drapery, tassel drops, acanthus leaf scrolls, and bead-and-reel elements. Ornament appears to be applied carved wood or composition (gesso/resin) rather than fully carved from the solid stile. Dark ebonized/painted finish with gilt highlights on ornament." },
    { type: "style", clue: "rope_twist_molding", confidence: 52, description: "Continuous rope-twist (gadroon/cable) carved molding runs along the top and bottom edges of the apron on all visible sides. Consistent with Colonial Revival and Neoclassical revival decorative vocabulary." },
    { type: "style", clue: "painted_decorative_panel", confidence: 52, description: "Center drawer front features a rectangular painted panel with a floral bouquet (roses, pansies, leaves) on an olive-green ground, surrounded by beaded molding frame. Paint shows age cracking/crazing consistent with oil or enamel paint applied decades ago. This decorative treatment is characteristic of Colonial Revival and Regency-influenced furniture produced by American factories c. 1920s–1950s." },
    { type: "condition", clue: "condition_cues", confidence: 54, description: "Top surface shows multiple water rings/heat marks, surface scratches, and general finish wear. Carved ornament on corner stiles shows paint/gilt loss at high points. Overall patina consistent with decades of use. No major structural damage visible." },
    { type: "finish", clue: "shellac_intact", confidence: 55, description: "Top surface and drawer fronts show a warm amber-brown finish with some sheen. Could be intact shellac or lacquer. No obvious polyurethane plastic film visible. Finish shows age-consistent wear rather than modern thick coating." },
    { type: "structure", clue: "turned_fluted_legs", confidence: 82, description: "Four turned legs visible, with fluted or reeded shafts and carved capitals at the top where they meet the apron. Legs taper toward the foot. Consistent with Neoclassical/Colonial Revival leg form." },
    { type: "structure", clue: "open_stretcher_with_mirror_panel", confidence: 45, description: "Below the apron, between the legs, there is an open decorative stretcher structure with what appears to be a mirrored or glazed panel insert and carved scrolled brackets. This is a decorative lower shelf/stretcher element." },
    { type: "label", clue: "visible_text", confidence: 85, description: "Full text legible on circular metal medallion tag: 'ESTABLISHED / 1880 / SLIGH / FURNITURE / COMPANY / GRAND RAPIDS'. Note: 'Established 1880' refers to the founding date of the Sligh lineage, not necessarily the production date of this specific piece. Sligh Furniture Co. as a distinct entity operated from 1933 onward." },
    { type: "materials", clue: "wood_species", confidence: 65, description: "Drawer fronts and top surface show warm reddish-brown color with ribbon-stripe or plain-sliced figure consistent with mahogany veneer. Could also be dark-stained gumwood or birch — common factory substitutes in Colonial Revival production. Species not definitively identifiable from photos alone." },
    { type: "construction", clue: "applied_carved_ornament", confidence: 45, description: "Corner stile ornament appears to be applied carved wood or composition (gesso/resin cast) ornament attached to the stile face rather than carved from the solid. This is consistent with factory production methods of the early-to-mid 20th century where ornamental elements were cast or carved separately and applied." },
    { type: "style", clue: "beaded_molding", confidence: 52, description: "Beaded molding (continuous row of small spherical beads) surrounds the center painted panel on the drawer front. Consistent with Neoclassical and Colonial Revival decorative vocabulary." },
    { type: "construction", clue: "drop_front_desk", confidence: 84, description: "Drop-front writing surface is visible." },
    { type: "form", clue: "mirror_present", confidence: 72, description: "Mirror is visible." },
    { type: "label", clue: "maker_mark_grand_rapids_furniture_association_triangle", confidence: 50, description: "Detected maker mark: Grand Rapids Furniture Association triangle mark. Mark type: association_mark. Dating reference: 1900–1940. Confidence tier: LOW." },
    { type: "label", clue: "maker_mark_sligh_furniture_co", confidence: 70, description: "Detected maker mark: Sligh Furniture Co.. Mark type: paper_label. Dating reference: 1933–2005. Confidence tier: MEDIUM." },
  ],
  asSeen: {
    formId: "Secretary desk / drop-front desk",
    display: "Sligh Furniture Co Secretary desk / drop-front desk (also commonly called: Secretary desk, Secretary bookcase)",
    finalStyleKind: "unresolved",
    dateRange: "Broad, not tightly dated",
    dateFloor: 1933,
    dateCeiling: null,
    confidence: "Low",
  },
};

const mid_century_molded_plywood_swivel_office_lounge_chair_contrast_case: ScanFixture = {
  label: "mid_century_molded_plywood_swivel_office_lounge_chair_contrast_case",
  note: "CONTRAST CASE — END-TO-END SUCCESS. MCM molded-plywood walnut-veneer swivel-base office/lounge chair (likely Plycraft / Selig / Stow Davis or similar executive-conference chair, c. 1960s-1970s), bent molded plywood shell + 4-star aluminum swivel base + caster wheels + button-tufted cream vinyl reupholstery + elastic webbing support straps + slotted screws. Reported as 'Mid-Century Modern / American Modernism Lounge chair', c. 1940-1970 Moderate date confidence, High overall, original_period kind. EVERY layer worked: form_lounge_chair selected correctly (lounge_chair_form weight 0.52 + bent_molded_plywood + swivel context — pedestal_column 0.94 didn't pull the form to bench this time because the swivel_mechanism + caster context steered correctly), Mid-Century Modern attribution conf 0.85 from matched_terms=['mid'] (prose-only path but defensible/correct), 4 style waves all in MCM window, 6-LAYER CONVERGENCE 1900-1970 (fastener + wood + hardware + upholstery + style + style_wave — the deepest convergence in the corpus). Upholstery correctly split as post-1955 vinyl reupholstery c. 1955-1980 Moderate. Frame floor/ceiling 1940-1970 driven by wood layer (plywood_structural HARD NEGATIVE c. 1905-1930 + bent_molded_plywood post-1935 + sheet_back_panel post-1900) + slotted_screw fastener layer. Joins S013 Art Deco candelabrum + S014 Rococo Revival parlor table + S021 Victorian Queen Anne washstand + S025 Colonial Revival corner armchair + S030 Automatic File & Index 'OK' bookcase + S033 Aesthetic Movement drop-leaf table + S040 (this) MCM office-lounge chair in the must-not-regress CONTRAST CASE set. NEW first-of-corpus: FIRST MCM molded-plywood swivel/caster office-lounge chair specimen, FIRST piece showing all 6 dating layers contributing simultaneously to a single convergence zone, FIRST piece where bent_molded_plywood + plywood_structural HARD NEGATIVE work together cleanly. Two minor issues caught but harmless: (a) maker_mark_cabinetmaker_paper_labels_and_inscriptions LOW tier fired at 1770-1860 reference on an MCM piece because the generic 'cabinetmaker paper labels' detector matches ANY paper label observation — wildly out-of-period dating reference but LOW tier and outweighed by everything else; (b) seating_surface synth=true (M0 seating-synthesis pattern visible on an actual seating piece — genuine synthesis, no anomaly). The piece's actual production-period date probably c. 1955-1975 (true window inside the engine's c. 1940-1970 floor/ceiling). Date confidence honestly Moderate because frame_ceiling 1970 is 5-15 years early for the likely actual production. Identification-side: maker not extracted from paper label (label illegible in image at conf 45), no M13 because no firm name surfaced from the image. Net: cleanest end-to-end run in the corpus to date, especially given the rich evidence convergence.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Large upholstered seat cushion present, tufted with button details, cream/off-white vinyl cover." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Separate upholstered back cushion present, tufted with buttons, mounted within molded plywood shell." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Single-seat armchair with two padded armrests, one on each side, upholstered in matching cream vinyl." },
    { type: "structure", clue: "bent_molded_plywood", confidence: 82, description: "The chair shell — forming the sides, back exterior, and arm supports — is clearly a single curved/bent molded plywood unit with walnut veneer face. Visible layered edge at arm area confirms plywood laminate construction. Characteristic of mid-century modern seating design." },
    { type: "structure", clue: "swivel_mechanism", confidence: 82, description: "Four-star aluminum base with central swivel column visible from underside and side views. Chair body rotates on this swivel post." },
    { type: "hardware", clue: "modern_caster", confidence: 62, description: "Four rubber/plastic caster wheels mounted at the ends of the four-star aluminum base arms. Casters appear to be original period hardware — brushed/satin metal housing with small rubber wheels, consistent with mid-century office/lounge chair production." },
    { type: "materials", clue: "vinyl_cover", confidence: 84, description: "Upholstery cover is cream/off-white vinyl (faux leather). Evidence: uniform repeating grain pattern visible on back surface, surface cracking and peeling at stress points (armrest corners) consistent with vinyl degradation rather than leather patina, folded-and-stitched edges visible. Not genuine leather — cracking pattern is surface-coat delamination typical of vinyl/Naugahyde." },
    { type: "upholstery", clue: "button_tufting", confidence: 50, description: "Regular button tufting visible on both seat and back cushions. Buttons appear to be covered/matching vinyl buttons. Pattern: approximately 6 buttons on back cushion, 4-5 on seat cushion in grid arrangement." },
    { type: "upholstery", clue: "foam_padding", confidence: 50, description: "Cushion profile and compression behavior consistent with foam padding beneath vinyl cover. Seat and back cushions show foam-typical rounded profile. Armrest pads also foam-filled." },
    { type: "style", clue: "style_cue_mid_century_modern", confidence: 52, description: "Strong mid-century modern design vocabulary: molded plywood shell, four-star aluminum swivel base with casters, clean geometric form, cream vinyl tufted upholstery, walnut-toned veneer. Consistent with American or Scandinavian-influenced office/lounge chair production c. 1955–1975." },
    { type: "hardware", clue: "slotted_screw", confidence: 62, description: "Slotted screws visible on underside of plywood shell where base attachment hardware and support straps are fastened. Multiple slotted-head screws visible securing black rubber/fabric support straps to shell underside." },
    { type: "label", clue: "maker_label", confidence: 45, description: "Paper label visible on underside of seat shell, centrally located. Label appears to contain printed text in multiple lines but is not fully legible in the image. Presence of a paper label suggests manufacturer identification may be possible with closer inspection." },
    { type: "construction", clue: "elastic_webbing", confidence: 88, description: "Black rubber/elastic support straps visible on underside of seat shell in a V/fan pattern, secured with slotted screws. These straps support the seat cushion from below. Consistent with mid-century seating construction using elastic webbing or rubber support bands." },
    { type: "condition", clue: "vinyl_cracking_peeling", confidence: 54, description: "Significant cracking and surface-coat peeling visible at armrest corners and edges — classic vinyl/Naugahyde degradation. Armrest pad shows deep cracks and material loss at the front corner. Back exterior shows surface scuffs and scratches." },
    { type: "condition", clue: "upholstery_soiling", confidence: 54, description: "Seat and back cushions show significant soiling, discoloration, and grime accumulation — cream vinyl has yellowed and darkened in use areas. Back exterior upholstery shows scratches and scuff marks." },
    { type: "condition", clue: "shell_surface_scratches", confidence: 54, description: "Molded plywood shell shows numerous surface scratches and scuffs across the walnut veneer face, particularly on the side panels. Finish is worn but veneer appears intact without delamination." },
    { type: "materials", clue: "wood_species_walnut_group", confidence: 72, description: "Veneer face on molded plywood shell shows warm medium-brown color with straight ribbon-like grain pattern consistent with walnut veneer. Could also be walnut-stained birch or other species — walnut veneer over plywood is canonical MCM construction. Confidence moderate due to finish and distance." },
    { type: "construction", clue: "plywood_structural", confidence: 93, description: "Molded plywood shell construction confirmed by visible laminate layers at the arm edge in the joinery closeup. Multiple thin plies visible in cross-section at the armrest edge where vinyl has pulled away, revealing the layered plywood substrate beneath the veneer face." },
    { type: "style", clue: "style_cue_office_lounge_chair", confidence: 52, description: "Form combines lounge chair proportions (wide seat, low back, padded arms) with office chair functionality (swivel base, casters). This hybrid form — executive lounge/conference chair — was common in American commercial and residential settings c. 1958–1975." },
    { type: "hardware", clue: "stamped_metal_bracket", confidence: 45, description: "Black stamped metal bracket/plate visible on underside of seat shell, centrally located, to which the swivel column attaches. Appears to be a stamped steel mounting plate." },
    { type: "construction", clue: "pedestal_column", confidence: 45, description: "Single central pedestal column rising from the four-star base to support the seat shell. Column appears to be aluminum or steel tube, enabling swivel rotation." },
    { type: "materials", clue: "sheet_back_panel", confidence: 50, description: "surface scratches on plywood shell" },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstered seat and back" },
    { type: "form", clue: "seating_present", confidence: 78, description: "Integrated seating is visible." },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
    { type: "label", clue: "maker_mark_cabinetmaker_paper_labels_and_inscriptions", confidence: 50, description: "Detected maker mark: Cabinetmaker paper labels and inscriptions (generic). Mark type: paper_label. Dating reference: 1770–1860. Confidence tier: LOW." },
  ],
  asSeen: {
    formId: "Lounge chair",
    display: "Mid-Century Modern / American Modernism Lounge chair (also commonly called: Easy chair, Club chair)",
    finalStyleKind: "original_period",
    dateRange: "c. 1940–1970",
    dateFloor: 1940,
    dateCeiling: 1970,
    confidence: "Moderate",
  },
};

const colonial_revival_sheraton_curly_maple_kneehole_vanity_desk: ScanFixture = {
  label: "colonial_revival_sheraton_curly_maple_kneehole_vanity_desk",
  note: "American Colonial Revival / Sheraton Revival KNEEHOLE DESK / VANITY (curly maple + figured-birch drawer fronts, burl walnut apron, neoclassical laurel-wreath inlay medallion, scrolled curly-maple backsplash, serpentine apron, six turned tapered legs with carved acanthus capitals, reeded pilasters, Sheraton oval bail pulls, partial paper label fragment in veneer-loss damage zone), c. 1890-1930 typical. Reported as 'Colonial Revival Federal/Adam/Hepplewhite/Sheraton Kneehole desk', post-1940 floor, Moderate. Mostly-defensible identification with several diagnostic findings to track: (1) M11 prose-only TRIPLE-TOKEN attribution — Federal/Adam/Hepplewhite/Sheraton family attributed conf 1.00 (PERFECT confidence, first 1.00 in the corpus) from matched_terms=['federal','hepplewhite','sheraton']. All three tokens scraped from style observation descriptions (neoclassical_inlay_medallion, serpentine_apron, reeded_pilasters, carved_acanthus_leg_capitals, scrolled_gallery_backsplash, sheraton_oval_pull — multiple style obs each containing 'Sheraton', 'Federal Revival', 'Hepplewhite' prose). NO clue KEY contains any of these tokens. 3-token match → conf 1.00 confirms that the M11 prose-only family-attribution scoring has NO UPPER CAP on prose-only matches — more prose tokens = higher confidence wrong attribution. Colonial Revival alternative at conf 0.92 (matched_terms=['colonial','revival'] from colonial_revival_style key + colonial_revival_style_cue prose) is the more accurate read. Reconciliation correctly resolved kind=revival_wave with reason 'Original-period dating for Federal/Adam/Hepplewhite/Sheraton (c. 1780-1840) is not supported by the evidence, and revival-style cues are present.' So reconciliation behaves RIGHT here — the higher-confidence wrong family was correctly converted to its revival via the revival-wave path. Display label 'Colonial Revival Federal/Adam/Hepplewhite/Sheraton' is unwieldy but technically defensible. (2) M9-fix REGRESSION CANDIDATE #2 (after S024 patent-date misparse, n=2 promotion approaches) — frame_floor=1940, P2 reasoning literally says 'The label 1940 label date is a terminus post quem.' But NO label observation contains '1940' in its description. maker_label says 'text not fully readable from photo'; maker_mark_cabinetmaker_paper_labels_and_inscriptions has dating reference 1770-1860 LOW tier. The string '1940' appears ONLY in [hardware] sheraton_oval_pull ('c. 1890-1940') and [style] colonial_revival_style ('c. 1890-1940') descriptions. parseLabelDate seems to have scanned NON-LABEL observation descriptions or scraped the 1940 from a different code path and TREATED THE CEILING OF A PRODUCTION-WINDOW AS A TPQ FLOOR. The piece's actual c. 1890-1930 typical production window is COMPLETELY EXCLUDED by floor=1940. This is the same shape as the M9 patent-date regression (S024) — production-statement parsing misinterpreting the LATEST end of a window as a TPQ. INTERNAL TRACE INCONSISTENCY: P2 cites a 'label 1940 label date' that doesn't exist in any label observation. (3) M5 RECURRING (now n=11) — 8 style clues all bucketed [style] @ wt 0.37, all with explicit c. 1890-1940 dating prose in descriptions, contribute 0 to dating overlap. Same M5 pattern as every prior specimen. (4) Form selection: form_kneehole_desk correctly chosen via kneehole_opening (conf 96, wt 0.58) + dressing_table_form (conf 65, wt 0.92) competition. Could equally be classified as form_dressing_table / vanity since the kneehole + curly-maple-backsplash + medallion are vanity vocabulary, but kneehole_desk is defensible. Alternative form 'Dressing table / vanity' is NOT in the alts list (alts: Buffet, Pedestal stand, Chest of drawers/dresser) — the true second-best form name doesn't surface. (5) M13-adjacent — partial paper label IS visible (red/black printing in veneer-loss zone) but unreadable; maker_label fires at conf 45. NOT a strict M13 because no firm name was extracted, but adjacent: a known maker label is present and undetected due to image-resolution. Likely a recognizable American Colonial Revival factory mark (Berkey & Gay, Phoenix Furniture, Robert W. Irwin, John Widdicomb, or similar Grand Rapids producer) given the curly-maple + Sheraton revival vocabulary. (6) maker_mark_cabinetmaker_paper_labels_and_inscriptions LOW tier fires AGAIN (after S040 MCM chair), now n=2, dating reference 1770-1860 — clearly the wrong period for either piece but LOW tier means weight 0.47 outweighed by everything else. Generic 'cabinetmaker paper label' detector matches ANY paper label; produces actively-wrong period reference on factory-era pieces. (7) Style waves 6 detected (1876-1910, 1900-1930, 1920-1940, 1930-1970, 1970-2000, ?) — full revival-wave coverage but the post-1940 frame_floor anchors to the LATEST wave alignment rather than the more probable c. 1900-1930 Colonial Revival peak. Net: form OK, style attribution OK after reconciliation, but post-1940 floor is too late by ~10-50 years and the 'M9-fix regression' candidate is the most actionable finding.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "flat_surface", confidence: 68, description: "Wide flat horizontal top surface visible across full width of piece; consistent with sideboard or dressing table form." },
    { type: "form", clue: "drawer_present", confidence: 68, description: "Seven drawers visible total: one shallow center drawer flanked by two small upper drawers, plus two stacks of two deeper drawers on each pedestal side." },
    { type: "form", clue: "multiple_drawer_case", confidence: 68, description: "Multiple stacked drawers in two side pedestals (two drawers each side) plus upper tier drawers; kneehole opening between pedestals." },
    { type: "form", clue: "dressing_table_form", confidence: 65, description: "Horizontal case with kneehole opening between two drawer pedestals and a scrolled gallery backsplash at rear of top; no mirror present in photos but gallery shape suggests mirror support or decorative backsplash. Could also be a sideboard/buffet. Kneehole + gallery strongly suggests dressing table or vanity." },
    { type: "style", clue: "scrolled_gallery_backsplash", confidence: 52, description: "Shaped scrolled gallery rail along back edge of top surface; scalloped and scrolled profile with lighter figured wood (curly maple) visible; consistent with Colonial Revival dressing table or sideboard backsplash." },
    { type: "style", clue: "neoclassical_inlay_medallion", confidence: 52, description: "Circular inlaid medallion centered on apron featuring laurel wreath and floral motif in contrasting lighter wood against darker ground; strongly neoclassical / Federal Revival ornament." },
    { type: "style", clue: "serpentine_apron", confidence: 52, description: "Center apron has serpentine / shaped profile with concave curves flanking the central medallion; characteristic of Hepplewhite/Sheraton and Colonial Revival sideboards and dressing tables." },
    { type: "style", clue: "reeded_pilasters", confidence: 52, description: "Vertical reeded pilaster columns flank the side drawer pedestals; fine parallel reeding consistent with Sheraton / Federal Revival / Colonial Revival style vocabulary." },
    { type: "style", clue: "carved_acanthus_leg_capitals", confidence: 52, description: "Turned tapered legs have carved acanthus leaf capitals at the top of each leg where they meet the case; neoclassical ornament consistent with Sheraton Revival / Colonial Revival production." },
    { type: "style", clue: "dentil_molding_base_rail", confidence: 52, description: "Dentil or gadrooned molding visible along the lower base rail of the case above the legs; neoclassical decorative detail." },
    { type: "hardware", clue: "decorative_bail_pull", confidence: 62, description: "All drawers fitted with oval brass bail pulls on oval backplates with decorative figural or foliate stamped ornament; consistent with Sheraton oval bail pull type; hardware shows aged patina and tarnish." },
    { type: "hardware", clue: "sheraton_oval_pull", confidence: 62, description: "Oval stamped brass backplates with bail ring handles; thin elegant profile; symmetrical geometry; consistent with Sheraton oval bail pull form used in Colonial Revival production c. 1890–1940." },
    { type: "materials", clue: "wood_species_mahogany_group", confidence: 45, description: "Primary case wood appears to be mahogany or mahogany-stained wood: warm red-brown coloration, fine even texture visible on case sides, top, and structural members; consistent with Honduran mahogany or mahogany-stained gumwood used in Colonial Revival production." },
    { type: "materials", clue: "cut_grain_phenomenon_curly_figure", confidence: 84, description: "Drawer fronts on the side pedestals show pronounced curly / tiger figure with alternating light-dark ripple bands; consistent with curly maple or figured birch veneer used as decorative show surface on drawer fronts." },
    { type: "materials", clue: "wood_species_maple_group", confidence: 72, description: "Figured drawer front veneer with strong curly figure and warm amber-gold tone is consistent with curly maple (tiger maple); also consistent with figured birch. Scrolled gallery backsplash also shows curly figure in lighter wood." },
    { type: "materials", clue: "cut_grain_phenomenon_burl", confidence: 82, description: "Center apron area surrounding the inlaid medallion shows burl veneer with circular eye pattern and swirling grain; consistent with walnut or mahogany burl veneer used as decorative apron facing." },
    { type: "construction", clue: "thick_veneer", confidence: 45, description: "Veneer loss on drawer side edge (joinery_closeup damage image) reveals veneer layer lifting from substrate; veneer appears to have some thickness but exact measurement not determinable from photo. Substrate beneath appears to be solid wood or early plywood." },
    { type: "condition", clue: "veneer_loss", confidence: 54, description: "Significant veneer loss visible on the edge/corner of a drawer side or case member; veneer has lifted and chipped away exposing substrate beneath; a partial paper label remnant is visible within the damage zone." },
    { type: "label", clue: "maker_label", confidence: 45, description: "A partial paper label remnant is visible within the veneer damage area on a drawer side or case edge; red and black printing partially legible but text not fully readable from photo; presence of label suggests original manufacturer's label was once present. Text appears to include partial letters/numbers but cannot be confidently transcribed." },
    { type: "construction", clue: "applied_molding_drawer_surrounds", confidence: 88, description: "Drawers have applied molding surrounds creating a raised panel effect on drawer fronts; consistent with factory Colonial Revival case production." },
    { type: "construction", clue: "turned_tapered_legs", confidence: 95, description: "Six turned tapered legs visible; legs taper toward the foot with ring turnings and carved acanthus leaf capitals; consistent with Sheraton-influenced neoclassical leg form used in Colonial Revival production." },
    { type: "style", clue: "colonial_revival_style", confidence: 52, description: "Overall combination of Sheraton oval bail pulls, reeded pilasters, carved acanthus legs, laurel wreath inlay medallion, curly maple veneer drawer fronts, burl apron veneer, and serpentine apron profile is consistent with American Colonial Revival / Sheraton Revival production, most likely c. 1890–1940." },
    { type: "construction", clue: "inlay_work", confidence: 45, description: "Circular inlaid medallion on center apron features contrasting wood inlay depicting laurel wreath and floral motif; inlay appears to be lighter satinwood-toned or maple-toned wood set into darker mahogany/walnut ground; quality decorative inlay work consistent with higher-end Colonial Revival production." },
    { type: "condition", clue: "shellac_intact", confidence: 54, description: "Top surface shows warm amber-brown finish with some surface wear and minor checking; consistent with intact or partially intact shellac or early lacquer finish; no obvious thick plastic polyurethane film visible. Some darkening and wear at edges." },
    { type: "condition", clue: "hardware_patina", confidence: 54, description: "Brass bail pulls show aged patina with darkening and tarnish consistent with decades of use; not bright polished modern brass; supports original or period-appropriate hardware." },
    { type: "construction", clue: "kneehole_opening", confidence: 96, description: "Central kneehole opening between two flanking drawer pedestals; opening spans the full height from apron to floor between the two center legs; consistent with dressing table, vanity, or kneehole desk form." },
    { type: "style", clue: "scrolled_gallery_backsplash_curly_maple", confidence: 52, description: "Scrolled gallery backsplash at rear of top is constructed of lighter-toned curly figured wood (likely curly maple or birch) with scalloped and scrolled profile; contrasts with darker mahogany case body; decorative two-tone effect consistent with Colonial Revival dressing table design." },
    { type: "construction", clue: "reeded_molding_top_edge", confidence: 90, description: "Multiple parallel reeded molding bands visible along the top edge of the case just below the top surface; consistent with Sheraton-influenced neoclassical molding profile." },
    { type: "form", clue: "pedestal_column", confidence: 84, description: "Single-column pedestal form is visible." },
    { type: "label", clue: "maker_mark_cabinetmaker_paper_labels_and_inscriptions", confidence: 50, description: "Detected maker mark: Cabinetmaker paper labels and inscriptions (generic). Mark type: paper_label. Dating reference: 1770–1860. Confidence tier: LOW." },
  ],
  asSeen: {
    formId: "Kneehole desk",
    display: "Colonial Revival Federal / Adam / Hepplewhite / Sheraton Kneehole desk (also commonly called: Kneehole desk, Flat-top kneehole desk)",
    finalStyleKind: "revival_wave",
    dateRange: "post-1940",
    dateFloor: 1940,
    dateCeiling: null,
    confidence: "Moderate",
  },
};

const victorian_golden_oak_platform_rocker_reupholstered: ScanFixture = {
  label: "victorian_golden_oak_platform_rocker_reupholstered",
  note: "Victorian GOLDEN OAK PLATFORM ROCKER, c. 1885-1910 American production, frame is solid flat-sawn oak with serpentine S-curve arm supports + turned spindles + scrolled base sled runners + coil-spring platform mechanism + small casters; reupholstered in 1960s-70s orange chenille/jacquard with hand-tacked nailhead trim. Engine reported as 'American Empire / late Classical Revival Rocking chair', c. 1900-1940 Moderate date, High overall. Form correct, date defensible (true c. 1885-1910 sits inside 1900-1940 window, ceiling 1940 too late by ~30 years), style label canned-default spurious. Multiple diagnostic findings: (1) PHASE 0 PART A SECOND POSITIVE DATAPOINT — platform_rocker_form (Tier 3 weight 0.92) fired correctly at conf 68 with description literally identifying 'the defining platform rocker configuration'. Contributed correctly to form_rocking_chair selection. Joins S040 MCM molded plywood as confirmation that Phase 0 Part A direct-form clues DO contribute to form selection via CLUE_LIBRARY weight (Tier 3 dictionary consumption is still rolled back, but the form clue's library weight is enough). Subtype (subtype_rocking_platform) not attached because Part B taxonomy authoring not yet shipped — display reads generic 'Rocking chair' instead of 'Platform rocker'. Adjacent: also note rocking_chair_form Phase 0 Part A Tier 3 clue NOT emitted on this scan (platform_rocker_form took its place — correct precedence). (2) fix#10 SPURIOUS DEFAULT 'American Empire / late Classical Revival' — now n=6 across S009 clock + S011 apothecary chest + S019 commode rescan + S022 Globe-Wernicke bookcase + S035 live deploy + S042 Victorian platform rocker. The piece is a Victorian Golden Oak platform rocker, the LEAST American Empire object imaginable, yet gets the canned context_only label. Pattern shape unchanged from prior specimens. (3) M5 STRANDED VICTORIAN/GOLDEN-OAK ATTRIBUTION (now n=12) — multiple style obs contain explicit c. 1875-1910 Victorian and Golden Oak dating prose: style_cues 'American Victorian-era platform rockers, c. 1875-1910, consistent with Golden Oak production period', serpentine_arm_supports 'Victorian-era platform rockers, c. 1875-1910', base_runner_scrolled 'Victorian platform rocker base', wood_species_oak_group 'Golden Oak era production', platform_rocker_form 'Victorian'. NONE of these contribute to style attribution because no clue KEY contains 'victorian' / 'golden_oak' / 'golden oak'. Style attribution = null, alternatives = 0, style_waves = 0. The Victorian / Golden Oak family is a notable canonical-vocabulary GAP. (4) CLUE_LIBRARY COIL_SPRING DATING ERROR REPRODUCES (n=3, after S031 + S032) — coil_spring CLUE_LIBRARY dating reference 'c. 1780-1830' conflicts with slotted_screw 'c. 1840-1940' in P5, slotted_screw favored 8/10. But coil_spring 1780-1830 is wrong vocabulary: coil-spring upholstery wasn't widespread until 1830s-50s and Victorian platform rockers c. 1885-1910 universally use coil springs. Same vocabulary error fired 3 times. (5) M10-INVERSE P5 CONFLICT RESOLUTION — same shape as S036: a STYLE/UPHOLSTERY clue conflicting with slotted_screw fastener, the latter favored on authority. Different from S036 (different style clue) but same mechanism: weak-authority fastener-ceiling-as-authority-winner drops a defensible style/upholstery floor. (6) M7 NEGATION-AS-OBSERVATION (n=11) — TWO observations in negation mode: swivel_mechanism (conf 80, 'No swivel plate visible. The mechanism is a spring-based rocking/tilting platform, not a swivel') + parlor_rocker_form (conf 52, 'this is NOT a parlor rocker'). The parlor_rocker_form negation is the FOURTH Phase 0 Part A Tier 3 direct-form clue used in negation mode by the LLM (joining S036 pedestal_column + mid_century_streamlined_wicker + brass_frame). Confirms LLM uses Phase 0 Part A clue keys in negation mode to record what the piece is NOT. CLUE_ROUTING consumption is rolled back so the Tier 3 negation can't pull form selection regardless — no anomaly in this scan, but worth tracking if Step 6 re-wiring resumes. (7) M0 spindle synthesis NOT a false-positive here — round_tenon obs explicitly references 'Turned spindles between the arm rail and seat rail' so spindle_back + spindle_gallery fire on actual spindles. Genuine observation, not synthesis pathology. (8) Date math: convergence zone 1840-1940 (4 layers: joinery + fastener + upholstery + hardware). Frame floor 1900 from modern_caster post-1900 + frame ceiling 1940 from slotted_screw c. 1840-1940. True production c. 1885-1910 is partially excluded by floor 1900. Ceiling 1940 is 30+ years past the likely actual ceiling. Despite these errors the overall date IS broadly defensible. (9) Upholstery correctly split: orange chenille recognized as later reupholstery campaign in condition_overall obs, but [upholstery] layer Identification 'Jacquard nailhead-trimmed upholstery with coil spring construction' Range 'broad — cover-only signal' Low — engine acknowledges no underside view of stuffing. Good honest split. Net: form correct (Phase 0 Part A working), date broadly correct, style label canned-default-spurious. Two corpus firsts: SECOND positive Phase 0 Part A direct-form clue datapoint (S040 was the first), AND fourth Phase 0 Part A negation-mode emission specimen.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "platform_rocker_form", confidence: 68, description: "Chair body sits on a stationary flat base platform with large coil/spiral springs connecting the seat frame to the base — no curved wooden rockers under the legs. The chair pivots/rocks via the spring mechanism on a fixed base. This is the defining platform rocker configuration." },
    { type: "form", clue: "seating_surface", confidence: 68, description: "Upholstered seat cushion present, orange/rust woven fabric, attached to a shaped oak seat frame with nailhead trim border." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Tall upholstered backrest with arched top, covered in matching orange/rust fabric, secured to oak back stiles with nailhead trim along all edges." },
    { type: "style", clue: "parlor_rocker_form", confidence: 52, description: "While partially upholstered and Victorian in era, this is NOT a parlor rocker — it has no curved wooden rockers under the legs. The spring-base platform mechanism definitively classifies it as a platform rocker rather than a parlor rocker." },
    { type: "structure", clue: "coil_spring", confidence: 82, description: "Large exposed coil/spiral springs are clearly visible beneath the seat frame, connecting the upper seat assembly to the lower base platform. Multiple large-diameter metal coil springs visible from side and underside views — this is the rocking/springing mechanism of the platform rocker base." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Frame members including base runners, seat rails, arm supports, and back stiles are solid oak — not veneered. Flat-sawn oak grain with prominent cathedral pattern and open pore structure clearly visible on base sled members and seat rail sides." },
    { type: "materials", clue: "wood_species_oak_group", confidence: 84, description: "Strong open-pore ring-porous grain structure with prominent cathedral arching visible on base runner members and seat rail sides. Warm amber-brown color consistent with aged oak. Flat-sawn orientation dominant on base members. Consistent with Golden Oak era production." },
    { type: "style", clue: "style_cues", confidence: 52, description: "Combination of serpentine S-curve arm supports, turned spindles between arm rail and seat, scrolled/shaped base sled runners, coil spring platform base, and nailhead-trimmed upholstery are all characteristic of American Victorian-era platform rockers, c. 1875–1910, consistent with Golden Oak production period." },
    { type: "structure", clue: "swivel_mechanism", confidence: 80, description: "No swivel plate visible. The mechanism is a spring-based rocking/tilting platform, not a swivel. Chair rocks forward and back via coil spring compression." },
    { type: "hardware", clue: "modern_caster", confidence: 62, description: "Small casters visible at the ends of the base runner feet in multiple images. Appear to be small metal or rubber-wheeled casters allowing the chair to roll on the floor. Consistent with Victorian-era platform rocker casters (porcelain or early rubber type possible at this scale)." },
    { type: "hardware", clue: "nailhead_trim", confidence: 62, description: "Rows of small decorative nailheads visible along all upholstery edges — seat perimeter, back panel perimeter, and arm pad edges. Nailheads appear oxidized/darkened, consistent with age. Spacing appears hand-placed with slight irregularity, suggesting individual tack placement rather than modern strip nailhead." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 45, description: "Cover fabric is orange/rust colored with a visible woven texture showing slight pattern complexity — appears to be a woven upholstery fabric, possibly a jacquard or plain-weave wool/synthetic blend. The texture shows a slightly nubby, open weave with color variation (orange with darker flecks). Could also be a heavy chenille or tweed-type fabric. Classifying as jacquard_cover as best fit for a patterned woven upholstery fabric; uncertainty noted — could be a plain-weave wool or chenille." },
    { type: "upholstery", clue: "hand_tacks", confidence: 45, description: "Nailhead trim along upholstery edges appears to be individually placed upholstery tacks with slight spacing irregularity, consistent with hand-tacked application rather than modern strip nailhead. Tack heads are oxidized/darkened." },
    { type: "construction", clue: "slotted_screw", confidence: 72, description: "Slotted screw heads visible at seat rail attachment points where the arm support meets the seat frame. Consistent with pre-1940 hardware. No Phillips screws observed." },
    { type: "structure", clue: "round_tenon", confidence: 70, description: "Turned spindles between the arm rail and seat rail appear to use round tenon joinery entering round mortises in the arm and seat rail members — consistent with Victorian chair construction practice." },
    { type: "style", clue: "serpentine_arm_supports", confidence: 52, description: "Arm supports are shaped in a pronounced S-curve / serpentine profile, carved from solid oak. This decorative arm support form is characteristic of Victorian-era platform rockers and parlor chairs, c. 1875–1910." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Chair has two armrests — flat padded arm rails supported by serpentine carved supports and turned spindles on each side." },
    { type: "construction", clue: "cut_grain_phenomenon_flat_sawn", confidence: 90, description: "Prominent cathedral arch grain pattern visible on the flat faces of the base sled runner members, confirming flat-sawn orientation of the oak stock used for the base." },
    { type: "condition", clue: "condition_overall", confidence: 45, description: "Frame appears structurally intact with no visible breaks, cracks, or major losses. Upholstery is in the orange/rust fabric which appears to be a later reupholstery campaign (color and fabric type suggest mid-to-late 20th century reupholstery over an original Victorian frame). Nailhead trim is oxidized. Wood shows age patina." },
    { type: "style", clue: "base_runner_scrolled", confidence: 52, description: "The lower base platform consists of shaped/scrolled oak sled-like runners with curved ends and decorative shaping — a characteristic Victorian platform rocker base form. The runners extend forward and backward from the spring assembly and terminate in scrolled or pointed ends with casters." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstery appears reupholstered in orange/rust fabric" },
    { type: "form", clue: "seating_present", confidence: 78, description: "Integrated seating is visible." },
    { type: "structure", clue: "spindle_back", confidence: 78, description: "Spindles are visible in the back or side rail." },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
  ],
  asSeen: {
    formId: "Rocking chair",
    display: "Rocking chair",
    finalStyleKind: "context_only",
    dateRange: "c. 1900–1940",
    dateFloor: 1900,
    dateCeiling: 1940,
    confidence: "Moderate",
  },
};

const empire_revival_cabriole_clawfoot_rocker_with_plank_seat: ScanFixture = {
  label: "empire_revival_cabriole_clawfoot_rocker_with_plank_seat",
  note: "American EMPIRE REVIVAL rocker (American factory production c. 1880-1910), cabriole front legs with carved claw-and-ball feet + five vase/fiddle-form shaped back splats + scrolled arms + saber rear legs + paired curved wooden rockers; seat appears to be originally upholstered (deteriorated red leather/oilcloth still visible on the plank) but the engine read it as a solid wood plank seat. Reported as 'Empire / Duncan Phyfe Revival Rocking chair, Broadly late 19th to 20th century (c. 1900-2000), Low frame conf, Moderate overall.' Form correct, style correct via clue-key-sourced M11 path, date honestly Low and broad. Multiple diagnostic findings: (1) PHASE 0 PART A THIRD POSITIVE DATAPOINT — rocking_chair_form Tier 3 weight 0.89 fired at conf 45 [form] correctly. Joins S040 MCM + S042 Victorian platform rocker as the third successful Phase 0 Part A direct-form-clue specimen. parlor_rocker_form ALSO fired at conf 45 wt 0.89 [form]; both fired as positive votes here (parlor_rocker_form not in negation mode this time — the description hedges 'may be a hybrid Empire/Victorian armchair rocker form' which is positive-leaning observation). form_rocking_chair correctly chosen as primary form. Subtypes (subtype_rocking_parlor) not attached because Part B taxonomy authoring still parked. (2) M11 CLUE-KEY-SOURCED ATTRIBUTION (THIRD CLEAN SPECIMEN with S029 + S033) — American Classical / American Empire / Greco-Roman attributed conf 0.70 from matched_terms=['empire']. The 'empire' token IS a clue KEY — empire_revival_style is one of the clue keys, and the matched_terms scrape picks up 'empire' from BOTH the clue KEY name AND multiple style description prose. Clean clue-key-sourced path producing a CORRECT outcome. Joins S029 eastlake_hardware ('eastlake') + S033 aesthetic_movement_style ('aesthetic') as the third clue-key-sourced specimen for the must-not-regress preserve-me set of any future M11 fix design. (3) REVIVAL-WAVE CONTAINMENT CHECK ERROR (S016 SIBLING) — final_style_reason says 'Final dating (c. 1900-2000) aligns with the Empire / Duncan Phyfe Revival (c. 1890-1935) wave.' But 1900-2000 only OVERLAPS 1890-1935 partially (1900-1935); the ceiling 2000 is 65 years past the wave ceiling. Same containment-assertion error as S016 ('1925-1975 falls within 1895-1930'). Engine asserts 'aligns with' on partial overlap. fix #8b candidate. Same shape as fix #5 partial-overlap wording fix but the underlying containment-check is broken at the math level not just the wording. (4) M0 LOUNGE_CHAIR_FORM FALSE-POSITIVE — fires at conf 78 wt 0.52 [form] on a clearly arm-based armchair-rocker. Did NOT win form (form_rocking_chair won) but landed as alternative form #1 ('Lounge chair' tops the alternative list). The synthesized lounge_chair_form M0 over-emit pattern continues — fires on multiple armchair/rocker forms. (5) M6/M7 fully_upholstered CONTRADICTION — fully_upholstered fires at conf 74 wt 0.71 [materials] with description 'Upholstered or cushioned surfaces are visible' but solid_wood_seat (conf 82) says 'No upholstery, no spring construction, no fabric' and seating_surface obs says 'No upholstery or cushion present.' INTERNAL CONTRADICTION between observations. The Frame/Upholstery split correctly bucketed 26 frame + 0 upholstery (correctly recognized no real upholstery despite the FP), but fully_upholstered DID leak into the report — upholstery layer Identification reads 'Upholstery present (insufficient detail to classify)' which is wrong given the engine's own primary observation of bare wood plank. NEW M6 sub-pattern: contradictory observations within the same scan where the wrong one drives the report. (6) M5 STRANDED — empire_revival_style clue carries explicit 'c. 1880-1910 American factory production' dating in description. This is the EXACT correct date window. Bucketed [style] @ wt 0.37. Contributes via style attribution as 1810-1850 ORIGINAL period family bounds (the empire revival 1890-1935 wave is correct but applied as wave date, not piece-specific date). The c.1880-1910 window in the description prose is lost. (7) Phase 0 Part A negation specimen #5 — spindle_back fired at conf 52 [style] in negation/refutation mode: 'Back consists of five shaped flat splats with vase/fiddle/hourglass profile RATHER THAN turned round spindles.' Not a Phase 0 Part A direct-form clue per se (spindle_back is structural, not in the Part A authoring list), but same shape as Phase 0 Part A negation usage. (8) Date math: convergence zones = 0. Frame floor=1900 ceil=2000. Floor 1900 from form 1800+ extrapolation, ceiling 2000 from style_wave 1860-2000. This is fix#1 catch-all ADJACENT — defaults to 'late 19th-20th century' broad range when no convergence forms. The TRUE c.1880-1910 window is sitting in empire_revival_style description but no dating layer carries it. Honest Low conf is the saving grace — engine acknowledges 'one dating-detail evidence category' as sufficiency rationale. (9) Spurious style waves include 1970-2000 (no Empire production in this window meaningfully) — wave detector over-fires. Net: form correct (Phase 0 Part A third success), style correct via clue-key-sourced M11 (third clean specimen), date broadly correct but ceiling 2000 is way too late, containment-assertion error (S016 sibling). This is a STRONG calibration scan — the clue-key-sourced M11 path produces a CORRECT 'Empire Revival' answer cleanly.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "rocking_chair_form", confidence: 45, description: "Paired curved wooden rockers are clearly attached to the leg bottoms; the chair has a full backrest and armrests; this is a rocking chair. The chair has upholstered-style anatomy but the seat appears to be a solid wood plank seat rather than upholstered." },
    { type: "form", clue: "parlor_rocker_form", confidence: 45, description: "Victorian-era rocker with carved claw feet, scrolled arms, shaped back splats, and decorative carved elements consistent with parlor rocker classification. Frame is more decorative than a plain household kitchen rocker. However, the seat appears to be a solid wood plank rather than upholstered, which is atypical for parlor rockers — may be a hybrid Empire/Victorian armchair rocker form." },
    { type: "form", clue: "seating_surface", confidence: 68, description: "Solid wood plank seat visible from overhead joinery closeup; seat is shaped/contoured, dark red-stained, with heavy wear scratches consistent with long use. No upholstery or cushion present." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Curved crest rail spanning full width of chair back, with five shaped vase/fiddle-form back splats mortised between crest rail and seat rail. Crest rail is rounded/rolled at top." },
    { type: "style", clue: "spindle_back", confidence: 52, description: "Back consists of five shaped flat splats with vase/fiddle/hourglass profile rather than turned round spindles. These are flat sawn and shaped, not turned spindles." },
    { type: "style", clue: "cabriole_leg", confidence: 52, description: "Front legs exhibit cabriole-style form with pronounced knee, curved leg, and carved claw-and-ball feet. This is a defining Empire/Victorian stylistic feature visible clearly in the front view." },
    { type: "style", clue: "claw_and_ball_feet", confidence: 52, description: "Front legs terminate in carved claw-and-ball feet, clearly visible in the overall front image. This is a characteristic feature of Chippendale-revival and Empire/Victorian furniture, c. 1880–1910 in American factory production." },
    { type: "style", clue: "scrolled_arms", confidence: 52, description: "Arms are deeply scrolled/curved with a pronounced downward scroll at the front terminus. Arm supports are shaped with a vase/bracket profile. This scrolled arm form is characteristic of Empire Revival and Victorian parlor seating." },
    { type: "style", clue: "curved_crest_rail", confidence: 52, description: "Crest rail is a continuous curved/bowed form, rounded in cross-section, sweeping from one side post to the other. Visible from front, back, and side views." },
    { type: "style", clue: "shaped_back_splats", confidence: 52, description: "Five flat back splats with vase/fiddle/hourglass profile, wider at top and bottom, narrowing at center. Visible from front, back, and joinery closeup views. Splats appear to be sawn to shape rather than turned." },
    { type: "style", clue: "central_back_support", confidence: 52, description: "A shaped central back support/splat is visible from the side view — a vase or urn-shaped central vertical member connecting the seat rail to the crest rail area, serving as both structural and decorative element. This is characteristic of Empire and Victorian chair construction." },
    { type: "structure", clue: "curved_rockers", confidence: 82, description: "Paired curved wooden rockers are clearly visible in all views, attached to the bottoms of the front and rear legs. Rockers are substantial in width and have a long sweep. Rear rocker ends extend well behind the chair." },
    { type: "structure", clue: "solid_wood_seat", confidence: 82, description: "Seat is a solid wood plank, shaped/contoured, visible from overhead. No upholstery, no spring construction, no fabric. Seat shows heavy wear scratches and staining consistent with long use as a bare wood seat." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "All visible components appear to be solid wood — no veneer, no plywood, no lamination visible. Frame members show solid wood cross-sections at wear points and edges." },
    { type: "condition", clue: "finish_worn_through", confidence: 54, description: "Finish is worn through at high-contact areas: arm tops, seat surface, crest rail top. Lighter wood color visible at wear-through points, especially on arms and seat edges. This is age-consistent wear rather than deliberate stripping." },
    { type: "condition", clue: "heavy_seat_wear", confidence: 54, description: "Seat surface shows extensive scratching, wear marks, and finish loss consistent with decades of use. Overhead view clearly shows multiple scratch directions and worn areas across the seat plank." },
    { type: "condition", clue: "age_patina", confidence: 54, description: "Overall dark oxidized patina consistent with significant age. Color variation between protected and exposed areas, darkening at joints and recesses, and wear patterns at handling points all suggest genuine age rather than artificial distressing." },
    { type: "condition", clue: "surface_checking", confidence: 54, description: "Minor surface checking/cracking visible on seat surface and some frame members, consistent with wood movement over time in an aged piece." },
    { type: "construction", clue: "round_tenon", confidence: 40, description: "Arm supports and leg-to-rocker connections may use round tenon joinery typical of Victorian chair construction, but cannot be confirmed from visible surfaces." },
    { type: "style", clue: "empire_revival_style", confidence: 52, description: "The combination of claw-and-ball feet, cabriole front legs, scrolled arms, shaped back splats, and curved crest rail is characteristic of American Empire Revival / Victorian parlor chair production, c. 1880–1910. The overall silhouette and decorative vocabulary align with late Victorian factory production of Empire-influenced seating." },
    { type: "structure", clue: "rear_legs_form", confidence: 82, description: "Rear legs are swept/saber-form, curving backward from the seat to the rocker attachment point. This is visible in the side views and is consistent with Empire and Victorian chair construction." },
    { type: "structure", clue: "arm_support_bracket", confidence: 82, description: "Arm supports are shaped bracket/vase forms connecting the seat rail to the arm. Visible from side and front views. These shaped supports are a characteristic Victorian decorative element." },
    { type: "condition", clue: "structural_integrity", confidence: 45, description: "No visible broken joints, missing members, or structural failures observed. Chair appears to be structurally intact despite heavy surface wear." },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "form", clue: "armchair_form", confidence: 82, description: "Armchair form is visible." },
    { type: "materials", clue: "fully_upholstered", confidence: 74, description: "Upholstered or cushioned surfaces are visible." },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
  ],
  asSeen: {
    formId: "Rocking chair",
    display: "Empire / Duncan Phyfe Revival Rocking chair",
    finalStyleKind: "revival_wave",
    dateRange: "Broadly late 19th to 20th century",
    dateFloor: 1900,
    dateCeiling: 2000,
    confidence: "Low",
  },
};

const goldstrom_bros_baltimore_marble_top_victorian_occasional_pedestal_table: ScanFixture = {
  label: "goldstrom_bros_baltimore_marble_top_victorian_occasional_pedestal_table",
  note: "Small Victorian-era / Victorian-revival MARBLE-TOP PEDESTAL OCCASIONAL TABLE (round faux-marble or marble top + turned baluster column + four scrolled cabriole-style splayed legs in walnut/mahogany), handwritten cursive retailer inscription 'Goldstrom Bros / Baltimore' on the underside. Goldstrom Bros is a known Baltimore-area furniture/antique dealer. Likely c. 1900-1940 production (could be earlier original Victorian c. 1880-1910 or later Victorian-revival reproduction). Reported as 'Occasional table, c. 1890-1920, Pedestal stand (context_only), Moderate.' Form generic but defensible, date in fix#1 catch-all range, retailer name dropped from display. Multiple diagnostic findings: (1) fix#1 CATCH-ALL SHAPE (now n=7) — frame_floor=1890 frame_ceiling=1920 with convergence_zones=0. Only dating layers contributing are form 1750+ and finish 1800-1920 (shellac_intact) — overlap width should be 1750-1920 (170 years), but engine reports a 30-year window c. 1890-1920. The 1920 ceiling lines up with finish ceiling; the 1890 floor doesn't come from any layer. This is the EXACT fix#1 hardcode shape from S001/S002/S008/S010/S011/S012. Joins as the 7th specimen of the c. 1890-1920 default-when-no-convergence pathway, post-Phase-0-deploy. (2) M13 PARTIAL — handwritten Goldstrom Bros / Baltimore retailer inscription captured verbatim at maker_label conf 45 wt 0.98 + visible_text conf 45 wt 0.52 — but display drops the retailer entirely. New M13 sub-pattern: HANDWRITTEN DEALER/RETAILER MARKS (vs printed/embossed maker labels in prior M13 specimens S022 Globe-Wernicke through S039 Sligh). The retailer name is in the maker_label observation description verbatim ('Goldstrom Bros' line 1, 'Baltimore' line 2) but matchMakerMarks doesn't have a detector for Goldstrom Bros (Baltimore retailer, not a national-scale manufacturer). M13 adjacent: handwritten retailer marks dropped is a sub-variant of M13 captured-maker-not-surfaced. (3) M6 STRONG FALSE-POSITIVE — writing_surface fires at conf 84 weight 0.94 [function] with description literally 'A writing or work surface is visible. This indicates a dedicated writing or work surface, consistent with a desk, secretary, or writing table.' On an 18-22 inch round marble-top occasional table — there is NO writing surface (the round marble top is not a writing surface). writing_surface should not fire on a small marble-top stand. The wt 0.94 is alarming — if this clue had a form route to form_writing_desk it would dominate form selection. Possible CLUE_LIBRARY semantic-too-broad pattern: writing_surface should require additional context (kneehole / drawers / writing-suitable scale). NEW M6 sub-pattern: writing_surface false-positive on flat top surfaces. (4) FORM-CONTEXT-AS-STYLE-LABEL — final_style_label = 'Pedestal stand' kind=context_only. 'Pedestal stand' is a FORM (form_pedestal_stand is in canonical form taxonomy and appears in alternatives_considered list as alt #1) being used as a STYLE LABEL. New fix#10 variant: canned-default style label populated with a form-category name when no style attribution fires. Joins the prior fix#10 specimens (S009/S011/S019/S022/S035/S042 'American Empire / late Classical Revival', S010/S016/S017/S024 'Modernist / chrome-frame', S032 'Upholstered seating', S038 'Art Deco' from prose). Pattern: deriveStyleContext falls back to form-category name when nothing else fires. (5) M5 STRANDED (n=13) — victorian_pedestal_table_form (conf 52) description literally says 'Victorian-era occasional tables, wine tables, or lamp stands, c. 1860-1910.' + turned_column (conf 52) 'Victorian-era and Victorian-revival.' Both bucketed [style] @ wt 0.37, contribute 0 to dating. Same M5 pattern; Victorian/Golden Oak family canonical-vocabulary gap. (6) tripod_base clue KEY vs QUADRIPOD content — tripod_base fires at conf 82 [structure] with description literally 'Four legs visible (not three), making this a quadripod rather than true tripod.' Key-vs-content mismatch (cf. S015 multiple_drawer_case KEY vs 'not a chest' content). The KEY drives whatever scoring branch is keyed to tripod_base regardless of the four-leg correction. (7) cabriole_leg M0-borderline — fires at conf 50 [style] with description 'cabriole-style splayed legs' — the legs are scrolled/curved Victorian splayed legs, more cabriole-style than true cabriole. Not a clear M0 but observation could be tighter. (8) M11 NEGATIVE — no style family attribution, style waves = 0. No matched_terms anywhere. Victorian-period dating in prose at @ 0.37 contributes nothing to attribution; despite victorian_pedestal_table_form clue KEY containing 'victorian' token, no style_family_victorian exists in the families list to receive the token. (9) Phase 0 Part A NOT exercised here — no rocker, no settee, no Windsor, no chest, no bistro, no china cabinet, no dressing-table, no peacock, no milking stool. (10) Date math: Form/Style identity is reasonable. The frame floor/ceiling c. 1890-1920 is plausible for a Goldstrom Bros retailer attribution but the underlying engine path is fix#1 catch-all not evidence-derived. True date probably c. 1900-1940. Net: identification mostly defensible at form level, retailer dropped (M13 partial), date in fix#1 catch-all shape (n=7), writing_surface M6 false-positive promoted, form-name-as-style fix#10 variant.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "flat_surface", confidence: 68, description: "Circular flat top surface present, approximately 18-22 inches in diameter based on proportions, suitable for display or occasional use." },
    { type: "form", clue: "pedestal_column", confidence: 68, description: "Central turned baluster-form pedestal column supporting the round top; column features baluster turning with vase and ring elements, topped by a faceted octagonal capital block directly under the top platform." },
    { type: "structure", clue: "tripod_base", confidence: 82, description: "Four outward-splayed curved legs radiating from the base of the central column; legs have a gentle cabriole-like curve with scroll or pad termination at the feet. Four legs visible (not three), making this a quadripod rather than true tripod." },
    { type: "structure", clue: "legs", confidence: 82, description: "Four curved splayed legs with scrolled upper knee brackets mortised into the central column base; legs curve outward and downward with scroll feet. Upper portion of each leg has a decorative notched or bracketed attachment to the column." },
    { type: "materials", clue: "stone_top", confidence: 45, description: "Round top appears to be a natural stone — cream/beige ground with tan, gold, and brown veining consistent with marble (likely beige/cream marble or onyx). Surface is polished and smooth with beveled edge. Could also be a high-quality faux marble, but veining pattern and translucency suggest genuine stone." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Base and column appear to be solid hardwood — medium-dark brown with warm reddish undertones consistent with walnut, mahogany, or a similar dark hardwood. Grain visible on leg surfaces. No veneer evidence on structural members." },
    { type: "style", clue: "turned_column", confidence: 52, description: "Column features classic baluster turning — vase form with ring collars — topped by a faceted (octagonal or multi-sided) capital block. This combination is characteristic of Victorian-era and Victorian-revival occasional tables, wine tables, and lamp stands." },
    { type: "style", clue: "victorian_pedestal_table_form", confidence: 52, description: "Overall form — round stone top, turned baluster column, four splayed curved legs — is consistent with Victorian-era occasional tables, wine tables, or lamp stands, c. 1860–1910. The combination of marble top with turned walnut-type base is a well-documented Victorian parlor form." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 65, description: "Legs appear to be mortised into the central column base via a blocked junction; the decorative notched brackets at the leg tops suggest a mortise-and-tenon or through-tenon attachment into the column. No visible mechanical fasteners at leg junctions." },
    { type: "label", clue: "maker_label", confidence: 45, description: "Handwritten inscription in cursive on the underside of the top reads 'Goldstrom Bros' on the first line and 'Baltimore' on the second line, with additional partial text and what appears to be a number or price notation. This is consistent with a retailer or maker chalk/pencil inscription. 'Goldstrom Bros' is a Baltimore-area furniture or antique dealer attribution. Additional partial text visible in first underside image may include a date or inventory number." },
    { type: "label", clue: "visible_text", confidence: 45, description: "Underside label_makers_mark image shows cursive handwriting: Line 1 reads 'Goldstrom Bros' (possibly 'Goldstrom Bros.' with period); Line 2 reads 'Baltimore'; additional partial text below includes what appears to be a number (possibly '22' or similar) and additional cursive characters partially cut off at image edge. The inscription appears to be in pencil or chalk directly on the wood surface." },
    { type: "condition", clue: "condition_cues", confidence: 54, description: "Wood base shows age-consistent patina and finish wear, particularly at the leg feet where contact with floor has worn the finish. Stone top appears intact with no visible chips or cracks. Overall condition consistent with a well-used antique or vintage piece." },
    { type: "finish", clue: "shellac_intact", confidence: 55, description: "Wood base shows warm amber-brown surface with moderate sheen consistent with shellac or oil varnish finish. No plastic-like polyurethane sheen visible. Finish appears aged and worn at high-contact areas, consistent with original or early-restored shellac or oil varnish." },
    { type: "construction", clue: "wood_platform_under_stone", confidence: 88, description: "A circular wooden platform or collar is visible between the stone top and the column capital; the stone top rests on or is set into this wooden platform. The platform edge is visible in the side view showing a distinct wood ring supporting the stone." },
    { type: "structure", clue: "turned_ring_at_column_base", confidence: 82, description: "A turned ring or collar is visible at the base of the column just above the leg junction, serving as a decorative and structural transition between the column shaft and the leg attachment block." },
    { type: "materials", clue: "wood_species_walnut_group", confidence: 60, description: "Wood color — medium-dark warm brown with reddish undertones — is consistent with walnut or mahogany. Grain visible on leg surfaces appears fine and straight. Without closer grain inspection, walnut and mahogany are both plausible; the warm reddish-brown tone slightly favors walnut." },
    { type: "condition", clue: "underside_wood_surface", confidence: 54, description: "Underside of the top platform visible in the underside image shows bare or lightly finished wood with visible grain, consistent with an unfinished secondary surface. The wood appears medium-dark brown with straight grain, consistent with walnut or mahogany secondary surface." },
    { type: "style", clue: "cabriole_leg", confidence: 50, description: "cabriole-style splayed legs" },
    { type: "function", clue: "writing_surface", confidence: 84, description: "A writing or work surface is visible." },
  ],
  asSeen: {
    formId: "Occasional table",
    display: "Occasional table (also commonly called: Occasional table, Accent table)",
    finalStyleKind: "context_only",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

const victorian_curlicue_wicker_rocker_misid_as_loom: ScanFixture = {
  label: "victorian_curlicue_wicker_rocker_misid_as_loom",
  note: "VICTORIAN CURLICUE WICKER ROCKER (American c. 1880-1900 era heavily-ornamented wicker rocker), heavy white paint buildup over earlier paint campaigns, original wicker construction (NOT Lloyd loom paper fiber). Engine reported as 'Loom (Loom / Weaving loom)', c. 1920-1930, Low frame conf, Moderate overall. SECOND specimen of the LOOM MISID PATTERN — joins peacock_emmanuelle_rattan_chair as the n=2 promotion datapoint for the planned 'loom fix'. Identical mechanism: (1) lloyd_loom_paper_fiber clue fires at conf 80 weight 0.91 [materials] — the HIGHEST-weighted materials clue. Description NEGATES Lloyd loom presence verbatim: 'Strands visible at scroll ends and frame edges appear to be natural rattan/reed... rather than uniform extruded paper strands on wire cores characteristic of Lloyd loom construction (post-1917). The irregular organic taper of the scroll elements is inconsistent with paper fiber.' (2) wood layer is anchored to 1920-1950 from lloyd_loom_paper_fiber 'source' line — the NEGATION-MODE observation is being CONSUMED AS POSITIVE EVIDENCE for date layer. Same exact M7→M6 chain as peacock fixture: NEGATED clue contributes positive dating to wood layer because the engine doesn't check the description's polarity. (3) form_loom selected as primary form. lloyd_loom_paper_fiber clue KEY contains the substring 'loom' → form_loom alias match → form_loom wins. Despite TWO Phase 0 Part A direct-form clues firing positively (rocking_chair_form conf 68 wt 0.92 + parlor_rocker_form conf 68 wt 0.92 [form]) plus rocker observations (curved wooden rockers visible, etc.) — form_loom STILL won via substring match against the lloyd_loom KEY. (4) Frame_floor=1920 frame_ceiling=1930 c. 1920-1930 — true date c. 1880-1900 Victorian curlicue era. The 1920 floor comes directly from the negated lloyd_loom_paper_fiber wood-layer contribution. fix#1-adjacent shape but driven by M7 negation rather than catch-all default. (5) M7 NEGATION CASCADE: THREE negation-mode observations in one scan — bar_harbor_style_wicker ('does NOT exhibit Bar Harbor'), mid_century_streamlined_wicker ('does NOT exhibit mid-century streamlined wicker'), lloyd_loom_paper_fiber ('inconsistent with paper fiber'). All three K1ed clue keys consumed as positive evidence. Joins S036 as the second 3-negation-in-one-scan specimen. (6) P5 conflict resolution correctly handles two of the three negations: wicker_weave_open (10/10 authority) wins over mid_century_streamlined_wicker (correctly recognizing the negation result) and wire_wrapped_metal_joint wins over mid_century_streamlined_wicker. BUT P5 does NOT process the lloyd_loom_paper_fiber negation — that one slips through to drive wood-layer dating and form selection. P5 layer is doing PARTIAL negation handling: conflict-resolution branch catches some negations via authority tiebreak but NOT the form-route-driving lloyd_loom KEY. (7) fix#10 canned-default style label — TWO DIFFERENT canned defaults observed simultaneously: LIVE DEPLOY trace text shows 'American Empire / late Classical Revival' as style context (7th specimen of that string), but LOCAL CORPUS HARNESS reproduces 'Spindle Gallery' as style context (NEW canned default, n=1, sourced from spindle_gallery clue key). Deployment-lag delta — same shape as S035 noted earlier. Live deploy and local engine generate DIFFERENT canned style strings for the same observations. The 'American Empire' string is the older default still in production; 'Spindle Gallery' is a newer canned-default pathway already in the dev branch. asSeen fields validate fine because they don't track style_context string. (8) M0 SPINDLE-SYNTHESIS FALSE-POSITIVE — spindle_back (conf 78) + spindle_gallery (conf 70) fire on a piece with NO spindles (wicker back has woven scroll panels). M0 spindle-synthesis pattern recurring (joins S001 / S021 / S024 / S027 / S033). spindle_gallery is also the source of the 'Spindle Gallery' style context default in the local harness output. (9) M0 lounge_chair_form + barrel_tub_back FPs — same shape as S038/S040/S042/S043. (10) Style attribution = null. Despite victorian_curlicue_wicker clue KEY containing 'victorian' token AND wt 0.64 description literally saying 'c. 1880-1900 American Victorian wicker era' — no style_family_victorian exists to receive the token. Same M5 stranded + canonical-vocabulary-gap pattern (n=14). (11) Phase 0 Part A: rocking_chair_form Tier 3 weight 0.92 fired POSITIVELY (FOURTH positive specimen after S040/S042/S043), parlor_rocker_form Tier 3 weight 0.92 fired POSITIVELY (THIRD positive specimen after S027/S042/S043). Both Phase 0 Part A clues fired correctly but form_loom won via the lloyd_loom_paper_fiber substring-match path. Confirms Phase 0 Part A clue weight ALONE is insufficient to defeat KEY-substring-match form routing. (12) Upholstery correctly split as post-1950 reupholstery via vinyl_cover + nailhead_trim. Net: M7→M6→M8 catastrophe chain for the SECOND TIME in the corpus — pattern n=2, ripe for the planned loom-fix scope-out. Key driver: lloyd_loom_paper_fiber NEGATION mode consumed as positive evidence for BOTH form selection (via KEY substring match → form_loom) AND date layer (via wood-layer 1920-1950 anchor). The clue's own description warns 'A piece otherwise styled or attributed pre-1917 cannot be Lloyd loom in original construction.' — yet the negation-mode emission ignores this self-guard.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "rocking_chair_form", confidence: 68, description: "Paired curved wooden rockers clearly visible attached to the leg bottoms in both side and joinery views; chair has full backrest and seating surface confirming rocking chair form." },
    { type: "form", clue: "parlor_rocker_form", confidence: 68, description: "Wicker construction with heavily ornate Victorian-era decorative back, scrolls, curlicues, fan motifs, and upholstered seat pad; lighter decorative carriage-style frame consistent with parlor rocker classification rather than heavy turned-spindle Windsor anatomy." },
    { type: "form", clue: "seating_surface", confidence: 68, description: "Upholstered seat pad visible on wicker seat frame; seat is roughly trapezoidal/rounded-rectangular in plan." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Large fan/barrel-shaped wicker backrest with ornate open-work decorative panel visible; backrest wraps around to form partial armrests on both sides." },
    { type: "style", clue: "victorian_curlicue_wicker", confidence: 52, description: "Extremely heavy Victorian curlicue ornament throughout: multiple spiral scroll clusters, fan/teardrop motifs, diamond lattice panels, and densely decorated back panel. This is a canonical Victorian wicker ornament style c. 1880–1900." },
    { type: "materials", clue: "woven_body", confidence: 84, description: "Close wicker weave forms the main body of the back, seat surround, and arm areas; tight over-under weave pattern visible throughout." },
    { type: "materials", clue: "rattan_frame", confidence: 84, description: "Larger-diameter rattan poles form the structural frame members including the back hoop, arm rails, leg posts, and decorative scroll elements; natural plant fiber with irregular tapered profile visible at scroll ends and frame intersections." },
    { type: "style", clue: "wicker_weave_close", confidence: 52, description: "Tight close weave with minimal gaps between strands on the main back body and arm areas; consistent with quality Victorian wicker production." },
    { type: "style", clue: "wicker_weave_open", confidence: 52, description: "Open decorative panels with diamond lattice and curlicue ornament visible in the back splat area and apron below seat; combination of close weave body with open ornamental panels is characteristic Victorian wicker." },
    { type: "construction", clue: "wire_wrapped_metal_joint", confidence: 60, description: "At frame intersections where rattan poles meet, tight wire or fiber wrapping is visible binding the joints; this is consistent with Victorian wicker-and-rattan hybrid construction where wire or fiber wraps secure structural junctions. Paint buildup obscures definitive identification of wire vs. fiber wrap." },
    { type: "condition", clue: "wicker_paint_buildup", confidence: 54, description: "Multiple layers of white paint visible throughout; paint has built up significantly on scroll elements, weave strands, and frame members, obscuring original finish, weave detail, and material identification. Paint is thick enough to partially fill gaps in the weave." },
    { type: "condition", clue: "refinished_surface", confidence: 45, description: "Evidence of multiple paint campaigns; current white paint appears to be a later overcoat over earlier paint layers. Paint buildup is inconsistent with a single original finish application." },
    { type: "upholstery", clue: "no_spring_seat", confidence: 45, description: "Seat pad appears to be a thin stuffed pad without spring lift; the pad sits directly on the wicker seat frame with no evidence of coil or serpentine spring construction beneath." },
    { type: "upholstery", clue: "vinyl_cover", confidence: 45, description: "Seat cover appears to be a pale cream/off-white material with a smooth surface; the cracking and peeling pattern visible on the seat surface is more consistent with vinyl or faux leather than woven fabric. Decorative tack heads visible around the perimeter. Could also be a heavily painted or aged fabric — confidence moderate." },
    { type: "upholstery", clue: "nailhead_trim", confidence: 50, description: "Row of decorative tack/nailhead heads visible around the perimeter of the seat pad, evenly spaced; consistent with decorative upholstery tack trim securing the seat cover to the wicker seat frame." },
    { type: "condition", clue: "wicker_strand_breakage", confidence: 54, description: "No obvious broken or missing wicker strands visible in the photos; the wicker body appears structurally intact despite paint buildup and age." },
    { type: "style", clue: "bar_harbor_style_wicker", confidence: 52, description: "This piece does NOT exhibit Bar Harbor style characteristics; it is the opposite — heavily ornamented with curlicues, scrolls, and dense decoration rather than the open airy geometric forms of Bar Harbor c. 1900–1920." },
    { type: "materials", clue: "lloyd_loom_paper_fiber", confidence: 80, description: "Strands visible at scroll ends and frame edges appear to be natural rattan/reed with irregular tapered plant-fiber profile rather than uniform extruded paper strands on wire cores characteristic of Lloyd loom construction (post-1917). The irregular organic taper of the scroll elements is inconsistent with paper fiber." },
    { type: "structure", clue: "round_tenon", confidence: 55, description: "Rattan leg posts appear to insert into the wooden rocker rails via round socket/tenon joinery; this is the standard construction method for attaching wicker chair legs to wooden rocker bases." },
    { type: "style", clue: "scrolled_side_corbels", confidence: 52, description: "Multiple spiral scroll clusters visible on the back panel, side panels, and apron below the seat; these decorative scroll/curlicue elements are a canonical Victorian wicker ornament feature c. 1875–1900." },
    { type: "construction", clue: "wicker_weave_basket", confidence: 92, description: "Diamond lattice basket-weave pattern visible in the open decorative panels of the back splat and apron; alternating over-under weave in diagonal orientation." },
    { type: "condition", clue: "painted_metal_finish", confidence: 54, description: "The white finish is paint applied over wicker/rattan, not a metal frame. No metal frame members are visible; the structural members are rattan poles and wooden rockers." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Curved wooden rocker rails visible at the base of the chair; these appear to be solid wood (likely hardwood) painted white, consistent with standard Victorian wicker rocker construction." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "The wicker back wraps continuously around to form armrests on both sides, creating an armchair/barrel-back form; armrests are integral to the woven back structure." },
    { type: "style", clue: "mid_century_streamlined_wicker", confidence: 52, description: "This piece does NOT exhibit mid-century streamlined wicker characteristics; the heavy Victorian ornament, curlicues, and dense decoration are inconsistent with the lighter simpler forms of mid-century wicker c. 1945–1970." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstered seat" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "structure", clue: "spindle_back", confidence: 78, description: "Spindles are visible in the back or side rail." },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
    { type: "form", clue: "lounge_chair_form", confidence: 78, description: "Posture-based lounge-chair identity (deeper seat, lower seat height, more reclined back) — distinct from arm-based armchair form. Canonical: form_lounge_chair." },
    { type: "structure", clue: "barrel_tub_back", confidence: 76, description: "Textual barrel/tub/cylindrical back vocabulary on a seating form indicates barrel-back construction." },
  ],
  asSeen: {
    formId: "Rocking chair",
    display: "Rocking chair",
    finalStyleKind: "context_only",
    dateRange: "c. 1920–1930",
    dateFloor: 1920,
    dateCeiling: 1930,
    confidence: "Low",
  },
};

const victorian_renaissance_revival_oak_library_table_lion_brackets_contrast_case: ScanFixture = {
  label: "victorian_renaissance_revival_oak_library_table_lion_brackets_contrast_case",
  note: "CONTRAST CASE — END-TO-END SUCCESS. Victorian Renaissance Revival / high-Victorian transitional LIBRARY TABLE (c. 1885-1905 American factory production), solid oak top + lower shelf, four spool/bobbin-turned legs terminating in CAST METAL claw-and-ball feet, cast lion-head shelf brackets at each leg mid-height, lion-mask drawer pull on single apron drawer, egg-and-dart top molding, acanthus carved corbels at leg-to-apron junctions, scalloped apron. Reported as 'Rococo Revival / Naturalistic Victorian Library table, c. 1890-1910, Moderate, original_period kind.' Every layer worked: form_library_table correctly chosen (library_table_form [style] @ 0.37 lost individual weight but the form clue won via flat_surface + open_shelving + drawer_present + apron_construction + cast_metal_components context); Rococo Revival / Naturalistic Victorian attribution conf 0.92 from matched_terms=['rococo','revival','victorian'] (M11 mixed-source path — 'revival' is clue-key-sourced from renaissance_revival_style, 'rococo' + 'victorian' are prose-only; the family attributed is rococo_revival via shared 'revival' token); convergence zone 1890-1910 (3 layers: finish + style + style_wave); kind=original_period correctly (final dating 1890-1910 within 1845-1914 family bounds). Alternative attribution Renaissance Revival conf 0.92 also fires — both are correct readings of this transitional piece, engine even notes 'Rococo Revival and Renaissance Revival vocabularies both present — consistent with mid-Victorian transitional production c. 1860-1875' in supporting_context. Joins S013/S014/S021/S025/S028/S029/S030/S033/S040 as 10th must-not-regress CONTRAST CASE specimen. Notable diagnostic findings (none catastrophic — all calibration tracking): (1) M11 MIXED-SOURCE attribution — 3 matched_terms but only 'revival' is clue-key-sourced. Useful calibration: even prose-only tokens producing CORRECT outcomes must be preserved by any M11 fix. Joins S021/S025/S028/S030/S033/S041 as defensible-outcome targets. Plus the Renaissance Revival alternative attribution is FULLY clue-key-sourced ('renaissance' + 'revival' both in renaissance_revival_style KEY) — joining S029/S033/S043 as the 4th clean clue-key-sourced specimen in the corpus. (2) M6 writing_surface FALSE-POSITIVE recurrence (joins S044 as 2nd specimen) — fires conf 84 wt 0.94 [function] with description literally 'consistent with a desk, secretary, or writing table'. On a library table where writing IS a real function this is borderline but still semantic-too-broad. Did NOT disrupt form selection (form_writing_desk not in alts; form_library_table correctly chosen). CLUE_LIBRARY semantic-too-broad pattern at n=2 (S044 marble-top pedestal stand + S046 library table). Promotion bar approaches. (3) NEW M6 specimen — barley_twist clue KEY fires at conf 52 wt 0.70 [style] with description literally 'pronounced spool/bobbin turning... sometimes called barley-twist variant.' But spool/bobbin turning is NOT barley twist (barley twist = spiral helical twist; spool turning = stacked rings). KEY-vs-content mismatch (cf. S015 multiple_drawer_case KEY vs 'not a chest' content, S044 tripod_base KEY vs quadripod content). The LLM acknowledged the mismatch ('sometimes called barley-twist variant') but still emitted under the barley_twist KEY. Tracking. (4) Wave detector over-fires (style_waves = 4, two unparseable '?'). Secondary convergence zone 1920-1925 from style_wave only — wave detector emitted a 1920-1965 wave on a piece with no 20th-century Revival production. Same noisy-wave-detector pattern noted in S014. Primary convergence 1890-1910 correctly dominated, so harmless here. (5) M5 partial — most style cues at @ 0.37 (egg_and_dart_molding, acanthus_carving, lion_head_carved_brackets, scalloped_apron, library_table_form) but renaissance_revival_style still contributed to attribution because its KEY contains 'revival' token. Mixed result: the prose-only style cues contributed 0 individually but the one clue-key-sourced clue carried the day. (6) NEW VARIANT — claw_foot HARDWARE clue fires at conf 62 wt 0.48 [hardware] on CAST METAL claw-and-ball feet (not carved wood). The description correctly identifies cast metal but the clue routes hardware-undated. Should this be routed as a Renaissance Revival hardware marker contributing 1860-1900 dating? lion_mask_pull same shape — wt 0.48 [hardware] but contributes 0 to hardware layer dating. Both are STRONG Renaissance Revival hardware vocabulary in their descriptions but neither contributes a hardware-layer date floor or ceiling. (7) form_writing_desk NOT in alternatives list (Parlor table, Jacobean Revival cabinet/sideboard, Bookcase/open shelving unit) — odd because the writing_surface clue would normally pull form_writing_desk into the alts. (8) label_remnant condition obs fires at conf 45 — small adhesive sticker visible on top, no text. NOT a M13/M9 issue because no firm name was extracted. (9) Resale valuation $100-$257 standard marketplace is notably lower than the actual market for nicely-figured Renaissance Revival library tables with cast metal hardware — likely conservative due to surface wear flagged. Net: this is the cleanest end-to-end run of a Victorian Revival piece in the corpus to date. Form / style / date / kind all correct, M11 mixed-source path producing defensible outcomes, transitional-style supporting_context note adds appraiser-voice nuance, the engine even surfaces that Rococo AND Renaissance Revival vocabularies are both present (correct expert read). Strong calibration target for any future M11 fix.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "flat_surface", confidence: 68, description: "Rectangular flat top surface present, suitable for display or writing; top is solid wood with visible grain." },
    { type: "form", clue: "open_shelving", confidence: 68, description: "A lower solid-board shelf tier is present between the four legs, supported at the leg midpoints by cast lion-head brackets." },
    { type: "form", clue: "drawer_present", confidence: 68, description: "A single shallow drawer is visible centered in the apron on the end face of the table, fitted with a carved lion-mask pull." },
    { type: "style", clue: "barley_twist", confidence: 52, description: "All four legs exhibit pronounced spool/bobbin turning — a continuous series of rounded disc-like turnings stacked along the full leg shaft, characteristic of Victorian-era spool or bobbin turning (sometimes called barley-twist variant). The turning is very regular and machine-lathe consistent." },
    { type: "style", clue: "egg_and_dart_molding", confidence: 52, description: "The top edge of the table is bordered on all four sides by a continuous egg-and-dart (or egg-and-tongue) carved molding, a classical ornamental motif strongly associated with Renaissance Revival and high Victorian furniture c. 1860–1900." },
    { type: "style", clue: "acanthus_carving", confidence: 52, description: "Acanthus leaf carved corbels are present at the top of each leg where it meets the apron, with scrolled volutes. This is a Renaissance Revival / Victorian decorative vocabulary element." },
    { type: "style", clue: "lion_head_carved_brackets", confidence: 52, description: "Cast or carved lion-head figural brackets connect the lower shelf to the leg shafts at mid-height on all four legs. The lion heads are highly detailed with open mouths and mane detail, consistent with Renaissance Revival / Victorian figural ornament c. 1860–1900." },
    { type: "hardware", clue: "claw_foot", confidence: 62, description: "All four legs terminate in cast metal (likely cast iron or cast brass/bronze) claw-and-ball feet with detailed individual toe/talon modeling. The feet appear to be separate cast metal components attached to the turned wooden leg shaft. This is a strong Victorian Renaissance Revival / Rococo Revival hardware signal c. 1860–1900." },
    { type: "style", clue: "scalloped_apron", confidence: 52, description: "The apron beneath the top features a scalloped or cusped lower edge on the long sides, a decorative Victorian motif consistent with Renaissance Revival and Eastlake-adjacent ornament." },
    { type: "hardware", clue: "lion_mask_pull", confidence: 62, description: "The single drawer is fitted with a carved or cast lion-mask (lion-head) pull centered on the drawer face. Lion-mask hardware is strongly associated with Renaissance Revival furniture c. 1860–1900." },
    { type: "materials", clue: "solid_wood_construction", confidence: 45, description: "The tabletop shows open-pored, coarse-grained wood with visible ray fleck and strong annual ring contrast consistent with flat-sawn or quarter-sawn oak. The grain pattern and pore structure are consistent with oak (ring-porous hardwood). The top appears to be solid wood, not veneered." },
    { type: "materials", clue: "wood_species_oak", confidence: 45, description: "The tabletop grain shows large open pores, strong annual ring contrast, and visible ray structure consistent with oak. The warm brown color with darker oxidation in the grain channels is consistent with aged oak. The lower shelf also appears to be oak. Species identification is provisional from photos." },
    { type: "style", clue: "renaissance_revival_style", confidence: 52, description: "The combination of egg-and-dart top molding, acanthus leaf corbels, lion-head figural brackets, lion-mask drawer pull, spool-turned legs, claw feet, and scalloped apron collectively constitute a strong Renaissance Revival / high Victorian ornamental vocabulary, consistent with American production c. 1865–1900." },
    { type: "construction", clue: "turned_legs", confidence: 96, description: "Four legs are fully turned on a lathe with a spool/bobbin profile running the full length of the upper shaft, transitioning to a baluster form at the lower section above the claw foot. Turning is machine-lathe consistent — uniform, repeating disc profiles." },
    { type: "construction", clue: "cast_metal_components", confidence: 90, description: "The claw-and-ball feet and the lion-head shelf brackets appear to be cast metal (cast iron or cast bronze/brass) components attached to the wooden leg structure. The level of detail and material contrast with the wood is consistent with cast metal rather than carved wood." },
    { type: "condition", clue: "surface_wear", confidence: 54, description: "The tabletop shows multiple surface scratches, scuff marks, and a small rectangular label remnant or adhesive patch near the center. The finish is worn and dull in high-contact areas. The leg finish shows significant wear and darkening consistent with age and use." },
    { type: "condition", clue: "shellac_intact", confidence: 45, description: "The surface has a warm amber-brown tone with dull sheen consistent with aged shellac or early varnish. No thick plastic-like polyurethane film is visible. The finish appears to have thinned and worn naturally at high-contact points rather than peeling or crazing uniformly, suggesting an original or early oil/shellac/varnish finish rather than a modern synthetic coating." },
    { type: "condition", clue: "age_patina", confidence: 54, description: "The wood surfaces show darkening in grain channels, oxidation-consistent color depth, and wear patterns at leg bases and contact points consistent with extended age and use. The cast metal feet show darkening and surface oxidation consistent with age." },
    { type: "construction", clue: "lower_shelf_board", confidence: 45, description: "The lower shelf appears to be a solid wood plank (likely oak matching the top) supported by the lion-head cast brackets at each leg. The shelf shows a visible board join line suggesting two boards edge-glued or butted together." },
    { type: "style", clue: "library_table_form", confidence: 52, description: "The overall form — rectangular top, single drawer in apron, lower shelf tier, four ornate turned legs — is consistent with a Victorian library table or parlor table form, common in American Renaissance Revival production c. 1865–1900." },
    { type: "construction", clue: "apron_construction", confidence: 88, description: "The apron is a solid wood member with a decoratively cut scalloped lower profile on the long sides. The apron connects the leg tops and supports the tabletop. Acanthus corbels are applied or carved at the leg-to-apron junction." },
    { type: "condition", clue: "label_remnant", confidence: 45, description: "A small rectangular paper or adhesive label remnant is visible near the center of the tabletop surface. No text is legible from this image. This may be a price tag, inventory sticker, or old paper label." },
    { type: "construction", clue: "leg_to_foot_junction", confidence: 45, description: "The close-up of the leg base shows the turned wooden leg shaft transitioning to a cast metal claw-and-ball foot. The junction appears to be a mechanical attachment (likely threaded rod or dowel into the leg base) rather than a carved continuation of the wood. This is consistent with Victorian-era production practice of using cast metal feet on wooden furniture." },
    { type: "function", clue: "writing_surface", confidence: 84, description: "A writing or work surface is visible." },
  ],
  asSeen: {
    formId: "Library table",
    display: "Rococo Revival / Naturalistic Victorian Library table (also commonly called: study table, reading table)",
    finalStyleKind: "original_period",
    dateRange: "c. 1890–1910",
    dateFloor: 1890,
    dateCeiling: 1910,
    confidence: "Moderate",
  },
};

const pedestal_mounted_glass_display_case_curio_vitrine_oak_revival: ScanFixture = {
  label: "pedestal_mounted_glass_display_case_curio_vitrine_oak_revival",
  note: "PEDESTAL-MOUNTED GLASS DISPLAY CASE / VITRINE / TABLETOP SHOWCASE on reeded turned column + 4-leg cross base, oak frame-and-panel construction with glass on all 4 sides + top, shellac finish, slotted/Phillips screws. Likely 20th-century c. 1900-1970 production (slotted/Phillips screws + simple oak frame-and-panel + shellac construction don't pin tightly within that window). Reported as 'Colonial Revival Curio cabinet, c. 1890-1920, Moderate, original_period kind.' Form correct, style correct via clean clue-key-sourced M11, date in fix#1 catch-all shape. Multiple diagnostic findings: (1) PHASE 0 PART A REGRESSION VARIANT — china_cabinet_form Tier 3 clue fired at conf 68 [form] with description literally identifying 'tabletop or pedestal vitrine/showcase rather than a floor-standing china cabinet, but the glazed-display-case form is clearly present.' Phase 0 Part A dictionary routing for china_cabinet_form points to form_china_cabinet — but engine chose form_curio_cabinet instead. form_china_cabinet NOT IN ALTERNATIVES LIST (alts: Showcase, Pedestal stand). china_cabinet_form Phase 0 Part A clue's CLUE_LIBRARY weight contributed but CLUE_ROUTING dictionary consumption is rolled back so the Tier 3 dictionary route to form_china_cabinet didn't fire. Joins S027 (rocking_chair_form + parlor_rocker_form Tier 3 fires but form_windsor_chair wins) + S045 (rocking_chair_form + parlor_rocker_form Tier 3 fires but form_loom wins) as third Phase-0-Part-A-Tier-3-positive-but-not-selected specimen. Confirms Step 6 consumption retry is still needed. Caveat: form_curio_cabinet IS a defensible alternative to form_china_cabinet for this piece (small tabletop vitrine vs floor-standing china cabinet), so the misroute here is less catastrophic than S027/S045. (2) M11 CLEAN CLUE-KEY-SOURCED ATTRIBUTION (FIFTH CLEAN SPECIMEN) — Colonial Revival attributed conf 0.70 from matched_terms=['colonial','revival']. Both tokens are in colonial_revival_style_cues clue KEY. Clean clue-key-sourced path producing CORRECT outcome. Joins S029 eastlake_hardware + S033 aesthetic_movement_style + S043 empire_revival_style + S046 renaissance_revival_style as the FIFTH clean clue-key-sourced specimen in the corpus. Strong must-not-regress signal for the M11 fix design's preserve-me side. (3) fix#1 c. 1890-1920 CATCH-ALL SHAPE (now n=8 with this and S044) — frame_floor=1890 ceil=1920. The two convergence zones are (a) 1850-1940 (4 layers: joinery, fastener, finish, style) and (b) 1990-1990 (3 layers: joinery, style, style_wave). NEITHER convergence zone equals 1890-1920. The c. 1890-1920 frame range is a SEPARATE narrowing — not derived from the convergence math. Same fix#1 catch-all shape as S044, with TWO convergence zones in evidence this time (one wide 90-year, one degenerate single-year 1990-1990). The 1990-1990 zone is the SAME degenerate-single-year shape noted in S036 (1940-1940), driven here by the style_wave detector emitting an unparseable '?' wave that defaulted to 1990. fix#1 catch-all-post-Phase-0-deploy now n=2 (S044, S047). (4) DEGENERATE SINGLE-YEAR ZONE recurrence (n=2 with S036) — convergence zone 1990-1990 (3 layers) is a single-point zone with floor=ceiling=1990. Same shape as S036 1940-1940 zone driven by slotted_screw ceiling intersecting style floor. Here driven by unparseable '?' style_wave defaulted to 1990. Promotion bar approaches. (5) american_empire_style KEY-vs-CONTENT MISMATCH (joins S016) — fires at conf 52 [style] with description literally 'consistent with Colonial Revival or late Victorian pedestal base styling.' NO American Empire content in the description; the KEY name is wrong for the observation. Same pattern as S016 (american_empire_style on a wrought-iron tripod stand). The 'american_empire' KEY appears to be a catch-all label the LLM reaches for when describing scrolled cross-base feet. Tracking: n=2 of american_empire_style applied to NON-Empire pieces. (6) M5 stranded × multiple — colonial_revival_style_cues description carries 'c. 1890-1930' window but bucketed [style] @ 0.37; turned_column_pedestal description carries 'late Victorian or Colonial Revival turned pedestal forms'; american_empire_style mismatch noted above. The clue-key-sourced colonial_revival path still drove attribution correctly via family bounds 1876-null. (7) M6 glass_top materials clue fires at conf 50 wt 0.42 [materials] with description 'glass panels set in wood frame' — but this is GLAZING of a display case, not a glass-top table material. Borderline FP. Did not drive form selection (lowest materials weight). Same M6 metal/glass FP pattern as S009/S015 (brass-frame, glass-top on non-table objects). (8) WAVE DETECTOR over-fires — 1 style_wave detected at unparseable '?' range, defaulted to 1990. Joins S046 (4 waves with 2 unparseable) + S014 (12 waves) as recurring wave-detector noise. Harmless here (1990-1990 zone ignored by P2) but spawns the degenerate-zone phenomenon. (9) Date is suspicious — c. 1890-1920 with Moderate confidence is too narrow / too confident for a piece with mixed slotted/Phillips screws (Phillips post-1933), modern frame-and-panel construction, and no period-specific construction details visible. True production could be anywhere c. 1900-1970. Engine is being overly confident via fix#1 catch-all shape. (10) Form alts list (Showcase, Pedestal stand) — 'Pedestal stand' alt is the same form-name-as-style-context shape noted in S044. (11) M0 NEGATIVE control good — no seating_surface synthesis, no spindle_back/spindle_gallery synthesis, no lounge_chair FP, no fully_upholstered FP. Clean piece for non-seating M0 testing. Net: form mostly correct (Phase 0 Part A Tier 3 partial regression — china→curio is defensible), style cleanly correct via 5th clue-key-sourced M11 specimen, date in fix#1 catch-all shape (n=2 post-deploy), american_empire_style KEY-vs-content mismatch n=2.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "china_cabinet_form", confidence: 68, description: "Glazed display case with glass top and glass sides on all four faces, designed to display objects inside; mounted on a pedestal stand. Functions as a tabletop or pedestal vitrine/showcase rather than a floor-standing china cabinet, but the glazed-display-case form is clearly present." },
    { type: "form", clue: "pedestal_column", confidence: 68, description: "Single turned central pedestal column supporting the glazed display case box above; column is reeded/fluted with a vase-form turning and terminates in a four-leg cross base." },
    { type: "structure", clue: "flat_surface", confidence: 82, description: "Interior floor of the display case is a flat wooden panel visible through the glass sides; serves as the display surface for objects placed inside." },
    { type: "function", clue: "display", confidence: 70, description: "All four sides and the top of the case are glazed, clearly designed for displaying objects inside while protecting them under glass. Form is consistent with a jewelry showcase, curio display stand, or museum-style pedestal vitrine." },
    { type: "structure", clue: "frame_and_panel_sides", confidence: 82, description: "The display case box is constructed with a wood frame (rails and stiles) holding glass panels in each of the four sides and the top; classic frame-and-panel construction adapted for glazed display." },
    { type: "materials", clue: "solid_wood_construction", confidence: 80, description: "Frame members of the display case and the pedestal column and base all appear to be solid wood construction; no visible veneer or plywood substrate at exposed edges." },
    { type: "materials", clue: "wood_species_oak_group", confidence: 45, description: "The wood grain visible on the interior floor panel and frame members shows open ring-porous grain pattern consistent with oak; the flat-sawn cathedral grain and coarse texture are characteristic of oak. Possibly quarter-sawn on some frame members given the ray fleck visible in the overhead shot." },
    { type: "style", clue: "turned_column_pedestal", confidence: 52, description: "The central support column is a turned wood pedestal with reeded/fluted surface decoration, a vase-form profile with a compressed ball element near the base, consistent with late Victorian or Colonial Revival turned pedestal forms." },
    { type: "structure", clue: "quadruped_cross_base", confidence: 82, description: "The pedestal terminates in a four-leg cross base with four outswept legs; each leg has a scrolled or ogee-curved profile at the outer end and a molded/chamfered top surface. The legs are arranged in a cross/plus pattern." },
    { type: "style", clue: "american_empire_style", confidence: 52, description: "The four base legs terminate in scrolled or ogee-curved ends with a slight upward curl, consistent with Colonial Revival or late Victorian pedestal base styling." },
    { type: "construction", clue: "slotted_screw", confidence: 60, description: "Visible screw heads at the case frame corners (visible in overhead shot) appear to be slotted or Phillips screws used to secure the frame assembly; at least two screw heads are visible at the case perimeter." },
    { type: "construction", clue: "reeded_column_turning", confidence: 93, description: "The pedestal column shows fine parallel reeding (vertical grooves) along its length, a decorative turning technique consistent with Federal Revival, Colonial Revival, and late Victorian pedestal forms. The reeding is clearly visible in the base closeup." },
    { type: "materials", clue: "flat_sawn_oak_grain", confidence: 75, description: "The interior floor panel of the display case shows broad flat-sawn cathedral grain pattern consistent with flat-sawn oak; visible through the glass top in the overhead image." },
    { type: "condition", clue: "shellac_intact", confidence: 50, description: "The wood surfaces show a warm amber-brown tone with moderate sheen consistent with an intact or lightly refreshed shellac or varnish finish; no obvious polyurethane plastic film visible. Finish appears aged and somewhat darkened with use." },
    { type: "condition", clue: "general_wear", confidence: 54, description: "Dust accumulation visible on interior floor of display case; minor surface scratches and darkening on frame members; base feet show wear and slight finish loss consistent with age and use." },
    { type: "style", clue: "colonial_revival_style_cues", confidence: 52, description: "The combination of reeded turned pedestal column, scrolled quadruped cross base, and oak construction with warm brown finish is consistent with Colonial Revival or late Victorian/Golden Oak era production, approximately 1890–1930." },
    { type: "form", clue: "glass_top_panel", confidence: 68, description: "The top of the display case has a glass panel set into the wood frame, allowing viewing of displayed objects from above as well as from the sides." },
    { type: "form", clue: "four_sided_glazing", confidence: 68, description: "All four vertical sides of the display case box are glazed with flat glass panels set in wood frames, providing 360-degree visibility into the case interior." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 45, description: "The cross base legs appear to join the central column block via mortise-and-tenon or similar structural joinery; the tight fit and clean intersection at the column base suggest traditional joinery rather than simple butt joints, though this cannot be confirmed without disassembly." },
    { type: "materials", clue: "flat_glass_panels", confidence: 45, description: "The glazing in all four sides and the top appears to be flat plate glass; no curved or bent glass visible. Glass appears clear with minor age-related haziness." },
    { type: "materials", clue: "glass_top", confidence: 50, description: "glass panels set in wood frame" },
  ],
  asSeen: {
    formId: "Curio cabinet",
    display: "Colonial Revival Curio cabinet (also commonly called: curio, curio cabinet)",
    finalStyleKind: "original_period",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

const colonial_revival_edwardian_mahogany_china_cabinet_secretary_desk_two_piece_set_misid_reception_desk: ScanFixture = {
  label: "colonial_revival_edwardian_mahogany_china_cabinet_secretary_desk_two_piece_set_misid_reception_desk",
  note: "TWO-PIECE MATCHING SET in a SINGLE image: (LEFT) bow-front bent-glass mahogany CHINA CABINET with 4 curved interior shelves, (RIGHT) drop-front SECRETARY DESK with marquetry-inlay panel + 3 serpentine drawers + carved apron + cast brass lion-mask bail pulls + ogee bracket feet. Matching pair, American Colonial Revival / Edwardian production c. 1900-1925. Engine reported as 'Hollywood Regency / Neoclassical Glamour Adaptation Reception desk, Broadly late 19th to 20th century (c. 1900-2000), Low frame conf, HIGH confidence cap.' Catastrophic identification — wrong form + wrong style + wrong date + wrong period — and the engine doesn't recognize there are TWO pieces. Multiple stacked failures: (1) M0 UNDER-PERCEPTION OF MULTI-PIECE SETS (NEW sub-pattern, n=1) — the LLM correctly OBSERVED both pieces ('Left piece is a tall glazed display cabinet... Right piece has a vertical front panel... drop-front secretary desk form... two_piece_set_matching: China cabinet and secretary desk appear to be a matching set') but combined ALL 37 observations into a SINGLE analysis as if there were one piece. Distinct from S037 under-perception (asymmetric two-PART form where one half was missed) — here there are TWO SEPARATE PIECES merged into one identity. NEW M0 sub-pattern: 'TWO SEPARATE PIECES IN ONE IMAGE TREATED AS ONE PIECE.' P0 perception detected the duality (two_piece_set_matching clue fires verbatim) but the engine's single-form pipeline can't represent two pieces. (2) M8 CATASTROPHIC FORM SELECTION — form_reception_desk chosen. Reception desks are counter-style commercial/institutional pieces with public-facing greeting counters. This is a Colonial Revival parlor china cabinet + secretary desk matching set with NO counter, NO commercial use, NO greeting function. The alts list (China cabinet, Secretary desk / drop-front desk, Secretary desk / writing desk) shows the THREE correct candidate forms — engine considered them and chose form_reception_desk over all of them. The trigger for form_reception_desk selection is unclear from the trace — drop_front_desk wt 0.98 + writing_surface wt 0.91 + multiple_drawer_case wt 0.88 + china_cabinet_form wt 0.92 + cabinet_form wt 0.81 should have produced a much more conventional form. No clue in the trace specifically points to reception_desk. Possible substring-match path through 'reception' in some clue description, or a default form-routing rule we haven't surfaced. (3) M11 PROSE-ONLY DOUBLE-TOKEN conf 1.00 (SECOND conf 1.00 in corpus, after S041) — Federal / Adam / Hepplewhite / Sheraton attributed conf 1.00 from matched_terms=['federal','hepplewhite']. Both tokens scraped from style description prose ('Federal Revival / Edwardian decorative detail', 'Hepplewhite-influenced Colonial Revival', 'Federal Revival / Colonial Revival decorative vocabulary'). NO clue KEY contains either token. Pure prose-only path produces conf 1.00 — same uncapped-prose-confidence issue as S041. Confirms no upper cap on prose-only attribution confidence. Colonial Revival alternative conf 0.92 fires alongside (also prose-only since no colonial_revival_style_cues clue KEY in this trace). The Colonial Revival alt would have been the correct attribution. (4) REVIVAL-WAVE LATE-PULL — final_style_label 'Hollywood Regency / Neoclassical Glamour Adaptation' (c. 1930-1970 wave) selected via revival_wave kind. 5 style_waves detected: 1876-1910, 1876-1900 (BOTH correct for the actual production), 1930-1970 (Hollywood Regency), 1970-2000, '?'. Engine SKIPPED both Colonial Revival waves (1876-1910 + 1876-1900) and anchored to Hollywood Regency 1930-1970 — same wave-skipping shape as S015 (Regency Gothic skipped, Gothic Revival wave anchored), S018 (Garrard 1952-58 skipped, 1970s Deco Revival anchored). M11 late-revival-wave-anchoring pattern continues. (5) REVIVAL-WAVE CONTAINMENT-CHECK ERROR (S016 sibling, n=3 with S043) — final_style_reason: 'Final dating (c. 1900-2000) aligns with the Hollywood Regency / Neoclassical Glamour Adaptation (c. 1930-1970) wave.' But 1900-2000 doesn't FALL WITHIN 1930-1970 — only partially OVERLAPS (1930-1970 sits inside 1900-2000). Same shape as S016 'c. 1925-1975 falls within 1895-1930' and S043 '1900-2000 aligns with 1890-1935'. fix #8b candidate at n=3. (6) P2 OVERRODE CONVERGENCE ZONE (n=3 with S011/S016) — Convergence zones (1): 1780-1920 (5 layers: wood, hardware, style, finish, style_wave). This is actually a reasonable 140-year zone bracketed by hardware floor 1750 + thick_veneer wood pre-1910 + style 1780-1840 + finish 1800-1920 + style_wave 1876-2000. P2 IGNORED this convergence zone and produced frame_floor=1900 frame_ceiling=2000 — a 100-year window. The 1920 ceiling that's in the convergence zone disappeared; the floor 1900 doesn't come from any layer. Joins S011 (disjoint-from-envelope) and S016 (overrode 1895-1930 → 1925-1975) as the THIRD P2-overrode-convergence specimen. (7) HIGH CONFIDENCE CAP on 100-YEAR DATE RANGE — Confidence cap shows High (85%) even though the date range is c. 1900-2000 (100 years wide) and frame_confidence=Low. The user-visible 'HIGH' confidence claim is misleading when the date range is 100 years. UX decoupling between confidence cap and date precision. (8) PHASE 0 PART A REGRESSION VARIANT — china_cabinet_form Tier 3 fired at conf 68 wt 0.92 [form] — but form_reception_desk won. form_china_cabinet IS in alternatives_considered as alt #1, so the route was considered and rejected. Fourth Phase-0-Part-A-positive-but-not-selected specimen (after S027 rocking_chair_form, S045 rocking_chair+parlor_rocker, S047 china_cabinet_form). china_cabinet_form Phase 0 Part A clue fires correctly but can't win form selection until Step 6 wiring resumes. (9) M5 STRANDED × 10+ — at least 10 style clues at @ 0.37 contributing 0 to dating (cut_grain_phenomenon_flame_figure, ribbon_stripe, marquetry_inlay_decoration, string_inlay_border, serpentine_drawer_fronts, carved_apron, bent_glass_curved_door, reeded_cornice_molding, ogee_bracket_feet, two_piece_set_matching). Many carry explicit 'c. 1890-1920' / 'c. 1890-1925' / 'c. 1890-1930' dating prose. Record-high M5 stranded count on a single scan. (10) VALUATION COMPRESSION — Resale Standard Marketplace $93-$238 for what should be $600-1500+ as a matched Colonial Revival mahogany pair. Form misclassification cascades into severely undervalued valuation. (11) drop_front_desk fires CORRECTLY here (genuine drop-front secretary) at conf 68 wt 0.98 — contrast with S039 Sligh console table where drop_front_desk was an M6 false-positive. Same clue, opposite outcomes depending on actual structure visible. (12) Final reconciliation reason language: 'Final dating (c. 1900-2000) aligns with the Hollywood Regency / Neoclassical Glamour Adaptation (c. 1930-1970) wave' — 'aligns with' should be 'partially overlaps' per fix #5 wording fix (which was shipped). Either fix #5 wording fix didn't cover revival_wave reason path, or this is a different reason template. Tracking. Net: this is one of the most catastrophic identifications in the corpus — form catastrophically wrong (reception desk on a parlor matched set), style catastrophically wrong (Hollywood Regency on Colonial Revival), date span absurd (100 years with High confidence cap), valuation badly low. Root: M0 perception merging two pieces into one analysis + M11 prose-only conf 1.00 + revival-wave late-pull + P2 overriding the legit 5-layer convergence zone. The corpus needed a multi-piece scan specimen and this is a strong one.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "china_cabinet_form", confidence: 68, description: "Left piece is a tall glazed display cabinet with curved/bent glass door, interior shelves visible through open door, mahogany case — classic china cabinet / vitrine form." },
    { type: "form", clue: "drop_front_desk", confidence: 68, description: "Right piece has a vertical front panel that hinges down to a horizontal writing surface, supported by brass quadrant stays — classic drop-front secretary desk form." },
    { type: "form", clue: "pigeonholes", confidence: 68, description: "Interior of the drop-front desk reveals multiple arched pigeonhole compartments / letter slots above a small central drawer, visible when the drop front is open." },
    { type: "form", clue: "multiple_drawer_case", confidence: 68, description: "Three graduated serpentine-front drawers below the drop-front writing section on the secretary desk." },
    { type: "function", clue: "writing_surface", confidence: 70, description: "Drop-front panel opens to a flat horizontal writing surface; scratches and wear visible on the surface consistent with use as a writing desk." },
    { type: "function", clue: "open_shelving", confidence: 70, description: "China cabinet interior shows four curved shelves visible through the open bent-glass door." },
    { type: "materials", clue: "solid_wood_construction", confidence: 80, description: "Case members, cornice, legs, and apron appear to be solid mahogany; interior secondary wood (lighter tone) visible in pigeonhole compartments." },
    { type: "materials", clue: "thick_veneer", confidence: 45, description: "Flame mahogany veneer visible on drawer fronts and drop-front face shows dramatic ribbon/flame figure consistent with plain-sliced or book-matched mahogany veneer; appears to be substantial veneer over a secondary substrate." },
    { type: "style", clue: "cut_grain_phenomenon_flame_figure", confidence: 52, description: "Drawer fronts and drop-front panel display dramatic flame/ribbon figure in mahogany veneer — characteristic of Colonial Revival / Edwardian mahogany case goods." },
    { type: "style", clue: "cut_grain_phenomenon_ribbon_stripe", confidence: 52, description: "Ribbon stripe figure visible in the mahogany veneer on drawer fronts, consistent with plain-sliced or quarter-sliced mahogany." },
    { type: "style", clue: "marquetry_inlay_decoration", confidence: 52, description: "Drop-front face features elaborate marquetry / painted inlay decoration: scrolling acanthus foliage, floral bouquet with red flower, and string-line border in gold/yellow tones on dark mahogany ground — Edwardian / Colonial Revival decorative vocabulary." },
    { type: "style", clue: "string_inlay_border", confidence: 52, description: "Rectangular string inlay border (light-colored stringing) frames the marquetry panel on the drop-front face — characteristic Federal Revival / Edwardian decorative detail." },
    { type: "style", clue: "serpentine_drawer_fronts", confidence: 52, description: "All three drawers below the writing section have serpentine / bow-front profiles — characteristic of Hepplewhite-influenced Colonial Revival case furniture." },
    { type: "style", clue: "carved_apron", confidence: 52, description: "Lower apron of the secretary desk features carved scrollwork / rocaille ornament — decorative carving consistent with Colonial Revival or Edwardian production." },
    { type: "style", clue: "bent_glass_curved_door", confidence: 52, description: "China cabinet has a single curved/bent glass door forming a convex bow-front — characteristic of American Colonial Revival and Edwardian china cabinets c. 1890–1920." },
    { type: "style", clue: "reeded_cornice_molding", confidence: 52, description: "Both pieces show reeded / stepped cornice molding at the top — consistent with Federal Revival / Colonial Revival decorative vocabulary." },
    { type: "hardware", clue: "decorative_bail_pull", confidence: 62, description: "Three drawers on the secretary desk each have two ornate cast brass bail pulls with decorative foliate backplates — ring-and-bail form with heavy casting, consistent with Colonial Revival / Edwardian hardware c. 1890–1920." },
    { type: "hardware", clue: "cast_brass_door_pull", confidence: 62, description: "China cabinet door has a cast brass elongated bar pull with ornate foliate top and bottom mounts — decorative cast brass hardware consistent with late Victorian / Edwardian production." },
    { type: "hardware", clue: "lock_escutcheons", confidence: 62, description: "Drop-front face has a small brass lock escutcheon at center top; drawer fronts also show keyhole escutcheons — consistent with period lock hardware." },
    { type: "hardware", clue: "brass_quadrant_stays", confidence: 62, description: "Two brass quadrant / lid stays visible supporting the open drop-front writing surface — standard hardware for drop-front secretary desks." },
    { type: "hardware", clue: "modern_caster", confidence: 62, description: "Both pieces appear to sit on small casters at the feet — visible at base of china cabinet and secretary desk legs." },
    { type: "hardware", clue: "butt_hinge", confidence: 62, description: "Brass butt hinges visible at the drop-front writing surface attachment points — machine-made brass butt hinges consistent with late 19th / early 20th century production." },
    { type: "construction", clue: "curved_glass_door_construction", confidence: 95, description: "China cabinet door frame is curved to accept a bent/curved glass panel — requires specialized bent-glass manufacturing, common in American china cabinets c. 1890–1920." },
    { type: "construction", clue: "interior_arched_pigeonhole_dividers", confidence: 45, description: "Secretary desk interior shows arched pigeonhole dividers with scalloped arch tops — lighter secondary wood (possibly maple or poplar) used for interior fittings, contrasting with mahogany exterior." },
    { type: "construction", clue: "secondary_wood_interior", confidence: 85, description: "Interior pigeonhole compartments and small drawer visible in secretary desk interior are constructed from a lighter-toned secondary wood, contrasting with the mahogany primary wood — consistent with period American case furniture practice." },
    { type: "construction", clue: "round_wood_knob", confidence: 82, description: "Small interior drawer in the pigeonhole section has a small round wooden knob pull — consistent with period interior fittings." },
    { type: "condition", clue: "surface_wear_writing_surface", confidence: 45, description: "Drop-front writing surface shows scratches, scuffs, and general wear consistent with use — surface appears to retain original or early finish with age-appropriate wear." },
    { type: "condition", clue: "finish_darkening_oxidation", confidence: 54, description: "Drop-front face shows darkening and some finish loss / oxidation, particularly around the marquetry panel — consistent with aged shellac or varnish finish." },
    { type: "condition", clue: "shellac_intact", confidence: 45, description: "Overall surface finish on both pieces appears to be an aged shellac or early varnish — warm amber tone, no thick plastic film visible, consistent with pre-1940 original or early refinish." },
    { type: "condition", clue: "brass_hardware_patina", confidence: 54, description: "Brass bail pulls and door pull show tarnish and patina consistent with age — not bright polished modern brass, supporting period hardware attribution." },
    { type: "style", clue: "ogee_bracket_feet", confidence: 52, description: "Secretary desk stands on ogee bracket-style feet — characteristic of Colonial Revival / Hepplewhite-influenced case furniture." },
    { type: "style", clue: "two_piece_set_matching", confidence: 52, description: "China cabinet and secretary desk appear to be a matching set — same mahogany finish, same flame veneer, same hardware style, same overall proportions and period vocabulary." },
    { type: "materials", clue: "wood_species_mahogany_group", confidence: 84, description: "Primary show wood on both pieces is mahogany — deep red-brown color, flame/ribbon figure on veneer surfaces, consistent with Honduran mahogany used in American Colonial Revival / Edwardian production c. 1890–1930." },
    { type: "construction", clue: "drawer_present", confidence: 50, description: "serpentine / bow-front drawer fronts" },
    { type: "construction", clue: "door_present", confidence: 50, description: "curved glass door with bent glass panel" },
    { type: "materials", clue: "glass_top", confidence: 50, description: "glass" },
    { type: "form", clue: "cabinet_form", confidence: 68, description: "Cabinet or cupboard form is visible." },
  ],
  asSeen: {
    formId: "Reception desk",
    display: "Hollywood Regency / Neoclassical Glamour Adaptation Reception desk (also commonly called: Reception desk, Reception counter desk)",
    finalStyleKind: "revival_wave",
    dateRange: "Broadly late 19th to 20th century",
    dateFloor: 1900,
    dateCeiling: 2000,
    confidence: "Low",
  },
};

const interwar_traditional_william_mary_revival_carved_armchair_contrast_case: ScanFixture = {
  label: "interwar_traditional_william_mary_revival_carved_armchair_contrast_case",
  note: "CONTRAST CASE — END-TO-END SUCCESS. WILLIAM AND MARY REVIVAL ARMCHAIR (American Interwar Traditional production c. 1920-1940), solid walnut frame with three carved BARLEY-TWIST back splats (genuine carved twisted/interlaced elements — true barley twist this time), elaborate pierced acanthus crest rail with central foliate boss, scrolled foliate front stretcher, turned vase/ring legs and arm supports, curved scrolled arms, upholstered drop-in seat with jacquard fabric cover. Reported as 'Interwar Traditional William and Mary Upholstered armchair, c. 1930-1940, Moderate, revival_wave kind.' Every layer worked: form_armchair correctly chosen via armchair_form 0.93 + seating_surface 0.85 + seating_present 0.82 + backrest_present 0.79; William and Mary attribution conf 0.92 from matched_terms=['william','mary']; convergence zone 1930-1940 (2 layers: style_wave); kind=revival_wave correctly with PROPER containment ('Final dating c. 1930-1940 aligns with the Interwar Traditional William and Mary c. 1920-1945 wave' — 1930-1940 DOES fall within 1920-1945, no containment error). Joins S013/S014/S021/S025/S028/S029/S030/S033/S040/S046 as 11th must-not-regress CONTRAST CASE. Notable diagnostic findings (all minor, calibration tracking): (1) M11 CLUE-KEY-SOURCED ATTRIBUTION (6TH CLEAN SPECIMEN) — William and Mary attributed conf 0.92 from matched_terms=['william','mary']. Both tokens are in william_and_mary_influence clue KEY. Clean clue-key-sourced path producing CORRECT outcome. Joins S029 eastlake_hardware + S033 aesthetic_movement_style + S043 empire_revival_style + S046 renaissance_revival_style + S047 colonial_revival_style_cues as the SIXTH clean clue-key-sourced specimen in the corpus. Strong must-not-regress signal for the M11 fix design's preserve-me side. (2) MULTIPLE ATTRIBUTION ALTERNATIVES — Rococo Revival / Naturalistic Victorian conf 0.92 from ['rococo','revival','victorian'] PROSE-ONLY (likely from carved_crest_rail 'Victorian Rococo revival', baroque_revival_style 'Baroque revival', acanthus_carving 'Victorian Rococo revival' description prose). Colonial Revival conf 0.70 from ['colonial','revival'] also PROSE-ONLY. Engine correctly selected William and Mary as primary despite multiple competing prose-only attributions. Good calibration: clue-key-sourced specific attribution beats prose-only generic attributions when both fire. (3) PROPER REVIVAL-WAVE CONTAINMENT CHECK — final_style_reason 'Final dating (c. 1930-1940) aligns with the Interwar Traditional William and Mary (c. 1920-1945) wave.' Here 1930-1940 GENUINELY falls within 1920-1945 (mathematically correct). Contrast with S016/S043/S048 where 'aligns with' was asserted on partial overlap only. Confirms the containment check is working CORRECTLY when the dates actually do fall within the wave — the bug is specifically in the partial-overlap case. (4) ENGINE SURFACES APPRAISER-VOICE NOTES — supporting_context includes 'Transitional convergence — both Interwar Mass-Market Colonial and Hollywood Regency Rococo-Glam revival waves were in production c. 1930-1940; the overlap tightly anchors a transitional dating window' + 'Supporting William and Mary attribution: barley twist (these features are characteristic of the style but don't independently narrow dating).' Same expert-voice quality as S046's transitional Rococo/Renaissance note. Worth tracking as a positive engine behavior pattern. (5) NEW M0 SUB-PATTERN — secondary_surface FALSE-POSITIVE at conf 86 wt 0.92 [function] description 'A secondary raised surface is visible beside the seating area.' Looking at the photo, this is the CAST-IRON RADIATOR visible in the background beside the chair — the LLM identified a background object as a 'secondary surface' of the chair. Same shape as S037 telephone bench where 'secondary surface' would have been the correct identification — here it's the OPPOSITE: a background object hallucinated as a secondary surface. Did NOT pull form selection toward telephone bench (form_armchair correctly won). M0 background-object-as-piece-feature pattern, n=1. (6) M6/M7 hybrid spindle_back — fires at conf 82 wt 0.55 [structure] with description 'Three vertical carved splats form the back; these are NOT plain spindles but elaborately carved twist/barley-twist elements...' KEY-vs-content mismatch (cf. S015/S044). spindle_back KEY emitted, description negates spindle identity. form_windsor_chair NOT in alts list so spindle_back didn't trigger Windsor mis-selection this time. (7) M6 cabriole_leg fires at conf 50 [style] with description 'cabriole-style front feet with pad or claw' — the legs are actually turned vase/ring legs ending in pad/claw feet, not cabriole-form legs. Minor M6 mismatch. Did not drive form selection. (8) M0 lounge_chair_form did NOT fire (negative control — good behavior). (9) Style waves 8 detected (7 parseable + 1 '?') — wave detector noisy as usual. Primary convergence 1930-1940 correctly dominated; secondary 1800-1970 (4 layers) properly ignored as too broad. (10) Phase 0 Part A not exercised here (no rocker/settee/Windsor/chest/bistro/china cabinet/dressing-table/peacock/milking stool clues). (11) Resale valuation $138-$306 standard marketplace — reasonable for an Interwar Traditional William and Mary armchair. Net: clean end-to-end success on a transitional Interwar Traditional revival piece; M11 clue-key-sourced path producing correct outcome; revival-wave containment math working correctly when ranges genuinely overlap. Strong calibration target.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "seating_surface", confidence: 68, description: "Upholstered seat cushion/pad visible, fully spanning the seat frame width." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Tall high-back chair with three carved vertical splats and an elaborate carved crest rail." },
    { type: "form", clue: "armchair_form", confidence: 68, description: "Chair has two curved arms supported by turned arm posts, confirming armchair form." },
    { type: "style", clue: "barley_twist", confidence: 52, description: "Three back splats exhibit a pronounced barley-twist or rope-twist carved form — elongated twisted/interlaced vertical elements characteristic of William and Mary and Baroque revival styles." },
    { type: "style", clue: "carved_crest_rail", confidence: 52, description: "Elaborate pierced and carved crest rail with acanthus leaf scrolls, central floral/foliate motif, and volute terminals — strongly Baroque/Rococo revival vocabulary." },
    { type: "style", clue: "acanthus_carving", confidence: 52, description: "Crest rail features deeply carved acanthus leaf scrolls flanking a central floral boss; carving is three-dimensional and high-relief, consistent with Victorian Rococo revival or Baroque revival production." },
    { type: "style", clue: "scrolled_stretcher", confidence: 52, description: "Front stretcher is a carved scrolled/serpentine form with foliate carving at center, characteristic of William and Mary and Baroque revival chair construction." },
    { type: "structure", clue: "turned_arm_supports", confidence: 82, description: "Arm supports are turned with multiple ring and vase turnings, consistent with late 17th-century Baroque or Victorian Baroque revival chair construction." },
    { type: "structure", clue: "turned_front_legs", confidence: 82, description: "Front legs are turned with vase and ring profiles, terminating in what appear to be pad or claw feet at the base." },
    { type: "structure", clue: "spindle_back", confidence: 82, description: "Three vertical carved splats form the back; these are not plain spindles but elaborately carved twist/barley-twist elements with shield-shaped lower panels and carved upper sections." },
    { type: "structure", clue: "carved_back_splats", confidence: 82, description: "Three back splats visible: each has a twisted/interlaced upper section and a carved shield or lancet-shaped lower panel with incised leaf detail. Visible clearly in joinery closeup." },
    { type: "structure", clue: "curved_arms", confidence: 82, description: "Arms curve outward and downward in a scrolled profile, terminating in a rounded knuckle or scroll at the front, consistent with Baroque and William and Mary revival arm forms." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "Frame members appear to be solid wood throughout — no veneer visible on carved elements, turned legs, or arm supports. Deep carving on crest rail and splats confirms solid stock." },
    { type: "materials", clue: "wood_species_walnut", confidence: 45, description: "Wood color is a warm medium-to-dark brown with reddish undertones and smooth grain visible on arm and leg surfaces. Consistent with walnut or possibly mahogany; walnut is more probable given the warm brown tone and the Baroque/Victorian revival context. Confidence moderate — no end grain or secondary surfaces visible to confirm." },
    { type: "finish", clue: "shellac_intact", confidence: 55, description: "Surface shows warm amber-brown tone with moderate sheen, no thick plastic-like film visible. Consistent with intact shellac or oil-varnish finish. No crazing visible at this resolution. Confidence moderate." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 50, description: "Seat upholstery shows a complex repeating floral and scrollwork pattern in multiple colors (cream, gold, green, pink) on a woven ground. Pattern complexity and machine-loomed regularity are consistent with jacquard upholstery fabric. Could also be brocade; the pattern appears woven into the ground rather than standing proud, favoring jacquard classification." },
    { type: "style", clue: "baroque_revival_style", confidence: 52, description: "Overall chair vocabulary — high carved crest rail with acanthus scrolls, barley-twist back splats, scrolled carved front stretcher, turned arm supports, curved arms — is consistent with Baroque revival or William and Mary revival production, most commonly seen in American and European furniture c. 1870–1910 or in earlier 17th-century originals." },
    { type: "style", clue: "william_and_mary_influence", confidence: 52, description: "Combination of barley-twist splats, scrolled front stretcher, turned legs and arm supports, and high carved crest rail is characteristic of William and Mary style (c. 1690–1730) or its Victorian/Colonial Revival revival (c. 1880–1920)." },
    { type: "condition", clue: "finish_condition", confidence: 54, description: "Wood finish appears intact with no visible major losses, crazing, or peeling visible at this resolution. Surface has consistent warm sheen across all visible frame members." },
    { type: "condition", clue: "upholstery_condition", confidence: 54, description: "Seat upholstery appears clean, intact, and without visible tears, staining, or significant wear. Fabric pattern is clear and colors appear relatively fresh." },
    { type: "hardware", clue: "claw_foot_possible", confidence: 55, description: "Front feet appear to terminate in a carved claw or pad form — visible at the base of the front legs in the overall_front image. Resolution insufficient to confirm claw-and-ball vs. pad foot definitively." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 60, description: "Chair frame construction with turned legs, stretchers, and seat rail is consistent with mortise-and-tenon joinery at all major frame intersections. No visible confirmation from exposed joints, but this is the expected construction method for this chair type and period." },
    { type: "construction", clue: "round_tenon", confidence: 58, description: "Turned arm supports and stretchers entering seat rail and arm are consistent with round tenon joinery, typical of turned-member chair construction." },
    { type: "style", clue: "cabriole_leg", confidence: 50, description: "cabriole-style front feet with pad or claw" },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstered drop-in or over-stuffed seat" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "function", clue: "secondary_surface", confidence: 86, description: "A secondary raised surface is visible beside the seating area." },
  ],
  asSeen: {
    formId: "Upholstered armchair",
    display: "Interwar Traditional William and Mary Upholstered armchair (also commonly called: Arm chair, Easy chair)",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1930–1940",
    dateFloor: 1930,
    dateCeiling: 1940,
    confidence: "Moderate",
  },
};

const vernacular_pine_lift_lid_storage_chest_misid_slant_front_desk: ScanFixture = {
  label: "vernacular_pine_lift_lid_storage_chest_misid_slant_front_desk",
  note: "VERNACULAR COUNTRY PINE LIFT-LID STORAGE CHEST / blanket chest / utility box (American c. 1880-1920, butt-jointed pine plank construction with wire nails + circular saw arcs + iron hardware/strapping + lid batten cleats + heavy use patina + low back gallery rail). Engine reported as 'Slant-front desk', c. 1890-1920, HIGH overall confidence, kind=unresolved (no style attribution). M8 CATASTROPHIC FORM SELECTION via M7 NEGATION-AS-POSITIVE — clone of the LOOM MISID pattern but with a different clue. Multiple stacked failures: (1) PROMOTES the M7-NEGATION-CONSUMED-AS-POSITIVE-FORM-ROUTING pattern to n=3 (with peacock_emmanuelle_rattan_chair + S045 wicker rocker). slant_front clue fires at conf 68 wt 0.98 [construction] (HIGHEST construction weight in the scan). Description literally NEGATES slant-front identity: 'The angled appearance in the side-view image is due to camera perspective; the lid is flat (horizontal) when closed, NOT a slanted writing surface. Confirmed by front view showing flat horizontal lid.' Engine consumed the NEGATION as POSITIVE form evidence. form_slant_front_desk won via slant_front KEY substring-matching form_slant_front_desk alias. IDENTICAL mechanism shape to lloyd_loom_paper_fiber → form_loom (S018 peacock + S045 wicker rocker). Both: (a) clue KEY whose name substring-matches a target form alias, (b) description NEGATES the clue's identity, (c) engine consumes negation as positive, (d) form_X catastrophically selected. Promotion bar at n=3 — pattern shape is broader than LOOM MISID; it's M7-NEGATION-KEY-SUBSTRING-DRIVES-FORM. Worth tagging as the broader pattern for the future loom-fix scope-out. (2) fix#1 c. 1890-1920 CATCH-ALL (now n=9 with S001/S002/S008/S010/S011/S012/S044/S047/S050) — convergence zone 1790-1970 (4 layers: joinery+fastener+hardware+toolmark) is a 180-year span. P2 narrowed to c. 1890-1920 default. Convergence zone doesn't pin to 1890-1920; the catch-all narrowing fired. fix#1 post-Phase-0-deploy now n=3 (S044, S047, S050). (3) M6 WRITING_SURFACE FALSE-POSITIVE PROMOTES TO n=3 (S044 marble-top pedestal stand + S046 library table + S050 storage chest) — fires at conf 84 wt 0.94 [function] with description 'A writing or work surface is visible.' On a storage chest with NO writing surface. CLUE_LIBRARY semantic-too-broad pattern confirmed at promotion bar. (4) M6 SECONDARY_SURFACE FALSE-POSITIVE (n=2 with S049) — fires at conf 68 wt 0.89 [function] with description 'A single wide board rises vertically at the rear of the lid, functioning as a gallery or back panel.' This is the back gallery rail on the chest. Pulled form alternative #1 = 'Telephone bench / writing bench combination' (secondary_surface clue is the telephone-bench-form trigger noted in S037). secondary_surface FP n=2: S049 cast-iron radiator (background) + S050 chest back gallery rail. (5) M6 multiple_drawer_case FALSE-POSITIVE × 2 — fires TWICE at conf 68 + 70 [form] + [construction] with description 'Interior is a single open storage cavity with no internal dividers, shelves, or trays visible. Plain utilitarian storage box form.' NO drawers exist. KEY-vs-content mismatch (cf. S015 multiple_drawer_case 'NOT a chest'). Duplicate emission also a quality issue. (6) M6 drawer_present FP — conf 58 wt 0.52 with description 'Drawer evidence is visible' on a chest with no drawers. Recurrence. (7) M0 SEATING-SYNTHESIS FIRES on a chest — seating_surface conf 82 wt 0.88 + seating_present conf 78 wt 0.85. Description 'A seating surface or bench-like sitting area is visible.' Storage chest, not bench. Same M0 seating-synthesis pattern as S012 rope bed and S017 commode — fires on any flat-top storage form. (8) M6 wrought_iron fires at conf 50 wt 0.72 [materials] with description literally 'iron hardware' — could be iron strapping/hinges but materialized as wrought_iron furniture material. Same metal-FP family as S002. (9) Style attribution=null, style waves=0, kind=unresolved. Honest behavior — no fix#10 canned default fires this time. Engine surfaces 'No style attribution or context could be derived from the available evidence' which is the correct read for a vernacular utility chest. (10) HIGH CONFIDENCE CAP (85%) on a piece with form catastrophically wrong + date in fix#1 catch-all shape + multiple M6 false-positives. UX issue: user sees 'High' confidence on a wrong-form identification driven by a negated clue. Confidence cap is driven by 'Multiple dating-detail evidence categories (joinery, fasteners, toolmarks, hardware, wood) support both identification and dating with high confidence' per sufficiency_summary — sufficiency is computed from layer count not from layer correctness. (11) Date c. 1890-1920 is broadly defensible IF the form were correctly chest_lift_lid — wire nail + circular saw arcs + butt-jointed pine + heavy patina = late-19th-c. American vernacular utility chest. Date math accidentally landed in the right neighborhood despite form being catastrophically wrong. (12) form_blanket_chest / form_storage_chest / form_lift_lid_chest in canonical? Cedar chest / hope chest IS alternative #2 — close-ish form, but the engine doesn't have a clean form_lift_lid_utility_chest path. Possible TAXONOMY-GAP-adjacent issue. Net: M7-negation-driving-form-selection promoted to n=3 broader pattern (loom + slant-front), fix#1 catch-all n=9, three different M6 false-positives promoted (writing_surface n=3, secondary_surface n=2, multiple_drawer_case key-vs-content recurrence). High overall confidence cap on a catastrophically wrong form is the visible UX issue.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "lift_lid", confidence: 68, description: "Lid is hinged at the rear and lifts open to reveal interior storage cavity; classic lift-lid chest construction confirmed in open-lid image." },
    { type: "form", clue: "multiple_drawer_case", confidence: 68, description: "Interior is a single open storage cavity with no internal dividers, shelves, or trays visible. Plain utilitarian storage box form." },
    { type: "form", clue: "secondary_surface", confidence: 68, description: "A single wide board rises vertically at the rear of the lid, functioning as a gallery or back panel. Visible in both front and side views. Notched or dadoed into the side boards at each end." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "All visible components — lid, sides, front, back, and interior bottom — appear to be solid wood planks, not plywood or engineered sheet goods. No laminated layers visible at any edge." },
    { type: "materials", clue: "wood_species_pine_group", confidence: 84, description: "Visible grain pattern shows prominent cathedral arching, resinous knots, and amber-to-brown oxidation consistent with pine (likely eastern white pine or southern yellow pine). Coarse open grain on exterior boards. Interior boards show lighter, less oxidized pine surface." },
    { type: "construction", clue: "solid_plank_back", confidence: 45, description: "The back panel of the chest appears to be composed of multiple vertical solid planks butted together, visible in the back/side joinery closeup image. No plywood or sheet-panel back." },
    { type: "construction", clue: "glued_and_nailed_casework", confidence: 90, description: "Case corners and panel joints show nailed assembly throughout. Multiple nail heads visible along top edges, corner joints, and side panels. No interlocking joinery (dovetails, finger joints) visible at case corners — butt-jointed and nailed construction." },
    { type: "construction", clue: "butt_joint", confidence: 88, description: "Case corners show simple butt joints with nailed reinforcement rather than interlocking joinery. Exposed end grain visible at corners in the back-panel closeup." },
    { type: "construction", clue: "multi_board_lid", confidence: 90, description: "The lid is composed of multiple planks joined edge-to-edge, visible as seam lines across the lid surface in the open-lid image. Two or three boards make up the lid panel." },
    { type: "construction", clue: "multi_board_bottom", confidence: 95, description: "Interior bottom is composed of multiple narrow planks laid side by side, visible in the open-lid overhead image. Planks run parallel, consistent with solid-board floor construction." },
    { type: "hardware", clue: "butt_hinge", confidence: 62, description: "Two metal butt hinges visible at the rear of the lid connecting lid to case body. Hinges appear to be iron or steel, surface-mounted or partially mortised. Visible in open-lid image." },
    { type: "fasteners", clue: "wire_nail", confidence: 50, description: "Multiple small nail heads visible along top edges and panel joints. Head size and apparent round profile suggest wire nails (post-1880s) rather than cut nails, though resolution limits certainty. Some nail heads appear slightly oxidized/darkened consistent with age." },
    { type: "fasteners", clue: "cut_nail", confidence: 45, description: "Some nail heads visible at corner joints and along top edge may be cut nails given the apparent rectangular profile and oxidation pattern, but image resolution does not allow definitive classification. Cut nails would suggest pre-1895 construction." },
    { type: "condition", clue: "surface_wear_heavy", confidence: 54, description: "Exterior surfaces show heavy wear including scratches, abrasion marks, and surface checking (small cracks) particularly on the lid. Consistent with long-term use and age." },
    { type: "condition", clue: "checking_cracking", confidence: 54, description: "Lid surface shows wood checking (grain-following cracks) and a prominent knot with surrounding checking. Consistent with aged, unfinished or lightly finished pine drying over time." },
    { type: "condition", clue: "age_patina", confidence: 54, description: "Exterior surfaces show deep amber-to-dark-brown oxidation patina consistent with extended age. Interior surfaces are lighter/less oxidized, consistent with protected interior. Corner metal strapping shows dark oxidation." },
    { type: "condition", clue: "dirt_accumulation", confidence: 54, description: "Dirt and grime accumulation visible in joints, along corner strapping, and on lower exterior surfaces. Consistent with long-term storage or barn/utility use." },
    { type: "style", clue: "vernacular_utilitarian", confidence: 52, description: "No decorative elements, moldings, carved ornament, or stylistic embellishment. Plain utilitarian construction throughout. Consistent with country/farm/utility chest rather than parlor or bedroom furniture." },
    { type: "construction", clue: "lid_batten_cleats", confidence: 90, description: "Two wooden battens/cleats are visible on the underside of the lid (seen in open-lid image), running perpendicular to the lid planks. These serve to hold the lid boards together and prevent warping. Screwed or nailed through the lid from above." },
    { type: "construction", clue: "circular_saw_arcs", confidence: 55, description: "Interior bottom boards and some exterior surfaces show relatively straight, parallel saw marks consistent with circular or band saw milling rather than pit-saw diagonal marks. Suggests post-1830s milling, likely post-1870s for common production stock." },
    { type: "function", clue: "multiple_drawer_case", confidence: 70, description: "Primary function is storage — open interior cavity accessed by lifting hinged lid. No secondary function (writing surface, seating) clearly indicated, though the flat lid could serve as a surface." },
    { type: "form", clue: "slant_front", confidence: 68, description: "The angled appearance in the side-view image is due to camera perspective; the lid is flat (horizontal) when closed, not a slanted writing surface. Confirmed by front view showing flat horizontal lid." },
    { type: "materials", clue: "flat_sawn", confidence: 84, description: "Cathedral arch grain patterns visible on exterior side boards and lid surface confirm flat-sawn orientation throughout." },
    { type: "materials", clue: "wrought_iron", confidence: 50, description: "iron hardware" },
    { type: "form", clue: "seating_surface", confidence: 82, description: "A seating surface or bench-like sitting area is visible." },
    { type: "form", clue: "seating_present", confidence: 78, description: "Integrated seating is visible." },
    { type: "function", clue: "writing_surface", confidence: 84, description: "A writing or work surface is visible." },
    { type: "construction", clue: "drawer_present", confidence: 58, description: "Drawer evidence is visible." },
  ],
  asSeen: {
    formId: "Slant-front desk",
    display: "Slant-front desk (also commonly called: Slant-front desk, Slant-lid desk)",
    finalStyleKind: "unresolved",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

const mission_arts_crafts_oak_armchair_or_rocker_misid_windsor_chair: ScanFixture = {
  label: "mission_arts_crafts_oak_armchair_or_rocker_misid_windsor_chair",
  note: "MISSION / ARTS & CRAFTS / CRAFTSMAN OAK ARMCHAIR OR ROCKER, c. 1900-1925 American production, rectilinear fumed-oak frame with flat panel sides + broad flat horizontal arm caps + upholstered drop-in cushion seat + tall upholstered back panel with hand-tacked nailhead trim + jacquard foliate fabric. Engine descriptions reference 'side and back views' showing rockers (rocking_chair_rockers conf 96) — either the user submitted multiple images or the LLM hallucinated additional views; the visible front photo shows square rectangular block feet but no rockers. Engine reported as 'Arts and Crafts / Mission / Craftsman WINDSOR CHAIR (Spindle chair / Sack-back chair), c. 1890-1920, Moderate, original_period kind.' STYLE + DATE CORRECT, FORM CATASTROPHIC. Multiple stacked findings: (1) M0 SPINDLE-FP-DRIVING-WINDSOR PATTERN n=3 (S001 black country rocker, S027 Bassett upholstered rocker, S051 Mission armchair) — SECOND post-Phase-0-deploy specimen. spindle_back (conf 78 wt 0.83) + spindle_gallery (conf 70 wt 0.57) auto-synthesized by P0 on a piece with NO actual spindles — the back is a SOLID UPHOLSTERED PANEL (solid_plank_back fires at conf 82 wt 0.91 with description 'broad solid wood panel forming the exterior back surface, with visible flat-sawn grain across the full width'). spindle_back + spindle_gallery fire on ANY chair back as synthesizer over-emit. KEY substring-match against form_windsor_chair's 'Spindle chair' / 'Sack-back chair' aliases → form_windsor_chair selection. Identical mechanism to S027. Promotion bar firmly met. (2) M7 NEGATION-IGNORED — rocking_chair_form description literally says 'This is a rocking chair, NOT a Windsor rocker (no spindles, no plank seat) and not a platform rocker (no stationary base)'. The negation is in the rocking_chair_form description but spindle_back / spindle_gallery still fire independently. Engine reads the spindle-synth keys not the rocking_chair_form negation. M7 negation-as-positive consumption pattern continues. (3) PHASE 0 PART A POSITIVE-BUT-NOT-SELECTED (FIFTH specimen with S027/S045/S047/S048) — rocking_chair_form Tier 3 weight 0.92 fired POSITIVELY at conf 68 [form] but form_windsor_chair won via KEY-substring path. Confirms Phase 0 Part A clue weight alone is insufficient to defeat KEY-substring form routing across multiple form-clue specimens. CLUE_ROUTING consumption is rolled back so the Tier 3 dictionary route to form_rocking_chair didn't fire. (4) M11 CLUE-KEY-SOURCED CONF 1.00 — Arts and Crafts / Mission / Craftsman attributed conf 1.00 (PERFECT confidence, THIRD conf 1.00 specimen in corpus) from matched_terms=['arts','crafts','mission']. ALL three tokens are in mission_arts_and_crafts_style clue KEY. CLUE-KEY-SOURCED clean specimen producing CORRECT outcome — CONTRAST with S041 + S048 conf 1.00 specimens which were PROSE-ONLY producing wrong attributions. THIS IS THE FIRST CLEAN CONF 1.00 CLUE-KEY-SOURCED specimen in the corpus. Critical calibration: M11 conf 1.00 can be RIGHT (clue-key-sourced, as here) or WRONG (prose-only, S041/S048). M11 fix design must distinguish the two. Joins S029/S033/S043/S046/S047/S049 as the 7th clean clue-key-sourced M11 specimen. (5) PROPER REVIVAL-WAVE WORDING — final_style_reason says 'Final dating (c. 1890-1920) OVERLAPS the original Arts and Crafts / Mission / Craftsman period (c. 1895-1930).' Uses 'overlaps' not 'falls within' — this is the fix #5 partial-overlap wording fix WORKING. 1890-1920 doesn't fully fall within 1895-1930 (1890 < 1895) so 'overlaps' is mathematically correct. Wording fix VERIFIED working here. (6) DATE c. 1890-1920 IS WELL-ANCHORED (not fix#1 catch-all) — convergence zone 1800-1930 (5 layers: joinery + finish + upholstery + style + style_wave) genuinely brackets 1890-1920. Floor 1890 from finish layer 1800-1920 / upholstery 1700-1920 intersection minus 10-year frame floor. Defensible date math this time. (7) M0 SEATING-SYNTHESIS POSITIVE — seating_surface synth fires per harness output ('seating_surface synth: true'). On a chair with actual seating this is appropriate behavior, not pathology. (8) Date and style ANSWER ARE CORRECT — the piece IS Arts & Crafts / Mission c. 1895-1925 production. The catastrophe is form_windsor_chair on a piece that is clearly a Mission armchair (or rocker per engine description). Final reconciliation kind=original_period correctly. (9) Style waves: 2 detected (1895-1930 + '?' unparseable). Primary correctly Arts & Crafts. (10) Resale valuation $139-$309 — reasonable for a Mission armchair but undervalued IF this is actually a quality maker-attributed piece (Stickley / Limbert pieces fetch significantly more). Form misclassification compresses valuation since 'Windsor chair' has a different market band than Mission armchair. Net: form catastrophic (spindle-FP-driving-Windsor n=3, post-Phase-0-deploy n=2), style and date correct via clean clue-key-sourced conf 1.00 attribution (first clean clue-key-sourced 1.00 in corpus, critical M11 calibration). User sees correct style + period but wrong form name. The 'fix the spindle FP' work would close this n=3 pattern.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "rocking_chair_form", confidence: 68, description: "Paired curved wooden rockers are clearly visible attached to the leg bottoms in both the side and back views. The chair has a full backrest and armrests. This is a rocking chair, not a Windsor rocker (no spindles, no plank seat) and not a platform rocker (no stationary base)." },
    { type: "form", clue: "seating_surface", confidence: 68, description: "Upholstered seat cushion visible from the front view, fully enclosed within the rectilinear oak frame." },
    { type: "form", clue: "backrest_present", confidence: 68, description: "Tall upholstered back panel set within a rectilinear oak frame, visible from front and back views." },
    { type: "style", clue: "mission_arts_and_crafts_style", confidence: 52, description: "Rectilinear frame with flat panel sides, broad flat arm caps, no decorative carving, straight vertical and horizontal members, and dark stained/fumed oak finish are all characteristic of Mission/Arts & Crafts seating vocabulary, c. 1895–1925." },
    { type: "materials", clue: "wood_species_oak_group", confidence: 45, description: "Visible grain on the side panels and arm caps shows open ring-porous grain consistent with oak. The back panel (overall_side and joinery_closeup views) shows broad flat-sawn cathedral grain typical of oak. No visible ray fleck to confirm quarter-sawn white oak; appears to be flat-sawn red or white oak." },
    { type: "construction", clue: "frame_and_panel_sides", confidence: 80, description: "The side panels of the chair appear to be solid flat boards set within a stile-and-rail frame structure. The back panel visible from the rear is a broad solid plank or panel within the frame. This is consistent with Mission-era panel construction." },
    { type: "construction", clue: "solid_plank_back", confidence: 82, description: "The back of the chair (back view and side view) shows a broad solid wood panel forming the exterior back surface, with visible flat-sawn grain across the full width. A horizontal rail divides the lower portion." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 55, description: "Mission/Arts & Crafts chairs of this type characteristically use mortise-and-tenon joinery at arm-to-post and rail-to-post connections. No exposed tenon ends are visible in these photos, but the construction vocabulary strongly implies this joinery. Confidence is moderate due to lack of direct visual confirmation." },
    { type: "upholstery", clue: "jacquard_cover", confidence: 50, description: "The green upholstery fabric shows a large-scale repeating foliate/acanthus leaf pattern with high pattern complexity and tonal contrast within a single color ground. The pattern appears machine-loomed with regular repeat. This is most consistent with a jacquard-woven upholstery fabric. Could also be a damask (single-color woven figured fabric), but the pattern relief and texture appear more pronounced than typical damask — classified as jacquard_cover with damask as close alternative." },
    { type: "upholstery", clue: "nailhead_trim", confidence: 50, description: "A row of brass-colored decorative nailheads is visible along the perimeter of the back upholstery panel, both on the front face and visible on the back view. Nailheads appear individually placed with slight irregularity, consistent with hand-tacked application. A gimp braid trim also runs alongside the nailhead row." },
    { type: "upholstery", clue: "hand_tacks", confidence: 50, description: "The nailhead trim appears individually placed with slight spacing variation, suggesting hand-tacked application rather than a modern nailhead strip. Consistent with pre-1950 upholstery practice." },
    { type: "condition", clue: "finish_wear_heavy", confidence: 54, description: "Significant finish loss and abrasion visible on the arm cap surfaces, arm fronts, and rocker surfaces. Dark grime accumulation in recesses. The arm tops show worn-through finish exposing lighter wood beneath in places. Consistent with decades of use." },
    { type: "condition", clue: "upholstery_damage", confidence: 54, description: "The upper right corner of the back upholstery panel shows fraying and partial separation of the gimp trim and fabric edge, visible in the back view photo." },
    { type: "condition", clue: "shellac_intact", confidence: 45, description: "The dark finish on the oak frame appears to be an original or early oil/shellac/varnish finish consistent with Mission-era fumed or stained oak. The surface shows age-appropriate dulling and wear rather than a plastic-like polyurethane film. No obvious polyurethane sheen detected." },
    { type: "construction", clue: "rocking_chair_rockers", confidence: 96, description: "Paired curved wooden rockers are visible in the side and back views, attached to the front and rear legs. The rockers are broad and flat-profiled, consistent with Mission-era rocker design rather than the more slender curved rockers of Victorian parlor rockers." },
    { type: "style", clue: "flat_arm_cap", confidence: 52, description: "Broad, flat horizontal arm caps are visible on both sides of the chair. These are a defining feature of Mission/Arts & Crafts armchair and rocker design, c. 1895–1925." },
    { type: "construction", clue: "solid_wood_construction", confidence: 88, description: "The frame members — posts, rails, arm caps, and side panels — all appear to be solid wood construction rather than veneered or laminated components. Consistent with Mission-era solid oak construction." },
    { type: "materials", clue: "cut_grain_phenomenon_flat_sawn", confidence: 80, description: "The broad back panel and side panels show cathedral arch grain patterns consistent with flat-sawn oak boards. No prominent ray fleck visible to suggest quarter-sawn orientation." },
    { type: "style", clue: "rectilinear_mission_form", confidence: 52, description: "The overall silhouette is strictly rectilinear: square posts, flat horizontal rails, flat arm caps, vertical back panel, and no curved or carved decorative elements on the wood frame. This is the defining formal vocabulary of Mission/Arts & Crafts seating, c. 1895–1925." },
    { type: "materials", clue: "fully_upholstered", confidence: 50, description: "upholstered back panel" },
    { type: "form", clue: "seating_present", confidence: 50, description: "seating surface" },
    { type: "structure", clue: "spindle_back", confidence: 78, description: "Spindles are visible in the back or side rail." },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
    { type: "form", clue: "armchair_form", confidence: 82, description: "Armchair form is visible." },
  ],
  asSeen: {
    formId: "Rocking chair",
    display: "Arts and Crafts / Mission / Craftsman Rocking chair",
    finalStyleKind: "original_period",
    dateRange: "c. 1890–1920",
    dateFloor: 1890,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

const art_deco_depression_era_walnut_waterfall_dresser_inverted_reconciliation: ScanFixture = {
  label: "art_deco_depression_era_walnut_waterfall_dresser_inverted_reconciliation",
  note: "AMERICAN ART DECO / DEPRESSION-ERA WALNUT WATERFALL-ADJACENT DRESSER (c. 1925-1945 American factory production), bookmatched burl/crotch walnut veneer top + flame walnut drawer fronts + arched mirror frame with notched corners + serpentine bow-front center drawers + flat tapered legs + round wooden knobs + lock escutcheons + walnut veneer over secondary wood (poplar/gumwood/basswood). Engine reported as 'Art Deco vocabulary (post-1870 reproduction) Dresser, c. 1870-1910, HIGH confidence, kind=reproduction.' LOGICALLY IMPOSSIBLE RECONCILIATION + DATE INVERSION on a piece with all the correct evidence present. Style + form are correct, date is BACKWARDS, reconciliation label is logically impossible. New M-mechanism specimen. Diagnostic findings: (1) NEW M-MECHANISM — M5-INVERTED-RECONCILIATION (n=1) — kind=reproduction with reason 'Final dating (c. 1870-1910) falls outside the original Art Deco period (c. 1925-1945) and no surfaced revival wave covers this dating envelope. The piece carries Art Deco vocabulary but is later production.' THIS IS LOGICALLY IMPOSSIBLE — you cannot REPRODUCE a style that didn't exist yet at the working-range date. Art Deco didn't exist in 1870-1910. The label 'Art Deco vocabulary (post-1870 reproduction)' is incoherent: '(post-1870 reproduction)' parenthetical suggests reproduction made AFTER 1870, but the working range IS 1870-1910 — circular. The reconciliation logic chose to trust the older convergence zone (1870-1910) over the style attribution (1925-1945) and then INVENTED a 'reproduction' classification to bridge the gap. Correct reconciliation: recognize that style attribution conf 0.92 is well-supported, recognize that c. 1925-1945 zone has 3 layers (joinery + style + style_wave), revise the working range UP to 1925-1945. (2) DATE INVERSION — TWO convergence zones exist: (a) 1870-1910 (3 layers: joinery + wood + finish), (b) 1925-1945 (3 layers: joinery + style + style_wave). Zone (b) is the CORRECT answer matching the style and the piece's true production period. Engine chose zone (a). P2 reasoning literally says 'No layer convergence, but the most recent dating evidence sets a floor of c. 1870, so the working range is anchored there rather than left fully open' — CONTRADICTING the convergence_zones list which shows TWO zones. P2 frame-dating logic IGNORED the convergence zones and used a fallback heuristic. New tally row: P2 IGNORED MULTIPLE CONVERGENCE ZONES, n=1. (3) The 1870-1910 zone is supported by: factory_case_construction (post-1870 floor only) + thick_veneer (pre-1910 ceiling only) + shellac_intact (1800-1920 broad). NONE of these have a 1910 hard ceiling — they're all compatible with 1925-1945. The 'overlap' at 1870-1910 is a coincidence of weak open-ended layers, not a positive constraint. (4) The 1925-1945 zone is supported by: factory_case_construction + style attribution (Art Deco 1925-1945) + style_wave (5 waves all in 1925-1995). This zone is logically anchored by the style evidence which the engine TRUSTED enough to apply conf 0.92 but DIDN'T TRUST for date reconciliation. (5) M11 CLUE-KEY-SOURCED ATTRIBUTION (EIGHTH CLEAN SPECIMEN) — Art Deco attributed conf 0.92 from matched_terms=['art','deco']. transitional_art_deco_depression_era clue KEY contains both 'art' AND 'deco' tokens. CLUE-KEY-SOURCED clean specimen producing CORRECT outcome. Joins S029/S033/S043/S046/S047/S049/S051 as 8th clean clue-key-sourced specimen. (6) PHASE 0 PART A POSITIVE-AND-SELECTED — dresser_form Tier 3 wt 0.92 [form] fired correctly and form_dresser WON. Sixth positive Phase 0 Part A clue datapoint, and form selection correctly drove form_dresser. Alts list = ['Chest of drawers / dresser'] only one alternative which is the parent form — clean. (7) HIGH CONFIDENCE CAP on logically-impossible date — Cap pct: 85% on a piece with kind=reproduction and a date 50+ years before the attributed style. User sees 'HIGH' confidence on a logically-impossible identification. Most severe confidence-cap-decoupling specimen in the corpus. (8) The 'post-1870 reproduction' string is a NEW canned-label-adjacent template (variant of fix#10 family) — '<style> vocabulary (post-YYYY reproduction)' formula. When date < style_floor, engine generates this template. Could be triggered for other pieces where date < style_floor (Federal/Hepplewhite/Sheraton 1780+ on a c.1700 piece, etc.). NEW fix#10-adjacent template. (9) 5 style_waves detected — 1925-1935, 1930-1945, 1970-1985, 1980-1995, '?'. ZERO waves cover 1870-1910. Engine's own reasoning 'no surfaced revival wave covers this dating envelope' is correct EVIDENCE that the date envelope is wrong, but engine interpreted it as evidence the style attribution should be downgraded to 'reproduction'. (10) M0 secondary_surface FP fires — secondary_surface conf 82 wt 0.92 [structure] description 'The case top provides a flat horizontal secondary surface above the drawers, below the mirror.' This is the dresser TOP which IS the primary surface for grooming/display use on a dresser. Not really a 'secondary surface' — the case top is a primary feature. Borderline M6. (11) round_wood_knob description WRONG — clue KEY says round_wood_knob but description says 'All drawers fitted with turned round wooden knobs. Knobs appear to be walnut or dark-stained wood' — these are turned WOOD knobs, so KEY-content match. Not a M7 here. P5 correctly down-weighted as replacement risk. (12) Resale valuation $114-$259 — way undervalued for an Art Deco Depression-era waterfall dresser with bookmatched burl walnut and original mirror. The date-inversion compresses value because the engine prices it as a c. 1870-1910 generic dresser rather than a c. 1930-1940 Art Deco piece. Form was right + style was right but date inversion + reproduction label compressed valuation. Net: a fascinating new M-mechanism specimen — M5-INVERTED-RECONCILIATION where the engine had ALL the correct evidence to identify this as 1925-1945 Art Deco production but chose to invert the date by trusting weak open-ended layer floors over a strong style attribution. The 'reproduction' label is logically incoherent (can't reproduce a future style). HIGH confidence cap on the incoherent result is the visible UX problem.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "dresser_form", confidence: 68, description: "Horizontal-format case piece with multiple stacked drawers and a mirror surmounted on top via a fixed mirror frame. Case stands wider than tall. Consistent with dresser form definition." },
    { type: "form", clue: "mirror_present", confidence: 68, description: "Large arched/rounded-top mirror mounted on the back of the case top. Mirror frame has a rounded arch at top with notched lower corners — a transitional Art Deco / late Victorian arch profile. Mirror glass shows foxing and age spotting consistent with older silvering." },
    { type: "form", clue: "drawer_present", confidence: 68, description: "Multiple drawers visible across the case front. Left side: two full-width drawers stacked. Center bow-front section: two smaller drawers stacked. Right side: two full-width drawers stacked. Bottom: one full-width drawer spanning the entire case. Total approximately 7 drawers." },
    { type: "form", clue: "multiple_drawer_case", confidence: 68, description: "Multiple stacked drawers in a single case — approximately 7 drawers total arranged in a combination of full-width and center bow-front configuration." },
    { type: "style", clue: "serpentine_bow_front", confidence: 52, description: "Center section of the case projects forward in a bow/serpentine curve, creating a three-part facade: flat left section, projecting curved center, flat right section. This is a characteristic transitional feature seen in late Victorian through Art Deco American dressers c. 1900–1935." },
    { type: "materials", clue: "thick_veneer", confidence: 45, description: "Drawer fronts and case top show highly figured walnut veneer with dramatic swirling grain. Veneer appears to be plain-sliced or crotch-cut walnut with strong figure. Edge of case top visible in overall_side image shows veneer applied over a secondary wood substrate; veneer appears to have some thickness. Consistent with pre-rotary-veneer era hand or early machine-sliced veneer." },
    { type: "materials", clue: "wood_species_walnut_group", confidence: 84, description: "All show surfaces — drawer fronts, case top, case sides, mirror frame — display warm brown walnut with dramatic swirling figure. The top surface in the joinery_closeup images shows a bookmatched or four-way matched burl/crotch walnut veneer panel with circular swirling eyes and chaotic grain. Drawer fronts show plain-sliced walnut with strong cathedral and flame figure. Consistent with black walnut veneer." },
    { type: "materials", clue: "cut_grain_phenomenon_burl", confidence: 84, description: "Case top surface shows a four-way matched or bookmatched burl/crotch walnut veneer panel with circular swirling eyes, chaotic grain, and no consistent grain direction — classic burl figure. Visible clearly in the joinery_closeup top-down image." },
    { type: "materials", clue: "cut_grain_phenomenon_flame_figure", confidence: 84, description: "Drawer fronts display strong flame/crotch figure in the walnut veneer — upward-sweeping feather-like grain patterns consistent with crotch or flame-cut walnut veneer. Visible on all drawer fronts." },
    { type: "materials", clue: "cut_grain_phenomenon_bookmatching", confidence: 82, description: "The case top veneer shows a four-way bookmatched arrangement with mirror-image grain radiating from a central point. Drawer fronts also appear to have bookmatched veneer pairs. Consistent with quality veneer work." },
    { type: "hardware", clue: "round_wood_knob", confidence: 62, description: "All drawers fitted with turned round wooden knobs. Knobs appear to be walnut or dark-stained wood, round profile, single central screw attachment. Consistent with American dresser hardware c. 1880–1940." },
    { type: "hardware", clue: "lock_escutcheons", confidence: 62, description: "Lock escutcheons visible on at least two drawers — one on the upper left drawer and one on the right side drawer. Small keyhole plates visible. Consistent with half-mortise locks on case drawers." },
    { type: "style", clue: "arched_mirror_frame", confidence: 52, description: "Mirror frame has a rounded arch at the top with notched/stepped lower corners — a profile transitional between late Victorian and Art Deco. The arch is not a full semicircle but a broad rounded top with slight notching at the lower corners of the frame. Small decorative finials visible at the upper corners of the mirror support posts in one joinery_closeup image." },
    { type: "style", clue: "decorative_finials", confidence: 52, description: "Small turned brass or metal finials visible at the upper corners of the mirror support posts in the joinery_closeup (top-down view). These are small urn-shaped or acorn-shaped finials, consistent with late Victorian / Edwardian / early 20th century dresser hardware." },
    { type: "structure", clue: "flat_tapered_legs", confidence: 82, description: "Case rests on flat, slightly tapered square legs visible at the corners. Legs are relatively slender and plain — no turned elements, no cabriole form. Consistent with transitional late Victorian / early 20th century case furniture." },
    { type: "condition", clue: "mirror_foxing", confidence: 54, description: "Mirror glass shows significant foxing, dark spotting, and silvering deterioration consistent with age. The mirror backing has deteriorated in multiple areas, producing dark patches and mottled reflections. Consistent with original mirror glass from early 20th century." },
    { type: "condition", clue: "surface_staining_top", confidence: 45, description: "Case top surface shows white residue/staining — possibly water rings, wax buildup, or chemical residue — visible as white cloudy patches across the veneer surface. Visible in multiple images." },
    { type: "condition", clue: "veneer_edge_wear", confidence: 54, description: "Edge of case top visible in overall_side image shows veneer lifting or chipping at the front edge corner — consistent with age-related veneer delamination. Some veneer loss or edge damage visible." },
    { type: "finish", clue: "shellac_intact", confidence: 45, description: "Show surfaces have a warm amber-brown finish with moderate sheen. The finish appears to be an older lacquer or shellac rather than a thick polyurethane film — no obvious plastic pooling or thick build-up visible. The finish shows age-consistent dulling and wear. Could be original shellac or early lacquer. Confidence moderate due to photo limitations." },
    { type: "style", clue: "transitional_art_deco_depression_era", confidence: 52, description: "The combination of: (1) bow-front center section, (2) arched mirror with notched corners, (3) bookmatched burl walnut veneer top, (4) flame walnut drawer fronts, (5) round wood knobs, (6) flat tapered legs, and (7) horizontal wide format all point to American transitional dresser production c. 1920–1940, spanning late Colonial Revival through Art Deco / Depression-era factory production." },
    { type: "construction", clue: "veneer_over_secondary_wood", confidence: 85, description: "The case sides visible in overall_side image show a lighter, plainer wood grain on the side panel compared to the highly figured walnut on the top and drawer fronts. This is consistent with walnut veneer applied over a secondary wood substrate (likely poplar, gumwood, or basswood) — standard American factory dresser construction of the 1920s–1940s." },
    { type: "construction", clue: "factory_case_construction", confidence: 80, description: "Overall construction evidence — veneer over secondary wood, standardized drawer arrangement, machine-consistent proportions, flat tapered legs — is consistent with American factory case goods production rather than hand-crafted individual cabinetmaking." },
    { type: "structure", clue: "secondary_surface", confidence: 82, description: "The case top provides a flat horizontal secondary surface above the drawers, below the mirror. This surface shows the bookmatched burl walnut veneer and serves as a display/grooming surface." },
    { type: "style", clue: "cut_grain_phenomenon_plain_sliced_veneer", confidence: 52, description: "Drawer fronts show plain-sliced walnut veneer with strong cathedral and flame figure — the characteristic upward-sweeping arch grain of plain-sliced walnut. Consistent with commercial veneer work of the 1920s–1940s." },
    { type: "materials", clue: "glass_top", confidence: 50, description: "foxing/age spots on mirror glass" },
    { type: "form", clue: "cabinet_form", confidence: 68, description: "Cabinet or cupboard form is visible." },
  ],
  asSeen: {
    formId: "Dresser",
    display: "Art Deco Dresser (also commonly called: bureau, bedroom dresser)",
    finalStyleKind: "original_period",
    dateRange: "c. 1925–1945",
    dateFloor: 1925,
    dateCeiling: 1945,
    confidence: "Low",
  },
};

const mission_arts_crafts_oak_library_writing_table_misid_secretary_drop_front: ScanFixture = {
  label: "mission_arts_crafts_oak_library_writing_table_misid_secretary_drop_front",
  note: "MISSION / ARTS & CRAFTS / CRAFTSMAN OAK LIBRARY-WRITING TABLE (American c. 1900-1920 Golden Oak / Mission era factory production), quartersawn oak top + heavy square legs + VERTICAL SLAT side panels creating two-tier shelf bays + single locked drawer in apron + EXPOSED THROUGH-TENONS at top rail + no applied ornament + butt-edge-glued top boards. Engine reported as 'Arts and Crafts / Mission / Craftsman Secretary desk / drop-front desk (Secretary desk / Secretary bookcase), c. 1900-1920, High.' FORM CATASTROPHIC (library/writing table → secretary desk with drop-front), STYLE + DATE CORRECT. Multiple diagnostic findings: (1) M6 drop_front_desk FALSE-POSITIVE PROMOTES TO n=3 (S039 Sligh writing console table + S048 Colonial Revival pair + S053 Mission library table). drop_front_desk clue fires at conf 84 wt 0.98 [construction] description literally 'Drop-front writing surface is visible.' But the writing_surface [form] obs EXPLICITLY NEGATES: 'Large flat rectangular top surface consistent with a writing desk or library table; no tilt, no drop-front, no cylinder closure.' Two observations DIRECTLY CONTRADICT. The higher-weight false drop_front_desk clue beats the correct flat-top writing_surface. Same M7-NEGATION-DRIVING-FORM-SELECTION shape as LOOM MISID + S050 slant-front-chest pattern but with different clue. The pattern: drop_front_desk KEY substring-matches form_secretary_desk alias 'drop-front desk' → form_secretary_desk selection wins. Pattern shape (lloyd_loom + slant_front + drop_front_desk) all in the broader negation-key-substring-match family. Promotion bar firmly met for drop_front_desk specifically. (2) FORM ALTS CORRECTLY INCLUDE 'Library table' AS ALT #1 — engine considered the correct form and rejected it. Form selection logic ranked secretary_desk above library_table via drop_front_desk M6 weight 0.98 + secondary_surface 0.89 + pedestal_column 0.98 false-positive trio. form_library_table would have been the correct primary selection. (3) M6 pedestal_column FALSE-POSITIVE — fires at conf 84 wt 0.98 [form] description 'Single-column pedestal form is visible.' But the piece has FOUR HEAVY SQUARE LEGS, not a pedestal column. Generic pedestal_column auto-emission on any centered structural support. Joins S038 cone chair (pedestal_column drove form_bench) + S044 marble-top occasional table + S047 curio cabinet as pedestal_column FP specimens. (4) M6 secondary_surface FALSE-POSITIVE PROMOTES TO n=3 (S049 background radiator + S050 chest back gallery + S053 library table side shelves) — fires at conf 68 wt 0.89 [form] with description 'Multiple open shelf surfaces below the main writing top on both side pedestals provide secondary storage/display surfaces.' The side shelves are PRIMARY structural features of a Mission library table, not secondary-surface telephone-bench-type features. Promotion bar met. (5) M11 CLUE-KEY-SOURCED ATTRIBUTION (NINTH CLEAN SPECIMEN) — Arts and Crafts / Mission / Craftsman attributed conf 0.82 from matched_terms=['arts','crafts','mission']. All three tokens in mission_arts_crafts_style clue KEY. CLEAN CLUE-KEY-SOURCED specimen producing CORRECT outcome. Joins S029/S033/S043/S046/S047/S049/S051/S052 as 9th clean clue-key-sourced M11 specimen. (6) DATE c. 1900-1920 WELL-ANCHORED via 5-layer convergence zone 1895-1930 (joinery + finish + style + style_wave + hardware) — strongest convergence in this batch. through_mortise_and_tenon 1890-1920 + stamped_metal_bracket post-1900 + shellac 1800-1920 + Arts and Crafts 1895-1930 + 4 Arts and Crafts style_waves. Date math properly anchored, not fix#1 catch-all this time. (7) PROPER ORIGINAL_PERIOD CONTAINMENT — final_style_reason 'Final dating (c. 1900-1920) FALLS WITHIN the original Arts and Crafts / Mission / Craftsman period (c. 1895-1930).' 1900-1920 IS within 1895-1930 mathematically. Containment check working correctly here (contrast with S016/S043/S048 partial-overlap errors). (8) golden_oak_structural_pattern CLUE WORKS CORRECTLY — fires at conf 82 wt 0.66 [materials] with description matching Golden Oak Era production hardware/wood patterns. Engine's canonical guidance note explicitly treats Golden Oak Era as 'a material/market-era signal rather than a single design language.' Good behavior — the Golden Oak anchor reinforces date without inflating style attribution. (9) Phase 0 Part A NOT exercised here (no rocker/settee/Windsor/chest/bistro/china cabinet/dressing-table/peacock/milking stool clue keys). (10) HIGH CONFIDENCE CAP appropriately reflects strong evidence stack — not the misleading-confidence-on-wrong-result pattern from S048/S050/S051/S052. (11) M7-NEGATION-KEY-SUBSTRING-FORM-ROUTING PATTERN expands to n=4 (peacock + S045 wicker rocker + S050 chest + S053 library table). The clue keys involved: lloyd_loom_paper_fiber → form_loom (n=2), slant_front → form_slant_front_desk (n=1), drop_front_desk → form_secretary_desk (n=1). The broader pattern is the design pathology: any clue KEY with form-route substring-matching potential consumed as positive evidence when description negates. Spans MULTIPLE different clue keys — confirms this is an architectural issue at form-routing layer, not specific to any one clue. (12) Valuation $103-$265 — moderate but reasonable for a Mission library table. Even though form was technically wrong (secretary_desk vs library_table), both are Mission-era American factory production with similar market value. Form misclassification didn't badly compress valuation here. Net: form catastrophic via drop_front_desk M6 FP + pedestal_column FP + secondary_surface FP triad, style + date correct via clue-key-sourced 9th clean M11 specimen + 5-layer convergence. Form alts list correctly surfaces 'Library table' as alt #1. The M7-negation-form-routing pattern now spans 3 different clue keys — architectural fix needed.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "writing_surface", confidence: 68, description: "Large flat rectangular top surface consistent with a writing desk or library table; no tilt, no drop-front, no cylinder closure." },
    { type: "form", clue: "drawer_present", confidence: 68, description: "Single centered drawer visible in the apron below the top, fitted with a keyhole escutcheon/lock; no visible pull hardware — likely a lock-only drawer." },
    { type: "form", clue: "open_shelving", confidence: 68, description: "Two tiers of open shelves visible on each side pedestal below the writing surface, accessible from the sides; characteristic of a library/reading table form." },
    { type: "style", clue: "mission_arts_crafts_style", confidence: 52, description: "Strongly rectilinear form with heavy square legs, exposed through-tenon joinery, vertical slat side panels, no applied ornament, and quartersawn oak — all canonical Mission / Arts & Crafts vocabulary." },
    { type: "structure", clue: "through_mortise_and_tenon", confidence: 82, description: "Tenon ends are visibly exposed at the tops of the leg posts where the top rail meets the leg, and at shelf-to-leg connections; characteristic Arts & Crafts through-tenon construction." },
    { type: "construction", clue: "mortise_and_tenon", confidence: 87, description: "Mortise-and-tenon joinery visible at multiple frame intersections — leg-to-apron and leg-to-shelf rail connections show shoulder lines and tenon ends consistent with through or blind M&T construction." },
    { type: "materials", clue: "solid_wood_construction", confidence: 84, description: "All visible structural members — legs, apron, shelves, top — appear to be solid wood boards, not veneered panels or plywood. No lamination layers visible at any edge." },
    { type: "materials", clue: "wood_species_oak_group", confidence: 84, description: "Open ring-porous grain structure with visible ray fleck on the top surface and side panels; consistent with oak. Some boards show quarter-sawn ray fleck pattern, others show flat-sawn cathedral grain." },
    { type: "materials", clue: "cut_grain_phenomenon_quarter_sawn", confidence: 72, description: "Ray fleck visible on the top surface and leg faces indicating at least some quarter-sawn oak boards; consistent with Mission/Golden Oak era production." },
    { type: "hardware", clue: "lock_escutcheons", confidence: 45, description: "Small circular keyhole escutcheon visible centered on the single drawer front; appears to be a simple stamped or cast metal escutcheon consistent with early 20th-century production." },
    { type: "hardware", clue: "stamped_metal_bracket", confidence: 62, description: "Small metal fasteners/brackets visible at shelf-to-leg connection points on the front face; appear to be small stamped corner brackets or screws securing the shelf rails to the legs." },
    { type: "condition", clue: "refinished_surface", confidence: 54, description: "Top surface appears lighter and more worn than the base, suggesting either differential aging or a partial refinish/stripping of the top. The base retains a darker, more uniform finish. Inconclusive from photos alone." },
    { type: "condition", clue: "shellac_intact", confidence: 54, description: "Base members show a warm amber-brown surface with mellow sheen consistent with intact or partially intact original shellac or oil/wax finish; no obvious plastic-film polyurethane appearance on the base." },
    { type: "condition", clue: "surface_wear", confidence: 54, description: "Top surface shows multiple scratches, scuffs, and worn areas consistent with decades of use as a writing/work surface. Finish is significantly thinned or absent in high-contact areas." },
    { type: "structure", clue: "vertical_supports", confidence: 82, description: "Four heavy square legs visible; each side has an additional vertical slat/divider between the legs creating the shelf bays — characteristic Mission library table construction." },
    { type: "structure", clue: "open_shelving", confidence: 82, description: "Two shelf tiers on each side pedestal visible from the side view; shelves appear to be single solid boards resting in dadoes or on shelf rails between the legs." },
    { type: "construction", clue: "butt_edge_glued", confidence: 82, description: "Top surface shows a visible glue seam running longitudinally, indicating the top is composed of at least two edge-glued boards rather than a single slab." },
    { type: "style", clue: "no_applied_ornament", confidence: 52, description: "No carved decoration, applied moldings, inlay, or decorative hardware visible anywhere on the piece; purely rectilinear and structural in appearance — consistent with Mission/Arts & Crafts aesthetic." },
    { type: "function", clue: "writing_surface", confidence: 70, description: "Flat horizontal top at desk height with a locking drawer below; form is consistent with a library table or writing desk intended for seated use." },
    { type: "form", clue: "secondary_surface", confidence: 68, description: "Multiple open shelf surfaces below the main writing top on both side pedestals provide secondary storage/display surfaces." },
    { type: "construction", clue: "drop_front_desk", confidence: 84, description: "Drop-front writing surface is visible." },
    { type: "form", clue: "pedestal_column", confidence: 84, description: "Single-column pedestal form is visible." },
    { type: "materials", clue: "golden_oak_structural_pattern", confidence: 82, description: "Oak primary wood, flat-sawn or quarter-sawn oak grain, multiple-drawer case, and factory-era hardware (round wood knobs / lock escutcheons / porcelain casters) with no hand-cut joinery indicate Golden Oak Era factory production (c. 1890–1915 peak)." },
  ],
  asSeen: {
    formId: "Secretary desk / drop-front desk",
    display: "Arts and Crafts / Mission / Craftsman Secretary desk / drop-front desk (also commonly called: Secretary desk, Secretary bookcase)",
    finalStyleKind: "original_period",
    dateRange: "c. 1900–1920",
    dateFloor: 1900,
    dateCeiling: 1920,
    confidence: "Moderate",
  },
};

const colonial_revival_william_mary_drop_front_secretary_misid_grandmillennial_future_date: ScanFixture = {
  label: "colonial_revival_william_mary_drop_front_secretary_misid_grandmillennial_future_date",
  note: "AMERICAN COLONIAL REVIVAL / WILLIAM AND MARY REVIVAL DROP-FRONT SECRETARY DESK ON STAND (c. 1910-1935 factory production), turned baluster legs + shaped scrolled stretcher + applied diamond-carved drop-front panel with cast iron decorative boss + interior prospect-box cabinet flanked by turned spindle columns + plywood back panel + wire nails + walnut-stained primary wood + factory case construction. Engine reported as 'NEW TRADITIONAL / GRANDMILLENNIAL COLONIAL Secretary desk / drop-front desk, c. 1990-2100, HIGH confidence, kind=revival_wave.' SECOND LOGICALLY-IMPOSSIBLE DATE specimen (after S052 Art Deco dresser): engine projected the date INTO YEAR 2100 (74 years past current date 2026-06-04). Multiple severe failures stacked: (1) DATE PROJECTED INTO THE FUTURE — frame_floor=1990 frame_ceiling=2100. Year 2100 is 74 years past the current real-world date. Engine literally produced a date range that EXTENDS INTO THE FUTURE. This is a NEW logical-impossibility specimen joining S052 (Art Deco vocabulary post-1870 reproduction). Joint pattern: engine produces date ranges that cannot exist in reality. n=2 specimens, ripe to scope. (2) HARD-NEGATIVE FLOOR CLAMP CODE BUG — engine reasoning literally says 'Engine reasoning: 2 specific evidence layers converge on 1870-1990; hard-negative post-floor evidence clamps the floor to 1990.' But plywood_structural HARD NEGATIVE dateHint is c. 1905-1930 (per the engine's own canonical guidance noted in S040 and confirmed in this trace). Where did 1990 come from? plywood_structural should clamp the FLOOR to ~1905-1930, not 1990. Possible code bug: the hard-negative clamp logic is reading the convergence-zone CEILING (1990) instead of the dateHint floor. Or the engine is using the style_wave 1990-null from the Grandmillennial Colonial revival wave detection as the hard-negative floor instead of the plywood dateHint. Either way the math is wrong by ~60-85 years. (3) M11 LATE-REVIVAL-WAVE-ANCHORING EXTREME — engine selected the 'New Traditional / Grandmillennial Colonial' revival wave (c. 1990-null) for a c. 1910-1935 piece. 'Grandmillennial' is a 2019-2020 retail/Instagram interior-design movement term — an Instagram-era aesthetic, applied here to a piece that PREDATES the Grandmillennial movement by 80+ years. Same wave-anchoring shape as S015 Gothic Revival 1900-1910 and S018 1970s Deco Revival 1970-1985, but anchored to a FUTURE-leaning wave (1990-null with null ceiling defaulting to 2100). Engine has the style_revival_wave_new_traditional_grandmillennial_colonial entry in canonical — that's itself a curious authoring choice given Grandmillennial isn't a historical revival, it's a contemporary decorating trend. (4) M11 CLUE-KEY-SOURCED ATTRIBUTION (10TH CLEAN SPECIMEN) — Colonial Revival attributed conf 0.82 from matched_terms=['colonial','revival']. Both tokens in colonial_revival_style_cues clue KEY. CLEAN clue-key-sourced specimen — joins S029/S033/S043/S046/S047/S049/S051/S052/S053 as 10th clean clue-key-sourced M11 specimen. CORRECT primary attribution (the piece IS Colonial Revival, c. 1910-1935 production). The wave-anchoring catastrophe is downstream of the attribution which itself is right. (5) HIGH CONFIDENCE CAP ON FUTURE-PROJECTED DATE — most severe confidence-cap-decoupling specimen in the corpus. User sees HIGH (85%) confidence on a piece dated through year 2100. (6) FORM CORRECT — form_secretary_desk via drop_front_desk wt 0.98 + pigeonholes wt 0.92 + cabinet_form 0.81. drop_front_desk fires CORRECTLY here (genuine drop-front secretary with actual pigeonhole interior) — CONTRAST with S039/S048/S053 where drop_front_desk was M6 FP on flat-top pieces. Confirms drop_front_desk is genuine ~50% of the time, FP ~50% of the time, description-dependent. drop_front_desk CLUE_LIBRARY semantic is actually fine; the M6 firings are LLM perception drift where the clue is emitted on pieces without an actual drop-front. (7) PHASE 0 PART A NEGATIVE control — no Phase 0 Part A direct-form clues fire on this scan (no rocker/settee/Windsor/chest/bistro/china cabinet/dressing-table/peacock/milking stool). (8) M0 spindle synthesis fires on real spindles — spindle_back conf 78 + spindle_gallery conf 70 fire because the interior has 'turned spindle columns flanking the central cabinet.' Genuine spindle observation this time, not synthesis pathology. Did NOT drive Windsor form selection because drop_front_desk + cabinet_form dominated. (9) golden_oak_structural_pattern fires at conf 82 wt 0.66 [materials] with description matching Golden Oak Era factory production. Same correct-anchor behavior as S053. (10) wave detection EMITTED ONE UNPARSEABLE WAVE ('?') and reconciliation interpreted it as the Grandmillennial Colonial 1990+ wave. Wave detector noise pattern continues — multiple prior scans showed unparseable '?' waves contributing to wrong attributions. (11) Resale valuation $109-$277 standard marketplace — moderately undervalued for a Colonial Revival William & Mary Revival secretary desk on stand (typical market $300-800). Form was right but date in 2100 compresses valuation pricing logic. (12) M5 INVERTED-RECONCILIATION sibling (S052) — both pieces produce LOGICALLY IMPOSSIBLE dates: S052 'reproduction' classification claiming Art Deco vocabulary was reproduced BEFORE Art Deco existed; S054 projects date into the FUTURE. Pattern: engine reconciliation generates incoherent date claims rather than recognizing internal contradictions and revising. Net: most severe date-attribution failure in the corpus. Form correct, style attribution correct (clue-key-sourced 10th clean specimen), but revival-wave reconciliation produced a future-projected date (1990-2100) with HIGH confidence cap. The hard-negative clamp logic appears to have a code bug — clamping to 1990 instead of the plywood_structural dateHint c. 1905-1930. New tally entry: LOGICALLY-IMPOSSIBLE-DATE (S052 + S054) ripe to scope.",
  perception: minimalPerception,
  intake: { analysis_mode: "full_analysis" },
  observations: [
    { type: "form", clue: "drop_front_desk", confidence: 68, description: "The upper case has a vertical front panel that hinges down to a horizontal writing surface, characteristic of a drop-front secretary desk. The panel is shown both closed (overall_front) and open (overall_side), confirming the drop-front mechanism." },
    { type: "form", clue: "pigeonholes", confidence: 68, description: "Interior of the drop-front case reveals multiple vertical letter slots/pigeonholes arranged across the full width of the case interior, with a central small cabinet unit flanked by additional slots. Classic secretary desk interior organization." },
    { type: "form", clue: "writing_surface", confidence: 68, description: "The drop-front panel, when lowered, creates a flat writing surface. The interior face of the panel shows a molded rectangular panel inset, consistent with a writing surface. Visible in the open-desk image." },
    { type: "form", clue: "drawer_present", confidence: 68, description: "A single drawer is visible below the drop-front case, pulled partially open in the overall_front image. The drawer front has applied carved scrollwork decoration." },
    { type: "structure", clue: "turned_legs", confidence: 82, description: "Four turned legs support the case, visible in the overall_front and back images. The turnings show baluster-form profiles consistent with William & Mary or Colonial Revival style." },
    { type: "structure", clue: "stretcher_base", confidence: 82, description: "Curved/shaped stretchers connect the turned legs at a low level, visible in the overall_front and back images. The stretchers have a shaped/scrolled profile with a central carved accent." },
    { type: "style", clue: "colonial_revival_style_cues", confidence: 52, description: "The combination of turned legs, shaped stretchers, drop-front secretary form, applied carved diamond panel on the drop front, beaded molding, and interior turned spindle columns flanking the central cabinet all suggest Colonial Revival design vocabulary, consistent with American production c. 1900–1935." },
    { type: "style", clue: "william_and_mary_influence", confidence: 52, description: "The turned baluster legs, shaped stretchers, and overall case-on-stand form echo William & Mary design vocabulary, though the construction evidence (plywood back) suggests this is a Colonial Revival interpretation rather than a period piece." },
    { type: "hardware", clue: "lock_escutcheons", confidence: 62, description: "A keyhole escutcheon is visible on the drop-front panel in the overall_front image. A hardware_closeup shows a small oval/ring-form escutcheon with a keyhole opening, darkened with age/patina. Consistent with a half-mortise lock behind the drop front." },
    { type: "hardware", clue: "cast_decorative_boss", confidence: 62, description: "A circular cast metal decorative boss is centered on the applied diamond-shaped carved panel on the drop front. The hardware_closeup shows an acanthus/foliate face mask or floral motif in dark oxidized metal (likely cast iron or spelter), with fine detail casting. This is a decorative center element, not a functional pull." },
    { type: "hardware", clue: "butt_hinge", confidence: 62, description: "Brass butt hinges are visible at the lower edge of the drop-front panel where it meets the case, visible in the open-desk image (overall_side). Small brass hinges also visible on the interior cabinet door in the joinery_closeup." },
    { type: "construction", clue: "plywood_structural", confidence: 90, description: "The back panel of the case, visible in the back image, shows a large plywood sheet with visible laminated grain pattern and wavy rotary-cut veneer face. Multiple small wire nails/screws attach it to the case. This is structural plywood used as the case back, indicating post-1920 construction and most likely post-1930." },
    { type: "construction", clue: "wire_nail", confidence: 82, description: "Small round-shank wire nails are visible attaching the plywood back panel to the case frame, seen in the back image. Consistent with post-1890 factory production." },
    { type: "materials", clue: "walnut_primary_wood", confidence: 45, description: "The show surfaces of the case, drop front, and legs display a warm dark brown wood with subtle ribbon-like grain and fine texture consistent with walnut or a walnut-stained hardwood." },
    { type: "materials", clue: "secondary_wood_oak_or_poplar", confidence: 72, description: "The drawer interior visible in the joinery_closeup shows lighter-colored wood with open grain on the drawer bottom, consistent with oak or a similar secondary wood." },
    { type: "construction", clue: "drawer_construction_visible", confidence: 45, description: "The lower drawer is shown open. The drawer bottom appears to be a solid wood panel with visible grain. Construction appears to be simple butt or rabbet joinery rather than hand-cut dovetails." },
    { type: "condition", clue: "ink_spill_damage", confidence: 45, description: "The joinery_closeup showing the interior floor of the case reveals significant ink or chemical spill damage — dark staining, peeling/lifting finish, and what appears to be dried ink residue." },
    { type: "condition", clue: "surface_wear_scratches", confidence: 54, description: "The drop-front panel and case surfaces show numerous fine scratches and surface wear consistent with age and use." },
    { type: "condition", clue: "shellac_intact", confidence: 45, description: "The surface finish on the show wood appears to be an aged shellac or early lacquer — warm amber tone, worn at edges and high-contact areas." },
    { type: "visible_text", clue: "chalk_mark_119", confidence: 45, description: "Chalk or crayon marks reading '119' (possibly a price or inventory number) are visible on the back panel of the case in the back image. Likely a later dealer or storage mark." },
    { type: "style", clue: "pen_tray_gallery", confidence: 52, description: "The top of the case has a gallery rail with multiple rounded cutout openings, consistent with a pen/pencil tray or stationery gallery. Common on Colonial Revival secretary desks of the 1910s–1930s." },
    { type: "style", clue: "applied_carved_panel_drop_front", confidence: 52, description: "The drop-front panel features an applied diamond-shaped carved/shaped panel with scalloped edges and small bun feet at the four cardinal points, centered with the cast decorative boss. Characteristic of Colonial Revival and William & Mary Revival furniture of the 1910s–1930s." },
    { type: "structure", clue: "interior_cabinet_with_door", confidence: 82, description: "The interior of the drop-front case contains a small central cabinet unit with a hinged door, flanked by turned spindle columns, with an arched apron below and a small drawer at the bottom. Classic secretary interior 'prospect box' or central cabinet feature." },
    { type: "construction", clue: "interior_pigeonhole_construction", confidence: 80, description: "The pigeonhole dividers appear to be thin wood boards set into dadoes or simply glued/nailed into position. Factory-made with consistent spacing." },
    { type: "construction", clue: "factory_case_construction", confidence: 78, description: "The combination of plywood back panel, wire nails, consistent machine-cut interior dividers, and overall construction approach suggests factory production. Consistent with American factory furniture production c. 1910–1940." },
    { type: "hardware", clue: "half_mortise_lock", confidence: 62, description: "The keyhole on the drop-front panel suggests a half-mortise lock mechanism." },
    { type: "condition", clue: "dust_accumulation", confidence: 54, description: "Significant dust accumulation visible throughout the interior pigeonholes, indicating extended storage." },
    { type: "materials", clue: "flat_sawn_grain_back_panel", confidence: 84, description: "The back panel shows a rotary-cut or flat-sawn plywood face with wavy cathedral grain pattern." },
    { type: "materials", clue: "sheet_back_panel", confidence: 50, description: "plywood back panel visible" },
    { type: "construction", clue: "door_present", confidence: 50, description: "small brass hinges on interior cabinet door" },
    { type: "structure", clue: "spindle_back", confidence: 78, description: "Spindles are visible in the back or side rail." },
    { type: "style", clue: "spindle_gallery", confidence: 70, description: "Spindle gallery or rail detail is visible." },
    { type: "form", clue: "cabinet_form", confidence: 68, description: "Cabinet or cupboard form is visible." },
    { type: "materials", clue: "golden_oak_structural_pattern", confidence: 82, description: "Oak primary wood, flat-sawn or quarter-sawn oak grain, multiple-drawer case, and factory-era hardware indicate Golden Oak Era factory production (c. 1890–1915 peak)." },
  ],
  asSeen: {
    formId: "Secretary desk / drop-front desk",
    display: "New Traditional / Grandmillennial Colonial Secretary desk / drop-front desk (also commonly called: Secretary desk, Secretary bookcase)",
    finalStyleKind: "revival_wave",
    dateRange: "c. 1990–2100",
    dateFloor: 1990,
    dateCeiling: 2100,
    confidence: "Moderate",
  },
};

export const SESSION_SCANS: ScanFixture[] = [ladderback, victorianTrunk, sears1960sDresser, victorian_windsor_rocker, commode_close_stool, art_deco_candelabrum, renaissance_revival_sgabello, china_import_cedar_chest, swivit_space_age_pedestal_chair, colonial_revival_oak_bowfront_chest, vernacular_painted_milking_stool, golden_oak_curved_glass_china_cabinet, logan_1914_tall_case_clock, oak_swivel_bankers_office_chair, jacobean_revival_tall_case_clock, midcentury_craft_panel_back_rocker, william_mary_burl_escritoire_on_stand, peacock_emmanuelle_rattan_chair, woodard_wrought_iron_patio_chair, barley_twist_rush_seat_rocker, biedermeier_flame_walnut_secretary, phoenix_chair_co_windsor_rocker, rococo_revival_parlor_armchair, hollywood_regency_cane_wing_chair, victorian_barrel_back_parlor_chair, eastlake_oak_settee, rococo_renaissance_carved_settee, porter_balloon_canopy_chair, renaissance_revival_tufted_armchair, victorian_platform_rocker_armchair, modern_louis_xvi_repro_lounge_chair, eastlake_renaissance_revival_rocker, wicker_rattan_barrel_lounge_chair, french_bistro_iron_faux_stone_table, painted_gilt_rococo_revival_settee, victorian_spindle_gallery_parlor_rocker, hollywood_regency_rococo_lounge_chair, eastlake_spindle_gallery_parlor_settee, midcentury_neoclassical_cane_lounge_chair, art_deco_waterfall_vanity, knight_garrard_french_provincial_radio_phonograph_console, us_stamping_commode_chamber_pot_rescan, federal_colonial_revival_mahogany_music_stand, victorian_queen_anne_mahogany_washstand, globe_wernicke_sectional_barrister_bookcase, gm_radio_dayton_queen_anne_console_phonograph, regina_music_box_disc_floor_cabinet, colonial_revival_queen_anne_oak_corner_armchair, walnut_workshop_harpsichord_misid_music_stand, bassett_colonial_revival_upholstered_rocker_misid_windsor, jacobean_revival_oak_tobacco_smoking_stand, eastlake_modern_gothic_parlor_lounge_chair, ok_brand_automatic_file_index_sectional_bookcase, quartersawn_oak_office_bankers_swivel_tilt_chair, golden_oak_bankers_office_swivel_chair_acanthus_crest, aesthetic_movement_walnut_drop_leaf_parlor_table, aesthetic_movement_moorish_revival_pierced_panel_armchair, victorian_bent_iron_sling_upholstered_rocking_chair, mcm_atomic_age_fiberglass_bullet_planter_tripod, mid_century_lime_vinyl_telephone_gossip_bench, space_age_cone_chair_panton_derivative_misid_bench, sligh_grand_rapids_colonial_revival_writing_console_table_misid_writing_box, mid_century_molded_plywood_swivel_office_lounge_chair_contrast_case, colonial_revival_sheraton_curly_maple_kneehole_vanity_desk, victorian_golden_oak_platform_rocker_reupholstered, empire_revival_cabriole_clawfoot_rocker_with_plank_seat, goldstrom_bros_baltimore_marble_top_victorian_occasional_pedestal_table, victorian_curlicue_wicker_rocker_misid_as_loom, victorian_renaissance_revival_oak_library_table_lion_brackets_contrast_case, pedestal_mounted_glass_display_case_curio_vitrine_oak_revival, colonial_revival_edwardian_mahogany_china_cabinet_secretary_desk_two_piece_set_misid_reception_desk, interwar_traditional_william_mary_revival_carved_armchair_contrast_case, vernacular_pine_lift_lid_storage_chest_misid_slant_front_desk, mission_arts_crafts_oak_armchair_or_rocker_misid_windsor_chair, art_deco_depression_era_walnut_waterfall_dresser_inverted_reconciliation, mission_arts_crafts_oak_library_writing_table_misid_secretary_drop_front, colonial_revival_william_mary_drop_front_secretary_misid_grandmillennial_future_date];
