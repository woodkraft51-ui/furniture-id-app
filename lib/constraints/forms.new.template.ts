/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  NEW-FORMS AUTHORING TEMPLATE — Batch 2  (deviation-list closers)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Same rules as Batch 1:
 *  1. Fill every field marked  ✍️ AUTHOR. Leave the pre-filled structural fields
 *     (id, category, parent_category, family_id, spatial_behavior_id, authority
 *     numbers) alone — they're matched to the engine's pattern, verified to not
 *     collide, and the cousin/spatial ids are confirmed real.
 *  2. You can't break the engine here — this file is NOT imported. The compiler
 *     just validates SHAPE. Run `npm run typecheck`; green = structurally valid.
 *  3. When done, I move these into FORMS in forms.ts, regenerate vocab, and wire
 *     a gated scoreForms route per form, route-by-route with a corpus diff each.
 *
 *  PRIORITY: #1 (music box) first — it closes the only remaining *catastrophe*
 *  (regina disc music box currently reads "Brass bed"). #2–#4 are chair
 *  refinements (those pieces currently read "Upholstered armchair").
 *
 *  FIELD GUIDE: see form_pump_organ_cabinet / form_washstand in forms.ts for live
 *  examples. distinguishing_features = structural "how you know it's THIS form";
 *  cousin_form_contrasts = one sentence per near-neighbor (ids named in comments);
 *  subtypes = "same form, different fitting"; anti_classification_guidance only if
 *  there's a crisp date boundary (else delete it).
 */

import type { FormEntry } from "./forms";

