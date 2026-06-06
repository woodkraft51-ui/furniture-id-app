# Real-world test pass — June 2026 (live public-URL scans)

> Owner runs unseen pieces through the deployed engine (`main`); pastes the full
> Engine Trace + ground-truth. I log each here (no fixing — triage after the full
> batch). Provisional flag is my read; owner's ground-truth is the answer key.
> Corpus fixtures ingested in batches of 5.

Engine under test: `main` @ `bf5d445` (Deploy 010).

| # | Piece (owner ground-truth) | Engine verdict | Date | Flag | Mechanism / note |
|---|---|---|---|---|---|
| 01 | Convertible child's **high chair → toddler desk** (folds down) | **Telephone bench / writing bench combination** (`form_telephone_stand`, subtype "telephone cabinet" conf 1.0) | c. 1900–1935, Mod | 🔴 wrong form | see below |
| 02 | **Trifold dressing-table mirror** (Globe Bosse; "JAN 22 1924" ink stamp) | **GLOBE BOSSE WORLD FURNITURE CO Dressing table** | c. 1840–1940 (date conf Low) | 🟡 date too broad | hard 1924 stamp demoted to floor → 100-yr range; form acceptable. see below |
| 03 | **Lyon & Healy parlor reed/pump organ** (Victorian, Chicago) | **Late Victorian Cottage Eastlake Afterwave Upholstered seating** | c. 1880–1990, Mod | 🔴 wrong form + date | organ → "upholstered seating"; felt pedal-covers read as upholstery; plywood *repair patch* dated the piece. see below |

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

---

## Scan 02 — Globe Bosse trifold dressing-table mirror

**Engine:** GLOBE BOSSE WORLD FURNITURE CO Dressing table · c. 1840–1940 (High overall, date conf Low) · resale $111–265.
**Actually:** the standalone trifold dressing-table mirror (mirror superstructure only — the wings + crest that sit atop a vanity case).

**Form is acceptable; the deviation is DATE (M9 / date-prose wire).** P0 itself read the piece correctly — `dressing_table_form`: "the mirror superstructure component of a dressing table / vanity… Not a standalone dresser_form but the mirror element associated with one." With no separate `form_vanity_mirror` in canonical, routing to **Dressing table** is the right neighbor and surfaces the maker cleanly. No complaint there.

**The miss:** the back is ink-stamped **"JAN 22 1924"**, and P0 captured it as a hard anchor — `visible_text`: *"'Jan 22 1924' is the specific production date stamp — an unusually precise date record providing a hard anchor for manufacture."* The engine then printed **c. 1840–1940** — a 100-year range — on a piece that tells you its own birthday to the day.

**Mechanism — the textbook reframe.** The dating layer demoted the stamp to a *terminus post quem* (floor only): P2 says *"The label's 1924 label date is a terminus post quem… applied as a floor only — not as the production date."* That's the correct, conservative rule for a **maker's-operating-span** label (Stickley operated 1900–1916 → floor). But this isn't an operating span; it's a **dated production stamp**. The distinction lives in the observation prose ("specific production date," "to the day") — and the engine reads only the thin metadata slice ("it's a label → treat as floor"), throwing the prose away. Exact reframe pattern, date edition: the answer is in P0's own words; consumption is too narrow to use it.

Result: floor 1924 is right, but the ceiling free-floats to 1940 (Phillips-screw cutoff territory) and the convergence zone reports 1840–1940 because joinery/fastener/hardware are all open-ended. A dated stamp should **collapse the range to the stamp year** (± a small finishing window), not just raise the floor.

**Proposed fix (post-batch triage, NOT now) — date-prose wire, M9 family:**
- Detect a *dated production stamp* in label prose (a specific month/day/year, or "production/manufacture date" language) and treat it as a **point anchor** (both floor AND ceiling ≈ stamp year), at higher confidence — distinct from the maker-operating-span case which stays floor-only. This is the next instantiation of the maker-wire template (`resolveMakerAttribution`), applied to dates.

