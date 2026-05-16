/**
 * Canonical entry shape and shared field-type interfaces for all
 * Proof Sleuth constraint libraries.
 *
 * This file hosts two categories of declarations:
 *
 * (a) The canonical entry base shape (CanonicalEntry). All constraint
 *     library entries must conform to this interface or extend it.
 *     Library-specific fields may be added by extending this interface.
 *     Per Section 6.1 of the architectural synthesis.
 *
 * (b) Shared field-type interfaces consumed across multiple libraries:
 *     - AntiClassificationGuidance (relocated from forms.ts per Block 16
 *       D-WI9 for shared use across forms.ts and the wood identification
 *       domain; also consumed by woodEvidence.ts per Block 22 D-WE22-3).
 *     - PositionOnPiece (introduced per Block 22.5 D-PA-1; cross-library
 *       position-on-piece annotation interface consumed by evidence-
 *       layer libraries — woodEvidence.ts at Block 23+; future
 *       fastenerEvidence.ts, hardwareEvidence.ts, joineryEvidence.ts,
 *       textileEvidence.ts at respective foundation-block time).
 *
 * Shared field-type interfaces in this file are not entry shapes
 * themselves — they are field types that compose into entries.
 * Migration to a dedicated shared-interfaces file (positions.ts or
 * similar) deferred unless this file's scope grows materially beyond
 * the current set.
 */
export interface CanonicalEntry {
  id: string;
  category: string; // e.g. "construction", "joinery", "fasteners", "label", "form", etc.
  positive_authority: number; // 1-10 scale
  hard_negative_authority: number; // 1-10 scale, may equal positive_authority
  date_floor?: number; // numeric year, e.g. 1920
  date_ceiling?: number; // numeric year, e.g. 1939
  indicator_text?: string; // appraiser-voice prose for narrative composition
  replacement_risk?: number; // 0-1 scale
  hard_negative?: boolean;
  migration_status?: "complete" | "partial" | "needs_review";
  notes?: string;

  /** Frame-R3 ORIGINAL-PIECE-PERSISTENCE frame (D-PH3HCL-S1-N). Captures
   * "is this evidence rarely replaced when present?" — the HCL framing
   * preserved alongside replacement_likelihood's restoration-contamination
   * framing. Two-field design preserves both semantics:
   * - replacement_likelihood: "is this commonly INTRODUCED via restoration?"
   *   (high = likely later-introduced; suspect for dating)
   * - original_persistence: "is this rarely REPLACED when originally
   *   present?" (high = trust the date this evidence gives; persists
   *   across the piece's life)
   * Both fields are optional and additive; existing canonical entries
   * are not breaking-changed by this addition. */
  original_persistence?: "low" | "medium" | "high";

  /** Forward-applicable optional field flagging that this canonical entry
   * captures alteration evidence rather than original-condition evidence
   * (D-PH3HCL-S1-N). When true, the entry's date_range and dating
   * implications refer to the alteration intervention, not to the
   * underlying piece's original manufacture. Forward-applicable across
   * canonical libraries; promoted from finish-local field design during
   * Block 0.5 Op A. */
  is_alteration_evidence?: boolean;

  /** Observation-discipline caution text (D-PH3HCL-S1-N AG1 lock). Used
   * for "do not classify X as Y" interpretive rules at observation time.
   * Structurally distinct from AntiClassificationGuidance (which captures
   * crisp-date back-classification boundaries with required boundary_date
   * + boundary_type). caution_text captures non-date-bounded observation
   * cautions. Forward-applicable across canonical libraries. */
  caution_text?: string;
}

/**
 * Captures structured anti-back-classification guidance for forms with crisp
 * date boundaries (form-emergence or form-extinction). Forms with revival-caution-only
 * narrative without crisp boundaries continue using regional_period_notes for guidance
 * rather than this structured field.
 *
 * Forms may have multiple boundaries (e.g., lowboy with form_emergence at 1720,
 * form_extinction at 1790 for core production, form_emergence at 1870 for active
 * revival, form_extinction at 1900 for active revival end). Multi-boundary forms
 * use the array form of FormEntry.anti_classification_guidance.
 *
 * Relocated from forms.ts to entryShape.ts in Block 16 to enable shared use
 * across forms and the wood identification domain (woodIdentification.ts).
 * The boundary_type union retains forms-language values; substrate adoption
 * and species furniture-use extinction semantically map to form_emergence and
 * form_extinction respectively without renaming.
 */
