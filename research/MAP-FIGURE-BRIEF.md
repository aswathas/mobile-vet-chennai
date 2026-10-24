# The Locality Map — the plan, and what was built

**Status.** Built and shipped. This file is the record of the figure the
dossier carries: what it is, what it was before it, why it changed, and what
it is allowed to claim.

**It replaced the Corridor Bench.** The first plan for this figure was an
isometric drawing: a milled dispatch bench with a hundred machined stop pins,
fifteen brass link bars, a price token on a rail and a dial gauge. It was
built, audited, published and read — and the reader rejected it. The words on
the pins were too small to read, the pins were too close together to press on
a phone, and the drawing was a picture of the market rather than the market.

The bench's own numbers were honest. Its *shape* was the failure. A flat plan
map with colour, a lift under the pointer and four filters answers the
question the dossier asks — where is the demand, and what is each place worth
— and it answers it with the corpus's own coordinates rather than with a
model of them. It also obeys the house rule that a figure must not tilt the
ground plane, which the bench had to break.

## 1. What the figure is

One figure on the dossier route, above the reading column and below the zone
buttons: **a plan map of the hundred localities at their true coordinates,
coloured by the dossier's own verdict rule, with the fifteen routes drawn in
travel order.**

- **Colour carries the verdict**, and shape repeats it: a disc for GO, a
  square for HOLD, a disc with a cross notch for NO-GO. The map reads in
  black and white.
- **Hovering lifts a place** off the sheet and reads its numbers into the
  readout panel beside the map.
- **Clicking keeps it**: the place stays selected, the route it sits on
  brightens, and the URL carries it as `?place=A02`.
- **Four sliders filter the sheet**: cases a month, our blended price, margin
  a visit, and saturation index. The count of matching places follows them.
- **Zooming separates the places.** Where marks overlap they merge into one
  counted disc; zooming in brings them apart, because they were never moved.
- **The keyboard reaches every place**, arrow keys walk the route a place
  actually sits on, and Enter selects.
- **The decision board cross-filters the sheet**, and the corridor buttons
  drive the same filter.

## 2. What it is not, and why

**A choropleth on a map of Chennai.** Rejected in the first round of world
exploration, for a reason that is still true: a choropleth of a market will be
read as a claim about something else, and the dossier's hardest sentences —
that forty-four of fifty south-east localities fail the price floor — would be
laundered into civic authority by a map that looks official. The figure shows
**places**, not areas. Nothing on it is filled in.

**A perspective drawing.** Rejected by the house rule, and by the reader. A
tilted ground plane makes distances lie, and this figure's whole claim is that
the distances are the corpus's.

**A fixed set of labels.** Rejected in the build. Ranking the places at build
time and engraving the top sixteen fixes the set the moment the reader zooms,
and the names that matter are not the ones that were biggest in the corpus.
Every place carries a name; the client lays them out in the frame the reader
is actually looking at, and drops the ones with no room.

**Beeswarm and force-directed separation.** Rejected. The user asked for
separation, and separation is what zooming and clustering give — but a place
moved off its coordinate is a place that is no longer where the corpus says it
is. Positions stay true.

## 3. Truth first — the data binding

Every number on the sheet is a pure function of a corpus field. No number is
drawn by hand.

| What the map shows | Corpus field | Rule |
|---|---|---|
| A mark's position | `lat`, `lon` | Plan projection in metres, with a `cos(lat)` correction at 13°N. Not a survey; a placement. |
| A mark's colour and shape | `verdict.status` | GO = disc, HOLD = square, NO-GO = disc with a notch. |
| A mark's tier | the locality's tier | Carried in the mark's data and used by the board's tier filter. |
| A route's thread | `route_cluster` and travel order | One faint thread per cluster, drawn through its stops in travel order. |
| A place's name | `name` | Laid out where it has room; never across another mark. |
| The readout panel | the locality record | Name, ward, cases a month, our-mix price, margin, saturation, travel to hub, verdict and the reason. |
| The four sliders' ranges | the corpus's own min and max | A slider can never reach past the data. |

**The projection is a module with a self-check.** `src/map/projection.mjs`
places Tambaram→Velachery at 12.54 km and the band across 15.86 km, and the
build refuses to draw the figure if those numbers move.

**The corridor split is taken from the data.** The places are sorted along the
east–west axis and the widest gap in that line is where the corridor ends.
There is one such gap, of twenty-three kilometres, and two localities sit
west of it. The caption counts them from the corpus rather than from a number
typed in by hand.

