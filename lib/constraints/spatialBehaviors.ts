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
  // FAMILY: Seating Furniture (6 spatial behaviors)
  // ============================================================

  {
    id: "spatial_single_user_seating",
    category: "spatial_behavior",
    name: "Single-User Seating",
    family_id: "family_seating",
    description: "Supports one individual in an upright seated position.",
    structural_attributes: ["Seat, back, and leg system", "Ergonomic proportions"],
    dimensional_patterns: {
      notes: "Seat height within human ergonomic range (typically 16-19 inches).",
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
    description: "Introduces controlled movement into seating, typically for comfort.",
    structural_attributes: ["Curved or pivoting base", "Dynamic support system"],
    dimensional_patterns: {
      notes:
        "Similar to single-user seating dimensions, with rocker or pivot base adding to overall footprint.",
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
    description: "Supports extended comfort and relaxation, prioritizing cushioning.",
    structural_attributes: ["Upholstered surfaces", "Deep seating profiles"],
    dimensional_patterns: {
      notes:
        "Larger depth than standard seating to accommodate cushioning and reclined posture.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_multi_user_seating",
    category: "spatial_behavior",
    name: "Multi-User Seating",
    family_id: "family_seating",
    description: "Supports multiple occupants simultaneously.",
    structural_attributes: ["Extended seat width", "Shared structural support"],
    dimensional_patterns: {
      notes:
        "Width significantly greater than single seating — typically scaled to accommodate two or more users.",
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
    description: "Supports reclined or extended body positions.",
    structural_attributes: ["Elongated form", "Adjusted back or support angles"],
    dimensional_patterns: {
      notes: "Length exceeds standard seating to support reclined posture.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_hybrid_bench_seating",
    category: "spatial_behavior",
    name: "Hybrid Bench Seating",
    family_id: "family_seating",
    description: "Combines seating with enclosure or panel-based structure.",
    structural_attributes: [
      "Bench form with enclosed sides or back",
      "Mixed frame and panel construction",
    ],
    dimensional_patterns: {
      notes: "Variable.",
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
