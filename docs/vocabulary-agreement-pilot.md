# Vocabulary Language Agreement — Pilot (6 forms)

**Purpose.** One authored contract that perception (P0), normalization, and scoring all
honor. It is *data first* — we dry-run it against **real scan traces** before any of it
touches the routing engine. Supersedes/absorbs the dormant `lib/constraints/clueRoutingMap.ts`.

## Field → layer it governs

| Field | Governs | Rule |
|---|---|---|
| `canonical_form_key` (+ `form_id`) | shared token | the one key that means "this IS the form" |
| `anchor_clues` | **scoring** | form-*defining*; **≥1 must be present** to route the form |
| `supporting_clues` | scoring weight | corroborate only; **never route the form alone** |
| `conflicts` | scoring guardrail | if present, rule the form **out** or down-weight |
| `descriptive_variants` | **perception** | what P0 *actually* emits — **MUST be grounded in real traces** |
| `safe_aliases` | **normalization** | emitted variant → canonical key |
| `unsafe_aliases` | normalization guardrail | look-alikes that must stay **null** (never route here) |

**Authoring status tags:** `REAL` = observed in a real scan trace · `PROPOSED` = my draft, owner
confirms/overrides · `TODO` = needs a real scan capture before it's trustworthy.

---

## 1. Parlor table

```
form_id:             form_parlor_table
canonical_form_key:  parlor_table_form

anchor_clues (PROPOSED — you confirm):
  - parlor_table_form                         # the explicit form call
  - [ rectangular_top + lower_display_shelf ] # the two-tier structure is the real tell
  ⟵ YOU: is the two-tier shelf required, or is a plain occasional table enough?

supporting_clues (PROPOSED):
  - spool_turning, barley_twist, turned_legs, apron_construction, casters, cabriole_leg

conflicts (PROPOSED — rule the form out / down-weight):
  - drawer_bank        → chest / desk, not a table
  - drop_leaf_hinged   → drop-leaf table
  - tilt_top           → tilt-top table
  - gateleg_support    → gateleg table

descriptive_variants (REAL — from the green-table scan):
  - victorian_parlor_table_form
  - table_form_rectangular_top
  - scalloped_lower_shelf
  - apron_construction
  - spool_bobbin_turning

safe_aliases (PROPOSED — variant → canonical):
  - victorian_parlor_table_form  → parlor_table_form
  - table_form_rectangular_top   → rectangular_top
  - scalloped_lower_shelf        → lower_display_shelf
  - spool_bobbin_turning         → spool_turning

unsafe_aliases (PROPOSED — must NOT route to parlor table):
  - "parlor" / "renaissance revival parlor"   # style/room word, not a form
  - flat_surface (alone)                       # every table & desk has one
```

## 2. Child's high chair  *(pairs with the new `form_childs_high_chair` entry)*

```
form_id:             form_childs_high_chair
canonical_form_key:  high_chair_form

anchor_clues (PROPOSED — you confirm):
  - high_chair_form
  - [ elevated_seat_on_tall_legs + juvenile_scale + footrest_stretcher ]
  ⟵ YOU: juvenile SEAT height is the discriminator — set the threshold.

supporting_clues (PROPOSED):
  - seating_surface, backrest_present, turned_legs, plank_seat, turned_arm_spindles, tray_fittings

conflicts (PROPOSED):
  - adult_scale                         # if seat height reads adult → armchair, not high chair
  - rocker_runners                      → rocker
  - wicker_paint_buildup / woven_body   # P0 NOISE on this scan — a painted wood chair is not wicker
  - mcm_structural_pattern              # P0 NOISE — not mid-century

descriptive_variants (REAL — from the high-chair scan; note the noise):
  - seating_surface, backrest_present, armchair_form, windsor_chair_form,
    fiddle_splat_back, seat_plank_shaped, turned_arm_spindles,
    splayed_wedged_through_tenons, back_stiles_turned, vernacular_painted_chair
  - NOISE (contradictory, P0 hallucinated): wicker_paint_buildup, woven_body, mcm_structural_pattern

safe_aliases (PROPOSED — TRICKY, needs your call):
  - fiddle_splat_back → splat_back
  ⟵ YOU: armchair_form / windsor_chair_form are CORRECT-ish (it is a Windsor-construction
     armchair) but must be OVERRIDDEN to high_chair when juvenile_scale fires. This is the
     conflict-resolution case — the anchor's juvenile_scale must outrank the armchair signal.

unsafe_aliases (PROPOSED — must NOT route the piece):
  - wicker_paint_buildup, woven_body   → wicker furniture
  - mcm_structural_pattern             → mid-century modern
```

---

## 3. Washstand  ·  4. Secretary  ·  5. Rocking chair  ·  6. Blanket chest

```
# Stub — same schema. canonical keys pre-filled; descriptive_variants need a REAL scan.

3. WASHSTAND
   form_id: form_washstand   canonical_form_key: washstand_form
   anchor_clues (PROPOSED): [ water_resistant_top (marble/tile) + rear_splash_gallery ]  ⟵ YOU
   supporting_clues (PROPOSED): towel_bar, single_shallow_drawer, lower_open_shelf
   conflicts (PROPOSED): mirror_present → dresser/vanity; drawer_bank → chest
   descriptive_variants: TODO — capture a real washstand scan
   safe_aliases / unsafe_aliases: TODO after trace

4. SECRETARY (drop-front desk-and-bookcase)
   form_id: form_secretary_desk   canonical_form_key: secretary_form
   anchor_clues (PROPOSED): [ drop_front_desk + upper_glazed_or_bookcase_section ]  ⟵ YOU
   supporting_clues (PROPOSED): pigeonholes, fall_front_hinges, lopers
   conflicts (PROPOSED): cylinder_roll → cylinder desk; slant_front → slant-front desk (no bookcase top)
   descriptive_variants: TODO — capture a real secretary scan
   safe_aliases / unsafe_aliases: TODO after trace

5. ROCKING CHAIR
   form_id: form_rocking_chair   canonical_form_key: rocking_chair_form
   anchor_clues (PROPOSED): [ rocker_runners ]  ⟵ YOU (runners are the definitive tell)
   supporting_clues (PROPOSED): seating_surface, spindle_back, turned_legs
   conflicts (PROPOSED): no_runners → side/armchair; platform_base → platform rocker
   descriptive_variants: TODO — capture a real rocker scan
   safe_aliases / unsafe_aliases: TODO after trace

6. BLANKET CHEST
   form_id: form_blanket_chest   canonical_form_key: blanket_chest_form
   anchor_clues (PROPOSED): [ lift_lid + deep_single_well ]  ⟵ YOU
   supporting_clues (PROPOSED): till_box, dovetailed_case, cedar_lining, bracket_or_bun_feet
   conflicts (PROPOSED): drawer_bank_full_height → chest of drawers; juvenile_decoration → toy chest
   descriptive_variants: TODO — capture a real blanket-chest scan
   safe_aliases / unsafe_aliases: TODO after trace
```

---

## Next step (no code)

Once you've filled the `⟵ YOU` calls on #1 and #2, I dry-run them against the two real
traces and report: does the contract route the parlor table → `form_parlor_table` and the
high chair → `form_childs_high_chair`, and does it correctly reject the noise (wicker/mcm)
and the unsafe aliases — **with zero engine changes.** If it holds on the pilot, *then* we
talk about wiring.
