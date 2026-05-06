/**
 * Canonical forms library for Proof Sleuth. Per Section 6.6 of the
 * architectural synthesis. Forms identify the structural type of furniture
 * being analyzed (cabinet, table, chair, etc.) and are consulted by P3 form
 * identification.
 */
import { CanonicalEntry } from "./entryShape";

/**
 * Subtypes of a form. Per appraiser definition: "same form structure,
 * different decorative or functional fitting." Structural distinctness
 * elevates a variant to form-level rather than subtype-level (e.g.,
 * rocking chair is a form, not a subtype of chair, because the rocker
 * mechanism is structurally distinct).
 */
export interface FormSubtype {
  /**
   * Identifier within the parent form. Format: subtype_<descriptor>.
   */
  id: string;

  /**
   * Display name (e.g., "Lady's Dresser", "Bachelor's Chest").
   */
  name: string;

  /**
   * What makes this subtype distinct within the form. Decorative features,
   * proportional differences, functional specializations, era-specific
   * construction approaches, etc.
   */
  distinguishing_attributes: string[];

  /**
   * Optional date range if subtype has narrower production envelope than
   * parent form.
   */
  date_floor?: number;
  date_ceiling?: number;

  /**
   * Optional dimensional thresholds if subtype proportions differ
   * meaningfully from parent form. All length measurements in inches;
   * weight in pounds.
   */
  dimensional_thresholds?: {
    width_min?: number;
    width_max?: number;
    height_min?: number;
    height_max?: number;
    depth_min?: number;
    depth_max?: number;
    weight_min?: number;
    weight_max?: number;
    notes?: string;
  };
}

export interface FormEntry extends CanonicalEntry {
  category: "form";
  name: string;
  parent_category: string;
  common_conversion_targets?: string[];
  distinguishing_features?: string[];
  regional_period_notes?: string;

  /**
   * Free-form descriptions of this form's relationship to closely-related forms
   * that share substantial diagnostic overlap. Each entry is a complete contrastive
   * statement comparing this form to a cousin form. Used for engine reasoning when
   * differentiating between cousin forms (e.g., sideboard vs buffet vs server,
   * pump organ cabinet vs upright piano vs pipe organ).
   */
  cousin_form_contrasts?: string[];

  /**
   * Numeric thresholds for typical dimensional ranges. All length measurements
   * in inches; weight in pounds. Used for engine reasoning when dimensional
   * evidence helps differentiate between similar forms or detect conversions.
   * All sub-fields optional — populate only what is diagnostically meaningful.
   */
  dimensional_thresholds?: {
    width_min?: number;
    width_max?: number;
    height_min?: number;
    height_max?: number;
    depth_min?: number;
    depth_max?: number;
    weight_min?: number;
    weight_max?: number;
    notes?: string;
  };

  /**
   * Free-form list of names this form is commonly called in retail, casual, or
   * regional usage. Used at the report-rendering layer to acknowledge user's
   * likely expected language without surrendering diagnostic precision.
   * Format: "alias name (context note)" — e.g., "buffet (especially in retail use)".
   */
  common_aliases?: string[];

  /**
   * Reference to the family this form belongs to. Required for new
   * entries; existing entries populated during retrofit (Session 3
   * scheduled work).
   */
  family_id?: string;

  /**
   * Reference to the spatial behavior this form belongs to within its
   * family. Required for new entries; existing entries populated during
   * retrofit (Session 3 scheduled work).
   */
  spatial_behavior_id?: string;

  /**
   * Subtypes of this form. See FormSubtype interface for shape and rules.
   */
  subtypes?: FormSubtype[];

  /**
   * Forms with which this form has hybrid or secondary associations. Used
   * for hybrid forms where primary classification is one form but
   * secondary functional or structural association exists with another
   * (e.g., mule chest primarily chest of drawers subtype with secondary
   * association to blanket chest; settle primarily seating with secondary
   * storage association). Array of form ids.
   */
  secondary_form_associations?: string[];
}