export interface AntiClassificationGuidance {
  /** Year of form-emergence or form-extinction boundary. Single year; narrative
   * softening of soft boundaries captured in guidance_text. */
  boundary_date: number;

  /** Type of boundary. form_emergence: pieces predating this boundary should be
   * classified as cousin forms (pre_boundary_classifications). form_extinction:
   * pieces postdating this boundary should be classified as cousin forms
   * (post_boundary_classifications), typically reproductions or later revivals. */
  boundary_type: "form_emergence" | "form_extinction";

  /** Narrative explanation for user-facing reports. Captures soft-boundary
   * language and engine-reasoning context. */
  guidance_text: string;

  /** Form ids likely correct for pieces predating a form_emergence boundary.
   * Engine uses these as classification suggestions for back-classified pieces. */
  pre_boundary_classifications?: string[];

  /** Form ids likely correct for pieces postdating a form_extinction boundary.
   * Engine uses these as classification suggestions (typically pointing to
   * reproduction/revival classifications). */
  post_boundary_classifications?: string[];

  /** Controls placement and emphasis in user-facing reports. prominent: surface
   * in primary form display (parallels distinguishing_features placement pattern
   * from lowboy and coffee_table). standard: surface in extended notes section. */
  prominence: "prominent" | "standard";
}

/**
 * Period-association evidence — pairs a human-authored period label with a
 * chronological window (date_floor required; date_ceiling optional, omitted
 * when the period extends to present). Sourced verbatim from canonical "Common
 * Time Periods" / chronological-breakdown content across reference documents.
 *
 * Shared cross-library artifact. Originally declared in woodIdentification.ts
 * (Block 18 wood species authoring); relocated to entryShape.ts per Block 27
 * D-MM27-2 as a shared canonical home. Parallel rationale to Block 16
 * AntiClassificationGuidance relocation: PeriodAssociation use across the wood
 * library (WoodSpeciesEntry, WoodSubspeciesEntry, EngineeredSubstrateEntry,
 * CutGrainPhenomenonEntry, and 4 woodEvidence.ts evidence interfaces) + maker
 * marks library (MakerMarkEntry per Block 27 D-MM27-4) + planned future
 * evidence libraries (joinery, fasteners, hardware, upholstery) satisfies the
 * schema-occurrence rule 3+ threshold for promotion to the shared canonical
 * home.
 *
 * The date_ceiling? omitted-means-present convention is durable across audit-log
 * generations and avoids the year drift that a fixed sentinel (e.g., 2026)
 * would introduce.
 */
export interface PeriodAssociation {
  /** Human-authored period label, e.g. "Golden Oak dominance",
   * "Mission/Arts & Crafts peak". Sourced verbatim from canonical "Common Time
   * Periods" or chronological-breakdown column content. */
  period_label: string;

  /** Earliest year the period applies. Required. */
  date_floor: number;

  /** Latest year the period applies. Optional; omitted means the period
   * extends to present. */
  date_ceiling?: number;

  /** Optional appraiser-voice notes. Omit unless adding value beyond
   * period_label. */
  usage_notes?: string;
}

/**
 * Style-association evidence — pairs a human-authored style label with an
 * optional chronological window (style emergence and extinction). Sourced
 * verbatim from canonical hardware/style reference documents.
 *
 * Shared cross-library artifact. Originally introduced Block 35 (hardware
 * library) per D-HW35-4 schema promotion. Used by HardwareTypeEntry NOW and
 * planned future libraries: Phase 2 Session 9 styleFamilies/design-aspects
 * layer (D-AP32-2 deferred-architectural commitment) + possibly upholstery
 * covers library (style-tied textile patterns). The schema-occurrence rule
 * fires at promotion: 1 use today + 2+ planned future uses across separate
 * libraries satisfies the 3+ occurrence threshold for shared entryShape.ts
 * canonical home.
 *
 * Parallel shape to PeriodAssociation: human-authored label + optional
 * date_floor + optional date_ceiling + optional usage_notes. date_floor
 * is OPTIONAL on StyleAssociation (unlike PeriodAssociation where date_floor
 * is required) because some style labels lack precise emergence years
 * (e.g., "Colonial Revival" emerges as a broad movement around 1880s but
 * no single canonical year). Hardware reference frequently surfaces style
 * labels without precise date boundaries.
 */