export const NEW_FORMS_DRAFT_2: FormEntry[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // 1) MUSIC BOX  ★ PRIORITY ★ — closes regina (currently mis-routed to "Brass bed")
  //    Mechanical disc/cylinder music machine in a case (Regina, Polyphon, Symphonion…).
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "form_music_box",
    category: "form",
    name: "music box",
    parent_category: "musical_mechanical_form",
    family_id: "family_musical_mechanical",
    spatial_behavior_id: "spatial_musical_instrument_cabinets",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "needs_review",

    date_floor: 0, // ✍️ AUTHOR (cylinder boxes 18th–19th c.; American disc boxes c. 1890–1920)
    date_ceiling: 0, // ✍️ AUTHOR
    common_conversion_targets: [], // ✍️ AUTHOR (e.g. ["cabinet", "side table"] when the movement is removed)
    distinguishing_features: [
      // ✍️ AUTHOR: comb-and-pin/disc-and-star-wheel sound mechanism; metal disc or pinned cylinder;
      //            wind-up/coin movement; NOT a bed, NOT brass-frame furniture (those are material reads)
    ],
    cousin_form_contrasts: [
      // ✍️ AUTHOR — contrast vs. each of these existing forms:
      //   • form_jukebox (electric coin-op record player vs. mechanical comb/disc)
      //   • form_pump_organ_cabinet (player operates reeds+bellows vs. plucked comb teeth)
      //   • form_musical_instrument_furniture (general instrument/phonograph cases)
    ],
    dimensional_thresholds: {
      notes: "", // ✍️ AUTHOR (table-top vs. upright/floor disc-cabinet scale)
    },
    common_aliases: [], // ✍️ AUTHOR: ["disc music box", "cylinder music box", "Regina", "Polyphon", "symphonion", "musical box"]
    regional_period_notes: "", // ✍️ AUTHOR
    subtypes: [
      {
        id: "subtype_disc_music_box",
        name: "Disc music box",
        distinguishing_attributes: [], // ✍️ AUTHOR (interchangeable metal discs + star-wheels; Regina/Polyphon)
      },
      {
        id: "subtype_cylinder_music_box",
        name: "Cylinder music box",
        distinguishing_attributes: [], // ✍️ AUTHOR (pinned cylinder plays fixed tunes; earlier Swiss tradition)
      },
      {
        id: "subtype_upright_disc_cabinet",
        name: "Upright / floor disc-cabinet music box",
        distinguishing_attributes: [], // ✍️ AUTHOR (tall case, large discs, often coin-operated — the regina form)
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 2) OFFICE CHAIR — closes the banker's chairs (currently "Upholstered armchair")
  //    Swivel/tilt task seating: banker's, secretarial, drafting, tilt-swivel.
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "form_office_chair",
    category: "form",
    name: "office chair",
    parent_category: "chair",
    family_id: "family_seating",
    spatial_behavior_id: "spatial_motion_seating",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "needs_review",

    date_floor: 0, // ✍️ AUTHOR (cast-iron swivel office chairs c. 1850s onward)
    date_ceiling: 0, // ✍️ AUTHOR
    common_conversion_targets: [],
    distinguishing_features: [
      // ✍️ AUTHOR: central swivel/tilt mechanism on a single post or splayed caster base; task posture;
      //            single occupant; NOT a leg-and-rail parlor armchair
    ],
    cousin_form_contrasts: [
      // ✍️ AUTHOR — contrast vs:
      //   • form_pedestal_chair (modern single-pedestal SHELL seat vs. mechanical swivel/tilt task chair)
      //   • form_side_chair (fixed four-leg frame, no swivel)
      //   • form_lounge_chair (reclined comfort posture, not task)
      //   • form_stool (no back / no swivel-tilt mechanism)
    ],
    dimensional_thresholds: {
      notes: "", // ✍️ AUTHOR (desk-height seat; single-occupant)
    },
    common_aliases: [], // ✍️ AUTHOR: ["banker's chair", "swivel chair", "tilt chair", "secretarial chair", "task chair", "desk chair"]
    regional_period_notes: "", // ✍️ AUTHOR
    subtypes: [
      {
        id: "subtype_bankers_chair",
        name: "Banker's chair",
        distinguishing_attributes: [], // ✍️ AUTHOR (low-back wood swivel-tilt, often quartersawn oak, caster base)
      },
      {
        id: "subtype_secretarial_chair",
        name: "Secretarial / typist chair",
        distinguishing_attributes: [], // ✍️ AUTHOR (armless, height-adjust, posture back)
      },
      {
        id: "subtype_drafting_chair",
        name: "Drafting / task stool-chair",
        distinguishing_attributes: [], // ✍️ AUTHOR (tall, foot-ring, swivel)
      },
    ],
    // anti_classification_guidance: { ... } // ✍️ AUTHOR: add a form_emergence (~1850s) boundary, or delete
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 3) PEACOCK CHAIR — closes peacock (currently "Upholstered armchair"), finding #25
  //    High fan/hood-back woven rattan lounge chair (peacock / Emmanuelle).
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "form_peacock_chair",
    category: "form",
    name: "peacock chair",
    parent_category: "chair",
    family_id: "family_seating",
    spatial_behavior_id: "spatial_single_user_seating",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "needs_review",

    date_floor: 0, // ✍️ AUTHOR (Philippine/American popularity esp. c. 1960s–70s; earlier wicker roots)
    date_ceiling: 0, // ✍️ AUTHOR
    common_conversion_targets: [],
    distinguishing_features: [
      // ✍️ AUTHOR: tall flared fan/hood back of woven rattan/wicker; hourglass or splayed base;
      //            single high-back lounge seat; woven body is structural, not a material-only read
    ],
    cousin_form_contrasts: [
      // ✍️ AUTHOR — contrast vs:
      //   • form_lounge_chair (general reclined seat vs. the distinctive tall woven fan back)
      //   • form_pedestal_chair (molded single-pedestal modern shell vs. woven rattan throne form)
      //   • form_side_chair (low-back fixed frame)
    ],
    dimensional_thresholds: {
      notes: "", // ✍️ AUTHOR (tall back height is diagnostic; single occupant)
    },
    common_aliases: [], // ✍️ AUTHOR: ["Emmanuelle chair", "fan-back wicker chair", "rattan throne chair", "hooded wicker chair"]
    regional_period_notes: "", // ✍️ AUTHOR
    subtypes: [
      {
        id: "subtype_classic_peacock",
        name: "Classic peacock / Emmanuelle",
        distinguishing_attributes: [], // ✍️ AUTHOR (very tall flared fan back, hourglass base)
      },
      {
        id: "subtype_hooded_peacock",
        name: "Hooded / canopy peacock",
        distinguishing_attributes: [], // ✍️ AUTHOR (rounded hood enclosing the head)
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 4) PATIO / OUTDOOR CHAIR — closes woodard (currently "Upholstered armchair")
  //    Garden/porch/poolside single chair: wrought-iron, tubular/cast aluminum, wire, sling.
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "form_patio_chair",
    category: "form",
    name: "patio chair",
    parent_category: "chair",
    family_id: "family_seating",
    spatial_behavior_id: "spatial_outdoor_specialty_institutional_seating",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "needs_review",

    date_floor: 0, // ✍️ AUTHOR (Victorian cast-iron garden seating onward; postwar aluminum/wire boom)
    date_ceiling: 0, // ✍️ AUTHOR
    common_conversion_targets: [],
    distinguishing_features: [
      // ✍️ AUTHOR: weather-resistant outdoor construction (wrought/cast iron, tubular/cast aluminum,
      //            spring steel wire, sling); drainage/open seat; single occupant; NOT an upholstered
      //            indoor armchair even when a cushion is present
    ],
    cousin_form_contrasts: [
      // ✍️ AUTHOR — contrast vs:
      //   • form_lounge_chair (indoor upholstered comfort seat)
      //   • form_side_chair (indoor dining/parlor frame)
      //   • form_bench (multi-occupant garden seating)
    ],
    dimensional_thresholds: {
      notes: "", // ✍️ AUTHOR (single-occupant; outdoor scale)
    },
    common_aliases: [], // ✍️ AUTHOR: ["garden chair", "porch chair", "lawn chair", "poolside chair", "bistro chair", "spring chair"]
    regional_period_notes: "", // ✍️ AUTHOR
    subtypes: [
      {
        id: "subtype_wrought_iron_patio_chair",
        name: "Wrought / cast-iron patio chair",
        distinguishing_attributes: [], // ✍️ AUTHOR (Victorian/revival cast-iron garden seat; the woodard-class metal chair)
      },
      {
        id: "subtype_aluminum_patio_chair",
        name: "Tubular / cast-aluminum patio chair",
        distinguishing_attributes: [], // ✍️ AUTHOR (postwar lightweight aluminum, often vinyl-strap)
      },
      {
        id: "subtype_wire_patio_chair",
        name: "Spring-steel / wire patio chair",
        distinguishing_attributes: [], // ✍️ AUTHOR (bouncy wire-rod outdoor chair)
      },
    ],
  },
];
