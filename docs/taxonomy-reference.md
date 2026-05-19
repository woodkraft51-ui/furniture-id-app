# Furniture Form Taxonomy — Appraiser Reference

> **Status:** Documentation only. This document is not loaded by the engine.
>
> **History:** This three-tier taxonomy (Construction Logic → Family → Spatial Behavior) was originally authored as TypeScript constraint files (`constructionLogic.ts`, `families.ts`, `spatialBehaviors.ts`) intended to be resolved via foreign-key lookups at engine runtime. The engine evolved past that architecture: each form entry in `forms.ts` now inlines its own `family_id` and `spatial_behavior_id` as inert string tags, plus carries the substantive context directly on the entry itself (`distinguishing_features`, `cousin_form_contrasts`, `dimensional_thresholds`). The clue-level dating evidence lives in `toolmarks.ts`, `joinery.ts`, `fasteners.ts`, `finish.ts`, and `woodEvidence.ts`. The taxonomy below remains valuable as authoring reference — when adding a new form, the family and spatial-behavior categories below help establish which existing forms are its cousins, what dimensional ranges are typical, and what construction-logic disambiguation applies.
>
> **Use this document when:** authoring a new form entry, deciding which family and spatial behavior tag to assign, or looking up the canonical disambiguation between case / frame / surface / mechanical construction logics.

---

## Tier 1: Construction Logic

Four construction logics span the American antique furniture domain. Each form belongs to exactly one logic.

### I. Case Construction `construction_case`

Case construction refers to furniture built around a rigid, enclosed structural box (carcass) that defines and contains internal storage volume. The carcass is the primary load-bearing structure, and all functional elements — drawers, doors, shelves — operate within or are attached to this enclosure. **Storage is the defining purpose; the box exists to contain.**

**Shared construction characteristics**
- Continuous outer shell formed by sides, top, bottom, and back panels
- Enclosed internal volume that defines storage capacity
- Load distributed through panel-and-box construction rather than frame skeleton
- Storage accessed via drawers, doors, or hinged lids
- Joinery emphasizes box integrity: dovetails at corners, dados for shelf and divider seating, rabbets for back panels and case joints, mortise-and-tenon for any frame-and-panel sections
- Drawer construction integrated into the carcass via runners, dust panels, or kicker boards
- Back panel construction varies (full, inset, or partial) but contributes to case rigidity

**Identifying elements**
- Solid or veneered side panels forming vertical walls
- Top and bottom panels enclosing the structure
- Back panel — full, inset, or partial — visible from rear
- Interior cavity with subdivisions (drawer dividers, shelves, partitions)
- Joinery visible at case corners (dovetails) and shelf/divider seating (dados, rabbets)
- Frame-and-panel sections may appear in doors or large back panels with mortise-and-tenon joinery

**Functional behavior.** Enclosed storage and protection of contents within a defined internal volume. The structure exists to enclose, divide, and protect.

**Historical evolution**
- **Pre-1700:** American case furniture is not yet fully carcass-based. Best understood as joined frame-and-panel construction with enclosed function — transitional between frame and later case construction. Wood: New England oak/pine; Mid-Atlantic oak with occasional walnut.
- **1700–1820 (Colonial to Federal):** Hand-cut dovetails and mortise-and-tenon. Case sides typically thick solid wood. Drawer bottoms set in grooves and nailed. Woods vary regionally — New England maple/cherry/pine; Mid-Atlantic walnut. Often overbuilt due to hand-tool limitations.
- **1820–1860 (Empire and Early Industrial):** Veneered surfaces over secondary woods introduced. Increased mahogany and walnut veneer. Larger case forms with standardized proportions. Early mechanization influences saw marks and uniformity.
- **1860–1900 (Victorian Industrial Expansion):** Widespread machine-cut dovetails. Standardized drawer and carcass dimensions. Multiple compartments, mirrored backs. Mass-produced hardware. Oak becomes dominant.
- **1900–1945:** Ornamental simplification in some styles. Plywood panels and early composites introduced. Joinery shifts toward dowels and mechanical fasteners. Factory assembly systems.
- **1945–present:** Particle board, MDF, laminates. Joinery often minimized (staples, cam locks). Modular manufacturing.

> *Note: Specific datable construction features (dovetail evolution, drawer bottom evolution, plywood adoption, mechanical fastener emergence) live in `toolmarks.ts`, `finish.ts`, `joinery.ts`, `fasteners.ts`, and `woodEvidence.ts` for engine clue-level reasoning. This narrative is synthesis-level.*

**Disambiguation from other logics**
- *Not open skeletal structure* — distinguishes case from frame (CL II), which is a post-and-rail skeleton supporting the body rather than an enclosed box
- *Not defined by surface plane* — distinguishes case from surface forms (CL III), where primary identity is a working surface supported by legs or trestles
- *Not dependent on mechanical systems* — case may include hardware but primary purpose is containment, not mechanism

---

### II. Frame Construction `construction_frame`

Frame construction refers to furniture built from a skeletal system of joined linear members, where structure is defined by posts, rails, and supports. Load is carried through joinery intersections rather than panel-and-box walls. **The structure is open and skeletal; surfaces and upholstery are applied to or supported by the frame.**

**Shared construction characteristics**
- Open skeletal structure composed of legs, rails, stretchers, and posts
- Load carried through joinery intersections rather than enclosing panels
- No enclosing shell — negative space visible between structural members
- Joinery emphasizes joint integrity: mortise and tenon (primary, often pinned with wooden pegs in earlier periods), dowels (later periods)
- Surfaces (seats, backs, applied panels) added to the frame as functional or decorative; they do not contribute primary structural integrity
- Upholstery, when present, applied to the frame rather than integrated into structural members

**Identifying elements**
- Visible leg systems with clear post-and-rail relationships
- Exposed joinery at structural intersections — mortise-and-tenon, dowels, sometimes visible pegs in earlier work
- Open negative space between structural members
- Applied surfaces or upholstery distinguishable from the structural frame underneath
- Stretchers connecting legs at lower height for additional rigidity (especially earlier and rural production)

**Functional behavior.** Body support and distributed load-bearing through skeletal structure. Maximum support with minimum material, achieved through joinery integrity.

**Historical evolution**
- **Pre-1700 (Colonial / Joined Construction):** Heavy reliance on large hand-cut mortise-and-tenon, often pegged. Panels set into grooves as non-load-bearing infill. Drawers rare until late 1600s; when present, crude hand-cut dovetails and nailed bottoms. Wood: New England oak/pine; Mid-Atlantic oak. Stock thick and heavy. Visible tool marks common.
- **1700–1820:** Dominated by mortise-and-tenon. Hand-shaped components. Style-construction coupling notable: William and Mary and Queen Anne tracked closely with frame-construction refinement. Woods: maple, oak, walnut.
- **1820–1860:** Refinement of curves and shaping. Early steam bending. Greater stylistic diversity.
- **1860–1900:** Industrialization allows turned and repeated parts. Bentwood techniques (notably chairs). More standardized.
- **1900–1945:** Machine precision increases. Dowel joinery and early metal fasteners. Upholstery becomes more integrated with frame design.
- **1945–present:** Tubular steel, molded plywood, plastics. Frame may be partially or fully concealed. Engineered materials.

**Disambiguation from other logics**
- *Not enclosed storage* — frame has open negative space, no enclosing structure
- *Not planar surface-dominant* — frame's primary identity is the skeletal structure itself, even when surfaces (seats, backs) are present
- *Not system-driven* — frame may include moving parts (rocker runners) but the primary purpose is body support

---

### III. Surface Forms `construction_surface`

Surface construction refers to furniture whose primary identity is a working plane, supported by a structural base. The plane — horizontal (table tops, work surfaces) or angled (drafting surfaces) — is the form's defining functional element; the base exists to support and elevate the plane. **Storage, when present, is secondary to the surface itself.**

**Shared construction characteristics**
- Dominant horizontal or angled surface as the form's primary functional element
- Surface supported by a base structure: legs, pedestal, or trestle
- Minimal or no enclosed storage; storage when present is secondary (drawers in a frieze, shelves under a top) rather than defining
- Joinery emphasizes surface-to-base attachment: cleats, breadboard ends, pegged mortise-and-tenon, wedges and screws in later periods
- Surface plane typically thicker stock than supporting members, especially earlier periods
- Edge treatments (breadboard ends, applied moldings, edge profiles) often diagnostic of period and quality

**Identifying elements**
- Large continuous top forming the visual and functional center
- Structural support beneath — visible legs, pedestal column, trestle base, or stretcher system
- Joinery focused on surface attachment rather than enclosed-volume integrity
- Surface edges and edge treatments visible from the side
- Negative space beneath — distinct from case construction's enclosed volume

**Functional behavior.** Provides a working plane to support activities: dining, writing, working, food preparation, drafting, gaming.

**Historical evolution**
- **Pre-1700:** Thick solid wood tops supported by simple frame or trestle bases. Heavy pegged mortise-and-tenon connecting tops to bases. Wide planks common. Breadboard ends occasionally used but not standardized. Wood: New England oak/pine; Mid-Atlantic oak.
- **1700–1820:** Solid wood tops dominate. Breadboard ends become common. Heavy, durable construction.
- **1820–1860:** Veneered tops increase. More refined edge profiles. Expansion tables introduced (sliding mechanisms for leaves).
- **1860–1900:** Mechanical expansion systems improve. Turned and carved bases. Increased ornamentation.
- **1900–1945:** Simplification in some styles (Arts and Crafts). Plywood cores. Functional design gains importance.
- **1945–present:** Laminates and synthetics. Metal brackets and fasteners. Lightweight construction.

