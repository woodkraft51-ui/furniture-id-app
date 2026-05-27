# Authoring Gaps — POPULATED (owner-authored implementation reference)

> Status: **authored by owner 2026-05-27**. This is the spec I implement against.
> Engine wiring is incremental — one traced fix at a time, corpus-validated. Wiring
> the raw date-envelopes in bulk produced opaque cascades (see "Implementation notes").

## Format rules (so authored values parse / take effect)
- **Date grammar:** `1870–1895` (span) · `post-1950` (floor) · `pre-1920` (ceiling) ·
  `c. 1900` (±10) · `late 19th century` / `mid 20th century` (era). NOT `1870s–1890s`
  or `20th–21st century`.
- **Dating categories that move the date:** joinery · fasteners · toolmarks · finish ·
  hardware · materials(→wood) · upholstery. (style/construction/context/form do not.)

---

## Section A — Style families

### A1. Eastlake / Aesthetic Movement
- **Name:** Eastlake / Aesthetic Movement
- **Date range:** 1870–1895
- **Defining ornament vocabulary:** Rectilinear late-Victorian design vocabulary using
  incised line carving, shallow geometric relief, chamfered edges, turned spindles,
  spindle galleries, pierced or jigsaw-cut gallery panels, brackets, trestle-like
  supports, sunburst/fan medallions, stylized floral or leaf incising, ebonized grounds,
  and gilt-incised accents. **Treat spindle galleries plus angular incised ornament as a
  positive attribution package, not as hardware-only Eastlake.**
- **vs Renaissance Revival:** Eastlake is flatter, lighter, more rectilinear, more
  machine-friendly (incised lines, geometric panels, spindlework, chamfers, stylized
  surface ornament). Renaissance Revival is heavier/architectural — bolder carved mass,
  columns, pilasters, arches, cartouches, applied panels, figural/classical motifs,
  case-piece monumentality.
- **vs Rococo Revival:** Eastlake is angular, linear, geometric, reform-minded. Rococo
  Revival is curvilinear/fluid — C/S-scrolls, cabriole movement, serpentine forms, floral
  carving, pierced crests, heavier upholstered parlor vocabulary. Eastlake reads cut /
  incised / gridded / spindle-based rather than swelling and scroll-carved.
- **Original period or revival wave:** **Original period** — late-Victorian original
  family, not a revival wave. Later Eastlake-inspired pieces → reproduction/revival only
  when construction/materials/fasteners/finish/machine evidence requires a later date.

### A2. Late-Victorian Parlor Seating
- **Broad family vs route specifically:** Use "Late-Victorian Parlor Seating" as a broad
  **fallback/context family only**. Prefer routing to Eastlake / Aesthetic, Renaissance
  Revival, Rococo Revival, Gothic Revival, Turkish/Moorish Revival, or later
  Colonial/Neoclassical Revival when diagnostic ornament vocabulary is present. The broad
  family explains form/use context, not override a more specific style family.
- **Distinct family:** Name: Late-Victorian Parlor Seating. Date range: **1860–1900**.
  Vocabulary: coordinated parlor-suite seating, spoon backs, medallion backs, tufted
  upholstery, show frames, platform rockers, gentleman/lady chair scale contrast, carved
  crest rails, scrolled arms, applied ornament, casters, spring upholstery, mixed revival
  vocabularies. **Engine role: fallback/context only; LOW attribution authority unless no
  more specific style signal is present.**

### A3. Wicker / rattan traditions
| Tradition | Band | Defining vocabulary | Engine note |
|---|---|---|---|
| Victorian curlicue wicker | 1880–1900 | dense ornamental wicker; heavy scrolls, curlicues, hearts, fans, looped crests, skirted aprons, rolled arms, photo-frame insets, elaborate backs, showy parlor/porch display | strong Victorian wicker attribution when curlicue density + scroll vocabulary present |
| Bar Harbor wicker | 1900–1925 | open airy geometric weave, diamond/crisscross lattice, braided borders, restrained ornament, rectilinear or gently rounded frames, porch-resort, often painted | distinct from curlicue by openness/geometry/reduced ornament |
| Lloyd loom (paper fiber) | post-1917 | machine-woven paper fiber or twisted paper-and-wire loom over a frame; smoother/more uniform than hand-woven reed/rattan; continuous sheet-like panels | **hard floor at 1917** when material/process positively identified |
| Mid-century streamlined wicker | 1945–1970 | simplified curves, barrel lounge, peacock/fan backs, egg/basket silhouettes, low visual weight, fewer Victorian scrolls, often imported rattan/cane/reed/mixed natural fiber | use when form is mid-century casual/lounge, not Victorian porch or Bar Harbor |

