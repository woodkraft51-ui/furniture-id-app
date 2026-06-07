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
| 04 | **Colonial/Empire Revival chest of drawers / dresser** (two-section, bow-front, c. 1920–40) | **Colonial Revival Telephone bench / writing bench combination** (`form_telephone_stand`) | post-1939, Mod | 🔴 wrong form (+odd date) | **telephone-bench bug, 2nd sighting** (cf. scan 01); phantom `seating_surface`/`seating_present` (M0) on a dresser; "post-1939" off a label that isn't there. see below |
| 05 | **Renaissance Revival dressing table / vanity** (part of a 3-pc bedroom suite: vanity + dresser + full bed) | **Italian Renaissance / Neo-Renaissance Revival Dressing table** | c. 1920–1925, High | 🟢 form right / 🟡 date by style | **form CORRECT** (kneehole→vanity). Date driven *purely* by a style-revival-wave, sidelining the hardware layer. see below |
| 06 | **Wooden full bed** (Colonial Revival, the suite-mate of scan 05; "no rails") | **Colonial Revival Iron bed frame** (`form_iron_bed`) | **post-1989**, High | 🔴 wrong form + 🔴🔴 date catastrophe | wooden bed → "iron bed" (clue-key `metal_bed_frame` over prose "WOODEN…with metal side rails"); a **chalk mover's scrawl "1989"** became a hard date floor → "post-1989" on a c.1920 antique. see below |
| 07 | **Victorian spring platform rocker** (Golden Oak, c. 1875–1910) — owner: "authored platform-rocker dating is being ignored" | **Rocking chair**, American Empire / late Classical Revival | **c. 1935 onward**, High (date conf Low) | 🟢 form ok / 🔴🔴 date | **owner is right.** Date floor 1935 comes from `bent_molded_plywood` — a clue P0 **explicitly negated** ("NOT molded plywood… 19th-c steam-bent"). Meanwhile the defining `concentric_ring_spring_mounts` (conf 95, "Victorian c.1875–1910") sits "present but undated." see below |
| 08 | **Melodeon / square piano** (keyboard instrument, trestle-lyre base; tag reads "Melodeon"; **no bellows, no treadles, no reed stops**) | **Pump organ cabinet** (`form_pump_organ_cabinet`) | c. 1870–1900, Mod | 🟡 form routed without affirmation | **mirror of scan 03.** Routed pump-organ on generic keyboard-cabinet signals with **none** of the defining pump-organ evidence present. Date fine. Owner's point: absence of reeds/bellows should *disqualify*. see below |

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

---

## Scan 04 — Colonial/Empire Revival chest of drawers

**Engine:** Colonial Revival Telephone bench / writing bench combination (`form_telephone_stand`, subtype "telephone cabinet" conf 1.0) · post-1939 (Moderate) · resale $127–297.
**Actually:** a two-section bow-front **chest of drawers / dresser**, American factory Colonial/Empire Revival, c. 1920–1940. ~5 drawers, no seat, no phone shelf.

**The telephone-bench bug, second sighting — and this time on a core in-scope form.** This is the single most important data point in the batch so far, because it converts scan 01 from "a one-off on an out-of-scope kids' piece" into a **repeatable routing defect** (n=2) that strikes a bread-and-butter dresser. That promotes it past the n≥3-ish bar as a clear #1 fix target.

**P0 got it right — the engine overrode it.** Top form clue was `chest_of_drawers_form` at weight **0.92**, and "Chest of drawers / dresser" was the explicit runner-up form. The correct answer was sitting at the top of the list. The router still chose `form_telephone_stand`. Three mechanisms stack:

1. **M0 perception over-emission (phantom seating).** P0 emitted `seating_surface` (conf 82, "a seating surface or bench-like sitting area is visible") and `seating_present` (conf 78, "integrated seating is visible") on a piece that has **no seat at all**. Also likely-spurious `door_present` / `cabinet_form`. These hallucinated clues are the fuel.
2. **Affirmation gap (telephone bench) — REPEAT of scan 01.** `form_telephone_stand` routes on seating-surface + a secondary/writing surface with **zero telephone evidence** (no phone shelf, no directory). The phantom `seating_surface` + `secondary_surface` is exactly the pattern it grabs. Same root, now twice.
3. **Routing override.** Telephone-stand out-scored `chest_of_drawers_form` (0.92) despite the dresser clue being heavier — the affirmation gate doesn't cover this route, so phantom seating wins.

