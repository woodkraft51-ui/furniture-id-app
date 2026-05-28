// ── Clue Routing Map — Task B authoring ─────────────────────────────────
//
// Maps each clue_id observed in scans to its canonical attribution:
//   - which `form_id` does this clue suggest the object IS (or `null` if it
//     doesn't classify the object)?
//   - which `style_family_id` does this clue attribute (or `null` if it
//     doesn't carry a style signal)?
//
// PURPOSE
// This file is the "translator" layer between the LLM's free-text clue
// vocabulary (525+ unique clues seen across the corpus) and the engine's
// canonical taxonomy. Before this map, both form scoring (scoreForms in
// engine.ts) and style attribution (engineStyleEvaluator.ts) relied on
// bare-substring matching of clue names + descriptions — which caused the
// Cluster A "trunk on clock" / "renaissance revival parlor → Parlor Table"
// failures and the Cluster B Louis XVI/French-Provincial conflation. Task A
// closed Cluster B at the style layer via per-family distinctive/shared
// phrase gates; Task B closes Cluster A by replacing substring guesswork
// with explicit per-clue routings authored here.
//
// STATUS
// Authored incrementally batch by batch with owner sign-off per batch.
// Currently NOT IMPORTED ANYWHERE — defining it doesn't change engine
// behavior. Consumption will be wired in `scoreForms` and
// `engineStyleEvaluator.attributeStyle` once authoring coverage is high
// enough that flipping the default from "substring fallback" to "explicit
// lookup" is safe.
//
// GUARDRAILS (owner-authored 2026-05-28)
//   1. Style routing only when the clue clearly names a recognized style
//      family or uses a distinctive style token. Generic words like
//      "french", "provincial", "parlor", "trunk", "cabinet", "table",
//      "revival", "carved", "turned", "ornate" do NOT route by themselves.
//   2. Context clues stay null/null by default unless they clearly contain
//      a specific style-family signal.
//   3. Form routing only when the clue clearly identifies the OBJECT form,
//      not an anatomical part. "trunk of a clock" must not route to Trunk;
//      "parlor" must not route to Parlor table. Anatomy/part clues are null.
//   4. Label / visible_text clues stay null/null for form and style unless a
//      separate maker/model layer is added. Labels may carry maker/date/
//      product-line signal but should not directly force form or style.
//
// AUTHORING METHOD
// Each batch I propose routings per clue based on heuristics (name + first
// description example); owner confirms or overrides each. Decisions are
// added here in order, grouped by batch with the originating category.
// Explicit `null` entries are preserved (not omitted) so future authors can
// distinguish "considered and rejected" from "not yet authored."

export type ClueRouting = {
  /** Canonical form_id (e.g., "form_armchair") this clue routes to, or null. */
  form?: string | null;
  /** Canonical style_family_id (e.g., "style_family_colonial_revival"), or null. */
  style?: string | null;
  /** Optional human note (subtype hint, variant, reasoning). */
  note?: string;
};

