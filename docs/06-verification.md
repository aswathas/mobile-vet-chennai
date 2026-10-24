# Verification

What was actually measured, what passed, what failed, and what is still
untested. Failures are recorded with the same care as passes, because a
verification record that only lists green ticks is not a verification record.

## The dataset

**Schema validation.** Every locality in both zones is checked for a complete
key set before anything is rendered: identity, population, pet base, demand,
seasonality, weekday split, hour curve, prices, economics, competition, travel
and verdict. A missing key fails the build. It caught a Zone A pass that had
written an empty seasonality index for every month.

**Arithmetic audit.** Every locality's own arithmetic is checked: the weekday
split sums to one, the hour curve sums to one, the weekly figure and the
monthly figure agree, the revenue is consistent with the case count and the
price, the serviceable ceiling respects the 156-visit limit, and no locality is
a cluster while carrying more than twenty minutes between stops. Fifty-one
localities currently trip the last check, all of them in the OMR corridor,
where the research pass recorded a uniform twenty-one minutes between stops
for every cluster. That is a property of the source data, not of the build,
and it is disclosed in the dossier rather than smoothed away.

**The verdict rule is applied uniformly.** Go requires all four tests to pass:
price at or above Rs 1,100, margin over Rs 850 of at least Rs 250, at least
forty cases a month, and saturation under seventy. Hold is at least fifteen
cases a month with one test failing. No-go is fewer than fifteen cases a month
or a margin under Rs 100. The current split is eighty-two go, sixteen hold,
two no-go.

**The prose audit.** `scripts/check-prose.mjs` holds forty-seven numbers the
dossier prose states and recomputes each one from the dataset. All forty-seven
match. The audit caught four figures that had drifted when the calibration
changed the market revenue, and it catches the hour-ordering bug that put the
morning peak under the midnight label.

## The build

**Both documents build.** Four pages: the report, its print twin, the dossier
and its print twin. One Markdown source per document, one content build per
document, no number typed twice.

**Both PDFs render.** The market report at 703 kB, the dossier at 1,819 kB.
They are produced by printing the print routes through headless Chrome, so a
PDF that looks wrong is a print stylesheet that looks wrong.

**The print output was inspected, not assumed.** Twelve slices of the dossier
print route were captured and read. The first round found the masthead band
bleeding off the page, the section bands clipped at the left edge, and the
route ladder's labels printed over its own caption. All three were fixed.

## The design

**The project detector ran and returned nothing.** `impeccable detect --json`
on the changed targets returned an empty array after the final round of
changes.

**A finish reviewer read the built site twice.** The first round returned
fifteen material findings: an hour axis labelled ten hours out, one zone's
bars painted over the other's, the hub square buried under the first gate, a
money figure overflowing its panel, the verdict band stopping mid-sheet, an
empty price scale, yellow citation chips on every source id, tables clipping
mid-word on a phone, a dark colour scheme on a light document, unstyled
filter controls, a stamp the direction had refused, a duplicated font weight
that meant a 500-weight mono never existed, parameters set in the wrong face, a
promised margin column that did not exist, and a perspective tilt that fought
the world's own rule.

The second round returned four more: gate names clipped to ellipsis by the
margin column taking their width, the published price list printed over the
scale's tick notes, a table column collapsing to one character per line on a
phone, and the five published prices carrying no service and no source id.

All nineteen were fixed. Two were contract questions rather than code
questions, and the contract was amended: the one permitted three-dimensional
move is now named, and the margin column is described as it was built.

**The screenshots were checked, not just generated.** Desktop and mobile for
both documents, plus the print slices, read one by one.

## The Locality Map

The dossier's figure is a map: a hundred localities at their true coordinates,
coloured by the dossier's own verdict rule and shaped by it, the fifteen
routes drawn in travel order, and a live sheet that lifts a place under the
pointer, reads its numbers, and filters by cases, price, margin and
saturation. The plan it was built to is `research/MAP-FIGURE-BRIEF.md`.