**Disambiguation from other logics**
- *Not enclosed storage* — surface forms have negative space beneath, no enclosing structure
- *Not skeletal frame structure* — in surface forms the base supports the plane; in frame construction the frame IS the structure
- *Not system-driven* — surface forms may incorporate mechanical features (expansion mechanisms, tilt-tops, drop-leaves) but the primary purpose is the surface itself

---

### IV. Mechanical / Integrated Systems `construction_mechanical_integrated`

Mechanical construction refers to furniture whose function depends on integrated systems or engineered movement beyond basic joinery. **The mechanism is the form's defining purpose: without the mechanism, the piece is not what it is.** This distinguishes CL IV from forms in other construction logics that may incorporate mechanical features (expansion tables, drop-leaves, roll-top tambours) without being defined by them.

**Shared construction characteristics**
- Internal mechanical systems integral to the form's function
- Movement, transformation, or sound production as the form's purpose, not as a feature
- Structure exists primarily to support, house, and protect the mechanism
- Internal compartments specifically dimensioned and reinforced for mechanism placement
- Access panels designed for mechanism maintenance and repair
- Joinery and structure often more complex than equivalent non-mechanical forms

**Identifying elements**
- Visible moving systems: tracks, gears, tambours, bellows, pedals, escapements
- Internal compartments housing mechanisms (often visible through removed panels)
- Access panels designed for opening rather than for structural enclosure
- Mechanical hardware integrated into the structure (mounting brackets, pivot points, action mounts)
- Form factor often determined by mechanism requirements (pump organ keyboard depth driven by reed-block dimensions, clock case height driven by pendulum requirements)

**Functional behavior.** Performs specialized actions through integrated mechanical systems: sound production (pump organs, pianos, phonographs, radios), time measurement (clocks), or other engineered transformations.

**Historical evolution**
- **Pre-1700:** No true integrated mechanical systems; function relies on joinery and basic hardware. Simple hinges, locks, latches. Lift-top chests and early fall-front writing surfaces (late 1600s). Hardware typically hand-forged iron, surface-mounted. Absence of complex mechanical behavior is itself a diagnostic indicator.
- **1700–1820:** Early mechanical desks emerge (slant-front, fall-front), though as desks with mechanical features rather than CL IV forms proper.
- **1820–1860:** Increased mechanical complexity; concealed compartments with spring or hidden-release systems. CL IV proper begins to emerge with early American clock production.
- **1860–1900 (Mechanical Innovation Peak):** Pump organs reach peak production. Tall case clock movement refinement. Early phonograph mechanisms by late 1880s, mature post-1890.
- **1900–1945:** Industrial components accelerate integration. Springs and metal tracks. Phonograph and radio cabinets emerge as mature CL IV forms.
- **1945–present:** Decline in complex mechanical furniture as electronics replace mechanical sound production and clocks shift to quartz. Some resurgence in specialized modern designs.

**Disambiguation from other logics**
- *Mechanism as form-defining purpose vs. mechanism as feature.* CL IV requires the mechanism to BE the defining purpose. Roll-top desks, cylinder desks, expansion tables, drop-leaf tables incorporate mechanical features but their underlying forms exist independently of the mechanism — these belong in their structural construction logic (typically CL III) with mechanism captured as a distinguishing feature.
- *Not purely structural* — distinguishes CL IV from case/frame/surface where structure exists to enclose, support, or provide a surface
- *Not defined by storage, support, or surface alone* — CL IV may incorporate elements of all three but none is the form's defining purpose; the mechanism is

---

## Tier 2: Family

Twelve families. Each family belongs to exactly one construction logic. Each form belongs to exactly one family.

### Under Case Construction (CL I)

#### family_bedroom_clothing_storage — Bedroom and Clothing Storage Cases

Furniture designed for daily personal interaction with clothing, grooming, and rest. Typically lives in bedrooms, dressing rooms, and private domestic spaces. Supports storing folded garments, hanging clothing, dressing and grooming, organizing personal effects, and supporting rest. Individual-use furniture scaled to a single person or household member.

**Family characteristics**
- Designed for repetitive daily use, often multiple times per day
- Scaled for private-room placement, not public display
- Storage oriented toward clothing and personal accessories
- Frequently positioned along walls; bedside placement common for support furniture
- Often part of matched bedroom suites, especially post-19th century
- Combines functional storage with ergonomic access (height, reach, surface use)
- May incorporate drawers, enclosed cabinets, mirrors, hanging interiors, basin surfaces, or sleeping platforms

#### family_dining_service_storage — Dining and Service Storage Cases

Furniture designed for food service, storage, and dining-related organization. Typically lives in dining rooms, service areas, occasionally kitchens or transitional spaces. Supports serving meals, storing tableware/linens/serving items, staging food and drink. Shared-use furniture, often used during social or family gatherings.

**Family characteristics**
- Designed for multi-user interaction, often during events or meals
- Frequently positioned along walls in public-facing rooms
- Storage oriented toward dishes, glassware, linens, serving equipment
- Often integrated into suite production, especially late 19th to early 20th century
- Combines storage, display, and service surface
- May include drawers, cabinets, open display areas, specialized compartments (cellarette compartments, bottle drawers, divided serving storage)

#### family_general_storage_specialty — General Storage and Specialty Cases

Furniture designed for specialized storage, display, or organization beyond clothing or dining functions. Appears throughout the home — living rooms, offices, kitchens, utility areas. Supports storing books, documents, or tools, displaying objects, and organizing specialized items.

**Family characteristics**
- Function-driven rather than room-specific
- Storage is content-specific, not general-purpose
- May emphasize visibility (display), segmentation (compartments), or accessibility (open systems)
- Often reflects specialized user needs rather than general household routines
- Range spans highly utilitarian (pie safe, hoosier cabinet, filing cabinet) to decorative (curio cabinet, étagère, whatnot)

### Under Frame Construction (CL II)

#### family_seating — Seating Furniture

Furniture designed to support the human body in a seated or reclining position. Used throughout the home — living rooms, dining rooms, bedrooms, offices.

**Family characteristics**
- Built to support body weight and posture
- Designed for direct human contact and comfort
- Scaled to individual use or shared seating
- May incorporate upholstery, cushions, or ergonomic shaping
- Often arranged in relation to tables or conversation groupings
- Strong relationship between structure, comfort, and intended duration of use

### Under Surface Forms (CL III)

#### family_tables — Tables

Furniture designed to provide a stable working or supporting surface. Used throughout the home for dining, working, writing, and display.

**Family characteristics**
- Defined by a dominant usable surface plane
- Designed for interaction above the structure
- Height and scale correspond to seated or standing use
- Minimal reliance on enclosed storage
- Often positioned centrally (dining, center tables) or against walls (console, sofa tables)

#### family_desks — Desks

Furniture designed for writing, administrative work, and intellectual tasks. Typically lives in offices, studies, and bedrooms.

**Family characteristics**
- Combines surface function with storage or organization
- Designed for seated use and task-focused interaction
- Often includes drawers, compartments, and writing surfaces
- May incorporate privacy features or enclosed workspaces
- *Hybrid CL III/CL IV decision:* desks with mechanical concealment such as roll-top and cylinder desks belong here as forms with mechanical features, not in CL IV

### Under Mechanical / Integrated Systems (CL IV)

#### family_musical_mechanical — Musical and Mechanical Furniture

Musical and mechanical furniture designed to house, support, present, or enable integrated mechanical, electronic, electromechanical, or acoustic systems where the mechanism is the form's defining purpose. Encompasses nine form groupings spanning colonial-era spinning wheels and looms through Federal-era square pianos and pump organs, Victorian player pianos, mid-century radio/television/stereo consoles, late-20th-century media storage and integrated entertainment systems, present-day interactive consoles and VR stations.

> *Pump organ cousin note:* `form_pump_organ_cabinet` (pre-existing canonical from Sessions 2-5) belongs in this family per D-MM4. Pump organ is excluded from `form_musical_instrument_furniture`'s subtypes to preserve `form_pump_organ_cabinet`'s standalone canonical content.

**Family characteristics**
- Function depends on integrated internal systems
- Structure serves as housing and support for the mechanism
- Interaction involves operation, adjustment, or activation

#### family_industrial_professional — Industrial / Professional

Industrial, institutional, commercial, and professional furniture designed for workplace, public-service, religious, retail, educational, scientific, and operational contexts. Workstations, fixtures, lockers, racks, shelving systems, ceremonial furnishings, scientific equipment stands, commercial display cases, environmental control cabinets.

> *CL assignment note:* `construction_mechanical_integrated` is used as the catch-all reflecting the housed-functional nature of most Industrial/Professional forms (lockers with locking mechanisms, time clocks, bank vault doors, charging lockers, scientific stands). Smallest semantic stretch given that most forms genuinely embody mechanical/integrated systems.

**Family characteristics**
- Designed for task efficiency and durability
- Often utilitarian in form
- Scaled to specific professional activities

#### family_clock_cases — Clock Cases

Horological clock case forms designed to house, present, and protect weight-driven, spring-driven, or pendulum-regulated clock movements across floor-standing, wall-mounted, and surface-set configurations. Tall case clocks (longcase grandfather / grandmother / granddaughter), wall clocks (banjo, gallery, regulator, schoolhouse, calendar), shelf clocks (mantel, tambour, novelty). Distinguished by the clock movement as form-defining purpose.

