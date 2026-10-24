# The Corridor Bench — a plan for the dossier's map

**Status.** Plan, written before any geometry. This file is the contract for
the build. It is meant to be executable by someone else without a second
briefing.

**The skill.** `anatomy`, at `C:\Users\aswat\.agents\skills\anatomy\`. It builds
crafted isometric SVG figures where the object itself is the explanation: many
small precise solids, four-tone shading, correct painter's order, a framed card
with a title, a hint and a live readout, calm eased motion, and an audit that
proves the geometry. Read its `SKILL.md` and `references/craft.md` before
starting. The bar is the test rig example for the drawing and the raptor for
any shader work.

**The world.** The site is "The Sign Band": one saturated yellow reserved for
wayfinding, black type on white over a warm paper ground, hairline rules only,
no shadows, no cards, no second accent. Public Sans for prose and monumental
numbers, Roboto Mono for every parameter. The figure must read as part of that
world, not as a museum piece dropped into it.

---

## 1. What we are building

One figure on the dossier route, above the reading column and below the zone
buttons: **a milled plate on a dispatch bench showing the two corridors, every
one of the hundred localities as a machined stop pin standing at its true
coordinates, the fifteen routes as brass link bars joining their stops in
travel order, and a movable price token that re-reads every route's margin
when it is set.**

Clicking a pin raises a readout with that locality's numbers. The existing
decision board filters the plate. A stop can be linked to and highlighted.

## 2. What we are not building, and why

Each of these was considered and rejected for a reason that should survive into
the build.

**A choropleth on a map of Chennai.** It was considered and rejected in the
first round of world exploration, for a reason that is still true: a choropleth
of a market will be read as a claim about something else, and the site's
hardest sentences — that 44 of 50 south-east localities fail the price floor —
would be laundered into civic authority by a map that looks official. The
plate is a *model of the market*, and it says so.

**A flat GIS map with pins.** This is the category default for a data site, and
the world record explicitly refuses it. It would also waste the corpus: the
interesting structure in this data is not where the points are, it is the
**order** of the stops inside a route and the **price** each route clears.

**A 3D globe or an orbit.** The reader is on a phone, alone, from a chat link.
A globe asks for a rotation and gives nothing at 390 pixels.

**A heatmap.** Colour carries a fact that a mark can carry, which the world
record forbids.

## 3. The object

**A dispatch bench.** A heavy base plate of pale metal, screwed at the corners
to a bench top, carrying a milled landscape of the two corridors. Real planning
tables are made exactly this way: a plate milled from a survey, the survey's
lines inlaid, the important places marked with turned posts.

Why this object and not another:

| Candidate object | What it gets right | Why it loses |
|---|---|---|
| A telegraph patch panel | A stop is a jack; pressing one shows its state | It has no geography and no order. The corpus's spine is order. |
| A card-catalog plan chest | A drawer per locality, opened on click | It is an archive, not a decision. Nothing moves. |
| A contour model | The city as a heightfield | Height would have to mean something; the corpus has no elevation. |
| **A dispatch bench** | A stop is a post in a route's channel, in travel order, on a plate that shows where it sits | Nothing. This is the object. |

**What moves, and what it means.** The price token slides along the ladder and
every route bar's contribution re-reads; the needle on the selected stop's
gauge reads its margin over the clustered cost. Movement means *the price you
charge*, always. Nothing else in the figure animates on its own except the
idle tour and the selection.

## 4. Truth first — the data binding

Every physical property below is a pure function of a corpus field. No number
is drawn by hand. The binding is the contract; the table is the model.

| Physical property | Corpus field | Rule |
|---|---|---|
| Post position | `lat`, `lon` | Equirectangular projection with a `cos(lat)` correction at 13°N, fitted to the plate. Not a survey; a placement. |
| Post height | `demand.cases_per_month_total` | From zero. A zero post is a flat disc in the plate. |
| Post head shape | `verdict.status` | GO = a flat disc. HOLD = a square head. NO-GO = a disc with a cross notch. Shape, never colour. |
| Tier bracket | the zone's tier (A/B/C) | A bracket cut under the head: solid for A, dashed for B, dotted for C. The same code the dossier already uses. |
| Brass link bar | `route_cluster` and the cluster's travel order | One bar per cluster, drawn through its stops in travel order. Bars are the only metal on the plate. |
| Bar readout | `economics.our_mix.monthly_revenue_potential`, `cost_per_visit_clustered` | The bar's engraved plate reads the cluster's contribution at the token's price. |
| Corridor channel | `zone` | Two milled channels, one per corridor, cut into the plate. |
| Token | `price.our_mix` blends, `economics.blended_floor` (Rs 1,100), `cost_per_visit_clustered` (Rs 850), and the eight published operator prices | The token can be set to any of those. It is the figure's only instrument. |
| Selected stop's gauge | `economics.our_mix.blended_price` against Rs 850 | The needle reads margin over clustered cost. |
| Readout panel | the locality record | Name, ward, cluster, cases a month, our-mix price, margin, saturation, verdict and the gate it failed, travel to hub, peak window, tier. |

**The four gates** are already defined in the corpus and already drawn on the
decision board: price at or above Rs 1,100, margin at or above Rs 250, cases
at or above 40, saturation under 70. The figure must not invent a fifth and
must not restate them differently.

**Provenance.** The tier travels with the number it qualifies, inside the
readout, never in a footnote. The plate's own caption states that the
positions are placed from coordinates and are not a survey, and that Zone A's
household base is modelled (tier C) while Zone B's is derived (tier B).

## 5. The parts list

Written before any geometry, as the skill requires. Counts are the target for
a **Hero**: 120–180 solids, which is the count of drawn parts, not of lines.

**Base (10).** Bench top with a chamfered front edge; four levelling feet; the
plate; four corner screws with washers; a maker's plate with three engraved
rule lines; a cable gland at the rear; a lamp arm bolted at the back left; the
lamp head with a knurled rim; the lamp's shade; a small parts tray holding the
spare token.

**Plate and engraving (14).** The milled surface with its two corridors cut as
channels; the channel walls; the channel floors in a different tone; the
coastline inlay (see §6); four major road inlays (Rajiv Gandhi Salai, East
Coast Road, Grand Southern Trunk Road, Outer Ring Road); the Vandalur–Tambaram
airport road inlay; the engraved ward hairlines (six wards); the compass
rose; the scale bar with major and minor ticks; the north pointer; the datum
line; a datum stamp.

**Stops (100 × 2).** For each locality: a turned post with a collar, and a
head. Two solids each, 200 in total, which is the bulk of the drawing and is
correct: the stops are the subject.

**Route bars (15).** One brass bar per cluster, in travel order, with a
collar at each stop and a terminal at each end. One bar carries an engraved
plate with the cluster's contribution at the token's price.

**Instrument (9).** The price token on its rail; the rail with its ladder
ticks and the Rs 850 / Rs 1,100 marks; a knurled thumb screw that clamps the
token; the selected stop's gauge, with a dial face, a needle and a bezel;
the readout platen that slides out of the bench to carry the locality's
numbers; two guide rails for the platen; an end stop.

**Frame and legend (8).** The card; the figure number `Fig 4`; the title; the
interaction hint; the live readout; the legend keys for GO / HOLD / NO-GO and
for the tier bracket; the caption.

## 6. The one piece of new data

The plate wants a coastline and four road spines. The committed OSM extracts
carry road **centres** only, and the ward relations carry member references
without the member geometry, so the coastline and the road polylines have to be
fetched once and committed, exactly like the other extracts in
`research/zone-b/_work/`:

- one Overpass query for the coastline relation and for the geometry of the
  ways named Rajiv Gandhi Salai, East Coast Road, Grand Southern Trunk Road and
  Outer Ring Road, restricted to the plate's bounding box;
- written to `research/map-geometry/osm-coast-and-spines.json`;
- a short `research/map-geometry/SOURCES.md` with the query, the timestamp and
  the ODbL attribution.

If the fetch fails, the plate ships without the coastline inlay and says so in
the caption. A missing coastline is a smaller lie than a drawn one.

## 7. Camera and world

- Isometric, azimuth 45°, elevation 34° — the angle shows into the channels
  without flattening the posts.
- World units are about one pixel of the real thing. The plate is 1180 × 760
  world units; the bench is 1400 × 940.
- Projection is a **pure module**, `src/iso/projection.mjs`, with two
  functions: `place(lat, lon)` and `fitProjection(points, width, height)`.
  It must have a self-check — a known point must land on a known coordinate —
  and the check runs in the build.
- The plate's ground plane is the bench top. Posts stand on it, the bars lie
  on it, the lamp throws from the back left.

## 8. Interaction

1. **Idle tour.** When nobody has touched it for eight seconds, the camera
   eases slowly around the plate and the token drifts along the ladder. It
   stops on any input and never restarts while the reader is reading.
2. **Click a stop.** The platen slides out with that locality's numbers. The
   post's head lifts a fraction, and the post that was selected is the only one
   with a highlight collar.
3. **Filter from the board.** The decision board's existing filters dim the
   stops that do not match and keep the matching ones at full contrast. A
   filter that matches nothing shows the empty state, and the plate dims
   entirely.
4. **The token.** Dragging it along the rail re-reads every bar's contribution
   and the selected stop's needle, in one frame, with no fade.
5. **Keyboard.** Every stop is focusable in route order with arrow keys
   moving along a route and up and down between routes. Enter selects.
6. **Reduced motion.** The figure is still and the idle tour does not run.
   The platen still slides, once, quickly.
7. **Deep link.** `?place=A05` or `#place-A05` selects and highlights a
   locality on load, and the URL updates when a stop is selected. A place can
   be shared as a link.