**Provenance.** The tier travels with the number it qualifies. The caption
states that the positions are placed from coordinates and are not a survey,
that the coastline and road spines are OpenStreetMap at the corpus's own
resolution, and that Zone A's household base is modelled (tier C) while Zone
B's is derived (tier B).

## 4. The one piece of new data

The map wants a coastline and four road spines. The committed OSM extracts
carry road **centres** only, so the coastline and the road polylines were
fetched once and committed, in `research/map-geometry/osm-coast-and-spines.json`,
with the query, the timestamp and the ODbL attribution beside it.

## 5. The world

The site is "The Sign Band": one saturated yellow reserved for wayfinding,
black type on white over a warm paper ground, hairline rules only, no shadows,
no cards, no second accent.

| Role | Token | Use |
|---|---|---|
| ground / paper | `--map-paper` | the sheet and the card |
| structure | `--map-ink-2` | the frame, the readout's rules |
| quiet ink | `--map-ink-3` | labels, the caption, the slider labels |
| GO | `--map-go` | a place worth a round |
| HOLD | `--map-hold` | one test fails |
| NO-GO | `--map-nogo` | not worth a stop |
| selection | `--map-signal` | the selected place's ring, and nothing else |
| the fifteen routes | `--map-ink-2` at low opacity | faint threads until a route is asked for |

**Exactly one accent.** The yellow marks the current selection. It is not used
for verdicts, not for zones, not for price. No gradients, no shadows, no radius
above 2px. The coastline and the road spines carry `vector-effect:
non-scaling-stroke`, so they stay one rule wide at every zoom.

## 6. Interaction

1. **Hover a place.** It lifts, a callout follows it, the readout reads its
   numbers, and its route brightens.
2. **Click a place.** It stays selected and the URL carries it.
3. **The four sliders.** Cases, price, margin and saturation, each travelling
   across the range the data occupies. The count follows.
4. **Zoom and pan.** Wheel, drag, `+`, `−`, `fit` for the corridor and `all`
   for the whole corpus. Zooming separates the merged marks.
5. **The board.** The zone, verdict and tier filters dim what does not match.
   The corridor buttons drive the zone filter.
6. **Keyboard.** Every visible place is focusable. Arrow keys walk the route
   the focused place sits on. Enter selects.
7. **Deep link.** `?place=A05` selects and centres on load.
8. **Reduced motion.** The lift becomes instant.

## 7. The frame, and how it merges

Where it sits: `src/pages/zones.astro`, directly under the two corridor
buttons and above the FlowDiagram.

- the **zone buttons** drive the same filter as the board's zone select;
- the **decision board** cross-filters the sheet;
- the **print twin** (`/zones-print/`) runs the same client layer, so the
  names and the scale bar are laid out at the printed size — the only size
  that matters on paper.

## 8. Build order

| Phase | What |
|---|---|
| 1 | The projection and its self-check. |
| 2 | The OSM coastline and road spines, fetched and committed. |
| 3 | The corpus binding: a hundred places into the fields the map draws. |
| 4 | The geometry module, the figure script, the styles and the client layer. |
| 5 | The live layer: lift, select, zoom, cluster, filter, keyboard, deep link. |
| 6 | The print twin, and the merge into the dossier and its print route. |
| 7 | Verification (§9) and the fixes. |

## 9. Verification

`node scripts/verify-figure.mjs` opens the built `/zones/` page and proves,
in twelve checks, that all hundred places carry their own corpus record, that
sampled places land on the projection, that the sheet is painted in the right
verdict colours, that a selected place's readout reads the corpus's own
numbers back, that the four sliders filter the sheet and the count follows,
that the merged clusters count their places and come apart on zoom, that not
one name lies across a mark, a cluster or another name in either the opening
frame or a zoomed one, that the board filters the sheet and empties it, that
the keyboard reaches a place and moves along its route, that a deep link
selects on load and selection writes the URL, that nothing logs an error, and
that on a phone the map fits and a tap on a place raises its readout.

`node scripts/verify-interactions.mjs` walks the rest of the dossier: the
board's filters, the corridor buttons, the focus order and the link between
the two documents.

## 10. Definition of done

A reader opens the dossier on a phone, sees a hundred places along two
corridors, touches one and reads its numbers, drags a slider and watches the
sheet thin out to the places worth a round, zooms in until the cluster
separates, and closes it knowing which corridor to open first and why.
Nothing in the figure is a picture of that. All of it is the thing.