export interface StyleAssociation {
  /** Human-authored style label, e.g. "Federal", "Hepplewhite", "Eastlake",
   * "Mid-Century Modern". Sourced verbatim from canonical style reference
   * content. */
  style_label: string;

  /** Earliest year the style applies. Optional; omitted when canonical
   * source lacks a precise emergence year. */
  date_floor?: number;

  /** Latest year the style applies. Optional; omitted when the style
   * extends to present or canonical source lacks ceiling. */
  date_ceiling?: number;

  /** Optional appraiser-voice notes. Omit unless adding value beyond
   * style_label. */
  usage_notes?: string;
}

/**
 * Migration-target enum for reasoning-rule entries — flags eventual integration
 * point per the top-down revamp pattern: weighting_file (rules become weight
 * adjustments in the eventual weighting table); engine_reasoning (rules surface
 * in engine reasoning logic); report_layer (rules surface in report composition).
 * Enum-only per Block 22 D-WE22-4; specific target file paths tracked separately
 * when target files exist (file paths drift, semantic categories don't).
 *
 * Shared cross-library artifact. Originally declared in woodEvidence.ts (Block
 * 22 scaffold); relocated to entryShape.ts per Block 27 D-MM27-3 as shared
 * canonical home alongside PeriodAssociation. Used by WoodEvidenceReasoningRule
 * and MakerAttributionReasoningRule (Block 27) and any future reasoning-rule
 * library.
 */
export type ReasoningRuleMigrationTarget =
  | "weighting_file"
  | "engine_reasoning"
  | "report_layer";

/**
 * Physical location on the piece — WHERE on furniture an evidence observation
 * occurs. 34-value closed enum covering case construction (7), drawer construction
 * (5), frame and structural (4), surface and visible (3), base (3), movable
 * components (3), upholstery (6), and specialty (3) categories.
 *
 * Canonical-source tracing per Block 22.5 D-PA-5: each value cites which of the
 * five canonical evidence-layer sources surfaces that location (File A General
 * Wood Use; Fastener Reference; Furniture Hardware Identification System;
 * JOINERY IDENTIFICATION MASTER BREAKDOWN; American Furniture Textile Reference).
 *
 * D-WE22-8 / D-ES20-13 routing coverage gate satisfied: drawer_bottom, drawer_side,
 * case_interior_framing, underside, backboard all present.
 *
 * Granularity calibrated to canonical-source distinctions. Canonical specificity
 * beyond enum values (skirt-pleat-attachment, drawer-divider-mounting, etc.)
 * captured via PositionOnPiece.physical_location_notes? free-form supplement
 * per Block 22 D-WE22-1 precedent.
 */
export type PhysicalLocation =
  // Case construction (7)
  | "case_carcass"
  | "case_back"
  | "case_panel"
  | "case_corner"
  | "case_top"
  | "case_bottom"
  | "case_interior_framing"
  // Drawer construction (5)
  | "drawer_front"
  | "drawer_side"
  | "drawer_back"
  | "drawer_bottom"
  | "drawer_runner"
  // Frame and structural (4)
  | "frame_joint"
  | "frame_rail"
  | "frame_stile"
  | "structural_reinforcement"
  // Surface and visible (3)
  | "show_surface"
  | "trim_or_molding"
  | "edge_or_corner_protection"
  // Base (3)
  | "foot_or_leg"
  | "base_or_plinth"
  | "underside"
  // Movable components (3)
  | "door_panel"
  | "lid_or_top_movable"
  | "movable_hardware_attachment"
  // Upholstery (6)
  | "upholstery_seat"
  | "upholstery_back"
  | "upholstery_arm"
  | "upholstery_support_layer"
  | "upholstery_attachment_point"
  | "upholstery_dust_cover"
  // Specialty (3)
  | "veneer_face"
  | "veneer_backing"
  | "backboard";

