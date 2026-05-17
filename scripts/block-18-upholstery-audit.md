# Block 18: Upholstery Canonical ↔ Docx Audit

Generated against American_Furniture_Textile_Reference.docx (75 entries)
and canonical lib/constraints/upholsteryCovers.ts (44 type entries) +
upholsteryConstruction.ts (31 type entries).

## Summary

- Docx entries: 75
- Canonical type entries: 75 (44 covers + 31 construction)
  - Note: the Block 18 prompt expected 45+32=77 canonical type entries, but actual file counts are 44+31=75. The discrepancy is documented below; no canonical type entries are missing or orphan.
- Matched pairs: 75
- Docx entries with NO canonical match (missing canonical authoring): 0
- Canonical entries with NO docx match (orphan canonical entries): 0
- Entries missing wear_characteristics where docx has wear content: 45
- Entries missing cousin_contrasts where docx has cousin content: 72
- Entries with empty regional_persistence_notes where docx has regional content: 39
- Entries with empty related_form_types where docx mentions applications: 72
- Entries with dating-cue markers in docx not surfaced in canonical period_associations/identifying_characteristics/style_associations: 3

Status distribution: GOOD=1, PARTIAL=45, MAJOR=29

## Missing canonical entries (in docx, not in canonical)

None. All 75 docx ENTRY headings map 1:1 to existing canonical type entries.

## Orphan canonical entries (in canonical, not in docx)

None. All 75 canonical type entries (44 covers + 31 construction) map 1:1 to a docx ENTRY heading.

Note on the prompt's expected count (45 + 32 = 77): the actual constraint files contain 44 cover type entries and 31 construction type entries (75 total), which exactly matches the docx's 75 entries. The prompt's 77 figure appears to be off by one in each library; this is not a real discrepancy in coverage — every docx entry has a canonical home and vice versa.

## Per-entry gaps

Status legend:
- GOOD = no significant gaps detected
- PARTIAL = 1-3 gap fields
- MAJOR = 4+ gap fields

(Wear/cousin/regional/form-type checks are based on Block 17 newly-added fields that remain almost entirely empty across the canonical libraries — the only populated regional_persistence_notes are on cotton, natural_rush, splint_seat, shaker_tape, rawhide_leather_lacing, stuffed_over_the_rail, tow, and spanish_moss. No entry has any wear_characteristics or cousin_contrasts populated. related_form_types is populated on a handful of cover entries only.)

### ENTRY 1: Linen → upholstery_cover_type_linen

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Uneven thread thickness, dry hand, gray-beige oxidation, hand-sewn seams on early examples, fading toward tan or ivory.; [Unique characteristics] relatively strong but can become brittle with age."
- ❌ cousin_contrasts: MISSING. Docx: "Linen is crisper and less fuzzy than cotton. It is less elastic than wool. It lacks the sheen of silk and rayon ."
- ❌ regional_persistence_notes: MISSING. Docx: "Common in colonial and rural domestic settings where flax culture and household textile production were strong, especially New England, Mid-Atlantic, and Pennsylvania-German contexts."
- ❌ related_form_types: MISSING. Docx: "Early cushions, slip covers , under-upholstery, chair seats, canvas-like support panels, later historic reproductions."

### ENTRY 2: Cotton → upholstery_cover_type_cotton

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Soft fraying, flatter yarns, printed floral or geometric designs, frequent use in chintz, ticking, muslin, and later decorator fabrics."
- ❌ cousin_contrasts: MISSING. Docx: "Cotton is softer and less crisp than linen. It lacks wool’s spring and silk’s luster. Compared with rayon, old cotton usually has less fluid drape."
- ❌ related_form_types: MISSING. Docx: "Slip covers, printed upholstery, seat covers, dust covers, mattress ticking, underlayers, modern upholstery."

### ENTRY 3: Wool Broadcloth, Worsted, and Serge → upholstery_cover_type_wool_broadcloth_worsted_serge

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Slight nap, moth damage, felting, wool odor when damp, dark oxidation, abrasion on seat fronts and arms.; [Dating cues] Moth damage, hand stitching, early tack patterns, and faded vegetable or early synthetic dyes can support older use."
- ❌ cousin_contrasts: MISSING. Docx: "Wool is warmer and more elastic than linen or cotton. Worsted is smoother and more compact than woolen broadcloth."
- ❌ regional_persistence_notes: MISSING. Docx: "Present in early colonial and Federal-period upholstered furniture, especially in wealthier urban interiors."
- ❌ related_form_types: MISSING. Docx: "Early slip seats, upholstered chairs, cushions, settle cushions, benches, institutional seating."

### ENTRY 4: Damask → upholstery_cover_type_damask

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Light-reflective pattern shift, satin and matte contrast, large repeat, formal symmetry."
- ❌ cousin_contrasts: MISSING. Docx: "Damask is woven, not printed. Unlike brocade, it usually does not have extra raised supplementary threads. Unlike velvet, it has no pile."
- ❌ regional_persistence_notes: MISSING. Docx: "Urban and affluent interiors; imported silks and later domestic or machine-woven versions. Common in formal East Coast and later revival interiors."
- ❌ related_form_types: MISSING. Docx: "High-style chairs, sofas, settees, parlor suites, Colonial Revival and Victorian Revival upholstery."

