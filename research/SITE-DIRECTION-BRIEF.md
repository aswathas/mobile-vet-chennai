# Site direction brief — a data showcase and analysis site

## What the product is now

The project was a single market-assessment report for a mobile veterinary
practice in Chennai, published as a static Astro site and a PDF twin. It is
becoming something else: a **data showcase and analysis site** built on a
research corpus that now runs to 100 scored localities, two zones, roughly 200
named competitors, an hour-of-day demand curve per locality, a weekday split, a
12-month seasonality index, a price ladder, a licence pool, and a route-cluster
model. Every figure carries a provenance tier (A sourced, B derived, C
modelled).

Read the product truth in `PRODUCT.md`. Read the current visual world in
`.impeccable/brief-body.md` and the tokens in `src/styles/tokens.css`.

## Who the reader is

1. The veterinary founding team, deciding where to place a house-call
   veterinary service in south Chennai. They need the answer and the number
   that decides it, and they will argue about it in a room.
2. An internal R&D team slicing the locality data for route design.
3. Investors and partners checking that the numbers are sourced rather than
   asserted.

They arrive on a phone as often as a laptop, usually alone, from a chat link.

## What the site must now do

- Carry a serious data surface: charts, ranked tables, filters, a hundred-row
  appendix that must stay legible and scannable.
- Stay a document: verdict first, then the argument, then the evidence, with
  sources visible and attributable.
- Never launder a caveat. Tier marks and the caveats stay attached to the
  numbers they qualify.

## Mode

**Read.** The reader came to understand something. The world owns the frame
(masthead, rail, ground, section openers, the way tables and figures are set);
the reading column stays calm at 60 to 75 characters, body near 16px. A
monospace is for parameters, numerals and small labels, never for running text.
The world's signature move is one system used where it earns its place, never a
frame repeated around every element.

## The incumbent world

"Cutting Bench Select Rail": true black ground, flag orange, one condensed
grotesk, a perforated film rail crossing every sheet, sources hung below as
trims on pins. It is a strong, coherent world and it is the incumbent. A
replacement must beat it on audience identification and product clarity, and
must not be the category default for a data site.

## The seven grounded candidates, ordered by resonance

Index 6 is the assigned direction. The roll is the roll; do not reorder to
flatter a favourite.

1. **The Greater Chennai Corporation ward office and its property-tax ledger.**
   Municipal paper world: numbered receipts, a rubber stamp, a sealed register,
   ward boundary sketches on tracing paper, form fields in English and Tamil,
   a supervisor's signature line. Resonance: the dataset is ward-level and
   municipal, and its provenance is a public ledger. Risk: can turn bureaucratic
   rather than analytical, and the reader's question is commercial, not civic.

2. **The statistical handbook and census atlas.** Ruled tables, running heads,
   a footnote apparatus, notes beneath the table, a source list in the back
   matter, unit conventions stated once and never repeated. Resonance: the
   dossier is a hundred rows of tiered numbers with a method note. Risk: this is
   close to what the category ships.

3. **Chennai's flood and cyclone ward atlas.** The city already has this
   cartographic idiom: ward-level hazard sheets, contour bands, water-level
   stations, hazard gradients, a printed legend. Resonance: it is the city's
   own way of drawing itself as ward-level numbers, and this site does exactly
   that for a different variable. Risk: hazard vocabulary could make a market
   read as a threat, and a wrong flood map would be a factual error.

4. **The newsprint data desk.** A broadsheet data page: hairline rules, results
   tables, tiny tabular type, ward choropleths, footnote rules, a byline.
   Resonance: an Indian business daily is where this audience reads numbers.
   Risk: broadsheet-editorial hairline plus small tracked mono labels is a
   training-data default; the self-check must reject it if it lands there
   unprompted.

5. **The surveyor's field book and chain survey.** Measurement, pegs, plan
   sheets, blue ink, bearings and distances, a chain line crossing the page.
   Resonance: the route model is a distance-and-time problem across a real
   street network. Risk: it is an instrument, and on a reading surface an
   instrument comes back as a costume.

6. **The veterinary dispensary clinical record.** The subject's own world:
   a handwritten drug register, a dose chart on the wall, expiry stamps, a
   cold-chain log, a weight graph pinned by the door, the dispenser's copper
   name plate. Resonance: this is the trade the reader is entering, and the
   dossier is what a practice's own clinical record would look like if it were
   a market study. Risk: it is the subject's tool, so it can costume the page
   rather than frame it, and it may pull the site toward cute clinic branding
   that the data cannot afford.