/**
 * Structural/functional role of position — WHAT the position does. 10-value
 * closed enum per Block 22.5 D-PA-6. Three-tier coverage rationale: structural
 * integration tier (load_bearing vs assembly); visibility/access tier
 * (hidden_interior vs exposed_surface); functional category tier (decorative
 * vs movement vs security vs fabric_retention); plus escape hatch
 * (specialized_function).
 *
 * Canonical-source support: Fastener Reference structural-vs-decorative framing;
 * Hardware Reference Pull/Hinge/Lock/Caster functional categories; Joinery
 * Reference category descriptions; Textile Reference support-layer vs visible-
 * cover framing.
 *
 * Boundary with PhysicalLocation: physical_location names WHERE (e.g.,
 * "drawer_bottom"); functional_role names what role (e.g., "hidden_interior"
 * or "structural_assembly"). Never collapse into a single field per Block 22.5
 * D-PA-1 dimension-boundary lockwork.
 */
export type FunctionalRole =
  | "structural_load_bearing"
  | "structural_assembly"
  | "decorative_only"
  | "functional_non_structural"
  | "hidden_interior"
  | "exposed_surface"
  | "movement_assistance"
  | "security"
  | "fabric_retention"
  | "specialized_function";

/**
 * Provenance/originality of position evidence — WHY this position carries its
 * specific evidence weight. 8-value closed enum per Block 22.5 D-PA-7.
 *
 * Canonical-source support: Hardware Reference "Hardware is secondary
 * evidence... originality assessment is critical"; Fastener Reference
 * "Replacement Fastener Risk" + "Restoration Contamination"; Joinery Reference
 * "RESTORATION FALSE SIGNALS" + "Always determine: original joinery vs repair
 * joinery"; Textile Reference Core Rule (frame_construction vs original_upholstery
 * vs later_reupholstery temporal layers).
 *
 * factory_assembly_original vs site_assembly_original distinction handles modern
 * knock-down furniture per Fastener Reference Category 5 framing.
 * unknown_provenance required value for appraiser-honest discipline when
 * provenance is uncertain.
 */
export type PositionProvenance =
  | "original_to_construction"
  | "factory_assembly_original"
  | "site_assembly_original"
  | "upholstery_campaign_introduced"
  | "repair_introduced"
  | "restoration_introduced"
  | "replacement"
  | "unknown_provenance";

/**
 * Consistency pattern across the piece — HOW this position relates to similar
 * positions across the piece. 5-value closed enum per Block 22.5 D-PA-8.
 *
 * Canonical-source support: Fastener Reference "repeated consistently throughout
 * the piece" as strength signal; Hardware Reference "Mixed-period hardware sets"
 * as weak indicator; Joinery Reference "DO NOT DATE FROM ONE JOINT ALONE" +
 * multi-position joinery type cross-referencing; Textile Reference "A frame
 * with several generations of tack holes suggests repeated reupholstery."
 *
 * single_observation_no_pattern_assessment required value for appraiser-honest
 * discipline when sample is insufficient for consistency assessment.
 */
export type ConsistencyPattern =
  | "repeated_consistently_across_piece"
  | "isolated_example"
  | "mixed_period_set"
  | "partial_pattern"
  | "single_observation_no_pattern_assessment";

/**
 * Temporal layer when position evidence was established within the piece's
 * life — WHEN. 7-value closed enum per Block 22.5 D-PA-9. Anchored primarily
 * in Textile Reference Core Rule four-layer framing (frame_construction /
 * original_upholstery / later_reupholstery / current_visible_cover);
 * extensions cover repair, restoration, and replacement timing from Fastener
 * + Hardware + Joinery sources.
 *
 * Textile Reference Core Rule: "A chair frame may be 1880s, the springs may
 * be 1920s replacement, the foam may be 1970s, and the visible fabric may be
 * 2020s. The goal is to separate Frame date / Original upholstery system date
 * / Later reupholstery date / Current visible cover date."
 *
 * unknown_layer required value for appraiser-honest discipline when temporal
 * layer is uncertain.
 */
export type TemporalLayer =
  | "frame_construction"
  | "original_upholstery"
  | "later_reupholstery"
  | "current_visible_cover"
  | "repair_or_restoration"
  | "replacement_post_construction"
  | "unknown_layer";