### ENTRY 5: Brocade → upholstery_cover_type_brocade

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Floating threads on reverse, raised figure, metallic tarnish, elaborate floral or scrolling patterns."
- ❌ cousin_contrasts: MISSING. Docx: "Brocade is more dimensional than damask. It is woven, not embroidered, though it may imitate embroidery."
- ❌ regional_persistence_notes: MISSING. Docx: "More common in high-style urban or imported decorator contexts than plain rural furniture."
- ❌ related_form_types: MISSING. Docx: "Formal parlor furniture, Empire, Rococo Revival, Renaissance Revival, Victorian suites, Hollywood Regency revival pieces."

### ENTRY 6: Jacquard Upholstery → upholstery_cover_type_jacquard

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Jacquard is a production method, not one fabric. It can resemble damask, brocade, or tapestry. Identify by weave complexity and machine regularity."
- ❌ regional_persistence_notes: MISSING. Docx: "Widespread in 19th-century industrial upholstery markets; common in mass-produced American furniture after mid-19th century."
- ❌ related_form_types: MISSING. Docx: "Victorian parlor suites, Eastlake chairs, Renaissance Revival seating, Colonial Revival chairs, 20th century sofas."

### ENTRY 7: Tapestry Upholstery → upholstery_cover_type_tapestry

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Tapestry is heavier and more pictorial than damask. It is flatter than velvet and usually less shiny than brocade."
- ❌ regional_persistence_notes: MISSING. Docx: "Popular in Victorian and early 20th-century American interiors, especially formal parlors and libraries."
- ❌ related_form_types: MISSING. Docx: "Victorian parlor suites, Renaissance Revival, Gothic Revival, Jacobean Revival, library chairs, fireside chairs."

### ENTRY 8: Turkey Work → upholstery_cover_type_turkey_work

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Rug-like pile, bold geometric or floral pattern, thick wool knots or loops, worn-down high spots."
- ❌ cousin_contrasts: MISSING. Docx: "Turkey work resembles carpet more than ordinary upholstery fabric. It is pile-based, unlike flat tapestry or damask."
- ❌ regional_persistence_notes: MISSING. Docx: "Associated with early colonial and English-derived high-style seating. More likely in wealthy New England and Mid-Atlantic contexts."
- ❌ related_form_types: MISSING. Docx: "Early colonial chairs, cushions, high-status seating."

### ENTRY 9: Needlework, Needlepoint, Crewel, and Embroidered Covers → upholstery_cover_type_needlework

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Dating cues] True early needlework often has uneven hand stitching, oxidation, and fading."
- ❌ cousin_contrasts: MISSING. Docx: "Needlework is stitched after the ground exists; brocade and tapestry are woven. Crewel is usually wool embroidery on linen or cotton; needlepoint uses canvas ground."
- ❌ regional_persistence_notes: MISSING. Docx: "More common in genteel domestic and urban settings; also strong in Colonial Revival interiors."
- ❌ related_form_types: MISSING. Docx: "Chair seats, chair backs, footstools, fire screens, piano benches, formal occasional chairs."

### ENTRY 10: Velvet → upholstery_cover_type_velvet

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Nap direction, crushed wear on seats and arms, pile loss at edges, deep color shift when brushed."
- ❌ cousin_contrasts: MISSING. Docx: "Velvet has cut pile. Velour usually has a knit or softer modern hand. Plush has a longer pile. Mohair velvet is more resilient and lustrous."
- ❌ regional_persistence_notes: MISSING. Docx: "High-style urban furniture and later mass-produced parlor suites."
- ❌ related_form_types: MISSING. Docx: "Parlor chairs, sofas, settees, Empire, Rococo Revival, Renaissance Revival, Eastlake, Art Deco, Hollywood Regency."

### ENTRY 11: Plush → upholstery_cover_type_plush

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Thick pile, directional shading, crushed and matted wear, deep buttoning impressions."
- ❌ cousin_contrasts: MISSING. Docx: "Plush is longer and heavier than velvet. It is usually less formal than fine silk velvet and more associated with late Victorian comfort."
- ❌ regional_persistence_notes: MISSING. Docx: "Common in Victorian American parlors, especially commercially upholstered seating."
- ❌ related_form_types: MISSING. Docx: "Victorian parlor furniture, fainting couches, platform rockers, Eastlake and Renaissance Revival seating."

### ENTRY 12: Mohair Velvet → upholstery_cover_type_mohair_velvet

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Shimmering nap, crisp resilient pile, strong abrasion resistance, often used in solid colors.; [Dating cues] Modern mohair remains available, so date by attachment, backing, wear, and frame evidence."
- ❌ cousin_contrasts: MISSING. Docx: "Mohair has a sharper luster and more resilient pile than cotton velvet or synthetic velour."
- ❌ regional_persistence_notes: MISSING. Docx: "Strong in Arts and Crafts interiors, libraries, offices, and quality commercial seating."
- ❌ related_form_types: MISSING. Docx: "Mission seating, Morris chairs, Art Deco chairs, theater seating, office chairs, high-quality sofas."

