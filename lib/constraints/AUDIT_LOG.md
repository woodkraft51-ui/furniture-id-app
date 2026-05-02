# Constraint Library Audit Log

This file records every appraiser decision made during Phase 2 constraint library reconciliation. Each entry documents:

- The library and entry affected
- The disagreement or open question encountered
- The canonical decision made
- Brief rationale
- Date and session

## Format

### [Date] — Session N — [Library] — [Entry ID]

**Disagreement / question:** [What surfaced]

**Sources / context:** [Where the disagreement originated]

**Canonical decision:** [What got committed]

**Rationale:** [Brief appraiser reasoning]

---

## Entries

### 2026-05-02 — Session 1 — makerMarks.ts — roos_sweetheart_label

**Disagreement / question:** Engine.ts contained a hardcoded short-circuit for Roos returning "c. 1940–1960" with confidence "High". This date range was authored by a previous collaborator and is not consistent with the Sweetheart label era (1920s-1930s production).

**Sources / context:** Photographic evidence provided by the appraiser — showing the heart-and-sweetheart graphic alongside "Genuine Sweetheart Cedar Chest" text and the Ed Roos Company / Forest Park, IL markings — is the concrete anchor for this Sweetheart-era entry. The broader Roos production timeline (1916–1955, multiple distinct label variants spanning Roos Mfg. Co. Chicago, pre-Sweetheart Ed Roos Company, the tree symbol, and post-1940 labels) is appraiser narrative knowledge subject to ongoing research and will inform later canonical entries.

**Canonical decision:** Created `roos_sweetheart_label` entry with date_range "1920–1939", dating_authority "high". The hardcoded engine.ts short-circuit will be removed in Phase 3 cleanup per synthesis Section 12.3 ("Remove inline maker-mark hardcoded matches").

**Rationale:** Photo confirms label text and visual design. Date range follows appraiser timeline for Sweetheart-era production. Other Roos label variants (Roos Mfg. Co. Chicago, Ed Roos Company pre-Sweetheart, tree symbol, post-1940 labels) are not yet canonical pending appraiser research and will be added during Session 6.

---
