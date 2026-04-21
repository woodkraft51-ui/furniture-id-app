// store.ts
const caseStore: any = {};
let caseCounter = 1000;
let obsCounter = 0;

export const API = {
  createCase(data: any) {
    const id = `case-${++caseCounter}`;

    caseStore[id] = {
      id,
      status: "new",
      notes_from_user: data.notes || "",
      images: [],
      observations: [],
      stage_outputs: {},
      analysis_mode: "full_analysis",
    };

    return { case_id: id };
  },

  addImage(caseId: string, img: any) {
    caseStore[caseId].images.push({
      id: `img-${Date.now()}-${Math.random()}`,
      ...img,
    });
  },

  addObservation(caseId: string, obs: any) {
    const entry = {
      id: `obs-${++obsCounter}`,
      ...obs,
      created_at: new Date().toISOString(),
    };

    caseStore[caseId].observations.push(entry);
    return entry;
  },

  getObservations(caseId: string) {
    return caseStore[caseId].observations;
  },

  async analyzeCase(caseId: string, intake: any, onPhase?: any) {
    const c = caseStore[caseId];
    c.status = "analyzing";

    const mode =
      intake?.analysis_mode === "field_scan" ? "field_scan" : "full_analysis";

    let result;

    if (mode === "field_scan") {
      result = await (await import("./fieldScan")).FieldScan.run(
        c,
        c.images,
        intake,
        onPhase
      );
    } else {
      result = await (await import("./engine")).PE.runAllPhases(
        c,
        c.images,
        intake,
        onPhase
      );
    }

    c.stage_outputs = result.stage_outputs;
    c.final_report = result.final_report;
    c.analysis_mode = mode;
    c.status = "complete";

    return { case_id: caseId };
  },

  getReport(caseId: string) {
    return caseStore[caseId];
  },
};
