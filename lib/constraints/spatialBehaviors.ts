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
  // FAMILY: Desks (12 spatial behaviors)
  // ============================================================

  {
    id: "spatial_portable_writing_forms",
    category: "spatial_behavior",
    name: "Portable Writing Forms",
    family_id: "family_desks",
    description:
      "Compact, transportable writing furniture designed for use in transit, in the field, or in temporary settings rather than at a fixed location. The portability is structurally defining — the form supports writing while accommodating relocation, military campaign use, ship cabin use, expedition contexts, or generally mobile professional work. Distinguished from Open Writing Stations by reduced scale and built-in transport features (handles, hinges, knockdown construction, fitted carrying cases). Distinguished from Field Desks specifically when the writing surface is fully enclosed within a hinged box rather than supported on legs.",
    structural_attributes: [
      "Portable, transportable, or relocatable construction",
      "Reduced scale relative to fixed-location desks",
      "Hinged, folding, knockdown, or fitted-case construction common",
      "Writing surface may be lid-of-box (writing box), removable panel (tabletop desk), or fold-out (field desk)",
      "Storage typically integrated into transport structure (compartments within the box, fitted drawers within knockdown frame)",
      "Construction supports repeated assembly/disassembly or repeated transport without structural failure",
    ],
    dimensional_patterns: {
      notes:
        "Highly variable by form. Writing boxes commonly 12-20 inches wide, 8-14 inches deep, 4-8 inches tall when closed. Tabletop desks commonly 18-30 inches wide, 12-20 inches deep, 6-12 inches tall. Field desks vary widely from compact (24-36 inches wide when assembled) to officer-scale (36-54 inches wide). Weight typically optimized for portability — most forms 5-40 pounds with knockdown field desks ranging higher when assembled.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_open_writing_stations",
    category: "spatial_behavior",
    name: "Open Writing Stations",
    family_id: "family_desks",
    description:
      "Writing furniture with an open, accessible writing surface and visible storage organization, designed for fixed-location use without enclosed mechanisms or concealment features. Covers French neoclassical bureau plat traditions (flat-top with leather inset and characteristic proportions), French ladies' writing furniture with cabinet superstructure (bonheur du jour), kidney-shaped Victorian/Edwardian writing desks, U-shaped Carlton House desks, and other open-form writing pieces. Distinguished from Fall-Front / Drop-Front Enclosed Desks by absence of concealing mechanism. Distinguished from Tables family writing tables by structural identity as desk-form furniture (often with fitted drawer configurations and writing-specific surface treatments) rather than as adapted general-purpose tables.",
    structural_attributes: [
      "Open, accessible writing surface without enclosing mechanism",
      "Fixed-location construction (not portable)",
      "Drawers, frieze drawers, or cabinet compartments visible or accessible without unlocking/folding",
      "Writing surface often has leather inset, tooled leather panel, or specialized writing finish",
      "Often features period-specific decorative elements (cabriole legs, neoclassical proportions, kidney-shape, U-shape)",
      "Scale supports seated single-user writing work",
    ],
    dimensional_patterns: {
      notes:
        "Width commonly 36-72 inches depending on form. Bureau plat 50-72 inches wide. Bonheur du jour 28-40 inches wide. Kidney desk 42-60 inches wide. Carlton House 48-66 inches wide. Depth commonly 22-36 inches. Height commonly 28-32 inches at writing surface, with bonheur du jour and Carlton House superstructures extending overall height to 38-50 inches. Weight commonly 60-180 pounds depending on construction quality and material.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_kneehole_workstations",
    category: "spatial_behavior",
    name: "Kneehole Workstations",
    family_id: "family_desks",
    description:
      "Desk furniture with a central knee opening flanked by drawer pedestals, designed for seated work with structural drawer access on both sides of the user's seated position. Covers traditional kneehole desks (18th century English/American origins), pedestal desks (19th-20th century broader pattern), Davenport desks (small portable English form with sloped writing surface and side drawers), executive desks (large pedestal variants with suite-coordination context), and credenza desks (credenza serving as primary writing surface). The pedestal-flanked-kneehole structure is the defining spatial behavior — the user sits between drawer storage rather than at a single-side desk configuration.",
    structural_attributes: [
      "Central knee opening (kneehole) for seated user positioning",
      "Drawer pedestals on either side of the kneehole",
      "Writing surface spans across the pedestals and over the kneehole",
      "Often features full-depth drawers in pedestals (typically 3-4 drawers per side)",
      "May include central drawer above kneehole",
      "Scale supports professional/office single-user work",
      "Often part of suite configurations (return, bridge, credenza arrangements)",
    ],
    dimensional_patterns: {
      notes:
        "Width commonly 48-72 inches for standard pedestal/kneehole desks; executive variants 60-84 inches. Depth commonly 28-36 inches. Height commonly 28-31 inches at writing surface. Davenport desks substantially smaller — width 18-24 inches, depth 18-24 inches. Weight commonly 80-300 pounds with executive variants and steel tanker variants reaching 350+ pounds.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_fall_front_drop_front_enclosed_desks",
    category: "spatial_behavior",
    name: "Fall-Front / Drop-Front Enclosed Desks",
    family_id: "family_desks",
    description:
      "Desks with a hinged front panel that drops or falls forward to reveal a writing surface and concealed interior with pigeonholes, small drawers, and document compartments. The enclosing-mechanism is structurally defining and creates concealment when closed. Covers slant-front desks (English/American 18th-19th century with sloped face when closed), fall-front desks (European Continental tradition with vertical face when closed), secretary desks (combined desk + bookcase superstructure), escritoires (French fall-front cabinet desks), secrétaires à abattant (tall vertical French Empire/Restoration tradition), and bureau à gradins (writing desk with tiered superstructure of stepped shelves above writing surface). Distinguished from Roll-Top / Tambour Enclosed by the hinged-flat-panel mechanism vs the rolling-flexible-cover mechanism.",
    structural_attributes: [
      "Hinged front panel that drops or falls forward to expose writing surface",
      "Slant-front geometry (sloped face when closed) or fall-front geometry (vertical face when closed)",
      "Concealed interior with pigeonholes, small drawers, document slots, and writing-tool compartments",
      "Often features lock or latch on the falling front panel for security",
      "Lower case typically contains storage (drawers, cabinet, chest)",
      "Optional upper superstructure (bookcase, tiered shelves, gradins) common in secretary and bureau à gradins forms",
      "Writing surface revealed only when front panel is opened",
    ],
    dimensional_patterns: {
      notes:
        "Width commonly 36-48 inches. Depth commonly 20-28 inches when closed. Height varies dramatically by form: slant-front and fall-front typically 42-52 inches; secretary desks (with bookcase) 72-96 inches; secrétaire à abattant 60-90 inches; bureau à gradins 48-66 inches. Weight commonly 100-400 pounds for substantial period examples.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_roll_top_tambour_enclosed_desks",
    category: "spatial_behavior",
    name: "Roll-Top / Tambour Enclosed Desks",
    family_id: "family_desks",
    description:
      "Desks with a rolling, flexible, or rigid-curved cover mechanism that retracts to expose a writing surface and concealed interior with pigeonholes and small drawers. The rolling/sliding-cover mechanism is structurally defining. Covers roll-top desks (large office-scale flexible tambour mechanism that retracts into a curved housing), cylinder desks (rigid quarter-cylinder cover that lifts as a single piece), tambour desks (smaller domestic-scale vertical-tambour or front-tambour mechanism), and Wooton desks (patented late-19th century American secretary cabinet with rotating central section). Distinguished from Fall-Front / Drop-Front Enclosed by the rolling-cover mechanism vs hinged-flat-panel mechanism.",
    structural_attributes: [
      "Rolling, sliding, or rigid-curved cover mechanism for concealment",
      "Cover retracts into housing (top-roll for roll-top, lift-up for cylinder) or slides vertically (tambour desks)",
      "Concealed interior with extensive pigeonholes, small drawers, document slots, and writing-tool compartments",
      "Lower case typically contains pedestal storage with full-depth drawers",
      "Often features locking mechanism on the cover for overnight security",
      "Cover assembly is a defining structural feature of the form",
    ],
    dimensional_patterns: {
      notes:
        "Roll-top desks commonly 48-66 inches wide, 30-36 inches deep, 44-54 inches tall when cover closed. Cylinder desks similar scale. Tambour desks smaller — 30-42 inches wide. Wooton desks substantial — 42-54 inches wide, 30-36 inches deep, 60-78 inches tall. Weight commonly 150-500 pounds for substantial period examples.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_cabinet_armoire_hideaway_workstations",
    category: "spatial_behavior",
    name: "Cabinet / Armoire / Hideaway Workstations",
    family_id: "family_desks",
    description:
      "Desks integrated into cabinet, armoire, or wardrobe-form furniture where the writing workspace is concealed within enclosed cabinetry when not in use. Distinguished from Fall-Front / Drop-Front Enclosed by the cabinet-form furniture identity (pieces appear as armoires or cabinets when closed, not as recognizable desks) and from Roll-Top / Tambour Enclosed by the door-based concealment mechanism rather than rolling-cover mechanism. Covers armoire desks (factory-built or original-construction desks within armoire/wardrobe forms), hutch desks (desk with integrated upper hutch), and Murphy desks (fold-down wall-mounted desks). The armoire/cabinet identity dominates the visual signature when closed; the desk function is revealed only when doors open.",
    structural_attributes: [
      "Cabinet-form, armoire-form, or wardrobe-form furniture identity dominant when closed",
      "Writing surface concealed behind doors (not behind hinged front panel or rolling cover)",
      "Door-based concealment mechanism (full-height doors covering both writing surface and storage)",
      "Interior writing surface may pull out, fold down, or remain fixed depending on form",
      "Often includes substantial storage above and beside the writing area",
      "Pieces visually similar to non-desk armoires/cabinets when closed",
    ],
    dimensional_patterns: {
      notes:
        "Width commonly 36-54 inches. Depth commonly 22-30 inches. Height substantial — armoire desks 60-84 inches tall; hutch desks 60-78 inches tall (inclusive of upper hutch); Murphy desks vary by configuration but typically 36-72 inches tall when closed against wall. Weight commonly 150-400 pounds for substantial cabinet construction.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_shared_double_sided_workstations",
    category: "spatial_behavior",
    name: "Shared / Double-Sided Workstations",
    family_id: "family_desks",
    description:
      "Desk furniture designed for two or more simultaneous users, with structural configurations supporting bilateral access, face-to-face arrangement, side-by-side seating, or modern open-plan multi-user benching systems. The multi-user structural identity is defining — these are not single-user desks placed adjacent to each other but furniture designed as a single unified piece serving multiple users. Covers partner's desks (large desk with bilateral symmetry; two users facing across single piece; English origin 18th-19th century legal/banking traditions) and benching desks (modern open-plan multi-user shared linear work surface; late-20th and 21st century form).",
    structural_attributes: [
      "Multi-user structural configuration",
      "Bilateral access (drawers/storage on both sides) for partner's desk forms",
      "Single unified piece rather than adjacent multiple pieces",
      "Width substantially exceeds single-user desk scale",
      "Often features symmetrical or repeating structural elements",
      "Modern benching variants emphasize linear/modular configuration",
    ],
    dimensional_patterns: {
      notes:
        "Partner's desks commonly 60-84 inches wide, 40-54 inches deep (deeper than single-user desks to accommodate bilateral users), 30-32 inches tall. Benching desks vary widely by configuration — typically 60-180 inches long depending on user count, 30-36 inches deep per user position. Weight commonly 200-500 pounds for substantial partner's desks.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_commercial_institutional_workstations",
    category: "spatial_behavior",
    name: "Commercial / Institutional Workstations",
    family_id: "family_desks",
    description:
      "Desk furniture designed for commercial, institutional, educational, or ceremonial contexts rather than domestic use. Structural identity is shaped by use-context requirements (ledger work, classroom configuration, customer-counter interaction, ecclesiastical/academic standing use, transaction processing). Covers clerk's desks (high desk with sloped writing surface for ledger work), standing desks (full-height desks for standing use including modern adjustable-height and sit-stand configurations), school desks (student desks with attached or attached-seat configurations), teacher's desks (instructor pedestal desks with classroom-specific configurations), reception desks (counter-style desks for greeting/checking-in visitors), lectern desks (sloped writing surface on standing-height pedestal/column base; ecclesiastical, academic, ceremonial), and transaction counter desks (high counter desks for cashier, teller, sales, customer service contexts). Distinguished from domestic workstation forms by commercial/institutional structural features (durability requirements, customer-facing configurations, classroom-specific elements, ledger-specific slope and height).",
    structural_attributes: [
      "Commercial, institutional, educational, or ceremonial use-context structural features",
      "Often elevated or full-height for standing/clerk use",
      "Customer-facing counter configurations (reception, transaction)",
      "Classroom-specific elements (attached seats, lift-lid mechanisms, tablet arms)",
      "Sloped writing surfaces common for ledger, ecclesiastical, lectern variants",
      "Durability/repeated-use construction (often steel or industrial materials)",
      "Configurations support specific institutional workflows",
    ],
    dimensional_patterns: {
      notes:
        "Highly variable by form. Standing desks 38-46 inches at writing surface (vs 28-32 for seated); modern adjustable variants span 24-50 inches. Clerk's desks similar standing height. School desks scaled to student size — width 18-30 inches, depth 18-24 inches, height variable. Teacher's desks scaled to standard pedestal range — 48-66 inches wide. Reception and transaction counters 42-44 inches tall on customer side. Lectern desks 38-46 inches tall. Weight commonly 50-300 pounds depending on form and construction.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_technical_drafting_professional_workstations",
    category: "spatial_behavior",
    name: "Technical / Drafting / Professional Workstations",
    family_id: "family_desks",
    description:
      "Specialized work surfaces designed for technical, drafting, artistic, or scientific professional work with task-specific structural features (heavy-duty construction, tilting/adjustable surfaces, chemical-resistant materials, integrated equipment). Covers workbench desks (heavy-duty work surface with tool storage and reinforced construction; jeweler/watchmaker/shop variants), artist's desks (tilting/adjustable writing or drawing surface for artistic work), and laboratory desks (science/technical work surface with chemical-resistant materials and equipment integration). Distinguished from Open Writing Stations and Kneehole Workstations by task-specific structural features that adapt the work surface to particular professional requirements.",
    structural_attributes: [
      "Task-specific structural features for technical, artistic, or scientific professional work",
      "Heavy-duty reinforced construction for workbench variants",
      "Tilting/adjustable writing surface for artist variants",
      "Chemical-resistant materials and integrated equipment for laboratory variants",
      "Often modular or bench-style configurations for laboratory and workshop contexts",
      "Storage configurations specialized for tools, drawing materials, or technical equipment",
    ],
    dimensional_patterns: {
      notes:
        "Highly variable by form. Workbench desks 48-72 inches wide, 24-36 inches deep, 32-40 inches tall (often standing-height for shop work). Artist's desks 30-48 inches wide with tilting surfaces 0-90 degrees. Laboratory desks often modular, base configurations 36-72 inches wide, 24-30 inches deep, 32-36 inches tall. Weight commonly 100-400 pounds depending on construction.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_computer_systems_modular_workstations",
    category: "spatial_behavior",
    name: "Computer / Systems / Modular Workstations",
    family_id: "family_desks",
    description:
      "Desk furniture designed for typewriter, computer, or modular office system use, with structural features supporting equipment integration (keyboard trays, monitor surfaces, tower storage, cable management) or modular reconfiguration (panel-based systems, L-shape, U-shape, modular workstations). Covers typewriter desks (mid-20th century desk specifically configured for typewriter use with drop-well configuration), computer desks (configured for computer use with keyboard tray, monitor surface, tower storage), modular workstation desks (modular office system with panel-based configurations), L-shaped desks (right-angle return), and U-shaped desks (two right-angle returns forming U configuration). Distinguished from Kneehole Workstations and Open Writing Stations by equipment-integration structural features that adapt to specific 20th-21st century office equipment requirements.",
    structural_attributes: [
      "Equipment-integration structural features (keyboard tray, monitor surface, tower storage, cable management)",
      "Drop-well configuration for typewriter desk variants",
      "Modular reconfiguration support (panel-based systems, components, returns)",
      "L-shape or U-shape configurations expanding work surface",
      "Often features grommets, cable management channels, or integrated power",
      "20th-21st century office equipment compatibility",
    ],
    dimensional_patterns: {
      notes:
        "Typewriter desks commonly 40-52 inches wide with drop-well at 26-27 inches typing height. Computer desks 42-72 inches wide; corner/L-shape variants 60-84 inches per leg; U-shape variants 60-84 inches per side. Depth commonly 24-30 inches; corner/L/U configurations often deeper at the corner. Height commonly 28-30 inches at writing surface. Weight commonly 80-300 pounds.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_built_in_architectural_desks",
    category: "spatial_behavior",
    name: "Built-In / Architectural Desks",
    family_id: "family_desks",
    description:
      "Desk furniture integrated into room architecture (cabinetry, alcoves, niches, window seats) or wall-mounted as freestanding furniture, where the architectural integration or wall-mounting is structurally defining. Covers built-in desks (desk integrated into room architecture; requires architectural alteration to install/remove), wall desks (wall-mounted freestanding desk; not architecturally integrated; can be removed without altering room structure), and wall unit desks (desk integrated into modular wall unit furniture system). Distinguished from freestanding desk forms by structural relationship to wall or architectural elements; distinguished from Cabinet / Armoire / Hideaway Workstations by the wall-mounting or built-in identity rather than freestanding cabinet identity.",
    structural_attributes: [
      "Architectural integration or wall-mounting structurally defining",
      "Built-in variants require architectural alteration to install/remove",
      "Wall-mounted variants supported by wall fasteners (not freestanding legs)",
      "Wall unit variants integrate into modular wall storage furniture",
      "Often configured to specific room features (alcove dimensions, window seat width, niche depth)",
      "Storage often integrated with architectural cabinetry or wall unit components",
    ],
    dimensional_patterns: {
      notes:
        "Highly variable based on architectural integration. Built-in alcove and niche desks fitted to specific architectural openings. Window seat desks typically 36-72 inches wide, 18-24 inches deep, 28-30 inches tall. Wall-mounted floating desks 36-60 inches wide, 12-24 inches deep. Wall unit desks integrated into 60-120 inch wall unit systems. Weight varies widely; built-in components may not be weighable as discrete pieces.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_convertible_repurposed_desk_forms",
    category: "spatial_behavior",
    name: "Convertible / Repurposed Desk Forms",
    family_id: "family_desks",
    description:
      "Desk furniture with convertible mechanisms (designed-as-convertible) or repurposed identity (originally other furniture, later converted to desk use). Covers two distinct sub-patterns: convertible desks (drop-leaf desks with hinged extension panels; gateleg desks with gateleg extension structure; telephone desks with telephone shelf integration including gossip bench variants; monk's bench desks as convertible bench-and-table pieces) and repurposed/converted desks (factory-built piano-form decorative desks; converted organ desks from pump/reed/parlor organs; converted piano desks from upright/square pianos; converted cabinet desks from armoires/wardrobes/cupboards; converted dresser desks from dressers/chests/vanities; converted industrial desks from workbenches/factory carts/machine bases). The convertible mechanism or conversion identity is structurally defining. Conversion forms preserve evidence of the original furniture identity (piano case proportions, organ housing, dresser drawer banks) and require explicit identification of the conversion in user reports.",
    structural_attributes: [
      "Convertible mechanism (drop-leaf, gateleg, fold-down, hinged conversion) for designed-as-convertible variants",
      "Original furniture identity preserved in repurposed/converted variants",
      "Conversion evidence visible (piano case proportions, organ housing characteristics, dresser drawer construction)",
      "Specialty domestic context for many forms (telephone desks, gossip benches, monk's benches)",
      "Modern repurposing trend for converted industrial desks (mid-20th century to current industrial-style decor)",
      "Identification requires recognizing both desk-use configuration and original-furniture origins",
    ],
    dimensional_patterns: {
      notes:
        "Highly variable by form. Drop-leaf desks 36-54 inches wide closed, expanding 12-24 inches per leaf. Gateleg desks similar. Telephone desks compact 18-30 inches wide, 14-22 inches deep with integrated seat or shelf. Monk's bench desks 42-66 inches wide. Piano desks (factory-built decorative) variable, often 30-54 inches wide. Converted piano desks reflect original piano case proportions — upright piano shells 56-66 inches wide, 22-28 inches deep. Converted organ desks reflect pump organ proportions — 36-54 inches wide. Converted cabinet/dresser desks reflect original storage furniture proportions. Converted industrial desks reflect original workbench/factory cart proportions.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_transitional_access_support",
    category: "spatial_behavior",
    name: "Transitional Access Support",
    family_id: "family_entry_support_forms",
    description:
      "Organizes space near entry points to support short-duration, transitional interactions, such as arriving, departing, staging personal items, or preparing garments and accessories before leaving the home. Forms in this behavior are vertical, compact, and provide hooks, hangers, compartments, or platforms for hats, coats, umbrellas, canes, suits, ties, or smoking-related personal items. Construction emphasizes durability against frequent contact, often with mirrors or seating integrated.",
    structural_attributes: [
      "Vertical or near-vertical orientation as the dominant spatial axis",
      "Hook, peg, hanger, or compartment provision for garments and accessories",
      "Compact horizontal footprint relative to height",
      "Often integrated mirror, bench, or storage compartment",
      "Frequent contact wear surfaces designed for durability",
      "Located in entry zones or transitional spaces between rooms",
    ],
    dimensional_patterns: {
      notes:
        "Heights typically 60-84 inches for freestanding forms; widths 18-36 inches; depths 12-24 inches. Wall-mounted variants 18-48 inches wide with shallower depths 4-12 inches. Hook heights typically 60-72 inches above floor.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_display_and_plant_support_stands",
    category: "spatial_behavior",
    name: "Display and Plant Support Stands",
    family_id: "family_entry_support_forms",
    description:
      "Vertical pedestals, columns, plinths, and stands designed to elevate, support, and display sculptural objects, plants, urns, aquariums, or other static display contents. Forms emphasize stability under top-loading weight, vertical proportional emphasis to elevate the displayed object above adjacent furniture height, and finished surfaces on all sides since the form is typically viewed from multiple angles. Distinct from Garment and Personal Item Stands by their object-display purpose rather than transitional human use.",
    structural_attributes: [
      "Vertical or columnar primary axis with display surface at top",
      "Top-load stability engineering (broad base, low center of gravity, weight reinforcement)",
      "All-sides finish (no clearly defined back) since viewable from any angle",
      "Single-purpose elevation rather than multi-function support",
      "Top surface dimensions matched to typical display object proportions",
      "Often classical column or pedestal styling cues",
    ],
    dimensional_patterns: {
      notes:
        "Heights 24-60 inches typical, with display pedestals frequently 30-42 inches and tall plant pedestals reaching 48-60 inches. Top dimensions 10-18 inches square or round; bases broader 14-24 inches for stability. Plant stands often have multi-tier configurations adding 12-24 inches per tier.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_mirror_and_screen_forms",
    category: "spatial_behavior",
    name: "Mirror and Screen Forms",
    family_id: "family_entry_support_forms",
    description:
      "Vertical reflective or visual-barrier furniture forms that create spatial divisions, reflect light, or define privacy zones without enclosing space. Mirrors provide reflective surface; screens provide opaque or semi-opaque vertical barrier. Both share the structural behavior of vertical surfaces that articulate space without containing it. Forms range from floor-standing to wall-mounted; from rigid frames to articulated folding panels.",
    structural_attributes: [
      "Vertical surface as the primary spatial element",
      "Either reflective glass (mirrors) or opaque/semi-opaque panels (screens)",
      "Frame or support structure that holds the surface in stable vertical position",
      "Often articulated with hinges (folding screens), pivots (cheval mirrors), or fixed mounts (wall mirrors)",
      "Surface dimensions calibrated for human height and viewing distance",
      "Typically two-sided or back-finished for free-standing examples",
    ],
    dimensional_patterns: {
      notes:
        "Floor-standing examples 60-84 inches tall, 24-72 inches wide. Folding screens 60-78 inches tall, 12-24 inches per panel × 3-6 panels. Wall mirrors 24-96 inches in their dominant dimension. Cheval mirrors typically 60-72 inches tall on tilting frames. Pier mirrors often very tall (84-120 inches) for stair-hall placement.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_communication_and_tech_support_stands",
    category: "spatial_behavior",
    name: "Communication and Tech Support Stands",
    family_id: "family_entry_support_forms",
    description:
      "Compact stands and small cabinets designed to support communication devices, charging hardware, and small-scale technology equipment in transitional or near-entry positions. Forms emphasize device accommodation through dedicated shelves, ports, recesses, or compartments. Distinct from full Computer/Systems/Modular Workstations (Desks family) by their compact passive-support scale rather than active workstation use; the user interacts with the housed device, not with a writing or work surface integrated into the form.",
    structural_attributes: [
      "Compact horizontal footprint with vertical or compact-stand proportions",
      "Device-specific accommodation: phone shelf, charging dock, parcel compartment, cable management",
      "Surface scale matched to the supported device rather than to writing or working tasks",
      "Often integrated with adjacent seating, drawer, or directory storage",
      "Modern variants include integrated USB ports, charging circuitry, smart-package compartments",
    ],
    dimensional_patterns: {
      notes:
        "Heights 28-44 inches for stand types; widths 18-36 inches; depths 12-20 inches. Wall-mounted variants 12-24 inches wide. Charging towers/columns 36-72 inches tall. Package stations significantly larger when designed for full parcel reception (up to 60 inches tall, 18-24 inches deep).",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_personal_hygiene_stands",
    category: "spatial_behavior",
    name: "Personal Hygiene Stands",
    family_id: "family_entry_support_forms",
    description:
      "Vertical or compact-stand furniture forms supporting personal hygiene activities through basin support, water containment, towel hanging, or shaving accommodation. Forms predate plumbed bathrooms and reflect domestic hygiene patterns of the 18th-19th centuries; later forms persist as auxiliary or stylistic furniture. Distinct from Display and Plant Support Stands by their human-use orientation (basins held water for active use, not display) and from Communication and Tech Support Stands by their water-handling and personal-care function.",
    structural_attributes: [
      "Top surface designed to support a water basin or pitcher",
      "Often integrated lower shelf, towel rail, or splash board",
      "Water-resistant finishes or surface treatments",
      "Compact horizontal footprint with body-scale proportions",
      "Towel rails or drying racks frequent at top or sides",
      "Splash backs or marble tops common in 19th-century examples",
    ],
    dimensional_patterns: {
      notes:
        "Heights 30-36 inches typical (basin top at convenient working height); widths 18-30 inches; depths 16-22 inches. Towel rails extend 8-14 inches above. Lower shelves typically 8-12 inches above floor.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_container_and_box_forms",
    category: "spatial_behavior",
    name: "Container and Box Forms",
    family_id: "family_entry_support_forms",
    description:
      "Small to medium portable container furniture forms — boxes, caskets, caddies, slopes — that hold and protect specific contents through enclosed volume rather than open shelving or vertical hanging. Forms range from miniature jewelry boxes to lap-sized writing slopes to medium-scale candle boxes and Bible boxes. Distinct from full case furniture (chests, cabinets, armoires) by their portable scale, single-volume interior, and frequent specialized content fit; distinct from baskets by their rigid, lidded, joinery-based construction.",
    structural_attributes: [
      "Enclosed volume with hinged, lifting, or sliding lid",
      "Rigid construction (joined wood, dovetailed corners, mitered frames)",
      "Specialized interior often fitted to specific content (jewelry compartments, ink wells, candle holders, writing surfaces)",
      "Portable scale — typically liftable by one or two hands",
      "Surface decoration frequent (inlay, marquetry, painted decoration, engraved metalwork)",
      "Locks, hasps, or latches common to secure contents",
    ],
    dimensional_patterns: {
      notes:
        "Footprints range from 4×4 inches (ring boxes) to 24×18 inches (large document boxes). Heights 2-12 inches typical. Writing slopes when open present an angled surface 14-22 inches deep at 8-12 degrees. Lap desks 16-22 inches wide × 12-16 inches deep × 4-8 inches tall closed.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_specialty_body_support_frames",
    category: "spatial_behavior",
    name: "Specialty Body Support Frames",
    family_id: "family_entry_support_forms",
    description:
      "Large free-standing frame furniture forms that support a body or body-vessel without being seating, beds, or workstations themselves. Forms include hammock stands (supporting hammocks for human rest) and funeral biers (supporting coffins or caskets during ceremonial display). Despite very different cultural contexts (recreation vs. ritual), these share the structural behavior of large open frames designed to support a horizontal body-scale element from below or between vertical posts. Frame dimensions are scaled to typical body or vessel length.",
    structural_attributes: [
      "Large open frame structure with vertical posts or end supports",
      "Horizontal span between supports calibrated to body or vessel length (60-84 inches typical)",
      "Lateral stability through broad base or floor-anchoring",
      "Hooks, brackets, hangers, or platforms to receive the supported element",
      "Often portable through disassembly or wheels (more common in funeral biers than hammock stands)",
      "Materials emphasize tension strength (hammock stands) or static load capacity (biers)",
    ],
    dimensional_patterns: {
      notes:
        "Length 72-96 inches typical (matching adult human or coffin length). Heights 36-72 inches for hammock stands, 18-36 inches for biers (lower for ceremonial viewing). Width/footprint 24-48 inches for stability.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_domestic_specialty_storage_and_organization",
    category: "spatial_behavior",
    name: "Domestic Specialty Storage and Organization",
    family_id: "family_entry_support_forms",
    description:
      "Specialized domestic furniture forms organized around a specific household activity, occupant, or zone — children's toy storage, mudroom utility benches, entry-zone organizers, pet utility forms. Forms emphasize content-specific accommodation (child-accessible heights, footwear cubbies, leash hooks, food bowl recesses) rather than generic storage capacity. Distinct from general storage furniture by their function-specific design and from institutional fixtures by their domestic context and scale.",
    structural_attributes: [
      "Function-specific accommodation features (child-scale heights, animal-scale openings, shoe-shaped cubbies)",
      "Domestic-context construction (residential materials and finishes, not institutional grade)",
      "Compact horizontal footprint suited to entry zones, mudrooms, nursery rooms, or pet feeding areas",
      "Frequently combines storage with bench seating, hooks, or organizational compartments",
      "Modern materials (plywood, MDF, painted finishes, plastic bins) common in 20th-century-and-later examples",
    ],
    dimensional_patterns: {
      notes:
        "Heights vary by function: child-accessible toy storage 18-30 inches; mudroom benches 16-20 inches seat height with cubbies above to 60 inches; pet feeding stations 6-18 inches; entry organizers 60-84 inches when wall-spanning. Widths 24-60 inches typical; depths 12-24 inches.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_baskets",
    category: "spatial_behavior",
    name: "Baskets",
    family_id: "family_baskets",
    description:
      "Portable woven container behavior characterized by interwoven flexible materials forming walls and floor, rather than rigid joinery. Baskets serve carrying, gathering, storage, sorting, protection, and display functions across agricultural, domestic, commercial, textile, decorative, and maritime contexts. Construction emphasizes weaving technique (reed, cane, willow, splint, wicker, rattan, ash, oak, fiber) and produces lightweight, often ventilated, hand-portable forms. Distinct from box forms by woven rather than joined construction; distinct from crates by lighter, more flexible structure; distinct from hampers by typically smaller scale and broader use range.",
    structural_attributes: [
      "Woven wall construction through interlaced flexible materials",
      "Flexible or semi-rigid material systems (reed, cane, willow, splint, wicker, rattan, fiber)",
      "Open or lidded forms; carry handles common",
      "Rounded, oval, rectangular, or tapered profiles",
      "Hand-portable scale and weight",
      "Often ventilated through gaps in weave structure",
    ],
    dimensional_patterns: {
      notes:
        "Highly variable by subtype. Sewing baskets compact at 8-14 inches wide × 6-10 inches deep × 4-8 inches tall. Market baskets 14-20 inches across. Laundry baskets large at 24-30 inches across × 14-20 inches tall. Nantucket baskets 6-14 inches diameter for typical examples. Heights generally proportional to function: shallow for gathering, taller for storage, deep for waste or laundry.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_floor_standing_lighting",
    category: "spatial_behavior",
    name: "Floor-Standing Lighting",
    family_id: "family_lighting",
    description:
      "Vertical floor-set lighting behavior where light sources are elevated on tall shafts with weighted bases. Forms stand independently on the floor without requiring tables, walls, or ceilings for support. Light direction varies: upward illumination (torchères for indirect ceiling wash), downward task lighting (reading lamps with adjustable shades), or lateral throw over seating (bridge lamps with projecting arms). Distinct from surface-set lighting by floor-anchored vertical proportions; distinct from suspended lighting by ground-up rather than ceiling-down placement.",
    structural_attributes: [
      "Tall vertical shaft as dominant spatial axis",
      "Weighted base for floor-set stability",
      "Light source elevated above ordinary table height",
      "Light-source accommodation: candle cup (early), gas burner (mid-19th century), electric socket (late 19th century onward)",
      "Often features adjustable shade or arm for task light direction",
      "Independent ground-up placement without architectural support",
    ],
    dimensional_patterns: {
      notes:
        "Heights typically 48-72 inches matching standing-eye and seated-reading-position illumination. Bases broader 10-18 inches diameter for stability against accidental contact. Bridge lamps add 12-18 inches of horizontal arm projection beyond vertical shaft footprint.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_surface_set_lighting",
    category: "spatial_behavior",
    name: "Surface-Set Lighting",
    family_id: "family_lighting",
    description:
      "Portable or semi-portable lighting behavior where the form rests on a table, mantel, dresser, or other horizontal furniture surface. Forms emphasize compact footprint suited to surface placement, base stability against accidental contact, and proportions matched to the human-scale surface they occupy. Includes single-light forms (table lamps, banker's lamps) and multi-light forms (candelabra). Distinct from floor-standing lighting by surface-set rather than ground-anchored placement; distinct from wall-mounted lighting by portability and surface-set rather than architectural-attachment configuration.",
    structural_attributes: [
      "Compact base proportions suited to surface placement",
      "Weight distribution favoring base stability against accidental contact",
      "Light source at human-scale reading or ambient height when placed on tables/desks/mantels",
      "Single-light or multi-light configuration with light-source accommodation matched to fuel system (candle, oil, kerosene, gas, electric)",
      "Often features decorative shade, globe, or chimney",
      "Portable scale liftable for surface relocation",
    ],
    dimensional_patterns: {
      notes:
        "Heights typically 12-30 inches matched to table-set or mantel-set placement. Base diameters 4-10 inches for stable surface footprint. Candelabra heights similar (12-24 inches) with multi-arm spread 8-18 inches across.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_wall_mounted_lighting",
    category: "spatial_behavior",
    name: "Wall-Mounted Lighting",
    family_id: "family_lighting",
    description:
      "Architecturally-attached lighting behavior where the form is mounted directly to a wall or vertical architectural surface via backplate and bracket structure. Light projects from the wall plane via candle cup, gas burner, or electric socket on a projecting arm or bracket. Forms are fixed in place rather than portable; integration with building structure and architectural style is characteristic. Distinct from surface-set lighting by architectural rather than furniture-surface placement; distinct from suspended lighting by wall-plane rather than ceiling-plane attachment.",
    structural_attributes: [
      "Backplate mounted to wall surface as primary attachment point",
      "Bracket or projecting arm extending light source outward from wall plane",
      "Fixed wall orientation rather than portable",
      "Light-source accommodation: candle cup, gas burner with valve, or electric socket — often with associated wiring or gas piping integrated through wall",
      "Symmetrical or directional projection determined by wall placement context",
      "Often paired or grouped for symmetric architectural composition",
    ],
    dimensional_patterns: {
      notes:
        "Backplate dimensions 4-10 inches in dominant axis. Projection from wall 4-12 inches for typical sconces; longer 12-18 inches for gas brackets with adjustable swivel arms. Mounting heights typically 60-72 inches above floor for face-height illumination.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_suspended_lighting",
    category: "spatial_behavior",
    name: "Suspended Lighting",
    family_id: "family_lighting",
    description:
      "Ceiling-suspended lighting behavior where the form hangs from a ceiling attachment via chain, rod, cord, or cable. Light projects downward and outward from the suspended fixture into the room volume below. Forms include multi-arm chandeliers, single-bulb pendants, enclosed lanterns, and hall lanterns. Suspension allows fixture to be positioned at optimal room-illumination height (typically 30-40 inches above table surfaces or 80-90 inches above floor in open rooms). Distinct from wall-mounted lighting by ceiling rather than wall attachment; distinct from floor-standing and surface-set lighting by overhead rather than ground-or-surface placement.",
    structural_attributes: [
      "Ceiling attachment point as primary structural anchor",
      "Suspension element (chain, rod, cord, cable) supporting fixture weight",
      "Light source(s) positioned in room interior space below ceiling",
      "Downward and outward light projection into room volume",
      "Light-source accommodation: multiple candle cups (chandeliers, historical), gas burners (gaslight era), or electric sockets (late 19th century onward)",
      "Often features decorative elements (crystals, shades, lantern glazing) visible from below",
    ],
    dimensional_patterns: {
      notes:
        "Drop length from ceiling 12-36 inches for typical pendants; longer 36-60 inches for multi-tier chandeliers. Fixture diameters 12-36 inches for typical chandeliers; smaller 6-12 inches for single-bulb pendants. Hall lanterns intermediate 10-18 inches across.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_vertical_reading_and_speaking_stands",
    category: "spatial_behavior",
    name: "Vertical Reading and Speaking Stands",
    family_id: "family_industrial_professional",
    description:
      "Stand-based behavior where forms present material at an angled or vertical reading or display plane for a standing reader, speaker, performer, or audience. Forms support reading papers (lecterns, pulpits), musical scores (music stands), visual material (easels), or speaker presence behind a fixed station (podiums). Construction emphasizes a tall vertical support shaft or pedestal, an inclined or vertical work surface or ledge, and stability against forward-leaning use. Distinct from other workplace-fixture behaviors by speaker-oriented or display-oriented vertical-plane work surface rather than horizontal storage or transaction-counter use.",
    structural_attributes: [
      "Tall vertical support shaft or pedestal with weighted base",
      "Inclined or vertical work surface or ledge for reading material, score, canvas, or speaker support",
      "Standing-user ergonomics: ledge or work surface height matched to standing reading or speaking position",
      "Often featuring book ledge, pen rest, page-stop, clamp, tripod prop, or similar material-retention feature",
      "Stability against forward-leaning use (broad base, weighted construction, floor anchoring in fixed examples)",
      "Public, institutional, religious, educational, or performance use contexts predominant",
    ],
    dimensional_patterns: {
      notes: "Reading/speaking surface heights typically 42-48 inches matching standing-user ergonomics. Base footprints 14-24 inches across for stability. Easel mast heights extend higher (60-84 inches) when supporting full-canvas display.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_personal_service_stations",
    category: "spatial_behavior",
    name: "Personal Service Stations",
    family_id: "family_industrial_professional",
    description:
      "Service-counter behavior where forms provide a fixed station for a service provider to deliver personal-care services to a seated or standing client. Forms include barber stations and salon stations with specialized client-facing layouts: mirror, drawer storage for tools, counter ledge for product placement, electrical outlets for clippers/dryers, and accommodation for an adjacent client chair (typically a separate fixture but spatially integrated). Construction emphasizes client-and-provider ergonomic alignment, mirror integration, and service-workflow storage.",
    structural_attributes: [
      "Vertical mirror integrated into back or upper portion of station",
      "Counter ledge or work surface at standing-service height (typically 30-36 inches)",
      "Drawer or compartment storage for combs, brushes, scissors, clippers, dryers, product bottles",
      "Often with electrical outlets for service tools",
      "Wall-mounted or counter-anchored fixed installation",
      "Client-seat-adjacent placement (typically a separate barber/salon chair fixture)",
    ],
    dimensional_patterns: {
      notes: "Counter heights 30-36 inches. Widths 24-48 inches per station. Mirror dimensions vary; typical 24-36 inches wide × 30-48 inches tall. Drawer storage configurations vary by service type.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_kitchen_and_utility_workstations",
    category: "spatial_behavior",
    name: "Kitchen and Utility Workstations",
    family_id: "family_industrial_professional",
    description:
      "Utility-counter behavior where forms provide a fixed workstation for kitchen, scullery, pantry, or domestic-utility tasks. Includes dry sinks (water-management without plumbing), and kitchen utility units (compartmentalized food-prep stations, often with built-in flour bins, sifters, baking surfaces, or storage). Construction emphasizes water-and-food-safe surfaces, integrated functional features (zinc-lined wells, marble pastry slabs, bread drawers), and durable utilitarian materials. Distinct from domestic dining furniture (Dining family) by utility-workstation rather than meal-service orientation.",
    structural_attributes: [
      "Counter or work surface at standing-task height (typically 32-36 inches)",
      "Often integrated functional features: zinc-lined well, marble slab, bread drawer, flour bin with sifter, knife or utensil storage",
      "Durable surfaces suited to water, flour, oil, and food contact",
      "Storage below work surface (drawers, cabinets, bin)",
      "Wall-anchored or freestanding kitchen placement",
      "Pre-plumbing era examples emphasize water-management features (drainboards, splashguards) without integrated pipes",
    ],
    dimensional_patterns: {
      notes: "Work surface heights 32-36 inches. Widths 36-60 inches typical for single units; larger compound units up to 84 inches. Depths 20-28 inches matching kitchen counter conventions.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_retail_and_commercial_fixtures",
    category: "spatial_behavior",
    name: "Retail and Commercial Fixtures",
    family_id: "family_industrial_professional",
    description:
      "Commercial-display behavior where forms support customer-facing retail, hospitality, or service operations. Includes kiosks (small enclosed sales/information stations), showcases (glazed display fixtures for merchandise), retail fixtures (counters, gondolas, display racks integrated into store layout), hospitality fixtures (bar fronts, check-in counters, service stations), and beverage service forms (soda fountains, coffee bars, tap fronts). Construction emphasizes customer-facing visual presentation, transaction-surface ergonomics, durable public-use materials, and often integrated lighting and display infrastructure. Distinct from domestic furniture by commercial-context construction, scale, and customer-facing display orientation.",
    structural_attributes: [
      "Customer-facing display or transaction surface as primary spatial axis",
      "Glazed display panels (showcases) or open shelving (gondolas) for merchandise visibility",
      "Counter heights matched to standing customer-and-staff transaction ergonomics (typically 36-42 inches)",
      "Durable public-use materials and finishes (laminate, metal, hardwood, glass)",
      "Often integrated lighting, signage, branding, or display infrastructure",
      "Commercial-context placement: retail floor, hotel lobby, restaurant, bar, foodservice operation",
    ],
    dimensional_patterns: {
      notes: "Counter heights 36-42 inches (taller than residential to accommodate standing customer-staff transactions). Widths and configurations vary widely by use: kiosks 24-48 inches; showcases 36-96 inches; gondolas and retail fixtures up to room-spanning lengths; hospitality bar fronts often 60-120 inches.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_specialized_storage_and_organization",
    category: "spatial_behavior",
    name: "Specialized Storage and Organization",
    family_id: "family_industrial_professional",
    description:
      "Institutional-storage behavior where forms organize equipment, supplies, materials, or personal items within workplace, educational, or operational settings. Includes racks (open multi-shelf storage for tools, supplies, or equipment), lockers (secure compartmentalized personal storage), educational fixtures (school cabinets, library cases, classroom storage), built-in storage (architectural casework integrated into walls or rooms), and shelving systems (modular or fixed multi-tier shelving). Construction emphasizes utility-oriented durability, often-modular or repeated layouts, and storage capacity calibrated to institutional use. Distinct from domestic storage (Bedroom/General Storage families) by institutional scale, public/workplace context, and utilitarian construction.",
    structural_attributes: [
      "Multi-compartment or multi-shelf layout optimized for storage capacity",
      "Durable utilitarian materials: steel, heavy hardwood, laminate, industrial-grade construction",
      "Often modular or repeated configurations (locker rows, shelving units, gondola sections)",
      "Institutional-context placement: schools, factories, offices, gyms, libraries, warehouses, public buildings",
      "Secure-access features where applicable (locks, hasps, key cylinders)",
      "Identification or labeling provisions (number plates, slot labels, badge holders)",
    ],
    dimensional_patterns: {
      notes: "Heights vary widely: shelving systems 60-96 inches floor-to-ceiling; lockers 60-84 inches typical; built-in storage from wall-height base cabinets (36 inches) to full-height casework (96+ inches). Widths and configurations vary by application.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_religious_and_ceremonial_fixtures",
    category: "spatial_behavior",
    name: "Religious and Ceremonial Fixtures",
    family_id: "family_industrial_professional",
    description:
      "Sanctuary-furnishing behavior where forms support worship, ritual, prayer, music, or ceremonial functions in religious institutional contexts. Includes altars (sacred tables for communion and offerings), communion rails (sanctuary-boundary kneeling supports), church pews (congregational row seating), choir stalls (chancel-area choir/clergy seating), confessionals (sacramental confession enclosures), deacons' benches (church/meetinghouse seating), prayer kneelers (devotional supports), candle stands (liturgical candle support), and processional stands (ceremonial-staff holders). Construction emphasizes liturgical placement, religious symbolism, denominational specificity, sanctuary-woodwork coordination, and durable public-worship use. Distinct from domestic seating and storage by sacred-use context, sanctuary placement, and ritual function.",
    structural_attributes: [
      "Liturgical placement: sanctuary, chancel, altar zone, congregational seating area, sacristy",
      "Religious symbolism: crosses, religious carving, denominational iconography, sanctuary-coordinated woodwork",
      "Durable public-worship materials and construction (heavy hardwood, carved oak, painted pine depending on denomination and period)",
      "Often denomination-specific: Catholic altar vs. Protestant communion table; pew rows vs. open meetinghouse seating; confessional vs. open Protestant practice",
      "Repeated congregational seating (pews, choir stalls) in row-based layouts",
      "Ritual-function support: altar mensa, communion rail kneeling cushion, prayer kneeler padding, candle stand sockets",
    ],
    dimensional_patterns: {
      notes: "Pew seat heights 16-18 inches matching general seating; pew lengths 96-144 inches accommodating multiple congregants. Altar heights 36-42 inches for celebrant access. Lectern/pulpit heights 42-48 inches (overlap with vertical reading/speaking stands behavior but liturgical context places them here when they're part of sanctuary furnishings). Candle stand heights vary from altar-set 12-24 inches to floor-standing 48-72 inches for vigil or processional stands.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_scientific_equipment_stands",
    category: "spatial_behavior",
    name: "Scientific Equipment Stands",
    family_id: "family_industrial_professional",
    description:
      "Specialized-mount behavior where forms support scientific instruments, laboratory equipment, observational devices, or research apparatus. Construction emphasizes precision mounting, stability against vibration, instrument-specific accommodation (microscope stages, telescope mounts, balance platforms, retort stands), and often adjustability for instrument calibration or operator ergonomics. Distinct from general utility cabinets or workstations by instrument-specific mounting requirements and research-context construction.",
    structural_attributes: [
      "Precision mounting surface or platform calibrated to specific instrument",
      "Stability emphasis: heavy base, vibration damping, often stone or hardwood top surfaces",
      "Adjustability for instrument calibration (height, tilt, leveling) or operator ergonomics",
      "Instrument-specific accommodation: microscope stage, balance platform, telescope mount, retort rack, optical-bench rail",
      "Often features storage or organization for instrument accessories (slides, weights, lenses, glassware)",
      "Laboratory, observatory, classroom, or research-institution placement",
    ],
    dimensional_patterns: {
      notes: "Working surface heights typically 30-36 inches for benchtop use; observation-platform heights may be lower (24-30 inches) for seated instrument use. Base footprints emphasize stability (often broader than working surfaces). Heights and configurations vary widely by instrument type.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_institutional_and_workplace_fixtures",
    category: "spatial_behavior",
    name: "Institutional and Workplace Fixtures",
    family_id: "family_industrial_professional",
    description:
      "Institutional-fixture behavior where forms support workplace, public-service, or operational functions through specialized fixed installations. Includes cabinets of curiosities (specimen-and-artifact display cases), time clock stations (attendance-recording fixtures), safety fixtures (emergency-equipment housings), industrial stations (factory or workshop fixed workstations), and bank fixtures (teller cages, vault fronts, safe door assemblies). Construction emphasizes institutional-context durability, workflow-specific feature integration (locks, mechanisms, security features, specimen displays), and public-or-employee-facing visibility. Distinct from broader specialized storage by purpose-built operational role rather than general storage; distinct from retail fixtures by employee/institutional rather than customer-facing orientation.",
    structural_attributes: [
      "Purpose-built operational role: timekeeping, safety equipment access, specimen display, industrial workflow, financial-service handling, security",
      "Often integrated mechanical or electronic features (punch clocks, locks, vault mechanisms, alarm systems, electronic access controls)",
      "Institutional placement: factories, offices, banks, museums, public buildings, courthouses, schools, hospitals",
      "Durable construction calibrated to public/employee use intensity (heavy steel, hardwood, marble, security glazing depending on application)",
      "Identification, labeling, or branding (employee names, instrument labels, vault maker plates, safety signage)",
      "Wall, floor, or ceiling anchoring common (fixed installation rather than portable)",
    ],
    dimensional_patterns: {
      notes: "Highly variable by fixture type. Time clock stations 36-48 inches wall mount; safety fixtures range 12-36 inches; bank teller cages 60-96 inches per bay with multi-bay row configurations; cabinet of curiosities 60-96 inches tall display case; industrial stations 36-72 inches per workstation.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_workstation_accessories_and_mobile_fixtures",
    category: "spatial_behavior",
    name: "Workstation Accessories and Mobile Fixtures",
    family_id: "family_industrial_professional",
    description:
      "Mobile or accessory behavior where forms supplement primary workstations through portability, modular accessories, or rolling utility carts. Includes workstation accessories (return desks, side units, modular extensions), and utility carts (rolling industrial, medical, library, or service carts). Construction emphasizes portability (casters, lightweight construction) or modular integration with primary workstations. Distinct from primary workstation fixtures by accessory-or-mobile rather than primary role; distinct from domestic carts by industrial-or-institutional context and durability.",
    structural_attributes: [
      "Mobility provision: casters, wheels, handles, lightweight construction",
      "Accessory or modular integration with primary workstations",
      "Compact or moderate scale for mobility or modular fit",
      "Durable utilitarian materials and finishes",
      "Often feature locking-caster brakes for fixed-position use",
      "Industrial, institutional, medical, library, or service-context placement",
    ],
    dimensional_patterns: {
      notes: "Cart heights typically 30-42 inches. Cart footprints 18-36 inches × 24-48 inches. Workstation accessory dimensions vary by primary workstation system; typical secondary surfaces 24-48 inches wide × 18-24 inches deep.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },

  {
    id: "spatial_environmental_control_cabinets",
    category: "spatial_behavior",
    name: "Environmental Control Cabinets",
    family_id: "family_industrial_professional",
    description:
      "Climate-and-storage-control behavior where forms maintain specific environmental conditions (temperature, humidity, ventilation, lighting) for stored contents. Includes humidors (humidity-controlled tobacco/cigar storage), wine storage cabinets (temperature-and-humidity-controlled wine racking), curing cabinets (food or material curing under controlled conditions), and other specialized environmental cabinets. Construction emphasizes sealed enclosure, internal climate-control mechanisms (humidification, refrigeration, temperature regulation), and contents-specific internal organization (cigar trays, wine racks, curing hooks). Distinct from general storage by active environmental-control function.",
    structural_attributes: [
      "Sealed or semi-sealed enclosure with insulated walls and gasketed doors",
      "Internal climate-control mechanism: humidification system, refrigeration, temperature regulation, ventilation",
      "Contents-specific internal organization: cigar trays, wine bottle racks, curing hooks, specimen shelving",
      "Often features external climate displays or monitoring (hygrometer, thermometer)",
      "Premium or specialized materials: hardwood (cigar humidors), refrigerated metal (wine cabinets), often glazed doors",
      "Commercial or premium-residential placement: tobacconist shops, wine cellars, food production, premium home contexts",
    ],
    dimensional_patterns: {
      notes: "Heights typically 24-72 inches for premium cabinets. Widths 18-48 inches. Depths 16-28 inches accommodating internal racking and climate-control equipment. Walk-in commercial variants extend to room-scale dimensions.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_floor_standing_clocks",
    category: "spatial_behavior",
    name: "Floor-Standing Clocks",
    family_id: "family_clock_cases",
    description:
      "Floor-standing horological behavior where the clock case occupies full vertical height from floor to upper hood, providing space for long pendulum chambers, weight drops, and prominent dial presentation at upper architectural focal height. Forms support weight-driven or spring-driven longcase clock movements with pendulum lengths requiring substantial vertical accommodation. Construction emphasizes full-height freestanding cabinet form combining horology with cabinetmaking, featuring a hood or bonnet section containing the dial, a long central trunk housing the pendulum and weights, and a base plinth or bracket-foot lower section. Distinct from wall-mounted and surface-set clock behaviors by floor placement, full-height proportions, and ability to accommodate long-pendulum movements.",
    structural_attributes: [
      "Full-height freestanding cabinet construction extending from floor to upper hood",
      "Hood or bonnet section containing dial at upper architectural focal height",
      "Long central trunk section housing pendulum and weights",
      "Base plinth or bracket-foot lower section providing floor contact and visual anchor",
      "Access doors frequently present for movement maintenance and weight rewinding",
      "Pendulum window common in later examples allowing visible pendulum motion",
      "Architectural cabinet construction combining horological function with formal furniture presentation",
    ],
    dimensional_patterns: {
      notes: "Total height typically 72-96 inches for grandfather variants; 60-72 inches for grandmother; 48-60 inches for granddaughter. Width 14-22 inches at trunk widening to 18-28 inches at hood. Depth 8-14 inches accommodating pendulum swing. Substantial weight (60-200 lbs) reflecting hardwood case construction and weight-driven movement components.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_wall_mounted_clocks",
    category: "spatial_behavior",
    name: "Wall-Mounted Clocks",
    family_id: "family_clock_cases",
    description:
      "Wall-mounted horological behavior where the clock case is suspended or affixed to vertical wall surface rather than floor-standing or surface-set. Forms emphasize visual accessibility and reduced floor-space occupation, supporting spring-driven or pendulum-regulated movements within compact vertical or circular case profiles. Construction emphasizes rear hanging systems, wall-anchored mounting, and dial presentation at viewer eye height. Variants range from decorative Federal-era banjo clocks to precision regulator clocks, institutional schoolhouse and gallery clocks, and complication-integrated calendar clocks. Distinct from floor-standing clock behavior by wall placement and reduced pendulum-chamber requirements; distinct from surface-set clock behavior by vertical suspension rather than horizontal-surface support.",
    structural_attributes: [
      "Rear hanging system: keyhole slots, mounting brackets, or screw-eye attachment",
      "Compact vertical or circular body construction matched to wall-display function",
      "Dial presentation at viewer eye-height when wall-mounted",
      "Exposed or enclosed dial systems depending on form variant",
      "Pendulum windows common in regulator and precision-oriented variants",
      "Reduced or absent floor-contact base — wall provides primary structural support",
    ],
    dimensional_patterns: {
      notes: "Heights vary widely by form: banjo clock 30-42 inches; gallery clock 12-30 inches circular; regulator clock 36-48 inches; schoolhouse clock 18-30 inches; calendar clock 24-36 inches. Widths typically 10-18 inches at dial section. Depths 3-6 inches accommodating movement housing. Lighter weights (5-25 lbs) suited to wall mounting.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
  {
    id: "spatial_surface_set_clocks",
    category: "spatial_behavior",
    name: "Surface-Set Clocks",
    family_id: "family_clock_cases",
    description:
      "Surface-set horological behavior where the clock case is designed to rest upon mantels, shelves, tables, case furniture tops, or other horizontal surfaces. Forms balance portability with decorative domestic presentation, supporting spring-driven movements within compact freestanding bodies. Construction emphasizes flat stable base, decorative case fronts often featuring architectural or sculptural styling, and rear-access panels for movement maintenance. Variants range from formal mantel clocks (Victorian black mantel, Art Deco, mid-century) to tambour clocks (curved arched silhouette c. 1900-1940) to novelty clocks (thematic decorative shapes). Distinct from floor-standing clock behavior by surface-rest placement rather than floor-anchoring; distinct from wall-mounted behavior by horizontal-surface support rather than vertical suspension.",
    structural_attributes: [
      "Flat stable base construction for resting on horizontal surfaces",
      "Compact freestanding body suited to mantel, shelf, table, or case-furniture-top placement",
      "Decorative case fronts: architectural, sculptural, veneered, marble, metal, or figural ornament depending on variant",
      "Rear access panels common for movement maintenance and key-winding access",
      "Compact horizontal or vertical proportions matched to domestic surface display",
      "Decorative moldings, applied ornament, or figural elements frequent in formal variants",
    ],
    dimensional_patterns: {
      notes: "Heights typically 8-24 inches for compact decorative variants; widths 8-24 inches; depths 4-10 inches. Tambour clocks emphasize horizontal proportions (12-20 inches wide × 6-10 inches tall). Mantel clocks vary widely from compact (8-12 inches) to substantial Victorian architectural cases (18-24 inches tall × 16-22 inches wide). Novelty clocks vary by thematic shape. Weights moderate (3-15 lbs) reflecting compact construction.",
    },
    positive_authority: 8,
    hard_negative_authority: 8,
    migration_status: "partial",
  },
];
