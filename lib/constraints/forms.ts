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