### ENTRY 13: Velour → upholstery_cover_type_velour

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Stretchier hand, knit or synthetic backing, soft crushed surface.; [Dating cues] Bright synthetic velour and earth-tone crushed velour strongly suggest 1960s to 1980s."
- ❌ cousin_contrasts: MISSING. Docx: "Velour often feels softer and more casual than velvet. It may stretch more and show synthetic backing."
- ❌ regional_persistence_notes: MISSING. Docx: "Mass-market American furniture, especially postwar and 1970s casual interiors."
- ❌ related_form_types: MISSING. Docx: "Mid-century sofas, recliners, lounge chairs, automotive-influenced seating, 1970s furniture."
- ⚠️ dating cues (decade/era markers): PARTIAL. Docx: "Markers in docx Dating cues not found in canonical period_associations/identifying_characteristics/style_associations: ['1960', '1980']. Docx dating cues: Bright synthetic velour and earth-tone crushed velour strongly suggest 1960s to 1980s. Haircloth, Horsehair, and Animal-Hair Fabrics"

### ENTRY 14: Haircloth / Horsehair Upholstery → upholstery_cover_type_haircloth_horsehair

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Very smooth shiny surface, stiff hand, ribbed texture, brittle splitting at folds, prickly broken hairs."
- ❌ cousin_contrasts: MISSING. Docx: "Haircloth is slicker, stiffer, and shinier than wool or cotton. It is not padding; it is a woven cover textile."
- ❌ regional_persistence_notes: MISSING. Docx: "Common in 19th-century formal seating across urban and middle-class American households."
- ❌ related_form_types: MISSING. Docx: "Dining chairs, side chairs, formal parlor chairs, Victorian seating, institutional furniture."

### ENTRY 15: Camel Hair, Goat Hair, and Other Hair Blends → upholstery_cover_type_camel_goat_hair_blends

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Coarse fiber, muted natural colors, stiff abrasion-resistant face."
- ❌ cousin_contrasts: MISSING. Docx: "Usually softer than horsehair cloth but coarser than wool."
- ❌ regional_persistence_notes: MISSING. Docx: "Less diagnostic regionally; usually tied to commercial textile supply."
- ❌ related_form_types: MISSING. Docx: "Commercial seating, institutional seating, specialty upholstery, some high-grade 20th-century textiles."

### ENTRY 16: Chintz → upholstery_cover_type_chintz

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Chintz is printed cotton, not woven damask. It is smoother and often glossier than ordinary printed cotton."
- ❌ regional_persistence_notes: MISSING. Docx: "Used in elite 18th-century imported contexts, then much more broadly in 19th and 20th-century domestic interiors."
- ❌ related_form_types: MISSING. Docx: "Slip covers, cushions, upholstered chairs, cottage and Colonial Revival interiors."

### ENTRY 17: Toile → upholstery_cover_type_toile

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Toile is scenic and printed. It differs from chintz, which is usually floral and more colorful."
- ❌ regional_persistence_notes: MISSING. Docx: "More common in formal, French-inspired, Colonial Revival, and decorator interiors."
- ❌ related_form_types: MISSING. Docx: "Side chairs, bedroom chairs, Colonial Revival seating, French Provincial revival pieces."

### ENTRY 18: Ticking → upholstery_cover_type_ticking

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Dating cues] Old ticking may be hand-sewn, faded, and densely woven."
- ❌ cousin_contrasts: MISSING. Docx: "Ticking is more utilitarian and stripe-based than decorative woven upholstery."
- ❌ regional_persistence_notes: MISSING. Docx: "Common in rural, vernacular, and utilitarian settings."
- ❌ related_form_types: MISSING. Docx: "Mattresses, daybeds, cushions, slip seats, rustic benches, modern farmhouse upholstery."

### ENTRY 19: Full-Grain and Top-Grain Leather → upholstery_cover_type_full_grain_top_grain_leather

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Pores, natural scars, cracking, oxidation, darkening from oils, nail or tack attachment on older seating.; [Dating cues] Deep oxidized leather with alligator cracking may indicate age, but leather is often replaced."
- ❌ cousin_contrasts: MISSING. Docx: "Leather has natural grain and irregularity. Vinyl has a more uniform artificial grain and fabric backing. Bonded leather often flakes."
- ❌ regional_persistence_notes: MISSING. Docx: "Common in early colonial and Spanish-influenced seating; strong again in Mission, library, office, and 20th-century masculine interiors."
- ❌ related_form_types: MISSING. Docx: "Early chairs, Spanish Colonial and Dutch-derived seating, library chairs, office chairs, club chairs, Mission furniture, modern sofas."

### ENTRY 20: Embossed, Tooled, or Gilt Leather → upholstery_cover_type_embossed_tooled_gilt_leather

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Pressed patterns, gold decoration, dark patina in recesses, nailhead borders."
- ❌ cousin_contrasts: MISSING. Docx: "Decoration is worked into or onto leather, unlike printed fabric. Embossed vinyl may imitate it but shows synthetic backing and uniformity."
- ❌ regional_persistence_notes: MISSING. Docx: "Stronger in Spanish Colonial, Southwest, California Mission, and Renaissance Revival taste."
- ❌ related_form_types: MISSING. Docx: "Spanish Colonial chairs, library chairs, Renaissance Revival chairs, settles, screens."

