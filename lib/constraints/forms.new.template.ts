/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  NEW-FORMS AUTHORING TEMPLATE  (taxonomy-gap forms, finding #22)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  HOW TO USE
 *  ----------
 *  1. Fill in every field marked  ✍️ AUTHOR  below. Leave the pre-filled
 *     structural fields (id, category, parent_category, family_id,
 *     spatial_behavior_id, authority numbers) alone — they are matched to the
 *     engine's existing pattern so the new forms slot in without conflict.
 *  2. You CANNOT break the engine by editing this file — it is NOT imported
 *     anywhere. It exists only so the TypeScript compiler validates the SHAPE of
 *     what you write. Run `npm run typecheck`; if it's green, the structure is
 *     valid. (Red just means a field name/type slipped — the error points right
 *     at it.)
 *  3. When you're done, I move these entries into the FORMS array in
 *     `forms.ts`, regenerate the canonical vocab, wire the router, and delete
 *     this template.
 *
 *  FIELD GUIDE (mirrors forms.ts exactly — see form_pump_organ_cabinet / form_washstand for live examples)
 *  ----------
 *   distinguishing_features  : the canonical "how you know it's THIS form" list — structural, not stylistic.
 *   cousin_form_contrasts    : one complete sentence per near-neighbor form, stating how THIS form differs
 *                              (weight, mechanism, proportion). The cousin form_ids are named for you in comments.
 *   regional_period_notes    : appraiser-voice prose on where/when/by whom it was made and dating cautions.
 *   subtypes                 : "same form, different fitting" variants (the sub-forms). id = subtype_<descriptor>.
 *   anti_classification_guidance : ONLY if the form has a crisp emergence/extinction date boundary; else delete it.
 *   date_floor / date_ceiling: numeric years for the form's canonical production span.
 *
 *  Leave any optional field you don't need as-is (empty array / commented) — it stays valid.
 */

import type { FormEntry } from "./forms";

// NOTE: FormEntry is the same interface used by the live FORMS array in
// forms.ts, so the compiler validates your entries against the exact engine
// shape. This template is not imported by the engine — authoring here is safe.

export const NEW_FORMS_DRAFT: FormEntry[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // 1) HARPSICHORD  — closes S026 (was mis-routed to "Music stand")
  // ───────────────────────────────────────────────────────────────────────────
  {
    // ── pre-filled structural (do not edit) ──
    id: "form_harpsichord",
    category: "form",
    name: "harpsichord",
    parent_category: "musical_mechanical_form",
    family_id: "family_musical_mechanical",
    spatial_behavior_id: "spatial_musical_instrument_cabinets",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "needs_review",

    // ── ✍️ AUTHOR below ──
    date_floor: 0, // ✍️ AUTHOR: canonical production-span start year (e.g. revival 1900; period 1700s)
    date_ceiling: 0, // ✍️ AUTHOR: canonical production-span end year
    common_conversion_targets: [], // ✍️ AUTHOR: e.g. ["desk", "console table"] — what people convert these into
    distinguishing_features: [
      // ✍️ AUTHOR: structural identity (plucked-string jack action vs. struck-string piano; etc.)
    ],
    cousin_form_contrasts: [
      // ✍️ AUTHOR — contrast vs. each of these existing forms:
      //   • form_pump_organ_cabinet (reed + bellows)
      //   • form_musical_instrument_furniture (piano / general)
      //   • form_music_stand (sheet-music rack — the form it was wrongly called)
    ],
    dimensional_thresholds: {
      // ✍️ AUTHOR: only the bounds that meaningfully separate it from cousins
      notes: "", // ✍️ AUTHOR
    },
    common_aliases: [], // ✍️ AUTHOR: ["spinet (when smaller/single-manual)", "clavecin", ...]
    regional_period_notes: "", // ✍️ AUTHOR
    subtypes: [
      // ✍️ AUTHOR: e.g. spinet / virginal / single-manual / double-manual / revival
      // {
      //   id: "subtype_spinet",
      //   name: "Spinet harpsichord",
      //   distinguishing_attributes: [/* ✍️ */],
      // },
    ],
    // anti_classification_guidance: { ... }  // ✍️ AUTHOR: add only if there's a crisp date boundary; otherwise delete
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 2) PLANTER  — closes S036 (was mis-routed to "Wicker / rattan furniture")
  // ───────────────────────────────────────────────────────────────────────────
  {
    // ── pre-filled structural (do not edit) ──
    id: "form_planter",
    category: "form",
    name: "planter",
    parent_category: "entry_support_form",
    family_id: "family_entry_support_forms",
    spatial_behavior_id: "spatial_display_and_plant_support_stands",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "needs_review",

    // ── ✍️ AUTHOR below ──
    date_floor: 0, // ✍️ AUTHOR
    date_ceiling: 0, // ✍️ AUTHOR
    common_conversion_targets: [], // ✍️ AUTHOR
    distinguishing_features: [
      // ✍️ AUTHOR: holds/encloses a plant or pot; drainage/liner; vs. a STAND that elevates a separate pot
    ],
    cousin_form_contrasts: [
      // ✍️ AUTHOR — contrast vs. each of these existing forms:
      //   • form_plant_stand (elevates a separate pot; the planter IS the vessel)
      //   • form_pedestal (bare column support — no vessel)
    ],
    dimensional_thresholds: {
      notes: "", // ✍️ AUTHOR
    },
    common_aliases: [], // ✍️ AUTHOR: ["jardinière", "cachepot", "plant pot stand", ...]
    regional_period_notes: "", // ✍️ AUTHOR
    subtypes: [
      // ✍️ AUTHOR — fill distinguishing_attributes for each (ids/names pre-seeded for consistency):
      {
        id: "subtype_cachepot",
        name: "Cachepot",
        distinguishing_attributes: [], // ✍️ AUTHOR: decorative outer vessel concealing a plain pot; tabletop scale
      },
      {
        id: "subtype_jardiniere",
        name: "Jardinière",
        distinguishing_attributes: [], // ✍️ AUTHOR: larger ornamental planter, often on its own stand/base
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 3) PEDESTAL CHAIR  — closes S038 (Space-Age cone chair, was mis-routed to "Bench")
  //    Covers single-central-pedestal modern seating: cone / tulip / ball / egg / swivel.
  // ───────────────────────────────────────────────────────────────────────────
  {
    // ── pre-filled structural (do not edit) ──
    id: "form_pedestal_chair",
    category: "form",
    name: "pedestal chair",
    parent_category: "chair",
    family_id: "family_seating",
    spatial_behavior_id: "spatial_modern_casual_seating",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "needs_review",

    // ── ✍️ AUTHOR below ──
    date_floor: 0, // ✍️ AUTHOR: e.g. 1950 (Space Age)
    date_ceiling: 0, // ✍️ AUTHOR
    common_conversion_targets: [], // ✍️ AUTHOR (often none)
    distinguishing_features: [
      // ✍️ AUTHOR: single central pedestal/base supporting one seat (NOT a multi-seat bench; NOT splayed legs)
    ],
    cousin_form_contrasts: [
      // ✍️ AUTHOR — contrast vs. each of these existing forms:
      //   • form_lounge_chair (reclined single-seat, but leg-based not single-pedestal)
      //   • form_side_chair (upright leg-based)
      //   • form_stool (no back)
      //   • form_bench (multi-occupant — the form it was wrongly called)
    ],
    dimensional_thresholds: {
      notes: "", // ✍️ AUTHOR: single-occupant seat width vs. bench scale
    },
    common_aliases: [], // ✍️ AUTHOR: ["tulip chair", "cone chair", "ball chair", "globe chair", "space-age chair", ...]
    regional_period_notes: "", // ✍️ AUTHOR
    subtypes: [
      // ✍️ AUTHOR — distinguishing_attributes for each (ids/names pre-seeded):
      {
        id: "subtype_cone_chair",
        name: "Cone chair",
        distinguishing_attributes: [], // ✍️ AUTHOR (Verner Panton cone, 1958; inverted-cone shell on a cross base)
      },
      {
        id: "subtype_tulip_chair",
        name: "Tulip chair",
        distinguishing_attributes: [], // ✍️ AUTHOR (Saarinen pedestal; molded shell on a single trumpet base)
      },
      {
        id: "subtype_ball_chair",
        name: "Ball / globe chair",
        distinguishing_attributes: [], // ✍️ AUTHOR (Aarnio sphere on a swivel pedestal)
      },
      {
        id: "subtype_egg_chair",
        name: "Egg chair",
        distinguishing_attributes: [], // ✍️ AUTHOR (Jacobson egg; pedestal swivel base)
      },
    ],
    // anti_classification_guidance: {   // ✍️ AUTHOR: likely a form_emergence boundary (~1950) — fill or delete
    //   boundary_date: 1950,
    //   boundary_type: "form_emergence",
    //   guidance_text: "", // ✍️ AUTHOR
    //   prominence: "standard",
    //   pre_boundary_classifications: [], // ✍️ AUTHOR: e.g. ["form_side_chair", "form_stool"]
    // },
  },
];