/**
 * Position-on-piece annotation interface for evidence-layer entries.
 *
 * Six-dimensional position semantics consumed by evidence libraries across
 * wood, joinery, fasteners, hardware, and upholstery (covers + construction).
 * Captures where on a piece an evidence observation occurs, what the position's
 * structural role is, when in the piece's life the evidence was established,
 * and how the position relates to similar positions across the piece.
 * Convergent across all 5 canonical evidence-layer source documents (File A
 * General Wood Use in Furniture; Fastener_Reference; Furniture_Hardware_Identification_System;
 * JOINERY_IDENTIFICATION_MASTER_BREAKDOWN; American_Furniture_Textile_Reference).
 *
 * Consumed by evidence entries via optional `position_on_piece?: PositionOnPiece[]`
 * field; array shape supports multiple positions per entry. Block 22.5 declares
 * this interface; Block 23+ adds consumption to woodEvidence.ts evidence entries
 * per Block 22 D-WE22-8 deferral. Future evidence libraries (fastenerEvidence.ts,
 * hardwareEvidence.ts, joineryEvidence.ts, textileEvidence.ts) consume the same
 * interface at their respective foundation-block time.
 *
 * Cross-source canonical foundation: every evidence-layer source document
 * carries a "this layer alone never dates furniture" caveat in its own words
 * (Wood File A "Wood alone should NEVER date furniture"; Fastener Reference
 * "Fasteners must always be evaluated alongside construction methods, tool
 * marks..."; Hardware Reference "Hardware is secondary evidence, not primary
 * dating evidence"; Joinery Reference "DO NOT DATE FROM ONE JOINT ALONE";
 * Textile Reference "For dating, do not let fabric style alone control the
 * conclusion"). Five independent sources, fully convergent on the Independent
 * Layer Evaluation Standard (Session 9 Block 21 D-CG21-2/D-CG21-17).
 * PositionOnPiece serves the within-layer position semantics that each
 * evidence layer carries; the Standard governs cross-layer integration where
 * position-evaluated evidence converges.
 *
 * Dimension boundary semantics:
 * - physical_location = WHERE on the piece (required dimension; every position
 *   has a location).
 * - functional_role = WHAT structural role the position plays (load-bearing
 *   vs hidden_interior vs decorative_only).
 * - provenance = WHY this position carries its specific evidence weight
 *   (original vs replacement vs repair-introduced).
 * - position_context_evidence = PROSE observations specifically about the
 *   position (shadow consistency, ghost holes, finish continuity AT this
 *   position). Distinct from diagnostic_caution_text on evidence entries
 *   (Block 22 D-WE22-10) which captures appraiser-knowledge framing about
 *   the entity in general unrelated to specific position.
 * - consistency_pattern = HOW this position relates to similar positions
 *   across the piece (repeated, isolated, mixed-period set).
 * - temporal_layer = WHEN this position evidence was established within the
 *   piece's life (frame construction, original upholstery, later reupholstery,
 *   current visible cover, repair/restoration, post-construction replacement).
 *
 * The physical_location vs functional_role boundary is the slipperier pair:
 * "drawer_bottom" is a physical_location value; the functional_role for
 * evidence at that location is typically "hidden_interior" or
 * "structural_assembly," authored as a separate field. Authoring discipline:
 * physical_location names WHERE; functional_role names what role; never
 * collapse into a single field.
 */
export interface PositionOnPiece {
  /** Required: physical location on the piece. */
  physical_location: PhysicalLocation;

  /**
   * Optional free-form supplement for canonical-source specificity beyond
   * enum values (e.g., "skirt pleat attachment", "drawer divider mounting",
   * "Federal-era inlay banding edge"). Per Block 22 D-WE22-1 precedent
   * (regional enum + region_notes pattern).
   */
  physical_location_notes?: string;

  /** Optional: structural/functional role of position. */
  functional_role?: FunctionalRole;

  /** Optional: provenance/originality of position evidence. */
  provenance?: PositionProvenance;

  /**
   * Optional: prose canonical observations specifically about the position.
   * Examples: "Hardware shadow consistency with surrounding finish";
   * "Mounting hole ghost evidence at original location"; "Tack-line spacing
   * irregularity consistent with hand-tack work"; "Lock mortise oxidation
   * continuity with surrounding wood." Distinct from diagnostic_caution_text
   * on evidence entries (Block 22 D-WE22-10) which captures entity-general
   * appraiser knowledge.
   */
  position_context_evidence?: string[];

  /** Optional: how this position relates to similar positions on the piece. */
  consistency_pattern?: ConsistencyPattern;

  /** Optional: temporal layer when this position evidence was established. */
  temporal_layer?: TemporalLayer;

  /** Optional free-form notes for additional context not captured by above fields. */
  notes?: string;
}