### ENTRY 21: Vinyl, Naugahyde, and Faux Leather → upholstery_cover_type_vinyl_naugahyde_faux_leather

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Fabric backing, artificial grain repeat, edge peeling, cracking into flakes, plastic smell.; [Dating cues] Red, turquoise, yellow, white, or black vinyl often supports 1940s to 1960s diner or mid-century contexts."
- ❌ cousin_contrasts: MISSING. Docx: "Vinyl lacks natural pores and hide variation. Bonded leather flakes differently and may show shredded leather fiber layer."
- ❌ regional_persistence_notes: MISSING. Docx: "Widespread mass-market and commercial American furniture."
- ❌ related_form_types: MISSING. Docx: "Dinette chairs, bar stools, office chairs, mid-century seating, recliners, commercial furniture."

### ENTRY 22: Stretched Canvas Seat or Back → upholstery_cover_type_stretched_canvas

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] sagging center;; [Identifying elements] stress tears at corners;"
- ❌ cousin_contrasts: MISSING. Docx: "Canvas is structural cloth, not decorative upholstery. It differs from webbing because it is sheet-like rather than strap-like."
- ❌ regional_persistence_notes: MISSING. Docx: "Military, campaign, camp, porch, industrial, and utilitarian American furniture."
- ❌ related_form_types: MISSING. Docx: "Folding chairs, campaign chairs, cot frames, sling chairs, deck chairs, early support panels under upholstery."

### ENTRY 23: Upholstery Webbing → upholstery_cover_type_upholstery_webbing

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Jute, linen, cotton, rubberized, or synthetic straps;"
- ❌ cousin_contrasts: MISSING. Docx: "Webbing is a support textile, not visible upholstery. It differs from cane/rush because it is hidden under upholstery."
- ❌ regional_persistence_notes: MISSING. Docx: "Universal in upholstered furniture; jute common in traditional upholstery."
- ❌ related_form_types: MISSING. Docx: "Upholstered chairs, sofas, settees, ottomans, benches."

### ENTRY 24: Burlap / Hessian → upholstery_cover_type_burlap_hessian

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Open weave, tan/brown color, coarse fibers, brittle age, musty odor.; [Dating cues] Old burlap oxidizes, darkens, and becomes brittle."
- ❌ cousin_contrasts: MISSING. Docx: "Burlap is coarser and more open than canvas. It is usually hidden rather than decorative."
- ❌ regional_persistence_notes: MISSING. Docx: "Common in traditional upholstery across the U.S."
- ❌ related_form_types: MISSING. Docx: "Under-upholstery, spring covers, seat support layers, dust barriers."

### ENTRY 25: Muslin and Cambric Dust Cover → upholstery_cover_type_muslin_cambric_dust_cover

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Muslin/cambric is finer than burlap and not structural like webbing."
- ❌ regional_persistence_notes: MISSING. Docx: "Universal in upholstered furniture."
- ❌ related_form_types: MISSING. Docx: "Chair and sofa bottoms, inner backs, dust covers."

### ENTRY 26: Hand Cane / Strand Cane → upholstery_cover_type_hand_cane_strand_cane

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] broken strands at stress points.; [Dating cues] Hole spacing, frame construction, and wear are more reliable."
- ❌ cousin_contrasts: MISSING. Docx: "Hand cane passes through drilled holes. Pressed cane sits in a routed groove. Rush forms a diagonal fiber pattern rather than an open hexagonal grid."
- ❌ regional_persistence_notes: MISSING. Docx: "Common in American side chairs, especially urban and later factory seating. Strong in 18th-century chairs, Victorian chairs, Bentwood, Colonial Revival, and early 20th-century seating."
- ❌ related_form_types: MISSING. Docx: "Chair seats, chair backs, settees, rockers, side chairs, piano stools."

### ENTRY 27: Pressed Cane / Sheet Cane → upholstery_cover_type_pressed_cane_sheet_cane

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Pressed cane has a spline groove; hand cane has perimeter holes."
- ❌ regional_persistence_notes: MISSING. Docx: "Common in industrial and mass-produced seating."
- ❌ related_form_types: MISSING. Docx: "Victorian chairs, Bentwood chairs, rockers, dining chairs, early 20th-century mass-market seating."

### ENTRY 28: Natural Rush → upholstery_cover_type_natural_rush

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Bulky twisted strands, diagonal X pattern, organic irregularity, golden-brown oxidation, worn high center."
- ❌ cousin_contrasts: MISSING. Docx: "Rush is thicker and more cord-like than cane. It usually lacks the open hexagonal pattern of cane. Splint is flatter and wider."
- ❌ related_form_types: MISSING. Docx: "Ladder-back chairs, slat-back chairs, rural chairs, Shaker chairs, Windsor-related seating, stools."

### ENTRY 29: Paper Fiber Rush → upholstery_cover_type_paper_fiber_rush

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "More uniform than natural rush. Less glossy and less strip-like than cane."
- ❌ regional_persistence_notes: MISSING. Docx: "Widespread in mass-produced American chairs."
- ❌ related_form_types: MISSING. Docx: "Dining chairs, Colonial Revival chairs, ladder-backs , factory seating."

### ENTRY 30: Splint Seat → upholstery_cover_type_splint_seat

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Dating cues] Wood species, oxidation, hand-prepared irregular widths, and frame wear help."
- ❌ cousin_contrasts: MISSING. Docx: "Splint is flat wood strip; rush is twisted fiber; cane is thin rattan bark."
- ❌ related_form_types: MISSING. Docx: "Rural chairs, ladder-backs , rockers, Appalachian and Shaker seating."