export const CLUE_ROUTING: Record<string, ClueRouting> = {
  // ── Batch 1 — form clues (35 total, locked 2026-05-28) ──────────────────
  // 13 route to a form. The rest are anatomy/feature/generic per Guardrail 3.

  armchair_form:        { form: "form_armchair" },
  lounge_chair_form:    { form: "form_lounge_chair" },
  rocking_chair_form:   { form: "form_rocking_chair" },
  wingback_form:        { form: "form_wing_chair" },
  dome_top_trunk:       { form: "form_trunk", note: "camelback / dome-top subtype" },
  candelabra_form:      { form: "form_candelabrum" },
  stool_form:           { form: "form_stool" },
  clock_case_form:      { form: "form_tall_case_clock" },
  settee_two_seat_form: { form: "form_settee" },
  club_chair_form:      { form: "form_lounge_chair", note: "club-chair variant per LLM canonical note (form_lounge_chair / subtype_lounge_club)" },
  slant_front:          { form: "form_slant_front_desk", note: "anatomy but strongly form-defining when context is a writing case/desk" },
  drop_front_desk:      { form: "form_fall_front_desk", note: "taxonomy-faithful: 'drop-front desk' lives as a subtype under form_fall_front_desk, not under secretary" },
  platform_rocker_base: { form: "form_rocking_chair", note: "platform-rocker variant; no canonical form_platform_rocker exists yet" },

  // Anatomy / feature / too-generic — explicit null per Guardrail 3.
  seating_surface:        { form: null },
  seating_present:        { form: null },
  backrest_present:       { form: null },
  drawer_present:         { form: null },
  multiple_drawer_case:   { form: null, note: "feature, not a form; could be dresser, lowboy, sideboard; supports case-piece scoring without forcing a form" },
  cabinet_form:           { form: null, note: "'cabinet' too generic per Guardrail 1; revisit when canonical cabinet subtypes are authored" },
  lift_lid:               { form: null, note: "could be trunk, blanket chest, commode, sewing box" },
  spindle_back:           { form: null, note: "Windsor / side chair / settee / parlor rocker — too varied" },
  pedestal_column:        { form: null, note: "table / chair / lamp — too varied" },
  door_present:           { form: null },
  pigeonholes:            { form: null, note: "could be secretary, desk, vanity" },
  flat_surface:           { form: null, note: "table / desk / vanity / sideboard — too generic" },
  cedar_lining:           { form: null, note: "material; suggests chest but only loosely" },
  open_shelving:          { form: null, note: "cabinet / étagère / bookcase" },
  cabriole_leg:           { form: null, note: "leg style, not a form" },
  floor_standing_height:  { form: null },
  secondary_surface:      { form: null, note: "meta — describes presence/absence" },
  multiple_chairs_present:{ form: null, note: "meta-context — only tells us it's part of a set" },
  vertical_supports:      { form: null, note: "legs/posts" },
  barrel_back_form:       { form: null, note: "back shape, not object form; could be club, wing, porter, banker's" },
  writing_surface:        { form: null, note: "desk / vanity / secretary — ambiguous" },
  dome_canopy_back:       { form: null, note: "anatomy of porter's chair specifically; parked for review — see PARKING_LOT.md re Porter chair subtype taxonomy" },

  // ── Batch 2 — structure clues (50 total, locked 2026-05-28) ─────────────
  // 1 routes (the named-pattern detector). 49 null per Guardrail 3.

  // Named structural pattern (style + form both encoded in the clue name).
  // Treated like the existing structural-pattern detectors in
  // STRUCTURAL_PATTERN_FAMILY (engineStyleEvaluator.ts:182).
  colonial_georgian_revival_upholstered_armchair_pattern: {
    form: "form_armchair",
    style: "style_family_colonial_revival",
    note: "named structural pattern; explicit form+style by design",
  },

  // Anatomy / structural features — explicit null.
  // (Note: backrest_present, spindle_back, pedestal_column, vertical_supports
  // appear in both form and structure observation categories; routing is
  // per-clue not per-(clue,type), so they share the entries above in batch 1.)
  stretchers:                     { form: null },
  barrel_tub_back:                { form: null },
  round_tenon:                    { form: null },
  tapered_leg:                    { form: null },
  metal_frame:                    { form: null },
  rocker_runners:                 { form: null },
  cane_panels:                    { form: null },
  woven_body:                     { form: null },
  stretcher_system:               { form: null },
  back_posts_continuous:          { form: null },
  turned_front_legs:              { form: null },
  shaped_apron:                   { form: null },
  corner_block_reinforcement:     { form: null },
  turned_leg_detail:              { form: null },
  dished_seat:                    { form: null },
  solid_wood_construction:        { form: null },
  splayed_legs:                   { form: null },
  x_stretcher_pattern:            { form: null },
  bun_feet:                       { form: null },
  turned_corner_posts_with_finials: { form: null },
  octagonal_base:                 { form: null },
  frame_and_panel_sides:          { form: null },
  bent_molded_plywood:            { form: null },
  vertical_supports_legs:         { form: null },
  plank_legs:                     { form: null },
  splayed_leg_angle:              { form: null },
  cutout_arch_between_legs:       { form: null },
  four_leg_configuration:         { form: null },
  three_section_case:             { form: null, note: "highly tall-case-clock-associated but anatomy; clock_case_form already routes form_tall_case_clock" },
  rocker_blades:                  { form: null },
  finial_posts:                   { form: null },
  rush_back_panel:                { form: null },
  rocker_blade_flat_sawn:         { form: null },
  bracket_feet:                   { form: null },
  turned_legs:                    { form: null },
  rear_leg_form:                  { form: null },
  rattan_frame:                   { form: null, note: "fires on iron tables per corpus diagnosis Cluster A — strict null prevents misroute" },
  turned_center_spindle:          { form: null },
  frame_members:                  { form: null },
  no_spring_seat:                 { form: null },
  curved_arms:                    { form: null },
  rocker_runner_profile:          { form: null },
  legs:                           { form: null },
  kneehole_opening:               { form: null, note: "strongly form-relevant (kneehole desk / vanity / dressing table) but ambiguous between them; supports scoring without forcing" },
  raised_back_gallery:            { form: null },

  // ── Batch 3 — function clues (8 total, locked 2026-05-28) ───────────────
  // 2 route, 6 null.

  commode_chamber_pot_cabinet: { form: "form_commode", note: "clue name and description both unambiguously name a commode / close stool" },
  rocking_chair:               { form: "form_rocking_chair" },

  sitting:           { form: null, note: "generic function; any seating form" },
  // writing_surface, multiple_drawer_case, style_cues already null above
  // (function-category appearances of clues authored in earlier batches)
  candle_holding:    { form: null, note: "function 'holds candles' is ambiguous between candelabrum / candle_stand / candlestick / sconce — supports function interpretation without forcing form" },
  display_or_dining: { form: null, note: "literally names two ambiguous forms (display table / dining table / bistro / hall)" },

  // ── Batch 4a — style clues, top 30 by frequency (locked 2026-05-28) ─────
  // 4 route to a family. 25 null per Guardrail 1 (generic / era / anatomy
  // words don't route by themselves). Style clues are the largest category
  // (153 total) and being split into 4a–4d sub-batches.
  // Parsing artifact: the empty-string clue id ("") seen 11× in 4 fixtures is
  // the upstream M17 keyless-observation bug, NOT an authoring decision —
  // explicitly excluded from this map.

  // Route to a family — clue clearly names a recognized style family per Guardrail 1.
  barley_twist: {
    style: "style_family_tudor_revival",
    note: "Tudor Revival here is the COMBINED Tudor/Jacobean/Elizabethan Revival family per styleFamilies.ts; W&M is separate and unaffected (no barley twist in its distinctive_tokens)",
  },
  eastlake_hardware: {
    style: "style_family_eastlake",
    note: "negation handled separately by descriptionNegatesClue when prose self-negates",
  },
  country_provincial_chippendale_influence: {
    style: "style_family_chippendale",
    note: "'chippendale' is the distinctive token; 'country/provincial/influence' are generic and do not route per Guardrail 1",
  },
  art_deco_style_cues: {
    style: "style_family_art_deco",
  },

  // Null — anatomy, era-only ('victorian'), or generic vocabulary per Guardrail 1.
  spindle_gallery:               { form: null, style: null, note: "anatomy; cross-domain (authored for shelf clocks, fires on chairs/settees — see corpus Cluster E)" },
  carved_crest_rail:             { form: null, style: null },
  turned_spindle_gallery:        { form: null, style: null, note: "anatomy; cross-domain (clock vocabulary firing on chair forms)" },
  scrolled_side_corbels:         { form: null, style: null, note: "anatomy; cross-domain (clock vocabulary firing on settees)" },
  victorian_curlicue_wicker:     { form: null, style: null, note: "'victorian' is era language per Guardrail 1; no wicker family in taxonomy" },
  serpentine_crest_rail:         { form: null, style: null },
  paw_feet:                      { form: null, style: null, note: "anatomy; appears across Renaissance Revival, Baroque, American Empire" },
  mid_century_streamlined_wicker:{ form: null, style: null, note: "'mid-century' alone is era signal not distinctive; wicker not a family in taxonomy" },
  bar_harbor_style_wicker:       { form: null, style: null, note: "wicker tradition; no wicker family in taxonomy" },
  tufted_upholstery:             { form: null, style: null },
  pierced_splat_ladder_back:     { form: null, style: null },
  no_armrest:                    { form: null, style: null },
  ladder_back_three_slat:        { form: null, style: null },
  dome_top_victorian_trunk:      { form: null, style: null, note: "'victorian' is era per Guardrail 1" },
  applied_decoration:            { form: null, style: null },
  bobbin_turned_spindles:        { form: null, style: null },
  bobbin_turned_legs:            { form: null, style: null },
  bobbin_turned_stretchers:      { form: null, style: null },
  scrolled_crest_ends:           { form: null, style: null },
  victorian_windsor_rocker_style:{ form: null, style: null, note: "'victorian' era + 'windsor' is a form; no style family signal" },
  foliate_carved_crest:          { form: null, style: null },
  victorian_utilitarian_form:    { form: null, style: null, note: "'victorian' era; 'utilitarian_form' generic" },
  fluted_spherical_knop:         { form: null, style: null, note: "appears across Art Deco, Arts & Crafts, Scandinavian Modern — multi-family overlap" },

  // ── Batch 4b — style clues, positions 31-70 (locked 2026-05-28) ─────────
  // 6 route to a family. 33 null. 1 duplicate (door_present) skipped.

  // Route to a family — clue name contains a distinctive token per Guardrail 1.
  renaissance_revival_style: {
    style: "style_family_renaissance_revival",
    note: "'renaissance revival' is in distinctive_tokens",
  },
  colonial_revival_influence: {
    style: "style_family_colonial_revival",
    note: "'colonial revival' distinctive; 'influence' generic per Guardrail 1",
  },
  colonial_revival_style_cue: {
    style: "style_family_colonial_revival",
  },
  jacobean_revival_style: {
    style: "style_family_tudor_revival",
    note: "'jacobean revival' is in Tudor Revival's distinctive_tokens (combined Tudor/Jacobean/Elizabethan Revival family)",
  },
  william_and_mary_style: {
    style: "style_family_william_and_mary",
    note: "'william and mary' is distinctive",
  },
  design_influence_william_and_mary_continental: {
    style: "style_family_william_and_mary",
    note: "'william and mary' distinctive; 'design influence' / 'continental' generic per Guardrail 1",
  },

  // Null — anatomy / decoration motifs / multi-family vocabulary / era-only.
  swept_curved_arms:                  { form: null, style: null },
  five_arm_symmetry:                  { form: null, style: null },
  scandinavian_modern_design_influence:{ form: null, style: null, note: "'scandinavian' not in any family's distinctive_tokens; MCM has a 'Scandinavian-Influenced' wave but no distinctive token for it" },
  grotesque_mask_carving:             { form: null, style: null },
  urn_form_splat:                     { form: null, style: null },
  acanthus_carving:                   { form: null, style: null, note: "anatomy/decoration; appears across Renaissance Revival, Federal, American Empire" },
  gadrooning_egg_dart:                { form: null, style: null },
  oval_cartouche_medallion:           { form: null, style: null },
  fish_scale_imbrication_crest:       { form: null, style: null },
  sgabello_hall_chair_form:           { form: null, style: null, note: "Italian Renaissance form vocabulary but 'sgabello' not in any family's distinctive_tokens; sits in style category yet ends _form" },
  carving_depth_and_quality:          { form: null, style: null },
  bead_and_reel_border:               { form: null, style: null },
  tassel_carving:                     { form: null, style: null, note: "appears across Renaissance Revival and Baroque — multi-family" },
  fleur_de_lis_motif:                 { form: null, style: null, note: "heraldic motif; could be French neoclassical or many other traditions" },
  tapered_block_feet:                 { form: null, style: null },
  raised_panel_decoration:            { form: null, style: null },
  strapwork_scrollwork:               { form: null, style: null, note: "cross-family vocabulary (Jacobean, Tudor Revival, Renaissance Revival, Mannerist); routing to Jacobean alone would misroute on Italian Renaissance Revival pieces — keep shared until multi-family handling exists" },
  style_cue_space_age_pedestal:       { form: null, style: null, note: "'Space Age' not in any family's distinctive_tokens; straddles MCM and post-MCM" },
  teal_turquoise_color:               { form: null, style: null },
  patents_pending_mark:               { form: null, style: null, note: "label/mark, not style" },
  geometric_faceted_shell_back:       { form: null, style: null },
  maple_plain_minnesota_origin:       { form: null, style: null, note: "maker location, not style" },
  bow_front_case:                     { form: null, style: null },
  vernacular_country_primitive:       { form: null, style: null, note: "no vernacular/primitive family in taxonomy" },
  carved_decorative_panel:            { form: null, style: null },
  rope_molding:                       { form: null, style: null },
  broken_pediment_hood:               { form: null, style: null },
  brass_spandrel_ornaments:           { form: null, style: null },
  open_waist_design:                  { form: null, style: null },
  carved_hood_side_panel:             { form: null, style: null },
  no_arch_top_dial:                   { form: null, style: null },
  serpentine_stretcher:               { form: null, style: null, note: "'william and mary' context but not distinctive on its own" },
  peacock_fan_back_form:              { form: null, style: null, note: "mid-century imported wicker; no wicker family in taxonomy" },

  // ── Batch 4c — style clues, positions 71-110 (locked 2026-05-28) ────────
  // 7 route to a family. 32 null. 1 duplicate (barrel_back_form) skipped.

  // Route to a family — distinctive token in clue name per Guardrail 1.
  biedermeier_style_cues:       { style: "style_family_biedermeier" },
  colonial_revival_windsor:     { style: "style_family_colonial_revival" },
  rococo_revival_vocabulary:    { style: "style_family_rococo_revival" },
  rococo_revival_ornament:      { style: "style_family_rococo_revival" },
  renaissance_revival_ornament: { style: "style_family_renaissance_revival" },
  rococo_revival_style_cues:    { style: "style_family_rococo_revival" },
  renaissance_revival_crest:    { style: "style_family_renaissance_revival" },

  // Null — anatomy / decoration / era-only / multi-family.
  ring_loop_border:                    { form: null, style: null, note: "peacock chair decorative; no wicker family in taxonomy" },
  scrollwork_medallion:                { form: null, style: null },
  painted_metal_finish:                { form: null, style: null },
  floral_leaf_motif:                   { form: null, style: null },
  victorian_garden_furniture_influence:{ form: null, style: null, note: "'victorian' era + 'garden furniture' generic per Guardrail 1" },
  crest_rail_ornament:                 { form: null, style: null },
  arm_cartouche_oval:                  { form: null, style: null },
  turned_stretchers:                   { form: null, style: null },
  flat_paddle_arms:                    { form: null, style: null },
  back_post_finials:                   { form: null, style: null },
  chamfered_top_corners:               { form: null, style: null, note: "Biedermeier vocabulary in prose but clue name is anatomy; biedermeier_style_cues carries the routing" },
  rounded_cock_bead_rails:             { form: null, style: null, note: "Biedermeier/Empire vocabulary in prose but clue name is anatomy" },
  minimal_carved_ornament:             { form: null, style: null, note: "Biedermeier vocabulary in prose but clue name is generic" },
  windsor_rocker_form:                 { form: null, style: null, note: "'windsor' is a form, not a family" },
  central_splat_incised_motif:         { form: null, style: null },
  serpentine_arm:                      { form: null, style: null },
  oval_cartouche_back:                 { form: null, style: null },
  reeded_crest_rail:                   { form: null, style: null },
  pierced_splat:                       { form: null, style: null },
  victorian_edwardian_parlor_chair:    { form: null, style: null, note: "'victorian' / 'edwardian' era words; Edwardian not in our 28 families" },
  fan_feather_carving:                 { form: null, style: null, note: "Eastlake vocabulary in prose but clue name is generic; eastlake_hardware carries the Eastlake routing" },
  figural_carved_crest:                { form: null, style: null },
  grotesque_mask_arm_terminal:         { form: null, style: null },
  dragon_griffin_carving:              { form: null, style: null },
  heraldic_shield_cartouche:           { form: null, style: null },
  scrolled_arm_supports:               { form: null, style: null },
  acanthus_leaf_carving:               { form: null, style: null, note: "multi-family motif (Rococo Revival, Renaissance Revival, Federal, Empire)" },
  shell_crest_carving:                 { form: null, style: null, note: "Louis XV Rococo in prose but clue name is anatomy" },
  carved_serpentine_apron:             { form: null, style: null },
  porter_chair_form:                   { form: null, style: null, note: "consistent with dome_canopy_back null decision; Porter chair pending subtype authoring (see PARKING_LOT.md)" },
  incised_scroll_decoration:           { form: null, style: null },
  turned_arm_finials:                  { form: null, style: null },

  // ── Batch 4d — style clues, positions 111-153 (locked 2026-05-28) ───────
  // 8 route to a family. 35 null. Style clues authoring is now COMPLETE.

  // Route to a family.
  saber_leg_rear:               { style: "style_family_american_classical", note: "'saber leg' is in American Classical / Empire's distinctive_tokens" },
  rococo_revival_style:         { style: "style_family_rococo_revival" },
  style_cue_rococo_revival:     { style: "style_family_rococo_revival" },
  hollywood_regency_style_cue:  { style: "style_family_hollywood_regency", note: "'hollywood regency' is distinctive" },
  style_cue_art_deco:           { style: "style_family_art_deco", note: "'art deco' is distinctive" },
  empire_revival_influence:     {
    style: "style_family_american_classical",
    note: "'Empire Revival' is the wave name for Wave 2 of American Classical (Empire / Duncan Phyfe Revival); full phrase is specific enough to route even though 'empire' alone is shared",
  },
  louis_xv_revival_influence:   {
    style: "style_family_rococo_revival",
    note: "Cluster B correction case: Louis XV Revival is closely tied to Rococo Revival vocabulary. This dictionary-level route should be mirrored later by adding 'louis xv revival' (and possibly 'louis xv') to style_family_rococo_revival's distinctive_tokens — tracked in PARKING_LOT.md",
  },
  style_cue_waterfall_corners:  {
    style: "style_family_art_deco",
    note: "'waterfall corners' is more specific than the generic 'waterfall' shared token — recognizable Art Deco / waterfall moderne signature",
  },

  // Null — anatomy / generic / multi-family.
  shaped_apron_carved:                { form: null, style: null },
  victorian_parlor_chair:             { form: null, style: null, note: "'victorian' era + 'parlor chair' generic per Guardrail 1" },
  scrolled_volute_arm_bracket:        { form: null, style: null },
  claw_foot:                          { form: null, style: null },
  reeded_leg:                         { form: null, style: null },
  swept_wing_back:                    { form: null, style: null },
  victorian_platform_rocker_style:    { form: null, style: null, note: "'victorian' era + 'platform rocker' form" },
  scrolled_arm_volute:                { form: null, style: null },
  leaf_carved_crest_rail:             { form: null, style: null, note: "multi-family (Neoclassical, Regency, Colonial Revival)" },
  reeded_back_post:                   { form: null, style: null, note: "multi-family (Neoclassical, Regency, Federal Revival)" },
  carved_apron_seat_rail:             { form: null, style: null },
  carved_rosette_leg_top:             { form: null, style: null },
  tapered_carved_leg:                 { form: null, style: null, note: "multi-family (Neoclassical, Regency, Empire Revival)" },
  neoclassical_revival_style:         { form: null, style: null, note: "too broad; crosses Federal / American Classical / Louis XVI / Regency-derived / later revival waves — do not route alone" },
  open_arm_chair_form:                { form: null, style: null },
  wicker_weave_close:                 { form: null, style: null, note: "no wicker family in taxonomy" },
  wicker_weave_open:                  { form: null, style: null, note: "no wicker family in taxonomy" },
  wicker_weave_basket:                { form: null, style: null, note: "no wicker family in taxonomy" },
  scrollwork_ornament:                { form: null, style: null },
  french_bistro_garden_table_influence:{ form: null, style: null, note: "'french' / 'bistro' / 'garden' / 'influence' all generic per Guardrail 1" },
  carved_floral_crest:                { form: null, style: null },
  scrolled_arm_terminals:             { form: null, style: null, note: "multi-family (Louis XV / Rococo Revival)" },
  beaded_molding_frame:               { form: null, style: null },
  ball_finials:                       { form: null, style: null },
  victorian_parlor_rocker_form:       { form: null, style: null, note: "'victorian' era + form" },
  pierced_carved_crest:               { form: null, style: null },
  gadrooned_or_rope_twist_molding:    { form: null, style: null },
  carved_medallion_back:              { form: null, style: null, note: "Eastlake vocabulary in prose but clue name is generic; eastlake_hardware carries Eastlake routing" },
  fan_sunburst_carving:               { form: null, style: null, note: "Eastlake vocabulary in prose but clue name is generic" },
  arched_crest_rail:                  { form: null, style: null },
  carved_corner_block:                { form: null, style: null },
  fluted_legs:                        { form: null, style: null, note: "multi-family (Louis XVI, Federal, neoclassical revival)" },
  style_cue_reeded_pilasters:         { form: null, style: null, note: "multi-family (Art Deco, late Colonial Revival)" },
  style_cue_carved_scroll_corbels:    { form: null, style: null, note: "multi-family (Art Deco, late Empire Revival)" },
  style_cue_geometric_brass_inlay:    { form: null, style: null, note: "Art Deco vocabulary in prose but clue name is generic" },

  // ── Batch 5 — context / visible_text / construction_cues (locked 2026-05-28) ─
  // 5 clues across 3 small categories. 1 route (the Cluster B correction
  // case), 3 null, 1 duplicate skipped.

  // The canonical Cluster B correction.
  french_provincial_style: {
    style: "style_family_rococo_revival",
    note: "Cluster B correction case. CRITICAL DISTINCTION: the LOOSE TOKENS 'french' and 'provincial' must NOT route by themselves (they are shared/generic per Task A authoring + Guardrail 1). The EXPLICIT NAMED CLUE 'french_provincial_style' is a different thing — a named recognition clue for French Provincial vocabulary, which canonically lives in Rococo Revival Wave 3 ('French Provincial / Rococo Domestic Revival, 1920–1965'). Routing here is the original intent of the translator architecture. See PARKING_LOT.md re mirroring French Provincial back into Rococo Revival distinctive_tokens or wave-alias field after review.",
  },

  // Null per Guardrail 4 (labels in their own layer) and joinery anatomy.
  visible_text:     { form: null, style: null, note: "Guardrail 4 — label/text stays null pending separate maker/model layer" },
  maker_label:      { form: null, style: null, note: "Guardrail 4 — label stays null pending separate maker/model layer" },
  mortise_and_tenon:{ form: null, style: null, note: "joinery anatomy; dates construction but doesn't classify form or style" },
};