> *CL assignment note:* `construction_mechanical_integrated` is the cleanest fit of any family to CL IV's intended scope. Where other families use CL IV as catch-all, Clock Cases represents the canonical case for which the construction logic was originally designed. Clock Cases anchors CL IV at its center.

**Family characteristics**
- Structure designed around internal clock movement
- Combines functional housing and decorative presentation
- Often tall or wall-mounted

#### family_entry_support_forms — Entry and Support Forms

Furniture designed to support entryway function and personal organization, typically located near entrances.

**Family characteristics**
- Designed for transitional use (entering or leaving the home)
- Supports garments, accessories, and small personal items
- Often compact and vertically oriented

#### family_baskets — Baskets

Portable woven container furniture forms — baskets — constructed primarily through interwoven flexible materials rather than rigid joinery. Agricultural, domestic, commercial, textile, decorative, and maritime basket forms. Distinguished from rigid container forms by woven construction, flexibility, and typical hand-portability.

> *CL assignment note:* `construction_mechanical_integrated` is used as a semantic catch-all pending future architectural review. Baskets are not literally mechanical/integrated, but the four-logic ordinal taxonomy is closed-by-design and doesn't contain a woven-construction logic. Future architectural review may consolidate Baskets with Box Form into a "Container Forms" family or extend the construction logic taxonomy to include `construction_woven`. Semantic stretch acknowledged here rather than hidden.

#### family_lighting — Lighting

Lighting furniture forms providing artificial illumination through flame, gas, or electric light sources. Freestanding floor-set (torchères, floor lamps), surface-set (table lamps, candelabra), wall-mounted (sconces, gas brackets), and suspended (chandeliers, lanterns, pendants).

> *CL assignment note:* `construction_mechanical_integrated` reflects the housed-functional nature of lighting forms (burner mechanisms, gas piping, electric components integrated into structural form).

---

## Tier 3: Spatial Behavior

Seventy-six spatial behaviors. Each behavior is scoped to one family. Each form belongs to exactly one spatial behavior.

### Under family_bedroom_clothing_storage (6 behaviors)

#### Horizontal Storage Forms (Dressing Cases) `spatial_horizontal_storage`
Spreads storage across width to support frequent, direct interaction with clothing and grooming. Prioritizes accessibility and surface usability over maximum capacity.
- Width-dominant proportions · Case height 30–38" · Multi-column drawer layouts · Broad usable top · Often associated with mirrors
- **Dimensions:** H 30–38", W 42–72", D 18–24"

#### Vertical Storage Forms (Stacked Drawer Cases) `spatial_vertical_storage`
Stacks storage vertically to maximize capacity within a limited footprint. Prioritizes volume efficiency over surface interaction.
- Height-dominant proportions · Single-column or stacked drawer configurations · Continuous vertical drawer rhythm · Limited surface usability
- **Dimensions:** H 42–70", W 24–40", D 18–22"

#### Clothing Enclosure Forms (Hanging Storage) `spatial_clothing_enclosure`
Encloses vertical space to support hanging garments, shifting storage from folded to suspended organization.
- Tall cabinet form · Door-based access · Internal hanging volume · Shelving or drawers secondary
- **Dimensions:** H 65–85"+, W 36–60", D 20–28"

#### Sleep Furniture `spatial_sleep_furniture`
Supports the body in a horizontal resting position; serves as the primary anchor of the bedroom environment.
- Rectangular support frame · Load distributed across rails, slats, or platform · May include vertical posts or canopy structures
- **Dimensions:** W 36–78"; length typically 75–84"; height highly variable by period and form — platform/low beds 12–20" frame height, standard bedsteads 18–30" to mattress support, four-poster/tester beds 60–84"+ total height. Variation driven by mattress type, period style, and construction method rather than strict standardization.

#### Bedside Furniture `spatial_bedside_furniture`
Provides immediate-access support adjacent to the bed for transitional states (waking, resting).
- Small footprint · Low height relative to bed · Combination of surface and limited storage
- **Dimensions:** H 24–30" (often aligned with or slightly below mattress height), W 16–30", D 12–20"

#### Personal Hygiene / Dressing Support `spatial_personal_hygiene`
Supports grooming and hygiene activities, emphasizing use over storage. Includes pre-plumbing washing forms (washstand) and grooming-station forms (dressing table).
- Active-use surface · Often paired with mirrors or basin accommodation · Storage secondary and accessory-focused
- **Dimensions:** Height aligned with standing use (washstand) or seated use (dressing table); depth sufficient for basin or grooming tools

### Under family_dining_service_storage (5 behaviors)

#### Distributed Storage Forms (Span-Based) `spatial_distributed_storage`
Distributes storage across width to support simultaneous access and service during meals.
- Long horizontal span · Multiple storage zones · Surface used for staging
- **Dimensions:** Width often >60"; height similar to dresser range (34–40" at serving surface)

#### Integrated Cabinet Storage Forms `spatial_integrated_cabinet_storage`
Consolidates storage into a single unified cabinet mass, emphasizing capacity and enclosure.
- Vertical integration of compartments · Cabinet-dominant structure · Reduced emphasis on surface span
- **Dimensions:** Moderate height and width; depth often greater than sideboards

#### Auxiliary Service Forms `spatial_auxiliary_service`
Supports secondary or flexible service functions, often supplementing larger storage pieces.
- Reduced scale · Surface plus limited storage · Mobility or repositioning common
- **Dimensions:** Smaller than primary service forms; height aligned with serving surfaces

#### Display and Storage Hybrids `spatial_display_storage_hybrid`
Combines visible display with enclosed storage, balancing presentation and protection.
- Glazed upper sections · Enclosed lower storage · Vertical composition
- **Dimensions:** Height greater than width in many examples; upper-to-lower division common

#### Specialized Storage `spatial_specialized_storage`
Organizes space around single-purpose or narrowly defined storage functions; form driven by specific requirements of what is being stored.
- Internal configuration driven by specific contents · Compartments tailored to size/shape/quantity of stored items · May include fixed partitions, adjustable shelving, ventilation, or containment features · External form may resemble standard case construction but internal layout is function-specific
- **Dimensions:** No fixed proportional system; varies with contents

### Under family_general_storage_specialty (4 behaviors)

#### Open Storage Systems `spatial_open_storage_systems`
Direct visibility and access, prioritizing display and accessibility.
- Open shelving · Minimal enclosure · Vertical or modular stacking
- **Dimensions:** Variable; often height-dominant

#### Compartmentalized Storage `spatial_compartmentalized_storage`
Organizes items into highly segmented internal divisions, emphasizing categorization.
- Multiple small compartments · Repetitive internal structure
- **Dimensions:** Often grid-like proportional systems

#### Display Cabinets `spatial_display_cabinets`
Prioritizes visual presentation of stored objects, often in protected environments.
- Glazing · Controlled interior space · Shelving optimized for display
- **Dimensions:** Vertical emphasis common

#### Utility Storage `spatial_utility_storage`
Practical, task-driven storage, often in working environments.
- Durable construction · Functional layouts · Minimal decorative emphasis
- **Dimensions:** Highly variable

### Under family_seating (9 behaviors)

#### Upright Single-User Seating `spatial_single_user_seating`
One individual in upright seated position with full back support. Task-oriented or formal rather than lounge-relaxed.
- Seat, back, and leg system · Upright posture · Conventional frame construction · Back support structurally meaningful · Seat height typically 16–19"
- **Dimensions:** Seat H 16–19" (bar chairs 28–32"), overall H 30–42", seat W 16–24", seat D 15–22"

#### Motion Seating `spatial_motion_seating`
Single-user seating with controlled motion mechanism — rocking, gliding, swiveling, or pivoting. Motion mechanism structurally defining.
- Curved rockers, platform mechanism, glider linkage, or swivel base · Back support typically present · Frame construction supports both seating and motion · Motion mechanism structurally integral
- **Dimensions:** Seat H 15–19", overall H 35–48", W 20–32", D 28–42" including rocker runners; platform rockers and upholstered glider rockers often 50–100 lbs

#### Upholstered Lounge Seating `spatial_upholstered_lounge_seating`
Single-user comfort-oriented seating with deep upholstery, relaxed posture, substantial cushioning. Lower seat than upright single-user.
- Single-user upholstered · Deep seat and relaxed posture · Substantial upholstery · Arms commonly present · May include adjustable back, reclining mechanism, or wing structure
- **Dimensions:** Seat H 14–19", W 24–40", D 28–45", overall H 28–42"; recliners and large lounge chairs may exceed 150 lbs

#### Multi-User Upholstered Seating `spatial_multi_user_seating`
Multi-user upholstered seating for 2+ occupants with shared structural support. Covers formal upright (settee scale, exposed-frame) and lounge multi-user (sofa scale, deep seat).
- Multi-user capacity (typically 2–4) · Shared structural support across seat width · Upholstered seat and back · Arms commonly present · Width substantially exceeds single-user
- **Dimensions:** W 42–96"+ (settee 42–72", loveseat 48–72", standard sofa 72–96", sectional 90–150"+); seat H 16–20", D 20–45"; sleeper/reclining sofas may exceed 350 lbs