### ENTRY 31: Shaker Tape → upholstery_cover_type_shaker_tape

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Textile tape, not plant cane or rush. Usually wider and softer than splint."
- ❌ related_form_types: MISSING. Docx: "Shaker chairs, stools, benches, reproductions."

### ENTRY 32: Rawhide / Leather Lacing Seats → upholstery_cover_type_rawhide_leather_lacing

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Wicker is woven furniture construction. Cane is often a seat or back insert. Rush is usually a seat material. Rattan may be frame or weaving material."
- ❌ related_form_types: MISSING. Docx: "Chairs, rockers, settees, cradles, bassinets, plant stands, tables, porch furniture, baby carriages, hampers."
- ⚠️ dating cues (decade/era markers): PARTIAL. Docx: "Markers in docx Dating cues not found in canonical period_associations/identifying_characteristics/style_associations: ['1840', '1870', '1890', '1900', '1920', '1930', 'Arts and Crafts', 'Victorian']. Docx dating cues: American wicker expands after the 1840s. Elaborate Victorian wicker is especially 1870s to 1890s. Arts and Crafts wicker is simpler and heavier, c. 1900 to 1920s. Stick wicker and streamlined forms appear in the 1930s. Synthetic resin wicker is late 20th century onward."

### ENTRY 33: Rattan → upholstery_cover_type_rattan

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Unique characteristics] can be used as solid pole, split cane, or reed."
- ❌ cousin_contrasts: MISSING. Docx: "Rattan is solid or split palm material. Bamboo is hollow with pronounced nodes. Reed is processed inner rattan."
- ❌ regional_persistence_notes: MISSING. Docx: "Imported material used by American manufacturers; strongly associated with Victorian wicker and later tropical/casual furniture."
- ❌ related_form_types: MISSING. Docx: "Wicker frames, porch furniture, rockers, seating, tables, tropical revival furniture."

### ENTRY 34: Reed → upholstery_cover_type_reed

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Reed is more uniform than willow. It lacks bamboo nodes. It is thicker and more structural than strand cane."
- ❌ regional_persistence_notes: MISSING. Docx: "Common in American wicker manufacturing."
- ❌ related_form_types: MISSING. Docx: "Wicker chairs, backs, seats, panels, baby carriages, baskets, hampers."

### ENTRY 35: Willow → upholstery_cover_type_willow

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Tapered rods, more irregular than reed, bark-on or peeled surfaces, rustic texture.; [Dating cues] Date by frame construction, nails/screws, finish, and wear."
- ❌ cousin_contrasts: MISSING. Docx: "Willow is less uniform than reed or rattan. Often looks more rustic and twig-like."
- ❌ regional_persistence_notes: MISSING. Docx: "Rural and craft production; also used in early and mid-19th-century wicker/willow ware."
- ❌ related_form_types: MISSING. Docx: "Willow chairs, baskets, cradles, rustic furniture, porch seating."

### ENTRY 36: Paper Fiber Wicker / Fiber Rush Wicker → upholstery_cover_type_paper_fiber_wicker

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Kraft-paper texture, uniform twist, swelling or unraveling when wet, painted finish.; [Dating cues] Water damage and unraveling are common."
- ❌ cousin_contrasts: MISSING. Docx: "Paper fiber lacks the natural nodes and glossy skin of rattan. It may look like twisted cord rather than plant reed."
- ❌ regional_persistence_notes: MISSING. Docx: "Common in early 20th-century American wicker and porch furniture."
- ❌ related_form_types: MISSING. Docx: "Porch chairs, Lloyd Loom-type furniture, baby carriages, hampers, tables."

### ENTRY 37: Bamboo → upholstery_cover_type_bamboo

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Distinct rings/nodes, hollow cut ends, lacquered yellow/tan surface, sometimes faux-bamboo turning in wood."
- ❌ cousin_contrasts: MISSING. Docx: "Bamboo is hollow with nodes. Rattan is solid and more bendable. Faux bamboo may be wood or metal carved/turned to imitate bamboo."
- ❌ regional_persistence_notes: MISSING. Docx: "Coastal, porch, conservatory, Aesthetic Movement, tropical, and imported furniture contexts."
- ❌ related_form_types: MISSING. Docx: "Chairs, etageres, plant stands, tables, porch furniture, tropical revival furniture."

### ENTRY 38: Synthetic Resin Wicker → upholstery_cover_type_synthetic_resin_wicker

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Uniform color throughout, plastic sheen, aluminum frames, no natural fiber fray, UV cracking."
- ❌ cousin_contrasts: MISSING. Docx: "Resin wicker does not have natural nodes, fiber splits, or organic oxidation."
- ❌ regional_persistence_notes: MISSING. Docx: "Universal contemporary outdoor furniture."
- ❌ related_form_types: MISSING. Docx: "Outdoor patio seating, sofas, tables, loungers."

### ENTRY 39: Rayon → upholstery_cover_type_rayon

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "More fluid and shiny than cotton; less strong than nylon or polyester."
- ❌ regional_persistence_notes: MISSING. Docx: "Widespread in machine-made decorative upholstery."
- ❌ related_form_types: MISSING. Docx: "Art Deco chairs, 1930s to 1950s sofas, formal living room seating."