7. **The Tamil cinema hoarding.** Offset litho street poster: huge crowded
   lettering, register clashes, halftone dot, a torn corner, colour blocked
   hard. Resonance: the city's own loudest vernacular, and the opposite pole
   to the incumbent's quiet bench. Risk: it cannot carry 100 rows of numbers,
   and the whole corpus is numbers.

## The roll's catalog challengers

Each supplies the form and its system grammar; the product supplies every fact.
Fuse each before judging it.

1. **Iridescent cloud edge.** White cloud ground, slate ink, a narrow fringe of
   mint, rose and violet, violet marking the active band. Quiet thin humanist
   sans, wide margins, colour only at hairline edges. Navigation moves between
   cloud body, droplet-size sample, angular colour band, observation moment,
   competing explanation. Controls: adjust droplet distribution, compare
   images, mark uncertainty, inspect absent, forming, vivid, dispersed states.
   Leverage: local image analysis, a diffraction model, shareable comparison
   states.
2. **Brick build-instruction book.** Sky-blue ground, black keyline, brick red
   for the new part, yellow for held inventory. Oversized step numerals, wordless
   arrows, a stud grid ruling every alignment. Numbered spreads, a parts
   inventory, 1:1 call-outs. Leverage: SVG exploded-step diagrams, grid locked
   to a stud module, pieces animated along arrows.
3. **Ikeda datamatics.** Pure black and pure white only, no grey, no colour.
   Pixel-crisp bars, hairline rules, monospace numerics, occasional full-frame
   inversion. One monospace at data density, barcode fields and sine curves
   structure the page. Navigation by data column, frequency band, frame index.
   Controls: scan, sample, invert. Leverage: canvas barcode and sine lattice
   from a seeded sequence, reduced-motion halts all strobing.
4. **Cutting bench select rail.** The incumbent, offered back as a challenger.
5. **Civic bureau prospectus, late-modern.** Bone-white ground, ink #1B1547,
   violet #6B5CE7, a teal-to-violet ribbon, six council seals in grey, one
   geometric grotesque in two weights. Sticky bar, bands split by hairlines.
   Leverage: a WebGL ribbon answering pointermove.
6. **Boxed software reference manual.** Milk acetate over a board of one
   section hue at full strength: oxide orange, chrome yellow, grass, teal,
   ultramarine, violet, sienna. One size does the work: Sabon 17/26 at a
   62-character measure, Univers heads in a margin column, machine voice in
   mono. A stepped tab rail down the fore edge, one tab per division, hue from
   the wheel; the current tab extends and is the board. Nothing eases or fades:
   every change is a 90ms two-frame step. Leverage: runtime leaf alpha solved
   by binary search against the board hue.

## What to produce

For each of the seven grounded candidates:

- **World** in one paragraph: the material, the ground and main colours, the
  type voices, the one signature that makes it recognisable.
- **First viewport** written as the document's shell: where the reader stands,
  the masthead or rail, the title and opening, the reading column, the way
  forward.
- **Signature interaction**: one move the world earns, used once.
- **Cross-surface reach**: what carries to a future route.
- **Honest risk**: the line that could make this wrong, named plainly.

Then:

- Fuse each of the six catalog challengers with the product, judge the fused
  result against the assigned direction on exactly two axes (audience
  identification, product clarity), and give each challenger a verdict:
  **wins**, **competitive**, or **declined**. Decide each verdict before
  considering any borrowing.
- For every declined challenger, name the one discipline of its system the
  assigned direction lacks, and raise the assigned direction to match. Write
  each raise as its own named line. A raise nobody can read did not happen.
- Recommend one direction, fully committed, with its raises visible.

Write the result to `research/SITE-DIRECTIONS.md` as clean Markdown, no code
fences around the whole document, no preamble.

## The bar

Do not pitch a mood. A direction is a complete visual system: palette and
material, type and composition, topology, controls and states, and responsive
adaptation, each specific enough that a builder could execute it without
guessing. No invented commercial claims: prices, counts and competitor names
must match the project's real data, which lives in `research/zone-a` and
`research/zone-b`.
