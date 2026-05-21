import { CanonicalEntry } from "./entryShape";

/**
 * Family is the second level of the form taxonomy. It groups forms by
 * function and use context within a construction logic. Family describes
 * what kind of furniture this is in human use; construction logic
 * describes how it is built. The two are orthogonal but related.
 *
 * Each form belongs to exactly one family.
 */
export interface FamilyEntry extends CanonicalEntry {
  category: "family";
  name: string;

  /**
   * Reference to the construction logic this family belongs under.
   */
  construction_logic_id: string;

  /**
   * Description of what defines this family in human use — function,
   * placement, social context. Distinct from construction_logic which
   * describes how furniture in this family is built.
   */
  description: string;

  /**
   * Family-level characteristics shared across forms within this family.
   * Used for engine reasoning when evidence supports family identification
   * but not yet form-level identification.
   */
  family_characteristics?: string[];
}

export const FAMILIES: FamilyEntry[] = [
  // ============================================================
  // CONSTRUCTION LOGIC I — Case Construction
  // ============================================================

  {
    id: "family_bedroom_clothing_storage",
    category: "family",
    name: "Bedroom and Clothing Storage Cases",
    construction_logic_id: "construction_case",
    description:
      "This family represents furniture designed for daily personal interaction with clothing, grooming, and rest. These pieces typically live in bedrooms, dressing rooms, and private domestic spaces. They support activities such as storing folded garments, hanging clothing, dressing and grooming, organizing personal effects, and supporting rest. This is individual-use furniture, scaled to the needs of a single person or household member rather than a shared or public function.",
    family_characteristics: [
      "Designed for repetitive daily use, often multiple times per day",
      "Scaled for private-room placement, not public display",
      "Storage is oriented toward clothing and personal accessories",
      "Frequently positioned along walls for accessibility, with bedside placement common for support furniture",
      "Often part of matched bedroom suites, especially post-19th century",
      "Combines functional storage with ergonomic access (height, reach, surface use)",
      "May incorporate drawers, enclosed cabinets, mirrors, hanging interiors, basin surfaces, or sleeping platforms",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "family_dining_service_storage",
    category: "family",
    name: "Dining and Service Storage Cases",
    construction_logic_id: "construction_case",
    description:
      "This family represents furniture designed for food service, storage, and dining-related organization. These pieces typically live in dining rooms, service areas, and occasionally kitchens or transitional spaces. They support activities such as serving meals, storing tableware, linens, and serving items, and staging food and drink for presentation. This is shared-use furniture, often used during social or family gatherings.",
    family_characteristics: [
      "Designed for multi-user interaction, often during events or meals",
      "Frequently positioned along walls in public-facing rooms",
      "Storage is oriented toward dishes, glassware, linens, and serving equipment",
      "Often integrated into suite production, especially late 19th to early 20th century",
      "Combines storage, display, and service surface",
      "May include drawers, cabinets, open display areas, and specialized compartments (cellarette compartments, bottle drawers, divided serving storage)",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "family_general_storage_specialty",
    category: "family",
    name: "General Storage and Specialty Cases",
    construction_logic_id: "construction_case",
    description:
      "This family represents furniture designed for specialized storage, display, or organization beyond clothing or dining functions. These pieces appear throughout the home depending on use — living rooms, offices, kitchens, utility areas. They support activities such as storing books, documents, or tools, displaying objects, and organizing specialized items.",
    family_characteristics: [
      "Function-driven rather than room-specific",
      "Storage is content-specific, not general-purpose",
      "May emphasize visibility (display), segmentation (compartments), or accessibility (open systems)",
      "Often reflects specialized user needs rather than general household routines",
      "Range spans highly utilitarian (pie safe, hoosier cabinet, filing cabinet) to decorative and display-focused (curio cabinet, étagère, whatnot)",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  // ============================================================
  // CONSTRUCTION LOGIC II — Frame Construction
  // ============================================================

  {
    id: "family_seating",
    category: "family",
    name: "Seating Furniture",
    construction_logic_id: "construction_frame",
    description:
      "This family represents furniture designed to support the human body in a seated or reclining position. These pieces are used throughout the home — living rooms, dining rooms, bedrooms, offices. They support activities such as resting, social interaction, dining, and working.",
    family_characteristics: [
      "Built to support body weight and posture",
      "Designed for direct human contact and comfort",
      "Scaled to individual use or shared seating",
      "May incorporate upholstery, cushions, or ergonomic shaping",
      "Often arranged in relation to tables or conversation groupings",
      "Strong relationship between structure, comfort, and intended duration of use",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  // ============================================================
  // CONSTRUCTION LOGIC III — Surface Forms
  // ============================================================

  {
    id: "family_tables",
    category: "family",
    name: "Tables",
    construction_logic_id: "construction_surface",
    description:
      "This family represents furniture designed to provide a stable working or supporting surface. These pieces are used throughout the home for dining, working, writing, and display.",
    family_characteristics: [
      "Defined by a dominant usable surface plane",
      "Designed for interaction above the structure",
      "Height and scale correspond to seated use or standing use",
      "Minimal reliance on enclosed storage",
      "Often positioned centrally (dining, center tables) or against walls (console, sofa tables)",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "family_desks",
    category: "family",
    name: "Desks",
    construction_logic_id: "construction_surface",
    description:
      "This family represents furniture designed for writing, administrative work, and intellectual tasks. These pieces typically live in offices, studies, and bedrooms.",
    family_characteristics: [
      "Combines surface function with storage or organization",
      "Designed for seated use and task-focused interaction",
      "Often includes drawers, compartments, and writing surfaces",
      "May incorporate privacy features or enclosed workspaces (per the hybrid CL III/CL IV decision, desks with mechanical concealment such as roll-top and cylinder desks belong here as forms with mechanical features, not in CL IV)",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  // ============================================================
  // CONSTRUCTION LOGIC IV — Mechanical / Integrated Systems
  // ============================================================

  {
    id: "family_musical_mechanical",
    category: "family",
    name: "Musical and Mechanical Furniture",
    construction_logic_id: "construction_mechanical_integrated",
    description:
      "Musical and mechanical furniture forms designed to house, support, present, or enable integrated mechanical, electronic, electromechanical, or acoustic systems where the mechanism (movement, playback, interaction, dispensing, fiber processing, or sound production) is the form's defining purpose. The family encompasses nine form groupings spanning American furniture history from colonial-era spinning wheels and looms through Federal-era square pianos and pump organs, Victorian player pianos and pianolas, mid-century radio/television/stereo consoles, late-20th-century media storage and integrated entertainment systems, and present-day interactive consoles and VR stations. Distinguished from other furniture families by mechanism-as-form-defining identity — without the mechanism, the piece is not what it is (jukebox without playback system is a decorative cabinet; pinball machine without playfield is empty case; pump organ cabinet without bellows-and-reed action is a hollow case). Construction logic assignment: construction_mechanical_integrated reflects the family's unifying axis. Where Clock Cases (Block 13) anchors CL IV at its center for horological forms specifically, Musical and Mechanical Furniture anchors CL IV broadly across all non-horological mechanical-integrated furniture forms. The four-logic ordinal taxonomy (case, frame, surface, mechanical_integrated) remains closed-by-design per Block 3 decision. Cross-family architectural note: form_pump_organ_cabinet (pre-existing canonical from Sessions 2-5) belongs in this family per D-MM4/D-MM4a; Block 15 completes the partial migration by adding the spatial_behavior_id field. Pump organ is excluded from form_musical_instrument_furniture's subtypes per D-MM4 to preserve form_pump_organ_cabinet's standalone canonical content (cousin_form_contrasts vs upright piano and pipe organ, dimensional_thresholds for keyboard depth, anti_classification_guidance with form_emergence boundary at 1870, regional_period_notes covering Estey/Mason & Hamlin/Story & Clark/Kimball manufacturer traditions).",
    family_characteristics: [
      "Function depends on integrated internal systems",
      "Structure serves as housing and support for the mechanism",
      "Interaction involves operation, adjustment, or activation",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "family_industrial_professional",
    category: "family",
    name: "Industrial/Professional",
    construction_logic_id: "construction_mechanical_integrated",
    description:
      "Industrial, institutional, commercial, and professional furniture forms designed for workplace, public-service, religious, retail, educational, scientific, and operational contexts. The family encompasses workstations, fixtures, lockers, racks, shelving systems, ceremonial furnishings, scientific equipment stands, commercial display cases, and environmental control cabinets across colonial-era through present American production. Distinguished from domestic furniture families by workflow-oriented configuration, durable utilitarian construction, and specialized operational roles rather than residential use. Construction logic assignment: construction_mechanical_integrated reflects the housed-functional nature of most Industrial/Professional forms — lockers with locking mechanisms, time clocks with punch mechanisms, bank vault doors with combination locks, charging lockers with electronics, scientific stands with instrument mounts. The catch-all assignment per Block 1 Entry/Support Forms / Block 3 Baskets / Block 7 Lighting precedent represents the smallest semantic stretch in this case since most Industrial/Professional forms genuinely embody mechanical/integrated systems.",
    family_characteristics: [
      "Designed for task efficiency and durability",
      "Often utilitarian in form",
      "Scaled to specific professional activities",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "family_clock_cases",
    category: "family",
    name: "Clock Cases",
    construction_logic_id: "construction_mechanical_integrated",
    description:
      "Horological clock case forms designed to house, present, and protect weight-driven, spring-driven, or pendulum-regulated clock movements across floor-standing, wall-mounted, and surface-set configurations. The family encompasses tall case clocks (longcase grandfather/grandmother/granddaughter forms), wall clocks (banjo, gallery, regulator, schoolhouse, calendar variants), and shelf clocks (mantel, tambour, novelty variants) across colonial-era through present American production. Distinguished from other furniture families by the clock movement as form-defining purpose — without the mechanism, the piece is not what it is. Construction logic assignment: construction_mechanical_integrated reflects the cleanest fit of any family to CL IV's intended scope. Where Industrial/Professional, Lighting, Baskets, and Entry/Support Forms used construction_mechanical_integrated as the catch-all assignment (smallest semantic stretch when no other logic fit cleanly), Clock Cases represents the canonical case for which the construction logic was originally designed. The four-logic ordinal taxonomy (case, frame, surface, mechanical_integrated) remains closed-by-design; Clock Cases anchors CL IV at its center rather than its periphery.",
    family_characteristics: [
      "Structure designed around internal clock movement",
      "Combines functional housing and decorative presentation",
      "Often tall or wall-mounted",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "family_entry_support_forms",
    category: "family",
    name: "Entry and Support Forms",
    construction_logic_id: "construction_mechanical_integrated",
    description:
      "This family represents furniture designed to support entryway function and personal organization, typically located near entrances.",
    family_characteristics: [
      "Designed for transitional use (entering or leaving the home)",
      "Supports garments, accessories, and small personal items",
      "Often compact and vertically oriented",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "family_baskets",
    category: "family",
    name: "Baskets",
    construction_logic_id: "construction_mechanical_integrated",
    description:
      "Portable woven container furniture forms — baskets — constructed primarily through interwoven flexible materials rather than rigid joinery. The family encompasses agricultural, domestic, commercial, textile, decorative, and maritime basket forms across colonial-era through modern American production. Distinguished from rigid container forms (boxes, chests, cabinets) by woven construction, flexibility, and typical hand-portability. Note on construction logic assignment: construction_mechanical_integrated is used as a semantic catch-all for Baskets pending future architectural review; baskets are not literally mechanical/integrated, but the four-logic ordinal taxonomy (case, frame, surface, mechanical_integrated) is closed-by-design and doesn't contain a woven-construction logic. Future architectural review may consolidate Baskets with Box Form into a 'Container Forms' family or extend the construction logic taxonomy to include construction_woven. The semantic stretch is acknowledged here rather than hidden.",
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "family_lighting",
    category: "family",
    name: "Lighting",
    construction_logic_id: "construction_mechanical_integrated",
    description:
      "Lighting furniture forms providing artificial illumination through flame, gas, or electric light sources. The family encompasses freestanding floor-set lighting (torchères, floor lamps), surface-set lighting (table lamps, candelabra), wall-mounted lighting (sconces, gas brackets), and suspended lighting (chandeliers, lanterns, pendants) across colonial-era through present American production. Distinguished from other furniture families by primary illumination function and integrated light-source accommodation (candle cups, gas burners, electric sockets). Construction logic assignment: construction_mechanical_integrated reflects the housed-functional nature of lighting forms (burner mechanisms, gas piping, electric components integrated into structural form) per Block 1 Entry/Support Forms and Block 3 Baskets precedent.",
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
];
