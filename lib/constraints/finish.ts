/**
 * lib/constraints/finish.ts
 *
 * Canonical finish evidence library — surface-finish dating signals
 * (shellac crazing, polyurethane films, oil patina, refinished
 * surfaces). Includes natural finishes, synthetic finishes, and
 * alteration-evidence finishes.
 *
 * Created Block 0.5a (D-PH3HCL-S1-N) per Path A schema foundation.
 * Block 0.5a creates the empty library shell with locked interfaces;
 * Block 0.5b populates the categories + types from Mike's authored
 * content.
 *
 * Phase 2 reopening rationale: finish library identified as a real
 * Phase 2 gap during Block 0 HCL/evidence.ts orphan inspection. HCL
 * contained 2 finish keys (shellac_crazing, polyurethane); CWT
 * surfaced 3 additional keys (shellac_intact, oil_finish_patina,
 * refinished_surface). Block 0.5b authors all 5 as canonical type
 * entries.
 *
 * Note: is_alteration_evidence? is inherited from CanonicalEntry
 * (Block 0.5a Op B-1 promotion); no inline declaration needed.
 */

import type {
  CanonicalEntry,
  PeriodAssociation,
  PhysicalLocation,
  PositionOnPiece,
  AntiClassificationGuidance,
  ReasoningRuleMigrationTarget,
} from "./entryShape";

export interface FinishCategoryEntry extends CanonicalEntry {
  category: "finish_category";
  name: string;
  description: string;
  date_range_summary: string;
  category_kind: "natural_finish" | "synthetic_finish" | "alteration_finish";
}

export interface FinishTypeEntry extends CanonicalEntry {
  category: "finish_type";
  name: string;
  parent_category_id: string;
  description: string;
  unique_traits: string[];
  identifying_characteristics: string[];
  period_associations: PeriodAssociation[];
  date_range_summary: string;
  common_observed_locations?: PhysicalLocation[];
  position_on_piece?: PositionOnPiece[];
  anti_classification_guidance?: AntiClassificationGuidance | AntiClassificationGuidance[];
  replacement_likelihood: "low" | "medium" | "high";
  finish_chemistry?: "shellac" | "polyurethane" | "lacquer" | "varnish" | "oil" | "wax" | "milk_paint" | "other";
  regional_persistence_notes?: string;
  related_finish_types?: string[];
  assessment_layer: "frame";
}

export interface FinishReasoningRule extends CanonicalEntry {
  category: "finish_reasoning_rule";
  rule_name: string;
  rule_statement: string;
  rationale: string;
  migration_target: ReasoningRuleMigrationTarget;
  applies_to_entry_types?: string[];
  cross_layer_scope?: boolean;
}

export const FINISH_ASSESSMENT_LAYER = "frame" as const;

export const FINISH_CATEGORIES: FinishCategoryEntry[] = [];
export const FINISH_TYPES: FinishTypeEntry[] = [];
export const FINISH_REASONING_RULES: FinishReasoningRule[] = [];