### ENTRY 40: Nylon → upholstery_cover_type_nylon

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Synthetic sheen, high abrasion resistance, melting rather than charring."
- ❌ cousin_contrasts: MISSING. Docx: "Nylon is tougher and more elastic than rayon. It usually lacks natural fiber irregularity."
- ❌ regional_persistence_notes: MISSING. Docx: "Mass-market and commercial American furniture."
- ❌ related_form_types: MISSING. Docx: "Commercial seating, office chairs, mid-century upholstery blends."

### ENTRY 41: Polyester → upholstery_cover_type_polyester

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Synthetic backing, uniform yarns, resistance to fading, pilling in some weaves."
- ❌ cousin_contrasts: MISSING. Docx: "Less breathable than cotton or wool. Often more uniform and plastic-feeling."
- ❌ regional_persistence_notes: MISSING. Docx: "Universal mass-market furniture."
- ❌ related_form_types: MISSING. Docx: "Sofas, recliners, dining chairs, office furniture, modern decorator upholstery."

### ENTRY 42: Acrylic → upholstery_cover_type_acrylic

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Soft synthetic hand, fuzzy pilling, bright color retention."
- ❌ cousin_contrasts: MISSING. Docx: "Acrylic imitates wool but lacks wool’s smell and burn behavior."
- ❌ regional_persistence_notes: MISSING. Docx: "Common in outdoor, sunroom, and casual domestic furniture."
- ❌ related_form_types: MISSING. Docx: "Patio cushions, casual upholstery, mid-century and later seating."

### ENTRY 43: Olefin / Polypropylene → upholstery_cover_type_olefin_polypropylene

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "More plastic-feeling and less absorbent than polyester or cotton blends."
- ❌ regional_persistence_notes: MISSING. Docx: "Mass-market, commercial, and outdoor furniture."
- ❌ related_form_types: MISSING. Docx: "Office furniture, family-room sofas, outdoor furniture, budget upholstery."

### ENTRY 44: Microfiber / Microsuede → upholstery_cover_type_microfiber_microsuede

**Status:** MAJOR

- ❌ wear_characteristics: MISSING. Docx: "[Dating cues] Period Pattern and Wear Cues Pattern Scale Large, formal repeats often support high-style or revival upholstery, especially damask, brocade, and tapestry.; [Dating cues] Color Cues Early natural dyes often fade unevenly and mute toward brown, tan, olive, or rust.; [Dating cues] Wear Patterns Seat-front abrasion, arm-top darkening, back-edge sun fade, tack-line tearing, and broken cane at the front rail are all meaningful.; [Dating cues] Original upholstery often shows age-consistent wear at attachment points;"
- ❌ cousin_contrasts: MISSING. Docx: "Imitates suede but lacks hide grain. More uniform than natural leather or suede."
- ❌ regional_persistence_notes: MISSING. Docx: "Widespread contemporary American furniture."
- ❌ related_form_types: MISSING. Docx: "Sofas, recliners, sectionals, dining chairs, family-room furniture."
- ⚠️ dating cues (decade/era markers): PARTIAL. Docx: "Markers in docx Dating cues not found in canonical period_associations/identifying_characteristics/style_associations: ['Colonial', 'Victorian', 'aniline']. Docx dating cues: Usually late 20th century to present. Period Pattern and Wear Cues Pattern Scale Large, formal repeats often support high-style or revival upholstery, especially damask, brocade, and tapestry. Small-scale florals may suggest cottage, Colonial Revival, Victorian domestic, or later country-style use. Oversized abstract patterns often point mid-20th century or later. Color Cues Early natural dyes often fade unevenly and mute toward brown, tan, olive, or rust. Bright aniline colors become more plausible after the mid-19th century. Synthetic jewel tones, avocado, harvest gold, burnt orange, teal, mauve, and gray-beige trend cycles can support 20th-century dating. Wear Patterns Seat-front abrasion, arm-top darkening, back-edge sun fade, tack-line tearing, and broken cane at the front rail are all meaningful. Original upholstery often shows age-consistent wear at attachment points; replacement upholstery may look too clean relative to the frame. Attachment Evidence Hand tacks, square nails, rosehead nails, and irregular tack spacing can support older upholstery work. Staples usually indicate modern upholstery or repair. A frame with several generations of tack holes suggests repeated reupholstery, not original fabric. Backing Evidence Latex backing, foam lamination, synthetic scrim, plastic mesh, and black cambric dust covers generally point to 20th-century or later upholstery campaigns. Quick Identification Hierarchy For dating, do not"

### ENTRY 45: Stuffed Slip Seat → upholstery_construction_type_stuffed_slip_seat

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Separate seat frame, fabric tacked underneath, old tack holes around perimeter, compact padding, no coil or serpentine springs.; [Dating cues] Original early slip seats often show hand-cut seat frames, early tacks, uneven tack spacing, and compressed natural stuffing."
- ❌ cousin_contrasts: MISSING. Docx: "Different from sprung upholstery because there is no spring foundation. Different from cane or rush because the surface is upholstered rather than woven as the seat itself."
- ❌ related_form_types: MISSING. Docx: "Side chairs, dining chairs, early armchairs, Federal chairs, Empire chairs, Victorian dining chairs, Colonial Revival chairs."

### ENTRY 46: Stuffed Over-the-Rail Upholstery → upholstery_construction_type_stuffed_over_the_rail

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "More integrated than a slip seat. Less mechanically resilient than spring upholstery."
- ❌ related_form_types: MISSING. Docx: "Early armchairs, wing chairs, easy chairs, settees, sofas."