**Date is also off, separately:** displayed **"post-1939"** while the convergence zone is 1830–1940 and every real signal says c. 1910–1940. P2 cites *"The label's 1939 label date is a terminus post quem"* — **but there is no maker label in this scan** (no `maker_label` clue anywhere). A phantom 1939 terminus is clamping the floor above the actual evidence. Looks like a templated/stale terminus line, not a real anchor. Flag for triage — possibly a `form_telephone_stand` date attribute or a terminus-template bug. (Note: contrast with scan 02, where a *real* dated stamp was under-used — here a *non-existent* one is over-used.)

**Proposed fixes (post-batch triage, NOT now):**
- (a) **Telephone-bench affirmation guard** (now the batch's top priority, n=2): require actual telephone evidence before routing telephone bench; never let a seating-surface clue alone (esp. a phantom one) carry it.
- (b) **M0 phantom-seating** investigation: why does P0 emit `seating_present` on a drawer case? May need a perception guard or a consumption-side sanity check (seating clues with zero seat-form corroboration).
- (c) Phantom "1939 label" terminus: trace where the floor 1939 originates with no label clue present.

**Telephone-bench tally so far: scans 01 + 04. This is the fix that will move the most real-world cases.**

---

## Scan 05 — Renaissance Revival dressing table (part of a bedroom suite)

**Engine:** Italian Renaissance / Neo-Renaissance Revival Dressing table · c. 1920–1925 (High overall, date conf Moderate) · resale $111–285.
**Actually:** a Renaissance Revival **dressing table / vanity** — correctly identified — one of a coordinating 3-piece suite (vanity + dresser + full bed) in the owner's workshop.

**Form is RIGHT (🟢).** P0 read `kneehole_opening` (conf 96) + `dressing_table_form` + mirror superstructure, and routing landed on **Dressing table** at High confidence — over the tempting wrong alternatives it explicitly considered (Kneehole desk, Pedestal stand). This is the second dressing-table form-win of the batch (cf. scan 02) — the vanity-vs-desk logic and the maker/mirror handling are working. Good note to close batch 1 on.

**The date is the issue, and it's a subtle one (🟡).** Final: **c. 1920–1925**. The engine found **two** convergence zones:
- `1920–1925` — **style_wave layer only** (the "Italian Renaissance Revival wave, 1890–1925")
- `1840–1940` — **6 layers**: fastener, hardware, finish, style_wave, joinery, style

It picked the **narrower, style-only** zone as "strongest… highest weighted authority" — over the broader zone backed by **hardware** (porcelain casters 1840–1900, ring pulls 1840–1900) and fasteners. In other words: **style dated this piece, and construction/hardware got sidelined** — the exact inversion the canonical guidance warns against ("style alone should not date the form; construction evidence should control").

**Important nuance — the *number* may actually be right, but the *path* is wrong.** A matched 3-piece "Italian/Jacobean Renaissance Revival" bedroom suite is itself a strong **1920s mass-market** signal (coordinated suites like this were a 1920s phenomenon, not a 1870s one), so c. 1920–25 is plausibly correct. But the engine didn't reason from the suite or the construction — it got there by letting a style-revival-wave outvote the hardware. Right answer, forbidden method, not robust. If the same mechanism hit a genuinely Victorian piece it would mis-date it late (and arguably already shaded scan 03's ceiling).

**Lands on parked / protected territory:** this is the **style-prose / revival-wave frontier (M11)** crossed with **convergence-zone selection** in `engineDatingOverlap.ts` — explicitly on the *don't-touch-without-asking* list. So it's a deliberate-design triage item, not a quick guard. Logging, not touching.

