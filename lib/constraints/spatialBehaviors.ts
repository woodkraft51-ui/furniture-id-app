import { CanonicalEntry } from "./entryShape";

/**
 * Spatial Behavior is the third level of the form taxonomy. It groups
 * forms within a family by the structural strategy they use to manage
 * space and function. The architectural insight: spatial behavior
 * describes the strategy a piece uses to manage its function (e.g.,
 * horizontal storage spreads across width, vertical storage stacks
 * upward, clothing enclosure encloses for hanging).
 *
 * Each form belongs to exactly one spatial behavior. Spatial behaviors
 * are scoped to their parent family — "Horizontal Storage" within the
 * Bedroom family is distinct from any horizontal-storage behavior that
 * might exist in other families.
 */
export interface SpatialBehaviorEntry extends CanonicalEntry {
  category: "spatial_behavior";
  name: string;

  /**
   * Reference to the family this spatial behavior belongs under.
   */
  family_id: string;

  /**
   * Description of how this behavior organizes space and storage within
   * its family.
   */
  description: string;

  /**
   * Structural attributes typical of forms within this spatial behavior.
   * Most useful when forms within a behavior share dimensional patterns,
   * proportional relationships, or structural organization that justifies
   * engine reasoning at the behavior level.
   */
  structural_attributes?: string[];

  /**
   * Dimensional patterns characteristic of this spatial behavior.
   * Optional — populate when meaningful pattern exists across multiple
   * forms within the behavior. All length measurements in inches.
   */
  dimensional_patterns?: {
    width_min?: number;
    width_max?: number;
    height_min?: number;
    height_max?: number;
    depth_min?: number;
    depth_max?: number;
    notes?: string;
  };
}

