// store.ts
import { saveCase, getCase, listCases, deleteCase } from "./persistence";

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

    c.analysis_mode = mode;

    const result = await (await import("./engine")).PE.runAllPhases(
      c,
      c.images,
      intake,
      onPhase
    );

    c.stage_outputs = result.stage_outputs || {};
c.final_report = result.final_report || "";
c.evidence_digest = result.evidence_digest || null;
c.observations = result.observations || c.observations || [];
c.field_scan = result.field_scan || null;
c.status = "complete";

    // Persistence Stage 1: write-through to IndexedDB on scan completion
    // so cases survive page reloads / tab close. Failure is silent
    // (logged via console.warn in persistence layer); the analysis
    // result is still returned to the caller. Stage 2 builds the My
    // Scans browser UI on top of these persisted records.
    saveCase(c).catch(() => {
      // saveCase already catches internally; this is a defensive no-op
      // for promise rejection edge cases.
    });

    return { case_id: caseId };
  },

  getReport(caseId: string) {
    return caseStore[caseId];
  },

  // ─── Persistence-backed read/write API (Stage 1) ───────────────────
  // These methods read from / write to IndexedDB. The in-memory
  // caseStore above is the working set for the active session;
  // these methods expose the persisted history layer for the future
  // My Scans browser UI (Stage 2).

  /** List all persisted cases across sessions. Returns empty if
   *  IndexedDB is unavailable. */
  async listSavedCases() {
    return listCases();
  },

  /** Load a persisted case by id and hydrate it into the in-memory
   *  caseStore so subsequent calls (getReport, getObservations) work
   *  against it as if the case had just been created in this session.
   *  Returns the loaded case or null if not found. */
  async loadSavedCase(id: string) {
    const c = await getCase(id);
    if (c) {
      caseStore[c.id] = c;
    }
    return c;
  },

  /** Delete a persisted case. Removes from both IndexedDB and the
   *  in-memory caseStore. Returns true on success. */
  async deleteSavedCase(id: string) {
    delete caseStore[id];
    return deleteCase(id);
  },
};