## 9. The frame, and how it merges

The card is the Anatomy card: `Fig 4` top left, a short title top right, the
interaction hint bottom left, the live readout bottom right. Legend keys and
the true caption go under the card. No words inside the drawing except at most
one tiny engraved label.

Where it sits: `src/pages/zones.astro`, directly under the two corridor
buttons and above the FlowDiagram. It is the first thing under the title and
the last thing above the fold on a phone.

What it merges with:

- the **zone buttons** drive the same thing as the board's zone filter;
- the **decision board** cross-filters the plate, and the plate's selected
  locality scrolls the board to its gate row;
- the **margin column** keeps its job — units, provenance, how to read a gate
  — and the figure does not move into it;
- the **print twin** (`/zones-print/`) gets the same SVG with every animation
  disabled and the platen drawn open on the first locality, so the printed
  dossier carries the figure and its numbers.

## 10. Palette — the kit against the world

The kit ships its own tones. This figure uses the **light theme**, and the
tokens are remapped to the site's:

| Kit role | Site token | Use |
|---|---|---|
| ground / paper | `--paper` | the bench top and the card |
| `lo` | `--ink-3` | base, feet, the plate's edge, minor ticks |
| `mid` | `--ink-2` | structure: channels, rails, frame |
| `hi` | `--ink` | the stops, the bars, the gauge bezel |
| `lit` (one accent) | `--signal` | the token, and the selected stop's collar — nothing else |
| brass | `--ink` at 70% | the route bars, read as metal by tone, not by hue |
| engraved lines | `--rule` | the coastline, the road inlays, the ward hairlines |

