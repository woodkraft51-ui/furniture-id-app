import { CanonicalEntry } from "./entryShape";

/**
 * Family is the second level of the form taxonomy. It groups forms by
 * function and use context within a construction logic. Family describes
 * what kind of furniture this is in human use; construction logic
 * describes how it is built. The two are orthogonal but related.
 *
 * Each form belongs to exactly one family.
 */
export interface FamilyEntry extends CanonicalEntry {
  category: "family";
  name: string;

  /**
   * Reference to the construction logic this family belongs under.
   */
  construction_logic_id: string;

  /**
   * Description of what defines this family in human use — function,
   * placement, social context. Distinct from construction_logic which
   * describes how furniture in this family is built.
   */
  description: string;

  /**
   * Family-level characteristics shared across forms within this family.
   * Used for engine reasoning when evidence supports family identification
   * but not yet form-level identification.
   */
  family_characteristics?: string[];
}

export const FAMILIES: FamilyEntry[] = [];
