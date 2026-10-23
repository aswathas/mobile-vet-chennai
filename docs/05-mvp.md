# MVP scope

The deliverable is two documents on one static site, plus the corpus that
produced them. Here is what it does, and here is what it deliberately does not
do.

## What it does

**One hundred scored localities across two corridors.** Fifty in the
south-east cluster, fifty in the OMR and ECR corridor. Each with a ward, a
household count, a pet base split into licensed and unlicensed, a demand curve
by hour of day, a demand split by day of the week, a demand curve by month, a
price band, a revenue figure, a competition figure and a verdict.

**One verdict, in a sentence.** Open the first route in Zone A on the Velachery
cluster, and hold the Thiruvanmiyur cluster for the third route.

**A route plan with an order.** Fifteen route clusters, the first three named
and costed, and the OMR spine ruled out with a reason.

**A decision board the reader can use.** Fifteen gates, filters for corridor,
verdict and provenance tier, and an arrow that repaints onto the first gate
that still stands when a filter changes.

**A margin column.** Units, the provenance legend and how to read a gate,
beside the reading column on a wide screen.

**Three diagrams.** The chain from a street to a route, the two corridors as
lines of gates, and the hour curve with its peak hour marked.

**Both documents as PDFs.** The market report at twenty-one pages, the dossier
at thirty-odd, printed through headless Chrome from the same source as the site
so they cannot drift.

**A truth audit.** Forty-seven claims the dossier prose makes, checked against
the dataset by a script that fails when a number moves.

## What it deliberately does not do

**No bookings, no accounts, no server.** Static output only. A house-call
practice needs a record system, and the market report says so; the record
system is a different product from a market study, and building it here would
have meant inventing claims about a practice that does not exist yet.

**No live traffic or pricing feeds.** Every figure is a model or a sourced
observation at a point in time. A feed would make the page look fresher and
less true.

**No per-locality competitor map on the page.** The competitor data is in the
corpus and in the model notes, but six hundred competitor rows across a hundred
localities is a database, not a page. The board carries the count and the
saturation index; the names live in the research files.

**No forecast.** The corpus models demand and the route that could reach it.
Projecting a market three years out from a tier C household base in half the
corridor would be arithmetic in the wrong direction.

**No public publication of the dossier.** It is marked internal and it is not
indexed. The market report is the document that can be shown to a partner; the
dossier is the working document behind it.

**No mobile-native route optimisation.** The route map draws the fifteen
clusters as the model orders them. It is a diagram of the plan, not a
dispatcher.

## What is out of scope for the next iteration

Live booking integration, a practitioner-facing record system, and the
Coimbatore corridor, which the market report already ruled out on cost.