**Exactly one accent.** The yellow marks the instrument and the current
selection. It is not used for verdicts, not for zones, not for price. A
verdict is a head shape. A corridor is a channel. A price is a number on a
plate. This is the world record's own rule and the figure must obey it.

Shading is four tones from facing, as the kit does it, but the tones are the
site's inks at four opacities on the paper ground rather than the kit's grey
ramp. No gradients, no shadows, no radius above 2px.

## 11. Build order

| Phase | What | Time |
|---|---|---|
| 1 | Vendor the kit: `kit/iso-kit.mjs`, `kit/lathe.mjs`, `kit/tube.mjs`, `kit/audit.mjs` into `src/iso/`. Write `src/iso/projection.mjs` and its self-check. | 45 min |
| 2 | Fetch and commit the coastline and road spines (§6). | 30 min |
| 3 | Write the parts and the geometry module `src/iso/bench.mjs`: base, plate, channels, engraving, bars, instrument. Stops come last, from the corpus. | 2 h |
| 4 | The figure script `scripts/build-map-figure.mjs`, writing `src/content/zones/figure.html`, `figure.css` and `figure.js` — the same pattern as the other build scripts, so the output is generated, not hand-edited. | 1.5 h |
| 5 | The live layer: idle tour, click, token drag, keyboard, deep link, board cross-filter. | 1.5 h |
| 6 | Merge into `zones.astro` and `zones-print.astro`, with the print variant still. | 45 min |
| 7 | Verification (§12) and the fixes. | 1.5 h |