export const FORMS: FormEntry[] = [
  {
    id: "form_pump_organ_cabinet",
    category: "form",
    name: "pump organ cabinet",
    parent_category: "specialized",
    family_id: "family_musical_mechanical",
    date_floor: 1870,
    date_ceiling: 1900,
    common_conversion_targets: ["desk", "cabinet", "bar"],
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Foot-powered bellows system — two treadle pedals, internal bellows or air reserve chambers, and linkage system converting foot pressure into air pressure",
      "Reed assemblies — internal reeds mounted onto a reed block; sound-producing mechanism distinct from piano (string/hammer) and pipe organ (pipes)",
      "Combination of piano-style keyboard with air control interface — push-and-pull knobs typically marked with music-related terms or actions",
      "Lower case cavity proportioned and positioned for air bellows housing, even when bellows is removed; tell-tale mounting marks often remain",
      "Evidence of removed treadles — pivot holes, mounting brackets, or repaired floor of lower case where pedal mechanism was attached",
      "Evidence of removed push-pull knobs — holes, patches, or replacement wood plate that doesn't match the rest of the piece in the keyboard control area",
      "Back panel construction designed for maintenance access — sections that open or are clearly removable; often retained even after conversion since back panels are rarely modified",
    ],
    cousin_form_contrasts: [
      "Pump organ vs upright piano: pump organs use foot-powered bellows with two treadle pedals and reed assemblies; upright pianos use string-and-hammer mechanisms with 2-3 metal pedals and lack reeds. Pump organ weight 150-350 lbs vs upright piano 300-800+ lbs depending on stringing.",
      "Pump organ vs pipe organ: pump organs use reeds and bellows housed within the case; pipe organs use external pipes (visible) and may have no foot pedals or a full pedal board for low notes. Pump organ weight 150-350 lbs vs parlor pipe organ 500-1500 lbs.",
    ],
    dimensional_thresholds: {
      height_min: 28,
      height_max: 30,
      depth_max: 10,
      weight_min: 150,
      weight_max: 350,
      notes: "Original keyboard surface dimensions: depth typically ≤10 inches (more reliable test than height for distinguishing converted desks, where actual desk depth is typically ≥18 inches). Keyboard surface height (28-30 inches) overlaps with desk surface height (28-31 inches) and low cabinet top height (30-36 inches) but not bar height (40-42 inches), so height alone does not distinguish desk vs cabinet conversions. Weight ranges distinguish from upright piano (300-800+ lbs) and parlor pipe organ (500-1500 lbs).",
    },
    regional_period_notes: "Manufactured industrial product, not regional craft tradition. Major American production concentrated in two regions during the 1870-1900 peak. New England producers — Estey Organ Company (Brattleboro, Vermont), Mason & Hamlin (Boston, Massachusetts) — generally produced premium-tier instruments with refined cabinetry, pressure-system action, and high construction standards. Midwest producers — Story & Clark (Chicago, Illinois), W. W. Kimball (Chicago, Illinois) — generally produced factory-standardized instruments at higher volume, with Kimball notably transitioning from reed organs to pianos as the major arc of the company. Identification by specific maker typically relies on stenciled or embossed manufacturer marks on the action, fall board, or back panel rather than regional joinery traits. Per-maker production-trait detail is being progressively researched and verified; entries will be expanded as scholarship is confirmed.",
  },
  {
    id: "form_drop_leaf_table",
    category: "form",
    name: "drop-leaf table",
    parent_category: "table",
    date_floor: 1700,
    date_ceiling: 1999,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_gate_leg_table",
    category: "form",
    name: "gate-leg table",
    parent_category: "table",
    date_floor: 1600,
    date_ceiling: 1999,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_washstand",
    category: "form",
    name: "washstand",
    parent_category: "case_piece",
    family_id: "family_bedroom_clothing_storage",
    spatial_behavior_id: "spatial_personal_hygiene",
    date_floor: 1820,
    date_ceiling: 1900,
    common_conversion_targets: ["bathroom_vanity"],
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Water-resistant top surface — marble, slate, tile, zinc, or similar; ordinary small dressers and side cabinets use plain wood tops meant for storage rather than repeated wet use",
      "Top sized and proportioned for basin and pitcher use — sometimes with a circular basin recess, raised gallery on three sides, or shaped splash rail; the top reads as basin-oriented rather than drawer-oriented even when the basin is missing",
      "Splash protection at rear — raised backsplash, shaped gallery, marble splash slab, or rear superstructure positioned immediately behind the work surface to stop water; differs from a small dresser's mirror frame or decorative crest, which is not waterproof and not functionally placed for water containment",
      "Towel accommodation — side or rear towel bars, small turned rods mounted between uprights, or rear rails positioned where a cloth could hang near the basin; a washstand's towel bars are structural or semi-structural elements distinct from a dresser's drawer dividers, stretchers, or decorative supports",
      "Drawer configuration — fewer drawers than a dresser (typically one shallow drawer, or one drawer over doors, or one drawer over open shelf); drawers are secondary to the open basin surface rather than the case being drawer-dominant",
      "Lower storage configured for washing accessories — open shelf or small cabinet sized for chamber pots, towels, soap, linens, or washing accessories; pairs with the basin top to read as a complete washing station",
      "Compact height and depth suited to standing use at a basin — proportions read as a washing station rather than as miniature clothing storage",
      "Wear, staining, water marks, or finish loss concentrated on the top surface and rear splash area — diagnostic of original water use even when basin and pitcher are absent",
      "Evidence of removed water-service components — missing basin ring, gallery, towel rail, marble slab, or rear splash structure may be visible as mounting holes, repaired fastener locations, or finish discontinuities",
    ],
    regional_period_notes: "Washstands are fundamentally a pre-plumbing solution; their evolution and decline are directly tied to indoor plumbing adoption, which proceeded unevenly across class, region, and urban/rural settings. Form was originally bedroom-located, briefly migrating to kitchens during the early plumbing transition, and ultimately replaced by bathroom installations as plumbing became standard. Regional traditions during the peak development period (1860–1885): Urban Northeast and Mid-Atlantic produced refined marble-top examples aligned with major cabinetmaking centers (New York, Philadelphia, Boston), with mahogany, cherry, and walnut common. Midwest production mixed factory and regional cabinetmaking with practical hybrid forms and earlier adoption of standardized components, primarily walnut, oak, poplar, and mixed woods. Southern examples persist longer due to slower plumbing infrastructure, use local woods (walnut, pine, regional hardwoods), and often lag urban stylistic trends. Rural and Appalachian production maintains plain vernacular forms with painted finishes long after urban styles have moved on; pine and poplar are common; older styles continue well into later decades. Critical engine caution: confirm dating with construction evidence (joinery, fasteners, finish layering, machine evidence) rather than stylistic markers in isolation. Rural production lags urban styles substantially, painted and plain examples often appear earlier than they are stylistically, and marble tops can be added or replaced later. Bedroom-private functional furniture (washstands, dressing tables, chamber pot cabinets) shows additional ~10 year style lag from urban trends due to private domestic placement insulating the form from rapid stylistic turnover.",
  },
  {
    id: "form_sideboard",
    category: "form",
    name: "sideboard",
    parent_category: "case_piece",
    family_id: "family_dining_service_storage",
    spatial_behavior_id: "spatial_distributed_storage",
    date_floor: 1780,
    date_ceiling: 1900,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Defined by span and distributed storage across width — storage zones (drawers, doors, cellarettes, bottle drawers) are arranged side by side rather than consolidated into a unified cabinet mass; the piece reads horizontally even when substantial",
      "Long horizontal case form — typically wider than tall, designed to anchor a side wall in the dining room; functions as the primary dining-room storage case",
      "Storage-first arrangement with multiple zones — typically multiple drawers in upper tier (linens, silver, serving implements) plus lower enclosed cabinet storage (dishes, bottles, serving pieces); may include cellarettes, bottle drawers, asymmetrical storage divisions, or specialized compartments distinct from the standardized symmetrical layouts of buffets",
      "Broad usable serving surface — top intended for platters, decanters, serving dishes, or staged meal service; serving function and storage function both substantial",
      "Dining-room storage and serving function — tied specifically to dining service, not general household storage; distinct from buffet's later suite-based dining role and from server's auxiliary supporting role",
      "Stylistic range broadest of the three terms — appears across Federal, Hepplewhite, Sheraton, Empire, and continues through Victorian; sideboard is the broadest and oldest of the cousin set in American furniture use",
      "Three or more storage zones distributed across width is a strong sideboard signal — distinguishes from servers (1-2 zones) and from buffets (which consolidate similar storage capacity into vertically organized cabinet mass)",
    ],
    cousin_form_contrasts: [
      "Sideboard vs buffet: sideboard is the broader and older term, used continuously from c. 1780; buffet typically refers to a later cabinet-form expression (c. 1870-1930) appearing in matched dining suites with mirrors, plate rails, and Mission/Arts and Crafts/Colonial Revival/Jacobean Revival styling. The structural distinction: sideboard distributes storage across width with multiple distinct zones arranged side by side; buffet integrates storage into a unified cabinet mass that reads as a cohesive vertically organized unit. A large early Federal piece with drawers and long legs is more safely called a sideboard. A 1905 oak Mission piece with heavy enclosed cabinet construction, plate rail, mirror, and suite-matched dining storage may be more safely called a buffet, though many people would still call it a sideboard. When in doubt with a substantial dining storage piece on long legs from before 1870, sideboard is safer.",
      "Sideboard vs server: sideboard is the primary dining storage anchor — broad, deep, multiple storage zones, large serving surface; server is the smaller auxiliary serving piece — narrower (typically under 48 inches wide), shallower (14-18 inches typical), with one to two drawers rather than a full bank of dining storage, often with open shelf, stretcher shelf, or small gallery. If the piece is the main storage anchor, sideboard or buffet is the call; if it's a secondary serving station designed to support rather than replace primary storage, server is the call.",
      "Three-form decision algorithm (sideboard/buffet/server): Sideboard is defined by span and distributed storage across width. Buffet is defined by integration into a unified cabinet mass. Server is defined by reduction, simplicity, and auxiliary function. Operationally: measure width first — under 48 inches likely server unless storage mass is unusually high, 48-60 inches is overlap zone, over 60 inches likely sideboard or buffet. Measure depth second — 14-18 inches indicates server or small sideboard, 18-24 inches indicates buffet or sideboard, over 24 inches indicates large sideboard. Count storage zones — 1-2 zones is server, 3-5 zones is buffet or sideboard, broad multi-zone layout distributed across width is sideboard while consolidated cabinet mass with similar capacity is buffet. Read the base — long legged form indicates sideboard (especially earlier), heavy enclosed cabinet form indicates buffet or later sideboard, light legged form with shelf indicates server. Use period and style last — Federal/Hepplewhite/Sheraton/Empire indicates sideboard; Mission, Arts and Crafts, early Colonial Revival, Jacobean Revival suite piece indicates buffet; small companion dining piece indicates server. Suite context (matching dining set) is supporting evidence only — confirm structure, massing, and storage organization first.",
    ],
    dimensional_thresholds: {
      width_min: 48,
      width_max: 84,
      height_min: 34,
      height_max: 40,
      depth_min: 18,
      depth_max: 26,
      weight_min: 120,
      weight_max: 350,
      notes: "Width range 48-84 inches typical, often 60+ inches for substantial examples. Serving surface height 34-40 inches. Weight 120-350+ lbs depending on construction (mirror, marble top, heavy carving, large case construction push toward upper end). A small server in oak may outweigh a light Federal sideboard, so weight should not override scale and structure as the primary dimensional indicator. Width is the most reliable single dimensional discriminator vs. server (under 48 inches typical) and depth is the most reliable secondary discriminator vs. server (server 14-18 inches typical, sideboard 18-26 inches typical). Buffet dimensional ranges substantially overlap sideboard ranges — see cousin_form_contrasts for stylistic and structural differentiators (distributed-across-width vs unified-cabinet-mass).",
    },
    common_aliases: [
      "buffet (in casual or retail use, especially for later examples or matched dining suite pieces)",
      "credenza (in some modern casual usage, though credenza canonically refers to a different form with origins in Renaissance Italy)",
      "hunt board (Southern regional term for sideboard variants, especially taller examples)",
    ],
  },
  {
    id: "form_buffet",
    category: "form",
    name: "buffet",
    parent_category: "case_piece",
    family_id: "family_dining_service_storage",
    spatial_behavior_id: "spatial_integrated_cabinet_storage",
    date_floor: 1870,
    date_ceiling: 1930,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Defined by integration and consolidation into a unified cabinet mass — storage is organized as a cohesive cabinet system, drawers and doors stacked and grouped within a unified structure that reads as one cohesive block of storage",
      "Lower case is the dominant visual mass — thick framing members, panels, and substantial doors anchor the piece; drawers are positioned above or within the cabinet system rather than as the primary horizontal feature",
      "Reads as a contained, vertically organized unit — even when individual examples are wide, the form maintains cohesion as a single mass rather than spreading across width with distinct zones (which is sideboard behavior)",
      "Standardized symmetrical compartment patterns common — central drawer stack flanked by cabinet doors, one or more drawers above a double-door cabinet, symmetrical door and drawer arrangements; interior shelving designed for stacking dishes and organizing linens",
      "Integrated upper elements when present — mirrors, plate rails, or shelves are proportionally scaled to the base, factory integrated, and feel like natural extensions of the cabinet rather than independent architectural elements (which is more characteristic of Victorian sideboard superstructures)",
      "Deep contained storage volume — doors typically open to deep, enclosed storage cavities; interiors uniform and optimized for stacking; depth is used for internal capacity rather than just serving surface support",
      "Strong stylistic alignment with late 19th to early 20th century production — Mission, Arts and Crafts, Colonial Revival, Jacobean Revival, and early 20th century oak production are the dominant style families; sideboard appears across a broader historical range including earlier Federal and Empire styles",
      "Often part of a coordinated dining suite — shares wood species, hardware, proportions, and decorative motifs with companion pieces (table, chairs, china cabinet, server); suite context is supporting evidence only, not primary classification basis",
    ],
    cousin_form_contrasts: [
      "Buffet vs sideboard: buffet defined by integration into a unified cabinet mass; sideboard defined by span and distributed storage across width. The clearest test is structural cohesion — does the piece read as one unified block of storage (buffet) or as a long span of distinct storage zones arranged side by side (sideboard)? Buffet typically appears in late 19th to early 20th century dining suites (Mission, Arts and Crafts, Colonial Revival, Jacobean Revival); sideboard spans a broader historical range from Federal forward. A large early Federal piece with drawers and long legs is more safely called a sideboard. A 1905 oak Mission piece with heavy enclosed cabinet construction, plate rail, mirror, and suite-matched dining storage may be more safely called a buffet, though many people would still call it a sideboard.",
      "Buffet vs server: buffet is the primary dining storage piece in late 19th to early 20th century dining suites — substantial integrated cabinet mass, deep enclosed storage, dominant visual weight; server is the smaller auxiliary serving companion — typically narrower (under 48 inches), shallower (14-18 inches typical), with simplified storage (one or two drawers, small cabinet, or open shelf), and noticeably lighter overall. Servers often exist alongside buffets in the same dining suite, providing additional serving surface rather than primary storage capacity. If the piece is the main storage anchor of the suite, buffet; if it's the smaller companion with reduced storage, server.",
      "Three-form decision algorithm (sideboard/buffet/server): Sideboard is defined by span and distributed storage across width. Buffet is defined by integration into a unified cabinet mass. Server is defined by reduction, simplicity, and auxiliary function. Operationally: measure width first — under 48 inches likely server unless storage mass is unusually high, 48-60 inches is overlap zone, over 60 inches likely sideboard or buffet. Read the structural organization second — distributed across width with multiple distinct zones is sideboard, consolidated into a unified cabinet mass is buffet. Count storage zones — 1-2 zones is server, 3-5 zones is buffet or sideboard. Read the base — long legged form indicates sideboard (especially earlier), heavy enclosed cabinet form indicates buffet or later sideboard, light legged form with shelf indicates server. Use period and style last — Federal/Hepplewhite/Sheraton/Empire indicates sideboard; Mission/Arts and Crafts/Colonial Revival/Jacobean Revival suite piece indicates buffet; small companion dining piece indicates server. Suite context is supporting evidence only — confirm structure, massing, and storage organization first.",
    ],
    dimensional_thresholds: {
      width_min: 42,
      width_max: 72,
      height_min: 34,
      height_max: 38,
      depth_min: 18,
      depth_max: 24,
      weight_min: 90,
      weight_max: 225,
      notes: "Width range 42-72 inches typical, often more compact than substantial sideboards. Height 34-38 inches at serving surface; lower than tall Victorian sideboard superstructures because buffet upper elements are integrated proportionally to base rather than dominating. Depth 18-24 inches enables deep contained storage. Weight 90-225 lbs typical, mass concentrated in lower cabinet rather than spread across width. Buffet dimensional ranges substantially overlap sideboard ranges — primary differentiator is structural (consolidated cabinet mass vs distributed-across-width storage), not dimensional. See cousin_form_contrasts.",
    },
    common_aliases: [
      "sideboard (in earlier or non-retail usage, and casually for later examples that fall in either category)",
      "credenza (in some modern casual usage)",
      "dining cabinet (descriptive retail term)",
    ],
  },
  {
    id: "form_server",
    category: "form",
    name: "server",
    parent_category: "case_piece",
    family_id: "family_dining_service_storage",
    spatial_behavior_id: "spatial_auxiliary_service",
    date_floor: 1870,
    date_ceiling: 1930,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Defined by reduction, simplicity, and auxiliary function — designed to support serving activity rather than function as the primary storage case for the dining room",
      "Reduced scale — typically narrower (often under 48 inches wide), shallower (14-18 inches typical), and lighter than sideboards or buffets; visually reads as supporting furniture rather than as a dining room anchor",
      "Limited and simplified storage — typically one or two drawers, a small cabinet, or an open shelf; rarely more than that; not designed to carry the full storage responsibility of the dining room",
      "Structurally simpler — fewer internal divisions, minimal compartmental specialization, straightforward construction without the complexity of buffets (integrated cabinet systems with defined compartments) or sideboards (varied and sometimes specialized storage arrangements)",
      "Often incorporates open or partially open construction — open shelves, stretcher bases, or partial enclosure are common; negative space often visible beneath or within the structure; distinct from buffets (predominantly enclosed cabinets) and from sideboards (typically paired with substantial storage mass even when including some open elements)",
      "Serving-first design — serving surface is the primary functional feature; storage is secondary",
      "Companion piece role — frequently exists alongside a buffet or sideboard in coordinated dining contexts, providing additional serving surface rather than primary storage capacity",
      "NOT to be back-classified: pre-1870 auxiliary serving pieces (small side tables used for service, side tables with drawers, light or reduced sideboards, occasional narrow case pieces used alongside larger dining furniture) functioned as servers but predate the server as a distinct form category. These pieces should be classified as side tables, small sideboards, or serving tables — not as servers. Server as a recognized, standardized form emerged c. 1870 alongside the matched-suite buffet-and-server pairing convention; full standardization c. 1890.",
    ],
    cousin_form_contrasts: [
      "Server vs sideboard: server is the smaller auxiliary serving piece, sideboard is the primary dining storage anchor. Server is typically narrower (under 48 inches), shallower (14-18 inches), with simplified storage (1-2 drawers, small cabinet, or open shelf) and no large serving-surface span. Sideboard distributes substantial storage across width with multiple distinct zones. Servers often exist as companions to sideboards rather than as alternatives to them.",
      "Server vs buffet: server is the smaller auxiliary serving companion, buffet is the primary dining storage piece in coordinated suites. Server has limited storage and reads as supporting furniture; buffet has integrated cabinet-mass storage and reads as the dining room anchor. In late 19th to early 20th century matched dining suites, server and buffet often appear together — buffet provides the substantial storage, server provides the additional serving surface.",
      "Three-form decision algorithm (sideboard/buffet/server): Sideboard is defined by span and distributed storage across width. Buffet is defined by integration into a unified cabinet mass. Server is defined by reduction, simplicity, and auxiliary function. For server identification specifically: if the piece is under 48 inches wide, has limited storage (1-2 drawers, small cabinet, or open shelf), reads as light and auxiliary rather than as a dining room anchor, and especially if it appears alongside a buffet or sideboard in a coordinated context — server is the call, even if a seller has labeled it differently. Reduced scale plus simplified storage plus auxiliary visual presence is the server signature.",
    ],
    dimensional_thresholds: {
      width_min: 30,
      width_max: 54,
      height_min: 32,
      height_max: 38,
      depth_min: 14,
      depth_max: 20,
      weight_min: 40,
      weight_max: 100,
      notes: "Width range 30-54 inches typical, with under 48 inches as the strong server indicator. Depth 14-20 inches, distinctly shallower than sideboards (18-26 inches) or buffets (18-24 inches). Weight 40-100 lbs typical, noticeably lighter than the cousin forms because the server is not carrying heavy storage mass. A small server in dense wood may outweigh a light Federal sideboard, so weight should not override scale and storage architecture as the primary indicator. Width is the most reliable single dimensional discriminator — under 48 inches strongly favors server even before considering storage organization.",
    },
    common_aliases: [
      "buffet (in casual or retail use, especially for servers that appear in matched dining suites)",
      "side table (in non-dining contexts where the original auxiliary serving function isn't recognized)",
      "console (in casual usage when placed against a wall outside dining context)",
    ],
  },
  {
    id: "form_dresser",
    category: "form",
    name: "dresser",
    parent_category: "case_piece",
    family_id: "family_bedroom_clothing_storage",
    spatial_behavior_id: "spatial_horizontal_storage",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Width-dominant case proportions — typically wider than tall, designed to spread storage across width rather than stack vertically",
      "Case height usually lower than a chest of drawers, falling within hand-height range for grooming and dressing interaction",
      "Multiple drawers arranged in rows and/or side-by-side banks — multi-column drawer layout distinguishes from chest of drawers' single-column stacked configuration",
      "Broad usable top surface — designed for staging personal items, grooming tools, mirror placement, or daily dressing activity",
      "Often associated with an attached, matching, or companion mirror — though mirror may have been removed, replaced, or separated; mounting evidence often remains",
      "Designed for folded clothing storage and personal bedroom organization — drawers sized for clothing rather than for serving items, linens, or specialized storage",
      "Frequently part of a coordinated bedroom suite, especially in late 19th and early 20th century production",
      "No knee opening — if knee opening is present, evaluate as dressing table or vanity instead",
    ],
    subtypes: [
      {
        id: "subtype_standard_dresser",
        name: "Standard dresser",
        distinguishing_attributes: [
          "Single-row or two-row drawer layout across width",
          "Width typically 36-48 inches",
          "Most common dresser configuration in 20th century bedroom suites",
        ],
      },
      {
        id: "subtype_double_dresser",
        name: "Double dresser",
        distinguishing_attributes: [
          "Width typically 54-66 inches",
          "Wider drawer layout with additional storage capacity",
          "Common in mid-20th century bedroom suites",
        ],
        dimensional_thresholds: {
          width_min: 54,
          width_max: 66,
        },
      },
      {
        id: "subtype_triple_dresser",
        name: "Triple dresser",
        distinguishing_attributes: [
          "Width typically 68-78 inches or more",
          "Largest standard dresser configuration",
          "Often features three vertical banks of drawers across width",
        ],
        dimensional_thresholds: {
          width_min: 68,
          width_max: 78,
        },
      },
      {
        id: "subtype_princess_dresser",
        name: "Princess dresser",
        distinguishing_attributes: [
          "Narrower than standard dresser but maintains horizontal grouping behavior",
          "Strong mirror association, often paired with tall vertical mirror supports",
          "Designed for space-efficient dressing function in smaller rooms",
          "Date range c. 1890-1930",
        ],
        date_floor: 1890,
        date_ceiling: 1930,
      },
      {
        id: "subtype_gentlemans_dresser",
        name: "Gentleman's dresser",
        distinguishing_attributes: [
          "Larger and more storage-focused than lady's dresser",
          "May include combination of drawers and cabinet doors",
          "May include vertical compartments for folded garments",
          "Less dependent on mirror presence",
          "Often slightly taller than standard dresser, sometimes entering 38-44 inch range, but still wider than tall",
          "Date range c. 1880-1950",
        ],
        date_floor: 1880,
        date_ceiling: 1950,
        dimensional_thresholds: {
          height_min: 34,
          height_max: 44,
          width_min: 48,
          width_max: 72,
        },
      },
      {
        id: "subtype_ladys_dresser",
        name: "Lady's dresser",
        distinguishing_attributes: [
          "Strong association with attached or original mirror, often mounted on vertical supports, carved uprights, or framed backing boards",
          "Case height typically 30-36 inches, within dressing range",
          "Drawer layout commonly includes small upper drawers for personal items and larger lower drawers for clothing",
          "May include glove boxes, small side compartments, or candle shelves in earlier examples",
          "Date range c. 1850-1930",
        ],
        date_floor: 1850,
        date_ceiling: 1930,
        dimensional_thresholds: {
          height_min: 30,
          height_max: 36,
          width_min: 42,
          width_max: 66,
        },
      },
      {
        id: "subtype_hatbox_dresser",
        name: "Hat box dresser",
        distinguishing_attributes: [
          "Includes specialized compartments for hat storage",
          "Features deep drawers or vertical compartments, often cylindrical or oversized",
          "Often integrated into larger dresser structure",
          "Internal divisions for structured storage of late 19th and early 20th century fashion items",
          "Date range c. 1890-1925",
        ],
        date_floor: 1890,
        date_ceiling: 1925,
        dimensional_thresholds: {
          height_min: 32,
          height_max: 40,
          width_min: 48,
          width_max: 72,
          depth_min: 20,
          depth_max: 26,
        },
      },
    ],
    cousin_form_contrasts: [
      "Dresser vs chest of drawers: dresser spreads storage horizontally across multi-column drawer layouts; chest of drawers stacks storage vertically in single-column configuration. Dresser usually has broader top-surface utility; chest of drawers usually has stronger height emphasis. The structural distinction matters because the engine reasons differently about width-dominant vs height-dominant bedroom storage cases.",
      "Dresser vs low chest: dresser is usually wider and more suite-oriented; low chest is shorter, smaller, and less clearly tied to dressing use. Low chest may overlap with bedside or dresser-adjacent forms but lacks dresser's full horizontal spread.",
      "Dresser vs dressing table or vanity: dresser has no knee opening and functions as a closed storage case. Dressing table has seated access and grooming orientation. Mirror alone does not make a dresser a vanity — knee opening and seated use proportions are required for dressing table classification.",
      "Dresser vs commode: dresser is a bedroom drawer-storage case. Commode is often misused in retail listings for small cabinets or chests. Do not use commode unless period, regional, or structural evidence specifically supports it.",
    ],
    dimensional_thresholds: {
      width_min: 42,
      width_max: 72,
      height_min: 30,
      height_max: 38,
      depth_min: 18,
      depth_max: 24,
      weight_min: 80,
      weight_max: 250,
      notes: "Width 42-72 inches typical with substantial subtype variation: single dresser 36-48 inches, double dresser 54-66 inches, triple dresser 68-78 inches or more. Height 30-38 inches reflects dressing-station ergonomics. Weight 80-250 pounds typical; large solid-wood dressers with mirrors may exceed 250 pounds.",
    },
    common_aliases: [
      "bureau (in casual American usage; bureau and dresser are often interchangeable)",
      "bedroom dresser",
      "dresser with mirror",
      "low dresser",
      "double dresser",
      "triple dresser",
      "chest dresser (in casual or hybrid listings)",
      "vanity dresser (when mirror is prominent, though vanity properly refers to dressing table)",
      "drawer dresser",
      "bedroom bureau",
    ],
    regional_period_notes: "Bureau and dresser are often used interchangeably in American casual usage. Nineteenth- and twentieth-century bedroom suites commonly include dresser forms, with mirrors that may have been removed, replaced, or separated over time. The dresser form appears across major American style movements: Victorian, Eastlake, Colonial Revival, Jacobean Revival, waterfall, Art Deco, and mid-century suites all commonly include dressers with stylistic expression appropriate to the period. Critical engine caution: style alone should not date the form. Construction evidence should control date interpretation — drawer joinery (hand-cut vs machine-cut dovetails), secondary woods (regional patterns), hardware (period-appropriate vs replacement), finish (original vs refinished), and mirror attachment evidence all carry more dating weight than stylistic markers in isolation. Specific datable construction features within this evolution belong in HISTORICAL_CLUE_LIBRARY for clue-level engine reasoning.",
  },
  {
    id: "form_low_chest",
    category: "form",
    name: "low chest",
    parent_category: "case_piece",
    family_id: "family_bedroom_clothing_storage",
    spatial_behavior_id: "spatial_horizontal_storage",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Short case height — typically 24-36 inches, falling below standard chest of drawers range",
      "Drawer-based storage — distinguishes from blanket chest's hinged-lid access",
      "Usually smaller than a dresser — lacks dresser's full horizontal spread and suite-oriented context",
      "Usually less vertical than a standard chest of drawers — shorter and less drawer-stacked",
      "Often compact and movable — suited to secondary bedroom positions or bedside-adjacent placement",
      "May function as secondary bedroom storage rather than primary clothing storage anchor",
      "Does not use hinged-lid access as primary storage method — drawers are the storage system",
    ],
    subtypes: [
      {
        id: "subtype_small_low_chest",
        name: "Small low chest",
        distinguishing_attributes: [
          "Compact width and height",
          "Limited drawer count",
          "May overlap with bedside or auxiliary storage",
        ],
      },
      {
        id: "subtype_low_bachelors_chest",
        name: "Bachelor's chest (low variant)",
        distinguishing_attributes: [
          "Compact personal storage unit positioned at low chest scale rather than chest of drawers scale",
          "Often includes pull-out brushing slide or writing slide",
          "Note: bachelor's chest also appears as a chest of drawers subtype; the low-chest variant emphasizes the form's smaller and more table-like proportions",
        ],
      },
      {
        id: "subtype_bedside_chest",
        name: "Bedside chest",
        distinguishing_attributes: [
          "Larger and more storage-oriented than a nightstand",
          "Bedside placement with substantial drawer storage",
          "May overlap with nightstand at the small end of low chest range",
        ],
      },
      {
        id: "subtype_low_drawer_chest",
        name: "Low drawer chest",
        distinguishing_attributes: [
          "Generic low drawer-based storage form",
          "Width typically 24-42 inches",
          "Height typically 24-36 inches",
        ],
      },
    ],
    cousin_form_contrasts: [
      "Low chest vs dresser: low chest is smaller and less width-dominant; dresser usually has clearer bedroom-suite and dressing-surface behavior. Dresser's width range (42-72 inches) typically exceeds low chest's (24-42 inches).",
      "Low chest vs chest of drawers: low chest is shorter (24-36 inches) and less vertically stacked; chest of drawers has stronger height-dominant storage behavior (42-70 inches). The height threshold around 36-42 inches separates the two forms.",
      "Low chest vs blanket chest: low chest uses drawers; blanket chest uses a hinged lid and open box cavity. Storage method is the structural distinction, not size.",
      "Low chest vs nightstand: low chest is usually larger and more storage-oriented; nightstand is bedside-scaled and immediate-access oriented. Very small low chests may overlap with large nightstands; bedside placement context and primary function should disambiguate.",
      "Low chest vs lowboy: low chest is a case form with carcass construction; lowboy is more table-like, legged, and dressing-table-adjacent. Lowboy typically falls in a separate form category not yet authored in canonical library — see future authoring scope.",
    ],
    dimensional_thresholds: {
      width_min: 24,
      width_max: 42,
      height_min: 24,
      height_max: 36,
      depth_min: 16,
      depth_max: 22,
      weight_min: 40,
      weight_max: 150,
      notes: "Width 24-42 inches and height 24-36 inches define the low chest range. Very small examples may overlap with nightstands; wider examples may overlap with compact dressers. Weight 40-150 pounds typical.",
    },
    common_aliases: [
      "small chest",
      "short chest",
      "low drawer chest",
      "bachelor's chest (when at low chest scale)",
      "bedside chest",
      "bedroom chest",
      "compact chest",
      "small dresser (in casual listings)",
    ],
    regional_period_notes: "Low chest is a useful structural classification but not always a common retail term — buyers and sellers may use small chest, short chest, small dresser, or bachelor's chest interchangeably. Historic low chests overlap with dressing-table, lowboy, and early case-furniture traditions, with many examples blurring across categories. Modern listings often blur low chest, bachelor's chest, nightstand, and small dresser, making access method (drawer vs hinged lid) and proportional analysis (width-height-depth ratios) more reliable identification tools than retail terminology. Construction evidence should control date interpretation as with all case furniture.",
  },
  {
    id: "form_chest_of_drawers",
    category: "form",
    name: "chest of drawers",
    parent_category: "case_piece",
    family_id: "family_bedroom_clothing_storage",
    spatial_behavior_id: "spatial_vertical_storage",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Height-dominant proportions — typically taller than wide, designed to maximize vertical storage capacity within a smaller floor footprint",
      "Stacked drawer configuration — single-column or narrow multi-row structure with continuous vertical drawer rhythm from top to bottom",
      "Limited top-surface usability compared with dresser — top is secondary to storage capacity, not designed for active dressing use",
      "Drawers are the primary storage system — no significant cabinet doors, hanging compartments, or alternative storage methods",
      "No knee opening — distinguishes from dressing tables and writing desks",
      "May be part of a bedroom suite, often paired with dresser, bed, and nightstand in late 19th and early 20th century production",
      "Single-case construction — not divided into stacked carcasses (which would indicate chest-on-chest or highboy)",
    ],
    subtypes: [
      {
        id: "subtype_standard_chest_of_drawers",
        name: "Standard chest of drawers",
        distinguishing_attributes: [
          "Continuous single-case vertical drawer stack",
          "Typically 4-6 drawers stacked top to bottom",
          "Height 42-60 inches typical",
          "Most common chest of drawers configuration",
        ],
      },
      {
        id: "subtype_tall_chest",
        name: "Tall chest",
        distinguishing_attributes: [
          "Height typically 50-70 inches",
          "Narrow width relative to height",
          "Drawer count often 5-7 vertically stacked drawers",
          "Strong vertical emphasis with minimal horizontal division",
          "Pure vertical storage form maximizing drawer stacking",
          "Date range c. 1800 to present",
        ],
        date_floor: 1800,
        dimensional_thresholds: {
          height_min: 50,
          height_max: 70,
          width_min: 28,
          width_max: 40,
        },
      },
      {
        id: "subtype_lingerie_chest",
        name: "Lingerie chest",
        distinguishing_attributes: [
          "Narrower than standard chest of drawers",
          "Width typically 18-28 inches",
          "Height typically 45-60 inches",
          "Often features many shallow drawers for folded undergarments and accessories",
        ],
        dimensional_thresholds: {
          height_min: 45,
          height_max: 60,
          width_min: 18,
          width_max: 28,
        },
      },
      {
        id: "subtype_semainier",
        name: "Semainier",
        distinguishing_attributes: [
          "Tall, narrow chest with seven drawers, traditionally one for each day of the week",
          "Width often under 30 inches",
          "Height often 50-65 inches",
          "Uniform drawer sizes with strong vertical stacking",
          "Date range c. 1800-1900",
        ],
        date_floor: 1800,
        date_ceiling: 1900,
        dimensional_thresholds: {
          height_min: 50,
          height_max: 65,
          width_min: 20,
          width_max: 30,
          depth_min: 16,
          depth_max: 20,
        },
      },
      {
        id: "subtype_chest_on_chest",
        name: "Chest-on-chest",
        distinguishing_attributes: [
          "Two-part construction: lower full case and upper full case stacked",
          "Height typically 60-80 inches",
          "Distinguishable from highboy because both sections are full closed cases (no legged base)",
          "Note: structural distinctness vs single-case chest of drawers is borderline; classified as subtype because both functions and silhouette read as continuous vertical storage despite the two-part construction. May be reconsidered for promotion to form-level in future authoring sessions.",
        ],
        dimensional_thresholds: {
          height_min: 60,
          height_max: 80,
          width_min: 36,
          width_max: 48,
        },
      },
      {
        id: "subtype_bachelors_chest",
        name: "Bachelor's chest",
        distinguishing_attributes: [
          "Smaller scale overall, typically 30-36 inches wide and 28-32 inches tall",
          "Compact personal storage unit, often bridging horizontal and vertical groupings",
          "Often includes pull-out brushing slide or writing slide",
          "Drawer configuration usually two over three",
          "Date range c. 1750-1850 (original); revival production through 20th century",
        ],
        date_floor: 1750,
        date_ceiling: 1850,
        dimensional_thresholds: {
          height_min: 28,
          height_max: 32,
          width_min: 30,
          width_max: 36,
          depth_min: 18,
          depth_max: 22,
        },
      },
      {
        id: "subtype_mule_chest",
        name: "Mule chest",
        distinguishing_attributes: [
          "Hybrid form combining lift-top blanket-chest upper compartment with one or more drawers in the lower section",
          "Upper compartment opens from the top via hinged lid",
          "Lower section includes drawer-based storage",
          "Transitional form between blanket chest and chest of drawers",
          "Date range c. 1700-1850",
        ],
        date_floor: 1700,
        date_ceiling: 1850,
        dimensional_thresholds: {
          height_min: 30,
          height_max: 40,
          width_min: 36,
          width_max: 50,
          depth_min: 18,
          depth_max: 24,
        },
      },
    ],
    secondary_form_associations: ["form_blanket_chest"],
    cousin_form_contrasts: [
      "Chest of drawers vs dresser: chest of drawers stacks storage vertically in single-column configuration; dresser spreads storage horizontally across multi-column layout. Chest is taller and narrower; dresser usually has stronger surface-use behavior. The structural distinction matters because the engine reasons differently about height-dominant vs width-dominant bedroom storage cases.",
      "Chest of drawers vs highboy: chest of drawers is a closed vertical drawer case with grounded base (feet, plinth, or low bracket base); highboy is a high chest raised on a legged base or stand with significant clearance underneath. Tallness alone does not make a highboy — the legged elevated base is the structural requirement.",
      "Chest of drawers vs wardrobe: chest of drawers uses drawers as primary storage; wardrobe uses doors and hanging space as primary storage. Chest of drawers has no significant hanging compartment.",
      "Chest of drawers vs low chest: chest of drawers has stronger vertical storage behavior; low chest is shorter and may overlap with bedside or dresser-adjacent forms. Low chest typically falls below 36 inches height; chest of drawers typically exceeds 42 inches.",
    ],
    dimensional_thresholds: {
      width_min: 24,
      width_max: 40,
      height_min: 42,
      height_max: 70,
      depth_min: 18,
      depth_max: 22,
      weight_min: 80,
      weight_max: 250,
      notes: "Standard chest of drawers ranges 24-40 inches wide, 42-70 inches tall, 18-22 inches deep. Subtype variations: lingerie chest 18-28 inches wide and 45-60 inches tall; chest-on-chest 60-80 inches tall; bachelor's chest 30-36 inches wide and 28-32 inches tall; semainier under 30 inches wide and 50-65 inches tall. Weight 80-250 pounds typical; large two-part chests may exceed 250 pounds.",
    },
    common_aliases: [
      "chest",
      "drawer chest",
      "tall chest",
      "bedroom chest",
      "bureau (in casual American usage; bureau and chest of drawers are sometimes used interchangeably though bureau more commonly refers to dresser)",
      "high chest",
      "lingerie chest",
      "chest-on-chest (when two-part)",
      "tallboy (in some retail or British-influenced usage)",
    ],
    regional_period_notes: "Chests of drawers evolved from earlier chest storage traditions (lift-top chests, mule chests as transitional forms). Strong presence in American 18th, 19th, and 20th century bedroom furniture. High chests, low chests, and chests of drawers overlap historically — the form boundaries reflect different periods' preferences for vertical capacity, surface utility, and decorative expression. Later factory bedroom suites (late 19th and early 20th century) often pair chest of drawers with dresser, bed, and nightstand in matched sets. Critical engine caution: chest is an ambiguous term in retail and casual usage and should not be treated as structurally precise without visible drawer evidence; many small cabinets, blanket chests, and low storage forms are called chests in listings. Construction evidence (drawer joinery, secondary woods, base construction, hardware) should control date interpretation. Specific datable construction features within this evolution belong in HISTORICAL_CLUE_LIBRARY for clue-level engine reasoning.",
  },
  {
    id: "form_highboy",
    category: "form",
    name: "highboy",
    parent_category: "case_piece",
    family_id: "family_bedroom_clothing_storage",
    spatial_behavior_id: "spatial_vertical_storage",
    date_floor: 1700,
    date_ceiling: 1900,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Tall vertical storage form with two-part construction — upper drawer chest stacked on a separate elevated base",
      "Upper section is a chest of drawers form",
      "Lower section is an elevated base or stand with significant clearance underneath — not a second full closed case",
      "Legged support structure — cabriole legs in Queen Anne or Chippendale examples; turned legs in earlier or vernacular work",
      "Often stretcher system connecting legs in earlier examples for additional rigidity",
      "May have shaped apron, finials, pediment, or carved ornament concentrated in upper section",
      "Strong eighteenth-century American association, with Colonial Revival production through early 20th century",
    ],
    subtypes: [
      {
        id: "subtype_flat_top_highboy",
        name: "Flat-top highboy",
        distinguishing_attributes: [
          "Upper section terminates in flat horizontal top",
          "Often earlier in the highboy production sequence (William and Mary, early Queen Anne)",
          "Cleaner, more architectural silhouette than bonnet-top examples",
        ],
      },
      {
        id: "subtype_bonnet_top_highboy",
        name: "Bonnet-top highboy",
        distinguishing_attributes: [
          "Upper section terminates in a bonnet-top (closed scrolled pediment)",
          "Often later than flat-top in production sequence",
          "Strong stylistic expression of upper section as architectural element",
          "May exceed 90 inches in total height",
        ],
      },
      {
        id: "subtype_broken_arch_highboy",
        name: "Broken-arch highboy",
        distinguishing_attributes: [
          "Upper section terminates in a broken-arch pediment (open scrolled pediment)",
          "Often features central finial in the broken arch",
          "Highly decorative top treatment characteristic of formal Chippendale production",
        ],
      },
      {
        id: "subtype_queen_anne_highboy",
        name: "Queen Anne highboy",
        distinguishing_attributes: [
          "Cabriole legs without carved ornament or with restrained shell carving",
          "Curvilinear apron",
          "Restrained overall ornament emphasizing line and proportion",
          "Date range c. 1720-1755 (original); revival production later",
        ],
        date_floor: 1720,
        date_ceiling: 1755,
      },
      {
        id: "subtype_chippendale_highboy",
        name: "Chippendale highboy",
        distinguishing_attributes: [
          "Carved cabriole legs, often with claw-and-ball feet",
          "Carved shells, foliage, or other decorative motifs on apron and upper section",
          "More elaborate ornament than Queen Anne examples",
          "Date range c. 1755-1790 (original); revival production later",
        ],
        date_floor: 1755,
        date_ceiling: 1790,
      },
    ],
    cousin_form_contrasts: [
      "Highboy vs chest of drawers: chest of drawers is a closed stacked drawer case with grounded base (feet, plinth, or low bracket base); highboy has a legged lower base or stand with significant clearance underneath. Tallness alone does not make a highboy — the elevated legged base is the structural requirement.",
      "Highboy vs chest-on-chest: chest-on-chest has two stacked full closed case sections (both upper and lower are drawer cases); highboy has an upper chest over a legged base or stand (lower is structural support, not a full closed case).",
      "Highboy vs tall chest: tall chest is a single-case vertical drawer form with grounded base; highboy requires a distinct elevated base structure with legs and clearance underneath.",
      "Highboy vs secretary bookcase: secretary bookcase includes writing function (fall-front or slant-front) or upper bookcase section with shelving; highboy remains clothing or textile drawer storage throughout.",
    ],
    dimensional_thresholds: {
      width_min: 36,
      width_max: 48,
      height_min: 65,
      height_max: 90,
      depth_min: 20,
      depth_max: 24,
      weight_min: 150,
      weight_max: 350,
      notes: "Height 65-90 inches typical; large bonnet-top examples may exceed 90 inches. Width 36-48 inches and depth 20-24 inches reflect the proportions necessary to support tall stacked construction on legged base. Weight 150-350 pounds typical due to two-part construction and substantial leg/base structure.",
    },
    common_aliases: [
      "high chest",
      "high chest of drawers",
      "tallboy (in some retail or British-influenced usage)",
      "chest on frame",
      "Queen Anne highboy",
      "Chippendale highboy",
      "bonnet-top highboy",
    ],
    regional_period_notes: "Highboy is important in eighteenth-century American furniture, with strong regional traditions in New England (particularly Boston, Newport, and Connecticut River Valley) and Philadelphia (where the form reached its most elaborate Chippendale expression). Later Colonial Revival highboys (late 19th and early 20th century) imitate eighteenth-century forms with varying degrees of accuracy. Critical engine caution: construction evidence is critical for separating period examples from revival or reproduction pieces. Machine-cut joinery, plywood, modern screws, and factory finish indicate later production regardless of stylistic features. Period highboys show hand-cut dovetails, hand-shaped legs, secondary woods consistent with regional traditions, and signs of long-term use and repair. Specific datable construction features within this evolution belong in HISTORICAL_CLUE_LIBRARY for clue-level engine reasoning.",
  },
  {
    id: "form_blanket_chest",
    category: "form",
    name: "blanket chest",
    parent_category: "case_piece",
    family_id: "family_bedroom_clothing_storage",
    spatial_behavior_id: "spatial_vertical_storage",
    date_floor: 1700,
    date_ceiling: 1900,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Rectangular box-based case construction — solid carcass forming an enclosed cavity",
      "Hinged lid access from above — the primary and defining storage method",
      "Large open interior cavity — bulk storage rather than segmented compartments",
      "May include till compartment (small lidded section inside upper edge) for valuables, papers, or small items",
      "Base construction varies — bracket feet, bun feet, bootjack ends, or simple board base",
      "Surface treatment varies — paneled, painted, carved, or cedar-lined examples all common",
      "Storage is bulk-oriented rather than segmented — designed for blankets, linens, textiles, clothing, or household goods stored in volume",
      "Domestic rather than travel-oriented — distinguishes from trunk's portable construction",
    ],
    subtypes: [
      {
        id: "subtype_six_board_chest",
        name: "Six-board chest",
        distinguishing_attributes: [
          "Constructed from six boards: top, bottom, two sides, front, back",
          "Simplest construction approach",
          "Common in vernacular and rural production",
          "Often painted or decorated",
        ],
      },
      {
        id: "subtype_paneled_blanket_chest",
        name: "Paneled blanket chest",
        distinguishing_attributes: [
          "Frame-and-panel construction on sides and front",
          "More refined than six-board chests",
          "Often associated with Pennsylvania German and other formal traditions",
        ],
      },
      {
        id: "subtype_painted_blanket_chest",
        name: "Painted blanket chest",
        distinguishing_attributes: [
          "Decorated with painted ornament — geometric patterns, folk motifs, dates, names, or scenic imagery",
          "Strong Pennsylvania German tradition (Hex signs, tulips, hearts, peacocks, distelfinks)",
          "Painted decoration may be original or later applied",
        ],
      },
      {
        id: "subtype_dower_chest",
        name: "Dower chest / dowry chest",
        distinguishing_attributes: [
          "Made for a young woman's dowry — storage of household textiles, linens, and clothing brought to marriage",
          "Often inscribed with name and date",
          "Frequently painted with decorative motifs (Pennsylvania German tradition particularly notable)",
          "Cultural artifact as much as furniture form",
        ],
      },
      {
        id: "subtype_hope_chest",
        name: "Hope chest",
        distinguishing_attributes: [
          "20th century equivalent of the dower chest tradition",
          "Made for young women anticipating marriage to store linens, clothing, and household goods",
          "Often cedar-lined for moth protection",
          "Common factory production from major American furniture manufacturers",
        ],
      },
      {
        id: "subtype_cedar_chest",
        name: "Cedar chest",
        distinguishing_attributes: [
          "Cedar lining or solid cedar construction for moth protection of stored textiles",
          "Often a 20th century industrial bedroom-storage tradition",
          "May also be a hope chest variant with cedar lining",
        ],
      },
    ],
    cousin_form_contrasts: [
      "Blanket chest vs trunk: blanket chest is domestic and furniture-like; trunk is portable and travel-oriented. Blanket chest may lack side handles, reinforced corners, straps, and transport hardware — these are trunk identifiers. Blanket chest sits in place; trunk is built to be moved.",
      "Blanket chest vs low chest: blanket chest uses hinged-lid access from above; low chest uses drawers. Storage method is the structural distinction.",
      "Blanket chest vs cedar chest: cedar chest is usually a subtype of blanket or hope chest characterized by cedar lining or construction. Cedar lining alone narrows the identification toward cedar chest within the blanket chest family.",
      "Blanket chest vs bench: blanket chest may be used as seating but storage is the primary function; bench has seating as primary function with storage incidental or absent. Storage box with incidental seating remains a chest, not a bench.",
    ],
    dimensional_thresholds: {
      width_min: 36,
      width_max: 60,
      height_min: 18,
      height_max: 28,
      depth_min: 16,
      depth_max: 24,
      weight_min: 40,
      weight_max: 175,
      notes: "Width 36-54 inches typical; large examples may exceed 60 inches. Height 18-28 inches reflects bench-adjacent or low storage proportions. Depth 16-24 inches accommodates folded textiles. Weight 40-175 pounds typical; heavy hardwood or paneled examples may exceed 175 pounds.",
    },
    common_aliases: [
      "hope chest",
      "cedar chest",
      "dower chest",
      "dowry chest",
      "linen chest",
      "storage chest",
      "lift-top chest",
      "trousseau chest",
      "blanket box",
      "trunk (in loose retail usage; structurally incorrect)",
    ],
    regional_period_notes: "Blanket chest is one of the older American domestic storage forms, with strong presence in colonial, Pennsylvania German, New England, Southern, Shaker, and vernacular traditions. Painted decoration, till compartments, feet construction, hinges, and joinery may provide regional clues — Pennsylvania German painted chests are particularly distinctive with folk-art motifs. Twentieth-century cedar chests are structurally related but belong to a later industrial bedroom-storage tradition (Lane Cedar Chest Company being the dominant American producer). Critical engine caution: do not assume early date from chest form alone. The form persisted across centuries with relatively stable structural identity, so construction evidence (hand-cut vs machine-cut dovetails, hardware type, secondary woods, joinery) should control date interpretation. Specific datable construction features within this evolution belong in HISTORICAL_CLUE_LIBRARY for clue-level engine reasoning.",
  },
  {
    id: "form_trunk",
    category: "form",
    name: "trunk",
    parent_category: "case_piece",
    family_id: "family_bedroom_clothing_storage",
    date_floor: 1700,
    date_ceiling: 1940,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Enclosed box-like storage body — rectangular case with hinged lid access",
      "Travel-oriented construction — built to withstand handling, transport, and movement",
      "Side handles common — leather straps, metal handles, or rope handles for two-person carrying",
      "Hardware features include lock, hasp, latch, or strap closures",
      "Reinforced corners or edges — metal corner brackets, leather edge bindings, or wooden battens for impact protection",
      "Surface covering varies — leather, canvas, metal (often tin or zinc), wood-slat, or fiber covering over wooden carcass",
      "Top profile varies — flat top, domed top, or shaped top affects stacking and use",
      "Built to withstand movement — distinguishes structurally from blanket chest's domestic stationary construction",
    ],
    subtypes: [
      {
        id: "subtype_flat_top_trunk",
        name: "Flat-top trunk",
        distinguishing_attributes: [
          "Flat horizontal top allows stacking",
          "Practical for storage and transport in cargo holds, train baggage cars, or attic storage",
          "More common in later industrial production",
        ],
      },
      {
        id: "subtype_dome_top_trunk",
        name: "Dome-top trunk",
        distinguishing_attributes: [
          "Curved or peaked top",
          "Design discourages stacking and water pooling",
          "Often earlier in trunk production sequence",
          "Aesthetic emphasis as well as functional",
        ],
      },
      {
        id: "subtype_steamer_trunk",
        name: "Steamer trunk",
        distinguishing_attributes: [
          "Designed for transatlantic and cross-country travel via steamship and rail",
          "Often flat-topped for stacking in ship holds and train baggage cars",
          "Heavy reinforcement and substantial hardware",
          "Peak production c. 1870-1930",
        ],
        date_floor: 1870,
        date_ceiling: 1930,
      },
      {
        id: "subtype_wardrobe_trunk",
        name: "Wardrobe trunk",
        distinguishing_attributes: [
          "Opens vertically rather than from the top",
          "Interior fitted with hanging rod on one side and drawers/compartments on the other",
          "Functions as portable closet",
          "Height typically 36-44 inches or more, larger than standard trunks",
          "Peak production c. 1900-1940",
        ],
        date_floor: 1900,
        date_ceiling: 1940,
        dimensional_thresholds: {
          height_min: 36,
          height_max: 44,
        },
      },
      {
        id: "subtype_footlocker",
        name: "Footlocker",
        distinguishing_attributes: [
          "Smaller and plainer than steamer or wardrobe trunks",
          "Usually institutional or military origin",
          "Designed for storage at the foot of a bed in barracks, dormitories, or institutional settings",
          "Often standardized dimensions per institution",
        ],
      },
      {
        id: "subtype_jenny_lind_trunk",
        name: "Jenny Lind trunk",
        distinguishing_attributes: [
          "Distinctive lobed or scalloped top profile",
          "Named after the Swedish singer who toured America 1850-1852",
          "Decorative as well as functional",
          "Date range c. 1850-1880",
        ],
        date_floor: 1850,
        date_ceiling: 1880,
      },
      {
        id: "subtype_immigrant_trunk",
        name: "Immigrant trunk",
        distinguishing_attributes: [
          "Made for transatlantic immigration during major immigration waves",
          "Often inscribed with names, ports, or dates",
          "May reflect regional construction traditions of country of origin",
          "Cultural artifact value beyond furniture identification",
        ],
      },
    ],
    cousin_form_contrasts: [
      "Trunk vs blanket chest: trunk is portable and travel-oriented with handles, locks, reinforced corners, and surface coverings designed for transport; blanket chest is domestic and furniture-oriented without those transport features. Wear patterns reflect different uses — trunks show transport wear, blanket chests show domestic placement wear.",
      "Trunk vs cedar chest: cedar chest is textile-storage furniture for the home; trunk is transport storage for movement between locations. Cedar lining alone does not make a piece a trunk — the transport features (handles, reinforcement, covering) are required.",
      "Trunk vs footlocker: footlocker is a subtype of trunk, usually smaller, plainer, and more institutional or military than other trunk forms.",
      "Trunk vs wardrobe: wardrobe is stationary room furniture for hanging clothing; wardrobe trunk is portable luggage with fitted clothing storage interior. Both terms include 'wardrobe' but the structural identities are fundamentally different.",
    ],
    dimensional_thresholds: {
      width_min: 24,
      width_max: 42,
      height_min: 16,
      height_max: 30,
      depth_min: 14,
      depth_max: 24,
      weight_min: 20,
      weight_max: 120,
      notes: "Standard trunk ranges 24-42 inches wide, 16-30 inches tall, 14-24 inches deep. Wardrobe trunks may exceed 36 inches in height. Empty weight 20-120 pounds typical; large wardrobe or heavily reinforced trunks may exceed 120 pounds. Weight ranges reflect empty trunks; loaded trunks for transport could weigh substantially more.",
    },
    common_aliases: [
      "travel trunk",
      "steamer trunk",
      "storage trunk",
      "footlocker",
      "wardrobe trunk",
      "shipping trunk",
      "immigrant trunk",
      "luggage trunk",
      "chest (in casual listings; structurally incorrect for true trunks)",
    ],
    regional_period_notes: "Trunks belong to both furniture and luggage history — placement in bedroom/clothing storage is valid by use (trunks often ended their working lives in bedrooms as storage) but structurally they should be flagged as portable transitional storage. Wear patterns may reflect travel, shipping, or storage rather than domestic furniture use, with characteristic wear from straps, handles, and corner protection. Hardware, covering material, corner reinforcement, manufacturer labels (often inside the lid), and interior fittings are major dating clues. American trunk production peaked c. 1870-1930 with major manufacturers in Chicago, Newark, and other industrial centers. Critical engine caution: trunk identification depends on transport features (handles, reinforcement, covering) more than on shape alone — many domestic blanket chests are misidentified as trunks in retail listings.",
  },
  {
    id: "form_nightstand",
    category: "form",
    name: "nightstand",
    parent_category: "case_piece",
    family_id: "family_bedroom_clothing_storage",
    spatial_behavior_id: "spatial_bedside_furniture",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Small footprint sized for bedside placement",
      "Bedside scale — height aligned with mattress or bed rail height for immediate-access reach from a sleeping or seated-on-bed position",
      "Top surface for lamp, book, clock, water, or personal items — surface utility is the primary function",
      "May include drawer, shelf, door, cubby, or small cabinet — storage is secondary to surface and access",
      "Usually used in pairs in bedroom suites, especially in 20th century coordinated production",
      "Immediate-access behavior is more important than total storage capacity",
      "Bedside placement context distinguishes from end tables (seating-area placement) and small case forms (storage-oriented placement)",
    ],
    subtypes: [
      {
        id: "subtype_simple_bedside_table",
        name: "Simple bedside table",
        distinguishing_attributes: [
          "Surface only or surface plus small undershelf",
          "No drawer or cabinet storage",
          "Most basic nightstand configuration",
        ],
      },
      {
        id: "subtype_one_drawer_nightstand",
        name: "One-drawer nightstand",
        distinguishing_attributes: [
          "Single drawer below top surface",
          "Common in 20th century coordinated bedroom suites",
          "Drawer typically shallow, sized for bedside personal items",
        ],
      },
      {
        id: "subtype_door_and_drawer_nightstand",
        name: "Door-and-drawer nightstand",
        distinguishing_attributes: [
          "Drawer above small cabinet door section",
          "More substantial storage than simple or one-drawer variants",
          "Common in mid-20th century bedroom suites",
        ],
      },
      {
        id: "subtype_open_shelf_nightstand",
        name: "Open-shelf nightstand",
        distinguishing_attributes: [
          "One or more open shelves below top surface",
          "Open shelving rather than enclosed storage",
          "Often more visually airy than enclosed nightstand variants",
        ],
      },
      {
        id: "subtype_commode_style_nightstand",
        name: "Commode-style nightstand",
        distinguishing_attributes: [
          "Cabinet-form bedside piece often with single door",
          "May reflect repurposed European commode tradition or revival of the form",
          "More cabinet-like than typical nightstand",
        ],
      },
    ],
    cousin_form_contrasts: [
      "Nightstand vs end table: nightstand is bedroom and bed-height oriented (24-30 inches typical, aligned to mattress); end table is seating-area oriented (commonly 22-26 inches, aligned to sofa or chair arm height). Placement context and height calibration differ even when scale is similar.",
      "Nightstand vs bedside chest: bedside chest is larger and more drawer-storage oriented; nightstand is smaller and immediate-access oriented. Bedside chest belongs in low chest spatial behavior; nightstand belongs in bedside furniture spatial behavior. The structural distinction is storage primacy vs surface-and-access primacy.",
      "Nightstand vs low chest: low chest has more storage capacity and broader proportions; nightstand is scaled to bed use with compact footprint. Very small low chests may overlap with large nightstands; primary function (storage vs bedside access) and pairing context (used in bedroom suite pairs vs standalone) should disambiguate.",
      "Nightstand vs washstand: washstand may have marble top, splashback, towel bar, basin support, or other hygiene-specific evidence; nightstand supports bedside access without basin or hygiene fittings. When hygiene evidence is present, washstand classification overrides nightstand.",
      "Nightstand vs commode: commode is often misused in retail listings for small bedside cabinets, chamber forms, or European case-furniture terminology. Nightstand should be preferred when bedside function is clearly the primary use; commode classification requires period, regional, or structural evidence supporting the European or chamber-pot tradition.",
    ],
    dimensional_thresholds: {
      width_min: 16,
      width_max: 30,
      height_min: 24,
      height_max: 30,
      depth_min: 14,
      depth_max: 20,
      weight_min: 15,
      weight_max: 80,
      notes: "Standard nightstand range 16-30 inches wide, 24-30 inches tall, 14-20 inches deep. Low platform-bed examples may be 18-24 inches high; tall bed examples may be 28-32 inches high. Weight 15-80 pounds typical, reflecting compact construction.",
    },
    common_aliases: [
      "bedside table",
      "bedside cabinet",
      "night table",
      "night cabinet",
      "bedside chest (when storage is substantial)",
      "bed table",
      "commode (in European or chamber-form tradition)",
      "end table (in casual or non-bedroom listings; structurally questionable)",
    ],
    regional_period_notes: "Modern nightstands become standard with coordinated 20th century bedroom suites — the matched dresser-bed-nightstand configuration is the recognizable American bedroom suite of the late 19th century onward. Earlier bedside functions were served by candle stands (small turned-leg tables for candle holders), washstands (with basin and pitcher in pre-plumbing eras), commodes (often containing chamber pots in the chamber-form tradition), or simple small tables repurposed for bedside use. Critical engine caution: do not project modern nightstand identity backward without bedside scale evidence and bedside-suite-coordination context. A small 19th century bedside table is not necessarily a nightstand in the modern sense; bedside function evidence (pairing with a specific bed, suite-coordinated styling, height aligned with a specific mattress) is needed to classify as nightstand rather than as candle stand, small table, or repurposed piece. Pairing, suite match, height calibration, and storage layout are the most useful clues for nightstand classification.",
  },
  {
    id: "form_dressing_table",
    category: "form",
    name: "dressing table",
    parent_category: "case_piece",
    family_id: "family_bedroom_clothing_storage",
    spatial_behavior_id: "spatial_personal_hygiene",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Seated-use proportions — height calibrated for seated user (typically 28-32 inches at the working surface)",
      "Knee opening or seated access space — distinguishes structurally from dresser's closed case construction",
      "Surface for grooming, cosmetics, or personal articles — function is grooming and personal care, not bulk clothing storage",
      "Often associated with mirror — central mirror, triple-fold mirror, or framed mirror mounted on supports above the surface",
      "Drawers are accessory-focused rather than bulk clothing storage — sized for cosmetics, jewelry, brushes, small items",
      "May include side drawer banks flanking knee space — drawer storage at outer ends, knee opening centered",
      "Often paired with stool or bench — the seated-use design assumes companion seating",
      "Mirror may be missing on surviving examples, but mounting evidence (holes, hardware, supports) often remains",
    ],
    subtypes: [
      {
        id: "subtype_vanity_table",
        name: "Vanity table",
        distinguishing_attributes: [
          "Common retail and casual term for dressing table",
          "Functionally identical to standard dressing table",
          "Often features prominent mirror as defining visual element",
        ],
      },
      {
        id: "subtype_triple_mirror_vanity",
        name: "Triple-mirror vanity",
        distinguishing_attributes: [
          "Three-panel mirror system with central fixed mirror and two angled side panels",
          "Side panels typically hinged, allowing the user to see multiple angles simultaneously",
          "Common in mid-20th century bedroom suites",
          "Date range c. 1920-1960",
        ],
        date_floor: 1920,
        date_ceiling: 1960,
      },
      {
        id: "subtype_kneehole_dressing_table",
        name: "Kneehole dressing table",
        distinguishing_attributes: [
          "Pronounced central knee opening flanked by drawer banks on both sides",
          "More architectural in feel than simple dressing table",
          "May overlap historically with kneehole desk forms",
        ],
      },
      {
        id: "subtype_lowboy_dressing_table",
        name: "Lowboy dressing table",
        distinguishing_attributes: [
          "Early dressing table form on cabriole legs",
          "Table-like rather than case-like construction",
          "Date range c. 1700-1800",
          "Note: lowboy is a separate form not yet authored at canonical depth in the constraint library; this subtype captures the dressing-table-functional aspect of lowboy as it serves bedroom dressing function",
        ],
        date_floor: 1700,
        date_ceiling: 1800,
      },
      {
        id: "subtype_princess_vanity",
        name: "Princess vanity",
        distinguishing_attributes: [
          "Tall mirror supports rising above the surface",
          "Often paired stool",
          "Common in late 19th and early 20th century bedroom suites",
          "Date range c. 1880-1930",
        ],
        date_floor: 1880,
        date_ceiling: 1930,
      },
      {
        id: "subtype_dressing_table_with_bench",
        name: "Dressing table with bench",
        distinguishing_attributes: [
          "Specifically sold or made as a coordinated set with bench or stool",
          "20th century factory-suite production",
        ],
      },
    ],
    cousin_form_contrasts: [
      "Dressing table vs dresser: dressing table has seated access or knee opening; dresser is a closed storage case without knee opening. Mirror alone does not distinguish — many dressers have mirrors. The knee opening and seated-use proportions are the structural distinction. When in doubt: can a person sit at it? If yes, dressing table; if no, dresser.",
      "Dressing table vs vanity: vanity is the common retail and casual term for dressing table. Treat vanity as alias-or-subtype rather than a separate form, unless structural evidence specifically requires separate handling (rare).",
      "Dressing table vs washstand: dressing table supports grooming and cosmetics; washstand supports washing, basin use, or hygiene equipment. Marble top, splashback, towel bar, basin proportions, or pitcher accommodation support washstand classification. When in doubt, washstand-specific hardware evidence overrides dressing-table classification.",
      "Dressing table vs desk: dressing table is bedroom grooming furniture; desk supports writing, work, or administrative activity. Missing mirror is a common cause of dressing-table-mislisted-as-desk. Surface depth, drawer arrangement (cosmetic-sized vs writing-implement-sized), and bedroom placement context should disambiguate.",
      "Dressing table vs lowboy: lowboy is an earlier dressing-related table form on cabriole legs. The lowboy-as-dressing-table relationship is captured in subtype_lowboy_dressing_table. Period, drawer layout, height, and seated-use evidence determine whether the piece is best classified as dressing table or as standalone lowboy form.",
    ],
    dimensional_thresholds: {
      width_min: 36,
      width_max: 60,
      height_min: 28,
      height_max: 32,
      depth_min: 16,
      depth_max: 22,
      weight_min: 50,
      weight_max: 200,
      notes: "Width 36-60 inches and height 28-32 inches reflect seated-use ergonomics. Depth 16-22 inches accommodates grooming surface without intruding into knee space. Knee opening width often 20-26 inches clear space. Total height with mirror commonly 55-75 inches. Weight 50-200 pounds typical; large mirrored examples may exceed 200 pounds.",
    },
    common_aliases: [
      "vanity",
      "vanity table",
      "makeup table",
      "dressing vanity",
      "toilet table (older grooming term; does not refer to modern bathroom fixture)",
      "bureau table",
      "kneehole vanity",
      "dresser vanity (in casual or hybrid listings; structurally questionable)",
      "dressing bureau",
    ],
    regional_period_notes: "Toilet table is an older grooming term referring to dressing or grooming station, not to modern bathroom fixture. Mirrored vanities are especially common in late 19th and early 20th century bedroom suites. Art Deco, waterfall, Depression-era, and mid-century examples often use strong mirror designs as the visual anchor. Critical engine caution: missing mirrors are common on surviving examples and frequently cause dressing tables to be misidentified as desks; mirror-mounting evidence (holes, hardware, vertical supports) often remains and should drive identification when the mirror itself is gone. The vanity tradition spans American bedroom suite production from late Victorian through mid-century, with stylistic expression appropriate to each period; style alone should not date the form. Construction evidence (drawer joinery, secondary woods, hardware, mirror mounting type) should control date interpretation. Specific datable construction features within this evolution belong in HISTORICAL_CLUE_LIBRARY for clue-level engine reasoning.",
  },
  {
    id: "form_chifforobe",
    category: "form",
    name: "chifforobe",
    parent_category: "case_piece",
    family_id: "family_bedroom_clothing_storage",
    spatial_behavior_id: "spatial_clothing_enclosure",
    date_floor: 1900,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Tall bedroom storage case combining hanging compartment and drawer bank in a single unified case",
      "One section provides hanging storage with door access and internal hanging rod or hooks",
      "One section provides stacked drawer storage with drawer fronts on the case face",
      "Door and drawer systems are both primary — neither is secondary or accessory",
      "Often side-by-side organization: wardrobe section on one side, drawer bank on the other side",
      "May include mirror on the wardrobe section door, especially in lady's chifforobes",
      "Designed for clothing storage in rooms with limited or no built-in closet space",
      "Distinct from wardrobe (hanging-only) and from chest of drawers (drawer-only) — the hybrid identity is the form's defining structural character",
    ],
    subtypes: [
      {
        id: "subtype_single_door_chifforobe",
        name: "Single-door chifforobe",
        distinguishing_attributes: [
          "Single hanging-section door alongside drawer bank",
          "Most common chifforobe configuration",
          "Drawer bank typically 4-5 drawers",
        ],
      },
      {
        id: "subtype_double_door_chifforobe",
        name: "Double-door chifforobe",
        distinguishing_attributes: [
          "Two hanging-section doors, often opening to broader hanging space",
          "Larger overall scale than single-door variants",
          "Often features more substantial drawer bank as well",
        ],
      },
      {
        id: "subtype_mirrored_chifforobe",
        name: "Mirrored chifforobe",
        distinguishing_attributes: [
          "Mirror mounted on wardrobe door or doors",
          "Common in lady's bedroom configurations",
          "Mirror serves both functional (dressing) and decorative purposes",
        ],
      },
      {
        id: "subtype_gentlemans_chifforobe",
        name: "Gentleman's chifforobe",
        distinguishing_attributes: [
          "Often features more substantial drawer bank than mirrored or lady's chifforobes",
          "May include tie or accessory storage in the wardrobe section",
          "Less likely to feature mirror",
        ],
      },
      {
        id: "subtype_compactum",
        name: "Compactum",
        distinguishing_attributes: [
          "British term for fitted wardrobe combining hanging space with drawers and trays",
          "Functionally similar to chifforobe but with British or Commonwealth origin",
          "May be encountered in American antique markets through import or via Anglophile collectors",
          "Note: compactum overlaps wardrobe territory as well; classification depends on whether the drawer/tray system is structurally substantial enough to qualify as a true chifforobe-style hybrid",
        ],
      },
    ],
    cousin_form_contrasts: [
      "Chifforobe vs wardrobe: wardrobe is primarily hanging storage with shelving or drawers strictly secondary; chifforobe has substantial drawer storage plus hanging storage as co-equal primary structures. The drawer prominence is the structural distinction — a wardrobe with a single small drawer at the bottom is still a wardrobe; a chifforobe has a substantial drawer bank co-equal with the hanging section.",
      "Chifforobe vs armoire: armoire has broader cabinet-storage identity that may include hanging, shelves, drawers, or open storage in varied configurations; chifforobe has the specific wardrobe-plus-drawers plan as its defining structure. Armoire is more flexible in interior arrangement; chifforobe is more specifically structured.",
      "Chifforobe vs dresser: dresser is drawer storage only or primarily, with no significant hanging compartment; chifforobe includes hanging storage as primary function. The presence of true hanging space (not just a small enclosed cabinet) distinguishes chifforobe from dresser even when both have substantial drawer banks.",
      "Chifforobe vs gentleman's chest: gentleman's chest may have doors over trays or drawers but lacks a true hanging compartment; chifforobe requires a true hanging compartment of sufficient depth and height to accommodate full-length garments on hangers.",
    ],
    dimensional_thresholds: {
      width_min: 34,
      width_max: 54,
      height_min: 55,
      height_max: 75,
      depth_min: 18,
      depth_max: 24,
      weight_min: 120,
      weight_max: 350,
      notes: "Width 34-54 inches accommodates side-by-side wardrobe-and-drawer organization. Height 55-75 inches reflects standing-use clothing storage. Depth 18-24 inches sufficient for hanging garments and drawer storage. Weight 120-350 pounds typical; mirrored examples may weigh more due to mirror weight and supporting structure.",
    },
    common_aliases: [
      "chifferobe (alternative spelling, equally common)",
      "chiffrobe (alternative spelling)",
      "wardrobe chest",
      "wardrobe dresser",
      "gentleman's wardrobe",
      "gentleman's chest",
      "robe chest",
      "combination wardrobe",
    ],
    regional_period_notes: "Chifforobe shows strong early to mid-20th century American usage, especially common in houses with limited or no closet space. Spelling varies regionally and casually — chifforobe, chifferobe, chiffrobe are all used interchangeably without semantic distinction. The form is common in oak, walnut, mahogany, waterfall, Art Deco, Depression-era, and mid-century bedroom suites. Mainstream factory production largely ended in the late 1960s as built-in closets became standard residential construction, but boutique reproduction and revival production continue, so no firm production end date is set. Critical engine caution: chifforobe emerged as a distinct form c. 1900 — forms predating that date that combine hanging and drawer storage should be classified as wardrobe-with-drawers or armoire (with appropriate cabinet-storage character) rather than as chifforobe. The chifforobe identity carries specific 20th century American suite-coordinated production context that should not be back-projected onto earlier hybrid forms. Structural recognition is more reliable than spelling or listing title for identification.",
  },
  {
    id: "form_wardrobe",
    category: "form",
    name: "wardrobe",
    parent_category: "case_piece",
    family_id: "family_bedroom_clothing_storage",
    spatial_behavior_id: "spatial_clothing_enclosure",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Tall enclosed clothing-storage cabinet with door-based access — primary access method is doors, not drawers",
      "Interior dominated by hanging volume — vertical space organized for suspending garments on a rod or pegs",
      "Depth sufficient for garments — typically 18-26 inches, with about 20-24 inches needed for true hanger depth",
      "Hanging rod, hooks, pegs, or garment fittings common — interior fittings support the hanging-storage function",
      "Shelves or drawers may be present but secondary — when drawers become substantial co-equal storage, the form crosses into chifforobe territory",
      "Often used where built-in closets are absent or insufficient — peak American usage 1850-1940 before built-in closets became residential standard",
      "Functions as movable closet furniture — distinguishes from built-in closets (architectural) and from cabinets (broader storage character)",
    ],
    subtypes: [
      {
        id: "subtype_single_wardrobe",
        name: "Single wardrobe",
        distinguishing_attributes: [
          "Single door access to hanging compartment",
          "Width typically 30-42 inches",
          "Most common wardrobe configuration in smaller American homes",
        ],
      },
      {
        id: "subtype_double_wardrobe",
        name: "Double wardrobe",
        distinguishing_attributes: [
          "Two doors accessing hanging compartment",
          "Width typically 48-66 inches",
          "More substantial hanging capacity",
        ],
      },
      {
        id: "subtype_triple_wardrobe",
        name: "Triple wardrobe",
        distinguishing_attributes: [
          "Three doors, often with center section for hanging and side sections for shelving or drawers",
          "Width typically 66-90 inches",
          "Largest standard wardrobe configuration",
        ],
      },
      {
        id: "subtype_mirrored_wardrobe",
        name: "Mirrored wardrobe",
        distinguishing_attributes: [
          "Mirror mounted on door or doors (single door, center door of triple, or both doors of double)",
          "Mirror serves both functional (dressing) and decorative purposes",
          "Common in late 19th and early 20th century production",
        ],
      },
      {
        id: "subtype_knockdown_wardrobe",
        name: "Knockdown wardrobe",
        distinguishing_attributes: [
          "Designed to disassemble for transport or storage",
          "Often includes bolt-through construction or notched-and-pegged joinery",
          "Common in 19th and early 20th century when furniture moving was less mechanized",
          "Date range c. 1850-1930",
        ],
        date_floor: 1850,
        date_ceiling: 1930,
      },
    ],
    cousin_form_contrasts: [
      "Wardrobe vs armoire: wardrobe is the more neutral structural term for clothing-storage cabinet, primarily oriented to hanging garment storage; armoire often implies larger, more decorative, more cabinet-like, or French/Continental-influenced storage form that may include hanging, shelves, drawers, or mixed storage. In American listings, the terms often overlap and interchange. Structural primary-hanging-orientation supports wardrobe; structural varied-cabinet-storage-orientation supports armoire.",
      "Wardrobe vs chifforobe: wardrobe is primarily hanging storage with shelving or drawers strictly secondary; chifforobe combines hanging storage with a substantial drawer bank as co-equal primary structures. The substantial-drawer-bank presence is the structural distinction.",
      "Wardrobe vs clothes press: wardrobe emphasizes hanging garments; clothes press often emphasizes shelves, trays, or folded textiles. Earlier traditions used clothes press for the folded-storage form; wardrobe for hanging garments. American usage often blurs the two terms.",
      "Wardrobe vs cabinet: wardrobe has clothing-specific depth (18-26 inches) and interior fittings (hanging rod, hooks, garment-supporting structures); cabinet is broader and may serve many storage functions without clothing-specific fittings. Interior fitting evidence drives the wardrobe classification.",
    ],
    dimensional_thresholds: {
      width_min: 30,
      width_max: 72,
      height_min: 60,
      height_max: 84,
      depth_min: 18,
      depth_max: 26,
      weight_min: 100,
      weight_max: 400,
      notes: "Standard wardrobe range 30-72 inches wide, 60-84 inches tall, 18-26 inches deep. True hanger depth typically requires 20-24 inches of interior depth. Weight 100-400 pounds typical; large mirrored examples may exceed 400 pounds.",
    },
    common_aliases: [
      "clothes closet",
      "clothes cabinet",
      "wardrobe cabinet",
      "robe",
      "armoire (overlapping term; structural evidence determines which is more accurate)",
      "clothes press (in older or British-influenced usage)",
      "mirrored wardrobe",
      "knockdown wardrobe",
      "closet cabinet",
    ],
    regional_period_notes: "Wardrobe is important in American homes before built-in closets became standard residential construction (peak American wardrobe usage roughly 1850-1940). The form is common in Victorian, Eastlake, Renaissance Revival, Colonial Revival, Art Deco, waterfall, and mid-century bedroom suites with stylistic expression appropriate to each period. Mirrored doors, knockdown construction, casters, and interior fittings may help date examples — knockdown construction is particularly characteristic of late 19th and early 20th century production when residential mobility was high and furniture often moved with families. Critical engine caution: wardrobe and armoire are often listed interchangeably in retail and casual usage, so structural evidence (interior fittings, primary storage orientation, decorative character) should control identification rather than listing title. Construction evidence should control date interpretation; specific datable construction features belong in HISTORICAL_CLUE_LIBRARY for clue-level engine reasoning.",
  },
  {
    id: "form_armoire",
    category: "form",
    name: "armoire",
    parent_category: "case_piece",
    family_id: "family_bedroom_clothing_storage",
    spatial_behavior_id: "spatial_clothing_enclosure",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Tall enclosed cabinet form with substantial scale and decorative character",
      "Large doors dominating the front elevation — door-based access is primary",
      "Interior may contain hanging space, shelves, drawers, or mixed-purpose open storage in varied configurations",
      "Often broader and more architectonic than a simple wardrobe — cabinet-like rather than purely clothing-functional",
      "May feature decorative panels, shaped cornice, carving, cabriole legs, painted finish, or Continental styling — armoires often carry more elaborate decorative treatment than simple wardrobes",
      "Storage function may extend beyond clothing — armoires are used for linens, household goods, media, or general cabinet storage in addition to clothing",
      "Reflects French, French Canadian, Creole, Continental, or Anglophile decorative tradition in true antique examples; American armoire usage is partly structural and partly market language",
    ],
    subtypes: [
      {
        id: "subtype_clothing_armoire",
        name: "Clothing armoire",
        distinguishing_attributes: [
          "Interior fitted primarily for hanging garments, similar to wardrobe but with armoire decorative character",
          "Most common armoire configuration in American bedroom usage",
        ],
      },
      {
        id: "subtype_linen_armoire",
        name: "Linen armoire / linen press",
        distinguishing_attributes: [
          "Interior fitted primarily for shelved linen storage",
          "Shelves rather than hanging rod dominate the interior",
          "Strong tradition in French and Continental production",
        ],
      },
      {
        id: "subtype_french_armoire",
        name: "French armoire",
        distinguishing_attributes: [
          "Strong Continental decorative character — often features cabriole legs, carved decoration, paneled construction with shaped panels, and cornice treatment",
          "May be true antique French production, French Canadian or Creole production in regional American traditions, or American or imported revival",
        ],
      },
      {
        id: "subtype_country_armoire",
        name: "Country armoire",
        distinguishing_attributes: [
          "Vernacular decorative treatment — painted finishes, simpler joinery, less elaborate carving",
          "Common in French Canadian, Creole, and Pennsylvania German traditions",
          "Restrained decorative character relative to formal French armoires",
        ],
      },
      {
        id: "subtype_entertainment_armoire",
        name: "Entertainment armoire",
        distinguishing_attributes: [
          "Late 20th century adaptation of armoire form for media storage (television, audio equipment, video)",
          "Interior fitted with shelves and pull-out tray sized for electronic equipment",
          "Date range c. 1980-2010 (largely supplanted by flat-screen televisions and digital media)",
          "Note: entertainment armoire is functionally distinct from clothing or linen armoire but uses the same structural identity",
        ],
        date_floor: 1980,
        date_ceiling: 2010,
      },
    ],
    cousin_form_contrasts: [
      "Armoire vs wardrobe: wardrobe is safer for clothing-specific hanging storage with neutral structural character; armoire is broader, often more decorative or cabinet-like, and may store clothing, linens, household goods, or media in varied interior configurations. The decorative-and-flexible character supports armoire; the clothing-specific-and-neutral character supports wardrobe.",
      "Armoire vs chifforobe: chifforobe has a defined hanging-plus-drawer structure as its distinctive identity; armoire may have varied interior arrangements including hanging-only, shelves-only, or mixed configurations. The specific hybrid wardrobe-and-drawer structure of chifforobe is more constrained than the flexible interior of armoire.",
      "Armoire vs cabinet: armoire is larger, more furniture-like, and usually room-dominant; cabinet is a broader storage category that may be smaller or more architectural in feel. Armoire's substantial scale and decorative character are its distinguishing markers.",
      "Armoire vs clothes press: clothes press often emphasizes folded textile storage on shelves or trays; armoire may include hanging, shelving, or mixed storage. Earlier American usage favored clothes press for the shelf-storage form; armoire is the more neutral or French-influenced term.",
      "Armoire vs linen press: linen press is often a subtype or alias for armoire when the interior is fitted for linen shelving. The two terms may overlap.",
    ],
    dimensional_thresholds: {
      width_min: 36,
      width_max: 72,
      height_min: 60,
      height_max: 90,
      depth_min: 18,
      depth_max: 28,
      weight_min: 150,
      weight_max: 500,
      notes: "Width 36-72 inches typical, often broader than wardrobes. Height 60-90 inches reflects substantial scale. Depth 18-28 inches accommodates varied interior arrangements. Weight 150-500 pounds typical; large hardwood armoires may exceed 500 pounds. Substantial scale relative to wardrobes is a consistent armoire characteristic.",
    },
    common_aliases: [
      "wardrobe (overlapping term; structural evidence determines which is more accurate)",
      "French wardrobe",
      "clothes cabinet",
      "linen press",
      "clothes press",
      "storage cabinet",
      "TV armoire",
      "entertainment cabinet",
      "French cabinet",
    ],
    regional_period_notes: "Armoire is partly a structural classification and partly market language in American identification. True antique armoires may reflect French, French Canadian (particularly Quebec), Creole (Louisiana), or Continental European traditions with stylistic and construction characteristics specific to those origins. Many American examples are revival production, imported antiques, or late 20th century decorative furniture marketed under the armoire name. Critical engine caution: do not assume French origin or antique date from the word 'armoire' alone — the term has been broadly applied in American retail to substantial enclosed cabinets regardless of origin or period. Interior fittings, construction (joinery type, secondary woods, hardware), and decorative treatment must control interpretation rather than the word in the listing or label. American Colonial Revival production through the 20th century included substantial armoire production using the form's silhouette without the Continental construction tradition; entertainment armoires of the late 20th century used the silhouette for an entirely modern functional purpose. Specific datable construction features within this evolution belong in HISTORICAL_CLUE_LIBRARY for clue-level engine reasoning.",
  },
  {
    id: "form_bedstead",
    category: "form",
    name: "bedstead",
    parent_category: "case_piece",
    family_id: "family_bedroom_clothing_storage",
    spatial_behavior_id: "spatial_sleep_furniture",
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    distinguishing_features: [
      "Rectangular sleeping support frame designed for horizontal body support during sleep",
      "Headboard and/or footboard — at least one of these is typically present in a complete bedstead",
      "Side rails connecting headboard and footboard (or equivalent support structure in metal or platform examples)",
      "Mattress-support system — slat system, rope system, platform, or metal grid",
      "Designed for horizontal body support sized to a sleeping adult or child",
      "May include vertical posts (subtype: four-poster bed), overhead canopy structure (subtype: tester bed), partial canopy (subtype: half-tester bed), spindles, panels, scrolls, or other decorative or functional features",
      "Complete bedstead is more than a loose headboard — the structural identity requires the full sleeping-support frame, not just a wall-mounted decorative panel",
    ],
    subtypes: [
      {
        id: "subtype_standard_bedstead",
        name: "Standard bedstead",
        distinguishing_attributes: [
          "Headboard, footboard, and side rails without tall posts or canopy",
          "Most common bedstead configuration across periods",
          "Headboard typically 36-60 inches tall; footboard typically 20-36 inches tall",
        ],
      },
      {
        id: "subtype_four_poster_bed",
        name: "Four-poster bed",
        distinguishing_attributes: [
          "Four tall vertical posts at the corners of the bedstead",
          "Posts may be turned, carved, plain, or fluted depending on period and style",
          "Posts typically 60-84 inches tall, sometimes higher",
          "No overhead canopy structure connecting the posts (distinguishing from tester bed)",
          "Common in 18th and 19th century American production with continued revival production through 20th century",
        ],
      },
      {
        id: "subtype_tester_bed",
        name: "Tester bed (canopy bed)",
        distinguishing_attributes: [
          "Four tall posts plus an overhead canopy structure (tester) connecting the posts at the top",
          "Tester may be a flat panel, a frame for fabric drapery, or a fully decorated overhead structure",
          "Total height often 72-96 inches or more",
          "Most elaborate of the bedstead subtypes; strong association with formal 18th century American production",
          "Date range c. 1720-1840 (original); revival production later",
        ],
        date_floor: 1720,
        date_ceiling: 1840,
      },
      {
        id: "subtype_half_tester_bed",
        name: "Half-tester bed",
        distinguishing_attributes: [
          "Tester structure extends only partway over the bedstead, typically attached to the headboard wall and projecting forward over the head of the bed",
          "Often 19th century formal production",
          "More dramatic visual emphasis on the head of the bed than full tester construction",
          "Date range c. 1820-1900",
        ],
        date_floor: 1820,
        date_ceiling: 1900,
      },
      {
        id: "subtype_low_post_bed",
        name: "Low-post bed",
        distinguishing_attributes: [
          "Vertical posts shorter than four-poster (typically 36-50 inches)",
          "More restrained vertical emphasis",
          "Common in vernacular and country production",
        ],
      },
      {
        id: "subtype_rope_bed",
        name: "Rope bed",
        distinguishing_attributes: [
          "Mattress-support system uses rope laced through holes in the side rails rather than slats or platform",
          "Rope system requires periodic tightening (origin of 'sleep tight')",
          "Common in 18th and early 19th century American production",
          "Date range c. 1700-1860",
        ],
        date_floor: 1700,
        date_ceiling: 1860,
      },
      {
        id: "subtype_sleigh_bed",
        name: "Sleigh bed",
        distinguishing_attributes: [
          "Headboard and footboard scrolled outward in a curving silhouette resembling a sleigh",
          "Both head and foot ends typically curved",
          "Strong American Empire and later revival association",
          "Date range c. 1820-1850 (original); revival production later",
          "Common across periods with stylistic expression appropriate to each",
        ],
        date_floor: 1820,
      },
      {
        id: "subtype_spool_bed",
        name: "Spool bed",
        distinguishing_attributes: [
          "Posts and rails feature turned spool-like decoration with regular alternating rounded and recessed sections",
          "Sometimes called Jenny Lind bed (after the Swedish singer who popularized the style during her American tour)",
          "Common in mid-19th century American production",
          "Date range c. 1850-1880",
        ],
        date_floor: 1850,
        date_ceiling: 1880,
      },
      {
        id: "subtype_panel_bed",
        name: "Panel bed",
        distinguishing_attributes: [
          "Headboard (and often footboard) features panel-and-frame construction rather than spindles or scrollwork",
          "Common in 20th century coordinated bedroom suites",
          "Often the most common bedstead configuration in factory-suite production",
        ],
      },
    ],
    cousin_form_contrasts: [
      "Bedstead vs headboard: headboard is a component, often wall-mounted and lacking the full sleeping-support frame; bedstead is the complete structural bed frame including head, foot (when present), rails, and mattress-support system. A standalone headboard is not a bedstead.",
      "Bedstead vs modern bed frame: modern bed frame may be metal-only or platform-only support without traditional bedstead elements; bedstead implies furniture structure with headboard and/or footboard plus rails. Metal Hollywood-style frames are typically not bedsteads in the canonical sense.",
      "Bedstead vs daybed: bedstead is primarily sleeping furniture in standard sleeping orientation; daybed has side-facing lounge or seating behavior and is configured for both rest and seated use. Daybed structure typically faces sideways (long edge to wall) rather than head-to-wall like bedstead.",
      "Standard bedstead vs four-poster bed: four-poster has four tall vertical posts at corners; standard bedstead does not require tall posts. Tall corner posts are the structural distinction.",
      "Four-poster bed vs tester bed: four-poster has tall posts only; tester has tall posts PLUS overhead canopy/tester structure connecting them. The presence of the connecting overhead structure is the structural distinction.",
      "Bedstead vs crib or cot: crib is child-scaled with safety rails (elevated sides preventing the child from falling out); cot is lighter, portable, or temporary sleeping support. Adult-scaled standard sleeping support without safety rails is bedstead.",
    ],
    dimensional_thresholds: {
      weight_min: 60,
      weight_max: 300,
      notes: "Length follows mattress and body scale. Twin mattress: 38 x 75 inches. Full mattress: 54 x 75 inches. Queen mattress: 60 x 80 inches. King mattress: 76 x 80 inches. California king mattress: 72 x 84 inches. Bedstead overall size is usually larger than mattress size due to frame structure. Headboard height: 36-72 inches commonly. Footboard height: 20-48 inches commonly. Four-poster and tester height: 72-96 inches or more commonly. Weight 60-300 pounds typical; large solid-wood poster or tester beds may exceed 300 pounds.",
    },
    common_aliases: [
      "bed",
      "bed frame",
      "bedstead",
      "poster bed (when subtyped as four-poster)",
      "four-poster",
      "canopy bed (when subtyped as tester)",
      "tester bed",
      "rope bed (when subtyped)",
      "sleigh bed (when subtyped)",
      "spool bed (when subtyped)",
      "panel bed (when subtyped)",
      "bed set (in casual or coordinated-suite listings)",
    ],
    regional_period_notes: "Bedstead is one of the foundational American furniture forms with continuous production from colonial period through present. Antique beds frequently do not match modern mattress dimensions (modern queen and king sizes are 20th century innovations); rail extensions, conversions, and replacement hardware are common on pieces that have been adapted for modern mattresses. Rope beds, spool beds, cannonball beds, cottage beds, sleigh beds, and panel beds appear across different American periods with regional production traditions in New England, Pennsylvania, the South, and other major cabinetmaking centers. Critical engine caution: construction evidence should separate period bedsteads from revival or reproduction examples — machine-cut joinery, modern fasteners, and factory finish indicate later production regardless of stylistic features. Tester and four-poster beds in particular have substantial revival production traditions; period authentication requires careful construction evaluation. Specific datable construction features within this evolution belong in HISTORICAL_CLUE_LIBRARY for clue-level engine reasoning.",
  },
  {
    id: "form_pie_safe",
    category: "form",
    name: "pie safe",
    parent_category: "case_piece",
    family_id: "family_general_storage_specialty",
    spatial_behavior_id: "spatial_utility_storage",
    date_floor: 1820,
    date_ceiling: 1880,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_jelly_cupboard",
    category: "form",
    name: "jelly cupboard",
    parent_category: "case_piece",
    date_floor: 1820,
    date_ceiling: 1880,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
    notes: "Date range narrowed from original \"1800s\" (full century) to 1820-1880 per appraiser call during Session 2 migration: post-Federal vernacular form, peak production through Victorian, declining as kitchen design shifted.",
  },
  {
    id: "form_china_cabinet",
    category: "form",
    name: "china cabinet",
    parent_category: "case_piece",
    date_floor: 1880,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_bookcase",
    category: "form",
    name: "bookcase",
    parent_category: "case_piece",
    date_floor: 1700,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_writing_table",
    category: "form",
    name: "writing table",
    parent_category: "desk",
    date_floor: 1700,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_secretary_desk",
    category: "form",
    name: "secretary desk",
    parent_category: "desk",
    date_floor: 1700,
    date_ceiling: 1999,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_slant_front_desk",
    category: "form",
    name: "slant-front desk",
    parent_category: "desk",
    date_floor: 1700,
    date_ceiling: 1899,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_windsor_chair",
    category: "form",
    name: "Windsor chair",
    parent_category: "seating",
    date_floor: 1700,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_rocking_chair",
    category: "form",
    name: "rocking chair",
    parent_category: "seating",
    date_floor: 1800,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_milking_stool",
    category: "form",
    name: "milking stool",
    parent_category: "seating",
    date_floor: 1800,
    date_ceiling: 1920,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_sewing_machine_cabinet",
    category: "form",
    name: "sewing machine cabinet",
    parent_category: "specialized",
    date_floor: 1870,
    date_ceiling: 1910,
    common_conversion_targets: ["nightstand", "side_table"],
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_icebox",
    category: "form",
    name: "icebox",
    parent_category: "specialized",
    date_floor: 1880,
    date_ceiling: 1920,
    common_conversion_targets: ["bar", "beverage_cabinet"],
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
];
