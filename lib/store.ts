// store.ts
const caseStore: any = {};
let caseCounter = 1000;
let obsCounter = 0;

export const API = {
  // ===============================
  // CREATE CASE
  // ===============================
  createCase(data: any) {
    const id = `case-${++caseCounter}`;

    caseStore[id] = {
      id,
      status: "new",
      notes_from_user: data.notes || "",
      images: [],
      observations: [],
      stage_outputs: {},
    };

    return { case_id: id };
  },

  // ===============================
  // ADD IMAGE
  // ===============================
  addImage(caseId: string, img: any) {
    caseStore[caseId].images.push({
      id: `img-${Date.now()}`,
      ...img,
    });
  },

  // ===============================
  // APPEND-ONLY OBSERVATIONS
  // ===============================
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

  // ===============================
  // ANALYZE
  // ===============================
  async analyzeCase(caseId: string, intake: any, onPhase?: any) {
    const c = caseStore[caseId];
    c.status = "analyzing";

    const result = await (await import("./engine")).PE.runAllPhases(
      c,
      c.images,
      intake,
      onPhase
    );

    c.stage_outputs = result.stage_outputs;
    c.final_report = result.final_report;
    c.status = "complete";

    return { case_id: caseId };
  },

  // ===============================
  // REPORT
  // ===============================
  getReport(caseId: string) {
    return caseStore[caseId];
  },
};