### A4. Hollywood Regency
- **Date range:** 1930–1970
- **Outrank Louis XVI / French Neoclassical when cream/gold-painted Rococo cues co-occur?**
  **Yes.** When cream/ivory paint, gold highlighting, theatrical glamor, mirrored/glossy
  surfaces, exaggerated shell/scroll/rocaille accents, cabriole or faux-French cues, and
  mid-20th-century materials or factory construction co-occur → route to Hollywood Regency
  first. Treat Louis XVI / French Neoclassical as a *source vocabulary* unless construction
  and design discipline clearly point to a true Louis XVI revival form.

---

## Section B — Feature date-envelopes
| clue key | what it is | band | category | dating behavior | notes |
|---|---|---|---|---|---|
| `platform_rocker_mechanism` | sprung platform-rocker base, patented-era mechanism | 1870–1900 | hardware | positive envelope when the actual platform/spring mechanism is visible/described | do not fire from "rocker" alone; needs platform base / springs / mechanical rocking support observed |
| `carved_ornament_machine_assisted` / `machine_carved_ornament` | machine-routed / repetitive machine-cut / CNC-style carving | post-1950 | toolmarks | **open floor ONLY when carving shows modern rout-bit repetition, CNC regularity, molded/composite carving, or other modern machine evidence** | **do NOT use for ordinary late-19th-c machine-assisted incising or factory carving** |
| `reeded_rail_detail` | reeded or fluted rail detail | leave undated | toolmarks | no intrinsic dating movement by itself | reeding too broad across periods; supports style/form, not dating, unless paired with tooling/finish/material/construction |
| faux-stone laminate / MDF tabletop | decorative laminate or MDF top (bistro/pub context) | post-1950 | materials | **hard modern floor** when laminate/MDF/particleboard/printed faux-stone/postwar composite positively identified | map to materials→wood/substrate; should override older style vocabulary when present |

---

## Section C — Additional recommended additions/corrections
- **Cane vs wicker gating** (category mapping): keep cane, wicker, rattan, reed, rush, Lloyd
  loom separate at the observation layer. Cane may support seat/back construction, but
  ordinary cane must NOT auto-route to the wicker tradition. *(Prevents cane-seat chairs
  from being dated/styled as wicker furniture.)*
- **Laminate / particleboard / MDF as hard negatives** (post-1950 / materials): modern
  floor when substrate is confidently identified, even if style imitates Victorian / French
  Provincial / Colonial Revival. Composite substrates outrank revival styling for dating.
- **Generic spindle token filtering** (style/context): do not attribute Eastlake from
  "spindle" alone — require spindle gallery, incised geometric ornament, Eastlake hardware,
  chamfered rectilinear members, or other supporting vocabulary. *(Prevents Windsor,
  ladderback, turned-chair, generic-spindle false positives.)*
- **Platform rocker vs ordinary rocker** (hardware/form split): platform-rocker mechanism
  dates in hardware; ordinary rocking-chair form does not date. *(Keeps the mechanism from
  becoming a form-level overreach.)*
- **Hollywood Regency tiebreak** (1930–1970 / style routing only): when glam painted finish
  + gold accent + faux-French/Rococo vocabulary + mid-century construction co-occur, prefer
  Hollywood Regency. *(Solves Louis XVI tie losses without misdating truly older French
  Revival pieces.)*

---

## Implementation notes (engine side — not authored content)
- Wiring `platform_rocker_mechanism` @1870–1900 (correct) exposed a **convergence-adoption
  bug**: the engine computes the right `1870–1895` zone but P2/reconciliation discards it
  and emits a spurious `1940–1970 / reproduction`. Must be fixed before the envelope helps.
- Machine-carving `post-1950` must be **gated** (modern CNC/rout evidence only), else it
  mis-dates Victorian factory carving — per the Section B note.
- Eastlake-from-ornament needs the **≥2-signal package gate** (Section A1 / C "not from
  spindle alone") via the structural-pattern attribution path, not prose tokens.
- These are wired one at a time, each traced and corpus-validated.
