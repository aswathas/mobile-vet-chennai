# The options considered

Several choices shaped this work. Each one below was a live question with more
than one defensible answer, and each was settled by something other than
preference.

## How to research a hundred localities

**One pass across the whole city.** One agent, one schema, one calibration.
Rejected: the city has two corridors with different geometry, different
competition and different price bands, and a single pass tends to average them.
It also puts every failure into one run instead of two, and the two runs are
independent enough to cross-check each other.

**Two passes, one per corridor, then reconcile.** Chosen. Each pass collected
its own census, property-tax, street-inventory, operator-price and mapping
evidence and wrote its own model note. They disagreed, and the disagreement is
recorded in `03-decision.md` and in `attempts/001`.

**Hand-built spreadsheet from directories.** Rejected: it would have produced
numbers with no provenance and no way to re-run them. A figure a reader cannot
trace back to a page is a figure they have to believe.

## What to do with the two passes' disagreement

**Take the average.** Rejected on sight: it hides which model was wrong.

**Publish both.** Rejected: a reader cannot act on two numbers.

**Put both on one city-level calibration and say what moved.** Chosen. The
Greater Chennai Corporation's own vaccination campaign figures, its property-tax
ledger and the 2011 Census give a city-wide base. Both passes were re-expressed
against that base, and the corrections are written into the report rather than
buried in a build script.

## What to measure price against

**What each locality's own demand would fetch.** This is the first attempt and
it was wrong: a locality that cannot fill a route on its own gets a diluted
price, so the answer becomes a statement about locality size rather than about
the market. It also made one corridor look six times bigger than the other.

**What the route the locality rides actually earns.** Chosen. The market
report's own economics are route-level — four billable services per trip, six
visits a day — so the price has to be measured at the route too.

**What the operator's published price list says.** Kept as a separate thing:
it is what the reader can check on the page, and it is why the key figure panel
carries all eight published Chennai prices with their source ids.

## Where the dossier lives

**Append the dossier to the market report.** Rejected. The market report is a
finished investor-facing artefact with a fixed word count and eighty-three
sources; an internal working document with a hundred-row appendix does not
belong inside it, and the reader who wants the decision should not have to
scroll past a hundred localities to reach it.

**A separate site.** Rejected: two design systems, two PDF pipelines, two
things to keep in step, for two documents that answer one question.

**A second route on the same site, its own document and its own PDF.**
Chosen. One Astro project, one source of truth per document, one design system,
two URLs. The dossier is marked internal and is not indexed.

## What the site should look like

**Keep the cutting-bench world.** It was strong, it was specific, and it had
already shipped. Rejected as a final answer because the corpus outgrew it: a
hundred localities, fifteen route clusters and six hundred competitor rows
cannot live inside punched white windows, and the frame was built for ten
tables and eighty-three sources.

**A data showcase with charts everywhere.** Rejected on the user's own
instruction — people do not read charts; they read sentences with numbers in
them. Charts became the supporting cast, not the argument.

**The sign band.** Chosen, after three rounds of direction exploration that
burned eight other candidate worlds. An airport sign system states a
destination, a distance and a time without softening any of them, which is
exactly what this report has to do.

## Where the user's attention goes

**Both corridors in one document, ranked together.** Rejected: it invites a
comparison the reader cannot make cleanly, because the two corridors have
different household counts and different price bands.

**One corridor at a time, each with its own entry point.** Chosen. Two large
corridor buttons open each side directly, and the decision board in the middle
lets the reader compare gates without leaving the page.