#### Reclining or Extended Seating `spatial_reclining_extended_seating`
Horizontal or near-horizontal body posture with extended-leg or reclined orientation. Chaise longue forms (one-person reclining) and daybed forms (mattress-like horizontal surface).
- Elongated horizontal seat surface · Reclining/semi-reclining/extended-leg posture · May have back at one end, asymmetrical configuration, or partial back along one long side · Length 60–84" typical
- **Dimensions:** L 60–84", W 24–42", seat/mattress H 14–24"; daybeds approach twin-bed scale (72–80" L, 30–42" W)

#### Bench Seating `spatial_bench_seating`
Elongated seating supporting one or more users, structurally simpler than upholstered multi-user. May be backless (basic bench), backed (settle, hall bench, garden bench), storage-bearing, or context-specific (piano, dining, window bench).
- Elongated seat · Simpler frame construction than upholstered multi-user · May be backless, backed with simple rail, or backed with panel/enclosed back (settle) · Arms absent, simple posts, or fully panel-enclosed · Surface may be wood plank, upholstered, hinged storage lid, or context-specific
- **Dimensions:** L 36–96"+ (institutional/church benches longer), seat H 16–19", D 14–24", overall H with back 30–60"; stone/cast iron/settle/church/outdoor benches may exceed 300 lbs

#### Compact Single-User Support `spatial_compact_single_user_support`
Compact seating or foot-support furniture without full back. Stools (no back, varying heights) and ottomans/footstools (foot-support and lounge-zone hybrid).
- Compact single-user footprint · No full back (stool) or no back at all (footstool/ottoman) · Three-leg / four-leg / pedestal / swivel / frameless support base · Footrest or stretcher may be present on taller stools · Ottomans often upholstered; stools often hard-surface
- **Dimensions:** H varies dramatically — low stool/footstool 10–16", standard stool 16–19", counter stool 24–27", bar stool 28–32", ottoman 12–18"; W/diameter 12–24" stools, 20–48" ottomans

#### Modern Casual Seating `spatial_modern_casual_seating`
Late-20th and 21st century casual seating with frameless, semi-frameless, or alternative-frame structures supporting relaxed body postures. **All forms have explicit form-emergence dates from c. 1938 onward.**
- Frameless / semi-frameless / alternative-frame · Relaxed posture (often near-floor or low) · Filled-bag (bean bag), bowl-and-cushion (papasan), or suspended sling (butterfly/sling) · Often lightweight · None exist pre-1938
- **Dimensions:** Bean bag 28–60" diameter, 18–36" H, 5–60 lbs · Papasan 36–54" bowl diameter, 12–18" seat H · Butterfly/sling 26–36" W, 12–18" seat H, 8–40 lbs

#### Outdoor Specialty and Institutional Seating `spatial_outdoor_specialty_institutional_seating`
Seating with structurally-distinct identity tied to specific outdoor or institutional contexts. Adirondack (plank construction with sloped seat and wide arms), porch/lawn glider (mechanical motion), pew (row-mounted with end panels and book racks), theater/auditorium seat (folding seat pan with cast-iron standards).
- Structurally-distinct outdoor or institutional design · Plank construction with sloped seat and wide arms (Adirondack) · Glider mechanism on suspended or geared base · Row-mounting with end panels and book racks (pew) · Folding seat pan with cast-iron/steel standards (theater)
- **Dimensions:** Adirondack — front seat 12–16", H 34–40", W 28–34" · Porch glider — W 24–72", seat H 15–19" · Pew — L 48–144", seat H 16–19", back H 32–42" · Theater seat — 18–24" per seat, seat H 16–19"

### Under family_tables (5 behaviors)

