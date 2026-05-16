import { CanonicalEntry } from "./entryShape";

/**
 * Construction Logic is the highest level of the form taxonomy. It groups
 * furniture by the fundamental construction approach used to build it.
 * Four logics span the American antique furniture domain:
 *   I.   Case Construction (rigid carcass, enclosed storage)
 *   II.  Frame Construction (post-and-rail seating)
 *   III. Surface Forms (tables, work surfaces)
 *   IV.  Mechanical / Integrated Systems (pieces with embedded machinery
 *        or coordinated functional systems)
 *
 * Each form belongs to exactly one construction logic.
 */
export interface ConstructionLogicEntry extends CanonicalEntry {
  category: "construction_logic";
  name: string;

  /**
   * Roman numeral identifier per appraiser taxonomy (I, II, III, IV).
   * Provided as semantic anchor; schema reasoning uses id field.
   */
  ordinal: "I" | "II" | "III" | "IV";

  /**
   * Description of the construction approach that defines this taxonomic
   * root. Informs engine reasoning about which dating clues, joinery
   * patterns, and dimensional ranges apply.
   */
  description: string;

  /**
   * Construction characteristics common to all furniture in this logic
   * group. Used for engine reasoning when construction-evidence dating
   * applies broadly across the logic group rather than to specific forms.
   */
  shared_construction_characteristics?: string[];

  /**
   * Visual or observable cues that identify a piece as belonging to this
   * construction logic in the field (photograph or in-person inspection).
   * Distinct from shared_construction_characteristics, which describes
   * underlying structural traits; identifying_elements describes what an
   * observer actually sees.
   */
  identifying_elements?: string[];

  /**
   * Functional behavior characteristic of furniture in this construction
   * logic. Captures the use-case or role that this construction approach
   * enables (e.g., enclosed storage for case construction, body support
   * for frame construction, work surface for surface forms, mechanical
   * function for mechanical/integrated systems).
   */
  functional_behavior?: string;

  /**
   * Narrative-level historical evolution of this construction approach
   * across the project's date envelope. Captures how the construction
   * logic itself evolved over time, including major shifts in materials,
   * joinery, and production methods. Specific datable construction features
   * (e.g., machine-cut dovetails appearing c. 1860, plywood adoption
   * c. 1900) belong in toolmarks.ts, finish.ts, joinery.ts, fasteners.ts,
   * and woodEvidence.ts for engine clue-level
   * reasoning; this field carries the narrative-level synthesis as an
   * array of period-keyed bullet entries.
   */
  historical_evolution_narrative?: string[];

  /**
   * What this construction logic is NOT — disambiguation from the other
   * three logics. Used for negative identification in engine reasoning
   * when ruling out construction logic categories.
   */
  disambiguation_from_other_logics?: string[];
}