**It replaced the Corridor Bench, and the reader said why.** The first figure
was an isometric drawing: a milled dispatch bench with a hundred machined stop
pins, fifteen brass link bars, a price token on a rail and a dial gauge. It was
built, audited, published and read, and it was rejected for two reasons that
are worth recording because both are about legibility rather than craft. The
words on the pins were too small to read, and the pins stood too close
together to press on a phone. The drawing was also a picture of the market
rather than the market: a flat plan shows the corpus's own distances, and the
house rule refuses a tilted ground plane in any case. The bench's geometry
audit, its line-end check and its eleven checks all passed. Passing every
check is not the same as being read.

**The projection self-check passes.** `src/map/projection.mjs` places
Tambaram→Velachery at 12.54 km and the corridor band across 15.86 km, and
`node scripts/build-map-figure.mjs` refuses to draw the figure if either
number moves.

**The corridor split is taken from the data.** The places are sorted along the
east-west axis and the widest gap in that line is where the corridor ends.
There is one such gap, of twenty-three kilometres, and two localities sit west
of it: Parandur and Valathur. An earlier version cut the band at a longitude
typed in by hand, which put Mangadu Industrial Estate and Perungalathur on
the wrong side of it even though they sit within a kilometre of the
corridor. The rule is now in the corpus, and the caption's counts are written
from it.

**Twelve checks drive the built page.** `node scripts/verify-figure.mjs` opens
the built `/zones/` page and proves that all hundred places carry their own
corpus record, that twelve sampled places land exactly on the projection, that
the sheet is painted in the right verdict colours with the coastline and the
routes drawn, that a selected place's readout reads the corpus's own numbers
back, that the four sliders filter the sheet and the count follows them, that
the merged clusters count their places and come apart on zoom, that not one
name lies across a mark, a cluster or another name in either the opening frame
or a zoomed one, that the decision board filters the sheet and empties it
correctly, that the keyboard reaches a place and moves along its route, that a
deep link selects on load and selection writes the URL, that nothing logs an
error, and that on a phone the map fits and a tap on a place raises its
readout. All twelve pass.

**The interaction path is clean.** `node scripts/verify-interactions.mjs`
walks the board's filters, the corridor buttons, a press on a place, the
sliders, the keyboard and the deep link, then the two documents' link both
ways. It passes with no console error.

**What failed, and what was done about it.**

The first of these was found by the reader and the rest by the checks, and
they are recorded in the order they were found.

*The board never reached the map.* The decision board is printed further down
the page than the figure, so the client looked for it with
`document.getElementById('board')` before the board was in the document, found
nothing, and wired up no listener at all. The board's zone filter moved the
board's gates and left the sheet untouched: fifty Zone B places stayed at full
contrast under a Zone A filter, and a filter that matched nothing left a
hundred places lit. The board is now looked up when it is needed rather than
cached at load, and the map listens on the document itself, because a change
on a filter and a click on a gate both bubble up.

*The corridor buttons did not reach the map either, for a second reason.* The
zone buttons set the board's zone select and dispatched a `change` event that
did not bubble, so the map never heard it even once the board was found. The
event now bubbles.

*The sliders had dead travel.* The price slider started at Rs 900 and the
margin slider at zero, but the cheapest place in the corpus is at Rs 1,295 and
the smallest margin is Rs 445. The bottom half of each slider did nothing.
Every slider now travels across the range the data occupies.

*The opening frame cut places off.* The first frame was fitted to *cover* the
corridor, which is right on a wide panel and wrong on a tall one: on a phone
the fit cropped the top and the bottom of the band, and six places sat half
off the edge of the sheet, two of them invisible. The corridor is now fitted
to contain, and only the two localities that genuinely stand apart are out of
frame — which is what the caption says.

*The names collided.* The labels were placed at build time, ranked by revenue,
which meant the set was fixed the moment the reader zoomed and only three of
the sixteen names were ever drawn. Every place now carries a name, and the
client lays them out in the frame the reader is actually looking at: each name
takes the first of four positions beside its mark that is clear of every other
mark, every other name, the zoom control and the scale bar, and the biggest
names are placed first. The widths are measured with the font rather than
estimated by character count, because a name measured by characters is either
too long, so that names nearly touch, or too short, so that a name crosses a
mark it was told to clear. The check that holds this honest measures two
frames — the one the reader opens on and a zoomed one where the places have
come apart — because a layout that only works in one of them is a layout that
will fail for someone.

