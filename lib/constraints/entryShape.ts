/**
 * Canonical entry shape for all Proof Sleuth constraint libraries.
 *
 * Per Section 6.1 of the architectural synthesis. All constraint library
 * entries must conform to this interface or extend it. Library-specific
 * fields may be added by extending this interface.
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