export const CONSTRUCTION_LOGIC: ConstructionLogicEntry[] = [
  {
    id: "construction_case",
    category: "construction_logic",
    name: "Case Construction",
    ordinal: "I",
    description:
      "Case construction refers to furniture built around a rigid, enclosed structural box (carcass) that defines and contains internal storage volume. The carcass is the primary load-bearing structure, and all functional elements — drawers, doors, shelves — operate within or are attached to this enclosure. Storage is the defining purpose; the box exists to contain.",
    shared_construction_characteristics: [
      "Continuous outer shell formed by sides, top, bottom, and back panels",
      "Enclosed internal volume that defines storage capacity",
      "Load distributed through panel-and-box construction rather than frame skeleton",
      "Storage accessed via drawers, doors, or hinged lids",
      "Joinery emphasizes box integrity: dovetails at corners, dados for shelf and divider seating, rabbets for back panels and case joints, mortise-and-tenon for any frame-and-panel sections",
      "Drawer construction integrated into the carcass via runners, dust panels, or kicker boards",
      "Back panel construction varies (full, inset, or partial) but contributes to case rigidity",
    ],
    identifying_elements: [
      "Solid or veneered side panels forming vertical walls",
      "Top and bottom panels enclosing the structure",
      "Back panel — full, inset, or partial — visible from rear",
      "Interior cavity with subdivisions (drawer dividers, shelves, partitions)",
      "Joinery visible at case corners (dovetails) and shelf/divider seating (dados, rabbets)",
      "Frame-and-panel sections may appear in doors or large back panels, with mortise-and-tenon joinery in those frame elements",
    ],
    functional_behavior:
      "Enclosed storage and protection of contents within a defined internal volume. Case construction prioritizes containment and organization: the structure exists to enclose, divide, and protect what is stored within it. This functional purpose distinguishes case construction from frame construction (which supports the human body), surface forms (which provide a working plane), and mechanical/integrated systems (which house operational machinery).",
    historical_evolution_narrative: [
      "Pre-1700: American case furniture is not yet fully carcass-based. Best understood as joined frame-and-panel construction with enclosed function — a transitional system between frame construction (structural skeleton) and later case construction (true box/carcass). Wood species at this stage are dictated primarily by local harvesting capabilities, with regional patterns: New England oak (primary) and pine (secondary); Mid-Atlantic oak with occasional walnut in the later part of the period. Stock typically thick and heavy due to structural reliance on joinery and hand-tool limitations.",
      "1700–1820 (Colonial to Federal): Heavy reliance on hand-cut dovetails and mortise-and-tenon joinery. Case sides typically thick and solid wood. Drawer bottoms typically set in grooves and nailed. Wood species vary regionally — New England maple, cherry, pine; Mid-Atlantic walnut. Construction often overbuilt due to hand-tool limitations.",
      "1820–1860 (Empire and Early Industrial): Veneered surfaces over secondary woods introduced. Increased use of mahogany and walnut veneer. Larger case forms with more standardized proportions. Early mechanization begins influencing saw marks and uniformity.",
      "1860–1900 (Victorian Industrial Expansion): Widespread use of machine-cut dovetails. Standardization of drawer sizes and carcass dimensions. Increased complexity — multiple compartments, mirrored backs. Mass-produced hardware introduced. Oak becomes dominant in many regions.",
      "1900–1945 (Early Modern and Factory Production): Simplification of ornamentation in some styles. Plywood panels and early composite materials introduced. Joinery shifts toward dowels and mechanical fasteners. Increased reliance on factory assembly systems.",
      "1945–present (Modern to Contemporary): Particle board, MDF, and laminates introduced. Joinery often minimized or concealed (staples, cam locks). Emphasis on efficiency and cost reduction. Shift from craftsmanship to modular manufacturing.",
      "Note: Specific datable construction features within this evolution (dovetail evolution, drawer bottom evolution, machine-cut transitions, plywood and composite material adoption, mechanical fastener emergence) belong in toolmarks.ts, finish.ts, joinery.ts, fasteners.ts, and woodEvidence.ts for clue-level engine reasoning. This narrative carries the synthesis-level evolution; the canonical clue libraries carry the dating clues.",
    ],
    disambiguation_from_other_logics: [
      "Not open skeletal structure — distinguishes case construction from frame construction (Construction Logic II), where the structure is a post-and-rail skeleton supporting the human body rather than an enclosed box containing storage",
      "Not defined by surface plane — distinguishes case construction from surface forms (Construction Logic III), where the primary structural identity is a working surface supported by legs or trestles, not an enclosed volume",
      "Not dependent on mechanical systems — distinguishes case construction from mechanical/integrated systems (Construction Logic IV), where the form exists to house or coordinate operational machinery; case construction may include hardware but its primary purpose is containment, not mechanism",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "construction_frame",
    category: "construction_logic",
    name: "Frame Construction",
    ordinal: "II",
    description:
      "Frame construction refers to furniture built from a skeletal system of joined linear members, where structure is defined by posts, rails, and supports. Load is carried through joinery intersections rather than panel-and-box walls. The structure is open and skeletal; surfaces and upholstery are applied to or supported by the frame, not integral to its structural integrity.",
    shared_construction_characteristics: [
      "Open skeletal structure composed of legs, rails, stretchers, and posts",
      "Load carried through joinery intersections rather than enclosing panels",
      "No enclosing shell — negative space visible between structural members",
      "Joinery emphasizes joint integrity at intersections: mortise and tenon (primary, often pinned with wooden pegs in earlier periods), dowels (later periods)",
      "Surfaces (seats, backs, applied panels) are added to the frame as functional or decorative elements; they do not contribute primary structural integrity",
      "Upholstery, when present, is applied to the frame rather than integrated into structural members",
    ],
    identifying_elements: [
      "Visible leg systems with clear post-and-rail relationships",
      "Exposed joinery at structural intersections — mortise-and-tenon joints, dowels, sometimes visible pegs in earlier work",
      "Open negative space between structural members",
      "Applied surfaces or upholstery distinguishable from the structural frame underneath",
      "Stretchers connecting legs at lower height for additional rigidity (especially in earlier and rural production)",
    ],
    functional_behavior:
      "Body support and distributed load-bearing through skeletal structure. Frame construction prioritizes structural efficiency: maximum support with minimum material, achieved through joinery integrity rather than enclosing mass. This functional purpose distinguishes frame construction from case construction (which contains storage), surface forms (which provide a working plane), and mechanical/integrated systems (which house operational machinery).",
    historical_evolution_narrative: [
      "Pre-1700 (Colonial / Joined Construction Period): Structure dominated by joined post-and-rail frame construction rather than true carcass building. Heavy reliance on large, hand-cut mortise-and-tenon joinery, often pinned with wooden pegs. Panels set into grooves as non-load-bearing infill, not structural walls. Drawers rare until late 1600s; when present, crude hand-cut dovetails and nailed bottoms common. Wood species: New England oak (primary), pine (secondary); Mid-Atlantic oak, occasional walnut in later period. Stock typically thick and heavy due to structural reliance on joinery and hand-tool limitations. Visible tool marks common, including hand-planing and shaping irregularities. Construction emphasizes durability and structural integrity over refinement or standardization.",
      "1700–1820: Dominated by mortise-and-tenon joinery. Hand-shaped components. Style-construction coupling notable in this period: William and Mary and Queen Anne styles tracked closely with frame-construction refinement. Woods: maple, oak, walnut.",
      "1820–1860: Increased refinement of curves and shaping. Early stages of steam bending introduced. Greater stylistic diversity in frame expression.",
      "1860–1900: Industrialization allows turned components and repeated parts. Introduction of bentwood techniques (notably in chairs). More standardized frame construction.",
      "1900–1945: Machine precision increases. Use of dowel joinery and early metal fasteners. Upholstery becomes more integrated with frame design.",
      "1945–present: Introduction of tubular steel, molded plywood, and plastics. Frame may be partially or fully concealed. Shift toward engineered materials.",
      "Note: Specific datable construction features within this evolution (mortise-and-tenon joinery patterns, peg-pinning practices, bentwood adoption, dowel-joinery emergence, tubular steel introduction) belong in toolmarks.ts, finish.ts, joinery.ts, fasteners.ts, and woodEvidence.ts for clue-level engine reasoning.",
    ],
    disambiguation_from_other_logics: [
      "Not enclosed storage — distinguishes frame construction from case construction (Construction Logic I), where a rigid carcass with continuous outer shell defines and contains storage volume; frame construction has open negative space and no enclosing structure",
      "Not planar surface-dominant — distinguishes frame construction from surface forms (Construction Logic III), where the primary structural identity is a working surface (table top, work surface) supported by legs or trestles; frame construction's primary identity is the skeletal structure itself, even when surfaces (seats, backs) are present",
      "Not system-driven — distinguishes frame construction from mechanical/integrated systems (Construction Logic IV), where the form exists to house or coordinate operational machinery; frame construction may include moving parts (e.g., rocking chair rockers) but the primary structural purpose is body support, not mechanism",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "construction_surface",
    category: "construction_logic",
    name: "Surface Forms",
    ordinal: "III",
    description:
      "Surface construction refers to furniture whose primary identity is a working plane, supported by a structural base. The plane — whether horizontal (table tops, work surfaces) or angled (drafting surfaces) — is the form's defining functional element; the base exists to support and elevate the plane to a usable height. Storage, when present, is secondary to the surface itself.",
    shared_construction_characteristics: [
      "Dominant horizontal or angled surface as the form's primary functional element",
      "Surface supported by a base structure: legs, pedestal, or trestle",
      "Minimal or no enclosed storage; storage when present is secondary (drawers in a frieze, shelves under a top) rather than defining",
      "Joinery emphasizes surface-to-base attachment: cleats, breadboard ends, pegged mortise-and-tenon connecting tops to bases, wedges and screws in later periods",
      "Surface plane is typically thicker stock than supporting members, especially in earlier periods",
      "Edge treatments (breadboard ends, applied moldings, edge profiles) often diagnostic of period and quality",
    ],
    identifying_elements: [
      "Large continuous top forming the visual and functional center of the piece",
      "Structural support beneath — visible legs, pedestal column, trestle base, or stretcher system",
      "Joinery focused on surface attachment rather than enclosed-volume integrity",
      "Surface edges and edge treatments often visible from the side, indicating top thickness and edge profile",
      "Negative space beneath the surface — distinct from case construction's enclosed volume",
    ],
    functional_behavior:
      "Provides a working plane to support activities: dining, writing, working, food preparation, drafting, gaming. Surface construction prioritizes the plane itself — its size, height, stability, and accessibility — over containment, body support, or mechanical function. This functional purpose distinguishes surface forms from case construction (which contains storage), frame construction (which supports the human body), and mechanical/integrated systems (which house operational machinery).",
    historical_evolution_narrative: [
      "Pre-1700 (Colonial / Early Surface Construction Period): Surface construction relies on thick, solid wood tops supported by simple frame or trestle bases. Heavy use of pegged mortise-and-tenon joinery connecting tops to base structures. Boards often joined edge-to-edge with minimal refinement; wide planks common. Breadboard ends occasionally used to stabilize wide tops, though not yet standardized. Wood species: New England oak (primary), pine (secondary); Mid-Atlantic oak, occasional walnut in later period. Stock typically thick and uneven due to hand-tool limitations and lack of standardized milling. Surface finishing minimal; hand-planed tops with visible tool marks common. Construction prioritizes durability and function over refinement, with limited use of mechanical expansion or adjustable features.",
      "1700–1820: Solid wood tops dominate. Breadboard ends become common. Joinery emphasizes pegged mortise-and-tenon connecting top to base. Heavy, durable construction.",
      "1820–1860: Veneered tops increase. More refined edge profiles. Introduction of expansion tables (sliding mechanisms allowing leaves to be inserted).",
      "1860–1900: Mechanical expansion systems improve. Turned and carved bases become common. Increased ornamentation in base structures.",
      "1900–1945: Simplification in some styles, particularly Arts and Crafts. Introduction of plywood cores. Functional design gains importance over ornamental expression.",
      "1945–present: Laminates and synthetics dominate. Mass production introduces metal brackets and fasteners. Lightweight construction increases.",
      "Note: Specific datable construction features within this evolution (breadboard end emergence, expansion-table mechanisms, plywood core adoption, metal-bracket fastening) belong in toolmarks.ts, finish.ts, joinery.ts, fasteners.ts, and woodEvidence.ts for clue-level engine reasoning.",
    ],
    disambiguation_from_other_logics: [
      "Not enclosed storage — distinguishes surface forms from case construction (Construction Logic I), where a rigid carcass with continuous outer shell defines and contains storage volume; surface forms have negative space beneath and no enclosing structure",
      "Not skeletal frame structure — distinguishes surface forms from frame construction (Construction Logic II), where the primary structural identity is the joined skeletal system itself rather than a working plane supported by a base; in surface forms, the base supports the plane, while in frame construction, the frame is the structure",
      "Not system-driven — distinguishes surface forms from mechanical/integrated systems (Construction Logic IV), where the form exists to house or coordinate operational machinery; surface forms may incorporate mechanical features (expansion mechanisms, tilt-tops, drop-leaves) but the primary purpose is the surface itself, not the mechanism",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "construction_mechanical_integrated",
    category: "construction_logic",
    name: "Mechanical / Integrated Systems",
    ordinal: "IV",
    description:
      "Mechanical construction refers to furniture whose function depends on integrated systems or engineered movement beyond basic joinery. The mechanism is the form's defining purpose: without the mechanism, the piece is not what it is. This distinguishes CL IV from forms in other construction logics that may incorporate mechanical features (expansion tables, drop-leaves, roll-top tambours) without being defined by them — in those cases, the mechanism is a feature of an otherwise-structural form, not the form's defining purpose.",
    shared_construction_characteristics: [
      "Internal mechanical systems integral to the form's function",
      "Movement, transformation, or sound production as the form's purpose, not as a feature",
      "Structure exists primarily to support, house, and protect the mechanism",
      "Internal compartments specifically dimensioned and reinforced for mechanism placement",
      "Access panels designed for mechanism maintenance and repair (back panels, removable side panels, hinged cover plates)",
      "Joinery and structure often more complex than equivalent non-mechanical forms because the structure must accommodate operational tolerances and mechanical loads",
    ],
    identifying_elements: [
      "Visible moving systems: tracks, gears, tambours, bellows, pedals, escapements",
      "Internal compartments housing mechanisms (often visible through removed panels or maintenance openings)",
      "Access panels distinct from primary case panels — designed for opening rather than for structural enclosure",
      "Mechanical hardware integrated into the structure (mounting brackets, pivot points, action mounts)",
      "Form factor often determined by mechanism requirements rather than by stylistic or proportional ideals (e.g., pump organ keyboard depth driven by reed-block dimensions, clock case height driven by pendulum-and-weight requirements)",
    ],
    functional_behavior:
      "Performs specialized actions through integrated mechanical systems: sound production (pump organs, pianos, phonographs, radios), time measurement and display (clocks), or other engineered transformations. The form does not exist to contain, support, or provide a surface; it exists to enable the operation of its internal system. This functional purpose distinguishes mechanical/integrated systems from case construction (containment), frame construction (body support), and surface forms (working plane).",
    historical_evolution_narrative: [
      "Pre-1700 (Colonial / Pre-Mechanical Development Period): No true integrated mechanical systems; function relies on joinery and basic hardware rather than engineered movement. Limited use of simple mechanical elements, primarily hinges, locks, and latches. Hinged components include lift-top chests and early fall-front writing surfaces (late 1600s). Hardware typically hand-forged iron, surface-mounted, and irregular in placement and fit. No use of track systems, springs, or precision sliding mechanisms. Wood species (associated construction context): New England oak (primary), pine (secondary); Mid-Atlantic oak, occasional walnut in later period. Mechanical elements secondary to structure; movement achieved through simple pivoting rather than integrated systems. Absence of complex or precision mechanical behavior is itself a key diagnostic indicator of the period.",
      "1700–1820: Early mechanical desks emerge (slant-front, fall-front), though as desks with mechanical features rather than CL IV forms. Simple hinged mechanisms. CL IV proper is not yet meaningfully present in American furniture production at this stage.",
      "1820–1860: Increased mechanical complexity in furniture broadly, including mechanically-concealed compartments with spring or hidden-release systems, and early adjustable mechanisms. CL IV proper begins to emerge with early American clock production refining tall case clock movements.",
      "1860–1900 (Mechanical Innovation Peak): Pump organs (foot-bellows reed instruments) reach peak production. Tall case clock movement refinement continues. Early phonograph mechanisms emerge by late 1880s and mature post-1890. Precision woodworking supports the complexity these systems require.",
      "1900–1945: Integration with industrial components accelerates. Springs and metal tracks introduced into mechanical systems. Increased reliability through standardized industrial parts. Phonograph cabinets and radio cabinets emerge as mature CL IV forms.",
      "1945–present: Decline in complex mechanical furniture as electronics replace mechanical sound production and clock movements shift to quartz mechanisms. Shift to simplified mechanisms and mass-produced hardware. Some resurgence in specialized modern designs.",
      "Note: Specific datable mechanical features within this evolution (foot-bellows construction details, tambour mechanism patterns, clock movement evolution, early phonograph mechanism types) belong in toolmarks.ts, finish.ts, joinery.ts, fasteners.ts, and woodEvidence.ts for clue-level engine reasoning.",
    ],
    disambiguation_from_other_logics: [
      "Mechanism as form-defining purpose vs. mechanism as feature on a structural form: CL IV requires that the mechanism is the form's defining purpose — without it, the piece would not be what it is. Roll-top desks, cylinder desks, expansion tables, and drop-leaf tables incorporate mechanical features, but their underlying forms (desks, tables) exist independently of the mechanism. These belong in their structural construction logic (CL III for surface forms) with mechanism captured as a distinguishing feature, not in CL IV.",
      "Not purely structural — distinguishes CL IV from case construction (CL I), frame construction (CL II), and surface forms (CL III) where structure exists to enclose, support, or provide a surface; in CL IV, structure exists to enable mechanical function",
      "Not defined by storage, support, or surface alone — CL IV may incorporate elements of all three (a pump organ has a case, a piano has frame elements, a phonograph cabinet has a surface), but none of those structural elements is the form's defining purpose; the mechanism is",
    ],
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
];
