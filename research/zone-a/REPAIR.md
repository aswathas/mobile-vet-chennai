# Repair pass for Zone A — the verdict rule and the missing documents

The first pass produced a sound dataset. Do not rebuild it. Three things need
fixing.

## What is already working. Do not rebuild it.

- The household model. Fifty localities, 271,686 households, no zeros, built on
  a modelled built-up footprint with archetype densities and a stated
  reconciliation to the Chennai Municipal Corporation density.
- The case model. Case rates per species, reconciled against 4.0 veterinary
  contacts per pet household a year, which keeps the city frame consistent with
  the 68,736 active licences.
- The identities, coordinates, wards, pin codes, route clusters, travel times,
  competitor names and prices, the hour curves, the weekday split and the
  seasonality index.

## Defect 1. The verdict rule ignores the Rs 1,100 floor

The market report this dossier sits beside is unambiguous. A blended price
under Rs 1,100 does not carry a visit in Chennai, and a practice that prices
there loses about Rs 250 on every visit. A locality that cannot clear that
floor cannot be a GO, however good the demand is or however thin the
competition.

The current rule lets that happen. Alandur, Thoraipakkam and other localities
are marked GO on blended prices of Rs 934, Rs 956 and Rs 1,099, all under the
floor.

### The fix

Replace the verdict rule with an explicit one that reads the same way in every
row:

- **GO** when all four hold: our-mix blended price is at or above Rs 1,100;
  margin over the Rs 850 clustered cost is at least Rs 250; cases a month are
  at least 40; and the competition saturation index is below 70.
- **HOLD** when cases a month are at least 15 but one of the four fails.
- **NO-GO** when cases a month are below 15, or when the margin is below
  Rs 100.

Rank by our-mix monthly revenue potential, highest first. Rank 1 is the biggest
prize, not the best composite score.

Every reason string must state cases a month, households, the blended price,
the margin over the Rs 850 cost, the saturation index and the number of named
operators. A locality below the floor must say so in its reason string.

## Defect 2. The zone summary carries the old verdicts

`zone_summary.top_go_localities` and `zone_summary.avoid_localities` must be
regenerated from the corrected verdicts, and the reason strings inside them must
match the rows they describe. The summary currently names localities that will
no longer be GO.

## Defect 3. Three documents were never written

Write all three.

- **`SOURCES.md`** — every source with its full URL and what it was used for:
  the census dataset, the GCC street ledger and press releases, the property-tax
  ledger, OSM, the operator price pages, and the spine report. Mark which
  figures in `localities.json` each source anchors.
- **`MODEL.md`** — the model in full: every formula, every parameter with its
  tier, the built-footprint densities and the archetype method, the case rates
  per species, the licence reconciliation, the price ladder, the affluence
  modifier, the seasonality index, the hour curve, the weekday split, the cost
  base, the serviceable ceiling, and the limitations. State plainly which
  numbers would not survive a challenge and which would.
- **`ANALYSIS.md`** — the zone narrative: where the demand actually sits, the
  strongest localities and why, the weakest and why, the route clusters, the
  hour and weekday shape, the seasonality, the competitive picture, and what
  would change the verdict. Numbers, not adjectives.

## One arithmetic check to close

The population basis string says the archetype density is 1,450 households per
square kilometre, and also says the fifty localities give about 272 thousand
households over 100.7 square kilometres. Those two figures do not agree with
each other: 272,000 households over 100.7 square kilometres is about 2,700 per
square kilometre.

State the arithmetic that reconciles them in `MODEL.md`. If the density figure
and the zone total disagree, correct whichever one is wrong so that the two
agree, and say which one moved and by how much.

## Order of work

1. Fix the verdict rule and the summary in the build script.
2. Re-run it and regenerate `localities.json`.
3. Check the arithmetic above and close it.
4. Write `SOURCES.md`, `MODEL.md` and `ANALYSIS.md`.
5. Leave `tools/` in place.

## Output

In the final message report: the zone household total, the cases a month total,
the GO, HOLD and NO-GO counts, the top five localities by our-mix monthly
revenue with their figures, the number of localities that fall below the
Rs 1,100 floor, and how the density arithmetic was closed.
