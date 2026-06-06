# Real-world test pass — June 2026 (live public-URL scans)

> Owner runs unseen pieces through the deployed engine (`main`); pastes the full
> Engine Trace + ground-truth. I log each here (no fixing — triage after the full
> batch). Provisional flag is my read; owner's ground-truth is the answer key.
> Corpus fixtures ingested in batches of 5.

Engine under test: `main` @ `bf5d445` (Deploy 010).

| # | Piece (owner ground-truth) | Engine verdict | Date | Flag | Mechanism / note |
|---|---|---|---|---|---|
| 01 | Convertible child's **high chair → toddler desk** (folds down) | **Telephone bench / writing bench combination** (`form_telephone_stand`, subtype "telephone cabinet" conf 1.0) | c. 1900–1935, Mod | 🔴 wrong form | see below |

---

## Scan 01 — convertible high chair / desk

**Engine:** Telephone bench / writing bench combination · c. 1900–1935 (Moderate) · resale $138–324.
**Actually:** a convertible children's high chair that folds into a toddler desk.

**Deviation = form (M8). Date is actually fine** (slotted screws + reeded legs → early-to-mid 20th c. is reasonable). Three layered mechanisms:

1. **#22 taxonomy gap.** There is no `form_high_chair` / `form_convertible_high_chair` / child's-furniture form in canonical. With nowhere correct to route, it fell to the nearest seating-plus-writing-surface neighbor — the telephone/writing bench.
2. **Affirmation gap (telephone bench).** It routed `form_telephone_stand` on `seating_surface` + `writing_surface` with **zero telephone evidence** — no phone shelf, no directory compartment, no telephone clue. Presence, not affirmation: "a seat + a writing surface" ≠ a telephone bench. Same root we've been chasing.
3. **Step C relevance — the HARD variant.** The engine didn't go blank; it confidently picked a *wrong but real* form (`form_telephone_stand` has a `form_id`). The *safe* Step C (gate on `form_id === null`) we found is a no-op here — it only catches truly formless results. This is the Tier-2 "wrong-but-real form" case we explicitly deferred.

**Proposed fixes (for post-batch triage, NOT now):**
- (a) Author `form_high_chair` + convertible high-chair-desk subtype (the proper fix — makes it *right*, not just uncertain). #22 family.
- (b) Telephone-bench **affirmation guard**: require actual telephone evidence (phone shelf / directory / telephone) before routing telephone bench — stops it grabbing any seat-with-a-surface.