**Resale note:** a bare trifold vanity mirror (no case) is a slow, low-value item — $111–265 retail is optimistic; realistically a $20–40 flip, better as a paired-up "complete the vanity" piece or a craft/refinish resale. Not a priority flip.

---

## Scan 03 — Lyon & Healy parlor reed organ

**Engine:** Late Victorian Cottage Eastlake Afterwave Upholstered seating · c. 1880–1990 (Moderate) · resale $156–346.
**Actually:** a Victorian **parlor pump/reed organ** by Lyon & Healy (Chicago) — a musical instrument, not seating.

**Surface verdict is the worst-looking of the batch (organ → "upholstered seating", 110-yr range). But every cause is a gap we've ALREADY named — and P0 read the piece perfectly.** This is not a regression: nothing in Deploys 007–010 touches this code path (organ forms, the upholstery detector, or plywood dating). It would have failed identically before this session. It's a new *category* (musical instrument — outside the American-furniture scope) surfacing the same diseases on a new face.

**P0 nailed perception.** It captured `reed_organ_form`, `bellows_pedals`, `organ_stop_knobs`, `multi_stop_reed_organ`, and the `Lyon & Healy / Chicago, Ill` maker label. The engine *knows* it's a reed organ. The intelligence is present; consumption throws it away. Textbook reframe.

**Four layered mechanisms, all known:**
1. **#22 taxonomy gap (form).** No `form_reed_organ` / `form_parlor_organ` / instrument family in canonical. The organ clue keys don't route anywhere, so form fell to the nearest neighbor with a hit. Same family as scan 01 (high chair).
2. **Affirmation gap (upholstery).** `fully_upholstered` fired on **"green fabric/felt pedal covers"** — felt pedal pads, not an upholstered seat. That single mis-affirmed clue (+ `spindle_back`/`spindle_gallery` from the organ's spindle gallery rail) is what produced **Upholstered seating**. Presence, not affirmation, exactly like the telephone bench in scan 01.
3. **Reframe / date by a REPAIR (the headline date miss).** `plywood_structural` was consumed as an original-construction hard-negative dating signal → clamped the floor and pushed the ceiling toward postwar. But P0's own prose says it is **"a later repair or replacement panel rather than original construction."** The engine read the thin slice ("plywood present → 1905–1930+/postwar") and discarded the word "repair." A repair patch dated the whole instrument. Date-prose wire, inverse of scan 02 (there the prose said *trust me more*; here it says *ignore me* — both ignored).
4. **Style-wave overreach → 1990 ceiling.** The revival-wave layer ("Late Victorian Cottage Eastlake Afterwave") stretched the ceiling to 1990 (style_wave layer reported 1870–1990 across 5 waves). This is the **style-prose frontier (M11)** already parked as the next big wire.

**Maker handled correctly** — Lyon & Healy captured and surfaced. The maker wire works.

**Proposed fixes (post-batch triage, NOT now):**
- (a) Decide scope: author an `instrument`/`reed_organ` form family, OR have out-of-scope categories say so rather than forcing a furniture form. (Step C "wrong-but-real form" Tier-2 again — same as scan 01.)
- (b) Upholstery affirmation guard: `fully_upholstered` must affirm an actual seat/cushion, not felt pads / pedal covers.
- (c) Date-prose wire: a clue flagged in prose as a **repair / replacement / later** must not contribute to original-construction dating. High-value, recurs.
- (d) Style-wave ceiling discipline (M11 frontier).

**Convergence across scans 01–03:** these are not three problems. They are **one** problem — "the answer is in P0's prose; consumption is too narrow to use it" — wearing three masks (taxonomy gap, affirmation gap, prose-discarded dating). The fix pattern (the maker-wire template) is already prototyped. That is good news, not bad.