Roughly eight hours. Say so before starting; do not start an Epic.

## 12. Verification

The figure is not done until all of these are true, in both the light theme and
the site's own theme:

- `node scripts/build-map-figure.mjs --audit` ends `audit passed`: no clearance
  failure, no terminal left loose, no fold, no self-overlap, no crowding
  against a slender solid, no stand-in shape, no wobble, no bad depth order,
  at rest and in the token's motion.
- `node scripts/lines.mjs <figure>.html --out shots/lines.png` prints
  `line ends: 0`.
- 4× close-ups of every junction are read: the channel walls, the post
  collars, the bar terminals, the rail screws, the gauge bezel, the platen
  guides, the lamp joint. No bare face, no empty corner, no line ending in
  mid-air.
- Screenshots at 1440 and at 390, plus the hover state, plus the selected
  state, plus the platen open. Read every one.
- The site's own checks still pass: `node scripts/check-prose.mjs` (47 claims),
  `node scripts/audit-dataset.mjs`, `node scripts/verify-interactions.mjs`.
  The interaction script is extended to cover the figure: click a stop, move
  the token, filter from the board, keyboard to a stop, deep link.
- Every ink in the figure clears 4.5:1 on the paper ground, and the yellow
  clears 3:1 on both grounds it sits on.
- The print twin renders the figure and its numbers in the PDF, and the PDF is
  read, not assumed.

## 13. Risks, and what to do about them

**Density.** A hundred posts on one plate can become a hedge. If the 4× check
shows a hedge, cut the post height to a shallower range and let the *bars* and
the *readout* carry the numbers, not the post heights. Do not drop localities
to fix it.

**Palette clash.** An isometric shaded figure in a flat sign-band world can
look pasted on. If it does, the fix is subtraction, not addition: drop the
bench, drop the lamp, and let the plate float as a printed plate with a
caption. Never add a second accent to solve it.

**Performance on a phone.** A dense SVG with a live layer can cost more than
the page is worth. If the phone capture drops below thirty frames, the idle
tour is the first thing to go, then the platen slide becomes a single frame
change, and the figure still reads.

**Print.** The print twin has no motion and no pointer. The platen is drawn
open on one locality and the figure gets a full-width plate with the caption.

**Scope.** If the figure is not right by the end of phase 4, ship the plate
with the stops and the readout and leave the bars for later. A plain milled
plate with a hundred pressable stops is already more than the dossier has
today; the brass bars are the refinement.

## 14. Definition of done

A reader opens the dossier on a phone, sees the two corridors and a hundred
places standing on them, presses one place, reads its numbers, drags the
price token and watches the routes re-read themselves against the price they
charge, and closes it knowing which corridor to open first and why. Nothing
in the figure is a picture of that. All of it is the thing.
