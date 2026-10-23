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

**Both PDFs render.** The market report at 703 kB, the dossier at 1,581 kB.
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