*A mixed cluster was a black blob.* A cluster whose places do not all carry
the same verdict was drawn as a solid black disc, which was the loudest thing
on the paper and said nothing: a mixed cluster says only that places are
there. It is now drawn as an open ring, and a name that would lie across a
cluster's count is dropped.

*The print twin carried no names and a wrong scale bar.* The printed sheet
had a scale bar that said "1 km" and meant nothing, because the bar's length
is set by the client at run time, and not one place was named on it. The
print twin now runs the same client layer, so its names and its scale bar are
laid out at the printed size — the only size that matters on paper — and its
hint and legend say what a reader of paper can actually do.

**What is still untested.** Inside the dense corridor the marks are a few
pixels wide on a phone and their neighbours overlap, so the sheet cannot carry
a finger to a named locality there; the appendix table is the phone's precise
instrument. The frame opens on the corridor, so the two western localities are
reached by zooming out rather than by looking. And the sheet's geography is
OpenStreetMap at the corpus's own resolution, not a survey.

## What failed and what was done about it

**The Zone B household model was three orders of magnitude out.** It computed
a household figure from street-token counts and never used the ward totals it
had already calculated, giving 5,567 households for a corridor that holds
hundreds of thousands. Caught by the arithmetic audit, repaired at source by
re-allocating from the census-derived ward pool, and re-verified against four
sanity bands.

**The two passes used different units for demand.** Not a bug in either pass;
a bug in comparing them. It made the OMR corridor look six times larger than
the south-east cluster and would have sent the founding team to the wrong
corridor. Caught when the merged totals refused to reconcile with the
Corporation's own licence count, fixed by putting both on one city-level
calibration.

**The hour curve was drawn in the wrong order.** JavaScript orders an object's
canonical numeric keys first, so the aggregate's hour map arrived as 10, 11,
... 23, 00, ... 09, and the chart drew the 10:00 morning peak under the
midnight label while the axis said otherwise. Caught by the finish reviewer
reading the rendered chart against the prose.

**The dossier route was neutralised by a review agent** that judged the
scaffolding off-script and its data unresearched. The route was restored after
the corpus became real research, and the neutralising note was replaced with
an accurate one.


## The polish pass

A final pass drove the site rather than reading it.

**The interaction path was walked.** `scripts/verify-interactions.mjs` opens the dossier, reads the board's initial state, filters to Zone B and checks the arrow moves to a Zone B gate, filters to a combination that matches nothing and checks the empty state appears, clears the filters and checks all fifteen gates come back, clicks the Zone B corridor button and checks the heading lands below the gantry, reads the focus order, then walks the report to the dossier and the dossier back to the report. It also fails on any console error. It passes.

**The palette was measured against itself.** Every ink on white clears 4.5:1 and every ink on the yellow clears 3:1, with one exception found and fixed: the source ids under the price scale were set in the lightest ink at 3.62:1 and are now in the mid ink at 5.38:1.

**The detector ran once over the changed targets** and returned an empty array.

**The type scale was pulled into a ladder.** The detector read the design record's
ramp and found thirty-seven literal font sizes sitting off it. Nine near-twins
were snapped onto their neighbours, the ramp was written out in full as a
fourteen-role ladder in the design record's frontmatter, and the sidecar was
brought into step. The detector now returns zero findings on the changed
targets.

**Dead rules were removed.** The rail's table rules went when the provenance legend became a list, and the one permitted three-dimensional move was named in the contract rather than left as an accident.

**The faces are preloaded.** The hash jump on the corridor buttons used to land on a page that reflowed when the display face swapped in. The face is now preloaded, so the jump lands where it was aimed.

## What is still untested

**Willingness to pay.** Nothing here proves an owner will pay Rs 1,199 for an
extended consultation. That is the number the pilot has to produce.

**The travel-time model.** The OMR corridor's inter-stop time is a uniform
twenty-one minutes in the source data, which is not a measured figure and
carries no band.

**Whether a cluster can actually be walked in one route.** The clusters come
from the research passes' own geography. Whether four to eight stops inside
fifteen minutes of each other hold on a Tuesday in June is a field question.

**Half the corpus's household base is modelled.** Zone A's fifty localities
carry tier C quantities. The ranking between them is robust; the absolute
level is not.

**The competitors' current prices.** The eight published prices are point-in-time
observations from pages that were loaded. Operators change them.