**Minor M0 over-emission (didn't change outcome):** `pedestal_column` fired at weight 0.98 ("single-column pedestal form") on a two-pedestal vanity, and `golden_oak_structural_pattern` fired on a walnut/burl piece. Neither overrode the correct form — noted as the same phantom-clue pattern as scan 04, just harmless here.

**Suite / resale note:** a coordinating vanity + dresser + full bed is worth meaningfully more **sold as a matched set** than parted out — "complete Renaissance Revival bedroom suite" is a real listing category. The bed having no rails hurts (beds without rails are hard to sell and to use); sourcing or fabricating rails materially lifts the set's value. Worth scanning the dresser and bed too — if the engine dates all three consistently, that's a useful cross-check on this very date question (a suite should date as one unit).

---

## Batch 1 complete (scans 01–05) — holding

Per "collect all 40, then discuss — don't do anything yet," I am **not** pushing, ingesting corpus fixtures, or fixing. Running log committed locally only. Tally so far:

- **Telephone-bench over-route: 2** (scans 01, 04) — current #1 fix target.
- **#22 taxonomy gap: 2** (01 high chair, 03 organ — organ also out-of-scope).
- **Affirmation / M0 phantom-clue: 2–3** (01, 03 felt-pads-as-upholstery, 04 phantom seating).
- **Prose-discarded / style-driven dating: 3** (02 dated stamp under-used, 03 repair patch over-used, 05 style-wave outvoting hardware).
- **Clean form wins: 2** (02, 05 — both dressing tables).
- **Regressions from our shipped work: 0.**

Everything still converges on the one root cause. Branch for the eventual push (`zen-gauss` vs `general-discussion`) still needs the owner's call.

---

## Scan 06 — wooden full bed (suite-mate of scan 05)

**Engine:** Colonial Revival Iron bed frame (`form_iron_bed`) · **post-1989** (High) · resale $94–221.
**Actually:** the **wooden full bed** that coordinates with scan 05's vanity — same Colonial/Neoclassical Revival bedroom suite, so genuinely **c. 1920s**. Owner notes it has no rails.

**This is the most important scan in the batch. Two serious misses — and on BOTH, P0 wrote the correct answer in plain English and the engine threw it away.** This is the whole thesis caught red-handed, in its most airtight form yet.

### Miss 1 — form: wooden bed → "iron bed" (should be `form_bedstead`)
- P0's own clue description: *"Complete **wooden** bed frame with headboard, footboard, and **metal side rails**."* It's a wood bed; the only metal is the rails (every bed has metal rails/bolts).
- But the clue **key** is `metal_bed_frame` (weight 0.98) — P0 mis-keyed a wooden bed under a metal label — and routing trusted the **key**, matching it straight to `form_iron_bed`. Prose discarded again. M7-flavored (key substring drives a form the description contradicts).
- The engine's **own canonical guidance** for this form literally says: *"A wooden bed with iron hardware routes to form_bedstead."* The right answer is **Bedstead**, and the rule for reaching it is already written in the form's own doc — the engine just didn't apply it because the key said "metal." Two-layer defect: (a) P0 emitted the wrong clue key, (b) routing read the key over the description.

### Miss 2 — date: a chalk mover's mark "1989" → "post-1989" (catastrophe)
- The convergence zone is **1880–1925** (5 layers: joinery, fastener, finish, style, style_wave). Style is Colonial Revival c. 1900–1940. Everything real says early 20th c.
- The headboard back has a **chalk/pencil scrawl reading "KEEP" and "1989."** P0 nailed it: *"likely owner, mover, or storage notations — **NOT** maker marks… The year '1989' if accurate would be a use/storage date, **not necessarily a manufacture date. Low authority** as dating evidence."*
- The engine then printed **"post-1989"** — P2: *"The label's 1989 label date is a terminus post quem… applied as a floor."* It took a mover's chalk scrawl, that P0 explicitly flagged as non-maker/low-authority, and clamped the date floor to 1989 — **overriding a strong, correct 1880–1925 convergence.** The engine had a sentence in its own trace saying *"do not use 1989 as a manufacture date,"* and used 1989 as the manufacture date.
- This is the **single most provable instance of the consumption disease** so far: not a subtle thin-slice, but the engine contradicting an explicit authority assessment sitting right next to the number it consumed.

### The suite cross-check fired exactly as predicted
In scan 05 I flagged that the vanity's date was reached by a shaky path and suggested scanning the suite-mates as a consistency check. Here it is: **same bedroom suite, should be one date (~1920s). Vanity → c. 1920–1925. Bed → post-1989.** A 64-year split on two pieces built together. That is direct proof the dating mechanism is not robust — independent of any single piece being coincidentally right.

### Severity
"post-1989" on an obvious antique is a **credibility-killer** in front of a dealer — arguably higher *severity* than the telephone-bench bug, though lower *frequency* so far. And it clusters with:
- **Scan 04**: "post-1939" off a label that doesn't exist.
- **Scan 06**: "post-1989" off a chalk mark P0 said to ignore.
- **Scan 02** (inverse): a *real* dated stamp under-used (floor-only when it was the date).

→ The **label/inscription-date → terminus** logic is a clear defect cluster (now n=3): it consumes any year-like text as a date floor **without reading P0's authority verdict on that text.** This is the date-prose wire's core job.

**Proposed fixes (post-batch triage, NOT now):**
- (a) **Inscription-authority gate (date-prose wire):** a year only sets a terminus if P0 attributes it to the maker/manufacture; explicit "owner/mover/storage notation / low authority / not a maker mark" language must **bar** it from the dating layer. Highest-severity item in the batch.
- (b) **Wooden-bed routing:** apply the form's own documented rule — wood bed + metal rails → `form_bedstead`, not `form_iron_bed`. Needs P0 to stop mis-keying it `metal_bed_frame`, and/or routing to read "wooden…metal side rails" prose. M7 family.

**Running tally update:** label/inscription-date misfire is now **3** (02, 04, 06) and rivals telephone-bench (2) for top priority — telephone-bench by frequency, inscription-date by severity. Still zero regressions from shipped work; still one root cause.

---

## Scan 07 — Victorian spring platform rocker (owner-flagged)

**Engine:** Rocking chair · American Empire / late Classical Revival · **c. 1935 onward** (High form, date conf Low) · resale $123–272.
**Actually:** a **Victorian spring/platform rocker**, Golden Oak, **c. 1875–1910**. Owner's clue: *"authored dating guidelines specific to platform rockers that I feel is being ignored."*

**The owner is right — and the trace proves it outright. This is the cleanest "authored answer thrown away" case in the batch.** Form is fine (Rocking chair, High; could be tighter as "platform rocker" but acceptable). The **date is a catastrophe**, and it's the *other half* of the reframe we haven't seen this clearly yet: not P0 prose discarded, but **owner-authored reference data discarded.**

### Why it dated a c.1875–1910 rocker to "1935 onward" — two stacked failures

**1. A NEGATED clue's date set the floor (M7).** The only thing pinning a floor is `bent_molded_plywood` → post-1935 (molded-plywood = Eames-era signal). But read P0's own description of that clue: *"appears to be bent solid wood or thick bent veneer laminate **rather than modern molded plywood**… consistent with **late 19th-century** steam-bent or laminated bent wood."* P0 **explicitly negated molded plywood** — and the engine consumed the clue **key** `bent_molded_plywood` for its post-1935 date anyway, throwing away the sentence that says "this is NOT that." Identical mechanism to scan 06's "metal_bed_frame" key-over-prose. The entire 1935 floor rests on a clue P0 said does not apply.

**2. The authored platform-rocker dating is not wired into the dating layer.** The defining feature — `concentric_ring_spring_mounts` (conf **95**) — P0 describes as *"the defining mechanical feature of Victorian spring platform rockers… c. 1875–1910."* The supporting `style_cue_victorian_spring_rocker` says *"c. 1875–1910."* `porcelain_caster` says *1840–1910.* **Three independent Victorian anchors, the date written right into their text.** Yet in the Dating-overlap section they are all **"present but undated"** — the construction-category clues (and the spring-mount feature specifically) carry **no date_floor/ceiling into the dating computation.** So `Convergence zones (0): none` — there's nothing for them to converge *on*, because the authored platform-rocker window never enters the math. The owner authored "spring platform rocker ⇒ c. 1875–1910"; the engine captured the feature, even recited the date in prose, and then dated by a negated plywood clue instead.

**Net:** the correct date (**c. 1875–1910**) is sitting in the trace in *at least three places* — and the output is **"c. 1935 onward."** The answer is in both P0's words *and* the authored reference; consumption reads neither.

### This is the reframe's second half
CLAUDE.md frames the fix as widening consumption to include *both* "rich observation prose" *and* "rich (owner-authored) reference fields." Scans 02/03/06 were the prose half. **This is the reference-field half**: the platform-rocker dating exists as authored data but the dating layer doesn't ingest it (construction-layer clues feed form/era reasoning but are marked "undated" for the overlap). That's a wiring gap, not a missing rule — exactly the "the engine has the answer and throws it away at the consumption point" pattern.

### Clusters this joins
- **Spurious wrong-late floor: now 3** — scan 04 (post-1939, no label), scan 06 (post-1989, chalk mark), scan 07 (post-1935, negated plywood). Common shape: a single weak/negated/absent late signal clamps the floor *above* the true period and overrides (or starves) the real evidence.
- **M0 phantom `fully_upholstered`: again** — fired here (conf 74, "upholstered/cushioned surfaces") on a chair P0 also flagged `no_upholstery` ("completely stripped… bare wood shell"). Two contradictory clues kept; the phantom drove the "Upholstery present" line. Same phantom as scans 03/04.

**Proposed fixes (post-batch triage, NOT now):**
- (a) **Honor negation on dated clues (M7/date):** a clue whose description negates it (`rather than`, `not`, `consistent with [earlier era] instead`) must not contribute its key's date to the floor. Kills the 1935 here and the iron-bed mis-key family.
- (b) **Wire authored platform-rocker / mechanism dating into the overlap layer:** `concentric_ring_spring_mounts` and the spring-platform-rocker signal should carry their authored c. 1875–1910 window into dating, not sit "undated." This is the owner's specific point — confirmed real.
- (c) Same inscription/weak-floor discipline as scans 04/06.

**Owner validation:** the authored platform-rocker dating IS being ignored — confirmed from the trace (defining feature "present but undated"; floor sourced from a negated clue). Good catch; logged, not yet fixed.

---

## Scan 08 — melodeon / square piano called "Pump organ cabinet" (owner-flagged)

**Engine:** Pump organ cabinet (`form_pump_organ_cabinet`) · Queen Anne / Colonial Revival · c. 1870–1900 (Moderate) · resale $116–266.
**Actually:** a 19th-c. **keyboard instrument** — melodeon or square piano (seller tag literally reads "Melodeon"); trestle/lyre base, folding lid, ~5 octaves. **No bellows, no treadle pedals, no reed stop-knobs** visible. Owner's point: *"absence of reeds… absence of bellows… should be a dead giveaway."*

**Date is fine (c. 1870–1900 is right for the form). The issue is the form route — and it's the exact mirror of scan 03, which together prove the routing reads adjacency, not affirmation.**

### The 03 ↔ 08 mirror (the key insight)
- **Scan 03** = a *real* Lyon & Healy reed/pump organ — had `reed_organ_form`, `bellows_pedals`, `organ_stop_knobs`. The engine called it **"Upholstered seating"** (missed the organ entirely).
- **Scan 08** = *not* a confirmable pump organ — has **none** of those defining clues, just generic `keyboard_instrument_case` / `musical_instrument` / `keyboard_range`. The engine called it **"Pump organ cabinet."**

So the pump-organ route **false-negatived a real organ and false-positived a non-organ.** That can only happen if the route is keyed on generic keyboard/cabinet adjacency rather than on the form's defining evidence (bellows / treadles / reeds / stops). The engine's own "How it differs" text even recites the defining test — *"pump organs use foot-powered bellows with two treadle pedals and reed assemblies"* — and then routes without checking any of it. Same disease as the telephone bench (scans 01, 04): **a form selected because adjacent signals are present, not because its defining feature is affirmed.**

### The owner's principle — encode disqualifying absence (affirmation's contrapositive)
"No bellows + no reeds ⇒ not a pump organ" is the affirmation gate stated as a negative. The affirmation fix has two faces:
- **Require** the defining feature to *select* a form (positive gate).
- **Bar** the form when its defining feature is *affirmatively absent* (negative gate) — P0 even captured the absence here (no bellows/treadle/stop clues at all). This is a genuinely good, generalizable design rule and worth encoding as such, not just per-form patches.

### Affirmation is now the batch's dominant theme
Forms routed on adjacency without defining-feature affirmation: **scans 01, 03, 04, 08 — 4 of 8.** Two forms (telephone bench ×2, pump organ ×2), one mechanism. This is the highest-frequency cluster in the batch and the strongest case for building the affirmation gate as a *general* consumption rule (positive + negative) rather than chasing individual routes.

**Minor:** style "Queen Anne / Colonial Revival" is a loose, text-derived context label; P0's own cues (`georgian_regency_influence`, ball-and-claw, lyre stretcher) point earlier/different. Low-weight, context_only — not the headline.

**Proposed fixes (post-batch triage, NOT now):**
- (a) **Affirmation gate, both polarities:** a form requires its defining clue(s) to be selected; affirmative absence of those defining clues bars it. Covers pump-organ (08), telephone-bench (01/04), and is the general fix.
- (b) **Instrument taxonomy / scope decision** (recurring with 03, 08): melodeon / square piano / reed organ have no clean home; decide author-vs-out-of-scope.

**Owner validation:** the route ignored the defining-feature test that the form's own documentation states. Confirmed real; logged, not fixed.
