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
