import { PE } from "./engine";

export type FieldScanResult = {
  mode: "field_scan";
  stage_outputs: Record<string, any>;
  evidence_digest?: any;
  observations?: any[];
  final_report?: string;
  field_scan?: {
    identification?: string;
    confidence?: string;
    date_range?: string;
    valueRange?: string;
    recommendation?: string;
    recommendation_display?: string;
    recommendation_reasoning?: string;
  };
};

export const FieldScan = {
  async run(caseData: any, images: any[], intake: any, onPhase?: any): Promise<FieldScanResult> {
    const result = await PE.runAllPhases(
      caseData,
      images,
      {
        ...(intake || {}),
        analysis_mode: "field_scan",
      },
      onPhase
    );

    return {
      mode: "field_scan",
      stage_outputs: result.stage_outputs || {},
      evidence_digest: result.evidence_digest,
      observations: result.observations || [],
      final_report: result.final_report,
      field_scan: result.field_scan,
    };
  },
};

export async function runFieldScan(caseData: any, images: any[], intake: any, onPhase?: any) {
  return FieldScan.run(caseData, images, intake, onPhase);
}
