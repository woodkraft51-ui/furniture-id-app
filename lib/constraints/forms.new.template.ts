/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  NEW-FORMS AUTHORING DRAFT  (taxonomy-gap forms, finding #22)  — AUTHORED
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Owner-authored entries for the three missing forms (harpsichord, planter,
 *  pedestal chair). Type-checked against the live FormEntry shape from forms.ts.
 *  NOT imported by the engine — staged here until we move them into the FORMS
 *  array in forms.ts, regenerate the canonical vocab, and wire the router.
 *
 *  Status: authoring complete; pending integration + router wiring.
 */

import type { FormEntry } from "./forms";

export const NEW_FORMS_DRAFT: FormEntry[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // 1) HARPSICHORD  — closes S026 (was mis-routed to "Music stand")
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "form_harpsichord",
    category: "form",
    name: "harpsichord",
    parent_category: "musical_mechanical_form",
    family_id: "family_musical_mechanical",
    spatial_behavior_id: "spatial_musical_instrument_cabinets",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "needs_review",
    date_floor: 1500,
    date_ceiling: 2026,
    common_conversion_targets: ["desk", "console table", "sideboard", "display cabinet"],
    distinguishing_features: [
      "Keyboard instrument case built around plucked-string jack action rather than struck hammers or reed-and-bellows sound production.",
      "Long horizontal string bed or rectangular string box integrated into the cabinet body.",
      "Keys operate vertical jacks with plectra that pluck the strings.",
      "Soundboard and bridges are part of the case structure, not removable shelves or simple display surfaces.",
      "Often has a hinged lid over the string bed and a fallboard or key cover at the keyboard.",
      "May have a trestle, turned, cabriole, or later revival leg structure, but the musical case remains the primary structural identity.",
      "Can include single-manual, double-manual, spinet, or virginal layouts without changing the core harpsichord-family identity.",
    ],
    cousin_form_contrasts: [
      "Unlike form_pump_organ_cabinet, a harpsichord uses plucked strings and jacks rather than reeds, stops, pedals, and bellows.",
      "Unlike form_musical_instrument_furniture used for piano or general instrument cases, a harpsichord is specifically identified by its plucked-string keyboard action and shallow string case.",
      "Unlike form_music_stand, a harpsichord is a full musical instrument cabinet with keyboard, soundboard, strings, and action, not a portable or freestanding sheet-music support.",
    ],
    dimensional_thresholds: {
      notes: "Usually longer and deeper than a music stand or small cabinet because the string bed is integral. Small spinets and virginals may be compact, but they still retain a keyboard, string bed, soundboard, and jack action.",
    },
    common_aliases: ["clavecin", "clavicembalo", "spinet", "virginal", "double-manual harpsichord", "single-manual harpsichord"],
    regional_period_notes: "Harpsichords were established European keyboard instruments by the Renaissance and Baroque periods, with important Italian, Flemish, French, English, and German traditions. Period production declined after the piano became dominant, but revival and reproduction examples appear from the late nineteenth and twentieth centuries onward. Dating should not rely on form alone because early instruments, nineteenth-century revivals, twentieth-century concert instruments, and decorative conversions can share the same general outline.",
    subtypes: [
      {
        id: "subtype_spinet",
        name: "Spinet harpsichord",
        distinguishing_attributes: [
          "Smaller domestic harpsichord-family instrument.",
          "Usually single manual.",
          "Strings often run diagonally from the keyboard rather than straight away from it.",
          "Compact case scale compared with full wing-form harpsichords.",
        ],
      },
      {
        id: "subtype_virginal",
        name: "Virginal",
        distinguishing_attributes: [
          "Rectangular harpsichord-family case.",
          "Single set of strings generally running nearly parallel to the keyboard.",
          "Domestic scale rather than wing-form concert scale.",
          "Keyboard commonly set into the long face of the rectangular case.",
        ],
      },
      {
        id: "subtype_single_manual_harpsichord",
        name: "Single-manual harpsichord",
        distinguishing_attributes: [
          "One keyboard manual.",
          "Wing or rectangular case built around plucked-string action.",
          "May have one or more choirs of strings but only one keyboard.",
        ],
      },
      {
        id: "subtype_double_manual_harpsichord",
        name: "Double-manual harpsichord",
        distinguishing_attributes: [
          "Two stacked keyboards.",
          "Larger case scale and more complex action than single-manual examples.",
          "Often associated with formal, professional, or revival concert use.",
        ],
      },
      {
        id: "subtype_revival_harpsichord",
        name: "Revival harpsichord",
        distinguishing_attributes: [
          "Later reproduction or revival instrument using historic harpsichord form.",
          "May include modern materials, machine hardware, modern tuning pins, or piano-industry construction habits.",
          "Requires construction and hardware evidence before assigning an early date.",
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 2) PLANTER  — closes S036 (was mis-routed to "Wicker / rattan furniture")
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "form_planter",
    category: "form",
    name: "planter",
    parent_category: "entry_support_form",
    family_id: "family_entry_support_forms",
    spatial_behavior_id: "spatial_display_and_plant_support_stands",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "needs_review",
    date_floor: 1700,
    date_ceiling: 2026,
    common_conversion_targets: ["plant stand", "umbrella stand", "wastebasket", "decorative storage bin"],
    distinguishing_features: [
      "Primary purpose is to hold, conceal, or contain a plant, soil, liner, or plant pot.",
      "Vessel, tub, box, trough, bowl, or cachepot structure is integral to the form.",
      "Often includes a removable liner, metal insert, ceramic body, drainage provision, or moisture-resistant interior surface.",
      "May be floor-standing, tabletop, wall-mounted, or raised on a stand, but the container function remains primary.",
      "Interior wear, staining, corrosion, mineral deposits, or liner marks often appear where a plant or pot sat.",
      "Open upper cavity is sized for a plant or pot rather than for seating, writing, display shelving, or general storage.",
    ],
    cousin_form_contrasts: [
      "Unlike form_plant_stand, a planter is itself the vessel or outer container for the plant or pot, while a plant stand primarily elevates a separate vessel.",
      "Unlike form_pedestal, a planter has a plant-holding cavity or vessel body, while a pedestal is a solid or open support for another object.",
    ],
    dimensional_thresholds: {
      notes: "Scale ranges from tabletop cachepots to large floor jardinières and trough planters. Classification should follow vessel function, liner evidence, and plant-holding cavity rather than height alone.",
    },
    common_aliases: [
      "jardiniere",
      "jardinière",
      "cachepot",
      "plant holder",
      "plant tub",
      "flower box",
      "window box",
      "planter box",
      "fernery",
    ],
    regional_period_notes: "Planters and jardinières appear across European and American domestic interiors, conservatories, porches, gardens, and entry spaces. Materials vary widely, including ceramic, metal, wicker, rattan, wood, concrete, fiberglass, and plastic. Because the form remains in production, dating should come from material, construction, finish, hardware, style, and manufacturing evidence rather than from planter function alone.",
    subtypes: [
      {
        id: "subtype_cachepot",
        name: "Cachepot",
        distinguishing_attributes: [
          "Decorative outer vessel that conceals a plain nursery pot or inner liner.",
          "Usually lacks a permanent drainage hole because the inner pot is removable.",
          "Often tabletop or small floor scale.",
          "Interior may show ring marks or moisture staining from a removable pot.",
        ],
      },
      {
        id: "subtype_jardiniere",
        name: "Jardinière",
        distinguishing_attributes: [
          "Larger ornamental planter intended for display in a room, conservatory, porch, or garden setting.",
          "Often ceramic, metal, wicker, or carved wood with a broad open mouth.",
          "May sit on an integrated base or matching stand.",
          "Usually more decorative and furniture-like than a plain utilitarian plant pot.",
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 3) PEDESTAL CHAIR  — closes S038 (Space-Age cone chair, was mis-routed to "Bench")
  //    Covers single-central-pedestal modern seating: cone / tulip / ball / egg / swivel.
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "form_pedestal_chair",
    category: "form",
    name: "pedestal chair",
    parent_category: "chair",
    family_id: "family_seating",
    spatial_behavior_id: "spatial_modern_casual_seating",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "needs_review",
    date_floor: 1955,
    date_ceiling: 2026,
    common_conversion_targets: [],
    distinguishing_features: [
      "Single-occupant chair supported by one central pedestal, column, trumpet base, cone base, disc base, or central swivel base.",
      "Seat shell or upholstered body is carried by a central support rather than four legs, sled runners, or side frames.",
      "Often has molded fiberglass, plastic, metal, or upholstered shell construction associated with mid-century and Space Age design.",
      "May swivel, tilt, or rotate from the pedestal base.",
      "Seat is scaled for one person, not a multi-occupant bench.",
      "Back, arms, and seat may be molded into one continuous shell.",
      "Base form is diagnostically important and should override generic seating vocabulary such as chair, lounge, or bench.",
    ],
    cousin_form_contrasts: [
      "Unlike form_lounge_chair, a pedestal chair is defined by a single central pedestal or swivel support rather than by reclined comfort posture alone.",
      "Unlike form_side_chair, a pedestal chair does not use four separate legs or a conventional leg-and-rail chair frame.",
      "Unlike form_stool, a pedestal chair has a back or enclosing shell for seated support.",
      "Unlike form_bench, a pedestal chair is a single-occupant seat and should not be classified by broad seat width or modern sculptural shape alone.",
    ],
    dimensional_thresholds: {
      notes: "Typical examples are single-seat width. If the object seats more than one adult side by side, route away from pedestal chair unless there are separate pedestal-supported individual seats.",
    },
    common_aliases: [
      "tulip chair",
      "cone chair",
      "ball chair",
      "globe chair",
      "egg chair",
      "swivel pedestal chair",
      "space-age chair",
      "pod chair",
    ],
    regional_period_notes: "The pedestal chair is a mid-century modern and Space Age seating form that emerged in the 1950s through designers and manufacturers experimenting with molded shells, aluminum bases, fiberglass, plastic, and sculptural single-support seating. Dating should distinguish original designer production, licensed later production, and later copies or reproductions. The single central base is the routing feature, while maker, material, and construction determine the tighter date.",
    subtypes: [
      {
        id: "subtype_cone_chair",
        name: "Cone chair",
        distinguishing_attributes: [
          "Inverted cone or funnel-like shell.",
          "Single central base or cross-foot pedestal support.",
          "Strong Space Age sculptural profile.",
          "Associated with Verner Panton's 1958 cone chair concept, though later copies and variants are common.",
        ],
      },
      {
        id: "subtype_tulip_chair",
        name: "Tulip chair",
        distinguishing_attributes: [
          "Molded seat shell on a single trumpet-shaped pedestal base.",
          "Base visually flares like a tulip stem into the floor.",
          "Usually dining or side-chair scale.",
          "Associated with Eero Saarinen's Pedestal Group for Knoll from the mid-1950s.",
        ],
      },
      {
        id: "subtype_ball_chair",
        name: "Ball / globe chair",
        distinguishing_attributes: [
          "Spherical or near-spherical enclosing shell.",
          "Open front cutaway creates a pod-like seat.",
          "Usually mounted on a low swivel pedestal.",
          "Strong 1960s Space Age profile.",
        ],
      },
      {
        id: "subtype_egg_chair",
        name: "Egg chair",
        distinguishing_attributes: [
          "Tall rounded upholstered shell with wing-like sides.",
          "Single pedestal or swivel base.",
          "Enclosing lounge posture but single-seat function.",
          "Associated with late-1950s Scandinavian modern design, though later versions and copies are common.",
        ],
      },
    ],
    anti_classification_guidance: {
      boundary_date: 1955,
      boundary_type: "form_emergence",
      guidance_text: "Do not classify pre-1955 seating as form_pedestal_chair unless the object has a clear single central pedestal chair structure. Earlier swivel chairs, piano stools, office chairs, and column-supported stools should route to their own seating forms unless the modern pedestal-shell chair identity is present.",
      prominence: "standard",
      pre_boundary_classifications: ["form_side_chair", "form_lounge_chair", "form_stool"],
    },
  },
];
