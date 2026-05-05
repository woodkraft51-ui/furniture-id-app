import { CanonicalEntry } from "./entryShape";

/**
 * Construction Logic is the highest level of the form taxonomy. It groups
 * furniture by the fundamental construction approach used to build it.
 * Four logics span the American antique furniture domain:
 *   I.   Case Construction (rigid carcass, enclosed storage)
 *   II.  Frame Construction (post-and-rail seating)
 *   III. Surface Forms (tables, work surfaces)
 *   IV.  Mechanical / Integrated Systems (pieces with embedded machinery
 *        or coordinated functional systems)
 *
 * Each form belongs to exactly one construction logic.
 */
export interface ConstructionLogicEntry extends CanonicalEntry {
  category: "construction_logic";
  name: string;

  /**
   * Roman numeral identifier per appraiser taxonomy (I, II, III, IV).
   * Provided as semantic anchor; schema reasoning uses id field.
   */
  ordinal: "I" | "II" | "III" | "IV";

  /**
   * Description of the construction approach that defines this taxonomic
   * root. Informs engine reasoning about which dating clues, joinery
   * patterns, and dimensional ranges apply.
   */
  description: string;

  /**
   * Construction characteristics common to all furniture in this logic
   * group. Used for engine reasoning when construction-evidence dating
   * applies broadly across the logic group rather than to specific forms.
   */
  shared_construction_characteristics?: string[];
}

export const CONSTRUCTION_LOGIC: ConstructionLogicEntry[] = [];