#### Dining Tables `spatial_dining_tables`
Supports shared meal activity, central to social interaction.
- Large central surface · Stable support system
- **Dimensions:** Height aligned with seated dining (typically 28–30")

#### Expandable Tables `spatial_expandable_tables`
Allows surface area to increase as needed.
- Hinged or extendable sections · Movable components
- **Dimensions:** Variable based on configuration; closed and extended dimensions differ substantially

#### Central Support Tables `spatial_central_support_tables`
Uses a central structural system to support the surface.
- Pedestal or central base · Reduced perimeter supports
- **Dimensions:** Variable

#### Auxiliary Tables `spatial_auxiliary_tables`
Supports secondary or supplemental surface needs.
- Smaller scale · Often movable
- **Dimensions:** Compact relative to dining or central support tables

#### Specialty Surface Tables `spatial_specialty_surface_tables`
Designed for specific surface-based activities.
- Purpose-built surfaces · Unique configurations
- **Dimensions:** Activity-dependent

### Under family_desks (12 behaviors)

#### Portable Writing Forms `spatial_portable_writing_forms`
Compact, transportable writing furniture designed for use in transit, in the field, or in temporary settings. Distinguished from Open Writing Stations by reduced scale and built-in transport features (handles, hinges, knockdown construction, fitted carrying cases).
- Portable, transportable, or relocatable construction · Reduced scale · Hinged/folding/knockdown/fitted-case construction common · Writing surface may be lid-of-box (writing box), removable panel (tabletop desk), or fold-out (field desk) · Storage integrated into transport structure · Supports repeated assembly/disassembly or transport
- **Dimensions:** Writing boxes 12–20" W × 8–14" D × 4–8" H closed · Tabletop desks 18–30" W × 12–20" D × 6–12" H · Field desks 24–54" W when assembled · Weight typically 5–40 lbs

#### Open Writing Stations `spatial_open_writing_stations`
Open accessible writing surface and visible storage organization for fixed-location use without enclosed mechanisms. Bureau plat (French neoclassical flat-top with leather inset), bonheur du jour (French ladies' writing with cabinet superstructure), kidney desk, Carlton House desk.
- Open accessible writing surface · Fixed-location · Drawers/frieze drawers/cabinet compartments visible or accessible · Writing surface often has leather inset, tooled leather panel, or specialized writing finish · Period-specific decorative elements common · Scale supports seated single-user writing
- **Dimensions:** W 36–72" by form — bureau plat 50–72", bonheur du jour 28–40", kidney 42–60", Carlton House 48–66"; D 22–36"; H 28–32" at writing surface; bonheur du jour and Carlton House superstructures extend overall H to 38–50"; weight 60–180 lbs

#### Kneehole Workstations `spatial_kneehole_workstations`
Central knee opening flanked by drawer pedestals. Traditional kneehole desks, pedestal desks, Davenport desks (small portable English form with sloped writing surface and side drawers), executive desks (large pedestal variants), credenza desks.
- Central knee opening · Drawer pedestals on either side · Writing surface spans pedestals and over kneehole · Often full-depth drawers (3–4 per side) · May include central drawer above kneehole · Scale supports professional/office single-user work · Often part of suite configurations
- **Dimensions:** W 48–72" standard, 60–84" executive; D 28–36"; H 28–31"; Davenport substantially smaller (18–24" W × 18–24" D); weight 80–300 lbs, executive and steel tanker variants 350+ lbs

#### Fall-Front / Drop-Front Enclosed Desks `spatial_fall_front_drop_front_enclosed_desks`
Hinged front panel drops or falls forward to reveal a writing surface and concealed interior. Slant-front, fall-front, secretary desks (combined desk + bookcase superstructure), escritoires, secrétaires à abattant (tall vertical French Empire/Restoration), bureau à gradins (tiered stepped-shelf superstructure).
- Hinged front panel drops or falls forward · Slant-front geometry (sloped face when closed) or fall-front geometry (vertical face when closed) · Concealed interior with pigeonholes, small drawers, document slots · Often lock or latch · Lower case typically contains storage · Optional upper superstructure (bookcase, gradins) · Writing surface revealed only when opened
- **Dimensions:** W 36–48", D 20–28" closed; H varies dramatically — slant/fall-front 42–52", secretary (with bookcase) 72–96", secrétaire à abattant 60–90", bureau à gradins 48–66"; weight 100–400 lbs

#### Roll-Top / Tambour Enclosed Desks `spatial_roll_top_tambour_enclosed_desks`
Rolling, flexible, or rigid-curved cover mechanism retracts to expose writing surface. Roll-top (flexible tambour retracts into curved housing), cylinder desk (rigid quarter-cylinder lifts as single piece), tambour desk (smaller domestic-scale vertical or front tambour), Wooton desk (patented late-19th-c. American secretary with rotating central section).
- Rolling/sliding/rigid-curved cover · Cover retracts into housing (top-roll for roll-top, lift-up for cylinder) or slides vertically (tambour) · Concealed interior with extensive pigeonholes · Lower case typically pedestal storage with full-depth drawers · Often locking cover · Cover assembly is defining structural feature
- **Dimensions:** Roll-top 48–66" W × 30–36" D × 44–54" H closed · Cylinder similar · Tambour 30–42" W · Wooton 42–54" W × 30–36" D × 60–78" H; weight 150–500 lbs

#### Cabinet / Armoire / Hideaway Workstations `spatial_cabinet_armoire_hideaway_workstations`
Desks integrated into cabinet, armoire, or wardrobe-form furniture; writing workspace concealed within enclosed cabinetry when not in use. Armoire desks, hutch desks, Murphy desks (fold-down wall-mounted).
- Cabinet/armoire/wardrobe identity dominant when closed · Writing surface concealed behind doors (not hinged front panel or rolling cover) · Door-based concealment · Interior writing surface may pull out, fold down, or remain fixed · Often substantial storage above and beside the writing area · Visually similar to non-desk armoires when closed
- **Dimensions:** W 36–54", D 22–30", H substantial — armoire desks 60–84", hutch desks 60–78" (inclusive of upper hutch), Murphy desks 36–72" when closed against wall; weight 150–400 lbs

#### Shared / Double-Sided Workstations `spatial_shared_double_sided_workstations`
Designed for two or more simultaneous users with bilateral access, face-to-face, side-by-side, or modern open-plan multi-user benching. Partner's desks (English 18th–19th-c. legal/banking, two users facing across single piece) and benching desks (modern open-plan, late-20th and 21st century).
- Multi-user structural configuration · Bilateral access (drawers/storage on both sides) for partner's desk · Single unified piece rather than adjacent multiple · Width substantially exceeds single-user · Symmetrical or repeating structural elements · Modern benching emphasizes linear/modular configuration
- **Dimensions:** Partner's W 60–84", D 40–54" (deeper for bilateral users), H 30–32" · Benching 60–180" long by user count, 30–36" D per user; weight 200–500 lbs partner's

#### Commercial / Institutional Workstations `spatial_commercial_institutional_workstations`
Commercial, institutional, educational, or ceremonial contexts. Clerk's desks (high sloped surface for ledger work), standing desks (full-height including modern sit-stand), school desks, teacher's desks, reception desks (counter-style), lectern desks (sloped writing surface on standing-height pedestal), transaction counter desks.
- Commercial/institutional/educational/ceremonial use-context features · Often elevated or full-height for standing/clerk use · Customer-facing counter configurations · Classroom-specific elements (attached seats, lift-lid, tablet arms) · Sloped writing surfaces common for ledger/ecclesiastical/lectern · Durable repeated-use construction (often steel/industrial)
- **Dimensions:** Standing/clerk 38–46" at writing surface, modern adjustable 24–50" · School desks 18–30" W × 18–24" D · Teacher's 48–66" W · Reception/transaction counters 42–44" customer side · Lectern 38–46"; weight 50–300 lbs

#### Technical / Drafting / Professional Workstations `spatial_technical_drafting_professional_workstations`
Specialized work surfaces for technical, drafting, artistic, or scientific work. Workbench desks (heavy-duty with tool storage; jeweler/watchmaker/shop variants), artist's desks (tilting/adjustable drawing surface), laboratory desks (chemical-resistant materials and equipment integration).
- Task-specific structural features · Heavy-duty reinforced construction for workbench · Tilting/adjustable surface for artist · Chemical-resistant materials and integrated equipment for laboratory · Often modular or bench-style for laboratory and workshop · Storage configurations specialized for tools, drawing materials, or technical equipment
- **Dimensions:** Workbench 48–72" W × 24–36" D × 32–40" H (often standing-height) · Artist 30–48" W with tilting surface 0–90° · Laboratory often modular, 36–72" W × 24–30" D × 32–36" H; weight 100–400 lbs

#### Computer / Systems / Modular Workstations `spatial_computer_systems_modular_workstations`
Typewriter, computer, or modular office system use with equipment integration (keyboard trays, monitor surfaces, tower storage, cable management) or modular reconfiguration (panel-based, L-shape, U-shape). Typewriter desks (drop-well configuration), computer desks, modular workstation desks, L-shaped, U-shaped.
- Equipment-integration features · Drop-well for typewriter variants · Modular reconfiguration support · L-shape or U-shape configurations · Often grommets, cable management channels, integrated power · 20th–21st-c. office equipment compatibility
- **Dimensions:** Typewriter 40–52" W with drop-well at 26–27" typing height · Computer 42–72" W · Corner/L 60–84" per leg · U-shape 60–84" per side · D 24–30"; corner/L/U often deeper at corner · H 28–30"; weight 80–300 lbs

#### Built-In / Architectural Desks `spatial_built_in_architectural_desks`
Integrated into room architecture (cabinetry, alcoves, niches, window seats) or wall-mounted as freestanding. Built-in (requires architectural alteration), wall desks (not architecturally integrated, removable), wall unit desks (integrated into modular wall unit furniture).
- Architectural integration or wall-mounting structurally defining · Built-in requires architectural alteration · Wall-mounted supported by wall fasteners (not freestanding legs) · Wall unit integrate into modular wall storage · Often configured to specific room features
- **Dimensions:** Highly variable. Window seat desks 36–72" W × 18–24" D × 28–30" H · Wall-mounted floating 36–60" W × 12–24" D · Wall unit desks integrated into 60–120" wall systems

#### Convertible / Repurposed Desk Forms `spatial_convertible_repurposed_desk_forms`
Two distinct sub-patterns: **convertible desks** (drop-leaf, gateleg, telephone desks with telephone shelf integration including gossip bench variants, monk's bench desks) and **repurposed/converted desks** (factory-built piano-form decorative desks; converted organ desks from pump/reed/parlor organs; converted piano desks from upright/square pianos; converted cabinet desks from armoires/wardrobes/cupboards; converted dresser desks from dressers/chests/vanities; converted industrial desks from workbenches/factory carts/machine bases). Conversion forms preserve evidence of the original furniture identity and require explicit identification of the conversion in user reports.
- Convertible mechanism for designed-as-convertible variants · Original furniture identity preserved in repurposed variants · Conversion evidence visible (piano case proportions, organ housing, dresser drawer construction) · Specialty domestic context for many forms (telephone, gossip bench, monk's bench) · Modern repurposing trend for industrial-style converted desks
- **Dimensions:** Drop-leaf 36–54" W closed, expanding 12–24" per leaf · Gateleg similar · Telephone compact 18–30" W × 14–22" D · Monk's bench 42–66" W · Piano desks variable 30–54" W · Converted piano reflect original case (upright shells 56–66" W × 22–28" D) · Converted organ reflect pump organ (36–54" W) · Converted cabinet/dresser/industrial reflect original storage furniture proportions

### Under family_entry_support_forms (8 behaviors)

#### Transitional Access Support `spatial_transitional_access_support`
Organizes space near entry points for short-duration transitional interactions — arriving, departing, staging personal items, preparing garments before leaving. Vertical, compact; hooks, hangers, compartments, or platforms for hats, coats, umbrellas, canes, suits, ties, smoking-related items. Often mirrors or seating integrated.
- Vertical or near-vertical orientation · Hook, peg, hanger, or compartment provision · Compact horizontal footprint relative to height · Often integrated mirror, bench, or storage · Frequent contact wear surfaces designed for durability · Entry zones or transitional spaces
- **Dimensions:** Heights 60–84" freestanding; W 18–36"; D 12–24". Wall-mounted variants 18–48" W with shallower depths 4–12". Hook heights typically 60–72" above floor.

#### Display and Plant Support Stands `spatial_display_and_plant_support_stands`
Vertical pedestals, columns, plinths, and stands designed to elevate, support, and display sculptural objects, plants, urns, aquariums, or other static display contents. Top-loading stability; vertical proportional emphasis to elevate the displayed object above adjacent furniture height; finished surfaces on all sides since typically viewed from multiple angles.
- Vertical or columnar axis with display surface at top · Top-load stability engineering · All-sides finish (no defined back) · Single-purpose elevation · Top surface matched to typical display object · Often classical column or pedestal styling
- **Dimensions:** Heights 24–60" (display pedestals 30–42", tall plant pedestals 48–60"); top dimensions 10–18" square or round; bases broader 14–24" for stability; multi-tier plant stands add 12–24" per tier

#### Mirror and Screen Forms `spatial_mirror_and_screen_forms`
Vertical reflective or visual-barrier furniture that creates spatial divisions, reflects light, or defines privacy zones without enclosing space. Floor-standing to wall-mounted; rigid frames to articulated folding panels.
- Vertical surface as primary spatial element · Reflective glass (mirrors) or opaque/semi-opaque panels (screens) · Frame or support structure · Often articulated with hinges (folding screens), pivots (cheval mirrors), or fixed mounts (wall mirrors) · Surface dimensions calibrated for human height and viewing distance · Typically two-sided or back-finished for freestanding
- **Dimensions:** Floor-standing 60–84" H × 24–72" W · Folding screens 60–78" H × 12–24" per panel × 3–6 panels · Wall mirrors 24–96" dominant dimension · Cheval 60–72" H on tilting frames · Pier mirrors very tall (84–120") for stair-hall placement

#### Communication and Tech Support Stands `spatial_communication_and_tech_support_stands`
Compact stands and small cabinets for communication devices, charging hardware, small-scale technology in transitional or near-entry positions. The user interacts with the housed device, not with a writing or work surface integrated into the form.
- Compact horizontal footprint with vertical or compact-stand proportions · Device-specific accommodation (phone shelf, charging dock, parcel compartment, cable management) · Surface scale matched to supported device · Often integrated with adjacent seating, drawer, or directory storage · Modern variants include integrated USB ports, charging circuitry, smart-package compartments
- **Dimensions:** Heights 28–44" stands, W 18–36", D 12–20" · Wall-mounted 12–24" W · Charging towers/columns 36–72" tall · Package stations larger (up to 60" tall × 18–24" D)

#### Personal Hygiene Stands `spatial_personal_hygiene_stands`
Vertical or compact-stand furniture supporting personal hygiene through basin support, water containment, towel hanging, or shaving accommodation. Predates plumbed bathrooms; reflects domestic hygiene patterns of 18th–19th centuries; later forms persist as auxiliary or stylistic.
- Top surface designed for water basin or pitcher · Often integrated lower shelf, towel rail, or splash board · Water-resistant finishes · Compact horizontal footprint with body-scale proportions · Towel rails or drying racks at top or sides · Splash backs or marble tops common in 19th-century examples
- **Dimensions:** Heights 30–36" (basin top at working height), W 18–30", D 16–22"; towel rails extend 8–14" above; lower shelves typically 8–12" above floor

#### Container and Box Forms `spatial_container_and_box_forms`
Small to medium portable container furniture — boxes, caskets, caddies, slopes — holding and protecting specific contents through enclosed volume. Miniature jewelry boxes to lap-sized writing slopes to medium-scale candle and Bible boxes.
- Enclosed volume with hinged, lifting, or sliding lid · Rigid construction (joined wood, dovetailed corners, mitered frames) · Specialized interior often fitted to specific content (jewelry compartments, ink wells, candle holders, writing surfaces) · Portable scale (one or two hands) · Surface decoration frequent (inlay, marquetry, painted, engraved metalwork) · Locks/hasps/latches common
- **Dimensions:** Footprints from 4×4" (ring boxes) to 24×18" (large document boxes); H 2–12"; writing slopes when open present angled surface 14–22" D at 8–12°; lap desks 16–22" W × 12–16" D × 4–8" H closed

#### Specialty Body Support Frames `spatial_specialty_body_support_frames`
Large free-standing frame furniture supporting a body or body-vessel without being seating, beds, or workstations. Hammock stands (recreation) and funeral biers (ritual). Despite different contexts, share the structural behavior of large open frames designed to support a horizontal body-scale element from below or between vertical posts.
- Large open frame with vertical posts or end supports · Horizontal span calibrated to body or vessel length (60–84") · Lateral stability through broad base or floor-anchoring · Hooks, brackets, hangers, or platforms · Often portable through disassembly or wheels (more common in biers) · Tension strength (hammock) or static load (biers)
- **Dimensions:** L 72–96" typical (adult human/coffin length) · H 36–72" hammock stands, 18–36" biers (lower for ceremonial viewing) · W/footprint 24–48" for stability

#### Domestic Specialty Storage and Organization `spatial_domestic_specialty_storage_and_organization`
Specialized domestic furniture organized around a specific household activity, occupant, or zone — children's toy storage, mudroom utility benches, entry-zone organizers, pet utility forms. Function-specific accommodation rather than generic storage capacity.
- Function-specific accommodation features (child-scale heights, animal-scale openings, shoe-shaped cubbies) · Domestic-context construction (residential materials, not institutional grade) · Compact horizontal footprint · Frequently combines storage with bench seating, hooks, or organizational compartments · Modern materials (plywood, MDF, painted, plastic bins) common in 20th-c.-and-later examples
- **Dimensions:** Vary by function — child-accessible toy storage 18–30" · Mudroom benches 16–20" seat H with cubbies above to 60" · Pet feeding stations 6–18" · Entry organizers 60–84" wall-spanning · W 24–60", D 12–24"

### Under family_baskets (1 behavior)

#### Baskets `spatial_baskets`
Portable woven container behavior characterized by interwoven flexible materials forming walls and floor, rather than rigid joinery. Carrying, gathering, storage, sorting, protection, display functions across agricultural, domestic, commercial, textile, decorative, maritime contexts. Reed, cane, willow, splint, wicker, rattan, ash, oak, fiber.
- Woven wall construction through interlaced flexible materials · Flexible or semi-rigid material systems · Open or lidded; carry handles common · Rounded, oval, rectangular, or tapered profiles · Hand-portable scale and weight · Often ventilated through weave gaps
- **Dimensions:** Highly variable by subtype. Sewing baskets 8–14" W × 6–10" D × 4–8" H · Market baskets 14–20" across · Laundry baskets 24–30" across × 14–20" H · Nantucket 6–14" diameter for typical examples

### Under family_lighting (4 behaviors)

#### Floor-Standing Lighting `spatial_floor_standing_lighting`
Vertical floor-set lighting with tall shafts and weighted bases. Independent ground-up placement without architectural support. Direction varies: upward (torchères for indirect ceiling wash), downward task (reading lamps with adjustable shades), lateral throw over seating (bridge lamps).
- Tall vertical shaft as dominant axis · Weighted base for floor-set stability · Light source elevated above ordinary table height · Light-source accommodation: candle cup (early), gas burner (mid-19th-c.), electric socket (late 19th-c. onward) · Often features adjustable shade or arm for task light direction
- **Dimensions:** Heights 48–72" matching standing-eye and seated-reading-position illumination; bases broader 10–18" diameter for stability; bridge lamps add 12–18" horizontal arm projection

#### Surface-Set Lighting `spatial_surface_set_lighting`
Portable or semi-portable lighting resting on a table, mantel, dresser, or other horizontal surface. Compact footprint, base stability against accidental contact, proportions matched to human-scale surfaces. Single-light (table lamps, banker's lamps) and multi-light (candelabra).
- Compact base proportions · Weight distribution favoring base stability · Light source at human-scale reading or ambient height when placed on tables/desks/mantels · Light-source accommodation matched to fuel system (candle, oil, kerosene, gas, electric) · Often features decorative shade, globe, or chimney · Portable scale liftable for surface relocation
- **Dimensions:** Heights 12–30" matched to table-set or mantel-set placement; base diameters 4–10" for stable footprint; candelabra heights similar (12–24") with multi-arm spread 8–18" across

#### Wall-Mounted Lighting `spatial_wall_mounted_lighting`
Architecturally-attached lighting mounted directly to a wall via backplate and bracket. Light projects from the wall plane via candle cup, gas burner, or electric socket on a projecting arm. Fixed in place; integration with building structure and architectural style is characteristic.
- Backplate mounted to wall as primary attachment · Bracket or projecting arm extending outward · Fixed wall orientation · Candle cup, gas burner with valve, or electric socket — often with wiring or gas piping integrated through wall · Symmetrical or directional projection determined by wall placement · Often paired or grouped for symmetric architectural composition
- **Dimensions:** Backplate 4–10" dominant axis; projection from wall 4–12" typical sconces, 12–18" gas brackets with adjustable swivel arms; mounting heights typically 60–72" above floor for face-height illumination

#### Suspended Lighting `spatial_suspended_lighting`
Ceiling-suspended lighting via chain, rod, cord, or cable. Light projects downward and outward from the suspended fixture into the room volume below. Multi-arm chandeliers, single-bulb pendants, enclosed lanterns, hall lanterns. Suspension allows positioning at optimal room-illumination height.
- Ceiling attachment as primary structural anchor · Suspension element (chain, rod, cord, cable) supporting fixture weight · Light source(s) in room interior space below ceiling · Downward and outward light projection · Multiple candle cups (chandeliers, historical), gas burners (gaslight era), or electric sockets (late 19th-c. onward) · Often decorative elements (crystals, shades, lantern glazing) visible from below
- **Dimensions:** Drop length 12–36" typical pendants; longer 36–60" for multi-tier chandeliers; fixture diameters 12–36" chandeliers, 6–12" single-bulb pendants, 10–18" hall lanterns

### Under family_industrial_professional (11 behaviors)

#### Vertical Reading and Speaking Stands `spatial_vertical_reading_and_speaking_stands`
Forms presenting material at an angled or vertical reading or display plane for standing reader, speaker, performer, or audience. Lecterns, pulpits, music stands, easels, podiums.
- Tall vertical support shaft or pedestal with weighted base · Inclined or vertical work surface or ledge · Standing-user ergonomics · Often book ledge, pen rest, page-stop, clamp, tripod prop, or similar material-retention · Stability against forward-leaning use · Public, institutional, religious, educational, or performance use contexts predominant
- **Dimensions:** Reading/speaking surface heights typically 42–48" matching standing-user ergonomics; base footprints 14–24" across for stability; easel mast heights extend higher (60–84") when supporting full-canvas display

#### Personal Service Stations `spatial_personal_service_stations`
Service-counter behavior for fixed station service-provider delivery of personal-care services to a seated or standing client. Barber and salon stations.
- Vertical mirror integrated into back or upper portion · Counter ledge at standing-service height (30–36") · Drawer or compartment storage for tools (combs, brushes, scissors, clippers, dryers, products) · Often electrical outlets · Wall-mounted or counter-anchored fixed installation · Client-seat-adjacent placement (typically a separate barber/salon chair)
- **Dimensions:** Counter 30–36"; W 24–48" per station; mirror typical 24–36" W × 30–48" H

#### Kitchen and Utility Workstations `spatial_kitchen_and_utility_workstations`
Utility counter for kitchen, scullery, pantry, or domestic-utility tasks. Dry sinks (water-management without plumbing), kitchen utility units (compartmentalized food-prep with built-in flour bins, sifters, baking surfaces).
- Counter at standing-task height (32–36") · Often integrated functional features: zinc-lined well, marble slab, bread drawer, flour bin with sifter, knife or utensil storage · Durable surfaces suited to water, flour, oil, food contact · Storage below work surface · Wall-anchored or freestanding · Pre-plumbing era examples emphasize water-management features (drainboards, splashguards) without integrated pipes
- **Dimensions:** Work surface 32–36" H; W 36–60" typical, larger compound units up to 84"; D 20–28" matching kitchen counter conventions

#### Retail and Commercial Fixtures `spatial_retail_and_commercial_fixtures`
Commercial-display for customer-facing retail, hospitality, or service operations. Kiosks, showcases (glazed display fixtures), retail fixtures (counters, gondolas, display racks), hospitality (bar fronts, check-in counters), beverage service (soda fountains, coffee bars, tap fronts).
- Customer-facing display or transaction surface · Glazed display panels (showcases) or open shelving (gondolas) · Counter heights matched to standing customer-and-staff transaction ergonomics (36–42") · Durable public-use materials and finishes (laminate, metal, hardwood, glass) · Often integrated lighting, signage, branding, or display infrastructure · Commercial-context placement
- **Dimensions:** Counter heights 36–42" (taller than residential); widely variable — kiosks 24–48", showcases 36–96", gondolas/retail up to room-spanning, hospitality bar fronts often 60–120"

#### Specialized Storage and Organization `spatial_specialized_storage_and_organization`
Institutional storage organizing equipment, supplies, materials, or personal items within workplace, educational, or operational settings. Racks, lockers, educational fixtures (school cabinets, library cases, classroom storage), built-in storage (architectural casework), shelving systems.
- Multi-compartment or multi-shelf layout · Durable utilitarian materials: steel, heavy hardwood, laminate, industrial-grade · Often modular or repeated configurations (locker rows, shelving units, gondola sections) · Institutional placement · Secure-access features where applicable (locks, hasps, key cylinders) · Identification/labeling provisions
- **Dimensions:** Shelving 60–96" floor-to-ceiling; lockers 60–84" typical; built-in storage from wall-height base cabinets (36") to full-height casework (96"+); widths and configurations vary

#### Religious and Ceremonial Fixtures `spatial_religious_and_ceremonial_fixtures`
Sanctuary furnishings for worship, ritual, prayer, music, ceremonial functions in religious institutional contexts. Altars, communion rails, church pews, choir stalls, confessionals, deacons' benches, prayer kneelers, candle stands, processional stands.
- Liturgical placement: sanctuary, chancel, altar zone, congregational seating area, sacristy · Religious symbolism: crosses, religious carving, denominational iconography, sanctuary-coordinated woodwork · Durable public-worship materials and construction · Often denomination-specific (Catholic altar vs. Protestant communion table; pew rows vs. open meetinghouse seating; confessional vs. open Protestant practice) · Repeated congregational seating (pews, choir stalls) in row-based layouts · Ritual-function support
- **Dimensions:** Pew seat 16–18"; pew length 96–144" for multiple congregants; altar 36–42" for celebrant access; lectern/pulpit 42–48" (overlap with vertical reading/speaking stands but liturgical context places them here); candle stand heights 12–24" altar-set to 48–72" floor-standing vigil/processional

#### Scientific Equipment Stands `spatial_scientific_equipment_stands`
Specialized mounts for scientific instruments, laboratory equipment, observational devices, or research apparatus. Precision mounting, vibration stability, instrument-specific accommodation (microscope stages, telescope mounts, balance platforms, retort stands), often adjustability for calibration or operator ergonomics.
- Precision mounting surface or platform calibrated to specific instrument · Stability emphasis: heavy base, vibration damping, often stone or hardwood tops · Adjustability for instrument calibration or operator ergonomics · Instrument-specific accommodation · Often storage/organization for instrument accessories · Laboratory, observatory, classroom, or research-institution placement
- **Dimensions:** Working surface 30–36" benchtop; observation-platform heights may be lower (24–30") for seated instrument use; base footprints emphasize stability; vary widely by instrument type

#### Institutional and Workplace Fixtures `spatial_institutional_and_workplace_fixtures`
Workplace, public-service, or operational fixed installations. Cabinets of curiosities (specimen/artifact display), time clock stations, safety fixtures, industrial stations, bank fixtures (teller cages, vault fronts, safe door assemblies).
- Purpose-built operational role: timekeeping, safety equipment access, specimen display, industrial workflow, financial-service handling, security · Often integrated mechanical or electronic features (punch clocks, locks, vault mechanisms, alarm systems, electronic access controls) · Institutional placement · Durable construction calibrated to public/employee use intensity · Identification, labeling, or branding · Wall/floor/ceiling anchoring common (fixed installation rather than portable)
- **Dimensions:** Highly variable. Time clock stations 36–48" wall mount; safety fixtures 12–36"; bank teller cages 60–96" per bay with multi-bay rows; cabinet of curiosities 60–96" tall display case; industrial stations 36–72" per workstation

#### Workstation Accessories and Mobile Fixtures `spatial_workstation_accessories_and_mobile_fixtures`
Mobile or accessory forms supplementing primary workstations through portability, modular accessories, or rolling utility carts. Workstation accessories (return desks, side units, modular extensions) and utility carts (rolling industrial, medical, library, service).
- Mobility provision: casters, wheels, handles, lightweight construction · Accessory or modular integration with primary workstations · Compact or moderate scale · Durable utilitarian materials · Often locking-caster brakes for fixed-position use · Industrial, institutional, medical, library, or service-context placement
- **Dimensions:** Cart heights 30–42"; footprints 18–36" × 24–48"; accessory dimensions vary, typical secondary surfaces 24–48" W × 18–24" D

#### Environmental Control Cabinets `spatial_environmental_control_cabinets`
Climate-and-storage-control: humidors, wine storage cabinets, curing cabinets, other specialized environmental cabinets. Sealed enclosure, internal climate-control mechanisms (humidification, refrigeration, temperature regulation), contents-specific organization (cigar trays, wine racks, curing hooks).
- Sealed or semi-sealed enclosure with insulated walls and gasketed doors · Internal climate-control mechanism · Contents-specific internal organization · Often external climate displays (hygrometer, thermometer) · Premium materials: hardwood (cigar humidors), refrigerated metal (wine cabinets), often glazed doors · Commercial or premium-residential placement
- **Dimensions:** Heights 24–72" premium cabinets; W 18–48"; D 16–28" accommodating internal racking and climate-control equipment; walk-in commercial variants room-scale

### Under family_clock_cases (3 behaviors)

#### Floor-Standing Clocks `spatial_floor_standing_clocks`
Floor-standing horological behavior occupying full vertical height from floor to upper hood. Provides space for long pendulum chambers, weight drops, and prominent dial presentation. Weight-driven or spring-driven longcase movements requiring substantial vertical accommodation.
- Full-height freestanding cabinet construction · Hood or bonnet section containing dial at upper architectural focal height · Long central trunk housing pendulum and weights · Base plinth or bracket-foot lower section · Access doors for movement maintenance and weight rewinding · Pendulum window common in later examples · Architectural cabinet construction combining horological function with formal furniture presentation
- **Dimensions:** Total height 72–96" grandfather, 60–72" grandmother, 48–60" granddaughter; W 14–22" at trunk widening to 18–28" at hood; D 8–14" accommodating pendulum swing; substantial weight 60–200 lbs

#### Wall-Mounted Clocks `spatial_wall_mounted_clocks`
Suspended or affixed to vertical wall surface. Visual accessibility, reduced floor-space occupation; spring-driven or pendulum-regulated movements within compact vertical or circular case profiles. Banjo clocks, regulator clocks, schoolhouse and gallery clocks, calendar clocks.
- Rear hanging system: keyhole slots, mounting brackets, or screw-eye attachment · Compact vertical or circular body matched to wall-display function · Dial presentation at viewer eye-height · Exposed or enclosed dial systems depending on form variant · Pendulum windows common in regulator and precision-oriented variants · Reduced or absent floor-contact base
- **Dimensions:** Heights vary widely by form — banjo 30–42"; gallery 12–30" circular; regulator 36–48"; schoolhouse 18–30"; calendar 24–36"; W 10–18" at dial; D 3–6"; lighter weights 5–25 lbs

#### Surface-Set Clocks `spatial_surface_set_clocks`
Designed to rest upon mantels, shelves, tables, case furniture tops. Spring-driven movements within compact freestanding bodies; flat stable base, decorative case fronts, rear-access panels for movement maintenance. Mantel clocks (Victorian black mantel, Art Deco, mid-century), tambour clocks (c. 1900–1940 curved arched silhouette), novelty clocks.
- Flat stable base for horizontal surfaces · Compact freestanding body · Decorative case fronts: architectural, sculptural, veneered, marble, metal, or figural ornament · Rear access panels for movement maintenance and key-winding · Compact horizontal or vertical proportions · Decorative moldings, applied ornament, or figural elements frequent in formal variants
- **Dimensions:** Heights 8–24"; W 8–24"; D 4–10"; tambour clocks emphasize horizontal proportions (12–20" W × 6–10" H); mantel clocks vary 8–24" tall × 16–22" W; weights moderate 3–15 lbs

### Under family_musical_mechanical (9 behaviors)

#### Audio/Video Equipment Housings `spatial_audio_video_housings`
Cabinet form specifically to house, support, organize, conceal, or display electronic media playback equipment within domestic interior context. Evolves directly from early-20th-c. radio cabinetry through phonograph console integration, mid-century television and stereo consoles, contemporary modular media console designs.
- Broad horizontal proportions matched to seated viewing/listening · Equipment compartments dimensioned for radio, television, turntable, stereo, or hi-fi components · Shelving organized around playback equipment placement and access · Ventilation openings (rear panel perforations, side vents, top grills) · Wire-routing accommodations · Speaker cloth or acoustically transparent panels common in front-facing speaker zones · Decorative veneer or finished cabinetry presenting the piece as furniture rather than equipment
- **Dimensions:** W 48–84" floor consoles; H 24–36" matched to seated viewing; D 16–22" accommodating equipment chassis; weight 100–300 lbs; late-mid-century console examples often largest; 1970s–80s more compact (transistor/IC miniaturization)

#### Coin-Operated Entertainment `spatial_coin_operated_entertainment`
Commercial entertainment cabinet for public, semi-public, or commercial deployment with integrated payment systems (coin slots, bill acceptors, token mechanisms, or contemporary digital payment) and amusement-oriented playback or gameplay. Jukeboxes, arcade cabinets, pinball machines. Strongly associated with American diner culture, dance halls, roadside leisure, bars, lounges, commercial arcades from c. 1930 forward.
- Integrated payment system · Durable commercial-grade cabinet construction · Visually attention-getting fronts: illuminated panels, chrome trim, decorative artwork, marquees · Integrated speaker systems · Theft/tamper-resistant payment-zone housing · Internal mechanism access via removable panels, hinged service doors · Free-floor placement enabling commercial siting flexibility
- **Dimensions:** Floor jukeboxes 48–60" H × 30–36" W × 24–30" D, 250–450 lbs · Wall jukeboxes 18–28" H × 14–20" W × 6–10" D, 25–60 lbs · Upright arcade cabinets 65–72" H × 24–30" W × 30–40" D, 250–400 lbs · Cocktail arcade cabinets 28–34" H (table height) × 30–42" W × 30–42" D, 180–300 lbs · Pinball machines 70–78" H × 24–30" W × 50–62" D, 250–350 lbs

#### Mechanical Craft Tools `spatial_mechanical_craft_tools`
Fiber-processing and textile-production furniture; working mechanical tool integrating frame structure with mechanical operation (treadle systems, rotating wheels, spindle assemblies, warp tensioning). Looms and spinning wheels. Strongly associated with Colonial-era domestic and pre-industrial production; continues through Shaker, Pennsylvania German, Appalachian, rural American traditions; contemporary craft revival from c. 1960 forward.
- Frame-based construction sized to accommodate operator interaction (seated for spinning wheels, seated-or-standing for looms) · Mechanical linkage systems: treadles, drive belts, pitman rods, eccentric drives · Rotating components mounted on bearings or pivot points · Tensioned-fiber accommodation: warp beam systems for looms, flyer-and-bobbin systems for spinning wheels · Hardwood construction throughout (maple, ash, birch, oak) · Operator-oriented sizing · Working tool aesthetic
- **Dimensions:** Floor looms 36–60" W × 36–72" D × 36–60" H, 50–200 lbs · Table looms 18–36" W × 18–24" D × 12–24" H, 10–40 lbs · Saxony wheels 24–36" W × 18–24" D × 30–42" H, 15–30 lbs · Castle wheels 14–20" × 14–20" × 30–40" H, 12–25 lbs · Great wheels 36–48" × 36–48" × 48–60" H, 20–40 lbs

#### Musical Instrument Cabinets `spatial_musical_instrument_cabinets`
Acoustic musical instrument furniture integrating keyboard, reed, pipe, string, or mechanical sound-production systems within a furniture-presented structure. Upright piano, grand piano, square piano, pump organ, reed organ, pipe organ, pianola, player piano.
- Acoustic resonance accommodation: soundboard housing, internal resonant chamber, structural integrity supporting string tension or wind pressure · Keyboard accommodation · Action mechanism housing: hammer-and-string (pianos), reed-and-bellows (pump and reed organs), pipe-and-wind (pipe organs), music-roll-and-pneumatic (pianolas, player pianos) · Furniture-grade decorative presentation · Maintenance access · Substantial weight reflecting hardwood case plus string-tension framework or pipe-system mass
- **Dimensions:** Upright piano 48–60" H × 56–66" W × 24–30" D, 400–800 lbs · Grand piano 36–42" H × 56–72" W × 60–108" D, 500–1300 lbs · Square piano (Federal/Empire) 30–36" H × 60–72" W × 24–30" D, 250–450 lbs · Pump organ 50–72" H × 40–60" W × 18–26" D, 150–350 lbs · Reed organ 36–72" H × 36–54" W × 18–24" D, 120–300 lbs · Pipe organ varies dramatically; cabinet/parlor variants 60–96" H × 36–72" W × 24–48" D, 200–600 lbs · Pianola/player piano match upright with additional music-roll housing

#### Media Storage `spatial_media_storage`
Storage organized around physical media formats — records, CDs, DVDs, Blu-ray, video games, cassettes, related accessories. Narrow compartments dimensioned for media case sizes rather than books or general storage. Late-20th-c. American suburban entertainment furniture emerging with home audio/video format proliferation.
- Narrow vertical divisions and shallow shelves dimensioned for media case storage · Tall vertical proportions maximizing storage density · Shallow depth (4–8") matched to media case dimensions · Compact floor footprint (10–18" square or rectangular) · Open-front typical in tower forms; some variants include doors for dust protection · Modular and stackable common in late-20th-c. mass-market · Standardized shelf spacing matched to specific media format dimensions
- **Dimensions:** Media towers 36–72" H × 10–16" W × 6–10" D, 10–30 lbs · CD towers shallow (4–6" D) matched to jewel-case width · DVD towers slightly deeper (5–8") · Game towers variable depth · Distinct from bookcases (24–36" W, 8–12" D)

#### Integrated Entertainment Systems `spatial_integrated_entertainment_systems`
Architectural-scale entertainment integrating display, storage, and audiovisual organization into a wall-spanning or room-defining composition. Home theater units (surround-sound) and entertainment walls (broader wall-section compositions with mixed cabinetry, shelving, display zones). Strongly associated with American suburban interiors from c. 1980 forward.
- Architectural scale spanning substantial wall sections (8–16 feet length) · Integrated cabinetry combining display, storage, equipment bays, shelving · Large central display zone dimensioned for television placement · Surround-sound speaker accommodation · Equipment bays for audio receivers, gaming systems, streaming devices · Cable management and wire routing integrated into cabinet construction · Modular or built-in construction depending on installation context
- **Dimensions:** Home theater units 60–96" H × 96–180" W × 18–30" D, 200–500 lbs freestanding (built-in may exceed) · Entertainment walls 84–96" H × 120–240" W × 14–24" D, 300–800 lbs total across modular sections · Distinguishable from media consoles (single freestanding cabinet 48–84" W) by architectural scale

#### Equipment Support Systems `spatial_equipment_support_systems`
Utility forms supporting, organizing, cooling, and protecting technical equipment — audio components, computing, networking, acoustic speaker systems. Audio racks, server racks, speaker cabinets. Industrial/institutional construction emphasizing function over decorative presentation.
- Open-frame or enclosed rack architecture · Adjustable mounting rails (19" standardized rack rails for institutional/professional; non-standardized for audiophile and consumer formats) · Ventilation systems: perforated panels, integrated cooling fans, open-frame airflow, top/bottom venting · Cable management infrastructure · Vibration-isolation construction in audio rack variants · Acoustic enclosure construction in speaker cabinet variants · Heavy-duty construction reflecting equipment weight loads and continuous-operation environments
- **Dimensions:** Audio racks 24–48" H × 18–22" W × 16–22" D, 25–80 lbs · Server racks 30–84" H (rack-unit increments) × 19–24" W × 24–36" D, 60–200 lbs unloaded plus substantial equipment weight · Speaker cabinets vary by class — bookshelf 12–18" H × 6–10" W × 8–12" D, 10–25 lbs; floor-standing 32–48" H × 8–14" W × 12–18" D, 30–80 lbs

#### Interactive Systems `spatial_interactive_systems`
Direct-user-interaction technology integrating displays, controls, interactive hardware for gaming, simulation, control, or digital interface contexts. VR stations (immersive interaction with movement space and sensor mounting), gaming towers (high-performance gaming computer housings with thermal management and visual treatment), digital interface consoles (institutional and transportation control surfaces). Emerged c. 1970 with the first generation of interactive digital systems.
- Display integration · Control surfaces and input hardware (keyboards, controllers, touch interfaces, specialized input devices like steering wheels, joysticks, motion controllers) · User-oriented ergonomic sizing · Computing or simulation hardware housing · Open movement space accommodation in VR variants · Thermal management · Robust construction reflecting active-use mechanical wear and equipment weight
- **Dimensions:** VR stations — seated 30–42" square footprint with sensor mounting, room-scale 8–12 feet open movement area with perimeter sensor mounting · Gaming towers 18–24" H × 8–12" W × 18–22" D, 20–50 lbs · Digital interface consoles vary — control desks 28–36" H × 36–96" W × 24–36" D with integrated display arrays, transportation kiosks 60–78" H × 24–36" W × 18–24" D with user-height touchscreen displays

#### Automated Dispensing Systems `spatial_automated_dispensing_systems`
Automated dispensing cabinets integrating payment system, product storage, dispensing mechanism for unattended product distribution. Snack vending, beverage vending, cigarette machines (largely historic now due to regulatory changes), modern smart vending. Strongly associated with 20th-century American commercial culture across roadside, workplace, school, transportation hub, retail siting.
- Integrated payment system · Internal product storage: shelves, coils, refrigerated compartments, vertical or horizontal stacking · Dispensing mechanism: gravity drop, coil rotation, robotic arm, conveyor · Product display window · Product delivery hopper or chute at user-accessible height · Tamper-resistant construction · Refrigerated variants include compressor housing, condenser ventilation, insulated product compartments · Modern variants include electronic display, network connectivity, contactless payment
- **Dimensions:** Snack vending 70–78" H × 36–42" W × 30–36" D, 500–800 lbs · Beverage vending (refrigerated) 70–78" H × 36–42" W × 28–36" D, 600–900 lbs · Cigarette machines (historic) 48–66" H × 24–30" W × 16–22" D, 150–300 lbs · Compact countertop variants smaller · Modern smart vending vary widely by product category
