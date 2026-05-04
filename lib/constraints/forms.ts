/**
 * Canonical forms library for Proof Sleuth. Per Section 6.6 of the
 * architectural synthesis. Forms identify the structural type of furniture
 * being analyzed (cabinet, table, chair, etc.) and are consulted by P3 form
 * identification.
 */
import { CanonicalEntry } from "./entryShape";

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
}

export const FORMS: FormEntry[] = [
  {
    id: "form_pump_organ_cabinet",
    category: "form",
    name: "pump organ cabinet",
    parent_category: "specialized",
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
    date_floor: 1800,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_chest_of_drawers",
    category: "form",
    name: "chest of drawers",
    parent_category: "case_piece",
    date_floor: 1700,
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_blanket_chest",
    category: "form",
    name: "blanket chest",
    parent_category: "case_piece",
    date_floor: 1700,
    date_ceiling: 1999,
    common_conversion_targets: ["bench"],
    positive_authority: 7,
    hard_negative_authority: 7,
    migration_status: "partial",
  },
  {
    id: "form_pie_safe",
    category: "form",
    name: "pie safe",
    parent_category: "case_piece",
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
    id: "form_wardrobe",
    category: "form",
    name: "wardrobe",
    parent_category: "case_piece",
    date_floor: 1800,
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