export const SPATIAL_BEHAVIORS: SpatialBehaviorEntry[] = [
  // ============================================================
  // FAMILY: Bedroom and Clothing Storage Cases (6 spatial behaviors)
  // ============================================================

  {
    id: "spatial_horizontal_storage",
    category: "spatial_behavior",
    name: "Horizontal Storage Forms (Dressing Cases)",
    family_id: "family_bedroom_clothing_storage",
    description:
      "Spreads storage across width to support frequent, direct interaction with clothing and grooming. This behavior prioritizes accessibility and surface usability over maximum capacity.",
    structural_attributes: [
      "Width-dominant proportions",
      "Case height typically within 30–38 inches",
      "Multi-column drawer layouts",
      "Broad, usable top surface",
      "Often associated with mirrors or dressing accessories",
    ],
    dimensional_patterns: {
      height_min: 30,
      height_max: 38,
      width_min: 42,
      width_max: 72,
      depth_min: 18,
      depth_max: 24,
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_vertical_storage",
    category: "spatial_behavior",
    name: "Vertical Storage Forms (Stacked Drawer Cases)",
    family_id: "family_bedroom_clothing_storage",
    description:
      "Stacks storage vertically to maximize capacity within a limited footprint. This behavior prioritizes volume efficiency over surface interaction.",
    structural_attributes: [
      "Height-dominant proportions",
      "Single-column or stacked drawer configurations",
      "Continuous vertical drawer rhythm",
      "Limited surface usability",
    ],
    dimensional_patterns: {
      height_min: 42,
      height_max: 70,
      width_min: 24,
      width_max: 40,
      depth_min: 18,
      depth_max: 22,
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_clothing_enclosure",
    category: "spatial_behavior",
    name: "Clothing Enclosure Forms (Hanging Storage)",
    family_id: "family_bedroom_clothing_storage",
    description:
      "Encloses vertical space to support hanging garments, shifting storage from folded to suspended organization.",
    structural_attributes: [
      "Tall cabinet form",
      "Door-based access",
      "Internal hanging volume",
      "Shelving or drawers secondary",
    ],
    dimensional_patterns: {
      height_min: 65,
      height_max: 85,
      width_min: 36,
      width_max: 60,
      depth_min: 20,
      depth_max: 28,
      notes: "Height 65 inches minimum; substantial examples may exceed 85 inches.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_sleep_furniture",
    category: "spatial_behavior",
    name: "Sleep Furniture",
    family_id: "family_bedroom_clothing_storage",
    description:
      "Supports the body in a horizontal resting position and serves as the primary anchor of the bedroom environment.",
    structural_attributes: [
      "Rectangular support frame",
      "Load distributed across rails, slats, or platform",
      "May include vertical posts or canopy structures",
    ],
    dimensional_patterns: {
      width_min: 36,
      width_max: 78,
      notes:
        "Length: typically 75-84 inches, aligned to human body scale (twin/full at lower end, queen/king toward upper end or beyond). Width: 36-78 inches across common historical and modern sizes. Height: highly variable by period and form — platform and low beds 12-20 inches frame height; standard bedsteads 18-30 inches to mattress support; four-poster and tester beds total height often 60-84 inches or more. Clearance beneath bed varies by period — early and utilitarian forms often higher for storage; modern forms often lower or fully enclosed. Variation is driven by mattress type, period style, and construction method rather than strict standardization.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_bedside_furniture",
    category: "spatial_behavior",
    name: "Bedside Furniture",
    family_id: "family_bedroom_clothing_storage",
    description:
      "Provides immediate-access support adjacent to the bed for transitional states such as waking and resting.",
    structural_attributes: [
      "Small footprint",
      "Low height relative to bed",
      "Combination of surface and limited storage",
    ],
    dimensional_patterns: {
      height_min: 24,
      height_max: 30,
      width_min: 16,
      width_max: 30,
      depth_min: 12,
      depth_max: 20,
      notes:
        "Height typically 24-30 inches, often aligned with or slightly below mattress height (may fall outside this range depending on bed height and period). Width 16-30 inches sized for compact placement beside the bed. Depth 12-20 inches sufficient for surface use without obstructing movement. Scale intentionally compact relative to primary case furniture. Proportions favor accessibility from a seated or reclined position and minimal footprint within tight spatial conditions. Variation is primarily driven by bed height, room size, and intended surface use rather than strict formal standardization.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_personal_hygiene",
    category: "spatial_behavior",
    name: "Personal Hygiene / Dressing Support",
    family_id: "family_bedroom_clothing_storage",
    description:
      "Supports grooming and hygiene activities, emphasizing use over storage. Includes both pre-plumbing washing forms (washstand) and grooming-station forms (dressing table).",
    structural_attributes: [
      "Active-use surface",
      "Often paired with mirrors or basin accommodation",
      "Storage secondary and accessory-focused",
    ],
    dimensional_patterns: {
      notes:
        "Height aligned with standing use (washstand) or seated use (dressing table). Depth sufficient for basin or grooming tools. See form_washstand dimensional_thresholds for washstand-specific anchors; dressing table dimensional anchors to be authored at form level.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  // ============================================================
  // FAMILY: Dining and Service Storage Cases (5 spatial behaviors)
  // ============================================================

  {
    id: "spatial_distributed_storage",
    category: "spatial_behavior",
    name: "Distributed Storage Forms (Span-Based)",
    family_id: "family_dining_service_storage",
    description:
      "Distributes storage across width to support simultaneous access and service during meals.",
    structural_attributes: [
      "Long horizontal span",
      "Multiple storage zones",
      "Surface used for staging",
    ],
    dimensional_patterns: {
      width_min: 60,
      notes:
        "Width often exceeds 60 inches. Height similar to dresser range (34-40 inches at serving surface). See form_sideboard dimensional_thresholds for form-specific anchors.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_integrated_cabinet_storage",
    category: "spatial_behavior",
    name: "Integrated Cabinet Storage Forms",
    family_id: "family_dining_service_storage",
    description:
      "Consolidates storage into a single unified cabinet mass, emphasizing capacity and enclosure.",
    structural_attributes: [
      "Vertical integration of compartments",
      "Cabinet-dominant structure",
      "Reduced emphasis on surface span",
    ],
    dimensional_patterns: {
      notes:
        "Moderate height and width. Depth often greater than sideboards. See form_buffet dimensional_thresholds for form-specific anchors.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_auxiliary_service",
    category: "spatial_behavior",
    name: "Auxiliary Service Forms",
    family_id: "family_dining_service_storage",
    description:
      "Supports secondary or flexible service functions, often supplementing larger storage pieces.",
    structural_attributes: [
      "Reduced scale",
      "Surface plus limited storage",
      "Mobility or repositioning common",
    ],
    dimensional_patterns: {
      notes:
        "Smaller than primary service forms. Height aligned with serving surfaces. See form_server dimensional_thresholds for form-specific anchors.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_display_storage_hybrid",
    category: "spatial_behavior",
    name: "Display and Storage Hybrids",
    family_id: "family_dining_service_storage",
    description:
      "Combines visible display with enclosed storage, balancing presentation and protection.",
    structural_attributes: [
      "Glazed upper sections",
      "Enclosed lower storage",
      "Vertical composition",
    ],
    dimensional_patterns: {
      notes: "Height greater than width in many examples. Upper-to-lower division common.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_specialized_storage",
    category: "spatial_behavior",
    name: "Specialized Storage",
    family_id: "family_dining_service_storage",
    description:
      "Organizes space around single-purpose or narrowly defined storage functions, where the form is driven by the specific requirements of what is being stored rather than by general storage or service patterns. This behavior prioritizes functional specificity, accommodation of particular objects or materials, and efficiency within a defined use case. Rather than spreading storage broadly or stacking it for capacity, these forms are shaped by what must fit, be accessed, or be protected.",
    structural_attributes: [
      "Internal configuration driven by specific contents, not generalized storage",
      "Compartments, divisions, or supports often tailored to size, shape, or quantity of stored items",
      "Structure may include fixed partitions, adjustable shelving, or ventilation or containment features (where required by contents)",
      "External form may still resemble standard case construction, but internal layout is function-specific rather than standardized",
      "Balance between enclosure for protection and accessibility for repeated use",
    ],
    dimensional_patterns: {
      notes:
        "No fixed proportional system; dimensions vary based on intended contents. Width, height, and depth often correlate directly to size of stored objects and number of items to be accommodated. May fall within broader case furniture ranges, but often show irregular proportions relative to standard storage forms, with depth or compartment sizing that differs from typical drawer or cabinet systems.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  // ============================================================
  // FAMILY: General Storage and Specialty Cases (4 spatial behaviors)
  // ============================================================

  {
    id: "spatial_open_storage_systems",
    category: "spatial_behavior",
    name: "Open Storage Systems",
    family_id: "family_general_storage_specialty",
    description: "Provides direct visibility and access, prioritizing display and accessibility.",
    structural_attributes: ["Open shelving", "Minimal enclosure", "Vertical or modular stacking"],
    dimensional_patterns: {
      notes: "Variable. Often height-dominant.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_compartmentalized_storage",
    category: "spatial_behavior",
    name: "Compartmentalized Storage",
    family_id: "family_general_storage_specialty",
    description:
      "Organizes items into highly segmented internal divisions, emphasizing categorization.",
    structural_attributes: ["Multiple small compartments", "Repetitive internal structure"],
    dimensional_patterns: {
      notes: "Often grid-like proportional systems.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_display_cabinets",
    category: "spatial_behavior",
    name: "Display Cabinets",
    family_id: "family_general_storage_specialty",
    description:
      "Prioritizes visual presentation of stored objects, often in protected environments.",
    structural_attributes: ["Glazing", "Controlled interior space", "Shelving optimized for display"],
    dimensional_patterns: {
      notes: "Vertical emphasis common.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_utility_storage",
    category: "spatial_behavior",
    name: "Utility Storage",
    family_id: "family_general_storage_specialty",
    description: "Supports practical, task-driven storage, often in working environments.",
    structural_attributes: [
      "Durable construction",
      "Functional layouts",
      "Minimal decorative emphasis",
    ],
    dimensional_patterns: {
      notes: "Highly variable.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  // ============================================================
  // FAMILY: Seating Furniture (9 spatial behaviors)
  // ============================================================

  {
    id: "spatial_single_user_seating",
    category: "spatial_behavior",
    name: "Upright Single-User Seating",
    family_id: "family_seating",
    description:
      "Supports one individual in upright seated position with full back support. Body posture is task-oriented or formal rather than lounge-relaxed. Distinguished from upholstered lounge seating by upright posture and from modern casual seating by conventional frame structure with seat, back, and leg system.",
    structural_attributes: [
      "Seat, back, and leg system",
      "Upright posture orientation",
      "Conventional frame construction (wood, metal, or hybrid)",
      "Back support is structurally meaningful",
      "Seat height typically 16-19 inches aligned with seated ergonomic use",
    ],
    dimensional_patterns: {
      notes:
        "Seat height commonly 16-19 inches. Overall height commonly 30-42 inches. Seat width commonly 16-24 inches. Seat depth commonly 15-22 inches. Bar chair examples extend the height range to 28-32 inches at seat for bar/counter use.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_motion_seating",
    category: "spatial_behavior",
    name: "Motion Seating",
    family_id: "family_seating",
    description:
      "Single-user seating with controlled motion mechanism — rocking, gliding, swiveling, or pivoting. The motion mechanism is structurally defining and distinguishes motion seating from static single-user seating. Common motion mechanisms include curved rockers, platform rocking systems, mechanical glider linkages, and swivel bases.",
    structural_attributes: [
      "Single-user seating with motion mechanism",
      "Curved rockers, platform mechanism, glider linkage, or swivel base",
      "Back support typically present",
      "Frame construction supports both seating and motion",
      "Motion mechanism is structurally integral, not an after-market addition",
    ],
    dimensional_patterns: {
      notes:
        "Seat height commonly 15-19 inches. Overall height commonly 35-48 inches. Width commonly 20-32 inches. Depth including rocker runners commonly 28-42 inches. Platform rockers and upholstered glider rockers may be heavier (often 50-100 pounds) than traditional curved-rocker forms.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_upholstered_lounge_seating",
    category: "spatial_behavior",
    name: "Upholstered Lounge Seating",
    family_id: "family_seating",
    description:
      "Single-user comfort-oriented seating with deep upholstery, relaxed posture, and substantial cushioning. Distinguished from upright single-user seating by lounge-comfort identity (deeper seat, lower seat height, angled back) and from multi-user upholstered seating by single-occupant scale. Includes both fixed lounge forms and adjustable-back lounge forms.",
    structural_attributes: [
      "Single-user upholstered seating",
      "Deep seat and relaxed posture orientation",
      "Substantial upholstery, padding, or cushioning",
      "Arms commonly present but not always",
      "May include adjustable back, reclining mechanism, or wing structure",
    ],
    dimensional_patterns: {
      notes:
        "Seat height commonly 14-19 inches (lower than upright single-user seating). Width commonly 24-40 inches. Depth commonly 28-45 inches. Overall height commonly 28-42 inches. Recliners and large upholstered lounge chairs may exceed 150 pounds.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_multi_user_seating",
    category: "spatial_behavior",
    name: "Multi-User Upholstered Seating",
    family_id: "family_seating",
    description:
      "Multi-user upholstered seating supporting two or more occupants with shared structural support. Covers both formal upright multi-user seating (settee scale, more upright posture, often exposed-frame) and lounge multi-user seating (sofa scale, deeper seat, full upholstery). Distinguished from single-user upholstered lounge by multi-occupant capacity and shared seat structure.",
    structural_attributes: [
      "Multi-user seating capacity (typically 2-4 occupants)",
      "Shared structural support across seat width",
      "Upholstered seat and back",
      "Arms commonly present",
      "Width substantially exceeds single-user seating",
    ],
    dimensional_patterns: {
      notes:
        "Width commonly 42-96 inches depending on configuration (settee 42-72 inches; loveseat 48-72 inches as sofa subtype; standard sofa 72-96 inches; sectional 90-150+ inches). Seat height commonly 16-20 inches. Depth commonly 20-45 inches. Sleeper sofas and reclining sofas may exceed 350 pounds.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_reclining_extended_seating",
    category: "spatial_behavior",
    name: "Reclining or Extended Seating",
    family_id: "family_seating",
    description:
      "Seating supporting horizontal or near-horizontal body posture with extended-leg or reclined orientation. Length exceeds standard upright seating. Covers chaise longue forms (one-person reclining seat) and daybed forms (mattress-like horizontal surface supporting reclining or occasional sleeping).",
    structural_attributes: [
      "Elongated horizontal seat surface",
      "Body posture is reclining, semi-reclining, or extended-leg",
      "May have back support at one end, asymmetrical end configuration, or partial back along one long side",
      "Length exceeds standard chair seat depth — often 60-84 inches",
      "Distinguished from sofa by single-user orientation (chaise) or mattress-like depth (daybed)",
    ],
    dimensional_patterns: {
      notes:
        "Length commonly 60-84 inches. Width commonly 24-42 inches. Seat or mattress height commonly 14-24 inches. Daybeds approach twin-bed scale (72-80 inches length, 30-42 inches width). Chaise longues vary from formal parlor scale to casual modern lounge scale.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_bench_seating",
    category: "spatial_behavior",
    name: "Bench Seating",
    family_id: "family_seating",
    description:
      "Elongated seating supporting one or more users, structurally simpler than upholstered multi-user seating. May be backless (basic bench), backed (settle, hall bench, garden bench), storage-bearing (storage bench, blanket-chest-bench hybrid), or context-specific (piano bench, dining bench, window bench). Bench identity is the elongated seat with simpler frame construction; settle is one bench subtype with high panel-back enclosure rather than the central form.",
    structural_attributes: [
      "Elongated seat supporting multiple users or one user with extended seat",
      "Simpler frame construction than upholstered multi-user seating",
      "May be backless, backed with simple back rail, or backed with panel/enclosed back (settle)",
      "Arms may be absent, present as simple posts, or fully panel-enclosed (settle)",
      "Surface may be wood plank, upholstered, hinged storage lid, or context-specific configuration",
    ],
    dimensional_patterns: {
      notes:
        "Length commonly 36-96 inches; institutional and church benches may exceed this. Seat height commonly 16-19 inches. Depth commonly 14-24 inches. Overall height with back commonly 30-60 inches. Stone, cast iron, settle, church, or outdoor benches may exceed 300 pounds.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_compact_single_user_support",
    category: "spatial_behavior",
    name: "Compact Single-User Support",
    family_id: "family_seating",
    description:
      "Compact seating or foot-support furniture without full back structure. Covers stools (single-user seating without back, varying heights from low to bar-height) and ottomans/footstools (foot-support and lounge-zone hybrid forms). Compact-support identity distinguishes these forms from chairs (which have backs) and from benches (which are elongated for multiple users).",
    structural_attributes: [
      "Compact single-user footprint",
      "No full back structure (stool) or no back at all (footstool/ottoman)",
      "Three-leg, four-leg, pedestal, swivel, or frameless support base",
      "Footrest or stretcher may be present on taller stool forms",
      "Ottomans/footstools often upholstered; stools often hard-surface or lightly padded",
    ],
    dimensional_patterns: {
      notes:
        "Height varies dramatically by use class. Low stool/footstool 10-16 inches. Standard stool 16-19 inches. Counter stool 24-27 inches. Bar stool 28-32 inches. Ottoman 12-18 inches typically. Width or diameter commonly 12-24 inches for stools; ottomans 20-48 inches. Storage ottomans and cocktail ottomans may exceed 150 pounds.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_modern_casual_seating",
    category: "spatial_behavior",
    name: "Modern Casual Seating",
    family_id: "family_seating",
    description:
      "Late-20th and 21st century casual seating with frameless, semi-frameless, or alternative-frame structures supporting relaxed body postures. Distinguished from upholstered lounge seating by frame-character (frameless filled bags, bowl-and-cushion bowls, suspended slings) rather than conventional upholstery over wood/metal frame. Forms in this spatial behavior have explicit form-emergence dates from c. 1938 onward.",
    structural_attributes: [
      "Frameless, semi-frameless, or alternative-frame construction",
      "Relaxed body posture orientation (often near-floor or low seat)",
      "Filled-bag construction (bean bag), bowl-and-cushion construction (papasan), or suspended sling construction (butterfly/sling)",
      "Often lightweight relative to seating size",
      "Modern emergence dates — none of these forms exist in pre-1938 American furniture",
    ],
    dimensional_patterns: {
      notes:
        "Highly variable by form. Bean bag chairs commonly 28-60 inches diameter, 18-36 inches height, 5-60 pounds. Papasan chairs commonly 36-54 inches bowl diameter, 12-18 inches seat height. Butterfly/sling chairs commonly 26-36 inches width, 12-18 inches seat height, 8-40 pounds. All forms in this behavior carry explicit form-level date_floor values.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_outdoor_specialty_institutional_seating",
    category: "spatial_behavior",
    name: "Outdoor Specialty and Institutional Seating",
    family_id: "family_seating",
    description:
      "Seating with structurally-distinct identity tied to specific outdoor or institutional contexts beyond simple environmental use-layer. Covers outdoor furniture with structural distinctness sufficient for separate form identification (Adirondack chair plank construction with sloped seat and wide arms; porch/lawn glider mechanical motion mounted on suspended or geared base) and institutional row-seating with mounting/folding structural systems (pew with end panels and book racks; theater/auditorium seat with folding seat pan and cast-iron standards). General outdoor use of standard chairs/benches/sofas is captured as regional_period_notes layer on those forms rather than via this spatial behavior.",
    structural_attributes: [
      "Structurally-distinct outdoor or institutional context-specific design",
      "Plank construction with sloped seat and wide arms (Adirondack)",
      "Mechanical glider mechanism on suspended or geared base (porch glider)",
      "Institutional row-mounting with end panels, book racks, kneelers (pew)",
      "Folding seat pan and cast-iron/steel standards (theater seat)",
    ],
    dimensional_patterns: {
      notes:
        "Highly variable by form. Adirondack: front seat 12-16 inches, overall height 34-40 inches, width 28-34 inches. Porch glider: width 24-72 inches, seat height 15-19 inches. Pew: length 48-144 inches, seat height 16-19 inches, back height 32-42 inches. Theater seat: 18-24 inches per seat, 16-19 inches seat height. All forms carry significant period and context evidence requirements.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  // ============================================================
  // FAMILY: Tables (5 spatial behaviors)
  // ============================================================

  {
    id: "spatial_dining_tables",
    category: "spatial_behavior",
    name: "Dining Tables",
    family_id: "family_tables",
    description: "Supports shared meal activity, central to social interaction.",
    structural_attributes: ["Large central surface", "Stable support system"],
    dimensional_patterns: {
      notes: "Height aligned with seated dining (typically 28-30 inches).",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_expandable_tables",
    category: "spatial_behavior",
    name: "Expandable Tables",
    family_id: "family_tables",
    description: "Allows surface area to increase as needed.",
    structural_attributes: ["Hinged or extendable sections", "Movable components"],
    dimensional_patterns: {
      notes:
        "Variable based on configuration — closed and extended dimensions differ substantially.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_central_support_tables",
    category: "spatial_behavior",
    name: "Central Support Tables",
    family_id: "family_tables",
    description: "Uses a central structural system to support the surface.",
    structural_attributes: ["Pedestal or central base", "Reduced perimeter supports"],
    dimensional_patterns: {
      notes: "Variable.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_auxiliary_tables",
    category: "spatial_behavior",
    name: "Auxiliary Tables",
    family_id: "family_tables",
    description: "Supports secondary or supplemental surface needs.",
    structural_attributes: ["Smaller scale", "Often movable"],
    dimensional_patterns: {
      notes: "Compact relative to dining or central support tables.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_specialty_surface_tables",
    category: "spatial_behavior",
    name: "Specialty Surface Tables",
    family_id: "family_tables",
    description: "Designed for specific surface-based activities.",
    structural_attributes: ["Purpose-built surfaces", "Unique configurations"],
    dimensional_patterns: {
      notes: "Activity-dependent.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  // ============================================================
  // FAMILY: Desks (2 spatial behaviors)
  // ============================================================

  {
    id: "spatial_writing_surfaces",
    category: "spatial_behavior",
    name: "Writing Surfaces",
    family_id: "family_desks",
    description: "Supports writing and administrative tasks in open format.",
    structural_attributes: ["Flat working surface", "Integrated drawers"],
    dimensional_patterns: {
      notes: "Seated-use height (typically 28-30 inches at writing surface).",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_enclosed_workstations",
    category: "spatial_behavior",
    name: "Enclosed Workstations",
    family_id: "family_desks",
    description:
      "Encloses work activity for organization, privacy, or protection. Per the hybrid CL III/CL IV decision (commit 0718ad1 audit entry), desks with mechanical concealment such as roll-top and cylinder desks belong here as forms with mechanical features, not in CL IV.",
    structural_attributes: [
      "Enclosing elements",
      "Mechanical components possible (tambour, cylinder, fall-front systems)",
    ],
    dimensional_patterns: {
      notes: "Slightly larger and deeper than open desks to accommodate enclosing structure.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
];