### ENTRY 47: Linen, Hemp, or Jute Webbing → upholstery_construction_type_linen_hemp_jute_webbing

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Webbing is hidden support, not visible upholstery. It differs from canvas because it is strap-based, not a continuous sheet."
- ❌ related_form_types: MISSING. Docx: "Upholstered chairs, sofas, settees, ottomans, benches."

### ENTRY 48: Elastic Webbing → upholstery_construction_type_elastic_webbing

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] sagging or dried-out rubber.; [Unique characteristics] Stretchy rubberized or synthetic webbing replaces traditional fixed jute support."
- ❌ cousin_contrasts: MISSING. Docx: "Unlike jute webbing, elastic webbing stretches and rebounds. Unlike serpentine springs, it has no metal spring element."
- ❌ related_form_types: MISSING. Docx: "Mid-century chairs, Danish Modern seating, postwar sofas, recliners, contemporary furniture."

### ENTRY 49: Early Coil Spring Upholstery → upholstery_construction_type_early_coil_spring

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Different from serpentine springs because coils are individual vertical units. Different from no-spring upholstery because the seat has mechanical lift and bounce."
- ❌ related_form_types: MISSING. Docx: "Easy chairs, sofas, settees, parlor chairs, beds, mattresses, carriage seating."

### ENTRY 50: Hand-Tied Coil Springs → upholstery_construction_type_hand_tied_coil_springs

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Higher-grade than loose coils, sinuous springs, or stapled webbing. More labor-intensive than modern spring units."
- ❌ related_form_types: MISSING. Docx: "High-quality sofas, armchairs, wing chairs, club chairs, parlor suites, custom upholstery."

### ENTRY 51: Drop-In Spring Unit → upholstery_construction_type_drop_in_spring_unit

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Regular grid, machine uniformity, metal frame or edge wire, fewer hand knots, faster assembly."
- ❌ cousin_contrasts: MISSING. Docx: "More industrial and uniform than hand- tied spring work. Less individual adjustment."
- ❌ related_form_types: MISSING. Docx: "Factory sofas, chairs, mattresses, box springs, institutional furniture."

### ENTRY 52: Marshall Coil / Pocket Coil → upholstery_construction_type_marshall_pocket_coil

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Unlike tied coils, pocket coils are enclosed in textile sleeves. Unlike foam cushions, they have metal spring movement inside the cushion."
- ❌ related_form_types: MISSING. Docx: "Mattresses, sofa cushions, high-end loose cushions, some sleeper sofa systems."

### ENTRY 53: Sinuous / Serpentine Spring → upholstery_construction_type_sinuous_serpentine_spring

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Unlike coil springs, serpentine springs are horizontal zigzag wires. Unlike webbing, they are metal. Less labor-intensive than hand- tied coil springs."
- ❌ related_form_types: MISSING. Docx: "Sofas, lounge chairs, dining chairs, recliners, mid-century furniture, contemporary furniture."

### ENTRY 54: Platform Spring / No-Sag Spring → upholstery_construction_type_platform_no_sag_spring

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "More industrial than hand- tied coil springs; more rigidly standardized than jute webbing."
- ❌ related_form_types: MISSING. Docx: "Mid-century sofas, sleeper sofas, recliners, mass-market chairs."

### ENTRY 55: Horsehair → upholstery_construction_type_horsehair

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Horsehair is springier and coarser than cotton batting. It does not crumble like old foam. It is not the same as haircloth, which is a woven cover textile."
- ❌ related_form_types: MISSING. Docx: "Early upholstered chairs, Victorian seating, formal parlor chairs, sofas, quality traditional upholstery."

### ENTRY 56: Hog Hair, Cattle Hair, Goat Hair, and Mixed Animal Hair → upholstery_construction_type_mixed_animal_hair

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Usually less springy than high-quality horsehair. More irregular than cotton or kapok."
- ❌ related_form_types: MISSING. Docx: "Traditional chairs, sofas, benches, commercial upholstery."

### ENTRY 57: Tow → upholstery_construction_type_tow

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Tow is plant fiber, not animal hair. Less springy than horsehair. Coarser than cotton."
- ❌ related_form_types: MISSING. Docx: "Early upholstered seating, cushions, rural furniture."

### ENTRY 58: Straw, Hay, Excelsior, and Wood Wool → upholstery_construction_type_straw_hay_excelsior_wood_wool

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Straw pieces, curled wood shavings, coarse vegetable matter, brittle breakage."
- ❌ cousin_contrasts: MISSING. Docx: "Less resilient and lower-grade than horsehair. More irregular than cotton batting. Excelsior appears as thin curled wood shavings."
- ❌ related_form_types: MISSING. Docx: "Cheap chairs, mattresses, rural furniture, lower-grade Victorian and early 20th-century upholstery."

### ENTRY 59: Spanish Moss → upholstery_construction_type_spanish_moss

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] often brittle;"
- ❌ cousin_contrasts: MISSING. Docx: "Can be mistaken for horsehair. Spanish moss is plant fiber and often more brittle, wiry, and irregular."
- ❌ related_form_types: MISSING. Docx: "Southern seating, mattresses, lower-cost upholstery."

