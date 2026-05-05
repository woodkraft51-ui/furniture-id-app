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

export const SPATIAL_BEHAVIORS: SpatialBehaviorEntry[] = [];
