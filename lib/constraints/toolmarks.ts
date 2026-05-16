/**
 * lib/constraints/toolmarks.ts
 *
 * Canonical toolmark evidence library — production-surface evidence
 * left by the method used to reduce timber or boards before final
 * assembly. Saw marks, plane marks, scrape marks, abrasion marks.
 *
 * Created Block 0.5a (D-PH3HCL-S1-N) per Path A schema foundation.
 * Block 0.5a creates the empty library shell with locked interfaces;
 * Block 0.5b populates the categories + types from Mike's authored
 * content.
 *
 * Phase 2 reopening rationale: toolmarks library identified as a real
 * Phase 2 gap during Block 0 HCL/evidence.ts orphan inspection. HCL
 * contained 4 toolmark keys (circular_saw_arcs, pit_saw_marks,
 * band_saw_lines, hand_plane_chatter) that had no canonical home in
 * the existing Phase 2 libraries. Block 0.5b authors these as
 * canonical type entries.
 */

import type {
  CanonicalEntry,
  PeriodAssociation,
  PhysicalLocation,
  PositionOnPiece,
  AntiClassificationGuidance,
  ReasoningRuleMigrationTarget,
} from "./entryShape";

export interface ToolmarkCategoryEntry extends CanonicalEntry {
  category: "toolmark_category";
  name: string;
  description: string;
  date_range_summary: string;
  category_kind: "saw_marks" | "plane_marks" | "scrape_marks" | "abrasion_marks";
}

export interface ToolmarkTypeEntry extends CanonicalEntry {
  category: "toolmark_type";
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
  hand_vs_machine_classification?: "strongly_early" | "strongly_industrial" | "transitional" | "spans_eras";
  regional_persistence_notes?: string;
  related_joinery_types?: string[];
  related_fastener_types?: string[];
  assessment_layer: "frame";
}

export interface ToolmarkReasoningRule extends CanonicalEntry {
  category: "toolmark_reasoning_rule";
  rule_name: string;
  rule_statement: string;
  rationale: string;
  migration_target: ReasoningRuleMigrationTarget;
  applies_to_entry_types?: string[];
  cross_layer_scope?: boolean;
}

export const TOOLMARK_ASSESSMENT_LAYER = "frame" as const;

export const TOOLMARK_CATEGORIES: ToolmarkCategoryEntry[] = [];
export const TOOLMARK_TYPES: ToolmarkTypeEntry[] = [];
export const TOOLMARK_REASONING_RULES: ToolmarkReasoningRule[] = [];