### ENTRY 60: Cotton Batting → upholstery_construction_type_cotton_batting

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Soft sheet-like batting, compresses flat, yellows with age."
- ❌ cousin_contrasts: MISSING. Docx: "Softer and flatter than horsehair. Does not have the coarse strand structure of tow or excelsior."
- ❌ related_form_types: MISSING. Docx: "Chairs, sofas, cushions, mattresses, later reupholstery."

### ENTRY 61: Kapok → upholstery_construction_type_kapok

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Very light, silky, yellowish fiber;"
- ❌ cousin_contrasts: MISSING. Docx: "Lighter and silkier than cotton. Less structured than hair."
- ❌ related_form_types: MISSING. Docx: "Cushions, pillows, mattresses, life-preserver-related goods, casual furniture cushions."

### ENTRY 62: Feather Fill → upholstery_construction_type_feather_fill

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Quills palpable through ticking, crunching sound, shifting fill, feather leakage through seams.; [Dating cues] Older feather cushions may have ticking covers, hand stitching, and compacted fill."
- ❌ cousin_contrasts: MISSING. Docx: "Feathers have quills and more structure than down. Unlike foam, they shift and require fluffing."
- ❌ related_form_types: MISSING. Docx: "Loose cushions, pillows, daybeds, sofas, wing chairs, high-comfort seating."

### ENTRY 63: Down Fill → upholstery_construction_type_down_fill

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Softer and more collapsible than feather fill. Less resilient than foam unless wrapped around a core."
- ❌ related_form_types: MISSING. Docx: "Luxury cushions, pillows, high-end sofas, lounge chairs."

### ENTRY 64: Feather-and-Down Over Foam → upholstery_construction_type_feather_and_down_over_foam

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "More structured than pure down. Softer surface than plain foam."
- ❌ related_form_types: MISSING. Docx: "High-end sofas, club chairs, sectionals."

### ENTRY 65: Latex Foam Rubber → upholstery_construction_type_latex_foam

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Rubbery feel, small holes or perforations, yellowing, hardening, cracking, rubber odor.; [Unique characteristics] Natural or synthetic rubber foam;"
- ❌ cousin_contrasts: MISSING. Docx: "More rubbery and resilient than polyurethane foam. Old latex may harden or crumble differently."
- ❌ related_form_types: MISSING. Docx: "Mid-century chairs, sofa cushions, mattresses, modernist seating."

### ENTRY 66: Polyurethane Foam → upholstery_construction_type_polyurethane_foam

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Open-cell foam, yellow/orange/brown oxidation, crumbling powder when degraded, uniform cut edges."
- ❌ cousin_contrasts: MISSING. Docx: "Unlike hair or cotton, foam is a synthetic cellular block. Unlike latex, it often feels less rubbery and breaks down into sticky or powdery crumbs."
- ❌ related_form_types: MISSING. Docx: "Sofas, chairs, recliners, dining seats, office furniture, cushions, modern upholstery."

### ENTRY 67: Polyester Fiberfill / Dacron Wrap → upholstery_construction_type_polyester_fiberfill_dacron

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Cleaner, whiter, and more uniform than cotton batting. Does not yellow or compact the same way as old cotton."
- ❌ related_form_types: MISSING. Docx: "Sofas, chairs, cushions, pillows, recliners."

### ENTRY 68: Memory Foam / Viscoelastic Foam → upholstery_construction_type_memory_foam

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Slower recovery than polyurethane or latex."
- ❌ related_form_types: MISSING. Docx: "Mattresses, recliners, modern cushions, ergonomic seating."

### ENTRY 69: High-Resilience Foam → upholstery_construction_type_high_resilience_foam

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "More durable and resilient than low-density foam."
- ❌ related_form_types: MISSING. Docx: "High-end sofas, modern lounge chairs, commercial seating."

### ENTRY 70: Burlap / Hessian Over Springs → upholstery_construction_type_burlap_hessian_over_springs

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Coarse tan woven fabric, often stitched to spring tops, brittle with age."
- ❌ cousin_contrasts: MISSING. Docx: "Coarser than muslin. More structural than dust cover."
- ❌ related_form_types: MISSING. Docx: "Sprung chairs, sofas, settees, ottomans."

### ENTRY 71: Linen Scrim → upholstery_construction_type_linen_scrim

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Finer and more controlled than burlap. Used for shaping, not just support."
- ❌ related_form_types: MISSING. Docx: "Traditional chairs, sofas, conservation upholstery."

### ENTRY 72: Muslin / Cambric → upholstery_construction_type_muslin_cambric

**Status:** PARTIAL

- ❌ cousin_contrasts: MISSING. Docx: "Finer than burlap; less structural than webbing."
- ❌ related_form_types: MISSING. Docx: "Undersides of chairs, sofas, cushion liners, dust covers."

### ENTRY 73: Hand Tacks → upholstery_construction_type_hand_tacks

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Irregular spacing, oxidized heads, multiple tack-hole generations, hand placement."

### ENTRY 74: Trim → upholstery_construction_type_decorative_brass_nails_nailhead_trim

**Status:** PARTIAL

- ❌ wear_characteristics: MISSING. Docx: "[Identifying elements] Brass or brass-colored nailheads along edges;"

### ENTRY 75: Staples → upholstery_construction_type_staples

**Status:** GOOD

- All checked fields populated (date_range_summary, wear_characteristics, cousin_contrasts, regional_persistence_notes, related_form_types, dating cues).
